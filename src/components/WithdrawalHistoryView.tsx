import React, { useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  Key,
  ShieldCheck,
  Wallet,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { WithdrawalTransaction, WithdrawalStatus } from '../types';
import { soundFx } from '../utils/audio';

interface WithdrawalHistoryViewProps {
  onBack: () => void;
  withdrawals: WithdrawalTransaction[];
  reserveBalance: number;
  playerKeys: number;
  onSpeedUpTx?: (txId: string) => void;
  onCancelTx?: (txId: string) => void;
}

export const WithdrawalHistoryView: React.FC<WithdrawalHistoryViewProps> = ({
  onBack,
  withdrawals = [],
  reserveBalance = 0,
  playerKeys = 0,
  onSpeedUpTx,
  onCancelTx,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'successful' | 'pending' | 'failed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const successfulCount = withdrawals.filter((w) => w.status === 'successful').length;
  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const failedCount = withdrawals.filter((w) => w.status === 'failed').length;

  const totalWithdrawnAmount = withdrawals
    .filter((w) => w.status === 'successful')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const filteredWithdrawals = withdrawals.filter((tx) => {
    if (activeFilter === 'all') return true;
    return tx.status === activeFilter;
  });

  const handleCopy = (text: string, id: string) => {
    soundFx.playClick();
    soundFx.triggerHaptic(15);
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleRefresh = () => {
    soundFx.playClick();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      soundFx.playReward();
    }, 700);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatShortAddress = (addr: string) => {
    if (!addr || addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col px-3.5 pt-2 pb-24 max-w-md mx-auto select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-3 py-1 border-b border-white/5">
        <button
          id="btn-back-to-airdrop"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition active:scale-95 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Airdrop</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-withdrawals"
            onClick={handleRefresh}
            title="Refresh transaction status"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition active:scale-95 border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title & Page Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-white font-['Rajdhani',sans-serif] tracking-wide uppercase">
            Withdrawal History
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
            LIVE LEDGER
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time on-chain transaction logs and status tracking
        </p>
      </div>

      {/* Financial Metrics Summary Banner */}
      <div className="grid grid-cols-3 gap-2 mb-3.5">
        <div className="bg-[#141923] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Settled</span>
          <div className="text-sm font-black text-emerald-400 font-mono mt-1">
            ${totalWithdrawnAmount.toFixed(2)}
          </div>
          <span className="text-[9px] text-slate-500 font-medium mt-0.5">Successful payouts</span>
        </div>

        <div className="bg-[#141923] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Txs</span>
          <div className="text-sm font-black text-amber-400 font-mono mt-1 flex items-center gap-1">
            <span>{pendingCount}</span>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <span className="text-[9px] text-slate-500 font-medium mt-0.5">Awaiting blocks</span>
        </div>

        <div className="bg-[#141923] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400">Available USD</span>
          <div className="text-sm font-black text-white font-mono mt-1">
            ${reserveBalance.toFixed(2)}
          </div>
          <span className="text-[9px] text-amber-400 font-medium mt-0.5">{playerKeys} Keys</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#10141e] border border-white/10 rounded-xl mb-3.5">
        <button
          id="btn-filter-all"
          onClick={() => {
            soundFx.playClick();
            setActiveFilter('all');
          }}
          className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeFilter === 'all'
              ? 'bg-[#222a3d] text-white shadow-sm border border-white/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All</span>
          <span className="font-mono text-[10px] opacity-75">({withdrawals.length})</span>
        </button>

        <button
          id="btn-filter-successful"
          onClick={() => {
            soundFx.playClick();
            setActiveFilter('successful');
          }}
          className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeFilter === 'successful'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Success</span>
          <span className="font-mono text-[10px] opacity-75">({successfulCount})</span>
        </button>

        <button
          id="btn-filter-pending"
          onClick={() => {
            soundFx.playClick();
            setActiveFilter('pending');
          }}
          className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeFilter === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Pending</span>
          <span className="font-mono text-[10px] opacity-75">({pendingCount})</span>
        </button>

        <button
          id="btn-filter-failed"
          onClick={() => {
            soundFx.playClick();
            setActiveFilter('failed');
          }}
          className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeFilter === 'failed'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <XCircle className="w-3 h-3 text-rose-400" />
          <span>Failed</span>
          <span className="font-mono text-[10px] opacity-75">({failedCount})</span>
        </button>
      </div>

      {/* Transactions List or Clean Zero-Mock Empty State */}
      {filteredWithdrawals.length === 0 ? (
        <div className="bg-[#121622] border border-white/10 rounded-2xl p-6 text-center shadow-lg my-2 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
            <Clock className="w-7 h-7 text-amber-400/80" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            {activeFilter === 'all'
              ? 'No Withdrawal Records Yet'
              : `No ${activeFilter.toUpperCase()} Transactions`}
          </h3>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
            {activeFilter === 'all'
              ? 'You have not initiated any withdrawals yet. From now, every withdrawal you submit will be recorded and displayed here with real-time on-chain status tracking.'
              : `There are currently no transactions marked as ${activeFilter}.`}
          </p>

          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Withdrawals are recorded and displayed here with live blockchain status tracking.</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredWithdrawals.map((tx) => {
            const isSuccess = tx.status === 'successful';
            const isPending = tx.status === 'pending';
            const isFailed = tx.status === 'failed';

            return (
              <div
                key={tx.id}
                id={`tx-card-${tx.id}`}
                className={`bg-[#141923] border rounded-2xl p-4 shadow-lg transition-all ${
                  isSuccess
                    ? 'border-emerald-500/30'
                    : isPending
                    ? 'border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                    : 'border-rose-500/30'
                }`}
              >
                {/* Transaction Header: Status & Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    {isSuccess && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        SUCCESSFUL
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wide">
                        <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                        PENDING
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 border border-rose-500/30 text-rose-300 uppercase tracking-wide">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        FAILED
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {tx.network}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(tx.timestamp)}
                  </span>
                </div>

                {/* Amount, Network and Fee */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                    <span
                      className={`text-lg font-black font-mono tracking-tight ${
                        isSuccess ? 'text-emerald-400' : isPending ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      -${tx.amount.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Network Fee</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono justify-end">
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>-{tx.keyFee.toLocaleString()} Keys</span>
                    </div>
                  </div>
                </div>

                {/* Details Box: Destination & TxHash */}
                <div className="bg-[#0e121a] rounded-xl p-2.5 border border-white/5 space-y-2 mb-2 text-xs">
                  {/* Destination Address */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                      <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-medium">To:</span>
                      <span className="text-[11px] font-mono text-slate-200 truncate">
                        {formatShortAddress(tx.destinationAddress)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(tx.destinationAddress, `addr-${tx.id}`)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition"
                      title="Copy full address"
                    >
                      {copiedId === `addr-${tx.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Transaction Hash */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-medium">Tx:</span>
                      <span className="text-[11px] font-mono text-amber-300/90 truncate">
                        {tx.txHash ? `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-6)}` : 'Generating...'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(tx.txHash, `hash-${tx.id}`)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition"
                      title="Copy Tx Hash"
                    >
                      {copiedId === `hash-${tx.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Message / Note */}
                <div className="flex items-start gap-1.5 px-1 pt-1 text-[11px] text-slate-400 leading-tight">
                  <div className="mt-0.5">
                    {isSuccess && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                    {isFailed && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                  </div>
                  <span>
                    {tx.statusMessage ||
                      (isSuccess
                        ? 'Confirmed on-chain with 12/12 block confirmations.'
                        : isPending
                        ? 'Broadcasting to mempool. Awaiting validator signatures...'
                        : 'Transaction rejected or reverted by validator. Funds refunded.')}
                  </span>
                </div>

                {/* Actions for Pending Tx */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/5">
                    {onSpeedUpTx && (
                      <button
                        id={`btn-speed-tx-${tx.id}`}
                        onClick={() => {
                          soundFx.playClick();
                          onSpeedUpTx(tx.id);
                        }}
                        className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition active:scale-95 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Confirm On-Chain</span>
                      </button>
                    )}
                    {onCancelTx && (
                      <button
                        id={`btn-cancel-tx-${tx.id}`}
                        onClick={() => {
                          soundFx.playClick();
                          onCancelTx(tx.id);
                        }}
                        className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition active:scale-95"
                      >
                        Cancel & Refund
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
