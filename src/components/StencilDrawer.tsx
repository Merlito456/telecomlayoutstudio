/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { STENCILS, STENCIL_CATEGORIES } from '../utils/stencils';
import { StencilCategory, StencilDefinition } from '../types/cad';
import { Search, X, Layers, Pin, PinOff } from 'lucide-react';
import { StencilCategoryDropdown } from './stencil-drawer/StencilCategoryDropdown';
import { StencilGuideBanners } from './stencil-drawer/StencilGuideBanners';
import { StencilCard } from './stencil-drawer/StencilCard';

interface StencilDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onArmStencil: (stencil: StencilDefinition, keepOpen?: boolean) => void;
  onPlaceAtCenter?: (stencil: StencilDefinition) => void;
  armedStencilId?: string;
  onOpenAutoWallGateModal?: () => void;
  onOpenShelterDesigner?: () => void;
}

export const StencilDrawer: React.FC<StencilDrawerProps> = ({
  isOpen,
  onClose,
  onArmStencil,
  onPlaceAtCenter,
  armedStencilId,
  onOpenAutoWallGateModal,
  onOpenShelterDesigner,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StencilCategory | 'all'>('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [pinDrawer, setPinDrawer] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click or Escape key
  useEffect(() => {
    if (!isCategoryDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategoryDropdownOpen]);

  // Dedicated native wheel capture to ensure the drawer list scrolls smoothly
  // and canvas NEVER zooms or pans while cursor is over the drawer
  useEffect(() => {
    const drawerEl = drawerRef.current;
    if (!drawerEl || !isOpen) return;

    const handleWheelCapture = (e: WheelEvent) => {
      e.stopPropagation();

      const target = e.target as HTMLElement | null;
      const isOverCategoryDropdown = !!target?.closest('[data-category-dropdown]');
      if (isOverCategoryDropdown) return;

      if (listRef.current) {
        e.preventDefault();
        listRef.current.scrollTop += e.deltaY;
      }
    };

    drawerEl.addEventListener('wheel', handleWheelCapture, { passive: false });
    return () => {
      drawerEl.removeEventListener('wheel', handleWheelCapture);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStencils = STENCILS.filter((st) => {
    // Normalization to handle queries like 'inshelter' matching 'in-shelter', etc.
    const normSearch = search.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normName = st.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normDesc = st.description.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normId = st.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normBadge = (st.badge || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const isShelterLadder =
      normId.includes('indoorladder') ||
      normId.includes('inshelterladder') ||
      normName.includes('inshelter') ||
      (normName.includes('shelter') && normName.includes('ladder'));

    const matchesCat =
      selectedCategory === 'all' ||
      st.category === selectedCategory ||
      (selectedCategory === 'shelter' && isShelterLadder);

    const matchesSearch =
      !normSearch ||
      normName.includes(normSearch) ||
      normDesc.includes(normSearch) ||
      normId.includes(normSearch) ||
      normBadge.includes(normSearch) ||
      (normSearch.includes('inshelter') && isShelterLadder) ||
      (normSearch.includes('shelter') && normSearch.includes('ladder') && isShelterLadder);

    return matchesCat && matchesSearch;
  });

  return (
    <div
      ref={drawerRef}
      data-stencil-drawer="true"
      onWheel={(e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest('[data-category-dropdown]')) return;
        e.stopPropagation();
        if (listRef.current) {
          listRef.current.scrollTop += e.deltaY;
        }
      }}
      className="absolute top-0 left-14 bottom-0 w-80 sm:w-96 bg-slate-950/95 border-r border-slate-800 z-30 flex flex-col shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-left duration-200 overscroll-contain select-none"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <h2 className="font-semibold text-sm text-slate-100">Stencil Library</h2>
          <span className="px-1.5 py-0.5 text-[10px] bg-sky-950 text-sky-400 border border-sky-800/60 rounded font-mono">
            {STENCILS.length} stencils
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPinDrawer(!pinDrawer)}
            title={pinDrawer ? 'Drawer pinned open' : 'Pin drawer open'}
            className={`p-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
              pinDrawer
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {pinDrawer ? <Pin className="w-3.5 h-3.5 fill-sky-400 text-sky-400" /> : <PinOff className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden sm:inline">{pinDrawer ? 'Pinned' : 'Pin'}</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stencils (e.g. tower, generator, pad)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Dropdown Navigation */}
      <StencilCategoryDropdown
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isCategoryDropdownOpen={isCategoryDropdownOpen}
        setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}
        categoryDropdownRef={categoryDropdownRef}
        onCategorySelect={() => {
          if (listRef.current) listRef.current.scrollTop = 0;
        }}
      />

      {/* Stencils List */}
      <div
        ref={listRef}
        data-stencil-scroll-list="true"
        onWheel={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto p-3 space-y-4 overscroll-contain"
      >
        <StencilGuideBanners
          selectedCategory={selectedCategory}
          search={search}
          onOpenAutoWallGateModal={onOpenAutoWallGateModal}
          onOpenShelterDesigner={onOpenShelterDesigner}
          onCloseDrawer={onClose}
        />

        {STENCIL_CATEGORIES.filter(
          (c) => selectedCategory === 'all' || selectedCategory === c.id
        ).map((cat) => {
          const categoryStencils = filteredStencils.filter((s) => s.category === cat.id);
          if (categoryStencils.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] text-slate-600 font-normal">({categoryStencils.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categoryStencils.map((stencil, sIdx) => (
                  <StencilCard
                    key={`${cat.id}-${stencil.id}-${sIdx}`}
                    stencil={stencil}
                    isArmed={armedStencilId === stencil.id}
                    pinDrawer={pinDrawer}
                    onArmStencil={onArmStencil}
                    onPlaceAtCenter={onPlaceAtCenter}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredStencils.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No stencils match &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-900/50 flex items-center justify-between">
        <span>Click stencil to arm, then click canvas</span>
        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-300 font-mono">
          Esc to cancel
        </kbd>
      </div>
    </div>
  );
};
