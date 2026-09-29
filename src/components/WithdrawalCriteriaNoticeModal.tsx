import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Coins,
  Key,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import {
  evaluateWithdrawalEligibility,
  MIN_WITHDRAWAL_THRESHOLD,
  MIN_WITHDRAWAL_POINTS,
  MIN_WITHDRAWAL_LEVEL,
  MIN_PPH_CARD_LEVEL,
} from '../data/withdrawalRules';

interface WithdrawalCriteriaNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  tapLevel: number;
  reserveBalance: number;
  playerKeys: number;
  mineCardLevels: Record<string, number>;
  stage?: number;
  totalEarned?: number;
  onGoToMine?: () => void;
}

export const WithdrawalCriteriaNoticeModal: React.FC<WithdrawalCriteriaNoticeModalProps> = ({
  isOpen,
  onClose,
  coins,
  tapLevel,
  reserveBalance,
  playerKeys,
  mineCardLevels,
  stage = 1,
  totalEarned = 0,
  onGoToMine,
}) => {
  if (!isOpen) return null;

  const eligibility = evaluateWithdrawalEligibility(
    coins,
    tapLevel,
    reserveBalance,
    playerKeys,
    mineCardLevels,
    stage,
    totalEarned
  );

  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  const handleGoToMine = () => {
    soundFx.playClick();
    onClose();
    if (onGoToMine) {
      onGoToMine();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c121e] border-2 border-amber-500/70 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Ribbon */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-black border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-amber-300 tracking-wider font-['Rajdhani',sans-serif]">
                  OFFICIAL WITHDRAWAL POLICY
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-[9px] font-bold text-amber-200">
                  NOTICE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mandatory qualification criteria for $ Reserve cashouts
              </p>
            </div>
          </div>

          {/* Close X Button */}
          <button
            onClick={handleClose}
            aria-label="Close Notice"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Progress Overview Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-black/80 via-slate-950/90 to-black border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Your Account Status
              </span>
              <div className="text-sm font-black text-white font-['Rajdhani',sans-serif] flex items-center gap-1.5 mt-0.5">
                <span
                  className={
                    eligibility.allCriteriaMet ? 'text-emerald-400' : 'text-amber-400'
                  }
                >
                  {eligibility.metCriteriaCount} of 5 Criteria Met
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">
                  {eligibility.allCriteriaMet
                    ? 'Qualified for Direct Cashout'
                    : 'Action Required'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((idx) => {
                const passed = idx <= eligibility.metCriteriaCount;
                return (
                  <div
                    key={idx}
                    className={`w-5 h-2 rounded-full transition ${
                      passed
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                        : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 5 Core Criteria Cards */}
          <div className="space-y-2.5">
            {/* Criteria 1: Level 9, Lord */}
            <div
              className={`p-3 rounded-xl border transition ${
                eligibility.isLevelMet
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/50 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      eligibility.isLevelMet
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        1. Player Level 9 (Lord) Required
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Player must have reached Level 9, Lord rank or higher to be eligible for
                      crypto withdrawals.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      eligibility.isLevelMet
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {eligibility.isLevelMet ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>MET (Lvl {eligibility.playerLevel})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>Lvl {eligibility.playerLevel} / 9</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Criteria 2: PPH all level 5 */}
            <div
              className={`p-3 rounded-xl border transition ${
                eligibility.isPphMet
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/50 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      eligibility.isPphMet
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        2. All Mine PPH Cards at Level 5
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      PPH must all have been in Level 5 for each. Meaning, player must level up to
                      5 on each card in PPH of Mine.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      eligibility.isPphMet
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {eligibility.isPphMet ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>ALL 9 AT LVL 5+</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>
                          {eligibility.pphCardsMetCount}/{eligibility.pphCardsTotal} at Lvl 5+
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {!eligibility.isPphMet && eligibility.incompletePphCards.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-amber-400/90 truncate max-w-[240px]">
                    Pending: {eligibility.incompletePphCards[0].name} (Lvl{' '}
                    {eligibility.incompletePphCards[0].currentLevel}/5)
                    {eligibility.incompletePphCards.length > 1
                      ? ` +${eligibility.incompletePphCards.length - 1} more`
                      : ''}
                  </span>
                  {onGoToMine && (
                    <button
                      onClick={handleGoToMine}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0 ml-2"
                    >
                      Upgrade in Mine →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Criteria 3: $ withdrawal threshold is $90 */}
            <div
              className={`p-3 rounded-xl border transition ${
                eligibility.isThresholdMet
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/50 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      eligibility.isThresholdMet
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        3. $90 Minimum Withdrawal Threshold
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      The $ withdrawal threshold is $90.00 USD minimum per transaction from Secret $
                      Reserve.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      eligibility.isThresholdMet
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {eligibility.isThresholdMet ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>${eligibility.reserveBalance.toFixed(2)} USD</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>${eligibility.reserveBalance.toFixed(2)} / $90</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Criteria 4: Point balance over 100M */}
            <div
              className={`p-3 rounded-xl border transition ${
                eligibility.isPointsMet
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/50 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      eligibility.isPointsMet
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        4. Point Balance Over 100M Points
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Point balance must be over 100,000,000 (100M) $EUTAP points to clear liquidity
                      anti-bot safeguards.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      eligibility.isPointsMet
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {eligibility.isPointsMet ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{(coins / 1000000).toFixed(1)}M Points</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>{(coins / 1000000).toFixed(1)}M / 100M</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Criteria 5: Withdrawal key ratio is the same */}
            <div
              className={`p-3 rounded-xl border transition ${
                eligibility.hasEnoughKeysForThreshold
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/50 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      eligibility.hasEnoughKeysForThreshold
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        5. Key Rule & Ratio Unchanged
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      The withdrawal key ratio is the same. Nothing changed about the key rule (6
                      Keys per $1.00 USD; $90 min requires 540 Keys).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      eligibility.hasEnoughKeysForThreshold
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span>
                      🔑 {playerKeys.toLocaleString()} /{' '}
                      {eligibility.minKeysRequiredForThreshold.toLocaleString()} Keys
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gradient-to-t from-black via-slate-950 to-transparent border-t border-white/10 flex items-center gap-3 shrink-0">
          {onGoToMine && !eligibility.isPphMet && (
            <button
              onClick={handleGoToMine}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Level Up PPH in Mine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Got It • Close Notice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
