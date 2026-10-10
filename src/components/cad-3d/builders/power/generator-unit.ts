import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createGeneratorUnitBuilder(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { galvSteelMat, genGreenMat, stainlessMat } = mats;

  return (w: number, d: number): THREE.Group => {
    const group = new THREE.Group();

    // Materials specific to the Generator
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6, metalness: 0.65 });
    const darkCavityMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const cautionYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    const brassCapMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3, metalness: 0.75 });
    const lcdScreenMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });
    const eStopRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.4, metalness: 0.8 });
    const acrylicWindowMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      transmission: 0.85,
    });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.85 });
    const groundWireMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });

    // 1. Concrete Foundation Basepad Plinth
    const padW = w + 2.0;
    const padD = d + 2.0;
    const padH = 0.8;
    const pad = buildCementBasepad(padW, padD, padH, true);
    group.add(pad);

    // Corner Anchor Bolt Assemblies
    const boltMarginX = padW / 2 - 1.0;
    const boltMarginZ = padD / 2 - 1.0;
    const boltPositions = [
      [-boltMarginX, -boltMarginZ],
      [boltMarginX, -boltMarginZ],
      [-boltMarginX, boltMarginZ],
      [boltMarginX, boltMarginZ],
    ];
    boltPositions.forEach(([bx, bz]) => {
      const washer = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), galvSteelMat);
      washer.position.set(bx, padH + 0.06, bz);
      washer.castShadow = true;
      group.add(washer);

      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 8), stainlessMat);
      stud.position.set(bx, padH + 0.25, bz);
      group.add(stud);

      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 6), galvSteelMat);
      nut.position.set(bx, padH + 0.2, bz);
      group.add(nut);
    });

    // Copper Grounding Boss
    const gX = -padW / 2 + 1.5;
    const gZ = padD / 2 - 1.2;
    const gBoss = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.5), copperMat);
    gBoss.position.set(gX, padH + 0.12, gZ);
    group.add(gBoss);

    const gWire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8), groundWireMat);
    gWire.position.set(gX + 0.45, padH + 0.4, gZ - 0.45);
    gWire.rotation.z = -0.55;
    gWire.rotation.y = 0.45;
    group.add(gWire);

    // 2. Heavy-Duty Steel Sub-Base Skid & Fuel Tank Chassis
    const skidW = w - 0.8;
    const skidD = d - 0.8;
    const skidH = 0.9;
    const skidBaseY = padH + skidH / 2;

    const skidMesh = new THREE.Mesh(new THREE.BoxGeometry(skidW, skidH, skidD), skidMat);
    skidMesh.position.set(0, skidBaseY, 0);
    skidMesh.castShadow = true;
    skidMesh.receiveShadow = true;
    group.add(skidMesh);

    // Forklift Pockets
    const forkXPositions = [-skidW * 0.22, skidW * 0.22];
    forkXPositions.forEach((fx) => {
      const pocketInner = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, skidD + 0.2), darkCavityMat);
      pocketInner.position.set(fx, padH + 0.38, 0);
      group.add(pocketInner);
    });

    // 3. Acoustic Enclosure Canopy
    const encW = w - 1.2;
    const encD = d - 1.2;
    const encH = 7.5;
    const encBaseY = padH + skidH;
    const encCenterY = encBaseY + encH / 2;

    const encMesh = new THREE.Mesh(new THREE.BoxGeometry(encW, encH, encD), genGreenMat);
    encMesh.position.set(0, encCenterY, 0);
    encMesh.castShadow = true;
    encMesh.receiveShadow = true;
    group.add(encMesh);

    // Pitched Weather Hood Roof
    const roofCapH = 0.6;
    const roofCapMesh = new THREE.Mesh(new THREE.BoxGeometry(encW + 0.6, roofCapH, encD + 0.6), genGreenMat);
    roofCapMesh.position.set(0, encBaseY + encH + roofCapH / 2, 0);
    group.add(roofCapMesh);

    // 4. Exhaust Air Discharge Louvers (Front Wall)
    const frontLouverW = encW * 0.55;
    const frontLouverH = encH * 0.52;
    const frontLouverMesh = new THREE.Mesh(new THREE.BoxGeometry(frontLouverW, frontLouverH, 0.35), darkCavityMat);
    frontLouverMesh.position.set(0, encCenterY, encD / 2 + 0.08);
    group.add(frontLouverMesh);

    // 5. Side Sound-Attenuated Access Doors
    const doorW = encW * 0.36;
    const doorH = encH * 0.76;
    const doorThick = 0.2;
    const doorOffsets = [-encW * 0.24, encW * 0.24];

    doorOffsets.forEach((dx) => {
      // Front side doors
      const doorMeshF = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorThick), genGreenMat);
      doorMeshF.position.set(dx, encCenterY - 0.2, encD / 2 + 0.04);
      group.add(doorMeshF);

      // Back side doors
      const doorMeshB = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorThick), genGreenMat);
      doorMeshB.position.set(dx, encCenterY - 0.2, -encD / 2 - 0.04);
      group.add(doorMeshB);
    });

    // 6. Fuel Fill Neck & Brass Cap
    const fuelCap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 12), brassCapMat);
    fuelCap.position.set(-skidW / 2 + 0.8, padH + skidH + 0.2, skidD / 2 - 0.8);
    group.add(fuelCap);

    // 7. Critical Grade Exhaust Silencer & Rain Cap Flapper
    const silencerR = 0.9;
    const silencerL = encW * 0.45;
    const silencerX = encW * 0.08;
    const silencerZ = -encD * 0.16;
    const silencerY = encBaseY + encH + silencerR + 0.4;

    const silencer = new THREE.Mesh(new THREE.CylinderGeometry(silencerR, silencerR, silencerL, 16), exhaustMat);
    silencer.rotation.z = Math.PI / 2;
    silencer.position.set(silencerX, silencerY, silencerZ);
    silencer.castShadow = true;
    group.add(silencer);

    [-silencerL * 0.35, silencerL * 0.35].forEach((bx) => {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.5), galvSteelMat);
      bracket.position.set(silencerX + bx, silencerY - 0.45, silencerZ);
      group.add(bracket);
    });

    const heatFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16), darkCavityMat);
    heatFlange.position.set(silencerX + silencerL / 2 - 0.8, encBaseY + encH + 0.45, silencerZ);
    group.add(heatFlange);

    const exhStackH = 2.0;
    const exhStackR = 0.4;
    const exhStackX = silencerX + silencerL / 2 - 0.8;
    const exhStackY = silencerY + silencerR + exhStackH / 2;
    const exhPipe = new THREE.Mesh(new THREE.CylinderGeometry(exhStackR, exhStackR, exhStackH, 16), stainlessMat);
    exhPipe.position.set(exhStackX, exhStackY, silencerZ);
    exhPipe.castShadow = true;
    group.add(exhPipe);

    const flapperHingeY = exhStackY + exhStackH / 2 + 0.05;
    const flapperDisc = new THREE.Mesh(new THREE.CylinderGeometry(exhStackR + 0.15, exhStackR + 0.15, 0.1, 16), stainlessMat);
    flapperDisc.position.set(exhStackX + 0.15, flapperHingeY + 0.2, silencerZ);
    flapperDisc.rotation.z = 0.45;
    group.add(flapperDisc);

    const cwArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8), stainlessMat);
    cwArm.position.set(exhStackX - 0.3, flapperHingeY + 0.2, silencerZ);
    cwArm.rotation.z = -0.55;
    group.add(cwArm);

    const cwBall = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), exhaustMat);
    cwBall.position.set(exhStackX - 0.55, flapperHingeY + 0.4, silencerZ);
    group.add(cwBall);

    // 8. Digital Control Cubicle & Viewing Window
    const cpW = 2.4;
    const cpH = 2.5;
    const cpX = -encW * 0.36;
    const cpZ = encD / 2 + 0.06;
    const cpY = encCenterY + 0.2;

    const cpBox = new THREE.Mesh(new THREE.BoxGeometry(cpW, cpH, 0.25), darkCavityMat);
    cpBox.position.set(cpX, cpY, cpZ);
    group.add(cpBox);

    const lcdScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), lcdScreenMat);
    lcdScreen.position.set(cpX, cpY + 0.6, cpZ + 0.14);
    group.add(lcdScreen);

    const eStopCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16), cautionYellowMat);
    eStopCollar.rotation.x = Math.PI / 2;
    eStopCollar.position.set(cpX - 0.5, cpY - 0.55, cpZ + 0.14);
    group.add(eStopCollar);

    const eStopButton = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.16, 16), eStopRedMat);
    eStopButton.rotation.x = Math.PI / 2;
    eStopButton.position.set(cpX - 0.5, cpY - 0.55, cpZ + 0.22);
    group.add(eStopButton);

    const keySwitch = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.15, 8), stainlessMat);
    keySwitch.rotation.x = Math.PI / 2;
    keySwitch.position.set(cpX + 0.5, cpY - 0.55, cpZ + 0.16);
    group.add(keySwitch);

    [
      { color: 0x22c55e, offX: -0.4 },
      { color: 0xeab308, offX: 0 },
      { color: 0xef4444, offX: 0.4 },
    ].forEach((led) => {
      const ledMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color: led.color, emissive: led.color, emissiveIntensity: 0.9 })
      );
      ledMesh.position.set(cpX + led.offX, cpY + 0.02, cpZ + 0.14);
      group.add(ledMesh);
    });

    const windowDoor = new THREE.Mesh(new THREE.BoxGeometry(cpW + 0.4, cpH + 0.4, 0.15), acrylicWindowMat);
    windowDoor.position.set(cpX, cpY, cpZ + 0.32);
    group.add(windowDoor);

    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(cpW + 0.5, cpH + 0.5, 0.08), stainlessMat);
    windowFrame.position.set(cpX, cpY, cpZ + 0.3);
    group.add(windowFrame);

    // 9. Safety Decal Plates
    const cautionPlate = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), cautionYellowMat);
    cautionPlate.position.set(encW * 0.18, encCenterY + doorH * 0.25, encD / 2 + doorThick + 0.02);
    group.add(cautionPlate);

    return group;
  };
}
