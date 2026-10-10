/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CADObject, ProjectSettings, ViewportState } from '../types/cad';
import { getCombinedBounds } from '../utils/cad-geometry';
import {
  isCableObject,
  calculateCableLength,
  inferCableType,
  CABLE_TYPE_DEFINITIONS,
  formatCableDisplay,
} from '../utils/cad-geometry/cable-length-calculator';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Ruler, Trash2, Palette, Zap, Server } from 'lucide-react';

interface CanvasTransformToolbarProps {
  selectedObjects: CADObject[];
  viewport: ViewportState;
  settings?: ProjectSettings;
  onRotateSelected: (deltaDeg: number) => void;
  onFlipSelected: (dir: 'h' | 'v') => void;
  onScaleSelected: (factor: number) => void;
  onAutoAddDimensions: () => void;
  onDelete: () => void;
  onUpdateColor?: (color: string) => void;
  onOpenCableSchedule?: () => void;
  onOpenRackDesigner?: (cabinetObj?: CADObject) => void;
}

const QUICK_DRAFTING_COLORS = [
  { name: 'Sky Cyan (RF / Telecom)', color: '#38bdf8' },
  { name: 'Cobalt Blue (AC Mains)', color: '#2563eb' },
  { name: 'Amber Gold (Towers & Steel)', color: '#f59e0b' },
  { name: 'Power Green (Generators)', color: '#16a34a' },
  { name: 'Crimson Red (Alarms)', color: '#ef4444' },
  { name: 'Fiber Violet (Optical)', color: '#a855f7' },
  { name: 'Electric Yellow (DC / Batteries)', color: '#eab308' },
  { name: 'Crisp White (High-Contrast)', color: '#ffffff' },
  { name: 'Slate Gray (Civil)', color: '#94a3b8' },
  { name: 'Technical Black (CAD Ink)', color: '#0f172a' },
];

export const CanvasTransformToolbar: React.FC<CanvasTransformToolbarProps> = ({
  selectedObjects,
  viewport,
  settings,
  onRotateSelected,
  onFlipSelected,
  onScaleSelected,
  onAutoAddDimensions,
  onDelete,
  onUpdateColor,
  onOpenCableSchedule,
  onOpenRackDesigner,
}) => {
  const [showColorPopover, setShowColorPopover] = useState(false);

  if (selectedObjects.length === 0) return null;
  const bounds = getCombinedBounds(selectedObjects);
  if (!bounds) return null;

  const screenX = bounds.centerX * viewport.zoom + viewport.panX;
  const screenY = bounds.minY * viewport.zoom + viewport.panY - 44;

  const primaryObj = selectedObjects[0];
  const activeColor = primaryObj?.draftingColor || primaryObj?.stroke || '#38bdf8';
  const isCable = primaryObj ? isCableObject(primaryObj) : false;
  const cableCalc = isCable && primaryObj ? calculateCableLength(primaryObj, settings?.scaleFactor || 20) : null;
  const cableType = isCable && primaryObj ? inferCableType(primaryObj) : null;
  const cableMeta = cableType ? CABLE_TYPE_DEFINITIONS[cableType] || CABLE_TYPE_DEFINITIONS.custom : null;

  const sId = (primaryObj?.stencilId || primaryObj?.customProps?.stencilType || '').toLowerCase();
  const isCabinetOrRack = primaryObj && (
    sId.includes('cabinet') ||
    sId.includes('odc') ||
    sId.includes('1bay') ||
    sId.includes('2bay') ||
    sId.includes('3bay') ||
    sId.includes('huawei') ||
    sId.includes('ericsson') ||
    sId.includes('eltek') ||
    sId.includes('fushan') ||
    sId.includes('fhodc') ||
    sId.includes('rack') ||
    primaryObj.customProps?.isCabinet === true ||
    primaryObj.customProps?.category === 'cabinets' ||
    primaryObj.customProps?.category === 'racks'
  );

  return (
    <div
      style={{
        left: `${Math.max(140, Math.min(window.innerWidth - 380, screenX))}px`,
        top: `${Math.max(68, screenY)}px`,
      }}
      className="absolute -translate-x-1/2 z-30 pointer-events-auto bg-slate-950/95 border border-sky-500/50 shadow-2xl rounded-full px-2 py-1 flex items-center gap-1 backdrop-blur-md text-xs animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Quick Action: Edit Cabinet / Rack Equipments */}
      {isCabinetOrRack && onOpenRackDesigner && (
        <>
          <button
            type="button"
            onClick={() => onOpenRackDesigner(primaryObj)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-950 to-indigo-950 border border-sky-400 text-sky-200 hover:text-white hover:border-sky-300 transition-all cursor-pointer font-bold text-[10.5px] shadow-sm"
            title="Edit Cabinet Equipments (19-inch Open Bay Rack Elevation & Modules)"
          >
            <Server className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Edit Equipments</span>
          </button>
          <div className="h-3.5 w-px bg-slate-800" />
        </>
      )}

      {/* Auto-Calculated Cable Length Pill */}
      {isCable && cableCalc && (
        <>
          <button
            type="button"
            onClick={onOpenCableSchedule}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-950 to-indigo-950 border border-sky-400 text-sky-200 hover:text-white hover:border-sky-300 transition-all cursor-pointer font-mono text-[10px] shadow-sm"
            title={`Cable length auto-calculated (${cableCalc.horizontalM.toFixed(2)}m run + ${cableCalc.verticalDropM.toFixed(1)}m drop + ${cableCalc.slackPct}% slack). Click to view Site Cable Schedule & BOM.`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold text-sky-300">
              {settings ? formatCableDisplay(cableCalc.totalLengthM, settings) : `${cableCalc.totalLengthM.toFixed(2)}m`}
            </span>
            {cableMeta && (
              <span className="text-[9px] text-slate-300 font-sans hidden sm:inline">
                [{cableMeta.label.split(' ')[0]}]
              </span>
            )}
          </button>
          <div className="h-3.5 w-px bg-slate-800" />
        </>
      )}

      {/* Rotate -90° */}
      <button
        type="button"
        onClick={() => onRotateSelected(-90)}
        title="Rotate Left 90° [Shift+R]"
        className="p-1 hover:bg-slate-800 text-sky-400 hover:text-white rounded-full transition-colors flex items-center gap-0.5 px-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono font-bold">-90°</span>
      </button>

      {/* Rotate +90° */}
      <button
        type="button"
        onClick={() => onRotateSelected(90)}
        title="Rotate Right 90° [R]"
        className="p-1 hover:bg-slate-800 text-sky-400 hover:text-white rounded-full transition-colors flex items-center gap-0.5 px-1.5 cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono font-bold">+90°</span>
      </button>

      {/* Rotate +45° */}
      <button
        type="button"
        onClick={() => onRotateSelected(45)}
        title="Rotate 45° Clockwise"
        className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-[10px] font-mono cursor-pointer"
      >
        +45°
      </button>

      <div className="h-3.5 w-px bg-slate-800" />

      {/* Flip H */}
      <button
        type="button"
        onClick={() => onFlipSelected('h')}
        title="Flip Horizontal"
        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
      >
        <FlipHorizontal className="w-3.5 h-3.5" />
      </button>

      {/* Flip V */}
      <button
        type="button"
        onClick={() => onFlipSelected('v')}
        title="Flip Vertical"
        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
      >
        <FlipVertical className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-px bg-slate-800" />

      {/* Scale -10% */}
      <button
        type="button"
        onClick={() => onScaleSelected(0.9)}
        title="Scale Down 10% [ [ ]"
        className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-[10px] font-mono cursor-pointer"
      >
        -10%
      </button>

      {/* Scale +10% */}
      <button
        type="button"
        onClick={() => onScaleSelected(1.1)}
        title="Scale Up 10% [ ] ]"
        className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-[10px] font-mono cursor-pointer"
      >
        +10%
      </button>

      {/* 2D Drafting Color Selector Popover / Picker */}
      {onUpdateColor && (
        <>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setShowColorPopover((prev) => !prev)}
              title="Change 2D Drafting & Line Color (Not fixed on black)"
              className="p-1 hover:bg-slate-800 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-sm"
                style={{ backgroundColor: activeColor }}
              />
            </button>

            {showColorPopover && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl z-50 flex flex-col gap-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    2D Drafting Color
                  </span>
                  <span className="text-[9px] font-mono text-sky-400">Not fixed on black</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeColor && activeColor.startsWith('#') ? activeColor : '#38bdf8'}
                    onChange={(e) => onUpdateColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-700 cursor-pointer bg-transparent"
                    title="Choose custom color"
                  />
                  <span className="text-[10px] font-mono text-slate-300 flex-1">{activeColor}</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-slate-800">
                  {QUICK_DRAFTING_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        onUpdateColor(c.color);
                        setShowColorPopover(false);
                      }}
                      title={c.name}
                      style={{ backgroundColor: c.color }}
                      className={`w-6 h-6 rounded-md border transition-all cursor-pointer ${
                        activeColor.toLowerCase() === c.color.toLowerCase()
                          ? 'border-white scale-110 shadow-md ring-1 ring-sky-400'
                          : 'border-slate-700/80 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="h-3.5 w-px bg-slate-800" />

      {/* Quick Dimensions */}
      <button
        type="button"
        onClick={onAutoAddDimensions}
        title="Auto Add Standard Dimensions"
        className="p-1 hover:bg-sky-950/80 text-sky-400 hover:text-sky-300 rounded-full transition-colors cursor-pointer"
      >
        <Ruler className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete Selection [Del]"
        className="p-1 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 rounded-full transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
