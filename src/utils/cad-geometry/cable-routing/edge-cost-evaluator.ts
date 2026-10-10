import { projectPointOntoSegment2D } from '../ladder-geometry';

export interface EdgeCostContext {
  existingSegs: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  cabinets: Array<{ minX: number; maxX: number; minY: number; maxY: number }>;
  ladders: Array<{
    ax: number;
    ay: number;
    bx: number;
    by: number;
    halfW: number;
    isVert: boolean;
    extAx: number;
    extAy: number;
    extBx: number;
    extBy: number;
  }>;
  basepads: Array<{ minX: number; maxX: number; minY: number; maxY: number }>;
  effSx: number;
  effSy: number;
  effEx: number;
  effEy: number;
  startFeederRadius: number;
  endFeederRadius: number;
}

export function createEdgeCostEvaluator(ctx: EdgeCostContext): (x1: number, y1: number, x2: number, y2: number) => number {
  const {
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
  } = ctx;

  return (x1: number, y1: number, x2: number, y2: number): number => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 1e-3) return 0;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    const isSegHoriz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
    let isLaneOccupied = false;
    for (const seg of existingSegs) {
      const isOtherHoriz = Math.abs(seg.x2 - seg.x1) >= Math.abs(seg.y2 - seg.y1);
      if (isSegHoriz && isOtherHoriz) {
        const segY = (seg.y1 + seg.y2) / 2;
        const minOx = Math.min(seg.x1, seg.x2);
        const maxOx = Math.max(seg.x1, seg.x2);
        if (Math.abs(my - segY) < 2.2 && Math.min(x1, x2) < maxOx - 1 && Math.max(x1, x2) > minOx + 1) {
          isLaneOccupied = true;
          break;
        }
      } else if (!isSegHoriz && !isOtherHoriz) {
        const segX = (seg.x1 + seg.x2) / 2;
        const minOy = Math.min(seg.y1, seg.y2);
        const maxOy = Math.max(seg.y1, seg.y2);
        if (Math.abs(mx - segX) < 2.2 && Math.min(y1, y2) < maxOy - 1 && Math.max(y1, y2) > minOy + 1) {
          isLaneOccupied = true;
          break;
        }
      }
    }
    const occupiedPenalty = isLaneOccupied ? len * 0.35 : 0;

    // Never slice through the interior of any cabinet
    for (const cb of cabinets) {
      if (mx > cb.minX + 2 && mx < cb.maxX - 2 && my > cb.minY + 2 && my < cb.maxY - 2) {
        return len * 100000.0;
      }
    }

    // 1. Check if segment is on a Physical Cable Ladder
    let bestLadderCost = Infinity;
    for (const lad of ladders) {
      const isLadHoriz = !lad.isVert;
      const isParallelToLad = isSegHoriz === isLadHoriz;

      const p1Act = projectPointOntoSegment2D(x1, y1, lad.ax, lad.ay, lad.bx, lad.by);
      const p2Act = projectPointOntoSegment2D(x2, y2, lad.ax, lad.ay, lad.bx, lad.by);
      const pmAct = projectPointOntoSegment2D(mx, my, lad.ax, lad.ay, lad.bx, lad.by);

      if (pmAct.dist <= lad.halfW + 10 && p1Act.dist <= lad.halfW + 12 && p2Act.dist <= lad.halfW + 12) {
        if (isParallelToLad) {
          const c = len * (0.15 + pmAct.dist * 0.025) + occupiedPenalty;
          if (c < bestLadderCost) bestLadderCost = c;
        } else {
          const c = len * 0.01;
          if (c < bestLadderCost) bestLadderCost = c;
        }
      }
    }
    if (bestLadderCost < Infinity) {
      return bestLadderCost;
    }

    // 2. Check if segment is on a Cable Ladder's longitudinal T-junction / alignment extension
    let bestExtCost = Infinity;
    for (const lad of ladders) {
      const isLadHoriz = !lad.isVert;
      const isParallelToLad = isSegHoriz === isLadHoriz;

      const p1Ext = projectPointOntoSegment2D(x1, y1, lad.extAx, lad.extAy, lad.extBx, lad.extBy);
      const p2Ext = projectPointOntoSegment2D(x2, y2, lad.extAx, lad.extAy, lad.extBx, lad.extBy);
      const pmExt = projectPointOntoSegment2D(mx, my, lad.extAx, lad.extAy, lad.extBx, lad.extBy);

      if (pmExt.dist <= lad.halfW + 10 && p1Ext.dist <= lad.halfW + 12 && p2Ext.dist <= lad.halfW + 12) {
        if (isParallelToLad) {
          const c = len * (2.5 + pmExt.dist * 0.05) + occupiedPenalty;
          if (c < bestExtCost) bestExtCost = c;
        } else {
          const c = len * 0.15;
          if (c < bestExtCost) bestExtCost = c;
        }
      }
    }
    if (bestExtCost < Infinity) {
      return bestExtCost;
    }

    // 3. Check if segment is inside the local feeder zone connecting startPt or endPt to the nearest ladder
    const distFromStart = Math.hypot(mx - effSx, my - effSy);
    const distFromEnd = Math.hypot(mx - effEx, my - effEy);
    const inStartFeeder = distFromStart <= startFeederRadius;
    const inEndFeeder = distFromEnd <= endFeederRadius;

    const onBasepad = basepads.some(
      (pb) => mx >= pb.minX - 12 && mx <= pb.maxX + 12 && my >= pb.minY - 12 && my <= pb.maxY + 12
    );

    if (ladders.length === 0) {
      return onBasepad ? len * 10.0 : len * 50.0;
    }

    let nearestLad: (typeof ladders)[0] | null = null;
    let nearestLadDist = Infinity;
    for (const lad of ladders) {
      const pm = projectPointOntoSegment2D(mx, my, lad.ax, lad.ay, lad.bx, lad.by);
      if (pm.dist < nearestLadDist) {
        nearestLadDist = pm.dist;
        nearestLad = lad;
      }
    }
    const isPerpApproachToNearestLadder = nearestLad ? isSegHoriz === nearestLad.isVert : true;

    if (inStartFeeder || inEndFeeder) {
      if (isPerpApproachToNearestLadder) {
        return len * (onBasepad ? 12.0 : 28.0) + occupiedPenalty;
      }
      return len * (onBasepad ? 450.0 : 900.0) + occupiedPenalty;
    }

    // 4. If on a basepad but outside the local feeder zone
    if (onBasepad) {
      return len * 2500.0 + occupiedPenalty;
    }

    // 5. Open ground / air gap off any cable ladder
    return len * 50000.0;
  };
}
