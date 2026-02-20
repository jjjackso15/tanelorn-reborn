'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  PlayerState,
  Enemy,
  Zone,
  DelveResult,
  DelveStepEvent,
  DOTEffect,
  DelveBuff,
  DelveItem,
  Relic,
  CombatOutcome,
  CombatContext,
} from '@/game/types';
import { generateDelveStep, tickDOTs } from '@/game/delve';
import CombatScreen from '@/components/CombatScreen';

interface DelveScreenProps {
  player: PlayerState;
  zone: Zone;
  onDelveEnd: (result: DelveResult) => void;
}

type DelvePhase =
  | 'dot_tick'
  | 'event'
  | 'event_result'
  | 'combat'
  | 'choice'
  | 'boss_victory'
  | 'defeat'
  | 'retreat_summary';

const TOTAL_STEPS = 6;

const difficultyColor: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-500',
  hard: 'text-amber-500',
  deadly: 'text-red-500',
};

export default function DelveScreen({ player, zone, onDelveEnd }: DelveScreenProps) {
  const [phase, setPhase] = useState<DelvePhase>('event');
  const [step, setStep] = useState(1);
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [goldAccum, setGoldAccum] = useState(0);
  const [xpAccum, setXpAccum] = useState(0);
  const [activeDOTs, setActiveDOTs] = useState<DOTEffect[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<DelveBuff[]>([]);
  const [currentEvent, setCurrentEvent] = useState<DelveStepEvent | null>(
    () => generateDelveStep(zone, 1, player.level, player.clearedBosses)
  );
  const [acquiredRelic, setAcquiredRelic] = useState<Relic | undefined>(undefined);
  const [dotMessages, setDotMessages] = useState<string[]>([]);
  const [merchantMessage, setMerchantMessage] = useState<string | null>(null);
  const [healerDecided, setHealerDecided] = useState(false);

  // Auto-advance from dot_tick after 1.5s
  useEffect(() => {
    if (phase !== 'dot_tick') return;
    const timer = setTimeout(() => {
      // After DOT tick, show the event for this step
      const event = generateDelveStep(zone, step, player.level, player.clearedBosses);
      setCurrentEvent(event);
      setPhase('event');
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase, zone, step, player.level, player.clearedBosses]);

  // Advance to the next step
  const advanceToNextStep = useCallback(() => {
    const nextStep = step + 1;

    if (nextStep > TOTAL_STEPS) {
      // Should not happen — step 6 is boss, handled separately
      return;
    }

    setStep(nextStep);
    setMerchantMessage(null);
    setHealerDecided(false);

    // Check for DOT damage before showing the next event
    if (activeDOTs.length > 0) {
      const { remaining, damage, messages } = tickDOTs(activeDOTs);
      const newHp = Math.max(0, playerHp - damage);
      setPlayerHp(newHp);
      setActiveDOTs(remaining);
      setDotMessages(messages);

      if (newHp <= 0) {
        setPhase('defeat');
        return;
      }

      setPhase('dot_tick');
    } else {
      const event = generateDelveStep(zone, nextStep, player.level, player.clearedBosses);
      setCurrentEvent(event);
      setPhase('event');
    }
  }, [step, activeDOTs, playerHp, zone, player.level, player.clearedBosses]);

  // Handle proceeding from event to event_result or combat
  const handleEventProceed = useCallback(() => {
    if (!currentEvent) return;

    switch (currentEvent.type) {
      case 'combat':
      case 'boss':
        setPhase('combat');
        break;
      case 'trap': {
        const newHp = Math.max(0, playerHp - currentEvent.damage);
        setPlayerHp(newHp);
        if (currentEvent.dot) {
          setActiveDOTs(prev => [...prev, currentEvent.dot!]);
        }
        if (newHp <= 0) {
          setPhase('defeat');
        } else {
          setPhase('event_result');
        }
        break;
      }
      case 'treasure':
        setGoldAccum(prev => prev + currentEvent.gold);
        setPhase('event_result');
        break;
      case 'buffer':
        setActiveBuffs(prev => [...prev, currentEvent.buff]);
        setPhase('event_result');
        break;
      case 'merchant':
        setPhase('event_result');
        break;
      case 'healer':
        setPhase('event_result');
        break;
    }
  }, [currentEvent, playerHp]);

  // Handle buying a merchant item
  const handleBuyMerchantItem = useCallback((item: DelveItem) => {
    if (goldAccum < item.cost) {
      setMerchantMessage('Not enough gold');
      return;
    }

    setGoldAccum(prev => prev - item.cost);

    if ('type' in item.effect && item.effect.type === 'heal') {
      const newHp = Math.min(player.maxHp, playerHp + item.effect.amount);
      setPlayerHp(newHp);
      setMerchantMessage(`Used ${item.name} — restored ${item.effect.amount} HP`);
    } else {
      const buff = item.effect as DelveBuff;
      setActiveBuffs(prev => [...prev, buff]);
      setMerchantMessage(`Bought ${item.name} — +${buff.amount} ${buff.stat.toUpperCase()}`);
    }
  }, [goldAccum, playerHp, player.maxHp]);

  // Handle healer accept
  const handleHealerAccept = useCallback(() => {
    if (!currentEvent || currentEvent.type !== 'healer') return;
    if (goldAccum < currentEvent.cost) {
      setMerchantMessage('Not enough gold');
      return;
    }
    setGoldAccum(prev => prev - currentEvent.cost);
    const newHp = Math.min(player.maxHp, playerHp + currentEvent.healAmount);
    setPlayerHp(newHp);
    setHealerDecided(true);
  }, [currentEvent, goldAccum, playerHp, player.maxHp]);

  // Handle healer decline
  const handleHealerDecline = useCallback(() => {
    setHealerDecided(true);
  }, []);

  // Handle combat end
  const handleCombatEnd = useCallback((outcome: CombatOutcome, _enemy: Enemy, _context?: CombatContext, finalPlayerHp?: number) => {
    if (!currentEvent) return;

    if (outcome === 'victory') {
      const enemyData = currentEvent.type === 'combat' || currentEvent.type === 'boss' ? currentEvent.enemy : null;
      if (enemyData) {
        setXpAccum(prev => prev + enemyData.xpReward);
        setGoldAccum(prev => prev + enemyData.goldReward);
      }

      if (finalPlayerHp !== undefined) {
        setPlayerHp(finalPlayerHp);
      }

      if (currentEvent.type === 'boss') {
        if (currentEvent.relic) {
          setAcquiredRelic(currentEvent.relic);
        }
        setPhase('boss_victory');
      } else {
        // Regular combat victory — go to choice if not at step 5
        if (step >= 5) {
          // Auto-advance to step 6 (boss)
          advanceToNextStep();
        } else {
          setPhase('choice');
        }
      }
    } else if (outcome === 'defeat') {
      if (finalPlayerHp !== undefined) {
        setPlayerHp(finalPlayerHp);
      }
      setPhase('defeat');
    } else if (outcome === 'fled') {
      if (finalPlayerHp !== undefined) {
        setPlayerHp(finalPlayerHp);
      }
      // Treat flee as retreat — keep accumulated rewards
      onDelveEnd({
        outcome: 'retreated',
        goldEarned: goldAccum,
        xpEarned: xpAccum,
        finalHp: finalPlayerHp ?? playerHp,
        stepsCompleted: step - 1,
      });
    }
  }, [currentEvent, step, goldAccum, xpAccum, playerHp, advanceToNextStep, onDelveEnd]);

  // Handle delve deeper choice
  const handleDelveDeeper = useCallback(() => {
    if (phase !== 'choice') return;
    advanceToNextStep();
  }, [phase, advanceToNextStep]);

  // Handle retreat choice
  const handleRetreat = useCallback(() => {
    if (phase !== 'choice') return;
    setPhase('retreat_summary');
  }, [phase]);

  // Handle continue from event_result
  const handleContinueFromResult = useCallback(() => {
    if (phase !== 'event_result') return;
    if (currentEvent?.type === 'healer' && !healerDecided) return;
    if (currentEvent?.type === 'merchant') {
      // Merchant: continue moves to choice
    }

    if (step >= 5) {
      // After step 5 event, auto-advance to step 6
      advanceToNextStep();
    } else {
      setPhase('choice');
    }
  }, [phase, currentEvent, healerDecided, step, advanceToNextStep]);

  // Handle continue from dot_tick (manual, though it auto-advances)
  const handleContinueFromDot = useCallback(() => {
    if (phase !== 'dot_tick') return;
    const event = generateDelveStep(zone, step, player.level, player.clearedBosses);
    setCurrentEvent(event);
    setPhase('event');
  }, [phase, zone, step, player.level, player.clearedBosses]);

  // Handle end screens
  const handleFinalContinue = useCallback(() => {
    if (phase === 'defeat') {
      onDelveEnd({
        outcome: 'defeated',
        goldEarned: Math.floor(goldAccum * 0.5),
        xpEarned: xpAccum,
        finalHp: 0,
        stepsCompleted: step,
      });
    } else if (phase === 'retreat_summary') {
      onDelveEnd({
        outcome: 'retreated',
        goldEarned: goldAccum,
        xpEarned: xpAccum,
        finalHp: playerHp,
        stepsCompleted: step,
      });
    } else if (phase === 'boss_victory') {
      onDelveEnd({
        outcome: 'cleared',
        goldEarned: goldAccum,
        xpEarned: xpAccum,
        relic: acquiredRelic,
        finalHp: playerHp,
        stepsCompleted: TOTAL_STEPS,
      });
    }
  }, [phase, goldAccum, xpAccum, playerHp, step, acquiredRelic, onDelveEnd]);

  // Keyboard shortcuts scoped to current phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      switch (phase) {
        case 'event': {
          if (key === 'c') {
            e.preventDefault();
            handleEventProceed();
          }
          break;
        }
        case 'event_result': {
          if (currentEvent?.type === 'healer' && !healerDecided) {
            if (key === 'y') {
              e.preventDefault();
              handleHealerAccept();
            } else if (key === 'n') {
              e.preventDefault();
              handleHealerDecline();
            }
          } else if (currentEvent?.type === 'merchant') {
            if (key >= '1' && key <= '4') {
              e.preventDefault();
              const items = currentEvent.items;
              const index = parseInt(key, 10) - 1;
              if (index < items.length) {
                handleBuyMerchantItem(items[index]);
              }
            } else if (key === 'c') {
              e.preventDefault();
              handleContinueFromResult();
            }
          } else {
            if (key === 'c') {
              e.preventDefault();
              handleContinueFromResult();
            }
          }
          break;
        }
        case 'choice': {
          if (key === 'd') {
            e.preventDefault();
            handleDelveDeeper();
          } else if (key === 'r') {
            e.preventDefault();
            handleRetreat();
          }
          break;
        }
        case 'dot_tick': {
          if (key === 'c') {
            e.preventDefault();
            handleContinueFromDot();
          }
          break;
        }
        case 'boss_victory':
        case 'defeat':
        case 'retreat_summary': {
          if (key === 'c') {
            e.preventDefault();
            handleFinalContinue();
          }
          break;
        }
        // combat phase: keyboard handled by CombatScreen
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    phase,
    currentEvent,
    healerDecided,
    handleEventProceed,
    handleHealerAccept,
    handleHealerDecline,
    handleBuyMerchantItem,
    handleContinueFromResult,
    handleContinueFromDot,
    handleDelveDeeper,
    handleRetreat,
    handleFinalContinue,
  ]);

  // Build buffed player for combat
  const buffedPlayer: PlayerState = {
    ...player,
    hp: playerHp,
    maxHp: player.maxHp,
    stats: {
      strength: player.stats.strength + activeBuffs.filter(b => b.stat === 'strength').reduce((s, b) => s + b.amount, 0),
      defense: player.stats.defense + activeBuffs.filter(b => b.stat === 'defense').reduce((s, b) => s + b.amount, 0),
      agility: player.stats.agility + activeBuffs.filter(b => b.stat === 'agility').reduce((s, b) => s + b.amount, 0),
    },
  };

  // Render the progress bar
  function renderProgressBar() {
    const segments: string[] = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      segments.push(i <= step ? '#' : '.');
    }
    return `[${segments.join(' ')}]`;
  }

  // Render HP bar
  function renderHpBar(current: number, max: number): string {
    const width = 20;
    const filled = Math.max(0, Math.round((current / max) * width));
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${current}/${max}`;
  }

  // If in combat phase, render CombatScreen directly
  if (phase === 'combat' && currentEvent && (currentEvent.type === 'combat' || currentEvent.type === 'boss')) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Delve header above combat */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          <div className="flex items-center justify-between font-mono text-sm">
            <span className="text-green-500">{renderProgressBar()} Step {step}/{TOTAL_STEPS}</span>
            <span className={clsx('font-bold uppercase', difficultyColor[zone.difficulty])}>
              {zone.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 font-mono text-xs">
            {activeDOTs.map((dot, i) => (
              <span key={`dot-${i}`} className={clsx(
                'font-bold',
                dot.type === 'poison' ? 'text-purple-400' : 'text-red-400'
              )}>
                {dot.type.toUpperCase()} ({dot.remainingSteps} steps)
              </span>
            ))}
            {activeBuffs.map((buff, i) => (
              <span key={`buff-${i}`} className="text-cyan-400 font-bold">
                +{buff.amount} {buff.stat.toUpperCase()}
              </span>
            ))}
          </div>
          <div className="font-mono text-xs text-green-600">
            Gold: <span className="text-yellow-400">+{goldAccum}g</span> | XP: <span className="text-green-400">+{xpAccum}</span>
          </div>
        </div>

        <CombatScreen
          player={buffedPlayer}
          enemy={currentEvent.enemy}
          context={{ type: 'zone', zoneName: zone.name }}
          onCombatEnd={handleCombatEnd}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header — always visible */}
      <div className="space-y-2 border border-green-800 bg-green-900/5 p-4">
        {/* Progress bar and zone */}
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-green-500 font-bold">{renderProgressBar()} Step {step}/{TOTAL_STEPS}</span>
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold">{zone.name}</span>
            <span className={clsx('text-xs font-bold uppercase', difficultyColor[zone.difficulty])}>
              [{zone.difficulty}]
            </span>
          </div>
        </div>

        {/* HP bar */}
        <div className="font-mono text-sm text-green-400">
          <span className="font-bold">{player.name}</span>{' '}
          <span className={clsx(
            playerHp <= player.maxHp * 0.25 ? 'text-red-500' :
            playerHp <= player.maxHp * 0.5 ? 'text-yellow-500' :
            'text-green-400'
          )}>
            {renderHpBar(playerHp, player.maxHp)}
          </span>
        </div>

        {/* Status effects row */}
        <div className="flex flex-wrap gap-3 font-mono text-xs">
          {activeDOTs.map((dot, i) => (
            <span key={`dot-${i}`} className={clsx(
              'font-bold px-2 py-0.5 border',
              dot.type === 'poison' ? 'text-purple-400 border-purple-800' : 'text-red-400 border-red-800'
            )}>
              {dot.type.toUpperCase()} ({dot.remainingSteps} steps)
            </span>
          ))}
          {activeBuffs.map((buff, i) => (
            <span key={`buff-${i}`} className="text-cyan-400 font-bold px-2 py-0.5 border border-cyan-800">
              +{buff.amount} {buff.stat.toUpperCase()}
            </span>
          ))}
          {activeDOTs.length === 0 && activeBuffs.length === 0 && (
            <span className="text-green-700">No active effects</span>
          )}
        </div>

        {/* Gold and XP */}
        <div className="font-mono text-xs text-green-600">
          Gold: <span className="text-yellow-400 font-bold">+{goldAccum}g</span>{' '}
          | XP: <span className="text-green-400 font-bold">+{xpAccum}</span>
        </div>
      </div>

      {/* Center panel — varies by phase */}
      <AnimatePresence mode="wait">
        {/* DOT TICK PHASE */}
        {phase === 'dot_tick' && (
          <motion.div
            key="dot_tick"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border border-green-800 bg-green-900/5 p-6 space-y-3"
          >
            <h2 className="font-mono font-bold text-red-400 tracking-widest text-center text-lg">
              STATUS EFFECTS
            </h2>
            <div className="space-y-2">
              {dotMessages.map((msg, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="font-mono text-sm text-red-500"
                >
                  {msg}
                </motion.p>
              ))}
            </div>
            <p className="font-mono text-xs text-green-700 text-center mt-4">
              Auto-advancing...
            </p>
          </motion.div>
        )}

        {/* EVENT PHASE */}
        {phase === 'event' && currentEvent && (
          <motion.div
            key={`event-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border border-green-800 bg-green-900/5 p-6 space-y-4"
          >
            <h2 className="font-mono font-bold text-green-400 tracking-widest text-center text-lg border-b border-green-800 pb-2">
              {step === 6 ? 'BOSS ENCOUNTER' : `STEP ${step}`}
            </h2>

            {currentEvent.type === 'combat' && (
              <div className="space-y-3">
                <pre className="text-center text-green-500 whitespace-pre text-[8px] sm:text-[10px] leading-tight">
                  {currentEvent.enemy.ascii}
                </pre>
                <p className="font-mono text-sm text-green-500 text-center">
                  A <span className="text-green-300 font-bold">Level {currentEvent.enemy.level} {currentEvent.enemy.name}</span> blocks your path!
                </p>
              </div>
            )}

            {currentEvent.type === 'boss' && (
              <div className="space-y-3">
                <pre className="text-center text-red-400 whitespace-pre text-[8px] sm:text-[10px] leading-tight">
                  {currentEvent.enemy.ascii}
                </pre>
                <p className="font-mono text-sm text-red-400 text-center font-bold">
                  The dungeon boss <span className="text-red-300">Level {currentEvent.enemy.level} {currentEvent.enemy.name}</span> awaits!
                </p>
                {currentEvent.relic && (
                  <p className="font-mono text-xs text-cyan-400 text-center">
                    A mysterious relic radiates power nearby...
                  </p>
                )}
              </div>
            )}

            {currentEvent.type === 'trap' && (
              <div className="space-y-2">
                <p className="font-mono text-sm text-red-500 font-bold text-center">
                  {currentEvent.message}
                </p>
                <p className="font-mono text-sm text-red-400 text-center">
                  Potential damage: <span className="font-bold">{currentEvent.damage} HP</span>
                </p>
                {currentEvent.dot && (
                  <p className={clsx(
                    'font-mono text-xs text-center font-bold',
                    currentEvent.dot.type === 'poison' ? 'text-purple-400' : 'text-orange-400'
                  )}>
                    Applies {currentEvent.dot.type.toUpperCase()}: {currentEvent.dot.damagePerStep} dmg/step for {currentEvent.dot.remainingSteps} steps
                  </p>
                )}
              </div>
            )}

            {currentEvent.type === 'treasure' && (
              <div className="space-y-2">
                <p className="font-mono text-sm text-yellow-500 font-bold text-center">
                  {currentEvent.message}
                </p>
                <p className="font-mono text-sm text-yellow-400 text-center">
                  You spot <span className="font-bold">{currentEvent.gold} gold</span> gleaming ahead!
                </p>
              </div>
            )}

            {currentEvent.type === 'merchant' && (
              <div className="space-y-2">
                <p className="font-mono text-sm text-cyan-400 font-bold text-center">
                  A shady merchant emerges from the shadows!
                </p>
                <p className="font-mono text-xs text-green-600 text-center">
                  &quot;Take a look at my wares, adventurer...&quot;
                </p>
              </div>
            )}

            {currentEvent.type === 'buffer' && (
              <div className="space-y-2">
                <p className="font-mono text-sm text-cyan-400 font-bold text-center">
                  {currentEvent.message}
                </p>
                <p className="font-mono text-sm text-cyan-300 text-center">
                  Grants: <span className="font-bold">+{currentEvent.buff.amount} {currentEvent.buff.stat.toUpperCase()}</span>
                </p>
              </div>
            )}

            {currentEvent.type === 'healer' && (
              <div className="space-y-2">
                <p className="font-mono text-sm text-green-400 font-bold text-center">
                  A wandering healer offers aid!
                </p>
                <p className="font-mono text-sm text-green-500 text-center">
                  Cost: <span className="text-yellow-400 font-bold">{currentEvent.cost}g</span> | Heal: <span className="text-green-300 font-bold">{currentEvent.healAmount} HP</span>
                </p>
              </div>
            )}

            {/* Continue button */}
            <div className="pt-2">
              <button
                onClick={handleEventProceed}
                className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
              >
                <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[C]</span>
                <span className="group-hover:text-green-300 font-mono tracking-wider">
                  {currentEvent.type === 'combat' || currentEvent.type === 'boss' ? 'ENGAGE' : 'CONTINUE'}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* EVENT RESULT PHASE */}
        {phase === 'event_result' && currentEvent && (
          <motion.div
            key={`result-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border border-green-800 bg-green-900/5 p-6 space-y-4"
          >
            {/* Trap result */}
            {currentEvent.type === 'trap' && (
              <div className="space-y-2">
                <h2 className="font-mono font-bold text-red-400 tracking-widest text-center">TRAP TRIGGERED</h2>
                <p className="font-mono text-sm text-red-500 text-center">
                  You took <span className="font-bold">{currentEvent.damage} damage</span>!
                </p>
                {currentEvent.dot && (
                  <p className={clsx(
                    'font-mono text-xs text-center font-bold',
                    currentEvent.dot.type === 'poison' ? 'text-purple-400' : 'text-orange-400'
                  )}>
                    {currentEvent.dot.type.toUpperCase()} applied: {currentEvent.dot.damagePerStep} dmg/step for {currentEvent.dot.remainingSteps} steps
                  </p>
                )}
                <p className="font-mono text-xs text-green-600 text-center">
                  HP: {playerHp}/{player.maxHp}
                </p>
              </div>
            )}

            {/* Treasure result */}
            {currentEvent.type === 'treasure' && (
              <div className="space-y-2">
                <h2 className="font-mono font-bold text-yellow-400 tracking-widest text-center">TREASURE FOUND</h2>
                <p className="font-mono text-sm text-yellow-500 text-center">
                  {currentEvent.message}
                </p>
                <p className="font-mono text-sm text-yellow-400 text-center">
                  +<span className="font-bold">{currentEvent.gold} gold</span> collected!
                </p>
              </div>
            )}

            {/* Buffer result */}
            {currentEvent.type === 'buffer' && (
              <div className="space-y-2">
                <h2 className="font-mono font-bold text-cyan-400 tracking-widest text-center">BLESSING RECEIVED</h2>
                <p className="font-mono text-sm text-cyan-400 text-center">
                  {currentEvent.message}
                </p>
                <p className="font-mono text-sm text-cyan-300 text-center">
                  +<span className="font-bold">{currentEvent.buff.amount} {currentEvent.buff.stat.toUpperCase()}</span> for the remainder of this delve!
                </p>
              </div>
            )}

            {/* Merchant result */}
            {currentEvent.type === 'merchant' && (
              <div className="space-y-4">
                <h2 className="font-mono font-bold text-cyan-400 tracking-widest text-center">MERCHANT</h2>
                <p className="font-mono text-xs text-green-600 text-center">
                  Available gold: <span className="text-yellow-400 font-bold">{goldAccum}g</span>
                </p>

                {merchantMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={clsx(
                      'font-mono text-sm text-center font-bold',
                      merchantMessage === 'Not enough gold' ? 'text-red-500' : 'text-green-400'
                    )}
                  >
                    {merchantMessage}
                  </motion.p>
                )}

                <div className="space-y-2">
                  {currentEvent.items.map((item, index) => {
                    const canBuy = goldAccum >= item.cost;
                    const isHeal = 'type' in item.effect && item.effect.type === 'heal';
                    const effectText = isHeal
                      ? `Heal ${(item.effect as { type: 'heal'; amount: number }).amount} HP`
                      : `+${(item.effect as DelveBuff).amount} ${(item.effect as DelveBuff).stat.toUpperCase()}`;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleBuyMerchantItem(item)}
                        disabled={!canBuy}
                        className={clsx(
                          'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                          !canBuy
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-green-900/30 hover:border-green-800'
                        )}
                      >
                        <span className={clsx(
                          'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                          !canBuy ? 'bg-green-900 text-green-700' : 'bg-green-700 text-black'
                        )}>
                          [{index + 1}]
                        </span>
                        <div className="flex flex-col flex-1">
                          <span className={clsx(
                            'font-mono tracking-wider font-bold',
                            !canBuy ? 'text-green-700' : 'text-green-400 group-hover:text-green-300'
                          )}>
                            {item.name}
                          </span>
                          <span className={clsx(
                            'font-mono text-xs',
                            !canBuy ? 'text-green-700' : 'text-green-500'
                          )}>
                            {item.description}
                          </span>
                        </div>
                        <span className={clsx(
                          'font-mono text-xs',
                          !canBuy ? 'text-green-700' : 'text-cyan-400'
                        )}>
                          {effectText}
                        </span>
                        <span className={clsx(
                          'font-mono text-sm',
                          !canBuy ? 'text-green-700' : 'text-yellow-400'
                        )}>
                          {item.cost}g
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Healer result */}
            {currentEvent.type === 'healer' && !healerDecided && (
              <div className="space-y-4">
                <h2 className="font-mono font-bold text-green-400 tracking-widest text-center">HEALER</h2>
                <p className="font-mono text-sm text-green-500 text-center">
                  HP: {playerHp}/{player.maxHp}
                </p>
                <p className="font-mono text-sm text-green-500 text-center">
                  Cost: <span className="text-yellow-400 font-bold">{currentEvent.cost}g</span> | Heal: <span className="text-green-300 font-bold">{currentEvent.healAmount} HP</span>
                </p>
                <p className="font-mono text-xs text-green-600 text-center">
                  Available gold: <span className="text-yellow-400 font-bold">{goldAccum}g</span>
                </p>

                {merchantMessage && (
                  <p className="font-mono text-sm text-center font-bold text-red-500">
                    {merchantMessage}
                  </p>
                )}

                <div className="space-y-2">
                  <button
                    onClick={handleHealerAccept}
                    disabled={goldAccum < currentEvent.cost}
                    className={clsx(
                      'text-left w-full p-2 group flex items-center gap-4 transition-all border border-transparent',
                      goldAccum < currentEvent.cost
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-green-900/30 hover:border-green-800'
                    )}
                  >
                    <span className={clsx(
                      'px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center',
                      goldAccum < currentEvent.cost ? 'bg-green-900 text-green-700' : 'bg-green-700 text-black'
                    )}>
                      [Y]
                    </span>
                    <span className={clsx(
                      'font-mono tracking-wider',
                      goldAccum < currentEvent.cost ? 'text-green-700' : 'group-hover:text-green-300'
                    )}>
                      ACCEPT HEALING
                    </span>
                  </button>
                  <button
                    onClick={handleHealerDecline}
                    className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
                  >
                    <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[N]</span>
                    <span className="group-hover:text-green-300 font-mono tracking-wider">DECLINE</span>
                  </button>
                </div>
              </div>
            )}

            {/* Healer decided */}
            {currentEvent.type === 'healer' && healerDecided && (
              <div className="space-y-2">
                <h2 className="font-mono font-bold text-green-400 tracking-widest text-center">HEALER</h2>
                <p className="font-mono text-sm text-green-500 text-center">
                  {goldAccum >= 0 ? 'The healer nods and moves on.' : 'You decline the offer.'}
                </p>
                <p className="font-mono text-xs text-green-600 text-center">
                  HP: {playerHp}/{player.maxHp}
                </p>
              </div>
            )}

            {/* Continue button (shown for non-merchant/healer, or after healer decided, or merchant any time) */}
            {(currentEvent.type !== 'healer' || healerDecided) && (
              <div className="pt-2">
                <button
                  onClick={handleContinueFromResult}
                  className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
                >
                  <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[C]</span>
                  <span className="group-hover:text-green-300 font-mono tracking-wider">CONTINUE</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* CHOICE PHASE */}
        {phase === 'choice' && (
          <motion.div
            key={`choice-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border border-green-800 bg-green-900/5 p-6 space-y-4"
          >
            <h2 className="font-mono font-bold text-green-400 tracking-widest text-center text-lg">
              WHAT DO YOU DO?
            </h2>
            <p className="font-mono text-sm text-green-500 text-center">
              The dungeon stretches deeper before you. Step {step} of {TOTAL_STEPS} complete.
            </p>
            {step === 4 && (
              <p className="font-mono text-xs text-yellow-500 text-center">
                Warning: The next step leads to the final boss!
              </p>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleDelveDeeper}
                className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
              >
                <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[D]</span>
                <span className="group-hover:text-green-300 font-mono tracking-wider">DELVE DEEPER</span>
              </button>
              <button
                onClick={handleRetreat}
                className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
              >
                <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[R]</span>
                <span className="group-hover:text-green-300 font-mono tracking-wider">RETREAT</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* BOSS VICTORY PHASE */}
        {phase === 'boss_victory' && (
          <motion.div
            key="boss_victory"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border border-green-800 bg-green-900/5 p-6 space-y-4"
          >
            <h2 className="font-mono font-bold text-green-400 tracking-widest text-center text-2xl">
              DUNGEON CLEARED!
            </h2>
            <p className="font-mono text-sm text-green-500 text-center">
              You have conquered the depths of <span className="text-green-300 font-bold">{zone.name}</span>!
            </p>

            <div className="space-y-2 border border-green-800 bg-green-900/10 p-4">
              <h3 className="font-mono font-bold text-green-400 text-sm tracking-wider">REWARDS</h3>
              <p className="font-mono text-sm text-yellow-400">
                Gold earned: <span className="font-bold">+{goldAccum}g</span>
              </p>
              <p className="font-mono text-sm text-green-400">
                XP earned: <span className="font-bold">+{xpAccum}</span>
              </p>
            </div>

            {acquiredRelic && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2 border border-cyan-800 bg-cyan-900/10 p-4"
              >
                <h3 className="font-mono font-bold text-cyan-400 text-sm tracking-wider">RELIC ACQUIRED</h3>
                <p className="font-mono text-sm text-cyan-300 font-bold">
                  {acquiredRelic.name}
                </p>
                <p className="font-mono text-xs text-cyan-400">
                  {acquiredRelic.description}
                </p>
                <div className="flex gap-3 font-mono text-xs text-cyan-400">
                  {acquiredRelic.statBonuses.strength && (
                    <span>+{acquiredRelic.statBonuses.strength} STR</span>
                  )}
                  {acquiredRelic.statBonuses.defense && (
                    <span>+{acquiredRelic.statBonuses.defense} DEF</span>
                  )}
                  {acquiredRelic.statBonuses.agility && (
                    <span>+{acquiredRelic.statBonuses.agility} AGI</span>
                  )}
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <button
                onClick={handleFinalContinue}
                className="text-left w-full hover:bg-green-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-green-800"
              >
                <span className="bg-green-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[C]</span>
                <span className="group-hover:text-green-300 font-mono tracking-wider">CONTINUE</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* DEFEAT PHASE */}
        {phase === 'defeat' && (
          <motion.div
            key="defeat"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border border-red-900 bg-red-900/5 p-6 space-y-4"
          >
            <h2 className="font-mono font-bold text-red-500 tracking-widest text-center text-2xl">
              DEFEATED!
            </h2>
            <p className="font-mono text-sm text-red-400 text-center">
              The dungeon claims another victim...
            </p>

            <div className="space-y-2 border border-red-900 bg-red-900/10 p-4">
              <h3 className="font-mono font-bold text-red-400 text-sm tracking-wider">PENALTIES</h3>
              <p className="font-mono text-sm text-yellow-400">
                Gold lost: <span className="font-bold text-red-400">-{Math.floor(goldAccum * 0.5)}g</span> (50% penalty)
              </p>
              <p className="font-mono text-sm text-yellow-500">
                Gold kept: <span className="font-bold">{Math.floor(goldAccum * 0.5)}g</span>
              </p>
              <p className="font-mono text-sm text-green-400">
                XP kept: <span className="font-bold">+{xpAccum}</span>
              </p>
              <p className="font-mono text-xs text-green-600">
                Steps completed: {step}/{TOTAL_STEPS}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinalContinue}
                className="text-left w-full hover:bg-red-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-red-800"
              >
                <span className="bg-red-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[C]</span>
                <span className="group-hover:text-red-300 font-mono tracking-wider">CONTINUE</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* RETREAT SUMMARY PHASE */}
        {phase === 'retreat_summary' && (
          <motion.div
            key="retreat"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border border-yellow-900 bg-yellow-900/5 p-6 space-y-4"
          >
            <h2 className="font-mono font-bold text-yellow-500 tracking-widest text-center text-2xl">
              RETREAT!
            </h2>
            <p className="font-mono text-sm text-yellow-400 text-center">
              You retreat from {zone.name}, treasures in hand.
            </p>

            <div className="space-y-2 border border-green-800 bg-green-900/10 p-4">
              <h3 className="font-mono font-bold text-green-400 text-sm tracking-wider">REWARDS KEPT</h3>
              <p className="font-mono text-sm text-yellow-400">
                Gold earned: <span className="font-bold">+{goldAccum}g</span>
              </p>
              <p className="font-mono text-sm text-green-400">
                XP earned: <span className="font-bold">+{xpAccum}</span>
              </p>
              <p className="font-mono text-xs text-green-600">
                Steps completed: {step}/{TOTAL_STEPS}
              </p>
              <p className="font-mono text-xs text-green-600">
                HP remaining: {playerHp}/{player.maxHp}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinalContinue}
                className="text-left w-full hover:bg-yellow-900/30 p-2 group flex items-center gap-4 transition-all border border-transparent hover:border-yellow-800"
              >
                <span className="bg-yellow-700 text-black px-2 py-0.5 font-bold font-mono min-w-[2rem] text-center">[C]</span>
                <span className="group-hover:text-yellow-300 font-mono tracking-wider">CONTINUE</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
