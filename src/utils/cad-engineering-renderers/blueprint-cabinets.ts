import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "./common";

export function renderEngineeringCabinet(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (
    stencilId?.startsWith('rectifier-') ||
    (obj.customProps?.isRectifierSystem && stencilId !== 'rack-power-rectifier')
  ) {
    const brand = (
      obj.customProps?.brand ||
      (stencilId.includes('ericsson')
        ? 'ERICSSON'
        : stencilId.includes('eltek')
        ? 'ELTEK'
        : stencilId.includes('zte')
        ? 'ZTE'
        : stencilId.includes('huawei')
        ? 'HUAWEI'
        : stencilId.includes('vertiv')
        ? 'VERTIV'
        : stencilId.includes('delta')
        ? 'DELTA'
        : 'TELECOM')
    ).toUpperCase();

    const batteryCount = typeof obj.customProps?.batteryCount === 'number' ? obj.customProps.batteryCount : 4;
    const heightMm =
      typeof obj.customProps?.heightMm === 'number' && obj.customProps.heightMm > 0
        ? obj.customProps.heightMm
        : typeof (obj as any)?.heightMm === 'number' && (obj as any).heightMm > 0
        ? (obj as any).heightMm
        : typeof obj.customProps?.uHeight === 'number' && obj.customProps.uHeight > 0
        ? Math.round(obj.customProps.uHeight * 44.45 + 130)
        : 2000;
    const uHeight =
      typeof obj.customProps?.uHeight === 'number' && obj.customProps.uHeight > 0
        ? obj.customProps.uHeight
        : typeof (obj as any)?.uHeight === 'number' && (obj as any).uHeight > 0
        ? (obj as any).uHeight
        : Math.max(12, Math.round((heightMm - 130) / 44.45));
    const heightMStr = (heightMm / 1000).toFixed(1);

    // Outer Enclosure Body Frame (Open Bayface)
    ctx.fillStyle = colors.fill;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, 0, w, h);

    // 4 Corner EIA 19" Mounting Rail Posts
    const railX = 4;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(railX, 4, 3, 3);
    ctx.strokeRect(w - railX - 3, 4, 3, 3);
    ctx.strokeRect(railX, h - 7, 3, 3);
    ctx.strokeRect(w - railX - 3, h - 7, 3, 3);

    // 1. TOP DC PDU SECTION (DC Power Distribution Unit)
    const pduH = Math.min(8.5, h * 0.18);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(railX + 3.5, 4, w - (railX + 3.5) * 2, pduH);

    // MCB Circuit Breakers
    const numBreakers = 8;
    const bStep = (w - (railX + 4.5) * 2) / numBreakers;
    for (let b = 0; b < numBreakers; b++) {
      const bx = railX + 4.5 + b * bStep;
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(bx, 5.5, bStep - 1.2, pduH - 3);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bx, 5.5, bStep - 1.2, pduH - 3);
    }

    // 2. MODULAR RECTIFIER SHELF & CONTROLLER
    const rectShelfY = 4 + pduH + 1.5;
    const rectShelfH = Math.min(10.5, h * 0.22);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(railX + 3.5, rectShelfY, w - (railX + 3.5) * 2, rectShelfH);

    // 4 Modular Rectifier Unit slots
    const modTotalW = w - (railX + 4.5) * 2;
    const modW = modTotalW / 4;
    const modH = rectShelfH * 0.55;
    for (let m = 0; m < 4; m++) {
      const mx = railX + 4.5 + m * modW;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(mx + 0.5, rectShelfY + 1, modW - 1, modH);

      // Cooling vent circle
      const cx = mx + modW / 2;
      const cy = rectShelfY + 1 + modH / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(modW * 0.28, modH * 0.28), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Controller LCD Screen
    const lcdY = rectShelfY + modH + 1.5;
    const lcdH = rectShelfH - modH - 2.5;
    ctx.fillStyle = colors.fillLight;
    ctx.fillRect(railX + 5, lcdY, modTotalW * 0.55, lcdH);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 0.6;
    ctx.strokeRect(railX + 5, lcdY, modTotalW * 0.55, lcdH);

    // 3. LOWER SECTION: SMART LITHIUM BATTERY PACKS
    const battStartY = rectShelfY + rectShelfH + 1.5;
    const battH = h - 6 - battStartY;
    const numPacks = Math.max(1, Math.min(6, batteryCount));
    const packH = (battH - (numPacks - 1) * 1.0) / numPacks;

    for (let p = 0; p < numPacks; p++) {
      const py = battStartY + p * (packH + 1.0);
      const pw = w - (railX + 3.5) * 2;
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(railX + 3.5, py, pw, packH);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(railX + 3.5, py, pw, packH);

      // Handles on sides
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(railX + 4.2, py + 1.2, 0.8, packH - 2.4);
      ctx.fillRect(railX + 3.5 + pw - 1.8, py + 1.2, 0.8, packH - 2.4);

      // Battery DC terminals (+ / -)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.6;
      ctx.strokeRect(railX + 3.5 + pw - 7, py + packH * 0.25, 1.8, 1.8);
      ctx.strokeRect(railX + 3.5 + pw - 4.5, py + packH * 0.25, 1.8, 1.8);
    }

    // 4. Bayface only - no door enclosure

    // Specification Footer Tag
    ctx.font = 'bold 4.5px monospace';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText(`${brand} RS · 48V · ${uHeight}U (${heightMStr}m)`, w / 2, h + 9);
    return true;
  }

  switch (stencilId) {
    case 'huawei-1bay':
    case 'huawei-2bay':
    case 'huawei-mini-odc':
    case 'huawei-odc':
    case 'fushan-1bay':
    case 'fushan-2bay':
    case 'fushan-mini-odc':
    case 'fushan-odc':
    case 'eltek-1bay':
    case 'eltek-2bay':
    case 'eltek-mini-odc':
    case 'eltek-odc':
    case 'ericsson-1bay':
    case 'ericsson-2bay':
    case 'ericsson-mini-odc':
    case 'ericsson-odc':
    case 'fhodc-1bay':
    case 'fhodc-2bay':
    case 'fhodc-mini-odc':
    case 'fhodc-odc': {
      // Concrete Plinth
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(-2, -2, w + 4, h + 4);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.strokeRect(-2, -2, w + 4, h + 4);
      drawCADConcreteHatch(ctx, -2, -2, w + 4, h + 4, colors.hatch);

      // White Cabinet Outer Housing
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      const is2Bay = stencilId.includes('2bay');
      const isMini = stencilId.includes('mini');
      const brand = stencilId.startsWith('huawei')
        ? 'HUAWEI'
        : stencilId.startsWith('eltek')
        ? 'ELTEK'
        : stencilId.startsWith('fushan')
        ? 'FUSHAN'
        : stencilId.startsWith('ericsson')
        ? 'ERICSSON'
        : 'FH ODC';

      const bays = is2Bay ? 2 : 1;
      const bayW = w / bays;

      for (let b = 0; b < bays; b++) {
        const bx = b * bayW;

        // Inner equipment space
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx + 2, 2, bayW - 4, h - 4);

        // 19" Equipment rack rails (dashed longitudinal rails)
        if (!isMini) {
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(bx + 5, 4);
          ctx.lineTo(bx + 5, h - 4);
          ctx.moveTo(bx + bayW - 5, 4);
          ctx.lineTo(bx + bayW - 5, h - 4);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Standard Front Door Swing Arc (dashed 90° arc)
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.arc(bx + 2, h - 2, bayW - 4, 0, -Math.PI / 2, true);
        ctx.stroke();
        ctx.setLineDash([]);

        // Door leaf open line
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx + 2, h - 2);
        ctx.lineTo(bx + 2, h - 2 + (bayW - 4));
        ctx.stroke();

        // Lock / Handle symbol
        ctx.fillStyle = colors.accent;
        ctx.fillRect(bx + bayW - 4, h / 2 - 2, 2, 4);
      }

      // Cable gland circle symbol on rear corner
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w - 5, 5, 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Engineering Tag Label
      const isOdc = stencilId.endsWith('-odc') && !isMini;
      const tagText = is2Bay ? `${brand} 2-BAY` : isMini ? `${brand} MINI` : isOdc ? `${brand} ODC` : `${brand} 1-BAY`;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText(`${tagText} (WHITE)`, w / 2, h + 11);
      return true;
    }

    // ==========================================
    // 10. TELECOM CABINETS (ODC & 1/2/3 Bay)
    // ==========================================
    case 'odc':
    case '1bay-cabinet':
    case 'cabinet-1bay':
    case '2bay-cabinet':
    case 'cabinet-2bay':
    case '3bay-cabinet':
    case 'cabinet-3bay': {
      // Concrete Plinth
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(-2, -2, w + 4, h + 4);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.strokeRect(-2, -2, w + 4, h + 4);

      // Cabinet Outer Housing
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Modular Bays
      let bays = 1;
      if (stencilId === 'odc' || stencilId === 'cabinet-2bay' || stencilId === '2bay-cabinet') bays = 2;
      else if (stencilId === 'cabinet-3bay' || stencilId === '3bay-cabinet') bays = 3;

      const bayW = w / bays;
      for (let b = 0; b < bays; b++) {
        const bx = b * bayW;
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx + 2, 2, bayW - 4, h - 4);

        // Door swing dashed arc
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.arc(bx + 2, h - 2, bayW - 6, 0, -Math.PI / 2, true);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText(`${bays}-BAY CABINET`, w / 2, h + 11);
      return true;
    }

    // ==========================================
    // 11. TELECOM & SERVER EQUIPMENT RACKS
    // ==========================================
    case 'open-rack':
    case 'rack-open-2post':
    case 'rack-center-2post': {
      // 2-Post Relay Frame Blueprint
      ctx.fillStyle = colors.fill;
      ctx.fillRect(3, 2, 6, h - 4);
      ctx.fillRect(w - 9, 2, 6, h - 4);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(3, 2, 6, h - 4);
      ctx.strokeRect(w - 9, 2, 6, h - 4);

      // 4 Base Anchor Bolt Circles
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      for (const by of [5, h - 5]) {
        ctx.beginPath();
        ctx.arc(6, by, 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w - 6, by, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center C-Channel Uprights
      const midY = h / 2;
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(4, midY - 3, 5, 6);
      ctx.fillRect(w - 9, midY - 3, 5, 6);

      // Top Crossbar
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(9, midY);
      ctx.lineTo(w - 9, midY);
      ctx.stroke();

      ctx.font = 'bold 6.5px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('19" 2-POST RELAY', w / 2, h + 10);
      return true;
    }

    case 'rack-open-4post': {
      // 4-Post Open Frame Blueprint
      const pS = 5;
      ctx.fillStyle = colors.fill;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.fillRect(3, 3, pS, pS);
      ctx.strokeRect(3, 3, pS, pS);
      ctx.fillRect(w - 3 - pS, 3, pS, pS);
      ctx.strokeRect(w - 3 - pS, 3, pS, pS);
      ctx.fillRect(3, h - 3 - pS, pS, pS);
      ctx.strokeRect(3, h - 3 - pS, pS, pS);
      ctx.fillRect(w - 3 - pS, h - 3 - pS, pS, pS);
      ctx.strokeRect(w - 3 - pS, h - 3 - pS, pS, pS);

      // Connecting depth runners
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(4, 8, pS - 2, h - 16);
      ctx.strokeRect(w - 2 - pS, 8, pS - 2, h - 16);

      // 19" EIA boundary
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.setLineDash([]);

      ctx.font = 'bold 6.5px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('19" 4-POST OPEN', w / 2, h + 10);
      return true;
    }

    case 'rack-19in-42u':
    case 'rack-19in-45u':
    case 'rack-19in-47u':
    case 'rack-datacenter-48u':
    case 'rack-telecom-600x600':
    case 'rack-telecom-800x800':
    case 'rack-server-800x1000':
    case 'rack-mid-36u':
    case 'rack-half-24u':
    case 'rack-compact-18u':
    case 'rack-23in-42u':
    case 'rack-etsi-600x300':
    case 'rack-seismic-z4': {
      // Enclosed Cabinet Outer Frame
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // 4 Internal EIA 19" (or 23") rails
      const is23 = stencilId === 'rack-23in-42u';
      const railX = is23 ? 3.5 : 5;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(railX, 5, 3, 4);
      ctx.strokeRect(w - railX - 3, 5, 3, 4);
      ctx.strokeRect(railX, h - 9, 3, 4);
      ctx.strokeRect(w - railX - 3, h - 9, 3, 4);

      // Front Door Swing dashed arc (90° clearance)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(2, h - 2, Math.min(w - 4, 20), 0, Math.PI / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Door Leaf
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, h - 2);
      ctx.lineTo(2, h - 2 + Math.min(w - 4, 20));
      ctx.stroke();

      // Rear split door indicator
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 1, (w - 6) / 2, 2);
      ctx.strokeRect(w / 2 + 1, 1, (w - 6) / 2, 2);

      let rkTitle = '42U RACK';
      if (stencilId === 'rack-19in-45u') rkTitle = '45U TALL';
      else if (stencilId === 'rack-19in-47u') rkTitle = '47U CARRIER';
      else if (stencilId === 'rack-datacenter-48u') rkTitle = '48U DC';
      else if (stencilId === 'rack-telecom-800x800') rkTitle = '42U WIDE';
      else if (stencilId === 'rack-server-800x1000') rkTitle = '45U SERVER';
      else if (stencilId === 'rack-23in-42u') rkTitle = '23" TELCO';
      else if (stencilId === 'rack-half-24u') rkTitle = '24U HALF';
      else if (stencilId === 'rack-compact-18u') rkTitle = '18U EDGE';

      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText(rkTitle, w / 2, h + 10);
      return true;
    }

    // ==========================================
    // 11. CABLE TRAY / CABLE LADDER (Pure Ladder View - No Wires)
    // ==========================================
  }
  return false;
}
