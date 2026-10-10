import { ProjectSettings, ViewportState } from "../../types/cad";

function drawStandardSheetBorderAndTitleBlock(
  ctx: CanvasRenderingContext2D,
  settings: ProjectSettings
) {
  const margin = 16;
  const cw = settings.canvasWidth;
  const ch = settings.canvasHeight;

  ctx.save();
  // Outer double line drawing border
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, cw - margin * 2, ch - margin * 2);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin + 4, margin + 4, cw - (margin + 4) * 2, ch - (margin + 4) * 2);

  // Standard CAD Title Block (Bottom-Right corner or user-specified custom pos)
  const tbW = 320;
  const tbH = 110;
  const tbX = settings.titleBlockPos?.x ?? (cw - margin - 4 - tbW);
  const tbY = settings.titleBlockPos?.y ?? (ch - margin - 4 - tbH);

  // Title block container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(tbX, tbY, tbW, tbH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tbX, tbY, tbW, tbH);

  // Horizontal divisions
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tbX, tbY + 28);
  ctx.lineTo(tbX + tbW, tbY + 28);
  ctx.moveTo(tbX, tbY + 56);
  ctx.lineTo(tbX + tbW, tbY + 56);
  ctx.moveTo(tbX, tbY + 84);
  ctx.lineTo(tbX + tbW, tbY + 84);
  ctx.stroke();

  // Vertical divisions
  ctx.beginPath();
  ctx.moveTo(tbX + 180, tbY + 28);
  ctx.lineTo(tbX + 180, tbY + tbH);
  ctx.stroke();

  // Text contents
  // Header: Company / Project
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('TELECOM SITE INFRASTRUCTURE • CIVIL & RF DRAFTING', tbX + 8, tbY + 6);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(settings.fileName || 'TELECOM SITE LAYOUT PLAN', tbX + 8, tbY + 15);

  // Row 2 Left: Site ID
  ctx.fillStyle = '#64748b';
  ctx.font = '7px sans-serif';
  ctx.fillText('SITE DESIGNATION / REF', tbX + 8, tbY + 32);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(settings.siteId || 'SITE-MNL-042 (CELL SITE)', tbX + 8, tbY + 42);

  // Row 2 Right: Scale
  ctx.fillStyle = '#64748b';
  ctx.font = '7px sans-serif';
  ctx.fillText('CALIBRATED DRAWING SCALE', tbX + 186, tbY + 32);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`1 : ${Math.round(1000 / settings.scaleFactor)} (1m = ${settings.scaleFactor}px)`, tbX + 186, tbY + 42);

  // Row 3 Left: Drawing No
  ctx.fillStyle = '#64748b';
  ctx.font = '7px sans-serif';
  ctx.fillText('DRAWING REFERENCE NUMBER', tbX + 8, tbY + 60);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(settings.drawingNumber || 'DWG-TL-2026-A101', tbX + 8, tbY + 70);

  // Row 3 Right: Date / Rev
  ctx.fillStyle = '#64748b';
  ctx.font = '7px sans-serif';
  ctx.fillText('REVISION / SHEET', tbX + 186, tbY + 60);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('REV 01 • SHEET 1 OF 1', tbX + 186, tbY + 70);

  // Row 4: Approval Status
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('STATUS: APPROVED FOR CONSTRUCTION (IFC)', tbX + 8, tbY + 93);

  ctx.fillStyle = '#64748b';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(new Date().toISOString().split('T')[0], tbX + tbW - 8, tbY + 93);

  ctx.restore();
}

/**
 * Standard True North Compass Rose
 */
function drawStandardNorthArrow(
  ctx: CanvasRenderingContext2D,
  settings: ProjectSettings
) {
  const x = settings.northArrowPos?.x ?? (settings.canvasWidth - 60);
  const y = settings.northArrowPos?.y ?? 60;
  const r = 24;

  ctx.save();
  ctx.translate(x, y);

  // Outer circle
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // Compass pointers
  // North pointer (filled half, white half)
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(0, -r + 2);
  ctx.lineTo(-6, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -r + 2);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // South pointer
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(0, r - 2);
  ctx.lineTo(5, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // East/West pointers
  ctx.beginPath();
  ctx.moveTo(-r + 4, 0);
  ctx.lineTo(0, -4);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(r - 4, 0);
  ctx.lineTo(0, -4);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();

  // Bold "N" letter
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('N', 0, -r - 4);

  ctx.restore();
}

/**
 * Standard Dynamic Graphical Scale Bar (0, 1m, 2m, 5m, 10m)
 */
function drawStandardGraphicalScaleBar(
  ctx: CanvasRenderingContext2D,
  settings: ProjectSettings
) {
  const sf = settings.scaleFactor; // pixels per meter
  const x = settings.scaleBarPos?.x ?? 32;
  const y = settings.scaleBarPos?.y ?? (settings.canvasHeight - 32);
  const h = 6;

  // Division widths in meters: 1m, 2m, 5m, 10m
  const segs = [
    { m: 1, w: sf * 1 },
    { m: 2, w: sf * 1 },
    { m: 5, w: sf * 3 },
    { m: 10, w: sf * 5 },
  ];

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  const totalW = sf * 10;
  ctx.fillRect(x - 6, y - 24, totalW + 36, 38);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 6, y - 24, totalW + 36, 38);

  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`GRAPHIC SCALE (1 ${settings.unit} = ${sf}px)`, x, y - 20);

  let curX = x;
  let runningMeters = 0;

  // Zero mark
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('0', curX, y - 1);

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    runningMeters = s.m;

    // Alternating black and white filled segment
    ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#ffffff';
    ctx.fillRect(curX, y, s.w, h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(curX, y, s.w, h);

    curX += s.w;

    // Meter tick label
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${runningMeters}${settings.unit}`, curX, y - 1);
  }

  ctx.restore();
}

/**
 * Standard Telecom Symbols Legend Box
 */
function drawStandardTelecomLegend(
  ctx: CanvasRenderingContext2D,
  settings: ProjectSettings
) {
  const x = settings.legendPos?.x ?? 32;
  const y = settings.legendPos?.y ?? 32;
  const w = 180;
  const h = 180;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('TELECOM SYMBOL LEGEND', x + 8, y + 8);

  const symbols = [
    { color: '#ef4444', label: 'Fiber / Data Trunk' },
    { color: '#f59e0b', label: 'Lattice Tower' },
    { color: '#38bdf8', label: 'Equipment Shelter' },
    { color: '#16a34a', label: 'Generator (Green) & Pad' },
    { color: '#10b981', label: '48V DC Battery Bank' },
    { color: '#cbd5e1', label: 'Perimeter Wall / Fence' },
    { color: '#a855f7', label: 'Access Control Gate' },
  ];

  symbols.forEach((sym, idx) => {
    const itemY = y + 26 + idx * 20;
    ctx.fillStyle = sym.color;
    ctx.fillRect(x + 10, itemY, 14, 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 10, itemY, 14, 10);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '9px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(sym.label, x + 32, itemY + 5);
  });

  ctx.restore();
}



export {
  drawStandardSheetBorderAndTitleBlock,
  drawStandardNorthArrow,
  drawStandardGraphicalScaleBar,
  drawStandardTelecomLegend
};
