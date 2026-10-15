/**
 * Yu-Gi-Oh! Master Duel Types & Interfaces
 */

export type CardType = 'MONSTER' | 'SPELL' | 'TRAP';

export type MonsterSubtype = 
  | 'Normal' 
  | 'Effect' 
  | 'Ritual' 
  | 'Fusion' 
  | 'Synchro' 
  | 'Xyz' 
  | 'Link' 
  | 'Pendulum';

export type SpellSubtype = 
  | 'Normal Spell' 
  | 'Quick-Play Spell' 
  | 'Continuous Spell' 
  | 'Equip Spell' 
  | 'Field Spell' 
  | 'Ritual Spell';

export type TrapSubtype = 
  | 'Normal Trap' 
  | 'Continuous Trap' 
  | 'Counter Trap';

export type Attribute = 'DARK' | 'LIGHT' | 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'DIVINE';

export type MonsterRace = 
  | 'Dragon'
  | 'Spellcaster'
  | 'Warrior'
  | 'Fiend'
  | 'Machine'
  | 'Aqua'
  | 'Rock'
  | 'Pyro'
  | 'Beast'
  | 'Winged Beast'
  | 'Cyberse'
  | 'Thunder'
  | 'Zombie'
  | 'Fairy'
  | 'Dinosaur'
  | 'Insect'
  | 'Divine-Beast';

export type Position = 'ATTACK' | 'DEFENSE';

export type Phase = 'DRAW' | 'STANDBY' | 'MAIN1' | 'BATTLE' | 'MAIN2' | 'END';

export type ModelType = 
  | 'dragon' 
  | 'wizard' 
  | 'warrior' 
  | 'cyber_dragon' 
  | 'flame_wingman' 
  | 'golem' 
  | 'fiend' 
  | 'rock_prank' 
  | 'fairy' 
  | 'beast' 
  | 'machine'
  | 'stardust'
  | 'utopia';

export interface CardEffectContext {
  card: CardInstance;
  owner: PlayerState;
  opponent: PlayerState;
  ownerSide: 'player' | 'ai';
  gameState: DuelState;
  log: (msg: string) => void;
  triggerSource?: string;
  target?: CardInstance | null;
}

export interface CardDefinition {
  id: number;
  name: string;
  type: CardType;
  subtype: MonsterSubtype | SpellSubtype | TrapSubtype;
  attribute?: Attribute;
  race?: MonsterRace;
  level?: number; // Level, Rank for Xyz
  linkRating?: number;
  atk?: number;
  def?: number;
  pendulumScale?: number;
  art: string;
  text: string;
  modelType?: ModelType;
  // Capabilities
  hasHandEffect?: boolean;
  hasGyEffect?: boolean;
  hasFieldEffect?: boolean;
  isQuickEffect?: boolean;
  materialText?: string;
  extraKind?: 'FUSION' | 'SYNCHRO' | 'XYZ' | 'LINK';
  tuner?: boolean;
  indestructibleByBattle?: boolean;
  // Execution callbacks
  activateEffect?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  handEffect?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  gyEffect?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  onNormalSummon?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  onSpecialSummon?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  onSentToGrave?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  onFlip?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
  onAttackDeclared?: (ctx: CardEffectContext) => Promise<boolean | void> | boolean | void;
}

export interface CardInstance extends CardDefinition {
  uid: number;
  faceUp: boolean;
  position: Position;
  hasAttacked: boolean;
  hasChangedPosition: boolean;
  placedTurn: number;
  setTurn: number | null;
  attackBonus: number;
  defenseBonus: number;
  effectsNegated: boolean;
  materials: CardInstance[]; // for Xyz Overlay Units or attached materials
  spellCounter?: number;
  stardustReturnPending?: boolean;
  properlySummoned?: boolean;
  summonKind?: 'NORMAL' | 'SET' | 'SPECIAL' | 'RITUAL' | 'FUSION' | 'SYNCHRO' | 'XYZ' | 'LINK' | 'CONTROL_CHANGE';
  attachedMonsterUid?: number;
  appliedAtk?: number;
  appliedDef?: number;
  effectUsedTurn?: number;
  handEffectUsedTurn?: number;
  gyEffectUsedTurn?: number;
}

export interface PlayerState {
  name: string;
  lp: number;
  deck: CardInstance[];
  extraDeck: CardInstance[];
  hand: CardInstance[];
  monsters: (CardInstance | null)[]; // 5 zones
  spells: (CardInstance | null)[];   // 5 zones
  fieldSpell: CardInstance | null;   // Field Spell Zone
  graveyard: CardInstance[];
  banished: CardInstance[];
  swordsActive: number;
  wabokuTurn?: number;
  wingedKuribohTurn?: number;
  threateningRoarTurn?: number;
}

export type GameMode = 'SOLO_AI' | 'ONLINE_PVP' | 'LOCAL_2P' | 'SURVIVAL' | 'PRACTICE';

export interface DuelState {
  gameMode: GameMode;
  turn: number;
  activeSide: 'player' | 'ai';
  phase: Phase;
  firstTurnSide: 'player' | 'ai';
  playerFirstTurnComplete: boolean;
  aiFirstTurnComplete: boolean;
  over: boolean;
  result: 'victory' | 'defeat' | 'draw' | null;
  normalSummonUsed: boolean;
  selectedAttackerUid: number | null;
  selectedTargetUid: number | null;
  selectedCardUid: number | null; // Currently inspected card
  polymerizationReady: boolean;
  activeFieldSpellEffect: string | null;
  player: PlayerState;
  ai: PlayerState;
  extraMonsterZone: (CardInstance | null)[]; // 2 center extra zones [leftEMZ, rightEMZ]
  logs: string[];
  lastAttackAnimation: {
    attackerUid: number;
    targetUid: number | null; // null = direct attack
    damage: number;
    timestamp: number;
  } | null;
  // Game Mode specific states
  survivalStage?: number;
  survivalScore?: number;
  cpuOpponentId?: string;
  isPlayer2HandOpen?: boolean;
}
