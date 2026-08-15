export type Person = "Jay" | "Zara" | "Shared";
export type SprintStatus = "idle" | "running" | "paused" | "complete";
export type RewardRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic"
  | "Transcendent";

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

export type RewardCard = {
  id: string;
  name: string;
  loreTitle: string;
  lore: string;
  worthLine: string;
  flavorQuote: string;
  branch: string;
  branchSubtitle: string;
  rarity: RewardRarity;
  rarityRank: number;
  accent: string;
  glow: string;
  sigil: string;
  pose: string;
  backdrop: string;
  stats: Record<string, number>;
};

export type RewardPack = {
  id: string;
  name: string;
  cost: number;
  description: string;
  weights: Partial<Record<RewardRarity, number>>;
};

export type SkillNode = {
  id: string;
  name: string;
  threshold: number;
  reward: string;
};

export type SkillBranch = {
  id: string;
  branch: string;
  subtitle: string;
  accent: string;
  icon: string;
  totalCards: number;
  nodes: SkillNode[];
};

export type RewardVault = {
  earnedTickets: number;
  spentTickets: number;
  unlockedCardIds: string[];
  recentCardIds: string[];
  selectedPackId: string;
  currentCardId: string;
};

export type CleanSprintBoard = {
  version: 2;
  status: SprintStatus;
  runId: number;
  startedAt: string | null;
  elapsedSeconds: number;
  activePhaseId: string;
  updatedAt: string;
  lastAction: string;
  phases: SprintPhase[];
  history: SprintHistory[];
  vault: RewardVault;
};

type LegacyBoard = Omit<CleanSprintBoard, "version" | "vault"> & { version?: 1 };

const task = (
  id: string,
  title: string,
  detail: string,
  owner: Person,
): SprintTask => ({ id, title, detail, owner, status: "todo" });

export const REWARD_PACKS: RewardPack[] = [
  {
    id: "street-pack",
    name: "Street Pack",
    cost: 3,
    description: "Fast pull. Good odds, no waiting, still cool as hell.",
    weights: { Common: 44, Uncommon: 32, Rare: 18, Epic: 6 },
  },
  {
    id: "crown-pack",
    name: "Crown Pack",
    cost: 5,
    description: "The sweet spot: better lore, harder glow, stronger odds.",
    weights: { Uncommon: 28, Rare: 34, Epic: 24, Legendary: 11, Mythic: 3 },
  },
  {
    id: "god-pack",
    name: "God Pack",
    cost: 8,
    description: "Spend real momentum. This is where the jackpot language lives.",
    weights: { Rare: 24, Epic: 28, Legendary: 24, Mythic: 16, Transcendent: 8 },
  },
];

export const REWARD_CARDS: RewardCard[] = [
  {
    id: "noir-velvet-intercept",
    name: "Glass Detective",
    loreTitle: "The Velvet Intercept",
    lore: "She arrives like the answer to a city that forgot how to confess. Every wet alley, borrowed lie, and almost-clean getaway starts bending toward her the second the card flips. Pulling her feels like cashing in long patience for a perfect exit.",
    worthLine: "This one makes the work feel sharp, elegant, and absolutely worth the push.",
    flavorQuote: "Rain on the pavement. Clarity in the kill shot.",
    branch: "Noir Circuit",
    branchSubtitle: "Rainlit sins, velvet danger, and flawless exits.",
    rarity: "Legendary",
    rarityRank: 5,
    accent: "#ffd36f",
    glow: "rgba(255, 211, 111, 0.45)",
    sigil: "N",
    pose: "One-leg-forward threat pose like she already solved the room.",
    backdrop: "Mirrored alleys, broken payphones, and wet neon breathing behind her.",
    stats: { presence: 84, nerve: 92, aura: 78, speed: 81 },
  },
  {
    id: "noir-shadow-protocol",
    name: "Shadow Protocol",
    loreTitle: "Eyes Behind The Last-Lit Window",
    lore: "She is the card you get when the mission finally stops playing small. Entire routes, names, and weak points surface around her because she carries the kind of intelligence that turns panic into structure. The pull lands like a private advantage no one else in the room earned.",
    worthLine: "A good pull. A better feeling. Pure leverage.",
    flavorQuote: "Nothing remembers its lock once she has walked through it.",
    branch: "Noir Circuit",
    branchSubtitle: "Rainlit sins, velvet danger, and flawless exits.",
    rarity: "Mythic",
    rarityRank: 6,
    accent: "#ffe8a4",
    glow: "rgba(255, 232, 164, 0.42)",
    sigil: "N",
    pose: "Still as a sniper, eyes up, coat lifting in midnight wind.",
    backdrop: "A blackout skyline with one gold window refusing to die.",
    stats: { presence: 90, nerve: 88, aura: 95, speed: 72 },
  },
  {
    id: "aether-lumen-commander",
    name: "Lumen Commander",
    loreTitle: "Aurora Commandant",
    lore: "She turns impossible distance into a personal promise. Solar sails, citadel glass, and quiet fleet discipline line up behind her because she radiates the kind of command that makes chaos feel grateful to be organized. When this card opens, the whole grind suddenly looks smaller than the payoff.",
    worthLine: "Flagship energy. Endgame glow. Huge return on effort.",
    flavorQuote: "She makes the work feel worth it in the exact way a flagship feels worth building.",
    branch: "Aether Nova",
    branchSubtitle: "Star cruisers, cosmic royalty, and impossible horizons.",
    rarity: "Transcendent",
    rarityRank: 7,
    accent: "#fff6c4",
    glow: "rgba(255, 246, 196, 0.46)",
    sigil: "A",
    pose: "Victorious promenade through a starport wake of banners and engines.",
    backdrop: "Solar sails, moonlit citadels, and nebula weather breaking open.",
    stats: { presence: 95, nerve: 85, aura: 99, speed: 83 },
  },
  {
    id: "aether-starbound-sable",
    name: "Starbound Sable",
    loreTitle: "Pilot Of Silent Constellations",
    lore: "She belongs to the kind of card pool that makes a sprint feel like the opening chapter of a myth. Every line in her reveal suggests motion, reach, and a horizon that finally wants you back. Pulling her feels like winning altitude.",
    worthLine: "This is the card version of clean lift-off.",
    flavorQuote: "The void answers before she asks.",
    branch: "Aether Nova",
    branchSubtitle: "Star cruisers, cosmic royalty, and impossible horizons.",
    rarity: "Epic",
    rarityRank: 4,
    accent: "#94c9ff",
    glow: "rgba(148, 201, 255, 0.34)",
    sigil: "A",
    pose: "Hand outstretched like she is choosing the next orbit herself.",
    backdrop: "Thin-ring planets, signal towers, and a split comet trail.",
    stats: { presence: 78, nerve: 73, aura: 89, speed: 91 },
  },
  {
    id: "mythborn-gilded-empress",
    name: "Gilded Empress",
    loreTitle: "Ember Oathkeeper",
    lore: "She does not enter a reveal so much as inherit it. The bronze observatories, meteor crown, and heat-hazed temple steps all make the same point: some rewards do not feel decorative, they feel ordained. This pull lands with the emotional math of absolutely worth it and then keeps climbing.",
    worthLine: "Older, richer, more dangerous. Exactly the right kind of reward.",
    flavorQuote: "Fortresses open before negotiations even begin.",
    branch: "Mythborn",
    branchSubtitle: "Moonlit empires, blade vows, and ancient splendor.",
    rarity: "Transcendent",
    rarityRank: 7,
    accent: "#ffe7b7",
    glow: "rgba(255, 231, 183, 0.42)",
    sigil: "M",
    pose: "Queenly turn at the edge of a burning altar stair.",
    backdrop: "Ancient observatories opening their bronze jaws toward a meteor crown.",
    stats: { presence: 92, nerve: 79, aura: 96, speed: 66 },
  },
  {
    id: "mythborn-ashen-wanderer",
    name: "Ashen Wanderer",
    loreTitle: "Dust Among The Dunes",
    lore: "She feels like surviving the long way on purpose. Sandstorm gold, blade-light, and old gods watching from heat mirage distance all gather under her frame. The reveal pays off in that rare way where effort turns into myth before your eyes.",
    worthLine: "A survival card with real gravity to it.",
    flavorQuote: "The desert only keeps what can carry legend.",
    branch: "Mythborn",
    branchSubtitle: "Moonlit empires, blade vows, and ancient splendor.",
    rarity: "Rare",
    rarityRank: 3,
    accent: "#ffbd7d",
    glow: "rgba(255, 189, 125, 0.32)",
    sigil: "M",
    pose: "Blade low, chin high, dune wind cutting across her silhouette.",
    backdrop: "Saffron dust, temple ruins, and a red moon waiting for tribute.",
    stats: { presence: 74, nerve: 77, aura: 69, speed: 80 },
  },
  {
    id: "wildframe-storm-huntress",
    name: "Storm Huntress",
    loreTitle: "Breakerline Queen",
    lore: "She is what the coast dreams up when it wants revenge and glamour at the same time. Pulling her feels like ocean thunder finally taking your side. Every clean strike of work that earned this card comes back as momentum you can actually feel.",
    worthLine: "This is the kind of pull that makes the room say damn.",
    flavorQuote: "Every storm wants a face. Tonight it borrows hers.",
    branch: "Wildframe",
    branchSubtitle: "Storm beaches, dune fire, and survival turned mythic.",
    rarity: "Legendary",
    rarityRank: 5,
    accent: "#8cf6ff",
    glow: "rgba(140, 246, 255, 0.36)",
    sigil: "W",
    pose: "Weight on the back foot, shoulders open, like the strike already landed.",
    backdrop: "Black surf, white spray, and lightning stitched across the horizon.",
    stats: { presence: 87, nerve: 86, aura: 74, speed: 88 },
  },
  {
    id: "wildframe-briar-saint",
    name: "Briar Saint",
    loreTitle: "The Forest Keeps Her Name",
    lore: "This is a slower, deeper card. Moss light, antler altars, and roots old enough to judge you all rise with her. She makes the labor behind the ticket feel meaningful rather than merely finished.",
    worthLine: "A pull with patience, hush, and real payoff.",
    flavorQuote: "The green world remembers who carried it kindly.",
    branch: "Wildframe",
    branchSubtitle: "Storm beaches, dune fire, and survival turned mythic.",
    rarity: "Epic",
    rarityRank: 4,
    accent: "#a7f4a7",
    glow: "rgba(167, 244, 167, 0.34)",
    sigil: "W",
    pose: "Hands at rest, calm enough to make the room quieter.",
    backdrop: "Fern cathedrals, root arches, and animal eyes in amber dark.",
    stats: { presence: 79, nerve: 70, aura: 91, speed: 65 },
  },
  {
    id: "crown-neon-vault",
    name: "Neon Vault Queen",
    loreTitle: "After-Hours Sovereign",
    lore: "She arrives like the nightclub equivalent of a decisive yes. Chrome reflections, glass stairs, and a city that finally admits it wants spectacle all pivot around her. Pulling this card feels expensive in exactly the right way.",
    worthLine: "A reward built to feel decadent, loud, and justified.",
    flavorQuote: "If the lights stay on, they stay on for her.",
    branch: "Crown Electric",
    branchSubtitle: "High-gloss nightlife, skyline heat, and luxury velocity.",
    rarity: "Mythic",
    rarityRank: 6,
    accent: "#ff8de3",
    glow: "rgba(255, 141, 227, 0.42)",
    sigil: "C",
    pose: "Hip-shot confidence, chin tilted, daring the room to keep up.",
    backdrop: "Magenta towers, smoked mirrors, and runway lines of gold.",
    stats: { presence: 93, nerve: 84, aura: 88, speed: 82 },
  },
  {
    id: "crown-skyline-sovereign",
    name: "Skyline Sovereign",
    loreTitle: "Penthouse Permission",
    lore: "The reveal opens and suddenly the mission has a view. She carries clean ambition, skyline appetite, and the composure of someone who already knows the night will end in her favor. That confidence is what makes the spend hit so hard.",
    worthLine: "This one feels like the reward got dressed up for you.",
    flavorQuote: "Some heights look better after you earned them.",
    branch: "Crown Electric",
    branchSubtitle: "High-gloss nightlife, skyline heat, and luxury velocity.",
    rarity: "Epic",
    rarityRank: 4,
    accent: "#d1b0ff",
    glow: "rgba(209, 176, 255, 0.34)",
    sigil: "C",
    pose: "Shoulders back, one hand to the rail, one look over the whole city.",
    backdrop: "Penthouse glass, aircraft beacons, and violet dusk over downtown.",
    stats: { presence: 85, nerve: 75, aura: 82, speed: 73 },
  },
  {
    id: "street-iron-lantern",
    name: "Iron Lantern",
    loreTitle: "The Watchman Made Of Smoke",
    lore: "Some cards are there to keep the machine moving. She is one of those, and she still looks cool doing it. The pull feels earned because it honors the workhorse energy that actually gets a long night over the line.",
    worthLine: "Not every reward has to be loud to hit right.",
    flavorQuote: "The lane stays open because she says it does.",
    branch: "Street Engine",
    branchSubtitle: "Concrete rhythm, industrial pulse, and motion without whining.",
    rarity: "Common",
    rarityRank: 1,
    accent: "#b2ff87",
    glow: "rgba(178, 255, 135, 0.28)",
    sigil: "S",
    pose: "Square stance, ready hands, smoke and heat curling around her frame.",
    backdrop: "Loading docks, sodium lamps, and a city that still has work to do.",
    stats: { presence: 61, nerve: 74, aura: 52, speed: 68 },
  },
  {
    id: "street-switchblade-mercy",
    name: "Switchblade Mercy",
    loreTitle: "Fast Hands, Clean Exit",
    lore: "She is the kind of quick pull that still makes you smile. The card hits with speed, grit, and enough style to make a short burst of effort feel properly rewarded. She is proof the common lane does not have to be boring.",
    worthLine: "Cheap pull, real flavor, zero regret.",
    flavorQuote: "The elegant answer is still an answer.",
    branch: "Street Engine",
    branchSubtitle: "Concrete rhythm, industrial pulse, and motion without whining.",
    rarity: "Uncommon",
    rarityRank: 2,
    accent: "#d7ff98",
    glow: "rgba(215, 255, 152, 0.28)",
    sigil: "S",
    pose: "Half-turn pivot like the next move is already in her wrist.",
    backdrop: "Graffiti walls, train sparks, and damp pavement under amber light.",
    stats: { presence: 67, nerve: 71, aura: 58, speed: 79 },
  },
];

export const SKILL_BRANCHES: SkillBranch[] = [
  {
    id: "noir-circuit",
    branch: "Noir Circuit",
    subtitle: "Unlock cleaner exits, better instincts, and sharper finish energy.",
    accent: "#ffd36f",
    icon: "N",
    totalCards: REWARD_CARDS.filter((card) => card.branch === "Noir Circuit").length,
    nodes: [
      { id: "noir-1", name: "Eyes Up", threshold: 1, reward: "You start reading the room faster." },
      { id: "noir-2", name: "Silent Route", threshold: 2, reward: "Less hesitation. Cleaner decisions." },
    ],
  },
  {
    id: "aether-nova",
    branch: "Aether Nova",
    subtitle: "Big horizon energy, stronger finish lines, less small thinking.",
    accent: "#94c9ff",
    icon: "A",
    totalCards: REWARD_CARDS.filter((card) => card.branch === "Aether Nova").length,
    nodes: [
      { id: "aether-1", name: "Lift-Off", threshold: 1, reward: "Momentum starts feeling easy." },
      { id: "aether-2", name: "Flagship Mood", threshold: 2, reward: "You act like the outcome is already real." },
    ],
  },
  {
    id: "mythborn",
    branch: "Mythborn",
    subtitle: "Old power, patient confidence, and rewards that feel ceremonial.",
    accent: "#ffbd7d",
    icon: "M",
    totalCards: REWARD_CARDS.filter((card) => card.branch === "Mythborn").length,
    nodes: [
      { id: "myth-1", name: "Oath Lit", threshold: 1, reward: "Your work starts carrying story weight." },
      { id: "myth-2", name: "Crowned Heat", threshold: 2, reward: "The payoff feels bigger before it even lands." },
    ],
  },
  {
    id: "wildframe",
    branch: "Wildframe",
    subtitle: "Storm nerve, calm hands, and alive-room momentum.",
    accent: "#8cf6ff",
    icon: "W",
    totalCards: REWARD_CARDS.filter((card) => card.branch === "Wildframe").length,
    nodes: [
      { id: "wild-1", name: "Breakerline", threshold: 1, reward: "You stop flinching at the messy part." },
      { id: "wild-2", name: "Forest Quiet", threshold: 2, reward: "Calm returns faster after the push." },
    ],
  },
  {
    id: "crown-electric",
    branch: "Crown Electric",
    subtitle: "Skyline appetite, high-gloss finish, and reward that feels rich.",
    accent: "#ff8de3",
    icon: "C",
    totalCards: REWARD_CARDS.filter((card) => card.branch === "Crown Electric").length,
    nodes: [
      { id: "crown-1", name: "Night Heat", threshold: 1, reward: "The room starts to look more finished." },
      { id: "crown-2", name: "Penthouse Nerve", threshold: 2, reward: "You carry the win like it belongs to you." },
    ],
  },
  {
    id: "street-engine",
    branch: "Street Engine",
    subtitle: "Workhorse momentum, clean lanes, and no-bullshit forward motion.",
    accent: "#b2ff87",
    icon: "S",
    totalCards: REWARD_CARDS.filter((card) => card.branch === "Street Engine").length,
    nodes: [
      { id: "street-1", name: "Keep It Moving", threshold: 1, reward: "You recover from stalls faster." },
      { id: "street-2", name: "Hard Finish", threshold: 2, reward: "You close loops without drama." },
    ],
  },
];

export function makeFreshBoard(now = new Date().toISOString()): CleanSprintBoard {
  return {
    version: 2,
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
        minutes: "0-10 min",
        goal: "Give every loose item one next move before the sweep begins.",
        tasks: [
          task("trash-zone", "Trash + recycling", "Open the bag and put it where everyone can reach it.", "Shared"),
          task("sort-zone", "Laundry, dishes + one-home zones", "Put out the basket, dish zone, 'belongs here,' and 'belongs elsewhere' box.", "Shared"),
        ],
      },
      {
        id: "path",
        title: "Clear the main path",
        minutes: "10-25 min",
        goal: "Make a usable walking lane from the front door through the house.",
        tasks: [
          task("main-path", "Front door -> pool -> dining -> kitchen -> living -> hallway", "Trash, laundry, and loose items leave the walking lane. No organizing detours.", "Shared"),
        ],
      },
      {
        id: "kitchen",
        title: "Kitchen reset",
        minutes: "25-45 min",
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
        minutes: "45-55 min",
        goal: "Leave a clean, ready bathroom - not a half-finished project.",
        tasks: [
          task("bathroom-reset", "Trash, toilet, sink, mirror + shower glass", "Quick complete pass: remove trash, sanitize, and dry visible surfaces.", "Zara"),
        ],
      },
      {
        id: "laundry",
        title: "Keep laundry moving",
        minutes: "55-65 min",
        goal: "Launch or finish the current load without building a new pile.",
        tasks: [
          task("laundry-loop", "Start / switch / fold the current load", "Keep the laundry loop moving; clean items get their one home.", "Zara"),
        ],
      },
      {
        id: "living-room",
        title: "Living room first pass",
        minutes: "65-75 min",
        goal: "End with a usable room, a clear floor, and no mystery piles.",
        tasks: [
          task("living-clear", "Clear bedding, clothes + loose items", "Return, laundry, trash, or box it. Do not start a side project.", "Shared"),
          task("living-surfaces", "Reset surfaces", "TV stand, side table, and seating get only items that live there.", "Zara"),
          task("living-floor", "Sweep / vacuum the living room", "Floor is clear before the final pass.", "Jay"),
          task("one-home-check", "One-home check", "Every remaining item has one permanent home - and only one home.", "Shared"),
        ],
      },
    ],
    history: [],
    vault: {
      earnedTickets: 0,
      spentTickets: 0,
      unlockedCardIds: [],
      recentCardIds: [],
      selectedPackId: REWARD_PACKS[1]?.id ?? REWARD_PACKS[0].id,
      currentCardId: REWARD_CARDS[0]?.id ?? "card-empty",
    },
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

export function availableTickets(board: CleanSprintBoard) {
  return Math.max(0, board.vault.earnedTickets - board.vault.spentTickets);
}

export function branchUnlockCount(board: CleanSprintBoard, branch: string) {
  return board.vault.unlockedCardIds
    .map((id) => REWARD_CARDS.find((card) => card.id === id))
    .filter((card): card is RewardCard => Boolean(card) && card.branch === branch)
    .length;
}

export function highestUnlockedRarity(board: CleanSprintBoard) {
  const unlocked = board.vault.unlockedCardIds
    .map((id) => REWARD_CARDS.find((card) => card.id === id))
    .filter((card): card is RewardCard => Boolean(card));
  return unlocked.sort((left, right) => right.rarityRank - left.rarityRank)[0]?.rarity ?? "None";
}

export function normalizeBoard(input?: CleanSprintBoard | LegacyBoard | null): CleanSprintBoard {
  if (!input) return makeFreshBoard();
  if ("vault" in input && input.version === 2) {
    return {
      ...input,
      activePhaseId: firstOpenPhaseId(input),
      vault: {
        ...input.vault,
        selectedPackId: REWARD_PACKS.some((pack) => pack.id === input.vault.selectedPackId)
          ? input.vault.selectedPackId
          : (REWARD_PACKS[1]?.id ?? REWARD_PACKS[0].id),
        currentCardId: REWARD_CARDS.some((card) => card.id === input.vault.currentCardId)
          ? input.vault.currentCardId
          : (input.vault.unlockedCardIds[0] ?? REWARD_CARDS[0]?.id ?? "card-empty"),
      },
    };
  }

  const legacy = input as LegacyBoard;
  const upgraded = makeFreshBoard(legacy.updatedAt);
  const historyTickets = legacy.history.reduce((sum, item) => sum + item.completedTasks, 0);
  const currentOpenRunTickets = legacy.status === "complete" ? 0 : completedTaskCount(legacy as CleanSprintBoard);

  return {
    ...upgraded,
    status: legacy.status,
    runId: legacy.runId,
    startedAt: legacy.startedAt,
    elapsedSeconds: legacy.elapsedSeconds,
    activePhaseId: firstOpenPhaseId(legacy as CleanSprintBoard),
    updatedAt: legacy.updatedAt,
    lastAction: legacy.lastAction,
    phases: legacy.phases,
    history: legacy.history,
    vault: {
      ...upgraded.vault,
      earnedTickets: historyTickets + currentOpenRunTickets,
    },
  };
}
