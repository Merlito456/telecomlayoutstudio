/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ShelterRoofHvacParams {
  w: number;
  d: number;
  padH: number;
  wallH: number;
  t: number;
  isCementBox: boolean;
  cableWall: 'north' | 'south' | 'east' | 'west' | 'none';
  airconWall: 'north' | 'south' | 'east' | 'west' | 'none';
  telecomGreyMat: THREE.Material;
  stainlessMat: THREE.Material;
  darkSteelMat: THREE.Material;
  yellowLadderMat: THREE.Material;
  cabinRoofCutawayRef?: any;
  props?: Record<string, any>;
  buildTelecomRack: (rackW?: number, rackH?: number, rackD?: number, rackObj?: any) => THREE.Group;
  buildRectifierCabinet: (recW?: number, recH?: number, recD?: number, batteryCount?: number) => THREE.Group;
  buildBatteryBank: (batW?: number, batH?: number, batD?: number) => THREE.Group;
  buildACDBPanel: (panW?: number, panH?: number, panD?: number) => THREE.Group;
  buildIndoorAC: (acW?: number, acH?: number, acD?: number, props?: any) => THREE.Group;
  buildFireExtinguisher: () => THREE.Group;
}

export function buildShelterInteriorAndRoof(group: THREE.Group, params: ShelterRoofHvacParams) {
  const {
    w,
    d,
    padH,
    wallH,
    t,
    isCementBox,
    cableWall,
    airconWall,
    telecomGreyMat,
    stainlessMat,
    darkSteelMat,
    yellowLadderMat,
    cabinRoofCutawayRef,
    props,
    buildTelecomRack,
    buildRectifierCabinet,
    buildBatteryBank,
    buildACDBPanel,
    buildIndoorAC,
    buildFireExtinguisher,
  } = params;

  // 1. Cabin Interior Lighting
  const cabinInteriorLight = new THREE.PointLight(0xfffbeb, 1.8, Math.max(w, d) * 2.0, 1.2);
  cabinInteriorLight.position.set(0, padH + wallH - 1.8, 0);
  group.add(cabinInteriorLight);

  for (const lx of [-w * 0.22, w * 0.22]) {
    const fixtureLen = Math.min(d * 0.55, 10);
    const fixGeo = new THREE.BoxGeometry(1.2, 0.3, fixtureLen);
    const fixMesh = new THREE.Mesh(fixGeo, darkSteelMat);
    fixMesh.position.set(lx, padH + wallH - 0.3, 0);
    group.add(fixMesh);

    const lensGeo = new THREE.BoxGeometry(0.9, 0.1, fixtureLen - 0.2);
    const lensMesh = new THREE.Mesh(lensGeo, new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.9,
    }));
    lensMesh.position.set(lx, padH + wallH - 0.48, 0);
    group.add(lensMesh);
  }

  // Interior user designed equipment (from Shelter Design Studio)
  // Note: 1 meter = 6.0 3D units. Shelter interior width = (w - t * 2), depth = (d - t * 2).
  // Overhead cable ladder is suspended 3.5 inches (90mm = 0.09m = 0.54 units) below ceiling (padH + wallH).
  const ceilingUndersideY = padH + wallH;
  const ladderClearanceFromCeiling = 0.54; // 0.09m (3.5 inches) below ceiling
  const overheadLadderY = ceilingUndersideY - ladderClearanceFromCeiling;

  const userInteriorItems = (props?.interiorObjects as Array<any>) || [];

  if (userInteriorItems.length > 0) {
    const roomLenMm =
      props?.roomLengthMm ||
      (props?.shelterLengthM ? props.shelterLengthM * 1000 : Math.max(1800, (w / (20 * 0.22)) * 1000));
    const roomWidMm =
      props?.roomWidthMm ||
      (props?.shelterWidthM ? props.shelterWidthM * 1000 : Math.max(1800, (d / (20 * 0.22)) * 1000));
    const innerW3D = Math.max(4, w - t * 2);
    const innerD3D = Math.max(4, d - t * 2);

    userInteriorItems.forEach((item) => {
      const sId = (item.stencilId || item.customProps?.stencilType || item.type || '').toLowerCase();
      const isAC =
        sId.includes('wall-mount-ac') ||
        sId.includes('air-conditioner') ||
        sId.includes('aircon') ||
        sId.includes('cooling') ||
        sId.includes('split') ||
        sId.includes('indoor-split') ||
        sId.includes('exhaust') ||
        (item as any)?.category === 'cooling' ||
        String(item.name || '').toLowerCase().includes('air conditioner') ||
        String(item.name || '').toLowerCase().includes('aircon') ||
        String(item.name || '').toLowerCase().includes('wall ac');
      const isCRAC = sId.includes('crac') || sId.includes('precision');

      const widthMm =
        item.widthMm ??
        item.customProps?.widthMm ??
        (isAC && !isCRAC ? 1000 : (((item.width || 24) / 20) * 1000));
      const depthMm =
        item.depthMm ??
        item.customProps?.depthMm ??
        (isAC && !isCRAC ? 280 : (((item.height || 24) / 20) * 1000));
      const heightMm =
        item.heightMm ??
        item.customProps?.heightMm ??
        (isAC && !isCRAC ? 340 : (sId.includes('24u') ? 1200 : sId.includes('45u') ? 2200 : 2000));
      const elevationMm =
        item.elevationMm ??
        item.customProps?.elevationMm ??
        (isAC && !isCRAC ? 2200 : 0);

      const itmW = isAC && !isCRAC ? Math.max(3.8, Math.min(6.5, (widthMm / 1000) * 5.6)) : Math.max(1.2, (widthMm / roomLenMm) * innerW3D);
      const itmD = isAC && !isCRAC ? Math.max(1.3, Math.min(2.0, (depthMm / 1000) * 5.6)) : Math.max(1.0, (depthMm / roomWidMm) * innerD3D);
      const maxEquipH = Math.max(3.0, wallH - ladderClearanceFromCeiling - 1.2);
      const itmH = isAC && !isCRAC ? 2.0 : Math.min(maxEquipH, Math.max(0.5, (heightMm / 1000) * 6.0));

      let lx = 0;
      let lz = 0;
      if (item.localX !== undefined && item.localZ !== undefined) {
        lx = item.localX;
        lz = item.localZ;
      } else {
        const xMm = item.xMm ?? item.x ?? (roomLenMm / 2 - widthMm / 2);
        const yMm = item.yMm ?? item.y ?? (roomWidMm / 2 - depthMm / 2);
        const centerXMm = xMm + widthMm / 2;
        const centerYMm = yMm + depthMm / 2;
        lx = (centerXMm / roomLenMm - 0.5) * innerW3D;
        lz = (centerYMm / roomWidMm - 0.5) * innerD3D;
      }

      const rotDeg = item.rotationDeg ?? item.rotation ?? 0;
      const rotRad = -(rotDeg * Math.PI) / 180;

      const isLadder =
        item.category === 'ladder' ||
        item.customProps?.category === 'ladder' ||
        item.ladderType === 'indoor' ||
        item.customProps?.ladderType === 'indoor' ||
        item.customProps?.placement === 'indoor' ||
        sId.includes('ladder') ||
        sId.includes('runway') ||
        sId.includes('raceway') ||
        sId.includes('tray') ||
        sId.includes('in-shelter') ||
        sId.includes('inshelter') ||
        String(item.name || item.text || '').toLowerCase().includes('ladder') ||
        String(item.name || item.text || '').toLowerCase().includes('raceway') ||
        String(item.name || item.text || '').toLowerCase().includes('runway') ||
        String(item.name || item.text || '').toLowerCase().includes('in-shelter') ||
        String(item.name || item.text || '').toLowerCase().includes('inshelter');

      if (isLadder) {
        const ladderGrp = new THREE.Group();
        ladderGrp.renderOrder = 2;
        const isVert = itmD > itmW;
        const spanW = isVert ? itmD : itmW;
        const spanD = isVert ? itmW : itmD;

        const ladderRailMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          roughness: 0.25,
          metalness: 0.6,
          emissive: 0xca8a04,
          emissiveIntensity: 0.35,
        });

        // 1. Parallel outer stringer rails
        const railGeo = new THREE.BoxGeometry(spanW, 0.4, 0.22);
        const railF = new THREE.Mesh(railGeo, ladderRailMat);
        railF.position.set(0, 0, spanD / 2 - 0.11);
        const railB = new THREE.Mesh(railGeo, ladderRailMat);
        railB.position.set(0, 0, -spanD / 2 + 0.11);
        ladderGrp.add(railF, railB);

        // 2. Tubular cross rungs
        const rungCount = Math.max(3, Math.floor(spanW / 1.1));
        const rungMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.3,
          metalness: 0.7,
        });
        for (let r = 0; r <= rungCount; r++) {
          const rx = -spanW / 2 + (r / rungCount) * spanW;
          const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, spanD - 0.2, 8), rungMat);
          rung.rotation.x = Math.PI / 2;
          rung.position.set(rx, -0.05, 0);
          ladderGrp.add(rung);
        }

        // 3. Short ceiling suspension drop rods & trapeze brackets
        for (const rx of [-spanW * 0.35, 0, spanW * 0.35]) {
          for (const rz of [-spanD * 0.42, spanD * 0.42]) {
            const rod = new THREE.Mesh(
              new THREE.CylinderGeometry(0.045, 0.045, ladderClearanceFromCeiling, 6),
              stainlessMat
            );
            rod.position.set(rx, ladderClearanceFromCeiling / 2, rz);
            ladderGrp.add(rod);

            // Ceiling clamp
            const clamp = new THREE.Mesh(
              new THREE.BoxGeometry(0.25, 0.1, 0.25),
              darkSteelMat
            );
            clamp.position.set(rx, ladderClearanceFromCeiling, rz);
            ladderGrp.add(clamp);
          }

          // Trapeze under-support
          const trap = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.12, spanD + 0.3),
            stainlessMat
          );
          trap.position.set(rx, -0.22, 0);
          ladderGrp.add(trap);
        }

        ladderGrp.position.set(lx, overheadLadderY, lz);
        ladderGrp.rotation.y = rotRad + (isVert ? Math.PI / 2 : 0);
        ladderGrp.userData.cadObjectId = item.id;
        ladderGrp.userData.isLadder = true;
        ladderGrp.userData.ladderTopY = overheadLadderY;
        ladderGrp.userData.ladderName = item.name || 'Overhead Cable Ladder';
        ladderGrp.traverse((c) => {
          c.userData.cadObjectId = item.id;
          c.userData.isLadder = true;
          c.userData.ladderTopY = overheadLadderY;
          c.userData.ladderName = item.name || 'Overhead Cable Ladder';
        });
        group.add(ladderGrp);
        return;
      }

      let equipMesh: THREE.Group | null = null;
      let baseY = padH + 0.1 + (elevationMm / 1000) * 6.0;

      if (sId.includes('battery')) {
        equipMesh = buildBatteryBank(itmW, itmH, itmD);
      } else if (sId.includes('rectifier') || sId.includes('pdu') || sId.includes('ups') || sId.includes('power') || sId.includes('flatpack')) {
        equipMesh = buildRectifierCabinet(itmW, itmH, itmD, (item as any)?.customProps?.batteryCount);
      } else if (sId.includes('acdb') || sId.includes('ats') || sId.includes('busbar')) {
        equipMesh = buildACDBPanel(itmW, itmH, Math.max(itmD, 0.8));
        if (elevationMm === 0) baseY = padH + wallH * 0.42;
      } else if (isAC && !isCRAC) {
        equipMesh = buildIndoorAC(itmW, itmH, itmD, item);
        const elev3D = elevationMm > 0 ? (elevationMm / 1000) * 6.0 : (2.2 * 6.0);
        baseY = padH + Math.min(wallH - itmH - 0.2, Math.max(2.0, elev3D));
      } else if (sId.includes('crac') || sId.includes('precision') || sId.includes('floor-standing') || sId.includes('backpack')) {
        equipMesh = buildTelecomRack(itmW, itmH, itmD, item);
      } else if (sId.includes('fire') || sId.includes('fm200') || sId.includes('extinguish')) {
        equipMesh = buildFireExtinguisher();
      } else {
        equipMesh = buildTelecomRack(itmW, itmH, itmD, item);
        if (elevationMm > 0) {
          baseY = padH + Math.min(wallH - itmH - 0.8, (elevationMm / 1000) * 6.0);
        }
      }

      if (equipMesh) {
        equipMesh.position.set(lx, baseY, lz);
        equipMesh.rotation.y = rotRad;
        const topY = baseY + itmH;
        equipMesh.userData.cadObjectId = item.id;
        if (isAC && !isCRAC) {
          const acName = item.name || 'Wall-Mount Air Conditioner';
          equipMesh.userData.isAirConditioner = true;
          equipMesh.userData.acName = acName;
          equipMesh.traverse((c) => {
            c.userData.cadObjectId = item.id;
            c.userData.isAirConditioner = true;
            c.userData.acName = acName;
          });
        } else {
          const rName = item.name || (sId.includes('rectifier') ? 'Flatpack2 Rectifier System' : 'Equipment Rack');
          equipMesh.userData.isRack = true;
          equipMesh.userData.rackTopY = topY;
          equipMesh.userData.rackName = rName;
          equipMesh.traverse((c) => {
            c.userData.cadObjectId = item.id;
            c.userData.isRack = true;
            c.userData.rackTopY = topY;
            c.userData.rackName = rName;
          });
        }
        group.add(equipMesh);
      }
    });
  }

  // Ribbed Roof Slab
  const roofH = 2.0;
  const roofGeo = new THREE.BoxGeometry(w + 2, roofH, d + 2);
  const explicitRoofMode = props?.roofMode || props?.customProps?.roofMode;
  const hasInteriorEquipment = userInteriorItems.length > 0 || Boolean(props?.hasOverlapInterior);
  const isCutaway =
    Boolean(cabinRoofCutawayRef?.current) ||
    explicitRoofMode === 'cutaway' ||
    explicitRoofMode === 'open' ||
    explicitRoofMode === 'transparent' ||
    (hasInteriorEquipment && explicitRoofMode !== 'solid');
  const roofOpacity = explicitRoofMode === 'transparent' ? 0.25 : isCutaway ? 0.12 : 1.0;
  const roofMat = isCementBox
    ? new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.85,
        metalness: 0.05,
        transparent: isCutaway,
        opacity: roofOpacity,
        depthWrite: !isCutaway,
      })
    : new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        transparent: isCutaway,
        opacity: roofOpacity,
        depthWrite: !isCutaway,
      });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = padH + wallH + roofH / 2;
  roof.castShadow = !isCutaway;
  roof.userData.isCabinRoof = true;
  roof.userData.isShelterRoof = true;
  roof.renderOrder = 1;
  group.add(roof);

  if (isCementBox) {
    const paraH = 1.2;
    const paraGeo = new THREE.BoxGeometry(w + 2.4, paraH, d + 2.4);
    const paraMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
      transparent: isCutaway,
      opacity: isCutaway ? 0.15 : 1.0,
      depthWrite: !isCutaway,
    });
    const para = new THREE.Mesh(paraGeo, paraMat);
    para.position.set(0, padH + wallH + roofH + paraH / 2, 0);
    para.userData.isCabinRoof = true;
    group.add(para);
  } else {
    for (let rx = -w / 2 + 3; rx <= w / 2 - 3; rx += 4) {
      const ribGeo = new THREE.BoxGeometry(0.8, 0.8, d + 2);
      const ribMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.25,
        metalness: 0.9,
        transparent: isCutaway,
        opacity: isCutaway ? 0.15 : 1.0,
        depthWrite: !isCutaway,
      });
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(rx, padH + wallH + roofH + 0.4, 0);
      rib.userData.isCabinRoof = true;
      group.add(rib);
    }
  }

  // Optional Exterior HVAC Condenser Unit (only rendered if explicitly requested)
  if (airconWall !== 'none' && Boolean(props?.showOutdoorCondenser)) {
    const acW = Math.min(w * 0.28, 8);
    const acH = 6;
    const acD = 4;
    const acBox = new THREE.Mesh(
      airconWall === 'east' || airconWall === 'west'
        ? new THREE.BoxGeometry(acD, acH, acW)
        : new THREE.BoxGeometry(acW, acH, acD),
      telecomGreyMat
    );

    if (airconWall === 'north') {
      acBox.position.set(w * 0.2, padH + wallH * 0.6, -d / 2 - acD / 2);
    } else if (airconWall === 'south') {
      acBox.position.set(w * 0.2, padH + wallH * 0.6, d / 2 + acD / 2);
    } else if (airconWall === 'east') {
      acBox.position.set(w / 2 + acD / 2, padH + wallH * 0.6, 0);
    } else {
      acBox.position.set(-w / 2 - acD / 2, padH + wallH * 0.6, 0);
    }
    acBox.castShadow = true;
    group.add(acBox);
  }

  // Feeder Cable Gland Entry Port Plate (Positioned at high level near ceiling / overhead runway)
  if (cableWall !== 'none') {
    const cableHoleDiaMm = Number(props?.cableHoleDiameterMm ?? props?.cableHoleDiameter ?? props?.feederDiameter ?? 250);
    const plateSpan = Math.max(2.4, Math.min(4.8, (cableHoleDiaMm / 250) * 2.8));
    const inSpan = Math.max(2.0, plateSpan - 0.35);

    const cableOffsetPct = Math.max(15, Math.min(85, Number(props?.cableHoleOffset ?? 50)));
    const offsetZ = (cableOffsetPct / 100 - 0.5) * Math.max(2, d - 10);
    const offsetX = (cableOffsetPct / 100 - 0.5) * Math.max(2, w - 10);
    const glandMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5, metalness: 0.3 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });

    // Vertical Level: Placed at overhead cable ladder runway level just beneath ceiling/roof
    // (aligned directly with the interior overhead cable ladder and outdoor cable bridge, NOT in the middle!)
    const customElevMm =
      props?.cableHoleElevationMm ??
      props?.feederElevationMm ??
      props?.customProps?.cableHoleElevationMm ??
      props?.customProps?.feederElevationMm;

    const defaultFeederCenterY = padH + wallH - plateSpan / 2 - 0.25;
    const feederCenterY =
      typeof customElevMm === 'number' && customElevMm > 0
        ? padH + Math.min(wallH - plateSpan / 2 - 0.2, Math.max(plateSpan / 2 + 0.8, (customElevMm / 1000) * 6.0))
        : defaultFeederCenterY;

    let gland: THREE.Mesh;
    if (cableWall === 'east') {
      gland = new THREE.Mesh(new THREE.BoxGeometry(0.6, plateSpan, plateSpan), glandMat);
      gland.position.set(w / 2 + 0.3, feederCenterY, offsetZ);
    } else if (cableWall === 'west') {
      gland = new THREE.Mesh(new THREE.BoxGeometry(0.6, plateSpan, plateSpan), glandMat);
      gland.position.set(-w / 2 - 0.3, feederCenterY, offsetZ);
    } else if (cableWall === 'north') {
      gland = new THREE.Mesh(new THREE.BoxGeometry(plateSpan, plateSpan, 0.6), glandMat);
      gland.position.set(offsetX, feederCenterY, -d / 2 - 0.3);
    } else {
      gland = new THREE.Mesh(new THREE.BoxGeometry(plateSpan, plateSpan, 0.6), glandMat);
      gland.position.set(offsetX, feederCenterY, d / 2 + 0.3);
    }
    gland.castShadow = true;
    group.add(gland);

    // Weatherproof inner gland sleeve
    const inGland = new THREE.Mesh(new THREE.BoxGeometry(
      cableWall === 'east' || cableWall === 'west' ? 0.3 : inSpan,
      inSpan,
      cableWall === 'east' || cableWall === 'west' ? inSpan : 0.3
    ), darkSteelMat);
    if (cableWall === 'east') {
      inGland.position.set(w / 2 - t - 0.15, feederCenterY, offsetZ);
    } else if (cableWall === 'west') {
      inGland.position.set(-w / 2 + t + 0.15, feederCenterY, offsetZ);
    } else if (cableWall === 'north') {
      inGland.position.set(offsetX, feederCenterY, -d / 2 + t + 0.15);
    } else {
      inGland.position.set(offsetX, feederCenterY, d / 2 - t - 0.15);
    }
    group.add(inGland);

    // Multiple feeder cable gland nipples / boots penetrating plate
    const bootRadius = Math.max(0.18, Math.min(0.42, (cableHoleDiaMm / 250) * 0.28));
    const bootCols = Math.max(2, Math.min(4, Math.floor(plateSpan / 3.0)));
    const step = (plateSpan * 0.65) / Math.max(1, bootCols - 1);
    for (let r = 0; r < bootCols; r++) {
      for (let c = 0; c < bootCols; c++) {
        const by = feederCenterY - (plateSpan * 0.65) / 2 + r * step;
        const bOffset = -(plateSpan * 0.65) / 2 + c * step;
        const boot = new THREE.Mesh(new THREE.CylinderGeometry(bootRadius, bootRadius * 1.3, 0.8, 8), bootMat);
        if (cableWall === 'east') {
          boot.rotation.z = -Math.PI / 2;
          boot.position.set(w / 2 + 0.6, by, offsetZ + bOffset);
        } else if (cableWall === 'west') {
          boot.rotation.z = Math.PI / 2;
          boot.position.set(-w / 2 - 0.6, by, offsetZ + bOffset);
        } else if (cableWall === 'north') {
          boot.rotation.x = Math.PI / 2;
          boot.position.set(offsetX + bOffset, by, -d / 2 - 0.6);
        } else {
          boot.rotation.x = -Math.PI / 2;
          boot.position.set(offsetX + bOffset, by, d / 2 + 0.6);
        }
        group.add(boot);
      }
    }
  }
}
