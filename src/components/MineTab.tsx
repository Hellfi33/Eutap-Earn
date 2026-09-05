import React, { useState } from 'react';
import { Zap, BatteryCharging, Activity, Sparkles, Cpu, ShieldCheck, Atom, Check } from 'lucide-react';
import { MineCard } from '../types';
import { MINE_CARDS, getCardCost } from '../data/mineCards';
import { soundFx } from '../utils/audio';

interface MineTabProps {
  coins: number;
  tapPower: number;
  tapLevel: number;
  maxEnergy: number;
  critChance: number;
  mineCardLevels: Record<string, number>;
  onUpgradeCard: (card: MineCard, cost: number) => void;
  goldCoinImg: string;
}

export const MineTab: React.FC<MineTabProps> = ({
  coins,
  tapPower,
  tapLevel,
  maxEnergy,
  critChance,
  mineCardLevels,
  onUpgradeCard,
  goldCoinImg,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'skills' | 'nodes' | 'special'>('all');

  const filteredCards = MINE_CARDS.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'battery-charging':
        return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-cyan-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-teal-400" />;
      case 'atom':
        return <Atom className="w-5 h-5 text-rose-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] px-4 pb-24 max-w-md mx-auto select-none">
      {/* Tap Rate Stats Card */}
      <div className="bg-[#141923] border border-white/10 rounded-2xl p-4 mt-2 mb-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Tap Level</span>
            <div className="text-xl font-black text-amber-400 font-['Rajdhani',sans-serif]">
              Level {tapLevel}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tap Power Rate</span>
            <div className="flex items-center gap-1.5 justify-end">
              <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
              <span className="text-xl font-black text-white font-['Rajdhani',sans-serif]">+{tapPower} / tap</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div>Max Energy: <span className="text-slate-200 font-bold">{maxEnergy}</span></div>
          <div>Crit Strike: <span className="text-cyan-400 font-bold">{Math.round(critChance * 100)}%</span></div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Upgrades' },
          { id: 'skills', label: 'Tap Power' },
          { id: 'nodes', label: 'Nodes' },
          { id: 'special', label: 'Special' },
        ].map((cat) => (
          <button
            key={cat.id}
            id={`mine-cat-${cat.id}`}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(cat.id as any);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat.id
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-[#141923] text-slate-400 border-white/5 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-2.5">
        {filteredCards.map((card) => {
          const currentLevel = mineCardLevels[card.id] || 0;
          const isMax = currentLevel >= card.maxLevel;
          const cost = getCardCost(card, currentLevel);
          const canAfford = coins >= cost;

          return (
            <div
              key={card.id}
              id={`mine-card-${card.id}`}
              className="bg-[#141923] border border-white/10 hover:border-white/20 rounded-2xl p-3.5 flex flex-col gap-2 transition shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    {getCardIcon(card.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{card.name}</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                        Lv. {currentLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </div>

              {/* Upgrade Button Row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Cost:</span>
                  {isMax ? (
                    <span className="text-xs font-bold text-emerald-400">Max Level Reached</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <img src={goldCoinImg} alt="" referrerPolicy="no-referrer" className="w-3.5 h-3.5 rounded-full" />
                      <span className="text-xs font-black text-amber-400 font-['Rajdhani',sans-serif]">
                        {cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {!isMax && (
                  <button
                    id={`upgrade-btn-${card.id}`}
                    disabled={!canAfford}
                    onClick={() => {
                      soundFx.playReward();
                      onUpgradeCard(card, cost);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.3)] active:scale-95'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade</span>
                  </button>
                )}
                {isMax && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Maxed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
