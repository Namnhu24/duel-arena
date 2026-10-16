/**
 * Master Duel Card Database (English)
 * Official text, accurate Levels, Ranks, Link ratings, Tribute costs,
 * Hand Traps, GY Effects, Field Spells, and Archetypes.
 */

import { CardDefinition } from '../types/duel';

const cardArt = (id: number) => `https://images.ygoprodeck.com/images/cards/${id}.jpg`;

export const CARD_DATABASE: CardDefinition[] = [
  // ==========================================
  // FIELD SPELLS
  // ==========================================
  {
    id: 62265044,
    name: 'Dragon Ravine',
    type: 'SPELL',
    subtype: 'Field Spell',
    art: cardArt(62265044),
    hasFieldEffect: true,
    text: 'Once per turn: You can discard 1 card, then activate 1 of these effects: add 1 Level 4 or lower "Dragunity" monster from your Deck to your hand; or send 1 Dragon monster from your Deck to the GY.',
    activateEffect: ({ log }) => {
      log('[Dragon Ravine] activated! Dragon spirits surge across the battlefield.');
    }
  },
  {
    id: 59197169,
    name: 'Yami',
    type: 'SPELL',
    subtype: 'Field Spell',
    art: cardArt(59197169),
    hasFieldEffect: true,
    text: 'All Fiend and Spellcaster monsters on the field gain 200 ATK/DEF, also all Fairy monsters on the field lose 200 ATK/DEF.',
    activateEffect: ({ log }) => {
      log('[Yami] activated! Darkness shrouds the duel stadium.');
    }
  },
  {
    id: 50913601,
    name: 'Mountain',
    type: 'SPELL',
    subtype: 'Field Spell',
    art: cardArt(50913601),
    hasFieldEffect: true,
    text: 'All Dragon, Winged Beast, and Thunder monsters on the field gain 200 ATK/DEF.',
    activateEffect: ({ log }) => {
      log('[Mountain] activated! Thunder and lightning strike the mountain peaks.');
    }
  },
  {
    id: 47355498,
    name: 'Necrovalley',
    type: 'SPELL',
    subtype: 'Field Spell',
    art: cardArt(47355498),
    hasFieldEffect: true,
    text: 'All "Gravekeeper\'s" monsters gain 500 ATK/DEF. Cards in the Graveyard cannot be banished. Negate any card effect that would move a card in the Graveyard to a different place.',
    activateEffect: ({ log }) => {
      log('[Necrovalley] activated! Ancient tomb seals all Graveyard movement.');
    }
  },
  {
    id: 53136004,
    name: 'Prank-Kids Place',
    type: 'SPELL',
    subtype: 'Field Spell',
    art: cardArt(53136004),
    hasFieldEffect: true,
    text: 'When this card is activated: You can add 1 "Prank-Kids" monster from your Deck to your hand. Once per turn, if you Fusion or Link Summon a "Prank-Kids" monster: All monsters your opponent controls lose 500 ATK.',
    activateEffect: ({ owner, log }) => {
      log('[Prank-Kids Place] activated! Playful pranks erupt across the field.');
      const idx = owner.deck.findIndex(c => c.name.startsWith('Prank-Kids'));
      if (idx >= 0) {
        const [card] = owner.deck.splice(idx, 1);
        owner.hand.push(card);
        log(`[Prank-Kids Place] added ${card.name} from Deck to your hand!`);
      }
    }
  },
  {
    id: 76375976,
    name: 'Mystic Mine',
    type: 'SPELL',
    subtype: 'Field Spell',
    art: cardArt(76375976),
    hasFieldEffect: true,
    text: 'If your opponent controls more monsters than you do, your opponent cannot activate monster effects or declare an attack. If you control more monsters than your opponent does, you cannot activate monster effects or declare an attack. Once per turn, during the End Phase, if both players control the same number of monsters: Destroy this card.',
    activateEffect: ({ log }) => {
      log('[Mystic Mine] activated! Heavy mist paralyzes monster actions.');
    }
  },

  // ==========================================
  // HAND TRAPS & HAND EFFECTS
  // ==========================================
  {
    id: 14558127,
    name: 'Ash Blossom & Joyous Spring',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'FIRE',
    race: 'Zombie',
    level: 3,
    atk: 0,
    def: 1800,
    tuner: true,
    modelType: 'fairy',
    hasHandEffect: true,
    isQuickEffect: true,
    art: cardArt(14558127),
    text: 'When an effect that includes adding from the Deck to hand, Special Summoning from Deck, or sending from Deck to GY is activated: You can discard this card; negate that effect.',
    handEffect: ({ owner, log }) => {
      const idx = owner.hand.findIndex(c => c.name === 'Ash Blossom & Joyous Spring');
      if (idx >= 0) {
        const [ash] = owner.hand.splice(idx, 1);
        owner.graveyard.push(ash);
        log(`[Ash Blossom & Joyous Spring] discarded from hand! Cherry blossom petals negate the opponent's chain!`);
        return true;
      }
    }
  },
  {
    id: 97268402,
    name: 'Effect Veiler',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'LIGHT',
    race: 'Spellcaster',
    level: 1,
    atk: 0,
    def: 0,
    tuner: true,
    modelType: 'wizard',
    hasHandEffect: true,
    isQuickEffect: true,
    art: cardArt(97268402),
    text: 'During your opponent’s Main Phase (Quick Effect): You can send this card from your hand to the GY, then target 1 face-up Effect Monster your opponent controls; negate its effects until the end of this turn.',
    handEffect: ({ owner, opponent, log }) => {
      const idx = owner.hand.findIndex(c => c.name === 'Effect Veiler');
      const target = opponent.monsters.find(m => m && m.faceUp && !m.effectsNegated);
      if (idx >= 0 && target) {
        const [veil] = owner.hand.splice(idx, 1);
        owner.graveyard.push(veil);
        target.effectsNegated = true;
        log(`[Effect Veiler] sent from hand! ${target.name}'s effects are negated until the end of this turn.`);
        return true;
      } else {
        log('No legal face-up opponent Effect Monster to negate.');
      }
    }
  },
  {
    id: 40640057,
    name: 'Kuriboh',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Fiend',
    level: 1,
    atk: 300,
    def: 200,
    modelType: 'fiend',
    hasHandEffect: true,
    isQuickEffect: true,
    art: cardArt(40640057),
    text: 'During damage calculation, when an opponent’s monster attacks: You can discard this card; you take no battle damage from that battle.',
    handEffect: ({ owner, log }) => {
      const idx = owner.hand.findIndex(c => c.name === 'Kuriboh');
      if (idx >= 0) {
        const [kuri] = owner.hand.splice(idx, 1);
        owner.graveyard.push(kuri);
        owner.wingedKuribohTurn = 9999;
        log(`[Kuriboh] discarded from hand! Battle damage for this attack is reduced to 0!`);
        return true;
      }
    }
  },
  {
    id: 37742478,
    name: 'Honest',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'LIGHT',
    race: 'Fairy',
    level: 4,
    atk: 1100,
    def: 1900,
    modelType: 'fairy',
    hasHandEffect: true,
    isQuickEffect: true,
    art: cardArt(37742478),
    text: 'During the Damage Step, when a LIGHT monster you control battles: You can send this card from your hand to the GY; that monster gains ATK equal to the opponent’s battling monster’s ATK.',
    handEffect: ({ owner, opponent, log }) => {
      const idx = owner.hand.findIndex(c => c.name === 'Honest');
      const lightMonster = owner.monsters.find(m => m && m.faceUp && m.attribute === 'LIGHT');
      if (idx >= 0 && lightMonster) {
        const [h] = owner.hand.splice(idx, 1);
        owner.graveyard.push(h);
        const oppMonster = opponent.monsters.find(m => m && m.faceUp) || { atk: 2000 };
        const boost = oppMonster.atk || 2000;
        lightMonster.attackBonus += boost;
        log(`[Honest] sends radiant wings! ${lightMonster.name} gains +${boost} ATK!`);
        return true;
      } else {
        log('Requires a face-up LIGHT monster to activate Honest.');
      }
    }
  },
  {
    id: 70095154,
    name: 'Cyber Dragon',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'LIGHT',
    race: 'Machine',
    level: 5,
    atk: 2100,
    def: 1600,
    modelType: 'cyber_dragon',
    hasHandEffect: true,
    art: cardArt(70095154),
    text: 'If only your opponent controls a monster, you can Special Summon this card (from your hand).',
    handEffect: ({ owner, opponent, log }) => {
      const myMonsters = owner.monsters.filter(Boolean);
      const oppMonsters = opponent.monsters.filter(Boolean);
      if (myMonsters.length === 0 && oppMonsters.length > 0) {
        const idx = owner.hand.findIndex(c => c.name === 'Cyber Dragon');
        const emptySlot = owner.monsters.findIndex(m => m === null);
        if (idx >= 0 && emptySlot >= 0) {
          const [cd] = owner.hand.splice(idx, 1);
          cd.faceUp = true;
          cd.position = 'ATTACK';
          cd.placedTurn = 1;
          cd.hasAttacked = false;
          cd.summonKind = 'SPECIAL';
          owner.monsters[emptySlot] = cd;
          log(`[Cyber Dragon] Special Summoned directly from hand! Its metallic body roars onto the field.`);
          return true;
        }
      } else {
        log('Condition not met: Opponent must control a monster and you must control no monsters.');
      }
    }
  },
  {
    id: 30603688,
    name: 'Apprentice Illusion Magician',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Spellcaster',
    level: 6,
    atk: 2000,
    def: 1700,
    modelType: 'wizard',
    hasHandEffect: true,
    art: cardArt(30603688),
    text: 'You can Special Summon this card (from your hand) by discarding 1 card. During damage calculation, if your other DARK Spellcaster monster battles: You can send this card from hand to GY; it gains 2000 ATK/DEF.',
    handEffect: ({ owner, log }) => {
      const idx = owner.hand.findIndex(c => c.name === 'Apprentice Illusion Magician');
      const emptySlot = owner.monsters.findIndex(m => m === null);
      if (idx >= 0 && owner.hand.length >= 2 && emptySlot >= 0) {
        const [apprentice] = owner.hand.splice(idx, 1);
        const discIdx = owner.hand.findIndex(c => c.uid !== apprentice.uid);
        if (discIdx >= 0) {
          const [disc] = owner.hand.splice(discIdx, 1);
          owner.graveyard.push(disc);
        }
        apprentice.faceUp = true;
        apprentice.position = 'ATTACK';
        apprentice.placedTurn = 1;
        apprentice.hasAttacked = false;
        apprentice.summonKind = 'SPECIAL';
        owner.monsters[emptySlot] = apprentice;
        log(`[Apprentice Illusion Magician] Special Summoned from hand by discarding 1 card!`);
        return true;
      }
    }
  },
  {
    id: 44330098,
    name: 'Gorz the Emissary of Darkness',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Fiend',
    level: 7,
    atk: 2700,
    def: 2500,
    modelType: 'fiend',
    hasHandEffect: true,
    art: cardArt(44330098),
    text: 'When you take damage from an opponent’s card while you control no cards: You can Special Summon this card from your hand, then Special Summon 1 "Emissary of Darkness Token" with ATK/DEF equal to the battle damage taken.',
    handEffect: ({ owner, log }) => {
      const idx = owner.hand.findIndex(c => c.name === 'Gorz the Emissary of Darkness');
      const emptySlot = owner.monsters.findIndex(m => m === null);
      if (idx >= 0 && emptySlot >= 0) {
        const [gorz] = owner.hand.splice(idx, 1);
        gorz.faceUp = true;
        gorz.position = 'ATTACK';
        gorz.placedTurn = 1;
        gorz.hasAttacked = false;
        gorz.summonKind = 'SPECIAL';
        owner.monsters[emptySlot] = gorz;
        log(`[Gorz the Emissary of Darkness] Special Summoned from hand to protect its master!`);
        return true;
      }
    }
  },

  // ==========================================
  // GRAVEYARD EFFECTS
  // ==========================================
  {
    id: 4906301,
    name: 'Necro Gardna',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Warrior',
    level: 3,
    atk: 600,
    def: 1300,
    modelType: 'warrior',
    hasGyEffect: true,
    isQuickEffect: true,
    art: cardArt(4906301),
    text: 'During your opponent\'s turn (Quick Effect): You can banish this card from your GY; negate the next attack from an opponent\'s monster this turn.',
    gyEffect: ({ owner, log }) => {
      const idx = owner.graveyard.findIndex(c => c.name === 'Necro Gardna');
      if (idx >= 0) {
        const [necro] = owner.graveyard.splice(idx, 1);
        owner.banished.push(necro);
        owner.wabokuTurn = 9999;
        log(`[Necro Gardna] banished from GY! Its spirit shield will negate the next attack!`);
        return true;
      }
    }
  },
  {
    id: 71039903,
    name: 'The White Stone of Ancients',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'LIGHT',
    race: 'Dragon',
    level: 1,
    atk: 600,
    def: 500,
    tuner: true,
    modelType: 'dragon',
    hasGyEffect: true,
    art: cardArt(71039903),
    text: 'Once per turn, during the End Phase, if this card is in the GY because it was sent there this turn: You can Special Summon 1 "Blue-Eyes" monster from your Deck.',
    gyEffect: ({ owner, log }) => {
      const emptySlot = owner.monsters.findIndex(m => m === null);
      const blueEyesIdx = owner.deck.findIndex(c => c.name === 'Blue-Eyes White Dragon');
      if (emptySlot >= 0 && blueEyesIdx >= 0) {
        const [blueEyes] = owner.deck.splice(blueEyesIdx, 1);
        blueEyes.faceUp = true;
        blueEyes.position = 'ATTACK';
        blueEyes.placedTurn = 1;
        blueEyes.hasAttacked = false;
        blueEyes.summonKind = 'SPECIAL';
        owner.monsters[emptySlot] = blueEyes;
        log(`[The White Stone of Ancients] shines from the Graveyard! Special Summoned [Blue-Eyes White Dragon] from Deck!`);
        return true;
      } else {
        log('No free Monster Zone or no Blue-Eyes White Dragon left in Deck.');
      }
    }
  },
  {
    id: 9411399,
    name: 'Destiny HERO - Malicious',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Warrior',
    level: 6,
    atk: 800,
    def: 800,
    modelType: 'warrior',
    hasGyEffect: true,
    art: cardArt(9411399),
    text: 'You can banish this card from your GY; Special Summon 1 "Destiny HERO - Malicious" from your Deck.',
    gyEffect: ({ owner, log }) => {
      const idx = owner.graveyard.findIndex(c => c.name === 'Destiny HERO - Malicious');
      const emptySlot = owner.monsters.findIndex(m => m === null);
      const deckIdx = owner.deck.findIndex(c => c.name === 'Destiny HERO - Malicious');
      if (idx >= 0 && emptySlot >= 0 && deckIdx >= 0) {
        const [maliGy] = owner.graveyard.splice(idx, 1);
        owner.banished.push(maliGy);
        const [maliDeck] = owner.deck.splice(deckIdx, 1);
        maliDeck.faceUp = true;
        maliDeck.position = 'ATTACK';
        maliDeck.placedTurn = 1;
        maliDeck.hasAttacked = false;
        maliDeck.summonKind = 'SPECIAL';
        owner.monsters[emptySlot] = maliDeck;
        log(`[Destiny HERO - Malicious] banished from GY! Summoned another Malicious from Deck!`);
        return true;
      } else {
        log('Requires a Malicious in Deck and an open Monster Zone.');
      }
    }
  },
  {
    id: 44509529,
    name: 'Prank-Kids Rocksies',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'EARTH',
    race: 'Rock',
    level: 4,
    atk: 1500,
    def: 1500,
    modelType: 'rock_prank',
    hasGyEffect: true,
    art: cardArt(44509529),
    text: 'If this card is sent to the GY as material for the Fusion or Link Summon of a "Prank-Kids" monster: You can banish 1 card from your hand; draw 1 card, then you can Special Summon 1 "Prank-Kids" monster from your hand or Deck in Defense Position.',
    gyEffect: ({ owner, log }) => {
      const idx = owner.graveyard.findIndex(c => c.name === 'Prank-Kids Rocksies');
      if (idx >= 0 && owner.hand.length > 0) {
        const [banishedCard] = owner.hand.splice(0, 1);
        owner.banished.push(banishedCard);
        if (owner.deck.length > 0) {
          const drawn = owner.deck.pop()!;
          owner.hand.push(drawn);
          log(`[Prank-Kids Rocksies] activated in GY! Banished 1 card, drew ${drawn.name}!`);
        }
        const kidIdx = owner.deck.findIndex(c => c.name.startsWith('Prank-Kids'));
        const emptySlot = owner.monsters.findIndex(m => m === null);
        if (kidIdx >= 0 && emptySlot >= 0) {
          const [kid] = owner.deck.splice(kidIdx, 1);
          kid.faceUp = true;
          kid.position = 'DEFENSE';
          kid.placedTurn = 1;
          kid.hasAttacked = false;
          kid.summonKind = 'SPECIAL';
          owner.monsters[emptySlot] = kid;
          log(`[Prank-Kids Rocksies] Special Summoned ${kid.name} from Deck in Defense Position!`);
        }
        return true;
      }
    }
  },
  {
    id: 557251,
    name: 'Prank-Kids Dropsies',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'WATER',
    race: 'Aqua',
    level: 2,
    atk: 1000,
    def: 1000,
    modelType: 'rock_prank',
    hasGyEffect: true,
    art: cardArt(557251),
    text: 'If this card is sent to the GY as material for the Fusion or Link Summon of a "Prank-Kids" monster: You can gain 1000 LP, then you can Special Summon 1 "Prank-Kids" monster from your hand or Deck in Defense Position, except "Prank-Kids Dropsies". You can only use this effect of "Prank-Kids Dropsies" once per turn.',
    gyEffect: ({ owner, log }) => {
      // Resolve the trigger in this lightweight simulator: gain 1000 LP and
      // Special Summon the first legal Prank-Kids monster from hand, then Deck.
      owner.lp = Math.min(99999, owner.lp + 1000);
      const isLegal = (c: CardDefinition) => c.name.startsWith('Prank-Kids') && c.name !== 'Prank-Kids Dropsies' && c.type === 'MONSTER';
      let source: 'hand' | 'deck' | null = null;
      let idx = owner.hand.findIndex(isLegal);
      if (idx >= 0) source = 'hand';
      else {
        idx = owner.deck.findIndex(isLegal);
        if (idx >= 0) source = 'deck';
      }
      const emptySlot = owner.monsters.findIndex(m => m === null);
      if (source && idx >= 0 && emptySlot >= 0) {
        const list = source === 'hand' ? owner.hand : owner.deck;
        const [kid] = list.splice(idx, 1);
        kid.faceUp = true;
        kid.position = 'DEFENSE';
        kid.hasAttacked = false;
        kid.summonKind = 'SPECIAL';
        owner.monsters[emptySlot] = kid;
        log(`[Prank-Kids Dropsies] You gained 1000 LP and Special Summoned ${kid.name} from your ${source} in Defense Position.`);
      } else {
        log('[Prank-Kids Dropsies] You gained 1000 LP, but no legal Prank-Kids monster or open Monster Zone was available.');
      }
      return true;
    }
  },
  {
    id: 26202165,
    name: 'Sangan',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Fiend',
    level: 3,
    atk: 1000,
    def: 600,
    modelType: 'fiend',
    hasGyEffect: true,
    art: cardArt(26202165),
    text: 'If this card is sent from the field to the GY: Add 1 monster with 1500 or less ATK from your Deck to your hand.',
    gyEffect: ({ owner, log }) => {
      const idx = owner.deck.findIndex(c => c.type === 'MONSTER' && (c.atk || 0) <= 1500 && c.name !== 'Sangan');
      if (idx >= 0) {
        const [searched] = owner.deck.splice(idx, 1);
        owner.hand.push(searched);
        log(`[Sangan] added ${searched.name} (ATK ${searched.atk}) from Deck to hand!`);
        return true;
      }
    }
  },

  // ==========================================
  // ICONIC MAIN DECK MONSTERS (Accurate Levels & Tributes)
  // ==========================================
  {
    id: 89631139,
    name: 'Blue-Eyes White Dragon',
    type: 'MONSTER',
    subtype: 'Normal',
    attribute: 'LIGHT',
    race: 'Dragon',
    level: 8, // 2 Tributes
    atk: 3000,
    def: 2500,
    modelType: 'dragon',
    art: cardArt(89631139),
    text: 'This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome beast and lived to tell the tale. Requires 2 Tributes to Tribute Summon.'
  },
  {
    id: 46986414,
    name: 'Dark Magician',
    type: 'MONSTER',
    subtype: 'Normal',
    attribute: 'DARK',
    race: 'Spellcaster',
    level: 7, // 2 Tributes
    atk: 2500,
    def: 2100,
    modelType: 'wizard',
    art: cardArt(46986414),
    text: 'The ultimate wizard in terms of attack and defense. Requires 2 Tributes to Tribute Summon.'
  },
  {
    id: 38033121,
    name: 'Dark Magician Girl',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Spellcaster',
    level: 6, // 1 Tribute
    atk: 2000,
    def: 1700,
    modelType: 'wizard',
    art: cardArt(38033121),
    text: 'Gains 300 ATK for every "Dark Magician" and "Magician of Black Chaos" in either player\'s GY. Requires 1 Tribute to Tribute Summon.',
    activateEffect: ({ card, owner, opponent, log }) => {
      const count = [...owner.graveyard, ...opponent.graveyard].filter(c => c.name === 'Dark Magician').length;
      card.attackBonus = count * 300;
      log(`[Dark Magician Girl] empowered by ${count} Dark Magician in GY! Gains +${count * 300} ATK!`);
    }
  },
  {
    id: 74677422,
    name: 'Red-Eyes Black Dragon',
    type: 'MONSTER',
    subtype: 'Normal',
    attribute: 'DARK',
    race: 'Dragon',
    level: 7, // 2 Tributes
    atk: 2400,
    def: 2000,
    modelType: 'dragon',
    art: cardArt(74677422),
    text: 'A ferocious dragon with a deadly attack. Requires 2 Tributes to Tribute Summon.'
  },
  {
    id: 70781052,
    name: 'Summoned Skull',
    type: 'MONSTER',
    subtype: 'Normal',
    attribute: 'DARK',
    race: 'Fiend',
    level: 6, // 1 Tribute
    atk: 2500,
    def: 1200,
    modelType: 'fiend',
    art: cardArt(70781052),
    text: 'A fiend with dark powers for the most part, but still one to be feared. High 2500 ATK for a 1-Tribute monster.'
  },
  {
    id: 10000000,
    name: 'Obelisk the Tormentor',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DIVINE',
    race: 'Divine-Beast',
    level: 10, // 3 Tributes
    atk: 4000,
    def: 4000,
    modelType: 'golem',
    art: cardArt(10000000),
    text: 'Requires 3 Tributes to Normal Summon. The descent of this mighty creature shall be heralded by burning winds and shaking land. Cannot be targeted by Spells, Traps, or card effects.'
  },
  {
    id: 77585513,
    name: 'Jinzo',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Machine',
    level: 6, // 1 Tribute
    atk: 2400,
    def: 1500,
    modelType: 'machine',
    art: cardArt(77585513),
    text: 'Trap Cards, and their effects on the field, cannot be activated. Negate all Trap effects on the field. Requires 1 Tribute to Tribute Summon.'
  },
  {
    id: 83104731,
    name: 'Ancient Gear Golem',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'EARTH',
    race: 'Machine',
    level: 8, // 2 Tributes
    atk: 3000,
    def: 3000,
    modelType: 'golem',
    art: cardArt(83104731),
    text: 'Cannot be Special Summoned. If this card attacks a Defense Position monster, inflict piercing battle damage. Your opponent cannot activate Spell/Trap Cards until the end of the Damage Step. Requires 2 Tributes.'
  },
  {
    id: 71413901,
    name: 'Breaker the Magical Warrior',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Spellcaster',
    level: 4, // 0 Tributes
    atk: 1600,
    def: 1000,
    modelType: 'wizard',
    art: cardArt(71413901),
    text: 'If Normal Summoned: Place 1 Spell Counter on this card (max. 1). Gains 300 ATK while it has a Spell Counter. You can remove 1 Spell Counter from this card, then target 1 Spell/Trap on the field; destroy it.',
    activateEffect: ({ card, opponent, log }) => {
      const target = opponent.spells.find(Boolean);
      if (card.spellCounter && card.spellCounter > 0 && target) {
        card.spellCounter = 0;
        card.attackBonus = Math.max(0, card.attackBonus - 300);
        const idx = opponent.spells.indexOf(target);
        if (idx >= 0) {
          opponent.spells[idx] = null;
          opponent.graveyard.push(target);
          log(`[Breaker the Magical Warrior] removed Spell Counter and destroyed ${target.name}!`);
          return true;
        }
      } else {
        log('Breaker has no Spell Counter or opponent controls no Spell/Trap cards.');
      }
    }
  },
  {
    id: 74131780,
    name: 'Exiled Force',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'EARTH',
    race: 'Warrior',
    level: 4, // 0 Tributes
    atk: 1000,
    def: 1000,
    modelType: 'warrior',
    art: cardArt(74131780),
    text: 'You can Tribute this card, then target 1 monster on the field; destroy that target.',
    activateEffect: ({ card, owner, opponent, log }) => {
      const myIdx = owner.monsters.findIndex(m => m && m.uid === card.uid);
      const oppMonster = opponent.monsters.find(Boolean);
      if (myIdx >= 0 && oppMonster) {
        owner.monsters[myIdx] = null;
        owner.graveyard.push(card);
        const oppIdx = opponent.monsters.findIndex(m => m && m.uid === oppMonster.uid);
        if (oppIdx >= 0) {
          opponent.monsters[oppIdx] = null;
          opponent.graveyard.push(oppMonster);
          log(`[Exiled Force] tributed itself to destroy ${oppMonster.name}!`);
          return true;
        }
      }
    }
  },
  {
    id: 26082117,
    name: 'Gagaga Magician',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'DARK',
    race: 'Spellcaster',
    level: 4, // 0 Tributes
    atk: 1500,
    def: 1000,
    modelType: 'wizard',
    art: cardArt(26082117),
    text: 'Once per turn: You can declare a Level from 1 to 8; this card becomes that Level until the end of this turn.',
    activateEffect: ({ card, log }) => {
      const nextLevel = card.level === 4 ? 8 : 4;
      card.level = nextLevel;
      log(`[Gagaga Magician] changed its Level to ${nextLevel}!`);
      return true;
    }
  },
  {
    id: 31305911,
    name: 'Marshmallon',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'LIGHT',
    race: 'Fairy',
    level: 3, // 0 Tributes
    atk: 300,
    def: 500,
    indestructibleByBattle: true,
    modelType: 'fairy',
    art: cardArt(31305911),
    text: 'Cannot be destroyed by battle. If this face-down card is attacked, inflict 1000 damage to your opponent after damage calculation.'
  },
  {
    id: 7563579,
    name: 'D.D. Warrior Lady',
    type: 'MONSTER',
    subtype: 'Effect',
    attribute: 'LIGHT',
    race: 'Warrior',
    level: 4, // 0 Tributes
    atk: 1500,
    def: 1600,
    modelType: 'warrior',
    art: cardArt(7563579),
    text: 'After damage calculation, when this card battles an opponent’s monster: You can banish both monsters.'
  },

  // ==========================================
  // EXTRA DECK MONSTERS
  // ==========================================
  {
    id: 44508094,
    name: 'Stardust Dragon',
    type: 'MONSTER',
    subtype: 'Synchro',
    extraKind: 'SYNCHRO',
    attribute: 'WIND',
    race: 'Dragon',
    level: 8,
    atk: 2500,
    def: 2000,
    modelType: 'stardust',
    hasGyEffect: true,
    isQuickEffect: true,
    art: cardArt(44508094),
    materialText: '1 Tuner + 1+ non-Tuner monsters (Total Levels = 8)',
    text: 'When a card or effect is activated that would destroy a card on the field (Quick Effect): You can Tribute this card; negate the activation, and if you do, destroy it. During the End Phase, if this effect was activated this turn: Special Summon this card from your GY.',
    activateEffect: ({ card, owner, log }) => {
      const idx = owner.monsters.findIndex(m => m && m.uid === card.uid);
      if (idx >= 0) {
        owner.monsters[idx] = null;
        card.stardustReturnPending = true;
        owner.graveyard.push(card);
        log(`[Stardust Dragon] tributed itself to protect cards from destruction! Will return in the End Phase.`);
        return true;
      }
    },
    gyEffect: ({ card, owner, log }) => {
      const emptySlot = owner.monsters.findIndex(m => m === null);
      const gyIdx = owner.graveyard.findIndex(c => c.uid === card.uid);
      if (emptySlot >= 0 && gyIdx >= 0) {
        owner.graveyard.splice(gyIdx, 1);
        card.faceUp = true;
        card.position = 'ATTACK';
        card.placedTurn = 1;
        card.hasAttacked = false;
        owner.monsters[emptySlot] = card;
        card.stardustReturnPending = false;
        log(`[Stardust Dragon] returned from the Graveyard in the End Phase! Stardust glitters over the arena.`);
        return true;
      }
    }
  },
  {
    id: 73580471,
    name: 'Black Rose Dragon',
    type: 'MONSTER',
    subtype: 'Synchro',
    extraKind: 'SYNCHRO',
    attribute: 'FIRE',
    race: 'Dragon',
    level: 7,
    atk: 2400,
    def: 1800,
    modelType: 'dragon',
    art: cardArt(73580471),
    materialText: '1 Tuner + 1+ non-Tuner monsters (Total Levels = 7)',
    text: 'When this card is Synchro Summoned: You can destroy all cards on the field.',
    activateEffect: ({ owner, opponent, log }) => {
      owner.monsters.forEach((m, i) => { if (m) { owner.graveyard.push(m); owner.monsters[i] = null; } });
      opponent.monsters.forEach((m, i) => { if (m) { opponent.graveyard.push(m); opponent.monsters[i] = null; } });
      owner.spells.forEach((s, i) => { if (s) { owner.graveyard.push(s); owner.spells[i] = null; } });
      opponent.spells.forEach((s, i) => { if (s) { opponent.graveyard.push(s); opponent.spells[i] = null; } });
      log(`[Black Rose Dragon] bloomed in raging fire! Destroyed all cards on the field!`);
      return true;
    }
  },
  {
    id: 84013237,
    name: 'Number 39: Utopia',
    type: 'MONSTER',
    subtype: 'Xyz',
    extraKind: 'XYZ',
    attribute: 'LIGHT',
    race: 'Warrior',
    level: 4, // Rank 4
    atk: 2500,
    def: 2000,
    modelType: 'utopia',
    isQuickEffect: true,
    art: cardArt(84013237),
    materialText: '2 Level 4 monsters',
    text: 'When any monster declares an attack: You can detach 1 material from this card; negate the attack.',
    activateEffect: ({ card, log }) => {
      if (card.materials && card.materials.length > 0) {
        card.materials.pop();
        log(`[Number 39: Utopia] detached 1 Xyz Material! Light Wing Shield negated the attack!`);
        return true;
      } else {
        log('Utopia has no Xyz Materials remaining.');
      }
    }
  },
  {
    id: 1861629,
    name: 'Decode Talker',
    type: 'MONSTER',
    subtype: 'Link',
    extraKind: 'LINK',
    attribute: 'DARK',
    race: 'Cyberse',
    linkRating: 3,
    atk: 2300,
    def: 0,
    modelType: 'warrior',
    art: cardArt(1861629),
    materialText: '2+ Effect Monsters (3 Effect Monsters total)',
    text: 'Gains 500 ATK for each monster it points to. When an opponent’s card effect targets a card you control (Quick Effect): You can Tribute 1 monster this card points to; negate the activation, and if you do, destroy that card.',
    activateEffect: ({ card, owner, log }) => {
      const bonus = owner.monsters.filter(m => m && m.faceUp && m.uid !== card.uid).length * 500;
      card.attackBonus = bonus;
      log(`[Decode Talker] linked with field data! Gains +${bonus} ATK!`);
      return true;
    }
  },
  {
    id: 35809262,
    name: 'Elemental HERO Flame Wingman',
    type: 'MONSTER',
    subtype: 'Fusion',
    extraKind: 'FUSION',
    attribute: 'WIND',
    race: 'Warrior',
    level: 6,
    atk: 2100,
    def: 1200,
    modelType: 'flame_wingman',
    art: cardArt(35809262),
    materialText: 'Elemental HERO Avian + Elemental HERO Burstinatrix',
    text: 'When this card destroys a monster by battle and sends it to the Graveyard: Inflict damage to your opponent equal to the ATK of the destroyed monster in the Graveyard.'
  },
  {
    id: 23995346,
    name: 'Blue-Eyes Ultimate Dragon',
    type: 'MONSTER',
    subtype: 'Fusion',
    extraKind: 'FUSION',
    attribute: 'LIGHT',
    race: 'Dragon',
    level: 12,
    atk: 4500,
    def: 3800,
    modelType: 'dragon',
    art: cardArt(23995346),
    materialText: '3 "Blue-Eyes White Dragon" monsters',
    text: 'A legendary fusion of three Blue-Eyes White Dragons. Its sheer 4500 ATK annihilates all opposition.'
  },
  {
    id: 18514525,
    name: 'Prank-Kids Rocket Ride',
    type: 'MONSTER',
    subtype: 'Fusion',
    extraKind: 'FUSION',
    attribute: 'FIRE',
    race: 'Pyro',
    level: 5,
    atk: 2000,
    def: 0,
    modelType: 'rock_prank',
    art: cardArt(18514525),
    materialText: '2 "Prank-Kids" monsters',
    text: 'This card can attack directly. You can Tribute this card, then target 2 "Prank-Kids" monsters with different names in your GY, except Fusion Monsters; Special Summon them.',
    activateEffect: ({ card, owner, log }) => {
      const idx = owner.monsters.findIndex(m => m && m.uid === card.uid);
      if (idx >= 0) {
        owner.monsters[idx] = null;
        owner.graveyard.push(card);
        const kids = owner.graveyard.filter(c => c.name.startsWith('Prank-Kids') && c.uid !== card.uid).slice(0, 2);
        kids.forEach(k => {
          const emptySlot = owner.monsters.findIndex(m => m === null);
          if (emptySlot >= 0) {
            const gyIndex = owner.graveyard.indexOf(k);
            if (gyIndex >= 0) owner.graveyard.splice(gyIndex, 1);
            k.faceUp = true;
            k.position = 'ATTACK';
            k.placedTurn = 1;
            k.hasAttacked = false;
            owner.monsters[emptySlot] = k;
          }
        });
        log(`[Prank-Kids Rocket Ride] tributed itself and revived ${kids.length} Prank-Kids from the GY!`);
        return true;
      }
    }
  },

  // ==========================================
  // SPELLS & TRAPS
  // ==========================================
  {
    id: 12580477,
    name: 'Raigeki',
    type: 'SPELL',
    subtype: 'Normal Spell',
    art: cardArt(12580477),
    text: 'Destroy all monsters your opponent controls.',
    activateEffect: ({ opponent, log }) => {
      let count = 0;
      opponent.monsters.forEach((m, i) => {
        if (m) {
          opponent.graveyard.push(m);
          opponent.monsters[i] = null;
          count++;
        }
      });
      log(`[Raigeki] strikes from the heavens! Destroyed ${count} opposing monster(s).`);
      return true;
    }
  },
  {
    id: 53129443,
    name: 'Dark Hole',
    type: 'SPELL',
    subtype: 'Normal Spell',
    art: cardArt(53129443),
    text: 'Destroy all monsters on the field.',
    activateEffect: ({ owner, opponent, log }) => {
      owner.monsters.forEach((m, i) => { if (m) { owner.graveyard.push(m); owner.monsters[i] = null; } });
      opponent.monsters.forEach((m, i) => { if (m) { opponent.graveyard.push(m); opponent.monsters[i] = null; } });
      log(`[Dark Hole] opens a cosmic vortex! Destroyed all monsters on the field.`);
      return true;
    }
  },
  {
    id: 83764718,
    name: 'Monster Reborn',
    type: 'SPELL',
    subtype: 'Normal Spell',
    art: cardArt(83764718),
    text: 'Target 1 monster in either GY; Special Summon it to your field.',
    activateEffect: ({ owner, opponent, log }) => {
      const emptySlot = owner.monsters.findIndex(m => m === null);
      const candidates = [...owner.graveyard, ...opponent.graveyard].filter(c => c.type === 'MONSTER');
      if (emptySlot >= 0 && candidates.length > 0) {
        candidates.sort((a, b) => (b.atk || 0) - (a.atk || 0));
        const target = candidates[0];
        const from = owner.graveyard.includes(target) ? owner : opponent;
        const idx = from.graveyard.indexOf(target);
        if (idx >= 0) from.graveyard.splice(idx, 1);
        target.faceUp = true;
        target.position = 'ATTACK';
        target.placedTurn = 1;
        target.hasAttacked = false;
        target.summonKind = 'SPECIAL';
        owner.monsters[emptySlot] = target;
        log(`[Monster Reborn] revives [${target.name}] (ATK ${target.atk}) from the Graveyard!`);
        return true;
      } else {
        log('No monster eligible in the Graveyard or Monster Zones are full.');
      }
    }
  },
  {
    id: 55144522,
    name: 'Pot of Greed',
    type: 'SPELL',
    subtype: 'Normal Spell',
    art: cardArt(55144522),
    text: 'Draw 2 cards from your Deck.',
    activateEffect: ({ owner, log }) => {
      const drawn: string[] = [];
      for (let i = 0; i < 2; i++) {
        if (owner.deck.length > 0) {
          const card = owner.deck.pop()!;
          owner.hand.push(card);
          drawn.push(card.name);
        }
      }
      log(`[Pot of Greed] drew 2 cards: ${drawn.join(', ')}!`);
      return true;
    }
  },
  {
    id: 5318639,
    name: 'Mystical Space Typhoon',
    type: 'SPELL',
    subtype: 'Quick-Play Spell',
    art: cardArt(5318639),
    text: 'Target 1 Spell/Trap on the field; destroy that target.',
    activateEffect: ({ opponent, log }) => {
      const target = opponent.spells.find(Boolean);
      if (target) {
        const idx = opponent.spells.indexOf(target);
        if (idx >= 0) {
          opponent.spells[idx] = null;
          opponent.graveyard.push(target);
          log(`[Mystical Space Typhoon] destroyed opponent's [${target.name}]!`);
          return true;
        }
      } else {
        log('Opponent has no Spell/Trap on the field.');
      }
    }
  },
  {
    id: 24094653,
    name: 'Polymerization',
    type: 'SPELL',
    subtype: 'Normal Spell',
    art: cardArt(24094653),
    text: 'Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters from your hand or field as Fusion Material.',
    activateEffect: ({ log }) => {
      log('[Polymerization] activated! Open Extra Deck to perform a Fusion Summon.');
      return true;
    }
  },
  {
    id: 44095762,
    name: 'Mirror Force',
    type: 'TRAP',
    subtype: 'Normal Trap',
    art: cardArt(44095762),
    text: 'When an opponent’s monster declares an attack: Destroy all Attack Position monsters your opponent controls.',
    activateEffect: ({ opponent, log }) => {
      let count = 0;
      opponent.monsters.forEach((m, i) => {
        if (m && m.position === 'ATTACK') {
          opponent.graveyard.push(m);
          opponent.monsters[i] = null;
          count++;
        }
      });
      log(`[Mirror Force] shines brightly! Destroyed ${count} attacking monster(s)!`);
      return true;
    }
  },
  {
    id: 62279055,
    name: 'Magic Cylinder',
    type: 'TRAP',
    subtype: 'Normal Trap',
    art: cardArt(62279055),
    text: 'When an opponent’s monster declares an attack: Target the attacking monster; negate the attack, and if you do, inflict damage to your opponent equal to its ATK.',
    activateEffect: ({ opponent, target, log }) => {
      const dmg = target?.atk || 2500;
      opponent.lp = Math.max(0, opponent.lp - dmg);
      log(`[Magic Cylinder] absorbs the attack and reflects ${dmg} damage directly to the opponent!`);
      return true;
    }
  },
  {
    id: 29401950,
    name: 'Bottomless Trap Hole',
    type: 'TRAP',
    subtype: 'Normal Trap',
    art: cardArt(29401950),
    text: 'When your opponent Summons a monster(s) with 1500 or more ATK: Destroy that monster(s), and if you do, banish it.'
  },
  {
    id: 53582587,
    name: 'Torrential Tribute',
    type: 'TRAP',
    subtype: 'Normal Trap',
    art: cardArt(53582587),
    text: 'When a monster is Summoned: Destroy all monsters on the field.'
  },
  {
    id: 41420027,
    name: 'Solemn Judgment',
    type: 'TRAP',
    subtype: 'Counter Trap',
    art: cardArt(41420027),
    text: 'When a monster would be Summoned, OR a Spell/Trap Card is activated: Pay half your LP; negate the Summon or activation, and if you do, destroy that card.'
  },
  // Rule Book examples: negation, timing, and once-per-turn demonstrations.
  { id: 73680966, name: 'Ghost Belle & Haunted Mansion', type: 'MONSTER', subtype: 'Effect', attribute: 'EARTH', race: 'Zombie', level: 3, atk: 0, def: 1800, art: cardArt(73680966), hasHandEffect: true, isQuickEffect: true, text: 'When a card or effect is activated that includes adding a card(s) from the GY to the hand, Deck, and/or Extra Deck; Special Summoning a Monster Card(s) from the GY; or banishing a card(s) from the GY (Quick Effect): You can discard this card; negate that activation. You can only use this effect of "Ghost Belle & Haunted Mansion" once per turn.' },
  { id: 92065772, name: 'Chain Hole', type: 'TRAP', subtype: 'Normal Trap', art: cardArt(92065772), text: 'When your opponent activates a monster effect in response to a card or effect activation: Negate that opponent’s effect, then your opponent can banish 1 card from their hand or Deck with the same original name as the negated card. If they do not, you can banish 1 random card from their hand.' },
  { id: 82732705, name: 'Skill Drain', type: 'TRAP', subtype: 'Continuous Trap', art: cardArt(82732705), text: 'Activate by paying 1000 LP. Negate the effects of all face-up monsters while they are face-up on the field.' },
  { id: 10045474, name: 'Infinite Impermanence', type: 'TRAP', subtype: 'Normal Trap', art: cardArt(10045474), hasFieldEffect: true, text: 'Target 1 face-up monster your opponent controls; negate its effects until the end of this turn. If you control no cards, you can activate this card from your hand. If this card was Set before activation and is on the field at resolution, negate Spell/Trap effects in this column for the rest of this turn.' },
  { id: 40605147, name: 'Solemn Strike', type: 'TRAP', subtype: 'Counter Trap', art: cardArt(40605147), text: 'When a monster(s) would be Special Summoned, OR a monster effect is activated: Pay 1500 LP; negate the Summon or activation, and if you do, destroy that card.' },
  { id: 70342110, name: 'Dimensional Prison', type: 'TRAP', subtype: 'Normal Trap', art: cardArt(70342110), text: 'When an opponent’s monster declares an attack: Target the attacking monster; banish that target. This does not negate the attack itself; the attack ends because the attacking monster leaves the field.' },
  { id: 49003308, name: 'Divine Wrath', type: 'TRAP', subtype: 'Counter Trap', art: cardArt(49003308), text: 'When a monster effect is activated: Discard 1 card; negate the activation, and if you do, destroy that monster.' },
  { id: 98700941, name: 'Tearlaments Merrli', type: 'MONSTER', subtype: 'Effect', attribute: 'DARK', race: 'Aqua', level: 2, atk: 800, def: 2000, art: cardArt(54447022), text: 'If this card is Normal or Special Summoned: You can send the top 3 cards of your Deck to the GY. If this card is sent to the GY by card effect: You can Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters from your hand, field, and/or GY as material, including this card. Each effect is once per turn.' },
  { id: 13676474, name: 'Ultimate Offering', type: 'TRAP', subtype: 'Continuous Trap', art: cardArt(13676474), text: 'During your Main Phase or your opponent’s Battle Phase: You can pay 500 LP; immediately after this effect resolves, Normal Summon or Set 1 monster. This is an additional Normal Summon/Set.' },
  { id: 24224830, name: 'Called by the Grave', type: 'SPELL', subtype: 'Quick-Play Spell', art: cardArt(30741334), text: 'Target 1 monster in your opponent’s GY; banish it, and if you do, until the end of the next turn, its effects are negated, as well as the activated effects and effects on the field of monsters with the same original name.' },

  // HERO archetype expansion: core Elemental, Masked, and Xtra HERO cards.
  { id: 40044918, name: 'Elemental HERO Stratos', type: 'MONSTER', subtype: 'Effect', attribute: 'WIND', race: 'Warrior', level: 4, atk: 1800, def: 300, art: cardArt(40044918), modelType: 'warrior', text: 'If this card is Normal or Special Summoned: You can add 1 HERO monster from your Deck to your hand, except Elemental HERO Stratos, or destroy Spell/Trap Cards up to the number of HERO monsters you control. Once per turn.' },
  { id: 50720316, name: 'Elemental HERO Shadow Mist', type: 'MONSTER', subtype: 'Effect', attribute: 'DARK', race: 'Warrior', level: 4, atk: 1000, def: 1500, art: cardArt(50720316), modelType: 'warrior', hasGyEffect: true, text: 'If this card is Special Summoned: You can add 1 Change Quick-Play Spell from your Deck to your hand. If this card is sent to the GY: You can add 1 HERO monster from your Deck to your hand, except Elemental HERO Shadow Mist. You can only use 1 effect per turn.' },
  { id: 45195443, name: 'Elemental HERO Solid Soldier', type: 'MONSTER', subtype: 'Effect', attribute: 'EARTH', race: 'Warrior', level: 4, atk: 1300, def: 1100, art: cardArt(45195443), modelType: 'warrior', text: 'When this card is Normal Summoned: You can Special Summon 1 Level 4 or lower HERO monster from your hand. If sent from the Monster Zone to the GY by a Spell effect: You can Special Summon 1 other HERO monster from your GY.' },
  { id: 14124483, name: 'Elemental HERO Honest Neos', type: 'MONSTER', subtype: 'Effect', attribute: 'LIGHT', race: 'Warrior', level: 7, atk: 2500, def: 2000, art: cardArt(14124483), modelType: 'warrior', hasHandEffect: true, text: 'During either player’s turn: You can discard this card; 1 HERO monster you control gains 2500 ATK until the end of this turn.', handEffect: ({ card, owner, log }) => { const idx = owner.hand.findIndex(c => c.uid === card.uid); const target = owner.monsters.find(m => m && m.name.includes('HERO')); if (idx >= 0 && target) { const [discarded] = owner.hand.splice(idx, 1); owner.graveyard.push(discarded); target.attackBonus += 2500; log(`[Honest Neos] ${target.name} gains 2500 ATK until the end of the turn.`); return true; } log('[Honest Neos] You need a HERO monster on your field.'); } },
  { id: 89943723, name: 'Elemental HERO Neos', type: 'MONSTER', subtype: 'Normal', attribute: 'LIGHT', race: 'Warrior', level: 7, atk: 2500, def: 2000, art: cardArt(89943723), modelType: 'warrior', text: 'A new Elemental HERO sent by Neos Space. He brings hope to the world and can contact Fusion with Neo-Spacians.' },
  { id: 21844576, name: 'Elemental HERO Avian', type: 'MONSTER', subtype: 'Normal', attribute: 'WIND', race: 'Warrior', level: 3, atk: 1000, def: 1000, art: cardArt(21844576), modelType: 'warrior', text: 'A winged Elemental HERO who wheels through the sky and strikes with a gust of wind.' },
  { id: 58932616, name: 'Elemental HERO Burstinatrix', type: 'MONSTER', subtype: 'Normal', attribute: 'FIRE', race: 'Warrior', level: 3, atk: 1200, def: 800, art: cardArt(58932616), modelType: 'warrior', text: 'A fiery Elemental HERO who burns her enemies with blazing passion.' },
  { id: 20721928, name: 'Elemental HERO Sparkman', type: 'MONSTER', subtype: 'Normal', attribute: 'LIGHT', race: 'Warrior', level: 4, atk: 1600, def: 1400, art: cardArt(20721928), modelType: 'warrior', text: 'An Elemental HERO who can use light to power up his attacks.' },
  { id: 79979666, name: 'Elemental HERO Bubbleman', type: 'MONSTER', subtype: 'Effect', attribute: 'WATER', race: 'Warrior', level: 4, atk: 800, def: 1200, art: cardArt(79979666), modelType: 'warrior', text: 'If you control no cards and have no cards in your hand except this card, you can Special Summon it from your hand; then draw 2 cards if it was the only card you controlled.' },
  { id: 22908820, name: 'Elemental HERO Sunrise', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'LIGHT', race: 'Warrior', level: 7, atk: 2500, def: 1200, art: cardArt(22908820), modelType: 'warrior', materialText: '2 HERO monsters with different Attributes', text: 'If this card is Special Summoned: You can add 1 Miracle Fusion from your Deck to your hand. If a HERO monster you control attacks, your opponent’s monsters lose 200 ATK for each different Attribute among HERO monsters you control.' },
  { id: 40854197, name: 'Elemental HERO Absolute Zero', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'WATER', race: 'Warrior', level: 8, atk: 2500, def: 2000, art: cardArt(40854197), modelType: 'warrior', materialText: '1 HERO monster + 1 WATER monster', text: 'Gains 500 ATK for each WATER monster on the field, except this card. If this card leaves the field: Destroy all monsters your opponent controls.' },
  { id: 58481572, name: 'Masked HERO Dark Law', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Warrior', level: 6, atk: 2400, def: 1800, art: cardArt(58481572), modelType: 'warrior', materialText: 'Must be Special Summoned by Mask Change', text: 'Any card sent to your opponent’s GY is banished instead. Once per turn, if your opponent adds a card(s) from the Deck to their hand, except during the Draw Phase or Damage Step: You can banish 1 random card from their hand.' },
  { id: 88086137, name: 'Masked HERO Anki', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Warrior', level: 8, atk: 2800, def: 1200, art: cardArt(88086137), modelType: 'warrior', materialText: 'Must be Special Summoned by Mask Change', text: 'Can attack directly, but battle damage inflicted to your opponent by this effect is halved. If this card destroys an opponent’s monster by battle: You can add 1 Change Quick-Play Spell from your Deck to your hand.' },
  { id: 46759931, name: 'Vision HERO Trinity', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Warrior', level: 8, atk: 2500, def: 2000, art: cardArt(46759931), modelType: 'warrior', materialText: '3 HERO monsters', text: 'If this card is Fusion Summoned, it gains 2500 ATK. Cannot attack directly. Can make up to 3 attacks during each Battle Phase.' },
  { id: 21143940, name: 'Mask Change', type: 'SPELL', subtype: 'Quick-Play Spell', art: cardArt(21143940), text: 'Target 1 HERO monster you control; send it to the GY, and if you do, Special Summon from your Extra Deck 1 Masked HERO monster with the same Attribute but a different name.' },
  { id: 45906428, name: 'Miracle Fusion', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(45906428), text: 'Fusion Summon 1 Elemental HERO Fusion Monster from your Extra Deck, by banishing Fusion Materials listed on it from your field or GY.' },
  { id: 213326, name: 'E - Emergency Call', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(213326), text: 'Add 1 Elemental HERO monster from your Deck to your hand.' },
  { id: 89882100, name: 'A Hero Lives', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(89882100), text: 'If you control no face-up monsters: Pay half your LP; Special Summon 1 Level 4 or lower Elemental HERO monster from your Deck.' },
  { id: 19680539, name: 'Reinforcement of the Army', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(19680539), text: 'Add 1 Level 4 or lower Warrior monster from your Deck to your hand.' },
  { id: 56532353, name: 'Skyscraper', type: 'SPELL', subtype: 'Field Spell', art: cardArt(56532353), hasFieldEffect: true, text: 'When an Elemental HERO monster you control attacks an opponent’s monster with higher ATK, the attacking monster gains 1000 ATK during damage calculation only.' },
  { id: 41517921, name: 'Elemental HERO The Shining', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'LIGHT', race: 'Warrior', level: 8, atk: 2600, def: 2100, art: cardArt(41517921), modelType: 'warrior', materialText: '1 Elemental HERO monster + 1 LIGHT monster', text: 'Gains 300 ATK for each of your banished Elemental HERO monsters. If this card is sent from the field to the GY: You can target up to 2 of your banished Elemental HERO monsters; add them to your hand.' },
  { id: 96256417, name: 'Xtra HERO Cross Crusader', type: 'MONSTER', subtype: 'Link', extraKind: 'LINK', attribute: 'DARK', race: 'Warrior', linkRating: 2, atk: 1600, art: cardArt(96256417), modelType: 'warrior', materialText: '2 HERO monsters', text: 'If this card is Link Summoned: You can target 1 HERO monster in your GY; add it to your hand. You can Tribute 1 HERO monster; add 1 HERO monster with a different name from your Deck to your hand. Once per turn.' },
  { id: 36098706, name: 'Xtra HERO Wonder Driver', type: 'MONSTER', subtype: 'Link', extraKind: 'LINK', attribute: 'LIGHT', race: 'Warrior', linkRating: 2, atk: 1900, art: cardArt(36098706), modelType: 'warrior', materialText: '2 HERO monsters', text: 'If a HERO monster is Special Summoned to a zone this card points to: You can target a Polymerization or Change Quick-Play Spell in your GY; Set it to your field.' },
  { id: 30757127, name: 'Xtra HERO Dread Decimator', type: 'MONSTER', subtype: 'Link', extraKind: 'LINK', attribute: 'DARK', race: 'Warrior', linkRating: 3, atk: 2500, art: cardArt(30757127), modelType: 'warrior', materialText: '2+ HERO monsters', text: 'All HERO monsters you control gain 100 ATK for each HERO monster in your GY. Monsters this card points to inflict piercing battle damage.' },

  { id: 53639887, name: 'Elemental HERO Liquid Soldier', type: 'MONSTER', subtype: 'Effect', attribute: 'WATER', race: 'Warrior', level: 4, atk: 1400, def: 1300, art: cardArt(53639887), modelType: 'warrior', text: 'When Normal Summoned: You can target 1 Level 4 or lower HERO monster in your GY, except Elemental HERO Liquid Soldier; Special Summon it. If used as Fusion Material for a HERO monster: You can draw 2 cards, then discard 1 card.' },
  { id: 63060238, name: 'Elemental HERO Blazeman', type: 'MONSTER', subtype: 'Effect', attribute: 'FIRE', race: 'Warrior', level: 4, atk: 1200, def: 1800, art: cardArt(63060238), modelType: 'warrior', text: 'If this card is Normal or Special Summoned: You can add 1 Polymerization from your Deck to your hand. Once per turn: You can send 1 Elemental HERO monster from your Deck to the GY; this card’s Attribute and ATK become that monster’s until the end of this turn.' },
  { id: 48996514, name: 'Elemental HERO Escuridao', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Warrior', level: 8, atk: 2500, def: 2000, art: cardArt(48996514), modelType: 'warrior', materialText: '1 Elemental HERO monster + 1 DARK monster', text: 'Gains 100 ATK for each Elemental HERO monster in your GY.' },
  { id: 16304628, name: 'Elemental HERO Gaia', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'EARTH', race: 'Warrior', level: 6, atk: 2200, def: 2600, art: cardArt(16304628), modelType: 'warrior', materialText: '1 HERO monster + 1 EARTH monster', text: 'When this card is Fusion Summoned: You can target 1 face-up monster your opponent controls; its ATK is halved, and this card gains that lost ATK.' },


  // Cyber Dragon archetype cards added for Kaiser Ryo's preset deck.
  { id: 23893227, name: 'Cyber Dragon Core', type: 'MONSTER', subtype: 'Effect', attribute: 'LIGHT', race: 'Machine', level: 2, atk: 400, def: 1500, art: cardArt(23893227), modelType: 'cyber_dragon', text: 'If this card is Normal Summoned: Add 1 Cyber Spell/Trap from your Deck to your hand. While in the GY, if your opponent controls a monster and you control no monsters: You can banish this card; Special Summon 1 Cyber Dragon from your Deck. You can only use 1 Cyber Dragon Core effect per turn, and only once that turn.' },
  { id: 56364287, name: 'Cyber Dragon Herz', type: 'MONSTER', subtype: 'Effect', attribute: 'LIGHT', race: 'Machine', level: 1, atk: 100, def: 100, art: cardArt(56364287), modelType: 'cyber_dragon', text: 'If this card is Special Summoned: You can make its Level become 5. If this card is sent to the GY: You can add 1 other Cyber Dragon from your Deck or GY to your hand. You can only use 1 effect of Cyber Dragon Herz per turn, and only once that turn.' },
  { id: 1142880, name: 'Cyber Dragon Nachster', type: 'MONSTER', subtype: 'Effect', attribute: 'LIGHT', race: 'Machine', level: 1, atk: 200, def: 200, art: cardArt(1142880), modelType: 'cyber_dragon', text: 'You can discard 1 other monster; Special Summon this card from your hand. If Normal or Special Summoned: You can target 1 Machine monster with 2100 ATK or DEF in your GY, except Cyber Dragon Nachster; Special Summon it, also you cannot Special Summon monsters for the rest of this turn, except Machine monsters.' },
  { id: 60600126, name: 'Cyber Emergency', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(60600126), text: 'Add 1 LIGHT Machine monster that cannot be Normal Summoned/Set, or 1 Cyber Dragon, from your Deck to your hand. If this card in its owner’s possession is destroyed by an opponent’s card effect: You can discard 1 card; add this card from your GY to your hand.' },
  { id: 86686671, name: 'Cyber Repair Plant', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(86686671), text: 'If Cyber Dragon is in your GY: Activate 1 effect; if you have 3 or more Cyber Dragon in your GY, you can activate both effects in sequence. Add 1 LIGHT Machine from your Deck to your hand; or send 1 LIGHT Machine from your Deck to the GY.' },
  { id: 37630732, name: 'Power Bond', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(37630732), text: 'Fusion Summon 1 Machine Fusion Monster from your Extra Deck, using monsters from your hand or field as material. Its ATK becomes double its original ATK, but during the End Phase you take damage equal to its original ATK.' },
  { id: 67946831, name: 'Machine Duplication', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(67946831), text: 'Target 1 Machine monster you control with 500 or less ATK; Special Summon up to 2 monsters with the same name from your Deck.' },
  { id: 93850690, name: 'Cyber Revsystem', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(93850690), text: 'Special Summon 1 Cyber Dragon from your hand or GY. The monster Special Summoned by this effect cannot be destroyed by card effects.' },
  { id: 84058253, name: 'Chimeratech Rampage Dragon', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Machine', level: 5, atk: 2100, def: 1600, art: cardArt(84058253), modelType: 'cyber_dragon', materialText: '2 or more Cyber Dragon monsters', text: 'If this card is Fusion Summoned: You can destroy Spell/Trap cards on the field, up to the number of Fusion Materials used. Once per turn: You can send up to 2 LIGHT Machine monsters from your Deck to the GY; this card can make an additional attack during each Battle Phase for each monster sent.' },
  { id: 58069384, name: 'Cyber Dragon Nova', type: 'MONSTER', subtype: 'Xyz', extraKind: 'XYZ', attribute: 'LIGHT', race: 'Machine', level: 5, atk: 2100, def: 1600, art: cardArt(58069384), modelType: 'cyber_dragon', materialText: '2 Level 5 Machine monsters', text: 'Once per turn: You can detach 1 material; Special Summon 1 Cyber Dragon from your GY. Once per turn, when a Fusion Monster you control is destroyed by battle or an opponent’s card effect and sent to the GY: You can Special Summon 1 Machine Fusion Monster from your Extra Deck.' },
  { id: 10443957, name: 'Cyber Dragon Infinity', type: 'MONSTER', subtype: 'Xyz', extraKind: 'XYZ', attribute: 'LIGHT', race: 'Machine', level: 6, atk: 2100, def: 1600, art: cardArt(10443957), modelType: 'cyber_dragon', materialText: '3 Level 6 LIGHT Machine monsters (You can also Xyz Summon this card by using Cyber Dragon Nova you control as material.)', text: 'Once per turn: You can target 1 face-up Attack Position monster on the field; attach it to this card as material. Once per turn, when a card or effect is activated (Quick Effect): You can detach 1 material; negate the activation, and if you do, destroy it.' },
  { id: 79229522, name: 'Chimeratech Fortress Dragon', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Machine', level: 8, atk: 0, def: 0, art: cardArt(79229522), modelType: 'cyber_dragon', materialText: 'Cyber Dragon + 1+ Machine monsters', text: 'Must first be Special Summoned from your Extra Deck by sending the above cards from either field to the GY. The original ATK/DEF of this card become 1000 x the number of materials used for its Special Summon.' },
  { id: 87116928, name: 'Chimeratech Megafleet Dragon', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'DARK', race: 'Machine', level: 10, atk: 0, def: 0, art: cardArt(87116928), modelType: 'cyber_dragon', materialText: 'Cyber Dragon + 1+ monsters in the Extra Monster Zones', text: 'Must first be Special Summoned from your Extra Deck by sending the above cards from either field to the GY. The original ATK of this card become 1200 x the number of materials used for its Special Summon.' },
  { id: 46724542, name: 'Cyber Dragon Sieger', type: 'MONSTER', subtype: 'Link', extraKind: 'LINK', attribute: 'LIGHT', race: 'Machine', linkRating: 2, atk: 2100, art: cardArt(46724542), modelType: 'cyber_dragon', materialText: '2 Machine monsters, including Cyber Dragon', text: 'During the Damage Step, if your Machine monster with 2100 or more ATK battles: You can make that monster gain 2100 ATK/DEF until the end of this turn. You cannot inflict battle damage to your opponent for the rest of this turn after this effect resolves.' },
  { id: 1546123, name: 'Cyber End Dragon', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'LIGHT', race: 'Machine', level: 10, atk: 4000, def: 2800, art: cardArt(1546123), modelType: 'cyber_dragon', materialText: '3 Cyber Dragon', text: 'If this card attacks a Defense Position monster, inflict piercing battle damage to your opponent.' },
  { id: 3657444, name: 'Cyber Twin Dragon', type: 'MONSTER', subtype: 'Fusion', extraKind: 'FUSION', attribute: 'LIGHT', race: 'Machine', level: 8, atk: 2800, def: 2100, art: cardArt(3657444), modelType: 'cyber_dragon', materialText: '2 Cyber Dragon', text: 'This card can make a second attack during each Battle Phase.' },
  { id: 337462ిప, name: 'Cybernetic Overflow', type: 'TRAP', subtype: 'Normal Trap', art: cardArt(1896113), text: 'Banish Cyber Dragon monsters with different Levels from your hand, field, and/or GY; destroy cards your opponent controls equal to the number banished. If this Set card is destroyed by an opponent’s card effect: You can add 1 Cyber Spell/Trap from your Deck to your hand.' },


  { id: 82732705, name: 'Overload Fusion', type: 'SPELL', subtype: 'Normal Spell', art: cardArt(82732705), text: 'Fusion Summon 1 DARK Machine Fusion Monster from your Extra Deck, by banishing Fusion Materials listed on it from your field and/or GY.' },
  { id: 23171610, name: 'Limiter Removal', type: 'SPELL', subtype: 'Quick-Play Spell', art: cardArt(23171610), text: 'Double the ATK of all Machine monsters you currently control, until the end of this turn. During the End Phase, destroy those monsters.' },

];

export const EXTRA_DECK_DATABASE: CardDefinition[] = CARD_DATABASE.filter(c => 
  c.subtype === 'Fusion' || c.subtype === 'Synchro' || c.subtype === 'Xyz' || c.subtype === 'Link'
);

export const MAIN_DECK_DATABASE: CardDefinition[] = CARD_DATABASE.filter(c => 
  !['Fusion', 'Synchro', 'Xyz', 'Link'].includes(c.subtype as string)
);

/** Calculate Tribute requirement per official rules: Level 1-4: 0; Level 5-6: 1; Level 7-8: 2; Level 9+: 3 */
export function getRequiredTributes(level: number): number {
  if (level <= 4) return 0;
  if (level <= 6) return 1;
  if (level <= 8) return 2;
  return 3;
}
