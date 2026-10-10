/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wind, ThermometerSnowflake, ArrowUp, Check, X, ShieldCheck } from 'lucide-react';
import { INTERIOR_STENCILS } from './catalog';

interface AddWallMountACModalProps {
  isOpen: boolean;
  onClose: () => void;
  stencil: (typeof INTERIOR_STENCILS)[0];
  roomLengthMm: number;
  roomWidthMm: number;
  shelterHeightM: number;
  doorWall?: 'south' | 'north' | 'east' | 'west';
  cableWall?: 'north' | 'south' | 'east' | 'west' | 'none';
  existingACCount: number;
  onConfirmAdd: (config: {
    wall: 'north' | 'south' | 'east' | 'west';
    offsetPct: number;
    elevationMm: number;
    coolingCapacity: string;
    targetTempC: number;
  }) => void;
}

export const AddWallMountACModal: React.FC<AddWallMountACModalProps> = ({
  isOpen,
  onClose,
  stencil,
  roomLengthMm,
  roomWidthMm,
  shelterHeightM,
  doorWall = 'south',
  cableWall = 'east',
  existingACCount,
  onConfirmAdd,
}) => {
  if (!isOpen) return null;

  // Determine smart default wall (e.g. North if empty, or South if North is taken)
  const defaultWall: 'north' | 'south' | 'east' | 'west' =
    existingACCount === 0 ? 'north' : existingACCount === 1 ? 'south' : 'east';

  const [selectedWall, setSelectedWall] = useState<'north' | 'south' | 'east' | 'west'>(defaultWall);
  const [offsetPct, setOffsetPct] = useState<number>(existingACCount % 2 === 0 ? 50 : 70);
  const [elevationMm, setElevationMm] = useState<number>(2200);
  const [coolingCapacity, setCoolingCapacity] = useState<string>('2.5 HP (24,000 BTU)');
  const [targetTempC, setTargetTempC] = useState<number>(20);

  const maxElevMm = Math.round((shelterHeightM - 0.15) * 1000);
  const ceilingClearanceM = Math.max(0, shelterHeightM - elevationMm / 1000).toFixed(2);
  const elevationM = (elevationMm / 1000).toFixed(2);

  const wallLengthMm =
    selectedWall === 'north' || selectedWall === 'south' ? roomLengthMm : roomWidthMm;
  const positionMm = Math.round(wallLengthMm * (offsetPct / 100));

  const handleConfirm = () => {
    onConfirmAdd({
      wall: selectedWall,
      offsetPct,
      elevationMm,
      coolingCapacity,
      targetTempC,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/50 max-w-lg w-full overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-sky-950/80 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-200 flex items-center gap-1.5">
                Add Wall-Mount AC to Shelter
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-normal">
                  Unit #{existingACCount + 1}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure indoor wall mounting placement and installation height
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Visual Mini Shelter Wall Schematic */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">
              Shelter Wall Layout ({roomLengthMm} × {roomWidthMm} mm)
            </div>
            <div className="relative w-64 h-36 border-2 border-slate-700 bg-slate-900/60 rounded-md flex items-center justify-center">
              {/* North Wall */}
              <div
                onClick={() => setSelectedWall('north')}
                className={`absolute -top-3 left-6 right-6 h-6 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                  selectedWall === 'north'
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30 font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                ▲ NORTH WALL {doorWall === 'north' && '(Door)'} {cableWall === 'north' && '(Feeder)'}
              </div>

              {/* South Wall */}
              <div
                onClick={() => setSelectedWall('south')}
                className={`absolute -bottom-3 left-6 right-6 h-6 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                  selectedWall === 'south'
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30 font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                ▼ SOUTH WALL {doorWall === 'south' && '(Door)'} {cableWall === 'south' && '(Feeder)'}
              </div>

              {/* West Wall */}
              <div
                onClick={() => setSelectedWall('west')}
                className={`absolute top-6 bottom-6 -left-3 w-6 rounded flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all [writing-mode:vertical-rl] rotate-180 ${
                  selectedWall === 'west'
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30 font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                WEST
              </div>

              {/* East Wall */}
              <div
                onClick={() => setSelectedWall('east')}
                className={`absolute top-6 bottom-6 -right-3 w-6 rounded flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all [writing-mode:vertical-rl] ${
                  selectedWall === 'east'
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30 font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                EAST
              </div>

              <div className="text-center">
                <span className="text-[11px] font-bold text-cyan-300 block">
                  Mounting to {selectedWall.toUpperCase()} WALL
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Offset: {offsetPct}% ({positionMm}mm) · Elevation: +{elevationM}m
                </span>
              </div>
            </div>
          </div>

          {/* Wall Selection Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>1. Select Placement Wall:</span>
              <span className="text-cyan-400 font-mono text-[11px] capitalize">
                {selectedWall} Wall
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['north', 'south', 'east', 'west'] as const).map((w) => {
                const isSelected = selectedWall === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWall(w)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex flex-col items-center gap-0.5 border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{w} Wall</span>
                    <span
                      className={`text-[9px] font-normal ${
                        isSelected ? 'text-slate-950 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {w === 'north' || w === 'south' ? `${roomLengthMm}mm` : `${roomWidthMm}mm`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position Along Wall (% Offset) */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">2. Position Along Wall:</span>
              <span className="font-mono text-cyan-400 font-bold text-xs">
                {offsetPct}% ({positionMm} mm from wall start)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="85"
              value={offsetPct}
              onChange={(e) => setOffsetPct(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex gap-2">
              {[
                { label: 'Left (25%)', val: 25 },
                { label: 'Center (50%)', val: 50 },
                { label: 'Right (75%)', val: 75 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setOffsetPct(p.val)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                    offsetPct === p.val
                      ? 'bg-cyan-950 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Height of Placement (Elevation from floor) */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                3. Height of Placement (Elevation):
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={500}
                  max={maxElevMm}
                  step={50}
                  value={elevationMm}
                  onChange={(e) =>
                    setElevationMm(
                      Math.max(500, Math.min(maxElevMm, parseInt(e.target.value, 10) || 2200))
                    )
                  }
                  className="w-20 px-2 py-0.5 rounded-lg bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-center text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <span className="text-slate-400 font-mono text-xs">mm ({elevationM}m)</span>
              </div>
            </div>

            <input
              type="range"
              min="800"
              max={maxElevMm}
              step="50"
              value={elevationMm}
              onChange={(e) => setElevationMm(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Quick Height Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: '1.80m', desc: 'Low', mm: 1800 },
                { label: '2.00m', desc: 'Mid', mm: 2000 },
                { label: '2.20m', desc: 'Standard', mm: 2200 },
                { label: '2.40m', desc: 'High', mm: 2400 },
                { label: '2.60m', desc: 'Ceiling', mm: 2600 },
              ].map((h) => {
                const isSelected = Math.abs(elevationMm - h.mm) < 30;
                return (
                  <button
                    key={h.mm}
                    type="button"
                    onClick={() => setElevationMm(h.mm)}
                    className={`py-1 px-1.5 rounded-lg text-center cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-mono">{h.label}</div>
                    <div
                      className={`text-[8.5px] ${
                        isSelected ? 'text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {h.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clearance Readout */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Ceiling Clearance:
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                +{ceilingClearanceM}m below ceiling (Room height: {shelterHeightM.toFixed(2)}m)
              </span>
            </div>
          </div>

          {/* Cooling Specs & Target Temperature */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Cooling Capacity:</span>
              <select
                value={coolingCapacity}
                onChange={(e) => setCoolingCapacity(e.target.value)}
                className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 cursor-pointer focus:outline-none focus:border-cyan-400 font-medium"
              >
                <option value="1.5 HP (12,000 BTU)">1.5 HP (12,000 BTU)</option>
                <option value="2.0 HP (18,000 BTU)">2.0 HP (18,000 BTU)</option>
                <option value="2.5 HP (24,000 BTU)">2.5 HP (24,000 BTU - Standard)</option>
                <option value="3.0 HP (36,000 BTU)">3.0 HP (36,000 BTU - Heavy Duty)</option>
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Target Temp:</span>
                <span className="font-mono text-cyan-300 font-bold">{targetTempC}°C</span>
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setTargetTempC((t) => Math.max(16, t - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono text-cyan-300 font-bold text-xs bg-slate-900 py-1 rounded-lg border border-cyan-500/30">
                  {targetTempC}°C
                </div>
                <button
                  type="button"
                  onClick={() => setTargetTempC((t) => Math.min(26, t + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-sky-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Add AC (Mount to {selectedWall.toUpperCase()} Wall at +{elevationM}m)
          </button>
        </div>
      </div>
    </div>
  );
};
