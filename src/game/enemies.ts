import { Enemy } from './types';

/**
 * Enemy bestiary for Tanelorn Reborn
 * Templates for random encounters spanning levels 1-10
 */
const ENEMIES: Omit<Enemy, 'maxHp'>[] = [
  {
    name: 'Sewer Rat',
    level: 1,
    hp: 30,
    strength: 5,
    defense: 2,
    agility: 4,
    xpReward: 15,
    goldReward: 5,
    ascii: `
   /\\_/\\
  ( o.o )
   > ^ <`,
  },
  {
    name: 'Goblin Runt',
    level: 2,
    hp: 45,
    strength: 7,
    defense: 3,
    agility: 6,
    xpReward: 25,
    goldReward: 10,
    ascii: `
    ___
   /o o\\
  (  >  )
   \\___/`,
  },
  {
    name: 'Orc Grunt',
    level: 3,
    hp: 60,
    strength: 10,
    defense: 5,
    agility: 5,
    xpReward: 40,
    goldReward: 15,
    ascii: `
   _____
  /[] []\\
  | o_o |
  |  ~  |
   \\___/`,
  },
  {
    name: 'Skeleton Warrior',
    level: 4,
    hp: 70,
    strength: 12,
    defense: 6,
    agility: 8,
    xpReward: 55,
    goldReward: 20,
    ascii: `
   _____
  | o o |
  |  ^  |
  |[___]|
   || ||`,
  },
  {
    name: 'Dark Elf Scout',
    level: 5,
    hp: 80,
    strength: 14,
    defense: 8,
    agility: 10,
    xpReward: 60,
    goldReward: 25,
    ascii: `
    /\\
   /**\\
  /\\o/\\
  | ^ |
  /| |\\`,
  },
  {
    name: 'Troll Berserker',
    level: 6,
    hp: 110,
    strength: 18,
    defense: 10,
    agility: 6,
    xpReward: 80,
    goldReward: 35,
    ascii: `
   #####
  ## O ##
  # \\_/ #
  ##M##
   ## ##`,
  },
  {
    name: 'Wraith',
    level: 7,
    hp: 95,
    strength: 20,
    defense: 12,
    agility: 14,
    xpReward: 100,
    goldReward: 45,
    ascii: `
    ___
   (o.o)
   {~~~}
    \\ /
     V`,
  },
  {
    name: 'Dragon Whelp',
    level: 8,
    hp: 140,
    strength: 24,
    defense: 15,
    agility: 12,
    xpReward: 130,
    goldReward: 60,
    ascii: `
   /\\_/\\
  (>O<)>
  /|  |\\
   \\===/
    ^^^`,
  },
  {
    name: 'Lich Apprentice',
    level: 9,
    hp: 120,
    strength: 26,
    defense: 16,
    agility: 15,
    xpReward: 160,
    goldReward: 70,
    ascii: `
    ___
   |o_o|
   | = |
   |___|
   ~~~~~`,
  },
  {
    name: 'Shadow Knight',
    level: 10,
    hp: 200,
    strength: 28,
    defense: 18,
    agility: 16,
    xpReward: 200,
    goldReward: 80,
    ascii: `
    /^\\
   |[O]|
   | H |
   /| |\\
   || ||`,
  },
];

/**
 * Get a random enemy encounter based on player level
 * Returns enemies within range [playerLevel - 1, playerLevel + 3]
 *
 * @param playerLevel - Current player level
 * @returns A new Enemy instance with maxHp initialized
 */
export function getRandomEncounter(playerLevel: number): Enemy {
  const minLevel = Math.max(1, playerLevel - 1);
  const maxLevel = playerLevel + 3;

  // Filter enemies in level range
  const eligibleEnemies = ENEMIES.filter(
    (enemy) => enemy.level >= minLevel && enemy.level <= maxLevel
  );

  // If no enemies in range (shouldn't happen with good data), find closest
  const selectedTemplate = eligibleEnemies.length > 0
    ? eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)]
    : ENEMIES.reduce((closest, enemy) =>
        Math.abs(enemy.level - playerLevel) < Math.abs(closest.level - playerLevel)
          ? enemy
          : closest
      );

  // Return a spread copy with maxHp set (prevents template corruption)
  return {
    ...selectedTemplate,
    maxHp: selectedTemplate.hp,
  };
}
