import { z } from "zod";
import { 
  gameStateSchema, 
  type GameState, 
  type Relationship,
  type WorldState,
  ROLE_NAMES, 
  TIER_TITLES 
} from "@shared/schema";
import { RIVALS, ALL_NPCS } from "./world-data";

// === TYPES ===
export type ContractType = "CLEAN" | "GRAY" | "PUBLIC" | "COVERT";
export type RoleKey = "spymasterTier" | "commanderTier" | "stewardTier" | "arbitorTier";

// === CONSTANTS ===
const STORAGE_KEY = "slate_sandbox_save_v2";

const DEFAULT_RELATIONSHIP: Relationship = {
  trust: 0,
  fear: 0,
  debt: 0,
  leverage: 0,
  standing: 0
};

const INITIAL_WORLD_STATE: WorldState = {
  threeMarks: {
    strength: 10,
    mind: 10,
    stewardship: 10
  },
  npcRelationships: {},
  recruitedNpcs: [],
  visitedSettlements: [],
  currentSettlementId: undefined,
  currentDistrictId: undefined
};

const INITIAL_STATE: GameState = {
  resources: {
    renown: 0,
    leverage: 0,
    capacity: 0,
    legitimacy: 50,
    roleTokens: 0,
    contractStepsCompleted: 0,
  },
  roles: {
    spymasterTier: 1,
    commanderTier: 1,
    stewardTier: 1,
    arbitorTier: 1,
  },
  flags: {
    hardLineViolated: false,
    credibilityCrisisSurvived: false,
    continentRulingSucceeded: false,
    watchdogFrameworkEstablished: false,
    grayScenarioResolvedCleanly: false,
  },
  counters: {
    proofChains: 0,
    settlementSupport: 0,
  },
  historyLog: [],
  world: INITIAL_WORLD_STATE,
};

// === ENGINE LOGIC ===

export class GameEngine {
  private state: GameState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.load();
  }

  private load(): GameState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return JSON.parse(JSON.stringify(INITIAL_STATE));
      const parsed = JSON.parse(stored);
      // Migrate old saves without world state
      if (!parsed.world) {
        parsed.world = JSON.parse(JSON.stringify(INITIAL_WORLD_STATE));
      }
      return gameStateSchema.parse(parsed);
    } catch (e) {
      console.error("Failed to load save, resetting:", e);
      return JSON.parse(JSON.stringify(INITIAL_STATE));
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState() {
    return this.state;
  }

  public reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.save();
  }

  private log(action: string, details: string, type: "CONTRACT" | "TIER_UP" | "SYSTEM" | "CRISIS" | "NPC" | "WORLD" = "SYSTEM") {
    const entry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      action,
      details,
      type
    };
    this.state.historyLog.unshift(entry);
    if (this.state.historyLog.length > 50) this.state.historyLog.pop();
  }

  // === CONTRACT ACTIONS ===

  public completeContractStep(type: ContractType, hardLineCompliant: boolean) {
    const r = this.state.resources;
    let logDetail = "";

    // 1. Hard Line Check
    if (!hardLineCompliant && !this.state.flags.hardLineViolated) {
      this.state.flags.hardLineViolated = true;
      r.legitimacy = Math.max(0, r.legitimacy - 20);
      this.log("HARD LINE CROSSED", "Violated moral code. Legitimacy plummeted.", "CRISIS");
    }

    // 2. Resource Logic
    const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (type) {
      case "CLEAN":
        r.legitimacy = Math.min(100, r.legitimacy + rng(2, 5));
        r.leverage += rng(1, 3);
        // Chance for Settlement Support
        if (Math.random() > 0.7) this.state.counters.settlementSupport++;
        // Three Marks bonus
        this.state.world.threeMarks.stewardship = Math.min(100, this.state.world.threeMarks.stewardship + rng(1, 2));
        logDetail = "Gained Legitimacy and small Leverage.";
        break;
      case "GRAY":
        r.leverage += rng(3, 6);
        r.capacity += rng(2, 5);
        if (Math.random() > 0.5) r.legitimacy = Math.max(0, r.legitimacy - rng(1, 4));
        // Three Marks - mixed
        this.state.world.threeMarks.mind = Math.min(100, this.state.world.threeMarks.mind + rng(1, 2));
        logDetail = "Gained Leverage & Capacity. Risked Legitimacy.";
        break;
      case "PUBLIC":
        r.renown += rng(4, 8);
        if (Math.random() > 0.3) {
             r.legitimacy = Math.min(100, r.legitimacy + rng(1, 3)); 
             // Chance for Settlement Support if Clean
             if (Math.random() > 0.6) this.state.counters.settlementSupport++;
        } else {
             r.legitimacy = Math.max(0, r.legitimacy - rng(1, 3));
        }
        // Three Marks - strength from public display
        this.state.world.threeMarks.strength = Math.min(100, this.state.world.threeMarks.strength + rng(1, 2));
        logDetail = "Gained Renown. Public reaction varied.";
        break;
      case "COVERT":
        r.leverage += rng(5, 10);
        r.legitimacy = Math.max(0, r.legitimacy - rng(2, 8)); // High risk
        // Chance for Proof Chains
        if (Math.random() > 0.5) this.state.counters.proofChains++;
        // Three Marks - mind from clever work
        this.state.world.threeMarks.mind = Math.min(100, this.state.world.threeMarks.mind + rng(2, 3));
        logDetail = "Major Leverage gain. Legitimacy suffered.";
        break;
    }

    // 3. Token Progress
    r.contractStepsCompleted++;
    if (r.contractStepsCompleted % 3 === 0) {
      r.roleTokens++;
      logDetail += " Earned 1 Role Token.";
    }

    this.log("CONTRACT STEP", `${type}: ${logDetail}`, "CONTRACT");
    this.save();
  }

  // === ROLE PROGRESSION ===

  public getUpgradeCost(role: RoleKey, currentTier: number) {
    // Simple linear curve: Cost = Tier * 5
    const cost = currentTier * 5;
    const resourceMap: Record<RoleKey, keyof typeof INITIAL_STATE.resources> = {
      spymasterTier: 'leverage',
      commanderTier: 'capacity',
      stewardTier: 'capacity',
      arbitorTier: 'renown',
    };
    
    return {
      token: 1,
      primaryResource: cost,
      resourceType: resourceMap[role],
      legitimacyReq: currentTier * 5
    };
  }

  public canUpgrade(role: RoleKey) {
    const currentTier = this.state.roles[role];
    if (currentTier >= 10) return { allowed: false, reason: "Max Tier Reached" };

    const cost = this.getUpgradeCost(role, currentTier);
    const resources = this.state.resources;

    // 1. Basic Resource Checks
    if (resources.roleTokens < cost.token) return { allowed: false, reason: "Need 1 Role Token" };
    if (resources[cost.resourceType] < cost.primaryResource) 
      return { allowed: false, reason: `Need ${cost.primaryResource} ${cost.resourceType}` };
    if (resources.legitimacy < cost.legitimacyReq) 
      return { allowed: false, reason: `Need ${cost.legitimacyReq} Legitimacy` };

    // 2. Special Arbitor Gates
    if (role === 'arbitorTier') {
      if (currentTier === 8) { // Attempting 8 -> 9
        const gates = [];
        // Check 2 other roles >= 7
        const highRoles = Object.entries(this.state.roles)
          .filter(([k, v]) => k !== 'arbitorTier' && v >= 7).length;
        if (highRoles < 2) gates.push("Need 2 other roles at Tier 7+");
        
        if (resources.legitimacy < 70) gates.push("Need 70+ Legitimacy");
        if (this.state.flags.hardLineViolated) gates.push("Must NOT have violated Hard Lines");
        if (this.state.counters.proofChains < 3) gates.push("Need 3 Proof Chains");
        if (this.state.counters.settlementSupport < 3) gates.push("Need 3 Settlement Support");
        if (!this.state.flags.credibilityCrisisSurvived) gates.push("Must survive Credibility Crisis");

        if (gates.length > 0) return { allowed: false, reason: gates.join(". ") };
      }

      if (currentTier === 9) { // Attempting 9 -> 10
        const gates = [];
        if (!this.state.flags.continentRulingSucceeded) gates.push("Must succeed Continent Ruling");
        if (!this.state.flags.watchdogFrameworkEstablished) gates.push("Must establish Watchdog Framework");
        if (!this.state.flags.grayScenarioResolvedCleanly) gates.push("Must resolve Gray Scenario cleanly");
        
        if (gates.length > 0) return { allowed: false, reason: gates.join(". ") };
      }
    }

    return { allowed: true };
  }

  public upgradeRole(role: RoleKey) {
    const check = this.canUpgrade(role);
    if (!check.allowed) return;

    const currentTier = this.state.roles[role];
    const cost = this.getUpgradeCost(role, currentTier);

    // Consume
    this.state.resources.roleTokens -= cost.token;
    // @ts-ignore - dynamic key access is safe here due to strict typing in getUpgradeCost
    this.state.resources[cost.resourceType] -= cost.primaryResource;

    // Upgrade
    this.state.roles[role]++;
    
    // Unlock crisis flag trigger if any role hits 8 (prototype stub)
    if (this.state.roles[role] === 8) {
        this.log("EVENT UNLOCKED", "Credibility Crisis is now available in Debug menu.", "SYSTEM");
    }

    const title = this.getRoleTitle(role, this.state.roles[role]);
    this.log("TIER UP", `Advanced ${role} to Tier ${this.state.roles[role]}: ${title}`, "TIER_UP");
    
    this.save();
  }

  public getRoleTitle(role: RoleKey, tier: number) {
    const keyMap: Record<RoleKey, keyof typeof TIER_TITLES> = {
      spymasterTier: "SPYMASTER",
      commanderTier: "COMMANDER",
      stewardTier: "STEWARD",
      arbitorTier: "ARBITOR"
    };
    return TIER_TITLES[keyMap[role]][tier - 1] || "Unknown";
  }
  
  // === WORLD NAVIGATION ===

  public visitSettlement(settlementId: string) {
    if (!this.state.world.visitedSettlements.includes(settlementId)) {
      this.state.world.visitedSettlements.push(settlementId);
    }
    this.state.world.currentSettlementId = settlementId;
    this.state.world.currentDistrictId = undefined;
    this.log("TRAVEL", `Arrived at settlement`, "WORLD");
    this.save();
  }

  public visitDistrict(districtId: string) {
    this.state.world.currentDistrictId = districtId;
    this.log("TRAVEL", `Entered district`, "WORLD");
    this.save();
  }

  // === NPC RELATIONSHIPS ===

  public getRelationship(npcId: string): Relationship {
    return this.state.world.npcRelationships[npcId] || { ...DEFAULT_RELATIONSHIP };
  }

  public modifyRelationship(npcId: string, changes: Partial<Relationship>) {
    const current = this.getRelationship(npcId);
    this.state.world.npcRelationships[npcId] = {
      trust: Math.max(-100, Math.min(100, (current.trust || 0) + (changes.trust || 0))),
      fear: Math.max(0, Math.min(100, (current.fear || 0) + (changes.fear || 0))),
      debt: (current.debt || 0) + (changes.debt || 0),
      leverage: Math.max(0, Math.min(100, (current.leverage || 0) + (changes.leverage || 0))),
      standing: Math.max(-100, Math.min(100, (current.standing || 0) + (changes.standing || 0)))
    };
    this.save();
  }

  public canRecruitNpc(npcId: string): { allowed: boolean; reasons: string[] } {
    const npc = ALL_NPCS.find(n => n.id === npcId);
    if (!npc) return { allowed: false, reasons: ["NPC not found"] };
    if (this.state.world.recruitedNpcs.includes(npcId)) return { allowed: false, reasons: ["Already recruited"] };

    const rel = this.getRelationship(npcId);
    const req = npc.recruitmentRequirements;
    const reasons: string[] = [];

    if (rel.trust < req.minTrust) {
      reasons.push(`Need ${req.minTrust} Trust (have ${rel.trust})`);
    }
    if (rel.standing < req.minStanding) {
      reasons.push(`Need ${req.minStanding} Standing (have ${rel.standing})`);
    }
    if (req.requiredRoleTier) {
      const roleKey = req.requiredRoleTier.role as RoleKey;
      const currentTier = this.state.roles[roleKey] || 0;
      if (currentTier < req.requiredRoleTier.tier) {
        reasons.push(`Need ${req.requiredRoleTier.role} Tier ${req.requiredRoleTier.tier}`);
      }
    }
    if (req.forbiddenFlag) {
      const flagKey = req.forbiddenFlag as keyof typeof this.state.flags;
      if (this.state.flags[flagKey]) {
        reasons.push(`Blocked by ${req.forbiddenFlag}`);
      }
    }

    return { allowed: reasons.length === 0, reasons };
  }

  public recruitNpc(npcId: string) {
    const check = this.canRecruitNpc(npcId);
    if (!check.allowed) return false;

    const npc = ALL_NPCS.find(n => n.id === npcId);
    if (!npc) return false;

    this.state.world.recruitedNpcs.push(npcId);
    this.log("RECRUITMENT", `Recruited ${npc.name}`, "NPC");
    this.save();
    return true;
  }

  public interactWithNpc(npcId: string, action: "talk" | "bribe" | "threaten" | "help") {
    const npc = ALL_NPCS.find(n => n.id === npcId);
    if (!npc) return;

    switch (action) {
      case "talk":
        this.modifyRelationship(npcId, { trust: 2, standing: 1 });
        this.log("NPC", `Spoke with ${npc.name}. Gained trust.`, "NPC");
        break;
      case "bribe":
        if (this.state.resources.leverage >= 5) {
          this.state.resources.leverage -= 5;
          this.modifyRelationship(npcId, { trust: 5, debt: -10 });
          this.log("NPC", `Bribed ${npc.name}. They owe you now.`, "NPC");
        }
        break;
      case "threaten":
        this.modifyRelationship(npcId, { fear: 10, trust: -5, standing: -5 });
        this.log("NPC", `Threatened ${npc.name}. They fear you now.`, "NPC");
        break;
      case "help":
        if (this.state.resources.capacity >= 3) {
          this.state.resources.capacity -= 3;
          this.modifyRelationship(npcId, { trust: 8, standing: 5, debt: 5 });
          this.log("NPC", `Helped ${npc.name}. They are grateful.`, "NPC");
        }
        break;
    }
    this.save();
  }

  // === RIVAL ESCALATION ===

  public getRivalStage(rivalId: string): number {
    // Stored in a simple way - we'll compute based on triggers
    const rival = RIVALS.find(r => r.id === rivalId);
    if (!rival) return 0;
    
    let stage = 0;
    const triggers = rival.escalationTriggers;

    // Check trigger conditions
    if (this.state.resources.renown >= 50) stage++;
    if (this.state.resources.leverage >= 100) stage++;
    if (this.state.roles.spymasterTier >= 6) stage++;
    if (this.state.roles.commanderTier >= 6) stage++;
    if (this.state.roles.stewardTier >= 5) stage++;
    if (this.state.roles.arbitorTier >= 5) stage++;
    if (this.state.flags.hardLineViolated) stage++;
    if (this.state.world.threeMarks.strength >= 30) stage++;

    // Cap at 5
    return Math.min(5, stage);
  }

  // === THREE MARKS ===

  public modifyThreeMarks(changes: { strength?: number; mind?: number; stewardship?: number }) {
    const tm = this.state.world.threeMarks;
    if (changes.strength) tm.strength = Math.max(0, Math.min(100, tm.strength + changes.strength));
    if (changes.mind) tm.mind = Math.max(0, Math.min(100, tm.mind + changes.mind));
    if (changes.stewardship) tm.stewardship = Math.max(0, Math.min(100, tm.stewardship + changes.stewardship));
    this.save();
  }

  // === DEBUG UTILS ===
  public toggleFlag(flag: keyof typeof INITIAL_STATE.flags) {
    this.state.flags[flag] = !this.state.flags[flag];
    this.log("DEBUG", `Toggled flag ${flag} to ${this.state.flags[flag]}`);
    this.save();
  }

  public addResources(resources: Partial<typeof INITIAL_STATE.resources>) {
    Object.entries(resources).forEach(([key, value]) => {
      if (key in this.state.resources && typeof value === 'number') {
        // @ts-ignore
        this.state.resources[key] = Math.max(0, this.state.resources[key] + value);
      }
    });
    this.log("DEBUG", `Added resources`, "SYSTEM");
    this.save();
  }
}

export const engine = new GameEngine();
