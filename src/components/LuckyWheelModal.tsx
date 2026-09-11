import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Clock, Crown, Zap, RefreshCw } from 'lucide-react';
import {
  WHEEL_SEGMENTS,
  MAX_FREE_SPINS,
  SPIN_REFILL_DURATION_MS,
  pickWheelWinnerIndex,
  getSpinRefillCountdown,
  WheelSegment,
} from '../data/spinWheel';
import { soundFx } from '../utils/audio';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  spinCount: number;
  nextSpinRefillTime: number;
  onSpinUsed: (reward: number, updatedSpins: number, nextRefill: number) => void;
  goldCoinImg: string;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  spinCount,
  nextSpinRefillTime,
  onSpinUsed,
  goldCoinImg,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  const tickIntervalRef = useRef<number | null>(null);

  // Live countdown for the 3-hour refill timer
  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      if (nextSpinRefillTime > 0) {
        const remaining = Math.max(0, nextSpinRefillTime - Date.now());
        if (remaining <= 0 && spinCount < MAX_FREE_SPINS) {
          // Refill time reached!
          setCountdown('Ready to refill!');
        } else {
          setCountdown(getSpinRefillCountdown(nextSpinRefillTime));
        }
      } else {
        setCountdown('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, nextSpinRefillTime, spinCount]);

  if (!isOpen) return null;

  const handleStartSpin = () => {
    if (isSpinning || spinCount <= 0) return;

    soundFx.playClick();
    setIsSpinning(true);
    setWonSegment(null);
    setShowWinOverlay(false);

    // 1. Pick the winning segment using weighted probabilities
    const winIdx = pickWheelWinnerIndex();
    const winningSeg = WHEEL_SEGMENTS[winIdx];

    // 2. Calculate target rotation angle
    // Wheel has 8 segments (45° each).
    // Segment i occupies [i * 45, (i + 1) * 45] deg. Center is (i * 45 + 22.5) deg.
    // The top pointer needle is at 270 degrees (12 o'clock).
    // To position segment winIdx at 270 deg:
    // (rotation + segCenterAngle) % 360 = 270
    // => targetAngle = 270 - segCenterAngle
    const segCenterAngle = winIdx * 45 + 22.5;
    let targetOffset = (270 - segCenterAngle) % 360;
    if (targetOffset < 0) targetOffset += 360;

    // Add 6 to 8 full rotations (360 * 6 = 2160) for suspenseful spinning
    const currentBase = Math.floor(rotation / 360) * 360;
    // Add small randomized jitter between -12 and +12 degrees to keep it natural
    const jitter = (Math.random() - 0.5) * 16;
    const finalRotation = currentBase + 360 * 6 + targetOffset + jitter;

    setRotation(finalRotation);

    // Play ticking audio sound effects while wheel spins
    let tickCount = 0;
    const maxTicks = 24;
    tickIntervalRef.current = window.setInterval(() => {
      soundFx.playWheelTick();
      tickCount++;
      if (tickCount >= maxTicks) {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      }
    }, 160);

    // Spin animation duration is 4.5s
    setTimeout(() => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setWonSegment(winningSeg);
      setShowWinOverlay(true);

      if (winningSeg.isJackpot) {
        soundFx.playLevelUp();
      } else {
        soundFx.playReward();
      }

      // Calculate remaining spins & 3-hour cooldown
      const newSpinCount = Math.max(0, spinCount - 1);
      let newRefillTime = nextSpinRefillTime;
      if (newSpinCount < MAX_FREE_SPINS && (newRefillTime === 0 || newRefillTime <= Date.now())) {
        newRefillTime = Date.now() + SPIN_REFILL_DURATION_MS;
      }

      onSpinUsed(winningSeg.points, newSpinCount, newRefillTime);
    }, 4500);
  };

  const handleClaimWin = () => {
    soundFx.playClick();
    setShowWinOverlay(false);
    setWonSegment(null);
  };

  // SVG Geometry for 8 Segments
  const size = 280;
  const center = size / 2;
  const radius = center - 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121620] border border-amber-500/20 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col items-center relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          disabled={isSpinning}
          onClick={() => {
            if (!isSpinning) {
              soundFx.playClick();
              onClose();
            }
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition ${
            isSpinning ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Lucky Wheel of Fortune</span>
          </div>
          <h3 className="text-xl font-black text-white font-['Rajdhani',sans-serif] tracking-wide">
            Spin & Win Millions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Win between <strong className="text-amber-400">500,000</strong> and{' '}
            <strong className="text-amber-400">3,000,000</strong> points!
          </p>
        </div>

        {/* Free Spins Indicator & Timer */}
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-black/40 border border-white/5 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Free Spins:</span>
            <div className="flex items-center gap-1">
              {[...Array(MAX_FREE_SPINS)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i < spinCount
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] scale-105'
                      : 'bg-slate-700/50 border border-slate-600/30'
                  }`}
                />
              ))}
              <span className="text-amber-300 font-mono font-bold ml-1 text-xs">
                {spinCount}/{MAX_FREE_SPINS}
              </span>
            </div>
          </div>

          <div className="text-right">
            {spinCount < MAX_FREE_SPINS && countdown ? (
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Refill in {countdown}</span>
              </div>
            ) : (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                Spins Available
              </span>
            )}
          </div>
        </div>

        {/* Wheel Container with Pointer */}
        <div className="relative my-2 flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-transparent blur-md -z-10" />

          {/* Top Pointer Indicator Needle */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md -mt-4 border border-amber-500" />
          </div>

          {/* Rotating Wheel SVG */}
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)'
                : 'none',
            }}
            className="rounded-full shadow-[0_0_24px_rgba(0,0,0,0.8)] select-none"
          >
            {/* Outer metallic rim */}
            <circle
              cx={center}
              cy={center}
              r={radius + 4}
              fill="#181e2b"
              stroke="#d97706"
              strokeWidth="5"
            />

            {/* 8 Segments */}
            {WHEEL_SEGMENTS.map((seg, idx) => {
              const startAngle = idx * 45;
              const endAngle = (idx + 1) * 45;
              const midAngle = startAngle + 22.5;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const midRad = (midAngle * Math.PI) / 180;

              const x1 = center + radius * Math.cos(startRad);
              const y1 = center + radius * Math.sin(startRad);
              const x2 = center + radius * Math.cos(endRad);
              const y2 = center + radius * Math.sin(endRad);

              // Text position along the middle radial spoke
              const textRadius = radius * 0.68;
              const tx = center + textRadius * Math.cos(midRad);
              const ty = center + textRadius * Math.sin(midRad);

              const pathD = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

              return (
                <g key={seg.id}>
                  {/* Segment slice */}
                  <path
                    d={pathD}
                    fill={seg.color}
                    stroke={seg.strokeColor}
                    strokeWidth="1.5"
                  />

                  {/* Segment Label Text */}
                  <text
                    x={tx}
                    y={ty}
                    fill={seg.textColor}
                    fontSize={seg.isJackpot ? '13' : '12'}
                    fontWeight="800"
                    fontFamily="Rajdhani, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                    style={{
                      filter: seg.isJackpot
                        ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))'
                        : undefined,
                    }}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}

            {/* Segment border lights / pins */}
            {WHEEL_SEGMENTS.map((_, idx) => {
              const pinAngle = idx * 45;
              const pinRad = (pinAngle * Math.PI) / 180;
              const px = center + (radius - 2) * Math.cos(pinRad);
              const py = center + (radius - 2) * Math.sin(pinRad);
              return (
                <circle
                  key={idx}
                  cx={px}
                  cy={py}
                  r="2.5"
                  fill="#fef08a"
                  stroke="#ca8a04"
                  strokeWidth="1"
                />
              );
            })}

            {/* Inner Center Hub */}
            <circle
              cx={center}
              cy={center}
              r="26"
              fill="#0f172a"
              stroke="#fbbf24"
              strokeWidth="3"
            />
            <circle cx={center} cy={center} r="20" fill="#1e293b" />
          </svg>

          {/* Static Center Button (Overlay in middle of the wheel) */}
          <button
            id="btn-wheel-center-spin"
            disabled={isSpinning || spinCount <= 0}
            onClick={handleStartSpin}
            className={`absolute z-20 w-14 h-14 rounded-full flex flex-col items-center justify-center transition shadow-lg ${
              isSpinning
                ? 'bg-amber-600 text-black cursor-wait opacity-90'
                : spinCount > 0
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(251,191,36,0.6)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
            }`}
          >
            {isSpinning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-[11px] font-black tracking-wider leading-none">SPIN</span>
                <span className="text-[8px] font-bold opacity-80 mt-0.5">
                  {spinCount > 0 ? `${spinCount} left` : 'Empty'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Action Button Below Wheel */}
        <div className="w-full mt-3">
          <button
            id="btn-trigger-spin"
            disabled={isSpinning || spinCount <= 0}
            onClick={handleStartSpin}
            className={`w-full py-3 rounded-2xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : spinCount > 0
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black hover:from-amber-400 hover:to-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.4)] active:scale-[0.98]'
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-300" />
                <span>Spinning the Wheel...</span>
              </>
            ) : spinCount > 0 ? (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>SPIN WHEEL ({spinCount} FREE SPINS)</span>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>5 Free Spins Refill in: {countdown || '3 Hours'}</span>
              </div>
            )}
          </button>
        </div>

        {/* 8 Chart segments legend */}
        <div className="w-full mt-3 pt-2.5 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium">
            <span>8 Chart Wheel Prizes:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Jackpot: 3,000,000
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
            {WHEEL_SEGMENTS.map((seg) => (
              <div
                key={seg.id}
                className={`py-1 rounded-lg border ${
                  seg.isJackpot
                    ? 'bg-red-950/40 border-amber-500/50 text-amber-300 font-black'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                {seg.label}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2 leading-tight">
            5 free spins every 3 hours. Minimum guaranteed winning is 500,000 points.
          </p>
        </div>

        {/* Winning Prize Modal Celebration Overlay */}
        {showWinOverlay && wonSegment && (
          <div className="absolute inset-0 z-40 bg-black/90 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_24px_rgba(251,191,36,0.5)]">
              {wonSegment.isJackpot ? (
                <Crown className="w-9 h-9 text-amber-300 animate-bounce" />
              ) : (
                <Sparkles className="w-9 h-9 text-amber-400" />
              )}
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              {wonSegment.isJackpot ? '★ MEGA GRAND JACKPOT ★' : 'LUCKY SPIN WINNER!'}
            </span>

            <h2 className="text-2xl font-black text-white font-['Rajdhani',sans-serif] mt-1">
              +{wonSegment.points.toLocaleString()} POINTS
            </h2>

            <div className="flex items-center gap-2 my-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
              <span className="text-xs font-bold text-amber-300 font-['Rajdhani',sans-serif]">
                Added to your balance
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 mb-5 max-w-[240px]">
              {wonSegment.isJackpot
                ? 'Unbelievable! You hit the rarest 3,000,000 point grand jackpot!'
                : `Awesome spin! You earned ${wonSegment.points.toLocaleString()} points from the lucky wheel.`}
            </p>

            <button
              id="btn-claim-spin-win"
              onClick={handleClaimWin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:brightness-110 active:scale-95 transition"
            >
              CLAIM & CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
