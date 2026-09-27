export interface TreePluckLimitState {
  playsRemaining: number; // 0, 1, or 2
  cooldownExpiresAt: number; // timestamp ms
}

const STORAGE_KEY = 'quantum_tap_tree_pluck_limit_v1';
export const TREE_PLUCK_CYCLE_MS = 6 * 60 * 60 * 1000; // 6 hours

export const getTreePluckLimit = (): TreePluckLimitState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { playsRemaining: 2, cooldownExpiresAt: 0 };
    }
    const parsed: TreePluckLimitState = JSON.parse(raw);
    const now = Date.now();

    // If cooldown has passed, replenish 2 plays
    if (parsed.cooldownExpiresAt > 0 && now >= parsed.cooldownExpiresAt) {
      const resetState: TreePluckLimitState = { playsRemaining: 2, cooldownExpiresAt: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
      return resetState;
    }

    return {
      playsRemaining: Math.max(0, Math.min(2, parsed.playsRemaining ?? 2)),
      cooldownExpiresAt: parsed.cooldownExpiresAt || 0,
    };
  } catch {
    return { playsRemaining: 2, cooldownExpiresAt: 0 };
  }
};

export const consumeTreePluckPlay = (): TreePluckLimitState => {
  const current = getTreePluckLimit();
  const now = Date.now();

  const nextRemaining = Math.max(0, current.playsRemaining - 1);
  let nextExpiresAt = current.cooldownExpiresAt;

  // When first play is used or if previous cooldown has elapsed, start the 6-hour window
  if (current.playsRemaining === 2 || !nextExpiresAt || nextExpiresAt <= now) {
    nextExpiresAt = now + TREE_PLUCK_CYCLE_MS;
  }

  const newState: TreePluckLimitState = {
    playsRemaining: nextRemaining,
    cooldownExpiresAt: nextExpiresAt,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    console.error('Failed to save tree pluck limit', e);
  }

  return newState;
};

export const formatCooldownTime = (msRemaining: number): string => {
  if (msRemaining <= 0) return '00:00:00';
  const totalSec = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
