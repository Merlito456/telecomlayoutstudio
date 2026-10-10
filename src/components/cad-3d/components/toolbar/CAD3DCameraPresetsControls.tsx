import React from 'react';
import { RotateCw } from 'lucide-react';
import { CameraPreset } from '../../types';

interface CAD3DCameraPresetsControlsProps {
  isRoamMode: boolean;
  cameraPreset: CameraPreset;
  applyCameraPreset: (preset: CameraPreset) => void;
  handleTiltUp: () => void;
  handleTiltDown: () => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export const CAD3DCameraPresetsControls: React.FC<CAD3DCameraPresetsControlsProps> = ({
  isRoamMode,
  cameraPreset,
  applyCameraPreset,
  handleTiltUp,
  handleTiltDown,
  autoRotate,
  setAutoRotate,
}) => {
  return (
    <>
      {/* Camera Presets */}
      <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => applyCameraPreset('iso')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
            !isRoamMode && cameraPreset === 'iso' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Isometric Bird's Eye View"
        >
          Iso 3D
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('front')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
            !isRoamMode && cameraPreset === 'front' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Front Elevation"
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('side')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
            !isRoamMode && cameraPreset === 'side' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Side Elevation"
        >
          Side
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('walk')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
            !isRoamMode && cameraPreset === 'walk' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Ground Level Human Walking Perspective"
        >
          Ground
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('top')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
            !isRoamMode && cameraPreset === 'top' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Top-Down 3D Orthographic"
        >
          Top
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('upward')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
            !isRoamMode && cameraPreset === 'upward' ? 'bg-sky-600/40 border border-sky-400 text-sky-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Look Upward at Tower, Antennas & Sky from Ground"
        >
          <span>Upward ↗</span>
        </button>
        <div className="h-3.5 w-px bg-slate-800 mx-0.5" />
        <button
          type="button"
          onClick={handleTiltUp}
          className="px-1.5 py-1 text-[10px] font-medium rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 cursor-pointer transition-colors"
          title="Tilt Camera Upward (Look higher towards sky and tower tops)"
        >
          ▲ Up
        </button>
        <button
          type="button"
          onClick={handleTiltDown}
          className="px-1.5 py-1 text-[10px] font-medium rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 cursor-pointer transition-colors"
          title="Tilt Camera Downward (Look towards ground)"
        >
          ▼ Down
        </button>
      </div>

      {/* Turntable Auto-Rotate */}
      <button
        type="button"
        onClick={() => setAutoRotate((prev: boolean) => !prev)}
        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
          autoRotate
            ? 'bg-sky-500/20 border-sky-500 text-sky-300'
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title="Auto-Rotate Showcase Turntable"
      >
        <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
      </button>
    </>
  );
};
