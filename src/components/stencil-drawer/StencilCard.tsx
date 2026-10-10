import React from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { StencilDefinition } from '../../types/cad';

interface StencilCardProps {
  stencil: StencilDefinition;
  isArmed: boolean;
  pinDrawer: boolean;
  onArmStencil: (stencil: StencilDefinition, keepOpen?: boolean) => void;
  onPlaceAtCenter?: (stencil: StencilDefinition) => void;
}

export const StencilCard: React.FC<StencilCardProps> = ({
  stencil,
  isArmed,
  pinDrawer,
  onArmStencil,
  onPlaceAtCenter,
}) => {
  const widthMeters = (stencil.defaultWidth / 20).toFixed(1);
  const heightMeters = (stencil.defaultHeight / 20).toFixed(1);

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ stencilId: stencil.id }));
        e.dataTransfer.setData('text/plain', stencil.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onDoubleClick={() => onPlaceAtCenter?.(stencil)}
      onClick={() => onArmStencil(stencil, pinDrawer)}
      title="Click to arm & deploy on canvas • Double-click to place in center • Drag & drop to canvas"
      className={`group p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-grab active:cursor-grabbing select-none relative ${
        isArmed
          ? 'border-sky-500 bg-sky-950/40 ring-1 ring-sky-400 shadow-lg shadow-sky-500/10'
          : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-1 mb-1.5 flex-wrap">
          <span className="font-semibold text-xs text-slate-200 group-hover:text-sky-300 transition-colors leading-tight">
            {stencil.name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {stencil.badge && (
              <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-medium">
                {stencil.badge}
              </span>
            )}
            {stencil.isStretchable && (
              <span className="text-[9px] px-1 py-0.2 bg-sky-950/80 text-sky-300 border border-sky-800/60 rounded">
                Stretch
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed">
          {stencil.description}
        </p>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-mono text-slate-400">
          {widthMeters}m × {heightMeters}m
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlaceAtCenter?.(stencil);
            }}
            title="Immediately add stencil to canvas"
            className="px-2.5 py-1 rounded-md bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:shadow-sky-500/20"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
          <span className={`text-[10px] flex items-center gap-0.5 font-medium ml-0.5 ${isArmed ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-sky-300'}`}>
            {isArmed ? 'Armed' : 'Arm'} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
