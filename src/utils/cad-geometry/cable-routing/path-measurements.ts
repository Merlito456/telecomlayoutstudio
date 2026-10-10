import { LadderCenterline2D, projectPointOntoSegment2D } from '../ladder-geometry';

/**
 * Computes how much length of a given 2D waypoint path lies directly on top of detected Cable Ladders.
 */
export function measurePathOnLadderLength(
  pts: Array<{ x: number; y: number }>,
  ladders: LadderCenterline2D[]
): { onLadderLen: number; totalLen: number } {
  let onLadderLen = 0;
  let totalLen = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    totalLen += segLen;
    if (segLen < 1e-3) continue;
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const isOnAnyLadder = ladders.some((lad) => {
      const pm = projectPointOntoSegment2D(mx, my, lad.ax, lad.ay, lad.bx, lad.by);
      const pa = projectPointOntoSegment2D(p1.x, p1.y, lad.ax, lad.ay, lad.bx, lad.by);
      const pb = projectPointOntoSegment2D(p2.x, p2.y, lad.ax, lad.ay, lad.bx, lad.by);
      return pm.dist <= lad.halfW + 10 && pa.dist <= lad.halfW + 14 && pb.dist <= lad.halfW + 14;
    });
    if (isOnAnyLadder) {
      onLadderLen += segLen;
    }
  }
  return { onLadderLen, totalLen };
}
