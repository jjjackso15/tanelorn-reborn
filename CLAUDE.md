# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tanelorn Reborn is a mobile-first, browser-based RPG with a 1980s BBS aesthetic. Inspired by classic door games like Legend of the Red Dragon and TradeWars 2002. Currently in early development with login/connection simulation and main menu UI implemented.

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
  │   ├── layout.tsx       # Root layout with metadata and fonts
  │   ├── page.tsx         # Main page (login screen + main menu)
  │   ├── constants.ts     # ASCII art and styling constants
  │   └── globals.css      # Global styles with CRT scanline effect
  └── components/
      └── Terminal.tsx     # Reusable terminal wrapper with CRT overlay
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

### Responsive Design
- Mobile-first with scaled ASCII art: `text-[8px] sm:text-[10px] md:text-xs`
- Max-width constraints for readability on large screens

## Current State

The app has two UI states:
1. **Login Screen:** ASCII logo + simulated modem handshake animation
2. **Main Menu:** ASCII castle + game menu options with keyboard shortcut badges

Audio currently uses a placeholder URL; production should serve from `/public/sounds/modem.mp3`.

## Planned Features

- Turn-based combat with (A)ttack/(R)un mechanics
- Character progression (quests, leveling, gear)
- Asynchronous PvP (offline raids, castle defense)
- Login summary notifications for offline events
