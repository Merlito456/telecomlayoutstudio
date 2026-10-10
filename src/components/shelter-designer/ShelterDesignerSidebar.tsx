/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InteriorEquipmentStencil, InteriorEquipmentItem } from './index';

export interface ShelterDesignerSidebarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: 'all' | 'rack' | 'cooling' | 'power' | 'ladder' | 'safety' | 'rectifier';
  setActiveCategory: (cat: 'all' | 'rack' | 'cooling' | 'power' | 'ladder' | 'safety' | 'rectifier') => void;
  filteredStencils: InteriorEquipmentStencil[];
  items: InteriorEquipmentItem[];
  onAddItem: (stencil: InteriorEquipmentStencil) => void;
}

export const ShelterDesignerSidebar: React.FC<ShelterDesignerSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  filteredStencils,
  items,
  onAddItem,
}) => {
  return (
    <div className="w-72 border-r border-slate-800 bg-slate-900/70 flex flex-col shrink-0">
      {/* Search & Category Filter */}
      <div className="p-2.5 border-b border-slate-800 space-y-2">
        <input
          type="text"
          placeholder="Search racks, cooling, power..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        {/* Category tabs */}
        <div className="grid grid-cols-4 gap-1 text-[9.5px] font-medium">
          {[
            { id: 'all', label: 'All' },
            { id: 'rectifier', label: '🔋 Rectifier' },
            { id: 'rack', label: 'Racks' },
            { id: 'cooling', label: 'AC / HVAC' },
            { id: 'power', label: 'Power' },
            { id: 'ladder', label: 'Cable Ladder' },
            { id: 'safety', label: 'Safety' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveCategory(t.id as any)}
              className={`py-1 px-1 rounded text-center transition-all cursor-pointer truncate ${
                activeCategory === t.id
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stencils List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {filteredStencils.map((stencil, idx) => (
          <div
            key={`${stencil.stencilId}-${stencil.category}-${idx}`}
            onClick={() => onAddItem(stencil)}
            className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: stencil.strokeColor }}
                />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                  {stencil.name}
                </span>
              </div>
              {stencil.uHeight && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                  {stencil.uHeight}U
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>
                {stencil.widthMm} × {stencil.depthMm} mm
              </span>
              <span className="text-slate-500">H: {stencil.heightMm}mm</span>
            </div>
            {stencil.desc && (
              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                {stencil.desc}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Info footer */}
      <div className="p-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between bg-slate-950/50">
        <span>{items.length} items placed</span>
        <span className="text-sky-400">Click item to add</span>
      </div>
    </div>
  );
};
