'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { Terminal } from '@/components/Terminal';
import { ASCII_LOGO, ASCII_CASTLE } from '@/app/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Screen, PlayerState, Enemy, CombatOutcome } from '@/game/types';
import { createInitialPlayer } from '@/game/combat';
import { getRandomEncounter } from '@/game/enemies';
import CombatScreen from '@/components/CombatScreen';

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
        // Using a publicly available creative commons sound or placeholder
        // In production, serve this file locally from /public/sounds/modem.mp3
        soundRef.current = new Howl({
            src: ['https://freesound.org/data/previews/16/16475_39474-lq.mp3'], // Short dial-up snippet
            html5: true, // Force HTML5 Audio to stream (better for cross-origin)
            volume: 0.3,
        });
    }

    addLog("INITIALIZING MODEM...");
    addLog("ATDT 555-TANELORN");

    // Simulate the sequence
    setTimeout(() => {
        addLog("DIALING...");
        // soundRef.current?.play(); // Uncomment when a real file is present and CORS allowed
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

  const handleAdventure = useCallback(() => {
    if (player.turnsRemaining <= 0) return;
    const enemy = getRandomEncounter(player.level);
    setCurrentEnemy(enemy);
    setScreen('combat');
  }, [player.level, player.turnsRemaining]);

  const handleQuit = useCallback(() => {
    setScreen('login');
  }, []);

  const handleCombatEnd = useCallback((outcome: CombatOutcome, enemy: Enemy) => {
    setPlayer(prev => {
      const updated = { ...prev, turnsRemaining: prev.turnsRemaining - 1 };

      if (outcome === 'victory') {
        updated.xp = prev.xp + enemy.xpReward;
        updated.gold = prev.gold + enemy.goldReward;
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
      } else if (key === 'q') {
        e.preventDefault();
        handleQuit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleAdventure, handleQuit]);

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
                <MenuOption label="STATS" shortcut="S" />
                <MenuOption label="TAVERN" shortcut="T" />
                <MenuOption label="MAILBOX" shortcut="M" />
                <MenuOption label="QUIT" shortcut="Q" onClick={handleQuit} />
              </div>

              <div className="mt-8 pt-4 border-t border-green-900/30 text-center text-xs text-green-700">
                <p>Turns Remaining: {player.turnsRemaining}</p>
                <p>Current HP: {player.hp}/{player.maxHp}</p>
                <p>Level: {player.level} | XP: {player.xp}/{player.xpToNext} | Gold: {player.gold}</p>
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
              player={player}
              enemy={currentEnemy}
              onCombatEnd={handleCombatEnd}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Terminal>
  );
}
