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
