/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject, Point } from '../../types/cad';
import {
  findCabinetWallLTCAttachment2D,
  constrainCableSegmentAngle2D,
  isIndoorPoint2D,
} from '../../utils/cad-geometry';
import { uid } from '../../utils/cad-defaults';
import { CanvasInteractionContext } from './types';

export function handleMouseDownDrawingTools(
  e: React.MouseEvent<HTMLCanvasElement>,
  ctx: CanvasInteractionContext,
  screenPt: Point,
  rawWorld: Point,
  worldPt: Point
): void {
  const {
    objects,
    setSelectedIds,
    interactionRef,
    finalizePolyline,
    recordHistory,
    setActiveTool,
    activeTool,
    settings,
    worldToScreen,
    setInlineEditor,
    defaultStyle,
  } = ctx;

  if (activeTool === 'text') {
    const chosenFont = defaultStyle?.fontFamily || settings?.defaultFontFamily || 'titillium-web';
    const newObj: CADObject = {
      id: uid(),
      type: 'text',
      x: worldPt.x,
      y: worldPt.y,
      width: 80,
      height: 22,
      text: 'NEW LABEL',
      fontSize: 12,
      fontFamily: chosenFont,
      bold: true,
      textColor: '#38bdf8',
      bgColor: '#0f172a',
      stroke: '#0284c7',
      strokeWidth: 1,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.9,
      opacity: 1,
    };
    const newObjs = [...objects, newObj];
    recordHistory(newObjs);
    setSelectedIds([newObj.id]);
    setActiveTool('select');

    const screenCoord = worldToScreen(worldPt.x + 40, worldPt.y + 11);
    setInlineEditor({
      objId: newObj.id,
      text: 'NEW LABEL',
      pos: screenCoord,
      fontSize: 12,
      fontFamily: chosenFont,
    });
    return;
  }

  if (activeTool === 'line') {
    const pts = interactionRef.current.polylinePoints || [];
    const isIndoor = pts.length > 0 ? isIndoorPoint2D(rawWorld, objects) || isIndoorPoint2D(pts[0], objects) : isIndoorPoint2D(rawWorld, objects);
    const cabHit = isIndoor ? null : findCabinetWallLTCAttachment2D(rawWorld, pts[0] || null, objects, 2);

    if (pts.length === 0 || interactionRef.current.mode !== 'drawing') {
      const startPt: Point = cabHit
        ? { x: cabHit.wallX, y: cabHit.wallY }
        : { x: Math.round(rawWorld.x), y: Math.round(rawWorld.y) };

      interactionRef.current = {
        mode: 'drawing',
        startScreen: screenPt,
        startWorld: startPt,
        currentWorld: startPt,
        polylinePoints: [startPt],
      };
      return;
    }

    // Second click: Immediately complete the 2-point straight cable line
    const p1 = pts[0];
    const constrained = constrainCableSegmentAngle2D(
      p1,
      rawWorld,
      settings.orthoMode || e.shiftKey
    );
    const p2: Point = cabHit
      ? { x: cabHit.wallX, y: cabHit.wallY }
      : { x: constrained.x, y: constrained.y };

    if (Math.hypot(p2.x - p1.x, p2.y - p1.y) >= 4) {
      finalizePolyline([p1, p2], cabHit?.cabinetName);
    }
    return;
  }

  if (activeTool === 'polyline') {
    const pts = interactionRef.current.polylinePoints || [];
    const lastPt = pts.length > 0 ? pts[pts.length - 1] : null;
    const isIndoor = isIndoorPoint2D(rawWorld, objects) || (lastPt ? isIndoorPoint2D(lastPt, objects) : false);
    const cabHit = isIndoor ? null : findCabinetWallLTCAttachment2D(rawWorld, lastPt, objects, 2);

    if (pts.length === 0 || interactionRef.current.mode !== 'drawing') {
      const startPt: Point = cabHit
        ? { x: cabHit.wallX, y: cabHit.wallY }
        : { x: Math.round(rawWorld.x), y: Math.round(rawWorld.y) };

      interactionRef.current = {
        mode: 'drawing',
        startScreen: screenPt,
        startWorld: startPt,
        currentWorld: startPt,
        polylinePoints: [startPt],
      };
      return;
    }

    if (lastPt) {
      if (cabHit && Math.hypot(cabHit.wallX - lastPt.x, cabHit.wallY - lastPt.y) >= 5) {
        const nextPts = [...pts, { x: cabHit.wallX, y: cabHit.wallY }];
        finalizePolyline(nextPts, cabHit.cabinetName);
        return;
      }

      const constrained = constrainCableSegmentAngle2D(
        lastPt,
        rawWorld,
        settings.orthoMode || e.shiftKey
      );
      const nextPt: Point = { x: constrained.x, y: constrained.y };

      if (Math.hypot(nextPt.x - lastPt.x, nextPt.y - lastPt.y) < 5) {
        if (pts.length >= 2) {
          finalizePolyline(pts);
        }
        return;
      }

      interactionRef.current.polylinePoints = [...pts, nextPt];
      interactionRef.current.startWorld = nextPt;
      interactionRef.current.currentWorld = nextPt;
    }
    return;
  }

  if (activeTool === 'pen') {
    interactionRef.current = {
      mode: 'drawing',
      startScreen: screenPt,
      startWorld: worldPt,
      currentWorld: worldPt,
      polylinePoints: [worldPt],
    };
    return;
  }

  // Rect, Circle, Dim-H, Dim-V
  interactionRef.current = {
    mode: 'drawing',
    startScreen: screenPt,
    startWorld: worldPt,
    currentWorld: worldPt,
  };
}
