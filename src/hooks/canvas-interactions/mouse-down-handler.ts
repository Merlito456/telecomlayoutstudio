/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { snapPoint, isPointInObject } from '../../utils/cad-geometry';
import { getObjectLayerId, isObjectLayerVisible, isObjectLayerLocked } from '../../utils/cad-layers';
import { isExcavatedChildOrLabel } from '../../utils/cad-renderer';
import { CanvasInteractionContext } from './types';
import { handleMouseDownHoveredLabels } from './mouse-down-labels';
import { handleMouseDownSelectTool } from './mouse-down-select';
import { handleMouseDownDrawingTools } from './mouse-down-drawing';

export function executeCanvasMouseDown(
  e: React.MouseEvent<HTMLCanvasElement>,
  ctx: CanvasInteractionContext
): void {
  const {
    canvasRef,
    screenToWorld,
    settings,
    objects,
    selectedIds,
    setSelectedIds,
    interactionRef,
    finalizePolyline,
    handleCancelAction,
    armedStencil,
    setArmedStencil,
    armedRotation,
    setArmedRotation,
    setLayers,
    checkAndMergeAdjacentBasepads,
    objectsRef,
    setObjects,
    recordHistory,
    setActiveTool,
    addToast,
    activeTool,
    viewport,
    layers,
  } = ctx;

  if (!canvasRef.current) return;
  const rect = canvasRef.current.getBoundingClientRect();
  const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  const rawWorld = screenToWorld(screenPt.x, screenPt.y);

  // Apply Snapping (for freehand/cable drawing tools, nearby objects do not affect drawing)
  const isFreehandCableTool =
    activeTool === 'line' || activeTool === 'polyline' || activeTool === 'pen';
  const effectiveObjectSnap = isFreehandCableTool ? false : settings.objectSnap;
  const effectiveGridSnap = isFreehandCableTool ? false : settings.gridSnap;
  const snapped = snapPoint(
    rawWorld,
    settings.gridSize,
    effectiveGridSnap,
    effectiveObjectSnap,
    objects,
    selectedIds
  );
  const worldPt = snapped.snapped ? { x: snapped.x, y: snapped.y } : rawWorld;

  // Mouse 2 (Right Click): Finish multi-segment cable if >= 2 points, otherwise Standard CAD Cancel
  if (e.button === 2) {
    e.preventDefault();
    if (
      interactionRef.current.mode === 'drawing' &&
      interactionRef.current.polylinePoints &&
      interactionRef.current.polylinePoints.length >= 2
    ) {
      finalizePolyline();
      return;
    }
    handleCancelAction();
    return;
  }

  // 1. Armed Stencil Placement
  if (e.button === 0 && armedStencil) {
    const targetX = worldPt.x - armedStencil.defaultWidth / 2;
    const targetY = worldPt.y - armedStencil.defaultHeight / 2;
    const placedObjects = armedStencil.createObjects({ x: targetX, y: targetY }, settings.scaleFactor);
    if (armedRotation && placedObjects.length > 0) {
      for (const po of placedObjects) {
        if (!po.isStencilLabel && !po.parentId) {
          po.rotation = armedRotation;
        }
      }
    }
    if (placedObjects.length > 0) {
      const targetLayerId = getObjectLayerId(placedObjects[0]);
      setLayers((prev) =>
        prev.map((l) => (l.id === targetLayerId && !l.visible ? { ...l, visible: true } : l))
      );
    }
    const newObjs = [...objects, ...placedObjects];
    const maybeMerged = checkAndMergeAdjacentBasepads(newObjs, placedObjects[0]?.id);
    objectsRef.current = maybeMerged;
    setObjects(maybeMerged);
    recordHistory(maybeMerged);
    if (maybeMerged === newObjs && placedObjects.length > 0) {
      setSelectedIds([placedObjects[0].id]);
    }
    setArmedStencil(null);
    setArmedRotation(0);
    setActiveTool('select');
    addToast('success', `Deployed ${armedStencil.name}${armedRotation ? ` (${armedRotation}°)` : ''}`);
    return;
  }

  // Middle click or Space held or Pan tool: Panning
  if (e.button === 1 || interactionRef.current.isSpaceHeld || activeTool === 'pan') {
    interactionRef.current = {
      mode: 'pan',
      startScreen: screenPt,
      startWorld: rawWorld,
      currentWorld: rawWorld,
    };
    return;
  }

  // Eraser Tool
  if (activeTool === 'eraser') {
    const wireTol = Math.max(10 / viewport.zoom, 8);
    for (let i = objects.length - 1; i >= 0; i--) {
      const cand = objects[i];
      if (!isObjectLayerVisible(cand, layers) || isObjectLayerLocked(cand, layers)) continue;
      if (cand.type === 'line' || cand.type === 'polyline' || cand.type === 'pen') {
        if (isPointInObject(rawWorld, cand, wireTol)) {
          const cx1 = cand.x;
          const cy1 = cand.y;
          const cx2 = cand.x2 ?? cand.x + (cand.width || 0);
          const cy2 = cand.y2 ?? cand.y + (cand.height || 0);
          const remaining = objects.filter((o, idx) => {
            if (idx === i || o.id === cand.id) return false;
            if (cand.type === 'line' && o.type === 'line') {
              const ox1 = o.x;
              const oy1 = o.y;
              const ox2 = o.x2 ?? o.x + (o.width || 0);
              const oy2 = o.y2 ?? o.y + (o.height || 0);
              if (
                Math.abs(Math.min(ox1, ox2) - Math.min(cx1, cx2)) <= 6 &&
                Math.abs(Math.min(oy1, oy2) - Math.min(cy1, cy2)) <= 6 &&
                Math.abs(Math.max(ox1, ox2) - Math.max(cx1, cx2)) <= 6 &&
                Math.abs(Math.max(oy1, oy2) - Math.max(cy1, cy2)) <= 6
              ) {
                return false;
              }
            }
            return true;
          });
          recordHistory(remaining);
          setSelectedIds([]);
          addToast('info', 'Erased cable line');
          return;
        }
      }
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      const targetObj = objects[i];
      if (isExcavatedChildOrLabel(targetObj, objects)) continue;
      if (!isObjectLayerVisible(targetObj, layers) || isObjectLayerLocked(targetObj, layers)) continue;
      if (isPointInObject(rawWorld, targetObj)) {
        const eraseParentId = targetObj.parentId || targetObj.id;
        const remaining = objects.filter(
          (o, idx) => idx !== i && o.id !== eraseParentId && o.parentId !== eraseParentId
        );
        recordHistory(remaining);
        setSelectedIds([]);
        addToast('info', 'Erased element');
        return;
      }
    }
    return;
  }

  // Handle direct click & drag on hovered labels or sheet indicators
  if (handleMouseDownHoveredLabels(e, ctx, screenPt, rawWorld)) {
    return;
  }

  // Select Tool Interactions
  if (activeTool === 'select') {
    handleMouseDownSelectTool(e, ctx, screenPt, rawWorld, worldPt);
    return;
  }

  // Drawing Tools (Text, Line, Polyline, Pen, Rect, Circle, Dims)
  handleMouseDownDrawingTools(e, ctx, screenPt, rawWorld, worldPt);
}
