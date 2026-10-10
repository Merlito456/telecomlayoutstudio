/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../types/cad';
import { STENCILS } from './stencils';

export const DEFAULT_SETTINGS: ProjectSettings = {
  scaleFactor: 20, // 20px = 1m
  unit: 'm',
  gridSize: 20,
  gridVisible: true,
  gridSnap: true,
  objectSnap: true,
  orthoMode: false,
  autoDims: false,
  showMeasurements: true,
  showObjectLabels: true,
  selectionBoxStyle: 'box',
  dimensionArrowStyle: 'slash',
  dimensionUnitFormat: 'm',
  showTitleBlock: true,
  showNorthArrow: true,
  showScaleBar: true,
  showLegend: false,
  renderStyle: 'photo', // Photorealistic 2D rendering mode by default
  cadTheme: 'dark',
  fileName: 'Site_Plan_Layout_A1',
  drawingNumber: 'DWG-TL-2026-A101',
  siteId: 'SITE-MNL-042',
  canvasWidth: 1600,
  canvasHeight: 1000,
  defaultFontFamily: 'titillium-web',
};

export function uid(): string {
  return 'cad_' + Math.random().toString(36).substring(2, 9);
}

// Seed rich default Telecom Cell Site Layout plan on initial app launch
export function generateDefaultSeedObjects(): CADObject[] {
  const seeded: CADObject[] = [];

  // 1. Shelter
  const shelterDef = STENCILS.find((s) => s.id === 'shelter');
  if (shelterDef) seeded.push(...shelterDef.createObjects({ x: 380, y: 320 }, 20));

  // 2. 4-Leg Tower
  const towerDef = STENCILS.find((s) => s.id === '4leg-tower');
  if (towerDef) seeded.push(...towerDef.createObjects({ x: 680, y: 280 }, 20));

  // 3. Generator + Pad
  const genDef = STENCILS.find((s) => s.id === 'generator-pad');
  if (genDef) seeded.push(...genDef.createObjects({ x: 180, y: 480 }, 20));

  // 4. Fuel Tank
  const fuelDef = STENCILS.find((s) => s.id === 'fuel-tank');
  if (fuelDef) seeded.push(...fuelDef.createObjects({ x: 180, y: 600 }, 20));

  // 5. Transformer
  const txDef = STENCILS.find((s) => s.id === 'transformer');
  if (txDef) seeded.push(...txDef.createObjects({ x: 180, y: 340 }, 20));

  // 5b. Official White Telecom Cabinets (Huawei, Ericsson, Fushan, FH ODC)
  const hwDef = STENCILS.find((s) => s.id === 'huawei-2bay');
  if (hwDef) seeded.push(...hwDef.createObjects({ x: 380, y: 500 }, 20));

  const ericDef = STENCILS.find((s) => s.id === 'ericsson-1bay');
  if (ericDef) seeded.push(...ericDef.createObjects({ x: 470, y: 500 }, 20));

  const fushanDef = STENCILS.find((s) => s.id === 'fushan-2bay');
  if (fushanDef) seeded.push(...fushanDef.createObjects({ x: 380, y: 560 }, 20));

  const fhodcDef = STENCILS.find((s) => s.id === 'fhodc-mini-odc');
  if (fhodcDef) seeded.push(...fhodcDef.createObjects({ x: 470, y: 560 }, 20));

  // 6. Cable Tray linking shelter to tower
  const trayDef = STENCILS.find((s) => s.id === 'cable-tray');
  if (trayDef) {
    const trayObjs = trayDef.createObjects({ x: 560, y: 360 }, 20);
    trayObjs[0].width = 120; // Stretched along X
    seeded.push(...trayObjs);
  }

  // 7. Gate & Boundary Fence
  const gateDef = STENCILS.find((s) => s.id === 'gate-2door');
  if (gateDef) seeded.push(...gateDef.createObjects({ x: 420, y: 760 }, 20));

  const fenceDef = STENCILS.find((s) => s.id === 'cement-fence');
  if (fenceDef) {
    const f1 = fenceDef.createObjects({ x: 120, y: 760 }, 20);
    f1[0].width = 300;
    seeded.push(...f1);

    const f2 = fenceDef.createObjects({ x: 600, y: 760 }, 20);
    f2[0].width = 320;
    seeded.push(...f2);
  }

  // 8. Horizontal Dimension line at bottom with FROM-TO standard drafting
  seeded.push({
    id: uid(),
    type: 'dim-h',
    x: 120,
    y: 760,
    width: 800,
    height: 0,
    x2: 920,
    y2: 760,
    dimOffset: 60,
    fromLabel: 'West Perimeter Fence',
    toLabel: 'East Perimeter Fence',
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
  });

  // 9. Standard Clearance Dimension: FROM Shelter TO Tower
  seeded.push({
    id: uid(),
    type: 'dim-h',
    x: 560,
    y: 340,
    width: 120,
    height: 0,
    x2: 680,
    y2: 340,
    dimOffset: -45,
    fromLabel: 'Shelter East Wall',
    toLabel: 'Tower West Leg',
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
  });

  return seeded;
}

// Clean up orphaned stencil labels, purge rogue micro lines, and deduplicate overlapping wire lines
export function sanitizeStencilObjects(objs: CADObject[]): CADObject[] {
  const parentMap = new Map<string, CADObject>();
  for (const o of objs) {
    if (!o.isStencilLabel && !o.parentId) {
      parentMap.set(o.id, o);
    }
  }

  const keptLines: Array<{ minX: number; minY: number; maxX: number; maxY: number; isHoriz: boolean; isVert: boolean }> = [];

  return objs
    .filter((o) => {
      if ((o.isStencilLabel || o.parentId) && o.parentId && !parentMap.has(o.parentId)) {
        return false;
      }
      if (o.id.startsWith('cable3d_') && !o.id.startsWith('cable3d_route_')) {
        return false;
      }
      if (o.type === 'line') {
        const x1 = o.x;
        const y1 = o.y;
        const x2 = o.x2 ?? o.x + (o.width || 0);
        const y2 = o.y2 ?? o.y + (o.height || 0);
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const len = Math.hypot(dx, dy);
        if (len < 3) return false;

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const isHoriz = dy <= 6;
        const isVert = dx <= 6;

        // Deduplicate identical or collinear overlapping lines
        for (const k of keptLines) {
          if (
            Math.abs(k.minX - minX) <= 5 &&
            Math.abs(k.minY - minY) <= 5 &&
            Math.abs(k.maxX - maxX) <= 5 &&
            Math.abs(k.maxY - maxY) <= 5
          ) {
            return false;
          }
          if (isHoriz && k.isHoriz && Math.abs((minY + maxY) / 2 - (k.minY + k.maxY) / 2) <= 5) {
            const overlapX = Math.min(maxX, k.maxX) - Math.max(minX, k.minX);
            const shorterW = Math.max(1, Math.min(maxX - minX, k.maxX - k.minX));
            if (overlapX / shorterW >= 0.8) {
              return false;
            }
          }
          if (isVert && k.isVert && Math.abs((minX + maxX) / 2 - (k.minX + k.maxX) / 2) <= 5) {
            const overlapY = Math.min(maxY, k.maxY) - Math.max(minY, k.minY);
            const shorterH = Math.max(1, Math.min(maxY - minY, k.maxY - k.minY));
            if (overlapY / shorterH >= 0.8) {
              return false;
            }
          }
        }
        keptLines.push({ minX, minY, maxX, maxY, isHoriz, isVert });
      }
      return true;
    })
    .map((o) => {
      if ((o.isStencilLabel || o.parentId) && o.parentId) {
        const parent = parentMap.get(o.parentId);
        if (parent) {
          const expectedX = parent.x + (parent.width || 0) / 2 - (o.width || 40) / 2;
          const expectedY = parent.y - ((o.height || 12) + 3);
          const dist = Math.hypot(o.x - expectedX, o.y - expectedY);
          if (dist > Math.max(parent.width || 40, parent.height || 40) + 45) {
            return { ...o, x: expectedX, y: expectedY };
          }
        }
      }
      return o;
    });
}
