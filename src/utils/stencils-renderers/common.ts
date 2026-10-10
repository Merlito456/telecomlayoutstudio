import { CADObject, ProjectSettings } from "../../types/cad";

export function drawPhotorealisticCementPad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options?: {
    chamfer?: number;
    showJoints?: boolean;
    anchorBolts?: boolean;
    embossText?: string;
    roundRadius?: number;
  }
): void {
  const r = options?.roundRadius ?? 4;
  const chamfer = options?.chamfer ?? 4;
  const showJoints = options?.showJoints ?? (w > 50 || h > 50);

  // 1. Ambient Occlusion Ground Drop Shadow (Soft, natural ground contact)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = Math.min(Math.max(w * 0.08, 8), 16);
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#9e9e96';
  ctx.beginPath();
  if (r > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.restore();

  // 2. Concrete Base Slab: Warm matte architectural Portland cement gradient
  // Uses authentic earthen-grey tone variations (not metallic blue/slate)
  const concGrad = ctx.createLinearGradient(x, y, x + w * 0.8, y + h);
  concGrad.addColorStop(0, '#c4c4ba');   // Top-left sunlit cured concrete
  concGrad.addColorStop(0.3, '#b8b8ae'); // Natural medium concrete
  concGrad.addColorStop(0.7, '#a6a69c'); // Deep concrete aggregate matrix
  concGrad.addColorStop(1, '#96968c');   // Subtle bottom shade

  ctx.fillStyle = concGrad;
  ctx.beginPath();
  if (r > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  // 3. Realistic Surface Trowel / Broom Finish striations & Aggregate
  ctx.save();
  ctx.beginPath();
  if (r > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  // Subtle broom striations (hairline texturing across the slab)
  ctx.lineWidth = 1;
  const step = 6;
  for (let ly = y + 3; ly < y + h - 3; ly += step) {
    ctx.strokeStyle = (Math.floor(ly / step) % 2 === 0)
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(50, 48, 44, 0.06)';
    ctx.beginPath();
    ctx.moveTo(x + 2, ly);
    ctx.lineTo(x + w - 2, ly);
    ctx.stroke();
  }

  // 4. Micro-Aggregate Stippling (Crushed limestone flecks, river sand grains, basalt specks)
  const dotCount = Math.min(Math.floor((w * h) / 35), 320);
  for (let i = 0; i < dotCount; i++) {
    const rx = x + 3 + (((i * 73 + 17) % 997) / 997) * (w - 6);
    const ry = y + 3 + (((i * 127 + 31) % 991) / 991) * (h - 6);
    const size = (i % 6 === 0) ? 1.4 : (i % 3 === 0) ? 1.0 : 0.6;
    
    if (i % 3 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 250, 0.35)'; // White limestone
    } else if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(60, 56, 50, 0.28)';   // Dark basalt speck
    } else {
      ctx.fillStyle = 'rgba(160, 150, 130, 0.22)'; // Tan sand grain
    }
    ctx.fillRect(rx - size / 2, ry - size / 2, size, size);
  }

  // 5. Tooled Expansion / Contraction Control Joints
  if (showJoints) {
    const cols = w > 140 ? 3 : (w > 50 ? 2 : 1);
    const rows = h > 140 ? 3 : (h > 50 ? 2 : 1);

    for (let c = 1; c < cols; c++) {
      const jx = x + (w * c) / cols;
      ctx.strokeStyle = 'rgba(50, 48, 44, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(jx, y + 2);
      ctx.lineTo(jx, y + h - 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(jx + 1, y + 2);
      ctx.lineTo(jx + 1, y + h - 2);
      ctx.stroke();
    }

    for (let rw = 1; rw < rows; rw++) {
      const jy = y + (h * rw) / rows;
      ctx.strokeStyle = 'rgba(50, 48, 44, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 2, jy);
      ctx.lineTo(x + w - 2, jy);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + 2, jy + 1);
      ctx.lineTo(x + w - 2, jy + 1);
      ctx.stroke();
    }
  }

  // 6. Chamfered Edge Bevel: 45° Formed Edges (Authentic poured edge, not metal angle iron)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + chamfer, y + h - chamfer);
  ctx.lineTo(x + chamfer, y + chamfer);
  ctx.lineTo(x + w - chamfer, y + chamfer);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(50, 48, 44, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + w - chamfer, y + chamfer);
  ctx.lineTo(x + w - chamfer, y + h - chamfer);
  ctx.lineTo(x + chamfer, y + h - chamfer);
  ctx.stroke();

  ctx.restore();

  // 7. Outer Concrete Perimeter Boundary (clean formed edge)
  ctx.strokeStyle = '#7c7c74';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (r > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.stroke();

  // (Protruding side bolts/nails removed for clean flush basepad foundation)

  // 8. Optional subtle embossed drafting watermark (honors showObjectLabels toggle)
  if (options?.embossText && (options as any)?.showLabels !== false) {
    ctx.save();
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = 'rgba(75, 85, 99, 0.45)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.embossText, x + w / 2, y + h - 8);
    ctx.restore();
  }
}

/**
 * Photorealistic 2D Orthographic / Top-Down CAD Stencil Renderer
 * Renders high-fidelity architectural & telecom site infrastructure with
 * metallic sheen, specular reflections, cast shadows, aggregate textures,
 * cooling louvers, and realistic hardware components.
 */
