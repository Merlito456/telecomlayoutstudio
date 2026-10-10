/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BackgroundImageConfig, CADDefaultStyle, CADLayer, CADObject, ProjectSettings } from '../types/cad';
import { LayersPanel } from './LayersPanel';
import { SelectedObjectsControls } from './selection-properties/SelectedObjectsControls';
import { DraftingDefaultsControls } from './selection-properties/DraftingDefaultsControls';
import { Sliders, Layers } from 'lucide-react';

interface SelectionPropertiesPanelProps {
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
  bgImage: BackgroundImageConfig | null;
  onUpdateBgImage: (partial: Partial<BackgroundImageConfig> | null) => void;
  settings: ProjectSettings;
  onUpdateSettings?: (partial: Partial<ProjectSettings>) => void;
  defaultStyle: CADDefaultStyle;
  onUpdateDefaultStyle: (partial: Partial<CADDefaultStyle>) => void;
  layers?: CADLayer[];
  activeLayerId?: string;
  onSetActiveLayer?: (id: string) => void;
  onToggleLayerVisibility?: (id: string) => void;
  onToggleLayerLock?: (id: string) => void;
  onUpdateLayer?: (id: string, updates: Partial<CADLayer>) => void;
  onMoveLayerUp?: (id: string) => void;
  onMoveLayerDown?: (id: string) => void;
  onAddLayer?: () => void;
  onDeleteLayer?: (id: string) => void;
  onToggleAllVisibility?: () => void;
  allVisible?: boolean;
  onMoveSelectedToLayer?: (layerId: string) => void;
  objectCounts?: Record<string, number>;
  activePanelTab?: 'properties' | 'layers';
  onSetActivePanelTab?: (tab: 'properties' | 'layers') => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  onMergeExcavatedAreas?: () => void;
  onOpenShelterDesigner?: (shelterObj?: CADObject) => void;
  onOpenRackDesigner?: (rackObj?: CADObject) => void;
  onOpenCableSchedule?: () => void;
  onSaveAllObjects?: (allObjects: CADObject[]) => void;
}

export const SelectionPropertiesPanel: React.FC<SelectionPropertiesPanelProps> = ({
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
  bgImage,
  onUpdateBgImage,
  settings,
  onUpdateSettings,
  defaultStyle,
  onUpdateDefaultStyle,
  layers = [],
  activeLayerId = 'layer-civil',
  onSetActiveLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onUpdateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onAddLayer,
  onDeleteLayer,
  onToggleAllVisibility,
  allVisible = true,
  onMoveSelectedToLayer,
  objectCounts = {},
  activePanelTab: controlledTab,
  onSetActivePanelTab,
  allObjects = [],
  onAddToast,
  onMergeExcavatedAreas,
  onOpenShelterDesigner,
  onOpenRackDesigner,
  onOpenCableSchedule,
  onSaveAllObjects,
}) => {
  const [internalTab, setInternalTab] = useState<'properties' | 'layers'>('properties');
  const activeTab = controlledTab ?? internalTab;
  const setTab = onSetActivePanelTab ?? setInternalTab;
  const isMulti = selectedObjects.length > 1;
  const isSingle = selectedObjects.length === 1;
  const primary = selectedObjects[0];

  return (
    <aside className="w-72 sm:w-80 bg-slate-950/95 border-l border-slate-800 text-slate-200 flex flex-col shrink-0 select-none z-20 backdrop-blur-md overflow-hidden">
      {/* Photoshop Tab Switcher: Properties & Layers */}
      <div className="flex border-b border-slate-800 bg-slate-950 shrink-0">
        <button
          type="button"
          onClick={() => setTab('properties')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
            activeTab === 'properties'
              ? 'border-sky-400 text-sky-300 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Properties</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('layers')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
            activeTab === 'layers'
              ? 'border-sky-400 text-sky-300 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
          {layers.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {layers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'layers' ? (
        <div className="flex-1 overflow-hidden">
          <LayersPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onSetActiveLayer={onSetActiveLayer || (() => {})}
            onToggleLayerVisibility={onToggleLayerVisibility || (() => {})}
            onToggleLayerLock={onToggleLayerLock || (() => {})}
            onUpdateLayer={onUpdateLayer || (() => {})}
            onMoveLayerUp={onMoveLayerUp || (() => {})}
            onMoveLayerDown={onMoveLayerDown || (() => {})}
            onAddLayer={onAddLayer || (() => {})}
            onDeleteLayer={onDeleteLayer || (() => {})}
            onToggleAllVisibility={onToggleAllVisibility || (() => {})}
            allVisible={allVisible}
            selectedObjects={selectedObjects}
            onMoveSelectedToLayer={onMoveSelectedToLayer || ((layerId) => onUpdateSelected({ layerId }))}
            objectCounts={objectCounts}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Panel Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-200">
                {isSingle
                  ? primary.isStencil
                    ? primary.customProps?.stencilType || 'Stencil Object'
                    : `${primary.type.toUpperCase()} Properties`
                  : isMulti
                  ? `${selectedObjects.length} Objects Selected`
                  : 'Drafting Defaults'}
              </h2>
            </div>
            {selectedObjects.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full font-mono">
                {isSingle ? `#${primary.id.slice(0, 6)}` : `${selectedObjects.length} items`}
              </span>
            )}
          </div>

          {/* SELECTED OBJECT(S) CONTROLS or DRAFTING DEFAULTS */}
          {selectedObjects.length > 0 && primary ? (
            <SelectedObjectsControls
              primary={primary}
              selectedObjects={selectedObjects}
              onUpdateSelected={onUpdateSelected}
              onBringToFront={onBringToFront}
              onSendToBack={onSendToBack}
              onMoveForward={onMoveForward}
              onMoveBackward={onMoveBackward}
              onCopy={onCopy}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onAddDimensions={onAddDimensions}
              onRotateSelected={onRotateSelected}
              onScaleSelected={onScaleSelected}
              onFlipSelected={onFlipSelected}
              settings={settings}
              layers={layers}
              activeLayerId={activeLayerId}
              onMoveSelectedToLayer={onMoveSelectedToLayer}
              allObjects={allObjects}
              onAddToast={onAddToast}
              onMergeExcavatedAreas={onMergeExcavatedAreas}
              onOpenShelterDesigner={onOpenShelterDesigner}
              onOpenRackDesigner={onOpenRackDesigner}
              onOpenCableSchedule={onOpenCableSchedule}
              onSaveAllObjects={onSaveAllObjects}
            />
          ) : (
            <DraftingDefaultsControls
              defaultStyle={defaultStyle}
              onUpdateDefaultStyle={onUpdateDefaultStyle}
              bgImage={bgImage}
              onUpdateBgImage={onUpdateBgImage}
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}
        </div>
      )}
    </aside>
  );
};
