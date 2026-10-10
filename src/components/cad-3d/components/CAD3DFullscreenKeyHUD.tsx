/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Minimize2,
  DoorOpen,
  DoorClosed,
  Eye,
  Compass,
  Sparkles,
  Tag,
  Download,
  Volume2,
  VolumeX,
  Layers,
  Home,
  Network,
  Trash2,
  Cable,
} from 'lucide-react';
import { CameraPreset } from '../types';

export interface CAD3DFullscreenKeyHUDProps {
  isRoamMode: boolean;
  isPointerLocked?: boolean;
  onExitFullscreen: () => void;
  focusedDoorPrompt?: {
    id: string;
    name: string;
    isOpen: boolean;
    distMeters: number;
  } | null;
  cabinRoofCutaway?: boolean;
  showSky?: boolean;
  handleToggleRoamMode?: (enabled?: boolean) => void;
  handleToggleSky?: () => void;
  handleInteractWithDoor?: () => void;
  setCabinRoofCutaway?: React.Dispatch<React.SetStateAction<boolean>>;
  // Cabling controls
  cableToolMode?: 'none' | 'lay' | 'delete';
  setCableToolMode?: (mode: 'none' | 'lay' | 'delete' | ((prev: 'none' | 'lay' | 'delete') => 'none' | 'lay' | 'delete')) => void;
  handleTeleportToLadder?: (category?: 'cable-ladder' | 'tower-ladder') => void;
  handleAutoRouteLadderToCabinets3D?: () => void;
  cableHudStatus?: {
    snapLabel: string;
    lengthStr: string;
    hoveredCableId?: string | null;
  };
  onRequestPointerLock?: () => void;
  // Inspection controls
  showDimensions?: boolean;
  setShowDimensions?: (v: boolean | ((prev: boolean) => boolean)) => void;
  showObjectLabels?: boolean;
  setShowObjectLabels?: (v: boolean | ((prev: boolean) => boolean)) => void;
  soundEnabled?: boolean;
  setSoundEnabled?: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportSnapshot?: () => void;
  cameraPreset?: CameraPreset;
  applyCameraPreset?: (preset: CameraPreset) => void;
}

export const CAD3DFullscreenKeyHUD: React.FC<CAD3DFullscreenKeyHUDProps> = ({
  isRoamMode,
  isPointerLocked = false,
  onExitFullscreen,
  focusedDoorPrompt,
  cabinRoofCutaway,
  showSky,
  handleToggleRoamMode,
  handleToggleSky,
  handleInteractWithDoor,
  setCabinRoofCutaway,
  cableToolMode = 'none',
  setCableToolMode,
  handleTeleportToLadder,
  handleAutoRouteLadderToCabinets3D,
  cableHudStatus,
  onRequestPointerLock,
  showDimensions,
  setShowDimensions,
  showObjectLabels,
  setShowObjectLabels,
  soundEnabled,
  setSoundEnabled,
  handleExportSnapshot,
}) => {
  return (
    <>
      {/* Precision Reticle / Crosshair in Fullscreen Roam or Cabling Mode */}
      {(isRoamMode || cableToolMode !== 'none') && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
          <div className="relative flex items-center justify-center">
            {/* Center Reticle Ring */}
            <div
              className={`rounded-full transition-all duration-150 ${
                cableToolMode === 'lay'
                  ? 'w-6 h-6 border-2 border-sky-400 bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.7)] ring-2 ring-sky-400/40'
                  : cableToolMode === 'delete'
                  ? 'w-6 h-6 border-2 border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.7)] ring-2 ring-rose-400/40'
                  : focusedDoorPrompt
                  ? 'w-7 h-7 border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.7)] ring-2 ring-emerald-400/40 animate-pulse'
                  : 'w-4 h-4 border border-white/60 bg-black/25 shadow-sm'
              }`}
            >
              {/* Center Dot */}
              <div
                className={`absolute inset-0 m-auto rounded-full ${
                  cableToolMode === 'lay'
                    ? 'w-1.5 h-1.5 bg-sky-300'
                    : cableToolMode === 'delete'
                    ? 'w-1.5 h-1.5 bg-rose-300'
                    : focusedDoorPrompt
                    ? 'w-2 h-2 bg-emerald-300'
                    : 'w-1 h-1 bg-white'
                }`}
              />
            </div>

            {/* Crosshair Hairlines */}
            <div className="absolute -left-3 w-1.5 h-[1px] bg-white/70" />
            <div className="absolute -right-3 w-1.5 h-[1px] bg-white/70" />
            <div className="absolute -top-3 w-[1px] h-1.5 bg-white/70" />
            <div className="absolute -bottom-3 w-[1px] h-1.5 bg-white/70" />

            {/* Floating Snap & Precision Target Label */}
            {cableHudStatus && cableToolMode !== 'none' && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                <div
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wide shadow-xl backdrop-blur-md border ${
                    cableToolMode === 'lay'
                      ? 'bg-slate-950/90 text-sky-300 border-sky-500/70 shadow-sky-950/80'
                      : 'bg-slate-950/90 text-rose-300 border-rose-500/70 shadow-rose-950/80'
                  }`}
                >
                  {cableHudStatus.snapLabel}
                  {cableHudStatus.lengthStr ? ` (${cableHudStatus.lengthStr})` : ''}
                </div>
                <div className="text-[10px] text-white/80 bg-black/70 px-2 py-0.5 rounded-md shadow border border-white/10">
                  {cableToolMode === 'lay'
                    ? '[Click / Space] Place Pt  •  [Enter / Right-Click] Finish'
                    : '[Click] Delete Cable  •  [Esc] Done'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pointer Lock Helper Prompt in Roam Mode */}
      {isRoamMode && !isPointerLocked && onRequestPointerLock && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={onRequestPointerLock}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-sky-400/50 shadow-2xl backdrop-blur-md text-sky-300 text-xs font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-sky-500/20"
            title="Click to lock mouse and look around in 360°"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Click viewport to lock mouse & look around [Esc to unlock]</span>
          </button>
        </div>
      )}
      {/* Top Right Floating Exit Fullscreen Button */}
      <div className="absolute top-4 right-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={onExitFullscreen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-mono shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-sky-500/30"
          title="Exit Fullscreen [Press F or Esc]"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-bold text-[11px] border border-slate-700 shadow-sm">
            F
          </kbd>
          <span className="font-semibold text-slate-200">Exit Fullscreen</span>
          <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Door Focused Interaction Toast in Fullscreen */}
      {focusedDoorPrompt && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={handleInteractWithDoor}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/95 border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)] backdrop-blur-md text-emerald-300 text-xs font-bold cursor-pointer"
          >
            <kbd className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500 text-slate-950 font-black text-xs shadow">
              Z
            </kbd>
            {focusedDoorPrompt.isOpen ? (
              <DoorOpen className="w-4 h-4 text-emerald-400" />
            ) : (
              <DoorClosed className="w-4 h-4 text-emerald-300" />
            )}
            <span>
              {focusedDoorPrompt.isOpen ? 'Close' : 'Open'} {focusedDoorPrompt.name} ({focusedDoorPrompt.distMeters}m)
            </span>
          </button>
        </div>
      )}

      {/* Bottom Floating Key Instructions & Full Functions HUD */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[98vw] w-max">
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-200 text-xs font-mono">
          {/* Fullscreen key badge */}
          <div className="flex items-center gap-1 text-sky-400 font-medium shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-sky-950/90 text-sky-300 font-bold text-[11px] border border-sky-700 shadow-sm">
              F
            </kbd>
            <span className="hidden sm:inline">Fullscreen</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Navigation Controls */}
          {isRoamMode ? (
            <div className="flex items-center gap-1 text-slate-300 shrink-0">
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-[11px]">W</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-[11px]">A</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-[11px]">S</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-[11px]">D</kbd>
              <span className="ml-0.5 text-slate-400 hidden md:inline">Walk</span>
              <span className="text-slate-600 mx-0.5 hidden md:inline">•</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold text-[11px] hidden md:inline">E</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-bold text-[11px] hidden md:inline">R</kbd>
              <span className="text-slate-400 hidden md:inline">Climb</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
              <span>Orbit View</span>
            </div>
          )}

          <span className="text-slate-700">|</span>

          {/* CABLING FUNCTIONS */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-900/80 px-2 py-0.5 rounded-xl border border-sky-950/60">
            {/* Lay Cable Toggle Button [Key C] */}
            <button
              type="button"
              onClick={() => setCableToolMode?.((prev) => (prev === 'lay' ? 'none' : 'lay'))}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                cableToolMode === 'lay'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'hover:bg-slate-800 text-sky-400 hover:text-sky-300'
              }`}
              title="Lay 3D Cables & Trays [Press Key C]"
            >
              <Cable className="w-3.5 h-3.5" />
              <span>Lay Cable [C]</span>
            </button>

            {/* Delete Cable Toggle Button [Key X] */}
            <button
              type="button"
              onClick={() => setCableToolMode?.((prev) => (prev === 'delete' ? 'none' : 'delete'))}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                cableToolMode === 'delete'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'hover:bg-slate-800 text-rose-400 hover:text-rose-300'
              }`}
              title="Delete 3D Cables [Press X]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Del [X]</span>
            </button>

            {/* Auto-Route Ladder to Cabinets */}
            {handleAutoRouteLadderToCabinets3D && (
              <button
                type="button"
                onClick={handleAutoRouteLadderToCabinets3D}
                className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
                title="Auto-Route Cable Ladder from Tower to Shelter / Cabinets"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Auto-Route</span>
              </button>
            )}

            {/* Snap to Ladder [Key L] */}
            {handleTeleportToLadder && (
              <button
                type="button"
                onClick={() => handleTeleportToLadder('cable-ladder')}
                className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-800 text-amber-400 hover:text-amber-300 text-xs cursor-pointer transition-colors"
                title="Teleport to Nearest Cable Ladder [Key L]"
              >
                <kbd className="px-1 rounded bg-slate-800 text-[10px] text-amber-300">L</kbd>
                <span>Ladder</span>
              </button>
            )}
          </div>

          <span className="text-slate-700">|</span>

          {/* INSPECTION CONTROLS */}
          {/* 3D Dims Toggle */}
          {setShowDimensions && (
            <button
              type="button"
              onClick={() => setShowDimensions((prev) => !prev)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                showDimensions ? 'text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle 3D Dimensions & Measurement Tags"
            >
              <Tag className="w-3 h-3" />
              <span>Dims</span>
            </button>
          )}

          {/* Labels Toggle */}
          {setShowObjectLabels && (
            <button
              type="button"
              onClick={() => setShowObjectLabels((prev) => !prev)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                showObjectLabels ? 'text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle 3D Object Labels"
            >
              <Layers className="w-3 h-3" />
              <span>Labels</span>
            </button>
          )}

          {/* Roof Cutaway Key [T] */}
          <button
            type="button"
            onClick={() => setCabinRoofCutaway?.((prev) => !prev)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
              cabinRoofCutaway ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Shelter Roof Cutaway [Key T or U]"
          >
            <Home className="w-3 h-3 text-amber-400" />
            <kbd className="px-1 rounded bg-slate-800 text-[10px]">T</kbd>
            <span className="hidden sm:inline">{cabinRoofCutaway ? 'Cutaway [T]' : 'Roof [T]'}</span>
          </button>

          {/* Door Key [Z] */}
          <button
            type="button"
            onClick={handleInteractWithDoor}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors"
            title="Open or Close Nearest Door [Key Z]"
          >
            <DoorClosed className="w-3 h-3" />
            <kbd className="px-1 rounded bg-slate-800 text-[10px]">Z</kbd>
            <span className="hidden sm:inline">Door</span>
          </button>

          {/* Sky [K] */}
          <button
            type="button"
            onClick={handleToggleSky}
            className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
              showSky ? 'text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Realistic Sky & Lighting [Key K]"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <kbd className="px-1 rounded bg-slate-800 text-[10px]">K</kbd>
            <span>Sky</span>
          </button>

          {/* Audio */}
          {setSoundEnabled && (
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="Toggle Audio Effects"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          )}

          {/* Snapshot */}
          {handleExportSnapshot && (
            <button
              type="button"
              onClick={handleExportSnapshot}
              className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Export High-Resolution 3D Snapshot"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span>Snapshot</span>
            </button>
          )}

          <span className="text-slate-700">|</span>

          {/* Mode Switch [G] */}
          <button
            type="button"
            onClick={() => handleToggleRoamMode?.(!isRoamMode)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold cursor-pointer transition-all"
            title="Switch between First-Person Roam and 3D Orbit [Key G]"
          >
            <kbd className="px-1 rounded bg-slate-800 text-[10px] text-indigo-300">G</kbd>
            <span>{isRoamMode ? 'Orbit' : 'Roam'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
