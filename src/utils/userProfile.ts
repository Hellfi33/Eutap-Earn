import { UserProfile } from '../types';

const USER_PROFILE_STORAGE_KEY = 'eutap_player_identity_v4';

export const AVATAR_GRADIENTS = [
  { id: 'cyan-blue', label: 'Quantum Cyan', class: 'from-cyan-500 to-blue-600', border: 'border-cyan-400' },
  { id: 'amber-orange', label: 'Solar Gold', class: 'from-amber-500 to-orange-600', border: 'border-amber-400' },
  { id: 'emerald-teal', label: 'Matrix Emerald', class: 'from-emerald-500 to-teal-600', border: 'border-emerald-400' },
  { id: 'purple-indigo', label: 'Cosmic Violet', class: 'from-purple-500 to-indigo-600', border: 'border-purple-400' },
  { id: 'rose-pink', label: 'Crimson Pulse', class: 'from-rose-500 to-pink-600', border: 'border-rose-400' },
  { id: 'blue-violet', label: 'Deep Abyss', class: 'from-blue-600 to-violet-700', border: 'border-blue-400' },
];

export function generateRandomUserId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `#EU-${code}`;
}

export function loadUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.userId && parsed.username) {
        return parsed;
      }
    }
  } catch {}

  // Generate initial personalized user profile
  const initialUserId = generateRandomUserId();
  const defaultProfile: UserProfile = {
    userId: initialUserId,
    username: `Player_${initialUserId.replace('#', '')}`,
    avatarColor: 'from-cyan-500 to-blue-600',
    statusText: 'Tapping in EUTAP Stage I',
    joinedTimestamp: Date.now(),
  };

  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
  } catch {}

  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    // Dispatch local storage event for multi-tab sync
    window.dispatchEvent(
      new CustomEvent('eutap_profile_updated', {
        detail: profile,
      })
    );
  } catch {}
}

export function validateUserId(id: string): { valid: boolean; error?: string } {
  const trimmed = id.trim();
  if (!trimmed) {
    return { valid: false, error: 'User ID cannot be empty' };
  }
  if (!trimmed.startsWith('#')) {
    return { valid: false, error: 'User ID must start with #' };
  }
  if (trimmed.length < 3 || trimmed.length > 14) {
    return { valid: false, error: 'User ID must be between 3 and 14 characters' };
  }
  const body = trimmed.slice(1);
  if (!/^[A-Za-z0-9_-]+$/.test(body)) {
    return { valid: false, error: 'User ID can only contain letters, numbers, and dashes' };
  }
  return { valid: true };
}
