import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors } from "./common";

export function renderBlueprintACPDB(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (stencilId === 'acpdb-wall' || stencilId === 'acpdb') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(w + 2, 0);
    ctx.stroke();

    ctx.fillStyle = colors.fill;
    ctx.fillRect(0, 2, w, h - 4);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, 2, w, h - 4);

    const bSize = Math.max(3, Math.min(8, Math.min(w * 0.25, (h - 4) * 0.6)));
    ctx.strokeRect(w * 0.1, 4, bSize, bSize);
    ctx.strokeRect(w * 0.42, 4, Math.max(4, w * 0.25), Math.max(3, bSize * 0.8));
    ctx.strokeRect(w * 0.74, 4, Math.max(3, w * 0.18), Math.max(3, bSize * 0.8));

    if (h >= 12) {
      ctx.font = 'bold 4px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText('ACPDB', w / 2, h - 2);
    }
    return true;
  }

  if (stencilId === 'acpdb-dual') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(w + 2, 0);
    ctx.stroke();

    const singleW = (w - 3) / 2;
    [0, singleW + 3].forEach((bx, idx) => {
      ctx.fillStyle = colors.fill;
      ctx.fillRect(bx, 2, singleW, h - 4);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(bx, 2, singleW, h - 4);

      ctx.strokeRect(bx + 1.5, 4, 3, 3);
      ctx.strokeRect(bx + singleW * 0.45, 4, Math.max(3, singleW * 0.4), 2.5);

      ctx.font = 'bold 3px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText(idx === 0 ? 'MAINS' : 'DG', bx + singleW / 2, h - 2);
    });

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(singleW, h / 2);
    ctx.lineTo(singleW + 3, h / 2);
    ctx.stroke();
    return true;
  }

  if (stencilId === 'acpdb-pole') {
    ctx.fillStyle = colors.fill;
    ctx.beginPath();
    ctx.arc(w / 2, 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = 'bold 4px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('P', w / 2, 6.5);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(w / 2 - 4.5, 4, 9, 2);

    ctx.strokeRect(4, 9, w - 8, 2);
    ctx.strokeRect(2.5, 10, w - 5, 2);

    ctx.fillStyle = colors.fill;
    ctx.fillRect(4, 11, w - 8, h - 13);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(4, 11, w - 8, h - 13);

    ctx.strokeRect(w * 0.58, 17, 3, 2);

    ctx.font = 'bold 4.5px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('ACPDB (POLE)', (w - 4) / 2, h - 2.5);
    return true;
  }

  return false;
}
