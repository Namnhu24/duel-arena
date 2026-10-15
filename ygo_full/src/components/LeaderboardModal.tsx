/**
 * LeaderboardModal - Global Duelist Rankings & Standings (Mode 2)
 */

import React from 'react';
import { Trophy, Medal, Crown, Star, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RankedDuelist {
  rank: number;
  name: string;
  title: string;
  rating: number;
  wins: number;
  winRate: number;
  deckType: string;
}

const LEADERBOARD_DATA: RankedDuelist[] = [
  { rank: 1, name: 'Seto Kaiba', title: 'CEO of KaibaCorp', rating: 3250, wins: 412, winRate: 88, deckType: 'Blue-Eyes Dragon' },
  { rank: 2, name: 'Yugi Muto', title: 'King of Games', rating: 3180, wins: 395, winRate: 91, deckType: 'Dark Magician' },
  { rank: 3, name: 'Zane Truesdale', title: 'Hell Kaiser', rating: 2940, wins: 350, winRate: 84, deckType: 'Cyber Dragon' },
  { rank: 4, name: 'Yusei Fudo', title: 'Signer Champion', rating: 2880, wins: 320, winRate: 82, deckType: 'Stardust Synchro' },
  { rank: 5, name: 'Jaden Yuki', title: 'Supreme King', rating: 2790, wins: 295, winRate: 79, deckType: 'Elemental HERO' },
  { rank: 6, name: 'Astral', title: 'Number Hunter', rating: 2650, wins: 270, winRate: 76, deckType: 'Utopia Xyz' },
  { rank: 7, name: 'Joey Wheeler', title: 'Godfather of Luck', rating: 2510, wins: 240, winRate: 71, deckType: 'Red-Eyes Beatdown' },
  { rank: 8, name: 'Akiza Izinski', title: 'Black Rose Witch', rating: 2420, wins: 215, winRate: 74, deckType: 'Black Rose Dragon' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#091524] border border-amber-500/70 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#262045] via-[#152342] to-[#0c1626] px-6 py-4 border-b border-amber-500/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-lg text-amber-200">
                GLOBAL DUEL ARENA RANKINGS
              </h2>
              <span className="text-[10px] text-stone-300 font-semibold">
                Top worldwide duelists ranked by Elo Rating & Win Ratio.
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

        {/* Leaderboard Table */}
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {LEADERBOARD_DATA.map((player) => {
              const isTop3 = player.rank <= 3;
              return (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isTop3
                      ? 'bg-gradient-to-r from-[#172b40] to-[#0f1d2c] border-amber-400/80 shadow-md scale-101'
                      : 'bg-[#0a1829] border-[#224769]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-['Orbitron'] font-black text-xs ${
                        player.rank === 1
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-stone-950 shadow-[0_0_12px_rgba(245,190,50,0.8)]'
                          : player.rank === 2
                          ? 'bg-gradient-to-tr from-stone-300 to-slate-100 text-stone-950'
                          : player.rank === 3
                          ? 'bg-gradient-to-tr from-amber-700 to-amber-600 text-amber-100'
                          : 'bg-[#152e47] text-stone-300'
                      }`}
                    >
                      {player.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Cinzel'] font-bold text-sm text-stone-100">{player.name}</span>
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                          {player.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-sky-400 font-medium">Deck: {player.deckType}</span>
                    </div>
                  </div>

                  {/* Rating & Win Rate */}
                  <div className="flex items-center gap-5 text-right font-['Orbitron']">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Elo Rating</span>
                      <span className="font-black text-sm text-amber-300">{player.rating}</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-stone-400 block uppercase">Win Rate</span>
                      <span className="font-bold text-xs text-emerald-400">{player.winRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
