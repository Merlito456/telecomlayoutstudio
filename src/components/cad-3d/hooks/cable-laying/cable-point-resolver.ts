import { CADObject } from '../../../../types/cad';
import {
  findCabinetWallLTCAttachment2D,
  constrainCableSegmentAngle2D,
  isIndoorPoint2D,
} from '../../../../utils/cad-geometry';

export interface CablePointResolution {
  nextX2D: number;
  nextY2D: number;
  cabHit: ReturnType<typeof findCabinetWallLTCAttachment2D>;
  isTooClose: boolean;
}

export function resolveNextCablePoint(
  target: { x2D: number; y2D: number; y3D?: number },
  lastPt: { x2D: number; y2D: number; y3D?: number },
  objects: CADObject[],
  orthoSnap: boolean
): CablePointResolution {
  let nextX2D = target.x2D;
  let nextY2D = target.y2D;

  const isIndoor =
    isIndoorPoint2D({ x: target.x2D, y: target.y2D }, objects) ||
    isIndoorPoint2D({ x: lastPt.x2D, y: lastPt.y2D }, objects);

  const cabHit = isIndoor
    ? null
    : findCabinetWallLTCAttachment2D(
        { x: target.x2D, y: target.y2D },
        { x: lastPt.x2D, y: lastPt.y2D },
        objects,
        12
      );

  if (cabHit) {
    nextX2D = cabHit.wallX;
    nextY2D = cabHit.wallY;
  } else if (orthoSnap) {
    const constrained = constrainCableSegmentAngle2D(
      { x: lastPt.x2D, y: lastPt.y2D },
      { x: target.x2D, y: target.y2D },
      true
    );
    nextX2D = constrained.x;
    nextY2D = constrained.y;
  }

  const dist2D = Math.hypot(nextX2D - lastPt.x2D, nextY2D - lastPt.y2D);
  const distY3D =
    target.y3D !== undefined && lastPt.y3D !== undefined
      ? Math.abs(target.y3D - lastPt.y3D)
      : 0;

  // If there is a vertical climb/drop (e.g. drawing straight upward to cable ladder), it is NOT too close!
  const isTooClose = dist2D < 2.5 && distY3D < 0.8;

  return { nextX2D, nextY2D, cabHit, isTooClose };
}
