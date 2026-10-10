import { CADObject, Point, ProjectSettings } from '../../types/cad';
import { HoveredTextLabelResult } from './label-types';

export function findHoveredDimensionLabel(
  p: Point,
  obj: CADObject
): HoveredTextLabelResult | null {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x2 ?? obj.x;
  const y2 = obj.y2 ?? obj.y;
  const offset = obj.dimOffset ?? (obj.type === 'dim-v' ? 30 : -30);
  const offX = obj.labelOffsetX ?? obj.customProps?.labelOffsetX ?? 0;
  const offY = obj.labelOffsetY ?? obj.customProps?.labelOffsetY ?? 0;

  if (obj.type === 'dim-h') {
    const dimY = Math.min(y1, y2) + offset + offY;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const midX = (minX + maxX) / 2 + offX;

    if (Math.abs(p.x - midX) <= 65 && Math.abs(p.y - dimY) <= 18) {
      return {
        objId: obj.id,
        field: 'dimText',
        currentText: obj.fromLabel && obj.toLabel ? `${obj.fromLabel} ➔ ${obj.toLabel}` : (obj.fromLabel || obj.toLabel || 'Dimension Label'),
        centerWorld: { x: midX, y: dimY },
        bounds: {
          minX: midX - 65,
          maxX: midX + 65,
          minY: dimY - 18,
          maxY: dimY + 18,
          width: 130,
          height: 36,
          centerX: midX,
          centerY: dimY,
        },
      };
    }
  } else if (obj.type === 'dim-v') {
    const dimX = Math.max(x1, x2) + offset + offX;
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const midY = (minY + maxY) / 2 + offY;

    if (Math.abs(p.x - dimX) <= 30 && Math.abs(p.y - midY) <= 50) {
      return {
        objId: obj.id,
        field: 'dimText',
        currentText: obj.fromLabel && obj.toLabel ? `${obj.fromLabel} ➔ ${obj.toLabel}` : (obj.fromLabel || obj.toLabel || 'Dimension Label'),
        centerWorld: { x: dimX, y: midY },
        bounds: {
          minX: dimX - 30,
          maxX: dimX + 30,
          minY: midY - 50,
          maxY: midY + 50,
          width: 60,
          height: 100,
          centerX: dimX,
          centerY: midY,
        },
      };
    }
  } else if (obj.type === 'dim-aligned') {
    const midX = (x1 + x2) / 2 + offX;
    const midY = (y1 + y2) / 2 + offY;
    if (Math.hypot(p.x - midX, p.y - midY) <= 45) {
      return {
        objId: obj.id,
        field: 'dimText',
        currentText: obj.fromLabel && obj.toLabel ? `${obj.fromLabel} ➔ ${obj.toLabel}` : (obj.fromLabel || obj.toLabel || 'Dimension Label'),
        centerWorld: { x: midX, y: midY },
        bounds: {
          minX: midX - 50,
          maxX: midX + 50,
          minY: midY - 20,
          maxY: midY + 20,
          width: 100,
          height: 40,
          centerX: midX,
          centerY: midY,
        },
      };
    }
  }

  return null;
}

export function findHoveredEquipmentBadge(
  p: Point,
  obj: CADObject,
  settings: ProjectSettings
): HoveredTextLabelResult | null {
  // Elevation badge
  const levelM = obj.levelElevationM ?? obj.customProps?.levelElevationM;
  if (levelM !== undefined && levelM !== 0 && (obj.type === 'rectangle' || obj.type === 'stencil-group')) {
    const eOffX = obj.elevBadgeOffsetX ?? obj.customProps?.elevBadgeOffsetX ?? 0;
    const eOffY = obj.elevBadgeOffsetY ?? obj.customProps?.elevBadgeOffsetY ?? 0;
    const ecX = obj.x + obj.width / 2 + eOffX;
    const ecY = obj.y - 10 + eOffY;
    if (Math.abs(p.x - ecX) <= 65 && Math.abs(p.y - ecY) <= 14) {
      return {
        objId: obj.id,
        field: 'elevBadge',
        currentText: `EL: ${levelM > 0 ? '+' : ''}${levelM.toFixed(2)}m`,
        centerWorld: { x: ecX, y: ecY },
        bounds: {
          minX: ecX - 65,
          maxX: ecX + 65,
          minY: ecY - 14,
          maxY: ecY + 14,
          width: 130,
          height: 28,
          centerX: ecX,
          centerY: ecY,
        },
      };
    }
  }

  // Measurement tag
  if (!obj.isStencilLabel && obj.type !== 'text' && obj.type !== 'dim-h' && obj.type !== 'dim-v' && obj.type !== 'dim-aligned' && obj.type !== 'leader') {
    const mOffX = obj.measBadgeOffsetX ?? obj.customProps?.measBadgeOffsetX ?? 0;
    const mOffY = obj.measBadgeOffsetY ?? obj.customProps?.measBadgeOffsetY ?? 0;
    let tagX = 0;
    let tagY = 0;
    let validTag = false;

    if (obj.type === 'rectangle' || obj.type === 'stencil-group') {
      if (obj.width >= 24 && obj.height >= 16) {
        tagX = obj.x + obj.width / 2 + mOffX;
        tagY = obj.y + obj.height + 10 + mOffY;
        validTag = true;
      }
    } else if (obj.type === 'circle') {
      tagX = obj.x + obj.width / 2 + mOffX;
      tagY = obj.y + obj.height + 10 + mOffY;
      validTag = true;
    } else if (obj.type === 'line') {
      const x2 = obj.x2 ?? obj.x + obj.width;
      const y2 = obj.y2 ?? obj.y + obj.height;
      tagX = (obj.x + x2) / 2 + mOffX;
      tagY = (obj.y + y2) / 2 + mOffY;
      validTag = true;
    }

    if (validTag && Math.abs(p.x - tagX) <= 45 && Math.abs(p.y - tagY) <= 14) {
      return {
        objId: obj.id,
        field: 'measBadge',
        currentText: 'Measurement Badge',
        centerWorld: { x: tagX, y: tagY },
        bounds: {
          minX: tagX - 45,
          maxX: tagX + 45,
          minY: tagY - 14,
          maxY: tagY + 14,
          width: 90,
          height: 28,
          centerX: tagX,
          centerY: tagY,
        },
      };
    }
  }

  return null;
}
