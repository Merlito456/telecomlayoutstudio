import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createCementBasepadBuilder(mats: CAD3DSharedMaterials) {
  const { cementMat, galvSteelMat, stainlessMat } = mats;

  return (w: number, d: number, h = 1.2, withBolts = false, groundY = 0): THREE.Group => {
    const group = new THREE.Group();

    // Extend concrete foundation down into the ground/excavation bed (groundY - 0.8) up to top height h
    const bottomY = Math.min(0, groundY) - 0.8;
    const totalH = h - bottomY;

    // Sub-grade wider spread footing mat resting flush on ground surface
    if (withBolts) {
      const matGeo = new THREE.BoxGeometry(w * 1.28, 1.1, d * 1.28);
      const matMesh = new THREE.Mesh(matGeo, cementMat);
      matMesh.position.y = Math.min(0, groundY) + 0.25;
      matMesh.castShadow = true;
      matMesh.receiveShadow = true;
      group.add(matMesh);
    }

    // Main concrete pier / slab block
    const slabGeo = new THREE.BoxGeometry(w, totalH, d);
    const slabMesh = new THREE.Mesh(slabGeo, cementMat);
    slabMesh.position.y = bottomY + totalH / 2;
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    group.add(slabMesh);

    // Heavy Galvanized Steel Foot Baseplate, Grout Pad, Gussets & Anchor Bolts for Tower Piers
    if (withBolts) {
      const groutW = w * 0.82;
      const groutD = d * 0.82;
      const groutGeo = new THREE.BoxGeometry(groutW, 0.3, groutD);
      const groutMesh = new THREE.Mesh(groutGeo, cementMat);
      groutMesh.position.y = h + 0.15;
      group.add(groutMesh);

      const plateW = w * 0.72;
      const plateD = d * 0.72;
      const plateH = 0.4;
      const plateGeo = new THREE.BoxGeometry(plateW, plateH, plateD);
      const plateMesh = new THREE.Mesh(plateGeo, galvSteelMat);
      plateMesh.position.y = h + 0.3 + plateH / 2;
      plateMesh.castShadow = true;
      plateMesh.receiveShadow = true;
      group.add(plateMesh);

      // Central steel leg socket collar & 4 vertical stiffener gusset fins
      const collarR = Math.min(w, d) * 0.24;
      const collarGeo = new THREE.CylinderGeometry(collarR, collarR * 1.12, 1.2, 12);
      const collarMesh = new THREE.Mesh(collarGeo, galvSteelMat);
      collarMesh.position.y = h + 0.7 + 0.6;
      group.add(collarMesh);

      const gussetLen = plateW * 0.42;
      const gussetGeo1 = new THREE.BoxGeometry(gussetLen * 2, 1.1, 0.22);
      const gusset1 = new THREE.Mesh(gussetGeo1, galvSteelMat);
      gusset1.position.y = h + 0.7 + 0.55;
      group.add(gusset1);

      const gussetGeo2 = new THREE.BoxGeometry(0.22, 1.1, plateD * 0.84);
      const gusset2 = new THREE.Mesh(gussetGeo2, galvSteelMat);
      gusset2.position.y = h + 0.7 + 0.55;
      group.add(gusset2);

      // 4 Corner Stainless Anchor Studs & Hex Nuts
      const bxOff = plateW * 0.36;
      const bzOff = plateD * 0.36;
      [
        [-bxOff, -bzOff],
        [bxOff, -bzOff],
        [-bxOff, bzOff],
        [bxOff, bzOff],
      ].forEach(([bx, bz]) => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8), stainlessMat);
        bolt.position.set(bx, h + 0.75, bz);
        group.add(bolt);

        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 6), galvSteelMat);
        nut.position.set(bx, h + 0.82, bz);
        group.add(nut);
      });
    }

    return group;
  };
}
