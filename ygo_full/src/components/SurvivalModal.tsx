/**
 * SurvivalModal - Mode 4: Survival Gauntlet (Duel Tower / 5 Boss Stages)
 */

import React from 'react';
import { SURVIVAL_STAGES } from '../data/cpuDecks';
import { X, Trophy, Skull, Flame, Heart, Shield, PlayCircle, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface SurvivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSurvival: () => void;
}

export const SurvivalModal: React.FC<SurvivalModalProps> = ({
  isOpen,
  onClose,
  onStartSurvival,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#081524] border border-[#2b587a] shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c3952]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 flex items-center justify-center text-stone-950 font-black shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-2xl text-white tracking-wide">
                MODE 4: SURVIVAL GAUNTLET <span className="text-orange-400">(DUEL TOWER)</span>
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Test your endurance against 5 consecutive opponents with carrying-over Life Points!
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

        {/* Rules Highlight Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          <div className="p-3 rounded-2xl bg-[#0a1b2d] border border-orange-500/30 flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="block font-['Orbitron'] font-black text-xs text-stone-200">LP CARRIES OVER</span>
              <span className="text-[10px] text-stone-400 leading-tight block">Your LP stays from stage to stage</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0a1b2d] border border-emerald-500/30 flex items-center gap-3">
            <Award className="w-7 h-7 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="block font-['Orbitron'] font-black text-xs text-stone-200">STAGE RECOVERY</span>
              <span className="text-[10px] text-stone-400 leading-tight block">+2,000 LP heal per stage victory</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0a1b2d] border border-amber-500/30 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400 flex-shrink-0" />
            <div>
              <span className="block font-['Orbitron'] font-black text-xs text-stone-200">5-BOSS SUMMIT</span>
              <span className="text-[10px] text-stone-400 leading-tight block">Defeat Shadow Pharaoh for the title</span>
            </div>
          </div>
        </div>

        {/* Tower Stages Roadmap */}
        <div className="flex flex-col gap-2.5 my-2">
          {SURVIVAL_STAGES.map((stg) => (
            <div
              key={stg.stageNumber}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                stg.stageNumber === 5
                  ? 'border-rose-500/60 bg-gradient-to-r from-rose-950/40 via-[#190d1e] to-[#0c1824]'
                  : 'border-[#1b354d] bg-[#091826]/70'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-['Orbitron'] font-black text-xs border ${
                  stg.stageNumber === 5
                    ? 'bg-rose-500 text-stone-950 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'bg-[#12283d] text-amber-300 border-[#2b516b]'
                }`}>
                  F{stg.stageNumber}
                </div>
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#2b516b]">
                  <img src={stg.avatar} alt={stg.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Cinzel'] font-black text-sm text-stone-100">
                      {stg.name}
                    </span>
                    {stg.stageNumber === 5 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-900/80 border border-rose-500 text-[9px] font-bold text-rose-300 font-['Orbitron']">
                        FINAL BOSS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 block font-sans">
                    {stg.title}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="block font-['Orbitron'] font-black text-xs text-amber-300">
                  {stg.startingLp} LP
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold font-['Orbitron']">
                  +{stg.rewardLp} LP reward
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sound.playSpecialSummon();
            onStartSurvival();
          }}
          className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-stone-950 font-['Orbitron'] font-black text-sm tracking-wider shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
        >
          <Flame className="w-5 h-5 fill-current" />
          <span>ENTER THE DUEL TOWER (STAGE 1)</span>
        </button>
      </div>
    </div>
  );
};
