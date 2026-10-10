import React from "react";
import { ProjectSettings } from "../../types/cad";

interface CADStandardsCustomizerProps {
  settings: ProjectSettings;
  onUpdateSettings?: (partial: Partial<ProjectSettings>) => void;
}

export const CADStandardsCustomizer: React.FC<CADStandardsCustomizerProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <>
      {/* CAD Drafting Standards & Measurement Labels */}
      {onUpdateSettings && (
        <div className="space-y-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
            CAD Drafting Standards
          </span>

          {/* Show Measurements Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-[11px]">Measurement Labels</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-sky-400">
              <input
                type="checkbox"
                checked={settings.showMeasurements}
                onChange={(e) => onUpdateSettings({ showMeasurements: e.target.checked })}
                className="accent-sky-500 rounded"
              />
              <span>{settings.showMeasurements ? "Active" : "Hidden"}</span>
            </label>
          </div>

          {/* Bounding Box Style */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Object Bounding Box</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "none", label: "None" },
                { id: "corners", label: "Corners" },
                { id: "box", label: "Full Box" },
              ].map((bs) => (
                <button
                  key={bs.id}
                  type="button"
                  onClick={() => onUpdateSettings({ selectionBoxStyle: bs.id as any })}
                  className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-colors cursor-pointer ${
                    (settings.selectionBoxStyle || "none") === bs.id
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {bs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Arrow Style */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Dimension Terminators</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "slash", label: "Slash 45°" },
                { id: "arrow", label: "Arrow ISO" },
                { id: "dot", label: "Datum Dot" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onUpdateSettings({ dimensionArrowStyle: st.id as any })}
                  className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-colors cursor-pointer ${
                    settings.dimensionArrowStyle === st.id
                      ? "bg-sky-500/20 text-sky-300 border-sky-500"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Unit Format */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Standard Dimension Units</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: "m", label: "Meters" },
                { id: "mm", label: "Millimeters" },
                { id: "cm", label: "Centimeters" },
                { id: "ft-in", label: "Feet-Inch" },
              ].map((uf) => (
                <button
                  key={uf.id}
                  type="button"
                  onClick={() => onUpdateSettings({ dimensionUnitFormat: uf.id as any })}
                  className={`py-1 px-1 rounded text-[10px] font-medium border text-center transition-colors cursor-pointer ${
                    settings.dimensionUnitFormat === uf.id
                      ? "bg-sky-500/20 text-sky-300 border-sky-500"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {uf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scale Summary */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] space-y-1">
        <span className="text-slate-400 block font-medium">Drawing Scale:</span>
        <div className="font-mono text-sky-400 font-semibold">
          1 {settings.unit} = {settings.scaleFactor} px
        </div>
        <div className="text-[10px] text-slate-500">
          Canvas boundary: {settings.canvasWidth} × {settings.canvasHeight} px
        </div>
      </div>
    </>
  );
};
