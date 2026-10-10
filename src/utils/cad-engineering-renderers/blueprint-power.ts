import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "./common";

export function renderEngineeringPower(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'generator':
    case 'generator-pad': {
      // 1. Concrete Containment Basepad with Chamfers & Anchor Bolts
      const padPad = 6;
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(-padPad, -padPad, w + padPad * 2, h + padPad * 2);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-padPad, -padPad, w + padPad * 2, h + padPad * 2);
      drawCADConcreteHatch(ctx, -padPad, -padPad, w + padPad * 2, h + padPad * 2, colors.hatch);

      // Anchor bolts at 4 corners
      const boltPts = [
        { x: -padPad + 3, y: -padPad + 3 },
        { x: w + padPad - 6, y: -padPad + 3 },
        { x: -padPad + 3, y: h + padPad - 6 },
        { x: w + padPad - 6, y: h + padPad - 6 },
      ];
      boltPts.forEach((bp) => {
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 1;
        ctx.strokeRect(bp.x, bp.y, 3, 3);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(bp.x + 1, bp.y + 1, 1, 1);
      });

      // 2. Heavy-Duty Steel Skid Base & Forklift Pockets
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-2, -2, w + 4, h + 4);

      // Forklift pockets
      const forkW = Math.min(w * 0.16, 18);
      const forkX1 = w * 0.28;
      const forkX2 = w * 0.62;
      [
        { x: forkX1, y: -3 },
        { x: forkX2, y: -3 },
        { x: forkX1, y: h + 1 },
        { x: forkX2, y: h + 1 },
      ].forEach((fp) => {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(fp.x, fp.y, forkW, 3);
      });

      // 3. Generator Acoustic Canopy Enclosure (Green Accent Border)
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#22c55e'; // Green canopy accent
      ctx.lineWidth = 2.2;
      ctx.strokeRect(0, 0, w, h);

      // Service access doors with maintenance swing clearance dashes
      const doorW = Math.min(w * 0.22, 28);
      [w * 0.16, w * 0.44].forEach((dx) => {
        // Top door outline
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 1;
        ctx.strokeRect(dx, 0, doorW, 10);
        // Bottom door outline
        ctx.strokeRect(dx, h - 10, doorW, 10);

        // Dashed maintenance door swing clearance
        ctx.save();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#15803d';
        ctx.strokeRect(dx, -12, doorW, 12);
        ctx.strokeRect(dx, h, doorW, 12);
        ctx.restore();
      });

      // 4. Mechanical Engine / Alternator Block Symbol (Circle with 'GEN')
      const genR = Math.min(w, h) * 0.20;
      const cx = w * 0.42;
      const cy = h / 2;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, genR, 0, Math.PI * 2);
      ctx.stroke();

      // Alternator crosshairs / centerlines
      ctx.save();
      ctx.setLineDash([4, 2]);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - genR - 4, cy);
      ctx.lineTo(cx + genR + 4, cy);
      ctx.moveTo(cx, cy - genR - 4);
      ctx.lineTo(cx, cy + genR + 4);
      ctx.stroke();
      ctx.restore();

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GEN 30kVA', cx, cy);

      // 5. Radiator Cooling Discharge Louvers & Airflow Direction Arrows
      const radX = w * 0.74;
      const radW = w * 0.22;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.2;
      for (let ly = 6; ly <= h - 6; ly += 3.5) {
        ctx.beginPath();
        ctx.moveTo(radX, ly);
        ctx.lineTo(radX + radW, ly);
        ctx.stroke();
      }
      // Airflow discharge arrow (->)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(radX + radW + 3, h / 2);
      ctx.lineTo(radX + radW + 10, h / 2);
      ctx.lineTo(radX + radW + 7, h / 2 - 3);
      ctx.moveTo(radX + radW + 10, h / 2);
      ctx.lineTo(radX + radW + 7, h / 2 + 3);
      ctx.stroke();

      // 6. Air Intake Acoustic Louvers on Left
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      for (let iy = 8; iy <= h - 8; iy += 4) {
        ctx.beginPath();
        ctx.moveTo(3, iy);
        ctx.lineTo(12, iy);
        ctx.stroke();
      }

      // 7. Top Silencer Muffler Drum & Rain Flapper
      const silX = w * 0.55;
      const silY = h / 2 - 6;
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(silX, silY, 20, 12);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(silX, silY, 20, 12);

      // Exhaust Pipe Circle & Rain Flapper line
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(silX + 16, h / 2, 4, 0, Math.PI * 2);
      ctx.stroke();
      // Flapper lever
      ctx.beginPath();
      ctx.moveTo(silX + 16, h / 2);
      ctx.lineTo(silX + 24, h / 2 - 4);
      ctx.stroke();

      // 8. Digital Control Cubicle (CP) & E-Stop
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(16, h * 0.25, 14, h * 0.5);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(16, h * 0.25, 14, h * 0.5);

      ctx.font = 'bold 6px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('CP', 23, h * 0.42);

      // Emergency Stop (E-STOP) Symbol
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(23, h * 0.65, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Technical Specification Designation Tag
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText('DIESEL GENERATOR (GREEN) 30kVA', w / 2, h + 14);
      ctx.font = '7px monospace';
      ctx.fillStyle = colors.secondary;
      ctx.fillText('400/230V 3Ø 50Hz • SOUND-ATTENUATED', w / 2, h + 23);
      return true;
    }

    // ==========================================
    // 8. FUEL TANK / DIESEL TANK (1000L Capacity Pressure Vessel)
    // ==========================================
    case 'fuel-tank': {
      // Concrete Bund Containment Basin
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(-2, -2, w + 4, h + 4);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-2, -2, w + 4, h + 4);
      drawCADConcreteHatch(ctx, -2, -2, w + 4, h + 4, colors.hatch);

      // Horizontal Cylindrical Tank Body with Dished Heads (scaled to 1000L)
      const headW = Math.min(w * 0.12, 5);
      const bodyW = w - headW * 2 - 4;
      const tankH = h - 6;
      const tankX = headW + 2;
      const tankY = 3;

      ctx.fillStyle = colors.fill;
      ctx.fillRect(tankX, tankY, bodyW, tankH);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.0;
      ctx.strokeRect(tankX, tankY, bodyW, tankH);

      // Left Dished Head
      ctx.beginPath();
      ctx.ellipse(tankX, tankY + tankH / 2, headW, tankH / 2, 0, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.stroke();

      // Right Dished Head
      ctx.beginPath();
      ctx.ellipse(tankX + bodyW, tankY + tankH / 2, headW, tankH / 2, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // 2 Structural Steel Saddle Supports
      const saddle1X = tankX + bodyW * 0.22;
      const saddle2X = tankX + bodyW * 0.78;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(saddle1X, 1);
      ctx.lineTo(saddle1X, h - 1);
      ctx.moveTo(saddle2X, 1);
      ctx.lineTo(saddle2X, h - 1);
      ctx.stroke();

      // Top Manhole & Fill Port
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(tankH * 0.3, 4), 0, Math.PI * 2);
      ctx.stroke();

      // Centerline
      drawCADCenterCrosshair(ctx, w / 2, h / 2, w / 2 - 2, colors.centerline, 0.8);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('FUEL TANK (1000L)', w / 2, h + 11);
      return true;
    }

    // ==========================================
    // 9. SUBSTATION TRANSFORMER (Electrical CAD)
    // ==========================================
    case 'transformer':
    case 'tx-basepad': {
      // Concrete Pad
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(-2, -2, w + 4, h + 4);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-2, -2, w + 4, h + 4);
      drawCADConcreteHatch(ctx, -2, -2, w + 4, h + 4, colors.hatch);

      // Transformer Oil Tank
      ctx.fillStyle = colors.fill;
      ctx.fillRect(6, 6, w - 12, h - 12);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // Standard IEEE/IEC Dual Overlapping Coil Circles Symbol
      const coilR = Math.min(w, h) * 0.2;
      const cx = w / 2;
      const cy = h / 2;

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - coilR * 0.55, cy, coilR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + coilR * 0.55, cy, coilR, 0, Math.PI * 2);
      ctx.stroke();

      // 3 High-Voltage Primary Bushings on North side
      const bushStep = (w - 20) / 4;
      for (let b = 1; b <= 3; b++) {
        const bx = 10 + b * bushStep;
        ctx.fillStyle = colors.centerline;
        ctx.beginPath();
        ctx.arc(bx, 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('SUBSTATION TX', w / 2, h + 12);
      return true;
    }

    // ==========================================
    // 10. OFFICIAL WHITE TELECOM CABINETS (Huawei, Fushan, Ericsson, FH ODC)
    // ==========================================
  }
  return false;
}
