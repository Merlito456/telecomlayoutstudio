/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from "../../types/cad";
import { getRotatedObjectBounds, rotatePoint } from "./bounds-handles";

export interface LadderCenterline2D {
  id: string;
  obj: CADObject;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  halfW: number;
  length: number;
  isVert: boolean;
}

export function constrainCableSegmentAngle2D(
  startPt: { x: number; y: number },
  targetPt: { x: number; y: number },
  forceAngleSnap = false
): { x: number; y: number; angleDeg: number } {
  const dx = targetPt.x - startPt.x;
  const dy = targetPt.y - startPt.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) {
    return { x: targetPt.x, y: targetPt.y, angleDeg: 0 };
  }
  const rawAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  if (forceAngleSnap) {
    const nearest45 = Math.round(rawAngleDeg / 45) * 45;
    const snapRad = (nearest45 * Math.PI) / 180;
    return {
      x: Math.round(startPt.x + Math.cos(snapRad) * len),
      y: Math.round(startPt.y + Math.sin(snapRad) * len),
      angleDeg: ((nearest45 % 360) + 360) % 360,
    };
  }

  return {
    x: Math.round(targetPt.x),
    y: Math.round(targetPt.y),
    angleDeg: Math.round(((rawAngleDeg % 360) + 360) % 360),
  };
}

export function getLadderCenterline2D(o: CADObject): LadderCenterline2D {
  const cx = o.x + (o.width || 0) / 2;
  const cy = o.y + (o.height || 0) / 2;
  const w = o.width || 20;
  const h = o.height || 20;
  const isLocalHoriz = w >= h;
  const p1 = isLocalHoriz ? { x: cx - w / 2, y: cy } : { x: cx, y: cy - h / 2 };
  const p2 = isLocalHoriz ? { x: cx + w / 2, y: cy } : { x: cx, y: cy + h / 2 };
  const r1 = o.rotation ? rotatePoint(p1, { x: cx, y: cy }, o.rotation) : p1;
  const r2 = o.rotation ? rotatePoint(p2, { x: cx, y: cy }, o.rotation) : p2;
  const halfW = Math.max(8, Math.min(w, h) / 2);
  const length = Math.max(w, h);
  const lb = getRotatedObjectBounds(o);
  return {
    id: o.id,
    obj: o,
    ax: r1.x,
    ay: r1.y,
    bx: r2.x,
    by: r2.y,
    centerX: lb.centerX,
    centerY: lb.centerY,
    minX: lb.minX,
    maxX: lb.maxX,
    minY: lb.minY,
    maxY: lb.maxY,
    halfW,
    length,
    isVert: lb.height >= lb.width,
  };
}

export function projectPointOntoSegment2D(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { x: number; y: number; dist: number; t: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-6) return { x: ax, y: ay, dist: Math.hypot(px - ax, py - ay), t: 0 };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return { x, y, dist: Math.hypot(px - x, py - y), t };
}
