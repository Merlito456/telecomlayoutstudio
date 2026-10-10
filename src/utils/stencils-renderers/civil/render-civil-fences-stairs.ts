import { CADObject, ProjectSettings } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderCivilFencesStairs(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'boundary-fence': {
      // Top and bottom galvanized steel rails
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, w, 3);
      ctx.fillRect(0, h - 3, w, 3);

      // Diamond chainlink mesh hatch
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 12) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 6, h);
        ctx.moveTo(x + 6, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      // Line posts every 40px
      ctx.fillStyle = '#cbd5e1';
      for (let px = 0; px <= w; px += 40) {
        ctx.beginPath();
        ctx.arc(px, h / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();
      }
      return true;
    }

    case 'cement-fence': {
      // Precast concrete security wall with authentic cement finish
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 2,
        showJoints: false,
        roundRadius: 2,
      });

      // Centerline
      ctx.strokeStyle = '#7c7c74';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Concrete pilasters / posts every 48px
      for (let px = 0; px <= w; px += 48) {
        drawPhotorealisticCementPad(ctx, px - 4, -2, 8, h + 4, {
          chamfer: 1,
          showJoints: false,
          roundRadius: 1,
        });
      }
      return true;
    }

    case 'cement-post':
    case 'cement-fence-post': {
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 2,
        showJoints: false,
        roundRadius: 2,
      });

      // 4-way pyramid cap
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(0, h);
      ctx.stroke();
      return true;
    }

    case 'cement-stairs':
    case 'ground-stairs-3step': {
      const is3Step = stencilId === 'ground-stairs-3step' || obj.customProps?.stencilType === 'ground-stairs-3step' || obj.customProps?.stepsCount === 3;
      const treads = is3Step ? 3 : 8;
      const trH = h / treads;

      // Base concrete casting
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 3,
        showJoints: false,
        roundRadius: 2,
        embossText: is3Step ? '3-STEP ACCESS' : undefined,
      });

      // Riser treads
      for (let i = 1; i < treads; i++) {
        const ty = i * trH;
        // Riser shadow groove
        ctx.strokeStyle = '#787870';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(2, ty);
        ctx.lineTo(w - 2, ty);
        ctx.stroke();

        // Safety yellow anti-slip nosing strip
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = is3Step ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(2, ty - 1.5);
        ctx.lineTo(w - 2, ty - 1.5);
        ctx.stroke();
      }

      // Basepad Anchor Interface Brackets (Top edge connects to basepad)
      if (is3Step) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, -3, 14, 5);
        ctx.fillRect(w - 18, -3, 14, 5);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, -3, 14, 5);
        ctx.strokeRect(w - 18, -3, 14, 5);
        // Anchor bolts
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(11, -1, 1.5, 0, Math.PI * 2);
        ctx.arc(w - 11, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Side handrail posts
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 0, 3, h);
        ctx.strokeRect(w - 4, 0, 3, h);
      }

      // UP Direction Arrow
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, h - 8);
      ctx.lineTo(w / 2, 8);
      ctx.lineTo(w / 2 - 5, 14);
      ctx.moveTo(w / 2, 8);
      ctx.lineTo(w / 2 + 5, 14);
      ctx.stroke();

      ctx.font = 'bold 6.5px monospace';
      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'center';
      ctx.fillText('UP', w / 2 + 8, h / 2);
      return true;
    }

  }
  return false;
}
