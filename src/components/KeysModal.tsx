import React from 'react';
import { X, Key, ShieldCheck, Sparkles, Trophy, Lock, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface KeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  keysCount: number;
  onEarnKey?: () => void;
}

export const KeysModal: React.FC<KeysModalProps> = ({
  isOpen,
  onClose,
  keysCount,
  onEarnKey,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1420] border border-amber-500/30 rounded-3xl w-full max-w-sm p-4 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col relative max-h-[90vh] overflow-y-auto select-none">
        {/* Close Button */}
        <button
          id="btn-close-keys-modal"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="relative mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600/30 via-yellow-500/20 to-amber-300/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.35)]">
              <Key className="w-9 h-9 text-amber-300 fill-amber-300/20 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center border-2 border-[#0f1420] shadow">
              {keysCount}
            </div>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight font-['Rajdhani',sans-serif] uppercase">
            Master Keys Vault
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-[260px] leading-relaxed">
            Exclusive cryptographic keys required for upcoming high-tier airdrop allocations and classified vault unlocks.
          </p>
        </div>

        {/* Current Keys Total Card */}
        <div className="w-full bg-[#161c2b] border border-amber-400/25 rounded-2xl p-3 flex items-center justify-between mb-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Keys Collected
              </span>
              <span className="text-xl font-black text-amber-300 font-['Rajdhani',sans-serif] leading-none">
                {keysCount.toLocaleString()} {keysCount === 1 ? 'Key' : 'Keys'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Active
          </span>
        </div>

        {/* How to Collect Keys List */}
        <div className="w-full flex flex-col gap-2 mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Exclusive Ways to Earn Keys & Diamonds
          </span>

          {/* 1. Every 5,000 Taps */}
          <div className="bg-[#141824] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                5K
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">Every 5,000 Taps</span>
                <span className="text-[10px] text-slate-400">Milestone: +1 Key & +2 Diamonds</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                +1 KEY
              </span>
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                +2 💎
              </span>
            </div>
          </div>

          {/* 2. Every 10 Million Points */}
          <div className="bg-[#141824] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold">
                10M
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">Every 10 Million Points</span>
                <span className="text-[10px] text-slate-400">Milestone: +3 Keys & +3 Diamonds</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                +3 KEYS
              </span>
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                +3 💎
              </span>
            </div>
          </div>

          {/* 3. S*** Morse Lucky Wheel */}
          <div className="bg-[#141824] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold">
                S***
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">S*** Morse Lucky Wheel</span>
                <span className="text-[10px] text-slate-400">15-Chart spin (1 & 7 Keys, 2 & 5 💎)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
              LUCKY SPIN
            </span>
          </div>
        </div>

        {/* Claim / Close button */}
        <button
          id="btn-confirm-keys-vault"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Keep Collecting Keys</span>
        </button>
      </div>
    </div>
  );
};
