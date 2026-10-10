import React from 'react';
import { CADObject } from '../../../types/cad';
import { Zap, Shield } from 'lucide-react';
import { alignObjectFlushToWall } from '../../../utils/cad-geometry';

export interface ECBPropertiesCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const ECBPropertiesCustomizer: React.FC<ECBPropertiesCustomizerProps> = ({
  primary,
  onUpdateSelected,
  allObjects,
  onAddToast,
}) => {
  const isEcb =
    primary.stencilId === 'ecb' ||
    primary.stencilId === 'ecb-wall' ||
    primary.stencilId === 'ecb-pole' ||
    primary.customProps?.stencilType === 'ecb';

  if (!isEcb) return null;

  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-red-950/30 via-slate-900 to-sky-950/30 border border-red-500/40 space-y-3 shadow-md shadow-red-950/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-red-400" />
          ECB Main Disconnect
        </span>
        <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
          {primary.customProps?.mounting === 'pole' ? 'Pole Mounted' : 'Wall Mounted (Eye-Level)'}
        </span>
      </div>

      {/* Mounting Configuration */}
      <div className="space-y-1">
        <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
          Mounting Configuration:
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              onUpdateSelected({
                customProps: {
                  ...(primary.customProps || {}),
                  mounting: 'wall',
                  isWallMounted: true,
                  mountingElevationM: primary.customProps?.mountingElevationM ?? 1.55,
                },
              });
            }}
            className={`py-1.5 px-2 text-[10px] rounded-lg cursor-pointer transition-all font-semibold border flex items-center justify-center gap-1.5 ${
              (primary.customProps?.mounting || 'wall') === 'wall'
                ? 'bg-red-600 text-white border-red-400 shadow-sm font-bold'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>Wall Mounted</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateSelected({
                customProps: {
                  ...(primary.customProps || {}),
                  mounting: 'pole',
                  isWallMounted: false,
                  mountingElevationM: primary.customProps?.mountingElevationM ?? 1.55,
                },
              });
            }}
            className={`py-1.5 px-2 text-[10px] rounded-lg cursor-pointer transition-all font-semibold border flex items-center justify-center gap-1.5 ${
              primary.customProps?.mounting === 'pole'
                ? 'bg-red-600 text-white border-red-400 shadow-sm font-bold'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>Pole Mounted</span>
          </button>
        </div>
      </div>

      {/* Mounting Elevation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-200">Mounting Height (Above Grade):</span>
          <span className="font-mono text-emerald-400 font-bold">
            {(primary.customProps?.mountingElevationM ?? 1.55).toFixed(2)}m AFF (Eye-Level)
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: 'Eye-Level', m: 1.55 },
            { label: '1.40m Reach', m: 1.40 },
            { label: '1.65m High', m: 1.65 },
          ].map((preset) => {
            const currentM = primary.customProps?.mountingElevationM ?? 1.55;
            const active = Math.abs(currentM - preset.m) < 0.04;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      mountingElevationM: preset.m,
                    },
                  });
                }}
                className={`py-1 px-1 text-center rounded text-[9px] cursor-pointer transition-all border ${
                  active
                    ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">{preset.m.toFixed(2)}m</div>
                <div className="text-[7.5px] text-slate-400">{preset.label}</div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="range"
            min="0.80"
            max="2.20"
            step="0.05"
            value={primary.customProps?.mountingElevationM ?? 1.55}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdateSelected({
                customProps: {
                  ...(primary.customProps || {}),
                  mountingElevationM: val,
                },
              });
            }}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="3.0"
              value={Number(primary.customProps?.mountingElevationM ?? 1.55).toFixed(2)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      mountingElevationM: val,
                    },
                  });
                }
              }}
              className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 font-mono">m</span>
          </div>
        </div>
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
                  `ECB aligned flush to ${result.wallName} at eye-level (${result.rotation}°)`
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
    </div>
  );
};
