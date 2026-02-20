import { Weapon, Armor, CastleDefense, PlayerState } from '@/game/types';

export const WEAPONS: Weapon[] = [
  { id: 'rusty-sword', name: 'Rusty Sword', strengthBonus: 2, cost: 30, requiredLevel: 1 },
  { id: 'iron-blade', name: 'Iron Blade', strengthBonus: 5, cost: 80, requiredLevel: 3 },
  { id: 'steel-claymore', name: 'Steel Claymore', strengthBonus: 9, cost: 180, requiredLevel: 5 },
  { id: 'mithril-saber', name: 'Mithril Saber', strengthBonus: 14, cost: 400, requiredLevel: 7 },
  { id: 'dragon-fang', name: 'Dragon Fang', strengthBonus: 18, cost: 600, requiredLevel: 9 },
];

export const ARMORS: Armor[] = [
  { id: 'leather-vest', name: 'Leather Vest', defenseBonus: 2, cost: 25, requiredLevel: 1 },
  { id: 'chain-mail', name: 'Chain Mail', defenseBonus: 5, cost: 70, requiredLevel: 3 },
  { id: 'plate-armor', name: 'Plate Armor', defenseBonus: 8, cost: 160, requiredLevel: 5 },
  { id: 'dragon-scale', name: 'Dragon Scale', defenseBonus: 12, cost: 350, requiredLevel: 7 },
  { id: 'shadow-plate', name: 'Shadow Plate', defenseBonus: 16, cost: 550, requiredLevel: 9 },
];

export const CASTLE_DEFENSES: CastleDefense[] = [
  { id: 'wooden-barricade', name: 'Wooden Barricade', description: 'Basic fortification for your castle', cost: 50, requiredLevel: 2 },
  { id: 'spike-trap', name: 'Spike Trap', description: 'Damages attackers who breach the gate', cost: 120, requiredLevel: 4 },
  { id: 'arrow-slits', name: 'Arrow Slits', description: 'Allows ranged defense from walls', cost: 250, requiredLevel: 6 },
  { id: 'iron-gate', name: 'Iron Gate', description: 'Reinforced gate that resists siege', cost: 500, requiredLevel: 8 },
];

export function getHealingCost(player: PlayerState): number {
  if (player.hp >= player.maxHp) return 0;
  return Math.ceil((player.maxHp - player.hp) * (0.5 + player.level * 0.1));
}

export function getAvailableWeapons(player: PlayerState): Weapon[] {
  return WEAPONS.filter(
    (w) => w.requiredLevel <= player.level && w.id !== player.weapon?.id
  );
}

export function getAvailableArmors(player: PlayerState): Armor[] {
  return ARMORS.filter(
    (a) => a.requiredLevel <= player.level && a.id !== player.armor?.id
  );
}

export function getAvailableCastleDefenses(player: PlayerState): CastleDefense[] {
  const ownedIds = new Set(player.castleDefenses.map((d) => d.id));
  return CASTLE_DEFENSES.filter(
    (d) => d.requiredLevel <= player.level && !ownedIds.has(d.id)
  );
}

export function canAfford(player: PlayerState, cost: number): boolean {
  return player.gold >= cost;
}
