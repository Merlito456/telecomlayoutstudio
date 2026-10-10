import React from 'react';
import {
  CADObject,
  BackgroundImageConfig,
  ProjectSettings,
  ViewportState,
} from '../types/cad';
import {
  downloadPNG,
  downloadProjectFile,
  printA3Layout,
} from '../utils/cad-export';

interface UseCADTopToolbarHandlersProps {
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  bgImage: BackgroundImageConfig | null;
  viewport: ViewportState;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  historyRef: React.MutableRefObject<any>;
  recordHistory: (nextObjects: CADObject[]) => void;
  defaultStyle: { stroke: string };
  setDefaultStyle: React.Dispatch<React.SetStateAction<any>>;
  handleUpdateSelected: (updates: Partial<CADObject>, cascadeToChildren?: boolean) => void;
  modals: {
    addToast: (type: 'info' | 'success' | 'warning' | 'error', message: string, title?: string) => void;
    setIsScaleModalOpen: (open: boolean) => void;
    setIsDiagnosticsModalOpen: (open: boolean) => void;
    setIsAutoWallGateModalOpen: (open: boolean) => void;
    setIsAboutModalOpen: (open: boolean) => void;
    handleOpenShelterDesigner: (shelter?: CADObject) => void;
  };
  setIs3DMode: React.Dispatch<React.SetStateAction<boolean>>;
  setStartInRoamMode: React.Dispatch<React.SetStateAction<boolean>>;
  setActivePanelTab: React.Dispatch<React.SetStateAction<'properties' | 'layers'>>;
}

export function useCADTopToolbarHandlers({
  settings,
  setSettings,
  objects,
  setObjects,
  bgImage,
  viewport,
  selectedIds,
  setSelectedIds,
  historyRef,
  recordHistory,
  defaultStyle,
  setDefaultStyle,
  handleUpdateSelected,
  modals,
  setIs3DMode,
  setStartInRoamMode,
  setActivePanelTab,
}: UseCADTopToolbarHandlersProps) {
  const handleNewProject = () => {
    if (window.confirm('Create a new plan? All unsaved changes will be cleared.')) {
      setObjects([]);
      setSelectedIds([]);
      historyRef.current.clear([]);
      modals.addToast('info', 'New blank canvas initialized');
    }
  };

  const handleSaveProject = () => {
    downloadProjectFile(settings, objects, bgImage, viewport);
    modals.addToast('success', 'Project file downloaded (.json)');
  };

  const handleExportPNG = () => {
    downloadPNG(settings, objects, bgImage, settings.gridVisible);
    modals.addToast('success', 'Exported 2x High-Res PNG');
  };

  const handlePrintA3 = () => {
    printA3Layout(settings, objects, bgImage);
  };

  const handleToggle3D = () => {
    setStartInRoamMode(false);
    setIs3DMode((prev) => !prev);
  };

  const handleOpen3DRoam = () => {
    setStartInRoamMode(true);
    setIs3DMode(true);
  };

  const handleToggleLayersPanel = () => {
    setActivePanelTab((prev) => (prev === 'layers' ? 'properties' : 'layers'));
  };

  const handleUpdateColor = (color: string) => {
    setDefaultStyle((prev: any) => ({ ...prev, stroke: color, draftingColor: color }));
    if (selectedIds.length > 0) {
      handleUpdateSelected({ stroke: color, draftingColor: color }, true);
      const updated = objects.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj;
        const next = { ...obj, stroke: color, draftingColor: color };
        if (next.children && next.children.length > 0) {
          next.children = next.children.map((c) => ({ ...c, stroke: color, draftingColor: color }));
        }
        return next;
      });
      recordHistory(updated);
      modals.addToast('info', `2D Drafting color updated to ${color}`);
    } else {
      modals.addToast('info', `Default 2D drafting color set to ${color}`);
    }
  };

  return {
    handleNewProject,
    handleSaveProject,
    handleExportPNG,
    handlePrintA3,
    handleToggle3D,
    handleOpen3DRoam,
    handleToggleLayersPanel,
    handleUpdateColor,
  };
}
