import * as THREE from "three";

export function buildCarPickup3D(w: number, d: number, galvSteelMat: THREE.Material, stainlessMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const carL = Math.max(w, 18);
  const carW = Math.max(d, 8);

  // Rubber tires (4 wheels)
  const tireGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.0, 16);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const rimMat = galvSteelMat;

  const addWheel = (wx: number, wz: number) => {
    const wheel = new THREE.Group();
    wheel.position.set(wx, 1.6, wz);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.05, 12), rimMat);
    rim.rotation.x = Math.PI / 2;
    wheel.add(rim);

    group.add(wheel);
  };

  addWheel(-carL * 0.32, -carW / 2 + 0.4);
  addWheel(-carL * 0.32, carW / 2 - 0.4);
  addWheel(carL * 0.32, -carW / 2 + 0.4);
  addWheel(carL * 0.32, carW / 2 - 0.4);

  // White Body Material
  const truckMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.2,
  });

  // Front Hood & Engine Bay
  const hoodL = carL * 0.28;
  const hoodH = 3.6;
  const hood = new THREE.Mesh(new THREE.BoxGeometry(hoodL, hoodH, carW - 1.2), truckMat);
  hood.position.set(-carL / 2 + hoodL / 2 + 0.5, 2.8, 0);
  hood.castShadow = true;
  group.add(hood);

  // Crew Cab Cabin
  const cabL = carL * 0.34;
  const cabH = 6.2;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(cabL, cabH, carW - 1.2), truckMat);
  cab.position.set(-carL / 2 + hoodL + cabL / 2, 4.4, 0);
  cab.castShadow = true;
  group.add(cab);

  // Tinted Glass Windshield
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    transparent: true,
  });
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, carW - 1.8), glassMat);
  windshield.position.set(-carL / 2 + hoodL + 0.2, 5.6, 0);
  windshield.rotation.z = -Math.PI / 10;
  group.add(windshield);

  // Cab Roof Flashing Amber Emergency Beacon Light
  const beaconGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.7, 12);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(-carL / 2 + hoodL + cabL / 2, 4.4 + cabH / 2 + 0.35, 0);
  group.add(beacon);

  // Rear Cargo Utility Bed (Open pickup box)
  const bedL = carL * 0.38;
  const bedH = 3.4;
  const bed = new THREE.Mesh(new THREE.BoxGeometry(bedL, bedH, carW - 1.2), truckMat);
  bed.position.set(carL / 2 - bedL / 2, 2.7, 0);
  bed.castShadow = true;
  group.add(bed);

  // Bedliner Charcoal Inset
  const linerMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
  const liner = new THREE.Mesh(new THREE.BoxGeometry(bedL - 1, 0.4, carW - 2.2), linerMat);
  liner.position.set(carL / 2 - bedL / 2, 3.2, 0);
  group.add(liner);

  // Tool Box on Cargo Bed
  const tbGeo = new THREE.BoxGeometry(3.0, 2.2, carW - 1.8);
  const tb = new THREE.Mesh(tbGeo, stainlessMat);
  tb.position.set(-carL / 2 + hoodL + cabL + 2.0, 3.8, 0);
  group.add(tb);

  // Overhead Galvanized Ladder Rack
  const rackMat = galvSteelMat;
  const rk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, cabH, 8), rackMat);
  rk1.position.set(-carL / 2 + hoodL + cabL + 1, 4.4, -carW / 2 + 1.2);
  group.add(rk1);

  const rk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, cabH, 8), rackMat);
  rk2.position.set(-carL / 2 + hoodL + cabL + 1, 4.4, carW / 2 - 1.2);
  group.add(rk2);

  const rkBar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, bedL + cabL * 0.5, 8), rackMat);
  rkBar.rotation.z = Math.PI / 2;
  rkBar.position.set(carL * 0.05, 4.4 + cabH / 2 + 1.2, -carW / 2 + 1.2);
  group.add(rkBar);

  // Headlights & Tail Lights
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 1.6), hlMat);
  hl1.position.set(-carL / 2 + 0.3, 3.2, -carW / 2 + 1.6);
  group.add(hl1);

  const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 1.6), hlMat);
  hl2.position.set(-carL / 2 + 0.3, 3.2, carW / 2 - 1.6);
  group.add(hl2);

  const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 1.4), tlMat);
  tl1.position.set(carL / 2 - 0.2, 3.2, -carW / 2 + 1.6);
  group.add(tl1);

  const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 1.4), tlMat);
  tl2.position.set(carL / 2 - 0.2, 3.2, carW / 2 - 1.6);
  group.add(tl2);

  return group;
}

export function buildCarSedan3D(w: number, d: number, stainlessMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const carL = Math.max(w, 16);
  const carW = Math.max(d, 7);

  // Wheels
  const tireGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.9, 16);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const rimMat = stainlessMat;

  const addWheel = (wx: number, wz: number) => {
    const wheel = new THREE.Group();
    wheel.position.set(wx, 1.5, wz);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.95, 12), rimMat);
    rim.rotation.x = Math.PI / 2;
    wheel.add(rim);
    group.add(wheel);
  };

  addWheel(-carL * 0.3, -carW / 2 + 0.35);
  addWheel(-carL * 0.3, carW / 2 - 0.35);
  addWheel(carL * 0.3, -carW / 2 + 0.35);
  addWheel(carL * 0.3, carW / 2 - 0.35);

  // Aerodynamic Metallic Sapphire Blue Car Body
  const sedanMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.25,
    metalness: 0.7,
  });

  // Lower Chassis / Bumper
  const lower = new THREE.Mesh(new THREE.BoxGeometry(carL, 2.5, carW - 0.8), sedanMat);
  lower.position.y = 2.2;
  lower.castShadow = true;
  group.add(lower);

  // Cabin / Greenhouse
  const cab = new THREE.Mesh(new THREE.BoxGeometry(carL * 0.52, 3.8, carW - 1.4), sedanMat);
  cab.position.set(-carL * 0.04, 4.4, 0);
  cab.castShadow = true;
  group.add(cab);

  // Glass Windows & Sunroof
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.8,
    transparent: true,
  });
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.6, carW - 1.8), glassMat);
  frontGlass.position.set(-carL * 0.04 - carL * 0.26, 4.6, 0);
  frontGlass.rotation.z = -Math.PI / 8;
  group.add(frontGlass);

  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.6, carW - 1.8), glassMat);
  rearGlass.position.set(-carL * 0.04 + carL * 0.26, 4.6, 0);
  rearGlass.rotation.z = Math.PI / 8;
  group.add(rearGlass);

  const sunroof = new THREE.Mesh(new THREE.BoxGeometry(carL * 0.25, 0.1, carW - 2.8), glassMat);
  sunroof.position.set(-carL * 0.04, 6.35, 0);
  group.add(sunroof);

  // Headlights & Tail Lights
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 1.4), hlMat);
  hl1.position.set(-carL / 2 + 0.1, 2.4, -carW / 2 + 1.2);
  group.add(hl1);

  const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 1.4), hlMat);
  hl2.position.set(-carL / 2 + 0.1, 2.4, carW / 2 - 1.2);
  group.add(hl2);

  const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 1.4), tlMat);
  tl1.position.set(carL / 2 - 0.1, 2.4, -carW / 2 + 1.2);
  group.add(tl1);

  const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 1.4), tlMat);
  tl2.position.set(carL / 2 - 0.1, 2.4, carW / 2 - 1.2);
  group.add(tl2);

  return group;
}
