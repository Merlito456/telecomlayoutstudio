/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../types/cad';
import {
  getObjectBounds,
  getRotatedObjectBounds,
  isCableLadderObject,
  isRackObject,
  isIndoorEquipment,
  getUnpackedCADObjects,
} from '../../utils/cad-geometry';

export const isBasepadItem = (o: CADObject): boolean => {
  if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return false;
  const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
  return (
    s === 'cement-basepad' ||
    s === 'gen-basepad' ||
    s === 'tx-basepad' ||
    s === 'ac-basepad' ||
    s === 'cement-slab' ||
    s === 'elevated-basepad' ||
    s === 'custom-elevated-basepad' ||
    (s.includes('basepad') && !s.includes('ladder') && !s.includes('cable'))
  );
};

export const isCabinetItem = (o: CADObject): boolean => {
  if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return false;
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
    s.includes('3bay') ||
    s === 'shelter' ||
    s === 'cement-shelter' ||
    s === 'mpd' ||
    s === 'dcpdu' ||
    s.includes('ecb') ||
    s.includes('ats') ||
    s.includes('acpdb') ||
    s.includes('generator') ||
    s === 'transformer'
  );
};

export const getZoneElevAt2D = (
  qx: number,
  qy: number,
  allObjs: CADObject[],
  elevScale = 1.6
): number => {
  for (const zone of allObjs) {
    if (zone.isStencilLabel || zone.type === 'text' || zone.type === 'leader') continue;
    const zId = (zone.stencilId || zone.customProps?.stencilType || '').toLowerCase();
    const zoneLevelM = zone.levelElevationM ?? zone.customProps?.levelElevationM;
    const isZoneContainer =
      zId === 'excavated-pit' ||
      zId === 'elevated-terrace' ||
      zId === 'earth-berm-level' ||
      zId.includes('excavat') ||
      (zone.customProps?.name && String(zone.customProps.name).toLowerCase().includes('excavat')) ||
      ((zId === '' || zone.type === 'rectangle') && zoneLevelM !== undefined && zoneLevelM < 0);
    if (isZoneContainer && zoneLevelM !== undefined && zoneLevelM !== 0) {
      const zb = getObjectBounds(zone);
      if (qx >= zb.minX && qx <= zb.maxX && qy >= zb.minY && qy <= zb.maxY) {
        return zoneLevelM * elevScale;
      }
    }
  }
  return 0;
};

export const getFallbackObjElevY = (
  obj: CADObject,
  allObjs: CADObject[],
  objectElevYMap?: Map<string, number>,
  elevScale = 1.6
): number => {
  if (objectElevYMap) {
    const cached = objectElevYMap.get(obj.id);
    if (cached !== undefined) return cached;
  }

  let elev = 0;
  const selfLevelM = obj.levelElevationM ?? obj.customProps?.levelElevationM;
  const cx = obj.x + (obj.width || 0) / 2;
  const cy = obj.y + (obj.height || 0) / 2;
  if (selfLevelM !== undefined && selfLevelM !== 0) {
    elev += selfLevelM * elevScale;
  } else {
    elev += getZoneElevAt2D(cx, cy, allObjs, elevScale);
  }

  const ob = getRotatedObjectBounds(obj);
  for (const other of allObjs) {
    const oId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
    if (oId === 'shelter' || oId === 'cement-shelter') {
      const sb = getRotatedObjectBounds(other);
      const bridgeMargin = isCableLadderObject(obj) ? 25 : 0;
      const overlap = !(
        ob.maxX < sb.minX - bridgeMargin ||
        ob.minX > sb.maxX + bridgeMargin ||
        ob.maxY < sb.minY - bridgeMargin ||
        ob.minY > sb.maxY + bridgeMargin
      );
      if (overlap) {
        const sPadH = 3.5;
        if (isCableLadderObject(obj)) {
          const sWallH =
            Math.max(2.0, Math.min(6.0, Number(other.shelterHeightM || other.customProps?.shelterHeightM || 3.0))) * 6.0;
          elev += sPadH + sWallH - 1.35;
        } else {
          elev += sPadH;
        }
        break;
      }
    }
  }

  if (isCableLadderObject(obj)) {
    for (const other of allObjs) {
      if (!isBasepadItem(other)) continue;
      const pb = getRotatedObjectBounds(other);
      const centerInside = cx >= pb.minX && cx <= pb.maxX && cy >= pb.minY && cy <= pb.maxY;
      const bridgeMargin = 45;
      const overlap = !(
        ob.maxX < pb.minX - bridgeMargin ||
        ob.minX > pb.maxX + bridgeMargin ||
        ob.maxY < pb.minY - bridgeMargin ||
        ob.minY > pb.maxY + bridgeMargin
      );
      if (centerInside || overlap) {
        const pId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
        const padTop = pId === 'elevated-basepad' || pId === 'custom-elevated-basepad' ? 6.0 : 1.2;
        elev += padTop;
        break;
      }
    }
  }
  return elev;
};

export function getRackTopElevY(
  rack: CADObject,
  allObjs: CADObject[],
  objectElevYMap?: Map<string, number>
): { baseY: number; topY: number; rackH: number; rackName: string } {
  const ELEV_SCALE = 1.6;
  const sId = (rack.stencilId || rack.customProps?.stencilType || (rack as any).type || '').toLowerCase();
  const isRectifier =
    sId.includes('rectifier') ||
    sId.includes('flatpack') ||
    Boolean(rack.customProps?.isRectifierSystem) ||
    sId.includes('pdu');

  const rackName = String(
    rack.customProps?.name || rack.text || (rack as any).name || (isRectifier ? 'Flatpack2 Rectifier System' : 'Equipment Rack')
  );

  let baseY = objectElevYMap?.get(rack.id) ?? 0;
  if (baseY === 0) {
    if ((rack as any).elevationMm !== undefined) {
      baseY = 3.5 + 0.1 + (((rack as any).elevationMm || 0) / 1000) * 6.0;
    } else {
      baseY = getFallbackObjElevY(rack, allObjs, objectElevYMap, ELEV_SCALE);
    }
  }

  const totalU =
    rack.customProps?.uHeight ??
    rack.uHeight ??
    (sId.includes('18u')
      ? 18
      : sId.includes('24u')
      ? 24
      : sId.includes('36u')
      ? 36
      : sId.includes('45u')
      ? 45
      : sId.includes('48u')
      ? 48
      : 42);

  const customHeightMm =
    rack.heightMm ??
    rack.customProps?.heightMm;

  let rackH = isRectifier ? 11.5 : 13.0; // standard 42U rack or rectifier cabinet in 3D scale
  if (customHeightMm) {
    rackH = (customHeightMm / 2000) * 13.0;
  } else if (totalU && !isRectifier) {
    rackH = (totalU / 42) * 13.0;
  }
  rackH = Math.max(5.5, Math.min(18.0, rackH));

  return {
    baseY,
    topY: baseY + rackH,
    rackH,
    rackName,
  };
}

export interface FluidCableSupportElevResult {
  elevY: number;
  surfaceLabel: string;
  onLadder: boolean;
}

export function evaluateFluidCableSupportElev3D(
  px: number,
  py: number,
  allObjs: CADObject[],
  objectElevYMap?: Map<string, number>
): FluidCableSupportElevResult {
  const ELEV_SCALE = 1.6;

  // Unpack any shelter interior objects into candidate objects for comprehensive evaluation
  const candidateObjs = getUnpackedCADObjects(allObjs);

  // 1. Evaluate ground / basepad surface at (px, py)
  let groundOrPadY = getZoneElevAt2D(px, py, candidateObjs, ELEV_SCALE) + 0.08;
  let onPad = false;
  for (const pad of candidateObjs) {
    if (!isBasepadItem(pad)) continue;
    const pb = getRotatedObjectBounds(pad);
    if (px >= pb.minX - 2 && px <= pb.maxX + 2 && py >= pb.minY - 2 && py <= pb.maxY + 2) {
      const pId = (pad.stencilId || pad.customProps?.stencilType || '').toLowerCase();
      const padTop = pId === 'elevated-basepad' || pId === 'custom-elevated-basepad' ? 6.0 : 1.2;
      const padBaseY =
        objectElevYMap?.get(pad.id) ?? getZoneElevAt2D(pb.centerX, pb.centerY, candidateObjs, ELEV_SCALE);
      groundOrPadY = Math.max(groundOrPadY, padBaseY + padTop + 0.06);
      onPad = true;
    }
  }

  // 1.5. Evaluate equipment racks at (px, py)
  const rackEvaluations: Array<{
    id: string;
    dist2D: number;
    topY: number;
    name: string;
  }> = [];

  for (const rk of candidateObjs) {
    if (!isRackObject(rk)) continue;
    const cx = rk.x + (rk.width || 0) / 2;
    const cy = rk.y + (rk.height || 0) / 2;
    const hw = (rk.width || 0) / 2;
    const hh = (rk.height || 0) / 2;
    const rad = -((rk.rotation || 0) * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
    const outX = Math.max(0, Math.abs(lx) - hw);
    const outY = Math.max(0, Math.abs(ly) - hh);
    const dist2D = Math.hypot(outX, outY);

    if (dist2D > 55) continue;

    const { topY, rackName } = getRackTopElevY(rk, candidateObjs, objectElevYMap);
    rackEvaluations.push({ id: rk.id, dist2D, topY, name: rackName });
  }

  // 2. Evaluate all cable ladders in the scene and their exact 3D top surface at (px, py)
  const ladderEvaluations: Array<{
    id: string;
    dist2D: number;
    topY: number;
  }> = [];

  for (const lad of candidateObjs) {
    if (!isCableLadderObject(lad)) continue;
    const cx = lad.x + (lad.width || 0) / 2;
    const cy = lad.y + (lad.height || 0) / 2;
    const hw = (lad.width || 0) / 2;
    const hh = (lad.height || 0) / 2;
    const rad = -((lad.rotation || 0) * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
    const outX = Math.max(0, Math.abs(lx) - hw);
    const outY = Math.max(0, Math.abs(ly) - hh);
    const dist2D = Math.hypot(outX, outY);

    if (dist2D > 42) continue;

    const ladBaseY = getFallbackObjElevY(lad, candidateObjs, objectElevYMap, ELEV_SCALE);
    const sId = (lad.stencilId || lad.customProps?.stencilType || '').toLowerCase();
    const lType =
      lad.ladderType ||
      lad.customProps?.ladderType ||
      (sId.includes('cabin-feeder')
        ? 'cabin-feeder'
        : sId.includes('indoor')
        ? 'indoor'
        : sId.includes('connecting')
        ? 'connecting'
        : 'basepad');

    let topY = ladBaseY + 1.25;
    if (lType === 'cabin-feeder') {
      topY = ladBaseY > 8 ? ladBaseY + 0.65 : ladBaseY + 15.7;
    } else if (lType === 'indoor') {
      topY = ladBaseY > 8 ? ladBaseY + 0.25 : 20.8;
    } else if (lType === 'connecting') {
      const ob = getRotatedObjectBounds(lad);
      const hasElevatedTarget = candidateObjs.some((other) => {
        if (other.id === lad.id || other.isStencilLabel) return false;
        const oId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
        const isElev =
          oId.includes('cabin-feeder') ||
          oId.includes('indoor') ||
          oId.includes('shelter') ||
          oId.includes('tower') ||
          oId.includes('monopole');
        if (!isElev) return false;
        const eb = getRotatedObjectBounds(other);
        return !(
          ob.maxX < eb.minX - 55 ||
          ob.minX > eb.maxX + 55 ||
          ob.maxY < eb.minY - 55 ||
          ob.minY > eb.maxY + 55
        );
      });
      if (hasElevatedTarget) {
        const isVert = hh > hw * 1.05;
        const t = isVert
          ? Math.max(0, Math.min(1, (ly + hh) / Math.max(1, 2 * hh)))
          : Math.max(0, Math.min(1, (lx + hw) / Math.max(1, 2 * hw)));
        topY = ladBaseY + 2.0 + t * 13.0;
      }
    }

    ladderEvaluations.push({ id: lad.id, dist2D, topY });
  }

  // Check if inside any equipment shelter floor (floor slab elevated at Y = 3.5)
  for (const sh of candidateObjs) {
    const shId = (sh.stencilId || sh.customProps?.stencilType || '').toLowerCase();
    if (shId === 'shelter' || shId === 'cement-shelter' || shId.includes('shelter')) {
      const sb = getRotatedObjectBounds(sh);
      if (px >= sb.minX - 2 && px <= sb.maxX + 2 && py >= sb.minY - 2 && py <= sb.maxY + 2) {
        groundOrPadY = Math.max(groundOrPadY, 3.5);
        onPad = true;
      }
    }
  }

  rackEvaluations.sort((a, b) => a.dist2D - b.dist2D);
  const closestRack = rackEvaluations.length > 0 ? rackEvaluations[0] : null;

  ladderEvaluations.sort((a, b) => a.dist2D - b.dist2D);
  const closestLad = ladderEvaluations.length > 0 ? ladderEvaluations[0] : null;

  // 3. Smooth Climbing / Dropping transition between Rack Top and Overhead Cable Ladder!
  // Allows cabling from rack up to the cable ladder, along the ladder, then down to the next rack.
  if (closestRack && closestLad) {
    // If directly in/on the rack core: firmly at Rack Top elevation
    if (closestRack.dist2D <= 2.5) {
      return {
        elevY: closestRack.topY,
        surfaceLabel: `Rack Top (${closestRack.name})`,
        onLadder: true,
      };
    }

    // If on the overhead cable ladder and away from rack center: firmly at Overhead Ladder elevation
    if (closestLad.dist2D <= 3.5 && closestRack.dist2D >= 14.0) {
      return {
        elevY: closestLad.topY,
        surfaceLabel: 'Overhead Cable Ladder',
        onLadder: true,
      };
    }

    // Between rack and ladder: smooth Hermite S-curve waterfall transition
    if (closestRack.dist2D < 28 && closestLad.dist2D < 38) {
      const u = Math.max(0, Math.min(1, (closestRack.dist2D - 2.5) / 13.5));
      const s = u * u * (3 - 2 * u);
      const rampY = closestRack.topY + s * (closestLad.topY - closestRack.topY);
      const label =
        s < 0.25
          ? `Rack Top (${closestRack.name})`
          : s > 0.75
          ? 'Overhead Cable Ladder'
          : `Cable Waterfall (${closestRack.name} ➔ Ladder)`;
      return {
        elevY: rampY,
        surfaceLabel: label,
        onLadder: true,
      };
    }
  }

  // 4. Over Cable Ladder
  if (closestLad) {
    let fluidLadY = closestLad.topY;
    const RAMP_RADIUS_2D = 22.0;
    const CORE_MARGIN_2D = 2.0;
    const byHeight = [...ladderEvaluations].sort((a, b) => a.topY - b.topY);
    for (const cand of byHeight) {
      if (cand.topY > fluidLadY && cand.dist2D < RAMP_RADIUS_2D) {
        const u = Math.max(
          0,
          Math.min(1, (RAMP_RADIUS_2D - cand.dist2D) / (RAMP_RADIUS_2D - CORE_MARGIN_2D))
        );
        const s = u * u * (3 - 2 * u);
        fluidLadY = fluidLadY + s * (cand.topY - fluidLadY);
      }
    }

    if (closestLad.dist2D <= 4.0) {
      return { elevY: fluidLadY, surfaceLabel: 'Free-Hand (Cable Ladder)', onLadder: true };
    }

    if (closestRack && closestRack.dist2D <= 4.0) {
      return { elevY: closestRack.topY, surfaceLabel: `Rack Top (${closestRack.name})`, onLadder: false };
    }

    if (closestLad.dist2D < 26) {
      const uDrop = Math.max(0, Math.min(1, (closestLad.dist2D - 4.0) / 22.0));
      const sDrop = uDrop * uDrop * (3 - 2 * uDrop);
      const targetBaseY = closestRack ? closestRack.topY : groundOrPadY;
      return {
        elevY: fluidLadY + sDrop * (targetBaseY - fluidLadY),
        surfaceLabel: onPad ? 'Free-Hand (Basepad)' : 'Free-Hand (Ground)',
        onLadder: false,
      };
    }
  }

  // 5. Directly on Rack Top
  if (closestRack && closestRack.dist2D <= 5.0) {
    return {
      elevY: closestRack.topY,
      surfaceLabel: `Rack Top (${closestRack.name})`,
      onLadder: false,
    };
  }

  // Transition off rack to floor
  if (closestRack && closestRack.dist2D < 26) {
    const uDrop = Math.max(0, Math.min(1, (closestRack.dist2D - 5.0) / 21.0));
    const sDrop = uDrop * uDrop * (3 - 2 * uDrop);
    return {
      elevY: closestRack.topY + sDrop * (groundOrPadY - closestRack.topY),
      surfaceLabel: onPad ? 'Free-Hand (Basepad)' : 'Free-Hand (Ground)',
      onLadder: false,
    };
  }

  return {
    elevY: groundOrPadY,
    surfaceLabel: onPad ? 'Free-Hand (Basepad)' : 'Free-Hand (Ground)',
    onLadder: false,
  };
}

export function generateFluid3DCableCurvePts(
  pts2D: Array<{ x: number; y: number }>,
  allObjs: CADObject[],
  cX: number,
  cY: number,
  s3D: number,
  wireRadius: number,
  objectElevYMap?: Map<string, number>,
  waypoints3D?: Array<{ x3D: number; y3D: number; z3D: number }>
): THREE.Vector3[] {
  // If exact 3D waypoints are provided (e.g. from 3D cable laying with vertical risers straight upward to ladders)
  if (waypoints3D && waypoints3D.length >= 2) {
    const raw3DPts: THREE.Vector3[] = [];
    for (let i = 0; i < waypoints3D.length - 1; i++) {
      const p1 = waypoints3D[i];
      const p2 = waypoints3D[i + 1];
      const v1 = new THREE.Vector3(p1.x3D, p1.y3D, p1.z3D);
      const v2 = new THREE.Vector3(p2.x3D, p2.y3D, p2.z3D);
      const dist2D = Math.hypot(v2.x - v1.x, v2.z - v1.z);
      const distY = Math.abs(v2.y - v1.y);
      const dist3D = v1.distanceTo(v2);

      if (dist3D < 0.01) continue;

      if (raw3DPts.length === 0) {
        raw3DPts.push(v1);
      }

      // Check if vertical riser (e.g. straight upward from rack top to overhead cable ladder)
      if (dist2D < 0.45 && distY >= 0.5) {
        const steps = Math.max(3, Math.ceil(distY / 0.35));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          raw3DPts.push(
            new THREE.Vector3(
              v1.x + (v2.x - v1.x) * t,
              v1.y + (v2.y - v1.y) * t,
              v1.z + (v2.z - v1.z) * t
            )
          );
        }
      } else {
        const steps = Math.max(1, Math.ceil(dist3D / 0.45));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          raw3DPts.push(
            new THREE.Vector3(
              v1.x + (v2.x - v1.x) * t,
              v1.y + (v2.y - v1.y) * t,
              v1.z + (v2.z - v1.z) * t
            )
          );
        }
      }
    }

    if (raw3DPts.length >= 2) {
      return raw3DPts;
    }
  }

  if (pts2D.length < 2) return [];

  // 1. Smoothly round interior 2D vertices with a quadratic Bezier corner fillet
  const filleted2D: Array<{ x: number; y: number }> = [];
  const filletDist2D = 3.2;
  const arcSteps = 6;

  for (let i = 0; i < pts2D.length; i++) {
    if (i === 0 || i === pts2D.length - 1) {
      filleted2D.push(pts2D[i]);
      continue;
    }
    const pPrev = pts2D[i - 1];
    const pCurr = pts2D[i];
    const pNext = pts2D[i + 1];
    const dxIn = pCurr.x - pPrev.x;
    const dyIn = pCurr.y - pPrev.y;
    const lenIn = Math.hypot(dxIn, dyIn);
    const dxOut = pNext.x - pCurr.x;
    const dyOut = pNext.y - pCurr.y;
    const lenOut = Math.hypot(dxOut, dyOut);

    const d = Math.min(filletDist2D, lenIn * 0.36, lenOut * 0.36);
    if (d < 0.4) {
      filleted2D.push(pCurr);
      continue;
    }
    const ax = pCurr.x - (dxIn / lenIn) * d;
    const ay = pCurr.y - (dyIn / lenIn) * d;
    const bx = pCurr.x + (dxOut / lenOut) * d;
    const by = pCurr.y + (dyOut / lenOut) * d;

    for (let s = 0; s <= arcSteps; s++) {
      const t = s / arcSteps;
      const omt = 1 - t;
      filleted2D.push({
        x: omt * omt * ax + 2 * omt * t * pCurr.x + t * t * bx,
        y: omt * omt * ay + 2 * omt * t * pCurr.y + t * t * by,
      });
    }
  }

  // 2. Densely subdivide every segment along arc-length (~1.8px steps)
  const sampled2D: Array<{ x: number; y: number }> = [filleted2D[0]];
  const sampleStepPx = 1.8;
  for (let i = 0; i < filleted2D.length - 1; i++) {
    const a = filleted2D[i];
    const b = filleted2D[i + 1];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    if (segLen < 0.05) continue;
    const steps = Math.max(1, Math.ceil(segLen / sampleStepPx));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      sampled2D.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      });
    }
  }

  // Ensure at least 5 sample points
  if (sampled2D.length < 5 && sampled2D.length >= 2) {
    const first = sampled2D[0];
    const last = sampled2D[sampled2D.length - 1];
    sampled2D.length = 0;
    for (let s = 0; s <= 6; s++) {
      const t = s / 6;
      sampled2D.push({
        x: first.x + (last.x - first.x) * t,
        y: first.y + (last.y - first.y) * t,
      });
    }
  }

  // 3. Evaluate exact 3D fluid support elevation at each sample point
  const rawElevs = sampled2D.map(
    (pt) => evaluateFluidCableSupportElev3D(pt.x, pt.y, allObjs, objectElevYMap).elevY + wireRadius
  );

  // Exact anchor for start / end points terminating on equipment racks
  const startPt = pts2D[0];
  const endPt = pts2D[pts2D.length - 1];
  for (const o of allObjs) {
    if (!isRackObject(o)) continue;
    const ob = getRotatedObjectBounds(o);
    if (startPt.x >= ob.minX - 16 && startPt.x <= ob.maxX + 16 && startPt.y >= ob.minY - 16 && startPt.y <= ob.maxY + 16) {
      const rInfo = getRackTopElevY(o, allObjs, objectElevYMap);
      rawElevs[0] = rInfo.topY + wireRadius;
      if (rawElevs.length > 1) {
        rawElevs[1] = Math.min(rawElevs[1], rInfo.topY + wireRadius + 0.25);
      }
    }
    if (endPt.x >= ob.minX - 16 && endPt.x <= ob.maxX + 16 && endPt.y >= ob.minY - 16 && endPt.y <= ob.maxY + 16) {
      const rInfo = getRackTopElevY(o, allObjs, objectElevYMap);
      rawElevs[rawElevs.length - 1] = rInfo.topY + wireRadius;
      if (rawElevs.length > 2) {
        rawElevs[rawElevs.length - 2] = Math.min(rawElevs[rawElevs.length - 2], rInfo.topY + wireRadius + 0.25);
      }
    }
  }

  const smoothElevs = [...rawElevs];

  // 4. Multi-pass fluid vertical waterfall curve filter along the cable path
  for (let pass = 0; pass < 3; pass++) {
    const next = [...smoothElevs];
    for (let i = 1; i < smoothElevs.length - 1; i++) {
      next[i] = 0.25 * smoothElevs[i - 1] + 0.5 * smoothElevs[i] + 0.25 * smoothElevs[i + 1];
    }
    // Fixed anchors at terminals
    next[0] = rawElevs[0];
    next[next.length - 1] = rawElevs[rawElevs.length - 1];
    for (let i = 0; i < smoothElevs.length; i++) {
      smoothElevs[i] = next[i];
    }
  }

  return sampled2D.map(
    (pt, idx) =>
      new THREE.Vector3((pt.x - cX) * s3D, smoothElevs[idx], (pt.y - cY) * s3D)
  );
}
