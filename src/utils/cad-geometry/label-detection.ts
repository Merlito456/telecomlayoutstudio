import { CADObject, Point, ProjectSettings } from "../../types/cad";
import { getObjectBounds, isPointInObject } from "./bounds-handles";
import { HoveredLabelField, HoveredTextLabelResult } from "./label-types";
import { findHoveredSheetElement } from "./sheet-label-detection";
import { findHoveredDimensionLabel, findHoveredEquipmentBadge } from "./badge-label-detection";

export { type HoveredLabelField, type HoveredTextLabelResult };

/**
 * Checks if a world coordinate point is hovering directly over any object's editable text or label
 * (Only applicable if object labels are toggled on in settings)
 */
export function findHoveredTextLabel(
  p: Point,
  objects: CADObject[],
  settingsOrShowLabels: ProjectSettings | boolean
): HoveredTextLabelResult | null {
  // If labels are toggled off, only standalone text objects are editable
  const showLabels = typeof settingsOrShowLabels === 'boolean'
    ? settingsOrShowLabels
    : settingsOrShowLabels.showObjectLabels !== false;

  const settings = typeof settingsOrShowLabels === 'object' ? settingsOrShowLabels : null;

  // 0. Sheet Elements (North Arrow, Legend, Scale Bar, Title Block)
  if (settings) {
    const sheetHit = findHoveredSheetElement(p, settings);
    if (sheetHit) return sheetHit;
  }

  // Never hijack hover/clicks when cursor is directly on a cable/wire line or polyline
  for (const o of objects) {
    if ((o.type === 'line' || o.type === 'polyline' || o.type === 'pen') && isPointInObject(p, o, 10)) {
      return null;
    }
  }

  // Search in reverse order (top-most objects tested first)
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    const s = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
    if (s.includes('excavat')) continue;

    // 1. Standalone Text Object
    if (obj.type === 'text') {
      const b = getObjectBounds(obj);
      if (p.x >= b.minX - 4 && p.x <= b.maxX + 4 && p.y >= b.minY - 4 && p.y <= b.maxY + 4) {
        return {
          objId: obj.id,
          field: 'text',
          currentText: obj.text || '',
          centerWorld: { x: b.centerX, y: b.centerY },
          bounds: b,
        };
      }
    }

    // 2. Leader / Note Callout Text and Arrow Tip
    if (obj.type === 'leader') {
      const tipDist = Math.hypot(p.x - obj.x, p.y - obj.y);
      if (tipDist <= 10) {
        return {
          objId: obj.id,
          field: 'leaderTip',
          currentText: 'Pointer Tip',
          centerWorld: { x: obj.x, y: obj.y },
          bounds: {
            minX: obj.x - 10,
            maxX: obj.x + 10,
            minY: obj.y - 10,
            maxY: obj.y + 10,
            width: 20,
            height: 20,
            centerX: obj.x,
            centerY: obj.y,
          },
        };
      }

      if (showLabels) {
        const x1 = obj.x;
        const x2 = obj.x2 ?? obj.x + 40;
        const y2 = obj.y2 ?? obj.y - 30;
        const isLeft = x2 < x1;
        const textLen = (obj.text || 'CALLOUT').length;
        const shelfLen = Math.max(36, textLen * 7.5);
        const x3 = isLeft ? x2 - shelfLen : x2 + shelfLen;

        const minX = Math.min(x2, x3);
        const maxX = Math.max(x2, x3);
        const minY = y2 - 22;
        const maxY = y2 + 6;

        if (p.x >= minX - 6 && p.x <= maxX + 6 && p.y >= minY - 4 && p.y <= maxY + 4) {
          return {
            objId: obj.id,
            field: 'leaderCallout',
            currentText: obj.text || '',
            centerWorld: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
            bounds: {
              minX,
              maxX,
              minY,
              maxY,
              width: maxX - minX,
              height: maxY - minY,
              centerX: (minX + maxX) / 2,
              centerY: (minY + maxY) / 2,
            },
          };
        }
      }
    }

    // 3. Stencil label badge chip or attached label (only if labels toggle is on)
    if (showLabels && (obj.isStencilLabel || obj.parentId)) {
      const b = getObjectBounds(obj);
      if (p.x >= b.minX - 4 && p.x <= b.maxX + 4 && p.y >= b.minY - 4 && p.y <= b.maxY + 4) {
        return {
          objId: obj.id,
          field: 'text',
          currentText: obj.text || '',
          centerWorld: { x: b.centerX, y: b.centerY },
          bounds: b,
        };
      }
    }

    // 4. Dimension FROM / TO station drafting labels & measurement text badge
    if (
      showLabels &&
      (obj.type === 'dim-h' || obj.type === 'dim-v' || obj.type === 'dim-aligned')
    ) {
      const dimHit = findHoveredDimensionLabel(p, obj);
      if (dimHit) return dimHit;
    }

    // 5. Shape & Equipment Live Measurement Badges and Elevation Badges
    if (settings && settings.showMeasurements) {
      const badgeHit = findHoveredEquipmentBadge(p, obj, settings);
      if (badgeHit) return badgeHit;
    }
  }

  return null;
}
