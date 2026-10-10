import { CADObject, Point } from "../../types/cad";
import { getObjectBounds, getRotatedObjectBounds } from "./bounds-handles";

export function alignObjectFlushToWall(
  obj: CADObject,
  allObjects: CADObject[]
): { x: number; y: number; rotation: number; wallName: string; wallHeightM?: number } | null {
  const objW = obj.width || 44;
  const objH = obj.height || 26;
  const objCenter = {
    x: obj.x + objW / 2,
    y: obj.y + objH / 2,
  };

  interface WallSegment {
    p1: Point;
    p2: Point;
    outwardNormal: Point;
    angleDeg: number;
    name: string;
  }

  const segments: WallSegment[] = [];

  for (const o of allObjects) {
    if (o.id === obj.id || o.parentId === obj.id || obj.parentId === o.id) continue;
    if (o.type === 'dim-h' || o.type === 'dim-v' || o.type === 'dim-aligned' || o.type === 'leader') continue;

    const sId = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    const isWallLike =
      sId.includes('wall') ||
      sId.includes('shelter') ||
      sId.includes('fence') ||
      sId.includes('gate') ||
      o.customProps?.isWall ||
      (o.type === 'line' && Math.hypot((o.x2 ?? o.x) - o.x, (o.y2 ?? o.y) - o.y) > 15);

    if (!isWallLike) continue;

    const wallName =
      sId.includes('shelter')
        ? 'Shelter Wall'
        : sId.includes('fence')
        ? 'Compound Fence'
        : sId.includes('wall')
        ? 'Perimeter Wall'
        : 'Wall Segment';

    if (o.type === 'line') {
      const x1 = o.x;
      const y1 = o.y;
      const x2 = o.x2 ?? o.x;
      const y2 = o.y2 ?? o.y;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len < 5) continue;

      const nx = -dy / len;
      const ny = dx / len;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dot = (objCenter.x - midX) * nx + (objCenter.y - midY) * ny;
      const effNx = dot >= 0 ? nx : -nx;
      const effNy = dot >= 0 ? ny : -ny;
      const angleDeg = (Math.atan2(effNy, effNx) * 180) / Math.PI - 90;

      segments.push({
        p1: { x: x1, y: y1 },
        p2: { x: x2, y: y2 },
        outwardNormal: { x: effNx, y: effNy },
        angleDeg: (Math.round(angleDeg / 5) * 5 + 360) % 360,
        name: wallName,
      });
    } else {
      // Rectangle or box-shaped stencil: compute 4 edges
      const b = getObjectBounds(o);
      const rot = ((o.rotation || 0) * Math.PI) / 180;
      const cx = b.centerX;
      const cy = b.centerY;
      const hw = b.width / 2;
      const hh = b.height / 2;

      const localCorners = [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh },
      ];

      const worldCorners = localCorners.map((c) => ({
        x: cx + c.x * Math.cos(rot) - c.y * Math.sin(rot),
        y: cy + c.x * Math.sin(rot) + c.y * Math.cos(rot),
      }));

      for (let i = 0; i < 4; i++) {
        const p1 = worldCorners[i];
        const p2 = worldCorners[(i + 1) % 4];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len < 4) continue;

        const edgeMidX = (p1.x + p2.x) / 2;
        const edgeMidY = (p1.y + p2.y) / 2;
        let nx = edgeMidX - cx;
        let ny = edgeMidY - cy;
        const nLen = Math.hypot(nx, ny);
        if (nLen > 0.001) {
          nx /= nLen;
          ny /= nLen;
        } else {
          nx = -dy / len;
          ny = dx / len;
        }

        const angleDeg = (Math.atan2(ny, nx) * 180) / Math.PI - 90;
        segments.push({
          p1,
          p2,
          outwardNormal: { x: nx, y: ny },
          angleDeg: (Math.round(angleDeg / 5) * 5 + 360) % 360,
          name: wallName,
        });
      }
    }
  }

  if (segments.length === 0) return null;

  // Find nearest segment to objCenter
  let bestDist = Infinity;
  let bestSeg: WallSegment | null = null;
  let bestProj: Point | null = null;

  for (const seg of segments) {
    const vx = seg.p2.x - seg.p1.x;
    const vy = seg.p2.y - seg.p1.y;
    const segLenSq = vx * vx + vy * vy;
    if (segLenSq === 0) continue;

    const wx = objCenter.x - seg.p1.x;
    const wy = objCenter.y - seg.p1.y;
    const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / segLenSq));
    const projX = seg.p1.x + t * vx;
    const projY = seg.p1.y + t * vy;
    const dist = Math.hypot(objCenter.x - projX, objCenter.y - projY);

    if (dist < bestDist) {
      bestDist = dist;
      bestSeg = seg;
      bestProj = { x: projX, y: projY };
    }
  }

  if (!bestSeg || !bestProj) return null;

  // Mount flush: center is offset by objH / 2 in outward normal direction from wall edge
  const mountMargin = 0.5;
  const newCenterX = bestProj.x + bestSeg.outwardNormal.x * (objH / 2 + mountMargin);
  const newCenterY = bestProj.y + bestSeg.outwardNormal.y * (objH / 2 + mountMargin);

  const wallHeightM = bestSeg.name.includes('Shelter')
    ? 2.12
    : bestSeg.name.includes('Fence')
    ? 2.0
    : 2.2;

  return {
    x: Math.round(newCenterX - objW / 2),
    y: Math.round(newCenterY - objH / 2),
    rotation: bestSeg.angleDeg,
    wallName: bestSeg.name,
    wallHeightM,
  };
}

// ============================================================================
// INTELLIGENT CABLE LADDER DETECTION & SMART MULTI-LADDER ROUTING ENGINE
// ============================================================================

