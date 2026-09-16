import React from 'react';
import { SeasonalSkin } from '../types';

interface SeasonalCharacterAccessoryProps {
  skin: SeasonalSkin;
}

export const SeasonalCharacterAccessory: React.FC<SeasonalCharacterAccessoryProps> = ({ skin }) => {
  const { accessory, suitAccentColor } = skin.characterVisuals;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex items-center justify-center">
      {/* 1. Cybernetic Monocle (User's reference image style - Level 3 Platinum / Cyber) */}
      {accessory === 'cyber_monocle' && (
        <div className="absolute inset-0">
          {/* Cyan High-Tech Monocle over left/right eye */}
          <div
            className="absolute top-[28%] right-[28%] w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.85)] flex items-center justify-center animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(3,105,161,0.6) 100%)',
            }}
          >
            {/* Crosshair reticle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-cyan-300/70" />
              <div className="h-full w-[1px] bg-cyan-300/70 absolute" />
              <div className="w-4 h-4 rounded-full border border-cyan-200/80 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
            </div>
            {/* Concentric optic ring */}
            <div className="absolute -inset-1 rounded-full border border-cyan-400/40 border-dashed animate-[spin_8s_linear_infinite]" />
          </div>

          {/* Glowing neon necktie / suit line */}
          <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-cyan-400 via-teal-500 to-transparent opacity-80 rounded-sm shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
        </div>
      )}

      {/* 2. Bronze Shades (Level 0) */}
      {accessory === 'bronze_shades' && (
        <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-28 h-8 flex items-center justify-center">
          <div className="relative flex items-center gap-2">
            {/* Left Lens */}
            <div className="w-10 h-7 rounded-xl bg-gradient-to-b from-[#78350f] to-[#1c1917] border-2 border-amber-600/80 shadow-[0_0_10px_rgba(205,127,50,0.5)]" />
            {/* Bridge */}
            <div className="w-4 h-1 bg-amber-500" />
            {/* Right Lens */}
            <div className="w-10 h-7 rounded-xl bg-gradient-to-b from-[#78350f] to-[#1c1917] border-2 border-amber-600/80 shadow-[0_0_10px_rgba(205,127,50,0.5)]" />
          </div>
        </div>
      )}

      {/* 3. Silver Earpiece (Level 1) */}
      {accessory === 'silver_earpiece' && (
        <div className="absolute top-[28%] right-[16%] w-7 h-10 flex flex-col items-center">
          <div className="w-5 h-7 rounded-lg bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 border border-white shadow-[0_0_12px_rgba(203,213,225,0.8)] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="w-1 h-5 bg-slate-300 -mt-1 rounded-full shadow" />
        </div>
      )}

      {/* 4. Gold Collar Pin & Royal Seal (Level 2 & Level 9) */}
      {(accessory === 'gold_collar_pin' || accessory === 'imperial_tiara') && (
        <div className="absolute inset-0">
          {/* Royal Crown or Tiara */}
          {accessory === 'imperial_tiara' && (
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce duration-1000">
              <div className="flex items-end gap-1">
                <div className="w-2.5 h-5 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-t-sm shadow-[0_0_10px_#facc15]" />
                <div className="w-3.5 h-7 bg-gradient-to-t from-amber-600 via-yellow-400 to-yellow-200 rounded-t-sm shadow-[0_0_15px_#facc15] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                </div>
                <div className="w-2.5 h-5 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-t-sm shadow-[0_0_10px_#facc15]" />
              </div>
              <div className="w-16 h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 rounded-full shadow-[0_0_10px_#fde047]" />
            </div>
          )}
          {/* Gold Glowing Lapel Accent */}
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 flex items-center gap-6">
            <div className="w-3 h-3 rotate-45 bg-yellow-400 border border-yellow-200 shadow-[0_0_12px_#eab308]" />
            <div className="w-3 h-3 rotate-45 bg-yellow-400 border border-yellow-200 shadow-[0_0_12px_#eab308]" />
          </div>
        </div>
      )}

      {/* 5. Diamond Visor (Level 4) */}
      {accessory === 'diamond_visor' && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-32 h-9 rounded-xl bg-gradient-to-r from-sky-400/30 via-cyan-200/50 to-sky-400/30 backdrop-blur-[2px] border-2 border-sky-300 shadow-[0_0_20px_rgba(185,242,255,0.9)] flex items-center justify-between px-2">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <div className="text-[9px] font-mono font-black text-sky-200 tracking-widest uppercase">
            DIAMOND OPTIC
          </div>
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
      )}

      {/* 6. Plasma Crown (Level 5) */}
      {accessory === 'plasma_crown' && (
        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-7 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7] -rotate-12 animate-pulse" />
            <div className="w-3 h-9 bg-purple-400 rounded-full shadow-[0_0_20px_#c084fc] animate-pulse" />
            <div className="w-2 h-7 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7] rotate-12 animate-pulse" />
          </div>
          <div className="w-20 h-1.5 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7]" />
        </div>
      )}

      {/* 7. Matrix HUD Synthwave (Level 6) */}
      {accessory === 'matrix_hud' && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-32 h-8 rounded-lg bg-pink-950/70 border border-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.8)] flex items-center justify-around px-2 overflow-hidden">
          <span className="text-[10px] font-mono text-pink-300 font-bold animate-pulse">0101</span>
          <span className="text-[10px] font-mono text-fuchsia-300 font-bold animate-pulse">EUTAP</span>
          <span className="text-[10px] font-mono text-pink-300 font-bold animate-pulse">1100</span>
        </div>
      )}

      {/* 8. Amber Tracker (Level 7) */}
      {accessory === 'amber_tracker' && (
        <div className="absolute top-[29%] left-1/2 -translate-x-1/2 w-30 h-8 flex items-center justify-between px-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-400/80 shadow-[0_0_12px_#f97316] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-orange-400/80 shadow-[0_0_12px_#f97316] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          </div>
        </div>
      )}

      {/* 9. Ruby Laser Targeter (Level 8) */}
      {accessory === 'ruby_targeter' && (
        <div className="absolute top-[28%] right-[28%] w-10 h-10 rounded-full border-2 border-rose-500 shadow-[0_0_20px_#f43f5e] flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-[1px] bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
        </div>
      )}

      {/* 10. Quantum Halo (Level 10) */}
      {accessory === 'quantum_halo' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-10 rounded-full border-2 border-cyan-400/80 border-dashed animate-[spin_6s_linear_infinite] shadow-[0_0_25px_rgba(56,189,248,0.9)]" />
      )}

      {/* 11. Titan Armor Plates (Level 11) */}
      {accessory === 'titan_plates' && (
        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="w-7 h-3 rounded-sm bg-indigo-500 border border-indigo-200 shadow-[0_0_12px_#818cf8]" />
          <div className="w-7 h-3 rounded-sm bg-indigo-500 border border-indigo-200 shadow-[0_0_12px_#818cf8]" />
        </div>
      )}

      {/* 12. Void Rift (Level 12) */}
      {accessory === 'violet_void' && (
        <div className="absolute -inset-2 rounded-full border border-purple-400/50 border-dotted animate-[spin_10s_linear_infinite] shadow-[0_0_30px_rgba(192,132,252,0.8)]" />
      )}

      {/* 13. Apex Optics (Level 13) */}
      {accessory === 'apex_optics' && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-rose-600/40 border border-rose-400 shadow-[0_0_20px_#f43f5e] flex items-center justify-center">
          <div className="w-16 h-[2px] bg-rose-300 shadow-[0_0_6px_#fff]" />
        </div>
      )}

      {/* 14. Solar Crest (Level 14) */}
      {accessory === 'solar_crest' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-8 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-orange-400/80 blur-xs animate-ping" />
          <div className="absolute text-orange-200 text-xs font-black tracking-widest drop-shadow-[0_0_10px_#fb923c]">
            SOLAR CREST
          </div>
        </div>
      )}

      {/* 15. Eternal Halo (Level 15) */}
      {accessory === 'eternal_halo' && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-36 h-9 rounded-[100%] border-2 border-yellow-300 shadow-[0_0_30px_#facc15] flex items-center justify-center">
          <div className="absolute w-2 h-2 rounded-full bg-white -top-1 left-4 shadow-[0_0_6px_#fff]" />
          <div className="absolute w-2 h-2 rounded-full bg-white -top-1 right-4 shadow-[0_0_6px_#fff]" />
        </div>
      )}

      {/* 16. Jade Horns (Level 16) */}
      {accessory === 'jade_horns' && (
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 flex items-center justify-between w-32 px-1">
          <div className="w-4 h-10 bg-gradient-to-t from-emerald-600 to-green-300 rounded-t-full shadow-[0_0_15px_#4ade80] -rotate-20" />
          <div className="w-4 h-10 bg-gradient-to-t from-emerald-600 to-green-300 rounded-t-full shadow-[0_0_15px_#4ade80] rotate-20" />
        </div>
      )}

      {/* 17. Celestial Eye (Level 17) */}
      {accessory === 'celestial_eye' && (
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-teal-300 border-2 border-white shadow-[0_0_20px_#2dd4bf] flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 rounded-full bg-cyan-950" />
        </div>
      )}

      {/* 18. Cosmos Constellation (Level 18) */}
      {accessory === 'cosmos_constellation' && (
        <div className="absolute -inset-3 rounded-full border border-blue-400/40 animate-[spin_15s_linear_infinite] shadow-[0_0_35px_rgba(96,165,250,0.8)]">
          <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-0 left-1/2 shadow-[0_0_8px_#fff]" />
          <div className="w-2 h-2 rounded-full bg-blue-200 absolute bottom-4 right-6 shadow-[0_0_6px_#60a5fa]" />
        </div>
      )}

      {/* 19. Sovereign Crown (Level 19 - Pinnacle) */}
      {accessory === 'sovereign_crown' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sovereign Grand Emperor Crown */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="flex items-end gap-1.5">
              <div className="w-3 h-8 bg-gradient-to-t from-fuchsia-700 to-pink-300 rounded-t-md shadow-[0_0_15px_#e879f9]" />
              <div className="w-4 h-12 bg-gradient-to-t from-purple-800 via-pink-400 to-white rounded-t-md shadow-[0_0_25px_#f0abfc] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff] animate-ping" />
              </div>
              <div className="w-3 h-8 bg-gradient-to-t from-fuchsia-700 to-pink-300 rounded-t-md shadow-[0_0_15px_#e879f9]" />
            </div>
            <div className="w-24 h-2 bg-gradient-to-r from-fuchsia-500 via-pink-300 to-fuchsia-500 rounded-full shadow-[0_0_20px_#e879f9]" />
          </div>
          {/* Imperial Sovereign Stardust Aura */}
          <div className="absolute -inset-4 rounded-full border border-fuchsia-400/60 border-dashed animate-[spin_12s_linear_infinite] shadow-[0_0_40px_rgba(232,121,249,0.9)]" />
        </div>
      )}
    </div>
  );
};
