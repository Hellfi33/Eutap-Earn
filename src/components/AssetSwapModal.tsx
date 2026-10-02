import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownUp,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { SwapAssetType, SwapDetails } from '../types';
import { soundFx } from '../utils/audio';

interface AssetSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  keys: number;
  diamonds: number;
  onExecuteSwap: (
    fromAsset: SwapAssetType,
    fromAmount: number,
    toAsset: SwapAssetType,
    toAmount: number
  ) => { txHash: string; txId: string };
  onViewInHistory?: () => void;
}

export const calculateSwapReceive = (
  fromAsset: SwapAssetType,
  toAsset: SwapAssetType,
  fromAmount: number
): number => {
  if (fromAmount <= 0 || fromAsset === toAsset) return 0;

  if (fromAsset === 'points') {
    if (toAsset === 'keys') {
      // 5,000,000 points = 2 keys => 2,500,000 points = 1 key
      return Math.floor((fromAmount / 5_000_000) * 2);
    }
    if (toAsset === 'diamonds') {
      // 5,000,000 points = 1 diamond
      return Math.floor(fromAmount / 5_000_000);
    }
  }

  if (fromAsset === 'keys') {
    if (toAsset === 'diamonds') {
      // 2 keys = 1 diamond
      return Math.floor(fromAmount / 2);
    }
    if (toAsset === 'points') {
      // 2 keys = 5,000,000 points
      return Math.floor((fromAmount / 2) * 5_000_000);
    }
  }

  if (fromAsset === 'diamonds') {
    if (toAsset === 'keys') {
      // 1 diamond = 2 keys
      return Math.floor(fromAmount * 2);
    }
    if (toAsset === 'points') {
      // 1 diamond = 5,000,000 points
      return Math.floor(fromAmount * 5_000_000);
    }
  }

  return 0;
};

const ASSET_META: Record<
  SwapAssetType,
  {
    name: string;
    symbol: string;
    icon: string;
    color: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  points: {
    name: 'Tap Points',
    symbol: '₮',
    icon: '₮',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
  },
  keys: {
    name: 'Master Keys',
    symbol: 'KEYS',
    icon: '🔑',
    color: 'text-amber-300',
    borderColor: 'border-yellow-500/40',
    bgColor: 'bg-yellow-500/10',
  },
  diamonds: {
    name: 'Diamonds',
    symbol: 'DMND',
    icon: '💎',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
  },
};

export const AssetSwapModal: React.FC<AssetSwapModalProps> = ({
  isOpen,
  onClose,
  coins,
  keys = 0,
  diamonds = 0,
  onExecuteSwap,
  onViewInHistory,
}) => {
  const [fromAsset, setFromAsset] = useState<SwapAssetType>('points');
  const [toAsset, setToAsset] = useState<SwapAssetType>('keys');
  const [inputAmount, setInputAmount] = useState<string>('5000000');
  const [copiedTx, setCopiedTx] = useState(false);
  const [receipt, setReceipt] = useState<{
    txHash: string;
    txId: string;
    fromAsset: SwapAssetType;
    fromAmount: number;
    toAsset: SwapAssetType;
    toAmount: number;
    timestamp: number;
  } | null>(null);

  // Sync available to-asset choices when fromAsset changes
  useEffect(() => {
    if (fromAsset === toAsset) {
      if (fromAsset === 'points') setToAsset('keys');
      else if (fromAsset === 'keys') setToAsset('diamonds');
      else setToAsset('keys');
    }
  }, [fromAsset, toAsset]);

  if (!isOpen) return null;

  const getBalance = (asset: SwapAssetType): number => {
    if (asset === 'points') return coins;
    if (asset === 'keys') return keys;
    if (asset === 'diamonds') return diamonds;
    return 0;
  };

  const parsedAmount = Math.max(0, parseInt(inputAmount.replace(/,/g, ''), 10) || 0);
  const currentBalance = getBalance(fromAsset);
  const expectedReceive = calculateSwapReceive(fromAsset, toAsset, parsedAmount);
  const isInsufficient = parsedAmount > currentBalance;
  const canSwap = parsedAmount > 0 && expectedReceive > 0 && !isInsufficient;

  const handleFlipAssets = () => {
    soundFx.playClick();
    const prevFrom = fromAsset;
    const prevTo = toAsset;
    setFromAsset(prevTo);
    setToAsset(prevFrom);
    // Set appropriate initial step
    if (prevTo === 'points') {
      setInputAmount('5000000');
    } else if (prevTo === 'keys') {
      setInputAmount('2');
    } else {
      setInputAmount('1');
    }
  };

  const handleSelectFromAsset = (asset: SwapAssetType) => {
    soundFx.playClick();
    setFromAsset(asset);
    if (asset === 'points') {
      setInputAmount('5000000');
    } else if (asset === 'keys') {
      setInputAmount('2');
    } else {
      setInputAmount('1');
    }
  };

  const handleSelectToAsset = (asset: SwapAssetType) => {
    soundFx.playClick();
    setToAsset(asset);
  };

  const handlePresetAmount = (multiplier: number | 'max') => {
    soundFx.playClick();
    if (multiplier === 'max') {
      setInputAmount(currentBalance.toString());
      return;
    }
    const amt = Math.floor(currentBalance * multiplier);
    setInputAmount(amt.toString());
  };

  const handleConfirmSwap = () => {
    if (!canSwap) return;
    soundFx.playReward();
    soundFx.triggerHaptic(20);

    const result = onExecuteSwap(fromAsset, parsedAmount, toAsset, expectedReceive);
    setReceipt({
      txHash: result.txHash,
      txId: result.txId,
      fromAsset,
      fromAmount: parsedAmount,
      toAsset,
      toAmount: expectedReceive,
      timestamp: Date.now(),
    });
  };

  const handleCopyTx = (txHash: string) => {
    soundFx.playClick();
    try {
      navigator.clipboard.writeText(txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } catch {}
  };

  const formatAmount = (amt: number): string => {
    return amt.toLocaleString();
  };

  const fromMeta = ASSET_META[fromAsset];
  const toMeta = ASSET_META[toAsset];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-[#0c1017] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121622]/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowDownUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-['Rajdhani',sans-serif] tracking-wider uppercase leading-none">
                Asset Swap
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                Instant Internal Exchange
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
          {receipt ? (
            /* Swap Receipt View */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {/* Success Badge */}
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-white uppercase font-['Rajdhani',sans-serif] tracking-wider">
                  Swap Executed Successfully!
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Receipt generated and recorded in Withdrawal History
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#141923] border border-white/10 rounded-2xl p-3.5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Settlement Status
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    CONFIRMED
                  </span>
                </div>

                {/* Exchanged & Received Flow */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#0e121a] rounded-xl border border-white/5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      You Exchanged
                    </span>
                    <div className="flex items-center gap-1 text-sm font-black text-amber-400 font-mono mt-0.5">
                      <span>-{formatAmount(receipt.fromAmount)}</span>
                      <span className="text-xs">{ASSET_META[receipt.fromAsset].icon}</span>
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {ASSET_META[receipt.fromAsset].name}
                    </span>
                  </div>

                  <div className="border-l border-white/5 pl-2.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      You Received
                    </span>
                    <div className="flex items-center gap-1 text-sm font-black text-emerald-400 font-mono mt-0.5">
                      <span>+{formatAmount(receipt.toAmount)}</span>
                      <span className="text-xs">{ASSET_META[receipt.toAsset].icon}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400/80">
                      {ASSET_META[receipt.toAsset].name}
                    </span>
                  </div>
                </div>

                {/* Tx Hash */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Tx Hash:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[130px]">
                      {receipt.txHash.slice(0, 10)}...{receipt.txHash.slice(-6)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyTx(receipt.txHash)}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition"
                  >
                    {copiedTx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1">
                {onViewInHistory && (
                  <button
                    id="btn-view-receipt-in-history"
                    onClick={() => {
                      soundFx.playClick();
                      onClose();
                      onViewInHistory();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                    <span>View in Withdrawal History</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setReceipt(null);
                    }}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition active:scale-95"
                  >
                    Swap Again
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onClose();
                    }}
                    className="py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Swap Input Form */
            <>
              {/* Asset Balances Mini Strip */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#121620] rounded-2xl border border-white/5">
                <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white/[0.02]">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                    <span>₮</span> POINTS
                  </span>
                  <span className="text-xs font-black text-amber-400 font-mono mt-0.5 truncate max-w-full">
                    {coins.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white/[0.02]">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                    <span>🔑</span> KEYS
                  </span>
                  <span className="text-xs font-black text-white font-mono mt-0.5 truncate max-w-full">
                    {keys.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white/[0.02]">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                    <span>💎</span> DIAMONDS
                  </span>
                  <span className="text-xs font-black text-cyan-300 font-mono mt-0.5 truncate max-w-full">
                    {diamonds.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 1. SELECT ASSET TO EXCHANGE (FROM) */}
              <div className="space-y-1.5 bg-[#141924]/80 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Exchange From
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Wallet className="w-3 h-3 text-slate-500" />
                    <span>Balance:</span>
                    <span className="font-bold text-white">
                      {formatAmount(currentBalance)}
                    </span>
                  </div>
                </div>

                {/* 3 Asset Selector Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['points', 'keys', 'diamonds'] as SwapAssetType[]).map((asset) => {
                    const isSelected = fromAsset === asset;
                    const meta = ASSET_META[asset];
                    return (
                      <button
                        key={`from-${asset}`}
                        type="button"
                        onClick={() => handleSelectFromAsset(asset)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition active:scale-95 border ${
                          isSelected
                            ? `${meta.bgColor} ${meta.borderColor} ${meta.color} shadow-xs`
                            : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{meta.icon}</span>
                        <span className="truncate">{meta.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Amount Input with MAX Button */}
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#0a0e17] border border-white/10 focus:border-amber-400/60 rounded-xl py-2 px-3 pr-14 text-white text-base font-black font-mono tracking-tight outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => handlePresetAmount('max')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider transition active:scale-90"
                  >
                    MAX
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[0.25, 0.5, 0.75].map((pct) => (
                    <button
                      key={`pct-${pct}`}
                      type="button"
                      onClick={() => handlePresetAmount(pct)}
                      className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold transition active:scale-95"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                  {fromAsset === 'points' && (
                    <button
                      type="button"
                      onClick={() => setInputAmount('5000000')}
                      className="flex-1 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/20 transition active:scale-95"
                    >
                      5M
                    </button>
                  )}
                  {fromAsset === 'keys' && (
                    <button
                      type="button"
                      onClick={() => setInputAmount('2')}
                      className="flex-1 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/20 transition active:scale-95"
                    >
                      2 Keys
                    </button>
                  )}
                  {fromAsset === 'diamonds' && (
                    <button
                      type="button"
                      onClick={() => setInputAmount('1')}
                      className="flex-1 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/20 transition active:scale-95"
                    >
                      1 Dmnd
                    </button>
                  )}
                </div>
              </div>

              {/* Central Switcher / Direction Button */}
              <div className="flex items-center justify-center my-1">
                <button
                  type="button"
                  onClick={handleFlipAssets}
                  className="w-8 h-8 rounded-full bg-[#182030] hover:bg-[#202b40] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 flex items-center justify-center transition active:scale-90 shadow-md group"
                  title="Switch swap direction"
                >
                  <ArrowDownUp className="w-3.5 h-3.5 group-hover:rotate-180 transition duration-300" />
                </button>
              </div>

              {/* 2. SELECT ASSET TO RECEIVE (TO) */}
              <div className="space-y-1.5 bg-[#141924]/80 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Receive
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Wallet className="w-3 h-3 text-slate-500" />
                    <span>Balance:</span>
                    <span className="font-bold text-white">
                      {formatAmount(getBalance(toAsset))}
                    </span>
                  </div>
                </div>

                {/* Available To-Asset Options (excluding From Asset) */}
                <div className="grid grid-cols-2 gap-1.5">
                  {(['points', 'keys', 'diamonds'] as SwapAssetType[])
                    .filter((a) => a !== fromAsset)
                    .map((asset) => {
                      const isSelected = toAsset === asset;
                      const meta = ASSET_META[asset];
                      return (
                        <button
                          key={`to-${asset}`}
                          type="button"
                          onClick={() => handleSelectToAsset(asset)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition active:scale-95 border ${
                            isSelected
                              ? `${meta.bgColor} ${meta.borderColor} ${meta.color} shadow-xs`
                              : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{meta.icon}</span>
                          <span className="truncate">{meta.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* EXPECTED TO RECEIVE (Strict rule: Don't announce swap ratio, ONLY show expected to receive) */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#101928] to-[#0c121e] border border-amber-500/25 shadow-inner space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Expected to receive
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{toMeta.icon}</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                      +{formatAmount(expectedReceive)}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${toMeta.color}`}>
                    {toMeta.name}
                  </span>
                </div>
              </div>

              {/* Validation Status message */}
              {isInsufficient && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
                  Insufficient {fromMeta.name} balance ({formatAmount(currentBalance)} available)
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                id="btn-confirm-swap"
                onClick={handleConfirmSwap}
                disabled={!canSwap}
                className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 shadow-lg active:scale-98 ${
                  canSwap
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isInsufficient
                    ? `Insufficient ${fromMeta.name}`
                    : parsedAmount <= 0 || expectedReceive <= 0
                    ? 'Select Amount to Exchange'
                    : 'Confirm Swap'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
