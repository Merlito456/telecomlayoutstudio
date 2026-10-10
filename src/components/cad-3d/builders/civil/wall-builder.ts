import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { addBarbedWireTopping } from "./barbed-wire";

export function createWall3DBuilder(mats: CAD3DSharedMaterials) {
  const { cementMat, concreteTex } = mats;

  return (w: number, d: number, excavationDepth = 0): THREE.Group => {
    const group = new THREE.Group();
    const wallH = 20;
    const wallThick = Math.max(d, 1.8);
    const totalWallH = wallH + 0.6 + excavationDepth;
    const wallCenterY = (wallH + 0.6 - excavationDepth) / 2;

    // 1. Concrete ground strip footing foundation
    const footGeo = new THREE.BoxGeometry(w, 1.2, wallThick + 1.2);
    const foot = new THREE.Mesh(footGeo, cementMat);
    foot.position.y = -excavationDepth + 0.6;
    group.add(foot);

    // 2. Main Masonry / Concrete Wall Body
    const wallGeo = new THREE.BoxGeometry(w, totalWallH, wallThick);
    const brickWallMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.85,
      metalness: 0.05,
      map: concreteTex,
    });
    const wall = new THREE.Mesh(wallGeo, brickWallMat);
    wall.position.y = wallCenterY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // 3. Concrete Coping Cap
    const capGeo = new THREE.BoxGeometry(w, 1.4, wallThick + 0.8);
    const cap = new THREE.Mesh(capGeo, cementMat);
    cap.position.y = wallH + 1.3;
    cap.castShadow = true;
    group.add(cap);

    // 4. Structural Pilaster Columns
    const numPilasters = Math.max(2, Math.floor(w / 16));
    const pilH = wallH + 2.0 + excavationDepth;
    const pilCenterY = (wallH + 2.0 - excavationDepth) / 2;
    for (let i = 0; i <= numPilasters; i++) {
      const px = -w / 2 + (i / numPilasters) * w;
      const pilGeo = new THREE.BoxGeometry(2.4, pilH, wallThick + 1.0);
      const pil = new THREE.Mesh(pilGeo, cementMat);
      pil.position.set(px, pilCenterY, 0);
      pil.castShadow = true;
      group.add(pil);
    }

    // 5. High-Security Barbed Wire & Concertina Razor Wire Topping
    addBarbedWireTopping(group, w, wallH + 2.0, numPilasters + 1, true, mats);

    return group;
  };
}
