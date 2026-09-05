import React, { useState } from 'react';
import { Users, Copy, Check, Share2, Sparkles, UserPlus } from 'lucide-react';
import { SquadMember } from '../types';
import { soundFx } from '../utils/audio';

interface FriendsTabProps {
  squadMembers: SquadMember[];
  squadEarnings: number;
  referralCode: string;
  onSimulateInvite: (isPremium: boolean) => void;
  goldCoinImg: string;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({
  squadMembers,
  squadEarnings,
  referralCode,
  onSimulateInvite,
  goldCoinImg,
}) => {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `https://t.me/eutap_bot?start=${referralCode}`;

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    soundFx.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Join EuTap Airdrop!',
        text: 'Tap to earn $EUTAP crypto tokens before TGE listing. Join my squad now!',
        url: inviteUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 pb-24 max-w-md mx-auto select-none">
      {/* Top Header Badge & Text */}
      <div className="flex flex-col items-center text-center mt-3 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
          <Users className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Invite Friends & Earn</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Score up to +250,000 $EUTAP coins for every friend who joins your squad
        </p>
      </div>

      {/* Two Tier Cards (Standard Friend & TG Premium) */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Standard Friend */}
        <div className="bg-[#141923] border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            STANDARD FRIEND
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
            <span className="text-sm font-black text-amber-400 font-['Rajdhani',sans-serif]">
              +50,000
            </span>
          </div>
        </div>

        {/* TG Premium */}
        <div className="bg-[#141923] border border-amber-500/30 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              TG PREMIUM
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
            <span className="text-sm font-black text-amber-300 font-['Rajdhani',sans-serif]">
              +250,000
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-[#141923] border border-white/10 rounded-2xl p-3.5 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            TOTAL SQUAD
          </span>
          <span className="text-xl font-black text-white mt-1">
            {squadMembers.length} Members
          </span>
        </div>

        <div className="bg-[#141923] border border-white/10 rounded-2xl p-3.5 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            BOUNTY CLAIMED
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
            <span className="text-xl font-black text-amber-400 font-['Rajdhani',sans-serif]">
              {squadEarnings.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Squad Leaderboard / List */}
      <div className="bg-[#141923] border border-white/10 rounded-2xl p-4 flex flex-col mb-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Your Squad Leaderboard</h3>
          <span className="text-xs font-semibold text-slate-400">{squadMembers.length} Active</span>
        </div>

        {squadMembers.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center text-slate-500">
            <Users className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 max-w-xs">
              No squad members yet. Invite friends or test squad joins below to earn instant rewards!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {squadMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-200">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{member.name}</span>
                      {member.isPremium && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">Level {member.level}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
                  <span className="text-xs font-bold text-amber-400">
                    +{member.earnedForYou.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo simulator triggers */}
        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Test Invite Join:</span>
          <div className="flex items-center gap-1.5">
            <button
              id="simulate-standard-friend-btn"
              onClick={() => {
                soundFx.playReward();
                onSimulateInvite(false);
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3 text-slate-300" />
              <span>+Standard</span>
            </button>
            <button
              id="simulate-premium-friend-btn"
              onClick={() => {
                soundFx.playReward();
                onSimulateInvite(true);
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>+Premium</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Buttons */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          id="btn-invite-friends"
          onClick={handleShare}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition active:scale-98"
        >
          <Share2 className="w-4 h-4" />
          <span>Invite a friend</span>
        </button>

        <button
          id="btn-copy-invite-link"
          onClick={handleCopy}
          className="py-3 px-4 rounded-xl bg-[#141923] hover:bg-[#1b2230] border border-white/10 hover:border-amber-400/40 text-slate-200 font-bold text-sm flex items-center justify-center gap-1.5 transition active:scale-98"
          title="Copy Referral Link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
