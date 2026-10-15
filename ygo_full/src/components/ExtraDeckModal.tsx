/**
 * ExtraDeckModal - Master Duel Extra Deck Summoning Interface
 * Fusion, Synchro, Xyz, Link summoning procedures with material checks.
 */

import React, { useState } from 'react';
import { CardInstance, PlayerState } from '../types/duel';
import { Layers, X, Sparkles, Zap, Shield } from 'lucide-react';
import { sound } from '../utils/audio';

interface ExtraDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerState;
  onSummonExtraMonster: (extraCard: CardInstance, materialUids: number[]) => void;
  onSelectInspect?: (card: CardInstance) => void;
}

export const ExtraDeckModal: React.FC<ExtraDeckModalProps> = ({
  isOpen,
  onClose,
  player,
  onSummonExtraMonster,
  onSelectInspect,
}) => {
  const [selectedExtraCard, setSelectedExtraCard] = useState<CardInstance | null>(null);
  const [selectedMaterialUids, setSelectedMaterialUids] = useState<number[]>([]);

  if (!isOpen) return null;

  // Available candidate materials from field (and hand if fusion)
  const fieldMonsters = player.monsters.filter((m): m is CardInstance => m !== null && m.faceUp);
  const handMonsters = player.hand.filter((m) => m.type === 'MONSTER');
  const candidateMaterials = selectedExtraCard?.extraKind === 'FUSION' 
    ? [...fieldMonsters, ...handMonsters]
    : fieldMonsters;

  // Check material validity
  const checkCanSummon = (extra: CardInstance, materials: CardInstance[]) => {
    if (extra.extraKind === 'SYNCHRO') {
      const hasTuner = materials.some(m => m.tuner);
      const hasNonTuner = materials.some(m => !m.tuner);
      const totalLevel = materials.reduce((sum, m) => sum + (m.level || 0), 0);
      return materials.length >= 2 && hasTuner && hasNonTuner && totalLevel === extra.level;
    }
    if (extra.extraKind === 'XYZ') {
      return materials.length === 2 && materials.every(m => m.level === 4);
    }
    if (extra.extraKind === 'LINK') {
      return materials.length === 3 && materials.every(m => m.subtype !== 'Normal');
    }
    if (extra.extraKind === 'FUSION') {
      if (extra.name.includes('Blue-Eyes Ultimate Dragon')) {
        return materials.length === 3 && materials.every(m => m.name === 'Blue-Eyes White Dragon');
      }
      if (extra.name.includes('Flame Wingman')) {
        const hasAvian = materials.some(m => m.name.includes('Avian') || m.name.includes('Elemental HERO'));
        const hasBurst = materials.some(m => m.name.includes('Burstinatrix') || m.name.includes('Sparkman'));
        return materials.length === 2 && (hasAvian || hasBurst);
      }
      if (extra.name.includes('Rocket Ride')) {
        return materials.length === 2 && materials.every(m => m.name.startsWith('Prank-Kids'));
      }
      return materials.length >= 2;
    }
    return false;
  };

  const handleToggleMaterial = (uid: number) => {
    setSelectedMaterialUids(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleConfirmSummon = () => {
    if (!selectedExtraCard) return;
    sound.playSpecialSummon();
    onSummonExtraMonster(selectedExtraCard, selectedMaterialUids);
    onClose();
  };

  const chosenMaterials = candidateMaterials.filter(m => selectedMaterialUids.includes(m.uid));
  const canSummon = selectedExtraCard ? checkCanSummon(selectedExtraCard, chosenMaterials) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#091524] border border-amber-500/70 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#203c54] via-[#15344f] to-[#0c1f30] px-6 py-4 border-b border-amber-500/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-400 flex items-center justify-center">
              <Layers className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-xl text-amber-200">
                EXTRA DECK
              </h2>
              <p className="text-xs text-stone-300">
                Choose a Fusion, Synchro, Xyz, or Link Monster to summon to the field.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* 1. Extra Monsters Grid */}
          <div>
            <h3 className="font-['Orbitron'] font-bold text-sm text-sky-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1. CHOOSE EXTRA DECK MONSTER:</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {player.extraDeck.map((card) => {
                const isSelected = selectedExtraCard?.uid === card.uid;
                return (
                  <div
                    key={card.uid}
                    onClick={() => {
                      setSelectedExtraCard(card);
                      setSelectedMaterialUids([]);
                      onSelectInspect?.(card);
                    }}
                    className={`cursor-pointer rounded-xl overflow-hidden border p-2 bg-[#0e2133] transition-all ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_18px_rgba(245,190,50,0.6)] scale-105'
                        : 'border-[#2d5673] hover:border-sky-400 hover:scale-102'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded overflow-hidden bg-black/50 mb-1.5">
                      <img src={card.art} alt={card.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center">
                      <p className="font-['Cinzel'] font-bold text-[11px] text-stone-100 truncate">{card.name}</p>
                      <span className="text-[10px] font-['Orbitron'] font-bold text-amber-300">
                        {card.extraKind}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Materials Selection if an Extra Card is selected */}
          {selectedExtraCard && (
            <div className="bg-[#0b1929] border border-[#2e5d7d] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-['Orbitron'] font-bold text-xs text-amber-300">
                  2. REQUIRED MATERIALS: {selectedExtraCard.materialText}
                </h4>
                <span className="text-xs text-stone-300">
                  Selected: {selectedMaterialUids.length} monster(s)
                </span>
              </div>

              {candidateMaterials.length === 0 ? (
                <p className="text-xs text-rose-400 italic py-3">
                  No eligible monsters on your field or hand to use as material.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {candidateMaterials.map((m) => {
                    const isPicked = selectedMaterialUids.includes(m.uid);
                    return (
                      <button
                        key={m.uid}
                        onClick={() => handleToggleMaterial(m.uid)}
                        className={`p-2 rounded-lg border text-left flex flex-col items-center transition-all ${
                          isPicked
                            ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400 shadow-md scale-105'
                            : 'bg-[#102538] border-[#294e6b] hover:border-sky-400'
                        }`}
                      >
                        <div className="w-14 aspect-[3/4] rounded overflow-hidden mb-1">
                          <img src={m.art} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-[10px] text-stone-200 truncate w-full text-center">
                          {m.name}
                        </span>
                        <span className="text-[9px] text-sky-400">
                          Lv.{m.level || 0} {m.tuner ? '(Tuner)' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Confirm Summon Button */}
              <div className="mt-4 flex justify-end">
                <button
                  disabled={!canSummon}
                  onClick={handleConfirmSummon}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-['Orbitron'] font-black text-xs transition-all ${
                    canSummon
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-[0_0_20px_rgba(240,190,50,0.8)] scale-105 active:scale-95'
                      : 'bg-[#132738] text-stone-500 border border-[#27485e] cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>CONFIRM {selectedExtraCard.extraKind} SUMMON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
