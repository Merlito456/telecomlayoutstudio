import { CADLayer, CADObject, Point } from '../../types/cad';
import { getObjectLayerId } from '../cad-layers';
import { hexToACI, rotatePoint, sanitizeLayerName } from './dxf-color-utils';

export function getWorldPoint(
  localPt: Point,
  obj: CADObject,
  parentGroup?: CADObject
): Point {
  let px = localPt.x;
  let py = localPt.y;

  if (parentGroup) {
    if (obj.rotation) {
      const childCenterX = (obj.x || 0) + (obj.width || 0) / 2;
      const childCenterY = (obj.y || 0) + (obj.height || 0) / 2;
      const rChild = rotatePoint({ x: px, y: py }, { x: childCenterX, y: childCenterY }, obj.rotation);
      px = rChild.x;
      py = rChild.y;
    }

    const worldUnrotated = {
      x: (parentGroup.x || 0) + px,
      y: (parentGroup.y || 0) + py,
    };

    if (parentGroup.rotation) {
      const groupCenter = {
        x: (parentGroup.x || 0) + (parentGroup.width || 0) / 2,
        y: (parentGroup.y || 0) + (parentGroup.height || 0) / 2,
      };
      return rotatePoint(worldUnrotated, groupCenter, parentGroup.rotation);
    }

    return worldUnrotated;
  } else {
    if (obj.rotation) {
      const objCenter = {
        x: (obj.x || 0) + (obj.width || 0) / 2,
        y: (obj.y || 0) + (obj.height || 0) / 2,
      };
      return rotatePoint({ x: px, y: py }, objCenter, obj.rotation);
    }
    return { x: px, y: py };
  }
}

export function exportObjectEntity(
  obj: CADObject,
  lines: string[],
  toCadCoord: (x: number, y: number) => { x: number; y: number },
  scale: number,
  layersList: CADLayer[],
  allObjects: CADObject[],
  parentGroup?: CADObject,
  parentLayer?: string
) {
  const getObjLayer = (target: CADObject): string => {
    const lid = getObjectLayerId(target);
    const found = layersList.find((l) => l.id === lid);
    return sanitizeLayerName(found?.name || lid || '0');
  };

  const layer = parentLayer || getObjLayer(obj);
  const aciColor = hexToACI(obj.stroke || obj.fill);

  switch (obj.type) {
    case 'line': {
      const p1Local = { x: obj.x || 0, y: obj.y || 0 };
      const p2Local = {
        x: obj.x2 ?? ((obj.x || 0) + (obj.width || 0)),
        y: obj.y2 ?? ((obj.y || 0) + (obj.height || 0)),
      };
      const p1World = getWorldPoint(p1Local, obj, parentGroup);
      const p2World = getWorldPoint(p2Local, obj, parentGroup);
      const c1 = toCadCoord(p1World.x, p1World.y);
      const c2 = toCadCoord(p2World.x, p2World.y);

      lines.push('  0', 'LINE');
      lines.push('  8', layer);
      lines.push(' 62', aciColor.toString());
      lines.push(' 10', c1.x.toString());
      lines.push(' 20', c1.y.toString());
      lines.push(' 30', '0.0');
      lines.push(' 11', c2.x.toString());
      lines.push(' 21', c2.y.toString());
      lines.push(' 31', '0.0');
      break;
    }

    case 'rectangle': {
      const w = obj.width || 20;
      const h = obj.height || 20;
      const baseCorners: Point[] = [
        { x: obj.x || 0, y: obj.y || 0 },
        { x: (obj.x || 0) + w, y: obj.y || 0 },
        { x: (obj.x || 0) + w, y: (obj.y || 0) + h },
        { x: obj.x || 0, y: (obj.y || 0) + h },
      ];
      const worldCorners = baseCorners.map((pt) => getWorldPoint(pt, obj, parentGroup));

      lines.push('  0', 'LWPOLYLINE');
      lines.push('  8', layer);
      lines.push(' 62', aciColor.toString());
      lines.push(' 90', '4');
      lines.push(' 70', '1');
      worldCorners.forEach((pt) => {
        const c = toCadCoord(pt.x, pt.y);
        lines.push(' 10', c.x.toString());
        lines.push(' 20', c.y.toString());
      });
      break;
    }

    case 'circle': {
      const r = (obj.width || 20) / 2;
      const localCenter = { x: (obj.x || 0) + r, y: (obj.y || 0) + r };
      const worldCenter = getWorldPoint(localCenter, obj, parentGroup);
      const cc = toCadCoord(worldCenter.x, worldCenter.y);
      const rCad = +(r / scale).toFixed(4);

      lines.push('  0', 'CIRCLE');
      lines.push('  8', layer);
      lines.push(' 62', aciColor.toString());
      lines.push(' 10', cc.x.toString());
      lines.push(' 20', cc.y.toString());
      lines.push(' 30', '0.0');
      lines.push(' 40', rCad.toString());
      break;
    }

    case 'polyline':
    case 'pen': {
      const pts = obj.points && obj.points.length > 0 ? obj.points : [];
      if (pts.length < 2) break;

      lines.push('  0', 'LWPOLYLINE');
      lines.push('  8', layer);
      lines.push(' 62', aciColor.toString());
      lines.push(' 90', pts.length.toString());
      lines.push(' 70', obj.isClosed ? '1' : '0');

      pts.forEach((pt) => {
        const ptLocal = { x: (obj.x || 0) + pt.x, y: (obj.y || 0) + pt.y };
        const ptWorld = getWorldPoint(ptLocal, obj, parentGroup);
        const c = toCadCoord(ptWorld.x, ptWorld.y);
        lines.push(' 10', c.x.toString());
        lines.push(' 20', c.y.toString());
      });
      break;
    }

    case 'text': {
      const textStr = (obj.text || '').replace(/[\r\n]+/g, ' ');
      if (!textStr.trim()) break;

      const fontSizePx = obj.fontSize || 12;
      const fontHeightMeters = +(fontSizePx / scale).toFixed(3);
      const textLocal = { x: obj.x || 0, y: (obj.y || 0) + fontSizePx };
      const textWorld = getWorldPoint(textLocal, obj, parentGroup);
      const c = toCadCoord(textWorld.x, textWorld.y);
      const totalRot = (obj.rotation || 0) + (parentGroup?.rotation || 0);

      lines.push('  0', 'TEXT');
      lines.push('  8', layer);
      lines.push(' 62', aciColor.toString());
      lines.push(' 10', c.x.toString());
      lines.push(' 20', c.y.toString());
      lines.push(' 30', '0.0');
      lines.push(' 40', fontHeightMeters.toString());
      lines.push('  1', textStr);
      if (totalRot !== 0) {
        lines.push(' 50', (-totalRot).toFixed(2));
      }
      lines.push('  7', 'STANDARD');
      break;
    }

    case 'dim-h':
    case 'dim-v':
    case 'dim-aligned': {
      const x1 = obj.x;
      const y1 = obj.y;
      const x2 = obj.x2 ?? (x1 + (obj.width || 0));
      const y2 = obj.y2 ?? (y1 + (obj.height || 0));
      const offset = obj.dimOffset || 0;

      let p1 = { x: x1, y: y1 };
      let p2 = { x: x2, y: y2 };

      if (obj.type === 'dim-h') {
        p1 = { x: x1, y: y1 + offset };
        p2 = { x: x2, y: y1 + offset };
      } else if (obj.type === 'dim-v') {
        p1 = { x: x1 + offset, y: y1 };
        p2 = { x: x1 + offset, y: y2 };
      }

      const distPx = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const distMeters = distPx / scale;
      const dimText =
        obj.fromLabel && obj.toLabel
          ? `${obj.fromLabel} -> ${obj.toLabel} [${distMeters.toFixed(2)}m]`
          : `${distMeters.toFixed(2)}m`;

      const c1 = toCadCoord(p1.x, p1.y);
      const c2 = toCadCoord(p2.x, p2.y);
      const cMid = toCadCoord((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 6);

      lines.push('  0', 'LINE');
      lines.push('  8', 'DIMENSIONS_AND_ANNOTATIONS');
      lines.push(' 62', '4');
      lines.push(' 10', c1.x.toString());
      lines.push(' 20', c1.y.toString());
      lines.push(' 30', '0.0');
      lines.push(' 11', c2.x.toString());
      lines.push(' 21', c2.y.toString());
      lines.push(' 31', '0.0');

      lines.push('  0', 'TEXT');
      lines.push('  8', 'DIMENSIONS_AND_ANNOTATIONS');
      lines.push(' 62', '4');
      lines.push(' 10', cMid.x.toString());
      lines.push(' 20', cMid.y.toString());
      lines.push(' 30', '0.0');
      lines.push(' 40', '0.35');
      lines.push('  1', dimText);
      lines.push('  7', 'STANDARD');
      break;
    }

    case 'leader': {
      const x1 = obj.x;
      const y1 = obj.y;
      const x2 = obj.x2 ?? (x1 + 40);
      const y2 = obj.y2 ?? (y1 - 30);
      const c1 = toCadCoord(x1, y1);
      const c2 = toCadCoord(x2, y2);

      lines.push('  0', 'LINE');
      lines.push('  8', 'DIMENSIONS_AND_ANNOTATIONS');
      lines.push(' 62', '4');
      lines.push(' 10', c1.x.toString());
      lines.push(' 20', c1.y.toString());
      lines.push(' 30', '0.0');
      lines.push(' 11', c2.x.toString());
      lines.push(' 21', c2.y.toString());
      lines.push(' 31', '0.0');

      if (obj.text) {
        lines.push('  0', 'TEXT');
        lines.push('  8', 'DIMENSIONS_AND_ANNOTATIONS');
        lines.push(' 62', '4');
        lines.push(' 10', c2.x.toString());
        lines.push(' 20', c2.y.toString());
        lines.push(' 30', '0.0');
        lines.push(' 40', '0.35');
        lines.push('  1', obj.text);
        lines.push('  7', 'STANDARD');
      }
      break;
    }

    case 'stencil-group': {
      const w = obj.width || obj.baseWidth || 30;
      const h = obj.height || obj.baseHeight || 30;

      if (Array.isArray(obj.children) && obj.children.length > 0) {
        obj.children.forEach((child) => {
          exportObjectEntity(child, lines, toCadCoord, scale, layersList, allObjects, obj, layer);
        });
      } else {
        const baseCorners: Point[] = [
          { x: obj.x || 0, y: obj.y || 0 },
          { x: (obj.x || 0) + w, y: obj.y || 0 },
          { x: (obj.x || 0) + w, y: (obj.y || 0) + h },
          { x: obj.x || 0, y: (obj.y || 0) + h },
        ];
        const worldCorners = baseCorners.map((pt) => getWorldPoint(pt, obj));
        lines.push('  0', 'LWPOLYLINE');
        lines.push('  8', layer);
        lines.push(' 62', aciColor.toString());
        lines.push(' 90', '4');
        lines.push(' 70', '1');
        worldCorners.forEach((pt) => {
          const c = toCadCoord(pt.x, pt.y);
          lines.push(' 10', c.x.toString());
          lines.push(' 20', c.y.toString());
        });
      }

      const hasSeparateLabel = allObjects.some(
        (o) => o.type === 'text' && (o.parentId === obj.id || (o.isStencilLabel && o.parentId === obj.id))
      );
      const stencilName = obj.stencilId ? obj.stencilId.toUpperCase().replace(/-/g, ' ') : '';
      if (stencilName && !hasSeparateLabel) {
        const hM = obj.towerHeightM || obj.customProps?.towerHeightM;
        const tagLabel = hM ? `${stencilName} [H: ${hM}m]` : stencilName;
        const tagLocal = { x: (obj.x || 0) + 2, y: (obj.y || 0) - 4 };
        const tagWorld = getWorldPoint(tagLocal, obj);
        const tagCoord = toCadCoord(tagWorld.x, tagWorld.y);
        lines.push('  0', 'TEXT');
        lines.push('  8', layer);
        lines.push(' 62', aciColor.toString());
        lines.push(' 10', tagCoord.x.toString());
        lines.push(' 20', tagCoord.y.toString());
        lines.push(' 30', '0.0');
        lines.push(' 40', '0.25');
        lines.push('  1', tagLabel);
        lines.push('  7', 'STANDARD');
      }
      break;
    }
  }
}
