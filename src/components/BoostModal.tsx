import React from 'react';
import { X, Zap, Flame, BatteryCharging, ChevronRight, ShieldPlus } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { formatCompactNumber } from '../data/tiers';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTurboActive: boolean;
  onBuyFullEnergy: (cost: number) => void;
  onBuyTurbo: (cost: number) => void;
  onBuyEnergyTank: (cost: number) => void;
  onNavigateToMine: () => void;
  coins: number;
  goldCoinImg: string;
}

export const BOOST_COSTS = {
  FULL_ENERGY: 5000,
  TURBO_TAP: 10000,
  ENERGY_EXPANSION: 15000,
};

export const BoostModal: React.FC<BoostModalProps> = ({
  isOpen,
  onClose,
  isTurboActive,
  onBuyFullEnergy,
  onBuyTurbo,
  onBuyEnergyTank,
  onNavigateToMine,
  coins,
  goldCoinImg,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-4.5 shadow-2xl flex flex-col relative">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Tap Boosters</h3>
            <span className="text-[10px] text-slate-400">Costs are strictly in thousands of points</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 mb-3">
          <span className="text-[10px] text-slate-400 font-medium">Available Balance:</span>
          <div className="flex items-center gap-1.5">
            <img src={goldCoinImg} alt="" className="w-3.5 h-3.5 rounded-full" referrerPolicy="no-referrer" />
            <span className="text-xs font-bold text-amber-300">{coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {/* Full Energy Refuel */}
          <button
            id="boost-full-energy-btn"
            disabled={coins < BOOST_COSTS.FULL_ENERGY}
            onClick={() => {
              soundFx.playReward();
              onBuyFullEnergy(BOOST_COSTS.FULL_ENERGY);
            }}
            className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition ${
              coins >= BOOST_COSTS.FULL_ENERGY
                ? 'bg-[#1a202c] hover:bg-[#222b3b] border-white/10 hover:border-amber-400/40 text-white shadow-sm'
                : 'bg-white/5 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">Full Energy Refuel</h4>
                <span className="text-[10px] text-slate-400 block truncate">Instant 100% stamina restore</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/20">
              <img src={goldCoinImg} alt="" className="w-3 h-3 rounded-full" referrerPolicy="no-referrer" />
              <span className="text-[11px] font-bold text-amber-400">5,000</span>
            </div>
          </button>

          {/* Turbo 5X Tap */}
          <button
            id="boost-turbo-btn"
            disabled={coins < BOOST_COSTS.TURBO_TAP || isTurboActive}
            onClick={() => {
              soundFx.playReward();
              onBuyTurbo(BOOST_COSTS.TURBO_TAP);
            }}
            className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition ${
              isTurboActive
                ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                : coins >= BOOST_COSTS.TURBO_TAP
                ? 'bg-[#1a202c] hover:bg-[#222b3b] border-white/10 hover:border-orange-500/40 text-white shadow-sm'
                : 'bg-white/5 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">Turbo 5X Tap Power</h4>
                <span className="text-[10px] text-slate-400 block truncate">
                  {isTurboActive ? 'Active Surge (20s)' : '5X coins per tap for 20s'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/20">
              <img src={goldCoinImg} alt="" className="w-3 h-3 rounded-full" referrerPolicy="no-referrer" />
              <span className="text-[11px] font-bold text-orange-400">
                {isTurboActive ? 'ACTIVE' : '10,000'}
              </span>
            </div>
          </button>

          {/* Instant +500 Energy Tank Expansion */}
          <button
            id="boost-tank-expansion-btn"
            disabled={coins < BOOST_COSTS.ENERGY_EXPANSION}
            onClick={() => {
              soundFx.playReward();
              onBuyEnergyTank(BOOST_COSTS.ENERGY_EXPANSION);
            }}
            className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition ${
              coins >= BOOST_COSTS.ENERGY_EXPANSION
                ? 'bg-[#1a202c] hover:bg-[#222b3b] border-white/10 hover:border-emerald-400/40 text-white shadow-sm'
                : 'bg-white/5 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">+500 Stamina Tank</h4>
                <span className="text-[10px] text-slate-400 block truncate">Expands maximum energy cap</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
              <img src={goldCoinImg} alt="" className="w-3 h-3 rounded-full" referrerPolicy="no-referrer" />
              <span className="text-[11px] font-bold text-emerald-400">15,000</span>
            </div>
          </button>
        </div>

        {/* Upgrade in Mine Link */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
            onNavigateToMine();
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-300 transition"
        >
          <span>Tap Rate Leveling (starts at 8,000 pts)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
