import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Box,
  FileText,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  Code2,
  Maximize2,
  Minimize2,
  HelpCircle,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Lock,
} from 'lucide-react';
import {
  EuToken,
  EuTransaction,
  EuTxMethod,
  EuBlock,
  getBlockchainData,
  saveBlockchainData,
  generateCryptoTag,
  generateContractAddress,
  generateBlocksList,
} from '../data/euBlockchain';
import { fetchLiveGlobalPrices } from '../data/livePrices';
import { soundFx } from '../utils/audio';
import { EuScanAdminConsole } from './EuScanAdminConsole';

export const ADMIN_CREDENTIALS = {
  username: 'Admin',
  email: 'admin@euscan.com',
  password: 'Admin1230',
};

interface EuScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance?: number;
  playerCoins?: number;
}

type NavDropdownKey = 'blockchain' | 'tokens' | 'exchange' | 'developers' | 'more' | null;

export const EuScanModal: React.FC<EuScanModalProps> = ({
  isOpen,
  onClose,
  reserveBalance = 0,
  playerCoins = 0,
}) => {
  // Blockchain Local State
  const [data, setData] = useState(() => getBlockchainData());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'tx' | 'token' | 'block' | 'address'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<NavDropdownKey>(null);

  // Active view: 'main' (Etherscan home), 'tokens', 'exchange', 'eu_mesh', 'verifier', 'admin_console'
  const [activeView, setActiveView] = useState<'main' | 'tokens' | 'exchange' | 'eu_mesh' | 'verifier' | 'admin_console'>('main');

  // Admin Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('euscan_admin_session') === 'true';
    }
    return false;
  });

  // Auth / Login Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Modals inside EuScan
  const [selectedTx, setSelectedTx] = useState<EuTransaction | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<EuBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sign Up Modal State (Required: signup button in same position, not responsive)
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Token Creation State
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
  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('USDT');
  const [exchangeAmount, setExchangeAmount] = useState('10');
  const [exchangeSuccessTx, setExchangeSuccessTx] = useState<EuTransaction | null>(null);

  // Value Control & Live Tokens State
  const [selectedTokenForValueControl, setSelectedTokenForValueControl] = useState<EuToken | null>(null);
  const [controlPriceInput, setControlPriceInput] = useState('1.00');
  const [controlChangeInput, setControlChangeInput] = useState('0.0');
  const [valueControlSuccessMsg, setValueControlSuccessMsg] = useState<string | null>(null);
  const [isLivePricesLoading, setIsLivePricesLoading] = useState(false);
  const [tokensSearchQuery, setTokensSearchQuery] = useState('');
  const [tokensOriginFilter, setTokensOriginFilter] = useState<'all' | 'eu' | 'global'>('all');

  // Live market price sync for BTC, ETH, USDT
  useEffect(() => {
    let isMounted = true;
    const syncPrices = async () => {
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
    if (isOpen) {
      syncPrices();
      const interval = setInterval(syncPrices, 35000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  // Tag Verifier Direct Search
  const [verifierTagInput, setVerifierTagInput] = useState('');
  const [verifierResult, setVerifierResult] = useState<EuTransaction | null>(null);
  const [verifierSearched, setVerifierSearched] = useState(false);

  // Faucet state
  const [faucetClaimed, setFaucetClaimed] = useState(false);

  // Search input focus ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Recent Blocks List (Dynamic based on blockHeight)
  const blocksList = useMemo(() => {
    return generateBlocksList(data.blockHeight);
  }, [data.blockHeight]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
        setShowFilterDropdown(false);
      }
    };
    if (isOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

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
    return data.transactions.filter((tx) => {
      const matchTag = tx.txTag.toLowerCase().includes(q);
      const matchFrom = tx.from.toLowerCase().includes(q);
      const matchTo = tx.to.toLowerCase().includes(q);
      const matchMethod = tx.method.toLowerCase().includes(q);
      const matchSymbol = tx.details.tokenSymbol?.toLowerCase().includes(q);
      const matchName = tx.details.tokenName?.toLowerCase().includes(q);
      const matchBlock = tx.blockNumber.toString().includes(q);

      if (searchFilter === 'tx') return matchTag;
      if (searchFilter === 'token') return matchSymbol || matchName;
      if (searchFilter === 'block') return matchBlock;
      if (searchFilter === 'address') return matchFrom || matchTo;
      return matchTag || matchFrom || matchTo || matchMethod || matchSymbol || matchName || matchBlock;
    });
  }, [data.transactions, searchQuery, searchFilter]);

  // Active tokens list
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
      priceUsd: 1.0,
      priceChange24h: 0.0,
      isBuiltInEuBlockchain: true,
      category: newTokenCategory,
      contractAddress: contractAddr,
      creatorAddress: '0xEU_Admin_Genesis_Wallet',
      createdAt: Date.now(),
      txTag: creationTxTag,
      status: 'active',
      description: `EUP-20 token project deployed on EU Blockchain.`,
      marketCapUsd: supplyNum * 1.0,
      volume24hUsd: 0,
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

  // Value Control Handlers
  const handleOpenValueControl = (token: EuToken) => {
    soundFx.playClick();
    setSelectedTokenForValueControl(token);
    setControlPriceInput(token.priceUsd.toString());
    setControlChangeInput(token.priceChange24h.toString());
    setValueControlSuccessMsg(null);
  };

  const handleSaveValueControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenForValueControl) return;

    soundFx.playClick();
    const newPrice = Math.max(0.0001, parseFloat(controlPriceInput) || 1.0);
    const newChange = parseFloat(controlChangeInput) || 0.0;
    const currentBlock = data.blockHeight + 1;
    const updateTxTag = generateCryptoTag();

    const updateTx: EuTransaction = {
      txTag: updateTxTag,
      method: 'VALUE_CONTROL_UPDATE',
      status: 'SUCCESS',
      from: '0xEU_Admin_Market_Controller',
      to: selectedTokenForValueControl.contractAddress,
      value: '0 EU',
      gasFee: '0.00050 EU',
      blockNumber: currentBlock,
      timestamp: Date.now(),
      nonce: data.transactions.length + 1,
      details: {
        tokenName: selectedTokenForValueControl.name,
        tokenSymbol: selectedTokenForValueControl.symbol,
        tokenContract: selectedTokenForValueControl.contractAddress,
        exchangeRate: `New Price: $${newPrice >= 1000 ? newPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : newPrice.toFixed(4)} USD (${newChange >= 0 ? '+' : ''}${newChange.toFixed(2)}%)`,
        note: `Admin Market Value Control Update on EU Blockchain`,
      },
    };

    const updatedTokens = data.tokens.map((t) => {
      if (t.id === selectedTokenForValueControl.id) {
        return {
          ...t,
          priceUsd: newPrice,
          priceChange24h: newChange,
          marketCapUsd: t.totalSupply * newPrice,
        };
      }
      return t;
    });

    let updatedCentralCoin = data.centralCoin;
    if (data.centralCoin?.isLaunched && selectedTokenForValueControl.symbol === data.centralCoin?.symbol) {
      updatedCentralCoin = {
        ...data.centralCoin,
        priceUsd: newPrice,
        priceChange24h: newChange,
      };
    }

    const nextData = {
      ...data,
      blockHeight: currentBlock,
      tokens: updatedTokens,
      centralCoin: updatedCentralCoin,
      transactions: [updateTx, ...data.transactions],
    };

    setData(nextData);
    saveBlockchainData(nextData);
    soundFx.playReward();
    setValueControlSuccessMsg(`Market value of ${selectedTokenForValueControl.symbol} updated to $${newPrice >= 1000 ? newPrice.toLocaleString() : newPrice.toFixed(4)} USD!`);
    setTimeout(() => {
      setSelectedTokenForValueControl(null);
      setValueControlSuccessMsg(null);
    }, 1500);
  };

  // Handle Exchange with Real Dynamic Token Rates
  const handleExecuteExchange = () => {
    const amt = parseFloat(exchangeAmount) || 0;
    if (amt <= 0) return;

    soundFx.playClick();

    const currentBlock = data.blockHeight + 1;
    const txTag = generateCryptoTag();
    let method: EuTxMethod = 'SWAP';
    let details: EuTransaction['details'] = {};
    let newBalance = data.userEuBalance;

    const fromTok = data.tokens.find((t) => t.symbol === fromAsset) || data.tokens[0];
    const toTok = data.tokens.find((t) => t.symbol === toAsset) || data.tokens[1];
    const fromPrice = fromTok?.priceUsd && fromTok.priceUsd > 0 ? fromTok.priceUsd : 1.0;
    const toPrice = toTok?.priceUsd && toTok.priceUsd > 0 ? toTok.priceUsd : 1.0;
    const rate = fromPrice / toPrice;

    const homeSymbol = data.centralCoin?.isLaunched ? data.centralCoin.symbol : null;

    if (exchangeMode === 'swap') {
      method = 'SWAP';
      const outAmt = (amt * rate).toFixed(4);
      details = {
        amountIn: `${amt.toFixed(2)} ${fromAsset}`,
        amountOut: `${outAmt} ${toAsset}`,
        exchangeRate: `1 ${fromAsset} = ${rate.toFixed(4)} ${toAsset}`,
        slippage: '0.1%',
        note: 'EU Automated Liquidity Pool AMM Route',
      };
      if (homeSymbol && fromAsset === homeSymbol) {
        newBalance = Math.max(0, newBalance - amt);
      } else if (homeSymbol && toAsset === homeSymbol) {
        newBalance += parseFloat(outAmt);
      }
    } else if (exchangeMode === 'buy') {
      method = 'BUY';
      const purchasedAmt = (amt * rate).toFixed(4);
      details = {
        amountIn: `${amt.toFixed(2)} ${fromAsset}`,
        amountOut: `${purchasedAmt} ${toAsset}`,
        exchangeRate: `1 ${fromAsset} = ${rate.toFixed(4)} ${toAsset}`,
        note: `Direct On-Chain Market Buy Order`,
      };
      if (homeSymbol && fromAsset === homeSymbol) {
        newBalance = Math.max(0, newBalance - amt);
      } else if (homeSymbol && toAsset === homeSymbol) {
        newBalance += parseFloat(purchasedAmt);
      }
    } else {
      method = 'SELL';
      const receivedAmt = (amt * rate).toFixed(4);
      details = {
        amountIn: `${amt.toFixed(2)} ${fromAsset}`,
        amountOut: `${receivedAmt} ${toAsset}`,
        exchangeRate: `1 ${fromAsset} = ${rate.toFixed(4)} ${toAsset}`,
        note: `On-Chain Market Liquidation Order`,
      };
      if (homeSymbol && fromAsset === homeSymbol) {
        newBalance = Math.max(0, newBalance - amt);
      } else if (homeSymbol && toAsset === homeSymbol) {
        newBalance += parseFloat(receivedAmt);
      }
    }

    const tx: EuTransaction = {
      txTag,
      method,
      status: 'SUCCESS',
      from: '0xEU_Player_Trader_Self',
      to: '0xEU_DEX_Settlement_Router_v2',
      value: `${amt.toFixed(2)} ${fromAsset}`,
      gasFee: '0.00 EUR',
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

  // Sign In Form Submit (Admin & User verification)
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanIdent = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    const isAdmin =
      (cleanIdent.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() ||
        cleanIdent.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) &&
      cleanPass === ADMIN_CREDENTIALS.password;

    if (isAdmin) {
      soundFx.playReward();
      setIsAdminLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('euscan_admin_session', 'true');
      }
      setAuthSuccessMsg('Administrator Authenticated! Opening Master Control Interface...');
      setTimeout(() => {
        setAuthSuccessMsg(null);
        setShowAuthModal(false);
        setActiveView('admin_console');
        setLoginIdentifier('');
        setLoginPassword('');
      }, 1000);
    } else {
      soundFx.playClick();
      setAuthError('Invalid credentials. To access the Administrator Control Interface, use Username: Admin (or admin@euscan.com) with Password: Admin1230');
    }
  };

  const handleAdminLogout = () => {
    soundFx.playClick();
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('euscan_admin_session');
    }
    setActiveView('main');
  };

  // Sign Up Form Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpForm.username || !signUpForm.email || !signUpForm.password) return;
    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    soundFx.playReward();
    setSignUpSuccess(true);
    setTimeout(() => {
      setSignUpSuccess(false);
      setShowSignUpModal(false);
      setSignUpForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });
    }, 2000);
  };

  const getMethodBadgeClass = (method: EuTxMethod) => {
    switch (method) {
      case 'TOKEN_CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TOKEN_DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SWAP':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'BUY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SELL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COIN_MINT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-1 sm:p-2 md:p-3 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none overflow-hidden">
      {/* Container: Matches exact Etherscan desktop / browser canvas */}
      <div
        className="relative w-full max-w-7xl rounded-xl h-[95vh] bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-800 transition-all duration-200"
      >
        {/* ========================================================================= */}
        {/* ETHERSCAN MAIN NAVIGATION BAR WITH DROPDOWNS & PERMANENT SIGN UP */}
        {/* ========================================================================= */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-3">
          {/* Logo with Modified Title branding */}
          <div
            onClick={() => {
              soundFx.playClick();
              setActiveView('main');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
              <span className="font-black text-sm tracking-tighter font-mono">EU</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Eu<span className="text-orange-600">Scan</span>
                </span>
                <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">
                  Blockchain
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono -mt-0.5 hidden sm:inline">
                Decentralized Protocol (EVM Compatible)
              </span>
            </div>
          </div>

          {/* Etherscan Navigation Menu Items with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700 dropdown-container">
            {/* Home */}
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveView('main');
              }}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeView === 'main'
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Home
            </button>

            {/* Blockchain Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'blockchain' ? null : 'blockchain');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeDropdown === 'blockchain' ? 'bg-orange-50 text-orange-600' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Blockchain</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'blockchain' && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg border border-slate-200 shadow-xl py-1.5 z-40 text-xs font-medium divide-y divide-slate-100 animate-in fade-in duration-100">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('main');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between"
                    >
                      <span>Transactions</span>
                      <span className="text-[10px] text-slate-400 font-mono">{data.transactions.length}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('main');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      View Blocks
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('eu_mesh');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      EU Network & Mesh
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('verifier');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      Verified Contracts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tokens Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'tokens' ? null : 'tokens');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeDropdown === 'tokens' || activeView === 'tokens'
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Tokens</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'tokens' && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg border border-slate-200 shadow-xl py-1.5 z-40 text-xs font-medium divide-y divide-slate-100 animate-in fade-in duration-100">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('tokens');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between"
                    >
                      <span>Top Tokens (EUP-20)</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                        {activeTokens.length}
                      </span>
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('tokens');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition text-emerald-700 font-semibold"
                    >
                      + Deploy / Create Token
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('tokens');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition text-rose-600 font-semibold"
                    >
                      Delete / Revoke Project
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Exchange (DEX) Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'exchange' ? null : 'exchange');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeDropdown === 'exchange' || activeView === 'exchange'
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Exchange</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'exchange' && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg border border-slate-200 shadow-xl py-1.5 z-40 text-xs font-medium animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setExchangeMode('swap');
                      setActiveView('exchange');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    Swap Engine (AMM)
                  </button>
                  <button
                    onClick={() => {
                      setExchangeMode('buy');
                      setActiveView('exchange');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    Buy Tokens
                  </button>
                  <button
                    onClick={() => {
                      setExchangeMode('sell');
                      setActiveView('exchange');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    Sell / Liquidate Tokens
                  </button>
                </div>
              )}
            </div>

            {/* Developers Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'developers' ? null : 'developers');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeDropdown === 'developers' ? 'bg-orange-50 text-orange-600' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Developers</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'developers' && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg border border-slate-200 shadow-xl py-1.5 z-40 text-xs font-medium animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setActiveView('eu_mesh');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition text-orange-600 font-semibold"
                  >
                    Test Faucet (+100 EU)
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('verifier');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    Smart Contract Verifier
                  </button>
                </div>
              )}
            </div>

            {/* More Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'more' ? null : 'more');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeDropdown === 'more' ? 'bg-orange-50 text-orange-600' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'more' && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-xl py-1.5 z-40 text-xs font-medium animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setActiveView('verifier');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    Tag Verifier
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('eu_mesh');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    Gas Tracker
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* EXACT SAME POSITION: SIGN UP BUTTON (NOT RESPONSIVE, ALWAYS ANCHORED HERE) & ADMIN CONSOLE */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('admin_console');
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                    activeView === 'admin_console'
                      ? 'bg-slate-900 text-orange-400 border border-orange-500/50'
                      : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                  }`}
                  title="Open Administrator Control Interface"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                  <span>Admin Control</span>
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
                  title="Sign Out of Admin"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setAuthTab('signin');
                  setShowAuthModal(true);
                }}
                className="text-slate-600 hover:text-orange-600 transition text-xs font-semibold cursor-pointer mr-1 hidden sm:inline"
              >
                Sign In
              </button>
            )}

            <button
              id="euscan-header-signup"
              onClick={() => {
                soundFx.playClick();
                setAuthTab('signup');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs transition shadow-sm shadow-orange-500/25 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              aria-label="Close EuScan"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer ml-1"
              title="Close EuScan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. ADMINISTRATOR CONSOLE OR PUBLIC EXPLORER */}
        {/* ========================================================================= */}
        {activeView === 'admin_console' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <EuScanAdminConsole
              data={data}
              setData={setData}
              onLogout={handleAdminLogout}
              onExitAdmin={() => setActiveView('main')}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#fafafa]">
            {/* Hero Banner Header */}
            <div className="bg-gradient-to-b from-white via-orange-50/20 to-slate-50 border-b border-slate-200 px-4 sm:px-8 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto space-y-3.5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  EU Blockchain Explorer
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Decentralized search engine, smart contract verifier, token factory, and automated market maker on EU Mainnet.
                </p>
              </div>

              {/* Exact Etherscan Search Bar with All Filters Dropdown */}
              <div className="relative flex items-center bg-white rounded-xl border border-slate-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 shadow-sm transition">
                {/* Dropdown: All Filters */}
                <div className="relative shrink-0 dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFilterDropdown(!showFilterDropdown);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold text-slate-700 border-r border-slate-200 hover:bg-slate-50 rounded-l-xl transition cursor-pointer"
                  >
                    <span>
                      {searchFilter === 'all'
                        ? 'All Filters'
                        : searchFilter === 'tx'
                        ? 'Txn Tags'
                        : searchFilter === 'token'
                        ? 'Tokens'
                        : searchFilter === 'block'
                        ? 'Blocks'
                        : 'Addresses'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-36 bg-white rounded-lg border border-slate-200 shadow-xl py-1 z-50 text-xs font-medium">
                      {(['all', 'tx', 'token', 'block', 'address'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => {
                            setSearchFilter(filter);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer capitalize ${
                            searchFilter === filter ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-slate-700'
                          }`}
                        >
                          {filter === 'all'
                            ? 'All Filters'
                            : filter === 'tx'
                            ? 'Transactions'
                            : filter === 'token'
                            ? 'Tokens'
                            : filter === 'block'
                            ? 'Blocks'
                            : 'Addresses'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Field */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
                  className="flex-1 px-3.5 py-3 text-xs font-mono text-slate-900 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-sans"
                />

                {/* Keyboard Shortcut Indicator */}
                <span className="hidden sm:inline-block px-1.5 py-0.5 mr-2 rounded bg-slate-100 text-[10px] font-mono text-slate-400 border border-slate-200">
                  /
                </span>

                {/* Orange Search Action Button */}
                <div className="p-1.5 pr-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      if (searchQuery.trim()) {
                        setActiveView('main');
                      }
                    }}
                    className="w-9 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white flex items-center justify-center transition shadow-sm shadow-orange-500/30 cursor-pointer"
                    title="Search EuScan"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sponsored / Featured Link Under Search Bar */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Sponsored:</span>
                  <span className="text-orange-600 font-medium hover:underline cursor-pointer">
                    EU Network Staking: Earn 7.2% Validator APY
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Your $EU:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {data.userEuBalance.toFixed(2)} EU
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* VIEW: MAIN (ETHERSCAN HOMEPAGE STRUCTURE) */}
          {/* ======================================================================= */}
          {activeView === 'main' && (
            <div className="px-4 sm:px-8 py-5 space-y-5 max-w-6xl mx-auto">
              
              {/* 4 Etherscan Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Card 1: EU Price & Market Cap */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        EU PRICE
                      </span>
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        $1.85 <span className="text-[11px] text-emerald-600 font-normal">@ 0.00045 BTC</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Market Cap:</span>
                    <span className="font-semibold text-slate-800 font-mono">$1,850,000,000</span>
                  </div>
                </div>

                {/* Card 2: Transactions & Gas */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        TRANSACTIONS
                      </span>
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        14.85 M <span className="text-[11px] text-slate-500 font-normal">(1,450.5 TPS)</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Med Gas Price:</span>
                    <span className="font-semibold text-orange-600 font-mono">12 Gwei ($0.00045)</span>
                  </div>
                </div>

                {/* Card 3: Last Finalized Block */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        LAST FINALIZED BLOCK
                      </span>
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        #{data.blockHeight.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Active Validators:</span>
                    <span className="font-semibold text-emerald-600 font-mono">64 Nodes (PoS)</span>
                  </div>
                </div>

                {/* Card 4: Transaction History Sparkline */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TRANSACTION HISTORY (14 DAYS)
                    </span>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      Daily Volume Avg: <span className="text-orange-600 font-mono font-bold">1.06M Txns</span>
                    </div>
                  </div>

                  <div className="flex items-end gap-1 h-7 pt-1">
                    {[38, 45, 52, 60, 48, 70, 85, 65, 90, 82, 95, 78, 92, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-orange-200 hover:bg-orange-500 rounded-t transition cursor-pointer"
                        style={{ height: `${h}%` }}
                        title={`Day ${i + 1}: ${(h * 12400).toLocaleString()} Txns`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* DUAL TABLE: LATEST BLOCKS & LATEST TRANSACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Column 1: Latest Blocks */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-sm text-slate-900">Latest Blocks</span>
                    </div>
                    <span className="text-[11px] font-semibold text-orange-600">
                      PoS Finalized
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {blocksList.map((blk) => (
                      <div
                        key={blk.blockNumber}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedBlock(blk);
                        }}
                        className="p-3.5 hover:bg-orange-50/30 transition flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 font-mono font-bold text-xs">
                            Bk
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-orange-600 hover:underline font-mono">
                                #{blk.blockNumber}
                              </span>
                              <span className="text-[10px] text-slate-400">12 secs ago</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[150px] sm:max-w-xs">
                              Fee Recipient:{' '}
                              <span className="text-slate-700 font-mono">{blk.validator}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[11px] text-slate-700 font-medium font-mono">
                            {blk.txCount} txns
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Reward: <span className="font-semibold text-slate-800">{blk.reward}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center">
                    <button
                      onClick={() => soundFx.playClick()}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider cursor-pointer"
                    >
                      VIEW ALL BLOCKS →
                    </button>
                  </div>
                </div>

                {/* Column 2: Latest Transactions */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-sm text-slate-900">Latest Transactions</span>
                    </div>
                    <span className="text-[11px] font-semibold text-orange-600">
                      {filteredTransactions.length} Total Verified
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.slice(0, 6).map((tx) => (
                      <div
                        key={tx.txTag}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedTx(tx);
                        }}
                        className="p-3.5 hover:bg-orange-50/30 transition flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 font-mono font-bold text-xs">
                            Tx
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-orange-600 hover:underline font-mono truncate max-w-[110px] sm:max-w-[130px]">
                                {tx.txTag.slice(0, 10)}...{tx.txTag.slice(-4)}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getMethodBadgeClass(
                                  tx.method
                                )}`}
                              >
                                {tx.method}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[150px] sm:max-w-xs font-mono">
                              From: {tx.from.slice(0, 12)}... To: {tx.to.slice(0, 10)}...
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold inline-block">
                            {tx.value || '0 EU'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Gas: {tx.gasFee}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center">
                    <button
                      onClick={() => soundFx.playClick()}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider cursor-pointer"
                    >
                      VIEW ALL TRANSACTIONS →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: EU ($EU) ARCHITECTURE & FAUCET */}
          {/* ======================================================================= */}
          {activeView === 'eu_mesh' && (
            <div className="px-4 sm:px-8 py-5 space-y-4 max-w-5xl mx-auto">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          EU Coin ($EU)
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-mono text-[10px] font-bold">
                          NATIVE STANDARD
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        The native utility, gas, and validator staking currency of the EU Blockchain.
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      YOUR CURRENT BALANCE
                    </span>
                    <span className="text-2xl font-black text-orange-600 font-mono">
                      {data.userEuBalance.toFixed(2)} EU
                    </span>
                  </div>
                </div>

                {/* Developer Faucet Claim */}
                <div className="p-3.5 rounded-lg bg-orange-50/60 border border-orange-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Developer & Testing Faucet
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Need test $EU to deploy smart contracts or execute test swaps?
                    </span>
                  </div>
                  <button
                    onClick={handleClaimFaucet}
                    disabled={faucetClaimed}
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {faucetClaimed ? '✓ Dispatched +100 EU' : 'Claim 100 Test $EU'}
                  </button>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">MAX SUPPLY</span>
                  <div className="text-sm font-bold text-slate-900 font-mono">1,000,000,000 EU</div>
                  <span className="text-[10px] text-slate-500">Genesis Hard Cap</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">CIRCULATING</span>
                  <div className="text-sm font-bold text-orange-600 font-mono">342,190,450 EU</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">34.2% in Circulation</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">STAKED VALIDATORS</span>
                  <div className="text-sm font-bold text-slate-900 font-mono">485,210,000 EU</div>
                  <span className="text-[10px] text-orange-600 font-semibold">48.5% Staked in Mesh</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">TOTAL BURNED</span>
                  <div className="text-sm font-bold text-rose-600 font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>12,599,550 EU</span>
                  </div>
                  <span className="text-[10px] text-rose-500">Deflationary Base Burn</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: TOKENS & PROJECTS (DEPLOY & DELETE TOKENS) */}
          {/* ======================================================================= */}
          {activeView === 'tokens' && (
            <div className="px-4 sm:px-8 py-5 space-y-4 max-w-5xl mx-auto">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Deploy New Token Project (EUP-20 Standard)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-orange-600 font-semibold">
                    Deployment Gas: 0.00125 EU
                  </span>
                </div>

                <form onSubmit={handleCreateToken} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Token Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder="e.g. Cyber Genesis"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 text-xs font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Symbol (Ticker)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={newTokenSymbol}
                        onChange={(e) => setNewTokenSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g. CYB"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 text-xs font-mono outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Total Initial Supply
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newTokenSupply}
                        onChange={(e) => setNewTokenSupply(e.target.value)}
                        placeholder="10000000"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500 text-[11px] mr-1">Category:</span>
                      {(['DeFi', 'Gaming', 'Utility', 'Governance', 'Meme'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setNewTokenCategory(cat);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                            newTokenCategory === cat
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs transition shadow-sm shadow-orange-500/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Deploy Smart Contract</span>
                    </button>
                  </div>
                </form>

                {tokenCreationSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Token Contract Successfully Deployed on EU Blockchain!
                      </span>
                      <button
                        onClick={() => setTokenCreationSuccess(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-700">
                      <div>
                        Contract:{' '}
                        <span className="font-bold text-orange-600">
                          {tokenCreationSuccess.token.contractAddress}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span>
                          Creation Tx Tag:{' '}
                          <span className="font-mono text-slate-800">
                            {tokenCreationSuccess.txTag.slice(0, 16)}...
                          </span>
                        </span>
                        <button
                          onClick={() => {
                            setVerifierTagInput(tokenCreationSuccess.txTag);
                            setActiveView('verifier');
                          }}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          Verify in EuScan →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deployed Tokens List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Available Tokens & Ecosystem Assets ({activeTokens.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standard: EUP-20 & Global Reserve Assets. EU-built tokens feature Admin Market Value Control.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                    Live DEX Linked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTokens.map((tok) => (
                    <div
                      key={tok.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-300 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                              tok.symbol === 'BTC'
                                ? 'bg-amber-500'
                                : tok.symbol === 'ETH'
                                ? 'bg-indigo-600'
                                : tok.symbol === 'USDT'
                                ? 'bg-teal-500'
                                : data.centralCoin?.isLaunched && tok.symbol === data.centralCoin.symbol
                                ? 'bg-amber-600'
                                : 'bg-orange-500'
                            }`}>
                              {tok.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{tok.name}</span>
                                <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 font-mono text-[9px] font-bold">
                                  ${tok.symbol}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {tok.isBuiltInEuBlockchain ? 'EU Blockchain (EUP-20)' : 'Global Reserve'} • {tok.category}
                              </span>
                            </div>
                          </div>

                          {tok.isBuiltInEuBlockchain && (!data.centralCoin?.isLaunched || tok.symbol !== data.centralCoin.symbol) && (
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setTokenToDelete(tok);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete / Revoke Token Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Price & Valuation Metrics */}
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 block">PRICE ($USD)</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-900">
                                ${tok.priceUsd >= 1000 ? tok.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : tok.priceUsd.toFixed(4)}
                              </span>
                              {!tok.isBuiltInEuBlockchain && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title="Live Price" />
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">24H CHANGE</span>
                            <span className={`font-bold inline-flex items-center ${tok.priceChange24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tok.priceChange24h >= 0 ? '+' : ''}{tok.priceChange24h.toFixed(2)}%
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">MARKET CAP</span>
                            <span className="font-bold text-slate-700">
                              ${(tok.totalSupply * tok.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">TOTAL SUPPLY</span>
                            <span className="text-slate-600 truncate block">
                              {tok.totalSupply.toLocaleString()} {tok.symbol}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Contract:</span>
                            <button
                              onClick={() => copyToClipboard(tok.contractAddress, tok.id)}
                              className="text-orange-600 hover:underline flex items-center gap-1 font-semibold"
                              title="Copy Contract Address"
                            >
                              <span>
                                {tok.contractAddress.slice(0, 10)}...{tok.contractAddress.slice(-4)}
                              </span>
                              {copiedHash === tok.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Actions: VALUE CONTROL & TRADE */}
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                        <div>
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
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                              ● LIVE PRICE
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setFromAsset(tok.symbol);
                            setActiveView('exchange');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Trade / Swap</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: DEX EXCHANGE ENGINE (SWAP, BUY, SELL) */}
          {/* ======================================================================= */}
          {activeView === 'exchange' && (
            <div className="px-4 sm:px-8 py-5 space-y-4 max-w-xl mx-auto">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                    <span>EU Crypto Exchange Processing Engine</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Processes decentralized Swaps, Buys, and Sells. Dispatches authentic on-chain
                    transaction tags verifiable on EuScan.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  {(['swap', 'buy', 'sell'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setExchangeMode(m);
                      }}
                      className={`py-1.5 rounded-md transition capitalize cursor-pointer ${
                        exchangeMode === m
                          ? 'bg-white text-orange-600 font-bold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {exchangeMode === 'buy' ? 'Pay Asset' : 'From Asset'}
                      </label>
                      <select
                        value={fromAsset}
                        onChange={(e) => setFromAsset(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono outline-none"
                      >
                        {activeTokens.map((t) => (
                          <option key={t.symbol} value={t.symbol}>
                            {t.symbol} ({t.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {exchangeMode === 'sell' ? 'Receive Asset' : 'To Asset'}
                      </label>
                      <select
                        value={toAsset}
                        onChange={(e) => setToAsset(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono outline-none"
                      >
                        {activeTokens
                          .filter((t) => t.symbol !== fromAsset)
                          .map((t) => (
                            <option key={t.symbol} value={t.symbol}>
                              {t.symbol} ({t.name})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Amount to {exchangeMode.toUpperCase()}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        min={0.1}
                        step={0.1}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 text-sm font-mono font-bold outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-orange-600">
                        {fromAsset}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Gas Fee:</span>
                      <span className="font-semibold text-slate-800">0.00045 EU</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Routing:</span>
                      <span className="text-orange-600 font-semibold">EU Router v2.4 (Uniswap-V2 Core)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteExchange}
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Execute {exchangeMode.toUpperCase()} & Generate Tx Tag</span>
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {exchangeSuccessTx && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Exchange Dispatched on Blockchain!
                      </span>
                      <button
                        onClick={() => setExchangeSuccessTx(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2 rounded bg-white border border-emerald-100 font-mono text-[11px] space-y-1 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Txn Tag:</span>
                        <span className="font-bold text-orange-600">
                          {exchangeSuccessTx.txTag.slice(0, 16)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Executed:</span>
                        <span>{exchangeSuccessTx.details.amountIn} → {exchangeSuccessTx.details.amountOut}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setVerifierTagInput(exchangeSuccessTx.txTag);
                        setActiveView('verifier');
                      }}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition text-center cursor-pointer"
                    >
                      Verify Full Receipt in EuScan Explorer →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: TAG VERIFIER TOOL */}
          {/* ======================================================================= */}
          {activeView === 'verifier' && (
            <div className="px-4 sm:px-8 py-5 space-y-4 max-w-2xl mx-auto">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    <span>Cryptographic Transaction Tag Verifier</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify any Transaction Tag generated on the EU Blockchain (Token Creation, Deletion, Swap, Buy, Sell).
                  </p>
                </div>

                <form onSubmit={handleVerifyTagSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={verifierTagInput}
                    onChange={(e) => setVerifierTagInput(e.target.value)}
                    placeholder="Enter Transaction Tag (e.g. 0x8f2d93e1a84c...)"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 text-xs font-mono outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Verify Tag
                  </button>
                </form>

                {verifierSearched && !verifierResult && (
                  <div className="p-4 text-center rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-rose-500" />
                    No matching blockchain transaction found for this tag. Please verify input.
                  </div>
                )}

                {verifierResult && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-orange-200 space-y-3 text-xs font-mono animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            TRANSACTION VERIFIED (BLOCK #{verifierResult.blockNumber})
                          </span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">
                            Cryptographic Proof Validated by 64/64 Nodes
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadgeClass(
                          verifierResult.method
                        )}`}
                      >
                        {verifierResult.method}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Transaction Tag:</span>
                        <span className="font-bold text-orange-600 truncate max-w-xs">
                          {verifierResult.txTag}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Block Height:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          #{verifierResult.blockNumber.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Timestamp:</span>
                        <span>{new Date(verifierResult.timestamp).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">From:</span>
                        <span className="truncate max-w-[200px]">{verifierResult.from}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">To / Contract:</span>
                        <span className="truncate max-w-[200px]">{verifierResult.to}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Gas Fee Paid:</span>
                        <span className="font-bold text-orange-600">{verifierResult.gasFee}</span>
                      </div>

                      {verifierResult.details && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="text-slate-500 font-bold block text-[10px]">
                            DECODED PAYLOAD:
                          </span>
                          {Object.entries(verifierResult.details).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[10px]">
                              <span className="text-slate-500 capitalize">{k}:</span>
                              <span className="font-bold text-slate-900">{String(v)}</span>
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

          {/* ======================================================================= */}
          {/* 4. ETHERSCAN 4-COLUMN FOOTER */}
          {/* ======================================================================= */}
          <footer className="bg-white border-t border-slate-200 mt-8 px-4 sm:px-8 py-8 text-xs text-slate-600">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white font-mono text-xs font-bold">
                    EU
                  </div>
                  <span className="font-bold text-slate-900">Powered by EU Core</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  EuScan is the leading Blockchain Explorer, Search, API and Analytics Platform for the decentralized EU blockchain.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Company</h4>
                <ul className="space-y-1 text-[11px] text-slate-500">
                  <li className="hover:text-orange-600 cursor-pointer">About Us</li>
                  <li className="hover:text-orange-600 cursor-pointer">Brand Assets</li>
                  <li className="hover:text-orange-600 cursor-pointer">Contact Us</li>
                  <li className="hover:text-orange-600 cursor-pointer">Terms & Conditions</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Community</h4>
                <ul className="space-y-1 text-[11px] text-slate-500">
                  <li className="hover:text-orange-600 cursor-pointer">API Documentation</li>
                  <li className="hover:text-orange-600 cursor-pointer">Knowledge Base</li>
                  <li className="hover:text-orange-600 cursor-pointer">Network Status (100% Up)</li>
                  <li className="hover:text-orange-600 cursor-pointer">Validator Mesh</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Products & Services</h4>
                <ul className="space-y-1 text-[11px] text-slate-500">
                  <li
                    onClick={() => setActiveView('exchange')}
                    className="hover:text-orange-600 cursor-pointer"
                  >
                    DEX Exchange Engine
                  </li>
                  <li
                    onClick={() => setActiveView('tokens')}
                    className="hover:text-orange-600 cursor-pointer"
                  >
                    Token Projects Factory
                  </li>
                  <li
                    onClick={() => setActiveView('eu_mesh')}
                    className="hover:text-orange-600 cursor-pointer"
                  >
                    Developer Faucet (+100 EU)
                  </li>
                  <li
                    onClick={() => setActiveView('verifier')}
                    className="hover:text-orange-600 cursor-pointer"
                  >
                    Tag Verifier
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-6xl mx-auto pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div>EuScan © 2026 (EU Mainnet-C) • EU Protocol Architecture</div>
              <div className="flex items-center gap-3">
                <span className="hover:text-orange-600 cursor-pointer">Donations</span>
                <span>•</span>
                <span className="hover:text-orange-600 cursor-pointer">Privacy Policy</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>

      {/* ========================================================================= */}
      {/* 5. ETHERSCAN SIGN UP MODAL */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. ETHERSCAN AUTHENTICATION & ADMIN SIGN IN MODAL */}
      {/* ========================================================================= */}
      {(showAuthModal || showSignUpModal) && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 text-slate-800">
            {/* Modal Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAuthTab('signin');
                    setAuthError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    authTab === 'signin' ? 'bg-white text-orange-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAuthTab('signup');
                    setAuthError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    authTab === 'signup' ? 'bg-white text-orange-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setShowSignUpModal(false);
                  setAuthError(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: SIGN IN (ADMIN ACCESS & GENERAL USER) */}
            {authTab === 'signin' && (
              <div className="space-y-3.5">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Sign In to EuScan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enter your credentials to access your account or Administrator Control Interface.
                  </p>
                </div>

                {/* Quick-Fill Admin Badge */}
                <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-orange-800 block">Administrator Credentials</span>
                    <span className="text-slate-600 font-mono text-[10px]">Admin / admin@euscan.com • Admin1230</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setLoginIdentifier('admin@euscan.com');
                      setLoginPassword('Admin1230');
                      setAuthError(null);
                    }}
                    className="px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] transition cursor-pointer"
                  >
                    Quick Fill
                  </button>
                </div>

                {authSuccessMsg ? (
                  <div className="p-4 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1 animate-in zoom-in-95">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="font-bold text-xs">{authSuccessMsg}</div>
                  </div>
                ) : (
                  <form onSubmit={handleSignInSubmit} className="space-y-3 text-xs">
                    {authError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Username or Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Admin or admin@euscan.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 outline-none text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/25 cursor-pointer mt-1"
                    >
                      Sign In & Enter Dashboard
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: SIGN UP */}
            {authTab === 'signup' && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Register a New EuScan Account
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Access watchlists, portfolio trackers, and automated alert notifications.
                  </p>
                </div>

                {signUpSuccess ? (
                  <div className="py-6 text-center space-y-2 animate-in zoom-in-95 duration-150">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-slate-900">Registration Complete!</h4>
                    <p className="text-xs text-slate-500">
                      Welcome to EuScan, <strong className="text-slate-800">{signUpForm.username}</strong>.
                      Your account is now synced with EU Blockchain Mainnet.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={signUpForm.username}
                        onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })}
                        placeholder="e.g. SatoshiMiner"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                        placeholder="user@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 outline-none text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={signUpForm.password}
                          onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={signUpForm.confirmPassword}
                          onChange={(e) =>
                            setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-slate-900 outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="agree-terms"
                        required
                        checked={signUpForm.agreeTerms}
                        onChange={(e) =>
                          setSignUpForm({ ...signUpForm, agreeTerms: e.target.checked })
                        }
                        className="mt-0.5 accent-orange-600 rounded"
                      />
                      <label htmlFor="agree-terms" className="text-[11px] text-slate-600 leading-tight">
                        I agree to the <span className="text-orange-600 underline">Terms of Service</span> and{' '}
                        <span className="text-orange-600 underline">Privacy Policy</span>.
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/25 cursor-pointer mt-2"
                    >
                      Create an Account
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TOKEN DELETION MODAL */}
      {/* ========================================================================= */}
      {tokenToDelete && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-rose-200 shadow-2xl p-5 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Permanently Destroy Token Project?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You are about to revoke contract{' '}
                <strong className="text-rose-600">{tokenToDelete.name} (${tokenToDelete.symbol})</strong>.
                This will dispatch a permanent contract revocation transaction on EU Chain.
              </p>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                onClick={() => setTokenToDelete(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteToken}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-sm shadow-rose-500/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TRANSACTION RECEIPT MODAL */}
      {/* ========================================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 space-y-3 font-mono text-xs text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-sm text-slate-900">
                  Transaction Details
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">TRANSACTION HASH:</span>
                <span className="font-bold text-orange-600 break-all select-all">
                  {selectedTx.txTag}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">STATUS:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Success (Confirmed)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">BLOCK:</span>
                <span className="font-bold text-slate-900">#{selectedTx.blockNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">METHOD:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadgeClass(
                    selectedTx.method
                  )}`}
                >
                  {selectedTx.method}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">VALUE:</span>
                <span className="font-bold text-slate-900">{selectedTx.value || '0 EU'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">GAS FEE:</span>
                <span className="font-semibold text-orange-600">{selectedTx.gasFee}</span>
              </div>

              {selectedTx.details && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 mt-2">
                  <span className="text-slate-400 font-bold block text-[10px]">
                    PAYLOAD ATTRIBUTES:
                  </span>
                  {Object.entries(selectedTx.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-slate-500 capitalize">{k}:</span>
                      <span className="font-bold text-slate-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase cursor-pointer transition mt-2 font-sans"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. BLOCK DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedBlock && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 space-y-3 font-mono text-xs text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-sm text-slate-900">
                  Block #{selectedBlock.blockNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">BLOCK HEIGHT:</span>
                <span className="font-bold text-orange-600">#{selectedBlock.blockNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">VALIDATOR:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {selectedBlock.validator}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">TRANSACTIONS:</span>
                <span className="font-bold text-slate-900">{selectedBlock.txCount} txns</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">BLOCK REWARD:</span>
                <span className="font-bold text-emerald-600">{selectedBlock.reward}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">BASE GAS FEE:</span>
                <span className="font-semibold text-orange-600">{selectedBlock.baseFee}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">BLOCK HASH:</span>
                <span className="font-mono text-[10px] text-slate-600 break-all select-all">
                  {selectedBlock.hash}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBlock(null)}
              className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase cursor-pointer transition mt-2 font-sans"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. VALUE CONTROL MODAL (Control Market Value of EU-built tokens) */}
      {/* ========================================================================= */}
      {selectedTokenForValueControl && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-amber-300 shadow-2xl max-w-lg w-full overflow-hidden p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <span>Value Control</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                      ${selectedTokenForValueControl.symbol}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control market value of {selectedTokenForValueControl.name} built in EU Blockchain.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTokenForValueControl(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveValueControl} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Contract Address:</span>
                  <span className="font-bold text-slate-900">
                    {selectedTokenForValueControl.contractAddress.slice(0, 10)}...{selectedTokenForValueControl.contractAddress.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Price:</span>
                  <span className="font-bold text-amber-600">
                    ${selectedTokenForValueControl.priceUsd.toFixed(4)} USD
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Supply:</span>
                  <span>{selectedTokenForValueControl.totalSupply.toLocaleString()} {selectedTokenForValueControl.symbol}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Price ($USD per {selectedTokenForValueControl.symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    value={controlPriceInput}
                    onChange={(e) => {
                      setControlPriceInput(e.target.value);
                      const cur = selectedTokenForValueControl.priceUsd;
                      const n = parseFloat(e.target.value);
                      if (cur > 0 && !isNaN(n)) {
                        const pct = (((n - cur) / cur) * 100).toFixed(2);
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
                  {[-50, -25, -10, 5, 10, 25, 50, 100].map((pct) => (
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

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-mono space-y-1">
                <div className="flex justify-between text-amber-900">
                  <span>Projected Market Cap:</span>
                  <span className="font-bold">
                    ${((parseFloat(controlPriceInput) || 1.0) * selectedTokenForValueControl.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>
                <div className="flex justify-between text-amber-700 text-[11px]">
                  <span>Consensus Proof:</span>
                  <span>Block #{data.blockHeight + 1} • On-Chain Broadcast</span>
                </div>
              </div>

              {valueControlSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{valueControlSuccessMsg}</span>
                </div>
              )}

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
                  <Check className="w-4 h-4" />
                  <span>Apply Value Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
