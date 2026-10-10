import { CADObject, ProjectSettings } from '../../types/cad';
import { getSafeFontCss } from '../cad-fonts';

export function drawCADText(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings?: ProjectSettings,
  allObjects?: CADObject[]
) {
  if (settings?.showObjectLabels === false && (obj.isStencilLabel || !!obj.parentId)) {
    return;
  }
  const fontStyle = obj.italic ? 'italic ' : '';
  const fontWeight = obj.bold ? 'bold ' : 'normal ';
  const fontSize = obj.fontSize || 12;
  const family = getSafeFontCss(obj.fontFamily || settings?.defaultFontFamily);
  ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${family}`;

  const text = obj.text || '';
  const metrics = ctx.measureText(text);
  const isCompactChip = obj.isStencilLabel || !!obj.parentId;
  const textW = isCompactChip
    ? metrics.width + 16
    : Math.max(metrics.width + 12, Math.min(obj.width || 40, 160));
  const textH = isCompactChip
    ? Math.max(fontSize + 6, 18)
    : Math.max(fontSize * 1.5, Math.min(obj.height || 20, 32));

  // If this is an attached stencil label and has been moved away from its parent, draw a drafting connector line
  if (allObjects && obj.parentId && isCompactChip) {
    const parent = allObjects.find((o) => o.id === obj.parentId);
    if (parent) {
      const pcx = parent.x + parent.width / 2;
      const pcy = parent.y + parent.height / 2;
      const lcx = obj.x + textW / 2;
      const lcy = obj.y + textH / 2;
      const dist = Math.hypot(lcx - pcx, lcy - pcy);
      if (dist > Math.max(parent.width, parent.height) / 2 + 15) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(pcx, pcy);
        ctx.lineTo(lcx, lcy);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // Background Badge Chip
  if (obj.fillEnabled && obj.bgColor && obj.bgColor !== 'transparent') {
    ctx.fillStyle = obj.bgColor;
    ctx.beginPath();
    const r = 4;
    ctx.roundRect(obj.x, obj.y, textW, textH, r);
    ctx.fill();

    if (obj.stroke && obj.stroke !== 'transparent') {
      ctx.strokeStyle = obj.stroke;
      ctx.lineWidth = obj.strokeWidth || 1;
      ctx.stroke();
    }
  }

  // Text Fill
  ctx.fillStyle = obj.textColor || '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, obj.x + textW / 2, obj.y + textH / 2);
}
