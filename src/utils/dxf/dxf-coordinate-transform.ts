/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Point } from "../../types/cad";
import { sanitizeLayerName } from "./dxf-export";
import { RawEntity } from "./dxf-types";

export interface DXFBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  rawSpanX: number;
  rawSpanY: number;
}

export function computeDXFBounds(entities: RawEntity[]): DXFBounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const updateBounds = (pt: Point) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  };

  entities.forEach((ent) => {
    ent.points.forEach(updateBounds);

    if (ent.defPt1) updateBounds(ent.defPt1);
    if (ent.defPt2) updateBounds(ent.defPt2);
    if (ent.dimPt) updateBounds(ent.dimPt);

    if ((ent.type === 'CIRCLE' || ent.type === 'ARC') && ent.radius && ent.points[0]) {
      const cx = ent.points[0].x;
      const cy = ent.points[0].y;
      const r = ent.radius;
      if (cx - r < minX) minX = cx - r;
      if (cx + r > maxX) maxX = cx + r;
      if (cy - r < minY) minY = cy - r;
      if (cy + r > maxY) maxY = cy + r;
    }
  });

  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    minX = 0;
    maxX = 50;
    minY = 0;
    maxY = 50;
  }

  const rawSpanX = Math.max(maxX - minX, 0.5);
  const rawSpanY = Math.max(maxY - minY, 0.5);

  return { minX, maxX, minY, maxY, rawSpanX, rawSpanY };
}

export function resolveDXFUnit(
  headerInsUnits: number | null,
  headerMeasurement: number | null,
  rawSpanX: number,
  rawSpanY: number
): { unitMultiplier: number; unitName: string } {
  let unitMultiplier = 1.0; // default meters
  let unitName = 'Meters';

  if (headerInsUnits !== null && headerInsUnits > 0) {
    switch (headerInsUnits) {
      case 1: // Inches
        unitMultiplier = 0.0254;
        unitName = 'Inches';
        break;
      case 2: // Feet
        unitMultiplier = 0.3048;
        unitName = 'Feet';
        break;
      case 4: // Millimeters
        unitMultiplier = 0.001;
        unitName = 'Millimeters';
        break;
      case 5: // Centimeters
        unitMultiplier = 0.01;
        unitName = 'Centimeters';
        break;
      case 6: // Meters
        unitMultiplier = 1.0;
        unitName = 'Meters';
        break;
      case 7: // Kilometers
        unitMultiplier = 1000.0;
        unitName = 'Kilometers';
        break;
    }
  } else if (headerMeasurement === 0) {
    // Imperial without INSUNITS
    if (rawSpanX > 300 || rawSpanY > 300) {
      unitMultiplier = 0.0254; // Inches
      unitName = 'Inches';
    } else {
      unitMultiplier = 0.3048; // Feet
      unitName = 'Feet';
    }
  } else {
    // Metric heuristic: In telecom drafting, compounds/sites are 5m - 200m.
    // If spans or coordinates are > 300, it is drawn in Millimeters (e.g. 15,000mm = 15m)
    if (rawSpanX > 300 || rawSpanY > 300) {
      unitMultiplier = 0.001;
      unitName = 'Millimeters';
    } else {
      unitMultiplier = 1.0;
      unitName = 'Meters';
    }
  }

  return { unitMultiplier, unitName };
}

export function calculateDXFProjection(
  bounds: DXFBounds,
  unitMultiplier: number,
  targetScaleFactor: number,
  canvasW: number,
  canvasH: number
): {
  effectiveScale: number;
  offsetX: number;
  offsetY: number;
  cadToCanvas: (pt: Point) => Point;
} {
  const metersSpanX = bounds.rawSpanX * unitMultiplier;
  const metersSpanY = bounds.rawSpanY * unitMultiplier;

  let effectiveScale = targetScaleFactor;
  const maxAllowablePxW = canvasW * 0.85;
  const maxAllowablePxH = canvasH * 0.85;

  if (metersSpanX * targetScaleFactor > maxAllowablePxW || metersSpanY * targetScaleFactor > maxAllowablePxH) {
    const rawFit = Math.min(maxAllowablePxW / metersSpanX, maxAllowablePxH / metersSpanY);
    const standardScales = [1, 2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 100];
    const bestFit = standardScales.reverse().find((s) => s <= rawFit) || Math.max(1, Math.floor(rawFit));
    effectiveScale = bestFit;
  }

  const pixelSpanX = metersSpanX * effectiveScale;
  const pixelSpanY = metersSpanY * effectiveScale;
  const offsetX = Math.max(40, Math.round((canvasW - pixelSpanX) / 2));
  const offsetY = Math.max(40, Math.round((canvasH - pixelSpanY) / 2));

  const cadToCanvas = (pt: Point): Point => {
    const normX = (pt.x - bounds.minX) * unitMultiplier;
    const normY = (bounds.maxY - pt.y) * unitMultiplier; // Invert Y
    return {
      x: Math.round(offsetX + normX * effectiveScale),
      y: Math.round(offsetY + normY * effectiveScale),
    };
  };

  return { effectiveScale, offsetX, offsetY, cadToCanvas };
}

export function aciToHex(aci?: number): string {
  switch (aci) {
    case 1:
      return '#ef4444'; // Red
    case 2:
      return '#facc15'; // Yellow
    case 3:
      return '#22c55e'; // Green
    case 4:
      return '#38bdf8'; // Cyan
    case 5:
      return '#3b82f6'; // Blue
    case 6:
      return '#ec4899'; // Magenta
    case 8:
    case 9:
      return '#94a3b8'; // Slate Gray
    case 30:
      return '#f97316'; // Orange
    case 7:
    default:
      return '#f8fafc'; // White / Light Slate
  }
}

export function resolveLayerId(layerName: string): string {
  const lower = (layerName || '').toLowerCase();
  if (lower.includes('tower') || lower.includes('mast') || lower.includes('pole')) return 'layer-towers';
  if (lower.includes('power') || lower.includes('gen') || lower.includes('ecb') || lower.includes('ats')) return 'layer-power';
  if (lower.includes('cab') || lower.includes('rack') || lower.includes('odc') || lower.includes('eq')) return 'layer-cabinets';
  if (lower.includes('tray') || lower.includes('bridge') || lower.includes('ladder') || lower.includes('cable')) return 'layer-cabling';
  if (lower.includes('pad') || lower.includes('slab') || lower.includes('plinth') || lower.includes('conc')) return 'layer-basepads';
  if (lower.includes('dim') || lower.includes('annot') || lower.includes('note') || lower.includes('text')) return 'layer-annotations';
  if (lower.includes('fence') || lower.includes('wall') || lower.includes('gate') || lower.includes('bound')) return 'layer-civil';
  return 'layer-' + sanitizeLayerName(layerName).toLowerCase();
}
