/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADLayer, CADObject } from '../../../types/cad';
import { isObjectLayerVisible } from '../../../utils/cad-layers';

export interface RebuildCablesParams {
  currentObjs: CADObject[];
  cablesGroup: THREE.Group;
  wireNetworkElevCache: Map<string, any>;
  layers: CADLayer[];
  centerX: number;
  centerY: number;
  scale3D: number;
  buildWireCables3D: (
    obj: CADObject,
    visObjs: CADObject[],
    centerX: number,
    centerY: number,
    scale3D: number
  ) => THREE.Group | null;
}

export function rebuildCablesInScene({
  currentObjs,
  cablesGroup,
  wireNetworkElevCache,
  layers,
  centerX,
  centerY,
  scale3D,
  buildWireCables3D,
}: RebuildCablesParams): void {
  while (cablesGroup.children.length > 0) {
    cablesGroup.remove(cablesGroup.children[0]);
  }
  wireNetworkElevCache.clear();

  const seenLines: Array<{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    isHoriz: boolean;
    isVert: boolean;
  }> = [];

  const visObjs = currentObjs.filter((o) => {
    if (layers.length > 0 && !isObjectLayerVisible(o, layers)) return false;
    if (o.type === 'line') {
      const x1 = o.x;
      const y1 = o.y;
      const x2 = o.x2 ?? o.x + (o.width || 0);
      const y2 = o.y2 ?? o.y + (o.height || 0);
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      if (Math.hypot(dx, dy) < 3) return false;
      const lMinX = Math.min(x1, x2);
      const lMaxX = Math.max(x1, x2);
      const lMinY = Math.min(y1, y2);
      const lMaxY = Math.max(y1, y2);
      const isHoriz = dy <= 6;
      const isVert = dx <= 6;
      for (const k of seenLines) {
        if (
          Math.abs(k.minX - lMinX) <= 5 &&
          Math.abs(k.minY - lMinY) <= 5 &&
          Math.abs(k.maxX - lMaxX) <= 5 &&
          Math.abs(k.maxY - lMaxY) <= 5
        ) {
          return false;
        }
        if (isHoriz && k.isHoriz && Math.abs((lMinY + lMaxY) / 2 - (k.minY + k.maxY) / 2) <= 5) {
          const overlapX = Math.min(lMaxX, k.maxX) - Math.max(lMinX, k.minX);
          if (overlapX / Math.max(1, Math.min(lMaxX - lMinX, k.maxX - k.minX)) >= 0.8) return false;
        }
        if (isVert && k.isVert && Math.abs((lMinX + lMaxX) / 2 - (k.minX + k.maxX) / 2) <= 5) {
          const overlapY = Math.min(lMaxY, k.maxY) - Math.max(lMinY, k.minY);
          if (overlapY / Math.max(1, Math.min(lMaxY - lMinY, k.maxY - k.minY)) >= 0.8) return false;
        }
      }
      seenLines.push({ minX: lMinX, minY: lMinY, maxX: lMaxX, maxY: lMaxY, isHoriz, isVert });
    }
    return true;
  });

  for (const o of visObjs) {
    if (o.type === 'line' || o.type === 'polyline' || o.type === 'pen') {
      const wg = buildWireCables3D(o, visObjs, centerX, centerY, scale3D);
      if (wg) {
        wg.userData.cadObjectId = o.id;
        wg.traverse((node) => {
          node.userData.cadObjectId = o.id;
        });
        cablesGroup.add(wg);
      }
    }
  }
}
