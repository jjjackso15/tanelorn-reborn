# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tanelorn Reborn is a mobile-first, browser-based RPG with a 1980s BBS aesthetic. Inspired by classic door games like Legend of the Red Dragon and TradeWars 2002. Features login simulation, turn-based combat with multiple entry modes (adventure, explore, bounty, castle raid), equipment system, and a market.

## Commands

```bash
npm run dev          # Start Next.js development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Git Workflow

Use feature branches with pull requests to main:

1. Create a feature branch from main: `git checkout -b feature/description`
2. Make commits with descriptive messages
3. Push branch and open a PR to main
4. Merge after review

Branch naming: `feature/`, `fix/`, `refactor/` prefixes

## Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** TailwindCSS 4, clsx, tailwind-merge
- **Animation:** Framer Motion
- **Audio:** Howler.js
- **TypeScript:** Strict mode enabled

## Architecture

```
/src
  ├── app/
  │   ├── layout.tsx           # Root layout with metadata and fonts
  │   ├── page.tsx             # Main page — screen routing, state management, all handlers
  │   ├── constants.ts         # ASCII art and styling constants
  │   └── globals.css          # Global styles with CRT scanline effect
  ├── components/
  │   ├── Terminal.tsx          # Reusable terminal wrapper with CRT overlay
  │   ├── CombatScreen.tsx     # Turn-based combat UI with context-aware headers/rewards
  │   ├── MarketScreen.tsx     # Tabbed market: healer, weapons, armor, castle upgrades
  │   ├── QuestBoard.tsx       # Bounty board with targeted kill missions
  │   ├── AdventureBoard.tsx   # Zone selection + inline non-combat event resolution
  │   └── CastleRaid.tsx       # NPC castle list for boss raids
  └── game/
      ├── types.ts             # All game types (Screen, PlayerState, Enemy, Combat, Equipment, Zones, etc.)
      ├── combat.ts            # Damage/flee formulas, turn executor, initial player factory
      ├── enemies.ts           # 10-enemy bestiary, random encounter + lookup by name
      ├── market.ts            # Weapons, armors, castle defenses, healing cost, availability filters
      ├── quests.ts            # Bounty generation and target enemy lookup
      ├── zones.ts             # 5 adventure zones, weighted event generation
      └── castles.ts           # 4 NPC castles with boss definitions
```

**Path alias:** `@/*` maps to `./src/*`

## Design Patterns

### Terminal Aesthetic
- Black background with green text (`text-green-500`/`text-green-400`)
- Monospace font throughout
- CRT scanline animation overlay (defined in globals.css)
- Glow effects using custom shadow values

### React Patterns
- Client components marked with `'use client'`
- `useRef` for persistent audio instances (avoid recreation on re-renders)
- Lazy audio initialization on user interaction (browser autoplay policy)
- Framer Motion `AnimatePresence` for state transitions
- `useCallback` for all handlers (stable references for keyboard listeners)
- Game state lives in `page.tsx`; child components receive handlers as props
- Combat receives `getEffectivePlayer()` (base stats + equipment bonuses)

### Game Data Patterns
- Enemy templates stored as `Omit<Enemy, 'maxHp'>[]`, spread-copied with `maxHp` set on retrieval
- Weighted random selection via cumulative thresholds (zones.ts `generateEvent`)
- Market items filtered by `requiredLevel` and ownership checks
- `CombatContext` discriminated union drives reward calculation in `handleCombatEnd`

### Responsive Design
- Mobile-first with scaled ASCII art: `text-[8px] sm:text-[10px] md:text-xs`
- Max-width constraints for readability on large screens

## Current State

The app has 7 screen states managed by `page.tsx`:
1. **Login Screen:** ASCII logo + simulated modem handshake animation
2. **Main Menu:** ASCII castle + 7 menu options with keyboard shortcuts (A/E/R/B/M/S/Q)
3. **Combat:** Turn-based fight with context-aware headers/rewards (adventure, bounty, zone, raid)
4. **Market:** Tabbed interface — healer (H), weapons (W), armor (A), castle upgrades (C)
5. **Quest Board:** 4 level-scaled bounties with bonus XP/gold
6. **Adventure Board:** 5 zones with weighted random events, inline non-combat resolution
7. **Castle Raid:** 4 NPC castles with boss fights, 2-turn cost, multiplied rewards

### Game Logic
- **Equipment bonuses** are computed as effective stats before passing to CombatScreen (weapon STR + armor DEF)
- **Combat context** (`CombatContext` type) determines reward calculation: standard, bounty bonus, raid multipliers
- **Turn economy**: adventure/explore/bounty cost 1 turn, raids cost 2 turns, healing costs 1 turn
- **Level gating**: zones, castles, and equipment filter by `requiredLevel`

Audio served locally from `/public/sounds/modem.mp3`.

## Planned Features

- Asynchronous PvP (offline raids, castle defense using purchased defenses)
- Login summary notifications for offline events
- Mailbox system for PvP notifications
- Stats screen implementation
