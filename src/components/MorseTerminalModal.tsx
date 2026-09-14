import React, { useState, useEffect } from 'react';
import { Terminal, Send, Trash2, Delete, X, Eye, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MORSE_COMMANDS, matchMorseCommand, MorseCommand } from '../data/morseCommands';
import { soundFx } from '../utils/audio';

interface MorseTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: MorseCommand) => void;
}

export const MorseTerminalModal: React.FC<MorseTerminalModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [morseInput, setMorseInput] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [executedCmd, setExecutedCmd] = useState<MorseCommand | null>(null);

  // Keyboard listener for typing *, +, -, Space, Backspace, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '*' || e.key === '+' || e.key === '-') {
        e.preventDefault();
        soundFx.playClick();
        setMorseInput((prev) => prev + e.key);
        setErrorMsg(null);
      } else if (e.key === ' ') {
        e.preventDefault();
        soundFx.playClick();
        setMorseInput((prev) => (prev.endsWith(' ') ? prev : prev + ' '));
        setErrorMsg(null);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        soundFx.playClick();
        setMorseInput((prev) => prev.slice(0, -1));
        setErrorMsg(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, morseInput]);

  if (!isOpen) return null;

  const matchedCommand = matchMorseCommand(morseInput);

  const handleInputChar = (char: string) => {
    soundFx.playClick();
    setErrorMsg(null);
    if (char === ' ') {
      setMorseInput((prev) => (prev.endsWith(' ') ? prev : prev + ' '));
    } else {
      setMorseInput((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    soundFx.playClick();
    setErrorMsg(null);
    setMorseInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundFx.playClick();
    setErrorMsg(null);
    setMorseInput('');
  };

  const handleExecute = () => {
    const cmd = matchMorseCommand(morseInput);
    if (!cmd) {
      soundFx.playClick();
      setErrorMsg('UNRECOGNIZED TRANSMISSION SEQUENCE');
      return;
    }

    soundFx.playReward();
    setExecutedCmd(cmd);

    setTimeout(() => {
      onExecuteCommand(cmd);
      setExecutedCmd(null);
      setMorseInput('');
      onClose();
    }, 900);
  };

  const handleSelectFromGuide = (code: string) => {
    soundFx.playClick();
    setMorseInput(code);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0a0e17] border-2 border-cyan-500/70 shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col font-mono">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-black border-b border-cyan-500/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-cyan-300 tracking-wider">
                  CLASSIFIED MORSE TERMINAL
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[9px] font-bold text-cyan-300 border border-cyan-500/40 animate-pulse">
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Tactical 8-Command Signal Receptor</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowGuide(!showGuide);
              }}
              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 transition"
              title="View Command Signal Codes"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">Signal Codes</span>
            </button>
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
        </div>

        {/* Collapsible Reference Signal Codes List */}
        {showGuide && (
          <div className="p-3 bg-black/90 border-b border-cyan-500/30 max-h-52 overflow-y-auto space-y-1.5 text-xs animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 pb-1 border-b border-white/10">
              <span>ATTACHED SIGNAL SPECIFICATION</span>
              <span className="text-slate-400 text-[10px]">Click any code to load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {MORSE_COMMANDS.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelectFromGuide(cmd.code)}
                  className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-left transition group"
                >
                  <div>
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300">
                      {idx + 1}. {cmd.title}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{cmd.description}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-black/60 font-mono text-cyan-400 font-black text-[11px] border border-cyan-700/50">
                    {cmd.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Terminal Screen / Display */}
        <div className="p-4 space-y-3 bg-[#060911]">
          <div className="relative rounded-xl bg-black border border-cyan-500/40 p-3 min-h-[90px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400/70 border-b border-cyan-900/40 pb-1">
              <span>TRANSMISSION_INPUT_BUFFER</span>
              <span>{morseInput.length} SYMBOLS</span>
            </div>

            {/* Input Characters */}
            <div className="py-2 break-all text-xl sm:text-2xl font-black tracking-widest text-cyan-300 flex flex-wrap items-center gap-1">
              {morseInput ? (
                morseInput.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`inline-block ${
                      char === ' '
                        ? 'w-3 h-6 bg-cyan-900/40 mx-1 rounded'
                        : char === '*'
                        ? 'text-amber-400 font-bold'
                        : char === '+'
                        ? 'text-emerald-400 font-bold'
                        : 'text-cyan-400 font-bold'
                    }`}
                  >
                    {char === ' ' ? '' : char}
                  </span>
                ))
              ) : (
                <span className="text-slate-600 text-sm font-normal">
                  Tap buttons (*, +, -) or type morse sequence...
                </span>
              )}
              <span className="inline-block w-2.5 h-6 bg-cyan-400 animate-pulse" />
            </div>

            {/* Live Match / Status Bar */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cyan-950">
              {executedCmd ? (
                <div className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EXECUTING: {executedCmd.title.toUpperCase()}...</span>
                </div>
              ) : matchedCommand ? (
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>RECOGNIZED: {matchedCommand.title.toUpperCase()}</span>
                </div>
              ) : errorMsg ? (
                <div className="flex items-center gap-1 text-rose-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              ) : (
                <span className="text-slate-500 text-[10px]">Awaiting complete signature</span>
              )}

              {morseInput && (
                <button
                  onClick={handleClear}
                  className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Tactical Morse Keypad */}
          <div className="space-y-2">
            {/* Primary Morse Symbols: * (Star), + (Plus), - (Dash) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleInputChar('*')}
                className="py-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-black text-3xl flex flex-col items-center justify-center transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                <span>*</span>
                <span className="text-[10px] font-sans font-semibold text-amber-400/80 -mt-1">STAR / DOT</span>
              </button>

              <button
                onClick={() => handleInputChar('+')}
                className="py-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-black text-3xl flex flex-col items-center justify-center transition active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <span>+</span>
                <span className="text-[10px] font-sans font-semibold text-emerald-400/80 -mt-1">PLUS</span>
              </button>

              <button
                onClick={() => handleInputChar('-')}
                className="py-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-black text-3xl flex flex-col items-center justify-center transition active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                <span>-</span>
                <span className="text-[10px] font-sans font-semibold text-cyan-400/80 -mt-1">DASH</span>
              </button>
            </div>

            {/* Utility Row: Space, Backspace, Execute */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleInputChar(' ')}
                className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <span>SPACE</span>
                <span className="text-[10px] text-slate-500">(␣)</span>
              </button>

              <button
                onClick={handleBackspace}
                disabled={!morseInput}
                className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40"
              >
                <Delete className="w-4 h-4" />
                <span>DEL</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={!morseInput}
                className={`py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 ${
                  matchedCommand
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>EXECUTE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-4 py-2 bg-black/80 border-t border-cyan-900/40 text-[10px] text-slate-400 text-center">
          Correct Morse spelling triggers automatic command execution instantly.
        </div>
      </div>
    </div>
  );
};
