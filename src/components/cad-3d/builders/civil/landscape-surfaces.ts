import * as THREE from "three";

export function buildRoad3D(
  w: number,
  d: number,
  asphaltMat: THREE.Material,
  gravelMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  // Main asphalt road slab
  const roadGeo = new THREE.BoxGeometry(w, 0.4, d);
  const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
  roadMesh.position.y = 0.2;
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // Crushed gravel roadside shoulders
  const shGeo = new THREE.BoxGeometry(w, 0.35, 1.8);
  const sh1 = new THREE.Mesh(shGeo, gravelMat);
  sh1.position.set(0, 0.17, -d / 2 + 0.9);
  group.add(sh1);

  const sh2 = new THREE.Mesh(shGeo, gravelMat);
  sh2.position.set(0, 0.17, d / 2 - 0.9);
  group.add(sh2);

  // Solid white outer shoulder line markings
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const ln1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.6), whiteLineMat);
  ln1.position.set(0, 0.42, -d / 2 + 2.5);
  group.add(ln1);

  const ln2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.6), whiteLineMat);
  ln2.position.set(0, 0.42, d / 2 - 2.5);
  group.add(ln2);

  // Dashed yellow centerline markings
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const dashLen = 8;
  const gapLen = 6;
  const step = dashLen + gapLen;
  for (let x = -w / 2 + dashLen / 2 + 2; x <= w / 2 - dashLen / 2 - 2; x += step) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(dashLen, 0.05, 0.7), yellowLineMat);
    dash.position.set(x, 0.42, 0);
    group.add(dash);
  }

  return group;
}

export function buildSidewalk3D(w: number, d: number, cementMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const walk = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), cementMat);
  walk.position.y = 0.6;
  walk.receiveShadow = true;
  group.add(walk);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 });
  const curb = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, 2.0), curbMat);
  curb.position.set(0, 0.8, d / 2 - 1.0);
  curb.castShadow = true;
  curb.receiveShadow = true;
  group.add(curb);

  return group;
}

export function buildGrassPatch3D(w: number, d: number, grassMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const patch = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), grassMat);
  patch.position.y = 0.175;
  patch.receiveShadow = true;
  group.add(patch);
  return group;
}

export function buildConcreteYard3D(w: number, d: number, cementMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const yard = new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, d), cementMat);
  yard.position.y = 0.225;
  yard.receiveShadow = true;
  group.add(yard);

  const seamMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
  if (w > 20) {
    const seam1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, d), seamMat);
    seam1.position.set(0, 0.46, 0);
    group.add(seam1);
  }
  if (d > 20) {
    const seam2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.3), seamMat);
    seam2.position.set(0, 0.46, 0);
    group.add(seam2);
  }
  return group;
}

export function buildCompoundGravel3D(w: number, d: number, gravelMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const gv = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), gravelMat);
  gv.position.y = 0.175;
  gv.receiveShadow = true;
  group.add(gv);
  return group;
}
