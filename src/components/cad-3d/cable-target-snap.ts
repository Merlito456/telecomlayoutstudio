import { CADObject } from '../../types/cad';
import {
  findCabinetWallLTCAttachment2D,
  isRackObject,
  isIndoorEquipment,
  isCableLadderObject,
  isIndoorPoint2D,
} from '../../utils/cad-geometry';
import { CoordTransform } from './scene/types';
import { getRackTopElevY } from './cable-3d-utils';

export function isCabinetTargetObject(o: CADObject): boolean {
  if (o.isStencilLabel) return false;
  // Racks, indoor equipment, and shelters are not outdoor LTC gland targets
  if (isRackObject(o) || isIndoorEquipment(o)) return false;
  const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
  if (s.includes('shelter') || s.includes('rack') || s.includes('subrack') || s.includes('indoor')) return false;
  return (
    s.includes('cabinet') ||
    s.includes('odc') ||
    s.includes('eltek') ||
    s.includes('huawei') ||
    s.includes('ericsson') ||
    s.includes('fushan') ||
    s === 'mpd' ||
    s === 'dcpdu' ||
    s.includes('ecb') ||
    s.includes('ats') ||
    s.includes('acpdb') ||
    s.includes('generator') ||
    s === 'transformer'
  );
}

export function computeSnappedTargetPoint(
  rawX2D: number,
  rawY2D: number,
  hitCadObj: CADObject | null | undefined,
  allObjs: CADObject[],
  coordTransform: CoordTransform,
  lastWaypoint: { x2D: number; y2D: number; y3D?: number; snapLabel?: string } | null,
  evaluateFluidElev: (x: number, y: number, objs: CADObject[]) => { elevY: number; surfaceLabel: string; onLadder: boolean },
  hitPt3D?: { x: number; y: number; z: number } | null
) {
  let bestX2D = rawX2D;
  let bestY2D = rawY2D;

  const supportInfo = evaluateFluidElev(bestX2D, bestY2D, allObjs);
  let bestElev3D = hitPt3D && hitPt3D.y > 0 ? hitPt3D.y : supportInfo.elevY + 0.10;
  let snapLabel = supportInfo.surfaceLabel;

  const isIndoor = isIndoorPoint2D({ x: rawX2D, y: rawY2D }, allObjs);

  if (hitCadObj && isRackObject(hitCadObj)) {
    // Indoor / Equipment Rack / Rectifier: target at rack top without outdoor LTC wall snapping
    const { topY, rackName } = getRackTopElevY(hitCadObj, allObjs);
    bestElev3D = topY + 0.10;
    snapLabel = `Rack Top (${rackName})`;
  } else if (hitCadObj && isCableLadderObject(hitCadObj)) {
    const s = (hitCadObj.stencilId || hitCadObj.customProps?.stencilType || '').toLowerCase();
    const isIndLadder =
      hitCadObj.ladderType === 'indoor' ||
      hitCadObj.customProps?.ladderType === 'indoor' ||
      s.includes('indoor') ||
      isIndoor;

    const ladBaseY = (hitCadObj as any).elevationMm ? (((hitCadObj as any).elevationMm || 0) / 1000) * 6.0 : 0;
    const ladderTopY = isIndLadder ? Math.max(bestElev3D, 20.8) : (ladBaseY > 8 ? ladBaseY + 0.65 : ladBaseY + 1.25);
    bestElev3D = ladderTopY + 0.10;

    // Check if starting or continuing from a rack directly below: snap straight upward vertically!
    if (
      lastWaypoint &&
      (lastWaypoint.snapLabel?.includes('Rack Top') ||
        (lastWaypoint.y3D !== undefined && bestElev3D - lastWaypoint.y3D > 3.0))
    ) {
      if (Math.hypot(rawX2D - lastWaypoint.x2D, rawY2D - lastWaypoint.y2D) < 18) {
        bestX2D = lastWaypoint.x2D;
        bestY2D = lastWaypoint.y2D;
      }
      snapLabel = isIndLadder
        ? 'Overhead Cable Ladder (Straight Upward / Vertical Riser)'
        : 'Cable Ladder (Vertical Riser)';
    } else {
      snapLabel = isIndLadder ? 'Overhead Cable Ladder' : 'Cable Ladder';
    }
  } else if (!isIndoor && hitCadObj && isCabinetTargetObject(hitCadObj) && !supportInfo.onLadder) {
    const cabHit = findCabinetWallLTCAttachment2D(
      { x: rawX2D, y: rawY2D },
      lastWaypoint ? { x: lastWaypoint.x2D, y: lastWaypoint.y2D } : null,
      [hitCadObj],
      12
    );
    if (cabHit) {
      bestX2D = cabHit.wallX;
      bestY2D = cabHit.wallY;
      bestElev3D = evaluateFluidElev(bestX2D, bestY2D, allObjs).elevY + 0.10;
      snapLabel = `LTC Connector → ${cabHit.cabinetName}`;
    }
  }

  const { centerX, centerY, scale3D } = coordTransform;
  return {
    x2D: bestX2D,
    y2D: bestY2D,
    x3D: (bestX2D - centerX) * scale3D,
    y3D: bestElev3D,
    z3D: (bestY2D - centerY) * scale3D,
    snapLabel,
  };
}
