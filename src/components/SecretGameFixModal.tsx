import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Dice5,
  TrendingUp,
  CheckCircle,
  Power,
  RefreshCw,
} from 'lucide-react';
import {
  GameFixConfig,
  getGameFixConfig,
  saveGameFixConfig,
} from '../utils/gameFixManager';
import { WHEEL_SEQUENCE, getPocketByNumber } from '../data/rouletteData';
import { soundFx } from '../utils/audio';

interface SecretGameFixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretGameFixModal: React.FC<SecretGameFixModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<GameFixConfig>(getGameFixConfig());
  const [activeTab, setActiveTab] = useState<'roulette' | 'dice' | 'hnl'>('roulette');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getGameFixConfig());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time automatic persistence on every user interaction
  const updateConfig = (updater: (prev: GameFixConfig) => GameFixConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      saveGameFixConfig(next);
      return next;
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const handleSave = () => {
    saveGameFixConfig(config);
    soundFx.playReward();
    soundFx.triggerHaptic(30);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleResetAll = () => {
    soundFx.playClick();
    const resetCfg: GameFixConfig = {
      roulette: {
        enabled: false,
        mode: 'number',
        fixedNumber: 0,
        fixedColor: 'green',
      },
      dice: {
        enabled: false,
        die1: 6,
        die2: 6,
      },
      hnl: {
        enabled: false,
        mode: 'higher',
        fixedNumber: 777,
      },
    };
    setConfig(resetCfg);
    saveGameFixConfig(resetCfg);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0c121e] via-[#090d16] to-[#05080e] border-2 border-amber-500/70 shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col font-mono max-h-[94vh]">
        {/* Classified Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-950/70 via-slate-900 to-black border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-300 tracking-wider">
                  CLASSIFIED OVERRIDE CONSOLE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-bold text-amber-300 border border-amber-500/40">
                  **RLT*S
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                System-wide outcome manipulation unit
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

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-black/60 border-b border-white/10 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('roulette');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'roulette'
                ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Roulette</span>
            {config.roulette.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('dice');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'dice'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dice5 className="w-3.5 h-3.5" />
            <span>Dice</span>
            {config.dice.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('hnl');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'hnl'
                ? 'bg-rose-500/20 border border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-white/5 border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>H&L</span>
            {config.hnl.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ROULETTE FIX */}
          {activeTab === 'roulette' && (
            <div className="space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121827] border border-white/10">
                <div>
                  <div className="text-xs font-black text-amber-300">
                    ROULETTE OUTCOME OVERRIDE
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {config.roulette.enabled
                      ? 'ACTIVE • Spin will land on designated result'
                      : 'OFF • System RNG active (Fair Play)'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      roulette: { ...prev.roulette, enabled: !prev.roulette.enabled },
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 ${
                    config.roulette.enabled
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{config.roulette.enabled ? 'ACTIVE' : 'BYPASS'}</span>
                </button>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      roulette: { ...prev.roulette, mode: 'number' },
                    }));
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    config.roulette.mode === 'number'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  Pick Exact Number (0-64)
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      roulette: { ...prev.roulette, mode: 'color' },
                    }));
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    config.roulette.mode === 'color'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  Pick Forced Color
                </button>
              </div>

              {/* Exact Number Picker */}
              {config.roulette.mode === 'number' && (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">
                      Selected Target Pocket:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black font-mono shadow ${
                        getPocketByNumber(config.roulette.fixedNumber).color === 'green'
                          ? 'bg-emerald-600 text-white'
                          : getPocketByNumber(config.roulette.fixedNumber).color === 'red'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 border border-slate-700 text-white'
                      }`}
                    >
                      {config.roulette.fixedNumber}{' '}
                      {getPocketByNumber(config.roulette.fixedNumber).color.toUpperCase()}
                    </span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[0, 7, 12, 17, 26, 33, 42, 50, 64].map((num) => {
                      const pocket = getPocketByNumber(num);
                      return (
                        <button
                          key={num}
                          onClick={() => {
                            soundFx.playClick();
                            updateConfig((prev) => ({
                              ...prev,
                              roulette: { ...prev.roulette, fixedNumber: num },
                            }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black font-mono transition border ${
                            config.roulette.fixedNumber === num
                              ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                              : 'border-white/10 opacity-80 hover:opacity-100'
                          } ${
                            pocket.color === 'green'
                              ? 'bg-emerald-700 text-white'
                              : pocket.color === 'red'
                              ? 'bg-rose-700 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slider or Number input */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Slide or enter number:</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {config.roulette.fixedNumber} / 64
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="64"
                      value={config.roulette.fixedNumber}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateConfig((prev) => ({
                          ...prev,
                          roulette: { ...prev.roulette, fixedNumber: val },
                        }));
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Color Force Picker */}
              {config.roulette.mode === 'color' && (
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      updateConfig((prev) => ({
                        ...prev,
                        roulette: { ...prev.roulette, fixedColor: 'red' },
                      }));
                    }}
                    className={`py-3 rounded-xl text-xs font-black transition border flex flex-col items-center justify-center gap-1 ${
                      config.roulette.fixedColor === 'red'
                        ? 'bg-rose-600 border-white text-white ring-2 ring-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                        : 'bg-rose-950/40 border-rose-900/60 text-rose-300 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <span>FORCE RED</span>
                    <span className="text-[10px] opacity-80">(Pays 2x)</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      updateConfig((prev) => ({
                        ...prev,
                        roulette: { ...prev.roulette, fixedColor: 'green' },
                      }));
                    }}
                    className={`py-3 rounded-xl text-xs font-black transition border flex flex-col items-center justify-center gap-1 ${
                      config.roulette.fixedColor === 'green'
                        ? 'bg-emerald-600 border-white text-white ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                        : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <span>FORCE 0 GREEN</span>
                    <span className="text-[10px] opacity-80">(Pays 35x!)</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      updateConfig((prev) => ({
                        ...prev,
                        roulette: { ...prev.roulette, fixedColor: 'black' },
                      }));
                    }}
                    className={`py-3 rounded-xl text-xs font-black transition border flex flex-col items-center justify-center gap-1 ${
                      config.roulette.fixedColor === 'black'
                        ? 'bg-slate-900 border-white text-white ring-2 ring-slate-400 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <span>FORCE BLACK</span>
                    <span className="text-[10px] opacity-80">(Pays 2x)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DICE FIX */}
          {activeTab === 'dice' && (
            <div className="space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121827] border border-white/10">
                <div>
                  <div className="text-xs font-black text-cyan-300">
                    DICE OUTCOME OVERRIDE
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {config.dice.enabled
                      ? 'ACTIVE • 2 Ludo Dice will land on chosen faces'
                      : 'OFF • Standard random dice roll'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      dice: { ...prev.dice, enabled: !prev.dice.enabled },
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 ${
                    config.dice.enabled
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{config.dice.enabled ? 'ACTIVE' : 'BYPASS'}</span>
                </button>
              </div>

              {/* Die 1 Selection */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-xs text-slate-300 font-bold flex justify-between">
                  <span>Die 1 Face:</span>
                  <span className="text-cyan-300 font-mono font-black">
                    Face [{config.dice.die1}]
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((face) => (
                    <button
                      key={face}
                      onClick={() => {
                        soundFx.playClick();
                        updateConfig((prev) => ({
                          ...prev,
                          dice: { ...prev.dice, die1: face },
                        }));
                      }}
                      className={`py-2 rounded-xl text-sm font-black transition border ${
                        config.dice.die1 === face
                          ? 'bg-cyan-500 text-black border-white shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {face}
                    </button>
                  ))}
                </div>
              </div>

              {/* Die 2 Selection */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-xs text-slate-300 font-bold flex justify-between">
                  <span>Die 2 Face:</span>
                  <span className="text-cyan-300 font-mono font-black">
                    Face [{config.dice.die2}]
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((face) => (
                    <button
                      key={face}
                      onClick={() => {
                        soundFx.playClick();
                        updateConfig((prev) => ({
                          ...prev,
                          dice: { ...prev.dice, die2: face },
                        }));
                      }}
                      className={`py-2 rounded-xl text-sm font-black transition border ${
                        config.dice.die2 === face
                          ? 'bg-cyan-500 text-black border-white shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {face}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      dice: { ...prev.dice, die1: 6, die2: 6 },
                    }));
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition"
                >
                  Double 6 (Max Prize)
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      dice: { ...prev.dice, die1: 1, die2: 1 },
                    }));
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Double 1
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: H&L FIX */}
          {activeTab === 'hnl' && (
            <div className="space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121827] border border-white/10">
                <div>
                  <div className="text-xs font-black text-rose-300">
                    HIGHER & LOWER OUTCOME OVERRIDE
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {config.hnl.enabled
                      ? 'ACTIVE • H&L will land on your designated outcome'
                      : 'OFF • System RNG active'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      hnl: { ...prev.hnl, enabled: !prev.hnl.enabled },
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 ${
                    config.hnl.enabled
                      ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{config.hnl.enabled ? 'ACTIVE' : 'BYPASS'}</span>
                </button>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      hnl: { ...prev.hnl, mode: 'higher' },
                    }));
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    config.hnl.mode === 'higher'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  ▲ Force HIGHER (Guaranteed Win)
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      hnl: { ...prev.hnl, mode: 'lower' },
                    }));
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    config.hnl.mode === 'lower'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  ▼ Force LOWER (Guaranteed Win)
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      hnl: { ...prev.hnl, mode: 'zero' },
                    }));
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    config.hnl.mode === 'zero'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  ● Force ZERO (0)
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    updateConfig((prev) => ({
                      ...prev,
                      hnl: { ...prev.hnl, mode: 'exact' },
                    }));
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    config.hnl.mode === 'exact'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  # Exact Custom Number
                </button>
              </div>

              {/* Exact Number Configuration */}
              {config.hnl.mode === 'exact' && (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-xs text-slate-300 font-bold block">
                    Enter Exact Landing Number:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={config.hnl.fixedNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      updateConfig((prev) => ({
                        ...prev,
                        hnl: { ...prev.hnl, fixedNumber: val },
                      }));
                    }}
                    className="w-full bg-[#121827] border border-rose-500/50 rounded-xl px-3 py-2 text-lg font-black text-rose-300 font-mono outline-none"
                    placeholder="e.g. 777"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {[0, 50, 100, 300, 777, 888, 999].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          soundFx.playClick();
                          updateConfig((prev) => ({
                            ...prev,
                            hnl: { ...prev.hnl, fixedNumber: val },
                          }));
                        }}
                        className="flex-1 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white font-mono"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleResetAll}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
            title="Deactivate all overrides and restore fair RNG"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" />
                SAVED
              </span>
            )}

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.5)] transition active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>APPLY OVERRIDES</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
