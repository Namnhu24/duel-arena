/**
 * PlayerHand - Fanned out cards with Hand Effect indicators and Local 2-Player privacy curtain
 */

import React, { useState } from 'react';
import { CardInstance } from '../types/duel';
import { Zap, Eye, EyeOff, Shield } from 'lucide-react';
import { sound } from '../utils/audio';

interface PlayerHandProps {
  hand: CardInstance[];
  selectedCardUid: number | null;
  onSelectCard: (card: CardInstance) => void;
  onCardAction: (card: CardInstance) => void;
  ownerName?: string;
  isLocal2P?: boolean;
  activeSide?: 'player' | 'ai';
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  selectedCardUid,
  onSelectCard,
  onCardAction,
  ownerName = 'DUELIST',
  isLocal2P = false,
  activeSide = 'player',
}) => {
  const [isCurtainHidden, setIsCurtainHidden] = useState(false);
  const total = hand.length;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center justify-end px-10 pb-2">
      {/* Hand Banner for Local 2P */}
      {isLocal2P && (
        <div className="flex items-center gap-2 mb-1 px-3 py-0.5 rounded-full bg-[#0a1826]/90 border border-[#2b516b] text-[10px] font-['Orbitron'] font-bold shadow">
          <span className={`w-2 h-2 rounded-full ${activeSide === 'player' ? 'bg-sky-400' : 'bg-purple-400'} animate-ping`} />
          <span className={activeSide === 'player' ? 'text-sky-300' : 'text-purple-300'}>
            {ownerName}'S HAND ({hand.length})
          </span>
          <button
            onClick={() => {
              sound.playPhase();
              setIsCurtainHidden(!isCurtainHidden);
            }}
            className="ml-2 flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            title="Toggle Privacy Curtain"
          >
            {isCurtainHidden ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
            <span>{isCurtainHidden ? 'SHOW' : 'HIDE'}</span>
          </button>
        </div>
      )}

      {/* Privacy Curtain Overlay if hidden */}
      {isLocal2P && isCurtainHidden ? (
        <div 
          onClick={() => {
            sound.playPhase();
            setIsCurtainHidden(false);
          }}
          className="h-28 w-80 rounded-2xl bg-[#091522]/95 border-2 border-dashed border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-102"
        >
          <Shield className="w-7 h-7 text-purple-400 mb-1 animate-bounce" />
          <span className="font-['Orbitron'] font-black text-xs text-purple-300">
            {ownerName}'S TURN (HAND HIDDEN)
          </span>
          <span className="text-[10px] text-stone-400 mt-0.5 font-medium">
            Click anywhere here to reveal your cards
          </span>
        </div>
      ) : (
        /* Fanned Cards Display */
        <div className="relative flex items-end justify-center h-36">
          {hand.map((card, i) => {
            const isSelected = selectedCardUid === card.uid;
            const mid = (total - 1) / 2;
            const rotDeg = (i - mid) * 3.5;
            const dy = Math.abs(i - mid) ** 1.6 * 2;
            const hasHandSkill = card.hasHandEffect;

            return (
              <div
                key={card.uid}
                onClick={() => {
                  onSelectCard(card);
                  onCardAction(card);
                }}
                style={{
                  transform: isSelected
                    ? `translateY(-35px) scale(1.18) rotate(0deg)`
                    : `translateY(${dy}px) rotate(${rotDeg}deg)`,
                  transformOrigin: '50% 120%',
                  marginLeft: i > 0 ? '-32px' : '0',
                  zIndex: isSelected ? 40 : i + 10,
                }}
                className={`relative cursor-pointer transition-all duration-200 hover:-translate-y-8 hover:scale-115 hover:z-50 ${
                  hasHandSkill
                    ? 'ring-2 ring-amber-400 shadow-[0_0_18px_rgba(250,200,60,0.8)]'
                    : 'hover:ring-2 hover:ring-sky-400'
                }`}
              >
                {/* Hand Effect Glowing Badge */}
                {hasHandSkill && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 px-1.5 py-0.5 rounded-full text-[9px] font-['Orbitron'] font-black shadow-lg animate-pulse whitespace-nowrap">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    <span>EFFECT</span>
                  </div>
                )}

                {/* Card visual frame */}
                <div className="w-[84px] h-[122px] rounded-md overflow-hidden bg-[#18283a] border border-[#d4af37] shadow-xl">
                  <img
                    src={card.art}
                    alt={card.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
