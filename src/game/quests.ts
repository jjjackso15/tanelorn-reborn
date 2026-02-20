import { Bounty, Enemy } from '@/game/types';
import { ENEMIES, getEnemyByName } from '@/game/enemies';

const BOUNTY_DESCRIPTIONS = [
  (name: string) => `A ${name} has been terrorizing the countryside`,
  (name: string) => `Wanted dead: ${name}`,
  (name: string) => `The guild needs a ${name} eliminated`,
  (name: string) => `Reports of a dangerous ${name} nearby`,
];

/**
 * Generate a list of bounties based on the player's level.
 * Picks random enemies within [playerLevel - 1, playerLevel + 2].
 */
export function generateBounties(playerLevel: number, count: number = 4): Bounty[] {
  const minLevel = Math.max(1, playerLevel - 1);
  const maxLevel = playerLevel + 2;

  // Filter enemies to those within level range
  const eligibleEnemies = ENEMIES.filter(
    (enemy) => enemy.level >= minLevel && enemy.level <= maxLevel
  );

  // Randomly pick `count` enemies from the pool (or all if fewer available)
  const shuffled = [...eligibleEnemies].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((enemy, index) => {
    const descriptionFn = BOUNTY_DESCRIPTIONS[index % BOUNTY_DESCRIPTIONS.length];

    return {
      id: `bounty-${enemy.name.toLowerCase().replace(/\s+/g, '-')}`,
      targetEnemyName: enemy.name,
      description: descriptionFn(enemy.name),
      bonusXp: Math.floor(enemy.xpReward * 0.5),
      bonusGold: Math.floor(enemy.goldReward * 0.75),
      requiredLevel: Math.max(1, enemy.level - 1),
    };
  });
}

/**
 * Get the Enemy instance for a bounty target.
 */
export function getTargetEnemy(bounty: Bounty): Enemy {
  return getEnemyByName(bounty.targetEnemyName);
}
