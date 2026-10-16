/**
 * DuelistHeader - Master Duel Life Points & Player Badges
 * Positioned in Top-Right (Opponent) and Bottom-Left (Player) as shown in image.png.
 */

import React from 'react';
import { PlayerState } from '../types/duel';
import { Shield, Sparkles, Flame, Bird, User, Layers, Skull } from 'lucide-react';

interface DuelistHeaderProps {
  player: PlayerState;
  side: 'player' | 'ai';
  isActiveTurn: boolean;
  onOpenGy: () => void;
  onOpenExtra?: () => void;
}

export const DuelistHeader: React.FC<DuelistHeaderProps> = ({
  player,
  side,
  isActiveTurn,
  onOpenGy,
  onOpenExtra,
}) => {
  const isPlayer = side === 'player';
  const maxLp = 8000;
  const lpPercent = Math.min(100, Math.max(0, (player.lp / maxLp) * 100));

  return (
    <div
      className={`fixed ${
        isPlayer ? 'bottom-5 left-5' : 'top-5 right-5'
      } z-30 pointer-events-auto flex items-center gap-3 bg-[#0a1626]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border ${
        isActiveTurn ? 'border-amber-400 shadow-[0_0_25px_rgba(230,190,70,0.5)]' : 'border-[#2d5875]/60'
      } transition-all duration-300`}
    >
      {/* Avatar Badge */}
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
            isPlayer ? 'bg-[#124b6b] border-sky-400' : 'bg-[#5c2438] border-rose-400'
          } shadow-lg`}
        >
          {isPlayer ? (
            <User className="w-7 h-7 text-sky-200" />
          ) : (
            <Bird className="w-7 h-7 text-rose-200 animate-bounce" />
          )}
        </div>
        {isActiveTurn && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#0a1626] animate-ping" />
        )}
      </div>

      {/* Name, Rank & LP */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="font-['Cinzel'] font-bold text-xs text-stone-200 tracking-wider">
            {isPlayer ? 'YOU (DUELIST)' : 'OPPONENT (DUEL KING)'}
          </span>
          <span className="text-[10px] font-['Orbitron'] font-semibold text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            {isPlayer ? 'RANK 1' : 'MASTER I'}
          </span>
        </div>

        {/* Big Master Duel LP Counter */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-['Orbitron'] text-xs font-bold text-stone-400">LP</span>
          <span
            className={`font-['Orbitron'] font-black text-2xl tracking-wider ${
              player.lp <= 2000 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {player.lp}
          </span>
        </div>

        {/* Life Point Bar */}
        <div className="w-36 h-2 bg-[#06101c] rounded-full overflow-hidden border border-[#2b5370]/60 mt-1">
          <div
            className={`h-full transition-all duration-500 ${
              isPlayer
                ? 'bg-gradient-to-r from-sky-500 to-emerald-400'
                : 'bg-gradient-to-r from-rose-500 to-amber-500'
            }`}
            style={{ width: `${lpPercent}%` }}
          />
        </div>
      </div>

      {/* Mini Graveyard & Extra Deck shortcut buttons */}
      <div className="flex flex-col gap-1 pl-2 border-l border-[#244b66]">
        <button
          onClick={onOpenGy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0e2438] hover:bg-[#15344f] border border-[#2e5d7d] text-[11px] font-['Orbitron'] font-bold text-sky-300 hover:text-white transition-colors"
          title="Open Graveyard"
        >
          <Skull className="w-3.5 h-3.5 text-purple-400" />
          <span>GY ({player.graveyard.length})</span>
        </button>

        {isPlayer && onOpenExtra && (
          <button
            onClick={onOpenExtra}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0e2438] hover:bg-[#15344f] border border-[#2e5d7d] text-[11px] font-['Orbitron'] font-bold text-amber-300 hover:text-white transition-colors"
            title="Open Extra Deck"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>EX ({player.extraDeck.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
