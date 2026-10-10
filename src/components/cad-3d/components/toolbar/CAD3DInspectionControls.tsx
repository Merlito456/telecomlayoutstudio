import React from 'react';
import { Tag, DoorOpen, DoorClosed, Home, Layers, Download, Maximize2, Minimize2, X, Cable } from 'lucide-react';

interface CAD3DInspectionControlsProps {
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

export const CAD3DInspectionControls: React.FC<CAD3DInspectionControlsProps> = ({
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
    <>
      {/* 3D Dimensions Toggle */}
      <button
        type="button"
        onClick={() => setShowDimensions((prev: boolean) => !prev)}
        className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border cursor-pointer transition-all ${
          showDimensions
            ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title="Toggle 3D Drafting Dimensions & FROM/TO Tags"
      >
        <Tag className="w-3.5 h-3.5" />
        <span className="hidden md:inline">3D Dims</span>
      </button>

      {/* 3D Object Labels Toggle */}
      <button
        type="button"
        onClick={() => setShowObjectLabels((prev: boolean) => !prev)}
        className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border cursor-pointer transition-all ${
          showObjectLabels
            ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title="Toggle 3D Object Stencil Labels"
      >
        <Tag className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Labels</span>
      </button>

      {/* Doors & Gates Interactive Toggle [Key Z] */}
      <button
        type="button"
        onClick={handleInteractWithDoor}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border cursor-pointer transition-all ${
          focusedDoorPrompt
            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-md ring-1 ring-emerald-500/50'
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title={
          focusedDoorPrompt
            ? `[Key Z] ${focusedDoorPrompt.isOpen ? 'Close' : 'Open'} ${focusedDoorPrompt.name} (${focusedDoorPrompt.distMeters}m away)`
            : 'Interact with door [Key Z] — only opens the door you are viewing when right at it'
        }
      >
        {focusedDoorPrompt ? (
          focusedDoorPrompt.isOpen ? (
            <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <DoorClosed className="w-3.5 h-3.5 text-emerald-300" />
          )
        ) : (
          <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>
          {focusedDoorPrompt
            ? `[Z] ${focusedDoorPrompt.isOpen ? 'Close' : 'Open'} ${focusedDoorPrompt.name} (${focusedDoorPrompt.distMeters}m)`
            : 'Door [Z]: Approach door'}
        </span>
      </button>

      {/* 3D Cabling Tool Toggle [Key C] */}
      {setCableToolMode && (
        <button
          type="button"
          onClick={() => setCableToolMode((prev) => (prev === 'lay' ? 'none' : 'lay'))}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border cursor-pointer transition-all ${
            cableToolMode === 'lay'
              ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md shadow-sky-500/30'
              : 'bg-slate-950 border-slate-800 text-sky-400 hover:text-sky-300'
          }`}
          title="Toggle 3D Cable Laying Mode [Press Key C]"
        >
          <Cable className="w-3.5 h-3.5" />
          <span>Cable [C]</span>
        </button>
      )}

      {/* Cabin Roof Cutaway / Interior Inspection Toggle [Key T] */}
      <button
        type="button"
        onClick={() => setCabinRoofCutaway((prev: boolean) => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border cursor-pointer transition-all ${
          cabinRoofCutaway
            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm'
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title="Toggle Cabin Roof Cutaway to Inspect Inside of Cabin from Above [Press Key T or U]"
      >
        <Home className="w-3.5 h-3.5 text-amber-400" />
        <span>Cabin Roof [T]: {cabinRoofCutaway ? 'CUTAWAY' : 'SOLID'}</span>
      </button>

      {/* Wireframe Toggle */}
      <button
        type="button"
        onClick={() => setWireframe((prev: boolean) => !prev)}
        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
          wireframe
            ? 'bg-sky-500/20 border-sky-500 text-sky-300'
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title="Toggle Wireframe CAD Mesh"
      >
        <Layers className="w-4 h-4" />
      </button>

      {/* Download 3D Render Snapshot */}
      <button
        type="button"
        onClick={handleExportSnapshot}
        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
        title="Export High-Resolution 3D PNG Render"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Snapshot</span>
      </button>

      {/* Fullscreen Toggle */}
      <button
        type="button"
        onClick={() => setIsFullscreen((prev: boolean) => !prev)}
        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
        title="Toggle Fullscreen (Hides menus, remains key instructions) [Key F]"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Close / Return to 2D CAD */}
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors ml-1"
        title="Return to 2D Plan [Esc]"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">2D Plan</span>
      </button>
    </>
  );
};
