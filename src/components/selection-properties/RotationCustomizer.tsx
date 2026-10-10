import React from "react";
import { CADObject } from "../../types/cad";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

interface RotationCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  onRotateSelected?: (deltaDegrees: number) => void;
  onFlipSelected?: (axis: "h" | "v") => void;
}

export const RotationCustomizer: React.FC<RotationCustomizerProps> = ({
  primary,
  onUpdateSelected,
  onRotateSelected,
  onFlipSelected,
}) => {
  if (!primary) return null;
  return (
    <div className="space-y-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-sky-400" />
          Rotation &amp; Orientation
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={Math.round(primary.rotation || 0)}
            onChange={(e) => {
              const r = parseInt(e.target.value) || 0;
              onUpdateSelected({ rotation: r });
            }}
            className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-right font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500"
          />
          <span className="text-[10px] text-slate-400 font-mono">°</span>
          <button
            type="button"
            onClick={() => onUpdateSelected({ rotation: 0 })}
            title="Reset to 0°"
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-mono cursor-pointer ml-1"
          >
            0°
          </button>
        </div>
      </div>

      {/* Quick 90° and 45° Rotate Action Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (onRotateSelected) onRotateSelected(-90);
            else {
              const next = ((primary.rotation || 0) - 90 + 360) % 360;
              onUpdateSelected({ rotation: next > 180 ? next - 360 : next });
            }
          }}
          className="py-1.5 px-2 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all cursor-pointer shadow-sm border border-slate-700/60"
          title="Rotate 90° Counter-Clockwise [Shift+R]"
        >
          <RotateCcw className="w-3 h-3 text-sky-400" />
          <span>-90°</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onRotateSelected) onRotateSelected(90);
            else {
              const next = ((primary.rotation || 0) + 90) % 360;
              onUpdateSelected({ rotation: next > 180 ? next - 360 : next });
            }
          }}
          className="py-1.5 px-2 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all cursor-pointer shadow-sm border border-slate-700/60"
          title="Rotate 90° Clockwise [R]"
        >
          <RotateCw className="w-3 h-3 text-sky-400" />
          <span>+90°</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onRotateSelected) onRotateSelected(45);
            else {
              const next = ((primary.rotation || 0) + 45) % 360;
              onUpdateSelected({ rotation: next > 180 ? next - 360 : next });
            }
          }}
          className="py-1.5 px-2 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all cursor-pointer shadow-sm border border-slate-700/60"
          title="Rotate 45° Clockwise"
        >
          <RotateCw className="w-3 h-3 text-sky-400" />
          <span>+45°</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onRotateSelected) onRotateSelected(180);
            else {
              const next = ((primary.rotation || 0) + 180) % 360;
              onUpdateSelected({ rotation: next > 180 ? next - 360 : next });
            }
          }}
          className="py-1.5 px-2 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px] transition-all cursor-pointer shadow-sm border border-slate-700/60"
          title="180° Reverse Flip"
        >
          <span>180°</span>
        </button>
      </div>

      {/* Flip Horizontal & Flip Vertical */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (onFlipSelected) onFlipSelected("h");
            else {
              const cur = primary.rotation || 0;
              onUpdateSelected({ rotation: -cur });
            }
          }}
          className="py-1.5 px-2 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg flex items-center justify-center gap-1.5 font-medium text-[10px] transition-all cursor-pointer border border-slate-700/60"
          title="Flip Horizontal along Y axis"
        >
          <FlipHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Flip Horiz</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onFlipSelected) onFlipSelected("v");
            else {
              const cur = primary.rotation || 0;
              const next = (180 - cur) % 360;
              onUpdateSelected({ rotation: next > 180 ? next - 360 : next });
            }
          }}
          className="py-1.5 px-2 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg flex items-center justify-center gap-1.5 font-medium text-[10px] transition-all cursor-pointer border border-slate-700/60"
          title="Flip Vertical along X axis"
        >
          <FlipVertical className="w-3.5 h-3.5 text-indigo-400" />
          <span>Flip Vert</span>
        </button>
      </div>

      {/* Cardinal Angle Quick Snaps */}
      <div className="flex items-center justify-between gap-1 pt-0.5">
        {[0, 45, 90, 135, 180, 270].map((deg) => {
          const curNorm = (((primary.rotation || 0) % 360) + 360) % 360;
          const isCurrent = curNorm === deg;
          return (
            <button
              key={deg}
              type="button"
              onClick={() => {
                const finalDeg = deg > 180 ? deg - 360 : deg;
                onUpdateSelected({ rotation: finalDeg });
              }}
              className={`flex-1 py-1 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-sky-500 text-white font-bold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {deg}°
            </button>
          );
        })}
      </div>

      {/* Continuous Smooth Slider */}
      <div>
        <div className="flex justify-between text-[9px] text-slate-500 mb-1">
          <span>-180°</span>
          <span className="font-mono text-sky-400">{Math.round(primary.rotation || 0)}°</span>
          <span>+180°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={primary.rotation || 0}
          onChange={(e) => onUpdateSelected({ rotation: parseInt(e.target.value) })}
          className="w-full accent-sky-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
