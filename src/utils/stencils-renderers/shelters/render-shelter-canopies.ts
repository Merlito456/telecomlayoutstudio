import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderShelterCanopies(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'wall-roof-shade': {
      // 1. Wall-Mounting Ledger Plate along top edge (Wall attachment interface)
      const ledgerH = 6;
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, w, ledgerH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, ledgerH);

      // Chemical anchor bolts along wall ledger plate
      ctx.fillStyle = '#f59e0b';
      const numBolts = Math.max(3, Math.floor(w / 20));
      for (let i = 0; i <= numBolts; i++) {
        const bx = 8 + (i / numBolts) * (w - 16);
        ctx.beginPath();
        ctx.arc(bx, ledgerH / 2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Translucent Corrugated Roof Canopy (Allows equipment inside/underneath to be clearly visible!)
      const canopyH = h - ledgerH - 4;
      const roofGrad = ctx.createLinearGradient(0, ledgerH, 0, h - 4);
      roofGrad.addColorStop(0, 'rgba(51, 65, 85, 0.45)');
      roofGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.35)');
      roofGrad.addColorStop(1, 'rgba(15, 23, 42, 0.40)');
      ctx.fillStyle = roofGrad;
      ctx.fillRect(0, ledgerH, w, canopyH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(0, ledgerH, w, canopyH);

      // Corrugated steel roof ribs (drawn translucent with metallic sheen)
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
      ctx.lineWidth = 1;
      for (let rx = 10; rx < w - 10; rx += 14) {
        ctx.beginPath();
        ctx.moveTo(rx, ledgerH);
        ctx.lineTo(rx, h - 4);
        ctx.stroke();
      }

      // Cantilever structural steel outrigger rafters extending from wall
      const numRafters = Math.max(2, Math.floor(w / 35));
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      for (let r = 0; r <= numRafters; r++) {
        const rx = 4 + (r / numRafters) * (w - 8);
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, h - 4);
        ctx.stroke();

        // Horizontal Cantilever Wall Connection Brackets (connecting the end of the roof horizontally to wall)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(rx - 2, 0, 4, 8);
        ctx.fillRect(rx - 3, h - 8, 6, 4);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx - 2, 0, 4, 8);
      }

      // 3. Front Drainage Gutter & Corner Downspout
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, h - 4, w, 4);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, h - 4, w, 4);

      // Horizontal Wall Cantilever Struts & Gussets (no ground poles - connected parallel to wall)
      [6, w - 6].forEach((px) => {
        // Heavy Wall Connection Flange at wall end
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px - 3, 0, 6, 6);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 3, 0, 6, 6);

        // Horizontal cantilever tie bracket at outer roof eave
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 4, h - 7, 8, 5);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(px - 4, h - 7, 8, 5);
      });

      // Technical Title (honors showObjectLabels toggle)
      if (settings.showObjectLabels !== false) {
        ctx.font = 'bold 7.5px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('WALL-ATTACHED EQUIPMENT ROOF SHADE', w / 2, h / 2);
      }
      return true;
    }

    // ==========================================
    // ATS (AUTOMATIC TRANSFER SWITCH) - WALL MOUNTED ENCLOSURE / PANEL
    // ==========================================
    case 'wall-roof-canopy': {
      // 1. Transparent Shaded Equipment Footprint Below
      // (Leaves equipment underneath 100% visible while indicating weather shelter)
      const shadeGrad = ctx.createLinearGradient(0, 0, 0, h);
      shadeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
      shadeGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.14)');
      shadeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.06)');
      ctx.fillStyle = shadeGrad;
      ctx.fillRect(0, 0, w, h);

      // Dashed drip-line perimeter
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(0, 0, w, h);
      ctx.setLineDash([]);

      // 2. Wall Ledger Attachment Beam (Anchored into top of wall)
      const ledgerH = 6;
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, w, ledgerH);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, 0, w, ledgerH);

      // Wall Anchor Expansion Bolts along ledger
      for (let bx = 8; bx < w; bx += 16) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(bx, ledgerH / 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // 3. Corrugated Roof Sheet Overhang Ribs
      for (let rx = 4; rx < w; rx += 8) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ledgerH);
        ctx.lineTo(rx, h);
        ctx.stroke();
      }

      // 4. Structural Steel Rafter Beams & Horizontal Wall Cantilever Outriggers
      const rafters = [8, w / 2, w - 8];
      rafters.forEach((rx) => {
        // Heavy rafter line
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, h);
        ctx.stroke();

        // Horizontal Wall Connection Bracket (connected horizontally to wall, no ground post)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rx - 3, 0, 6, 6);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(rx - 3, 0, 6, 6);

        // Outer eave cantilever structural brace
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(rx - 2, h - 5, 4, 4);
      });

      // Front Rain Gutter Eave along bottom edge
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, h - 3, w, 3);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(0, h - 3, w, 3);

      // Architectural Blueprint Annotation (honors showObjectLabels)
      if (settings.showObjectLabels !== false) {
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('WALL-ATTACHED CANOPY (SHADE)', w / 2, h / 2);
      }
      return true;
    }
  }
  return false;
}
