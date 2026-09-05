import React from 'react';
import { X, Zap, Flame, BatteryCharging, ChevronRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullEnergyRemaining: number;
  turboRemaining: number;
  isTurboActive: boolean;
  onUseFullEnergy: () => void;
  onActivateTurbo: () => void;
  onNavigateToMine: () => void;
  coins: number;
}

export const BoostModal: React.FC<BoostModalProps> = ({
  isOpen,
  onClose,
  fullEnergyRemaining,
  turboRemaining,
  isTurboActive,
  onUseFullEnergy,
  onActivateTurbo,
  onNavigateToMine,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative">
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
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tap Boosters</h3>
            <span className="text-xs text-slate-400">Free daily recovery and power surges</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Recharge your stamina instantly or multiply your tap rate to harvest $EUTAP coins faster.
        </p>

        <div className="space-y-3 mb-4">
          {/* Full Energy */}
          <button
            id="boost-full-energy-btn"
            disabled={fullEnergyRemaining <= 0}
            onClick={() => {
              soundFx.playReward();
              onUseFullEnergy();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition ${
              fullEnergyRemaining > 0
                ? 'bg-[#1a202c] hover:bg-[#222b3b] border-white/10 hover:border-amber-400/40 text-white'
                : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold">Full Energy Refuel</h4>
                <span className="text-xs text-slate-400">{fullEnergyRemaining}/3 free uses left today</span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-lg bg-amber-500/15">
              FREE
            </span>
          </button>

          {/* Turbo 5X Tap */}
          <button
            id="boost-turbo-btn"
            disabled={turboRemaining <= 0 || isTurboActive}
            onClick={() => {
              soundFx.playReward();
              onActivateTurbo();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition ${
              turboRemaining > 0 && !isTurboActive
                ? 'bg-[#1a202c] hover:bg-[#222b3b] border-white/10 hover:border-orange-500/40 text-white'
                : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold">Turbo Finger (5X Tap)</h4>
                <span className="text-xs text-slate-400">
                  {isTurboActive ? 'Active Now!' : `${turboRemaining}/3 left today (20s)`}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-400 px-3 py-1 rounded-lg bg-orange-500/15">
              {isTurboActive ? 'RUNNING' : 'START'}
            </span>
          </button>
        </div>

        {/* Upgrade in Mine Link */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
            onNavigateToMine();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 transition"
        >
          <span>Upgrade Permanent Tap Level & Battery</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
