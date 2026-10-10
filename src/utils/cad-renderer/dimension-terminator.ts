/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function drawStandardTerminator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  style: 'slash' | 'arrow' | 'dot'
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  if (style === 'slash') {
    // 45 degree architectural slash
    const len = 6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-len * 0.707, -len * 0.707);
    ctx.lineTo(len * 0.707, len * 0.707);
    ctx.stroke();
  } else if (style === 'arrow') {
    // Standard ISO 3:1 filled arrowhead
    const arrowLen = 9;
    const arrowW = 3;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowLen, -arrowW);
    ctx.lineTo(-arrowLen, arrowW);
    ctx.closePath();
    ctx.fill();
  } else if (style === 'dot') {
    // Standard datum dot
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
