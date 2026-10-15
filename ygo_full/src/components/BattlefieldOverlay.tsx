/**
 * BattlefieldOverlay - Master Duel Interactive Card Zones & Center Divider (English)
 * Complete with dedicated Direct Attack banner and zone targeting.
 */

import React from 'react';
import { CardInstance, DuelState } from '../types/duel';
import { CenterPhaseController } from './CenterPhaseController';
import { Target, Sparkles, Zap, Shield, Swords, Layers, Skull } from 'lucide-react';

interface BattlefieldOverlayProps {
  state: DuelState;
  onCardClick: (card: CardInstance, side: 'player' | 'ai', location: 'monsters' | 'spells' | 'fieldSpell' | 'emz', index: number) => void;
  onZoneClick: (side: 'player' | 'ai', location: 'monsters' | 'spells' | 'fieldSpell', index: number) => void;
  onEmzClick: (index: number) => void;
  onAdvancePhase: (target: any) => void;
  onEndTurn: () => void;
  onInspectCard: (card: CardInstance) => void;
  onDirectAttack?: () => void;
}

export const BattlefieldOverlay: React.FC<BattlefieldOverlayProps> = ({
  state,
  onCardClick,
  onZoneClick,
  onEmzClick,
  onAdvancePhase,
  onEndTurn,
  onInspectCard,
  onDirectAttack,
}) => {
  const isLocal2P = state.gameMode === 'LOCAL_2P';
  const isBattlePhase = state.phase === 'BATTLE';
  const isP1Turn = state.activeSide === 'player';
  const isP2Turn = state.activeSide === 'ai' && isLocal2P;

  const hasAttacker = state.selectedAttackerUid !== null;

  // Targeting checks
  const p1HasMonsters = state.player.monsters.some(Boolean);
  const p2HasMonsters = state.ai.monsters.some(Boolean);

  const canP1DirectAttack = isBattlePhase && isP1Turn && hasAttacker && !p2HasMonsters;
  const canP2DirectAttack = isBattlePhase && isP2Turn && hasAttacker && !p1HasMonsters;

  const canDirectAttack = canP1DirectAttack || canP2DirectAttack;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:px-12 md:py-6 overflow-hidden">
      {/* ============================================================== */}
      {/* 1. OPPONENT FIELD (TOP HALF)                                  */}
      {/* ============================================================== */}
      <div className="flex flex-col items-center gap-2 mt-2">
        {/* Opponent Spell & Trap Zones + Field Spell on Left */}
        <div className="flex items-center justify-center gap-3 md:gap-5 w-full max-w-4xl">
          {/* Opponent Field Spell Zone (Far Left) */}
          <div
            onClick={() => {
              if (state.ai.fieldSpell) onInspectCard(state.ai.fieldSpell);
            }}
            className={`pointer-events-auto w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
              state.ai.fieldSpell
                ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                : 'border-[#2d5673]/50 bg-[#091826]/30'
            }`}
          >
            {state.ai.fieldSpell ? (
              <img
                src={state.ai.fieldSpell.art}
                alt={state.ai.fieldSpell.name}
                className="w-full h-full object-cover rounded shadow"
              />
            ) : (
              <span className="text-[9px] font-['Orbitron'] text-emerald-400/70 font-bold text-center">
                FIELD SPELL
              </span>
            )}
          </div>

          {/* 5 Spell/Trap Zones */}
          <div className="flex items-center gap-2 md:gap-3.5">
            {state.ai.spells.map((card, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (card) {
                    onInspectCard(card);
                    onCardClick(card, 'ai', 'spells', idx);
                  } else if (isP2Turn) {
                    onZoneClick('ai', 'spells', idx);
                  }
                }}
                className="pointer-events-auto w-[60px] h-[86px] md:w-[70px] md:h-[100px] rounded-lg border border-[#2b5473]/70 bg-[#081524]/60 flex items-center justify-center relative overflow-hidden transition-all hover:border-sky-400 shadow-inner"
              >
                {card ? (
                  card.faceUp ? (
                    <img src={card.art} alt={card.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#182a40] border border-[#d4af37]/60 flex items-center justify-center text-[10px] text-amber-300 font-['Cinzel'] font-bold">
                      SET
                    </div>
                  )
                ) : (
                  <span className="text-[9px] font-['Orbitron'] text-[#457294]/60">S/T {idx + 1}</span>
                )}
              </div>
            ))}
          </div>

          {/* Opponent Extra Deck Plinth (Far Right) */}
          <div className="w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border border-[#3b4c6e] bg-[#121a2c]/60 flex flex-col items-center justify-center text-center">
            <Layers className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[9px] font-['Orbitron'] text-purple-300 font-bold">EX ({state.ai.extraDeck.length})</span>
          </div>
        </div>

        {/* Opponent Monster Zones (5 Zones) OR Direct Attack Target */}
        <div className="relative flex items-center justify-center gap-2 md:gap-3.5 w-full max-w-4xl">
          {/* Direct Attack Overlay Banner when opponent has 0 monsters */}
          {canDirectAttack && onDirectAttack && (
            <button
              onClick={onDirectAttack}
              className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center gap-3 bg-gradient-to-r from-rose-900/90 via-red-800/90 to-rose-900/90 border-2 border-red-400 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.9)] animate-pulse transition-transform hover:scale-102 active:scale-98 cursor-crosshair"
            >
              <Swords className="w-6 h-6 text-yellow-300 animate-bounce" />
              <div className="text-center">
                <span className="font-['Orbitron'] font-black text-sm text-yellow-200 tracking-wider block">
                  ⚡ DIRECT ATTACK! ⚡
                </span>
                <span className="text-[11px] text-white font-bold">
                  (Opponent controls no monsters - Click here to strike directly!)
                </span>
              </div>
              <Target className="w-6 h-6 text-yellow-300 animate-spin" />
            </button>
          )}

          {/* Spacer to align with Field Spell */}
          <div className="w-[62px] md:w-[72px]" />

          {state.ai.monsters.map((card, idx) => {
            const isTargetable = isP1Turn && isBattlePhase && hasAttacker && p2HasMonsters;
            const isSelectedAttacker = isP2Turn && card && state.selectedAttackerUid === card.uid;
            const canAttack = isP2Turn && isBattlePhase && card && card.faceUp && card.position === 'ATTACK' && !card.hasAttacked;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (card) {
                    onInspectCard(card);
                    onCardClick(card, 'ai', 'monsters', idx);
                  } else if (isP2Turn) {
                    onZoneClick('ai', 'monsters', idx);
                  } else if (canDirectAttack && onDirectAttack) {
                    onDirectAttack();
                  }
                }}
                className={`pointer-events-auto relative w-[60px] h-[86px] md:w-[70px] md:h-[100px] rounded-lg border flex items-center justify-center transition-all ${
                  isSelectedAttacker
                    ? 'border-purple-400 ring-4 ring-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.9)] scale-110 z-20'
                    : canAttack
                    ? 'border-purple-400 ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-pulse'
                    : isTargetable && card
                    ? 'border-rose-400 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse cursor-crosshair scale-105'
                    : card
                    ? 'border-amber-400/80 bg-[#0c1a29]'
                    : 'border-[#2d5673]/60 bg-[#071320]/40'
                }`}
              >
                {card ? (
                  card.faceUp ? (
                    <div className="relative w-full h-full">
                      <img
                        src={card.art}
                        alt={card.name}
                        className={`w-full h-full object-cover rounded ${
                          card.position === 'DEFENSE' ? 'rotate-90 scale-90' : ''
                        }`}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/85 px-1 py-0.5 text-[9px] font-['Orbitron'] font-bold text-center text-amber-300 truncate">
                        {card.atk}
                      </div>
                      {isTargetable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-rose-950/40 pointer-events-none">
                          <Target className="w-7 h-7 text-rose-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#1b2533] border border-stone-500 flex items-center justify-center text-[10px] text-stone-300 font-bold rotate-90 scale-90">
                      DEF
                    </div>
                  )
                ) : (
                  <span className="text-[9px] font-['Orbitron'] text-stone-500">M {idx + 1}</span>
                )}
              </div>
            );
          })}

          {/* Opponent Main Deck */}
          <div className="w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border border-[#d4af37]/60 bg-[#1f190e]/60 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-['Orbitron'] text-amber-400 font-bold">DECK</span>
            <span className="text-xs font-['Orbitron'] text-white font-extrabold">{state.ai.deck.length}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CENTER DIVIDING LINE & EXTRA MONSTER ZONES (CENTER)        */}
      {/* ============================================================== */}
      <div className="relative w-full flex items-center justify-center my-auto py-2">
        {/* Left Extra Monster Zone (EMZ 1) */}
        <div
          onClick={() => onEmzClick(0)}
          className={`pointer-events-auto absolute left-1/3 -translate-x-1/2 w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
            state.extraMonsterZone[0]
              ? 'border-purple-400 bg-purple-950/50 shadow-[0_0_18px_rgba(168,85,247,0.6)]'
              : 'border-purple-500/40 bg-[#120f26]/40 hover:border-purple-400'
          }`}
        >
          {state.extraMonsterZone[0] ? (
            <img
              src={state.extraMonsterZone[0].art}
              alt={state.extraMonsterZone[0].name}
              className="w-full h-full object-cover rounded shadow"
              onClick={() => onInspectCard(state.extraMonsterZone[0]!)}
            />
          ) : (
            <span className="text-[9px] font-['Orbitron'] text-purple-300 font-bold text-center">
              EXTRA ZONE
            </span>
          )}
        </div>

        {/* Center Phase Controller (Right in the middle as requested!) */}
        <CenterPhaseController
          state={state}
          onAdvancePhase={onAdvancePhase}
          onEndTurn={onEndTurn}
        />

        {/* Right Extra Monster Zone (EMZ 2) */}
        <div
          onClick={() => onEmzClick(1)}
          className={`pointer-events-auto absolute right-1/3 translate-x-1/2 w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
            state.extraMonsterZone[1]
              ? 'border-purple-400 bg-purple-950/50 shadow-[0_0_18px_rgba(168,85,247,0.6)]'
              : 'border-purple-500/40 bg-[#120f26]/40 hover:border-purple-400'
          }`}
        >
          {state.extraMonsterZone[1] ? (
            <img
              src={state.extraMonsterZone[1].art}
              alt={state.extraMonsterZone[1].name}
              className="w-full h-full object-cover rounded shadow"
              onClick={() => onInspectCard(state.extraMonsterZone[1]!)}
            />
          ) : (
            <span className="text-[9px] font-['Orbitron'] text-purple-300 font-bold text-center">
              EXTRA ZONE
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PLAYER FIELD (BOTTOM HALF)                                 */}
      {/* ============================================================== */}
      <div className="flex flex-col items-center gap-2 mb-20 md:mb-24">
        {/* Player Monster Zones (5 Zones) */}
        <div className="flex items-center justify-center gap-2 md:gap-3.5 w-full max-w-4xl">
          {/* Player Field Spell Zone (Far Left) */}
          <div
            onClick={() => {
              if (state.player.fieldSpell) onInspectCard(state.player.fieldSpell);
              else onZoneClick('player', 'fieldSpell', 0);
            }}
            className={`pointer-events-auto w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
              state.player.fieldSpell
                ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_18px_rgba(52,211,153,0.5)]'
                : 'border-emerald-600/40 bg-[#0a1e1b]/40 hover:border-emerald-400'
            }`}
          >
            {state.player.fieldSpell ? (
              <img
                src={state.player.fieldSpell.art}
                alt={state.player.fieldSpell.name}
                className="w-full h-full object-cover rounded shadow"
              />
            ) : (
              <span className="text-[9px] font-['Orbitron'] text-emerald-400 font-bold text-center">
                FIELD SPELL
              </span>
            )}
          </div>

          {state.player.monsters.map((card, idx) => {
            const isSelectedAttacker = isP1Turn && card && state.selectedAttackerUid === card.uid;
            const canAttack = isP1Turn && isBattlePhase && card && card.faceUp && card.position === 'ATTACK' && !card.hasAttacked;
            const isTargetable = isP2Turn && isBattlePhase && hasAttacker && p1HasMonsters;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (card) {
                    onInspectCard(card);
                    onCardClick(card, 'player', 'monsters', idx);
                  } else if (isP1Turn) {
                    onZoneClick('player', 'monsters', idx);
                  } else if (canDirectAttack && onDirectAttack) {
                    onDirectAttack();
                  }
                }}
                className={`pointer-events-auto relative w-[60px] h-[86px] md:w-[70px] md:h-[100px] rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                  isSelectedAttacker
                    ? 'border-amber-400 ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,190,50,0.9)] scale-110 z-20'
                    : canAttack
                    ? 'border-sky-400 ring-2 ring-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.7)] animate-pulse'
                    : isTargetable && card
                    ? 'border-rose-400 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse cursor-crosshair scale-105'
                    : card
                    ? 'border-amber-400/80 bg-[#0c1a29]'
                    : 'border-[#2d5673]/60 bg-[#071320]/40 hover:border-sky-400'
                }`}
              >
                {card ? (
                  <div className="relative w-full h-full">
                    <img
                      src={card.art}
                      alt={card.name}
                      className={`w-full h-full object-cover rounded ${
                        card.position === 'DEFENSE' ? 'rotate-90 scale-90' : ''
                      }`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/85 px-1 py-0.5 text-[9px] font-['Orbitron'] font-black text-center text-amber-300">
                      {(card.atk ?? 0) + (card.attackBonus || 0)}
                    </div>
                    {isSelectedAttacker && (
                      <div className="absolute -top-3 -right-2 bg-amber-400 text-stone-950 rounded-full p-1 shadow-lg">
                        <Swords className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] font-['Orbitron'] text-stone-400">MONSTER {idx + 1}</span>
                )}
              </div>
            );
          })}

          {/* Player Graveyard Plinth */}
          <div className="w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border border-purple-500/60 bg-[#18112c]/60 flex flex-col items-center justify-center text-center">
            <Skull className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[9px] font-['Orbitron'] text-purple-300 font-bold">GY</span>
            <span className="text-xs font-['Orbitron'] text-white font-extrabold">{state.player.graveyard.length}</span>
          </div>
        </div>

        {/* Player Spell & Trap Zones (5 Zones) */}
        <div className="flex items-center justify-center gap-2 md:gap-3.5 w-full max-w-4xl">
          {/* Player Extra Deck Plinth */}
          <div className="w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border border-amber-500/60 bg-[#241a0d]/60 flex flex-col items-center justify-center text-center">
            <Layers className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[9px] font-['Orbitron'] text-amber-300 font-bold">EXTRA</span>
            <span className="text-xs font-['Orbitron'] text-white font-extrabold">{state.player.extraDeck.length}</span>
          </div>

          {state.player.spells.map((card, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (card) {
                  onInspectCard(card);
                  onCardClick(card, 'player', 'spells', idx);
                } else {
                  onZoneClick('player', 'spells', idx);
                }
              }}
              className="pointer-events-auto w-[60px] h-[86px] md:w-[70px] md:h-[100px] rounded-lg border border-[#2b5473]/70 bg-[#081524]/60 flex items-center justify-center cursor-pointer transition-all hover:border-sky-400 shadow-inner"
            >
              {card ? (
                card.faceUp ? (
                  <img src={card.art} alt={card.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#182a40] border border-[#d4af37]/70 flex items-center justify-center text-[10px] text-amber-300 font-['Cinzel'] font-bold">
                    SET
                  </div>
                )
              ) : (
                <span className="text-[9px] font-['Orbitron'] text-[#457294]/60">SPELL {idx + 1}</span>
              )}
            </div>
          ))}

          {/* Player Main Deck */}
          <div className="w-[62px] h-[90px] md:w-[72px] md:h-[105px] rounded-lg border border-[#d4af37]/60 bg-[#1f190e]/60 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-['Orbitron'] text-amber-400 font-bold">DECK</span>
            <span className="text-xs font-['Orbitron'] text-white font-extrabold">{state.player.deck.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
