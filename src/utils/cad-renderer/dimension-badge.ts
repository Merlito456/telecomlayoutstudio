/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { formatMeasurement } from '../cad-geometry';
import { getSafeFontCss } from '../cad-fonts';

export interface DimensionBadgeParams {
  ctx: CanvasRenderingContext2D;
  obj: CADObject;
  settings: ProjectSettings;
  dist: number;
  nomX: number;
  nomY: number;
  rotation?: number;
}

export function drawDimensionBadge(params: DimensionBadgeParams): void {
  const { ctx, obj, settings, dist, nomX, nomY, rotation = 0 } = params;

  const measText = formatMeasurement(dist, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
  const fromToStr = obj.fromLabel && obj.toLabel ? `FROM ${obj.fromLabel} ➔ TO ${obj.toLabel}` : '';
  const family = getSafeFontCss(obj.fontFamily || settings?.defaultFontFamily);

  ctx.font = `bold 10px ${family}`;
  const tw = ctx.measureText(measText).width;
  ctx.font = `bold 7.5px ${family}`;
  const subTw = fromToStr ? ctx.measureText(fromToStr).width : 0;
  const badgeW = Math.max(tw, subTw) + 12;
  const badgeH = fromToStr ? 24 : 14;

  const offX = obj.labelOffsetX ?? obj.customProps?.labelOffsetX ?? 0;
  const offY = obj.labelOffsetY ?? obj.customProps?.labelOffsetY ?? 0;
  const midX = nomX + offX;
  const badgeY = nomY + offY;

  // Draw connecting leader if dragged away from nominal dimension line
  if (Math.hypot(offX, offY) > 8) {
    ctx.save();
    ctx.strokeStyle = obj.stroke || '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(nomX, nomY);
    ctx.lineTo(midX, badgeY);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(midX, badgeY);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = obj.stroke || '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (fromToStr) {
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText(measText, 0, -5);
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(fromToStr, 0, 6);
  } else {
    ctx.font = 'bold 10px monospace';
    ctx.fillText(measText, 0, 0);
  }
  ctx.restore();
}
