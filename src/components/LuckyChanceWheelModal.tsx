import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, RefreshCw, Trophy, ArrowRight, Zap, Gem, Key, DollarSign, RotateCw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export type LuckyChanceRewardType = 'diamond' | 'key' | 'points' | 'reserve' | 'extra_spin' | 'empty';

export interface LuckyChanceReward {
  type: LuckyChanceRewardType;
  amount: number;
  label: string;
}

interface LuckyChanceWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  spinsRemaining: number;
  nextRefillTime: number;
  onSpinStart: () => void;
  onWinReward: (reward: LuckyChanceReward) => void;
}

export interface LuckyChanceSegment {
  index: number;
  type: LuckyChanceRewardType;
  amount: number;
  label: string;
  badge?: string;
  color: string;
  textColor: string;
  canWin: boolean;
  weight: number;
}

// 15 Charts Scattered Wheel Configuration
// Slices requested:
// 2 diamond, 5 diamond, 1 key, 7 key, 100 keys (never win)
// 3M PTS, 1M PTS, 20M PTS, 0, 0, EXTRA SPIN, $3, $1.5, $0.8, $20 (never win)
export const FIFTEEN_SEGMENTS: LuckyChanceSegment[] = [
  { index: 0, type: 'points', amount: 1000000, label: '1M PTS', color: '#1e3a8a', textColor: '#bfdbfe', canWin: true, weight: 15 },
  { index: 1, type: 'diamond', amount: 2, label: '2 💎', color: '#0284c7', textColor: '#bae6fd', canWin: true, weight: 16 },
  { index: 2, type: 'reserve', amount: 1.5, label: '$1.50', color: '#059669', textColor: '#a7f3d0', canWin: true, weight: 12 },
  { index: 3, type: 'key', amount: 1, label: '1 Key', color: '#d97706', textColor: '#fef3c7', canWin: true, weight: 16 },
  { index: 4, type: 'empty', amount: 0, label: '0', color: '#334155', textColor: '#94a3b8', canWin: true, weight: 10 },
  { index: 5, type: 'diamond', amount: 5, label: '5 💎', color: '#0ea5e9', textColor: '#e0f2fe', canWin: true, weight: 12 },
  { index: 6, type: 'points', amount: 20000000, label: '20M PTS', color: '#7c3aed', textColor: '#f5d0fe', canWin: true, weight: 7 },
  { index: 7, type: 'reserve', amount: 0.8, label: '$0.80', color: '#0d9488', textColor: '#99f6e4', canWin: true, weight: 14 },
  { index: 8, type: 'key', amount: 100, label: '100 Keys', badge: 'JACKPOT', color: '#ca8a04', textColor: '#fef08a', canWin: false, weight: 0 },
  { index: 9, type: 'key', amount: 7, label: '7 Keys', color: '#ea580c', textColor: '#ffedd5', canWin: true, weight: 8 },
  { index: 10, type: 'empty', amount: 0, label: '0', color: '#1e293b', textColor: '#64748b', canWin: true, weight: 10 },
  { index: 11, type: 'reserve', amount: 3.0, label: '$3.00', color: '#16a34a', textColor: '#bbf7d0', canWin: true, weight: 8 },
  { index: 12, type: 'points', amount: 3000000, label: '3M PTS', color: '#4f46e5', textColor: '#c7d2fe', canWin: true, weight: 12 },
  { index: 13, type: 'reserve', amount: 20.0, label: '$20.00', badge: 'MEGA', color: '#047857', textColor: '#6ee7b7', canWin: false, weight: 0 },
  { index: 14, type: 'extra_spin', amount: 1, label: '+1 SPIN', color: '#c026d3', textColor: '#fae8ff', canWin: true, weight: 12 },
];

export const LuckyChanceWheelModal: React.FC<LuckyChanceWheelModalProps> = ({
  isOpen,
  onClose,
  spinsRemaining,
  nextRefillTime,
  onSpinStart,
  onWinReward,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSegment, setWonSegment] = useState<LuckyChanceSegment | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const tickIntervalRef = useRef<number | null>(null);

  // Real-time clock for countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Calculate 24-hour countdown if refill timer is active
  const remainingMs = Math.max(0, nextRefillTime - currentTime);
  const countdownHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const countdownMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const countdownSecs = Math.floor((remainingMs % (1000 * 60)) / 1000);
  const countdownFormatted = `${countdownHours.toString().padStart(2, '0')}:${countdownMins
    .toString()
    .padStart(2, '0')}:${countdownSecs.toString().padStart(2, '0')}`;

  const handleSpin = () => {
    if (isSpinning || spinsRemaining <= 0) return;

    soundFx.playClick();
    setIsSpinning(true);
    setWonSegment(null);
    onSpinStart();

    // Weighted random selection among eligible (canWin === true) segments.
    // 100 Keys and $20 have canWin: false, so player will never win them.
    const eligibleSegments = FIFTEEN_SEGMENTS.filter((s) => s.canWin);
    const totalWeight = eligibleSegments.reduce((sum, s) => sum + s.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let winningSegment = eligibleSegments[0];

    for (const seg of eligibleSegments) {
      if (randomVal < seg.weight) {
        winningSegment = seg;
        break;
      }
      randomVal -= seg.weight;
    }

    const winningIdx = winningSegment.index;

    // 15 Segments: 360 / 15 = 24 degrees per slice
    // Slice i is [i * 24, (i + 1) * 24]. Midpoint = i * 24 + 12
    // Top pointer is at 270 deg (12 o'clock)
    const anglePerSlice = 24;
    const segCenterAngle = winningIdx * anglePerSlice + anglePerSlice / 2;
    let targetOffset = (270 - segCenterAngle) % 360;
    if (targetOffset < 0) targetOffset += 360;

    // Spin takes exactly 8 seconds to stop
    // 10 complete rotations + target offset + small center jitter
    const fullSpins = 10;
    const currentBase = Math.floor(rotation / 360) * 360;
    const jitter = (Math.random() - 0.5) * 5; // ±2.5 deg jitter safely inside slice
    const finalRotation = currentBase + 360 * fullSpins + targetOffset + jitter;

    setRotation(finalRotation);

    // Audio ticks during the 8-second spin
    let ticks = 0;
    tickIntervalRef.current = window.setInterval(() => {
      soundFx.playWheelTick();
      ticks++;
      if (ticks > 42 && tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }, 180);

    // 8-second spin duration as instructed
    setTimeout(() => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setWonSegment(winningSegment);
      soundFx.playReward();
      onWinReward({
        type: winningSegment.type,
        amount: winningSegment.amount,
        label: winningSegment.label,
      });
    }, 8000);
  };

  const handleClose = () => {
    if (isSpinning) return;
    soundFx.playClick();
    onClose();
  };

  const size = 320;
  const center = size / 2;
  const radius = center - 15;
  const anglePerSlice = 360 / 15; // 24 degrees

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b0c16] border-2 border-purple-500/80 shadow-[0_0_60px_rgba(168,85,247,0.4)] overflow-hidden flex flex-col items-center">
        {/* Header Ribbon */}
        <div className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/80 border-b border-purple-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-purple-300 tracking-wider font-['Rajdhani',sans-serif]">
                  S*** MORSE LUCKY CHANCE WHEEL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">15-Chart Cryptographic Spin • 6 Spins / 24 Hours</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isSpinning}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spins Status & 24h Countdown Tracker */}
        <div className="w-full px-4 pt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-purple-300" />
              <span className="font-bold text-white font-mono text-[11px]">
                {spinsRemaining} {spinsRemaining === 1 ? 'Spin' : 'Spins'} Left
              </span>
            </div>
            {spinsRemaining > 6 && (
              <span className="text-[10px] font-bold text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
                +{spinsRemaining - 6} Extra!
              </span>
            )}
          </div>

          {remainingMs > 0 && spinsRemaining <= 0 ? (
            <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <span>Resets in:</span>
              <span className="font-black text-amber-200">{countdownFormatted}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">6 spins refill every 24h</span>
          )}
        </div>

        {/* Wheel Container */}
        <div className="relative my-3 flex items-center justify-center">
          {/* Top Pointer Indicator (at 12 o'clock, 270 deg) */}
          <div className="absolute -top-3.5 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow(0 0 6px rgba(251,191,36,0.8))" />
          </div>

          <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

          {/* SVG 15-Segment Wheel */}
          <div
            className="relative rounded-full shadow-[0_0_40px_rgba(168,85,247,0.35)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              // Exact 8-second spin animation
              transition: isSpinning ? 'transform 8000ms cubic-bezier(0.12, 0.95, 0.22, 1)' : 'none',
            }}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <defs>
                <radialGradient id="lucky15CenterGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="60%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#2e1065" />
                </radialGradient>
              </defs>

              <circle cx={center} cy={center} r={radius + 4} fill="#090d16" stroke="#8b5cf6" strokeWidth="3.5" />

              {FIFTEEN_SEGMENTS.map((seg, i) => {
                const startAngle = (i * anglePerSlice * Math.PI) / 180;
                const endAngle = ((i + 1) * anglePerSlice * Math.PI) / 180;

                const x1 = center + radius * Math.cos(startAngle);
                const y1 = center + radius * Math.sin(startAngle);
                const x2 = center + radius * Math.cos(endAngle);
                const y2 = center + radius * Math.sin(endAngle);

                const midAngle = ((i * anglePerSlice + anglePerSlice / 2) * Math.PI) / 180;
                const textRadius = radius * 0.72;
                const tx = center + textRadius * Math.cos(midAngle);
                const ty = center + textRadius * Math.sin(midAngle);
                const textRotation = (midAngle * 180) / Math.PI + 90;

                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={seg.index}>
                    <path
                      d={pathData}
                      fill={seg.color}
                      stroke="#0b0f19"
                      strokeWidth="1.5"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={seg.textColor}
                      fontSize="9.5"
                      fontWeight="900"
                      fontFamily="'Rajdhani', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}

              {/* Decorative Center Jewel Hub */}
              <circle cx={center} cy={center} r="30" fill="url(#lucky15CenterGrad)" stroke="#f0abfc" strokeWidth="2.5" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Win Alert Result */}
        {wonSegment && !isSpinning && (
          <div className="px-4 py-2 mb-2 mx-4 w-[calc(100%-2rem)] flex flex-col items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-200 font-bold text-xs animate-in zoom-in-95 duration-150 text-center shadow-lg">
            <div className="flex items-center gap-1.5 text-sm text-amber-300 font-black font-['Rajdhani',sans-serif]">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {wonSegment.type === 'points' && `YOU WON +${(wonSegment.amount / 1000000).toLocaleString()}M PTS!`}
                {wonSegment.type === 'diamond' && `YOU WON +${wonSegment.amount} DIAMONDS!`}
                {wonSegment.type === 'key' && `YOU WON +${wonSegment.amount} ${wonSegment.amount === 1 ? 'KEY' : 'KEYS'}!`}
                {wonSegment.type === 'reserve' && `YOU WON +$${wonSegment.amount.toFixed(2)} RESERVE!`}
                {wonSegment.type === 'extra_spin' && `YOU WON +1 EXTRA SPIN!`}
                {wonSegment.type === 'empty' && `0 WON THIS SPIN!`}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-normal mt-0.5">
              {wonSegment.type === 'points' && 'Credited directly to your Point Balance.'}
              {wonSegment.type === 'diamond' && 'Credited directly to your Diamond Reserve.'}
              {wonSegment.type === 'key' && 'Credited directly to Master Keys Vault.'}
              {wonSegment.type === 'reserve' && 'Credited directly to $ Reserve Balance.'}
              {wonSegment.type === 'extra_spin' && 'Added to your wheel spins immediately!'}
              {wonSegment.type === 'empty' && 'Better luck on your next spin!'}
            </span>
          </div>
        )}

        {/* Spin Action Button */}
        <div className="w-full px-4 pb-4 pt-1">
          <button
            onClick={handleSpin}
            disabled={isSpinning || spinsRemaining <= 0}
            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_25px_rgba(168,85,247,0.35)] cursor-pointer ${
              spinsRemaining <= 0
                ? 'bg-slate-800 text-slate-400 border border-white/10 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-[0.98]'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SPINNING (8s)...</span>
              </>
            ) : spinsRemaining <= 0 ? (
              <>
                <span>DAILY LIMIT REACHED ({countdownFormatted})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>SPIN 15-CHART WHEEL ({spinsRemaining} LEFT)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
