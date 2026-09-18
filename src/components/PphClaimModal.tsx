import React from 'react';
import { Clock, TrendingUp, Sparkles, X, ChevronRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PphClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  pphRate: number;
  elapsedHours: number;
  claimablePoints: number;
  goldCoinImg: string;
}

export const PphClaimModal: React.FC<PphClaimModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  pphRate,
  elapsedHours,
  claimablePoints,
  goldCoinImg,
}) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    soundFx.playReward();
    onClaim();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#121620] border border-amber-500/40 p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-pph-claim"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="relative mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 via-yellow-500/15 to-transparent border border-amber-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
          <Clock className="w-10 h-10 text-amber-300 animate-pulse" />
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-400/60 flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hourly Profit Available</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white font-['Rajdhani',sans-serif] tracking-wide">
          PROFIT PER HOUR
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Your passive mining nodes and automated yield engines accumulated profit while you were playing or offline!
        </p>

        {/* Stats Card */}
        <div className="my-5 p-4 rounded-2xl bg-[#171d29] border border-white/10 text-left space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2.5 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Accumulated Time:</span>
            </span>
            <span className="font-bold text-amber-300">
              {elapsedHours} {elapsedHours === 1 ? 'Hour' : 'Hours'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pb-2.5 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current PPH Rate:</span>
            </span>
            <span className="font-bold text-cyan-300">
              +{pphRate.toLocaleString()} / hr
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ready to Claim:</span>
            <div className="flex items-center gap-1.5">
              <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-5 h-5 rounded-full shadow-sm" />
              <span className="text-xl font-black text-amber-300 font-['Rajdhani',sans-serif] tracking-wide">
                +{claimablePoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Claim Action Button */}
        <button
          id="btn-claim-pph-reward"
          onClick={handleClaim}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base uppercase tracking-wider font-['Rajdhani',sans-serif] shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition transform active:scale-98"
        >
          <Sparkles className="w-5 h-5" />
          <span>Claim +{claimablePoints.toLocaleString()} Points</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-slate-500 mt-2.5">
          Profit accrues every hour online or offline. Next claim will be available after the next hour ticks.
        </p>
      </div>
    </div>
  );
};
