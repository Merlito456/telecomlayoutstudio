/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RackEquipmentStencil,
  EquipmentCategory,
} from './types';
import {
  EQUIPMENT_STENCILS,
  createCustomEquipmentStencil,
} from './equipment-catalog';
import {
  Search,
  Plus,
  Server,
  Cpu,
  Layers,
  Zap,
  Radio,
  Tag,
  GripVertical,
} from 'lucide-react';

interface RackDesignerSidebarProps {
  onQuickAddStencil: (stencil: RackEquipmentStencil) => void;
}

export const RackDesignerSidebar: React.FC<RackDesignerSidebarProps> = ({
  onQuickAddStencil,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | '1u' | '2u' | '3u' | '4u' | 'network' | 'power' | 'telecom'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Custom U indicator state
  const [customU, setCustomU] = useState<number>(1);
  const [customLabel, setCustomLabel] = useState<string>('EQ-01');
  const [customCategory, setCustomCategory] = useState<EquipmentCategory>('switch');

  // Filter stencils
  const filteredStencils = EQUIPMENT_STENCILS.filter((s) => {
    if (activeCategory === '1u' && s.uHeight !== 1) return false;
    if (activeCategory === '2u' && s.uHeight !== 2) return false;
    if (activeCategory === '3u' && s.uHeight !== 3) return false;
    if (activeCategory === '4u' && s.uHeight < 4) return false;
    if (activeCategory === 'network' && !['switch', 'router', 'patch-panel', 'fiber-shelf'].includes(s.category))
      return false;
    if (activeCategory === 'power' && !['power', 'battery'].includes(s.category)) return false;
    if (activeCategory === 'telecom' && !['bbu', 'power', 'battery', 'fiber-shelf', 'router'].includes(s.category))
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.defaultLabel.toLowerCase().includes(q) ||
        (s.desc && s.desc.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, stencil: RackEquipmentStencil) => {
    e.dataTransfer.setData('application/json', JSON.stringify(stencil));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCreateCustom = () => {
    const stencil = createCustomEquipmentStencil(
      customU,
      customLabel || `EQ-${customU}U`,
      customCategory,
      customCategory === 'switch'
        ? '#1e3a8a'
        : customCategory === 'bbu'
        ? '#064e3b'
        : customCategory === 'power'
        ? '#431407'
        : '#1e293b'
    );
    onQuickAddStencil(stencil);
    // Auto increment label
    setCustomLabel((prev) => {
      const match = prev.match(/(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return prev.replace(/(\d+)$/, String(nextNum).padStart(match[1].length, '0'));
      }
      return `${prev}-02`;
    });
  };

  return (
    <div className="w-84 h-full border-r border-slate-800 bg-slate-900/95 flex flex-col overflow-hidden text-xs text-slate-200">
      {/* 1. QUICK INDICATE U BUILDER (DIRECT PROMPT REQUIREMENT) */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Indicate U Height &amp; Label
          </span>
          <span className="text-[10px] text-slate-400">Drag or Click Add</span>
        </div>

        {/* U Height Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((u) => (
            <button
              key={`ind-u-${u}`}
              onClick={() => {
                setCustomU(u);
                setCustomLabel((l) => (l.startsWith('EQ-') ? `EQ-${u}U-01` : l));
              }}
              className={`py-1.5 rounded font-mono font-bold text-xs transition-colors cursor-pointer ${
                customU === u
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {u}U
            </button>
          ))}
        </div>

        {/* Custom Label and Category */}
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Label Designation</label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. SW-01"
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as EquipmentCategory)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="switch">Switch</option>
              <option value="server">Server</option>
              <option value="router">Router</option>
              <option value="patch-panel">Patch Panel</option>
              <option value="fiber-shelf">Fiber Shelf</option>
              <option value="bbu">5G BBU</option>
              <option value="power">Power</option>
              <option value="battery">Battery</option>
            </select>
          </div>
        </div>

        {/* Draggable Custom Card + Quick Add Button */}
        <div className="flex gap-1.5 items-stretch">
          <div
            draggable={true}
            onDragStart={(e) => {
              const stencil = createCustomEquipmentStencil(
                customU,
                customLabel || `EQ-${customU}U`,
                customCategory
              );
              handleDragStart(e, stencil);
            }}
            className="flex-1 flex items-center justify-between p-2 rounded-lg bg-sky-950/70 border border-sky-600/60 text-sky-200 cursor-grab active:cursor-grabbing hover:bg-sky-900/60 transition-colors shadow-sm"
            title="Drag onto rack slot directly"
          >
            <div className="flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono font-bold text-xs">{customU}U</span>
              <span className="font-mono font-semibold text-white truncate max-w-[80px]">
                {customLabel}
              </span>
            </div>
            <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-sky-900/80 text-sky-300 font-semibold">
              Drag Me
            </span>
          </div>

          <button
            onClick={handleCreateCustom}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-sm"
            title="Quick add to next available slot"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipments (1U, switch, BBU...)"
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: '1u', label: '1U' },
            { id: '2u', label: '2U' },
            { id: '3u', label: '3U' },
            { id: '4u', label: '4U+' },
            { id: 'network', label: 'Network' },
            { id: 'power', label: 'Power' },
            { id: 'telecom', label: 'Telecom' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CATALOG LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Catalog Stencils ({filteredStencils.length})
        </span>

        {filteredStencils.map((stencil) => {
          return (
            <div
              key={stencil.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, stencil)}
              onClick={() => onQuickAddStencil(stencil)}
              className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/60 transition-all cursor-grab active:cursor-grabbing group shadow-sm"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 shrink-0" />
                  <span className="font-semibold text-white text-xs truncate max-w-[170px]">
                    {stencil.name}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-mono font-bold text-[10px] shrink-0">
                  {stencil.uHeight}U
                </span>
              </div>

              {/* Default Label & Ports Info */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pl-5">
                <span className="font-mono text-slate-300 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-sky-400" />
                  {stencil.defaultLabel}
                </span>
                {stencil.ports && stencil.ports.length > 0 && (
                  <span className="text-slate-400 font-mono">
                    {stencil.ports[0].count}x {stencil.ports[0].type.toUpperCase()}
                  </span>
                )}
              </div>

              {stencil.desc && (
                <p className="text-[10px] text-slate-400 pl-5 mt-1 line-clamp-1">
                  {stencil.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
