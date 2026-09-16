import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Zap, CheckCircle2, ArrowRight, X, TrendingUp, Lock, Unlock, KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface BalanceBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onCreditBalance: (amount: number) => void;
}

const SECRET_BOOSTER_PASSWORD = 'SecretBoo';

export const BalanceBoostModal: React.FC<BalanceBoostModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onCreditBalance,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [justCredited, setJustCredited] = useState<number | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const figureInputRef = useRef<HTMLInputElement>(null);

  // Reset password state every time modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setPasswordInput('');
      setShowPassword(false);
      setAuthError(null);
      setInputValue('');
      setJustCredited(null);

      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    } else {
      setIsAuthenticated(false);
      setPasswordInput('');
      setAuthError(null);
    }
  }, [isOpen]);

  // Focus figure input when unlocked
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        figureInputRef.current?.focus();
      }, 100);
    }
  }, [isAuthenticated]);

  // Handle password submission
  const handleVerifyPassword = () => {
    const trimmed = passwordInput.trim();
    if (trimmed === SECRET_BOOSTER_PASSWORD) {
      soundFx.playReward();
      setAuthError(null);
      setIsAuthenticated(true);
    } else {
      soundFx.playClick();
      setAuthError('ACCESS REJECTED • INCORRECT PASSWORD');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      passwordInputRef.current?.focus();
    }
  };

  // Parse figure input (supports raw numbers, commas, and suffixes like K, M, B, T)
  const parsedFigure = useMemo(() => {
    const clean = inputValue.trim().replace(/,/g, '');
    if (!clean) return 0;

    // Check for suffix like 10M, 1B, 500K
    const match = clean.match(/^([0-9.]+)\s*([kKmMbBtT]?)$/);
    if (!match) return 0;

    const base = parseFloat(match[1]);
    if (isNaN(base) || base <= 0) return 0;

    const unit = match[2].toUpperCase();
    let multiplier = 1;
    if (unit === 'K') multiplier = 1_000;
    else if (unit === 'M') multiplier = 1_000_000;
    else if (unit === 'B') multiplier = 1_000_000_000;
    else if (unit === 'T') multiplier = 1_000_000_000_000;

    return Math.floor(base * multiplier);
  }, [inputValue]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (parsedFigure <= 0) return;

    soundFx.playReward();
    onCreditBalance(parsedFigure);
    setJustCredited(parsedFigure);

    // After brief confirmation, close modal
    setTimeout(() => {
      setJustCredited(null);
      setInputValue('');
      onClose();
    }, 1200);
  };

  const handleQuickAdd = (preset: number) => {
    soundFx.playClick();
    setInputValue(preset.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f1420] border-2 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)] overflow-hidden flex flex-col">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
              {isAuthenticated ? (
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <Lock className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-amber-300 tracking-wider font-['Rajdhani',sans-serif]">
                  SECRET BALANCE BOOSTER
                </span>
                {isAuthenticated ? (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-[9px] font-bold text-emerald-300 border border-emerald-500/40 uppercase flex items-center gap-1">
                    <Unlock className="w-2.5 h-2.5" />
                    <span>UNLOCKED</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-[9px] font-bold text-amber-200 border border-amber-500/40 uppercase flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>PASSWORD PROTECTED</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isAuthenticated
                  ? 'Input figure of desire to credit balance directly'
                  : 'Enter security password to access boosting interface'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Current Balance Card */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Current Balance:</span>
            <span className="text-base font-black text-white font-['Rajdhani',sans-serif]">
              {currentBalance.toLocaleString()} PTS
            </span>
          </div>

          {!isAuthenticated ? (
            /* Password Authentication Screen */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Security Password</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Case-sensitive</span>
                </label>

                <div className={`relative ${isShaking ? 'animate-bounce' : ''}`}>
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter password..."
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-black/70 border border-amber-400/60 focus:border-amber-400 text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400/40 tracking-wider placeholder:text-slate-600 placeholder:font-sans placeholder:font-normal placeholder:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyPassword();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 p-1 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Warning */}
              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-rose-300 text-xs font-bold animate-in fade-in duration-150">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Password Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPassword}
                  disabled={!passwordInput}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-[0_0_20px_rgba(251,191,36,0.35)] active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>UNLOCK ACCESS</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unlocked Boosting Screen */
            <>
              {justCredited !== null ? (
                /* Success Feedback */
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black text-emerald-300 font-['Rajdhani',sans-serif]">
                    +{justCredited.toLocaleString()} POINTS CREDITED!
                  </div>
                  <p className="text-xs text-slate-400">Balance updated successfully</p>
                </div>
              ) : (
                <>
                  {/* Figure Input Form */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Figure of Desire</span>
                      <span className="text-[11px] text-amber-400 font-normal">Supports 10M, 100M, 1B</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={figureInputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter figure e.g. 50,000,000 or 100M"
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-400/60 focus:border-amber-400 text-white font-['Rajdhani',sans-serif] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 tracking-wider placeholder:text-slate-600 placeholder:font-normal placeholder:text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSend();
                        }}
                      />
                      {inputValue && (
                        <button
                          onClick={() => setInputValue('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Quick Fill Figures:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: '+10M', value: 10_000_000 },
                        { label: '+50M', value: 50_000_000 },
                        { label: '+100M', value: 100_000_000 },
                        { label: '+1B', value: 1_000_000_000 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => handleQuickAdd(preset.value)}
                          className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/50 text-xs font-bold text-slate-200 hover:text-amber-300 transition text-center"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview Calculation */}
                  {parsedFigure > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>New Balance:</span>
                      </div>
                      <span className="font-black text-sm text-amber-200 font-['Rajdhani',sans-serif]">
                        {(currentBalance + parsedFigure).toLocaleString()} PTS
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onClose();
                      }}
                      className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={parsedFigure <= 0}
                      className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Send & Credit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
