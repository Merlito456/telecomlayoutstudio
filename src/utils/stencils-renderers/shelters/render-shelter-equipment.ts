import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderShelterEquipment(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    // ==========================================
    // SHELTER AIR CONDITIONERS (Top View - Indoor Wall-Mount / Split AC)
    // ==========================================
    case 'air-conditioner':
    case 'wall-mount-ac':
    case 'ac-indoor-split':
    case 'ac-split': {
      ctx.save();
      const safeW = Math.max(w, 18);
      const safeH = Math.max(h, 7);
      const elevM = ((obj.elevationMm ?? obj.customProps?.elevationMm ?? 2200) / 1000).toFixed(1);
      const temp = obj.customProps?.targetTempC ?? 20;

      // 1. Soft Drop Shadow beneath appliance body
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1.5;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      const bodyR = Math.min(2.5, Math.max(1, safeH * 0.18));
      ctx.roundRect(0, 1.5, safeW, safeH - 1.5, bodyR);
      ctx.fill();
      ctx.restore();

      // 2. Wall Mounting Bracket Backplate (Flush against rear/top edge at y=0)
      const bracketH = Math.min(2.0, safeH * 0.22);
      ctx.fillStyle = '#334155';
      ctx.fillRect(1.5, 0, safeW - 3, bracketH);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(1.5, 0, safeW - 3, bracketH);

      // Steel Wall Anchor Fasteners (Left and Right)
      if (safeW >= 16) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(4, bracketH * 0.5, 0.9, 0, Math.PI * 2);
        ctx.arc(safeW - 4, bracketH * 0.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Main Enclosure Body - Smooth Arctic White Appliance Enamel
      const bodyY = bracketH * 0.65;
      const bodyH = safeH - bodyY;
      const bodyGrad = ctx.createLinearGradient(0, bodyY, 0, safeH);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.35, '#f8fafc');
      bodyGrad.addColorStop(0.85, '#f1f5f9');
      bodyGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(0, bodyY, safeW, bodyH, bodyR);
      ctx.fill();

      // Precision perimeter casing seam
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 4. Return-Air Intake Grille (Top Deck Surface)
      const grilleW = Math.max(8, safeW * 0.65);
      const grilleH = Math.max(1.8, safeH * 0.28);
      const grilleX = (safeW - grilleW) / 2;
      const grilleY = bodyY + 0.8;

      // Dark filter mesh cavity beneath grille
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(grilleX, grilleY, grilleW, grilleH, 0.8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Parallel intake micro-slats
      const slatCount = Math.max(2, Math.min(4, Math.floor(grilleH / 0.9)));
      const slatSpacing = grilleH / (slatCount + 1);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let s = 1; s <= slatCount; s++) {
        const sy = grilleY + s * slatSpacing;
        ctx.moveTo(grilleX + 1.2, sy);
        ctx.lineTo(grilleX + grilleW - 1.2, sy);
      }
      ctx.stroke();

      // 5. Motorized Supply Air Discharge Louver (Front Edge Facing Room)
      const louverH = Math.max(1.6, safeH * 0.24);
      const louverY = safeH - louverH - 0.4;
      const louverW = Math.max(10, safeW - 4);
      const louverX = (safeW - louverW) / 2;

      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.roundRect(louverX, louverY, louverW, louverH, 0.8);
      ctx.fill();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Cool Airflow Direction Chevrons / Arrows discharging outward into room (+Y)
      if (safeW >= 18) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.8;
        const arrowPositions = [safeW * 0.25, safeW * 0.5, safeW * 0.75];
        for (const ax of arrowPositions) {
          ctx.beginPath();
          ctx.moveTo(ax, louverY + louverH);
          ctx.lineTo(ax, safeH + 2.5);
          ctx.lineTo(ax - 1.5, safeH + 1.2);
          ctx.moveTo(ax, safeH + 2.5);
          ctx.lineTo(ax + 1.5, safeH + 1.2);
          ctx.stroke();
        }
      }

      // 6. Digital Thermostat LED Display Screen (Front Right)
      if (safeW >= 20) {
        const dspW = Math.min(7.5, safeW * 0.32);
        const dspH = Math.min(2.5, safeH * 0.3);
        const dspX = safeW - dspW - 2.5;
        const dspY = (grilleY + louverY) / 2 - dspH / 2;

        ctx.fillStyle = '#082f49';
        ctx.beginPath();
        ctx.roundRect(dspX, dspY, dspW, dspH, 0.6);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 3.8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${temp}°`, dspX + dspW / 2, dspY + dspH / 2);

        // Power Running Green LED
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(dspX - 1.8, dspY + dspH / 2, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Crisp Engineering AC Label
      if (safeW >= 22) {
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 3.8px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`AC +${elevM}m`, 2.5, (grilleY + louverY) / 2);
      }

      // 8. Copper Refrigerant Piping Knockout
      ctx.fillStyle = '#b45309';
      ctx.fillRect(safeW - 3.5, 0.3, 2.4, bracketH * 0.9);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(safeW - 2.8, 0.3, 1.2, bracketH * 0.9);

      ctx.restore();
      return true;
    }

    case 'ac-precision-crac': {
      // Floor-standing Computer Room Air Conditioner (CRAC)
      ctx.save();
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, Math.max(0, w), Math.max(0, h));
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(0, 0, Math.max(0, w), Math.max(0, h));

      // Dual High-CFM EC Fans Circular Grills
      const r = Math.max(0, Math.min(Math.max(0, w), Math.max(0, h)) * 0.22);
      if (r > 0.5) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w * 0.3, h * 0.5, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w * 0.7, h * 0.5, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center Controller LCD
      if (w >= 10 && h >= 8) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(w * 0.35, 3, w * 0.3, 4);
      }
      ctx.restore();
      return true;
    }

    case 'fire-suppression-fm200': {
      // FM-200 Clean Agent Fire Suppression Cylinder
      ctx.save();
      const r = Math.max(0.5, Math.min(Math.max(0.5, w), Math.max(0.5, h)) / 2);
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brass valve & pressure gauge
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.max(0.2, r * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'ground-busbar-tgb': {
      // Solid Copper Ground Busbar (TGB) with lug holes
      ctx.save();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, 0, w, h);

      // Copper Lug Connection Holes
      ctx.fillStyle = '#78350f';
      const count = Math.max(4, Math.floor(w / 8));
      for (let i = 1; i <= count; i++) {
        const x = (w / (count + 1)) * i;
        ctx.beginPath();
        ctx.arc(x, h / 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    }


  }
  return false;
}
