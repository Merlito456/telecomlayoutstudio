import React from "react";
import { CADObject } from "../../types/cad";
import { Radio, ArrowUp } from "lucide-react";

interface TowerCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const TowerCustomizer: React.FC<TowerCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  const isTower =
    primary.stencilId?.includes("tower") ||
    primary.stencilId?.includes("monopole") ||
    primary.stencilId?.includes("guyed") ||
    primary.stencilId?.includes("rooftop") ||
    primary.customProps?.stencilType?.includes("tower") ||
    primary.customProps?.stencilType?.includes("monopole");

  if (!isTower) return null;

  return (
            primary.stencilId === 'guyed-tower' ||
            primary.stencilId === 'rooftop-mount' ||
            primary.stencilId === 'rooftop-parapet-mount' ||
            primary.customProps?.stencilType?.includes('tower') ||
            primary.customProps?.stencilType?.includes('monopole') ||
            primary.customProps?.stencilType?.includes('guyed') ||
            primary.towerHeightM !== undefined ||
            primary.customProps?.towerHeightM !== undefined) && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 space-y-3 shadow-md shadow-amber-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Tower Structure Customizer
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {primary.towerHeightM ?? primary.customProps?.towerHeightM ?? (primary.stencilId?.includes('guyed') ? 35 : primary.stencilId?.includes('rooftop') ? 6 : 30)}m AGL
                </span>
              </div>

              {/* Tower Height (meters) Direct Number & Quick Controls */}
              <div className="space-y-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span className="font-semibold text-slate-200">Tower Height (Meters AGL):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {primary.towerHeightM ?? primary.customProps?.towerHeightM ?? (primary.stencilId?.includes('guyed') ? 35 : primary.stencilId?.includes('rooftop') ? 6 : 30)} meters
                    <span className="text-slate-500 font-normal ml-1">
                      (~{Math.round(((primary.towerHeightM ?? primary.customProps?.towerHeightM ?? (primary.stencilId?.includes('guyed') ? 35 : primary.stencilId?.includes('rooftop') ? 6 : 30)) * 3.28084))} ft)
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30;
                      const next = Math.max(3, cur - 5);
                      onUpdateSelected({
                        towerHeightM: next,
                        customProps: { ...(primary.customProps || {}), towerHeightM: next, isTower: true },
                      });
                    }}
                    title="Decrease height by 5 meters"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    -5m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30;
                      const next = Math.max(3, cur - 1);
                      onUpdateSelected({
                        towerHeightM: next,
                        customProps: { ...(primary.customProps || {}), towerHeightM: next, isTower: true },
                      });
                    }}
                    title="Decrease height by 1 meter"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    -1m
                  </button>

                  <div className="flex-1 flex items-center bg-slate-900 border border-amber-500/40 focus-within:border-amber-400 rounded px-2 py-1">
                    <input
                      type="number"
                      step="1"
                      min="3"
                      max="150"
                      value={primary.towerHeightM ?? primary.customProps?.towerHeightM ?? (primary.stencilId?.includes('guyed') ? 35 : primary.stencilId?.includes('rooftop') ? 6 : 30)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          onUpdateSelected({
                            towerHeightM: val,
                            customProps: { ...(primary.customProps || {}), towerHeightM: val, isTower: true },
                          });
                        }
                      }}
                      className="w-full bg-transparent text-xs text-amber-200 focus:outline-none text-center font-mono font-bold"
                    />
                    <span className="text-[10px] text-amber-400 ml-1 font-mono">meters</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const cur = primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30;
                      const next = Math.min(150, cur + 1);
                      onUpdateSelected({
                        towerHeightM: next,
                        customProps: { ...(primary.customProps || {}), towerHeightM: next, isTower: true },
                      });
                    }}
                    title="Increase height by 1 meter"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    +1m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30;
                      const next = Math.min(150, cur + 5);
                      onUpdateSelected({
                        towerHeightM: next,
                        customProps: { ...(primary.customProps || {}), towerHeightM: next, isTower: true },
                      });
                    }}
                    title="Increase height by 5 meters"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    +5m
                  </button>
                </div>

                {/* Slider */}
                <div className="pt-1">
                  <input
                    type="range"
                    min={primary.stencilId?.includes('rooftop') ? 3 : 15}
                    max={primary.stencilId?.includes('rooftop') ? 18 : 100}
                    step="1"
                    value={primary.towerHeightM ?? primary.customProps?.towerHeightM ?? (primary.stencilId?.includes('guyed') ? 35 : primary.stencilId?.includes('rooftop') ? 6 : 30)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onUpdateSelected({
                        towerHeightM: val,
                        customProps: { ...(primary.customProps || {}), towerHeightM: val, isTower: true },
                      });
                    }}
                    className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                    <span>{primary.stencilId?.includes('rooftop') ? '3m' : '15m'}</span>
                    <span>{primary.stencilId?.includes('rooftop') ? '6m' : '30m'}</span>
                    <span>{primary.stencilId?.includes('rooftop') ? '12m' : '60m'}</span>
                    <span>{primary.stencilId?.includes('rooftop') ? '18m' : '100m'}</span>
                  </div>
                </div>
              </div>

              {/* Standard Height Presets */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                  Standard Telecom Height Presets:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {(primary.stencilId?.includes('rooftop')
                    ? [3, 4.5, 6, 9, 12, 15, 18]
                    : [15, 20, 24, 30, 36, 40, 45, 50, 60, 75, 80, 100]
                  ).map((hVal) => {
                    const currentH = primary.towerHeightM ?? primary.customProps?.towerHeightM ?? (primary.stencilId?.includes('guyed') ? 35 : primary.stencilId?.includes('rooftop') ? 6 : 30);
                    const active = currentH === hVal;
                    return (
                      <button
                        key={hVal}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            towerHeightM: hVal,
                            customProps: { ...(primary.customProps || {}), towerHeightM: hVal, isTower: true },
                          })
                        }
                        className={`py-1 text-[10px] font-mono font-medium rounded transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {hVal}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Engineering Specifications Info */}
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[10px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Antenna Mount Centerline:</span>
                  <span className="text-slate-200 font-mono font-semibold">
                    {(primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30)}m AGL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Beacon Light Elevation:</span>
                  <span className="text-slate-200 font-mono font-semibold">
                    {((primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30) + 1.5).toFixed(1)}m AGL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Aviation Warning (FAA/ICAO):</span>
                  <span className={`font-medium ${
                    (primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30) >= 45
                      ? 'text-amber-400 font-bold'
                      : 'text-emerald-400'
                  }`}>
                    {(primary.towerHeightM ?? primary.customProps?.towerHeightM ?? 30) >= 45
                      ? 'Flashing Red Beacon Required (≥45m)'
                      : 'Standard Obstruction Light'}
                  </span>
                </div>
              </div>
            </div>
            );
};
