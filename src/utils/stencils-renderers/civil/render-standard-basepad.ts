import { CADObject, ProjectSettings } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderStandardBasepad(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  const isGen = stencilId === 'gen-basepad';
  const isTx = stencilId === 'tx-basepad';
  const isAc = stencilId === 'ac-basepad';
  const isSlab = stencilId === 'cement-slab';
  
  const padH = obj.basepadHeight ?? obj.customProps?.basepadHeight ?? 150;
  const elevMStr = (padH / 1000).toFixed(2);
  const tag = isGen 
    ? `GEN BASEPAD (+${elevMStr}m TOC)` 
    : isTx 
    ? `TX BASEPAD (+${elevMStr}m TOC)` 
    : isAc 
    ? `AC PAD (+${elevMStr}m TOC)` 
    : isSlab 
    ? `CEMENT SLAB (+${elevMStr}m TOC)` 
    : `CEMENT BASEPAD (+${elevMStr}m TOC)`;

  drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
    chamfer: 4,
    showJoints: true,
    anchorBolts: isGen || isTx || isAc,
    embossText: tag,
  });

  // Technical Foundation Height / TOC Stamp Badge in Corner
  if (w >= 40 && h >= 25) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    const stampText = `+${padH}mm TOC`;
    ctx.font = 'bold 8.5px monospace';
    const tw = ctx.measureText(stampText).width;
    const stampW = tw + 8;
    const stampH = 14;
    const stampX = Math.max(4, w - stampW - 6);
    const stampY = 5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(stampX, stampY, stampW, stampH, 3) : ctx.rect(stampX, stampY, stampW, stampH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.fillText(stampText, stampX + 4, stampY + 10);
    ctx.restore();
  }

  return true;
}
