import React, { useState } from 'react';
import {
  User,
  Shield,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  X,
  Award,
  Zap,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_GRADIENTS, generateRandomUserId, validateUserId } from '../utils/userProfile';
import { soundFx } from '../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  playerLevel: number;
  playerStage: number;
  totalEarned: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  playerLevel,
  playerStage,
  totalEarned,
}) => {
  const [customUserId, setCustomUserId] = useState(profile.userId);
  const [customUsername, setCustomUsername] = useState(profile.username);
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(profile.avatarColor);
  const [customStatus, setCustomStatus] = useState(profile.statusText || '');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    try {
      navigator.clipboard.writeText(customUserId);
      setCopied(true);
      soundFx.playReward();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleGenerateRandom = () => {
    soundFx.playClick();
    const newId = generateRandomUserId();
    setCustomUserId(newId);
    setValidationError(null);
  };

  const handleSave = () => {
    const validation = validateUserId(customUserId);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid User ID');
      soundFx.playMorseError();
      return;
    }

    const trimmedName = customUsername.trim() || `Player_${customUserId.replace('#', '')}`;

    const updated: UserProfile = {
      ...profile,
      userId: customUserId.trim().toUpperCase(),
      username: trimmedName,
      avatarColor: selectedAvatarColor,
      statusText: customStatus.trim() || 'Tapping in EUTAP',
    };

    onSaveProfile(updated);
    soundFx.playReward();
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 600);
  };

  const joinDateFormatted = new Date(profile.joinedTimestamp || Date.now()).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0a0d16] border border-cyan-500/40 rounded-3xl p-4 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col space-y-3.5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide font-['Rajdhani',sans-serif] uppercase">
                Player ID & Identity
              </h2>
              <p className="text-[10px] text-slate-400">Personalize your platform identity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Identity Badge Preview */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#121826] to-[#0d121c] border border-cyan-500/30 flex items-center gap-3 shadow-inner relative overflow-hidden">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedAvatarColor} flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white/20 shrink-0`}
          >
            {(customUsername || customUserId).substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white truncate font-['Rajdhani',sans-serif]">
                {customUsername || 'Player'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-mono font-black border border-cyan-400/30">
                {customUserId}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {customStatus || 'Active Tapper'}
            </p>

            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
              <span className="text-amber-400 font-bold">Lv.{playerLevel}</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">Stage {playerStage}</span>
              <span>•</span>
              <span>Joined {joinDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Section 1: User ID Customization */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Unique User ID
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="text-[9px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 transition"
                title="Generate Random ID"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Random
              </button>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/30 transition"
              >
                {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            value={customUserId}
            maxLength={14}
            onChange={(e) => {
              setCustomUserId(e.target.value.toUpperCase());
              setValidationError(null);
            }}
            placeholder="#EU-XXXX"
            className="w-full px-3 py-2 bg-[#121622] border border-white/10 focus:border-cyan-400/70 rounded-xl text-xs text-white font-mono uppercase tracking-wider outline-none shadow-inner transition"
          />
          {validationError && (
            <p className="text-[10px] text-rose-400 font-semibold px-1">{validationError}</p>
          )}
          <p className="text-[9px] text-slate-500 px-1">
            Must start with # (e.g. #EU-8492, #CHAMP). Visible to everyone on the platform.
          </p>
        </div>

        {/* Section 2: Display Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
            <User className="w-3 h-3 text-cyan-400" /> Display Name / Nickname
          </label>
          <input
            type="text"
            value={customUsername}
            maxLength={20}
            onChange={(e) => setCustomUsername(e.target.value)}
            placeholder="Enter your personalized name..."
            className="w-full px-3 py-2 bg-[#121622] border border-white/10 focus:border-cyan-400/70 rounded-xl text-xs text-white outline-none shadow-inner transition"
          />
        </div>

        {/* Section 3: Status / Motto */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Status / Motto
          </label>
          <input
            type="text"
            value={customStatus}
            maxLength={40}
            onChange={(e) => setCustomStatus(e.target.value)}
            placeholder="e.g. Grinding for Stage II..."
            className="w-full px-3 py-2 bg-[#121622] border border-white/10 focus:border-cyan-400/70 rounded-xl text-xs text-white outline-none shadow-inner transition"
          />
        </div>

        {/* Section 4: Avatar Theme Color */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Avatar Theme Gradient
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_GRADIENTS.map((grad) => {
              const isSelected = selectedAvatarColor === grad.class;
              return (
                <button
                  key={grad.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAvatarColor(grad.class);
                  }}
                  className={`h-9 rounded-xl bg-gradient-to-br ${grad.class} flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'opacity-60 hover:opacity-100 hover:scale-100'
                  }`}
                  title={grad.label}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={savedFeedback}
          className={`w-full py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-98 ${
            savedFeedback
              ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer'
          }`}
        >
          {savedFeedback ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Identity Updated!</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Save & Update User ID</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
