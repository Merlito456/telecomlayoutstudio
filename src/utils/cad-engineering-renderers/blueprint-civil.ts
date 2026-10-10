import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "./common";

export function renderEngineeringCivil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'wall':
    case 'masonry-wall': {
      // Masonry Wall with closed terminal ends (no opening on each side)
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, w, h);

      // Terminal end closures
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, 4, h);
      ctx.fillRect(w - 4, 0, 4, h);
      ctx.strokeRect(0, 0, 4, h);
      ctx.strokeRect(w - 4, 0, 4, h);

      // Diagonal masonry hatch
      drawCADDiagonalHatch(ctx, 4, 0, w - 8, h, 6, colors.hatch);

      // Center bed joint line
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, h / 2);
      ctx.lineTo(w - 4, h / 2);
      ctx.stroke();

      return true;
    }

    case 'cement-fence':
    case 'boundary-fence': {
      // Fence Line with Post Symbols
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, w, h);

      // Intermediate Fence Post Blocks
      const postStep = 30;
      for (let px = 0; px <= w; px += postStep) {
        ctx.fillStyle = colors.fill;
        ctx.fillRect(px - 3, -2, 6, h + 4);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 3, -2, 6, h + 4);
      }
      return true;
    }

    case 'gate-2door': {
      const pierW = 16;
      const gateSpan = w - pierW * 2;
      const leafW = gateSpan / 2;
      const isOpen = !!(obj.doorsOpen || obj.customProps?.doorsOpen || (obj.customProps?.isClosed === false));

      // Left & Right Concrete Gate Posts
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, pierW, h);
      ctx.fillRect(w - pierW, 0, pierW, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, pierW, h);
      ctx.strokeRect(w - pierW, 0, pierW, h);
      drawCADCenterCrosshair(ctx, pierW / 2, h / 2, pierW / 2, colors.centerline, 0.8);
      drawCADCenterCrosshair(ctx, w - pierW / 2, h / 2, pierW / 2, colors.centerline, 0.8);

      if (!isOpen) {
        // CLOSED Double Gate Leaves (flush along centerline from left pier to right pier)
        // Left leaf frame
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pierW, 2, leafW, h - 4);

        // Right leaf frame
        ctx.strokeRect(pierW + leafW, 2, leafW, h - 4);

        // Mid-rail across both closed leaves
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pierW, h / 2);
        ctx.lineTo(w - pierW, h / 2);
        ctx.stroke();

        // Vertical pickets
        const numPickets = Math.max(3, Math.floor(leafW / 12));
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i < numPickets; i++) {
          const x1 = pierW + (i / numPickets) * leafW;
          ctx.moveTo(x1, 3);
          ctx.lineTo(x1, h - 3);

          const x2 = pierW + leafW + (i / numPickets) * leafW;
          ctx.moveTo(x2, 3);
          ctx.lineTo(x2, h - 3);
        }
        ctx.stroke();

        // Center lock box / drop latch (tightly joining both leaves)
        ctx.fillStyle = colors.accent;
        ctx.fillRect(pierW + leafW - 3, h / 2 - 4, 6, 8);
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1;
        ctx.strokeRect(pierW + leafW - 3, h / 2 - 4, 6, 8);

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'center';
        ctx.fillText('SITE ACCESS GATE (CLOSED) [KEY Z]', w / 2, -6);
      } else {
        // OPEN Double Gate Leaves (Leaves swung open outward 90° with architectural swing path arcs)
        ctx.save();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        // Left leaf swing arc
        ctx.beginPath();
        ctx.arc(pierW, h / 2, leafW, 0, Math.PI / 2);
        ctx.stroke();

        // Right leaf swing arc
        ctx.beginPath();
        ctx.arc(w - pierW, h / 2, leafW, Math.PI, Math.PI / 2, true);
        ctx.stroke();
        ctx.restore();

        // Left open leaf frame
        ctx.fillStyle = colors.fillLight;
        ctx.fillRect(pierW - 2, h / 2, 4, leafW);
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pierW - 2, h / 2, 4, leafW);

        // Right open leaf frame
        ctx.fillRect(w - pierW - 2, h / 2, 4, leafW);
        ctx.strokeRect(w - pierW - 2, h / 2, 4, leafW);

        // Clear center access indicator
        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.fillText('SITE ACCESS GATE (OPEN) [KEY Z]', w / 2, -6);

        // Entry directional arrow
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - 7);
        ctx.lineTo(w / 2, h / 2 + 7);
        ctx.moveTo(w / 2 - 3.5, h / 2 + 3.5);
        ctx.lineTo(w / 2, h / 2 + 7);
        ctx.lineTo(w / 2 + 3.5, h / 2 + 3.5);
        ctx.stroke();
      }
      return true;
    }

    // ==========================================
    // 13. CONCRETE BASEPADS & SLABS
    // ==========================================
    case 'cement-basepad':
    case 'gen-basepad':
    case 'ac-basepad':
    case 'elevated-basepad':
    case 'custom-elevated-basepad':
    case 'cement-slab': {
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Concrete hatch
      drawCADConcreteHatch(ctx, 0, 0, w, h, colors.hatch);

      // Corner Chamfer markings
      const ch = 6;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ch);
      ctx.lineTo(ch, 0);
      ctx.moveTo(w - ch, 0);
      ctx.lineTo(w, ch);
      ctx.moveTo(w, h - ch);
      ctx.lineTo(w - ch, h);
      ctx.moveTo(ch, h);
      ctx.lineTo(0, h - ch);
      ctx.stroke();

      // Centerline Axes
      drawCADCenterCrosshair(ctx, w / 2, h / 2, Math.min(w, h) * 0.4, colors.centerline, 0.8);

      // Technical TOC Elevation / Height Annotation Stamp
      const padH = obj.basepadHeight ?? obj.customProps?.basepadHeight ?? 150;
      if (w >= 50 && h >= 25) {
        ctx.save();
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`+${(padH / 1000).toFixed(2)}m TOC`, w - 4, h - 4);
        ctx.restore();
      }
      return true;
    }

    case 'ground-stairs-3step':
    case 'cement-stairs': {
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(0, 0, w, h);

      const steps = 3;
      const stepH = h / steps;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.2;
      for (let i = 1; i < steps; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * stepH);
        ctx.lineTo(w, i * stepH);
        ctx.stroke();
      }
      return true;
    }

    case 'tower-footing': {
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);
      drawCADConcreteHatch(ctx, 0, 0, w, h, colors.hatch);

      const cx = w / 2;
      const cy = h / 2;
      drawCADCenterCrosshair(ctx, cx, cy, w / 2, colors.centerline, 0.8);

      // Bolt circle
      const boltR = w * 0.3;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(cx, cy, boltR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        ctx.fillStyle = colors.accent;
        ctx.fillRect(cx + Math.cos(ang) * boltR - 1.5, cy + Math.sin(ang) * boltR - 1.5, 3, 3);
      }
      return true;
    }

    // ==========================================
    // 14. OUTSIDE ENVIRONMENT & SITE SURFACE
    // ==========================================
  }
  return false;
}
