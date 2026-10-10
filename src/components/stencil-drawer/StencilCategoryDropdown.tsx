import React from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { STENCILS, STENCIL_CATEGORIES } from '../../utils/stencils';
import { StencilCategory } from '../../types/cad';

interface StencilCategoryDropdownProps {
  selectedCategory: StencilCategory | 'all';
  setSelectedCategory: (cat: StencilCategory | 'all') => void;
  isCategoryDropdownOpen: boolean;
  setIsCategoryDropdownOpen: (open: boolean) => void;
  categoryDropdownRef: React.RefObject<HTMLDivElement | null>;
  onCategorySelect?: () => void;
}

export const StencilCategoryDropdown: React.FC<StencilCategoryDropdownProps> = ({
  selectedCategory,
  setSelectedCategory,
  isCategoryDropdownOpen,
  setIsCategoryDropdownOpen,
  categoryDropdownRef,
  onCategorySelect,
}) => {
  const currentCategory = STENCIL_CATEGORIES.find((c) => c.id === selectedCategory);

  const getCategoryCount = (catId: StencilCategory | 'all') => {
    return catId === 'all'
      ? STENCILS.length
      : STENCILS.filter((s) => s.category === catId).length;
  };

  return (
    <div
      ref={categoryDropdownRef as any}
      className="relative px-3 py-2 border-b border-slate-800/80 bg-slate-950/40 z-20"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Main Category Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            isCategoryDropdownOpen
              ? 'bg-slate-900 border-sky-500 text-white ring-1 ring-sky-500/50 shadow-md shadow-sky-500/10'
              : selectedCategory !== 'all'
              ? 'bg-sky-950/50 border-sky-500/60 text-sky-200 hover:bg-sky-900/60 hover:border-sky-400'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm shrink-0">
              {selectedCategory === 'all' ? '📂' : currentCategory?.icon || '📦'}
            </span>
            <div className="flex flex-col text-left truncate leading-tight">
              <span className="text-[10px] text-slate-400 font-normal">Category</span>
              <span className="truncate font-semibold text-white">
                {selectedCategory === 'all' ? 'All Categories' : currentCategory?.name || selectedCategory}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/90 text-sky-400 border border-slate-700/60">
              {getCategoryCount(selectedCategory)}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isCategoryDropdownOpen ? 'rotate-180 text-sky-400' : ''
              }`}
            />
          </div>
        </button>

        {/* Quick Clear Filter Button when a specific category is active */}
        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setIsCategoryDropdownOpen(false);
            }}
            title="Reset to All Categories"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick-Access Top Category Buttons */}
      <div className="mt-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2 py-0.5 rounded text-[10.5px] whitespace-nowrap transition-all cursor-pointer font-medium ${
            selectedCategory === 'all'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          All ({STENCILS.length})
        </button>
        {[
          { id: 'racks' as StencilCategory, label: '🗄️ Racks' },
          { id: 'rectifier-system' as StencilCategory, label: '🔋 Rectifier System' },
          { id: 'equipments' as StencilCategory, label: '🔌 Equipments' },
          { id: 'cabinets' as StencilCategory, label: '📦 Cabinets' },
          { id: 'tower' as StencilCategory, label: '📡 Tower' },
          { id: 'power' as StencilCategory, label: '⚡ Power' },
          { id: 'shelter' as StencilCategory, label: '🏢 Shelter' },
        ].map((quick) => (
          <button
            key={quick.id}
            type="button"
            onClick={() => setSelectedCategory(quick.id)}
            className={`px-2 py-0.5 rounded text-[10.5px] whitespace-nowrap transition-all cursor-pointer font-medium ${
              selectedCategory === quick.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            {quick.label}
          </button>
        ))}
      </div>

      {/* Dropdown Menu Popover */}
      {isCategoryDropdownOpen && (
        <div
          data-category-dropdown="true"
          className="absolute top-full left-3 right-3 mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ring-1 ring-black/50"
        >
          <div className="p-1.5 space-y-0.5">
            {/* Option: All Categories */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setIsCategoryDropdownOpen(false);
                onCategorySelect?.();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📂</span>
                <span className="font-medium">All Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selectedCategory === 'all'
                      ? 'bg-sky-700 text-sky-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {STENCILS.length}
                </span>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>

            <div className="h-px bg-slate-800 my-1" />

            {/* All Specific Categories */}
            {STENCIL_CATEGORIES.map((cat) => {
              const count = STENCILS.filter((s) => s.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsCategoryDropdownOpen(false);
                    onCategorySelect?.();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white font-semibold shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <span className="truncate font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-sky-700 text-sky-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
