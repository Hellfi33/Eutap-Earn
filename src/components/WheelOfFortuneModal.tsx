import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Clock, Crown, Zap, RefreshCw, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface FortuneReward {
  id: string;
  index: number;
  label: string;
  type: 'usd' | 'keys' | 'diamond' | 'miss';
  value: number;
  emoji?: string;
  displayColor: string;
  bgColor: string;
}

// Exactly 8 rewards arranged randomly around the 8-chart Golden wheel
export const FORTUNE_SEGMENTS: FortuneReward[] = [
  { id: 'usd_1_5', index: 0, label: '$1.5', type: 'usd', value: 1.5, displayColor: '#34d399', bgColor: '#1c1508' },
  { id: 'miss_angry', index: 1, label: '😡', type: 'miss', value: 0, emoji: '😡', displayColor: '#f87171', bgColor: '#251208' },
  { id: 'usd_50', index: 2, label: '$50', type: 'usd', value: 50, displayColor: '#fef08a', bgColor: '#2e1c05' },
  { id: 'key_1', index: 3, label: '1 Key', type: 'keys', value: 1, emoji: '🗝️', displayColor: '#fbbf24', bgColor: '#1a1306' },
  { id: 'miss_crazy', index: 4, label: '🤪', type: 'miss', value: 0, emoji: '🤪', displayColor: '#fb923c', bgColor: '#231407' },
  { id: 'usd_1', index: 5, label: '$1', type: 'usd', value: 1, displayColor: '#34d399', bgColor: '#181206' },
  { id: 'keys_10', index: 6, label: '10 Keys', type: 'keys', value: 10, emoji: '🗝️', displayColor: '#fde047', bgColor: '#2a1a05' },
  { id: 'diamond_2', index: 7, label: '2 Diamonds', type: 'diamond', value: 2, emoji: '💎', displayColor: '#38bdf8', bgColor: '#14120f' },
];

interface WheelOfFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  spinsRemaining: number;
  nextRefillTime: number;
  onSpinUsed: (
    reward: FortuneReward,
    updatedSpins: number,
    nextRefillTime: number
  ) => void;
}

export const WheelOfFortuneModal: React.FC<WheelOfFortuneModalProps> = ({
  isOpen,
  onClose,
  spinsRemaining,
  nextRefillTime,
  onSpinUsed,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<FortuneReward | null>(null);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const tickIntervalRef = useRef<number | null>(null);

  // 24-hour countdown calculation
  useEffect(() => {
    if (!isOpen) return;

    const calculateTimer = () => {
      if (spinsRemaining <= 0 && nextRefillTime > 0) {
        const diff = Math.max(0, nextRefillTime - Date.now());
        if (diff <= 0) {
          setCountdownText('Ready to reopen!');
        } else {
          const totalSec = Math.floor(diff / 1000);
          const hours = Math.floor(totalSec / 3600);
          const mins = Math.floor((totalSec % 3600) / 60);
          const secs = totalSec % 60;
          setCountdownText(
            `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          );
        }
      } else {
        setCountdownText('');
      }
    };

    calculateTimer();
    const interval = setInterval(calculateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, spinsRemaining, nextRefillTime]);

  if (!isOpen) return null;

  const isLocked = spinsRemaining <= 0 && nextRefillTime > Date.now();

  const handleStartSpin = () => {
    if (isSpinning || isLocked || spinsRemaining <= 0) return;

    soundFx.playClick();
    setIsSpinning(true);
    setWonReward(null);
    setShowWinOverlay(false);

    // Eligible random drops (indices 2: $50 and 6: 10keys are never chosen)
    const eligibleIndices = [0, 1, 3, 4, 5, 7];
    const winningIdx = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
    const chosenReward = FORTUNE_SEGMENTS[winningIdx];

    // Wheel geometry: 8 slices = 45 deg per slice
    // Slice i center = i * 45 + 22.5 deg
    // Top indicator needle is at 270 deg (12 o'clock)
    const segCenterAngle = winningIdx * 45 + 22.5;
    let targetOffset = (270 - segCenterAngle) % 360;
    if (targetOffset < 0) targetOffset += 360;

    // 12 full rotations for an authentic 8-second spin
    const currentBase = Math.floor(rotation / 360) * 360;
    const jitter = (Math.random() - 0.5) * 12; // Natural slight deviation from dead center
    const finalRotation = currentBase + 360 * 12 + targetOffset + jitter;

    setRotation(finalRotation);

    // Audio clicks over 8 seconds with realistic deceleration
    let tickCount = 0;
    const maxTicks = 42;
    tickIntervalRef.current = window.setInterval(() => {
      soundFx.playWheelTick();
      tickCount++;
      if (tickCount >= maxTicks && tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }, 180);

    // Roll duration: exactly 8 seconds (8000ms)
    setTimeout(() => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setWonReward(chosenReward);
      setShowWinOverlay(true);

      if (chosenReward.type === 'miss') {
        soundFx.playClick();
      } else {
        soundFx.playReward();
      }

      // Update remaining spins and 24-hour lock
      const newSpins = Math.max(0, spinsRemaining - 1);
      let newRefill = nextRefillTime;
      if (newSpins === 0) {
        newRefill = Date.now() + 24 * 60 * 60 * 1000;
      }

      onSpinUsed(chosenReward, newSpins, newRefill);
    }, 8000);
  };

  const handleClose = () => {
    if (isSpinning) return;
    soundFx.playClick();
    onClose();
  };

  const handleDismissOverlay = () => {
    soundFx.playClick();
    setShowWinOverlay(false);
  };

  // SVG Geometry for 8 Segments
  const size = 300;
  const center = size / 2;
  const radius = center - 16;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c1407] via-[#100c05] to-[#080602] border-2 border-amber-500/70 shadow-[0_0_70px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col items-center">
        {/* Decorative Golden Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-44 h-44 bg-yellow-600/15 blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="w-full flex items-center justify-between px-5 py-3.5 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-amber-200 tracking-wider font-['Rajdhani',sans-serif]">
                  WHEEL OF FORTUNE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-[9px] font-extrabold text-amber-300 border border-amber-400/40">
                  GOLDEN
                </span>
              </div>
              <p className="text-[11px] text-amber-400/70">8-Chart Royal Spin Wheel</p>
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

        {/* Spins Status Pips & Cooldown Bar */}
        <div className="w-full px-5 pt-3 pb-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Daily Spins:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((idx) => {
                const isActive = idx <= spinsRemaining;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition ${
                      isActive
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        : 'bg-black/60 border-white/15'
                    }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-950" />}
                  </div>
                );
              })}
            </div>
            <span className="font-['Rajdhani',sans-serif] font-bold text-amber-300 text-sm ml-0.5">
              {spinsRemaining}/6
            </span>
          </div>

          {isLocked ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{countdownText || 'Locked for 24h'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[11px] font-bold">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Active</span>
            </div>
          )}
        </div>

        {/* Wheel Stage Container */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Outer Glowing Metallic Ring */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-400/20 to-amber-700/40 blur-md pointer-events-none" />

          {/* Top Indicator / Needle Pointer */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-300 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            <div className="w-3.5 h-3.5 -mt-6 rounded-full bg-amber-100 border-2 border-amber-600 shadow-md" />
          </div>

          {/* The Rotating Wheel SVG */}
          <div
            className="relative"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 8000ms cubic-bezier(0.12, 0.95, 0.32, 1)' : 'none',
            }}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <defs>
                {/* Radial gold gradient for the center hub */}
                <radialGradient id="royalGoldCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#78350f" />
                </radialGradient>

                {/* Metallic rim gradient */}
                <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="25%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#fef08a" />
                  <stop offset="75%" stopColor="#92400e" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>

              {/* Heavy Golden Outer Rim */}
              <circle
                cx={center}
                cy={center}
                r={radius + 8}
                fill="#161109"
                stroke="url(#goldRimGrad)"
                strokeWidth="7"
                className="drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              />

              {/* Decorative Perimeter Golden Rivets */}
              {Array.from({ length: 24 }).map((_, rIdx) => {
                const angle = (rIdx * 15 * Math.PI) / 180;
                const rx = center + (radius + 8) * Math.cos(angle);
                const ry = center + (radius + 8) * Math.sin(angle);
                return (
                  <circle
                    key={rIdx}
                    cx={rx}
                    cy={ry}
                    r="2"
                    fill={rIdx % 2 === 0 ? '#fef08a' : '#b45309'}
                  />
                );
              })}

              {/* 8 Slices */}
              {FORTUNE_SEGMENTS.map((seg, i) => {
                const anglePerSlice = 45;
                const startAngle = (i * anglePerSlice * Math.PI) / 180;
                const endAngle = ((i + 1) * anglePerSlice * Math.PI) / 180;

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
                  <g key={seg.id}>
                    {/* Segment slice background */}
                    <path
                      d={pathData}
                      fill={seg.bgColor}
                      stroke="#d97706"
                      strokeWidth="2"
                    />

                    {/* Content: Emoji or Text */}
                    {seg.emoji && seg.type === 'miss' ? (
                      <text
                        x={tx}
                        y={ty}
                        fontSize="24"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                      >
                        {seg.emoji}
                      </text>
                    ) : (
                      <text
                        x={tx}
                        y={ty}
                        fill={seg.displayColor}
                        fontSize={seg.label.length > 5 ? '12' : '14'}
                        fontWeight="900"
                        fontFamily="'Rajdhani', sans-serif"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                        className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                      >
                        {seg.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Inner Rim Accent */}
              <circle
                cx={center}
                cy={center}
                r="36"
                fill="none"
                stroke="#b45309"
                strokeWidth="2.5"
              />

              {/* Golden Center Hub */}
              <circle
                cx={center}
                cy={center}
                r="32"
                fill="url(#royalGoldCenter)"
                stroke="#fef08a"
                strokeWidth="3.5"
                className="drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
              />
            </svg>

            {/* Center Crown Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Crown className="w-7 h-7 text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]" />
            </div>
          </div>
        </div>

        {/* Win / Result Notification Banner */}
        {wonReward && !isSpinning && (
          <div className="w-[90%] px-4 py-2.5 mb-2 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-between animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              {wonReward.type === 'miss' ? (
                <span className="text-2xl">{wonReward.emoji}</span>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                  <Trophy className="w-4 h-4" />
                </div>
              )}
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  {wonReward.type === 'miss' ? 'Spin Result' : 'Congratulations!'}
                </span>
                <span className="text-sm font-extrabold text-white font-['Rajdhani',sans-serif]">
                  {wonReward.type === 'miss'
                    ? 'Tough Luck! Try again'
                    : `Won ${wonReward.label} credited!`}
                </span>
              </div>
            </div>

            <button
              onClick={handleDismissOverlay}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition"
            >
              OK
            </button>
          </div>
        )}

        {/* Spin Action Button */}
        <div className="w-full px-5 pb-5 pt-1">
          <button
            id="btn-spin-wheel-of-fortune"
            onClick={handleStartSpin}
            disabled={isSpinning || isLocked || spinsRemaining <= 0}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_30px_rgba(245,158,11,0.4)] ${
              isLocked || spinsRemaining <= 0
                ? 'bg-slate-800/80 border border-slate-700 text-slate-400 cursor-not-allowed'
                : isSpinning
                ? 'bg-amber-600 text-amber-100 cursor-wait'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black active:scale-98'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Spinning Golden Wheel... (8s)</span>
              </>
            ) : isLocked || spinsRemaining <= 0 ? (
              <>
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Locked for Today ({countdownText || '24h'})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-950" />
                <span>SPIN WHEEL OF FORTUNE ({spinsRemaining} Left)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
