/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject } from '../../types/cad';
import { Zap, BatteryCharging, Minus, Plus, Cpu, Info, Ruler, ArrowUpDown, ShieldCheck } from 'lucide-react';

interface RectifierCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const RectifierCustomizer: React.FC<RectifierCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  if (!primary) return null;

  const sId = (primary.stencilId || primary.customProps?.stencilType || '').toLowerCase();
  const customProps = primary.customProps || {};

  const isRectifier =
    customProps.isRectifierSystem === true ||
    sId.startsWith('rectifier-') ||
    sId === 'rack-power-rectifier' ||
    sId === 'flatpack-1' ||
    sId.includes('rectifier') ||
    sId.includes('flatpack') ||
    sId === 'ericsson-enc6150' ||
    sId === 'ericsson-enc6130' ||
    sId === 'eltek-1bay' ||
    sId === 'eltek-2bay';

  if (!isRectifier) return null;

  // Current brand
  const currentBrand =
    customProps.brand ||
    (sId.includes('ericsson')
      ? 'Ericsson'
      : sId.includes('eltek')
      ? 'Eltek'
      : sId.includes('zte')
      ? 'ZTE'
      : sId.includes('huawei')
      ? 'Huawei'
      : sId.includes('vertiv')
      ? 'Vertiv'
      : sId.includes('delta')
      ? 'Delta'
      : 'Ericsson');

  // Actual Height in mm and U-Capacity
  const currentHeightMm =
    customProps.heightMm ??
    (primary as any).heightMm ??
    (customProps.uHeight ? Math.round(customProps.uHeight * 44.45 + 130) : 2000);

  const currentUHeight =
    customProps.uHeight ??
    (primary as any).uHeight ??
    Math.max(12, Math.round((currentHeightMm - 130) / 44.45));

  // Current battery configuration (default 4 matching photo)
  const currentBatteryCount =
    typeof customProps.batteryCount === 'number'
      ? customProps.batteryCount
      : sId === 'ericsson-enc6130'
      ? 2
      : 4;

  const currentBatteryType = customProps.batteryType || 'lifepo4-100ah';
  const currentBatteryAh =
    customProps.batteryAh ||
    (currentBatteryType.includes('150') ? 150 : currentBatteryType.includes('200') ? 200 : 100);
  const rectifierModules = customProps.rectifierModules || 4;

  const isLithium = currentBatteryType.startsWith('lifepo4');

  // Electrical metrics calculation
  const totalAh = isLithium
    ? currentBatteryCount * currentBatteryAh
    : Math.max(1, Math.round((currentBatteryCount / 4) * currentBatteryAh));

  const totalKWh = Number(((totalAh * 48) / 1000).toFixed(1));
  const estimatedHours = Number(((totalKWh * 0.8) / 2.0).toFixed(1)); // 80% Depth of discharge at 2kW load

  const handleUpdateHeight = (newMm: number) => {
    const clampedMm = Math.max(800, Math.min(3000, Math.round(newMm)));
    const approxU = Math.max(12, Math.min(60, Math.round((clampedMm - 130) / 44.45)));
    // Scale 2D canvas height proportionally: 2000mm standard = 45px
    const scaledHeight = Math.max(20, Math.round((clampedMm / 2000) * 45));
    onUpdateSelected({
      height: scaledHeight,
      heightMm: clampedMm,
      uHeight: approxU,
      customProps: {
        ...customProps,
        isRectifierSystem: true,
        heightMm: clampedMm,
        uHeight: approxU,
      },
    });
  };

  const handleUpdateBatteryCount = (newCount: number) => {
    const clamped = Math.max(1, Math.min(32, Math.round(newCount)));
    onUpdateSelected({
      customProps: {
        ...customProps,
        isRectifierSystem: true,
        batteryCount: clamped,
        batteryAh: currentBatteryAh,
        batteryType: currentBatteryType,
      },
    });
  };

  const handleUpdateBatteryType = (newType: string) => {
    const newAh = newType.includes('200') ? 200 : newType.includes('150') ? 150 : 100;
    onUpdateSelected({
      customProps: {
        ...customProps,
        isRectifierSystem: true,
        batteryType: newType,
        batteryAh: newAh,
      },
    });
  };

  const handleUpdateModules = (mods: number) => {
    onUpdateSelected({
      customProps: {
        ...customProps,
        isRectifierSystem: true,
        rectifierModules: Math.max(1, Math.min(12, mods)),
      },
    });
  };

  const handleUpdateBrand = (newBrand: string) => {
    const brandStencilMap: Record<string, string> = {
      Ericsson: 'rectifier-ericsson-rs',
      Eltek: 'rectifier-eltek-rs',
      ZTE: 'rectifier-zte-rs',
      Huawei: 'rectifier-huawei-rs',
      Vertiv: 'rectifier-vertiv-rs',
      Delta: 'rectifier-delta-rs',
    };
    const targetStencilId = brandStencilMap[newBrand] || primary.stencilId;
    onUpdateSelected({
      stencilId: targetStencilId,
      customProps: {
        ...customProps,
        brand: newBrand,
        stencilType: targetStencilId,
        isRectifierSystem: true,
      },
    });
  };

  return (
    <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/50 space-y-3.5 shadow-lg shadow-amber-950/20 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Rectifier &amp; Battery System
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-700/60">
            Open Bayface
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
            -48V DC Plant
          </span>
        </div>
      </div>

      {/* Brand Selection Pills */}
      <div className="space-y-1.5 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
        <label className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
          <span>OEM System Manufacturer</span>
          <span className="text-[9.5px] font-mono text-sky-400">{currentBrand} RS</span>
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'Ericsson', label: 'Ericsson RS', color: 'border-sky-500' },
            { id: 'Eltek', label: 'Eltek RS', color: 'border-blue-500' },
            { id: 'ZTE', label: 'ZTE RS', color: 'border-cyan-500' },
            { id: 'Huawei', label: 'Huawei RS', color: 'border-red-500' },
            { id: 'Vertiv', label: 'Vertiv RS', color: 'border-orange-500' },
            { id: 'Delta', label: 'Delta RS', color: 'border-emerald-500' },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleUpdateBrand(b.id)}
              className={`py-1 px-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center truncate ${
                currentBrand.toLowerCase() === b.id.toLowerCase()
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rectifier Actual Height & U-Capacity Customizer */}
      <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-sky-400" />
            Actual Height (H)
          </label>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5">
              <input
                type="number"
                min={800}
                max={3000}
                step={50}
                value={currentHeightMm}
                onChange={(e) => handleUpdateHeight(parseInt(e.target.value) || 2000)}
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
        <div className="space-y-1">
          <div className="flex justify-between text-[9.5px] text-slate-400">
            <span>Range: 1.2m – 2.6m</span>
            <span className="font-mono text-sky-300 font-semibold">{(currentHeightMm / 1000).toFixed(2)}m</span>
          </div>
          <input
            type="range"
            min={1200}
            max={2600}
            step={50}
            value={currentHeightMm}
            onChange={(e) => handleUpdateHeight(parseInt(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Height Presets */}
        <div className="space-y-1 pt-0.5">
          <span className="text-[9.5px] text-slate-400">Telecom Height Presets:</span>
          <div className="grid grid-cols-5 gap-1">
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
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                  title={`${p.u}U (${p.mm}mm)`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stepper Nudge */}
        <div className="flex gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => handleUpdateHeight(currentHeightMm - 100)}
            className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono cursor-pointer transition-colors"
          >
            -100mm
          </button>
          <button
            type="button"
            onClick={() => handleUpdateHeight(currentHeightMm + 100)}
            className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono cursor-pointer transition-colors"
          >
            +100mm
          </button>
        </div>
      </div>

      {/* Battery Count Customizer */}
      <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
            48V Battery Packs (Stacked)
          </label>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleUpdateBatteryCount(currentBatteryCount - 1)}
              disabled={currentBatteryCount <= 1}
              className="p-1 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Decrease battery count"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min={1}
              max={32}
              value={currentBatteryCount}
              onChange={(e) => handleUpdateBatteryCount(parseInt(e.target.value) || 1)}
              className="w-10 text-center font-mono font-bold text-amber-300 bg-transparent text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleUpdateBatteryCount(currentBatteryCount + 1)}
              disabled={currentBatteryCount >= 32}
              className="p-1 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Increase battery count"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Presets (4-tier standard match reference design photo) */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {[
            { label: '4 Batt (Photo)', count: 4 },
            { label: '6 Batt (1.5×)', count: 6 },
            { label: '8 Batt (2×)', count: 8 },
            { label: '12 Batt (3×)', count: 12 },
          ].map((preset) => (
            <button
              key={preset.count}
              type="button"
              onClick={() => handleUpdateBatteryCount(preset.count)}
              className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all cursor-pointer text-center truncate ${
                currentBatteryCount === preset.count
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Battery Chemistry / Specification */}
        <div className="space-y-1 pt-1">
          <label className="text-[10px] text-slate-400 font-medium">Battery Chemistry &amp; Rating</label>
          <select
            value={currentBatteryType}
            onChange={(e) => handleUpdateBatteryType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-amber-200 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="lifepo4-100ah">48V 100Ah LiFePO4 Smart Lithium ESM (4.8 kWh)</option>
            <option value="lifepo4-150ah">48V 150Ah LiFePO4 Smart Lithium ESM (7.2 kWh)</option>
            <option value="lifepo4-200ah">48V 200Ah High-Density Smart Lithium (9.6 kWh)</option>
            <option value="vrla-100ah">12V 100Ah VRLA AGM Front Terminal</option>
            <option value="vrla-150ah">12V 150Ah VRLA Gel Deep Cycle</option>
            <option value="vrla-200ah">12V 200Ah High-Rate VRLA</option>
          </select>
        </div>

        {/* Rectifier Modules */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-sky-400" />
            Rectifier Modules:
          </span>
          <div className="flex items-center gap-1">
            {[2, 4, 6, 8].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleUpdateModules(m)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                  rectifierModules === m
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {m}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Autonomy & Engineering Calculation Readout */}
      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Total Bus Energy:</span>
          <span className="font-mono font-bold text-white">
            {totalKWh} kWh ({totalAh}Ah @ -48V DC)
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Estimated Autonomy:</span>
          <span className="font-mono font-bold text-emerald-400">
            ~{estimatedHours} Hours <span className="text-[10px] text-slate-400">(@ 2.0kW Load)</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[10px] pt-0.5 border-t border-slate-900">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            Configured Battery Strings:
          </span>
          <span className="font-mono text-amber-300">
            {isLithium
              ? `${currentBatteryCount}× Lithium Module (${totalAh}Ah)`
              : `${Math.max(1, Math.floor(currentBatteryCount / 4))}× 48V String (${currentBatteryCount} Units)`}
          </span>
        </div>
      </div>
    </div>
  );
};
