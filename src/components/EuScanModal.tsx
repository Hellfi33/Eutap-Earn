import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Cpu,
  Layers,
  Coins,
  ArrowRightLeft,
  CheckCircle2,
  Copy,
  Check,
  Trash2,
  PlusCircle,
  ShieldCheck,
  ExternalLink,
  Flame,
  Activity,
  Server,
  Zap,
  DollarSign,
  AlertTriangle,
  RotateCw,
  Clock,
  Code2,
} from 'lucide-react';
import {
  EuToken,
  EuTransaction,
  EuTxMethod,
  getBlockchainData,
  saveBlockchainData,
  generateCryptoTag,
  generateContractAddress,
  INITIAL_TOKENS,
} from '../data/euBlockchain';
import { soundFx } from '../utils/audio';

interface EuScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance?: number;
  playerCoins?: number;
}

type TabType = 'explorer' | 'home_coin' | 'tokens' | 'exchange' | 'verifier';

export const EuScanModal: React.FC<EuScanModalProps> = ({
  isOpen,
  onClose,
  reserveBalance = 0,
  playerCoins = 0,
}) => {
  // Blockchain Local State
  const [data, setData] = useState(() => getBlockchainData());
  const [activeTab, setActiveTab] = useState<TabType>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<EuTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Token Creation Form State
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenSupply, setNewTokenSupply] = useState('10000000');
  const [newTokenCategory, setNewTokenCategory] = useState<EuToken['category']>('DeFi');
  const [tokenCreationSuccess, setTokenCreationSuccess] = useState<{
    token: EuToken;
    txTag: string;
  } | null>(null);

  // Token Deletion Confirmation
  const [tokenToDelete, setTokenToDelete] = useState<EuToken | null>(null);

  // Exchange State
  const [exchangeMode, setExchangeMode] = useState<'swap' | 'buy' | 'sell'>('swap');
  const [fromAsset, setFromAsset] = useState('EU');
  const [toAsset, setToAsset] = useState('EUTAP');
  const [exchangeAmount, setExchangeAmount] = useState('10');
  const [exchangeSuccessTx, setExchangeSuccessTx] = useState<EuTransaction | null>(null);

  // Tag Verifier Direct Search
  const [verifierTagInput, setVerifierTagInput] = useState('');
  const [verifierResult, setVerifierResult] = useState<EuTransaction | null>(null);
  const [verifierSearched, setVerifierSearched] = useState(false);

  // Faucet claim status
  const [faucetClaimed, setFaucetClaimed] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filtered transactions for explorer
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data.transactions;
    return data.transactions.filter(
      (tx) =>
        tx.txTag.toLowerCase().includes(q) ||
        tx.from.toLowerCase().includes(q) ||
        tx.to.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.details.tokenSymbol?.toLowerCase().includes(q) ||
        tx.details.tokenName?.toLowerCase().includes(q) ||
        tx.blockNumber.toString().includes(q)
    );
  }, [data.transactions, searchQuery]);

  // Active tokens list (non-deleted)
  const activeTokens = useMemo(() => {
    return data.tokens.filter((t) => t.status === 'active');
  }, [data.tokens]);

  // Handle Token Creation
  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim() || !newTokenSymbol.trim()) return;

    soundFx.playClick();

    const cleanSymbol = newTokenSymbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const supplyNum = parseFloat(newTokenSupply) || 1000000;
    const contractAddr = generateContractAddress();
    const creationTxTag = generateCryptoTag();
    const currentBlock = data.blockHeight + 1;

    const newToken: EuToken = {
      id: `tok-${Date.now()}-${cleanSymbol.toLowerCase()}`,
      name: newTokenName.trim(),
      symbol: cleanSymbol,
      decimals: 18,
      totalSupply: supplyNum,
      category: newTokenCategory,
      contractAddress: contractAddr,
      creatorAddress: '0xEU_Player_Controller_Self',
      createdAt: Date.now(),
      txTag: creationTxTag,
      status: 'active',
      description: `Custom token project deployed on EU Blockchain.`,
    };

    const newTx: EuTransaction = {
      txTag: creationTxTag,
      method: 'TOKEN_CREATE',
      status: 'SUCCESS',
      from: '0xEU_Player_Controller_Self',
      to: contractAddr,
      value: '0 EU',
      gasFee: '0.00125 EU',
      blockNumber: currentBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        tokenName: newToken.name,
        tokenSymbol: newToken.symbol,
        tokenContract: contractAddr,
        amountIn: `${supplyNum.toLocaleString()} Initial Supply`,
        note: `Smart Contract Deployment (${newTokenCategory} Standard)`,
      },
    };

    const nextData = {
      ...data,
      userEuBalance: Math.max(0, data.userEuBalance - 0.00125),
      blockHeight: currentBlock,
      tokens: [newToken, ...data.tokens],
      transactions: [newTx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();

    setTokenCreationSuccess({ token: newToken, txTag: creationTxTag });
    setNewTokenName('');
    setNewTokenSymbol('');
    setNewTokenSupply('10000000');
  };

  // Handle Token Deletion
  const handleConfirmDeleteToken = () => {
    if (!tokenToDelete) return;
    soundFx.playClick();

    const deletionTxTag = generateCryptoTag();
    const currentBlock = data.blockHeight + 1;

    const deletionTx: EuTransaction = {
      txTag: deletionTxTag,
      method: 'TOKEN_DELETE',
      status: 'SUCCESS',
      from: '0xEU_Player_Controller_Self',
      to: tokenToDelete.contractAddress,
      value: '0 EU',
      gasFee: '0.00095 EU',
      blockNumber: currentBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        tokenName: tokenToDelete.name,
        tokenSymbol: tokenToDelete.symbol,
        tokenContract: tokenToDelete.contractAddress,
        note: `Contract permanently revoked and destroyed on EU Chain.`,
      },
    };

    // Remove or mark status deleted
    const updatedTokens = data.tokens.filter((t) => t.id !== tokenToDelete.id);
    const nextData = {
      ...data,
      blockHeight: currentBlock,
      tokens: updatedTokens,
      transactions: [deletionTx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setTokenToDelete(null);
  };

  // Handle Exchange Execution (Swap, Buy, Sell)
  const handleExecuteExchange = () => {
    const amt = parseFloat(exchangeAmount) || 0;
    if (amt <= 0) return;

    soundFx.playClick();

    const currentBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();
    let method: EuTxMethod = 'SWAP';
    let details: EuTransaction['details'] = {};
    let newBalance = data.userEuBalance;

    if (exchangeMode === 'swap') {
      method = 'SWAP';
      const rate = fromAsset === 'EU' ? 15.5 : 0.0645;
      const outAmt = (amt * rate).toFixed(2);
      details = {
        amountIn: `${amt.toFixed(2)} ${fromAsset}`,
        amountOut: `${outAmt} ${toAsset}`,
        exchangeRate: `1 ${fromAsset} = ${rate} ${toAsset}`,
        slippage: '0.5%',
        note: 'EU Automated Liquidity Pool AMM Route',
      };
      if (fromAsset === 'EU') {
        newBalance = Math.max(0, newBalance - amt);
      } else if (toAsset === 'EU') {
        newBalance += parseFloat(outAmt);
      }
    } else if (exchangeMode === 'buy') {
      method = 'BUY';
      const purchasedAmt = (amt * 12.8).toFixed(2);
      details = {
        amountIn: `${amt.toFixed(2)} EU`,
        amountOut: `${purchasedAmt} ${toAsset}`,
        exchangeRate: `1 EU = 12.8 ${toAsset}`,
        note: `Direct On-Chain Market Buy Order`,
      };
      newBalance = Math.max(0, newBalance - amt);
    } else {
      method = 'SELL';
      const receivedEu = (amt * 0.075).toFixed(2);
      details = {
        amountIn: `${amt.toFixed(2)} ${fromAsset}`,
        amountOut: `${receivedEu} EU`,
        exchangeRate: `1 ${fromAsset} = 0.075 EU`,
        note: `On-Chain Market Liquidation Order`,
      };
      newBalance += parseFloat(receivedEu);
    }

    const tx: EuTransaction = {
      txTag,
      method,
      status: 'SUCCESS',
      from: '0xEU_Player_Trader_Self',
      to: '0xEU_DEX_Settlement_Router_v2',
      value: `${amt.toFixed(2)} ${fromAsset}`,
      gasFee: '0.00045 EU',
      blockNumber: currentBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details,
    };

    const nextData = {
      ...data,
      userEuBalance: newBalance,
      blockHeight: currentBlock,
      transactions: [tx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setExchangeSuccessTx(tx);
  };

  // Tag Verifier Search
  const handleVerifyTagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = verifierTagInput.trim().toLowerCase();
    if (!tag) return;

    soundFx.playClick();
    setVerifierSearched(true);
    const found = data.transactions.find(
      (tx) => tx.txTag.toLowerCase() === tag || tx.txTag.toLowerCase().includes(tag)
    );
    setVerifierResult(found || null);
  };

  // Faucet Claim
  const handleClaimFaucet = () => {
    soundFx.playClick();
    const mintTag = generateCryptoTag();
    const currentBlock = data.blockHeight + 1;

    const faucetTx: EuTransaction = {
      txTag: mintTag,
      method: 'COIN_MINT',
      status: 'SUCCESS',
      from: '0xEU_Genesis_Faucet_Contract',
      to: '0xEU_Player_Controller_Self',
      value: '100.00 EU',
      gasFee: '0.00000 EU',
      blockNumber: currentBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        amountOut: '100.00 EU',
        note: 'Genesis Developer Test Faucet Distribution',
      },
    };

    const nextData = {
      ...data,
      userEuBalance: data.userEuBalance + 100,
      blockHeight: currentBlock,
      transactions: [faucetTx, ...data.transactions],
      lastFaucetClaim: Date.now(),
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setFaucetClaimed(true);
    setTimeout(() => setFaucetClaimed(false), 3000);
  };

  const getMethodBadge = (method: EuTxMethod) => {
    switch (method) {
      case 'TOKEN_CREATE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'TOKEN_DELETE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'SWAP':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'BUY':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'SELL':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'COIN_MINT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 font-sans select-none">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#070b14] border-2 border-indigo-500/60 shadow-[0_0_80px_rgba(99,102,241,0.3)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header - EuScan & EU Blockchain Identity */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-black border-b border-indigo-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-wider font-['Rajdhani',sans-serif]">
                  EuScan <span className="text-indigo-400">EXPLORER</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MAINNET #7771
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-indigo-500/20 text-[9px] font-mono text-indigo-300">
                  PoS MESH
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                Decentralized Home Coin & Smart Contract Protocol Architecture
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            aria-label="Close EuScan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Network Telemetry Bar */}
        <div className="bg-black/60 border-b border-white/5 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap gap-4 shrink-0 scrollbar-none">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Block:</span>
            <span className="text-indigo-300 font-bold">#{data.blockHeight.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Home Coin ($EU):</span>
            <span className="text-emerald-400 font-bold">$1.85 USD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Gas:</span>
            <span className="text-amber-400 font-bold">12 Gwei (0.0004 EU)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">TPS:</span>
            <span className="text-cyan-400 font-bold">1,450 tx/s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Your $EU:</span>
            <span className="text-white font-bold">{data.userEuBalance.toFixed(2)} EU</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#090e18] border-b border-white/10 px-2 sm:px-4 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('explorer');
            }}
            className={`py-2.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'explorer'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>EuScan Explorer</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('home_coin');
            }}
            className={`py-2.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'home_coin'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Home Coin ($EU)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('tokens');
            }}
            className={`py-2.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'tokens'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Token Projects ({activeTokens.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('exchange');
            }}
            className={`py-2.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'exchange'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Exchange Engine</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('verifier');
            }}
            className={`py-2.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'verifier'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tag Verifier</span>
          </button>
        </div>

        {/* Tab Content Area (Scrollable & Viewport Optimized) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-[#070b14]">
          {/* TAB 1: EUSCAN EXPLORER */}
          {activeTab === 'explorer' && (
            <div className="space-y-4">
              {/* Explorer Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Transaction Tag (0x...), Contract Address (0xEU...), or Block #..."
                  className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-indigo-400 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Transactions Stream Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    Live Verified Blockchain Transactions ({filteredTransactions.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Real-time ledger</span>
              </div>

              {/* Transaction List */}
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-black/40 border border-white/5 text-slate-500 text-xs">
                    No transactions matched your search query.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.txTag}
                      className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-indigo-500/40 transition space-y-2 group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodBadge(
                              tx.method
                            )}`}
                          >
                            {tx.method}
                          </span>
                          <span className="text-emerald-400 font-bold text-[10px] font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {tx.status}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">
                            Block #{tx.blockNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(tx.txTag, tx.txTag)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 cursor-pointer"
                            title="Copy Transaction Tag"
                          >
                            <span>{tx.txTag.slice(0, 10)}...{tx.txTag.slice(-6)}</span>
                            {copiedHash === tx.txTag ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedTx(tx);
                            }}
                            className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold font-mono transition cursor-pointer"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>

                      {/* Transaction Summary Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-mono text-slate-300 pt-1 border-t border-white/5">
                        <div className="truncate">
                          <span className="text-slate-500">From: </span>
                          <span className="text-slate-300">{tx.from}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">To: </span>
                          <span className="text-slate-300">{tx.to}</span>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="text-slate-500">Gas: </span>
                          <span className="text-amber-400">{tx.gasFee}</span>
                        </div>
                      </div>

                      {tx.details && (
                        <div className="text-[10px] text-slate-400 bg-white/[0.02] p-1.5 rounded flex items-center justify-between">
                          <span>{tx.details.note || tx.details.amountIn || 'Execution Verified'}</span>
                          {tx.details.tokenSymbol && (
                            <span className="text-indigo-300 font-bold">${tx.details.tokenSymbol}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HOME COIN & BLOCKCHAIN ARCHITECTURE */}
          {activeTab === 'home_coin' && (
            <div className="space-y-4">
              {/* Home Coin Header Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-black border border-indigo-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-indigo-300">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white font-['Rajdhani',sans-serif]">
                          EU COIN (Home Coin)
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                          $EU NATIVE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Native settlement, validator staking, and smart contract gas token.
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Your Available Balance
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-['Rajdhani',sans-serif]">
                      {data.userEuBalance.toFixed(2)} EU
                    </span>
                  </div>
                </div>

                {/* Developer / Player Test Faucet */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-300">
                    Need test Home Coins for deploying tokens or processing exchanges?
                  </span>
                  <button
                    onClick={handleClaimFaucet}
                    disabled={faucetClaimed}
                    className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{faucetClaimed ? '✓ Claimed +100 EU' : 'Claim 100 Test EU (Faucet)'}</span>
                  </button>
                </div>
              </div>

              {/* Network Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-slate-500 text-[10px]">TOTAL SUPPLY</span>
                  <div className="text-sm font-bold text-white">1,000,000,000 EU</div>
                  <span className="text-[9px] text-slate-400">Fixed Genesis Cap</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-slate-500 text-[10px]">CIRCULATING</span>
                  <div className="text-sm font-bold text-indigo-300">342,190,450 EU</div>
                  <span className="text-[9px] text-emerald-400">34.2% in Circulation</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-slate-500 text-[10px]">STAKED NODES</span>
                  <div className="text-sm font-bold text-amber-400">485,210,000 EU</div>
                  <span className="text-[9px] text-amber-300">48.5% Security Stake</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-slate-500 text-[10px]">TOTAL BURNED</span>
                  <div className="text-sm font-bold text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>12,599,550 EU</span>
                  </div>
                  <span className="text-[9px] text-rose-300">EIP-1559 Burn Engine</span>
                </div>
              </div>

              {/* Architecture Details */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif] flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span>EU Blockchain Virtual Machine (EVM Core)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                  <div className="space-y-1 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-indigo-300 block">PoS Consensus Engine</span>
                    <p className="text-slate-400">
                      Operates 64 distributed validator nodes with 1.2-second finality. Zero
                      downtime guarantee with cryptographic state proofs.
                    </p>
                  </div>
                  <div className="space-y-1 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-indigo-300 block">Token Factory Standard (EUP-20)</span>
                    <p className="text-slate-400">
                      Complete support for custom token creation, automated liquidity pools, token
                      revocation, and cross-contract calling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TOKEN PROJECTS (CREATION & DELETION) */}
          {activeTab === 'tokens' && (
            <div className="space-y-5">
              {/* Token Creation Form Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-black via-slate-950 to-black border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif]">
                      Deploy New Token Project (EU Blockchain)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Gas: 0.00125 EU</span>
                </div>

                <form onSubmit={handleCreateToken} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Token Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder="e.g. Quantum Yield"
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-indigo-400 text-white text-xs font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Symbol (Ticker)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={newTokenSymbol}
                        onChange={(e) => setNewTokenSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g. QNT"
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-indigo-400 text-white text-xs font-mono outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        Initial Supply
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newTokenSupply}
                        onChange={(e) => setNewTokenSupply(e.target.value)}
                        placeholder="10000000"
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-indigo-400 text-white text-xs font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-slate-400 text-[10px]">Category:</span>
                      {(['DeFi', 'Gaming', 'Utility', 'Governance', 'Meme'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setNewTokenCategory(cat);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                            newTokenCategory === cat
                              ? 'bg-indigo-500 text-white font-bold'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Deploy Smart Contract</span>
                    </button>
                  </div>
                </form>

                {/* Instant Creation Confirmation Notification */}
                {tokenCreationSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 text-xs animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Token Project Successfully Deployed on EU Blockchain!
                      </span>
                      <button
                        onClick={() => setTokenCreationSuccess(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                      <div>
                        Contract Address:{' '}
                        <span className="text-indigo-300 font-bold">
                          {tokenCreationSuccess.token.contractAddress}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          Tx Tag:{' '}
                          <span className="text-emerald-400">
                            {tokenCreationSuccess.txTag.slice(0, 16)}...
                          </span>
                        </span>
                        <button
                          onClick={() => {
                            setVerifierTagInput(tokenCreationSuccess.txTag);
                            setActiveTab('verifier');
                          }}
                          className="text-indigo-400 hover:underline font-bold"
                        >
                          Verify in EuScan →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Token Projects List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    Deployed Token Projects on Chain ({activeTokens.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">EUP-20 Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeTokens.map((tok) => (
                    <div
                      key={tok.id}
                      className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2.5 flex flex-col justify-between hover:border-indigo-500/40 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">{tok.name}</span>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold">
                                ${tok.symbol}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Category: {tok.category} • Decimals: {tok.decimals}
                            </span>
                          </div>

                          {/* Delete Token Project Button */}
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setTokenToDelete(tok);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Delete / Revoke Token Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Contract Address and Supply */}
                        <div className="mt-2 space-y-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Total Supply:</span>
                            <span className="text-white font-bold">
                              {tok.totalSupply.toLocaleString()} {tok.symbol}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>Contract:</span>
                            <button
                              onClick={() => copyToClipboard(tok.contractAddress, tok.id)}
                              className="text-indigo-300 hover:underline flex items-center gap-1"
                              title="Copy Contract Address"
                            >
                              <span>
                                {tok.contractAddress.slice(0, 10)}...{tok.contractAddress.slice(-4)}
                              </span>
                              {copiedHash === tok.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* View creation tag link */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500">Genesis Tag:</span>
                        <button
                          onClick={() => {
                            setVerifierTagInput(tok.txTag);
                            setActiveTab('verifier');
                          }}
                          className="text-emerald-400 hover:underline"
                        >
                          {tok.txTag.slice(0, 12)}...
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXCHANGE PROCESSING ENGINE (SWAP, BUY, SELL) */}
          {activeTab === 'exchange' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-black via-slate-950 to-black border border-indigo-500/40 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif] flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                    <span>EU Crypto Exchange & Settlement Engine</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Processes on-chain crypto exchanges: Swap, Buy, and Sell. Generates verifiable
                    transaction tags on EuScan.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-black/60 rounded-xl border border-white/10 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setExchangeMode('swap');
                    }}
                    className={`py-2 rounded-lg font-bold transition cursor-pointer ${
                      exchangeMode === 'swap'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Swap
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setExchangeMode('buy');
                    }}
                    className={`py-2 rounded-lg font-bold transition cursor-pointer ${
                      exchangeMode === 'buy'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setExchangeMode('sell');
                    }}
                    className={`py-2 rounded-lg font-bold transition cursor-pointer ${
                      exchangeMode === 'sell'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Inputs */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        {exchangeMode === 'buy' ? 'Pay Currency' : 'From Asset'}
                      </label>
                      <select
                        value={fromAsset}
                        onChange={(e) => setFromAsset(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono outline-none"
                      >
                        <option value="EU">EU (Home Coin)</option>
                        <option value="EUTAP">EUTAP</option>
                        <option value="USDT">USDT</option>
                        {activeTokens
                          .filter((t) => t.symbol !== 'EUTAP')
                          .map((t) => (
                            <option key={t.symbol} value={t.symbol}>
                              {t.symbol} ({t.name})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        {exchangeMode === 'sell' ? 'Receive Asset' : 'To Asset'}
                      </label>
                      <select
                        value={toAsset}
                        onChange={(e) => setToAsset(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono outline-none"
                      >
                        <option value="EUTAP">EUTAP</option>
                        <option value="EU">EU (Home Coin)</option>
                        <option value="CYBER">CYBER</option>
                        <option value="VAULT">VAULT</option>
                        {activeTokens
                          .filter((t) => !['EUTAP', 'CYBER', 'VAULT'].includes(t.symbol))
                          .map((t) => (
                            <option key={t.symbol} value={t.symbol}>
                              {t.symbol} ({t.name})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">
                      Amount to {exchangeMode.toUpperCase()}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        min={0.1}
                        step={0.1}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-indigo-400 text-white text-sm font-mono outline-none font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-indigo-300 font-bold">
                        {fromAsset}
                      </span>
                    </div>
                  </div>

                  {/* Execution Specs Preview */}
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] font-mono space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Network Gas Fee:</span>
                      <span className="text-amber-400">0.00045 EU</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Routing Engine:</span>
                      <span className="text-indigo-300">EU Router v2.4 (Uniswap-V2 EVM Equiv)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slippage Guarantee:</span>
                      <span className="text-emerald-400">0.5% Auto-Guard</span>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteExchange}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 hover:opacity-95 text-black font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      Execute On-Chain {exchangeMode.toUpperCase()} & Generate Tx Tag
                    </span>
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Instant Success Receipt */}
                {exchangeSuccessTx && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Exchange Dispatched & Confirmed on Blockchain!
                      </span>
                      <button
                        onClick={() => setExchangeSuccessTx(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2 rounded bg-black/50 font-mono text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transaction Tag:</span>
                        <button
                          onClick={() =>
                            copyToClipboard(exchangeSuccessTx.txTag, exchangeSuccessTx.txTag)
                          }
                          className="text-indigo-300 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>
                            {exchangeSuccessTx.txTag.slice(0, 14)}...
                            {exchangeSuccessTx.txTag.slice(-6)}
                          </span>
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Action:</span>
                        <span className="text-white font-bold">{exchangeSuccessTx.details.amountIn} → {exchangeSuccessTx.details.amountOut}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setVerifierTagInput(exchangeSuccessTx.txTag);
                        setActiveTab('verifier');
                      }}
                      className="w-full py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold font-mono text-[11px] transition text-center cursor-pointer"
                    >
                      Verify Full Receipt in EuScan Explorer →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TAG VERIFIER QUICK-LOOKUP */}
          {activeTab === 'verifier' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Cryptographic Transaction Tag Verifier</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Paste any Transaction Tag (generated from token creation, token deletion, swap,
                    buy, or sell) to verify on-chain status and proofs.
                  </p>
                </div>

                <form onSubmit={handleVerifyTagSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={verifierTagInput}
                    onChange={(e) => setVerifierTagInput(e.target.value)}
                    placeholder="Enter Transaction Tag (e.g. 0x8f2d93e1a84c...)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 focus:border-indigo-400 text-white text-xs font-mono outline-none"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs font-mono transition cursor-pointer"
                  >
                    Verify Tag
                  </button>
                </form>

                {/* Verification Result Output */}
                {verifierSearched && !verifierResult && (
                  <div className="p-4 text-center rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                    No matching blockchain transaction found for this tag. Please check characters.
                  </div>
                )}

                {verifierResult && (
                  <div className="p-4 rounded-xl bg-[#090e1a] border border-emerald-500/40 space-y-3 text-xs font-mono animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="font-bold text-white text-sm">
                            TRANSACTION VERIFIED (BLOCK #{verifierResult.blockNumber})
                          </span>
                          <span className="text-[10px] text-emerald-400 block">
                            Cryptographic Proof Validated by 64/64 Nodes
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(
                          verifierResult.method
                        )}`}
                      >
                        {verifierResult.method}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Transaction Tag:</span>
                        <button
                          onClick={() => copyToClipboard(verifierResult.txTag, 'verif-tag')}
                          className="text-slate-200 font-mono flex items-center gap-1 hover:underline"
                        >
                          <span className="truncate max-w-[200px] sm:max-w-xs">{verifierResult.txTag}</span>
                          {copiedHash === 'verif-tag' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>Block Height:</span>
                        <span className="text-indigo-300 font-bold">
                          #{verifierResult.blockNumber.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>Timestamp:</span>
                        <span className="text-slate-200">
                          {new Date(verifierResult.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>From (Sender):</span>
                        <span className="text-slate-200 truncate max-w-[220px]">
                          {verifierResult.from}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>To (Recipient / Contract):</span>
                        <span className="text-slate-200 truncate max-w-[220px]">
                          {verifierResult.to}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>Gas Fee Paid:</span>
                        <span className="text-amber-400 font-bold">{verifierResult.gasFee}</span>
                      </div>

                      {verifierResult.details && (
                        <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                          <span className="text-slate-500 font-bold block">DECODED DATA PAYLOAD:</span>
                          {Object.entries(verifierResult.details).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[10px]">
                              <span className="text-slate-400 capitalize">{k}:</span>
                              <span className="text-emerald-300 font-bold">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3 bg-gradient-to-t from-black via-slate-950 to-transparent border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">EuScan Engine v2.4.0</span>
            <span className="text-slate-600">•</span>
            <span>Secret Protocol *BCK*T*EU</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-bold transition cursor-pointer"
          >
            Close EuScan
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Token Deletion */}
      {tokenToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e1422] border-2 border-rose-500/70 p-4 space-y-3 font-mono text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white uppercase font-['Rajdhani',sans-serif]">
                Permanently Destroy Token Project?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Revoking contract{' '}
                <strong className="text-rose-400">{tokenToDelete.name} (${tokenToDelete.symbol})</strong>.
                This will dispatch a permanent contract destruction transaction tag on EuScan.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTokenToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteToken}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal (when clicking View Receipt on Explorer) */}
      {selectedTx && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#090e19] border-2 border-indigo-500/70 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white text-sm font-['Rajdhani',sans-serif] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                EuScan Transaction Receipt
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">TRANSACTION TAG:</span>
                <span className="text-indigo-300 break-all select-all font-bold">
                  {selectedTx.txTag}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">METHOD:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(
                    selectedTx.method
                  )}`}
                >
                  {selectedTx.method}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">STATUS:</span>
                <span className="text-emerald-400 font-bold">✓ {selectedTx.status} (Confirmed)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">BLOCK HEIGHT:</span>
                <span className="text-white font-bold">#{selectedTx.blockNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">TIMESTAMP:</span>
                <span className="text-slate-300">
                  {new Date(selectedTx.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">GAS FEE:</span>
                <span className="text-amber-400 font-bold">{selectedTx.gasFee}</span>
              </div>

              {selectedTx.details && (
                <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                  <span className="text-slate-500 font-bold block text-[10px]">DETAILS:</span>
                  {Object.entries(selectedTx.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-slate-400 capitalize">{k}:</span>
                      <span className="text-emerald-300 font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
