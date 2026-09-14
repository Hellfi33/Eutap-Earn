import { Tier } from '../types';

export const TIERS: Tier[] = [
  { level: 0, name: 'Bronze', minCoins: 0, maxCoins: 100000, badgeColor: '#cd7f32' },
  { level: 1, name: 'Silver', minCoins: 100000, maxCoins: 300000, badgeColor: '#c0c0c0' },
  { level: 2, name: 'Gold', minCoins: 300000, maxCoins: 900000, badgeColor: '#ffd700' },
  { level: 3, name: 'Platinum', minCoins: 900000, maxCoins: 2700000, badgeColor: '#00e5ff' },
  { level: 4, name: 'Diamond', minCoins: 2700000, maxCoins: 8100000, badgeColor: '#b9f2ff' },
  { level: 5, name: 'Master', minCoins: 8100000, maxCoins: 24300000, badgeColor: '#a855f7' },
  { level: 6, name: 'Grandmaster', minCoins: 24300000, maxCoins: 72900000, badgeColor: '#ec4899' },
  { level: 7, name: 'Elite', minCoins: 72900000, maxCoins: 218700000, badgeColor: '#f97316' },
  { level: 8, name: 'Champion', minCoins: 218700000, maxCoins: 656100000, badgeColor: '#ef4444' },
  { level: 9, name: 'Lord', minCoins: 656100000, maxCoins: 1968300000, badgeColor: '#eab308' },
  { level: 10, name: 'Overlord', minCoins: 1968300000, maxCoins: 5904900000, badgeColor: '#38bdf8' },
  { level: 11, name: 'Titan', minCoins: 5904900000, maxCoins: 17714700000, badgeColor: '#818cf8' },
  { level: 12, name: 'Titan II', minCoins: 17714700000, maxCoins: 53144100000, badgeColor: '#c084fc' },
  { level: 13, name: 'Apex', minCoins: 53144100000, maxCoins: 159432300000, badgeColor: '#f43f5e' },
  { level: 14, name: 'Ascendant', minCoins: 159432300000, maxCoins: 478296900000, badgeColor: '#fb923c' },
  { level: 15, name: 'Immortal', minCoins: 478296900000, maxCoins: 1434890700000, badgeColor: '#facc15' },
  { level: 16, name: 'Mythic', minCoins: 1434890700000, maxCoins: 4304672100000, badgeColor: '#4ade80' },
  { level: 17, name: 'Celestial', minCoins: 4304672100000, maxCoins: 12914016300000, badgeColor: '#2dd4bf' },
  { level: 18, name: 'Transcendent', minCoins: 12914016300000, maxCoins: 38742048900000, badgeColor: '#60a5fa' },
  { level: 19, name: 'EuTap Sovereign', minCoins: 38742048900000, maxCoins: 116226146700000, badgeColor: '#e879f9' },
];

export const STAGE_2_TIERS: Tier[] = [
  { level: 0, name: 'Quantum Core', minCoins: 0, maxCoins: 100000, badgeColor: '#06b6d4' },
  { level: 1, name: 'Cyber Neon', minCoins: 100000, maxCoins: 300000, badgeColor: '#3b82f6' },
  { level: 2, name: 'Plasma Spark', minCoins: 300000, maxCoins: 900000, badgeColor: '#8b5cf6' },
  { level: 3, name: 'Hyper Matrix', minCoins: 900000, maxCoins: 2700000, badgeColor: '#d946ef' },
  { level: 4, name: 'Vortex Prime', minCoins: 2700000, maxCoins: 8100000, badgeColor: '#ec4899' },
  { level: 5, name: 'Quantum Weaver', minCoins: 8100000, maxCoins: 24300000, badgeColor: '#f43f5e' },
  { level: 6, name: 'Singularity Seeker', minCoins: 24300000, maxCoins: 72900000, badgeColor: '#fb7185' },
  { level: 7, name: 'Chrono Knight', minCoins: 72900000, maxCoins: 218700000, badgeColor: '#f97316' },
  { level: 8, name: 'Void Vanguard', minCoins: 218700000, maxCoins: 656100000, badgeColor: '#eab308' },
  { level: 9, name: 'Stellar Sage', minCoins: 656100000, maxCoins: 1968300000, badgeColor: '#a3e635' },
  { level: 10, name: 'Dimension Walker', minCoins: 1968300000, maxCoins: 5904900000, badgeColor: '#22c55e' },
  { level: 11, name: 'Dyson Architect', minCoins: 5904900000, maxCoins: 17714700000, badgeColor: '#10b981' },
  { level: 12, name: 'Warp Sovereign', minCoins: 17714700000, maxCoins: 53144100000, badgeColor: '#14b8a6' },
  { level: 13, name: 'Dark Energy Lord', minCoins: 53144100000, maxCoins: 159432300000, badgeColor: '#06b6d4' },
  { level: 14, name: 'Quantum Dominus', minCoins: 159432300000, maxCoins: 478296900000, badgeColor: '#0ea5e9' },
  { level: 15, name: 'Cosmic Archon', minCoins: 478296900000, maxCoins: 1434890700000, badgeColor: '#3b82f6' },
  { level: 16, name: 'Infinite Paragon', minCoins: 1434890700000, maxCoins: 4304672100000, badgeColor: '#6366f1' },
  { level: 17, name: 'Genesis Emperor', minCoins: 4304672100000, maxCoins: 12914016300000, badgeColor: '#8b5cf6' },
  { level: 18, name: 'Omega Regent', minCoins: 12914016300000, maxCoins: 38742048900000, badgeColor: '#a855f7' },
  { level: 19, name: 'Chronos Prime', minCoins: 38742048900000, maxCoins: 116226146700000, badgeColor: '#c084fc' },
  { level: 20, name: 'Multiverse Monarch', minCoins: 116226146700000, maxCoins: 348678440100000, badgeColor: '#d946ef' },
  { level: 21, name: 'Eternity Seraph', minCoins: 348678440100000, maxCoins: 1046035320300000, badgeColor: '#e879f9' },
  { level: 22, name: 'Nexus Overlord', minCoins: 1046035320300000, maxCoins: 3138105960900000, badgeColor: '#f43f5e' },
  { level: 23, name: 'Astral Deity', minCoins: 3138105960900000, maxCoins: 9414317882700000, badgeColor: '#fb7185' },
  { level: 24, name: 'Reality Shaper', minCoins: 9414317882700000, maxCoins: 28242953648100000, badgeColor: '#f59e0b' },
  { level: 25, name: 'Godhead Prime', minCoins: 28242953648100000, maxCoins: 84728860944300000, badgeColor: '#10b981' },
  { level: 26, name: 'Absolute Sovereign', minCoins: 84728860944300000, maxCoins: 254186582832900000, badgeColor: '#06b6d4' },
  { level: 27, name: 'Hyper Celestial', minCoins: 254186582832900000, maxCoins: 762559748498700000, badgeColor: '#38bdf8' },
  { level: 28, name: 'Omnipotent Ascendant', minCoins: 762559748498700000, maxCoins: 2287679245496100000, badgeColor: '#818cf8' },
  { level: 29, name: 'EuTap Quantum Zenith', minCoins: 2287679245496100000, maxCoins: 6863037736488300000, badgeColor: '#c084fc' },
];

export function getTiersList(stage: number = 1): Tier[] {
  return stage === 2 ? STAGE_2_TIERS : TIERS;
}

export function getTierByCoins(coins: number, stage: number = 1): Tier {
  const tiers = getTiersList(stage);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (coins >= tiers[i].minCoins) {
      return tiers[i];
    }
  }
  return tiers[0];
}

export function formatCompactNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
}

// Formats tap points specifically for the top reserve metrics panel:
// "The tap points is recorded there only when taps reach million, billion, trillion, and in M, B, T (e.g, 25B)"
// "If user taps hasn't reached this, it doesn't count there but down the main place."
export function formatMilTapPoints(points: number): string {
  if (!points || points < 1_000_000) {
    return '0';
  }
  if (points >= 1e12) {
    const val = points / 1e12;
    return (val >= 10 || val % 1 === 0 ? Math.floor(val) : val.toFixed(1).replace(/\.0$/, '')) + 'T';
  }
  if (points >= 1e9) {
    const val = points / 1e9;
    return (val >= 10 || val % 1 === 0 ? Math.floor(val) : val.toFixed(1).replace(/\.0$/, '')) + 'B';
  }
  const val = points / 1e6;
  return (val >= 10 || val % 1 === 0 ? Math.floor(val) : val.toFixed(1).replace(/\.0$/, '')) + 'M';
}

// Returns the marked tap capacity for each level:
// Level 0: 100,000 taps; each new level is x3 of previous level (e.g., Level 5: 24,300,000 taps)
export function getLevelTapCap(level: number, stage: number = 1): number {
  const tiers = getTiersList(stage);
  const tier = tiers.find((t) => t.level === level) || tiers[0];
  return tier.maxCoins;
}

// Formats energy/tap capacity values cleanly for the tap cap bar (e.g., 2.7M, 8.1M, 100K)
export function formatTapCap(num: number): string {
  return formatCompactNumber(num);
}
