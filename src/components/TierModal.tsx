import React from 'react';
import { X, Award, Check } from 'lucide-react';
import { TIERS, getTierByCoins } from '../data/tiers';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative max-h-[88vh] overflow-y-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Player Tiers</h3>
            <span className="text-xs text-slate-400">Your Current Level: {tapLevel}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Unlock higher status tiers and executive prestige by accumulating $EUTAP coins.
        </p>

        <div className="space-y-2">
          {TIERS.map((tier) => {
            const isCurrent = currentTier.level === tier.level;
            const isUnlocked = totalEarned >= tier.minCoins;

            return (
              <div
                key={tier.level}
                className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : isUnlocked
                    ? 'bg-[#1a202c] border-white/10 text-slate-200'
                    : 'bg-black/30 border-white/5 opacity-60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${tier.badgeColor}33`, color: tier.badgeColor }}
                  >
                    {tier.level}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{tier.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400 text-black">
                          Current
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      From {tier.minCoins.toLocaleString()} coins
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
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
