import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, ShieldAlert, Globe, Activity } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface OfflineGateProps {
  isChecking: boolean;
  onRetry: () => Promise<boolean>;
}

export const OfflineGate: React.FC<OfflineGateProps> = ({ isChecking, onRetry }) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [retryAttempts, setRetryAttempts] = useState<number>(0);
  const onRetryRef = useRef(onRetry);

  useEffect(() => {
    onRetryRef.current = onRetry;
  }, [onRetry]);

  // Pure countdown timer for UI indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 3 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-probe connectivity every 3 seconds outside of state updaters
  useEffect(() => {
    const probeTimer = setInterval(() => {
      onRetryRef.current().then((success) => {
        if (!success) {
          setRetryAttempts((c) => c + 1);
        }
      });
    }, 3000);

    return () => clearInterval(probeTimer);
  }, []);

  const handleManualRetry = () => {
    soundFx.playClick();
    soundFx.triggerHaptic(20);
    setCountdown(3);
    setRetryAttempts((c) => c + 1);
    onRetry();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#05070f]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden text-center animate-in fade-in duration-300">
      {/* Background ambient red/amber grid glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-600/10 blur-[130px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-5">
        {/* Pulsing Disconnected Beacon Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-ping opacity-60" />
          <div className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-rose-900/60 to-rose-950/80 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
            <WifiOff className="w-8 h-8 animate-pulse text-rose-300" />
          </div>
        </div>

        {/* Top Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-bold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>System Offline • Connection Severed</span>
        </div>

        {/* Headline & Notice */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black font-['Rajdhani',sans-serif] text-white tracking-wide uppercase">
            Online Connection Required
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            This project is an <strong className="text-amber-400">online project</strong>. Without an active internet connection, the application cannot be used.
          </p>
        </div>

        {/* Diagnostic Telemetry Panel */}
        <div className="w-full rounded-2xl bg-black/60 border border-white/10 p-3.5 text-left space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Network State:
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              DISCONNECTED
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              Telemetry Sync:
            </span>
            <span className="text-amber-400 font-bold">PAUSED</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              Action Gate:
            </span>
            <span className="text-rose-400 font-bold">LOCKED</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full space-y-2.5">
          <button
            onClick={handleManualRetry}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-sm tracking-wide transition shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Connection...' : 'Retry Connection Now'}</span>
          </button>

          {/* Auto-reconnect timer indicator */}
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Auto-rechecking in <strong className="text-white font-bold">{countdown}s</strong></span>
            {retryAttempts > 0 && (
              <span className="text-slate-500">({retryAttempts} attempt{retryAttempts > 1 ? 's' : ''})</span>
            )}
          </div>
        </div>

        {/* Helpful user advice */}
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
          <span>Please verify your Wi-Fi, cellular data, or network cables.</span>
        </p>
      </div>
    </div>
  );
};
