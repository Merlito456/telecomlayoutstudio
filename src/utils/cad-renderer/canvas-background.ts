import { BackgroundImageConfig, ProjectSettings, ViewportState } from "../../types/cad";

function drawGrid(
  ctx: CanvasRenderingContext2D,
  settings: ProjectSettings,
  viewport: ViewportState,
  isExport?: boolean
) {
  ctx.save();
  const step = settings.gridSize;
  const majorStep = step * 5;
  const w = settings.canvasWidth;
  const h = settings.canvasHeight;

  ctx.lineWidth = 1 / viewport.zoom;

  // Minor grid lines
  const isWhite = settings.cadTheme === 'white';
  const isBlueprint = settings.cadTheme === 'blueprint';

  ctx.beginPath();
  ctx.strokeStyle = isWhite
    ? 'rgba(226, 232, 240, 0.8)'
    : isBlueprint
    ? 'rgba(125, 211, 252, 0.15)'
    : isExport
    ? 'rgba(0,0,0,0.05)'
    : 'rgba(51, 65, 85, 0.4)';
  for (let x = 0; x <= w; x += step) {
    if (x % majorStep === 0) continue;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += step) {
    if (y % majorStep === 0) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Major grid lines
  ctx.beginPath();
  ctx.strokeStyle = isWhite
    ? 'rgba(203, 213, 225, 0.9)'
    : isBlueprint
    ? 'rgba(125, 211, 252, 0.35)'
    : isExport
    ? 'rgba(0,0,0,0.1)'
    : 'rgba(71, 85, 105, 0.7)';
  for (let x = 0; x <= w; x += majorStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += majorStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  ctx.restore();
}

const imageCache = new Map<string, HTMLImageElement>();

function drawBackgroundImage(ctx: CanvasRenderingContext2D, bg: BackgroundImageConfig) {
  let img = imageCache.get(bg.dataUrl);
  if (!img) {
    img = new Image();
    img.src = bg.dataUrl;
    imageCache.set(bg.dataUrl, img);
  }

  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = bg.opacity;
    ctx.drawImage(img, bg.x, bg.y, bg.width, bg.height);
    ctx.restore();
  }
}


export { drawGrid, drawBackgroundImage };
