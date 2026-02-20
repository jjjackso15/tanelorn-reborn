export type Screen = 'login' | 'menu' | 'combat' | 'market' | 'quest-board' | 'adventure-board' | 'castle-raid';

export interface PlayerStats {
  strength: number;
  defense: number;
  agility: number;
}

export interface Weapon {
  id: string;
  name: string;
  strengthBonus: number;
  cost: number;
  requiredLevel: number;
}

export interface Armor {
  id: string;
  name: string;
  defenseBonus: number;
  cost: number;
  requiredLevel: number;
}

export interface CastleDefense {
  id: string;
  name: string;
  description: string;
  cost: number;
  requiredLevel: number;
}

export interface PlayerState {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpToNext: number;
  gold: number;
  turnsRemaining: number;
  stats: PlayerStats;
  weapon: Weapon | null;
  armor: Armor | null;
  castleDefenses: CastleDefense[];
}

export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  agility: number;
  xpReward: number;
  goldReward: number;
  ascii: string;
}

export type CombatAction = 'attack' | 'run';

export type CombatOutcome = 'victory' | 'defeat' | 'fled';

export interface TurnResult {
  messages: string[];
  playerHp: number;
  enemyHp: number;
  outcome: CombatOutcome | null;
}

export type CombatContext =
  | { type: 'adventure' }
  | { type: 'bounty'; bounty: Bounty }
  | { type: 'zone'; zoneName: string }
  | { type: 'raid'; castle: Castle };

export interface Bounty {
  id: string;
  targetEnemyName: string;
  description: string;
  bonusXp: number;
  bonusGold: number;
  requiredLevel: number;
}

export type ZoneDifficulty = 'easy' | 'medium' | 'hard' | 'deadly';

export interface EventWeights {
  combat: number;
  treasure: number;
  trap: number;
  healer: number;
  nothing: number;
}

export interface Zone {
  id: string;
  name: string;
  difficulty: ZoneDifficulty;
  minLevel: number;
  maxLevel: number;
  enemyPool: string[];
  eventWeights: EventWeights;
  ascii: string;
}

export type ZoneEvent =
  | { type: 'combat'; enemy: Enemy }
  | { type: 'treasure'; gold: number; message: string }
  | { type: 'trap'; damage: number; message: string }
  | { type: 'healer'; cost: number; healAmount: number }
  | { type: 'nothing'; message: string };

export interface Castle {
  id: string;
  name: string;
  ownerType: 'npc';
  ownerName: string;
  boss: Enemy;
  requiredLevel: number;
  turnCost: number;
  bonusXpMultiplier: number;
  bonusGoldMultiplier: number;
  ascii: string;
}
