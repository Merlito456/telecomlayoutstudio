import { CADObject } from '../../types/cad';
import { getRotatedObjectBounds } from './bounds-handles';
import { isCableLadderObject, isBasepadObject } from './cable-predicates';
import { getLadderCenterline2D, projectPointOntoSegment2D } from './ladder-geometry';
import { createEdgeCostEvaluator } from './cable-routing/edge-cost-evaluator';
import { runDijkstraGridRouter } from './cable-routing/dijkstra-router';
import { measurePathOnLadderLength } from './cable-routing/path-measurements';

export * from './cable-predicates';
export * from './ladder-geometry';
export * from './cable-routing/path-measurements';

/**
 * Intelligent Multi-Ladder Network Router:
 * Automatically detects all Cable Ladders & Connecting Ladders in `allObjs`,
 * snaps onto the nearest ladder lane, follows the ladder network (including T-junctions,
 * L-corners, and horizontal connecting bridges between basepads) all the way to the target,
 * and steps cleanly into the terminal endpoint.
 */
export function computeSmartCableRoute2D(
  startPt: { x: number; y: number },
  endPt: { x: number; y: number },
  allObjs: CADObject[],
  orthoMode = true,
  excludeCableId?: string
): Array<{ x: number; y: number }> {
  const sx = Math.round(startPt.x);
  const sy = Math.round(startPt.y);
  const ex = Math.round(endPt.x);
  const ey = Math.round(endPt.y);

  if (Math.hypot(ex - sx, ey - sy) < 4) {
    return [
      { x: sx, y: sy },
      { x: ex, y: ey },
    ];
  }

  const rawLadders = allObjs.filter(isCableLadderObject).map(getLadderCenterline2D);

  if (rawLadders.length === 0 && !orthoMode) {
    return [
      { x: sx, y: sy },
      { x: ex, y: ey },
    ];
  }

  const ladders = rawLadders.map((base) => {
    const dx = base.bx - base.ax;
    const dy = base.by - base.ay;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const ext = 380;
    return {
      ...base,
      extAx: base.ax - ux * ext,
      extAy: base.ay - uy * ext,
      extBx: base.bx + ux * ext,
      extBy: base.by + uy * ext,
    };
  });

  const basepads = allObjs
    .filter((o) => {
      if (!isBasepadObject(o)) return false;
      const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
      return s !== 'cement-slab';
    })
    .map(getRotatedObjectBounds);

  const cabinets = allObjs
    .filter((o) => {
      if (o.isStencilLabel) return false;
      const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
      return (
        s.includes('cabinet') ||
        s.includes('odc') ||
        s.includes('eltek') ||
        s.includes('huawei') ||
        s.includes('ericsson') ||
        s.includes('fushan') ||
        s.includes('fh') ||
        s.includes('1bay') ||
        s.includes('2bay') ||
        s.includes('3bay')
      );
    })
    .map(getRotatedObjectBounds);

  const rawXs: number[] = [sx, ex];
  const rawYs: number[] = [sy, ey];
  const laneOffsets = [0, -3, 3, -6, 6];

  for (const lad of ladders) {
    rawXs.push(Math.round(lad.ax), Math.round(lad.bx), Math.round(lad.centerX));
    rawYs.push(Math.round(lad.ay), Math.round(lad.by), Math.round(lad.centerY));
    const maxOff = Math.max(3, lad.halfW - 3);
    for (const off of laneOffsets) {
      if (Math.abs(off) <= maxOff) {
        if (lad.isVert) {
          rawXs.push(Math.round(lad.centerX + off));
        } else {
          rawYs.push(Math.round(lad.centerY + off));
        }
      }
    }
    const ps = projectPointOntoSegment2D(sx, sy, lad.ax, lad.ay, lad.bx, lad.by);
    const pe = projectPointOntoSegment2D(ex, ey, lad.ax, lad.ay, lad.bx, lad.by);
    rawXs.push(Math.round(ps.x), Math.round(pe.x));
    rawYs.push(Math.round(ps.y), Math.round(pe.y));

    const psExt = projectPointOntoSegment2D(sx, sy, lad.extAx, lad.extAy, lad.extBx, lad.extBy);
    const peExt = projectPointOntoSegment2D(ex, ey, lad.extAx, lad.extAy, lad.extBx, lad.extBy);
    rawXs.push(Math.round(psExt.x), Math.round(peExt.x));
    rawYs.push(Math.round(psExt.y), Math.round(peExt.y));
  }

  for (let i = 0; i < ladders.length; i++) {
    for (let j = i + 1; j < ladders.length; j++) {
      const lA = ladders[i];
      const lB = ladders[j];
      rawXs.push(Math.round((lA.centerX + lB.centerX) / 2));
      rawYs.push(Math.round((lA.centerY + lB.centerY) / 2));
      const pAB = projectPointOntoSegment2D(lA.ax, lA.ay, lB.ax, lB.ay, lB.bx, lB.by);
      const pBA = projectPointOntoSegment2D(lB.ax, lB.ay, lA.ax, lA.ay, lA.bx, lA.by);
      rawXs.push(Math.round(pAB.x), Math.round(pBA.x));
      rawYs.push(Math.round(pAB.y), Math.round(pBA.y));
    }
  }

  for (const pb of basepads) {
    rawXs.push(Math.round(pb.centerX));
    rawYs.push(Math.round(pb.centerY));
  }

  const existingSegs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (const o of allObjs) {
    if (excludeCableId && o.id === excludeCableId) continue;
    if (o.type === 'line') {
      existingSegs.push({
        x1: o.x,
        y1: o.y,
        x2: o.x2 ?? o.x + (o.width || 0),
        y2: o.y2 ?? o.y + (o.height || 0),
      });
    } else if ((o.type === 'polyline' || o.type === 'pen') && o.points && o.points.length > 1) {
      for (let i = 0; i < o.points.length - 1; i++) {
        existingSegs.push({
          x1: o.x + o.points[i].x,
          y1: o.y + o.points[i].y,
          x2: o.x + o.points[i + 1].x,
          y2: o.y + o.points[i + 1].y,
        });
      }
    }
  }

  const uniqueCoords = (arr: number[], mustKeep: Set<number>) => {
    const sorted = Array.from(new Set(arr)).sort((a, b) => a - b);
    const res: number[] = [];
    for (const v of sorted) {
      if (res.length === 0) {
        res.push(v);
      } else {
        const prev = res[res.length - 1];
        if (Math.abs(v - prev) <= 1) {
          if (mustKeep.has(v) && !mustKeep.has(prev)) {
            res[res.length - 1] = v;
          } else if (mustKeep.has(v) && mustKeep.has(prev)) {
            res.push(v);
          }
        } else {
          res.push(v);
        }
      }
    }
    return res;
  };

  let minStartLadDist = Infinity;
  let minEndLadDist = Infinity;
  let startLadProj: { x: number; y: number; dist: number; lad: (typeof ladders)[0] } | null = null;
  let endLadProj: { x: number; y: number; dist: number; lad: (typeof ladders)[0] } | null = null;

  for (const lad of ladders) {
    const ds = projectPointOntoSegment2D(sx, sy, lad.ax, lad.ay, lad.bx, lad.by);
    const de = projectPointOntoSegment2D(ex, ey, lad.ax, lad.ay, lad.bx, lad.by);
    if (ds.dist < minStartLadDist) {
      minStartLadDist = ds.dist;
      startLadProj = { ...ds, lad };
    }
    if (de.dist < minEndLadDist) {
      minEndLadDist = de.dist;
      endLadProj = { ...de, lad };
    }
  }

  const isNearCabinet = (px: number, py: number) =>
    cabinets.some((cb) => px >= cb.minX - 14 && px <= cb.maxX + 14 && py >= cb.minY - 14 && py <= cb.maxY + 14);

  let effSx = sx;
  let effSy = sy;
  if (startLadProj && startLadProj.dist <= startLadProj.lad.halfW + 6 && !isNearCabinet(sx, sy)) {
    effSx = Math.round(startLadProj.x);
    effSy = Math.round(startLadProj.y);
    rawXs.push(effSx);
    rawYs.push(effSy);
  }

  let effEx = ex;
  let effEy = ey;
  if (endLadProj && endLadProj.dist <= endLadProj.lad.halfW + 6 && !isNearCabinet(ex, ey)) {
    effEx = Math.round(endLadProj.x);
    effEy = Math.round(endLadProj.y);
    rawXs.push(effEx);
    rawYs.push(effEy);
  }

  const keepX = new Set<number>([
    effSx,
    effEx,
    sx,
    ex,
    ...ladders.flatMap((l) => [
      Math.round(l.ax),
      Math.round(l.bx),
      ...laneOffsets.map((off) => Math.round(l.centerX + off)),
    ]),
  ]);
  const keepY = new Set<number>([
    effSy,
    effEy,
    sy,
    ey,
    ...ladders.flatMap((l) => [
      Math.round(l.ay),
      Math.round(l.by),
      ...laneOffsets.map((off) => Math.round(l.centerY + off)),
    ]),
  ]);
  const xs = uniqueCoords(rawXs, keepX);
  const ys = uniqueCoords(rawYs, keepY);

  const startIx = xs.indexOf(effSx);
  const startIy = ys.indexOf(effSy);
  const endIx = xs.indexOf(effEx);
  const endIy = ys.indexOf(effEy);

  if (startIx === -1 || startIy === -1 || endIx === -1 || endIy === -1) {
    return [
      { x: sx, y: sy },
      { x: ex, y: sy },
      { x: ex, y: ey },
    ];
  }

  const startFeederRadius = Math.min(260, Math.max(65, minStartLadDist + 45));
  const endFeederRadius = Math.min(260, Math.max(65, minEndLadDist + 45));

  const evalEdgeCost = createEdgeCostEvaluator({
    existingSegs,
    cabinets,
    ladders,
    basepads,
    effSx,
    effSy,
    effEx,
    effEy,
    startFeederRadius,
    endFeederRadius,
  });

  return runDijkstraGridRouter({
    xs,
    ys,
    startIx,
    startIy,
    endIx,
    endIy,
    evalEdgeCost,
    sx,
    sy,
    ex,
    ey,
  });
}
