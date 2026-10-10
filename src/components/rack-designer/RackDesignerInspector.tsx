/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  RackEquipmentItem,
  RackElevationConfig,
  EquipmentCategory,
  PortConnectorType,
} from './types';
import { isSlotRangeOccupied } from './Rack2DElevationCanvas';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Tag,
  Zap,
  Weight,
  Cpu,
  Info,
  Server,
  Cable,
  BatteryCharging,
  Minus,
  Plus,
  Ruler,
  Check,
} from 'lucide-react';

interface RackDesignerInspectorProps {
  rackConfig: RackElevationConfig;
  onUpdateRackConfig: (partial: Partial<RackElevationConfig>) => void;
  onUpdateRackHeight?: (totalU: number, heightMm?: number) => void;
  onSyncAllRacksHeight?: (totalU: number, heightMm?: number) => void;
  selectedItem: RackEquipmentItem | null;
  onUpdateSelectedItem: (partial: Partial<RackEquipmentItem>) => void;
  onDeleteSelectedItem: () => void;
  onDuplicateSelectedItem: () => void;
  onClearAllEquipments: () => void;
}

const CATEGORY_OPTIONS: { id: EquipmentCategory; label: string }[] = [
  { id: 'switch', label: 'Network Switch' },
  { id: 'server', label: 'Compute Server' },
  { id: 'router', label: 'IP/MPLS Router' },
  { id: 'patch-panel', label: 'Patch Panel (RJ45)' },
  { id: 'fiber-shelf', label: 'Fiber Shelf / ODF' },
  { id: 'bbu', label: '5G / 4G BBU Radio' },
  { id: 'power', label: 'DC Power / Rectifier' },
  { id: 'battery', label: 'Battery Module' },
  { id: 'cable-manager', label: 'Cable Manager' },
  { id: 'blanking', label: 'Blanking Panel' },
  { id: 'custom', label: 'Custom Equipment' },
];

const COLOR_PRESETS = [
  '#1e293b', // Slate
  '#0f172a', // Deep Slate
  '#1e3a8a', // Blue Switch
  '#064e3b', // Green BBU
  '#312e81', // Indigo OTN
  '#431407', // Orange Power
  '#4c0519', // Rose DC
  '#172554', // Dark Navy
  '#1e1b4b', // Purple Storage
  '#18181b', // Zinc
];

export const RackDesignerInspector: React.FC<RackDesignerInspectorProps> = ({
  rackConfig,
  onUpdateRackConfig,
  onUpdateRackHeight,
  onSyncAllRacksHeight,
  selectedItem,
  onUpdateSelectedItem,
  onDeleteSelectedItem,
  onDuplicateSelectedItem,
  onClearAllEquipments,
}) => {
  const { totalU, equipments } = rackConfig;

  // Calculate used U slots
  const usedU = equipments.reduce((acc, itm) => acc + itm.uHeight, 0);
  const freeU = Math.max(0, totalU - usedU);
  const usedPct = Math.min(100, Math.round((usedU / totalU) * 100));
  const totalPowerWatts = equipments.reduce((acc, itm) => acc + (itm.powerWatts || 0), 0);
  const totalWeightKg = equipments.reduce((acc, itm) => acc + (itm.weightKg || 0), 0);

  return (
    <div className="w-80 h-full border-l border-slate-800 bg-slate-900/95 flex flex-col overflow-y-auto text-xs text-slate-200">
      {selectedItem ? (
        // --- 1. EQUIPMENT INSPECTOR ---
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">Equipment Properties</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 font-mono text-sky-300 font-bold text-[11px]">
              {selectedItem.uHeight}U
            </span>
          </div>

          {/* User Custom Label */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              Equipment Label
            </label>
            <input
              type="text"
              value={selectedItem.label}
              onChange={(e) => onUpdateSelectedItem({ label: e.target.value })}
              placeholder="e.g. SW-LEAF-01, BBU-5G-01"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors"
            />
            <p className="text-[10px] text-slate-400">
              Identifies this chassis in 2D blueprint and 3D cable laying view.
            </p>
          </div>

          {/* Equipment Model / Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Model Name / Description
            </label>
            <input
              type="text"
              value={selectedItem.name}
              onChange={(e) => onUpdateSelectedItem({ name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Rack Unit Height (U) Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Unit Height (U)
              </label>
              <span className="font-mono text-sky-400 font-bold">
                {selectedItem.uHeight}U ({Math.round(selectedItem.uHeight * 44.45)}mm)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((u) => {
                const canFit = !isSlotRangeOccupied(
                  equipments,
                  selectedItem.uSlot,
                  u,
                  selectedItem.id
                );
                return (
                  <button
                    key={`u-btn-${u}`}
                    disabled={!canFit}
                    onClick={() => {
                      if (canFit) onUpdateSelectedItem({ uHeight: u });
                    }}
                    className={`py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                      selectedItem.uHeight === u
                        ? 'bg-sky-600 text-white shadow-sm'
                        : canFit
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-slate-950 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {u}U
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Position (U-Slot Elevation) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Position (Slot U)
              </label>
              <span className="font-mono text-emerald-400 font-bold">
                U{selectedItem.uSlot} .. U{selectedItem.uSlot + selectedItem.uHeight - 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={totalU - selectedItem.uHeight + 1}
                value={selectedItem.uSlot}
                onChange={(e) => {
                  const targetSlot = parseInt(e.target.value, 10);
                  if (
                    !isSlotRangeOccupied(
                      equipments,
                      targetSlot,
                      selectedItem.uHeight,
                      selectedItem.id
                    )
                  ) {
                    onUpdateSelectedItem({ uSlot: targetSlot });
                  }
                }}
                className="flex-1 accent-sky-500 cursor-pointer"
              />
              <span className="font-mono text-slate-300 w-8 text-right font-bold">
                {selectedItem.uSlot}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Category
            </label>
            <select
              value={selectedItem.category}
              onChange={(e) =>
                onUpdateSelectedItem({ category: e.target.value as EquipmentCategory })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition-colors"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Faceplate Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdateSelectedItem({ color })}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded border transition-transform cursor-pointer ${
                    selectedItem.color === color
                      ? 'border-sky-400 scale-110 shadow-md ring-2 ring-sky-400/50'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Physical & Electrical Specifications */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Specifications
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Depth:</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    min={50}
                    max={1200}
                    step={10}
                    value={selectedItem.depthMm || 450}
                    onChange={(e) =>
                      onUpdateSelectedItem({ depthMm: parseInt(e.target.value, 10) || 450 })
                    }
                    className="w-16 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-sky-400 text-xs"
                  />
                  <span className="text-slate-500 text-[10px]">mm</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Power Load:</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    step={50}
                    value={selectedItem.powerWatts || 0}
                    onChange={(e) =>
                      onUpdateSelectedItem({ powerWatts: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-16 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-amber-400 text-xs"
                  />
                  <span className="text-slate-500 text-[10px]">W</span>
                </div>
              </div>
            </div>
          </div>

          {/* Battery Customization for Rectifier & Battery Shelves */}
          {(() => {
            const isPowerOrBattery =
              selectedItem.category === 'power' ||
              selectedItem.category === 'battery' ||
              selectedItem.name.toLowerCase().includes('rectifier') ||
              selectedItem.name.toLowerCase().includes('flatpack') ||
              selectedItem.name.toLowerCase().includes('battery') ||
              selectedItem.batteryCount !== undefined;

            if (!isPowerOrBattery) return null;

            const batteryCount = selectedItem.batteryCount ?? 4;
            const batteryType = selectedItem.batteryType ?? 'vrla-100ah';
            const batteryAh = selectedItem.batteryAh ?? (batteryType.includes('200') ? 200 : batteryType.includes('150') ? 150 : 100);
            const isLithium = batteryType.startsWith('lifepo4');

            const totalAh = isLithium
              ? batteryCount * batteryAh
              : Math.max(1, Math.round((batteryCount / 4) * batteryAh));
            const totalKWh = Number(((totalAh * 48) / 1000).toFixed(1));
            const estimatedHours = Number(((totalKWh * 0.8) / 2.0).toFixed(1));

            const updateCount = (newCount: number) => {
              const clamped = Math.max(1, Math.min(32, Math.round(newCount)));
              onUpdateSelectedItem({
                batteryCount: clamped,
                batteryAh,
                batteryType,
              });
            };

            const updateType = (newType: string) => {
              const newAh = newType.includes('200') ? 200 : newType.includes('150') ? 150 : 100;
              onUpdateSelectedItem({
                batteryType: newType,
                batteryAh: newAh,
                batteryCount,
              });
            };

            return (
              <div className="p-3 bg-slate-950/80 border border-amber-500/40 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                    Rectifier Battery Bank
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                    {batteryCount} Units
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-300">
                    <span>Number of Batteries:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {batteryCount} blocks ({isLithium ? `${batteryCount} packs` : `${(batteryCount / 4).toFixed(1)} string(s)`})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={batteryCount <= 1}
                      onClick={() => updateCount(batteryCount - 1)}
                      className="p-1 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={batteryCount}
                      onChange={(e) => updateCount(parseInt(e.target.value, 10) || 1)}
                      className="w-14 px-1 py-0.5 bg-slate-900 border border-amber-500/40 rounded text-center font-mono text-amber-300 text-xs font-bold"
                    />
                    <button
                      type="button"
                      disabled={batteryCount >= 32}
                      onClick={() => updateCount(batteryCount + 1)}
                      className="p-1 rounded bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <div className="flex gap-1 ml-auto">
                      {[2, 4, 8, 16].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => updateCount(cnt)}
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold cursor-pointer transition-colors ${
                            batteryCount === cnt
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Battery Chemistry / Model:</span>
                  <select
                    value={batteryType}
                    onChange={(e) => updateType(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-[10.5px] font-mono cursor-pointer"
                  >
                    <option value="vrla-100ah">12V 100Ah VRLA AGM (Lead-Acid)</option>
                    <option value="vrla-150ah">12V 150Ah VRLA High-Capacity</option>
                    <option value="vrla-200ah">12V 200Ah VRLA Heavy-Duty</option>
                    <option value="lifepo4-48v100ah">48V 100Ah LiFePO4 Smart Lithium (4.8kWh)</option>
                  </select>
                </div>

                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-amber-200">
                    <span>Effective System Capacity:</span>
                    <span className="font-mono font-bold text-amber-300">{totalAh} Ah (-48V DC)</span>
                  </div>
                  <div className="flex justify-between text-amber-200">
                    <span>Stored Energy Reserve:</span>
                    <span className="font-mono font-bold text-amber-300">{totalKWh} kWh</span>
                  </div>
                  <div className="flex justify-between text-amber-200 pt-0.5 border-t border-amber-500/20">
                    <span>Backup Autonomy @ 2kW:</span>
                    <span className="font-mono font-bold text-emerald-300">~{estimatedHours} hours</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick Actions (Move, Duplicate, Delete) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                disabled={selectedItem.uSlot + selectedItem.uHeight > totalU}
                onClick={() => {
                  if (
                    selectedItem.uSlot + selectedItem.uHeight <= totalU &&
                    !isSlotRangeOccupied(
                      equipments,
                      selectedItem.uSlot + 1,
                      selectedItem.uHeight,
                      selectedItem.id
                    )
                  ) {
                    onUpdateSelectedItem({ uSlot: selectedItem.uSlot + 1 });
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Move 1U Up</span>
              </button>
              <button
                disabled={selectedItem.uSlot <= 1}
                onClick={() => {
                  if (
                    selectedItem.uSlot > 1 &&
                    !isSlotRangeOccupied(
                      equipments,
                      selectedItem.uSlot - 1,
                      selectedItem.uHeight,
                      selectedItem.id
                    )
                  ) {
                    onUpdateSelectedItem({ uSlot: selectedItem.uSlot - 1 });
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                <span>Move 1U Down</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onDuplicateSelectedItem}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={onDeleteSelectedItem}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- 2. RACK OVERVIEW & GLOBAL SETTINGS ---
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">Rack Specifications</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 font-mono text-sky-300 font-bold text-[11px]">
              {totalU}U Open Bay
            </span>
          </div>

          {/* Rack Designation / Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              Rack Designation
            </label>
            <input
              type="text"
              value={rackConfig.name}
              onChange={(e) => onUpdateRackConfig({ name: e.target.value })}
              placeholder="e.g. OPEN BAY RACK 01"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Actual Height & Capacity Specification */}
          <div className="space-y-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-sky-400" />
                Actual Physical Height
              </label>
              <span className="font-mono text-[10px] text-slate-400">
                ~{((rackConfig.heightMm || Math.round(totalU * 44.45 + 130)) / 304.8).toFixed(1)} ft
              </span>
            </div>

            {/* Standard U Buttons */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { u: 48, mm: 2300 },
                { u: 45, mm: 2200 },
                { u: 42, mm: 2000 },
                { u: 36, mm: 1800 },
                { u: 24, mm: 1200 },
                { u: 18, mm: 1000 },
                { u: 12, mm: 650 },
              ].map(({ u, mm }) => (
                <button
                  key={`u-cap-${u}`}
                  onClick={() => {
                    if (onUpdateRackHeight) {
                      onUpdateRackHeight(u, mm);
                    } else {
                      onUpdateRackConfig({ totalU: u, heightMm: mm });
                    }
                  }}
                  className={`py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                    totalU === u
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                  }`}
                  title={`${u}U (${mm} mm)`}
                >
                  {u}U
                </button>
              ))}
            </div>

            {/* Exact Millimeters Input with Steppers */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Actual Frame Height (mm):</span>
                <span className="font-mono text-slate-400">
                  ~{((rackConfig.heightMm || Math.round(totalU * 44.45 + 130)) / 1000).toFixed(2)} m
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const cur = rackConfig.heightMm || Math.round(totalU * 44.45 + 130);
                    const nextMm = Math.max(400, cur - 50);
                    const calcU = Math.max(6, Math.min(60, Math.round((nextMm - 130) / 44.45)));
                    if (onUpdateRackHeight) onUpdateRackHeight(calcU, nextMm);
                    else onUpdateRackConfig({ totalU: calcU, heightMm: nextMm });
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title="Decrease 50mm"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min={400}
                  max={3500}
                  step={10}
                  value={rackConfig.heightMm || Math.round(totalU * 44.45 + 130)}
                  onChange={(e) => {
                    const mm = parseInt(e.target.value, 10);
                    if (!isNaN(mm) && mm > 0) {
                      const calcU = Math.max(6, Math.min(60, Math.round((mm - 130) / 44.45)));
                      if (onUpdateRackHeight) {
                        onUpdateRackHeight(calcU, mm);
                      } else {
                        onUpdateRackConfig({ totalU: calcU, heightMm: mm });
                      }
                    }
                  }}
                  className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center font-mono text-xs text-amber-300 font-bold focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cur = rackConfig.heightMm || Math.round(totalU * 44.45 + 130);
                    const nextMm = Math.min(3200, cur + 50);
                    const calcU = Math.max(6, Math.min(60, Math.round((nextMm - 130) / 44.45)));
                    if (onUpdateRackHeight) onUpdateRackHeight(calcU, nextMm);
                    else onUpdateRackConfig({ totalU: calcU, heightMm: nextMm });
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title="Increase 50mm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Sync All Racks On Site Button */}
            {onSyncAllRacksHeight && (
              <button
                type="button"
                onClick={() => {
                  const curH = rackConfig.heightMm || Math.round(totalU * 44.45 + 130);
                  onSyncAllRacksHeight(totalU, curH);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                title="Ensure all racks in the shelter / layout share this identical height"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Make All Racks Same Height ({totalU}U · {rackConfig.heightMm || Math.round(totalU * 44.45 + 130)}mm)</span>
              </button>
            )}
          </div>

          {/* Rack Structural Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Frame Architecture
            </label>
            <select
              value={rackConfig.rackType}
              onChange={(e) =>
                onUpdateRackConfig({
                  rackType: e.target.value as 'open-2post' | 'open-4post' | 'enclosed-cabinet',
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="open-2post">2-Post Open Relay Rack (Lightweight Aluminum)</option>
              <option value="open-4post">4-Post Open Bay Rack (Heavy Structural Steel)</option>
              <option value="enclosed-cabinet">19" Enclosed Cabinet Frame (Glass/Perforated)</option>
            </select>
          </div>

          {/* Capacity Utilization Card */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Slot Utilization
              </span>
              <span className="font-mono font-bold text-sky-400">{usedPct}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${usedPct}%` }}
                className={`h-full transition-all duration-300 ${
                  usedPct > 90
                    ? 'bg-rose-500'
                    : usedPct > 70
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex justify-between text-slate-400">
                <span>Occupied Slots:</span>
                <span className="font-mono text-emerald-400 font-bold">{usedU}U</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Available Slots:</span>
                <span className="font-mono text-sky-400 font-bold">{freeU}U</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Devices:</span>
                <span className="font-mono text-slate-200 font-bold">{equipments.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Power Draw:</span>
                <span className="font-mono text-amber-400 font-bold">{totalPowerWatts}W</span>
              </div>
            </div>
          </div>

          {/* Hint info */}
          <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-sky-200/90 text-[11px] flex gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              Drag equipments from the left catalog and drop them onto the open bay slots. Each
              equipment height (1U..4U) and custom label will accurately reflect in the 3D studio for
              cable laying.
            </span>
          </div>

          {/* Clear Rack Button */}
          {equipments.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all equipments from this open bay rack?')) {
                  onClearAllEquipments();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All Equipments ({equipments.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
