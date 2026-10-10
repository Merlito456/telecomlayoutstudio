/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewportState } from '../../types/cad';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface ZoomToolbarProps {
  viewport: ViewportState;
  onUpdateViewport: (partial: Partial<ViewportState>) => void;
  onFitToScreen: () => void;
}

export const ZoomToolbar: React.FC<ZoomToolbarProps> = ({
  viewport,
  onUpdateViewport,
  onFitToScreen,
}) => {
  const zoomPercent = Math.round(viewport.zoom * 100);

  const handleZoomIn = () => {
    onUpdateViewport({ zoom: Math.min(10, viewport.zoom * 1.25) });
  };

  const handleZoomOut = () => {
    onUpdateViewport({ zoom: Math.max(0.1, viewport.zoom / 1.25) });
  };

  const handleResetZoom = () => {
    onUpdateViewport({ zoom: 1 });
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-900/80 px-1 py-0.5 rounded-lg border border-slate-800">
      <button
        onClick={handleZoomOut}
        title="Zoom Out"
        className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleResetZoom}
        title="Reset Zoom to 100%"
        className="px-1.5 py-0.5 text-xs font-mono font-medium text-sky-400 hover:bg-slate-800 rounded cursor-pointer"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={handleZoomIn}
        title="Zoom In"
        className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onFitToScreen}
        title="Fit to Screen [F]"
        className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
