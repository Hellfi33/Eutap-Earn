import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Key, Layers, ChevronRight, Zap, Flame, Disc, Palette } from 'lucide-react';
import { FloatingTapNumber } from '../types';
import { soundFx } from '../utils/audio';
import { formatMilTapPoints, formatTapCap, getTierByCoins } from '../data/tiers';
import { getDailyCipherCountdown } from '../data/ciphers';
import { getDailyComboCountdown } from '../data/combo';
import { getSpinRefillCountdown } from '../data/spinWheel';
import { getSeasonalSkinByLevel } from '../data/seasonalSkins';
import { AlphabetGestureLayer } from './AlphabetGestureLayer';
import { BalanceBoostModal } from './BalanceBoostModal';
import { SeasonalArenaBackground } from './SeasonalArenaBackground';
import { SeasonalCharacterAccessory } from './SeasonalCharacterAccessory';
import { SeasonalSkinsModal } from './SeasonalSkinsModal';

interface TapExchangeProps {
  coins: number;
  reserveBalance: number;
  diamonds: number;
  keys?: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  critChance: number;
  streakDay: number;
  cipherSolvedToday: boolean;
  comboSolvedToday: boolean;
  isTurboActive: boolean;
  spinCount: number;
  nextSpinRefillTime: number;
  onMultiTap: (points: { clientX: number; clientY: number }[]) => void;
  onAlphabetGestureReward: (letter: string, points: number) => void;
  canAbcdReward?: boolean;
  onDirectBalanceBoost: (
    resourceOrAmount: 'points' | 'reserve' | 'diamonds' | 'keys' | number,
    amount?: number
  ) => void;
  floatingNumbers: FloatingTapNumber[];
  onOpenDailyReward: () => void;
  onOpenDailyCipher: () => void;
  onOpenDailyCombo: () => void;
  onOpenLuckyWheel: () => void;
  onOpenBoost: () => void;
  onOpenMorseTerminal?: () => void;
  onOpenTierModal?: () => void;
  isAutoTapping?: boolean;
  onStopAutoTap?: () => void;
  stage?: number;
  mascotImg: string;
  goldCoinImg: string;
  equippedSkinLevel?: number | null;
  onEquipSkin?: (level: number | null) => void;
}

export const TapExchange: React.FC<TapExchangeProps> = ({
  coins,
  reserveBalance,
  diamonds,
  keys = 0,
  energy,
  maxEnergy,
  tapPower,
  critChance,
  streakDay,
  cipherSolvedToday,
  comboSolvedToday,
  isTurboActive,
  spinCount,
  nextSpinRefillTime,
  onMultiTap,
  onAlphabetGestureReward,
  canAbcdReward = true,
  onDirectBalanceBoost,
  floatingNumbers,
  onOpenDailyReward,
  onOpenDailyCipher,
  onOpenDailyCombo,
  onOpenLuckyWheel,
  onOpenBoost,
  onOpenMorseTerminal,
  onOpenTierModal,
  isAutoTapping = false,
  onStopAutoTap,
  stage = 1,
  mascotImg,
  goldCoinImg,
  equippedSkinLevel = null,
  onEquipSkin,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isPressing, setIsPressing] = useState(false);
  const [cipherCountdown, setCipherCountdown] = useState<string>(getDailyCipherCountdown());
  const [comboCountdown, setComboCountdown] = useState<string>(getDailyComboCountdown());
  const [spinCountdown, setSpinCountdown] = useState<string>('');
  const [showSkinsModal, setShowSkinsModal] = useState(false);

  // Derive active seasonal skin based on coins/level
  const currentTier = getTierByCoins(coins, stage);
  const effectiveSkinLevel =
    equippedSkinLevel !== null && equippedSkinLevel !== undefined
      ? equippedSkinLevel
      : currentTier.level;
  const activeSkin = getSeasonalSkinByLevel(effectiveSkinLevel, stage);

  // 10-second long hold secret balance booster
  const [showBalanceBoostModal, setShowBalanceBoostModal] = useState(false);
  const [isHoldingBalance, setIsHoldingBalance] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  const startHoldBalance = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdStartTimeRef.current = Date.now();
    setIsHoldingBalance(true);
    setHoldProgress(0);

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const pct = Math.min(100, (elapsed / 10000) * 100);
      setHoldProgress(pct);
    }, 100);

    // 10-second hold opens the balance boosting input box
    holdTimerRef.current = window.setTimeout(() => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      setIsHoldingBalance(false);
      setHoldProgress(100);
      soundFx.playReward();
      setShowBalanceBoostModal(true);
      setTimeout(() => setHoldProgress(0), 400);
    }, 10000);
  };

  const cancelHoldBalance = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHoldingBalance(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCipherCountdown(getDailyCipherCountdown());
      setComboCountdown(getDailyComboCountdown());
      if (nextSpinRefillTime > 0) {
        setSpinCountdown(getSpinRefillCountdown(nextSpinRefillTime));
      } else {
        setSpinCountdown('');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextSpinRefillTime]);

  const energyPercentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  return (
    <AlphabetGestureLayer
      onReward={onAlphabetGestureReward}
      canReward={canAbcdReward}
      onTapMascot={onMultiTap}
      onOpenMorseTerminal={onOpenMorseTerminal}
      energy={energy}
      isPressingMascot={isPressing}
      setIsPressingMascot={setIsPressing}
      setTilt={setTilt}
    >
      <div className="w-full h-full flex flex-col items-center justify-between px-3 py-1.5 select-none overflow-hidden relative">
        {/* Dynamic Seasonal Arena Background that changes color & design on every level */}
        <SeasonalArenaBackground skin={activeSkin} />

        {/* Attached 4-Pill Metrics Dock (Original Position: At the very top) */}
        <div
          id="reserve-metrics-panel"
          className="w-full max-w-sm bg-[#0a0e17]/95 backdrop-blur-md border border-white/10 rounded-2xl p-1 sm:p-1.5 mb-1.5 shrink-0 shadow-lg z-10"
        >
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            {/* ₮ TAP POINTS */}
            <div
              id="panel-tap-points"
              onClick={() => {
                soundFx.playClick();
                if (onOpenTierModal) onOpenTierModal();
              }}
              className="bg-[#131926] hover:bg-[#182133] border border-white/5 hover:border-amber-400/40 rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-95 shadow-xs select-none"
              title="Tap Points / Current Tier"
            >
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[#f59e0b] font-bold text-[9px] sm:text-[10px] tracking-wide font-['Rajdhani',sans-serif] leading-tight">
                <span className="text-[10px] sm:text-[11px] font-black">₮</span>
                <span className="truncate">TAP POINTS</span>
              </div>
              <span
                id="reserves-tap-points-val"
                className="text-white font-extrabold text-xs sm:text-sm md:text-base font-['Rajdhani',sans-serif] mt-0.5 tracking-tight truncate max-w-full"
              >
                {formatMilTapPoints(coins)}
              </span>
            </div>

            {/* $ RESERVES - Locked away; Withdrawal is strictly accessible only via Morse code (WD**) */}
            <div
              id="panel-reserves"
              className="bg-[#131926] border border-white/5 rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center text-center cursor-default select-none shadow-xs"
              title="Crypto Reserves"
            >
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[#10b981] font-bold text-[9px] sm:text-[10px] tracking-wide font-['Rajdhani',sans-serif] leading-tight">
                <span className="text-[10px] sm:text-[11px] font-black">$</span>
                <span className="truncate">RESERVES</span>
              </div>
              <span
                id="reserves-balance-val"
                className="text-[#34d399] font-extrabold text-xs sm:text-sm md:text-base font-['Rajdhani',sans-serif] mt-0.5 tracking-tight truncate max-w-full"
              >
                ${reserveBalance.toFixed(2)}
              </span>
            </div>

            {/* 💎 DIAMONDS - Display only; shows diamonds earned. Not clickable/responsive */}
            <div
              id="panel-diamonds"
              className="bg-[#131926] border border-white/5 rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center text-center cursor-default select-none shadow-xs"
              title="Diamonds Earned"
            >
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[#38bdf8] font-bold text-[9px] sm:text-[10px] tracking-wide font-['Rajdhani',sans-serif] leading-tight">
                <span className="text-[10px] sm:text-[11px]">💎</span>
                <span className="truncate">DIAMONDS</span>
              </div>
              <span
                id="reserves-diamonds-val"
                className="text-white font-extrabold text-xs sm:text-sm md:text-base font-['Rajdhani',sans-serif] mt-0.5 tracking-tight truncate max-w-full"
              >
                {diamonds.toLocaleString()}
              </span>
            </div>

            {/* 🔑 KEYS - Display only; shows keys earned. Not clickable/responsive */}
            <div
              id="panel-keys"
              className="bg-[#131926] border border-white/5 rounded-xl py-1.5 sm:py-2 px-1 flex flex-col items-center justify-center text-center cursor-default select-none shadow-xs"
              title="Keys Earned"
            >
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[#fbbf24] font-bold text-[9px] sm:text-[10px] tracking-wide font-['Rajdhani',sans-serif] leading-tight">
                <span className="text-[10px] sm:text-[11px]">🔑</span>
                <span className="truncate">KEYS</span>
              </div>
              <span
                id="reserves-keys-val"
                className="text-white font-extrabold text-xs sm:text-sm md:text-base font-['Rajdhani',sans-serif] mt-0.5 tracking-tight truncate max-w-full"
              >
                {(keys || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Top 4 Quick Feature Cards */}
        <div className="w-full max-w-sm grid grid-cols-4 gap-1 sm:gap-1.5 shrink-0 z-10">
        {/* Daily reward */}
        <button
          id="btn-daily-reward"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyReward();
          }}
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 rounded-full border border-slate-600 bg-emerald-500/80" />
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1 group-hover:scale-105 transition">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-200 leading-tight">Reward</span>
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium mt-0.5">
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
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div
            className={`absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 rounded-full border ${
              cipherSolvedToday ? 'bg-emerald-400 border-emerald-300' : 'bg-transparent border-slate-600'
            }`}
          />
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1 group-hover:scale-105 transition">
            <Key className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-200 leading-tight">Cipher</span>
          <div className="flex items-center gap-1 mt-0.5">
            {cipherSolvedToday ? (
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">{cipherCountdown}</span>
            ) : (
              <>
                <img
                  src={goldCoinImg}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-2.5 h-2.5 rounded-full"
                />
                <span className="text-[8px] sm:text-[9px] text-amber-400 font-bold">200K</span>
              </>
            )}
          </div>
        </button>

        {/* Daily combo (24hrs reset, once a day) */}
        <button
          id="btn-daily-combo"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyCombo();
          }}
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div
            className={`absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 rounded-full border ${
              comboSolvedToday ? 'bg-emerald-400 border-emerald-300' : 'bg-transparent border-slate-600'
            }`}
          />
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1 group-hover:scale-105 transition">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-200 leading-tight">Combo</span>
          <div className="flex items-center gap-1 mt-0.5">
            {comboSolvedToday ? (
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">{comboCountdown}</span>
            ) : (
              <>
                <img
                  src={goldCoinImg}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-2.5 h-2.5 rounded-full"
                />
                <span className="text-[8px] sm:text-[9px] text-amber-400 font-bold">200K</span>
              </>
            )}
          </div>
        </button>

        {/* Lucky Spin Wheel Button */}
        <button
          id="btn-lucky-spin"
          onClick={() => {
            soundFx.playClick();
            onOpenLuckyWheel();
          }}
          className="relative bg-[#141923] hover:bg-[#19202e] border border-white/10 hover:border-amber-400/40 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition group shadow-md"
        >
          <div
            className={`absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 rounded-full border ${
              spinCount > 0 ? 'bg-amber-400 border-amber-300 animate-pulse' : 'bg-transparent border-slate-600'
            }`}
          />
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-1 group-hover:scale-105 transition">
            <Disc className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition duration-300" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-200 leading-tight">Lucky Spin</span>
          <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono font-bold mt-0.5 truncate max-w-full">
            {spinCount > 0 ? `${spinCount} Spins` : (spinCountdown || 'Empty')}
          </span>
        </button>
      </div>

      {/* Main Balance Display with 10-Second Long-Hold Secret Booster */}
      <div className="flex flex-col items-center my-1 sm:my-2 shrink-0 relative">
        <div
          id="user-coin-balance-container"
          onPointerDown={startHoldBalance}
          onPointerUp={cancelHoldBalance}
          onPointerLeave={cancelHoldBalance}
          onPointerCancel={cancelHoldBalance}
          onContextMenu={(e) => e.preventDefault()}
          className={`balance-hold-trigger relative flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-2xl cursor-pointer select-none transition-all duration-200 ${
            isHoldingBalance ? 'scale-105 bg-amber-500/15 ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.5)]' : 'hover:bg-white/[0.02]'
          }`}
        >
          {/* Subtle 10s Hold Charging Progress Ring Border */}
          {isHoldingBalance && (
            <div
              className="absolute inset-0 rounded-2xl border-2 border-amber-300 pointer-events-none transition-all"
              style={{
                clipPath: `inset(0 ${100 - holdProgress}% 0 0)`,
              }}
            />
          )}

          <div className="relative">
            <img
              src={goldCoinImg}
              alt="Coin"
              referrerPolicy="no-referrer"
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] ${
                isHoldingBalance ? 'animate-spin' : 'animate-pulse'
              }`}
            />
          </div>
          <span
            id="user-coin-balance"
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-['Rajdhani',sans-serif]"
          >
            {coins.toLocaleString()}
          </span>
        </div>

        {/* Hold progress timer visual feedback */}
        {isHoldingBalance && (
          <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/40 text-[10px] font-bold text-amber-200 animate-pulse">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-bounce" />
            <span>HOLDING... {Math.max(1, Math.ceil((10000 - (holdProgress / 100) * 10000) / 1000))}s</span>
          </div>
        )}

        {isTurboActive && !isHoldingBalance && (
          <div className="flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold animate-bounce">
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>TURBO 5X ACTIVE!</span>
          </div>
        )}
      </div>

      {/* Balanced 50/50 Status Bar: Seasonal Skin (Left 50%) & Daily Cipher (Right 50%) */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-1.5 shrink-0 my-0.5 z-10">
        {/* Left 50%: Seasonal Skin & Wardrobe Trigger */}
        <button
          id="btn-seasonal-skin-badge"
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playClick();
            setShowSkinsModal(true);
          }}
          className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-xl border transition hover:scale-[1.02] active:scale-95 shadow-xs group backdrop-blur-xs cursor-pointer truncate"
          style={{
            backgroundColor: `${activeSkin.themeColor}18`,
            borderColor: `${activeSkin.themeColor}50`,
          }}
          title="Open Seasonal Skins Wardrobe"
        >
          <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: activeSkin.themeColor }} />
          <span
            className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase font-['Rajdhani',sans-serif] truncate"
            style={{ color: activeSkin.themeColor }}
          >
            {activeSkin.skinName}
          </span>
          <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-black/50 text-slate-200 uppercase shrink-0">
            L{activeSkin.level}
          </span>
        </button>

        {/* Right 50%: Daily Cipher Decoder Trigger */}
        <button
          id="btn-daily-cipher-banner"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyCipher();
          }}
          className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-xl bg-gradient-to-r from-[#171d2b] to-[#121620] border border-white/10 hover:border-purple-500/40 transition hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer truncate"
          title="Open Daily Morse Cipher"
        >
          <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0 animate-ping" />
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 truncate">
            {cipherSolvedToday ? 'Cipher Solved' : 'Daily Cipher'}
          </span>
          <span className="text-[9px] font-mono text-purple-400 shrink-0 font-bold">
            {cipherCountdown}
          </span>
        </button>
      </div>

      {/* Central Tap Mascot Container - Dynamically centered in available screen height */}
      <div
        id="tap-mascot-container"
        className="relative flex-1 min-h-0 flex items-center justify-center cursor-pointer select-none my-1 z-10"
        style={{ perspective: 1000 }}
      >
        {/* Outer glowing sci-fi aura ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-80 animate-pulse pointer-events-none"
          style={{ background: activeSkin.ringStyle.outerAura }}
        />

        {/* Animated ring frame */}
        <div
          className={`relative w-48 h-48 sm:w-56 sm:h-56 max-h-[32vh] max-w-[32vh] aspect-square rounded-full p-2 transition-transform duration-75 ease-out ${
            isPressing ? 'scale-[0.95]' : 'scale-100 hover:scale-[1.01]'
          }`}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
              isPressing ? 'scale(0.95)' : 'scale(1)'
            }`,
            border: `2px solid ${activeSkin.ringStyle.borderColor}`,
            boxShadow: activeSkin.ringStyle.ringGlow,
            background: `radial-gradient(circle, ${activeSkin.themeColor}20 0%, #0a0e17 75%, #000 100%)`,
          }}
        >
          {/* Cybernetic Circular Ring Accent */}
          <div
            className="absolute inset-1 rounded-full pointer-events-none"
            style={{
              border: `1.5px ${activeSkin.ringStyle.borderDashed ? 'dashed' : 'solid'} ${activeSkin.themeColor}80`,
              animation: `spin ${activeSkin.ringStyle.spinDuration} linear infinite`,
            }}
          />

          {/* Chameleon Mascot Image */}
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner">
            <img
              src={activeSkin.avatarImg || mascotImg}
              alt={activeSkin.skinName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full pointer-events-none transition-all duration-300"
              style={{
                filter: activeSkin.characterVisuals.auraFilter,
              }}
            />

            {/* Seasonal Character Costume / Accessory (Cyber Monocle, Gold Collar, Diamond Visor, etc.) */}
            <SeasonalCharacterAccessory skin={activeSkin} />

            {/* Glossy lighting highlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/15 rounded-full pointer-events-none" />
          </div>
        </div>

        {/* Low energy overlay indicator */}
        {energy <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/65 backdrop-blur-xs pointer-events-none z-30">
            <div className="bg-[#151a24] border border-amber-400/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-amber-300 text-xs font-bold shadow-lg">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Energy Refilling...</span>
            </div>
          </div>
        )}
      </div>

      {/* Energy Indicator & Boost Bar - Lowered far down at the footer level */}
      <div
        id="tap-attached-energy-boost"
        className="w-full max-w-sm shrink-0 px-1 pb-1 mb-0.5 z-10 select-none"
      >
        <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-0.5">
          {/* Left: Energy Indicator */}
          <div className="flex items-center gap-1.5 text-amber-400 whitespace-nowrap">
            <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-black text-white font-mono tracking-tight">
                {energy.toLocaleString()}
              </span>
              <span className="text-slate-400 font-semibold font-mono text-xs">
                /{formatTapCap(maxEnergy)}
              </span>
            </div>
          </div>

          {/* Right: Boost Button */}
          <button
            id="btn-boost"
            onClick={() => {
              soundFx.playClick();
              onOpenBoost();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1 rounded-xl border border-amber-400/30 transition group shrink-0 active:scale-95 shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition" />
            <span>Boost</span>
          </button>
        </div>

        {/* Energy stamina progress bar - fast duration-75 response to rapid tapping */}
        <div className="w-full h-2 sm:h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full rounded-full transition-[width] duration-75 ease-out bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            style={{ width: `${energyPercentage}%` }}
          />
        </div>
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
      </div>

      {/* Secret Balance Booster Modal */}
      <BalanceBoostModal
        isOpen={showBalanceBoostModal}
        onClose={() => setShowBalanceBoostModal(false)}
        currentBalance={coins}
        reserveBalance={reserveBalance}
        diamonds={diamonds}
        keys={keys ?? 0}
        onCreditResource={(res, amt) => onDirectBalanceBoost(res, amt)}
        onCreditBalance={(amt) => onDirectBalanceBoost('points', amt)}
      />

      {/* Seasonal Skins Wardrobe Modal */}
      <SeasonalSkinsModal
        isOpen={showSkinsModal}
        onClose={() => setShowSkinsModal(false)}
        playerLevel={currentTier.level}
        equippedSkinLevel={equippedSkinLevel ?? null}
        onEquipSkin={(lvl) => {
          if (onEquipSkin) onEquipSkin(lvl);
        }}
      />
    </AlphabetGestureLayer>
  );
};
