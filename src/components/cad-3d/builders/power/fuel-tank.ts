import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createFuelTankBuilder(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { galvSteelMat } = mats;

  return (w: number, d: number): THREE.Group => {
    const group = new THREE.Group();

    // Concrete Bund Containment Basin
    const bundW = w;
    const bundD = d;
    const bundH = 2.5;
    const bund = buildCementBasepad(bundW, bundD, bundH, false);
    group.add(bund);

    // 1000L Cylindrical Steel Fuel Tank Body
    const cylLen = Math.max(bundW - 4, 8);
    const cylRadius = Math.max(Math.min((bundD - 3) / 2, 4.5), 2.5);
    const cylGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylLen, 24);
    const cylMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.3,
      metalness: 0.85,
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.rotation.z = Math.PI / 2;
    cyl.position.y = bundH + cylRadius + 0.4;
    cyl.castShadow = true;
    group.add(cyl);

    // Saddle brackets
    [-cylLen * 0.3, cylLen * 0.3].forEach((sx) => {
      const sadGeo = new THREE.BoxGeometry(1.2, cylRadius * 1.2, cylRadius * 2.2);
      const sad = new THREE.Mesh(sadGeo, galvSteelMat);
      sad.position.set(sx, bundH + cylRadius * 0.6, 0);
      group.add(sad);
    });

    // Manhole Inspection Port & Float Gauge
    const mhGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16);
    const mh = new THREE.Mesh(mhGeo, galvSteelMat);
    mh.position.set(0, bundH + cylRadius * 2 + 0.4, 0);
    group.add(mh);

    // Brass Camlock Fill Pipe
    const fillMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 });
    const fillPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 12), fillMat);
    fillPipe.position.set(-cylLen * 0.3, bundH + cylRadius * 2 + 0.6, 0);
    group.add(fillPipe);

    // Red Emergency Pressure Relief Vent
    const ventMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const ventPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 12), ventMat);
    ventPipe.position.set(cylLen * 0.3, bundH + cylRadius * 2 + 0.7, 0);
    group.add(ventPipe);

    return group;
  };
}
