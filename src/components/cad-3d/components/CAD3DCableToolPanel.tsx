/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CablePresetItem {
  id: string;
  label: string;
  color: string;
  hex: number;
}

export interface CAD3DCableToolPanelProps {
  cableToolMode: 'none' | 'lay' | 'delete';
  setCableToolMode: (mode: 'none' | 'lay' | 'delete') => void;
  cablePresets: CablePresetItem[];
  selectedCablePreset: CablePresetItem;
  setSelectedCablePreset: (preset: CablePresetItem) => void;
  cableOrthoSnap: boolean;
  setCableOrthoSnap: React.Dispatch<React.SetStateAction<boolean>>;
  cableStartPt3D: { x3D: number; y3D: number; z3D: number; x2D: number; y2D: number } | null;
  handlePlace3DCablePoint: (isFinishing: boolean) => void;
  onCancelCable: () => void;
  handleAutoRouteLadderToCabinets3D: () => void;
  cableHudStatus: { snapLabel: string; lengthStr: string };
  handleClearAllCables3D: () => void;
}

export const CAD3DCableToolPanel: React.FC<CAD3DCableToolPanelProps> = ({
  cableToolMode,
  setCableToolMode,
  cablePresets,
  selectedCablePreset,
  setSelectedCablePreset,
  cableOrthoSnap,
  setCableOrthoSnap,
  cableStartPt3D,
  handlePlace3DCablePoint,
  onCancelCable,
  handleAutoRouteLadderToCabinets3D,
  cableHudStatus,
  handleClearAllCables3D,
}) => {
  if (cableToolMode === 'none') return null;

  return (
    <div
      data-roam-hud
      className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center gap-2.5 px-2.5 py-0.5 rounded bg-slate-950/25 backdrop-blur-[2px] text-[11px] font-mono text-white/85 whitespace-nowrap"
    >
      <span className="font-bold text-sky-300">
        {cableToolMode === 'lay' ? 'CABLE LAY' : 'CABLE DELETE'}
      </span>
      <span className="text-white/30">|</span>

      {cableToolMode === 'lay' && (
        <>
          <div className="flex items-center gap-1.5">
            {cablePresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedCablePreset(p)}
                className={`px-1 py-0.5 rounded transition-opacity cursor-pointer ${
                  selectedCablePreset.id === p.id
                    ? 'text-sky-300 font-bold underline underline-offset-2'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
          <span className="text-white/30">|</span>

          <button
            type="button"
            onClick={() => setCableOrthoSnap((prev) => !prev)}
            className={`cursor-pointer ${
              cableOrthoSnap ? 'text-emerald-300 font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            {cableOrthoSnap ? 'Ortho:ON' : 'Direct'}
          </button>
          <span className="text-white/30">|</span>

          <button
            type="button"
            onClick={() => handlePlace3DCablePoint(false)}
            className="text-sky-300 hover:text-white font-bold cursor-pointer"
          >
            {cableStartPt3D ? 'Turn/Cabinet [Click]' : 'Start Pt [Click]'}
          </button>

          {cableStartPt3D && (
            <>
              <button
                type="button"
                onClick={() => handlePlace3DCablePoint(true)}
                className="text-emerald-300 hover:text-white font-bold cursor-pointer"
              >
                Finish [Enter/RClick]
              </button>
              <button
                type="button"
                onClick={onCancelCable}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                Cancel [Esc]
              </button>
            </>
          )}
          <span className="text-white/30">|</span>

          <button
            type="button"
            onClick={handleAutoRouteLadderToCabinets3D}
            className="text-amber-300/90 hover:text-amber-200 cursor-pointer"
          >
            Auto-Connect
          </button>
          <span className="text-white/30">|</span>
        </>
      )}

      <span className="text-emerald-300/90">
        {cableHudStatus.snapLabel}
        {cableStartPt3D ? ` (${cableHudStatus.lengthStr})` : ''}
      </span>
      <span className="text-white/30">|</span>

      <button
        type="button"
        onClick={handleClearAllCables3D}
        className="text-rose-300/90 hover:text-rose-200 cursor-pointer"
      >
        Clear All
      </button>
      <span className="text-white/30">|</span>

      <button
        type="button"
        onClick={() => setCableToolMode('none')}
        className="text-white/60 hover:text-white cursor-pointer"
      >
        Close [Esc]
      </button>
    </div>
  );
};
