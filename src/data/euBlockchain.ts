export interface EuBlock {
  blockNumber: number;
  timestamp: number;
  validator: string;
  txCount: number;
  gasUsed: number;
  gasLimit: number;
  hash: string;
}

export interface EuToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  category: 'DeFi' | 'Gaming' | 'Utility' | 'Governance' | 'Meme' | 'Layer2';
  contractAddress: string;
  creatorAddress: string;
  createdAt: number;
  txTag: string; // The creation transaction tag
  status: 'active' | 'deleted';
  description?: string;
}

export type EuTxMethod =
  | 'TOKEN_CREATE'
  | 'TOKEN_DELETE'
  | 'SWAP'
  | 'BUY'
  | 'SELL'
  | 'COIN_MINT'
  | 'GAS_CLAIM';

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
  homeCoinSymbol: string;
  homeCoinName: string;
  homeCoinPriceUsd: number;
  blockHeight: number;
  blockTimeSec: number;
  tps: number;
  gasPriceGwei: number;
  activeValidators: number;
  totalTransactions: number;
  totalMarketCapUsd: number;
  stakedRatioPercent: number;
}

const STORAGE_KEY = 'euscan_blockchain_v1';

// Initial pre-deployed ecosystem tokens
export const INITIAL_TOKENS: EuToken[] = [
  {
    id: 'tok-eutap',
    name: 'EUTAP Protocol',
    symbol: 'EUTAP',
    decimals: 18,
    totalSupply: 500000000,
    category: 'Gaming',
    contractAddress: '0xEU7771a9381c818820f8c37d042bb128f9c1042b',
    creatorAddress: '0xEU_Genesis_Deployer_001',
    createdAt: Date.now() - 86400000 * 45,
    txTag: '0x8f2d93e1a84c20be1194fa82110cbb340192e409bca71142e9120934fab11029',
    status: 'active',
    description: 'Core tap-to-earn utility gas token for the EU ecosystem.',
  },
  {
    id: 'tok-cyber',
    name: 'Cyber Matrix Alpha',
    symbol: 'CYBER',
    decimals: 18,
    totalSupply: 21000000,
    category: 'DeFi',
    contractAddress: '0xEU3910c81bf9129034afde66723b72898711823a',
    creatorAddress: '0xEU_Core_Foundry_004',
    createdAt: Date.now() - 86400000 * 30,
    txTag: '0x3a4b92c01948fedcb9481234bcadef8821940901abcf8941029410fecca01248',
    status: 'active',
    description: 'High-throughput algorithmic liquidity token on EU Blockchain.',
  },
  {
    id: 'tok-vault',
    name: 'Reserve Staking Vault',
    symbol: 'VAULT',
    decimals: 18,
    totalSupply: 100000000,
    category: 'Utility',
    contractAddress: '0xEU891823746feabcde9012345566778899aabbcc',
    creatorAddress: '0xEU_Reserve_Treasury_009',
    createdAt: Date.now() - 86400000 * 20,
    txTag: '0x7b19a04cd821389fe94038104baeddcf019384910248abefcd89401948ab1104',
    status: 'active',
    description: 'Collateralized reserve vault staking asset.',
  },
  {
    id: 'tok-shield',
    name: 'Sentinel Proof Governance',
    symbol: 'SHIELD',
    decimals: 18,
    totalSupply: 10000000,
    category: 'Governance',
    contractAddress: '0xEU55883210abefc9103847291048bce910482019',
    creatorAddress: '0xEU_Validator_Council_002',
    createdAt: Date.now() - 86400000 * 10,
    txTag: '0x629f104810bce9048102384910248bcd102948103847abef102934810238f901',
    status: 'active',
    description: 'Validator consensus security and governance voting token.',
  },
];

// Initial pre-recorded blockchain transactions for realistic scan explorer
export const INITIAL_TRANSACTIONS: EuTransaction[] = [
  {
    txTag: '0x8f2d93e1a84c20be1194fa82110cbb340192e409bca71142e9120934fab11029',
    method: 'TOKEN_CREATE',
    status: 'SUCCESS',
    from: '0xEU_Genesis_Deployer_001',
    to: '0xEU7771a9381c818820f8c37d042bb128f9c1042b',
    value: '0 EU',
    gasFee: '0.00084 EU',
    blockNumber: 18941980,
    timestamp: Date.now() - 86400000 * 45,
    nonce: 101,
    details: {
      tokenName: 'EUTAP Protocol',
      tokenSymbol: 'EUTAP',
      tokenContract: '0xEU7771a9381c818820f8c37d042bb128f9c1042b',
      amountIn: '500,000,000 Initial Supply',
      note: 'Genesis Deployment on EU Blockchain Network',
    },
  },
  {
    txTag: '0x3a4b92c01948fedcb9481234bcadef8821940901abcf8941029410fecca01248',
    method: 'TOKEN_CREATE',
    status: 'SUCCESS',
    from: '0xEU_Core_Foundry_004',
    to: '0xEU3910c81bf9129034afde66723b72898711823a',
    value: '0 EU',
    gasFee: '0.00072 EU',
    blockNumber: 18942010,
    timestamp: Date.now() - 86400000 * 30,
    nonce: 102,
    details: {
      tokenName: 'Cyber Matrix Alpha',
      tokenSymbol: 'CYBER',
      tokenContract: '0xEU3910c81bf9129034afde66723b72898711823a',
      amountIn: '21,000,000 Initial Supply',
      note: 'DeFi automated liquidity foundry deployment',
    },
  },
  {
    txTag: '0x99281a04bfe102948cde9048102384910248abefcd89401948ab1104fe019248',
    method: 'SWAP',
    status: 'SUCCESS',
    from: '0xEU_Trader_4401',
    to: '0xEU_DEX_Router_V2',
    value: '25.00 EU',
    gasFee: '0.00031 EU',
    blockNumber: 18942120,
    timestamp: Date.now() - 3600000 * 2,
    nonce: 108,
    details: {
      amountIn: '25.00 EU',
      amountOut: '375.50 EUTAP',
      exchangeRate: '1 EU = 15.02 EUTAP',
      slippage: '0.5%',
      note: 'DEX Automated Market Maker Routing Pool',
    },
  },
];

export interface PersistedBlockchainData {
  userEuBalance: number;
  blockHeight: number;
  tokens: EuToken[];
  transactions: EuTransaction[];
  lastFaucetClaim?: number;
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
  if (typeof window === 'undefined') {
    return {
      userEuBalance: 500.0,
      blockHeight: 18942150,
      tokens: INITIAL_TOKENS,
      transactions: INITIAL_TRANSACTIONS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: PersistedBlockchainData = {
        userEuBalance: 500.0, // Initial 500 Home Coin ($EU) balance for testing & interacting
        blockHeight: 18942150,
        tokens: INITIAL_TOKENS,
        transactions: INITIAL_TRANSACTIONS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      userEuBalance: typeof parsed.userEuBalance === 'number' ? parsed.userEuBalance : 500.0,
      blockHeight: typeof parsed.blockHeight === 'number' ? parsed.blockHeight : 18942150,
      tokens: Array.isArray(parsed.tokens) ? parsed.tokens : INITIAL_TOKENS,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_TRANSACTIONS,
      lastFaucetClaim: parsed.lastFaucetClaim,
    };
  } catch {
    return {
      userEuBalance: 500.0,
      blockHeight: 18942150,
      tokens: INITIAL_TOKENS,
      transactions: INITIAL_TRANSACTIONS,
    };
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
