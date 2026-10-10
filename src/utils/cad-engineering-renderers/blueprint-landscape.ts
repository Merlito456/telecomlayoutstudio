import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "./common";

export function renderEngineeringLandscape(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'grass-area':
    case 'grass-patch': {
      // Solid opaque turf fill
      ctx.fillStyle = settings.cadTheme === 'white' ? '#ecfdf5' : '#064e3b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, h);

      // CAD Grass hatching tufts
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1;
      for (let gy = 16; gy < h - 10; gy += 24) {
        for (let gx = 16; gx < w - 10; gx += 28) {
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx - 2, gy - 5);
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + 2, gy - 6);
          ctx.stroke();
        }
      }

      if (settings.showObjectLabels !== false) {
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('GRASS AREA (OPAQUE)', w / 2, h / 2 + 3);
      }
      return true;
    }

    case 'gravel-pad':
    case 'compound-gravel': {
      ctx.fillStyle = settings.cadTheme === 'white' ? '#f5f5f4' : '#1c1917';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, h);

      // Pebble hatching
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 0.8;
      for (let gy = 12; gy < h - 8; gy += 16) {
        for (let gx = 12; gx < w - 8; gx += 20) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (settings.showObjectLabels !== false) {
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#d6d3d1';
        ctx.textAlign = 'center';
        ctx.fillText('COMPACTED GRAVEL YARD', w / 2, h / 2 + 3);
      }
      return true;
    }

    case 'concrete-yard': {
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(0, 0, w, h);
      drawCADConcreteHatch(ctx, 0, 0, w, h, colors.hatch);
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('CONCRETE YARD', w / 2, h / 2 + 3);
      return true;
    }

    case 'road-segment':
    case 'asphalt-road': {
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Centerline
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('ROADWAY', w / 2, 14);
      return true;
    }

    case 'sidewalk': {
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, h);

      for (let x = 20; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      return true;
    }

    case 'car-pickup':
    case 'car-sedan': {
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Cabin cross
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.25, 4, w * 0.45, h - 8);

      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText(stencilId === 'car-pickup' ? 'PICKUP' : 'SEDAN', w / 2, h / 2 + 2);
      return true;
    }

    case 'small-house': {
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Ridge line
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('GUARDHOUSE / RESIDENCE', w / 2, h / 2 - 8);
      return true;
    }

    case 'tree-deciduous':
    case 'tree-oak': {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 2 - 2;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Radiating branches
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * (r - 4), cy + Math.sin(ang) * (r - 4));
        ctx.stroke();
      }

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'flowers-bed': {
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, h);

      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#ec4899';
      ctx.textAlign = 'center';
      ctx.fillText('FLOWER BED', w / 2, h / 2 + 2);
      return true;
    }

    case 'drainage-canal': {
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Flow direction arrows
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h / 2);
      ctx.lineTo(w * 0.8, h / 2);
      ctx.lineTo(w * 0.75, h / 2 - 4);
      ctx.moveTo(w * 0.8, h / 2);
      ctx.lineTo(w * 0.75, h / 2 + 4);
      ctx.stroke();

      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('DRAINAGE CANAL ➔ FLOW', w / 2, h - 8);
      return true;
    }

    case 'site-person': {
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      return true;
    }

  }
  return false;
}
