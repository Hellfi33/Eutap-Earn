import { MineCard } from '../types';

export const MINE_CARDS: MineCard[] = [
  {
    id: 'multitap',
    name: 'Tap Rate Multiplier',
    category: 'skills',
    description: 'Increases the amount of $EUTAP earned per single tap (+1 tap rate per level).',
    baseCost: 8000,
    costMultiplier: 1.85,
    level: 0,
    maxLevel: 25,
    effectType: 'tap_power',
    effectValue: 1,
    icon: 'zap',
  },
  {
    id: 'energy-battery',
    name: 'Energy Battery Pack',
    category: 'skills',
    description: 'Increases your maximum tap energy tank (+500 energy limit per level).',
    baseCost: 12000,
    costMultiplier: 1.9,
    level: 0,
    maxLevel: 20,
    effectType: 'max_energy',
    effectValue: 500,
    icon: 'battery-charging',
  },
  {
    id: 'recharge-dynamo',
    name: 'Fast Energy Dynamo',
    category: 'skills',
    description: 'Regenerates your tap stamina faster (+1 energy per second when holding).',
    baseCost: 18000,
    costMultiplier: 2.1,
    level: 0,
    maxLevel: 15,
    effectType: 'recharge_speed',
    effectValue: 1,
    icon: 'activity',
  },
  {
    id: 'crit-tap',
    name: 'Critical Tap Overclock',
    category: 'skills',
    description: 'Adds a chance to trigger super critical coins on each tap (+2% chance per level).',
    baseCost: 25000,
    costMultiplier: 2.3,
    level: 0,
    maxLevel: 10,
    effectType: 'crit_chance',
    effectValue: 0.02,
    icon: 'sparkles',
  },
  {
    id: 'l2-validator',
    name: 'EuTap L2 Node',
    category: 'nodes',
    description: 'Validates on-chain tap proofs, boosting your tap rate (+2 per level).',
    baseCost: 40000,
    costMultiplier: 2.4,
    level: 0,
    maxLevel: 15,
    effectType: 'tap_power',
    effectValue: 2,
    icon: 'cpu',
  },
  {
    id: 'zk-circuit',
    name: 'Zero-Knowledge Tap Rollup',
    category: 'nodes',
    description: 'Rolls up micro-taps on-chain for increased tap reward power (+4 per level).',
    baseCost: 75000,
    costMultiplier: 2.6,
    level: 0,
    maxLevel: 10,
    effectType: 'tap_power',
    effectValue: 4,
    icon: 'shield-check',
  },
  {
    id: 'quantum-core',
    name: 'Quantum Tap Accelerator',
    category: 'special',
    description: 'High-frequency quantum hardware offering massive tap power boost (+10 per level).',
    baseCost: 150000,
    costMultiplier: 2.8,
    level: 0,
    maxLevel: 10,
    effectType: 'tap_power',
    effectValue: 10,
    icon: 'atom',
  },
];

/**
 * Calculates upgrade cost in thousands of points.
 * For tap rate leveling (multitap): starts strictly at 8,000 and randomly increases in thousands.
 */
export function getCardCost(card: MineCard, currentLevel: number): number {
  if (card.id === 'multitap') {
    if (currentLevel === 0) return 8000;
    // Deterministic pseudo-random variation per level, strictly in thousands of points
    let cumulative = 8000;
    for (let lvl = 1; lvl <= currentLevel; lvl++) {
      // Random variance factor between 1.45 and 1.85 based on level hash
      const variance = 1.45 + (((lvl * 37 + 13) % 40) / 100);
      const stepIncrease = Math.round((cumulative * (variance - 1)) / 1000) * 1000;
      const minStep = 4000 + lvl * 2000;
      cumulative += Math.max(minStep, stepIncrease);
    }
    return cumulative;
  }

  // All other cards: calculate cost and ensure rounded to nearest 1,000 points
  const rawCost = card.baseCost * Math.pow(card.costMultiplier, currentLevel);
  return Math.round(rawCost / 1000) * 1000;
}
