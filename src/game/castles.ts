import { Castle } from '@/game/types';

/**
 * NPC Castle definitions for Tanelorn Reborn
 * Each castle has an NPC boss with ~1.5x HP and ~1.2x stats vs same-level regulars
 */
export const NPC_CASTLES: Castle[] = [
  {
    id: 'goblin-stockade',
    name: 'Goblin Stockade',
    ownerType: 'npc',
    ownerName: 'Chieftain Grix',
    requiredLevel: 2,
    turnCost: 2,
    bonusXpMultiplier: 2,
    bonusGoldMultiplier: 2,
    ascii: `
   |  |
  /|  |\\
 / |__| \\
 |______|`,
    boss: {
      name: 'Chieftain Grix',
      level: 4,
      hp: 105,
      maxHp: 105,
      strength: 14,
      defense: 7,
      agility: 10,
      xpReward: 80,
      goldReward: 40,
      ascii: `
    _/\\_
   (o  o)
  /| ++ |\\
   |_/\\_|
    || ||`,
    },
  },
  {
    id: 'bone-citadel',
    name: 'Bone Citadel',
    ownerType: 'npc',
    ownerName: 'Lord Skullcap',
    requiredLevel: 4,
    turnCost: 2,
    bonusXpMultiplier: 2,
    bonusGoldMultiplier: 2.5,
    ascii: `
   T  T
  /|  |\\
 | |  | |
 |_|__|_|`,
    boss: {
      name: 'Lord Skullcap',
      level: 6,
      hp: 165,
      maxHp: 165,
      strength: 22,
      defense: 12,
      agility: 7,
      xpReward: 120,
      goldReward: 55,
      ascii: `
   _===_
  |x  x|
  | \\/ |
  |_||_|
  /||||\\`,
    },
  },
  {
    id: 'dark-fortress',
    name: 'Dark Fortress',
    ownerType: 'npc',
    ownerName: 'Baron Ironhelm',
    requiredLevel: 6,
    turnCost: 2,
    bonusXpMultiplier: 2.5,
    bonusGoldMultiplier: 3,
    ascii: `
  T    T
  |    |
 /|    |\\
 ||    ||
 ||____||`,
    boss: {
      name: 'Baron Ironhelm',
      level: 8,
      hp: 210,
      maxHp: 210,
      strength: 29,
      defense: 18,
      agility: 14,
      xpReward: 195,
      goldReward: 90,
      ascii: `
   [====]
   |O  O|
   | <> |
  /|____|\\
  ||    ||`,
    },
  },
  {
    id: 'shadow-keep',
    name: 'Shadow Keep',
    ownerType: 'npc',
    ownerName: 'The Dark Lord',
    requiredLevel: 8,
    turnCost: 2,
    bonusXpMultiplier: 3,
    bonusGoldMultiplier: 3.5,
    ascii: `
  T~  ~T
  |\\  /|
  | \\/ |
 /| /\\ |\\
 || || ||`,
    boss: {
      name: 'The Dark Lord',
      level: 10,
      hp: 300,
      maxHp: 300,
      strength: 34,
      defense: 22,
      agility: 19,
      xpReward: 300,
      goldReward: 120,
      ascii: `
   /\\  /\\
  |  \\/  |
  | \\oo/ |
  |  \\/  |
  /|____|\\`,
    },
  },
];

/**
 * Get castles available to the player based on their level
 */
export function getAvailableCastles(playerLevel: number): Castle[] {
  return NPC_CASTLES.filter((castle) => castle.requiredLevel <= playerLevel);
}
