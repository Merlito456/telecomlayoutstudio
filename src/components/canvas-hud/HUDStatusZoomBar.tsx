import React from 'react';
import { HardDrive, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface HUDStatusZoomBarProps {
  totalObjects: number;
  clipboardCount: number;
  storageKB: number;
  zoom: number;
  onFitToScreen: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const HUDStatusZoomBar: React.FC<HUDStatusZoomBarProps> = ({
  totalObjects,
  clipboardCount,
  storageKB,
  zoom,
  onFitToScreen,
  onZoomIn,
  onZoomOut,
}) => {
  // Total objects color coding: green (<50), amber (50-200), red (>200)
  let countBadgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
  if (totalObjects >= 200) {
    countBadgeColor = 'bg-rose-950/80 text-rose-400 border-rose-800/60';
  } else if (totalObjects >= 50) {
    countBadgeColor = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
  }

  return (
    <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md">
      {/* Clipboard Count Badge */}
      {clipboardCount > 0 && (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60">
          📋 {clipboardCount} copied
        </span>
      )}

      {/* Object Count Chip */}
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${countBadgeColor}`}
        title="Total objects on canvas"
      >
        {totalObjects} {totalObjects === 1 ? 'obj' : 'objs'}
      </span>

      {/* Storage status in KB */}
      <span
        className="flex items-center gap-1 text-[10px] font-mono text-slate-400 pl-1"
        title="Session auto-saved to localStorage"
      >
        <HardDrive className="w-3 h-3 text-slate-500" />
        {storageKB} KB
      </span>

      <div className="h-3 w-px bg-slate-800 mx-1" />

      {/* Zoom In, Out, %, and Fit */}
      <div className="flex items-center gap-1">
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            title="Zoom Out (Ctrl + Scroll Down / -)"
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        )}

        <span className="font-mono text-sky-400 font-medium text-[11px] min-w-[38px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        {onZoomIn && (
          <button
            onClick={onZoomIn}
            title="Zoom In (Ctrl + Scroll Up / +)"
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={onFitToScreen}
          title="Fit to screen [F / Ctrl+0]"
          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
