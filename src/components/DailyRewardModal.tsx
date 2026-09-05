import React from 'react';
import { X, Calendar, Check, Sparkles } from 'lucide-react';
import { DAILY_STREAK_REWARDS } from '../data/tasks';
import { soundFx } from '../utils/audio';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDay: number;
  lastClaimDate: string | null;
  onClaimDay: (day: number, reward: number) => void;
  goldCoinImg: string;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  streakDay,
  lastClaimDate,
  onClaimDay,
  goldCoinImg,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyClaimedToday = lastClaimDate === todayStr;
  const nextDay = alreadyClaimedToday ? streakDay : (streakDay % 10) + 1;
  const nextReward = DAILY_STREAK_REWARDS.find((r) => r.day === nextDay)?.reward || 500;

  const handleClaim = () => {
    soundFx.playReward();
    onClaimDay(nextDay, nextReward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Daily Streak Check-In</h3>
            <span className="text-xs text-slate-400">Build your streak up to 5,000,000 coins!</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Log in each consecutive day to unlock higher tier bonuses. Missing a day resets the cycle.
        </p>

        {/* Streak Grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {DAILY_STREAK_REWARDS.map((item) => {
            const isCompleted = item.day <= streakDay && alreadyClaimedToday;
            const isCurrent = !alreadyClaimedToday && item.day === nextDay;

            return (
              <div
                key={item.day}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse'
                    : 'bg-black/30 border-white/5 text-slate-400'
                } ${item.day === 10 ? 'col-span-2' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Day {item.day}
                </span>

                <div className="my-1">
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
                  )}
                </div>

                <span className="text-[11px] font-black font-['Rajdhani',sans-serif] truncate">
                  +{item.reward >= 1000000 ? `${item.reward / 1000000}M` : item.reward >= 1000 ? `${item.reward / 1000}K` : item.reward}
                </span>
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        {alreadyClaimedToday ? (
          <div className="py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
            <span>You already claimed Day {streakDay} today! Come back tomorrow for Day {nextDay}.</span>
          </div>
        ) : (
          <button
            id="btn-claim-daily-streak"
            onClick={handleClaim}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Claim Day {nextDay} (+{nextReward.toLocaleString()} Coins)</span>
          </button>
        )}
      </div>
    </div>
  );
};
