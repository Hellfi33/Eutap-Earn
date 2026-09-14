import React, { useState, useRef } from 'react';
import { Gem, Sparkles, X, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SecretDiamondWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiamonds: number;
  onWinDiamonds: (diamonds: number) => void;
}

// 10 Segments (1 to 10 diamonds)
const DIAMOND_SEGMENTS = [
  { index: 0, diamonds: 1, color: '#0ea5e9', label: '1 💎' },
  { index: 1, diamonds: 2, color: '#38bdf8', label: '2 💎' },
  { index: 2, diamonds: 3, color: '#60a5fa', label: '3 💎' },
  { index: 3, diamonds: 4, color: '#818cf8', label: '4 💎' },
  { index: 4, diamonds: 5, color: '#a78bfa', label: '5 💎' },
  { index: 5, diamonds: 6, color: '#c084fc', label: '6 💎' },
  { index: 6, diamonds: 7, color: '#e879f9', label: '7 💎' },
  { index: 7, diamonds: 8, color: '#f43f5e', label: '8 💎' }, // Forbidden to win
  { index: 8, diamonds: 9, color: '#fb7185', label: '9 💎' }, // Forbidden to win
  { index: 9, diamonds: 10, color: '#facc15', label: '10 💎' }, // Forbidden to win
];

export const SecretDiamondWheelModal: React.FC<SecretDiamondWheelModalProps> = ({
  isOpen,
  onClose,
  currentDiamonds,
  onWinDiamonds,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonDiamonds, setWonDiamonds] = useState<number | null>(null);
  const tickIntervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;

    soundFx.playClick();
    setIsSpinning(true);
    setWonDiamonds(null);

    // Rule: "Player is not allowed to win 8-10. Wheel spins well."
    // Winning index must be strictly between 0 and 6 (1 to 7 diamonds)
    const allowedWinIndices = [0, 1, 2, 3, 4, 5, 6];
    const winningIdx = allowedWinIndices[Math.floor(Math.random() * allowedWinIndices.length)];
    const winningSegment = DIAMOND_SEGMENTS[winningIdx];

    // Calculate rotation: 10 segments => 36 deg per segment
    // Segment i occupies [i * 36, (i + 1) * 36] deg. Center = i * 36 + 18 deg.
    // Top needle is at 270 deg (12 o'clock).
    // Target offset = (270 - segCenter) % 360
    const segCenterAngle = winningIdx * 36 + 18;
    let targetOffset = (270 - segCenterAngle) % 360;
    if (targetOffset < 0) targetOffset += 360;

    // 6 full turns (2160 deg) + target offset + slight jitter (-5 to +5 deg)
    const currentBase = Math.floor(rotation / 360) * 360;
    const jitter = (Math.random() - 0.5) * 8;
    const finalRotation = currentBase + 360 * 6 + targetOffset + jitter;

    setRotation(finalRotation);

    // Wheel audio ticks
    let ticks = 0;
    tickIntervalRef.current = window.setInterval(() => {
      soundFx.playWheelTick();
      ticks++;
      if (ticks > 22 && tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }, 170);

    // Stop and credit
    setTimeout(() => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setWonDiamonds(winningSegment.diamonds);
      soundFx.playReward();
      onWinDiamonds(winningSegment.diamonds);
    }, 4200);
  };

  const handleClose = () => {
    if (isSpinning) return;
    soundFx.playClick();
    onClose();
  };

  // SVG Geometry for 10 slices
  const size = 300;
  const center = size / 2;
  const radius = center - 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b101d] border-2 border-cyan-400/80 shadow-[0_0_60px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col items-center">
        {/* Header Ribbon */}
        <div className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-black border-b border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center">
              <Gem className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-cyan-300 tracking-wider font-['Rajdhani',sans-serif]">
                  SECRET 10-CHART DIAMOND WHEEL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Exclusive Diamond Harvest Protocol</p>
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

        {/* Current Diamonds Balance Indicator */}
        <div className="w-full px-5 pt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Your Diamond Reserve:</span>
          <div className="flex items-center gap-1 font-black text-cyan-300 font-['Rajdhani',sans-serif] text-sm">
            <Gem className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>{currentDiamonds.toLocaleString()} 💎</span>
          </div>
        </div>

        {/* Wheel Container */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 animate-bounce" />
          </div>

          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

          {/* SVG 10-Segment Wheel */}
          <div
            className="relative rounded-full shadow-[0_0_35px_rgba(6,182,212,0.3)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            }}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <defs>
                <radialGradient id="diamondCenterGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#083344" />
                </radialGradient>
              </defs>

              {/* Outer Rim */}
              <circle cx={center} cy={center} r={radius + 4} fill="#0f172a" stroke="#06b6d4" strokeWidth="4" />

              {/* 10 Slices */}
              {DIAMOND_SEGMENTS.map((seg, i) => {
                const anglePerSlice = 36;
                const startAngle = (i * anglePerSlice * Math.PI) / 180;
                const endAngle = (((i + 1) * anglePerSlice) * Math.PI) / 180;

                const x1 = center + radius * Math.cos(startAngle);
                const y1 = center + radius * Math.sin(startAngle);
                const x2 = center + radius * Math.cos(endAngle);
                const y2 = center + radius * Math.sin(endAngle);

                const midAngle = ((i * anglePerSlice + anglePerSlice / 2) * Math.PI) / 180;
                const textRadius = radius * 0.7;
                const tx = center + textRadius * Math.cos(midAngle);
                const ty = center + textRadius * Math.sin(midAngle);
                const textRotation = (midAngle * 180) / Math.PI + 90;

                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={seg.index}>
                    <path
                      d={pathData}
                      fill={i % 2 === 0 ? '#0c1a2f' : '#102544'}
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={seg.color}
                      fontSize="12"
                      fontWeight="900"
                      fontFamily="'Rajdhani', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                    >
                      {seg.diamonds} 💎
                    </text>
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle cx={center} cy={center} r="32" fill="url(#diamondCenterGrad)" stroke="#67e8f9" strokeWidth="3" />
            </svg>

            {/* Hub Overlay Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Gem className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>

        {/* Win Alert Result */}
        {wonDiamonds !== null && !isSpinning && (
          <div className="px-5 py-2 mb-2 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 font-bold text-sm animate-in zoom-in-95 duration-150">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>YOU WON +{wonDiamonds} DIAMONDS!</span>
          </div>
        )}

        {/* Spin Action Button */}
        <div className="w-full px-5 pb-5 pt-1">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-600 hover:from-cyan-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SPINNING 10-CHART WHEEL...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>SPIN DIAMOND WHEEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
