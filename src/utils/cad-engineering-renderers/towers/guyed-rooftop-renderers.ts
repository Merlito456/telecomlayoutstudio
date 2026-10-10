import { CADObject, ProjectSettings } from "../../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "../common";

export function renderGuyedTower(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number
): boolean {
  const cx = w / 2;
  const cy = h / 2;
  const anchorDist = Math.min(w, h) * 0.42;

  // 1. Central Pinned Caisson Footing
  drawCADCenterCrosshair(ctx, cx, cy, anchorDist + 10, colors.centerline, 0.8);

  ctx.fillStyle = colors.fill;
  ctx.fillRect(cx - 10, cy - 10, 20, 20);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(cx - 10, cy - 10, 20, 20);
  drawCADConcreteHatch(ctx, cx - 10, cy - 10, 20, 20, colors.hatch);

  // 2. Central Triangular Mast Section Symbol
  const mR = 8;
  const mp1 = { x: cx, y: cy - mR };
  const mp2 = { x: cx + mR * 0.866, y: cy + mR * 0.5 };
  const mp3 = { x: cx - mR * 0.866, y: cy + mR * 0.5 };

  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(mp1.x, mp1.y);
  ctx.lineTo(mp2.x, mp2.y);
  ctx.lineTo(mp3.x, mp3.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Ground Anchor Concrete Deadman Blocks at 120°
  const anchorAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
  anchorAngles.forEach((ang) => {
    const ax = cx + Math.cos(ang) * anchorDist;
    const ay = cy + Math.sin(ang) * anchorDist;

    const bW = 18;
    const bH = 14;
    ctx.fillStyle = colors.fill;
    ctx.fillRect(ax - bW / 2, ay - bH / 2, bW, bH);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ax - bW / 2, ay - bH / 2, bW, bH);
    drawCADConcreteHatch(ctx, ax - bW / 2, ay - bH / 2, bW, bH, colors.hatch);

    // Turnbuckle Eye & Shackle
    ctx.fillStyle = colors.accent;
    ctx.fillRect(ax - 2.5, ay - 2.5, 5, 5);

    // Dual High-Tensile Guy Wire Lines
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    const perpX = -Math.sin(ang) * 3;
    const perpY = Math.cos(ang) * 3;
    ctx.beginPath();
    ctx.moveTo(cx + perpX, cy + perpY);
    ctx.lineTo(ax + perpX, ay + perpY);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const towerH = obj?.towerHeightM || obj?.customProps?.towerHeightM;
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(towerH ? `GUYED TOWER (H=${towerH}m)` : 'GUYED TOWER (1-LEG MAST + GUYS)', cx, h + 12);
  return true;
}

export function renderRooftopMount(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number
): boolean {
  // 1. Concrete Roof Slab Perimeter
  ctx.fillStyle = colors.fillLight;
  ctx.fillRect(4, 4, w - 8, h - 8);
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  drawCADConcreteHatch(ctx, 4, 4, w - 8, h - 8, colors.hatch);

  // 2. Structural Steel Skid H-Frame
  const frameMargin = 14;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(frameMargin, frameMargin, w - frameMargin * 2, h - frameMargin * 2);

  // Internal cross beams
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, frameMargin);
  ctx.lineTo(w / 2, h - frameMargin);
  ctx.moveTo(frameMargin, h / 2);
  ctx.lineTo(w - frameMargin, h / 2);
  ctx.stroke();

  // 3. Precast Concrete Ballast Blocks with ANSI 31 Diagonal Hatching
  const bW = 16;
  const bH = 12;
  const bPositions = [
    { x: 18, y: 18 },
    { x: 18 + bW + 2, y: 18 },
    { x: w - 18 - bW * 2 - 2, y: 18 },
    { x: w - 18 - bW, y: 18 },
    { x: 18, y: h - 18 - bH },
    { x: 18 + bW + 2, y: h - 18 - bH },
    { x: w - 18 - bW * 2 - 2, y: h - 18 - bH },
    { x: w - 18 - bW, y: h - 18 - bH },
  ];

  for (const bp of bPositions) {
    ctx.fillStyle = colors.fill;
    ctx.fillRect(bp.x, bp.y, bW, bH);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(bp.x, bp.y, bW, bH);
    drawCADDiagonalHatch(ctx, bp.x, bp.y, bW, bH, 4, colors.hatch);
  }

  // 4. Central Vertical Pipe Mast with Collar Braces
  const cx = w / 2;
  const cy = h / 2;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 3 Sector Antenna Mount Arms radiating from mast
  for (let s = 0; s < 3; s++) {
    const ang = (s * Math.PI * 2) / 3 - Math.PI / 2;
    const armX = cx + Math.cos(ang) * 22;
    const armY = cy + Math.sin(ang) * 22;

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(armX, armY);
    ctx.stroke();

    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(armX, armY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCADCenterCrosshair(ctx, cx, cy, 14, colors.centerline, 0.8);

  const towerH = obj?.towerHeightM || obj?.customProps?.towerHeightM;
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(towerH ? `ROOFTOP MOUNT (H=${towerH}m)` : 'ROOFTOP MOUNT (BALLAST FRAME)', cx, h + 12);
  return true;
}

export function renderRooftopParapetMount(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number
): boolean {
  // 1. Concrete Parapet Wall Section
  ctx.fillStyle = colors.fillLight;
  ctx.fillRect(2, 2, w - 4, 22);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(2, 2, w - 4, 22);
  drawCADConcreteHatch(ctx, 2, 2, w - 4, 22, colors.hatch);

  // 2. Heavy Clamping Brackets
  ctx.fillStyle = colors.fill;
  ctx.fillRect(18, 14, 14, 32);
  ctx.fillRect(w - 32, 14, 14, 32);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 14, 14, 32);
  ctx.strokeRect(w - 32, 14, 14, 32);

  // Clamp bolts
  ctx.fillStyle = colors.accent;
  ctx.fillRect(23, 18, 4, 4);
  ctx.fillRect(23, 34, 4, 4);
  ctx.fillRect(w - 27, 18, 4, 4);
  ctx.fillRect(w - 27, 34, 4, 4);

  // 3. Standoff Boom Pipe
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(14, 40);
  ctx.lineTo(w - 14, 40);
  ctx.stroke();

  // 4. Center Antenna Mast
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(w / 2, 40, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 5. Panel Antenna
  ctx.fillStyle = colors.fill;
  ctx.fillRect(w / 2 - 16, 52, 32, 14);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(w / 2 - 16, 52, 32, 14);

  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText('PARAPET MOUNT (NO LEGS)', w / 2, h + 12);
  return true;
}
