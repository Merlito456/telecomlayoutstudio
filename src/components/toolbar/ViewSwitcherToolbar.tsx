/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectSettings } from '../../types/cad';
import {
  Camera,
  Compass,
  Box,
  Gamepad2,
  Server,
  Layers,
} from 'lucide-react';

interface ViewSwitcherToolbarProps {
  settings: ProjectSettings;
  onUpdateSettings: (partial: Partial<ProjectSettings>) => void;
  is3DMode?: boolean;
  onToggle3D?: () => void;
  onOpen3DRoam?: () => void;
  onOpenShelterDesigner?: () => void;
  onOpenRackDesigner?: () => void;
}

export const ViewSwitcherToolbar: React.FC<ViewSwitcherToolbarProps> = ({
  settings,
  onUpdateSettings,
  is3DMode = false,
  onToggle3D,
  onOpen3DRoam,
  onOpenShelterDesigner,
  onOpenRackDesigner,
}) => {
  return (
    <>
      {/* 3-Mode View Switcher */}
      <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 shadow-inner">
        <button
          onClick={() => {
            if (is3DMode && onToggle3D) onToggle3D();
            onUpdateSettings({ renderStyle: 'photo' });
          }}
          title="Photo Mode: 2D Photorealistic Textured Site Layout"
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            !is3DMode && settings.renderStyle === 'photo'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Photo</span>
        </button>

        <button
          onClick={() => {
            if (is3DMode && onToggle3D) onToggle3D();
            onUpdateSettings({ renderStyle: 'cad' });
          }}
          title="2D CAD: Standard Engineering Structural Drawing Symbols"
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            !is3DMode && settings.renderStyle !== 'photo'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CAD</span>
        </button>

        {onToggle3D && (
          <button
            onClick={onToggle3D}
            title="3D Orbit: Interactive 3D Telecom Site View [Press 3]"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              is3DMode
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
        )}

        {onOpen3DRoam && (
          <button
            onClick={onOpen3DRoam}
            title="Site Roam Game Mode: Walk with WASD, Look with Mouse, Climb Cable Ladders with E (Up) / R (Down) [Press G]"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 ml-0.5"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Roam</span>
          </button>
        )}

        {onOpenShelterDesigner && (
          <button
            onClick={onOpenShelterDesigner}
            title="Shelter Design Page: Focus and place all racks, AC, DC power & overhead cable ladders [Press 4]"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer bg-sky-500/20 border border-sky-400/40 text-sky-300 hover:bg-sky-500 hover:text-slate-950 ml-0.5 shadow-sm"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Shelter</span>
          </button>
        )}

        {onOpenRackDesigner && (
          <button
            onClick={onOpenRackDesigner}
            title="Rack & Cabinet Equipment Designer: Design internal modules, rectifiers, batteries, routers & patch panels"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 ml-0.5 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cabinet/Rack</span>
          </button>
        )}
      </div>

      {/* CAD Sheet Theme Switcher (when in 2D mode, on medium+ screens) */}
      {!is3DMode && (
        <div className="hidden lg:flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => onUpdateSettings({ cadTheme: 'dark' })}
            title="Dark CAD Theme (Civil 3D / AutoCAD dark workspace)"
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              (settings.cadTheme || 'dark') === 'dark'
                ? 'bg-slate-800 text-sky-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => onUpdateSettings({ cadTheme: 'blueprint' })}
            title="Cyan Blueprint Theme"
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              settings.cadTheme === 'blueprint'
                ? 'bg-sky-950 text-sky-300 font-bold border border-sky-800/60'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Cyan
          </button>
          <button
            onClick={() => onUpdateSettings({ cadTheme: 'white' })}
            title="White Paper Theme"
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              settings.cadTheme === 'white'
                ? 'bg-white text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Paper
          </button>
        </div>
      )}
    </>
  );
};
