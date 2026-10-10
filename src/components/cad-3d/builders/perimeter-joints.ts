/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../materials';

export interface PerimeterSegment {
  id: string;
  isCement: boolean;
  p1: { x: number; z: number };
  p2: { x: number; z: number };
  height: number;
}

export interface ExcavatedZone {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  depth3D: number;
}

export function buildPerimeterCornerJoints(
  perimeterSegments: PerimeterSegment[],
  excavatedZones: ExcavatedZone[],
  mats: CAD3DSharedMaterials,
  scene: THREE.Scene
) {
  const { cementMat, galvSteelMat } = mats;
  const cornerJoints: { x: number; z: number; isCement: boolean }[] = [];
  const cornerThresh = 7.5; // Distance threshold to detect meeting endpoints

  for (let i = 0; i < perimeterSegments.length; i++) {
    const segA = perimeterSegments[i];
    const ptsA = [segA.p1, segA.p2];

    for (const ptA of ptsA) {
      // Check if this endpoint meets another segment's endpoint
      for (let j = i + 1; j < perimeterSegments.length; j++) {
        const segB = perimeterSegments[j];
        const ptsB = [segB.p1, segB.p2];
        for (const ptB of ptsB) {
          const dist = Math.hypot(ptA.x - ptB.x, ptA.z - ptB.z);
          if (dist <= cornerThresh) {
            const midX = (ptA.x + ptB.x) / 2;
            const midZ = (ptA.z + ptB.z) / 2;
            if (!cornerJoints.some((cj) => Math.hypot(cj.x - midX, cj.z - midZ) < 3.0)) {
              cornerJoints.push({ x: midX, z: midZ, isCement: segA.isCement || segB.isCement });
            }
          }
        }
      }
    }
  }

  // Build reinforced corner junction pilasters at all meeting corner joints
  const cornerColH = 21.0;
  const cornerColW = 3.8;
  for (const cj of cornerJoints) {
    const cornerGroup = new THREE.Group();

    // Check if this corner joint is in or near an excavated zone
    let cornerD = 0;
    excavatedZones.forEach((ez) => {
      if (
        !(
          cj.x < ez.minX - 3.5 ||
          cj.x > ez.maxX + 3.5 ||
          cj.z < ez.minZ - 3.5 ||
          cj.z > ez.maxZ + 3.5
        )
      ) {
        cornerD = Math.max(cornerD, ez.depth3D);
      }
    });

    const totalCornerH = cornerColH + cornerD;
    const cornerCenterY = (cornerColH - cornerD) / 2;

    // Concrete caisson pillar extending from lower ground to top of fence
    const colGeo = new THREE.BoxGeometry(cornerColW, totalCornerH, cornerColW);
    const colMesh = new THREE.Mesh(colGeo, cementMat);
    colMesh.position.y = cornerCenterY;
    colMesh.castShadow = true;
    colMesh.receiveShadow = true;
    cornerGroup.add(colMesh);

    // Coping cap (pyramid crown) at top
    const capGeo = new THREE.ConeGeometry(cornerColW * 0.75, 1.8, 4);
    const capMesh = new THREE.Mesh(capGeo, cementMat);
    capMesh.position.y = cornerColH + 0.9;
    capMesh.rotation.y = Math.PI / 4;
    cornerGroup.add(capMesh);

    // Top corner barbed wire extension stalk
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.2, 8), galvSteelMat);
    stalk.position.y = cornerColH + 2.0;
    cornerGroup.add(stalk);

    cornerGroup.position.set(cj.x, 0, cj.z);
    scene.add(cornerGroup);
  }
}
