# Project Tanelorn Reborn (Working Title)

## Concept
A mobile-first, browser-based RPG inspired by 1980s BBS door games (specifically Tanelorn BBS).

## Design & Aesthetics
- **Visual Style**:
  - "Terminal" aesthetic: Black background, monospaced font (Green/Amber/White text options?).
  - **ASCII Art**:
    - "Tanelorn BBS" logo on login.
    - Castle ASCII art on main menu.
- **Audio**:
  - **Modem Handshake**: Plays when user clicks "Connect"/Login.

## Core Mechanics
- **Text-based Interface**: Minimalist, nostalgic UI.
- **Combat System**:
  - Simple turn-based loop: (A)ttack or (R)un.
  - Outcome based on RNG + Stat Modifiers (Str/Def/Agi).
  - "Can't always run" mechanic (agility check).
  - Real-time combat log: "You hit Orc for 12 dmg! (HP: 48/60)" / "Orc hits you for 8 dmg! (HP: 32/50)".
- **Asynchronous PvP**: Players can raid each other's "castles" while offline.
- **Login Summary**: Immediate notification of offline events (raids, defense, losses/wins).
- **Character Progression**:
  - Quests for XP/gold.
  - Leveling up.
  - Gear purchases (weapons/armor) to improve stats.
- **Mobile Optimized**: Designed for quick play sessions on a phone browser.

## Inspiration
- Tanelorn BBS (C64 era)
- Legend of the Red Dragon (LORD)?
- Usurper?
- TradeWars 2002?

## Potential Tech Stack
- **Frontend**: React/Next.js (Mobile-first UI library like Shadcn/UI or specialized retro UI).
- **Backend**: Node.js/TypeScript (Express or Hono).
- **Database**: PostgreSQL or SQLite (Prisma ORM).
- **Deployment**: Vercel/Coolify.

## Next Steps
1. Define the specific mechanics (turn-based daily limit? energy system?).
2. Choose a name.
3. Set up the repo and basic stack.
