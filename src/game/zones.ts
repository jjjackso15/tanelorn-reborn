import { Zone, ZoneEvent } from '@/game/types';
import { getEnemyByName } from '@/game/enemies';

/**
 * Adventure zones for Tanelorn Reborn
 * Each zone has a difficulty tier, enemy pool, and weighted event table
 */
export const ZONES: Zone[] = [
  {
    id: 'whispering-forest',
    name: 'Whispering Forest',
    difficulty: 'easy',
    minLevel: 1,
    maxLevel: 3,
    enemyPool: ['Sewer Rat', 'Goblin Runt'],
    eventWeights: { combat: 40, treasure: 20, trap: 10, healer: 20, nothing: 10 },
    ascii: `
  /\\  /\\  /\\
 /  \\/  \\/  \\
/    ||  ||   \\
     ||  ||`,
  },
  {
    id: 'sunken-dungeon',
    name: 'Sunken Dungeon',
    difficulty: 'medium',
    minLevel: 3,
    maxLevel: 5,
    enemyPool: ['Orc Grunt', 'Skeleton Warrior', 'Dark Elf Scout'],
    eventWeights: { combat: 50, treasure: 15, trap: 15, healer: 10, nothing: 10 },
    ascii: `
   _______
  |  ___  |
  | |   | |
  | |___| |
  |_______|`,
  },
  {
    id: 'crystal-caves',
    name: 'Crystal Caves',
    difficulty: 'medium',
    minLevel: 4,
    maxLevel: 7,
    enemyPool: ['Skeleton Warrior', 'Dark Elf Scout', 'Troll Berserker'],
    eventWeights: { combat: 50, treasure: 20, trap: 10, healer: 10, nothing: 10 },
    ascii: `
  /\\    /\\
 /  \\  /  \\
/  * \\/  * \\
\\  * /\\  * /
 \\  /  \\  /
  \\/    \\/`,
  },
  {
    id: 'darkwood-swamp',
    name: 'Darkwood Swamp',
    difficulty: 'hard',
    minLevel: 6,
    maxLevel: 8,
    enemyPool: ['Troll Berserker', 'Wraith', 'Dragon Whelp'],
    eventWeights: { combat: 55, treasure: 10, trap: 20, healer: 5, nothing: 10 },
    ascii: `
 ~  ~  ~  ~
 |\\  |  /|
 | \\ | / |
~~~~~~~~~~ `,
  },
  {
    id: 'abyssal-depths',
    name: 'Abyssal Depths',
    difficulty: 'deadly',
    minLevel: 8,
    maxLevel: 10,
    enemyPool: ['Dragon Whelp', 'Lich Apprentice', 'Shadow Knight'],
    eventWeights: { combat: 65, treasure: 10, trap: 15, healer: 0, nothing: 10 },
    ascii: `
  \\/\\/\\/\\/
  /\\/\\/\\/\\
  \\/\\/\\/\\/
  ABANDON HOPE`,
  },
];

/**
 * Get zones available to a player based on their level
 */
export function getAvailableZones(playerLevel: number): Zone[] {
  return ZONES.filter((zone) => zone.minLevel <= playerLevel);
}

/**
 * Generate a random event using weighted selection based on zone event weights
 */
export function generateEvent(zone: Zone, playerLevel: number): ZoneEvent {
  const roll = Math.floor(Math.random() * 100);
  const weights = zone.eventWeights;

  // Cumulative weight selection
  let cumulative = 0;

  cumulative += weights.combat;
  if (roll < cumulative) {
    const enemyName = zone.enemyPool[Math.floor(Math.random() * zone.enemyPool.length)];
    const enemy = getEnemyByName(enemyName);
    return { type: 'combat', enemy };
  }

  cumulative += weights.treasure;
  if (roll < cumulative) {
    const minGold = 10 * zone.minLevel;
    const maxGold = 25 * zone.maxLevel;
    const gold = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
    const messages = [
      'You find a hidden chest!',
      'Gold coins glitter in the darkness!',
      'A forgotten treasure pouch!',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return { type: 'treasure', gold, message };
  }

  cumulative += weights.trap;
  if (roll < cumulative) {
    const minDamage = 5 * zone.minLevel;
    const maxDamage = 10 * zone.maxLevel;
    const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
    const messages = [
      'You trigger a hidden trap!',
      'Poison darts fly from the wall!',
      'The floor gives way beneath you!',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return { type: 'trap', damage, message };
  }

  cumulative += weights.healer;
  if (roll < cumulative) {
    const cost = Math.ceil(playerLevel * 5);
    const healAmount = Math.floor(playerLevel * 15);
    return { type: 'healer', cost, healAmount };
  }

  // Nothing event (fallback)
  const messages = [
    'The path is eerily quiet...',
    'Nothing of interest here.',
    'You hear distant echoes but find nothing.',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return { type: 'nothing', message };
}

/**
 * Pick a random enemy from the zone's enemy pool
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getZoneEnemy(zone: Zone, _playerLevel: number) {
  const name = zone.enemyPool[Math.floor(Math.random() * zone.enemyPool.length)];
  return getEnemyByName(name);
}
