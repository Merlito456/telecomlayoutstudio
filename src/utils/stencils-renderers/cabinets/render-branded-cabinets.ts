import { drawPhotorealisticCementPad } from '../common';
import { getCabinetActualU } from '../../cabinet-u-capacity';

function renderOpenCabinetBay(
  ctx: CanvasRenderingContext2D,
  bx: number,
  bayW: number,
  h: number,
  _brand: string,
  isMini: boolean,
  b: number,
  numBays: number,
  obj?: any
) {
  const bayX = bx + 2.5;
  const bayY = 4.5;
  const innerW = bayW - 5;
  const innerH = h - 7;

  // 1. Interior Bay Dark Cavity
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(bayX, bayY, innerW, innerH);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(bayX, bayY, innerW, innerH);

  // 2. EIA-310 19" Vertical Steel Rails
  const railW = 2.4;
  ctx.fillStyle = '#334155';
  ctx.fillRect(bayX + 1, bayY + 1, railW, innerH - 2);
  ctx.fillRect(bayX + innerW - 1 - railW, bayY + 1, railW, innerH - 2);

  // EIA mounting hole ticks along rails
  ctx.fillStyle = '#94a3b8';
  const numTicks = Math.max(4, Math.floor(innerH / 4));
  for (let i = 1; i < numTicks; i++) {
    const ty = bayY + 1 + (i / numTicks) * (innerH - 2);
    ctx.fillRect(bayX + 1.8, ty, 0.8, 0.8);
    ctx.fillRect(bayX + innerW - 2.6, ty, 0.8, 0.8);
  }

  // 3. Render Installed Equipments (if any)
  const equips = ((obj?.customProps?.rackEquipments || obj?.rackEquipments || []) as any[]);
  const totalU = getCabinetActualU(obj);

  if (equips.length > 0) {
    const sorted = [...equips].sort((eqA, eqB) => (eqA.uSlot || 1) - (eqB.uSlot || 1));
    const availH = innerH - 3;
    const availW = innerW - railW * 2 - 2.4;
    const startX = bayX + 1 + railW + 1.2;

    sorted.forEach((eq) => {
      const slot = Math.max(1, Math.min(totalU, eq.uSlot || 1));
      const uH = Math.max(1, eq.uHeight || 1);
      const normY = Math.max(0, (totalU - (slot + uH - 1)) / totalU);
      const itemY = bayY + 1.5 + normY * availH;
      const itemH = Math.max(2.5, (uH / totalU) * availH);

      // Chassis body
      ctx.fillStyle = eq.color || '#1e293b';
      ctx.fillRect(startX, itemY, availW, itemH);
      ctx.strokeStyle = eq.strokeColor || '#64748b';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(startX, itemY, availW, itemH);

      // Status LED indicator
      const ledColor =
        eq.category === 'power' || eq.category === 'battery'
          ? '#f59e0b'
          : eq.category === 'fiber-shelf' || eq.category === 'patch-panel'
          ? '#0284c7'
          : '#22c55e';
      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.arc(startX + 1.8, itemY + itemH / 2, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Equipment Label text (if room)
      if (availW > 12 && itemH >= 3) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 2.4px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const labelText = (eq.label || eq.name || '').slice(0, 10);
        ctx.fillText(labelText, startX + 3.2, itemY + itemH / 2);
      }
    });
  } else {
    // Empty Bay Guides
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([1.5, 1.5]);
    for (let g = 1; g <= 3; g++) {
      const gy = bayY + (g / 4) * innerH;
      ctx.beginPath();
      ctx.moveTo(bayX + 4, gy);
      ctx.lineTo(bayX + innerW - 4, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 3px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('19" RACK BAY', bayX + innerW / 2, bayY + innerH / 2 - 2);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 2.2px monospace';
    ctx.fillText('OPEN (EMPTY)', bayX + innerW / 2, bayY + innerH / 2 + 2.5);
  }

  // 4. Architectural Swing Path & Open Door Panel
  const doorLeafLen = innerW;
  const isLeftHinged = numBays === 1 || b === 0;

  ctx.save();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 0.9;
  ctx.setLineDash([2, 2]);

  if (isLeftHinged) {
    // Hinged on the left corner of this bay
    const hx = bayX;
    const hy = h;
    ctx.beginPath();
    ctx.arc(hx, hy, doorLeafLen, 0, Math.PI / 2);
    ctx.stroke();
    ctx.restore();

    // Swung open door leaf panel (swung down 90°)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx - 2, hy, 2.5, doorLeafLen);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(hx - 2, hy, 2.5, doorLeafLen);

    // Weather gasket on inside edge of door
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(hx + 0.5, hy + 2, 0.8, doorLeafLen - 4);

    // Stainless mechanical latch handle on open edge
    ctx.fillStyle = '#64748b';
    ctx.fillRect(hx - 2.8, hy + doorLeafLen - 6, 1.2, 4);
  } else {
    // Hinged on the right corner of this bay (e.g. Bay 2 of 2-bay)
    const hx = bayX + innerW;
    const hy = h;
    ctx.beginPath();
    ctx.arc(hx, hy, doorLeafLen, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Swung open door leaf panel (swung down 90°)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx - 0.5, hy, 2.5, doorLeafLen);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(hx - 0.5, hy, 2.5, doorLeafLen);

    // Weather gasket on inside edge of door
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(hx - 1.3, hy + 2, 0.8, doorLeafLen - 4);

    // Stainless mechanical latch handle on open edge
    ctx.fillStyle = '#64748b';
    ctx.fillRect(hx + 1.6, hy + doorLeafLen - 6, 1.2, 4);
  }
}

export function renderBrandedCabinet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stencilId: string,
  obj?: any
): boolean {
  // 1. Concrete Base Plinth (Authentic Portland cement finish)
  drawPhotorealisticCementPad(ctx, -2, -2, w + 4, h + 4, {
    chamfer: 1.5,
    showJoints: false,
    roundRadius: 2.5,
  });

  const isOpen = !!(obj?.doorsOpen || obj?.customProps?.doorsOpen || obj?.customProps?.isClosed === false);
  const is2Bay = stencilId.includes('2bay');
  const isMini = stencilId.includes('mini');
  const brand = stencilId.startsWith('huawei')
    ? 'huawei'
    : stencilId.startsWith('eltek')
    ? 'eltek'
    : stencilId.startsWith('fushan')
    ? 'fushan'
    : stencilId.startsWith('ericsson')
    ? 'ericsson'
    : 'fhodc';

  // 2. Official Powder-Coated Pure White Body (RAL 9003 Signal White)
  const whiteGrad = ctx.createLinearGradient(0, 0, 0, h);
  whiteGrad.addColorStop(0, '#ffffff');
  whiteGrad.addColorStop(0.15, '#f8fafc');
  whiteGrad.addColorStop(0.85, '#f1f5f9');
  whiteGrad.addColorStop(1, '#e2e8f0');

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = whiteGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 3);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 3. Top Sun-Shield / Weather Hood with brand-specific styling
  if (brand === 'ericsson') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.lineTo(w + 1, 0);
    ctx.lineTo(w + 1, 4.5);
    ctx.lineTo(-1, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(w, 1);
    ctx.stroke();
  } else if (brand === 'eltek') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-1, -1.5, w + 2, 5);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-1, -1.5, w + 2, 5);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 3.5);
    ctx.lineTo(w, 3.5);
    ctx.stroke();
  } else if (brand === 'huawei') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-1, -1, w + 2, 5);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(-1, -1, w + 2, 5);
  } else if (brand === 'fushan') {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-1, -1, w + 2, 4.5);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-1, -1, w + 2, 4.5);
  } else {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-1, -1, w + 2, 4.5, 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 4. Doors, Gaskets, Latches, and Brand Emblems
  const numBays = is2Bay ? 2 : 1;
  const bayW = is2Bay ? (w - 3) / 2 : w;

  for (let b = 0; b < numBays; b++) {
    const bx = is2Bay ? b * (bayW + 3) : 0;

    if (isOpen) {
      renderOpenCabinetBay(ctx, bx, bayW, h, brand, isMini, b, numBays, obj);
      continue;
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(bx + 2.5, 4.5, bayW - 5, h - 7);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 3, 5, bayW - 6, h - 8);

    if (brand === 'huawei') {
      const logoX = bx + bayW / 2;
      const logoY = isMini ? 7.5 : 9;
      const logoR = isMini ? 2 : 2.8;

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
      ctx.fill();

      if (!isMini) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        const louverStart = 15;
        const louverCount = 4;
        for (let l = 0; l < louverCount; l++) {
          const ly = louverStart + l * 4;
          ctx.beginPath();
          ctx.moveTo(bx + 6, ly);
          ctx.lineTo(bx + bayW - 6, ly);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#1e293b';
      const hndlX = bx + bayW - 5.5;
      const hndlY = isMini ? h / 2 - 3 : 16;
      ctx.fillRect(hndlX, hndlY, 2, isMini ? 6 : 8);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(hndlX + 0.5, hndlY + 2, 1, 3);
    } else if (brand === 'ericsson') {
      const logoX = bx + bayW / 2;
      const logoY = isMini ? 6.5 : 8;
      ctx.strokeStyle = '#002561';
      ctx.lineWidth = 1.2;
      [-2, 0, 2].forEach((offsetY) => {
        ctx.beginPath();
        ctx.moveTo(logoX - 3.5, logoY + offsetY);
        ctx.lineTo(logoX + 3.5, logoY + offsetY);
        ctx.stroke();
      });

      if (!isMini) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        for (let l = 0; l < 4; l++) {
          const ly = 16 + l * 3.5;
          ctx.beginPath();
          ctx.moveTo(bx + 6, ly);
          ctx.lineTo(bx + bayW - 6, ly);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#002561';
      const hndlX = bx + bayW - 5.5;
      const hndlY = isMini ? h / 2 - 3 : 15;
      ctx.fillRect(hndlX, hndlY, 2, isMini ? 6 : 9);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(hndlX + 0.5, hndlY + 2, 1, 3);

      // Model badge & Battery indicator for ENC6150 / ENC6130
      if (stencilId === 'ericsson-enc6150' || stencilId === 'ericsson-enc6130') {
        const is6150 = stencilId === 'ericsson-enc6150';
        ctx.fillStyle = '#002561';
        ctx.font = 'bold 4.5px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(is6150 ? 'ENC6150' : 'ENC6130', bx + bayW / 2, 13);
        ctx.textAlign = 'left';

        // Lower Battery Compartment Indicator
        const battCount = typeof obj?.customProps?.batteryCount === 'number'
          ? obj.customProps.batteryCount
          : (is6150 ? 4 : 2);

        const battBoxY = h - 10;
        ctx.fillStyle = '#fff7ed';
        ctx.fillRect(bx + 4, battBoxY, bayW - 8, 6);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(bx + 4, battBoxY, bayW - 8, 6);

        ctx.fillStyle = '#ea580c';
        ctx.font = 'bold 3.8px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${battCount}× BATT`, bx + bayW / 2, battBoxY + 4.5);
        ctx.textAlign = 'left';
      }
    } else if (brand === 'eltek') {
      const logoX = bx + bayW / 2;
      const logoY = 7.5;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(logoX - 5, logoY - 2, 10, 4);
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(logoX - 5, logoY - 2, 10, 4);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(logoX - 3, logoY - 1);
      ctx.lineTo(logoX, logoY + 1);
      ctx.lineTo(logoX + 3, logoY - 1);
      ctx.stroke();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let l = 0; l < 4; l++) {
        const ly = 15 + l * 3.8;
        ctx.beginPath();
        ctx.moveTo(bx + 6, ly);
        ctx.lineTo(bx + bayW - 6, ly);
        ctx.stroke();
      }

      ctx.fillStyle = '#0284c7';
      const hndlX = bx + bayW - 5.5;
      const hndlY = 15;
      ctx.fillRect(hndlX, hndlY, 2.5, 9);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(hndlX + 0.5, hndlY + 2, 1.2, 3);
    } else if (brand === 'fushan') {
      const logoX = bx + bayW / 2;
      const logoY = isMini ? 6.5 : 8;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(logoX - 4, logoY - 1.5, 8, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(logoX - 2.5, logoY - 0.7, 5, 1.4);

      if (!isMini) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        for (let l = 0; l < 4; l++) {
          const ly = 15 + l * 4;
          ctx.beginPath();
          ctx.moveTo(bx + 6, ly);
          ctx.lineTo(bx + bayW - 6, ly);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#0284c7';
      const hndlX = bx + bayW - 5.5;
      const hndlY = isMini ? h / 2 - 3 : 15;
      ctx.fillRect(hndlX, hndlY, 2, isMini ? 6 : 9);
    } else {
      const logoX = bx + bayW / 2;
      const logoY = isMini ? 6.5 : 8;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(logoX - 4.5, logoY - 1.5, 9, 3);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 3px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FH', logoX, logoY);

      if (!isMini) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(bx + 6, 14, bayW - 12, h - 20);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 8, 18);
        ctx.lineTo(bx + bayW - 8, 18);
        ctx.stroke();
      }

      ctx.fillStyle = '#0284c7';
      const lockX = bx + bayW - 5;
      const lockY = isMini ? h / 2 : h / 2 + 1;
      ctx.beginPath();
      ctx.arc(lockX, lockY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. Plinth Anchor Hex Bolts (4 corners)
  ctx.fillStyle = '#94a3b8';
  const abr = 1.2;
  [
    { x: 2, y: 2 },
    { x: w - 2, y: 2 },
    { x: 2, y: h - 2 },
    { x: w - 2, y: h - 2 },
  ].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, abr, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Clean Title Label under Cabinet
  const isOdc = stencilId.endsWith('-odc') && !isMini;
  let labelText =
    brand === 'huawei'
      ? is2Bay ? 'HUAWEI 2-BAY (WHITE)' : isMini ? 'HUAWEI MINI ODC' : isOdc ? 'HUAWEI ODC (WHITE)' : 'HUAWEI 1-BAY (WHITE)'
      : brand === 'eltek'
      ? is2Bay ? 'ELTEK 2-BAY (WHITE)' : isMini ? 'ELTEK MINI ODC' : isOdc ? 'ELTEK ODC (WHITE)' : 'ELTEK 1-BAY (WHITE)'
      : brand === 'ericsson'
      ? is2Bay ? 'ERICSSON 2-BAY (WHITE)' : isMini ? 'ERICSSON MINI ODC' : isOdc ? 'ERICSSON ODC (WHITE)' : 'ERICSSON 1-BAY (WHITE)'
      : brand === 'fushan'
      ? is2Bay ? 'FUSHAN 2-BAY (WHITE)' : isMini ? 'FUSHAN MINI ODC' : isOdc ? 'FUSHAN ODC (WHITE)' : 'FUSHAN 1-BAY (WHITE)'
      : is2Bay ? 'FH ODC 2-BAY (WHITE)' : isMini ? 'FH MINI ODC' : isOdc ? 'FH ODC (WHITE)' : 'FH ODC 1-BAY (WHITE)';

  if (isOpen) {
    labelText += ' [DOOR OPEN]';
  }

  ctx.font = 'bold 6.5px monospace';
  ctx.fillStyle = isOpen
    ? '#10b981'
    : brand === 'huawei'
    ? '#ef4444'
    : brand === 'eltek'
    ? '#0284c7'
    : brand === 'ericsson'
    ? '#38bdf8'
    : brand === 'fushan'
    ? '#0ea5e9'
    : '#06b6d4';
  ctx.textAlign = 'center';
  ctx.fillText(labelText, w / 2, h + 9);
  return true;
}
