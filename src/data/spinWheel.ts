export interface WheelSegment {
  id: number;
  label: string;
  points: number;
  color: string;
  textColor: string;
  strokeColor: string;
  weight: number; // Probability weight
  isJackpot?: boolean;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    id: 0,
    label: '500K',
    points: 500000,
    color: '#1e293b', // Deep Slate
    textColor: '#f8fafc',
    strokeColor: '#334155',
    weight: 32, // Most frequent base minimum
  },
  {
    id: 1,
    label: '1.5M',
    points: 1500000,
    color: '#9a3412', // Warm Amber Red
    textColor: '#fed7aa',
    strokeColor: '#ea580c',
    weight: 5,
  },
  {
    id: 2,
    label: '750K',
    points: 750000,
    color: '#1e1b4b', // Deep Indigo
    textColor: '#e0e7ff',
    strokeColor: '#4338ca',
    weight: 18,
  },
  {
    id: 3,
    label: '2.0M',
    points: 2000000,
    color: '#064e3b', // Emerald Web3
    textColor: '#a7f3d0',
    strokeColor: '#059669',
    weight: 2,
  },
  {
    id: 4,
    label: '600K',
    points: 600000,
    color: '#334155', // Slate
    textColor: '#fef08a',
    strokeColor: '#475569',
    weight: 22,
  },
  {
    id: 5,
    label: '1.0M',
    points: 1000000,
    color: '#581c87', // Royal Purple
    textColor: '#f3e8ff',
    strokeColor: '#9333ea',
    weight: 8,
  },
  {
    id: 6,
    label: '800K',
    points: 800000,
    color: '#164e63', // Cyan Teal
    textColor: '#cffafe',
    strokeColor: '#0891b2',
    weight: 12,
  },
  {
    id: 7,
    label: '3.0M 👑',
    points: 3000000,
    color: '#7f1d1d', // Radiant Crimson Gold - Grand Jackpot
    textColor: '#fbbf24',
    strokeColor: '#f59e0b',
    weight: 0.8, // Ultra rare ("hardly will player get the 3,000,000 point")
    isJackpot: true,
  },
];

export const MAX_FREE_SPINS = 5;
export const SPIN_REFILL_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Weighted random selector: Pick winning segment based on rarity
 */
export function pickWheelWinnerIndex(): number {
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    if (randomVal < WHEEL_SEGMENTS[i].weight) {
      return i;
    }
    randomVal -= WHEEL_SEGMENTS[i].weight;
  }

  return 0; // Fallback minimum
}

/**
 * Formats ticking countdown until next 3-hour free spins refill
 */
export function getSpinRefillCountdown(nextRefillTime: number): string {
  const now = Date.now();
  const diffMs = Math.max(0, nextRefillTime - now);
  if (diffMs <= 0) return '00:00:00';

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
