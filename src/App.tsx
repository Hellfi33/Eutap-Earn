/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, FloatingTapNumber, MineCard } from './types';
import { loadGameState, saveGameState, resetGameState } from './utils/storage';
import { soundFx } from './utils/audio';
import { getTierByCoins } from './data/tiers';
import { getDailyCipherWord } from './data/ciphers';
import { calculateTotalPph } from './data/mineCards';

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
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { WheelOfFortuneModal, FortuneReward } from './components/WheelOfFortuneModal';
import { TreePluckModal, TreePluckReward } from './components/TreePluckModal';
import { LayHatchModal, HatchReward } from './components/LayHatchModal';
import { DiceGameModal, DiceOutcome } from './components/DiceGameModal';
import { PphClaimModal } from './components/PphClaimModal';
import { BoostModal } from './components/BoostModal';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { TierModal } from './components/TierModal';
import { SettingsModal } from './components/SettingsModal';

// Secret Morse Code & Stage Modals
import { MorseTerminalModal } from './components/MorseTerminalModal';
import { SecretReserveWithdrawalModal } from './components/SecretReserveWithdrawalModal';
import { SecretDiamondWheelModal } from './components/SecretDiamondWheelModal';
import { BalanceDebitModal } from './components/BalanceDebitModal';
import { LuckyChanceWheelModal } from './components/LuckyChanceWheelModal';
import { StageEvolutionModal } from './components/StageEvolutionModal';
import { MorseCommandId } from './data/morseCommands';
import { getTiersList, getLevelTapCap, STAGE_2_TIERS } from './data/tiers';
import { getSeasonalSkinByLevel } from './data/seasonalSkins';

export default function App() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [activeTab, setActiveTab] = useState<TabType>('exchange');
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingTapNumber[]>([]);

  // Modals
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showDailyCipher, setShowDailyCipher] = useState(false);
  const [showDailyCombo, setShowDailyCombo] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [showWheelOfFortuneModal, setShowWheelOfFortuneModal] = useState(false);
  const [showTreePluckModal, setShowTreePluckModal] = useState(false);
  const [showLayHatchModal, setShowLayHatchModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [showPphClaimModal, setShowPphClaimModal] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Secret Morse Modals & Execution States
  const [showMorseTerminal, setShowMorseTerminal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDiamondWheelModal, setShowDiamondWheelModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [showLuckyChanceModal, setShowLuckyChanceModal] = useState(false);
  const [showStageEvolutionModal, setShowStageEvolutionModal] = useState(false);
  const [isAutoTapping, setIsAutoTapping] = useState(false);
  const [morseToastMessage, setMorseToastMessage] = useState<string | null>(null);

  // Auto-dismiss transient toast messages after 1.2s so secret codes never leave persistent notices
  useEffect(() => {
    if (!morseToastMessage) return;
    const timer = setTimeout(() => {
      setMorseToastMessage(null);
    }, 1200);
    return () => clearTimeout(timer);
  }, [morseToastMessage]);

  // Periodic check for Wheel of Fortune (24h) and Lay & Hatch (7h) lock expirations
  useEffect(() => {
    const checkTimer = () => {
      setState((prev) => {
        let updated = false;
        let nextSpins = prev.wheelOfFortuneSpins;
        let nextWheelRefill = prev.wheelOfFortuneNextRefillTime;
        let nextEggs = prev.layHatchEggsAvailable;
        let nextHatchRefill = prev.layHatchNextRefillTime;

        if (
          prev.wheelOfFortuneNextRefillTime &&
          prev.wheelOfFortuneNextRefillTime > 0 &&
          Date.now() >= prev.wheelOfFortuneNextRefillTime
        ) {
          nextSpins = 6;
          nextWheelRefill = 0;
          updated = true;
        }

        if (
          prev.layHatchNextRefillTime &&
          prev.layHatchNextRefillTime > 0 &&
          Date.now() >= prev.layHatchNextRefillTime
        ) {
          nextEggs = 5;
          nextHatchRefill = 0;
          updated = true;
        }

        if (updated) {
          return {
            ...prev,
            wheelOfFortuneSpins: nextSpins,
            wheelOfFortuneNextRefillTime: nextWheelRefill,
            layHatchEggsAvailable: nextEggs,
            layHatchNextRefillTime: nextHatchRefill,
          };
        }
        return prev;
      });
    };

    const interval = setInterval(checkTimer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Profit Per Hour (PPH) calculation & hourly claim trigger (online & offline manual claim)
  const pphRate = useMemo(() => calculateTotalPph(state.mineCardLevels), [state.mineCardLevels]);

  useEffect(() => {
    if (pphRate <= 0) return;

    const checkPphReady = () => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - (state.lastPphClaimTime || now));
      const hours = Math.floor(elapsedMs / (3600 * 1000));
      if (hours >= 1 && !showPphClaimModal) {
        setShowPphClaimModal(true);
      }
    };

    checkPphReady();
    const pphInterval = setInterval(checkPphReady, 4000);
    return () => clearInterval(pphInterval);
  }, [pphRate, state.lastPphClaimTime, showPphClaimModal]);

  const handleClaimPphReward = () => {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - (state.lastPphClaimTime || now));
    const hours = Math.max(1, Math.floor(elapsedMs / (3600 * 1000)));
    const claimAmount = hours * pphRate;

    if (claimAmount > 0) {
      const leftoverMs = elapsedMs % (3600 * 1000);
      const newClaimTime = now - leftoverMs;

      setState((prev) => ({
        ...prev,
        coins: prev.coins + claimAmount,
        totalEarned: prev.totalEarned + claimAmount,
        lastPphClaimTime: newClaimTime,
      }));

      setMorseToastMessage(`💰 Claimed +${claimAmount.toLocaleString()} PPH Points (${hours}h)!`);
    }

    setShowPphClaimModal(false);
  };

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

  // AUTO-TAP STREAM ENGINE (Triggered via secret code AA**, stopped via SP**):
  // When active, continuously increments point balance automatically by the player's tap rate
  // exactly as if user is tapping. It stays active until player stops it.
  useEffect(() => {
    if (!isAutoTapping) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        const isTurbo = prev.turboActiveUntil > now;
        const ratePerTap = isTurbo ? prev.tapPower * 5 : prev.tapPower;

        // Visual floating tap indicator
        setFloatingNumbers((curr) => [
          ...curr.slice(-5),
          {
            id: now + Math.random(),
            x: window.innerWidth / 2 + (Math.random() * 80 - 40),
            y: window.innerHeight * 0.46 + (Math.random() * 40 - 20),
            amount: ratePerTap,
            isCrit: isTurbo,
          },
        ]);

        const energyCost = Math.min(prev.energy, ratePerTap);

        return {
          ...prev,
          coins: prev.coins + ratePerTap,
          totalEarned: prev.totalEarned + ratePerTap,
          totalTaps: prev.totalTaps + 1,
          energy: Math.max(0, prev.energy - energyCost),
          lastEnergyTimestamp: now,
        };
      });

      // Subtle tap sound periodically
      if (Math.random() < 0.25) {
        soundFx.playTap(false);
      }
    }, 250); // 4 taps/sec: fast, visible streaming balance topup!

    return () => clearInterval(interval);
  }, [isAutoTapping]);

  // 24-Hour Automatic Daily Cycles (Cipher & Combo) & 3-Hour Lucky Spin Refill:
  useEffect(() => {
    const checkDailyAndSpinResets = () => {
      const now = Date.now();
      const todayStr = new Date().toISOString().split('T')[0];
      const todayWord = getDailyCipherWord(todayStr);

      setState((prev) => {
        let changed = false;
        const isNewCipherDay = prev.lastCipherDate && prev.lastCipherDate !== todayStr;
        const isNewComboDay = prev.lastComboDate && prev.lastComboDate !== todayStr;

        let nextCipherWord = prev.cipherWord;
        let nextCipherSolved = prev.cipherSolvedToday;
        let nextComboSolved = prev.comboSolvedToday;
        let nextSpinCount = prev.spinCount;
        let nextSpinRefill = prev.nextSpinRefillTime;

        if (isNewCipherDay || prev.cipherWord !== todayWord) {
          nextCipherWord = todayWord;
          nextCipherSolved = isNewCipherDay ? false : prev.cipherSolvedToday;
          changed = true;
        }

        // Daily combo resets every 24hrs (player can only claim once a day)
        if (isNewComboDay && prev.comboSolvedToday) {
          nextComboSolved = false;
          changed = true;
        }

        // 5 Free spins refill every 3 hours
        if (prev.spinCount < 5 && prev.nextSpinRefillTime > 0 && now >= prev.nextSpinRefillTime) {
          nextSpinCount = 5;
          nextSpinRefill = 0;
          changed = true;
        }

        // S*** Morse Lucky Chance Wheel 24-hour cycle (6 spins every 24h)
        let nextLuckyChanceSpins = prev.luckyChanceSpins ?? 6;
        let nextLuckyChanceRefill = prev.luckyChanceNextRefillTime ?? 0;
        if (nextLuckyChanceRefill > 0 && now >= nextLuckyChanceRefill) {
          nextLuckyChanceSpins = 6;
          nextLuckyChanceRefill = 0;
          changed = true;
        }

        // Clean up ABCD reward timestamps older than 24 hours
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const currentAbcd = prev.abcdRewardTimestamps || [];
        const cleanedAbcd = currentAbcd.filter((t) => typeof t === 'number' && now - t < TWENTY_FOUR_HOURS);
        if (cleanedAbcd.length !== currentAbcd.length) {
          changed = true;
        }

        if (!changed) return prev;

        return {
          ...prev,
          cipherWord: nextCipherWord,
          cipherSolvedToday: nextCipherSolved,
          comboSolvedToday: nextComboSolved,
          spinCount: nextSpinCount,
          nextSpinRefillTime: nextSpinRefill,
          luckyChanceSpins: nextLuckyChanceSpins,
          luckyChanceNextRefillTime: nextLuckyChanceRefill,
          abcdRewardTimestamps: cleanedAbcd,
        };
      });
    };

    checkDailyAndSpinResets();
    const interval = setInterval(checkDailyAndSpinResets, 1000);
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

      let updatedLastPphClaimTime = prev.lastPphClaimTime;
      if (card.effectType === 'pph' && !updatedLastPphClaimTime) {
        updatedLastPphClaimTime = Date.now();
      }

      return {
        ...prev,
        coins: prev.coins - cost,
        tapPower: updatedTapPower,
        maxEnergy: updatedMaxEnergy,
        energy: updatedEnergy,
        energyRechargeRate: updatedRecharge,
        critChance: updatedCrit,
        lastPphClaimTime: updatedLastPphClaimTime,
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

  // Daily Combo Solve (resets every 24hrs)
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

  // Lucky Spin Wheel: player wins between 500k and 3M, 5 free spins every 3h
  const handleSpinUsed = (reward: number, updatedSpins: number, nextRefill: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      spinCount: updatedSpins,
      nextSpinRefillTime: nextRefill,
    }));
  };

  // Secret ABCD Reward: Player gestures any alphabet A-Z on the tap interface
  // Letter A = 100,000 pts, B = 200,000 pts, ... Z = 2,600,000 pts (100k * 26)
  // Strictly locked off after 2x within 24 hours. No matter what is drawn, no reward is granted.
  const handleAlphabetGestureReward = (letter: string, rewardPoints: number) => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    setState((prev) => {
      const activeTimestamps = (prev.abcdRewardTimestamps || []).filter(
        (t) => typeof t === 'number' && now - t < TWENTY_FOUR_HOURS
      );
      if (activeTimestamps.length >= 2) {
        return prev;
      }
      return {
        ...prev,
        coins: prev.coins + rewardPoints,
        totalEarned: prev.totalEarned + rewardPoints,
        abcdRewardTimestamps: [...activeTimestamps, now],
      };
    });
  };

  // Secret Balance Booster: user long holds balance for 10 seconds, inputs figure of desire
  const handleDirectBalanceBoost = (
    resourceOrAmount: 'points' | 'reserve' | 'diamonds' | 'keys' | number,
    optionalAmount?: number
  ) => {
    const resource: 'points' | 'reserve' | 'diamonds' | 'keys' =
      typeof resourceOrAmount === 'string' ? resourceOrAmount : 'points';
    const amount = typeof resourceOrAmount === 'number' ? resourceOrAmount : (optionalAmount || 0);

    if (amount <= 0 || !Number.isFinite(amount)) return;

    setState((prev) => {
      if (resource === 'points') {
        return {
          ...prev,
          coins: prev.coins + amount,
          totalEarned: prev.totalEarned + amount,
        };
      } else if (resource === 'reserve') {
        return {
          ...prev,
          reserveBalance: prev.reserveBalance + amount,
        };
      } else if (resource === 'diamonds') {
        return {
          ...prev,
          diamonds: prev.diamonds + amount,
        };
      } else if (resource === 'keys') {
        return {
          ...prev,
          keys: (prev.keys || 0) + amount,
        };
      }
      return prev;
    });

    if (resource === 'points') {
      setMorseToastMessage(`BOOSTER APPLIED: +${amount.toLocaleString()} Points added!`);
    } else if (resource === 'reserve') {
      setMorseToastMessage(`BOOSTER APPLIED: +$${amount.toFixed(2)} added to $ Reserve!`);
    } else if (resource === 'diamonds') {
      setMorseToastMessage(`BOOSTER APPLIED: +${amount.toLocaleString()} Diamonds added!`);
    } else if (resource === 'keys') {
      setMorseToastMessage(`BOOSTER APPLIED: +${amount.toLocaleString()} ${amount === 1 ? 'Key' : 'Keys'} added!`);
    }
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

  // Reset Game
  const handleResetGame = () => {
    soundFx.playClick();
    const cleanState = resetGameState();
    setState(cleanState);
    setIsAutoTapping(false);
  };

  // Morse Code Commands Dispatcher (Secret Protocol Execution)
  const handleExecuteMorseCommand = (commandIdOrObj: MorseCommandId | any) => {
    const commandId: MorseCommandId =
      typeof commandIdOrObj === 'object' && commandIdOrObj?.id
        ? commandIdOrObj.id
        : (commandIdOrObj as MorseCommandId);

    switch (commandId) {
      case 'auto_tap':
        setIsAutoTapping(true);
        soundFx.playReward();
        setMorseToastMessage(null); // Instantly clears immediately, not shown on screen
        break;

      case 'stop':
        setIsAutoTapping(false);
        soundFx.playClick();
        setMorseToastMessage(null); // Instantly clears immediately
        break;

      case 'withdraw':
        soundFx.playReward();
        setShowWithdrawModal(true);
        break;

      case 'diamond':
        soundFx.playReward();
        setShowLuckyChanceModal(true);
        break;

      case 'debit':
        soundFx.playReward();
        setShowDebitModal(true);
        break;

      case 'spin':
        soundFx.playReward();
        setShowLuckyChanceModal(true);
        break;

      case 'level_up': {
        const stage = state.stage || 1;
        const tiers = getTiersList(stage);
        const currentLvl = state.tapLevel;
        const nextTier = tiers[Math.min(currentLvl + 1, tiers.length - 1)];
        const targetCoins = nextTier.minCoins;
        const ptsEarned = Math.max(100000, targetCoins - state.totalEarned);
        const newLevel = Math.min(tiers.length - 1, currentLvl + 1);
        const newCap = getLevelTapCap(newLevel, stage);

        setState((prev) => ({
          ...prev,
          coins: prev.coins + ptsEarned,
          totalEarned: prev.totalEarned + ptsEarned,
          tapLevel: newLevel,
          maxEnergy: newCap,
          energy: newCap,
        }));
        soundFx.playLevelUp();
        setMorseToastMessage(`LEVEL UP COMPLETED! +${ptsEarned.toLocaleString()} PTS (Level ${newLevel})`);
        break;
      }

      case 'next_stage': {
        const upgradedStage = 2;
        const newCap = getLevelTapCap(state.tapLevel, upgradedStage);

        setState((prev) => ({
          ...prev,
          stage: upgradedStage,
          maxEnergy: Math.max(prev.maxEnergy, newCap),
          energy: Math.max(prev.energy, newCap),
        }));
        soundFx.playReward();
        setShowStageEvolutionModal(true);
        setMorseToastMessage('STAGE II ACTIVATED: QUANTUM NEXUS WITH 30 LEVELS!');
        break;
      }
    }
  };

  // Secret Modal Handlers
  const handleWithdrawReserve = (amount: number, keyFee: number, address: string, network: string) => {
    setState((prev) => ({
      ...prev,
      reserveBalance: Math.max(0, prev.reserveBalance - amount),
      keys: Math.max(0, (prev.keys || 0) - keyFee),
    }));
    setMorseToastMessage(`WITHDRAWAL PROCESSED: $${amount.toFixed(2)} sent to ${network} (-${keyFee.toLocaleString()} Keys fee)`);
  };

  const handleWinDiamonds = (amount: number) => {
    setState((prev) => ({
      ...prev,
      diamonds: prev.diamonds + amount,
    }));
    setMorseToastMessage(`DIAMOND WHEEL REWARD: +${amount} 💎 Added to stash!`);
  };

  // Wheel of Fortune Spin Handler
  const handleWheelOfFortuneSpinUsed = (
    reward: FortuneReward,
    updatedSpins: number,
    nextRefillTime: number
  ) => {
    setState((prev) => {
      let newReserve = prev.reserveBalance;
      let newKeys = prev.keys || 0;
      let newDiamonds = prev.diamonds || 0;

      if (reward.type === 'usd') {
        newReserve = Math.round((newReserve + reward.value) * 100) / 100;
      } else if (reward.type === 'keys') {
        newKeys += reward.value;
      } else if (reward.type === 'diamond') {
        newDiamonds += reward.value;
      }

      return {
        ...prev,
        reserveBalance: newReserve,
        keys: newKeys,
        diamonds: newDiamonds,
        wheelOfFortuneSpins: updatedSpins,
        wheelOfFortuneNextRefillTime: nextRefillTime,
      };
    });

    if (reward.type === 'usd') {
      setMorseToastMessage(`👑 WHEEL OF FORTUNE: +$${reward.value.toFixed(2)} added to Reserve!`);
    } else if (reward.type === 'keys') {
      setMorseToastMessage(`🗝️ WHEEL OF FORTUNE: +${reward.value} Key${reward.value > 1 ? 's' : ''} added!`);
    } else if (reward.type === 'diamond') {
      setMorseToastMessage(`💎 WHEEL OF FORTUNE: +${reward.value} Diamonds added!`);
    }
  };

  // Tree Pluck Rewards Handler
  const handleTreePluckEarnRewards = (rewards: TreePluckReward[]) => {
    let totalUsd = 0;
    let totalDiamonds = 0;
    let totalKeys = 0;

    rewards.forEach((r) => {
      if (r.type === 'usd') totalUsd += r.value;
      if (r.type === 'diamond') totalDiamonds += r.value;
      if (r.type === 'keys') totalKeys += r.value;
    });

    setState((prev) => ({
      ...prev,
      reserveBalance: Math.round((prev.reserveBalance + totalUsd) * 100) / 100,
      diamonds: (prev.diamonds || 0) + totalDiamonds,
      keys: (prev.keys || 0) + totalKeys,
    }));

    const parts: string[] = [];
    if (totalUsd > 0) parts.push(`+$${totalUsd.toFixed(2)} Reserve`);
    if (totalDiamonds > 0) parts.push(`+${totalDiamonds} 💎`);
    if (totalKeys > 0) parts.push(`+${totalKeys} 🗝️`);

    if (parts.length > 0) {
      setMorseToastMessage(`🌳 TREE PLUCK: ${parts.join(', ')} added!`);
    }
  };

  // Lay & Hatch Rewards Handler
  const handleLayHatchRewards = (rewards: HatchReward[], updatedEggs: number, nextRefillTime: number) => {
    let totalUsd = 0;
    let totalDiamonds = 0;
    let totalKeys = 0;
    let totalCoins = 0;

    rewards.forEach((r) => {
      if (r.type === 'usd') totalUsd += r.value;
      if (r.type === 'diamond') totalDiamonds += r.value;
      if (r.type === 'keys') totalKeys += r.value;
      if (r.type === 'coins') totalCoins += r.value;
    });

    setState((prev) => ({
      ...prev,
      reserveBalance: Math.round((prev.reserveBalance + totalUsd) * 100) / 100,
      diamonds: (prev.diamonds || 0) + totalDiamonds,
      keys: (prev.keys || 0) + totalKeys,
      coins: prev.coins + totalCoins,
      totalEarned: prev.totalEarned + totalCoins,
      layHatchEggsAvailable: updatedEggs,
      layHatchNextRefillTime: nextRefillTime,
    }));

    const parts: string[] = [];
    if (totalUsd > 0) parts.push(`+$${totalUsd.toFixed(2)} Reserve`);
    if (totalDiamonds > 0) parts.push(`+${totalDiamonds} 💎`);
    if (totalKeys > 0) parts.push(`+${totalKeys} 🗝️`);
    if (totalCoins > 0) parts.push(`+${totalCoins.toLocaleString()} Pts`);

    if (parts.length > 0) {
      setMorseToastMessage(`🥚 LAY & HATCH: ${parts.join(', ')} added!`);
    }
  };

  // Dice Rewards Handler (Every win automatically added to user)
  const handleDiceRewards = (rewards: DiceOutcome[]) => {
    let totalUsd = 0;
    let totalDiamonds = 0;
    let totalKeys = 0;
    let totalCoins = 0;

    rewards.forEach((r) => {
      if (r.type === 'usd') totalUsd += r.value;
      if (r.type === 'diamonds') totalDiamonds += r.value;
      if (r.type === 'keys') totalKeys += r.value;
      if (r.type === 'coins') totalCoins += r.value;
    });

    setState((prev) => ({
      ...prev,
      reserveBalance: Math.round((prev.reserveBalance + totalUsd) * 100) / 100,
      diamonds: (prev.diamonds || 0) + totalDiamonds,
      keys: (prev.keys || 0) + totalKeys,
      coins: prev.coins + totalCoins,
      totalEarned: prev.totalEarned + totalCoins,
    }));

    const parts: string[] = [];
    if (totalUsd > 0) parts.push(`+$${totalUsd.toFixed(2)} Reserve`);
    if (totalDiamonds > 0) parts.push(`+${totalDiamonds} 💎`);
    if (totalKeys > 0) parts.push(`+${totalKeys} 🗝️`);
    if (totalCoins > 0) parts.push(`+${totalCoins.toLocaleString()} Pts`);

    if (parts.length > 0) {
      setMorseToastMessage(`🎲 DICE WIN: ${parts.join(', ')} added!`);
    }
  };

  const handleDebitCoins = (amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount),
    }));
    setMorseToastMessage(`DEBIT APPLIED: -${amount.toLocaleString()} points deducted from balance`);
  };

  const handleLuckyChanceSpinStart = () => {
    setState((prev) => {
      const currentSpins = prev.luckyChanceSpins ?? 6;
      if (currentSpins <= 0) return prev;

      const now = Date.now();
      let nextRefill = prev.luckyChanceNextRefillTime ?? 0;
      if (nextRefill <= 0 || nextRefill < now) {
        nextRefill = now + 24 * 60 * 60 * 1000;
      }

      return {
        ...prev,
        luckyChanceSpins: Math.max(0, currentSpins - 1),
        luckyChanceNextRefillTime: nextRefill,
      };
    });
  };

  const handleLuckyChanceReward = (reward: {
    type: 'diamond' | 'key' | 'points' | 'reserve' | 'extra_spin' | 'empty';
    amount: number;
    label: string;
  }) => {
    setState((prev) => {
      let newCoins = prev.coins;
      let newTotalEarned = prev.totalEarned;
      let newDiamonds = prev.diamonds;
      let newKeys = prev.keys || 0;
      let newReserve = prev.reserveBalance;
      let newLuckySpins = prev.luckyChanceSpins ?? 6;

      if (reward.type === 'points') {
        newCoins += reward.amount;
        newTotalEarned += reward.amount;
      } else if (reward.type === 'diamond') {
        newDiamonds += reward.amount;
      } else if (reward.type === 'key') {
        newKeys += reward.amount;
      } else if (reward.type === 'reserve') {
        newReserve += reward.amount;
      } else if (reward.type === 'extra_spin') {
        newLuckySpins += reward.amount;
      }

      return {
        ...prev,
        coins: newCoins,
        totalEarned: newTotalEarned,
        diamonds: newDiamonds,
        keys: newKeys,
        reserveBalance: newReserve,
        luckyChanceSpins: newLuckySpins,
      };
    });

    if (reward.type === 'points') {
      setMorseToastMessage(`LUCKY SPIN REWARD: +${(reward.amount / 1000000).toLocaleString()}M Points credited to Point Balance!`);
    } else if (reward.type === 'diamond') {
      setMorseToastMessage(`LUCKY SPIN REWARD: +${reward.amount} Diamonds credited to Diamond Reserve!`);
    } else if (reward.type === 'key') {
      setMorseToastMessage(`LUCKY SPIN REWARD: +${reward.amount} ${reward.amount === 1 ? 'Key' : 'Keys'} credited to Master Keys Vault!`);
    } else if (reward.type === 'reserve') {
      setMorseToastMessage(`LUCKY SPIN REWARD: +$${reward.amount.toFixed(2)} credited to $ Reserve Balance!`);
    } else if (reward.type === 'extra_spin') {
      setMorseToastMessage(`LUCKY SPIN REWARD: +1 EXTRA SPIN! Spin again now!`);
    } else {
      setMorseToastMessage(`LUCKY SPIN: 0 won. Spin again!`);
    }
  };

  // Milestone Benefits:
  // 1. Every 5,000 taps earn 1 key and 2 diamonds
  useEffect(() => {
    const currentTapMilestones = Math.floor(state.totalTaps / 5000);
    const rewardedMilestones = state.tapMilestonesRewarded || 0;
    if (currentTapMilestones > rewardedMilestones) {
      const diff = currentTapMilestones - rewardedMilestones;
      setState((prev) => ({
        ...prev,
        keys: (prev.keys || 0) + 1 * diff,
        diamonds: prev.diamonds + 2 * diff,
        tapMilestonesRewarded: currentTapMilestones,
      }));
      soundFx.playReward();
      setMorseToastMessage(
        `🗝️ TAP MILESTONE: ${(currentTapMilestones * 5000).toLocaleString()} Taps! +${diff} Key & +${diff * 2} Diamonds earned!`
      );
    }
  }, [state.totalTaps, state.tapMilestonesRewarded]);

  // 2. Every 10,000,000 points earn 3 keys and 3 diamonds
  useEffect(() => {
    const currentPointMilestones = Math.floor(state.totalEarned / 10000000);
    const rewardedMilestones = state.pointMilestonesRewarded || 0;
    if (currentPointMilestones > rewardedMilestones) {
      const diff = currentPointMilestones - rewardedMilestones;
      setState((prev) => ({
        ...prev,
        keys: (prev.keys || 0) + 3 * diff,
        diamonds: prev.diamonds + 3 * diff,
        pointMilestonesRewarded: currentPointMilestones,
      }));
      soundFx.playReward();
      setMorseToastMessage(
        `💎 POINT MILESTONE: ${(currentPointMilestones * 10).toLocaleString()}M Points! +${diff * 3} Keys & +${diff * 3} Diamonds earned!`
      );
    }
  }, [state.totalEarned, state.pointMilestonesRewarded]);

  const isStage2 = state.stage === 2;
  const currentTier = getTierByCoins(state.coins, state.stage);
  const effectiveSkinLevel =
    state.equippedSkinLevel !== null && state.equippedSkinLevel !== undefined
      ? state.equippedSkinLevel
      : currentTier.level;
  const activeSeasonalSkin = getSeasonalSkinByLevel(effectiveSkinLevel, state.stage);

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] w-full max-w-md mx-auto text-slate-100 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${
        isStage2
          ? 'bg-[#070414] shadow-[0_0_80px_rgba(6,182,212,0.18)] border-x border-cyan-500/20'
          : 'bg-[#0a0d14]'
      }`}
      style={{
        boxShadow: `0 0 60px ${activeSeasonalSkin.glowColor}`,
      }}
    >
      {/* Toast Notification Banner */}
      {morseToastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-black/95 border border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.5)] text-cyan-200 text-xs font-black tracking-wider uppercase flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none text-center max-w-[90vw]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>{morseToastMessage}</span>
        </div>
      )}

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
        stage={state.stage || 1}
        goldCoinImg={goldCoin}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full flex flex-col overflow-hidden min-h-0 relative">
        {activeTab === 'exchange' && (
          <TapExchange
            coins={state.coins}
            reserveBalance={state.reserveBalance}
            diamonds={state.diamonds}
            keys={state.keys || 0}
            energy={state.energy}
            maxEnergy={state.maxEnergy}
            tapPower={state.tapPower}
            critChance={state.critChance}
            streakDay={state.streakDay}
            cipherSolvedToday={state.cipherSolvedToday}
            comboSolvedToday={state.comboSolvedToday}
            isTurboActive={isTurboActive}
            spinCount={state.spinCount}
            nextSpinRefillTime={state.nextSpinRefillTime}
            onMultiTap={handleMultiTap}
            onAlphabetGestureReward={handleAlphabetGestureReward}
            canAbcdReward={
              (state.abcdRewardTimestamps || []).filter(
                (t) => typeof t === 'number' && Date.now() - t < 24 * 60 * 60 * 1000
              ).length < 2
            }
            onDirectBalanceBoost={handleDirectBalanceBoost}
            floatingNumbers={floatingNumbers}
            onOpenDailyReward={() => setShowDailyReward(true)}
            onOpenDailyCipher={() => setShowDailyCipher(true)}
            onOpenDailyCombo={() => setShowDailyCombo(true)}
            onOpenLuckyWheel={() => setShowLuckyWheel(true)}
            onOpenBoost={() => setShowBoost(true)}
            onOpenMorseTerminal={() => setShowMorseTerminal(true)}
            onOpenTierModal={() => setShowTierModal(true)}
            isAutoTapping={isAutoTapping}
            onStopAutoTap={() => setIsAutoTapping(false)}
            stage={state.stage || 1}
            mascotImg={activeSeasonalSkin.avatarImg || mascotAvatar}
            goldCoinImg={goldCoin}
            equippedSkinLevel={state.equippedSkinLevel ?? null}
            onEquipSkin={(lvl) => setState((prev) => ({ ...prev, equippedSkinLevel: lvl }))}
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
              pphRate={pphRate}
              lastPphClaimTime={state.lastPphClaimTime}
              onOpenPphClaim={() => setShowPphClaimModal(true)}
            />
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <FriendsTab
              squadMembers={state.squadMembers}
              squadEarnings={state.squadEarnings}
              referralCode={state.referralCode}
              goldCoinImg={goldCoin}
            />
          </div>
        )}

        {activeTab === 'earn' && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <EarnTab
              completedTaskIds={state.completedTaskIds}
              streakDay={state.streakDay}
              wheelOfFortuneSpins={state.wheelOfFortuneSpins ?? 6}
              tapLevel={state.tapLevel}
              onCompleteTask={handleCompleteTask}
              onOpenDailyReward={() => setShowDailyReward(true)}
              onOpenWheelOfFortune={() => {
                if (state.tapLevel < 7) {
                  setMorseToastMessage('🔒 Wheel of Fortune unlocks at Level 7!');
                } else {
                  setShowWheelOfFortuneModal(true);
                }
              }}
              onOpenTreePluck={() => {
                if (state.tapLevel < 9) {
                  setMorseToastMessage('🔒 Tree Pluck unlocks at Level 9!');
                } else {
                  setShowTreePluckModal(true);
                }
              }}
              onOpenLayHatch={() => {
                if (state.tapLevel < 12) {
                  setMorseToastMessage('🔒 Lay & Hatch unlocks at Level 12!');
                } else {
                  setShowLayHatchModal(true);
                }
              }}
              onOpenDice={() => {
                if (state.tapLevel < 15) {
                  setMorseToastMessage('🔒 Dice unlocks at Level 15!');
                } else {
                  setShowDiceModal(true);
                }
              }}
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

      {showLuckyWheel && (
        <LuckyWheelModal
          isOpen={showLuckyWheel}
          onClose={() => setShowLuckyWheel(false)}
          spinCount={state.spinCount}
          nextSpinRefillTime={state.nextSpinRefillTime}
          onSpinUsed={handleSpinUsed}
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
          stage={state.stage || 1}
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

      {/* Secret Morse Code Terminal Modal */}
      {showMorseTerminal && (
        <MorseTerminalModal
          isOpen={showMorseTerminal}
          onClose={() => setShowMorseTerminal(false)}
          onExecuteCommand={handleExecuteMorseCommand}
        />
      )}

      {/* Secret Reserve Withdrawal Modal */}
      {showWithdrawModal && (
        <SecretReserveWithdrawalModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          reserveBalance={state.reserveBalance}
          playerKeys={state.keys || 0}
          onWithdraw={handleWithdrawReserve}
        />
      )}

      {/* Secret Diamond Wheel Modal (Wins 1-7 diamonds, restricted from 8-10) */}
      {showDiamondWheelModal && (
        <SecretDiamondWheelModal
          isOpen={showDiamondWheelModal}
          onClose={() => setShowDiamondWheelModal(false)}
          onWinDiamonds={handleWinDiamonds}
        />
      )}

      {/* Balance Debit Modal */}
      {showDebitModal && (
        <BalanceDebitModal
          isOpen={showDebitModal}
          onClose={() => setShowDebitModal(false)}
          currentCoins={state.coins}
          onDebitCoins={handleDebitCoins}
        />
      )}

      {/* 15-Chart S*** Morse Lucky Chance Wheel Modal */}
      {showLuckyChanceModal && (
        <LuckyChanceWheelModal
          isOpen={showLuckyChanceModal}
          onClose={() => setShowLuckyChanceModal(false)}
          spinsRemaining={state.luckyChanceSpins ?? 6}
          nextRefillTime={state.luckyChanceNextRefillTime ?? 0}
          onSpinStart={handleLuckyChanceSpinStart}
          onWinReward={handleLuckyChanceReward}
        />
      )}

      {/* Stage Evolution Modal (Stage II Quantum Nexus Upgrade) */}
      {showStageEvolutionModal && (
        <StageEvolutionModal
          isOpen={showStageEvolutionModal}
          onClose={() => setShowStageEvolutionModal(false)}
          stage={state.stage || 2}
        />
      )}

      {/* Wheel of Fortune Modal (8-Chart Golden Spin Wheel) */}
      {showWheelOfFortuneModal && (
        <WheelOfFortuneModal
          isOpen={showWheelOfFortuneModal}
          onClose={() => setShowWheelOfFortuneModal(false)}
          spinsRemaining={state.wheelOfFortuneSpins ?? 6}
          nextRefillTime={state.wheelOfFortuneNextRefillTime ?? 0}
          onSpinUsed={handleWheelOfFortuneSpinUsed}
        />
      )}

      {/* Tree Pluck Playground Modal (Level 9+ Cash Tree) */}
      {showTreePluckModal && (
        <TreePluckModal
          isOpen={showTreePluckModal}
          onClose={() => setShowTreePluckModal(false)}
          onEarnRewards={handleTreePluckEarnRewards}
          reserveBalance={state.reserveBalance}
          diamonds={state.diamonds || 0}
          keys={state.keys || 0}
        />
      )}

      {/* Lay & Hatch Modal (Level 12+ Big White Hen) */}
      {showLayHatchModal && (
        <LayHatchModal
          isOpen={showLayHatchModal}
          onClose={() => setShowLayHatchModal(false)}
          eggsAvailable={state.layHatchEggsAvailable ?? 5}
          nextRefillTime={state.layHatchNextRefillTime ?? 0}
          onEggsHatched={handleLayHatchRewards}
          reserveBalance={state.reserveBalance}
          diamonds={state.diamonds || 0}
          keys={state.keys || 0}
          coins={state.coins}
        />
      )}

      {/* Dice Game Modal (Level 15+ Ludo Dice Arena with 8s Light Speed Spin) */}
      {showDiceModal && (
        <DiceGameModal
          isOpen={showDiceModal}
          onClose={() => setShowDiceModal(false)}
          onWinReward={handleDiceRewards}
          coins={state.coins}
          reserveBalance={state.reserveBalance}
          keys={state.keys || 0}
          diamonds={state.diamonds || 0}
          goldCoinImg={goldCoin}
        />
      )}

      {/* Profit Per Hour (PPH) Manual Claim Popup (Hourly Trigger) */}
      {showPphClaimModal && (
        <PphClaimModal
          isOpen={showPphClaimModal}
          onClose={() => setShowPphClaimModal(false)}
          onClaim={handleClaimPphReward}
          pphRate={pphRate}
          elapsedHours={Math.max(
            1,
            Math.floor(Math.max(0, Date.now() - (state.lastPphClaimTime || Date.now())) / (3600 * 1000))
          )}
          claimablePoints={
            Math.max(
              1,
              Math.floor(Math.max(0, Date.now() - (state.lastPphClaimTime || Date.now())) / (3600 * 1000))
            ) * pphRate
          }
          goldCoinImg={goldCoin}
        />
      )}
    </div>
  );
}
