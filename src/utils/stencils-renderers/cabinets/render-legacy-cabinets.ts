import { drawPhotorealisticCementPad } from '../common';
import { getCabinetActualU } from '../../cabinet-u-capacity';

export function renderLegacyCabinet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stencilId: string,
  obj?: any
): boolean {
  // Concrete pad shadow & bevel (Authentic cement foundation plinth)
  drawPhotorealisticCementPad(ctx, -3, -3, w + 6, h + 6, {
    chamfer: 2,
    showJoints: false,
    roundRadius: 3,
  });

  const isOpen = !!(obj?.doorsOpen || obj?.customProps?.doorsOpen || obj?.customProps?.isClosed === false);

  // Powder coated RAL 7035 telecommunications grey
  const cabGrad = ctx.createLinearGradient(0, 0, w, h);
  cabGrad.addColorStop(0, '#64748b');
  cabGrad.addColorStop(0.3, '#94a3b8');
  cabGrad.addColorStop(0.7, '#cbd5e1');
  cabGrad.addColorStop(1, '#475569');

  ctx.fillStyle = cabGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4);
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sloped weather hood overhang border
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // Internal modular bay divisions
  let bays = 1;
  if (stencilId === 'odc' || stencilId === 'cabinet-2bay' || stencilId === '2bay-cabinet') bays = 2;
  else if (stencilId === 'cabinet-3bay' || stencilId === '3bay-cabinet') bays = 3;

  const bayW = (w - 8) / bays;
  const equips = ((obj?.customProps?.rackEquipments || obj?.rackEquipments || []) as any[]);
  const totalU = getCabinetActualU(obj);

  for (let b = 0; b < bays; b++) {
    const bx = 4 + b * bayW;

    if (isOpen) {
      // OPEN BAY: Dark interior cavity + EIA rails + installed equipment + swung open door
      const innerW = bayW - 2;
      const innerH = h - 8;

      ctx.fillStyle = '#080d1a';
      ctx.fillRect(bx, 4, innerW, innerH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, 4, innerW, innerH);

      // Rails
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx + 1, 5, 2, innerH - 2);
      ctx.fillRect(bx + innerW - 3, 5, 2, innerH - 2);

      // Equipments
      if (equips.length > 0) {
        const sorted = [...equips].sort((eqA, eqB) => (eqA.uSlot || 1) - (eqB.uSlot || 1));
        const availH = innerH - 2;
        const availW = innerW - 6;
        const startX = bx + 3;

        sorted.forEach((eq) => {
          const slot = Math.max(1, Math.min(totalU, eq.uSlot || 1));
          const uH = Math.max(1, eq.uHeight || 1);
          const normY = Math.max(0, (totalU - (slot + uH - 1)) / totalU);
          const itemY = 5 + normY * availH;
          const itemH = Math.max(2.5, (uH / totalU) * availH);

          ctx.fillStyle = eq.color || '#1e293b';
          ctx.fillRect(startX, itemY, availW, itemH);
          ctx.strokeStyle = eq.strokeColor || '#64748b';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(startX, itemY, availW, itemH);

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(startX + 1.5, itemY + itemH / 2, 0.6, 0, Math.PI * 2);
          ctx.fill();

          if (availW > 12 && itemH >= 3) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 2.4px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText((eq.label || eq.name || '').slice(0, 9), startX + 3, itemY + itemH / 2);
          }
        });
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 2.8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('19" RACK', bx + innerW / 2, h / 2 - 2);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '2.2px monospace';
        ctx.fillText('OPEN', bx + innerW / 2, h / 2 + 3);
      }

      // Swing Arc & Open Door
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(bx, h, innerW, 0, Math.PI / 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bx - 2, h, 2.5, innerW);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx - 2, h, 2.5, innerW);
      continue;
    }

    // Individual closed door frame
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, 4, bayW, h - 8);

    // Stainless 3-point lock handle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx + bayW - 6, h / 2 - 4, 3, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(bx + bayW - 5, h / 2 - 2, 1.5, 4);

    // Ventilation louver slats
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.8;
    const louverY = h - 14;
    for (let ly = louverY; ly < h - 7; ly += 2) {
      ctx.beginPath();
      ctx.moveTo(bx + 4, ly);
      ctx.lineTo(bx + bayW - 8, ly);
      ctx.stroke();
    }
  }

  // Copper grounding busbar on side
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(w - 3, h - 10, 3, 6);
  return true;
}
