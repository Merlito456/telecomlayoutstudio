/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADLayer, CADObject } from '../types/cad';

export const DEFAULT_LAYERS: CADLayer[] = [
  {
    id: 'layer-annotations',
    name: 'Dimensions & Callouts',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#38bdf8', // Sky
  },
  {
    id: 'layer-cabling',
    name: 'Cable Bridges & Trays',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#ec4899', // Pink
  },
  {
    id: 'layer-towers',
    name: 'Towers & Masts',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#f43f5e', // Rose
  },
  {
    id: 'layer-cabinets',
    name: 'Cabinets & Equipment',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#818cf8', // Indigo
  },
  {
    id: 'layer-power',
    name: 'Power & Generators',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#f59e0b', // Amber
  },
  {
    id: 'layer-basepads',
    name: 'Concrete Basepads',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#10b981', // Emerald
  },
  {
    id: 'layer-civil',
    name: 'Walls, Gates & Perimeter',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#8b5cf6', // Violet
  },
  {
    id: 'layer-environment',
    name: 'Yard & Landscape',
    visible: true,
    locked: false,
    opacity: 1,
    color: '#06b6d4', // Cyan
  },
];

/**
 * Infer or retrieve the associated Layer ID for a CAD object
 */
export function getObjectLayerId(
  obj: CADObject,
  fallbackLayerId = 'layer-civil',
  parentLayerLookup?: Map<string, string>
): string {
  const s = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  const name = String(obj.customProps?.name || (obj as any).name || obj.text || '').toLowerCase();

  const isLadderOrCableObj =
    s.includes('cable') ||
    s.includes('ladder') ||
    s.includes('tray') ||
    s.includes('raceway') ||
    s.includes('runway') ||
    obj.ladderType !== undefined ||
    obj.customProps?.ladderType !== undefined ||
    obj.customProps?.placement === 'indoor' ||
    obj.customProps?.category === 'cabling' ||
    obj.customProps?.category === 'ladder' ||
    (obj as any).category === 'ladder' ||
    name.includes('ladder') ||
    name.includes('raceway') ||
    name.includes('runway');

  if (
    (obj.type === 'line' || obj.type === 'polyline' || obj.type === 'pen' || isLadderOrCableObj) &&
    (!obj.layerId || obj.layerId === 'layer-civil')
  ) {
    return 'layer-cabling';
  }
  if (obj.layerId) return obj.layerId;

  // If this is a detached stencil label or child of a parent object,
  // inherit the parent object's layer!
  if (obj.parentId && parentLayerLookup && parentLayerLookup.has(obj.parentId)) {
    return parentLayerLookup.get(obj.parentId)!;
  }

  // Dimension lines, leader callouts, text
  if (
    obj.type === 'dim-h' ||
    obj.type === 'dim-v' ||
    obj.type === 'dim-aligned' ||
    obj.type === 'leader' ||
    (obj.type === 'text' && !obj.parentId && !obj.isStencilLabel)
  ) {
    return 'layer-annotations';
  }

  // Basepads & Foundations
  if (
    (s === 'cement-basepad' ||
    s === 'gen-basepad' ||
    s === 'tx-basepad' ||
    s === 'ac-basepad' ||
    s === 'cement-slab' ||
    s.includes('basepad') ||
    s.includes('slab')) &&
    !s.includes('ladder') &&
    !s.includes('cable')
  ) {
    return 'layer-basepads';
  }

  // Towers & Structural Masts
  if (
    s.includes('tower') ||
    s.includes('monopole') ||
    s.includes('guy-anchor') ||
    s.includes('mast') ||
    s.includes('rooftop-mount') ||
    s.includes('parapet')
  ) {
    return 'layer-towers';
  }

  // Cabling, cable bridges, ladders, raceways, wire lines, pen paths
  if (
    s.includes('cable') ||
    s.includes('ladder') ||
    s.includes('tray') ||
    s.includes('raceway') ||
    s.includes('runway') ||
    obj.ladderType !== undefined ||
    obj.customProps?.ladderType !== undefined ||
    obj.customProps?.category === 'cabling' ||
    obj.customProps?.category === 'ladder' ||
    obj.type === 'line' ||
    obj.type === 'pen' ||
    obj.type === 'polyline'
  ) {
    return 'layer-cabling';
  }

  // Power, Generators, Transformers, Rectifiers & DC Plants
  if (
    s.includes('generator') ||
    s.includes('transformer') ||
    s.includes('fuel-tank') ||
    s.includes('ats') ||
    s.includes('acpdb') ||
    s.includes('ecb') ||
    s.includes('rectifier') ||
    s === 'battery-bank' ||
    s === 'flatpack-1' ||
    obj.customProps?.category === 'power' ||
    obj.customProps?.category === 'rectifier-system' ||
    obj.customProps?.isRectifierSystem
  ) {
    return 'layer-power';
  }

  // Cabinets, ODC, Battery, Equipment Racks, Shelter (excluding cable ladders)
  if (
    s.includes('cabinet') ||
    s.includes('rack') ||
    obj.customProps?.category === 'racks' ||
    s.includes('huawei') ||
    s.includes('eltek') ||
    s.includes('ericsson') ||
    s.includes('fushan') ||
    s.includes('fhodc') ||
    s.includes('odc') ||
    s === 'battery-bank' ||
    s === 'air-conditioner' ||
    s.includes('wall-mount-ac') ||
    s.includes('indoor-split') ||
    s.includes('aircon') ||
    s.includes('cooling') ||
    obj.customProps?.category === 'cooling' ||
    (obj as any).category === 'cooling' ||
    (s.includes('shelter') &&
      !s.includes('ladder') &&
      !s.includes('cable') &&
      !s.includes('tray') &&
      !s.includes('raceway'))
  ) {
    return 'layer-cabinets';
  }

  // Civil: Walls, Gates, Fences, Posts, Guardhouses, Wall Canopies
  if (
    s.includes('wall') ||
    s.includes('fence') ||
    s.includes('gate') ||
    s.includes('post') ||
    s.includes('house') ||
    s.includes('canopy') ||
    s.includes('shade')
  ) {
    return 'layer-civil';
  }

  // Yard, Environment, Roads, Trees, Vehicles, Drain
  if (
    s.includes('road') ||
    s.includes('gravel') ||
    s.includes('grass') ||
    s.includes('tree') ||
    s.includes('car') ||
    s.includes('canal') ||
    s.includes('flower') ||
    s.includes('person')
  ) {
    return 'layer-environment';
  }

  return fallbackLayerId;
}

/**
 * Check if an object should be visible according to its layer visibility
 */
export function isObjectLayerVisible(obj: CADObject, layers: CADLayer[]): boolean {
  const layerId = getObjectLayerId(obj);
  const layer = layers.find((l) => l.id === layerId);
  if (!layer) return true;
  return layer.visible !== false;
}

/**
 * Check if an object's layer is locked
 */
export function isObjectLayerLocked(obj: CADObject, layers: CADLayer[]): boolean {
  const layerId = getObjectLayerId(obj);
  const layer = layers.find((l) => l.id === layerId);
  if (!layer) return false;
  return !!layer.locked;
}

/**
 * Sort objects in Drawing Order (Z-Index) based on the Photoshop layer stack:
 * `layers[0]` is top layer (drawn last, on top of everything).
 * `layers[layers.length - 1]` is bottom layer (drawn first, in the background).
 * Any object belonging to a hidden layer (`visible === false`) is EXCLUDED from drawing!
 */
export function sortObjectsByLayerStack(
  objects: CADObject[],
  layers: CADLayer[]
): {
  visibleObjects: CADObject[];
  layerOpacityMap: Map<string, number>;
} {
  // If no layers defined, render all
  if (!layers || layers.length === 0) {
    return { visibleObjects: objects, layerOpacityMap: new Map() };
  }

  // Build layer map
  const layerMap = new Map<string, CADLayer>();
  const layerOpacityMap = new Map<string, number>();
  for (const l of layers) {
    layerMap.set(l.id, l);
    layerOpacityMap.set(l.id, l.opacity ?? 1);
  }

  // First pass: map primary parent objects to their layers
  const parentLayerLookup = new Map<string, string>();
  for (const obj of objects) {
    if (!obj.parentId && !obj.isStencilLabel) {
      const lid = obj.layerId || getObjectLayerId(obj);
      parentLayerLookup.set(obj.id, lid);
    }
  }

  // Stacking order: bottom layers drawn first, top layers drawn last
  // Since layers array is ordered Top-to-Bottom in UI, we reverse it for drawing order:
  const drawOrder = layers.slice().reverse();

  // Group objects by their layer
  const objectsByLayer = new Map<string, CADObject[]>();
  for (const l of layers) {
    objectsByLayer.set(l.id, []);
  }

  const unassigned: CADObject[] = [];

  for (const obj of objects) {
    const lId = getObjectLayerId(obj, layers[layers.length - 1]?.id || 'layer-civil', parentLayerLookup);
    const layer = layerMap.get(lId);
    if (!layer || layer.visible !== false) {
      if (objectsByLayer.has(lId)) {
        objectsByLayer.get(lId)!.push(obj);
      } else {
        // Fallback into bottom layer instead of putting on top
        const bottomLayerId = drawOrder[0]?.id;
        if (bottomLayerId && objectsByLayer.has(bottomLayerId)) {
          objectsByLayer.get(bottomLayerId)!.push(obj);
        } else {
          unassigned.push(obj);
        }
      }
    }
  }

  const visibleObjects: CADObject[] = [];

  for (const l of drawOrder) {
    // If layer is hidden, skip all its objects!
    if (l.visible === false) continue;
    const list = objectsByLayer.get(l.id);
    if (list && list.length > 0) {
      if (l.id === 'layer-cabling') {
        const ladders = list.filter(
          (o) => o.type !== 'line' && o.type !== 'polyline' && o.type !== 'pen'
        );
        const wires = list.filter(
          (o) => o.type === 'line' || o.type === 'polyline' || o.type === 'pen'
        );
        visibleObjects.push(...ladders, ...wires);
      } else {
        visibleObjects.push(...list);
      }
    }
  }

  // Append any remaining unassigned objects
  if (unassigned.length > 0) {
    visibleObjects.push(...unassigned);
  }

  return { visibleObjects, layerOpacityMap };
}
