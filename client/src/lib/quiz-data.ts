// Quiz-Based Combat System: Tactical Trials
// The Arbitor of the Mainland v0.8

// === TYPES ===

export type QuestionCategory = 'LORE' | 'DOCTRINE' | 'PATTERN' | 'CULTURE' | 'ETHICS';
export type ArchetypeId = 'BRUISER' | 'SKIRMISHER' | 'HEXER' | 'SHIELDBEARER' | 'SNARER' | 'DUELIST' | 'SWARM';
export type WeaponClass = 'BLADE' | 'BLUNT' | 'POLEARM' | 'UNARMED' | 'RANGED';
export type CultureRegion = 'COASTAL' | 'RIVER_BASIN' | 'HIGHLAND' | 'FOREST' | 'ARID';
export type RivalId = 'VAREN' | 'SABLE' | 'KORRATH' | 'MISTVEIL';

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  // Gating
  unlockedBy?: string; // settlement_id or npc_id
  rivalStage?: number; // For rival-specific questions
  rivalId?: RivalId;
  // Variation axes
  archetype?: ArchetypeId;
  weapon?: WeaponClass;
  culture?: CultureRegion;
  // Difficulty
  tier: 1 | 2 | 3; // 1 = universal, 2 = specialized, 3 = advanced
}

export interface QuestionPool {
  id: string;
  name: string;
  questions: Question[];
}

export interface MasteryState {
  archetypes: Record<ArchetypeId, number>; // 0-100
  rivals: Record<RivalId, number>; // 0-100
  questionsAnswered: Record<string, number>; // questionId -> times answered correctly
  totalExchanges: number;
  totalCorrect: number;
}

export interface TrialConfig {
  baseTimer: number; // 15 seconds default
  timerPerMasteryTier: number; // -2 seconds per tier
  minTimer: number; // 8 seconds floor
  questionsPerExchange: number; // 3-5
  universalRatio: number; // 0.3 = 30% universal questions
}

export const DEFAULT_TRIAL_CONFIG: TrialConfig = {
  baseTimer: 15,
  timerPerMasteryTier: 2,
  minTimer: 8,
  questionsPerExchange: 4,
  universalRatio: 0.3
};

export const INITIAL_MASTERY: MasteryState = {
  archetypes: {
    BRUISER: 0,
    SKIRMISHER: 0,
    HEXER: 0,
    SHIELDBEARER: 0,
    SNARER: 0,
    DUELIST: 0,
    SWARM: 0
  },
  rivals: {
    VAREN: 0,
    SABLE: 0,
    KORRATH: 0,
    MISTVEIL: 0
  },
  questionsAnswered: {},
  totalExchanges: 0,
  totalCorrect: 0
};

// === TIMER CALCULATION ===

export function getTimerForMastery(mastery: number, config: TrialConfig = DEFAULT_TRIAL_CONFIG): number {
  // Mastery tiers: 0-25% = tier 0, 25-50% = tier 1, 50-75% = tier 2, 75-100% = tier 3
  const tier = Math.floor(mastery / 25);
  const timer = config.baseTimer - (tier * config.timerPerMasteryTier);
  return Math.max(timer, config.minTimer);
}

// === LORE QUESTIONS (World Bible) ===

export const LORE_QUESTIONS: Question[] = [
  // Biomes
  {
    id: "lore_biome_01",
    category: "LORE",
    text: "Which biome is known for its salt flats and fishing villages?",
    options: ["Highland Plateau", "Coastal Lowlands", "Forest Interior", "River Basin"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_biome_02",
    category: "LORE",
    text: "The River Basin settlements primarily depend on what resource?",
    options: ["Mining ore", "Trade and river commerce", "Timber harvesting", "Livestock herding"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_biome_03",
    category: "LORE",
    text: "Which region is characterized by harsh winters and mountain fortresses?",
    options: ["Arid Frontier", "Forest Interior", "Highland Plateau", "Coastal Lowlands"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_biome_04",
    category: "LORE",
    text: "The Arid Frontier is dominated by which cultural practice?",
    options: ["Maritime traditions", "Nomadic caravans", "Forest worship", "River trade guilds"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_biome_05",
    category: "LORE",
    text: "What makes the Forest Interior dangerous for outsiders?",
    options: ["Flooding", "Dense canopy and territorial clans", "Volcanic activity", "Constant storms"],
    correctIndex: 1,
    tier: 1
  },
  // Districts
  {
    id: "lore_district_01",
    category: "LORE",
    text: "Which district type explicitly forbids black market activity?",
    options: ["Orcish Ward", "Elven Enclave", "Dwarven Quarter", "Human District"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_district_02",
    category: "LORE",
    text: "Halfling Quarters are known for what reputation?",
    options: ["Military strength", "Clean commerce and hospitality", "Arcane research", "Industrial output"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_district_03",
    category: "LORE",
    text: "Orcish Wards operate under what legitimacy system?",
    options: ["Guild charters", "The Three Marks", "Noble bloodlines", "Democratic councils"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "lore_district_04",
    category: "LORE",
    text: "What are the three components of the Orc legitimacy system?",
    options: ["Gold, Land, Blood", "Strength, Mind, Stewardship", "War, Trade, Law", "Honor, Duty, Sacrifice"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "lore_district_05",
    category: "LORE",
    text: "Dwarven Quarters typically control what aspect of a settlement?",
    options: ["Food supply", "Crafting and metallurgy", "Religious affairs", "Maritime trade"],
    correctIndex: 1,
    tier: 1
  },
  // Factions
  {
    id: "lore_faction_01",
    category: "LORE",
    text: "Contract sources include Brokers, Guilds, Clans, and what fourth type?",
    options: ["Temples", "Syndicates", "Academies", "Militias"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "lore_faction_02",
    category: "LORE",
    text: "What does the S in S.L.A.T.E. represent?",
    options: ["Steward", "Spy Network", "Settlement", "Strength"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "lore_faction_03",
    category: "LORE",
    text: "The Arbitor role primarily deals with what domain?",
    options: ["Espionage", "Military command", "Law and judgment", "Economic management"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_faction_04",
    category: "LORE",
    text: "At what Arbitor tier do special gates first appear?",
    options: ["Tier 5", "Tier 7", "Tier 8", "Tier 10"],
    correctIndex: 2,
    tier: 3
  },
  {
    id: "lore_faction_05",
    category: "LORE",
    text: "How many Proof Chains are required for Arbitor Tier 9?",
    options: ["1", "2", "3", "5"],
    correctIndex: 2,
    tier: 3
  },
  // NPCs
  {
    id: "lore_npc_01",
    category: "LORE",
    text: "What are the five relationship metrics tracked for NPCs?",
    options: ["Love, Hate, Fear, Debt, Honor", "Trust, Fear, Debt, Leverage, Standing", "Loyalty, Respect, Gold, Favor, Power", "Friendship, Rivalry, Obligation, Influence, Rank"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "lore_npc_02",
    category: "LORE",
    text: "How many major rivals does Kami face?",
    options: ["2", "3", "4", "6"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_npc_03",
    category: "LORE",
    text: "Rival escalation stages range from what to what?",
    options: ["1 to 5", "0 to 5", "1 to 10", "0 to 3"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "lore_npc_04",
    category: "LORE",
    text: "Travelers are NPCs that do what unique thing?",
    options: ["Control multiple districts", "Move between settlements", "Never form relationships", "Always oppose Kami"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_npc_05",
    category: "LORE",
    text: "Recruitment gating requires what minimum metrics?",
    options: ["Gold and fear", "Trust and standing thresholds", "Leverage and debt", "Combat victories"],
    correctIndex: 1,
    tier: 2
  },
  // Contracts
  {
    id: "lore_contract_01",
    category: "LORE",
    text: "What are the three resolution lanes for contract steps?",
    options: ["Fast, Medium, Slow", "Easy, Normal, Hard", "Shadow, Seal, Steel", "Covert, Public, Military"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_contract_02",
    category: "LORE",
    text: "The Shadow lane represents what approach?",
    options: ["Brute force", "Diplomatic negotiation", "Covert operations", "Legal proceedings"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_contract_03",
    category: "LORE",
    text: "The Seal lane represents what approach?",
    options: ["Stealth assassination", "Diplomatic and legal channels", "Military assault", "Bribery only"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_contract_04",
    category: "LORE",
    text: "The Steel lane represents what approach?",
    options: ["Blackmail", "Trade negotiation", "Force and combat", "Information gathering"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_contract_05",
    category: "LORE",
    text: "What is the maximum number of active contracts allowed?",
    options: ["3", "5", "7", "10"],
    correctIndex: 1,
    tier: 1
  },
  // Combat/Roster
  {
    id: "lore_roster_01",
    category: "LORE",
    text: "Field team size scales from 4 to what maximum?",
    options: ["8", "12", "16", "20"],
    correctIndex: 2,
    tier: 2
  },
  {
    id: "lore_roster_02",
    category: "LORE",
    text: "Handlers provide a bonus to which lane?",
    options: ["Seal", "Steel", "Shadow", "All lanes equally"],
    correctIndex: 2,
    tier: 2
  },
  {
    id: "lore_roster_03",
    category: "LORE",
    text: "What percentage bonus do staff roles provide to their lane?",
    options: ["5%", "10%", "15%", "25%"],
    correctIndex: 2,
    tier: 2
  },
  {
    id: "lore_roster_04",
    category: "LORE",
    text: "The injury system uses how many levels before escape?",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "lore_roster_05",
    category: "LORE",
    text: "What prevents permadeath in the combat system?",
    options: ["Divine intervention", "The injury/escape model", "Automatic resurrection", "Save points"],
    correctIndex: 1,
    tier: 1
  },
  // World mechanics
  {
    id: "lore_world_01",
    category: "LORE",
    text: "Heat meter ranges from what to what?",
    options: ["0-50", "0-100", "1-10", "0-1000"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "lore_world_02",
    category: "LORE",
    text: "Dirty tactics in PUBLIC view cost heavily in what resource?",
    options: ["Gold", "Heat", "Legitimacy", "Capacity"],
    correctIndex: 2,
    tier: 2
  },
  {
    id: "lore_world_03",
    category: "LORE",
    text: "Hard Line violations can block which tier advancement?",
    options: ["Commander Tier 5", "Steward Tier 7", "Arbitor Tier 9", "Spymaster Tier 10"],
    correctIndex: 2,
    tier: 3
  },
  {
    id: "lore_world_04",
    category: "LORE",
    text: "Settlement Support is a counter required for what gate?",
    options: ["Spymaster Tier 5", "Commander Tier 7", "Arbitor Tier 9", "Steward Tier 10"],
    correctIndex: 2,
    tier: 3
  },
  {
    id: "lore_world_05",
    category: "LORE",
    text: "The Credibility Crisis is an event tied to which role?",
    options: ["Spymaster", "Commander", "Steward", "Arbitor"],
    correctIndex: 3,
    tier: 3
  }
];

// === DOCTRINE QUESTIONS (External subjects reframed) ===

export const DOCTRINE_QUESTIONS: Question[] = [
  // Psychology/Tactics
  {
    id: "doctrine_psych_01",
    category: "DOCTRINE",
    text: "The Doctrine of the Cornered Beast states that a trapped enemy will...",
    options: ["Surrender immediately", "Fight with desperate ferocity", "Negotiate for terms", "Freeze in fear"],
    correctIndex: 1,
    explanation: "Based on the psychological principle that cornered individuals become unpredictable and dangerous.",
    tier: 1
  },
  {
    id: "doctrine_psych_02",
    category: "DOCTRINE",
    text: "The Principle of Escalation Dominance means controlling...",
    options: ["The highest ground", "When and how conflict intensifies", "The largest army", "The most gold"],
    correctIndex: 1,
    explanation: "The party that controls escalation pace controls the conflict outcome.",
    tier: 2
  },
  {
    id: "doctrine_psych_03",
    category: "DOCTRINE",
    text: "Cognitive load in combat refers to...",
    options: ["Physical exhaustion", "Mental fatigue from processing decisions", "Weight of armor", "Emotional attachment"],
    correctIndex: 1,
    explanation: "Overwhelming an opponent's decision-making capacity is a valid tactic.",
    tier: 2
  },
  {
    id: "doctrine_psych_04",
    category: "DOCTRINE",
    text: "The Fog of Conflict describes...",
    options: ["Weather conditions", "Uncertainty and incomplete information", "Smoke tactics", "Magical obscurement"],
    correctIndex: 1,
    explanation: "Adapted from Clausewitz's 'fog of war' - decisions made with imperfect knowledge.",
    tier: 1
  },
  {
    id: "doctrine_psych_05",
    category: "DOCTRINE",
    text: "Sunk cost fallacy in negotiation means...",
    options: ["Ships lost at sea", "Continuing a bad plan because of prior investment", "Hidden treasure", "Underwater combat"],
    correctIndex: 1,
    explanation: "Past costs should not influence present rational decisions.",
    tier: 2
  },
  // Logic/Strategy
  {
    id: "doctrine_logic_01",
    category: "DOCTRINE",
    text: "If all Bruisers telegraph, and this enemy telegraphs, then...",
    options: ["This enemy is a Bruiser", "This enemy might be a Bruiser", "This enemy is not a Bruiser", "Nothing can be concluded"],
    correctIndex: 1,
    explanation: "Affirming the consequent - telegraph is necessary but not sufficient for Bruiser identification.",
    tier: 2
  },
  {
    id: "doctrine_logic_02",
    category: "DOCTRINE",
    text: "The Quartermaster's Rule: if supply drops below demand, then...",
    options: ["Increase production", "Expect discipline problems", "Raise prices", "Declare victory"],
    correctIndex: 1,
    explanation: "Scarcity breeds competition and conflict within ranks.",
    tier: 1
  },
  {
    id: "doctrine_logic_03",
    category: "DOCTRINE",
    text: "Occam's Blade in investigation means...",
    options: ["The sharpest weapon wins", "The simplest explanation is often correct", "Cut away witnesses", "Divide and conquer"],
    correctIndex: 1,
    explanation: "Avoid multiplying entities beyond necessity.",
    tier: 1
  },
  {
    id: "doctrine_logic_04",
    category: "DOCTRINE",
    text: "The Prisoner's Calculation shows that mutual cooperation requires...",
    options: ["Trust or repeated interaction", "Written contracts", "Third-party enforcement", "Hostage exchange"],
    correctIndex: 0,
    explanation: "Game theory - cooperation emerges through trust or the shadow of the future.",
    tier: 2
  },
  {
    id: "doctrine_logic_05",
    category: "DOCTRINE",
    text: "Nash Equilibrium in faction conflicts means...",
    options: ["One side always wins", "No party benefits from changing strategy alone", "Violence is inevitable", "Peace is impossible"],
    correctIndex: 1,
    explanation: "Stable state where unilateral deviation is not profitable.",
    tier: 3
  },
  // Sociology/Politics
  {
    id: "doctrine_social_01",
    category: "DOCTRINE",
    text: "Legitimacy differs from power because...",
    options: ["It costs more gold", "It requires consent of the governed", "It requires more soldiers", "It cannot be lost"],
    correctIndex: 1,
    explanation: "Power compels, legitimacy persuades.",
    tier: 1
  },
  {
    id: "doctrine_social_02",
    category: "DOCTRINE",
    text: "The Iron Law of Hierarchy states that all organizations...",
    options: ["Eventually fail", "Develop ruling elites", "Need gold to function", "Must have armies"],
    correctIndex: 1,
    explanation: "Michels' iron law of oligarchy - bureaucracies concentrate power.",
    tier: 2
  },
  {
    id: "doctrine_social_03",
    category: "DOCTRINE",
    text: "Collective action problems occur when...",
    options: ["Groups are too small", "Individual incentives conflict with group benefit", "Leaders are corrupt", "Resources are abundant"],
    correctIndex: 1,
    explanation: "Free rider problem - why pay costs when others will?",
    tier: 2
  },
  {
    id: "doctrine_social_04",
    category: "DOCTRINE",
    text: "The Steward's Paradox: increasing taxes always...",
    options: ["Increases revenue", "Decreases revenue", "Has diminishing returns eventually", "Causes immediate rebellion"],
    correctIndex: 2,
    explanation: "Laffer curve concept - beyond a point, higher rates yield less.",
    tier: 2
  },
  {
    id: "doctrine_social_05",
    category: "DOCTRINE",
    text: "Network effects in espionage mean...",
    options: ["More spies are always better", "Each new contact multiplies information value", "Secrets cannot be kept", "Trust is impossible"],
    correctIndex: 1,
    explanation: "Metcalfe's law adapted - network value scales with connections.",
    tier: 2
  },
  // History/Precedent
  {
    id: "doctrine_hist_01",
    category: "DOCTRINE",
    text: "The Doctrine of First Strike Advantage applies when...",
    options: ["Defense is weak", "Offense is cheap and defense is expensive", "Both sides are equal", "Negotiations are possible"],
    correctIndex: 1,
    explanation: "When striking first provides disproportionate advantage, conflict is more likely.",
    tier: 2
  },
  {
    id: "doctrine_hist_02",
    category: "DOCTRINE",
    text: "Pyrrhic victory means...",
    options: ["Total annihilation of enemy", "Victory at unsustainable cost", "Victory through fire", "Accidental victory"],
    correctIndex: 1,
    explanation: "Named for King Pyrrhus - winning the battle but losing the war.",
    tier: 1
  },
  {
    id: "doctrine_hist_03",
    category: "DOCTRINE",
    text: "The Balance of Terror keeps peace through...",
    options: ["Love and trust", "Mutual assured destruction", "Trade agreements", "Religious conviction"],
    correctIndex: 1,
    explanation: "When both sides can destroy each other, neither attacks.",
    tier: 2
  },
  {
    id: "doctrine_hist_04",
    category: "DOCTRINE",
    text: "Divide and rule works by...",
    options: ["Splitting territory equally", "Preventing enemy unity through internal conflict", "Mathematical precision", "Fair governance"],
    correctIndex: 1,
    explanation: "Classic imperial strategy - fragmented opposition cannot resist.",
    tier: 1
  },
  {
    id: "doctrine_hist_05",
    category: "DOCTRINE",
    text: "The Mandate Principle states rulers lose authority when...",
    options: ["They grow old", "They fail to provide order and prosperity", "Enemies attack", "Gold runs out"],
    correctIndex: 1,
    explanation: "Based on Mandate of Heaven - legitimacy tied to performance.",
    tier: 2
  },
  // Mathematics/Resource
  {
    id: "doctrine_math_01",
    category: "DOCTRINE",
    text: "Lanchester's Square Law means doubling your forces...",
    options: ["Doubles effectiveness", "Quadruples effectiveness", "Halves risk", "Has no effect"],
    correctIndex: 1,
    explanation: "In ranged combat, force effectiveness scales with the square of numbers.",
    tier: 3
  },
  {
    id: "doctrine_math_02",
    category: "DOCTRINE",
    text: "Compound growth in resources means early investment...",
    options: ["Is worthless", "Has disproportionately large long-term returns", "Should be avoided", "Is always risky"],
    correctIndex: 1,
    explanation: "Time value - resources invested early compound over time.",
    tier: 1
  },
  {
    id: "doctrine_math_03",
    category: "DOCTRINE",
    text: "The Rule of Three in army supply means...",
    options: ["Armies fight in threes", "Three days of supply before discipline fails", "Three is a lucky number", "Triangular formations only"],
    correctIndex: 1,
    explanation: "Historical military principle - hunger breeds mutiny.",
    tier: 2
  },
  {
    id: "doctrine_math_04",
    category: "DOCTRINE",
    text: "Diminishing marginal returns means each additional unit...",
    options: ["Is more valuable", "Is less valuable than the last", "Has no value", "Doubles in value"],
    correctIndex: 1,
    explanation: "The tenth apple is less satisfying than the first.",
    tier: 1
  },
  {
    id: "doctrine_math_05",
    category: "DOCTRINE",
    text: "Opportunity cost means every choice...",
    options: ["Has a price in gold", "Excludes alternative choices", "Is reversible", "Is optimal"],
    correctIndex: 1,
    explanation: "Choosing one path means not choosing another.",
    tier: 1
  }
];

// === PATTERN QUESTIONS (Enemy archetypes) ===

export const PATTERN_QUESTIONS: Question[] = [
  // BRUISER patterns
  {
    id: "pattern_bruiser_01",
    category: "PATTERN",
    archetype: "BRUISER",
    text: "The Bruiser drops his shoulder. What attack follows?",
    options: ["Quick jab", "Heavy overhead strike", "Low sweep", "Defensive retreat"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_bruiser_02",
    category: "PATTERN",
    archetype: "BRUISER",
    text: "A Bruiser who plants both feet is preparing to...",
    options: ["Dodge", "Throw a haymaker", "Grapple", "Flee"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_bruiser_03",
    category: "PATTERN",
    archetype: "BRUISER",
    text: "After missing a heavy strike, a Bruiser is vulnerable for...",
    options: ["No time - immediate recovery", "A brief counter window", "Extended stagger", "Permanent opening"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_bruiser_04",
    category: "PATTERN",
    archetype: "BRUISER",
    text: "What stance counters Bruiser aggression best?",
    options: ["Aggressive - match their power", "Evasive - avoid the heavy hits", "Balanced - adapt to openings", "Focused - wait for rite opportunity"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_bruiser_05",
    category: "PATTERN",
    archetype: "BRUISER",
    text: "Bruisers rarely use which move?",
    options: ["Strike", "Guard", "Feint", "Rally"],
    correctIndex: 2,
    tier: 2
  },
  // SKIRMISHER patterns
  {
    id: "pattern_skirmisher_01",
    category: "PATTERN",
    archetype: "SKIRMISHER",
    text: "Skirmishers prefer what combat range?",
    options: ["Point blank grappling", "Mid-range with mobility", "Extreme distance", "They don't fight directly"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_skirmisher_02",
    category: "PATTERN",
    archetype: "SKIRMISHER",
    text: "A Skirmisher's sidestep usually precedes...",
    options: ["A retreat", "A flanking strike", "Surrender", "A defensive stance"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_skirmisher_03",
    category: "PATTERN",
    archetype: "SKIRMISHER",
    text: "To catch a Skirmisher, you must...",
    options: ["Chase them down", "Cut off their movement options", "Wait for exhaustion", "Challenge their honor"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_skirmisher_04",
    category: "PATTERN",
    archetype: "SKIRMISHER",
    text: "Skirmishers are weakest when...",
    options: ["In open terrain", "Cornered with no room to maneuver", "At range", "Facing single opponents"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_skirmisher_05",
    category: "PATTERN",
    archetype: "SKIRMISHER",
    text: "What move do Skirmishers use most frequently?",
    options: ["Guard", "Step", "Bind", "Rally"],
    correctIndex: 1,
    tier: 2
  },
  // HEXER patterns
  {
    id: "pattern_hexer_01",
    category: "PATTERN",
    archetype: "HEXER",
    text: "Hexers always open combat with...",
    options: ["Physical strike", "Defensive ward", "Distance and a rite", "Grapple attempt"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "pattern_hexer_02",
    category: "PATTERN",
    archetype: "HEXER",
    text: "A Hexer's gestures indicate...",
    options: ["Physical attack incoming", "Rite preparation", "Surrender", "Bluffing"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_hexer_03",
    category: "PATTERN",
    archetype: "HEXER",
    text: "To disrupt a Hexer's concentration, use...",
    options: ["Guard and wait", "Aggressive close-range pressure", "Matching rites", "Evasive movement"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_hexer_04",
    category: "PATTERN",
    archetype: "HEXER",
    text: "Hexers are physically...",
    options: ["Extremely strong", "Moderately capable", "Weak and vulnerable up close", "Unpredictable"],
    correctIndex: 2,
    tier: 1
  },
  {
    id: "pattern_hexer_05",
    category: "PATTERN",
    archetype: "HEXER",
    text: "The wound tag most associated with Hexer attacks is...",
    options: ["Bleeding", "Limping", "Hexed", "Concussed"],
    correctIndex: 2,
    tier: 2
  },
  // SHIELDBEARER patterns
  {
    id: "pattern_shieldbearer_01",
    category: "PATTERN",
    archetype: "SHIELDBEARER",
    text: "Shieldbearers excel at...",
    options: ["Quick attacks", "Prolonged defensive engagement", "Ranged combat", "Magical rites"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_shieldbearer_02",
    category: "PATTERN",
    archetype: "SHIELDBEARER",
    text: "A Shieldbearer raising their shield high is defending against...",
    options: ["Low attacks", "Overhead strikes", "Flanking maneuvers", "Rites"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_shieldbearer_03",
    category: "PATTERN",
    archetype: "SHIELDBEARER",
    text: "To bypass a Shieldbearer's defense, target...",
    options: ["The shield directly", "Their exposed flank or legs", "Their weapon hand", "Their head"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_shieldbearer_04",
    category: "PATTERN",
    archetype: "SHIELDBEARER",
    text: "Shieldbearers are vulnerable to...",
    options: ["Direct assault", "Feints and misdirection", "Ranged attacks", "Waiting"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_shieldbearer_05",
    category: "PATTERN",
    archetype: "SHIELDBEARER",
    text: "When a Shieldbearer drops their guard, it means...",
    options: ["They're exhausted", "They're baiting a counterattack", "They've surrendered", "Their arm is injured"],
    correctIndex: 1,
    tier: 3
  },
  // SNARER patterns
  {
    id: "pattern_snarer_01",
    category: "PATTERN",
    archetype: "SNARER",
    text: "Snarers fight by...",
    options: ["Overwhelming force", "Restricting enemy movement", "Pure defense", "Intimidation"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_snarer_02",
    category: "PATTERN",
    archetype: "SNARER",
    text: "A Snarer circling you is preparing to...",
    options: ["Flee", "Bind or trap you", "Call for help", "Switch weapons"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_snarer_03",
    category: "PATTERN",
    archetype: "SNARER",
    text: "The most dangerous terrain against a Snarer is...",
    options: ["Open field", "Narrow corridor with obstacles", "High ground", "Water"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_snarer_04",
    category: "PATTERN",
    archetype: "SNARER",
    text: "To counter a Bind attempt from a Snarer...",
    options: ["Stand still", "Step or evade before contact", "Grapple back", "Use a rite"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_snarer_05",
    category: "PATTERN",
    archetype: "SNARER",
    text: "Snarers work best when...",
    options: ["Alone", "With aggressive allies who capitalize on trapped foes", "At range", "Defending a position"],
    correctIndex: 1,
    tier: 2
  },
  // DUELIST patterns
  {
    id: "pattern_duelist_01",
    category: "PATTERN",
    archetype: "DUELIST",
    text: "Duelists excel in what kind of fight?",
    options: ["Group battles", "One-on-one combat", "Siege warfare", "Ambushes"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_duelist_02",
    category: "PATTERN",
    archetype: "DUELIST",
    text: "A Duelist's subtle weight shift indicates...",
    options: ["Exhaustion", "An incoming precision strike", "Retreat preparation", "Nothing significant"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_duelist_03",
    category: "PATTERN",
    archetype: "DUELIST",
    text: "Duelists are frustrated by...",
    options: ["Honorable combat", "Dirty tactics and multiple opponents", "Skilled foes", "Long fights"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_duelist_04",
    category: "PATTERN",
    archetype: "DUELIST",
    text: "The Feint is a Duelist's...",
    options: ["Weakness", "Favorite opening", "Last resort", "Rarely used move"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_duelist_05",
    category: "PATTERN",
    archetype: "DUELIST",
    text: "Against a Duelist, what stance is most effective?",
    options: ["Aggressive - overwhelm them", "Defensive - outlast them", "Focused - match their precision", "Evasive - refuse engagement"],
    correctIndex: 2,
    tier: 3
  },
  // SWARM patterns
  {
    id: "pattern_swarm_01",
    category: "PATTERN",
    archetype: "SWARM",
    text: "Swarm enemies fight by...",
    options: ["Individual duels", "Overwhelming numbers and coordination", "Stealth assassination", "Magical bombardment"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_swarm_02",
    category: "PATTERN",
    archetype: "SWARM",
    text: "Against a Swarm, priority targets are...",
    options: ["The weakest members", "The leaders or coordinators", "Random selection", "None - flee immediately"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_swarm_03",
    category: "PATTERN",
    archetype: "SWARM",
    text: "Rally is effective against Swarms because...",
    options: ["It heals wounds", "It boosts morale and coordinated response", "It summons reinforcements", "It scares enemies"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "pattern_swarm_04",
    category: "PATTERN",
    archetype: "SWARM",
    text: "The best terrain against a Swarm is...",
    options: ["Open field", "Narrow chokepoint", "Forest", "Water"],
    correctIndex: 1,
    tier: 1
  },
  {
    id: "pattern_swarm_05",
    category: "PATTERN",
    archetype: "SWARM",
    text: "Swarms are weakest when...",
    options: ["At full strength", "Their coordination breaks down", "Fighting at range", "On defensive"],
    correctIndex: 1,
    tier: 2
  }
];

// === CULTURE QUESTIONS (Regional variations) ===

export const CULTURE_QUESTIONS: Question[] = [
  // Coastal culture
  {
    id: "culture_coastal_01",
    category: "CULTURE",
    culture: "COASTAL",
    text: "Coastal fighters favor what weapon style?",
    options: ["Heavy two-handed weapons", "Light, quick blades and hooks", "Polearms", "Unarmed grappling"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_coastal_02",
    category: "CULTURE",
    culture: "COASTAL",
    text: "Maritime combat traditions emphasize...",
    options: ["Static defensive positions", "Balance and adaptation to shifting footing", "Cavalry charges", "Siege tactics"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_coastal_03",
    category: "CULTURE",
    culture: "COASTAL",
    text: "A Coastal Bruiser telegraphs with...",
    options: ["Shoulder drop", "A forward lean like bracing on deck", "Foot stomp", "Battle cry"],
    correctIndex: 1,
    tier: 3
  },
  // River Basin culture
  {
    id: "culture_river_01",
    category: "CULTURE",
    culture: "RIVER_BASIN",
    text: "River Basin fighting schools value...",
    options: ["Brute strength", "Patience and reading the opponent", "Speed above all", "Magical enhancement"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_river_02",
    category: "CULTURE",
    culture: "RIVER_BASIN",
    text: "Trade route warriors specialize in...",
    options: ["Mounted combat", "Caravan defense and ambush recognition", "Naval warfare", "Arena dueling"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_river_03",
    category: "CULTURE",
    culture: "RIVER_BASIN",
    text: "River Basin Duelists are known for...",
    options: ["Flashy techniques", "Practical efficiency over style", "Magical rites", "Dirty tactics"],
    correctIndex: 1,
    tier: 3
  },
  // Highland culture
  {
    id: "culture_highland_01",
    category: "CULTURE",
    culture: "HIGHLAND",
    text: "Highland warriors traditionally fight with...",
    options: ["Light armor for mobility", "Heavy armor and endurance tactics", "No armor at all", "Magical wards only"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_highland_02",
    category: "CULTURE",
    culture: "HIGHLAND",
    text: "Mountain fortress training emphasizes...",
    options: ["Open field charges", "Holding ground and controlling chokepoints", "Retreat and guerrilla tactics", "Cavalry maneuvers"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_highland_03",
    category: "CULTURE",
    culture: "HIGHLAND",
    text: "Highland Shieldbearers are uniquely skilled at...",
    options: ["Offensive shield bashes", "Fighting on slopes and uneven terrain", "Ranged defense only", "Rite integration"],
    correctIndex: 1,
    tier: 3
  },
  // Forest culture
  {
    id: "culture_forest_01",
    category: "CULTURE",
    culture: "FOREST",
    text: "Forest Interior fighters prefer...",
    options: ["Open confrontation", "Ambush and terrain advantage", "Naval combat", "Siege warfare"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_forest_02",
    category: "CULTURE",
    culture: "FOREST",
    text: "Clan warriors from the Forest use what signature weapon?",
    options: ["Longswords", "Spears and shortbows", "Heavy maces", "Crossbows"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_forest_03",
    category: "CULTURE",
    culture: "FOREST",
    text: "Forest Snarers utilize...",
    options: ["Chain weapons", "Natural traps and terrain features", "Pure strength", "Magical bindings"],
    correctIndex: 1,
    tier: 3
  },
  // Arid culture
  {
    id: "culture_arid_01",
    category: "CULTURE",
    culture: "ARID",
    text: "Arid Frontier combat traditions prioritize...",
    options: ["Heavy armor", "Endurance and resource conservation", "Aggressive offense", "Defensive formations"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_arid_02",
    category: "CULTURE",
    culture: "ARID",
    text: "Nomadic fighters are masters of...",
    options: ["Static defense", "Hit-and-run tactics", "Siege warfare", "Naval combat"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "culture_arid_03",
    category: "CULTURE",
    culture: "ARID",
    text: "An Arid Skirmisher will always seek...",
    options: ["Direct confrontation", "Shade and defensive terrain", "High ground first", "Water sources"],
    correctIndex: 2,
    tier: 3
  }
];

// === ETHICS QUESTIONS (Hard Line triggers) ===

export const ETHICS_QUESTIONS: Question[] = [
  {
    id: "ethics_oath_01",
    category: "ETHICS",
    text: "The opponent offers to yield if you spare their lieutenant. Breaking this oath later would...",
    options: ["Be tactically sound", "Violate your Hard Line and cost Legitimacy", "Have no consequences", "Only matter if witnessed"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "ethics_witness_01",
    category: "ETHICS",
    text: "Victory is certain, but requires a dirty tactic. Witnesses are present. The cost is...",
    options: ["Nothing - victory matters", "Significant Legitimacy loss", "Only Heat increase", "Rival respect gained"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "ethics_mercy_01",
    category: "ETHICS",
    text: "A defeated rival begs for mercy. Granting it costs nothing material, but refusing would...",
    options: ["Prove strength", "Risk Hard Line violation if witnessed", "Gain Legitimacy", "Have no effect"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "ethics_clean_01",
    category: "ETHICS",
    text: "You can win cleanly but slowly, or dirty but quickly. A clean victory provides...",
    options: ["Less reward", "Preserved Legitimacy and potential Proof Chain", "Nothing extra", "Only personal satisfaction"],
    correctIndex: 1,
    tier: 2
  },
  {
    id: "ethics_leverage_01",
    category: "ETHICS",
    text: "Using leverage on an NPC's family to force compliance is...",
    options: ["Standard practice", "A Hard Line violation that may block Arbitor advancement", "Encouraged", "Only wrong if they resist"],
    correctIndex: 1,
    tier: 3
  }
];

// === RIVAL-SPECIFIC QUESTIONS ===

export const RIVAL_QUESTIONS: Record<RivalId, Question[]> = {
  VAREN: [
    {
      id: "rival_varen_01",
      category: "LORE",
      rivalId: "VAREN",
      rivalStage: 0,
      text: "Lord Varen's primary domain of influence is...",
      options: ["Military command", "Law and legal manipulation", "Trade networks", "Espionage"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_varen_02",
      category: "DOCTRINE",
      rivalId: "VAREN",
      rivalStage: 1,
      text: "Varen's 'thesis' centers on the doctrine that...",
      options: ["Strength makes right", "Legal precedent trumps moral truth", "Gold buys everything", "Fear is the best motivator"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_varen_03",
      category: "PATTERN",
      rivalId: "VAREN",
      rivalStage: 2,
      text: "In combat, Varen fights like which archetype?",
      options: ["Bruiser", "Duelist", "Hexer", "Shieldbearer"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_varen_04",
      category: "ETHICS",
      rivalId: "VAREN",
      rivalStage: 3,
      text: "Varen offers to drop charges against an ally if you bend a ruling in his favor. This is...",
      options: ["A fair trade", "A Hard Line violation if accepted", "Standard negotiation", "A trick with no downside"],
      correctIndex: 1,
      tier: 3
    },
    {
      id: "rival_varen_05",
      category: "PATTERN",
      rivalId: "VAREN",
      rivalStage: 4,
      text: "At Stage 4+, Varen's combat style incorporates...",
      options: ["Pure aggression", "Legal binds that restrict your moves", "Magical hexes", "Overwhelming numbers"],
      correctIndex: 1,
      tier: 3
    }
  ],
  SABLE: [
    {
      id: "rival_sable_01",
      category: "LORE",
      rivalId: "SABLE",
      rivalStage: 0,
      text: "Sable operates primarily through...",
      options: ["Open warfare", "Shadow networks and information", "Legal channels", "Trade monopolies"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_sable_02",
      category: "DOCTRINE",
      rivalId: "SABLE",
      rivalStage: 1,
      text: "Sable's doctrine holds that...",
      options: ["Transparency builds trust", "Information asymmetry is power", "Strength is paramount", "Gold solves all problems"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_sable_03",
      category: "PATTERN",
      rivalId: "SABLE",
      rivalStage: 2,
      text: "In direct confrontation, Sable fights like...",
      options: ["A Bruiser", "A Shieldbearer", "A Skirmisher who avoids commitment", "A Hexer"],
      correctIndex: 2,
      tier: 2
    },
    {
      id: "rival_sable_04",
      category: "ETHICS",
      rivalId: "SABLE",
      rivalStage: 3,
      text: "Sable reveals a secret about an ally that could destroy them. Using it would...",
      options: ["Be efficient", "Risk your own secrets being exposed", "Have no downside", "Gain Legitimacy"],
      correctIndex: 1,
      tier: 3
    },
    {
      id: "rival_sable_05",
      category: "PATTERN",
      rivalId: "SABLE",
      rivalStage: 4,
      text: "At high stages, Sable prefers to...",
      options: ["Fight directly", "Send proxies while gathering intelligence", "Negotiate", "Flee"],
      correctIndex: 1,
      tier: 3
    }
  ],
  KORRATH: [
    {
      id: "rival_korrath_01",
      category: "LORE",
      rivalId: "KORRATH",
      rivalStage: 0,
      text: "Korrath's base of power is...",
      options: ["Legal institutions", "Military forces and martial reputation", "Trade guilds", "Spy networks"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_korrath_02",
      category: "DOCTRINE",
      rivalId: "KORRATH",
      rivalStage: 1,
      text: "Korrath believes legitimacy comes from...",
      options: ["Legal precedent", "Demonstrated strength in combat", "Economic control", "Information control"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_korrath_03",
      category: "PATTERN",
      rivalId: "KORRATH",
      rivalStage: 2,
      text: "Korrath fights as a...",
      options: ["Skirmisher", "Snarer", "Bruiser with overwhelming force", "Duelist"],
      correctIndex: 2,
      tier: 2
    },
    {
      id: "rival_korrath_04",
      category: "ETHICS",
      rivalId: "KORRATH",
      rivalStage: 3,
      text: "Korrath challenges you to single combat for leadership. Refusing would...",
      options: ["Be wise caution", "Cost significant Legitimacy among martial factions", "Have no effect", "Gain Steward support"],
      correctIndex: 1,
      tier: 3
    },
    {
      id: "rival_korrath_05",
      category: "PATTERN",
      rivalId: "KORRATH",
      rivalStage: 4,
      text: "At high stages, Korrath employs...",
      options: ["Subtlety and misdirection", "Army-scale confrontation", "Legal manipulation", "Economic warfare"],
      correctIndex: 1,
      tier: 3
    }
  ],
  MISTVEIL: [
    {
      id: "rival_mistveil_01",
      category: "LORE",
      rivalId: "MISTVEIL",
      rivalStage: 0,
      text: "Mistveil's influence centers on...",
      options: ["Military power", "Arcane knowledge and rites", "Trade control", "Legal authority"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_mistveil_02",
      category: "DOCTRINE",
      rivalId: "MISTVEIL",
      rivalStage: 1,
      text: "Mistveil's doctrine suggests that...",
      options: ["Strength rules", "Hidden knowledge is the ultimate power", "Gold controls all", "Law provides order"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_mistveil_03",
      category: "PATTERN",
      rivalId: "MISTVEIL",
      rivalStage: 2,
      text: "In combat, Mistveil primarily uses...",
      options: ["Brute force", "Hexer tactics with rites and curses", "Shield and endurance", "Quick strikes"],
      correctIndex: 1,
      tier: 2
    },
    {
      id: "rival_mistveil_04",
      category: "ETHICS",
      rivalId: "MISTVEIL",
      rivalStage: 3,
      text: "Mistveil offers forbidden knowledge in exchange for a favor. Accepting means...",
      options: ["Pure gain", "Potential corruption and Hard Line risk", "Nothing of consequence", "Legitimacy increase"],
      correctIndex: 1,
      tier: 3
    },
    {
      id: "rival_mistveil_05",
      category: "PATTERN",
      rivalId: "MISTVEIL",
      rivalStage: 4,
      text: "At high stages, Mistveil combines...",
      options: ["Raw strength", "Rites with bound creatures and environmental hazards", "Legal pressure", "Economic sanctions"],
      correctIndex: 1,
      tier: 3
    }
  ]
};

// === LEARNING STYLE QUESTIONS ===

export interface LearningStyleQuestion {
  id: string;
  text: string;
  options: Array<{
    label: string;
    trait: string;
  }>;
}

export const LEARNING_STYLE_QUESTIONS: LearningStyleQuestion[] = [
  {
    id: "learn_01",
    text: "A new technique is demonstrated once. How do you proceed?",
    options: [
      { label: "Watch it again - I need to see the motion repeated", trait: "VISUAL" },
      { label: "Try it immediately - I learn by doing", trait: "KINESTHETIC" },
      { label: "Ask why it works - I need the principle behind it", trait: "CONCEPTUAL" },
      { label: "Write it down - I'll study it later", trait: "READING" }
    ]
  },
  {
    id: "learn_02",
    text: "An informant rattles off three names, two locations, and a price. What sticks?",
    options: [
      { label: "The names - faces and identities anchor me", trait: "CHARACTER" },
      { label: "The locations - I can picture the map", trait: "SPATIAL" },
      { label: "The price - numbers are concrete", trait: "NUMERICAL" },
      { label: "The sequence - I remember the order it was said", trait: "SEQUENTIAL" }
    ]
  },
  {
    id: "learn_03",
    text: "You've fought this enemy type twice. What do you remember?",
    options: [
      { label: "Their tells - the shoulder drop before a strike", trait: "VISUAL_CUE" },
      { label: "Their words - what they said between clashes", trait: "NARRATIVE" },
      { label: "Their rhythm - fast-slow-fast, always", trait: "TIMING" },
      { label: "Their mistakes - where they left openings", trait: "ANALYTICAL" }
    ]
  },
  {
    id: "learn_04",
    text: "The crowd is watching. The clock is ticking. You prefer...",
    options: [
      { label: "Quick decisions - instinct over deliberation", trait: "TIMED_COMFORT" },
      { label: "Steady pace - pressure doesn't change my method", trait: "PRESSURE_NEUTRAL" },
      { label: "High stakes - I perform better when it matters", trait: "PRESSURE_MOTIVATED" },
      { label: "No clock - give me time to think and I'll win", trait: "UNTIMED" }
    ]
  },
  {
    id: "learn_05",
    text: "You misread an opponent and take a hit. Next exchange, you...",
    options: [
      { label: "Try something different - that approach failed", trait: "ADAPTIVE" },
      { label: "Try the same thing again - maybe I mistimed it", trait: "PERSISTENT" },
      { label: "Step back and observe - I need more information", trait: "OBSERVATIONAL" },
      { label: "Ask what I missed - someone here knows", trait: "SOCIAL" }
    ]
  },
  {
    id: "learn_06",
    text: "Before a critical duel, you spend the night...",
    options: [
      { label: "Reviewing past encounters with this enemy type", trait: "PATTERN_REVIEW" },
      { label: "Sparring with allies to warm up reflexes", trait: "PRACTICAL" },
      { label: "Reading about the opponent's faction and history", trait: "LORE_STUDY" },
      { label: "Resting - I trust what I already know", trait: "CONFIDENCE" }
    ]
  }
];

// === QUESTION POOL HELPERS ===

export function getAllQuestions(): Question[] {
  const rivalQs = Object.values(RIVAL_QUESTIONS).flat();
  return [
    ...LORE_QUESTIONS,
    ...DOCTRINE_QUESTIONS,
    ...PATTERN_QUESTIONS,
    ...CULTURE_QUESTIONS,
    ...ETHICS_QUESTIONS,
    ...rivalQs
  ];
}

export function getQuestionsForArchetype(archetype: ArchetypeId): Question[] {
  return PATTERN_QUESTIONS.filter(q => q.archetype === archetype);
}

export function getQuestionsForRival(rivalId: RivalId, maxStage: number): Question[] {
  return RIVAL_QUESTIONS[rivalId].filter(q => (q.rivalStage || 0) <= maxStage);
}

export function getUniversalQuestions(): Question[] {
  return [...LORE_QUESTIONS, ...DOCTRINE_QUESTIONS].filter(q => q.tier === 1);
}

export function buildEncounterPool(
  archetype: ArchetypeId,
  culture?: CultureRegion,
  rivalId?: RivalId,
  rivalStage?: number,
  masteryState?: MasteryState
): Question[] {
  const pool: Question[] = [];
  
  // Universal questions (30%)
  pool.push(...getUniversalQuestions());
  
  // Archetype-specific patterns
  pool.push(...getQuestionsForArchetype(archetype));
  
  // Culture variations if specified
  if (culture) {
    pool.push(...CULTURE_QUESTIONS.filter(q => q.culture === culture));
  }
  
  // Rival questions if fighting a rival
  if (rivalId && rivalStage !== undefined) {
    pool.push(...getQuestionsForRival(rivalId, rivalStage));
  }
  
  // Weight questions by mastery (seen questions appear less)
  if (masteryState) {
    return pool.map(q => ({
      ...q,
      _weight: masteryState.questionsAnswered[q.id] ? 
        Math.max(0.2, 1 - (masteryState.questionsAnswered[q.id] * 0.2)) : 1
    }));
  }
  
  return pool;
}

export function selectQuestionsForExchange(
  pool: Question[],
  count: number = 4
): Question[] {
  // Weighted random selection
  const weighted = pool.map(q => ({
    question: q,
    weight: (q as any)._weight || 1
  }));
  
  const selected: Question[] = [];
  const remaining = [...weighted];
  
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight;
      if (random <= 0) {
        selected.push(remaining[j].question);
        remaining.splice(j, 1);
        break;
      }
    }
  }
  
  return selected;
}
