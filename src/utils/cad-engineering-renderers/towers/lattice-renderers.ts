import { CADObject, ProjectSettings } from "../../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch } from "../common";

export function render4LegTower(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number
): boolean {
  // Dimensionally aligned pier sizing (Standard 1.2m pad at 20px/m = 24px for 8m base)
  const pierSize = Math.max(16, Math.min(Math.min(w, h) * 0.15, 26));
  const padOffset = pierSize / 2;
  const piers = [
    { x: padOffset, y: padOffset },
    { x: w - padOffset, y: padOffset },
    { x: w - padOffset, y: h - padOffset },
    { x: padOffset, y: h - padOffset },
  ];

  // 4 Concrete Foundation Piers (Clean square pads with concrete hatch and centerlines)
  for (const p of piers) {
    ctx.fillStyle = colors.fill;
    ctx.fillRect(p.x - pierSize / 2, p.y - pierSize / 2, pierSize, pierSize);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x - pierSize / 2, p.y - pierSize / 2, pierSize, pierSize);

    // Concrete hatch
    drawCADConcreteHatch(ctx, p.x - pierSize / 2, p.y - pierSize / 2, pierSize, pierSize, colors.hatch);

    // Pier centerline crosshair
    drawCADCenterCrosshair(ctx, p.x, p.y, pierSize / 2, colors.centerline, 0.8);

    // Anchor bolt pitch circle (dashed)
    const boltR = pierSize * 0.32;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, boltR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Heavy angular corner leg mark (L-profile or circle)
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Outer Structural Chords (Thick solid line)
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(piers[0].x, piers[0].y);
  ctx.lineTo(piers[1].x, piers[1].y);
  ctx.lineTo(piers[2].x, piers[2].y);
  ctx.lineTo(piers[3].x, piers[3].y);
  ctx.closePath();
  ctx.stroke();

  // Concentric Tapering Lattice Square Frames (Showing upper bays tapering to uniform top head - 100% Hollow Core!)
  const UNIFORM_TOP_SIZE = 26;
  const topW = Math.min(w - 20, UNIFORM_TOP_SIZE);
  const topH = Math.min(h - 20, UNIFORM_TOP_SIZE);
  const topX = (w - topW) / 2;
  const topY = (h - topH) / 2;

  // Intermediate bay frame smoothly transitioning from base legs to uniform top
  const midW = topW + (w - topW) * 0.45;
  const midH = topH + (h - topH) * 0.45;
  const midX = (w - midW) / 2;
  const midY = (h - midH) / 2;

  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 2]);
  ctx.strokeRect(midX, midY, midW, midH);

  // Uniform top head square mounting frame
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([]);
  ctx.strokeRect(topX, topY, topW, topH);

  // Top circular antenna halo mount ring
  const UNIFORM_HALO_R = 15;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, UNIFORM_HALO_R, 0, Math.PI * 2);
  ctx.stroke();

  // Perimeter Bay K-Lacing Struts
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // North Face
  ctx.moveTo(piers[0].x, piers[0].y);
  ctx.lineTo(w / 2, midY);
  ctx.lineTo(piers[1].x, piers[1].y);
  // South Face
  ctx.moveTo(piers[3].x, piers[3].y);
  ctx.lineTo(w / 2, midY + midH);
  ctx.lineTo(piers[2].x, piers[2].y);
  // West Face
  ctx.moveTo(piers[0].x, piers[0].y);
  ctx.lineTo(midX, h / 2);
  ctx.lineTo(piers[3].x, piers[3].y);
  // East Face
  ctx.moveTo(piers[1].x, piers[1].y);
  ctx.lineTo(midX + midW, h / 2);
  ctx.lineTo(piers[2].x, piers[2].y);
  ctx.stroke();

  // Corner Leg Gusset Brackets
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(topX, topY);
  ctx.moveTo(midX + midW, midY);
  ctx.lineTo(topX + topW, topY);
  ctx.moveTo(midX + midW, midY + midH);
  ctx.lineTo(topX + topW, topY + topH);
  ctx.moveTo(midX, midY + midH);
  ctx.lineTo(topX, topY + topH);
  ctx.stroke();

  // Climbing Safety Ladder on North Face Chord
  const ladW = 10;
  const ladH = 14;
  const ladX = w / 2 - ladW / 2;
  const ladY = piers[0].y + 2;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(ladX, ladY, ladW, ladH);
  for (let ry = ladY + 3; ry <= ladY + ladH - 3; ry += 3.5) {
    ctx.beginPath();
    ctx.moveTo(ladX, ry);
    ctx.lineTo(ladX + ladW, ry);
    ctx.stroke();
  }

  // Engineering CAD Tag
  const towerH = obj?.towerHeightM || obj?.customProps?.towerHeightM;
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(towerH ? `4-LEG TOWER (H=${towerH}m)` : '4-LEG LATTICE (HOLLOW CORE)', w / 2, h + 12);
  return true;
}

export function render3LegTower(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number
): boolean {
  // Dimensionally aligned triangular footing offset
  const pR = Math.max(12, Math.min(Math.min(w, h) * 0.115, 18));
  const p1 = { x: w / 2, y: pR };
  const p2 = { x: w - pR, y: h - pR };
  const p3 = { x: pR, y: h - pR };

  // 3 Concrete Caisson Footings
  for (const p of [p1, p2, p3]) {
    ctx.fillStyle = colors.fill;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawCADConcreteHatch(ctx, p.x - pR, p.y - pR, pR * 2, pR * 2, colors.hatch);
    drawCADCenterCrosshair(ctx, p.x, p.y, pR, colors.centerline, 0.8);

    // 6-Bolt Pitch Circle
    const boltR = pR * 0.65;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, boltR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tubular Leg Symbol
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Outer Triangular Tubular Steel Chords
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
  ctx.stroke();

  const center = { x: w / 2, y: h * 0.58 };
  const UNIFORM_TOP_R = 15;
  const topPts: { x: number; y: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
    topPts.push({
      x: center.x + Math.cos(ang) * UNIFORM_TOP_R,
      y: center.y + Math.sin(ang) * UNIFORM_TOP_R,
    });
  }

  // 3 Main Tubular Steel Legs Tapering to Uniform Top Head Frame
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(topPts[0].x, topPts[0].y);
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(topPts[1].x, topPts[1].y);
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(topPts[2].x, topPts[2].y);
  ctx.stroke();

  // Intermediate Tapering Triangular Frame
  const midPts: { x: number; y: number }[] = [
    { x: (p1.x + topPts[0].x) / 2, y: (p1.y + topPts[0].y) / 2 },
    { x: (p2.x + topPts[1].x) / 2, y: (p2.y + topPts[1].y) / 2 },
    { x: (p3.x + topPts[2].x) / 2, y: (p3.y + topPts[2].y) / 2 },
  ];
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(midPts[0].x, midPts[0].y);
  ctx.lineTo(midPts[1].x, midPts[1].y);
  ctx.lineTo(midPts[2].x, midPts[2].y);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // UNIFORM Top Triangular Structural Tie Head Frame
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(topPts[0].x, topPts[0].y);
  ctx.lineTo(topPts[1].x, topPts[1].y);
  ctx.lineTo(topPts[2].x, topPts[2].y);
  ctx.closePath();
  ctx.stroke();

  // UNIFORM Top Circular Antenna Halo Mount Ring
  const UNIFORM_HALO_R = 16;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(center.x, center.y, UNIFORM_HALO_R, 0, Math.PI * 2);
  ctx.stroke();

  // 3 Cellular Sector Panel Antennas at 120°
  ctx.fillStyle = '#f8fafc';
  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
    const ax = center.x + Math.cos(ang) * (UNIFORM_HALO_R + 2);
    const ay = center.y + Math.sin(ang) * (UNIFORM_HALO_R + 2);
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillRect(-5, -2, 10, 4);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(-5, -2, 10, 4);
    ctx.restore();
  }

  // Center Antenna Feed Mast & Station Symbol
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawCADCenterCrosshair(ctx, center.x, center.y, w * 0.45, colors.centerline, 0.8);

  const towerH = obj?.towerHeightM || obj?.customProps?.towerHeightM;
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(towerH ? `3-LEG TOWER (H=${towerH}m)` : '3-LEG LATTICE (TRIANGULAR)', w / 2, h + 12);
  return true;
}
