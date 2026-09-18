import React, { useState, useEffect } from 'react';
import { X, Sparkles, Egg, Clock, Coins, Gem, Key, Award } from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface HatchReward {
  type: 'usd' | 'diamond' | 'keys' | 'coins';
  value: number;
  label: string;
}

interface EggItem {
  id: number;
  status: 'ready' | 'cracking' | 'hatched';
  reward: HatchReward;
}

// Generate the 5 egg rewards strictly following rules:
// - Max 1 diamond per egg
// - Max $1 per egg
// - Max 1 key per egg
// - Max 5,000 points per egg
// - Can diamond all through the 5 (1x5)
const generateClutchRewards = (): HatchReward[] => {
  // 8% chance of lucky "All 5 Diamond Clutch" (1x5)
  const isAllDiamonds = Math.random() < 0.08;
  if (isAllDiamonds) {
    return Array.from({ length: 5 }, () => ({
      type: 'diamond',
      value: 1,
      label: '1 💎 Diamond',
    }));
  }

  return Array.from({ length: 5 }, () => {
    const r = Math.random();
    if (r < 0.22) {
      // 1 Diamond (max 1)
      return { type: 'diamond', value: 1, label: '1 💎 Diamond' };
    } else if (r < 0.50) {
      // Dollar (max $1.00)
      const usdOptions = [0.25, 0.50, 0.75, 1.00];
      const val = usdOptions[Math.floor(Math.random() * usdOptions.length)];
      return { type: 'usd', value: val, label: `$${val.toFixed(2)} USD` };
    } else if (r < 0.72) {
      // 1 Key (max 1)
      return { type: 'keys', value: 1, label: '1 🗝️ Key' };
    } else {
      // Points (max 5,000 points)
      const ptOptions = [1000, 2000, 3000, 4000, 5000];
      const pts = ptOptions[Math.floor(Math.random() * ptOptions.length)];
      return { type: 'coins', value: pts, label: `+${pts.toLocaleString()} Points` };
    }
  });
};

interface LayHatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  eggsAvailable: number;
  nextRefillTime: number;
  onEggsHatched: (rewards: HatchReward[], updatedEggs: number, nextRefillTime: number) => void;
  reserveBalance: number;
  diamonds: number;
  keys: number;
  coins: number;
}

export const LayHatchModal: React.FC<LayHatchModalProps> = ({
  isOpen,
  onClose,
  eggsAvailable,
  nextRefillTime,
  onEggsHatched,
  reserveBalance,
  diamonds,
  keys,
  coins,
}) => {
  const [eggs, setEggs] = useState<EggItem[]>([]);
  const [isHatchingActive, setIsHatchingActive] = useState(false);
  const [henAction, setHenAction] = useState<'pecking' | 'happy' | 'flapping'>('pecking');
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Initialize eggs on mount or reset
  useEffect(() => {
    if (isOpen) {
      const rewards = generateClutchRewards();
      // If eggsAvailable is 0, all 5 already hatched
      const items: EggItem[] = rewards.map((rew, idx) => ({
        id: idx + 1,
        status: idx < 5 - eggsAvailable ? 'hatched' : 'ready',
        reward: rew,
      }));
      setEggs(items);
    }
  }, [isOpen, eggsAvailable]);

  // Hen pecking & eating animation loop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setHenAction((prev) => (prev === 'pecking' ? 'eating' : 'pecking') as any);
    }, 2800);
    return () => clearInterval(interval);
  }, [isOpen]);

  // 7-Hour Refill Countdown Timer
  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      if (nextRefillTime <= 0 || eggsAvailable > 0) {
        setTimeLeftStr('');
        return;
      }
      const diff = Math.max(0, nextRefillTime - Date.now());
      if (diff <= 0) {
        setTimeLeftStr('00:00:00 (Refilling...)');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(
          `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isOpen, nextRefillTime, eggsAvailable]);

  if (!isOpen) return null;

  // Hatch single egg
  const handleHatchEgg = (eggId: number) => {
    if (isHatchingActive) return;
    const target = eggs.find((e) => e.id === eggId);
    if (!target || target.status !== 'ready') return;

    setIsHatchingActive(true);
    soundFx.playEggCrack();
    soundFx.triggerHaptic();
    setHenAction('flapping');

    // Step 1: Cracking
    setEggs((prev) =>
      prev.map((e) => (e.id === eggId ? { ...e, status: 'cracking' } : e))
    );

    // Step 2: Hatched
    setTimeout(() => {
      soundFx.playReward();
      soundFx.playCluck();
      setHenAction('happy');

      setEggs((prev) =>
        prev.map((e) => (e.id === eggId ? { ...e, status: 'hatched' } : e))
      );

      const newEggsAvailable = Math.max(0, eggsAvailable - 1);
      const newNextRefill =
        newEggsAvailable === 0
          ? Date.now() + 7 * 60 * 60 * 1000 // 7 hours
          : nextRefillTime;

      onEggsHatched([target.reward], newEggsAvailable, newNextRefill);

      setActiveToast(`Hatched: ${target.reward.label}!`);
      setTimeout(() => setActiveToast(null), 2500);

      setIsHatchingActive(false);
      setTimeout(() => setHenAction('pecking'), 1500);
    }, 700);
  };

  // Hatch all remaining ready eggs
  const handleHatchAll = () => {
    if (isHatchingActive) return;
    const readyEggs = eggs.filter((e) => e.status === 'ready');
    if (readyEggs.length === 0) return;

    setIsHatchingActive(true);
    soundFx.playEggCrack();
    soundFx.triggerHaptic();
    setHenAction('flapping');

    setEggs((prev) =>
      prev.map((e) => (e.status === 'ready' ? { ...e, status: 'cracking' } : e))
    );

    setTimeout(() => {
      soundFx.playReward();
      soundFx.playCluck();
      setHenAction('happy');

      setEggs((prev) =>
        prev.map((e) => (e.status === 'cracking' ? { ...e, status: 'hatched' } : e))
      );

      const rewards = readyEggs.map((e) => e.reward);
      const newEggsAvailable = 0;
      const newNextRefill = Date.now() + 7 * 60 * 60 * 1000; // 7 hours lock

      onEggsHatched(rewards, newEggsAvailable, newNextRefill);

      setActiveToast(`All ${readyEggs.length} Eggs Hatched!`);
      setTimeout(() => setActiveToast(null), 3000);

      setIsHatchingActive(false);
      setTimeout(() => setHenAction('pecking'), 1500);
    }, 850);
  };

  const readyCount = eggs.filter((e) => e.status === 'ready').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[850px] rounded-3xl bg-gradient-to-b from-[#1c1205] via-[#120a02] to-[#080401] border-2 border-amber-500/60 shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col items-center justify-between">
        {/* Top Header & Live Balances */}
        <div className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-950/70 via-stone-900/80 to-black border-b border-amber-500/30 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              <Egg className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-amber-200 tracking-wider font-['Rajdhani',sans-serif]">
                  LAY & HATCH
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-[9px] font-extrabold text-amber-300 border border-amber-400/40">
                  FARM
                </span>
              </div>
              <p className="text-[11px] text-amber-400/70">Big White Hen • 5 Eggs / 7hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/50 border border-amber-500/30 text-xs text-amber-200 font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>${reserveBalance.toFixed(2)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-950/50 border border-sky-500/30 text-xs text-sky-200 font-bold">
              <Gem className="w-3.5 h-3.5 text-sky-400" />
              <span>{diamonds}</span>
            </div>

            <button
              onClick={() => {
                if (isHatchingActive) return;
                soundFx.playClick();
                onClose();
              }}
              disabled={isHatchingActive}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {activeToast && (
          <div className="absolute top-16 z-30 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600/95 to-yellow-600/95 border border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] text-center animate-in slide-in-from-top-4 duration-200">
            <div className="text-sm font-black text-black font-['Rajdhani',sans-serif] flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-white animate-spin" />
              <span>{activeToast}</span>
            </div>
          </div>
        )}

        {/* Farm Pasture & Big White Hen Arena */}
        <div className="relative w-full flex-1 overflow-hidden flex flex-col items-center justify-between py-2">
          {/* Sunny Sky & Pasture Backdrop */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-950/40 via-amber-900/10 to-transparent pointer-events-none" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none" />

          {/* Wooden Ranch Rail Fence */}
          <div className="w-full px-6 flex justify-between items-center opacity-40 select-none">
            <div className="w-full h-1.5 bg-amber-900/70 border-t border-b border-amber-700/60 rounded relative">
              <div className="absolute -top-3 left-8 w-2 h-7 bg-amber-900 rounded" />
              <div className="absolute -top-3 left-1/3 w-2 h-7 bg-amber-900 rounded" />
              <div className="absolute -top-3 right-1/3 w-2 h-7 bg-amber-900 rounded" />
              <div className="absolute -top-3 right-8 w-2 h-7 bg-amber-900 rounded" />
            </div>
          </div>

          {/* Big White Rooster / Hen SVG Creature */}
          <div
            onClick={() => {
              soundFx.playCluck();
              setHenAction('flapping');
              setTimeout(() => setHenAction('pecking'), 1000);
            }}
            className="relative w-56 h-48 cursor-pointer group flex items-center justify-center my-auto transition-transform active:scale-95"
            title="Tap the Big White Hen to hear her cluck!"
          >
            <svg
              className={`w-full h-full transition-all duration-300 ${
                henAction === 'flapping'
                  ? 'animate-[henFlap_0.4s_ease-in-out_infinite]'
                  : henAction === 'pecking'
                  ? 'animate-[henPeck_1.4s_ease-in-out_infinite]'
                  : 'animate-[henDuck_1.8s_ease-in-out_infinite]'
              }`}
              viewBox="0 0 240 210"
            >
              <defs>
                {/* Feathers Radial Gradient */}
                <radialGradient id="featherGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#f4f4f5" />
                  <stop offset="100%" stopColor="#d4d4d8" />
                </radialGradient>
                {/* Wing Gradient */}
                <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e4e4e7" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>

              {/* Rooster Tail Feathers */}
              <path
                d="M 60 110 C 20 70, 10 30, 45 35 C 20 55, 30 100, 70 120 Z"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <path
                d="M 50 115 C 5 95, -5 60, 30 55 C 10 80, 25 110, 60 125 Z"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1"
              />

              {/* Legs and Golden Claws */}
              <path d="M 105 160 L 100 195 L 90 200 M 100 195 L 102 201 M 100 195 L 110 200" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <path d="M 135 160 L 140 195 L 130 200 M 140 195 L 142 201 M 140 195 L 150 200" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

              {/* Plump White Hen Body */}
              <ellipse cx="120" cy="125" rx="58" ry="44" fill="url(#featherGrad)" stroke="#cbd5e1" strokeWidth="2" />

              {/* Flapping Wing */}
              <path
                d="M 95 110 C 110 90, 150 95, 155 125 C 150 145, 120 150, 95 135 C 90 125, 90 115, 95 110 Z"
                fill="url(#wingGrad)"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                className={henAction === 'flapping' ? 'origin-[110px_100px] animate-[wingFlutter_0.3s_infinite]' : ''}
              />

              {/* Neck & Head */}
              <path
                d="M 155 110 C 165 95, 175 75, 180 50 C 190 55, 195 70, 185 95 C 175 115, 165 125, 155 130 Z"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
              <circle cx="182" cy="52" r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Big Red Comb on Head */}
              <path
                d="M 172 40 C 170 20, 180 20, 183 36 C 185 18, 195 20, 195 38 C 198 25, 204 30, 200 44 Z"
                fill="#ef4444"
                stroke="#b91c1c"
                strokeWidth="1"
              />

              {/* Red Wattle below beak */}
              <path
                d="M 194 65 C 200 70, 198 84, 190 82 C 186 78, 188 68, 194 65 Z"
                fill="#ef4444"
                stroke="#b91c1c"
                strokeWidth="1"
              />

              {/* Bright Yellow Beak */}
              <path d="M 194 48 L 214 55 L 194 62 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

              {/* Eye with pupil */}
              <circle cx="186" cy="48" r="3.5" fill="#000000" />
              <circle cx="187.5" cy="46.5" r="1" fill="#ffffff" />
            </svg>

            {/* Scattered Golden Corn Seeds around the Hen */}
            <div className="absolute -bottom-1 left-4 w-2 h-1 rounded-full bg-amber-400 rotate-12 shadow-sm" />
            <div className="absolute -bottom-2 left-12 w-2 h-1 rounded-full bg-yellow-400 -rotate-45 shadow-sm" />
            <div className="absolute -bottom-1 right-8 w-2 h-1.5 rounded-full bg-amber-400 rotate-45 shadow-sm" />
            <div className="absolute -bottom-2 right-14 w-2 h-1 rounded-full bg-yellow-400 rotate-12 shadow-sm" />
          </div>

          {/* Rustic Straw Nest with the 5 Eggs */}
          <div className="relative w-full max-w-sm px-3 flex flex-col items-center">
            {/* Nest Bed of Straw */}
            <div className="relative w-full py-4 px-2 rounded-3xl bg-gradient-to-t from-[#2a1705] via-[#45270c] to-[#603813] border-2 border-amber-600/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              {/* Straw Frills */}
              <div className="absolute -top-2 inset-x-4 flex justify-around text-amber-500/60 text-xs pointer-events-none">
                <span>🌾</span>
                <span>🍂</span>
                <span>🌾</span>
                <span>🍂</span>
                <span>🌾</span>
              </div>

              {/* 5 Eggs Layout */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {eggs.map((egg) => {
                  const isReady = egg.status === 'ready';
                  const isCracking = egg.status === 'cracking';
                  const isHatched = egg.status === 'hatched';

                  return (
                    <div
                      key={egg.id}
                      onClick={() => isReady && handleHatchEgg(egg.id)}
                      className={`relative flex flex-col items-center justify-center p-1 rounded-2xl transition-all ${
                        isReady
                          ? 'cursor-pointer hover:scale-105 active:scale-95'
                          : ''
                      }`}
                    >
                      {/* The Egg Visual / Reward */}
                      <div className="relative w-12 h-16 sm:w-14 sm:h-18 flex items-center justify-center">
                        {!isHatched ? (
                          /* Intact or Cracking Egg */
                          <div
                            className={`w-10 h-14 sm:w-12 sm:h-16 rounded-[50%_50%_45%_45%] bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-amber-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform ${
                              isCracking
                                ? 'animate-[eggCrackWiggle_0.15s_infinite]'
                                : 'hover:rotate-6'
                            }`}
                          >
                            {isCracking ? (
                              <div className="text-amber-700 font-bold text-xs">⚡</div>
                            ) : (
                              <div className="text-[10px] font-black text-amber-800/60">
                                #{egg.id}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Hatched Shell & Revealed Treasure */
                          <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
                            {/* Empty shell bottoms */}
                            <div className="w-10 h-6 rounded-b-full bg-amber-200/90 border border-amber-400/60 flex items-center justify-center shadow-inner">
                              {egg.reward.type === 'diamond' && (
                                <Gem className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                              )}
                              {egg.reward.type === 'usd' && (
                                <span className="font-black text-xs text-emerald-600">💵</span>
                              )}
                              {egg.reward.type === 'keys' && (
                                <Key className="w-4 h-4 text-yellow-600" />
                              )}
                              {egg.reward.type === 'coins' && (
                                <Coins className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reward or Status Tag below Egg */}
                      <div className="mt-1 text-center">
                        {isHatched ? (
                          <div className="px-1 py-0.5 rounded bg-amber-400 text-black text-[9px] sm:text-[10px] font-black border border-white whitespace-nowrap shadow-sm">
                            {egg.reward.label}
                          </div>
                        ) : (
                          <div className="text-[9px] font-bold text-amber-300/80">
                            {isCracking ? 'Cracking!' : 'Tap Egg'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Countdown timer when all 5 are hatched */}
            {readyCount === 0 && (
              <div className="w-full mt-3 p-3 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-between shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <div>
                    <div className="text-xs font-bold text-amber-200">
                      Hen is incubating 5 fresh eggs
                    </div>
                    <div className="text-[10px] text-amber-400/70">7-Hour Refill Cycle</div>
                  </div>
                </div>
                <div className="font-mono font-black text-sm text-amber-300 bg-black/40 px-2 py-1 rounded-lg border border-amber-500/30">
                  {timeLeftStr || '07:00:00'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Interactive Toolbar */}
        <div className="w-full px-4 py-3 bg-gradient-to-t from-black via-[#0d0701] to-[#170c02] border-t border-amber-500/40 z-30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold px-1">
            <span>EGGS IN NEST: {readyCount}/5</span>
            <span>Diamonds, $, Keys & Points!</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Button 1: Hatch Single Egg */}
            <button
              id="btn-layhatch-single"
              onClick={() => {
                const firstReady = eggs.find((e) => e.status === 'ready');
                if (firstReady) handleHatchEgg(firstReady.id);
              }}
              disabled={isHatchingActive || readyCount === 0}
              className="py-3 px-3 rounded-2xl bg-gradient-to-b from-[#3a2007] to-[#241303] hover:from-[#4d2b0b] hover:to-[#2e1905] border-2 border-amber-500/50 hover:border-amber-400 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40 text-amber-200 font-['Rajdhani',sans-serif] font-black text-sm shadow-md"
            >
              <Egg className="w-4 h-4 text-amber-400" />
              <span>HATCH EGG</span>
            </button>

            {/* Button 2: Hatch All Ready Eggs */}
            <button
              id="btn-layhatch-all"
              onClick={handleHatchAll}
              disabled={isHatchingActive || readyCount === 0}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 border-2 border-yellow-200 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40 text-black font-['Rajdhani',sans-serif] font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>HATCH ALL ({readyCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS Keyframes for Hen & Egg animations */}
      <style>{`
        @keyframes henPeck {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(12px) rotate(8deg); }
        }
        @keyframes henDuck {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(0.95, 0.9) translateY(14px); }
        }
        @keyframes henFlap {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.06); }
        }
        @keyframes wingFlutter {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes eggCrackWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-6deg) scale(1.05); }
          75% { transform: rotate(6deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
};
