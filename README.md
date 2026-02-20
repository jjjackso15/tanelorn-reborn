# Tanelorn Reborn

A mobile-first, browser-based RPG inspired by 1980s BBS door games like Tanelorn BBS, Legend of the Red Dragon, and TradeWars 2002.

## Getting Started

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

## Implemented Features

### Login Screen
- ASCII "Tanelorn BBS" logo
- Simulated modem handshake animation with connection log
- Modem dial-up sound effect (Howler.js)

### Main Menu
- ASCII castle art with keyboard shortcut badges:
  - [A] Adventure — random encounter quick fight
  - [E] Explore — 6-step dungeon delve with bosses and relics
  - [R] Raid Castle — boss fights in NPC castles (2 turns)
  - [B] Bounty Board — targeted kills for bonus rewards
  - [M] Market — healer, weapons, armor, castle upgrades
  - [S] Stats (placeholder)
  - [Q] Quit

### Combat System
- Turn-based loop: (A)ttack or (R)un
- RNG + stat modifiers (Str/Def/Agi)
- Agility-based flee chance (10%–90%)
- Real-time animated combat log
- 10-enemy bestiary spanning levels 1–10 with ASCII art
- Level-up progression (stat increases, HP restore)
- Equipment bonuses applied to effective combat stats
- Context-aware combat: adventure, bounty, zone, and raid modes

### Dungeon Delve (Explore)
- 6-step dungeon crawl through 5 zones with risk/reward loop
- Zone selection: Whispering Forest, Sunken Dungeon, Crystal Caves, Darkwood Swamp, Abyssal Depths
- Step-by-step progression: choose to delve deeper or retreat after each step
- Weighted random events per step: combat, trap, merchant, buffer NPC, healer, treasure
- Steps 1-3 include friendly NPCs; steps 4-5 are hostile only; step 6 is always a zone boss
- Zone bosses with unique permanent Relic drops (+STR/DEF/AGI stat bonuses)
- DOT effects (poison/fire) from traps that tick each step
- In-delve merchants selling temporary buff items per zone
- Buffer NPCs grant free stat buffs for the current delve
- Retreat keeps all accumulated rewards; defeat loses 50% delve gold
- Cleared bosses are tracked — re-delving yields a strong enemy instead
- Difficulty tiers: easy, medium, hard, deadly
- Level-gated zone access

### Castle Raids
- 4 NPC castles with custom boss enemies (~1.5x HP, ~1.2x stats)
- XP/Gold multipliers (2x–3.5x)
- 2-turn cost per raid
- Level-gated access

### Bounty Board
- Level-scaled bounty generation from enemy pool
- Bonus XP (50%) and gold (75%) on top of base rewards
- 4 bounties per visit with flavor text descriptions

### Market
- **Healer**: Full HP restore, cost scales with level and missing HP
- **Weapons** (5): Rusty Sword → Dragon Fang (+2 to +18 STR)
- **Armor** (5): Leather Vest → Shadow Plate (+2 to +16 DEF)
- **Castle Defenses** (4): Upgrades with checkmarks for owned items
- Tab navigation with keyboard shortcuts

### Terminal Aesthetic
- Black background with green monospace text
- CRT scanline animation overlay
- Glow effects on interactive elements
- Framer Motion transitions between screens

### Responsive Design
- Mobile-first layout
- Scaled ASCII art for different screen sizes
- Touch-friendly menu buttons with keyboard shortcuts

## Planned Features

### Asynchronous PvP
- Raid other players' castles while offline
- Castle defense mechanics (uses purchased castle defenses)
- Login summary notifications for offline events
- Mailbox system for PvP notifications

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** TailwindCSS 4, clsx, tailwind-merge
- **Animation:** Framer Motion
- **Audio:** Howler.js
- **Language:** TypeScript (strict mode)

## Inspiration

- Tanelorn BBS (C64 era)
- Legend of the Red Dragon (LORD)
- Usurper
- TradeWars 2002
