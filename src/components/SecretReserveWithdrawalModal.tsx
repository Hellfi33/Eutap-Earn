import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck, Wallet, X, Copy, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SecretReserveWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserveBalance: number;
  onWithdraw: (amount: number) => void;
}

const NETWORKS = [
  { id: 'usdt_trc20', name: 'USDT (TRC-20)', badge: 'Tron Network', min: 10 },
  { id: 'usdt_ton', name: 'USDT (TON)', badge: 'TON Jetton', min: 5 },
  { id: 'usdt_erc20', name: 'USDT (ERC-20)', badge: 'Ethereum', min: 20 },
  { id: 'ton', name: 'TON (Native)', badge: 'Telegram TON', min: 5 },
  { id: 'sol', name: 'SOL (Solana)', badge: 'Solana Network', min: 10 },
  { id: 'btc', name: 'BTC (Bitcoin)', badge: 'Bitcoin Core', min: 25 },
];

export const SecretReserveWithdrawalModal: React.FC<SecretReserveWithdrawalModalProps> = ({
  isOpen,
  onClose,
  reserveBalance,
  onWithdraw,
}) => {
  const [selectedNet, setSelectedNet] = useState(NETWORKS[0]);
  const [walletAddress, setWalletAddress] = useState('');
  const [amountStr, setAmountStr] = useState(reserveBalance > 0 ? reserveBalance.toString() : '50');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ txHash: string; amount: number; net: string; address: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const withdrawAmount = parseFloat(amountStr) || 0;
  const isValidAmount = withdrawAmount > 0 && withdrawAmount <= reserveBalance;
  const isValidAddress = walletAddress.trim().length >= 10;

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
    if (!isValidAmount || !isValidAddress || isProcessing) return;

    soundFx.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      soundFx.playReward();
      const mockTx = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      onWithdraw(withdrawAmount);
      setReceipt({
        txHash: mockTx,
        amount: withdrawAmount,
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

              {/* Transaction Hash Card */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Destination Address:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[180px]">
                    {receipt.address}
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
                <div className="flex items-center justify-between text-slate-400">
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
              {/* Reserve Balance Display Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-black border border-emerald-500/40 flex items-center justify-between shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Available Reserve Vault
                  </span>
                  <div className="text-2xl font-black text-white font-['Rajdhani',sans-serif] flex items-center gap-1">
                    <span className="text-emerald-400">$</span>
                    <span>{reserveBalance.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-normal ml-1">USD</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified 100%</span>
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

              {/* Submit Action */}
              <button
                onClick={handleSubmitWithdraw}
                disabled={!isValidAmount || !isValidAddress || isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Processing Blockchain Dispatch...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Withdraw</span>
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
