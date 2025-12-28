import { z } from "zod";
import { 
  gameStateSchema, 
  type GameState, 
  ROLE_NAMES, 
  TIER_TITLES 
} from "@shared/schema";

// === TYPES ===
export type ContractType = "CLEAN" | "GRAY" | "PUBLIC" | "COVERT";
export type RoleKey = "spymasterTier" | "commanderTier" | "stewardTier" | "arbitorTier";

// === CONSTANTS ===
const STORAGE_KEY = "slate_sandbox_save_v1";

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
      if (!stored) return INITIAL_STATE;
      return gameStateSchema.parse(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load save, resetting:", e);
      return INITIAL_STATE;
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

  private log(action: string, details: string, type: "CONTRACT" | "TIER_UP" | "SYSTEM" | "CRISIS" = "SYSTEM") {
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

  // === ACTIONS ===

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
        logDetail = "Gained Legitimacy and small Leverage.";
        break;
      case "GRAY":
        r.leverage += rng(3, 6);
        r.capacity += rng(2, 5);
        if (Math.random() > 0.5) r.legitimacy = Math.max(0, r.legitimacy - rng(1, 4));
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
        logDetail = "Gained Renown. Public reaction varied.";
        break;
      case "COVERT":
        r.leverage += rng(5, 10);
        r.legitimacy = Math.max(0, r.legitimacy - rng(2, 8)); // High risk
        // Chance for Proof Chains
        if (Math.random() > 0.5) this.state.counters.proofChains++;
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

  public getUpgradeCost(role: RoleKey, currentTier: number) {
    // Simple linear curve: Cost = Tier * 5
    const cost = currentTier * 5;
    const resourceMap: Record<RoleKey, keyof typeof INITIAL_STATE.resources> = {
      spymasterTier: 'leverage',
      commanderTier: 'capacity',
      stewardTier: 'capacity', // or renown mixed? using capacity for simplicity
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
    // Map internal key to constant key
    const keyMap: Record<RoleKey, keyof typeof TIER_TITLES> = {
      spymasterTier: "SPYMASTER",
      commanderTier: "COMMANDER",
      stewardTier: "STEWARD",
      arbitorTier: "ARBITOR"
    };
    return TIER_TITLES[keyMap[role]][tier - 1] || "Unknown";
  }
  
  // === DEBUG UTILS ===
  public toggleFlag(flag: keyof typeof INITIAL_STATE.flags) {
    this.state.flags[flag] = !this.state.flags[flag];
    this.log("DEBUG", `Toggled flag ${flag} to ${this.state.flags[flag]}`);
    this.save();
  }
}

export const engine = new GameEngine();
