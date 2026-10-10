/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ShelterDoorLeafParams {
  group: THREE.Group;
  w: number;
  d: number;
  padH: number;
  doorH: number;
  doorW: number;
  t: number;
  doorWall: 'north' | 'south' | 'east' | 'west';
  doorOffsetPct: number;
  doorCenterPos: THREE.Vector3;
  stainlessMat: THREE.Material;
  props?: Record<string, any>;
  doorInteractiveNodesRef?: any;
}

export function buildShelterDoorLeaf(params: ShelterDoorLeafParams) {
  const {
    group,
    w,
    d,
    padH,
    doorH,
    doorW,
    t,
    doorWall,
    doorOffsetPct,
    doorCenterPos,
    stainlessMat,
    props,
    doorInteractiveNodesRef,
  } = params;

  const isDoorOpen = props?.doorsOpen === true;
  const doorPivot = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.6 });

  if (doorWall === 'south') {
    const minOff = -w / 2 + t + doorW / 2 + 0.6;
    const maxOff = w / 2 - t - doorW / 2 - 0.6;
    const doorCenterX = Math.max(minOff, Math.min(maxOff, w * (doorOffsetPct / 100 - 0.5)));
    const doorHingeX = doorCenterX - doorW / 2;

    doorPivot.position.set(doorHingeX, 0, d / 2);
    doorPivot.rotation.y = isDoorOpen ? Math.PI * 0.48 : 0;

    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.2, doorH - 0.2, 0.4), doorMat);
    door.position.set(doorW / 2, padH + doorH / 2, 0);
    door.castShadow = true;
    doorPivot.add(door);

    const kickplate = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.6, 2.0, 0.06), stainlessMat);
    kickplate.position.set(doorW / 2, padH + 1.2, 0.22);
    doorPivot.add(kickplate);

    const hndlExt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.6), stainlessMat);
    hndlExt.position.set(doorW * 0.85, padH + doorH * 0.5, 0.4);
    doorPivot.add(hndlExt);
    const hndlInt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.6), stainlessMat);
    hndlInt.position.set(doorW * 0.85, padH + doorH * 0.5, -0.4);
    doorPivot.add(hndlInt);

    group.add(doorPivot);
  } else if (doorWall === 'north') {
    const minOff = -w / 2 + t + doorW / 2 + 0.6;
    const maxOff = w / 2 - t - doorW / 2 - 0.6;
    const doorCenterX = Math.max(minOff, Math.min(maxOff, w * (doorOffsetPct / 100 - 0.5)));
    const doorHingeX = doorCenterX - doorW / 2;

    doorPivot.position.set(doorHingeX, 0, -d / 2);
    doorPivot.rotation.y = isDoorOpen ? -Math.PI * 0.48 : 0;

    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.2, doorH - 0.2, 0.4), doorMat);
    door.position.set(doorW / 2, padH + doorH / 2, 0);
    door.castShadow = true;
    doorPivot.add(door);

    const kickplate = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.6, 2.0, 0.06), stainlessMat);
    kickplate.position.set(doorW / 2, padH + 1.2, -0.22);
    doorPivot.add(kickplate);

    const hndlExt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.6), stainlessMat);
    hndlExt.position.set(doorW * 0.85, padH + doorH * 0.5, -0.4);
    doorPivot.add(hndlExt);
    const hndlInt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.6), stainlessMat);
    hndlInt.position.set(doorW * 0.85, padH + doorH * 0.5, 0.4);
    doorPivot.add(hndlInt);

    group.add(doorPivot);
  } else if (doorWall === 'east') {
    const minOff = -d / 2 + t + doorW / 2 + 0.6;
    const maxOff = d / 2 - t - doorW / 2 - 0.6;
    const doorCenterZ = Math.max(minOff, Math.min(maxOff, d * (doorOffsetPct / 100 - 0.5)));
    const doorHingeZ = doorCenterZ - doorW / 2;

    doorPivot.position.set(w / 2, 0, doorHingeZ);
    doorPivot.rotation.y = isDoorOpen ? Math.PI * 0.48 : 0;

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, doorH - 0.2, doorW - 0.2), doorMat);
    door.position.set(0, padH + doorH / 2, doorW / 2);
    door.castShadow = true;
    doorPivot.add(door);

    const kickplate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, doorW - 0.6), stainlessMat);
    kickplate.position.set(0.22, padH + 1.2, doorW / 2);
    doorPivot.add(kickplate);

    const hndlExt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 1.6), stainlessMat);
    hndlExt.position.set(0.4, padH + doorH * 0.5, doorW * 0.85);
    doorPivot.add(hndlExt);
    const hndlInt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 1.6), stainlessMat);
    hndlInt.position.set(-0.4, padH + doorH * 0.5, doorW * 0.85);
    doorPivot.add(hndlInt);

    group.add(doorPivot);
  } else {
    // west
    const minOff = -d / 2 + t + doorW / 2 + 0.6;
    const maxOff = d / 2 - t - doorW / 2 - 0.6;
    const doorCenterZ = Math.max(minOff, Math.min(maxOff, d * (doorOffsetPct / 100 - 0.5)));
    const doorHingeZ = doorCenterZ - doorW / 2;

    doorPivot.position.set(-w / 2, 0, doorHingeZ);
    doorPivot.rotation.y = isDoorOpen ? -Math.PI * 0.48 : 0;

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, doorH - 0.2, doorW - 0.2), doorMat);
    door.position.set(0, padH + doorH / 2, doorW / 2);
    door.castShadow = true;
    doorPivot.add(door);

    const kickplate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, doorW - 0.6), stainlessMat);
    kickplate.position.set(-0.22, padH + 1.2, doorW / 2);
    doorPivot.add(kickplate);

    const hndlExt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 1.6), stainlessMat);
    hndlExt.position.set(-0.4, padH + doorH * 0.5, doorW * 0.85);
    doorPivot.add(hndlExt);
    const hndlInt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 1.6), stainlessMat);
    hndlInt.position.set(0.4, padH + doorH * 0.5, doorW * 0.85);
    doorPivot.add(hndlInt);

    group.add(doorPivot);
  }

  const doorAnchor = new THREE.Object3D();
  doorAnchor.position.copy(doorCenterPos);
  group.add(doorAnchor);

  if (props?.objId && doorInteractiveNodesRef?.current) {
    let openState = isDoorOpen;
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
}
