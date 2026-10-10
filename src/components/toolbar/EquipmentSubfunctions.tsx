/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Package,
  Server,
  Layers,
  Shield,
  Zap,
  X,
  Layers2,
} from 'lucide-react';

interface EquipmentSubfunctionsProps {
  isStencilDrawerOpen?: boolean;
  onToggleStencilDrawer?: () => void;
  hasArmedStencil?: boolean;
  armedStencilName?: string;
  onCancelArmedStencil?: () => void;
  onOpenShelterDesigner?: () => void;
  onOpenRackDesigner?: () => void;
  onOpenAutoWallGateModal?: () => void;
  onOpenCableSchedule?: () => void;
  layerCount?: number;
  activePanelTab?: 'properties' | 'layers';
  onToggleLayersPanel?: () => void;
}

export const EquipmentSubfunctions: React.FC<EquipmentSubfunctionsProps> = ({
  isStencilDrawerOpen,
  onToggleStencilDrawer,
  hasArmedStencil,
  armedStencilName,
  onCancelArmedStencil,
  onOpenShelterDesigner,
  onOpenRackDesigner,
  onOpenAutoWallGateModal,
  onOpenCableSchedule,
  layerCount = 1,
  activePanelTab,
  onToggleLayersPanel,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none text-xs">
      {/* 1. Stencil Catalog Drawer */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Catalog
        </span>
        <button
          type="button"
          onClick={onToggleStencilDrawer}
          title="Open Telecom Equipment Stencil Library (26+ Racks, Rectifiers, Batteries, Generators, Towers)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
            isStencilDrawerOpen || hasArmedStencil
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-sky-300" />
          <span>Stencil Library</span>
          <span className="bg-sky-950 text-sky-300 text-[10px] px-1.5 py-0.2 rounded-full border border-sky-500/40 font-mono">
            26+
          </span>
        </button>

        {hasArmedStencil && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[11px] animate-pulse">
            <span>Armed: {armedStencilName || 'Stencil'}</span>
            <button
              type="button"
              onClick={onCancelArmedStencil}
              title="Cancel Armed Placement [Esc]"
              className="p-0.5 hover:text-white rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Specialized Telecom Studios */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Telecom Studios
        </span>

        {onOpenShelterDesigner && (
          <button
            type="button"
            onClick={onOpenShelterDesigner}
            title="Shelter Interior Studio: Design telecom shelter room, place racks, rectifiers, AC DB, overhead cable ladders"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors bg-amber-950/50 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 hover:text-white cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Shelter Studio</span>
          </button>
        )}

        {onOpenRackDesigner && (
          <button
            type="button"
            onClick={onOpenRackDesigner}
            title="Rack & Cabinet Designer: Modular 42U/48U layout for BBUs, rectifiers, lithium battery shelves, routers"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors bg-emerald-950/50 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Rack Elevation</span>
          </button>
        )}
      </div>

      {/* 3. Site Generators & Calculations */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Site Automation
        </span>

        {onOpenAutoWallGateModal && (
          <button
            type="button"
            onClick={onOpenAutoWallGateModal}
            title="Auto-Generate Perimeter Wall & Gate (Specify Site Boundaries, Gate Location & Clearance)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors bg-sky-950/50 hover:bg-sky-900/80 border border-sky-500/30 text-sky-300 hover:text-white cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Perimeter Wall & Gate</span>
          </button>
        )}

        {onOpenCableSchedule && (
          <button
            type="button"
            onClick={onOpenCableSchedule}
            title="Cable Schedule & BOM Calculator: Calculate DC power, AC, fiber runs & grounding lengths"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors bg-amber-950/40 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 hover:text-white cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Cable Schedule & BOM</span>
          </button>
        )}
      </div>

      {/* 4. Hierarchy & Layers */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Layers
        </span>

        {onToggleLayersPanel && (
          <button
            type="button"
            onClick={onToggleLayersPanel}
            title="Photoshop Layers Panel (Reorder layers, hide/show, lock, opacity)"
            className={`flex items-center gap-1.5 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
              activePanelTab === 'layers'
                ? 'bg-sky-500/30 text-sky-200 border border-sky-400/60 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers2 className="w-3.5 h-3.5" />
            <span>Layers Panel</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1 rounded text-sky-400">
              {layerCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
