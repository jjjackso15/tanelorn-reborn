export type Screen = 'login' | 'menu' | 'combat';

export interface PlayerStats {
  strength: number;
  defense: number;
  agility: number;
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
