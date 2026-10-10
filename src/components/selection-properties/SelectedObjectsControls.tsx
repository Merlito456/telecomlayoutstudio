import React from 'react';
import { CADLayer, CADObject, ProjectSettings } from '../../types/cad';
import { getObjectLayerId } from '../../utils/cad-layers';
import {
  DimensionCustomizer,
  ShelterCustomizer,
  BasepadCustomizer,
  CableLadderCustomizer,
  CabinetCustomizer,
  ElectricalPanelCustomizer,
  RectifierCustomizer,
  RackCustomizer,
  OLTCustomizer,
  TowerCustomizer,
  GateCustomizer,
  CanopyCustomizer,
  TerrainElevationCustomizer,
  TransformCustomizer,
  RotationCustomizer,
  TextCustomizer,
  StrokeFillCustomizer,
  CableLengthCustomizer,
  AirConditionerCustomizer,
} from './index';
import {
  Layers,
  Trash2,
  Copy,
  CopyPlus,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  Ruler,
  Sparkles,
} from 'lucide-react';

interface SelectedObjectsControlsProps {
  primary: CADObject;
  selectedObjects: CADObject[];
  onUpdateSelected: (updates: Partial<CADObject>, cascadeToChildren?: boolean) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddDimensions?: () => void;
  onRotateSelected?: (deltaDegrees: number) => void;
  onScaleSelected?: (multiplier: number) => void;
  onFlipSelected?: (axis: 'h' | 'v') => void;
  settings: ProjectSettings;
  layers?: CADLayer[];
  activeLayerId?: string;
  onMoveSelectedToLayer?: (layerId: string) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  onMergeExcavatedAreas?: () => void;
  onOpenShelterDesigner?: (shelterObj?: CADObject) => void;
  onOpenRackDesigner?: (rackObj?: CADObject) => void;
  onOpenCableSchedule?: () => void;
  onSaveAllObjects?: (allObjects: CADObject[]) => void;
}

export const SelectedObjectsControls: React.FC<SelectedObjectsControlsProps> = ({
  primary,
  selectedObjects,
  onUpdateSelected,
  onBringToFront,
  onSendToBack,
  onMoveForward,
  onMoveBackward,
  onCopy,
  onDuplicate,
  onDelete,
  onAddDimensions,
  onRotateSelected,
  onScaleSelected,
  onFlipSelected,
  settings,
  layers = [],
  activeLayerId = 'layer-civil',
  onMoveSelectedToLayer,
  allObjects = [],
  onAddToast,
  onMergeExcavatedAreas,
  onOpenShelterDesigner,
  onOpenRackDesigner,
  onOpenCableSchedule,
  onSaveAllObjects,
}) => {
  if (!primary) return null;

  return (
    <div className="p-3.5 space-y-4 text-xs">
      {/* Stretchable Stencil Badge */}
      {primary.isStretchable && (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 flex items-center gap-2 text-[11px]">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold block">Dynamic Stretchable Stencil</span>
            <span className="text-[10px] text-amber-300/80">
              Length extends along X axis preserving internal hatch &amp; thickness.
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions (Copy, Duplicate, Layers, Delete) */}
      <div className="flex items-center justify-between p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            title="Copy [Ctrl+C]"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            title="Duplicate [Ctrl+D]"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <CopyPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Layer Ordering */}
        <div className="flex items-center gap-1">
          <button
            onClick={onBringToFront}
            title="Bring to Front"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveForward}
            title="Move Forward"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveBackward}
            title="Move Backward"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onSendToBack}
            title="Send to Back"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <button
          onClick={onDelete}
          title="Delete Selection [Del]"
          className="p-1.5 hover:bg-rose-950/60 rounded text-rose-400 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layer Assignment */}
      {layers.length > 0 && (
        <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Layer
          </span>
          <select
            value={primary.layerId || getObjectLayerId(primary, activeLayerId)}
            onChange={(e) => {
              const targetLayer = e.target.value;
              if (onMoveSelectedToLayer) onMoveSelectedToLayer(targetLayer);
              else onUpdateSelected({ layerId: targetLayer });
            }}
            className="bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs text-sky-300 font-medium focus:outline-none cursor-pointer max-w-[170px] truncate"
          >
            {layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Add Standard CAD Dimensions Button */}
      {onAddDimensions && !primary.type?.startsWith('dim-') && (
        <button
          onClick={onAddDimensions}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-500/50 text-sky-200 font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Ruler className="w-3.5 h-3.5 text-sky-400" />
          <span>Auto-Add Standard Dimensions</span>
        </button>
      )}

      {/* Dimension Tuning if selected object is a dimension line */}
      <DimensionCustomizer primary={primary} onUpdateSelected={onUpdateSelected} />

      {/* Stencil Customizer: Monolithic Cement Shelter */}
      <ShelterCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        onOpenShelterDesigner={onOpenShelterDesigner}
      />

      {/* Stencil Customizer: Basepad (Elevated & Ground) */}
      <BasepadCustomizer primary={primary} onUpdateSelected={onUpdateSelected} />

      {/* Stencil Customizer: Cable Ladder Placement Type */}
      <CableLadderCustomizer primary={primary} onUpdateSelected={onUpdateSelected} />

      {/* Automatic Cable Length & Telecom Infrastructure Inspector */}
      <CableLengthCustomizer
        primary={primary}
        allObjects={allObjects}
        settings={settings}
        onUpdateSelected={onUpdateSelected}
        onOpenCableSchedule={onOpenCableSchedule}
        onAddDimensions={onAddDimensions}
      />

      {/* Stencil Customizer: Equipment Cabinet Height Specification */}
      <CabinetCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        onOpenRackDesigner={onOpenRackDesigner}
      />

      {/* Stencil Customizer: Electrical Panels (ATS, ACPDB, ECB) */}
      <ElectricalPanelCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
        onAddToast={onAddToast}
      />

      {/* Stencil Customizer: Wall-Mount Air Conditioner (HVAC Cooling) */}
      <AirConditionerCustomizer
        primary={primary}
        allObjects={allObjects}
        onUpdateSelected={onUpdateSelected}
      />

      {/* Stencil Customizer: Rectifier & Battery System */}
      <RectifierCustomizer primary={primary} onUpdateSelected={onUpdateSelected} />

      {/* Stencil Customizer: Open Bay Equipment Rack */}
      <RackCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        onOpenRackDesigner={onOpenRackDesigner}
        allObjects={allObjects}
        onAddToast={onAddToast}
        onSaveAllObjects={onSaveAllObjects}
      />

      {/* Stencil Customizer: Optical Line Terminal (OLT) Systems */}
      <OLTCustomizer primary={primary} onUpdateSelected={onUpdateSelected} />


      {/* Stencil Customizer: 3-Steps Ground Stairs */}
      {(primary.stencilId === 'ground-stairs-3step' ||
        primary.customProps?.stencilType === 'ground-stairs-3step') && (
        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2.5 shadow-md shadow-emerald-950/20">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
            Ground Basepad Stairs
          </span>
          <div className="text-[10px] text-slate-300">
            Precast 3-step transition staircase for ground concrete basepads (3× 150mm risers = 450mm total lift).
          </div>
        </div>
      )}

      {/* Stencil Customizer: Tower Structure & Height in Meters (AGL) */}
      <TowerCustomizer primary={primary} onUpdateSelected={onUpdateSelected} />

      {/* Transform: Position X, Y & Dimensions */}
      <TransformCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        settings={settings}
        onScaleSelected={onScaleSelected}
      />

      {/* TERRAIN ELEVATION & FOUNDATION RETAINING DIVISION */}
      <TerrainElevationCustomizer
        primary={primary}
        selectedObjects={selectedObjects}
        allObjects={allObjects}
        onUpdateSelected={onUpdateSelected}
        onMergeExcavatedAreas={onMergeExcavatedAreas}
        onAddToast={onAddToast}
      />

      {/* Site Security Gate Properties Card */}
      <GateCustomizer primary={primary} onUpdateSelected={onUpdateSelected} settings={settings} />

      {/* Wall-Attached Roof Canopy Card */}
      <CanopyCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
        onAddToast={onAddToast}
      />

      {/* Quick Rotate & Orientation Card */}
      <RotationCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        onRotateSelected={onRotateSelected}
        onFlipSelected={onFlipSelected}
      />

      <div className="h-px bg-slate-800" />

      {/* Text Content & Station Labels */}
      <TextCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
      />

      {/* Stroke, Fill & Opacity Controls */}
      <StrokeFillCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
      />
    </div>
  );
};
