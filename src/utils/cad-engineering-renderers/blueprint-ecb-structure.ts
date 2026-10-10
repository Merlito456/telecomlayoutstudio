import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors } from "./common";

export function renderBlueprintECBAndStructure(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (stencilId === 'mpd') {
    ctx.fillStyle = colors.fill;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, 0, w, h);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(9, h / 2, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.moveTo(9, h / 2 - 4);
    ctx.lineTo(9, h / 2 + 4);
    ctx.stroke();

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = colors.primary;
    ctx.textAlign = 'center';
    ctx.fillText('MPD', w / 2 + 6, h / 2 + 3);
    return true;
  }

  if (stencilId === 'dcpdu') {
    ctx.fillStyle = colors.fill;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, 0, w, h);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(4, h / 2);
    ctx.lineTo(w - 4, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 7.5px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('DCPDU (-48V)', w / 2, h / 2 - 2);
    return true;
  }

  if (stencilId === 'ecb' || stencilId === 'ecb-wall') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(w + 2, 0);
    ctx.stroke();

    [
      { x: -3, y: 0 },
      { x: w - 1, y: 0 },
      { x: -3, y: h - 4 },
      { x: w - 1, y: h - 4 },
    ].forEach((tab) => {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(tab.x, tab.y, 4, 4);
    });

    ctx.fillStyle = colors.fill;
    ctx.fillRect(0, 2, w, h - 4);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, 2, w, h - 4);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(7, (h - 2) / 2, 1.2, 0, Math.PI * 2);
    ctx.arc(w - 7, (h - 2) / 2, 1.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(7, (h - 2) / 2);
    ctx.lineTo(15, (h - 2) / 2 - 5);
    ctx.moveTo(14, (h - 2) / 2);
    ctx.lineTo(w - 7, (h - 2) / 2);
    ctx.stroke();

    ctx.font = 'bold 5.5px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('ECB (WALL)', w / 2, h - 2);
    return true;
  }

  if (stencilId === 'ecb-pole') {
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

    ctx.fillStyle = colors.fill;
    ctx.fillRect(4, 11, w - 8, h - 13);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(4, 11, w - 8, h - 13);

    ctx.beginPath();
    ctx.moveTo(8, 19);
    ctx.lineTo(14, 16);
    ctx.moveTo(13, 19);
    ctx.lineTo(w - 8, 19);
    ctx.stroke();

    ctx.font = 'bold 4.5px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('ECB (POLE)', (w - 4) / 2, h - 2);
    return true;
  }

  if (stencilId === 'power-twopole-structure') {
    const leftColX = 13;
    const rightColX = w - 15;
    [leftColX, rightColX].forEach((cx) => {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(cx - 3.5, 3.5, 7, 7);
      ctx.beginPath();
      ctx.arc(cx, 7, 2.6, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(4, 8, w - 8, 3);
    ctx.strokeRect(4, 24, w - 8, 3);

    ctx.setLineDash([4, 2]);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(0, 0, w, 5);
    ctx.setLineDash([]);

    ctx.fillStyle = colors.fill;
    ctx.fillRect(20, 10, 26, 18);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(20, 10, 26, 18);
    ctx.font = 'bold 5px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('ECB', 33, 21);

    ctx.fillRect(52, 8, 42, 22);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(52, 8, 42, 22);
    ctx.font = 'bold 5px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('ACPDB', 73, 19);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(46, 19);
    ctx.lineTo(52, 19);
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(22, 31);
    ctx.lineTo(w - 22, 31);
    ctx.stroke();
    return true;
  }

  return false;
}
