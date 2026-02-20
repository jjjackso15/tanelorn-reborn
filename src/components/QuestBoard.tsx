'use client';

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { PlayerState, Bounty } from '@/game/types';
import { ASCII_BOUNTY_BOARD } from '@/app/constants';

interface QuestBoardProps {
  bounties: Bounty[];
  player: PlayerState;
  onSelectBounty: (bounty: Bounty) => void;
  onBack: () => void;
}

export default function QuestBoard({ bounties, player, onSelectBounty, onBack }: QuestBoardProps) {
  const noTurns = player.turnsRemaining <= 0;

  const handleSelect = useCallback(
    (index: number) => {
      if (noTurns) return;
      if (index >= 0 && index < bounties.length) {
        onSelectBounty(bounties[index]);
      }
    },
    [noTurns, bounties, onSelectBounty]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'b') {
        e.preventDefault();
        onBack();
      } else if (key >= '1' && key <= '4') {
        e.preventDefault();
        handleSelect(parseInt(key, 10) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, handleSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start pt-10 h-full gap-6 w-full max-w-3xl mx-auto"
    >
      {/* ASCII Art */}
      <pre className="text-[8px] sm:text-[10px] md:text-xs leading-[0.8] whitespace-pre text-center text-green-500 font-bold opacity-80">
        {ASCII_BOUNTY_BOARD}
      </pre>

      <div className="w-full max-w-sm space-y-4 p-6 border-x border-green-900/30 bg-green-900/5 backdrop-blur-sm">
        {/* Title */}
        <h1 className="text-xl font-bold border-b-2 border-green-800 pb-2 mb-6 text-center tracking-widest text-green-400 shadow-green-900/50">
          BOUNTY BOARD
        </h1>

        {/* Bounty List */}
        <div className="grid gap-3">
          {bounties.slice(0, 4).map((bounty, index) => {
            const disabled = noTurns;
            return (
              <button
                key={bounty.id}
                onClick={() => handleSelect(index)}
                disabled={disabled}
                className={clsx(
                  'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                  disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-green-900/30 hover:border-green-800'
                )}
              >
                <span
                  className={clsx(
                    'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                    disabled ? 'bg-green-900 text-green-700' : 'bg-green-700 text-black'
                  )}
                >
                  [{index + 1}]
                </span>
                <div className="flex flex-col">
                  <span
                    className={clsx(
                      'font-mono tracking-wider font-bold',
                      disabled ? 'text-green-700' : 'text-green-400 group-hover:text-green-300'
                    )}
                  >
                    {bounty.targetEnemyName}
                  </span>
                  <span
                    className={clsx(
                      'font-mono text-xs',
                      disabled ? 'text-green-700' : 'text-green-500'
                    )}
                  >
                    {bounty.description}
                  </span>
                  <span
                    className={clsx(
                      'font-mono text-xs',
                      disabled ? 'text-green-700' : 'text-green-500'
                    )}
                  >
                    Bonus: +{bounty.bonusXp} XP, +{bounty.bonusGold} gold
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-4">
          <button
            onClick={onBack}
            className="text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent hover:bg-green-900/30 hover:border-green-800"
          >
            <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">
              [B]
            </span>
            <span className="group-hover:text-green-300 font-mono tracking-wider">BACK</span>
          </button>
        </div>

        {/* Status Footer */}
        <div className="mt-8 pt-4 border-t border-green-900/30 text-center text-xs text-green-700">
          <p>Turns Remaining: {player.turnsRemaining}</p>
          <p>Level: {player.level} | Gold: {player.gold}</p>
        </div>
      </div>
    </motion.div>
  );
}
