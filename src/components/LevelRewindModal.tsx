import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Lock,
  CheckCircle2,
  X,
  Shield,
  ArrowDownLeft,
  Sparkles,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { getTiersList, getLevelTapCap, formatCompactNumber } from '../data/tiers';
import { Tier } from '../types';
import { soundFx } from '../utils/audio';

interface LevelRewindModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  stage: number;
  onRewindLevel: (targetLevel: number) => void;
}

export const LevelRewindModal: React.FC<LevelRewindModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  stage,
  onRewindLevel,
}) => {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const tiers = useMemo(() => getTiersList(stage || 1), [stage]);
  const currentTier = useMemo(
    () => tiers[Math.min(currentLevel, tiers.length - 1)] || tiers[0],
    [tiers, currentLevel]
  );

  if (!isOpen) return null;

  const handleSelectLevel = (tier: Tier) => {
    // Player can only reset back to a previous level and cannot go ahead
    if (tier.level >= currentLevel) {
      soundFx.playMorseError();
      return;
    }

    soundFx.playClick();
    setSelectedTier(tier);
    setShowConfirm(true);
  };

  const handleConfirmRewind = () => {
    if (!selectedTier || selectedTier.level >= currentLevel) return;

    soundFx.playReward();
    onRewindLevel(selectedTier.level);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setShowConfirm(false);
      setSelectedTier(null);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090d16] border-2 border-indigo-500/60 shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col max-h-[92vh] font-sans text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-indigo-500/30 flex items-center justify-between bg-gradient-to-r from-indigo-950/80 via-slate-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                  <span>Level Rewind Protocol</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    **REP*L
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Rewind progression back to any previous level. Forward advancement is disabled.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Level Status Strip */}
        <div className="p-3.5 px-4 sm:px-5 bg-indigo-950/40 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Current Progression:</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTier.badgeColor }}
              />
              <span className="text-white font-mono text-sm">
                Level {currentLevel} • {currentTier.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-900/50 px-2.5 py-1 rounded-full border border-indigo-500/30">
            <span>Tap Cap:</span>
            <strong className="text-white">
              {formatCompactNumber(getLevelTapCap(currentLevel, stage))}
            </strong>
          </div>
        </div>

        {/* Rule Banner */}
        <div className="p-3 px-4 sm:px-5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Protocol Directive:</strong> You can select any previous level to reset back. Moving forward to higher levels is restricted. Other assets remain intact.
          </span>
        </div>

        {/* Level List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2 flex-1 text-xs">
          {tiers.map((tier) => {
            const isCurrent = tier.level === currentLevel;
            const isPrevious = tier.level < currentLevel;
            const isAhead = tier.level > currentLevel;

            return (
              <div
                key={tier.level}
                onClick={() => {
                  if (isPrevious) handleSelectLevel(tier);
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-indigo-950/70 border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400'
                    : isPrevious
                    ? 'bg-slate-900/80 border-slate-700/80 hover:bg-indigo-950/50 hover:border-indigo-500/80 cursor-pointer group active:scale-[0.99]'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40 cursor-not-allowed select-none'
                }`}
              >
                {/* Left: Badge & Level Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 border"
                    style={{
                      backgroundColor: `${tier.badgeColor}25`,
                      borderColor: tier.badgeColor,
                      color: tier.badgeColor,
                    }}
                  >
                    Lv.{tier.level}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{tier.name}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 font-mono">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>Threshold: {formatCompactNumber(tier.minCoins)} pts</span>
                      <span>•</span>
                      <span>Cap: {formatCompactNumber(getLevelTapCap(tier.level, stage))}</span>
                    </div>
                  </div>
                </div>

                {/* Right: State Action */}
                <div>
                  {isCurrent ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-200 text-xs font-bold border border-indigo-500/40">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span>Current Level</span>
                    </div>
                  ) : isPrevious ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectLevel(tier);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20 group-hover:scale-105 cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Reset to Lv.{tier.level}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 text-[11px] font-medium border border-slate-800">
                      <Lock className="w-3 h-3" />
                      <span>Locked (Ahead)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 bg-black/90 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>CLASSIFIED REWIND INTERFACE</span>
          <span className="text-slate-400">Total Levels: {tiers.length}</span>
        </div>
      </div>

      {/* Confirmation Sub-Modal */}
      {showConfirm && selectedTier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0b101c] rounded-3xl border-2 border-indigo-500/80 p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl text-center font-sans text-slate-100">
            <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-lg text-white">
                Confirm Level Reset
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to reset your progression back to{' '}
                <strong className="text-indigo-400">
                  Level {selectedTier.level} ({selectedTier.name})
                </strong>
                ?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Level:</span>
                <span className="text-white font-bold">Level {currentLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Level:</span>
                <span className="text-emerald-400 font-bold">Level {selectedTier.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Adjusted Tap Cap:</span>
                <span className="text-white font-bold">
                  {formatCompactNumber(getLevelTapCap(selectedTier.level, stage))}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Points, keys, diamonds, and $ reserves will not be affected.
              </div>
            </div>

            {isSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Level Reset to Lv.{selectedTier.level}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setShowConfirm(false);
                    setSelectedTier(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRewind}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
