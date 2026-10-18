/**
 * Yu-Gi-Oh! Master Duel 3D Arena - Full Web Application
 * Complete implementation of ALL 4 GAME MODES:
 * 1. Mode 1: Solo Duel vs AI (Legendary CPU Rivals: Kaiba, Yugi, Jaden, Yusei + Practice Trial)
 * 2. Mode 2: Online PvP Duel (Real-time WebSocket & Room Codes)
 * 3. Mode 3: Local 2-Player (Pass & Play on 1 Device with Turn Privacy Curtain)
 * 4. Mode 4: Survival Gauntlet (5-Stage Duel Tower with Carry-Over LP & Final Boss)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CardInstance, DuelState, Phase, PlayerState, GameMode } from './types/duel';
import { CARD_DATABASE, getRequiredTributes } from './data/cardDatabase';
import { CPU_OPPONENTS, CpuOpponent, SURVIVAL_STAGES, SurvivalStage } from './data/cpuDecks';
import { ThreeBattlefield } from './components/ThreeBattlefield';
import { BattlefieldOverlay } from './components/BattlefieldOverlay';
import { CardInspector } from './components/CardInspector';
import { DuelistHeader } from './components/DuelistHeader';
import { PlayerHand } from './components/PlayerHand';
import { GraveyardModal } from './components/GraveyardModal';
import { ExtraDeckModal } from './components/ExtraDeckModal';
import { CardActionDialog, CardActionItem } from './components/CardActionDialog';
import { TributeModal } from './components/TributeModal';
import { DuelLogBanner } from './components/DuelLogBanner';
import { DuelResultModal } from './components/DuelResultModal';
import { MainMenu } from './components/MainMenu';
import { DeckBuilder, loadStoredDeck, DeckConfig } from './components/DeckBuilder';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { CpuSelectModal } from './components/CpuSelectModal';
import { Local2PModal } from './components/Local2PModal';
import { SurvivalModal } from './components/SurvivalModal';
import { ProfileModal, loadStoredProfile, UserProfile, DeckSlot } from './components/ProfileModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CardWikiModal } from './components/CardWikiModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { multiplayer } from './utils/multiplayerClient';
import { sound } from './utils/audio';
import { Volume2, VolumeX, RotateCcw, Home, Swords, BookOpen, Globe, Wifi, Users, Flame, Shield, Sparkles } from 'lucide-react';

let uidCounter = 1;
const createCardInstance = (def: (typeof CARD_DATABASE)[0]): CardInstance => ({
  ...def,
  uid: ++uidCounter,
  faceUp: true,
  position: 'ATTACK',
  hasAttacked: false,
  hasChangedPosition: false,
  placedTurn: 0,
  setTurn: null,
  attackBonus: 0,
  defenseBonus: 0,
  effectsNegated: false,
  materials: [],
});

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createPlayerFromDeck = (name: string, deckConfig: DeckConfig): PlayerState => {
  const deckCards: CardInstance[] = [];
  deckConfig.main.forEach(cardName => {
    const def = CARD_DATABASE.find(c => c.name === cardName);
    if (def) deckCards.push(createCardInstance(def));
  });

  const extraCards: CardInstance[] = [];
  deckConfig.extra.forEach(cardName => {
    const def = CARD_DATABASE.find(c => c.name === cardName);
    if (def) extraCards.push(createCardInstance(def));
  });

  return {
    name,
    lp: 8000,
    deck: shuffleArray(deckCards),
    extraDeck: extraCards,
    hand: [],
    monsters: Array(5).fill(null),
    spells: Array(5).fill(null),
    fieldSpell: null,
    graveyard: [],
    banished: [],
    swordsActive: 0,
  };
};

export default function App() {
  const [screen, setScreen] = useState<'MENU' | 'DECK_BUILDER' | 'DUEL'>('MENU');
  const [deckConfig, setDeckConfig] = useState<DeckConfig>(loadStoredDeck);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadStoredProfile);
  const [canContinue, setCanContinue] = useState(false);

  // The 4 Game Mode Modal Controls
  const [isCpuSelectModalOpen, setIsCpuSelectModalOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isLocal2PModalOpen, setIsLocal2PModalOpen] = useState(false);
  const [isSurvivalModalOpen, setIsSurvivalModalOpen] = useState(false);

  // Auxiliary Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWikiModalOpen, setIsWikiModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isDeployGuideModalOpen, setIsDeployGuideModalOpen] = useState(false);

  // Online Match State
  const [isOnlineMatch, setIsOnlineMatch] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [playerRole, setPlayerRole] = useState<'host' | 'guest'>('host');
  const [remoteOpponentName, setRemoteOpponentName] = useState('Opponent');

  // Initial Default Duel State
  const [state, setState] = useState<DuelState>(() => {
    const player = createPlayerFromDeck(userProfile.name, deckConfig);
    const ai = createPlayerFromDeck('Seto Kaiba', CPU_OPPONENTS[0].deck);
    for (let i = 0; i < 5; i++) {
      if (player.deck.length > 0) player.hand.push(player.deck.pop()!);
      if (ai.deck.length > 0) ai.hand.push(ai.deck.pop()!);
    }
    return {
      gameMode: 'SOLO_AI',
      turn: 1,
      activeSide: 'player',
      phase: 'MAIN1',
      firstTurnSide: 'player',
      playerFirstTurnComplete: false,
      aiFirstTurnComplete: false,
      over: false,
      result: null,
      normalSummonUsed: false,
      selectedAttackerUid: null,
      selectedTargetUid: null,
      selectedCardUid: null,
      polymerizationReady: false,
      activeFieldSpellEffect: null,
      player,
      ai,
      extraMonsterZone: [null, null],
      logs: ['Duel Arena initialized! You go first. The first player cannot conduct a Battle Phase on turn 1.'],
      lastAttackAnimation: null,
      survivalStage: 1,
      survivalScore: 0,
    };
  });

  // In-Game Modals
  const [isGyOpen, setIsGyOpen] = useState(false);
  const [gyOwnerSide, setGyOwnerSide] = useState<'player' | 'ai'>('player');
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [actionCard, setActionCard] = useState<CardInstance | null>(null);
  const [actionList, setActionList] = useState<CardActionItem[]>([]);
  const [pendingSummonChoice, setPendingSummonChoice] = useState<CardInstance | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ title: string; description: string; candidates: { card: CardInstance; source: 'hand' | 'deck' | 'playerGY' | 'aiGY' | 'field' }[]; effect: 'DROPSIES' | 'REBORN' | 'HONEST_NEOS' | 'ROCKSIES_BANISH' } | null>(null);

  // Tribute Selection Modal State
  const [tributeState, setTributeState] = useState<{
    card: CardInstance;
    mode: 'SUMMON' | 'SET';
    requiredCount: number;
  } | null>(null);

  const addLog = useCallback((msg: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-25), msg]
    }));
  }, []);

  // Listen to incoming remote multiplayer actions
  useEffect(() => {
    if (!isOnlineMatch) return;

    const unsubscribe = multiplayer.addListener((event) => {
      if (event.type === 'REMOTE_ACTION') {
        const { action, payload, sender } = event;

        if (action === 'SUMMON') {
          sound.playSummon();
          setState(prev => {
            const ai = { ...prev.ai };
            const def = CARD_DATABASE.find(c => c.name === payload.cardName) || CARD_DATABASE[0];
            const card = createCardInstance(def);
            card.faceUp = payload.faceUp ?? true;
            card.position = payload.position || 'ATTACK';
            card.placedTurn = prev.turn;
            ai.monsters[payload.slotIndex] = card;
            return { ...prev, ai };
          });
          addLog(`${sender} Summoned [${payload.cardName}]!`);
        } else if (action === 'SPELL') {
          sound.playEffectChime();
          setState(prev => {
            const ai = { ...prev.ai };
            const def = CARD_DATABASE.find(c => c.name === payload.cardName) || CARD_DATABASE[0];
            const card = createCardInstance(def);
            if (card.subtype === 'Field Spell') {
              sound.playFieldSpell();
              ai.fieldSpell = card;
            } else {
              ai.graveyard.push(card);
            }
            return { ...prev, ai };
          });
          addLog(`${sender} activated [${payload.cardName}]!`);
        } else if (action === 'ATTACK') {
          sound.playAttack();
          setState(prev => {
            const player = { ...prev.player };
            player.lp = Math.max(0, player.lp - payload.damage);
            return {
              ...prev,
              player,
              lastAttackAnimation: {
                attackerUid: payload.attackerUid || 9999,
                targetUid: payload.targetUid || null,
                damage: payload.damage,
                timestamp: Date.now()
              }
            };
          });
          addLog(`${sender} attacked for ${payload.damage} damage!`);
        } else if (action === 'PHASE_CHANGE') {
          sound.playPhase();
          setState(prev => ({
            ...prev,
            phase: payload.phase,
            activeSide: payload.activeSide,
          }));
          addLog(`Phase changed to [${payload.phase}].`);
        } else if (action === 'END_TURN') {
          sound.playPhase();
          setState(prev => ({
            ...prev,
            activeSide: 'player',
            phase: 'MAIN1',
            normalSummonUsed: false,
          }));
          addLog(`${sender} ended their turn. Your turn begins!`);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOnlineMatch, addLog]);

  // Selected Card for inspector
  const selectedCard = useMemo(() => {
    if (!state.selectedCardUid) return null;
    const all = [
      ...state.player.hand,
      ...state.player.monsters.filter(Boolean),
      ...state.player.spells.filter(Boolean),
      ...state.player.graveyard,
      state.player.fieldSpell,
      ...state.ai.hand,
      ...state.ai.monsters.filter(Boolean),
      ...state.ai.spells.filter(Boolean),
      ...state.ai.graveyard,
      state.ai.fieldSpell,
      ...state.extraMonsterZone.filter(Boolean),
      ...state.player.extraDeck,
    ];
    return all.find(c => c && c.uid === state.selectedCardUid) || null;
  }, [state]);

  // Continuous Field Spell bonuses. Recalculate both ATK and DEF from printed values
  // so removing/changing a Field Spell never leaves stale bonuses behind.
  useEffect(() => {
    const activeSpell = state.player.fieldSpell || state.ai.fieldSpell;
    setState(prev => {
      const applyField = (p: PlayerState): PlayerState => ({
        ...p,
        monsters: p.monsters.map(m => {
          if (!m) return null;
          let bonus = 0;
          // These classic Field Spells grant the same bonus to ATK and DEF.
          if (activeSpell?.name === 'Mountain' && ['Dragon', 'Winged Beast', 'Thunder'].includes(m.race || '')) bonus = 200;
          else if (activeSpell?.name === 'Yami') {
            if (['Spellcaster', 'Fiend'].includes(m.race || '')) bonus = 200;
            else if (m.race === 'Fairy') bonus = -200;
          } else if (activeSpell?.name === 'Necrovalley' && m.name.includes('Gravekeeper')) bonus = 500;
          // Dragon Ravine and Prank-Kids Place do not grant a blanket ATK/DEF bonus.
          return { ...m, attackBonus: bonus, defenseBonus: bonus };
        }),
      });
      const newPlayer = applyField(prev.player);
      const newAi = applyField(prev.ai);
      return { ...prev, activeFieldSpellEffect: activeSpell?.name || null, player: newPlayer, ai: newAi };
    });
  }, [state.player.fieldSpell, state.ai.fieldSpell]);

  // Winner check
  useEffect(() => {
    if (state.over) return;
    if (state.player.lp <= 0 && state.ai.lp <= 0) {
      setState(prev => ({ ...prev, over: true, result: 'draw' }));
      addLog('Duel ended in a Draw: Both players reached 0 LP!');
    } else if (state.ai.lp <= 0) {
      setState(prev => ({ ...prev, over: true, result: 'victory' }));
      addLog(`VICTORY! ${state.gameMode === 'LOCAL_2P' ? `${state.player.name} defeated ${state.ai.name}!` : `${state.player.name} wins the match!`}`);
    } else if (state.player.lp <= 0) {
      if (state.gameMode === 'PRACTICE') {
        setState(prev => ({
          ...prev,
          player: { ...prev.player, lp: 8000 }
        }));
        addLog('PRACTICE MODE: Life Points recovered to 8000.');
      } else {
        setState(prev => ({ ...prev, over: true, result: 'defeat' }));
        addLog(`DEFEAT! ${state.gameMode === 'LOCAL_2P' ? `${state.ai.name} defeated ${state.player.name}!` : 'Life Points reached 0.'}`);
      }
    }
  }, [state.player.lp, state.ai.lp, state.over, state.gameMode, state.player.name, state.ai.name, addLog]);

  // =========================================================================
  // 1. MODE 1: START SOLO DUEL VS AI (OR PRACTICE)
  // =========================================================================
  const handleStartSoloDuel = (opponent?: CpuOpponent, isPractice = false) => {
    setIsOnlineMatch(false);
    setOnlineRoomCode(null);
    setIsCpuSelectModalOpen(false);

    const opp = opponent || CPU_OPPONENTS[0];
    const player = createPlayerFromDeck(userProfile.name, deckConfig);
    const ai = createPlayerFromDeck(opp.name, opp.deck);

    for (let i = 0; i < 5; i++) {
      if (player.deck.length > 0) player.hand.push(player.deck.pop()!);
      if (ai.deck.length > 0) ai.hand.push(ai.deck.pop()!);
    }

    setState({
      gameMode: isPractice ? 'PRACTICE' : 'SOLO_AI',
      cpuOpponentId: opp.id,
      turn: 1,
      activeSide: 'player',
      phase: 'MAIN1',
      firstTurnSide: 'player',
      playerFirstTurnComplete: false,
      aiFirstTurnComplete: false,
      over: false,
      result: null,
      normalSummonUsed: false,
      selectedAttackerUid: null,
      selectedTargetUid: null,
      selectedCardUid: null,
      polymerizationReady: false,
      activeFieldSpellEffect: null,
      player,
      ai,
      extraMonsterZone: [null, null],
      logs: [
        isPractice
          ? 'Practice Mode active! Test combos, tribute summons and extra deck with unlimited LP recovery.'
          : `Solo Duel started vs ${opp.name} (${opp.difficulty})! "${opp.dialog}"`
      ],
      lastAttackAnimation: null,
      survivalStage: 1,
      survivalScore: 0,
    });
    setCanContinue(true);
    setScreen('DUEL');
  };

  // =========================================================================
  // 2. MODE 2: START ONLINE PVP DUEL (ROOM CODE)
  // =========================================================================
  const handleStartOnlineDuel = (roomCode: string, role: 'host' | 'guest', oppName: string) => {
    setIsOnlineMatch(true);
    setOnlineRoomCode(roomCode);
    setPlayerRole(role);
    setRemoteOpponentName(oppName);
    setIsOnlineModalOpen(false);

    const player = createPlayerFromDeck(userProfile.name, deckConfig);
    const opp = createPlayerFromDeck(oppName, deckConfig);

    for (let i = 0; i < 5; i++) {
      if (player.deck.length > 0) player.hand.push(player.deck.pop()!);
      if (opp.deck.length > 0) opp.hand.push(opp.deck.pop()!);
    }

    setState({
      gameMode: 'ONLINE_PVP',
      turn: 1,
      activeSide: role === 'host' ? 'player' : 'ai',
      phase: 'MAIN1',
      firstTurnSide: 'player',
      playerFirstTurnComplete: false,
      aiFirstTurnComplete: false,
      over: false,
      result: null,
      normalSummonUsed: false,
      selectedAttackerUid: null,
      selectedTargetUid: null,
      selectedCardUid: null,
      polymerizationReady: false,
      activeFieldSpellEffect: null,
      player,
      ai: opp,
      extraMonsterZone: [null, null],
      logs: [`Online PVP Match connected in Room #${roomCode}! Duelist ${userProfile.name} vs ${oppName}.`],
      lastAttackAnimation: null,
    });

    setCanContinue(true);
    setScreen('DUEL');
  };

  // =========================================================================
  // 3. MODE 3: START LOCAL 2-PLAYER DUEL (PASS & PLAY)
  // =========================================================================
  const handleStartLocalDuel = (
    p1Name: string,
    p2Name: string,
    p1Deck: DeckConfig,
    p2Deck: DeckConfig,
    usePrivacyCurtain: boolean
  ) => {
    setIsOnlineMatch(false);
    setOnlineRoomCode(null);
    setIsLocal2PModalOpen(false);

    const p1 = createPlayerFromDeck(p1Name, p1Deck);
    const p2 = createPlayerFromDeck(p2Name, p2Deck);

    for (let i = 0; i < 5; i++) {
      if (p1.deck.length > 0) p1.hand.push(p1.deck.pop()!);
      if (p2.deck.length > 0) p2.hand.push(p2.deck.pop()!);
    }

    setState({
      gameMode: 'LOCAL_2P',
      turn: 1,
      activeSide: 'player',
      phase: 'MAIN1',
      firstTurnSide: 'player',
      playerFirstTurnComplete: false,
      aiFirstTurnComplete: false,
      over: false,
      result: null,
      normalSummonUsed: false,
      selectedAttackerUid: null,
      selectedTargetUid: null,
      selectedCardUid: null,
      polymerizationReady: false,
      activeFieldSpellEffect: null,
      player: p1,
      ai: p2,
      extraMonsterZone: [null, null],
      logs: [`Local 2-Player Match started: ${p1Name} vs ${p2Name}! ${p1Name} takes the first turn.`],
      lastAttackAnimation: null,
    });

    setCanContinue(true);
    setScreen('DUEL');
  };

  // =========================================================================
  // 4. MODE 4: START SURVIVAL GAUNTLET (DUEL TOWER)
  // =========================================================================
  const handleStartSurvival = () => {
    setIsOnlineMatch(false);
    setOnlineRoomCode(null);
    setIsSurvivalModalOpen(false);

    const stage = SURVIVAL_STAGES[0];
    const player = createPlayerFromDeck(userProfile.name, deckConfig);
    const cpu = createPlayerFromDeck(stage.name, stage.deck);
    cpu.lp = stage.startingLp;

    for (let i = 0; i < 5; i++) {
      if (player.deck.length > 0) player.hand.push(player.deck.pop()!);
      if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.pop()!);
    }

    setState({
      gameMode: 'SURVIVAL',
      survivalStage: 1,
      survivalScore: 0,
      turn: 1,
      activeSide: 'player',
      phase: 'MAIN1',
      firstTurnSide: 'player',
      playerFirstTurnComplete: false,
      aiFirstTurnComplete: false,
      over: false,
      result: null,
      normalSummonUsed: false,
      selectedAttackerUid: null,
      selectedTargetUid: null,
      selectedCardUid: null,
      polymerizationReady: false,
      activeFieldSpellEffect: null,
      player,
      ai: cpu,
      extraMonsterZone: [null, null],
      logs: [`[SURVIVAL TOWER STAGE 1 OF 4] Challenging ${stage.name} (${stage.startingLp} LP)! "${stage.dialog}"`],
      lastAttackAnimation: null,
    });

    setCanContinue(true);
    setScreen('DUEL');
  };

  const handleNextSurvivalStage = () => {
    const nextStageNum = (state.survivalStage || 1) + 1;
    const stage = SURVIVAL_STAGES.find(s => s.stageNumber === nextStageNum);
    if (!stage) return;

    sound.playSpecialSummon();
    // Carry over remaining LP + reward recovery!
    const carriedLp = state.player.lp;

    const nextPlayer = createPlayerFromDeck(userProfile.name, deckConfig);
    nextPlayer.lp = carriedLp;
    const nextCpu = createPlayerFromDeck(stage.name, stage.deck);
    nextCpu.lp = stage.startingLp;

    for (let i = 0; i < 5; i++) {
      if (nextPlayer.deck.length > 0) nextPlayer.hand.push(nextPlayer.deck.pop()!);
      if (nextCpu.deck.length > 0) nextCpu.hand.push(nextCpu.deck.pop()!);
    }

    setState({
      gameMode: 'SURVIVAL',
      survivalStage: nextStageNum,
      survivalScore: (state.survivalScore || 0) + (stage.scoreBonus || 1000),
      turn: 1,
      activeSide: 'player',
      phase: 'MAIN1',
      firstTurnSide: 'player',
      playerFirstTurnComplete: false,
      aiFirstTurnComplete: false,
      over: false,
      result: null,
      normalSummonUsed: false,
      selectedAttackerUid: null,
      selectedTargetUid: null,
      selectedCardUid: null,
      polymerizationReady: false,
      activeFieldSpellEffect: null,
      player: nextPlayer,
      ai: nextCpu,
      extraMonsterZone: [null, null],
      logs: [
        `[STAGE ${nextStageNum} OF 4] LP carried over unchanged: ${carriedLp}. Opponent: ${stage.name} (${stage.startingLp} LP). "${stage.dialog}"`
      ],
      lastAttackAnimation: null,
    });
  };

  // Phase Transition
  const handleAdvancePhase = (target: Phase) => {
    sound.playPhase();
    setState(prev => ({
      ...prev,
      phase: target,
      selectedAttackerUid: null,
      selectedTargetUid: null,
    }));
    addLog(`Entering [${target} PHASE].`);

    if (isOnlineMatch) {
      multiplayer.syncAction('PHASE_CHANGE', { phase: target, activeSide: state.activeSide });
    }
  };

  // End Turn & AI/Online/Local Turn Handling
  const handleEndTurn = () => {
    sound.playPhase();

    // In Local 2-Player mode: Alternates between Player 1 and Player 2!
    if (state.gameMode === 'LOCAL_2P') {
      const nextSide = state.activeSide === 'player' ? 'ai' : 'player';
      setState(prev => {
        const nextPlayer = nextSide === 'player' ? prev.player : prev.ai;
        if (nextPlayer.deck.length > 0) {
          sound.playDraw();
          nextPlayer.hand.push(nextPlayer.deck.pop()!);
        }
        nextPlayer.monsters.forEach(m => {
          if (m) {
            m.hasAttacked = false;
            m.hasChangedPosition = false;
          }
        });
        return {
          ...prev,
          turn: nextSide === 'player' ? prev.turn + 1 : prev.turn,
          activeSide: nextSide,
          phase: 'MAIN1',
          normalSummonUsed: false,
          selectedAttackerUid: null,
          selectedTargetUid: null,
        };
      });
      const activeName = nextSide === 'player' ? state.player.name : state.ai.name;
      addLog(`Turn ended. Now it is ${activeName}'s turn!`);
      return;
    }

    // Solo or Online End Turn
    setState(prev => {
      prev.player.graveyard.forEach((c, idx) => {
        if (c.stardustReturnPending) {
          const empty = prev.player.monsters.findIndex(m => m === null);
          if (empty >= 0) {
            prev.player.graveyard.splice(idx, 1);
            c.faceUp = true;
            c.position = 'ATTACK';
            c.hasAttacked = false;
            c.stardustReturnPending = false;
            prev.player.monsters[empty] = c;
            sound.playSpecialSummon();
          }
        }
      });

      return {
        ...prev,
        activeSide: 'ai',
        phase: 'DRAW',
        playerFirstTurnComplete: true,
        selectedAttackerUid: null,
        selectedTargetUid: null,
      };
    });
    addLog('End of your turn. Opponent\'s turn begins.');

    if (isOnlineMatch) {
      multiplayer.syncAction('END_TURN', {});
    } else {
      setTimeout(() => {
        runAiTurn();
      }, 900);
    }
  };

  // AI Turn (Solo & Survival Mode)
  const runAiTurn = () => {
    if (isOnlineMatch || state.gameMode === 'LOCAL_2P') return;

    setState(prev => {
      const ai = { ...prev.ai };
      const player = { ...prev.player };
      let newTurn = prev.turn + 1;

      // Draw
      if (ai.deck.length > 0) {
        sound.playDraw();
        ai.hand.push(ai.deck.pop()!);
      }

      ai.monsters.forEach(m => {
        if (m) {
          m.hasAttacked = false;
          m.hasChangedPosition = false;
        }
      });

      // Kaiser Ryo's Cyber Dragon AI: search, deploy Cyber bodies, then Fusion OTK lines.
      const isKaiserRyo = /kaiser ryo/i.test(ai.name);
      if (isKaiserRyo) {
        // Cyber Emergency searches a missing starter when available.
        const emergencyIndex = ai.hand.findIndex(c => c.name === 'Cyber Emergency');
        if (emergencyIndex >= 0) {
          const hasStarter = ai.hand.some(c => ['Cyber Dragon Core', 'Cyber Dragon', 'Cyber Dragon Herz'].includes(c.name));
          if (!hasStarter) {
            const searchIndex = ai.deck.findIndex(c => c.name === 'Cyber Dragon Core' || c.name === 'Cyber Dragon');
            if (searchIndex >= 0) ai.hand.push(ai.deck.splice(searchIndex, 1)[0]);
          }
          ai.graveyard.push(ai.hand.splice(emergencyIndex, 1)[0]);
        }

        // If the opponent controls a monster and Kaiser controls none, deploy Cyber Dragon from hand.
        if (ai.monsters.every(m => !m) && player.monsters.some(Boolean)) {
          const cdIndex = ai.hand.findIndex(c => c.name === 'Cyber Dragon');
          const empty = ai.monsters.findIndex(m => !m);
          if (cdIndex >= 0 && empty >= 0) {
            const [cd] = ai.hand.splice(cdIndex, 1);
            cd.faceUp = true; cd.position = 'ATTACK'; cd.placedTurn = newTurn;
            cd.hasAttacked = false; cd.summonKind = 'SPECIAL'; ai.monsters[empty] = cd;
          }
        }

        // Prefer Core as the normal summon starter when no monster has been deployed.
        if (ai.monsters.every(m => !m)) {
          const coreIndex = ai.hand.findIndex(c => c.name === 'Cyber Dragon Core');
          const empty = ai.monsters.findIndex(m => !m);
          if (coreIndex >= 0 && empty >= 0) {
            const [core] = ai.hand.splice(coreIndex, 1);
            core.faceUp = true; core.position = 'ATTACK'; core.placedTurn = newTurn;
            core.hasAttacked = false; core.summonKind = 'NORMAL'; ai.monsters[empty] = core;
            // Core's on-summon search: find Cyber Emergency or Cyber Repair Plant.
            const searchIndex = ai.deck.findIndex(c => c.name === 'Cyber Emergency' || c.name === 'Cyber Repair Plant');
            if (searchIndex >= 0) ai.hand.push(ai.deck.splice(searchIndex, 1)[0]);
          }
        }

        // Power Bond into Chimeratech Rampage Dragon when two Cyber Dragon bodies are available.
        const powerBondIndex = ai.hand.findIndex(c => c.name === 'Power Bond');
        const rampageIndex = ai.extraDeck.findIndex(c => c.name === 'Chimeratech Rampage Dragon');
        const cyberField = ai.monsters.map((m, slot) => ({ m, slot })).filter(x => x.m && /Cyber Dragon/.test(x.m.name));
        const cyberHand = ai.hand.map((c, index) => ({ c, index })).filter(x => /Cyber Dragon/.test(x.c.name) && x.c.type === 'MONSTER');
        if (powerBondIndex >= 0 && rampageIndex >= 0 && cyberField.length + cyberHand.length >= 2) {
          let materials = 0;
          for (const item of cyberField) {
            if (materials >= 2) break;
            if (item.m) { ai.graveyard.push(item.m); ai.monsters[item.slot] = null; materials++; }
          }
          for (const item of cyberHand) {
            if (materials >= 2) break;
            const idx = ai.hand.findIndex(c => c.uid === item.c.uid);
            if (idx >= 0) { ai.graveyard.push(ai.hand.splice(idx, 1)[0]); materials++; }
          }
          if (materials >= 2) {
            ai.graveyard.push(ai.hand.splice(ai.hand.findIndex(c => c.name === 'Power Bond'), 1)[0]);
            const fusion = ai.extraDeck.splice(rampageIndex, 1)[0];
            fusion.faceUp = true; fusion.position = 'ATTACK'; fusion.placedTurn = newTurn;
            fusion.hasAttacked = false; fusion.summonKind = 'FUSION';
            fusion.attackBonus = fusion.atk || 0; // Power Bond doubles original ATK.
            const empty = ai.monsters.findIndex(m => !m);
            if (empty >= 0) ai.monsters[empty] = fusion;
          }
        }
      }

      // Jaden Yuki's HERO AI: prioritize the Faris/Increase/Vyon engine,
      // load Destiny HERO - Malicious into the GY, then aim for HERO Fusion bosses.
      const isJadenYuki = /jaden yuki/i.test(ai.name);
      if (isJadenYuki) {
        const freeMonsterSlot = () => ai.monsters.findIndex(m => m === null);
        const specialFromDeck = (name: string) => {
          const slot = freeMonsterSlot();
          const idx = ai.deck.findIndex(c => c.name === name);
          if (slot < 0 || idx < 0) return false;
          const [card] = ai.deck.splice(idx, 1);
          card.faceUp = true; card.position = 'ATTACK'; card.placedTurn = newTurn;
          card.hasAttacked = false; card.summonKind = 'SPECIAL'; ai.monsters[slot] = card;
          return true;
        };
        const normalFromHand = (names: string[]) => {
          if (freeMonsterSlot() < 0) return false;
          const idx = ai.hand.findIndex(c => names.includes(c.name) && c.type === 'MONSTER' && (c.level || 4) <= 4);
          if (idx < 0) return false;
          const [card] = ai.hand.splice(idx, 1);
          card.faceUp = true; card.position = 'ATTACK'; card.placedTurn = newTurn;
          card.hasAttacked = false; card.summonKind = 'NORMAL'; ai.monsters[freeMonsterSlot()] = card;
          return true;
        };

        // A Hero Lives is the preferred opener when the field is empty.
        const aHeroLives = ai.hand.findIndex(c => c.name === 'A Hero Lives');
        if (aHeroLives >= 0 && ai.monsters.every(m => !m) && ai.lp > 2000) {
          ai.lp = Math.floor(ai.lp / 2);
          ai.graveyard.push(ai.hand.splice(aHeroLives, 1)[0]);
          if (specialFromDeck('Elemental HERO Stratos') || specialFromDeck('Elemental HERO Shadow Mist')) {
            const summoned = ai.monsters.find(m => m && ['Elemental HERO Stratos', 'Elemental HERO Shadow Mist'].includes(m.name));
            if (summoned?.name === 'Elemental HERO Stratos') {
              const target = ai.deck.findIndex(c => ['Vision HERO Faris', 'Vision HERO Vyon', 'Elemental HERO Shadow Mist'].includes(c.name));
              if (target >= 0) ai.hand.push(ai.deck.splice(target, 1)[0]);
            }
          }
        }

        // Faris converts a spare HERO in hand into an extender and places Increase face-up.
        const farisIndex = ai.hand.findIndex(c => c.name === 'Vision HERO Faris');
        const discardHeroIndex = ai.hand.findIndex((c, i) => i !== farisIndex && c.type === 'MONSTER' && /HERO/.test(c.name));
        if (farisIndex >= 0 && discardHeroIndex >= 0 && freeMonsterSlot() >= 0) {
          const [discarded] = ai.hand.splice(discardHeroIndex, 1); ai.graveyard.push(discarded);
          const updatedFarisIndex = ai.hand.findIndex(c => c.name === 'Vision HERO Faris');
          const [faris] = ai.hand.splice(updatedFarisIndex, 1);
          faris.faceUp = true; faris.position = 'ATTACK'; faris.placedTurn = newTurn;
          faris.hasAttacked = false; faris.summonKind = 'SPECIAL'; ai.monsters[freeMonsterSlot()] = faris;
          const increaseIdx = ai.deck.findIndex(c => c.name === 'Vision HERO Increase');
          const spellSlot = ai.spells.findIndex(c => c === null);
          if (increaseIdx >= 0 && spellSlot >= 0) {
            const [increase] = ai.deck.splice(increaseIdx, 1);
            increase.faceUp = true; ai.spells[spellSlot] = increase;
          }
        }

        // Normal summon a low-level starter instead of wasting the Normal Summon on a high-level HERO.
        normalFromHand(['Vision HERO Vyon', 'Elemental HERO Stratos', 'Elemental HERO Shadow Mist', 'Elemental HERO Solid Soldier']);

        // Vyon sends Malicious to the GY; Malicious then extends the field from the GY.
        if (ai.monsters.some(m => m?.name === 'Vision HERO Vyon') && !ai.graveyard.some(c => c.name === 'Destiny HERO - Malicious')) {
          const maliIdx = ai.deck.findIndex(c => c.name === 'Destiny HERO - Malicious');
          if (maliIdx >= 0) ai.graveyard.push(ai.deck.splice(maliIdx, 1)[0]);
        }
        if (ai.graveyard.some(c => c.name === 'Destiny HERO - Malicious') && freeMonsterSlot() >= 0) {
          const gyIdx = ai.graveyard.findIndex(c => c.name === 'Destiny HERO - Malicious');
          const deckIdx = ai.deck.findIndex(c => c.name === 'Destiny HERO - Malicious');
          if (gyIdx >= 0 && deckIdx >= 0) {
            ai.banished.push(ai.graveyard.splice(gyIdx, 1)[0]);
            specialFromDeck('Destiny HERO - Malicious');
          }
        }

        // Convert two HERO bodies into Sunrise when Polymerization and the Extra Deck target are available.
        const polyIdx = ai.hand.findIndex(c => c.name === 'Polymerization');
        const sunriseIdx = ai.extraDeck.findIndex(c => c.name === 'Elemental HERO Sunrise');
        const heroField = ai.monsters.map((m, slot) => ({ m, slot })).filter(x => x.m && /HERO/.test(x.m.name));
        const heroHand = ai.hand.filter(c => c.type === 'MONSTER' && /HERO/.test(c.name));
        if (polyIdx >= 0 && sunriseIdx >= 0 && heroField.length + heroHand.length >= 2 && freeMonsterSlot() >= 0) {
          let used = 0;
          for (const item of heroField) {
            if (used >= 2) break;
            if (item.m) { ai.graveyard.push(item.m); ai.monsters[item.slot] = null; used++; }
          }
          while (used < 2) {
            const idx = ai.hand.findIndex(c => c.type === 'MONSTER' && /HERO/.test(c.name));
            if (idx < 0) break;
            ai.graveyard.push(ai.hand.splice(idx, 1)[0]); used++;
          }
          if (used === 2) {
            const pidx = ai.hand.findIndex(c => c.name === 'Polymerization');
            if (pidx >= 0) ai.graveyard.push(ai.hand.splice(pidx, 1)[0]);
            const fusionIdx = ai.extraDeck.findIndex(c => c.name === 'Elemental HERO Sunrise');
            if (fusionIdx >= 0) {
              const [fusion] = ai.extraDeck.splice(fusionIdx, 1);
              fusion.faceUp = true; fusion.position = 'ATTACK'; fusion.placedTurn = newTurn;
              fusion.hasAttacked = false; fusion.summonKind = 'FUSION';
              ai.monsters[freeMonsterSlot()] = fusion;
              const miracleIdx = ai.deck.findIndex(c => c.name === 'Miracle Fusion');
              if (miracleIdx >= 0) ai.hand.push(ai.deck.splice(miracleIdx, 1)[0]);
            }
          }
        }
      }

      // CPU uses common Normal/Continuous Spells instead of holding every Spell forever.
      const usableSpellIdx = ai.hand.findIndex(c => c.type === 'SPELL' && c.subtype !== 'Field Spell'
        && !['Polymerization', 'Cyber Revsystem', 'Dark Calling', 'Miracle Fusion'].includes(c.name));
      if (usableSpellIdx >= 0) {
        const spellCard = ai.hand[usableSpellIdx];
        const spellName = spellCard.name.toLowerCase();
        let activated = false;
        if (spellName.includes('raigeki') || spellName.includes('dark hole')) {
          player.monsters.forEach((m, i) => { if (m) { player.graveyard.push(m); player.monsters[i] = null; } });
          activated = true;
        } else if (spellName.includes('mystical space typhoon') || spellName.includes('cosmic cyclone')) {
          const target = player.spells.findIndex(Boolean);
          if (target >= 0) { player.graveyard.push(player.spells[target]!); player.spells[target] = null; activated = true; }
        } else if (spellName.includes('monster reborn') || spellName.includes('call of the haunted')) {
          const slot = ai.monsters.findIndex(m => m === null);
          const target = ai.graveyard.findIndex(c => c.type === 'MONSTER' && !c.extraKind);
          if (slot >= 0 && target >= 0) {
            const [revived] = ai.graveyard.splice(target, 1);
            revived.faceUp = true; revived.position = 'ATTACK'; revived.placedTurn = newTurn; revived.hasAttacked = false;
            revived.summonKind = 'SPECIAL'; ai.monsters[slot] = revived; activated = true;
          }
        } else if (spellCard.activateEffect) {
          try {
            spellCard.activateEffect({ card: spellCard, owner: ai, opponent: player, ownerSide: 'ai', gameState: prev, log: addLog });
            activated = true;
          } catch { /* unsupported CPU spell effect: leave it in hand */ }
        }
        if (activated) { ai.graveyard.push(ai.hand.splice(usableSpellIdx, 1)[0]); addLog(`${ai.name} activated [${spellCard.name}]!`); sound.playEffectChime(); }
      }

      // Field spell
      const fieldIndex = ai.hand.findIndex(c => c.subtype === 'Field Spell');
      if (fieldIndex >= 0) {
        const [fieldCard] = ai.hand.splice(fieldIndex, 1);
        // Activating a new Field Spell replaces the previous one; the old card goes to the GY.
        if (ai.fieldSpell) ai.graveyard.push(ai.fieldSpell);
        fieldCard.faceUp = true;
        ai.fieldSpell = fieldCard;
        sound.playFieldSpell();
      }

      // Summon monster (tributes handled)
      const fieldMonsterCount = ai.monsters.filter(Boolean).length;
      const monsterCandidates = ai.hand
        .map((c, i) => ({ card: c, index: i, tributes: getRequiredTributes(c.level || 1) }))
        .filter(x => x.card.type === 'MONSTER' && fieldMonsterCount >= x.tributes);

      if (monsterCandidates.length > 0) {
        monsterCandidates.sort((a, b) => (b.card.atk || 0) - (a.card.atk || 0));
        const best = monsterCandidates[0];
        
        if (best.tributes > 0) {
          // Harder CPU: pay tribute with the weakest monsters first, preserving stronger board presence.
          const tributeSlots = ai.monsters
            .map((monster, slot) => ({ monster, slot }))
            .filter((entry): entry is { monster: CardInstance; slot: number } => entry.monster !== null)
            .sort((a, b) => ((a.monster.atk || 0) + (a.monster.attackBonus || 0)) - ((b.monster.atk || 0) + (b.monster.attackBonus || 0)))
            .slice(0, best.tributes);
          for (const { monster, slot } of tributeSlots) {
            ai.graveyard.push(monster);
            ai.monsters[slot] = null;
          }
        }

        const emptySlot = ai.monsters.findIndex(m => m === null);
        if (emptySlot >= 0) {
          const [summoned] = ai.hand.splice(best.index, 1);
          summoned.faceUp = true;
          summoned.position = 'ATTACK';
          summoned.placedTurn = newTurn;
          summoned.hasAttacked = false;
          ai.monsters[emptySlot] = summoned;
          sound.playSummon();
        }
      }

      // Set spell/trap
      const trapIdx = ai.hand.findIndex(c => c.type === 'TRAP');
      const emptySpell = ai.spells.findIndex(s => s === null);
      if (trapIdx >= 0 && emptySpell >= 0) {
        const [trapCard] = ai.hand.splice(trapIdx, 1);
        trapCard.faceUp = false;
        trapCard.setTurn = newTurn;
        ai.spells[emptySpell] = trapCard;
      }

      // Generic CPU Extra Deck lines: Synchro, Xyz, Link and Fusion when material checks pass.
      const extraSlot = ai.monsters.findIndex(m => m === null);
      if (extraSlot >= 0) {
        const field = ai.monsters.filter((m): m is CardInstance => m !== null && m.faceUp);
        const extraIndex = ai.extraDeck.findIndex(extra => {
          if (extra.extraKind === 'XYZ') return field.filter(m => (m.level || 0) === (extra.level || 4)).length >= 2;
          if (extra.extraKind === 'SYNCHRO') {
            const tuners = field.filter(m => m.tuner);
            return tuners.some(t => field.some(n => !n.tuner && n.uid !== t.uid && (t.level || 0) + (n.level || 0) === (extra.level || 0)));
          }
          if (extra.extraKind === 'LINK') return field.filter(m => m.subtype !== 'Normal').length >= (extra.linkRating || 2);
          if (extra.extraKind === 'FUSION') return field.length >= 2 && (ai.hand.some(c => c.name === 'Polymerization') || /Cyber|HERO|Prank-Kids/i.test(ai.name));
          return false;
        });
        if (extraIndex >= 0) {
          const extra = ai.extraDeck[extraIndex];
          let materials: CardInstance[] = [];
          if (extra.extraKind === 'XYZ') materials = field.filter(m => (m.level || 0) === (extra.level || 4)).slice(0, 2);
          else if (extra.extraKind === 'SYNCHRO') {
            const tuner = field.find(m => m.tuner && field.some(n => !n.tuner && n.uid !== m.uid && (m.level || 0) + (n.level || 0) === (extra.level || 0)));
            const nonTuner = tuner && field.find(n => !n.tuner && n.uid !== tuner.uid && (n.level || 0) + (tuner.level || 0) === (extra.level || 0));
            if (tuner && nonTuner) materials = [tuner, nonTuner];
          } else if (extra.extraKind === 'LINK') materials = field.filter(m => m.subtype !== 'Normal').slice(0, extra.linkRating || 2);
          else if (extra.extraKind === 'FUSION') materials = field.slice(0, 2);
          if (materials.length >= 1 && (extra.extraKind !== 'SYNCHRO' || materials.length >= 2)) {
            materials.forEach(mat => { const idx = ai.monsters.findIndex(m => m?.uid === mat.uid); if (idx >= 0) { ai.monsters[idx] = null; if (extra.extraKind === 'XYZ') extra.materials.push(mat); else ai.graveyard.push(mat); } });
            const [boss] = ai.extraDeck.splice(extraIndex, 1);
            boss.faceUp = true; boss.position = 'ATTACK'; boss.placedTurn = newTurn; boss.hasAttacked = false; boss.summonKind = extra.extraKind;
            const free = ai.monsters.findIndex(m => m === null);
            if (free >= 0) ai.monsters[free] = boss;
            addLog(`${ai.name} performed a ${extra.extraKind} Summon: [${boss.name}]!`);
            sound.playSpecialSummon();
          }
        }
      }

      // Activate a set Mirror Force when the player attacks: trap cards are part of the CPU strategy.
      // (Other set traps remain available for their specific supported triggers.)

      // Attack. Having no monster to attack with never causes an LP penalty by itself.
      let attackAnim = null;
      const aiAttackers = ai.monsters.filter(m => m && m.faceUp && m.position === 'ATTACK' && !m.hasAttacked);
      aiAttackers.forEach(attacker => {
        if (!attacker || attacker.hasAttacked) return;
        const playerMonsters = player.monsters.filter(Boolean);

        if (playerMonsters.length > 0) {
          // Choose the weakest legal target the CPU can destroy; otherwise pressure the weakest monster.
          const attackerAtk = (attacker.atk || 0) + (attacker.attackBonus || 0);
          // Never throw a weaker CPU monster into a stronger Attack Position monster.
          // Such a bad attack was the main reason CPU LP appeared to drop at turn end
          // when the CPU had not successfully summoned a stronger monster.
          const safeTargets = playerMonsters.filter(target => {
            if (target.position === 'DEFENSE') return true;
            return attackerAtk >= ((target.atk || 0) + (target.attackBonus || 0));
          });
          if (safeTargets.length === 0) {
            // No safe battle target: hold the attack instead of losing LP needlessly.
            return;
          }
          const target = [...safeTargets].sort((a, b) => {
            const aValue = a.position === 'DEFENSE' ? (a.def || 0) + (a.defenseBonus || 0) : (a.atk || 0) + (a.attackBonus || 0);
            const bValue = b.position === 'DEFENSE' ? (b.def || 0) + (b.defenseBonus || 0) : (b.atk || 0) + (b.attackBonus || 0);
            const aDestroyable = attackerAtk > aValue;
            const bDestroyable = attackerAtk > bValue;
            return Number(bDestroyable) - Number(aDestroyable) || aValue - bValue;
          })[0];
          attacker.hasAttacked = true;
          const targetValue = target.position === 'DEFENSE' ? (target.def || 0) + (target.defenseBonus || 0) : (target.atk || 0) + (target.attackBonus || 0);
          const diff = attackerAtk - targetValue;

          sound.playAttack();
          attackAnim = {
            attackerUid: attacker.uid,
            targetUid: target.uid,
            damage: Math.abs(diff),
            timestamp: Date.now()
          };

          if (target.position === 'DEFENSE') {
            // In Defense Position, a weaker attacker loses LP by DEF - ATK; no defender-controller damage.
            if (diff > 0 && !target.indestructibleByBattle) {
              const pIdx = player.monsters.indexOf(target);
              if (pIdx >= 0) player.monsters[pIdx] = null;
              player.graveyard.push(target);
              sound.playDestroy();
            } else if (diff < 0) {
              ai.lp = Math.max(0, ai.lp + diff);
            }
            const stillThere = player.monsters.find(c => c && c.uid === target.uid);
            if (stillThere) stillThere.faceUp = true;
          } else if (diff > 0) {
            // Battle protection prevents destruction, not battle damage to the controller.
            if (!target.indestructibleByBattle) {
              const pIdx = player.monsters.indexOf(target);
              if (pIdx >= 0) player.monsters[pIdx] = null;
              player.graveyard.push(target);
              sound.playDestroy();
            }
            player.lp = Math.max(0, player.lp - diff);
          } else if (diff < 0) {
            const aIdx = ai.monsters.indexOf(attacker);
            if (aIdx >= 0 && !attacker.indestructibleByBattle) {
              ai.monsters[aIdx] = null;
              ai.graveyard.push(attacker);
              sound.playDestroy();
            }
            ai.lp = Math.max(0, ai.lp + diff);
          } else {
            // Equal ATK destroys only monsters that are not protected from battle destruction.
            const pIdx = player.monsters.indexOf(target);
            const aIdx = ai.monsters.indexOf(attacker);
            if (pIdx >= 0 && !target.indestructibleByBattle) {
              player.monsters[pIdx] = null;
              player.graveyard.push(target);
            }
            if (aIdx >= 0 && !attacker.indestructibleByBattle) {
              ai.monsters[aIdx] = null;
              ai.graveyard.push(attacker);
            }
            sound.playDestroy();
          }
        } else {
          // Direct attack
          attacker.hasAttacked = true;
          const dmg = (attacker.atk || 0) + (attacker.attackBonus || 0) || 1500;
          player.lp = Math.max(0, player.lp - dmg);
          sound.playAttack();
          attackAnim = {
            attackerUid: attacker.uid,
            targetUid: null,
            damage: dmg,
            timestamp: Date.now()
          };
        }
      });

      return {
        ...prev,
        turn: newTurn,
        player,
        ai,
        aiFirstTurnComplete: true,
        lastAttackAnimation: attackAnim,
      };
    });

    addLog('Opponent finished their turn. Your turn begins!');

    setTimeout(() => {
      setState(prev => {
        const player = { ...prev.player };
        if (player.deck.length > 0) {
          sound.playDraw();
          player.hand.push(player.deck.pop()!);
        }
        player.monsters.forEach(m => {
          if (m) {
            m.hasAttacked = false;
            m.hasChangedPosition = false;
          }
        });
        return {
          ...prev,
          activeSide: 'player',
          phase: 'MAIN1',
          normalSummonUsed: false,
        };
      });
    }, 1200);
  };

  // Normal / Tribute Summon request. Special Summons use their own effect paths and never consume this once-per-turn allowance.
  const requestNormalSummon = (card: CardInstance, mode: 'SUMMON' | 'SET') => {
    if (state.normalSummonUsed) {
      addLog('You have already used your Normal Summon/Set this turn.');
      return;
    }

    const isP1 = state.activeSide === 'player';
    const activePlayer = isP1 ? state.player : state.ai;
    const tributesRequired = getRequiredTributes(Number(card.level ?? 1));
    const availableMonsters = activePlayer.monsters.filter((m): m is CardInstance => m !== null);

    if (tributesRequired > 0) {
      if (availableMonsters.length < tributesRequired) {
        addLog(`Cannot Summon ${card.name}: Level ${card.level} requires ${tributesRequired} Tribute(s), but you control ${availableMonsters.length} monster(s).`);
        return;
      }
      // Do not require an empty zone before tributing: the tribute(s) themselves free the slot.
      setTributeState({ card, mode, requiredCount: tributesRequired });
      return;
    }

    if (activePlayer.monsters.every(Boolean)) {
      addLog('No open Monster Zones available.');
      return;
    }
    executeSummon(card, mode, []);
  };

  // Execute a Normal Summon/Set, including Tribute Summons on a full field.
  const executeSummon = (card: CardInstance, mode: 'SUMMON' | 'SET', tributeUids: number[]) => {
    if (state.normalSummonUsed) {
      addLog('You have already used your Normal Summon/Set this turn.');
      return;
    }
    const isP1 = state.activeSide === 'player';
    const activePlayer = isP1 ? state.player : state.ai;
    const requiredTributes = getRequiredTributes(Number(card.level ?? 1));
    if (tributeUids.length !== requiredTributes) {
      addLog(`You must select exactly ${requiredTributes} Tribute(s) for ${card.name}.`);
      return;
    }
    const validTributes = tributeUids.every(uid => activePlayer.monsters.some(m => m?.uid === uid));
    if (!validTributes || new Set(tributeUids).size !== tributeUids.length) {
      addLog('Invalid Tribute selection. Please choose your own monsters currently on the field.');
      return;
    }
    const idx = activePlayer.hand.findIndex(c => c.uid === card.uid);
    if (idx < 0) return;
    const remainingZones = activePlayer.monsters.filter(m => m && !tributeUids.includes(m.uid)).length;
    if (remainingZones >= activePlayer.monsters.length) {
      addLog('No open Monster Zones available after Tributing.');
      return;
    }

    sound.playSummon();
    setState(prev => {
      const curP = isP1
        ? { ...prev.player, hand: [...prev.player.hand], graveyard: [...prev.player.graveyard], monsters: [...prev.player.monsters] }
        : { ...prev.ai, hand: [...prev.ai.hand], graveyard: [...prev.ai.graveyard], monsters: [...prev.ai.monsters] };
      tributeUids.forEach(uid => {
        const mIdx = curP.monsters.findIndex(m => m?.uid === uid);
        if (mIdx >= 0) {
          const t = curP.monsters[mIdx]!;
          curP.monsters[mIdx] = null;
          curP.graveyard.push(t);
        }
      });
      const slot = curP.monsters.findIndex(m => m === null);
      if (slot < 0) return prev;
      const currentHandIndex = curP.hand.findIndex(c => c.uid === card.uid);
      if (currentHandIndex < 0) return prev;
      const [summoned] = curP.hand.splice(currentHandIndex, 1);
      summoned.faceUp = mode === 'SUMMON';
      summoned.position = mode === 'SUMMON' ? 'ATTACK' : 'DEFENSE';
      summoned.placedTurn = prev.turn;
      summoned.hasAttacked = false;
      summoned.summonKind = mode === 'SUMMON' ? 'NORMAL' : 'SET';
      curP.monsters[slot] = summoned;

      if (isOnlineMatch) {
        multiplayer.syncAction('SUMMON', { cardName: card.name, slotIndex: slot, faceUp: mode === 'SUMMON', position: summoned.position });
      }
      return { ...prev, player: isP1 ? curP : prev.player, ai: isP1 ? prev.ai : curP, normalSummonUsed: true };
    });

    const isTribute = tributeUids.length > 0;
    addLog(mode === 'SUMMON'
      ? `Normal Summoned [${card.name}] (ATK ${card.atk} / DEF ${card.def})${isTribute ? ` with ${tributeUids.length} Tribute(s)` : ''}!`
      : `Set [${card.name}] face-down${isTribute ? ` with ${tributeUids.length} Tribute(s)` : ''}.`);
  };

  // Change Position
  const handleChangePosition = (card: CardInstance) => {
    if (card.hasChangedPosition) {
      addLog('This monster has already changed its battle position this turn.');
      return;
    }
    sound.playPhase();
    setState(prev => {
      const isP1 = prev.activeSide === 'player';
      const curP = isP1 ? { ...prev.player } : { ...prev.ai };
      const m = curP.monsters.find(c => c && c.uid === card.uid);
      if (m) {
        if (!m.faceUp) {
          m.faceUp = true;
          m.position = 'ATTACK';
          addLog(`[${m.name}] Flip Summoned in Attack Position!`);
        } else {
          m.position = m.position === 'ATTACK' ? 'DEFENSE' : 'ATTACK';
          addLog(`[${m.name}] switched to ${m.position === 'ATTACK' ? 'Attack Position' : 'Defense Position'}.`);
        }
        m.hasChangedPosition = true;
      }
      return {
        ...prev,
        player: isP1 ? curP : prev.player,
        ai: isP1 ? prev.ai : curP,
      };
    });
  };

  // Activate Spell
  const handleActivateSpell = (card: CardInstance) => {
    sound.playEffectChime();
    const isP1 = state.activeSide === 'player';
    const activePlayer = isP1 ? state.player : state.ai;

    const idx = activePlayer.hand.findIndex(c => c.uid === card.uid);
    if (idx < 0) return;

    // Monster Reborn must let the player choose the exact monster in either Graveyard.
    if (card.name === 'Monster Reborn' && isP1) {
      const candidates = [
        ...state.player.graveyard.filter(c => c.type === 'MONSTER').map(card => ({ card, source: 'playerGY' as const })),
        ...state.ai.graveyard.filter(c => c.type === 'MONSTER').map(card => ({ card, source: 'aiGY' as const })),
      ];
      if (!candidates.length) { addLog('[Monster Reborn] No monster is available in either Graveyard.'); return; }
      if (state.player.monsters.every(Boolean)) { addLog('[Monster Reborn] Your Monster Zones are full.'); return; }
      setState(prev => {
        const player = { ...prev.player, hand: [...prev.player.hand], graveyard: [...prev.player.graveyard] };
        const handIndex = player.hand.findIndex(c => c.uid === card.uid);
        if (handIndex >= 0) player.graveyard.push(player.hand.splice(handIndex, 1)[0]);
        return { ...prev, player };
      });
      setPendingSelection({ title: 'MONSTER REBORN', description: 'Choose exactly which monster in either Graveyard you want to revive.', candidates, effect: 'REBORN' });
      return;
    }

    // Resolve effects against cloned duelists, then commit the mutations to React state.
    // Previously callbacks changed stale state objects, so many implemented card effects only logged text.
    const clonePlayer = (source: PlayerState): PlayerState => ({
      ...source,
      hand: source.hand.map(c => ({ ...c })),
      deck: source.deck.map(c => ({ ...c })),
      graveyard: source.graveyard.map(c => ({ ...c })),
      monsters: source.monsters.map(c => c ? ({ ...c }) : null),
      spells: source.spells.map(c => c ? ({ ...c }) : null),
      extraDeck: source.extraDeck.map(c => ({ ...c })),
      fieldSpell: source.fieldSpell ? ({ ...source.fieldSpell }) : null,
    });
    const ownerCopy = clonePlayer(activePlayer);
    const opponentCopy = clonePlayer(isP1 ? state.ai : state.player);
    const handIndex = ownerCopy.hand.findIndex(c => c.uid === card.uid);
    if (handIndex < 0) return;
    const [playedCard] = ownerCopy.hand.splice(handIndex, 1);

    if (card.subtype === 'Field Spell') {
      sound.playFieldSpell();
      // Yu-Gi-Oh! allows only one Field Spell per player: a newly activated one replaces the old one.
      if (ownerCopy.fieldSpell) ownerCopy.graveyard.push(ownerCopy.fieldSpell);
      playedCard.faceUp = true;
      ownerCopy.fieldSpell = playedCard;
    } else {
      ownerCopy.graveyard.push(playedCard);
    }

    const effectResult = card.activateEffect?.({
      card: playedCard,
      owner: ownerCopy,
      opponent: opponentCopy,
      ownerSide: state.activeSide,
      gameState: state,
      log: addLog,
    });
    const commitEffectState = () => setState(prev => ({
      ...prev,
      player: isP1 ? ownerCopy : opponentCopy,
      ai: isP1 ? opponentCopy : ownerCopy,
    }));
    if (effectResult && typeof (effectResult as Promise<unknown>).then === 'function') {
      (effectResult as Promise<unknown>).then(commitEffectState).catch(err => addLog(`[${card.name}] Effect failed: ${String(err)}`));
    } else {
      commitEffectState();
    }

    if (isOnlineMatch) {
      multiplayer.syncAction('SPELL', { cardName: card.name });
    }
  };

  // Set Spell/Trap
  const handleSetSpellTrap = (card: CardInstance) => {
    const isP1 = state.activeSide === 'player';
    const activePlayer = isP1 ? state.player : state.ai;

    const emptySlot = activePlayer.spells.findIndex(s => s === null);
    if (emptySlot < 0) {
      addLog('All 5 Spell/Trap Zones are occupied.');
      return;
    }
    const idx = activePlayer.hand.findIndex(c => c.uid === card.uid);
    if (idx < 0) return;

    sound.playSummon();
    setState(prev => {
      const curP = isP1 ? { ...prev.player } : { ...prev.ai };
      const [setCard] = curP.hand.splice(idx, 1);
      setCard.faceUp = false;
      setCard.setTurn = prev.turn;
      curP.spells[emptySlot] = setCard;
      return {
        ...prev,
        player: isP1 ? curP : prev.player,
        ai: isP1 ? prev.ai : curP,
      };
    });
    addLog(`Set 1 ${card.type === 'TRAP' ? 'Trap' : 'Spell'} face-down.`);
  };

  // Activate Hand Effect — resolve only for the player's own hand; opponent hands stay private.
  const handleActivateHandEffect = (card: CardInstance) => {
    sound.playEffectChime();
    const owner = state.player;
    const opponent = state.ai;
    if (card.name === 'Elemental HERO Honest Neos') {
      const candidates = owner.monsters.filter((c): c is CardInstance => !!c && c.name.includes('HERO')).map(card => ({ card, source: 'field' as const }));
      if (!candidates.length) { addLog('[Honest Neos] You need a HERO monster on your field.'); return; }
      setPendingSelection({ title: 'HONEST NEOS', description: 'Choose your HERO monster to gain 2500 ATK until the end of this turn.', candidates, effect: 'HONEST_NEOS' });
      return;
    }
    card.handEffect?.({ card, owner, opponent, ownerSide: 'player', gameState: state, log: addLog });
    setState(prev => ({ ...prev, player: { ...prev.player, hand: [...prev.player.hand], graveyard: [...prev.player.graveyard] }, ai: { ...prev.ai, monsters: [...prev.ai.monsters] } }));
  };

  // GY effects that select a card always open a choice popup instead of silently taking the first card.
  const handleActivateGyEffect = (card: CardInstance) => {
    sound.playEffectChime();
    const owner = gyOwnerSide === 'player' ? state.player : state.ai;
    const opponent = gyOwnerSide === 'player' ? state.ai : state.player;
    if (card.name === 'Prank-Kids Rocksies') {
      const candidates = owner.hand.map(card => ({ card, source: 'hand' as const }));
      if (!candidates.length) { addLog('[Prank-Kids Rocksies] You have no card in your hand to banish.'); return; }
      setPendingSelection({ title: 'PRANK-KIDS ROCKSIES', description: 'Choose the card from your hand to banish for this effect.', candidates, effect: 'ROCKSIES_BANISH' });
      return;
    }
    if (card.name === 'Prank-Kids Dropsies') {
      const candidates = [
        ...owner.hand.filter(c => c.name.startsWith('Prank-Kids') && c.name !== card.name).map(card => ({ card, source: 'hand' as const })),
        ...owner.deck.filter(c => c.name.startsWith('Prank-Kids') && c.name !== card.name).map(card => ({ card, source: 'deck' as const })),
      ];
      if (!candidates.length) { addLog('[Prank-Kids Dropsies] No eligible Prank-Kids monster in hand or Deck.'); return; }
      setPendingSelection({ title: 'PRANK-KIDS DROPSIES', description: 'Choose a Prank-Kids monster to Special Summon in Defense Position.', candidates, effect: 'DROPSIES' });
      return;
    }
    card.gyEffect?.({ card, owner, opponent, ownerSide: gyOwnerSide, gameState: state, log: addLog });
    setState(prev => ({ ...prev, player: { ...prev.player, hand: [...prev.player.hand], graveyard: [...prev.player.graveyard], monsters: [...prev.player.monsters] }, ai: { ...prev.ai, hand: [...prev.ai.hand], graveyard: [...prev.ai.graveyard], monsters: [...prev.ai.monsters] } }));
  };

  // Activate Monster Effect — resolve on cloned duel state and commit all effect mutations.
  const handleActivateMonsterSkill = (card: CardInstance) => {
    sound.playEffectChime();
    if (card.name === 'Monster Reborn') {
      const candidates = [
        ...state.player.graveyard.filter(c => c.type === 'MONSTER').map(card => ({ card, source: 'playerGY' as const })),
        ...state.ai.graveyard.filter(c => c.type === 'MONSTER').map(card => ({ card, source: 'aiGY' as const })),
      ];
      if (!candidates.length) { addLog('[Monster Reborn] No monster is available in either Graveyard.'); return; }
      if (state.player.monsters.every(Boolean)) { addLog('[Monster Reborn] Your Monster Zones are full.'); return; }
      setPendingSelection({ title: 'MONSTER REBORN', description: 'Choose exactly which monster in either Graveyard you want to revive.', candidates, effect: 'REBORN' });
      return;
    }
    const isP1 = state.activeSide === 'player';
    const clonePlayer = (source: PlayerState): PlayerState => ({
      ...source,
      hand: source.hand.map(c => ({ ...c })),
      deck: source.deck.map(c => ({ ...c })),
      graveyard: source.graveyard.map(c => ({ ...c })),
      monsters: source.monsters.map(c => c ? ({ ...c }) : null),
      spells: source.spells.map(c => c ? ({ ...c }) : null),
      extraDeck: source.extraDeck.map(c => ({ ...c })),
      fieldSpell: source.fieldSpell ? ({ ...source.fieldSpell }) : null,
    });
    const ownerCopy = clonePlayer(isP1 ? state.player : state.ai);
    const opponentCopy = clonePlayer(isP1 ? state.ai : state.player);
    const fieldCard = ownerCopy.monsters.find(m => m && m.uid === card.uid)
      || (ownerCopy.fieldSpell?.uid === card.uid ? ownerCopy.fieldSpell : null);
    if (!fieldCard) { addLog(`[${card.name}] This card is no longer on your field.`); return; }
    const result = fieldCard.activateEffect?.({
      card: fieldCard,
      owner: ownerCopy,
      opponent: opponentCopy,
      ownerSide: state.activeSide,
      gameState: state,
      log: addLog,
    });
    const commit = () => setState(prev => ({
      ...prev,
      player: isP1 ? ownerCopy : opponentCopy,
      ai: isP1 ? opponentCopy : ownerCopy,
    }));
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).then(commit).catch(err => addLog(`[${card.name}] Effect failed: ${String(err)}`));
    } else {
      commit();
    }
  };

  // Extra Deck Summon: validate and consume materials before checking for a free zone.
  // This is important when the field is full: using field monsters as materials frees zones.
  const handleSummonExtraMonster = (extraCard: CardInstance, materialUids: number[]) => {
    const isP1 = state.activeSide === 'player';
    if (!extraCard.extraKind || materialUids.length === 0 || new Set(materialUids).size !== materialUids.length) {
      addLog('Choose valid materials before confirming the Extra Deck Summon.');
      return;
    }
    let succeeded = false;
    setState(prev => {
      const curP = isP1
        ? { ...prev.player, hand: [...prev.player.hand], extraDeck: [...prev.player.extraDeck], monsters: [...prev.player.monsters], graveyard: [...prev.player.graveyard] }
        : { ...prev.ai, hand: [...prev.ai.hand], extraDeck: [...prev.ai.extraDeck], monsters: [...prev.ai.monsters], graveyard: [...prev.ai.graveyard] };
      const extraIdx = curP.extraDeck.findIndex(c => c.uid === extraCard.uid);
      if (extraIdx < 0) return prev;

      const fieldMaterials = materialUids.map(uid => curP.monsters.find(m => m?.uid === uid && m.faceUp)).filter((m): m is CardInstance => Boolean(m));
      const handMaterials = materialUids.map(uid => curP.hand.find(m => m.uid === uid && m.type === 'MONSTER')).filter((m): m is CardInstance => Boolean(m));
      const resolvedMaterials = materialUids.map(uid => fieldMaterials.find(m => m.uid === uid) || (extraCard.extraKind === 'FUSION' ? handMaterials.find(m => m.uid === uid) : undefined));
      if (resolvedMaterials.some(m => !m) || resolvedMaterials.length !== materialUids.length) {
        addLog('Some selected materials are no longer available. Please select them again.');
        return prev;
      }

      // Remove the selected materials first so they can free space on a full field.
      for (const uid of materialUids) {
        const mIdx = curP.monsters.findIndex(m => m?.uid === uid);
        if (mIdx >= 0) {
          const mat = curP.monsters[mIdx]!;
          curP.monsters[mIdx] = null;
          if (extraCard.extraKind === 'XYZ') {
            // Keep the Xyz materials attached to the summoned monster below.
          } else {
            curP.graveyard.push(mat);
          }
        } else {
          const hIdx = curP.hand.findIndex(h => h.uid === uid);
          if (hIdx >= 0 && extraCard.extraKind === 'FUSION') curP.graveyard.push(curP.hand.splice(hIdx, 1)[0]);
        }
      }

      const emptySlot = curP.monsters.findIndex(m => m === null);
      const emz = prev.extraMonsterZone.findIndex(m => m === null);
      if (emptySlot < 0 && emz < 0) {
        addLog('No available Monster Zone or Extra Monster Zone after using the selected materials.');
        return prev;
      }

      const [summoned] = curP.extraDeck.splice(extraIdx, 1);
      summoned.faceUp = true;
      summoned.position = 'ATTACK';
      summoned.hasAttacked = false;
      summoned.placedTurn = prev.turn;
      if (extraCard.extraKind === 'XYZ') {
        resolvedMaterials.forEach(mat => { if (mat) summoned.materials.push(mat); });
      }
      if (emptySlot >= 0) curP.monsters[emptySlot] = summoned;

      const nextExtraZones = [...prev.extraMonsterZone];
      if (emptySlot < 0 && emz >= 0) nextExtraZones[emz] = summoned;
      if (isOnlineMatch) {
        multiplayer.syncAction('SUMMON', {
          cardName: extraCard.name,
          slotIndex: emptySlot >= 0 ? emptySlot : 0,
          faceUp: true,
          position: 'ATTACK',
        });
      }
      succeeded = true;
      return {
        ...prev,
        player: isP1 ? curP : prev.player,
        ai: isP1 ? prev.ai : curP,
        extraMonsterZone: nextExtraZones,
      };
    });
    // State updates are queued; modal validates the selection before calling this handler.
    addLog(`SPECIAL SUMMON! [${extraCard.name}] (${extraCard.extraKind}) descends onto the field!`);
  };

  // Combat Execution (Targeted Monster or Direct Attack)
  const executeAttack = (attackerUid: number, targetUid: number | null) => {
    const isP1 = state.activeSide === 'player';
    const attackingPlayer = isP1 ? state.player : state.ai;
    const defendingPlayer = isP1 ? state.ai : state.player;

    const attacker = attackingPlayer.monsters.find(m => m && m.uid === attackerUid);
    if (!attacker) return;

    // CPU Trap response: a previously Set Mirror Force activates when the player declares an attack.
    if (isP1) {
      const mirrorForceIdx = state.ai.spells.findIndex(c => c && !c.faceUp && /mirror force/i.test(c.name));
      if (mirrorForceIdx >= 0) {
        setState(prev => {
          const ai = { ...prev.ai, spells: [...prev.ai.spells], monsters: [...prev.ai.monsters], graveyard: [...prev.ai.graveyard] };
          const trap = ai.spells[mirrorForceIdx];
          if (!trap || trap.faceUp) return prev;
          ai.spells[mirrorForceIdx] = null;
          ai.graveyard.push(trap);
          ai.monsters.forEach((m, idx) => {
            if (m && m.position === 'ATTACK') { ai.graveyard.push(m); ai.monsters[idx] = null; }
          });
          return { ...prev, ai };
        });
        addLog(`${state.ai.name} activated [Mirror Force]! Your attack-position monsters were destroyed.`);
        sound.playEffectChime();
        return;
      }
    }

    sound.playAttack();

    if (targetUid !== null) {
      const target = defendingPlayer.monsters.find(m => m && m.uid === targetUid);
      if (!target) return;

      const totalAtk = (attacker.atk ?? 0) + (attacker.attackBonus || 0);
      const targetVal = target.position === 'ATTACK' 
        ? (target.atk ?? 0) + (target.attackBonus || 0) 
        : (target.def ?? 0) + (target.defenseBonus || 0);
      const diff = totalAtk - targetVal;
      const marshmallonFlipDamage = target.name === 'Marshmallon' && !target.faceUp ? 1000 : 0;

      setState(prev => {
        const attP = isP1 ? { ...prev.player } : { ...prev.ai };
        const defP = isP1 ? { ...prev.ai } : { ...prev.player };

        const attMonster = attP.monsters.find(m => m && m.uid === attackerUid);
        if (attMonster) attMonster.hasAttacked = true;

        if (target.position === 'ATTACK') {
          if (diff > 0) {
            // Battle protection prevents destruction, not battle damage to the controller.
            if (!target.indestructibleByBattle) {
              const tIdx = defP.monsters.findIndex(m => m && m.uid === targetUid);
              if (tIdx >= 0) {
                const dest = defP.monsters[tIdx]!;
                defP.monsters[tIdx] = null;
                defP.graveyard.push(dest);
              }
              sound.playDestroy();
            }
            defP.lp = Math.max(0, defP.lp - diff);
          } else if (diff < 0) {
            const aIdx = attP.monsters.findIndex(m => m && m.uid === attackerUid);
            if (aIdx >= 0 && !attacker.indestructibleByBattle) {
              const dest = attP.monsters[aIdx]!;
              attP.monsters[aIdx] = null;
              attP.graveyard.push(dest);
            }
            attP.lp = Math.max(0, attP.lp + diff);
            sound.playDestroy();
          } else {
            const tIdx = defP.monsters.findIndex(m => m && m.uid === targetUid);
            const aIdx = attP.monsters.findIndex(m => m && m.uid === attackerUid);
            if (tIdx >= 0 && !target.indestructibleByBattle) {
              const dest = defP.monsters[tIdx]!; defP.monsters[tIdx] = null; defP.graveyard.push(dest);
            }
            if (aIdx >= 0 && !attacker.indestructibleByBattle) {
              const dest = attP.monsters[aIdx]!; attP.monsters[aIdx] = null; attP.graveyard.push(dest);
            }
            sound.playDestroy();
          }
        } else {
          // Defense Position: the attacker loses LP equal to DEF - ATK when weaker;
          // stronger ATK destroys the defender (unless protected), but causes no LP damage.
          if (diff > 0 && !target.indestructibleByBattle) {
            const tIdx = defP.monsters.findIndex(m => m && m.uid === targetUid);
            if (tIdx >= 0) {
              const dest = defP.monsters[tIdx]!; defP.monsters[tIdx] = null; defP.graveyard.push(dest);
            }
            sound.playDestroy();
          } else if (diff < 0) {
            attP.lp = Math.max(0, attP.lp + diff);
          }
          // Flip a face-down defense monster face-up after damage calculation.
          const flipped = defP.monsters.find(m => m && m.uid === targetUid);
          if (flipped) flipped.faceUp = true;
        }

        if (marshmallonFlipDamage > 0) {
          attP.lp = Math.max(0, attP.lp - marshmallonFlipDamage);
          const flipped = defP.monsters.find(m => m && m.uid === targetUid);
          if (flipped) flipped.faceUp = true;
        }

        if (isOnlineMatch) {
          multiplayer.syncAction('ATTACK', {
            attackerUid: attacker.uid,
            targetUid: target.uid,
            damage: Math.abs(diff),
          });
        }

        return {
          ...prev,
          player: isP1 ? attP : defP,
          ai: isP1 ? defP : attP,
          selectedAttackerUid: null,
          lastAttackAnimation: {
            attackerUid: attacker.uid,
            targetUid: target.uid,
            damage: Math.abs(diff),
            timestamp: Date.now()
          }
        };
      });

      addLog(`[${attacker.name}] attacked [${target.name}]! Battle damage: ${Math.abs(diff)}.`);
    } else {
      // DIRECT ATTACK
      const totalAtk = (attacker.atk ?? 0) + (attacker.attackBonus || 0);
      setState(prev => {
        const attP = isP1 ? { ...prev.player } : { ...prev.ai };
        const defP = isP1 ? { ...prev.ai } : { ...prev.player };

        const attMonster = attP.monsters.find(m => m && m.uid === attackerUid);
        if (attMonster) attMonster.hasAttacked = true;

        defP.lp = Math.max(0, defP.lp - totalAtk);

        if (isOnlineMatch) {
          multiplayer.syncAction('ATTACK', {
            attackerUid: attacker.uid,
            targetUid: null,
            damage: totalAtk,
          });
        }

        return {
          ...prev,
          player: isP1 ? attP : defP,
          ai: isP1 ? defP : attP,
          selectedAttackerUid: null,
          lastAttackAnimation: {
            attackerUid: attacker.uid,
            targetUid: null,
            damage: totalAtk,
            timestamp: Date.now()
          }
        };
      });
      addLog(`DIRECT ATTACK! [${attacker.name}] struck ${defendingPlayer.name} directly for ${totalAtk} damage!`);
    }
  };

  // Card click interaction
  const handleCardClick = (
    card: CardInstance,
    side: 'player' | 'ai',
    location: 'monsters' | 'spells' | 'fieldSpell' | 'emz',
    index: number
  ) => {
    setState(prev => ({ ...prev, selectedCardUid: card.uid }));

    const isP1 = state.activeSide === 'player';

    // Battle targeting
    if (state.phase === 'BATTLE') {
      // If active side clicks opposing side monster
      if (side !== state.activeSide && location === 'monsters' && state.selectedAttackerUid) {
        executeAttack(state.selectedAttackerUid, card.uid);
        return;
      }
      // If active side clicks own monster: select attacker!
      if (side === state.activeSide && location === 'monsters') {
        if (card.faceUp && card.position === 'ATTACK' && !card.hasAttacked) {
          sound.playPhase();
          setState(prev => ({
            ...prev,
            selectedAttackerUid: prev.selectedAttackerUid === card.uid ? null : card.uid,
          }));
          addLog(`Selected [${card.name}] as attacker. Select target monster or declare Direct Attack!`);
          return;
        }
      }
    }

    // Card actions menu
    if (side === state.activeSide) {
      const actions: CardActionItem[] = [];

      if (location === 'monsters') {
        actions.push({
          label: card.faceUp ? 'Change Battle Position' : 'Flip Summon',
          desc: card.faceUp ? `Switch to ${card.position === 'ATTACK' ? 'Defense' : 'Attack'} Position` : 'Flip face-up into Attack Position',
          run: () => handleChangePosition(card),
        });

        if (card.activateEffect) {
          actions.push({
            label: 'Activate Monster Effect',
            desc: card.text.slice(0, 45) + '...',
            tone: 'primary',
            run: () => handleActivateMonsterSkill(card),
          });
        }
      }

      if (actions.length > 0) {
        setActionCard(card);
        setActionList(actions);
      }
    }
  };

  // Hand card clicked
  const handleHandCardAction = (card: CardInstance) => {
    setState(prev => ({ ...prev, selectedCardUid: card.uid }));
    const actions: CardActionItem[] = [];
    const isMainPhase = state.phase === 'MAIN1' || state.phase === 'MAIN2';

    if (card.type === 'MONSTER') {
      if (!state.normalSummonUsed && isMainPhase) {
        const tributes = getRequiredTributes(card.level || 1);
        actions.push({
          label: tributes > 0 ? `Tribute Summon (${tributes} Tribute${tributes > 1 ? 's' : ''})` : 'Normal Summon',
          desc: `Level ${card.level} · ATK ${card.atk} / DEF ${card.def}`,
          tone: 'primary',
          run: () => setPendingSummonChoice(card),
        });
        actions.push({
          label: tributes > 0 ? `Tribute Set (${tributes} Tribute${tributes > 1 ? 's' : ''})` : 'Set Monster',
          desc: 'Place face-down in Defense Position',
          run: () => setPendingSummonChoice(card),
        });
      }

      if (card.hasHandEffect) {
        actions.push({
          label: 'Activate Hand Effect',
          desc: card.text.slice(0, 50) + '...',
          tone: 'purple',
          run: () => handleActivateHandEffect(card),
        });
      }
    } else if (card.type === 'SPELL') {
      if (isMainPhase) {
        actions.push({
          label: card.subtype === 'Field Spell' ? 'Activate Field Spell' : 'Activate Spell',
          desc: card.text.slice(0, 50) + '...',
          tone: 'primary',
          run: () => handleActivateSpell(card),
        });
        if (card.subtype !== 'Field Spell') {
          actions.push({
            label: 'Set Spell Face-down',
            desc: 'Place face-down in Spell/Trap Zone',
            run: () => handleSetSpellTrap(card),
          });
        }
      }
    } else if (card.type === 'TRAP') {
      if (isMainPhase) {
        actions.push({
          label: 'Set Trap Face-down',
          desc: 'Place face-down. Can be activated starting next turn.',
          tone: 'purple',
          run: () => handleSetSpellTrap(card),
        });
      }
    }

    if (actions.length > 0) {
      setActionCard(card);
      setActionList(actions);
    }
  };

  // Screen Switching & Modals Rendering
  if (screen === 'MENU') {
    return (
      <>
        <MainMenu
          onOpenSoloMode={() => setIsCpuSelectModalOpen(true)}
          onOpenOnlinePvp={() => setIsOnlineModalOpen(true)}
          onOpenLocal2P={() => setIsLocal2PModalOpen(true)}
          onOpenSurvival={() => setIsSurvivalModalOpen(true)}
          onContinueDuel={() => setScreen('DUEL')}
          onOpenDeckEditor={() => setScreen('DECK_BUILDER')}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenWiki={() => setIsWikiModalOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardModalOpen(true)}
          onOpenDeployGuide={() => setIsDeployGuideModalOpen(true)}
          canContinue={canContinue}
        />

        {/* Mode 1 Modal */}
        <CpuSelectModal
          isOpen={isCpuSelectModalOpen}
          onClose={() => setIsCpuSelectModalOpen(false)}
          onSelectCpu={(opp, isPractice) => handleStartSoloDuel(opp, isPractice)}
        />

        {/* Mode 2 Modal */}
        <OnlineRoomModal
          isOpen={isOnlineModalOpen}
          onClose={() => setIsOnlineModalOpen(false)}
          playerName={userProfile.name}
          deckConfig={deckConfig}
          onStartOnlineDuel={handleStartOnlineDuel}
        />

        {/* Mode 3 Modal */}
        <Local2PModal
          isOpen={isLocal2PModalOpen}
          onClose={() => setIsLocal2PModalOpen(false)}
          onStartLocalDuel={handleStartLocalDuel}
          defaultP1Name={userProfile.name}
        />

        {/* Mode 4 Modal */}
        <SurvivalModal
          isOpen={isSurvivalModalOpen}
          onClose={() => setIsSurvivalModalOpen(false)}
          onStartSurvival={handleStartSurvival}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSelectDeckSlot={(slot: DeckSlot) => {
            setDeckConfig({ main: slot.main, extra: slot.extra });
            addLog(`Equipped Deck Slot: ${slot.name}`);
          }}
          currentDeck={deckConfig}
        />

        <LeaderboardModal
          isOpen={isLeaderboardModalOpen}
          onClose={() => setIsLeaderboardModalOpen(false)}
        />

        <CardWikiModal
          isOpen={isWikiModalOpen}
          onClose={() => setIsWikiModalOpen(false)}
        />

        <DeployGuideModal
          isOpen={isDeployGuideModalOpen}
          onClose={() => setIsDeployGuideModalOpen(false)}
        />
      </>
    );
  }

  if (screen === 'DECK_BUILDER') {
    return (
      <DeckBuilder
        onBackToMenu={() => setScreen('MENU')}
        onDeckUpdated={(cfg) => setDeckConfig(cfg)}
      />
    );
  }

  // Active player hand determination
  const activeHand = state.player.hand;
  const activeDuelistName = state.player.name;

  // DUEL ARENA SCREEN
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#040810] font-sans select-none text-white">
      {/* 1. THREE.JS 3D BATTLEFIELD & 3D CHARACTER HOLOGRAMS */}
      <ThreeBattlefield
        state={state}
        onZoneClick={(side, type, idx) => {}}
        onEMZClick={() => setIsExtraOpen(true)}
      />

      {/* 2. 2D INTERACTIVE ZONE OVERLAY & CENTER PHASE CONTROLLER */}
      <BattlefieldOverlay
        state={state}
        onCardClick={handleCardClick}
        onZoneClick={(side, location, index) => {
          if (state.phase === 'BATTLE' && state.selectedAttackerUid) {
            const isP1 = state.activeSide === 'player';
            const opposingMonsters = isP1 ? state.ai.monsters : state.player.monsters;
            if (!opposingMonsters.some(Boolean)) {
              executeAttack(state.selectedAttackerUid, null);
            }
          }
        }}
        onEmzClick={(idx) => setIsExtraOpen(true)}
        onAdvancePhase={handleAdvancePhase}
        onEndTurn={handleEndTurn}
        onInspectCard={(c) => setState(prev => ({ ...prev, selectedCardUid: c.uid }))}
        onDirectAttack={() => {
          if (state.selectedAttackerUid) {
            executeAttack(state.selectedAttackerUid, null);
          }
        }}
      />

      {/* 3. LEFT MASTER DUEL CARD INSPECTOR */}
      <div className="fixed top-20 left-5 z-20 pointer-events-auto hidden md:block">
        <CardInspector
          card={selectedCard}
          onActivateEffect={handleActivateMonsterSkill}
          onActivateHandEffect={handleActivateHandEffect}
          onActivateGyEffect={handleActivateGyEffect}
          location="field"
        />
      </div>

      {/* 4. DUELIST HEADERS */}
      <DuelistHeader
        player={state.ai}
        side="ai"
        isActiveTurn={state.activeSide === 'ai'}
        onOpenGy={() => {
          setGyOwnerSide('ai');
          setIsGyOpen(true);
        }}
      />

      <DuelistHeader
        player={state.player}
        side="player"
        isActiveTurn={state.activeSide === 'player'}
        onOpenGy={() => {
          setGyOwnerSide('player');
          setIsGyOpen(true);
        }}
        onOpenExtra={() => setIsExtraOpen(true)}
      />

      {/* Opponent hand is represented by card backs only; never reveal CPU/remote player's cards. */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
        <div className={`px-3 py-1 rounded-full border text-[10px] tracking-widest font-['Orbitron'] font-black ${state.activeSide === 'ai' ? 'bg-rose-950/90 border-rose-400 text-rose-200 shadow-[0_0_18px_rgba(244,63,94,.45)]' : 'bg-[#091827]/85 border-sky-500/60 text-sky-200'}`}>
          {state.ai.name.toUpperCase()} · {state.activeSide === 'ai' ? 'CURRENTLY PLAYING' : 'WAITING'} · {state.phase} PHASE
        </div>
        <div className="flex items-end justify-center h-14">
          {Array.from({ length: Math.min(state.ai.hand.length, 10) }).map((_, i) => (
            <div key={i} className="w-7 h-10 -ml-2 first:ml-0 rounded border border-amber-400/70 bg-gradient-to-br from-[#243c68] via-[#101e3d] to-[#571f38] shadow-lg flex items-center justify-center" style={{ transform: `rotate(${(i - (Math.min(state.ai.hand.length, 10)-1)/2) * 3}deg)` }}>
              <div className="w-5 h-8 rounded-sm border border-amber-300/40 bg-[repeating-linear-gradient(45deg,#18294c,#18294c_3px,#253d68_3px,#253d68_6px)]" />
            </div>
          ))}
        </div>
        <span className="text-[9px] text-slate-300/80 font-['Orbitron']">OPPONENT HAND · {state.ai.hand.length} CARD(S) · FACE-DOWN</span>
      </div>

      {/* 5. PLAYER'S HAND — always only your own cards, even during opponent's turn */}
      <PlayerHand
        hand={activeHand}
        selectedCardUid={state.selectedCardUid}
        onSelectCard={(c) => { if (state.activeSide === 'player') setState(prev => ({ ...prev, selectedCardUid: c.uid })); }}
        onCardAction={(c) => { if (state.activeSide === 'player') handleHandCardAction(c); }}
        ownerName={activeDuelistName}
        isLocal2P={false}
        activeSide="player"
      />

      {/* 6. STATUS LOG BANNER */}
      <DuelLogBanner logs={state.logs} />

      {/* 7. TOP BAR CONTROLS WITH CURRENT MODE BADGE */}
      <div className="fixed top-5 left-5 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            sound.playPhase();
            setScreen('MENU');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0a1826]/90 border border-[#2b516b] text-xs font-['Orbitron'] font-bold text-stone-200 hover:text-white hover:border-amber-400 transition-colors shadow"
          title="Return to Main Menu"
        >
          <Home className="w-3.5 h-3.5" />
          <span>MENU</span>
        </button>

        {/* MODE SPECIFIC BADGE */}
        {state.gameMode === 'SURVIVAL' && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/70 text-xs font-['Orbitron'] font-black text-rose-300 shadow">
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>TOWER STAGE {state.survivalStage || 1}/5 · SCORE: {state.survivalScore || 0}</span>
          </div>
        )}

        {state.gameMode === 'LOCAL_2P' && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/70 text-xs font-['Orbitron'] font-black text-purple-300 shadow">
            <Users className="w-3.5 h-3.5 fill-current" />
            <span>LOCAL 2P: {activeDuelistName}'S TURN</span>
          </div>
        )}

        {state.gameMode === 'ONLINE_PVP' && onlineRoomCode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-xs font-['Orbitron'] font-bold text-emerald-300 animate-pulse">
            <Wifi className="w-3.5 h-3.5" />
            <span>ROOM #{onlineRoomCode}</span>
          </div>
        )}

        {state.gameMode === 'SOLO_AI' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-xs font-['Orbitron'] font-bold text-amber-300">
            <Swords className="w-3.5 h-3.5" />
            <span>VS {state.ai.name.toUpperCase()}</span>
          </div>
        )}

        {state.gameMode === 'PRACTICE' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/60 text-xs font-['Orbitron'] font-bold text-teal-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRACTICE TRIAL</span>
          </div>
        )}

        <button
          onClick={() => setIsWikiModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a1826]/90 border border-[#2b516b] text-xs font-['Orbitron'] font-bold text-sky-300 hover:text-white hover:border-sky-400 transition-colors shadow"
          title="Open Card Wiki"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>WIKI</span>
        </button>

        <button
          onClick={() => {
            const muted = sound.toggleMute();
            setIsMuted(muted);
          }}
          className="w-9 h-9 rounded-full bg-[#0a1826]/90 border border-[#2b516b] flex items-center justify-center text-stone-300 hover:text-white transition-colors shadow"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>

        <button
          onClick={() => {
            if (state.gameMode === 'SURVIVAL') handleStartSurvival();
            else if (state.gameMode === 'LOCAL_2P') {
              handleStartLocalDuel(state.player.name, state.ai.name, deckConfig, deckConfig, true);
            } else {
              handleStartSoloDuel();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a1826]/90 border border-[#2b516b] text-xs font-['Orbitron'] font-bold text-amber-300 hover:text-white transition-colors shadow"
          title="Restart Duel"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESTART</span>
        </button>
      </div>

      {/* 8. MODALS */}
      <GraveyardModal
        isOpen={isGyOpen}
        onClose={() => setIsGyOpen(false)}
        graveyard={gyOwnerSide === 'player' ? state.player.graveyard : state.ai.graveyard}
        ownerName={gyOwnerSide === 'player' ? state.player.name : state.ai.name}
        isPlayerGy={gyOwnerSide === 'player'}
        onActivateGyEffect={handleActivateGyEffect}
        onSelectInspect={(c) => setState(prev => ({ ...prev, selectedCardUid: c.uid }))}
      />

      <ExtraDeckModal
        isOpen={isExtraOpen}
        onClose={() => setIsExtraOpen(false)}
        player={state.activeSide === 'player' ? state.player : state.ai}
        onSummonExtraMonster={handleSummonExtraMonster}
        onSelectInspect={(c) => setState(prev => ({ ...prev, selectedCardUid: c.uid }))}
      />

      {pendingSummonChoice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-sky-500/60 bg-[#091524] p-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <img src={pendingSummonChoice.art} alt={pendingSummonChoice.name} className="w-28 rounded-lg border border-sky-400/40 object-contain" />
              <div className="min-w-0 flex-1">
                <h2 className="font-['Cinzel'] text-lg font-bold text-amber-200">{pendingSummonChoice.name}</h2>
                <p className="mt-1 text-xs text-sky-200">{pendingSummonChoice.subtype || pendingSummonChoice.type} · Level {pendingSummonChoice.level ?? '—'}</p>
                <p className="mt-2 text-xs leading-relaxed text-stone-300">{pendingSummonChoice.text || 'No effect text.'}</p>
                {pendingSummonChoice.type === 'MONSTER' && <p className="mt-2 text-xs font-bold text-white">ATK {pendingSummonChoice.atk ?? 0} / DEF {pendingSummonChoice.def ?? 0}</p>}
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-200">Choose how to place this monster:</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => { const c = pendingSummonChoice; setPendingSummonChoice(null); requestNormalSummon(c, 'SUMMON'); }} className="rounded-xl border border-amber-400 bg-amber-500 px-3 py-3 text-sm font-bold text-black hover:bg-amber-400">✓ Face-up Attack</button>
              <button onClick={() => { const c = pendingSummonChoice; setPendingSummonChoice(null); requestNormalSummon(c, 'SET'); }} className="rounded-xl border border-sky-500 bg-sky-950 px-3 py-3 text-sm font-bold text-sky-100 hover:bg-sky-900">▣ Face-down Defense</button>
            </div>
            <button onClick={() => setPendingSummonChoice(null)} className="mt-3 w-full rounded-lg border border-rose-500/60 py-2 text-sm text-rose-200 hover:bg-rose-950/60">✕ Cancel</button>
          </div>
        </div>
      )}

      <CardActionDialog
        card={actionCard}
        actions={actionList}
        onClose={() => setActionCard(null)}
      />

      <TributeModal
        key={tributeState?.card.uid ?? 'no-tribute'}
        cardToSummon={tributeState?.card || null}
        mode={tributeState?.mode || 'SUMMON'}
        requiredCount={tributeState?.requiredCount || 1}
        availableMonsters={(state.activeSide === 'player' ? state.player.monsters : state.ai.monsters).filter((m): m is CardInstance => m !== null)}
        onConfirm={(tributeUids) => {
          if (tributeState) {
            executeSummon(tributeState.card, tributeState.mode, tributeUids);
            setTributeState(null);
          }
        }}
        onCancel={() => setTributeState(null)}
      />

      {pendingSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-amber-400/70 bg-[#081525] shadow-[0_0_50px_rgba(245,158,11,.2)]">
            <div className="px-5 py-4 border-b border-sky-900 flex items-start justify-between gap-4">
              <div><h2 className="font-['Orbitron'] text-amber-200 font-black tracking-widest">{pendingSelection.title}</h2><p className="text-sm text-slate-300 mt-1">{pendingSelection.description}</p></div>
              <button onClick={() => setPendingSelection(null)} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm">Cancel</button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[65vh]">
              {pendingSelection.candidates.map((candidate, idx) => (
                <button key={`${candidate.card.uid}-${candidate.source}-${idx}`} onClick={() => {
                  const choice = candidate;
                  if (pendingSelection.effect === 'HONEST_NEOS') {
                    setState(prev => {
                      const player = { ...prev.player, hand: [...prev.player.hand], graveyard: [...prev.player.graveyard], monsters: [...prev.player.monsters] };
                      const handIndex = player.hand.findIndex(c => c.name === 'Elemental HERO Honest Neos');
                      if (handIndex >= 0) player.graveyard.push(player.hand.splice(handIndex, 1)[0]);
                      const targetIndex = player.monsters.findIndex(c => c && c.uid === choice.card.uid);
                      if (targetIndex >= 0 && player.monsters[targetIndex]) player.monsters[targetIndex]!.attackBonus += 2500;
                      return { ...prev, player };
                    });
                    addLog(`[Honest Neos] ${choice.card.name} gains 2500 ATK until the end of the turn.`);
                  } else if (pendingSelection.effect === 'ROCKSIES_BANISH') {
                    const ownerSide = gyOwnerSide;
                    const owner = ownerSide === 'player' ? state.player : state.ai;
                    const opponent = ownerSide === 'player' ? state.ai : state.player;
                    const rocksies = owner.graveyard.find(c => c.name === 'Prank-Kids Rocksies');
                    if (!rocksies || !owner.hand.some(c => c.uid === choice.card.uid)) {
                      addLog('[Prank-Kids Rocksies] The selected card is no longer available.');
                      setPendingSelection(null);
                      return;
                    }
                    rocksies.gyEffect?.({ card: rocksies, owner, opponent, ownerSide, gameState: state, log: addLog, selectedBanishCard: choice.card });
                    setState(prev => ownerSide === 'player'
                      ? { ...prev, player: { ...prev.player, hand: [...prev.player.hand], deck: [...prev.player.deck], graveyard: [...prev.player.graveyard], banished: [...prev.player.banished], monsters: [...prev.player.monsters] } }
                      : { ...prev, ai: { ...prev.ai, hand: [...prev.ai.hand], deck: [...prev.ai.deck], graveyard: [...prev.ai.graveyard], banished: [...prev.ai.banished], monsters: [...prev.ai.monsters] } });
                    addLog(`[Prank-Kids Rocksies] You chose ${choice.card.name} to banish.`);
                  } else if (pendingSelection.effect === 'DROPSIES') {
                    const owner = gyOwnerSide === 'player' ? state.player : state.ai;
                    const empty = owner.monsters.findIndex(m => m === null);
                    if (empty < 0) { addLog('No empty Monster Zone available.'); setPendingSelection(null); return; }
                    setState(prev => {
                      const nextOwner = gyOwnerSide === 'player' ? { ...prev.player, hand: [...prev.player.hand], deck: [...prev.player.deck], monsters: [...prev.player.monsters] } : { ...prev.ai, hand: [...prev.ai.hand], deck: [...prev.ai.deck], monsters: [...prev.ai.monsters] };
                      const list = choice.source === 'hand' ? nextOwner.hand : nextOwner.deck;
                      const idxCard = list.findIndex(c => c.uid === choice.card.uid);
                      if (idxCard >= 0) { const [picked] = list.splice(idxCard, 1); picked.faceUp = true; picked.position = 'DEFENSE'; picked.summonKind = 'SPECIAL'; picked.hasAttacked = false; nextOwner.monsters[empty] = picked; }
                      nextOwner.lp = Math.min(8000, nextOwner.lp + 1000);
                      return gyOwnerSide === 'player' ? { ...prev, player: nextOwner } : { ...prev, ai: nextOwner };
                    });
                    addLog(`[Prank-Kids Dropsies] gained 1000 LP and Special Summoned ${choice.card.name} from ${choice.source === 'hand' ? 'hand' : 'Deck'} in Defense Position.`);
                  } else {
                    const empty = state.player.monsters.findIndex(m => m === null);
                    if (empty < 0) { addLog('Your Monster Zones are full.'); setPendingSelection(null); return; }
                    setState(prev => {
                      const player = { ...prev.player, monsters: [...prev.player.monsters], graveyard: [...prev.player.graveyard] };
                      const ai = { ...prev.ai, graveyard: [...prev.ai.graveyard] };
                      const source = choice.source === 'playerGY' ? player.graveyard : ai.graveyard;
                      const iCard = source.findIndex(c => c.uid === choice.card.uid);
                      if (iCard >= 0) { const [picked] = source.splice(iCard, 1); picked.faceUp = true; picked.position = 'ATTACK'; picked.summonKind = 'SPECIAL'; picked.hasAttacked = false; player.monsters[empty] = picked; }
                      return { ...prev, player, ai };
                    });
                    addLog(`[Monster Reborn] You chose ${choice.card.name} from the ${choice.source === 'playerGY' ? 'your' : 'opponent'} Graveyard.`);
                  }
                  setPendingSelection(null);
                  setIsGyOpen(false);
                }} className="text-left rounded-xl overflow-hidden border border-sky-800 hover:border-amber-300 bg-[#0d2034] hover:bg-[#142e48] transition-all p-2">
                  <img src={candidate.card.art} alt={candidate.card.name} className="w-full aspect-[3/4] object-contain bg-black/30 rounded" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
                  <span className="block text-xs font-bold text-white mt-2">{candidate.card.name}</span>
                  <span className="block text-[10px] text-sky-300 mt-1">{candidate.source === 'hand' ? 'YOUR HAND' : candidate.source === 'deck' ? 'YOUR DECK' : candidate.source === 'playerGY' ? 'YOUR GRAVEYARD' : candidate.source === 'aiGY' ? 'OPPONENT GRAVEYARD' : 'YOUR FIELD'}</span>
                  <span className="block text-[10px] text-amber-200 mt-1">ATK {candidate.card.atk ?? '—'} / DEF {candidate.card.def ?? '—'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <DuelResultModal
        result={state.result}
        gameMode={state.gameMode}
        winnerName={state.player.lp > 0 ? state.player.name : state.ai.name}
        survivalStage={state.survivalStage}
        survivalScore={state.survivalScore}
        onRestart={() => {
          if (state.gameMode === 'SURVIVAL') handleStartSurvival();
          else if (state.gameMode === 'LOCAL_2P') handleStartLocalDuel(state.player.name, state.ai.name, deckConfig, deckConfig, true);
          else handleStartSoloDuel();
        }}
        onNextSurvivalStage={handleNextSurvivalStage}
        onReturnToMenu={() => setScreen('MENU')}
      />

      <CardWikiModal
        isOpen={isWikiModalOpen}
        onClose={() => setIsWikiModalOpen(false)}
      />
    </div>
  );
}
