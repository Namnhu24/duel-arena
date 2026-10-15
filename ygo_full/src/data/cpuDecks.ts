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
    title: 'Slifer Red & Elemental HERO Specialist',
    avatar: 'https://images.ygoprodeck.com/images/cards/35809262.jpg',
    signatureCard: 'Elemental HERO Flame Wingman',
    difficulty: 'Medium',
    dialog: 'Get your game on! Let’s have a fun match and summon some awesome fusions!',
    deck: {
      main: [
        'Destiny HERO - Malicious', 'Destiny HERO - Malicious',
        'Honest', 'Kuriboh', 'Exiled Force', 'D.D. Warrior Lady',
        'Prank-Kids Rocksies', 'Prank-Kids Dropsies',
        'Marshmallon', 'Breaker the Magical Warrior',
        'Polymerization', 'Polymerization', 'Monster Reborn', 'Pot of Greed',
        'Raigeki', 'Dark Hole', 'Mystical Space Typhoon',
        'Mirror Force', 'Magic Cylinder', 'Bottomless Trap Hole'
      ],
      extra: [
        'Elemental HERO Flame Wingman', 'Prank-Kids Rocket Ride', 'Number 39: Utopia'
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
  }
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
    startingLp: 4000,
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
    startingLp: 6000,
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
  },
  {
    stageNumber: 5,
    name: 'Shadow Pharaoh',
    title: 'Supreme Sovereign of the Shadow Realm',
    avatar: 'https://images.ygoprodeck.com/images/cards/10000020.jpg',
    startingLp: 10000,
    dialog: 'Mortal, you have reached the summit of the Duel Tower. Face the ultimate darkness!',
    rewardLp: 0,
    scoreBonus: 5000,
    deck: {
      main: [
        'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon', 'Dark Magician', 'Dark Magician',
        'Apprentice Illusion Magician', 'Cyber Dragon', 'Cyber Dragon',
        'Ash Blossom & Joyous Spring', 'Effect Veiler', 'Honest',
        'Raigeki', 'Dark Hole', 'Monster Reborn', 'Pot of Greed', 'Necrovalley',
        'Solemn Judgment', 'Mirror Force', 'Magic Cylinder', 'Bottomless Trap Hole'
      ],
      extra: [
        'Blue-Eyes Ultimate Dragon', 'Stardust Dragon', 'Number 39: Utopia', 'Decode Talker'
      ]
    }
  }
];
