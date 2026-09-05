import React from 'react';
import { X, Award, Check } from 'lucide-react';
import { TIERS, getTierByCoins, formatCompactNumber } from '../data/tiers';
import { soundFx } from '../utils/audio';

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalEarned: number;
  tapLevel: number;
}

export const TierModal: React.FC<TierModalProps> = ({
  isOpen,
  onClose,
  totalEarned,
  tapLevel,
}) => {
  if (!isOpen) return null;

  const currentTier = getTierByCoins(totalEarned);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-4 shadow-2xl flex flex-col relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">20 Player Tiers</h3>
            <span className="text-[10px] text-slate-400">Current: Level {tapLevel} • Next Level is x3 Points</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Level 0 starts at 100,000 tap points. Each subsequent tier requires x3 of the previous level.
        </p>

        <div className="space-y-1.5 overflow-y-auto pr-0.5">
          {TIERS.map((tier) => {
            const isCurrent = currentTier.level === tier.level;
            const isUnlocked = totalEarned >= tier.minCoins;

            return (
              <div
                key={tier.level}
                className={`p-2 rounded-xl border flex items-center justify-between transition ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : isUnlocked
                    ? 'bg-[#1a202c] border-white/10 text-slate-200'
                    : 'bg-black/30 border-white/5 opacity-55 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0"
                    style={{ backgroundColor: `${tier.badgeColor}33`, color: tier.badgeColor }}
                  >
                    {tier.level}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{tier.name}</span>
                      {isCurrent && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded bg-amber-400 text-black shrink-0">
                          Current
                        </span>
                      )}
                    </h4>
                    <span className="text-[9px] text-slate-400 block truncate">
                      From {formatCompactNumber(tier.minCoins)} ({tier.minCoins.toLocaleString()}) tap points
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 ml-2">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
