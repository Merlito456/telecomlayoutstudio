/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../types/cad';
import { isCableLadderObject, isRackObject, getUnpackedCADObjects } from '../../../utils/cad-geometry';
import { CoordTransform } from '../scene/types';
import { getRackTopElevY } from '../cable-3d-utils';

export interface CableRaycastResult {
  hitCadObj: CADObject | null;
  rawX2D: number;
  rawY2D: number;
  foundCableId: string | null;
  foundCableObj: CADObject | null;
  hitPt3D: THREE.Vector3;
}

export function performRoamCableRaycast(
  raycaster: THREE.Raycaster,
  cam: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  cablesGroup: THREE.Group | null,
  objects: CADObject[],
  objectElevYMap: Map<string, number>,
  coordTransform: CoordTransform,
  projectOntoSegment2D: (px: number, py: number, ax: number, ay: number, bx: number, by: number) => { dist: number }
): CableRaycastResult {
  const { centerX: cX, centerY: cY, scale3D: s3D } = coordTransform;

  const candidateObjs = getUnpackedCADObjects(objects);

  let hitCadObj: CADObject | null = null;
  const hitPt = new THREE.Vector3();
  let hasMeshHit = false;
  let bestHitDist = Infinity;

  // 1. Cable ladders plane intersection
  for (const lad of candidateObjs) {
    if (!isCableLadderObject(lad)) continue;
    const ladBaseY = objectElevYMap.get(lad.id) ?? ((lad as any).elevationMm ? (((lad as any).elevationMm / 1000) * 6.0) : 0);
    const sId = (lad.stencilId || lad.customProps?.stencilType || '').toLowerCase();
    const lType =
      lad.ladderType ||
      lad.customProps?.ladderType ||
      (sId.includes('cabin-feeder')
        ? 'cabin-feeder'
        : sId.includes('indoor')
        ? 'indoor'
        : 'basepad');
    const ladTopY =
      ladBaseY > 8
        ? ladBaseY + 0.65
        : lType === 'cabin-feeder'
        ? ladBaseY + 15.7
        : lType === 'indoor'
        ? 20.8
        : ladBaseY + 1.25;
    const ladPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -ladTopY);
    const planeHit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(ladPlane, planeHit)) {
      const dist = planeHit.distanceTo(cam.position);
      if (dist < 420 && dist < bestHitDist) {
        const testX2D = planeHit.x / s3D + cX;
        const testY2D = planeHit.z / s3D + cY;
        const cx = lad.x + (lad.width || 0) / 2;
        const cy = lad.y + (lad.height || 0) / 2;
        const hw = (lad.width || 0) / 2;
        const hh = (lad.height || 0) / 2;
        const rad = -((lad.rotation || 0) * Math.PI) / 180;
        const dx = testX2D - cx;
        const dy = testY2D - cy;
        const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
        if (Math.abs(lx) <= hw + 3.0 && Math.abs(ly) <= hh + 3.0) {
          bestHitDist = dist;
          hitCadObj = lad;
          hitPt.copy(planeHit);
          hasMeshHit = true;
        }
      }
    }
  }

  // 1.5. Equipment racks plane intersection (at rack top surface)
  for (const rk of candidateObjs) {
    if (!isRackObject(rk)) continue;
    const { topY } = getRackTopElevY(rk, candidateObjs, objectElevYMap);
    const rkPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
    const planeHit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(rkPlane, planeHit)) {
      const dist = planeHit.distanceTo(cam.position);
      if (dist < 420 && dist < bestHitDist) {
        const testX2D = planeHit.x / s3D + cX;
        const testY2D = planeHit.z / s3D + cY;
        const cx = rk.x + (rk.width || 0) / 2;
        const cy = rk.y + (rk.height || 0) / 2;
        const hw = (rk.width || 0) / 2;
        const hh = (rk.height || 0) / 2;
        const rad = -((rk.rotation || 0) * Math.PI) / 180;
        const dx = testX2D - cx;
        const dy = testY2D - cy;
        const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
        if (Math.abs(lx) <= hw + 3.5 && Math.abs(ly) <= hh + 3.5) {
          bestHitDist = dist;
          hitCadObj = rk;
          hitPt.copy(planeHit);
          hasMeshHit = true;
        }
      }
    }
  }

  // 2. Scene meshes intersection
  if (scene && scene.children.length > 0) {
    const meshHits = raycaster.intersectObjects(scene.children, true);
    for (const mh of meshHits) {
      if (mh.distance > 420) continue;
      // Skip transparent shelter roof or walls to allow raycasting inside
      if (
        mh.object.userData?.isCabinRoof ||
        mh.object.userData?.isShelterRoof ||
        mh.object.name === 'shelterRoof' ||
        ((mh.object as any).material?.transparent && (mh.object as any).material?.opacity < 0.75)
      ) {
        continue;
      }
      if (hasMeshHit && bestHitDist <= mh.distance + 1.2) break;

      let currObj: THREE.Object3D | null = mh.object;
      while (currObj && !currObj.userData?.cadObjectId && !currObj.userData?.isRack && !currObj.userData?.isLadder) {
        currObj = currObj.parent;
      }

      if (currObj) {
        const isRackMesh = currObj.userData?.isRack;
        const isLadderMesh = currObj.userData?.isLadder;
        const cadId = currObj.userData?.cadObjectId;

        if (isRackMesh || isLadderMesh) {
          const candidate = candidateObjs.find((o) => o.id === cadId);
          hitCadObj = candidate || ({
            id: cadId || (isRackMesh ? 'rack-surface-hit' : 'ladder-surface-hit'),
            type: 'stencil-group',
            name: currObj.userData.rackName || currObj.userData.ladderName || (isRackMesh ? 'Equipment Rack' : 'Overhead Cable Ladder'),
            category: isRackMesh ? 'rack' : 'ladder',
            stencilId: isRackMesh ? 'rack-power-rectifier' : 'indoor-ladder',
          } as any);
          hitPt.copy(mh.point);
          bestHitDist = mh.distance;
          hasMeshHit = true;
          break;
        }

        if (cadId) {
          const candidate = candidateObjs.find((o) => o.id === cadId);
          if (candidate) {
            if (
              candidate.type === 'line' ||
              candidate.type === 'polyline' ||
              candidate.type === 'pen'
            ) {
              continue;
            }
            const s = (
              candidate.stencilId ||
              candidate.customProps?.stencilType ||
              ''
            ).toLowerCase();
            if (s.includes('fence') || s.includes('wall') || s.includes('tree')) {
              continue;
            }
            hitCadObj = candidate;
            hitPt.copy(mh.point);
            hasMeshHit = true;
            break;
          }
        }
      }
    }
  }

  // 3. Fallback ground / tray plane
  if (!hasMeshHit) {
    const trayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.79);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.2);
    let hasHit = raycaster.ray.intersectPlane(trayPlane, hitPt);
    if (!hasHit || hitPt.distanceTo(cam.position) > 380) {
      hasHit = raycaster.ray.intersectPlane(groundPlane, hitPt);
    }
    if (!hasHit || hitPt.distanceTo(cam.position) > 380) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      hitPt.copy(cam.position).addScaledVector(forward, 22);
      hitPt.y = 2.79;
    }
  }

  const rawX2D = hitPt.x / s3D + cX;
  const rawY2D = hitPt.z / s3D + cY;

  // 4. Find targeted cable
  let foundCableId: string | null = null;
  let foundCableObj: CADObject | null = null;
  if (cablesGroup && cablesGroup.children.length > 0) {
    const hits = raycaster.intersectObjects(cablesGroup.children, true);
    if (hits.length > 0) {
      let curr: THREE.Object3D | null = hits[0].object;
      while (curr && !curr.userData?.cadObjectId) {
        curr = curr.parent;
      }
      if (curr?.userData?.cadObjectId) {
        foundCableId = curr.userData.cadObjectId;
      }
    }
  }

  if (!foundCableId) {
    let bestWireDist = 14;
    for (const o of objects) {
      if (o.type === 'line') {
        const x1 = o.x;
        const y1 = o.y;
        const x2 = o.x2 ?? o.x + (o.width || 0);
        const y2 = o.y2 ?? o.y + (o.height || 0);
        const d = projectOntoSegment2D(rawX2D, rawY2D, x1, y1, x2, y2).dist;
        if (d < bestWireDist) {
          bestWireDist = d;
          foundCableId = o.id;
        }
      } else if (
        (o.type === 'polyline' || o.type === 'pen') &&
        o.points &&
        o.points.length > 1
      ) {
        for (let i = 0; i < o.points.length - 1; i++) {
          const x1 = o.x + o.points[i].x;
          const y1 = o.y + o.points[i].y;
          const x2 = o.x + o.points[i + 1].x;
          const y2 = o.y + o.points[i + 1].y;
          const d = projectOntoSegment2D(rawX2D, rawY2D, x1, y1, x2, y2).dist;
          if (d < bestWireDist) {
            bestWireDist = d;
            foundCableId = o.id;
          }
        }
      }
    }
  }

  if (foundCableId) {
    foundCableObj = objects.find((o) => o.id === foundCableId) || null;
  }

  return {
    hitCadObj,
    rawX2D,
    rawY2D,
    foundCableId,
    foundCableObj,
    hitPt3D: hitPt,
  };
}
