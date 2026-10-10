/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject } from '../../types/cad';
import { Wind, ArrowUp, ThermometerSnowflake, Check, Shield } from 'lucide-react';

interface AirConditionerCustomizerProps {
  primary: CADObject;
  allObjects?: CADObject[];
  onUpdateSelected: (updates: Partial<CADObject>, cascadeToChildren?: boolean) => void;
}

export const AirConditionerCustomizer: React.FC<AirConditionerCustomizerProps> = ({
  primary,
  allObjects = [],
  onUpdateSelected,
}) => {
  const sId = String(primary.stencilId || primary.customProps?.stencilType || '').toLowerCase();
  const isAC =
    sId.includes('wall-mount-ac') ||
    sId.includes('air-conditioner') ||
    primary.category === 'cooling' ||
    primary.customProps?.category === 'cooling';

  if (!isAC) return null;

  const currentElevMm = Number(
    primary.elevationMm ??
      primary.customProps?.elevationMm ??
      primary.customProps?.placementHeightMm ??
      2200
  );
  const currentElevM = (currentElevMm / 1000).toFixed(2);
  const currentWall = (primary.customProps?.wallAttachment || 'north') as 'north' | 'south' | 'east' | 'west';
  const currentOffset = Number(primary.customProps?.wallOffsetPct ?? 50);
  const currentTemp = Number(primary.customProps?.targetTempC ?? 20);
  const currentCap = primary.customProps?.coolingCapacity || '2.5 HP (24,000 BTU)';

  const handleSetElevation = (elevMm: number) => {
    const clamped = Math.max(300, Math.min(5000, Math.round(elevMm)));
    const elevM = (clamped / 1000).toFixed(1);

    // Update label text if children has a label
    let updatedChildren = primary.children;
    if (Array.isArray(primary.children)) {
      updatedChildren = primary.children.map((c) => {
        if (c.type === 'text' && c.isStencilLabel) {
          return { ...c, text: `WALL AC (+${elevM}m)` };
        }
        return c;
      });
    }

    onUpdateSelected({
      elevationMm: clamped,
      customProps: {
        ...(primary.customProps || {}),
        elevationMm: clamped,
        placementHeightM: Number((clamped / 1000).toFixed(2)),
      },
      children: updatedChildren,
    });
  };

  const handleSetWall = (wall: 'north' | 'south' | 'east' | 'west') => {
    let rot = primary.rotation || 0;
    if (wall === 'north') rot = 0;
    else if (wall === 'south') rot = 180;
    else if (wall === 'west') rot = 270;
    else if (wall === 'east') rot = 90;

    onUpdateSelected({
      rotation: rot,
      customProps: {
        ...(primary.customProps || {}),
        wallAttachment: wall,
      },
    });
  };

  // Find nearest shelter on canvas
  const nearbyShelter = allObjects.find(
    (o) =>
      o.id !== primary.id &&
      (o.stencilId === 'shelter' ||
        o.stencilId === 'cement-shelter' ||
        o.customProps?.stencilType === 'shelter' ||
        o.customProps?.stencilType === 'cement-shelter')
  );

  const handleSnapToShelter = () => {
    if (!nearbyShelter) return;
    const shelterX = nearbyShelter.x;
    const shelterY = nearbyShelter.y;
    const shelterW = nearbyShelter.width || 180;
    const shelterH = nearbyShelter.height || 140;

    // Attach to north inside face of shelter
    const newX = shelterX + (shelterW - primary.width) / 2;
    const newY = shelterY + 12;

    onUpdateSelected({
      x: newX,
      y: newY,
      rotation: 0,
      customProps: {
        ...(primary.customProps || {}),
        wallAttachment: 'north',
        shelterParentId: nearbyShelter.id,
      },
    });
  };

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/50 space-y-3 shadow-md shadow-cyan-950/20 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          Wall-Mount AC Unit
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
          +{currentElevM}m Elev.
        </span>
      </div>

      {/* 1. Placement Wall / Orientation Selector */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10.5px]">
          <span className="text-slate-300 font-semibold">Wall Orientation:</span>
          <span className="font-mono text-cyan-300 font-bold uppercase text-[10px]">
            {currentWall} Wall ({primary.rotation || 0}°)
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(['north', 'south', 'east', 'west'] as const).map((w) => {
            const active = currentWall === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => handleSetWall(w)}
                className={`py-1.5 rounded text-[10px] font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {active && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{w}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Height of Placement (Mounting Elevation) */}
      <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 space-y-2">
        <div className="flex justify-between items-center text-[10.5px]">
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            Height of Placement:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={300}
              max={5000}
              step={50}
              value={currentElevMm}
              onChange={(e) => handleSetElevation(parseInt(e.target.value, 10) || 2200)}
              className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-400 text-cyan-200 font-mono text-center font-bold text-xs"
            />
            <span className="text-slate-400 font-mono text-[10px]">mm</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="500"
          max="3500"
          step="50"
          value={currentElevMm}
          onChange={(e) => handleSetElevation(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
        />

        {/* Quick Presets */}
        <div className="grid grid-cols-5 gap-1">
          {[
            { label: '1.8m', mm: 1800 },
            { label: '2.0m', mm: 2000 },
            { label: '2.2m', mm: 2200 },
            { label: '2.4m', mm: 2400 },
            { label: '2.6m', mm: 2600 },
          ].map((hp) => {
            const active = Math.abs(currentElevMm - hp.mm) < 40;
            return (
              <button
                key={hp.mm}
                type="button"
                onClick={() => handleSetElevation(hp.mm)}
                className={`py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {hp.label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span>Mounting Level:</span>
          <span className="font-mono text-cyan-300 font-bold">+{currentElevM}m ({currentElevMm} mm)</span>
        </div>
      </div>

      {/* 3. Cooling Setpoint & Capacity */}
      <div className="space-y-2 pt-1 border-t border-slate-800 text-[10.5px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 flex items-center gap-1 font-semibold">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
            Set Temperature:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onUpdateSelected({
                  customProps: { ...(primary.customProps || {}), targetTempC: Math.max(16, currentTemp - 1) },
                })
              }
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-mono font-bold cursor-pointer"
            >
              -
            </button>
            <span className="font-mono text-cyan-300 font-bold text-xs px-2 py-0.5 rounded bg-slate-950 border border-cyan-500/30">
              {currentTemp}°C
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateSelected({
                  customProps: { ...(primary.customProps || {}), targetTempC: Math.min(28, currentTemp + 1) },
                })
              }
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-mono font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Capacity:</span>
          <select
            value={currentCap}
            onChange={(e) =>
              onUpdateSelected({
                customProps: { ...(primary.customProps || {}), coolingCapacity: e.target.value },
              })
            }
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono focus:outline-none cursor-pointer"
          >
            <option value="1.5 HP (12,000 BTU)">1.5 HP (12k BTU)</option>
            <option value="2.0 HP (18,000 BTU)">2.0 HP (18k BTU)</option>
            <option value="2.5 HP (24,000 BTU)">2.5 HP (24k BTU)</option>
            <option value="3.0 HP (36,000 BTU)">3.0 HP (36k BTU)</option>
          </select>
        </div>
      </div>

      {/* Snap to Shelter Button if nearby */}
      {nearbyShelter && (
        <button
          type="button"
          onClick={handleSnapToShelter}
          className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-[10.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Snap to Shelter North Wall</span>
        </button>
      )}
    </div>
  );
};
