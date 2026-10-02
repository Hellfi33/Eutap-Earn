import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Coins,
  TrendingUp,
  Zap,
  Gamepad2,
  Gift,
  Copy,
  Check,
  Sparkles,
  Flame,
  Key,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Sliders,
  Layers,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface InfoCarouselTabProps {
  coins?: number;
  tapLevel?: number;
  reserveBalance?: number;
  diamonds?: number;
  masterKeys?: number;
  profitPerHour?: number;
  onOpenRouletteStake?: () => void;
  onOpenAirdrop?: () => void;
  onOpenMine?: () => void;
  goldCoinImg?: string;
}

export const InfoCarouselTab: React.FC<InfoCarouselTabProps> = ({
  coins = 0,
  tapLevel = 1,
  reserveBalance = 0,
  diamonds = 0,
  masterKeys = 0,
  profitPerHour = 0,
  onOpenRouletteStake,
  onOpenAirdrop,
  onOpenMine,
  goldCoinImg,
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [calcStakeInput, setCalcStakeInput] = useState<number>(1000);
  const [viewMode, setViewMode] = useState<'carousel' | 'columns'>('carousel');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Live dynamic community counter (progresses by random increase signaling new members joining)
  const [communityCount, setCommunityCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eutap_total_community');
      const savedTime = localStorage.getItem('eutap_total_community_time');
      const base = 2480000;
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= base) {
          if (savedTime) {
            const elapsedSec = Math.floor((Date.now() - parseInt(savedTime, 10)) / 1000);
            if (elapsedSec > 0) {
              const catchup = Math.min(25000, Math.floor(elapsedSec * 0.3) + Math.floor(Math.random() * 4));
              const updated = parsed + catchup;
              localStorage.setItem('eutap_total_community', updated.toString());
              localStorage.setItem('eutap_total_community_time', Date.now().toString());
              return updated;
            }
          }
          return parsed;
        }
      }
      const initial = base + Math.floor(Math.random() * 180) + 12;
      localStorage.setItem('eutap_total_community', initial.toString());
      localStorage.setItem('eutap_total_community_time', Date.now().toString());
      return initial;
    } catch {
      return 2480000;
    }
  });

  const [recentIncrement, setRecentIncrement] = useState<number>(0);

  // Random member joining progression loop
  useEffect(() => {
    let timerId: number;

    const scheduleNextJoin = () => {
      // Random delay between 2.2s and 5.8s
      const delay = Math.floor(Math.random() * 3600) + 2200;
      timerId = window.setTimeout(() => {
        // Random increase of 1 to 4 new members (with occasional burst of 5-8)
        const isBurst = Math.random() < 0.15;
        const addAmount = isBurst
          ? Math.floor(Math.random() * 4) + 5
          : Math.floor(Math.random() * 4) + 1;

        setCommunityCount((prev) => {
          const next = prev + addAmount;
          try {
            localStorage.setItem('eutap_total_community', next.toString());
            localStorage.setItem('eutap_total_community_time', Date.now().toString());
          } catch {}
          return next;
        });

        setRecentIncrement(addAmount);
        setTimeout(() => setRecentIncrement(0), 1600);

        scheduleNextJoin();
      }, delay);
    };

    scheduleNextJoin();
    return () => clearTimeout(timerId);
  }, []);

  const contractAddress = '0x71e98B4a54c2a7E8E42cE19D38F023e414EUTAP';

  // Smooth scroll to top helper
  const scrollToTop = () => {
    soundFx.playClick();
    const viewport = document.getElementById('info-scroll-viewport');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to a specific column box anchor in "All 5" mode
  const scrollToBox = (index: number) => {
    soundFx.playClick();
    if (viewMode === 'carousel') {
      setActiveSlide(index);
      scrollToTop();
    } else {
      const el = document.getElementById(`info-box-column-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Track scroll position to show floating scroll-to-top button
  useEffect(() => {
    const viewport = document.getElementById('info-scroll-viewport');
    if (!viewport) return;

    const handleScroll = () => {
      if (viewport.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyContract = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  const handleNextSlide = () => {
    soundFx.playClick();
    setActiveSlide((prev) => (prev + 1) % 5);
    scrollToTop();
  };

  const handlePrevSlide = () => {
    soundFx.playClick();
    setActiveSlide((prev) => (prev - 1 + 5) % 5);
    scrollToTop();
  };

  const handleSelectSlide = (index: number) => {
    soundFx.playClick();
    setActiveSlide(index);
    scrollToTop();
  };

  // 5 distinct column box configurations
  const columns = [
    {
      id: 0,
      title: 'Ecosystem & Overview',
      shortTitle: 'Overview',
      badge: 'Core Protocol',
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      tagline: 'Next-gen Web3 tap-to-earn ecosystem with proof of reserve',
      glowColor: 'from-cyan-500/15 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-500/30',
      activeTabColor: 'text-cyan-300 border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    },
    {
      id: 1,
      title: 'Tokenomics & Staking',
      shortTitle: 'Economics',
      badge: 'Economics',
      icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
      tagline: '10 Billion $EUTAP fixed supply with dynamic staking APY',
      glowColor: 'from-amber-500/15 via-yellow-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      activeTabColor: 'text-amber-300 border-amber-400 bg-amber-950/60 shadow-[0_0_12px_rgba(251,191,36,0.4)]',
    },
    {
      id: 2,
      title: 'Mining & Tap Levels',
      shortTitle: 'Progression',
      badge: 'Progression',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      tagline: 'Quantum Nexus 30-level upgrade path and tap rate scaling',
      glowColor: 'from-emerald-500/15 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      activeTabColor: 'text-emerald-300 border-emerald-400 bg-emerald-950/60 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    },
    {
      id: 3,
      title: 'Mini-Games & Hub',
      shortTitle: 'Games',
      badge: 'Play & Win',
      icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
      tagline: 'Roulette 65, Lucky Spin, Wheel of Fortune & daily challenges',
      glowColor: 'from-purple-500/15 via-indigo-500/10 to-transparent',
      borderColor: 'border-purple-500/30',
      activeTabColor: 'text-purple-300 border-purple-400 bg-purple-950/60 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    },
    {
      id: 4,
      title: 'Airdrop & Roadmap',
      shortTitle: 'Airdrop',
      badge: 'Distribution',
      icon: <Gift className="w-4 h-4 text-rose-400" />,
      tagline: 'Multi-network withdrawal requirements and listing phases',
      glowColor: 'from-rose-500/15 via-pink-500/10 to-transparent',
      borderColor: 'border-rose-500/30',
      activeTabColor: 'text-rose-300 border-rose-400 bg-rose-950/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    },
  ];

  /* ---------------- BOX 1 CONTENT ---------------- */
  const renderBox1 = () => (
    <div className="space-y-3.5 text-xs text-slate-300">
      <p className="leading-relaxed">
        EuTap is a high-speed cryptographic tap-to-earn ecosystem backed by a verifiable cash reserve. Every active tap, card upgrade, and daily quest connects directly to on-chain liquidity.
      </p>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Community</span>
            <span className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <div className="text-sm font-black text-cyan-300 font-mono tracking-tight">
              {communityCount.toLocaleString()}+
            </div>
            {recentIncrement > 0 && (
              <span className="text-[9px] font-bold text-emerald-400 font-mono animate-in fade-in zoom-in-75 duration-200">
                +{recentIncrement}
              </span>
            )}
          </div>
          <span className="text-[9px] text-emerald-400 font-medium">● Mainnet Ready</span>
        </div>
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Supported Chains</span>
          <div className="text-sm font-black text-amber-300 font-mono mt-0.5">TON • SOL • BASE</div>
          <span className="text-[9px] text-slate-500">Multi-Chain Bridge</span>
        </div>
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Phase</span>
          <div className="text-sm font-black text-emerald-300 font-mono mt-0.5">Phase II: Nexus</div>
          <span className="text-[9px] text-cyan-400">30 Tap Levels Active</span>
        </div>
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Live Reserve</span>
          <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
            ${(reserveBalance || 0).toFixed(2)} USD
          </div>
          <span className="text-[9px] text-slate-400">Withdrawable Cash</span>
        </div>
      </div>

      {/* Smart Contract Card */}
      <div className="p-3 bg-[#111624] border border-cyan-500/20 rounded-2xl space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            $EUTAP Verified Smart Contract
          </span>
          <span className="text-[10px] font-mono text-cyan-400">Audited</span>
        </div>
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5">
          <code className="text-[11px] font-mono text-slate-300 truncate max-w-[200px]">
            {contractAddress}
          </code>
          <button
            onClick={handleCopyContract}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 transition"
            title="Copy Contract"
          >
            {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Core Protocol Pillars */}
      <div className="space-y-1.5">
        <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
          Core Protocol Pillars:
        </span>
        <div className="flex items-start gap-2 p-2.5 bg-white/5 rounded-xl border border-white/5">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Fair Launch Tapping:</strong> 70% of total token supply is distributed to active players through tapping and quests. No VC private allocations.
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 bg-white/5 rounded-xl border border-white/5">
          <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Master Key Decryption:</strong> Staking keys gathered in daily ciphers and wheel spins unlocks high-limit withdrawal corridors.
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------- BOX 2 CONTENT ---------------- */
  const renderBox2 = () => (
    <div className="space-y-3.5 text-xs text-slate-300">
      <p className="leading-relaxed">
        The $EUTAP token has a hard cap of 10 Billion units. Dynamic staking yields provide ongoing liquidity incentives with transparent distribution schedules.
      </p>

      {/* Allocation Breakdown */}
      <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Token Allocation</span>
          <span className="text-amber-400 font-mono">10,000,000,000 Total</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="text-slate-300">Community Airdrop & Taps</span>
            </div>
            <span className="font-mono font-bold text-white">70% (7.0B)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-slate-300">DEX / CEX Liquidity Provision</span>
            </div>
            <span className="font-mono font-bold text-white">15% (1.5B)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
              <span className="text-slate-300">Ecosystem Grants & Rewards</span>
            </div>
            <span className="font-mono font-bold text-white">10% (1.0B)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-slate-300">Core Team (18-mo Linear Vest)</span>
            </div>
            <span className="font-mono font-bold text-white">5% (0.5B)</span>
          </div>
        </div>

        <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800">
          <div style={{ width: '70%' }} className="bg-cyan-400" />
          <div style={{ width: '15%' }} className="bg-emerald-400" />
          <div style={{ width: '10%' }} className="bg-purple-400" />
          <div style={{ width: '5%' }} className="bg-amber-400" />
        </div>
      </div>

      {/* Staking APY Simulator */}
      <div className="p-3 bg-[#111726] border border-amber-500/30 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Dynamic Staking Simulator
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">18.5% Base APY</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Simulated Stake:</span>
          <span className="font-mono font-bold text-white">{(calcStakeInput || 0).toLocaleString()} $EUTAP</span>
        </div>

        <input
          type="range"
          min="100"
          max="50000"
          step="100"
          value={calcStakeInput}
          onChange={(e) => setCalcStakeInput(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-black/60 rounded-lg"
        />

        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="p-2 bg-black/40 rounded-xl border border-white/5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Monthly Yield</span>
            <span className="text-xs font-black text-amber-300 font-mono">
              +{Math.round(((calcStakeInput || 0) * 0.185) / 12).toLocaleString()} $EUTAP
            </span>
          </div>
          <div className="p-2 bg-black/40 rounded-xl border border-white/5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Annual Yield</span>
            <span className="text-xs font-black text-emerald-400 font-mono">
              +{Math.round((calcStakeInput || 0) * 0.185).toLocaleString()} $EUTAP
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------- BOX 3 CONTENT ---------------- */
  const renderBox3 = () => (
    <div className="space-y-3.5 text-xs text-slate-300">
      <p className="leading-relaxed">
        Your tap multiplier scales with each level up. Stage II opens up the Quantum Nexus across 30 total levels with automatic mining boosters and maximum energy capacity.
      </p>

      {/* Current Level Card */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-[#131d24] to-[#0e1620] border border-emerald-500/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex flex-col items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-[9px] font-bold uppercase leading-none">Level</span>
            <span className="text-lg font-black font-mono leading-none mt-0.5">{tapLevel}</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-white font-['Rajdhani',sans-serif]">
              {tapLevel >= 20 ? 'Grandmaster Cyber Lord' : tapLevel >= 10 ? 'Quantum Pioneer' : 'Initiate Miner'}
            </h4>
            <p className="text-[11px] text-slate-400">
              Tap Rate: <strong className="text-emerald-400">+{tapLevel * 2}</strong> per tap
            </p>
          </div>
        </div>

        {onOpenMine && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenMine();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1 active:scale-95"
          >
            <span>Upgrade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Milestone Unlock Thresholds */}
      <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2 text-xs">
        <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
          Milestone Unlock Thresholds:
        </span>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Level 7: Wheel of Fortune</span>
            <span className="text-amber-400 font-mono font-bold">Unlocks Cash & Key Wheel</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Level 9: Tree Pluck</span>
            <span className="text-emerald-400 font-mono font-bold">Secret Daily Mystery Drops</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Level 12: Lay & Hatch</span>
            <span className="text-cyan-400 font-mono font-bold">Rare Cyber Egg Bounties</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Level 15: Dice & Level 17: H&L</span>
            <span className="text-purple-400 font-mono font-bold">High Speed Light Spins</span>
          </div>
        </div>
      </div>

      {/* Passive PPH Card */}
      <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-medium">Profit Per Hour (PPH):</span>
        </div>
        <span className="font-mono font-black text-amber-400">
          +{(profitPerHour || 0).toLocaleString()} /hr
        </span>
      </div>
    </div>
  );

  /* ---------------- BOX 4 CONTENT ---------------- */
  const renderBox4 = () => (
    <div className="space-y-3.5 text-xs text-slate-300">
      <p className="leading-relaxed">
        EuTap hosts provably fair mini-games. Stake from your $ Reserve or free daily spins to win diamonds, master keys, and coin drops.
      </p>

      {/* Roulette 65 Spotlight */}
      <div className="p-3 bg-gradient-to-r from-amber-950/40 via-[#1d1624] to-[#120f18] border border-amber-500/40 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-xs font-mono">
              65
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Standard 65-Pocket Roulette</h4>
              <span className="text-[10px] text-amber-400 font-medium">Auto-Spin every 60s</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Up to 65x Win
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Stake from your $ Reserve. Place chips on <strong className="text-rose-400">RED (2x)</strong>, <strong className="text-slate-300">BLACK (2x)</strong>, <strong className="text-emerald-400">0 GREEN (35x)</strong>, or single numbers for up to <strong className="text-amber-400">65x</strong>.
        </p>

        {onOpenRouletteStake && (
          <button
            id="btn-info-launch-roulette"
            onClick={() => {
              soundFx.playClick();
              onOpenRouletteStake();
            }}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Enter Roulette 65 Table</span>
          </button>
        )}
      </div>

      {/* Mini-Games Summary Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="font-bold text-white block">Lucky Wheel</span>
          <span className="text-[10px] text-slate-400">5 Daily Spins for Cash, Diamonds & Keys</span>
        </div>
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="font-bold text-white block">Daily Morse Cipher</span>
          <span className="text-[10px] text-slate-400">Solve daily word for 1,000,000 coins</span>
        </div>
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="font-bold text-white block">3-Card Combo</span>
          <span className="text-[10px] text-slate-400">Unlock 3 daily cards for 5,000,000 coins</span>
        </div>
        <div className="p-2.5 bg-black/40 border border-white/10 rounded-2xl">
          <span className="font-bold text-white block">Wheel of Fortune</span>
          <span className="text-[10px] text-slate-400">Unlocked at Lv.7 for high stakes</span>
        </div>
      </div>
    </div>
  );

  /* ---------------- BOX 5 CONTENT ---------------- */
  const renderBox5 = () => (
    <div className="space-y-3.5 text-xs text-slate-300">
      <p className="leading-relaxed">
        The $EUTAP Airdrop snapshot takes place at the end of Season 1. Your allocation is determined by points mined, PPH, Master Keys held, and tap level achievements.
      </p>

      {/* Qualification Checklist */}
      <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2 text-xs">
        <div className="flex items-center justify-between font-bold text-slate-200">
          <span>Airdrop Criteria Checklist</span>
          <span className="text-rose-400 font-mono text-[10px]">Season 1 Snapshot</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Tap Level Progress (Lv. ≥ 5)</span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Lv.{tapLevel} (Eligible)
            </span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Master Keys Held in Vault</span>
            <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
              <Key className="w-3 h-3" /> {masterKeys} Keys
            </span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">Total Coins Mined</span>
            <span className="font-mono font-bold text-cyan-300">
              {(coins || 0).toLocaleString()} $EUTAP
            </span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
            <span className="text-slate-300">$ Reserve Balance</span>
            <span className="font-mono font-bold text-emerald-400">
              ${(reserveBalance || 0).toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Roadmap Phases */}
      <div className="p-3 bg-[#171220] border border-rose-500/20 rounded-2xl space-y-2 text-xs">
        <span className="font-bold text-white block text-[11px] uppercase tracking-wider">
          Upcoming Roadmap Milestones:
        </span>
        <div className="space-y-1 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span><strong>Q3 2026:</strong> Community Mining, Roulette 65 & Morse Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span><strong>Q4 2026:</strong> On-Chain Airdrop Claim & DEX Token Listing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            <span><strong>Q1 2027:</strong> Multi-chain DAO Staking & Guild Battles</span>
          </div>
        </div>
      </div>

      {onOpenAirdrop && (
        <button
          id="btn-info-open-airdrop-portal"
          onClick={() => {
            soundFx.playClick();
            onOpenAirdrop();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md"
        >
          <Gift className="w-4 h-4" />
          <span>Go to On-Chain Airdrop Tab</span>
        </button>
      )}
    </div>
  );

  const boxRenderers = [renderBox1, renderBox2, renderBox3, renderBox4, renderBox5];

  return (
    <div className="flex flex-col px-3 sm:px-4 pt-2 pb-36 max-w-lg mx-auto select-none">
      {/* Top Header Card */}
      <div className="flex flex-col items-center text-center mt-1 mb-3">
        <div className="relative mb-2">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-700/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.35)]">
            <span className="font-['Rajdhani',sans-serif] font-black text-2xl sm:text-3xl text-cyan-300 tracking-wider">
              I
            </span>
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-cyan-500 text-slate-950 font-black text-[9px] font-mono shadow">
            5 COLS
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
          <span>Information & Knowledge Hub</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
          Scroll through the 5 comprehensive columns below to view complete mechanics, tokenomics, leveling, and airdrop rules.
        </p>
      </div>

      {/* Sticky Top Navigation & Mode Selector */}
      <div className="sticky top-0 z-20 bg-[#0c1017]/95 backdrop-blur-md pt-1 pb-2.5 mb-2 -mx-2 px-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {viewMode === 'carousel' ? 'CAROUSEL MODE' : 'CONTINUOUS SCROLL (ALL 5)'}
            </span>
            {viewMode === 'carousel' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                Box {activeSlide + 1} of 5
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-black/60 border border-white/10 p-0.5 rounded-lg text-[10px]">
            <button
              id="btn-info-view-carousel"
              onClick={() => {
                soundFx.playClick();
                setViewMode('carousel');
                scrollToTop();
              }}
              className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
                viewMode === 'carousel'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Carousel</span>
            </button>
            <button
              id="btn-info-view-all5"
              onClick={() => {
                soundFx.playClick();
                setViewMode('columns');
                scrollToTop();
              }}
              className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
                viewMode === 'columns'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>All 5 Columns</span>
            </button>
          </div>
        </div>

        {/* 5 Column Selector Strip */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#121624] border border-white/10 rounded-2xl shadow-inner">
          {columns.map((col, idx) => {
            const isSelected = activeSlide === idx;
            return (
              <button
                key={col.id}
                id={`btn-info-tab-${idx}`}
                onClick={() => scrollToBox(idx)}
                className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  viewMode === 'carousel' && isSelected
                    ? `${col.activeTabColor} font-bold scale-[1.02]`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={col.title}
              >
                <div className="mb-0.5">{col.icon}</div>
                <span className="text-[10px] font-black font-['Rajdhani',sans-serif] tracking-wider leading-none truncate max-w-full">
                  #{idx + 1}
                </span>
                <span className="text-[8px] font-medium text-slate-400 leading-none truncate max-w-full mt-0.5">
                  {col.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'carousel' ? (
        /* ================= CAROUSEL MODE ================= */
        <div
          className="relative mt-1"
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (diff > 45) {
              handleNextSlide();
            } else if (diff < -45) {
              handlePrevSlide();
            }
            setTouchStartX(null);
          }}
        >
          {/* Active Box Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141926] via-[#0f1420] to-[#0b0e14] p-4 sm:p-5 shadow-2xl transition-all">
            {/* Top Glow Background */}
            <div
              className={`absolute top-0 left-0 right-0 h-36 bg-gradient-to-b ${columns[activeSlide].glowColor} pointer-events-none blur-xl`}
            />

            {/* Slide Header & Controls */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                  {columns[activeSlide].icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">
                      Column {activeSlide + 1} of 5
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {columns[activeSlide].badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Rajdhani',sans-serif] tracking-wide mt-0.5">
                    {columns[activeSlide].title}
                  </h3>
                </div>
              </div>

              {/* Prev / Next Header Chevrons */}
              <div className="flex items-center gap-1">
                <button
                  id="btn-info-carousel-prev"
                  onClick={handlePrevSlide}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 active:scale-95 transition"
                  title="Previous Box"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-info-carousel-next"
                  onClick={handleNextSlide}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 active:scale-95 transition"
                  title="Next Box"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Box Render */}
            <div className="relative z-10 animate-in fade-in duration-200">
              {boxRenderers[activeSlide]()}
            </div>

            {/* Card Footer: Prev / Next Buttons & Scroll-Up */}
            <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={handlePrevSlide}
                className="flex-1 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Box</span>
              </button>

              <button
                onClick={scrollToTop}
                className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
                title="Scroll Up to Top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Top</span>
              </button>

              <button
                onClick={handleNextSlide}
                className="flex-1 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
              >
                <span>Next Box</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-2">
              {columns.map((col, idx) => (
                <button
                  key={col.id}
                  onClick={() => handleSelectSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlide === idx
                      ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= ALL 5 COLUMNS CONTINUOUS VIEW ================= */
        <div className="space-y-4 mt-1 animate-in fade-in duration-200">
          {columns.map((col, idx) => (
            <div
              key={col.id}
              id={`info-box-column-${idx}`}
              className={`relative overflow-hidden rounded-3xl border ${col.borderColor} bg-gradient-to-b from-[#141926] via-[#0f1420] to-[#0b0e14] p-4 sm:p-5 shadow-xl transition-all`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                    {col.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">
                        Column #{idx + 1} of 5
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {col.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Rajdhani',sans-serif] tracking-wide mt-0.5">
                      {col.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveSlide(idx);
                    setViewMode('carousel');
                    scrollToTop();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition"
                >
                  Focus Box
                </button>
              </div>

              {/* Full Content */}
              {boxRenderers[idx]()}
            </div>
          ))}

          {/* Bottom Back-to-Top Button for Continuous Scroll */}
          <div className="pt-2 text-center">
            <button
              onClick={scrollToTop}
              className="w-full py-3 rounded-2xl bg-[#141926] hover:bg-[#1a2234] border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg active:scale-98"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Scroll Up to Top of Page</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Scroll-to-Top Button (Appears when scrolled down) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 p-2.5 sm:p-3 rounded-2xl bg-cyan-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:bg-cyan-400 active:scale-95 transition flex items-center gap-1.5 text-xs animate-in fade-in zoom-in duration-200"
          title="Scroll Up to Top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Top</span>
        </button>
      )}
    </div>
  );
};
