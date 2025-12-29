import { z } from "zod";
import { 
  gameStateSchema, 
  type GameState, 
  type Relationship,
  type WorldState,
  type CombatState,
  type InjuryState,
  type Contract,
  type Meters,
  type Recruit,
  type ArmyState,
  type Stance,
  type CombatMove,
  type ApproachLane,
  type StaffRole,
  type RosterSlot,
  type WoundTag,
  type BetrayalRisk,
  type MasteryState,
  type TrialState,
  type LearningStyle,
  type ArchetypeId,
  type RivalId,
  type CultureRegion,
  ROLE_NAMES, 
  TIER_TITLES,
  STAFF_ROLES 
} from "@shared/schema";
import {
  type Question,
  INITIAL_MASTERY,
  DEFAULT_TRIAL_CONFIG,
  getTimerForMastery,
  buildEncounterPool,
  selectQuestionsForExchange,
  getAllQuestions,
  LORE_QUESTIONS,
  DOCTRINE_QUESTIONS,
  PATTERN_QUESTIONS,
  ETHICS_QUESTIONS,
  RIVAL_QUESTIONS,
} from "./quiz-data";
import { RIVALS, ALL_NPCS, SETTLEMENTS, DISTRICTS } from "./world-data";
import { generateContract, resolveLane, type LaneResult } from "./contract-data";
import { generateEnemy, rollWoundTag, calculateCrowdFavorChange } from "./combat-data";

// === TYPES ===
export type ContractType = "CLEAN" | "GRAY" | "PUBLIC" | "COVERT";
export type RoleKey = "spymasterTier" | "commanderTier" | "stewardTier" | "arbitorTier";
export type LogType = "CONTRACT" | "TIER_UP" | "SYSTEM" | "CRISIS" | "NPC" | "WORLD" | "COMBAT" | "SOCIAL" | "RECRUITMENT";

// === CONSTANTS ===
const STORAGE_KEY = "arbitor_mainland_save_v07";
const OLD_STORAGE_KEYS = ["slate_sandbox_save_v2", "slate_sandbox_save"];

const DEFAULT_RELATIONSHIP: Relationship = {
  trust: 0,
  fear: 0,
  debt: 0,
  leverage: 0,
  standing: 0
};

const INITIAL_METERS: Meters = {
  heat: 0,
  unrestBySettlement: {}
};

const INITIAL_INJURY: InjuryState = {
  level: 0,
  woundTag: null
};

const INITIAL_ARMY: ArmyState = {
  garrison: 0,
  readiness: 50,
  supply: 50,
  discipline: 50
};

const INITIAL_MASTERY_STATE: MasteryState = {
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
  version: "0.7",
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
  // Part 5
  combat: undefined,
  injury: INITIAL_INJURY,
  stanceMastery: { BALANCED: true, AGGRESSIVE: false, DEFENSIVE: false, EVASIVE: false, FOCUSED: false },
  pitSponsorFavor: {},
  // Part 6
  meters: INITIAL_METERS,
  activeContracts: [],
  completedContracts: [],
  failedContracts: [],
  // Part 7
  roster: [],
  fieldTeamIds: [],
  fieldTeamMaxSize: 4,
  army: INITIAL_ARMY,
  // Part 8: Tactical Trials
  mastery: INITIAL_MASTERY_STATE,
  trial: undefined,
  learningStyle: undefined,
  learningStyleCompleted: false,
};

// === SAFE MIGRATION ===
function migrateState(oldState: any): GameState {
  const migrated = { ...INITIAL_STATE };
  
  // Preserve existing data
  if (oldState.resources) migrated.resources = { ...INITIAL_STATE.resources, ...oldState.resources };
  if (oldState.roles) migrated.roles = { ...INITIAL_STATE.roles, ...oldState.roles };
  if (oldState.flags) migrated.flags = { ...INITIAL_STATE.flags, ...oldState.flags };
  if (oldState.counters) migrated.counters = { ...INITIAL_STATE.counters, ...oldState.counters };
  if (oldState.historyLog) migrated.historyLog = oldState.historyLog;
  if (oldState.world) migrated.world = { ...INITIAL_WORLD_STATE, ...oldState.world };
  
  // Add new v0.7 fields if missing
  migrated.version = "0.7";
  migrated.combat = oldState.combat || undefined;
  migrated.injury = oldState.injury || INITIAL_INJURY;
  migrated.stanceMastery = oldState.stanceMastery || { BALANCED: true, AGGRESSIVE: false, DEFENSIVE: false, EVASIVE: false, FOCUSED: false };
  migrated.pitSponsorFavor = oldState.pitSponsorFavor || {};
  migrated.meters = oldState.meters || INITIAL_METERS;
  migrated.activeContracts = oldState.activeContracts || [];
  migrated.completedContracts = oldState.completedContracts || [];
  migrated.failedContracts = oldState.failedContracts || [];
  migrated.roster = oldState.roster || [];
  migrated.fieldTeamIds = oldState.fieldTeamIds || [];
  migrated.fieldTeamMaxSize = oldState.fieldTeamMaxSize || 4;
  migrated.army = oldState.army || INITIAL_ARMY;
  
  // Part 8: Tactical Trials
  migrated.mastery = oldState.mastery || INITIAL_MASTERY_STATE;
  migrated.trial = oldState.trial || undefined;
  migrated.learningStyle = oldState.learningStyle || undefined;
  migrated.learningStyleCompleted = oldState.learningStyleCompleted || false;
  
  // Migrate recruited NPCs to roster if needed
  if (oldState.world?.recruitedNpcs?.length > 0 && (!migrated.roster || migrated.roster.length === 0)) {
    migrated.roster = oldState.world.recruitedNpcs.map((npcId: string) => ({
      npcId,
      slot: "OPS" as RosterSlot,
    }));
  }
  
  return migrated;
}

// === ENGINE LOGIC ===

export class GameEngine {
  private state: GameState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.load();
  }

  private load(): GameState {
    try {
      // Try new storage key first
      let stored = localStorage.getItem(STORAGE_KEY);
      
      // Migrate from old keys if needed
      if (!stored) {
        for (const oldKey of OLD_STORAGE_KEYS) {
          stored = localStorage.getItem(oldKey);
          if (stored) {
            console.log(`Migrating save from ${oldKey} to ${STORAGE_KEY}`);
            localStorage.removeItem(oldKey);
            break;
          }
        }
      }
      
      if (!stored) return JSON.parse(JSON.stringify(INITIAL_STATE));
      
      const parsed = JSON.parse(stored);
      const migrated = migrateState(parsed);
      
      return migrated;
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

  private log(action: string, details: string, type: LogType = "SYSTEM") {
    const entry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      action,
      details,
      type
    };
    this.state.historyLog.unshift(entry);
    if (this.state.historyLog.length > 150) this.state.historyLog.pop();
  }

  // === CONTRACT ACTIONS (Legacy + New) ===

  public completeContractStep(type: ContractType, hardLineCompliant: boolean) {
    const r = this.state.resources;
    let logDetail = "";

    if (!hardLineCompliant && !this.state.flags.hardLineViolated) {
      this.state.flags.hardLineViolated = true;
      r.legitimacy = Math.max(0, r.legitimacy - 20);
      this.log("HARD LINE CROSSED", "Violated moral code. Legitimacy plummeted.", "CRISIS");
    }

    const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (type) {
      case "CLEAN":
        r.legitimacy = Math.min(100, r.legitimacy + rng(2, 5));
        r.leverage += rng(1, 3);
        if (Math.random() > 0.7) this.state.counters.settlementSupport++;
        this.state.world.threeMarks.stewardship = Math.min(100, this.state.world.threeMarks.stewardship + rng(1, 2));
        logDetail = "Gained Legitimacy and small Leverage.";
        break;
      case "GRAY":
        r.leverage += rng(3, 6);
        r.capacity += rng(2, 5);
        if (Math.random() > 0.5) r.legitimacy = Math.max(0, r.legitimacy - rng(1, 4));
        if (this.state.meters) this.state.meters.heat = Math.min(100, this.state.meters.heat + rng(5, 10));
        this.state.world.threeMarks.mind = Math.min(100, this.state.world.threeMarks.mind + rng(1, 2));
        logDetail = "Gained Leverage & Capacity. Risked Legitimacy.";
        break;
      case "PUBLIC":
        r.renown += rng(4, 8);
        if (Math.random() > 0.3) {
          r.legitimacy = Math.min(100, r.legitimacy + rng(1, 3));
          if (Math.random() > 0.6) this.state.counters.settlementSupport++;
        } else {
          r.legitimacy = Math.max(0, r.legitimacy - rng(1, 3));
        }
        this.state.world.threeMarks.strength = Math.min(100, this.state.world.threeMarks.strength + rng(1, 2));
        logDetail = "Gained Renown. Public reaction varied.";
        break;
      case "COVERT":
        r.leverage += rng(5, 10);
        r.legitimacy = Math.max(0, r.legitimacy - rng(2, 8));
        if (Math.random() > 0.5) this.state.counters.proofChains++;
        if (this.state.meters) this.state.meters.heat = Math.min(100, this.state.meters.heat + rng(10, 20));
        this.state.world.threeMarks.mind = Math.min(100, this.state.world.threeMarks.mind + rng(2, 3));
        logDetail = "Major Leverage gain. Legitimacy suffered.";
        break;
    }

    r.contractStepsCompleted++;
    if (r.contractStepsCompleted % 3 === 0) {
      r.roleTokens++;
      logDetail += " Earned 1 Role Token.";
    }

    this.log("CONTRACT STEP", `${type}: ${logDetail}`, "CONTRACT");
    this.save();
  }

  // === PART 6: NEW CONTRACT SYSTEM ===

  public generateNewContract(settlementId: string, source: "BROKER" | "GUILD" | "CLAN" | "SYNDICATE", axis: "S" | "L" | "A" | "T" | "E") {
    if ((this.state.activeContracts?.length || 0) >= 5) {
      this.log("CONTRACT", "Cannot accept more contracts. Max 5 active.", "CONTRACT");
      return null;
    }
    
    const difficulty = Math.floor((this.state.roles.arbitorTier + this.state.roles.spymasterTier) / 2);
    const contract = generateContract(settlementId, source, axis, difficulty);
    
    if (!this.state.activeContracts) this.state.activeContracts = [];
    this.state.activeContracts.push(contract);
    
    this.log("CONTRACT", `Accepted: ${contract.title}`, "CONTRACT");
    this.save();
    return contract;
  }

  public resolveContractStep(contractId: string, lane: ApproachLane) {
    const contract = this.state.activeContracts?.find(c => c.id === contractId);
    if (!contract) return null;
    
    const step = contract.steps[contract.currentStep];
    if (!step || step.completed || step.failed) return null;
    
    // Calculate staff bonuses
    const staffBonuses = this.getStaffBonuses();
    const hasProof = this.state.counters.proofChains > 0;
    
    const result = resolveLane(lane, contract, hasProof, staffBonuses);
    
    // Apply results
    step.chosenLane = lane;
    
    // Add scenery response to log
    const settlement = SETTLEMENTS.find(s => s.id === contract.settlementId);
    const district = DISTRICTS.find(d => d.id === contract.districtId);
    const scenery = `[${settlement?.name || "The Wilds"} - ${district?.name || "Outskirts"}] ${result.narrative}`;

    if (result.success) {
      step.completed = true;
      contract.currentStep++;
      
      // Earn some money while learning
      this.state.resources.renown += 1;
      this.state.resources.leverage += 2;
      
      // Check if contract complete
      if (contract.currentStep >= contract.steps.length) {
        this.completeContract(contractId);
      }
    } else {
      if (contract.failForwardEnabled && Math.random() > 0.5) {
        // Fail forward - add complication but continue
        step.completed = true;
        contract.currentStep++;
        contract.steps.push({
          id: `crisis_${Date.now()}`,
          description: "Crisis: Handle the complications from the failed step",
          completed: false,
          failed: false,
        });
        this.log("CONTRACT", "Step failed but you push forward with complications.", "CONTRACT");
      } else {
        step.failed = true;
        this.failContract(contractId);
      }
    }
    
    // Apply fallout
    if (this.state.meters) {
      this.state.meters.heat = Math.max(0, Math.min(100, this.state.meters.heat + result.heatChange));
    }
    this.state.resources.legitimacy = Math.max(0, Math.min(100, this.state.resources.legitimacy + result.legitimacyChange));
    
    // Injury risk
    if (result.injuryRisk > 0 && Math.random() * 100 < result.injuryRisk) {
      this.applyInjury(1);
    }
    
    this.log("CONTRACT", scenery, "CONTRACT");
    this.save();
    return result;
  }

  private completeContract(contractId: string) {
    const idx = this.state.activeContracts?.findIndex(c => c.id === contractId) ?? -1;
    if (idx === -1) return;
    
    const contract = this.state.activeContracts![idx];
    contract.status = "COMPLETED";
    
    // Apply rewards
    const r = contract.rewards;
    this.state.resources.renown += r.renown;
    this.state.resources.leverage += r.leverage;
    this.state.resources.capacity += r.capacity;
    this.state.resources.legitimacy = Math.max(0, Math.min(100, this.state.resources.legitimacy + r.legitimacy));
    this.state.resources.roleTokens += r.roleTokens;
    
    this.state.world.threeMarks.strength = Math.min(100, this.state.world.threeMarks.strength + r.markBonus.strength);
    this.state.world.threeMarks.mind = Math.min(100, this.state.world.threeMarks.mind + r.markBonus.mind);
    this.state.world.threeMarks.stewardship = Math.min(100, this.state.world.threeMarks.stewardship + r.markBonus.stewardship);
    
    // Move to completed
    this.state.activeContracts!.splice(idx, 1);
    if (!this.state.completedContracts) this.state.completedContracts = [];
    this.state.completedContracts.push(contractId);
    
    this.log("CONTRACT", `Completed: ${contract.title}. Rewards claimed!`, "CONTRACT");
  }

  private failContract(contractId: string) {
    const idx = this.state.activeContracts?.findIndex(c => c.id === contractId) ?? -1;
    if (idx === -1) return;
    
    const contract = this.state.activeContracts![idx];
    contract.status = "FAILED";
    
    // Apply consequences
    const risks = contract.risks;
    if (this.state.meters) {
      this.state.meters.heat = Math.min(100, this.state.meters.heat + risks.heatDelta);
    }
    this.state.resources.legitimacy = Math.max(0, this.state.resources.legitimacy + risks.legitimacyDelta);
    
    // Move to failed
    this.state.activeContracts!.splice(idx, 1);
    if (!this.state.failedContracts) this.state.failedContracts = [];
    this.state.failedContracts.push(contractId);
    
    this.log("CONTRACT", `Failed: ${contract.title}. Consequences applied.`, "CONTRACT");
  }

  // === PART 5: COMBAT SYSTEM ===

  public startCombat(isPitFight: boolean, enemyCount: number = 3, publicEncounter: boolean = false) {
    const enemies = [];
    const archetypes: ("BRUISER" | "SKIRMISHER" | "HEXER" | "SHIELDBEARER" | "SNARER" | "DUELIST" | "SWARM")[] = 
      ["BRUISER", "SKIRMISHER", "HEXER", "SHIELDBEARER", "SNARER", "DUELIST", "SWARM"];
    
    for (let i = 0; i < enemyCount; i++) {
      const arch = archetypes[Math.floor(Math.random() * archetypes.length)];
      enemies.push(generateEnemy(arch, Math.floor(this.state.roles.commanderTier / 2) + 1));
    }
    
    // Player combatant
    const player = {
      id: "player_kami",
      name: "Kami",
      hp: 50 + this.state.roles.commanderTier * 5,
      maxHp: 50 + this.state.roles.commanderTier * 5,
      stance: "BALANCED" as Stance,
      isPlayer: true,
      position: 1,
    };
    
    // Field team allies
    const allies = [player];
    const maxTeam = this.state.fieldTeamMaxSize || 4;
    const teamIds = (this.state.fieldTeamIds || []).slice(0, maxTeam - 1);
    
    for (const npcId of teamIds) {
      const npc = ALL_NPCS.find(n => n.id === npcId);
      if (npc) {
        allies.push({
          id: npcId,
          name: npc.name,
          hp: 30 + Math.random() * 20,
          maxHp: 40,
          stance: "BALANCED" as Stance,
          isPlayer: false,
          position: Math.floor(Math.random() * 3),
        });
      }
    }
    
    this.state.combat = {
      active: true,
      isPitFight,
      turn: 1,
      allies,
      enemies,
      crowdFavor: isPitFight ? 50 : 0,
      dirtyTacticsUsed: false,
      publicEncounter,
    };
    
    this.log("COMBAT", isPitFight ? "Entered the pit!" : "Combat initiated!", "COMBAT");
    this.save();
  }

  public executeCombatMove(move: CombatMove, targetId?: string, dirtyTactic: boolean = false, riteId?: string) {
    if (!this.state.combat?.active) return null;
    
    const combat = this.state.combat;
    const player = combat.allies.find(a => a.id === "player_kami");
    if (!player) return null;
    
    let result = { hit: false, damage: 0, narrative: "", crowdChange: 0 };
    
    // Simple combat resolution
    const hitRoll = Math.random() * 100;
    const hitChance = 70 + (dirtyTactic ? 15 : 0);
    result.hit = hitRoll < hitChance;
    
    if (dirtyTactic) {
      combat.dirtyTacticsUsed = true;
      if (combat.publicEncounter || combat.isPitFight) {
        this.state.resources.legitimacy = Math.max(0, this.state.resources.legitimacy - 5);
        if (this.state.meters) this.state.meters.heat = Math.min(100, this.state.meters.heat + 5);
      }
    }
    
    switch (move) {
      case "STRIKE":
        if (result.hit && targetId) {
          result.damage = 8 + Math.floor(Math.random() * 8);
          const target = combat.enemies.find(e => e.id === targetId);
          if (target) {
            target.hp = Math.max(0, target.hp - result.damage);
            result.narrative = `Struck ${target.name} for ${result.damage} damage!`;
            if (target.hp <= 0) result.narrative += " Defeated!";
          }
        } else {
          result.narrative = "Strike missed!";
        }
        break;
      case "GUARD":
        result.narrative = "Raised defenses.";
        break;
      case "STEP":
        player.position = (player.position + 1) % 3;
        result.narrative = `Repositioned to ${["Front", "Mid", "Back"][player.position]}.`;
        break;
      case "BIND":
        if (result.hit && targetId) {
          result.narrative = "Target bound! They cannot retreat.";
        } else {
          result.narrative = "Failed to bind.";
        }
        break;
      case "INVOKE":
        result.damage = 12 + Math.floor(Math.random() * 10);
        if (targetId) {
          const target = combat.enemies.find(e => e.id === targetId);
          if (target) {
            target.hp = Math.max(0, target.hp - result.damage);
            result.narrative = `Invoked rite for ${result.damage} damage!`;
          }
        } else {
          result.narrative = "Channeled magical energy.";
        }
        break;
      case "FEINT":
        result.narrative = dirtyTactic 
          ? "Dirty feint! Exposed enemy stance." 
          : "Feinted, improving next hit chance.";
        break;
      case "RALLY":
        player.hp = Math.min(player.maxHp, player.hp + 10);
        result.narrative = "Rallied! Recovered morale and health.";
        if (combat.isPitFight) {
          result.crowdChange = 10;
        }
        break;
    }
    
    // Crowd favor for pit fights
    if (combat.isPitFight) {
      const crowdDelta = calculateCrowdFavorChange(
        move,
        move === "INVOKE",
        !!this.state.stanceMastery?.[player.stance],
        false,
        dirtyTactic,
        move === "GUARD"
      );
      combat.crowdFavor = Math.max(0, Math.min(100, combat.crowdFavor + crowdDelta + result.crowdChange));
    }
    
    // Enemy turn (simplified)
    combat.enemies = combat.enemies.filter(e => e.hp > 0);
    for (const enemy of combat.enemies) {
      if (Math.random() > 0.3) {
        const dmg = 4 + Math.floor(Math.random() * 6);
        player.hp = Math.max(0, player.hp - dmg);
      }
    }
    
    combat.turn++;
    
    // Check win/loss
    if (combat.enemies.length === 0) {
      result.narrative += " Victory!";
      this.endCombat(true);
    } else if (player.hp <= 0) {
      result.narrative += " Defeated...";
      this.endCombat(false);
    }
    
    this.log("COMBAT", result.narrative, "COMBAT");
    this.save();
    return result;
  }

  public changeStance(newStance: Stance) {
    if (!this.state.combat?.active) return;
    const player = this.state.combat.allies.find(a => a.id === "player_kami");
    if (player) {
      player.stance = newStance;
      this.log("COMBAT", `Shifted to ${newStance} stance.`, "COMBAT");
      this.save();
    }
  }

  public endCombat(victory: boolean) {
    if (!this.state.combat) return;
    
    const combat = this.state.combat;
    
    if (victory) {
      this.state.resources.renown += 5;
      this.state.resources.leverage += 3;
      this.state.world.threeMarks.strength = Math.min(100, this.state.world.threeMarks.strength + 3);
      
      if (combat.isPitFight && combat.crowdFavor >= 70) {
        this.state.resources.renown += 10;
        this.log("COMBAT", "Crowd loved it! Bonus renown!", "COMBAT");
      }
    } else {
      // Injury/Escape
      this.applyInjury(1 + Math.floor(Math.random() * 2));
      this.log("COMBAT", "Escaped with injuries.", "COMBAT");
    }
    
    this.state.combat = undefined;
    this.save();
  }

  public applyInjury(levels: number) {
    if (!this.state.injury) this.state.injury = INITIAL_INJURY;
    
    this.state.injury.level = Math.min(5, this.state.injury.level + levels);
    
    if (levels > 0 && !this.state.injury.woundTag) {
      this.state.injury.woundTag = rollWoundTag();
    }
    
    this.log("SYSTEM", `Injury increased to ${this.state.injury.level}. Wound: ${this.state.injury.woundTag || "None"}`, "SYSTEM");
    this.save();
  }

  public heal(method: "REST" | "CLINIC" | "RITE") {
    if (!this.state.injury) return;
    
    let healAmount = 0;
    let clearsWound = false;
    
    switch (method) {
      case "REST":
        healAmount = 1;
        break;
      case "CLINIC":
        healAmount = 2;
        clearsWound = true;
        this.state.resources.leverage = Math.max(0, this.state.resources.leverage - 5);
        break;
      case "RITE":
        healAmount = 2;
        clearsWound = this.state.injury.woundTag === "HEXED" || Math.random() > 0.5;
        break;
    }
    
    this.state.injury.level = Math.max(0, this.state.injury.level - healAmount);
    if (clearsWound || this.state.injury.level === 0) {
      this.state.injury.woundTag = null;
    }
    
    this.log("SYSTEM", `Healed via ${method}. Injury: ${this.state.injury.level}`, "SYSTEM");
    this.save();
  }

  // === PART 7: ROSTER & STAFF ===

  public assignToRoster(npcId: string, slot: RosterSlot, staffRole?: StaffRole) {
    if (!this.state.roster) this.state.roster = [];
    
    // Remove if already in roster
    this.state.roster = this.state.roster.filter(r => r.npcId !== npcId);
    
    const recruit: Recruit = {
      npcId,
      slot,
      staffRole: slot === "STAFF" ? staffRole : undefined,
    };
    
    this.state.roster.push(recruit);
    this.log("RECRUITMENT", `Assigned to ${slot}${staffRole ? ` as ${staffRole}` : ""}`, "RECRUITMENT");
    this.save();
  }

  public addToFieldTeam(npcId: string) {
    if (!this.state.fieldTeamIds) this.state.fieldTeamIds = [];
    const maxSize = this.state.fieldTeamMaxSize || 4;
    
    if (this.state.fieldTeamIds.length >= maxSize - 1) { // -1 for player
      this.log("SYSTEM", "Field team is full.", "SYSTEM");
      return false;
    }
    
    if (!this.state.fieldTeamIds.includes(npcId)) {
      this.state.fieldTeamIds.push(npcId);
      this.log("RECRUITMENT", "Added to field team.", "RECRUITMENT");
      this.save();
      return true;
    }
    return false;
  }

  public removeFromFieldTeam(npcId: string) {
    if (!this.state.fieldTeamIds) return;
    this.state.fieldTeamIds = this.state.fieldTeamIds.filter(id => id !== npcId);
    this.save();
  }

  public upgradeFieldTeamSize() {
    const current = this.state.fieldTeamMaxSize || 4;
    if (current >= 16) return false;
    
    // Check prerequisites
    const tier = this.state.roles.commanderTier;
    const stewardTier = this.state.roles.stewardTier;
    
    let newMax = current;
    if (tier >= 4 && current < 8) newMax = 8;
    if (tier >= 6 && stewardTier >= 4 && current < 12) newMax = 12;
    if (tier >= 8 && stewardTier >= 6 && current < 16) newMax = 16;
    
    if (newMax > current) {
      this.state.fieldTeamMaxSize = newMax;
      this.log("SYSTEM", `Field team max increased to ${newMax}`, "SYSTEM");
      this.save();
      return true;
    }
    return false;
  }

  public getStaffBonuses(): { shadow: number; seal: number; steel: number } {
    const bonuses = { shadow: 0, seal: 0, steel: 0 };
    
    for (const recruit of this.state.roster || []) {
      if (recruit.slot === "STAFF" && recruit.staffRole) {
        switch (recruit.staffRole) {
          case "SCOUT":
          case "HANDLER":
            bonuses.shadow += 15;
            break;
          case "DELEGATE":
          case "SCRIBE":
            bonuses.seal += 15;
            break;
          case "QUARTERMASTER":
          case "INSTRUCTOR":
            bonuses.steel += 15;
            break;
          case "BROKER":
            bonuses.shadow += 10;
            bonuses.seal += 5;
            break;
          case "RECRUITER":
            bonuses.seal += 10;
            break;
        }
      }
    }
    
    return bonuses;
  }

  // === ARMY SYSTEM ===

  public modifyArmy(changes: Partial<ArmyState>) {
    if (!this.state.army) this.state.army = INITIAL_ARMY;
    
    if (changes.garrison !== undefined) this.state.army.garrison = Math.max(0, Math.min(900, this.state.army.garrison + changes.garrison));
    if (changes.readiness !== undefined) this.state.army.readiness = Math.max(0, Math.min(100, this.state.army.readiness + changes.readiness));
    if (changes.supply !== undefined) this.state.army.supply = Math.max(0, Math.min(100, this.state.army.supply + changes.supply));
    if (changes.discipline !== undefined) this.state.army.discipline = Math.max(0, Math.min(100, this.state.army.discipline + changes.discipline));
    
    this.save();
  }

  public recruitGarrison(count: number) {
    const cost = count * 2; // 2 capacity per soldier
    if (this.state.resources.capacity < cost) {
      this.log("SYSTEM", "Not enough capacity to recruit.", "SYSTEM");
      return false;
    }
    
    this.state.resources.capacity -= cost;
    this.modifyArmy({ garrison: count, readiness: -5, discipline: -2 });
    this.log("SYSTEM", `Recruited ${count} soldiers.`, "SYSTEM");
    return true;
  }

  // === BETRAYAL SYSTEM ===

  public getBetrayalRisk(npcId: string): BetrayalRisk {
    const rel = this.getRelationship(npcId);
    
    let riskScore = 0;
    
    if (rel.fear > 60) riskScore += 2;
    if (rel.trust < 20) riskScore += 2;
    if (rel.leverage > 50 && rel.standing < 0) riskScore += 1;
    if (rel.debt < -20) riskScore += 1; // They owe you nothing, you owe them
    
    if (riskScore >= 4) return "HIGH";
    if (riskScore >= 2) return "MEDIUM";
    return "LOW";
  }

  public applyBetrayalPrevention(npcId: string, method: "PAY" | "OATH" | "TRANSPARENCY" | "ROTATE") {
    switch (method) {
      case "PAY":
        if (this.state.resources.leverage >= 10) {
          this.state.resources.leverage -= 10;
          this.modifyRelationship(npcId, { debt: 10, trust: 5 });
          this.log("NPC", "Paid off their concerns.", "NPC");
        }
        break;
      case "OATH":
        if (this.state.counters.proofChains > 0) {
          this.state.counters.proofChains--;
          this.modifyRelationship(npcId, { trust: 15, leverage: -20 });
          this.log("NPC", "Bound by Oath-Sigil.", "NPC");
        }
        break;
      case "TRANSPARENCY":
        this.modifyRelationship(npcId, { standing: 10, leverage: -10, fear: -5 });
        this.log("NPC", "Showed transparency.", "NPC");
        break;
      case "ROTATE":
        this.modifyRelationship(npcId, { fear: -10 });
        this.log("NPC", "Rotated duties.", "NPC");
        break;
    }
    this.save();
  }

  // === ROLE PROGRESSION ===

  public getUpgradeCost(role: RoleKey, currentTier: number) {
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

    if (resources.roleTokens < cost.token) return { allowed: false, reason: "Need 1 Role Token" };
    if (resources[cost.resourceType] < cost.primaryResource) 
      return { allowed: false, reason: `Need ${cost.primaryResource} ${cost.resourceType}` };
    if (resources.legitimacy < cost.legitimacyReq) 
      return { allowed: false, reason: `Need ${cost.legitimacyReq} Legitimacy` };

    if (role === 'arbitorTier') {
      if (currentTier === 8) {
        const gates = [];
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

      if (currentTier === 9) {
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

    this.state.resources.roleTokens -= cost.token;
    // @ts-ignore
    this.state.resources[cost.resourceType] -= cost.primaryResource;
    this.state.roles[role]++;
    
    if (this.state.roles[role] === 8) {
      this.log("EVENT UNLOCKED", "Credibility Crisis is now available in Debug menu.", "SYSTEM");
    }

    const title = this.getRoleTitle(role, this.state.roles[role]);
    this.log("TIER UP", `Advanced ${role} to Tier ${this.state.roles[role]}: ${title}`, "TIER_UP");
    
    // Check field team upgrade
    this.upgradeFieldTeamSize();
    
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

  public recruitNpc(npcId: string, slot: RosterSlot = "OPS") {
    const check = this.canRecruitNpc(npcId);
    if (!check.allowed) return false;

    const npc = ALL_NPCS.find(n => n.id === npcId);
    if (!npc) return false;

    this.state.world.recruitedNpcs.push(npcId);
    this.assignToRoster(npcId, slot);
    this.log("RECRUITMENT", `Recruited ${npc.name} as ${slot}`, "RECRUITMENT");
    this.save();
    return true;
  }

  public interactWithNpc(npcId: string, action: "talk" | "bribe" | "threaten" | "help") {
    const npc = ALL_NPCS.find(n => n.id === npcId);
    if (!npc) return;

    switch (action) {
      case "talk":
        this.modifyRelationship(npcId, { trust: 2, standing: 1 });
        this.log("SOCIAL", `Spoke with ${npc.name}. Gained trust.`, "SOCIAL");
        break;
      case "bribe":
        if (this.state.resources.leverage >= 5) {
          this.state.resources.leverage -= 5;
          this.modifyRelationship(npcId, { trust: 5, debt: -10 });
          this.log("SOCIAL", `Bribed ${npc.name}. They owe you now.`, "SOCIAL");
        }
        break;
      case "threaten":
        this.modifyRelationship(npcId, { fear: 10, trust: -5, standing: -5 });
        this.log("SOCIAL", `Threatened ${npc.name}. They fear you now.`, "SOCIAL");
        break;
      case "help":
        if (this.state.resources.capacity >= 3) {
          this.state.resources.capacity -= 3;
          this.modifyRelationship(npcId, { trust: 8, standing: 5, debt: 5 });
          this.log("SOCIAL", `Helped ${npc.name}. They are grateful.`, "SOCIAL");
        }
        break;
    }
    this.save();
  }

  // === RIVAL ESCALATION ===

  public getRivalStage(rivalId: string): number {
    const rival = RIVALS.find(r => r.id === rivalId);
    if (!rival) return 0;
    
    let stage = 0;

    if (this.state.resources.renown >= 50) stage++;
    if (this.state.resources.leverage >= 100) stage++;
    if (this.state.roles.spymasterTier >= 6) stage++;
    if (this.state.roles.commanderTier >= 6) stage++;
    if (this.state.roles.stewardTier >= 5) stage++;
    if (this.state.roles.arbitorTier >= 5) stage++;
    if (this.state.flags.hardLineViolated) stage++;
    if (this.state.world.threeMarks.strength >= 30) stage++;

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

  // === METERS ===

  public modifyHeat(delta: number) {
    if (!this.state.meters) this.state.meters = INITIAL_METERS;
    this.state.meters.heat = Math.max(0, Math.min(100, this.state.meters.heat + delta));
    this.save();
  }

  public modifyUnrest(settlementId: string, delta: number) {
    if (!this.state.meters) this.state.meters = INITIAL_METERS;
    const current = this.state.meters.unrestBySettlement[settlementId] || 0;
    this.state.meters.unrestBySettlement[settlementId] = Math.max(0, Math.min(100, current + delta));
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

  // === TACTICAL TRIALS (Quiz Combat) ===

  public setLearningStyle(style: LearningStyle) {
    this.state.learningStyle = style;
    this.state.learningStyleCompleted = true;
    this.log("SYSTEM", "Learning style assessment completed.", "SYSTEM");
    this.save();
  }

  public getMastery(): MasteryState {
    return this.state.mastery || INITIAL_MASTERY_STATE;
  }

  public getArchetypeMastery(archetype: ArchetypeId): number {
    const mastery = this.getMastery();
    return mastery.archetypes[archetype] || 0;
  }

  public getRivalMastery(rivalId: RivalId): number {
    const mastery = this.getMastery();
    return mastery.rivals[rivalId] || 0;
  }

  public getTimerForEncounter(archetype: ArchetypeId, rivalId?: RivalId): number {
    const mastery = rivalId 
      ? this.getRivalMastery(rivalId)
      : this.getArchetypeMastery(archetype);
    
    // Apply learning style modifier
    let baseTimer = getTimerForMastery(mastery);
    if (this.state.learningStyle?.untimed) {
      baseTimer += 4; // Extra time for untimed preference
    }
    
    return baseTimer;
  }

  public startTrial(
    archetype: ArchetypeId,
    options: {
      rivalId?: RivalId;
      culture?: CultureRegion;
      isPitFight?: boolean;
      isRivalFight?: boolean;
    } = {}
  ): Question[] {
    const masteryState = this.getMastery();
    const rivalStage = options.rivalId ? this.getRivalStage(options.rivalId) : 0;
    
    // Build question pool
    const pool = buildEncounterPool(
      archetype,
      options.culture,
      options.rivalId,
      rivalStage,
      masteryState
    );
    
    // Select questions for first exchange
    const questions = selectQuestionsForExchange(pool, DEFAULT_TRIAL_CONFIG.questionsPerExchange);
    const timer = this.getTimerForEncounter(archetype, options.rivalId);
    
    // Initialize trial state
    const trial: TrialState = {
      active: true,
      archetype,
      rivalId: options.rivalId,
      culture: options.culture,
      currentExchange: 1,
      totalExchanges: 3,
      questionsInExchange: questions.length,
      currentQuestionIndex: 0,
      correctInExchange: 0,
      damage: 0,
      timer,
      questionIds: questions.map(q => q.id),
      isPitFight: options.isPitFight,
      isRivalFight: options.isRivalFight,
    };
    
    this.state.trial = trial;
    this.log("COMBAT", `Tactical Trial began against ${archetype}${options.rivalId ? ` (${options.rivalId})` : ''}`, "COMBAT");
    this.save();
    
    return questions;
  }

  public getTrialQuestions(): Question[] {
    if (!this.state.trial?.questionIds) return [];
    const allQuestions = getAllQuestions();
    return this.state.trial.questionIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }

  public getCurrentTrialQuestion(): Question | null {
    if (!this.state.trial?.active) return null;
    const questions = this.getTrialQuestions();
    return questions[this.state.trial.currentQuestionIndex] || null;
  }

  public answerTrialQuestion(answerIndex: number): {
    correct: boolean;
    damage: number;
    exchangeComplete: boolean;
    trialComplete: boolean;
    victory: boolean;
    injury: boolean;
  } {
    if (!this.state.trial?.active) {
      return { correct: false, damage: 0, exchangeComplete: false, trialComplete: true, victory: false, injury: false };
    }

    const question = this.getCurrentTrialQuestion();
    if (!question) {
      return { correct: false, damage: this.state.trial.damage, exchangeComplete: false, trialComplete: true, victory: false, injury: false };
    }

    // -1 means timeout (no answer given)
    const correct = answerIndex >= 0 && answerIndex === question.correctIndex;
    const mastery = this.getMastery();
    
    // Update mastery tracking
    if (!mastery.questionsAnswered[question.id]) {
      mastery.questionsAnswered[question.id] = 0;
    }
    if (correct) {
      mastery.questionsAnswered[question.id]++;
      mastery.totalCorrect++;
      this.state.trial.correctInExchange++;
    } else {
      // Take damage on wrong answer
      const damageAmount = 15;
      this.state.trial.damage += damageAmount;
    }

    // Move to next question
    this.state.trial.currentQuestionIndex++;
    
    // Check if exchange is complete
    const exchangeComplete = this.state.trial.currentQuestionIndex >= this.state.trial.questionsInExchange;
    let trialComplete = false;
    let victory = false;
    let injury = false;

    if (exchangeComplete) {
      mastery.totalExchanges++;
      
      // Update archetype mastery based on performance
      const performance = this.state.trial.correctInExchange / this.state.trial.questionsInExchange;
      const archetype = this.state.trial.archetype!;
      const masteryGain = Math.round(performance * 10);
      mastery.archetypes[archetype] = Math.min(100, (mastery.archetypes[archetype] || 0) + masteryGain);
      
      // Update rival mastery if applicable
      if (this.state.trial.rivalId) {
        mastery.rivals[this.state.trial.rivalId] = Math.min(100, (mastery.rivals[this.state.trial.rivalId] || 0) + masteryGain);
      }
      
      // Check for injury thresholds
      if (this.state.trial.damage >= 75) {
        injury = true;
        this.applyTrialInjury(3);
      } else if (this.state.trial.damage >= 50) {
        injury = true;
        this.applyTrialInjury(2);
      } else if (this.state.trial.damage >= 25) {
        injury = true;
        this.applyTrialInjury(1);
      }

      // Check if trial complete
      if (this.state.trial.damage >= 100 || this.state.trial.currentExchange >= this.state.trial.totalExchanges) {
        trialComplete = true;
        victory = this.state.trial.damage < 100;
        this.endTrial(victory);
      } else {
        // Start next exchange
        this.state.trial.currentExchange++;
        this.state.trial.currentQuestionIndex = 0;
        this.state.trial.correctInExchange = 0;
        
        // Get new questions for next exchange
        const pool = buildEncounterPool(
          this.state.trial.archetype!,
          this.state.trial.culture,
          this.state.trial.rivalId,
          this.state.trial.rivalId ? this.getRivalStage(this.state.trial.rivalId) : 0,
          this.getMastery()
        );
        const newQuestions = selectQuestionsForExchange(pool, DEFAULT_TRIAL_CONFIG.questionsPerExchange);
        this.state.trial.questionIds = newQuestions.map(q => q.id);
        this.state.trial.questionsInExchange = newQuestions.length;
      }
    }

    this.state.mastery = { ...this.getMastery(), ...mastery };
    this.save();

    return { 
      correct, 
      damage: this.state.trial?.damage || 0, 
      exchangeComplete, 
      trialComplete, 
      victory,
      injury
    };
  }

  private applyTrialInjury(level: number) {
    if (!this.state.injury) {
      this.state.injury = { level: 0, woundTag: null };
    }
    if (level > this.state.injury.level) {
      this.state.injury.level = level;
      this.state.injury.woundTag = rollWoundTag();
      this.log("COMBAT", `Sustained injury level ${level}: ${this.state.injury.woundTag}`, "COMBAT");
    }
  }

  private endTrial(victory: boolean) {
    if (!this.state.trial) return;
    
    const archetype = this.state.trial.archetype;
    const rivalId = this.state.trial.rivalId;
    
    if (victory) {
      // Rewards
      this.state.resources.roleTokens++;
      this.state.resources.renown += 5;
      
      if (this.state.trial.isPitFight) {
        this.state.resources.leverage += 10;
        this.log("COMBAT", `Victory in the pit! Gained role token, renown, and leverage.`, "COMBAT");
      } else if (this.state.trial.isRivalFight && rivalId) {
        this.state.counters.proofChains++;
        this.log("COMBAT", `Victory against ${rivalId}! Gained proof chain.`, "COMBAT");
      } else {
        this.log("COMBAT", `Victory against ${archetype}! Gained role token and renown.`, "COMBAT");
      }
    } else {
      this.log("COMBAT", `Escaped from combat with ${archetype}. Injury sustained.`, "COMBAT");
    }
    
    this.state.trial = undefined;
    this.save();
  }

  public abandonTrial() {
    if (!this.state.trial) return;
    
    // Apply escape penalty
    this.applyTrialInjury(1);
    this.log("COMBAT", "Fled from combat.", "COMBAT");
    
    this.state.trial = undefined;
    this.save();
  }

  public isTrialActive(): boolean {
    return !!this.state.trial?.active;
  }

  public getTrialState(): TrialState | undefined {
    return this.state.trial;
  }
}

export const engine = new GameEngine();
