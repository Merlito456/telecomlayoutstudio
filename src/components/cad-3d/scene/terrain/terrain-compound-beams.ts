/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ExcavatedZone3D, YardBounds3D } from '../types';

export function buildCompoundPerimeterGradeBeams(
  scene: THREE.Scene,
  yardBounds: YardBounds3D,
  excavatedZones: ExcavatedZone3D[],
  cementMat: THREE.MeshStandardMaterial
) {
  const { yard3DMinX, yard3DMaxX, yard3DMinZ, yard3DMaxZ, yardWidth, yardDepth, yardMidX, yardMidZ } = yardBounds;
  const curbH = 1.6;
  const curbW = 2.4;

  const getEdgeExcavation = (mX1: number, mX2: number, mZ1: number, mZ2: number) => {
    let maxD = 0;
    excavatedZones.forEach((ez) => {
      if (!(mX2 < ez.minX - 2.5 || mX1 > ez.maxX + 2.5 || mZ2 < ez.minZ - 2.5 || mZ1 > ez.maxZ + 2.5)) {
        maxD = Math.max(maxD, ez.depth3D);
      }
    });
    return maxD;
  };

  const northD = getEdgeExcavation(yard3DMinX, yard3DMaxX, yard3DMinZ - 1, yard3DMinZ + 1);
  const curbNorthH = curbH + northD;
  const curbNorth = new THREE.Mesh(new THREE.BoxGeometry(yardWidth + curbW, curbNorthH, curbW), cementMat);
  curbNorth.position.set(yardMidX, (curbH - northD) / 2 - 0.1, yard3DMinZ);
  curbNorth.castShadow = true;
  curbNorth.receiveShadow = true;
  scene.add(curbNorth);

  const southD = getEdgeExcavation(yard3DMinX, yard3DMaxX, yard3DMaxZ - 1, yard3DMaxZ + 1);
  const curbSouthH = curbH + southD;
  const curbSouth = new THREE.Mesh(new THREE.BoxGeometry(yardWidth + curbW, curbSouthH, curbW), cementMat);
  curbSouth.position.set(yardMidX, (curbH - southD) / 2 - 0.1, yard3DMaxZ);
  curbSouth.castShadow = true;
  curbSouth.receiveShadow = true;
  scene.add(curbSouth);

  const eastD = getEdgeExcavation(yard3DMaxX - 1, yard3DMaxX + 1, yard3DMinZ, yard3DMaxZ);
  const curbEastH = curbH + eastD;
  const curbEast = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbEastH, yardDepth + curbW), cementMat);
  curbEast.position.set(yard3DMaxX, (curbH - eastD) / 2 - 0.1, yardMidZ);
  curbEast.castShadow = true;
  curbEast.receiveShadow = true;
  scene.add(curbEast);

  const westD = getEdgeExcavation(yard3DMinX - 1, yard3DMinX + 1, yard3DMinZ, yard3DMaxZ);
  const curbWestH = curbH + westD;
  const curbWest = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbWestH, yardDepth + curbW), cementMat);
  curbWest.position.set(yard3DMinX, (curbH - westD) / 2 - 0.1, yardMidZ);
  curbWest.castShadow = true;
  curbWest.receiveShadow = true;
  scene.add(curbWest);

  [
    [yard3DMinX, yard3DMinZ],
    [yard3DMaxX, yard3DMinZ],
    [yard3DMinX, yard3DMaxZ],
    [yard3DMaxX, yard3DMaxZ],
  ].forEach(([cx, cz]) => {
    const cornerD = getEdgeExcavation(cx - 2, cx + 2, cz - 2, cz + 2);
    const totalPilH = curbH * 1.8 + cornerD;
    const cPil = new THREE.Mesh(new THREE.BoxGeometry(curbW * 1.5, totalPilH, curbW * 1.5), cementMat);
    cPil.position.set(cx, (curbH * 1.8 - cornerD) / 2 - 0.1, cz);
    cPil.castShadow = true;
    cPil.receiveShadow = true;
    scene.add(cPil);
  });
}
