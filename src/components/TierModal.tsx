import React from 'react';
import { X, Award, Check, Sparkles } from 'lucide-react';
import { getTiersList, getTierByCoins, formatCompactNumber } from '../data/tiers';
import { SEASONAL_SKINS } from '../data/seasonalSkins';
import { soundFx } from '../utils/audio';

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalEarned: number;
  tapLevel: number;
  stage?: number;
}

export const TierModal: React.FC<TierModalProps> = ({
  isOpen,
  onClose,
  totalEarned,
  tapLevel,
  stage = 1,
}) => {
  if (!isOpen) return null;

  const tiers = getTiersList(stage);
  const currentTier = getTierByCoins(totalEarned, stage);
  const isStage2 = stage === 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className={`border rounded-3xl w-full max-w-sm p-4 shadow-2xl flex flex-col relative max-h-[85vh] overflow-y-auto ${
        isStage2
          ? 'bg-[#0d091e] border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)]'
          : 'bg-[#141923] border-white/10'
      }`}>
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
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
            isStage2
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {isStage2 ? '30 Quantum Tiers' : '20 Player Tiers'}
            </h3>
            <span className="text-[10px] text-slate-400">
              Current: Level {tapLevel} {isStage2 ? '• Stage II' : '• Next Level is x3 Points'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          {isStage2
            ? 'Stage II: Quantum Nexus with 30 progressive tiers, expanding from Quantum Core to Quantum Zenith.'
            : 'Level 0 starts at 100,000 tap points. Each subsequent tier requires x3 of the previous level.'}
        </p>

        <div className="space-y-1.5 overflow-y-auto pr-0.5">
          {tiers.map((tier) => {
            const isCurrent = currentTier.level === tier.level;
            const isUnlocked = totalEarned >= tier.minCoins;

            return (
              <div
                key={tier.level}
                className={`p-2 rounded-xl border flex items-center justify-between transition ${
                  isCurrent
                    ? isStage2
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-amber-500/15 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : isUnlocked
                    ? isStage2
                      ? 'bg-purple-950/30 border-purple-800/30 text-slate-200'
                      : 'bg-[#1a202c] border-white/10 text-slate-200'
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
                      {SEASONAL_SKINS[tier.level] && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 truncate">
                          {SEASONAL_SKINS[tier.level].skinName}
                        </span>
                      )}
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
