import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We are using LocalStorage for this prototype, but we define the schemas here
// for type safety and consistent validation across the application.

// === GAME STATE SCHEMA ===

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
  type: z.enum(["CONTRACT", "TIER_UP", "SYSTEM", "CRISIS"]),
});

export const gameStateSchema = z.object({
  resources: resourcesSchema,
  roles: rolesSchema,
  flags: flagsSchema,
  counters: countersSchema,
  historyLog: z.array(logEntrySchema),
});

export type GameState = z.infer<typeof gameStateSchema>;
export type Resources = z.infer<typeof resourcesSchema>;
export type Roles = z.infer<typeof rolesSchema>;
export type Flags = z.infer<typeof flagsSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;

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
