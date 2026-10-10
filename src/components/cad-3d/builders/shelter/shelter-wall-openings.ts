/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ShelterWallOpeningsParams {
  group: THREE.Group;
  w: number;
  d: number;
  padH: number;
  wallH: number;
  t: number;
  doorH: number;
  doorW: number;
  headerH: number;
  doorWall: 'north' | 'south' | 'east' | 'west';
  doorOffsetPct: number;
  extWallMat: THREE.Material;
  frameTrimMat: THREE.Material;
}

export function buildShelterWallOpenings(params: ShelterWallOpeningsParams): THREE.Vector3 {
  const {
    group,
    w,
    d,
    padH,
    wallH,
    t,
    doorH,
    doorW,
    headerH,
    doorWall,
    doorOffsetPct,
    extWallMat,
    frameTrimMat,
  } = params;

  const doorCenterPos = new THREE.Vector3(0, padH + doorH / 2, 0);

  if (doorWall === 'south') {
    const minOff = -w / 2 + t + doorW / 2 + 0.6;
    const maxOff = w / 2 - t - doorW / 2 - 0.6;
    const doorCenterX = Math.max(minOff, Math.min(maxOff, w * (doorOffsetPct / 100 - 0.5)));
    doorCenterPos.set(doorCenterX, padH + doorH / 2, d / 2);
    const doorX1 = doorCenterX - doorW / 2;
    const doorX2 = doorCenterX + doorW / 2;

    const wLeft = doorX1 - (-w / 2);
    if (wLeft > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(wLeft, wallH, t), extWallMat);
      m.position.set(-w / 2 + wLeft / 2, padH + wallH / 2, d / 2 - t / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const wRight = w / 2 - doorX2;
    if (wRight > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(wRight, wallH, t), extWallMat);
      m.position.set(doorX2 + wRight / 2, padH + wallH / 2, d / 2 - t / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const hdr = new THREE.Mesh(new THREE.BoxGeometry(doorW, headerH, t), extWallMat);
    hdr.position.set(doorCenterX, padH + doorH + headerH / 2, d / 2 - t / 2);
    hdr.castShadow = true;
    group.add(hdr);

    const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.3, doorH, t + 0.2), frameTrimMat);
    jambL.position.set(doorX1 + 0.15, padH + doorH / 2, d / 2 - t / 2);
    group.add(jambL);
    const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.3, doorH, t + 0.2), frameTrimMat);
    jambR.position.set(doorX2 - 0.15, padH + doorH / 2, d / 2 - t / 2);
    group.add(jambR);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.3, t + 0.2), frameTrimMat);
    lintel.position.set(doorCenterX, padH + doorH - 0.15, d / 2 - t / 2);
    group.add(lintel);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.15, t + 0.3), frameTrimMat);
    sill.position.set(doorCenterX, padH + 0.08, d / 2 - t / 2);
    group.add(sill);

    const northWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, t), extWallMat);
    northWall.position.set(0, padH + wallH / 2, -d / 2 + t / 2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    group.add(northWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, d - 2 * t), extWallMat);
    westWall.position.set(-w / 2 + t / 2, padH + wallH / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    group.add(westWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, d - 2 * t), extWallMat);
    eastWall.position.set(w / 2 - t / 2, padH + wallH / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    group.add(eastWall);
  } else if (doorWall === 'north') {
    const minOff = -w / 2 + t + doorW / 2 + 0.6;
    const maxOff = w / 2 - t - doorW / 2 - 0.6;
    const doorCenterX = Math.max(minOff, Math.min(maxOff, w * (doorOffsetPct / 100 - 0.5)));
    doorCenterPos.set(doorCenterX, padH + doorH / 2, -d / 2);
    const doorX1 = doorCenterX - doorW / 2;
    const doorX2 = doorCenterX + doorW / 2;

    const wLeft = doorX1 - (-w / 2);
    if (wLeft > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(wLeft, wallH, t), extWallMat);
      m.position.set(-w / 2 + wLeft / 2, padH + wallH / 2, -d / 2 + t / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const wRight = w / 2 - doorX2;
    if (wRight > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(wRight, wallH, t), extWallMat);
      m.position.set(doorX2 + wRight / 2, padH + wallH / 2, -d / 2 + t / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const hdr = new THREE.Mesh(new THREE.BoxGeometry(doorW, headerH, t), extWallMat);
    hdr.position.set(doorCenterX, padH + doorH + headerH / 2, -d / 2 + t / 2);
    hdr.castShadow = true;
    group.add(hdr);

    const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.3, doorH, t + 0.2), frameTrimMat);
    jambL.position.set(doorX1 + 0.15, padH + doorH / 2, -d / 2 + t / 2);
    group.add(jambL);
    const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.3, doorH, t + 0.2), frameTrimMat);
    jambR.position.set(doorX2 - 0.15, padH + doorH / 2, -d / 2 + t / 2);
    group.add(jambR);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.3, t + 0.2), frameTrimMat);
    lintel.position.set(doorCenterX, padH + doorH - 0.15, -d / 2 + t / 2);
    group.add(lintel);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.15, t + 0.3), frameTrimMat);
    sill.position.set(doorCenterX, padH + 0.08, -d / 2 + t / 2);
    group.add(sill);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, t), extWallMat);
    southWall.position.set(0, padH + wallH / 2, d / 2 - t / 2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    group.add(southWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, d - 2 * t), extWallMat);
    westWall.position.set(-w / 2 + t / 2, padH + wallH / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    group.add(westWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, d - 2 * t), extWallMat);
    eastWall.position.set(w / 2 - t / 2, padH + wallH / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    group.add(eastWall);
  } else if (doorWall === 'east') {
    const minOff = -d / 2 + t + doorW / 2 + 0.6;
    const maxOff = d / 2 - t - doorW / 2 - 0.6;
    const doorCenterZ = Math.max(minOff, Math.min(maxOff, d * (doorOffsetPct / 100 - 0.5)));
    doorCenterPos.set(w / 2, padH + doorH / 2, doorCenterZ);
    const doorZ1 = doorCenterZ - doorW / 2;
    const doorZ2 = doorCenterZ + doorW / 2;

    const dFront = doorZ1 - (-d / 2);
    if (dFront > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, dFront), extWallMat);
      m.position.set(w / 2 - t / 2, padH + wallH / 2, -d / 2 + dFront / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const dBack = d / 2 - doorZ2;
    if (dBack > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, dBack), extWallMat);
      m.position.set(w / 2 - t / 2, padH + wallH / 2, doorZ2 + dBack / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const hdr = new THREE.Mesh(new THREE.BoxGeometry(t, headerH, doorW), extWallMat);
    hdr.position.set(w / 2 - t / 2, padH + doorH + headerH / 2, doorCenterZ);
    hdr.castShadow = true;
    group.add(hdr);

    const jamb1 = new THREE.Mesh(new THREE.BoxGeometry(t + 0.2, doorH, 0.3), frameTrimMat);
    jamb1.position.set(w / 2 - t / 2, padH + doorH / 2, doorZ1 + 0.15);
    group.add(jamb1);
    const jamb2 = new THREE.Mesh(new THREE.BoxGeometry(t + 0.2, doorH, 0.3), frameTrimMat);
    jamb2.position.set(w / 2 - t / 2, padH + doorH / 2, doorZ2 - 0.15);
    group.add(jamb2);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(t + 0.2, 0.3, doorW), frameTrimMat);
    lintel.position.set(w / 2 - t / 2, padH + doorH - 0.15, doorCenterZ);
    group.add(lintel);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(t + 0.3, 0.15, doorW), frameTrimMat);
    sill.position.set(w / 2 - t / 2, padH + 0.08, doorCenterZ);
    group.add(sill);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, d), extWallMat);
    westWall.position.set(-w / 2 + t / 2, padH + wallH / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    group.add(westWall);

    const northWall = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * t, wallH, t), extWallMat);
    northWall.position.set(0, padH + wallH / 2, -d / 2 + t / 2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    group.add(northWall);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * t, wallH, t), extWallMat);
    southWall.position.set(0, padH + wallH / 2, d / 2 - t / 2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    group.add(southWall);
  } else {
    // west
    const minOff = -d / 2 + t + doorW / 2 + 0.6;
    const maxOff = d / 2 - t - doorW / 2 - 0.6;
    const doorCenterZ = Math.max(minOff, Math.min(maxOff, d * (doorOffsetPct / 100 - 0.5)));
    doorCenterPos.set(-w / 2, padH + doorH / 2, doorCenterZ);
    const doorZ1 = doorCenterZ - doorW / 2;
    const doorZ2 = doorCenterZ + doorW / 2;

    const dFront = doorZ1 - (-d / 2);
    if (dFront > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, dFront), extWallMat);
      m.position.set(-w / 2 + t / 2, padH + wallH / 2, -d / 2 + dFront / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const dBack = d / 2 - doorZ2;
    if (dBack > 0.1) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, dBack), extWallMat);
      m.position.set(-w / 2 + t / 2, padH + wallH / 2, doorZ2 + dBack / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const hdr = new THREE.Mesh(new THREE.BoxGeometry(t, headerH, doorW), extWallMat);
    hdr.position.set(-w / 2 + t / 2, padH + doorH + headerH / 2, doorCenterZ);
    hdr.castShadow = true;
    group.add(hdr);

    const jamb1 = new THREE.Mesh(new THREE.BoxGeometry(t + 0.2, doorH, 0.3), frameTrimMat);
    jamb1.position.set(-w / 2 + t / 2, padH + doorH / 2, doorZ1 + 0.15);
    group.add(jamb1);
    const jamb2 = new THREE.Mesh(new THREE.BoxGeometry(t + 0.2, doorH, 0.3), frameTrimMat);
    jamb2.position.set(-w / 2 + t / 2, padH + doorH / 2, doorZ2 - 0.15);
    group.add(jamb2);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(t + 0.2, 0.3, doorW), frameTrimMat);
    lintel.position.set(-w / 2 + t / 2, padH + doorH - 0.15, doorCenterZ);
    group.add(lintel);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(t + 0.3, 0.15, doorW), frameTrimMat);
    sill.position.set(-w / 2 + t / 2, padH + 0.08, doorCenterZ);
    group.add(sill);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, d), extWallMat);
    eastWall.position.set(w / 2 - t / 2, padH + wallH / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    group.add(eastWall);

    const northWall = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * t, wallH, t), extWallMat);
    northWall.position.set(0, padH + wallH / 2, -d / 2 + t / 2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    group.add(northWall);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * t, wallH, t), extWallMat);
    southWall.position.set(0, padH + wallH / 2, d / 2 - t / 2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    group.add(southWall);
  }

  return doorCenterPos;
}
