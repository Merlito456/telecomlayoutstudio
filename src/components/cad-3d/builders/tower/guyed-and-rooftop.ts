/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createGuyedAndRooftopBuilders(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { cementMat, galvSteelMat, stainlessMat } = mats;

  // Helper: Guyed Tower (1 Main Leg Central Mast + Multiple Ground Guy Wires)
  const buildGuyedTower3D = (
    w: number,
    d: number,
    heightM?: number,
    getFootGroundY?: (lx: number, lz: number) => number
  ): THREE.Group => {
    const group = new THREE.Group();
    const hM = heightM && heightM > 0 ? heightM : 35;
    const mastHeight = (hM / 35) * 145;
    const mastW = 3.5;
    const guyRadiusX = Math.max(w * 0.45, 15);
    const guyRadiusZ = Math.max(d * 0.45, 15);

    // 1. Central Pinned Base Caisson Footing
    const centerGroundY = getFootGroundY ? getFootGroundY(0, 0) : 0;
    const centerPier = buildCementBasepad(6, 6, 3.5, true, centerGroundY);
    group.add(centerPier);

    // Base Pinned Pivot
    const pivotGeo = new THREE.ConeGeometry(2.0, 2.8, 8);
    const pivot = new THREE.Mesh(pivotGeo, galvSteelMat);
    pivot.rotation.x = Math.PI;
    pivot.position.y = 4.6;
    group.add(pivot);

    // 2. Central Slender Triangular Lattice Mast
    const mastGeo = new THREE.BoxGeometry(mastW, mastHeight, mastW);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, wireframe: true });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 4.6 + mastHeight / 2;
    group.add(mast);

    // Solid central spine pipe
    const spineGeo = new THREE.CylinderGeometry(0.8, 0.8, mastHeight + 1.5, 8);
    const spine = new THREE.Mesh(spineGeo, galvSteelMat);
    spine.position.y = 3.8 + (mastHeight + 1.5) / 2;
    group.add(spine);

    // 3. Three Ground Concrete Guy Anchor Blocks at 120°
    const anchorPositions: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
      anchorPositions.push([Math.cos(ang) * guyRadiusX, Math.sin(ang) * guyRadiusZ]);
    }

    const guyWireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });

    for (const [ax, az] of anchorPositions) {
      const anchorGroundY = getFootGroundY ? getFootGroundY(ax, az) : 0;
      const block = buildCementBasepad(7, 7, 3, true, anchorGroundY);
      block.position.set(ax, 0, az);
      group.add(block);

      const tbGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
      const tb = new THREE.Mesh(tbGeo, stainlessMat);
      tb.position.set(ax, 4.0, az);
      group.add(tb);

      [0.35, 0.65, 0.95].forEach((hRatio) => {
        const wireY = 5.0 + mastHeight * hRatio;
        const cableGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(ax, 4.5, az),
          new THREE.Vector3(0, wireY, 0),
        ]);
        const cable = new THREE.Line(cableGeo, guyWireMat);
        group.add(cable);
      });
    }

    // Top Sector Antennas & Flashing Aviation Obstruction Beacon
    const antMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const ant = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 0.6), antMat);
      ant.position.set(Math.cos(ang) * 4, 5.0 + mastHeight + 5, Math.sin(ang) * 4);
      ant.rotation.y = -ang;
      group.add(ant);
    }

    const beaconGeo = new THREE.SphereGeometry(1.2, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 5.0 + mastHeight + 12, 0);
    group.add(beacon);

    const beaconLight = new THREE.PointLight(0xef4444, 1.5, 60);
    beaconLight.position.set(0, 5.0 + mastHeight + 12, 0);
    group.add(beaconLight);

    return group;
  };

  // Helper: Rooftop Ballasted Mount (No Traditional Legs, Steel Frame on Flat Roof)
  const buildRooftopMount3D = (w: number, d: number, heightM?: number): THREE.Group => {
    const group = new THREE.Group();
    const roofSize = Math.max(w, d, 22);
    const hM = heightM && heightM > 0 ? heightM : 6;
    const mastH = (hM / 6) * 18;

    // 1. Building Flat Concrete Roof Section
    const roofDeck = buildCementBasepad(roofSize + 6, roofSize + 6, 2.5, false);
    group.add(roofDeck);

    // 2. Protective Neoprene Rubber Mats
    const matGeo = new THREE.BoxGeometry(roofSize * 0.85, 0.3, roofSize * 0.85);
    const matMaterial = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const matMesh = new THREE.Mesh(matGeo, matMaterial);
    matMesh.position.y = 2.65;
    group.add(matMesh);

    // 3. Galvanized Steel Ballast Skid H-Frame
    const frameGeo = new THREE.BoxGeometry(roofSize * 0.75, 0.8, roofSize * 0.75);
    const frame = new THREE.Mesh(frameGeo, galvSteelMat);
    frame.position.y = 3.2;
    group.add(frame);

    // 4. Precast Concrete Ballast Blocks
    const bSize = roofSize * 0.18;
    const bOffset = roofSize * 0.26;
    const bPositions = [
      [-bOffset, -bOffset],
      [-bOffset + bSize * 1.1, -bOffset],
      [bOffset - bSize * 1.1, -bOffset],
      [bOffset, -bOffset],
      [-bOffset, bOffset],
      [-bOffset + bSize * 1.1, bOffset],
      [bOffset - bSize * 1.1, bOffset],
      [bOffset, bOffset],
    ];

    for (const [bx, bz] of bPositions) {
      const blockGeo = new THREE.BoxGeometry(bSize, 1.8, bSize);
      const block = new THREE.Mesh(blockGeo, cementMat);
      block.position.set(bx, 4.4, bz);
      block.castShadow = true;
      group.add(block);
    }

    // 5. Central Vertical Steel Pipe Mast
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, mastH, 16);
    const pipe = new THREE.Mesh(pipeGeo, galvSteelMat);
    pipe.position.y = 3.2 + mastH / 2;
    pipe.castShadow = true;
    group.add(pipe);

    // Collar Braces down to frame
    for (let b = 0; b < 4; b++) {
      const ang = (b * Math.PI) / 2;
      const bx = Math.cos(ang) * (roofSize * 0.3);
      const bz = Math.sin(ang) * (roofSize * 0.3);
      const bracePts = [new THREE.Vector3(bx, 3.6, bz), new THREE.Vector3(0, 10.0, 0)];
      const braceGeo = new THREE.BufferGeometry().setFromPoints(bracePts);
      const brace = new THREE.Line(braceGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
      group.add(brace);
    }

    // 3 Sector Antenna Mounts with Panel Antennas
    const antMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    for (let s = 0; s < 3; s++) {
      const ang = (s * Math.PI * 2) / 3;
      const ax = Math.cos(ang) * 4.5;
      const az = Math.sin(ang) * 4.5;

      const armGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8);
      const arm = new THREE.Mesh(armGeo, galvSteelMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = -ang;
      arm.position.set(ax / 2, 3.2 + mastH - 3, az / 2);
      group.add(arm);

      const ant = new THREE.Mesh(new THREE.BoxGeometry(1.0, 7.5, 0.5), antMat);
      ant.position.set(ax, 3.2 + mastH - 3, az);
      ant.rotation.y = -ang;
      ant.castShadow = true;
      group.add(ant);
    }

    return group;
  };

  return {
    buildGuyedTower3D,
    buildRooftopMount3D,
  };
}
