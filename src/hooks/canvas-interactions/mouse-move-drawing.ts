/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Point } from '../../types/cad';
import {
  applyOrtho,
  formatMeasurement,
  findCabinetWallLTCAttachment2D,
  constrainCableSegmentAngle2D,
  isIndoorPoint2D,
} from '../../utils/cad-geometry';
import { CanvasInteractionContext } from './types';

export function handleMouseMoveDrawing(
  e: React.MouseEvent<HTMLCanvasElement>,
  worldPt: Point,
  screenPt: Point,
  rawWorld: Point,
  ctx: CanvasInteractionContext
): void {
  const {
    settings,
    objects,
    interactionRef,
    activeTool,
    defaultStyle,
    setActiveDrawingPreview,
    setMeasureTooltip,
  } = ctx;

  const inter = interactionRef.current;
  if (inter.mode !== 'drawing') return;

  let cur = worldPt;
  if (activeTool !== 'pen' && (settings.orthoMode || e.shiftKey)) {
    cur = applyOrtho(inter.startWorld, cur);
  }

  if (activeTool === 'pen' && inter.polylinePoints) {
    inter.polylinePoints.push(worldPt);
    const xs = inter.polylinePoints.map((p) => p.x);
    const ys = inter.polylinePoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const relPoints = inter.polylinePoints.map((p) => ({ x: p.x - minX, y: p.y - minY }));

    setActiveDrawingPreview({
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
      opacity: 0.95,
      layerId: 'layer-cabling',
      isCable: true,
    });

    let totalDistPx = 0;
    for (let i = 0; i < inter.polylinePoints.length - 1; i++) {
      totalDistPx += Math.hypot(
        inter.polylinePoints[i + 1].x - inter.polylinePoints[i].x,
        inter.polylinePoints[i + 1].y - inter.polylinePoints[i].y
      );
    }
    const totalMeters = totalDistPx / Math.max(0.1, settings.scaleFactor);
    const totalLengthStr =
      settings.unit === 'ft'
        ? `${(totalMeters * 3.28084).toFixed(2)} ft`
        : `${totalMeters.toFixed(2)} m`;

    setMeasureTooltip({
      text: `⚡ Freehand Cable Run: ${totalLengthStr} (${inter.polylinePoints.length} pts) • Release mouse to finish`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return;
  }

  if (
    (activeTool === 'line' || activeTool === 'polyline') &&
    inter.polylinePoints &&
    inter.polylinePoints.length > 0
  ) {
    const lastPt = inter.polylinePoints[inter.polylinePoints.length - 1];
    const isIndoor = isIndoorPoint2D(rawWorld, objects) || isIndoorPoint2D(lastPt, objects);
    const cabHit = isIndoor ? null : findCabinetWallLTCAttachment2D(rawWorld, lastPt, objects, 2);
    let targetPt: Point;
    let angleDeg = 0;

    if (cabHit && Math.hypot(cabHit.wallX - lastPt.x, cabHit.wallY - lastPt.y) >= 5) {
      targetPt = { x: cabHit.wallX, y: cabHit.wallY };
      angleDeg = Math.round(
        (((Math.atan2(targetPt.y - lastPt.y, targetPt.x - lastPt.x) * 180) / Math.PI) + 360) % 360
      );
    } else {
      const constrained = constrainCableSegmentAngle2D(
        lastPt,
        rawWorld,
        settings.orthoMode || e.shiftKey
      );
      targetPt = { x: constrained.x, y: constrained.y };
      angleDeg = constrained.angleDeg;
    }

    const previewPts = [...inter.polylinePoints, targetPt];
    const segLen = Math.hypot(targetPt.x - lastPt.x, targetPt.y - lastPt.y);
    let totalDistPx = 0;
    for (let i = 0; i < previewPts.length - 1; i++) {
      totalDistPx += Math.hypot(previewPts[i + 1].x - previewPts[i].x, previewPts[i + 1].y - previewPts[i].y);
    }
    const totalMeters = totalDistPx / Math.max(0.1, settings.scaleFactor);
    const segMetersStr = formatMeasurement(segLen, settings.scaleFactor, settings.unit);
    const totalLengthStr = settings.unit === 'ft' ? `${(totalMeters * 3.28084).toFixed(2)} ft` : `${totalMeters.toFixed(2)} m`;

    if (previewPts.length === 2) {
      setActiveDrawingPreview({
        id: 'preview_line',
        type: 'line',
        x: previewPts[0].x,
        y: previewPts[0].y,
        x2: previewPts[1].x,
        y2: previewPts[1].y,
        width: Math.abs(previewPts[1].x - previewPts[0].x),
        height: Math.abs(previewPts[1].y - previewPts[0].y),
        stroke: defaultStyle.stroke,
        strokeWidth: defaultStyle.strokeWidth,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 0.9,
      });
    } else {
      const minX = Math.min(...previewPts.map((p) => p.x));
      const minY = Math.min(...previewPts.map((p) => p.y));
      const maxX = Math.max(...previewPts.map((p) => p.x));
      const maxY = Math.max(...previewPts.map((p) => p.y));
      const relPoints = previewPts.map((p) => ({ x: p.x - minX, y: p.y - minY }));

      setActiveDrawingPreview({
        id: 'preview_polyline',
        type: 'polyline',
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 4),
        height: Math.max(maxY - minY, 4),
        points: relPoints,
        stroke: defaultStyle.stroke,
        strokeWidth: defaultStyle.strokeWidth,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 0.9,
      });
    }

    if (isIndoor) {
      setMeasureTooltip({
        text: `⚡ Indoor Cable (Free Straight Run): ${totalLengthStr} (Seg: ${segMetersStr}, ${angleDeg}°) • Click next waypoint • Enter/RClick to finish`,
        x: screenPt.x,
        y: screenPt.y,
      });
    } else if (cabHit && Math.hypot(cabHit.wallX - lastPt.x, cabHit.wallY - lastPt.y) >= 6) {
      setMeasureTooltip({
        text: `⚡ LTC Connector (${cabHit.cabinetName}) • Total Cable: ${totalLengthStr} • Click to attach & finish`,
        x: screenPt.x,
        y: screenPt.y,
      });
    } else {
      setMeasureTooltip({
        text: `⚡ Cable Length: ${totalLengthStr} (Seg: ${segMetersStr}, ${angleDeg}°) • Click to add waypoint • Enter/RClick to finish`,
        x: screenPt.x,
        y: screenPt.y,
      });
    }
    return;
  }

  const dx = cur.x - inter.startWorld.x;
  const dy = cur.y - inter.startWorld.y;
  const dist = Math.hypot(dx, dy);

  if (activeTool === 'rectangle') {
    const x = Math.min(inter.startWorld.x, cur.x);
    const y = Math.min(inter.startWorld.y, cur.y);
    const w = Math.abs(dx);
    const h = Math.abs(dy);
    setActiveDrawingPreview({
      id: 'preview_rect',
      type: 'rectangle',
      x,
      y,
      width: w,
      height: h,
      stroke: defaultStyle.stroke,
      strokeWidth: defaultStyle.strokeWidth,
      fill: defaultStyle.fill,
      fillEnabled: defaultStyle.fillEnabled,
      fillOpacity: defaultStyle.fillOpacity,
      opacity: 0.8,
    });
    setMeasureTooltip({
      text: `W: ${formatMeasurement(w, settings.scaleFactor, settings.unit)} × H: ${formatMeasurement(h, settings.scaleFactor, settings.unit)}`,
      x: screenPt.x,
      y: screenPt.y,
    });
  } else if (activeTool === 'circle') {
    const r = dist;
    setActiveDrawingPreview({
      id: 'preview_circle',
      type: 'circle',
      x: inter.startWorld.x - r,
      y: inter.startWorld.y - r,
      width: r * 2,
      height: r * 2,
      stroke: defaultStyle.stroke,
      strokeWidth: defaultStyle.strokeWidth,
      fill: defaultStyle.fill,
      fillEnabled: defaultStyle.fillEnabled,
      fillOpacity: defaultStyle.fillOpacity,
      opacity: 0.8,
    });
    setMeasureTooltip({
      text: `Radius: ${formatMeasurement(r, settings.scaleFactor, settings.unit)} (Dia: ${formatMeasurement(r * 2, settings.scaleFactor, settings.unit)})`,
      x: screenPt.x,
      y: screenPt.y,
    });
  } else if (activeTool === 'dim-h') {
    const x1 = inter.startWorld.x;
    const x2 = cur.x;
    const y = inter.startWorld.y;
    setActiveDrawingPreview({
      id: 'preview_dim_h',
      type: 'dim-h',
      x: x1,
      y,
      x2,
      y2: y,
      width: Math.abs(x2 - x1),
      height: 0,
      dimOffset: -20,
      fromLabel: 'Origin Pt',
      toLabel: 'Target Pt',
      stroke: '#38bdf8',
      strokeWidth: 1.5,
      fill: 'transparent',
      fillEnabled: false,
      fillOpacity: 0,
      opacity: 1,
    });
    setMeasureTooltip({
      text: `Dim: ${formatMeasurement(Math.abs(x2 - x1), settings.scaleFactor, settings.unit)} (FROM Origin ➔ TO Target)`,
      x: screenPt.x,
      y: screenPt.y,
    });
  } else if (activeTool === 'dim-v') {
    const x = inter.startWorld.x;
    const y1 = inter.startWorld.y;
    const y2 = cur.y;
    setActiveDrawingPreview({
      id: 'preview_dim_v',
      type: 'dim-v',
      x,
      y: y1,
      x2: x,
      y2,
      width: 0,
      height: Math.abs(y2 - y1),
      dimOffset: 30,
      fromLabel: 'Top Pt',
      toLabel: 'Bottom Pt',
      stroke: '#38bdf8',
      strokeWidth: 1.5,
      fill: 'transparent',
      fillEnabled: false,
      fillOpacity: 0,
      opacity: 1,
    });
    setMeasureTooltip({
      text: `Dim: ${formatMeasurement(Math.abs(y2 - y1), settings.scaleFactor, settings.unit, settings.dimensionUnitFormat)} (FROM Top ➔ TO Bottom)`,
      x: screenPt.x,
      y: screenPt.y,
    });
  } else if (activeTool === 'dim-aligned') {
    const x1 = inter.startWorld.x;
    const y1 = inter.startWorld.y;
    const x2 = cur.x;
    const y2 = cur.y;
    const len = Math.hypot(x2 - x1, y2 - y1);
    setActiveDrawingPreview({
      id: 'preview_dim_aligned',
      type: 'dim-aligned',
      x: x1,
      y: y1,
      x2,
      y2,
      width: len,
      height: 0,
      dimOffset: -30,
      fromLabel: 'Start Pt',
      toLabel: 'End Pt',
      stroke: '#38bdf8',
      strokeWidth: 1.5,
      fill: 'transparent',
      fillEnabled: false,
      fillOpacity: 0,
      opacity: 1,
    });
    setMeasureTooltip({
      text: `Aligned Dim: ${formatMeasurement(len, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat)} (FROM Start ➔ TO End)`,
      x: screenPt.x,
      y: screenPt.y,
    });
  } else if (activeTool === 'leader') {
    const x1 = inter.startWorld.x;
    const y1 = inter.startWorld.y;
    const x2 = cur.x;
    const y2 = cur.y;
    setActiveDrawingPreview({
      id: 'preview_leader',
      type: 'leader',
      x: x1,
      y: y1,
      x2,
      y2,
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      text: 'NOTE / CALLOUT',
      stroke: '#38bdf8',
      strokeWidth: 1.5,
      textColor: '#ffffff',
      fill: 'transparent',
      fillEnabled: false,
      fillOpacity: 0,
      opacity: 1,
    });
    setMeasureTooltip({
      text: 'Leader Callout',
      x: screenPt.x,
      y: screenPt.y,
    });
  }
}
