/**
 * CardWikiModal - Card Encyclopedia & Strategy Wiki Portal (Mode 3)
 */

import React, { useState } from 'react';
import { CardDefinition } from '../types/duel';
import { CARD_DATABASE } from '../data/cardDatabase';
import { Search, BookOpen, Star, Sparkles, X, Sun, Moon, Flame, Droplets, Wind, Globe, Zap, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface CardWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardWikiModal: React.FC<CardWikiModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('ALL');
  const [inspectedCard, setInspectedCard] = useState<CardDefinition>(CARD_DATABASE[0]);

  if (!isOpen) return null;

  const filtered = CARD_DATABASE.filter(c => {
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.text.toLowerCase().includes(search.toLowerCase()) ||
      (c.race && c.race.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedAttribute !== 'ALL' && c.attribute !== selectedAttribute) {
      return false;
    }

    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'HAND_TRAP') return c.hasHandEffect;
    if (selectedCategory === 'GY_EFFECT') return c.hasGyEffect;
    if (selectedCategory === 'FIELD_SPELL') return c.subtype === 'Field Spell';
    if (selectedCategory === 'FUSION') return c.subtype === 'Fusion';
    if (selectedCategory === 'SYNCHRO') return c.subtype === 'Synchro';
    if (selectedCategory === 'XYZ') return c.subtype === 'Xyz';
    if (selectedCategory === 'LINK') return c.subtype === 'Link';
    if (selectedCategory === 'SPELL') return c.type === 'SPELL';
    if (selectedCategory === 'TRAP') return c.type === 'TRAP';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#091524] border border-[#3b7294] rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0c1f2e] px-6 py-4 border-b border-[#3b7294] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-xl text-amber-200">
                CARD ENCYCLOPEDIA & WIKI
              </h2>
              <span className="text-[10px] text-stone-300 font-semibold">
                Official card lore, rulings, combos, and strategy breakdowns.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPhase();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-[#06101c] border-b border-[#244b66] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-shrink-0">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by card name, effect, or race..."
              className="w-full bg-[#091829] border border-[#2d5673] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Cards' },
              { id: 'HAND_TRAP', label: 'Hand Traps' },
              { id: 'GY_EFFECT', label: 'GY Effects' },
              { id: 'FIELD_SPELL', label: 'Field Spells' },
              { id: 'FUSION', label: 'Fusion' },
              { id: 'SYNCHRO', label: 'Synchro' },
              { id: 'XYZ', label: 'Xyz' },
              { id: 'LINK', label: 'Link' },
              { id: 'SPELL', label: 'Spells' },
              { id: 'TRAP', label: 'Traps' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-['Orbitron'] font-bold whitespace-nowrap transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                    : 'bg-[#0e2133] text-stone-300 hover:text-white border border-[#234b6b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content: Card Grid (Left) + Detail & Strategy Breakdown (Right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Cards Grid (7 cols) */}
          <div className="md:col-span-7 p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 border-r border-[#244b66]/60 min-h-0 scrollbar-thin scrollbar-thumb-sky-700/50">
            {filtered.map(card => {
              const isSelected = inspectedCard.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    sound.playPhase();
                    setInspectedCard(card);
                  }}
                  className={`cursor-pointer rounded-xl border p-2 flex flex-col justify-between bg-[#0e2133] transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,190,50,0.6)]'
                      : 'border-[#254b6b] hover:border-sky-400'
                  }`}
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/40 mb-1.5">
                    <img src={card.art} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-['Cinzel'] font-bold text-[11px] text-stone-100 truncate" title={card.name}>
                      {card.name}
                    </h5>
                    <span className="text-[9px] font-['Orbitron'] text-sky-400 font-bold block truncate">
                      {card.subtype || card.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Card Deep Breakdown & Lore (5 cols) */}
          <div className="md:col-span-5 p-6 overflow-y-auto bg-[#071320] flex flex-col gap-4 min-h-0 scrollbar-thin scrollbar-thumb-sky-700/50">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-['Orbitron'] font-black text-amber-400 uppercase tracking-widest">
                  PASSCODE: #{inspectedCard.id}
                </span>
                {inspectedCard.attribute && (
                  <span className="text-[10px] font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40">
                    {inspectedCard.attribute}
                  </span>
                )}
              </div>
              <h3 className="font-['Cinzel'] font-black text-xl text-white mt-1">
                {inspectedCard.name}
              </h3>
              <span className="text-xs text-sky-400 font-semibold">
                [{inspectedCard.race || 'Card'} / {inspectedCard.subtype || inspectedCard.type}]
              </span>
            </div>

            {/* Artwork Preview */}
            <div className="w-48 aspect-[3/4] mx-auto rounded-xl overflow-hidden border-2 border-amber-500/70 shadow-2xl bg-black/50">
              <img src={inspectedCard.art} alt={inspectedCard.name} className="w-full h-full object-contain" />
            </div>

            {/* Combat Stats */}
            {inspectedCard.type === 'MONSTER' && (
              <div className="grid grid-cols-3 gap-2 bg-[#0e2133] p-2.5 rounded-xl border border-[#274f6e] text-center font-['Orbitron']">
                <div>
                  <span className="text-[9px] text-stone-400 block">LEVEL / RANK</span>
                  <span className="text-sm font-black text-amber-300">⭐ {inspectedCard.level || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-rose-400 block">ATTACK</span>
                  <span className="text-sm font-black text-rose-300">{inspectedCard.atk ?? '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-sky-400 block">DEFENSE</span>
                  <span className="text-sm font-black text-sky-300">{inspectedCard.def ?? '-'}</span>
                </div>
              </div>
            )}

            {/* Effect Description */}
            <div className="p-3.5 bg-[#0a1829] rounded-xl border border-[#254b6b]">
              <span className="text-[10px] font-['Orbitron'] font-bold text-amber-400 uppercase block mb-1">
                Official Card Text:
              </span>
              <p className="text-xs text-stone-200 leading-relaxed whitespace-pre-line">
                {inspectedCard.text}
              </p>
            </div>

            {/* Strategy & Synergy Tips */}
            <div className="p-3.5 bg-[#0c2438] rounded-xl border border-sky-500/40">
              <span className="text-[10px] font-['Orbitron'] font-bold text-sky-300 uppercase block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Strategy & Combo Synergy:</span>
              </span>
              <p className="text-xs text-stone-300 leading-relaxed">
                {inspectedCard.hasHandEffect && (
                  '• Hand Trap: Can be activated directly from hand during key combat or summoning timings to disrupt opponent chains.\n'
                )}
                {inspectedCard.hasGyEffect && (
                  '• GY Skill: When this card enters the Graveyard, trigger its skill to revive allies, gain LP, or draw cards.\n'
                )}
                {inspectedCard.hasFieldEffect && (
                  '• Field Spell: Provides global continuous field buffs and transforms the 3D stadium atmosphere with custom elemental storms.\n'
                )}
                {inspectedCard.extraKind && (
                  `• Extra Deck Monster: Summons using dedicated ${inspectedCard.extraKind} summoning mechanics. Ensure proper field materials before attempting summon.`
                )}
                {!inspectedCard.hasHandEffect && !inspectedCard.hasGyEffect && !inspectedCard.hasFieldEffect && !inspectedCard.extraKind && (
                  '• High base combat statistics make this card an essential pillar of beatdown and control board states.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
