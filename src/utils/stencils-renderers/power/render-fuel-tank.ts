import { CADObject, ProjectSettings } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderFuelTank(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number
): boolean {
      // 1. Concrete Bund Wall Containment (Authentic cement finish)
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 2,
        showJoints: false,
        roundRadius: 4,
        embossText: '1000L BUND',
      });

      // Bund wall inner basin
      ctx.fillStyle = '#1e293b';
      const bundPad = 3;
      ctx.fillRect(bundPad, bundPad, w - bundPad * 2, h - bundPad * 2);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(bundPad, bundPad, w - bundPad * 2, h - bundPad * 2);

      // 2. Cylindrical Steel Fuel Tank Body (Horizontal cylinder scaled to 1000L)
      const tankX = bundPad + 2;
      const tankY = bundPad + 2;
      const tankW = w - (bundPad + 2) * 2;
      const tankH = h - (bundPad + 2) * 2;

      // Realistic brushed steel cylinder gradient
      const cylGrad = ctx.createLinearGradient(tankX, tankY, tankX, tankY + tankH);
      cylGrad.addColorStop(0, '#64748b');
      cylGrad.addColorStop(0.2, '#94a3b8');
      cylGrad.addColorStop(0.4, '#f8fafc'); // Specular highlight down cylinder crest
      cylGrad.addColorStop(0.7, '#cbd5e1');
      cylGrad.addColorStop(1, '#334155');

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = cylGrad;
      ctx.beginPath();
      ctx.roundRect(tankX, tankY, tankW, tankH, 4);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Tank saddle support straps
      ctx.fillStyle = '#1e293b';
      const strap1 = tankX + tankW * 0.22;
      const strap2 = tankX + tankW * 0.78;
      ctx.fillRect(strap1 - 1, tankY - 1, 2.5, tankH + 2);
      ctx.fillRect(strap2 - 1, tankY - 1, 2.5, tankH + 2);

      // 3. Central Inspection Manhole / Float Level Gauge
      const mhX = tankX + tankW * 0.5;
      const mhY = tankY + tankH * 0.5;
      const mhR = Math.min(tankH * 0.32, 4.5);

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(mhX, mhY, mhR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. Fill Pipe with Brass Camlock Cap
      const fillX = tankX + tankW * 0.22;
      const fillY = tankY + tankH * 0.5;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(fillX, fillY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 5. Emergency Pressure Relief Vent Cap
      const ventX = tankX + tankW * 0.78;
      const ventY = tankY + tankH * 0.5;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(ventX, ventY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Stenciled 1000L label on tank crest
      ctx.font = 'bold 5.5px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText('1000L', mhX, mhY - mhR - 1.5);
      return true;
    }

