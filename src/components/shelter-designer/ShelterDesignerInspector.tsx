/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Trash2,
  RotateCw,
  Copy,
  Zap,
  Server,
  Shield,
  DoorClosed,
  BatteryCharging,
  Minus,
  Plus,
  Cpu,
  Layers,
  MoveHorizontal,
  Maximize2,
  AlignHorizontalJustifyCenter,
  Wind,
  ThermometerSnowflake,
  ArrowUp,
  Check,
  Ruler,
} from 'lucide-react';
import { InteriorEquipmentItem } from './index';

export interface ShelterDesignerInspectorProps {
  selectedItem: InteriorEquipmentItem | null;
  shelterHeightM: number;
  items: InteriorEquipmentItem[];
  roomLengthMm: number;
  roomWidthMm: number;
  doorWall: 'south' | 'north' | 'east' | 'west';
  setDoorWall: (w: 'south' | 'north' | 'east' | 'west') => void;
  doorOffsetPct: number;
  setDoorOffsetPct: (val: number) => void;
  doorWidthMm: number;
  setDoorWidthMm: (val: number) => void;
  cableWall: 'north' | 'south' | 'east' | 'west' | 'none';
  setCableWall: (w: 'north' | 'south' | 'east' | 'west' | 'none') => void;
  cableOffsetPct: number;
  setCableOffsetPct: (val: number) => void;
  onRotateSelected: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onUpdateSelectedItem?: (partial: Partial<InteriorEquipmentItem>) => void;
  activeOpening?: 'door' | 'feeder' | null;
  setActiveOpening?: (op: 'door' | 'feeder' | null) => void;
  cableHoleDiameterMm?: number;
  setCableHoleDiameterMm?: (val: number) => void;
  cableHoleElevationMm?: number;
  setCableHoleElevationMm?: (val: number) => void;
}

export const ShelterDesignerInspector: React.FC<ShelterDesignerInspectorProps> = ({
  selectedItem,
  shelterHeightM,
  items,
  roomLengthMm,
  roomWidthMm,
  doorWall,
  setDoorWall,
  doorOffsetPct,
  setDoorOffsetPct,
  doorWidthMm,
  setDoorWidthMm,
  cableWall,
  setCableWall,
  cableOffsetPct,
  setCableOffsetPct,
  onRotateSelected,
  onDuplicateSelected,
  onDeleteSelected,
  onUpdateSelectedItem,
  activeOpening = null,
  setActiveOpening,
  cableHoleDiameterMm = 250,
  setCableHoleDiameterMm,
  cableHoleElevationMm,
  setCableHoleElevationMm,
}) => {
  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900/70 flex flex-col shrink-0 p-3 space-y-4 overflow-y-auto">
      {/* Active Opening Direct Inspector Banner if Door or Feeder Hole is clicked */}
      {activeOpening === 'door' && (
        <div className="p-3 rounded-xl bg-sky-950/70 border-2 border-sky-400 space-y-2 shadow-lg shadow-sky-950/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-sky-300 flex items-center gap-1.5 uppercase">
              <DoorClosed className="w-4 h-4 text-sky-400" />
              Selected: Access Door
            </span>
            <button
              type="button"
              onClick={() => setActiveOpening?.(null)}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
          <p className="text-[10.5px] text-sky-200/80">
            Reposition the access door along any wall or click presets below:
          </p>
          <div className="grid grid-cols-4 gap-1">
            {(['north', 'south', 'east', 'west'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setDoorWall(w)}
                className={`py-1 rounded text-[10px] font-bold capitalize transition-all cursor-pointer ${
                  doorWall === w
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300">
              <span>Position along {doorWall} wall:</span>
              <span className="font-mono text-sky-300 font-bold">
                {Math.round(((doorWall === 'north' || doorWall === 'south' ? roomLengthMm : roomWidthMm) * doorOffsetPct) / 100)} mm ({doorOffsetPct}%)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={doorOffsetPct}
              onChange={(e) => setDoorOffsetPct(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex gap-1 pt-0.5">
              {[
                { label: 'Left (25%)', val: 25 },
                { label: 'Center (50%)', val: 50 },
                { label: 'Right (75%)', val: 75 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setDoorOffsetPct(p.val)}
                  className={`flex-1 py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                    doorOffsetPct === p.val
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Door Diameter / Width Controls */}
          <div className="pt-2 mt-2 border-t border-sky-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-sky-200">Door Diameter / Width (⌀):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="600"
                  max="2400"
                  step="25"
                  value={doorWidthMm}
                  onChange={(e) => setDoorWidthMm(Math.max(600, Math.min(2400, parseInt(e.target.value, 10) || 900)))}
                  className="w-14 px-1 py-0.5 rounded bg-slate-900 border border-sky-400 text-sky-200 font-mono text-center text-xs"
                />
                <span className="text-slate-400 font-mono text-[9px]">mm</span>
              </div>
            </div>
            <input
              type="range"
              min="600"
              max="2400"
              step="25"
              value={doorWidthMm}
              onChange={(e) => setDoorWidthMm(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="grid grid-cols-6 gap-1">
              {[750, 800, 900, 1000, 1200, 1500].map((dw) => (
                <button
                  key={dw}
                  type="button"
                  onClick={() => setDoorWidthMm(dw)}
                  className={`py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                    doorWidthMm === dw
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {dw}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeOpening === 'feeder' && (
        <div className="p-3 rounded-xl bg-amber-950/70 border-2 border-amber-400 space-y-2 shadow-lg shadow-amber-950/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5 uppercase">
              <Zap className="w-4 h-4 text-amber-400" />
              Selected: Feeder Cable Hole
            </span>
            <button
              type="button"
              onClick={() => setActiveOpening?.(null)}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
          <p className="text-[10.5px] text-amber-200/80">
            Reposition the cable gland entry hole along any wall or choose presets:
          </p>
          <div className="grid grid-cols-5 gap-1">
            {(['north', 'south', 'east', 'west', 'none'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setCableWall(w)}
                className={`py-1 rounded text-[9.5px] font-bold capitalize transition-all cursor-pointer ${
                  cableWall === w
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          {cableWall !== 'none' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>Position along {cableWall} wall:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {Math.round(((cableWall === 'north' || cableWall === 'south' ? roomLengthMm : roomWidthMm) * cableOffsetPct) / 100)} mm ({cableOffsetPct}%)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={cableOffsetPct}
                onChange={(e) => setCableOffsetPct(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <div className="flex gap-1 pt-0.5">
                {[
                  { label: 'Left (25%)', val: 25 },
                  { label: 'Center (50%)', val: 50 },
                  { label: 'Right (75%)', val: 75 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setCableOffsetPct(p.val)}
                    className={`flex-1 py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                      cableOffsetPct === p.val
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Feeder Hole Diameter Controls */}
              <div className="pt-2 mt-2 border-t border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-amber-200">Feeder Hole Diameter (⌀):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="100"
                      max="600"
                      step="25"
                      value={cableHoleDiameterMm}
                      onChange={(e) => setCableHoleDiameterMm?.(Math.max(100, Math.min(600, parseInt(e.target.value, 10) || 250)))}
                      className="w-14 px-1 py-0.5 rounded bg-slate-900 border border-amber-400 text-amber-200 font-mono text-center text-xs"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">mm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="25"
                  value={cableHoleDiameterMm}
                  onChange={(e) => setCableHoleDiameterMm?.(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="grid grid-cols-5 gap-1">
                  {[150, 200, 250, 300, 400].map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setCableHoleDiameterMm?.(dia)}
                      className={`py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                        cableHoleDiameterMm === dia
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeder Vertical Level / Elevation (Height from floor) */}
              <div className="pt-2 mt-2 border-t border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-amber-200">Feeder Vertical Level (Height from Floor):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1000"
                      max={Math.round(shelterHeightM * 1000 - 100)}
                      step="25"
                      value={cableHoleElevationMm ?? Math.round(shelterHeightM * 1000 - 350)}
                      onChange={(e) =>
                        setCableHoleElevationMm?.(
                          Math.max(1000, Math.min(Math.round(shelterHeightM * 1000 - 100), parseInt(e.target.value, 10) || 2450))
                        )
                      }
                      className="w-16 px-1 py-0.5 rounded bg-slate-900 border border-amber-400 text-amber-200 font-mono text-center text-xs"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">mm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1000"
                  max={Math.round(shelterHeightM * 1000 - 100)}
                  step="25"
                  value={cableHoleElevationMm ?? Math.round(shelterHeightM * 1000 - 350)}
                  onChange={(e) => setCableHoleElevationMm?.(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="flex gap-1 pt-0.5">
                  {[
                    { label: 'Ladder Runway (Rec.)', val: Math.round(shelterHeightM * 1000 - 350) },
                    { label: 'Ceiling Flush', val: Math.round(shelterHeightM * 1000 - 200) },
                    { label: 'High Wall (2200mm)', val: 2200 },
                  ].map((p) => {
                    const currentElev = cableHoleElevationMm ?? Math.round(shelterHeightM * 1000 - 350);
                    const isSelected = Math.abs(currentElev - p.val) < 25;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setCableHoleElevationMm?.(p.val)}
                        className={`flex-1 py-1 rounded text-[9px] font-mono cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/20 text-[9.5px] text-amber-300/80 leading-relaxed">
                  Telecom Standard: Feeder gland plate sits high at the overhead cable ladder runway level to smoothly transition external feeder bundles onto internal cable trays.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedItem ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedItem.strokeColor }}
              />
              <h3 className="text-xs font-bold text-white truncate">{selectedItem.name}</h3>
            </div>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex items-center gap-1 px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white rounded text-xs transition-all cursor-pointer shadow-sm shrink-0"
              title="Delete this equipment item (Delete / Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold text-[10px]">Delete</span>
            </button>
          </div>

          {/* Dedicated Wall-Mount AC Placement & Height Customizer */}
          {(() => {
            const isAC =
              selectedItem.category === 'cooling' ||
              selectedItem.stencilId.toLowerCase().includes('ac') ||
              selectedItem.stencilId.toLowerCase().includes('split') ||
              selectedItem.stencilId.toLowerCase().includes('cool') ||
              selectedItem.name.toLowerCase().includes('ac') ||
              selectedItem.name.toLowerCase().includes('air conditioner') ||
              selectedItem.name.toLowerCase().includes('cooling');

            if (!isAC) return null;

            // Determine active wall: either stored in wallAttachment or inferred from position/rotation
            const explicitWall = selectedItem.wallAttachment && selectedItem.wallAttachment !== 'none'
              ? selectedItem.wallAttachment
              : null;
            let activeWall: 'north' | 'south' | 'east' | 'west' =
              explicitWall ||
              (selectedItem.rotationDeg === 180
                ? 'south'
                : selectedItem.rotationDeg === 90
                ? 'east'
                : selectedItem.rotationDeg === 270
                ? 'west'
                : selectedItem.yMm > roomWidthMm / 2
                ? 'south'
                : selectedItem.xMm < 100
                ? 'west'
                : selectedItem.xMm > roomLengthMm - 600
                ? 'east'
                : 'north');

            const currentOffsetPct =
              typeof selectedItem.wallOffsetPct === 'number'
                ? selectedItem.wallOffsetPct
                : activeWall === 'north' || activeWall === 'south'
                ? Math.round(
                    Math.max(
                      10,
                      Math.min(
                        90,
                        ((selectedItem.xMm + selectedItem.widthMm / 2) / roomLengthMm) * 100
                      )
                    )
                  )
                : Math.round(
                    Math.max(
                      10,
                      Math.min(
                        90,
                        ((selectedItem.yMm + selectedItem.depthMm / 2) / roomWidthMm) * 100
                      )
                    )
                  );

            const currentElevMm = selectedItem.elevationMm ?? 2200;
            const currentElevM = (currentElevMm / 1000).toFixed(2);
            const ceilingClearanceM = Math.max(0, shelterHeightM - currentElevMm / 1000).toFixed(2);
            const currentTemp = selectedItem.targetTempC ?? 20;
            const currentCap = selectedItem.coolingCapacity || '2.5 HP (24,000 BTU)';

            const handleSetWall = (wall: 'north' | 'south' | 'east' | 'west', offsetPct = currentOffsetPct) => {
              const clampedOffset = Math.max(10, Math.min(90, offsetPct));
              let newX = selectedItem.xMm;
              let newY = selectedItem.yMm;
              let newRot = selectedItem.rotationDeg;

              if (wall === 'north') {
                newRot = 0; // Front faces South into room
                newX = Math.round((roomLengthMm - selectedItem.widthMm) * (clampedOffset / 100));
                newY = 0; // Flush to North wall
              } else if (wall === 'south') {
                newRot = 180; // Front faces North into room
                newX = Math.round((roomLengthMm - selectedItem.widthMm) * (clampedOffset / 100));
                newY = Math.max(0, roomWidthMm - selectedItem.depthMm); // Flush to South wall
              } else if (wall === 'west') {
                newRot = 270; // Front faces East into room
                newX = Math.round(selectedItem.depthMm / 2 - selectedItem.widthMm / 2); // Center aligns flush to West wall
                newY = Math.round((roomWidthMm - selectedItem.depthMm) * (clampedOffset / 100));
              } else if (wall === 'east') {
                newRot = 90; // Front faces West into room
                newX = Math.round(roomLengthMm - selectedItem.depthMm / 2 - selectedItem.widthMm / 2); // Center aligns flush to East wall
                newY = Math.round((roomWidthMm - selectedItem.depthMm) * (clampedOffset / 100));
              }

              onUpdateSelectedItem?.({
                wallAttachment: wall,
                wallOffsetPct: clampedOffset,
                xMm: newX,
                yMm: newY,
                rotationDeg: newRot,
              });
            };

            const handleSetElevation = (elevMm: number) => {
              const maxElevMm = Math.round((shelterHeightM - 0.15) * 1000);
              const clamped = Math.max(300, Math.min(maxElevMm, Math.round(elevMm)));
              onUpdateSelectedItem?.({ elevationMm: clamped });
            };

            return (
              <div className="p-3 rounded-xl bg-slate-950 border-2 border-cyan-500/70 space-y-3 shadow-lg shadow-cyan-950/30 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5 uppercase">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    Wall-Mount AC Placement
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                    +{currentElevM}m Elev.
                  </span>
                </div>

                {/* 1. Placement Wall Selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <span>Wall Attachment:</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold uppercase text-[10px]">
                      {activeWall} Wall
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['north', 'south', 'east', 'west'] as const).map((w) => {
                      const isActive = activeWall === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleSetWall(w)}
                          className={`py-1.5 rounded text-[10px] font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isActive
                              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{w}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Position along the Wall */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-300 font-semibold">Position along {activeWall} wall:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {Math.round(
                        ((activeWall === 'north' || activeWall === 'south' ? roomLengthMm : roomWidthMm) *
                          currentOffsetPct) /
                          100
                      )}{' '}
                      mm ({currentOffsetPct}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={currentOffsetPct}
                    onChange={(e) => handleSetWall(activeWall, parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex gap-1 pt-0.5">
                    {[
                      { label: 'Left (25%)', val: 25 },
                      { label: 'Center (50%)', val: 50 },
                      { label: 'Right (75%)', val: 75 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => handleSetWall(activeWall, p.val)}
                        className={`flex-1 py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                          currentOffsetPct === p.val
                            ? 'bg-cyan-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Height of Placement (Mounting Elevation) */}
                <div className="space-y-2 pt-2 border-t border-cyan-500/30">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-200 font-semibold flex items-center gap-1">
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                      Height of Placement:
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={300}
                        max={Math.round((shelterHeightM - 0.1) * 1000)}
                        step={50}
                        value={currentElevMm}
                        onChange={(e) => handleSetElevation(parseInt(e.target.value, 10) || 2200)}
                        className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-400 text-cyan-200 font-mono text-center font-bold text-xs"
                      />
                      <span className="text-slate-400 font-mono text-[10px]">mm</span>
                    </div>
                  </div>

                  {/* Height Slider */}
                  <input
                    type="range"
                    min="500"
                    max={Math.round((shelterHeightM - 0.15) * 1000)}
                    step="50"
                    value={currentElevMm}
                    onChange={(e) => handleSetElevation(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />

                  {/* Quick Height Presets */}
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { label: '1.8m', mm: 1800, tip: 'Eye-level' },
                      { label: '2.0m', mm: 2000, tip: 'Mid-wall' },
                      { label: '2.2m', mm: 2200, tip: 'Std High-Wall' },
                      { label: '2.4m', mm: 2400, tip: 'High' },
                      { label: '2.6m', mm: 2600, tip: 'Ceiling' },
                    ].map((hp) => {
                      const isActive = Math.abs(currentElevMm - hp.mm) < 40;
                      return (
                        <button
                          key={hp.mm}
                          type="button"
                          onClick={() => handleSetElevation(hp.mm)}
                          className={`py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                            isActive
                              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={`${hp.label} (${hp.tip})`}
                        >
                          {hp.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Placement Elevation & Ceiling Clearance Readout Card */}
                  <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-[10.5px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-cyan-300/80">Mounting Height:</span>
                      <span className="font-mono font-bold text-cyan-200">
                        +{currentElevM}m ({currentElevMm} mm)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300/80">Ceiling Clearance:</span>
                      <span className="font-mono font-bold text-emerald-300">
                        +{ceilingClearanceM}m below ceiling
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300/80">Airflow Direction:</span>
                      <span className="font-mono text-slate-300">
                        Facing inward into room
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Target Temperature & Capacity Controls */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
                      Set Temperature:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateSelectedItem?.({ targetTempC: Math.max(16, currentTemp - 1) })}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-mono font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-cyan-300 font-bold text-xs px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30">
                        {currentTemp}°C
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateSelectedItem?.({ targetTempC: Math.min(28, currentTemp + 1) })}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-mono font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Cooling Capacity:</span>
                    <select
                      value={currentCap}
                      onChange={(e) => onUpdateSelectedItem?.({ coolingCapacity: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono focus:outline-none cursor-pointer"
                    >
                      <option value="1.5 HP (12,000 BTU)">1.5 HP (12k BTU)</option>
                      <option value="2.0 HP (18,000 BTU)">2.0 HP (18k BTU)</option>
                      <option value="2.5 HP (24,000 BTU)">2.5 HP (24k BTU)</option>
                      <option value="3.0 HP (36,000 BTU)">3.0 HP (36k BTU)</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dedicated Cable Ladder Runway Customizer / Expand Length */}
          {(() => {
            const isLadder =
              selectedItem.category === 'ladder' ||
              selectedItem.stencilId.toLowerCase().includes('ladder') ||
              selectedItem.stencilId.toLowerCase().includes('raceway') ||
              selectedItem.stencilId.toLowerCase().includes('runway') ||
              selectedItem.name.toLowerCase().includes('ladder') ||
              selectedItem.name.toLowerCase().includes('raceway');

            if (!isLadder) return null;

            const currentLenMm = selectedItem.widthMm;
            const currentTrayWidthMm = selectedItem.depthMm;
            const rungsCount = Math.max(3, Math.floor(currentLenMm / 200));

            const handleSetLength = (len: number) => {
              const clamped = Math.max(300, Math.min(12000, Math.round(len)));
              onUpdateSelectedItem?.({ widthMm: clamped });
            };

            const handleNudgeLength = (delta: number) => {
              handleSetLength(currentLenMm + delta);
            };

            return (
              <div className="p-3 rounded-xl bg-slate-950 border-2 border-amber-500/70 space-y-3 shadow-lg shadow-amber-950/30 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5 uppercase">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Overhead Cable Ladder
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                    {(currentLenMm / 1000).toFixed(2)}m Span
                  </span>
                </div>

                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-[10.5px] text-amber-200/90 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-amber-300/80">Calculated Rungs:</span>
                    <span className="font-mono font-bold text-amber-300">~{rungsCount} cross-rungs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-300/80">Ceiling Clearance:</span>
                    <span className="font-mono font-bold text-emerald-300">
                      +{(shelterHeightM - 0.09).toFixed(2)}m (Overhead)
                    </span>
                  </div>
                </div>

                {/* Length Steppers & Direct Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <MoveHorizontal className="w-3.5 h-3.5 text-amber-400" />
                      Ladder Length (Span):
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={300}
                        max={12000}
                        step={50}
                        value={currentLenMm}
                        onChange={(e) => handleSetLength(parseInt(e.target.value, 10) || 1500)}
                        className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500 text-amber-300 font-mono text-center font-bold text-xs"
                      />
                      <span className="text-slate-400 font-mono text-[10px]">mm</span>
                    </div>
                  </div>

                  {/* Stepper buttons to expand or shrink length */}
                  <div className="grid grid-cols-5 gap-1">
                    <button
                      type="button"
                      onClick={() => handleNudgeLength(-300)}
                      className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-200 text-[10px] font-mono cursor-pointer transition-all"
                      title="Shorten length by 300mm"
                    >
                      -300
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeLength(-100)}
                      className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-200 text-[10px] font-mono cursor-pointer transition-all"
                      title="Shorten length by 100mm"
                    >
                      -100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeLength(100)}
                      className="py-1 rounded bg-amber-600/60 hover:bg-amber-600 text-white text-[10px] font-mono font-bold cursor-pointer transition-all"
                      title="Expand length by 100mm"
                    >
                      +100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeLength(300)}
                      className="py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-mono font-bold cursor-pointer transition-all shadow-sm"
                      title="Expand length by 300mm"
                    >
                      +300
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeLength(600)}
                      className="py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold cursor-pointer transition-all shadow-sm"
                      title="Expand length by 600mm"
                    >
                      +600
                    </button>
                  </div>

                  {/* Continuous Slider for smooth expanding */}
                  <input
                    type="range"
                    min={400}
                    max={Math.max(4500, roomLengthMm + 600)}
                    step={50}
                    value={currentLenMm}
                    onChange={(e) => handleSetLength(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />

                  {/* Quick Span Presets */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400">Length Presets:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[1000, 1500, 2000, 2400, 3000, 3600].map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => handleSetLength(len)}
                          className={`py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                            currentLenMm === len
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {(len / 1000).toFixed(1)}m
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          handleSetLength(roomLengthMm);
                          onUpdateSelectedItem?.({ xMm: 0 });
                        }}
                        className={`col-span-2 py-1 rounded text-[9.5px] font-semibold cursor-pointer transition-all ${
                          currentLenMm === roomLengthMm
                            ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-sky-950/80 border border-sky-500/40 text-sky-300 hover:bg-sky-900'
                        }`}
                        title={`Expand ladder to span exact room length (${roomLengthMm}mm)`}
                      >
                        ↔ Span Room ({roomLengthMm}mm)
                      </button>
                    </div>
                  </div>

                  {/* Ladder Width (Rung width) */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Runway Width (Rung Span):</span>
                      <span className="font-mono text-amber-300">{currentTrayWidthMm} mm</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[300, 450, 600].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => onUpdateSelectedItem?.({ depthMm: w })}
                          className={`py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                            currentTrayWidthMm === w
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {w}mm {w === 450 ? '(Std)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Centering / Alignment in room */}
                  <div className="pt-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const centeredX = Math.max(0, Math.round((roomLengthMm - currentLenMm) / 2));
                        const centeredY = Math.max(0, Math.round((roomWidthMm - currentTrayWidthMm) / 2));
                        onUpdateSelectedItem?.({ xMm: centeredX, yMm: centeredY });
                      }}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                      title="Center ladder in shelter room"
                    >
                      <AlignHorizontalJustifyCenter className="w-3 h-3 text-sky-400" />
                      <span>Center in Room</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dimensions */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Width (X Span):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={100}
                  max={12000}
                  step={50}
                  value={selectedItem.widthMm}
                  onChange={(e) => {
                    const w = Math.max(100, Math.min(12000, parseInt(e.target.value, 10) || 600));
                    onUpdateSelectedItem?.({ widthMm: w });
                  }}
                  className="w-16 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono text-center text-xs"
                />
                <span className="font-mono text-slate-500 text-[10px]">mm</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Depth (Y Span):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={100}
                  max={6000}
                  step={50}
                  value={selectedItem.depthMm}
                  onChange={(e) => {
                    const d = Math.max(100, Math.min(6000, parseInt(e.target.value, 10) || 600));
                    onUpdateSelectedItem?.({ depthMm: d });
                  }}
                  className="w-16 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono text-center text-xs"
                />
                <span className="font-mono text-slate-500 text-[10px]">mm</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Height (Z Span):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={200}
                  max={4500}
                  step={50}
                  value={selectedItem.heightMm}
                  onChange={(e) => {
                    const h = Math.max(200, Math.min(4500, parseInt(e.target.value, 10) || 2000));
                    const approxU = Math.max(6, Math.min(60, Math.round((h - 130) / 44.45)));
                    onUpdateSelectedItem?.({ heightMm: h, uHeight: approxU });
                  }}
                  className="w-16 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono text-center text-xs"
                />
                <span className="font-mono text-slate-500 text-[10px]">mm</span>
              </div>
            </div>
            {selectedItem.uHeight && (
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Rack Units:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {selectedItem.uHeight}U
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Position (X, Y):</span>
              <span className="font-mono text-slate-300">
                {Math.round(selectedItem.xMm)}, {Math.round(selectedItem.yMm)} mm
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Orientation:</span>
              <span className="font-mono text-slate-300">{selectedItem.rotationDeg}°</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Actions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onRotateSelected}
                className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
                title="Rotate 90° (R)"
              >
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={onDuplicateSelected}
                className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
                title="Duplicate equipment (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duplicate</span>
              </button>
            </div>

            {/* Prominent Full-Width Delete Button with Shortcut */}
            <button
              type="button"
              onClick={onDeleteSelected}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-semibold cursor-pointer transition-all shadow-sm"
              title="Delete this selected equipment (Delete / Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Equipment</span>
              <kbd className="ml-1 text-[9px] bg-red-950 border border-red-500/50 px-1 py-0.2 rounded text-red-300 font-mono">
                Del
              </kbd>
            </button>
          </div>

          {/* Rectifier System Battery Customizer */}
          {(() => {
            const isRectifierOrBattery =
              (selectedItem.category as string) === 'rectifier' ||
              (selectedItem.category as string) === 'power' ||
              (selectedItem.category as string) === 'battery' ||
              selectedItem.stencilId.includes('rectifier') ||
              selectedItem.stencilId === 'flatpack-1' ||
              selectedItem.stencilId.includes('battery') ||
              selectedItem.name.toLowerCase().includes('rectifier') ||
              selectedItem.name.toLowerCase().includes('flatpack') ||
              selectedItem.name.toLowerCase().includes('power') ||
              (selectedItem as any).batteryCount !== undefined;

            if (!isRectifierOrBattery) return null;

            const currentBatteryCount =
              typeof (selectedItem as any).batteryCount === 'number'
                ? (selectedItem as any).batteryCount
                : 4;
            const currentBatteryType = (selectedItem as any).batteryType || 'vrla-100ah';
            const currentBatteryAh =
              (selectedItem as any).batteryAh ||
              (currentBatteryType.includes('200')
                ? 200
                : currentBatteryType.includes('150')
                ? 150
                : 100);
            const isLithium = currentBatteryType.startsWith('lifepo4');

            const totalAh = isLithium
              ? currentBatteryCount * currentBatteryAh
              : Math.max(1, Math.round((currentBatteryCount / 4) * currentBatteryAh));
            const totalKWh = Number(((totalAh * 48) / 1000).toFixed(1));
            const estimatedHours = Number(((totalKWh * 0.8) / 2.0).toFixed(1));

            const handleCountChange = (count: number) => {
              const clamped = Math.max(1, Math.min(32, Math.round(count)));
              onUpdateSelectedItem?.({
                batteryCount: clamped,
                batteryAh: currentBatteryAh,
                batteryType: currentBatteryType,
              } as any);
            };

            const handleTypeChange = (type: string) => {
              const newAh = type.includes('200') ? 200 : type.includes('150') ? 150 : 100;
              onUpdateSelectedItem?.({
                batteryType: type,
                batteryAh: newAh,
                batteryCount: currentBatteryCount,
              } as any);
            };

            const currentHeightMm = selectedItem.heightMm || 2000;
            const currentUHeight = selectedItem.uHeight || Math.max(12, Math.round((currentHeightMm - 130) / 44.45));
            const currentBrand =
              (selectedItem as any).brand ||
              (selectedItem.stencilId.includes('ericsson')
                ? 'Ericsson'
                : selectedItem.stencilId.includes('eltek')
                ? 'Eltek'
                : selectedItem.stencilId.includes('zte')
                ? 'ZTE'
                : selectedItem.stencilId.includes('huawei')
                ? 'Huawei'
                : selectedItem.stencilId.includes('vertiv')
                ? 'Vertiv'
                : selectedItem.stencilId.includes('delta')
                ? 'Delta'
                : 'Ericsson');
            const rectifierModules = (selectedItem as any).rectifierModules || 4;

            const handleUpdateHeight = (newMm: number) => {
              const clampedMm = Math.max(800, Math.min(3000, Math.round(newMm)));
              const approxU = Math.max(12, Math.min(60, Math.round((clampedMm - 130) / 44.45)));
              onUpdateSelectedItem?.({
                heightMm: clampedMm,
                uHeight: approxU,
              });
            };

            const handleBrandChange = (newBrand: string) => {
              const brandStencilMap: Record<string, string> = {
                Ericsson: 'rectifier-ericsson-rs',
                Eltek: 'rectifier-eltek-rs',
                ZTE: 'rectifier-zte-rs',
                Huawei: 'rectifier-huawei-rs',
                Vertiv: 'rectifier-vertiv-rs',
                Delta: 'rectifier-delta-rs',
              };
              const newStencilId = brandStencilMap[newBrand] || selectedItem.stencilId;
              onUpdateSelectedItem?.({
                name: `${newBrand} RS (Rectifier System)`,
                stencilId: newStencilId,
                brand: newBrand,
              } as any);
            };

            const handleUpdateModules = (mods: number) => {
              onUpdateSelectedItem?.({
                rectifierModules: Math.max(1, Math.min(12, mods)),
              } as any);
            };

            return (
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/50 space-y-3 shadow-lg shadow-amber-950/20 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5 uppercase">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Rectifier System
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[9px] font-bold border border-sky-700/60">
                      Open Bayface
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                      -48V DC
                    </span>
                  </div>
                </div>

                {/* Brand Selection Pills */}
                <div className="space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">OEM Manufacturer</span>
                    <span className="font-mono text-sky-400 font-bold">{currentBrand} RS</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'Ericsson', label: 'Ericsson RS' },
                      { id: 'Eltek', label: 'Eltek RS' },
                      { id: 'ZTE', label: 'ZTE RS' },
                      { id: 'Huawei', label: 'Huawei RS' },
                      { id: 'Vertiv', label: 'Vertiv RS' },
                      { id: 'Delta', label: 'Delta RS' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBrandChange(b.id)}
                        className={`py-1 px-1 rounded text-[9.5px] font-semibold transition-all cursor-pointer text-center truncate ${
                          currentBrand.toLowerCase() === b.id.toLowerCase()
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rectifier Actual Height Customizer */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-semibold text-slate-200 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-sky-400" />
                      Actual Height (H)
                    </label>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5">
                        <input
                          type="number"
                          min={800}
                          max={3000}
                          step={50}
                          value={currentHeightMm}
                          onChange={(e) => handleUpdateHeight(parseInt(e.target.value, 10) || 2000)}
                          className="w-14 text-center font-mono font-bold text-sky-300 bg-transparent text-xs focus:outline-none"
                        />
                        <span className="text-[9.5px] font-mono text-slate-400">mm</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono font-bold border border-sky-700/60">
                        {currentUHeight}U
                      </span>
                    </div>
                  </div>

                  {/* Height Slider */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Range: 1.2m – 2.6m</span>
                      <span className="font-mono text-sky-300 font-semibold">{(currentHeightMm / 1000).toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min={1200}
                      max={2600}
                      step={50}
                      value={currentHeightMm}
                      onChange={(e) => handleUpdateHeight(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>

                  {/* Height Presets */}
                  <div className="grid grid-cols-5 gap-1 pt-0.5">
                    {[
                      { u: 36, mm: 1800, label: '36U' },
                      { u: 42, mm: 2000, label: '42U (Std)' },
                      { u: 45, mm: 2200, label: '45U' },
                      { u: 47, mm: 2300, label: '47U' },
                      { u: 48, mm: 2400, label: '48U' },
                    ].map((p) => {
                      const isSelected = Math.abs(currentHeightMm - p.mm) < 40;
                      return (
                        <button
                          key={p.u}
                          type="button"
                          onClick={() => handleUpdateHeight(p.mm)}
                          className={`py-1 text-[9.5px] rounded font-mono font-bold cursor-pointer transition-all text-center ${
                            isSelected
                              ? 'bg-sky-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={`${p.u}U (${p.mm}mm)`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stepper Nudge */}
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateHeight(currentHeightMm - 100)}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-[10px] font-mono cursor-pointer transition-colors"
                    >
                      -100mm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateHeight(currentHeightMm + 100)}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-[10px] font-mono cursor-pointer transition-colors"
                    >
                      +100mm
                    </button>
                  </div>
                </div>

                {/* Rectifier Modules Selector */}
                <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-sky-400" />
                    Rectifier Modules:
                  </span>
                  <div className="flex items-center gap-1">
                    {[2, 4, 6, 8].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleUpdateModules(m)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          rectifierModules === m
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {m}×
                      </button>
                    ))}
                  </div>
                </div>

                {/* Battery Counter Stepper */}
                <div className="space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-slate-300 text-[10px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                      Stacked Batteries:
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {currentBatteryCount} Units ({isLithium ? `${currentBatteryCount} LiFePO4 packs` : `${(currentBatteryCount / 4).toFixed(1)} VRLA string(s)`})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCountChange(currentBatteryCount - 1)}
                      disabled={currentBatteryCount <= 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
                      title="Decrease battery count"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={currentBatteryCount}
                      onChange={(e) => handleCountChange(parseInt(e.target.value, 10) || 1)}
                      className="flex-1 px-2 py-1 bg-slate-950 border border-amber-500/40 rounded text-center font-mono text-amber-300 font-bold text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleCountChange(currentBatteryCount + 1)}
                      disabled={currentBatteryCount >= 32}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
                      title="Increase battery count"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick count chips */}
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {[
                      { label: '4 Batt (Std)', cnt: 4 },
                      { label: '6 Batt (1.5×)', cnt: 6 },
                      { label: '8 Batt (2×)', cnt: 8 },
                      { label: '12 Batt (3×)', cnt: 12 },
                    ].map((preset) => (
                      <button
                        key={preset.cnt}
                        type="button"
                        onClick={() => handleCountChange(preset.cnt)}
                        className={`py-1 text-[9.5px] rounded font-mono font-bold cursor-pointer transition-all text-center truncate ${
                          currentBatteryCount === preset.cnt
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Battery Chemistry */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400">Battery Type &amp; Chemistry:</span>
                    <select
                      value={currentBatteryType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-[10.5px] font-mono cursor-pointer"
                    >
                      <option value="lifepo4-100ah">48V 100Ah LiFePO4 Smart Lithium ESM (4.8kWh)</option>
                      <option value="lifepo4-150ah">48V 150Ah LiFePO4 Smart Lithium ESM (7.2kWh)</option>
                      <option value="lifepo4-200ah">48V 200Ah High-Density Smart Lithium (9.6kWh)</option>
                      <option value="vrla-100ah">12V 100Ah VRLA AGM Front Terminal</option>
                      <option value="vrla-150ah">12V 150Ah VRLA Gel Deep Cycle</option>
                      <option value="vrla-200ah">12V 200Ah High-Rate VRLA</option>
                    </select>
                  </div>
                </div>

                {/* Calculated Electrical Storage Telemetry */}
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 space-y-1 text-[10px]">
                  <div className="flex justify-between text-amber-200">
                    <span>Effective System Capacity:</span>
                    <span className="font-mono font-bold text-amber-300">{totalAh} Ah (-48V DC)</span>
                  </div>
                  <div className="flex justify-between text-amber-200">
                    <span>Stored Energy Reserve:</span>
                    <span className="font-mono font-bold text-amber-300">{totalKWh} kWh</span>
                  </div>
                  <div className="flex justify-between text-amber-200 pt-0.5 border-t border-amber-500/20">
                    <span>Backup Runtime @ 2kW:</span>
                    <span className="font-mono font-bold text-emerald-300">~{estimatedHours} hours</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Overhead Cable Runway Clearance for this item */}
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-1 font-semibold text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Overhead Cable Ladder Clearance</span>
            </div>
            <p className="text-[10px] text-amber-200/80 leading-relaxed">
              {selectedItem.category === 'ladder' ? (
                <>
                  This overhead cable ladder is suspended at{' '}
                  <strong className="text-amber-300">+{(shelterHeightM - 0.09).toFixed(2)}m</strong>{' '}
                  (just 3.5 inches / 90mm from the {shelterHeightM.toFixed(2)}m ceiling), way above
                  all equipment racks.
                </>
              ) : (
                <>
                  The overhead cable ladder suspends at{' '}
                  <strong className="text-amber-300">+{(shelterHeightM - 0.09).toFixed(2)}m</strong>{' '}
                  (just 3.5&quot; / 90mm below the {shelterHeightM.toFixed(2)}m ceiling), leaving{' '}
                  <strong className="text-emerald-300">
                    {Math.max(
                      0,
                      shelterHeightM -
                        0.09 -
                        ((selectedItem.elevationMm || 0) + selectedItem.heightMm) / 1000
                    ).toFixed(2)}
                    m
                  </strong>{' '}
                  of vertical clearance above this item.
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1.5">
          <Server className="w-7 h-7 text-slate-600 mx-auto" />
          <h4 className="text-xs font-semibold text-slate-300">No Equipment Selected</h4>
          <p className="text-[10.5px] text-slate-500 leading-relaxed">
            Click any equipment to inspect or rotate, or drag the <strong className="text-sky-400">Door</strong> / <strong className="text-amber-400">Feeder Hole</strong> directly on the walls.
          </p>
        </div>
      )}

      {/* Door & Feeder Hole Wall Openings Repositioning */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
        <h4 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <DoorClosed className="w-3.5 h-3.5 text-sky-400" />
          Door &amp; Feeder Hole Position
        </h4>

        {/* Door Repositioning */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-sky-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-sky-300 flex items-center gap-1">
              <DoorClosed className="w-3 h-3 text-sky-400" />
              Access Door Wall
            </span>
            <span className="font-mono text-sky-400 uppercase font-bold">
              {doorWall} ({doorOffsetPct}%)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {(['north', 'south', 'east', 'west'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setDoorWall(w)}
                className={`py-1 rounded text-[10px] font-medium capitalize transition-all cursor-pointer ${
                  doorWall === w
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Position along {doorWall} wall</span>
              <span className="font-mono text-sky-300">
                {Math.round(
                  ((doorWall === 'north' || doorWall === 'south' ? roomLengthMm : roomWidthMm) *
                    doorOffsetPct) /
                    100
                )}{' '}
                mm ({doorOffsetPct}%)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="85"
              value={doorOffsetPct}
              onChange={(e) => setDoorOffsetPct(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-semibold">Door Diameter / Width (⌀):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="600"
                  max="2400"
                  step="25"
                  value={doorWidthMm}
                  onChange={(e) => setDoorWidthMm(Math.max(600, Math.min(2400, parseInt(e.target.value, 10) || 900)))}
                  className="w-14 px-1 py-0.5 rounded bg-slate-950 border border-sky-500/40 text-sky-300 font-mono text-center text-xs"
                />
                <span className="text-slate-400 font-mono text-[9px]">mm</span>
              </div>
            </div>
            <input
              type="range"
              min="600"
              max="2400"
              step="25"
              value={doorWidthMm}
              onChange={(e) => setDoorWidthMm(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="grid grid-cols-6 gap-1">
              {[750, 800, 900, 1000, 1200, 1500].map((dw) => (
                <button
                  key={dw}
                  type="button"
                  onClick={() => setDoorWidthMm(dw)}
                  className={`py-0.5 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                    doorWidthMm === dw
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {dw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feeder Hole (Cable Entry Gland) Repositioning */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Feeder Cable Hole
            </span>
            <span className="font-mono text-amber-400 uppercase font-bold">
              {cableWall === 'none' ? 'Disabled' : `${cableWall} (${cableOffsetPct}%)`}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {(['north', 'south', 'east', 'west', 'none'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setCableWall(w)}
                className={`py-1 rounded text-[9.5px] font-medium capitalize transition-all cursor-pointer ${
                  cableWall === w
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          {cableWall !== 'none' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Position along {cableWall} wall</span>
                <span className="font-mono text-amber-300">
                  {Math.round(
                    ((cableWall === 'north' || cableWall === 'south' ? roomLengthMm : roomWidthMm) *
                      cableOffsetPct) /
                      100
                  )}{' '}
                  mm ({cableOffsetPct}%)
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={cableOffsetPct}
                onChange={(e) => setCableOffsetPct(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-semibold">Feeder Diameter (⌀):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="100"
                      max="600"
                      step="25"
                      value={cableHoleDiameterMm}
                      onChange={(e) => setCableHoleDiameterMm?.(Math.max(100, Math.min(600, parseInt(e.target.value, 10) || 250)))}
                      className="w-14 px-1 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-center text-xs"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">mm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="25"
                  value={cableHoleDiameterMm}
                  onChange={(e) => setCableHoleDiameterMm?.(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="grid grid-cols-5 gap-1">
                  {[150, 200, 250, 300, 400].map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setCableHoleDiameterMm?.(dia)}
                      className={`py-0.5 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
                        cableHoleDiameterMm === dia
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeder Vertical Level / Elevation */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-semibold">Feeder Level (Height from Floor):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1000"
                      max={Math.round(shelterHeightM * 1000 - 100)}
                      step="25"
                      value={cableHoleElevationMm ?? Math.round(shelterHeightM * 1000 - 350)}
                      onChange={(e) =>
                        setCableHoleElevationMm?.(
                          Math.max(1000, Math.min(Math.round(shelterHeightM * 1000 - 100), parseInt(e.target.value, 10) || 2450))
                        )
                      }
                      className="w-16 px-1 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-center text-xs"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">mm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1000"
                  max={Math.round(shelterHeightM * 1000 - 100)}
                  step="25"
                  value={cableHoleElevationMm ?? Math.round(shelterHeightM * 1000 - 350)}
                  onChange={(e) => setCableHoleElevationMm?.(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="flex gap-1 pt-0.5">
                  {[
                    { label: 'Ladder Runway', val: Math.round(shelterHeightM * 1000 - 350) },
                    { label: 'Ceiling Flush', val: Math.round(shelterHeightM * 1000 - 200) },
                    { label: 'High (2200mm)', val: 2200 },
                  ].map((p) => {
                    const currentElev = cableHoleElevationMm ?? Math.round(shelterHeightM * 1000 - 350);
                    const isSelected = Math.abs(currentElev - p.val) < 25;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setCableHoleElevationMm?.(p.val)}
                        className={`flex-1 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Specs & Equipment Summary */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
        <h4 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          Shelter Engineering Summary
        </h4>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Total Placed Equipment:</span>
            <span className="font-mono text-white font-bold">{items.length} units</span>
          </div>
          <div className="flex justify-between">
            <span>Floor Space:</span>
            <span className="font-mono text-sky-400">
              {((roomLengthMm * roomWidthMm) / 1000000).toFixed(2)} m²
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cabin / Shelter Height:</span>
            <span className="font-mono text-amber-400 font-bold">
              {shelterHeightM.toFixed(2)} m ({Math.round(shelterHeightM * 1000)} mm)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cable Ladder Elevation:</span>
            <span className="font-mono text-amber-300">
              +{(shelterHeightM - 0.09).toFixed(2)} m (3.5&quot; below ceiling)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Front Aisle Maintenance:</span>
            <span className="font-mono text-emerald-400">900mm (Clear)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
