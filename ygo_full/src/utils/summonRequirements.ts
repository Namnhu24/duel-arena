import { CardDefinition } from '../types/duel';

/** Human-readable material reminder for Extra Deck cards. Prefer the card-specific text in the database. */
export const getSummonRequirement = (card: Pick<CardDefinition, 'extraKind' | 'materialText' | 'level' | 'linkRating' | 'name'>): string | null => {
  if (!card.extraKind) return null;
  if (card.materialText?.trim()) return card.materialText;
  switch (card.extraKind) {
    case 'FUSION':
      return 'Fusion Materials: use the specific monster(s) listed on this card. The database does not yet specify the exact materials for this card.';
    case 'SYNCHRO':
      return `Usually 1 Tuner + 1 or more non-Tuners whose combined Levels equal ${card.level ?? 'this card’s Level'}. Check this card’s text for exceptions.`;
    case 'XYZ':
      return `Usually 2 or more monsters of the same Level (commonly Rank ${card.level ?? '?'} cards use Level ${card.level ?? '?'} monsters). Check this card’s text for the exact number and Level.`;
    case 'LINK':
      return `Use Effect Monsters meeting the material count and Link Rating for Link-${card.linkRating ?? '?'}. Check this card’s text for exact material restrictions.`;
    default:
      return null;
  }
};


/** True when the current field/hand has a plausible material set for at least one Extra Deck monster.
 * Used for the Extra Deck zone indicator; final legality is checked in the summon modal. */
export const hasPotentialExtraSummon = (extraDeck: CardDefinition[], field: CardDefinition[], hand: CardDefinition[] = []): boolean => {
  const faceUpField = field;
  return extraDeck.some(extra => {
    const pool = extra.extraKind === 'FUSION' ? [...faceUpField, ...hand] : faceUpField;
    if (extra.extraKind === 'FUSION') {
      const n = extra.name.toLowerCase();
      if (n.includes('blue-eyes ultimate')) return pool.filter(m => m.name === 'Blue-Eyes White Dragon').length >= 3;
      if (n.includes('flame wingman')) return pool.some(m => /Avian/i.test(m.name)) && pool.some(m => /Burstinatrix/i.test(m.name));
      if (n.includes('rocket ride') || n.includes('weather washer')) return pool.filter(m => m.name.startsWith('Prank-Kids')).length >= 2;
      return pool.length >= 2;
    }
    if (extra.extraKind === 'SYNCHRO') return pool.some(m => m.tuner) && pool.some(m => !m.tuner) && pool.reduce((n, m) => n + (m.level || 0), 0) >= (extra.level || 0);
    if (extra.extraKind === 'XYZ') return pool.filter(m => (m.level || 0) === (extra.level || 4)).length >= 2;
    if (extra.extraKind === 'LINK') return pool.filter(m => m.subtype !== 'Normal').length >= (extra.linkRating || 2);
    return false;
  });
};
