import { MINE_CARDS } from './mineCards';
import { getTierByCoins } from './tiers';

export const MIN_WITHDRAWAL_THRESHOLD = 90; // $90.00 USD
export const MIN_WITHDRAWAL_POINTS = 100_000_000; // 100,000,000 Points
export const MIN_WITHDRAWAL_LEVEL = 9; // Level 9, Lord
export const MIN_PPH_CARD_LEVEL = 5; // Level 5 for each PPH card

export const PPH_CARDS = MINE_CARDS.filter((c) => c.category === 'pph');

export interface WithdrawalEligibility {
  playerLevel: number;
  tierName: string;
  isLevelMet: boolean;

  pphCardsTotal: number;
  pphCardsMetCount: number;
  isPphMet: boolean;
  incompletePphCards: { id: string; name: string; currentLevel: number }[];

  reserveBalance: number;
  minThreshold: number;
  isThresholdMet: boolean;

  coins: number;
  minPoints: number;
  isPointsMet: boolean;

  playerKeys: number;
  minKeysRequiredForThreshold: number;
  hasEnoughKeysForThreshold: boolean;
  keyRatio: number;

  allCriteriaMet: boolean;
  metCriteriaCount: number;
  totalCriteriaCount: number;
}

/**
 * Evaluates whether player satisfies all 5 withdrawal criteria:
 * 1. Player reached Level 9 (Lord)
 * 2. All PPH cards in Mine are at least Level 5
 * 3. $ Reserve balance meets $90.00 minimum threshold
 * 4. Point balance is over 100,000,000 (100M) points
 * 5. Standard key fee ratio (6 Keys per $1.00 USD)
 */
export function evaluateWithdrawalEligibility(
  coins: number,
  tapLevel: number,
  reserveBalance: number,
  playerKeys: number,
  mineCardLevels: Record<string, number> = {},
  stage: number = 1,
  totalEarned: number = 0
): WithdrawalEligibility {
  const currentTier = getTierByCoins(totalEarned || coins, stage);
  const effectiveLevel = Math.max(tapLevel || 0, currentTier.level);
  const isLevelMet = effectiveLevel >= MIN_WITHDRAWAL_LEVEL;

  const incompletePphCards: { id: string; name: string; currentLevel: number }[] = [];
  let pphCardsMetCount = 0;

  for (const card of PPH_CARDS) {
    const lvl = mineCardLevels[card.id] || 0;
    if (lvl >= MIN_PPH_CARD_LEVEL) {
      pphCardsMetCount++;
    } else {
      incompletePphCards.push({ id: card.id, name: card.name, currentLevel: lvl });
    }
  }

  const isPphMet = pphCardsMetCount === PPH_CARDS.length;
  const isThresholdMet = reserveBalance >= MIN_WITHDRAWAL_THRESHOLD;
  const isPointsMet = coins >= MIN_WITHDRAWAL_POINTS;
  const minKeysRequiredForThreshold = MIN_WITHDRAWAL_THRESHOLD * 6; // 540 keys
  const hasEnoughKeysForThreshold = playerKeys >= minKeysRequiredForThreshold;

  let metCriteriaCount = 0;
  if (isLevelMet) metCriteriaCount++;
  if (isPphMet) metCriteriaCount++;
  if (isThresholdMet) metCriteriaCount++;
  if (isPointsMet) metCriteriaCount++;
  if (hasEnoughKeysForThreshold) metCriteriaCount++;

  const allCriteriaMet =
    isLevelMet && isPphMet && isThresholdMet && isPointsMet && hasEnoughKeysForThreshold;

  return {
    playerLevel: effectiveLevel,
    tierName: currentTier.name,
    isLevelMet,
    pphCardsTotal: PPH_CARDS.length,
    pphCardsMetCount,
    isPphMet,
    incompletePphCards,
    reserveBalance,
    minThreshold: MIN_WITHDRAWAL_THRESHOLD,
    isThresholdMet,
    coins,
    minPoints: MIN_WITHDRAWAL_POINTS,
    isPointsMet,
    playerKeys,
    minKeysRequiredForThreshold,
    hasEnoughKeysForThreshold,
    keyRatio: 6,
    allCriteriaMet,
    metCriteriaCount,
    totalCriteriaCount: 5,
  };
}
