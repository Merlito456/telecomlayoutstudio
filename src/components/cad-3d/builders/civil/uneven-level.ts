import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createUnevenLevelBuilder(mats: CAD3DSharedMaterials) {
  const { cementMat, galvSteelMat, surfaceMaterials } = mats;
  const ELEVATION_3D_SCALE = 1.6;

  return (
    w: number,
    d: number,
    levelM: number,
    retainingMat: 'concrete' | 'metal' | 'gravel' | 'earth' = 'concrete',
    surfaceFloorMat?: THREE.Material
  ): THREE.Group => {
    const group = new THREE.Group();
    const isDug = levelM < 0;
    const absH = Math.max(0.5, Math.abs(levelM) * ELEVATION_3D_SCALE);
    const wallThick = Math.min(2.5, Math.max(1.0, Math.min(w, d) * 0.05));

    // 1. Holding foundation / division retaining border material
    let wallMat: THREE.Material;
    if (retainingMat === 'concrete') {
      wallMat = cementMat;
    } else if (retainingMat === 'metal') {
      wallMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.3,
      });
    } else if (retainingMat === 'gravel' && surfaceMaterials?.gravel) {
      wallMat = surfaceMaterials.gravel;
    } else {
      wallMat = new THREE.MeshStandardMaterial({
        color: 0x573e27,
        roughness: 0.95,
      });
    }

    if (isDug) {
      // --- DUG PIT / TRENCH (Sunken Excavation) ---
      const excavatedFloorMat =
        surfaceFloorMat ||
        new THREE.MeshStandardMaterial({
          color: 0x292524,
          roughness: 0.95,
          metalness: 0.05,
        });
      const floorGeo = new THREE.BoxGeometry(w, 0.4, d);
      const floor = new THREE.Mesh(floorGeo, excavatedFloorMat);
      floor.position.y = -absH + 0.2;
      floor.receiveShadow = true;
      group.add(floor);

      // 4 Vertical Retaining Walls lining perimeter from -absH to 0 (grade)
      const nGeo = new THREE.BoxGeometry(w + wallThick * 2, absH, wallThick);
      const wallN = new THREE.Mesh(nGeo, wallMat);
      wallN.position.set(0, -absH / 2, -d / 2 - wallThick / 2);
      wallN.castShadow = true;
      wallN.receiveShadow = true;
      group.add(wallN);

      const sGeo = new THREE.BoxGeometry(w + wallThick * 2, absH, wallThick);
      const wallS = new THREE.Mesh(sGeo, wallMat);
      wallS.position.set(0, -absH / 2, d / 2 + wallThick / 2);
      wallS.castShadow = true;
      wallS.receiveShadow = true;
      group.add(wallS);

      const wGeo = new THREE.BoxGeometry(wallThick, absH, d);
      const wallW = new THREE.Mesh(wGeo, wallMat);
      wallW.position.set(-w / 2 - wallThick / 2, -absH / 2, 0);
      wallW.castShadow = true;
      wallW.receiveShadow = true;
      group.add(wallW);

      const eGeo = new THREE.BoxGeometry(wallThick, absH, d);
      const wallE = new THREE.Mesh(eGeo, wallMat);
      wallE.position.set(w / 2 + wallThick / 2, -absH / 2, 0);
      wallE.castShadow = true;
      wallE.receiveShadow = true;
      group.add(wallE);

      // Grade-level retaining coping borders
      const curbLipMat =
        retainingMat === 'metal'
          ? galvSteelMat
          : retainingMat === 'earth' && surfaceMaterials?.grass
          ? surfaceMaterials.grass
          : cementMat;
      const lipN = new THREE.Mesh(new THREE.BoxGeometry(w + wallThick * 2 + 0.4, 0.35, wallThick + 0.4), curbLipMat);
      lipN.position.set(0, 0.175, -d / 2 - wallThick / 2);
      group.add(lipN);

      const lipS = new THREE.Mesh(new THREE.BoxGeometry(w + wallThick * 2 + 0.4, 0.35, wallThick + 0.4), curbLipMat);
      lipS.position.set(0, 0.175, d / 2 + wallThick / 2);
      group.add(lipS);

      const lipW = new THREE.Mesh(new THREE.BoxGeometry(wallThick + 0.4, 0.35, d), curbLipMat);
      lipW.position.set(-w / 2 - wallThick / 2, 0.175, 0);
      group.add(lipW);

      const lipE = new THREE.Mesh(new THREE.BoxGeometry(wallThick + 0.4, 0.35, d), curbLipMat);
      lipE.position.set(w / 2 + wallThick / 2, 0.175, 0);
      group.add(lipE);

      if (retainingMat === 'metal') {
        const ribMat = galvSteelMat;
        for (let rx = -w / 2; rx <= w / 2; rx += 4.0) {
          const ribN = new THREE.Mesh(new THREE.BoxGeometry(0.8, absH, 0.4), ribMat);
          ribN.position.set(rx, -absH / 2, -d / 2 + 0.2);
          group.add(ribN);

          const ribS = new THREE.Mesh(new THREE.BoxGeometry(0.8, absH, 0.4), ribMat);
          ribS.position.set(rx, -absH / 2, d / 2 - 0.2);
          group.add(ribS);
        }
      }
    } else {
      // --- ELEVATED TERRACE / PLINTH (Raised Division Level) ---
      const bodyGeo = new THREE.BoxGeometry(w, absH, d);
      const body = new THREE.Mesh(bodyGeo, wallMat);
      body.position.y = absH / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const topGeo = new THREE.BoxGeometry(w + 0.4, 0.35, d + 0.4);
      const topSlab = new THREE.Mesh(topGeo, surfaceFloorMat || wallMat);
      topSlab.position.y = absH + 0.175;
      topSlab.receiveShadow = true;
      group.add(topSlab);

      const capGeo = new THREE.BoxGeometry(w + wallThick * 0.8, 0.6, d + wallThick * 0.8);
      const capMat = retainingMat === 'metal' ? galvSteelMat : cementMat;
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = absH;
      group.add(cap);

      if (retainingMat === 'metal') {
        const ribMat = galvSteelMat;
        for (let rx = -w / 2; rx <= w / 2; rx += 4.0) {
          const ribN = new THREE.Mesh(new THREE.BoxGeometry(0.8, absH, 0.5), ribMat);
          ribN.position.set(rx, absH / 2, -d / 2 - 0.25);
          group.add(ribN);

          const ribS = new THREE.Mesh(new THREE.BoxGeometry(0.8, absH, 0.5), ribMat);
          ribS.position.set(rx, absH / 2, d / 2 + 0.25);
          group.add(ribS);
        }
      }
    }

    return group;
  };
}
