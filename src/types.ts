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
  category: 'skills' | 'nodes' | 'special';
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  maxLevel: number;
  effectType: 'tap_power' | 'max_energy' | 'recharge_speed' | 'crit_chance';
  effectValue: number; // e.g. +1 per level or +250 energy per level
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
  
  // Daily Streak
  streakDay: number;
  lastClaimDate: string | null;

  // Daily Cipher
  cipherWord: string;
  cipherSolvedToday: boolean;
  lastCipherDate: string | null;

  // Daily Combo
  comboSolvedToday: boolean;
  lastComboDate: string | null;

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
}
