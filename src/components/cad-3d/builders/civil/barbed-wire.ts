import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function addBarbedWireTopping(
  group: THREE.Group,
  w: number,
  topY: number,
  postsCount: number,
  includeRazorCoil = true,
  mats: CAD3DSharedMaterials
) {
  const { galvSteelMat } = mats;
  const armMat = galvSteelMat;
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.25,
  });
  const barbMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.2,
  });

  const numPosts = Math.max(2, postsCount);
  const postSpacing = w / (numPosts - 1);

  for (let i = 0; i < numPosts; i++) {
    const px = -w / 2 + i * postSpacing;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 8), armMat);
    stalk.position.set(px, topY + 0.7, 0);
    group.add(stalk);

    const armOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.8, 8), armMat);
    armOuter.rotation.x = -Math.PI / 4;
    armOuter.position.set(px, topY + 2.0, 1.3);
    group.add(armOuter);

    const armInner = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.8, 8), armMat);
    armInner.rotation.x = Math.PI / 4;
    armInner.position.set(px, topY + 2.0, -1.3);
    group.add(armInner);
  }

  const strandOffsets = [
    { y: topY + 1.0, z: 0.65 },
    { y: topY + 2.2, z: 1.45 },
    { y: topY + 3.4, z: 2.25 },
    { y: topY + 1.0, z: -0.65 },
    { y: topY + 2.2, z: -1.45 },
    { y: topY + 3.4, z: -2.25 },
  ];

  strandOffsets.forEach(({ y, z }) => {
    const wireGeo = new THREE.CylinderGeometry(0.12, 0.12, w, 6);
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, y, z);
    group.add(wire);

    for (let bx = -w / 2 + 2; bx < w / 2 - 2; bx += 5.0) {
      const barbGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const barb = new THREE.Mesh(barbGeo, barbMat);
      barb.rotation.x = Math.PI / 4;
      barb.rotation.y = Math.PI / 4;
      barb.position.set(bx, y, z);
      group.add(barb);
    }
  });

  if (includeRazorCoil && w >= 6) {
    const coilR = 2.0;
    const coilMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.3,
    });

    const numCoilRings = Math.max(4, Math.floor(w / 3.2));
    for (let c = 0; c <= numCoilRings; c++) {
      const cx = -w / 2 + (c / numCoilRings) * w;
      const torusGeo = new THREE.TorusGeometry(coilR, 0.16, 6, 16);
      const torus = new THREE.Mesh(torusGeo, coilMat);
      torus.rotation.y = Math.PI / 2;
      torus.position.set(cx, topY + coilR + 0.3, 0);
      group.add(torus);

      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI * 2) / 6;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), barbMat);
        blade.position.set(cx, topY + coilR + 0.3 + Math.sin(ang) * coilR, Math.cos(ang) * coilR);
        group.add(blade);
      }
    }
  }
}
