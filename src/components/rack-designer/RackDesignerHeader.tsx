/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CADObject } from '../../types/cad';
import { RackElevationConfig, RackDesignerView } from './types';
import {
  Server,
  Layers,
  Box,
  Save,
  X,
  RotateCcw,
  DoorOpen,
  DoorClosed,
  ChevronDown,
  Check,
  Columns,
  Rows,
  Square,
  LayoutGrid,
  Ruler,
  Minus,
  Plus,
} from 'lucide-react';
import {
  isOutdoorCabinet,
  getCabinetActualU,
  getCabinetBrand,
} from '../../utils/cabinet-u-capacity';

interface RackDesignerHeaderProps {
  rackConfig: RackElevationConfig;
  viewMode: RackDesignerView;
  onSetViewMode: (mode: RackDesignerView) => void;
  onSaveAndApply: () => void;
  onAddNewRack?: () => void;
  onClose: () => void;
  onClearRack: () => void;
  onUpdateRackConfig?: (partial: Partial<RackElevationConfig>) => void;
  onUpdateRackHeight?: (totalU: number, heightMm?: number) => void;
  onSyncAllRacksHeight?: (totalU: number, heightMm?: number) => void;
  availableRacks?: CADObject[];
  activeRackId?: string;
  onSelectRack?: (rackObj: CADObject | null) => void;
}

export const STANDARD_HEIGHT_PRESETS = [
  { u: 48, mm: 2300, label: '48U · 2300 mm (7.5 ft)', desc: 'Datacenter Enterprise Frame' },
  { u: 45, mm: 2200, label: '45U · 2200 mm (7.2 ft)', desc: 'Telecom Central Office Standard' },
  { u: 42, mm: 2000, label: '42U · 2000 mm (6.5 ft)', desc: 'Universal 19" Equipment Standard' },
  { u: 36, mm: 1800, label: '36U · 1800 mm (6.0 ft)', desc: 'Intermediate Distribution Frame' },
  { u: 24, mm: 1200, label: '24U · 1200 mm (4.0 ft)', desc: 'Half-Height Relay Rack' },
  { u: 18, mm: 1000, label: '18U · 1000 mm (3.3 ft)', desc: 'Compact Wall-Mount Frame' },
  { u: 12, mm: 650,  label: '12U · 650 mm (2.1 ft)',  desc: 'Mini Equipment Enclosure' },
];

export const RackDesignerHeader: React.FC<RackDesignerHeaderProps> = ({
  rackConfig,
  viewMode,
  onSetViewMode,
  onSaveAndApply,
  onAddNewRack,
  onClose,
  onClearRack,
  onUpdateRackConfig,
  onUpdateRackHeight,
  onSyncAllRacksHeight,
  availableRacks = [],
  activeRackId,
  onSelectRack,
}) => {
  const [isCabinetSelectorOpen, setIsCabinetSelectorOpen] = useState(false);
  const [isHeightSelectorOpen, setIsHeightSelectorOpen] = useState(false);
  const [customMmInput, setCustomMmInput] = useState<string>(
    String(rackConfig.heightMm || Math.round(rackConfig.totalU * 44.45 + 130))
  );

  const actualHeightMm = rackConfig.heightMm || Math.round(rackConfig.totalU * 44.45 + 130);
  const usedU = rackConfig.equipments.reduce((acc, itm) => acc + itm.uHeight, 0);
  const freeU = Math.max(0, rackConfig.totalU - usedU);

  useEffect(() => {
    setCustomMmInput(String(rackConfig.heightMm || Math.round(rackConfig.totalU * 44.45 + 130)));
  }, [rackConfig.heightMm, rackConfig.totalU]);

  const handleSelectPreset = (u: number, mm: number) => {
    if (onUpdateRackHeight) {
      onUpdateRackHeight(u, mm);
    } else if (onUpdateRackConfig) {
      onUpdateRackConfig({ totalU: u, heightMm: mm });
    }
    setCustomMmInput(String(mm));
    setIsHeightSelectorOpen(false);
  };

  const handleApplyCustomMm = () => {
    const mm = parseInt(customMmInput, 10);
    if (!isNaN(mm) && mm >= 400 && mm <= 3500) {
      const calcU = Math.max(6, Math.min(60, Math.round((mm - 130) / 44.45)));
      if (onUpdateRackHeight) {
        onUpdateRackHeight(calcU, mm);
      } else if (onUpdateRackConfig) {
        onUpdateRackConfig({ totalU: calcU, heightMm: mm });
      }
      setIsHeightSelectorOpen(false);
    }
  };

  const handleStepMm = (delta: number) => {
    const current = parseInt(customMmInput, 10) || actualHeightMm;
    const nextMm = Math.max(400, Math.min(3200, current + delta));
    const calcU = Math.max(6, Math.min(60, Math.round((nextMm - 130) / 44.45)));
    if (onUpdateRackHeight) {
      onUpdateRackHeight(calcU, nextMm);
    } else if (onUpdateRackConfig) {
      onUpdateRackConfig({ totalU: calcU, heightMm: nextMm });
    }
    setCustomMmInput(String(nextMm));
  };

  const handleStepU = (delta: number) => {
    const nextU = Math.max(6, Math.min(60, rackConfig.totalU + delta));
    const nextMm = Math.round(nextU * 44.45 + 130);
    if (onUpdateRackHeight) {
      onUpdateRackHeight(nextU, nextMm);
    } else if (onUpdateRackConfig) {
      onUpdateRackConfig({ totalU: nextU, heightMm: nextMm });
    }
    setCustomMmInput(String(nextMm));
  };

  const handleSyncAll = () => {
    if (onSyncAllRacksHeight) {
      onSyncAllRacksHeight(rackConfig.totalU, actualHeightMm);
    }
    setIsHeightSelectorOpen(false);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 px-5 flex items-center justify-between gap-4 shrink-0 select-none z-30">
      {/* Zone 1: Wordmark & Identity with Existing Cabinet Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800/80 flex items-center justify-center text-sky-400">
          {rackConfig.isCabinet ? <Box className="w-4 h-4 text-emerald-400" /> : <Server className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
              {rackConfig.isCabinet ? 'Cabinet Equipment Designer' : 'Open Bay Rack Designer'}
            </h1>
            {rackConfig.isCabinet && rackConfig.brand && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                {rackConfig.brand}
              </span>
            )}

            {/* Existing Cabinets Switcher Dropdown */}
            {onSelectRack && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCabinetSelectorOpen(!isCabinetSelectorOpen);
                    setIsHeightSelectorOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sky-300 hover:text-white text-[10.5px] font-semibold transition-all cursor-pointer shadow-sm"
                  title="Switch between existing outdoor cabinets, racks, or design a new rack"
                >
                  <span>{activeRackId ? `Edit Cabinet (${availableRacks.length})` : 'New Rack · Switch'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isCabinetSelectorOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto">
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Target Frame
                    </div>
                    {/* Add Standalone Rack Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRack(null);
                        setIsCabinetSelectorOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 border-b border-slate-800/80 hover:bg-emerald-950/40 transition-colors cursor-pointer ${
                        !activeRackId ? 'bg-emerald-950/60 border-l-2 border-emerald-400' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Plus className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-bold text-emerald-300 text-[11px] truncate block">
                            + Design New Standalone Rack
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-400 block font-normal mt-0.5">
                          Create brand new equipment frame for layout
                        </span>
                      </div>
                      {!activeRackId && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>

                    {availableRacks.map((rObj) => {
                      const isCurrent = (activeRackId ? rObj.id === activeRackId : false);
                      const isCab = isOutdoorCabinet(rObj);
                      const rU = isCab ? getCabinetActualU(rObj) : (rObj.customProps?.uHeight ?? rObj.uHeight ?? 42);
                      const brand = isCab ? getCabinetBrand(rObj) : 'Open Bay';
                      const equipsCount = (rObj.customProps?.rackEquipments || (rObj as any).rackEquipments || []).length;
                      const title = rObj.text || rObj.customProps?.name || (isCab ? `${brand} Cabinet` : 'Open Bay Rack');

                      return (
                        <button
                          key={rObj.id}
                          type="button"
                          onClick={() => {
                            onSelectRack(rObj);
                            setIsCabinetSelectorOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-slate-800/80 transition-colors cursor-pointer ${
                            isCurrent ? 'bg-sky-950/60 border-l-2 border-sky-400' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isCab ? <Box className="w-3 h-3 text-emerald-400 shrink-0" /> : <Server className="w-3 h-3 text-sky-400 shrink-0" />}
                              <span className="font-semibold text-white text-[11px] truncate block">
                                {title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9.5px] text-slate-400 font-mono mt-0.5">
                              <span className="text-amber-300 font-bold">{rU}U Frame</span>
                              <span>·</span>
                              <span>{equipsCount} modules</span>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Actual Rack Height Selector & Multi-Rack Sync Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsHeightSelectorOpen(!isHeightSelectorOpen);
                  setIsCabinetSelectorOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-750 border border-sky-500/50 text-sky-300 hover:text-white text-[10.5px] font-semibold transition-all cursor-pointer shadow-sm"
                title="Configure actual height of rack or match all racks on site to same height"
              >
                <Ruler className="w-3 h-3 text-sky-400" />
                <span>{rackConfig.totalU}U Frame · {actualHeightMm}mm</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isHeightSelectorOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-80 bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-sky-400" />
                      Actual Rack Height Specification
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400">
                      ~{(actualHeightMm / 304.8).toFixed(1)} ft
                    </span>
                  </div>

                  {/* Standard Height Presets */}
                  <div className="space-y-1 py-2">
                    <span className="text-[9.5px] font-semibold text-slate-400 uppercase block px-1">
                      Standard Telecom &amp; Data Center Sizes
                    </span>
                    {STANDARD_HEIGHT_PRESETS.map((preset) => {
                      const isCurrent = rackConfig.totalU === preset.u;
                      return (
                        <button
                          key={preset.u}
                          type="button"
                          onClick={() => handleSelectPreset(preset.u, preset.mm)}
                          className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer text-xs ${
                            isCurrent ? 'bg-sky-950/70 border border-sky-500/50 text-sky-200' : 'text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-semibold block">{preset.label}</span>
                            <span className="text-[9.5px] text-slate-400">{preset.desc}</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Height Input in mm with Steppers */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[9.5px] font-semibold text-slate-400 uppercase block px-1">
                      Custom Physical Height (mm)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepMm(-50)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                        title="Decrease 50mm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={400}
                        max={3500}
                        step={10}
                        value={customMmInput}
                        onChange={(e) => setCustomMmInput(e.target.value)}
                        placeholder="Height in mm"
                        className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white text-center focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepMm(50)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                        title="Increase 50mm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCustomMm}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </div>

                  {/* Sync all racks on site button (Address user: "they are all the same height") */}
                  {availableRacks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleSyncAll}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        title="Set all racks in the shelter / site to this exact height"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Match All Racks on Site ({rackConfig.totalU}U / {actualHeightMm}mm)</span>
                      </button>
                      <span className="text-[9px] text-slate-400 block text-center mt-1">
                        Ensures all {availableRacks.length} telecom racks have uniform identical height
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-mono text-slate-300 font-semibold">{rackConfig.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-sky-400 font-bold">{rackConfig.totalU}U {rackConfig.isCabinet ? 'Cabinet' : 'Open Bay'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-400">{usedU}U Used</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">{freeU}U Free</span>
            <span aria-hidden="true">·</span>
            <span>{rackConfig.equipments.length} Devices</span>
          </div>
        </div>
      </div>

      {/* Zone 2: View Switcher (2D Elevation vs 3D Perspective) & Door Toggle */}
      <div className="flex items-center gap-2">
        {rackConfig.isCabinet && onUpdateRackConfig && (
          <button
            onClick={() => onUpdateRackConfig({ doorsOpen: !rackConfig.doorsOpen })}
            title="Toggle Cabinet Door [Open / Closed] to view internal equipment bays"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              rackConfig.doorsOpen
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-400/40 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {rackConfig.doorsOpen ? <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> : <DoorClosed className="w-3.5 h-3.5 text-amber-400" />}
            <span>Door: {rackConfig.doorsOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>
        )}

        {/* Equipment Mounting Orientation Toggle */}
        {onUpdateRackConfig && (
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => onUpdateRackConfig({ placementOrientation: 'vertical' })}
              title="Vertical Placement: Optical cassettes & subrack equipment placed vertically side-by-side (FH Mini ODC standard)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                rackConfig.placementOrientation === 'vertical'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-amber-400" />
              <span>Vertical Subrack</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateRackConfig({ placementOrientation: 'horizontal' })}
              title="Horizontal Placement: Standard EIA-310 19-inch rack units"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                rackConfig.placementOrientation !== 'vertical'
                  ? 'bg-slate-800 text-sky-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Rows className="w-3.5 h-3.5 text-sky-400" />
              <span>Horizontal EIA</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => onSetViewMode('front')}
            title="Front Elevation View: EIA-310 rails, faceplates, status LEDs, and front ports"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'front'
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Front View</span>
          </button>
          <button
            type="button"
            onClick={() => onSetViewMode('rear')}
            title="Rear Elevation View: Dual vertical PDUs, redundant power supplies (PSUs), cooling fans, grounding busbar"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'rear'
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Rear View</span>
          </button>
          <button
            type="button"
            onClick={() => onSetViewMode('top')}
            title="Top Plan View: True footprint, door swing clearance arcs, roof cable brush entry ports"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'top'
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Top Plan</span>
          </button>
          <button
            type="button"
            onClick={() => onSetViewMode('side')}
            title="Side Elevation View: Equipment chassis depth profiles, rail depth adjustment, side louvers"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'side'
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side View</span>
          </button>
          <button
            type="button"
            onClick={() => onSetViewMode('3d')}
            title="3D Perspective: Full 3D orbital perspective with realistic textures and doors"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === '3d'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D View</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {rackConfig.equipments.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all equipments from this rack?')) {
                onClearRack();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            title="Reset rack to empty"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {activeRackId ? (
          <>
            <button
              onClick={onSaveAndApply}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950/50 transition-all cursor-pointer whitespace-nowrap"
              title="Save equipments to this existing cabinet on site"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Cabinet</span>
            </button>

            {onAddNewRack && (
              <button
                onClick={onAddNewRack}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all cursor-pointer whitespace-nowrap"
                title="Add this designed rack as a new standalone item on the layout"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add as New Rack (+)</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onAddNewRack || onSaveAndApply}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all cursor-pointer whitespace-nowrap"
            title="Add this designed rack to the CAD site layout"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rack to Layout</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
          title="Close Rack Designer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
