import { PlayerState, Enemy, CombatAction, TurnResult } from './types';

// Formula: str * (0.5 + roll) - def * 0.5, minimum 1
export function calculateDamage(
  strength: number,
  defense: number,
  roll: number = Math.random()
): number {
  const raw = Math.floor(strength * (0.5 + roll) - defense * 0.5);
  return Math.max(1, raw);
}

// Ratio-based formula, never 0% or 100%
export function checkRunSuccess(
  playerAgi: number,
  enemyAgi: number,
  roll: number = Math.random()
): boolean {
  const ratio = playerAgi / (playerAgi + enemyAgi);
  const chance = 0.1 + ratio * 0.8; // Range: 10% to 90%
  return roll < chance;
}

// Main turn executor - NEVER mutates inputs, returns new state
export function executeTurn(
  action: CombatAction,
  player: PlayerState,
  enemy: Enemy,
  playerHp: number,
  enemyHp: number,
  roll?: number
): TurnResult {
  const messages: string[] = [];
  let newPlayerHp = playerHp;
  let newEnemyHp = enemyHp;
  let outcome: TurnResult['outcome'] = null;

  if (action === 'attack') {
    // Player attacks enemy
    const playerDmg = calculateDamage(player.stats.strength, enemy.defense, roll);
    newEnemyHp = Math.max(0, newEnemyHp - playerDmg);
    messages.push(`You strike the ${enemy.name} for ${playerDmg} damage!`);

    if (newEnemyHp <= 0) {
      outcome = 'victory';
      messages.push(`The ${enemy.name} has been defeated!`);
    } else {
      // Enemy counterattacks
      const enemyDmg = calculateDamage(enemy.strength, player.stats.defense, roll !== undefined ? 1 - roll : undefined);
      newPlayerHp = Math.max(0, newPlayerHp - enemyDmg);
      messages.push(`The ${enemy.name} strikes back for ${enemyDmg} damage!`);

      if (newPlayerHp <= 0) {
        outcome = 'defeat';
        messages.push('You have been defeated...');
      }
    }
  } else {
    // Run attempt
    const escaped = checkRunSuccess(player.stats.agility, enemy.agility, roll);
    if (escaped) {
      outcome = 'fled';
      messages.push('You successfully flee from battle!');
    } else {
      messages.push('You failed to escape!');
      // Enemy gets a free hit
      const enemyDmg = calculateDamage(enemy.strength, player.stats.defense, roll !== undefined ? 1 - roll : undefined);
      newPlayerHp = Math.max(0, newPlayerHp - enemyDmg);
      messages.push(`The ${enemy.name} strikes you as you try to flee for ${enemyDmg} damage!`);

      if (newPlayerHp <= 0) {
        outcome = 'defeat';
        messages.push('You have been defeated...');
      }
    }
  }

  return {
    messages,
    playerHp: newPlayerHp,
    enemyHp: newEnemyHp,
    outcome,
  };
}

// Create a fresh level 1 player
export function createInitialPlayer(): PlayerState {
  return {
    name: 'Adventurer',
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpToNext: 100,
    gold: 50,
    turnsRemaining: 20,
    stats: {
      strength: 10,
      defense: 5,
      agility: 7,
    },
    weapon: null,
    armor: null,
    castleDefenses: [],
  };
}
