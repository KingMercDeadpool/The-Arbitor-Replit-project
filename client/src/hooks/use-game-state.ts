import { useState, useEffect } from "react";
import { engine, type ContractType, type RoleKey } from "../lib/game-engine";
import { type GameState } from "@shared/schema";

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
      completeContract: (type: ContractType, hardLineCompliant: boolean) => 
        engine.completeContractStep(type, hardLineCompliant),
      upgradeRole: (role: RoleKey) => engine.upgradeRole(role),
      resetGame: () => engine.reset(),
      checkUpgrade: (role: RoleKey) => engine.canUpgrade(role),
      getCost: (role: RoleKey, tier: number) => engine.getUpgradeCost(role, tier),
      getTitle: (role: RoleKey, tier: number) => engine.getRoleTitle(role, tier),
      toggleFlag: (flag: any) => engine.toggleFlag(flag)
    }
  };
}
