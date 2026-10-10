/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Sparkles } from 'lucide-react';
import { CameraPreset, LightingPreset, SiteSurfaceType } from '../types';
import { CAD3DSurfaceLightingControls } from './toolbar/CAD3DSurfaceLightingControls';
import { CAD3DCameraPresetsControls } from './toolbar/CAD3DCameraPresetsControls';
import { CAD3DInspectionControls } from './toolbar/CAD3DInspectionControls';

export interface CAD3DToolbarProps {
  surfaceType: SiteSurfaceType;
  setSurfaceType: (type: SiteSurfaceType) => void;
  lightingPreset: LightingPreset;
  handleLightingChange: (preset: LightingPreset) => void;
  showSky: boolean;
  handleToggleSky: () => void;
  isRoamMode: boolean;
  handleToggleRoamMode: (enabled?: boolean) => void;
  cameraPreset: CameraPreset;
  applyCameraPreset: (preset: CameraPreset) => void;
  handleTiltUp: () => void;
  handleTiltDown: () => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean | ((prev: boolean) => boolean)) => void;
  showDimensions: boolean;
  setShowDimensions: (v: boolean | ((prev: boolean) => boolean)) => void;
  showObjectLabels: boolean;
  setShowObjectLabels: (v: boolean | ((prev: boolean) => boolean)) => void;
  focusedDoorPrompt: {
    id: string;
    name: string;
    isOpen: boolean;
    distMeters: number;
  } | null;
  handleInteractWithDoor: () => void;
  cabinRoofCutaway: boolean;
  setCabinRoofCutaway: (v: boolean | ((prev: boolean) => boolean)) => void;
  cableToolMode?: 'none' | 'lay' | 'delete';
  setCableToolMode?: (mode: 'none' | 'lay' | 'delete' | ((prev: 'none' | 'lay' | 'delete') => 'none' | 'lay' | 'delete')) => void;
  wireframe: boolean;
  setWireframe: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleExportSnapshot: () => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean | ((prev: boolean) => boolean)) => void;
  onClose: () => void;
}

export const CAD3DToolbar: React.FC<CAD3DToolbarProps> = ({
  surfaceType,
  setSurfaceType,
  lightingPreset,
  handleLightingChange,
  showSky,
  handleToggleSky,
  isRoamMode,
  handleToggleRoamMode,
  cameraPreset,
  applyCameraPreset,
  handleTiltUp,
  handleTiltDown,
  autoRotate,
  setAutoRotate,
  showDimensions,
  setShowDimensions,
  showObjectLabels,
  setShowObjectLabels,
  focusedDoorPrompt,
  handleInteractWithDoor,
  cabinRoofCutaway,
  setCabinRoofCutaway,
  cableToolMode,
  setCableToolMode,
  wireframe,
  setWireframe,
  handleExportSnapshot,
  isFullscreen,
  setIsFullscreen,
  onClose,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 z-10">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
          <Box className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide">
              3D Photorealistic Site Studio
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Ray-Soft Shadows
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Site Surface 3D Render • Outside Environment (Road, Cars, Sidewalk, Houses, Trees, Flowers, Canals, Person) • 3D CAD
          </p>
        </div>
      </div>

      {/* Quick Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <CAD3DSurfaceLightingControls
          surfaceType={surfaceType}
          setSurfaceType={setSurfaceType}
          lightingPreset={lightingPreset}
          handleLightingChange={handleLightingChange}
          showSky={showSky}
          handleToggleSky={handleToggleSky}
          isRoamMode={isRoamMode}
          handleToggleRoamMode={handleToggleRoamMode}
        />

        <CAD3DCameraPresetsControls
          isRoamMode={isRoamMode}
          cameraPreset={cameraPreset}
          applyCameraPreset={applyCameraPreset}
          handleTiltUp={handleTiltUp}
          handleTiltDown={handleTiltDown}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
        />

        <CAD3DInspectionControls
          showDimensions={showDimensions}
          setShowDimensions={setShowDimensions}
          showObjectLabels={showObjectLabels}
          setShowObjectLabels={setShowObjectLabels}
          focusedDoorPrompt={focusedDoorPrompt}
          handleInteractWithDoor={handleInteractWithDoor}
          cabinRoofCutaway={cabinRoofCutaway}
          setCabinRoofCutaway={setCabinRoofCutaway}
          cableToolMode={cableToolMode}
          setCableToolMode={setCableToolMode}
          wireframe={wireframe}
          setWireframe={setWireframe}
          handleExportSnapshot={handleExportSnapshot}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          onClose={onClose}
        />
      </div>
    </header>
  );
};
