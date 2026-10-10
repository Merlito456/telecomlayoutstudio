/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { checkAndMergeAdjacentBasepads } from '../utils/cad-geometry';
import { useCADSessionStorage } from './useCADSessionStorage';
import { useCADViewportGestures } from './useCADViewportGestures';
import { useCADCanvasRenderLoop } from './useCADCanvasRenderLoop';
import { useCADKeyboardShortcuts } from './useCADKeyboardShortcuts';
import { useCADHistoryAndClipboard } from './useCADHistoryAndClipboard';
import { useCADLayersManager } from './useCADLayersManager';
import { useCADTransforms } from './useCADTransforms';
import { useCADDoorInteractions } from './useCADDoorInteractions';
import { useCADFileOperations } from './useCADFileOperations';
import { useCADStencilOperations } from './useCADStencilOperations';
import { useCADCanvasInteractions } from './useCADCanvasInteractions';
import { useCADAppModalState } from './useCADAppModalState';
import { useCADAppState } from './useCADAppState';
import { useCADTopToolbarHandlers } from './useCADTopToolbarHandlers';

export function useCADAppLogic() {
  const {
    objects,
    setObjects,
    objectsRef,
    bgImage,
    setBgImage,
    bgImageRef,
    settings,
    setSettings,
    settingsRef,
    viewport,
    setViewport,
    viewportRef,
    storageKB,
    historyRef,
    persistSessionImmediately,
  } = useCADSessionStorage();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedIdsSetterRef = useRef<React.Dispatch<React.SetStateAction<string[]>> | null>(null);

  // Modals & Toasts State Hook
  const modals = useCADAppModalState({
    objectsRef,
    setObjects,
    settings,
    bgImage,
    viewport,
    recordHistory: (next) => history.recordHistory(next),
    setSelectedIds: (val) => selectedIdsSetterRef.current?.(val),
  });

  // App-level tool, selection and active state
  const {
    selectedIds,
    setSelectedIds,
    activeTool,
    setActiveTool,
    isStencilDrawerOpen,
    setIsStencilDrawerOpen,
    armedStencil,
    setArmedStencil,
    armedRotation,
    setArmedRotation,
    defaultStyle,
    setDefaultStyle,
    inlineEditor,
    setInlineEditor,
    hoveredTextLabel,
    setHoveredTextLabel,
    activePanelTab,
    setActivePanelTab,
    is3DMode,
    setIs3DMode,
    startInRoamMode,
    setStartInRoamMode,
    handleCancelAction,
  } = useCADAppState({ addToast: modals.addToast });

  selectedIdsSetterRef.current = setSelectedIds;

  // Viewport & Pan/Zoom Gestures Hook
  const { handleFitToScreen } = useCADViewportGestures({
    containerRef,
    canvasRef,
    settings,
    viewport,
    setViewport,
  });

  // History & Clipboard Hook
  const history = useCADHistoryAndClipboard({
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    setSelectedIds,
    historyRef,
    persistSessionImmediately,
    addToast: (type, msg, title) => modals.addToast(type, msg, title),
  });

  // Layers Hook
  const {
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    allLayersVisible,
    handleToggleLayerVisibility,
    handleToggleLayerLock,
    handleUpdateLayer,
    handleMoveLayerUp,
    handleMoveLayerDown,
    handleAddLayer,
    handleDeleteLayer,
    handleToggleAllVisibility,
    handleMoveSelectedToLayer,
    objectCounts,
  } = useCADLayersManager({
    settings,
    setSettings,
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    recordHistory: history.recordHistory,
    addToast: modals.addToast,
  });

  // Transforms Hook
  const {
    handleUpdateSelected,
    handleRotateSelected,
    handleScaleSelected,
    handleFlipSelected,
    handleNudgeSelected,
    handleAutoAddDimensions,
  } = useCADTransforms({
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    setSelectedIds,
    settings,
    setDefaultStyle,
    recordHistory: history.recordHistory,
    addToast: modals.addToast,
  });

  // Canvas Interactions Hook
  const {
    cursorPos,
    snapInfo,
    endpointSnapInfo,
    measureTooltip,
    activeDrawingPreview,
    selectionBoxPreview,
    interactionRef,
    screenToWorld,
    finalizePolyline,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasDoubleClick,
  } = useCADCanvasInteractions({
    canvasRef,
    containerRef,
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    setSelectedIds,
    viewport,
    setViewport,
    settings,
    setSettings,
    settingsRef,
    bgImageRef,
    viewportRef,
    persistSessionImmediately,
    activeTool,
    setActiveTool,
    defaultStyle,
    setDefaultStyle,
    armedStencil,
    setArmedStencil,
    armedRotation,
    setArmedRotation,
    setIsStencilDrawerOpen,
    layers,
    setLayers,
    activeLayerId,
    hoveredTextLabel,
    setInlineEditor,
    setHoveredTextLabel,
    handleCancelAction,
    recordHistory: history.recordHistory,
    addToast: modals.addToast,
    checkAndMergeAdjacentBasepads,
    onOpenRackDesigner: modals.handleOpenRackDesigner,
  });

  // Door Interactions Hook
  const {
    areDoorsOpen,
    handleToggleDoors,
    handleToggleSingleDoor,
    handleInteractWithDoor2D,
  } = useCADDoorInteractions({
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    cursorPos,
    recordHistory: history.recordHistory,
    addToast: modals.addToast,
  });

  // Stencil Operations Hook
  const {
    handleArmStencil,
    handleCancelArmedStencil,
    handleToggleObjectLabels,
    handlePlaceStencilAtCenter,
    mergeExcavatedAreas,
  } = useCADStencilOperations({
    containerRef,
    settings,
    setSettings,
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    setSelectedIds,
    activeLayerId,
    setLayers,
    armedStencil,
    setArmedStencil,
    armedRotation,
    setArmedRotation,
    setActiveTool,
    setIsStencilDrawerOpen,
    screenToWorld,
    recordHistory: history.recordHistory,
    addToast: modals.addToast,
  });

  // File Operations Hook
  const {
    handleLoadBackgroundImage,
    handleTriggerPasteImage,
    handleExportDXF,
    handleLoadCADFile,
    handleCanvasDragOver,
    handleCanvasDrop,
  } = useCADFileOperations({
    settings,
    setSettings,
    objects,
    setObjects,
    objectsRef,
    layers,
    setLayers,
    setBgImage,
    setViewport,
    setSelectedIds,
    historyRef,
    canvasRef,
    screenToWorld,
    checkAndMergeAdjacentBasepads,
    recordHistory: history.recordHistory,
    addToast: modals.addToast,
  });

  // Keyboard Shortcuts Hook
  useCADKeyboardShortcuts({
    is3DMode,
    interactionRef,
    handleUndo: history.handleUndo,
    handleRedo: history.handleRedo,
    handleCopy: history.handleCopy,
    handleCut: history.handleCut,
    handlePaste: history.handlePaste,
    handleDuplicate: history.handleDuplicate,
    handleSelectAll: history.handleSelectAll,
    handleDelete: history.handleDelete,
    handleRotateSelected,
    handleScaleSelected,
    handleNudgeSelected,
    handleFitToScreen,
    handleCancelAction,
    finalizePolyline,
    handleInteractWithDoor2D,
    setIsDiagnosticsModalOpen: modals.setIsDiagnosticsModalOpen,
    setIs3DMode,
    setActiveTool,
    setSettings,
    setDimensionsArmed: modals.setDimensionsArmed,
    addToast: (msg, type) => modals.addToast(type || 'info', msg),
    objects,
    selectedIds,
    settings,
    viewport,
    bgImage,
  });

  // 2D Canvas Render Loop Hook
  useCADCanvasRenderLoop({
    canvasRef,
    containerRef,
    viewport,
    settings,
    objects,
    selectedIds,
    layers,
    hoveredTextLabel,
    bgImage,
    activeDrawingPreview,
    snapInfo,
    endpointSnapInfo,
    armedStencil,
    armedRotation,
    cursorPos,
    interactionRef,
    selectionBoxPreview,
    measureTooltip,
  });

  // Top Toolbar Handlers
  const toolbarHandlers = useCADTopToolbarHandlers({
    settings,
    setSettings,
    objects,
    setObjects,
    bgImage,
    viewport,
    selectedIds,
    setSelectedIds,
    historyRef,
    recordHistory: history.recordHistory,
    defaultStyle,
    setDefaultStyle,
    handleUpdateSelected,
    modals,
    setIs3DMode,
    setStartInRoamMode,
    setActivePanelTab,
  });

  return {
    canvasRef,
    containerRef,
    objects,
    setObjects,
    objectsRef,
    bgImage,
    setBgImage,
    settings,
    setSettings,
    settingsRef,
    viewport,
    setViewport,
    storageKB,
    historyRef,
    persistSessionImmediately,
    modals,
    selectedIds,
    setSelectedIds,
    activeTool,
    setActiveTool,
    isStencilDrawerOpen,
    setIsStencilDrawerOpen,
    armedStencil,
    armedRotation,
    setArmedRotation,
    defaultStyle,
    setDefaultStyle,
    inlineEditor,
    setInlineEditor,
    hoveredTextLabel,
    activePanelTab,
    setActivePanelTab,
    is3DMode,
    setIs3DMode,
    startInRoamMode,
    setStartInRoamMode,
    handleCancelAction,
    handleFitToScreen,
    history,
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    allLayersVisible,
    handleToggleLayerVisibility,
    handleToggleLayerLock,
    handleUpdateLayer,
    handleMoveLayerUp,
    handleMoveLayerDown,
    handleAddLayer,
    handleDeleteLayer,
    handleToggleAllVisibility,
    handleMoveSelectedToLayer,
    objectCounts,
    handleUpdateSelected,
    handleRotateSelected,
    handleScaleSelected,
    handleFlipSelected,
    handleAutoAddDimensions,
    cursorPos,
    snapInfo,
    interactionRef,
    finalizePolyline,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasDoubleClick,
    areDoorsOpen,
    handleToggleDoors,
    handleToggleSingleDoor,
    handleInteractWithDoor2D,
    handleArmStencil,
    handleCancelArmedStencil,
    handleToggleObjectLabels,
    handlePlaceStencilAtCenter,
    mergeExcavatedAreas,
    handleLoadBackgroundImage,
    handleTriggerPasteImage,
    handleExportDXF,
    handleLoadCADFile,
    handleCanvasDragOver,
    handleCanvasDrop,
    toolbarHandlers,
  };
}
