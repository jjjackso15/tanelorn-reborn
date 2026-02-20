import {
  Zone,
  Enemy,
  DOTEffect,
  DelveBuff,
  DelveItem,
  DelveStepEvent,
  ZoneBoss,
} from '@/game/types';
import { getEnemyByName } from '@/game/enemies';

// =============================================================================
// Zone Bosses
// =============================================================================

export const ZONE_BOSSES: ZoneBoss[] = [
  {
    zoneId: 'whispering-forest',
    enemy: {
      name: 'Ancient Treant',
      level: 3,
      hp: 80,
      maxHp: 80,
      strength: 12,
      defense: 8,
      agility: 3,
      xpReward: 60,
      goldReward: 30,
      ascii: `
   /||\\ /||\\
  / || X || \\
    ||/|\\||
    || | ||
   _||_|_||_`,
    },
    relic: {
      id: 'heartwood-charm',
      name: 'Heartwood Charm',
      description: 'A warm wooden amulet pulsing with ancient life.',
      statBonuses: { defense: 2 },
    },
  },
  {
    zoneId: 'sunken-dungeon',
    enemy: {
      name: 'Drowned King',
      level: 5,
      hp: 120,
      maxHp: 120,
      strength: 18,
      defense: 12,
      agility: 7,
      xpReward: 100,
      goldReward: 50,
      ascii: `
    _/~\\_
   |o   o|
   | ~~~ |
   |#####|
   \\_ _ _/`,
    },
    relic: {
      id: 'tidal-amulet',
      name: 'Tidal Amulet',
      description: 'A coral pendant swirling with captured tidewater.',
      statBonuses: { strength: 3 },
    },
  },
  {
    zoneId: 'crystal-caves',
    enemy: {
      name: 'Crystal Golem',
      level: 7,
      hp: 160,
      maxHp: 160,
      strength: 22,
      defense: 16,
      agility: 5,
      xpReward: 150,
      goldReward: 70,
      ascii: `
   _/###\\_
  |* * * *|
  | /\\/\\ |
  |/    \\|
  |______|`,
    },
    relic: {
      id: 'prismatic-shard',
      name: 'Prismatic Shard',
      description: 'A fractured crystal refracting inner power.',
      statBonuses: { strength: 2, defense: 2 },
    },
  },
  {
    zoneId: 'darkwood-swamp',
    enemy: {
      name: 'Swamp Hydra',
      level: 8,
      hp: 180,
      maxHp: 180,
      strength: 25,
      defense: 14,
      agility: 10,
      xpReward: 180,
      goldReward: 85,
      ascii: `
  ~/\\ /\\ /\\~
  |o| |o| |o|
   \\| | |/ |
    \\|/|\\|/
    ~|___|~`,
    },
    relic: {
      id: 'hydra-fang',
      name: 'Hydra Fang',
      description: 'A venomous fang thrumming with primal speed.',
      statBonuses: { agility: 4 },
    },
  },
  {
    zoneId: 'abyssal-depths',
    enemy: {
      name: 'Abyssal Horror',
      level: 10,
      hp: 250,
      maxHp: 250,
      strength: 32,
      defense: 22,
      agility: 18,
      xpReward: 280,
      goldReward: 120,
      ascii: `
  _/\\/\\/\\_
 |* o  o *|
 |  \\~~/  |
 |__||||__|
   ~~~~~`,
    },
    relic: {
      id: 'void-crystal',
      name: 'Void Crystal',
      description: 'A shard of the abyss that warps reality around it.',
      statBonuses: { strength: 3, defense: 3, agility: 2 },
    },
  },
];

// =============================================================================
// Zone Merchant Items
// =============================================================================

export const ZONE_MERCHANT_ITEMS: Record<string, DelveItem[]> = {
  'whispering-forest': [
    {
      id: 'bark-tea',
      name: 'Bark Tea',
      description: 'A bitter brew that toughens the skin.',
      cost: 15,
      effect: { name: 'Bark Tea', stat: 'defense', amount: 2 },
    },
    {
      id: 'forest-salve',
      name: 'Forest Salve',
      description: 'A soothing paste made from forest herbs.',
      cost: 20,
      effect: { type: 'heal', amount: 15 },
    },
    {
      id: 'elven-arrow',
      name: 'Elven Arrow',
      description: 'An enchanted arrow that sharpens your strikes.',
      cost: 25,
      effect: { name: 'Elven Arrow', stat: 'strength', amount: 3 },
    },
  ],
  'sunken-dungeon': [
    {
      id: 'coral-shield',
      name: 'Coral Shield',
      description: 'A shield grown from living coral.',
      cost: 30,
      effect: { name: 'Coral Shield', stat: 'defense', amount: 3 },
    },
    {
      id: 'deep-breath-potion',
      name: 'Deep Breath Potion',
      description: 'A potion that quickens reflexes underwater.',
      cost: 25,
      effect: { name: 'Deep Breath Potion', stat: 'agility', amount: 2 },
    },
    {
      id: 'rusted-trident',
      name: 'Rusted Trident',
      description: 'A barnacle-crusted weapon still deadly sharp.',
      cost: 40,
      effect: { name: 'Rusted Trident', stat: 'strength', amount: 4 },
    },
  ],
  'crystal-caves': [
    {
      id: 'crystal-lens',
      name: 'Crystal Lens',
      description: 'A polished crystal that sharpens perception.',
      cost: 45,
      effect: { name: 'Crystal Lens', stat: 'agility', amount: 3 },
    },
    {
      id: 'geode-tonic',
      name: 'Geode Tonic',
      description: 'A mineral-rich tonic with restorative properties.',
      cost: 35,
      effect: { type: 'heal', amount: 25 },
    },
    {
      id: 'shard-blade',
      name: 'Shard Blade',
      description: 'A razor-sharp blade hewn from raw crystal.',
      cost: 60,
      effect: { name: 'Shard Blade', stat: 'strength', amount: 5 },
    },
  ],
  'darkwood-swamp': [
    {
      id: 'swamp-root',
      name: 'Swamp Root',
      description: 'A gnarled root that hardens resolve.',
      cost: 50,
      effect: { name: 'Swamp Root', stat: 'defense', amount: 3 },
    },
    {
      id: 'poison-ward',
      name: 'Poison Ward',
      description: 'A protective charm woven from swamp reeds.',
      cost: 55,
      effect: { name: 'Poison Ward', stat: 'defense', amount: 2 },
    },
    {
      id: 'bog-iron-mace',
      name: 'Bog Iron Mace',
      description: 'A crude but devastating mace forged in bog iron.',
      cost: 50,
      effect: { name: 'Bog Iron Mace', stat: 'strength', amount: 4 },
    },
  ],
  'abyssal-depths': [
    {
      id: 'void-shard',
      name: 'Void Shard',
      description: 'A fragment of nothingness that amplifies fury.',
      cost: 70,
      effect: { name: 'Void Shard', stat: 'strength', amount: 4 },
    },
    {
      id: 'dark-ward',
      name: 'Dark Ward',
      description: 'A ward of shadow that deflects blows.',
      cost: 65,
      effect: { name: 'Dark Ward', stat: 'defense', amount: 4 },
    },
    {
      id: 'shadow-step',
      name: 'Shadow Step',
      description: 'A vial of liquid shadow granting blinding speed.',
      cost: 75,
      effect: { name: 'Shadow Step', stat: 'agility', amount: 5 },
    },
  ],
};

// =============================================================================
// DOT Functions
// =============================================================================

/**
 * Generate a random DOT effect: 50/50 poison or fire
 */
export function generateDOT(): DOTEffect {
  const dotType: 'poison' | 'fire' = Math.random() < 0.5 ? 'poison' : 'fire';
  const damagePerStep = Math.floor(Math.random() * 6) + 3; // 3-8
  const remainingSteps = Math.floor(Math.random() * 3) + 2; // 2-4
  return { type: dotType, damagePerStep, remainingSteps };
}

/**
 * Process all active DOT effects: sum damage, decrement steps, filter expired
 */
export function tickDOTs(dots: DOTEffect[]): {
  damage: number;
  remaining: DOTEffect[];
  messages: string[];
} {
  let damage = 0;
  const messages: string[] = [];
  const remaining: DOTEffect[] = [];

  for (const dot of dots) {
    damage += dot.damagePerStep;

    if (dot.type === 'poison') {
      messages.push(`Poison deals ${dot.damagePerStep} damage!`);
    } else {
      messages.push(`Fire burns for ${dot.damagePerStep} damage!`);
    }

    const updated: DOTEffect = {
      ...dot,
      remainingSteps: dot.remainingSteps - 1,
    };

    if (updated.remainingSteps > 0) {
      remaining.push(updated);
    }
  }

  return { damage, remaining, messages };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the boss for a zone, or null if already cleared
 */
export function getZoneBoss(
  zoneId: string,
  clearedBosses: string[]
): ZoneBoss | null {
  if (clearedBosses.includes(zoneId)) {
    return null;
  }
  return ZONE_BOSSES.find((b) => b.zoneId === zoneId) ?? null;
}

/**
 * Get the merchant items available for a zone
 */
export function getZoneMerchantItems(zoneId: string): DelveItem[] {
  return ZONE_MERCHANT_ITEMS[zoneId] ?? [];
}

// =============================================================================
// Weighted random selection helper
// =============================================================================

function weightedSelect<T>(entries: { weight: number; value: T }[]): T {
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.floor(Math.random() * totalWeight);

  for (const entry of entries) {
    roll -= entry.weight;
    if (roll < 0) {
      return entry.value;
    }
  }

  // Fallback to last entry (should never reach here)
  return entries[entries.length - 1].value;
}

// =============================================================================
// Event Generation
// =============================================================================

const TRAP_MESSAGES = [
  'A hidden spike trap!',
  'Poison darts fly from the wall!',
  'The floor erupts in flames!',
  'A net of thorns ensnares you!',
];

const BUFFER_MESSAGES = [
  'A wandering warrior shares combat techniques!',
  'A hermit sage bestows ancient wisdom!',
  'A forest spirit grants its blessing!',
];

const TREASURE_MESSAGES = [
  'You find a hidden chest!',
  'Gold coins glitter in the darkness!',
  'A forgotten treasure pouch!',
];

const STATS: ('strength' | 'defense' | 'agility')[] = [
  'strength',
  'defense',
  'agility',
];

function generateTrapEvent(zone: Zone): DelveStepEvent {
  const minDamage = 5 * zone.minLevel;
  const maxDamage = 10 * zone.maxLevel;
  const damage =
    Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
  const message = TRAP_MESSAGES[Math.floor(Math.random() * TRAP_MESSAGES.length)];

  const hasDot = Math.random() < 0.4;
  const dot = hasDot ? generateDOT() : undefined;

  return { type: 'trap', damage, message, dot };
}

function generateCombatEvent(zone: Zone): DelveStepEvent {
  const enemyName =
    zone.enemyPool[Math.floor(Math.random() * zone.enemyPool.length)];
  const enemy = getEnemyByName(enemyName);
  return { type: 'combat', enemy };
}

function generateMerchantEvent(zone: Zone): DelveStepEvent {
  const items = getZoneMerchantItems(zone.id);
  return { type: 'merchant', items };
}

function generateBufferEvent(): DelveStepEvent {
  const stat = STATS[Math.floor(Math.random() * STATS.length)];
  const amount = Math.floor(Math.random() * 3) + 2; // 2-4
  const message =
    BUFFER_MESSAGES[Math.floor(Math.random() * BUFFER_MESSAGES.length)];
  const buff: DelveBuff = { name: `${stat} boost`, stat, amount };
  return { type: 'buffer', buff, message };
}

function generateHealerEvent(zone: Zone): DelveStepEvent {
  const maxHpEstimate = 100 + zone.minLevel * 10;
  const healPercent = Math.random() * 0.2 + 0.2; // 0.2 to 0.4
  const healAmount = Math.floor(maxHpEstimate * healPercent);
  const cost = (zone.minLevel + zone.maxLevel) * 3;
  return { type: 'healer', cost, healAmount };
}

function generateTreasureEvent(zone: Zone): DelveStepEvent {
  const minGold = 10 * zone.minLevel;
  const maxGold = 25 * zone.maxLevel;
  const gold =
    Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
  const message =
    TREASURE_MESSAGES[Math.floor(Math.random() * TREASURE_MESSAGES.length)];
  return { type: 'treasure', gold, message };
}

function generateBossEvent(
  zone: Zone,
  clearedBosses: string[]
): DelveStepEvent {
  const boss = getZoneBoss(zone.id, clearedBosses);

  if (boss) {
    // Boss not yet cleared: return boss event with relic
    const enemy: Enemy = { ...boss.enemy, hp: boss.enemy.maxHp };
    return { type: 'boss', enemy, relic: boss.relic };
  }

  // Boss already cleared: return a combat event with the strongest enemy from the pool
  const lastEnemyName = zone.enemyPool[zone.enemyPool.length - 1];
  const enemy = getEnemyByName(lastEnemyName);
  return { type: 'combat', enemy };
}

/**
 * Generate a delve step event based on zone, step number, and player state
 *
 * Steps 1-3: mixed events (friendly NPCs possible)
 * Steps 4-5: hostile events only
 * Step 6: always boss (or strong enemy if boss cleared)
 */
export function generateDelveStep(
  zone: Zone,
  step: number,
  playerLevel: number,
  clearedBosses: string[]
): DelveStepEvent {
  // Suppress unused parameter warning -- playerLevel reserved for future scaling
  void playerLevel;

  // Step 6: always boss
  if (step === 6) {
    return generateBossEvent(zone, clearedBosses);
  }

  // Steps 1-3: mixed with friendly NPCs
  if (step <= 3) {
    const eventType = weightedSelect([
      { weight: 30, value: 'combat' as const },
      { weight: 15, value: 'trap' as const },
      { weight: 20, value: 'merchant' as const },
      { weight: 15, value: 'buffer' as const },
      { weight: 15, value: 'healer' as const },
      { weight: 5, value: 'treasure' as const },
    ]);

    switch (eventType) {
      case 'combat':
        return generateCombatEvent(zone);
      case 'trap':
        return generateTrapEvent(zone);
      case 'merchant':
        return generateMerchantEvent(zone);
      case 'buffer':
        return generateBufferEvent();
      case 'healer':
        return generateHealerEvent(zone);
      case 'treasure':
        return generateTreasureEvent(zone);
    }
  }

  // Steps 4-5: hostile only
  const eventType = weightedSelect([
    { weight: 60, value: 'combat' as const },
    { weight: 25, value: 'trap' as const },
    { weight: 15, value: 'treasure' as const },
  ]);

  switch (eventType) {
    case 'combat':
      return generateCombatEvent(zone);
    case 'trap':
      return generateTrapEvent(zone);
    case 'treasure':
      return generateTreasureEvent(zone);
  }
}
