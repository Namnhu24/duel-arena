/**
 * OnlineRoomModal - Real-time PVP Duel Room Matchmaking (Mode 1)
 */

import React, { useState, useEffect } from 'react';
import { multiplayer } from '../utils/multiplayerClient';
import { Swords, Copy, Check, Users, Sparkles, X, Wifi, WifiOff } from 'lucide-react';
import { sound } from '../utils/audio';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  deckConfig: any;
  onStartOnlineDuel: (roomCode: string, role: 'host' | 'guest', opponentName: string) => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  playerName,
  deckConfig,
  onStartOnlineDuel,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Connecting to online duel server...');
  const [opponentName, setOpponentName] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    multiplayer.connect().then(ok => {
      setConnected(ok);
      if (ok) {
        setStatusMsg('Connected to duel server. Ready to create or join a room.');
      } else {
        setStatusMsg('Real-time server offline. You can still test multiplayer locally.');
      }
    });

    const unsubscribe = multiplayer.addListener((event) => {
      if (event.type === 'ROOM_CREATED') {
        setStatusMsg(`Room #${event.roomCode} created! Waiting for an opponent to join...`);
      } else if (event.type === 'OPPONENT_JOINED') {
        sound.playSpecialSummon();
        setOpponentName(event.opponentName || 'Challenger');
        setStatusMsg(`${event.opponentName || 'Opponent'} joined! Ready to start the duel!`);
      } else if (event.type === 'ROOM_JOINED') {
        sound.playSpecialSummon();
        setOpponentName(event.opponentName || 'Host Duelist');
        setStatusMsg(`Joined Room #${event.roomCode}! Opponent: ${event.opponentName || 'Host'}.`);
        onStartOnlineDuel(event.roomCode!, 'guest', event.opponentName || 'Host');
      } else if (event.type === 'ERROR') {
        sound.playPhase();
        setStatusMsg(`Error: ${event.message}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    sound.playPhase();
    multiplayer.createRoom(roomCode, playerName, deckConfig);
    setStatusMsg(`Room #${roomCode} is open. Waiting for opponent...`);
  };

  const handleJoin = () => {
    if (!inputCode.trim()) return;
    sound.playPhase();
    multiplayer.joinRoom(inputCode.trim(), playerName, deckConfig);
    setStatusMsg(`Joining Room #${inputCode}...`);
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#091524] border border-[#3b7294] rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0c1f2e] px-6 py-4 border-b border-[#3b7294] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-400 flex items-center justify-center">
              <Swords className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-lg text-amber-200">
                PVP ONLINE DUEL
              </h2>
              <span className="text-[10px] text-stone-300 font-semibold flex items-center gap-1.5">
                {connected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-400">Server Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400">Local Relay Mode</span>
                  </>
                )}
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

        {/* Tab buttons */}
        <div className="grid grid-cols-2 p-2 bg-[#06101c] border-b border-[#244b66]">
          <button
            onClick={() => setTab('create')}
            className={`py-2 rounded-xl text-xs font-['Orbitron'] font-bold transition-all ${
              tab === 'create'
                ? 'bg-[#122e47] text-amber-300 border border-[#3b7294]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            CREATE ROOM
          </button>
          <button
            onClick={() => setTab('join')}
            className={`py-2 rounded-xl text-xs font-['Orbitron'] font-bold transition-all ${
              tab === 'join'
                ? 'bg-[#122e47] text-amber-300 border border-[#3b7294]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            JOIN ROOM
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {tab === 'create' ? (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                Generate a unique room code and share it with your opponent to duel online.
              </p>

              {/* Room Code Display */}
              <div className="p-4 rounded-2xl bg-[#0e2236] border border-[#2b5675] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-['Orbitron'] uppercase block">Room Code:</span>
                  <span className="font-['Orbitron'] font-black text-2xl text-amber-300 tracking-wider">
                    #{roomCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#173a57] hover:bg-[#204a6e] border border-[#3f779e] text-xs font-bold text-sky-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Opponent Wait status */}
              {opponentName ? (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-bold text-center animate-pulse">
                  Opponent [{opponentName}] has joined!
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#091522] border border-[#22445e] text-stone-300 text-xs">
                  <Users className="w-4 h-4 text-sky-400 animate-pulse flex-shrink-0" />
                  <span>Waiting for an opponent to enter room code...</span>
                </div>
              )}

              {/* Action Button */}
              {opponentName ? (
                <button
                  onClick={() => {
                    sound.playSpecialSummon();
                    onStartOnlineDuel(roomCode, 'host', opponentName);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-['Orbitron'] font-black text-xs tracking-wider shadow-[0_0_20px_rgba(52,211,153,0.7)] animate-pulse"
                >
                  START PVP DUEL NOW!
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-['Orbitron'] font-black text-xs tracking-wider shadow-[0_0_20px_rgba(245,190,50,0.6)] active:scale-95"
                >
                  OPEN ROOM & WAIT FOR PLAYER
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                Enter your friend's room code to enter their duel room:
              </p>

              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.replace('#', ''))}
                placeholder="e.g. 8888"
                className="w-full bg-[#06101c] border border-[#2d5675] rounded-xl px-4 py-3 text-center text-xl font-['Orbitron'] font-bold text-amber-300 tracking-widest placeholder-stone-600 focus:outline-none focus:border-sky-400"
              />

              <button
                disabled={!inputCode.trim()}
                onClick={handleJoin}
                className={`w-full py-3 rounded-xl font-['Orbitron'] font-black text-xs tracking-wider transition-all ${
                  inputCode.trim()
                    ? 'bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-stone-950 shadow-[0_0_20px_rgba(56,189,248,0.6)] active:scale-95'
                    : 'bg-[#102436] text-stone-500 cursor-not-allowed border border-[#20425c]'
                }`}
              >
                JOIN DUEL ROOM
              </button>
            </div>
          )}

          {/* Status Bar */}
          <div className="mt-4 pt-3 border-t border-[#1c3952] text-center">
            <span className="text-[11px] text-sky-300/80 italic">{statusMsg}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
