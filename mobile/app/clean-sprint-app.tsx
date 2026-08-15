"use client";

import { useEffect, useState } from "react";
import {
  availableTickets,
  branchUnlockCount,
  completedTaskCount,
  highestUnlockedRarity,
  phaseIsDone,
  REWARD_CARDS,
  REWARD_PACKS,
  SKILL_BRANCHES,
  taskCount,
  type CleanSprintBoard,
  type Person,
  type RewardCard,
} from "./clean-sprint-types";

type PersonalMission = {
  id: string;
  title: string;
  detail: string;
  leverage: number;
  status: "ready" | "active" | "done";
};

type BoardResponse = { board?: CleanSprintBoard; error?: string };
type TabId = "sprint" | "rewards" | "lfg";

const PERSONAL_KEY = "lets-fucking-go-v2-personal";
const PERSON_KEY = "lfg-clean-sprint-person";
const DEFAULT_MISSIONS: PersonalMission[] = [
  {
    id: "capture",
    title: "Capture one useful inspiration",
    detail: "Save the idea, reference, or possibility before it disappears.",
    leverage: 92,
    status: "ready",
  },
  {
    id: "outcome",
    title: "Write the concrete outcome",
    detail: "Define what done looks like in one sentence.",
    leverage: 88,
    status: "ready",
  },
  {
    id: "prototype",
    title: "Build the smallest working version",
    detail: "A real testable thing beats a perfect plan.",
    leverage: 96,
    status: "ready",
  },
];

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function secondsElapsed(board: CleanSprintBoard | null, now: number) {
  if (!board) return 0;
  if (board.status !== "running" || !board.startedAt) return board.elapsedSeconds;
  const started = Date.parse(board.startedAt);
  return board.elapsedSeconds + (Number.isNaN(started) ? 0 : Math.max(0, Math.floor((now - started) / 1000)));
}

function clock(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = (value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function sprintHeading(board: CleanSprintBoard) {
  if (board.status === "idle") return "Ready when you are.";
  if (board.status === "paused") return "Paused. Your work is saved.";
  if (board.status === "complete") return "House reset reported complete.";
  const phase = board.phases.find((item) => item.id === board.activePhaseId);
  return phase ? `Now: ${phase.title}` : "Keep the reset moving.";
}

function sprintCopy(board: CleanSprintBoard) {
  if (board.status === "idle") return "One shared 75-minute run. Start clean, finish usable, and do not make mystery piles.";
  if (board.status === "complete") return "Done buttons are self-reports from the household, not Bob verification.";
  return board.lastAction;
}

function isWin(board: CleanSprintBoard, phaseId: string) {
  return Boolean(board.phases.find((item) => item.id === phaseId && phaseIsDone(item)));
}

function statEntries(card: RewardCard) {
  return Object.entries(card.stats);
}

export function CleanSprintApp() {
  const [board, setBoard] = useState<CleanSprintBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [person, setPerson] = useState<Person>(() => loadStored<Person>(PERSON_KEY, "Shared"));
  const [tab, setTab] = useState<TabId>("sprint");
  const [toast, setToast] = useState<string | null>(null);
  const [missions, setMissions] = useState<PersonalMission[]>(() => loadStored<PersonalMission[]>(PERSONAL_KEY, DEFAULT_MISSIONS));
  const [flipped, setFlipped] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);

  async function refresh() {
    try {
      const response = await fetch("/api/clean-sprint", { cache: "no-store" });
      const payload = (await response.json()) as BoardResponse;
      if (!response.ok || !payload.board) throw new Error(payload.error || "Could not load the shared board.");
      setBoard(payload.board);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load the shared board.");
    }
  }

  useEffect(() => {
    void refresh();
    const poll = window.setInterval(() => void refresh(), 8_000);
    return () => window.clearInterval(poll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2_800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setFlipped(false);
  }, [board?.vault.currentCardId]);

  useEffect(() => {
    setPreviewCardId(board?.vault.currentCardId ?? null);
  }, [board?.vault.currentCardId]);

  const elapsed = secondsElapsed(board, now);
  const completed = board ? completedTaskCount(board) : 0;
  const total = board ? taskCount(board) : 0;
  const currentCard = REWARD_CARDS.find((card) => card.id === (previewCardId ?? board?.vault.currentCardId)) ?? REWARD_CARDS[0];
  const selectedPack = REWARD_PACKS.find((pack) => pack.id === board?.vault.selectedPackId) ?? REWARD_PACKS[0];
  const recentCards = board
    ? board.vault.recentCardIds
        .map((id) => REWARD_CARDS.find((card) => card.id === id))
        .filter((card): card is RewardCard => Boolean(card))
    : [];

  function pickPerson(next: Person) {
    setPerson(next);
    window.localStorage.setItem(PERSON_KEY, JSON.stringify(next));
  }

  function saveMissions(next: PersonalMission[]) {
    setMissions(next);
    window.localStorage.setItem(PERSONAL_KEY, JSON.stringify(next));
  }

  async function act(action: Record<string, unknown>, success: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/clean-sprint", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action),
      });
      const payload = (await response.json()) as BoardResponse;
      if (!response.ok || !payload.board) throw new Error(payload.error || "The update did not save.");
      setBoard(payload.board);
      setError(null);
      setToast(success);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The update did not save.");
    } finally {
      setBusy(false);
    }
  }

  function startPersonal(id: string) {
    saveMissions(missions.map((mission) => mission.id === id ? { ...mission, status: "active" } : mission));
  }

  function completePersonal(id: string) {
    saveMissions(missions.map((mission) => mission.id === id ? { ...mission, status: "done" } : mission));
    setToast("Personal LFG win recorded on this device.");
  }

  return (
    <main className="app-shell">
      <Header tab={tab} onTab={setTab} />
      {error && <div className="error" role="alert">{error}</div>}
      {!board && !error && <div className="empty">Loading the shared Clean Sprint board...</div>}
      {board && tab === "sprint" && (
        <>
          <section className="status-strip" aria-live="polite">
            <div>
              <div className="status-heading">
                <span className={`pill ${board.status === "paused" ? "paused" : board.status === "complete" ? "complete" : ""}`}>
                  {board.status === "complete" ? "reported complete" : board.status}
                </span>
                <h2 className="status-title">{sprintHeading(board)}</h2>
              </div>
              <p className="status-copy">{sprintCopy(board)}</p>
            </div>
            <div className="timer"><strong>{clock(elapsed)}</strong><span>of 75:00</span></div>
          </section>
          <div className="control-row">
            {board.status === "idle" && <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "start", owner: person }, "Shared sprint started.")}>START THE 75-MIN SPRINT</button>}
            {board.status === "running" && <button className="button warning" disabled={busy} type="button" onClick={() => void act({ action: "pause" }, "Sprint paused. Nothing is lost.")}>PAUSE</button>}
            {board.status === "paused" && <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "resume", owner: person }, "Sprint resumed.")}>RESUME</button>}
            {board.status === "complete" && <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "restart" }, "Fresh board ready.")}>START A NEW RUN</button>}
            <button className="button subtle" disabled={busy} type="button" onClick={() => void refresh()}>REFRESH</button>
            <div className="identity" aria-label="Who is updating the board?">
              <span>I am</span>
              {(["Jay", "Zara", "Shared"] as Person[]).map((option) => (
                <button className={person === option ? "selected" : ""} key={option} type="button" onClick={() => pickPerson(option)}>{option}</button>
              ))}
            </div>
          </div>
          <section className="grid">
            <section className="card">
              <div className="card-header"><h2>Shared 75-minute run</h2><span className="label">{completed}/{total} reported</span></div>
              <div className="phase-list">
                {board.phases.map((phase, index) => {
                  const done = phaseIsDone(phase);
                  const active = phase.id === board.activePhaseId && !done;
                  return (
                    <article className={`phase ${active ? "active" : ""} ${done ? "done" : ""}`} key={phase.id}>
                      <div className="phase-head">
                        <div className="phase-number">{done ? "✓" : index + 1}</div>
                        <div className="phase-title"><strong>{phase.title}</strong><small>{phase.goal}</small></div>
                        <span className="phase-time">{phase.minutes}</span>
                      </div>
                      <div className="tasks">
                        {phase.tasks.map((task) => (
                          <div className={`task ${task.status === "done" ? "done" : ""}`} key={task.id}>
                            <div className="task-copy"><strong>{task.title}</strong><span>{task.detail}</span></div>
                            {task.status === "done"
                              ? <span className="done-meta">{task.completedBy ?? "Shared"} ✓</span>
                              : <button className="done-button" disabled={busy || board.status !== "running"} type="button" onClick={() => void act({ action: "complete-task", taskId: task.id, owner: person }, `${task.title}: reported done.`)}>DONE</button>}
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
            <aside className="card">
              <div className="card-header"><h2>LFG score</h2><span className="label">Shared run</span></div>
              <div className="score-board">
                <div className="stat"><b>{availableTickets(board)}</b><span>available tickets</span></div>
                <div className="stat"><b>{board.vault.earnedTickets}</b><span>earned all-time</span></div>
                <div className="stat"><b>{board.runId || "—"}</b><span>run</span></div>
                <div className="stat"><b>{board.history.length}</b><span>past runs</span></div>
              </div>
              <div className="vault-cta-box">
                <button className="button primary" type="button" onClick={() => setTab("rewards")}>SPEND TICKETS</button>
                <button className="button subtle" type="button" onClick={() => { setTab("rewards"); setShowSkillTree(true); }}>OPEN SKILL TREE</button>
              </div>
              <div className="card-header"><h3>Visible wins</h3><span className="label">aim for usable</span></div>
              <div className="wins">
                <Win done={isWin(board, "path")} label="Clear main path" />
                <Win done={isWin(board, "kitchen")} label="Usable kitchen" />
                <Win done={isWin(board, "bathroom")} label="Ready bathroom" />
                <Win done={isWin(board, "laundry")} label="Laundry loop moving" />
                <Win done={isWin(board, "living-room")} label="Usable living room" />
              </div>
              <p className="fine-print">Done is a household self-report, recorded instantly for both phones. It is not a Bob approval or a jcOS status change.</p>
            </aside>
          </section>
        </>
      )}
      {board && tab === "rewards" && (
        <>
          <section className="reward-hero card">
            <div className="reward-copy">
              <div className="kicker">Shared reward vault</div>
              <h2>Spend the tickets you earn together.</h2>
              <p className="subtitle">The sprint builds the wallet. The vault spends it. The skill tree shows which branch energy you have been stacking.</p>
              <div className="hero-actions">
                <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "spend-pack", packId: selectedPack.id, owner: person }, `${selectedPack.name} opened.`)}>SPEND TICKETS</button>
                <button className="button subtle" type="button" onClick={() => setShowSkillTree((value) => !value)}>{showSkillTree ? "HIDE SKILL TREE" : "OPEN SKILL TREE"}</button>
              </div>
            </div>
            <div className="wallet-grid">
              <article className="wallet-panel">
                <span className="label">Wallet</span>
                <strong>{availableTickets(board)}</strong>
                <small>Tickets ready to spend now</small>
              </article>
              <article className="wallet-panel">
                <span className="label">Unlocked</span>
                <strong>{board.vault.unlockedCardIds.length}</strong>
                <small>Shared cards secured</small>
              </article>
              <article className="wallet-panel">
                <span className="label">Peak rarity</span>
                <strong>{highestUnlockedRarity(board)}</strong>
                <small>Highest tier in the shared vault</small>
              </article>
            </div>
          </section>
          <section className="reward-grid">
            <section className="card card-pad">
              <div className="card-header compact-head"><h2>Packs</h2><span className="label">choose your spend</span></div>
              <div className="pack-strip">
                {REWARD_PACKS.map((pack) => (
                  <button
                    className={`pack-button ${pack.id === selectedPack.id ? "active" : ""}`}
                    disabled={busy}
                    key={pack.id}
                    type="button"
                    onClick={() => void act({ action: "choose-pack", packId: pack.id }, `${pack.name} selected.`)}
                  >
                    <strong>{pack.name}</strong>
                    <span>{pack.cost} tickets</span>
                    <small>{pack.description}</small>
                  </button>
                ))}
              </div>
              <div className="reveal-shell">
                <button
                  aria-label="Flip reward card"
                  className={`vault-card ${flipped ? "flipped" : ""}`}
                  style={{ ["--vault-accent" as string]: currentCard.accent, ["--vault-glow" as string]: currentCard.glow }}
                  type="button"
                  onClick={() => setFlipped((value) => !value)}
                >
                  <div className="vault-card-face vault-card-front">
                    <div className="card-chip-row">
                      <span className="rarity-pill">{currentCard.rarity}</span>
                      <span className="branch-pill">{currentCard.branch}</span>
                    </div>
                    <div className="sigil">{currentCard.sigil}</div>
                    <h3>{currentCard.name}</h3>
                    <p>{currentCard.loreTitle}</p>
                    <div className="card-line">Tap to flip for lore, stats, and worth.</div>
                  </div>
                  <div className="vault-card-face vault-card-back">
                    <div className="card-chip-row">
                      <span className="rarity-pill">{currentCard.rarity}</span>
                      <span className="branch-pill">{currentCard.branch}</span>
                    </div>
                    <h3>{currentCard.name}</h3>
                    <p className="worth-line">{currentCard.worthLine}</p>
                    <p className="back-lore">{currentCard.lore}</p>
                  </div>
                </button>
                <div className="reveal-meta">
                  <article className="meta-card">
                    <span className="label">Worth it meter</span>
                    <h3>{currentCard.worthLine}</h3>
                  </article>
                  <article className="meta-card">
                    <span className="label">Selected pack</span>
                    <h3>{selectedPack.name} · {selectedPack.cost} tickets</h3>
                    <p>{selectedPack.description}</p>
                  </article>
                </div>
              </div>
            </section>
            <aside className="card card-pad">
              <div className="card-header compact-head"><h2>Recent pulls</h2><span className="label">shared unlocks</span></div>
              <div className="recent-pulls">
                {recentCards.length === 0 && <div className="recent-card empty-card"><strong>No fresh pulls yet</strong><small>Spend tickets to start stacking the vault.</small></div>}
                {recentCards.map((card) => (
                  <button className="recent-card" key={card.id} type="button" onClick={() => { setPreviewCardId(card.id); setFlipped(false); }}>
                    <strong>{card.name}</strong>
                    <small>{card.rarity} · {card.branch}</small>
                  </button>
                ))}
              </div>
              <div className="card-header compact-head"><h2>Lore file</h2><span className="label">current card</span></div>
              <p className="lore-body">{currentCard.lore}</p>
              <div className="scene-grid">
                <div><span className="label">Pose</span><p>{currentCard.pose}</p></div>
                <div><span className="label">Backdrop</span><p>{currentCard.backdrop}</p></div>
              </div>
              <div className="stats-grid">
                {statEntries(currentCard).map(([key, value]) => (
                  <article className="stat-card" key={key}>
                    <header><strong>{key}</strong><span>{value}</span></header>
                    <div className="stat-bar"><span style={{ width: `${value}%` }} /></div>
                  </article>
                ))}
              </div>
            </aside>
          </section>
          {showSkillTree && (
            <section className="card card-pad skill-tree-panel">
              <div className="card-header compact-head"><h2>Skill tree</h2><span className="label">branch momentum</span></div>
              <div className="skill-tree-grid">
                {SKILL_BRANCHES.map((branch) => {
                  const unlocked = branchUnlockCount(board, branch.branch);
                  return (
                    <article className="skill-branch" key={branch.id} style={{ ["--branch-accent" as string]: branch.accent }}>
                      <header>
                        <div><span className="label">{branch.icon}</span><h3>{branch.branch}</h3></div>
                        <strong>{unlocked}/{branch.totalCards}</strong>
                      </header>
                      <p>{branch.subtitle}</p>
                      <div className="skill-nodes">
                        {branch.nodes.map((node) => (
                          <div className={`skill-node ${unlocked >= node.threshold ? "unlocked" : ""}`} key={node.id}>
                            <strong>{node.name}</strong>
                            <small>{node.threshold} cards needed</small>
                            <p>{node.reward}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
      {board && tab === "lfg" && (
        <>
          <section className="card card-pad">
            <div className="label">Personal execution lane</div>
            <h2 className="section-title">Your personal LFG missions</h2>
            <p className="subtitle">Clean Sprint stays live for the house. This lane keeps individual momentum moving too. It is saved only on this device.</p>
          </section>
          <section className="lfg-grid">
            {missions.map((mission) => (
              <article className={`mission ${mission.status === "active" ? "active" : ""} ${mission.status === "done" ? "done" : ""}`} key={mission.id}>
                <div className="label">{mission.leverage} leverage</div>
                <strong>{mission.title}</strong>
                <p>{mission.detail}</p>
                <div className="mission-foot">
                  <span className="tag">{mission.status === "done" ? "done" : mission.status}</span>
                  {mission.status === "ready" && <button type="button" onClick={() => startPersonal(mission.id)}>START</button>}
                  {mission.status === "active" && <button className="complete" type="button" onClick={() => completePersonal(mission.id)}>DONE</button>}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function Header({ tab, onTab }: { tab: TabId; onTab: (tab: TabId) => void }) {
  return (
    <>
      <header className="site-header">
        <div>
          <div className="kicker">LFG × Clean Sprint</div>
          <h1>LET&apos;S<br />FUCKING GO.</h1>
          <p className="subtitle">Shared clean sprint. Shared ticket vault. Personal lane still intact.</p>
        </div>
        <div className="house-rule">HOUSE RULE<br />Every item gets one permanent home. Only one.</div>
      </header>
      <nav className="mode-tabs" aria-label="LFG mode">
        <button className={`mode-tab ${tab === "sprint" ? "active" : ""}`} type="button" onClick={() => onTab("sprint")}>CLEAN SPRINT</button>
        <button className={`mode-tab ${tab === "rewards" ? "active" : ""}`} type="button" onClick={() => onTab("rewards")}>REWARDS VAULT</button>
        <button className={`mode-tab ${tab === "lfg" ? "active" : ""}`} type="button" onClick={() => onTab("lfg")}>PERSONAL LFG</button>
      </nav>
    </>
  );
}

function Win({ done, label }: { done: boolean; label: string }) {
  return <div className={`win ${done ? "done" : ""}`}><span className="dot" />{label}</div>;
}
