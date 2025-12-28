# S.L.A.T.E. Sandbox (Prototype)

This is a mobile-first, text-centric fantasy strategy prototype focusing on the progression of **Kami “The Kitsune” Reiss**.

## Core Concept
S.L.A.T.E. stands for **Spy Network, Law & Order, Armies, Territory, Enterprise & Industry**.
You play as a rising power broker managing four parallel role tracks:
- **Spymaster**
- **Commander**
- **Steward**
- **Arbitor**

## How to Play

### 1. The Dashboard
View your current resources:
- **Renown (R)**: Your public fame.
- **Leverage (L)**: Your hold over others.
- **Capacity (C)**: Your operational bandwidth.
- **Legitimacy**: Your right to rule (0-100%).
- **Role Tokens**: Currency for upgrading roles.

### 2. Contract Simulator
Execute steps in a "Contract" to earn resources and Role Tokens.
Choose your approach wisely:
- **CLEAN**: Safe, builds Legitimacy.
- **GRAY**: Efficient, risks Legitimacy.
- **PUBLIC**: High Renown, varies Legitimacy.
- **COVERT**: High Leverage, high Legitimacy risk.

Every 3 steps completed grants **1 Role Token**.

### 3. Role Progression
Visit the "Roles" tab to spend tokens and upgrade your tiers (1-10).
- Upgrades require **Role Tokens** + **Resources** + **Legitimacy**.
- **Arbitor Tier 9+** is heavily gated by "Hard Lines" and specific achievements (simulated via toggles in this prototype).

### 4. Persistence
Your progress is saved automatically to your browser's LocalStorage. You can reset it via the "Reset Save" button in the footer.

## Running the App
The app is built with React + Vite.
- Start the server: `npm run dev` (or press Run in Replit)
- Open the web view on a mobile device or narrow window for the best experience.

## Future Roadmap (Step 2)
- **Combat & Contracts Engine**: Actual tactical decisions for contracts.
- **World Map**: Visualizing territory control.
- **NPC Generation**: Procedural generation of contacts and rivals.
