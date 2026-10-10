/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  CADObject,
  Point,
  SnapResult,
  ToolType,
} from '../types/cad';
import { EndpointSnapResult, isIndoorCable } from '../utils/cad-geometry';
import {
  calculateCableLength,
  inferCableType,
  formatCableDisplay,
  detectAutoColorForCable,
} from '../utils/cad-geometry/cable-length-calculator';
import { uid } from '../utils/cad-defaults';
import {
  CanvasInteractionContext,
  InteractionRefState,
} from './canvas-interactions/types';
import { executeCanvasMouseDown } from './canvas-interactions/mouse-down-handler';
import { executeCanvasMouseMove } from './canvas-interactions/mouse-move-handler';
import { executeCanvasMouseUp } from './canvas-interactions/mouse-up-handler';
import { executeCanvasDoubleClick } from './canvas-interactions/double-click-handler';
import { UseCADCanvasInteractionsProps } from './canvas-interactions/types';

export type { UseCADCanvasInteractionsProps } from './canvas-interactions/types';

export function useCADCanvasInteractions(props: UseCADCanvasInteractionsProps) {
  const {
    canvasRef,
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
    setDefaultStyle: _setDefaultStyle,
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
    recordHistory,
    addToast,
    checkAndMergeAdjacentBasepads,
  } = props;

  // Ephemeral Mouse Interaction State
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [snapInfo, setSnapInfo] = useState<SnapResult | null>(null);
  const [endpointSnapInfo, setEndpointSnapInfo] = useState<EndpointSnapResult | null>(null);
  const [measureTooltip, setMeasureTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const interactionRef = useRef<InteractionRefState>({
    mode: 'none',
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    currentWorld: { x: 0, y: 0 },
  });

  const [activeDrawingPreview, setActiveDrawingPreview] = useState<CADObject | null>(null);
  const [selectionBoxPreview, setSelectionBoxPreview] = useState<{ start: Point; current: Point } | null>(null);

  // Screen to World Coordinate Converter
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - viewport.panX) / viewport.zoom,
        y: (screenY - viewport.panY) / viewport.zoom,
      };
    },
    [viewport]
  );

  // World to Screen Coordinate Converter
  const worldToScreen = useCallback(
    (worldX: number, worldY: number): Point => {
      return {
        x: worldX * viewport.zoom + viewport.panX,
        y: worldY * viewport.zoom + viewport.panY,
      };
    },
    [viewport]
  );

  const finalizePolyline = useCallback(
    (overridePts?: Point[], cabinetReachedName?: string) => {
      const pts = overridePts || interactionRef.current.polylinePoints;
      if (!pts || pts.length < 2) {
        interactionRef.current.mode = 'none';
        interactionRef.current.polylinePoints = [];
        setActiveDrawingPreview(null);
        setMeasureTooltip(null);
        return;
      }

      const finalPts = [...pts];
      let newObj: CADObject;

      if (finalPts.length === 2 && activeTool === 'line') {
        const p1 = finalPts[0];
        const p2 = finalPts[1];
        newObj = {
          id: uid(),
          type: 'line',
          x: Math.round(p1.x),
          y: Math.round(p1.y),
          x2: Math.round(p2.x),
          y2: Math.round(p2.y),
          width: Math.abs(Math.round(p2.x) - Math.round(p1.x)),
          height: Math.abs(Math.round(p2.y) - Math.round(p1.y)),
          stroke: defaultStyle.stroke,
          strokeWidth: defaultStyle.strokeWidth,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
          layerId: 'layer-cabling',
        };
      } else {
        const minX = Math.min(...finalPts.map((p) => p.x));
        const minY = Math.min(...finalPts.map((p) => p.y));
        const maxX = Math.max(...finalPts.map((p) => p.x));
        const maxY = Math.max(...finalPts.map((p) => p.y));
        const relPoints = finalPts.map((p) => ({
          x: Math.round(p.x - minX),
          y: Math.round(p.y - minY),
        }));

        newObj = {
          id: uid(),
          type: 'polyline',
          x: Math.round(minX),
          y: Math.round(minY),
          width: Math.max(Math.round(maxX - minX), 4),
          height: Math.max(Math.round(maxY - minY), 4),
          points: relPoints,
          stroke: defaultStyle.stroke,
          strokeWidth: defaultStyle.strokeWidth,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
          layerId: 'layer-cabling',
        };
      }

      newObj.isCable = true;
      const autoColor = detectAutoColorForCable(newObj, objects);
      if (autoColor) {
        newObj.stroke = autoColor.stroke;
        newObj.cableType = autoColor.cableType;
        newObj.presetId = autoColor.presetId;
      } else {
        newObj.cableType = inferCableType(newObj);
      }

      const isIndoor = isIndoorCable(newObj, objects);
      if (isIndoor) {
        newObj.placement = 'indoor';
        newObj.customProps = {
          ...(newObj.customProps || {}),
          placement: 'indoor',
          isIndoor: true,
        };
      }
      const calc = calculateCableLength(newObj, settings.scaleFactor);
      const lenStr = formatCableDisplay(calc.totalLengthM, settings);

      const newObjs = [...objects, newObj];
      recordHistory(newObjs);
      setSelectedIds([newObj.id]);
      interactionRef.current.mode = 'none';
      interactionRef.current.polylinePoints = [];
      setActiveDrawingPreview(null);
      setMeasureTooltip(null);

      if (autoColor) {
        addToast(
          'success',
          `Auto-detected ${autoColor.label} cable • Length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft)`
        );
      } else if (cabinetReachedName && !isIndoor) {
        addToast(
          'success',
          `LTC Connector attached to ${cabinetReachedName} • Cable length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft)`
        );
      } else if (isIndoor) {
        addToast(
          'success',
          `Indoor Cable route placed • Auto-calculated length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft, ${finalPts.length} points)`
        );
      } else {
        addToast(
          'success',
          `Cable route placed • Auto-calculated length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft, ${finalPts.length} points)`
        );
      }
    },
    [defaultStyle, objects, recordHistory, activeTool, addToast, setSelectedIds, settings]
  );

  const getContext = (): CanvasInteractionContext => ({
    canvasRef,
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
    recordHistory,
    addToast,
    checkAndMergeAdjacentBasepads,
    interactionRef,
    screenToWorld,
    worldToScreen,
    finalizePolyline,
    cursorPos,
    setCursorPos,
    snapInfo,
    setSnapInfo,
    endpointSnapInfo,
    setEndpointSnapInfo,
    measureTooltip,
    setMeasureTooltip,
    activeDrawingPreview,
    setActiveDrawingPreview,
    selectionBoxPreview,
    setSelectionBoxPreview,
  });

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    executeCanvasMouseDown(e, getContext());
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    executeCanvasMouseMove(e, getContext());
  };

  const handleCanvasMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    executeCanvasMouseUp(e, getContext());
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    executeCanvasDoubleClick(e, getContext());
  };

  return {
    cursorPos,
    setCursorPos,
    snapInfo,
    setSnapInfo,
    endpointSnapInfo,
    setEndpointSnapInfo,
    measureTooltip,
    setMeasureTooltip,
    activeDrawingPreview,
    setActiveDrawingPreview,
    selectionBoxPreview,
    setSelectionBoxPreview,
    interactionRef,
    screenToWorld,
    worldToScreen,
    finalizePolyline,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasDoubleClick,
  };
}
