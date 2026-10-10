/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';
import { buildOpenBayRack3D } from '../../../rack-designer/build-3d-rack';

export function createShelterInteriorEquipment(mats: CAD3DSharedMaterials) {
  const { stainlessMat, telecomGreyMat, whiteCementMat } = mats;

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.7,
  });
  const rackFaceMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.4,
    metalness: 0.6,
  });
  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.9,
  });
  const ledCyanMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.9,
  });
  const ledAmberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.8,
  });

  const buildTelecomRack = (
    rackW = 3.6,
    rackH = 13.0,
    rackD = 3.8,
    rackObj?: any
  ): THREE.Group => {
    const sId = (rackObj?.stencilId || rackObj?.customProps?.stencilType || '').toLowerCase();
    const totalU =
      rackObj?.customProps?.uHeight ??
      rackObj?.uHeight ??
      (sId.includes('18u')
        ? 18
        : sId.includes('24u')
        ? 24
        : sId.includes('36u')
        ? 36
        : sId.includes('45u')
        ? 45
        : sId.includes('48u')
        ? 48
        : 42);

    const equips =
      rackObj?.customProps?.rackEquipments ??
      rackObj?.rackEquipments ??
      [];

    const isCab = !!(
      sId.includes('cabinet') ||
      sId.includes('odc') ||
      rackObj?.customProps?.isCabinet ||
      rackObj?.customProps?.rackType === 'enclosed-cabinet'
    );
    const rackType = isCab
      ? 'enclosed-cabinet'
      : sId.includes('2post')
      ? 'open-2post'
      : 'open-4post';
    const doorsOpen = !!(
      rackObj?.doorsOpen ||
      rackObj?.customProps?.doorsOpen ||
      rackObj?.customProps?.isClosed === false
    );
    const brand =
      rackObj?.customProps?.brand ||
      (sId.includes('huawei')
        ? 'Huawei'
        : sId.includes('eltek')
        ? 'Eltek'
        : sId.includes('ericsson')
        ? 'Ericsson'
        : sId.includes('fushan')
        ? 'Fushan'
        : sId.includes('fhodc')
        ? 'FiberHome'
        : 'Telecom');

    const heightMm =
      rackObj?.customProps?.heightMm ??
      rackObj?.heightMm ??
      Math.round(totalU * 44.45 + 130);

    return buildOpenBayRack3D({
      rackW,
      rackH,
      rackD,
      totalU,
      heightMm,
      equipments: equips,
      rackType,
      rackName: rackObj?.text || rackObj?.name,
      isCabinet: isCab,
      doorsOpen,
      brand,
    });
  };

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.25,
  });
  const lithiumMat = new THREE.MeshStandardMaterial({
    color: 0x14532d,
    roughness: 0.35,
    metalness: 0.2,
  });
  const mcbRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.3,
  });

  const buildRectifierCabinet = (
    recW = 3.4,
    recH = 13.0,
    recD = 3.4,
    batteryCountOrProps?: number | any,
    extraProps?: any
  ): THREE.Group => {
    const props =
      typeof batteryCountOrProps === 'object' && batteryCountOrProps !== null
        ? batteryCountOrProps
        : extraProps || {};
    const bCountRaw =
      typeof batteryCountOrProps === 'number'
        ? batteryCountOrProps
        : props.batteryCount;
    const count = typeof bCountRaw === 'number' && bCountRaw > 0 ? bCountRaw : 4;
    const isLithium = String(props.batteryType || '').startsWith('lifepo4');
    const numMods = Math.max(2, Math.min(8, props.rectifierModules || 4));

    // Dynamic actual height calculation from props if heightMm or uHeight is set
    const hMm =
      typeof props.heightMm === 'number' && props.heightMm > 0
        ? props.heightMm
        : typeof props.uHeight === 'number' && props.uHeight > 0
        ? Math.round(props.uHeight * 44.45 + 130)
        : 2000;
    const effH = recH > 0 && recH !== 11.5 && recH !== 13.0 ? recH : (hMm / 2000) * 13.0;

    const rGrp = new THREE.Group();

    // 1. Heavy-duty Enclosure Cabinet Body (Open Bayface)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.45,
      metalness: 0.35,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(recW, effH, recD), bodyMat);
    body.position.set(0, effH / 2, 0);
    rGrp.add(body);

    // Beveled frame corner pillars
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.6,
      roughness: 0.3,
    });
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, effH, 0.18),
          pillarMat
        );
        pillar.position.set((sx * (recW - 0.18)) / 2, effH / 2, (sz * (recD - 0.18)) / 2);
        rGrp.add(pillar);
      }
    }

    // Top Header & Safety Accent Trim (Red / Blue)
    const headerTrim = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.94, 0.35, 0.08),
      mcbRedMat
    );
    headerTrim.position.set(0, effH - 0.35, recD / 2 + 0.02);
    rGrp.add(headerTrim);

    // Header badge plate
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const headerBadge = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.72, 0.5, 0.06),
      badgeMat
    );
    headerBadge.position.set(0, effH - 0.8, recD / 2 + 0.02);
    rGrp.add(headerBadge);

    // 2. UPPER COMPARTMENT: Modular Rectifier Shelf & Smartpack LCD Controller
    const upperY = effH * 0.76;
    const upperH = effH * 0.22;
    const upperShelfBay = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.88, upperH, 0.2),
      darkSteelMat
    );
    upperShelfBay.position.set(0, upperY, recD / 2 - 0.05);
    rGrp.add(upperShelfBay);

    // Modular Rectifier Units (Flatpack2 / telecom power modules)
    const modTotalW = recW * 0.84;
    const modW = modTotalW / numMods;
    const modH = upperH * 0.44;
    const modStartY = upperY + upperH * 0.24;

    for (let m = 0; m < numMods; m++) {
      const mx = -modTotalW / 2 + m * modW + modW / 2;
      const modFace = new THREE.Mesh(
        new THREE.BoxGeometry(modW * 0.92, modH, 0.14),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.5 })
      );
      modFace.position.set(mx, modStartY, recD / 2 + 0.06);
      rGrp.add(modFace);

      // Cooling vent slats on module face
      for (let sl = -0.35; sl <= 0.35; sl += 0.22) {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(modW * 0.72, 0.06, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        slat.position.set(mx, modStartY + sl, recD / 2 + 0.13);
        rGrp.add(slat);
      }

      // Extraction handle bar
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, modH * 0.7, 0.1),
        stainlessMat
      );
      handle.position.set(mx + modW * 0.35, modStartY, recD / 2 + 0.14);
      rGrp.add(handle);

      // Status LED: Green Run LED
      const ledRun = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), ledGreenMat);
      ledRun.position.set(mx - modW * 0.32, modStartY - modH * 0.32, recD / 2 + 0.14);
      rGrp.add(ledRun);

      // Minor amber LED
      const ledWarn = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.04), ledAmberMat);
      ledWarn.position.set(mx - modW * 0.18, modStartY - modH * 0.32, recD / 2 + 0.14);
      rGrp.add(ledWarn);
    }

    // Smartpack Digital LCD Controller Screen
    const lcdW = recW * 0.58;
    const lcdH = upperH * 0.38;
    const lcdY = upperY - upperH * 0.25;

    const lcdFrame = new THREE.Mesh(
      new THREE.BoxGeometry(lcdW, lcdH, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x082f49, roughness: 0.2 })
    );
    lcdFrame.position.set(-recW * 0.1, lcdY, recD / 2 + 0.04);
    rGrp.add(lcdFrame);

    const lcdScreen = new THREE.Mesh(
      new THREE.BoxGeometry(lcdW * 0.78, lcdH * 0.65, 0.04),
      ledCyanMat
    );
    lcdScreen.position.set(-recW * 0.1, lcdY, recD / 2 + 0.08);
    rGrp.add(lcdScreen);

    // Controller Keypad Buttons (Enter, Esc, Arrows)
    for (let btn = 0; btn < 4; btn++) {
      const bx = lcdW * 0.28 + (btn % 2) * 0.18;
      const by = lcdY + (btn < 2 ? 0.12 : -0.12);
      const kBtn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8),
        stainlessMat
      );
      kBtn.rotation.x = Math.PI / 2;
      kBtn.position.set(-recW * 0.1 + bx, by, recD / 2 + 0.08);
      rGrp.add(kBtn);
    }

    // Emergency Power Off (EPO) Mushroom Switch with Yellow Safety Collar
    const epoCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 })
    );
    epoCollar.rotation.x = Math.PI / 2;
    epoCollar.position.set(recW * 0.32, lcdY, recD / 2 + 0.04);
    rGrp.add(epoCollar);

    const epoBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16),
      mcbRedMat
    );
    epoBtn.rotation.x = Math.PI / 2;
    epoBtn.position.set(recW * 0.32, lcdY, recD / 2 + 0.09);
    rGrp.add(epoBtn);

    // 3. MIDDLE COMPARTMENT: DC Distribution Breakers (MCB Array)
    const midY = effH * 0.57;
    const midH = Math.min(1.4, effH * 0.1);
    const mcbTray = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.88, midH, 0.12),
      darkSteelMat
    );
    mcbTray.position.set(0, midY, recD / 2 + 0.02);
    rGrp.add(mcbTray);

    // Copper distribution busbar background
    const busbar = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.82, 0.12, 0.04),
      copperMat
    );
    busbar.position.set(0, midY - midH * 0.35, recD / 2 + 0.08);
    rGrp.add(busbar);

    // Miniature Circuit Breakers (MCBs) with Red Toggles
    const breakerCount = 8;
    const breakerStep = (recW * 0.8) / breakerCount;
    for (let b = 0; b < breakerCount; b++) {
      const bx = -recW * 0.4 + b * breakerStep + breakerStep / 2;
      // White/grey breaker body
      const mcbBody = new THREE.Mesh(
        new THREE.BoxGeometry(breakerStep * 0.72, 0.7, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      mcbBody.position.set(bx, midY + 0.05, recD / 2 + 0.07);
      rGrp.add(mcbBody);

      // Red MCB toggle lever
      const mcbToggle = new THREE.Mesh(
        new THREE.BoxGeometry(breakerStep * 0.44, 0.28, 0.12),
        mcbRedMat
      );
      mcbToggle.position.set(bx, midY + 0.12, recD / 2 + 0.12);
      rGrp.add(mcbToggle);
    }

    // 4. LOWER COMPARTMENT: DYNAMIC CUSTOM BATTERY SYSTEM
    // Shelves, battery modules, red/blue terminals, copper interconnect busbars, and cable runs
    const battAreaTop = midY - midH / 2 - 0.2;
    const battAreaBottom = 0.8;
    const battAreaH = battAreaTop - battAreaBottom;

    // Recessed battery enclosure backing
    const battHousing = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.88, battAreaH, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    battHousing.position.set(0, battAreaBottom + battAreaH / 2, recD / 2 - 0.02);
    rGrp.add(battHousing);

    const redPinMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const bluePinMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const battBodyMat = isLithium
      ? lithiumMat
      : new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.45 });

    // Grid calculation
    const tiers = Math.min(4, Math.ceil(count / 4));
    const tierH = battAreaH / tiers;

    for (let t = 0; t < tiers; t++) {
      const tierY = battAreaBottom + t * tierH;
      const cellsInTier = Math.min(4, count - t * 4);
      const cellW = (recW * 0.78) / 4;

      // Heavy steel shelf support beam under each tier
      const shelfSupport = new THREE.Mesh(
        new THREE.BoxGeometry(recW * 0.86, 0.1, recD * 0.6),
        darkSteelMat
      );
      shelfSupport.position.set(0, tierY, recD / 2 - recD * 0.25);
      rGrp.add(shelfSupport);

      for (let c = 0; c < cellsInTier; c++) {
        const cx = -recW * 0.39 + c * cellW + cellW / 2;
        const cy = tierY + tierH * 0.48;

        // Battery module cell block
        const bMesh = new THREE.Mesh(
          new THREE.BoxGeometry(cellW * 0.84, tierH * 0.76, 0.28),
          battBodyMat
        );
        bMesh.position.set(cx, cy, recD / 2 + 0.08);
        rGrp.add(bMesh);

        // Terminal studs: Positive (+ red)
        const posPin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12),
          redPinMat
        );
        posPin.rotation.x = Math.PI / 2;
        posPin.position.set(cx - cellW * 0.24, cy + tierH * 0.22, recD / 2 + 0.22);
        rGrp.add(posPin);

        // Terminal studs: Negative (- blue)
        const negPin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12),
          bluePinMat
        );
        negPin.rotation.x = Math.PI / 2;
        negPin.position.set(cx + cellW * 0.24, cy + tierH * 0.22, recD / 2 + 0.22);
        rGrp.add(negPin);

        // Interconnect copper busbar bridging adjacent battery terminals
        if (c < cellsInTier - 1) {
          const busbarLink = new THREE.Mesh(
            new THREE.BoxGeometry(cellW * 0.48, 0.04, 0.03),
            copperMat
          );
          busbarLink.position.set(cx + cellW / 2, cy + tierH * 0.22, recD / 2 + 0.23);
          rGrp.add(busbarLink);
        }
      }

      // Acrylic safety retainer bar across front of tier
      const safetyGuard = new THREE.Mesh(
        new THREE.BoxGeometry(recW * 0.84, 0.06, 0.03),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.6,
        })
      );
      safetyGuard.position.set(0, tierY + tierH * 0.22, recD / 2 + 0.24);
      rGrp.add(safetyGuard);
    }

    // Vertical DC Main Feeder Cables (Red + / Blue -) running up the side channel to breakers
    const cableR = 0.04;
    const cableH = midY - (battAreaBottom + 0.4);
    const redMainCable = new THREE.Mesh(
      new THREE.CylinderGeometry(cableR, cableR, cableH, 10),
      redPinMat
    );
    redMainCable.position.set(-recW * 0.42, battAreaBottom + cableH / 2, recD / 2 + 0.12);
    rGrp.add(redMainCable);

    const blueMainCable = new THREE.Mesh(
      new THREE.CylinderGeometry(cableR, cableR, cableH, 10),
      bluePinMat
    );
    blueMainCable.position.set(-recW * 0.42 + 0.09, battAreaBottom + cableH / 2, recD / 2 + 0.12);
    rGrp.add(blueMainCable);

    // 5. Base Plinth & Grounding Stud
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(recW * 0.98, 0.6, recD * 0.98),
      darkSteelMat
    );
    plinth.position.set(0, 0.3, 0);
    rGrp.add(plinth);

    // Grounding symbol lug on bottom corner
    const groundLug = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x16a34a })
    );
    groundLug.position.set(recW * 0.4, 0.35, recD / 2 + 0.02);
    rGrp.add(groundLug);

    // Bayface only - no door enclosure
    return rGrp;
  };

  const buildBatteryBank = (batW = 4.6, batH = 6.5, batD = 1.8): THREE.Group => {
    const bGrp = new THREE.Group();
    const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(batW, batH, batD), darkSteelMat);
    rackFrame.position.set(0, batH / 2, 0);
    bGrp.add(rackFrame);

    const blockGeo = new THREE.BoxGeometry(0.9, 1.8, 1.4);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const redCapMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const blkCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

    for (let tier = 0; tier < 2; tier++) {
      const by = 1.2 + tier * 2.8;
      for (let col = 0; col < 4; col++) {
        const bx = -batW / 2 + 0.6 + col * 1.15;
        const bat = new THREE.Mesh(blockGeo, blockMat);
        bat.position.set(bx, by, 0.1);
        bGrp.add(bat);

        const posTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), redCapMat);
        posTerm.position.set(bx - 0.25, by + 0.98, 0.1);
        bGrp.add(posTerm);

        const negTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), blkCapMat);
        negTerm.position.set(bx + 0.25, by + 0.98, 0.1);
        bGrp.add(negTerm);
      }
    }
    return bGrp;
  };

  const buildACDBPanel = (panW = 2.8, panH = 3.8, panD = 0.8): THREE.Group => {
    const pGrp = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(panW, panH, panD), telecomGreyMat);
    pGrp.add(box);
    const warn = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.02), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    warn.position.set(0, panH * 0.25, panD / 2 + 0.01);
    pGrp.add(warn);
    for (let bi = -0.7; bi <= 0.7; bi += 0.35) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.1), stainlessMat);
      sw.position.set(bi, -0.2, panD / 2 + 0.06);
      pGrp.add(sw);
    }
    return pGrp;
  };

  const buildIndoorAC = (
    acW = 5.6,
    acH = 2.0,
    acD = 1.5,
    props?: any
  ): THREE.Group => {
    const aGrp = new THREE.Group();
    const isCRAC = Boolean(props?.isCRAC || (props?.stencilId || '').includes('crac'));

    if (isCRAC) {
      // Floor-Standing Precision Computer Room Air Conditioner (CRAC / Downflow Unit)
      const cracW = Math.max(4.0, acW);
      const cracH = Math.max(10.0, acH);
      const cracD = Math.max(3.2, acD);

      const cracBodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.6,
      });
      const cracBody = new THREE.Mesh(new THREE.BoxGeometry(cracW, cracH, cracD), cracBodyMat);
      cracBody.position.set(0, cracH / 2, 0);
      aGrp.add(cracBody);

      // Top Discharge Plenum Hood with blue accent trim
      const topHood = new THREE.Mesh(
        new THREE.BoxGeometry(cracW * 0.94, 0.8, cracD * 0.94),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 })
      );
      topHood.position.set(0, cracH - 0.4, 0);
      aGrp.add(topHood);

      // Dual High-CFM EC Backward-Curved Centrifugal Fan Grilles
      const fanRimMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      for (const fx of [-cracW * 0.25, cracW * 0.25]) {
        const fanRim = new THREE.Mesh(new THREE.CylinderGeometry(cracW * 0.18, cracW * 0.18, 0.1, 24), fanRimMat);
        fanRim.rotation.x = Math.PI / 2;
        fanRim.position.set(fx, cracH * 0.65, cracD / 2 + 0.05);
        aGrp.add(fanRim);

        const fanCenter = new THREE.Mesh(new THREE.CylinderGeometry(cracW * 0.06, cracW * 0.06, 0.14, 16), darkSteelMat);
        fanCenter.rotation.x = Math.PI / 2;
        fanCenter.position.set(fx, cracH * 0.65, cracD / 2 + 0.08);
        aGrp.add(fanCenter);
      }

      // Front Service Door Seam
      const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.04, cracH * 0.8, 0.02), darkSteelMat);
      doorLine.position.set(0, cracH * 0.45, cracD / 2 + 0.02);
      aGrp.add(doorLine);

      // Color Touchscreen Microprocessor Controller
      const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.06), darkSteelMat);
      screenFrame.position.set(0, cracH * 0.85, cracD / 2 + 0.04);
      aGrp.add(screenFrame);

      const cracLcd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.02), ledCyanMat);
      cracLcd.position.set(0, cracH * 0.85, cracD / 2 + 0.08);
      aGrp.add(cracLcd);

      return aGrp;
    }

    // =========================================================================
    // HIGH-WALL SPLIT INDOOR AIR CONDITIONER (Inverter Evaporator Unit)
    // Dimensionally constrained to realistic wall-unit proportions:
    // Width ~5.0 - 6.5 units (~1000mm)
    // Height ~1.8 - 2.2 units (~340mm)
    // Depth ~1.3 - 1.8 units (~260mm projection from wall)
    // =========================================================================
    const wUnit = Math.max(4.0, Math.min(8.0, acW));
    const hUnit = Math.min(2.4, Math.max(1.6, acH));
    const dUnit = Math.min(2.0, Math.max(1.2, acD));
    const targetTemp = Number(props?.targetTempC ?? 20);

    const acWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfbfcfe,
      roughness: 0.18,
      metalness: 0.06,
    });
    const acGrilleDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.65,
      metalness: 0.2,
    });
    const acLouverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.22,
      metalness: 0.12,
    });
    const acAccentBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.5,
    });
    const acChromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.9,
    });
    const coolAirFlowGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    // 1. Galvanized Heavy Steel Wall Mounting Bracket Backplate (against rear wall: z = -dUnit / 2)
    const bracketGeo = new THREE.BoxGeometry(wUnit * 0.94, hUnit * 0.88, 0.06);
    const bracket = new THREE.Mesh(bracketGeo, darkSteelMat);
    bracket.position.set(0, 0, -dUnit / 2 + 0.03);
    aGrp.add(bracket);

    // Wall mounting flange anchor points
    for (const bx of [-wUnit * 0.42, wUnit * 0.42]) {
      const flange = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.08), stainlessMat);
      flange.position.set(bx, 0, -dUnit / 2 + 0.04);
      aGrp.add(flange);
    }

    // 2. Main Appliance Housing (Glossy Arctic White Appliance Body)
    const bodyGeo = new THREE.BoxGeometry(wUnit, hUnit * 0.92, dUnit * 0.86);
    const acBody = new THREE.Mesh(bodyGeo, acWhiteMat);
    acBody.position.set(0, 0, -dUnit * 0.04);
    acBody.castShadow = true;
    acBody.receiveShadow = true;
    aGrp.add(acBody);

    // 3. Signature Aerodynamic Curved Front Fascia Panel
    // The top curves back towards the wall, and the lower front curves down to the discharge vent
    const fasciaW = wUnit * 0.99;
    const fasciaH = hUnit * 0.72;
    const fasciaD = dUnit * 0.22;
    const frontFascia = new THREE.Mesh(
      new THREE.BoxGeometry(fasciaW, fasciaH, fasciaD),
      acWhiteMat
    );
    frontFascia.position.set(0, hUnit * 0.05, dUnit / 2 - fasciaD / 2);
    frontFascia.castShadow = true;
    aGrp.add(frontFascia);

    // Top Chamfer / Beveled Hood (slanted back towards wall to guide return air)
    const topBevelGeo = new THREE.BoxGeometry(wUnit * 0.98, hUnit * 0.28, dUnit * 0.32);
    const topBevel = new THREE.Mesh(topBevelGeo, acWhiteMat);
    topBevel.rotation.x = -Math.PI * 0.16;
    topBevel.position.set(0, hUnit * 0.38, dUnit * 0.16);
    aGrp.add(topBevel);

    // Sleek Metallic Cyan Accent Pinstripe along lower fascia
    const pinstripe = new THREE.Mesh(
      new THREE.BoxGeometry(wUnit * 0.94, 0.05, 0.04),
      acAccentBlueMat
    );
    pinstripe.position.set(0, -hUnit * 0.18, dUnit / 2 + 0.02);
    aGrp.add(pinstripe);

    // Chrome "INVERTER" Emblem Badge on lower left
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.12, 0.03),
      acChromeMat
    );
    badge.position.set(-wUnit * 0.32, -hUnit * 0.18, dUnit / 2 + 0.03);
    aGrp.add(badge);

    // 4. Top Return-Air Intake Grille (Upper Deck Surface)
    const grilleW = wUnit * 0.86;
    const grilleD = dUnit * 0.58;
    const grilleCavity = new THREE.Mesh(
      new THREE.BoxGeometry(grilleW, 0.04, grilleD),
      acGrilleDarkMat
    );
    grilleCavity.position.set(0, hUnit / 2 + 0.01, -dUnit * 0.1);
    aGrp.add(grilleCavity);

    // Parallel Return Air Intake Micro-Slats
    const slatCount = 5;
    const slatStep = (grilleD * 0.8) / (slatCount - 1);
    for (let s = 0; s < slatCount; s++) {
      const sz = -dUnit * 0.1 - (grilleD * 0.4) + s * slatStep;
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(grilleW * 0.96, 0.04, 0.06),
        acWhiteMat
      );
      slat.position.set(0, hUnit / 2 + 0.03, sz);
      aGrp.add(slat);
    }

    // 5. Motorized Supply-Air Discharge Vent & Angled Louver (Bottom Lip)
    // Dark recessed airflow channel at the bottom front
    const ventW = wUnit * 0.88;
    const ventH = hUnit * 0.28;
    const ventD = dUnit * 0.36;
    const ventCavity = new THREE.Mesh(
      new THREE.BoxGeometry(ventW, ventH, ventD),
      acGrilleDarkMat
    );
    ventCavity.position.set(0, -hUnit * 0.36, dUnit * 0.18);
    aGrp.add(ventCavity);

    // Cross-Flow Cylindrical Blower Fan Wheel inside the vent cavity
    const blowerWheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, ventW * 0.92, 16),
      darkSteelMat
    );
    blowerWheel.rotation.z = Math.PI / 2;
    blowerWheel.position.set(0, -hUnit * 0.36, dUnit * 0.16);
    aGrp.add(blowerWheel);

    // Motorized Horizontal Airflow Deflection Louver Blade (Flap angled ~25° downward into room)
    const flapW = ventW * 0.96;
    const flapH = 0.06;
    const flapD = dUnit * 0.32;
    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(flapW, flapH, flapD),
      acLouverMat
    );
    flap.rotation.x = Math.PI * 0.16; // Angled downward directing air into room
    flap.position.set(0, -hUnit * 0.38, dUnit * 0.26);
    aGrp.add(flap);

    // Cool Airflow Discharge Glow Stream (Semi-transparent cyan plane indicating cold air blowing down)
    const airflowGeo = new THREE.PlaneGeometry(ventW * 0.85, 1.4);
    const airflowMesh = new THREE.Mesh(airflowGeo, coolAirFlowGlowMat);
    airflowMesh.rotation.x = Math.PI * 0.38;
    airflowMesh.position.set(0, -hUnit * 0.52, dUnit * 0.55);
    aGrp.add(airflowMesh);

    // 6. Digital Thermostat Translucent LED Display (Front Right Panel)
    const dspW = Math.min(1.1, wUnit * 0.2);
    const dspH = 0.48;
    const dspX = wUnit * 0.28;
    const dspY = hUnit * 0.08;

    const dspBezel = new THREE.Mesh(
      new THREE.BoxGeometry(dspW, dspH, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x082f49, roughness: 0.2 })
    );
    dspBezel.position.set(dspX, dspY, dUnit / 2 + 0.01);
    aGrp.add(dspBezel);

    // Glowing Cyan 7-Segment Digital Readout
    const dspGlow = new THREE.Mesh(
      new THREE.BoxGeometry(dspW * 0.75, dspH * 0.65, 0.02),
      ledCyanMat
    );
    dspGlow.position.set(dspX, dspY, dUnit / 2 + 0.03);
    aGrp.add(dspGlow);

    // Status Indicator LEDs: Green Power & Blue Cooling Run
    const ledGreen = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ledGreenMat);
    ledGreen.position.set(dspX - dspW * 0.55, dspY, dUnit / 2 + 0.02);
    aGrp.add(ledGreen);

    const ledBlue = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
      })
    );
    ledBlue.position.set(dspX - dspW * 0.55, dspY - 0.12, dUnit / 2 + 0.02);
    aGrp.add(ledBlue);

    // 7. Refrigerant Piping & Condensate Drain Knockout (Rear Corner)
    // Insulated white suction line bundle exiting through wall
    const pipeBundle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
    );
    pipeBundle.rotation.x = Math.PI / 2;
    pipeBundle.position.set(wUnit * 0.36, -hUnit * 0.22, -dUnit / 2 - 0.22);
    aGrp.add(pipeBundle);

    // Copper fittings visible at pipe exit
    const copperElbow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.18, 8),
      copperMat
    );
    copperElbow.rotation.x = Math.PI / 2;
    copperElbow.position.set(wUnit * 0.36, -hUnit * 0.22, -dUnit / 2 - 0.04);
    aGrp.add(copperElbow);

    // White ribbed condensate drain hose
    const drainHose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })
    );
    drainHose.rotation.x = Math.PI / 2;
    drainHose.position.set(wUnit * 0.36 - 0.18, -hUnit * 0.28, -dUnit / 2 - 0.18);
    aGrp.add(drainHose);

    return aGrp;
  };

  const buildFireExtinguisher = (): THREE.Group => {
    const fGrp = new THREE.Group();
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.4, 12), redMat);
    tank.position.y = 1.2;
    fGrp.add(tank);
    const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
    topDome.position.y = 2.4;
    fGrp.add(topDome);
    const valve = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.5), stainlessMat);
    valve.position.y = 2.65;
    fGrp.add(valve);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 8), darkSteelMat);
    horn.rotation.x = Math.PI / 2;
    horn.position.set(0, 1.8, 0.4);
    fGrp.add(horn);
    return fGrp;
  };

  return {
    buildTelecomRack,
    buildRectifierCabinet,
    buildBatteryBank,
    buildACDBPanel,
    buildIndoorAC,
    buildFireExtinguisher,
  };
}
