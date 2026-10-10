/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject } from '../../types/cad';
import { snapToLineEndpoints } from '../../utils/cad-geometry';
import {
  calculateCableLength,
  formatCableDisplay,
  inferCableType,
  detectAutoColorForCable,
} from '../../utils/cad-geometry/cable-length-calculator';
import { uid } from '../../utils/cad-defaults';
import { detectFeatureLabelAtPoint } from '../../utils/cad-feature-labels';
import { CanvasInteractionContext } from './types';

export function executeCanvasMouseUp(
  e: React.MouseEvent<HTMLCanvasElement> | undefined,
  ctx: CanvasInteractionContext
): void {
  const {
    objects,
    objectsRef,
    setObjects,
    setSelectedIds,
    interactionRef,
    finalizePolyline,
    activeTool,
    viewport,
    settings,
    settingsRef,
    defaultStyle,
    activeLayerId,
    setLayers,
    recordHistory,
    persistSessionImmediately,
    addToast,
    checkAndMergeAdjacentBasepads,
    activeDrawingPreview,
    setActiveDrawingPreview,
    setMeasureTooltip,
    setSelectionBoxPreview,
    worldToScreen,
    setInlineEditor,
  } = ctx;

  if (e && e.button === 2) {
    e.preventDefault();
    return;
  }
  const inter = interactionRef.current;
  setMeasureTooltip(null);

  if (inter.mode === 'move-objects' || inter.mode === 'resize-handle' || inter.mode === 'rotate-handle') {
    const mode = inter.mode;
    inter.mode = 'none';
    if (mode === 'move-objects' || mode === 'resize-handle') {
      const maybeMerged = checkAndMergeAdjacentBasepads(objectsRef.current);
      if (maybeMerged !== objectsRef.current) {
        objectsRef.current = maybeMerged;
        setObjects(maybeMerged);
        recordHistory(maybeMerged);
        return;
      }
    }
    recordHistory([...objectsRef.current]);
    return;
  }

  if (
    inter.mode === 'move-dimension-label' ||
    inter.mode === 'move-meas-badge' ||
    inter.mode === 'move-elev-badge' ||
    inter.mode === 'move-leader-callout' ||
    inter.mode === 'move-leader-tip'
  ) {
    inter.mode = 'none';
    recordHistory([...objectsRef.current]);
    persistSessionImmediately(objectsRef.current);
    addToast('info', 'Label position updated');
    return;
  }

  if (inter.mode === 'move-sheet-element') {
    inter.mode = 'none';
    persistSessionImmediately(objectsRef.current, settingsRef.current);
    addToast('info', 'Sheet element position updated');
    return;
  }

  if (
    inter.mode === 'move-shelter-door' ||
    inter.mode === 'resize-shelter-door' ||
    inter.mode === 'move-shelter-feeder' ||
    inter.mode === 'resize-shelter-feeder'
  ) {
    const isDoorResize = inter.mode === 'resize-shelter-door';
    const isFeederResize = inter.mode === 'resize-shelter-feeder';
    const isDoor = inter.mode === 'move-shelter-door';
    inter.mode = 'none';
    recordHistory([...objectsRef.current]);
    persistSessionImmediately(objectsRef.current);
    addToast(
      'success',
      isDoorResize
        ? 'Shelter Door diameter resized'
        : isFeederResize
        ? 'Shelter Feeder Hole diameter resized'
        : isDoor
        ? 'Shelter Access Door repositioned'
        : 'Shelter Feeder Hole repositioned'
    );
    return;
  }

  if (inter.mode === 'drag-select') {
    inter.mode = 'none';
    setSelectionBoxPreview(null);
    return;
  }

  if (inter.mode === 'pan') {
    inter.mode = 'none';
    return;
  }

  // Multi-click line/polyline cable drawing: don't end on mouseUp unless user dragged a line
  if (inter.mode === 'drawing') {
    if (activeTool === 'polyline') {
      return;
    }
    if (activeTool === 'line') {
      if (inter.polylinePoints && inter.polylinePoints.length >= 1) {
        const p1 = inter.polylinePoints[0];
        const p2 = activeDrawingPreview?.type === 'line'
          ? { x: activeDrawingPreview.x2 ?? activeDrawingPreview.x, y: activeDrawingPreview.y2 ?? activeDrawingPreview.y }
          : inter.currentWorld || inter.startWorld;
        if (Math.hypot(p2.x - p1.x, p2.y - p1.y) >= 8) {
          finalizePolyline([p1, p2]);
          return;
        }
      }
      return;
    }
  }

  // Finalize Drawing Shape
  if (inter.mode === 'drawing') {
    let previewToPlace = activeDrawingPreview;

    if (!previewToPlace) {
      const sx = inter.startWorld.x;
      const sy = inter.startWorld.y;

      if (activeTool === 'rectangle') {
        const w = 100;
        const h = 60;
        previewToPlace = {
          id: 'preview_rect',
          type: 'rectangle',
          x: sx - w / 2,
          y: sy - h / 2,
          width: w,
          height: h,
          stroke: defaultStyle.stroke,
          strokeWidth: defaultStyle.strokeWidth,
          fill: defaultStyle.fill,
          fillEnabled: defaultStyle.fillEnabled,
          fillOpacity: defaultStyle.fillOpacity,
          opacity: 1,
        };
      } else if (activeTool === 'circle') {
        const r = 40;
        previewToPlace = {
          id: 'preview_circle',
          type: 'circle',
          x: sx - r,
          y: sy - r,
          width: r * 2,
          height: r * 2,
          stroke: defaultStyle.stroke,
          strokeWidth: defaultStyle.strokeWidth,
          fill: defaultStyle.fill,
          fillEnabled: defaultStyle.fillEnabled,
          fillOpacity: defaultStyle.fillOpacity,
          opacity: 1,
        };
      } else if (activeTool === 'dim-h') {
        previewToPlace = {
          id: 'preview_dim_h',
          type: 'dim-h',
          x: sx,
          y: sy,
          x2: sx + 100,
          y2: sy,
          width: 100,
          height: 0,
          dimOffset: -25,
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        };
      } else if (activeTool === 'dim-v') {
        previewToPlace = {
          id: 'preview_dim_v',
          type: 'dim-v',
          x: sx,
          y: sy,
          x2: sx,
          y2: sy + 80,
          width: 0,
          height: 80,
          dimOffset: 30,
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        };
      } else if (activeTool === 'dim-aligned') {
        previewToPlace = {
          id: 'preview_dim_aligned',
          type: 'dim-aligned',
          x: sx,
          y: sy,
          x2: sx + 100,
          y2: sy,
          width: 100,
          height: 0,
          dimOffset: -30,
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        };
      } else if (activeTool === 'leader') {
        previewToPlace = {
          id: 'preview_leader',
          type: 'leader',
          x: sx,
          y: sy,
          x2: sx + 40,
          y2: sy - 30,
          width: 40,
          height: 30,
          text: 'NOTE / CALLOUT',
          fontSize: 12,
          fontFamily: defaultStyle?.fontFamily || settings?.defaultFontFamily || 'titillium-web',
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          textColor: '#ffffff',
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        };
      } else if (activeTool === 'pen') {
        const pts = inter.polylinePoints || [];
        if (pts.length >= 2) {
          const xs = pts.map((p) => p.x);
          const ys = pts.map((p) => p.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);
          const relPoints = pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
          previewToPlace = {
            id: 'preview_pen',
            type: 'pen',
            x: minX,
            y: minY,
            width: Math.max(maxX - minX, 4),
            height: Math.max(maxY - minY, 4),
            points: relPoints,
            stroke: defaultStyle.stroke || '#38bdf8',
            strokeWidth: defaultStyle.strokeWidth || 2.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
            isCable: true,
            layerId: 'layer-cabling',
          };
        } else if (pts.length === 1) {
          const pt = pts[0];
          previewToPlace = {
            id: 'preview_pen',
            type: 'pen',
            x: pt.x,
            y: pt.y,
            width: 30,
            height: 4,
            points: [
              { x: 0, y: 0 },
              { x: 30, y: 0 },
            ],
            stroke: defaultStyle.stroke || '#38bdf8',
            strokeWidth: defaultStyle.strokeWidth || 2.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
            isCable: true,
            layerId: 'layer-cabling',
          };
        }
      }
    }

    if (previewToPlace) {
      if (activeLayerId) {
        setLayers((prev) =>
          prev.map((l) => (l.id === activeLayerId && !l.visible ? { ...l, visible: true } : l))
        );
      }
      const isSmartCablePreview = Boolean(previewToPlace.customProps?.isSmartCablePreview);
      const isLine = previewToPlace.type === 'line' || isSmartCablePreview;
      const isCableShape = isLine || previewToPlace.type === 'pen' || previewToPlace.type === 'polyline';
      const startX = isSmartCablePreview
        ? Number(previewToPlace.customProps?.rawStartX ?? previewToPlace.x)
        : previewToPlace.x;
      const startY = isSmartCablePreview
        ? Number(previewToPlace.customProps?.rawStartY ?? previewToPlace.y)
        : previewToPlace.y;
      let finalX2 = isSmartCablePreview
        ? Number(previewToPlace.customProps?.rawEndX ?? previewToPlace.x)
        : (previewToPlace.x2 ?? previewToPlace.x);
      let finalY2 = isSmartCablePreview
        ? Number(previewToPlace.customProps?.rawEndY ?? previewToPlace.y)
        : (previewToPlace.y2 ?? previewToPlace.y);

      if (isLine && activeDrawingPreview) {
        const epSnapEnd = snapToLineEndpoints({ x: finalX2, y: finalY2 }, objects, 20 / viewport.zoom);
        if (epSnapEnd.snapped) {
          finalX2 = epSnapEnd.x;
          finalY2 = epSnapEnd.y;
        }
      }

      if (isLine && Math.hypot(finalX2 - startX, finalY2 - startY) < 8) {
        inter.mode = 'none';
        setActiveDrawingPreview(null);
        return;
      }

      const isDim =
        previewToPlace.type === 'dim-h' ||
        previewToPlace.type === 'dim-v' ||
        previewToPlace.type === 'dim-aligned';

      let fromLabel = previewToPlace.fromLabel;
      let toLabel = previewToPlace.toLabel;

      if (isDim && (!fromLabel || !toLabel)) {
        const ptA = { x: startX, y: startY };
        const ptB = { x: finalX2, y: finalY2 };
        fromLabel = fromLabel || detectFeatureLabelAtPoint(ptA, objects, 'Origin Station', settings.scaleFactor);
        toLabel = toLabel || detectFeatureLabelAtPoint(ptB, objects, 'Target Station', settings.scaleFactor);
      }

      const targetLayerForObj =
        isCableShape
          ? 'layer-cabling'
          : activeLayerId;

      if (targetLayerForObj === 'layer-cabling') {
        setLayers((prev) =>
          prev.map((l) => (l.id === 'layer-cabling' && !l.visible ? { ...l, visible: true } : l))
        );
      }

      const finalObj: CADObject = {
        ...previewToPlace,
        type: isSmartCablePreview ? 'line' : previewToPlace.type,
        x: startX,
        y: startY,
        x2: finalX2,
        y2: finalY2,
        id: uid(),
        fromLabel,
        toLabel,
        layerId: targetLayerForObj,
        isCable: isCableShape ? true : previewToPlace.isCable,
        cableType: isCableShape ? inferCableType(previewToPlace) : previewToPlace.cableType,
      };

      let autoColor: ReturnType<typeof detectAutoColorForCable> = null;
      if (isCableShape) {
        autoColor = detectAutoColorForCable(finalObj, objects);
        if (autoColor) {
          finalObj.stroke = autoColor.stroke;
          finalObj.cableType = autoColor.cableType;
          finalObj.presetId = autoColor.presetId;
        }
      }

      const newObjs = [...objects, finalObj];
      recordHistory(newObjs);
      setSelectedIds([finalObj.id]);

      if (isCableShape) {
        const calc = calculateCableLength(finalObj, settings.scaleFactor);
        const lenStr = formatCableDisplay(calc.totalLengthM, settings);
        if (autoColor) {
          addToast(
            'success',
            `Auto-detected ${autoColor.label} cable • Length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft)`
          );
        } else {
          addToast(
            'success',
            previewToPlace.type === 'pen'
              ? `Freehand Cable route placed • Auto-calculated length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft)`
              : `Cable run placed • Auto-calculated length: ${lenStr} (${calc.totalLengthFt.toFixed(1)} ft)`
          );
        }
      } else if (previewToPlace.type === 'leader') {
        const leaderScreenPos = worldToScreen(finalObj.x2 ?? (finalObj.x + 40), finalObj.y2 ?? (finalObj.y - 30));
        setInlineEditor({
          objId: finalObj.id,
          field: 'text',
          text: finalObj.text || 'NOTE / CALLOUT',
          pos: leaderScreenPos,
          fontSize: finalObj.fontSize || 12,
          fontFamily: finalObj.fontFamily || settings.defaultFontFamily,
        });
        addToast('success', 'Callout placed • Edit note text directly or press Enter');
      } else {
        addToast('success', `Added ${previewToPlace.type}`);
      }
    }

    inter.mode = 'none';
    setActiveDrawingPreview(null);
  }
}
