import React from 'react';
import { Sparkles, Clock, Wallet, Info, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AirdropTabProps {
  walletConnected: boolean;
  walletAddress: string | null;
  walletProvider: string | null;
  coins: number;
  totalEarned: number;
  tapLevel: number;
  totalTaps: number;
  squadCount: number;
  onOpenWallet: () => void;
  goldCoinImg: string;
}

export const AirdropTab: React.FC<AirdropTabProps> = ({
  walletConnected,
  walletAddress,
  walletProvider,
  coins,
  totalEarned,
  tapLevel,
  totalTaps,
  squadCount,
  onOpenWallet,
  goldCoinImg,
}) => {
  // Calculate airdrop qualification power score based on player's efforts
  const airdropScore = Math.floor(
    coins * 0.5 + tapLevel * 10000 + totalTaps * 2 + squadCount * 50000 + (walletConnected ? 100000 : 0)
  );

  return (
    <div className="flex flex-col px-3.5 pt-2 pb-20 max-w-md mx-auto select-none">
      {/* Top Badges Row (Matches Image 3) */}
      <div className="flex items-center justify-center gap-2 mt-3 mb-4">
        {/* TGE SEASON badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TGE SEASON</span>
        </div>

        {/* Allocation: Coming Soon badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Allocation: Coming Soon</span>
        </div>

        {/* Mini Gold Coin */}
        <div className="w-7 h-7 rounded-full bg-black/40 border border-white/10 flex items-center justify-center p-0.5">
          <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-full h-full rounded-full" />
        </div>
      </div>

      {/* Airdrop Wallet Card */}
      <div className="bg-[#141923] border border-white/10 rounded-2xl p-4 mb-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Airdrop Wallet</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {walletConnected && walletAddress ? (
                <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {walletProvider ? `${walletProvider}: ` : ''}
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              ) : (
                'No wallet connected'
              )}
            </p>
          </div>
        </div>

        <button
          id="btn-airdrop-connect-wallet"
          onClick={() => {
            soundFx.playClick();
            onOpenWallet();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
            walletConnected
              ? 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.3)] active:scale-95'
          }`}
        >
          {walletConnected ? 'Change' : 'Connect Wallet'}
        </button>
      </div>

      {/* Wallet Connection Requirement Notice */}
      <div className="bg-[#121620] border border-amber-500/20 rounded-2xl p-3.5 mb-3 text-xs leading-relaxed flex items-start gap-2.5 shadow-inner">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-slate-300">
          <strong className="text-amber-400">Wallet connection for allocation:</strong> Connect Tonkeeper, Telegram Wallet, MetaMask, or Phantom now to be included in the token distribution snapshot. Allocation will be announced soon.
        </p>
      </div>

      {/* Connect Wallet Allocation (Official Token Claim Portal) */}
      <div className="bg-[#141923] border border-white/10 rounded-2xl p-4 mb-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400">Connect Wallet</h4>
              <span className="text-sm font-black text-white">Allocation</span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Coming Soon</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 block">Official Token Claim Portal</span>
      </div>

      {/* Allocation is not yet available Notice */}
      <div className="bg-[#121620] border border-white/10 rounded-2xl p-3.5 mb-4 text-xs leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-slate-200 mb-1">Allocation is not yet available</h5>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            The token allocation snapshot and distribution metrics are currently being compiled. Keep accumulating coins, increasing tap level rate, and linking your wallet to maximize your final share.
          </p>
        </div>
      </div>

      {/* Real-time Airdrop Snapshot Criteria Card */}
      <div className="bg-[#141923] border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Your Snapshot Metrics</h4>
          </div>
          <span className="text-xs font-black text-amber-400 font-['Rajdhani',sans-serif]">
            {airdropScore.toLocaleString()} PTS
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Total Coins Earned</span>
            <span className="font-bold text-white">{totalEarned.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Tap Level Achieved</span>
            <span className="font-bold text-amber-400">Level {tapLevel}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Total Manual Taps</span>
            <span className="font-bold text-white">{totalTaps.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Squad Referrals</span>
            <span className="font-bold text-white">{squadCount} Friends</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Web3 Wallet Status</span>
            <span className={`font-bold ${walletConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {walletConnected ? 'Connected ✓' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
