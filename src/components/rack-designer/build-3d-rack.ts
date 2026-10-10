/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RackEquipmentItem } from './types';

/**
 * Creates a high-fidelity dynamic canvas texture for vertical EIA-310-D rack rails
 * matching the authentic dark telecom finish from the reference photo:
 * - Satin dark charcoal cold-rolled steel finish
 * - EIA universal 3-hole spacing per 1U (5/8" - 5/8" - 1/2" pitch)
 * - Authentic square cage nut holes with metallic chamfers
 * - Silkscreened white U numbers (1 to totalU) with unit boundary marks
 */
function createEIA310RailTexture(totalU = 42, widthPx = 128, heightPx = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Dark cold-rolled steel base
    ctx.fillStyle = '#1c2434';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 2. Subtle brushed metal sheen gradient across flange
    const grad = ctx.createLinearGradient(0, 0, widthPx, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.02)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 3. Flange borders
    ctx.strokeStyle = '#3b4861';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, widthPx - 2, heightPx - 2);

    // EIA 1U slot height on canvas
    const uStep = heightPx / totalU;
    const holeX = widthPx * 0.38;

    for (let u = 1; u <= totalU; u++) {
      // Slot 1 at bottom, totalU at top
      const slotTopY = heightPx - u * uStep;

      // 1U horizontal stamped guideline
      ctx.strokeStyle = '#2b384e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, slotTopY);
      ctx.lineTo(widthPx, slotTopY);
      ctx.stroke();

      // Silkscreened U-number (printed crisply in white / sky blue on every U)
      const isKeyU = u === 1 || u === totalU || u % 5 === 0;
      ctx.fillStyle = isKeyU ? '#38bdf8' : '#e2e8f0';
      ctx.font = `bold ${Math.max(10, Math.floor(uStep * 0.44))}px ui-monospace, monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${u}`, widthPx * 0.92, slotTopY + uStep / 2);

      // EIA 3-hole pattern per 1U (Universal 5/8" - 5/8" - 1/2" spacing)
      const h1Y = slotTopY + uStep * 0.2;
      const h2Y = slotTopY + uStep * 0.5;
      const h3Y = slotTopY + uStep * 0.8;

      const holeSize = Math.max(3.2, uStep * 0.19);
      for (const hy of [h1Y, h2Y, h3Y]) {
        // Inner shadow / punch hole
        ctx.fillStyle = '#060a12';
        ctx.fillRect(holeX - holeSize / 2, hy - holeSize / 2, holeSize, holeSize);

        // Metallic stamped bevel border
        ctx.strokeStyle = '#55657e';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(holeX - holeSize / 2, hy - holeSize / 2, holeSize, holeSize);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates caution / reservation tape texture (yellow/black diagonal stripes)
 * as seen on telecom installations in the reference photo.
 */
function createCautionTapeTexture(widthPx = 256, heightPx = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#eab308'; // Safety yellow
    ctx.fillRect(0, 0, widthPx, heightPx);

    ctx.fillStyle = '#0f172a'; // Black hazard stripes
    const stripeW = 24;
    for (let x = -heightPx; x < widthPx + heightPx; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW - heightPx, heightPx);
      ctx.lineTo(x - heightPx, heightPx);
      ctx.closePath();
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Creates dynamic canvas texture for equipment front faceplate.
 */
function createEquipmentFaceTexture(
  equip: RackEquipmentItem,
  widthPx = 512,
  heightPx = 128
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Faceplate background
    ctx.fillStyle = equip.color || '#1e293b';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Bevel & border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, widthPx - 4, heightPx - 4);

    // Subtle brushed metal gradient
    const grad = ctx.createLinearGradient(0, 0, 0, heightPx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Label Plate (White text on deep dark slate badge)
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(16, 14, 220, heightPx - 28, 8);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Status LED dot
    ctx.fillStyle =
      equip.category === 'power' || equip.category === 'battery'
        ? '#f59e0b'
        : equip.category === 'patch-panel' || equip.category === 'fiber-shelf'
        ? '#0ea5e9'
        : '#22c55e';
    ctx.beginPath();
    ctx.arc(36, heightPx / 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // User Label Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(equip.label || 'EQUIPMENT', 54, heightPx / 2 - 4);

    // Subtitle U height
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.fillText(`${equip.uHeight}U · U${equip.uSlot}`, 54, heightPx / 2 + 18);

    // Port representations on right half
    if (equip.category === 'switch' || equip.category === 'patch-panel') {
      const portStartX = 260;
      const portWidth = 16;
      const portHeight = 20;
      for (let i = 0; i < 12; i++) {
        const px = portStartX + i * 20;
        ctx.fillStyle = '#050811';
        ctx.fillRect(px, heightPx / 2 - 10, portWidth, portHeight);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, heightPx / 2 - 10, portWidth, portHeight);
        // Gold contacts
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + 4, heightPx / 2 - 8, 8, 4);
      }
    } else if (equip.category === 'fiber-shelf') {
      const portStartX = 260;
      for (let i = 0; i < 10; i++) {
        const px = portStartX + i * 22;
        ctx.fillStyle = '#083344';
        ctx.fillRect(px, heightPx / 2 - 12, 18, 24);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, heightPx / 2 - 12, 18, 24);
      }
    } else if (
      equip.category === 'power' ||
      equip.name?.toLowerCase().includes('rectifier') ||
      equip.id?.includes('rectifier')
    ) {
      // PHOTOREALISTIC MODULAR RECTIFIER SHELF & LCD CONTROLLER
      const subrackX = 250;
      const subrackW = widthPx - subrackX - 16;
      const subrackH = heightPx - 24;

      // Subrack housing
      ctx.fillStyle = '#18181b';
      ctx.fillRect(subrackX, 12, subrackW, subrackH);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.strokeRect(subrackX, 12, subrackW, subrackH);

      // 4 Modular Rectifier Units
      const numSlots = 4;
      const slotW = (subrackW - 120) / numSlots;
      for (let s = 0; s < numSlots; s++) {
        const sx = subrackX + 6 + s * (slotW + 3);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(sx, 16, slotW, subrackH - 8);
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(sx, 16, slotW, subrackH - 8);

        // Vents
        ctx.fillStyle = '#09090b';
        for (let vy = 24; vy < subrackH - 16; vy += 8) {
          ctx.fillRect(sx + 4, vy, slotW - 8, 3);
        }

        // Green Run LED
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(sx + 8, subrackH, 4, 0, Math.PI * 2);
        ctx.fill();

        // Handle
        ctx.fillStyle = '#71717a';
        ctx.fillRect(sx + slotW - 6, 22, 3, subrackH - 24);
      }

      // LCD Controller Screen
      const lcdX = subrackX + subrackW - 105;
      ctx.fillStyle = '#082f49';
      ctx.fillRect(lcdX, 16, 55, subrackH - 8);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lcdX, 16, 55, subrackH - 8);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('-48V', lcdX + 27, 34);
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText('53.5V', lcdX + 27, 48);

      // DC MCBs (Breakers with red toggles)
      const mcbX = lcdX + 62;
      for (let b = 0; b < 3; b++) {
        const bx = mcbX + b * 11;
        ctx.fillStyle = '#18181b';
        ctx.fillRect(bx, 18, 9, subrackH - 12);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 1, 22, 7, 10);
      }
    } else if (equip.category === 'battery') {
      // BATTERY STRING WITH TERMINALS & BUSBARS
      const battX = 250;
      const battW = widthPx - battX - 16;
      const battH = heightPx - 24;
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(battX, 12, battW, battH);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.strokeRect(battX, 12, battW, battH);

      const cellW = (battW - 20) / 4;
      for (let c = 0; c < 4; c++) {
        const cx = battX + 4 + c * (cellW + 3);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(cx, 16, cellW, battH - 8);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx, 16, cellW, battH - 8);

        // Terminals
        ctx.fillStyle = '#ef4444'; // Red +
        ctx.fillRect(cx + 4, 20, 6, 6);
        ctx.fillStyle = '#3b82f6'; // Blue -
        ctx.fillRect(cx + cellW - 10, 20, 6, 6);

        // Copper Busbar
        if (c < 3) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(cx + cellW - 6, 22, 8, 3);
        }
      }
    } else {
      // Ventilation grille / Drive bays
      const ventStartX = 260;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ventStartX, 16, widthPx - ventStartX - 20, heightPx - 32);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ventStartX, 16, widthPx - ventStartX - 20, heightPx - 32);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates hexagonal perforated mesh texture for enclosed cabinets.
 */
function createHexMeshTexture(widthPx = 256, heightPx = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, widthPx, heightPx);

    ctx.fillStyle = '#020617';
    const hexRadius = 4;
    const stepX = hexRadius * 3;
    const stepY = hexRadius * 1.732;

    for (let y = 8; y < heightPx - 8; y += stepY) {
      const offsetX = (Math.round(y / stepY) % 2) * (stepX / 2);
      for (let x = 8 + offsetX; x < widthPx - 8; x += stepX) {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 3) * a;
          const hx = x + hexRadius * Math.cos(angle);
          const hy = y + hexRadius * Math.sin(angle);
          if (a === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, widthPx - 6, heightPx - 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * BUILDS AN AUTHENTIC 2-POST TELECOM OPEN RELAY RACK EXACTLY MATCHING THE USER'S ATTACHED PHOTO:
 * 1. Deep heavy floor base plates (extending deep front and back) with 4 floor anchor bolts and washers
 * 2. Heavy-duty vertical C-channel uprights (dark satin telecom steel) with triangular corner gussets
 * 3. Precision EIA-310-D mounting flanges with stamped square holes and silkscreened U numbers
 * 4. Open top framework with heavy angle cross-ties and overhead ladder rack bracket
 * 5. Vertical cable managers / cable harness runs on both sides with zip ties
 * 6. Solid copper grounding busbar (TGB) with brass/yellow standoff insulators and green bonding lead
 * 7. Cantilever equipment support angle brackets & caution/reservation banner
 */
export function buildOpenBayRack3D(params: {
  rackW?: number;
  rackH?: number;
  rackD?: number;
  totalU?: number;
  heightMm?: number;
  equipments?: RackEquipmentItem[];
  rackType?: string;
  rackName?: string;
  isCabinet?: boolean;
  doorsOpen?: boolean;
  brand?: string;
  placementOrientation?: 'horizontal' | 'vertical';
}): THREE.Group {
  const totalU = params.totalU ?? 42;
  const heightMm = params.heightMm || Math.round(totalU * 44.45 + 130);
  // 2000mm standard rack = 13.0 Three.js units. Proportional scaling to actual height.
  const computedRackH = (heightMm / 2000) * 13.0;
  const rackH = params.heightMm ? computedRackH : (params.rackH !== undefined && params.rackH !== 13.0 ? params.rackH : computedRackH);

  const {
    rackW = 3.6,
    rackD = 4.0,
    equipments = [],
    rackType = 'open-2post',
    isCabinet = false,
    doorsOpen = false,
    brand = 'Telecom',
    placementOrientation = 'horizontal',
  } = params;

  const rackGrp = new THREE.Group();
  const isEnclosed = isCabinet || rackType === 'enclosed-cabinet';
  // Standardize default rack look to the authentic 2-post telecom relay rack in photo
  const is2Post = !isEnclosed;

  // Authentic Materials matching the real telecom installation photo
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2232, // Dark slate/charcoal satin finish
    metalness: 0.85,
    roughness: 0.38,
  });

  const railSteelMat = new THREE.MeshStandardMaterial({
    color: 0x243044,
    metalness: 0.9,
    roughness: 0.32,
  });

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.22,
  });

  const yellowZincMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04, // Yellow zinc-plated high-tensile anchor bolts
    metalness: 0.85,
    roughness: 0.28,
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // Pure polished copper
    metalness: 0.82,
    roughness: 0.25,
  });

  const greenGroundMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.45,
  });

  const yellowStandoffMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.3,
  });

  const cableBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Telecom Cat6 / blue power cables
    roughness: 0.5,
  });

  const cableBlackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Black power / trunk cables
    roughness: 0.6,
  });

  const whiteTieMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // White cable zip ties
    roughness: 0.3,
  });

  // Dynamic EIA rail texture with stamped U-slot numbers and cage nut holes
  const railTex = createEIA310RailTexture(totalU);
  const railMatWithTex = new THREE.MeshStandardMaterial({
    map: railTex,
    color: 0xffffff,
    metalness: 0.88,
    roughness: 0.35,
  });

  // =========================================================================
  // 1. ENCLOSED CABINET SHELL (Only when isCabinet is selected)
  // =========================================================================
  if (isEnclosed) {
    const wallT = 0.15;
    const cabinetWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.2,
      roughness: 0.35,
    });

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(rackW + 0.3, rackH, wallT),
      cabinetWhiteMat
    );
    backWall.position.set(0, rackH / 2, -rackD / 2 - wallT / 2);
    rackGrp.add(backWall);

    for (const sx of [-rackW / 2 - wallT / 2, rackW / 2 + wallT / 2]) {
      const sidePanel = new THREE.Mesh(
        new THREE.BoxGeometry(wallT, rackH, rackD),
        cabinetWhiteMat
      );
      sidePanel.position.set(sx, rackH / 2, 0);
      rackGrp.add(sidePanel);
    }

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(rackW + 0.5, 0.25, rackD + 0.5),
      cabinetWhiteMat
    );
    const isRS =
      rackType?.includes('rectifier') ||
      brand?.toLowerCase().includes('rectifier') ||
      brand?.toLowerCase().includes('rs');

    if (!isRS) {
      const doorPivot = new THREE.Group();
      doorPivot.position.set(-rackW / 2 - 0.05, 0, rackD / 2 + 0.05);
      doorPivot.rotation.y = doorsOpen ? Math.PI * 0.6 : 0;

      const doorW = rackW + 0.25;
      const meshTex = createHexMeshTexture();
      const meshMat = new THREE.MeshStandardMaterial({
        map: meshTex,
        metalness: 0.6,
        roughness: 0.4,
      });

      const doorLeaf = new THREE.Mesh(
        new THREE.BoxGeometry(doorW, rackH - 0.2, 0.1),
        meshMat
      );
      doorLeaf.position.set(doorW / 2, rackH / 2, 0);
      doorPivot.add(doorLeaf);

      rackGrp.add(doorPivot);
    }
  }

  // =========================================================================
  // 2. AUTHENTIC 2-POST TELECOM RELAY RACK FRAME (EXACTLY AS IN PHOTO)
  // =========================================================================
  // Vertical Upright C-Channel Posts (Left and Right)
  const uprightW = 0.32;
  const uprightD = 0.48;
  const uprightH = rackH - 0.4;
  const postXOffset = rackW / 2 - uprightW / 2;

  // Build Left and Right upright channels
  for (const px of [-postXOffset, postXOffset]) {
    // 2.1 Main vertical structural C-channel
    const postGeo = new THREE.BoxGeometry(uprightW, uprightH, uprightD);
    const postMesh = new THREE.Mesh(postGeo, darkSteelMat);
    postMesh.position.set(px, uprightH / 2 + 0.25, 0);
    rackGrp.add(postMesh);

    // 2.2 EIA-310 Mounting Rail Flanges with dynamic U-numbers & square holes
    // Front EIA flange
    const flangeW = uprightW;
    const flangeThick = 0.08;
    const frontFlangeGeo = new THREE.BoxGeometry(flangeW, uprightH, flangeThick);
    const frontFlange = new THREE.Mesh(frontFlangeGeo, railMatWithTex);
    frontFlange.position.set(px, uprightH / 2 + 0.25, uprightD / 2 + flangeThick / 2);
    rackGrp.add(frontFlange);

    // Rear EIA flange
    const rearFlangeGeo = new THREE.BoxGeometry(flangeW, uprightH, flangeThick);
    const rearFlange = new THREE.Mesh(rearFlangeGeo, railMatWithTex);
    rearFlange.position.set(px, uprightH / 2 + 0.25, -uprightD / 2 - flangeThick / 2);
    rackGrp.add(rearFlange);

    // 2.3 Cable tie-down pass-through ports down the post web
    const portCount = Math.max(2, Math.floor((uprightH - 2.0) / 1.1));
    for (let i = 1; i <= portCount; i++) {
      const portH = 0.45;
      const portW = 0.15;
      const cutout = new THREE.Mesh(
        new THREE.BoxGeometry(portW, portH, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
      );
      cutout.position.set(px, 1.2 + i * 1.1, 0);
      rackGrp.add(cutout);
    }
  }

  // =========================================================================
  // 3. HEAVY FLOOR BASE PLATES & SEISMIC ANCHOR BOLTS (MATCHING PHOTO)
  // Deep steel base plates extending forward and backward with triangular gussets
  // =========================================================================
  const baseFootW = 0.48;
  const baseFootH = 0.22;
  const baseFootD = rackD * 0.96; // Deep foot for self-supporting stability

  for (const fx of [-postXOffset, postXOffset]) {
    // 3.1 Heavy floor base steel plate
    const baseFoot = new THREE.Mesh(
      new THREE.BoxGeometry(baseFootW, baseFootH, baseFootD),
      darkSteelMat
    );
    baseFoot.position.set(fx, baseFootH / 2, 0);
    rackGrp.add(baseFoot);

    // 3.2 Triangular Gusset Braces (Forward & Backward) welded between post and foot
    const gussetShape = new THREE.Shape();
    gussetShape.moveTo(0, 0);
    gussetShape.lineTo(baseFootD * 0.35, 0);
    gussetShape.lineTo(0, 1.1);
    gussetShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: false };
    const gussetGeo = new THREE.ExtrudeGeometry(gussetShape, extrudeSettings);

    // Front gusset
    const frontGusset = new THREE.Mesh(gussetGeo, darkSteelMat);
    frontGusset.position.set(fx - 0.04, baseFootH, uprightD / 2);
    rackGrp.add(frontGusset);

    // Rear gusset
    const rearGusset = new THREE.Mesh(gussetGeo, darkSteelMat);
    rearGusset.rotation.y = Math.PI;
    rearGusset.position.set(fx + 0.04, baseFootH, -uprightD / 2);
    rackGrp.add(rearGusset);

    // 3.3 Floor Expansion Anchor Bolts (4 heavy studs per foot: 2 front, 2 rear)
    const anchorPositions = [
      { z: baseFootD * 0.4 },
      { z: baseFootD * 0.28 },
      { z: -baseFootD * 0.28 },
      { z: -baseFootD * 0.4 },
    ];

    anchorPositions.forEach((pos) => {
      // Hex nut
      const nutMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.12, 6),
        yellowZincMat
      );
      nutMesh.position.set(fx, baseFootH + 0.08, pos.z);
      rackGrp.add(nutMesh);

      // Heavy flat washer
      const washerMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16),
        yellowZincMat
      );
      washerMesh.position.set(fx, baseFootH + 0.02, pos.z);
      rackGrp.add(washerMesh);

      // Threaded stud projecting above nut
      const studMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.22, 10),
        stainlessMat
      );
      studMesh.position.set(fx, baseFootH + 0.14, pos.z);
      rackGrp.add(studMesh);
    });
  }

  // Floor leveling tie-bar connecting left and right base feet at front and rear
  const baseTieFront = new THREE.Mesh(
    new THREE.BoxGeometry(rackW - baseFootW, 0.15, 0.15),
    darkSteelMat
  );
  baseTieFront.position.set(0, 0.1, baseFootD * 0.38);
  rackGrp.add(baseTieFront);

  const baseTieRear = new THREE.Mesh(
    new THREE.BoxGeometry(rackW - baseFootW, 0.15, 0.15),
    darkSteelMat
  );
  baseTieRear.position.set(0, 0.1, -baseFootD * 0.38);
  rackGrp.add(baseTieRear);

  // =========================================================================
  // 4. TOP FRAME CROSSMEMBER & OVERHEAD LADDER RUNWAY BRACKETS (NO TABLETOP!)
  // Completely OPEN center allowing cables to drop directly from runway above
  // =========================================================================
  const topBarH = 0.2;
  const topBarD = 0.35;

  // Top structural crossmember connecting the upright posts
  const topCrossbar = new THREE.Mesh(
    new THREE.BoxGeometry(rackW, topBarH, topBarD),
    darkSteelMat
  );
  topCrossbar.position.set(0, rackH, 0);
  rackGrp.add(topCrossbar);

  // Overhead cable ladder runway drop-out clamp bracket
  const ladderClamp = new THREE.Mesh(
    new THREE.BoxGeometry(rackW * 0.65, 0.22, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 })
  );
  ladderClamp.position.set(0, rackH + 0.15, 0);
  rackGrp.add(ladderClamp);

  // Curved cable waterfall plate for smooth bend radius into the rack
  const waterfallGeo = new THREE.CylinderGeometry(0.24, 0.24, rackW * 0.45, 12, 1, false, 0, Math.PI);
  const waterfallMesh = new THREE.Mesh(waterfallGeo, stainlessMat);
  waterfallMesh.rotation.z = Math.PI / 2;
  waterfallMesh.position.set(0, rackH + 0.12, 0.22);
  rackGrp.add(waterfallMesh);

  // Top triangular gusset brackets securing upright posts to top crossbar
  for (const px of [-postXOffset, postXOffset]) {
    const topCornerGusset = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.35, topBarD + 0.08),
      darkSteelMat
    );
    topCornerGusset.position.set(px, rackH - 0.18, 0);
    rackGrp.add(topCornerGusset);
  }

  // =========================================================================
  // 5. VERTICAL CABLE RUNWAYS & HARNESS BUNDLES (EXACTLY AS IN PHOTO)
  // Shows authentic telecom cable management running down both upright posts:
  // - High-density bundled blue & black cables secured by white zip-ties
  // - Cable drop from overhead ladder into rack
  // =========================================================================
  const cableBundleH = rackH * 0.88;

  for (const side of [-1, 1]) {
    const bundleX = side * (rackW / 2 + 0.18);

    // Vertical C-channel cable manager bracket
    const spineMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, cableBundleH, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
    );
    spineMesh.position.set(bundleX, rackH * 0.52, 0);
    rackGrp.add(spineMesh);

    // High-capacity cable bundles (Blue Cat6 / trunk cables)
    const cableCylinder1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, cableBundleH, 10),
      cableBlueMat
    );
    cableCylinder1.position.set(bundleX - 0.03, rackH * 0.52, 0.08);
    rackGrp.add(cableCylinder1);

    const cableCylinder2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, cableBundleH, 10),
      cableBlackMat
    );
    cableCylinder2.position.set(bundleX + 0.02, rackH * 0.52, -0.06);
    rackGrp.add(cableCylinder2);

    // Repeated white cable zip ties securing the cable harness
    const tieCount = 14;
    const tieStep = cableBundleH / (tieCount + 1);
    for (let t = 1; t <= tieCount; t++) {
      const tieY = rackH * 0.1 + t * tieStep;
      const tieRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.05, 12),
        whiteTieMat
      );
      tieRing.position.set(bundleX, tieY, 0.01);
      rackGrp.add(tieRing);
    }
  }

  // =========================================================================
  // 6. SOLID COPPER GROUNDING BUSBAR (TGB) & GREEN GROUNDING LEAD (AS IN PHOTO)
  // =========================================================================
  const tgbBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, rackH * 0.78, 0.22),
    copperMat
  );
  tgbBar.position.set(rackW / 2 - 0.05, rackH * 0.52, -uprightD / 2 - 0.12);
  rackGrp.add(tgbBar);

  // Standoff insulators (brass/yellow) and compression lugs
  for (const sy of [rackH * 0.25, rackH * 0.52, rackH * 0.78]) {
    const standoff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.14, 10),
      yellowStandoffMat
    );
    standoff.rotation.z = Math.PI / 2;
    standoff.position.set(rackW / 2, sy, -uprightD / 2 - 0.12);
    rackGrp.add(standoff);

    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.15, 0.1), stainlessMat);
    lug.position.set(rackW / 2 - 0.06, sy, -uprightD / 2 - 0.12);
    rackGrp.add(lug);
  }

  // Continuous #6 AWG insulated green ground wire running down to floor
  const groundWire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, rackH * 0.45, 8),
    greenGroundMat
  );
  groundWire.position.set(rackW / 2 - 0.05, rackH * 0.22, -uprightD / 2 - 0.12);
  rackGrp.add(groundWire);

  // =========================================================================
  // 7. EMPTY RACK OR LOADED RACK DETAILS (MATCHING REAL TELECOM RACK LOOK)
  // =========================================================================
  if (!equipments || equipments.length === 0) {
    // 7.1 Cantilever chassis support angle brackets (L-brackets ready for gear)
    const shelfY = rackH * 0.32;
    const bracketGeo = new THREE.BoxGeometry(0.12, 0.08, uprightD * 1.4);
    for (const px of [-postXOffset + 0.18, postXOffset - 0.18]) {
      const bracket = new THREE.Mesh(bracketGeo, stainlessMat);
      bracket.position.set(px, shelfY, 0);
      rackGrp.add(bracket);
    }

    // 7.2 1U Perforated equipment shelf
    const shelfGeo = new THREE.BoxGeometry(rackW - 0.5, 0.08, uprightD * 1.2);
    const shelfMesh = new THREE.Mesh(shelfGeo, darkSteelMat);
    shelfMesh.position.set(0, shelfY + 0.05, 0);
    rackGrp.add(shelfMesh);

    // 7.3 Diagonal Caution / Space Reservation Banner Tape (as seen in photo)
    const tapeGeo = new THREE.BoxGeometry(rackW - 0.35, 0.28, 0.04);
    const tapeTex = createCautionTapeTexture();
    const tapeMat = new THREE.MeshStandardMaterial({
      map: tapeTex,
      roughness: 0.3,
    });
    const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
    tapeMesh.position.set(0, rackH * 0.62, uprightD / 2 + 0.05);
    rackGrp.add(tapeMesh);
  }

  // =========================================================================
  // 8. INSTALLED EQUIPMENTS (PLACED AT EXACT U-SLOT POSITIONS)
  // =========================================================================
  if (equipments && equipments.length > 0) {
    if (placementOrientation === 'vertical') {
      const usableW = rackW - 0.45;
      const slotUnitW = usableW / totalU;
      const bladeH = rackH - 0.8;
      const centerY = rackH / 2;

      equipments.forEach((equip) => {
        const itemW = Math.max(0.18, equip.uHeight * slotUnitW - 0.04);
        const itemD = Math.min(
          rackD - 0.4,
          Math.max(1.8, ((equip.depthMm || 450) / 1000) * (rackD / 0.8))
        );
        const startX = -usableW / 2 + (equip.uSlot - 1) * slotUnitW;
        const centerX = startX + itemW / 2;

        const equipGroup = new THREE.Group();
        equipGroup.position.set(centerX, centerY, 0);

        const chassisMat = new THREE.MeshStandardMaterial({
          color: equip.color ? parseInt(equip.color.replace('#', '0x'), 16) : 0x1e293b,
          metalness: 0.75,
          roughness: 0.35,
        });
        const chassisGeo = new THREE.BoxGeometry(itemW, bladeH, itemD);
        const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
        equipGroup.add(chassisMesh);

        // Top & bottom cassette ejector handles
        const latchGeo = new THREE.BoxGeometry(Math.max(0.12, itemW - 0.04), 0.16, 0.06);
        const latchTop = new THREE.Mesh(latchGeo, stainlessMat);
        latchTop.position.set(0, bladeH / 2 - 0.1, itemD / 2 + 0.02);
        equipGroup.add(latchTop);

        const latchBot = new THREE.Mesh(latchGeo, stainlessMat);
        latchBot.position.set(0, -bladeH / 2 + 0.1, itemD / 2 + 0.02);
        equipGroup.add(latchBot);

        rackGrp.add(equipGroup);
      });
    } else {
      const usableHeight = rackH - 0.8;
      const uUnitH = usableHeight / totalU;
      const chassisW = rackW - 0.45;

      equipments.forEach((equip) => {
        const itemH = Math.max(0.2, equip.uHeight * uUnitH - 0.04);
        const itemD = Math.min(
          rackD - 0.4,
          Math.max(1.8, ((equip.depthMm || 450) / 1000) * (rackD / 0.8))
        );
        const baseY = 0.45 + (equip.uSlot - 1) * uUnitH;
        const centerY = baseY + itemH / 2;

        const equipGroup = new THREE.Group();
        equipGroup.position.set(0, centerY, 0);

        const chassisMat = new THREE.MeshStandardMaterial({
          color: equip.color ? parseInt(equip.color.replace('#', '0x'), 16) : 0x1e293b,
          metalness: 0.75,
          roughness: 0.35,
        });
        const chassisGeo = new THREE.BoxGeometry(chassisW, itemH, itemD);
        const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
        equipGroup.add(chassisMesh);

        // Front faceplate with crisp label, status LED, and port graphics
        const faceTex = createEquipmentFaceTexture(equip);
        const faceMat = new THREE.MeshStandardMaterial({
          map: faceTex,
          roughness: 0.3,
          metalness: 0.5,
        });
        const faceGeo = new THREE.PlaneGeometry(chassisW, itemH);
        const faceMesh = new THREE.Mesh(faceGeo, faceMat);
        faceMesh.position.set(0, 0, itemD / 2 + 0.01);
        equipGroup.add(faceMesh);

        // Left & Right mounting ears bolted into EIA rail holes
        const earGeo = new THREE.BoxGeometry(0.18, itemH, 0.08);
        const earLeft = new THREE.Mesh(earGeo, stainlessMat);
        earLeft.position.set(-rackW / 2 + 0.12, 0, itemD / 2);
        equipGroup.add(earLeft);

        const earRight = new THREE.Mesh(earGeo, stainlessMat);
        earRight.position.set(rackW / 2 - 0.12, 0, itemD / 2);
        equipGroup.add(earRight);

        rackGrp.add(equipGroup);
      });
    }
  }

  return rackGrp;
}
