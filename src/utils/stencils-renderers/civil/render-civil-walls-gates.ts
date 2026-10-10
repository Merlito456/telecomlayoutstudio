import { drawPhotorealisticCementPad } from "../common";
import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderCivilWallsGates(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'wall':
    case 'masonry-wall':
    case 'perimeter-wall': {
      // Brick / CMU wall body
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Precast concrete wall coping cap (top & bottom)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, w, 3);
      ctx.fillRect(0, h - 3, w, 3);

      // Precast terminal closed end caps (left & right ends - no opening)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 4, h);
      ctx.fillRect(w - 4, 0, 4, h);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, 0, 4, h);
      ctx.strokeRect(w - 4, 0, 4, h);

      // Horizontal bed mortar courses
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, h / 2);
      ctx.lineTo(w - 4, h / 2);
      ctx.stroke();

      // Staggered vertical head mortar joints (Running bond pattern)
      const brickW = 20;
      for (let bx = 4 + brickW; bx < w - 4; bx += brickW) {
        ctx.beginPath();
        ctx.moveTo(bx, 3);
        ctx.lineTo(bx, h / 2);
        ctx.moveTo(bx + brickW / 2, h / 2);
        ctx.lineTo(bx + brickW / 2, h - 3);
        ctx.stroke();
      }
      return true;
    }

    // ==========================================
    // 14. GATE (2-DOOR CLOSED) & FENCES
    // ==========================================
    case 'gate-2door': {
      const pierW = 16;
      const pierH = h;
      const gateSpan = w - pierW * 2;
      const leafW = gateSpan / 2;
      const isOpen = !!(obj.doorsOpen || obj.customProps?.doorsOpen || (obj.customProps?.isClosed === false));

      // Concrete Gate Piers with chamfered cap
      for (const px of [0, w - pierW]) {
        drawPhotorealisticCementPad(ctx, px, 0, pierW, pierH, {
          chamfer: 2,
          showJoints: false,
          roundRadius: 2,
        });

        // Pier pyramid cap apex
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px + pierW, pierH);
        ctx.moveTo(px + pierW, 0);
        ctx.lineTo(px, pierH);
        ctx.stroke();
      }

      // Heavy hinge bracket lugs mounting leaves flush to piers
      ctx.fillStyle = '#334155';
      ctx.fillRect(pierW - 2, 4, 4, 5);
      ctx.fillRect(pierW - 2, pierH - 9, 4, 5);
      ctx.fillRect(w - pierW - 2, 4, 4, 5);
      ctx.fillRect(w - pierW - 2, pierH - 9, 4, 5);

      if (!isOpen) {
        // CLOSED Double Leaf Position (flush along span from pierW to w - pierW)
        // Left Closed Leaf Tubular Frame (spans flush from pierW to center w/2)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(pierW, 2, leafW, pierH - 4);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(pierW, 2, leafW, pierH - 4);

        // Right Closed Leaf Tubular Frame (spans flush from center w/2 to w - pierW)
        ctx.fillRect(pierW + leafW, 2, leafW, pierH - 4);
        ctx.strokeRect(pierW + leafW, 2, leafW, pierH - 4);

        // Mid-height horizontal reinforcing rails across both closed leaves
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pierW, pierH / 2);
        ctx.lineTo(w - pierW, pierH / 2);
        ctx.stroke();

        // Vertical Tubular Steel Pickets on Left and Right Leaves
        const numPick = Math.max(3, Math.floor(leafW / 10));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        for (let p = 1; p < numPick; p++) {
          const px1 = pierW + (p / numPick) * leafW;
          ctx.beginPath();
          ctx.moveTo(px1, 4);
          ctx.lineTo(px1, pierH - 4);
          ctx.stroke();

          const px2 = pierW + leafW + (p / numPick) * leafW;
          ctx.beginPath();
          ctx.moveTo(px2, 4);
          ctx.lineTo(px2, pierH - 4);
          ctx.stroke();
        }

        // Center Locking Bar, Overlap Astragal, & Drop Pin Lock Box (fully closed gate)
        const lockH = Math.max(8, pierH - 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pierW + leafW - 4, 3, 8, lockH);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(pierW + leafW - 4, 3, 8, lockH);

        // Keyhole / lock cylinder badge
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(pierW + leafW, pierH / 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Dual stainless steel lever handles
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(pierW + leafW - 8, pierH / 2 - 1.5, 4, 3);
        ctx.fillRect(pierW + leafW + 4, pierH / 2 - 1.5, 4, 3);
      } else {
        // OPEN Double Leaf Position (Leaves swung open outward 90° on heavy pier hinges)
        // Architectural swing path guide arcs
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);

        // Left swing arc
        ctx.beginPath();
        ctx.arc(pierW, pierH / 2, leafW, 0, Math.PI / 2);
        ctx.stroke();

        // Right swing arc
        ctx.beginPath();
        ctx.arc(w - pierW, pierH / 2, leafW, Math.PI, Math.PI / 2, true);
        ctx.stroke();
        ctx.restore();

        // Swung Open Left Leaf Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(pierW - 3, pierH / 2, 6, leafW);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(pierW - 3, pierH / 2, 6, leafW);

        // Left leaf pickets & handle
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pierW, pierH / 2 + 4);
        ctx.lineTo(pierW, pierH / 2 + leafW - 4);
        ctx.stroke();

        // Swung Open Right Leaf Frame
        ctx.fillRect(w - pierW - 3, pierH / 2, 6, leafW);
        ctx.strokeRect(w - pierW - 3, pierH / 2, 6, leafW);

        // Right leaf pickets & handle
        ctx.beginPath();
        ctx.moveTo(w - pierW, pierH / 2 + 4);
        ctx.lineTo(w - pierW, pierH / 2 + leafW - 4);
        ctx.stroke();

        // Ground center drop receiver sleeve on floor (flush with ground)
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(w / 2, pierH / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Green clear entrance lane badge & directional arrow
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(w / 2, pierH / 2 - 8);
        ctx.lineTo(w / 2, pierH / 2 + 8);
        ctx.moveTo(w / 2 - 4, pierH / 2 + 4);
        ctx.lineTo(w / 2, pierH / 2 + 8);
        ctx.lineTo(w / 2 + 4, pierH / 2 + 4);
        ctx.stroke();

        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.fillText('OPEN [Z]', w / 2, pierH / 2 - 12);
        ctx.restore();
      }

      return true;
    }


  }
  return false;
}
