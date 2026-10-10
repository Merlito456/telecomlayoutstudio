/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from "../../types/cad";
import { getRotatedObjectBounds } from "./bounds-handles";

export function isCableLadderObject(o: CADObject): boolean {
  if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return false;
  if (o.type === 'line' || o.type === 'polyline' || o.type === 'pen') return false;
  const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
  const name = String(o.customProps?.name || o.text || '').toLowerCase();
  if (s.includes('tower') || s.includes('monopole')) return false;
  return (
    s.includes('ladder') ||
    s.includes('cable-tray') ||
    s === 'cable-tray' ||
    Boolean(o.ladderType) ||
    Boolean(o.customProps?.ladderType) ||
    name.includes('cable ladder') ||
    name.includes('cable tray') ||
    name.includes('basepad ladder') ||
    name.includes('connecting ladder') ||
    name.includes('feeder ladder')
  );
}

export function isBasepadObject(o: CADObject): boolean {
  if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return false;
  const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
  return (
    s === 'cement-basepad' ||
    s === 'gen-basepad' ||
    s === 'tx-basepad' ||
    s === 'ac-basepad' ||
    s === 'cement-slab' ||
    s === 'elevated-basepad' ||
    s === 'custom-elevated-basepad' ||
    (s.includes('basepad') && !s.includes('ladder') && !s.includes('cable'))
  );
}

export function isRackObject(o: CADObject): boolean {
  if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return false;
  if (o.type === 'line' || o.type === 'polyline' || o.type === 'pen') return false;
  const s = (o.stencilId || o.customProps?.stencilType || (o as any).type || '').toLowerCase();
  const name = String(o.customProps?.name || o.text || (o as any).name || '').toLowerCase();
  const cat = (o.category || o.customProps?.category || '').toLowerCase();

  // Air conditioners and cooling equipment must NEVER be categorized as racks or cabinets
  if (
    s.includes('air-conditioner') ||
    s.includes('wall-mount-ac') ||
    s.includes('ac-indoor') ||
    s.includes('ac-split') ||
    cat === 'cooling' ||
    name.includes('air conditioner') ||
    name.includes('wall ac')
  ) {
    return false;
  }

  if (cat === 'rack' || cat === 'power' || cat === 'battery') return true;
  if (Boolean(o.customProps?.isRectifierSystem)) return true;
  return (
    s.startsWith('rack') ||
    s.includes('rack') ||
    s.includes('open-rack') ||
    s.includes('rectifier') ||
    s.includes('flatpack') ||
    s.includes('pdu') ||
    s.includes('ups') ||
    s.includes('battery') ||
    s.includes('acdb') ||
    s.includes('bay-') ||
    s.includes('subrack') ||
    s.includes('odf') ||
    s.includes('dwdm') ||
    s.includes('router') ||
    s.includes('mdf') ||
    s.includes('ddf') ||
    s.includes('bbu') ||
    s.includes('an6000') ||
    s.includes('an5516') ||
    s.includes('ma5800') ||
    s.includes('c600') ||
    s.includes('c650') ||
    s.includes('mf02') ||
    s.includes('df16') ||
    s.includes('fx08') ||
    s.includes('fx16') ||
    name.includes('rack') ||
    name.includes('subrack') ||
    name.includes('rectifier') ||
    name.includes('flatpack') ||
    name.includes('power') ||
    name.includes('battery') ||
    name.includes('olt bay') ||
    name.includes('core olt')
  );
}

/**
 * Unpacks any shelter interior equipment and overhead cable ladders into a flat candidate list
 * with accurate 2D coordinates and dimensions for consistent raycasting, snapping, and support elevation.
 */
export function getUnpackedCADObjects(allObjs: CADObject[]): CADObject[] {
  if (!Array.isArray(allObjs)) return [];
  const candidateObjs = [...allObjs];

  for (const o of allObjs) {
    if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') continue;
    const shId = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    if (shId === 'shelter' || shId === 'cement-shelter' || shId.includes('shelter')) {
      const interior = o.interiorObjects || o.customProps?.interiorObjects;
      if (Array.isArray(interior) && interior.length > 0) {
        const roomLenMm =
          (o as any).shelterLengthM ? Number((o as any).shelterLengthM) * 1000 :
          (o.customProps as any)?.roomLengthMm ? Number((o.customProps as any).roomLengthMm) :
          Math.max(1800, ((o.width || 80) / 20) * 1000);
        const roomWidMm =
          (o as any).shelterWidthM ? Number((o as any).shelterWidthM) * 1000 :
          (o.customProps as any)?.roomWidthMm ? Number((o.customProps as any).roomWidthMm) :
          Math.max(1800, ((o.height || 60) / 20) * 1000);

        for (const item of interior) {
          if (!candidateObjs.some((existing) => existing.id === item.id)) {
            const widthMm = item.widthMm ?? item.customProps?.widthMm ?? 600;
            const depthMm = item.depthMm ?? item.customProps?.depthMm ?? 600;
            const xMm = item.xMm ?? item.x ?? 0;
            const yMm = item.yMm ?? item.y ?? 0;
            const widthPx = Math.max(8, (widthMm / roomLenMm) * (o.width || 80));
            const depthPx = Math.max(8, (depthMm / roomWidMm) * (o.height || 60));
            const itemX2D = o.x + (xMm / roomLenMm) * (o.width || 80);
            const itemY2D = o.y + (yMm / roomWidMm) * (o.height || 60);

            candidateObjs.push({
              id: item.id,
              type: 'stencil-group',
              stencilId: item.stencilId,
              name: item.name || (item.category === 'ladder' ? 'In-Shelter Cable Ladder' : 'Equipment Rack'),
              category: item.category,
              x: itemX2D,
              y: itemY2D,
              width: widthPx,
              height: depthPx,
              rotation: item.rotationDeg || item.rotation || 0,
              uHeight: item.uHeight,
              heightMm: item.heightMm,
              elevationMm: item.elevationMm,
              customProps: {
                ...(item.customProps || {}),
                stencilType: item.stencilId,
                category: item.category,
                name: item.name,
                placement: 'indoor',
                ladderType: item.category === 'ladder' ? 'indoor' : undefined,
                parentShelterId: o.id,
              },
            } as any);
          }
        }
      }
    }
  }

  return candidateObjs;
}

export function isIndoorEquipment(o: CADObject): boolean {
  if (isRackObject(o)) return true;
  if (o.customProps?.placement === 'indoor' || (o as any).placement === 'indoor') return true;
  const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
  const name = String(o.customProps?.name || o.text || (o as any).name || '').toLowerCase();
  const cat = (o.category || o.customProps?.category || '').toLowerCase();
  return (
    s.includes('indoor') ||
    s.includes('in-shelter') ||
    s.includes('inshelter') ||
    s.includes('air-conditioner') ||
    s.includes('wall-mount-ac') ||
    s.includes('ac-indoor') ||
    s.includes('ac-split') ||
    s.includes('cooling') ||
    cat === 'cooling' ||
    s.includes('raceway') ||
    name.includes('indoor') ||
    name.includes('in-shelter') ||
    name.includes('air conditioner') ||
    name.includes('wall ac')
  );
}

export function isPointInsideShelter2D(
  pt: { x: number; y: number },
  allObjs: CADObject[],
  margin = 0
): boolean {
  if (!allObjs || !pt) return false;
  for (const o of allObjs) {
    if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') continue;
    const sId = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    if (sId === 'shelter' || sId === 'cement-shelter' || sId.includes('shelter')) {
      const b = getRotatedObjectBounds(o);
      if (
        pt.x >= b.minX - margin &&
        pt.x <= b.maxX + margin &&
        pt.y >= b.minY - margin &&
        pt.y <= b.maxY + margin
      ) {
        return true;
      }
    }
  }
  return false;
}

export function isIndoorPoint2D(
  pt: { x: number; y: number },
  allObjs: CADObject[]
): boolean {
  if (isPointInsideShelter2D(pt, allObjs, 14)) return true;
  if (!Array.isArray(allObjs)) return false;
  for (const o of allObjs) {
    if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') continue;
    if (isRackObject(o) || isIndoorEquipment(o)) {
      const b = getRotatedObjectBounds(o);
      if (
        pt.x >= b.minX - 16 &&
        pt.x <= b.maxX + 16 &&
        pt.y >= b.minY - 16 &&
        pt.y <= b.maxY + 16
      ) {
        return true;
      }
    }
    const sId = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    if (
      o.ladderType === 'indoor' ||
      o.customProps?.ladderType === 'indoor' ||
      sId.includes('indoor-ladder') ||
      sId.includes('raceway')
    ) {
      const b = getRotatedObjectBounds(o);
      if (
        pt.x >= b.minX - 14 &&
        pt.x <= b.maxX + 14 &&
        pt.y >= b.minY - 14 &&
        pt.y <= b.maxY + 14
      ) {
        return true;
      }
    }
  }
  return false;
}

export function isIndoorCable(
  cable: CADObject,
  allObjs: CADObject[]
): boolean {
  if (!cable) return false;
  if (cable.customProps?.placement === 'indoor' || cable.customProps?.isIndoor) return true;
  if (cable.presetId?.includes('indoor') || cable.stencilId?.includes('indoor')) return true;
  if ((cable.stroke || '').toLowerCase() === '#facc15') return true;

  let pts: Array<{ x: number; y: number }> = [];
  if (cable.type === 'line') {
    pts = [
      { x: cable.x, y: cable.y },
      { x: cable.x2 ?? cable.x + (cable.width || 0), y: cable.y2 ?? cable.y + (cable.height || 0) },
    ];
  } else if (cable.points && cable.points.length > 0) {
    pts = cable.points.map((p) => ({ x: cable.x + p.x, y: cable.y + p.y }));
  }

  for (const pt of pts) {
    if (isIndoorPoint2D(pt, allObjs)) return true;
  }
  return false;
}

export function isCabinetOrEquipmentObject(o: CADObject): boolean {
  if (o.isStencilLabel || o.type === 'text' || o.type === 'leader') return false;
  // Racks, indoor equipment, air conditioners, and shelters NEVER use outdoor LTC cable connectors
  if (isRackObject(o) || isIndoorEquipment(o)) return false;
  const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
  const cat = (o.category || o.customProps?.category || '').toLowerCase();
  if (s === 'shelter' || s === 'cement-shelter' || s.includes('shelter')) return false;
  if (cat === 'cooling' || s.includes('air-conditioner') || s.includes('wall-mount-ac')) return false;

  return (
    s.includes('cabinet') ||
    s.includes('odc') ||
    s.includes('eltek') ||
    s.includes('huawei') ||
    s.includes('atn') ||
    s.includes('nokia') ||
    s.includes('ericsson') ||
    s.includes('fushan') ||
    s.includes('fh') ||
    s === 'mpd' ||
    s === 'dcpdu' ||
    s.includes('ecb') ||
    s.includes('ats') ||
    s.includes('acpdb') ||
    s.includes('generator') ||
    s.includes('transformer')
  );
}

export interface CabinetLTCAttachment2D {
  cabinet: CADObject;
  cabinetName: string;
  wallSide: 'left' | 'right' | 'top' | 'bottom';
  wallX: number;
  wallY: number;
  normalX: number; // Inward normal into cabinet (+1, -1, or 0)
  normalY: number; // Inward normal into cabinet (+1, -1, or 0)
  dirX: number; // Alias for normalX
  dirY: number; // Alias for normalY
}

/**
 * Detects if a cable endpoint `endPt` (approaching from `prevPt`) has reached an outdoor Cabinet/Equipment
 * and computes the exact wall entry point and inward normal for attaching an LTC Connector gland.
 * Returns null if the endpoint is indoor or near indoor racks / shelters.
 */
export function findCabinetWallLTCAttachment2D(
  endPt: { x: number; y: number },
  prevPt: { x: number; y: number } | null | undefined,
  allObjs: CADObject[],
  snapMargin = 20,
  excludeCabinetId?: string
): CabinetLTCAttachment2D | null {
  if (!Array.isArray(allObjs) || !endPt) return null;
  // If the endpoint is indoor (in shelter or near racks), near objects should NOT attach LTC connectors
  if (isIndoorPoint2D(endPt, allObjs)) return null;
  if (prevPt && isIndoorPoint2D(prevPt, allObjs)) return null;
  let bestHit: CabinetLTCAttachment2D | null = null;
  let bestDist = Infinity;

  for (const cab of allObjs) {
    if (!isCabinetOrEquipmentObject(cab)) continue;
    // Racks and indoor equipment DO NOT use outdoor LTC connectors; they use open top waterfall drop
    if (isRackObject(cab) || isIndoorEquipment(cab)) continue;
    if (excludeCabinetId && cab.id === excludeCabinetId) continue;

    const cb = getRotatedObjectBounds(cab);
    const inExpandedBox =
      endPt.x >= cb.minX - snapMargin &&
      endPt.x <= cb.maxX + snapMargin &&
      endPt.y >= cb.minY - snapMargin &&
      endPt.y <= cb.maxY + snapMargin;
    if (!inExpandedBox) continue;

    const s = (cab.stencilId || cab.customProps?.stencilType || 'cabinet').toLowerCase();
    const cabinetName = String(cab.customProps?.name || cab.text || s.replace(/-/g, ' ')).toUpperCase();
    const padX = Math.min(6, Math.max(2, cb.width * 0.12));
    const padY = Math.min(6, Math.max(2, cb.height * 0.12));

    // If prevPt is outside the cabinet, check if the straight/angled line (prevPt -> endPt) intersects one of the 4 cabinet walls
    if (
      prevPt &&
      (prevPt.x < cb.minX - 2 || prevPt.x > cb.maxX + 2 || prevPt.y < cb.minY - 2 || prevPt.y > cb.maxY + 2)
    ) {
      const dx = endPt.x - prevPt.x;
      const dy = endPt.y - prevPt.y;
      const candidates: Array<{
        t: number;
        wx: number;
        wy: number;
        side: 'left' | 'right' | 'top' | 'bottom';
        nx: number;
        ny: number;
      }> = [];

      // Left wall (x = cb.minX)
      if (Math.abs(dx) > 1e-4) {
        const t = (cb.minX - prevPt.x) / dx;
        if (t >= 0 && t <= 1.05) {
          const y = prevPt.y + t * dy;
          if (y >= cb.minY - 2 && y <= cb.maxY + 2) {
            candidates.push({
              t,
              wx: cb.minX,
              wy: Math.max(cb.minY + padY, Math.min(cb.maxY - padY, y)),
              side: 'left',
              nx: 1,
              ny: 0,
            });
          }
        }
      }

      // Right wall (x = cb.maxX)
      if (Math.abs(dx) > 1e-4) {
        const t = (cb.maxX - prevPt.x) / dx;
        if (t >= 0 && t <= 1.05) {
          const y = prevPt.y + t * dy;
          if (y >= cb.minY - 2 && y <= cb.maxY + 2) {
            candidates.push({
              t,
              wx: cb.maxX,
              wy: Math.max(cb.minY + padY, Math.min(cb.maxY - padY, y)),
              side: 'right',
              nx: -1,
              ny: 0,
            });
          }
        }
      }

      // Top wall (y = cb.minY)
      if (Math.abs(dy) > 1e-4) {
        const t = (cb.minY - prevPt.y) / dy;
        if (t >= 0 && t <= 1.05) {
          const x = prevPt.x + t * dx;
          if (x >= cb.minX - 2 && x <= cb.maxX + 2) {
            candidates.push({
              t,
              wx: Math.max(cb.minX + padX, Math.min(cb.maxX - padX, x)),
              wy: cb.minY,
              side: 'top',
              nx: 0,
              ny: 1,
            });
          }
        }
      }

      // Bottom wall (y = cb.maxY)
      if (Math.abs(dy) > 1e-4) {
        const t = (cb.maxY - prevPt.y) / dy;
        if (t >= 0 && t <= 1.05) {
          const x = prevPt.x + t * dx;
          if (x >= cb.minX - 2 && x <= cb.maxX + 2) {
            candidates.push({
              t,
              wx: Math.max(cb.minX + padX, Math.min(cb.maxX - padX, x)),
              wy: cb.maxY,
              side: 'bottom',
              nx: 0,
              ny: -1,
            });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.t - b.t);
        const hit = candidates[0];
        const dist = Math.hypot(endPt.x - hit.wx, endPt.y - hit.wy);
        if (dist < bestDist) {
          bestDist = dist;
          bestHit = {
            cabinet: cab,
            cabinetName,
            wallSide: hit.side,
            wallX: Math.round(hit.wx),
            wallY: Math.round(hit.wy),
            normalX: hit.nx,
            normalY: hit.ny,
            dirX: hit.nx,
            dirY: hit.ny,
          };
        }
        continue;
      }
    }

    // Fallback: If no ray-line intersection or prevPt inside, snap to nearest of the 4 perimeter walls
    const dLeft = Math.abs(endPt.x - cb.minX);
    const dRight = Math.abs(endPt.x - cb.maxX);
    const dTop = Math.abs(endPt.y - cb.minY);
    const dBottom = Math.abs(endPt.y - cb.maxY);
    const minD = Math.min(dLeft, dRight, dTop, dBottom);

    let wBest: { side: 'left' | 'right' | 'top' | 'bottom'; wx: number; wy: number; nx: number; ny: number };
    if (minD === dLeft) {
      wBest = {
        side: 'left',
        wx: cb.minX,
        wy: Math.max(cb.minY + padY, Math.min(cb.maxY - padY, endPt.y)),
        nx: 1,
        ny: 0,
      };
    } else if (minD === dRight) {
      wBest = {
        side: 'right',
        wx: cb.maxX,
        wy: Math.max(cb.minY + padY, Math.min(cb.maxY - padY, endPt.y)),
        nx: -1,
        ny: 0,
      };
    } else if (minD === dTop) {
      wBest = {
        side: 'top',
        wx: Math.max(cb.minX + padX, Math.min(cb.maxX - padX, endPt.x)),
        wy: cb.minY,
        nx: 0,
        ny: 1,
      };
    } else {
      wBest = {
        side: 'bottom',
        wx: Math.max(cb.minX + padX, Math.min(cb.maxX - padX, endPt.x)),
        wy: cb.maxY,
        nx: 0,
        ny: -1,
      };
    }

    const dist = Math.hypot(endPt.x - wBest.wx, endPt.y - wBest.wy);
    if (dist < bestDist) {
      bestDist = dist;
      bestHit = {
        cabinet: cab,
        cabinetName,
        wallSide: wBest.side,
        wallX: Math.round(wBest.wx),
        wallY: Math.round(wBest.wy),
        normalX: wBest.nx,
        normalY: wBest.ny,
        dirX: wBest.nx,
        dirY: wBest.ny,
      };
    }
  }

  return bestHit;
}
