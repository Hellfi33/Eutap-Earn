import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  hapticsEnabled,
  onToggleSound,
  onToggleHaptics,
  onResetGame,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">Game Settings</h3>
        <span className="text-xs text-slate-400 mb-4">Manage audio, haptics, and data preferences</span>

        <div className="space-y-3 mb-5">
          {/* Sound FX */}
          <div className="p-3.5 rounded-2xl bg-[#1a202c] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <h4 className="text-xs font-bold text-white">Sound Effects</h4>
                <span className="text-[10px] text-slate-400">Audio feedback on taps and claims</span>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Vibrations */}
          <div className="p-3.5 rounded-2xl bg-[#1a202c] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className={`w-5 h-5 ${hapticsEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <h4 className="text-xs font-bold text-white">Haptic Feedback</h4>
                <span className="text-[10px] text-slate-400">Vibration response on tap</span>
              </div>
            </div>

            <button
              onClick={onToggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                hapticsEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-3 border-t border-white/5">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game to 0 Balance & Level 0</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Confirm Reset?</span>
              </div>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                This will reset your coins to 0 and level to 0 as requested.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => {
                    onResetGame();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contract / Project Details */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Project: EuTap ($EUTAP)</span>
          <span>Build: v1.0.0-TGE</span>
        </div>
      </div>
    </div>
  );
};
