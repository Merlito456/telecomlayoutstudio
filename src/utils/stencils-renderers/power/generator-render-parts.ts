import { drawPhotorealisticCementPad } from "../common";

export function drawGeneratorBaseAndSkid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  padPad: number,
  skidMargin: number
) {
  // 1. Reinforced concrete containment pad with authentic cement finish & corner anchor bolts
  drawPhotorealisticCementPad(ctx, -padPad, -padPad, w + padPad * 2, h + padPad * 2, {
    chamfer: 5,
    showJoints: false,
    anchorBolts: true,
    embossText: 'GEN CONCRETE PAD',
  });

  // Copper Earthing Grounding Boss & Green/Yellow Cable on pad
  ctx.save();
  const gX = -padPad + 4;
  const gY = h + padPad - 6;
  ctx.fillStyle = '#b45309'; // Copper boss
  ctx.beginPath();
  ctx.arc(gX, gY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ground bonding cable leading to generator frame
  ctx.strokeStyle = '#15803d'; // Green/yellow stripe cable
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 2]);
  ctx.beginPath();
  ctx.moveTo(gX, gY);
  ctx.lineTo(gX + 6, gY - 6);
  ctx.lineTo(2, h - 4);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 2. Heavy-Duty Steel Sub-Base Skid & Fuel Tank Chassis
  const skidW = w + skidMargin * 2;
  const skidH = h + skidMargin * 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#18181b'; // Dark industrial structural steel
  ctx.beginPath();
  ctx.roundRect(-skidMargin, -skidMargin, skidW, skidH, 3);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4 Corner Heavy-Duty Steel Lifting Lugs with shackle eye holes
  const lugSize = 8;
  const lugPts = [
    { x: -skidMargin, y: -skidMargin },
    { x: w + skidMargin - lugSize, y: -skidMargin },
    { x: -skidMargin, y: h + skidMargin - lugSize },
    { x: w + skidMargin - lugSize, y: h + skidMargin - lugSize },
  ];
  lugPts.forEach((lp) => {
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(lp.x, lp.y, lugSize, lugSize);
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1;
    ctx.strokeRect(lp.x, lp.y, lugSize, lugSize);
    // Circular shackle eye hole
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(lp.x + lugSize / 2, lp.y + lugSize / 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // Forklift Pockets (Twin hollow channels along skid base)
  const forkW = Math.min(w * 0.16, 20);
  const forkX1 = w * 0.28;
  const forkX2 = w * 0.62;
  [
    { x: forkX1, y: -skidMargin - 1 },
    { x: forkX2, y: -skidMargin - 1 },
    { x: forkX1, y: h + skidMargin - 4 },
    { x: forkX2, y: h + skidMargin - 4 },
  ].forEach((fp) => {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(fp.x, fp.y, forkW, 5);
    ctx.strokeStyle = '#eab308'; // High-visibility yellow safety edge
    ctx.lineWidth = 1;
    ctx.strokeRect(fp.x, fp.y, forkW, 5);
    // Fork pocket inner shadow
    ctx.fillStyle = '#020617';
    ctx.fillRect(fp.x + 2, fp.y + 1, forkW - 4, 3);
  });

  // Yellow/Black Hazard Stripes on lower skid corners
  const drawHazardStripes = (hx: number, hy: number, hw: number, hh: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(hx, hy, hw, hh);
    ctx.clip();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(hx, hy, hw, hh);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2.5;
    for (let sx = -hh; sx < hw + hh; sx += 4) {
      ctx.beginPath();
      ctx.moveTo(hx + sx, hy);
      ctx.lineTo(hx + sx + hh, hy + hh);
      ctx.stroke();
    }
    ctx.restore();
  };
  drawHazardStripes(-skidMargin, h - 3, 10, 4);
  drawHazardStripes(w + skidMargin - 10, h - 3, 10, 4);
}

export function drawGeneratorCanopyAndDoors(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 3. Sound-Attenuated Weatherproof Acoustic Canopy (Industrial Telecom Green RAL 6005)
  const encGrad = ctx.createLinearGradient(0, 0, 0, h);
  encGrad.addColorStop(0, '#15803d');
  encGrad.addColorStop(0.15, '#166534');
  encGrad.addColorStop(0.5, '#14532d');
  encGrad.addColorStop(0.85, '#166534');
  encGrad.addColorStop(1, '#052e16');

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = encGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Canopy roof beveled seam & metallic powder-coat sheen highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // Longitudinal Roof Stiffening Pressed Ribs
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.38);
  ctx.lineTo(w * 0.72, h * 0.38);
  ctx.moveTo(w * 0.15, h * 0.62);
  ctx.lineTo(w * 0.72, h * 0.62);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.38 + 1);
  ctx.lineTo(w * 0.72, h * 0.38 + 1);
  ctx.moveTo(w * 0.15, h * 0.62 + 1);
  ctx.lineTo(w * 0.72, h * 0.62 + 1);
  ctx.stroke();

  // Central Roof Heavy-Duty Structural Lifting Beam & Eye
  const beamW = Math.min(w * 0.24, 32);
  const beamX = w * 0.44 - beamW / 2;
  const beamY = h / 2 - 4;
  ctx.fillStyle = '#14532d';
  ctx.fillRect(beamX, beamY, beamW, 8);
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(beamX, beamY, beamW, 8);

  // Galvanized central lifting shackle eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(beamX + beamW / 2, h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 4. Double Service Access Doors on Top & Bottom Long Sides
  const doorW = Math.min(w * 0.22, 28);
  const doorH = 14;
  const doorConfigs = [
    { x: w * 0.16, y: 3 },
    { x: w * 0.44, y: 3 },
    { x: w * 0.16, y: h - doorH - 3 },
    { x: w * 0.44, y: h - doorH - 3 },
  ];

  doorConfigs.forEach((dc) => {
    // Door cutout recessed frame
    ctx.fillStyle = '#14532d';
    ctx.fillRect(dc.x, dc.y, doorW, doorH);
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dc.x, dc.y, doorW, doorH);

    // Weather gasket rubber seal
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(dc.x + 1, dc.y + 1, doorW - 2, doorH - 2);

    // Stainless steel flush paddle latch / T-handle
    const latchX = dc.x + doorW / 2 - 3;
    const latchY = dc.y > h / 2 ? dc.y + doorH - 5 : dc.y + 2;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(latchX, latchY, 6, 3);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(latchX, latchY, 6, 3);
    // Keyhole
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(latchX + 2.5, latchY + 1, 1, 1.2);

    // Stainless barrel hinges on door edges
    [-1, doorW - 2].forEach((hOff) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(dc.x + hOff, dc.y + 2, 2, 3);
      ctx.fillRect(dc.x + hOff, dc.y + doorH - 5, 2, 3);
    });
  });
}
