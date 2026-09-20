import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Send, Twitter, Youtube, MessageSquare, Repeat, Wallet, Check, ExternalLink, Crown, Sparkles, TreePine, Lock, Egg } from 'lucide-react';
import { Task } from '../types';
import { INITIAL_TASKS } from '../data/tasks';
import { soundFx } from '../utils/audio';

interface EarnTabProps {
  completedTaskIds: string[];
  streakDay: number;
  wheelOfFortuneSpins?: number;
  tapLevel: number;
  onCompleteTask: (taskId: string, reward: number) => void;
  onOpenDailyReward: () => void;
  onOpenWheelOfFortune?: () => void;
  onOpenTreePluck?: () => void;
  onOpenLayHatch?: () => void;
  onOpenDice?: () => void;
  goldCoinImg: string;
}

export const EarnTab: React.FC<EarnTabProps> = ({
  completedTaskIds,
  streakDay,
  wheelOfFortuneSpins = 6,
  tapLevel,
  onCompleteTask,
  onOpenDailyReward,
  onOpenWheelOfFortune,
  onOpenTreePluck,
  onOpenLayHatch,
  onOpenDice,
  goldCoinImg,
}) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => completedTaskIds.includes(t.id)).length;

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
              {carouselIndex + 1}/5
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-carousel-prev"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setCarouselIndex((prev) => (prev === 0 ? 4 : prev - 1));
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
                setCarouselIndex((prev) => (prev === 4 ? 0 : prev + 1));
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
        </div>
      </div>

      {/* Tasks & Quests Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TASKS & QUESTS ({completedCount}/{tasks.length})
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
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
      </div>
    </div>
  );
};
