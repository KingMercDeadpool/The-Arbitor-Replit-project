import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We are using LocalStorage for this prototype, but we define the schemas here
// for type safety and consistent validation across the application.

// === GAME STATE SCHEMA (Step 1) ===

export const resourcesSchema = z.object({
  renown: z.number().min(0),
  leverage: z.number().min(0),
  capacity: z.number().min(0),
  legitimacy: z.number().min(0).max(100),
  roleTokens: z.number().min(0),
  contractStepsCompleted: z.number().min(0),
});

export const rolesSchema = z.object({
  spymasterTier: z.number().min(1).max(10),
  commanderTier: z.number().min(1).max(10),
  stewardTier: z.number().min(1).max(10),
  arbitorTier: z.number().min(1).max(10),
});

export const flagsSchema = z.object({
  hardLineViolated: z.boolean(),
  credibilityCrisisSurvived: z.boolean(),
  continentRulingSucceeded: z.boolean(),
  watchdogFrameworkEstablished: z.boolean(),
  grayScenarioResolvedCleanly: z.boolean(),
});

export const countersSchema = z.object({
  proofChains: z.number().min(0),
  settlementSupport: z.number().min(0),
});

export const logEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  action: z.string(),
  details: z.string(),
  type: z.enum(["CONTRACT", "TIER_UP", "SYSTEM", "CRISIS", "NPC", "WORLD", "COMBAT", "SOCIAL", "RECRUITMENT"]),
});

// === THREE MARKS (Orc Legitimacy Core) ===
export const threeMarksSchema = z.object({
  strength: z.number().min(0).max(100),
  mind: z.number().min(0).max(100),
  stewardship: z.number().min(0).max(100),
});

// === WORLD BIBLE (Part 2) ===

export const biomeTypeSchema = z.enum([
  "COASTAL_LOWLANDS",
  "RIVER_BASIN", 
  "HIGHLAND_PLATEAU",
  "FOREST_INTERIOR",
  "ARID_FRONTIER"
]);

export const subregionCategorySchema = z.enum([
  "TRADE_HUB",
  "AGRICULTURAL",
  "MILITARY_FRONTIER",
  "SACRED_GROUNDS",
  "INDUSTRIAL"
]);

export const settlementSchema = z.object({
  id: z.string(),
  name: z.string(),
  biome: biomeTypeSchema,
  subregionCategory: subregionCategorySchema,
  population: z.enum(["HAMLET", "VILLAGE", "TOWN", "CITY"]),
  description: z.string(),
  culturalTaboo: z.string().optional(),
  witnessTradition: z.string().optional(),
});

// === DISTRICTS & PEOPLES (Part 3) ===

export const districtTypeSchema = z.enum([
  "ELVEN_ENCLAVE",
  "HALFLING_QUARTER",
  "ORCISH_WARD",
  "DWARVEN_WORKS",
  "HUMAN_COMMONS",
  "MIXED_MARKET",
  "DOCKS",
  "CRAFTSMAN",
  "TEMPLE",
  "GARRISON"
]);

export const districtSchema = z.object({
  id: z.string(),
  name: z.string(),
  settlementId: z.string(),
  type: districtTypeSchema,
  hasBlackMarket: z.boolean(),
  description: z.string(),
  dominantAncestry: z.string().optional(),
});

// === NPC/RIVAL ENGINE (Part 4) ===

export const ancestrySchema = z.enum([
  "HUMAN",
  "ELF",
  "DWARF",
  "ORC",
  "HALFLING",
  "GNOME",
  "TIEFLING",
  "MIXED"
]);

export const npcRoleSchema = z.enum([
  "MERCHANT",
  "INFORMANT",
  "GUARD",
  "ARTISAN",
  "SCHOLAR",
  "PRIEST",
  "CRIMINAL",
  "NOBLE",
  "TRAVELER"
]);

export const relationshipSchema = z.object({
  trust: z.number().min(-100).max(100),
  fear: z.number().min(0).max(100),
  debt: z.number(), // positive = they owe you, negative = you owe them
  leverage: z.number().min(0).max(100),
  standing: z.number().min(-100).max(100), // public reputation with them
});

export const npcSchema = z.object({
  id: z.string(),
  name: z.string(),
  ancestry: ancestrySchema,
  role: npcRoleSchema,
  districtId: z.string().optional(),
  isTraveler: z.boolean(),
  description: z.string(),
  recruitmentRequirements: z.object({
    minTrust: z.number(),
    minStanding: z.number(),
    requiredRoleTier: z.object({
      role: z.string(),
      tier: z.number(),
    }).optional(),
    forbiddenFlag: z.string().optional(),
  }),
  recruited: z.boolean(),
});

export const rivalStageSchema = z.number().min(0).max(5);

export const rivalSchema = z.object({
  id: z.string(),
  name: z.string(),
  ancestry: ancestrySchema,
  title: z.string(),
  stage: rivalStageSchema,
  description: z.string(),
  escalationTriggers: z.array(z.string()),
  currentThreat: z.string(),
});

// === PART 5: COMBAT SYSTEM ===

export const combatMoveSchema = z.enum([
  "STRIKE", "GUARD", "STEP", "BIND", "INVOKE", "FEINT", "RALLY"
]);

export const stanceSchema = z.enum([
  "BALANCED", "AGGRESSIVE", "DEFENSIVE", "EVASIVE", "FOCUSED"
]);

export const riteTypeSchema = z.enum([
  "WARD", "SUNDER", "GLAMOUR", "VIGOR", "SIGIL"
]);

export const woundTagSchema = z.enum([
  "BLEEDING", "BURNED", "FRACTURED", "CONCUSSED", "HEXED", 
  "PUNCTURED", "CRUSHED", "FROSTBIT", "POISONED", "RATTLED"
]).nullable();

export const injuryStateSchema = z.object({
  level: z.number().min(0).max(5),
  woundTag: woundTagSchema,
});

export const enemyArchetypeSchema = z.enum([
  "BRUISER", "SKIRMISHER", "HEXER", "SHIELDBEARER", "SNARER", "DUELIST", "SWARM"
]);

export const combatantSchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number(),
  maxHp: z.number(),
  stance: stanceSchema,
  archetype: enemyArchetypeSchema.optional(),
  isPlayer: z.boolean(),
  position: z.number().min(0).max(2), // 0=Front, 1=Mid, 2=Back
});

export const combatStateSchema = z.object({
  active: z.boolean(),
  isPitFight: z.boolean(),
  turn: z.number(),
  allies: z.array(combatantSchema),
  enemies: z.array(combatantSchema),
  crowdFavor: z.number().min(0).max(100),
  lastAction: z.string().optional(),
  dirtyTacticsUsed: z.boolean(),
  publicEncounter: z.boolean(),
});

export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  favor: z.number().min(0).max(100),
  prefersGrayPlay: z.boolean(),
  offersStaffHire: z.boolean(),
});

// === PART 6: CONTRACTS & QUEST ENGINE ===

export const contractSourceSchema = z.enum([
  "BROKER", "GUILD", "CLAN", "SYNDICATE"
]);

export const approachLaneSchema = z.enum([
  "SHADOW", "SEAL", "STEEL"
]);

export const contractStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  chosenLane: approachLaneSchema.optional(),
  completed: z.boolean(),
  failed: z.boolean(),
});

export const contractSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: contractSourceSchema,
  settlementId: z.string(),
  districtId: z.string().optional(),
  slateAxis: z.enum(["S", "L", "A", "T", "E"]),
  steps: z.array(contractStepSchema),
  currentStep: z.number(),
  requiredProofTypes: z.array(z.string()),
  witnessStrictness: z.enum(["LOW", "MEDIUM", "HIGH"]),
  rewards: z.object({
    renown: z.number(),
    leverage: z.number(),
    capacity: z.number(),
    legitimacy: z.number(),
    roleTokens: z.number(),
    markBonus: z.object({ strength: z.number(), mind: z.number(), stewardship: z.number() }),
  }),
  risks: z.object({
    heatDelta: z.number(),
    legitimacyDelta: z.number(),
    rivalEscalationChance: z.number(),
    injuryRisk: z.number(),
  }),
  failForwardEnabled: z.boolean(),
  moralLockSafe: z.boolean(),
  status: z.enum(["ACTIVE", "COMPLETED", "FAILED"]),
});

export const metersSchema = z.object({
  heat: z.number().min(0).max(100),
  unrestBySettlement: z.record(z.string(), z.number()),
});

export const tavernTableSchema = z.object({
  id: z.string(),
  npcIds: z.array(z.string()),
  mood: z.enum(["FRIENDLY", "NEUTRAL", "HOSTILE", "SECRETIVE"]),
  hasContractLead: z.boolean(),
  hasRecruitmentOpp: z.boolean(),
  hasRivalComplication: z.boolean(),
});

// === PART 7: ROSTER, STAFF, ARMIES ===

export const staffRoleSchema = z.enum([
  "SCOUT", "BROKER", "DELEGATE", "QUARTERMASTER", 
  "INSTRUCTOR", "SCRIBE", "HANDLER", "RECRUITER"
]);

export const rosterSlotSchema = z.enum([
  "OPS", "STAFF", "CADRE", "DISTRICT_ASSET"
]);

export const recruitSchema = z.object({
  npcId: z.string(),
  slot: rosterSlotSchema,
  staffRole: staffRoleSchema.optional(),
  assignedDistrictId: z.string().optional(),
});

export const armyStateSchema = z.object({
  garrison: z.number().min(0).max(900),
  readiness: z.number().min(0).max(100),
  supply: z.number().min(0).max(100),
  discipline: z.number().min(0).max(100),
});

export const betrayalRiskSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// === PART 8: TACTICAL TRIALS (Quiz Combat) ===

export const archetypeIdSchema = z.enum([
  "BRUISER", "SKIRMISHER", "HEXER", "SHIELDBEARER", "SNARER", "DUELIST", "SWARM"
]);

export const rivalIdSchema = z.enum(["VAREN", "SABLE", "KORRATH", "MISTVEIL"]);

export const cultureRegionSchema = z.enum([
  "COASTAL", "RIVER_BASIN", "HIGHLAND", "FOREST", "ARID"
]);

export const learningStyleSchema = z.object({
  conceptual: z.boolean().optional(),
  sequential: z.boolean().optional(),
  analytical: z.boolean().optional(),
  untimed: z.boolean().optional(),
  observational: z.boolean().optional(),
  practical: z.boolean().optional(),
});

export const masteryStateSchema = z.object({
  archetypes: z.record(archetypeIdSchema, z.number()),
  rivals: z.record(rivalIdSchema, z.number()),
  questionsAnswered: z.record(z.string(), z.number()),
  totalExchanges: z.number(),
  totalCorrect: z.number(),
});

export const trialStateSchema = z.object({
  active: z.boolean(),
  archetype: archetypeIdSchema.optional(),
  rivalId: rivalIdSchema.optional(),
  culture: cultureRegionSchema.optional(),
  currentExchange: z.number(),
  totalExchanges: z.number(),
  questionsInExchange: z.number(),
  currentQuestionIndex: z.number(),
  correctInExchange: z.number(),
  damage: z.number(), // 0-100, triggers injury at thresholds
  timer: z.number(),
  questionIds: z.array(z.string()),
  isPitFight: z.boolean().optional(),
  isRivalFight: z.boolean().optional(),
});

// === NPC RELATIONSHIP STATE ===
export const npcRelationshipStateSchema = z.record(z.string(), relationshipSchema);

// === FULL WORLD STATE ===
export const worldStateSchema = z.object({
  threeMarks: threeMarksSchema,
  npcRelationships: npcRelationshipStateSchema,
  recruitedNpcs: z.array(z.string()),
  visitedSettlements: z.array(z.string()),
  currentSettlementId: z.string().optional(),
  currentDistrictId: z.string().optional(),
});

// === EXTENDED GAME STATE (v0.7) ===
export const gameStateSchema = z.object({
  version: z.string().optional(),
  resources: resourcesSchema,
  roles: rolesSchema,
  flags: flagsSchema,
  counters: countersSchema,
  historyLog: z.array(logEntrySchema),
  world: worldStateSchema,
  // Part 5: Combat
  combat: combatStateSchema.optional(),
  injury: injuryStateSchema.optional(),
  stanceMastery: z.record(stanceSchema, z.boolean()).optional(),
  pitSponsorFavor: z.record(z.string(), z.number()).optional(),
  // Part 6: Contracts
  meters: metersSchema.optional(),
  activeContracts: z.array(contractSchema).optional(),
  completedContracts: z.array(z.string()).optional(),
  failedContracts: z.array(z.string()).optional(),
  // Part 7: Roster & Army
  roster: z.array(recruitSchema).optional(),
  fieldTeamIds: z.array(z.string()).optional(),
  fieldTeamMaxSize: z.number().optional(),
  army: armyStateSchema.optional(),
  // Part 8: Tactical Trials
  mastery: masteryStateSchema.optional(),
  trial: trialStateSchema.optional(),
  learningStyle: learningStyleSchema.optional(),
  learningStyleCompleted: z.boolean().optional(),
  prologueCompleted: z.boolean().optional(),
});

// === TYPE EXPORTS ===
export type GameState = z.infer<typeof gameStateSchema>;
export type Resources = z.infer<typeof resourcesSchema>;
export type Roles = z.infer<typeof rolesSchema>;
export type Flags = z.infer<typeof flagsSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type ThreeMarks = z.infer<typeof threeMarksSchema>;
export type BiomeType = z.infer<typeof biomeTypeSchema>;
export type SubregionCategory = z.infer<typeof subregionCategorySchema>;
export type Settlement = z.infer<typeof settlementSchema>;
export type DistrictType = z.infer<typeof districtTypeSchema>;
export type District = z.infer<typeof districtSchema>;
export type Ancestry = z.infer<typeof ancestrySchema>;
export type NpcRole = z.infer<typeof npcRoleSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type NPC = z.infer<typeof npcSchema>;
export type Rival = z.infer<typeof rivalSchema>;
export type WorldState = z.infer<typeof worldStateSchema>;

// Part 5 types
export type CombatMove = z.infer<typeof combatMoveSchema>;
export type Stance = z.infer<typeof stanceSchema>;
export type RiteType = z.infer<typeof riteTypeSchema>;
export type WoundTag = z.infer<typeof woundTagSchema>;
export type InjuryState = z.infer<typeof injuryStateSchema>;
export type EnemyArchetype = z.infer<typeof enemyArchetypeSchema>;
export type Combatant = z.infer<typeof combatantSchema>;
export type CombatState = z.infer<typeof combatStateSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;

// Part 6 types
export type ContractSource = z.infer<typeof contractSourceSchema>;
export type ApproachLane = z.infer<typeof approachLaneSchema>;
export type ContractStep = z.infer<typeof contractStepSchema>;
export type Contract = z.infer<typeof contractSchema>;
export type Meters = z.infer<typeof metersSchema>;
export type TavernTable = z.infer<typeof tavernTableSchema>;

// Part 7 types
export type StaffRole = z.infer<typeof staffRoleSchema>;
export type RosterSlot = z.infer<typeof rosterSlotSchema>;
export type Recruit = z.infer<typeof recruitSchema>;
export type ArmyState = z.infer<typeof armyStateSchema>;
export type BetrayalRisk = z.infer<typeof betrayalRiskSchema>;

// Part 8 types
export type ArchetypeId = z.infer<typeof archetypeIdSchema>;
export type RivalId = z.infer<typeof rivalIdSchema>;
export type CultureRegion = z.infer<typeof cultureRegionSchema>;
export type LearningStyle = z.infer<typeof learningStyleSchema>;
export type MasteryState = z.infer<typeof masteryStateSchema>;
export type TrialState = z.infer<typeof trialStateSchema>;

// === CONSTANTS FOR TIERS ===

export const ROLE_NAMES = {
  SPYMASTER: "Spymaster",
  COMMANDER: "Commander",
  STEWARD: "Steward",
  ARBITOR: "Arbitor",
} as const;

export const TIER_TITLES = {
  SPYMASTER: [
    "Ink-Cut Initiate", "Listener", "Handler", "Web-Builder", "Veil-Crafter",
    "Network Captain", "Shadow Chancellor", "Black Ledger Keeper", "Silent Regent", "Master of Threads"
  ],
  COMMANDER: [
    "Field-Capable Scholar", "Banner Spark", "Raid Planner", "Captain of Steel", "Road-Taker",
    "Warden of Camps", "Clan Broker", "War-Organizer", "War-Authority", "War-Myth"
  ],
  STEWARD: [
    "Ledgerhand", "Quartermaster", "Mediator", "Workshop Patron", "Tax & Mercy",
    "Market Architect", "District Reformer", "Infrastructure Lord", "Regional Steward", "Prosperity Engine"
  ],
  ARBITOR: [
    "Petitioner", "Oath Reader", "Witness Binder", "Judgment Clerk", "Circuit Judge",
    "High Arbitor", "Authority of Record", "Balancer", "Arbitor of the Mainland", "Seat of Judgment"
  ],
};

// === SLATE ACRONYM MAPPING ===
export const SLATE_MAPPING = {
  S: { letter: "Spy Network", primaryRole: "Spymaster" },
  L: { letter: "Law & Order", primaryRole: "Arbitor" },
  A: { letter: "Armies", primaryRole: "Commander" },
  T: { letter: "Territory", primaryRole: "Commander" },
  E: { letter: "Enterprise & Industry", primaryRole: "Steward" },
} as const;

// === PART 5: COMBAT CONSTANTS ===
export const COMBAT_MOVES = {
  STRIKE: { name: "Strike", description: "Deal damage; scales with weapon/rite", icon: "sword" },
  GUARD: { name: "Guard", description: "Reduce incoming damage; mitigate injury", icon: "shield" },
  STEP: { name: "Step", description: "Reposition; break 'pinned' status", icon: "footprints" },
  BIND: { name: "Bind", description: "Grapple/snare; create openings", icon: "link" },
  INVOKE: { name: "Invoke", description: "Cast a rite (ward/attack/heal/curse)", icon: "sparkles" },
  FEINT: { name: "Feint", description: "Accuracy swing; reveal stance; dirty tactic", icon: "eye" },
  RALLY: { name: "Rally", description: "Buff/cleanse; stabilize injury; crowd favor", icon: "flag" },
} as const;

export const STANCES = {
  BALANCED: { name: "Balanced", hitMod: 0, critMod: 0, damageTakenMod: 0, controlResist: 0, injuryRiskMod: 0 },
  AGGRESSIVE: { name: "Aggressive", hitMod: 10, critMod: 15, damageTakenMod: 10, controlResist: -5, injuryRiskMod: 15 },
  DEFENSIVE: { name: "Defensive", hitMod: -5, critMod: -10, damageTakenMod: -20, controlResist: 10, injuryRiskMod: -10 },
  EVASIVE: { name: "Evasive", hitMod: -10, critMod: 0, damageTakenMod: -10, controlResist: -10, injuryRiskMod: 0 },
  FOCUSED: { name: "Focused", hitMod: 5, critMod: 5, damageTakenMod: 0, controlResist: -15, injuryRiskMod: 5 },
} as const;

export const RITE_CATEGORIES = {
  WARD: { name: "Ward", effects: ["Shield Pulse", "Cleanse Curse", "Barrier Weave"] },
  SUNDER: { name: "Sunder", effects: ["Armor Break", "Stagger Blast", "Ground Crack"] },
  GLAMOUR: { name: "Glamour", effects: ["Fear Wave", "Misdirection", "Secret Reveal"] },
  VIGOR: { name: "Vigor", effects: ["Heal Surge", "Stamina Boost", "Injury Mend"] },
  SIGIL: { name: "Sigil", effects: ["Binding Oath", "Proof Seal", "Chain Invoke"] },
} as const;

export const ENEMY_ARCHETYPES = {
  BRUISER: { name: "Bruiser", hp: 40, damage: 12, defense: 5, speed: 2 },
  SKIRMISHER: { name: "Skirmisher", hp: 25, damage: 8, defense: 2, speed: 8 },
  HEXER: { name: "Hexer", hp: 20, damage: 6, defense: 1, speed: 4, magic: true },
  SHIELDBEARER: { name: "Shieldbearer", hp: 35, damage: 6, defense: 12, speed: 2 },
  SNARER: { name: "Snarer", hp: 22, damage: 5, defense: 3, speed: 5, control: true },
  DUELIST: { name: "Duelist", hp: 28, damage: 10, defense: 4, speed: 6 },
  SWARM: { name: "Swarm", hp: 15, damage: 4, defense: 0, speed: 7, count: 3 },
} as const;

// === PART 6: CONTRACT CONSTANTS ===
export const APPROACH_LANES = {
  SHADOW: { name: "Shadow Lane", axis: "S", description: "Covert, leverage-heavy, Heat risk", color: "purple" },
  SEAL: { name: "Seal Lane", axis: "L", description: "Proof/witness-heavy, legitimacy gain", color: "amber" },
  STEEL: { name: "Steel Lane", axis: "A", description: "Forceful, capacity/injury risk", color: "red" },
} as const;

export const CONTRACT_SOURCES = {
  BROKER: { name: "Broker", quality: 1.0, variety: 0.8 },
  GUILD: { name: "Guild", quality: 1.2, variety: 0.6 },
  CLAN: { name: "Clan", quality: 0.9, variety: 0.9 },
  SYNDICATE: { name: "Syndicate", quality: 1.3, variety: 1.0, heatRisk: true },
} as const;

// === PART 7: STAFF ROLE CONSTANTS ===
export const STAFF_ROLES = {
  SCOUT: { name: "Scout", bonus: "Shadow lane success +15%, ambush risk -20%" },
  BROKER: { name: "Broker", bonus: "Better contract offers, reduced costs" },
  DELEGATE: { name: "Delegate", bonus: "Unrest -10%, Seal lane success +10%" },
  QUARTERMASTER: { name: "Quartermaster", bonus: "Injury severity -1, Steel lane logistics +15%" },
  INSTRUCTOR: { name: "Instructor", bonus: "Combat training buffs, stance mastery unlock" },
  SCRIBE: { name: "Scribe", bonus: "Ledger Seal proofs +20%, proof failure -15%" },
  HANDLER: { name: "Handler", bonus: "Ops efficiency +20%, Heat from covert -15%" },
  RECRUITER: { name: "Recruiter", bonus: "Recruit chance +25%, reveal hidden paths" },
} as const;
