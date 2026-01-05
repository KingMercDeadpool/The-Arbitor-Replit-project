import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// THE ARBITER OF CROWNHEIM - Complete Type System
// Version 1.0.0 - Full rewrite based on design document
// ============================================================================

// === GAME IDENTITY ===
export const GAME_VERSION = "1.0";
export const STORAGE_KEY = "arbiter_crownheim_save_v1";
export const OLD_STORAGE_KEYS = ["arbitor_mainland_save_v07", "slate_sandbox_save_v2", "slate_sandbox_save"];

// ============================================================================
// PART 1: PROGRESSION AND ROLES
// ============================================================================

// Unified tier progression (1-10)
export const tierSchema = z.number().min(1).max(10);

// Experience points for tier advancement (exponential: 100 * 1.5^tier)
export const TIER_XP_REQUIREMENTS = [
  0,      // Tier 1 (starting)
  100,    // Tier 2
  150,    // Tier 3
  225,    // Tier 4
  338,    // Tier 5
  506,    // Tier 6
  759,    // Tier 7
  1139,   // Tier 8
  1709,   // Tier 9 (Arbiter unlock possible)
  2563    // Tier 10 (Full Arbiter authority)
] as const;

// XP source values
export const XP_SOURCES = {
  CONTRACT_BASE: 30,
  CONTRACT_PER_TIER: 10,
  COMBAT_STANDARD: 15,
  COMBAT_RIVAL: 30,
  ESPIONAGE_BASE: 25,
  TERRITORY_CAPTURE: 50,
  ENTERPRISE_MILESTONE: 10,
} as const;

// Precedent Tag for judicial consistency tracking
export const precedentTagSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  category: z.enum([
    "MERCY", "SEVERITY", "FAIRNESS", "BIAS",
    "THOROUGH", "HASTY", "CORRUPT", "PRINCIPLED"
  ]),
  description: z.string(),
  context: z.string(), // What decision led to this tag
  validated: z.boolean(), // Whether events later proved the judgment correct
});

// Arbiter qualification tracking
export const arbiterQualificationSchema = z.object({
  selflessnessScore: z.number().min(0).max(100), // Hidden score, needs >80
  precedentTags: z.array(precedentTagSchema),
  endorsements: z.array(z.string()), // NPC IDs who endorse for Arbiter
  consistencyScore: z.number().min(0).max(100), // Calculated from precedent tag patterns
  qualificationMet: z.boolean(),
  judgmentContractsCompleted: z.number(),
  judgmentContractsOverturned: z.number(), // Judgments later proven wrong
});

// Role tier titles
export const ROLE_NAMES = {
  SPYMASTER: "Spymaster",
  COMMANDER: "Commander",
  STEWARD: "Steward",
  ARBITER: "Arbiter",
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
  ARBITER: [
    "Petitioner", "Oath Reader", "Witness Binder", "Judgment Clerk", "Circuit Judge",
    "High Arbiter", "Authority of Record", "Balancer", "Arbiter of Crownheim", "Seat of Judgment"
  ],
} as const;

// Progression state
export const progressionSchema = z.object({
  tier: tierSchema,
  experience: z.number().min(0),
  arbiterQualification: arbiterQualificationSchema,
});

// ============================================================================
// PART 2: WORLD BIBLE (CROWNHEIM)
// ============================================================================

// Five biomes as per design document
export const biomeSchema = z.enum([
  "JUNGLE",           // Western Reaches - Greenfang Confederacy
  "DESERT",           // Southeastern Expanse - Sandstone Coalition
  "FOREST",           // Northern Territories - Oakshield Alliance
  "BAMBOO_RAINFOREST", // Central Crownheim - Mei Shadowstep's network
  "MOUNTAINS"         // Eastern Spine - Stone Brotherhood
]);

// Political nomenclature - reveals factional alignment
export const nomenclatureSchema = z.enum([
  "CROWNHEIM",  // Coalition Common loyalists
  "KRAGBRUD",   // Moktar's faction
  "NEUTRAL"     // Code-switches based on audience
]);

// Regional warlords
export const warlordSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  biome: biomeSchema,
  confederacy: z.string(),
  politicalStance: z.enum(["DEFIANT", "ALLIED", "OPPOSED", "NEUTRAL", "CAUTIOUS"]),
  nomenclature: nomenclatureSchema,
  threeMarksEmphasis: z.object({
    strength: z.number().min(0).max(100),
    mind: z.number().min(0).max(100),
    stewardship: z.number().min(0).max(100),
  }),
  description: z.string(),
});

// Three Marks cultural framework
export const threeMarksSchema = z.object({
  strength: z.number().min(0).max(100),  // Martial prowess, courage, protection
  mind: z.number().min(0).max(100),      // Strategic thinking, knowledge, judgment
  stewardship: z.number().min(0).max(100), // Resource management, welfare, infrastructure
});

// Settlement population sizes
export const populationSizeSchema = z.enum(["HAMLET", "VILLAGE", "TOWN", "CITY"]);

// Settlement subregion categories
export const subregionCategorySchema = z.enum([
  "RESOURCE_EXTRACTION",  // Mines, farms, raw materials
  "TRADE_HUB",           // Markets, caravans, merchants
  "MILITARY_FRONTIER",   // Fortresses, garrison posts
  "SACRED_GROUNDS",      // Temples, religious sites
  "ADMINISTRATIVE"       // Knowledge, governance centers
]);

// Settlement definition
export const settlementSchema = z.object({
  id: z.string(),
  name: z.string(),
  biome: biomeSchema,
  subregionCategory: subregionCategorySchema,
  population: populationSizeSchema,
  warlordId: z.string().optional(), // Which warlord controls this area
  description: z.string(),
  culturalTaboo: z.string().optional(),
  witnessTradition: z.string().optional(),
  threeMarksWeight: threeMarksSchema.optional(), // How this settlement weighs the marks
  unrest: z.number().min(0).max(100).default(0),
  playerControlled: z.boolean().default(false),
});

// ============================================================================
// PART 3: DISTRICTS AND PEOPLES
// ============================================================================

// The Seven Ancestries
export const ancestrySchema = z.enum([
  "HUMAN",
  "ELF",
  "DWARF",
  "ORC",
  "HALFLING",
  "TIEFLING",
  "FAE",
  "GOBLIN",
  "MIXED"
]);

// District types - ancestry enclaves and functional districts
export const districtTypeSchema = z.enum([
  // Ancestry Enclaves
  "ELVEN_ENCLAVE",      // No black market (cultural consensus)
  "HALFLING_QUARTER",   // No black market (risk averse)
  "DWARVEN_WORKS",      // Workshop district
  "ORCISH_WARD",        // Traditional orc housing
  "TIEFLING_REFUGE",    // Mutual protection clustering
  "FAE_COURT",          // Political/cultural center
  "GOBLIN_WARREN",      // Dense, space-efficient
  // Functional Districts
  "HUMAN_COMMONS",      // General housing
  "MIXED_MARKET",       // Trade district
  "DOCKS",              // Harbor/shipping
  "CRAFTSMAN",          // Artisan workshops
  "TEMPLE",             // Religious district
  "GARRISON",           // Military district
  "ENTERTAINMENT",      // Taverns, pit fights
  "SLUMS"               // Poor district
]);

// District definition
export const districtSchema = z.object({
  id: z.string(),
  name: z.string(),
  settlementId: z.string(),
  type: districtTypeSchema,
  hasBlackMarket: z.boolean(), // False for Elven and Halfling districts
  description: z.string(),
  dominantAncestry: ancestrySchema.optional(),
  wealthLevel: z.enum(["POOR", "MODEST", "COMFORTABLE", "WEALTHY", "ELITE"]).default("MODEST"),
  crimeLevel: z.number().min(0).max(100).default(20),
  playerInfluence: z.number().min(0).max(100).default(0),
});

// ============================================================================
// PART 4: NPC AND RIVAL ENGINE
// ============================================================================

// NPC types
export const npcTypeSchema = z.enum([
  "RIVAL",      // Major antagonist
  "SPONSOR",    // Provides support/resources
  "TRAINER",    // Teaches skills
  "MERCHANT",   // Buys/sells goods
  "INFORMANT",  // Provides intelligence
  "ARTISAN",    // Crafts items
  "GUARD",      // Security/military
  "NOBLE",      // Political power
  "PRIEST",     // Religious authority
  "CRIMINAL",   // Underworld connections
  "TRAVELER",   // Moving between settlements
  "SCHOLAR"     // Knowledge/research
]);

// Personality traits pool (15 traits)
export const personalityTraitSchema = z.enum([
  "AMBITIOUS", "CAUTIOUS", "CUNNING", "HONORABLE", "GREEDY",
  "LOYAL", "TREACHEROUS", "PROUD", "HUMBLE", "CRUEL",
  "MERCIFUL", "PRAGMATIC", "IDEALISTIC", "PATIENT", "IMPULSIVE"
]);

// Relationship metrics (Trust, Fear, Debt)
export const relationshipSchema = z.object({
  trust: z.number().min(0).max(100).default(0),    // Reliability confidence
  fear: z.number().min(0).max(100).default(0),     // Threat assessment
  debt: z.number().min(0).max(5).default(0),       // Obligations owed (instances)
  // Derived/legacy fields for compatibility
  leverage: z.number().min(0).max(100).default(0),
  standing: z.number().min(-100).max(100).default(0),
});

// Relationship state matrix
export const relationshipStateSchema = z.enum([
  "ALLIANCE",    // High Trust + Low Fear
  "TERRIFIED",   // Low Trust + High Fear
  "CONFLICTED",  // High Trust + High Fear
  "NEUTRAL"      // Low Trust + Low Fear
]);

// NPC definition
export const npcSchema = z.object({
  id: z.string(),
  name: z.string(),
  ancestry: ancestrySchema,
  type: npcTypeSchema,
  tier: tierSchema,
  traits: z.array(personalityTraitSchema).max(3),
  districtId: z.string().optional(),
  settlementId: z.string().optional(),
  isTraveler: z.boolean().default(false),
  nomenclature: nomenclatureSchema, // Political alignment revealed through speech
  description: z.string(),
  // Recruitment requirements
  recruitmentRequirements: z.object({
    minTrust: z.number().default(70),
    minFear: z.number().optional(), // Alternative: Fear >= 80
    minTier: z.number().default(1),
    forbiddenFlags: z.array(z.string()).optional(),
    requiredFlags: z.array(z.string()).optional(),
    contextualRequirement: z.string().optional(),
  }),
  recruited: z.boolean().default(false),
  // Memory/state
  interactionCount: z.number().default(0),
  lastInteractionTimestamp: z.number().optional(),
});

// Rival stage progression
export const rivalStageSchema = z.enum([
  "INTRODUCTION",  // First encounter
  "ESCALATION_1",  // After first defeat
  "ESCALATION_2",  // After second defeat
  "ESCALATION_3",  // After third defeat
  "CRISIS",        // Execute or Mercy decision point
  "DEFEATED",      // Permanently eliminated
  "RECRUITED"      // Recruited through mercy
]);

// Major rival definition
export const rivalSchema = z.object({
  id: z.string(),
  name: z.string(),
  ancestry: ancestrySchema,
  title: z.string(),
  stage: rivalStageSchema,
  defeatsCount: z.number().min(0).max(3).default(0),
  description: z.string(),
  biome: biomeSchema, // Primary operating region
  nomenclature: nomenclatureSchema,
  combatStyle: z.string(), // Preferred tactics
  weakness: z.string(), // Exploitable in combat
  escalationTriggers: z.array(z.string()),
  currentThreat: z.string(),
  relationship: relationshipSchema.optional(),
});

// ============================================================================
// PART 5: COMBAT SYSTEM
// ============================================================================

// Seven core combat moves
export const combatMoveSchema = z.enum([
  "STRIKE",   // 30 base damage, 5 stamina
  "FEINT",    // Force enemy neutral, 10 stamina
  "GUARD",    // Shift to defensive, 0 stamina
  "PRESS",    // Shift to aggressive, 0 stamina
  "RITE",     // Cast spell, 15-40 stamina
  "ITEM",     // Use consumable, 0 stamina (negative crowd)
  "FLEE"      // Escape attempt, 15 stamina, 70% success
]);

export const COMBAT_MOVES = {
  STRIKE: { name: "Strike", damage: 30, stamina: 5, description: "Standard damage attack" },
  FEINT: { name: "Feint", damage: 0, stamina: 10, description: "Force enemy to neutral stance" },
  GUARD: { name: "Guard", damage: 0, stamina: 0, description: "Shift to defensive stance" },
  PRESS: { name: "Press", damage: 0, stamina: 0, description: "Shift to aggressive stance" },
  RITE: { name: "Rite", damage: 0, stamina: 20, description: "Cast learned spell (15-40 stamina)" },
  ITEM: { name: "Item", damage: 0, stamina: 0, description: "Use consumable (negative crowd reaction)" },
  FLEE: { name: "Flee", damage: 0, stamina: 15, description: "Escape attempt (70% success)" },
} as const;

// Stance triangle: Aggressive > Defensive > Neutral > Aggressive
export const stanceSchema = z.enum([
  "AGGRESSIVE",  // Beats Defensive (+50% damage, no counter)
  "DEFENSIVE",   // Beats Neutral (+50% damage, no counter)
  "NEUTRAL"      // Beats Aggressive (+50% damage, no counter)
]);

export const STANCE_ADVANTAGES = {
  AGGRESSIVE: "DEFENSIVE",  // Aggressive beats Defensive
  DEFENSIVE: "NEUTRAL",     // Defensive beats Neutral
  NEUTRAL: "AGGRESSIVE",    // Neutral beats Aggressive
} as const;

export const STANCE_DISADVANTAGE_PENALTY = {
  damageMultiplier: 0.7,    // -30% damage
  counterDamage: 15,        // 15-point counter-attack
} as const;

// Four rite categories
export const riteCategorySchema = z.enum([
  "DESTRUCTION",  // Damage spells
  "RESTORATION",  // Healing spells
  "PROTECTION",   // Defensive spells
  "CONTROL"       // Status effect spells
]);

export const riteSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: riteCategorySchema,
  stamina: z.number().min(15).max(40),
  damage: z.number().optional(),
  healing: z.number().optional(),
  effect: z.string(),
  description: z.string(),
});

export const RITES = {
  // Destruction
  FIREBOLT: { id: "firebolt", name: "Firebolt", category: "DESTRUCTION", stamina: 15, damage: 40, effect: "none", description: "40 damage fire attack" },
  LIGHTNING_STRIKE: { id: "lightning_strike", name: "Lightning Strike", category: "DESTRUCTION", stamina: 25, damage: 50, effect: "stun", description: "50 damage + stun" },
  ICE_SHARD: { id: "ice_shard", name: "Ice Shard", category: "DESTRUCTION", stamina: 20, damage: 35, effect: "slow", description: "35 damage + slow" },
  // Restoration
  HEAL_WOUNDS: { id: "heal_wounds", name: "Heal Wounds", category: "RESTORATION", stamina: 20, healing: 30, effect: "none", description: "Restore 30 HP" },
  CURE_POISON: { id: "cure_poison", name: "Cure Poison", category: "RESTORATION", stamina: 15, effect: "cure_poison", description: "Remove poison status" },
  REVIVE: { id: "revive", name: "Revive", category: "RESTORATION", stamina: 40, healing: 50, effect: "add_injury", description: "Restore 50 HP but adds injury" },
  // Protection
  SHIELD: { id: "shield", name: "Shield", category: "PROTECTION", stamina: 15, effect: "temp_hp_20", description: "20 temporary HP" },
  HASTE: { id: "haste", name: "Haste", category: "PROTECTION", stamina: 25, effect: "extra_action", description: "+1 action next turn" },
  STONESKIN: { id: "stoneskin", name: "Stoneskin", category: "PROTECTION", stamina: 20, effect: "damage_reduction_50", description: "50% damage reduction" },
  // Control
  SLOW: { id: "slow", name: "Slow", category: "CONTROL", stamina: 20, effect: "reduce_action", description: "-1 enemy action" },
  SILENCE: { id: "silence", name: "Silence", category: "CONTROL", stamina: 25, effect: "no_rites_2", description: "No rites for 2 turns" },
  FEAR: { id: "fear", name: "Fear", category: "CONTROL", stamina: 30, effect: "force_defensive_no_attack", description: "Force defensive, prevent attacks" },
} as const;

// Injury system (0-4 levels)
export const injuryLevelSchema = z.number().min(0).max(4);

export const INJURY_EFFECTS = {
  0: { name: "None", effect: "No penalty" },
  1: { name: "Cosmetic", effect: "Visible marks, no mechanical penalty" },
  2: { name: "Impaired", effect: "-1 action per turn" },
  3: { name: "Severe", effect: "-1 action + movement restriction" },
  4: { name: "Critical", effect: "Combat ineffective" },
} as const;

// Wound tags
export const woundTagSchema = z.enum([
  "BLEEDING",   // -3 HP/turn
  "LIMPING",    // No Flee
  "DAZED",      // No Rites
  "WEAKENED",   // -50% damage
  "BROKEN",     // Stance locked
  "POISONED"    // -5 HP/turn, -10 max stamina
]).nullable();

export const WOUND_TAG_EFFECTS = {
  BLEEDING: { name: "Bleeding", hpPerTurn: -3, description: "-3 HP per turn" },
  LIMPING: { name: "Limping", canFlee: false, description: "Cannot use Flee" },
  DAZED: { name: "Dazed", canRite: false, description: "Cannot use Rites" },
  WEAKENED: { name: "Weakened", damageMultiplier: 0.5, description: "-50% damage" },
  BROKEN: { name: "Broken", stanceLocked: true, description: "Stance locked" },
  POISONED: { name: "Poisoned", hpPerTurn: -5, maxStaminaReduction: 10, description: "-5 HP/turn, -10 max stamina" },
} as const;

export const injuryStateSchema = z.object({
  level: injuryLevelSchema,
  woundTag: woundTagSchema,
});

// Enemy archetypes
export const enemyArchetypeSchema = z.enum([
  "BRUISER",      // High HP/damage, low speed
  "SKIRMISHER",   // High speed, low defense
  "HEXER",        // Magic focused
  "SHIELDBEARER", // High defense
  "SNARER",       // Control focused
  "DUELIST",      // Balanced, high skill
  "SWARM"         // Multiple weak units
]);

export const ENEMY_ARCHETYPES = {
  BRUISER: { hp: 40, damage: 12, defense: 5, speed: 2, special: "Heavy attacks" },
  SKIRMISHER: { hp: 25, damage: 8, defense: 2, speed: 8, special: "Hit and run" },
  HEXER: { hp: 20, damage: 6, defense: 1, speed: 4, special: "Rite caster" },
  SHIELDBEARER: { hp: 35, damage: 6, defense: 12, speed: 2, special: "Guard expert" },
  SNARER: { hp: 22, damage: 5, defense: 3, speed: 5, special: "Control abilities" },
  DUELIST: { hp: 28, damage: 10, defense: 4, speed: 6, special: "Stance mastery" },
  SWARM: { hp: 15, damage: 4, defense: 0, speed: 7, special: "Count: 3 units" },
} as const;

// Combatant state
export const combatantSchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number(),
  maxHp: z.number(),
  stamina: z.number(),
  maxStamina: z.number(),
  stance: stanceSchema,
  archetype: enemyArchetypeSchema.optional(),
  isPlayer: z.boolean(),
  injury: injuryStateSchema.optional(),
  statusEffects: z.array(z.string()).default([]),
});

// Full combat state
export const combatStateSchema = z.object({
  active: z.boolean(),
  isPitFight: z.boolean(),
  isRivalFight: z.boolean().default(false),
  rivalId: z.string().optional(),
  turn: z.number(),
  player: combatantSchema,
  enemies: z.array(combatantSchema),
  allies: z.array(combatantSchema).default([]),
  crowdFavor: z.number().min(0).max(100).default(50),
  publicEncounter: z.boolean(), // Affects Legitimacy
  lastAction: z.string().optional(),
  dirtyTacticsUsed: z.boolean().default(false),
  itemsUsed: z.number().default(0),
});

// Pit fight types
export const pitFightTypeSchema = z.enum([
  "RANKED",     // Advance standing, build Crowd Favor
  "GRUDGE",     // Resolve rivalries, 2x XP
  "SPONSORED"   // NPC conditions, bonus rewards
]);

// Crowd Favor thresholds
export const CROWD_FAVOR_THRESHOLDS = {
  FAN_CONTRACTS: 50,
  NOBLE_SPONSORSHIPS: 75,
  CHAMPION_STATUS: 100,
  CHAMPION_LEGITIMACY_MULTIPLIER: 1.5,
} as const;

// ============================================================================
// PART 6: CONTRACTS AND QUEST ENGINE (S.L.A.T.E.)
// ============================================================================

// Contract sources
export const contractSourceSchema = z.enum([
  "BROKER",     // Neutral, quality 1.0, variety 0.8
  "GUILD",      // Specialized, quality 1.2, variety 0.6
  "CLAN",       // Factional, quality 0.9, variety 0.9
  "SYNDICATE",  // Illicit, quality 1.3, variety 1.0, heat risk
  "WARLORD"     // High-stakes, quality 1.5, variety 0.7
]);

export const CONTRACT_SOURCE_STATS = {
  BROKER: { quality: 1.0, variety: 0.8, heatRisk: false },
  GUILD: { quality: 1.2, variety: 0.6, heatRisk: false },
  CLAN: { quality: 0.9, variety: 0.9, heatRisk: false },
  SYNDICATE: { quality: 1.3, variety: 1.0, heatRisk: true },
  WARLORD: { quality: 1.5, variety: 0.7, heatRisk: false },
} as const;

// Contract objectives (6 types)
export const contractObjectiveSchema = z.enum([
  "INFILTRATION",   // Steal, sabotage, plant evidence
  "INVESTIGATION",  // Gather evidence, uncover truth
  "ELIMINATION",    // Remove target (lethal or non-lethal)
  "ACQUISITION",    // Obtain resource, artifact, person
  "DEFENSE",        // Protect location, person, asset
  "EXPANSION"       // Claim territory, establish presence
]);

// Contract complications (8 types)
export const contractComplicationSchema = z.enum([
  "TIME_PRESSURE",         // Must complete quickly
  "WITNESS_RESTRICTIONS",  // Must avoid/ensure witnesses
  "GUARD_PRESENCE",        // Security to bypass
  "FACTIONAL_INTERFERENCE", // Third party involvement
  "RESOURCE_SCARCITY",     // Limited supplies/tools
  "ETHICAL_DILEMMA",       // Moral choice required
  "RIVAL_INTERVENTION",    // Major rival complicates
  "CIVILIAN_PRESENCE"      // Innocents at risk
]);

// S.L.A.T.E. pillars
export const slatePillarSchema = z.enum([
  "S",  // Spy Network
  "L",  // Law & Order
  "A",  // Armies
  "T",  // Territory
  "E"   // Enterprise & Industry
]);

export const SLATE_MAPPING = {
  S: { name: "Spy Network", primaryRole: "Spymaster", contracts: ["INFILTRATION", "INVESTIGATION", "INTERROGATION", "COUNTERINTELLIGENCE"] },
  L: { name: "Law & Order", primaryRole: "Arbiter", contracts: ["DUEL_ADJUDICATION", "JUDGMENT", "ENFORCEMENT", "PRECEDENT"] },
  A: { name: "Armies", primaryRole: "Commander", contracts: ["RECRUITMENT", "TRAINING", "CHAMPION_DUEL", "RAIDING"] },
  T: { name: "Territory", primaryRole: "Commander", contracts: ["CAPTURE", "DEFENSE", "INFRASTRUCTURE", "GOVERNANCE"] },
  E: { name: "Enterprise & Industry", primaryRole: "Steward", contracts: ["TRADE_ROUTE", "EXTRACTION", "MARKET", "CORRUPTION"] },
} as const;

// Approach lanes (3 types)
export const approachLaneSchema = z.enum([
  "FORCE",    // Combat-based, fast, generates witness exposure
  "STEALTH",  // Covert, slower, minimal Legitimacy, catastrophic if detected
  "SOCIAL"    // Relationship-based, cleanest, requires prior investment
]);

export const APPROACH_LANES = {
  FORCE: { name: "Force", description: "Combat-based resolution", pros: "Fast", cons: "Witness exposure", color: "red" },
  STEALTH: { name: "Stealth", description: "Covert operations", pros: "Minimal Legitimacy impact", cons: "Catastrophic if detected", color: "purple" },
  SOCIAL: { name: "Social", description: "Relationship-based", pros: "Cleanest resolution", cons: "Requires prior investment", color: "blue" },
} as const;

// Witness strictness levels
export const witnessStrictnessSchema = z.enum([
  "LOW",      // Actions barely noticed
  "MEDIUM",   // Standard attention
  "HIGH"      // Heavy scrutiny
]);

// Contract step
export const contractStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  availableLanes: z.array(approachLaneSchema),
  chosenLane: approachLaneSchema.optional(),
  completed: z.boolean().default(false),
  failed: z.boolean().default(false),
  witnessed: z.boolean().default(false),
  outcome: z.string().optional(),
});

// Full contract definition
export const contractSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  source: contractSourceSchema,
  slatePillar: slatePillarSchema,
  objective: contractObjectiveSchema,
  complications: z.array(contractComplicationSchema),
  settlementId: z.string(),
  districtId: z.string().optional(),
  targetNpcId: z.string().optional(),
  // Steps
  steps: z.array(contractStepSchema),
  currentStep: z.number().default(0),
  // Requirements
  minTier: tierSchema.default(1),
  requiredProofTypes: z.array(z.string()),
  witnessStrictness: witnessStrictnessSchema,
  // Rewards
  rewards: z.object({
    experience: z.number(),
    gold: z.number(),
    legitimacyDelta: z.number(),
    threeMarksBonuses: threeMarksSchema,
    relationshipChanges: z.record(z.string(), z.number()).optional(),
  }),
  // Risks
  risks: z.object({
    heatDelta: z.number(),
    injuryRisk: z.number().min(0).max(100),
    rivalEscalationChance: z.number().min(0).max(100),
  }),
  // Failure handling
  failForwardEnabled: z.boolean().default(false),
  // Status
  status: z.enum(["AVAILABLE", "ACTIVE", "COMPLETED", "FAILED", "ABANDONED"]),
  // Timestamps
  acceptedAt: z.number().optional(),
  completedAt: z.number().optional(),
});

// Heat and meters
export const HEAT_THRESHOLDS = {
  INCREASED_GUARDS: 50,
  RIVAL_PURSUIT: 75,
  WARLORD_ATTENTION: 90,
  DECAY_PER_DAY: 5,
} as const;

export const metersSchema = z.object({
  heat: z.number().min(0).max(100).default(0),
  unrestBySettlement: z.record(z.string(), z.number()),
});

// ============================================================================
// PART 7: RECRUITMENT, STAFF ROLES, AND ARMIES
// ============================================================================

// Field team capacity by tier
export const FIELD_TEAM_CAPACITY = {
  TIER_1: 4,
  TIER_4_WITH_STRONGHOLD: 8,
  TIER_7_WITH_HOLDINGS: 12,
  TIER_9_WITH_FORTRESS: 16,
} as const;

// Staff roles (8 types)
export const staffRoleSchema = z.enum([
  "SCOUT",         // Shadow lane +15%, ambush risk -20%
  "BROKER",        // Better contracts, reduced costs
  "DELEGATE",      // Unrest -10%, Seal lane +10%
  "QUARTERMASTER", // Injury severity -1, logistics +15%
  "INSTRUCTOR",    // Training buffs, stance mastery
  "SCRIBE",        // Proof seals +20%, failure -15%
  "HANDLER",       // Ops efficiency +20%, Heat -15%
  "RECRUITER"      // Recruit chance +25%, hidden paths
]);

export const STAFF_ROLES = {
  SCOUT: { name: "Scout", bonus: "Shadow lane +15%, ambush risk -20%" },
  BROKER: { name: "Broker", bonus: "Better contracts (+10-20% rewards), reduced costs" },
  DELEGATE: { name: "Delegate", bonus: "Unrest -10%, Seal lane +10%" },
  QUARTERMASTER: { name: "Quartermaster", bonus: "Injury severity -1, Steel lane logistics +15%" },
  INSTRUCTOR: { name: "Instructor", bonus: "Training buffs, stance mastery unlock" },
  SCRIBE: { name: "Scribe", bonus: "Proof seals +20%, proof failure -15%" },
  HANDLER: { name: "Handler", bonus: "Ops efficiency +20%, Heat from covert -15%" },
  RECRUITER: { name: "Recruiter", bonus: "Recruit chance +25%, reveal hidden paths" },
} as const;

// Roster slot types
export const rosterSlotSchema = z.enum([
  "FIELD_TEAM",      // Combat support
  "STAFF",           // Organizational roles
  "CHAMPION",        // Elite combat specialist
  "PATRON",          // Income/influence provider
  "QUARTERMASTER_SLOT", // Logistics specialist
  "SPY"              // Intelligence operative
]);

// Recruit entry
export const recruitSchema = z.object({
  npcId: z.string(),
  slot: rosterSlotSchema,
  staffRole: staffRoleSchema.optional(),
  assignedSettlementId: z.string().optional(),
  assignedDistrictId: z.string().optional(),
  loyalty: z.number().min(0).max(100).default(70),
  recruitedAt: z.number(),
});

// Army scaling
export const ARMY_SCALING = {
  INITIAL_TROOPS: 50,       // At tier 3, first site
  PER_RECRUITMENT: { min: 15, max: 30 },
  MASS_RECRUITMENT_TIER: 5, // Hundreds via clan alliances
  ENDGAME_CORE: { min: 500, max: 1000 },
  ENDGAME_ALLIED: { min: 3000, max: 5000 },
} as const;

// Army state
export const armyStateSchema = z.object({
  totalTroops: z.number().min(0).default(0),
  garrisonBySettlement: z.record(z.string(), z.number()),
  readiness: z.number().min(0).max(100).default(50),
  supply: z.number().min(0).max(100).default(50),
  discipline: z.number().min(0).max(100).default(50),
  morale: z.number().min(0).max(100).default(50),
  veteranCount: z.number().min(0).default(0),
});

// Betrayal risk
export const betrayalRiskSchema = z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]);

export const BETRAYAL_THRESHOLDS = {
  NONE: 70,     // Loyalty > 70 = near-zero risk
  LOW: 50,      // Loyalty 50-70 = low risk with warnings
  HIGH: 0,      // Loyalty < 50 = substantial risk
  HANDLER_RATIO: 20, // 1 Handler per 20 personnel
} as const;

// ============================================================================
// PART 8: ENTERPRISE AND INDUSTRY
// ============================================================================

// Industry node types
export const industryNodeTypeSchema = z.enum([
  "RESOURCE_EXTRACTION",  // Mines, farms
  "PROCESSING",           // Smithies, mills
  "TRADE_POST",           // Markets, caravans
  "SERVICE",              // Taverns, training
  "ILLICIT"               // Gambling, smuggling
]);

// Node quality levels
export const nodeQualitySchema = z.enum([
  "BASIC",       // Low efficiency
  "STANDARD",    // Reasonable
  "PREMIUM",     // Superior
  "EXCEPTIONAL"  // Peak, expensive
]);

// Regional goods by biome
export const REGIONAL_GOODS = {
  JUNGLE: ["exotic_hardwoods", "rare_herbs", "wildlife_components", "tropical_fruits"],
  DESERT: ["gemstones", "minerals", "glass", "specialized_textiles"],
  FOREST: ["lumber", "game_meat", "medicinal_herbs", "leather"],
  BAMBOO_RAINFOREST: ["silk", "tea", "bamboo_products", "river_fish"],
  MOUNTAINS: ["ores", "gemstones", "quality_stone", "cold_weather_supplies"],
} as const;

// Market channel types
export const marketChannelSchema = z.enum([
  "LEGAL",   // Licensed, regulated, stable
  "GRAY",    // Informal, semi-legal, +15-30% profit
  "BLACK"    // Smuggling, maximum profit, heat/legitimacy risk
]);

export const MARKET_CHANNEL_EFFECTS = {
  LEGAL: { profitMultiplier: 1.0, heatRisk: 0, legitimacyRisk: 0 },
  GRAY: { profitMultiplier: 1.25, heatRisk: 10, legitimacyRisk: 5 },
  BLACK: { profitMultiplier: 2.0, heatRisk: 30, legitimacyRisk: 20 },
} as const;

// Industry node
export const industryNodeSchema = z.object({
  id: z.string(),
  type: industryNodeTypeSchema,
  quality: nodeQualitySchema,
  settlementId: z.string(),
  districtId: z.string().optional(),
  goods: z.array(z.string()),
  marketChannel: marketChannelSchema,
  dailyIncome: z.number(),
  operatingCost: z.number(),
  workerCount: z.number(),
  // State
  active: z.boolean().default(true),
  efficiency: z.number().min(0).max(100).default(100),
  lastCollectedAt: z.number().optional(),
});

// Supply chain link
export const supplyChainLinkSchema = z.object({
  fromNodeId: z.string(),
  toNodeId: z.string(),
  goodType: z.string(),
  valueAtSource: z.number(),
  valueAtDestination: z.number(),
  transportCost: z.number(),
  securityRisk: z.number().min(0).max(100),
});

// Corruption temptation types
export const corruptionTypeSchema = z.enum([
  "EXPLOITATION",      // Underpay workers, +15-30%, damages Stewardship
  "MONOPOLY",          // Exclude competitors, massive profit, damages Influence
  "SMUGGLING",         // Prohibited goods, premium, generates heat, damages Honor
  "PROTECTION_RACKET"  // Extortion, passive income, catastrophic legitimacy
]);

export const CORRUPTION_EFFECTS = {
  EXPLOITATION: { profitBonus: 0.25, stewardshipDamage: 15, description: "Underpay workers for +15-30% profit" },
  MONOPOLY: { profitBonus: 0.5, influenceDamage: 25, description: "Exclude competitors for massive profit" },
  SMUGGLING: { profitBonus: 0.75, heatGenerated: 20, honorDamage: 20, description: "Smuggle prohibited goods" },
  PROTECTION_RACKET: { passiveIncome: 50, legitimacyDamage: 40, description: "Extortion for passive income" },
} as const;

// Gambling den (dual purpose: profit + intelligence)
export const gamblingDenSchema = z.object({
  nodeId: z.string(),
  districtId: z.string(),
  dailyIncome: z.number(), // 5-10g (poor) to 100+g (premium)
  intelligenceGatheringRate: z.number().min(0).max(100),
  patronsKnown: z.array(z.string()), // NPC IDs of regulars
  informantsPlanted: z.number(),
});

// Enterprise state
export const enterpriseStateSchema = z.object({
  nodes: z.array(industryNodeSchema),
  supplyChains: z.array(supplyChainLinkSchema),
  gamblingDens: z.array(gamblingDenSchema),
  totalDailyIncome: z.number(),
  totalOperatingCosts: z.number(),
  corruptionActive: z.array(corruptionTypeSchema),
});

// ============================================================================
// PART 9: TERRITORY CONTROL
// ============================================================================

// Site types
export const siteTypeSchema = z.enum([
  "CAMP",       // 20-50 personnel, wooden, resource extraction
  "FORT",       // 100-300 troops, stone walls, strategic positions
  "STRONGHOLD"  // 500+ garrison, thousands civilian, massive fortifications
]);

export const SITE_TYPE_STATS = {
  CAMP: { minGarrison: 20, maxGarrison: 50, defenseType: "wooden", income: "low" },
  FORT: { minGarrison: 100, maxGarrison: 300, defenseType: "stone", income: "medium" },
  STRONGHOLD: { minGarrison: 500, maxGarrison: 2000, defenseType: "massive", income: "high" },
} as const;

// Four security layers
export const securityLayerSchema = z.object({
  steel: z.number().min(0).max(100),  // Military force
  stone: z.number().min(0).max(100),  // Physical architecture
  sigil: z.number().min(0).max(100),  // Magical protections
  story: z.number().min(0).max(100),  // Social legitimacy
});

// Capture methods
export const captureMethodSchema = z.enum([
  "ASSAULT",           // Fast, high casualties, infrastructure damage
  "INFILTRATION",      // Low casualties, preserves infrastructure
  "LEGAL_TRANSFER",    // Zero casualties, maximum legitimacy
  "ECONOMIC_PURCHASE", // Zero casualties, requires enormous capital
  "DIPLOMATIC_PACT"    // Superior legitimacy, shared control
]);

export const CAPTURE_METHOD_EFFECTS = {
  ASSAULT: { casualties: "high", infrastructure: "damaged", legitimacyRange: [-40, 25], unrest: [40, 80] },
  INFILTRATION: { casualties: "low", infrastructure: "preserved", legitimacyRange: [-5, 5], unrest: [0, 15] },
  LEGAL_TRANSFER: { casualties: "zero", infrastructure: "preserved", legitimacyRange: [10, 30], unrest: [0, 10] },
  ECONOMIC_PURCHASE: { casualties: "zero", infrastructure: "preserved", legitimacyRange: [-5, 10], unrest: [5, 20] },
  DIPLOMATIC_PACT: { casualties: "zero", infrastructure: "preserved", legitimacyRange: [15, 40], unrest: [0, 5] },
} as const;

// Territorial holding
export const territorialHoldingSchema = z.object({
  id: z.string(),
  settlementId: z.string(),
  siteType: siteTypeSchema,
  captureMethod: captureMethodSchema,
  capturedAt: z.number(),
  // Security
  security: securityLayerSchema,
  // Management
  garrison: z.number(),
  supply: z.number().min(0).max(100),
  law: z.number().min(0).max(100),      // Law enforcement effectiveness
  unrest: z.number().min(0).max(100),
  // Economic
  dailyIncome: z.number(),
  operatingCost: z.number(),
  // State
  underSiege: z.boolean().default(false),
  rebellionRisk: z.number().min(0).max(100).default(0),
});

// Territory state
export const territoryStateSchema = z.object({
  holdings: z.array(territorialHoldingSchema),
  totalSites: z.number(),
  totalGarrison: z.number(),
  averageUnrest: z.number(),
  expansionPressure: z.number().min(0).max(100), // Triggers foreign invasion
});

// ============================================================================
// PART 10: ENDGAME SYSTEMS
// ============================================================================

// Overthrow pathways
export const overthrowPathwaySchema = z.enum([
  "LEGAL_AUTHORITY",      // Tier 9 Arbiter, Legitimacy >90, Council challenge
  "CLAN_CONFEDERATION",   // Trust >70 with 4/5 warlords
  "SPY_NETWORK_DOMINANCE", // 50+ actionable intelligence pieces
  "ECONOMIC_CONTROL",     // 500+g/day passive income
  "DIVINE_JUDGMENT"       // Legitimacy 95+, ritual challenge
]);

export const OVERTHROW_REQUIREMENTS = {
  LEGAL_AUTHORITY: { tier: 9, legitimacy: 90, precedentTags: 15, warlordEndorsements: 3 },
  CLAN_CONFEDERATION: { trustWithWarlords: 70, warlordCount: 4, diplomaticPacts: 3 },
  SPY_NETWORK_DOMINANCE: { intelligencePieces: 50, infiltratedRegions: 5 },
  ECONOMIC_CONTROL: { dailyIncome: 500, tradeRouteControl: 0.6 },
  DIVINE_JUDGMENT: { legitimacy: 95, sacredQuests: 3 },
} as const;

// Watchdog faction types (post-overthrow)
export const watchdogFactionSchema = z.enum([
  "JUDICIAL_COUNCIL",     // Legal Authority path - reviews consistency
  "WARLORD_ASSEMBLY",     // Confederation path - tests autonomy respect
  "TRANSPARENCY_ADVOCATES", // Spy Network path - demands openness
  "LABOR_ORGANIZATIONS",  // Economic path - demands benefit sharing
  "RELIGIOUS_AUTHORITIES" // Divine path - monitors principle adherence
]);

// Power overgrowth threats
export const overgrowthThreatSchema = z.enum([
  "FOREIGN_INVASION",       // 10+ sites, Legitimacy >75
  "INTERNAL_USURPER",       // Tier 10, from player's organization
  "SUPERNATURAL_INTERFERENCE", // Maximum Legitimacy
  "PHILOSOPHICAL_OPPOSITION"  // Sustained governance
]);

// Tyrant path options
export const tyrantPathSchema = z.enum([
  "MILITARY_SUPREMACY",    // Force-based control
  "ECONOMIC_EXTRACTION",   // Maximum wealth generation
  "IDEOLOGICAL_TYRANNY",   // Forced belief system
  "CHAOS_EMBRACE"          // Deliberate destabilization
]);

// Endgame state
export const endgameStateSchema = z.object({
  overthrowPathway: overthrowPathwaySchema.optional(),
  overthrowProgress: z.number().min(0).max(100).default(0),
  overthrowCompleted: z.boolean().default(false),
  watchdogFaction: watchdogFactionSchema.optional(),
  watchdogChallengesPassed: z.number().default(0),
  watchdogChallengesFailed: z.number().default(0),
  activeThreats: z.array(overgrowthThreatSchema),
  tyrantPath: tyrantPathSchema.optional(),
  gameCompleted: z.boolean().default(false),
  completionTimestamp: z.number().optional(),
});

// Perpetual content event types
export const perpetualEventTypeSchema = z.enum([
  "FACTIONAL_CRISIS",
  "ECONOMIC_CYCLE",
  "MILITARY_THREAT",
  "SUPERNATURAL_EVENT"
]);

// ============================================================================
// UNIFIED GAME STATE
// ============================================================================

// Log entry types
export const logTypeSchema = z.enum([
  "CONTRACT", "TIER_UP", "SYSTEM", "CRISIS", "NPC",
  "WORLD", "COMBAT", "SOCIAL", "RECRUITMENT", "TERRITORY",
  "ENTERPRISE", "JUDGMENT", "ENDGAME"
]);

export const logEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: logTypeSchema,
  action: z.string(),
  details: z.string(),
  settlementId: z.string().optional(),
  npcId: z.string().optional(),
});

// Resources
export const resourcesSchema = z.object({
  gold: z.number().min(0).default(100),
  experience: z.number().min(0).default(0),
});

// Legitimacy dimensions
export const legitimacyDimensionsSchema = z.object({
  prowess: z.number().min(0).max(100).default(50),  // Combat capability
  honor: z.number().min(0).max(100).default(50),    // Code adherence
  influence: z.number().min(0).max(100).default(50), // Social standing
});

// World state
export const worldStateSchema = z.object({
  threeMarks: threeMarksSchema,
  legitimacyDimensions: legitimacyDimensionsSchema,
  npcRelationships: z.record(z.string(), relationshipSchema),
  recruitedNpcs: z.array(z.string()),
  visitedSettlements: z.array(z.string()),
  currentSettlementId: z.string().optional(),
  currentDistrictId: z.string().optional(),
  daysPassed: z.number().default(0),
});

// Player character
export const playerCharacterSchema = z.object({
  name: z.string().default("Kami 'The Kitsune' Reiss"),
  title: z.string().default("Scholar-Spymaster"),
  ancestry: ancestrySchema.default("HUMAN"),
});

// Mastery state (for tactical trials - carried over)
export const archetypeIdSchema = z.enum([
  "BRUISER", "SKIRMISHER", "HEXER", "SHIELDBEARER", "SNARER", "DUELIST", "SWARM"
]);

export const rivalIdSchema = z.enum(["VAREN", "SABLE", "KORRATH", "MISTVEIL", "SHADOWSTEP"]);

export const masteryStateSchema = z.object({
  archetypes: z.record(archetypeIdSchema, z.number()),
  rivals: z.record(rivalIdSchema, z.number()),
  questionsAnswered: z.record(z.string(), z.number()),
  totalExchanges: z.number(),
  totalCorrect: z.number(),
});

// Trial state
export const cultureRegionSchema = z.enum([
  "JUNGLE", "DESERT", "FOREST", "RAINFOREST", "MOUNTAIN"
]);

export const learningStyleSchema = z.object({
  conceptual: z.boolean().optional(),
  sequential: z.boolean().optional(),
  analytical: z.boolean().optional(),
  untimed: z.boolean().optional(),
  observational: z.boolean().optional(),
  practical: z.boolean().optional(),
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
  damage: z.number(),
  timer: z.number(),
  questionIds: z.array(z.string()),
  isPitFight: z.boolean().optional(),
  isRivalFight: z.boolean().optional(),
});

// Complete game state
export const gameStateSchema = z.object({
  version: z.string().default(GAME_VERSION),
  // Player
  player: playerCharacterSchema,
  // Resources
  resources: resourcesSchema,
  // Progression (Part 1)
  progression: progressionSchema,
  // World (Parts 2-3)
  world: worldStateSchema,
  // NPCs and Rivals (Part 4)
  rivals: z.array(rivalSchema),
  // Combat (Part 5)
  combat: combatStateSchema.optional(),
  injury: injuryStateSchema,
  crowdFavor: z.number().min(0).max(100).default(50),
  // Contracts (Part 6)
  meters: metersSchema,
  availableContracts: z.array(contractSchema),
  activeContracts: z.array(contractSchema),
  completedContractIds: z.array(z.string()),
  failedContractIds: z.array(z.string()),
  // Recruitment and Armies (Part 7)
  roster: z.array(recruitSchema),
  fieldTeamIds: z.array(z.string()),
  fieldTeamMaxSize: z.number().default(4),
  army: armyStateSchema,
  // Enterprise (Part 8)
  enterprise: enterpriseStateSchema,
  // Territory (Part 9)
  territory: territoryStateSchema,
  // Endgame (Part 10)
  endgame: endgameStateSchema,
  // Tactical Trials (carried over)
  mastery: masteryStateSchema,
  trial: trialStateSchema.optional(),
  learningStyle: learningStyleSchema.optional(),
  learningStyleCompleted: z.boolean().default(false),
  // Meta
  historyLog: z.array(logEntrySchema),
  prologueCompleted: z.boolean().default(false),
  flags: z.record(z.string(), z.boolean()),
  counters: z.record(z.string(), z.number()),
  // Timestamps
  createdAt: z.number(),
  lastPlayedAt: z.number(),
  totalPlayTimeSeconds: z.number().default(0),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Core types
export type GameState = z.infer<typeof gameStateSchema>;
export type Resources = z.infer<typeof resourcesSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type LogType = z.infer<typeof logTypeSchema>;

// Progression types (Part 1)
export type Tier = z.infer<typeof tierSchema>;
export type PrecedentTag = z.infer<typeof precedentTagSchema>;
export type ArbiterQualification = z.infer<typeof arbiterQualificationSchema>;
export type Progression = z.infer<typeof progressionSchema>;

// World types (Part 2)
export type Biome = z.infer<typeof biomeSchema>;
export type Nomenclature = z.infer<typeof nomenclatureSchema>;
export type Warlord = z.infer<typeof warlordSchema>;
export type ThreeMarks = z.infer<typeof threeMarksSchema>;
export type PopulationSize = z.infer<typeof populationSizeSchema>;
export type SubregionCategory = z.infer<typeof subregionCategorySchema>;
export type Settlement = z.infer<typeof settlementSchema>;

// District types (Part 3)
export type Ancestry = z.infer<typeof ancestrySchema>;
export type DistrictType = z.infer<typeof districtTypeSchema>;
export type District = z.infer<typeof districtSchema>;

// NPC types (Part 4)
export type NpcType = z.infer<typeof npcTypeSchema>;
export type PersonalityTrait = z.infer<typeof personalityTraitSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type RelationshipState = z.infer<typeof relationshipStateSchema>;
export type NPC = z.infer<typeof npcSchema>;
export type RivalStage = z.infer<typeof rivalStageSchema>;
export type Rival = z.infer<typeof rivalSchema>;

// Combat types (Part 5)
export type CombatMove = z.infer<typeof combatMoveSchema>;
export type Stance = z.infer<typeof stanceSchema>;
export type RiteCategory = z.infer<typeof riteCategorySchema>;
export type Rite = z.infer<typeof riteSchema>;
export type InjuryLevel = z.infer<typeof injuryLevelSchema>;
export type WoundTag = z.infer<typeof woundTagSchema>;
export type InjuryState = z.infer<typeof injuryStateSchema>;
export type EnemyArchetype = z.infer<typeof enemyArchetypeSchema>;
export type Combatant = z.infer<typeof combatantSchema>;
export type CombatState = z.infer<typeof combatStateSchema>;
export type PitFightType = z.infer<typeof pitFightTypeSchema>;

// Contract types (Part 6)
export type ContractSource = z.infer<typeof contractSourceSchema>;
export type ContractObjective = z.infer<typeof contractObjectiveSchema>;
export type ContractComplication = z.infer<typeof contractComplicationSchema>;
export type SlatePillar = z.infer<typeof slatePillarSchema>;
export type ApproachLane = z.infer<typeof approachLaneSchema>;
export type WitnessStrictness = z.infer<typeof witnessStrictnessSchema>;
export type ContractStep = z.infer<typeof contractStepSchema>;
export type Contract = z.infer<typeof contractSchema>;
export type Meters = z.infer<typeof metersSchema>;

// Recruitment types (Part 7)
export type StaffRole = z.infer<typeof staffRoleSchema>;
export type RosterSlot = z.infer<typeof rosterSlotSchema>;
export type Recruit = z.infer<typeof recruitSchema>;
export type ArmyState = z.infer<typeof armyStateSchema>;
export type BetrayalRisk = z.infer<typeof betrayalRiskSchema>;

// Enterprise types (Part 8)
export type IndustryNodeType = z.infer<typeof industryNodeTypeSchema>;
export type NodeQuality = z.infer<typeof nodeQualitySchema>;
export type MarketChannel = z.infer<typeof marketChannelSchema>;
export type IndustryNode = z.infer<typeof industryNodeSchema>;
export type SupplyChainLink = z.infer<typeof supplyChainLinkSchema>;
export type CorruptionType = z.infer<typeof corruptionTypeSchema>;
export type GamblingDen = z.infer<typeof gamblingDenSchema>;
export type EnterpriseState = z.infer<typeof enterpriseStateSchema>;

// Territory types (Part 9)
export type SiteType = z.infer<typeof siteTypeSchema>;
export type SecurityLayer = z.infer<typeof securityLayerSchema>;
export type CaptureMethod = z.infer<typeof captureMethodSchema>;
export type TerritorialHolding = z.infer<typeof territorialHoldingSchema>;
export type TerritoryState = z.infer<typeof territoryStateSchema>;

// Endgame types (Part 10)
export type OverthrowPathway = z.infer<typeof overthrowPathwaySchema>;
export type WatchdogFaction = z.infer<typeof watchdogFactionSchema>;
export type OvergrowthThreat = z.infer<typeof overgrowthThreatSchema>;
export type TyrantPath = z.infer<typeof tyrantPathSchema>;
export type EndgameState = z.infer<typeof endgameStateSchema>;
export type PerpetualEventType = z.infer<typeof perpetualEventTypeSchema>;

// Tactical trial types (carried over)
export type ArchetypeId = z.infer<typeof archetypeIdSchema>;
export type RivalId = z.infer<typeof rivalIdSchema>;
export type CultureRegion = z.infer<typeof cultureRegionSchema>;
export type LearningStyle = z.infer<typeof learningStyleSchema>;
export type MasteryState = z.infer<typeof masteryStateSchema>;
export type TrialState = z.infer<typeof trialStateSchema>;

// World state
export type LegitimacyDimensions = z.infer<typeof legitimacyDimensionsSchema>;
export type WorldState = z.infer<typeof worldStateSchema>;
export type PlayerCharacter = z.infer<typeof playerCharacterSchema>;
