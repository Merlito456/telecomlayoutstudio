import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createTwoPoleStructureBuilder(mats: CAD3DSharedMaterials) {
  const { galvSteelMat } = mats;

  return (w: number, d: number): THREE.Group => {
    const group = new THREE.Group();
    const poleH = 11.5;
    const poleR = 0.65;
    const leftColX = -w * 0.38;
    const rightColX = w * 0.38;

    // 1. Foundation Pedestals & GI Pipe Poles
    const footMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const colMat = galvSteelMat;

    [leftColX, rightColX].forEach((cx) => {
      const footing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 3.2), footMat);
      footing.position.set(cx, 0.6, 0);
      footing.castShadow = true;
      group.add(footing);

      const bp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 2.4), colMat);
      bp.position.set(cx, 1.35, 0);
      group.add(bp);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(poleR, poleR, poleH, 16), colMat);
      pole.position.set(cx, poleH / 2 + 1.2, 0);
      pole.castShadow = true;
      group.add(pole);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(poleR * 1.05, 8, 8), colMat);
      cap.position.set(cx, poleH + 1.2, 0);
      group.add(cap);
    });

    // 2. Horizontal Galvanized Unistrut Cross-Rails
    const railLen = w * 0.95;
    [7.5, 10.2].forEach((ry) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(railLen, 0.8, 0.6), colMat);
      rail.position.set(0, ry, 0);
      group.add(rail);

      [leftColX, rightColX].forEach((cx) => {
        const clamp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.6), colMat);
        clamp.position.set(cx, ry, 0);
        group.add(clamp);
      });
    });

    // 3. Weather Canopy Hood
    const canopyW = w * 1.05;
    const canopyD = d * 1.4;
    const canopyH = 0.8;
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.5 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(canopyW, canopyH, canopyD), canopyMat);
    canopy.position.set(0, poleH + 0.8, 0.8);
    canopy.rotation.x = 0.1;
    group.add(canopy);

    const fasciaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(canopyW + 0.4, 0.4, 0.4), fasciaMat);
    fascia.position.set(0, poleH + 0.5, canopyD / 2 + 0.8);
    group.add(fascia);

    // 4. UNIT 1: ECB (Emergency Circuit Breaker)
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const ecbW = Math.min(w * 0.22, 3.8);
    const ecbH = 4.2;
    const ecbD = Math.min(d * 0.5, 1.8);
    const ecbX = -w * 0.2;
    const ecbY = 9.0;

    const ecbMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.35, metalness: 0.35 });
    const ecb = new THREE.Mesh(new THREE.BoxGeometry(ecbW, ecbH, ecbD), ecbMat);
    ecb.position.set(ecbX, ecbY, ecbD / 2 + 0.5);
    ecb.castShadow = true;
    group.add(ecb);

    const ecbHood = new THREE.Mesh(new THREE.BoxGeometry(ecbW + 0.6, 0.35, ecbD + 0.4), hoodMat);
    ecbHood.position.set(ecbX, ecbY + ecbH / 2 + 0.15, ecbD / 2 + 0.5);
    group.add(ecbHood);

    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
    const ecbLever = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 0.4), redMat);
    ecbLever.position.set(ecbX + ecbW * 0.28, ecbY, ecbD + 0.55);
    group.add(ecbLever);

    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const ecbDecal = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.05), yellowMat);
    ecbDecal.position.set(ecbX - ecbW * 0.2, ecbY, ecbD + 0.52);
    group.add(ecbDecal);

    // 5. UNIT 2: ACPDB
    const pdbW = 1.0;
    const pdbH = 1.1;
    const pdbD = 0.5;
    const pdbX = w * 0.2;
    const pdbY = 9.0;

    const pdbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.4 });
    const pdb = new THREE.Mesh(new THREE.BoxGeometry(pdbW, pdbH, pdbD), pdbMat);
    pdb.position.set(pdbX, pdbY, pdbD / 2 + 0.4);
    pdb.castShadow = true;
    group.add(pdb);

    const pdbHood = new THREE.Mesh(new THREE.BoxGeometry(pdbW + 0.25, 0.12, pdbD + 0.18), hoodMat);
    pdbHood.position.set(pdbX, pdbY + pdbH / 2 + 0.06, pdbD / 2 + 0.4);
    group.add(pdbHood);

    const meterMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const meterWin = new THREE.Mesh(new THREE.BoxGeometry(pdbW * 0.32, 0.28, 0.04), meterMat);
    meterWin.position.set(pdbX - pdbW * 0.2, pdbY + 0.2, pdbD + 0.42);
    group.add(meterWin);

    const spdMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 });
    const spd = new THREE.Mesh(new THREE.BoxGeometry(pdbW * 0.24, 0.26, 0.04), spdMat);
    spd.position.set(pdbX + pdbW * 0.2, pdbY + 0.2, pdbD + 0.42);
    group.add(spd);

    const mcbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const mcbSlot = new THREE.Mesh(new THREE.BoxGeometry(pdbW * 0.72, 0.28, 0.04), mcbMat);
    mcbSlot.position.set(pdbX, pdbY - 0.2, pdbD + 0.42);
    group.add(mcbSlot);

    // 6. RSC Conduit
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.3, metalness: 0.8 });
    const spanBetween = pdbX - pdbW / 2 - (ecbX + ecbW / 2);
    const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, spanBetween + 0.2, 8), conduitMat);
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set((ecbX + ecbW / 2 + pdbX - pdbW / 2) / 2, ecbY, ecbD / 2 + 0.4);
    group.add(conduit);

    [pdbX - pdbW * 0.25, pdbX, pdbX + pdbW * 0.25].forEach((cx) => {
      const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, pdbY - pdbH / 2, 8), conduitMat);
      drop.position.set(cx, (pdbY - pdbH / 2) / 2, pdbD / 2 + 0.4);
      group.add(drop);
    });

    // 7. Grounding Busbar
    const mgbMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });
    const mgb = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.6, 0.25), mgbMat);
    mgb.position.set(0, 3.8, -0.6);
    group.add(mgb);

    const earthWireMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const earthWire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6, 6), earthWireMat);
    earthWire.position.set(leftColX + 1.2, 3, 0);
    group.add(earthWire);

    return group;
  };
}
