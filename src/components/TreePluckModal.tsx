import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, TreePine, Coins, Gem, Key, Clock, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';
import {
  getTreePluckLimit,
  consumeTreePluckPlay,
  formatCooldownTime,
  TreePluckLimitState,
} from '../utils/treePluckLimit';

export interface TreePluckReward {
  type: 'usd' | 'diamond' | 'keys' | 'points' | 'coins';
  value: number;
  label: string;
}

interface HangingItem {
  id: number;
  label: string;
  type: 'usd' | 'diamond' | 'keys' | 'points';
  value: number;
  isNeverWin: boolean;
  x: number; // percentage 10% to 90%
  y: number; // percentage 10% to 70%
  stringLength: number; // pixels
  colorClass: string;
  swayDelay: number;
  isPlucked: boolean;
}

// Generate ~124 hanging items distributed across the canopy
const generateTreeItems = (): HangingItem[] => {
  const items: HangingItem[] = [];
  let idCounter = 1;

  // Configuration of item varieties on the tree:
  // Includes multiple instances of 2 key, 7 key, 1 diamond, 3 diamond, 5000 points,
  // plus cash notes and gems so players can win when luck is on their side!
  const poolConfig = [
    // Requested winnable items (multiple instances):
    { label: '2 🗝️', type: 'keys' as const, value: 2, isNeverWin: false, count: 12, color: 'bg-amber-950/90 text-yellow-300 border-yellow-500/70 shadow-[0_0_8px_rgba(234,179,8,0.35)]' },
    { label: '7 🗝️', type: 'keys' as const, value: 7, isNeverWin: false, count: 8, color: 'bg-yellow-950/90 text-amber-200 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.45)]' },
    { label: '1 💎', type: 'diamond' as const, value: 1, isNeverWin: false, count: 14, color: 'bg-sky-950/90 text-sky-300 border-sky-400/70 shadow-[0_0_8px_rgba(56,189,248,0.35)]' },
    { label: '3 💎', type: 'diamond' as const, value: 3, isNeverWin: false, count: 10, color: 'bg-cyan-950/90 text-cyan-200 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.45)]' },
    { label: '5,000 PTS', type: 'points' as const, value: 5000, isNeverWin: false, count: 12, color: 'bg-purple-950/90 text-purple-200 border-purple-400/80 shadow-[0_0_10px_rgba(168,85,247,0.45)]' },

    // Standard cash & gem winnable varieties:
    { label: '$1', type: 'usd' as const, value: 1, isNeverWin: false, count: 20, color: 'bg-emerald-950/85 text-emerald-300 border-emerald-500/60' },
    { label: '$5', type: 'usd' as const, value: 5, isNeverWin: false, count: 12, color: 'bg-teal-950/85 text-teal-300 border-teal-500/60' },
    { label: '5 💎', type: 'diamond' as const, value: 5, isNeverWin: false, count: 8, color: 'bg-blue-950/85 text-blue-300 border-blue-400/60' },

    // Showcase aspirational drops:
    { label: '$20', type: 'usd' as const, value: 20, isNeverWin: true, count: 8, color: 'bg-green-950/85 text-emerald-200 border-emerald-400/60' },
    { label: '$50', type: 'usd' as const, value: 50, isNeverWin: true, count: 5, color: 'bg-amber-950/85 text-amber-300 border-amber-500/60' },
    { label: '$100', type: 'usd' as const, value: 100, isNeverWin: true, count: 4, color: 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-black border-yellow-200 shadow-md' },
    { label: '100 💎', type: 'diamond' as const, value: 100, isNeverWin: true, count: 3, color: 'bg-cyan-950/85 text-cyan-200 border-cyan-300/80 shadow-[0_0_10px_rgba(6,182,212,0.6)]' },
    { label: '1000 🗝️', type: 'keys' as const, value: 1000, isNeverWin: true, count: 2, color: 'bg-yellow-950/85 text-yellow-300 border-yellow-400/70 shadow-[0_0_10px_rgba(234,179,8,0.6)]' },
  ];

  poolConfig.forEach((cfg) => {
    for (let i = 0; i < cfg.count; i++) {
      // Natural distribution across an arched tree canopy:
      // x is between 12% and 88%
      const x = 12 + Math.random() * 76;
      // y follows an inverted parabola (highest canopy in center, drooping branches on sides)
      const normX = (x - 50) / 38; // -1 to 1
      const maxY = 68 - Math.pow(normX, 2) * 18;
      const minY = 10 + Math.abs(normX) * 10;
      const y = minY + Math.random() * (maxY - minY);

      items.push({
        id: idCounter++,
        label: cfg.label,
        type: cfg.type,
        value: cfg.value,
        isNeverWin: cfg.isNeverWin,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        stringLength: 10 + Math.floor(Math.random() * 16),
        colorClass: cfg.color,
        swayDelay: Math.round(Math.random() * 30) / 10,
        isPlucked: false,
      });
    }
  });

  return items;
};

// Individual random drop generators for the 4 categories
const getRandomDollarDrop = (): TreePluckReward => {
  return Math.random() < 0.65
    ? { type: 'usd', value: 1, label: '$1' }
    : { type: 'usd', value: 5, label: '$5' };
};

const getRandomDiamondDrop = (): TreePluckReward => {
  const r = Math.random();
  if (r < 0.45) return { type: 'diamond', value: 1, label: '1 💎' };
  if (r < 0.75) return { type: 'diamond', value: 3, label: '3 💎' };
  return { type: 'diamond', value: 5, label: '5 💎' };
};

const getRandomKeyDrop = (): TreePluckReward => {
  return Math.random() < 0.60
    ? { type: 'keys', value: 2, label: '2 🗝️' }
    : { type: 'keys', value: 7, label: '7 🗝️' };
};

const getRandomPointDrop = (): TreePluckReward => {
  return { type: 'points', value: 5000, label: '5,000 PTS' };
};

// Winnable drop selector for random drops (balanced across the 4 categories: $, diamond, key, point)
const pickSecretWinnableDrop = (): TreePluckReward => {
  const categories: ('usd' | 'diamond' | 'keys' | 'points')[] = ['usd', 'diamond', 'keys', 'points'];
  const cat = categories[Math.floor(Math.random() * categories.length)];
  switch (cat) {
    case 'usd':
      return getRandomDollarDrop();
    case 'diamond':
      return getRandomDiamondDrop();
    case 'keys':
      return getRandomKeyDrop();
    case 'points':
    default:
      return getRandomPointDrop();
  }
};

// Target-specific reward resolver: if player aims at a winnable item, they win it!
const getRewardForItem = (target?: HangingItem): TreePluckReward => {
  if (target && !target.isNeverWin) {
    return {
      type: target.type,
      value: target.value,
      label: target.label,
    };
  }
  return pickSecretWinnableDrop();
};

// Guaranteed mixed shake drops: every shake MUST randomly drop a mix containing $, diamond, key, and point
const generateMixedShakeDrops = (totalDrops: number = 10): TreePluckReward[] => {
  // Guaranteed mix: ensure ALL 4 categories ($, diamond, key, point) are present in the drop
  const drops: TreePluckReward[] = [
    getRandomDollarDrop(),
    getRandomDollarDrop(),
    getRandomDiamondDrop(),
    getRandomDiamondDrop(),
    getRandomKeyDrop(),
    getRandomKeyDrop(),
    getRandomPointDrop(),
    getRandomPointDrop(),
  ];

  // Fill remaining slots up to totalDrops with random picks across the 4 categories
  while (drops.length < totalDrops) {
    drops.push(pickSecretWinnableDrop());
  }

  // Thorough Fisher-Yates shuffle so the items drop in a completely mixed, randomized order
  for (let i = drops.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [drops[i], drops[j]] = [drops[j], drops[i]];
  }

  return drops;
};

// Distinct styling for falling drops by reward category
const getFallingBadgeClass = (type?: string) => {
  switch (type) {
    case 'usd':
      return 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 border-2 border-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.85)]';
    case 'diamond':
      return 'bg-gradient-to-b from-sky-300 to-cyan-500 text-slate-950 border-2 border-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.85)]';
    case 'keys':
      return 'bg-gradient-to-b from-amber-300 to-yellow-500 text-slate-950 border-2 border-yellow-100 shadow-[0_0_20px_rgba(234,179,8,0.85)]';
    case 'points':
    default:
      return 'bg-gradient-to-b from-purple-400 to-fuchsia-600 text-white border-2 border-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.85)]';
  }
};

interface TreePluckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnRewards: (rewards: TreePluckReward[]) => void;
  reserveBalance: number;
  diamonds: number;
  keys: number;
}

export const TreePluckModal: React.FC<TreePluckModalProps> = ({
  isOpen,
  onClose,
  onEarnRewards,
  reserveBalance,
  diamonds,
  keys,
}) => {
  const [treeItems, setTreeItems] = useState<HangingItem[]>([]);
  const [isActionActive, setIsActionActive] = useState(false);
  const [isTreeShaking, setIsTreeShaking] = useState(false);
  const [stoneProjectile, setStoneProjectile] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const [stickActive, setStickActive] = useState(false);
  const [fallingDrops, setFallingDrops] = useState<
    { id: number; label: string; type?: string; x: number; startY: number; delay: number }[]
  >([]);
  const [recentNotification, setRecentNotification] = useState<{ text: string; subtext: string } | null>(null);

  // 2 plays every 6 hours limit state & live countdown
  const [limitState, setLimitState] = useState<TreePluckLimitState>(getTreePluckLimit);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(() => {
    const lim = getTreePluckLimit();
    return Math.max(0, lim.cooldownExpiresAt - Date.now());
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize tree and sync limit countdown timer
  useEffect(() => {
    if (isOpen) {
      setTreeItems(generateTreeItems());
      setRecentNotification(null);
      setFallingDrops([]);

      const updateLimit = () => {
        const current = getTreePluckLimit();
        setLimitState(current);
        const rem = Math.max(0, current.cooldownExpiresAt - Date.now());
        setTimeRemainingMs(rem);
      };

      updateLimit();
      const interval = setInterval(updateLimit, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Throw Stone
  const handleThrowStone = (targetItem?: HangingItem) => {
    if (isActionActive || limitState.playsRemaining <= 0) return;

    // Deduct 1 play and update countdown
    const nextLimit = consumeTreePluckPlay();
    setLimitState(nextLimit);
    setTimeRemainingMs(Math.max(0, nextLimit.cooldownExpiresAt - Date.now()));

    setIsActionActive(true);
    soundFx.playWhoosh();

    // Select target
    const target =
      targetItem ||
      treeItems.filter((i) => !i.isPlucked)[
        Math.floor(Math.random() * treeItems.filter((i) => !i.isPlucked).length)
      ];

    const targetX = target ? target.x : 50;
    const targetY = target ? target.y : 35;

    // Launch stone projectile
    setStoneProjectile({ x: targetX, y: targetY, active: true });

    setTimeout(() => {
      soundFx.playTap(true);
      soundFx.playPluck();
      setStoneProjectile(null);

      // Reward based on target (or pick winnable drop)
      const won = getRewardForItem(target);

      // Pluck visual item
      if (target) {
        setTreeItems((prev) =>
          prev.map((item) => (item.id === target.id ? { ...item, isPlucked: true } : item))
        );
      }

      // Falling drop
      const dropId = Date.now();
      setFallingDrops([{ id: dropId, label: won.label, type: won.type, x: targetX, startY: targetY, delay: 0 }]);

      setTimeout(() => {
        soundFx.playReward();
        onEarnRewards([won]);
        setRecentNotification({
          text: `Plucked ${won.label}!`,
          subtext:
            won.type === 'usd'
              ? 'Added to Reserve Vault'
              : won.type === 'diamond'
              ? 'Added to Diamond Stash'
              : won.type === 'keys'
              ? 'Added to Keys Ring'
              : 'Added to Point Balance',
        });
        setFallingDrops([]);
        setIsActionActive(false);

        // Respawn item on tree after 4s
        if (target) {
          setTimeout(() => {
            setTreeItems((prev) =>
              prev.map((item) => (item.id === target.id ? { ...item, isPlucked: false } : item))
            );
          }, 4000);
        }
      }, 700);
    }, 450);
  };

  // 2. Use Long Stick
  const handleUseStick = () => {
    if (isActionActive || limitState.playsRemaining <= 0) return;

    // Deduct 1 play and update countdown
    const nextLimit = consumeTreePluckPlay();
    setLimitState(nextLimit);
    setTimeRemainingMs(Math.max(0, nextLimit.cooldownExpiresAt - Date.now()));

    setIsActionActive(true);
    soundFx.playWhoosh();
    setStickActive(true);

    const available = treeItems.filter((i) => !i.isPlucked);
    const target = available[Math.floor(Math.random() * available.length)];
    const targetX = target ? target.x : 50;
    const targetY = target ? target.y : 40;

    setTimeout(() => {
      soundFx.playPluck();
      setStickActive(false);

      const won = getRewardForItem(target);

      if (target) {
        setTreeItems((prev) =>
          prev.map((item) => (item.id === target.id ? { ...item, isPlucked: true } : item))
        );
      }

      setFallingDrops([
        { id: Date.now(), label: won.label, type: won.type, x: targetX, startY: targetY, delay: 0 },
      ]);

      setTimeout(() => {
        soundFx.playReward();
        onEarnRewards([won]);
        setRecentNotification({
          text: `Knocked down ${won.label}!`,
          subtext:
            won.type === 'usd'
              ? 'Added to Reserve Vault'
              : won.type === 'diamond'
              ? 'Added to Diamond Stash'
              : won.type === 'keys'
              ? 'Added to Keys Ring'
              : 'Added to Point Balance',
        });
        setFallingDrops([]);
        setIsActionActive(false);

        if (target) {
          setTimeout(() => {
            setTreeItems((prev) =>
              prev.map((item) => (item.id === target.id ? { ...item, isPlucked: false } : item))
            );
          }, 4000);
        }
      }, 700);
    }, 550);
  };

  // 3. Shake Tree (Up to 10 rewards fall!)
  const handleShakeTree = () => {
    if (isActionActive || limitState.playsRemaining <= 0) return;

    // Deduct 1 play and update countdown
    const nextLimit = consumeTreePluckPlay();
    setLimitState(nextLimit);
    setTimeRemainingMs(Math.max(0, nextLimit.cooldownExpiresAt - Date.now()));

    setIsActionActive(true);
    setIsTreeShaking(true);
    soundFx.playTreeShake();
    soundFx.triggerHaptic();

    // Generate guaranteed mixed drops containing $, diamond, key, and point
    const dropCount = 10;
    const dropsToAward = generateMixedShakeDrops(dropCount);
    const visualDrops: { id: number; label: string; type: string; x: number; startY: number; delay: number }[] = [];

    // Match plucked items from tree canopy for each drop type so tree visually drops them
    const pluckedIds: number[] = [];
    const usedIds = new Set<number>();

    dropsToAward.forEach((won, i) => {
      const matching = treeItems.find(
        (item) => !item.isPlucked && !usedIds.has(item.id) && item.type === won.type
      );
      const fallback = treeItems.find((item) => !item.isPlucked && !usedIds.has(item.id));
      const chosenItem = matching || fallback;

      if (chosenItem) {
        usedIds.add(chosenItem.id);
        pluckedIds.push(chosenItem.id);
      }

      visualDrops.push({
        id: Date.now() + i,
        label: won.label,
        type: won.type,
        x: chosenItem ? chosenItem.x : 15 + Math.random() * 70,
        startY: chosenItem ? chosenItem.y : 20 + Math.random() * 30,
        delay: i * 75,
      });
    });

    // Mark plucked items
    setTreeItems((prev) =>
      prev.map((item) => (pluckedIds.includes(item.id) ? { ...item, isPlucked: true } : item))
    );

    // Stop tree shaking after 1.1s
    setTimeout(() => {
      setIsTreeShaking(false);
      setFallingDrops(visualDrops);

      // Sound chimes
      setTimeout(() => {
        soundFx.playReward();
        onEarnRewards(dropsToAward);

        let totalUsd = 0;
        let totalDiamonds = 0;
        let totalKeys = 0;
        let totalPoints = 0;

        dropsToAward.forEach((d) => {
          if (d.type === 'usd') totalUsd += d.value;
          if (d.type === 'diamond') totalDiamonds += d.value;
          if (d.type === 'keys') totalKeys += d.value;
          if (d.type === 'points' || (d as any).type === 'coins') totalPoints += d.value;
        });

        const earnedParts: string[] = [];
        if (totalUsd > 0) earnedParts.push(`+$${totalUsd.toFixed(2)} USD`);
        if (totalDiamonds > 0) earnedParts.push(`+${totalDiamonds} 💎`);
        if (totalKeys > 0) earnedParts.push(`+${totalKeys} 🗝️`);
        if (totalPoints > 0) earnedParts.push(`+${totalPoints.toLocaleString()} PTS`);

        setRecentNotification({
          text: `Tree Shaken! Mixed Drops Collected!`,
          subtext: earnedParts.join(' • ') || 'Mixed rewards collected!',
        });

        setTimeout(() => {
          setFallingDrops([]);
          setIsActionActive(false);

          // Restock plucked items over time
          setTimeout(() => {
            setTreeItems((prev) =>
              prev.map((item) => (pluckedIds.includes(item.id) ? { ...item, isPlucked: false } : item))
            );
          }, 5000);
        }, 800);
      }, 700);
    }, 1100);
  };

  const handleClose = () => {
    if (isActionActive) return;
    soundFx.playClick();
    onClose();
  };

  const isOutOfPlays = limitState.playsRemaining <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 select-none font-sans">
      <div
        ref={containerRef}
        className="relative w-full max-w-lg h-[92vh] max-h-[850px] rounded-3xl bg-gradient-to-b from-[#06180c] via-[#041208] to-[#020804] border-2 border-emerald-500/60 shadow-[0_0_80px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col items-center justify-between"
      >
        {/* Top Header & Balances */}
        <div className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-black border-b border-emerald-500/30 z-20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)] shrink-0">
              <TreePine className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-emerald-200 tracking-wider font-['Rajdhani',sans-serif]">
                  TREE PLUCK
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/25 text-[9px] font-extrabold text-emerald-300 border border-emerald-400/40">
                  PLAYGROUND
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-400/70">Over 120 Notes & Gems on Canopy</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 2x Every 6h Plays Limit Indicator & Countdown */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
                isOutOfPlays
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {/* Visual 2-dot indicator */}
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    limitState.playsRemaining >= 1
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-slate-600'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    limitState.playsRemaining >= 2
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-slate-600'
                  }`}
                />
              </div>
              <span className="font-mono font-bold">
                {limitState.playsRemaining}/2
              </span>
              {timeRemainingMs > 0 && limitState.playsRemaining < 2 && (
                <span className="text-[10px] font-mono text-amber-300 ml-0.5 border-l border-white/20 pl-1.5 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatCooldownTime(timeRemainingMs)}
                </span>
              )}
            </div>

            {/* Live Vault / Diamond badges */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-xs">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-emerald-200">${reserveBalance.toFixed(2)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-950/50 border border-sky-500/30 text-xs">
              <Gem className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-sky-200">{diamonds}</span>
            </div>

            <button
              onClick={handleClose}
              disabled={isActionActive}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Notification Toast */}
        {recentNotification && (
          <div className="absolute top-16 z-30 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.5)] text-center animate-in slide-in-from-top-4 duration-200">
            <div className="text-sm font-black text-white font-['Rajdhani',sans-serif] flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
              <span>{recentNotification.text}</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-300 mt-0.5">
              {recentNotification.subtext}
            </div>
          </div>
        )}

        {/* Tree Playground Area */}
        <div className="relative w-full flex-1 overflow-hidden flex flex-col justify-end items-center">
          {/* Ambient Sunlight & Forest Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-yellow-400/10 blur-3xl pointer-events-none" />

          {/* SVG Tree Art & Canopy (Animated on Shake) */}
          <div
            className={`relative w-full h-[95%] transition-transform duration-150 ${
              isTreeShaking ? 'animate-[wiggle_0.15s_ease-in-out_infinite]' : ''
            }`}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 400 480"
              preserveAspectRatio="xMidYMax meet"
            >
              <defs>
                {/* Foliage Gradients */}
                <radialGradient id="canopyGrad1" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#15803d" />
                  <stop offset="100%" stopColor="#052e16" />
                </radialGradient>
                <radialGradient id="canopyGrad2" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="60%" stopColor="#166534" />
                  <stop offset="100%" stopColor="#052e16" />
                </radialGradient>
                {/* Trunk Gradient */}
                <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="40%" stopColor="#78350f" />
                  <stop offset="80%" stopColor="#92400e" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
              </defs>

              {/* Massive Tree Trunk */}
              <path
                d="M 175 480 C 180 380, 185 300, 160 210
                   C 140 160, 110 130, 80 110
                   C 105 130, 145 165, 175 220
                   C 185 240, 195 210, 200 130
                   C 210 210, 220 240, 230 220
                   C 260 165, 300 130, 325 110
                   C 295 130, 265 160, 245 210
                   C 220 300, 225 380, 235 480 Z"
                fill="url(#trunkGrad)"
              />

              {/* Branch Spreaders */}
              <path
                d="M 170 260 C 130 230, 90 220, 45 230 C 85 245, 130 255, 175 285 Z"
                fill="#5c2b09"
              />
              <path
                d="M 230 260 C 270 230, 310 220, 355 230 C 315 245, 270 255, 225 285 Z"
                fill="#5c2b09"
              />

              {/* Lush Canopy Foliage Layers */}
              {/* Back foliage */}
              <circle cx="120" cy="150" r="85" fill="#064e3b" opacity="0.8" />
              <circle cx="280" cy="150" r="85" fill="#064e3b" opacity="0.8" />
              <circle cx="200" cy="95" r="95" fill="#064e3b" opacity="0.8" />

              {/* Mid foliage clusters */}
              <circle cx="95" cy="180" r="80" fill="url(#canopyGrad1)" />
              <circle cx="305" cy="180" r="80" fill="url(#canopyGrad1)" />
              <circle cx="150" cy="110" r="85" fill="url(#canopyGrad2)" />
              <circle cx="250" cy="110" r="85" fill="url(#canopyGrad2)" />
              <circle cx="200" cy="130" r="90" fill="url(#canopyGrad1)" />
              <circle cx="70" cy="220" r="65" fill="url(#canopyGrad1)" />
              <circle cx="330" cy="220" r="65" fill="url(#canopyGrad1)" />
              <circle cx="200" cy="190" r="75" fill="url(#canopyGrad2)" />
            </svg>

            {/* Over 120 Hanging Notes, Keys, Gems & Points on the Tree */}
            <div className="absolute inset-0 pointer-events-auto">
              {treeItems.map((item) => {
                if (item.isPlucked) return null;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isOutOfPlays && !isActionActive) {
                        handleThrowStone(item);
                      }
                    }}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      animation: `sway 2.5s ease-in-out infinite alternate ${item.swayDelay}s`,
                    }}
                    className={`absolute -translate-x-1/2 flex flex-col items-center z-10 transition-transform duration-150 ${
                      isOutOfPlays || isActionActive
                        ? 'cursor-not-allowed opacity-70'
                        : 'cursor-pointer group hover:scale-125'
                    }`}
                    title={isOutOfPlays ? 'Cooldown active' : `Click to pluck ${item.label}`}
                  >
                    {/* Hanging String from Branch */}
                    <div
                      style={{ height: `${item.stringLength}px` }}
                      className="w-[1.5px] bg-amber-400/40 group-hover:bg-amber-300"
                    />

                    {/* Note Tag / Gem */}
                    <div
                      className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black border shadow-md whitespace-nowrap transition group-hover:ring-2 group-hover:ring-white/80 ${item.colorClass}`}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stone Projectile Flying into Tree */}
            {stoneProjectile && (
              <div
                style={{
                  left: `${stoneProjectile.x}%`,
                  top: `${stoneProjectile.y}%`,
                  transition: 'all 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-400 border-2 border-slate-200 shadow-[0_0_15px_white] flex items-center justify-center text-xs z-30 pointer-events-none"
              >
                🪨
              </div>
            )}

            {/* Long Stick Knocking Effect */}
            {stickActive && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-64 bg-gradient-to-t from-amber-900 to-amber-500 rounded-t-full origin-bottom shadow-2xl z-30 pointer-events-none"
                style={{
                  animation: 'stickPoke 0.55s ease-in-out forwards',
                }}
              />
            )}

            {/* Plucked Items Falling Down with Physics */}
            {fallingDrops.map((drop) => (
              <div
                key={drop.id}
                style={{
                  left: `${drop.x}%`,
                  top: `${drop.startY}%`,
                  animation: `dropFall 0.7s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards ${drop.delay}ms`,
                }}
                className={`absolute -translate-x-1/2 px-2.5 py-1 rounded-xl font-black text-xs z-40 pointer-events-none whitespace-nowrap shadow-lg ${getFallingBadgeClass(
                  drop.type
                )}`}
              >
                {drop.label}
              </div>
            ))}
          </div>

          {/* Grassy Ground Terrain */}
          <div className="relative w-full h-16 bg-gradient-to-t from-[#021808] via-[#052b11] to-transparent border-t border-emerald-600/30 flex items-center justify-around px-2 z-20">
            {/* Decorative Grass Tufts */}
            <div className="absolute -top-3 left-6 text-emerald-500/60 text-lg select-none">🌱</div>
            <div className="absolute -top-3 left-1/3 text-emerald-400/50 text-base select-none">🌿</div>
            <div className="absolute -top-3 right-1/4 text-emerald-500/60 text-lg select-none">🌱</div>
            <div className="absolute -top-3 right-8 text-emerald-400/50 text-base select-none">🌿</div>
          </div>
        </div>

        {/* Floor Interactive Tools (Stone, Long Stick, 🤜 Shake Tree) */}
        <div className="w-full px-3 sm:px-4 py-3 bg-gradient-to-t from-black via-[#041006] to-[#071a0c] border-t border-emerald-500/40 z-30 flex flex-col gap-2">
          {/* Time Countdown and Indicator Bar */}
          {isOutOfPlays ? (
            <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-rose-950/80 border border-rose-500/40 text-center flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[11px] font-mono font-bold text-rose-300">
                  0/2 Plays
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-extrabold text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Refill in {formatCooldownTime(timeRemainingMs)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-emerald-400/80 font-bold px-1">
              <div className="flex items-center gap-1.5">
                <span>FLOOR TOOLS</span>
                <span className="text-emerald-300 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-emerald-400" />
                  {limitState.playsRemaining}/2 Plays
                </span>
              </div>
              {timeRemainingMs > 0 && limitState.playsRemaining < 2 ? (
                <span className="text-amber-300 font-mono text-[10px] flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Refill in {formatCooldownTime(timeRemainingMs)}
                </span>
              ) : (
                <span>Pluck notes or shake for up to 10 drops!</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Tool 1: Throw Stone */}
            <button
              id="btn-tree-throw-stone"
              onClick={() => handleThrowStone()}
              disabled={isActionActive || isOutOfPlays}
              className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center transition active:scale-95 group shadow-md ${
                isOutOfPlays
                  ? 'bg-slate-900/40 border-slate-700/40 opacity-40 cursor-not-allowed'
                  : 'bg-[#0e2416] hover:bg-[#143320] border-emerald-500/40 hover:border-emerald-400 disabled:opacity-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-400 flex items-center justify-center text-slate-200 shadow-inner group-hover:scale-110 transition">
                🪨
              </div>
              <span className="text-xs font-black text-emerald-200 mt-1 font-['Rajdhani',sans-serif]">
                STONE
              </span>
              <span className="text-[9px] text-slate-400">Throw & Pluck</span>
            </button>

            {/* Tool 2: Long Stick */}
            <button
              id="btn-tree-long-stick"
              onClick={handleUseStick}
              disabled={isActionActive || isOutOfPlays}
              className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center transition active:scale-95 group shadow-md ${
                isOutOfPlays
                  ? 'bg-slate-900/40 border-slate-700/40 opacity-40 cursor-not-allowed'
                  : 'bg-[#0e2416] hover:bg-[#143320] border-emerald-500/40 hover:border-emerald-400 disabled:opacity-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-950/80 border-2 border-amber-600 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-110 transition">
                🎋
              </div>
              <span className="text-xs font-black text-emerald-200 mt-1 font-['Rajdhani',sans-serif]">
                LONG STICK
              </span>
              <span className="text-[9px] text-slate-400">Poke & Knock</span>
            </button>

            {/* Tool 3: 🤜 Shake Tree */}
            <button
              id="btn-tree-shake"
              onClick={handleShakeTree}
              disabled={isActionActive || isOutOfPlays}
              className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center transition active:scale-95 group ${
                isOutOfPlays
                  ? 'bg-slate-900/40 border-slate-700/40 opacity-40 cursor-not-allowed'
                  : 'bg-gradient-to-b from-amber-500/25 to-emerald-950/70 hover:from-amber-500/35 hover:to-emerald-900 border-amber-400/70 hover:border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] disabled:opacity-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/30 border-2 border-amber-300 flex items-center justify-center text-xl group-hover:scale-110 transition">
                🤜
              </div>
              <span className="text-xs font-black text-amber-200 mt-1 font-['Rajdhani',sans-serif]">
                SHAKE TREE
              </span>
              <span className="text-[9px] text-amber-300/80">Drop up to 10!</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global CSS Keyframes for Sway, Stick Poke & Drop Fall */}
      <style>{`
        @keyframes sway {
          0% { transform: translate(-50%, 0) rotate(-4deg); }
          100% { transform: translate(-50%, 0) rotate(4deg); }
        }
        @keyframes stickPoke {
          0% { transform: translate(-50%, 60px) rotate(-15deg); opacity: 0; }
          40% { transform: translate(-50%, -120px) rotate(10deg); opacity: 1; }
          100% { transform: translate(-50%, 80px) rotate(0deg); opacity: 0; }
        }
        @keyframes dropFall {
          0% { transform: translate(-50%, 0) scale(1.2) rotate(0deg); opacity: 1; }
          70% { transform: translate(-50%, 260px) scale(1) rotate(180deg); opacity: 1; }
          100% { transform: translate(-50%, 340px) scale(0.9) rotate(360deg); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(-1.5deg) translateX(-4px); }
          75% { transform: rotate(1.5deg) translateX(4px); }
        }
      `}</style>
    </div>
  );
};
