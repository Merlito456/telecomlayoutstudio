import { CADObject, Point } from "../../types/cad";
import { getObjectBounds } from "./bounds-handles";

export function formatMeasurement(
  pixels: number,
  scaleFactor: number,
  unit = 'm',
  unitFormat: 'm' | 'mm' | 'cm' | 'ft' | 'ft-in' = 'm'
): string {
  const meters = pixels / scaleFactor;

  if (unitFormat === 'mm') {
    return `${Math.round(meters * 1000)} mm`;
  }
  if (unitFormat === 'cm') {
    return `${(meters * 100).toFixed(1)} cm`;
  }
  if (unitFormat === 'ft') {
    const feet = meters * 3.28084;
    return `${feet.toFixed(2)} ft`;
  }
  if (unitFormat === 'ft-in') {
    const totalInches = Math.round(meters * 39.3701);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'-${inches}"`;
  }

  // Default meters
  if (meters >= 10) return `${meters.toFixed(1)} ${unit}`;
  return `${meters.toFixed(2)} ${unit}`;
}


export function createDimensionsForObject(
  obj: CADObject,
  scaleFactor: number,
  dimOffset = 30
): CADObject[] {
  const b = getObjectBounds(obj);
  const uid = () => 'cad_' + Math.random().toString(36).substring(2, 9);

  const name = obj.stencilId
    ? obj.stencilId.replace(/-/g, ' ').toUpperCase()
    : obj.text || obj.type.toUpperCase();

  // Horizontal dimension placed above the object
  const dimH: CADObject = {
    id: uid(),
    type: 'dim-h',
    x: b.minX,
    y: b.minY,
    x2: b.maxX,
    y2: b.minY,
    width: b.width,
    height: 0,
    dimOffset: -dimOffset,
    fromLabel: `${name} (W / Left)`,
    toLabel: `${name} (E / Right)`,
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
    parentId: obj.id,
  };

  // Vertical dimension placed to the right of the object
  const dimV: CADObject = {
    id: uid(),
    type: 'dim-v',
    x: b.maxX,
    y: b.minY,
    x2: b.maxX,
    y2: b.maxY,
    width: 0,
    height: b.height,
    dimOffset: dimOffset,
    fromLabel: `${name} (N / Top)`,
    toLabel: `${name} (S / Bottom)`,
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
    parentId: obj.id,
  };

  return [dimH, dimV];
}

/**
 * Creates standard clearance dimension line between two objects
 */
export function createInterObjectDimension(
  objA: CADObject,
  objB: CADObject,
  scaleFactor: number
): CADObject {
  const bA = getObjectBounds(objA);
  const bB = getObjectBounds(objB);
  const uid = () => 'cad_' + Math.random().toString(36).substring(2, 9);

  const nameA = objA.stencilId ? objA.stencilId.replace(/-/g, ' ').toUpperCase() : objA.text || 'FEATURE A';
  const nameB = objB.stencilId ? objB.stencilId.replace(/-/g, ' ').toUpperCase() : objB.text || 'FEATURE B';

  const centerA: Point = { x: bA.centerX, y: bA.centerY };
  const centerB: Point = { x: bB.centerX, y: bB.centerY };

  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;
  const len = Math.hypot(dx, dy);

  return {
    id: uid(),
    type: 'dim-aligned',
    x: centerA.x,
    y: centerA.y,
    x2: centerB.x,
    y2: centerB.y,
    width: len,
    height: 0,
    dimOffset: -30,
    fromLabel: nameA,
    toLabel: nameB,
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
  };
}

