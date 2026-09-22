import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  DollarSign,
  Trophy,
  History,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import {
  ROULETTE_POCKETS,
  WHEEL_SEQUENCE,
  RoulettePocket,
  RouletteBet,
  BetType,
  getPocketByNumber,
  BET_MULTIPLIERS,
} from '../data/rouletteData';

export interface RouletteStakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance: number;
  onDebitStake: (amount: number) => void;
  onCreditWin: (amount: number) => void;
}

interface RoundHistoryItem {
  roundNumber: number;
  pocket: RoulettePocket;
  won: boolean;
  profit: number; // positive or negative
  timestamp: number;
}

export const RouletteStakeModal: React.FC<RouletteStakeModalProps> = ({
  isOpen,
  onClose,
  reserveBalance,
  onDebitStake,
  onCreditWin,
}) => {
  // Automatic 60-Second Cycle Timer:
  // Timer counts down from 60 to 0.
  // When timer hits 5 (last 5 seconds), the wheel automatically spins for 5 seconds.
  // When timer hits 0, results are evaluated, payouts awarded or losses recorded, and new 60s countdown begins.
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [ballRotation, setBallRotation] = useState<number>(0);
  const [winningPocket, setWinningPocket] = useState<RoulettePocket | null>(null);

  // Active user stake configuration
  const [stakeAmount, setStakeAmount] = useState<number>(1);
  const [activeBets, setActiveBets] = useState<RouletteBet[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<{
    pocket: RoulettePocket;
    payout: number;
    staked: number;
    net: number;
    won: boolean;
  } | null>(null);
  const [history, setHistory] = useState<RoundHistoryItem[]>([]);
  const [quickAmountSelected, setQuickAmountSelected] = useState<number>(1);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wheelTickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalActiveStaked = activeBets.reduce((sum, b) => sum + b.amount, 0);

  // Total segments
  const totalSegments = WHEEL_SEQUENCE.length; // 65
  const segmentAngle = 360 / totalSegments;

  // Keep references to state values for interval callbacks
  const activeBetsRef = useRef(activeBets);
  activeBetsRef.current = activeBets;
  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;
  const wheelRotationRef = useRef(wheelRotation);
  wheelRotationRef.current = wheelRotation;
  const ballRotationRef = useRef(ballRotation);
  ballRotationRef.current = ballRotation;

  // Staking lock threshold for 15s spin
  const isLocked = isSpinning || secondsRemaining <= 16;

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (wheelTickTimerRef.current) clearTimeout(wheelTickTimerRef.current);
    };
  }, []);

  // Master 60-Second Auto-Spin Interval:
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        // When timer is at 16 seconds, trigger the 15-second spin
        if (prev === 16) {
          triggerAutoSpin();
        }

        if (prev <= 1) {
          return 60; // Reset to 60 for the next round
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Dynamic ticking audio over the 15-second spin
  const startSpinAudio = () => {
    if (wheelTickTimerRef.current) clearTimeout(wheelTickTimerRef.current);
    const startTime = Date.now();
    const duration = 14800;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) return;

      soundFx.playWheelTick();

      // Dynamic pacing: rapid initial flutter decelerating into suspenseful slow clicks
      let delay = 75;
      if (elapsed > 12000) {
        delay = 500;
      } else if (elapsed > 9000) {
        delay = 320;
      } else if (elapsed > 6000) {
        delay = 200;
      } else if (elapsed > 3000) {
        delay = 120;
      }

      wheelTickTimerRef.current = setTimeout(tick, delay);
    };

    wheelTickTimerRef.current = setTimeout(tick, 75);
  };

  // Trigger the 15-second automatic spin
  const triggerAutoSpin = () => {
    if (isSpinningRef.current) return;
    setIsSpinning(true);
    soundFx.playClick();
    soundFx.triggerHaptic(25);

    // Pick random winning pocket from 0 to 64
    const randomIdx = Math.floor(Math.random() * totalSegments);
    const winNumber = WHEEL_SEQUENCE[randomIdx];
    const targetPocket = getPocketByNumber(winNumber);

    // Calculate rotation angle to align the winning segment to the top indicator (12 o'clock)
    // Segment index `randomIdx` has its center at angle: `randomIdx * (360 / 65)` degrees clockwise from 12 o'clock.
    // To rotate this segment clockwise into 12 o'clock:
    const angleNeeded = (totalSegments - randomIdx) * (360 / totalSegments);
    const currentRot = wheelRotationRef.current;
    const currentMod = ((currentRot % 360) + 360) % 360;
    const forwardDelta = ((angleNeeded - currentMod) % 360 + 360) % 360;
    const fullSpins = 360 * 14; // 14 full rotations over 15 seconds
    const finalWheelRot = currentRot + fullSpins + forwardDelta;

    // Ball spins rapidly in reverse (counter-clockwise) and comes to rest at 12 o'clock inside the winning pocket
    const currentBallRot = ballRotationRef.current;
    const currentBallMod = ((currentBallRot % 360) + 360) % 360;
    const ballDelta = -currentBallMod;
    const ballFullSpins = -(360 * 20); // 20 reverse rotations
    const finalBallRot = currentBallRot + ballFullSpins + ballDelta;

    setWheelRotation(finalWheelRot);
    setBallRotation(finalBallRot);

    // Start realistic decelerating ticks
    startSpinAudio();

    // 15 seconds spin duration
    setTimeout(() => {
      setIsSpinning(false);
      setWinningPocket(targetPocket);
      evaluateRoundResults(targetPocket);
      setRoundNumber((r) => r + 1);
    }, 15000);
  };

  // Evaluate the round against active bets
  const evaluateRoundResults = (pocket: RoulettePocket) => {
    let totalWinPayout = 0;
    const currentBets = activeBetsRef.current;
    const currentStaked = currentBets.reduce((sum, b) => sum + b.amount, 0);

    currentBets.forEach((bet) => {
      let isWin = false;
      if (bet.type === 'color') {
        if (bet.value === pocket.color) isWin = true;
      } else if (bet.type === 'number') {
        if (Number(bet.value) === pocket.number) isWin = true;
      } else if (bet.type === 'parity') {
        if (pocket.number !== 0) {
          if (bet.value === 'odd' && pocket.number % 2 === 1) isWin = true;
          if (bet.value === 'even' && pocket.number % 2 === 0) isWin = true;
        }
      } else if (bet.type === 'range') {
        if (pocket.number !== 0) {
          if (bet.value === '1-32' && pocket.number >= 1 && pocket.number <= 32) isWin = true;
          if (bet.value === '33-64' && pocket.number >= 33 && pocket.number <= 64) isWin = true;
        }
      }

      if (isWin) {
        totalWinPayout += bet.amount * bet.payoutMultiplier;
      }
    });

    const netProfit = totalWinPayout - currentStaked;
    const userWon = totalWinPayout > 0;

    if (userWon) {
      onCreditWin(totalWinPayout);
      soundFx.playReward();
      soundFx.triggerHaptic(40);
    } else if (currentStaked > 0) {
      soundFx.triggerHaptic(20);
    }

    setLastRoundResult({
      pocket,
      payout: totalWinPayout,
      staked: currentStaked,
      net: netProfit,
      won: userWon,
    });

    setHistory((prev) => [
      {
        roundNumber,
        pocket,
        won: userWon,
        profit: netProfit,
        timestamp: Date.now(),
      },
      ...prev.slice(0, 19),
    ]);

    // Clear active bets for next round
    setActiveBets([]);
  };

  // Place a bet on the table
  const handlePlaceBet = (type: BetType, value: string | number, label: string, multiplier: number) => {
    if (isLocked) {
      return;
    }

    if (reserveBalance < stakeAmount) {
      soundFx.triggerHaptic(15);
      return;
    }

    // Debit stake from reserve immediately
    onDebitStake(stakeAmount);
    soundFx.playClick();
    soundFx.triggerHaptic(15);

    setActiveBets((prev) => {
      // Check if existing bet on same spot
      const existingIdx = prev.findIndex((b) => b.type === type && b.value === value);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          amount: updated[existingIdx].amount + stakeAmount,
        };
        return updated;
      }
      return [
        ...prev,
        {
          type,
          value,
          amount: stakeAmount,
          label,
          payoutMultiplier: multiplier,
        },
      ];
    });
  };

  // Clear or cancel bets before spin begins
  const handleClearBets = () => {
    if (isLocked || activeBets.length === 0) return;
    // Refund active bets to reserve balance
    const refundAmount = activeBets.reduce((sum, b) => sum + b.amount, 0);
    if (refundAmount > 0) {
      onCreditWin(refundAmount);
    }
    setActiveBets([]);
    soundFx.playClick();
  };

  // Draw the 65-number round roulette wheel on canvas (High-DPI Retina)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width; // 720
    const center = size / 2;
    const radius = center - 14;
    const innerRadius = radius * 0.58;
    const pocketAngle = (2 * Math.PI) / totalSegments;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);

    // 1. Outer Deep Metal Base & Gold Rim
    const gradOuter = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, radius + 10);
    gradOuter.addColorStop(0, '#101524');
    gradOuter.addColorStop(0.75, '#1e263d');
    gradOuter.addColorStop(0.92, '#f59e0b'); // Gold Rim
    gradOuter.addColorStop(0.96, '#fef08a'); // Highlight
    gradOuter.addColorStop(1, '#854d0e');

    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = gradOuter;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // 2. Ball Track Groove Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // 3. Draw the 65 pockets (centered so index 0 is at 12 o'clock / -Math.PI / 2)
    WHEEL_SEQUENCE.forEach((num, index) => {
      const angleStart = -Math.PI / 2 - pocketAngle / 2 + index * pocketAngle;
      const angleEnd = angleStart + pocketAngle;
      const pocket = getPocketByNumber(num);

      // Pocket Wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angleStart, angleEnd);
      ctx.closePath();

      if (pocket.color === 'green') {
        const greenGrad = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, radius);
        greenGrad.addColorStop(0, '#047857');
        greenGrad.addColorStop(1, '#10b981');
        ctx.fillStyle = greenGrad;
      } else if (pocket.color === 'red') {
        const redGrad = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, radius);
        redGrad.addColorStop(0, '#991b1b');
        redGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = redGrad;
      } else {
        const blackGrad = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, radius);
        blackGrad.addColorStop(0, '#090d16');
        blackGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = blackGrad;
      }
      ctx.fill();

      // Golden Pocket Separator Frets
      ctx.beginPath();
      ctx.moveTo(Math.cos(angleStart) * innerRadius, Math.sin(angleStart) * innerRadius);
      ctx.lineTo(Math.cos(angleStart) * radius, Math.sin(angleStart) * radius);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Pocket Number Text (radially facing outward, crisp & large)
      ctx.save();
      const midAngle = angleStart + pocketAngle / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 15px Rajdhani, monospace';
      ctx.fillStyle = pocket.color === 'green' ? '#ecfdf5' : '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      ctx.fillText(num.toString(), radius - 10, 0);
      ctx.restore();
    });

    // 4. Inner Bronze / Brass Wheel Bowl
    const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
    innerGrad.addColorStop(0, '#475569');
    innerGrad.addColorStop(0.4, '#1e293b');
    innerGrad.addColorStop(0.8, '#0f172a');
    innerGrad.addColorStop(0.96, '#f59e0b');
    innerGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // 5. Turret Cone Base Ring
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius * 0.52, 0, 2 * Math.PI);
    ctx.fillStyle = '#0b0f19';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Turret 8-point Facets
    const turretRadius = innerRadius * 0.52;
    for (let f = 0; f < 8; f++) {
      const fAngle = (f * 2 * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(fAngle) * turretRadius, Math.sin(fAngle) * turretRadius);
      ctx.strokeStyle = f % 2 === 0 ? '#f59e0b88' : '#64748b66';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 7. Center Polished Brass Spindle Ball
    const goldGrad = ctx.createRadialGradient(
      -innerRadius * 0.05,
      -innerRadius * 0.05,
      0,
      0,
      0,
      innerRadius * 0.25
    );
    goldGrad.addColorStop(0, '#ffffff');
    goldGrad.addColorStop(0.2, '#fef08a');
    goldGrad.addColorStop(0.6, '#eab308');
    goldGrad.addColorStop(1, '#78350f');

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius * 0.25, 0, 2 * Math.PI);
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    ctx.restore();
  }, [totalSegments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#141a29] via-[#0f1422] to-[#0a0d16] border border-amber-500/40 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[96vh]">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#182136] via-[#1f2a45] to-[#182136] border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <RotateCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white font-['Rajdhani',sans-serif] tracking-wider uppercase">
                  Roulette 65 Stake
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  ROUND #{roundNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                65-Number Table • Auto-Spin Every 60s • Live Round Table
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              disabled={isSpinning}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition disabled:opacity-30"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Rules Drawer */}
        {showHowToPlay && (
          <div className="px-4 py-2.5 bg-[#121726] border-b border-white/10 text-xs text-slate-300 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Standard 65-Pocket Round Roulette Rules
            </h4>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
              <li><strong className="text-white">65 Pockets:</strong> 0 (Green House Zero) and 1 to 64 (alternating Red & Black).</li>
              <li><strong className="text-white">Payouts:</strong> Color (Red/Black) pays 2x • Single Numbers pay 65x • Odd/Even & 1-32 / 33-64 pay 2x • Green 0 pays 35x.</li>
              <li><strong className="text-white">Auto-Cycle:</strong> The wheel automatically spins every 60 seconds. Stakes are debited upon placement and all wins are instantly credited!</li>
            </ul>
          </div>
        )}

        {/* Scrollable Center Area */}
        <div className="p-3.5 overflow-y-auto space-y-3.5 flex-1">
          {/* Top Status & 60-Second Countdown HUD */}
          <div className="grid grid-cols-3 gap-2">
            {/* Reserve Balance */}
            <div className="bg-[#121624] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Your Reserve</span>
              <div className="text-sm font-black text-emerald-400 font-mono flex items-center gap-0.5 mt-0.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{reserveBalance.toFixed(2)}</span>
              </div>
              <span className="text-[9px] text-slate-500">Available cash</span>
            </div>

            {/* Auto-Spin Timer */}
            <div className={`border rounded-2xl p-2.5 flex flex-col justify-between transition-colors ${
              isLocked
                ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-[#121624] border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Auto Spin</span>
                <Clock className={`w-3 h-3 ${isLocked ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
              </div>
              <div className={`text-base font-black font-mono tracking-wider ${
                isLocked ? 'text-rose-400 animate-pulse' : 'text-amber-400'
              }`}>
                {isSpinning ? 'SPINNING...' : `${secondsRemaining}s`}
              </div>
              <span className="text-[9px] text-slate-500">
                {isLocked ? 'Stakes locked' : 'Betting window open'}
              </span>
            </div>

            {/* Total Active Stake */}
            <div className="bg-[#121624] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Stake</span>
              <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
                ${totalActiveStaked.toFixed(2)}
              </div>
              <span className="text-[9px] text-slate-500">{activeBets.length} placed</span>
            </div>
          </div>

          {/* Real Round Table Roulette Wheel Visualizer */}
          <div className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 bg-radial from-[#1e263d] via-[#101422] to-[#0a0d16] border rounded-3xl shadow-inner transition-all duration-300 ${
            isSpinning
              ? 'border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
              : 'border-amber-500/20'
          }`}>
            {/* Top Indicator Arrow (Pointer at 12 o'clock) */}
            <div className="absolute top-1 z-30 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,1)]" />
            </div>

            {/* Enlarge Spin Wheel (Large, prominent and responsive) */}
            <div className="relative w-[min(88vw,335px)] h-[min(88vw,335px)] sm:w-[365px] sm:h-[365px] flex items-center justify-center my-1">
              {/* Rotating Wheel Canvas Layer */}
              <div
                className="w-full h-full flex items-center justify-center select-none pointer-events-none will-change-transform"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning
                    ? 'transform 15s cubic-bezier(0.12, 0.85, 0.3, 1)'
                    : 'none',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={720}
                  className="w-full h-full select-none pointer-events-none drop-shadow-[0_12px_35px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Counter-Rotating Ivory Ball Track Layer */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
                style={{
                  transform: `rotate(${ballRotation}deg)`,
                  transition: isSpinning
                    ? 'transform 15s cubic-bezier(0.08, 0.90, 0.25, 1)'
                    : 'none',
                }}
              >
                <div
                  className={`absolute w-3.5 h-3.5 rounded-full bg-gradient-to-br from-white via-slate-100 to-amber-100 shadow-[0_0_12px_rgba(255,255,255,1),0_0_24px_rgba(251,191,36,0.9)] border border-white transition-all duration-700 ${
                    isSpinning ? 'scale-115' : 'scale-100'
                  }`}
                  style={{
                    top: isSpinning ? '3.5%' : '5.5%',
                  }}
                />
              </div>
            </div>

            {/* In-Action Live Spinning Badge */}
            {isSpinning && (
              <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>WHEEL & BALL SPINNING IN ACTION...</span>
              </div>
            )}

            {/* Current Winning / Landed Display */}
            {winningPocket && !isSpinning && (
              <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/70 border border-amber-500/40 animate-in zoom-in-95 duration-200">
                <span className="text-xs font-bold text-slate-300">LANDED:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black font-mono shadow ${
                    winningPocket.color === 'green'
                      ? 'bg-emerald-600 text-white'
                      : winningPocket.color === 'red'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 border border-slate-700 text-white'
                  }`}
                >
                  {winningPocket.number} {winningPocket.color.toUpperCase()}
                </span>
                {lastRoundResult && (
                  <span
                    className={`text-xs font-black font-mono ${
                      lastRoundResult.won ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {lastRoundResult.won
                      ? `+$${lastRoundResult.payout.toFixed(2)} WIN!`
                      : lastRoundResult.staked > 0
                      ? `-$${lastRoundResult.staked.toFixed(2)}`
                      : 'NO BET'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stake Chip Value Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-300">Select Stake Chip ($ USD)</span>
              <span className="text-[11px] text-amber-400 font-mono">Current: ${stakeAmount}</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 5, 10, 25].map((val) => (
                <button
                  key={val}
                  disabled={isLocked}
                  onClick={() => {
                    soundFx.playClick();
                    setStakeAmount(val);
                    setQuickAmountSelected(val);
                  }}
                  className={`py-2 rounded-xl text-xs font-black font-mono transition active:scale-95 border ${
                    stakeAmount === val
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                      : 'bg-[#141926] text-slate-300 border-white/10 hover:border-amber-400/40'
                  } disabled:opacity-40`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Outer Betting Board */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 px-1 block">
              Colors & Sections (Click to Stake ${stakeAmount})
            </span>

            {/* Colors: Red (2x), Green 0 (35x), Black (2x) */}
            <div className="grid grid-cols-3 gap-2">
              {/* RED Bet */}
              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('color', 'red', 'RED (2x)', BET_MULTIPLIERS.color_red_black)}
                className="py-3 rounded-2xl bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-400/60 shadow-lg text-white font-black text-xs flex flex-col items-center justify-center transition active:scale-95 disabled:opacity-40 group relative overflow-hidden"
              >
                <span className="tracking-wider uppercase font-['Rajdhani',sans-serif] text-sm">RED</span>
                <span className="text-[10px] text-rose-200 font-mono">PAYS 2x</span>
                {activeBets.find((b) => b.type === 'color' && b.value === 'red') && (
                  <span className="absolute top-1 right-1.5 px-1.5 py-0.2 rounded-full bg-black/60 text-[9px] text-amber-300 font-mono font-bold border border-amber-400/40">
                    ${activeBets.find((b) => b.type === 'color' && b.value === 'red')?.amount}
                  </span>
                )}
              </button>

              {/* GREEN ZERO Bet */}
              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('number', 0, 'GREEN ZERO (35x)', BET_MULTIPLIERS.color_green)}
                className="py-3 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/60 shadow-lg text-white font-black text-xs flex flex-col items-center justify-center transition active:scale-95 disabled:opacity-40 group relative overflow-hidden"
              >
                <span className="tracking-wider uppercase font-['Rajdhani',sans-serif] text-sm">0 GREEN</span>
                <span className="text-[10px] text-emerald-200 font-mono">PAYS 35x</span>
                {activeBets.find((b) => b.type === 'number' && b.value === 0) && (
                  <span className="absolute top-1 right-1.5 px-1.5 py-0.2 rounded-full bg-black/60 text-[9px] text-amber-300 font-mono font-bold border border-amber-400/40">
                    ${activeBets.find((b) => b.type === 'number' && b.value === 0)?.amount}
                  </span>
                )}
              </button>

              {/* BLACK Bet */}
              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('color', 'black', 'BLACK (2x)', BET_MULTIPLIERS.color_red_black)}
                className="py-3 rounded-2xl bg-gradient-to-b from-slate-900 to-black hover:from-slate-800 hover:to-slate-900 border border-slate-600/60 shadow-lg text-white font-black text-xs flex flex-col items-center justify-center transition active:scale-95 disabled:opacity-40 group relative overflow-hidden"
              >
                <span className="tracking-wider uppercase font-['Rajdhani',sans-serif] text-sm">BLACK</span>
                <span className="text-[10px] text-slate-300 font-mono">PAYS 2x</span>
                {activeBets.find((b) => b.type === 'color' && b.value === 'black') && (
                  <span className="absolute top-1 right-1.5 px-1.5 py-0.2 rounded-full bg-black/60 text-[9px] text-amber-300 font-mono font-bold border border-amber-400/40">
                    ${activeBets.find((b) => b.type === 'color' && b.value === 'black')?.amount}
                  </span>
                )}
              </button>
            </div>

            {/* Ranges & Parity: 1-32, 33-64, ODD, EVEN (Each Pays 2x) */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('range', '1-32', '1 to 32', BET_MULTIPLIERS.range)}
                className="py-2 rounded-xl bg-[#141a29] border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-bold text-xs transition active:scale-95 disabled:opacity-40 relative"
              >
                <span>1 – 32</span>
                <span className="text-[9px] text-slate-400 block font-mono font-normal">2x</span>
                {activeBets.find((b) => b.type === 'range' && b.value === '1-32') && (
                  <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] font-mono">
                    ${activeBets.find((b) => b.type === 'range' && b.value === '1-32')?.amount}
                  </span>
                )}
              </button>

              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('range', '33-64', '33 to 64', BET_MULTIPLIERS.range)}
                className="py-2 rounded-xl bg-[#141a29] border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-bold text-xs transition active:scale-95 disabled:opacity-40 relative"
              >
                <span>33 – 64</span>
                <span className="text-[9px] text-slate-400 block font-mono font-normal">2x</span>
                {activeBets.find((b) => b.type === 'range' && b.value === '33-64') && (
                  <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] font-mono">
                    ${activeBets.find((b) => b.type === 'range' && b.value === '33-64')?.amount}
                  </span>
                )}
              </button>

              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('parity', 'even', 'EVEN', BET_MULTIPLIERS.parity)}
                className="py-2 rounded-xl bg-[#141a29] border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-bold text-xs transition active:scale-95 disabled:opacity-40 relative"
              >
                <span>EVEN</span>
                <span className="text-[9px] text-slate-400 block font-mono font-normal">2x</span>
                {activeBets.find((b) => b.type === 'parity' && b.value === 'even') && (
                  <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] font-mono">
                    ${activeBets.find((b) => b.type === 'parity' && b.value === 'even')?.amount}
                  </span>
                )}
              </button>

              <button
                disabled={isLocked || reserveBalance < stakeAmount}
                onClick={() => handlePlaceBet('parity', 'odd', 'ODD', BET_MULTIPLIERS.parity)}
                className="py-2 rounded-xl bg-[#141a29] border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-bold text-xs transition active:scale-95 disabled:opacity-40 relative"
              >
                <span>ODD</span>
                <span className="text-[9px] text-slate-400 block font-mono font-normal">2x</span>
                {activeBets.find((b) => b.type === 'parity' && b.value === 'odd') && (
                  <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] font-mono">
                    ${activeBets.find((b) => b.type === 'parity' && b.value === 'odd')?.amount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 65-Number Table Grid (Direct Number Bets Pay 65x!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-300">Single Number Bets (Pays 65x)</span>
              <span className="text-[10px] text-slate-400">All 65 Pockets (0–64)</span>
            </div>

            <div className="grid grid-cols-10 gap-1 p-2 bg-[#0c101a] border border-white/10 rounded-2xl max-h-48 overflow-y-auto">
              {ROULETTE_POCKETS.map((pkt) => {
                const betOnThis = activeBets.find((b) => b.type === 'number' && b.value === pkt.number);
                return (
                  <button
                    key={pkt.number}
                    disabled={isLocked || reserveBalance < stakeAmount}
                    onClick={() => handlePlaceBet('number', pkt.number, `Number ${pkt.number}`, BET_MULTIPLIERS.number)}
                    className={`py-1.5 rounded-lg text-[10px] font-black font-mono transition active:scale-90 relative flex items-center justify-center border ${
                      pkt.color === 'green'
                        ? 'bg-emerald-600/90 text-white border-emerald-400/70 hover:bg-emerald-500'
                        : pkt.color === 'red'
                        ? 'bg-rose-600/90 text-white border-rose-400/70 hover:bg-rose-500'
                        : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                    } disabled:opacity-40`}
                  >
                    <span>{pkt.number}</span>
                    {betOnThis && (
                      <span className="absolute -top-1.5 -right-1 px-1 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] shadow">
                        ${betOnThis.amount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Bets & Clear Controls */}
          {activeBets.length > 0 && (
            <div className="bg-[#121624] border border-amber-500/30 rounded-2xl p-2.5 flex items-center justify-between animate-in fade-in duration-150">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stake</span>
                <p className="text-xs text-amber-300 font-mono font-bold truncate">
                  {activeBets.map((b) => `${b.label} ($${b.amount})`).join(', ')}
                </p>
              </div>

              <button
                disabled={isLocked}
                onClick={handleClearBets}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95 shrink-0 disabled:opacity-40"
              >
                Clear & Refund
              </button>
            </div>
          )}

          {/* Recent Landings & History */}
          {history.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Recent Results
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black font-mono shrink-0 flex items-center gap-1 border shadow ${
                      h.pocket.color === 'green'
                        ? 'bg-emerald-600/80 text-white border-emerald-400/50'
                        : h.pocket.color === 'red'
                        ? 'bg-rose-600/80 text-white border-rose-400/50'
                        : 'bg-slate-900 text-white border-slate-700'
                    }`}
                  >
                    <span>{h.pocket.number}</span>
                    {h.won && <span className="text-emerald-300">+$</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-4 py-3 bg-[#0d111d] border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {isLocked ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Wheel spinning...
              </span>
            ) : (
              <span>Place your stakes or wait for next round</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs uppercase tracking-wider transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
