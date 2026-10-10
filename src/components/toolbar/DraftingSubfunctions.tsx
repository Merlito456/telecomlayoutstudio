/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectSettings, ToolType } from '../../types/cad';
import {
  MousePointer,
  Hand,
  PenTool,
  Minus,
  Spline,
  Square,
  Circle,
  Type,
  MoveHorizontal,
  MoveVertical,
  MoveDiagonal,
  ArrowUpRight,
  Eraser,
  Grid,
  Magnet,
  Compass,
  Tag,
  Sliders,
  Ruler,
  Palette,
  Check,
} from 'lucide-react';

interface DraftingSubfunctionsProps {
  activeTool?: ToolType;
  onSelectTool?: (tool: ToolType) => void;
  settings: ProjectSettings;
  onUpdateSettings: (partial: Partial<ProjectSettings>) => void;
  onOpenScaleModal: () => void;
  activeColor?: string;
  onUpdateColor?: (color: string) => void;
}

const COLOR_PALETTE = [
  { name: 'Sky Blue (CAD Default)', value: '#38bdf8' },
  { name: 'White', value: '#ffffff' },
  { name: 'Amber Yellow (DC Power)', value: '#fbbf24' },
  { name: 'Emerald Green (Grounding)', value: '#34d399' },
  { name: 'Red (Critical/AC)', value: '#ef4444' },
  { name: 'Purple (Fiber Optics)', value: '#c084fc' },
  { name: 'Orange (RF Signal)', value: '#fb923c' },
  { name: 'Slate Gray', value: '#94a3b8' },
];

export const DraftingSubfunctions: React.FC<DraftingSubfunctionsProps> = ({
  activeTool = 'select',
  onSelectTool,
  settings,
  onUpdateSettings,
  onOpenScaleModal,
  activeColor = '#38bdf8',
  onUpdateColor,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const drawTools: { id: ToolType; label: string; shortcut: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'line', label: 'Line', shortcut: 'L', icon: Minus },
    { id: 'polyline', label: 'Polyline', shortcut: 'Enter', icon: Spline },
    { id: 'rectangle', label: 'Rect', shortcut: 'R', icon: Square },
    { id: 'circle', label: 'Circle', shortcut: 'C', icon: Circle },
    { id: 'pen', label: 'Cables (Pen)', shortcut: 'P', icon: PenTool },
  ];

  const dimTools: { id: ToolType; label: string; shortcut: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dim-h', label: 'Dim H', shortcut: '', icon: MoveHorizontal },
    { id: 'dim-v', label: 'Dim V', shortcut: '', icon: MoveVertical },
    { id: 'dim-aligned', label: 'Aligned Dim', shortcut: 'D', icon: MoveDiagonal },
    { id: 'leader', label: 'Leader', shortcut: '', icon: ArrowUpRight },
    { id: 'text', label: 'Text Note', shortcut: 'T', icon: Type },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none text-xs">
      {/* 1. Selection & Canvas Pointer */}
      <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Pointer
        </span>
        <button
          type="button"
          onClick={() => onSelectTool?.('select')}
          title="Select / Move / Modify Objects [V]"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
            activeTool === 'select'
              ? 'bg-sky-500 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select</span>
          <span className="text-[10px] opacity-60 hidden xl:inline">[V]</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool?.('pan')}
          title="Pan Canvas Viewport [H / Spacebar]"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
            activeTool === 'pan'
              ? 'bg-sky-500 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>Pan</span>
          <span className="text-[10px] opacity-60 hidden xl:inline">[H]</span>
        </button>
      </div>

      {/* 2. 2D Geometry Shapes */}
      <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Draw
        </span>
        {drawTools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool?.(t.id)}
              title={`${t.label} ${t.shortcut ? `[${t.shortcut}]` : ''}`}
              className={`flex items-center gap-1 px-1.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.shortcut && <span className="text-[9px] opacity-60 hidden 2xl:inline">[{t.shortcut}]</span>}
            </button>
          );
        })}
      </div>

      {/* 3. Dimensions & Annotations */}
      <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Annotate
        </span>
        {dimTools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool?.(t.id)}
              title={`${t.label} ${t.shortcut ? `[${t.shortcut}]` : ''}`}
              className={`flex items-center gap-1 px-1.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Modify & Style (Eraser & Color) */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => onSelectTool?.('eraser')}
          title="Eraser Tool [E] - Click object to delete"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
            activeTool === 'eraser'
              ? 'bg-rose-600 text-white font-semibold shadow-sm'
              : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
          }`}
        >
          <Eraser className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Eraser</span>
        </button>

        {/* Color picker dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Stroke Color Palette"
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 cursor-pointer"
          >
            <span
              className="w-3 h-3 rounded-full border border-white/40 shadow-xs"
              style={{ backgroundColor: activeColor }}
            />
            <Palette className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl z-50 grid grid-cols-4 gap-1.5 w-44">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    onUpdateColor?.(c.value);
                    setShowColorPicker(false);
                  }}
                  title={c.name}
                  className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-700 hover:scale-110 transition-transform cursor-pointer relative"
                  style={{ backgroundColor: c.value }}
                >
                  {activeColor === c.value && <Check className="w-4 h-4 text-slate-900 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenScaleModal}
          title="Calibrate Drawing Scale Ratio (1:50, 1:100, custom scale)"
          className="flex items-center gap-1 px-2 py-1 rounded text-sky-400 hover:text-white hover:bg-sky-950/40 border border-sky-500/30 cursor-pointer"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px] hidden lg:inline">
            1:{Math.round(1000 / (settings.scaleFactor || 20))}
          </span>
        </button>
      </div>

      {/* 5. Snapping & Drafting Toggles */}
      <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden xl:inline">
          Snaps
        </span>
        <button
          type="button"
          onClick={() => onUpdateSettings({ gridVisible: !settings.gridVisible })}
          title={`Grid Overlay (${settings.gridVisible ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.gridVisible ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onUpdateSettings({ gridSnap: !settings.gridSnap })}
          title={`Grid Snap (${settings.gridSnap ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.gridSnap ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Magnet className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onUpdateSettings({ orthoMode: !settings.orthoMode })}
          title={`Ortho Mode [Shift] (${settings.orthoMode ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.orthoMode ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onUpdateSettings({ showMeasurements: !settings.showMeasurements })}
          title={`Measurement Labels (${settings.showMeasurements ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.showMeasurements ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onUpdateSettings({ autoDims: !settings.autoDims })}
          title={`Automatic Wall & Stencil Dimension Annotations (${settings.autoDims ? 'ON' : 'OFF'})`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            settings.autoDims ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
