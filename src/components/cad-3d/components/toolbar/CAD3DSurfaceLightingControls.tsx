import React from 'react';
import { Mountain, Sun, Sunset, Moon, CloudSun, Compass } from 'lucide-react';
import { LightingPreset, SiteSurfaceType } from '../../types';

interface CAD3DSurfaceLightingControlsProps {
  surfaceType: SiteSurfaceType;
  setSurfaceType: (type: SiteSurfaceType) => void;
  lightingPreset: LightingPreset;
  handleLightingChange: (preset: LightingPreset) => void;
  showSky: boolean;
  handleToggleSky: () => void;
  isRoamMode: boolean;
  handleToggleRoamMode: (enabled?: boolean) => void;
}

export const CAD3DSurfaceLightingControls: React.FC<CAD3DSurfaceLightingControlsProps> = ({
  surfaceType,
  setSurfaceType,
  lightingPreset,
  handleLightingChange,
  showSky,
  handleToggleSky,
  isRoamMode,
  handleToggleRoamMode,
}) => {
  return (
    <>
      {/* 3D Site Surface Ground Selector */}
      <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
        <span className="hidden xl:flex items-center gap-1 pl-2 pr-1 text-[11px] text-slate-400 font-medium">
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>Surface:</span>
        </span>
        <button
          type="button"
          onClick={() => setSurfaceType('gravel')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
            surfaceType === 'gravel'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Crushed Stone Gravel Yard"
        >
          🪨 Gravel
        </button>
        <button
          type="button"
          onClick={() => setSurfaceType('grass')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
            surfaceType === 'grass'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Natural Green Grass Lawn"
        >
          🌱 Grass
        </button>
        <button
          type="button"
          onClick={() => setSurfaceType('asphalt')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
            surfaceType === 'asphalt'
              ? 'bg-slate-700 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Bitumen Asphalt Pavement"
        >
          🛣️ Road
        </button>
        <button
          type="button"
          onClick={() => setSurfaceType('concrete')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
            surfaceType === 'concrete'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Engineered Concrete Compound Slab"
        >
          🧱 Concrete
        </button>
        <button
          type="button"
          onClick={() => setSurfaceType('dirt')}
          className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
            surfaceType === 'dirt'
              ? 'bg-amber-800 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Compacted Earth / Red Clay Ground"
        >
          🏜️ Earth
        </button>
      </div>

      {/* Lighting Environment Selector */}
      <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => handleLightingChange('daylight')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
            lightingPreset === 'daylight'
              ? 'bg-sky-500 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Sunny Daylight (Crisp sky & directional sunlight)"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Day</span>
        </button>
        <button
          type="button"
          onClick={() => handleLightingChange('sunset')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
            lightingPreset === 'sunset'
              ? 'bg-amber-500 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Golden Hour Sunset (Warm cinematic low-angle sun)"
        >
          <Sunset className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sunset</span>
        </button>
        <button
          type="button"
          onClick={() => handleLightingChange('night')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
            lightingPreset === 'night'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Night Operations (Site security floodlights & beacon)"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Night</span>
        </button>
      </div>

      {/* Realistic Sky & Clouds Toggle */}
      <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
        <button
          type="button"
          onClick={handleToggleSky}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all ${
            showSky
              ? 'bg-sky-600/30 border border-sky-400/60 text-sky-200 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Toggle Photorealistic Sky, Realistic Animated Clouds & Glowing Sun [Press K]"
        >
          <CloudSun className={`w-3.5 h-3.5 ${showSky ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>{showSky ? 'Sky: ON' : 'Sky: OFF'}</span>
        </button>
      </div>

      {/* Roam 3D Mode Toggle */}
      <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => handleToggleRoamMode()}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all ${
            isRoamMode
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          title="Roam 3D Mode: WASD to move, Mouse to look around, E to climb up, R to climb down [Press G]"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{isRoamMode ? 'Roam: ON' : 'Roam'}</span>
        </button>
      </div>
    </>
  );
};
