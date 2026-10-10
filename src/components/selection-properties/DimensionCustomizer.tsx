import React from "react";
import { CADObject } from "../../types/cad";

interface DimensionCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const DimensionCustomizer: React.FC<DimensionCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  if (!primary || !primary.type?.startsWith("dim-")) return null;
  return (
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 space-y-3">
              <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider block">
                Standard Drafting Dimension
              </span>

              {/* FROM Feature */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                  FROM Feature / Station
                </label>
                <input
                  type="text"
                  value={primary.fromLabel || ''}
                  onChange={(e) => onUpdateSelected({ fromLabel: e.target.value })}
                  placeholder="e.g. Shelter Wall, Tower NW Leg..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-sky-200 font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* TO Feature */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                  TO Feature / Station
                </label>
                <input
                  type="text"
                  value={primary.toLabel || ''}
                  onChange={(e) => onUpdateSelected({ toLabel: e.target.value })}
                  placeholder="e.g. Boundary Fence, Tower NE Leg..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-sky-200 font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Quick Drafting Presets */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { from: 'Shelter Wall', to: 'Tower Leg' },
                  { from: 'Generator (Green)', to: 'Fuel Tank' },
                  { from: 'ODC Cabinet', to: 'Battery Bank' },
                  { from: 'Gate Pier', to: 'Fence Post' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateSelected({ fromLabel: preset.from, toLabel: preset.to })}
                    className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 rounded cursor-pointer transition-colors"
                  >
                    {preset.from} ➔ {preset.to}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Witness Line Offset</span>
                  <span className="font-mono text-sky-300">{primary.dimOffset ?? -30} px</span>
                </div>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="5"
                  value={primary.dimOffset ?? -30}
                  onChange={(e) => onUpdateSelected({ dimOffset: parseInt(e.target.value) })}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
  );
};
