import React from 'react';
import { CADObject } from '../../../types/cad';
import { Zap, Shield } from 'lucide-react';
import { alignObjectFlushToWall } from '../../../utils/cad-geometry';

export interface ATSCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const ATSCustomizer: React.FC<ATSCustomizerProps> = ({
  primary,
  onUpdateSelected,
  allObjects,
  onAddToast,
}) => {
  const isAts =
    primary.stencilId === 'ats' ||
    primary.stencilId === 'ats-cabinet' ||
    primary.stencilId === 'ats-panel' ||
    primary.stencilId === 'ats-wall' ||
    primary.customProps?.stencilType === 'ats';

  if (!isAts) return null;

  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-sky-950/30 border border-amber-500/40 space-y-2.5 shadow-md shadow-amber-950/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          ATS (Wall Mounted)
        </span>
        <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          Wall Mounted
        </span>
      </div>

      {/* Technical Specifications */}
      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
        <div className="flex justify-between items-center text-slate-300">
          <span>Mounting Configuration:</span>
          <span className="text-white font-semibold">Wall Mounted (NEMA 3R/4X)</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Wall Anchors:</span>
          <span className="text-slate-200">4-Corner Channel Bolt Anchors</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Mounting Elevation:</span>
          <span className="text-slate-200 font-mono">1.2m – 1.6m Eye-Level AFF</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Normal Source:</span>
          <span className="text-emerald-400 font-medium">Utility Mains (230/400V)</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Emergency Source:</span>
          <span className="text-amber-400 font-medium">Standby Diesel Gen (Auto-Start)</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Safety Interlock:</span>
          <span className="text-sky-300 font-medium">Mechanical &amp; Electrical</span>
        </div>
      </div>

      {/* Transfer Mode Switcher */}
      <div className="space-y-1 pt-0.5">
        <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
          Transfer Mode / Operating State:
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              onUpdateSelected({
                customProps: { ...(primary.customProps || {}), transferMode: 'auto' },
              });
            }}
            className={`py-1 px-1 text-[9.5px] rounded cursor-pointer transition-all font-semibold border ${
              (primary.customProps?.transferMode || 'auto') === 'auto'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Auto Transfer
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateSelected({
                customProps: { ...(primary.customProps || {}), transferMode: 'manual' },
              });
            }}
            className={`py-1 px-1 text-[9.5px] rounded cursor-pointer transition-all font-semibold border ${
              primary.customProps?.transferMode === 'manual'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Manual Override
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateSelected({
                customProps: { ...(primary.customProps || {}), transferMode: 'test' },
              });
            }}
            className={`py-1 px-1 text-[9.5px] rounded cursor-pointer transition-all font-semibold border ${
              primary.customProps?.transferMode === 'test'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Gen Test Run
          </button>
        </div>
      </div>

      {/* Quick Wall Mounting Alignment Action */}
      {allObjects && allObjects.length > 1 && (
        <div className="pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              const result = alignObjectFlushToWall(primary, allObjects);
              if (result) {
                onUpdateSelected({
                  x: result.x,
                  y: result.y,
                  rotation: result.rotation,
                });
                onAddToast?.('success', `ATS aligned flush to ${result.wallName} (${result.rotation}°)`);
              } else {
                onAddToast?.('warning', 'No wall, shelter, or compound fence found nearby to align to');
              }
            }}
            className="w-full py-1.5 px-2 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-200 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Snap &amp; Align Flush to Nearest Wall</span>
          </button>
        </div>
      )}
    </div>
  );
};
