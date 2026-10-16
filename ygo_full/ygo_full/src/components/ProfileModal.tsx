/**
 * ProfileModal - User Profile, Career Stats & Multiple Deck Slots (Mode 2)
 */

import React, { useState, useEffect } from 'react';
import { User, Award, Layers, Download, Upload, Save, Check, X, Shield, Star, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

const PROFILE_STORAGE_KEY = 'duelArenaUserProfileV1';
const DECK_SLOTS_KEY = 'duelArenaMultiDeckSlotsV1';

export interface UserProfile {
  name: string;
  title: string;
  avatar: string;
  totalDuels: number;
  wins: number;
  losses: number;
  winStreak: number;
}

export interface DeckSlot {
  id: string;
  name: string;
  main: string[];
  extra: string[];
}

export const loadStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    name: 'Yugi Muto',
    title: 'Duel King',
    avatar: 'yugi',
    totalDuels: 14,
    wins: 12,
    losses: 2,
    winStreak: 5,
  };
};

export const saveStoredProfile = (prof: UserProfile) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(prof));
  } catch (_) {}
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeckSlot: (slot: DeckSlot) => void;
  currentDeck: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSelectDeckSlot,
  currentDeck,
}) => {
  const [profile, setProfile] = useState<UserProfile>(loadStoredProfile);
  const [nameInput, setNameInput] = useState(profile.name);
  const [titleInput, setTitleInput] = useState(profile.title);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // 5 Deck Slots
  const [slots, setSlots] = useState<DeckSlot[]>(() => {
    try {
      const raw = localStorage.getItem(DECK_SLOTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [
      { id: 'slot-1', name: 'Blue-Eyes Dragon Beatdown', main: currentDeck.main, extra: currentDeck.extra },
      { id: 'slot-2', name: 'Dark Magician Spellcaster Control', main: currentDeck.main, extra: currentDeck.extra },
      { id: 'slot-3', name: 'Prank-Kids Elemental Chaos', main: currentDeck.main, extra: currentDeck.extra },
      { id: 'slot-4', name: 'Extra Deck Toolbox (Xyz/Synchro)', main: currentDeck.main, extra: currentDeck.extra },
      { id: 'slot-5', name: 'Championship Tournament Deck', main: currentDeck.main, extra: currentDeck.extra },
    ];
  });

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    sound.playPhase();
    const updated = {
      ...profile,
      name: nameInput.trim() || 'Duelist',
      title: titleInput,
    };
    setProfile(updated);
    saveStoredProfile(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleSaveCurrentDeckToSlot = (slotId: string) => {
    sound.playPhase();
    const updated = slots.map(s => {
      if (s.id === slotId) {
        return { ...s, main: currentDeck.main, extra: currentDeck.extra };
      }
      return s;
    });
    setSlots(updated);
    localStorage.setItem(DECK_SLOTS_KEY, JSON.stringify(updated));
  };

  const handleLoadSlot = (slot: DeckSlot) => {
    sound.playSpecialSummon();
    onSelectDeckSlot(slot);
    onClose();
  };

  const winRate = profile.totalDuels > 0 
    ? Math.round((profile.wins / profile.totalDuels) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#091524] border border-[#3b7294] rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0c1f2e] px-6 py-4 border-b border-[#3b7294] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-lg text-amber-200">
                DUELIST PROFILE & CLOUD DECKS
              </h2>
              <span className="text-[10px] text-stone-300 font-semibold">
                Manage your credentials, ranking, and saved deck configurations.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* 1. Profile & Career Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0a1829] border border-[#234b6b] p-4 rounded-2xl">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-['Orbitron'] font-bold text-sky-400 uppercase">Duelist Name:</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="bg-[#050e18] border border-[#2b5473] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              />

              <label className="text-[10px] font-['Orbitron'] font-bold text-sky-400 uppercase mt-1">Title:</label>
              <select
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                className="bg-[#050e18] border border-[#2b5473] rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-300 focus:outline-none"
              >
                <option value="Duel King">Duel King</option>
                <option value="Slifer Red">Slifer Red</option>
                <option value="Obelisk Blue">Obelisk Blue</option>
                <option value="Ra Yellow">Ra Yellow</option>
                <option value="Supreme King">Supreme King</option>
                <option value="Grandmaster">Grandmaster</option>
              </select>

              <button
                onClick={handleSaveProfile}
                className="mt-2 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                {savedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedFeedback ? 'Saved!' : 'Save Profile'}</span>
              </button>
            </div>

            {/* Career Stats Counters */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-[#0e2136] border border-[#285070] flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-stone-400 font-['Orbitron']">TOTAL DUELS</span>
                <span className="text-xl font-['Orbitron'] font-black text-white mt-1">{profile.totalDuels}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e2136] border border-[#285070] flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-emerald-400 font-['Orbitron']">WINS</span>
                <span className="text-xl font-['Orbitron'] font-black text-emerald-300 mt-1">{profile.wins}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e2136] border border-[#285070] flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-rose-400 font-['Orbitron']">LOSSES</span>
                <span className="text-xl font-['Orbitron'] font-black text-rose-300 mt-1">{profile.losses}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e2136] border border-[#285070] flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-amber-400 font-['Orbitron']">WIN RATE</span>
                <span className="text-xl font-['Orbitron'] font-black text-amber-300 mt-1">{winRate}%</span>
              </div>
            </div>
          </div>

          {/* 2. Multiple Deck Slots (5 Custom Slots) */}
          <div>
            <h3 className="font-['Orbitron'] font-bold text-sm text-sky-400 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>SAVED DECK SLOTS (5 CLOUD SLOTS)</span>
            </h3>
            <p className="text-xs text-stone-400 mb-3">
              Switch between prebuilt archetypes or save your current customized deck to any slot.
            </p>

            <div className="flex flex-col gap-2.5">
              {slots.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0b1929] border border-[#244b6b] hover:border-sky-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-['Cinzel'] font-bold text-sm text-amber-200">{slot.name}</h4>
                    </div>
                    <span className="text-[11px] text-stone-400 mt-0.5 block">
                      Main Deck: {slot.main.length} cards · Extra Deck: {slot.extra.length} cards
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleSaveCurrentDeckToSlot(slot.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#122e47] hover:bg-[#1a3e61] border border-[#3b7294] text-xs font-semibold text-stone-200"
                      title="Overwrite this slot with your current active deck"
                    >
                      Overwrite
                    </button>
                    <button
                      onClick={() => handleLoadSlot(slot)}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-stone-950 font-['Orbitron'] font-black text-xs shadow transition-all active:scale-95"
                    >
                      EQUIP DECK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
