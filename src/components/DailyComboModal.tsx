import React, { useState } from 'react';
import { X, Layers, Check, Sparkles } from 'lucide-react';
import { MINE_CARDS } from '../data/mineCards';
import { soundFx } from '../utils/audio';

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
  if (!isOpen) return null;

  // Today's secret combo cards
  const secretCardIds = ['multitap', 'energy-battery', 'l2-validator'];
  const [selectedCards, setSelectedCards] = useState<string[]>(
    comboSolvedToday ? secretCardIds : []
  );

  const handleCardClick = (cardId: string) => {
    if (comboSolvedToday) return;
    soundFx.playClick();

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
              onSolveCombo(5000000);
            }, 600);
          }
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Daily Combo</h3>
            <div className="flex items-center gap-1">
              <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
              <span className="text-xs font-bold text-amber-400">+5,000,000 Coins Jackpot</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Select the 3 secret cards of the day to crack the combo and claim 5 million coins.
        </p>

        {/* Selected 3 slots */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[0, 1, 2].map((slotIdx) => {
            const cardId = selectedCards[slotIdx];
            const card = MINE_CARDS.find((c) => c.id === cardId);

            return (
              <div
                key={slotIdx}
                className={`h-20 rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition ${
                  card
                    ? 'bg-amber-500/10 border-amber-400/60 text-amber-300'
                    : 'bg-black/40 border-white/10 text-slate-600 border-dashed'
                }`}
              >
                {card ? (
                  <>
                    <span className="text-xs font-bold truncate max-w-[80px]">{card.name}</span>
                    <span className="text-[10px] text-amber-400 mt-1 font-mono">SELECTED</span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-500">Slot {slotIdx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {comboSolvedToday ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center text-center">
            <Check className="w-7 h-7 text-emerald-400 mb-1" />
            <h4 className="text-sm font-bold text-white">Daily Combo Claimed!</h4>
            <p className="text-xs text-emerald-300 mt-0.5">+5,000,000 coins rewarded.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tap cards to test combo:
            </span>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
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

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Hint: Multitap, Battery, L2 Node</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </div>
    </div>
  );
};
