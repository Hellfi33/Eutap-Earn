import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Key, DollarSign, Gem, Coins, RotateCw, AlertCircle, Trophy, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface DiceOutcome {
  face: number;
  label: string;
  type: 'keys' | 'usd' | 'coins' | 'diamonds';
  value: number;
  isRare?: boolean;
}

// 1 is 2 keys, 2 is $2, 3 is $10, 4 is 1million points, 5 is 1000 diamonds, 6 is $100
export const DICE_CONFIG: Record<number, DiceOutcome> = {
  1: { face: 1, label: '2 Keys', type: 'keys', value: 2 },
  2: { face: 2, label: '$2 Cash', type: 'usd', value: 2 },
  3: { face: 3, label: '$10 Cash', type: 'usd', value: 10, isRare: true },
  4: { face: 4, label: '1,000,000 Pts', type: 'coins', value: 1000000 },
  5: { face: 5, label: '1,000 Diamonds', type: 'diamonds', value: 1000 },
  6: { face: 6, label: '$100 Cash', type: 'usd', value: 100 },
};

// Winning logic strictly adhering to rules:
// - Never win: 6 ($100), 5 (1000 diamonds) -> 0% chance
// - Rare (hard and tough) win: 3 ($10) -> ~2.5% chance
// - Remaining: 1 (2 keys ~45%), 2 ($2 ~35%), 4 (1M points ~17.5%)
const getRollLandingFace = (): number => {
  const rand = Math.random();
  if (rand < 0.025) {
    // 2.5% rare hard & tough win
    return 3;
  } else if (rand < 0.475) {
    // 45% chance for 2 keys (face 1)
    return 1;
  } else if (rand < 0.825) {
    // 35% chance for $2 (face 2)
    return 2;
  } else {
    // 17.5% chance for 1,000,000 points (face 4)
    return 4;
  }
};

interface DiceGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWinReward: (rewards: DiceOutcome[]) => void;
  coins: number;
  reserveBalance: number;
  keys: number;
  diamonds: number;
  goldCoinImg: string;
}

// Renders an authentic Ludo Die face with rounded cube & genuine Ludo pips
const LudoDie: React.FC<{
  face: number;
  isRolling: boolean;
  dieNumber: number;
  onTap?: () => void;
}> = ({ face, isRolling, dieNumber, onTap }) => {
  const renderPips = (n: number) => {
    switch (n) {
      case 1:
        // Red center pip (classic Ludo signature)
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_8px_rgba(239,68,68,0.5)]" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-2 sm:p-2.5">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] self-start justify-self-start" />
            <span />
            <span />
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] self-end justify-self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 sm:p-2">
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-1 row-start-1" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-2 row-start-2 justify-self-center self-center" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-3 row-start-3 justify-self-end self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-2 sm:p-2.5">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] self-start justify-self-start" />
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] self-start justify-self-end" />
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] self-end justify-self-start" />
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] self-end justify-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 sm:p-2">
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-1 row-start-1" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-3 row-start-1 justify-self-end" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-2 row-start-2 justify-self-center self-center" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-1 row-start-3 self-end" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] col-start-3 row-start-3 justify-self-end self-end" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 sm:p-2">
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] justify-self-start self-start" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] justify-self-end self-start" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] justify-self-start self-center" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] justify-self-end self-center" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] justify-self-start self-end" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] justify-self-end self-end" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={onTap}
      className={`group relative flex flex-col items-center select-none cursor-pointer transition-transform duration-100 ${
        isRolling ? 'pointer-events-none' : 'hover:scale-105 active:scale-95'
      }`}
    >
      {/* Speed-of-light photon streaks & energy ring */}
      {isRolling && (
        <>
          <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/70 animate-ping pointer-events-none" />
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-red-500/50 via-amber-400/50 to-cyan-400/50 blur-md animate-pulse pointer-events-none" />
        </>
      )}

      {/* 3D Ludo Die Cube Face with Speed-of-Light Spin (0.055s - 0.06s) */}
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-slate-100 to-slate-200 border-2 border-slate-300 flex items-center justify-center relative transition-all ${
          isRolling
            ? dieNumber === 1
              ? 'animate-[spin_0.06s_linear_infinite] shadow-[0_0_35px_rgba(239,68,68,0.9),0_0_60px_rgba(255,255,255,0.9)] brightness-115 scale-105'
              : 'animate-[spin_0.055s_linear_infinite_reverse] shadow-[0_0_35px_rgba(59,130,246,0.9),0_0_60px_rgba(255,255,255,0.9)] brightness-115 scale-105'
            : 'shadow-[0_14px_30px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Soft specular highlight reflection */}
        <div className="absolute top-1.5 left-2 right-2 h-4 rounded-t-xl bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />

        {/* Die Face Pips */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          {renderPips(face)}
        </div>
      </div>

      {/* Die Contact Shadow */}
      <div
        className={`mt-2 w-16 sm:w-20 h-2.5 rounded-full bg-black/80 blur-xs transition-all duration-300 ${
          isRolling ? 'scale-110 opacity-70 blur-sm' : 'scale-100 opacity-90'
        }`}
      />

      <span className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
        Die #{dieNumber}
      </span>
    </div>
  );
};

export const DiceGameModal: React.FC<DiceGameModalProps> = ({
  isOpen,
  onClose,
  onWinReward,
  coins,
  reserveBalance,
  keys,
  diamonds,
  goldCoinImg,
}) => {
  const [die1Face, setDie1Face] = useState<number>(1);
  const [die2Face, setDie2Face] = useState<number>(2);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(8.0);
  const [lastWinSummary, setLastWinSummary] = useState<{
    die1: DiceOutcome;
    die2: DiceOutcome;
  } | null>(null);
  const [showRulesInfo, setShowRulesInfo] = useState<boolean>(false);

  const rollTimerRef = useRef<number | null>(null);
  const flickerIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const soundIntervalRef = useRef<number | null>(null);

  // Clean up all intervals/timers on unmount
  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
      if (flickerIntervalRef.current) clearInterval(flickerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Handle dice spin initiation (spins for 8 seconds at speed of light)
  const handleRollDice = () => {
    if (isRolling) return;

    soundFx.playTap(true);
    soundFx.triggerHaptic();
    setIsRolling(true);
    setLastWinSummary(null);
    setSecondsRemaining(8.0);

    const startTime = Date.now();
    const DURATION_MS = 8000;

    // Ultra-rapid face tumbling at light speed (every 24ms)
    flickerIntervalRef.current = window.setInterval(() => {
      setDie1Face(Math.floor(Math.random() * 6) + 1);
      setDie2Face(Math.floor(Math.random() * 6) + 1);
    }, 24);

    // High-speed audio cadence for light-speed roll
    soundIntervalRef.current = window.setInterval(() => {
      soundFx.playDiceTumble();
    }, 95);

    // High precision countdown update
    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, (DURATION_MS - elapsed) / 1000);
      setSecondsRemaining(Math.round(left * 10) / 10);
    }, 50);

    // 8 seconds spin completion
    rollTimerRef.current = window.setTimeout(() => {
      // Clear timers
      if (flickerIntervalRef.current) clearInterval(flickerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);

      // Determine outcomes according to strict user rules
      const finalFace1 = getRollLandingFace();
      const finalFace2 = getRollLandingFace();

      setDie1Face(finalFace1);
      setDie2Face(finalFace2);
      setIsRolling(false);
      setSecondsRemaining(0);

      const reward1 = DICE_CONFIG[finalFace1];
      const reward2 = DICE_CONFIG[finalFace2];

      soundFx.playDiceLand();
      soundFx.playReward();
      soundFx.triggerHaptic();

      // Automatically award to user
      onWinReward([reward1, reward2]);

      setLastWinSummary({
        die1: reward1,
        die2: reward2,
      });
    }, DURATION_MS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="dice-game-modal"
        className="relative w-full max-w-md bg-black border border-white/15 rounded-3xl p-4 sm:p-5 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b from-red-600/15 via-amber-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600/30 to-amber-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <span className="text-base font-black">🎲</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-['Rajdhani',sans-serif]">
                  LUDO DICE ARENA
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-red-600/30 text-[9px] font-black text-red-300 border border-red-500/40">
                  LVL 15+
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Tap dice to spin for 8 seconds (Light Speed)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowRulesInfo((prev) => !prev);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Dice Rules & Paytable"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (isRolling) return;
                soundFx.playClick();
                onClose();
              }}
              disabled={isRolling}
              className={`p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition ${
                isRolling ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live User Balances Strip */}
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-center z-10 mb-3">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Coins</span>
            <div className="flex items-center gap-1 mt-0.5">
              <img src={goldCoinImg} alt="" className="w-3 h-3 rounded-full" />
              <span className="text-xs font-bold text-amber-400 font-mono">
                {coins > 1000000 ? `${(coins / 1000000).toFixed(1)}M` : coins.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">$ Reserve</span>
            <div className="flex items-center gap-0.5 mt-0.5 text-emerald-400">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs font-bold font-mono">${reserveBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Keys</span>
            <div className="flex items-center gap-1 mt-0.5 text-amber-300">
              <Key className="w-3 h-3" />
              <span className="text-xs font-bold font-mono">{keys}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Diamonds</span>
            <div className="flex items-center gap-1 mt-0.5 text-cyan-300">
              <Gem className="w-3 h-3" />
              <span className="text-xs font-bold font-mono">{diamonds}</span>
            </div>
          </div>
        </div>

        {/* Rules & Paytable Expandable Drawer */}
        {showRulesInfo && (
          <div className="mb-3 p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs z-20 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Dice Rules & Rewards
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">8s Light Speed</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-mono">⚀ Face 1</span>
                <span className="text-amber-400 font-bold">2 Keys</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-mono">⚁ Face 2</span>
                <span className="text-emerald-400 font-bold">$2 Cash</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-amber-300 font-mono">⚂ Face 3</span>
                <span className="text-amber-400 font-bold">$10 (Rare ★)</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-mono">⚃ Face 4</span>
                <span className="text-amber-300 font-bold">1,000,000 Pts</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60">
                <span className="text-slate-400 font-mono">⚄ Face 5</span>
                <span className="text-cyan-400 font-bold">1,000 💎</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60">
                <span className="text-slate-400 font-mono">⚅ Face 6</span>
                <span className="text-emerald-400 font-bold">$100 Cash</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
              ★ <span className="text-amber-300 font-semibold">$10</span> is the rare win. Every win is automatically added to your balance.
            </p>
          </div>
        )}

        {/* Dice Arena Center (Pitch Black Background with 2 Ludo Dice) */}
        <div className="relative my-2 py-6 px-4 rounded-3xl bg-[#030304] border border-white/10 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          {/* Subtle Felt Arena Ring & Light Speed Warping Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />
          {isRolling && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,rgba(239,68,68,0.1)_50%,transparent_80%)] animate-pulse pointer-events-none" />
          )}

          {/* 8s Timer Status or Prompt */}
          <div className="mb-4 z-10 flex flex-col items-center">
            {isRolling ? (
              <div className="flex flex-col items-center gap-1">
                <div className="px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/50 flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                  <span className="text-xs font-black text-white tracking-wider font-mono">
                    ⚡ LIGHT SPEED: {secondsRemaining.toFixed(1)}s
                  </span>
                </div>
                <span className="text-[10px] text-cyan-300 font-semibold tracking-wide animate-pulse">
                  Spinning at the speed of light...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Tap either die to roll for 8 seconds</span>
              </div>
            )}
          </div>

          {/* The 2 Ludo Dice */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 z-10 my-2">
            <LudoDie
              face={die1Face}
              isRolling={isRolling}
              dieNumber={1}
              onTap={handleRollDice}
            />
            <LudoDie
              face={die2Face}
              isRolling={isRolling}
              dieNumber={2}
              onTap={handleRollDice}
            />
          </div>

          {/* Live Progress Bar for the 8-second spin */}
          {isRolling && (
            <div className="w-48 sm:w-56 h-1.5 rounded-full bg-white/10 mt-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500 transition-all duration-75 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{ width: `${((8.0 - secondsRemaining) / 8.0) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Win Reward Summary Card (when not rolling & after roll) */}
        {lastWinSummary && !isRolling && (
          <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/40 to-slate-950 border border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.2)] animate-in zoom-in-95 duration-200 z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-black text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ROLL COMPLETE • AUTO-ADDED TO YOU!
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                CREDITED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono">Die #1:</span>
                <span className="text-xs font-black text-amber-400">
                  {lastWinSummary.die1.label}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono">Die #2:</span>
                <span className="text-xs font-black text-amber-400">
                  {lastWinSummary.die2.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Roll / Rolling Status */}
        <div className="mt-2 z-10">
          <button
            id="btn-roll-dice"
            onClick={handleRollDice}
            disabled={isRolling}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              isRolling
                ? 'bg-slate-900 border border-white/10 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-98 cursor-pointer'
            }`}
          >
            {isRolling ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>SPINNING AT LIGHT SPEED... ({secondsRemaining.toFixed(1)}s)</span>
              </>
            ) : (
              <>
                <span className="text-lg">🎲</span>
                <span>{lastWinSummary ? 'ROLL 2 DICE AGAIN (8s)' : 'TAP DICE TO ROLL (8s)'}</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-center text-slate-500 mt-2.5">
          2 Ludo Dice • Spins for 8 seconds at light speed • Every win is automatically added to user
        </p>
      </div>
    </div>
  );
};
