/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectSettings, ViewportState } from '../../types/cad';
import {
  Camera,
  Compass,
  Box,
  Gamepad2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface ViewSubfunctionsProps {
  settings: ProjectSettings;
  onUpdateSettings: (partial: Partial<ProjectSettings>) => void;
  viewport: ViewportState;
  onUpdateViewport: (partial: Partial<ViewportState>) => void;
  onFitToScreen: () => void;
  is3DMode?: boolean;
  onToggle3D?: () => void;
  onOpen3DRoam?: () => void;
}

export const ViewSubfunctions: React.FC<ViewSubfunctionsProps> = ({
  settings,
  onUpdateSettings,
  viewport,
  onUpdateViewport,
  onFitToScreen,
  is3DMode = false,
  onToggle3D,
  onOpen3DRoam,
}) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(viewport.zoom * 1.25, 20);
    onUpdateViewport({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(viewport.zoom / 1.25, 0.05);
    onUpdateViewport({ zoom: newZoom });
  };

  const handleResetZoom = () => {
    onUpdateViewport({ zoom: 1 });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none text-xs">
      {/* 1. 2D / 3D Mode Switcher */}
      <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          View Mode
        </span>

        <button
          type="button"
          onClick={() => {
            if (is3DMode && onToggle3D) onToggle3D();
            onUpdateSettings({ renderStyle: 'photo' });
          }}
          title="Photo Mode: 2D Photorealistic Textured Site Layout"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
            !is3DMode && settings.renderStyle === 'photo'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>2D Photo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (is3DMode && onToggle3D) onToggle3D();
            onUpdateSettings({ renderStyle: 'cad' });
          }}
          title="2D CAD: Standard Engineering Blueprint Structural Symbols"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
            !is3DMode && settings.renderStyle !== 'photo'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>2D CAD</span>
        </button>

        {onToggle3D && (
          <button
            type="button"
            onClick={onToggle3D}
            title="3D Orbit: Interactive 3D Telecom Site View [Press 3]"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
              is3DMode
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Site [3]</span>
          </button>
        )}

        {onOpen3DRoam && (
          <button
            type="button"
            onClick={onOpen3DRoam}
            title="3D First-Person Roam: Walkthrough site with WASD, look with mouse [Press G]"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-300 hover:text-white border border-emerald-500/40"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>3D Roam [G]</span>
          </button>
        )}
      </div>

      {/* 2. Zoom & Viewport Controls */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Zoom
        </span>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out [-]"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset Zoom to 100%"
          className="px-1.5 py-0.5 rounded font-mono text-[11px] text-sky-400 hover:bg-slate-800 cursor-pointer"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In [+]"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitToScreen}
          title="Fit Drawing to Canvas Bounds [F]"
          className="flex items-center gap-1 px-2 py-1 rounded text-sky-400 hover:text-white hover:bg-sky-950/40 border border-sky-500/30 cursor-pointer ml-0.5"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
      </div>

      {/* 3. Visual Styling & Aids */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Aids
        </span>

        <button
          type="button"
          onClick={() =>
            onUpdateSettings({
              cadTheme: settings.cadTheme === 'blueprint' ? 'dark' : 'blueprint',
            })
          }
          title={`Blueprint Blueprint Aesthetic (${settings.cadTheme === 'blueprint' ? 'ON' : 'OFF'})`}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
            settings.cadTheme === 'blueprint'
              ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-medium'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Blueprint Grid</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onUpdateSettings({
              objectSnap: !settings.objectSnap,
            })
          }
          title={`Object & Stencil Snapping (${settings.objectSnap ? 'ON' : 'OFF'})`}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
            settings.objectSnap
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-medium'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Object Snap</span>
        </button>
      </div>
    </div>
  );
};
