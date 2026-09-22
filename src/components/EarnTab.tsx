import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Send, Twitter, Youtube, MessageSquare, Repeat, Wallet, Check, ExternalLink, Crown, Sparkles, TreePine, Lock, Egg, ArrowUpDown, Zap, DollarSign, Gem, Key, Award, Flame, RotateCcw } from 'lucide-react';
import { Task, TapQuest } from '../types';
import { INITIAL_TASKS } from '../data/tasks';
import { TAP_QUESTS } from '../data/tapQuests';
import { soundFx } from '../utils/audio';

interface EarnTabProps {
  completedTaskIds: string[];
  completedTapQuestIds?: string[];
  totalTaps?: number;
  streakDay: number;
  wheelOfFortuneSpins?: number;
  tapLevel: number;
  reserveBalance?: number;
  onCompleteTask: (taskId: string, reward: number) => void;
  onClaimTapQuest?: (quest: TapQuest) => void;
  onOpenDailyReward: () => void;
  onOpenWheelOfFortune?: () => void;
  onOpenTreePluck?: () => void;
  onOpenLayHatch?: () => void;
  onOpenDice?: () => void;
  onOpenHnL?: () => void;
  onOpenRouletteStake?: () => void;
  goldCoinImg: string;
}

export const EarnTab: React.FC<EarnTabProps> = ({
  completedTaskIds,
  completedTapQuestIds = [],
  totalTaps = 0,
  streakDay,
  wheelOfFortuneSpins = 6,
  tapLevel,
  reserveBalance = 0,
  onCompleteTask,
  onClaimTapQuest,
  onOpenDailyReward,
  onOpenWheelOfFortune,
  onOpenTreePluck,
  onOpenLayHatch,
  onOpenDice,
  onOpenHnL,
  onOpenRouletteStake,
  goldCoinImg,
}) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [taskCarouselIndex, setTaskCarouselIndex] = useState<number>(0); // 0 = Social/Community Tasks, 1 = Tap Quests, 2 = Stake (Roulette 65)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const completedTapQuestsCount = TAP_QUESTS.filter((q) => completedTapQuestIds.includes(q.id)).length;
  const claimableTapQuestsCount = TAP_QUESTS.filter(
    (q) => totalTaps >= q.targetTaps && !completedTapQuestIds.includes(q.id)
  ).length;

  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'telegram':
        return <Send className="w-5 h-5 text-sky-400" />;
      case 'x':
        return <Twitter className="w-5 h-5 text-blue-400" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-rose-500" />;
      case 'discord':
        return <MessageSquare className="w-5 h-5 text-indigo-400" />;
      case 'retweet':
        return <Repeat className="w-5 h-5 text-emerald-400" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-amber-400" />;
      default:
        return <Check className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleTaskAction = (task: Task) => {
    if (completedTaskIds.includes(task.id)) return;

    soundFx.playClick();
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
    }

    setVerifyingTaskId(task.id);
    setTimeout(() => {
      setVerifyingTaskId(null);
      soundFx.playReward();
      onCompleteTask(task.id, task.reward);
    }, 2500);
  };

  return (
    <div className="flex flex-col px-3.5 pt-2 pb-20 max-w-md mx-auto select-none">
      {/* Top Header Card */}
      <div className="flex flex-col items-center text-center mt-3 mb-5">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.25)]">
            <img
              src={goldCoinImg}
              alt="Token"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full drop-shadow-md"
            />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">Earn Extra $EUTAP Tokens</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Complete daily tasks, watch videos, and verify social accounts for instant token bounties.
        </p>
      </div>

      {/* Daily Events Carousel Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DAILY REWARDS & PLAYGROUNDS
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-white/10 text-slate-300 font-mono">
              {carouselIndex + 1}/6
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-carousel-prev"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setCarouselIndex((prev) => (prev === 0 ? 5 : prev - 1));
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Previous reward card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-carousel-next"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setCarouselIndex((prev) => (prev === 5 ? 0 : prev + 1));
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Next reward card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Card Slides */}
        <div className="relative overflow-hidden rounded-2xl">
          {carouselIndex === 0 ? (
            /* Slide 1: Daily Streak Check-In */
            <button
              id="btn-earn-streak-checkin"
              onClick={() => {
                soundFx.playClick();
                onOpenDailyReward();
              }}
              className="w-full text-left bg-gradient-to-r from-[#17142b] via-[#141923] to-[#121422] hover:bg-[#1c1836] border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-3.5 flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-950/70 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-100">Daily Streak Check-In</h4>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-[9px] font-bold text-purple-300 border border-purple-500/30">
                      Day {streakDay}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
                    <span className="text-xs font-bold text-amber-400">Up to +5,000,000 Coins</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-1 transition shrink-0" />
            </button>
          ) : carouselIndex === 1 ? (
            /* Slide 2: Wheel of Fortune (Locked until Level 7) */
            <button
              id="btn-earn-wheel-of-fortune"
              onClick={() => {
                if (tapLevel < 7) {
                  soundFx.playTap(true);
                  setLockedNotice(`Locked! Wheel of Fortune unlocks at Level 7 (Current: Lv.${tapLevel})`);
                  setTimeout(() => setLockedNotice(null), 2500);
                } else {
                  soundFx.playClick();
                  if (onOpenWheelOfFortune) onOpenWheelOfFortune();
                }
              }}
              className={`w-full text-left rounded-2xl p-3.5 flex items-center justify-between transition group shadow-md ${
                tapLevel < 7
                  ? 'bg-gradient-to-r from-[#17130b] via-[#120f09] to-[#0d0b06] border border-white/10 hover:border-amber-500/30'
                  : 'bg-gradient-to-r from-[#211608] via-[#181309] to-[#120f07] hover:bg-[#2b1c0a] border border-amber-500/40 hover:border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 relative ${
                    tapLevel < 7
                      ? 'bg-slate-800/60 border-slate-700 text-slate-500'
                      : 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                  }`}
                >
                  <Crown className={`w-5 h-5 ${tapLevel >= 7 ? 'animate-pulse' : ''}`} />
                  {tapLevel < 7 && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-sm font-black tracking-wide font-['Rajdhani',sans-serif] ${
                        tapLevel < 7 ? 'text-slate-300' : 'text-amber-200'
                      }`}
                    >
                      Wheel of Fortune
                    </h4>
                    {tapLevel < 7 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        LEVEL UP TO 7
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/25 text-[9px] font-black text-amber-300 border border-amber-400/40">
                        GOLDEN
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    {tapLevel < 7 ? (
                      <span className="text-slate-400 text-[11px]">
                        Locked (level up to 7) • Progress: Lv.{tapLevel}/7
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="font-medium text-amber-300/80">
                          8-Chart Spin Wheel • {wheelOfFortuneSpins}/6 Spins Today
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {tapLevel < 7 ? (
                <div className="p-1 rounded-lg text-slate-600 group-hover:text-rose-400 transition shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-amber-500 group-hover:text-amber-300 group-hover:translate-x-1 transition shrink-0" />
              )}
            </button>
          ) : carouselIndex === 2 ? (
            /* Slide 3: Tree Pluck (Locked until Level 9) */
            <button
              id="btn-earn-tree-pluck"
              onClick={() => {
                if (tapLevel < 9) {
                  soundFx.playTap(true);
                  setLockedNotice(`Locked! Tree Pluck unlocks at Level 9 (Current: Lv.${tapLevel})`);
                  setTimeout(() => setLockedNotice(null), 2500);
                } else {
                  soundFx.playClick();
                  if (onOpenTreePluck) onOpenTreePluck();
                }
              }}
              className={`w-full text-left rounded-2xl p-3.5 flex items-center justify-between transition group shadow-md ${
                tapLevel < 9
                  ? 'bg-gradient-to-r from-[#121814] via-[#101411] to-[#0c0f0d] border border-white/10 hover:border-emerald-500/30'
                  : 'bg-gradient-to-r from-[#062413] via-[#092d19] to-[#04190c] hover:bg-[#0c391f] border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 relative ${
                    tapLevel < 9
                      ? 'bg-slate-800/60 border-slate-700 text-slate-500'
                      : 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                  }`}
                >
                  <TreePine className="w-5 h-5" />
                  {tapLevel < 9 && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-sm font-black tracking-wide font-['Rajdhani',sans-serif] ${
                        tapLevel < 9 ? 'text-slate-300' : 'text-emerald-200'
                      }`}
                    >
                      Tree Pluck
                    </h4>
                    {tapLevel < 9 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        LEVEL UP TO 9
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/25 text-[9px] font-black text-emerald-300 border border-emerald-400/40 animate-pulse">
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    {tapLevel < 9 ? (
                      <span className="text-slate-400 text-[11px]">
                        Locked (level up to 9) • Progress: Lv.{tapLevel}/9
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-300/90 text-[11px] font-medium">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Playground with 100+ Cash Notes & Tools</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tapLevel < 9 ? (
                <div className="p-1 rounded-lg text-slate-600 group-hover:text-rose-400 transition shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:text-emerald-300 group-hover:translate-x-1 transition shrink-0" />
              )}
            </button>
          ) : carouselIndex === 3 ? (
            /* Slide 4: Lay & Hatch (Locked until Level 12) */
            <button
              id="btn-earn-lay-hatch"
              onClick={() => {
                if (tapLevel < 12) {
                  soundFx.playTap(true);
                  setLockedNotice(`Locked! Lay & Hatch unlocks at Level 12 (Current: Lv.${tapLevel})`);
                  setTimeout(() => setLockedNotice(null), 2500);
                } else {
                  soundFx.playClick();
                  if (onOpenLayHatch) onOpenLayHatch();
                }
              }}
              className={`w-full text-left rounded-2xl p-3.5 flex items-center justify-between transition group shadow-md ${
                tapLevel < 12
                  ? 'bg-gradient-to-r from-[#1c1208] via-[#140e06] to-[#0c0803] border border-white/10 hover:border-amber-500/30'
                  : 'bg-gradient-to-r from-[#2a1705] via-[#3a2007] to-[#1c0f03] hover:bg-[#4a2b0c] border border-amber-500/50 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 relative ${
                    tapLevel < 12
                      ? 'bg-slate-800/60 border-slate-700 text-slate-500'
                      : 'bg-amber-500/25 border-amber-400/60 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.4)]'
                  }`}
                >
                  <Egg className="w-5 h-5" />
                  {tapLevel < 12 && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-sm font-black tracking-wide font-['Rajdhani',sans-serif] ${
                        tapLevel < 12 ? 'text-slate-300' : 'text-amber-200'
                      }`}
                    >
                      Lay & Hatch
                    </h4>
                    {tapLevel < 12 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        LEVEL UP TO 12
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-[9px] font-black text-amber-300 border border-amber-400/40 animate-pulse">
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    {tapLevel < 12 ? (
                      <span className="text-slate-400 text-[11px]">
                        Locked (level up to 12) • Progress: Lv.{tapLevel}/12
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-300/90 text-[11px] font-medium">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Big White Hen • 5 Eggs every 7hrs • Diamonds, $, Keys & Pts!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tapLevel < 12 ? (
                <div className="p-1 rounded-lg text-slate-600 group-hover:text-rose-400 transition shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-amber-500 group-hover:text-amber-300 group-hover:translate-x-1 transition shrink-0" />
              )}
            </button>
          ) : (
            /* Slide 5: Dice (Locked until Level 15) */
            <button
              id="btn-earn-dice"
              onClick={() => {
                if (tapLevel < 15) {
                  soundFx.playTap(true);
                  setLockedNotice(`Locked! Dice unlocks at Level 15 (Current: Lv.${tapLevel})`);
                  setTimeout(() => setLockedNotice(null), 2500);
                } else {
                  soundFx.playClick();
                  if (onOpenDice) onOpenDice();
                }
              }}
              className={`w-full text-left rounded-2xl p-3.5 flex items-center justify-between transition group shadow-md ${
                tapLevel < 15
                  ? 'bg-gradient-to-r from-[#170a0a] via-[#120808] to-[#0c0505] border border-white/10 hover:border-red-500/30'
                  : 'bg-gradient-to-r from-[#2c0808] via-[#1a0808] to-[#0d0404] hover:bg-[#380b0b] border border-red-500/50 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 relative ${
                    tapLevel < 15
                      ? 'bg-slate-800/60 border-slate-700 text-slate-500'
                      : 'bg-red-500/25 border-red-400/60 text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.4)]'
                  }`}
                >
                  <span className="text-xl">🎲</span>
                  {tapLevel < 15 && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-sm font-black tracking-wide font-['Rajdhani',sans-serif] ${
                        tapLevel < 15 ? 'text-slate-300' : 'text-red-200'
                      }`}
                    >
                      Dice
                    </h4>
                    {tapLevel < 15 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        LEVEL UP TO 15
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/25 text-[9px] font-black text-red-300 border border-red-400/40 animate-pulse">
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    {tapLevel < 15 ? (
                      <span className="text-slate-400 text-[11px]">
                        Locked (level up to 15) • Progress: Lv.{tapLevel}/15
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-red-300/90 text-[11px] font-medium">
                        <Sparkles className="w-3 h-3 text-red-400" />
                        <span>2 Ludo Dice • 8s Light Speed Spin • Win Keys, Cash, & Millions of Points!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tapLevel < 15 ? (
                <div className="p-1 rounded-lg text-slate-600 group-hover:text-rose-400 transition shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-red-500 group-hover:text-red-300 group-hover:translate-x-1 transition shrink-0" />
              )}
            </button>
          )}

          {/* Slide 6: H&L (Higher & Lower) - Unlocks at Level 17 */}
          {carouselIndex === 5 && (
            <button
              id="btn-open-hnl-card"
              onClick={() => {
                if (tapLevel < 17) {
                  soundFx.playClick();
                  setLockedNotice(`Locked! H&L unlocks at Level 17 (Current: Lv.${tapLevel})`);
                  setTimeout(() => setLockedNotice(null), 3000);
                } else {
                  soundFx.playClick();
                  onOpenHnL?.();
                }
              }}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                tapLevel < 17
                  ? 'bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-cyan-950/20 border-white/5 opacity-75'
                  : 'bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-900/90 border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(6,182,212,0.15)] active:scale-[0.99]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 shrink-0 ${
                    tapLevel < 17
                      ? 'bg-slate-800/80 border-slate-700/50 text-slate-500'
                      : 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {tapLevel < 17 ? (
                    <Lock className="w-5 h-5 text-slate-500" />
                  ) : (
                    <div className="flex flex-col items-center justify-center leading-none">
                      <ArrowUpDown className="w-4 h-4 text-cyan-300 mb-0.5" />
                      <span className="text-[9px] font-black tracking-tighter text-cyan-200">0</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-sm font-black tracking-wide font-['Rajdhani',sans-serif] ${
                        tapLevel < 17 ? 'text-slate-300' : 'text-cyan-200'
                      }`}
                    >
                      H&L
                    </h4>
                    {tapLevel < 17 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                        LEVEL UP TO 17
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/25 text-[9px] font-black text-cyan-300 border border-cyan-400/40 animate-pulse">
                        UNLOCKED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    {tapLevel < 17 ? (
                      <span className="text-slate-400 text-[11px]">
                        Locked (level up to 17) • Progress: Lv.{tapLevel}/17
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-cyan-300/90 text-[11px] font-medium">
                        <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Predict Higher or Lower • 5s Spin • Win $1–$5 Cash!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tapLevel < 17 ? (
                <div className="p-1 rounded-lg text-slate-600 group-hover:text-rose-400 transition shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:text-cyan-200 group-hover:translate-x-1 transition shrink-0" />
              )}
            </button>
          )}
        </div>

        {/* Temporary Locked Feedback Toast */}
        {lockedNotice && (
          <div className="mt-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs text-center animate-in fade-in duration-150">
            {lockedNotice}
          </div>
        )}

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setCarouselIndex(0);
            }}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 0
                ? 'w-6 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 1: Daily Streak Check-In"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setCarouselIndex(1);
            }}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 1
                ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 2: Wheel of Fortune"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setCarouselIndex(2);
            }}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 2
                ? 'w-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 3: Tree Pluck"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setCarouselIndex(3);
            }}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 3
                ? 'w-6 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 4: Lay & Hatch"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setCarouselIndex(4);
            }}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 4
                ? 'w-6 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 5: Dice"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setCarouselIndex(5);
            }}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 5
                ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 6: H&L"
          />
        </div>
      </div>

      {/* Tasks & Quests Carousel Section */}
      <div
        className="mt-3"
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (diff > 50) {
            soundFx.playClick();
            setTaskCarouselIndex((prev) => (prev + 1) % 3);
          } else if (diff < -50) {
            soundFx.playClick();
            setTaskCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
          }
          setTouchStartX(null);
        }}
      >
        {/* Carousel Header & Controls */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {taskCarouselIndex === 0
                ? `TASKS & QUESTS (${completedCount}/${tasks.length})`
                : taskCarouselIndex === 1
                ? `TAP QUESTS (${completedTapQuestsCount}/${TAP_QUESTS.length})`
                : `STAKE • ROULETTE 65`}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-white/10 text-slate-300 font-mono">
              {taskCarouselIndex + 1}/3
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-tasks-carousel-prev"
              onClick={() => {
                soundFx.playClick();
                setTaskCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Previous tasks carousel page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-tasks-carousel-next"
              onClick={() => {
                soundFx.playClick();
                setTaskCarouselIndex((prev) => (prev + 1) % 3);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Next tasks carousel page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Tab Switcher: 3 Carousel Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#10141e] border border-white/10 rounded-xl mb-3">
          <button
            id="btn-tab-carousel-tasks"
            onClick={() => {
              soundFx.playClick();
              setTaskCarouselIndex(0);
            }}
            className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              taskCarouselIndex === 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Tasks</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/30">
              {completedCount}/{tasks.length}
            </span>
          </button>

          <button
            id="btn-tab-carousel-tap-quests"
            onClick={() => {
              soundFx.playClick();
              setTaskCarouselIndex(1);
            }}
            className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 relative ${
              taskCarouselIndex === 1
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${taskCarouselIndex === 1 ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="truncate">Quests</span>
            <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${taskCarouselIndex === 1 ? 'bg-black/20 text-slate-950' : 'bg-black/30 text-white'}`}>
              {completedTapQuestsCount}/{TAP_QUESTS.length}
            </span>
            {claimableTapQuestsCount > 0 && (
              <span className="absolute -top-1.5 -right-0.5 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black animate-bounce shadow">
                {claimableTapQuestsCount}
              </span>
            )}
          </button>

          <button
            id="btn-tab-carousel-stake"
            onClick={() => {
              soundFx.playClick();
              setTaskCarouselIndex(2);
            }}
            className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 relative ${
              taskCarouselIndex === 2
                ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${taskCarouselIndex === 2 ? 'text-white animate-spin' : 'text-amber-400'}`} />
            <span className="truncate">Stake</span>
            <span className="px-1 py-0.2 rounded-full bg-rose-500/30 text-[9px] font-mono border border-rose-400/40 text-rose-300">
              65 R
            </span>
          </button>
        </div>

        {/* Carousel Content */}
        {taskCarouselIndex === 0 ? (
          /* Slide 1: Original Social & Community Tasks */
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
            {tasks.map((task) => {
              const isCompleted = completedTaskIds.includes(task.id);
              const isVerifying = verifyingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  className="bg-[#141923] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      {getTaskIcon(task.icon)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{task.title}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
                        <span className="text-xs font-black text-amber-400 font-['Rajdhani',sans-serif]">
                          +{task.reward.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : isVerifying ? (
                      <button
                        disabled
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 animate-pulse"
                      >
                        <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        <span>Checking</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-task-start-${task.id}`}
                        onClick={() => handleTaskAction(task)}
                        className="px-4 py-1.5 rounded-xl bg-[#222836] hover:bg-[#2b3345] text-amber-400 hover:text-amber-300 font-bold text-xs border border-white/10 hover:border-amber-400/40 transition active:scale-95 shadow"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : taskCarouselIndex === 1 ? (
          /* Slide 2: Tap Quests (15 Milestone Tasks with Mixed Rewards) */
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
            {/* Tap Quests Overview Card */}
            <div className="bg-gradient-to-r from-[#17152b] via-[#1b1c33] to-[#121626] border border-amber-500/30 rounded-2xl p-3 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lifetime Taps
                  </span>
                  <div className="text-base font-black text-amber-300 font-mono leading-tight">
                    {totalTaps.toLocaleString()} <span className="text-xs font-semibold text-slate-400 font-sans">Taps</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quests Claimed
                </span>
                <div className="text-sm font-black text-emerald-400 font-mono leading-tight">
                  {completedTapQuestsCount} / {TAP_QUESTS.length}
                </div>
              </div>
            </div>

            {/* 15 Tap Quests List */}
            {TAP_QUESTS.map((quest) => {
              const isClaimed = completedTapQuestIds.includes(quest.id);
              const isReadyToClaim = !isClaimed && totalTaps >= quest.targetTaps;
              const progressPercent = Math.min(100, Math.floor((totalTaps / quest.targetTaps) * 100));
              const remainingTaps = Math.max(0, quest.targetTaps - totalTaps);

              return (
                <div
                  key={quest.id}
                  id={`tap-quest-${quest.id}`}
                  className={`rounded-2xl p-3.5 border transition-all ${
                    isClaimed
                      ? 'bg-[#10141e]/70 border-emerald-500/20 opacity-80'
                      : isReadyToClaim
                      ? 'bg-gradient-to-r from-[#1b1e2e] via-[#1e273f] to-[#171c2d] border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                      : 'bg-[#141923] border-white/10'
                  }`}
                >
                  {/* Top Bar: Icon, Title, Badge & Claim Button */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isClaimed
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                            : isReadyToClaim
                            ? 'bg-amber-500/25 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {isClaimed ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Zap className={`w-4 h-4 ${isReadyToClaim ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-white font-['Rajdhani',sans-serif] tracking-wide">
                            #{quest.questNumber} {quest.title}
                          </h4>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase font-mono bg-gradient-to-r ${quest.badgeColor} text-white shadow-sm`}
                          >
                            {quest.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.2">{quest.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isClaimed ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Claimed</span>
                        </div>
                      ) : isReadyToClaim ? (
                        <button
                          id={`btn-claim-tap-quest-${quest.id}`}
                          onClick={() => {
                            if (onClaimTapQuest) {
                              onClaimTapQuest(quest);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(251,191,36,0.6)] active:scale-95 transition flex items-center gap-1 animate-pulse"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Claim</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono inline-block">
                          {remainingTaps.toLocaleString()} left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Counter */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>
                        {Math.min(totalTaps, quest.targetTaps).toLocaleString()} / {quest.targetTaps.toLocaleString()} Taps
                      </span>
                      <span
                        className={
                          isReadyToClaim
                            ? 'text-amber-300 font-bold'
                            : isClaimed
                            ? 'text-emerald-400 font-bold'
                            : 'text-slate-400'
                        }
                      >
                        {isClaimed ? '100% Completed' : `${progressPercent}%`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isClaimed
                            ? 'bg-emerald-400'
                            : isReadyToClaim
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Mixed Rewards Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
                      Rewards:
                    </span>
                    {quest.rewards.reserve && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-[11px] shadow-sm">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        +${quest.rewards.reserve}.00 Reserve
                      </span>
                    )}
                    {quest.rewards.diamonds && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] shadow-sm">
                        <Gem className="w-3 h-3 text-cyan-400" />
                        +{quest.rewards.diamonds} Diamonds
                      </span>
                    )}
                    {quest.rewards.keys && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px] shadow-sm">
                        <Key className="w-3 h-3 text-amber-400" />
                        +{quest.rewards.keys} Keys
                      </span>
                    )}
                    {quest.rewards.points && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-black text-[11px] shadow-sm">
                        <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3 h-3 rounded-full" />
                        +{quest.rewards.points.toLocaleString()} Points
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Slide 3: Stake Feature - 65 Number Roulette Table */
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#1c162b] via-[#151224] to-[#0c0a17] border border-amber-500/40 rounded-3xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/30 via-rose-500/20 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <RotateCcw className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-white font-['Rajdhani',sans-serif] tracking-wider">
                        ROULETTE 65 STAKE
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        LIVE AUTO-ROUND
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standard round 65-pocket table (0 to 64) • Automatic 60s rounds
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reserve Vault</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    ${reserveBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stake Summary Info Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Table Pockets</span>
                  <span className="text-sm font-black text-amber-300 font-mono">65 Numbers</span>
                  <span className="text-[9px] text-slate-500 block">0 Green + 1-64 R/B</span>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Spin Interval</span>
                  <span className="text-sm font-black text-cyan-300 font-mono">Every 60s</span>
                  <span className="text-[9px] text-slate-500 block">Live Round Table</span>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Max Payout</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">65x Cash</span>
                  <span className="text-[9px] text-slate-500 block">Direct hits</span>
                </div>
              </div>

              {/* Rules Highlight */}
              <div className="p-3 bg-black/30 border border-white/5 rounded-2xl mb-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>How Staking Works:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Stake $ from your Reserve to win or lose. Place chips on <strong className="text-rose-400">RED (2x)</strong>, <strong className="text-slate-300">BLACK (2x)</strong>, <strong className="text-emerald-400">GREEN 0 (35x)</strong>, or predict single pockets for up to <strong className="text-amber-400">65x</strong>. The round table spins automatically every 60 seconds.
                </p>
              </div>

              {/* Main Launch Button */}
              <button
                id="btn-open-roulette-stake"
                onClick={() => {
                  soundFx.playClick();
                  if (onOpenRouletteStake) onOpenRouletteStake();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.35)] flex items-center justify-center gap-2 transition active:scale-[0.98] group"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5] group-hover:rotate-180 transition-transform duration-500" />
                <span>Enter Roulette 65 Stake Table</span>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setTaskCarouselIndex(0);
            }}
            className={`h-1.5 rounded-full transition-all ${
              taskCarouselIndex === 0
                ? 'w-6 bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 1: Social Tasks & Quests"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setTaskCarouselIndex(1);
            }}
            className={`h-1.5 rounded-full transition-all ${
              taskCarouselIndex === 1
                ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 2: Tap Quests"
          />
          <button
            onClick={() => {
              soundFx.playClick();
              setTaskCarouselIndex(2);
            }}
            className={`h-1.5 rounded-full transition-all ${
              taskCarouselIndex === 2
                ? 'w-6 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label="Slide 3: Roulette 65 Stake"
          />
        </div>
      </div>
    </div>
  );
};
