import { CADObject } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderTwoPoleDistribution(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  w: number,
  h: number,
  stencilType: string
): boolean {
  switch (stencilType) {
    case 'power-twopole-structure': {
      // 1. Left & Right Heavy Foundation Concrete Pedestal Footings
      const leftColX = 13;
      const rightColX = w - 15;
      const footW = 14;
      const footH = 14;
      const footY = 4;

      [leftColX, rightColX].forEach((cx) => {
        // Concrete foundation pad
        drawPhotorealisticCementPad(ctx, cx - footW / 2, footY, footW, footH, {
          chamfer: 1.5,
          showJoints: false,
          roundRadius: 1,
        });

        // Galvanized steel baseplate with 4 anchor bolts
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx - 5.5, footY + 2, 11, 10);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(cx - 5.5, footY + 2, 11, 10);

        // 4 anchor bolt heads
        [
          [-4, -3],
          [4, -3],
          [-4, 3],
          [4, 3],
        ].forEach(([bx, by]) => {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(cx + bx, footY + 7 + by, 0.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // 3" Galvanized Steel Tubular Pipe Post (GI Column)
        const poleGrad = ctx.createRadialGradient(cx - 1.5, footY + 5.5, 1, cx, footY + 7, 4.5);
        poleGrad.addColorStop(0, '#f8fafc');
        poleGrad.addColorStop(0.5, '#cbd5e1');
        poleGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = poleGrad;
        ctx.beginPath();
        ctx.arc(cx, footY + 7, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 2. Heavy Horizontal Galvanized Unistrut Cross-Rails (P1000 Framing Channels)
      [9, 25].forEach((uy) => {
        const uniGrad = ctx.createLinearGradient(0, uy, 0, uy + 4);
        uniGrad.addColorStop(0, '#94a3b8');
        uniGrad.addColorStop(0.5, '#475569');
        uniGrad.addColorStop(1, '#334155');
        ctx.fillStyle = uniGrad;
        ctx.fillRect(4, uy, w - 8, 4);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(4, uy, w - 8, 4);

        // Spring-nut clamp bolts securing unistrut to vertical poles
        [leftColX, rightColX].forEach((cx) => {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(cx - 2, uy + 0.8, 4, 2.4);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.4;
          ctx.strokeRect(cx - 2, uy + 0.8, 4, 2.4);
        });
      });

      // 3. Overhead Cantilevered Corrugated Weather Canopy / Sun-Shield Hood (Spans across both poles)
      const roofH = 5.5;
      const roofGrad = ctx.createLinearGradient(0, 0, 0, roofH);
      roofGrad.addColorStop(0, '#0284c7');
      roofGrad.addColorStop(0.5, '#0f172a');
      roofGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, roofH, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Corrugated roof rib lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 0.6;
      for (let rx = 5; rx < w - 4; rx += 5) {
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, roofH);
        ctx.stroke();
      }

      // 4. UNIT 1: ECB (Emergency Circuit Breaker / Main Disconnect) on Left Side of Structure
      const ecbX = 20;
      const ecbY = 10;
      const ecbW = 26;
      const ecbH = 18;

      // NEMA 4X Enclosure body
      const ecbGrad = ctx.createLinearGradient(ecbX, ecbY, ecbX + ecbW, ecbY + ecbH);
      ecbGrad.addColorStop(0, '#f1f5f9');
      ecbGrad.addColorStop(0.5, '#cbd5e1');
      ecbGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = ecbGrad;
      ctx.beginPath();
      ctx.roundRect(ecbX, ecbY, ecbW, ecbH, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Sloped weather hood over ECB
      ctx.fillStyle = '#334155';
      ctx.fillRect(ecbX - 1, ecbY, ecbW + 2, 2.2);

      // ECB Red Disconnect Handle with Yellow LOTO Lockout Hole
      const ecbSwX = ecbX + ecbW - 7;
      const ecbSwY = ecbY + 3;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(ecbSwX, ecbSwY, 5, 9);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ecbSwX + 1, ecbSwY + 1, 3, 7);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(ecbSwX + 2.5, ecbSwY + 2.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // ECB Hazard triangle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(ecbX + 4.5, ecbY + 3.5);
      ctx.lineTo(ecbX + 8, ecbY + 8);
      ctx.lineTo(ecbX + 1, ecbY + 8);
      ctx.closePath();
      ctx.fill();

      // Nameplate: ECB
      ctx.font = 'bold 3.8px monospace';
      ctx.fillStyle = '#b91c1c';
      ctx.textAlign = 'center';
      ctx.fillText('MAIN ECB', ecbX + ecbW / 2 - 2, ecbY + ecbH - 2.5);

      // 5. UNIT 2: ACPDB (AC Power Distribution Board) on Right Side of Structure
      const pdbX = 52;
      const pdbY = 8;
      const pdbW = 42;
      const pdbH = 22;

      // NEMA 4X Industrial AC Panel Board Enclosure (Warm Slate / Industrial Amber)
      const pdbGrad = ctx.createLinearGradient(pdbX, pdbY, pdbX + pdbW, pdbY + pdbH);
      pdbGrad.addColorStop(0, '#f8fafc');
      pdbGrad.addColorStop(0.3, '#e2e8f0');
      pdbGrad.addColorStop(0.7, '#cbd5e1');
      pdbGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = pdbGrad;
      ctx.beginPath();
      ctx.roundRect(pdbX, pdbY, pdbW, pdbH, 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Sloped weather hood over ACPDB
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pdbX - 1, pdbY, pdbW + 2, 2.5);

      // Door gasket outline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(pdbX + 2, pdbY + 3.5, pdbW - 4, pdbH - 5.5);

      // Polycarbonate Transparent Viewing Window
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pdbX + 4, pdbY + 5, 14, 7);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(pdbX + 4, pdbY + 5, 14, 7);

      // Digital Multi-Function Power / Energy Meter (Green LED illuminated readout: 230V 50Hz)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(pdbX + 5, pdbY + 6, 12, 5);
      ctx.font = 'bold 3.2px monospace';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.fillText('230V 50Hz', pdbX + 11, pdbY + 9.8);

      // Surge Protection Device (SPD / TVSS) Class I+II Block with LED Status Dots
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(pdbX + 21, pdbY + 5, 17, 6.5);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(pdbX + 21, pdbY + 5, 17, 6.5);
      ctx.font = 'bold 3px monospace';
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('SPD TVSS', pdbX + 29.5, pdbY + 8.5);
      // Green indicator status LEDs (Normal)
      for (let si = 0; si < 3; si++) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(pdbX + 24 + si * 4, pdbY + 10, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Miniature Circuit Breakers (MCBs) Array (Main MCCB, Rectifiers, HVAC, AWL, Utility)
      const mcbY = pdbY + 13.5;
      const mcbCount = 7;
      for (let mi = 0; mi < mcbCount; mi++) {
        const mx = pdbX + 4.5 + mi * 4.6;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mx, mcbY, 3.5, 6);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(mx, mcbY, 3.5, 6);
        // Breaker toggle switch
        ctx.fillStyle = mi === 0 ? '#ef4444' : mi % 2 === 0 ? '#10b981' : '#38bdf8';
        ctx.fillRect(mx + 0.8, mcbY + 1.5, 1.9, 2.2);
      }

      // ACPDB Header Badge
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pdbX + pdbW / 2 - 12, pdbY + 2.5, 24, 2);
      ctx.font = 'bold 3.2px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('ACPDB MAIN', pdbX + pdbW / 2, pdbY + 4.2);

      // 6. Interconnecting Heavy Rigid Steel Conduit (RSC) Bridging ECB to ACPDB
      const conduitY = 18;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(ecbX + ecbW, conduitY, pdbX - (ecbX + ecbW), 3.2);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(ecbX + ecbW, conduitY, pdbX - (ecbX + ecbW), 3.2);
      // Threaded conduit coupling
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect((ecbX + ecbW + pdbX) / 2 - 1.5, conduitY - 0.4, 3, 4);

      // Bottom Outgoing Conduit Droppers (Towards cable tray / underground trench)
      [pdbX + 8, pdbX + 22, pdbX + 34].forEach((dx) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(dx, pdbY + pdbH, 3.5, 4);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(dx, pdbY + pdbH, 3.5, 4);
      });

      // 7. Master Grounding Copper Busbar (MGB) Mounted Across Lower Unistrut
      const mgbY = 30.5;
      const mgbX = 18;
      const mgbW = w - 36;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(mgbX, mgbY, mgbW, 3);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(mgbX, mgbY, mgbW, 3);
      // Copper grounding lugs and green/yellow grounding wire conductors
      for (let gx = mgbX + 6; gx < mgbX + mgbW - 4; gx += 12) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(gx, mgbY + 1.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
        // Green/yellow earth wire to equipment
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(gx, mgbY);
        ctx.lineTo(gx, mgbY - 4);
        ctx.stroke();
      }

      // Structure Title Stamp
      ctx.font = 'bold 4px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText('2-POLE SERVICE ENTRANCE STRUCTURE (ECB + ACPDB)', w / 2, h - 1.5);
      return true;
    }

    // ==========================================
    // ACPDB (AC POWER DISTRIBUTION BOARD) - WALL MOUNTED
    // ==========================================
    default:
      return false;
  }
}
