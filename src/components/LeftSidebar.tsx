/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ToolType } from '../types/cad';
import {
  MousePointer,
  Hand,
  PenTool,
  Minus,
  Spline,
  Square,
  Circle,
  Type,
  MoveDiagonal,
  Eraser,
  Package,
} from 'lucide-react';
import { CategoryTab } from './TopToolbar';

interface LeftSidebarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isStencilDrawerOpen: boolean;
  onToggleStencilDrawer: () => void;
  hasArmedStencil: boolean;
  armedStencilName?: string;
  activeCategory?: CategoryTab;
  onSelectCategory?: (category: CategoryTab) => void;
  onOpenAutoWallGateModal?: () => void;
  onOpenShelterDesigner?: () => void;
  onOpenRackDesigner?: () => void;
  onOpenCableSchedule?: () => void;
  onOpenAbout?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  onSelectTool,
  isStencilDrawerOpen,
  onToggleStencilDrawer,
  hasArmedStencil,
  armedStencilName,
}) => {
  const pointerTools: {
    id: ToolType;
    name: string;
    shortcut: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'select', name: 'Select / Move', shortcut: 'V', icon: MousePointer },
    { id: 'pan', name: 'Pan Canvas', shortcut: 'H', icon: Hand },
  ];

  const drawTools: {
    id: ToolType;
    name: string;
    shortcut: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'line', name: 'Straight Line', shortcut: 'L', icon: Minus },
    { id: 'polyline', name: 'Polyline Path', shortcut: 'Enter', icon: Spline },
    { id: 'rectangle', name: 'Rectangle', shortcut: 'R', icon: Square },
    { id: 'circle', name: 'Circle', shortcut: 'C', icon: Circle },
    { id: 'pen', name: 'Freehand Pen (Cables)', shortcut: 'P', icon: PenTool },
  ];

  const annotateTools: {
    id: ToolType;
    name: string;
    shortcut: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'text', name: 'Text / Label', shortcut: 'T', icon: Type },
    { id: 'dim-aligned', name: 'Aligned Dimension', shortcut: 'D', icon: MoveDiagonal },
    { id: 'eraser', name: 'Eraser', shortcut: 'E', icon: Eraser },
  ];

  return (
    <aside className="w-13 bg-slate-950/95 border-r border-slate-800 flex flex-col items-center py-2 gap-1 shrink-0 z-20 backdrop-blur-md">
      {/* 1. Stencil Library Quick Launcher */}
      <div className="relative mb-0.5">
        <button
          type="button"
          onClick={onToggleStencilDrawer}
          title={`Equipment Stencils Library (26+ Telecom Items)${
            armedStencilName ? ` - Armed: ${armedStencilName}` : ''
          }`}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isStencilDrawerOpen || hasArmedStencil
              ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400'
              : 'bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
        </button>
        {hasArmedStencil && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        )}
      </div>

      <div className="w-6 h-px bg-slate-800 my-0.5" />

      {/* 2. Primary Navigation / Selection */}
      <div className="flex flex-col gap-1 items-center">
        {pointerTools.map((t) => {
          const isActive = activeTool === t.id && !hasArmedStencil;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool(t.id)}
              title={`${t.name} [${t.shortcut}]`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      <div className="w-6 h-px bg-slate-800 my-0.5" />

      {/* 3. 2D Geometry Drawing Tools */}
      <div className="flex flex-col gap-1 items-center">
        {drawTools.map((t) => {
          const isActive = activeTool === t.id && !hasArmedStencil;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool(t.id)}
              title={`${t.name} ${t.shortcut ? `[${t.shortcut}]` : ''}`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      <div className="w-6 h-px bg-slate-800 my-0.5" />

      {/* 4. Annotations & Modify Tools */}
      <div className="flex flex-col gap-1 items-center">
        {annotateTools.map((t) => {
          const isActive = activeTool === t.id && !hasArmedStencil;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool(t.id)}
              title={`${t.name} ${t.shortcut ? `[${t.shortcut}]` : ''}`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? t.id === 'eraser'
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : t.id === 'eraser'
                  ? 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </aside>
  );
};
