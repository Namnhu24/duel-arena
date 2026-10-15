/**
 * CardActionDialog - Quick Master Duel Context Action Modal
 * Shows available moves for clicked cards (Summon, Set, Activate Skill, Hand Effect).
 */

import React from 'react';
import { CardInstance } from '../types/duel';
import { Swords, Shield, Zap, Sparkles, X, ArrowUpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

export interface CardActionItem {
  label: string;
  desc?: string;
  icon?: React.ReactNode;
  tone?: 'primary' | 'danger' | 'purple' | 'default';
  run: () => void;
}

interface CardActionDialogProps {
  card: CardInstance | null;
  actions: CardActionItem[];
  onClose: () => void;
}

export const CardActionDialog: React.FC<CardActionDialogProps> = ({
  card,
  actions,
  onClose,
}) => {
  if (!card || actions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#091524] border border-[#3b7294] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0c1f2e] px-4 py-3 border-b border-[#3b7294] flex items-center justify-between">
          <div className="truncate pr-2">
            <h3 className="font-['Cinzel'] font-bold text-sm text-amber-200 truncate">{card.name}</h3>
            <p className="text-[10px] text-sky-300 font-semibold uppercase">{card.subtype || card.type}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons List */}
        <div className="p-4 flex flex-col gap-2">
          {actions.map((act, idx) => {
            let toneStyles = 'bg-[#102538] hover:bg-[#16354f] border-[#2d5673] text-stone-100';
            if (act.tone === 'primary') {
              toneStyles = 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold border-amber-400 shadow-md';
            } else if (act.tone === 'purple') {
              toneStyles = 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold border-purple-400 shadow-md animate-pulse';
            } else if (act.tone === 'danger') {
              toneStyles = 'bg-rose-950/80 hover:bg-rose-900 border-rose-600 text-rose-200';
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  sound.playPhase();
                  act.run();
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 text-left ${toneStyles}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center">
                  {act.icon || <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-['Orbitron'] font-bold">{act.label}</div>
                  {act.desc && <div className="text-[10px] text-stone-300 mt-0.5">{act.desc}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
