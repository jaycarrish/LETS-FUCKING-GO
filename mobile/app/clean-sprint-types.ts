export type Person = "Jay" | "Zara" | "Shared";
export type SprintStatus = "idle" | "running" | "paused" | "complete";

export type SprintTask = {
  id: string;
  title: string;
  detail: string;
  owner: Person;
  status: "todo" | "done";
  completedAt?: string;
  completedBy?: Person;
};

export type SprintPhase = {
  id: string;
  title: string;
  minutes: string;
  goal: string;
  tasks: SprintTask[];
};

export type SprintHistory = {
  runId: number;
  completedAt: string;
  elapsedSeconds: number;
  completedTasks: number;
};

export type CleanSprintBoard = {
  version: 1;
  status: SprintStatus;
  runId: number;
  startedAt: string | null;
  elapsedSeconds: number;
  activePhaseId: string;
  updatedAt: string;
  lastAction: string;
  phases: SprintPhase[];
  history: SprintHistory[];
};

const task = (
  id: string,
  title: string,
  detail: string,
  owner: Person,
): SprintTask => ({ id, title, detail, owner, status: "todo" });

export function makeFreshBoard(now = new Date().toISOString()): CleanSprintBoard {
  return {
    version: 1,
    status: "idle",
    runId: 0,
    startedAt: null,
    elapsedSeconds: 0,
    activePhaseId: "zones",
    updatedAt: now,
    lastAction: "Board ready for the first shared run.",
    phases: [
      {
        id: "zones",
        title: "Set five zones",
        minutes: "0–10 min",
        goal: "Give every loose item one next move before the sweep begins.",
        tasks: [
          task("trash-zone", "Trash + recycling", "Open the bag and put it where everyone can reach it.", "Shared"),
          task("sort-zone", "Laundry, dishes + one-home zones", "Put out the basket, dish zone, ‘belongs here,’ and ‘belongs elsewhere’ box.", "Shared"),
        ],
      },
      {
        id: "path",
        title: "Clear the main path",
        minutes: "10–25 min",
        goal: "Make a usable walking lane from the front door through the house.",
        tasks: [
          task("main-path", "Front door → pool → dining → kitchen → living → hallway", "Trash, laundry, and loose items leave the walking lane. No organizing detours.", "Shared"),
        ],
      },
      {
        id: "kitchen",
        title: "Kitchen reset",
        minutes: "25–45 min",
        goal: "Make the kitchen safe, usable, and easy to maintain tonight.",
        tasks: [
          task("kitchen-dishes", "Dishes + sink", "Dishwash, rack, or stage every dish. Clear the sink.", "Jay"),
          task("kitchen-surfaces", "Counters + stove", "Put items in their one home, then wipe counters and stovetop.", "Zara"),
          task("kitchen-floor", "Kitchen floor", "Sweep or vacuum the floor after surfaces are clear.", "Jay"),
        ],
      },
      {
        id: "bathroom",
        title: "Bathroom reset",
        minutes: "45–55 min",
        goal: "Leave a clean, ready bathroom — not a half-finished project.",
        tasks: [
          task("bathroom-reset", "Trash, toilet, sink, mirror + shower glass", "Quick complete pass: remove trash, sanitize, and dry visible surfaces.", "Zara"),
        ],
      },
      {
        id: "laundry",
        title: "Keep laundry moving",
        minutes: "55–65 min",
        goal: "Launch or finish the current load without building a new pile.",
        tasks: [
          task("laundry-loop", "Start / switch / fold the current load", "Keep the laundry loop moving; clean items get their one home.", "Zara"),
        ],
      },
      {
        id: "living-room",
        title: "Living room first pass",
        minutes: "65–75 min",
        goal: "End with a usable room, a clear floor, and no mystery piles.",
        tasks: [
          task("living-clear", "Clear bedding, clothes + loose items", "Return, laundry, trash, or box it. Do not start a side project.", "Shared"),
          task("living-surfaces", "Reset surfaces", "TV stand, side table, and seating get only items that live there.", "Zara"),
          task("living-floor", "Sweep / vacuum the living room", "Floor is clear before the final pass.", "Jay"),
          task("one-home-check", "One-home check", "Every remaining item has one permanent home — and only one home.", "Shared"),
        ],
      },
    ],
    history: [],
  };
}

export function taskCount(board: CleanSprintBoard) {
  return board.phases.reduce((total, phase) => total + phase.tasks.length, 0);
}

export function completedTaskCount(board: CleanSprintBoard) {
  return board.phases.reduce(
    (total, phase) => total + phase.tasks.filter((item) => item.status === "done").length,
    0,
  );
}

export function phaseIsDone(phase: SprintPhase) {
  return phase.tasks.every((item) => item.status === "done");
}

export function firstOpenPhaseId(board: CleanSprintBoard) {
  return board.phases.find((phase) => !phaseIsDone(phase))?.id ?? board.phases.at(-1)?.id ?? "zones";
}
