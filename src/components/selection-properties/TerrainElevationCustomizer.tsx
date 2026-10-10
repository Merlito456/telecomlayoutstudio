import React from "react";
import { CADObject } from "../../types/cad";
import { Mountain, Layers, TrendingDown, TrendingUp } from "lucide-react";

interface TerrainElevationCustomizerProps {
  primary: CADObject;
  selectedObjects: CADObject[];
  allObjects: CADObject[];
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  onMergeExcavatedAreas?: (pitIds?: string[]) => void;
  onAddToast?: (type: "info" | "success" | "warning" | "error", msg: string) => void;
}

export const TerrainElevationCustomizer: React.FC<TerrainElevationCustomizerProps> = ({
  primary,
  selectedObjects,
  allObjects,
  onUpdateSelected,
  onMergeExcavatedAreas,
  onAddToast,
}) => {
  return (
    <>
          {/* TERRAIN ELEVATION & FOUNDATION RETAINING DIVISION (Uneven Levels & Digging) */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-900/80 border border-amber-500/40 shadow-md shadow-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                Terrain Level &amp; Foundation
              </span>
              {/* Status Badge */}
              {(() => {
                const isWallMounted =
                  primary.customProps?.mounting === 'wall' ||
                  primary.customProps?.isWallMounted ||
                  primary.stencilId === 'acpdb-wall' ||
                  primary.stencilId === 'ecb' ||
                  primary.stencilId === 'ats' ||
                  primary.stencilId === 'ats-wall';
                const mountM = primary.customProps?.mountingElevationM ?? 1.55;
                const elevM = primary.levelElevationM ?? primary.customProps?.levelElevationM ?? 0;
                if (isWallMounted) {
                  return (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono flex items-center gap-1">
                      Wall Eye-Level (+{mountM.toFixed(2)}m AFF)
                    </span>
                  );
                }
                if (elevM < 0) {
                  return (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono flex items-center gap-1">
                      <TrendingDown className="w-2.5 h-2.5" />
                      Dug Pit ({elevM.toFixed(1)}m)
                    </span>
                  );
                } else if (elevM > 0) {
                  return (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      Elevated (+{elevM.toFixed(1)}m)
                    </span>
                  );
                }
                return (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    Grade (0.0m)
                  </span>
                );
              })()}
            </div>

            {/* Wall Mounted Clarification Info */}
            {(primary.customProps?.isWallMounted ||
              primary.customProps?.mounting === 'wall' ||
              primary.stencilId === 'acpdb-wall' ||
              primary.stencilId === 'ecb' ||
              primary.stencilId === 'ats') && (
              <div className="text-[9px] text-emerald-200/90 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/40 flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">✔</span>
                <span>
                  <strong>Wall-Mounted Unit:</strong> Mounted at ergonomic people eye-view height (<strong>+{(primary.customProps?.mountingElevationM ?? 1.55).toFixed(2)}m AFF</strong> above ground). Adjust the terrain level below only if the wall or terrain grade itself sits on an elevated terrace or in an excavation trench.
                </span>
              </div>
            )}

            {/* Quick Level Presets: Dug Excavations & Elevated Terraces */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-sky-400" />
                  Dig Pit / Trench
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Sunken Grade</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[-1.5, -1.0, -0.5, -0.2].map((mVal) => {
                  const currentM = primary.levelElevationM ?? primary.customProps?.levelElevationM ?? 0;
                  const active = Math.abs(currentM - mVal) < 0.05;
                  return (
                    <button
                      key={mVal}
                      type="button"
                      onClick={() =>
                        onUpdateSelected({
                          levelElevationM: mVal,
                          customProps: { ...(primary.customProps || {}), levelElevationM: mVal },
                        })
                      }
                      className={`py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                        active
                          ? 'bg-sky-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-900/40'
                      }`}
                    >
                      {mVal.toFixed(1)}m
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  Elevated Terrace / Plinth
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSelected({
                      levelElevationM: 0,
                      customProps: { ...(primary.customProps || {}), levelElevationM: 0 },
                    })
                  }
                  className="text-[9px] px-1.5 py-0.2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer"
                  title="Reset to 0.0m Grade Level"
                >
                  Reset 0.0m
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[0.3, 0.5, 0.8, 1.5].map((mVal) => {
                  const currentM = primary.levelElevationM ?? primary.customProps?.levelElevationM ?? 0;
                  const active = Math.abs(currentM - mVal) < 0.05;
                  return (
                    <button
                      key={mVal}
                      type="button"
                      onClick={() =>
                        onUpdateSelected({
                          levelElevationM: mVal,
                          customProps: { ...(primary.customProps || {}), levelElevationM: mVal },
                        })
                      }
                      className={`py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                        active
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-900/40'
                      }`}
                    >
                      +{mVal.toFixed(1)}m
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider & Numeric Input for Fine Level Elevation */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                <span>Elevation Level (Depth / Height)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="-5.0"
                    max="5.0"
                    value={((primary.levelElevationM ?? primary.customProps?.levelElevationM ?? 0)).toFixed(1)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        onUpdateSelected({
                          levelElevationM: val,
                          customProps: { ...(primary.customProps || {}), levelElevationM: val },
                        });
                      }
                    }}
                    className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] font-mono text-slate-400">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={primary.levelElevationM ?? primary.customProps?.levelElevationM ?? 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSelected({
                    levelElevationM: val,
                    customProps: { ...(primary.customProps || {}), levelElevationM: val },
                  });
                }}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-0.5">
                <span>-3.0m (Deep Pit)</span>
                <span>0.0m (Grade)</span>
                <span>+3.0m (High Terrace)</span>
              </div>
            </div>

            {/* Holding Foundation / Division Retaining Border Material */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                <span className="font-semibold text-slate-200">Holding Foundation / Division</span>
                <span className="font-mono text-amber-400 uppercase text-[9px]">
                  {primary.foundationRetainingMaterial || primary.customProps?.foundationRetainingMaterial || 'concrete'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    id: 'concrete' as const,
                    name: 'Concrete',
                    desc: 'Reinforced Grade Beam / Retaining Wall',
                    color: 'text-slate-200',
                  },
                  {
                    id: 'metal' as const,
                    name: 'Metal',
                    desc: 'Galvanized Sheet Piling / Steel Divider',
                    color: 'text-sky-300',
                  },
                  {
                    id: 'gravel' as const,
                    name: 'Gravel',
                    desc: 'Crushed Rock Aggregate Embankment',
                    color: 'text-amber-200',
                  },
                  {
                    id: 'earth' as const,
                    name: 'Earth',
                    desc: 'Compacted Soil Berm / Ground Division',
                    color: 'text-emerald-300',
                  },
                ].map((mat) => {
                  const currentMat = primary.foundationRetainingMaterial || primary.customProps?.foundationRetainingMaterial || 'concrete';
                  const active = currentMat === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() =>
                        onUpdateSelected({
                          foundationRetainingMaterial: mat.id,
                          customProps: {
                            ...(primary.customProps || {}),
                            foundationRetainingMaterial: mat.id,
                          },
                        })
                      }
                      className={`p-2 text-left rounded-lg transition-all cursor-pointer border ${
                        active
                          ? 'bg-amber-600/30 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${active ? 'text-amber-300' : mat.color}`}>
                          {mat.name}
                        </span>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </div>
                      <span className="text-[8px] text-slate-500 block leading-tight mt-0.5 line-clamp-1">
                        {mat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seamless Side-by-Side Auto-Merge info & Merge Action */}
            <div className="pt-1.5 border-t border-slate-800/80">
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[9px] text-amber-200/90 leading-relaxed flex items-start gap-1.5 mb-2">
                <span className="text-amber-400 font-bold shrink-0">✔</span>
                <span>
                  <strong>Side-by-Side Seamless Merge:</strong> When excavated areas are placed next to each other, they merge seamlessly into one unified pit without any cement division on the merge side.
                </span>
              </div>

              {onMergeExcavatedAreas && (
                <button
                  type="button"
                  onClick={() => onMergeExcavatedAreas()}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  title="Combine selected excavated pits into a single continuous excavation zone"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Merge Excavated Areas</span>
                </button>
              )}
            </div>
          </div>

    </>
  );
};
