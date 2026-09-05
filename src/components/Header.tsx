import React from 'react';
import { Wallet, Settings, ChevronRight, Plus } from 'lucide-react';
import { getTierByCoins } from '../data/tiers';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  coins: number;
  totalEarned: number;
  tapLevel: number;
  tapPower: number;
  walletConnected: boolean;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenTierModal: () => void;
  onOpenBoost: () => void;
  goldCoinImg: string;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  totalEarned,
  tapLevel,
  tapPower,
  walletConnected,
  onOpenWallet,
  onOpenSettings,
  onOpenTierModal,
  onOpenBoost,
  goldCoinImg,
}) => {
  const currentTier = getTierByCoins(totalEarned);
  const tierProgress = Math.min(
    100,
    Math.max(
      0,
      ((totalEarned - currentTier.minCoins) / (currentTier.maxCoins - currentTier.minCoins)) * 100
    )
  );

  return (
    <header className="w-full pt-3 pb-2 px-4 flex items-center justify-between z-30 select-none">
      {/* Tier & Level */}
      <div
        id="user-tier-header"
        onClick={() => {
          soundFx.playClick();
          onOpenTierModal();
        }}
        className="flex flex-col cursor-pointer group active:opacity-80 transition"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span style={{ color: currentTier.badgeColor }} className="font-bold tracking-wide">
            {currentTier.name}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          <span className="text-amber-400 font-bold">Lv. {tapLevel}</span>
        </div>
        {/* Tier progress bar */}
        <div className="w-24 h-1.5 bg-slate-800/80 rounded-full mt-1 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(4, tierProgress)}%`,
              backgroundColor: currentTier.badgeColor,
            }}
          />
        </div>
      </div>

      {/* Center Ticker & Tap Rate */}
      <div className="flex items-center gap-1.5">
        <div className="bg-[#121620] border border-white/10 rounded-full py-1 px-2.5 flex items-center gap-2 shadow-inner">
          <span className="text-[11px] font-black tracking-wider text-amber-300">EUTAP</span>
          <div className="h-3 w-px bg-white/15" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TAP</span>
            <img
              src={goldCoinImg}
              alt="Coin"
              referrerPolicy="no-referrer"
              className="w-3.5 h-3.5 rounded-full"
            />
            <span className="text-xs font-black text-amber-400">+{tapPower}</span>
          </div>
          <button
            id="quick-boost-btn"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playClick();
              onOpenBoost();
            }}
            className="w-4 h-4 rounded-full bg-amber-400/20 hover:bg-amber-400/30 flex items-center justify-center text-amber-300 text-[10px] ml-0.5"
            title="Boost Tap Power"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Action Icons: Wallet & Settings */}
      <div className="flex items-center gap-2">
        <button
          id="header-wallet-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenWallet();
          }}
          className={`relative p-2 rounded-xl border transition ${
            walletConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-[#151922] border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400/30'
          }`}
          title={walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        >
          <Wallet className="w-4 h-4" />
          {walletConnected && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          id="header-settings-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-xl bg-[#151922] border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400/30 transition"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
