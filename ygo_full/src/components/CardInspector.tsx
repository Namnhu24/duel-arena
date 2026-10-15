/**
 * CardInspector - Master Duel Left Card Detail Panel
 * Matches the in-game Master Duel card info display as seen on the left of image.png.
 */

import React from 'react';
import { CardInstance } from '../types/duel';
import { Shield, Sparkles, Zap, Flame, Droplets, Sun, Moon, Wind, Globe } from 'lucide-react';

interface CardInspectorProps {
  card: CardInstance | null;
  onActivateEffect?: (card: CardInstance) => void;
  onActivateHandEffect?: (card: CardInstance) => void;
  onActivateGyEffect?: (card: CardInstance) => void;
  location?: 'field' | 'hand' | 'graveyard' | 'extra';
}

export const CardInspector: React.FC<CardInspectorProps> = ({
  card,
  onActivateEffect,
  onActivateHandEffect,
  onActivateGyEffect,
  location = 'field',
}) => {
  if (!card) {
    return (
      <div className="w-[280px] bg-[#0c1826]/90 backdrop-blur-md border border-[#2b516b]/60 rounded-xl p-4 flex flex-col items-center justify-center text-center text-stone-400 min-h-[380px] shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
        <Sparkles className="w-10 h-10 text-amber-400/40 mb-3 animate-pulse" />
        <p className="font-['Cinzel'] font-bold text-stone-300">CARD DETAILS</p>
        <p className="text-xs text-stone-500 mt-1">Hover over or click any card on the field, hand, or GY to inspect.</p>
      </div>
    );
  }

  const isMonster = card.type === 'MONSTER';
  const attributeIcon = (attr?: string) => {
    switch (attr) {
      case 'LIGHT': return <Sun className="w-4 h-4 text-amber-300" />;
      case 'DARK': return <Moon className="w-4 h-4 text-purple-400" />;
      case 'FIRE': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'WATER': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'WIND': return <Wind className="w-4 h-4 text-emerald-400" />;
      default: return <Globe className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="w-[300px] bg-[#0a1524]/95 backdrop-blur-lg border border-[#3b7294]/70 rounded-xl overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.6)] text-white">
      {/* Header bar with card name & attribute */}
      <div className="bg-gradient-to-r from-[#173852] to-[#0d2233] px-3.5 py-2.5 border-b border-[#3b7294]/60 flex items-center justify-between">
        <div className="truncate pr-2">
          <h3 className="font-['Cinzel'] font-bold text-sm text-amber-200 truncate" title={card.name}>
            {card.name}
          </h3>
          <span className="text-[10px] text-sky-300 font-semibold tracking-wider uppercase">
            {card.subtype || card.type}
          </span>
        </div>
        {card.attribute && (
          <div className="flex items-center gap-1 bg-[#06121e] px-2 py-0.5 rounded-full border border-amber-400/40 text-xs font-bold text-amber-300">
            {attributeIcon(card.attribute)}
            <span className="text-[10px] font-['Orbitron']">{card.attribute}</span>
          </div>
        )}
      </div>

      {/* Card Artwork */}
      <div className="relative w-full aspect-[4/3] bg-black/60 overflow-hidden flex items-center justify-center p-2">
        <img
          src={card.art}
          alt={card.name}
          className="h-full object-contain rounded shadow-md transition-transform duration-300 hover:scale-105"
        />
        {card.level && (
          <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded border border-amber-400 text-amber-300 text-xs font-['Orbitron'] font-bold flex items-center gap-1">
            <span>⭐</span>
            <span>{card.level}</span>
          </div>
        )}
      </div>

      {/* Stats row if Monster */}
      {isMonster && (
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#0e2133] border-y border-[#2a5573]/60 text-xs font-['Orbitron']">
          <div className="flex items-center justify-between bg-[#07131f] px-2.5 py-1.5 rounded border border-rose-500/40">
            <span className="text-rose-400 font-bold">ATK</span>
            <span className="text-white font-extrabold text-sm">{card.atk ?? 0}</span>
          </div>
          <div className="flex items-center justify-between bg-[#07131f] px-2.5 py-1.5 rounded border border-sky-500/40">
            <span className="text-sky-400 font-bold">DEF</span>
            <span className="text-white font-extrabold text-sm">{card.def ?? 0}</span>
          </div>
        </div>
      )}

      {/* Type badge / Race */}
      <div className="px-3.5 py-1.5 bg-[#091826] text-[11px] font-semibold text-amber-300/90 border-b border-[#23455e]">
        [{card.race || 'Card'} / {card.subtype || card.type}]
      </div>

      {/* Effect Text */}
      <div className="p-3 text-xs text-stone-200 leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-sky-600/50 bg-[#08121e]">
        <p className="whitespace-pre-line">{card.text || 'No effect text.'}</p>
      </div>

      {/* Action Buttons if special skills are available */}
      <div className="p-2.5 bg-[#0b1c2b] border-t border-[#2d5673] flex flex-col gap-1.5">
        {card.hasHandEffect && onActivateHandEffect && (
          <button
            onClick={() => onActivateHandEffect(card)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>ACTIVATE HAND EFFECT</span>
          </button>
        )}

        {card.hasGyEffect && onActivateGyEffect && (
          <button
            onClick={() => onActivateGyEffect(card)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>ACTIVATE GY EFFECT</span>
          </button>
        )}

        {card.activateEffect && onActivateEffect && location === 'field' && (
          <button
            onClick={() => onActivateEffect(card)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>ACTIVATE MONSTER EFFECT</span>
          </button>
        )}
      </div>
    </div>
  );
};
