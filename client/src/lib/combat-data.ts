import type { 
  Combatant, 
  EnemyArchetype, 
  Stance, 
  CombatMove, 
  RiteType, 
  WoundTag,
  Sponsor 
} from "@shared/schema";
import { ENEMY_ARCHETYPES, STANCES, COMBAT_MOVES, RITE_CATEGORIES } from "@shared/schema";

// === RITES (3-5 per category) ===
export interface Rite {
  id: string;
  name: string;
  category: RiteType;
  description: string;
  power: number;
  proofLinked?: string;
}

export const RITES: Rite[] = [
  // WARD
  { id: "r1", name: "Shield Pulse", category: "WARD", description: "Block next attack", power: 15 },
  { id: "r2", name: "Cleanse Curse", category: "WARD", description: "Remove hexed wound tag", power: 10 },
  { id: "r3", name: "Barrier Weave", category: "WARD", description: "Reduce all damage this turn", power: 12 },
  { id: "r4", name: "Sanctuary", category: "WARD", description: "Prevent targeting for 1 turn", power: 18 },
  // SUNDER  
  { id: "r5", name: "Armor Break", category: "SUNDER", description: "Reduce enemy defense", power: 20 },
  { id: "r6", name: "Stagger Blast", category: "SUNDER", description: "Interrupt enemy action", power: 15 },
  { id: "r7", name: "Ground Crack", category: "SUNDER", description: "AoE damage to front row", power: 18 },
  { id: "r8", name: "Shatter Ward", category: "SUNDER", description: "Remove enemy shields", power: 12 },
  // GLAMOUR
  { id: "r9", name: "Fear Wave", category: "GLAMOUR", description: "Lower enemy morale", power: 14 },
  { id: "r10", name: "Misdirection", category: "GLAMOUR", description: "Enemies attack wrong target", power: 16 },
  { id: "r11", name: "Secret Reveal", category: "GLAMOUR", description: "Reveal enemy stance/weakness", power: 10 },
  { id: "r12", name: "Phantom Strike", category: "GLAMOUR", description: "Create illusory attack", power: 12 },
  // VIGOR
  { id: "r13", name: "Heal Surge", category: "VIGOR", description: "Restore HP", power: 20 },
  { id: "r14", name: "Stamina Boost", category: "VIGOR", description: "Extra action next turn", power: 15 },
  { id: "r15", name: "Injury Mend", category: "VIGOR", description: "Reduce injury level by 1", power: 25 },
  { id: "r16", name: "Fortify", category: "VIGOR", description: "Temporary HP boost", power: 12 },
  // SIGIL
  { id: "r17", name: "Binding Oath", category: "SIGIL", description: "Prevent enemy retreat", power: 14 },
  { id: "r18", name: "Proof Seal", category: "SIGIL", description: "Create combat proof for contracts", power: 10, proofLinked: "Ledger Seal" },
  { id: "r19", name: "Chain Invoke", category: "SIGIL", description: "Link next rite for bonus", power: 18 },
  { id: "r20", name: "Oath of Witness", category: "SIGIL", description: "Legitimacy boost if public", power: 15, proofLinked: "Witness Proof" },
];

// === PIT FIGHT SPONSORS ===
export const SPONSORS: Sponsor[] = [
  { id: "sp1", name: "Ironjaw Threk", favor: 0, prefersGrayPlay: false, offersStaffHire: true },
  { id: "sp2", name: "Lady Velshara", favor: 0, prefersGrayPlay: false, offersStaffHire: false },
  { id: "sp3", name: "Grimtooth the Collector", favor: 0, prefersGrayPlay: true, offersStaffHire: true },
  { id: "sp4", name: "The Masked Patron", favor: 0, prefersGrayPlay: true, offersStaffHire: false },
  { id: "sp5", name: "Councilor Brax", favor: 0, prefersGrayPlay: false, offersStaffHire: true },
];

// === ENEMY GENERATION ===
export function generateEnemy(archetype: EnemyArchetype, level: number = 1): Combatant {
  const arch = ENEMY_ARCHETYPES[archetype];
  const hpMod = 1 + (level - 1) * 0.15;
  
  return {
    id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: generateEnemyName(archetype),
    hp: Math.floor(arch.hp * hpMod),
    maxHp: Math.floor(arch.hp * hpMod),
    stance: "BALANCED",
    archetype,
    isPlayer: false,
    position: archetype === "HEXER" ? 2 : archetype === "BRUISER" ? 0 : 1,
  };
}

const ENEMY_NAME_PREFIXES = [
  "Scarred", "Grizzled", "Swift", "Iron", "Stone", "Shadow", "Blood", "Bone",
  "Dusk", "Storm", "Frost", "Flame", "Silent", "Grim", "Wild", "Dark"
];

const ENEMY_NAME_ROOTS = [
  "Claw", "Fang", "Blade", "Hammer", "Spike", "Thorn", "Maul", "Fist",
  "Tooth", "Horn", "Skull", "Axe", "Pike", "Maw", "Talon", "Scar"
];

function generateEnemyName(archetype: EnemyArchetype): string {
  const prefix = ENEMY_NAME_PREFIXES[Math.floor(Math.random() * ENEMY_NAME_PREFIXES.length)];
  const root = ENEMY_NAME_ROOTS[Math.floor(Math.random() * ENEMY_NAME_ROOTS.length)];
  return `${prefix} ${root}`;
}

// === COMBAT CALCULATIONS ===
export function calculateHitChance(
  attackerStance: Stance, 
  defenderStance: Stance, 
  move: CombatMove,
  dirty: boolean
): number {
  const base = 70;
  const attackMod = STANCES[attackerStance].hitMod;
  const defenseMod = defenderStance === "EVASIVE" ? -15 : 0;
  const moveMod = move === "FEINT" ? 20 : move === "BIND" ? -10 : 0;
  const dirtyMod = dirty ? 15 : 0;
  
  return Math.max(20, Math.min(95, base + attackMod + defenseMod + moveMod + dirtyMod));
}

export function calculateDamage(
  attackerStance: Stance,
  defenderStance: Stance,
  baseDamage: number,
  isCrit: boolean
): number {
  const attackMod = STANCES[attackerStance].critMod / 10;
  const defenseMod = STANCES[defenderStance].damageTakenMod / 100;
  
  let damage = baseDamage * (1 + attackMod);
  damage = damage * (1 + defenseMod);
  
  if (isCrit) damage *= 1.5;
  
  return Math.floor(Math.max(1, damage));
}

export function calculateInjuryRisk(
  currentInjuryLevel: number,
  defenderStance: Stance,
  damageTaken: number,
  maxHp: number
): number {
  const base = (damageTaken / maxHp) * 50;
  const stanceMod = STANCES[defenderStance].injuryRiskMod;
  const injuryMod = currentInjuryLevel * 10;
  
  return Math.max(0, Math.min(100, base + stanceMod + injuryMod));
}

export function rollWoundTag(): WoundTag {
  const tags: WoundTag[] = [
    "BLEEDING", "BURNED", "FRACTURED", "CONCUSSED", "HEXED",
    "PUNCTURED", "CRUSHED", "FROSTBIT", "POISONED", "RATTLED"
  ];
  return tags[Math.floor(Math.random() * tags.length)];
}

// === CROWD FAVOR (PIT FIGHTS) ===
export function calculateCrowdFavorChange(
  move: CombatMove,
  wasFlashy: boolean,
  stanceMastery: boolean,
  cleanVictory: boolean,
  dirtyTactic: boolean,
  stalling: boolean
): number {
  let change = 0;
  
  if (move === "RALLY") change += 10;
  if (move === "INVOKE" && wasFlashy) change += 8;
  if (stanceMastery) change += 5;
  if (cleanVictory) change += 15;
  
  if (dirtyTactic) change -= 12;
  if (stalling) change -= 8;
  
  return change;
}

// === POSITION HELPERS ===
export const POSITION_NAMES = ["Front", "Mid", "Back"] as const;

export function canMelee(attackerPos: number, defenderPos: number): boolean {
  return Math.abs(attackerPos - defenderPos) <= 1 && attackerPos <= 1;
}

export function getValidTargets(
  attackerPos: number,
  move: CombatMove,
  enemies: Combatant[]
): Combatant[] {
  if (move === "INVOKE") return enemies; // Magic can hit any
  if (move === "STEP") return []; // No target needed
  if (move === "RALLY") return []; // Self/ally buff
  
  return enemies.filter(e => {
    if (move === "STRIKE" || move === "BIND") {
      return canMelee(attackerPos, e.position) || attackerPos === 2; // Back row can only use ranged
    }
    return true;
  });
}
