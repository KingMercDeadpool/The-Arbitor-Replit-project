import type { 
  Contract, 
  ContractStep, 
  ContractSource, 
  ApproachLane,
  TavernTable 
} from "@shared/schema";
import { SETTLEMENTS, DISTRICTS, ALL_NPCS, TRAVELERS } from "./world-data";

// === CONTRACT TITLE GENERATION ===
const CONTRACT_VERBS = [
  "Secure", "Retrieve", "Negotiate", "Investigate", "Escort", "Sabotage",
  "Protect", "Deliver", "Acquire", "Eliminate", "Locate", "Mediate",
  "Extract", "Establish", "Disrupt", "Recover", "Intercept", "Verify"
];

const CONTRACT_OBJECTS = [
  "the Ledger", "the Shipment", "the Witness", "the Seal", "the Agreement",
  "the Evidence", "the Cargo", "the Asset", "the Document", "the Contact",
  "the Package", "the Route", "the Alliance", "the Territory", "the Intel",
  "the Proof Chain", "the Mark", "the Oath"
];

const CONTRACT_MODIFIERS = [
  "Before Dawn", "Without Witnesses", "By Any Means", "With Discretion",
  "Under Seal", "In Silence", "With Proof", "Before the Council",
  "For the Clan", "Against Rivals", "Through Shadow", "By Steel"
];

export function generateContractTitle(): string {
  const verb = CONTRACT_VERBS[Math.floor(Math.random() * CONTRACT_VERBS.length)];
  const obj = CONTRACT_OBJECTS[Math.floor(Math.random() * CONTRACT_OBJECTS.length)];
  const mod = Math.random() > 0.4 ? ` ${CONTRACT_MODIFIERS[Math.floor(Math.random() * CONTRACT_MODIFIERS.length)]}` : "";
  return `${verb} ${obj}${mod}`;
}

// === STEP DESCRIPTIONS ===
const STEP_TEMPLATES = {
  SHADOW: [
    "Infiltrate the target location undetected. The shadows are long and provide ample cover.",
    "Gather intelligence from a reluctant source. Everyone has a price, or a fear.",
    "Plant evidence without leaving traces. A ghost in the machinery of power.",
    "Intercept communications covertly. Words intended for one ear, captured by another.",
    "Bribe or persuade a guard to look away. A heavy purse often blinds the watchful.",
    "Create a distraction for extraction. Chaos is the best cloak for a quick exit."
  ],
  SEAL: [
    "Obtain proper authorization documents. The ink is dry, the authority unquestionable.",
    "Present evidence before witnesses. Truth, when shouted, cannot be ignored.",
    "Negotiate terms with legal backing. The law is a weapon, and you wield it well.",
    "File a formal complaint or petition. Bureaucracy can be a slow, crushing hammer.",
    "Gather sworn testimonies. Voices joined in truth create an unbreakable bond.",
    "Establish proof chain for legitimacy. Every link forged in iron-clad fact."
  ],
  STEEL: [
    "Confront the opposition directly. Let the ring of steel do the talking.",
    "Secure the perimeter by force. None shall pass while your blades are drawn.",
    "Escort the package through hostile territory. A shield wall against the tide.",
    "Eliminate resistance at the checkpoint. The path forward is paved with fallen foes.",
    "Hold position against counterattack. Stand firm like the mountains of Thornback.",
    "Make a show of strength to intimidate. Sometimes, showing the blade is enough."
  ]
};

function generateStepDescription(lane: ApproachLane): string {
  const templates = STEP_TEMPLATES[lane];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template;
}

// === CONTRACT GENERATION ===
export function generateContract(
  settlementId: string,
  source: ContractSource,
  slateAxis: "S" | "L" | "A" | "T" | "E",
  difficulty: number = 1
): Contract {
  const stepCount = 3 + Math.floor(Math.random() * 3); // 3-5 steps
  const steps: ContractStep[] = [];
  
  for (let i = 0; i < stepCount; i++) {
    steps.push({
      id: `step_${Date.now()}_${i}`,
      description: generateStepDescription(["SHADOW", "SEAL", "STEEL"][Math.floor(Math.random() * 3)] as ApproachLane),
      completed: false,
      failed: false,
    });
  }
  
  const districts = DISTRICTS.filter(d => d.settlementId === settlementId);
  const district = districts.length > 0 ? districts[Math.floor(Math.random() * districts.length)] : null;
  
  const baseReward = 5 + difficulty * 3;
  const witnessStrictness = district?.hasBlackMarket === false ? "HIGH" : 
    Math.random() > 0.5 ? "MEDIUM" : "LOW";
  
  return {
    id: `contract_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: generateContractTitle(),
    source,
    settlementId,
    districtId: district?.id,
    slateAxis,
    steps,
    currentStep: 0,
    requiredProofTypes: Math.random() > 0.5 ? ["Witness Proof"] : [],
    witnessStrictness,
    rewards: {
      renown: slateAxis === "A" || slateAxis === "T" ? baseReward * 2 : baseReward,
      leverage: slateAxis === "S" ? baseReward * 2 : baseReward,
      capacity: slateAxis === "A" ? baseReward : Math.floor(baseReward / 2),
      legitimacy: slateAxis === "L" ? 10 : -5,
      roleTokens: Math.floor((baseReward + stepCount) / 10),
      markBonus: {
        strength: slateAxis === "A" || slateAxis === "T" ? 5 : 0,
        mind: slateAxis === "S" || slateAxis === "L" ? 5 : 0,
        stewardship: slateAxis === "E" ? 5 : 0,
      }
    },
    risks: {
      heatDelta: source === "SYNDICATE" ? 15 : slateAxis === "S" ? 10 : 5,
      legitimacyDelta: slateAxis === "S" ? -10 : slateAxis === "L" ? 5 : -5,
      rivalEscalationChance: difficulty * 10,
      injuryRisk: slateAxis === "A" || slateAxis === "T" ? 30 : 10,
    },
    failForwardEnabled: Math.random() > 0.6,
    moralLockSafe: Math.random() > 0.2,
    status: "ACTIVE",
  };
}

// === LANE RESOLUTION ===
export interface LaneResult {
  success: boolean;
  heatChange: number;
  legitimacyChange: number;
  injuryRisk: number;
  proofRequired: boolean;
  proofSatisfied: boolean;
  narrative: string;
}

export function resolveLane(
  lane: ApproachLane,
  contract: Contract,
  hasProof: boolean,
  staffBonuses: { shadow: number; seal: number; steel: number }
): LaneResult {
  const base = 50;
  let successChance = base;
  let heatChange = 0;
  let legitimacyChange = 0;
  let injuryRisk = 0;
  const proofRequired = contract.witnessStrictness === "HIGH" || 
    (contract.witnessStrictness === "MEDIUM" && lane !== "SEAL");
  
  switch (lane) {
    case "SHADOW":
      successChance += staffBonuses.shadow;
      heatChange = 10;
      legitimacyChange = -5;
      injuryRisk = 15;
      break;
    case "SEAL":
      successChance += staffBonuses.seal + (hasProof ? 20 : -20);
      heatChange = 0;
      legitimacyChange = 10;
      injuryRisk = 5;
      break;
    case "STEEL":
      successChance += staffBonuses.steel;
      heatChange = 5;
      legitimacyChange = -3;
      injuryRisk = 30;
      break;
  }
  
  const success = Math.random() * 100 < successChance;
  const proofSatisfied = !proofRequired || hasProof;
  
  if (!proofSatisfied && contract.witnessStrictness === "HIGH") {
    legitimacyChange -= 15;
  }
  
  const narratives = {
    SHADOW: {
      success: "Slipped through unnoticed. The job is done.",
      failure: "Spotted! Had to abort. Heat is rising."
    },
    SEAL: {
      success: "Proper channels work. Legitimacy intact.",
      failure: "Bureaucracy blocked progress. Time wasted."
    },
    STEEL: {
      success: "Strength prevailed. Opposition cleared.",
      failure: "Met fierce resistance. Took injuries."
    }
  };
  
  return {
    success,
    heatChange: success ? heatChange : heatChange * 2,
    legitimacyChange: success ? legitimacyChange : legitimacyChange - 5,
    injuryRisk: success ? 0 : injuryRisk,
    proofRequired,
    proofSatisfied,
    narrative: success ? narratives[lane].success : narratives[lane].failure,
  };
}

// === TAVERN TABLE GENERATION ===
export function generateTavernTables(
  settlementId: string,
  districtId?: string
): TavernTable[] {
  const tables: TavernTable[] = [];
  const numTables = 4 + Math.floor(Math.random() * 5); // 4-8 tables
  
  // Get local NPCs + some travelers
  const localNpcs = ALL_NPCS.filter(n => 
    !n.isTraveler && 
    (districtId ? n.districtId === districtId : DISTRICTS.find(d => d.id === n.districtId)?.settlementId === settlementId)
  );
  const travelers = TRAVELERS.slice(0, 2 + Math.floor(Math.random() * 3));
  const availableNpcs = [...localNpcs, ...travelers];
  
  const moods: TavernTable["mood"][] = ["FRIENDLY", "NEUTRAL", "HOSTILE", "SECRETIVE"];
  
  for (let i = 0; i < numTables; i++) {
    const tableSize = 1 + Math.floor(Math.random() * 3); // 1-3 NPCs per table
    const tableNpcs: string[] = [];
    
    for (let j = 0; j < tableSize && availableNpcs.length > 0; j++) {
      const idx = Math.floor(Math.random() * availableNpcs.length);
      tableNpcs.push(availableNpcs[idx].id);
      availableNpcs.splice(idx, 1);
    }
    
    if (tableNpcs.length === 0) continue;
    
    tables.push({
      id: `table_${Date.now()}_${i}`,
      npcIds: tableNpcs,
      mood: moods[Math.floor(Math.random() * moods.length)],
      hasContractLead: Math.random() > 0.7,
      hasRecruitmentOpp: Math.random() > 0.75,
      hasRivalComplication: Math.random() > 0.85,
    });
  }
  
  return tables;
}

// === ENCOUNTER TYPES ===
export const ENCOUNTER_TYPES = [
  "SOCIAL_DUEL", "BRAWL", "AMBUSH", "RAID", "PIT", "HEARING"
] as const;

export const ENVIRONMENT_HAZARDS = [
  "FIRE", "WATER", "CROWD", "DARKNESS", "NARROW", "ELEVATED", "SLIPPERY", "NONE"
] as const;

export const WITNESS_CLIMATES = ["PUBLIC", "PRIVATE", "MIXED"] as const;

export const RIVAL_INTERFERENCE = ["NONE", "WATCHING", "SABOTAGE", "DIRECT"] as const;

// === VARIETY ENGINE PROOF ===
export const VARIETY_MATH = {
  sceneEngine: {
    settlements: 20,
    districtTypes: 2, // Has black market or not
    districtFunctions: 12, // Unique district types that appear
    timeOfDay: 2, // Day/Night
    socialModes: 3, // Talk/Flirt/Fight
    intents: 3, // Flirtatious/Casual/Curious
    total: 20 * 2 * 12 * 2 * 3 * 3, // = 8,640
  },
  encounterEngine: {
    encounterTypes: 6,
    archetypeMixes: 60, // Combinations of 1-3 enemy types
    environmentHazards: 8,
    witnessClimates: 3,
    rivalInterference: 4,
    total: 6 * 60 * 8 * 3 * 4, // = 34,560
  },
  nameEngine: {
    prefixes: 16,
    roots: 16,
    suffixes: 10,
    total: 16 * 16 * 10, // = 2,560
  },
  grandTotal: 8640 + 34560 + 2560, // = 45,760 combinations
};

// === SOCIAL INTERACTION ===
export type SocialMode = "TALK" | "FLIRT" | "FIGHT";
export type SocialIntent = "FLIRTATIOUS" | "CASUAL" | "CURIOUS";

export interface SocialOutcome {
  type: "ENCOUNTER" | "CONTRACT_LEAD" | "RECRUITMENT" | "RIVAL_COMPLICATION" | "INFO";
  description: string;
  npcId?: string;
  contractLead?: Partial<Contract>;
}

export function resolveSocialInteraction(
  mode: SocialMode,
  intent: SocialIntent,
  table: TavernTable,
  heat: number
): SocialOutcome {
  const outcomes: SocialOutcome[] = [];
  
  // High heat increases hostile outcomes
  const hostileChance = heat / 100;
  
  if (mode === "FIGHT") {
    return {
      type: "ENCOUNTER",
      description: "A brawl breaks out! Combat initiated.",
      npcId: table.npcIds[0],
    };
  }
  
  if (table.hasContractLead && (mode === "TALK" && intent === "CURIOUS")) {
    return {
      type: "CONTRACT_LEAD",
      description: "They mention a job that needs doing...",
      npcId: table.npcIds[0],
    };
  }
  
  if (table.hasRecruitmentOpp && (intent === "CASUAL" || intent === "FLIRTATIOUS")) {
    return {
      type: "RECRUITMENT",
      description: "They seem open to working with you.",
      npcId: table.npcIds[0],
    };
  }
  
  if (table.hasRivalComplication || Math.random() < hostileChance) {
    return {
      type: "RIVAL_COMPLICATION",
      description: "Someone here is reporting to your rivals...",
      npcId: table.npcIds[0],
    };
  }
  
  return {
    type: "INFO",
    description: mode === "FLIRT" 
      ? "A pleasant exchange. They warm up to you." 
      : "You learn something useful about the area.",
    npcId: table.npcIds[0],
  };
}
