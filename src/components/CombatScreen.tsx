'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { PlayerState, Enemy, CombatAction, CombatOutcome } from '@/game/types';
import { executeTurn } from '@/game/combat';
import { COMBAT_DIVIDER } from '@/app/constants';

interface CombatScreenProps {
  player: PlayerState;
  enemy: Enemy;
  onCombatEnd: (outcome: CombatOutcome, enemy: Enemy) => void;
}

function renderHpBar(current: number, max: number, width: number = 20): string {
  const filled = Math.round((current / max) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${current}/${max}`;
}

export default function CombatScreen({ player, enemy, onCombatEnd }: CombatScreenProps) {
  const [combatLog, setCombatLog] = useState<string[]>([
    `A wild Level ${enemy.level} ${enemy.name} appears!`
  ]);
  const [currentPlayerHp, setCurrentPlayerHp] = useState(player.hp);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(enemy.maxHp);
  const [isCombatOver, setIsCombatOver] = useState(false);
  const [outcome, setOutcome] = useState<CombatOutcome | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll combat log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  const handleAction = useCallback((action: CombatAction) => {
    if (isCombatOver) return;

    const result = executeTurn(action, player, enemy, currentPlayerHp, currentEnemyHp);

    setCombatLog(prev => [...prev, COMBAT_DIVIDER, ...result.messages]);
    setCurrentPlayerHp(result.playerHp);
    setCurrentEnemyHp(result.enemyHp);

    if (result.outcome) {
      setOutcome(result.outcome);
      setIsCombatOver(true);
    }
  }, [isCombatOver, player, enemy, currentPlayerHp, currentEnemyHp]);

  const handleContinue = useCallback(() => {
    if (outcome) onCombatEnd(outcome, enemy);
  }, [outcome, enemy, onCombatEnd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (!isCombatOver) {
        if (key === 'a') {
          e.preventDefault();
          handleAction('attack');
        } else if (key === 'r') {
          e.preventDefault();
          handleAction('run');
        }
      } else {
        if (key === 'c') {
          e.preventDefault();
          handleContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCombatOver, handleAction, handleContinue]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Enemy Info Section */}
      <div className="space-y-4">
        {/* Enemy ASCII Art */}
        <pre className="text-center text-green-500 whitespace-pre text-[8px] sm:text-[10px] leading-tight">
          {enemy.ascii}
        </pre>

        {/* Enemy Name and Level */}
        <h2 className="text-center text-green-400 text-xl font-bold font-mono tracking-wider">
          Level {enemy.level} {enemy.name}
        </h2>

        {/* Enemy HP Bar */}
        <div className="text-center font-mono text-green-500">
          {renderHpBar(currentEnemyHp, enemy.maxHp)}
        </div>
      </div>

      {/* Divider */}
      <div className="text-center text-green-700 font-mono text-xs">
        {COMBAT_DIVIDER}
      </div>

      {/* Player HP Bar */}
      <div className="text-center font-mono text-green-400">
        <span className="font-bold">{player.name}</span> {renderHpBar(currentPlayerHp, player.maxHp)}
      </div>

      {/* Combat Log */}
      <div className="h-48 overflow-y-auto border border-green-800 bg-black/50 p-4 space-y-2">
        <AnimatePresence>
          {combatLog.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={clsx(
                'font-mono text-sm',
                message === COMBAT_DIVIDER ? 'text-green-700' : 'text-green-500'
              )}
            >
              {message}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>

      {/* Action Buttons */}
      {!isCombatOver && (
        <div className="space-y-2">
          <button
            onClick={() => handleAction('attack')}
            className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
          >
            <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[A]</span>
            <span className="group-hover:text-green-300 font-mono tracking-wider">ATTACK</span>
          </button>

          <button
            onClick={() => handleAction('run')}
            className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
          >
            <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[R]</span>
            <span className="group-hover:text-green-300 font-mono tracking-wider">RUN</span>
          </button>
        </div>
      )}

      {/* Outcome Banner */}
      {isCombatOver && outcome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className={clsx(
            'text-center font-bold text-2xl font-mono tracking-wider',
            outcome === 'victory' && 'text-green-400',
            outcome === 'defeat' && 'text-red-500',
            outcome === 'fled' && 'text-yellow-500'
          )}>
            {outcome === 'victory' && 'VICTORY!'}
            {outcome === 'defeat' && 'DEFEAT!'}
            {outcome === 'fled' && 'ESCAPED!'}
          </div>

          <div className="text-center font-mono text-green-500">
            {outcome === 'victory' && `You gained ${enemy.xpReward} XP and ${enemy.goldReward} gold!`}
            {outcome === 'defeat' && 'You limp back to town...'}
            {outcome === 'fled' && 'You fled safely.'}
          </div>

          <button
            onClick={handleContinue}
            className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
          >
            <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[C]</span>
            <span className="group-hover:text-green-300 font-mono tracking-wider">CONTINUE</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
