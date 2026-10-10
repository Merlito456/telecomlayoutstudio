import React from 'react';
import { CADObject } from '../../../../types/cad';
import { Shield } from 'lucide-react';
import { alignObjectFlushToWall } from '../../../../utils/cad-geometry';

export interface ACPDBMountingSectionProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const ACPDBMountingSection: React.FC<ACPDBMountingSectionProps> = ({
  primary,
  onUpdateSelected,
  allObjects,
  onAddToast,
}) => {
  return (
    <>
      {/* Multi-Enclosure Unit Count Selector */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>Enclosure Units (Multiple ACPDB):</span>
          <span className="text-amber-300 font-mono font-bold">
            {primary.customProps?.boxCount === 2 || primary.stencilId === 'acpdb-dual'
              ? '2 Units (Mains + DG)'
              : primary.customProps?.boxCount === 3
              ? '3 Units (Mains + DG + Aux)'
              : '1 Unit (Single)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { count: 1, label: 'Single', desc: '1 Enclosure' },
            { count: 2, label: 'Dual DB', desc: 'Mains + DG' },
            { count: 3, label: 'Triple Bay', desc: '3 Enclosures' },
          ].map((cfg) => {
            const currentCount =
              primary.customProps?.boxCount ?? (primary.stencilId === 'acpdb-dual' ? 2 : 1);
            const active = currentCount === cfg.count;
            return (
              <button
                key={cfg.count}
                type="button"
                onClick={() => {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      boxCount: cfg.count,
                    },
                  });
                }}
                className={`py-1.5 px-1 text-center rounded text-[9.5px] cursor-pointer transition-all border ${
                  active
                    ? 'bg-amber-600 text-white font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">{cfg.label}</div>
                <div className="text-[8px] text-slate-400">{cfg.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mounting Mode Toggle */}
      <div className="space-y-1">
        <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
          Mounting Configuration:
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'wall', label: 'Wall Mount', isWall: true },
            { id: 'pole', label: 'Pole Mount', isWall: false },
            { id: 'stand', label: 'Stand Leg', isWall: false },
          ].map((m) => {
            const active =
              (primary.customProps?.mounting ||
                (primary.stencilId === 'acpdb-pole' ? 'pole' : 'wall')) === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      mounting: m.id,
                      isWallMounted: m.isWall,
                      mountingElevationM: primary.customProps?.mountingElevationM ?? 1.55,
                    },
                  });
                }}
                className={`py-1.5 px-1 text-[9.5px] rounded-lg cursor-pointer transition-all font-semibold border flex flex-col items-center justify-center ${
                  active
                    ? 'bg-amber-600 text-white border-amber-400 shadow-sm font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
        {(primary.customProps?.mounting === 'pole' || primary.stencilId === 'acpdb-pole') && (
          <div className="text-[8.5px] text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-700/40 flex items-center gap-1.5">
            <span className="font-bold">✔</span>
            <span>Pole is cut flush at ACPDB rain hood level (capped with domed weather cap).</span>
          </div>
        )}
      </div>

      {/* Snap & Align Flush to Nearest Wall */}
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
                  customProps: {
                    ...(primary.customProps || {}),
                    mounting: 'wall',
                    isWallMounted: true,
                    mountingElevationM: primary.customProps?.mountingElevationM ?? 1.55,
                  },
                });
                onAddToast?.(
                  'success',
                  `ACPDB aligned flush to ${result.wallName} at eye-level (${result.rotation}°)`
                );
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
    </>
  );
};
