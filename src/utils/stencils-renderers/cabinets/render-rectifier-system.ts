/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from '../../../types/cad';

export function renderRectifierSystem(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stencilId: string,
  obj?: CADObject
): boolean {
  const customProps = obj?.customProps || {};
  const brand = (customProps.brand || (
    stencilId.includes('ericsson') ? 'Ericsson' :
    stencilId.includes('eltek') ? 'Eltek' :
    stencilId.includes('zte') ? 'ZTE' :
    stencilId.includes('huawei') ? 'Huawei' :
    stencilId.includes('vertiv') ? 'Vertiv' :
    stencilId.includes('delta') ? 'Delta' : 'Telecom'
  )) as string;

  const batteryCount = typeof customProps.batteryCount === 'number' ? customProps.batteryCount : 4;
  const numMods = Math.max(2, Math.min(8, customProps.rectifierModules || 4));

  // Actual Telecom Rectifier System Height and U-Capacity
  const heightMm =
    typeof customProps.heightMm === 'number' && customProps.heightMm > 0
      ? customProps.heightMm
      : typeof (obj as any)?.heightMm === 'number' && (obj as any).heightMm > 0
      ? (obj as any).heightMm
      : typeof customProps.uHeight === 'number' && customProps.uHeight > 0
      ? Math.round(customProps.uHeight * 44.45 + 130)
      : 2000;
  const uHeight =
    typeof customProps.uHeight === 'number' && customProps.uHeight > 0
      ? customProps.uHeight
      : typeof (obj as any)?.uHeight === 'number' && (obj as any).uHeight > 0
      ? (obj as any).uHeight
      : Math.max(12, Math.round((heightMm - 130) / 44.45));
  const heightMStr = (heightMm / 1000).toFixed(1);

  // Brand color accents
  const brandColors: Record<string, { primary: string; accent: string; bg: string }> = {
    Ericsson: { primary: '#0284c7', accent: '#38bdf8', bg: '#082f49' },
    Eltek: { primary: '#0284c7', accent: '#38bdf8', bg: '#0c4a6e' },
    ZTE: { primary: '#06b6d4', accent: '#22d3ee', bg: '#164e63' },
    Huawei: { primary: '#dc2626', accent: '#f87171', bg: '#450a0a' },
    Vertiv: { primary: '#f97316', accent: '#fb923c', bg: '#431407' },
    Delta: { primary: '#10b981', accent: '#34d399', bg: '#064e3b' },
  };

  const currentBrand = brandColors[brand] || brandColors.Ericsson;

  // 1. Heavy-duty Outer Steel Rack Enclosure Body
  ctx.save();
  ctx.fillStyle = '#0f172a'; // Deep charcoal/black 19" rack
  ctx.fillRect(4, 2, w - 8, h - 4);

  // Outer bevel and frame border
  ctx.strokeStyle = currentBrand.primary;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(4, 2, w - 8, h - 4);

  // Internal 19" rack vertical mounting rails (left and right)
  const railW = 2.2;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(5.5, 3.5, railW, h - 7);
  ctx.fillRect(w - 7.7, 3.5, railW, h - 7);

  // Cage nut square holes on rails
  ctx.fillStyle = '#475569';
  for (let ry = 5.5; ry < h - 8; ry += 3.5) {
    ctx.fillRect(6.0, ry, 1.2, 1.2);
    ctx.fillRect(w - 7.2, ry, 1.2, 1.2);
  }

  const rackInnerX = 8.2;
  const rackInnerW = w - 16.4;

  // 2. TOP SECTION: DC Power Distribution Unit (PDU) & Breaker Panel
  const pduY = 4.5;
  const pduH = Math.min(10, Math.max(7, h * 0.18));
  ctx.fillStyle = '#18181b';
  ctx.fillRect(rackInnerX, pduY, rackInnerW, pduH);
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 0.6;
  ctx.strokeRect(rackInnerX, pduY, rackInnerW, pduH);

  // PDU Top Header & Brand Tag
  ctx.fillStyle = currentBrand.bg;
  ctx.fillRect(rackInnerX, pduY, rackInnerW, 2.2);
  ctx.fillStyle = currentBrand.accent;
  ctx.font = 'bold 3.2px ui-monospace, monospace';
  ctx.fillText(`${brand.toUpperCase()} -48V DC PDU`, rackInnerX + 1.5, pduY + 1.7);

  // Mini Circuit Breakers (MCBs) in dual rows with white labels
  const numBreakers = Math.max(6, Math.min(10, Math.floor(rackInnerW / 2.8)));
  const bStep = (rackInnerW - 2) / numBreakers;
  for (let b = 0; b < numBreakers; b++) {
    const bx = rackInnerX + 1 + b * bStep;
    // Breaker body
    ctx.fillStyle = '#27272a';
    ctx.fillRect(bx, pduY + 2.6, bStep - 0.8, pduH - 4.6);
    // Colored toggle lever
    ctx.fillStyle = b % 3 === 0 ? '#38bdf8' : '#ef4444';
    ctx.fillRect(bx + 0.3, pduY + 3.0, bStep - 1.4, 1.5);
    // White label tag strip underneath
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, pduY + pduH - 1.6, bStep - 0.8, 1.1);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 1.8px ui-monospace, monospace';
    ctx.fillText(`${b + 1}`, bx + 0.4, pduY + pduH - 0.7);
  }

  // 3. UPPER-MID SECTION: Hot-Swappable Rectifier Shelf & Digital Controller
  const rectShelfY = pduY + pduH + 1.0;
  const rectShelfH = Math.min(12, Math.max(8, h * 0.22));
  ctx.fillStyle = '#18181b';
  ctx.fillRect(rackInnerX, rectShelfY, rackInnerW, rectShelfH);
  ctx.strokeStyle = '#52525b';
  ctx.lineWidth = 0.6;
  ctx.strokeRect(rackInnerX, rectShelfY, rackInnerW, rectShelfH);

  // Modular Rectifier Units (Hot-swappable with circular cooling vents & handles)
  const modTotalW = rackInnerW - 2.0;
  const modW = modTotalW / numMods;
  const modH = rectShelfH * 0.58;
  const modY = rectShelfY + 0.8;

  for (let m = 0; m < numMods; m++) {
    const mx = rackInnerX + 1.0 + m * modW;
    // Module casing
    ctx.fillStyle = '#27272a';
    ctx.fillRect(mx, modY, modW - 0.8, modH);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 0.4;
    ctx.strokeRect(mx, modY, modW - 0.8, modH);

    // Circular rotary ventilation fan grille (as clearly visible in the reference photo)
    const centerX = mx + (modW - 0.8) / 2;
    const centerY = modY + modH / 2;
    const radius = Math.min(modW * 0.32, modH * 0.32);

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Fan grille spokes
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Module extraction handle (right side)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(mx + modW - 1.6, modY + 1.0, 0.6, modH - 2.0);

    // Status LEDs: Green Run, Amber/Red Alarm
    ctx.fillStyle = '#22c55e'; // Run
    ctx.beginPath();
    ctx.arc(mx + 1.2, modY + modH - 1.2, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = m === 0 ? '#10b981' : '#3f3f46';
    ctx.beginPath();
    ctx.arc(mx + 2.4, modY + modH - 1.2, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Digital Controller LCD & Main Disconnects Row
  const ctrlY = modY + modH + 0.8;
  const ctrlH = rectShelfH - modH - 1.6;

  // Blue backlit LCD controller screen
  const lcdW = rackInnerW * 0.52;
  ctx.fillStyle = '#082f49';
  ctx.fillRect(rackInnerX + 1.0, ctrlY, lcdW, ctrlH);
  ctx.strokeStyle = currentBrand.accent;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(rackInnerX + 1.0, ctrlY, lcdW, ctrlH);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 2.8px ui-monospace, monospace';
  ctx.fillText('FLOAT: 53.5V · 128A', rackInnerX + 2.2, ctrlY + ctrlH * 0.55);

  ctx.fillStyle = '#7dd3fc';
  ctx.font = '2.0px ui-monospace, monospace';
  ctx.fillText('ALL NODES NORMAL', rackInnerX + 2.2, ctrlY + ctrlH * 0.9);

  // Yellow high-voltage warning label & battery disconnect breakers
  const warnX = rackInnerX + 1.0 + lcdW + 1.0;
  const warnW = rackInnerW - lcdW - 3.0;
  ctx.fillStyle = '#eab308'; // Warning yellow
  ctx.fillRect(warnX, ctrlY, warnW * 0.45, ctrlH);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 2.0px ui-monospace, monospace';
  ctx.fillText('⚡DC', warnX + 0.8, ctrlY + ctrlH * 0.65);

  // Heavy-duty battery disconnect breaker switches
  const discX = warnX + warnW * 0.45 + 0.6;
  ctx.fillStyle = '#27272a';
  ctx.fillRect(discX, ctrlY, warnW * 0.5, ctrlH);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(discX + 0.4, ctrlY + 0.4, warnW * 0.4, ctrlH - 0.8);

  // 4. LOWER SECTION: 4x Stacked 48V Smart Lithium Battery ESM Modules (Exact match to photo)
  const battStartY = rectShelfY + rectShelfH + 1.2;
  const battTotalH = h - 4.5 - battStartY;

  // Number of stacked battery packs (default 4 as seen in photo)
  const numPacks = Math.max(1, Math.min(6, batteryCount));
  const packH = (battTotalH - (numPacks - 1) * 0.8) / numPacks;

  for (let p = 0; p < numPacks; p++) {
    const py = battStartY + p * (packH + 0.8);

    // Battery pack chassis (Dark charcoal powder coat)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(rackInnerX, py, rackInnerW, packH);
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(rackInnerX, py, rackInnerW, packH);

    // Dual metal grab handles on left and right (matching photo)
    ctx.fillStyle = '#d4d4d8';
    // Left handle
    ctx.fillRect(rackInnerX + 1.0, py + 1.2, 0.7, packH - 2.4);
    ctx.fillRect(rackInnerX + 1.0, py + 1.2, 1.4, 0.6);
    ctx.fillRect(rackInnerX + 1.0, py + packH - 1.8, 1.4, 0.6);
    // Right handle
    ctx.fillRect(rackInnerX + rackInnerW - 1.7, py + 1.2, 0.7, packH - 2.4);
    ctx.fillRect(rackInnerX + rackInnerW - 2.4, py + 1.2, 1.4, 0.6);
    ctx.fillRect(rackInnerX + rackInnerW - 2.4, py + packH - 1.8, 1.4, 0.6);

    // Left side: Individual battery pack circuit breaker
    ctx.fillStyle = '#27272a';
    ctx.fillRect(rackInnerX + 2.8, py + packH * 0.25, 2.0, packH * 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rackInnerX + 3.2, py + packH * 0.35, 1.2, packH * 0.3);

    // Brand / Model Label on faceplate
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 2.4px ui-monospace, monospace';
    ctx.fillText(`${brand.toUpperCase()} SMART-Li`, rackInnerX + 5.5, py + packH * 0.4);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '1.8px ui-monospace, monospace';
    ctx.fillText(`ESM-48100 · 48V 100Ah`, rackInnerX + 5.5, py + packH * 0.75);

    // Right side: Digital SOC LCD display screen & status LEDs
    const bLcdW = 5.5;
    const bLcdX = rackInnerX + rackInnerW - 8.5;
    ctx.fillStyle = '#082f49';
    ctx.fillRect(bLcdX, py + 1.0, bLcdW, packH - 2.0);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.4;
    ctx.strokeRect(bLcdX, py + 1.0, bLcdW, packH - 2.0);

    // Cyan SOC readout
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 2.0px ui-monospace, monospace';
    ctx.fillText('100%', bLcdX + 0.8, py + packH * 0.45);

    // Green Run / SOC status bar LEDs
    for (let l = 0; l < 4; l++) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(bLcdX + 0.8 + l * 1.0, py + packH * 0.65, 0.7, 0.7);
    }

    // Heavy-duty DC terminal posts (+ Red, - Blue/Black with transparent safety shield)
    const termX = rackInnerX + rackInnerW - 13.0;
    // Positive stud (+ Red)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(termX, py + packH * 0.3, 1.5, 1.5);
    // Negative stud (- Blue)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(termX + 2.2, py + packH * 0.3, 1.5, 1.5);

    // Interconnect DC Power Bus Cables (Red and Blue bridging between tiers, matching photo)
    if (p < numPacks - 1) {
      const nextPy = battStartY + (p + 1) * (packH + 0.8);
      // Red cable
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(termX + 0.75, py + packH * 0.7);
      ctx.bezierCurveTo(termX - 0.4, py + packH, termX - 0.4, nextPy, termX + 0.75, nextPy + packH * 0.3);
      ctx.stroke();

      // Blue cable
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(termX + 2.95, py + packH * 0.7);
      ctx.bezierCurveTo(termX + 4.2, py + packH, termX + 4.2, nextPy, termX + 2.95, nextPy + packH * 0.3);
      ctx.stroke();

      // White communication daisy-chain cable (CAN/RS485 link)
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(bLcdX - 0.5, py + packH * 0.8);
      ctx.lineTo(bLcdX - 0.5, nextPy + 1.2);
      ctx.stroke();
    }
  }

  // 5. Clean Rack Bayface Enclosure Footer (No door - pure open bayface view)
  ctx.fillStyle = currentBrand.accent;
  ctx.font = 'bold 3.2px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${brand.toUpperCase()} RS · 48V · ${uHeight}U (${heightMStr}m)`, w / 2, h - 1.5);
  ctx.textAlign = 'left';

  ctx.restore();
  return true;
}
