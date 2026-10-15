/**
 * CpuSelectModal - Choose legendary AI Duelist & difficulty
 */

import React, { useState } from 'react';
import { CPU_OPPONENTS, CpuOpponent } from '../data/cpuDecks';
import { X, Swords, Sparkles, Shield, Zap, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface CpuSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCpu: (opponent: CpuOpponent, isPractice: boolean) => void;
}

export const CpuSelectModal: React.FC<CpuSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCpu,
}) => {
  const [selectedId, setSelectedId] = useState<string>(CPU_OPPONENTS[0].id);
  const [isPractice, setIsPractice] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOpponent = CPU_OPPONENTS.find(c => c.id === selectedId) || CPU_OPPONENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#081524] border border-[#2b587a] shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c3952]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-stone-950 font-black shadow-[0_0_15px_rgba(245,190,50,0.5)]">
              <Swords className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-2xl text-white tracking-wide">
                MODE 1: SOLO DUEL <span className="text-amber-400">(VS AI)</span>
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Select your AI opponent and test your deck in authentic 3D Master Duel combat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#122438] hover:bg-[#1a334e] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Iconic CPU Rivals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          {CPU_OPPONENTS.map((opp) => {
            const isSelected = opp.id === selectedId;
            return (
              <button
                key={opp.id}
                onClick={() => {
                  sound.playPhase();
                  setSelectedId(opp.id);
                }}
                className={`group relative p-3 rounded-2xl border text-left transition-all flex flex-col items-center text-center ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 via-[#0e243a] to-[#0a1828] shadow-[0_0_20px_rgba(245,190,50,0.4)] scale-102'
                    : 'border-[#1b354d] bg-[#0a1826]/70 hover:border-sky-400 hover:bg-[#0e2133]'
                }`}
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2 border border-[#2b516b] shadow-inner group-hover:scale-105 transition-transform">
                  <img
                    src={opp.avatar}
                    alt={opp.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="font-['Orbitron'] font-black text-xs text-stone-100 group-hover:text-amber-300 truncate w-full">
                  {opp.name}
                </span>
                <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                  {opp.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Opponent Profile Preview */}
        <div className="p-4 rounded-2xl bg-[#06101c] border border-[#1b354d] flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <img
            src={currentOpponent.avatar}
            alt={currentOpponent.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400/80 shadow-lg flex-shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-['Cinzel'] font-black text-lg text-amber-300">
                {currentOpponent.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/50 text-[10px] text-amber-300 font-bold font-['Orbitron']">
                {currentOpponent.title}
              </span>
            </div>
            <p className="text-xs text-stone-300 italic mb-2">
              "{currentOpponent.dialog}"
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-stone-400 font-medium">
              <div>
                <span className="text-stone-500">Signature Card: </span>
                <span className="text-sky-300 font-semibold">{currentOpponent.signatureCard}</span>
              </div>
              <div>
                <span className="text-stone-500">Deck: </span>
                <span className="text-emerald-300 font-semibold">{currentOpponent.deck.main.length} Main + {currentOpponent.deck.extra.length} Extra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Sandbox Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#091b2c] border border-[#1b3e5a] mb-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <span className="block text-xs font-['Orbitron'] font-bold text-stone-200">
                PRACTICE / COMBO TRIAL MODE
              </span>
              <span className="text-[10px] text-stone-400">
                Test hands, combos and summon mechanics with unlimited LP recovery
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsPractice(!isPractice)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
              isPractice ? 'bg-amber-500' : 'bg-stone-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                isPractice ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sound.playSpecialSummon();
            onSelectCpu(currentOpponent, isPractice);
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-['Orbitron'] font-black text-sm tracking-wider shadow-[0_0_25px_rgba(245,190,50,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5 fill-current" />
          <span>START DUEL VS {currentOpponent.name.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
};
