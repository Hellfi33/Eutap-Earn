import React, { useState } from 'react';
import {
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  X,
  Copy,
  Check,
  Key,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Crown,
  TrendingUp,
  Coins,
  Lock,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import {
  evaluateWithdrawalEligibility,
  MIN_WITHDRAWAL_THRESHOLD,
  MIN_WITHDRAWAL_POINTS,
  MIN_WITHDRAWAL_LEVEL,
} from '../data/withdrawalRules';

interface SecretReserveWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance: number;
  playerKeys: number;
  coins?: number;
  tapLevel?: number;
  mineCardLevels?: Record<string, number>;
  stage?: number;
  totalEarned?: number;
  onWithdraw: (amount: number, keyFee: number, address: string, network: string, txHash?: string) => void;
  onViewHistory?: () => void;
  onGoToMine?: () => void;
}

const NETWORKS = [
  { id: 'usdt_trc20', name: 'USDT (TRC-20)', badge: 'Tron', min: 90 },
  { id: 'usdt_ton', name: 'USDT (TON)', badge: 'TON Jetton', min: 90 },
  { id: 'usdt_erc20', name: 'USDT (ERC-20)', badge: 'Ethereum', min: 90 },
  { id: 'ton', name: 'TON (Native)', badge: 'Telegram TON', min: 90 },
  { id: 'sol', name: 'SOL (Solana)', badge: 'Solana', min: 90 },
  { id: 'btc', name: 'BTC (Bitcoin)', badge: 'Bitcoin Core', min: 90 },
];

/**
 * Calculates the required key charge for a withdrawal:
 * - Rate: $5 withdrawal costs 30 keys (ratio: 6 keys per $1.00)
 * - Minimum: 30 keys
 * - Maximum: 10,000 keys
 */
export const calculateWithdrawalKeyFee = (amount: number): number => {
  if (amount <= 0) return 30;
  const rawKeys = Math.ceil(amount * 6);
  return Math.min(10000, Math.max(30, rawKeys));
};

export const SecretReserveWithdrawalModal: React.FC<SecretReserveWithdrawalModalProps> = ({
  isOpen,
  onClose,
  reserveBalance,
  playerKeys = 0,
  coins = 0,
  tapLevel = 0,
  mineCardLevels = {},
  stage = 1,
  totalEarned = 0,
  onWithdraw,
  onViewHistory,
  onGoToMine,
}) => {
  const [selectedNet, setSelectedNet] = useState(NETWORKS[0]);
  const [walletAddress, setWalletAddress] = useState('');
  const [amountStr, setAmountStr] = useState(
    reserveBalance >= MIN_WITHDRAWAL_THRESHOLD ? Math.min(reserveBalance, 90).toString() : '90'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCriteriaDetails, setShowCriteriaDetails] = useState(false);
  const [receipt, setReceipt] = useState<{
    txHash: string;
    amount: number;
    keyFee: number;
    remainingKeys: number;
    net: string;
    address: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Evaluate the 5 mandatory criteria
  const eligibility = evaluateWithdrawalEligibility(
    coins,
    tapLevel,
    reserveBalance,
    playerKeys,
    mineCardLevels,
    stage,
    totalEarned
  );

  const withdrawAmount = parseFloat(amountStr) || 0;
  const keyFee = calculateWithdrawalKeyFee(withdrawAmount);
  const hasEnoughKeys = playerKeys >= keyFee;
  const isThresholdMet = withdrawAmount >= MIN_WITHDRAWAL_THRESHOLD;
  const isBalanceSufficient = withdrawAmount <= reserveBalance;
  const isValidAmount = isThresholdMet && isBalanceSufficient;
  const isValidAddress = walletAddress.trim().length >= 10;

  const canSubmit =
    isValidAmount &&
    isValidAddress &&
    hasEnoughKeys &&
    eligibility.isLevelMet &&
    eligibility.isPphMet &&
    eligibility.isPointsMet &&
    !isProcessing;

  const handleMax = () => {
    soundFx.playClick();
    setAmountStr(reserveBalance.toFixed(2));
  };

  const handlePasteAddress = async () => {
    soundFx.playClick();
    try {
      const text = await navigator.clipboard.readText();
      if (text) setWalletAddress(text.trim());
    } catch {
      // Fallback
    }
  };

  const handleSubmitWithdraw = () => {
    if (!canSubmit) return;

    soundFx.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      soundFx.playReward();
      const mockTx =
        '0x' +
        Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      onWithdraw(withdrawAmount, keyFee, walletAddress.trim(), selectedNet.name, mockTx);
      setReceipt({
        txHash: mockTx,
        amount: withdrawAmount,
        keyFee,
        remainingKeys: Math.max(0, playerKeys - keyFee),
        net: selectedNet.name,
        address: walletAddress.trim(),
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleCopyTx = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.txHash);
    setCopied(true);
    soundFx.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    soundFx.playClick();
    setReceipt(null);
    setIsProcessing(false);
    onClose();
  };

  // Determine submit button error reason if blocked
  const getBlockReason = () => {
    if (!eligibility.isLevelMet) return `Level 9 (Lord) Required (Currently Lvl ${eligibility.playerLevel})`;
    if (!eligibility.isPphMet)
      return `Upgrade All PPH to Lvl 5 (${eligibility.pphCardsMetCount}/${eligibility.pphCardsTotal} Complete)`;
    if (reserveBalance < MIN_WITHDRAWAL_THRESHOLD)
      return `Min $${MIN_WITHDRAWAL_THRESHOLD} Reserve Required (Have $${reserveBalance.toFixed(2)})`;
    if (!eligibility.isPointsMet)
      return `Over 100M Points Required (${(coins / 1000000).toFixed(1)}M / 100M)`;
    if (withdrawAmount < MIN_WITHDRAWAL_THRESHOLD)
      return `Minimum Withdrawal is $${MIN_WITHDRAWAL_THRESHOLD}.00 USD`;
    if (withdrawAmount > reserveBalance) return `Amount Exceeds Reserve Balance`;
    if (!hasEnoughKeys)
      return `Insufficient Keys (${playerKeys}/${keyFee} 🔑 Required)`;
    if (!isValidAddress) return `Enter Valid Crypto Address`;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d131f] border-2 border-emerald-500/70 shadow-[0_0_60px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-black border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-emerald-300 tracking-wider font-['Rajdhani',sans-serif]">
                  SECRET $ RESERVE VAULT
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-[9px] font-bold text-emerald-200">
                  INSTANT
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Direct Crypto Liquidity Withdrawal Portal</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Optimized scroll view */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto">
          {receipt ? (
            /* Successful Withdrawal Receipt */
            <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  WITHDRAWAL DISPATCHED
                </span>
                <div className="text-3xl font-black text-white font-['Rajdhani',sans-serif] mt-0.5">
                  ${receipt.amount.toFixed(2)} USD
                </div>
                <p className="text-xs text-slate-400 mt-1">Sent to {receipt.net}</p>
              </div>

              {/* Transaction Hash & Fee Card */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Destination Address:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[180px]">
                    {receipt.address}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Withdrawal Key Fee:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1 font-['Rajdhani',sans-serif]">
                    <span>🔑 -{receipt.keyFee.toLocaleString()} Keys</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Remaining Keys:</span>
                  <span className="font-bold text-slate-200 font-['Rajdhani',sans-serif]">
                    {receipt.remainingKeys.toLocaleString()} Keys
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Transaction Hash:</span>
                  <button
                    onClick={handleCopyTx}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-[11px]"
                  >
                    <span>{receipt.txHash.slice(0, 14)}...</span>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-white/5">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    CONFIRMED (BLOCKCHAIN)
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {onViewHistory && (
                  <button
                    id="btn-receipt-view-history"
                    onClick={() => {
                      handleClose();
                      onViewHistory();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View In Withdrawal History</span>
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dual Reserve & Keys Balance Display Card */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-black border border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reserve Vault
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white font-['Rajdhani',sans-serif] flex items-center gap-0.5 mt-0.5">
                    <span className="text-emerald-400">$</span>
                    <span>{reserveBalance.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">USD</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-black border border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.08)]">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your Keys
                  </span>
                  <div className="text-lg sm:text-xl font-black text-amber-300 font-['Rajdhani',sans-serif] flex items-center gap-1 mt-0.5">
                    <span className="text-sm">🔑</span>
                    <span>{playerKeys.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* WITHDRAWAL CRITERIA & QUALIFICATION STATUS CARD (Optimized to fit in) */}
              <div className="rounded-xl bg-black/60 border border-white/10 p-2.5 space-y-2">
                <div
                  onClick={() => setShowCriteriaDetails((prev) => !prev)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck
                      className={`w-4 h-4 ${
                        eligibility.allCriteriaMet ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani',sans-serif]">
                      Withdrawal Criteria ({eligibility.metCriteriaCount}/5 Met)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        eligibility.allCriteriaMet
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {eligibility.allCriteriaMet ? 'QUALIFIED' : 'ACTION REQUIRED'}
                    </span>
                    {showCriteriaDetails ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Always-visible compact status indicators row */}
                <div className="grid grid-cols-5 gap-1 pt-1 border-t border-white/5 text-[9px] font-mono text-center">
                  <div
                    className={`p-1 rounded ${
                      eligibility.isLevelMet
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/30 text-rose-300 border border-rose-500/20'
                    }`}
                    title="1. Level 9 (Lord) Required"
                  >
                    <div className="font-bold">1. Lvl 9</div>
                    <div className="text-[8px] opacity-80">{eligibility.isLevelMet ? '✓ Pass' : `${eligibility.playerLevel}/9`}</div>
                  </div>

                  <div
                    className={`p-1 rounded ${
                      eligibility.isPphMet
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/30 text-rose-300 border border-rose-500/20'
                    }`}
                    title="2. All PPH cards at Level 5"
                  >
                    <div className="font-bold">2. PPH L5</div>
                    <div className="text-[8px] opacity-80">{eligibility.isPphMet ? '✓ Pass' : `${eligibility.pphCardsMetCount}/9`}</div>
                  </div>

                  <div
                    className={`p-1 rounded ${
                      eligibility.isThresholdMet
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/30 text-rose-300 border border-rose-500/20'
                    }`}
                    title="3. $90 Minimum Threshold"
                  >
                    <div className="font-bold">3. $90 Min</div>
                    <div className="text-[8px] opacity-80">{eligibility.isThresholdMet ? '✓ Pass' : `$${reserveBalance.toFixed(0)}`}</div>
                  </div>

                  <div
                    className={`p-1 rounded ${
                      eligibility.isPointsMet
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/30 text-rose-300 border border-rose-500/20'
                    }`}
                    title="4. Points over 100M"
                  >
                    <div className="font-bold">4. 100M Pts</div>
                    <div className="text-[8px] opacity-80">{eligibility.isPointsMet ? '✓ Pass' : `${(coins / 1000000).toFixed(0)}M`}</div>
                  </div>

                  <div
                    className={`p-1 rounded ${
                      hasEnoughKeys
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-950/30 text-amber-300 border border-amber-500/20'
                    }`}
                    title="5. Key ratio: 6 Keys per $1"
                  >
                    <div className="font-bold">5. Keys</div>
                    <div className="text-[8px] opacity-80">{hasEnoughKeys ? '✓ Ready' : `${playerKeys}/${keyFee}`}</div>
                  </div>
                </div>

                {/* Expanded Criteria Breakdown Details (Collapsible to preserve compact view) */}
                {showCriteriaDetails && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        1. Player Level 9 (Lord):
                      </span>
                      <span
                        className={`font-bold ${
                          eligibility.isLevelMet ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {eligibility.isLevelMet
                          ? `✓ Level ${eligibility.playerLevel} (${eligibility.tierName})`
                          : `✗ Level ${eligibility.playerLevel} / 9 (Lord)`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        2. All Mine PPH at Level 5+:
                      </span>
                      <span
                        className={`font-bold ${
                          eligibility.isPphMet ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {eligibility.isPphMet
                          ? `✓ All 9 Cards at Lvl 5+`
                          : `✗ ${eligibility.pphCardsMetCount} / ${eligibility.pphCardsTotal} Cards at Lvl 5`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        3. $ Withdrawal Threshold ($90):
                      </span>
                      <span
                        className={`font-bold ${
                          eligibility.isThresholdMet ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {eligibility.isThresholdMet
                          ? `✓ $${reserveBalance.toFixed(2)} USD`
                          : `✗ $${reserveBalance.toFixed(2)} / $90.00 min`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        4. Point Balance Over 100M:
                      </span>
                      <span
                        className={`font-bold ${
                          eligibility.isPointsMet ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {eligibility.isPointsMet
                          ? `✓ ${(coins / 1000000).toFixed(1)}M Points`
                          : `✗ ${(coins / 1000000).toFixed(1)}M / 100M Points`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        5. Key Rule & Ratio (6 Keys / $1):
                      </span>
                      <span
                        className={`font-bold ${
                          hasEnoughKeys ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {hasEnoughKeys
                          ? `✓ ${playerKeys.toLocaleString()} / ${keyFee} Keys Ready`
                          : `✗ Need ${(keyFee - playerKeys).toLocaleString()} more keys`}
                      </span>
                    </div>

                    {!eligibility.isPphMet && onGoToMine && (
                      <div className="pt-1.5 text-right">
                        <button
                          onClick={() => {
                            handleClose();
                            onGoToMine();
                          }}
                          className="text-amber-400 hover:text-amber-300 text-[10px] font-bold underline cursor-pointer"
                        >
                          Go to Mine to upgrade PPH cards →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Crypto Network Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Select Payout Network</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Zero Gas Fee</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedNet(net);
                      }}
                      className={`p-2 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        selectedNet.id === net.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-200 truncate">{net.name}</span>
                      <span className="text-[9px] text-slate-400">{net.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crypto Wallet Address Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Destination Crypto Address</span>
                  <button
                    onClick={handlePasteAddress}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Paste
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={`Enter your ${selectedNet.name} address`}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-emerald-400 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400 tracking-wider placeholder:text-slate-600 placeholder:font-sans"
                  />
                  <Wallet className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Amount Input with $90 Minimum Threshold */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Withdrawal Amount ($ USD)</span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    Threshold: ${MIN_WITHDRAWAL_THRESHOLD}.00 min
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    max={reserveBalance}
                    min={MIN_WITHDRAWAL_THRESHOLD}
                    step={1}
                    placeholder="90.00"
                    className="w-full pl-7 pr-14 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-emerald-400 text-white font-['Rajdhani',sans-serif] font-bold text-base focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <button
                    onClick={handleMax}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Key Charge Breakdown Card (Ratio unchanged: 6 keys / $1.00) */}
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase font-['Rajdhani',sans-serif]">
                      Withdrawal Key Fee (Ratio Unchanged)
                    </span>
                  </div>
                  <span className="font-['Rajdhani',sans-serif] font-extrabold text-amber-300 text-sm">
                    {keyFee.toLocaleString()} Keys
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Rate: $5.00 = 30 Keys (6 Keys / $1.00 USD)</span>
                  <span className="text-amber-400/80 font-mono">
                    Balance: {playerKeys.toLocaleString()} Keys {hasEnoughKeys ? '✓' : `(Need ${(keyFee - playerKeys).toLocaleString()} more)`}
                  </span>
                </div>
              </div>

              {/* Submit Action or Status Blocker Reason */}
              <div className="pt-1">
                {getBlockReason() && (
                  <div className="mb-2 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-[11px] text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{getBlockReason()}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmitWithdraw}
                  disabled={!canSubmit}
                  className={`w-full py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                    !canSubmit
                      ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Processing Blockchain Dispatch...</span>
                    </>
                  ) : !canSubmit ? (
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Criteria Incomplete ({eligibility.metCriteriaCount}/5 Met)</span>
                    </div>
                  ) : (
                    <>
                      <span>Confirm & Withdraw (-{keyFee.toLocaleString()} Keys)</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
