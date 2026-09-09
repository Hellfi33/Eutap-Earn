import React, { useState, useEffect } from 'react';
import { X, Key, Check, HelpCircle, Delete, Clock } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { MORSE_MAP, getWordMorse, getDailyCipherCountdown } from '../data/ciphers';

interface DailyCipherModalProps {
  isOpen: boolean;
  onClose: () => void;
  cipherWord: string;
  cipherSolvedToday: boolean;
  onSolveCipher: (reward: number) => void;
  goldCoinImg: string;
}

export const DailyCipherModal: React.FC<DailyCipherModalProps> = ({
  isOpen,
  onClose,
  cipherWord,
  cipherSolvedToday,
  onSolveCipher,
  goldCoinImg,
}) => {
  const targetLetters = (cipherWord || 'EUTAP').toUpperCase().split('');
  const [solvedLetters, setSolvedLetters] = useState<string[]>(
    cipherSolvedToday ? targetLetters : []
  );
  const [currentMorse, setCurrentMorse] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [countdown, setCountdown] = useState<string>(getDailyCipherCountdown());

  // 24hrs ticking countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown(getDailyCipherCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Synchronize when cipherWord changes
  useEffect(() => {
    if (cipherSolvedToday) {
      setSolvedLetters((cipherWord || 'EUTAP').toUpperCase().split(''));
    } else {
      setSolvedLetters([]);
    }
    setCurrentMorse('');
    setFeedback('');
  }, [cipherWord, cipherSolvedToday, isOpen]);

  if (!isOpen) return null;

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
      setFeedback(`Letter "${currentTargetLetter}" deciphered!`);

      if (updated.length === targetLetters.length) {
        // Complete cipher solved! Exactly 200,000 points reward
        setTimeout(() => {
          onSolveCipher(200000);
        }, 600);
      }
    } else if (currentTargetLetter && !MORSE_MAP[currentTargetLetter]?.startsWith(nextMorse)) {
      // Wrong sequence
      setFeedback('Incorrect Morse signal. Resetting signal.');
      setTimeout(() => {
        setCurrentMorse('');
      }, 400);
    }
  };

  const handleClear = () => {
    soundFx.playClick();
    setCurrentMorse('');
    setFeedback('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative max-h-[92vh] overflow-y-auto">
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
              <span className="text-xs font-bold text-amber-400">+200,000 Coins Bounty</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Input the Morse Code signal for today's secret word to decode the cipher and claim the 200,000 points reward.
        </p>

        {/* Decoder Header with 24hrs Ticking Countdown */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
            Secret Cipher Word
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2.5 py-1 rounded-lg">
            <Clock className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>Resets in: {countdown}</span>
          </div>
        </div>

        {/* Target Word Letters Display */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 mb-3 flex items-center justify-center gap-2 overflow-x-auto">
          {targetLetters.map((char, index) => {
            const isDecoded = index < solvedLetters.length;
            const isCurrent = index === solvedLetters.length;

            return (
              <div
                key={index}
                className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center transition-all shrink-0 ${
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
                <span className="text-[9px] font-mono text-slate-400">
                  {MORSE_MAP[char] || ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Buffer */}
        <div className="text-center mb-3 min-h-[30px] flex flex-col items-center justify-center">
          <div className="text-xl font-mono tracking-widest text-purple-300 font-bold">
            {currentMorse || 'Tap • or — to encode'}
          </div>
          {feedback && <div className="text-[11px] text-amber-400 mt-0.5">{feedback}</div>}
        </div>

        {/* Morse Code Buttons */}
        {!cipherSolvedToday && solvedLetters.length < targetLetters.length ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="morse-dot-btn"
                onClick={() => handleAddSymbol('.')}
                className="py-3.5 rounded-2xl bg-[#1e2536] hover:bg-[#252f44] border border-white/10 text-white font-black text-xl flex flex-col items-center justify-center transition active:scale-95 shadow"
              >
                <span className="text-2xl leading-none">•</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Short (Dot)</span>
              </button>

              <button
                id="morse-dash-btn"
                onClick={() => handleAddSymbol('-')}
                className="py-3.5 rounded-2xl bg-[#1e2536] hover:bg-[#252f44] border border-white/10 text-white font-black text-xl flex flex-col items-center justify-center transition active:scale-95 shadow"
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
            <p className="text-xs text-emerald-300 mt-0.5 font-medium">+200,000 coins claimed.</p>
            
            <div className="mt-3.5 pt-3 border-t border-emerald-500/20 w-full flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Next Cipher Available In</span>
              </div>
              <div className="text-lg font-mono font-black text-amber-300 tracking-wider">
                {countdown}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                Every 24 hours, you are allowed to participate in the new cipher.
              </span>
            </div>
          </div>
        )}

        {/* Cheat / Help Hint with Full Morse Sequence */}
        <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-col gap-1 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Active Word: <strong className="text-purple-300">{cipherWord}</strong></span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Morse Decoder Active</span>
          </div>
          <div className="font-mono text-[10px] text-purple-400/80 bg-black/30 p-1.5 rounded-lg text-center tracking-wider">
            {getWordMorse(cipherWord)}
          </div>
        </div>
      </div>
    </div>
  );
};
