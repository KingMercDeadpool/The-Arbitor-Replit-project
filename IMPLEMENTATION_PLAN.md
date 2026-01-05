# THE ARBITER OF CROWNHEIM - Implementation Plan
## Complete Rewrite Architecture Document

---

## Overview

This document outlines the implementation plan for transforming "The Arbitor of the Mainland" into "The Arbiter of Crownheim" based on the complete design document. The target is a 30-hour gameplay experience through grinding loops and procedural recombination.

---

## Phase 1: Core Schema Rewrite

### New Type Definitions (shared/schema.ts)

**Game Identity:**
- Rename to "Arbiter of Crownheim"
- Storage key: `arbiter_crownheim_save_v1`
- Coalition Common naming: Crownheim vs Kragbrud conflict

**Core Resources:**
```typescript
resources: {
  experience: number;        // Unified XP pool
  legitimacy: number;        // 0-100, multi-dimensional
  selflessness: number;      // Hidden Arbiter qualification score
  gold: number;              // Currency
  heat: number;              // 0-100, authority scrutiny
}

legitimacyDimensions: {
  prowess: number;           // Combat capability
  honor: number;             // Adherence to codes
  influence: number;         // Social standing
}
```

**Unified Tier System:**
```typescript
progression: {
  tier: number;              // 1-10, unified across all roles
  tierXpRequired: number[];  // Exponential scaling (100 * 1.5^tier)
  arbiterQualified: boolean;
  precedentTags: PrecedentTag[];
  endorsements: string[];    // NPC IDs who endorse
}
```

---

## Phase 2: World Bible Data

### Five Biomes (Crownheim)

| Biome | Name | Warlord | Confederacy | Political Stance |
|-------|------|---------|-------------|------------------|
| Jungle | Western Reaches | Skar Greenfang | Greenfang Confederacy | Defiant |
| Desert | Southeastern Expanse | Ashira Sunspear | Sandstone Coalition | Allied with Moktar |
| Forest | Northern Territories | Thorn Oakshield | Oakshield Alliance | Opposes centralization |
| Bamboo Rainforest | Central Crownheim | Mei Shadowstep | Network (no formal) | Adaptable |
| Mountains | Eastern Spine | Krag Ironjaw | Stone Brotherhood | Cautious interest |

### Settlement Distribution (20 total)
- Jungle: 3 settlements (resource extraction, frontier)
- Desert: 4 settlements (oases, trade routes)
- Forest: 5 settlements (administrative, knowledge)
- Rainforest: 3 settlements (fluid trading posts)
- Mountains: 5 settlements (mining operations)

### Three Marks Framework
- **Strength**: Martial prowess, physical courage, protective capacity
- **Mind**: Strategic thinking, knowledge, wise judgment
- **Stewardship**: Resource management, population welfare, infrastructure

### Witness Tradition
- Public actions generate Legitimacy
- Private actions build Witness Web intelligence
- Actions without witnesses cannot establish precedent

---

## Phase 3: Progression System

### Unified Experience Architecture
```typescript
const TIER_XP_REQUIREMENTS = [
  0,      // Tier 1 (starting)
  100,    // Tier 2
  150,    // Tier 3
  225,    // Tier 4
  338,    // Tier 5
  506,    // Tier 6
  759,    // Tier 7
  1139,   // Tier 8
  1709,   // Tier 9 (Arbiter unlock possible)
  2563    // Tier 10 (Full Arbiter)
];
```

### XP Sources
- Contract completion: 30 base + 10 per tier
- Combat victories: 15 standard, 30 rival
- Espionage operations: 25 + secrecy bonus
- Territory acquisition: 50 per site
- Enterprise milestones: 10 per trade route

### Arbiter Qualification (Tier 9+)
Requirements:
1. Selflessness score > 80
2. Legitimacy > 75
3. 5+ consistent Precedent Tags
4. 3+ high-trust NPC endorsements

### Role Track Unlocks
All four tracks advance with unified tier:
- **Spymaster**: Infiltration, informant recruitment, intelligence
- **Commander**: Combat maneuvers, unit recruitment, tactics
- **Steward**: Trade routes, infrastructure, welfare
- **Arbiter**: (Tier 9+) Judgment contracts, binding decisions

---

## Phase 4: NPC Engine

### Generation Architecture
```typescript
interface NPCTemplate {
  name: string;                    // Culturally appropriate
  ancestry: Ancestry;              // The Seven + Mixed
  type: 'RIVAL' | 'SPONSOR' | 'TRAINER' | 'MERCHANT' | 'INFORMANT';
  traits: PersonalityTrait[];      // 3 from 15-trait pool
  tier: number;                    // 1-10
  faction?: string;
  nomenclature: 'CROWNHEIM' | 'KRAGBRUD' | 'NEUTRAL';  // Political alignment
}
```

### Relationship Metrics
```typescript
interface NPCRelationship {
  trust: number;      // 0-100, reliability confidence
  fear: number;       // 0-100, threat assessment
  debt: number;       // 0-5 instances, obligations owed
}
```

### Relationship State Matrix
| Trust | Fear | State |
|-------|------|-------|
| High | Low | Alliance |
| Low | High | Terrified |
| High | High | Conflicted |
| Low | Low | Neutral |

### Rival System (3-5 major antagonists)
- Introduction scenario at tier thresholds
- Escalation through defeat cycles
- Recovery phases where they adapt
- Crisis point at 3 defeats: Execute or Mercy
- Mercy opens recruitment path

### Recruitment Gating
- Trust ≥70 OR Fear ≥80
- Player tier ≥ NPC tier
- Contextual permission met
- Roles: Champion, Patron, Coach, Quartermaster, Spy

---

## Phase 5: Combat System

### Core Moves (7 total)
```typescript
const COMBAT_MOVES = {
  STRIKE: { damage: 30, stamina: 5, description: 'Standard damage attack' },
  FEINT: { damage: 0, stamina: 10, description: 'Force enemy to neutral stance' },
  GUARD: { damage: 0, stamina: 0, description: 'Shift to defensive stance' },
  PRESS: { damage: 0, stamina: 0, description: 'Shift to aggressive stance' },
  RITE: { damage: 'varies', stamina: '15-40', description: 'Cast learned spells' },
  ITEM: { damage: 0, stamina: 0, description: 'Use consumables (negative crowd)' },
  FLEE: { damage: 0, stamina: 15, description: 'Escape attempt (70% success)' }
};
```

### Stance Triangle
```
Aggressive → beats Defensive (+50% damage, no counter)
Defensive → beats Neutral (+50% damage, no counter)
Neutral → beats Aggressive (+50% damage, no counter)

Disadvantage: -30% damage, 15-point counter-attack
```

### Rite Categories
| Category | Effects | Stamina Range |
|----------|---------|---------------|
| Destruction | Firebolt (40dmg), Lightning Strike (50+stun), Ice Shard (35+slow) | 15-25 |
| Restoration | Heal Wounds (30HP), Cure Poison, Revive (50HP+injury) | 15-40 |
| Protection | Shield (20 temp HP), Haste (+1 action), Stoneskin (50% reduction) | 15-25 |
| Control | Slow (-1 action), Silence (no rites), Fear (force defensive) | 20-30 |

### Injury System
**Levels (0-4):**
- 0: None
- 1: Cosmetic
- 2: -1 action/turn
- 3: -1 action + move restriction
- 4: Combat ineffective

**Wound Tags:**
- Bleeding: -3 HP/turn
- Limping: No Flee
- Dazed: No Rites
- Weakened: -50% damage
- Broken: Stance locked
- Poisoned: -5 HP/turn, -10 max stamina

### Pit Fight Integration
**Types:**
- Ranked: Advance standing, build Crowd Favor
- Grudge: Resolve rivalries, 2× XP
- Sponsored: NPC conditions, bonus rewards

**Crowd Favor (0-100):**
- 50+: Fan contracts
- 75+: Noble sponsorships
- 100: Champion status (1.5× Legitimacy)

---

## Phase 6: Contract Engine (S.L.A.T.E.)

### Generation Formula
```
5 sources × 6 objectives × 8 complications × 3 approaches = 720 base variants
× Multi-step sequencing (3-5 steps from 20 templates) = 172,800+ permutations
```

### Contract Sources
| Source | Quality | Variety | Special |
|--------|---------|---------|---------|
| Broker | 1.0 | 0.8 | Neutral |
| Guild | 1.2 | 0.6 | Specialized |
| Clan | 0.9 | 0.9 | Factional |
| Syndicate | 1.3 | 1.0 | Heat risk |
| Warlord | 1.5 | 0.7 | High-stakes |

### Objectives (6 types)
- Infiltration, Investigation, Elimination, Acquisition, Defense, Expansion

### Complications (8 types)
- Time pressure, witness restrictions, guard presence, factional interference
- Resource scarcity, ethical dilemmas, rival intervention, civilian presence

### Approach Lanes
| Lane | Style | Pros | Cons |
|------|-------|------|------|
| Force | Combat-based | Fast resolution | Witness exposure |
| Stealth | Covert | Minimal Legitimacy impact | Catastrophic if detected |
| Social | Relationship-based | Cleanest resolution | Requires prior investment |

### Heat Mechanics (0-100)
- 50+: Increased guards
- 75+: Rival pursuit
- 90+: Warlord attention
- Decays 5 points/day during quiet periods

### S.L.A.T.E. Categories
- **S (Spy Network)**: Infiltration, Investigation, Interrogation, Counterintel
- **L (Law & Order)**: Duels, Judgments, Enforcement, Precedent (tier 9+)
- **A (Armies)**: Recruitment, Training, Champion duels, Raiding
- **T (Territory)**: Capture, Defense, Infrastructure, Governance
- **E (Enterprise)**: Trade routes, Extraction, Markets, Corruption

---

## Phase 7: Recruitment & Armies

### Field Team Scaling
| Tier | Capacity | Requirement |
|------|----------|-------------|
| 1 | 4 | Starting |
| 4 | 8 | + Stronghold |
| 7 | 12 | + Multiple holdings |
| 9 | 16 | + Fortress |

### Army Scaling
- Initial: ~50 troops (tier 3, first site)
- Expansion: +15-30 per recruitment contract
- Mass recruitment: Hundreds via clan alliances (tier 5+)
- Endgame: 500-1,000 core + 3,000-5,000 allied (tier 9-10)

### Staff Roles (8 types)
| Role | Bonus |
|------|-------|
| Scout | Shadow lane +15%, ambush risk -20% |
| Broker | Better contracts, reduced costs |
| Delegate | Unrest -10%, Seal lane +10% |
| Quartermaster | Injury severity -1, logistics +15% |
| Instructor | Training buffs, stance mastery |
| Scribe | Proof seals +20%, failure -15% |
| Handler | Ops efficiency +20%, Heat -15% |
| Recruiter | Recruit chance +25%, hidden paths |

### Betrayal Mechanics
**Loyalty Thresholds:**
- >70: Near-zero risk
- 50-70: Low risk with warnings
- <50: Substantial risk

**Prevention:**
- Scribe warnings, Handler mediation
- Direct grievance resolution
- 1 Handler per 20 personnel

---

## Phase 8: Enterprise & Industry

### Node Types
- Resource extraction (mines, farms)
- Processing (smithies, mills)
- Trade posts (markets, caravans)
- Services (taverns, training)
- Illicit (gambling, smuggling)

### Regional Goods
| Biome | Goods |
|-------|-------|
| Jungle | Exotic hardwoods, rare herbs, wildlife, tropical fruits |
| Desert | Gemstones, minerals, glass, specialized textiles |
| Forest | Lumber, game meat, medicinal herbs, leather |
| Rainforest | Silk, tea, bamboo products, river fish |
| Mountains | Ores, gemstones, quality stone, cold-weather supplies |

### Supply Chain Example
```
Ore extraction (5g) → Smelting (15g) → Forging (40g) → Enchantment (90g)
```

### Market Channels
| Channel | Profit | Risk |
|---------|--------|------|
| Legal | Base | Stable, legitimate |
| Gray | +15-30% | Occasional fines |
| Black | Maximum | Heat, legitimacy damage, seizure |

### Corruption Temptations
- Exploitation: +15-30% profit, damages Stewardship
- Monopoly: Massive profit, damages Influence
- Smuggling: Premium prices, generates Heat, damages Honor
- Protection: Passive income, catastrophic Legitimacy damage

### Gambling Dens
- Income: 5-10g/day (poor) to 100+g/day (premium)
- Intelligence: Auto Witness Web additions, patron cultivation

---

## Phase 9: Territory Control

### Site Types
| Type | Personnel | Defenses | Function |
|------|-----------|----------|----------|
| Camp | 20-50 | Wooden | Resource extraction |
| Fort | 100-300 | Stone walls | Strategic positions |
| Stronghold | 500+ | Massive | Provincial capitals |

### Four Security Layers
1. **Steel**: Military force (garrison, patrols, guards)
2. **Stone**: Physical architecture (walls, gates, locks)
3. **Sigil**: Magical protections (wards, barriers, alarms)
4. **Story**: Social legitimacy (reputation, loyalty, support)

### Five Capture Methods
| Method | Casualties | Infrastructure | Legitimacy |
|--------|------------|----------------|------------|
| Assault | High | Damaged | Depends on conduct |
| Infiltration | Low | Preserved | Minimal (if undetected) |
| Legal Transfer | Zero | Preserved | Maximum |
| Economic Purchase | Zero | Preserved | Moderate |
| Diplomatic Pact | Zero | Preserved | Superior |

### Holding Management
- **Garrison**: Strength, morale, payment, rotation
- **Supply**: Food, water, equipment, siege reserves
- **Law**: Crime prevention, dispute resolution, civil order
- **Unrest**: Dissatisfaction mitigation, cultural respect

### Conquest Consequences
| Method | Unrest | Long-term |
|--------|--------|-----------|
| Brutal Assault | 40-80 | Crisis, rebellion risk |
| Restrained Assault | 15-30 | Moderate, natural decay |
| Infiltration/Legal | 0-15 | Minimal, smooth |

---

## Phase 10: Endgame Systems

### Overthrow Pathways (5 routes)
1. **Legal Authority** (Arbiter path): Council challenge, Legitimacy >90
2. **Clan Confederation**: Organize opposition, Trust >70 with 4/5 warlords
3. **Spy Network Dominance**: Intelligence leverage, 50+ actionable pieces
4. **Economic Control**: Resource pressure, 500+g/day passive income
5. **Divine Judgment**: Ritual challenge, Legitimacy 95+, climactic duel

### Post-Overthrow Watchdog Factions
Each pathway generates specific oversight challenges:
- Legal → Judicial councils review consistency
- Confederation → Warlords test autonomy respect
- Spy Network → Transparency advocates demand openness
- Economic → Labor organizations demand benefit sharing
- Divine → Religious authorities monitor principle adherence

### Power Overgrowth Threats
- **Foreign Invasion** (10+ sites, Legitimacy >75)
- **Internal Usurpers** (tier 10, from player's organization)
- **Supernatural Interference** (maximum Legitimacy)
- **Philosophical Opposition** (sustained governance)

### Tyrant Path Options
- Military Supremacy: Force-based control
- Economic Extraction: Maximum wealth generation
- Ideological Tyranny: Forced belief system
- Chaos Embrace: Deliberate destabilization

### Perpetual Content Generation
- **Factional Crisis**: Conflicts requiring intervention
- **Economic Cycle**: Boom/bust patterns
- **Military Threat**: Border raiders, foreign powers
- **Supernatural Event**: Otherworldly complications

---

## Phase 11: UI Components

### Pages to Update/Create
1. **Home**: Dashboard with new resource displays
2. **Combat**: Stance triangle, rite system, pit fights
3. **Contracts**: S.L.A.T.E. generation, approach selection
4. **World Map**: Biome navigation, territory control
5. **NPCs**: Relationship tracking, recruitment
6. **Roster**: Field teams, staff management
7. **Army**: Military units, garrison management
8. **Enterprise**: Node management, supply chains
9. **Territory**: Holdings, security layers
10. **Arbiter** (tier 9+): Judgment contracts, precedent review

---

## Phase 12: Content Population

### Target: 30-hour minimum gameplay

**NPCs:**
- 100+ fixture NPCs across settlements
- 5 travelers per biome
- 5 major rivals with full storylines
- 5 regional warlords

**Contracts:**
- 200+ contract templates
- 20 scene templates for multi-step sequencing
- 172,800+ procedural combinations

**Combat:**
- 7 enemy archetypes fully balanced
- 140+ tactical trial questions
- 50+ pit fight scenarios

**World Events:**
- 30+ crisis event templates
- 20+ economic cycle patterns
- 15+ supernatural occurrences

---

## Implementation Order

1. **Schema/Types** - Foundation for all systems
2. **World Data** - Biomes, settlements, NPCs
3. **Game Engine** - Core state management
4. **Combat System** - Most interactive element
5. **Contract Engine** - Primary content delivery
6. **Progression** - Ties everything together
7. **Territory/Enterprise** - Strategic depth
8. **Endgame** - Long-term engagement
9. **UI Updates** - Player-facing polish
10. **Content Population** - Volume for 30 hours

---

## Version Information

- **Target Version**: 1.0.0
- **Storage Key**: `arbiter_crownheim_save_v1`
- **Minimum Gameplay**: 30 hours
- **Branch**: `claude/update-sandbox-artifacts-OE1NK`

---

*Document generated from design specification dated December 31, 2025*
