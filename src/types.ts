export interface Tier {
  level: number;
  name: string;
  minCoins: number;
  maxCoins: number;
  badgeColor: string;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  category: 'daily' | 'social' | 'community' | 'web3';
  icon: string;
  actionUrl?: string;
  completed: boolean;
  verifying?: boolean;
}

export interface MineCard {
  id: string;
  name: string;
  category: 'skills' | 'nodes' | 'special' | 'protocol';
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  maxLevel: number;
  effectType: 'tap_power' | 'max_energy' | 'recharge_speed' | 'crit_chance';
  effectValue: number; // e.g. +1 per level or +250 energy per level
  secondaryEffectType?: 'tap_power' | 'max_energy' | 'recharge_speed' | 'crit_chance';
  secondaryEffectValue?: number;
  icon: string;
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  level: number;
  joinedAt: string;
  earnedForYou: number;
  isPremium: boolean;
}

export interface FloatingTapNumber {
  id: number;
  x: number;
  y: number;
  amount: number;
  isCrit?: boolean;
}

export interface SeasonalSkin {
  level: number;
  seasonNumber: number;
  seasonTitle: string;
  skinName: string;
  characterTitle: string;
  description: string;
  avatarImg: string;
  themeColor: string;
  secondaryColor: string;
  glowColor: string;
  bgGradient: string;
  bgPattern: 'copper_grid' | 'silver_beams' | 'gold_dust' | 'cyber_skyline' | 'ice_crystals' | 'purple_nebula' | 'synth_lines' | 'solar_embers' | 'crimson_matrix' | 'imperial_gold' | 'quantum_grid' | 'titan_lightning' | 'void_rift' | 'apex_flame' | 'solar_corona' | 'immortal_light' | 'emerald_matrix' | 'celestial_spiral' | 'transcendent_stars' | 'sovereign_omni';
  ringStyle: {
    borderColor: string;
    borderDashed: boolean;
    ringGlow: string;
    outerAura: string;
    spinDuration: string;
  };
  characterVisuals: {
    accessory: 'bronze_shades' | 'silver_earpiece' | 'gold_collar_pin' | 'cyber_monocle' | 'diamond_visor' | 'plasma_crown' | 'matrix_hud' | 'amber_tracker' | 'ruby_targeter' | 'imperial_tiara' | 'quantum_halo' | 'titan_plates' | 'violet_void' | 'apex_optics' | 'solar_crest' | 'eternal_halo' | 'jade_horns' | 'celestial_eye' | 'cosmos_constellation' | 'sovereign_crown';
    suitAccentColor: string;
    auraFilter: string;
    ambientParticles: string;
  };
}

export interface GameState {
  coins: number;
  totalEarned: number;
  totalTaps: number;
  tapLevel: number; // Level 0 default
  tapPower: number; // +1 base tap rate
  energy: number; // current energy
  maxEnergy: number; // max energy
  energyRechargeRate: number; // energy per second
  lastEnergyTimestamp: number;
  critChance: number; // e.g., 0.05
  
  // Stage (1 = Standard 20 Levels, 2 = Quantum Upgraded 30 Levels)
  stage: number;

  // Seasonal Skin (null = auto-evolve with player level)
  equippedSkinLevel?: number | null;
  
  // Reserves and Special Currency
  reserveBalance: number; // $80.00 base reserve balance for every player
  diamonds: number; // Diamonds currency earned by player
  keys: number; // Keys collected by player (mini-games, cipher, daily events)

  // Daily Streak
  streakDay: number;
  lastClaimDate: string | null;

  // Daily Cipher
  cipherWord: string;
  cipherSolvedToday: boolean;
  lastCipherDate: string | null;

  // Daily Combo (24hr reset, once per day)
  comboSolvedToday: boolean;
  lastComboDate: string | null;

  // S*** Morse Lucky Chance Wheel (6 spins per 24 hours + extra spins)
  luckyChanceSpins: number;
  luckyChanceNextRefillTime: number;

  // Milestone Benefits tracking (5,000 taps & 10M points)
  tapMilestonesRewarded: number;
  pointMilestonesRewarded: number;

  // Lucky Wheel (5 free spins every 3 hours)
  spinCount: number;
  nextSpinRefillTime: number; // timestamp in ms when spins refill

  // Boosters
  fullEnergyRemaining: number;
  turboActiveUntil: number; // timestamp
  turboRemainingToday: number;

  // Wallet
  walletConnected: boolean;
  walletAddress: string | null;
  walletProvider: string | null;

  // Tasks
  completedTaskIds: string[];

  // Mine Cards levels: cardId -> level
  mineCardLevels: Record<string, number>;

  // Friends & Referrals
  referralCode: string;
  squadMembers: SquadMember[];
  squadEarnings: number;

  // Settings
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // Secret ABCD Reward (max 2x every 24 hours)
  abcdRewardTimestamps: number[];
}
