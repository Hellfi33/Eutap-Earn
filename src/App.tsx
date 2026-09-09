/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, FloatingTapNumber, MineCard } from './types';
import { loadGameState, saveGameState, resetGameState } from './utils/storage';
import { soundFx } from './utils/audio';
import { getTierByCoins } from './data/tiers';
import { getDailyCipherWord } from './data/ciphers';

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
  // - Refills steadily by +1 every second, continuously reflecting in the energy bar, capped at maxEnergy.
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.energy >= prev.maxEnergy) return prev;
        return {
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + 1),
          lastEnergyTimestamp: Date.now(),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 24-Hour Automatic Daily Cipher Cycle:
  // Automatically rotates to today's date-seeded cipher word and resets solved status every 24 hours.
  useEffect(() => {
    const checkDailyCipherReset = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayWord = getDailyCipherWord(todayStr);

      setState((prev) => {
        const isNewDay = prev.lastCipherDate && prev.lastCipherDate !== todayStr;
        if (isNewDay || prev.cipherWord !== todayWord) {
          return {
            ...prev,
            cipherWord: todayWord,
            cipherSolvedToday: isNewDay ? false : prev.cipherSolvedToday,
          };
        }
        return prev;
      });
    };

    checkDailyCipherReset();
    const interval = setInterval(checkDailyCipherReset, 1000);
    return () => clearInterval(interval);
  }, []);

  // 20-Level Progression Check & Tap Cap Level Transition:
  // Level 0 is 100,000 tap points. Each new level is x3 of previous level.
  // "This tap cap section transition (level up) according to level. Meaning, e.g if a player gets to level 5, the cap transitions to level 5 taps (which ever number is marked to the level)."
  useEffect(() => {
    const currentTier = getTierByCoins(state.totalEarned);
    const markedCap = currentTier.maxCoins;
    setState((prev) => {
      const isLevelUp = currentTier.level > prev.tapLevel;
      if (isLevelUp) {
        soundFx.playLevelUp();
      }
      if (prev.tapLevel !== currentTier.level || prev.maxEnergy < markedCap) {
        const newMaxEnergy = Math.max(prev.maxEnergy, markedCap);
        return {
          ...prev,
          tapLevel: currentTier.level,
          maxEnergy: newMaxEnergy,
          energy: isLevelUp ? newMaxEnergy : Math.min(newMaxEnergy, prev.energy),
        };
      }
      return prev;
    });
  }, [state.totalEarned]);

  const isTurboActive = state.turboActiveUntil > Date.now();

  // Core High-Performance Multi-Tap Handler:
  // - The attached section reduces according to the tap rate booster (+1, +5 depending).
  // - Tap speed, deduction speed and point balance topup reflect instantaneously in the exact same state transaction.
  const handleMultiTap = (touches: { clientX: number; clientY: number }[]) => {
    if (touches.length === 0) return;
    lastTapTimeRef.current = Date.now();

    setState((prev) => {
      if (prev.energy <= 0) return prev;

      const now = Date.now();
      const isTurbo = prev.turboActiveUntil > now;
      const ratePerTap = isTurbo ? prev.tapPower * 5 : prev.tapPower;

      let remainingEnergy = prev.energy;
      let totalYield = 0;
      let totalDeduction = 0;
      let tapsExecuted = 0;
      const newFloating: FloatingTapNumber[] = [];

      for (let i = 0; i < touches.length; i++) {
        if (remainingEnergy <= 0) break;

        // Deduction per tap matches player's tap rate booster (+1, +5 depending) up to available energy
        const tapCost = Math.min(remainingEnergy, ratePerTap);
        if (tapCost <= 0) break;

        remainingEnergy -= tapCost;
        totalDeduction += tapCost;
        totalYield += tapCost;
        tapsExecuted++;

        soundFx.playTap(false);

        newFloating.push({
          id: now + i + Math.random(),
          x: touches[i].clientX,
          y: touches[i].clientY,
          amount: tapCost,
          isCrit: false,
        });
      }

      if (tapsExecuted === 0) return prev;

      if (prev.hapticsEnabled) {
        soundFx.triggerHaptic();
      }

      // Keep recent floating indicators without memory buildup
      setFloatingNumbers((curr) => [...curr.slice(-10), ...newFloating]);

      setTimeout(() => {
        const idsToRemove = new Set(newFloating.map((f) => f.id));
        setFloatingNumbers((curr) => curr.filter((f) => !idsToRemove.has(f.id)));
      }, 700);

      // Instantaneous state update: coins and totalEarned increase by totalYield, energy decreases by totalDeduction
      return {
        ...prev,
        coins: prev.coins + totalYield,
        totalEarned: prev.totalEarned + totalYield,
        totalTaps: prev.totalTaps + tapsExecuted,
        energy: remainingEnergy,
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

      const applyBonus = (type: string, value: number) => {
        if (type === 'tap_power') {
          updatedTapPower += value;
        } else if (type === 'max_energy') {
          updatedMaxEnergy += value;
          updatedEnergy = Math.min(updatedMaxEnergy, updatedEnergy + value);
        } else if (type === 'recharge_speed') {
          updatedRecharge += value;
        } else if (type === 'crit_chance') {
          updatedCrit = Math.min(0.5, updatedCrit + value);
        }
      };

      applyBonus(card.effectType, card.effectValue);
      if (card.secondaryEffectType && card.secondaryEffectValue) {
        applyBonus(card.secondaryEffectType, card.secondaryEffectValue);
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
    const diamondGain = day >= 10 ? 25 : day >= 5 ? 5 : 0;
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      diamonds: prev.diamonds + diamondGain,
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
      diamonds: prev.diamonds + 5,
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
      diamonds: prev.diamonds + 10,
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

  const handleUpgradeTapRate = (cost: number) => {
    setState((prev) => {
      if (prev.coins < cost) return prev;
      const currentLevel = (prev.mineCardLevels['multitap'] || 0) + 1;
      return {
        ...prev,
        coins: prev.coins - cost,
        tapPower: prev.tapPower + 1,
        mineCardLevels: {
          ...prev.mineCardLevels,
          multitap: currentLevel,
        },
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
      diamonds: prev.diamonds + (isPremium ? 10 : 3),
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
            reserveBalance={state.reserveBalance}
            diamonds={state.diamonds}
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
              energyRechargeRate={state.energyRechargeRate}
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
      {showDailyCipher && (
        <DailyCipherModal
          isOpen={showDailyCipher}
          onClose={() => setShowDailyCipher(false)}
          cipherWord={state.cipherWord}
          cipherSolvedToday={state.cipherSolvedToday}
          onSolveCipher={handleSolveCipher}
          goldCoinImg={goldCoin}
        />
      )}

      {showDailyReward && (
        <DailyRewardModal
          isOpen={showDailyReward}
          onClose={() => setShowDailyReward(false)}
          streakDay={state.streakDay}
          lastClaimDate={state.lastClaimDate}
          onClaimDay={handleClaimDailyStreak}
          goldCoinImg={goldCoin}
        />
      )}

      {showDailyCombo && (
        <DailyComboModal
          isOpen={showDailyCombo}
          onClose={() => setShowDailyCombo(false)}
          comboSolvedToday={state.comboSolvedToday}
          onSolveCombo={handleSolveCombo}
          goldCoinImg={goldCoin}
        />
      )}

      {showBoost && (
        <BoostModal
          isOpen={showBoost}
          onClose={() => setShowBoost(false)}
          tapPower={state.tapPower}
          onUpgradeTapRate={handleUpgradeTapRate}
          isTurboActive={isTurboActive}
          onBuyFullEnergy={handleBuyFullEnergy}
          onBuyTurbo={handleBuyTurbo}
          onBuyEnergyTank={handleBuyEnergyTank}
          onNavigateToMine={() => setActiveTab('mine')}
          coins={state.coins}
          goldCoinImg={goldCoin}
        />
      )}

      {showWallet && (
        <ConnectWalletModal
          isOpen={showWallet}
          onClose={() => setShowWallet(false)}
          walletConnected={state.walletConnected}
          walletAddress={state.walletAddress}
          walletProvider={state.walletProvider}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
        />
      )}

      {showTierModal && (
        <TierModal
          isOpen={showTierModal}
          onClose={() => setShowTierModal(false)}
          totalEarned={state.totalEarned}
          tapLevel={state.tapLevel}
        />
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          soundEnabled={state.soundEnabled}
          hapticsEnabled={state.hapticsEnabled}
          onToggleSound={() => setState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
          onToggleHaptics={() => setState((p) => ({ ...p, hapticsEnabled: !p.hapticsEnabled }))}
          onResetGame={handleResetGame}
        />
      )}
    </div>
  );
}
