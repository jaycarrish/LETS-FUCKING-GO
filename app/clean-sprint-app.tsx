"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completedTaskCount,
  phaseIsDone,
  taskCount,
  type CleanSprintBoard,
  type Person,
} from "./clean-sprint-types";

type PersonalMission = {
  id: string;
  title: string;
  detail: string;
  leverage: number;
  status: "ready" | "active" | "done";
};

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
    detail: "Define what ‘done’ looks like in one sentence.",
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
  if (board.status === "paused") return "Paused — your work is saved.";
  if (board.status === "complete") return "House reset reported complete.";
  const phase = board.phases.find((item) => item.id === board.activePhaseId);
  return phase ? `Now: ${phase.title}` : "Keep the reset moving.";
}

function sprintCopy(board: CleanSprintBoard) {
  if (board.status === "idle") return "One shared 75-minute run. Start clean, finish usable, and don’t make mystery piles.";
  if (board.status === "paused") return board.lastAction;
  if (board.status === "complete") return "Every done button is a self-report from the household — not a Bob verification.";
  return board.lastAction;
}

function isWin(board: CleanSprintBoard, phaseId: string) {
  return Boolean(board.phases.find((item) => item.id === phaseId && phaseIsDone(item)));
}

export function CleanSprintApp() {
  const [board, setBoard] = useState<CleanSprintBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [person, setPerson] = useState<Person>(() => loadStored<Person>(PERSON_KEY, "Shared"));
  const [tab, setTab] = useState<"sprint" | "lfg">("sprint");
  const [toast, setToast] = useState<string | null>(null);
  const [missions, setMissions] = useState<PersonalMission[]>(() => loadStored<PersonalMission[]>(PERSONAL_KEY, DEFAULT_MISSIONS));

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/clean-sprint", { cache: "no-store" });
      const payload = (await response.json()) as { board?: CleanSprintBoard; error?: string };
      if (!response.ok || !payload.board) throw new Error(payload.error || "Could not load the shared board.");
      setBoard(payload.board);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load the shared board.");
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const poll = window.setInterval(() => void refresh(), 8_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(poll);
    };
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2_800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const elapsed = secondsElapsed(board, now);
  const completed = board ? completedTaskCount(board) : 0;
  const total = board ? taskCount(board) : 0;
  const tickets = completed;
  const activePhase = board?.phases.find((item) => item.id === board.activePhaseId);
  const ownerLabel = useMemo(() => person === "Shared" ? "both of you" : person, [person]);

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
      const payload = (await response.json()) as { board?: CleanSprintBoard; error?: string };
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

  if (tab === "lfg") {
    return (
      <main className="app-shell">
        <Header onTab={setTab} tab={tab} />
        <section className="card card-pad">
          <div className="label">Personal execution lane</div>
          <h2 style={{ marginTop: 5, fontSize: "1.4rem" }}>Your personal LFG missions</h2>
          <p className="subtitle">Clean Sprint stays live for the house; this lane keeps individual momentum moving too. It is saved only on this device.</p>
        </section>
        <section className="lfg-grid" style={{ marginTop: 16 }}>
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
        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Header onTab={setTab} tab={tab} />
      {error && <div className="error" role="alert">{error}</div>}
      {!board && !error && <div className="empty">Loading the shared Clean Sprint board…</div>}
      {board && <>
        <section className="status-strip" aria-live="polite">
          <div>
            <div className="status-heading">
              <span className={`pill ${board.status === "paused" ? "paused" : board.status === "complete" ? "complete" : ""}`}>{board.status === "complete" ? "reported complete" : board.status}</span>
              <h2 className="status-title">{sprintHeading(board)}</h2>
            </div>
            <p className="status-copy">{sprintCopy(board)}</p>
          </div>
          <div className="timer"><strong>{clock(elapsed)}</strong><span>of 75:00</span></div>
        </section>
        <div className="control-row">
          {board.status === "idle" && <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "start", owner: person }, `Run started for ${ownerLabel}.`) }>START THE 75-MIN SPRINT</button>}
          {board.status === "running" && <button className="button warning" disabled={busy} type="button" onClick={() => void act({ action: "pause" }, "Sprint paused. Nothing is lost.")}>PAUSE</button>}
          {board.status === "paused" && <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "resume", owner: person }, "Sprint resumed.")}>RESUME</button>}
          {board.status === "complete" && <button className="button primary" disabled={busy} type="button" onClick={() => void act({ action: "restart" }, "Fresh board ready. Let’s go again.")}>START A NEW RUN</button>}
          <button className="button subtle" disabled={busy} type="button" onClick={() => void refresh()}>REFRESH</button>
          <div className="identity" aria-label="Who is updating the board?">
            <span>I am</span>
            {(["Jay", "Zara", "Shared"] as Person[]).map((option) => <button className={person === option ? "selected" : ""} key={option} type="button" onClick={() => pickPerson(option)}>{option}</button>)}
          </div>
        </div>
        <section className="grid">
          <section className="card">
            <div className="card-header"><h2>Shared 75-minute run</h2><span className="label">{completed}/{total} reported</span></div>
            <div className="phase-list">
              {board.phases.map((phase, index) => {
                const done = phaseIsDone(phase);
                const active = phase.id === board.activePhaseId && !done;
                return <article className={`phase ${active ? "active" : ""} ${done ? "done" : ""}`} key={phase.id}>
                  <div className="phase-head">
                    <div className="phase-number">{done ? "✓" : index + 1}</div>
                    <div className="phase-title"><strong>{phase.title}</strong><small>{phase.goal}</small></div>
                    <span className="phase-time">{phase.minutes}</span>
                  </div>
                  <div className="tasks">
                    {phase.tasks.map((task) => <div className={`task ${task.status === "done" ? "done" : ""}`} key={task.id}>
                      <div className="task-copy"><strong>{task.title}</strong><span>{task.detail}</span></div>
                      {task.status === "done" ? <span className="done-meta">{task.completedBy ?? "Shared"} ✓</span> : <button className="done-button" disabled={busy || board.status !== "running"} type="button" onClick={() => void act({ action: "complete-task", taskId: task.id, owner: person }, `${task.title}: reported done.`)}>DONE</button>}
                    </div>)}
                  </div>
                </article>;
              })}
            </div>
          </section>
          <aside className="card">
            <div className="card-header"><h2>LFG score</h2><span className="label">Shared run</span></div>
            <div className="score-board">
              <div className="stat"><b>{tickets}</b><span>tickets</span></div>
              <div className="stat"><b>{board.runId || "—"}</b><span>run</span></div>
              <div className="stat"><b>{activePhase ? `${board.phases.findIndex((phase) => phase.id === activePhase.id) + 1}/6` : "6/6"}</b><span>phase</span></div>
              <div className="stat"><b>{board.history.length}</b><span>past runs</span></div>
            </div>
            <div className="card-header"><h3>Visible wins</h3><span className="label">aim for usable</span></div>
            <div className="wins">
              <Win done={isWin(board, "path")} label="Clear main path" />
              <Win done={isWin(board, "kitchen")} label="Usable kitchen" />
              <Win done={isWin(board, "bathroom")} label="Ready bathroom" />
              <Win done={isWin(board, "laundry")} label="Laundry loop moving" />
              <Win done={isWin(board, "living-room")} label="Usable living room" />
            </div>
            <p className="fine-print">“Done” is a household self-report, recorded instantly for both phones. It is not a Bob approval or a jcOS status change.</p>
          </aside>
        </section>
      </>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function Header({ tab, onTab }: { tab: "sprint" | "lfg"; onTab: (tab: "sprint" | "lfg") => void }) {
  return <>
    <header className="site-header">
      <div><div className="kicker">LFG × Clean Sprint</div><h1>LET’S<br />FUCKING GO.</h1><p className="subtitle">A shared house reset for Jay + Zara — with the original LFG lane still right here.</p></div>
      <div className="house-rule">HOUSE RULE<br />Every item gets one permanent home. Only one.</div>
    </header>
    <nav className="mode-tabs" aria-label="LFG mode">
      <button className={`mode-tab ${tab === "sprint" ? "active" : ""}`} type="button" onClick={() => onTab("sprint")}>CLEAN SPRINT</button>
      <button className={`mode-tab ${tab === "lfg" ? "active" : ""}`} type="button" onClick={() => onTab("lfg")}>PERSONAL LFG</button>
    </nav>
  </>;
}

function Win({ done, label }: { done: boolean; label: string }) {
  return <div className={`win ${done ? "done" : ""}`}><span className="dot" />{label}</div>;
}
