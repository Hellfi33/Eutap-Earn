import React from 'react';
import { SeasonalSkin } from '../types';

interface SeasonalArenaBackgroundProps {
  skin: SeasonalSkin;
}

export const SeasonalArenaBackground: React.FC<SeasonalArenaBackgroundProps> = ({ skin }) => {
  const { bgPattern, themeColor, secondaryColor, glowColor } = skin;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Base Gradient Atmosphere */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${skin.bgGradient} transition-colors duration-700`}
      />

      {/* 2. Top Ambient Spotlight */}
      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[340px] h-[220px] rounded-full blur-3xl opacity-35 transition-all duration-700"
        style={{ background: themeColor }}
      />

      {/* 3. Center Radial Glow behind Mascot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full blur-2xl opacity-25 transition-all duration-700 animate-pulse"
        style={{ background: glowColor }}
      />

      {/* 4. Bottom Underglow */}
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[300px] h-[160px] rounded-full blur-3xl opacity-30 transition-all duration-700"
        style={{ background: secondaryColor }}
      />

      {/* 5. Distinct Pattern Design for Each Level Theme */}
      {/* Pattern: Cyber Skyline (e.g. Level 3 Cyber Chameleon - User's reference image) */}
      {bgPattern === 'cyber_skyline' && (
        <div className="absolute inset-0 opacity-40">
          {/* Cyber City Skyline Silhouette */}
          <div className="absolute bottom-16 left-0 right-0 h-44 flex items-end justify-between px-2 gap-1.5 opacity-60">
            <div className="w-8 h-32 bg-[#051824] border-t border-cyan-400/40 relative">
              <div className="absolute inset-1 grid grid-cols-2 gap-1 opacity-50">
                <span className="w-1 h-1 bg-cyan-300 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-300 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-300 rounded-xs" />
              </div>
            </div>
            <div className="w-12 h-44 bg-[#061d2d] border-t border-cyan-400/50 relative">
              <div className="absolute inset-1 grid grid-cols-3 gap-1 opacity-60">
                <span className="w-1 h-1 bg-cyan-200 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-200 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-200 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-200 rounded-xs" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
            <div className="w-10 h-36 bg-[#041521] border-t border-cyan-400/40 relative">
              <div className="absolute inset-1 grid grid-cols-2 gap-1 opacity-40">
                <span className="w-1 h-1 bg-cyan-300 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-300 rounded-xs" />
              </div>
            </div>
            <div className="w-14 h-40 bg-[#051c29] border-t border-cyan-400/50 relative">
              <div className="absolute inset-1 grid grid-cols-3 gap-1 opacity-50">
                <span className="w-1 h-1 bg-cyan-200 rounded-xs" />
                <span className="w-1 h-1 bg-cyan-200 rounded-xs" />
              </div>
            </div>
          </div>
          {/* Vertical Laser Light Pillars */}
          <div className="absolute inset-0 flex justify-around">
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent shadow-[0_0_8px_#06b6d4]" />
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent" />
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent shadow-[0_0_8px_#06b6d4]" />
          </div>
        </div>
      )}

      {/* Pattern: Gold Dust / Luxury Vault (Level 2 & 9) */}
      {(bgPattern === 'gold_dust' || bgPattern === 'imperial_gold') && (
        <div className="absolute inset-0 opacity-45">
          {/* Subtle Golden Geometric Diamond Lines */}
          <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gold-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="#ffd700" strokeWidth="0.75" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gold-grid)" />
          </svg>
          {/* Floating Gold Sparkle Particles */}
          <div className="absolute inset-0 flex items-center justify-around">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_#ffd700] animate-ping duration-1000" />
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#fef08a] animate-ping duration-700" />
          </div>
        </div>
      )}

      {/* Pattern: Copper Grid (Level 0) */}
      {bgPattern === 'copper_grid' && (
        <div className="absolute inset-0 opacity-25">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="copper-pat" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cd7f32" strokeWidth="0.8" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#copper-pat)" />
          </svg>
        </div>
      )}

      {/* Pattern: Silver Beams (Level 1) */}
      {bgPattern === 'silver_beams' && (
        <div className="absolute inset-0 opacity-30 flex justify-between px-6">
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-slate-300/40 to-transparent shadow-[0_0_6px_#fff]" />
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-slate-400/30 to-transparent" />
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-slate-300/40 to-transparent shadow-[0_0_6px_#fff]" />
        </div>
      )}

      {/* Pattern: Ice Crystals (Level 4) */}
      {bgPattern === 'ice_crystals' && (
        <div className="absolute inset-0 opacity-35">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ice-hex" width="48" height="48" patternUnits="userSpaceOnUse">
                <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="none" stroke="#b9f2ff" strokeWidth="0.8" opacity="0.35" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ice-hex)" />
          </svg>
        </div>
      )}

      {/* Pattern: Purple Nebula / Void Rift (Level 5 & 12) */}
      {(bgPattern === 'purple_nebula' || bgPattern === 'void_rift') && (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-60 h-60 rounded-full bg-purple-600/30 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-52 h-52 rounded-full bg-fuchsia-600/25 blur-3xl" />
        </div>
      )}

      {/* Pattern: Synthwave Retrowave Lines (Level 6) */}
      {bgPattern === 'synth_lines' && (
        <div className="absolute inset-0 opacity-30 flex flex-col justify-end">
          <div className="h-44 w-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(236,72,153,0.3)_100%)] flex flex-col justify-between">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-pink-400/50 shadow-[0_0_8px_#ec4899]" />
            ))}
          </div>
        </div>
      )}

      {/* Pattern: Solar Embers / Corona (Level 7 & 14) */}
      {(bgPattern === 'solar_embers' || bgPattern === 'solar_corona') && (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-orange-600/30 blur-3xl animate-pulse" />
          <div className="absolute inset-0 flex justify-around items-center">
            <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24] animate-pulse" />
          </div>
        </div>
      )}

      {/* Pattern: Crimson Matrix (Level 8) */}
      {bgPattern === 'crimson_matrix' && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-rose-500/30 rounded-full animate-ping duration-1000" />
        </div>
      )}

      {/* Pattern: Quantum Grid & Lightning (Level 10 & 11) */}
      {(bgPattern === 'quantum_grid' || bgPattern === 'titan_lightning') && (
        <div className="absolute inset-0 opacity-35">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="quantum-pat" width="36" height="36" patternUnits="userSpaceOnUse">
                <circle cx="18" cy="18" r="1.5" fill="#38bdf8" opacity="0.6" />
                <path d="M 0 18 L 36 18 M 18 0 L 18 36" stroke="#0284c7" strokeWidth="0.4" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#quantum-pat)" />
          </svg>
        </div>
      )}

      {/* Pattern: Emerald Matrix (Level 16) */}
      {bgPattern === 'emerald_matrix' && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        </div>
      )}

      {/* Pattern: Celestial Spiral & Transcendent Stars (Level 17 & 18) */}
      {(bgPattern === 'celestial_spiral' || bgPattern === 'transcendent_stars') && (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 rounded-full border border-teal-400/20 animate-[spin_30s_linear_infinite]" />
            <div className="w-64 h-64 rounded-full border border-teal-400/30 border-dashed animate-[spin_20s_linear_infinite]" />
          </div>
        </div>
      )}

      {/* Pattern: Sovereign Omniverse (Level 19 - Final Sovereign) */}
      {bgPattern === 'sovereign_omni' && (
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,121,249,0.25)_0%,transparent_70%)] animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[320px] h-[320px] rounded-full border border-fuchsia-400/40 border-dashed animate-[spin_10s_linear_infinite] shadow-[0_0_50px_rgba(232,121,249,0.4)]" />
          </div>
        </div>
      )}
    </div>
  );
};
