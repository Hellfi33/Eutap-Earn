import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Coins,
  ArrowRightLeft,
  PlusCircle,
  TrendingUp,
  BarChart3,
  Server,
  Layers,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Zap,
  Activity,
  DollarSign,
  PieChart,
  Lock,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Copy,
  Check,
  LogOut,
  AlertCircle,
  Search,
  Settings,
  User,
  Bell,
  Maximize2,
  Minimize2,
  Clipboard,
  AtSign,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Send,
  Sparkles,
  ExternalLink,
  Shield,
  HelpCircle,
  CheckCircle,
  Vote,
  ThumbsUp,
  Rocket,
  Plus,
  LayoutGrid,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import {
  EuToken,
  EuTransaction,
  generateCryptoTag,
  generateContractAddress,
  PersistedBlockchainData,
  CentralCoinConfig,
  LiquidityPair,
  StakingPool,
  InvestmentTier,
  INITIAL_CENTRAL_COIN,
  INITIAL_LIQUIDITY_PAIRS,
  INITIAL_STAKING_POOLS,
  INITIAL_INVESTMENTS,
  saveBlockchainData,
} from '../data/euBlockchain';
import { fetchLiveGlobalPrices } from '../data/livePrices';
import { soundFx } from '../utils/audio';

interface EuScanAdminConsoleProps {
  data: PersistedBlockchainData;
  setData: React.Dispatch<React.SetStateAction<PersistedBlockchainData>>;
  onLogout: () => void;
  onExitAdmin: () => void;
}

type MainNavView = 'dashboard' | 'central_coin' | 'liquidity' | 'tokens' | 'staking' | 'investment' | 'exchange' | 'transactions';

export const EuScanAdminConsole: React.FC<EuScanAdminConsoleProps> = ({
  data,
  setData,
  onLogout,
  onExitAdmin,
}) => {
  // Navigation & Dropdown Page States
  const [activeNavView, setActiveNavView] = useState<MainNavView>('dashboard');
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false); // 3-lines toggle brings this down
  const [showQuickStatsBar, setShowQuickStatsBar] = useState(false); // Toggle switch for quick stats bar
  const [activeTab, setActiveTab] = useState<'chart' | 'historical' | 'conversations' | 'summary'>('chart');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'YTD' | '1Y' | '6M' | '1M'>('ALL');
  const [expandedMenu, setExpandedMenu] = useState<string | null>('options1to5');

  // Search & Utility State
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Central Coin Launchpad State
  const centralCoin = data.centralCoin || INITIAL_CENTRAL_COIN;
  const [launchCoinName, setLaunchCoinName] = useState(centralCoin.isLaunched ? centralCoin.name : '');
  const [launchCoinSymbol, setLaunchCoinSymbol] = useState(centralCoin.isLaunched ? centralCoin.symbol : '');
  const [launchSupply, setLaunchSupply] = useState(centralCoin.isLaunched ? centralCoin.totalSupply.toString() : '1000000000');
  const [launchInitialPrice, setLaunchInitialPrice] = useState(centralCoin.isLaunched ? centralCoin.priceUsd.toString() : '1.00');
  const [launchBurnRate, setLaunchBurnRate] = useState(centralCoin.isLaunched ? centralCoin.burnRatePercent.toString() : '10');
  const [launchValidatorReward, setLaunchValidatorReward] = useState(centralCoin.isLaunched ? centralCoin.validatorRewardPercent.toString() : '75');
  const [launchTreasuryShare, setLaunchTreasuryShare] = useState(centralCoin.isLaunched ? centralCoin.treasurySharePercent.toString() : '15');
  const [centralLaunchSuccessMsg, setCentralLaunchSuccessMsg] = useState<string | null>(null);

  // Liquidity Pair Creation State
  const liquidityPairs = data.liquidityPairs || INITIAL_LIQUIDITY_PAIRS;
  const [newPairTokenA, setNewPairTokenA] = useState(centralCoin.isLaunched && centralCoin.symbol ? centralCoin.symbol : 'USDT');
  const [newPairTokenB, setNewPairTokenB] = useState('USDT');
  const [newPairReserveA, setNewPairReserveA] = useState('50000');
  const [newPairReserveB, setNewPairReserveB] = useState('92500');
  const [newPairFeeTier, setNewPairFeeTier] = useState(0.30);
  const [pairSuccessMsg, setPairSuccessMsg] = useState<string | null>(null);

  // Staking & Yield State
  const stakingPools = data.stakingPools || INITIAL_STAKING_POOLS;
  const [stakeAmount, setStakeAmount] = useState('100');
  const [selectedPoolId, setSelectedPoolId] = useState(stakingPools[0]?.id || 'pool-eth-validator');
  const [stakeSuccessMsg, setStakeSuccessMsg] = useState<string | null>(null);

  // Quick Convert State
  const [convertPayAmount, setConvertPayAmount] = useState('10.00');
  const [convertPayAsset, setConvertPayAsset] = useState('USDT');
  const [convertReceiveAsset, setConvertReceiveAsset] = useState(centralCoin.isLaunched && centralCoin.symbol ? centralCoin.symbol : 'ETH');
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);

  // Exchange Terminal State
  const [exchangeMode, setExchangeMode] = useState<'swap' | 'buy' | 'sell'>('swap');
  const [tradeAmount, setTradeAmount] = useState('250');
  const [tradeFromAsset, setTradeFromAsset] = useState('USDT');
  const [tradeToAsset, setTradeToAsset] = useState('ETH');
  const [tradeSuccessTx, setTradeSuccessTx] = useState<EuTransaction | null>(null);

  // Token Deployment & Build Interface State (Cost: 0.3 EUR)
  const [showDeployTokenModal, setShowDeployTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenDecimals, setNewTokenDecimals] = useState<number>(18);
  const [newTokenSupply, setNewTokenSupply] = useState('10000000');
  const [newTokenPrice, setNewTokenPrice] = useState('1.00');
  const [newTokenCategory, setNewTokenCategory] = useState<EuToken['category']>('DeFi');
  const [newTokenMintable, setNewTokenMintable] = useState(true);
  const [newTokenBurnable, setNewTokenBurnable] = useState(true);
  const [newTokenPausable, setNewTokenPausable] = useState(false);
  const [newTokenAntiWhale, setNewTokenAntiWhale] = useState(false);
  const [newTokenLiquidityLock, setNewTokenLiquidityLock] = useState(true);
  const [tokenDeployMsg, setTokenDeployMsg] = useState<string | null>(null);
  const [tokenCategoryFilter, setTokenCategoryFilter] = useState<string>('all');
  const [tokenOriginFilter, setTokenOriginFilter] = useState<'all' | 'eu' | 'global'>('all');
  const [tokenToDeleteConfirm, setTokenToDeleteConfirm] = useState<EuToken | null>(null);
  const [showValueControlPicker, setShowValueControlPicker] = useState(false);

  // Value Control State (Control Market Value of EU-built tokens)
  const [selectedTokenForValueControl, setSelectedTokenForValueControl] = useState<EuToken | null>(null);
  const [controlPriceInput, setControlPriceInput] = useState('1.00');
  const [controlChangeInput, setControlChangeInput] = useState('0.0');
  const [valueControlSuccessMsg, setValueControlSuccessMsg] = useState<string | null>(null);
  const [isLivePricesLoading, setIsLivePricesLoading] = useState(false);

  // Poll live global market prices for BTC, ETH, USDT
  useEffect(() => {
    let isMounted = true;
    const updateGlobalPrices = async () => {
      try {
        setIsLivePricesLoading(true);
        const liveMap = await fetchLiveGlobalPrices();
        if (!isMounted) return;

        setData((prev) => {
          const updatedTokens = prev.tokens.map((t) => {
            if (t.symbol === 'BTC' && liveMap.BTC) {
              return { ...t, priceUsd: liveMap.BTC.priceUsd, priceChange24h: liveMap.BTC.change24h };
            }
            if (t.symbol === 'ETH' && liveMap.ETH) {
              return { ...t, priceUsd: liveMap.ETH.priceUsd, priceChange24h: liveMap.ETH.change24h };
            }
            if (t.symbol === 'USDT' && liveMap.USDT) {
              return { ...t, priceUsd: liveMap.USDT.priceUsd, priceChange24h: liveMap.USDT.change24h };
            }
            return t;
          });
          const next = { ...prev, tokens: updatedTokens };
          saveBlockchainData(next);
          return next;
        });
      } finally {
        if (isMounted) setIsLivePricesLoading(false);
      }
    };

    updateGlobalPrices();
    const interval = setInterval(updateGlobalPrices, 35000); // Poll every 35s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setData]);

  // Manual Trigger: Sync Live Prices
  const handleRefreshLivePrices = async () => {
    try {
      setIsLivePricesLoading(true);
      soundFx.playClick();
      const liveMap = await fetchLiveGlobalPrices();
      setData((prev) => {
        const updatedTokens = prev.tokens.map((t) => {
          if (t.symbol === 'BTC' && liveMap.BTC) {
            return { ...t, priceUsd: liveMap.BTC.priceUsd, priceChange24h: liveMap.BTC.change24h };
          }
          if (t.symbol === 'ETH' && liveMap.ETH) {
            return { ...t, priceUsd: liveMap.ETH.priceUsd, priceChange24h: liveMap.ETH.change24h };
          }
          if (t.symbol === 'USDT' && liveMap.USDT) {
            return { ...t, priceUsd: liveMap.USDT.priceUsd, priceChange24h: liveMap.USDT.change24h };
          }
          return t;
        });
        const next = { ...prev, tokens: updatedTokens };
        saveBlockchainData(next);
        return next;
      });
      soundFx.playReward();
    } finally {
      setIsLivePricesLoading(false);
    }
  };

  // Open Value Control for an EU Token
  const handleOpenValueControl = (token: EuToken) => {
    soundFx.playClick();
    setSelectedTokenForValueControl(token);
    setControlPriceInput(token.priceUsd.toString());
    setControlChangeInput(token.priceChange24h.toString());
    setValueControlSuccessMsg(null);
  };

  // Save Value Control on EU Blockchain
  const handleSaveValueControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenForValueControl) return;

    soundFx.playClick();
    const newPrice = Math.max(0.000001, parseFloat(controlPriceInput) || 1.0);
    const newChange = parseFloat(controlChangeInput) || 0.0;
    const nextBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();

    const updatedTokens = data.tokens.map((t) => {
      if (t.id === selectedTokenForValueControl.id || t.symbol === selectedTokenForValueControl.symbol) {
        return {
          ...t,
          priceUsd: newPrice,
          priceChange24h: newChange,
          marketCapUsd: t.totalSupply * newPrice,
        };
      }
      return t;
    });

    const isCentralCoin = selectedTokenForValueControl.symbol === centralCoin.symbol;
    const updatedCentralCoin = isCentralCoin
      ? { ...centralCoin, priceUsd: newPrice, priceChange24h: newChange }
      : centralCoin;

    const controlTx: EuTransaction = {
      txTag,
      method: 'VALUE_CONTROL_UPDATE',
      status: 'SUCCESS',
      from: '0xEU_Master_Admin_001',
      to: selectedTokenForValueControl.contractAddress,
      value: `$${newPrice.toFixed(4)} USD`,
      gasFee: '0.00000 EU',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        tokenName: selectedTokenForValueControl.name,
        tokenSymbol: selectedTokenForValueControl.symbol,
        tokenContract: selectedTokenForValueControl.contractAddress,
        exchangeRate: `1 ${selectedTokenForValueControl.symbol} = $${newPrice.toFixed(4)} USD (${newChange >= 0 ? '+' : ''}${newChange}%)`,
        note: `Admin Market Value Control adjusted valuation to $${newPrice.toFixed(4)} USD`,
      },
    };

    const nextData: PersistedBlockchainData = {
      ...data,
      blockHeight: nextBlock,
      tokens: updatedTokens,
      centralCoin: updatedCentralCoin,
      transactions: [controlTx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setValueControlSuccessMsg(`Successfully adjusted ${selectedTokenForValueControl.symbol} market price to $${newPrice.toFixed(4)} USD!`);
    setTimeout(() => {
      setValueControlSuccessMsg(null);
      setSelectedTokenForValueControl(null);
    }, 1800);
  };

  // Delete / Remove Custom Token from Blockchain
  const handleDeleteToken = (token: EuToken) => {
    if (!token.isBuiltInEuBlockchain || token.symbol === centralCoin.symbol) return;
    soundFx.playClick();
    const nextBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();

    const delTx: EuTransaction = {
      txTag,
      method: 'TOKEN_DELETE',
      status: 'SUCCESS',
      from: '0xEU_Master_Admin_001',
      to: token.contractAddress,
      value: '0 EU',
      gasFee: '0.00000 EU',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        tokenName: token.name,
        tokenSymbol: token.symbol,
        tokenContract: token.contractAddress,
        note: `Permanent token revocation authorized by Administrator.`,
      },
    };

    const nextData: PersistedBlockchainData = {
      ...data,
      blockHeight: nextBlock,
      tokens: data.tokens.filter((t) => t.id !== token.id),
      transactions: [delTx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setTokenToDeleteConfirm(null);
  };

  // Community Governance / Reaction State
  const [reactions, setReactions] = useState({ thumbsUp: 10, rockets: 80, flames: 42 });

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Convert Quote calculation
  const convertQuote = useMemo(() => {
    const val = parseFloat(convertPayAmount) || 0;
    if (convertPayAsset === 'USDT' && convertReceiveAsset === centralCoin.symbol) {
      return (val / centralCoin.priceUsd).toFixed(4);
    }
    if (convertPayAsset === centralCoin.symbol && convertReceiveAsset === 'USDT') {
      return (val * centralCoin.priceUsd).toFixed(2);
    }
    return (val * 1.0).toFixed(2);
  }, [convertPayAmount, convertPayAsset, convertReceiveAsset, centralCoin.priceUsd, centralCoin.symbol]);

  // Execute Quick Convert
  const handleQuickConvert = () => {
    const val = parseFloat(convertPayAmount) || 0;
    if (val <= 0) return;

    soundFx.playClick();
    const nextBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();
    const receiveVal = parseFloat(convertQuote);

    const tx: EuTransaction = {
      txTag,
      method: 'SWAP',
      status: 'SUCCESS',
      from: '0xEU_Admin_Executive_Wallet',
      to: '0xEU_Master_DEX_Settlement',
      value: `${val.toFixed(2)} ${convertPayAsset}`,
      gasFee: '0.00000 EU (Fee-Exempt)',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        amountIn: `${val.toFixed(2)} ${convertPayAsset}`,
        amountOut: `${receiveVal.toFixed(4)} ${convertReceiveAsset}`,
        note: `Instant Treasury Conversion via AMM Core`,
      },
    };

    const nextBalance = convertReceiveAsset === centralCoin.symbol
      ? data.userEuBalance + receiveVal
      : Math.max(0, data.userEuBalance - val);

    const updatedData: PersistedBlockchainData = {
      ...data,
      userEuBalance: nextBalance,
      blockHeight: nextBlock,
      transactions: [tx, ...data.transactions],
    };

    setData(updatedData);
    saveBlockchainData(updatedData);
    soundFx.playReward();
    setConvertSuccessMsg(`Swapped ${val.toFixed(2)} ${convertPayAsset} → ${receiveVal.toFixed(4)} ${convertReceiveAsset}`);
    setTimeout(() => setConvertSuccessMsg(null), 3000);
  };

  // Launch / Re-configure Platform Home Coin (Cost: 0 EUR)
  const handleLaunchCentralCoin = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();

    const sym = launchCoinSymbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const name = launchCoinName.trim();
    if (!sym || !name) {
      alert('Please enter a valid Home Coin Name and Ticker Symbol.');
      return;
    }

    const supply = parseFloat(launchSupply) || 1000000000;
    const price = Math.max(0.0001, parseFloat(launchInitialPrice) || 1.00);
    const burn = parseFloat(launchBurnRate) || 10;
    const valReward = parseFloat(launchValidatorReward) || 75;
    const treasury = parseFloat(launchTreasuryShare) || 15;
    const contract = generateContractAddress();
    const txTag = generateCryptoTag();
    const nextBlock = data.blockHeight + 1;

    const updatedCoin: CentralCoinConfig = {
      name,
      symbol: sym,
      decimals: 18,
      totalSupply: supply,
      circulatingSupply: Math.round(supply * 0.5),
      priceUsd: price,
      priceChange24h: 0.0,
      contractAddress: contract,
      isLaunched: true,
      launchedAt: Date.now(),
      baseFeeGwei: 10.0,
      burnRatePercent: burn,
      validatorRewardPercent: valReward,
      treasurySharePercent: treasury,
    };

    const genesisTx: EuTransaction = {
      txTag,
      method: 'TOKEN_CREATE',
      status: 'SUCCESS',
      from: '0x0000000000000000000000000000000000000000',
      to: contract,
      value: `${supply.toLocaleString()} ${sym}`,
      gasFee: '0.00 EUR (Cost: 0)',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: 1,
      details: {
        tokenName: name,
        tokenSymbol: sym,
        tokenContract: contract,
        amountIn: `${supply.toLocaleString()} Genesis Supply`,
        note: `Platform Home Trading Economy & Fee Asset Launched at 0 EUR Cost (${burn}% Burn • ${valReward}% Validators • ${treasury}% Treasury)`,
      },
    };

    // Add Home Coin to tokens directory so it is immediately visible & tradable
    const homeCoinToken: EuToken = {
      id: `tok-home-${sym.toLowerCase()}`,
      name,
      symbol: sym,
      decimals: 18,
      totalSupply: supply,
      priceUsd: price,
      priceChange24h: 0.0,
      isBuiltInEuBlockchain: true,
      category: 'Governance',
      contractAddress: contract,
      creatorAddress: '0xEU_Master_Admin_001',
      createdAt: Date.now(),
      txTag,
      status: 'active',
      description: `Platform Home Trading Economy and native fee currency deployed at 0 EUR cost.`,
      marketCapUsd: supply * price,
      volume24hUsd: 0,
      features: {
        isMintable: true,
        isBurnable: true,
      },
      deploymentCostEur: 0,
    };

    // Filter out any previous version of this symbol
    const remainingTokens = data.tokens.filter((t) => t.id !== homeCoinToken.id && t.symbol !== sym);

    const updatedData: PersistedBlockchainData = {
      ...data,
      blockHeight: nextBlock,
      centralCoin: updatedCoin,
      tokens: [homeCoinToken, ...remainingTokens],
      transactions: [genesisTx, ...data.transactions],
    };

    setData(updatedData);
    saveBlockchainData(updatedData);
    soundFx.playReward();
    setConvertReceiveAsset(sym);
    setTradeFromAsset(sym);
    setCentralLaunchSuccessMsg(`Home Coin [${sym}] successfully deployed at 0 cost! It is now the platform home trading economy.`);
    setTimeout(() => setCentralLaunchSuccessMsg(null), 4000);
  };

  // Create New Liquidity Pair
  const handleCreateLiquidityPair = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();

    const symA = newPairTokenA.trim().toUpperCase();
    const symB = newPairTokenB.trim().toUpperCase();
    const resA = parseFloat(newPairReserveA) || 10000;
    const resB = parseFloat(newPairReserveB) || 10000;
    const pairId = `pair-${symA.toLowerCase()}-${symB.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const nextBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();

    const newPair: LiquidityPair = {
      id: pairId,
      tokenA: symA,
      tokenB: symB,
      reserveA: resA,
      reserveB: resB,
      totalLiquidityUsd: Math.round(resB * 2),
      volume24hUsd: 0,
      feeTierPercent: newPairFeeTier,
      lpTokenTotalSupply: Math.round(Math.sqrt(resA * resB)),
      createdAt: Date.now(),
      status: 'active',
    };

    const lpTx: EuTransaction = {
      txTag,
      method: 'TOKEN_CREATE',
      status: 'SUCCESS',
      from: '0xEU_Admin_Executive_Wallet',
      to: '0xEU_AMM_Factory_v3',
      value: `${resA.toLocaleString()} ${symA} + ${resB.toLocaleString()} ${symB}`,
      gasFee: '0.00000 EU',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        note: `New AMM Liquidity Pair ${symA}/${symB} initialized with ${newPairFeeTier}% fee tier.`,
      },
    };

    const updatedPairs = [newPair, ...(data.liquidityPairs || INITIAL_LIQUIDITY_PAIRS)];
    const updatedData: PersistedBlockchainData = {
      ...data,
      blockHeight: nextBlock,
      liquidityPairs: updatedPairs,
      transactions: [lpTx, ...data.transactions],
    };

    setData(updatedData);
    saveBlockchainData(updatedData);
    soundFx.playReward();
    setPairSuccessMsg(`Liquidity Pool ${symA}/${symB} deployed with ${newPair.lpTokenTotalSupply.toLocaleString()} LP tokens minted!`);
    setTimeout(() => setPairSuccessMsg(null), 3500);
  };

  // Stake into Validator Pool
  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(stakeAmount) || 0;
    if (amt <= 0) return;

    soundFx.playClick();
    const nextBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();

    const targetPool = stakingPools.find((p) => p.id === selectedPoolId) || stakingPools[0];

    const updatedPools = stakingPools.map((p) => {
      if (p.id === targetPool.id) {
        return {
          ...p,
          totalStaked: p.totalStaked + amt,
          userStakedAmount: p.userStakedAmount + amt,
          totalDelegators: p.totalDelegators + 1,
        };
      }
      return p;
    });

    const stakeTx: EuTransaction = {
      txTag,
      method: 'GAS_CLAIM',
      status: 'SUCCESS',
      from: '0xEU_Admin_Executive_Wallet',
      to: targetPool.validatorAddress,
      value: `${amt.toFixed(2)} ${targetPool.tokenSymbol}`,
      gasFee: '0.00000 EU',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        note: `Staked ${amt.toFixed(2)} ${targetPool.tokenSymbol} into ${targetPool.name} (${targetPool.aprPercent}% APR yield)`,
      },
    };

    const updatedData: PersistedBlockchainData = {
      ...data,
      userEuBalance: Math.max(0, data.userEuBalance - amt),
      blockHeight: nextBlock,
      stakingPools: updatedPools,
      transactions: [stakeTx, ...data.transactions],
    };

    setData(updatedData);
    saveBlockchainData(updatedData);
    soundFx.playReward();
    setStakeSuccessMsg(`Successfully staked ${amt.toFixed(2)} ${targetPool.tokenSymbol} into ${targetPool.name}!`);
    setTimeout(() => setStakeSuccessMsg(null), 3500);
  };

  // Deploy Standard EUP-20 Token (Cost: 0.3 EUR)
  const handleDeployToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim() || !newTokenSymbol.trim()) return;

    soundFx.playClick();
    const cleanSym = newTokenSymbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanSupply = parseFloat(newTokenSupply) || 10000000;
    const initialPrice = Math.max(0.000001, parseFloat(newTokenPrice) || 1.0);
    const contract = generateContractAddress();
    const creationTxTag = generateCryptoTag();
    const nextBlock = data.blockHeight + 1;

    const enabledFeaturesList = [
      newTokenMintable && 'Mintable',
      newTokenBurnable && 'Burnable',
      newTokenPausable && 'Pausable',
      newTokenAntiWhale && 'Anti-Whale (2% Cap)',
      newTokenLiquidityLock && 'Auto-Liquidity Locked',
    ].filter(Boolean) as string[];

    const tokenObj: EuToken = {
      id: `tok-${Date.now()}-${cleanSym.toLowerCase()}`,
      name: newTokenName.trim(),
      symbol: cleanSym,
      decimals: newTokenDecimals,
      totalSupply: cleanSupply,
      priceUsd: initialPrice,
      priceChange24h: 0.0,
      isBuiltInEuBlockchain: true,
      category: newTokenCategory,
      contractAddress: contract,
      creatorAddress: '0xEU_Master_Admin_001',
      createdAt: Date.now(),
      txTag: creationTxTag,
      status: 'active',
      description: `EUP-20 Enterprise Asset verified by EU Blockchain Administrator. Features: ${enabledFeaturesList.join(', ')}.`,
      marketCapUsd: cleanSupply * initialPrice,
      volume24hUsd: 0,
      features: {
        isMintable: newTokenMintable,
        isBurnable: newTokenBurnable,
        isPausable: newTokenPausable,
        hasAntiWhale: newTokenAntiWhale,
        autoLiquidityLock: newTokenLiquidityLock,
      },
      deploymentCostEur: 0.30,
    };

    const newTx: EuTransaction = {
      txTag: creationTxTag,
      method: 'TOKEN_CREATE',
      status: 'SUCCESS',
      from: '0xEU_Master_Admin_001',
      to: contract,
      value: `${cleanSupply.toLocaleString()} ${cleanSym}`,
      gasFee: '0.30 EUR',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        tokenName: tokenObj.name,
        tokenSymbol: tokenObj.symbol,
        tokenContract: contract,
        amountIn: `${cleanSupply.toLocaleString()} Genesis Supply ($${initialPrice.toFixed(4)} USD)`,
        note: `Smart Contract Deployment (0.3 EUR Cost • ${newTokenCategory} Standard • ${newTokenDecimals} Decimals • Features: ${enabledFeaturesList.join(', ')})`,
      },
    };

    const nextData: PersistedBlockchainData = {
      ...data,
      userEuBalance: Math.max(0, data.userEuBalance - 0.30),
      blockHeight: nextBlock,
      tokens: [tokenObj, ...data.tokens],
      transactions: [newTx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setTokenDeployMsg(`Token [${cleanSym}] successfully deployed at 0.3 EUR cost! Contract: ${contract.slice(0, 16)}...`);
    setNewTokenName('');
    setNewTokenSymbol('');
    setTimeout(() => {
      setTokenDeployMsg(null);
      setShowDeployTokenModal(false);
    }, 2000);
  };

  // Execute Exchange Trade (Dynamic Any-to-Any Token Swap Engine)
  const handleExecuteTrade = () => {
    const amt = parseFloat(tradeAmount) || 0;
    if (amt <= 0) return;

    soundFx.playClick();
    const nextBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();

    const fromToken = data.tokens.find((t) => t.symbol === tradeFromAsset);
    const toToken = data.tokens.find((t) => t.symbol === tradeToAsset);
    const fromPrice = fromToken ? fromToken.priceUsd : (tradeFromAsset === 'USDT' ? 1.0 : centralCoin.priceUsd);
    const toPrice = toToken ? toToken.priceUsd : (tradeToAsset === 'USDT' ? 1.0 : centralCoin.priceUsd);
    const rate = toPrice > 0 ? fromPrice / toPrice : 1.0;
    const outAmt = (amt * rate).toFixed(4);

    const tx: EuTransaction = {
      txTag,
      method: exchangeMode === 'swap' ? 'SWAP' : exchangeMode === 'buy' ? 'BUY' : 'SELL',
      status: 'SUCCESS',
      from: '0xEU_Master_Admin_001',
      to: '0xEU_AMM_Router_Institutional',
      value: `${amt.toFixed(2)} ${tradeFromAsset}`,
      gasFee: '0.00000 EU (Admin Exemption)',
      blockNumber: nextBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        amountIn: `${amt.toFixed(2)} ${tradeFromAsset}`,
        amountOut: `${outAmt} ${tradeToAsset}`,
        exchangeRate: `1 ${tradeFromAsset} = ${rate.toFixed(4)} ${tradeToAsset}`,
        slippage: '0.1%',
        note: `Decentralized AMM Execution between ${tradeFromAsset} and ${tradeToAsset}`,
      },
    };

    const nextData: PersistedBlockchainData = {
      ...data,
      blockHeight: nextBlock,
      transactions: [tx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setTradeSuccessTx(tx);
  };

  // Reactions Vote
  const handleVote = (type: 'thumbsUp' | 'rockets' | 'flames') => {
    soundFx.playClick();
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[#f4f7fa] text-slate-800 font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY TOOLBAR WITH 3-LINES TOGGLE SWITCH */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200/90 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-30">
        
        {/* Left Side: 3-LINES TOGGLE BUTTON & BRANDING */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* THE 3-LINES TOGGLE SWITCH BUTTON */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsNavDropdownOpen(!isNavDropdownOpen);
            }}
            aria-label="Toggle Navigation Page"
            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
              isNavDropdownOpen
                ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-sky-500/30'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
            }`}
            title="3 Lines Toggle: Bring down navigation page"
          >
            {/* 3 LINES ICON (Animated Hamburger) */}
            <div className="flex flex-col justify-center items-center gap-1 w-5 h-4">
              <span
                className={`block h-0.5 w-4.5 rounded-full transition-all duration-200 ${
                  isNavDropdownOpen ? 'bg-amber-400 rotate-45 translate-y-1.5' : 'bg-slate-800 group-hover:bg-blue-600'
                }`}
              />
              <span
                className={`block h-0.5 w-4.5 rounded-full transition-all duration-150 ${
                  isNavDropdownOpen ? 'opacity-0 scale-x-0' : 'bg-slate-800 group-hover:bg-blue-600'
                }`}
              />
              <span
                className={`block h-0.5 w-4.5 rounded-full transition-all duration-200 ${
                  isNavDropdownOpen ? 'bg-amber-400 -rotate-45 -translate-y-1.5' : 'bg-slate-800 group-hover:bg-blue-600'
                }`}
              />
            </div>

            {/* Label and Switch Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-sans tracking-tight">Navigation</span>
              <div
                className={`w-7 h-3.5 rounded-full p-0.5 transition-colors duration-200 ${
                  isNavDropdownOpen ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                    isNavDropdownOpen ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Console Identity Pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1">
              <span>Crypto Admin</span>
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                ©
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Layer-1 Protocol Suite</span>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-xs ml-2 hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts, pairs, pools..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 outline-none transition"
            />
          </div>
        </div>

        {/* Right Side: Quick Stats Switcher, Block Height & Explorer Switch */}
        <div className="flex items-center gap-2">
          {/* Quick Stats Toggle Switch */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowQuickStatsBar(!showQuickStatsBar);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              showQuickStatsBar
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Quick Balance & Convert Bar"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Stats Strip</span>
            <div
              className={`w-6 h-3 rounded-full p-0.5 transition-colors ${
                showQuickStatsBar ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full bg-white shadow-xs transition-transform ${
                  showQuickStatsBar ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Network Health Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Block #{data.blockHeight.toLocaleString()}</span>
          </div>

          {/* Explorer View & Sign Out */}
          <button
            onClick={() => {
              soundFx.playClick();
              onExitAdmin();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Public Explorer
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onLogout();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THE BROUGHT-DOWN NAVIGATION PAGE (OVERLAY FROM 3-LINES TOGGLE) */}
      {/* ========================================================================= */}
      {isNavDropdownOpen && (
        <div className="absolute inset-x-0 top-[49px] bottom-0 z-40 bg-slate-950/95 backdrop-blur-xl text-white overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-200 border-b border-slate-800 shadow-2xl flex flex-col p-4 sm:p-6 space-y-6">
          
          {/* Header of Drop-down Navigation Page */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>EuScan Crypto Admin Navigation Console</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">
                    FULL ACCESS
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select any section below to switch views. The main page will render in 100% full view.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNavDropdownOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <X className="w-4 h-4" />
              <span>Close Menu</span>
            </button>
          </div>

          {/* Navigation Hub Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-6xl mx-auto w-full">
            
            {/* Card 1: Dashboard */}
            <div
              onClick={() => {
                soundFx.playClick();
                setActiveNavView('dashboard');
                setIsNavDropdownOpen(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeNavView === 'dashboard'
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">Dash 1-5 • Live</span>
              </div>
              <h4 className="font-bold text-sm text-white">Interactive Chart Dashboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-width SVG hero price chart with ALL/YTD/1Y/6M/1M filters, governance reactions, and BTC/EU sparklines.
              </p>
            </div>

            {/* Card 2: Central Coin Launchpad */}
            <div
              onClick={() => {
                soundFx.playClick();
                setActiveNavView('central_coin');
                setIsNavDropdownOpen(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeNavView === 'central_coin'
                  ? 'bg-amber-600/20 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">HOME ECONOMY</span>
              </div>
              <h4 className="font-bold text-sm text-white">Central Coin Launchpad</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create and launch the central coin (${centralCoin.symbol}) to power platform gas fees, trading pairs, and treasury allocation.
              </p>
            </div>

            {/* Card 3: Coin Pairings & Liquidity */}
            <div
              onClick={() => {
                soundFx.playClick();
                setActiveNavView('liquidity');
                setIsNavDropdownOpen(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeNavView === 'liquidity'
                  ? 'bg-sky-600/20 border-sky-500 shadow-lg shadow-sky-500/20 ring-1 ring-sky-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-sky-400 font-bold">x · y = k AMM</span>
              </div>
              <h4 className="font-bold text-sm text-white">Coin Pairings & Liquidity ({liquidityPairs.length})</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Initialize new token trading pairs with the central coin, deposit seed reserves, configure fee tiers, and mint LP tokens.
              </p>
            </div>

            {/* Card 4: Staking & Yield Pools */}
            <div
              onClick={() => {
                soundFx.playClick();
                setActiveNavView('staking');
                setIsNavDropdownOpen(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeNavView === 'staking'
                  ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Server className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">15.65% APR</span>
              </div>
              <h4 className="font-bold text-sm text-white">Staking & Consensus Pools</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Delegate capital into validator nodes, configure lockup terms (Flexible, 30d, 90d), and earn automated compounding yields.
              </p>
            </div>

            {/* Card 5: Token Factory */}
            <div
              onClick={() => {
                soundFx.playClick();
                setActiveNavView('tokens');
                setIsNavDropdownOpen(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeNavView === 'tokens'
                  ? 'bg-orange-600/20 border-orange-500 shadow-lg shadow-orange-500/20 ring-1 ring-orange-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-orange-400 font-bold">EUP-20</span>
              </div>
              <h4 className="font-bold text-sm text-white">Crypto Token Factory ({data.tokens.length})</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deploy compliant smart contract assets directly under the EU Blockchain with custom supply and category configurations.
              </p>
            </div>

            {/* Card 6: DEX Exchange & Trading Terminal */}
            <div
              onClick={() => {
                soundFx.playClick();
                setActiveNavView('exchange');
                setIsNavDropdownOpen(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                activeNavView === 'exchange'
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">Zero Fee Admin</span>
              </div>
              <h4 className="font-bold text-sm text-white">DEX Exchange & Trade Terminal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Institutional Swaps, Buys, and Sells with automatic liquidity routing, low slippage, and central coin fee exemptions.
              </p>
            </div>
          </div>

          {/* Quick Accordion Section from Template (Options 1 to 40) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-6xl mx-auto w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="font-bold text-white uppercase tracking-wider">Extended Suite Shortcuts</span>
              <span>Template Options 1 to 40</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {['Dash 1 (Overview)', 'Dash 2 (Live Chart)', 'Dash 3 (Launchpad)', 'Dash 4 (Liquidity)', 'Dash 5 (Staking)'].map((dash, i) => (
                <button
                  key={dash}
                  onClick={() => {
                    soundFx.playClick();
                    if (i === 0 || i === 1) setActiveNavView('dashboard');
                    else if (i === 2) setActiveNavView('central_coin');
                    else if (i === 3) setActiveNavView('liquidity');
                    else setActiveNavView('staking');
                    setIsNavDropdownOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition cursor-pointer"
                >
                  {dash}
                </button>
              ))}

              <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-500 font-mono text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px]">New</span>
                <span>Options 36 to 40</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OPTIONAL QUICK STATS STRIP (CAN BE TOGGLED ON / OFF SO SCREEN IS FULL) */}
      {/* ========================================================================= */}
      {showQuickStatsBar && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Total Balance */}
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL BALANCE</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  ${((data.userEuBalance * centralCoin.priceUsd) + 246289.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" />
                3.15%+
              </span>
            </div>

            {/* Expense & Investment Quick Badges */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="text-slate-500">Expense:</span>
                <span className="font-bold text-slate-900 font-mono">12.8k</span>
                <span className="text-emerald-600 font-bold text-[10px]">-10%+</span>
              </div>

              <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="text-slate-500">Investment:</span>
                <span className="font-bold text-slate-900 font-mono">18.5k</span>
                <span className="text-rose-500 font-bold text-[10px]">13.15%-</span>
              </div>
            </div>

            {/* Convert Quick Bar */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={convertPayAmount}
                onChange={(e) => setConvertPayAmount(e.target.value)}
                className="w-20 px-2 py-1 rounded bg-slate-50 border border-slate-300 font-mono font-bold text-xs outline-none"
              />
              <span className="font-bold text-slate-700">{convertPayAsset} → {convertQuote} {convertReceiveAsset}</span>
              <button
                onClick={handleQuickConvert}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Convert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OPTIMIZED FULL-WIDTH PAGE WORKSPACE (NO BLUE SIDEBAR BLOCKING SCREEN) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-6 space-y-5 w-full max-w-7xl mx-auto">
        
        {/* Sub-Header Breadcrumb & Direct Action Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase tracking-wider font-mono">
              {activeNavView.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400">
              {activeNavView === 'dashboard' && '• Live Area Chart & Market Tickers'}
              {activeNavView === 'central_coin' && '• Home Trading Economy & Fee Asset'}
              {activeNavView === 'liquidity' && '• AMM Coin Pairings & Pools'}
              {activeNavView === 'staking' && '• Validator Delegations & Yield'}
              {activeNavView === 'tokens' && '• EUP-20 Token Factory'}
              {activeNavView === 'exchange' && '• Decentralized Trade Terminal'}
            </span>
          </div>

          {/* Quick Tab Switcher Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveNavView('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeNavView === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              Chart Dashboard
            </button>

            <button
              onClick={() => setActiveNavView('central_coin')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeNavView === 'central_coin' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Launchpad</span>
            </button>

            <button
              onClick={() => setActiveNavView('liquidity')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeNavView === 'liquidity' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>Liquidity Pools</span>
            </button>

            <button
              onClick={() => setActiveNavView('staking')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeNavView === 'staking' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              <span>Staking</span>
            </button>

            <button
              onClick={() => setActiveNavView('tokens')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeNavView === 'tokens' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-orange-500" />
              <span>Token Factory</span>
            </button>

            <button
              onClick={() => setActiveNavView('exchange')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeNavView === 'exchange' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              <span>Exchange</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* VIEW 1: HERO DASHBOARD (100% FULL-WIDTH OPTIMIZED) */}
        {/* ======================================================================= */}
        {activeNavView === 'dashboard' && (
          <div className="space-y-5 w-full">
            {/* Hero Chart Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 w-full">
              {/* Header Banner: Coin Ticker, Red Down Pill, Big Price */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {centralCoin.name} ({centralCoin.symbol}-USD)
                  </h2>
                  <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold font-mono">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    150.15%-
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  ${(centralCoin.priceUsd * 30516.8).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Sub-Header Toolbar: Time Filters + View Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                {/* Time Filters: ALL, YTD, 1Y, 6M, 1M */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                  {(['ALL', 'YTD', '1Y', '6M', '1M'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        soundFx.playClick();
                        setTimeFilter(tf);
                      }}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        timeFilter === tf
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Right Tabs: Historical Data, Conversations, Chart (Active), Summary */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <button
                    onClick={() => setActiveTab('historical')}
                    className={`hover:text-blue-600 transition cursor-pointer ${activeTab === 'historical' ? 'text-blue-600 font-bold' : ''}`}
                  >
                    Historical Data
                  </button>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className={`hover:text-blue-600 transition cursor-pointer ${activeTab === 'conversations' ? 'text-blue-600 font-bold' : ''}`}
                  >
                    Conversations
                  </button>
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={`pb-0.5 border-b-2 transition cursor-pointer ${
                      activeTab === 'chart'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent hover:text-blue-600'
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`hover:text-blue-600 transition cursor-pointer ${activeTab === 'summary' ? 'text-blue-600 font-bold' : ''}`}
                  >
                    Summary
                  </button>
                </div>
              </div>

              {/* Full-width Area Chart */}
              <div className="relative pt-2 w-full">
                <div className="flex items-center justify-end gap-2 text-slate-400 text-xs mb-1">
                  <span className="hover:text-slate-700 cursor-pointer">≡</span>
                  <span className="hover:text-slate-700 cursor-pointer">⌂</span>
                  <span className="hover:text-slate-700 cursor-pointer">⤢</span>
                  <span className="hover:text-slate-700 cursor-pointer">🔍</span>
                  <span className="hover:text-slate-700 cursor-pointer">⊖</span>
                  <span className="hover:text-slate-700 cursor-pointer">⊕</span>
                </div>

                <div className="h-64 sm:h-80 w-full flex">
                  {/* Y-Axis */}
                  <div className="flex flex-col justify-between text-[11px] font-mono text-slate-400 pr-2 select-none shrink-0 text-right w-12">
                    <span>40.00</span>
                    <span>39.00</span>
                    <span>38.00</span>
                    <span>37.00</span>
                    <span>36.00</span>
                    <span>35.00</span>
                    <span>34.00</span>
                    <span>32.00</span>
                    <span>30.00</span>
                    <span>28.00</span>
                  </div>

                  {/* SVG Canvas */}
                  <div className="flex-1 relative border-l border-b border-slate-200">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                      <defs>
                        <linearGradient id="fullAreaGradientBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                          <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>

                      {[30, 60, 90, 120, 150, 180, 210, 240, 270].map((y) => (
                        <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                      ))}

                      <path
                        d="M 0 180 
                           Q 30 185, 50 180 
                           T 100 200 
                           T 150 215 
                           T 200 180 
                           T 250 150 
                           T 300 170 
                           T 350 130 
                           T 400 140 
                           T 450 110 
                           T 500 125 
                           T 550 95 
                           T 600 115 
                           T 650 90 
                           T 700 85 
                           T 750 105 
                           T 800 80 
                           T 850 70 
                           T 900 65 
                           T 950 50 
                           L 1000 45 
                           L 1000 300 
                           L 0 300 Z"
                        fill="url(#fullAreaGradientBlue)"
                      />

                      <path
                        d="M 0 180 
                           Q 30 185, 50 180 
                           T 100 200 
                           T 150 215 
                           T 200 180 
                           T 250 150 
                           T 300 170 
                           T 350 130 
                           T 400 140 
                           T 450 110 
                           T 500 125 
                           T 550 95 
                           T 600 115 
                           T 650 90 
                           T 700 85 
                           T 750 105 
                           T 800 80 
                           T 850 70 
                           T 900 65 
                           T 950 50 
                           L 1000 45"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      <circle cx="1000" cy="45" r="5" fill="#0284c7" />
                      <circle cx="1000" cy="45" r="9" fill="#38bdf8" opacity="0.5" className="animate-ping" />
                    </svg>
                  </div>
                </div>

                {/* X-Axis Dates */}
                <div className="flex justify-between pl-12 text-[10px] sm:text-[11px] font-mono text-slate-400 pt-2 select-none overflow-x-auto">
                  <span>Mar '19</span>
                  <span>Mar 15</span>
                  <span>Apr '19</span>
                  <span>Apr 15</span>
                  <span>May '19</span>
                  <span>May 15</span>
                  <span>Jun '19</span>
                  <span>Jun 15</span>
                  <span>Jul '19</span>
                  <span>Jul 15</span>
                  <span>Aug '19</span>
                  <span>Aug 15</span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Cards Grid (Optimized to Full Width) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              
              {/* 1. Reactions Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 font-mono">reactions 123,414</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      ACTIVE PROPOSAL
                    </span>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        SK
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">Sarah Kortney</span>
                        <span className="text-[10px] text-slate-400">2h ago</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      What do you think about our plans for the {centralCoin.symbol} Central Coin home trading economy and liquidity bootstrap?
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote('thumbsUp')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>{reactions.thumbsUp}</span>
                    </button>

                    <button
                      onClick={() => handleVote('rockets')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5 text-sky-500" />
                      <span>{reactions.rockets}</span>
                    </button>

                    <button
                      onClick={() => handleVote('flames')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{reactions.flames}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Master Cat</span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-[10px] flex items-center justify-center">🐱</span>
                  </div>
                </div>
              </div>

              {/* 2. BTC-USD Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">BTC-USD</h4>
                    <span className="text-[11px] text-slate-400">Bitcoin USD</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ₿
                  </div>
                </div>

                <div className="h-16 w-full">
                  <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path
                      d="M 0 50 Q 20 55, 40 45 T 80 40 T 120 20 T 160 35 L 200 15 L 200 60 L 0 60 Z"
                      fill="#fee2e2"
                    />
                    <path
                      d="M 0 50 Q 20 55, 40 45 T 80 40 T 120 20 T 160 35 L 200 15"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                  <span className={`inline-flex items-center text-xs font-bold font-mono ${
                    (data.tokens.find((t) => t.symbol === 'BTC')?.priceChange24h || 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {(data.tokens.find((t) => t.symbol === 'BTC')?.priceChange24h || 0) >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {(data.tokens.find((t) => t.symbol === 'BTC')?.priceChange24h || 0) >= 0 ? '+' : ''}
                    {(data.tokens.find((t) => t.symbol === 'BTC')?.priceChange24h || 2.15).toFixed(2)}%
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ${(data.tokens.find((t) => t.symbol === 'BTC')?.priceUsd || 65420.0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* 3. Central Coin USD Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">
                      {centralCoin.isLaunched && centralCoin.symbol ? `${centralCoin.symbol}-USD` : 'Home Coin-USD'}
                    </h4>
                    <span className="text-[11px] text-slate-400">Platform Home Trading Economy</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                </div>

                <div className="h-16 w-full">
                  <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path
                      d="M 0 55 Q 30 20, 60 50 T 120 25 T 160 40 L 200 10 L 200 60 L 0 60 Z"
                      fill="#ccfbf1"
                    />
                    <path
                      d="M 0 55 Q 30 20, 60 50 T 120 25 T 160 40 L 200 10"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                  <span className={`inline-flex items-center text-xs font-bold font-mono ${
                    centralCoin.priceChange24h >= 0 ? 'text-teal-600' : 'text-rose-500'
                  }`}>
                    {centralCoin.priceChange24h >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {centralCoin.priceChange24h >= 0 ? '+' : ''}
                    {centralCoin.priceChange24h.toFixed(2)}%
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ${centralCoin.priceUsd.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 2: CENTRAL COIN LAUNCHPAD (100% FULL-WIDTH) */}
        {/* ======================================================================= */}
        {activeNavView === 'central_coin' && (
          <div className="space-y-4 w-full">
            <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 w-full">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Launch Central Coin (Platform Home Trading Economy & Fee Asset)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Build and deploy the platform home trading economy coin into the EU Blockchain ledger. Deploying the home coin costs 0 EUR.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {centralCoin.isLaunched ? 'CURRENT ACTIVE HOME COIN' : 'HOME COIN STATUS'}
                  </span>
                  {centralCoin.isLaunched && centralCoin.symbol ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-2xl font-black text-amber-600 font-mono">
                        ${centralCoin.symbol}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        (${centralCoin.priceUsd.toFixed(2)} USD)
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Awaiting Genesis Launch (Cost: 0 EUR)
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleLaunchCentralCoin} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Home Coin Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EU Sovereign Coin"
                      value={launchCoinName}
                      onChange={(e) => setLaunchCoinName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Ticker Symbol</label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. SOV"
                      value={launchCoinSymbol}
                      onChange={(e) => setLaunchCoinSymbol(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none uppercase focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Genesis Total Supply</label>
                    <input
                      type="number"
                      required
                      min="1000000"
                      value={launchSupply}
                      onChange={(e) => setLaunchSupply(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Initial Price ($USD)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={launchInitialPrice}
                      onChange={(e) => setLaunchInitialPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Fee Burn Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={launchBurnRate}
                      onChange={(e) => setLaunchBurnRate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Validator Reward (%)</label>
                    <input
                      type="number"
                      min="20"
                      max="90"
                      value={launchValidatorReward}
                      onChange={(e) => setLaunchValidatorReward(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Treasury Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={launchTreasuryShare}
                      onChange={(e) => setLaunchTreasuryShare(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-900 font-semibold">
                      Deployment Gas Fee: <strong className="font-mono text-emerald-700 font-bold">0 EUR (Cost: 0)</strong>
                    </span>
                  </div>
                  <span className="text-emerald-800 font-bold">Standard: Layer-1 Home Economy Native</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {centralCoin.isLaunched
                      ? `Re-Deploy Home Coin [${launchCoinSymbol || centralCoin.symbol}] (Cost: 0 EUR)`
                      : `Build & Deploy Home Coin to Mainnet Economy (Cost: 0 EUR)`}
                  </span>
                </button>
              </form>

              {centralLaunchSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{centralLaunchSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 3: LIQUIDITY PAIRS FACTORY (100% FULL-WIDTH) */}
        {/* ======================================================================= */}
        {activeNavView === 'liquidity' && (
          <div className="space-y-4 w-full">
            <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 w-full">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-500" />
                  <span>Initialize Coin Pairing & Liquidity Pool ($x \cdot y = k$)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create instant automated market maker liquidity pools between newly launched tokens and the central coin ({centralCoin.symbol}) or USDT.
                </p>
              </div>

              <form onSubmit={handleCreateLiquidityPair} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Token A (Base)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newPairTokenA}
                        onChange={(e) => setNewPairTokenA(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 uppercase outline-none"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Deposit Reserve A"
                        value={newPairReserveA}
                        onChange={(e) => setNewPairReserveA(e.target.value)}
                        className="w-36 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Token B (Quote / Central Coin)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newPairTokenB}
                        onChange={(e) => setNewPairTokenB(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 uppercase outline-none"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Deposit Reserve B"
                        value={newPairReserveB}
                        onChange={(e) => setNewPairReserveB(e.target.value)}
                        className="w-36 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-slate-500">Fee Tier:</span>
                    {[0.05, 0.30, 1.00].map((fee) => (
                      <button
                        key={fee}
                        type="button"
                        onClick={() => setNewPairFeeTier(fee)}
                        className={`px-3 py-1 rounded-md transition cursor-pointer ${
                          newPairFeeTier === fee ? 'bg-sky-500 text-white font-bold' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {fee.toFixed(2)}%
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Deploy Liquidity Pair & Mint LP</span>
                  </button>
                </div>
              </form>

              {pairSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{pairSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Active Pairs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Active AMM Liquidity Pairs ({liquidityPairs.length})</h4>
                <span className="text-xs text-slate-500">Algorithm: Constant Product Market Maker</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Pair</th>
                      <th className="py-3 px-4">Reserves (Token A / B)</th>
                      <th className="py-3 px-4">Total Liquidity</th>
                      <th className="py-3 px-4">Fee Tier</th>
                      <th className="py-3 px-4">LP Minted</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {liquidityPairs.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                            {p.tokenA.slice(0, 2)}
                          </span>
                          <span>{p.tokenA} / {p.tokenB}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.reserveA.toLocaleString()} {p.tokenA} • {p.reserveB.toLocaleString()} {p.tokenB}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">${p.totalLiquidityUsd.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-bold text-sky-600">{p.feeTierPercent}%</td>
                        <td className="py-3.5 px-4 font-mono">{p.lpTokenTotalSupply.toLocaleString()} LP</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 4: STAKING & YIELD (100% FULL-WIDTH) */}
        {/* ======================================================================= */}
        {activeNavView === 'staking' && (
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CONSENSUS STAKED</span>
                <div className="text-xl font-black text-slate-900 font-mono">151,700,000 EU</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+4.2% Delegated Stake Inflow</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AVERAGE VALIDATOR APR</span>
                <div className="text-xl font-black text-emerald-600 font-mono">15.65%</div>
                <span className="text-[10px] text-slate-500 font-semibold">Tier-1 Consensus Security</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YOUR STAKED BALANCE</span>
                <div className="text-xl font-black text-blue-600 font-mono">
                  {stakingPools.reduce((acc, p) => acc + p.userStakedAmount, 0).toLocaleString()} EU
                </div>
                <span className="text-[10px] text-sky-600 font-semibold">Generating Daily Compound Yield</span>
              </div>
            </div>

            {/* Stake Injection Form */}
            <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 w-full">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-500" />
                <span>Stake Capital into Consensus Validator Nodes</span>
              </h3>

              <form onSubmit={handleStakeSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Staking Pool</label>
                  <select
                    value={selectedPoolId}
                    onChange={(e) => setSelectedPoolId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 outline-none"
                  >
                    {stakingPools.map((pool) => (
                      <option key={pool.id} value={pool.id}>
                        {pool.name} ({pool.aprPercent}% APR • {pool.lockupDays === 0 ? 'Flexible' : `${pool.lockupDays}d Lock`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stake Amount</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    Deposit & Delegate Stake
                  </button>
                </div>
              </form>

              {stakeSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{stakeSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Staking Pools Registry Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Consensus Staking Pools ({stakingPools.length})</h4>
                <span className="text-xs text-slate-500">Validator Consensus Nodes</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs font-mono">
                {stakingPools.map((pool) => (
                  <div key={pool.id} className="p-4 hover:bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{pool.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {pool.aprPercent}% APR
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {pool.lockupDays === 0 ? 'No Lock' : `${pool.lockupDays} Days Lockup`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Validator: <span className="text-slate-700">{pool.validatorAddress.slice(0, 20)}...</span> • Total Staked: {pool.totalStaked.toLocaleString()} {pool.tokenSymbol}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 block">
                        You Staked: {pool.userStakedAmount.toLocaleString()} {pool.tokenSymbol}
                      </span>
                      <span className="text-[10px] text-slate-400">Delegators: {pool.totalDelegators.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 5: TOKENS PAGE & CENTRAL ECONOMY REGISTRY (100% FULL-WIDTH) */}
        {/* ======================================================================= */}
        {activeNavView === 'tokens' && (
          <div className="space-y-4 w-full">
            {/* Top Tokens Hero & Live Feeds Status */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                      <Coins className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      EU Blockchain Token Registry & Market Valuation
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage all ecosystem assets, inspect live global market feeds, and control market value for EU Blockchain tokens.
                  </p>
                </div>

                {/* Live Feeds Sync Status & Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Global Feeds (BTC, ETH, USDT)</span>
                  </div>

                  <button
                    onClick={handleRefreshLivePrices}
                    disabled={isLivePricesLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    title="Fetch latest real-time prices from Binance / CoinGecko"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLivePricesLoading ? 'animate-spin text-sky-600' : ''}`} />
                    <span>{isLivePricesLoading ? 'Syncing...' : 'Sync Live Prices'}</span>
                  </button>

                  {/* VALUE CONTROL QUICK LAUNCH BUTTON */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      const euTokens = data.tokens.filter((t) => t.isBuiltInEuBlockchain);
                      if (euTokens.length > 0) {
                        handleOpenValueControl(euTokens[0]);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    title="Control market value of tokens built in EU Blockchain"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Value Control</span>
                  </button>

                  {/* Deploy New Token Build Interface Button */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowDeployTokenModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deploy New Token (0.3 EUR)</span>
                  </button>
                </div>
              </div>

              {/* Quick Live Market Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* BTC Live */}
                {(() => {
                  const btc = data.tokens.find((t) => t.symbol === 'BTC');
                  const p = btc?.priceUsd || 65420.0;
                  const c = btc?.priceChange24h || 2.15;
                  return (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">₿</span>
                          <span>Bitcoin (BTC)</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">● LIVE</span>
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        ${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${c >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {c >= 0 ? '+' : ''}{c.toFixed(2)}% (24h)
                      </span>
                    </div>
                  );
                })()}

                {/* ETH Live */}
                {(() => {
                  const eth = data.tokens.find((t) => t.symbol === 'ETH');
                  const p = eth?.priceUsd || 2640.5;
                  const c = eth?.priceChange24h || 3.42;
                  return (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">Ξ</span>
                          <span>Ethereum (ETH)</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">● LIVE</span>
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        ${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${c >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {c >= 0 ? '+' : ''}{c.toFixed(2)}% (24h)
                      </span>
                    </div>
                  );
                })()}

                {/* USDT Live */}
                {(() => {
                  const usdt = data.tokens.find((t) => t.symbol === 'USDT');
                  const p = usdt?.priceUsd || 1.0;
                  return (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">$</span>
                          <span>Tether (USDT)</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">● LIVE</span>
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono">${p.toFixed(2)}</div>
                      <span className="text-[10px] text-slate-500 font-mono">Global Stable Settlement</span>
                    </div>
                  );
                })()}

                {/* Central / Home Coin Card */}
                {centralCoin.isLaunched && centralCoin.symbol ? (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 flex items-center gap-1 truncate">
                        <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {centralCoin.symbol.slice(0, 1)}
                        </span>
                        <span className="truncate">{centralCoin.name || centralCoin.symbol}</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">HOME COIN</span>
                    </div>
                    <div className="text-base font-black text-amber-950 font-mono">
                      ${centralCoin.priceUsd.toFixed(2)} USD
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold font-mono">
                      Admin Market Controlled
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-xs">Home Coin</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">UNLAUNCHED</span>
                    </div>
                    <div className="text-xs font-bold text-slate-500 font-mono">
                      Cost: 0 EUR to Deploy
                    </div>
                    <button
                      onClick={() => setActiveNavView('central_coin')}
                      className="text-[10px] text-blue-600 font-bold hover:underline block text-left cursor-pointer"
                    >
                      Launch in Launchpad →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tokens Search & Filter Controls */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by token name, symbol, or contract address..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* Origin Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                {(['all', 'eu', 'global'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      soundFx.playClick();
                      setTokenOriginFilter(mode);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                      tokenOriginFilter === mode
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'all'
                      ? `All (${data.tokens.length})`
                      : mode === 'eu'
                      ? `EU Blockchain (${data.tokens.filter((t) => t.isBuiltInEuBlockchain).length})`
                      : 'Global (BTC, ETH, USDT)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Complete Tokens Page Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Available Tokens ({data.tokens.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    All created tokens stay permanent in the blockchain and are tradable unless deleted.
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Total Market Cap: ${data.tokens.reduce((acc, t) => acc + (t.totalSupply * t.priceUsd), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Origin / Type</th>
                      <th className="py-3 px-4">Price ($USD)</th>
                      <th className="py-3 px-4">24h Change</th>
                      <th className="py-3 px-4">Market Cap</th>
                      <th className="py-3 px-4">Total Supply</th>
                      <th className="py-3 px-4">Contract Address</th>
                      <th className="py-3 px-4 text-right">Actions & Value Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.tokens
                      .filter((tok) => {
                        if (tok.status === 'deleted') return false;
                        if (tokenOriginFilter === 'eu' && !tok.isBuiltInEuBlockchain) return false;
                        if (tokenOriginFilter === 'global' && tok.isBuiltInEuBlockchain) return false;
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          tok.name.toLowerCase().includes(q) ||
                          tok.symbol.toLowerCase().includes(q) ||
                          tok.contractAddress.toLowerCase().includes(q)
                        );
                      })
                      .map((tok, idx) => (
                        <tr key={tok.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                                tok.symbol === 'BTC'
                                  ? 'bg-amber-500'
                                  : tok.symbol === 'ETH'
                                  ? 'bg-indigo-600'
                                  : tok.symbol === 'USDT'
                                  ? 'bg-teal-500'
                                  : tok.symbol === centralCoin.symbol
                                  ? 'bg-amber-600'
                                  : 'bg-orange-500'
                              }`}>
                                {tok.symbol.slice(0, 3)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{tok.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">(${tok.symbol})</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{tok.category}</span>
                              </div>
                            </div>
                          </td>

                          {/* Origin Badge */}
                          <td className="py-3.5 px-4">
                            {centralCoin.isLaunched && tok.symbol === centralCoin.symbol ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                Platform Home Coin
                              </span>
                            ) : tok.isBuiltInEuBlockchain ? (
                              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">
                                EU Blockchain (EUP-20)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                Global Asset
                              </span>
                            )}
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-1">
                              <span>${tok.priceUsd >= 1000 ? tok.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : tok.priceUsd.toFixed(4)}</span>
                              {!tok.isBuiltInEuBlockchain && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title="Live Price Feed" />
                              )}
                            </div>
                          </td>

                          {/* 24h Change */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center text-xs font-bold font-mono ${
                              tok.priceChange24h >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {tok.priceChange24h >= 0 ? (
                                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                              )}
                              {tok.priceChange24h >= 0 ? '+' : ''}{tok.priceChange24h.toFixed(2)}%
                            </span>
                          </td>

                          {/* Market Cap */}
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            ${(tok.totalSupply * tok.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>

                          {/* Total Supply */}
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {tok.totalSupply.toLocaleString()} {tok.symbol}
                          </td>

                          {/* Contract Address */}
                          <td className="py-3.5 px-4 font-mono">
                            <button
                              onClick={() => copyToClipboard(tok.contractAddress, tok.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-sky-600 transition cursor-pointer"
                              title="Copy Contract Address"
                            >
                              <span>{tok.contractAddress.slice(0, 6)}...{tok.contractAddress.slice(-4)}</span>
                              {copiedId === tok.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* Actions: VALUE CONTROL, TRADE, DELETE */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* VALUE CONTROL BUTTON */}
                              {tok.isBuiltInEuBlockchain ? (
                                <button
                                  onClick={() => handleOpenValueControl(tok)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                  title={`Control market value of ${tok.symbol} on EU Blockchain`}
                                >
                                  <SlidersHorizontal className="w-3 h-3" />
                                  <span>Value Control</span>
                                </button>
                              ) : (
                                <span
                                  className="px-2 py-1 rounded bg-slate-100 text-slate-400 text-[10px] font-mono cursor-default"
                                  title="Global asset prices are updated in real-time by live market feeds"
                                >
                                  Live Feed
                                </span>
                              )}

                              {/* Trade / Swap Button */}
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  setTradeFromAsset(tok.symbol);
                                  setActiveNavView('exchange');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer"
                                title={`Trade ${tok.symbol} in DEX Engine`}
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Trade</span>
                              </button>

                              {/* Delete Token Button (Admin only on custom EU tokens) */}
                              {tok.isBuiltInEuBlockchain && tok.symbol !== centralCoin.symbol && (
                                <button
                                  onClick={() => {
                                    soundFx.playClick();
                                    setTokenToDeleteConfirm(tok);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Permanently Delete/Revoke Token from Blockchain"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 6: DEX EXCHANGE & TRADING (100% FULL-WIDTH, ALL TOKENS DYNAMIC) */}
        {/* ======================================================================= */}
        {activeNavView === 'exchange' && (
          <div className="space-y-4 w-full">
            <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                    <span>DEX Master Trading Engine</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trade between BTC, ETH, USDT, {centralCoin.symbol}, and all created EU Blockchain tokens.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                  {(['swap', 'buy', 'sell'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setExchangeMode(m)}
                      className={`px-3 py-1 rounded-md capitalize transition cursor-pointer ${
                        exchangeMode === m ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Pay Asset */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>Pay Amount</span>
                    <span>
                      1 {tradeFromAsset} = ${(data.tokens.find((t) => t.symbol === tradeFromAsset)?.priceUsd || 1.0).toFixed(4)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="w-32 sm:w-40 text-base font-bold font-mono text-slate-900 bg-transparent outline-none"
                    />
                    <select
                      value={tradeFromAsset}
                      onChange={(e) => setTradeFromAsset(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-xs font-mono outline-none shadow-2xs"
                    >
                      {data.tokens
                        .filter((t) => t.status !== 'deleted')
                        .map((tok) => (
                          <option key={tok.id} value={tok.symbol}>
                            {tok.symbol} - {tok.name} (${tok.priceUsd >= 1000 ? tok.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }) : tok.priceUsd.toFixed(2)})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Receive Asset */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>Estimated Receive</span>
                    <span>
                      1 {tradeToAsset} = ${(data.tokens.find((t) => t.symbol === tradeToAsset)?.priceUsd || 1.0).toFixed(4)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-bold font-mono text-slate-900">
                      {(() => {
                        const fromTok = data.tokens.find((t) => t.symbol === tradeFromAsset);
                        const toTok = data.tokens.find((t) => t.symbol === tradeToAsset);
                        const fromP = fromTok ? fromTok.priceUsd : 1.0;
                        const toP = toTok ? toTok.priceUsd : 1.0;
                        const amt = parseFloat(tradeAmount) || 0;
                        return toP > 0 ? ((amt * fromP) / toP).toFixed(4) : '0.0000';
                      })()}
                    </span>
                    <select
                      value={tradeToAsset}
                      onChange={(e) => setTradeToAsset(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-xs font-mono outline-none shadow-2xs"
                    >
                      {data.tokens
                        .filter((t) => t.status !== 'deleted')
                        .map((tok) => (
                          <option key={tok.id} value={tok.symbol}>
                            {tok.symbol} - {tok.name} (${tok.priceUsd >= 1000 ? tok.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }) : tok.priceUsd.toFixed(2)})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Execution Route:</span>
                    <span className="font-bold text-slate-800">EU Liquidity AMM Core Router</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Fee:</span>
                    <span className="font-bold text-emerald-600">0.00000 EU (Admin Exemption)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slippage Tolerance:</span>
                    <span className="font-bold text-slate-800">0.10%</span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteTrade}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-indigo-500/25 cursor-pointer"
                >
                  Execute {exchangeMode.toUpperCase()} Order
                </button>
              </div>

              {tradeSuccessTx && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono space-y-1">
                  <div className="text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order Confirmed on EU Blockchain!</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Tx Tag: <span className="text-sky-600">{tradeSuccessTx.txTag.slice(0, 24)}...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS: VALUE CONTROL MODAL (CONTROL MARKET VALUE OF EU TOKENS) */}
      {/* ========================================================================= */}
      {selectedTokenForValueControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden space-y-4 p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    EU Blockchain Value Control
                  </h3>
                  <span className="text-xs text-slate-500">
                    Control market valuation for ${selectedTokenForValueControl.symbol} ({selectedTokenForValueControl.name})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTokenForValueControl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Token Meta & Current State */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Token Contract:</span>
                <span className="font-bold text-slate-800">{selectedTokenForValueControl.contractAddress.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Market Price:</span>
                <span className="font-bold text-slate-900 font-mono">${selectedTokenForValueControl.priceUsd.toFixed(4)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Supply:</span>
                <span className="font-bold text-slate-800">{selectedTokenForValueControl.totalSupply.toLocaleString()} {selectedTokenForValueControl.symbol}</span>
              </div>
            </div>

            {/* Form to Set Value */}
            <form onSubmit={handleSaveValueControl} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Market Value ($USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.0001"
                    min="0.000001"
                    required
                    value={controlPriceInput}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setControlPriceInput(newP);
                      const cur = selectedTokenForValueControl.priceUsd;
                      if (cur > 0 && parseFloat(newP) > 0) {
                        const pct = (((parseFloat(newP) - cur) / cur) * 100).toFixed(2);
                        setControlChangeInput(pct);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Increment Chips */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Quick Percentage Presets:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[-50, -25, -10, -5, 5, 10, 25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        const cur = selectedTokenForValueControl.priceUsd;
                        const target = Math.max(0.0001, cur * (1 + pct / 100));
                        setControlPriceInput(target.toFixed(4));
                        setControlChangeInput(pct.toFixed(2));
                      }}
                      className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer ${
                        pct > 0
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {pct > 0 ? `+${pct}%` : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 24h Change Override */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  24h Price Change Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={controlChangeInput}
                  onChange={(e) => setControlChangeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              {/* Projected Valuation Preview */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-mono space-y-1">
                <div className="flex justify-between text-amber-900">
                  <span>Projected Market Cap:</span>
                  <span className="font-bold">
                    ${((parseFloat(controlPriceInput) || 1.0) * selectedTokenForValueControl.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>
                <div className="flex justify-between text-amber-700 text-[11px]">
                  <span>On-Chain Consensus Proof:</span>
                  <span>Block #{data.blockHeight + 1} • Admin Signed</span>
                </div>
              </div>

              {valueControlSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{valueControlSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTokenForValueControl(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Apply Value Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Token Confirmation Modal */}
      {tokenToDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full overflow-hidden space-y-4 p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Permanently Delete Token?
                </h3>
                <span className="text-xs text-slate-500">
                  Revoke ${tokenToDeleteConfirm.symbol} from EU Blockchain
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently revoke <strong>{tokenToDeleteConfirm.name} ({tokenToDeleteConfirm.symbol})</strong>? This token contract will be destroyed and unregistered from the EU Blockchain ledger.
            </p>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-mono text-rose-800 space-y-1">
              <div>Contract: {tokenToDeleteConfirm.contractAddress}</div>
              <div>Supply: {tokenToDeleteConfirm.totalSupply.toLocaleString()} {tokenToDeleteConfirm.symbol}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTokenToDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteToken(tokenToDeleteConfirm)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Confirm Revocation & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOKEN FACTORY BUILD INTERFACE MODAL (Cost: 0.3 EUR) */}
      {/* ========================================================================= */}
      {showDeployTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-orange-300 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 font-sans">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                      Token Factory & Compiler Studio
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 font-mono">
                      EUP-20
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Build, configure, and deploy permanent smart contract tokens into the EU Blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono">
                  <span>Fee:</span>
                  <strong className="text-emerald-700">0.30 EUR</strong>
                </div>
                <button
                  onClick={() => setShowDeployTokenModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleDeployToken} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Section 1: Basic Specifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-orange-500" />
                    <span>1. Core Token Specifications</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Layer-1 EVM Compatible</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Token Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Protocol"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ticker Symbol (Max 8 Chars) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. APEX"
                      value={newTokenSymbol}
                      onChange={(e) => setNewTokenSymbol(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none uppercase focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Decimals Precision</label>
                    <select
                      value={newTokenDecimals}
                      onChange={(e) => setNewTokenDecimals(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                    >
                      <option value={18}>18 Decimals (Standard)</option>
                      <option value={9}>9 Decimals (Solana-Style)</option>
                      <option value={8}>8 Decimals (Bitcoin-Style)</option>
                      <option value={6}>6 Decimals (USDT-Style)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Initial Total Supply <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newTokenSupply}
                      onChange={(e) => setNewTokenSupply(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Initial Price ($USD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.000001"
                      required
                      value={newTokenPrice}
                      onChange={(e) => setNewTokenPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Token Category (OPTIMIZED TO FIT SCREEN VIEW) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-orange-500" />
                    <span>2. Token Category (Optimized Screen Fit)</span>
                  </span>
                  <span className="text-[11px] font-bold text-orange-600 font-mono">
                    Selected: {newTokenCategory}
                  </span>
                </div>

                {/* Responsive Category Grid: 2 columns on mobile, 4 columns on sm+ screens */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
                  {([
                    { id: 'DeFi', label: 'DeFi & Yield', desc: 'Financial Protocols' },
                    { id: 'Gaming', label: 'Gaming / GameFi', desc: 'Metaverse & P2E' },
                    { id: 'Utility', label: 'Utility Asset', desc: 'Services & Gas' },
                    { id: 'Governance', label: 'DAO Governance', desc: 'Voting & Staking' },
                    { id: 'Meme', label: 'Meme & Social', desc: 'Community Driven' },
                    { id: 'Layer2', label: 'Layer2 / Rollup', desc: 'Scaling Network' },
                    { id: 'AI Mesh', label: 'AI & Compute', desc: 'Autonomous Agent' },
                    { id: 'RWA', label: 'RWA Real World', desc: 'Asset Tokenization' },
                  ] as const).map((cat) => {
                    const isSelected = newTokenCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setNewTokenCategory(cat.id);
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-center ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500 shadow-2xs ring-1 ring-orange-500'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold text-xs truncate ${isSelected ? 'text-orange-950 font-black' : 'text-slate-800'}`}>
                            {cat.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate mt-0.5">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Smart Contract Capabilities & Feature Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-orange-500" />
                    <span>3. Smart Contract Options & Capabilities</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Configure On-Chain Logic</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Mintable */}
                  <label
                    onClick={() => setNewTokenMintable(!newTokenMintable)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      newTokenMintable ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newTokenMintable}
                      onChange={(e) => setNewTokenMintable(e.target.checked)}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-bold text-slate-900">Mintable Supply</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Allows owner to mint additional supply post-launch for liquidity rewards.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Burnable */}
                  <label
                    onClick={() => setNewTokenBurnable(!newTokenBurnable)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      newTokenBurnable ? 'bg-orange-50/60 border-orange-300' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newTokenBurnable}
                      onChange={(e) => setNewTokenBurnable(e.target.checked)}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                        <span className="font-bold text-slate-900">Burnable Deflation</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enables token holders or protocols to permanently burn and destroy tokens.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Pausable */}
                  <label
                    onClick={() => setNewTokenPausable(!newTokenPausable)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      newTokenPausable ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newTokenPausable}
                      onChange={(e) => setNewTokenPausable(e.target.checked)}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-slate-900">Pausable Circuit Breaker</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enables contract pause during emergency security reviews.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: Anti-Whale Protection */}
                  <label
                    onClick={() => setNewTokenAntiWhale(!newTokenAntiWhale)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      newTokenAntiWhale ? 'bg-indigo-50/60 border-indigo-300' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newTokenAntiWhale}
                      onChange={(e) => setNewTokenAntiWhale(e.target.checked)}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold text-slate-900">Anti-Whale Shield</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Restricts max transaction size to 2% of total supply to prevent market dumps.
                      </p>
                    </div>
                  </label>

                  {/* Option 5: Auto-Lock DEX Liquidity */}
                  <label
                    onClick={() => setNewTokenLiquidityLock(!newTokenLiquidityLock)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 sm:col-span-2 ${
                      newTokenLiquidityLock ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newTokenLiquidityLock}
                      onChange={(e) => setNewTokenLiquidityLock(e.target.checked)}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-900">Auto-Lock DEX Liquidity (365 Days)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Guarantees investor trust by locking initial DEX liquidity pairing pool in decentralized escrow.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 4: Deployment Tariff & Settlement Summary */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs text-amber-900">
                  <span className="font-sans font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Fixed Deployment Cost:</span>
                  </span>
                  <span className="font-black text-sm text-amber-800">0.30 EUR</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Projected Initial Market Cap:</span>
                  <span className="font-bold text-slate-900">
                    ${((parseFloat(newTokenSupply) || 0) * (parseFloat(newTokenPrice) || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Target Consensus Block:</span>
                  <span>Block #{data.blockHeight + 1}</span>
                </div>
                <div className="text-[10px] text-amber-800 font-sans leading-relaxed pt-1 border-t border-amber-200">
                  Newly deployed tokens stay permanent in the EU Blockchain ledger and are immediately tradable in the DEX router and editable via Value Control.
                </div>
              </div>

              {tokenDeployMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{tokenDeployMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeployTokenModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/25 cursor-pointer flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Build & Deploy Token (0.3 EUR)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
