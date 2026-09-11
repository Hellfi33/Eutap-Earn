import React, { useState, useEffect, useMemo } from 'react';
import { X, Layers, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { MINE_CARDS } from '../data/mineCards';
import { soundFx } from '../utils/audio';
import { getDailyComboCards, getDailyComboCountdown } from '../data/combo';

interface DailyComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  comboSolvedToday: boolean;
  onSolveCombo: (reward: number) => void;
  goldCoinImg: string;
}

export const DailyComboModal: React.FC<DailyComboModalProps> = ({
  isOpen,
  onClose,
  comboSolvedToday,
  onSolveCombo,
  goldCoinImg,
}) => {
  // Deterministic 3 secret cards that rotate every 24 hours
  const secretCardIds = useMemo(() => getDailyComboCards(), []);
  const [selectedCards, setSelectedCards] = useState<string[]>(
    comboSolvedToday ? secretCardIds : []
  );
  const [countdown, setCountdown] = useState<string>(getDailyComboCountdown());
  const [wrongAttempt, setWrongAttempt] = useState<boolean>(false);

  // 24hrs ticking countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown(getDailyComboCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Sync state when comboSolvedToday changes or modal opens
  useEffect(() => {
    if (comboSolvedToday) {
      setSelectedCards(secretCardIds);
    } else {
      setSelectedCards([]);
    }
    setWrongAttempt(false);
  }, [comboSolvedToday, secretCardIds, isOpen]);

  if (!isOpen) return null;

  const handleCardClick = (cardId: string) => {
    if (comboSolvedToday) return;
    soundFx.playClick();
    setWrongAttempt(false);

    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else {
      if (selectedCards.length < 3) {
        const next = [...selectedCards, cardId];
        setSelectedCards(next);

        if (next.length === 3) {
          // Check if matches secret cards
          const isMatch = secretCardIds.every((id) => next.includes(id));
          if (isMatch) {
            soundFx.playReward();
            setTimeout(() => {
              onSolveCombo(200000);
            }, 500);
          } else {
            soundFx.triggerHaptic();
            setWrongAttempt(true);
            setTimeout(() => {
              setWrongAttempt(false);
            }, 2000);
          }
        }
      }
    }
  };

  const secretCardObjects = secretCardIds
    .map((id) => MINE_CARDS.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Title & 24h Countdown */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Daily Combo</h3>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{countdown}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
              <span className="text-xs font-bold text-amber-400">+200,000 Coins Jackpot</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          {comboSolvedToday
            ? 'You have already claimed today’s combo reward. The combo resets in 24 hours at 00:00 UTC.'
            : 'Select the 3 secret cards of the day to crack the daily combo. Can only be claimed once every 24 hours.'}
        </p>

        {/* Selected 3 slots */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[0, 1, 2].map((slotIdx) => {
            const cardId = selectedCards[slotIdx];
            const card = MINE_CARDS.find((c) => c.id === cardId);

            return (
              <div
                key={slotIdx}
                className={`h-20 rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition ${
                  comboSolvedToday
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : card
                    ? wrongAttempt
                      ? 'bg-red-950/30 border-red-500/50 text-red-300'
                      : 'bg-amber-500/10 border-amber-400/60 text-amber-300'
                    : 'bg-black/40 border-white/10 text-slate-600 border-dashed'
                }`}
              >
                {card ? (
                  <>
                    <span className="text-xs font-bold truncate max-w-[80px]">{card.name}</span>
                    <span
                      className={`text-[9px] mt-1 font-mono font-bold px-1 rounded ${
                        comboSolvedToday
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : wrongAttempt
                          ? 'text-red-400 bg-red-500/20'
                          : 'text-amber-400 bg-amber-500/20'
                      }`}
                    >
                      {comboSolvedToday ? 'SOLVED' : wrongAttempt ? 'WRONG' : 'SELECTED'}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-500">Slot {slotIdx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {wrongAttempt && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Incorrect 3-card combination. Try different cards!</span>
          </div>
        )}

        {comboSolvedToday ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Daily Combo Claimed (1/1 Today)</h4>
            <p className="text-xs text-emerald-300 mt-1">
              +200,000 coins added to your balance.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Next combo in: <strong className="text-amber-400 font-bold">{countdown}</strong></span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tap cards to select ({selectedCards.length}/3):
              </span>
              {selectedCards.length > 0 && (
                <button
                  onClick={() => setSelectedCards([])}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {MINE_CARDS.map((card) => {
                const isSelected = selectedCards.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                        : 'bg-[#1a202c] border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{card.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize mt-0.5">{card.category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {comboSolvedToday
              ? 'Completed today • Resets every 24hrs'
              : `Hint categories: ${secretCardObjects.map((c) => c?.category).join(', ')}`}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </div>
    </div>
  );
};

