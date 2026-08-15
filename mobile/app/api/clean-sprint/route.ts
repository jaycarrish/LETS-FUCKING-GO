import { eq } from "drizzle-orm";
import { getDb, getRawDb } from "../../../db";
import { cleanSprintBoards } from "../../../db/schema";
import {
  availableTickets,
  completedTaskCount,
  firstOpenPhaseId,
  makeFreshBoard,
  normalizeBoard,
  REWARD_CARDS,
  REWARD_PACKS,
  taskCount,
  type CleanSprintBoard,
  type Person,
  type RewardCard,
  type RewardPack,
  type RewardRarity,
} from "../../clean-sprint-types";

const BOARD_ID = "house-reset-75";

type ActionPayload =
  | { action: "start"; owner?: Person }
  | { action: "pause" }
  | { action: "resume" }
  | { action: "complete-task"; taskId: string; owner?: Person }
  | { action: "earn-personal"; missionId?: string; title?: string; tickets?: number; evidence?: string; owner?: Person }
  | { action: "choose-pack"; packId: string }
  | { action: "spend-pack"; packId?: string; owner?: Person }
  | { action: "restart" };

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("clean_sprint_boards")) {
    return "The Clean Sprint database is not ready yet. The deployed migration needs to finish first.";
  }
  return message;
}

function cloneBoard(board: CleanSprintBoard): CleanSprintBoard {
  return JSON.parse(JSON.stringify(board)) as CleanSprintBoard;
}

function weightedChoice<T>(entries: Array<{ value: T; weight: number }>) {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  if (total <= 0) return entries[0]?.value;
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= Math.max(0, entry.weight);
    if (roll <= 0) return entry.value;
  }
  return entries.at(-1)?.value;
}

function pickRewardCard(board: CleanSprintBoard, pack: RewardPack) {
  const weightedRarities = Object.entries(pack.weights)
    .filter((entry): entry is [RewardRarity, number] => Number(entry[1]) > 0)
    .map(([rarity, weight]) => ({ value: rarity as RewardRarity, weight }));
  const chosenRarity = weightedChoice(weightedRarities) ?? "Common";
  const unlocked = new Set(board.vault.unlockedCardIds);

  let pool = REWARD_CARDS.filter((card) => card.rarity === chosenRarity && !unlocked.has(card.id));
  if (!pool.length) pool = REWARD_CARDS.filter((card) => card.rarity === chosenRarity);
  if (!pool.length) pool = REWARD_CARDS.filter((card) => !unlocked.has(card.id));
  if (!pool.length) pool = REWARD_CARDS;

  return weightedChoice(
    pool.map((card) => ({
      value: card,
      weight: Math.max(1, card.rarityRank * 16 + card.stats.aura + card.stats.presence),
    })),
  ) as RewardCard;
}

function elapsedAt(board: CleanSprintBoard, at = Date.now()) {
  if (board.status !== "running" || !board.startedAt) return board.elapsedSeconds;
  const started = Date.parse(board.startedAt);
  if (Number.isNaN(started)) return board.elapsedSeconds;
  return board.elapsedSeconds + Math.max(0, Math.floor((at - started) / 1000));
}

function stopClock(board: CleanSprintBoard, at = Date.now()) {
  board.elapsedSeconds = elapsedAt(board, at);
  board.startedAt = null;
}

function settleBoard(board: CleanSprintBoard, action: ActionPayload, at = new Date()) {
  const next = cloneBoard(board);
  const stamp = at.toISOString();
  const possibleOwner = "owner" in action ? action.owner : undefined;
  const actor = possibleOwner === "Jay" || possibleOwner === "Zara" || possibleOwner === "Shared" ? possibleOwner : "Shared";

  switch (action.action) {
    case "start":
      if (next.status !== "idle") throw new Error("This sprint has already started.");
      next.runId += 1;
      next.status = "running";
      next.startedAt = stamp;
      next.elapsedSeconds = 0;
      next.activePhaseId = firstOpenPhaseId(next);
      next.lastAction = `${actor} started run ${next.runId}.`;
      break;
    case "pause":
      if (next.status !== "running") throw new Error("Only a running sprint can be paused.");
      stopClock(next, at.getTime());
      next.status = "paused";
      next.lastAction = "Sprint paused. The shared board is saved.";
      break;
    case "resume":
      if (next.status !== "paused") throw new Error("Only a paused sprint can resume.");
      next.status = "running";
      next.startedAt = stamp;
      next.lastAction = `${actor} resumed the sprint.`;
      break;
    case "complete-task": {
      if (next.status !== "running") throw new Error("Start or resume the sprint before checking off a task.");
      const phase = next.phases.find((candidate) => candidate.tasks.some((task) => task.id === action.taskId));
      const task = phase?.tasks.find((candidate) => candidate.id === action.taskId);
      if (!phase || !task) throw new Error("That task is no longer on this Clean Sprint board.");
      if (task.status === "done") throw new Error("That task is already reported done.");
      task.status = "done";
      task.completedAt = stamp;
      task.completedBy = actor;
      next.vault.earnedTickets += 1;
      next.activePhaseId = firstOpenPhaseId(next);
      next.lastAction = `${actor} reported "${task.title}" done and banked 1 ticket.`;
      if (completedTaskCount(next) === taskCount(next)) {
        stopClock(next, at.getTime());
        next.status = "complete";
        next.history.unshift({
          runId: next.runId,
          completedAt: stamp,
          elapsedSeconds: next.elapsedSeconds,
          completedTasks: taskCount(next),
        });
        next.lastAction = `${actor} completed the full house reset. LFG.`;
      }
      break;
    }
    case "earn-personal": {
      const title = typeof action.title === "string" && action.title.trim() ? action.title.trim() : "Personal LFG mission";
      const evidence = typeof action.evidence === "string" ? action.evidence.trim() : "";
      const tickets = Number.isFinite(action.tickets) ? Math.max(1, Math.min(8, Math.floor(action.tickets ?? 1))) : 1;
      if (!evidence) throw new Error("Evidence is required before banking personal LFG tickets.");
      next.vault.earnedTickets += tickets;
      next.lastAction = `${actor} banked ${tickets} ticket${tickets === 1 ? "" : "s"} for "${title}".`;
      break;
    }
    case "choose-pack": {
      const pack = REWARD_PACKS.find((candidate) => candidate.id === action.packId);
      if (!pack) throw new Error("That reward pack is not available.");
      next.vault.selectedPackId = pack.id;
      next.lastAction = `${pack.name} is armed for the next spend.`;
      break;
    }
    case "spend-pack": {
      const pack = REWARD_PACKS.find((candidate) => candidate.id === (action.packId ?? next.vault.selectedPackId));
      if (!pack) throw new Error("That reward pack is not available.");
      if (availableTickets(next) < pack.cost) {
        throw new Error(`You need ${pack.cost - availableTickets(next)} more tickets for ${pack.name}.`);
      }
      const card = pickRewardCard(next, pack);
      next.vault.spentTickets += pack.cost;
      next.vault.selectedPackId = pack.id;
      next.vault.currentCardId = card.id;
      if (!next.vault.unlockedCardIds.includes(card.id)) {
        next.vault.unlockedCardIds.unshift(card.id);
      }
      next.vault.recentCardIds = [card.id, ...next.vault.recentCardIds.filter((id) => id !== card.id)].slice(0, 6);
      next.lastAction = `${actor} spent ${pack.cost} tickets and pulled ${card.name}.`;
      break;
    }
    case "restart":
      if (next.status !== "complete") throw new Error("Finish the current run before starting a fresh one.");
      {
        const fresh = makeFreshBoard(stamp);
        fresh.runId = next.runId;
        fresh.history = next.history;
        fresh.vault = next.vault;
        fresh.lastAction = "Fresh board ready for the next shared run.";
        return fresh;
      }
    default:
      throw new Error("Unknown Clean Sprint action.");
  }

  next.updatedAt = stamp;
  return next;
}

async function readBoard() {
  const db = getDb();
  const rows = await db
    .select()
    .from(cleanSprintBoards)
    .where(eq(cleanSprintBoards.id, BOARD_ID));
  const existing = rows[0];
  if (existing) return normalizeBoard(JSON.parse(existing.stateJson) as CleanSprintBoard);

  const initial = makeFreshBoard();
  await db.insert(cleanSprintBoards).values({
    id: BOARD_ID,
    stateJson: JSON.stringify(initial),
    updatedAt: initial.updatedAt,
  });
  return initial;
}

async function writeBoardIfUnchanged(current: CleanSprintBoard, next: CleanSprintBoard) {
  const result = await getRawDb()
    .prepare(
      "UPDATE clean_sprint_boards SET state_json = ?, updated_at = ? WHERE id = ? AND updated_at = ?",
    )
    .bind(JSON.stringify(next), next.updatedAt, BOARD_ID, current.updatedAt)
    .run();
  return result.meta.changes === 1;
}

export async function GET() {
  try {
    const board = await readBoard();
    return Response.json({ board });
  } catch (error) {
    return Response.json({ error: readableError(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const action = (await request.json()) as ActionPayload;
    if (!action || typeof action.action !== "string") {
      return Response.json({ error: "A Clean Sprint action is required." }, { status: 400 });
    }
    // Two phones can report tasks at the same time. A compare-and-set write
    // avoids one completion silently overwriting the other; the loser retries
    // against the freshly saved board.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = await readBoard();
      const next = settleBoard(current, action);
      if (await writeBoardIfUnchanged(current, next)) {
        return Response.json({ board: next });
      }
    }
    return Response.json(
      { error: "Someone updated the board at the same moment. Tap the action once more." },
      { status: 409 },
    );
  } catch (error) {
    return Response.json({ error: readableError(error) }, { status: 400 });
  }
}
