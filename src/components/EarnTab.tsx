import React, { useState } from 'react';
import { Calendar, ChevronRight, Send, Twitter, Youtube, MessageSquare, Repeat, Wallet, Check, ExternalLink } from 'lucide-react';
import { Task } from '../types';
import { INITIAL_TASKS } from '../data/tasks';
import { soundFx } from '../utils/audio';

interface EarnTabProps {
  completedTaskIds: string[];
  streakDay: number;
  onCompleteTask: (taskId: string, reward: number) => void;
  onOpenDailyReward: () => void;
  goldCoinImg: string;
}

export const EarnTab: React.FC<EarnTabProps> = ({
  completedTaskIds,
  streakDay,
  onCompleteTask,
  onOpenDailyReward,
  goldCoinImg,
}) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);

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

      {/* Daily Tasks & Streaks Section */}
      <div className="mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
          DAILY TASKS & STREAKS
        </span>

        <button
          id="btn-earn-streak-checkin"
          onClick={() => {
            soundFx.playClick();
            onOpenDailyReward();
          }}
          className="w-full bg-[#141923] hover:bg-[#1a212e] border border-white/10 hover:border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between transition group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-100">Daily Streak Check-In</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
                <span className="text-xs font-bold text-amber-400">Up to +5,000,000 Coins</span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
        </button>
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
