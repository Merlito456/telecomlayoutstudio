/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from '../../../../types/cad';
import { getObjectBounds } from '../../../../utils/cad-geometry';
import { CoordTransform, ExcavatedZone3D, YardBounds3D } from '../types';

export const ELEVATION_3D_SCALE = 1.6;

export function computeTerrainBoundsAndExcavations(
  visible3DObjects: CADObject[]
): {
  coordTransform: CoordTransform;
  yardBounds: YardBounds3D;
  excavatedZones: ExcavatedZone3D[];
  perimeterObjs: CADObject[];
} {
  const physicalObjs = visible3DObjects.filter(
    (o) =>
      o.type !== 'dim-h' &&
      o.type !== 'dim-v' &&
      o.type !== 'dim-aligned' &&
      o.type !== 'leader' &&
      o.type !== 'line' &&
      o.type !== 'polyline' &&
      o.type !== 'pen' &&
      !o.isStencilLabel
  );
  const targetObjs = physicalObjs.length > 0 ? physicalObjs : visible3DObjects;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  targetObjs.forEach((o) => {
    const b = getObjectBounds(o);
    if (b.minX < minX) minX = b.minX;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxY > maxY) maxY = b.maxY;
  });

  if (minX === Infinity) {
    minX = 0;
    maxX = 800;
    minY = 0;
    maxY = 600;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const scale3D = 0.22;
  const coordTransform: CoordTransform = { centerX, centerY, scale3D };

  const perimeterObjs = targetObjs.filter((o) => {
    const s = o.stencilId || o.customProps?.stencilType;
    return (
      s === 'boundary-fence' ||
      s === 'cement-fence' ||
      s === 'fence' ||
      s === 'wall' ||
      s === 'masonry-wall' ||
      s === 'perimeter-wall' ||
      s === 'gate' ||
      s === 'gate-2door'
    );
  });

  let pMinX = minX;
  let pMaxX = maxX;
  let pMinY = minY;
  let pMaxY = maxY;

  if (perimeterObjs.length > 0) {
    pMinX = Infinity;
    pMaxX = -Infinity;
    pMinY = Infinity;
    pMaxY = -Infinity;
    perimeterObjs.forEach((o) => {
      const b = getObjectBounds(o);
      if (b.minX < pMinX) pMinX = b.minX;
      if (b.maxX > pMaxX) pMaxX = b.maxX;
      if (b.minY < pMinY) pMinY = b.minY;
      if (b.maxY > pMaxY) pMaxY = b.maxY;
    });
  }

  const padMargin = perimeterObjs.length > 0 ? 1.0 : 8.0;
  const yard3DMinX = (pMinX - centerX) * scale3D - padMargin;
  const yard3DMaxX = (pMaxX - centerX) * scale3D + padMargin;
  const yard3DMinZ = (pMinY - centerY) * scale3D - padMargin;
  const yard3DMaxZ = (pMaxY - centerY) * scale3D + padMargin;

  const yardWidth = Math.max(yard3DMaxX - yard3DMinX, 60);
  const yardDepth = Math.max(yard3DMaxZ - yard3DMinZ, 60);
  const yardMidX = (yard3DMinX + yard3DMaxX) / 2;
  const yardMidZ = (yard3DMinZ + yard3DMaxZ) / 2;

  const yardBounds: YardBounds3D = {
    yard3DMinX,
    yard3DMaxX,
    yard3DMinZ,
    yard3DMaxZ,
    yardWidth,
    yardDepth,
    yardMidX,
    yardMidZ,
    centerX,
    centerY,
    scale3D,
  };

  const excavatedZones: ExcavatedZone3D[] = [];
  visible3DObjects.forEach((o) => {
    if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return;
    const sId = o.stencilId || o.customProps?.stencilType || '';
    const lM = o.levelElevationM ?? o.customProps?.levelElevationM;
    const isPerimeterObj =
      sId === 'wall' ||
      sId === 'masonry-wall' ||
      sId === 'perimeter-wall' ||
      sId === 'boundary-fence' ||
      sId === 'cement-fence' ||
      sId === 'gate-2door' ||
      sId === 'cement-post';
    const isExcavated =
      sId === 'excavated-pit' ||
      sId.includes('excavat') ||
      (o.customProps?.name && String(o.customProps.name).toLowerCase().includes('excavat')) ||
      (!isPerimeterObj && (sId === '' || o.type === 'rectangle') && lM !== undefined && lM < 0);

    if (isExcavated) {
      const depthM = lM !== undefined && lM < 0 ? Math.abs(lM) : 1.0;
      const depth3D = Math.max(0.5, depthM * ELEVATION_3D_SCALE);
      const b = getObjectBounds(o);
      const minX3D = (b.minX - centerX) * scale3D;
      const maxX3D = (b.maxX - centerX) * scale3D;
      const minZ3D = (b.minY - centerY) * scale3D;
      const maxZ3D = (b.maxY - centerY) * scale3D;
      excavatedZones.push({
        id: o.id,
        minX: minX3D,
        maxX: maxX3D,
        minZ: minZ3D,
        maxZ: maxZ3D,
        depth3D,
        levelM: -depthM,
        retainingMat: (o.foundationRetainingMaterial ??
          o.customProps?.foundationRetainingMaterial ??
          'concrete') as any,
      });
    }
  });

  return { coordTransform, yardBounds, excavatedZones, perimeterObjs };
}
