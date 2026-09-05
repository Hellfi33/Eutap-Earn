/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, FloatingTapNumber, MineCard } from './types';
import { loadGameState, saveGameState, resetGameState } from './utils/storage';
import { soundFx } from './utils/audio';
import { getTierByCoins } from './data/tiers';

// Assets
import mascotAvatar from './assets/images/eutap_mascot_avatar_1788588061680.jpg';
import goldCoin from './assets/images/eutap_gold_coin_1788588078119.jpg';

// Components
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { TapExchange } from './components/TapExchange';
import { MineTab } from './components/MineTab';
import { FriendsTab } from './components/FriendsTab';
import { EarnTab } from './components/EarnTab';
import { AirdropTab } from './components/AirdropTab';

// Modals
import { DailyCipherModal } from './components/DailyCipherModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { DailyComboModal } from './components/DailyComboModal';
import { BoostModal } from './components/BoostModal';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { TierModal } from './components/TierModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [activeTab, setActiveTab] = useState<TabType>('exchange');
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingTapNumber[]>([]);

  // Modals
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showDailyCipher, setShowDailyCipher] = useState(false);
  const [showDailyCombo, setShowDailyCombo] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Sync soundFx config
  useEffect(() => {
    soundFx.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Save on state change
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Timestamp of the latest player tap
  const lastTapTimeRef = useRef<number>(0);

  // ENERGY REFILL ENGINE:
  // - 1 tap is -1 from energy refill, as fast as user taps.
  // - Every hold (no tap for >= 500ms) increases energy refill (+1 per second).
  useEffect(() => {
    const timer = setInterval(() => {
      const timeSinceLastTap = Date.now() - lastTapTimeRef.current;
      // Refill only when the player holds without tapping
      if (timeSinceLastTap >= 500) {
        setState((prev) => {
          if (prev.energy >= prev.maxEnergy) return prev;
          return {
            ...prev,
            energy: Math.min(prev.maxEnergy, prev.energy + 1),
            lastEnergyTimestamp: Date.now(),
          };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 20-Level Progression Check:
  // Level 0 is 100,000 tap points. Each new level is x3 of previous level.
  useEffect(() => {
    const currentTier = getTierByCoins(state.totalEarned);
    setState((prev) => {
      if (prev.tapLevel !== currentTier.level) {
        if (currentTier.level > prev.tapLevel) {
          soundFx.playLevelUp();
        }
        return {
          ...prev,
          tapLevel: currentTier.level,
        };
      }
      return prev;
    });
  }, [state.totalEarned]);

  const isTurboActive = state.turboActiveUntil > Date.now();

  // Core High-Performance Multi-Tap Handler:
  // - Start point is level 0. Every tap is 1 point (or user's leveled tap rate).
  // - 1 tap is strictly -1 from energy.
  // - Double-tap prevention ensures exact 1:1 attribution.
  const handleMultiTap = (touches: { clientX: number; clientY: number }[]) => {
    if (touches.length === 0) return;
    lastTapTimeRef.current = Date.now();

    setState((prev) => {
      if (prev.energy <= 0) return prev;

      // Each tap strictly costs 1 energy up to current energy cap
      const tapsToExecute = Math.min(touches.length, prev.energy);
      if (tapsToExecute <= 0) return prev;

      const now = Date.now();
      const isTurbo = prev.turboActiveUntil > now;
      let totalYield = 0;
      const newFloating: FloatingTapNumber[] = [];

      for (let i = 0; i < tapsToExecute; i++) {
        // Every tap 1 point base (multiplied by turbo if active, and scales with tap rate upgrade)
        const tapYield = isTurbo ? prev.tapPower * 5 : prev.tapPower;
        totalYield += tapYield;

        soundFx.playTap(false);

        newFloating.push({
          id: now + i + Math.random(),
          x: touches[i].clientX,
          y: touches[i].clientY,
          amount: tapYield,
          isCrit: false,
        });
      }

      if (prev.hapticsEnabled) {
        soundFx.triggerHaptic();
      }

      // Keep recent floating indicators without memory buildup
      setFloatingNumbers((curr) => [...curr.slice(-10), ...newFloating]);

      setTimeout(() => {
        const idsToRemove = new Set(newFloating.map((f) => f.id));
        setFloatingNumbers((curr) => curr.filter((f) => !idsToRemove.has(f.id)));
      }, 700);

      // Instantaneous state update: coins increase by tap points and energy drops -1 per tap
      return {
        ...prev,
        coins: prev.coins + totalYield,
        totalEarned: prev.totalEarned + totalYield,
        totalTaps: prev.totalTaps + tapsToExecute,
        energy: Math.max(0, prev.energy - tapsToExecute),
        lastEnergyTimestamp: now,
      };
    });
  };

  // Card Upgrade Handler (Mine Tab)
  // Tap rate leveling cost is in thousands of points, starting at 8,000 and randomly increasing
  const handleUpgradeCard = (card: MineCard, cost: number) => {
    if (state.coins < cost) return;

    const currentCardLevel = (state.mineCardLevels[card.id] || 0) + 1;

    setState((prev) => {
      let updatedTapPower = prev.tapPower;
      let updatedMaxEnergy = prev.maxEnergy;
      let updatedEnergy = prev.energy;
      let updatedRecharge = prev.energyRechargeRate;
      let updatedCrit = prev.critChance;

      if (card.effectType === 'tap_power') {
        updatedTapPower += card.effectValue;
      } else if (card.effectType === 'max_energy') {
        updatedMaxEnergy += card.effectValue;
        updatedEnergy = Math.min(updatedMaxEnergy, updatedEnergy + card.effectValue);
      } else if (card.effectType === 'recharge_speed') {
        updatedRecharge += card.effectValue;
      } else if (card.effectType === 'crit_chance') {
        updatedCrit = Math.min(0.5, updatedCrit + card.effectValue);
      }

      return {
        ...prev,
        coins: prev.coins - cost,
        tapPower: updatedTapPower,
        maxEnergy: updatedMaxEnergy,
        energy: updatedEnergy,
        energyRechargeRate: updatedRecharge,
        critChance: updatedCrit,
        mineCardLevels: {
          ...prev.mineCardLevels,
          [card.id]: currentCardLevel,
        },
      };
    });
  };

  // Task Completion Handler
  const handleCompleteTask = (taskId: string, reward: number) => {
    setState((prev) => {
      if (prev.completedTaskIds.includes(taskId)) return prev;
      return {
        ...prev,
        coins: prev.coins + reward,
        totalEarned: prev.totalEarned + reward,
        completedTaskIds: [...prev.completedTaskIds, taskId],
      };
    });
  };

  // Daily Streak Claim
  const handleClaimDailyStreak = (day: number, reward: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      streakDay: day,
      lastClaimDate: todayStr,
    }));
    setShowDailyReward(false);
  };

  // Daily Cipher Solve
  const handleSolveCipher = (reward: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      cipherSolvedToday: true,
      lastCipherDate: todayStr,
    }));
  };

  // Daily Combo Solve
  const handleSolveCombo = (reward: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      comboSolvedToday: true,
      lastComboDate: todayStr,
    }));
  };

  // Boosters: all costs/charges are strictly in thousands of points
  const handleBuyFullEnergy = (cost: number) => {
    setState((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        energy: prev.maxEnergy,
      };
    });
  };

  const handleBuyTurbo = (cost: number) => {
    setState((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        turboActiveUntil: Date.now() + 20000,
      };
    });
    setShowBoost(false);
  };

  const handleBuyEnergyTank = (cost: number) => {
    setState((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        maxEnergy: prev.maxEnergy + 500,
        energy: prev.energy + 500,
      };
    });
  };

  // Web3 Wallet
  const handleConnectWallet = (provider: string, address: string) => {
    setState((prev) => {
      const alreadyRewarded = prev.completedTaskIds.includes('wallet-connect-task');
      const bonus = alreadyRewarded ? 0 : 50000;
      return {
        ...prev,
        walletConnected: true,
        walletProvider: provider,
        walletAddress: address,
        coins: prev.coins + bonus,
        totalEarned: prev.totalEarned + bonus,
        completedTaskIds: alreadyRewarded
          ? prev.completedTaskIds
          : [...prev.completedTaskIds, 'wallet-connect-task'],
      };
    });
    setShowWallet(false);
  };

  const handleDisconnectWallet = () => {
    setState((prev) => ({
      ...prev,
      walletConnected: false,
      walletProvider: null,
      walletAddress: null,
    }));
  };

  // Friends Simulate
  const handleSimulateInvite = (isPremium: boolean) => {
    const bonus = isPremium ? 250000 : 50000;
    const names = ['Alex_Crypto', 'Elena_Ton', 'Satoshi_Fan', 'Vicky_Tap', 'David_Sol', 'Dmitry_BKX'];
    const randomName = names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 900 + 100);

    const newMember = {
      id: 'friend-' + Date.now(),
      name: randomName,
      avatar: '',
      level: Math.floor(Math.random() * 5),
      joinedAt: 'Just now',
      earnedForYou: bonus,
      isPremium,
    };

    setState((prev) => ({
      ...prev,
      coins: prev.coins + bonus,
      totalEarned: prev.totalEarned + bonus,
      squadEarnings: prev.squadEarnings + bonus,
      squadMembers: [newMember, ...prev.squadMembers],
    }));
  };

  // Reset Game
  const handleResetGame = () => {
    soundFx.playClick();
    const cleanState = resetGameState();
    setState(cleanState);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-md mx-auto bg-[#0b0e14] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Top Fixed Header */}
      <Header
        coins={state.coins}
        totalEarned={state.totalEarned}
        tapLevel={state.tapLevel}
        tapPower={state.tapPower}
        walletConnected={state.walletConnected}
        onOpenWallet={() => setShowWallet(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTierModal={() => setShowTierModal(true)}
        onOpenBoost={() => setShowBoost(true)}
        goldCoinImg={goldCoin}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full flex flex-col overflow-hidden min-h-0 relative">
        {activeTab === 'exchange' && (
          <TapExchange
            coins={state.coins}
            energy={state.energy}
            maxEnergy={state.maxEnergy}
            tapPower={state.tapPower}
            critChance={state.critChance}
            streakDay={state.streakDay}
            cipherSolvedToday={state.cipherSolvedToday}
            comboSolvedToday={state.comboSolvedToday}
            isTurboActive={isTurboActive}
            onMultiTap={handleMultiTap}
            floatingNumbers={floatingNumbers}
            onOpenDailyReward={() => setShowDailyReward(true)}
            onOpenDailyCipher={() => setShowDailyCipher(true)}
            onOpenDailyCombo={() => setShowDailyCombo(true)}
            onOpenBoost={() => setShowBoost(true)}
            mascotImg={mascotAvatar}
            goldCoinImg={goldCoin}
          />
        )}

        {activeTab === 'mine' && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <MineTab
              coins={state.coins}
              tapPower={state.tapPower}
              tapLevel={state.tapLevel}
              maxEnergy={state.maxEnergy}
              critChance={state.critChance}
              mineCardLevels={state.mineCardLevels}
              onUpgradeCard={handleUpgradeCard}
              goldCoinImg={goldCoin}
            />
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <FriendsTab
              squadMembers={state.squadMembers}
              squadEarnings={state.squadEarnings}
              referralCode={state.referralCode}
              onSimulateInvite={handleSimulateInvite}
              goldCoinImg={goldCoin}
            />
          </div>
        )}

        {activeTab === 'earn' && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <EarnTab
              completedTaskIds={state.completedTaskIds}
              streakDay={state.streakDay}
              onCompleteTask={handleCompleteTask}
              onOpenDailyReward={() => setShowDailyReward(true)}
              goldCoinImg={goldCoin}
            />
          </div>
        )}

        {activeTab === 'airdrop' && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <AirdropTab
              walletConnected={state.walletConnected}
              walletAddress={state.walletAddress}
              walletProvider={state.walletProvider}
              coins={state.coins}
              totalEarned={state.totalEarned}
              tapLevel={state.tapLevel}
              totalTaps={state.totalTaps}
              squadCount={state.squadMembers.length}
              onOpenWallet={() => setShowWallet(true)}
              goldCoinImg={goldCoin}
            />
          </div>
        )}
      </main>

      {/* Bottom 5-Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        goldCoinImg={goldCoin}
      />

      {/* Modals */}
      <DailyCipherModal
        isOpen={showDailyCipher}
        onClose={() => setShowDailyCipher(false)}
        cipherWord={state.cipherWord}
        cipherSolvedToday={state.cipherSolvedToday}
        onSolveCipher={handleSolveCipher}
        goldCoinImg={goldCoin}
      />

      <DailyRewardModal
        isOpen={showDailyReward}
        onClose={() => setShowDailyReward(false)}
        streakDay={state.streakDay}
        lastClaimDate={state.lastClaimDate}
        onClaimDay={handleClaimDailyStreak}
        goldCoinImg={goldCoin}
      />

      <DailyComboModal
        isOpen={showDailyCombo}
        onClose={() => setShowDailyCombo(false)}
        comboSolvedToday={state.comboSolvedToday}
        onSolveCombo={handleSolveCombo}
        goldCoinImg={goldCoin}
      />

      <BoostModal
        isOpen={showBoost}
        onClose={() => setShowBoost(false)}
        isTurboActive={isTurboActive}
        onBuyFullEnergy={handleBuyFullEnergy}
        onBuyTurbo={handleBuyTurbo}
        onBuyEnergyTank={handleBuyEnergyTank}
        onNavigateToMine={() => setActiveTab('mine')}
        coins={state.coins}
        goldCoinImg={goldCoin}
      />

      <ConnectWalletModal
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
        walletConnected={state.walletConnected}
        walletAddress={state.walletAddress}
        walletProvider={state.walletProvider}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />

      <TierModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        totalEarned={state.totalEarned}
        tapLevel={state.tapLevel}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        soundEnabled={state.soundEnabled}
        hapticsEnabled={state.hapticsEnabled}
        onToggleSound={() => setState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
        onToggleHaptics={() => setState((p) => ({ ...p, hapticsEnabled: !p.hapticsEnabled }))}
        onResetGame={handleResetGame}
      />
    </div>
  );
}
