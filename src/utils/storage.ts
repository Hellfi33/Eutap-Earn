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
  reserveBalance: 80.00,
  diamonds: 0,

  streakDay: 0,
  lastClaimDate: null,

  cipherWord: getDailyCipherWord(),
  cipherSolvedToday: false,
  lastCipherDate: null,

  comboSolvedToday: false,
  lastComboDate: null,

  fullEnergyRemaining: 3,
  turboActiveUntil: 0,
  turboRemainingToday: 3,

  walletConnected: false,
  walletAddress: null,
  walletProvider: null,

  completedTaskIds: [],
  mineCardLevels: {},

  referralCode: 'EUTAP-884912',
  squadMembers: [],
  squadEarnings: 0,

  soundEnabled: true,
  hapticsEnabled: true,
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

    return {
      ...INITIAL_STATE,
      ...parsed,
      tapLevel: currentTier.level,
      maxEnergy: targetMaxEnergy,
      reserveBalance: typeof parsed.reserveBalance === 'number' ? parsed.reserveBalance : 80.00,
      diamonds: typeof parsed.diamonds === 'number' ? parsed.diamonds : 0,
      energy: restoredEnergy,
      lastEnergyTimestamp: now,
      cipherWord: todayCipherWord,
      cipherSolvedToday: isNewCipherDay ? false : Boolean(parsed.cipherSolvedToday),
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
