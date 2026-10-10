import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderBatteryBank(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number
): boolean {
      // Rack steel frame
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 4);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4 Modular High-Capacity Cells
      const cellW = (w - 14) / 4;
      const cellH = h - 10;
      for (let i = 0; i < 4; i++) {
        const cx = 5 + i * (cellW + 2);
        const cy = 5;

        // Individual cell casing
        const cellGrad = ctx.createLinearGradient(cx, cy, cx + cellW, cy + cellH);
        cellGrad.addColorStop(0, '#1e293b');
        cellGrad.addColorStop(0.5, '#334155');
        cellGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = cellGrad;
        ctx.fillRect(cx, cy, cellW, cellH);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, cellW, cellH);

        // Positive terminal (+) Red
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx + cellW * 0.3, cy + 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // Negative terminal (-) Blue/Black
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(cx + cellW * 0.7, cy + 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // Copper Busbar Interconnect Link
        if (i < 3) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(cx + cellW * 0.7, cy + 4, cellW * 0.6, 4);
        }

        // Cell number label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`C${i + 1}`, cx + cellW / 2, cy + cellH - 4);
      }

      // Inline DC Circuit Breaker / Disconnect Switch
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(w - 10, h - 8, 8, 6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(w - 10, h - 8, 8, 6);
      return true;
    }

