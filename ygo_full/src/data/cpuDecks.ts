/**
 * CPU Rival Profiles & Preset Decks for Solo Duel and Survival Gauntlet
 */

import { DeckConfig } from '../components/DeckBuilder';

export interface CpuOpponent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  dialog: string;
  signatureCard: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  deck: DeckConfig;
}

export const CPU_OPPONENTS: CpuOpponent[] = [
  {
    id: 'kaiba',
    name: 'Seto Kaiba',
    title: 'KaibaCorp President & Blue-Eyes Master',
    avatar: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    signatureCard: 'Blue-Eyes White Dragon',
    difficulty: 'Hard',
    dialog: 'My Blue-Eyes White Dragon will turn your life points to dust! Let us duel!',
    deck: {
      main: [
        'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon',
        'Cyber Dragon', 'Cyber Dragon',
        'The White Stone of Ancients', 'The White Stone of Ancients',
        'Honest', 'Honest',
        'Breaker the Magical Warrior', 'D.D. Warrior Lady',
        'Raigeki', 'Dark Hole', 'Monster Reborn', 'Pot of Greed',
        'Mountain', 'Dragon Ravine', 'Polymerization', 'Polymerization',
        'Mirror Force', 'Magic Cylinder', 'Bottomless Trap Hole', 'Torrential Tribute'
      ],
      extra: [
        'Blue-Eyes Ultimate Dragon', 'Number 39: Utopia', 'Decode Talker'
      ]
    }
  },
  {
    id: 'yugi',
    name: 'Yami Yugi',
    title: 'King of Games & Master of Spellcasters',
    avatar: 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
    signatureCard: 'Dark Magician',
    difficulty: 'Hard',
    dialog: 'The heart of the cards will guide my way! Prepare yourself for a true duel!',
    deck: {
      main: [
        'Dark Magician', 'Dark Magician', 'Dark Magician Girl',
        'Apprentice Illusion Magician', 'Apprentice Illusion Magician',
        'Breaker the Magical Warrior', 'Gagaga Magician', 'Kuriboh', 'Kuriboh',
        'Effect Veiler', 'Ash Blossom & Joyous Spring',
        'Raigeki', 'Monster Reborn', 'Pot of Greed', 'Mystical Space Typhoon',
        'Yami', 'Polymerization',
        'Mirror Force', 'Magic Cylinder', 'Solemn Judgment', 'Torrential Tribute'
      ],
      extra: [
        'Elemental HERO Flame Wingman', 'Number 39: Utopia', 'Decode Talker'
      ]
    }
  },
  {
    id: 'jaden',
    name: 'Jaden Yuki',
    title: 'Slifer Red & HERO Combo Duelist',
    avatar: 'https://images.ygoprodeck.com/images/cards/35809262.jpg',
    signatureCard: 'Elemental HERO Sunrise',
    difficulty: 'Expert',
    dialog: 'Get your game on! Vision HERO, Destiny HERO, and Elemental HERO—let’s fuse our way to victory!',
    deck: {
      main: [
        'Elemental HERO Stratos', 'Elemental HERO Stratos',
        'Elemental HERO Shadow Mist', 'Elemental HERO Shadow Mist',
        'Elemental HERO Honest Neos', 'Elemental HERO Liquid Soldier',
        'Vision HERO Faris', 'Vision HERO Faris', 'Vision HERO Faris',
        'Vision HERO Increase', 'Vision HERO Increase',
        'Vision HERO Vyon', 'Vision HERO Vyon',
        'Destiny HERO - Malicious', 'Destiny HERO - Malicious',
        'Destiny HERO - Denier', 'Destiny HERO - Plasma', 'Destiny HERO - Drawhand',
        'Destiny HERO - Dynatag', 'Destiny HERO - Celestial',
        'Ash Blossom & Joyous Spring', 'Ash Blossom & Joyous Spring',
        'Maxx "C"', 'Maxx "C"', 'Droll & Lock Bird', 'Droll & Lock Bird',
        'E - Emergency Call', 'E - Emergency Call', 'Reinforcement of the Army',
        'A Hero Lives', 'D - Force', 'Fusion Destiny',
        'Mask Change', 'Mask Change', 'Polymerization', 'Miracle Fusion',
        'Called by the Grave', 'Crossout Designator', 'Raigeki', "Harpie's Feather Duster"
      ],
      extra: [
        'Elemental HERO Sunrise', 'Elemental HERO Absolute Zero', 'Elemental HERO Escuridao',
        'Elemental HERO Flame Wingman', 'Destiny HERO - Dystopia', 'Destiny HERO - Dangerous',
        'Masked HERO Dark Law', 'Masked HERO Dark Law', 'Masked HERO Acid',
        'Vision HERO Adoration', 'Vision HERO Trinity',
        'Xtra HERO Cross Crusader', 'Xtra HERO Cross Crusader',
        'Xtra HERO Wonder Driver', 'Xtra HERO Dread Decimator'
      ]
    }
  },
  {
    id: 'yusei',
    name: 'Yusei Fudo',
    title: 'Synchro Turbo & Shooting Star Duelist',
    avatar: 'https://images.ygoprodeck.com/images/cards/44508094.jpg',
    signatureCard: 'Stardust Dragon',
    difficulty: 'Expert',
    dialog: 'Clustering wishes will become a new shining star! Ride the wind to the future!',
    deck: {
      main: [
        'Cyber Dragon', 'Effect Veiler', 'Effect Veiler',
        'Ash Blossom & Joyous Spring', 'Ash Blossom & Joyous Spring',
        'Necro Gardna', 'Necro Gardna', 'Destiny HERO - Malicious',
        'Gagaga Magician', 'Marshmallon',
        'Monster Reborn', 'Pot of Greed', 'Raigeki', 'Mystical Space Typhoon',
        'Dragon Ravine',
        'Solemn Judgment', 'Torrential Tribute', 'Mirror Force', 'Magic Cylinder'
      ],
      extra: [
        'Stardust Dragon', 'Black Rose Dragon', 'Number 39: Utopia', 'Decode Talker'
      ]
    }
  },

  {
    id: 'kaiser-ryo',
    name: 'Kaiser Ryo',
    title: 'Cyber Dragon Kaiser',
    avatar: 'https://images.ygoprodeck.com/images/cards/70095154.jpg',
    signatureCard: 'Cyber End Dragon',
    difficulty: 'Expert',
    dialog: 'Behold the ultimate power of Cyber Style! I will overwhelm you with mechanical fusion!',
    deck: {
      main: [
        'Cyber Dragon', 'Cyber Dragon', 'Cyber Dragon',
        'Cyber Dragon Core', 'Cyber Dragon Core', 'Cyber Dragon Core',
        'Cyber Dragon Herz', 'Cyber Dragon Herz',
        'Cyber Dragon Nachster', 'Cyber Dragon Nachster',
        'Cyber Emergency', 'Cyber Emergency', 'Cyber Emergency',
        'Cyber Repair Plant', 'Cyber Repair Plant',
        'Machine Duplication', 'Machine Duplication', 'Machine Duplication',
        'Power Bond', 'Power Bond', 'Power Bond',
        'Cyber Revsystem', 'Cyber Revsystem',
        'Overload Fusion', 'Overload Fusion',
        'Polymerization', 'Polymerization',
        'Limiter Removal', 'Monster Reborn', 'Raigeki',
        'Cybernetic Overflow', 'Cybernetic Overflow',
        'Mirror Force', 'Torrential Tribute', 'Solemn Judgment',
        'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Pot of Greed', 'Bottomless Trap Hole', 'Magic Cylinder'
      ],
      extra: [
        'Chimeratech Rampage Dragon', 'Chimeratech Rampage Dragon',
        'Cyber Dragon Infinity', 'Cyber Dragon Nova', 'Cyber Dragon Nova',
        'Chimeratech Fortress Dragon', 'Chimeratech Megafleet Dragon',
        'Cyber Dragon Sieger', 'Cyber End Dragon', 'Cyber Twin Dragon',
        'Blue-Eyes Ultimate Dragon', 'Number 39: Utopia', 'Decode Talker'
      ]
    }
  },

];

export interface SurvivalStage {
  stageNumber: number;
  name: string;
  title: string;
  avatar: string;
  startingLp: number;
  dialog: string;
  deck: DeckConfig;
  rewardLp: number;
  scoreBonus: number;
}

export const SURVIVAL_STAGES: SurvivalStage[] = [
  {
    stageNumber: 1,
    name: 'Academy Rookie',
    title: 'Duel Academy Novice',
    avatar: 'https://images.ygoprodeck.com/images/cards/74677422.jpg',
    startingLp: 8000,
    dialog: 'I just finished training! Let me see how strong a real duelist is!',
    rewardLp: 2000,
    scoreBonus: 500,
    deck: {
      main: [
        'Breaker the Magical Warrior', 'Exiled Force', 'Marshmallon', 'D.D. Warrior Lady',
        'Pot of Greed', 'Raigeki', 'Mirror Force', 'Magic Cylinder', 'Mountain'
      ],
      extra: ['Number 39: Utopia']
    }
  },
  {
    stageNumber: 2,
    name: 'Joey Wheeler',
    title: 'Miracle Gambler & Red-Eyes Warrior',
    avatar: 'https://images.ygoprodeck.com/images/cards/74677422.jpg',
    startingLp: 8000,
    dialog: 'You wanna duel with Joey Wheeler?! Get ready for Brooklyn rage!',
    rewardLp: 2000,
    scoreBonus: 1000,
    deck: {
      main: [
        'Cyber Dragon', 'Destiny HERO - Malicious', 'Breaker the Magical Warrior',
        'Honest', 'Kuriboh', 'Raigeki', 'Pot of Greed', 'Monster Reborn',
        'Polymerization', 'Mirror Force', 'Magic Cylinder', 'Torrential Tribute'
      ],
      extra: ['Elemental HERO Flame Wingman', 'Number 39: Utopia']
    }
  },
  {
    stageNumber: 3,
    name: 'Seto Kaiba',
    title: 'KaibaCorp President',
    avatar: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    startingLp: 8000,
    dialog: 'You managed to climb this far? Let my Blue-Eyes show you true power!',
    rewardLp: 2000,
    scoreBonus: 1500,
    deck: CPU_OPPONENTS[0].deck
  },
  {
    stageNumber: 4,
    name: 'Yami Yugi',
    title: 'King of Games',
    avatar: 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
    startingLp: 8000,
    dialog: 'The millennium puzzle resonates with your spirit. Show me your determination!',
    rewardLp: 2500,
    scoreBonus: 2000,
    deck: CPU_OPPONENTS[1].deck
  }
];
