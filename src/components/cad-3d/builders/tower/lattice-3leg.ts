/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createLattice3LegBuilder(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group,
  buildCenterClimbingLadder3D: (ladderH: number, groundY?: number) => THREE.Group
) {
  const { galvSteelMat, stainlessMat } = mats;

  // Helper: 3-Leg Lattice Tower (Triangular Base, Cost-Effective)
  const buildTower3Leg3D = (
    w: number,
    d: number,
    heightM?: number,
    getFootGroundY?: (lx: number, lz: number) => number
  ): THREE.Group => {
    const group = new THREE.Group();
    const hM = heightM && heightM > 0 ? heightM : 30;
    const towerHeight = (hM / 30) * 135;

    // Pier footings size scaled proportionally to 2D drafting & Photo mode (15px in 2D * scale3D 0.22 = 3.3)
    const pR2D = Math.max(12, Math.min((Math.min(w, d) / 0.22) * 0.115, 18));
    const pR3D = pR2D * 0.22;
    const pierSize = pR3D * 1.8;
    const pierH = 3.2;

    const footings: [number, number][] = [
      [0, -d / 2 + pR3D],                  // North / Top Leg
      [w / 2 - pR3D, d / 2 - pR3D],        // South-East / Bottom-Right Leg
      [-w / 2 + pR3D, d / 2 - pR3D],       // South-West / Bottom-Left Leg
    ];

    for (const [fx, fz] of footings) {
      const footGroundY = getFootGroundY ? getFootGroundY(fx, fz) : 0;
      const pier = buildCementBasepad(pierSize, pierSize, pierH, true, footGroundY);
      pier.position.set(fx, 0, fz);
      group.add(pier);
    }

    const UNIFORM_3LEG_TOP_R = 3.4; // Uniform top radius (~1.4m face width)
    const topR = Math.min(Math.min(w, d) * 0.35, UNIFORM_3LEG_TOP_R);

    // Transition elevation where taper meets the uniform straight top section
    const taperRatio = 0.85; // Lower 85% tapers, top 15% is straight vertical antenna section
    const taperTransitionY = pierH + (towerHeight - pierH) * taperRatio;

    // 3 Top Corners
    const topCorners: [number, number][] = [
      [0, -topR],
      [Math.cos(Math.PI / 6) * topR, Math.sin(Math.PI / 6) * topR],
      [-Math.cos(Math.PI / 6) * topR, Math.sin(Math.PI / 6) * topR],
    ];

    // 3 Main Tubular Steel Legs
    for (let i = 0; i < 3; i++) {
      const [fx, fz] = footings[i];
      const [tx, tz] = topCorners[i];
      const legPts = [
        new THREE.Vector3(fx, 0.4, fz),
        new THREE.Vector3(fx, pierH + 0.6, fz),
        new THREE.Vector3(tx, taperTransitionY, tz),
        new THREE.Vector3(tx, towerHeight, tz),
      ];
      const legCurve = new THREE.CatmullRomCurve3(legPts);
      const legTube = new THREE.TubeGeometry(legCurve, 16, 1.0, 8, false);
      const legMesh = new THREE.Mesh(legTube, galvSteelMat);
      legMesh.castShadow = true;
      group.add(legMesh);
    }

    // Helper to create a real 3D galvanized steel tubular pipe strut between any two 3D points
    const addSteelPipeStrut3 = (pA: THREE.Vector3, pB: THREE.Vector3, radius = 0.26) => {
      const dir = new THREE.Vector3().subVectors(pB, pA);
      const len = dir.length();
      if (len < 0.05) return;
      const pipeGeo = new THREE.CylinderGeometry(radius, radius, len, 8);
      const pipeMesh = new THREE.Mesh(pipeGeo, galvSteelMat);
      pipeMesh.position.copy(pA).addScaledVector(dir, 0.5);
      pipeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      pipeMesh.castShadow = true;
      group.add(pipeMesh);
    };

    const getLegPtAtFrac3 = (legIdx: number, frac: number, yVal: number): THREE.Vector3 => {
      const [fx, fz] = footings[legIdx];
      const [tx, tz] = topCorners[legIdx];
      const t = frac >= taperRatio ? 1 : frac / taperRatio;
      return new THREE.Vector3(fx + (tx - fx) * t, yVal, fz + (tz - fz) * t);
    };

    const numSections = Math.max(6, Math.min(24, Math.round((hM / 30) * 9)));

    // 1. BOTTOM PORTAL BAY (s = 0 to s = 1)
    const frac1 = 1 / numSections;
    const yBase = pierH + 1.0;
    const y1 = pierH + (towerHeight - pierH) * frac1;

    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      const pBaseA = getLegPtAtFrac3(i, 0, yBase);
      const pBaseB = getLegPtAtFrac3(j, 0, yBase);
      const pTopA = getLegPtAtFrac3(i, frac1, y1);
      const pTopB = getLegPtAtFrac3(j, frac1, y1);
      const pTopMid = new THREE.Vector3().addVectors(pTopA, pTopB).multiplyScalar(0.5);

      addSteelPipeStrut3(pBaseA, pTopMid, 0.28);
      addSteelPipeStrut3(pBaseB, pTopMid, 0.28);
    }

    // 2. UPPER TOWER SECTIONS (s = 1 to numSections)
    for (let s = 1; s <= numSections; s++) {
      const frac = s / numSections;
      const y = pierH + (towerHeight - pierH) * frac;
      const currLegPts = [0, 1, 2].map((i) => getLegPtAtFrac3(i, frac, y));

      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3;
        addSteelPipeStrut3(currLegPts[i], currLegPts[j], 0.28);
      }

      if (s === 1 || s === 2) {
        for (let i = 0; i < 3; i++) {
          const m1 = new THREE.Vector3().addVectors(currLegPts[i], currLegPts[(i + 1) % 3]).multiplyScalar(0.5);
          const m2 = new THREE.Vector3().addVectors(currLegPts[(i + 1) % 3], currLegPts[(i + 2) % 3]).multiplyScalar(0.5);
          addSteelPipeStrut3(m1, m2, 0.18);
        }
      }

      if (s < numSections) {
        const nextFrac = (s + 1) / numSections;
        const nextY = pierH + (towerHeight - pierH) * nextFrac;
        const nextLegPts = [0, 1, 2].map((i) => getLegPtAtFrac3(i, nextFrac, nextY));

        for (let i = 0; i < 3; i++) {
          const j = (i + 1) % 3;
          const nMid = new THREE.Vector3().addVectors(nextLegPts[i], nextLegPts[j]).multiplyScalar(0.5);
          addSteelPipeStrut3(currLegPts[i], nMid, 0.21);
          addSteelPipeStrut3(currLegPts[j], nMid, 0.21);
        }
      }
    }

    const centerGroundY = getFootGroundY ? getFootGroundY(0, 0) : 0;
    const centerLadder = buildCenterClimbingLadder3D(towerHeight, centerGroundY);
    group.add(centerLadder);

    const UNIFORM_HALO_RADIUS = 5.6;
    const haloMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const rruMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

    // 1. Circular Sector Ring Mount
    const haloRingGeo = new THREE.TorusGeometry(UNIFORM_HALO_RADIUS, 0.28, 12, 32);
    const haloRing = new THREE.Mesh(haloRingGeo, haloMat);
    haloRing.rotation.x = Math.PI / 2;
    haloRing.position.set(0, towerHeight, 0);
    haloRing.castShadow = true;
    group.add(haloRing);

    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const tx = Math.cos(ang) * topR;
      const tz = Math.sin(ang) * topR;
      const armLen = UNIFORM_HALO_RADIUS - topR;
      if (armLen > 0) {
        const armGeo = new THREE.CylinderGeometry(0.24, 0.24, armLen, 8);
        const arm = new THREE.Mesh(armGeo, galvSteelMat);
        arm.rotation.z = Math.PI / 2;
        arm.rotation.y = -ang;
        const midR = topR + armLen / 2;
        arm.position.set(Math.cos(ang) * midR, towerHeight, Math.sin(ang) * midR);
        group.add(arm);

        const kickerPts = [
          new THREE.Vector3(tx, towerHeight - 4.5, tz),
          new THREE.Vector3(Math.cos(ang) * UNIFORM_HALO_RADIUS, towerHeight, Math.sin(ang) * UNIFORM_HALO_RADIUS),
        ];
        const kickerGeo = new THREE.BufferGeometry().setFromPoints(kickerPts);
        const kickerLine = new THREE.Line(kickerGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 }));
        group.add(kickerLine);
      }
    }

    // 2. Three Cellular Sector Antennas at 120°
    const antGeo = new THREE.BoxGeometry(1.3, 11, 0.65);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const pipeGeo = new THREE.CylinderGeometry(0.25, 0.25, 14, 8);
    const rruGeo = new THREE.BoxGeometry(1.0, 4.0, 0.75);

    for (let s = 0; s < 3; s++) {
      const sectorAngle = (s * Math.PI * 2) / 3;

      [-0.8, 0.8].forEach((subOffset) => {
        const subAngle = sectorAngle + (subOffset / UNIFORM_HALO_RADIUS);
        const px = Math.cos(subAngle) * UNIFORM_HALO_RADIUS;
        const pz = Math.sin(subAngle) * UNIFORM_HALO_RADIUS;

        const pipe = new THREE.Mesh(pipeGeo, galvSteelMat);
        pipe.position.set(px, towerHeight + 4.5, pz);
        pipe.castShadow = true;
        group.add(pipe);

        const ant = new THREE.Mesh(antGeo, antMat);
        const antDist = UNIFORM_HALO_RADIUS + 0.35;
        ant.position.set(Math.cos(subAngle) * antDist, towerHeight + 5.0, Math.sin(subAngle) * antDist);
        ant.rotation.y = -subAngle - Math.PI / 2;
        ant.castShadow = true;
        group.add(ant);

        const rruDist = UNIFORM_HALO_RADIUS - 0.55;
        const rru = new THREE.Mesh(rruGeo, rruMat);
        rru.position.set(Math.cos(subAngle) * rruDist, towerHeight + 4.5, Math.sin(subAngle) * rruDist);
        rru.rotation.y = -subAngle - Math.PI / 2;
        rru.castShadow = true;
        group.add(rru);

        const cablePts = [
          new THREE.Vector3(Math.cos(subAngle) * rruDist, towerHeight + 2.5, Math.sin(subAngle) * rruDist),
          new THREE.Vector3(Math.cos(subAngle) * (rruDist - 0.4), towerHeight + 1.0, Math.sin(subAngle) * (rruDist - 0.4)),
          new THREE.Vector3(Math.cos(sectorAngle) * (topR * 0.8), towerHeight - 1.5, Math.sin(sectorAngle) * (topR * 0.8)),
        ];
        const cableCurve = new THREE.CatmullRomCurve3(cablePts);
        const cableTube = new THREE.TubeGeometry(cableCurve, 4, 0.08, 6, false);
        const cableMesh = new THREE.Mesh(cableTube, cableMat);
        group.add(cableMesh);
      });
    }

    // Parabolic Microwave Backhaul Dish Antenna
    const dishGeo = new THREE.CylinderGeometry(3.6, 3.6, 1.2, 24);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(topR + 1.4, towerHeight - 3.5, 0);
    dish.rotation.z = Math.PI / 2;
    dish.castShadow = true;
    group.add(dish);

    // Lightning Mast & Beacon
    const mastGeo = new THREE.CylinderGeometry(0.3, 0.5, 12, 8);
    const mastMesh = new THREE.Mesh(mastGeo, stainlessMat);
    mastMesh.position.set(0, towerHeight + 6, 0);
    group.add(mastMesh);

    const beaconGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, towerHeight + 12.5, 0);
    group.add(beacon);

    const beaconLight = new THREE.PointLight(0xef4444, 1.8, 60);
    beaconLight.position.set(0, towerHeight + 12.5, 0);
    group.add(beaconLight);

    return group;
  };

  return { buildTower3Leg3D };
}
