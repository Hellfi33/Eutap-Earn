export interface EuBlock {
  blockNumber: number;
  timestamp: number;
  validator: string;
  txCount: number;
  gasUsed: number;
  gasLimit: number;
  reward: string;
  baseFee: string;
  hash: string;
}

export function generateBlocksList(latestBlock: number): EuBlock[] {
  const validators = [
    '0xEU_Validator_Sovereign_01',
    '0xEU_MeshNode_Nexus_42',
    '0xEU_Genesis_StakingPool_07',
    '0xEU_Lido_ValidatorMesh_19',
    '0xEU_Foundry_Node_88',
    '0xEU_Sentinel_Core_12',
  ];
  return Array.from({ length: 6 }, (_, i) => {
    const num = latestBlock - i;
    return {
      blockNumber: num,
      timestamp: Date.now() - i * 12000,
      validator: validators[i % validators.length],
      txCount: 120 + ((num * 17) % 85),
      gasUsed: 14500000 + ((num * 31) % 4000000),
      gasLimit: 30000000,
      reward: (2.01 + ((num % 10) * 0.03)).toFixed(4) + ' EU',
      baseFee: (11.8 + ((num % 5) * 0.4)).toFixed(1) + ' Gwei',
      hash: '0x' + Array.from({ length: 64 }, (_, k) => ((num + k * 7) % 16).toString(16)).join(''),
    };
  });
}

export interface EuTokenFeatures {
  isMintable?: boolean;
  isBurnable?: boolean;
  isPausable?: boolean;
  hasAntiWhale?: boolean;
  autoLiquidityLock?: boolean;
}

export interface EuToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  priceUsd: number;
  priceChange24h: number;
  isBuiltInEuBlockchain: boolean; // True for EU Blockchain assets (allows Admin Value Control)
  category: 'DeFi' | 'Gaming' | 'Utility' | 'Governance' | 'Meme' | 'Layer2' | 'AI Mesh' | 'RWA';
  contractAddress: string;
  creatorAddress: string;
  createdAt: number;
  txTag: string; // The creation transaction tag
  status: 'active' | 'deleted';
  description?: string;
  marketCapUsd?: number;
  volume24hUsd?: number;
  features?: EuTokenFeatures;
  deploymentCostEur?: number;
}

export type EuTxMethod =
  | 'TOKEN_CREATE'
  | 'TOKEN_DELETE'
  | 'SWAP'
  | 'BUY'
  | 'SELL'
  | 'COIN_MINT'
  | 'GAS_CLAIM'
  | 'VALUE_CONTROL_UPDATE';

export interface EuTransaction {
  txTag: string; // The cryptographic transaction tag / hash (0x...)
  method: EuTxMethod;
  status: 'SUCCESS' | 'PENDING' | 'REVERTED';
  from: string;
  to: string;
  value: string;
  gasFee: string;
  blockNumber: number;
  timestamp: number;
  nonce: number;
  details: {
    tokenName?: string;
    tokenSymbol?: string;
    tokenContract?: string;
    amountIn?: string;
    amountOut?: string;
    exchangeRate?: string;
    slippage?: string;
    note?: string;
  };
}

export interface BlockchainNetworkStats {
  chainId: number;
  networkName: string;
  nativeCoinSymbol: string;
  nativeCoinName: string;
  nativeCoinPriceUsd: number;
  blockHeight: number;
  blockTimeSec: number;
  tps: number;
  gasPriceGwei: number;
  activeValidators: number;
  totalTransactions: number;
  totalMarketCapUsd: number;
  stakedRatioPercent: number;
}

const STORAGE_KEY = 'euscan_blockchain_v2';

// Standard Global Tokens (BTC, ETH, USDT) - No mock-ups, No EU Central Core Coin
export const INITIAL_TOKENS: EuToken[] = [
  {
    id: 'tok-btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    totalSupply: 21000000,
    priceUsd: 65420.00,
    priceChange24h: 2.15,
    isBuiltInEuBlockchain: false,
    category: 'DeFi',
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    creatorAddress: '0x0000000000000000000000000000000000000000',
    createdAt: 1230940800000,
    txTag: '0x4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    status: 'active',
    description: 'Decentralized peer-to-peer digital currency and global reserve asset.',
    marketCapUsd: 1373820000000,
    volume24hUsd: 28450000000,
  },
  {
    id: 'tok-eth',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    totalSupply: 120420000,
    priceUsd: 2640.50,
    priceChange24h: 3.42,
    isBuiltInEuBlockchain: false,
    category: 'Layer2',
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    creatorAddress: '0x0000000000000000000000000000000000000000',
    createdAt: 1438214400000,
    txTag: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
    status: 'active',
    description: 'Global smart contract platform and decentralized computing standard.',
    marketCapUsd: 317908800000,
    volume24hUsd: 14200000000,
  },
  {
    id: 'tok-usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    totalSupply: 118000000000,
    priceUsd: 1.00,
    priceChange24h: 0.01,
    isBuiltInEuBlockchain: false,
    category: 'Utility',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    creatorAddress: '0x0000000000000000000000000000000000000000',
    createdAt: 1412553600000,
    txTag: '0x2f9393e1a84c20be1194fa82110cbb340192e409bca71142e9120934fab11030',
    status: 'active',
    description: 'Fiat-backed US Dollar stablecoin for instant global settlement.',
    marketCapUsd: 118000000000,
    volume24hUsd: 42100000000,
  },
];

// Initial real transactions for the explorer
export const INITIAL_TRANSACTIONS: EuTransaction[] = [
  {
    txTag: '0x3a4b92c01948fedcb9481234bcadef8821940901abcf8941029410fecca01248',
    method: 'SWAP',
    status: 'SUCCESS',
    from: '0xEU_Trader_4401',
    to: '0xEU_DEX_Router_V2',
    value: '500.00 USDT',
    gasFee: '0.00021 ETH',
    blockNumber: 18942120,
    timestamp: Date.now() - 3600000 * 2,
    nonce: 102,
    details: {
      amountIn: '500.00 USDT',
      amountOut: '0.1893 ETH',
      exchangeRate: '1 ETH = 2640.50 USDT',
      slippage: '0.1%',
      note: 'DEX Automated Market Maker Routing Pool',
    },
  },
];

export interface CentralCoinConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  circulatingSupply: number;
  priceUsd: number;
  priceChange24h: number;
  contractAddress: string;
  isLaunched: boolean;
  launchedAt?: number;
  baseFeeGwei: number;
  burnRatePercent: number; // % of fee burned permanently
  validatorRewardPercent: number; // % of fee to validators
  treasurySharePercent: number; // % of fee to ecosystem reserve
}

export interface LiquidityPair {
  id: string;
  tokenA: string; // e.g. 'EU'
  tokenB: string; // e.g. 'USDT'
  reserveA: number;
  reserveB: number;
  totalLiquidityUsd: number;
  volume24hUsd: number;
  feeTierPercent: number; // e.g. 0.30%
  lpTokenTotalSupply: number;
  createdAt: number;
  status: 'active' | 'paused';
}

export interface StakingPool {
  id: string;
  name: string;
  tokenSymbol: string;
  validatorAddress: string;
  totalStaked: number;
  aprPercent: number;
  lockupDays: number;
  totalDelegators: number;
  status: 'active' | 'full';
  userStakedAmount: number;
  rewardEarned: number;
}

export interface InvestmentTier {
  id: string;
  title: string;
  asset: string;
  minInvestment: number;
  maxInvestment: number;
  expectedApy: number;
  durationMonths: number;
  riskRating: 'Low' | 'Moderate' | 'High';
  totalInvested: number;
  investorCount: number;
}

export const INITIAL_CENTRAL_COIN: CentralCoinConfig = {
  name: '',
  symbol: '',
  decimals: 18,
  totalSupply: 1000000000,
  circulatingSupply: 0,
  priceUsd: 1.00,
  priceChange24h: 0.00,
  contractAddress: '',
  isLaunched: false,
  baseFeeGwei: 10.0,
  burnRatePercent: 10,
  validatorRewardPercent: 75,
  treasurySharePercent: 15,
};

export const INITIAL_LIQUIDITY_PAIRS: LiquidityPair[] = [
  {
    id: 'pair-btc-usdt',
    tokenA: 'BTC',
    tokenB: 'USDT',
    reserveA: 1520,
    reserveB: 99438400,
    totalLiquidityUsd: 198876800,
    volume24hUsd: 42100000,
    feeTierPercent: 0.05,
    lpTokenTotalSupply: 12294100,
    createdAt: Date.now() - 86400000 * 50,
    status: 'active',
  },
  {
    id: 'pair-eth-usdt',
    tokenA: 'ETH',
    tokenB: 'USDT',
    reserveA: 32000,
    reserveB: 84496000,
    totalLiquidityUsd: 168992000,
    volume24hUsd: 29500000,
    feeTierPercent: 0.05,
    lpTokenTotalSupply: 16442000,
    createdAt: Date.now() - 86400000 * 40,
    status: 'active',
  },
];

export const INITIAL_STAKING_POOLS: StakingPool[] = [
  {
    id: 'pool-eth-validator',
    name: 'Ethereum L1 Cross-Stake Mesh',
    tokenSymbol: 'ETH',
    validatorAddress: '0xEU_Eth_CrossMesh_Validator_08',
    totalStaked: 8500,
    aprPercent: 5.40,
    lockupDays: 0,
    totalDelegators: 1240,
    status: 'active',
    userStakedAmount: 0.5,
    rewardEarned: 0.024,
  },
  {
    id: 'pool-usdt-stable-30d',
    name: 'USDT Stable Validator Liquidity Mesh',
    tokenSymbol: 'USDT',
    validatorAddress: '0xEU_USDT_SettlementMesh_12',
    totalStaked: 18500000,
    aprPercent: 8.80,
    lockupDays: 30,
    totalDelegators: 2150,
    status: 'active',
    userStakedAmount: 1000,
    rewardEarned: 14.50,
  },
  {
    id: 'pool-btc-mesh',
    name: 'Bitcoin Sovereign Security Stake',
    tokenSymbol: 'BTC',
    validatorAddress: '0xEU_Validator_Sovereign_01',
    totalStaked: 450,
    aprPercent: 4.80,
    lockupDays: 90,
    totalDelegators: 980,
    status: 'active',
    userStakedAmount: 0,
    rewardEarned: 0,
  },
];

export const INITIAL_INVESTMENTS: InvestmentTier[] = [
  {
    id: 'inv-tier-1',
    title: 'Cross-Chain Global Reserve Fund',
    asset: 'USDT',
    minInvestment: 500,
    maxInvestment: 50000,
    expectedApy: 16.5,
    durationMonths: 6,
    riskRating: 'Low',
    totalInvested: 2450000,
    investorCount: 318,
  },
  {
    id: 'inv-tier-2',
    title: 'Cross-Chain DeFi Liquidity Arbitrage',
    asset: 'USDT',
    minInvestment: 1000,
    maxInvestment: 100000,
    expectedApy: 22.0,
    durationMonths: 12,
    riskRating: 'Moderate',
    totalInvested: 5820000,
    investorCount: 512,
  },
  {
    id: 'inv-tier-3',
    title: 'Ethereum Smart Settlement Vault',
    asset: 'ETH',
    minInvestment: 2,
    maxInvestment: 100,
    expectedApy: 24.0,
    durationMonths: 18,
    riskRating: 'High',
    totalInvested: 1850,
    investorCount: 420,
  },
];

export interface PersistedBlockchainData {
  userEuBalance: number;
  blockHeight: number;
  tokens: EuToken[];
  transactions: EuTransaction[];
  lastFaucetClaim?: number;
  centralCoin?: CentralCoinConfig;
  liquidityPairs?: LiquidityPair[];
  stakingPools?: StakingPool[];
  investments?: InvestmentTier[];
}

export function generateCryptoTag(): string {
  const chars = '0123456789abcdef';
  let tag = '0x';
  for (let i = 0; i < 64; i++) {
    tag += chars[Math.floor(Math.random() * chars.length)];
  }
  return tag;
}

export function generateContractAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0xEU';
  for (let i = 0; i < 38; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export function getBlockchainData(): PersistedBlockchainData {
  const fallback: PersistedBlockchainData = {
    userEuBalance: 500.0,
    blockHeight: 18942150,
    tokens: INITIAL_TOKENS,
    transactions: INITIAL_TRANSACTIONS,
    centralCoin: INITIAL_CENTRAL_COIN,
    liquidityPairs: INITIAL_LIQUIDITY_PAIRS,
    stakingPools: INITIAL_STAKING_POOLS,
    investments: INITIAL_INVESTMENTS,
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    
    // Purge mock tokens and the old default 'EU Central Core Coin' from storage
    const rawTokens: EuToken[] = Array.isArray(parsed.tokens) ? parsed.tokens : INITIAL_TOKENS;
    const cleanedTokens: EuToken[] = rawTokens
      .filter((t) => {
        if (!t || !t.symbol) return false;
        if (['EUTAP', 'CYBER', 'VAULT', 'SHIELD'].includes(t.symbol)) return false;
        // Purge old default EU central core coin
        if (t.symbol === 'EU' || t.name === 'EU Central Core Coin' || t.id === 'tok-eu') return false;
        return true;
      })
      .map((t) => ({
        ...t,
        priceUsd: typeof t.priceUsd === 'number' ? t.priceUsd : (t.symbol === 'BTC' ? 65420 : t.symbol === 'ETH' ? 2640.5 : t.symbol === 'USDT' ? 1.0 : 1.0),
        priceChange24h: typeof t.priceChange24h === 'number' ? t.priceChange24h : 0.0,
        isBuiltInEuBlockchain: t.isBuiltInEuBlockchain !== undefined ? t.isBuiltInEuBlockchain : !['BTC', 'ETH', 'USDT'].includes(t.symbol),
        status: t.status || 'active',
      }));

    // Ensure all standard global tokens (BTC, ETH, USDT) exist
    for (const baseTok of INITIAL_TOKENS) {
      if (!cleanedTokens.some((t) => t.symbol === baseTok.symbol)) {
        cleanedTokens.push(baseTok);
      }
    }

    // Check if admin has launched a custom central coin (not the deleted EU central core coin)
    const isOldCentralCore = parsed.centralCoin && (parsed.centralCoin.name === 'EU Central Core Coin' || (parsed.centralCoin.symbol === 'EU' && !parsed.centralCoin.isCustomAdminDeployed));
    const validCentralCoin: CentralCoinConfig = (parsed.centralCoin && parsed.centralCoin.isLaunched && !isOldCentralCore && parsed.centralCoin.symbol)
      ? parsed.centralCoin
      : INITIAL_CENTRAL_COIN;

    // If admin launched a custom home coin, make sure it is in tokens
    if (validCentralCoin.isLaunched && validCentralCoin.symbol) {
      if (!cleanedTokens.some((t) => t.symbol === validCentralCoin.symbol)) {
        cleanedTokens.push({
          id: `tok-central-${validCentralCoin.symbol.toLowerCase()}`,
          name: validCentralCoin.name,
          symbol: validCentralCoin.symbol,
          decimals: validCentralCoin.decimals || 18,
          totalSupply: validCentralCoin.totalSupply,
          priceUsd: validCentralCoin.priceUsd,
          priceChange24h: validCentralCoin.priceChange24h || 0.0,
          isBuiltInEuBlockchain: true,
          category: 'Governance',
          contractAddress: validCentralCoin.contractAddress,
          creatorAddress: '0xEU_Master_Admin_001',
          createdAt: validCentralCoin.launchedAt || Date.now(),
          txTag: '0xgenesis_home_coin_' + validCentralCoin.symbol.toLowerCase(),
          status: 'active',
          description: `Platform Home Trading Economy and native fee currency.`,
          marketCapUsd: validCentralCoin.totalSupply * validCentralCoin.priceUsd,
          volume24hUsd: 0,
        });
      }
    }

    // Clean liquidity pairs (remove any old pair referencing EU)
    const rawPairs = Array.isArray(parsed.liquidityPairs) ? parsed.liquidityPairs : INITIAL_LIQUIDITY_PAIRS;
    const cleanedPairs = rawPairs.filter((p: LiquidityPair) => p && p.tokenA !== 'EU' && p.tokenB !== 'EU');

    return {
      userEuBalance: typeof parsed.userEuBalance === 'number' ? parsed.userEuBalance : 500.0,
      blockHeight: typeof parsed.blockHeight === 'number' ? parsed.blockHeight : 18942150,
      tokens: cleanedTokens,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions.filter((tx: EuTransaction) => tx.details?.tokenName !== 'EU Central Core Coin') : INITIAL_TRANSACTIONS,
      lastFaucetClaim: parsed.lastFaucetClaim,
      centralCoin: validCentralCoin,
      liquidityPairs: cleanedPairs.length > 0 ? cleanedPairs : INITIAL_LIQUIDITY_PAIRS,
      stakingPools: Array.isArray(parsed.stakingPools) && parsed.stakingPools.length > 0 ? parsed.stakingPools : INITIAL_STAKING_POOLS,
      investments: Array.isArray(parsed.investments) && parsed.investments.length > 0 ? parsed.investments : INITIAL_INVESTMENTS,
    };
  } catch {
    return fallback;
  }
}

export function saveBlockchainData(data: PersistedBlockchainData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save blockchain data', err);
  }
}
