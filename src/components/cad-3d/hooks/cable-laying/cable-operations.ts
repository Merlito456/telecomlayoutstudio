import { CADObject } from '../../../../types/cad';

export function filterOutCableById(objects: CADObject[], cableId: string): CADObject[] {
  const target = objects.find((o) => o.id === cableId);
  if (!target) return objects;

  const tx1 = target.x;
  const ty1 = target.y;
  const tx2 = target.x2 ?? target.x + (target.width || 0);
  const ty2 = target.y2 ?? target.y + (target.height || 0);

  return objects.filter((o) => {
    if (o.id === cableId) return false;
    if (target.type === 'line' && o.type === 'line') {
      const ox1 = o.x;
      const oy1 = o.y;
      const ox2 = o.x2 ?? o.x + (o.width || 0);
      const oy2 = o.y2 ?? o.y + (o.height || 0);
      if (
        Math.abs(Math.min(ox1, ox2) - Math.min(tx1, tx2)) <= 6 &&
        Math.abs(Math.min(oy1, oy2) - Math.min(ty1, ty2)) <= 6 &&
        Math.abs(Math.max(ox1, ox2) - Math.max(tx1, tx2)) <= 6 &&
        Math.abs(Math.max(oy1, oy2) - Math.max(ty1, ty2)) <= 6
      ) {
        return false;
      }
    }
    return true;
  });
}

export function filterOutAllCables(objects: CADObject[]): { nextObjects: CADObject[]; wireCount: number } {
  const wireCount = objects.filter(
    (o) => o.type === 'line' || o.type === 'polyline' || o.type === 'pen'
  ).length;

  const nextObjects = objects.filter(
    (o) => o.type !== 'line' && o.type !== 'polyline' && o.type !== 'pen'
  );

  return { nextObjects, wireCount };
}
