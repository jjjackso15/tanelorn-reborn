'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { PlayerState, Weapon, Armor, CastleDefense } from '@/game/types';
import { ASCII_MARKET } from '@/app/constants';
import {
  getHealingCost,
  getAvailableWeapons,
  getAvailableArmors,
  getAvailableCastleDefenses,
  canAfford,
  CASTLE_DEFENSES,
} from '@/game/market';

type MarketTab = 'healer' | 'weapons' | 'armor' | 'castle';

interface MarketScreenProps {
  player: PlayerState;
  onHeal: () => void;
  onBuyWeapon: (weapon: Weapon) => void;
  onBuyArmor: (armor: Armor) => void;
  onBuyCastleDefense: (defense: CastleDefense) => void;
  onBack: () => void;
}

export default function MarketScreen({
  player,
  onHeal,
  onBuyWeapon,
  onBuyArmor,
  onBuyCastleDefense,
  onBack,
}: MarketScreenProps) {
  const [activeTab, setActiveTab] = useState<MarketTab>('healer');

  const healingCost = getHealingCost(player);
  const availableWeapons = getAvailableWeapons(player);
  const availableArmors = getAvailableArmors(player);
  const availableDefenses = getAvailableCastleDefenses(player);
  const ownedDefenseIds = new Set(player.castleDefenses.map((d) => d.id));

  const handleBuyWeapon = useCallback(
    (index: number) => {
      const weapon = availableWeapons[index];
      if (weapon && canAfford(player, weapon.cost)) {
        onBuyWeapon(weapon);
      }
    },
    [availableWeapons, player, onBuyWeapon]
  );

  const handleBuyArmor = useCallback(
    (index: number) => {
      const armor = availableArmors[index];
      if (armor && canAfford(player, armor.cost)) {
        onBuyArmor(armor);
      }
    },
    [availableArmors, player, onBuyArmor]
  );

  const handleBuyDefense = useCallback(
    (index: number) => {
      const defense = availableDefenses[index];
      if (defense && canAfford(player, defense.cost)) {
        onBuyCastleDefense(defense);
      }
    },
    [availableDefenses, player, onBuyCastleDefense]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'h') {
        e.preventDefault();
        setActiveTab('healer');
      } else if (key === 'w') {
        e.preventDefault();
        setActiveTab('weapons');
      } else if (key === 'a') {
        e.preventDefault();
        setActiveTab('armor');
      } else if (key === 'c') {
        e.preventDefault();
        setActiveTab('castle');
      } else if (key === 'b') {
        e.preventDefault();
        onBack();
      } else if (key === 'y' && activeTab === 'healer') {
        e.preventDefault();
        if (healingCost > 0 && canAfford(player, healingCost)) {
          onHeal();
        }
      } else if (key >= '1' && key <= '5') {
        e.preventDefault();
        const index = parseInt(key) - 1;
        if (activeTab === 'weapons') {
          handleBuyWeapon(index);
        } else if (activeTab === 'armor') {
          handleBuyArmor(index);
        } else if (activeTab === 'castle') {
          handleBuyDefense(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    healingCost,
    player,
    onHeal,
    onBack,
    handleBuyWeapon,
    handleBuyArmor,
    handleBuyDefense,
  ]);

  const tabButtons: { key: MarketTab; label: string; shortcut: string }[] = [
    { key: 'healer', label: 'Healer', shortcut: 'H' },
    { key: 'weapons', label: 'Weapons', shortcut: 'W' },
    { key: 'armor', label: 'Armor', shortcut: 'A' },
    { key: 'castle', label: 'Castle Upgrades', shortcut: 'C' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ASCII Market Art */}
      <pre className="text-center text-green-500 whitespace-pre text-[8px] sm:text-[10px] leading-tight">
        {ASCII_MARKET}
      </pre>

      {/* Title and Gold */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold font-mono tracking-widest text-green-400">
          MARKET
        </h1>
        <p className="font-mono text-green-500 text-sm">
          Gold: {player.gold}
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-green-900/30 pb-2">
        {tabButtons.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'text-left p-2 group flex items-center gap-2 transition-all border font-mono text-sm',
              activeTab === tab.key
                ? 'border-green-800 bg-green-900/30 text-green-400'
                : 'border-transparent hover:border-green-800 hover:bg-green-900/30 text-green-500'
            )}
          >
            <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">
              [{tab.shortcut}]
            </span>
            <span className="tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[200px] border-x border-green-900/30 bg-green-900/5 p-4 space-y-4"
        >
          {/* Healer Tab */}
          {activeTab === 'healer' && (
            <div className="space-y-4">
              <h2 className="font-mono font-bold text-green-400 tracking-wider border-b border-green-800 pb-2">
                HEALER
              </h2>
              <p className="font-mono text-green-500 text-sm">
                HP: {player.hp}/{player.maxHp}
              </p>
              {player.hp >= player.maxHp ? (
                <p className="font-mono text-green-400 text-sm">
                  You are already at full health!
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="font-mono text-green-500 text-sm">
                    Healing cost: {healingCost} gold
                  </p>
                  <button
                    onClick={() => {
                      if (canAfford(player, healingCost)) onHeal();
                    }}
                    disabled={!canAfford(player, healingCost)}
                    className={clsx(
                      'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                      !canAfford(player, healingCost)
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-green-900/30 hover:border-green-800'
                    )}
                  >
                    <span
                      className={clsx(
                        'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                        !canAfford(player, healingCost)
                          ? 'bg-green-900 text-green-700'
                          : 'bg-green-700 text-black'
                      )}
                    >
                      [Y]
                    </span>
                    <span
                      className={clsx(
                        'font-mono tracking-wider',
                        !canAfford(player, healingCost)
                          ? 'text-green-700'
                          : 'group-hover:text-green-300'
                      )}
                    >
                      HEAL
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Weapons Tab */}
          {activeTab === 'weapons' && (
            <div className="space-y-4">
              <h2 className="font-mono font-bold text-green-400 tracking-wider border-b border-green-800 pb-2">
                WEAPONS
              </h2>
              {player.weapon && (
                <p className="font-mono text-green-500 text-sm">
                  Equipped: {player.weapon.name} (+{player.weapon.strengthBonus}{' '}
                  STR)
                </p>
              )}
              {availableWeapons.length === 0 ? (
                <p className="font-mono text-green-700 text-sm">
                  No weapons available at your level.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableWeapons.map((weapon, index) => {
                    const affordable = canAfford(player, weapon.cost);
                    return (
                      <button
                        key={weapon.id}
                        onClick={() => handleBuyWeapon(index)}
                        disabled={!affordable}
                        className={clsx(
                          'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                          !affordable
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-green-900/30 hover:border-green-800'
                        )}
                      >
                        <span
                          className={clsx(
                            'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                            !affordable
                              ? 'bg-green-900 text-green-700'
                              : 'bg-green-700 text-black'
                          )}
                        >
                          [{index + 1}]
                        </span>
                        <span
                          className={clsx(
                            'font-mono tracking-wider flex-1',
                            !affordable
                              ? 'text-green-700'
                              : 'group-hover:text-green-300'
                          )}
                        >
                          {weapon.name}
                        </span>
                        <span
                          className={clsx(
                            'font-mono text-sm',
                            !affordable ? 'text-green-700' : 'text-green-500'
                          )}
                        >
                          +{weapon.strengthBonus} STR
                        </span>
                        <span
                          className={clsx(
                            'font-mono text-sm',
                            !affordable ? 'text-green-700' : 'text-green-500'
                          )}
                        >
                          {weapon.cost}g
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Armor Tab */}
          {activeTab === 'armor' && (
            <div className="space-y-4">
              <h2 className="font-mono font-bold text-green-400 tracking-wider border-b border-green-800 pb-2">
                ARMOR
              </h2>
              {player.armor && (
                <p className="font-mono text-green-500 text-sm">
                  Equipped: {player.armor.name} (+{player.armor.defenseBonus}{' '}
                  DEF)
                </p>
              )}
              {availableArmors.length === 0 ? (
                <p className="font-mono text-green-700 text-sm">
                  No armor available at your level.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableArmors.map((armor, index) => {
                    const affordable = canAfford(player, armor.cost);
                    return (
                      <button
                        key={armor.id}
                        onClick={() => handleBuyArmor(index)}
                        disabled={!affordable}
                        className={clsx(
                          'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                          !affordable
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-green-900/30 hover:border-green-800'
                        )}
                      >
                        <span
                          className={clsx(
                            'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                            !affordable
                              ? 'bg-green-900 text-green-700'
                              : 'bg-green-700 text-black'
                          )}
                        >
                          [{index + 1}]
                        </span>
                        <span
                          className={clsx(
                            'font-mono tracking-wider flex-1',
                            !affordable
                              ? 'text-green-700'
                              : 'group-hover:text-green-300'
                          )}
                        >
                          {armor.name}
                        </span>
                        <span
                          className={clsx(
                            'font-mono text-sm',
                            !affordable ? 'text-green-700' : 'text-green-500'
                          )}
                        >
                          +{armor.defenseBonus} DEF
                        </span>
                        <span
                          className={clsx(
                            'font-mono text-sm',
                            !affordable ? 'text-green-700' : 'text-green-500'
                          )}
                        >
                          {armor.cost}g
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Castle Upgrades Tab */}
          {activeTab === 'castle' && (
            <div className="space-y-4">
              <h2 className="font-mono font-bold text-green-400 tracking-wider border-b border-green-800 pb-2">
                CASTLE UPGRADES
              </h2>
              <div className="space-y-2">
                {CASTLE_DEFENSES.map((defense, index) => {
                  const owned = ownedDefenseIds.has(defense.id);
                  const available =
                    !owned && defense.requiredLevel <= player.level;
                  const affordable = available && canAfford(player, defense.cost);
                  const buyableIndex = availableDefenses.indexOf(defense);

                  return (
                    <button
                      key={defense.id}
                      onClick={() => {
                        if (affordable && buyableIndex >= 0)
                          handleBuyDefense(buyableIndex);
                      }}
                      disabled={!affordable}
                      className={clsx(
                        'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                        owned
                          ? 'opacity-70'
                          : !affordable
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-green-900/30 hover:border-green-800'
                      )}
                    >
                      <span
                        className={clsx(
                          'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                          owned
                            ? 'bg-green-900 text-green-400'
                            : !affordable
                              ? 'bg-green-900 text-green-700'
                              : 'bg-green-700 text-black'
                        )}
                      >
                        {owned ? '\u2713' : `[${index + 1}]`}
                      </span>
                      <div className="flex-1">
                        <span
                          className={clsx(
                            'font-mono tracking-wider block',
                            owned
                              ? 'text-green-400'
                              : !affordable
                                ? 'text-green-700'
                                : 'group-hover:text-green-300'
                          )}
                        >
                          {defense.name}
                          {owned && ' (owned)'}
                        </span>
                        <span
                          className={clsx(
                            'font-mono text-xs block',
                            owned
                              ? 'text-green-600'
                              : !affordable
                                ? 'text-green-700'
                                : 'text-green-500'
                          )}
                        >
                          {defense.description}
                        </span>
                      </div>
                      {!owned && (
                        <span
                          className={clsx(
                            'font-mono text-sm',
                            !affordable ? 'text-green-700' : 'text-green-500'
                          )}
                        >
                          {defense.cost}g
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent hover:bg-green-900/30 hover:border-green-800"
      >
        <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">
          [B]
        </span>
        <span className="font-mono tracking-wider group-hover:text-green-300">
          BACK
        </span>
      </button>
    </div>
  );
}
