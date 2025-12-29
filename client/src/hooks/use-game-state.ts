import { useState, useEffect } from "react";
import { engine, type ContractType, type RoleKey } from "../lib/game-engine";
import type { 
  GameState, 
  Relationship, 
  Stance, 
  CombatMove, 
  ApproachLane,
  StaffRole,
  RosterSlot,
  BetrayalRisk,
  ArchetypeId,
  RivalId,
  CultureRegion,
  LearningStyle
} from "@shared/schema";

export function useGameState() {
  const [state, setState] = useState<GameState>(engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setState({ ...engine.getState() });
    });
    return unsubscribe;
  }, []);

  return {
    state,
    actions: {
      // Step 1 - Contracts & Roles (Legacy)
      completeContract: (type: ContractType, hardLineCompliant: boolean) => 
        engine.completeContractStep(type, hardLineCompliant),
      upgradeRole: (role: RoleKey) => engine.upgradeRole(role),
      resetGame: () => engine.reset(),
      checkUpgrade: (role: RoleKey) => engine.canUpgrade(role),
      getCost: (role: RoleKey, tier: number) => engine.getUpgradeCost(role, tier),
      getTitle: (role: RoleKey, tier: number) => engine.getRoleTitle(role, tier),
      toggleFlag: (flag: any) => engine.toggleFlag(flag),
      addResources: (resources: any) => engine.addResources(resources),

      // World Navigation
      visitSettlement: (id: string) => engine.visitSettlement(id),
      visitDistrict: (id: string) => engine.visitDistrict(id),

      // NPC System
      getRelationship: (npcId: string): Relationship => engine.getRelationship(npcId),
      modifyRelationship: (npcId: string, changes: Partial<Relationship>) => 
        engine.modifyRelationship(npcId, changes),
      canRecruitNpc: (npcId: string) => engine.canRecruitNpc(npcId),
      recruitNpc: (npcId: string, slot?: RosterSlot) => engine.recruitNpc(npcId, slot),
      interactWithNpc: (npcId: string, action: "talk" | "bribe" | "threaten" | "help") =>
        engine.interactWithNpc(npcId, action),

      // Rivals
      getRivalStage: (rivalId: string) => engine.getRivalStage(rivalId),

      // Three Marks
      modifyThreeMarks: (changes: { strength?: number; mind?: number; stewardship?: number }) =>
        engine.modifyThreeMarks(changes),

      // Part 5: Combat
      startCombat: (isPitFight: boolean, enemyCount?: number, publicEncounter?: boolean) => 
        engine.startCombat(isPitFight, enemyCount, publicEncounter),
      executeCombatMove: (move: CombatMove, targetId?: string, dirty?: boolean, riteId?: string) =>
        engine.executeCombatMove(move, targetId, dirty, riteId),
      changeStance: (stance: Stance) => engine.changeStance(stance),
      endCombat: (victory: boolean) => engine.endCombat(victory),
      applyInjury: (levels: number) => engine.applyInjury(levels),
      heal: (method: "REST" | "CLINIC" | "RITE") => engine.heal(method),

      // Part 6: Contracts
      generateNewContract: (settlementId: string, source: "BROKER" | "GUILD" | "CLAN" | "SYNDICATE", axis: "S" | "L" | "A" | "T" | "E") =>
        engine.generateNewContract(settlementId, source, axis),
      resolveContractStep: (contractId: string, lane: ApproachLane) =>
        engine.resolveContractStep(contractId, lane),
      modifyHeat: (delta: number) => engine.modifyHeat(delta),
      modifyUnrest: (settlementId: string, delta: number) => engine.modifyUnrest(settlementId, delta),

      // Part 7: Roster & Army
      assignToRoster: (npcId: string, slot: RosterSlot, staffRole?: StaffRole) =>
        engine.assignToRoster(npcId, slot, staffRole),
      addToFieldTeam: (npcId: string) => engine.addToFieldTeam(npcId),
      removeFromFieldTeam: (npcId: string) => engine.removeFromFieldTeam(npcId),
      upgradeFieldTeamSize: () => engine.upgradeFieldTeamSize(),
      getStaffBonuses: () => engine.getStaffBonuses(),
      modifyArmy: (changes: Partial<{ garrison: number; readiness: number; supply: number; discipline: number }>) =>
        engine.modifyArmy(changes),
      recruitGarrison: (count: number) => engine.recruitGarrison(count),
      getBetrayalRisk: (npcId: string): BetrayalRisk => engine.getBetrayalRisk(npcId),
      applyBetrayalPrevention: (npcId: string, method: "PAY" | "OATH" | "TRANSPARENCY" | "ROTATE") =>
        engine.applyBetrayalPrevention(npcId, method),

      // Part 8: Tactical Trials
      setLearningStyle: (style: LearningStyle) => engine.setLearningStyle(style),
      getMastery: () => engine.getMastery(),
      getArchetypeMastery: (archetype: ArchetypeId) => engine.getArchetypeMastery(archetype),
      getRivalMastery: (rivalId: RivalId) => engine.getRivalMastery(rivalId),
      getTimerForEncounter: (archetype: ArchetypeId, rivalId?: RivalId) => 
        engine.getTimerForEncounter(archetype, rivalId),
      startTrial: (archetype: ArchetypeId, options?: {
        rivalId?: RivalId;
        culture?: CultureRegion;
        isPitFight?: boolean;
        isRivalFight?: boolean;
      }) => engine.startTrial(archetype, options),
      getTrialQuestions: () => engine.getTrialQuestions(),
      getCurrentTrialQuestion: () => engine.getCurrentTrialQuestion(),
      answerTrialQuestion: (answerIndex: number) => engine.answerTrialQuestion(answerIndex),
      abandonTrial: () => engine.abandonTrial(),
      isTrialActive: () => engine.isTrialActive(),
      getTrialState: () => engine.getTrialState(),

      // Save/Load
      downloadSave: () => engine.downloadSave(),
      importSave: (jsonString: string) => engine.importSave(jsonString),

      // Prologue
      completePrologue: () => engine.completePrologue(),
      isPrologueCompleted: () => engine.isPrologueCompleted(),
    }
  };
}
