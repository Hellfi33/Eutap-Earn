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

  // STAMINA REGENERATION ONLY:
  // Note: As explicitly requested by the user, the balance DOES NOT auto-earn.
  // This timer strictly recharges tap energy/stamina up to maxEnergy so player can tap again.
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.energy >= prev.maxEnergy) return prev;
        const newEnergy = Math.min(prev.maxEnergy, prev.energy + prev.energyRechargeRate);
        return {
          ...prev,
          energy: newEnergy,
          lastEnergyTimestamp: Date.now(),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Level check based on totalEarned
  const prevTierLevelRef = useRef<number>(getTierByCoins(state.totalEarned).level);
  useEffect(() => {
    const currentTier = getTierByCoins(state.totalEarned);
    if (currentTier.level > prevTierLevelRef.current) {
      soundFx.playLevelUp();
      prevTierLevelRef.current = currentTier.level;
      setState((prev) => ({
        ...prev,
        tapLevel: Math.max(prev.tapLevel, currentTier.level),
      }));
    }
  }, [state.totalEarned]);

  const isTurboActive = state.turboActiveUntil > Date.now();

  // Core Tap Handler
  const handleTap = (clientX: number, clientY: number) => {
    if (state.energy <= 0) return;

    // Check critical strike
    const isCrit = Math.random() < state.critChance;
    const critMultiplier = isCrit ? 5 : 1;
    const turboMultiplier = isTurboActive ? 5 : 1;
    const tapYield = state.tapPower * critMultiplier * turboMultiplier;

    // Play tap sound & haptics
    soundFx.playTap(isCrit);
    if (state.hapticsEnabled) {
      soundFx.triggerHaptic();
    }

    // Add floating number
    const newId = Date.now() + Math.random();
    setFloatingNumbers((prev) => [
      ...prev,
      { id: newId, x: clientX, y: clientY, amount: tapYield, isCrit },
    ]);

    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
    }, 750);

    // Update state: Add coins & reduce stamina
    setState((prev) => ({
      ...prev,
      coins: prev.coins + tapYield,
      totalEarned: prev.totalEarned + tapYield,
      totalTaps: prev.totalTaps + 1,
      energy: Math.max(0, prev.energy - 1),
      lastEnergyTimestamp: Date.now(),
    }));
  };

  // Card Upgrade Handler (Mine Tab)
  const handleUpgradeCard = (card: MineCard, cost: number) => {
    if (state.coins < cost) return;

    const currentCardLevel = (state.mineCardLevels[card.id] || 0) + 1;

    setState((prev) => {
      let updatedTapPower = prev.tapPower;
      let updatedMaxEnergy = prev.maxEnergy;
      let updatedEnergy = prev.energy;
      let updatedRecharge = prev.energyRechargeRate;
      let updatedCrit = prev.critChance;
      let updatedTapLevel = prev.tapLevel;

      if (card.effectType === 'tap_power') {
        updatedTapPower += card.effectValue;
        updatedTapLevel += 1; // upgrading tap power directly levels up the user!
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
        tapLevel: updatedTapLevel,
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

  // Boosters
  const handleUseFullEnergy = () => {
    if (state.fullEnergyRemaining <= 0) return;
    setState((prev) => ({
      ...prev,
      energy: prev.maxEnergy,
      fullEnergyRemaining: prev.fullEnergyRemaining - 1,
    }));
  };

  const handleActivateTurbo = () => {
    if (state.turboRemainingToday <= 0) return;
    setState((prev) => ({
      ...prev,
      turboActiveUntil: Date.now() + 20000,
      turboRemainingToday: prev.turboRemainingToday - 1,
    }));
    setShowBoost(false);
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
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col justify-between max-w-lg mx-auto relative overflow-x-hidden">
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
      <main className="flex-1 w-full flex flex-col">
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
            onTap={handleTap}
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
        )}

        {activeTab === 'friends' && (
          <FriendsTab
            squadMembers={state.squadMembers}
            squadEarnings={state.squadEarnings}
            referralCode={state.referralCode}
            onSimulateInvite={handleSimulateInvite}
            goldCoinImg={goldCoin}
          />
        )}

        {activeTab === 'earn' && (
          <EarnTab
            completedTaskIds={state.completedTaskIds}
            streakDay={state.streakDay}
            onCompleteTask={handleCompleteTask}
            onOpenDailyReward={() => setShowDailyReward(true)}
            goldCoinImg={goldCoin}
          />
        )}

        {activeTab === 'airdrop' && (
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
        fullEnergyRemaining={state.fullEnergyRemaining}
        turboRemaining={state.turboRemainingToday}
        isTurboActive={isTurboActive}
        onUseFullEnergy={handleUseFullEnergy}
        onActivateTurbo={handleActivateTurbo}
        onNavigateToMine={() => setActiveTab('mine')}
        coins={state.coins}
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
