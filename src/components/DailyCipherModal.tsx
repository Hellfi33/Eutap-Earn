import React, { useState } from 'react';
import { X, Key, Check, HelpCircle, Delete } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface DailyCipherModalProps {
  isOpen: boolean;
  onClose: () => void;
  cipherWord: string;
  cipherSolvedToday: boolean;
  onSolveCipher: (reward: number) => void;
  goldCoinImg: string;
}

// Morse code alphabet
const MORSE_MAP: Record<string, string> = {
  E: '.',
  U: '..-',
  T: '-',
  A: '.-',
  P: '.--.',
  H: '....',
  M: '--',
  S: '...',
  R: '.-.',
  K: '-.-',
};

export const DailyCipherModal: React.FC<DailyCipherModalProps> = ({
  isOpen,
  onClose,
  cipherWord,
  cipherSolvedToday,
  onSolveCipher,
  goldCoinImg,
}) => {
  if (!isOpen) return null;

  const targetLetters = cipherWord.toUpperCase().split('');
  const [solvedLetters, setSolvedLetters] = useState<string[]>(
    cipherSolvedToday ? targetLetters : []
  );
  const [currentMorse, setCurrentMorse] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const currentTargetIndex = solvedLetters.length;
  const currentTargetLetter = targetLetters[currentTargetIndex];

  const handleAddSymbol = (symbol: '.' | '-') => {
    soundFx.playClick();
    const nextMorse = currentMorse + symbol;
    setCurrentMorse(nextMorse);

    // Check if matches current letter
    if (currentTargetLetter && MORSE_MAP[currentTargetLetter] === nextMorse) {
      soundFx.playReward();
      const updated = [...solvedLetters, currentTargetLetter];
      setSolvedLetters(updated);
      setCurrentMorse('');
      setFeedback(`Correct! Letter "${currentTargetLetter}" deciphered!`);

      if (updated.length === targetLetters.length) {
        // Complete cipher solved!
        setTimeout(() => {
          onSolveCipher(1000000);
        }, 800);
      }
    } else if (currentTargetLetter && !MORSE_MAP[currentTargetLetter].startsWith(nextMorse)) {
      // Wrong sequence
      setFeedback('Incorrect Morse signal. Resetting letter sequence.');
      setTimeout(() => {
        setCurrentMorse('');
      }, 500);
    }
  };

  const handleClear = () => {
    soundFx.playClick();
    setCurrentMorse('');
    setFeedback('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative">
        {/* Close button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Daily Cipher</h3>
            <div className="flex items-center gap-1">
              <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
              <span className="text-xs font-bold text-amber-400">+1,000,000 Coins Bounty</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Input the Morse Code signal for today's secret word to decode the cipher and claim the jackpot.
        </p>

        {/* Target Word Letters Display */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 mb-4 flex items-center justify-center gap-2.5">
          {targetLetters.map((char, index) => {
            const isDecoded = index < solvedLetters.length;
            const isCurrent = index === solvedLetters.length;

            return (
              <div
                key={index}
                className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isDecoded
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'
                    : isCurrent
                    ? 'border-purple-500 bg-purple-950/40 text-white animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'border-white/10 bg-white/5 text-slate-500'
                }`}
              >
                <span className="text-lg font-black font-['Rajdhani',sans-serif]">
                  {isDecoded ? char : isCurrent ? '?' : '•'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {MORSE_MAP[char] || ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Buffer */}
        <div className="text-center mb-4 min-h-[32px] flex flex-col items-center justify-center">
          <div className="text-xl font-mono tracking-widest text-purple-300 font-bold">
            {currentMorse || 'Tap • or — to encode'}
          </div>
          {feedback && <div className="text-[11px] text-amber-400 mt-1">{feedback}</div>}
        </div>

        {/* Morse Code Buttons */}
        {!cipherSolvedToday && solvedLetters.length < targetLetters.length ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="morse-dot-btn"
                onClick={() => handleAddSymbol('.')}
                className="py-4 rounded-2xl bg-[#1e2536] hover:bg-[#252f44] border border-white/10 text-white font-black text-xl flex flex-col items-center justify-center transition active:scale-95 shadow"
              >
                <span className="text-2xl leading-none">•</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Short (Dot)</span>
              </button>

              <button
                id="morse-dash-btn"
                onClick={() => handleAddSymbol('-')}
                className="py-4 rounded-2xl bg-[#1e2536] hover:bg-[#252f44] border border-white/10 text-white font-black text-xl flex flex-col items-center justify-center transition active:scale-95 shadow"
              >
                <span className="text-2xl leading-none">—</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Long (Dash)</span>
              </button>
            </div>

            <button
              onClick={handleClear}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Delete className="w-3.5 h-3.5" />
              <span>Clear Current Signal</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center text-center">
            <Check className="w-8 h-8 text-emerald-400 mb-1" />
            <h4 className="text-sm font-bold text-white">Daily Cipher Solved!</h4>
            <p className="text-xs text-emerald-300 mt-0.5">+1,000,000 coins claimed.</p>
          </div>
        )}

        {/* Cheat / Help Hint */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Today's Word: <strong className="text-purple-300">EUTAP</strong></span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">• / ..- / - / .- / .--.</span>
        </div>
      </div>
    </div>
  );
};
