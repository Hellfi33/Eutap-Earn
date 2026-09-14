import React, { useState, useRef } from 'react';
import { Sparkles, X, RefreshCw, Trophy, ArrowRight, Zap, Gem } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LuckyChanceWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWinReward: (reward: { type: 'points' | 'diamonds'; amount: number }) => void;
}

interface Segment {
  index: number;
  type: 'points' | 'diamonds';
  amount: number;
  label: string;
  color: string;
  textColor: string;
}

// 9 Charts Split: Points in Millions, Diamonds in Units & Tens
const NINE_SEGMENTS: Segment[] = [
  { index: 0, type: 'points', amount: 5000000, label: '5M PTS', color: '#0284c7', textColor: '#bae6fd' },
  { index: 1, type: 'diamonds', amount: 10, label: '10 💎', color: '#7c3aed', textColor: '#f5d0fe' },
  { index: 2, type: 'points', amount: 25000000, label: '25M PTS', color: '#0d9488', textColor: '#99f6e4' },
  { index: 3, type: 'diamonds', amount: 5, label: '5 💎', color: '#c026d3', textColor: '#fbcfe8' },
  { index: 4, type: 'points', amount: 100000000, label: '100M PTS', color: '#d97706', textColor: '#fde68a' },
  { index: 5, type: 'diamonds', amount: 20, label: '20 💎', color: '#9333ea', textColor: '#e9d5ff' },
  { index: 6, type: 'points', amount: 50000000, label: '50M PTS', color: '#16a34a', textColor: '#bbf7d0' },
  { index: 7, type: 'diamonds', amount: 8, label: '8 💎', color: '#db2777', textColor: '#fce7f3' },
  { index: 8, type: 'points', amount: 15000000, label: '15M PTS', color: '#2563eb', textColor: '#bfdbfe' },
];

export const LuckyChanceWheelModal: React.FC<LuckyChanceWheelModalProps> = ({
  isOpen,
  onClose,
  onWinReward,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSegment, setWonSegment] = useState<Segment | null>(null);
  const tickIntervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;

    soundFx.playClick();
    setIsSpinning(true);
    setWonSegment(null);

    // Pick random segment among the 9 segments
    const winningIdx = Math.floor(Math.random() * NINE_SEGMENTS.length);
    const winningSegment = NINE_SEGMENTS[winningIdx];

    // 9 Segments: 360 / 9 = 40 degrees per slice
    // Slice i is [i * 40, (i + 1) * 40]. Midpoint = i * 40 + 20
    // Top pointer is at 270 deg (12 o'clock)
    const segCenterAngle = winningIdx * 40 + 20;
    let targetOffset = (270 - segCenterAngle) % 360;
    if (targetOffset < 0) targetOffset += 360;

    const currentBase = Math.floor(rotation / 360) * 360;
    const jitter = (Math.random() - 0.5) * 8;
    const finalRotation = currentBase + 360 * 6 + targetOffset + jitter;

    setRotation(finalRotation);

    let ticks = 0;
    tickIntervalRef.current = window.setInterval(() => {
      soundFx.playWheelTick();
      ticks++;
      if (ticks > 22 && tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }, 170);

    setTimeout(() => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setWonSegment(winningSegment);
      soundFx.playReward();
      onWinReward({ type: winningSegment.type, amount: winningSegment.amount });
    }, 4200);
  };

  const handleClose = () => {
    if (isSpinning) return;
    soundFx.playClick();
    onClose();
  };

  const size = 300;
  const center = size / 2;
  const radius = center - 15;
  const anglePerSlice = 360 / 9; // 40 degrees

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e0c1f] border-2 border-purple-500/80 shadow-[0_0_60px_rgba(168,85,247,0.4)] overflow-hidden flex flex-col items-center">
        {/* Header Ribbon */}
        <div className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-black border-b border-purple-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-purple-300 tracking-wider font-['Rajdhani',sans-serif]">
                  9-CHART LUCKY CHANCE WHEEL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Split: Millions of Points & Units/Tens of Diamonds</p>
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

        {/* Wheel Container */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 animate-bounce" />
          </div>

          <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />

          {/* SVG 9-Segment Wheel */}
          <div
            className="relative rounded-full shadow-[0_0_35px_rgba(168,85,247,0.3)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            }}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <defs>
                <radialGradient id="luckyCenterGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#3b0764" />
                </radialGradient>
              </defs>

              <circle cx={center} cy={center} r={radius + 4} fill="#0f172a" stroke="#a855f7" strokeWidth="4" />

              {NINE_SEGMENTS.map((seg, i) => {
                const startAngle = (i * anglePerSlice * Math.PI) / 180;
                const endAngle = (((i + 1) * anglePerSlice) * Math.PI) / 180;

                const x1 = center + radius * Math.cos(startAngle);
                const y1 = center + radius * Math.sin(startAngle);
                const x2 = center + radius * Math.cos(endAngle);
                const y2 = center + radius * Math.sin(endAngle);

                const midAngle = ((i * anglePerSlice + anglePerSlice / 2) * Math.PI) / 180;
                const textRadius = radius * 0.68;
                const tx = center + textRadius * Math.cos(midAngle);
                const ty = center + textRadius * Math.sin(midAngle);
                const textRotation = (midAngle * 180) / Math.PI + 90;

                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={seg.index}>
                    <path
                      d={pathData}
                      fill={seg.color}
                      stroke="#1e1b4b"
                      strokeWidth="2"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={seg.textColor}
                      fontSize="12"
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

              <circle cx={center} cy={center} r="32" fill="url(#luckyCenterGrad)" stroke="#f0abfc" strokeWidth="3" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>

        {/* Win Alert Result */}
        {wonSegment && !isSpinning && (
          <div className="px-5 py-2 mb-2 w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-200 font-bold text-sm animate-in zoom-in-95 duration-150">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>
              YOU WON +
              {wonSegment.type === 'points'
                ? `${(wonSegment.amount / 1000000).toLocaleString()}M POINTS`
                : `${wonSegment.amount} DIAMONDS`}
              !
            </span>
          </div>
        )}

        {/* Spin Action Button */}
        <div className="w-full px-5 pb-5 pt-1">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[0_0_25px_rgba(168,85,247,0.4)]"
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SPINNING 9-CHART WHEEL...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>SPIN LUCKY WHEEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
