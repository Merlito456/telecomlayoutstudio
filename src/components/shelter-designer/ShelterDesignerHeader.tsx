/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Box,
  Grid,
  Eye,
  Trash2,
  Save,
  X,
  ArrowUp,
  DoorClosed,
  Zap,
  Camera,
  Compass,
  Layers,
} from 'lucide-react';

export interface ShelterDesignerHeaderProps {
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;
  renderStyle: 'photo' | 'cad';
  setRenderStyle: (style: 'photo' | 'cad') => void;
  roofMode: 'cutaway' | 'transparent' | 'solid';
  setRoofMode: (mode: 'cutaway' | 'transparent' | 'solid') => void;
  roomLengthMm: number;
  setRoomLengthMm: (val: number) => void;
  roomWidthMm: number;
  setRoomWidthMm: (val: number) => void;
  shelterHeightM: number;
  setShelterHeightM: (val: number) => void;
  doorWall: 'south' | 'north' | 'east' | 'west';
  setDoorWall: (w: 'south' | 'north' | 'east' | 'west') => void;
  doorOffsetPct: number;
  setDoorOffsetPct: (val: number) => void;
  cableWall: 'north' | 'south' | 'east' | 'west' | 'none';
  setCableWall: (w: 'north' | 'south' | 'east' | 'west' | 'none') => void;
  cableOffsetPct: number;
  setCableOffsetPct: (val: number) => void;
  doorWidthMm?: number;
  setDoorWidthMm?: (val: number) => void;
  cableHoleDiameterMm?: number;
  setCableHoleDiameterMm?: (val: number) => void;
  onClearAll: () => void;
  onSaveAndSync: () => void;
  onClose: () => void;
}

export const ShelterDesignerHeader: React.FC<ShelterDesignerHeaderProps> = ({
  viewMode,
  setViewMode,
  renderStyle,
  setRenderStyle,
  roofMode,
  setRoofMode,
  roomLengthMm,
  setRoomLengthMm,
  roomWidthMm,
  setRoomWidthMm,
  shelterHeightM,
  setShelterHeightM,
  doorWall,
  setDoorWall,
  doorOffsetPct,
  setDoorOffsetPct,
  cableWall,
  setCableWall,
  cableOffsetPct,
  setCableOffsetPct,
  doorWidthMm,
  setDoorWidthMm,
  cableHoleDiameterMm,
  setCableHoleDiameterMm,
  onClearAll,
  onSaveAndSync,
  onClose,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-wide text-white">
                Telecom Shelter Interior Studio
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                Design Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Focus &amp; place racks, AC units, rectifiers, and overhead cable runways
            </p>
          </div>
        </div>

        {/* View Mode & Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Photo vs CAD Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 shadow-inner">
            <button
              onClick={() => setRenderStyle('photo')}
              title="Photo Mode: Photorealistic textured equipment, realistic floor, and shaded cabinets"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                renderStyle === 'photo'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => setRenderStyle('cad')}
              title="CAD Mode: Standard engineering structural blueprint lines and clearance zones"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                renderStyle === 'cad'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>CAD</span>
            </button>
          </div>

          {/* Roof Mode Toggle: Cutaway / Glass / Solid */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setRoofMode('cutaway')}
              title="Cutaway / Open Roof: All objects added inside are clearly visible and unobstructed by roof"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                roofMode === 'cutaway'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Roof:</span>
              <span>Cutaway (Visible)</span>
            </button>
            <button
              onClick={() => setRoofMode('transparent')}
              title="Translucent Roof: 15% glass sheen showing roof bounds without hiding interior equipment"
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                roofMode === 'transparent'
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Glass</span>
            </button>
            <button
              onClick={() => setRoofMode('solid')}
              title="Solid Roof with Cutaway: Ribbed perimeter standing-seam roof with central inspection cutaway so objects added inside are never hidden"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                roofMode === 'solid'
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Solid (See-Through)</span>
            </button>
          </div>

          {/* 2D / 3D Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                viewMode === '2d'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2D</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>
          </div>

          {/* Clear All Equipment (Empty Shelter) */}
          <button
            onClick={onClearAll}
            title="Empty shelter: Remove all placed equipment inside this shelter"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-800/40 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Empty Shelter</span>
          </button>

          {/* Save & Apply to Site Plan */}
          <button
            onClick={onSaveAndSync}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; Apply to Site</span>
          </button>

          {/* Close / Return */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Secondary Bar: Shelter Room Parameters & Ceiling Height */}
      <div className="h-12 border-b border-slate-800/80 bg-slate-900/60 px-4 flex items-center justify-between text-xs overflow-x-auto gap-4 shrink-0">
        <div className="flex items-center gap-4 shrink-0">
          {/* Room Width & Length */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Room Size:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="100"
                min="1800"
                max="8000"
                value={roomLengthMm}
                onChange={(e) => setRoomLengthMm(Math.max(1800, parseInt(e.target.value) || 3000))}
                className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 font-mono text-center text-xs"
              />
              <span className="text-slate-500">×</span>
              <input
                type="number"
                step="100"
                min="1800"
                max="8000"
                value={roomWidthMm}
                onChange={(e) => setRoomWidthMm(Math.max(1800, parseInt(e.target.value) || 2400))}
                className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 font-mono text-center text-xs"
              />
              <span className="text-slate-400 text-[10px]">mm</span>
            </div>
          </div>

          {/* SHELTER HEIGHT */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
              Shelter Height:
            </span>
            <div className="flex items-center gap-1">
              {[2.4, 2.8, 3.0, 3.2, 3.5].map((h) => (
                <button
                  key={h}
                  onClick={() => setShelterHeightM(h)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    Math.abs(shelterHeightM - h) < 0.05
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {h.toFixed(1)}m
                </button>
              ))}
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="5.0"
                value={shelterHeightM}
                onChange={(e) =>
                  setShelterHeightM(Math.max(2.0, Math.min(5.0, parseFloat(e.target.value) || 3.0)))
                }
                className="w-14 px-1 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-center text-xs ml-1"
              />
              <span className="text-slate-400 text-[10px]">m</span>
            </div>
          </div>

          {/* Door Wall & Offset Selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="text-sky-300 font-semibold text-[11px] flex items-center gap-1">
              <DoorClosed className="w-3 h-3 text-sky-400" />
              Door:
            </span>
            {(['south', 'north', 'east', 'west'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setDoorWall(w)}
                title={`Place Door on ${w.toUpperCase()} wall`}
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-all cursor-pointer ${
                  doorWall === w
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {w[0]}
              </button>
            ))}
            <input
              type="range"
              min="15"
              max="85"
              value={doorOffsetPct}
              onChange={(e) => setDoorOffsetPct(parseInt(e.target.value, 10))}
              title={`Slide to reposition Door along ${doorWall} wall (${doorOffsetPct}%)`}
              className="w-16 accent-sky-500 h-1 bg-slate-800 rounded cursor-pointer ml-1"
            />
            <span className="text-[10px] font-mono text-sky-300 w-7">{doorOffsetPct}%</span>
            {doorWidthMm !== undefined && setDoorWidthMm && (
              <div className="flex items-center gap-1 border-l border-slate-800/80 pl-2">
                <span className="text-slate-400 text-[10px] whitespace-nowrap">Door ⌀:</span>
                <input
                  type="number"
                  min="600"
                  max="2400"
                  step="25"
                  value={doorWidthMm}
                  onChange={(e) => setDoorWidthMm(Math.max(600, Math.min(2400, parseInt(e.target.value, 10) || 900)))}
                  className="w-14 px-1 py-0.5 rounded bg-slate-950 border border-sky-500/40 text-sky-300 font-mono text-center text-[10px]"
                />
                <span className="text-slate-500 text-[9px]">mm</span>
              </div>
            )}
          </div>

          {/* Feeder Hole Wall & Offset Selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="text-amber-300 font-semibold text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Feeder:
            </span>
            {(['east', 'west', 'north', 'south', 'none'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setCableWall(w)}
                title={w === 'none' ? 'Disable Feeder Hole' : `Place Feeder Hole on ${w.toUpperCase()} wall`}
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-all cursor-pointer ${
                  cableWall === w
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {w === 'none' ? 'Off' : w[0]}
              </button>
            ))}
            {cableWall !== 'none' && (
              <>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={cableOffsetPct}
                  onChange={(e) => setCableOffsetPct(parseInt(e.target.value, 10))}
                  title={`Slide to reposition Feeder Hole along ${cableWall} wall (${cableOffsetPct}%)`}
                  className="w-16 accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer ml-1"
                />
                <span className="text-[10px] font-mono text-amber-300 w-7">{cableOffsetPct}%</span>
                {cableHoleDiameterMm !== undefined && setCableHoleDiameterMm && (
                  <div className="flex items-center gap-1 border-l border-slate-800/80 pl-2">
                    <span className="text-slate-400 text-[10px] whitespace-nowrap">Hole ⌀:</span>
                    <input
                      type="number"
                      min="100"
                      max="600"
                      step="25"
                      value={cableHoleDiameterMm}
                      onChange={(e) => setCableHoleDiameterMm(Math.max(100, Math.min(600, parseInt(e.target.value, 10) || 250)))}
                      className="w-12 px-1 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-center text-[10px]"
                    />
                    <span className="text-slate-500 text-[9px]">mm</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cable Ladder Height Clearance Note */}
        <div className="flex items-center gap-2 text-[11px] text-amber-300/90 font-mono shrink-0">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
            Cable Ladder: +{(shelterHeightM - 0.09).toFixed(2)}m (3.5&quot; from ceiling • +
            {Math.max(0.1, shelterHeightM - 0.09 - 2.0).toFixed(2)}m above 42U racks)
          </span>
        </div>
      </div>
    </>
  );
};
