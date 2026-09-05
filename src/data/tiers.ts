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

export function getTierByCoins(coins: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (coins >= TIERS[i].minCoins) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

export function formatCompactNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
}
