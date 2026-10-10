/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../../types/cad';
import { getRotatedObjectBounds, isBasepadObject } from '../../../../utils/cad-geometry';

export interface LadderDispatchParams {
  obj: CADObject;
  stencilId: string;
  objW: number;
  objD: number;
  visible3DObjects: CADObject[];
  builders: any;
}

export function dispatchLadderMesh({
  obj,
  stencilId,
  objW,
  objD,
  visible3DObjects,
  builders,
}: LadderDispatchParams): THREE.Group | THREE.Mesh | null | undefined {
  const {
    buildBasepadLadder3D,
    buildCabinFeederLadder3D,
    buildIndoorLadder3D,
    buildConnectingLadder3D,
  } = builders.cableLadder;

  const sId = (stencilId || obj.customProps?.stencilType || '').toLowerCase();
  const name = String(obj.customProps?.name || (obj as any).name || obj.text || '').toLowerCase();
  const isLadderStencil =
    stencilId === 'basepad-ladder' ||
    stencilId === 'cabin-feeder-ladder' ||
    stencilId === 'indoor-ladder' ||
    stencilId === 'indoor-ladder-long' ||
    stencilId === 'indoor-ladder-junction' ||
    stencilId === 'fiber-raceway-yellow' ||
    stencilId === 'fiber-raceway' ||
    stencilId === 'connecting-ladder' ||
    stencilId === 'cable-ladder-top' ||
    stencilId === 'cable-ladder' ||
    stencilId === 'cable-tray' ||
    sId.includes('ladder') ||
    sId.includes('raceway') ||
    sId.includes('runway') ||
    sId.includes('tray') ||
    obj.ladderType !== undefined ||
    obj.customProps?.ladderType !== undefined ||
    name.includes('ladder') ||
    name.includes('raceway');

  if (!isLadderStencil) {
    return undefined;
  }

  const isIndoor =
    obj.ladderType === 'indoor' ||
    obj.customProps?.ladderType === 'indoor' ||
    obj.customProps?.placement === 'indoor' ||
    sId === 'indoor-ladder' ||
    sId === 'indoor-ladder-long' ||
    sId === 'indoor-ladder-junction' ||
    sId === 'in-shelter-ladder' ||
    sId === 'in-shelter-cable-ladder' ||
    sId === 'inshelter-ladder' ||
    sId === 'inshelter-cable-ladder' ||
    sId === 'fiber-raceway-yellow' ||
    sId === 'fiber-raceway' ||
    sId.includes('indoor') ||
    sId.includes('junction') ||
    sId.includes('raceway') ||
    sId.includes('in-shelter') ||
    sId.includes('inshelter') ||
    (sId.includes('shelter') && sId.includes('ladder')) ||
    name.includes('in-shelter') ||
    name.includes('inshelter') ||
    (name.includes('shelter') && name.includes('ladder'));

  const lType =
    obj.ladderType ||
    obj.customProps?.ladderType ||
    (sId.includes('cabin-feeder')
      ? 'cabin-feeder'
      : isIndoor
      ? 'indoor'
      : sId.includes('connecting')
      ? 'connecting'
      : 'basepad');
      const ob = getRotatedObjectBounds(obj);
      let centerOnPad = false;
      let touchesAnyPad = false;
      for (const pad of visible3DObjects) {
        if (!isBasepadObject(pad)) continue;
        const pb = getRotatedObjectBounds(pad);
        if (
          ob.centerX >= pb.minX &&
          ob.centerX <= pb.maxX &&
          ob.centerY >= pb.minY &&
          ob.centerY <= pb.maxY
        ) {
          centerOnPad = true;
        }
        if (
          !(
            ob.maxX < pb.minX - 45 ||
            ob.minX > pb.maxX + 45 ||
            ob.maxY < pb.minY - 45 ||
            ob.minY > pb.maxY + 45
          )
        ) {
          touchesAnyPad = true;
        }
      }
      const groundDropH = !centerOnPad && touchesAnyPad ? 1.2 : 0;

      if (lType === 'cabin-feeder') {
        let matchedFeederElev = 16.5;
        for (const other of visible3DObjects) {
          const oId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
          if (oId.includes('shelter')) {
            const shH = Math.max(2.0, Math.min(6.0, Number(other.shelterHeightM || other.customProps?.shelterHeightM || 3.0)));
            const customElev =
              other.cableHoleElevationMm ??
              other.feederElevationMm ??
              other.customProps?.cableHoleElevationMm ??
              other.customProps?.feederElevationMm;
            if (typeof customElev === 'number' && customElev > 0) {
              matchedFeederElev = (customElev / 1000) * 6.0;
            } else {
              matchedFeederElev = 3.5 + shH * 6.0 - 0.54;
            }
            break;
          }
        }
        return buildCabinFeederLadder3D(objW, objD, matchedFeederElev);
      } else if (lType === 'indoor') {
        return buildIndoorLadder3D(objW, objD);
      } else if (lType === 'connecting') {
        const hasElevatedTarget = visible3DObjects.some((other) => {
          if (other.id === obj.id || other.isStencilLabel) return false;
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
        return hasElevatedTarget
          ? buildConnectingLadder3D(objW, objD)
          : buildBasepadLadder3D(objW, objD, groundDropH);
  } else {
    return buildBasepadLadder3D(objW, objD, groundDropH);
  }
}
