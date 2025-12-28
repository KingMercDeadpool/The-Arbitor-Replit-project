import { useState, useEffect } from "react";
import { engine, type ContractType, type RoleKey } from "../lib/game-engine";
import { type GameState, type Relationship } from "@shared/schema";

export function useGameState() {
  const [state, setState] = useState<GameState>(engine.getState());

  useEffect(() => {
    // Subscribe to engine changes to force re-render
    const unsubscribe = engine.subscribe(() => {
      setState({ ...engine.getState() }); // spread to create new object ref
    });
    return unsubscribe;
  }, []);

  return {
    state,
    actions: {
      // Step 1 - Contracts & Roles
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
      recruitNpc: (npcId: string) => engine.recruitNpc(npcId),
      interactWithNpc: (npcId: string, action: "talk" | "bribe" | "threaten" | "help") =>
        engine.interactWithNpc(npcId, action),

      // Rivals
      getRivalStage: (rivalId: string) => engine.getRivalStage(rivalId),

      // Three Marks
      modifyThreeMarks: (changes: { strength?: number; mind?: number; stewardship?: number }) =>
        engine.modifyThreeMarks(changes)
    }
  };
}
