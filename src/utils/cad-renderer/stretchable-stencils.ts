import { CADObject, ProjectSettings } from '../../types/cad';
import { drawPhotorealisticCementPad } from '../cad-stencils-renderer';

export function renderStretchableStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings
) {
  const w = obj.width;
  const h = obj.height;
  const stencilId = obj.stencilId;
  const dColor = obj.draftingColor || obj.stroke;

  if (stencilId === 'cable-tray') {
    // Twin rails
    ctx.strokeStyle = dColor || '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    // Dynamically spaced rungs every 10px
    const rungStep = 10;
    const numRungs = Math.floor(w / rungStep);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = dColor || '#94a3b8';
    ctx.beginPath();
    for (let i = 1; i < numRungs; i++) {
      const rx = i * rungStep;
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, h);
    }
    ctx.stroke();
    return;
  }

  if (stencilId === 'cement-fence') {
    // Outer wall
    ctx.fillStyle = obj.fill || '#334155';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = dColor || '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Centerline
    ctx.strokeStyle = dColor || '#64748b';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Expansion joints every 60px
    ctx.strokeStyle = dColor || '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 60; px < w - 20; px += 60) {
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
    }
    ctx.stroke();

    // End caps
    ctx.fillStyle = dColor || '#475569';
    ctx.fillRect(-4, -2, 10, h + 4);
    ctx.strokeRect(-4, -2, 10, h + 4);
    ctx.fillRect(w - 6, -2, 10, h + 4);
    ctx.strokeRect(w - 6, -2, 10, h + 4);
    return;
  }

  if (stencilId === 'boundary-fence') {
    ctx.strokeStyle = dColor || '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.strokeStyle = dColor || '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 10; px < w; px += 20) {
      ctx.moveTo(px, 0);
      ctx.lineTo(px + 8, h);
    }
    ctx.stroke();
    return;
  }

  if (stencilId === 'wall') {
    ctx.fillStyle = obj.fill || '#7f1d1d';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = dColor || '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Horizontal course
    ctx.strokeStyle = dColor || '#b91c1c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Staggered vertical joints
    ctx.beginPath();
    for (let px = 20; px < w; px += 30) {
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h / 2);
      ctx.moveTo(px + 15, h / 2);
      ctx.lineTo(px + 15, h);
    }
    ctx.stroke();
    return;
  }

  // Basepads (Cement, Gen, TX, AC) - authentic poured cement finish
  drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
    chamfer: 4,
    showJoints: true,
    anchorBolts: false,
    embossText: 'CEMENT BASEPAD',
    showLabels: settings.showObjectLabels !== false,
  } as any);
}
