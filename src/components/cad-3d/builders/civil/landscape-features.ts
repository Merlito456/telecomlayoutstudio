import * as THREE from "three";

export function buildTree3D(w: number, d: number): THREE.Group {
  const group = new THREE.Group();
  const trunkH = 16.0;
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.95 });

  // Trunk Cylinder
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, trunkH, 12), trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Root flares at base
  for (let r = 0; r < 4; r++) {
    const rAng = (r * Math.PI * 2) / 4;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 4.0, 8), trunkMat);
    root.rotation.z = Math.PI / 3;
    root.rotation.y = rAng;
    root.position.set(Math.cos(rAng) * 2.2, 1.0, Math.sin(rAng) * 2.2);
    group.add(root);
  }

  // Foliage Canopy Spheres
  const leafColors = [0x22c55e, 0x16a34a, 0x15803d, 0x4ade80];
  const foliageClusters = [
    { x: 0, y: trunkH + 5.0, z: 0, r: 7.2, c: leafColors[0] },
    { x: -3.8, y: trunkH + 2.5, z: -3.2, r: 5.5, c: leafColors[1] },
    { x: 4.2, y: trunkH + 3.0, z: -3.0, r: 5.6, c: leafColors[2] },
    { x: 3.5, y: trunkH + 2.0, z: 3.5, r: 5.4, c: leafColors[0] },
    { x: -3.6, y: trunkH + 1.8, z: 3.6, r: 5.5, c: leafColors[3] },
    { x: 0, y: trunkH + 8.5, z: 0, r: 5.0, c: leafColors[3] },
  ];

  for (const fc of foliageClusters) {
    const mat = new THREE.MeshStandardMaterial({
      color: fc.c,
      roughness: 0.85,
    });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(fc.r, 14, 14), mat);
    ball.position.set(fc.x, fc.y, fc.z);
    ball.castShadow = true;
    ball.receiveShadow = true;
    group.add(ball);
  }

  return group;
}

export function buildFlowersBed3D(w: number, d: number): THREE.Group {
  const group = new THREE.Group();
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 });
  const curb = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), curbMat);
  curb.position.y = 0.7;
  curb.receiveShadow = true;
  group.add(curb);

  const soilMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 });
  const soil = new THREE.Mesh(new THREE.BoxGeometry(w - 2.5, 1.2, d - 2.5), soilMat);
  soil.position.y = 0.8;
  group.add(soil);

  const flowerColors = [0xef4444, 0xfacc15, 0xec4899, 0xa855f7, 0xffffff];
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
  const pollenMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const numFlowers = Math.min(Math.floor((w * d) / 16), 36);
  for (let i = 0; i < numFlowers; i++) {
    const fx = -w / 2 + 2.5 + (((i * 47 + 13) % 997) / 997) * (w - 5.0);
    const fz = -d / 2 + 2.5 + (((i * 83 + 29) % 991) / 991) * (d - 5.0);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 6), stemMat);
    stem.position.set(fx, 1.4 + 0.8, fz);
    group.add(stem);

    const color = flowerColors[i % flowerColors.length];
    const flMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), flMat);
    petal.position.set(fx, 1.4 + 1.6, fz);
    group.add(petal);

    const pollen = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), pollenMat);
    pollen.position.set(fx, 1.4 + 1.85, fz);
    group.add(pollen);
  }

  return group;
}

export function buildCanal3D(w: number, d: number, cementMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, d), cementMat);
  bed.position.y = 0.3;
  bed.receiveShadow = true;
  group.add(bed);

  const wallH = 2.8;
  const wallMat = cementMat;
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 2.0), wallMat);
  w1.position.set(0, wallH / 2 + 0.3, -d / 2 + 1.0);
  w1.castShadow = true;
  w1.receiveShadow = true;
  group.add(w1);

  const w2 = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 2.0), wallMat);
  w2.position.set(0, wallH / 2 + 0.3, d / 2 - 1.0);
  w2.castShadow = true;
  w2.receiveShadow = true;
  group.add(w2);

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.333,
    transparent: true,
    opacity: 0.9,
  });
  const water = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d - 4.2), waterMat);
  water.position.set(0, 0.7, 0);
  group.add(water);

  return group;
}

export function buildPerson3D(w: number, d: number): THREE.Group {
  const group = new THREE.Group();

  const bootMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.6), bootMat);
  b1.position.set(-0.6, 0.35, 0);
  group.add(b1);

  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.6), bootMat);
  b2.position.set(0.6, 0.35, 0);
  group.add(b2);

  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
  const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 4.4, 8), pantsMat);
  leg1.position.set(-0.6, 2.9, 0);
  group.add(leg1);

  const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 4.4, 8), pantsMat);
  leg2.position.set(0.6, 2.9, 0);
  group.add(leg2);

  const vestMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 1.4), vestMat);
  torso.position.set(0, 6.7, 0);
  torso.castShadow = true;
  group.add(torso);

  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.4, 1.45), stripeMat);
  s1.position.set(0, 6.2, 0);
  group.add(s1);

  const s2 = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.4, 1.45), stripeMat);
  s2.position.set(0, 7.2, 0);
  group.add(s2);

  const armMat = vestMat;
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.0, 8), armMat);
  arm1.rotation.x = -Math.PI / 4;
  arm1.position.set(-1.4, 6.4, 0.7);
  group.add(arm1);

  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.0, 8), armMat);
  arm2.rotation.x = -Math.PI / 4;
  arm2.position.set(1.4, 6.4, 0.7);
  group.add(arm2);

  const tabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const tab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 1.5), tabMat);
  tab.position.set(0, 5.8, 1.8);
  group.add(tab);

  const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const scr = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 1.3), screenMat);
  scr.position.set(0, 5.92, 1.8);
  group.add(scr);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.7 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 12), skinMat);
  head.position.set(0, 9.2, 0);
  head.castShadow = true;
  group.add(head);

  const hatMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12), hatMat);
  hat.position.set(0, 9.6, 0);
  group.add(hat);

  const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.15, 12), hatMat);
  brim.position.set(0, 9.35, 0.15);
  group.add(brim);

  return group;
}

export function create3DDimensionBadge(
  text: string,
  subText: string,
  pos: THREE.Vector3
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 124, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 44px -apple-system, monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 48);

    if (subText) {
      ctx.font = 'bold 26px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(subText, 256, 96);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(24, 6.5, 1);
  sprite.position.copy(pos);
  return sprite;
}

export function create3DEquipmentBadge(name: string, pos: THREE.Vector3): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(4, 4, 376, 88, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 192, 48);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(12, 3, 1);
  sprite.position.copy(pos);
  return sprite;
}
