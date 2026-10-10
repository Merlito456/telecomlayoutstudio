import { CADObject, Point, BoundingBox } from "../../types/cad";

export type { BoundingBox };

export function uid(): string {
  return 'cad_' + Math.random().toString(36).substring(2, 9);
}

export type HandleType =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rot';

export interface ResizeHandle {
  type: HandleType;
  x: number;
  y: number;
  cursor: string;
}

export function getObjectBounds(obj: CADObject): BoundingBox {
  if (obj.type === 'leader') {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x2 ?? obj.x + 40;
    const y2 = obj.y2 ?? obj.y - 30;
    const isLeft = x2 < x1;
    const textLen = (obj.text || 'CALLOUT').length;
    const shelfLen = Math.max(36, textLen * 7.5);
    const x3 = isLeft ? x2 - shelfLen : x2 + shelfLen;
    const minX = Math.min(x1, x2, x3);
    const maxX = Math.max(x1, x2, x3);
    const minY = Math.min(y1, y2 - 22);
    const maxY = Math.max(y1, y2);
    const w = Math.max(maxX - minX, 4);
    const h = Math.max(maxY - minY, 4);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: w,
      height: h,
      centerX: minX + w / 2,
      centerY: minY + h / 2,
    };
  }

  if (
    obj.type === 'line' ||
    obj.type === 'dim-h' ||
    obj.type === 'dim-v' ||
    obj.type === 'dim-aligned'
  ) {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x2 ?? obj.x + obj.width;
    const y2 = obj.y2 ?? obj.y + obj.height;
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    const w = Math.max(maxX - minX, 4);
    const h = Math.max(maxY - minY, 4);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: w,
      height: h,
      centerX: minX + w / 2,
      centerY: minY + h / 2,
    };
  }

  if (obj.type === 'polyline' || obj.type === 'pen') {
    if (!obj.points || obj.points.length === 0) {
      return {
        minX: obj.x,
        minY: obj.y,
        maxX: obj.x + obj.width,
        maxY: obj.y + obj.height,
        width: obj.width,
        height: obj.height,
        centerX: obj.x + obj.width / 2,
        centerY: obj.y + obj.height / 2,
      };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of obj.points) {
      const px = obj.x + p.x;
      const py = obj.y + p.y;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    const w = Math.max(maxX - minX, 4);
    const h = Math.max(maxY - minY, 4);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: w,
      height: h,
      centerX: minX + w / 2,
      centerY: minY + h / 2,
    };
  }

  // Stencil Label text badge or attached label (keep compact so it never enters full size of object)
  if (obj.isStencilLabel || (obj.type === 'text' && obj.parentId)) {
    const compactW = Math.min(obj.width || 70, 95);
    const compactH = Math.min(obj.height || 18, 20);
    return {
      minX: obj.x,
      minY: obj.y,
      maxX: obj.x + compactW,
      maxY: obj.y + compactH,
      width: compactW,
      height: compactH,
      centerX: obj.x + compactW / 2,
      centerY: obj.y + compactH / 2,
    };
  }

  // Default rect, circle, text, stencil-group
  const minX = obj.x;
  const minY = obj.y;
  const maxX = obj.x + obj.width;
  const maxY = obj.y + obj.height;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: obj.width,
    height: obj.height,
    centerX: minX + obj.width / 2,
    centerY: minY + obj.height / 2,
  };
}

/**
 * Returns the world-space axis-aligned bounding box of an object taking `obj.rotation` into account.
 * Essential for rotated cable ladders, basepads, and cabinets in both 2D and 3D spatial checks.
 */
export function getRotatedObjectBounds(obj: CADObject): BoundingBox {
  const b = getObjectBounds(obj);
  if (
    !obj.rotation ||
    obj.type === 'line' ||
    obj.type === 'polyline' ||
    obj.type === 'pen' ||
    obj.type === 'dim-h' ||
    obj.type === 'dim-v' ||
    obj.type === 'dim-aligned' ||
    obj.type === 'leader'
  ) {
    return b;
  }
  const rad = (obj.rotation * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));
  const rotW = b.width * absCos + b.height * absSin;
  const rotH = b.width * absSin + b.height * absCos;
  return {
    minX: b.centerX - rotW / 2,
    minY: b.centerY - rotH / 2,
    maxX: b.centerX + rotW / 2,
    maxY: b.centerY + rotH / 2,
    width: rotW,
    height: rotH,
    centerX: b.centerX,
    centerY: b.centerY,
  };
}

export function getCombinedBounds(objects: CADObject[]): BoundingBox | null {
  if (objects.length === 0) return null;
  // If actual objects are selected, exclude stencil labels and attached labels from resize bounding box
  const primaryObjs = objects.filter((o) => !o.isStencilLabel && !(o.type === 'text' && o.parentId));
  const targetObjects = primaryObjs.length > 0 ? primaryObjs : objects;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of targetObjects) {
    const b = getObjectBounds(obj);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}

export function rotatePoint(p: Point, center: Point, angleDeg: number): Point {
  if (!angleDeg) return p;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function getResizeHandles(bounds: BoundingBox, zoom: number, rotation = 0): ResizeHandle[] {
  const { minX, minY, maxX, maxY, centerX, centerY } = bounds;
  const rotOffset = 24 / zoom;
  const center = { x: centerX, y: centerY };

  const rawHandles: ResizeHandle[] = [
    { type: 'nw', x: minX, y: minY, cursor: 'nwse-resize' },
    { type: 'n', x: centerX, y: minY, cursor: 'ns-resize' },
    { type: 'ne', x: maxX, y: minY, cursor: 'nesw-resize' },
    { type: 'e', x: maxX, y: (minY + maxY) / 2, cursor: 'ew-resize' },
    { type: 'se', x: maxX, y: maxY, cursor: 'nwse-resize' },
    { type: 's', x: centerX, y: maxY, cursor: 'ns-resize' },
    { type: 'sw', x: minX, y: maxY, cursor: 'nesw-resize' },
    { type: 'w', x: minX, y: (minY + maxY) / 2, cursor: 'ew-resize' },
    { type: 'rot', x: centerX, y: minY - rotOffset, cursor: 'grab' },
  ];

  if (!rotation) return rawHandles;

  return rawHandles.map((h) => {
    const rotated = rotatePoint({ x: h.x, y: h.y }, center, rotation);
    return { ...h, x: rotated.x, y: rotated.y };
  });
}

/** Check if a CAD object is a telecom shelter */
export function isShelterObject(obj: CADObject): boolean {
  const sId = obj.stencilId || obj.customProps?.stencilType || '';
  return sId === 'shelter' || sId === 'cement-shelter';
}

/** Compute world-space positions for shelter Door and Feeder Hole grips */
export function getShelterOpeningPositions(obj: CADObject): {
  door: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west'; offsetPct: number };
  doorResize: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west'; doorWidthMm: number };
  feeder: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west'; offsetPct: number } | null;
  feederResize: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west'; feederDiameterMm: number } | null;
} | null {
  if (!isShelterObject(obj)) return null;
  const w = obj.width || 180;
  const h = obj.height || 140;
  const props = obj.customProps || {};
  const doorWall: 'north' | 'south' | 'east' | 'west' = props.doorWall || 'south';
  const doorOffsetPct: number = Math.max(10, Math.min(90, props.doorOffset ?? 35));
  const doorWidthMm: number = Number(props.doorWidthMm ?? props.doorDiameter ?? props.doorDiameterMm ?? 900);
  const cableWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.cableHoleWall ?? 'east';
  const cableOffsetPct: number = Math.max(10, Math.min(90, props.cableHoleOffset ?? 50));
  const feederDiameterMm: number = Number(
    obj.cableHoleDiameterMm ??
    obj.feederDiameter ??
    props.cableHoleDiameterMm ??
    props.cableHoleDiameter ??
    props.feederDiameter ??
    250
  );

  const center = { x: obj.x + w / 2, y: obj.y + h / 2 };
  const rot = obj.rotation || 0;

  // Door local coords
  let doorLx = 0;
  let doorLy = 0;
  if (doorWall === 'south') {
    doorLx = w * (doorOffsetPct / 100);
    doorLy = h;
  } else if (doorWall === 'north') {
    doorLx = w * (doorOffsetPct / 100);
    doorLy = 0;
  } else if (doorWall === 'east') {
    doorLx = w;
    doorLy = h * (doorOffsetPct / 100);
  } else {
    // west
    doorLx = 0;
    doorLy = h * (doorOffsetPct / 100);
  }
  const doorWorldPt = rotatePoint({ x: obj.x + doorLx, y: obj.y + doorLy }, center, rot);

  // Door Resize Handle at the tip of the door opening
  const doorLenPx = Math.max(16, (doorWidthMm / 900) * 34);
  let doorResizeLx = doorLx;
  let doorResizeLy = doorLy;
  if (doorWall === 'south' || doorWall === 'north') {
    doorResizeLx = doorLx + doorLenPx;
  } else {
    doorResizeLy = doorLy + doorLenPx;
  }
  const doorResizeWorldPt = rotatePoint({ x: obj.x + doorResizeLx, y: obj.y + doorResizeLy }, center, rot);

  let feederResult: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west'; offsetPct: number } | null = null;
  let feederResizeResult: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west'; feederDiameterMm: number } | null = null;

  if (cableWall !== 'none') {
    let feederLx = 0;
    let feederLy = 0;
    if (cableWall === 'south') {
      feederLx = w * (cableOffsetPct / 100);
      feederLy = h;
    } else if (cableWall === 'north') {
      feederLx = w * (cableOffsetPct / 100);
      feederLy = 0;
    } else if (cableWall === 'east') {
      feederLx = w;
      feederLy = h * (cableOffsetPct / 100);
    } else {
      // west
      feederLx = 0;
      feederLy = h * (cableOffsetPct / 100);
    }
    const feederWorldPt = rotatePoint({ x: obj.x + feederLx, y: obj.y + feederLy }, center, rot);
    feederResult = {
      x: feederWorldPt.x,
      y: feederWorldPt.y,
      wall: cableWall,
      offsetPct: cableOffsetPct,
    };

    // Feeder Resize Handle at the outer edge of gland plate span
    const glandSpanPx = Math.max(14, Math.min(64, (feederDiameterMm / 250) * 28));
    let fResizeLx = feederLx;
    let fResizeLy = feederLy;
    if (cableWall === 'south' || cableWall === 'north') {
      fResizeLx = feederLx + glandSpanPx / 2;
    } else {
      fResizeLy = feederLy + glandSpanPx / 2;
    }
    const feederResizeWorldPt = rotatePoint({ x: obj.x + fResizeLx, y: obj.y + fResizeLy }, center, rot);
    feederResizeResult = {
      x: feederResizeWorldPt.x,
      y: feederResizeWorldPt.y,
      wall: cableWall,
      feederDiameterMm,
    };
  }

  return {
    door: {
      x: doorWorldPt.x,
      y: doorWorldPt.y,
      wall: doorWall,
      offsetPct: doorOffsetPct,
    },
    doorResize: {
      x: doorResizeWorldPt.x,
      y: doorResizeWorldPt.y,
      wall: doorWall,
      doorWidthMm,
    },
    feeder: feederResult,
    feederResize: feederResizeResult,
  };
}

/** Given a dragged world point, calculate the target shelter wall and offset percentage */
export function calculateShelterOpeningWallAndOffset(
  obj: CADObject,
  worldPt: Point
): { wall: 'north' | 'south' | 'east' | 'west'; offsetPct: number } {
  const w = obj.width || 180;
  const h = obj.height || 140;
  const center = { x: obj.x + w / 2, y: obj.y + h / 2 };
  const rot = obj.rotation || 0;

  // Un-rotate worldPt around object center
  const unrotPt = rotatePoint(worldPt, center, -rot);

  // Local coords relative to shelter origin
  const relX = unrotPt.x - obj.x;
  const relY = unrotPt.y - obj.y;

  const distNorth = Math.abs(relY);
  const distSouth = Math.abs(relY - h);
  const distWest = Math.abs(relX);
  const distEast = Math.abs(relX - w);

  const minDist = Math.min(distNorth, distSouth, distWest, distEast);

  let wall: 'north' | 'south' | 'east' | 'west' = 'south';
  let rawPct = 50;

  if (minDist === distNorth) {
    wall = 'north';
    rawPct = (relX / w) * 100;
  } else if (minDist === distSouth) {
    wall = 'south';
    rawPct = (relX / w) * 100;
  } else if (minDist === distWest) {
    wall = 'west';
    rawPct = (relY / h) * 100;
  } else {
    wall = 'east';
    rawPct = (relY / h) * 100;
  }

  const offsetPct = Math.round(Math.max(10, Math.min(90, rawPct)));
  return { wall, offsetPct };
}

/** Calculate door width / diameter in mm when dragging a door resize handle */
export function calculateShelterDoorResizeWidth(
  obj: CADObject,
  worldPt: Point
): number {
  const w = obj.width || 180;
  const h = obj.height || 140;
  const props = obj.customProps || {};
  const doorWall: 'north' | 'south' | 'east' | 'west' = props.doorWall || 'south';
  const doorOffsetPct: number = Math.max(10, Math.min(90, props.doorOffset ?? 35));
  const center = { x: obj.x + w / 2, y: obj.y + h / 2 };
  const rot = obj.rotation || 0;

  // Un-rotate worldPt around object center
  const unrotPt = rotatePoint(worldPt, center, -rot);
  const relX = unrotPt.x - obj.x;
  const relY = unrotPt.y - obj.y;

  let hingeLx = 0;
  let distPx = 34;
  const wallSpanPx = doorWall === 'north' || doorWall === 'south' ? w : h;

  if (doorWall === 'north' || doorWall === 'south') {
    hingeLx = w * (doorOffsetPct / 100);
    distPx = Math.abs(relX - hingeLx);
  } else {
    hingeLx = h * (doorOffsetPct / 100);
    distPx = Math.abs(relY - hingeLx);
  }

  // 34px is standard 900mm door width
  const rawMm = (distPx / 34) * 900;
  // Snap to nearest 25mm
  const snappedMm = Math.round(rawMm / 25) * 25;
  // Max width is 80% of wall span
  const maxMm = Math.min(2400, Math.round(((wallSpanPx * 0.8) / 34) * 900));
  return Math.max(600, Math.min(maxMm, snappedMm));
}

/** Calculate feeder gland diameter in mm when dragging a feeder resize handle */
export function calculateShelterFeederResizeDiameter(
  obj: CADObject,
  worldPt: Point
): number {
  const w = obj.width || 180;
  const h = obj.height || 140;
  const props = obj.customProps || {};
  const cableWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.cableHoleWall ?? 'east';
  const cableOffsetPct: number = Math.max(10, Math.min(90, props.cableHoleOffset ?? 50));
  const center = { x: obj.x + w / 2, y: obj.y + h / 2 };
  const rot = obj.rotation || 0;

  // Un-rotate worldPt around object center
  const unrotPt = rotatePoint(worldPt, center, -rot);
  const relX = unrotPt.x - obj.x;
  const relY = unrotPt.y - obj.y;

  let feederCenterPx = 0;
  let distPx = 14;

  if (cableWall === 'north' || cableWall === 'south') {
    feederCenterPx = w * (cableOffsetPct / 100);
    distPx = Math.abs(relX - feederCenterPx);
  } else {
    feederCenterPx = h * (cableOffsetPct / 100);
    distPx = Math.abs(relY - feederCenterPx);
  }

  // 28px standard span corresponds to 250mm diameter (distPx is half-span)
  const fullSpanPx = distPx * 2;
  const rawMm = (fullSpanPx / 28) * 250;
  const snappedMm = Math.round(rawMm / 25) * 25;
  return Math.max(100, Math.min(600, snappedMm));
}

export { isPointInObject, distToSegment } from './hit-test';


