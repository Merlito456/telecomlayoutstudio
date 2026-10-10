import { CADObject } from "../../../types/cad";

export function renderECBDistribution(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  w: number,
  h: number,
  stencilType: string
): boolean {
  switch (stencilType) {
    case 'ecb':
    case 'ecb-wall': {
      // 1. Concrete / Masonry Wall Interface & Backing Unistrut Channel
      ctx.fillStyle = '#475569';
      ctx.fillRect(-2, 0, w + 4, 3);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-2, 0, w + 4, 3);

      // 4 Heavy-Duty Wall Mounting Corner Tabs with Hex Anchor Bolts
      const tabPositions = [
        { x: -3.5, y: 0.5 },
        { x: w - 0.5, y: 0.5 },
        { x: -3.5, y: h - 4.5 },
        { x: w - 0.5, y: h - 4.5 },
      ];
      tabPositions.forEach((tab) => {
        // Steel bracket ear
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tab.x, tab.y, 4, 4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(tab.x, tab.y, 4, 4);
        // Anchor expansion bolt head (silver hex with center dot)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(tab.x + 2, tab.y + 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(tab.x + 1.6, tab.y + 1.6, 0.8, 0.8);
      });

      // 2. Weatherproof NEMA 4X / IP65 Powder-Coated Industrial Steel Enclosure (RAL 7035 Light Grey)
      const encGrad = ctx.createLinearGradient(0, 3, w, h - 3);
      encGrad.addColorStop(0, '#f1f5f9');
      encGrad.addColorStop(0.3, '#e2e8f0');
      encGrad.addColorStop(0.7, '#cbd5e1');
      encGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = encGrad;
      ctx.beginPath();
      ctx.roundRect(0, 3, w, h - 5, 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Front Door Inset with Neoprene / EPDM Rubber Weatherstrip Gasket
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(2.5, 5, w - 5, h - 9);

      // Top Sloped Rain Canopy Drip Hood Overhang (Protects door gasket from pooling water)
      const canopyGrad = ctx.createLinearGradient(0, 1, 0, 4.5);
      canopyGrad.addColorStop(0, '#64748b');
      canopyGrad.addColorStop(1, '#334155');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.roundRect(-1.5, 1, w + 3, 3.2, 1);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Continuous Heavy Stainless Steel Piano Hinge Knuckles along Left Edge
      for (let hy = 6; hy < h - 5; hy += 3.5) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(1, hy, 1.8, 2.2);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(1, hy, 1.8, 2.2);
      }

      // Dual Stainless Steel Quarter-Turn Pad-Lockable Latches on Right
      [7, h - 9].forEach((ly) => {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(w - 3.5, ly, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // Latch lever slot
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w - 4.2, ly - 0.4, 1.4, 0.8);
      });

      // OSHA Safety Yellow Warning Triangle with Bold Lightning Flash ⚡
      const triX = 8;
      const triY = 11;
      const triS = 7;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(triX, triY - triS / 2);
      ctx.lineTo(triX + triS / 2, triY + triS / 2);
      ctx.lineTo(triX - triS / 2, triY + triS / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      // Black lightning flash
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(triX + 0.5, triY - 2);
      ctx.lineTo(triX - 1.2, triY + 0.2);
      ctx.lineTo(triX + 0.2, triY + 0.2);
      ctx.lineTo(triX - 0.5, triY + 2.5);
      ctx.lineTo(triX + 1.5, triY - 0.2);
      ctx.lineTo(triX + 0.2, triY - 0.2);
      ctx.closePath();
      ctx.fill();

      // High-Visibility Emergency Red Disconnect Throw / Rotary Switch on Right
      const swW = 7;
      const swH = 10;
      const swX = w - 12;
      const swY = 6;
      // Recessed switch base well
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(swX, swY, swW, swH);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(swX, swY, swW, swH);

      // Safety Red Heavy Operating Throw Lever Handle
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(swX + 1.5, swY + 1.2, 4, 7.5);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(swX + 1.5, swY + 1.2, 4, 7.5);

      // Yellow OSHA LOTO (Lockout-Tagout) Padlock Hole / Tab
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(swX + 3.5, swY + 3.2, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(swX + 3.5, swY + 3.2, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Metal Engraved Rating Nameplate Legend
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(14, 6.5, w - 28, 4.5);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(14, 6.5, w - 28, 4.5);
      ctx.font = 'bold 3.8px monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText('MAIN ECB', 14 + (w - 28) / 2, 10);

      ctx.font = 'bold 3.2px monospace';
      ctx.fillStyle = '#b91c1c';
      ctx.fillText('WALL MOUNTED', 14 + (w - 28) / 2, 14.5);

      // Bottom Threaded Conduit Glands / Hubs with Metallic Locknuts (Utility in, load out)
      [6.5, 15.5].forEach((cx) => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx, h - 2.5, 4.5, 2.5);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(cx, h - 2.5, 4.5, 2.5);
        // Locknut ring
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - 0.5, h - 2.8, 5.5, 0.8);
      });

      // External Solid Copper Earthing / Grounding Lug on Lower Right
      ctx.fillStyle = '#b45309';
      ctx.fillRect(w - 2, h - 6, 2.5, 4);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(w - 2, h - 6, 2.5, 4);
      // Green / Yellow striped earth bonding jumper wire
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w + 0.5, h - 4);
      ctx.lineTo(w + 3.5, h - 2);
      ctx.stroke();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      return true;
    }

    // ==========================================
    // ELECTRICAL CIRCUIT BREAKER (ECB) - POLE MOUNTED
    // ==========================================
    case 'ecb-pole': {
      // 1. Galvanized Steel Utility Pipe Pole (Cylindrical Section - slender realistic diameter)
      const poleR = 3.8; // Significantly decreased from 9 down to 3.8!
      const poleX = Math.round(w / 2);
      const poleY = 5.5;
      const poleGrad = ctx.createRadialGradient(poleX - 1.5, poleY - 1.5, 1, poleX, poleY, poleR);
      poleGrad.addColorStop(0, '#cbd5e1');
      poleGrad.addColorStop(0.6, '#64748b');
      poleGrad.addColorStop(1, '#334155');
      ctx.fillStyle = poleGrad;
      ctx.beginPath();
      ctx.arc(poleX, poleY, poleR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Pole Center Cross Marking & Radial Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(poleX, poleY, poleR * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(poleX - 2, poleY);
      ctx.lineTo(poleX + 2, poleY);
      ctx.moveTo(poleX, poleY - 2);
      ctx.lineTo(poleX, poleY + 2);
      ctx.stroke();

      // Heavy Stainless Steel Banding Straps (Bandit Clamps) Wrapped Around Pole
      [poleY - 1.5, poleY + 1.5].forEach((by) => {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(poleX, by, poleR + 0.8, 1.8, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Banding tension buckle
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(poleX - 1.5, by - 0.8, 3, 1.6);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(poleX - 1.5, by - 0.8, 3, 1.6);
      });

      // Galvanized Steel Unistrut Pole Bracket Mounting Channel
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 10, w - 8, 2.5);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(4, 10, w - 8, 2.5);

      // Weatherproof NEMA 4X Outdoor ECB Enclosure Body Bolted to Pole Bracket
      const encX = 4;
      const encY = 12;
      const encW = w - 8;
      const encH = h - 14;
      const encGrad = ctx.createLinearGradient(encX, encY, encX, encY + encH);
      encGrad.addColorStop(0, '#f1f5f9');
      encGrad.addColorStop(0.5, '#cbd5e1');
      encGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = encGrad;
      ctx.beginPath();
      ctx.roundRect(encX, encY, encW, encH, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Sloped weather hood overhang on top of ECB box
      ctx.fillStyle = '#334155';
      ctx.fillRect(encX - 1, encY - 0.5, encW + 2, 2);

      // High-Visibility Red Disconnect Throw Handle
      const swX = encX + encW - 7;
      const swY = encY + 3;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(swX, swY, 5, 8);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(swX + 1, swY + 1, 3, 6);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(swX + 2.5, swY + 2.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Warning hazard triangle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(encX + 4.5, encY + 3);
      ctx.lineTo(encX + 8, encY + 8);
      ctx.lineTo(encX + 1, encY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 4.5px sans-serif';
      ctx.fillText('⚡', encX + 2.8, encY + 7.5);

      // Identification text: POLE ECB
      ctx.font = 'bold 3.6px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('POLE ECB', encX + encW / 2, encY + encH - 2);

      // Vertical Rigid Conduit Riser (RSC) Running Alongside Pole with Pipe Straps
      const condX = w - 4;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(condX, 2, 2.5, h - 3);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(condX, 2, 2.5, h - 3);
      // Conduit standoff brackets
      [4, h - 6].forEach((cby) => {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(condX - 0.8, cby, 4.1, 1.2);
      });

      // Pole Earthing Ground Clamp & Green/Yellow Earth Wire
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(poleX + 3.5, poleY + 2.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(poleX + 3.5, poleY + 2.5);
      ctx.lineTo(poleX + 5, h - 2);
      ctx.stroke();
      return true;
    }

    // ==========================================
    // TWO-POLE STRUCTURE MOUNTED (ECB + ACPDB POWER RACK)
    // ==========================================
    default:
      return false;
  }
}
