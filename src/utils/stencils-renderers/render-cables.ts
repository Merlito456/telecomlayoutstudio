import { CADObject, ProjectSettings } from "../../types/cad";
import { drawPhotorealisticCementPad } from "./common";

export function renderCableStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'basepad-ladder':
    case 'cabin-feeder-ladder':
    case 'indoor-ladder':
    case 'indoor-ladder-long':
    case 'indoor-ladder-junction':
    case 'in-shelter-ladder':
    case 'in-shelter-cable-ladder':
    case 'inshelter-ladder':
    case 'inshelter-cable-ladder':
    case 'fiber-raceway-yellow':
    case 'fiber-raceway':
    case 'connecting-ladder':
    case 'cable-ladder-top':
    case 'cable-ladder':
    case 'cable-tray': {
      const sId = (stencilId || obj.customProps?.stencilType || obj.stencilId || '').toLowerCase();
      const objName = String(obj.name || obj.text || obj.customProps?.name || '').toLowerCase();
      const isIndoorLadder =
        sId.includes('indoor') ||
        sId.includes('junction') ||
        sId.includes('raceway') ||
        sId.includes('in-shelter') ||
        sId.includes('inshelter') ||
        (sId.includes('shelter') && sId.includes('ladder')) ||
        objName.includes('in-shelter') ||
        objName.includes('inshelter') ||
        (objName.includes('shelter') && objName.includes('ladder')) ||
        obj.customProps?.placement === 'indoor' ||
        obj.ladderType === 'indoor' ||
        obj.customProps?.ladderType === 'indoor';

      const lType = obj.ladderType || obj.customProps?.ladderType || (
        sId.includes('cabin-feeder') ? 'cabin-feeder' :
        isIndoorLadder ? 'indoor' :
        sId.includes('connecting') ? 'connecting' :
        sId.includes('basepad') ? 'basepad' : 'standard'
      );

      // DO NOT add basepad underneath the cable ladder!
      // Basepad ladder sits directly on whatever basepad the user placed, or connects between equipment.
      const isVertStretch = h > w * 1.15;
      const spanW = isVertStretch ? h : w;
      const spanH = isVertStretch ? w : h;
      if (isVertStretch) {
        ctx.translate(w / 2, h / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-spanW / 2, -spanH / 2);
      }
      
      const railColor = lType === 'cabin-feeder' ? '#0369a1' : lType === 'connecting' ? '#047857' : lType === 'indoor' ? '#ca8a04' : '#475569';
      const railBorder = lType === 'cabin-feeder' ? '#38bdf8' : lType === 'connecting' ? '#34d399' : lType === 'indoor' ? '#facc15' : '#cbd5e1';

      // 1. Extruded C-channel side rails
      ctx.fillStyle = railColor;
      ctx.fillRect(0, 0, spanW, 4.5);
      ctx.fillRect(0, spanH - 4.5, spanW, 4.5);
      ctx.strokeStyle = railBorder;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, 0, spanW, 4.5);
      ctx.strokeRect(0, spanH - 4.5, spanW, 4.5);

      // Top rail flange metallic highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 1.2);
      ctx.lineTo(spanW, 1.2);
      ctx.moveTo(0, spanH - 3.3);
      ctx.lineTo(spanW, spanH - 3.3);
      ctx.stroke();

      // 2. Slotted tubular ladder rungs (spaced along ladder span)
      const rungStep = 14;
      const numRungs = Math.floor(spanW / rungStep);
      
      for (let i = 0; i <= numRungs; i++) {
        const rx = i * rungStep;

        // Rung body
        ctx.fillStyle = lType === 'connecting' ? '#065f46' : '#64748b';
        ctx.fillRect(rx - 2, 4, 4, spanH - 8);
        ctx.strokeStyle = lType === 'connecting' ? '#10b981' : '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx - 2, 4, 4, spanH - 8);

        // Welded junction fillets at rail attachments
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(rx - 3, 3, 6, 2);
        ctx.fillRect(rx - 3, spanH - 5, 6, 2);

        // Slotted perforation line down center of rung
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, 7);
        ctx.lineTo(rx, spanH - 7);
        ctx.stroke();
      }

      // If Junction: draw crossing rungs in vertical direction as well
      if (sId.includes('junction')) {
        for (let j = 0; j <= Math.floor(spanH / rungStep); j++) {
          const ry = j * rungStep;
          ctx.fillStyle = '#64748b';
          ctx.fillRect(4, ry - 2, spanW - 8, 4);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.strokeRect(4, ry - 2, spanW - 8, 4);
        }
      }

      // 3. Specialized Hardware Details per Ladder Type:
      if (lType === 'basepad') {
        // Basepad Ladder: Low-profile unistrut standoff feet resting directly on basepad surface
        const unistrutX = [spanW * 0.2, spanW * 0.5, spanW * 0.8];
        unistrutX.forEach((fx) => {
          ctx.fillStyle = '#334155';
          ctx.fillRect(fx - 4, -2.5, 8, spanH + 5);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.strokeRect(fx - 4, -2.5, 8, spanH + 5);

          // Galvanized anchor bolt heads
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(fx, 1.5, 1.2, 0, Math.PI * 2);
          ctx.arc(fx, spanH - 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (lType === 'cabin-feeder') {
        // Cabin Feeder Ladder: Elevated bridge with shelter wall feedthrough collar & stanchion bents
        // Shelter wall feedthrough collar on terminal end
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-5, -3, 8, spanH + 6);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-5, -3, 8, spanH + 6);

        // Outdoor elevated stanchion pipe column bents
        [spanW * 0.35, spanW * 0.75].forEach((bx) => {
          // Circular stanchion column footer
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(bx, spanH / 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Center cross-brace bolt
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(bx, spanH / 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (lType === 'indoor') {
        // In-Shelter Cable Ladder: Ceiling drop rod attachment hangers
        [spanW * 0.25, spanW * 0.5, spanW * 0.75].forEach((dx) => {
          ctx.fillStyle = '#475569';
          ctx.fillRect(dx - 3, -3, 6, spanH + 6);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(dx - 3, -3, 6, spanH + 6);

          // Threaded rod end bolts
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(dx, -1.5, 1.2, 0, Math.PI * 2);
          ctx.arc(dx, spanH + 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (lType === 'connecting') {
        // Connecting Transition Ladder: Dual transition elbow brackets & slope transition markers
        // Low transition bracket
        ctx.fillStyle = '#047857';
        ctx.fillRect(-2, -3, 9, spanH + 6);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-2, -3, 9, spanH + 6);

        // High transition bracket
        ctx.fillStyle = '#047857';
        ctx.fillRect(spanW - 7, -3, 9, spanH + 6);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(spanW - 7, -3, 9, spanH + 6);

        // Transition slope chevron indicators along ladder center
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.lineWidth = 1.5;
        for (let cx = 25; cx < spanW - 25; cx += 28) {
          ctx.beginPath();
          ctx.moveTo(cx - 5, spanH / 2 - 4);
          ctx.lineTo(cx, spanH / 2);
          ctx.lineTo(cx - 5, spanH / 2 + 4);
          ctx.stroke();
        }
      }

      // End splice connection plates
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 3, spanH);
      ctx.fillRect(spanW - 3, 0, 3, spanH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 3, spanH);
      ctx.strokeRect(spanW - 3, 0, 3, spanH);

      return true;
    }

    // ==========================================
    // 10. CONCRETE BASEPADS & SLABS (Authentic Cement Foundation)
    // ==========================================
  }
  return false;
}
