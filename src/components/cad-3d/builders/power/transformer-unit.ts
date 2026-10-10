import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createTransformerUnitBuilder(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { galvSteelMat, porcelainRedMat } = mats;

  return (w: number, d: number): THREE.Group => {
    const group = new THREE.Group();
    const tankH = 12;

    // Concrete pad
    const pad = buildCementBasepad(w + 3, d + 3, 2.5, true);
    group.add(pad);

    // Transformer Tank Body
    const tankGeo = new THREE.BoxGeometry(w, tankH, d);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.6 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 2.5 + tankH / 2;
    tank.castShadow = true;
    group.add(tank);

    // Radiator Fins on Both Sides
    const finMat = galvSteelMat;
    for (let fx = -w / 2 + 2; fx <= w / 2 - 2; fx += 2.5) {
      const fin1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, tankH - 2, 2.5), finMat);
      fin1.position.set(fx, 2.5 + tankH / 2, d / 2 + 1.2);
      group.add(fin1);

      const fin2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, tankH - 2, 2.5), finMat);
      fin2.position.set(fx, 2.5 + tankH / 2, -d / 2 - 1.2);
      group.add(fin2);
    }

    // 3 High-Voltage Glazed Red Porcelain Bushings
    const bushSpacing = w / 4;
    for (let b = 1; b <= 3; b++) {
      const bx = -w / 2 + b * bushSpacing;
      const bshGeo = new THREE.CylinderGeometry(0.8, 1.4, 5, 12);
      const bsh = new THREE.Mesh(bshGeo, porcelainRedMat);
      bsh.position.set(bx, 2.5 + tankH + 2.5, -d * 0.2);
      bsh.castShadow = true;
      group.add(bsh);

      const stud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
      );
      stud.position.set(bx, 2.5 + tankH + 5.6, -d * 0.2);
      group.add(stud);
    }

    // Conservator Header Tank
    const consGeo = new THREE.CylinderGeometry(2, 2, w * 0.7, 16);
    const cons = new THREE.Mesh(consGeo, tankMat);
    cons.rotation.z = Math.PI / 2;
    cons.position.set(0, 2.5 + tankH + 2.5, d * 0.25);
    cons.castShadow = true;
    group.add(cons);

    return group;
  };
}
