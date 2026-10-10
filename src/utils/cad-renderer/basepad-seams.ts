import { CADObject, ProjectSettings } from '../../types/cad';
import { getObjectBounds } from '../cad-geometry';

export function renderMergedBasepadsSeams(
  ctx: CanvasRenderingContext2D,
  objects: CADObject[],
  settings: ProjectSettings
) {
  const isBasepad = (o: CADObject) => {
    const s = o.stencilId || o.customProps?.stencilType;
    return (
      s === 'cement-basepad' ||
      s === 'gen-basepad' ||
      s === 'tx-basepad' ||
      s === 'ac-basepad' ||
      s === 'cement-slab' ||
      (s && s.includes('basepad'))
    );
  };

  const pads = objects.filter(isBasepad);
  if (pads.length < 2) return;

  const isPhoto = settings.renderStyle === 'photo';
  const seamColor = isPhoto ? '#b8b8ae' : (settings.cadTheme === 'white' ? '#f1f5f9' : '#1e293b');

  for (let i = 0; i < pads.length; i++) {
    const a = pads[i];
    const bA = getObjectBounds(a);

    for (let j = i + 1; j < pads.length; j++) {
      const b = pads[j];
      const bB = getObjectBounds(b);

      // Check if touching along X (vertical seam)
      const touchX =
        (Math.abs(bA.maxX - bB.minX) <= 6 && bA.maxY > bB.minY && bA.minY < bB.maxY) ||
        (Math.abs(bB.maxX - bA.minX) <= 6 && bB.maxY > bA.minY && bB.minY < bA.maxY);

      if (touchX) {
        const seamX = Math.abs(bA.maxX - bB.minX) <= 6 ? bA.maxX : bB.maxX;
        const overlapY1 = Math.max(bA.minY, bB.minY);
        const overlapY2 = Math.min(bA.maxY, bB.maxY);
        if (overlapY2 - overlapY1 > 4) {
          ctx.save();
          ctx.fillStyle = seamColor;
          ctx.fillRect(seamX - 4, overlapY1 + 1, 8, overlapY2 - overlapY1 - 2);
          ctx.strokeStyle = isPhoto ? 'rgba(50, 48, 44, 0.45)' : '#475569';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(seamX, overlapY1 + 3);
          ctx.lineTo(seamX, overlapY2 - 3);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Check if touching along Y (horizontal seam)
      const touchY =
        (Math.abs(bA.maxY - bB.minY) <= 6 && bA.maxX > bB.minX && bA.minX < bB.maxX) ||
        (Math.abs(bB.maxY - bA.minY) <= 6 && bB.maxY > bA.minY && bB.minY < bA.maxX);

      if (touchY) {
        const seamY = Math.abs(bA.maxY - bB.minY) <= 6 ? bA.maxY : bB.maxY;
        const overlapX1 = Math.max(bA.minX, bB.minX);
        const overlapX2 = Math.min(bA.maxX, bB.maxX);
        if (overlapX2 - overlapX1 > 4) {
          ctx.save();
          ctx.fillStyle = seamColor;
          ctx.fillRect(overlapX1 + 1, seamY - 4, overlapX2 - overlapX1 - 2, 8);
          ctx.strokeStyle = isPhoto ? 'rgba(50, 48, 44, 0.45)' : '#475569';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(overlapX1 + 3, seamY);
          ctx.lineTo(overlapX2 - 3, seamY);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
}

export function renderMergedExcavatedSeams(
  _ctx: CanvasRenderingContext2D,
  _objects: CADObject[],
  _settings: ProjectSettings
) {
  // Excavated areas are not displayed in the 2D Drafting (CAD) canvas
  return;
}
