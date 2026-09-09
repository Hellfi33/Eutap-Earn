import React, { useState } from 'react';
import {
  Zap,
  BatteryCharging,
  Activity,
  Sparkles,
  Cpu,
  ShieldCheck,
  Atom,
  Check,
  Flame,
  Gauge,
  Server,
  Layers,
  Network,
  Boxes,
  Database,
  Coins,
  Workflow,
  Rocket,
  Radio,
  Lock,
} from 'lucide-react';
import { MineCard } from '../types';
import { MINE_CARDS, getCardCost } from '../data/mineCards';
import { soundFx } from '../utils/audio';

interface MineTabProps {
  coins: number;
  tapPower: number;
  tapLevel: number;
  maxEnergy: number;
  critChance: number;
  energyRechargeRate?: number;
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
  energyRechargeRate = 1,
  mineCardLevels,
  onUpgradeCard,
  goldCoinImg,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'skills' | 'nodes' | 'special' | 'protocol'>('all');

  const filteredCards = MINE_CARDS.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const totalUpgradesCount = (Object.values(mineCardLevels) as number[]).reduce((acc, lvl) => acc + (lvl || 0), 0);

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
      case 'flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'gauge':
        return <Gauge className="w-5 h-5 text-lime-400" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-teal-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-indigo-400" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-violet-400" />;
      case 'network':
        return <Network className="w-5 h-5 text-sky-400" />;
      case 'atom':
        return <Atom className="w-5 h-5 text-rose-400" />;
      case 'boxes':
        return <Boxes className="w-5 h-5 text-fuchsia-400" />;
      case 'database':
        return <Database className="w-5 h-5 text-pink-400" />;
      case 'coins':
        return <Coins className="w-5 h-5 text-amber-300" />;
      case 'workflow':
        return <Workflow className="w-5 h-5 text-emerald-300" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-cyan-300" />;
      case 'radio':
        return <Radio className="w-5 h-5 text-blue-300" />;
      case 'lock':
        return <Lock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCategoryBadge = (cat: MineCard['category']) => {
    switch (cat) {
      case 'skills':
        return { label: 'Tap Power', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'nodes':
        return { label: 'Nodes', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'special':
        return { label: 'Special', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'protocol':
        return { label: 'Protocol', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Upgrade', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  const formatEffectBadge = (type: string, val: number) => {
    switch (type) {
      case 'tap_power':
        return `+${val} / tap`;
      case 'max_energy':
        return `+${val.toLocaleString()} Energy`;
      case 'recharge_speed':
        return `+${val}/s Recharge`;
      case 'crit_chance':
        return `+${Math.round(val * 100)}% Crit`;
      default:
        return `+${val}`;
    }
  };

  return (
    <div className="flex flex-col px-3.5 pt-2 pb-20 max-w-md mx-auto select-none">
      {/* Tap Rate Stats Card */}
      <div className="bg-[#141923] border border-white/10 rounded-2xl p-4 mt-2 mb-3 shadow-lg relative overflow-hidden">
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

        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-xs text-slate-400">
          <div>Max Energy: <span className="text-slate-200 font-bold block sm:inline">{maxEnergy.toLocaleString()}</span></div>
          <div>Crit Strike: <span className="text-cyan-400 font-bold block sm:inline">{Math.round(critChance * 100)}%</span></div>
          <div className="text-right">Recharge: <span className="text-emerald-400 font-bold block sm:inline">+{energyRechargeRate}/s</span></div>
        </div>

        <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Active Boosts Installed: <strong className="text-amber-400">{totalUpgradesCount}</strong></span>
          <span className="text-slate-400 font-medium">Auto-synced with tap engine</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'all', label: 'All Upgrades', count: MINE_CARDS.length },
          { id: 'skills', label: 'Tap Power', count: MINE_CARDS.filter((c) => c.category === 'skills').length },
          { id: 'nodes', label: 'Nodes', count: MINE_CARDS.filter((c) => c.category === 'nodes').length },
          { id: 'special', label: 'Special', count: MINE_CARDS.filter((c) => c.category === 'special').length },
          { id: 'protocol', label: 'Protocol', count: MINE_CARDS.filter((c) => c.category === 'protocol').length },
        ].map((cat) => (
          <button
            key={cat.id}
            id={`mine-cat-${cat.id}`}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(cat.id as any);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                : 'bg-[#141923] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/10'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedCategory === cat.id ? 'bg-amber-400/30 text-amber-200' : 'bg-white/5 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
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
          const catBadge = getCategoryBadge(card.category);
          const progressPercent = Math.min(100, Math.round((currentLevel / card.maxLevel) * 100));

          return (
            <div
              key={card.id}
              id={`mine-card-${card.id}`}
              className="bg-[#141923] border border-white/10 hover:border-white/20 rounded-2xl p-3.5 flex flex-col gap-2.5 transition shadow-md relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {getCardIcon(card.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100">{card.name}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${catBadge.color}`}>
                        {catBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </div>

              {/* Booster Features Bar */}
              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Boost:</span>
                  <span className="text-[11px] font-bold text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {formatEffectBadge(card.effectType, card.effectValue)}
                  </span>
                  {card.secondaryEffectType && card.secondaryEffectValue && (
                    <span className="text-[11px] font-bold text-cyan-300 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">
                      {formatEffectBadge(card.secondaryEffectType, card.secondaryEffectValue)}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-slate-300">
                    Lv. {currentLevel} <span className="text-slate-500">/ {card.maxLevel}</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Upgrade Button Row */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
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
