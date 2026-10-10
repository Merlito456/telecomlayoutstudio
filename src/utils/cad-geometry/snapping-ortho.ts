import { CADObject, Point, SnapResult } from "../../types/cad";
import { distToSegment, getObjectBounds } from "./bounds-handles";

export interface EndpointSnapResult {
  x: number;
  y: number;
  snapped: boolean;
  targetLineId?: string;
  end?: 'start' | 'end';
}

/**
 * Dedicated line endpoint connect detector.
 * Connects 100% precisely to the start or end of any line when cursor hovers near,
 * without any magnetic pulling towards parallel lines or bounding boxes.
 */
export function snapToLineEndpoints(
  p: Point,
  allObjects: CADObject[],
  toleranceWorld = 16,
  excludeId?: string
): EndpointSnapResult {
  let bestDist = toleranceWorld;
  let result: EndpointSnapResult = { x: p.x, y: p.y, snapped: false };

  for (const obj of allObjects) {
    if (excludeId && obj.id === excludeId) continue;
    if (obj.type !== 'line') continue;

    const startPt = { x: obj.x, y: obj.y };
    const endPt = {
      x: obj.x2 ?? obj.x + obj.width,
      y: obj.y2 ?? obj.y + (obj.height || 0),
    };

    const dStart = Math.hypot(startPt.x - p.x, startPt.y - p.y);
    if (dStart < bestDist) {
      bestDist = dStart;
      result = {
        x: startPt.x,
        y: startPt.y,
        snapped: true,
        targetLineId: obj.id,
        end: 'start',
      };
    }

    const dEnd = Math.hypot(endPt.x - p.x, endPt.y - p.y);
    if (dEnd < bestDist) {
      bestDist = dEnd;
      result = {
        x: endPt.x,
        y: endPt.y,
        snapped: true,
        targetLineId: obj.id,
        end: 'end',
      };
    }
  }

  return result;
}

export function snapPoint(
  p: Point,
  gridSize: number,
  gridSnap: boolean,
  objectSnap: boolean,
  allObjects: CADObject[],
  excludeIds: string[] = [],
  toleranceWorld = 12
): SnapResult {
  let bestDist = toleranceWorld;
  let result: SnapResult = { x: p.x, y: p.y, snapped: false };

  // Object snapping: test endpoints, centers, midpoints of other objects
  if (objectSnap) {
    for (const obj of allObjects) {
      if (excludeIds.includes(obj.id)) continue;
      const candidates: Point[] = [];
      const b = getObjectBounds(obj);

      // Corners & center
      candidates.push({ x: b.minX, y: b.minY });
      candidates.push({ x: b.maxX, y: b.minY });
      candidates.push({ x: b.minX, y: b.maxY });
      candidates.push({ x: b.maxX, y: b.maxY });
      candidates.push({ x: b.centerX, y: b.centerY });

      // Midpoints
      candidates.push({ x: b.centerX, y: b.minY });
      candidates.push({ x: b.centerX, y: b.maxY });
      candidates.push({ x: b.minX, y: b.centerY });
      candidates.push({ x: b.maxX, y: b.centerY });

      // Exact Tower Leg Centers for dimensioning & alignment to walls / fences
      const sid = obj.stencilId || obj.customProps?.stencilType;
      if (sid === '4leg-tower' || sid === 'tower-4leg') {
        const pierSize = Math.max(16, Math.min(Math.min(b.width, b.height) * 0.15, 26));
        const padOffset = pierSize / 2;
        candidates.push({ x: b.minX + padOffset, y: b.minY + padOffset });
        candidates.push({ x: b.maxX - padOffset, y: b.minY + padOffset });
        candidates.push({ x: b.maxX - padOffset, y: b.maxY - padOffset });
        candidates.push({ x: b.minX + padOffset, y: b.maxY - padOffset });
      } else if (sid === '3leg-tower' || sid === 'tower-3leg') {
        const pR = Math.max(12, Math.min(Math.min(b.width, b.height) * 0.115, 18));
        candidates.push({ x: b.centerX, y: b.minY + pR });
        candidates.push({ x: b.maxX - pR, y: b.maxY - pR });
        candidates.push({ x: b.minX + pR, y: b.maxY - pR });
      }

      if (obj.x2 !== undefined && obj.y2 !== undefined) {
        candidates.push({ x: obj.x, y: obj.y });
        candidates.push({ x: obj.x2, y: obj.y2 });
        candidates.push({ x: (obj.x + obj.x2) / 2, y: (obj.y + obj.y2) / 2 });
      }

      for (const cand of candidates) {
        const d = Math.hypot(cand.x - p.x, cand.y - p.y);
        if (d < bestDist) {
          bestDist = d;
          result = {
            x: cand.x,
            y: cand.y,
            snapped: true,
            snapType: 'endpoint',
            targetObjId: obj.id,
          };
        }
      }
    }
  }

  // If not snapped to object, test grid snap
  if (!result.snapped && gridSnap && gridSize > 0) {
    const gx = Math.round(p.x / gridSize) * gridSize;
    const gy = Math.round(p.y / gridSize) * gridSize;
    result = {
      x: gx,
      y: gy,
      snapped: true,
      snapType: 'grid',
    };
  }

  return result;
}


export function applyOrtho(start: Point, current: Point): Point {
  const dx = Math.abs(current.x - start.x);
  const dy = Math.abs(current.y - start.y);
  if (dx >= dy) {
    return { x: current.x, y: start.y };
  } else {
    return { x: start.x, y: current.y };
  }
}

/**
 * Standard CAD: Automatically generates standard witness & dimension lines with FROM - TO labels
 */
