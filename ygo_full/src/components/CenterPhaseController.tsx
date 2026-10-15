/**
 * CenterPhaseController - Master Duel Center Field Phase Controller
 * Placed directly between the two playing fields at the center dividing line.
 */

import React from 'react';
import { Phase, DuelState } from '../types/duel';
import { Swords, ShieldAlert, FastForward, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface CenterPhaseControllerProps {
  state: DuelState;
  onAdvancePhase: (target: Phase) => void;
  onEndTurn: () => void;
}

const PHASES: { id: Phase; label: string; short: string }[] = [
  { id: 'DRAW', label: 'Draw Phase', short: 'DP' },
  { id: 'MAIN1', label: 'Main Phase 1', short: 'M1' },
  { id: 'BATTLE', label: 'Battle Phase', short: 'BP' },
  { id: 'MAIN2', label: 'Main Phase 2', short: 'M2' },
  { id: 'END', label: 'End Phase', short: 'EP' },
];

export const CenterPhaseController: React.FC<CenterPhaseControllerProps> = ({
  state,
  onAdvancePhase,
  onEndTurn,
}) => {
  const isPlayerTurn = state.activeSide === 'player';
  const isFirstTurnOfDuel = state.turn === 1;

  // Determine what the big center action button should do
  let nextAction: { label: string; phase?: Phase; isEnd?: boolean; icon: React.ReactNode } | null = null;

  if (isPlayerTurn && !state.over) {
    if (state.phase === 'MAIN1') {
      if (isFirstTurnOfDuel) {
        nextAction = { label: 'END TURN', isEnd: true, icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> };
      } else {
        nextAction = { label: 'BATTLE PHASE', phase: 'BATTLE', icon: <Swords className="w-5 h-5 text-amber-300" /> };
      }
    } else if (state.phase === 'BATTLE') {
      nextAction = { label: 'MAIN PHASE 2', phase: 'MAIN2', icon: <FastForward className="w-5 h-5 text-sky-400" /> };
    } else if (state.phase === 'MAIN2') {
      nextAction = { label: 'END TURN', isEnd: true, icon: <CheckCircle2 className="w-5 h-5 text-rose-400" /> };
    }
  }

  const handleActionClick = () => {
    sound.playPhase();
    if (!nextAction) return;
    if (nextAction.isEnd) {
      onEndTurn();
    } else if (nextAction.phase) {
      onAdvancePhase(nextAction.phase);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto flex items-center gap-3 bg-[#081220]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#48829c]/60 shadow-[0_0_25px_rgba(40,160,220,0.35)]">
      {/* Phase sequence pills */}
      <div className="flex items-center gap-1.5">
        {PHASES.map((p) => {
          const isActive = state.phase === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (isPlayerTurn && !state.over) {
                  if (p.id === 'BATTLE' && isFirstTurnOfDuel) return;
                  if (['MAIN1', 'BATTLE', 'MAIN2'].includes(p.id)) {
                    sound.playPhase();
                    onAdvancePhase(p.id);
                  }
                }
              }}
              disabled={!isPlayerTurn || state.over || (p.id === 'BATTLE' && isFirstTurnOfDuel)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,190,50,0.7)] scale-105'
                  : 'bg-[#102436] text-stone-400 hover:text-stone-200 border border-[#2b516b]/50'
              }`}
              title={p.label}
            >
              <span className="font-['Orbitron'] tracking-wider">{p.short}</span>
              <span className="hidden md:inline text-[10px] uppercase font-semibold">{p.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Prominent Circular Master Duel Phase Action Button (as seen in image.png) */}
      {nextAction && isPlayerTurn && (
        <button
          onClick={handleActionClick}
          className="relative group flex items-center gap-2 pl-3.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-[#205270] via-[#1b6b80] to-[#1a7f6c] hover:from-[#2a6d94] hover:to-[#22a88f] border border-[#7ae3ff] text-white shadow-[0_0_18px_rgba(80,220,255,0.6)] active:scale-95 transition-all animate-pulse"
        >
          <div className="w-8 h-8 rounded-full bg-[#0a1c2b] border border-[#a2e8ff] flex items-center justify-center shadow-inner">
            {nextAction.icon}
          </div>
          <span className="font-['Orbitron'] text-xs font-black tracking-wider text-amber-200 group-hover:text-white drop-shadow">
            {nextAction.label}
          </span>
        </button>
      )}

      {/* Active turn indicator when opponent's turn */}
      {!isPlayerTurn && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-['Orbitron'] animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>OPPONENT'S TURN</span>
        </div>
      )}
    </div>
  );
};
