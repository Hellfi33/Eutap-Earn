// Secret Game Outcome Fix Manager
// Manages classified developer/backdoor outcome overrides for:
// 1. Roulette 65 Spin
// 2. 2 Ludo Dice
// 3. Higher & Lower (H&L)
// Persistent across browser sessions via localStorage

import { WHEEL_SEQUENCE, getPocketByNumber } from '../data/rouletteData';

export interface RouletteFix {
  enabled: boolean;
  mode: 'number' | 'color';
  fixedNumber: number; // 0 to 64
  fixedColor: 'red' | 'black' | 'green';
}

export interface DiceFix {
  enabled: boolean;
  die1: number; // 1 to 6
  die2: number; // 1 to 6
}

export interface HnLFix {
  enabled: boolean;
  mode: 'exact' | 'higher' | 'lower' | 'zero';
  fixedNumber: number;
}

export interface GameFixConfig {
  roulette: RouletteFix;
  dice: DiceFix;
  hnl: HnLFix;
}

const STORAGE_KEY = 'secret_game_fix_config_v1';

const DEFAULT_CONFIG: GameFixConfig = {
  roulette: {
    enabled: false,
    mode: 'number',
    fixedNumber: 0,
    fixedColor: 'green',
  },
  dice: {
    enabled: false,
    die1: 6,
    die2: 6,
  },
  hnl: {
    enabled: false,
    mode: 'higher',
    fixedNumber: 777,
  },
};

/**
 * Load current fix configuration
 */
export function getGameFixConfig(): GameFixConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      roulette: { ...DEFAULT_CONFIG.roulette, ...(parsed.roulette || {}) },
      dice: { ...DEFAULT_CONFIG.dice, ...(parsed.dice || {}) },
      hnl: { ...DEFAULT_CONFIG.hnl, ...(parsed.hnl || {}) },
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Persist fix configuration
 */
export function saveGameFixConfig(config: GameFixConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save game fix config', e);
  }
}

/**
 * Check and retrieve fixed Roulette outcome
 */
export function getRouletteFix(): { targetNumber: number } | null {
  const config = getGameFixConfig();
  if (!config.roulette || !config.roulette.enabled) return null;

  if (config.roulette.mode === 'number') {
    const num = Math.min(64, Math.max(0, Math.floor(config.roulette.fixedNumber ?? 0)));
    return { targetNumber: num };
  }

  // Fixed by color
  const color = config.roulette.fixedColor;
  if (color === 'green') {
    return { targetNumber: 0 };
  }

  // Pick a pocket of matching color
  const matchingNumbers = WHEEL_SEQUENCE.filter((n) => getPocketByNumber(n).color === color);
  if (matchingNumbers.length > 0) {
    const pick = matchingNumbers[Math.floor(Math.random() * matchingNumbers.length)];
    return { targetNumber: pick };
  }

  return { targetNumber: 0 };
}

/**
 * Check and retrieve fixed Dice outcome (2 dice)
 */
export function getDiceFix(): { die1: number; die2: number } | null {
  const config = getGameFixConfig();
  if (!config.dice || !config.dice.enabled) return null;

  const d1 = Math.min(6, Math.max(1, Math.floor(config.dice.die1 || 6)));
  const d2 = Math.min(6, Math.max(1, Math.floor(config.dice.die2 || 6)));
  return { die1: d1, die2: d2 };
}

/**
 * Check if overrides are active
 */
export function isRouletteFixActive(): boolean {
  return !!getGameFixConfig().roulette?.enabled;
}

export function isDiceFixActive(): boolean {
  return !!getGameFixConfig().dice?.enabled;
}

export function isHnLFixActive(): boolean {
  return !!getGameFixConfig().hnl?.enabled;
}

/**
 * Check and retrieve fixed Higher & Lower (H&L) outcome
 */
export function getHnLFix(
  previousNumber: number,
  tier: { minRoll: number; maxRoll: number; threshold: number }
): number | null {
  const config = getGameFixConfig();
  if (!config.hnl || !config.hnl.enabled) return null;

  const mode = config.hnl.mode;

  if (mode === 'zero') {
    return 0;
  }

  if (mode === 'exact') {
    return Math.max(0, Math.floor(config.hnl.fixedNumber ?? 0));
  }

  if (mode === 'higher') {
    // Return a number strictly higher than previousNumber
    const step = Math.floor(Math.random() * 25) + 5;
    const candidate = previousNumber + step;
    if (candidate > tier.maxRoll) {
      return Math.max(previousNumber + 1, tier.maxRoll);
    }
    return candidate;
  }

  if (mode === 'lower') {
    // Return a number strictly lower than previousNumber (and >= 1 so it's not zero trap)
    if (previousNumber <= 1) {
      return 1;
    }
    const step = Math.max(1, Math.min(previousNumber - 1, Math.floor(Math.random() * 25) + 5));
    return Math.max(1, previousNumber - step);
  }

  return null;
}
