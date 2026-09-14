import React from 'react';
import { Zap, Sparkles, CheckCircle2, ChevronRight, Layers, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface StageEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: number;
}

export const StageEvolutionModal: React.FC<StageEvolutionModalProps> = ({
  isOpen,
  onClose,
  stage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b081c] border-2 border-cyan-400/80 shadow-[0_0_80px_rgba(6,182,212,0.5)] overflow-hidden flex flex-col items-center p-6 text-center">
        {/* Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Badge Icon */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-[0_0_30px_rgba(6,182,212,0.6)] mb-4 animate-bounce">
          <div className="w-full h-full rounded-2xl bg-[#090616] flex items-center justify-center">
            <Zap className="w-10 h-10 text-cyan-400 fill-cyan-400" />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-widest uppercase mb-2">
          SYSTEM UPGRADE COMPLETE
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Rajdhani',sans-serif] tracking-wider mb-2">
          STAGE II: QUANTUM NEXUS
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed max-w-sm mb-5">
          The core matrix has evolved! All game interfaces, themes, and badges have ascended to the Quantum Cyber spectrum.
        </p>

        {/* Feature Highlights */}
        <div className="w-full space-y-2 mb-6 text-left">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-cyan-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Expanded to 30 Progressive Levels</div>
              <div className="text-[10px] text-slate-400">Unlock Quantum Core through EuTap Quantum Zenith</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-purple-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Upgraded Quantum Cyber Color Scheme</div>
              <div className="text-[10px] text-slate-400">Deep obsidian violet canvas with neon cyan auras</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundFx.playReward();
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition active:scale-95"
        >
          <span>ENTER QUANTUM NEXUS</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
