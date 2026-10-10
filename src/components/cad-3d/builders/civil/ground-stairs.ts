import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createGroundStairsBuilder(mats: CAD3DSharedMaterials) {
  const { cementMat, galvSteelMat } = mats;

  return (w: number, d: number, stepsCount = 3, targetDepth = 0): THREE.Group => {
    const group = new THREE.Group();
    const totalH = targetDepth > 0 ? targetDepth : 4.5;
    const count = stepsCount || 3;
    const stepH = totalH / count;
    const stepD = d / count;
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const baseY = targetDepth > 0 ? -targetDepth : 0;

    for (let i = 0; i < count; i++) {
      const zPos = -d / 2 + (i + 0.5) * stepD;
      const treadGeo = new THREE.BoxGeometry(w, stepH, stepD);
      const tread = new THREE.Mesh(treadGeo, cementMat);
      tread.position.set(0, baseY + (i + 0.5) * stepH, zPos);
      tread.castShadow = true;
      tread.receiveShadow = true;
      group.add(tread);

      // Yellow safety nosing
      const noseGeo = new THREE.BoxGeometry(w, 0.25, 0.6);
      const nose = new THREE.Mesh(noseGeo, yellowMat);
      nose.position.set(0, baseY + (i + 1) * stepH, zPos + stepD / 2 - 0.3);
      group.add(nose);
    }

    // Galvanized steel side stringers
    const strGeo = new THREE.BoxGeometry(0.8, totalH, d);
    const str1 = new THREE.Mesh(strGeo, galvSteelMat);
    str1.position.set(-w / 2 - 0.4, baseY + totalH / 2, 0);
    const str2 = new THREE.Mesh(strGeo, galvSteelMat);
    str2.position.set(w / 2 + 0.4, baseY + totalH / 2, 0);
    group.add(str1);
    group.add(str2);

    return group;
  };
}
