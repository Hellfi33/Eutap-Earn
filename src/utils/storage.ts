import { GameState } from '../types';
import { getTierByCoins, getLevelTapCap } from '../data/tiers';
import { getDailyCipherWord } from '../data/ciphers';

const STORAGE_KEY = 'eutap_game_state_v1';

export const INITIAL_STATE: GameState = {
  coins: 0,
  totalEarned: 0,
  totalTaps: 0,
  tapLevel: 0,
  tapPower: 1,
  energy: 100000,
  maxEnergy: 100000,
  energyRechargeRate: 1,
  lastEnergyTimestamp: Date.now(),
  critChance: 0.02,
  stage: 1,
  reserveBalance: 0,
  diamonds: 0,
  keys: 0,

  streakDay: 0,
  lastClaimDate: null,

  cipherWord: getDailyCipherWord(),
  cipherSolvedToday: false,
  lastCipherDate: null,

  comboSolvedToday: false,
  lastComboDate: null,

  luckyChanceSpins: 6,
  luckyChanceNextRefillTime: 0,

  wheelOfFortuneSpins: 6,
  wheelOfFortuneNextRefillTime: 0,

  layHatchEggsAvailable: 5,
  layHatchNextRefillTime: 0,

  lastPphClaimTime: Date.now(),

  tapMilestonesRewarded: 0,
  pointMilestonesRewarded: 0,

  spinCount: 5,
  nextSpinRefillTime: 0,

  fullEnergyRemaining: 3,
  turboActiveUntil: 0,
  turboRemainingToday: 3,

  walletConnected: false,
  walletAddress: null,
  walletProvider: null,

  completedTaskIds: [],
  completedTapQuestIds: [],
  mineCardLevels: {},

  referralCode: 'EUTAP-884912',
  squadMembers: [],
  squadEarnings: 0,

  soundEnabled: true,
  hapticsEnabled: true,

  abcdRewardTimestamps: [],
  withdrawals: [],
};

export function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_STATE;
    const parsed = JSON.parse(saved);
    
    // Determine level tap cap according to player's tier
    const currentTier = getTierByCoins(parsed.totalEarned || 0);
    const markedCap = getLevelTapCap(currentTier.level);
    const targetMaxEnergy = Math.max(parsed.maxEnergy || 0, markedCap);

    // Refill gently between visits without automating fast counting
    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - (parsed.lastEnergyTimestamp || now)) / 1000);
    const rechargePerSec = parsed.energyRechargeRate || 1;
    const previousEnergy = typeof parsed.energy === 'number' && parsed.energy >= 0 ? parsed.energy : targetMaxEnergy;
    const restoredEnergy = Math.min(
      targetMaxEnergy,
      Math.floor(previousEnergy + elapsedSeconds * rechargePerSec)
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const isNewCipherDay = parsed.lastCipherDate && parsed.lastCipherDate !== todayStr;
    const todayCipherWord = getDailyCipherWord(todayStr);

    const isNewComboDay = parsed.lastComboDate && parsed.lastComboDate !== todayStr;

    // Check spin refills (5 free spins every 3 hours)
    let spinCount = typeof parsed.spinCount === 'number' ? parsed.spinCount : 5;
    let nextSpinRefillTime = typeof parsed.nextSpinRefillTime === 'number' ? parsed.nextSpinRefillTime : 0;
    if (spinCount < 5 && nextSpinRefillTime > 0 && now >= nextSpinRefillTime) {
      spinCount = 5;
      nextSpinRefillTime = 0;
    }

    // Check S*** Morse Lucky Chance Wheel 24-hour cycle (6 spins every 24h)
    let luckyChanceSpins = typeof parsed.luckyChanceSpins === 'number' ? parsed.luckyChanceSpins : 6;
    let luckyChanceNextRefillTime = typeof parsed.luckyChanceNextRefillTime === 'number' ? parsed.luckyChanceNextRefillTime : 0;
    if (luckyChanceNextRefillTime > 0 && now >= luckyChanceNextRefillTime) {
      luckyChanceSpins = 6;
      luckyChanceNextRefillTime = 0;
    }

    // Check Wheel of Fortune 24-hour cycle (6 spins every 24h)
    let wheelOfFortuneSpins = typeof parsed.wheelOfFortuneSpins === 'number' ? parsed.wheelOfFortuneSpins : 6;
    let wheelOfFortuneNextRefillTime = typeof parsed.wheelOfFortuneNextRefillTime === 'number' ? parsed.wheelOfFortuneNextRefillTime : 0;
    if (wheelOfFortuneNextRefillTime > 0 && now >= wheelOfFortuneNextRefillTime) {
      wheelOfFortuneSpins = 6;
      wheelOfFortuneNextRefillTime = 0;
    }

    // Check Lay & Hatch 7-hour cycle (5 eggs every 7h = 25,200,000 ms)
    let layHatchEggsAvailable = typeof parsed.layHatchEggsAvailable === 'number' ? parsed.layHatchEggsAvailable : 5;
    let layHatchNextRefillTime = typeof parsed.layHatchNextRefillTime === 'number' ? parsed.layHatchNextRefillTime : 0;
    if (layHatchNextRefillTime > 0 && now >= layHatchNextRefillTime) {
      layHatchEggsAvailable = 5;
      layHatchNextRefillTime = 0;
    }

    // Clean up expired ABCD reward timestamps older than 24 hours (86,400,000 ms)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const rawTimestamps = Array.isArray(parsed.abcdRewardTimestamps) ? parsed.abcdRewardTimestamps : [];
    const validAbcdTimestamps = rawTimestamps.filter((t: any) => typeof t === 'number' && now - t < TWENTY_FOUR_HOURS);

    // $80 joining bonus is permanently removed: joining/reset starts at 0
    let reserveBalance = typeof parsed.reserveBalance === 'number' ? parsed.reserveBalance : 0;
    if (parsed.legacyBonus80Removed !== true) {
      if (reserveBalance === 80) {
        reserveBalance = 0;
      }
    }

    return {
      ...INITIAL_STATE,
      ...parsed,
      tapLevel: currentTier.level,
      maxEnergy: targetMaxEnergy,
      stage: typeof parsed.stage === 'number' ? parsed.stage : 1,
      reserveBalance,
      legacyBonus80Removed: true,
      diamonds: typeof parsed.diamonds === 'number' ? parsed.diamonds : 0,
      keys: typeof parsed.keys === 'number' ? parsed.keys : 0,
      luckyChanceSpins,
      luckyChanceNextRefillTime,
      wheelOfFortuneSpins,
      wheelOfFortuneNextRefillTime,
      layHatchEggsAvailable,
      layHatchNextRefillTime,
      lastPphClaimTime: typeof parsed.lastPphClaimTime === 'number' ? parsed.lastPphClaimTime : now,
      tapMilestonesRewarded: typeof parsed.tapMilestonesRewarded === 'number' ? parsed.tapMilestonesRewarded : Math.floor((parsed.totalTaps || 0) / 5000),
      pointMilestonesRewarded: typeof parsed.pointMilestonesRewarded === 'number' ? parsed.pointMilestonesRewarded : Math.floor((parsed.totalEarned || 0) / 10000000),
      energy: restoredEnergy,
      lastEnergyTimestamp: now,
      cipherWord: todayCipherWord,
      cipherSolvedToday: isNewCipherDay ? false : Boolean(parsed.cipherSolvedToday),
      comboSolvedToday: isNewComboDay ? false : Boolean(parsed.comboSolvedToday),
      spinCount,
      nextSpinRefillTime,
      abcdRewardTimestamps: validAbcdTimestamps,
      completedTapQuestIds: Array.isArray(parsed.completedTapQuestIds) ? parsed.completedTapQuestIds : [],
      withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful fallback for storage quota
  }
}

export function resetGameState(): GameState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return {
    ...INITIAL_STATE,
    referralCode: 'EUTAP-' + Math.floor(100000 + Math.random() * 900000),
  };
}
