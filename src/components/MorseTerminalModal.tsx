import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Trash2, Delete, X, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import { matchMorseCommand, MorseCommand, MorseCommandId } from '../data/morseCommands';
import { soundFx } from '../utils/audio';

interface MorseTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (commandId: MorseCommandId) => void;
}

// Full keyboard rows so no letters are given away
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const MorseTerminalModal: React.FC<MorseTerminalModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [inputBuffer, setInputBuffer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [executedCmd, setExecutedCmd] = useState<MorseCommand | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setInputBuffer('');
      setErrorMsg(null);
      setExecutedCmd(null);
    }
  }, [isOpen]);

  // Instant Automatic Execution when any secret code is recognized
  useEffect(() => {
    if (!isOpen || !inputBuffer || executedCmd) return;

    const cmd = matchMorseCommand(inputBuffer);
    if (cmd) {
      soundFx.playReward();
      setExecutedCmd(cmd);
      setErrorMsg(null);

      const timer = setTimeout(() => {
        onExecuteCommand(cmd.id);
        setExecutedCmd(null);
        setInputBuffer('');
        onClose();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [inputBuffer, isOpen, executedCmd, onExecuteCommand, onClose]);

  // Keyboard listener for physical keyboard typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) {
        if (e.key === 'Escape') onClose();
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z0-9*_\-+]/.test(e.key)) {
        e.preventDefault();
        soundFx.playClick();
        setInputBuffer((prev) => prev + e.key.toUpperCase());
        setErrorMsg(null);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        soundFx.playClick();
        setInputBuffer((prev) => prev.slice(0, -1));
        setErrorMsg(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleManualExecute();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputBuffer]);

  if (!isOpen) return null;

  const handleInputChar = (char: string) => {
    soundFx.playClick();
    setErrorMsg(null);
    setInputBuffer((prev) => prev + char.toUpperCase());
  };

  const handleBackspace = () => {
    soundFx.playClick();
    setErrorMsg(null);
    setInputBuffer((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundFx.playClick();
    setErrorMsg(null);
    setInputBuffer('');
    inputRef.current?.focus();
  };

  const handleManualExecute = () => {
    const cmd = matchMorseCommand(inputBuffer);
    if (!cmd) {
      soundFx.playClick();
      setErrorMsg('ACCESS DENIED • INVALID PROTOCOL');
      return;
    }

    soundFx.playReward();
    setExecutedCmd(cmd);

    setTimeout(() => {
      onExecuteCommand(cmd.id);
      setExecutedCmd(null);
      setInputBuffer('');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#080c14] border-2 border-cyan-500/70 shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col font-mono">
        {/* Terminal Header - Completely Secret (No codes or descriptions shown) */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-black border-b border-cyan-500/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-cyan-300 tracking-wider">
                  CLASSIFIED TERMINAL
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[9px] font-bold text-cyan-300 border border-cyan-500/40 animate-pulse">
                  SECURE LINK
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Authorized protocol input interface</p>
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

        {/* Terminal Screen & Input Field */}
        <div className="p-4 space-y-3 bg-[#05080e]">
          <div className="relative rounded-xl bg-black border border-cyan-500/40 p-3 min-h-[90px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400/70 border-b border-cyan-900/40 pb-1">
              <span>PROTOCOL_BUFFER_STREAM</span>
              <span>{inputBuffer.length} CHARS</span>
            </div>

            {/* Input Characters Display */}
            <div className="py-2 flex items-center justify-between">
              <input
                ref={inputRef}
                type="text"
                value={inputBuffer}
                onChange={(e) => {
                  setInputBuffer(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                placeholder="ENTER ACCESS CODE..."
                className="w-full bg-transparent text-xl sm:text-2xl font-black tracking-widest text-cyan-300 placeholder:text-slate-600 outline-none uppercase font-mono"
              />
              {inputBuffer && (
                <button
                  onClick={handleClear}
                  className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-0.5 ml-2 whitespace-nowrap"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Live Status Bar */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cyan-950">
              {executedCmd ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PROTOCOL ACCEPTED • EXECUTING...</span>
                </div>
              ) : errorMsg ? (
                <div className="flex items-center gap-1 text-rose-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              ) : (
                <span className="text-slate-500 text-[10px]">Awaiting classified instruction sequence</span>
              )}
            </div>
          </div>

          {/* Neutral Complete Keypad (All 26 Alphabet Keys + Asterisk so secret codes remain 100% invisible) */}
          <div className="space-y-1.5 select-none">
            {KEYBOARD_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1">
                {row.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleInputChar(letter)}
                    className="flex-1 max-w-[42px] h-10 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-100 font-black text-sm transition active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}

            {/* Control Row: Asterisk (*), Space, Backspace, Execute */}
            <div className="flex justify-center gap-1.5 pt-1">
              <button
                onClick={() => handleInputChar('*')}
                className="flex-1 h-11 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border-2 border-amber-500/70 hover:border-amber-400 text-amber-300 font-black text-2xl flex items-center justify-center transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                title="Asterisk (*)"
              >
                *
              </button>

              <button
                onClick={handleBackspace}
                disabled={!inputBuffer}
                className="w-16 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 disabled:opacity-40"
              >
                <Delete className="w-4 h-4" />
                <span>DEL</span>
              </button>

              <button
                onClick={handleManualExecute}
                disabled={!inputBuffer}
                className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>EXECUTE PROTOCOL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note - Completely Masked (Zero codes shown) */}
        <div className="px-4 py-2 bg-black/90 border-t border-cyan-900/40 text-[10px] text-slate-400 text-center">
          <span>CLASSIFIED PROTOCOL TERMINAL • ENCRYPTED CIPHER LINK</span>
        </div>
      </div>
    </div>
  );
};
