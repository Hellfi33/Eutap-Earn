// 65-Number Roulette Table Configuration
// Numbers 0 to 64:
// 0 is Green (Special House Zero)
// Numbers 1 to 64 alternate in colors Red and Black (and high/low ranges, odd/even)
// Spun automatically every 60 seconds with 15-second wheel spin

export type RouletteColor = 'red' | 'black' | 'green';

export interface RoulettePocket {
  number: number;
  color: RouletteColor;
  label: string;
}

// Generate the standard 65 numbers (0 to 64)
// Pocket 0 is Green.
// 1 to 64 alternate Red and Black in balanced distribution:
export const ROULETTE_POCKETS: RoulettePocket[] = Array.from({ length: 65 }, (_, i) => {
  if (i === 0) {
    return { number: 0, color: 'green', label: '0' };
  }
  // Alternating pattern for 1-64
  // Standard roulette color pattern:
  const isRed = i % 2 === 1;
  return {
    number: i,
    color: isRed ? 'red' : 'black',
    label: i.toString(),
  };
});

// A randomized wheel sequence so numbers are distributed around the round wheel table
// We use a deterministic pseudo-random scramble so the circular layout resembles a real roulette wheel
export const WHEEL_SEQUENCE: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  37, 54, 41, 62, 45, 58, 39, 50, 64, 43, 56, 47, 60, 38, 51, 63, 42, 55, 48, 59, 40, 53, 46, 57, 44, 49, 52, 61
];

// Helper to look up pocket by number
export const getPocketByNumber = (num: number): RoulettePocket => {
  return ROULETTE_POCKETS[num] || { number: num, color: 'black', label: num.toString() };
};

export type BetType = 'color' | 'number' | 'range' | 'parity';

export interface RouletteBet {
  type: BetType;
  value: string | number; // 'red', 'black', 'green', number 0-64, 'odd', 'even', '1-32', '33-64'
  amount: number; // Staked in USD
  label: string;
  payoutMultiplier: number; // e.g. 2 for red/black/even/odd, 65 for single number, 2 for ranges, 35 for green
}

export const BET_MULTIPLIERS = {
  number: 65, // Direct hit on 1 of 65 numbers pays 65x (e.g. $1 -> $65)
  color_red_black: 2, // 2x payout for Red or Black
  color_green: 35, // 35x payout for single Green 0
  parity: 2, // 2x payout for Odd or Even
  range: 2, // 2x payout for 1-32 or 33-64
};
