import React, { useState } from 'react';
import { X, Wallet, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
  walletProvider: string | null;
  onConnectWallet: (provider: string, address: string) => void;
  onDisconnectWallet: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  walletConnected,
  walletAddress,
  walletProvider,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  if (!isOpen) return null;

  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const WALLET_OPTIONS = [
    {
      id: 'Tonkeeper',
      name: 'Tonkeeper',
      chain: 'TON Network',
      color: '#0088CC',
      prefix: 'UQD',
      desc: 'Most popular TON ecosystem wallet',
    },
    {
      id: 'Telegram Wallet',
      name: 'Telegram Wallet (@wallet)',
      chain: 'TON Network',
      color: '#2AABEE',
      prefix: 'EQB',
      desc: 'Built directly inside Telegram app',
    },
    {
      id: 'MetaMask',
      name: 'MetaMask',
      chain: 'EVM / L2 Networks',
      color: '#E2761B',
      prefix: '0x',
      desc: 'Ethereum, BNB Chain & Arbitrum',
    },
    {
      id: 'Phantom',
      name: 'Phantom',
      chain: 'Solana & Multi-chain',
      color: '#AB9FF2',
      prefix: '',
      desc: 'Solana web3 wallet',
    },
    {
      id: 'OKX Wallet',
      name: 'OKX Web3 Wallet',
      chain: 'Multi-chain',
      color: '#FFFFFF',
      prefix: '0x',
      desc: 'Decentralized exchange wallet',
    },
  ];

  const handleSelectWallet = (wallet: typeof WALLET_OPTIONS[0]) => {
    soundFx.playClick();
    setConnectingProvider(wallet.id);

    // Realistic Web3 connection simulation
    setTimeout(() => {
      let randomHex = '';
      if (wallet.prefix === '0x') {
        randomHex = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      } else if (wallet.prefix) {
        randomHex = wallet.prefix + Array.from({ length: 45 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
      } else {
        randomHex = Array.from({ length: 44 }, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('');
      }

      soundFx.playReward();
      setConnectingProvider(null);
      onConnectWallet(wallet.id, randomHex);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141923] border border-white/10 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Connect Web3 Wallet</h3>
            <span className="text-xs text-slate-400">For $EUTAP Airdrop Snapshot</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Link your non-custodial wallet address to guarantee inclusion in the upcoming TGE allocation snapshot.
        </p>

        {/* Current status */}
        {walletConnected && walletAddress ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Connected via {walletProvider}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="font-mono text-xs text-slate-200 bg-black/40 px-3 py-2 rounded-xl break-all">
              {walletAddress}
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onDisconnectWallet();
              }}
              className="mt-1 text-xs text-rose-400 hover:text-rose-300 font-bold self-end"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : null}

        {/* Wallet Choices */}
        <div className="space-y-2">
          {WALLET_OPTIONS.map((wallet) => {
            const isSelected = walletConnected && walletProvider === wallet.id;
            const isConnecting = connectingProvider === wallet.id;

            return (
              <button
                key={wallet.id}
                id={`wallet-opt-${wallet.id.toLowerCase().replace(/\s+/g, '-')}`}
                disabled={isConnecting}
                onClick={() => handleSelectWallet(wallet)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-[#1a202c] hover:bg-[#222b3b] border-white/5 hover:border-white/20 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow"
                    style={{ backgroundColor: `${wallet.color}22`, color: wallet.color }}
                  >
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold">{wallet.name}</h4>
                    <span className="text-[10px] text-slate-400 block">{wallet.chain}</span>
                  </div>
                </div>

                {isConnecting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                ) : isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
