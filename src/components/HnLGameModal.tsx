import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowUp, ArrowDown, DollarSign, HelpCircle, RotateCcw, Sparkles, AlertCircle, Trophy, History, Layers, Lock, ShieldAlert } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { getHnLFix, isHnLFixActive } from '../utils/gameFixManager';

export interface HnLGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance: number;
  onDebitStake: (amount: number) => void;
  onCreditWin: (amount: number) => void;
  onAddDemoReserve?: () => void;
  coins: number;
  goldCoinImg: string;
}

// The secret spins that MUST land on 0:
// 1st, 10th, 15th, 29th, 40th, 72nd, 78th, 85th, 89th, 91st, 99th, 103rd
export const SECRET_ZERO_SPINS = [1, 10, 15, 29, 40, 72, 78, 85, 89, 91, 99, 103];

export interface HnLTier {
  id: '10k' | '100k' | '1m';
  name: string;
  rangeLabel: string; // e.g. "0 – 10k"
  fullRange: string;
  threshold: number; // e.g. 10000
  thresholdFormatted: string; // e.g. "10,000"
  minRoll: number;
  maxRoll: number;
  belowEarn: number; // Base earn below threshold
  aboveEarn: number; // Base earn above threshold
  aboveIsWin: boolean; // False for $50 and $100 ($50 and $100 is never win)
  defaultStake: number;
  badgeColor: string;
  activeBorder: string;
}

export const HNL_TIERS: HnLTier[] = [
  {
    id: '10k',
    name: '10K',
    rangeLabel: '0 – 10k',
    fullRange: '0 – 10,000',
    threshold: 10000,
    thresholdFormatted: '10,000',
    minRoll: 1,
    maxRoll: 25000,
    belowEarn: 1,
    aboveEarn: 5,
    aboveIsWin: true, // Can win $5
    defaultStake: 1,
    badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40',
    activeBorder: 'border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
  },
  {
    id: '100k',
    name: '100K',
    rangeLabel: '10k – 100k',
    fullRange: '10,001 – 100,000',
    threshold: 100000,
    thresholdFormatted: '100,000',
    minRoll: 10001,
    maxRoll: 250000,
    belowEarn: 3,
    aboveEarn: 50,
    aboveIsWin: false, // $50 is NEVER win
    defaultStake: 2,
    badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-400/40',
    activeBorder: 'border-amber-400 bg-amber-950/50 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
  },
  {
    id: '1m',
    name: '1M+',
    rangeLabel: '100k – 1M+',
    fullRange: '100,001 – 1,000,000+',
    threshold: 1000000,
    thresholdFormatted: '1,000,000',
    minRoll: 100001,
    maxRoll: 2500000,
    belowEarn: 5,
    aboveEarn: 100,
    aboveIsWin: false, // $100 is NEVER win
    defaultStake: 5,
    badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-400/40',
    activeBorder: 'border-purple-400 bg-purple-950/50 text-purple-200 shadow-[0_0_12px_rgba(192,132,252,0.35)]',
  },
];

const STORAGE_SPINS_KEY = 'hnl_total_spins_v4';
const STORAGE_PREV_NUM_KEY = 'hnl_previous_num_v4';
const STORAGE_TIER_KEY = 'hnl_active_tier_v4';

interface SpinHistoryEntry {
  spinIndex: number;
  prevNum: number;
  resultNum: number;
  prediction: 'higher' | 'lower';
  isWin: boolean;
  tierId: string;
  payout: number;
}

export const HnLGameModal: React.FC<HnLGameModalProps> = ({
  isOpen,
  onClose,
  reserveBalance,
  onDebitStake,
  onCreditWin,
  onAddDemoReserve,
}) => {
  // Total spins persisted
  const [totalSpins, setTotalSpins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SPINS_KEY);
      return saved ? Math.max(0, parseInt(saved, 10)) : 0;
    } catch {
      return 0;
    }
  });

  // Current center number: Rule 1: "the number 0 is placed at the center of the H&L interface"
  const [currentNum, setCurrentNum] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREV_NUM_KEY);
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Active Tier (10K, 100K, or 1M)
  const [selectedTierId, setSelectedTierId] = useState<'10k' | '100k' | '1m'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TIER_KEY);
      if (saved === '100k' || saved === '1m') return saved;
      return '10k';
    } catch {
      return '10k';
    }
  });

  const activeTier = HNL_TIERS.find((t) => t.id === selectedTierId) || HNL_TIERS[0];

  const [stakeAmount, setStakeAmount] = useState<number>(() => activeTier.defaultStake);
  const [prediction, setPrediction] = useState<'higher' | 'lower'>('higher');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinTimeLeft, setSpinTimeLeft] = useState<number>(5); // 5 seconds spin countdown
  const [displayNum, setDisplayNum] = useState<number>(currentNum);
  const [showRules, setShowRules] = useState<boolean>(false);

  const [lastRoundResult, setLastRoundResult] = useState<{
    isWin: boolean;
    prevNum: number;
    resultNum: number;
    prediction: 'higher' | 'lower';
    payout: number;
    isZeroTrap: boolean;
    isBlockedJackpot?: boolean;
    tierRange: string;
    threshold: number;
    isAboveThreshold: boolean;
  } | null>(null);

  const [history, setHistory] = useState<SpinHistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const spinIntervalRef = useRef<number | null>(null);
  const spinCountdownRef = useRef<number | null>(null);
  const spinTimeoutRef = useRef<number | null>(null);

  // Sync states to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SPINS_KEY, totalSpins.toString());
    } catch {}
  }, [totalSpins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREV_NUM_KEY, currentNum.toString());
    } catch {}
  }, [currentNum]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TIER_KEY, selectedTierId);
    } catch {}
  }, [selectedTierId]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      if (spinCountdownRef.current) clearInterval(spinCountdownRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Calculate earn potential based on the selected tier, threshold, and stake
  // Note: $50 and $100 is NEVER WIN
  const calculateEarnForOutcome = (tier: HnLTier, outcome: number, stake: number): number => {
    const isAbove = outcome > tier.threshold;
    if (isAbove && !tier.aboveIsWin) {
      // $50 and $100 is never win!
      return 0;
    }
    const basePrize = isAbove ? tier.aboveEarn : tier.belowEarn;
    const multiplier = Math.max(1, stake / tier.defaultStake);
    return Math.round(basePrize * multiplier * 100) / 100;
  };

  // Determine outcome number based on rules:
  // Rule 3: "The first spin must return at 0."
  // Rule 7: "The secret spins (1, 10, 15, 29, 40, 72, 78, 85, 89, 91, 99, 103) end at 0."
  // Requirement: "$50 and $100 is never win."
  const calculateNextNumber = (nextSpinIndex: number, previous: number, tier: HnLTier, userPrediction: 'higher' | 'lower'): number => {
    // Check if classified fix is active across system
    const fixedNum = getHnLFix(previous, tier);
    if (fixedNum !== null) {
      return fixedNum;
    }

    if (SECRET_ZERO_SPINS.includes(nextSpinIndex)) {
      return 0;
    }

    // If player predicts higher in 100k or 1m tier:
    // They are trying to hit the above prize ($50 or $100).
    // The requirement explicitly states: "$50 and $100 is never win."
    // Generate a roll that guarantees no win on $50 / $100, or force a lower roll / house stop
    if (userPrediction === 'higher' && !tier.aboveIsWin) {
      // Player picked higher on 100k or 1m. They cannot win.
      // Roll either lower than previous (if previous > minRoll) or drop into house zero / below
      if (previous > tier.minRoll) {
        return Math.floor(Math.random() * (previous - tier.minRoll)) + tier.minRoll;
      } else {
        // Drop to 0
        return 0;
      }
    }

    // Standard random generation for other cases
    const rangeSpan = tier.maxRoll - tier.minRoll;
    let candidate: number;
    let attempts = 0;
    do {
      candidate = Math.floor(Math.random() * rangeSpan) + tier.minRoll;
      attempts++;
    } while (candidate === previous && attempts < 25);

    if (candidate === previous) {
      candidate = candidate >= tier.maxRoll ? candidate - 1 : candidate + 1;
    }

    return candidate;
  };

  const handleStartSpin = () => {
    if (isSpinning) return;

    setErrorMessage(null);

    // Stake validation
    if (stakeAmount <= 0) {
      setErrorMessage('Stake must be at least $1.00');
      return;
    }

    if (reserveBalance < stakeAmount) {
      setErrorMessage(`Insufficient balance ($${reserveBalance.toFixed(2)}). Lower stake.`);
      soundFx.playTap(true);
      return;
    }

    // Debit stake
    onDebitStake(stakeAmount);
    soundFx.playClick();
    soundFx.triggerHaptic();

    setIsSpinning(true);
    setLastRoundResult(null);
    setSpinTimeLeft(5); // 5 seconds

    const nextSpinIndex = totalSpins + 1;
    const targetOutcome = calculateNextNumber(nextSpinIndex, currentNum, activeTier, prediction);
    const prevNumber = currentNum;

    // Requirement:
    // "The numbers will not show when spin is in process. It will only be spinning for 5 seconds and then unveil the number spinned."
    const SPIN_DURATION = 5000; // 5 seconds exactly

    // Sound ticks during the 5 seconds
    spinIntervalRef.current = window.setInterval(() => {
      soundFx.playHnLSpin();
    }, 220);

    // 5-second countdown timer
    const startTime = Date.now();
    spinCountdownRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingSec = Math.max(0, 5 - Math.floor(elapsed / 1000));
      setSpinTimeLeft(remainingSec);
    }, 250);

    spinTimeoutRef.current = window.setTimeout(() => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      if (spinCountdownRef.current) clearInterval(spinCountdownRef.current);

      // UNVEIL THE NUMBER SPINNED!
      setDisplayNum(targetOutcome);
      setCurrentNum(targetOutcome);
      setIsSpinning(false);
      setTotalSpins(nextSpinIndex);

      // Win / Loss determination
      let isWin = false;
      let isZeroTrap = false;
      let isBlockedJackpot = false;

      if (targetOutcome === 0) {
        isZeroTrap = true;
        isWin = false;
      } else if (targetOutcome > prevNumber) {
        isWin = prediction === 'higher';
      } else if (targetOutcome < prevNumber) {
        isWin = prediction === 'lower';
      }

      const overrideActive = isHnLFixActive();

      // STRICT RULE for fair play: "$50 and $100 is never win."
      // Bypass only if player explicitly set secret override from classified console
      if (!overrideActive && (activeTier.id === '100k' || activeTier.id === '1m') && targetOutcome > activeTier.threshold) {
        isWin = false;
        isBlockedJackpot = true;
      }

      const isAbove = targetOutcome > activeTier.threshold;
      let payout = 0;
      if (isWin) {
        if (overrideActive) {
          const basePrize = isAbove ? activeTier.aboveEarn : activeTier.belowEarn;
          const multiplier = Math.max(1, stakeAmount / activeTier.defaultStake);
          payout = Math.round(basePrize * multiplier * 100) / 100;
        } else {
          payout = calculateEarnForOutcome(activeTier, targetOutcome, stakeAmount);
          if (payout >= 50) {
            payout = 0;
            isWin = false;
            isBlockedJackpot = true;
          }
        }
      }

      if (isWin) {
        soundFx.playWin();
        soundFx.triggerHaptic();
        onCreditWin(payout);
      } else {
        soundFx.playLoss();
        soundFx.triggerHaptic();
      }

      setLastRoundResult({
        isWin,
        prevNum: prevNumber,
        resultNum: targetOutcome,
        prediction,
        payout,
        isZeroTrap,
        isBlockedJackpot,
        tierRange: activeTier.rangeLabel,
        threshold: activeTier.threshold,
        isAboveThreshold: isAbove,
      });

      setHistory((prev) => [
        {
          spinIndex: nextSpinIndex,
          prevNum: prevNumber,
          resultNum: targetOutcome,
          prediction,
          isWin,
          tierId: activeTier.id,
          payout,
        },
        ...prev.slice(0, 5),
      ]);
    }, SPIN_DURATION);
  };

  const resetSpinCounter = () => {
    if (isSpinning) return;
    if (confirm('Reset spin counter to 0? (First spin will again return at 0)')) {
      soundFx.playClick();
      setTotalSpins(0);
      setCurrentNum(0);
      setDisplayNum(0);
      setLastRoundResult(null);
      try {
        localStorage.setItem(STORAGE_SPINS_KEY, '0');
        localStorage.setItem(STORAGE_PREV_NUM_KEY, '0');
      } catch {}
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Potential earn display string
  const getPotentialEarnText = (): string => {
    if (prediction === 'higher') {
      if (!activeTier.aboveIsWin) {
        return 'Never Win ($0)';
      }
      const mult = stakeAmount > activeTier.defaultStake ? stakeAmount / activeTier.defaultStake : 1;
      return `+$${(activeTier.aboveEarn * mult).toFixed(2)}`;
    } else {
      const mult = stakeAmount > activeTier.defaultStake ? stakeAmount / activeTier.defaultStake : 1;
      return `+$${(activeTier.belowEarn * mult).toFixed(2)}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="hnl-game-modal"
        className="relative w-full max-w-sm sm:max-w-md max-h-[96vh] bg-[#07090e] border border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden"
      >
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-xl pointer-events-none" />

        {/* 1. COMPACT HEADER */}
        <div className="flex items-center justify-between z-10 pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs font-mono shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              H&L
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white tracking-wide font-['Rajdhani',sans-serif]">
                HIGHER & LOWER
              </h3>
              <span className="px-1 py-0.5 rounded bg-cyan-500/20 text-[8px] font-black text-cyan-300 border border-cyan-400/30">
                LVL 17+
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowRules((prev) => !prev);
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Game Rules"
              aria-label="View H&L Rules"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetSpinCounter}
              disabled={isSpinning}
              className={`p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition ${
                isSpinning ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Reset Spin Counter"
              aria-label="Reset Spin Counter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (isSpinning) return;
                soundFx.playClick();
                onClose();
              }}
              disabled={isSpinning}
              className={`p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition ${
                isSpinning ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. COMPACT STATS STRIP: Balance & Total Spins (Single Row) */}
        <div className="flex items-center justify-between py-1 px-2 mt-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] z-10">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[10px]">Reserve:</span>
            <span className="font-bold text-emerald-400 font-mono flex items-center">
              <DollarSign className="w-3 h-3 -mr-0.5" />
              {reserveBalance.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Total Spins:</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono border border-cyan-400/30">
              #{totalSpins}
            </span>
          </div>
        </div>

        {/* 3. COMPACT RANGE BRACKETS SELECTOR (A – B) */}
        <div className="mt-1.5 z-10">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-400 font-semibold px-0.5 mb-1">
            <span>Range Bracket (A – B)</span>
            <span className="text-cyan-400 font-normal lowercase">($50 & $100 never win)</span>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {HNL_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={isSpinning}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedTierId(tier.id);
                    setStakeAmount(tier.defaultStake);
                    setErrorMessage(null);
                  }}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? tier.activeBorder
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-bold text-[11px] text-white">
                    <span>{tier.name}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </div>
                  <div className="text-[9px] font-mono text-slate-300">{tier.rangeLabel}</div>
                  <div className="text-[8px] font-semibold mt-0.5">
                    {tier.aboveIsWin ? (
                      <span className="text-emerald-400">Win $1 / $5</span>
                    ) : tier.id === '100k' ? (
                      <span className="text-amber-400">Win $3 (Above: N/A)</span>
                    ) : (
                      <span className="text-purple-400">Win $5 (Above: N/A)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. COMPACT RULES ACCORDION (If Opened) */}
        {showRules && (
          <div className="my-1.5 p-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-[10px] text-slate-300 z-20 space-y-1">
            <div className="flex items-center justify-between text-cyan-300 font-bold uppercase text-[10px]">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-cyan-400" /> Game Rules & Secret Traps
              </span>
              <span className="font-mono">Next: #{totalSpins + 1}</span>
            </div>
            <p>• Predict HIGHER or LOWER than current center number.</p>
            <p>• <strong>Spin time:</strong> Spins for 5s, numbers hidden during spin.</p>
            <p>• <strong>10K Range:</strong> Below earns $1, Above earns $5.</p>
            <p>• <strong>100K & 1M Ranges:</strong> <span className="text-amber-300 font-bold">$50 & $100 is NEVER win</span>. Below earns $3 / $5.</p>
            <p>• <strong>Secret 0 Spins:</strong> Spins 1, 10, 15, 29, 40, 72, 78, 85, 89, 91, 99, 103 land on 0 (House Trap).</p>
          </div>
        )}

        {/* 5. PREDICTION CHOOSER (HIGHER vs LOWER) */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5 z-10">
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              soundFx.playClick();
              setPrediction('higher');
            }}
            className={`py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              prediction === 'higher'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 text-emerald-300" />
            <span>HIGHER (▲)</span>
          </button>

          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              soundFx.playClick();
              setPrediction('lower');
            }}
            className={`py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              prediction === 'lower'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-rose-400'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-rose-300" />
            <span>LOWER (▼)</span>
          </button>
        </div>

        {/* 6. CENTER INTERFACE: NUMBER SPIN MUST SHOW CLEARLY
            Requirement: "The numbers will not show when spin is in process. It will only be spinning for 5 seconds and then unveil the number spinned." */}
        <div className="relative my-1.5 py-2.5 px-2 rounded-2xl bg-[#03060c] border border-cyan-500/25 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          {/* Subtle radial backdrop glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />

          {/* Threshold & Target Banner */}
          <div className="flex items-center gap-2 mb-1.5 z-10 text-[9px] font-mono">
            <span className="text-slate-400">
              Threshold: <strong className="text-white">{activeTier.thresholdFormatted}</strong>
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Target: <strong className="text-cyan-300 uppercase">{prediction}</strong>
            </span>
          </div>

          {/* Center Circular Dial */}
          <button
            id="center-hnl-number"
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning}
            className={`group relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-200 select-none ${
              isSpinning ? 'scale-105 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {/* Outer Spinning Ring */}
            <div
              className={`absolute -inset-1 rounded-full border-2 border-dashed ${
                isSpinning
                  ? 'border-cyan-400 animate-spin shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                  : 'border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            />

            {/* Dial Body */}
            <div
              className={`w-full h-full rounded-full bg-gradient-to-br from-slate-900 via-[#0a121e] to-black border-2 flex flex-col items-center justify-center relative shadow-[inset_0_2px_8px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.8)] px-2 ${
                isSpinning
                  ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                  : 'border-cyan-500/50 group-hover:border-cyan-300'
              }`}
            >
              {isSpinning ? (
                /* WHEN SPINNING: NO NUMBERS WILL SHOW! (Only 5s spinning suspense animation) */
                <div className="flex flex-col items-center justify-center text-center animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin mb-1 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                  </div>
                  <span className="text-[10px] font-black font-mono text-cyan-300 tracking-wider">
                    SPINNING...
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                    {spinTimeLeft}s
                  </span>
                </div>
              ) : (
                /* WHEN NOT SPINNING: CLEAR, CRISP NUMBER DISPLAY */
                <>
                  <span
                    className={`font-black font-mono tracking-tight transition-colors text-center leading-none ${
                      displayNum === 0
                        ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] text-4xl sm:text-5xl'
                        : displayNum >= 1000000
                        ? 'text-white text-lg sm:text-xl font-extrabold'
                        : displayNum >= 10000
                        ? 'text-white text-xl sm:text-2xl font-extrabold'
                        : 'text-white text-3xl sm:text-4xl'
                    }`}
                  >
                    {formatNumber(displayNum)}
                  </span>
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mt-1">
                    {displayNum === 0 ? 'TAP 0 TO SPIN' : 'CURRENT NUMBER'}
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Status / Potential Earn under dial */}
          <div className="mt-1.5 text-[10px] text-slate-400 z-10 text-center font-mono">
            {isSpinning ? (
              <span className="text-cyan-300 font-semibold">
                Rolling outcome (5 seconds suspense)...
              </span>
            ) : (
              <div className="flex items-center gap-1.5 justify-center flex-wrap">
                <span>Earn Potential:</span>
                <span className={`font-bold ${!activeTier.aboveIsWin && prediction === 'higher' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {getPotentialEarnText()}
                </span>
                {!activeTier.aboveIsWin && prediction === 'higher' && (
                  <span className="flex items-center gap-0.5 text-amber-400 text-[9px]">
                    <Lock className="w-2.5 h-2.5" /> (Locked)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 7. ROUND RESULT BANNER (Compact) */}
        {lastRoundResult && !isSpinning && (
          <div
            className={`my-1 p-1.5 rounded-xl border text-center animate-in zoom-in-95 duration-150 z-10 ${
              lastRoundResult.isWin
                ? 'bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/60 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                {lastRoundResult.isWin ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">WIN! +${lastRoundResult.payout.toFixed(2)}</span>
                  </>
                ) : lastRoundResult.isZeroTrap ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300">HOUSE ZERO TRAP (-${stakeAmount.toFixed(2)})</span>
                  </>
                ) : lastRoundResult.isBlockedJackpot ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">$50/$100 NEVER WINS (-${stakeAmount.toFixed(2)})</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">LOST (-${stakeAmount.toFixed(2)})</span>
                  </>
                )}
              </span>

              <span className="text-[10px] text-slate-300 font-mono">
                Landed on <strong className="text-white">{formatNumber(lastRoundResult.resultNum)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 8. COMPACT STAKE CONTROLS */}
        <div className="mt-1 z-10">
          <div className="flex items-center justify-between text-[10px] mb-1 px-0.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> STAKE ($)
            </span>
            <button
              type="button"
              disabled={isSpinning || reserveBalance <= 0}
              onClick={() => {
                soundFx.playClick();
                setStakeAmount(Math.max(1, Math.floor(reserveBalance)));
              }}
              className="text-slate-400 hover:text-emerald-400 underline transition text-[9px]"
            >
              Max (${Math.floor(reserveBalance)})
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 5, 10, 25].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  soundFx.playClick();
                  setStakeAmount(amt);
                  setErrorMessage(null);
                }}
                className={`py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                  stakeAmount === amt
                    ? 'bg-emerald-600 text-white border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-1 p-1 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-300 text-[10px] text-center">
            {errorMessage}
          </div>
        )}

        {/* 9. MAIN ACTION BUTTON */}
        <div className="mt-2 z-10">
          <button
            id="btn-spin-hnl"
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning}
            className={`w-full py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5 shadow-md ${
              isSpinning
                ? 'bg-slate-900 border border-white/10 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-98 cursor-pointer'
            }`}
          >
            {isSpinning ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-t-cyan-300 border-r-transparent animate-spin" />
                SPINNING ({spinTimeLeft}s)...
              </span>
            ) : (
              <span>
                SPIN ${stakeAmount.toFixed(2)} • {prediction.toUpperCase()} (5s SPIN)
              </span>
            )}
          </button>
        </div>

        {/* 10. RECENT SPINS STRIP (Tight Single Row) */}
        {history.length > 0 && (
          <div className="mt-1 pt-1 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 z-10 overflow-hidden">
            <span className="flex items-center gap-1 shrink-0">
              <History className="w-2.5 h-2.5 text-cyan-400" /> Recent:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {history.slice(0, 4).map((entry) => (
                <span
                  key={entry.spinIndex}
                  className={`px-1.5 py-0.2 rounded font-mono shrink-0 ${
                    entry.isWin
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  #{entry.spinIndex}: {formatNumber(entry.resultNum)} ({entry.isWin ? `+$${entry.payout}` : 'L'})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
