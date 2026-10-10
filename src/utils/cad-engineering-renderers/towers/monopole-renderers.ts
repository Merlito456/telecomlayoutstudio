import { CADObject, ProjectSettings } from "../../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch } from "../common";

export function renderMonopole(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  isPlatform: boolean
): boolean {
  const cx = w / 2;
  const cy = h / 2;
  const caissonR = Math.min(w, h) * (isPlatform ? 0.38 : 0.44);
  const baseFlangeR = caissonR * 0.85;
  const poleBaseR = baseFlangeR * 0.65;
  const poleTopR = poleBaseR * 0.62;

  // 0. Circular Rigger Work Platform
  if (isPlatform) {
    const platR = Math.min(w, h) * 0.48;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.arc(cx, cy, platR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radial diamond safety grating spokes
    ctx.strokeStyle = colors.hatch;
    ctx.lineWidth = 0.8;
    for (let a = 0; a < 12; a++) {
      const ang = (a * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * baseFlangeR, cy + Math.sin(ang) * baseFlangeR);
      ctx.lineTo(cx + Math.cos(ang) * platR, cy + Math.sin(ang) * platR);
      ctx.stroke();
    }
  }

  // 1. Drilled Concrete Caisson Footing Base
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.arc(cx, cy, caissonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  drawCADConcreteHatch(ctx, cx - caissonR, cy - caissonR, caissonR * 2, caissonR * 2, colors.hatch);

  // 2. Heavy Circular Steel Baseplate Flange
  ctx.fillStyle = colors.fillLight;
  ctx.beginPath();
  ctx.arc(cx, cy, baseFlangeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Dashed Bolt Circle (Ø BCD) with 16 Anchor Bolts
  const boltCircleR = (baseFlangeR + poleBaseR) / 2;
  ctx.strokeStyle = colors.centerline;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([4, 2, 1, 2]);
  ctx.beginPath();
  ctx.arc(cx, cy, boltCircleR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < 16; i++) {
    const ang = (i * Math.PI * 2) / 16;
    const bx = cx + Math.cos(ang) * boltCircleR;
    const by = cy + Math.sin(ang) * boltCircleR;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // 4. Tapered Pole Shaft
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, poleBaseR, 0, Math.PI * 2);
  ctx.stroke();

  // Pole Top Diameter Circle
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, poleTopR, 0, Math.PI * 2);
  ctx.stroke();

  // Center Hollow Cable Duct & Handhole
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 5. Three/Four-Sector Antenna Mount Frames
  const numSectors = isPlatform ? 4 : 3;
  for (let s = 0; s < numSectors; s++) {
    const ang = (s * Math.PI * 2) / numSectors - Math.PI / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const armEndDist = caissonR + 10;
    const armX = cx + cos * armEndDist;
    const armY = cy + sin * armEndDist;

    // Radial standoff pipe
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + cos * poleTopR, cy + sin * poleTopR);
    ctx.lineTo(armX, armY);
    ctx.stroke();

    // Cross T-Arm bar
    const perpX = -sin * 12;
    const perpY = cos * 12;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(armX - perpX, armY - perpY);
    ctx.lineTo(armX + perpX, armY + perpY);
    ctx.stroke();

    // Directional Sector Panel Antenna Rectangles with azimuth arrows
    [-perpX * 0.65, perpX * 0.65].forEach((pxOff, idx) => {
      const pyOff = idx === 0 ? -perpY * 0.65 : perpY * 0.65;
      const antX = armX + pxOff;
      const antY = armY + pyOff;

      ctx.fillStyle = colors.fill;
      ctx.beginPath();
      ctx.arc(antX, antY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(antX, antY);
      ctx.lineTo(antX + cos * 5, antY + sin * 5);
      ctx.stroke();
    });
  }

  drawCADCenterCrosshair(ctx, cx, cy, caissonR + 4, colors.centerline, 0.8);

  const towerH = obj?.towerHeightM || obj?.customProps?.towerHeightM;
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(
    towerH ? `MONOPOLE (H=${towerH}m)` : (isPlatform ? 'MONOPOLE + PLATFORM' : 'MONOPOLE (1-LEG)'),
    cx,
    cy + caissonR + 14
  );
  return true;
}
