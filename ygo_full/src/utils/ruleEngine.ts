/** Small rule primitives used by the duel engine. These deliberately model distinct rules
 * instead of treating every negation as the same operation. */
export type OncePerTurnKind = 'SOFT' | 'HARD';
export type NegateKind = 'EFFECT' | 'ACTIVATION' | 'SUMMON' | 'ATTACK';
export type TimingWord = 'IF' | 'WHEN';

export interface EffectUseLedger {
  /** Soft OPT: once per turn per copy/card instance. */
  soft: Set<string>;
  /** Hard OPT: once per turn per card name/effect, shared across copies. */
  hard: Set<string>;
}

export function createEffectUseLedger(): EffectUseLedger {
  return { soft: new Set<string>(), hard: new Set<string>() };
}

export function canUseOncePerTurn(
  ledger: EffectUseLedger,
  kind: OncePerTurnKind,
  cardName: string,
  instanceUid: number,
  effectKey = 'effect',
): boolean {
  const key = kind === 'HARD'
    ? `${cardName.toLowerCase()}::${effectKey}`
    : `${instanceUid}::${effectKey}`;
  return !(kind === 'HARD' ? ledger.hard : ledger.soft).has(key);
}

export function markOncePerTurnUsed(
  ledger: EffectUseLedger,
  kind: OncePerTurnKind,
  cardName: string,
  instanceUid: number,
  effectKey = 'effect',
): void {
  const key = kind === 'HARD'
    ? `${cardName.toLowerCase()}::${effectKey}`
    : `${instanceUid}::${effectKey}`;
  (kind === 'HARD' ? ledger.hard : ledger.soft).add(key);
}

/** A cost is paid when activation is attempted; negating the activation does not refund it. */
export function payCost<T>(pay: () => T): T {
  return pay();
}

/**
 * Timing reminder: optional “When ...: you can” effects can miss timing if their trigger
 * condition was not the last thing to happen. “If ...: you can” effects generally do not
 * use that last-event restriction. Exact card text/rulings still take precedence.
 */
export function mayOptionalTrigger(timing: TimingWord, triggerWasLastEvent: boolean): boolean {
  return timing === 'IF' || triggerWasLastEvent;
}

export interface NegateResolution {
  kind: NegateKind;
  activationNegated: boolean;
  effectNegated: boolean;
  summonNegated: boolean;
  attackNegated: boolean;
  destroySource: boolean;
}

export function resolveNegate(kind: NegateKind, destroySource = false): NegateResolution {
  return {
    kind,
    activationNegated: kind === 'ACTIVATION',
    effectNegated: kind === 'EFFECT',
    summonNegated: kind === 'SUMMON',
    attackNegated: kind === 'ATTACK',
    destroySource,
  };
}
