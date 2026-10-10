/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { uid } from '../cad-defaults';
import { getCombinedBounds, getObjectBounds } from './bounds-handles';
import { isBasepadObject } from './cable-routing';

export const checkAndMergeAdjacentBasepads = (objs: CADObject[], _activeId?: string): CADObject[] => {
  // Retain each object's exact set size. Do not destructively overwrite small objects into big objects.
  return objs;
};

export const createMergedBasepads = (
  objects: CADObject[],
  padIds: string[],
  activeLayerId: string
): { updatedObjects: CADObject[]; mergedId: string } | null => {
  const targetPads = objects.filter((o) => padIds.includes(o.id) && isBasepadObject(o));
  if (targetPads.length < 2) return null;

  const b = getCombinedBounds(targetPads);
  if (!b) return null;

  const removedPadIds = new Set(targetPads.map((p) => p.id));
  const labelIdsToRemove = new Set(
    objects
      .filter((o) => (o.isStencilLabel || o.parentId) && o.parentId && removedPadIds.has(o.parentId))
      .map((o) => o.id)
  );

  const mergedChildren: CADObject[] = targetPads.map((pad) => {
    const pb = getObjectBounds(pad);
    return {
      id: uid(),
      type: 'rectangle',
      x: pb.minX - b.minX,
      y: pb.minY - b.minY,
      width: pb.width,
      height: pb.height,
      stroke: pad.stroke || '#7c7c74',
      strokeWidth: pad.strokeWidth || 2,
      fill: pad.fill || '#a8a89e',
      fillEnabled: true,
      fillOpacity: 1,
      opacity: 1,
      customProps: {
        originalWidth: pb.width,
        originalHeight: pb.height,
      },
    };
  });

  const mergedId = uid();
  const mergedPad: CADObject = {
    id: mergedId,
    type: 'stencil-group',
    stencilId: 'cement-basepad',
    isStencil: true,
    isStretchable: false,
    baseWidth: b.width,
    baseHeight: b.height,
    x: b.minX,
    y: b.minY,
    width: b.width,
    height: b.height,
    stroke: '#7c7c74',
    strokeWidth: 2,
    fill: '#a8a89e',
    fillEnabled: true,
    fillOpacity: 1,
    opacity: 1,
    layerId: activeLayerId || 'layer-basepads',
    customProps: { stencilType: 'cement-basepad', isMerged: true },
    children: mergedChildren,
  };

  const mergedLabel: CADObject = {
    id: uid(),
    type: 'text',
    x: b.minX + b.width / 2 - 50,
    y: b.minY + b.height / 2 - 9,
    width: 100,
    height: 18,
    text: `CONCRETE PAD (${targetPads.length} PADS)`,
    fontSize: 9.5,
    bold: true,
    textColor: '#e2e8f0',
    bgColor: '#1e293b',
    stroke: '#475569',
    strokeWidth: 1,
    fill: '#1e293b',
    fillEnabled: true,
    fillOpacity: 0.9,
    opacity: 1,
    isStencilLabel: true,
    parentId: mergedId,
    layerId: activeLayerId || 'layer-basepads',
  };

  const filtered = objects.filter((o) => !removedPadIds.has(o.id) && !labelIdsToRemove.has(o.id));
  return {
    updatedObjects: [...filtered, mergedPad, mergedLabel],
    mergedId,
  };
};

export const createMergedExcavatedAreas = (
  objects: CADObject[],
  pitIds: string[],
  activeLayerId: string,
  settings: ProjectSettings
): { updatedObjects: CADObject[]; mergedId: string } | null => {
  const isExcavated = (o: CADObject) => {
    const s = o.stencilId || o.customProps?.stencilType || '';
    const lM = o.levelElevationM ?? o.customProps?.levelElevationM;
    return (
      s === 'excavated-pit' ||
      s.includes('excavat') ||
      (o.text && o.text.toLowerCase().includes('excavat')) ||
      (o.customProps?.name && String(o.customProps.name).toLowerCase().includes('excavat')) ||
      (lM !== undefined && lM < 0)
    );
  };

  const targetPits = objects.filter((o) => pitIds.includes(o.id) && isExcavated(o));
  if (targetPits.length < 2) return null;

  const b = getCombinedBounds(targetPits);
  if (!b) return null;

  const removedPitIds = new Set(targetPits.map((p) => p.id));
  const labelIdsToRemove = new Set(
    objects
      .filter((o) => (o.isStencilLabel || o.parentId) && o.parentId && removedPitIds.has(o.parentId))
      .map((o) => o.id)
  );

  const primaryPit = targetPits[0];
  const depthM = primaryPit.levelElevationM ?? primaryPit.customProps?.levelElevationM ?? -1.0;
  const retainingMat =
    primaryPit.foundationRetainingMaterial ?? primaryPit.customProps?.foundationRetainingMaterial ?? 'concrete';

  const mergedChildren: CADObject[] = targetPits.map((pit) => {
    const pb = getObjectBounds(pit);
    return {
      id: uid(),
      type: 'rectangle',
      x: pb.minX - b.minX,
      y: pb.minY - b.minY,
      width: pb.width,
      height: pb.height,
      stroke: 'transparent',
      strokeWidth: 0,
      fill: pit.fill || '#1c1917',
      fillEnabled: true,
      fillOpacity: pit.fillOpacity || 0.85,
      opacity: 1,
      customProps: {
        originalWidth: pb.width,
        originalHeight: pb.height,
      },
    };
  });

  const mergedId = uid();
  const mergedPit: CADObject = {
    id: mergedId,
    type: 'stencil-group',
    stencilId: 'excavated-pit',
    isStencil: true,
    isStretchable: true,
    stretchAxis: 'both',
    baseWidth: b.width,
    baseHeight: b.height,
    x: b.minX,
    y: b.minY,
    width: b.width,
    height: b.height,
    stroke: primaryPit.stroke || '#94a3b8',
    strokeWidth: 2,
    fill: '#1c1917',
    fillEnabled: true,
    fillOpacity: 0.85,
    opacity: 1,
    levelElevationM: depthM,
    foundationRetainingMaterial: retainingMat,
    layerId: activeLayerId || 'layer-civil',
    customProps: {
      stencilType: 'excavated-pit',
      isMerged: true,
      levelElevationM: depthM,
      foundationRetainingMaterial: retainingMat,
    },
    children: mergedChildren,
  };

  const mergedLabel: CADObject = {
    id: uid(),
    type: 'text',
    x: b.minX + b.width / 2 - 60,
    y: b.minY + b.height / 2 - 9,
    width: 120,
    height: 18,
    text: `EXCAVATED ZONE (${(b.width / settings.scaleFactor).toFixed(1)}m × ${(b.height / settings.scaleFactor).toFixed(1)}m)`,
    fontSize: 9.5,
    bold: true,
    textColor: '#38bdf8',
    bgColor: '#0c0a09',
    stroke: '#0284c7',
    strokeWidth: 1,
    fill: '#0c0a09',
    fillEnabled: true,
    fillOpacity: 0.9,
    opacity: 1,
    isStencilLabel: true,
    parentId: mergedId,
    layerId: activeLayerId || 'layer-civil',
  };

  const filtered = objects.filter((o) => !removedPitIds.has(o.id) && !labelIdsToRemove.has(o.id));
  return {
    updatedObjects: [...filtered, mergedPit, mergedLabel],
    mergedId,
  };
};
