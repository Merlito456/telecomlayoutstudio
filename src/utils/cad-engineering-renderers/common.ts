import { ProjectSettings } from "../../types/cad";

export interface CADThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  fill: string;
  fillLight: string;
  hatch: string;
  text: string;
  centerline: string;
  concrete: string;
  steel: string;
}

export function getCADThemeColors(
  settings: ProjectSettings,
  draftingColor?: string,
  draftingFill?: string
): CADThemeColors {
  const isWhite = settings.cadTheme === 'white';
  const isBlueprint = settings.cadTheme === 'blueprint';

  const hasCustomDraftingColor = !!draftingColor && draftingColor !== 'transparent';
  const hasCustomFill = !!draftingFill && draftingFill !== 'transparent';

  if (isWhite) {
    const primary = hasCustomDraftingColor ? draftingColor : '#0f172a';
    const steel = hasCustomDraftingColor ? draftingColor : '#0f172a';
    const text = hasCustomDraftingColor ? draftingColor : '#0f172a';
    const secondary = hasCustomDraftingColor ? draftingColor : '#334155';
    const accent = hasCustomDraftingColor ? draftingColor : '#0284c7';
    const fill = hasCustomFill ? draftingFill : 'rgba(241, 245, 249, 0.95)';
    const fillLight = hasCustomFill ? draftingFill : 'rgba(248, 250, 252, 0.9)';

    return {
      primary,
      secondary,
      accent,
      fill,
      fillLight,
      hatch: '#94a3b8',
      text,
      centerline: '#ef4444', // Red centerlines
      concrete: '#cbd5e1',
      steel,
    };
  }

  if (isBlueprint) {
    const primary = hasCustomDraftingColor ? draftingColor : '#ffffff';
    const steel = hasCustomDraftingColor ? draftingColor : '#ffffff';
    const text = hasCustomDraftingColor ? draftingColor : '#ffffff';
    const secondary = hasCustomDraftingColor ? draftingColor : '#7dd3fc';
    const accent = hasCustomDraftingColor ? draftingColor : '#38bdf8';
    const fill = hasCustomFill ? draftingFill : 'rgba(12, 37, 64, 0.95)';
    const fillLight = hasCustomFill ? draftingFill : 'rgba(14, 46, 80, 0.85)';

    return {
      primary,
      secondary,
      accent,
      fill,
      fillLight,
      hatch: 'rgba(125, 211, 252, 0.3)',
      text,
      centerline: '#facc15',
      concrete: 'rgba(125, 211, 252, 0.2)',
      steel,
    };
  }

  // Default: Dark CAD Blueprint (modern AutoCAD/Civil 3D dark workspace)
  const primary = hasCustomDraftingColor ? draftingColor : '#f8fafc';
  const steel = hasCustomDraftingColor ? draftingColor : '#cbd5e1';
  const text = hasCustomDraftingColor ? draftingColor : '#38bdf8';
  const secondary = hasCustomDraftingColor ? draftingColor : '#94a3b8';
  const accent = hasCustomDraftingColor ? draftingColor : '#38bdf8';
  const fill = hasCustomFill ? draftingFill : 'rgba(15, 23, 42, 0.95)';
  const fillLight = hasCustomFill ? draftingFill : 'rgba(30, 41, 59, 0.8)';

  return {
    primary,
    secondary,
    accent,
    fill,
    fillLight,
    hatch: 'rgba(148, 163, 184, 0.25)',
    text,
    centerline: '#ef4444',
    concrete: 'rgba(51, 65, 85, 0.6)',
    steel,
  };
}

/**
 * Standard Engineering Centerline Crosshair (⊕)
 */
export function drawCADCenterCrosshair(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color = '#ef4444',
  lineWidth = 1
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([8, 2, 2, 2]);

  ctx.beginPath();
  ctx.moveTo(cx - r - 6, cy);
  ctx.lineTo(cx + r + 6, cy);
  ctx.moveTo(cx, cy - r - 6);
  ctx.lineTo(cx, cy + r + 6);
  ctx.stroke();

  // Solid center tick
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Standard Concrete Hatch (Triangles & Micro-stipples)
 */
export function drawCADConcreteHatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = 'rgba(148, 163, 184, 0.35)'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 0.8;

  // Stipples and small aggregate triangles
  const count = Math.min(Math.floor((w * h) / 120), 80);
  for (let i = 0; i < count; i++) {
    const rx = x + 3 + (((i * 73 + 17) % 997) / 997) * (w - 6);
    const ry = y + 3 + (((i * 127 + 31) % 991) / 991) * (h - 6);

    if (i % 3 === 0) {
      // Tiny aggregate triangle
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 2.5, ry + 2);
      ctx.lineTo(rx - 1, ry + 3);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Stipple speck
      ctx.fillRect(rx, ry, 1, 1);
    }
  }
  ctx.restore();
}

/**
 * Standard ANSI 31 Diagonal 45° Hatching
 */
export function drawCADDiagonalHatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing = 8,
  color = 'rgba(148, 163, 184, 0.3)'
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.beginPath();

  const total = w + h;
  for (let offset = -h; offset <= total; offset += spacing) {
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x + offset + h, y + h);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Main Engineering Drawing Stencils Renderer
 * Returns true if the stencil was rendered as a standard engineering drawing symbol.
 */
