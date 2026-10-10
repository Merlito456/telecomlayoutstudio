/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  findHoveredTextLabel,
  snapPoint,
  snapToLineEndpoints,
  EndpointSnapResult,
} from '../../utils/cad-geometry';
import { CanvasInteractionContext } from './types';
import { handleMouseMoveAnnotations } from './mouse-move-annotations';
import { handleMouseMoveTransforms } from './mouse-move-transforms';
import { handleMouseMoveDrawing } from './mouse-move-drawing';

export function executeCanvasMouseMove(
  e: React.MouseEvent<HTMLCanvasElement>,
  ctx: CanvasInteractionContext
): void {
  const {
    canvasRef,
    screenToWorld,
    worldToScreen,
    settings,
    objects,
    selectedIds,
    interactionRef,
    activeTool,
    viewport,
    activeDrawingPreview,
    setActiveDrawingPreview,
    setEndpointSnapInfo,
    setCursorPos,
    setSnapInfo,
    setHoveredTextLabel,
    setMeasureTooltip,
  } = ctx;

  if (!canvasRef.current) return;
  const rect = canvasRef.current.getBoundingClientRect();
  const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  const rawWorld = screenToWorld(screenPt.x, screenPt.y);

  // Line endpoint snap computation
  let epSnap: EndpointSnapResult = { x: rawWorld.x, y: rawWorld.y, snapped: false };
  if (activeTool === 'select') {
    epSnap = snapToLineEndpoints(rawWorld, objects, 22 / viewport.zoom);
  }
  setEndpointSnapInfo(epSnap.snapped ? epSnap : null);

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
  const worldPt = epSnap.snapped
    ? { x: epSnap.x, y: epSnap.y }
    : snapped.snapped
    ? { x: snapped.x, y: snapped.y }
    : rawWorld;

  setCursorPos(worldPt);
  setSnapInfo(
    epSnap.snapped ? { x: epSnap.x, y: epSnap.y, snapped: true, snapType: 'endpoint' } : snapped
  );

  const inter = interactionRef.current;

  // Check for hovered text / note callout / stencil label / dimension label / sheet indicator
  if (inter.mode === 'none') {
    const showLabels = settings.showObjectLabels !== false;
    if (showLabels) {
      const found = findHoveredTextLabel(rawWorld, objects, settings);
      if (found) {
        const sPos = worldToScreen(found.centerWorld.x, found.centerWorld.y);
        setHoveredTextLabel({
          objId: found.objId,
          field: found.field,
          currentText: found.currentText,
          bounds: found.bounds,
          screenPos: sPos,
        });
      } else {
        setHoveredTextLabel(null);
      }
    } else {
      setHoveredTextLabel(null);
    }
  }

  // Clear obsolete rubberband line preview
  if (inter.mode === 'none' && activeDrawingPreview?.id === 'preview_line_rubberband') {
    setActiveDrawingPreview(null);
    setMeasureTooltip(null);
  }

  // Delegate to annotation mover (sheet elements, dimension labels, badges, callouts)
  if (handleMouseMoveAnnotations(worldPt, screenPt, ctx)) {
    return;
  }

  // Delegate to transforms (pan, marquee select, move objects, resize, rotate)
  if (handleMouseMoveTransforms(e, worldPt, screenPt, rawWorld, ctx)) {
    return;
  }

  // Delegate to drawing tool previews
  if (inter.mode === 'drawing') {
    handleMouseMoveDrawing(e, worldPt, screenPt, rawWorld, ctx);
  }
}
