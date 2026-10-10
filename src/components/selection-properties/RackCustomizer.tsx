/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CADObject } from '../../types/cad';
import {
  Server,
  Layers,
  Trash2,
  ArrowUpRight,
  Ruler,
  Check,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { isCabinetOrRack } from '../../utils/cabinet-u-capacity';

interface RackCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  onOpenRackDesigner?: (rackObj?: CADObject) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  onSaveAllObjects?: (allObjects: CADObject[]) => void;
}

export const RackCustomizer: React.FC<RackCustomizerProps> = ({
  primary,
  onUpdateSelected,
  onOpenRackDesigner,
  allObjects = [],
  onAddToast,
  onSaveAllObjects,
}) => {
  const sId = (primary.stencilId || primary.customProps?.stencilType || '').toLowerCase();
  const category = (primary.customProps?.category || '').toLowerCase();

  // Exclude Rectifier Systems (managed exclusively by RectifierCustomizer)
  if (
    primary.customProps?.isRectifierSystem ||
    sId.startsWith('rectifier-') ||
    sId === 'rack-power-rectifier' ||
    sId === 'flatpack-1' ||
    sId === 'rack-dc-pdu'
  ) {
    return null;
  }

  const isRack =
    sId.includes('rack') ||
    sId.includes('open-rack') ||
    sId.includes('bbu') ||
    sId.includes('relay') ||
    category === 'racks' ||
    category === 'rack';

  if (!isRack) return null;

  const totalU =
    primary.customProps?.uHeight ??
    primary.uHeight ??
    (sId.includes('18u')
      ? 18
      : sId.includes('24u')
      ? 24
      : sId.includes('36u')
      ? 36
      : sId.includes('45u')
      ? 45
      : sId.includes('48u')
      ? 48
      : 42);

  const equips = (primary.customProps?.rackEquipments || primary.rackEquipments || []) as any[];
  const usedU = equips.reduce((acc, eq) => acc + (eq.uHeight || 1), 0);
  const freeU = Math.max(0, totalU - usedU);

  const actualHeightMm =
    primary.customProps?.heightMm ??
    (primary as any).heightMm ??
    Math.round(totalU * 44.45 + 130);

  const [inputMm, setInputMm] = useState<string>(String(actualHeightMm));
  const [autoSyncAll, setAutoSyncAll] = useState<boolean>(true);

  useEffect(() => {
    setInputMm(String(actualHeightMm));
  }, [actualHeightMm]);

  const siteRacks = allObjects.filter((o) => isCabinetOrRack(o));

  const applyHeightToAllRacks = (validU: number, finalMm: number) => {
    if (siteRacks.length > 0 && onSaveAllObjects) {
      const updatedAll = allObjects.map((obj) => {
        if (isCabinetOrRack(obj)) {
          const rEquips = (obj.customProps?.rackEquipments || (obj as any).rackEquipments || []) as any[];
          const clamped = rEquips.map((eq) => {
            if ((eq.uSlot || 1) + (eq.uHeight || 1) - 1 > validU) {
              return { ...eq, uSlot: Math.max(1, validU - (eq.uHeight || 1) + 1) };
            }
            return eq;
          });
          return {
            ...obj,
            customProps: {
              ...(obj.customProps || {}),
              uHeight: validU,
              heightMm: finalMm,
              rackEquipments: clamped,
            },
          };
        }
        return obj;
      });
      onSaveAllObjects(updatedAll);
    }
  };

  const handleUpdateHeight = (newU: number, newMm?: number, forceSyncAll = autoSyncAll) => {
    const validU = Math.max(6, Math.min(60, newU));
    const finalMm = newMm !== undefined && newMm > 0 ? newMm : Math.round(validU * 44.45 + 130);
    const clampedEquips = equips.map((eq) => {
      if ((eq.uSlot || 1) + (eq.uHeight || 1) - 1 > validU) {
        return { ...eq, uSlot: Math.max(1, validU - (eq.uHeight || 1) + 1) };
      }
      return eq;
    });

    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          uHeight: validU,
          heightMm: finalMm,
          rackEquipments: clampedEquips,
        },
      },
      true
    );

    setInputMm(String(finalMm));

    if (forceSyncAll && siteRacks.length > 1) {
      applyHeightToAllRacks(validU, finalMm);
      onAddToast?.(
        'success',
        `Synchronized all ${siteRacks.length} site racks to ${validU}U (${finalMm}mm)`
      );
    }
  };

  const handleMmInputChange = (val: string) => {
    setInputMm(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 400 && parsed <= 3500) {
      const calcU = Math.max(6, Math.min(60, Math.round((parsed - 130) / 44.45)));
      handleUpdateHeight(calcU, parsed);
    }
  };

  const handleStepMm = (delta: number) => {
    const current = parseInt(inputMm, 10) || actualHeightMm;
    const nextMm = Math.max(400, Math.min(3200, current + delta));
    const calcU = Math.max(6, Math.min(60, Math.round((nextMm - 130) / 44.45)));
    handleUpdateHeight(calcU, nextMm);
  };

  const handleStepU = (delta: number) => {
    const nextU = Math.max(6, Math.min(60, totalU + delta));
    const nextMm = Math.round(nextU * 44.45 + 130);
    handleUpdateHeight(nextU, nextMm);
  };

  const handleMakeAllRacksSameHeightExplicit = () => {
    applyHeightToAllRacks(totalU, actualHeightMm);
    handleUpdateHeight(totalU, actualHeightMm, false);
    onAddToast?.(
      'success',
      `Applied ${totalU}U (${actualHeightMm}mm) uniform height to all ${siteRacks.length} site racks`
    );
  };

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3 shadow-md shadow-slate-950/40 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-sky-400" />
          Equipment Rack
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
          {totalU}U · {actualHeightMm}mm
        </span>
      </div>

      {/* Actual Physical Height (Frame Size) Section */}
      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-sky-400" />
            Actual Rack Height
          </span>
          <span className="font-mono text-[9.5px] text-slate-400">
            ~{(actualHeightMm / 1000).toFixed(2)}m · ~{(actualHeightMm / 304.8).toFixed(1)}ft
          </span>
        </div>

        {/* Height in mm and U with Steppers */}
        <div className="grid grid-cols-2 gap-2">
          {/* Millimeters Input */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">Physical Height:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepMm(-50)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Decrease 50mm"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={400}
                  max={3500}
                  step={10}
                  value={inputMm}
                  onChange={(e) => handleMmInputChange(e.target.value)}
                  className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-center font-mono text-xs text-amber-300 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="absolute right-1.5 top-1 text-[9px] font-mono text-slate-500 pointer-events-none">
                  mm
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStepMm(50)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Increase 50mm"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Unit Capacity (U) */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">Frame Capacity (U):</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepU(-1)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Decrease 1U"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="flex-1 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-center font-mono text-xs text-sky-300 font-bold">
                {totalU}U
              </div>
              <button
                type="button"
                onClick={() => handleStepU(1)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Increase 1U"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Standard Telecom Height Presets */}
        <div className="space-y-1">
          <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">
            Standard Preset Heights
          </span>
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
                key={`rc-u-${u}`}
                type="button"
                onClick={() => handleUpdateHeight(u, mm)}
                className={`py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                  totalU === u
                    ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
                title={`${u}U (${mm} mm / ${(mm / 304.8).toFixed(1)} ft)`}
              >
                {u}U
              </button>
            ))}
          </div>
        </div>

        {/* Uniform Height Across All Site Racks Controls */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <label className="flex items-center justify-between text-[10.5px] text-slate-300 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              <span>Auto-sync all site racks to same height</span>
            </span>
            <input
              type="checkbox"
              checked={autoSyncAll}
              onChange={(e) => setAutoSyncAll(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
          </label>

          <button
            type="button"
            onClick={handleMakeAllRacksSameHeightExplicit}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
            title="Set all racks on this layout to identical height"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Make All Racks Same Height ({totalU}U · {actualHeightMm}mm)</span>
          </button>
          <span className="text-[9px] text-slate-400 block text-center">
            {siteRacks.length > 0
              ? `Applies to all ${siteRacks.length} telecom racks & cabinets on site`
              : 'Applies uniform height to all equipment racks'}
          </span>
        </div>
      </div>

      {/* Utilization Info */}
      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center text-slate-300">
          <span>Rack Designation:</span>
          <span className="font-mono font-semibold text-white">
            {primary.text || primary.name || 'OPEN BAY RACK'}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Equipments Installed:</span>
          <span className="font-mono font-bold text-emerald-400">
            {equips.length} {equips.length === 1 ? 'Chassis' : 'Chassis'} ({usedU}U / {totalU}U)
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Available Space:</span>
          <span className="font-mono text-sky-400 font-bold">{freeU}U Free</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
          <div
            style={{ width: `${Math.min(100, Math.round((usedU / totalU) * 100))}%` }}
            className="h-full bg-sky-500 rounded-full"
          />
        </div>
      </div>

      {/* Primary Designer Launch Button */}
      {onOpenRackDesigner && (
        <button
          onClick={() => onOpenRackDesigner(primary)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-950/50 transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          <span>Open Bay Rack Designer</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
        </button>
      )}

      {/* Clear Rack Button if has items */}
      {equips.length > 0 && (
        <button
          onClick={() => {
            onUpdateSelected(
              {
                customProps: {
                  ...(primary.customProps || {}),
                  rackEquipments: [],
                  totalEquipments: 0,
                },
              },
              true
            );
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors text-[11px] cursor-pointer"
        >
          <Trash2 className="w-3 h-3 text-rose-400" />
          <span>Clear All Equipments ({equips.length})</span>
        </button>
      )}
    </div>
  );
};
