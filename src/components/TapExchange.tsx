import React, { useState, useRef } from 'react';
import { Calendar, Key, Layers, ChevronRight, Zap, Flame } from 'lucide-react';
import { FloatingTapNumber } from '../types';
import { soundFx } from '../utils/audio';

interface TapExchangeProps {
  coins: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  critChance: number;
  streakDay: number;
  cipherSolvedToday: boolean;
  comboSolvedToday: boolean;
  isTurboActive: boolean;
  onTap: (x: number, y: number) => void;
  floatingNumbers: FloatingTapNumber[];
  onOpenDailyReward: () => void;
  onOpenDailyCipher: () => void;
  onOpenDailyCombo: () => void;
  onOpenBoost: () => void;
  mascotImg: string;
  goldCoinImg: string;
}

export const TapExchange: React.FC<TapExchangeProps> = ({
  coins,
  energy,
  maxEnergy,
  tapPower,
  critChance,
  streakDay,
  cipherSolvedToday,
  comboSolvedToday,
  isTurboActive,
  onTap,
  floatingNumbers,
  onOpenDailyReward,
  onOpenDailyCipher,
  onOpenDailyCombo,
  onOpenBoost,
  mascotImg,
  goldCoinImg,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isPressing, setIsPressing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (energy <= 0) return;

    setIsPressing(true);

    // Calculate click coordinates relative to screen for floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate 3D tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ x: rotateX, y: rotateY });

    onTap(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    setTilt({ x: 0, y: 0 });
  };

  const energyPercentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-130px)] px-4 pb-20 select-none">
      {/* Top 3 Quick Feature Cards */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 mt-1">
        {/* Daily reward */}
        <button
          id="btn-daily-reward"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyReward();
          }}
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-2xl p-2.5 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-slate-600 bg-emerald-500/80" />
          <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1.5 group-hover:scale-105 transition">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Daily reward</span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            {streakDay > 0 ? `Day ${streakDay}` : 'Claim'}
          </span>
        </button>

        {/* Daily cipher */}
        <button
          id="btn-daily-cipher"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyCipher();
          }}
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-2xl p-2.5 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div
            className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border ${
              cipherSolvedToday ? 'bg-emerald-400 border-emerald-300' : 'bg-transparent border-slate-600'
            }`}
          />
          <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1.5 group-hover:scale-105 transition">
            <Key className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Daily cipher</span>
          <div className="flex items-center gap-1 mt-0.5">
            <img
              src={goldCoinImg}
              alt=""
              referrerPolicy="no-referrer"
              className="w-3 h-3 rounded-full"
            />
            <span className="text-[10px] text-amber-400 font-bold">1,000,000</span>
          </div>
        </button>

        {/* Daily combo */}
        <button
          id="btn-daily-combo"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyCombo();
          }}
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-2xl p-2.5 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div
            className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border ${
              comboSolvedToday ? 'bg-emerald-400 border-emerald-300' : 'bg-transparent border-slate-600'
            }`}
          />
          <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1.5 group-hover:scale-105 transition">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Daily combo</span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            {comboSolvedToday ? 'Claimed ✓' : '5,000,000'}
          </span>
        </button>
      </div>

      {/* Main Balance Display */}
      <div className="flex flex-col items-center my-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={goldCoinImg}
              alt="Coin"
              referrerPolicy="no-referrer"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse"
            />
          </div>
          <span
            id="user-coin-balance"
            className="text-4xl md:text-5xl font-black tracking-tight text-white font-['Rajdhani',sans-serif]"
          >
            {coins.toLocaleString()}
          </span>
        </div>

        {isTurboActive && (
          <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-bounce">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>TURBO 5X TAP ACTIVE!</span>
          </div>
        )}
      </div>

      {/* Daily Cipher Decoder Banner */}
      <button
        id="btn-daily-cipher-banner"
        onClick={() => {
          soundFx.playClick();
          onOpenDailyCipher();
        }}
        className="w-full max-w-sm mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#171d2b] to-[#121620] border border-white/10 hover:border-purple-500/40 flex items-center justify-between transition shadow"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span className="text-sm font-semibold text-slate-200">Daily cipher</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-purple-400">
          <span>{cipherSolvedToday ? 'SOLVED ✓' : 'DECODE NOW'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Central Tap Character (Futuristic Hologram Circle) */}
      <div
        ref={containerRef}
        id="tap-mascot-container"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative my-auto flex items-center justify-center cursor-pointer touch-none select-none"
        style={{ perspective: 1000 }}
      >
        {/* Outer glowing sci-fi rings */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-xl opacity-75 animate-pulse pointer-events-none" />
        
        {/* Animated ring frame */}
        <div
          className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2.5 transition-transform duration-75 ease-out shadow-[0_0_40px_rgba(34,211,238,0.25)] border border-cyan-500/40 bg-gradient-to-b from-cyan-950/40 via-slate-900 to-black ${
            isPressing ? 'scale-[0.96]' : 'scale-100 hover:scale-[1.01]'
          }`}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
              isPressing ? 'scale(0.96)' : 'scale(1)'
            }`,
          }}
        >
          {/* Cybernetic Circular Ring Accent */}
          <div className="absolute inset-1 rounded-full border border-cyan-400/30 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />
          
          {/* Chameleon Mascot Image */}
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner">
            <img
              src={mascotImg}
              alt="EuTap Boss"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full pointer-events-none"
            />
            {/* Glossy lighting highlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/15 rounded-full pointer-events-none" />
          </div>
        </div>

        {/* Low energy overlay indicator */}
        {energy <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-xs">
            <div className="bg-[#151a24] border border-amber-400/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-amber-300 text-xs font-bold shadow-lg">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Energy Empty — Recharging!</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating +Tap Numbers */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {floatingNumbers.map((num) => (
          <div
            key={num.id}
            className={`absolute font-black tracking-tight text-xl transition-all duration-700 ease-out select-none ${
              num.isCrit
                ? 'text-cyan-300 text-2xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] font-["Rajdhani",sans-serif]'
                : 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
            }`}
            style={{
              left: `${num.x}px`,
              top: `${num.y - 40}px`,
              animation: 'floatUp 0.75s ease-out forwards',
            }}
          >
            {num.isCrit ? `CRIT +${num.amount}!` : `+${num.amount}`}
          </div>
        ))}
      </div>

      {/* Bottom Energy Bar & Boost Trigger */}
      <div className="w-full max-w-sm mt-3">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-1">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-white">{energy}</span>
            <span className="text-slate-500 font-semibold">/ {maxEnergy}</span>
          </div>

          <button
            id="btn-boost"
            onClick={() => {
              soundFx.playClick();
              onOpenBoost();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1 rounded-xl border border-amber-400/30 transition group"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition" />
            <span>Boost</span>
          </button>
        </div>

        {/* Energy stamina progress bar */}
        <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            style={{ width: `${energyPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
