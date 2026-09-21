import React from 'react';
import { Pickaxe, Users, CircleDollarSign, MessageSquare } from 'lucide-react';
import { soundFx } from '../utils/audio';

export type TabType = 'exchange' | 'mine' | 'friends' | 'earn' | 'messages' | 'airdrop';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  goldCoinImg: string;
  unreadMessagesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  goldCoinImg,
  unreadMessagesCount = 0,
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
      id: 'messages',
      label: 'Messages',
      custom: true,
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      custom: true,
    },
  ];

  return (
    <nav className="w-full shrink-0 z-40 bg-[#0c1017]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom,6px)] pt-1 px-1">
      <div className="w-full grid grid-cols-6 gap-0.5 sm:gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isMessages = tab.id === 'messages';

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
                  ? isMessages
                    ? 'text-cyan-300 bg-cyan-950/40'
                    : 'text-amber-400 bg-white/5'
                  : isMessages && unreadMessagesCount > 0
                  ? 'text-cyan-400 hover:text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <div
                  className={`absolute top-0 w-6 h-0.5 rounded-full ${
                    isMessages
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  }`}
                />
              )}

              <div className="h-5 sm:h-6 flex items-center justify-center mb-0.5">
                {tab.id === 'exchange' ? (
                  <span
                    className={`text-[8px] sm:text-[9px] font-black tracking-wider px-1 py-0.2 rounded border transition ${
                      isActive
                        ? 'border-amber-400/60 bg-amber-400/15 text-amber-300'
                        : 'border-white/15 bg-white/5 text-slate-400'
                    }`}
                  >
                    EUTAP
                  </span>
                ) : tab.id === 'messages' ? (
                  /* Custom Message Box Button matching Screenshot_20260920-124714~2.jpg */
                  <div className="relative">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                          : unreadMessagesCount > 0
                          ? 'border-cyan-500/60 bg-cyan-950/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'border-white/15 bg-white/5 text-slate-400 hover:border-cyan-500/40 hover:text-slate-300'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </div>

                    {/* Circular cyan unread badge matching image */}
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-black flex items-center justify-center ring-2 ring-[#0c1017] shadow-[0_0_8px_rgba(6,182,212,0.8)] font-mono animate-pulse">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </div>
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

              <span
                className={`text-[9px] sm:text-[10px] leading-none whitespace-nowrap tracking-tight ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
