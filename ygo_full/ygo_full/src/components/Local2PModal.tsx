/**
 * Local2PModal - Mode 3: Local 2-Player (Pass & Play on 1 Device)
 */

import React, { useState } from 'react';
import { CPU_OPPONENTS } from '../data/cpuDecks';
import { DeckConfig, loadStoredDeck } from './DeckBuilder';
import { X, Users, Swords, Eye, EyeOff, ShieldCheck, PlayCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface Local2PModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLocalDuel: (p1Name: string, p2Name: string, p1Deck: DeckConfig, p2Deck: DeckConfig, usePrivacyCurtain: boolean) => void;
  defaultP1Name: string;
}

export const Local2PModal: React.FC<Local2PModalProps> = ({
  isOpen,
  onClose,
  onStartLocalDuel,
  defaultP1Name,
}) => {
  const [p1Name, setP1Name] = useState(defaultP1Name || 'Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [p1DeckPreset, setP1DeckPreset] = useState<'custom' | 'kaiba' | 'yugi' | 'jaden'>('custom');
  const [p2DeckPreset, setP2DeckPreset] = useState<'custom' | 'kaiba' | 'yugi' | 'jaden'>('kaiba');
  const [usePrivacyCurtain, setUsePrivacyCurtain] = useState(true);

  if (!isOpen) return null;

  const getDeckFromPreset = (preset: 'custom' | 'kaiba' | 'yugi' | 'jaden'): DeckConfig => {
    if (preset === 'custom') return loadStoredDeck();
    const opp = CPU_OPPONENTS.find(o => o.id === preset);
    return opp ? opp.deck : loadStoredDeck();
  };

  const handleStart = () => {
    sound.playSpecialSummon();
    const deck1 = getDeckFromPreset(p1DeckPreset);
    const deck2 = getDeckFromPreset(p2DeckPreset);
    onStartLocalDuel(p1Name.trim() || 'Player 1', p2Name.trim() || 'Player 2', deck1, deck2, usePrivacyCurtain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#081524] border border-[#2b587a] shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c3952]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Users className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-2xl text-white tracking-wide">
                MODE 3: LOCAL 2-PLAYER <span className="text-purple-400">(PASS & PLAY)</span>
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Duel face-to-face with a friend on this exact same device with alternating turns.
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

        {/* 2 Players Setup Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Player 1 (Bottom Field) */}
          <div className="p-4 rounded-2xl bg-[#0a1b2d] border border-sky-500/40 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sky-300 font-['Orbitron'] font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>DUELIST 1 (BOTTOM FIELD)</span>
            </div>
            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Duelist Name</label>
              <input
                type="text"
                value={p1Name}
                onChange={e => setP1Name(e.target.value)}
                maxLength={18}
                className="w-full px-3 py-2 rounded-xl bg-[#05101a] border border-[#2b516b] text-white text-xs font-semibold focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Deck Selection</label>
              <select
                value={p1DeckPreset}
                onChange={e => setP1DeckPreset(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#05101a] border border-[#2b516b] text-stone-200 text-xs font-semibold focus:outline-none focus:border-sky-400"
              >
                <option value="custom">My Custom Deck (from Deck Builder)</option>
                <option value="kaiba">Kaiba Preset (Blue-Eyes Beatdown)</option>
                <option value="yugi">Yugi Preset (Dark Magician & Spells)</option>
                <option value="jaden">Jaden Preset (HERO Fusions)</option>
              </select>
            </div>
          </div>

          {/* Player 2 (Top Field) */}
          <div className="p-4 rounded-2xl bg-[#0a1b2d] border border-purple-500/40 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-300 font-['Orbitron'] font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>DUELIST 2 (TOP FIELD)</span>
            </div>
            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Duelist Name</label>
              <input
                type="text"
                value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                maxLength={18}
                className="w-full px-3 py-2 rounded-xl bg-[#05101a] border border-[#2b516b] text-white text-xs font-semibold focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Deck Selection</label>
              <select
                value={p2DeckPreset}
                onChange={e => setP2DeckPreset(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#05101a] border border-[#2b516b] text-stone-200 text-xs font-semibold focus:outline-none focus:border-purple-400"
              >
                <option value="kaiba">Kaiba Preset (Blue-Eyes Beatdown)</option>
                <option value="yugi">Yugi Preset (Dark Magician & Spells)</option>
                <option value="jaden">Jaden Preset (HERO Fusions)</option>
                <option value="custom">Custom Deck Slot</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Curtain Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#071320] border border-[#1d3d57] mb-6">
          <div className="flex items-center gap-3">
            {usePrivacyCurtain ? (
              <EyeOff className="w-5 h-5 text-purple-400" />
            ) : (
              <Eye className="w-5 h-5 text-stone-400" />
            )}
            <div>
              <span className="block text-xs font-['Orbitron'] font-bold text-stone-200">
                TURN PRIVACY CURTAIN (RECOMMENDED)
              </span>
              <span className="text-[10px] text-stone-400">
                Hides hand cards during turn change so your opponent cannot peek at your secret traps & hand effects
              </span>
            </div>
          </div>
          <button
            onClick={() => setUsePrivacyCurtain(!usePrivacyCurtain)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
              usePrivacyCurtain ? 'bg-purple-600' : 'bg-stone-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                usePrivacyCurtain ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-['Orbitron'] font-black text-sm tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
        >
          <PlayCircle className="w-5 h-5 fill-current" />
          <span>START 2-PLAYER LOCAL DUEL</span>
        </button>
      </div>
    </div>
  );
};
