/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createClimbingLadderBuilder(
  mats: CAD3DSharedMaterials
) {
  const { cementMat, galvSteelMat, stainlessMat, whiteCementMat } = mats;

  const buildCenterClimbingLadder3D = (ladderH: number, groundY = 0): THREE.Group => {
    const ladGroup = new THREE.Group();

    // 1. Concrete ground resting foundation pad at the base of the ladder (embedded into groundY down to groundY - 1.0 up to y = 1.2)
    const padBottomY = Math.min(0, groundY) - 1.0;
    const padTopY = 1.2;
    const padTotalH = padTopY - padBottomY;
    const basePad = new THREE.Mesh(new THREE.BoxGeometry(4.4, padTotalH, 4.0), cementMat);
    basePad.position.set(0, padBottomY + padTotalH / 2, 0);
    basePad.castShadow = true;
    basePad.receiveShadow = true;
    ladGroup.add(basePad);

    // Steel ladder base anchor footplates bolted to the concrete foundation pad
    [-0.85, 0.85].forEach((rx) => {
      const footPlate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 1.0), galvSteelMat);
      footPlate.position.set(rx, padTopY + 0.125, 0);
      ladGroup.add(footPlate);
    });

    // 2. Twin Vertical Structural Steel Stringers (Rails) from concrete pad (y = 0.2) all the way to top platform
    const railH = ladderH - 0.2;
    const railGeo = new THREE.BoxGeometry(0.28, railH, 0.45);
    const railLeft = new THREE.Mesh(railGeo, galvSteelMat);
    railLeft.position.set(-0.85, 0.2 + railH / 2, 0);
    railLeft.castShadow = true;
    ladGroup.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, galvSteelMat);
    railRight.position.set(0.85, 0.2 + railH / 2, 0);
    railRight.castShadow = true;
    ladGroup.add(railRight);

    // 3. Horizontal Anti-Slip Round Climbing Rungs every ~2.5 units from ground (y = 1.4) to top
    const rungSpacing = 2.5;
    const totalRungs = Math.floor(ladderH / rungSpacing);
    const rungGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.7, 8);

    for (let r = 1; r <= totalRungs; r++) {
      const ry = r * rungSpacing;
      if (ry > ladderH - 0.5) break;
      const rung = new THREE.Mesh(rungGeo, stainlessMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, ry, 0);
      ladGroup.add(rung);
    }

    // 4. Fall-Arrest Central Safety Cable running down the center of the rungs
    const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, ladderH - 1.2, 6);
    const cable = new THREE.Mesh(cableGeo, stainlessMat);
    cable.position.set(0, (ladderH + 1.2) / 2, 0.15);
    ladGroup.add(cable);

    // 5. OSHA Safety Cage Hoops starting at 6.0 units above ground (2.2m)
    const cageStartH = 6.0;
    if (ladderH > cageStartH + 4.0) {
      const hoopGeo = new THREE.TorusGeometry(1.5, 0.09, 8, 16, Math.PI);
      const hoopSpacing = 3.6;
      const numHoops = Math.floor((ladderH - cageStartH) / hoopSpacing);

      for (let h = 0; h <= numHoops; h++) {
        const hy = cageStartH + h * hoopSpacing;
        if (hy > ladderH - 1.0) break;
        const hoop = new THREE.Mesh(hoopGeo, galvSteelMat);
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(0, hy, 1.2);
        ladGroup.add(hoop);
      }

      // Vertical cage back-strap bars (3 bars around the hoops)
      const strapH = ladderH - cageStartH;
      const strapGeo = new THREE.BoxGeometry(0.08, strapH, 0.2);
      [-1.4, 0, 1.4].forEach((sx) => {
        const sz = sx === 0 ? 2.6 : 2.0;
        const strap = new THREE.Mesh(strapGeo, galvSteelMat);
        strap.position.set(sx, cageStartH + strapH / 2, sz);
        ladGroup.add(strap);
      });
    }

    // 6. Intermediate Rest / Landing Platforms every ~35 units for ultra tall towers
    if (ladderH > 45) {
      const restGeo = new THREE.BoxGeometry(3.6, 0.3, 3.2);
      const restMesh = new THREE.Mesh(restGeo, whiteCementMat);
      restMesh.position.set(0, ladderH * 0.5, 1.4);
      ladGroup.add(restMesh);
    }

    return ladGroup;
  };

  return { buildCenterClimbingLadder3D };
}
