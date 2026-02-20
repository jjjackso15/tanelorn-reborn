'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { Terminal } from '@/components/Terminal';
import { ASCII_LOGO, ASCII_CASTLE } from '@/app/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Screen, PlayerState, Enemy, CombatOutcome, CombatContext, Bounty, Zone, DelveResult, Weapon, Armor, CastleDefense, Castle } from '@/game/types';
import { createInitialPlayer } from '@/game/combat';
import { getRandomEncounter } from '@/game/enemies';
import { generateBounties, getTargetEnemy } from '@/game/quests';
import { getHealingCost } from '@/game/market';
import CombatScreen from '@/components/CombatScreen';
import MarketScreen from '@/components/MarketScreen';
import QuestBoard from '@/components/QuestBoard';
import AdventureBoard from '@/components/AdventureBoard';
import CastleRaid from '@/components/CastleRaid';
import DelveScreen from '@/components/DelveScreen';

// Placeholder menu option component
const MenuOption = ({ label, shortcut, onClick, disabled }: { label: string, shortcut: string, onClick?: () => void, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent",
      disabled
        ? "opacity-40 cursor-not-allowed"
        : "hover:bg-green-900/30 hover:border-green-800"
    )}
  >
    <span className={clsx(
      "px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center",
      disabled ? "bg-green-900 text-green-700" : "bg-green-700 text-black"
    )}>[{shortcut}]</span>
    <span className={clsx(
      "font-mono tracking-wider",
      disabled ? "text-green-700" : "group-hover:text-green-300"
    )}>{label}</span>
  </button>
);

export default function Home() {
  const [screen, setScreen] = useState<Screen>('login');
  const [isConnecting, setIsConnecting] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [player, setPlayer] = useState<PlayerState>(createInitialPlayer);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatContext, setCombatContext] = useState<CombatContext | undefined>(undefined);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [activeDelveZone, setActiveDelveZone] = useState<Zone | null>(null);

  // Using a ref to prevent re-creation of the Howl instance on every render
  const soundRef = useRef<Howl | null>(null);

  const addLog = (line: string) => {
    setLogLines(prev => [...prev, line]);
  };

  const handleConnect = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setLogLines([]); // Clear previous logs

    // Initialize sound on user interaction (browser policy)
    if (!soundRef.current) {
        soundRef.current = new Howl({
            src: ['/sounds/modem.mp3'],
            volume: 0.3,
        });
    }

    addLog("INITIALIZING MODEM...");
    addLog("ATDT 555-TANELORN");

    // Simulate the sequence
    setTimeout(() => {
        addLog("DIALING...");
        soundRef.current?.play();
    }, 800);

    setTimeout(() => addLog("HANDSHAKE..."), 2500);
    setTimeout(() => addLog("CARRIER DETECTED: 14400 BAUD"), 4500);
    setTimeout(() => addLog("NEGOTIATING PROTOCOL..."), 5500);
    setTimeout(() => {
        addLog("CONNECTION ESTABLISHED.");
        setTimeout(() => {
            setIsConnecting(false);
            setScreen('menu');
        }, 1000);
    }, 6500);
  };

  // Compute effective player stats (with equipment + relic bonuses) for combat
  const getEffectivePlayer = useCallback((): PlayerState => {
    return {
      ...player,
      stats: {
        strength: player.stats.strength + (player.weapon?.strengthBonus ?? 0) + (player.relic?.statBonuses.strength ?? 0),
        defense: player.stats.defense + (player.armor?.defenseBonus ?? 0) + (player.relic?.statBonuses.defense ?? 0),
        agility: player.stats.agility + (player.relic?.statBonuses.agility ?? 0),
      },
    };
  }, [player]);

  // --- Menu handlers ---

  const handleAdventure = useCallback(() => {
    if (player.turnsRemaining <= 0) return;
    const enemy = getRandomEncounter(player.level);
    setCurrentEnemy(enemy);
    setCombatContext({ type: 'adventure' });
    setScreen('combat');
  }, [player.level, player.turnsRemaining]);

  const handleExplore = useCallback(() => {
    if (player.turnsRemaining <= 0) return;
    setScreen('adventure-board');
  }, [player.turnsRemaining]);

  const handleRaidCastle = useCallback(() => {
    if (player.turnsRemaining < 2) return;
    setScreen('castle-raid');
  }, [player.turnsRemaining]);

  const handleBountyBoard = useCallback(() => {
    if (player.turnsRemaining <= 0) return;
    setBounties(generateBounties(player.level));
    setScreen('quest-board');
  }, [player.level, player.turnsRemaining]);

  const handleMarket = useCallback(() => {
    setScreen('market');
  }, []);

  const handleQuit = useCallback(() => {
    setScreen('login');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('menu');
  }, []);

  // --- Bounty handler ---

  const handleSelectBounty = useCallback((bounty: Bounty) => {
    if (player.turnsRemaining <= 0) return;
    const enemy = getTargetEnemy(bounty);
    setCurrentEnemy(enemy);
    setCombatContext({ type: 'bounty', bounty });
    setScreen('combat');
  }, [player.turnsRemaining]);

  // --- Delve handlers ---

  const handleStartDelve = useCallback((zone: Zone) => {
    if (player.turnsRemaining <= 0) return;
    setActiveDelveZone(zone);
    setPlayer(prev => ({ ...prev, turnsRemaining: prev.turnsRemaining - 1 }));
    setScreen('delve');
  }, [player.turnsRemaining]);

  const handleDelveEnd = useCallback((result: DelveResult) => {
    setPlayer(prev => {
      const updated = { ...prev };

      updated.gold = prev.gold + result.goldEarned;
      updated.xp = prev.xp + result.xpEarned;
      updated.hp = Math.max(1, result.finalHp);

      // Assign relic if one was earned
      if (result.relic) {
        updated.relic = result.relic;
      }

      // Add boss to clearedBosses if dungeon was cleared
      if (result.outcome === 'cleared' && activeDelveZone) {
        updated.clearedBosses = [...prev.clearedBosses, activeDelveZone.id];
      }

      // Level up check
      if (updated.xp >= prev.xpToNext) {
        updated.level = prev.level + 1;
        updated.xp = updated.xp - prev.xpToNext;
        updated.xpToNext = Math.floor(prev.xpToNext * 1.5);
        updated.maxHp = prev.maxHp + 10;
        updated.hp = updated.maxHp;
        updated.stats = {
          strength: prev.stats.strength + 2,
          defense: prev.stats.defense + 1,
          agility: prev.stats.agility + 1,
        };
      }

      return updated;
    });
    setActiveDelveZone(null);
    setScreen('menu');
  }, [activeDelveZone]);

  // --- Castle Raid handler ---

  const handleSelectCastle = useCallback((castle: Castle) => {
    if (player.turnsRemaining < 2) return;
    // Use a spread copy of the boss so we don't mutate the castle definition
    const boss = { ...castle.boss };
    setCurrentEnemy(boss);
    setCombatContext({ type: 'raid', castle });
    setScreen('combat');
  }, [player.turnsRemaining]);

  // --- Market handlers ---

  const handleHeal = useCallback(() => {
    setPlayer(prev => {
      const cost = getHealingCost(prev);
      if (cost <= 0 || prev.gold < cost) return prev;
      return {
        ...prev,
        hp: prev.maxHp,
        gold: prev.gold - cost,
        turnsRemaining: prev.turnsRemaining - 1,
      };
    });
  }, []);

  const handleBuyWeapon = useCallback((weapon: Weapon) => {
    setPlayer(prev => {
      if (prev.gold < weapon.cost) return prev;
      return {
        ...prev,
        gold: prev.gold - weapon.cost,
        weapon,
      };
    });
  }, []);

  const handleBuyArmor = useCallback((armor: Armor) => {
    setPlayer(prev => {
      if (prev.gold < armor.cost) return prev;
      return {
        ...prev,
        gold: prev.gold - armor.cost,
        armor,
      };
    });
  }, []);

  const handleBuyCastleDefense = useCallback((defense: CastleDefense) => {
    setPlayer(prev => {
      if (prev.gold < defense.cost) return prev;
      return {
        ...prev,
        gold: prev.gold - defense.cost,
        castleDefenses: [...prev.castleDefenses, defense],
      };
    });
  }, []);

  // --- Combat end handler ---

  const handleCombatEnd = useCallback((outcome: CombatOutcome, enemy: Enemy, context?: CombatContext) => {
    setPlayer(prev => {
      const turnCost = context?.type === 'raid' ? 2 : 1;
      const updated = { ...prev, turnsRemaining: prev.turnsRemaining - turnCost };

      if (outcome === 'victory') {
        let xpGained = enemy.xpReward;
        let goldGained = enemy.goldReward;

        // Apply context-specific bonuses
        if (context?.type === 'bounty') {
          xpGained += context.bounty.bonusXp;
          goldGained += context.bounty.bonusGold;
        } else if (context?.type === 'raid') {
          xpGained = Math.floor(enemy.xpReward * context.castle.bonusXpMultiplier);
          goldGained = Math.floor(enemy.goldReward * context.castle.bonusGoldMultiplier);
        }

        updated.xp = prev.xp + xpGained;
        updated.gold = prev.gold + goldGained;

        // Level up check
        if (updated.xp >= prev.xpToNext) {
          updated.level = prev.level + 1;
          updated.xp = updated.xp - prev.xpToNext;
          updated.xpToNext = Math.floor(prev.xpToNext * 1.5);
          updated.maxHp = prev.maxHp + 10;
          updated.hp = updated.maxHp;
          updated.stats = {
            strength: prev.stats.strength + 2,
            defense: prev.stats.defense + 1,
            agility: prev.stats.agility + 1,
          };
        }
      } else if (outcome === 'defeat') {
        updated.hp = Math.max(1, Math.floor(prev.maxHp * 0.5));
      }
      // fled: just decrement turns, no other changes

      return updated;
    });
    setCurrentEnemy(null);
    setCombatContext(undefined);
    setScreen('menu');
  }, []);

  // Menu keyboard shortcuts
  useEffect(() => {
    if (screen !== 'menu') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a') {
        e.preventDefault();
        handleAdventure();
      } else if (key === 'e') {
        e.preventDefault();
        handleExplore();
      } else if (key === 'r') {
        e.preventDefault();
        handleRaidCastle();
      } else if (key === 'b') {
        e.preventDefault();
        handleBountyBoard();
      } else if (key === 'm') {
        e.preventDefault();
        handleMarket();
      } else if (key === 'q') {
        e.preventDefault();
        handleQuit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleAdventure, handleExplore, handleRaidCastle, handleBountyBoard, handleMarket, handleQuit]);

  return (
    <Terminal className="scanline">
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full gap-8 w-full max-w-2xl mx-auto"
          >
            <pre className="text-[8px] sm:text-[10px] md:text-xs leading-[0.8] whitespace-pre text-center text-green-500 font-bold opacity-80">
              {ASCII_LOGO}
            </pre>

            <div className="flex flex-col gap-2 w-full max-w-md border border-green-800 p-1 bg-black shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="h-48 overflow-y-auto font-mono text-xs sm:text-sm text-green-400 p-3 border-b border-green-900/50 mb-1 bg-green-950/10 font-medium">
                {logLines.map((line, i) => (
                  <div key={i} className="mb-1">{`> ${line}`}</div>
                ))}
                {isConnecting && <span className="animate-pulse">_</span>}
              </div>

              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className={clsx(
                    "w-full py-4 px-6 border border-green-700 transition-all uppercase font-bold tracking-[0.2em] text-green-500 text-sm sm:text-base",
                    isConnecting ? "opacity-50 cursor-wait bg-green-900/10" : "hover:bg-green-900/30 hover:border-green-400 hover:text-green-300 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                )}
              >
                {isConnecting ? "DIALING..." : "CONNECT TO BBS"}
              </button>
            </div>

            <div className="text-[10px] text-green-800/60 uppercase tracking-widest mt-8">
              Tanelorn Systems v1.0 • Node 1 • 14400 N-8-1
            </div>
          </motion.div>
        )}

        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="flex flex-col items-center justify-start pt-10 h-full gap-6 w-full max-w-3xl mx-auto"
          >
             <pre className="text-[6px] sm:text-[8px] md:text-[10px] leading-[0.8] whitespace-pre text-center text-green-500 mb-4 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
              {ASCII_CASTLE}
            </pre>

            <div className="w-full max-w-sm space-y-4 p-6 border-x border-green-900/30 bg-green-900/5 backdrop-blur-sm">
              <h1 className="text-xl font-bold border-b-2 border-green-800 pb-2 mb-6 text-center tracking-widest text-green-400 shadow-green-900/50">
                MAIN MENU
              </h1>

              <div className="grid gap-3">
                <MenuOption label="ADVENTURE" shortcut="A" onClick={handleAdventure} disabled={player.turnsRemaining <= 0} />
                <MenuOption label="EXPLORE" shortcut="E" onClick={handleExplore} disabled={player.turnsRemaining <= 0} />
                <MenuOption label="RAID CASTLE" shortcut="R" onClick={handleRaidCastle} disabled={player.turnsRemaining < 2} />
                <MenuOption label="BOUNTY BOARD" shortcut="B" onClick={handleBountyBoard} disabled={player.turnsRemaining <= 0} />
                <MenuOption label="MARKET" shortcut="M" onClick={handleMarket} />
                <MenuOption label="STATS" shortcut="S" />
                <MenuOption label="QUIT" shortcut="Q" onClick={handleQuit} />
              </div>

              <div className="mt-8 pt-4 border-t border-green-900/30 text-center text-xs text-green-700">
                <p>Turns Remaining: {player.turnsRemaining}</p>
                <p>Current HP: {player.hp}/{player.maxHp}</p>
                <p>Level: {player.level} | XP: {player.xp}/{player.xpToNext} | Gold: {player.gold}</p>
                {player.weapon && <p>Weapon: {player.weapon.name} (+{player.weapon.strengthBonus} STR)</p>}
                {player.armor && <p>Armor: {player.armor.name} (+{player.armor.defenseBonus} DEF)</p>}
                {player.relic && <p>Relic: {player.relic.name}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'combat' && currentEnemy && (
          <motion.div
            key="combat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-start pt-10 h-full w-full"
          >
            <CombatScreen
              player={getEffectivePlayer()}
              enemy={currentEnemy}
              context={combatContext}
              onCombatEnd={handleCombatEnd}
            />
          </motion.div>
        )}

        {screen === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-start pt-10 h-full w-full"
          >
            <MarketScreen
              player={player}
              onHeal={handleHeal}
              onBuyWeapon={handleBuyWeapon}
              onBuyArmor={handleBuyArmor}
              onBuyCastleDefense={handleBuyCastleDefense}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {screen === 'quest-board' && (
          <motion.div
            key="quest-board"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-start h-full w-full"
          >
            <QuestBoard
              bounties={bounties}
              player={player}
              onSelectBounty={handleSelectBounty}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {screen === 'adventure-board' && (
          <motion.div
            key="adventure-board"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-start h-full w-full"
          >
            <AdventureBoard
              player={player}
              onSelectZone={handleStartDelve}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {screen === 'delve' && activeDelveZone && (
          <motion.div
            key="delve"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-start h-full w-full"
          >
            <DelveScreen
              player={getEffectivePlayer()}
              zone={activeDelveZone}
              onDelveEnd={handleDelveEnd}
            />
          </motion.div>
        )}

        {screen === 'castle-raid' && (
          <motion.div
            key="castle-raid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-start h-full w-full"
          >
            <CastleRaid
              player={player}
              onSelectCastle={handleSelectCastle}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Terminal>
  );
}
