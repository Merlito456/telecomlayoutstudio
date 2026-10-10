import { CADObject } from "../../../types/cad";

export function renderACPDBDistribution(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  w: number,
  h: number,
  stencilType: string
): boolean {
  switch (stencilType) {
    case 'acpdb-wall':
    case 'acpdb': {
      // 1. Concrete / Masonry Wall Interface & 4 Wall Mounting Ears
      ctx.fillStyle = '#475569';
      ctx.fillRect(-1.5, 0, w + 3, 2);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-1.5, 0, w + 3, 2);

      [
        { x: -2.5, y: 0.5 },
        { x: w - 0.5, y: 0.5 },
        { x: -2.5, y: h - 3.5 },
        { x: w - 0.5, y: h - 3.5 },
      ].forEach((tab) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tab.x, tab.y, 3, 3);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tab.x, tab.y, 3, 3);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(tab.x + 1.5, tab.y + 1.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Weatherproof Enclosure Body (RAL 7035 Powder Coated Finish)
      const encGrad = ctx.createLinearGradient(0, 2, w, h - 2);
      encGrad.addColorStop(0, '#f8fafc');
      encGrad.addColorStop(0.3, '#e2e8f0');
      encGrad.addColorStop(0.7, '#cbd5e1');
      encGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = encGrad;
      ctx.beginPath();
      ctx.roundRect(0, 2, w, h - 3.5, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Sloped weather hood overhang
      ctx.fillStyle = '#334155';
      ctx.fillRect(-0.8, 0.8, w + 1.6, 2);

      // Main MCCB Rotary Switch
      const swX = Math.max(3.5, w * 0.2);
      const swY = Math.max(4.5, h * 0.42);
      const swR = Math.min(2.5, Math.min(w, h) * 0.18);
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(swX, swY, swR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(swX - 0.5, swY - swR * 0.8, 1.0, swR * 1.6);

      // Digital Meter Viewing Window
      const meterX = w * 0.40;
      const meterW = Math.max(5, w * 0.30);
      const meterH = Math.max(3, h * 0.32);
      const meterY = Math.max(3, h * 0.28);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX, meterY, meterW, meterH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(meterX, meterY, meterW, meterH);
      if (meterW >= 6 && meterH >= 3) {
        ctx.font = 'bold 2.5px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('230V', meterX + meterW / 2, meterY + meterH * 0.65);
      }

      // Surge Protection Device (SPD) Block
      const spdX = w * 0.74;
      const spdW = Math.max(4, w * 0.22);
      const spdH = meterH;
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(spdX, meterY, spdW, spdH);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(spdX, meterY, spdW, spdH);
      if (spdW >= 4 && spdH >= 3) {
        ctx.font = 'bold 2.2px monospace';
        ctx.fillStyle = '#a7f3d0';
        ctx.textAlign = 'center';
        ctx.fillText('SPD', spdX + spdW / 2, meterY + spdH * 0.65);
      }

      // Branch MCBs Bank
      const breakerBankY = Math.max(meterY + meterH + 1, h * 0.65);
      const breakerBankH = Math.max(2, h - breakerBankY - 2.5);
      if (breakerBankH >= 1.5) {
        const numBreakers = Math.max(3, Math.min(6, Math.floor((w - 6) / 2.8)));
        const bw = Math.max(1.8, (w - 6) / numBreakers - 0.6);
        for (let b = 0; b < numBreakers; b++) {
          const bx = 3 + b * (bw + 0.6);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx, breakerBankY, bw, breakerBankH);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 0.4;
          ctx.strokeRect(bx, breakerBankY, bw, breakerBankH);
          ctx.fillStyle = b % 2 === 0 ? '#10b981' : '#38bdf8';
          ctx.fillRect(bx + 0.3, breakerBankY + 0.4, bw - 0.6, breakerBankH * 0.4);
        }
      }

      // ACPDB Badge & Rating
      if (h >= 14) {
        ctx.font = 'bold 3.2px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText('ACPDB (WALL)', w / 2, h - 1.2);
      }
      return true;
    }

    // ==========================================
    // DUAL ACPDB (MAINS + DG STANDBY) - MULTIPLE UNITS
    // ==========================================
    case 'acpdb-dual': {
      // 1. Common Wall Unistrut Channels Across Both Boxes
      ctx.fillStyle = '#475569';
      ctx.fillRect(-1, 0.4, w + 2, 1.8);
      ctx.fillRect(-1, h - 2.5, w + 2, 1.8);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-1, 0.4, w + 2, 1.8);
      ctx.strokeRect(-1, h - 2.5, w + 2, 1.8);

      const gap = 1.6;
      const singleW = (w - gap - 2) / 2;
      const boxH = Math.max(5, h - 3.6);
      const boxY = 1.8;

      // Render Box 1 (Mains ACPDB) and Box 2 (DG ACPDB)
      [
        { x: 1, title: 'MAINS ACPDB', meterText: '230V M', ledCol: '#22c55e' },
        { x: 1 + singleW + gap, title: 'DG ACPDB', meterText: '230V DG', ledCol: '#f59e0b' },
      ].forEach((b, idx) => {
        // Enclosure body
        const encGrad = ctx.createLinearGradient(b.x, boxY, b.x + singleW, boxY + boxH);
        encGrad.addColorStop(0, '#f8fafc');
        encGrad.addColorStop(0.3, '#e2e8f0');
        encGrad.addColorStop(0.8, '#cbd5e1');
        encGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = encGrad;
        ctx.beginPath();
        ctx.roundRect(b.x, boxY, singleW, boxH, 1.2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Sloped weather hood
        ctx.fillStyle = '#334155';
        ctx.fillRect(b.x - 0.5, boxY - 0.6, singleW + 1.0, 1.4);

        // Rotary Switch
        const swR = Math.min(2.0, singleW * 0.16);
        const swX = b.x + 2.2;
        const swY = boxY + 2.5;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(swX, swY, swR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Digital Meter
        const mX = b.x + singleW * 0.38;
        const mW = Math.max(4, singleW * 0.42);
        const mH = Math.max(2.4, boxH * 0.3);
        const mY = boxY + 1.5;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(mX, mY, mW, mH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(mX, mY, mW, mH);
        if (mW >= 4) {
          ctx.font = 'bold 2px monospace';
          ctx.fillStyle = idx === 0 ? '#34d399' : '#fbbf24';
          ctx.textAlign = 'center';
          ctx.fillText(b.meterText, mX + mW / 2, mY + mH * 0.7);
        }

        // Surge Arrester SPD
        const spdY = mY + mH + 0.8;
        if (boxH >= 6) {
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(b.x + 1.5, spdY, singleW - 3, 1.6);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 0.4;
          ctx.strokeRect(b.x + 1.5, spdY, singleW - 3, 1.6);
        }

        // Title text
        ctx.font = 'bold 2.4px monospace';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(b.title, b.x + singleW / 2, boxY + boxH - 1.2);

        // Bottom conduit drops
        [b.x + 2, b.x + singleW - 2].forEach((cx) => {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(cx - 0.5, boxY + boxH, 1.2, 1.5);
        });
      });

      // Inter-Tie Conduit joining the two boxes
      const tieY = boxY + boxH * 0.5;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1 + singleW, tieY - 0.4, gap, 0.8);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(1 + singleW, tieY - 0.4, gap, 0.8);
      return true;
    }

    // ==========================================
    // ACPDB (AC POWER DISTRIBUTION BOARD) - POLE MOUNTED
    // ==========================================
    case 'acpdb-pole': {
      // 1. Galvanized Steel Utility Pipe Pole (Slender realistic diameter proportionate to cabinet)
      const poleR = Math.min(3.2, Math.min(w, h) * 0.2);
      const poleX = Math.round(w / 2);
      const poleY = Math.max(3, h * 0.22);
      const poleGrad = ctx.createRadialGradient(poleX - 1.2, poleY - 1.2, 0.8, poleX, poleY, poleR);
      poleGrad.addColorStop(0, '#cbd5e1');
      poleGrad.addColorStop(0.6, '#64748b');
      poleGrad.addColorStop(1, '#334155');
      ctx.fillStyle = poleGrad;
      ctx.beginPath();
      ctx.arc(poleX, poleY, poleR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Banding clamps wrapping pole
      [poleY - 1.2, poleY + 1.2].forEach((by) => {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(poleX, by, poleR + 0.6, 1.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Galvanized Unistrut Mounting Bracket
      const strutY = Math.max(poleY + poleR + 0.5, h * 0.36);
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, strutY, w - 4, 1.8);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(2, strutY, w - 4, 1.8);

      // ACPDB Enclosure Body - Weatherproof RAL 7035 Light Industrial Grey
      const encX = 2;
      const encY = strutY + 1.6;
      const encW = w - 4;
      const encH = Math.max(6, h - encY - 1.2);
      const encGrad = ctx.createLinearGradient(encX, encY, encX, encY + encH);
      encGrad.addColorStop(0, '#f8fafc');
      encGrad.addColorStop(0.3, '#e2e8f0');
      encGrad.addColorStop(0.8, '#cbd5e1');
      encGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = encGrad;
      ctx.beginPath();
      ctx.roundRect(encX, encY, encW, encH, 1.2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Weatherproof Rain Canopy / Sloped Hood with Front Drip Lip
      ctx.fillStyle = '#475569';
      ctx.fillRect(encX - 1, encY - 0.6, encW + 2, 1.6);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(encX - 1, encY - 0.6, encW + 2, 1.6);

      // Chrome Quarter-Turn T-Handle Cam Latch Lock
      const latchX = encX + encW * 0.62;
      const latchY = encY + encH * 0.45;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(latchX, latchY, 1.0, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(latchX - 0.4, latchY - 1.2, 0.8, 2.4);

      // High-Voltage Hazard Caution Warning Decal
      const decalW = Math.min(4.5, encW * 0.35);
      const decalH = Math.min(2.5, encH * 0.3);
      const decalX = encX + encW - decalW - 1;
      const decalY = encY + encH - decalH - 1;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(decalX, decalY, decalW, decalH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(decalX, decalY, decalW, decalH);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 2.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', decalX + decalW / 2, decalY + decalH * 0.75);

      // External Rotary Isolator Handle on side
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(encX + encW, encY + 2.5, 1.6, 4.5);
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(encX + encW, encY + 2.5, 1.6, 4.5);

      // Identification label text
      ctx.font = 'bold 3.2px monospace';
      ctx.fillStyle = '#d97706';
      ctx.textAlign = 'left';
      ctx.fillText('ACPDB', encX + 2.5, encY + encH - 2.2);

      // Multi-Conduit Gland Drops at Bottom (power in, feeder out, ground wire to grade)
      const conduitDropPositions = [encX + 4, encX + 9, encX + 14];
      conduitDropPositions.forEach((cx) => {
        // Gland nut
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx - 0.6, encY + encH - 0.2, 2.2, 0.8);
        // Conduit pipe dropping downwards
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 0.4, encY + encH + 0.6, 1.8, 1.8);
      });

      // Vertical AC mains conduit riser running up alongside pole
      const condX = w - 4;
      ctx.fillStyle = '#334155';
      ctx.fillRect(condX, 1.5, 2.5, h - 2.5);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(condX, 1.5, 2.5, h - 2.5);
      // Weatherhead top cap
      ctx.fillStyle = '#475569';
      ctx.fillRect(condX - 0.5, 0.5, 3.5, 1.5);

      // Pole Earthing Ground Wire to Grade
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(poleX + 3.5, poleY + 2.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(poleX + 3.5, poleY + 2.5);
      ctx.lineTo(poleX + 5, h - 2);
      ctx.stroke();
      return true;
    }

    default:
      return false;
  }
}
