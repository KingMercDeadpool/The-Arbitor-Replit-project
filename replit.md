# S.L.A.T.E. Sandbox

## Overview

S.L.A.T.E. (Spy Network, Law & Order, Armies, Territory, Enterprise & Industry) is a mobile-first, text-centric fantasy strategy game prototype. Players take on the role of Kami "The Kitsune" Reiss, a rising power broker managing four parallel role tracks: Spymaster, Commander, Steward, and Arbitor. The game focuses on resource management, contract execution, role progression, and world exploration with NPC interactions.

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
- **Schema Validation**: Zod schemas in `shared/schema.ts` for type safety
- **Database Ready**: Drizzle ORM configured with PostgreSQL for future server-side sync (currently unused)

### Key Design Patterns
- **Game Engine Pattern**: Centralized state management in `game-engine.ts` with subscription-based updates
- **Custom Hook**: `useGameState` hook provides React components access to game state and actions
- **Shared Types**: Common schemas in `shared/` directory ensure type consistency between client validation and future server integration
- **Component Library**: Extensive shadcn/ui component collection in `client/src/components/ui/`

### Page Structure
- **Home** (`/`): Main dashboard with resources, contract simulator, role cards, and activity log
- **World Bible** (`/world`): Biome and settlement exploration
- **Districts** (`/districts`): District-level navigation and NPC discovery
- **NPC Engine** (`/npcs`): NPC relationships, recruitment, and rival tracking

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