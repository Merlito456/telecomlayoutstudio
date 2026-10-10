import React from "react";
import { CADObject } from "../../types/cad";
import { TELECOM_PALETTE } from "../../utils/stencils";
import { RotateCcw } from "lucide-react";

export const CAD_DRAFTING_PALETTE = [
  { name: 'Sky Cyan (RF / Telecom Default)', color: '#38bdf8' },
  { name: 'Cobalt Blue (AC Power Feed)', color: '#2563eb' },
  { name: 'Amber Gold (Towers & Steel)', color: '#f59e0b' },
  { name: 'Generator Green (Power Gen)', color: '#16a34a' },
  { name: 'Crimson Red (Alarms & Security)', color: '#ef4444' },
  { name: 'Fiber Violet (Optical / OLT)', color: '#a855f7' },
  { name: 'Electric Yellow (DC / Batteries)', color: '#eab308' },
  { name: 'Safety Orange (Transformers)', color: '#f97316' },
  { name: 'Crisp White (CAD Contrast)', color: '#ffffff' },
  { name: 'Slate Gray (Civil Foundation)', color: '#94a3b8' },
  { name: 'Technical Black (CAD Ink)', color: '#0f172a' },
  { name: 'Grounding Emerald (PE Ground)', color: '#10b981' },
];

interface StrokeFillCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const StrokeFillCustomizer: React.FC<StrokeFillCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  if (!primary) return null;
  const activeColor = primary.draftingColor || primary.stroke || '#38bdf8';
  const isHexColor = typeof activeColor === 'string' && activeColor.startsWith('#');

  return (
    <>
      {/* 2D DRAFTING & STROKE CONTROLS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
            2D Drafting &amp; Line Color
          </span>
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Not fixed on black
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Customize the 2D CAD engineering drafting lines for this object across all view modes and sheet themes.
        </p>

        {/* 2D Drafting Line Width Slider */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Line / Stroke Width</span>
            <span className="font-mono text-sky-300">{primary.strokeWidth || 1} px</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="16"
            step="0.5"
            value={primary.strokeWidth || 1}
            onChange={(e) =>
              onUpdateSelected({ strokeWidth: parseFloat(e.target.value) }, true)
            }
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Drafting Color Picker & Hex */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={isHexColor ? activeColor : '#38bdf8'}
              onChange={(e) =>
                onUpdateSelected({ stroke: e.target.value, draftingColor: e.target.value }, true)
              }
              className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-slate-900 p-0.5"
              title="Pick 2D drafting color"
            />
          </div>
          <input
            type="text"
            value={activeColor}
            onChange={(e) =>
              onUpdateSelected({ stroke: e.target.value, draftingColor: e.target.value }, true)
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            placeholder="#38bdf8"
          />
          <button
            type="button"
            onClick={() => onUpdateSelected({ stroke: '#38bdf8', draftingColor: '#38bdf8' }, true)}
            title="Reset to default Sky Cyan"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CAD Drafting Color Palette Swatches */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-medium">2D CAD Drafting Colors:</span>
          <div className="grid grid-cols-6 gap-1.5">
            {CAD_DRAFTING_PALETTE.map((p) => {
              const isSelected = activeColor.toLowerCase() === p.color.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    onUpdateSelected({ stroke: p.color, draftingColor: p.color }, true)
                  }
                  title={p.name}
                  style={{ backgroundColor: p.color }}
                  className={`w-full h-5 rounded border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-white scale-110 shadow-md ring-2 ring-sky-400/60'
                      : 'border-slate-700/80 hover:scale-110'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Telecom Palette Swatches for Stroke */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-400 font-medium">Telecom Signal Standards:</span>
          <div className="grid grid-cols-6 gap-1.5">
            {TELECOM_PALETTE.map((p) => {
              const isSelected = activeColor.toLowerCase() === p.color.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    onUpdateSelected({ stroke: p.color, draftingColor: p.color }, true)
                  }
                  title={p.name}
                  style={{ backgroundColor: p.color }}
                  className={`w-full h-5 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white scale-110 shadow-md ring-2 ring-sky-400/60'
                      : 'border-slate-700/80 hover:scale-110'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* FILL CONTROLS */}
      {primary.type !== 'text' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Fill Color
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400">
              <input
                type="checkbox"
                checked={primary.fillEnabled ?? true}
                onChange={(e) => onUpdateSelected({ fillEnabled: e.target.checked }, true)}
                className="accent-sky-500 rounded"
              />
              <span>Enabled</span>
            </label>
          </div>

          {primary.fillEnabled && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primary.fill && primary.fill.startsWith('#') ? primary.fill : '#1e293b'}
                  onChange={(e) => onUpdateSelected({ fill: e.target.value }, true)}
                  className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primary.fill || '#1e293b'}
                  onChange={(e) => onUpdateSelected({ fill: e.target.value }, true)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Fill Opacity Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Fill Opacity</span>
                  <span className="font-mono text-sky-300">
                    {Math.round((primary.fillOpacity ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={primary.fillOpacity ?? 1}
                  onChange={(e) =>
                    onUpdateSelected({ fillOpacity: parseFloat(e.target.value) }, true)
                  }
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="h-px bg-slate-800" />

      {/* OVERALL OPACITY */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>Overall Opacity</span>
          <span className="font-mono text-sky-300">
            {Math.round((primary.opacity ?? 1) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          value={primary.opacity ?? 1}
          onChange={(e) => onUpdateSelected({ opacity: parseFloat(e.target.value) })}
          className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </>
  );
};
