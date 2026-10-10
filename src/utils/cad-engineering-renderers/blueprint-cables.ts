import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "./common";

export function renderEngineeringCable(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
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
    case 'cable-tray':
    case 'cable-ladder-top':
    case 'cable-ladder': {
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

      const isVertStretch = h > w * 1.15;
      const spanW = isVertStretch ? h : w;
      const spanH = isVertStretch ? w : h;
      if (isVertStretch) {
        ctx.translate(w / 2, h / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-spanW / 2, -spanH / 2);
      }

      // Parallel Stringer Rails
      ctx.strokeStyle = lType === 'cabin-feeder' ? '#0284c7' : lType === 'connecting' ? '#10b981' : lType === 'indoor' ? '#facc15' : colors.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(spanW, 0);
      ctx.moveTo(0, spanH);
      ctx.lineTo(spanW, spanH);
      ctx.stroke();

      // Evenly Spaced Ladder Rungs
      const rungStep = 12;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let rx = 6; rx < spanW; rx += rungStep) {
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, spanH);
      }
      ctx.stroke();

      // If Junction: crossing rungs along length
      if (sId.includes('junction')) {
        for (let ry = 6; ry < spanH; ry += rungStep) {
          ctx.beginPath();
          ctx.moveTo(0, ry);
          ctx.lineTo(spanW, ry);
          ctx.stroke();
        }
      }

      // Engineering Drafting Features per Ladder Type:
      if (lType === 'basepad') {
        // Basepad Unistrut Standoff Feet symbols
        [spanW * 0.2, spanW * 0.5, spanW * 0.8].forEach((fx) => {
          ctx.fillStyle = colors.secondary;
          ctx.fillRect(fx - 3, -2, 6, spanH + 4);
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 1;
          ctx.strokeRect(fx - 3, -2, 6, spanH + 4);
        });
      } else if (lType === 'cabin-feeder') {
        // Wall feedthrough collar box
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-3, -3, 6, spanH + 6);
        ctx.strokeStyle = colors.primary;
        ctx.strokeRect(-3, -3, 6, spanH + 6);

        // Circular elevated stanchion bent markers
        [spanW * 0.35, spanW * 0.75].forEach((bx) => {
          ctx.fillStyle = colors.secondary;
          ctx.beginPath();
          ctx.arc(bx, spanH / 2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      } else if (lType === 'indoor') {
        // Ceiling drop-rod attachment markers
        [spanW * 0.25, spanW * 0.5, spanW * 0.75].forEach((dx) => {
          ctx.fillStyle = colors.accent;
          ctx.fillRect(dx - 2.5, -2.5, 5, 5);
          ctx.fillRect(dx - 2.5, spanH - 2.5, 5, 5);
        });
      } else if (lType === 'connecting') {
        // Transition elbow angle bracket markers at terminals
        ctx.fillStyle = '#059669';
        ctx.fillRect(-2, -3, 7, spanH + 6);
        ctx.fillRect(spanW - 5, -3, 7, spanH + 6);

        // Transition slope indicator arrow along center
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(15, spanH / 2);
        ctx.lineTo(spanW - 15, spanH / 2);
        ctx.stroke();
      }

      // End splice plates
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, 2.5, spanH);
      ctx.fillRect(spanW - 2.5, 0, 2.5, spanH);

      return true;
    }

    // ==========================================
    // 12. SECURITY FENCE, WALL & GATE
    // ==========================================
  }
  return false;
}
