/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { buildShelterDoorPivot } from './shelter-door-pivot';
import { buildShelterWallCutouts } from './shelter-wall-cutouts';

export interface ShelterWallDoorParams {
  w: number;
  d: number;
  padH: number;
  wallH: number;
  t: number;
  doorWall: 'north' | 'south' | 'east' | 'west';
  doorOffsetPct: number;
  extWallMat: THREE.Material;
  stainlessMat: THREE.Material;
  props?: Record<string, any>;
  doorInteractiveNodesRef?: any;
}

export function buildShelterWallsAndDoor(
  group: THREE.Group,
  params: ShelterWallDoorParams
): { doorCenterPos: THREE.Vector3 } {
  const {
    w,
    d,
    padH,
    wallH,
    t,
    doorWall,
    doorOffsetPct,
    extWallMat,
    stainlessMat,
    props,
    doorInteractiveNodesRef,
  } = params;

  const doorWidthMm =
    props?.doorWidthMm ??
    props?.doorDiameter ??
    props?.doorDiameterMm ??
    900;
  const baseDoorW = (Number(doorWidthMm) / 1000) * 10;
  const wallSpan = doorWall === 'north' || doorWall === 'south' ? w : d;
  const maxDoorW = Math.max(4.0, wallSpan - t * 2 - 2.0);
  const doorW = Math.max(4.0, Math.min(maxDoorW, baseDoorW));
  const doorH = wallH * 0.78;
  const frameTrimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.7,
  });

  const doorCenterPos = buildShelterWallCutouts(group, {
    w,
    d,
    padH,
    wallH,
    t,
    doorWall,
    doorOffsetPct,
    doorW,
    doorH,
    extWallMat,
    frameTrimMat,
  });

  const doorPivot = buildShelterDoorPivot(group, {
    w,
    d,
    padH,
    wallH,
    doorW,
    doorH,
    t,
    doorWall,
    doorOffsetPct,
    stainlessMat,
    props,
    doorInteractiveNodesRef,
  });

  const doorAnchor = new THREE.Object3D();
  doorAnchor.position.copy(doorCenterPos);
  group.add(doorAnchor);

  if (props?.objId && doorInteractiveNodesRef?.current) {
    let openState = props?.doorsOpen === true;
    doorInteractiveNodesRef.current.set(props.objId, {
      id: props.objId,
      name: 'Cabin Door',
      doorType: 'cabin-door',
      mesh: doorPivot,
      anchor: doorAnchor,
      isOpen: () => openState,
      setOpen: (open: boolean) => {
        openState = open;
        if (doorWall === 'north' || doorWall === 'west') {
          doorPivot.rotation.y = open ? -Math.PI * 0.48 : 0;
        } else {
          doorPivot.rotation.y = open ? Math.PI * 0.48 : 0;
        }
      },
      getWorldPosition: (outVec?: THREE.Vector3) => {
        const v = outVec || new THREE.Vector3();
        doorAnchor.getWorldPosition(v);
        return v;
      },
    });
  }

  return { doorCenterPos };
}
