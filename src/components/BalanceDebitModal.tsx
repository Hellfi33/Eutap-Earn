import React, { useState } from 'react';
import { MinusCircle, ArrowDown, AlertTriangle, X, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface BalanceDebitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  onDebitCoins: (amount: number) => void;
}

export const BalanceDebitModal: React.FC<BalanceDebitModalProps> = ({
  isOpen,
  onClose,
  currentCoins,
  onDebitCoins,
}) => {
  const [amountStr, setAmountStr] = useState('1000000');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseInput = (val: string): number => {
    const clean = val.trim().toLowerCase().replace(/,/g, '');
    if (clean.endsWith('k')) return parseFloat(clean) * 1e3 || 0;
    if (clean.endsWith('m')) return parseFloat(clean) * 1e6 || 0;
    if (clean.endsWith('b')) return parseFloat(clean) * 1e9 || 0;
    if (clean.endsWith('t')) return parseFloat(clean) * 1e12 || 0;
    return parseFloat(clean) || 0;
  };

  const debitAmount = parseInput(amountStr);
  const isValid = debitAmount > 0;
  const remaining = Math.max(0, currentCoins - debitAmount);

  const handlePreset = (pct: number) => {
    soundFx.playClick();
    const val = Math.floor((currentCoins * pct) / 100);
    setAmountStr(val.toString());
  };

  const handleConfirmDebit = () => {
    if (!isValid) return;

    soundFx.playReward();
    onDebitCoins(debitAmount);
    setSuccessMsg(`Successfully debited ${debitAmount.toLocaleString()} points`);

    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#140b0b] border-2 border-rose-500/70 shadow-[0_0_60px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col font-sans">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-black border-b border-rose-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center">
              <MinusCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-rose-300 tracking-wider font-['Rajdhani',sans-serif]">
                  DEBIT POINT BALANCE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-[9px] font-bold text-rose-200">
                  MANUAL DEDUCTION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Deduct custom points from active balance</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Current Balance Card */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Balance:</span>
            <span className="text-lg font-black text-white font-['Rajdhani',sans-serif]">
              {currentCoins.toLocaleString()} PTS
            </span>
          </div>

          {/* Amount to Deduct */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Points to Deduct</span>
              <span className="text-[11px] text-slate-400">Supports K, M, B (e.g. 5M)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="Enter points to deduct..."
                className="w-full pl-4 pr-16 py-2.5 rounded-xl bg-black/70 border border-rose-500/40 focus:border-rose-400 text-white font-['Rajdhani',sans-serif] font-bold text-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400">
                PTS
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 25, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePreset(pct)}
                className="py-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-bold text-slate-300 hover:text-rose-300 transition"
              >
                -{pct}%
              </button>
            ))}
          </div>

          {/* New Balance Preview */}
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">Balance After Debit:</span>
            <span className="font-black text-rose-300 font-['Rajdhani',sans-serif] text-base">
              {remaining.toLocaleString()} PTS
            </span>
          </div>

          {successMsg ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 animate-in zoom-in-95">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <button
              onClick={handleConfirmDebit}
              disabled={!isValid}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
            >
              <ArrowDown className="w-4 h-4" />
              <span>CONFIRM DEBIT DEDUCTION</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
