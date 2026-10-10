import { CADObject, Point } from "../../types/cad";
import { getObjectBounds, rotatePoint } from "./bounds-handles";

export function distToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = v.x + t * (w.x - v.x);
  const projY = v.y + t * (w.y - v.y);
  return Math.hypot(p.x - projX, p.y - projY);
}

export function isPointInObject(p: Point, obj: CADObject, tolerance = 8): boolean {
  if (obj.type === 'line') {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x2 ?? obj.x + (obj.width || 0);
    const y2 = obj.y2 ?? obj.y + (obj.height || 0);
    const linePt = obj.rotation
      ? rotatePoint(p, { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }, -obj.rotation)
      : p;
    const hitTol = Math.max(tolerance, (obj.strokeWidth || 2) / 2 + 6);
    return distToSegment(linePt, { x: x1, y: y1 }, { x: x2, y: y2 }) <= hitTol;
  }

  if (obj.type === 'dim-h' || obj.type === 'dim-v' || obj.type === 'dim-aligned') {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x2 ?? obj.x + (obj.width || 0);
    const y2 = obj.y2 ?? obj.y + (obj.height || 0);
    const offset = obj.dimOffset ?? (obj.type === 'dim-v' ? 30 : -30);
    const hitTol = Math.max(tolerance, 10);

    if (obj.type === 'dim-h') {
      const dimY = Math.min(y1, y2) + offset;
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      if (distToSegment(p, { x: minX, y: dimY }, { x: maxX, y: dimY }) <= hitTol) return true;
      if (distToSegment(p, { x: x1, y: y1 }, { x: x1, y: dimY }) <= hitTol) return true;
      if (distToSegment(p, { x: x2, y: y2 }, { x: x2, y: dimY }) <= hitTol) return true;
      if (distToSegment(p, { x: x1, y: y1 }, { x: x2, y: y2 }) <= hitTol) return true;
      const offX = obj.labelOffsetX ?? obj.customProps?.labelOffsetX ?? 0;
      const offY = obj.labelOffsetY ?? obj.customProps?.labelOffsetY ?? 0;
      const midX = (minX + maxX) / 2 + offX;
      if (Math.abs(p.x - midX) <= 65 && Math.abs(p.y - (dimY + offY)) <= 18) return true;
    } else if (obj.type === 'dim-v') {
      const dimX = Math.max(x1, x2) + offset;
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      if (distToSegment(p, { x: dimX, y: minY }, { x: dimX, y: maxY }) <= hitTol) return true;
      if (distToSegment(p, { x: x1, y: y1 }, { x: dimX, y: y1 }) <= hitTol) return true;
      if (distToSegment(p, { x: x2, y: y2 }, { x: dimX, y: y2 }) <= hitTol) return true;
      if (distToSegment(p, { x: x1, y: y1 }, { x: x2, y: y2 }) <= hitTol) return true;
      const offX = obj.labelOffsetX ?? obj.customProps?.labelOffsetX ?? 0;
      const offY = obj.labelOffsetY ?? obj.customProps?.labelOffsetY ?? 0;
      const midY = (minY + maxY) / 2 + offY;
      if (Math.abs(p.x - (dimX + offX)) <= 30 && Math.abs(p.y - midY) <= 50) return true;
    } else if (obj.type === 'dim-aligned') {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const nx = -dy / len;
        const ny = dx / len;
        const d1x = x1 + nx * offset;
        const d1y = y1 + ny * offset;
        const d2x = x2 + nx * offset;
        const d2y = y2 + ny * offset;
        if (distToSegment(p, { x: d1x, y: d1y }, { x: d2x, y: d2y }) <= hitTol) return true;
        if (distToSegment(p, { x: x1, y: y1 }, { x: d1x, y: d1y }) <= hitTol) return true;
        if (distToSegment(p, { x: x2, y: y2 }, { x: d2x, y: d2y }) <= hitTol) return true;
        if (distToSegment(p, { x: x1, y: y1 }, { x: x2, y: y2 }) <= hitTol) return true;
      }
    }
  }

  let testPt = p;
  if (obj.rotation) {
    const cx = obj.x + (obj.width || 0) / 2;
    const cy = obj.y + (obj.height || 0) / 2;
    testPt = rotatePoint(p, { x: cx, y: cy }, -obj.rotation);
  }

  if (obj.type === 'leader') {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x2 ?? obj.x + 40;
    const y2 = obj.y2 ?? obj.y - 30;
    const isLeft = x2 < x1;
    const textLen = (obj.text || 'CALLOUT').length;
    const shelfLen = Math.max(36, textLen * 7.5);
    const x3 = isLeft ? x2 - shelfLen : x2 + shelfLen;

    if (distToSegment(testPt, { x: x1, y: y1 }, { x: x2, y: y2 }) <= tolerance) {
      return true;
    }
    if (distToSegment(testPt, { x: x2, y: y2 }, { x: x3, y: y2 }) <= tolerance) {
      return true;
    }
    const textMinX = Math.min(x2, x3) - tolerance;
    const textMaxX = Math.max(x2, x3) + tolerance;
    const textMinY = y2 - 22 - tolerance;
    const textMaxY = y2 + tolerance;
    return testPt.x >= textMinX && testPt.x <= textMaxX && testPt.y >= textMinY && testPt.y <= textMaxY;
  }

  if (obj.type === 'circle') {
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    const rx = obj.width / 2;
    const ry = obj.height / 2;
    const dx = (testPt.x - cx) / rx;
    const dy = (testPt.y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }

  if (obj.type === 'pen' || obj.type === 'polyline') {
    if (!obj.points || obj.points.length === 0) return false;
    for (let i = 0; i < obj.points.length - 1; i++) {
      const p1 = { x: obj.x + obj.points[i].x, y: obj.y + obj.points[i].y };
      const p2 = { x: obj.x + obj.points[i + 1].x, y: obj.y + obj.points[i + 1].y };
      if (distToSegment(testPt, p1, p2) <= tolerance) {
        return true;
      }
    }
    return false;
  }

  if (obj.isStencilLabel || (obj.type === 'text' && obj.parentId)) {
    const b = getObjectBounds(obj);
    return (
      testPt.x >= b.minX - tolerance / 2 &&
      testPt.x <= b.maxX + tolerance / 2 &&
      testPt.y >= b.minY - tolerance / 2 &&
      testPt.y <= b.maxY + tolerance / 2
    );
  }

  return (
    testPt.x >= obj.x - tolerance / 2 &&
    testPt.x <= obj.x + obj.width + tolerance / 2 &&
    testPt.y >= obj.y - tolerance / 2 &&
    testPt.y <= obj.y + obj.height + tolerance / 2
  );
}
