import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck, Wallet, X, Copy, Check, Key, AlertTriangle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SecretReserveWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance: number;
  playerKeys: number;
  onWithdraw: (amount: number, keyFee: number, address: string, network: string) => void;
}

const NETWORKS = [
  { id: 'usdt_trc20', name: 'USDT (TRC-20)', badge: 'Tron Network', min: 10 },
  { id: 'usdt_ton', name: 'USDT (TON)', badge: 'TON Jetton', min: 5 },
  { id: 'usdt_erc20', name: 'USDT (ERC-20)', badge: 'Ethereum', min: 20 },
  { id: 'ton', name: 'TON (Native)', badge: 'Telegram TON', min: 5 },
  { id: 'sol', name: 'SOL (Solana)', badge: 'Solana Network', min: 10 },
  { id: 'btc', name: 'BTC (Bitcoin)', badge: 'Bitcoin Core', min: 25 },
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
  onWithdraw,
}) => {
  const [selectedNet, setSelectedNet] = useState(NETWORKS[0]);
  const [walletAddress, setWalletAddress] = useState('');
  const [amountStr, setAmountStr] = useState(reserveBalance > 0 ? Math.min(reserveBalance, 50).toString() : '0');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const withdrawAmount = parseFloat(amountStr) || 0;
  const keyFee = calculateWithdrawalKeyFee(withdrawAmount);
  const hasEnoughKeys = playerKeys >= keyFee;
  const isValidAmount = withdrawAmount > 0 && withdrawAmount <= reserveBalance;
  const isValidAddress = walletAddress.trim().length >= 10;
  const canSubmit = isValidAmount && isValidAddress && hasEnoughKeys && !isProcessing;

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
      const mockTx = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      onWithdraw(withdrawAmount, keyFee, walletAddress.trim(), selectedNet.name);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d131f] border-2 border-emerald-500/70 shadow-[0_0_60px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-black border-b border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-emerald-300 tracking-wider font-['Rajdhani',sans-serif]">
                  SECRET $ RESERVE VAULT
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-[9px] font-bold text-emerald-200">
                  INSTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Direct Crypto Liquidity Withdrawal Portal</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Dual Reserve & Keys Balance Display Card */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-black border border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reserve Vault
                  </span>
                  <div className="text-xl font-black text-white font-['Rajdhani',sans-serif] flex items-center gap-0.5 mt-0.5">
                    <span className="text-emerald-400">$</span>
                    <span>{reserveBalance.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">USD</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-black border border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.08)]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your Keys
                  </span>
                  <div className="text-xl font-black text-amber-300 font-['Rajdhani',sans-serif] flex items-center gap-1 mt-0.5">
                    <span className="text-base">🔑</span>
                    <span>{playerKeys.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Crypto Network Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Select Payout Network</span>
                  <span className="text-[11px] text-emerald-400 font-normal">Zero Gas Fee</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedNet(net);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col ${
                        selectedNet.id === net.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-200">{net.name}</span>
                      <span className="text-[10px] text-slate-400">{net.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crypto Wallet Address Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Destination Crypto Address</span>
                  <button
                    onClick={handlePasteAddress}
                    className="text-[11px] text-emerald-400 hover:underline"
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
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-emerald-400 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400 tracking-wider placeholder:text-slate-600 placeholder:font-sans"
                  />
                  <Wallet className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Amount Input with MAX button */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Withdrawal Amount ($ USD)</span>
                  <span className="text-[11px] text-slate-400">Min: $1.00</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    max={reserveBalance}
                    min={1}
                    step={1}
                    placeholder="0.00"
                    className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-emerald-400 text-white font-['Rajdhani',sans-serif] font-bold text-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <button
                    onClick={handleMax}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 transition"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Key Charge Breakdown Card */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 tracking-wide uppercase font-['Rajdhani',sans-serif]">
                      Withdrawal Key Fee
                    </span>
                  </div>
                  <span className="font-['Rajdhani',sans-serif] font-extrabold text-amber-300 text-sm">
                    {keyFee.toLocaleString()} Keys
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Rate: $5.00 = 30 Keys (6 Keys / $1)
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    Min 30 • Max 10,000
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Your Key Balance:</span>
                  <span className={`font-bold font-['Rajdhani',sans-serif] ${hasEnoughKeys ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {playerKeys.toLocaleString()} Keys {hasEnoughKeys ? '✓' : `(Need ${(keyFee - playerKeys).toLocaleString()} more)`}
                  </span>
                </div>

                {!hasEnoughKeys && (
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-start gap-2 text-[11px] text-rose-300 leading-tight">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      Insufficient keys. This ${withdrawAmount.toFixed(2)} withdrawal requires {keyFee.toLocaleString()} Keys. You have {playerKeys.toLocaleString()} Keys.
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <button
                onClick={handleSubmitWithdraw}
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_25px_rgba(16,185,129,0.35)] ${
                  !hasEnoughKeys && isValidAmount && isValidAddress
                    ? 'bg-rose-900/60 border border-rose-500/40 text-rose-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black disabled:opacity-40'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Processing Blockchain Dispatch...</span>
                  </>
                ) : !hasEnoughKeys && isValidAmount && isValidAddress ? (
                  <>
                    <span>Insufficient Keys ({playerKeys}/{keyFee} 🗝️)</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Withdraw (-{keyFee.toLocaleString()} Keys)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
