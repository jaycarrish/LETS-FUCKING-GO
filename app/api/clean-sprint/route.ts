import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { cleanSprintBoards } from "../../../db/schema";
import {
  completedTaskCount,
  firstOpenPhaseId,
  makeFreshBoard,
  taskCount,
  type CleanSprintBoard,
  type Person,
} from "../../clean-sprint-types";

const BOARD_ID = "house-reset-75";

type ActionPayload =
  | { action: "start"; owner?: Person }
  | { action: "pause" }
  | { action: "resume" }
  | { action: "complete-task"; taskId: string; owner?: Person }
  | { action: "restart" };

function now() {
  return new Date().toISOString();
}

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
      next.activePhaseId = firstOpenPhaseId(next);
      next.lastAction = `${actor} reported “${task.title}” done.`;
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
    case "restart":
      if (next.status !== "complete") throw new Error("Finish the current run before starting a fresh one.");
      {
        const fresh = makeFreshBoard(stamp);
        fresh.runId = next.runId;
        fresh.history = next.history;
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
  if (existing) return JSON.parse(existing.stateJson) as CleanSprintBoard;

  const initial = makeFreshBoard();
  await db.insert(cleanSprintBoards).values({
    id: BOARD_ID,
    stateJson: JSON.stringify(initial),
    updatedAt: initial.updatedAt,
  });
  return initial;
}

async function writeBoard(board: CleanSprintBoard) {
  const db = getDb();
  await db
    .update(cleanSprintBoards)
    .set({ stateJson: JSON.stringify(board), updatedAt: board.updatedAt })
    .where(eq(cleanSprintBoards.id, BOARD_ID));
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
    const current = await readBoard();
    const next = settleBoard(current, action);
    await writeBoard(next);
    return Response.json({ board: next });
  } catch (error) {
    return Response.json({ error: readableError(error) }, { status: 400 });
  }
}
