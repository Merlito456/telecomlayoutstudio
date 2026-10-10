/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createMonopoleBuilder(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { galvSteelMat, stainlessMat } = mats;

  // Helper: Monopole Tower (1-Leg Single Thick Tapered Steel Pole)
  const buildMonopole3D = (
    w: number,
    d: number,
    heightM?: number,
    getFootGroundY?: (lx: number, lz: number) => number
  ): THREE.Group => {
    const group = new THREE.Group();
    const hM = heightM && heightM > 0 ? heightM : 30;
    const poleHeight = (hM / 30) * 125;
    const baseRadius = 4.2;
    const topRadius = 1.8;

    // 1. Concrete Drilled Caisson Pier Footing Base (embedded into ground/excavation)
    const pierW = Math.max(w, 10);
    const pierD = Math.max(d, 10);
    const centerGroundY = getFootGroundY ? getFootGroundY(0, 0) : 0;
    const pier = buildCementBasepad(pierW, pierD, 3.6, true, centerGroundY);
    group.add(pier);

    // 2. Heavy Circular Baseplate Flange with 16 Anchor Bolts
    const flangeGeo = new THREE.CylinderGeometry(baseRadius * 1.5, baseRadius * 1.5, 1.2, 24);
    const flange = new THREE.Mesh(flangeGeo, galvSteelMat);
    flange.position.y = 4.2;
    group.add(flange);

    // 16 Anchor Bolts Circle
    const boltR = baseRadius * 1.25;
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI * 2) / 16;
      const boltGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8);
      const bolt = new THREE.Mesh(boltGeo, stainlessMat);
      bolt.position.set(Math.cos(ang) * boltR, 4.9, Math.sin(ang) * boltR);
      group.add(bolt);
    }

    // 3. Single Thick Tapered Steel Pole Shaft
    const poleGeo = new THREE.CylinderGeometry(topRadius, baseRadius, poleHeight + 2.0, 24);
    const pole = new THREE.Mesh(poleGeo, galvSteelMat);
    pole.position.y = 3.0 + (poleHeight + 2.0) / 2;
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);

    // 4. Three-Sector Antenna Mount Platform (T-Arms at 120°)
    const armDist = 6.5;
    for (let s = 0; s < 3; s++) {
      const ang = (s * Math.PI * 2) / 3;
      const ax = Math.cos(ang) * armDist;
      const az = Math.sin(ang) * armDist;

      // Radial Standoff Arm
      const armGeo = new THREE.CylinderGeometry(0.4, 0.4, armDist, 8);
      const arm = new THREE.Mesh(armGeo, galvSteelMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = -ang;
      arm.position.set(ax / 2, 4 + poleHeight - 4, az / 2);
      group.add(arm);

      // Cross T-Bar
      const tBarGeo = new THREE.CylinderGeometry(0.4, 0.4, 8, 8);
      const tBar = new THREE.Mesh(tBarGeo, galvSteelMat);
      tBar.rotation.x = Math.PI / 2;
      tBar.rotation.y = -ang;
      tBar.position.set(ax, 4 + poleHeight - 4, az);
      group.add(tBar);

      // 2 Cellular Sector Panel Antennas per Sector
      [-2.2, 2.2].forEach((offset) => {
        const antGeo = new THREE.BoxGeometry(1.2, 9, 0.6);
        const antMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const ant = new THREE.Mesh(antGeo, antMat);
        const perpX = -Math.sin(ang) * offset;
        const perpZ = Math.cos(ang) * offset;
        ant.position.set(ax + perpX, 4 + poleHeight - 4, az + perpZ);
        ant.rotation.y = -ang;
        ant.castShadow = true;
        group.add(ant);
      });
    }

    // 5. Top Lightning Rod & Flashing Aviation Beacon
    const mastGeo = new THREE.CylinderGeometry(0.4, 0.6, 12, 8);
    const mast = new THREE.Mesh(mastGeo, stainlessMat);
    mast.position.set(0, 4 + poleHeight + 6, 0);
    group.add(mast);

    const beaconGeo = new THREE.SphereGeometry(1.0, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 4 + poleHeight + 12, 0);
    group.add(beacon);

    const beaconLight = new THREE.PointLight(0xef4444, 1.5, 50);
    beaconLight.position.set(0, 4 + poleHeight + 12, 0);
    group.add(beaconLight);

    return group;
  };

  return { buildMonopole3D };
}
