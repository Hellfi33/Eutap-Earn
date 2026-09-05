import React from 'react';
import { Pickaxe, Users, CircleDollarSign } from 'lucide-react';
import { soundFx } from '../utils/audio';

export type TabType = 'exchange' | 'mine' | 'friends' | 'earn' | 'airdrop';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  goldCoinImg: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  goldCoinImg,
}) => {
  const tabs: { id: TabType; label: string; icon?: React.ReactNode; custom?: boolean }[] = [
    {
      id: 'exchange',
      label: 'Exchange',
      custom: true,
    },
    {
      id: 'mine',
      label: 'Mine',
      icon: <Pickaxe className="w-5 h-5" />,
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'earn',
      label: 'Earn',
      icon: <CircleDollarSign className="w-5 h-5" />,
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      custom: true,
    },
  ];

  return (
    <nav className="w-full shrink-0 z-40 bg-[#0c1017]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom,6px)] pt-1 px-1.5">
      <div className="w-full grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                soundFx.playClick();
                onTabChange(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <div className="absolute top-0 w-7 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}

              <div className="h-5 sm:h-6 flex items-center justify-center mb-0.5">
                {tab.id === 'exchange' ? (
                  <span
                    className={`text-[9px] sm:text-[10px] font-black tracking-wider px-1.5 py-0.2 rounded border transition ${
                      isActive
                        ? 'border-amber-400/60 bg-amber-400/15 text-amber-300'
                        : 'border-white/15 bg-white/5 text-slate-400'
                    }`}
                  >
                    EUTAP
                  </span>
                ) : tab.id === 'airdrop' ? (
                  <div className="relative">
                    <img
                      src={goldCoinImg}
                      alt="Airdrop"
                      referrerPolicy="no-referrer"
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover transition ${
                        isActive ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#0c1017]' : 'opacity-70'
                      }`}
                    />
                  </div>
                ) : (
                  tab.icon
                )}
              </div>

              <span className={`text-[10px] sm:text-[11px] leading-none whitespace-nowrap tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
