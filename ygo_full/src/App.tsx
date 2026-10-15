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
  const [isMuted, setIsMuted] = useState(false);

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

  // Field Spell continuous bonuses
  useEffect(() => {
    const activeSpell = state.player.fieldSpell || state.ai.fieldSpell;
    setState(prev => {
      const applyField = (p: PlayerState) => {
        p.monsters.forEach(m => {
          if (!m) return;
          let bonus = 0;
          if (activeSpell?.name === 'Mountain') {
            if (['Dragon', 'Winged Beast', 'Thunder'].includes(m.race || '')) bonus += 300;
          } else if (activeSpell?.name === 'Yami') {
            if (['Spellcaster', 'Fiend'].includes(m.race || '')) bonus += 300;
            if (m.race === 'Fairy') bonus -= 300;
          } else if (activeSpell?.name === 'Dragon Ravine') {
            if (m.race === 'Dragon') bonus += 300;
          } else if (activeSpell?.name === 'Necrovalley') {
            if (m.name.includes('Gravekeeper')) bonus += 500;
          } else if (activeSpell?.name === 'Prank-Kids Place') {
            if (m.name.startsWith('Prank-Kids')) bonus += 500;
          }
          m.attackBonus = bonus;
        });
      };
      const newPlayer = { ...prev.player };
      const newAi = { ...prev.ai };
      applyField(newPlayer);
      applyField(newAi);
      return {
        ...prev,
        activeFieldSpellEffect: activeSpell?.name || null,
        player: newPlayer,
        ai: newAi,
      };
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
      logs: [`[SURVIVAL TOWER STAGE 1] Challenging ${stage.name} (${stage.startingLp} LP)! "${stage.dialog}"`],
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
    const healedLp = Math.min(8000, state.player.lp + 2000);

    const nextPlayer = createPlayerFromDeck(userProfile.name, deckConfig);
    nextPlayer.lp = healedLp;
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
        `[STAGE ${nextStageNum} OF 5] +2000 LP stage recovery applied! Opponent: ${stage.name} (${stage.startingLp} LP). "${stage.dialog}"`
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

      // Field spell
      const fieldIndex = ai.hand.findIndex(c => c.subtype === 'Field Spell');
      if (fieldIndex >= 0 && !ai.fieldSpell) {
        const [fieldCard] = ai.hand.splice(fieldIndex, 1);
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
          let tributed = 0;
          for (let i = 0; i < ai.monsters.length; i++) {
            if (ai.monsters[i] && tributed < best.tributes) {
              ai.graveyard.push(ai.monsters[i]!);
              ai.monsters[i] = null;
              tributed++;
            }
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

      // Attack
      let attackAnim = null;
      const aiAttackers = ai.monsters.filter(m => m && m.faceUp && m.position === 'ATTACK');
      aiAttackers.forEach(attacker => {
        if (!attacker || attacker.hasAttacked) return;
        const playerMonsters = player.monsters.filter(Boolean);

        if (playerMonsters.length > 0) {
          const target = playerMonsters[0]!;
          attacker.hasAttacked = true;
          const diff = (attacker.atk || 0) - (target.atk || 0);

          sound.playAttack();
          attackAnim = {
            attackerUid: attacker.uid,
            targetUid: target.uid,
            damage: Math.abs(diff),
            timestamp: Date.now()
          };

          if (diff > 0) {
            const pIdx = player.monsters.indexOf(target);
            if (pIdx >= 0) player.monsters[pIdx] = null;
            player.graveyard.push(target);
            player.lp = Math.max(0, player.lp - diff);
            sound.playDestroy();
          } else if (diff < 0) {
            const aIdx = ai.monsters.indexOf(attacker);
            if (aIdx >= 0) ai.monsters[aIdx] = null;
            ai.graveyard.push(attacker);
            ai.lp = Math.max(0, ai.lp + diff);
            sound.playDestroy();
          }
        } else {
          // Direct attack
          attacker.hasAttacked = true;
          const dmg = attacker.atk || 1500;
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

  // Normal / Tribute Summon request
  const requestNormalSummon = (card: CardInstance, mode: 'SUMMON' | 'SET') => {
    if (state.normalSummonUsed) {
      addLog('You have already used your Normal Summon/Set this turn.');
      return;
    }

    const isP1 = state.activeSide === 'player';
    const activePlayer = isP1 ? state.player : state.ai;

    const tributesRequired = getRequiredTributes(card.level || 1);
    const availableMonsters = activePlayer.monsters.filter((m): m is CardInstance => m !== null);

    if (tributesRequired > 0) {
      if (availableMonsters.length < tributesRequired) {
        addLog(`Cannot Summon ${card.name}: Level ${card.level} requires ${tributesRequired} Tribute(s), but you control ${availableMonsters.length} monster(s).`);
        return;
      }
      setTributeState({
        card,
        mode,
        requiredCount: tributesRequired,
      });
      return;
    }

    executeSummon(card, mode, []);
  };

  // Execute Summon
  const executeSummon = (card: CardInstance, mode: 'SUMMON' | 'SET', tributeUids: number[]) => {
    const isP1 = state.activeSide === 'player';
    const activePlayer = isP1 ? state.player : state.ai;

    const emptySlot = activePlayer.monsters.findIndex(m => m === null);
    if (emptySlot < 0 && tributeUids.length === 0) {
      addLog('No open Monster Zones available.');
      return;
    }

    const idx = activePlayer.hand.findIndex(c => c.uid === card.uid);
    if (idx < 0) return;

    sound.playSummon();
    setState(prev => {
      const curP = isP1 ? { ...prev.player } : { ...prev.ai };

      tributeUids.forEach(uid => {
        const mIdx = curP.monsters.findIndex(m => m && m.uid === uid);
        if (mIdx >= 0) {
          const t = curP.monsters[mIdx]!;
          curP.monsters[mIdx] = null;
          curP.graveyard.push(t);
        }
      });

      const slot = curP.monsters.findIndex(m => m === null);
      const [summoned] = curP.hand.splice(idx, 1);
      summoned.faceUp = mode === 'SUMMON';
      summoned.position = mode === 'SUMMON' ? 'ATTACK' : 'DEFENSE';
      summoned.placedTurn = prev.turn;
      summoned.hasAttacked = false;
      curP.monsters[slot] = summoned;

      if (isOnlineMatch) {
        multiplayer.syncAction('SUMMON', {
          cardName: card.name,
          slotIndex: slot,
          faceUp: mode === 'SUMMON',
          position: summoned.position,
        });
      }

      return {
        ...prev,
        player: isP1 ? curP : prev.player,
        ai: isP1 ? prev.ai : curP,
        normalSummonUsed: true,
      };
    });

    const isTribute = tributeUids.length > 0;
    addLog(
      mode === 'SUMMON'
        ? `Normal Summoned [${card.name}] (ATK ${card.atk} / DEF ${card.def})${isTribute ? ` with ${tributeUids.length} Tribute(s)` : ''}!`
        : `Set [${card.name}] face-down${isTribute ? ` with ${tributeUids.length} Tribute(s)` : ''}.`
    );
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

    if (card.subtype === 'Field Spell') {
      sound.playFieldSpell();
      setState(prev => {
        const curP = isP1 ? { ...prev.player } : { ...prev.ai };
        const [fieldCard] = curP.hand.splice(idx, 1);
        fieldCard.faceUp = true;
        curP.fieldSpell = fieldCard;
        return {
          ...prev,
          player: isP1 ? curP : prev.player,
          ai: isP1 ? prev.ai : curP,
        };
      });
      card.activateEffect?.({
        card,
        owner: activePlayer,
        opponent: isP1 ? state.ai : state.player,
        ownerSide: state.activeSide,
        gameState: state,
        log: addLog,
      });

      if (isOnlineMatch) {
        multiplayer.syncAction('SPELL', { cardName: card.name });
      }
      return;
    }

    setState(prev => {
      const curP = isP1 ? { ...prev.player } : { ...prev.ai };
      const [spellCard] = curP.hand.splice(idx, 1);
      curP.graveyard.push(spellCard);
      return {
        ...prev,
        player: isP1 ? curP : prev.player,
        ai: isP1 ? prev.ai : curP,
      };
    });

    card.activateEffect?.({
      card,
      owner: activePlayer,
      opponent: isP1 ? state.ai : state.player,
      ownerSide: state.activeSide,
      gameState: state,
      log: addLog,
    });

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

  // Activate Hand Effect
  const handleActivateHandEffect = (card: CardInstance) => {
    sound.playEffectChime();
    const isP1 = state.activeSide === 'player';
    card.handEffect?.({
      card,
      owner: isP1 ? state.player : state.ai,
      opponent: isP1 ? state.ai : state.player,
      ownerSide: state.activeSide,
      gameState: state,
      log: addLog,
    });
  };

  // Activate GY Effect
  const handleActivateGyEffect = (card: CardInstance) => {
    sound.playEffectChime();
    const isP1 = state.activeSide === 'player';
    card.gyEffect?.({
      card,
      owner: isP1 ? state.player : state.ai,
      opponent: isP1 ? state.ai : state.player,
      ownerSide: state.activeSide,
      gameState: state,
      log: addLog,
    });
  };

  // Activate Monster Effect
  const handleActivateMonsterSkill = (card: CardInstance) => {
    sound.playEffectChime();
    const isP1 = state.activeSide === 'player';
    card.activateEffect?.({
      card,
      owner: isP1 ? state.player : state.ai,
      opponent: isP1 ? state.ai : state.player,
      ownerSide: state.activeSide,
      gameState: state,
      log: addLog,
    });
  };

  // Extra Deck Summon
  const handleSummonExtraMonster = (extraCard: CardInstance, materialUids: number[]) => {
    const isP1 = state.activeSide === 'player';
    setState(prev => {
      const curP = isP1 ? { ...prev.player } : { ...prev.ai };
      const extraIdx = curP.extraDeck.findIndex(c => c.uid === extraCard.uid);
      if (extraIdx < 0) return prev;

      const [summoned] = curP.extraDeck.splice(extraIdx, 1);
      summoned.faceUp = true;
      summoned.position = 'ATTACK';
      summoned.hasAttacked = false;
      summoned.placedTurn = prev.turn;

      materialUids.forEach(uid => {
        const mIdx = curP.monsters.findIndex(m => m && m.uid === uid);
        if (mIdx >= 0) {
          const mat = curP.monsters[mIdx]!;
          curP.monsters[mIdx] = null;
          if (extraCard.extraKind === 'XYZ') {
            summoned.materials.push(mat);
          } else {
            curP.graveyard.push(mat);
          }
        }
        const hIdx = curP.hand.findIndex(h => h.uid === uid);
        if (hIdx >= 0) {
          const mat = curP.hand.splice(hIdx, 1)[0];
          curP.graveyard.push(mat);
        }
      });

      const emptySlot = curP.monsters.findIndex(m => m === null);
      if (emptySlot >= 0) {
        curP.monsters[emptySlot] = summoned;
      } else {
        prev.extraMonsterZone[0] = summoned;
      }

      if (isOnlineMatch) {
        multiplayer.syncAction('SUMMON', {
          cardName: extraCard.name,
          slotIndex: emptySlot >= 0 ? emptySlot : 0,
          faceUp: true,
          position: 'ATTACK',
        });
      }

      return {
        ...prev,
        player: isP1 ? curP : prev.player,
        ai: isP1 ? prev.ai : curP,
      };
    });
    addLog(`SPECIAL SUMMON! [${extraCard.name}] (${extraCard.extraKind}) descends onto the field!`);
  };

  // Combat Execution (Targeted Monster or Direct Attack)
  const executeAttack = (attackerUid: number, targetUid: number | null) => {
    const isP1 = state.activeSide === 'player';
    const attackingPlayer = isP1 ? state.player : state.ai;
    const defendingPlayer = isP1 ? state.ai : state.player;

    const attacker = attackingPlayer.monsters.find(m => m && m.uid === attackerUid);
    if (!attacker) return;

    sound.playAttack();

    if (targetUid !== null) {
      const target = defendingPlayer.monsters.find(m => m && m.uid === targetUid);
      if (!target) return;

      const totalAtk = (attacker.atk ?? 0) + (attacker.attackBonus || 0);
      const targetVal = target.position === 'ATTACK' 
        ? (target.atk ?? 0) + (target.attackBonus || 0) 
        : (target.def ?? 0) + (target.defenseBonus || 0);
      const diff = totalAtk - targetVal;

      setState(prev => {
        const attP = isP1 ? { ...prev.player } : { ...prev.ai };
        const defP = isP1 ? { ...prev.ai } : { ...prev.player };

        const attMonster = attP.monsters.find(m => m && m.uid === attackerUid);
        if (attMonster) attMonster.hasAttacked = true;

        if (diff > 0) {
          const tIdx = defP.monsters.findIndex(m => m && m.uid === targetUid);
          if (tIdx >= 0) {
            const dest = defP.monsters[tIdx]!;
            defP.monsters[tIdx] = null;
            defP.graveyard.push(dest);
          }
          if (target.position === 'ATTACK') {
            defP.lp = Math.max(0, defP.lp - diff);
          }
          sound.playDestroy();
        } else if (diff < 0) {
          if (target.position === 'ATTACK') {
            const aIdx = attP.monsters.findIndex(m => m && m.uid === attackerUid);
            if (aIdx >= 0) {
              const dest = attP.monsters[aIdx]!;
              attP.monsters[aIdx] = null;
              attP.graveyard.push(dest);
            }
            attP.lp = Math.max(0, attP.lp + diff);
            sound.playDestroy();
          } else {
            attP.lp = Math.max(0, attP.lp + diff);
          }
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
          run: () => requestNormalSummon(card, 'SUMMON'),
        });
        actions.push({
          label: tributes > 0 ? `Tribute Set (${tributes} Tribute${tributes > 1 ? 's' : ''})` : 'Set Monster',
          desc: 'Place face-down in Defense Position',
          run: () => requestNormalSummon(card, 'SET'),
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
  const activeHand = state.activeSide === 'player' ? state.player.hand : state.ai.hand;
  const activeDuelistName = state.activeSide === 'player' ? state.player.name : state.ai.name;

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

      {/* 5. ACTIVE DUELIST'S FANNED HAND */}
      <PlayerHand
        hand={activeHand}
        selectedCardUid={state.selectedCardUid}
        onSelectCard={(c) => setState(prev => ({ ...prev, selectedCardUid: c.uid }))}
        onCardAction={handleHandCardAction}
        ownerName={activeDuelistName}
        isLocal2P={state.gameMode === 'LOCAL_2P'}
        activeSide={state.activeSide}
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

      <CardActionDialog
        card={actionCard}
        actions={actionList}
        onClose={() => setActionCard(null)}
      />

      <TributeModal
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
