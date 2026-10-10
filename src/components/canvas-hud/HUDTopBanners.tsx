import React from 'react';
import { RotateCw } from 'lucide-react';

interface HUDTopBannersProps {
  armedStencilName?: string;
  armedRotation?: number;
  onRotateArmed?: () => void;
  onCancelArmedStencil?: () => void;
  onPlaceArmedAtCenter?: () => void;
  connectedLineActive?: boolean;
  onDisconnectLine?: () => void;
  isPolylineActive?: boolean;
  polylinePointsCount?: number;
  onFinishPolyline?: () => void;
  onCancelAction?: () => void;
}

export const HUDTopBanners: React.FC<HUDTopBannersProps> = ({
  armedStencilName,
  armedRotation = 0,
  onRotateArmed,
  onCancelArmedStencil,
  onPlaceArmedAtCenter,
  connectedLineActive,
  onDisconnectLine,
  isPolylineActive,
  polylinePointsCount = 0,
  onFinishPolyline,
  onCancelAction,
}) => {
  return (
    <>
      {/* Top Banner when a stencil is armed */}
      {armedStencilName && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200 border border-sky-300/30">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>
            Armed: <strong className="font-bold underline">{armedStencilName}</strong> — Click canvas to place
          </span>
          {onPlaceArmedAtCenter && (
            <button
              type="button"
              onClick={onPlaceArmedAtCenter}
              title="Immediately place stencil in center of canvas"
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md"
            >
              + Place at Center
            </button>
          )}
          {onRotateArmed && (
            <button
              type="button"
              onClick={onRotateArmed}
              title="Rotate Stencil 90° [R]"
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-white/30"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate [R]: {armedRotation}°</span>
            </button>
          )}
          <button
            onClick={onCancelArmedStencil}
            className="px-2.5 py-1 bg-black/30 hover:bg-black/50 rounded-full text-[11px] font-mono transition-colors cursor-pointer"
          >
            Esc to Cancel
          </button>
        </div>
      )}

      {/* Top Banner when drawing line connected to previous line */}
      {!armedStencilName && connectedLineActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 text-white px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200 border border-emerald-300/40">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
          </span>
          <span>
            🔗 <strong>Connected to Previous Line</strong> — Click anywhere to change direction
          </span>
          {onDisconnectLine && (
            <button
              onClick={onDisconnectLine}
              title="Disconnect from previous line and start fresh"
              className="px-2 py-0.5 bg-black/40 hover:bg-black/60 rounded-full text-[10px] font-mono transition-colors text-emerald-200 cursor-pointer"
            >
              Esc / Disconnect
            </button>
          )}
        </div>
      )}

      {/* Top Banner when drawing polyline path */}
      {!armedStencilName && !connectedLineActive && isPolylineActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-indigo-700 via-purple-700 to-sky-700 text-white px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200 border border-indigo-300/40">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-200"></span>
          </span>
          <span>
            📐 <strong>Polyline Active</strong> — Click canvas to add vertices ({polylinePointsCount} {polylinePointsCount === 1 ? 'point' : 'points'})
          </span>
          {onFinishPolyline && (
            <button
              type="button"
              onClick={onFinishPolyline}
              title="Finish polyline path and commit to canvas [Enter]"
              className="px-2.5 py-0.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer border border-white/30"
            >
              Finish [Enter]
            </button>
          )}
          {onCancelAction && (
            <button
              type="button"
              onClick={onCancelAction}
              title="Cancel drawing polyline"
              className="px-2 py-0.5 bg-black/40 hover:bg-black/60 rounded-full text-[10px] font-mono transition-colors text-slate-300 cursor-pointer"
            >
              Esc
            </button>
          )}
        </div>
      )}
    </>
  );
};
