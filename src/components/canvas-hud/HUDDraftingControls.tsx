import React from 'react';
import { Tag, BoxSelect, Ban, Box, Camera, Compass, Type, DoorOpen, DoorClosed, Zap } from 'lucide-react';
import { ProjectSettings } from '../../types/cad';

interface HUDDraftingControlsProps {
  settings: ProjectSettings;
  onToggleMeasurements?: () => void;
  onToggleObjectLabels?: () => void;
  onToggleSelectionBoxStyle?: () => void;
  onCancelAction?: () => void;
  onToggle3D?: () => void;
  onToggleRenderStyle?: () => void;
  onToggleDoors?: () => void;
  areDoorsOpen?: boolean;
  onOpenCableSchedule?: () => void;
}

export const HUDDraftingControls: React.FC<HUDDraftingControlsProps> = ({
  settings,
  onToggleMeasurements,
  onToggleObjectLabels,
  onToggleSelectionBoxStyle,
  onCancelAction,
  onToggle3D,
  onToggleRenderStyle,
  onToggleDoors,
  areDoorsOpen = false,
  onOpenCableSchedule,
}) => {
  return (
    <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md text-[11px] text-slate-400">
      <span>
        Scale: <strong className="text-sky-300 font-mono">1 {settings.unit} = {settings.scaleFactor}px</strong>
      </span>

      {settings.orthoMode && (
        <>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ORTHO
          </span>
        </>
      )}

      <span className="text-slate-700">|</span>

      {/* Live Measurement Labels Toggle */}
      <button
        onClick={onToggleMeasurements}
        title="Toggle Live Measurement Labels on all Shapes & Stencils"
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
          settings.showMeasurements
            ? 'bg-sky-950/80 text-sky-300 border-sky-700/80 shadow-sm'
            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
        }`}
      >
        <Tag className="w-3 h-3" />
        <span>Dims: {settings.showMeasurements ? 'ON' : 'OFF'}</span>
      </button>

      {/* Object Stencil Labels Toggle */}
      {onToggleObjectLabels && (
        <button
          onClick={onToggleObjectLabels}
          title="Toggle Object Stencil Labels & Badges [L]"
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
            settings.showObjectLabels !== false
              ? 'bg-sky-950/80 text-sky-300 border-sky-700/80 shadow-sm'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
          }`}
        >
          <Type className="w-3 h-3" />
          <span>Labels: {settings.showObjectLabels !== false ? 'ON' : 'OFF'}</span>
        </button>
      )}

      {/* Auto Cable Schedule & Lengths Calculator */}
      {onOpenCableSchedule && (
        <button
          onClick={onOpenCableSchedule}
          title="Site Cable Schedule & Automatic Lengths Calculator (Calculate DC, AC, Fiber, Grounding runs automatically)"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-600/60 hover:border-amber-400 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <Zap className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Auto Cables</span>
        </button>
      )}

      {/* Selection Box Minimized Indicator & Toggle */}
      <button
        onClick={onToggleSelectionBoxStyle}
        title="Object Selection Box Style (Click to toggle None/Corners/Box)"
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
          settings.selectionBoxStyle === 'none'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
            : settings.selectionBoxStyle === 'corners'
            ? 'bg-sky-950/80 text-sky-300 border-sky-700/80'
            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
        }`}
      >
        <BoxSelect className="w-3 h-3" />
        <span>
          Box: {settings.selectionBoxStyle === 'none' ? 'None (minimized)' : settings.selectionBoxStyle === 'corners' ? 'Corners' : 'Full'}
        </span>
      </button>

      {/* Mode Quick Toggle: 2D CAD Symbols vs Photo Mode */}
      {onToggleRenderStyle && (
        <button
          onClick={onToggleRenderStyle}
          title={
            settings.renderStyle === 'photo'
              ? 'Currently in Photo Mode (2D Photorealistic). Click to switch to Standard 2D Structural Engineering Symbols.'
              : 'Currently in 2D CAD Mode (Standard Structural Symbols). Click to switch to Photorealistic Photo Mode.'
          }
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer shadow-sm ${
            settings.renderStyle === 'photo'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-400/40'
              : 'bg-sky-950/80 text-sky-300 border-sky-500/60 ring-1 ring-sky-400/40'
          }`}
        >
          {settings.renderStyle === 'photo' ? (
            <>
              <Camera className="w-3 h-3 text-emerald-400" />
              <span>Photo Mode</span>
            </>
          ) : (
            <>
              <Compass className="w-3 h-3 text-sky-400" />
              <span>2D CAD</span>
            </>
          )}
        </button>
      )}

      {/* 3D Photorealistic View Quick Switch */}
      {onToggle3D && (
        <button
          onClick={onToggle3D}
          title="Launch 3D Photorealistic Studio View [Press 3]"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-sky-600/30 to-indigo-600/30 text-sky-300 border border-sky-500/40 hover:border-sky-400 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <Box className="w-3 h-3 text-sky-400" />
          <span>3D Studio</span>
        </button>
      )}

      {/* Doors & Gates Interactive Toggle [Key Z] */}
      {onToggleDoors && (
        <button
          onClick={onToggleDoors}
          title="Interactive Door Control: Select/hover over a door to toggle [Key Z], or walk up to doors in 3D Studio"
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer shadow-sm ${
            areDoorsOpen
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-400/40'
              : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-500'
          }`}
        >
          {areDoorsOpen ? <DoorOpen className="w-3 h-3 text-emerald-400" /> : <DoorClosed className="w-3 h-3 text-slate-400" />}
          <span>Door [Z]</span>
        </button>
      )}

      <span className="text-slate-700">|</span>

      {/* Mouse 2 Cancel Hint */}
      <button
        onClick={onCancelAction}
        title="Click or Right-Click anywhere to cancel active tool/drawing"
        className="flex items-center gap-1 text-[10px] text-amber-300/90 hover:text-amber-200 cursor-pointer bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded"
      >
        <Ban className="w-3 h-3 text-amber-400" />
        <span>Mouse 2 = Cancel</span>
      </button>
    </div>
  );
};
