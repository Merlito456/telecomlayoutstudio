/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createAcpdbBuilders(mats: CAD3DSharedMaterials) {
  const { galvSteelMat } = mats;

  const buildACPDB3D = (
    w: number,
    d: number,
    mounting: 'wall' | 'pole' | 'stand' = 'wall',
    mountElevM = 1.55,
    sizeScale = 1.0,
    customBoxW?: number,
    customBoxH?: number,
    customBoxD?: number,
    boxCount = 1
  ): THREE.Group => {
    const group = new THREE.Group();

    // Telecom standard enclosure actual dimensions (converted to 3D units, ~5.0 units per meter):
    // Real enclosure: ~560mm wide, ~800mm tall, ~260mm deep
    const defaultW = 2.8; // ~0.56m
    const defaultH = 4.0; // ~0.80m
    const defaultD = 1.3; // ~0.26m

    const parsedW = customBoxW ? (customBoxW > 10 ? customBoxW * 0.005 : customBoxW) : defaultW;
    const parsedH = customBoxH ? (customBoxH > 10 ? customBoxH * 0.005 : customBoxH) : defaultH;
    const parsedD = customBoxD ? (customBoxD > 10 ? customBoxD * 0.005 : customBoxD) : defaultD;

    const encW = parsedW * sizeScale;
    const encH = parsedH * sizeScale;
    const encD = parsedD * sizeScale;

    const count = Math.max(1, Math.min(3, Math.round(boxCount)));

    // Human ergonomic height: meter window at eye level (~1.45m - 1.55m AFF)
    const eyeLevelY = mountElevM * 5.5; // ~8.5 units
    const elevY = eyeLevelY - encH / 2; // bottom of enclosure

    // Inter-box gap and total width
    const boxGap = 0.5; // ~100mm gap between adjacent enclosures
    const totalRackW = encW * count + boxGap * (count - 1);

    // Shared materials
    const encMat = new THREE.MeshStandardMaterial({
      color: 0xd8dee9, // Industrial RAL 7035 powder-coat clean grey
      roughness: 0.38,
      metalness: 0.25,
    });
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.3 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.35, metalness: 0.2 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.35 });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
    const latchMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.95 });
    const spdMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 });
    const swHandleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.2 });
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.6 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });
    const earthWireMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });

    // 1. MOUNTING INFRASTRUCTURE
    // ==========================
    if (mounting === 'pole') {
      // CUT THE POLE ONLY AT THE ACPDB LEVEL (Never extending into the sky!)
      const poleR = 0.35; // Sturdy galvanized utility pipe stanchion
      const poleTopY = elevY + encH + 0.15; // Cut right flush with top rain hood!
      const poleH = poleTopY;
      const poleZ = -encD / 2 - poleR - 0.15;

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.5 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.6 });
      const strapMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });

      // Pole positions: if 1 box, 1 pole in center; if multiple boxes, 2 poles spaced behind them
      const poleXs = count === 1 ? [0] : [-totalRackW * 0.28, totalRackW * 0.28];

      poleXs.forEach((px) => {
        // Cut pole cylinder from ground Y=0 up to poleTopY
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(poleR, poleR, poleH, 24), poleMat);
        pole.position.set(px, poleH / 2, poleZ);
        pole.castShadow = true;
        group.add(pole);

        // Domed weatherproof cap sealing the cut top of the pole
        const cap = new THREE.Mesh(new THREE.SphereGeometry(poleR * 1.05, 16, 10), capMat);
        cap.position.set(px, poleTopY, poleZ);
        group.add(cap);

        // Stainless steel bandit clamping straps wrapping the cut pole
        [elevY + encH * 0.82, elevY + encH * 0.18].forEach((sy) => {
          const strap = new THREE.Mesh(new THREE.CylinderGeometry(poleR + 0.05, poleR + 0.05, 0.2, 24), strapMat);
          strap.position.set(px, sy, poleZ);
          group.add(strap);
        });

        // Vertical AC utility conduit rising from ground up to bottom of enclosure
        const riserH = elevY;
        const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, riserH, 12), conduitMat);
        riser.position.set(px + poleR + 0.18, riserH / 2, poleZ);
        group.add(riser);
      });

      // Heavy galvanized unistrut cross-brackets connecting cabinet(s) to cut pole(s)
      [elevY + encH * 0.82, elevY + encH * 0.18].forEach((sy) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(totalRackW * 0.95, 0.35, poleR + 0.18), galvSteelMat);
        strut.position.set(0, sy, -encD / 2 - (poleR + 0.18) / 2);
        group.add(strut);
      });
    } else if (mounting === 'stand') {
      // Stand / Pedestal mounting: dual vertical C-channel legs under box, flange feet at Y=0
      const legW = 0.26;
      const legD = 0.26;
      const legXs = count === 1 ? [-encW * 0.35, encW * 0.35] : [-totalRackW * 0.4, totalRackW * 0.4];
      legXs.forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(legW, elevY, legD), galvSteelMat);
        leg.position.set(lx, elevY / 2, 0);
        leg.castShadow = true;
        group.add(leg);

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.65), galvSteelMat);
        foot.position.set(lx, 0.05, 0);
        group.add(foot);
      });

      const crossTie = new THREE.Mesh(new THREE.BoxGeometry(totalRackW * 0.85, 0.25, 0.14), galvSteelMat);
      crossTie.position.set(0, elevY * 0.55, 0);
      group.add(crossTie);
    } else {
      // Wall mounting: dual continuous unistrut backing channels and 4 (or 8) heavy hex anchor bolts
      const chanW = totalRackW + 0.6;
      [elevY + encH * 0.85, elevY + encH * 0.15].forEach((cy) => {
        const chan = new THREE.Mesh(new THREE.BoxGeometry(chanW, 0.35, 0.16), galvSteelMat);
        chan.position.set(0, cy, -encD / 2 - 0.08);
        group.add(chan);

        const boltMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.9 });
        const boltXs = count === 1
          ? [-encW / 2 - 0.15, encW / 2 + 0.15]
          : [-totalRackW / 2 - 0.15, 0, totalRackW / 2 + 0.15];
        boltXs.forEach((bx) => {
          const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 6), boltMat);
          bolt.rotation.x = Math.PI / 2;
          bolt.position.set(bx, cy, -encD / 2 - 0.16);
          group.add(bolt);
        });
      });
    }

    // 2. ENCLOSURES RENDERING (Single, Dual, or Triple)
    // ===============================================
    const boxCenters: number[] = [];
    if (count === 1) {
      boxCenters.push(0);
    } else if (count === 2) {
      boxCenters.push(-encW / 2 - boxGap / 2);
      boxCenters.push(encW / 2 + boxGap / 2);
    } else {
      boxCenters.push(-encW - boxGap);
      boxCenters.push(0);
      boxCenters.push(encW + boxGap);
    }

    boxCenters.forEach((bx, bIdx) => {
      const isMains = bIdx === 0;
      const isDG = bIdx === 1;

      // A. Main Enclosure Body
      const enc = new THREE.Mesh(new THREE.BoxGeometry(encW, encH, encD), encMat);
      enc.position.set(bx, elevY + encH / 2, 0);
      enc.castShadow = true;
      group.add(enc);

      // B. Sloped Weather Rain Canopy Hood
      const hoodW = encW + 0.3;
      const hoodD = encD + 0.24;
      const hood = new THREE.Mesh(new THREE.BoxGeometry(hoodW, 0.2, hoodD), hoodMat);
      hood.position.set(bx, elevY + encH + 0.09, 0.05);
      hood.rotation.x = 0.08;
      group.add(hood);

      // Front drip lip
      const dripLip = new THREE.Mesh(new THREE.BoxGeometry(hoodW, 0.12, 0.05), hoodMat);
      dripLip.position.set(bx, elevY + encH + 0.03, encD / 2 + 0.14);
      group.add(dripLip);

      // C. Front Door Face & Dark Recessed Trim Frame
      const door = new THREE.Mesh(new THREE.BoxGeometry(encW - 0.2, encH - 0.28, 0.06), doorMat);
      door.position.set(bx, elevY + encH / 2, encD / 2 + 0.03);
      group.add(door);

      const frameW = encW - 0.48;
      const frameH = encH - 0.56;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, 0.04), frameMat);
      frame.position.set(bx, elevY + encH / 2, encD / 2 + 0.06);
      group.add(frame);

      // Divider bar
      const divider = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.26, 0.08), doorMat);
      divider.position.set(bx, elevY + encH / 2, encD / 2 + 0.07);
      group.add(divider);

      // D. Upper Section: Polycarbonate Inspection Window & Digital Meter Readout
      const sectionH = (frameH - 0.36) / 2;
      const meterWindow = new THREE.Mesh(new THREE.BoxGeometry(frameW - 0.28, sectionH - 0.28, 0.03), windowMat);
      meterWindow.position.set(bx, elevY + encH / 2 + sectionH / 2 + 0.1, encD / 2 + 0.08);
      group.add(meterWindow);

      // Backlit LCD Display (Cyan for Mains, Amber for DG)
      const lcdMat = new THREE.MeshBasicMaterial({ color: isMains ? 0x06b6d4 : (isDG ? 0xf59e0b : 0x10b981) });
      const lcd = new THREE.Mesh(new THREE.BoxGeometry(frameW * 0.52, sectionH * 0.38, 0.02), lcdMat);
      lcd.position.set(bx, elevY + encH / 2 + sectionH / 2 + 0.14, encD / 2 + 0.09);
      group.add(lcd);

      // Phase status LED indicator jewels
      const ledColors = isMains
        ? [0xef4444, 0xfacc15, 0x3b82f6, 0x22c55e] // L1, L2, L3, Mains Normal Green
        : [0xef4444, 0xfacc15, 0x3b82f6, 0xeab308]; // DG L1, L2, L3, DG Running Amber
      ledColors.forEach((col, lIdx) => {
        const led = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8),
          new THREE.MeshBasicMaterial({ color: col })
        );
        led.rotation.x = Math.PI / 2;
        led.position.set(
          bx - frameW * 0.24 + lIdx * (frameW * 0.16),
          elevY + encH / 2 + sectionH / 2 - 0.24,
          encD / 2 + 0.09
        );
        group.add(led);
      });

      // E. Lower Section: MCB access door, SPD block, & Decals
      const lowerDoor = new THREE.Mesh(new THREE.BoxGeometry(frameW - 0.28, sectionH - 0.28, 0.03), doorMat);
      lowerDoor.position.set(bx, elevY + encH / 2 - sectionH / 2 - 0.1, encD / 2 + 0.08);
      group.add(lowerDoor);

      // Chrome quarter-turn compression latch
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.38, 0.11), latchMat);
      latch.position.set(bx + frameW * 0.28, elevY + encH / 2 - sectionH / 2 - 0.1, encD / 2 + 0.1);
      group.add(latch);

      // Class I+II Surge Protection Device (SPD) Block
      const spd = new THREE.Mesh(new THREE.BoxGeometry(frameW * 0.36, 0.46, 0.04), spdMat);
      spd.position.set(bx - frameW * 0.18, elevY + encH / 2 - sectionH / 2 - 0.1, encD / 2 + 0.09);
      group.add(spd);

      // High-Voltage Hazard Caution Warning Decal (⚡ 415V/230V)
      const decalMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const decal = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.32, 0.02), decalMat);
      decal.position.set(bx, elevY + encH / 2 - sectionH / 2 - 0.44, encD / 2 + 0.1);
      group.add(decal);

      // F. Rotary Isolator Disconnect Switch on Right Side
      const swBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.3, 0.6), frameMat);
      swBox.position.set(bx + encW / 2 + 0.2, elevY + encH * 0.55, 0.05);
      group.add(swBox);

      const swKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 12), swHandleMat);
      swKnob.rotation.z = Math.PI / 2;
      swKnob.position.set(bx + encW / 2 + 0.42, elevY + encH * 0.55, 0.05);
      group.add(swKnob);

      const swLever = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.6, 0.14), swHandleMat);
      swLever.position.set(bx + encW / 2 + 0.49, elevY + encH * 0.55, 0.05);
      group.add(swLever);

      // G. Bottom Cable Gland Hubs and Drops
      const dropXs = [bx - encW * 0.24, bx, bx + encW * 0.22];
      dropXs.forEach((cx, idx) => {
        const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 10), galvSteelMat);
        gland.position.set(cx, elevY - 0.07, 0);
        group.add(gland);

        if (idx === 2) {
          // Flexible Liquid-Tight Metallic Conduit (LFMC) curving gracefully down
          const curvePts: THREE.Vector3[] = [];
          for (let s = 0; s <= 12; s++) {
            const t = s / 12;
            const cy = elevY * (1 - t);
            const cxOffset = cx + Math.sin(t * Math.PI) * 0.4;
            const czOffset = Math.sin(t * Math.PI) * 0.22;
            curvePts.push(new THREE.Vector3(cxOffset, cy, czOffset));
          }
          const flexCurve = new THREE.CatmullRomCurve3(curvePts);
          const flexGeo = new THREE.TubeGeometry(flexCurve, 16, 0.1, 8, false);
          const flexMesh = new THREE.Mesh(flexGeo, conduitMat);
          group.add(flexMesh);
        } else {
          // Rigid Steel Conduit (RSC) dropping straight down to grade
          const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, elevY, 10), conduitMat);
          cond.position.set(cx, elevY / 2, idx === 0 ? 0.07 : -0.05);
          group.add(cond);
        }
      });

      // External Grounding Copper Lug & Earth Bonding Wire
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), copperMat);
      lug.position.set(bx - encW / 2 - 0.11, elevY + 0.55, 0);
      group.add(lug);

      const earthWire = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, elevY + 0.55, 8), earthWireMat);
      earthWire.position.set(bx - encW / 2 - 0.16, (elevY + 0.55) / 2, 0);
      group.add(earthWire);
    });

    // 3. INTER-TIE CONDUIT JOINING MULTIPLE ENCLOSURES (When boxCount >= 2)
    // ====================================================================
    if (count >= 2) {
      for (let i = 0; i < count - 1; i++) {
        const leftCenter = boxCenters[i];
        const rightCenter = boxCenters[i + 1];
        const spanW = rightCenter - encW / 2 - (leftCenter + encW / 2);
        const tieY = elevY + encH * 0.5;
        const tieZ = 0;

        // Upper inter-tie conduit (power transfer & control wiring)
        const tieConduit = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, spanW + 0.1, 10), conduitMat);
        tieConduit.rotation.z = Math.PI / 2;
        tieConduit.position.set((leftCenter + rightCenter) / 2, tieY, tieZ);
        group.add(tieConduit);

        // Lower inter-tie conduit (signal / earth interlock)
        const tieConduitLow = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, spanW + 0.1, 10), conduitMat);
        tieConduitLow.rotation.z = Math.PI / 2;
        tieConduitLow.position.set((leftCenter + rightCenter) / 2, elevY + encH * 0.2, tieZ);
        group.add(tieConduitLow);
      }
    }

    return group;
  };

  return {
    buildACPDB3D,
  };
}
