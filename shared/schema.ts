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
  type: z.enum(["CONTRACT", "TIER_UP", "SYSTEM", "CRISIS", "NPC", "WORLD"]),
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

// === COMBINED GAME STATE ===
export const gameStateSchema = z.object({
  resources: resourcesSchema,
  roles: rolesSchema,
  flags: flagsSchema,
  counters: countersSchema,
  historyLog: z.array(logEntrySchema),
  world: worldStateSchema,
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
