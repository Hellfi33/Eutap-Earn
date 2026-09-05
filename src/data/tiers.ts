import { Tier } from '../types';

export const TIERS: Tier[] = [
  { level: 0, name: 'Bronze', minCoins: 0, maxCoins: 2500, badgeColor: '#cd7f32' },
  { level: 1, name: 'Silver', minCoins: 2500, maxCoins: 15000, badgeColor: '#c0c0c0' },
  { level: 2, name: 'Gold', minCoins: 15000, maxCoins: 60000, badgeColor: '#ffd700' },
  { level: 3, name: 'Platinum', minCoins: 60000, maxCoins: 250000, badgeColor: '#00e5ff' },
  { level: 4, name: 'Diamond', minCoins: 250000, maxCoins: 1000000, badgeColor: '#b9f2ff' },
  { level: 5, name: 'Master', minCoins: 1000000, maxCoins: 5000000, badgeColor: '#a855f7' },
  { level: 6, name: 'Grandmaster', minCoins: 5000000, maxCoins: 25000000, badgeColor: '#ec4899' },
  { level: 7, name: 'Lord', minCoins: 25000000, maxCoins: 100000000, badgeColor: '#f97316' },
  { level: 8, name: 'Creator', minCoins: 100000000, maxCoins: 500000000, badgeColor: '#ef4444' },
  { level: 9, name: 'Titan', minCoins: 500000000, maxCoins: 2000000000, badgeColor: '#eab308' },
  { level: 10, name: 'Titan II', minCoins: 2000000000, maxCoins: 10000000000, badgeColor: '#38bdf8' },
];

export function getTierByCoins(coins: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (coins >= TIERS[i].minCoins) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}
