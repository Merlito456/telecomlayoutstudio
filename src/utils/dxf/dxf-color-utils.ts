import { Point } from '../../types/cad';

export function rgbToACI(r: number, g: number, b: number): number {
  if (r > 180 && g < 100 && b < 100) return 1; // Red
  if (r > 180 && g > 160 && b < 80) return 2;  // Yellow
  if (r < 100 && g > 160 && b < 100) return 3; // Green
  if (r < 100 && g > 160 && b > 180) return 4; // Cyan
  if (r < 100 && g < 120 && b > 180) return 5; // Blue
  if (r > 160 && g < 100 && b > 160) return 6; // Magenta
  if (r > 200 && g > 200 && b > 200) return 7; // White
  if (r < 100 && g < 100 && b < 100) return 8; // Dark Gray
  if (r < 160 && g < 160 && b < 160) return 9; // Light Gray
  if (r > 180 && g > 100 && b < 60) return 30; // Orange / Amber
  return 7;
}

export function hexToACI(hex?: string): number {
  if (!hex || hex === 'transparent') return 7;
  const h = hex.toLowerCase().replace('#', '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return rgbToACI(r, g, b);
  }
  if (h.length >= 6) {
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return rgbToACI(r, g, b);
  }
  return 7;
}

export function sanitizeLayerName(name: string): string {
  return name.replace(/[^A-Za-z0-9_]/g, '_').toUpperCase() || '0';
}

export function rotatePoint(pt: Point, origin: Point, angleDeg: number): Point {
  if (!angleDeg) return pt;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = pt.x - origin.x;
  const dy = pt.y - origin.y;
  return {
    x: origin.x + (dx * cos - dy * sin),
    y: origin.y + (dx * sin + dy * cos),
  };
}
