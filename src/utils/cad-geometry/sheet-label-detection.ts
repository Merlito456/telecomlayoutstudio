import { Point, ProjectSettings } from '../../types/cad';
import { HoveredTextLabelResult } from './label-types';

export function findHoveredSheetElement(
  p: Point,
  settings: ProjectSettings
): HoveredTextLabelResult | null {
  // North Arrow
  if (settings.showNorthArrow) {
    const nx = settings.northArrowPos?.x ?? (settings.canvasWidth - 60);
    const ny = settings.northArrowPos?.y ?? 60;
    if (Math.hypot(p.x - nx, p.y - ny) <= 28) {
      return {
        objId: 'sheet-north',
        field: 'sheetNorth',
        currentText: 'North Arrow',
        centerWorld: { x: nx, y: ny },
        bounds: {
          minX: nx - 28,
          maxX: nx + 28,
          minY: ny - 28,
          maxY: ny + 28,
          width: 56,
          height: 56,
          centerX: nx,
          centerY: ny,
        },
      };
    }
  }

  // Telecom Legend Box
  if (settings.showLegend) {
    const lx = settings.legendPos?.x ?? 32;
    const ly = settings.legendPos?.y ?? 32;
    if (p.x >= lx && p.x <= lx + 180 && p.y >= ly && p.y <= ly + 180) {
      return {
        objId: 'sheet-legend',
        field: 'sheetLegend',
        currentText: 'Telecom Symbol Legend',
        centerWorld: { x: lx + 90, y: ly + 90 },
        bounds: {
          minX: lx,
          maxX: lx + 180,
          minY: ly,
          maxY: ly + 180,
          width: 180,
          height: 180,
          centerX: lx + 90,
          centerY: ly + 90,
        },
      };
    }
  }

  // Graphic Scale Bar
  if (settings.showScaleBar) {
    const sf = settings.scaleFactor || 20;
    const sx = settings.scaleBarPos?.x ?? 32;
    const sy = settings.scaleBarPos?.y ?? (settings.canvasHeight - 32);
    const totalW = sf * 10 + 36;
    if (p.x >= sx - 6 && p.x <= sx + totalW && p.y >= sy - 24 && p.y <= sy + 18) {
      return {
        objId: 'sheet-scale',
        field: 'sheetScale',
        currentText: `Graphic Scale (1${settings.unit} = ${sf}px)`,
        centerWorld: { x: sx + totalW / 2, y: sy },
        bounds: {
          minX: sx - 6,
          maxX: sx + totalW,
          minY: sy - 24,
          maxY: sy + 18,
          width: totalW + 6,
          height: 42,
          centerX: sx + totalW / 2,
          centerY: sy,
        },
      };
    }
  }

  // Drawing Sheet Title Block
  if (settings.showTitleBlock) {
    const tbW = 320;
    const tbH = 110;
    const tx = settings.titleBlockPos?.x ?? (settings.canvasWidth - 20 - tbW);
    const ty = settings.titleBlockPos?.y ?? (settings.canvasHeight - 20 - tbH);
    if (p.x >= tx && p.x <= tx + tbW && p.y >= ty && p.y <= ty + tbH) {
      return {
        objId: 'sheet-title',
        field: 'sheetTitle',
        currentText: settings.fileName || 'Title Block',
        centerWorld: { x: tx + tbW / 2, y: ty + tbH / 2 },
        bounds: {
          minX: tx,
          maxX: tx + tbW,
          minY: ty,
          maxY: ty + tbH,
          width: tbW,
          height: tbH,
          centerX: tx + tbW / 2,
          centerY: ty + tbH / 2,
        },
      };
    }
  }

  return null;
}
