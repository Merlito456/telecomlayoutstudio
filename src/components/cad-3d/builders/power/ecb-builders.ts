/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';

export function createEcbBuilders(mats: CAD3DSharedMaterials) {
  const { galvSteelMat } = mats;

  // Helper: ECB (Electrical Circuit Breaker / Main Disconnect) - Wall Mounted (Actual Telecom Look)
  const buildECBWallMounted3D = (w: number, d: number, mountElevM = 1.55): THREE.Group => {
    const group = new THREE.Group();
    const encW = Math.min(w * 0.25, 2.2);
    const encD = Math.min(d * 0.3, 1.0);
    const encH = 2.4; // Compact enclosure
    const eyeLevelY = mountElevM * 5.8; // Standard people eye-view height (~1.55m above finished grade, matching 3D technician eyes)
    const elevY = eyeLevelY - encH / 2; // Centered at eye level

    // 1. Galvanized Wall Mounting Unistrut Backing Channels & 4 Mounting Tabs
    const chanMat = galvSteelMat;
    const chan1 = new THREE.Mesh(new THREE.BoxGeometry(encW + 0.8, 0.4, 0.2), chanMat);
    chan1.position.set(0, elevY + encH * 0.85, -encD / 2 - 0.1);
    group.add(chan1);

    const chan2 = new THREE.Mesh(new THREE.BoxGeometry(encW + 0.8, 0.4, 0.2), chanMat);
    chan2.position.set(0, elevY + encH * 0.15, -encD / 2 - 0.1);
    group.add(chan2);

    // 4 Wall Anchor Bolts
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.9 });
    [
      [-encW / 2 - 0.2, elevY + encH * 0.85],
      [encW / 2 + 0.2, elevY + encH * 0.85],
      [-encW / 2 - 0.2, elevY + encH * 0.15],
      [encW / 2 + 0.2, elevY + encH * 0.15],
    ].forEach(([bx, by]) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 6), boltMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(bx, by, -encD / 2 - 0.18);
      group.add(bolt);
    });

    // 2. Weatherproof NEMA 4X / IP65 Powder-Coated Sheet Steel Enclosure (RAL 7035 Industrial Light Grey)
    const encMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.35,
      metalness: 0.35,
    });
    const enc = new THREE.Mesh(new THREE.BoxGeometry(encW, encH, encD), encMat);
    enc.position.y = elevY + encH / 2;
    enc.castShadow = true;
    group.add(enc);

    // Top Sloped Rain Drip Hood Canopy Overhang
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(encW + 0.6, 0.25, encD + 0.4), hoodMat);
    hood.position.set(0, elevY + encH + 0.12, 0.08);
    hood.rotation.x = 0.08; // Sloped forward to divert rainwater
    group.add(hood);

    // Front Door Inset with Neoprene Gasket
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.4, metalness: 0.2 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(encW - 0.3, encH - 0.35, 0.08), doorMat);
    door.position.set(0, elevY + encH / 2, encD / 2 + 0.04);
    group.add(door);

    // Stainless Steel Continuous Piano Hinge Knuckle on Left
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, encH - 0.4, 8), hingeMat);
    hinge.position.set(-encW / 2 + 0.12, elevY + encH / 2, encD / 2 + 0.06);
    group.add(hinge);

    // High-Visibility Safety Red Disconnect Throw / Rotary Switch on Right (at eye level)
    const swBoxMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.4 });
    const swBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.18), swBoxMat);
    swBox.position.set(encW * 0.22, elevY + encH * 0.55, encD / 2 + 0.1);
    group.add(swBox);

    // Emergency Throw Lever Handle (OSHA Red)
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.2 });
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), leverMat);
    lever.position.set(encW * 0.22, elevY + encH * 0.55, encD / 2 + 0.2);
    group.add(lever);

    // High-Voltage Hazard Caution Sign
    const warnMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const warn = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.04), warnMat);
    warn.position.set(-encW * 0.2, elevY + encH * 0.6, encD / 2 + 0.06);
    group.add(warn);

    // Conduits dropping to grade
    const condMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.5 });
    [-encW * 0.22, encW * 0.12].forEach((cx) => {
      const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, elevY, 8), condMat);
      conduit.position.set(cx, elevY / 2, 0);
      group.add(conduit);
    });

    // Grounding Terminal Copper Lug & Green/Yellow Earth Wire
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), copperMat);
    lug.position.set(encW / 2 + 0.15, elevY + 0.6, 0);
    group.add(lug);

    const earthWireMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const earthWire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, elevY + 0.6, 6), earthWireMat);
    earthWire.position.set(encW / 2 + 0.25, (elevY + 0.6) / 2, 0);
    group.add(earthWire);

    return group;
  };

  // Helper: ECB (Pole Mounted) - Cut Pole at Equipment Level
  const buildECBPoleMounted3D = (w: number, d: number): THREE.Group => {
    const group = new THREE.Group();
    const encH = 7.5;
    const elevY = 9; // Eye-level ECB mounting
    const poleH = elevY + encH + 0.4; // Cut pole right at equipment level (Never extending into sky!)
    const poleR = 0.65; // Realistic slender galvanized steel pipe (~3.5" to 4" OD)

    // 1. Galvanized Steel Utility Pipe Pole Column (Cut at equipment level)
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.4 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(poleR, poleR, poleH, 20), poleMat);
    pole.position.set(0, poleH / 2, -d / 2 - poleR - 0.35);
    pole.castShadow = true;
    group.add(pole);

    // Domed pole cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.6 });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(poleR * 1.05, 12, 8), capMat);
    cap.position.set(0, poleH, -d / 2 - poleR - 0.35);
    group.add(cap);

    // Stainless Steel Banding Straps (Bandit Clamps) Wrapped Around Pole
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
    [elevY + 6.5, elevY + 1.5].forEach((sy) => {
      const strap = new THREE.Mesh(new THREE.CylinderGeometry(poleR + 0.06, poleR + 0.06, 0.35, 20), strapMat);
      strap.position.set(0, sy, -d / 2 - poleR - 0.35);
      group.add(strap);
    });

    // Galvanized Unistrut Standoff Bracket
    const brack = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.7, poleR + 0.35), galvSteelMat);
    brack.position.set(0, elevY + 4, -d / 2 - (poleR + 0.35) / 2);
    group.add(brack);

    // 2. Weatherproof ECB Disconnect Enclosure Box
    const encMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.35, metalness: 0.35 });
    const enc = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, encH, d * 0.9), encMat);
    enc.position.set(0, elevY + encH / 2, 0);
    enc.castShadow = true;
    group.add(enc);

    // Sloped weather hood
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85 + 1.0, 0.5, d + 0.8), hoodMat);
    hood.position.set(0, elevY + encH + 0.25, 0.1);
    hood.rotation.x = 0.08;
    group.add(hood);

    // Red Disconnect Throw Handle
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.5), leverMat);
    lever.position.set(w * 0.25, elevY + encH * 0.55, d * 0.45 + 0.3);
    group.add(lever);

    // Hazard badge
    const decMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const dec = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.05), decMat);
    dec.position.set(-w * 0.18, elevY + encH * 0.55, d * 0.45 + 0.05);
    group.add(dec);

    // Vertical Rigid Conduit Riser (RSC) Running Alongside Pole
    const condMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.7 });
    const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, poleH, 12), condMat);
    riser.position.set(poleR + 0.35, poleH / 2, -d / 2 - poleR - 0.35);
    group.add(riser);

    // Pole Earthing Ground Wire to Grade
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const earthWire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, elevY + 4, 6), earthMat);
    earthWire.position.set(-poleR - 0.28, (elevY + 4) / 2, -d / 2 - poleR - 0.35);
    group.add(earthWire);

    // Bottom conduits dropping to ground
    [-w * 0.2, w * 0.05].forEach((cx) => {
      const condDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, elevY, 8), condMat);
      condDrop.position.set(cx, elevY / 2, 0);
      group.add(condDrop);
    });

    return group;
  };

  // Helper: ECB (Electrical Circuit Breaker / Main Disconnect) - Generic fallback
  const buildECB3D = (w: number, d: number): THREE.Group => {
    return buildECBWallMounted3D(w, d);
  };

  return {
    buildECBWallMounted3D,
    buildECBPoleMounted3D,
    buildECB3D,
  };
}
