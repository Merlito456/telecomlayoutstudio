import { CADObject } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderATSAndPowerDistribution(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  w: number,
  h: number,
  stencilType: string
): boolean {
  switch (stencilType) {
    case 'ats':
    case 'ats-cabinet':
    case 'ats-panel':
    case 'ats-wall': {
      // 1. Concrete / Masonry Wall Interface & 4 Heavy-Duty Wall Mounting Ears
      ctx.fillStyle = '#475569';
      ctx.fillRect(-2, 0, w + 4, 3);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-2, 0, w + 4, 3);

      [
        { x: -3.5, y: 0.5 },
        { x: w - 0.5, y: 0.5 },
        { x: -3.5, y: h - 4.5 },
        { x: w - 0.5, y: h - 4.5 },
      ].forEach((tab) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tab.x, tab.y, 4, 4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(tab.x, tab.y, 4, 4);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(tab.x + 2, tab.y + 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Heavy-Duty Weatherproof NEMA 3R / 4X Powder-Coated Industrial Enclosure (RAL 7035 / Dark Slate)
      const encGrad = ctx.createLinearGradient(0, 2, w, h);
      encGrad.addColorStop(0, '#3b4252');
      encGrad.addColorStop(0.35, '#2e3440');
      encGrad.addColorStop(0.75, '#1e293b');
      encGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = encGrad;
      ctx.beginPath();
      ctx.roundRect(0, 2, w, h - 2, 2.5);
      ctx.fill();

      // Powder coat outer protective lip
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Sloped weather hood overhang at top (drips away rain from wall)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1, 0.5, w + 2, 3);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-1, 0.5, w + 2, 3);

      // Stainless steel door piano hinge along left
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0.5, 3, 1.2, h - 5);

      // Dual quarter-turn door latches on right
      [6, h - 8].forEach((ly) => {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(w - 2.5, ly, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // 3. Digital ATS Microprocessor Controller Display (Center-Top)
      const dX = w / 2 - 9;
      const dY = 3.5;
      const dW = 18;
      const dH = 8.5;
      ctx.fillStyle = '#020617';
      ctx.fillRect(dX, dY, dW, dH);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(dX, dY, dW, dH);

      // Backlit LCD Display showing ATS status
      const lcdW = dW - 2;
      const lcdH = dH - 3.5;
      const lcdGrad = ctx.createLinearGradient(dX + 1, dY + 1, dX + 1, dY + 1 + lcdH);
      lcdGrad.addColorStop(0, '#0369a1');
      lcdGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = lcdGrad;
      ctx.fillRect(dX + 1, dY + 1, lcdW, lcdH);

      const transferMode = (obj.customProps?.transferMode as string) || 'auto';
      const displayText =
        transferMode === 'manual'
          ? 'ATS: MAN'
          : transferMode === 'test'
          ? 'ATS: TEST'
          : 'ATS: AUTO';

      ctx.fillStyle = '#e0f2fe';
      ctx.font = 'bold 3.2px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(displayText, dX + dW / 2, dY + 3.8);

      // Status LED indicator dots below LCD:
      // Normal/Mains (Green), Emergency/Gen (Amber), Load (Cyan), Auto (Yellow)
      const leds = [
        { col: transferMode === 'manual' ? '#15803d' : '#22c55e', title: 'N' },
        { col: transferMode === 'test' ? '#fbbf24' : '#f59e0b', title: 'G' },
        { col: '#38bdf8', title: 'L' },
        { col: transferMode === 'manual' ? '#64748b' : '#eab308', title: 'A' },
      ];
      leds.forEach((ld, idx) => {
        const lx = dX + 2.5 + idx * 3.8;
        const ly = dY + dH - 1.5;
        ctx.fillStyle = ld.col;
        ctx.beginPath();
        ctx.arc(lx, ly, 1.0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Source 1 (Normal / Utility Mains) Contactor Module on Left
      const mX = 3.5;
      const mY = 13.5;
      const mW = 10;
      const mH = 8.5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(mX, mY, mW, mH);
      ctx.strokeStyle = '#22c55e'; // Green for normal mains
      ctx.lineWidth = 1;
      ctx.strokeRect(mX, mY, mW, mH);

      ctx.font = 'bold 3px monospace';
      ctx.fillStyle = '#86efac';
      ctx.textAlign = 'center';
      ctx.fillText('MAINS', mX + mW / 2, mY + 3.8);
      // Mains closed indicator bar
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(mX + 2, mY + 5, mW - 4, 2);

      // 5. Source 2 (Emergency / Standby Gen) Contactor Module on Right
      const gX = w - 13.5;
      const gY = 13.5;
      const gW = 10;
      const gH = 8.5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(gX, gY, gW, gH);
      ctx.strokeStyle = '#f59e0b'; // Amber for generator
      ctx.lineWidth = 1;
      ctx.strokeRect(gX, gY, gW, gH);

      ctx.font = 'bold 3px monospace';
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.fillText('GEN', gX + gW / 2, gY + 3.8);
      // Generator open indicator bar
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gX + 2, gY + 5, gW - 4, 2);

      // 6. Mechanical Interlock Linkage Bar Between Contactors
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mX + mW, mY + mH / 2);
      ctx.lineTo(gX, gY + gH / 2);
      ctx.stroke();

      // Interlock padlock / diamond marker
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      const midX = (mX + mW + gX) / 2;
      const midY = mY + mH / 2;
      ctx.arc(midX, midY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 7. Manual Emergency Transfer Handle (Safety Red lever with steel grip)
      const hndX = midX;
      const hndY = h - 2.8;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(hndX - 4, hndY - 1, 8, 2.2);
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(hndX - 4, hndY - 1, 8, 2.2);

      // 8. High Voltage Hazard Warning Decal (Left-bottom corner)
      const hx = 4.5;
      const hy = h - 3.2;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(hx, hy - 2.2);
      ctx.lineTo(hx + 2.5, hy + 1.8);
      ctx.lineTo(hx - 2.5, hy + 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 3px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', hx, hy + 1.2);

      // 9. Grounding terminal lug & conduit hubs
      ctx.fillStyle = '#b45309';
      ctx.fillRect(w - 2.5, h - 5, 2, 4);
      return true;
    }

    // ==========================================
    // MAIN POWER DISTRIBUTION (MPD)
    // ==========================================
    case 'mpd': {
      // 1. Concrete mounting pad plinth
      drawPhotorealisticCementPad(ctx, -2, -2, w + 4, h + 4, {
        chamfer: 2,
        showJoints: false,
        roundRadius: 2,
      });

      // 2. Weatherproof Heavy NEMA 4X Industrial Enclosure
      const encGrad = ctx.createLinearGradient(0, 0, w, h);
      encGrad.addColorStop(0, '#334155');
      encGrad.addColorStop(0.5, '#475569');
      encGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = encGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Sloped weather hood overhang at top
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1, -1, w + 2, 3);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-1, -1, w + 2, 3);

      // Main MCCB Rotary Isolator Switch (Safety Orange / Red)
      const swX = 9;
      const swY = h / 2;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(swX, swY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Switch handle bar
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(swX - 1.2, swY - 4.5, 2.4, 9);

      // High-Voltage Hazard Triangle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      const tx = w - 9;
      const ty = h / 2 - 3;
      ctx.moveTo(tx, ty - 3.5);
      ctx.lineTo(tx + 4, ty + 3.5);
      ctx.lineTo(tx - 4, ty + 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', tx, ty + 2.5);

      // Digital Power Meter Display (LCD with Voltage readout)
      const dX = w / 2 - 6;
      const dY = 4;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dX, dY, 12, 7);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(dX, dY, 12, 7);
      // Meter digits
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('380V', dX + 6, dY + 5.5);

      // Status LED indicator dots (R, S, T phases)
      const ledY = h - 5;
      const leds = ['#ef4444', '#facc15', '#3b82f6'];
      leds.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(dX + 2 + idx * 4, ledY, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      return true;
    }

    // ==========================================
    // DC POWER DISTRIBUTION UNIT (DCPDU)
    // ==========================================
    case 'dcpdu': {
      // 1. Concrete mounting pad
      drawPhotorealisticCementPad(ctx, -2, -2, w + 4, h + 4, {
        chamfer: 2,
        showJoints: false,
        roundRadius: 2,
      });

      // 2. Telecom -48V DC Enclosure (Matte Deep Slate / Telecom Blue)
      const dcGrad = ctx.createLinearGradient(0, 0, w, h);
      dcGrad.addColorStop(0, '#1e293b');
      dcGrad.addColorStop(0.5, '#0f172a');
      dcGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = dcGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Top rain canopy strip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1, -1, w + 2, 2.5);

      // -48V DC Identification Badge
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(3, 3, w - 6, 5);
      ctx.font = 'bold 4.5px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('-48V DC POWER', w / 2, 6.8);

      // Bank of Miniature Circuit Breakers (MCBs)
      const numBreakers = Math.max(4, Math.floor((w - 12) / 4));
      for (let b = 0; b < numBreakers; b++) {
        const bx = 5 + b * 3.8;
        const by = 10;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx, by, 2.8, 8);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, by, 2.8, 8);
        // Switch toggle
        ctx.fillStyle = b % 2 === 0 ? '#10b981' : '#38bdf8';
        ctx.fillRect(bx + 0.5, by + 2, 1.8, 2.5);
      }

      // Copper Grounding Busbar Terminal on right edge
      ctx.fillStyle = '#b45309';
      ctx.fillRect(w - 3.5, 9, 2.5, 9);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(w - 3.5, 9, 2.5, 9);
      return true;
    }

    // ==========================================
    // ELECTRICAL CIRCUIT BREAKER (ECB) - WALL MOUNTED (ACTUAL TELECOM LOOK)
    // ==========================================
    default:
      return false;
  }
}
