/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectSettings, ToolType, ViewportState } from '../types/cad';
import {
  Ruler,
  PenTool,
  Package,
  Compass,
  Scissors,
  FolderOpen,
  Layers2,
  Info,
  Activity,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { DraftingSubfunctions } from './toolbar/DraftingSubfunctions';
import { EquipmentSubfunctions } from './toolbar/EquipmentSubfunctions';
import { ViewSubfunctions } from './toolbar/ViewSubfunctions';
import { EditSubfunctions } from './toolbar/EditSubfunctions';
import { FileSubfunctions } from './toolbar/FileSubfunctions';

export type CategoryTab = 'drafting' | 'equipment' | 'view3d' | 'edit' | 'file';

interface TopToolbarProps {
  settings: ProjectSettings;
  onUpdateSettings: (partial: Partial<ProjectSettings>) => void;
  viewport: ViewportState;
  onUpdateViewport: (partial: Partial<ViewportState>) => void;
  onFitToScreen: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasClipboard: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll?: () => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onExportDXF?: () => void;
  onLoadProjectFile: (file: File) => void;
  onLoadBackgroundImage: (file: File) => void;
  onTriggerPasteImage: () => void;
  onExportPNG: () => void;
  onPrintA3: () => void;
  onOpenScaleModal: () => void;
  onOpenDiagnostics: () => void;
  onOpenAutoWallGateModal?: () => void;
  onOpenAbout?: () => void;
  is3DMode?: boolean;
  onToggle3D?: () => void;
  onOpen3DRoam?: () => void;
  onOpenShelterDesigner?: () => void;
  onOpenRackDesigner?: () => void;
  onOpenCableSchedule?: () => void;
  activeColor?: string;
  onUpdateColor?: (color: string) => void;
  layerCount?: number;
  activePanelTab?: 'properties' | 'layers';
  onToggleLayersPanel?: () => void;
  activeTool?: ToolType;
  onSelectTool?: (tool: ToolType) => void;
  isStencilDrawerOpen?: boolean;
  onToggleStencilDrawer?: () => void;
  hasArmedStencil?: boolean;
  armedStencilName?: string;
  onCancelArmedStencil?: () => void;
  activeCategory?: CategoryTab;
  onSelectCategory?: (category: CategoryTab) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  settings,
  onUpdateSettings,
  viewport,
  onUpdateViewport,
  onFitToScreen,
  canUndo,
  canRedo,
  hasSelection,
  hasClipboard,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  onDelete,
  onSelectAll,
  onNewProject,
  onSaveProject,
  onExportDXF,
  onLoadProjectFile,
  onLoadBackgroundImage,
  onTriggerPasteImage,
  onExportPNG,
  onPrintA3,
  onOpenScaleModal,
  onOpenDiagnostics,
  onOpenAutoWallGateModal,
  onOpenAbout,
  is3DMode = false,
  onToggle3D,
  onOpen3DRoam,
  onOpenShelterDesigner,
  onOpenRackDesigner,
  onOpenCableSchedule,
  activeColor = '#38bdf8',
  onUpdateColor,
  layerCount = 1,
  activePanelTab,
  onToggleLayersPanel,
  activeTool = 'select',
  onSelectTool,
  isStencilDrawerOpen,
  onToggleStencilDrawer,
  hasArmedStencil,
  armedStencilName,
  onCancelArmedStencil,
  activeCategory: propActiveCategory,
  onSelectCategory,
}) => {
  const [internalCategory, setInternalCategory] = useState<CategoryTab>('drafting');
  const activeTab = propActiveCategory ?? internalCategory;

  const handleTabChange = (tab: CategoryTab) => {
    if (onSelectCategory) {
      onSelectCategory(tab);
    } else {
      setInternalCategory(tab);
    }
  };

  const CATEGORIES: {
    id: CategoryTab;
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'drafting',
      label: 'Drafting',
      sublabel: '2D CAD Tools',
      icon: PenTool,
      accentColor: 'text-sky-400',
    },
    {
      id: 'equipment',
      label: 'Site & Equipment',
      sublabel: 'Stencils & Studios',
      icon: Package,
      accentColor: 'text-amber-400',
    },
    {
      id: 'view3d',
      label: 'View & 3D',
      sublabel: 'Modes & Zoom',
      icon: Compass,
      accentColor: 'text-emerald-400',
    },
    {
      id: 'edit',
      label: 'Edit & Modify',
      sublabel: 'History & Clipboard',
      icon: Scissors,
      accentColor: 'text-purple-400',
    },
    {
      id: 'file',
      label: 'File & Export',
      sublabel: 'Project & DXF/PNG',
      icon: FolderOpen,
      accentColor: 'text-indigo-400',
    },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-200 select-none z-30 flex flex-col shrink-0">
      {/* 1. Main Top Bar: Branding, Project Title, Category Tabs, System Controls */}
      <div className="h-11 px-2.5 flex items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/95">
        {/* Left: Branding & Project Title */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold text-xs shrink-0">
              <Ruler className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xs tracking-tight bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent block leading-tight">
                TELECOM STUDIO
              </span>
            </div>
          </div>

          {/* Project Name Input */}
          <input
            type="text"
            value={settings.fileName}
            onChange={(e) => onUpdateSettings({ fileName: e.target.value })}
            className="bg-slate-900 border border-slate-700/60 rounded px-2 py-0.5 text-xs text-sky-200 font-medium focus:border-sky-500 focus:outline-none w-28 sm:w-36 md:w-44 transition-all"
            placeholder="Project title..."
            title="Rename Site Plan Layout"
          />
        </div>

        {/* Center: Category Tabs */}
        <nav
          aria-label="Toolbar Category Tabs"
          className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTabChange(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer relative shrink-0 ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? cat.accentColor : 'text-slate-400'
                  }`}
                />
                <span className="font-semibold">{cat.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Context Badges & Global Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Active Tool Badge */}
          <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-500">Tool:</span>
            <span className="text-sky-300 font-medium capitalize font-mono">{activeTool}</span>
          </div>

          {/* Quick Layers Panel Toggle */}
          {onToggleLayersPanel && (
            <button
              type="button"
              onClick={onToggleLayersPanel}
              title="Toggle Layers Panel"
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activePanelTab === 'layers'
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
            </button>
          )}

          <PWAInstallButton />

          {/* Diagnostics & Info */}
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              title="About Studio"
              className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-900 rounded cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenDiagnostics}
            title="Diagnostics [Ctrl+Shift+D]"
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Subfunctions Ribbon Bar: Dynamic for the Active Category */}
      <div className="min-h-10 px-2 py-1 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-xs flex items-center justify-between">
        <div className="flex-1 min-w-0 flex items-center">
          {activeTab === 'drafting' && (
            <DraftingSubfunctions
              activeTool={activeTool}
              onSelectTool={onSelectTool}
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onOpenScaleModal={onOpenScaleModal}
              activeColor={activeColor}
              onUpdateColor={onUpdateColor}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentSubfunctions
              isStencilDrawerOpen={isStencilDrawerOpen}
              onToggleStencilDrawer={onToggleStencilDrawer}
              hasArmedStencil={hasArmedStencil}
              armedStencilName={armedStencilName}
              onCancelArmedStencil={onCancelArmedStencil}
              onOpenShelterDesigner={onOpenShelterDesigner}
              onOpenRackDesigner={onOpenRackDesigner}
              onOpenAutoWallGateModal={onOpenAutoWallGateModal}
              onOpenCableSchedule={onOpenCableSchedule}
              layerCount={layerCount}
              activePanelTab={activePanelTab}
              onToggleLayersPanel={onToggleLayersPanel}
            />
          )}

          {activeTab === 'view3d' && (
            <ViewSubfunctions
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              viewport={viewport}
              onUpdateViewport={onUpdateViewport}
              onFitToScreen={onFitToScreen}
              is3DMode={is3DMode}
              onToggle3D={onToggle3D}
              onOpen3DRoam={onOpen3DRoam}
            />
          )}

          {activeTab === 'edit' && (
            <EditSubfunctions
              canUndo={canUndo}
              canRedo={canRedo}
              hasSelection={hasSelection}
              hasClipboard={hasClipboard}
              onUndo={onUndo}
              onRedo={onRedo}
              onCopy={onCopy}
              onCut={onCut}
              onPaste={onPaste}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onSelectAll={onSelectAll}
            />
          )}

          {activeTab === 'file' && (
            <FileSubfunctions
              onNewProject={onNewProject}
              onSaveProject={onSaveProject}
              onLoadProjectFile={onLoadProjectFile}
              onLoadBackgroundImage={onLoadBackgroundImage}
              onTriggerPasteImage={onTriggerPasteImage}
              onExportDXF={onExportDXF}
              onExportPNG={onExportPNG}
              onPrintA3={onPrintA3}
              onOpenScaleModal={onOpenScaleModal}
              onOpenDiagnostics={onOpenDiagnostics}
              onOpenAbout={onOpenAbout}
            />
          )}
        </div>
      </div>
    </header>
  );
};
