/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { drawStandardTerminator } from './dimensions-lines';
import { getSafeFontCss } from '../cad-fonts';

export function drawLeaderAnnotation(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  _settings?: ProjectSettings
) {
  const x1 = obj.x; // Arrow tip target
  const y1 = obj.y;
  const x2 = obj.x2 ?? obj.x + 40; // Elbow
  const y2 = obj.y2 ?? obj.y - 30;

  const isLeft = x2 < x1;
  const text = obj.text || 'NOTE / CALLOUT';
  const fontSize = obj.fontSize || 10;
  const family = getSafeFontCss(obj.fontFamily || _settings?.defaultFontFamily);
  ctx.font = `bold ${fontSize}px ${family}`;
  const textMetrics = ctx.measureText(text);
  const shelfLen = Math.max(36, textMetrics.width + 12);
  const x3 = isLeft ? x2 - shelfLen : x2 + shelfLen;
  const y3 = y2;

  ctx.strokeStyle = obj.stroke || '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  // Draw arrow pointer line + horizontal shelf
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.stroke();

  // Solid filled arrowhead at pointer tip
  const angle = Math.atan2(y2 - y1, x2 - x1);
  drawStandardTerminator(ctx, x1, y1, angle + Math.PI, 'arrow');

  // Annotation text above shelf
  ctx.fillStyle = obj.textColor || '#ffffff';
  ctx.textAlign = isLeft ? 'right' : 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, isLeft ? x2 - 4 : x2 + 4, y3 - 3);
}

export function drawLevelElevationBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  isDug: boolean
) {
  ctx.save();
  ctx.font = 'bold 9px monospace';
  const metrics = ctx.measureText(text);
  const padX = 8;
  const badgeW = metrics.width + padX * 2;
  const badgeH = 18;
  const rx = centerX - badgeW / 2;
  const ry = centerY - badgeH / 2;

  ctx.fillStyle = isDug ? 'rgba(12, 74, 110, 0.95)' : 'rgba(69, 26, 3, 0.95)';
  ctx.strokeStyle = isDug ? '#38bdf8' : '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(rx, ry, badgeW, badgeH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isDug ? '#38bdf8' : '#fbbf24';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX, centerY);
  ctx.restore();
}
