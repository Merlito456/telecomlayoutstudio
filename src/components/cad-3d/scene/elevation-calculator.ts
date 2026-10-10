/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from '../../../types/cad';
import { getObjectBounds, getRotatedObjectBounds } from '../../../utils/cad-geometry';
import { ELEVATION_3D_SCALE } from './terrain-builder';

export function calculateObjectElevationY(
  obj: CADObject,
  objIndex: number,
  visible3DObjects: CADObject[],
  stencilId: string
): number {
  let elevY = 0;

  const isSurfaceStencil =
    stencilId === 'grass-area' ||
    stencilId === 'grass-patch' ||
    stencilId === 'gravel-pad' ||
    stencilId === 'compound-gravel' ||
    stencilId === 'concrete-yard' ||
    stencilId === 'asphalt-road' ||
    stencilId === 'road-segment' ||
    stencilId === 'sidewalk' ||
    stencilId === 'flowers-bed' ||
    stencilId === 'drainage-canal' ||
    stencilId === 'excavated-pit' ||
    stencilId === 'elevated-terrace' ||
    stencilId === 'earth-berm-level';

  if (isSurfaceStencil) {
    const currentBounds = getObjectBounds(obj);
    let surfaceStackLevel = 0;
    for (let prevIdx = 0; prevIdx < objIndex; prevIdx++) {
      const prev = visible3DObjects[prevIdx];
      const prevId = prev.stencilId || prev.customProps?.stencilType;
      const isPrevSurface =
        prevId === 'gravel-pad' ||
        prevId === 'compound-gravel' ||
        prevId === 'concrete-yard' ||
        prevId === 'grass-area' ||
        prevId === 'grass-patch' ||
        prevId === 'asphalt-road' ||
        prevId === 'road-segment' ||
        prevId === 'sidewalk' ||
        prevId === 'flowers-bed';
      if (isPrevSurface) {
        const prevBounds = getObjectBounds(prev);
        const overlap = !(
          currentBounds.maxX <= prevBounds.minX ||
          currentBounds.minX >= prevBounds.maxX ||
          currentBounds.maxY <= prevBounds.minY ||
          currentBounds.minY >= prevBounds.maxY
        );
        if (overlap) {
          surfaceStackLevel++;
        }
      }
    }
    if (surfaceStackLevel > 0) {
      elevY = surfaceStackLevel * 0.15;
    }
  }

  const isPerimeter =
    stencilId === 'wall' ||
    stencilId === 'masonry-wall' ||
    stencilId === 'perimeter-wall' ||
    stencilId === 'boundary-fence' ||
    stencilId === 'cement-fence' ||
    stencilId === 'gate-2door';

  const isGroundFoundedTower =
    stencilId === '4leg-tower' ||
    stencilId === 'tower-4leg' ||
    stencilId === '3leg-tower' ||
    stencilId === 'tower-3leg' ||
    stencilId === 'monopole' ||
    stencilId === 'monopole-tower' ||
    stencilId === 'monopole-platform' ||
    stencilId === 'guyed-tower' ||
    stencilId === 'tower-footing' ||
    stencilId === 'guy-anchor';

  const isUnevenZone =
    stencilId === 'excavated-pit' ||
    stencilId === 'elevated-terrace' ||
    stencilId === 'earth-berm-level';

  let zoneLevelFound: number | undefined = undefined;
  if (!isUnevenZone && !isSurfaceStencil && !isPerimeter && !isGroundFoundedTower) {
    const objCenter = {
      x: obj.x + (obj.width || 0) / 2,
      y: obj.y + (obj.height || 0) / 2,
    };
    for (const zone of visible3DObjects) {
      if (zone.id === obj.id) continue;
      const zId = zone.stencilId || zone.customProps?.stencilType || '';
      const zoneLevelM = zone.levelElevationM ?? zone.customProps?.levelElevationM;
      const isZoneContainer =
        zId === 'excavated-pit' ||
        zId === 'elevated-terrace' ||
        zId === 'earth-berm-level' ||
        zId.includes('excavat') ||
        (zone.customProps?.name &&
          String(zone.customProps.name).toLowerCase().includes('excavat')) ||
        ((zId === '' || zone.type === 'rectangle') &&
          zoneLevelM !== undefined &&
          zoneLevelM < 0);
      if (isZoneContainer && zoneLevelM !== undefined && zoneLevelM !== 0) {
        const zb = getObjectBounds(zone);
        if (
          objCenter.x >= zb.minX &&
          objCenter.x <= zb.maxX &&
          objCenter.y >= zb.minY &&
          objCenter.y <= zb.maxY
        ) {
          zoneLevelFound = zoneLevelM;
          break;
        }
      }
    }
  }

  const selfLevelM = obj.levelElevationM ?? obj.customProps?.levelElevationM;
  if (!isUnevenZone && !isSurfaceStencil && !isGroundFoundedTower) {
    if (isPerimeter) {
      if (selfLevelM !== undefined && selfLevelM > 0) {
        elevY += selfLevelM * ELEVATION_3D_SCALE;
      }
    } else if (selfLevelM !== undefined && selfLevelM !== 0) {
      elevY += selfLevelM * ELEVATION_3D_SCALE;
    } else if (zoneLevelFound !== undefined) {
      elevY += zoneLevelFound * ELEVATION_3D_SCALE;
    }
  }

  const isBasepad =
    stencilId === 'cement-basepad' ||
    stencilId === 'gen-basepad' ||
    stencilId === 'tx-basepad' ||
    stencilId === 'ac-basepad' ||
    stencilId === 'cement-slab' ||
    stencilId === 'elevated-basepad' ||
    stencilId === 'custom-elevated-basepad';

  if (
    !isBasepad &&
    !isSurfaceStencil &&
    !isGroundFoundedTower &&
    !isPerimeter &&
    stencilId !== 'cement-post' &&
    stencilId !== 'ground-stairs-3step' &&
    stencilId !== 'cement-stairs' &&
    stencilId !== 'wall-roof-shade' &&
    stencilId !== 'wall-roof-canopy'
  ) {
    const objCenter = {
      x: obj.x + (obj.width || 0) / 2,
      y: obj.y + (obj.height || 0) / 2,
    };
    const ob = getRotatedObjectBounds(obj);
    const sIdLower = stencilId.toLowerCase();
    const objNameLower = String(obj.customProps?.name || (obj as any).name || obj.text || '').toLowerCase();

    const isCableLadderItem =
      stencilId === 'basepad-ladder' ||
      stencilId === 'cabin-feeder-ladder' ||
      stencilId === 'indoor-ladder' ||
      stencilId === 'indoor-ladder-long' ||
      stencilId === 'indoor-ladder-junction' ||
      stencilId === 'in-shelter-ladder' ||
      stencilId === 'in-shelter-cable-ladder' ||
      stencilId === 'inshelter-ladder' ||
      stencilId === 'inshelter-cable-ladder' ||
      stencilId === 'fiber-raceway-yellow' ||
      stencilId === 'fiber-raceway' ||
      stencilId === 'connecting-ladder' ||
      stencilId === 'cable-ladder-top' ||
      stencilId === 'cable-ladder' ||
      stencilId === 'cable-tray' ||
      sIdLower.includes('ladder') ||
      sIdLower.includes('raceway') ||
      sIdLower.includes('runway') ||
      sIdLower.includes('tray') ||
      obj.ladderType !== undefined ||
      obj.customProps?.ladderType !== undefined ||
      objNameLower.includes('ladder');

    const isIndoorLadderItem =
      stencilId === 'indoor-ladder' ||
      stencilId === 'indoor-ladder-long' ||
      stencilId === 'indoor-ladder-junction' ||
      stencilId === 'in-shelter-ladder' ||
      stencilId === 'in-shelter-cable-ladder' ||
      stencilId === 'inshelter-ladder' ||
      stencilId === 'inshelter-cable-ladder' ||
      stencilId === 'fiber-raceway-yellow' ||
      stencilId === 'fiber-raceway' ||
      obj.ladderType === 'indoor' ||
      obj.customProps?.ladderType === 'indoor' ||
      obj.customProps?.placement === 'indoor' ||
      sIdLower.includes('indoor') ||
      sIdLower.includes('raceway') ||
      sIdLower.includes('in-shelter') ||
      sIdLower.includes('inshelter') ||
      (sIdLower.includes('shelter') && sIdLower.includes('ladder')) ||
      objNameLower.includes('indoor') ||
      objNameLower.includes('raceway') ||
      objNameLower.includes('in-shelter') ||
      objNameLower.includes('inshelter') ||
      (sIdLower.includes('ladder') && (obj.customProps?.placement === 'indoor' || (obj as any).ladderType === 'indoor'));

    // 1. Check if placed inside or over a Walk-In Shelter
    let insideShelter = false;
    let shelterCeilingElev = 21.5;
    let sPadH = 3.5;
    let shBaseElev = 0;
    for (const sh of visible3DObjects) {
      if (sh.id === obj.id) continue;
      const shId = (sh.stencilId || sh.customProps?.stencilType || '').toLowerCase();
      if (shId === 'shelter' || shId === 'cement-shelter' || shId.includes('shelter')) {
        const sb = getRotatedObjectBounds(sh);
        const bridgeMargin = isCableLadderItem ? 25 : 0;
        const overlap = !(
          ob.maxX < sb.minX - bridgeMargin ||
          ob.minX > sb.maxX + bridgeMargin ||
          ob.maxY < sb.minY - bridgeMargin ||
          ob.minY > sb.maxY + bridgeMargin
        );
        if (overlap) {
          insideShelter = true;
          sPadH = 3.5;
          shBaseElev = sh.levelElevationM ? sh.levelElevationM * ELEVATION_3D_SCALE : 0;
          const sWallH =
            Math.max(2.0, Math.min(6.0, Number(sh.shelterHeightM || sh.customProps?.shelterHeightM || 3.0))) * 6.0;
          shelterCeilingElev = shBaseElev + sPadH + sWallH;
          break;
        }
      }
    }

    const isACItem =
      stencilId === 'air-conditioner' ||
      stencilId === 'wall-mount-ac' ||
      stencilId === 'ac-indoor-split' ||
      stencilId === 'ac-split' ||
      sIdLower.includes('air-conditioner') ||
      sIdLower.includes('wall-mount-ac') ||
      (obj as any).category === 'cooling' ||
      obj.customProps?.category === 'cooling' ||
      objNameLower.includes('air conditioner') ||
      objNameLower.includes('wall ac');

    if (isIndoorLadderItem) {
      // In-shelter cable ladder is suspended from shelter ceiling by threaded drop-rods
      if (insideShelter) {
        elevY = shelterCeilingElev - 1.35;
      } else {
        // Standalone or elevated overhead runway
        elevY = Math.max(elevY, 18.5);
      }
    } else if (isACItem) {
      // Wall-mount AC is suspended high on the wall (default +2.2m elevation above floor)
      const elevMm = Number(
        obj.elevationMm ??
        obj.customProps?.elevationMm ??
        obj.customProps?.placementHeightMm ??
        2200
      );
      const acElev3D = (elevMm / 1000) * 6.0;
      elevY = (insideShelter ? (sPadH + shBaseElev) : 0) + acElev3D;
    } else if (insideShelter) {
      // Equipment racks, rectifiers, and devices inside shelter sit on the shelter floor slab
      elevY = sPadH + shBaseElev;
    } else {
      for (const pad of visible3DObjects) {
        const padId = pad.stencilId || pad.customProps?.stencilType;
        if (
          padId === 'cement-basepad' ||
          padId === 'gen-basepad' ||
          padId === 'tx-basepad' ||
          padId === 'ac-basepad' ||
          padId === 'cement-slab' ||
          padId === 'elevated-basepad' ||
          padId === 'custom-elevated-basepad'
        ) {
          const pb = getRotatedObjectBounds(pad);
          const centerInside =
            objCenter.x >= pb.minX &&
            objCenter.x <= pb.maxX &&
            objCenter.y >= pb.minY &&
            objCenter.y <= pb.maxY;
          const bridgeMargin = isCableLadderItem ? 45 : 0;
          const overlap = !(
            ob.maxX < pb.minX - bridgeMargin ||
            ob.minX > pb.maxX + bridgeMargin ||
            ob.maxY < pb.minY - bridgeMargin ||
            ob.minY > pb.maxY + bridgeMargin
          );
          if (centerInside || (isCableLadderItem && overlap)) {
            const padTop =
              padId === 'elevated-basepad' || padId === 'custom-elevated-basepad'
                ? 6.0
                : pad.basepadHeight !== undefined
                ? (pad.basepadHeight / 1000) * 10
                : pad.customProps?.basepadHeight !== undefined
                ? (pad.customProps.basepadHeight / 1000) * 10
                : 1.2;
            elevY += padTop;
            break;
          }
        }
      }
    }
  }

  if (obj.customProps?.placement === 'cabinet-top') {
    elevY = Math.max(elevY, 18.0);
  }

  if (
    stencilId === 'wall-roof-shade' ||
    stencilId === 'wall-roof-canopy' ||
    obj.customProps?.isRoofCanopy
  ) {
    elevY = selfLevelM !== undefined ? selfLevelM * ELEVATION_3D_SCALE : 0;
  }

  return elevY;
}
