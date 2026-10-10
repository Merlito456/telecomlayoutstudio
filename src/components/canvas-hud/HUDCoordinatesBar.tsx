import React from 'react';
import { Crosshair } from 'lucide-react';
import { ProjectSettings, SnapResult } from '../../types/cad';

interface HUDCoordinatesBarProps {
  cursorPos: { x: number; y: number } | null;
  snapInfo: SnapResult | null;
  settings: ProjectSettings;
}

export const HUDCoordinatesBar: React.FC<HUDCoordinatesBarProps> = ({
  cursorPos,
  snapInfo,
  settings,
}) => {
  const cursorMetersX = cursorPos
    ? (cursorPos.x / settings.scaleFactor).toFixed(2)
    : '0.00';
  const cursorMetersY = cursorPos
    ? (cursorPos.y / settings.scaleFactor).toFixed(2)
    : '0.00';

  return (
    <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md text-slate-300 font-mono text-[11px]">
      <Crosshair className="w-3.5 h-3.5 text-sky-400" />
      <div className="flex items-center gap-3">
        <span>
          X: <strong className="text-white">{cursorMetersX}</strong> {settings.unit}
          <span className="text-slate-500 text-[10px] ml-1">
            ({cursorPos ? Math.round(cursorPos.x) : 0}px)
          </span>
        </span>
        <span className="text-slate-700">|</span>
        <span>
          Y: <strong className="text-white">{cursorMetersY}</strong> {settings.unit}
          <span className="text-slate-500 text-[10px] ml-1">
            ({cursorPos ? Math.round(cursorPos.y) : 0}px)
          </span>
        </span>
      </div>

      {snapInfo?.snapped && (
        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-sky-950 text-sky-300 border border-sky-800/80 animate-pulse">
          SNAP {snapInfo.snapType?.toUpperCase()}
        </span>
      )}
    </div>
  );
};
