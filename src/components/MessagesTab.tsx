import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  Sparkles,
  Radio,
  RefreshCw,
  Edit3,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { PlatformMessage, UserProfile } from '../types';
import { soundFx } from '../utils/audio';

interface MessagesTabProps {
  messages: PlatformMessage[];
  currentProfile: UserProfile;
  onSendMessage: (text: string) => void;
  onOpenProfileModal: () => void;
  onRefreshMessages?: () => void;
  playerLevel: number;
  playerStage: number;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  messages,
  currentProfile,
  onSendMessage,
  onOpenProfileModal,
  onRefreshMessages,
  playerLevel,
  playerStage,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectedUser, setInspectedUser] = useState<PlatformMessage | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    soundFx.playMessageSent();
    soundFx.triggerHaptic(15);
    onSendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRefresh = async () => {
    if (onRefreshMessages) {
      soundFx.playClick();
      setIsRefreshing(true);
      await onRefreshMessages();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return (
      date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      soundFx.playReward();
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const QUICK_PLATFORM_PROMPTS = [
    '👋 Greetings from ' + currentProfile.userId + '!',
    '🚀 Stage ' + playerStage + ' grinder reporting in!',
    '🎲 Anyone rolling high on Dice Arena?',
    '🥚 White Hen eggs ready to hatch!',
    '🔥 Level ' + playerLevel + ' pushing for snapshot!',
  ];

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-white select-none relative overflow-hidden">
      {/* Top Header: Identity & Live Channel Bar */}
      <div className="px-3 py-2 bg-[#090d16] border-b border-white/10 shrink-0 shadow-md flex flex-col gap-1.5 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-white tracking-wide font-['Rajdhani',sans-serif] uppercase">
                  PLATFORM MESSAGES
                </h2>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[8px] font-bold border border-cyan-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[9px] text-slate-400">
                Anyone on the platform who sends a message notifies everyone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition ${
                isRefreshing ? 'animate-spin text-cyan-400' : ''
              }`}
              title="Refresh platform feed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Personalized User ID Bar */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#111624] border border-cyan-500/30 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentProfile.avatarColor} flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow`}
            >
              {(currentProfile.username || currentProfile.userId).substring(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[10px] text-slate-400">Your ID:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(currentProfile.userId)}
                className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-black border border-cyan-400/30 hover:bg-cyan-400/30 transition flex items-center gap-0.5"
                title="Click to copy User ID"
              >
                <span>{currentProfile.userId}</span>
                {copiedId === currentProfile.userId ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                )}
              </button>
              <span className="text-[10px] font-bold text-white truncate max-w-[90px]">
                {currentProfile.username}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenProfileModal();
            }}
            className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[9px] font-bold flex items-center gap-1 transition shrink-0 active:scale-95"
          >
            <Edit3 className="w-3 h-3" />
            <span>Personalize</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 select-text">
        {/* Stream Banner */}
        <div className="text-center py-1">
          <span className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] text-slate-500 font-medium inline-flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-cyan-400" /> Real-time broadcast • All platform players
          </span>
        </div>

        {/* Empty State: No Mockups */}
        {messages.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-600 mb-3 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-300">No Messages Yet</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              All mockup profiles and messages have been cleared. Be the first to broadcast a message
              to everyone on the platform with your User ID!
            </p>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setInputText(`Hello everyone! Playing with User ID ${currentProfile.userId} 🚀`);
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcast Hello</span>
            </button>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              msg.isSelf ||
              msg.userId === currentProfile.userId ||
              (msg.userId === '#EU-USER' && msg.username === currentProfile.username);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender ID & Meta Bar */}
                <div className="flex items-center gap-1.5 px-1 mb-1 text-[9px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setInspectedUser(msg);
                    }}
                    className="hover:underline flex items-center gap-1 font-mono font-bold text-cyan-300"
                    title="View player profile"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded bg-gradient-to-br ${
                        msg.avatarColor || 'from-cyan-500 to-blue-600'
                      } inline-flex items-center justify-center text-[7px] text-white`}
                    >
                      {msg.username.charAt(0).toUpperCase()}
                    </span>
                    <span>{msg.userId || '#EU-USER'}</span>
                  </button>

                  <span className="font-semibold text-slate-200 truncate max-w-[100px]">
                    {isMe ? 'You' : msg.username}
                  </span>

                  <span className="px-1 py-0.2 rounded bg-white/10 text-slate-300 text-[8px] font-mono">
                    Lv.{msg.userLevel}
                  </span>

                  {msg.userStage && (
                    <span className="px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[8px] font-bold">
                      S{msg.userStage}
                    </span>
                  )}

                  <span>•</span>
                  <span className="text-slate-500 text-[8px]">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-md transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-[#101522] text-slate-200 rounded-tl-none border border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-2 py-1 bg-[#090d15] border-t border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_PLATFORM_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              soundFx.playClick();
              setInputText(prompt);
            }}
            className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-300 text-[10px] text-slate-400 border border-white/10 hover:border-cyan-400/40 whitespace-nowrap transition shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input & Send Bar */}
      <div className="p-2.5 bg-[#0a0e17] border-t border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            id="platform-message-input"
            type="text"
            value={inputText}
            maxLength={250}
            placeholder={`Broadcast message as ${currentProfile.userId}...`}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#101522] border border-white/10 focus:border-cyan-400/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition shadow-inner"
          />
          <button
            id="platform-send-btn"
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center shrink-0 ${
              inputText.trim()
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer active:scale-95'
                : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
            }`}
            title="Broadcast Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 px-1 text-[9px] text-slate-500 font-mono">
          <span>Sends live notification to everyone on platform</span>
          <span>{inputText.length}/250</span>
        </div>
      </div>

      {/* User Info Popover Modal */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#0b0f19] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
                Player Profile
              </span>
              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  inspectedUser.avatarColor || 'from-cyan-500 to-blue-600'
                } flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}
              >
                {inspectedUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {inspectedUser.username}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inspectedUser.userId)}
                  className="mt-0.5 px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-black border border-cyan-400/30 flex items-center gap-1"
                >
                  <span>{inspectedUser.userId}</span>
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-slate-500 block">Level</span>
                <span className="text-amber-400 font-bold text-xs">
                  Lv.{inspectedUser.userLevel}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-slate-500 block">Stage</span>
                <span className="text-cyan-400 font-bold text-xs">
                  Stage {inspectedUser.userStage || 1}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setInputText(`@${inspectedUser.userId} `);
                setInspectedUser(null);
              }}
              className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Mention @{inspectedUser.userId}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
