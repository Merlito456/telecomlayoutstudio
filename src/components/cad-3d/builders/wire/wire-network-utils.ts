/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from "../../../../types/cad";
import { getObjectBounds, getRotatedObjectBounds } from "../../../../utils/cad-geometry";
import { ExcavatedZone3D, WireNetworkElevInfo } from "./wire-types";

export const SNAP_TOL_2D = 2.2;
export const ELEVATION_3D_SCALE = 1.6;

export const isBasepadId = (sId: string): boolean =>
  sId === 'cement-basepad' ||
  sId === 'gen-basepad' ||
  sId === 'tx-basepad' ||
  sId === 'ac-basepad' ||
  sId === 'cement-slab' ||
  sId === 'elevated-basepad' ||
  sId === 'custom-elevated-basepad' ||
  (sId.includes('basepad') && !sId.includes('ladder') && !sId.includes('cable'));

export const isLadderId = (sId: string): boolean =>
  sId === 'basepad-ladder' ||
  sId === 'cabin-feeder-ladder' ||
  sId === 'indoor-ladder' ||
  sId === 'connecting-ladder' ||
  sId === 'cable-ladder-top' ||
  sId === 'cable-ladder' ||
  sId === 'cable-tray' ||
  sId.includes('ladder') ||
  sId.includes('cable-tray');

export const isCabinetOrBoxId = (sId: string): boolean => {
  if (!sId) return false;
  if (sId.includes('shelter') || sId.includes('rack') || sId.includes('subrack') || sId.includes('indoor')) return false;
  return (
    sId.includes('cabinet') ||
    sId.includes('odc') ||
    sId === 'mpd' ||
    sId === 'dcpdu' ||
    sId.includes('ecb') ||
    sId.includes('ats') ||
    sId.includes('acpdb') ||
    sId.includes('generator') ||
    sId === 'transformer' ||
    sId === 'air-conditioner'
  );
};

export const closestPointOnSegment2D = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { x: number; y: number; dist: number } => {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) {
    return { x: ax, y: ay, dist: Math.hypot(px - ax, py - ay) };
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return { x: cx, y: cy, dist: Math.hypot(px - cx, py - cy) };
};

export const getWireSegments2D = (
  wObj: CADObject
): Array<{ x1: number; y1: number; x2: number; y2: number }> => {
  if (wObj.type === 'line') {
    return [
      {
        x1: wObj.x,
        y1: wObj.y,
        x2: wObj.x2 ?? wObj.x + wObj.width,
        y2: wObj.y2 ?? wObj.y + (wObj.height || 0),
      },
    ];
  }
  if ((wObj.type === 'polyline' || wObj.type === 'pen') && wObj.points && wObj.points.length > 1) {
    const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < wObj.points.length - 1; i++) {
      segs.push({
        x1: wObj.x + wObj.points[i].x,
        y1: wObj.y + wObj.points[i].y,
        x2: wObj.x + wObj.points[i + 1].x,
        y2: wObj.y + wObj.points[i + 1].y,
      });
    }
    return segs;
  }
  return [];
};

export const isRogueWireObj = (wObj: CADObject): boolean => {
  if (wObj.type === 'line') {
    const x1 = wObj.x;
    const y1 = wObj.y;
    const x2 = wObj.x2 ?? wObj.x + (wObj.width || 0);
    const y2 = wObj.y2 ?? wObj.y + (wObj.height || 0);
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const len = Math.hypot(dx, dy);
    if (len < 3) return true;
    return false;
  }
  return false;
};

export const areWiresConnected2D = (wA: CADObject, wB: CADObject): boolean => {
  const segsA = getWireSegments2D(wA);
  const segsB = getWireSegments2D(wB);
  for (const sA of segsA) {
    for (const sB of segsB) {
      if (
        closestPointOnSegment2D(sA.x1, sA.y1, sB.x1, sB.y1, sB.x2, sB.y2).dist <= SNAP_TOL_2D ||
        closestPointOnSegment2D(sA.x2, sA.y2, sB.x1, sB.y1, sB.x2, sB.y2).dist <= SNAP_TOL_2D ||
        closestPointOnSegment2D(sB.x1, sB.y1, sA.x1, sA.y1, sA.x2, sA.y2).dist <= SNAP_TOL_2D ||
        closestPointOnSegment2D(sB.x2, sB.y2, sA.x1, sA.y1, sA.x2, sA.y2).dist <= SNAP_TOL_2D
      ) {
        return true;
      }
    }
  }
  return false;
};

export const findClosestJunctionPoint2D = (
  px: number,
  py: number,
  objId: string,
  allWireObjects: CADObject[]
): { x: number; y: number; dist: number } | null => {
  let best: { x: number; y: number; dist: number } | null = null;
  for (const other of allWireObjects) {
    if (other.id === objId) continue;
    const segs = getWireSegments2D(other);
    for (const s of segs) {
      const d1 = Math.hypot(px - s.x1, py - s.y1);
      if (d1 <= SNAP_TOL_2D && (!best || d1 < best.dist)) {
        best = { x: s.x1, y: s.y1, dist: d1 };
      }
      const d2 = Math.hypot(px - s.x2, py - s.y2);
      if (d2 <= SNAP_TOL_2D && (!best || d2 < best.dist)) {
        best = { x: s.x2, y: s.y2, dist: d2 };
      }
      const cp = closestPointOnSegment2D(px, py, s.x1, s.y1, s.x2, s.y2);
      if (cp.dist <= SNAP_TOL_2D && (!best || cp.dist < best.dist)) {
        best = cp;
      }
    }
  }
  return best;
};

export function resolveNetworkElevation(
  obj: CADObject,
  allObjects: CADObject[],
  allWireObjects: CADObject[],
  excavatedZones: ExcavatedZone3D[],
  centerX: number,
  centerY: number,
  scale3D: number,
  wireNetworkElevCache: Map<string, WireNetworkElevInfo>
): WireNetworkElevInfo {
  const cached = wireNetworkElevCache.get(obj.id);
  if (cached) return cached;

  const connectedNetwork: CADObject[] = [obj];
  const visitedWireIds = new Set<string>([obj.id]);
  const queue: CADObject[] = [obj];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const cand of allWireObjects) {
      if (visitedWireIds.has(cand.id)) continue;
      if (areWiresConnected2D(curr, cand)) {
        visitedWireIds.add(cand.id);
        connectedNetwork.push(cand);
        queue.push(cand);
      }
    }
  }

  let highestBasepadUnderWire = 0;
  let highestLadderTopUnderWire = 0;

  for (const netWire of connectedNetwork) {
    const wb = getObjectBounds(netWire);
    const xLow = wb.minX;
    const xHigh = wb.maxX;
    const yLow = wb.minY;
    const yHigh = wb.maxY;

    for (const other of allObjects) {
      if (
        other.id === netWire.id ||
        other.isStencilLabel ||
        other.type === 'text' ||
        other.type === 'leader' ||
        other.type === 'line' ||
        other.type === 'polyline' ||
        other.type === 'pen'
      ) {
        continue;
      }
      const sId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
      const ob = getRotatedObjectBounds(other);
      const padMargin = 6;
      const overlaps = !(
        xHigh < ob.minX - padMargin ||
        xLow > ob.maxX + padMargin ||
        yHigh < ob.minY - padMargin ||
        yLow > ob.maxY + padMargin
      );
      if (!overlaps) continue;

      if (isBasepadId(sId) || (!sId && other.type === 'rectangle')) {
        const padH = sId === 'elevated-basepad' || sId === 'custom-elevated-basepad'
          ? 6.0
          : (other.basepadHeight !== undefined
              ? (other.basepadHeight / 1000) * 10
              : (other.customProps?.basepadHeight !== undefined ? (other.customProps.basepadHeight / 1000) * 10 : 1.2));
        highestBasepadUnderWire = Math.max(highestBasepadUnderWire, padH);
      }

      if (isLadderId(sId)) {
        let ladderPadBase = 0;
        for (const padCand of allObjects) {
          const pId = (padCand.stencilId || padCand.customProps?.stencilType || '').toLowerCase();
          if (isBasepadId(pId)) {
            const pb = getRotatedObjectBounds(padCand);
            const ladderOverPad = !(
              ob.maxX < pb.minX - 45 ||
              ob.minX > pb.maxX + 45 ||
              ob.maxY < pb.minY - 45 ||
              ob.minY > pb.maxY + 45
            );
            if (ladderOverPad) {
              const pTop = pId === 'elevated-basepad' || pId === 'custom-elevated-basepad'
                ? 6.0
                : (padCand.basepadHeight !== undefined
                    ? (padCand.basepadHeight / 1000) * 10
                    : (padCand.customProps?.basepadHeight !== undefined ? (padCand.customProps.basepadHeight / 1000) * 10 : 1.2));
              ladderPadBase = Math.max(ladderPadBase, pTop);
            }
          }
        }

        const lType =
          other.ladderType ||
          other.customProps?.ladderType ||
          (sId.includes('cabin-feeder')
            ? 'cabin-feeder'
            : sId.includes('indoor')
            ? 'indoor'
            : sId.includes('connecting')
            ? 'connecting'
            : 'basepad');

        let ladderTopOffset = 1.25;
        if (lType === 'cabin-feeder') {
          ladderTopOffset = 15.7;
        } else if (lType === 'indoor') {
          ladderTopOffset = 16.4;
        }
        highestLadderTopUnderWire = Math.max(
          highestLadderTopUnderWire,
          ladderPadBase + ladderTopOffset
        );
      }
    }
  }

  let supportSurfaceTop = 0.08;
  if (highestLadderTopUnderWire > 0) {
    supportSurfaceTop = Math.max(highestLadderTopUnderWire, highestBasepadUnderWire) + 0.01;
  } else if (highestBasepadUnderWire > 0) {
    supportSurfaceTop = highestBasepadUnderWire + 0.08;
  }

  let terrainOffset3D = 0;
  const netExplicitLevel = connectedNetwork.find(
    (w) => w.levelElevationM !== undefined && w.levelElevationM !== 0
  );
  if (netExplicitLevel && netExplicitLevel.levelElevationM !== undefined) {
    terrainOffset3D = netExplicitLevel.levelElevationM * ELEVATION_3D_SCALE;
  } else {
    for (const netWire of connectedNetwork) {
      const wb = getObjectBounds(netWire);
      const midX2D = (wb.minX + wb.maxX) / 2;
      const midY2D = (wb.minY + wb.maxY) / 2;
      const mX = (midX2D - centerX) * scale3D;
      const mZ = (midY2D - centerY) * scale3D;
      let foundEz = false;
      for (const ez of excavatedZones) {
        if (mX >= ez.minX - 1 && mX <= ez.maxX + 1 && mZ >= ez.minZ - 1 && mZ <= ez.maxZ + 1) {
          terrainOffset3D = -ez.depth3D;
          foundEz = true;
          break;
        }
      }
      if (foundEz) break;
    }
  }

  const elevInfo: WireNetworkElevInfo = { supportSurfaceTop, terrainOffset3D };
  for (const netWire of connectedNetwork) {
    wireNetworkElevCache.set(netWire.id, elevInfo);
  }

  return elevInfo;
}
