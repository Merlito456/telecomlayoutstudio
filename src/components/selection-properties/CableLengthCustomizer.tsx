/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject, ProjectSettings } from '../../types/cad';
import {
  calculateCableLength,
  detectCableEndpoints,
  inferCableType,
  CABLE_TYPE_DEFINITIONS,
  CableCategoryType,
  formatCableDisplay,
} from '../../utils/cad-geometry/cable-length-calculator';
import { Zap, Ruler, ArrowRight, Table, Sparkles, Layers } from 'lucide-react';

interface CableLengthCustomizerProps {
  primary: CADObject;
  allObjects: CADObject[];
  settings: ProjectSettings;
  onUpdateSelected: (updates: Partial<CADObject>, cascadeToChildren?: boolean) => void;
  onOpenCableSchedule?: () => void;
  onAddDimensions?: () => void;
}

export const CableLengthCustomizer: React.FC<CableLengthCustomizerProps> = ({
  primary,
  allObjects,
  settings,
  onUpdateSelected,
  onOpenCableSchedule,
  onAddDimensions,
}) => {
  // Only display for linear cable runs, polylines, pens, cable ladders, or cabling layer
  const isLinear = primary.type === 'line' || primary.type === 'polyline' || primary.type === 'pen';
  const isTray =
    primary.stencilId?.includes('tray') ||
    primary.stencilId?.includes('ladder') ||
    primary.customProps?.stencilType?.includes('tray') ||
    primary.customProps?.stencilType?.includes('ladder');
  const isCablingLayer = primary.layerId === 'layer-cabling';
  const isDesignatedCable = primary.isCable === true || primary.cableType !== undefined;

  if (!isLinear && !isTray && !isCablingLayer && !isDesignatedCable) {
    return null;
  }

  const calc = calculateCableLength(primary, settings.scaleFactor);
  const currentType = inferCableType(primary);
  const meta = CABLE_TYPE_DEFINITIONS[currentType] || CABLE_TYPE_DEFINITIONS.custom;
  const endpoints = detectCableEndpoints(primary, allObjects);

  const verticalDropM = calc.verticalDropM;
  const slackPct = calc.slackPct;

  const handleSetCableType = (newType: CableCategoryType) => {
    const typeMeta = CABLE_TYPE_DEFINITIONS[newType];
    onUpdateSelected(
      {
        isCable: true,
        cableType: newType,
        stroke: typeMeta.defaultColor,
        draftingColor: typeMeta.defaultColor,
        cableVerticalDropM: typeMeta.defaultVerticalDropM,
        cableSlackPct: typeMeta.defaultSlackPct,
      },
      true
    );
  };

  const handleUpdateDrop = (dropM: number) => {
    onUpdateSelected({ cableVerticalDropM: dropM }, true);
  };

  const handleUpdateSlack = (pct: number) => {
    onUpdateSelected({ cableSlackPct: pct }, true);
  };

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-900 border border-sky-500/40 space-y-3.5 shadow-lg shadow-sky-950/20">
      {/* Header with Live Calculated Length */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block leading-tight">
              Auto Cable Length
            </span>
            <span className="text-[9px] text-slate-400 block leading-tight font-mono">
              Calculated automatically
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-mono font-bold text-sky-300">
            {formatCableDisplay(calc.totalLengthM, settings)}
          </div>
          <div className="text-[9px] font-mono text-slate-400">
            ({calc.totalLengthFt.toFixed(1)} ft total)
          </div>
        </div>
      </div>

      {/* Length Calculation Breakdown Cards */}
      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-center">
        <div className="p-1 rounded bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block text-[9px]">2D Run</span>
          <span className="text-slate-200 font-bold block">{calc.horizontalM.toFixed(2)}m</span>
        </div>
        <div className="p-1 rounded bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block text-[9px]">+Vert Drop</span>
          <span className="text-amber-300 font-bold block">+{verticalDropM.toFixed(1)}m</span>
        </div>
        <div className="p-1 rounded bg-slate-900/60 border border-slate-800/80">
          <span className="text-slate-400 block text-[9px]">+Slack ({slackPct}%)</span>
          <span className="text-emerald-300 font-bold block">+{calc.slackM.toFixed(2)}m</span>
        </div>
      </div>

      {/* Cable Category Preset Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-300 block uppercase tracking-wider">
          Cable Classification:
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              'dc-power',
              'ac-power',
              'fiber',
              'ground',
              'rf-coax',
              'cat6',
            ] as CableCategoryType[]
          ).map((cKey) => {
            const def = CABLE_TYPE_DEFINITIONS[cKey];
            const isSelected = currentType === cKey;
            return (
              <button
                key={cKey}
                type="button"
                onClick={() => handleSetCableType(cKey)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-semibold shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/60"
                  style={{ backgroundColor: def.defaultColor }}
                />
                <span className="truncate">{def.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[9px] text-slate-400 block italic leading-tight">
          Spec: {meta.nominalSpecs}
        </span>
      </div>

      {/* Auto-Detected Connected Equipment (From ➔ To) */}
      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/90 space-y-1 text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold uppercase text-[9px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" /> Auto-Detected Route Terminals
          </span>
          <span className="text-[9px] font-mono text-emerald-400">Connected</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
          <div className="flex-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate" title={endpoints.fromEquipment}>
            <span className="text-slate-400 text-[9px] block">FROM:</span>
            <span className="truncate">{endpoints.fromEquipment}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <div className="flex-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate" title={endpoints.toEquipment}>
            <span className="text-slate-400 text-[9px] block">TO:</span>
            <span className="truncate">{endpoints.toEquipment}</span>
          </div>
        </div>
      </div>

      {/* Vertical Drop / Tray Height Stepper */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Vertical Drop (Tray to Gland):</span>
          <span className="font-mono text-amber-300 font-bold">{verticalDropM.toFixed(1)}m</span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1.5, 2.5, 2.8, 3.5, 4.0].map((dropVal) => (
            <button
              key={dropVal}
              type="button"
              onClick={() => handleUpdateDrop(dropVal)}
              className={`flex-1 py-1 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                Math.abs(verticalDropM - dropVal) < 0.1
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dropVal}m
            </button>
          ))}
        </div>
      </div>

      {/* Service Loop Slack Allowance */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Service Loop Slack Allowance:</span>
          <span className="font-mono text-emerald-300 font-bold">+{slackPct}% ({calc.slackM.toFixed(2)}m)</span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 5, 10, 15, 20].map((pctVal) => (
            <button
              key={pctVal}
              type="button"
              onClick={() => handleUpdateSlack(pctVal)}
              className={`flex-1 py-1 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                slackPct === pctVal
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              +{pctVal}%
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions: Stamp Dimension & View Full Schedule */}
      <div className="pt-1 flex flex-col gap-1.5">
        {onAddDimensions && (
          <button
            type="button"
            onClick={onAddDimensions}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-sky-900/50 hover:bg-sky-800 border border-sky-500/40 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5 text-sky-300" />
            <span>Stamp Cable Dimension on Canvas</span>
          </button>
        )}

        {onOpenCableSchedule && (
          <button
            type="button"
            onClick={onOpenCableSchedule}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Full Site Cable Schedule &amp; BOM</span>
          </button>
        )}
      </div>
    </div>
  );
};
