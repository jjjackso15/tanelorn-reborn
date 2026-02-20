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
- ASCII castle art
- Menu options with keyboard shortcut badges:
  - (E)nter the Realm
  - (V)iew Character
  - (L)eaderboard
  - (S)ettings
  - (Q)uit

### Terminal Aesthetic
- Black background with green monospace text
- CRT scanline animation overlay
- Glow effects on interactive elements
- Framer Motion transitions between screens

### Responsive Design
- Mobile-first layout
- Scaled ASCII art for different screen sizes
- Touch-friendly menu buttons

## Planned Features

### Combat System
- Turn-based loop: (A)ttack or (R)un
- RNG + stat modifiers (Str/Def/Agi)
- "Can't always run" mechanic (agility check)
- Real-time combat log

### Character Progression
- Quests for XP/gold
- Leveling system
- Gear purchases (weapons/armor)

### Asynchronous PvP
- Raid other players' castles while offline
- Castle defense mechanics
- Login summary of offline events

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
