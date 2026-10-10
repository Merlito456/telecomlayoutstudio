import { CADObject, ProjectSettings } from '../../types/cad';
import { drawStandardTerminator } from './dimension-terminator';
import { drawDimensionBadge } from './dimension-badge';

export { drawStandardTerminator };

export function drawDimensionHorizontal(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings
) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x2 ?? obj.x + obj.width;
  const y2 = obj.y2 ?? obj.y;
  const offset = obj.dimOffset ?? -30;
  const dimY = Math.min(y1, y2) + offset;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const dist = maxX - minX;

  ctx.strokeStyle = obj.stroke || '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  // Standard CAD Witness lines with gap from feature and overshoot past dimension line
  const overshoot = offset < 0 ? -5 : 5;
  const gap = offset < 0 ? -3 : 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1 + gap);
  ctx.lineTo(x1, dimY + overshoot);
  ctx.moveTo(x2, y2 + gap);
  ctx.lineTo(x2, dimY + overshoot);
  ctx.stroke();

  // Main horizontal dimension line
  ctx.beginPath();
  ctx.moveTo(minX, dimY);
  ctx.lineTo(maxX, dimY);
  ctx.stroke();

  // Standard CAD Terminators (slash, arrow, dot)
  const style = settings.dimensionArrowStyle || 'slash';
  drawStandardTerminator(ctx, minX, dimY, 0, style);
  drawStandardTerminator(ctx, maxX, dimY, Math.PI, style);

  // Endpoint FROM / TO drafting tags near witness lines
  if (obj.fromLabel || obj.toLabel) {
    ctx.save();
    ctx.font = 'bold 7.5px monospace';
    ctx.fillStyle = '#94a3b8';
    if (obj.fromLabel) {
      ctx.textAlign = 'right';
      ctx.fillText(`FROM: ${obj.fromLabel}`, minX - 6, dimY - 3);
    }
    if (obj.toLabel) {
      ctx.textAlign = 'left';
      ctx.fillText(`TO: ${obj.toLabel}`, maxX + 6, dimY - 3);
    }
    ctx.restore();
  }

  // Measurement Badge
  drawDimensionBadge({
    ctx,
    obj,
    settings,
    dist,
    nomX: (minX + maxX) / 2,
    nomY: dimY,
  });
}

export function drawDimensionVertical(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings
) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x2 ?? obj.x;
  const y2 = obj.y2 ?? obj.y + obj.height;
  const offset = obj.dimOffset ?? 30;
  const dimX = Math.max(x1, x2) + offset;

  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const dist = maxY - minY;

  ctx.strokeStyle = obj.stroke || '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  // Witness lines
  const overshoot = offset < 0 ? -5 : 5;
  const gap = offset < 0 ? -3 : 3;

  ctx.beginPath();
  ctx.moveTo(x1 + gap, y1);
  ctx.lineTo(dimX + overshoot, y1);
  ctx.moveTo(x2 + gap, y2);
  ctx.lineTo(dimX + overshoot, y2);
  ctx.stroke();

  // Main vertical line
  ctx.beginPath();
  ctx.moveTo(dimX, minY);
  ctx.lineTo(dimX, maxY);
  ctx.stroke();

  // Standard CAD Terminators
  const style = settings.dimensionArrowStyle || 'slash';
  drawStandardTerminator(ctx, dimX, minY, Math.PI / 2, style);
  drawStandardTerminator(ctx, dimX, maxY, -Math.PI / 2, style);

  // Endpoint FROM / TO drafting tags near witness lines
  if (obj.fromLabel || obj.toLabel) {
    ctx.save();
    ctx.font = 'bold 7.5px monospace';
    ctx.fillStyle = '#94a3b8';
    if (obj.fromLabel) {
      ctx.textAlign = 'left';
      ctx.fillText(`FROM: ${obj.fromLabel}`, dimX + 6, minY + 3);
    }
    if (obj.toLabel) {
      ctx.textAlign = 'left';
      ctx.fillText(`TO: ${obj.toLabel}`, dimX + 6, maxY - 3);
    }
    ctx.restore();
  }

  // Measurement Badge (rotated vertically)
  drawDimensionBadge({
    ctx,
    obj,
    settings,
    dist,
    nomX: dimX,
    nomY: (minY + maxY) / 2,
    rotation: -Math.PI / 2,
  });
}

export function drawDimensionAligned(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings
) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x2 ?? obj.x + obj.width;
  const y2 = obj.y2 ?? obj.y + obj.height;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;

  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const offset = obj.dimOffset ?? -30;
  const overshoot = offset < 0 ? -5 : 5;
  const gap = offset < 0 ? -3 : 3;

  const d1x = x1 + nx * offset;
  const d1y = y1 + ny * offset;
  const d2x = x2 + nx * offset;
  const d2y = y2 + ny * offset;

  ctx.strokeStyle = obj.stroke || '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  // Witness lines
  ctx.beginPath();
  ctx.moveTo(x1 + nx * gap, y1 + ny * gap);
  ctx.lineTo(d1x + nx * overshoot, d1y + ny * overshoot);
  ctx.moveTo(x2 + nx * gap, y2 + ny * gap);
  ctx.lineTo(d2x + nx * overshoot, d2y + ny * overshoot);
  ctx.stroke();

  // Dimension line
  ctx.beginPath();
  ctx.moveTo(d1x, d1y);
  ctx.lineTo(d2x, d2y);
  ctx.stroke();

  // Terminators
  const style = settings.dimensionArrowStyle || 'slash';
  const angle = Math.atan2(dy, dx);
  drawStandardTerminator(ctx, d1x, d1y, angle, style);
  drawStandardTerminator(ctx, d2x, d2y, angle + Math.PI, style);

  // Readability angle (standard CAD text readability convention)
  let textAngle = angle;
  if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
    textAngle += Math.PI;
  }

  // Measurement Badge
  drawDimensionBadge({
    ctx,
    obj,
    settings,
    dist: len,
    nomX: (d1x + d2x) / 2,
    nomY: (d1y + d2y) / 2,
    rotation: textAngle,
  });
}
