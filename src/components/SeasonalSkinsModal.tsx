import React, { useState } from 'react';
import { X, Sparkles, Check, Lock, Palette, ShieldCheck, Eye } from 'lucide-react';
import { SeasonalSkin } from '../types';
import { SEASONAL_SKINS } from '../data/seasonalSkins';
import { soundFx } from '../utils/audio';

interface SeasonalSkinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerLevel: number;
  equippedSkinLevel: number | null; // null = auto
  onEquipSkin: (level: number | null) => void;
}

export const SeasonalSkinsModal: React.FC<SeasonalSkinsModalProps> = ({
  isOpen,
  onClose,
  playerLevel,
  equippedSkinLevel,
  onEquipSkin,
}) => {
  const [selectedSkinLevel, setSelectedSkinLevel] = useState<number>(
    equippedSkinLevel !== null ? equippedSkinLevel : playerLevel
  );

  if (!isOpen) return null;

  const activeSkinLevel = equippedSkinLevel !== null ? equippedSkinLevel : playerLevel;
  const previewSkin = SEASONAL_SKINS[selectedSkinLevel] || SEASONAL_SKINS[0];
  const isSelectedUnlocked = selectedSkinLevel <= playerLevel;
  const isSelectedActive = selectedSkinLevel === activeSkinLevel && equippedSkinLevel !== null;
  const isAutoMode = equippedSkinLevel === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] rounded-3xl bg-[#0e131d] border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-black border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white font-['Rajdhani',sans-serif] tracking-wider uppercase">
                  SEASONAL LEVEL SKINS
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/30 text-[9px] font-bold text-cyan-200 uppercase">
                  {SEASONAL_SKINS.length} SEASONS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Current Tier: <span className="text-cyan-300 font-bold">Level {playerLevel}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Skin Spotlight Preview Card */}
        <div
          className="relative p-4 mx-3 mt-3 rounded-2xl border overflow-hidden shrink-0 flex flex-col items-center text-center transition-all duration-300"
          style={{
            borderColor: `${previewSkin.themeColor}80`,
            background: `radial-gradient(circle at center, ${previewSkin.themeColor}25 0%, #0a0e17 85%)`,
            boxShadow: `0 0 25px ${previewSkin.glowColor}`,
          }}
        >
          {/* Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase"
              style={{
                backgroundColor: `${previewSkin.themeColor}30`,
                color: previewSkin.themeColor,
                border: `1px solid ${previewSkin.themeColor}60`,
              }}
            >
              {previewSkin.seasonTitle}
            </span>
            {selectedSkinLevel <= playerLevel ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-bold text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>UNLOCKED</span>
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-[9px] font-bold text-rose-300 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>UNLOCKS AT LVL {selectedSkinLevel}</span>
              </span>
            )}
          </div>

          {/* Avatar Preview with Glowing Ring */}
          <div
            className="relative w-24 h-24 rounded-full p-1.5 border-2 mb-2 transition-transform duration-300"
            style={{
              borderColor: previewSkin.themeColor,
              boxShadow: previewSkin.ringStyle.ringGlow,
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img
                src={previewSkin.avatarImg}
                alt={previewSkin.skinName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
                style={{ filter: previewSkin.characterVisuals.auraFilter }}
              />
            </div>
          </div>

          <h3 className="text-base font-black text-white font-['Rajdhani',sans-serif] tracking-wider uppercase">
            {previewSkin.skinName}
          </h3>
          <p className="text-[11px] font-medium text-slate-300 mt-0.5 max-w-[280px]">
            {previewSkin.description}
          </p>

          {/* Action Button */}
          <div className="mt-3 flex items-center gap-2 w-full max-w-[260px]">
            {isSelectedUnlocked ? (
              <button
                onClick={() => {
                  soundFx.playReward();
                  onEquipSkin(selectedSkinLevel);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: previewSkin.themeColor,
                  color: '#000',
                  boxShadow: `0 0 15px ${previewSkin.glowColor}`,
                }}
              >
                {isSelectedActive ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>EQUIPPED</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>EQUIP THIS SKIN</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>REACH LEVEL {selectedSkinLevel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Auto Sync Toggle Button */}
        <div className="px-3 pt-2 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              onEquipSkin(null);
            }}
            className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
              isAutoMode
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
              <span>Auto-Evolve Skin With Current Level</span>
            </div>
            {isAutoMode && <span className="text-[10px] font-black uppercase text-cyan-300">ACTIVE</span>}
          </button>
        </div>

        {/* Grid of All 20 Seasonal Skins */}
        <div className="p-3 overflow-y-auto flex-1 min-h-0 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
            ALL SEASONAL SKINS (LEVELS 0 - 19)
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {SEASONAL_SKINS.map((skin) => {
              const isUnlocked = skin.level <= playerLevel;
              const isCurrentPreview = skin.level === selectedSkinLevel;
              const isEquipped = skin.level === activeSkinLevel;

              return (
                <div
                  key={skin.level}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSkinLevel(skin.level);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition group ${
                    isCurrentPreview
                      ? 'bg-white/10 border-cyan-400 shadow-md'
                      : isUnlocked
                      ? 'bg-white/5 border-white/10 hover:border-cyan-500/50'
                      : 'bg-black/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Skin Mini Avatar */}
                    <div
                      className="w-10 h-10 rounded-full border p-0.5 relative shrink-0"
                      style={{
                        borderColor: isUnlocked ? skin.themeColor : '#475569',
                      }}
                    >
                      <img
                        src={skin.avatarImg}
                        alt={skin.skinName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                        style={{ filter: skin.characterVisuals.auraFilter }}
                      />
                      {!isUnlocked && (
                        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white font-['Rajdhani',sans-serif]">
                          {skin.skinName}
                        </span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                          style={{
                            backgroundColor: `${skin.themeColor}25`,
                            color: skin.themeColor,
                          }}
                        >
                          LVL {skin.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {skin.characterTitle} • {skin.seasonTitle.split(':')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-[10px] font-black text-emerald-300">
                        ACTIVE
                      </span>
                    )}
                    <Eye className={`w-4 h-4 ${isCurrentPreview ? 'text-cyan-400' : 'text-slate-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
