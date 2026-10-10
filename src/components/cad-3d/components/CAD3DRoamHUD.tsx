/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CAD3DRoamHUDProps {
  isRoamMode: boolean;
  cableToolMode: 'none' | 'lay' | 'delete';
  isPointerLocked: boolean;
  focusedDoorPrompt: {
    id: string;
    name: string;
    isOpen: boolean;
    distMeters: number;
  } | null;
  doorInteractionHint: string | null;
  roamTelemetry: {
    isClimbing: boolean;
    elevM: number;
  };
  keysHeldRef: React.MutableRefObject<{
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    e: boolean;
    r: boolean;
    shift: boolean;
    space: boolean;
  }>;
  activeKeysUI: {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    e: boolean;
    r: boolean;
    shift: boolean;
  };
  setActiveKeysUI: React.Dispatch<
    React.SetStateAction<{
      w: boolean;
      a: boolean;
      s: boolean;
      d: boolean;
      e: boolean;
      r: boolean;
      shift: boolean;
    }>
  >;
  setCableToolMode: React.Dispatch<React.SetStateAction<'none' | 'lay' | 'delete'>>;
  handleTeleportToLadder: (cat?: 'cable-ladder' | 'tower-ladder') => void;
  showSky: boolean;
  handleToggleSky: () => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleRoamMode: (enabled?: boolean) => void;
}

export const CAD3DRoamHUD: React.FC<CAD3DRoamHUDProps> = ({
  isRoamMode,
  cableToolMode,
  isPointerLocked,
  focusedDoorPrompt,
  doorInteractionHint,
  roamTelemetry,
  keysHeldRef,
  activeKeysUI,
  setActiveKeysUI,
  setCableToolMode,
  handleTeleportToLadder,
  showSky,
  handleToggleSky,
  soundEnabled,
  setSoundEnabled,
  handleToggleRoamMode,
}) => {
  if (!isRoamMode) return null;

  return (
    <>
      {/* First-Person Center Crosshair & Interactive Door Prompt in Roam Mode */}
      {(cableToolMode === 'none' || isPointerLocked) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <div
            className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
              focusedDoorPrompt
                ? 'w-7 h-7 border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.6)] ring-2 ring-emerald-400/40 animate-pulse'
                : 'w-5 h-5 border border-emerald-400/50 bg-slate-950/30'
            }`}
          >
            <div
              className={`rounded-full transition-all duration-200 ${
                focusedDoorPrompt ? 'w-2 h-2 bg-emerald-300' : 'w-1.5 h-1.5 bg-emerald-400'
              }`}
            />
          </div>

          {focusedDoorPrompt && (
            <div className="absolute top-[calc(50%+24px)] left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-emerald-400/80 shadow-2xl backdrop-blur-md text-emerald-300 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500 text-slate-950 font-black text-xs shadow">
                Z
              </span>
              <span className="text-xs font-bold tracking-wide">
                {focusedDoorPrompt.isOpen ? 'Close' : 'Open'} {focusedDoorPrompt.name}
              </span>
              <span className="text-[11px] text-emerald-400/70 font-mono">
                ({focusedDoorPrompt.distMeters}m)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Door Interaction Hint Notification Toast */}
      {doorInteractionHint && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/95 border border-amber-500/60 shadow-2xl backdrop-blur-md text-amber-200 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none whitespace-nowrap">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
            Z
          </span>
          <span>{doorInteractionHint}</span>
        </div>
      )}

      {/* Minimal Transparent Text-Only Roam Controls */}
      <div
        data-roam-hud
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-2.5 py-0.5 rounded bg-slate-950/25 backdrop-blur-[2px] text-[11px] font-mono text-white/80 whitespace-nowrap"
      >
        <span className="text-emerald-300/90 font-semibold">
          {roamTelemetry.isClimbing ? 'CLIMB' : 'ROAM'} {roamTelemetry.elevM}m
        </span>
        <span className="text-white/30">|</span>

        <div className="flex items-center gap-1">
          {(['w', 'a', 's', 'd'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onMouseDown={() => {
                keysHeldRef.current[k] = true;
                setActiveKeysUI((prev) => ({ ...prev, [k]: true }));
              }}
              onMouseUp={() => {
                keysHeldRef.current[k] = false;
                setActiveKeysUI((prev) => ({ ...prev, [k]: false }));
              }}
              onMouseLeave={() => {
                if (keysHeldRef.current[k]) {
                  keysHeldRef.current[k] = false;
                  setActiveKeysUI((prev) => ({ ...prev, [k]: false }));
                }
              }}
              className={`px-1 uppercase cursor-pointer ${
                activeKeysUI[k] ? 'text-emerald-300 font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <span className="text-white/30">|</span>

        <button
          type="button"
          onMouseDown={() => {
            keysHeldRef.current.e = true;
            setActiveKeysUI((prev) => ({ ...prev, e: true }));
          }}
          onMouseUp={() => {
            keysHeldRef.current.e = false;
            setActiveKeysUI((prev) => ({ ...prev, e: false }));
          }}
          onMouseLeave={() => {
            if (keysHeldRef.current.e) {
              keysHeldRef.current.e = false;
              setActiveKeysUI((prev) => ({ ...prev, e: false }));
            }
          }}
          className={`cursor-pointer ${
            activeKeysUI.e ? 'text-amber-300 font-bold' : 'text-white/75 hover:text-white'
          }`}
        >
          Climb Up [E]
        </button>

        <button
          type="button"
          onMouseDown={() => {
            keysHeldRef.current.r = true;
            setActiveKeysUI((prev) => ({ ...prev, r: true }));
          }}
          onMouseUp={() => {
            keysHeldRef.current.r = false;
            setActiveKeysUI((prev) => ({ ...prev, r: false }));
          }}
          onMouseLeave={() => {
            if (keysHeldRef.current.r) {
              keysHeldRef.current.r = false;
              setActiveKeysUI((prev) => ({ ...prev, r: false }));
            }
          }}
          className={`cursor-pointer ${
            activeKeysUI.r ? 'text-sky-300 font-bold' : 'text-white/75 hover:text-white'
          }`}
        >
          Climb Down [R]
        </button>
        <span className="text-white/30">|</span>

        <button
          type="button"
          onClick={() => setCableToolMode((prev) => (prev === 'lay' ? 'none' : 'lay'))}
          className={`cursor-pointer ${
            cableToolMode === 'lay'
              ? 'text-sky-300 font-bold underline underline-offset-2'
              : 'text-white/75 hover:text-white'
          }`}
        >
          Lay Cable [C]
        </button>

        <button
          type="button"
          onClick={() => setCableToolMode((prev) => (prev === 'delete' ? 'none' : 'delete'))}
          className={`cursor-pointer ${
            cableToolMode === 'delete'
              ? 'text-rose-300 font-bold underline underline-offset-2'
              : 'text-white/75 hover:text-white'
          }`}
        >
          Delete Cable [X]
        </button>

        <button
          type="button"
          onClick={() => handleTeleportToLadder('cable-ladder')}
          className="text-white/75 hover:text-white cursor-pointer"
        >
          Snap to Ladder [L]
        </button>
        <span className="text-white/30">|</span>

        <button
          type="button"
          onClick={handleToggleSky}
          className={`cursor-pointer ${
            showSky ? 'text-sky-300 font-bold' : 'text-white/60 hover:text-white'
          }`}
          title="Toggle Photorealistic Sky, Realistic Animated Clouds & Glowing Sun [K]"
        >
          {showSky ? 'Sky:ON' : 'Sky:OFF'}
        </button>
        <span className="text-white/30">|</span>

        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="text-white/65 hover:text-white cursor-pointer"
        >
          {soundEnabled ? 'Audio:ON' : 'Audio:OFF'}
        </button>

        <button
          type="button"
          onClick={() => handleToggleRoamMode(false)}
          className="text-white/75 hover:text-white cursor-pointer"
        >
          Orbit 3D [G]
        </button>
      </div>
    </>
  );
};
