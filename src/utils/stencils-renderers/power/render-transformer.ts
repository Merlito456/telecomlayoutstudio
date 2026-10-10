import { CADObject, ProjectSettings } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderTransformer(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number
): boolean {
      // 1. Concrete Pad Foundation with authentic cement finish
      const padMargin = 6;
      drawPhotorealisticCementPad(ctx, -padMargin, -padMargin, w + padMargin * 2, h + padMargin * 2, {
        chamfer: 4,
        showJoints: false,
        anchorBolts: true,
        embossText: 'TX PAD 25MPa',
      });

      // 2. Transformer Main Welded Steel Tank Body
      const tankGrad = ctx.createLinearGradient(0, 0, w, h);
      tankGrad.addColorStop(0, '#475569');
      tankGrad.addColorStop(0.3, '#64748b');
      tankGrad.addColorStop(0.7, '#334155');
      tankGrad.addColorStop(1, '#1e293b');

      ctx.fillStyle = tankGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 4);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Radiator Cooling Fins on Top & Bottom Flanks
      const numFins = Math.floor(w / 8);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let i = 1; i < numFins; i++) {
        const fx = i * 8;
        // Top fins
        ctx.beginPath();
        ctx.moveTo(fx, 0);
        ctx.lineTo(fx, -6);
        ctx.stroke();
        // Bottom fins
        ctx.beginPath();
        ctx.moveTo(fx, h);
        ctx.lineTo(fx, h + 6);
        ctx.stroke();
      }

      // 4. Three High-Voltage (HV) Glazed Red Porcelain Bushings
      const hvSpacing = w / 4;
      const hvY = h * 0.32;
      for (let i = 1; i <= 3; i++) {
        const bx = i * hvSpacing;
        // Porcelain shed rings
        const redGrad = ctx.createRadialGradient(bx - 2, hvY - 2, 1, bx, hvY, 7);
        redGrad.addColorStop(0, '#f87171');
        redGrad.addColorStop(0.4, '#dc2626');
        redGrad.addColorStop(0.8, '#991b1b');
        redGrad.addColorStop(1, '#450a0a');

        ctx.fillStyle = redGrad;
        ctx.beginPath();
        ctx.arc(bx, hvY, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Brass Terminal Stud with corona nut
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bx, hvY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Two Low-Voltage (LV) Glazed Blue Porcelain Bushings
      const lvSpacing = w / 3;
      const lvY = h * 0.72;
      for (let i = 1; i <= 2; i++) {
        const bx = i * lvSpacing;
        const blueGrad = ctx.createRadialGradient(bx - 1, lvY - 1, 1, bx, lvY, 5.5);
        blueGrad.addColorStop(0, '#60a5fa');
        blueGrad.addColorStop(0.4, '#2563eb');
        blueGrad.addColorStop(0.8, '#1e40af');
        blueGrad.addColorStop(1, '#172554');

        ctx.fillStyle = blueGrad;
        ctx.beginPath();
        ctx.arc(bx, lvY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Terminal Stud
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(bx, lvY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Conservator Expansion Tank (Top cylindrical header)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w * 0.65, 4, w * 0.28, 8);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.65, 4, w * 0.28, 8);
      // Oil sight glass
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(w * 0.72, 6, 8, 4);
      return true;
    }

