/**
 * GraveyardModal - Master Duel Graveyard Browser & Effect Trigger
 * Lets player inspect Graveyard cards and activate GY skills directly.
 */

import React from 'react';
import { CardInstance } from '../types/duel';
import { Skull, X, Sparkles, Zap, Flame, Shield } from 'lucide-react';
import { sound } from '../utils/audio';

interface GraveyardModalProps {
  isOpen: boolean;
  onClose: () => void;
  graveyard: CardInstance[];
  ownerName: string;
  isPlayerGy: boolean;
  onActivateGyEffect?: (card: CardInstance) => void;
  onSelectInspect?: (card: CardInstance) => void;
}

export const GraveyardModal: React.FC<GraveyardModalProps> = ({
  isOpen,
  onClose,
  graveyard,
  ownerName,
  isPlayerGy,
  onActivateGyEffect,
  onSelectInspect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#091524] border border-[#3b7294] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0d2438] px-6 py-4 border-b border-[#3b7294] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/60 flex items-center justify-center">
              <Skull className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-lg text-amber-200">
                GRAVEYARD - {ownerName}
              </h2>
              <p className="text-xs text-stone-300">
                Total {graveyard.length} card(s) in Graveyard. Click a card to inspect or activate its effect.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {graveyard.length === 0 ? (
            <div className="col-span-full py-16 text-center text-stone-400">
              <Skull className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="font-['Cinzel'] text-base">Graveyard is currently empty.</p>
            </div>
          ) : (
            graveyard.map((card) => {
              const hasGySkill = card.hasGyEffect && isPlayerGy;

              return (
                <div
                  key={card.uid}
                  className={`group relative flex flex-col bg-[#0f2236] border rounded-xl overflow-hidden p-2 transition-all hover:scale-105 ${
                    hasGySkill
                      ? 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] ring-1 ring-purple-400'
                      : 'border-[#2d5673] hover:border-sky-400'
                  }`}
                >
                  {/* Art */}
                  <div
                    onClick={() => onSelectInspect?.(card)}
                    className="relative aspect-[3/4] rounded overflow-hidden bg-black/40 cursor-pointer mb-2"
                  >
                    <img
                      src={card.art}
                      alt={card.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {hasGySkill && (
                      <div className="absolute top-1 right-1 bg-purple-600/90 text-purple-100 text-[10px] font-['Orbitron'] font-black px-1.5 py-0.5 rounded shadow">
                        GY EFFECT
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-['Cinzel'] font-bold text-xs text-stone-200 truncate" title={card.name}>
                        {card.name}
                      </h4>
                      <p className="text-[10px] text-sky-400 font-semibold">{card.subtype || card.type}</p>
                    </div>

                    {/* GY Activate Button if available */}
                    {hasGySkill && onActivateGyEffect && (
                      <button
                        onClick={() => {
                          sound.playEffectChime();
                          onActivateGyEffect(card);
                          onClose();
                        }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-['Orbitron'] font-black text-[10px] rounded-lg shadow-md transition-all active:scale-95 animate-pulse"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>ACTIVATE IN GY</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
