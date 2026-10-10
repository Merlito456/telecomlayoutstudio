/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createAtsMpdBuilders(mats: CAD3DSharedMaterials) {
  const { galvSteelMat } = mats;

  const buildATS3D = (w: number, d: number, mountElevM = 1.6): THREE.Group => {
    const group = new THREE.Group();
    const encW = Math.min(w, 5.5);
    const encD = Math.min(d, 2.5);
    const encH = 5.0; // Compact wall-mounted ATS enclosure height
    const eyeLevelY = mountElevM * 5.8; // Standard people eye-view height (~1.60m above finished grade, matching 3D technician eyes)
    const elevY = eyeLevelY - encH / 2; // centered at eye level

    // 1. Galvanized Wall Mounting Unistrut Backing Channels & 4 Anchor Bolts
    const chanMat = galvSteelMat;
    const chan1 = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.6, 0.8, 0.4), chanMat);
    chan1.position.set(0, elevY + encH * 0.85, -encD / 2 - 0.2);
    group.add(chan1);

    const chan2 = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.6, 0.8, 0.4), chanMat);
    chan2.position.set(0, elevY + encH * 0.15, -encD / 2 - 0.2);
    group.add(chan2);

    // 4 Wall Anchor Bolts
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.9 });
    [
      [-encW / 2 - 0.4, elevY + encH * 0.85],
      [encW / 2 + 0.4, elevY + encH * 0.85],
      [-encW / 2 - 0.4, elevY + encH * 0.15],
      [encW / 2 + 0.4, elevY + encH * 0.15],
    ].forEach(([bx, by]) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 6), boltMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(bx, by, -encD / 2 - 0.35);
      group.add(bolt);
    });

    // 2. Weatherproof Sheet Steel Cabinet Housing (RAL 7035 Powder Coat / Industrial Slate)
    const encMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Industrial slate grey
      roughness: 0.38,
      metalness: 0.35,
    });
    const encGeo = new THREE.BoxGeometry(encW, encH, encD);
    const enc = new THREE.Mesh(encGeo, encMat);
    enc.position.y = elevY + encH / 2;
    enc.castShadow = true;
    group.add(enc);

    // Sloped weather rain canopy hood on top
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.4 });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.4, 0.6, encD + 1.2), hoodMat);
    hood.position.set(0, elevY + encH + 0.3, 0.2);
    hood.rotation.x = 0.06; // Sloped forward to divert rain
    group.add(hood);

    // Front cabinet door inset panel with perimeter gasket
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.3 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(encW - 1.0, encH - 1.0, 0.2), doorMat);
    door.position.set(0, elevY + encH / 2, encD / 2 + 0.1);
    group.add(door);

    // Stainless steel piano hinge knuckle along left side
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, encH - 1.2, 8), hingeMat);
    hinge.position.set(-encW / 2 + 0.35, elevY + encH / 2, encD / 2 + 0.15);
    group.add(hinge);

    // Dual quarter-turn door latches on right
    [elevY + encH * 0.75, elevY + encH * 0.25].forEach((ly) => {
      const latch = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.25, 8), hingeMat);
      latch.rotation.x = Math.PI / 2;
      latch.position.set(encW / 2 - 0.6, ly, encD / 2 + 0.2);
      group.add(latch);
    });

    // 3. Digital ATS Microprocessor Controller (Recessed screen display on front door)
    const ctrlW = encW * 0.55;
    const ctrlH = 2.4;
    const ctrlY = elevY + encH * 0.70;

    // Bezel
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(ctrlW, ctrlH, 0.15), bezelMat);
    bezel.position.set(0, ctrlY, encD / 2 + 0.2);
    group.add(bezel);

    // Backlit LCD Display (Cyan glow)
    const lcdMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const lcd = new THREE.Mesh(new THREE.BoxGeometry(ctrlW * 0.8, ctrlH * 0.45, 0.05), lcdMat);
    lcd.position.set(0, ctrlY + 0.3, encD / 2 + 0.28);
    group.add(lcd);

    // Status indicator jewels below screen (Mains Green, Gen Amber, Load Cyan, Auto Yellow)
    const ledColors = [0x22c55e, 0xf59e0b, 0x38bdf8, 0xfacc15];
    ledColors.forEach((col, idx) => {
      const ledMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const led = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8), ledMat);
      led.rotation.x = Math.PI / 2;
      led.position.set(-ctrlW * 0.3 + idx * (ctrlW * 0.2), ctrlY - 0.5, encD / 2 + 0.28);
      group.add(led);
    });

    // 4. Source 1 (MAINS) & Source 2 (GEN) Contactor Status Windows / Panels
    const compW = (encW - 2.5) * 0.4;
    const compH = 1.8;
    const compY = elevY + encH * 0.42;

    // Left Contactor: MAINS (Green border indicator)
    const mainsMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.4 });
    const mainsBox = new THREE.Mesh(new THREE.BoxGeometry(compW, compH, 0.12), mainsMat);
    mainsBox.position.set(-encW * 0.24, compY, encD / 2 + 0.2);
    group.add(mainsBox);

    // Right Contactor: GEN (Amber indicator)
    const genMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const genBox = new THREE.Mesh(new THREE.BoxGeometry(compW, compH, 0.12), genMat);
    genBox.position.set(encW * 0.24, compY, encD / 2 + 0.2);
    group.add(genBox);

    // Mechanical Interlock Bar in middle between contactors
    const interlockMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.8 });
    const interlock = new THREE.Mesh(new THREE.BoxGeometry(encW * 0.18, 0.35, 0.15), interlockMat);
    interlock.position.set(0, compY, encD / 2 + 0.25);
    group.add(interlock);

    // 5. Emergency Manual Changeover / Transfer Handle (OSHA Red Lever with LOTO Tab)
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.7), handleMat);
    handle.position.set(0, elevY + encH * 0.24, encD / 2 + 0.45);
    group.add(handle);

    // 6. High-Voltage Hazard Warning Triangle Decal
    const decMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const dec = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.05), decMat);
    dec.position.set(-encW * 0.26, elevY + encH * 0.24, encD / 2 + 0.22);
    group.add(dec);

    // 7. Rigid Steel Conduits (RSC) dropping all the way to ground
    const condMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const conduitOffsets = [-encW * 0.3, -encW * 0.1, encW * 0.1, encW * 0.3];
    conduitOffsets.forEach((cx, idx) => {
      const condR = idx === 3 ? 0.22 : 0.32;
      const cond = new THREE.Mesh(new THREE.CylinderGeometry(condR, condR, elevY, 8), condMat);
      cond.position.set(cx, elevY / 2, -encD * 0.15);
      group.add(cond);
    });

    // 8. Copper Grounding Earthing Busbar & Green Wire
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), copperMat);
    lug.position.set(encW / 2 + 0.25, elevY + 1.2, 0);
    group.add(lug);

    const earthWireMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const earthWire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, elevY + 1.2, 6), earthWireMat);
    earthWire.position.set(encW / 2 + 0.35, (elevY + 1.2) / 2, 0);
    group.add(earthWire);

    return group;
  };

  // Helper: MPD (Main Power Distribution Enclosure)
  const buildMPD3D = (w: number, d: number, isWall = false, mountElevM = 1.55): THREE.Group => {
    const group = new THREE.Group();
    const encH = isWall ? 5.5 : 11;
    const encW = isWall ? Math.min(w, 4.5) : w;
    const encD = isWall ? Math.min(d, 2.0) : d;
    const eyeLevelY = mountElevM * 5.8; // Standard people eye-view height (~1.55m above finished grade)
    const elevY = isWall ? eyeLevelY - encH / 2 : 0;

    if (isWall) {
      // Galvanized wall unistrut backing channels
      const chan1 = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.2, 0.6, 0.3), galvSteelMat);
      chan1.position.set(0, elevY + encH * 0.85, -encD / 2 - 0.15);
      group.add(chan1);

      const chan2 = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.2, 0.6, 0.3), galvSteelMat);
      chan2.position.set(0, elevY + encH * 0.15, -encD / 2 - 0.15);
      group.add(chan2);
    }

    // Weatherproof enclosure body
    const encMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.3,
    });
    const encGeo = new THREE.BoxGeometry(encW, encH, encD);
    const enc = new THREE.Mesh(encGeo, encMat);
    enc.position.y = elevY + encH / 2;
    enc.castShadow = true;
    group.add(enc);

    // Sloped weather hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(encW + 0.8, 0.5, encD + 0.6), encMat);
    hood.position.y = elevY + encH + 0.25;
    hood.rotation.x = 0.08;
    group.add(hood);

    // Main Rotary Isolator Switch (Red knob)
    const swGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 12);
    const swMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const sw = new THREE.Mesh(swGeo, swMat);
    sw.rotation.x = Math.PI / 2;
    sw.position.set(-encW * 0.25, elevY + encH * 0.55, encD / 2 + 0.2);
    group.add(sw);

    // Yellow Warning Hazard Triangle
    const warnGeo = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const warnMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const warn = new THREE.Mesh(warnGeo, warnMat);
    warn.position.set(encW * 0.25, elevY + encH * 0.7, encD / 2 + 0.08);
    group.add(warn);

    // Digital Meter LCD Screen
    const meterGeo = new THREE.BoxGeometry(encW * 0.35, 1.2, 0.1);
    const meterMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const meter = new THREE.Mesh(meterGeo, meterMat);
    meter.position.set(0, elevY + encH * 0.75, encD / 2 + 0.08);
    group.add(meter);

    if (isWall) {
      // Conduits dropping to grade
      const condMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 });
      [-encW * 0.25, encW * 0.25].forEach((cx) => {
        const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, elevY, 8), condMat);
        cond.position.set(cx, elevY / 2, 0);
        group.add(cond);
      });
    }

    return group;
  };

  // Helper: DCPDU (-48V DC Power Distribution Unit)
  const buildDCPDU3D = (w: number, d: number, isWall = false, mountElevM = 1.55): THREE.Group => {
    const group = new THREE.Group();
    const encH = isWall ? 5.0 : 10;
    const encW = isWall ? Math.min(w, 4.0) : w;
    const encD = isWall ? Math.min(d, 1.8) : d;
    const eyeLevelY = mountElevM * 5.8;
    const elevY = isWall ? eyeLevelY - encH / 2 : 0;

    if (isWall) {
      const chan1 = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.2, 0.6, 0.3), galvSteelMat);
      chan1.position.set(0, elevY + encH * 0.85, -encD / 2 - 0.15);
      group.add(chan1);

      const chan2 = new THREE.Mesh(new THREE.BoxGeometry(encW + 1.2, 0.6, 0.3), galvSteelMat);
      chan2.position.set(0, elevY + encH * 0.15, -encD / 2 - 0.15);
      group.add(chan2);
    }

    const encMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.25,
    });
    const enc = new THREE.Mesh(new THREE.BoxGeometry(encW, encH, encD), encMat);
    enc.position.y = elevY + encH / 2;
    enc.castShadow = true;
    group.add(enc);

    // Telecom Blue identification band
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const band = new THREE.Mesh(new THREE.BoxGeometry(encW - 0.6, 0.8, 0.15), bandMat);
    band.position.set(0, elevY + encH * 0.8, encD / 2 + 0.08);
    group.add(band);

    // Miniature Circuit Breaker Bank
    const mcbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const mcbSlot = new THREE.Mesh(new THREE.BoxGeometry(encW * 0.65, 2.0, 0.2), mcbMat);
    mcbSlot.position.set(0, elevY + encH * 0.45, encD / 2 + 0.1);
    group.add(mcbSlot);

    // Ground busbar copper lug
    const lugMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.6, 0.3), lugMat);
    lug.position.set(encW * 0.35, elevY + encH * 0.35, encD / 2 + 0.12);
    group.add(lug);

    if (isWall) {
      const condMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 });
      [-encW * 0.2, encW * 0.2].forEach((cx) => {
        const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, elevY, 8), condMat);
        cond.position.set(cx, elevY / 2, 0);
        group.add(cond);
      });
    }

    return group;
  };

  return {
    buildATS3D,
    buildMPD3D,
    buildDCPDU3D,
  };
}
