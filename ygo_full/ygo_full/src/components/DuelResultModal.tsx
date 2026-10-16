/**
 * DuelResultModal - Master Duel End of Match Screen
 * Handles Solo Duel, Online PvP, Local 2-Player (Winner name), and Survival Gauntlet Progression
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Skull, ArrowRight, Home, Flame, Award } from 'lucide-react';
import { GameMode } from '../types/duel';

interface DuelResultModalProps {
  result: 'victory' | 'defeat' | 'draw' | null;
  gameMode?: GameMode;
  winnerName?: string;
  survivalStage?: number;
  survivalScore?: number;
  onRestart: () => void;
  onNextSurvivalStage?: () => void;
  onReturnToMenu?: () => void;
}

export const DuelResultModal: React.FC<DuelResultModalProps> = ({
  result,
  gameMode = 'SOLO_AI',
  winnerName,
  survivalStage = 1,
  survivalScore = 0,
  onRestart,
  onNextSurvivalStage,
  onReturnToMenu,
}) => {
  if (!result) return null;

  const isVictory = result === 'victory';
  const isSurvival = gameMode === 'SURVIVAL';
  const isLocal2P = gameMode === 'LOCAL_2P';
  const isTowerCleared = isSurvival && isVictory && survivalStage >= 5;

  React.useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn select-none font-sans">
      <div className={`relative w-full max-w-md p-8 rounded-3xl border text-center flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,0.9)] ${
        isVictory 
          ? 'bg-gradient-to-b from-[#1c2c20] via-[#0b1612] to-[#050c09] border-amber-400 shadow-[0_0_50px_rgba(245,190,50,0.5)]'
          : 'bg-gradient-to-b from-[#2e121a] via-[#16070c] to-[#080205] border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.5)]'
      }`}>
        {/* Symbol */}
        <div className="mb-4">
          {isVictory ? (
            <div className="w-20 h-20 rounded-full bg-amber-950/80 border-2 border-amber-300 flex items-center justify-center animate-bounce shadow-xl">
              {isTowerCleared ? <Award className="w-10 h-10 text-amber-300" /> : <Trophy className="w-10 h-10 text-amber-300" />}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-950/80 border-2 border-rose-400 flex items-center justify-center animate-pulse shadow-xl">
              <Skull className="w-10 h-10 text-rose-400" />
            </div>
          )}
        </div>

        <span className="font-['Orbitron'] text-xs font-black tracking-widest text-amber-300/80 mb-1 uppercase">
          {isSurvival ? `SURVIVAL GAUNTLET · STAGE ${survivalStage} OF 5` : isLocal2P ? 'LOCAL 2-PLAYER MATCH' : 'DUEL ARENA RESULTS'}
        </span>

        <h1 className={`font-['Cinzel'] font-black text-3xl sm:text-4xl tracking-widest mb-2 ${
          isVictory ? 'text-amber-200 drop-shadow-[0_0_20px_rgba(250,200,60,0.8)]' : 'text-rose-300 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]'
        }`}>
          {isTowerCleared
            ? 'TOWER CONQUERED!'
            : isLocal2P
            ? `${winnerName?.toUpperCase() || 'DUELIST'} WINS!`
            : isVictory
            ? 'VICTORY'
            : 'DEFEAT'}
        </h1>

        {/* Descriptive Text & Survival Details */}
        <div className="text-xs text-stone-300 mb-6 max-w-xs leading-relaxed">
          {isSurvival ? (
            isVictory ? (
              isTowerCleared ? (
                <div className="space-y-1">
                  <p className="text-amber-300 font-bold">You defeated the Shadow Pharaoh!</p>
                  <p>Title unlocked: <span className="font-['Orbitron'] text-yellow-300 font-black">KING OF GAMES (VUA TRÒ CHƠI)</span></p>
                  <p className="text-stone-400">Total Score: <span className="text-white font-bold">{survivalScore + 5000}</span></p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-emerald-300 font-bold">Stage {survivalStage} Complete!</p>
                  <p>Life Point Reward: <span className="text-emerald-400 font-bold">+2,000 LP</span> added to your remaining LP.</p>
                  <p className="text-stone-400">Ready for Stage {survivalStage + 1}?</p>
                </div>
              )
            ) : (
              <div className="space-y-1">
                <p className="text-rose-300 font-bold">Tower run ended at Stage {survivalStage}.</p>
                <p>Accumulated Score: <span className="text-white font-bold">{survivalScore}</span></p>
                <p className="text-stone-400">Build a stronger deck and challenge the tower again!</p>
              </div>
            )
          ) : (
            <p>
              {isVictory 
                ? 'Masterful strategy and combat execution! The heart of the cards was with you.'
                : 'The battle was fierce. Refine your tactics, review your deck and duel again!'}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          {isSurvival && isVictory && !isTowerCleared && onNextSurvivalStage ? (
            <button
              onClick={onNextSurvivalStage}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-['Orbitron'] font-black text-xs tracking-wider shadow-[0_0_25px_rgba(52,211,153,0.7)] transition-all active:scale-95"
            >
              <span>ADVANCE TO STAGE {survivalStage + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-['Orbitron'] font-black text-xs tracking-wider shadow-[0_0_25px_rgba(245,190,50,0.7)] transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 fill-current" />
              <span>PLAY AGAIN</span>
            </button>
          )}

          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#122438] hover:bg-[#1a3552] border border-[#2b516b] text-stone-300 hover:text-white font-['Orbitron'] font-bold text-xs transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>MENU</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
