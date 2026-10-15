/**
 * TributeModal - Official Yu-Gi-Oh! Tribute Selection Dialog
 * Enforces official tribute rules:
 * - Level 5-6: 1 Tribute
 * - Level 7-8: 2 Tributes
 * - Level 9+: 3 Tributes
 */

import React, { useState } from 'react';
import { CardInstance } from '../types/duel';
import { Shield, Skull, X, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface TributeModalProps {
  cardToSummon: CardInstance | null;
  mode: 'SUMMON' | 'SET';
  availableMonsters: CardInstance[];
  requiredCount: number;
  onConfirm: (tributeUids: number[]) => void;
  onCancel: () => void;
}

export const TributeModal: React.FC<TributeModalProps> = ({
  cardToSummon,
  mode,
  availableMonsters,
  requiredCount,
  onConfirm,
  onCancel,
}) => {
  const [selectedUids, setSelectedUids] = useState<number[]>([]);

  if (!cardToSummon) return null;

  const toggleMonster = (uid: number) => {
    setSelectedUids(prev => {
      if (prev.includes(uid)) {
        return prev.filter(id => id !== uid);
      }
      if (prev.length < requiredCount) {
        return [...prev, uid];
      }
      return prev;
    });
  };

  const isComplete = selectedUids.length === requiredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0a1626] border border-amber-500/70 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0d2233] px-6 py-4 border-b border-amber-500/60 flex items-center justify-between">
          <div>
            <h2 className="font-['Cinzel'] font-black text-lg text-amber-200">
              TRIBUTE {mode === 'SUMMON' ? 'SUMMON' : 'SET'}: {cardToSummon.name}
            </h2>
            <p className="text-xs text-stone-300">
              Level {cardToSummon.level} requires exactly {requiredCount} Tribute{requiredCount > 1 ? 's' : ''}. Selected ({selectedUids.length}/{requiredCount}).
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Monster Selection List */}
        <div className="p-6">
          <h4 className="font-['Orbitron'] text-xs font-bold text-sky-400 mb-3 uppercase tracking-wider">
            Select {requiredCount} monster(s) on your field to Tribute:
          </h4>

          {availableMonsters.length < requiredCount ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/70 text-rose-300 text-xs">
              Not enough monsters on your field to Tribute. (Requires {requiredCount}, you have {availableMonsters.length}).
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableMonsters.map(m => {
                const isSelected = selectedUids.includes(m.uid);
                return (
                  <div
                    key={m.uid}
                    onClick={() => toggleMonster(m.uid)}
                    className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center transition-all ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105'
                        : 'bg-[#102538] border-[#294e6b] hover:border-sky-400'
                    }`}
                  >
                    <div className="relative aspect-[3/4] w-16 rounded overflow-hidden mb-1.5 bg-black/40">
                      <img
                        src={m.art}
                        alt={m.name}
                        className={`w-full h-full object-cover ${!m.faceUp ? 'brightness-50' : ''}`}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                          <Skull className="w-6 h-6 text-rose-300" />
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-[10px] text-stone-200 truncate w-full text-center">
                      {m.faceUp ? m.name : 'Face-down Monster'}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {m.faceUp ? `ATK ${m.atk} · Lv.${m.level}` : 'Defense Position'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#071320] px-6 py-3.5 border-t border-[#2d5673] flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[#102436] hover:bg-[#16354f] text-stone-300 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            disabled={!isComplete}
            onClick={() => {
              sound.playSummon();
              onConfirm(selectedUids);
            }}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-['Orbitron'] font-black text-xs transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-[0_0_20px_rgba(245,190,50,0.7)] active:scale-95'
                : 'bg-[#152a3b] text-stone-500 cursor-not-allowed border border-[#23455e]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 fill-current" />
            <span>CONFIRM TRIBUTES</span>
          </button>
        </div>
      </div>
    </div>
  );
};
