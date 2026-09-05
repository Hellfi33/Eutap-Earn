import { GameState } from '../types';

const STORAGE_KEY = 'eutap_game_state_v1';

export const INITIAL_STATE: GameState = {
  coins: 0,
  totalEarned: 0,
  totalTaps: 0,
  tapLevel: 0,
  tapPower: 1,
  energy: 1000,
  maxEnergy: 1000,
  energyRechargeRate: 3,
  lastEnergyTimestamp: Date.now(),
  critChance: 0.02,

  streakDay: 0,
  lastClaimDate: null,

  cipherWord: 'EUTAP',
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
    
    // Calculate stamina/energy regeneration between app visits, capped at maxEnergy
    // Note: This only restores energy (stamina), NEVER adds coins, adhering strictly to user requirement
    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - (parsed.lastEnergyTimestamp || now)) / 1000);
    const restoredEnergy = Math.min(
      parsed.maxEnergy || 1000,
      Math.floor((parsed.energy ?? 1000) + elapsedSeconds * (parsed.energyRechargeRate || 3))
    );

    return {
      ...INITIAL_STATE,
      ...parsed,
      energy: restoredEnergy,
      lastEnergyTimestamp: now,
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
