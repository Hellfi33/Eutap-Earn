import React from 'react';
import { Wallet, Settings, ChevronRight, Plus } from 'lucide-react';
import { getTierByCoins, formatCompactNumber } from '../data/tiers';
import { soundFx } from '../utils/audio';
import { UserProfile } from '../types';

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
  stage?: number;
  goldCoinImg: string;
  userProfile?: UserProfile;
  onOpenProfileModal?: () => void;
  onOpenE?: () => void;
  activeTab?: string;
  isOnline?: boolean;
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
  stage = 1,
  goldCoinImg,
  userProfile,
  onOpenProfileModal,
  onOpenE,
  activeTab,
  isOnline = true,
}) => {
  const currentTier = getTierByCoins(totalEarned, stage);
  const isStage2 = stage === 2;
  const isEActive = activeTab === 'e';
  const tierProgress = Math.min(
    100,
    Math.max(
      0,
      ((totalEarned - currentTier.minCoins) / (currentTier.maxCoins - currentTier.minCoins)) * 100
    )
  );

  return (
    <header className="w-full pt-2 pb-1 px-1.5 sm:px-3 flex items-center justify-between z-30 select-none shrink-0 gap-1 sm:gap-2">
      {/* Tier & Level */}
      <div
        id="user-tier-header"
        onClick={() => {
          soundFx.playClick();
          onOpenTierModal();
        }}
        className="flex flex-col cursor-pointer group active:opacity-80 transition shrink-0 min-w-0"
      >
        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold leading-none">
          <span style={{ color: currentTier.badgeColor }} className="font-bold tracking-tight truncate max-w-[50px] sm:max-w-[70px]">
            {currentTier.name}
          </span>
          <ChevronRight className="w-2.5 h-2.5 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
          <span className="text-amber-400 font-bold shrink-0 text-[10px] sm:text-[11px]">Lv.{tapLevel}</span>
        </div>
        {/* Tier progress bar */}
        <div className="w-12 sm:w-16 h-1 bg-slate-800/80 rounded-full mt-1 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(4, tierProgress)}%`,
              backgroundColor: currentTier.badgeColor,
            }}
          />
        </div>
        <span className="text-[7.5px] sm:text-[8px] text-slate-400 mt-0.5 font-medium leading-none whitespace-nowrap">
          {formatCompactNumber(totalEarned)} / {formatCompactNumber(currentTier.maxCoins)}
        </span>
      </div>

      {/* Center Ticker & Tap Rate */}
      <div className="flex items-center shrink-0">
        <div className={`border rounded-full py-0.5 px-1.5 sm:px-2 flex items-center gap-1 sm:gap-1.5 shadow-inner transition ${
          isStage2
            ? 'bg-[#0e0a24] border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
            : 'bg-[#121620] border-white/10'
        }`}>
          <span className={`text-[9px] sm:text-[10px] font-black tracking-wider ${
            isStage2 ? 'text-cyan-300' : 'text-amber-300'
          }`}>
            {isStage2 ? 'NEXUS' : 'EUTAP'}
          </span>
          <div className="h-2.5 w-px bg-white/15" />
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="hidden xs:inline text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 tracking-wider">TAP</span>
            <img
              src={goldCoinImg}
              alt="Coin"
              referrerPolicy="no-referrer"
              className="w-3 h-3 rounded-full"
            />
            <span className={`text-[10px] sm:text-[11px] font-black font-mono ${
              isStage2 ? 'text-cyan-400' : 'text-amber-400'
            }`}>+{tapPower}</span>
          </div>
          <button
            id="quick-boost-btn"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playClick();
              onOpenBoost();
            }}
            className="w-3.5 h-3.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 flex items-center justify-center text-amber-300 text-[10px] ml-0.2 active:scale-90 transition"
            title="Boost Tap Power"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Action Icons: User ID, Wallet, E, Settings */}
      <div className="flex items-center gap-1 shrink-0">
        {userProfile && (
          <button
            id="header-user-id-btn"
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenProfileModal?.();
            }}
            className="flex items-center gap-1 py-0.5 px-1 sm:px-1.5 rounded-lg sm:rounded-xl bg-[#141824] border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10 active:scale-95 transition shadow-inner"
            title={`User ID: ${userProfile.userId} (${userProfile.username}) - Click to personalize`}
          >
            <div
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-gradient-to-br ${userProfile.avatarColor} flex items-center justify-center text-[7.5px] sm:text-[8px] font-black text-white shrink-0 shadow`}
            >
              {(userProfile.username || userProfile.userId).substring(0, 1).toUpperCase()}
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-mono font-black tracking-tight max-w-[34px] sm:max-w-[60px] truncate">
              {userProfile.userId}
            </span>
          </button>
        )}

        <button
          id="header-wallet-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenWallet();
          }}
          className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border flex items-center justify-center transition active:scale-95 shrink-0 ${
            walletConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-[#151922] border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400/30'
          }`}
          title={walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        >
          <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {walletConnected && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* E Button (opens Section E) */}
        <button
          id="header-e-btn"
          onClick={() => {
            soundFx.playClick();
            if (onOpenE) onOpenE();
          }}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border flex items-center justify-center transition active:scale-95 shrink-0 ${
            isEActive
              ? 'border-amber-400 bg-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              : 'bg-[#151922] border-amber-500/30 text-amber-400 hover:border-amber-400/60 hover:bg-amber-500/10'
          }`}
          title="Section E"
        >
          <span className="font-['Rajdhani',sans-serif] font-black text-xs sm:text-sm leading-none">
            E
          </span>
        </button>

        {/* Live Online Status Indicator */}
        <div
          className={`flex items-center gap-1 py-1 px-1.5 rounded-lg sm:rounded-xl border text-[8px] sm:text-[9px] font-mono font-bold tracking-tight shrink-0 transition ${
            isOnline
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-300 animate-pulse'
          }`}
          title={isOnline ? 'Online: Real-time network sync active' : 'Offline: Internet connection required'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-rose-500'
            }`}
          />
          <span className="hidden md:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        <button
          id="header-settings-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenSettings();
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#151922] border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400/30 transition flex items-center justify-center active:scale-95 shrink-0"
          title="Settings"
        >
          <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </header>
  );
};
