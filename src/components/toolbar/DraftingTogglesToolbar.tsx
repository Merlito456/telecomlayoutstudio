/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectSettings } from '../../types/cad';
import {
  Grid,
  Magnet,
  Compass,
  Tag,
  Type,
  Ruler,
  Stamp,
  Navigation,
  BoxSelect,
  Sliders,
} from 'lucide-react';

interface DraftingTogglesToolbarProps {
  settings: ProjectSettings;
  onUpdateSettings: (partial: Partial<ProjectSettings>) => void;
  onOpenScaleModal: () => void;
  activeColor?: string;
  onUpdateColor?: (color: string) => void;
}

export const DraftingTogglesToolbar: React.FC<DraftingTogglesToolbarProps> = ({
  settings,
  onUpdateSettings,
  onOpenScaleModal,
  activeColor,
  onUpdateColor,
}) => {
  return (
    <>
      <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 shrink-0">
        <button
          onClick={() => onUpdateSettings({ gridVisible: !settings.gridVisible })}
          title={`Toggle Grid (${settings.gridVisible ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.gridVisible
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ gridSnap: !settings.gridSnap })}
          title={`Grid Snap (${settings.gridSnap ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.gridSnap
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Magnet className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ orthoMode: !settings.orthoMode })}
          title={`Ortho Mode [Shift] (${settings.orthoMode ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.orthoMode
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ showMeasurements: !settings.showMeasurements })}
          title={`Standard Measurement Labels (${settings.showMeasurements ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.showMeasurements
              ? 'bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-sm'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ showObjectLabels: settings.showObjectLabels === false ? true : false })}
          title={`Toggle Object Stencil Labels [L] (${settings.showObjectLabels !== false ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.showObjectLabels !== false
              ? 'bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-sm'
              : 'text-slate-500 hover:bg-slate-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ autoDims: !settings.autoDims })}
          title={`Auto Dimension Lines (${settings.autoDims ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.autoDims
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ showTitleBlock: !settings.showTitleBlock })}
          title={`Engineering Title Block (${settings.showTitleBlock ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.showTitleBlock
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ showNorthArrow: !settings.showNorthArrow })}
          title={`Site True North Compass (${settings.showNorthArrow ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.showNorthArrow
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            const current = settings.selectionBoxStyle || 'none';
            const next = current === 'none' ? 'corners' : current === 'corners' ? 'box' : 'none';
            onUpdateSettings({ selectionBoxStyle: next });
          }}
          title={`Object Bounding Box: ${(settings.selectionBoxStyle || 'none').toUpperCase()} (Click to toggle None/Corners/Box)`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.selectionBoxStyle === 'none'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : settings.selectionBoxStyle === 'corners'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <BoxSelect className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenScaleModal}
          title="Scale & Units Settings"
          className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick 2D Drafting Color Selector */}
      {onUpdateColor && (
        <div
          className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800 shrink-0 shadow-inner"
          title="2D Drafting & Line Color for selected object (Not fixed on black)"
        >
          <div className="flex items-center gap-1">
            <span className="hidden xl:inline text-[9px] font-mono text-slate-400 font-semibold uppercase">
              2D Color:
            </span>
            <input
              type="color"
              value={activeColor && activeColor.startsWith('#') ? activeColor : '#38bdf8'}
              onChange={(e) => onUpdateColor(e.target.value)}
              title="Pick custom 2D drafting color"
              className="w-4 h-4 rounded border border-slate-700 cursor-pointer bg-transparent shrink-0"
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              { name: 'Sky Cyan', color: '#38bdf8' },
              { name: 'Cobalt Blue', color: '#2563eb' },
              { name: 'Amber Power', color: '#f59e0b' },
              { name: 'Ground Green', color: '#16a34a' },
              { name: 'Red Alarm', color: '#ef4444' },
              { name: 'Fiber Violet', color: '#a855f7' },
              { name: 'Electric Yellow', color: '#eab308' },
              { name: 'Crisp White', color: '#ffffff' },
              { name: 'Technical Black', color: '#0f172a' },
            ].map((p) => {
              const isActive = activeColor?.toLowerCase() === p.color.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onUpdateColor(p.color)}
                  title={`${p.name} (${p.color})`}
                  style={{ backgroundColor: p.color }}
                  className={`w-3 h-3 rounded-full border transition-all cursor-pointer ${
                    isActive ? 'border-white scale-125 ring-1 ring-sky-400' : 'border-slate-700 hover:scale-125'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
