import React from "react";
import { CADObject } from "../../types/cad";
import { Shield, ArrowUp, CheckCircle2, Umbrella } from "lucide-react";
import { alignObjectFlushToWall } from "../../utils/cad-geometry";

interface CanopyCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects: CADObject[];
  onAddToast?: (type: "info" | "success" | "warning" | "error", msg: string) => void;
}

export const CanopyCustomizer: React.FC<CanopyCustomizerProps> = ({
  primary,
  onUpdateSelected,
  allObjects,
  onAddToast,
}) => {
  const isCanopy =
    primary.stencilId === "wall-roof-canopy" ||
    primary.stencilId === "wall-roof-shade" ||
    primary.customProps?.stencilType === "wall-roof-canopy" ||
    primary.customProps?.stencilType === "wall-roof-shade" ||
    primary.customProps?.isRoofCanopy;

  if (!isCanopy) return null;

  return (
    <div className="space-y-3 p-3 rounded-xl bg-gradient-to-b from-sky-950/40 to-slate-900/80 border border-sky-500/40 shadow-sm ring-1 ring-sky-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Umbrella className="w-3.5 h-3.5 text-sky-400" />
                  Wall-Attached Roof Canopy
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700/50">
                  Equipment Shade
                </span>
              </div>

              {/* Notice that equipment stays selectable underneath */}
              <div className="text-[9px] text-sky-200/80 bg-sky-950/60 p-2 rounded-lg border border-sky-800/40 flex items-start gap-1.5 leading-relaxed">
                <span className="text-sky-400 font-bold shrink-0">ℹ</span>
                <span>
                  Cantilever shade roof anchored to wall top. Equipment placed underneath (MPD, DCPDU, ECB, ATS, Cabinets) remains fully selectable and visible.
                </span>
              </div>

              {/* Roof Slope / Pitch Angle */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1.5">
                  <span className="font-semibold text-slate-200">Roof Drainage Slope Angle</span>
                  <span className="font-mono text-sky-400 font-bold">
                    {primary.customProps?.roofSlopeAngle ?? 12}° Pitch
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[8, 12, 15, 20].map((deg) => {
                    const currentAngle = primary.customProps?.roofSlopeAngle ?? 12;
                    const active = currentAngle === deg;
                    return (
                      <button
                        key={deg}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              roofSlopeAngle: deg,
                            },
                          })
                        }
                        className={`py-1.5 px-2 rounded-lg text-center font-mono text-[10px] font-bold transition-all cursor-pointer border ${
                          active
                            ? 'bg-sky-600 text-white border-sky-400 shadow-sm ring-1 ring-sky-400/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Translucent Footprint Fill Opacity */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="font-semibold text-slate-200">Shade Footprint Tint</span>
                  <span className="font-mono text-sky-300 font-bold">
                    {Math.round((primary.fillOpacity ?? 0.15) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.05"
                  value={primary.fillOpacity ?? 0.15}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSelected({ fillOpacity: val });
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-0.5">
                  <span>5% (Light Sheer)</span>
                  <span>15% (Standard)</span>
                  <span>45% (Dark Shade)</span>
                </div>
              </div>

              {/* Corrugated Sheet Finish Color */}
              <div>
                <span className="text-[10px] font-semibold text-slate-200 block mb-1">
                  Corrugated Sheet Finish
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { name: 'Sky Blue', color: '#0284c7', stroke: '#38bdf8' },
                    { name: 'Slate Gray', color: '#334155', stroke: '#94a3b8' },
                    { name: 'Zinc Silver', color: '#475569', stroke: '#cbd5e1' },
                    { name: 'Amber Sand', color: '#78350f', stroke: '#f59e0b' },
                  ].map((fin) => {
                    const active = primary.stroke === fin.stroke;
                    return (
                      <button
                        key={fin.name}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            fill: fin.color,
                            stroke: fin.stroke,
                            customProps: {
                              ...(primary.customProps || {}),
                              finishName: fin.name,
                            },
                          })
                        }
                        className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border flex flex-col items-center gap-1 ${
                          active
                            ? 'bg-sky-950/80 border-sky-400 shadow-sm ring-1 ring-sky-400/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border shadow-inner"
                          style={{ backgroundColor: fin.stroke, borderColor: fin.color }}
                        />
                        <span className="text-[8px] font-medium text-slate-300 line-clamp-1">
                          {fin.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mounting Height / Wall Top Adjustment */}
              <div className="space-y-1.5 pt-1 border-t border-sky-900/40">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-200">
                    Canopy Mounting Height (Wall Top):
                  </span>
                  <span className="font-mono text-sky-400 font-bold">
                    {(primary.customProps?.canopyHeightM ?? 2.2).toFixed(2)}m (Top of Wall)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'Wall Top', m: 2.20, sub: 'Coping' },
                    { label: 'Under Coping', m: 2.00, sub: '2.0m' },
                    { label: 'Shelter Eave', m: 2.12, sub: 'Cabin' },
                    { label: 'High Shade', m: 2.60, sub: 'Clearance' },
                  ].map((preset) => {
                    const currentM = primary.customProps?.canopyHeightM ?? 2.20;
                    const active = Math.abs(currentM - preset.m) < 0.04;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              canopyHeightM: preset.m,
                              wallTop: preset.m * 10,
                            },
                          });
                        }}
                        className={`py-1 px-1 text-center rounded text-[9px] cursor-pointer transition-all border ${
                          active
                            ? 'bg-sky-600 text-white font-bold border-sky-400 shadow-sm'
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
                    min="1.50"
                    max="3.50"
                    step="0.05"
                    value={primary.customProps?.canopyHeightM ?? 2.20}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateSelected({
                        customProps: {
                          ...(primary.customProps || {}),
                          canopyHeightM: val,
                          wallTop: val * 10,
                        },
                      });
                    }}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={Number(primary.customProps?.canopyHeightM ?? 2.20).toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              canopyHeightM: val,
                              wallTop: val * 10,
                            },
                          });
                        }
                      }}
                      className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">m</span>
                  </div>
                </div>
              </div>

              {/* Snap & Align to Nearest Wall Top Button */}
              {allObjects && allObjects.length > 1 && (
                <div className="pt-1 border-t border-sky-900/40">
                  <button
                    type="button"
                    onClick={() => {
                      const result = alignObjectFlushToWall(primary, allObjects);
                      if (result) {
                        const wallH = result.wallHeightM ?? 2.2;
                        onUpdateSelected({
                          x: result.x,
                          y: result.y,
                          rotation: result.rotation,
                          customProps: {
                            ...(primary.customProps || {}),
                            canopyHeightM: wallH,
                            wallTop: wallH * 10,
                          },
                        });
                        onAddToast?.('success', `Canopy roof aligned flush to ${result.wallName} at wall top (${wallH.toFixed(2)}m)`);
                      } else {
                        onAddToast?.('warning', 'No perimeter wall, boundary fence, or shelter found nearby to anchor canopy');
                      }
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-200 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>Snap &amp; Align to Nearest Wall Top</span>
                  </button>
                </div>
              )}
            </div>
            );
};
