# The Arbitor of the Mainland v0.8.1

## Overview

The Arbitor of the Mainland (formerly S.L.A.T.E.) is a mobile-first, text-centric fantasy strategy game. Players take on the role of Kami "The Kitsune" Reiss, a rising power broker managing four parallel role tracks: Spymaster, Commander, Steward, and Arbitor. The game focuses on resource management, contract execution, role progression, tactical trials (quiz combat), roster management, and world exploration with NPC interactions.

**Version 0.8.1 Features:**
- Trainer NPC System: 7 unlockable trainers with practice modes and specialty bonuses
- Gear/Equipment System: Weapons, armor, trinkets with combat bonuses (+timer, -damage, +mastery)
- Narrative Combat Scenes: Archetype-specific intro, taunt, hit, miss, and wounded dialogue
- NPC Dialogue System: Role-based greetings/farewells with trust-level variations (9 roles, 8 ancestries)
- Contextual NPC Actions: Role-specific action menus with trust/standing requirements (45+ actions)
- Enhanced Log Viewer: Collapsible entries, filtering, animations, mobile-friendly touch targets
- Prologue Tutorial: First-time player onboarding scenes
- Improved Settings: Save, Load, Restart Game buttons with confirmation dialogs

**Version 0.8 Features:**
- Tactical Trials: Quiz-based combat replacing turn-based system
- 140+ questions across 5 categories (Lore, Doctrine, Pattern, Culture, Ethics)
- Mastery tracking per archetype (7 types) and per rival (4 major)
- Graduated timer system (15s→8s based on mastery level)
- Learning style preferences support
- Safe migration from v0.7 saves

**Previous Version Features (v0.7):**
- Contract/quest engine with 3-lane approaches (Shadow/Seal/Steel)
- Roster management with staff roles and army scaling
- Injury/escape model (no permadeath)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Custom game engine with LocalStorage persistence (`client/src/lib/game-engine.ts`)
- **Styling**: Tailwind CSS with custom dark "Slate" theme, CSS variables for theming
- **UI Components**: Radix UI primitives wrapped with shadcn/ui component library
- **Animations**: Framer Motion for complex UI transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Purpose**: Primarily serves static files; game logic runs client-side
- **API**: Minimal REST endpoints (health check only for this prototype)
- **Development**: tsx for TypeScript execution, Vite middleware for HMR

### Data Storage
- **Primary Storage**: Browser LocalStorage for game state persistence
- **Storage Key**: `arbitor_mainland_save_v07` (migrates from `slate_sandbox_save_v2`)
- **Schema Validation**: Zod schemas in `shared/schema.ts` for type safety
- **Database Ready**: Drizzle ORM configured with PostgreSQL for future server-side sync (currently unused)

### Key Design Patterns
- **Game Engine Pattern**: Centralized state management in `game-engine.ts` with subscription-based updates
- **Custom Hook**: `useGameState` hook provides React components access to game state and actions
- **Shared Types**: Common schemas in `shared/` directory ensure type consistency between client validation and future server integration
- **Component Library**: Extensive shadcn/ui component collection in `client/src/components/ui/`

### Page Structure
- **Home** (`/`): Main dashboard with resources, contract simulator, role cards, Three Marks display, Heat/Injury meters, and activity log
- **Combat** (`/combat`): Tactical Trials - quiz-based combat with mastery tracking, timed questions, injury system
- **Contracts** (`/contracts`): Active contracts with 3-lane resolution (Shadow/Seal/Steel), variety engine display
- **Tavern** (`/tavern`): Social hub with Talk/Flirt/Fight system, recruitment opportunities
- **Roster** (`/roster`): Field team management, staff roles with bonuses, army abstraction
- **World Bible** (`/world`): Biome and settlement exploration with 5 biomes, 20 settlements, cultural traditions
- **Districts** (`/districts`): District-level navigation, black market rules, 26 districts with ancestry/function types
- **NPC Engine** (`/npcs`): NPC relationships (5 metrics: trust/fear/debt/leverage/standing), recruitment gating, 4 major rivals

### Core Data Files
- **client/src/lib/game-engine.ts**: Central game state management with all actions
- **client/src/lib/world-data.ts**: World geography, NPCs, settlements, districts
- **client/src/lib/combat-data.ts**: Combat moves, stances, rites, enemy archetypes, sponsors (legacy)
- **client/src/lib/quiz-data.ts**: Tactical Trials questions, mastery system, timer logic
- **client/src/lib/contract-data.ts**: Contract generation, lanes, encounter types, variety engine

### World Data Structure
- **5 Biomes**: Coastal Lowlands, River Basin, Highland Plateau, Forest Interior, Arid Frontier
- **20 Settlements**: Distributed across biomes with population tiers and cultural traits
- **26 Districts**: Hybrid ancestry/function districts (Elven Enclave, Halfling Quarter, Orcish Ward, etc.)
- **28+ Fixture NPCs**: 4-6 per district with roles (Merchant, Informant, Guard, etc.)
- **5 Travelers**: Roaming NPCs that move between settlements
- **4 Major Rivals**: Antagonists with escalation stages 0-5

### Part 5: Combat System (Legacy)
Note: Turn-based combat has been replaced by Tactical Trials in v0.8.
- **7 Core Moves**: Strike, Guard, Step, Bind, Invoke, Feint, Rally
- **5 Stances**: Balanced, Aggressive, Defensive, Evasive, Focused
- **5 Rite Categories**: Evocation, Warding, Binding, Enhancing, Divining
- **Injury System**: 0-5 levels + wound tag (Hexed, Limping, Scarred, Concussed, Bleeding)
- **Pit Fights**: Crowd favor system, sponsors who offer staff hires
- **Enemy Archetypes**: Bruiser, Skirmisher, Hexer, Shieldbearer, Snarer, Duelist, Swarm
- **No Permadeath**: Injury/Escape model ensures player always survives

### Part 6: Contract System
- **Max 5 Active Contracts**: Multi-step quests with 3-5 steps each
- **3 Lanes Per Step**: Shadow (covert), Seal (diplomatic), Steel (force)
- **Meters**: Heat (0-100), Unrest per settlement
- **Fail-Forward**: Some contracts allow continuation with complications
- **Variety Engine**: 45,760+ combinations proven (8,640 scene + 34,560 encounter + 2,560 name)
- **Sources**: Broker, Guild, Clan, Syndicate
- **SLATE Axes**: S (Spy), L (Law), A (Army), T (Territory), E (Enterprise)

### Part 7: Roster & Army
- **Field Team Scaling**: 4→8→12→16 based on Commander/Steward tier milestones
- **8 Staff Roles**: Scout, Handler (+15% Shadow), Delegate, Scribe (+15% Seal), Quartermaster, Instructor (+15% Steel), Broker, Recruiter
- **Roster Slots**: OPS, STAFF, CADRE, DISTRICT_ASSET
- **Army Abstraction**: Garrison 0-900, readiness/supply/discipline meters
- **Betrayal Risk**: LOW/MEDIUM/HIGH based on relationship metrics
- **Prevention Levers**: Pay, Oath-Sigil, Transparency, Rotate Duty

### Part 8: Tactical Trials (v0.8)
- **Quiz-Based Combat**: Knowledge tests replace turn-based moves
- **5 Question Categories**: Lore, Doctrine, Pattern, Culture, Ethics
- **140+ Questions**: 35+ Lore, 30 Doctrine, 35 Pattern, 15 Culture, 5 Ethics, 20 Rival-specific
- **7 Archetypes**: Bruiser, Skirmisher, Hexer, Shieldbearer, Snarer, Duelist, Swarm
- **4 Major Rivals**: Varen, Sable, Korrath, Mistveil (with escalation stages)
- **Mastery System**: Per-archetype and per-rival tracking (0-100%)
- **Graduated Timer**: 15s base → 8s floor based on mastery (15→13→11→8)
- **Damage System**: 0-100 with injury thresholds at 25%, 50%, 75%
- **Exchange Structure**: 3-4 questions per exchange, 3 total exchanges per trial
- **Learning Style Preferences**: Conceptual, Sequential, Analytical, Untimed, Observational, Practical

### Special Systems
- **Three Marks**: Orc legitimacy system (Strength, Mind, Stewardship) for world influence
- **Black Market Rules**: Exists everywhere EXCEPT Elven Enclaves and Halfling Quarters (clean hubs)
- **Recruitment Gating**: NPCs require trust/standing thresholds, optionally role tiers, and forbidden flags
- **Dirty Tactics**: Valid in combat but cost legitimacy heavily if public/witnessed

## External Dependencies

### UI Framework
- **Radix UI**: Full primitive set for accessible components (dialog, tabs, accordion, etc.)
- **shadcn/ui**: Pre-styled component wrappers using Radix primitives
- **Lucide React**: Icon library

### Data & Validation
- **Zod**: Runtime schema validation for game state
- **TanStack Query**: Data fetching (prepared for future API integration)
- **Drizzle ORM**: Database toolkit (PostgreSQL ready, not actively used)

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Full type coverage across client, server, and shared code

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Safe class merging utility
