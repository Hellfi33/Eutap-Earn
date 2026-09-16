import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  X,
  TrendingUp,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  DollarSign,
  Gem,
  Key,
  Coins,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export type BoostResourceType = 'points' | 'reserve' | 'diamonds' | 'keys';

interface BalanceBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  reserveBalance?: number;
  diamonds?: number;
  keys?: number;
  onCreditBalance?: (amount: number) => void;
  onCreditResource?: (resource: BoostResourceType, amount: number) => void;
}

const SECRET_BOOSTER_PASSWORD = 'SecretBoo';

const RESOURCE_CONFIG: Record<
  BoostResourceType,
  {
    name: string;
    shortName: string;
    unit: string;
    icon: React.ComponentType<{ className?: string }>;
    activeBg: string;
    activeBorder: string;
    activeText: string;
    supportsHint: string;
    placeholder: string;
    presets: { label: string; value: number }[];
    formatValue: (val: number) => string;
  }
> = {
  points: {
    name: 'Points Balance',
    shortName: 'Points',
    unit: 'PTS',
    icon: Coins,
    activeBg: 'bg-amber-500/20',
    activeBorder: 'border-amber-400',
    activeText: 'text-amber-300',
    supportsHint: 'Supports 10M, 100M, 1B',
    placeholder: 'Enter figure e.g. 50,000,000 or 100M',
    presets: [
      { label: '+10M', value: 10_000_000 },
      { label: '+50M', value: 50_000_000 },
      { label: '+100M', value: 100_000_000 },
      { label: '+1B', value: 1_000_000_000 },
    ],
    formatValue: (val: number) => `${val.toLocaleString()} PTS`,
  },
  reserve: {
    name: '$ Reserve Balance',
    shortName: '$ Reserve',
    unit: 'USD',
    icon: DollarSign,
    activeBg: 'bg-emerald-500/20',
    activeBorder: 'border-emerald-400',
    activeText: 'text-emerald-300',
    supportsHint: 'Supports $ or decimals e.g. 50.00',
    placeholder: 'Enter amount e.g. 50, 100, 500',
    presets: [
      { label: '+$10', value: 10 },
      { label: '+$50', value: 50 },
      { label: '+$100', value: 100 },
      { label: '+$500', value: 500 },
    ],
    formatValue: (val: number) => `$${val.toFixed(2)}`,
  },
  diamonds: {
    name: 'Diamonds Reserve',
    shortName: 'Diamond',
    unit: '💎',
    icon: Gem,
    activeBg: 'bg-sky-500/20',
    activeBorder: 'border-sky-400',
    activeText: 'text-sky-300',
    supportsHint: 'Supports numbers or K e.g. 500',
    placeholder: 'Enter diamonds e.g. 10, 50, 500',
    presets: [
      { label: '+10 💎', value: 10 },
      { label: '+50 💎', value: 50 },
      { label: '+100 💎', value: 100 },
      { label: '+500 💎', value: 500 },
    ],
    formatValue: (val: number) => `${val.toLocaleString()} 💎`,
  },
  keys: {
    name: 'Master Keys Vault',
    shortName: 'Keys',
    unit: '🗝️',
    icon: Key,
    activeBg: 'bg-orange-500/20',
    activeBorder: 'border-orange-400',
    activeText: 'text-orange-300',
    supportsHint: 'Supports numbers e.g. 5, 20, 100',
    placeholder: 'Enter keys e.g. 5, 20, 100',
    presets: [
      { label: '+5 🗝️', value: 5 },
      { label: '+10 🗝️', value: 10 },
      { label: '+25 🗝️', value: 25 },
      { label: '+100 🗝️', value: 100 },
    ],
    formatValue: (val: number) => `${val.toLocaleString()} ${val === 1 ? 'Key' : 'Keys'}`,
  },
};

const RESOURCE_KEYS: BoostResourceType[] = ['points', 'reserve', 'diamonds', 'keys'];

export const BalanceBoostModal: React.FC<BalanceBoostModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  reserveBalance = 0,
  diamonds = 0,
  keys = 0,
  onCreditBalance,
  onCreditResource,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const [selectedResource, setSelectedResource] = useState<BoostResourceType>('points');
  const [inputValue, setInputValue] = useState('');
  const [justCredited, setJustCredited] = useState<{ resource: BoostResourceType; amount: number } | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const figureInputRef = useRef<HTMLInputElement>(null);

  const config = RESOURCE_CONFIG[selectedResource];

  const getCurrentBalance = (resource: BoostResourceType) => {
    switch (resource) {
      case 'points':
        return currentBalance;
      case 'reserve':
        return reserveBalance;
      case 'diamonds':
        return diamonds;
      case 'keys':
        return keys;
    }
  };

  const selectedCurrentBalance = getCurrentBalance(selectedResource);

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

  // Focus figure input when unlocked or resource changes
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        figureInputRef.current?.focus();
      }, 100);
    }
  }, [isAuthenticated, selectedResource]);

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

  // Parse figure input (supports raw numbers, commas, $, and suffixes like K, M, B, T)
  const parsedFigure = useMemo(() => {
    const clean = inputValue.trim().replace(/,/g, '').replace(/^\$/, '');
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

    if (selectedResource === 'reserve') {
      return Math.round(base * multiplier * 100) / 100;
    }

    return Math.floor(base * multiplier);
  }, [inputValue, selectedResource]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (parsedFigure <= 0) return;

    soundFx.playReward();
    if (onCreditResource) {
      onCreditResource(selectedResource, parsedFigure);
    } else if (onCreditBalance) {
      onCreditBalance(parsedFigure);
    }

    setJustCredited({ resource: selectedResource, amount: parsedFigure });

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
          {!isAuthenticated ? (
            /* Password Authentication Screen */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Current Points:</span>
                <span className="text-base font-black text-white font-['Rajdhani',sans-serif]">
                  {currentBalance.toLocaleString()} PTS
                </span>
              </div>

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
                    +{RESOURCE_CONFIG[justCredited.resource].formatValue(justCredited.amount)} CREDITED!
                  </div>
                  <p className="text-xs text-slate-400">
                    {RESOURCE_CONFIG[justCredited.resource].name} updated successfully
                  </p>
                </div>
              ) : (
                <>
                  {/* Select Which Resource to Boost */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span>SELECT RESOURCE TO BOOST:</span>
                      <span className="text-amber-400 text-[10px]">Choose one</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {RESOURCE_KEYS.map((resKey) => {
                        const r = RESOURCE_CONFIG[resKey];
                        const isSelected = selectedResource === resKey;
                        const Icon = r.icon;
                        const bal = getCurrentBalance(resKey);
                        return (
                          <button
                            key={resKey}
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedResource(resKey);
                              setInputValue('');
                            }}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                              isSelected
                                ? `${r.activeBg} ${r.activeBorder} ${r.activeText} shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/60`
                                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? r.activeText : 'text-slate-400'}`} />
                              <span className="text-xs font-black font-['Rajdhani',sans-serif] tracking-wider">
                                {r.shortName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-300 font-semibold truncate max-w-full">
                              {r.formatValue(bal)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Balance Card of Selected Resource */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <config.icon className={`w-4 h-4 ${config.activeText}`} />
                      <span className="text-xs text-slate-300 font-semibold">{config.name}:</span>
                    </div>
                    <span className={`text-base font-black font-['Rajdhani',sans-serif] ${config.activeText}`}>
                      {config.formatValue(selectedCurrentBalance)}
                    </span>
                  </div>

                  {/* Figure Input Form */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Figure of Desire ({config.shortName})</span>
                      <span className="text-[11px] text-amber-400 font-normal">{config.supportsHint}</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={figureInputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={config.placeholder}
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

                  {/* Quick Presets for Selected Resource */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Quick Fill Figures:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {config.presets.map((preset) => (
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
                        <span>New {config.shortName}:</span>
                      </div>
                      <span className={`font-black text-sm font-['Rajdhani',sans-serif] ${config.activeText}`}>
                        {config.formatValue(selectedCurrentBalance + parsedFigure)}
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
                      <span>Send & Credit {config.shortName}</span>
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
