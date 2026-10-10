/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Point } from '../../types/cad';
import {
  formatMeasurement,
  getObjectBounds,
  calculateShelterOpeningWallAndOffset,
  calculateShelterDoorResizeWidth,
  calculateShelterFeederResizeDiameter,
} from '../../utils/cad-geometry';
import { CanvasInteractionContext } from './types';

export function handleMouseMoveTransforms(
  e: React.MouseEvent<HTMLCanvasElement>,
  worldPt: Point,
  screenPt: Point,
  rawWorld: Point,
  ctx: CanvasInteractionContext
): boolean {
  const {
    settings,
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    setSelectedIds,
    interactionRef,
    setViewport,
    setSelectionBoxPreview,
    setMeasureTooltip,
  } = ctx;

  const inter = interactionRef.current;

  // PANNING
  if (inter.mode === 'pan') {
    const dx = screenPt.x - inter.startScreen.x;
    const dy = screenPt.y - inter.startScreen.y;
    setViewport((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
    inter.startScreen = screenPt;
    return true;
  }

  // MARQUEE BOX SELECT
  if (inter.mode === 'drag-select') {
    inter.currentWorld = rawWorld;
    setSelectionBoxPreview({ start: inter.startWorld, current: rawWorld });

    const x1 = Math.min(inter.startWorld.x, rawWorld.x);
    const y1 = Math.min(inter.startWorld.y, rawWorld.y);
    const x2 = Math.max(inter.startWorld.x, rawWorld.x);
    const y2 = Math.max(inter.startWorld.y, rawWorld.y);

    const enclosed = objects.filter((o) => {
      const b = getObjectBounds(o);
      return b.minX >= x1 && b.maxX <= x2 && b.minY >= y1 && b.maxY <= y2;
    });
    const filtered = enclosed.filter((o) => {
      if ((o.isStencilLabel || o.parentId) && o.parentId && enclosed.some((p) => p.id === o.parentId)) {
        return false;
      }
      return true;
    });
    setSelectedIds(filtered.map((o) => o.id));
    return true;
  }

  // MOVING OBJECTS
  if (inter.mode === 'move-objects' && inter.dragInitialPositions) {
    let deltaX = worldPt.x - inter.startWorld.x;
    let deltaY = worldPt.y - inter.startWorld.y;

    if (e.shiftKey) {
      if (Math.abs(deltaX) >= Math.abs(deltaY)) deltaY = 0;
      else deltaX = 0;
    }

    setObjects((prev) => {
      const next = prev.map((obj) => {
        const init = inter.dragInitialPositions?.get(obj.id);
        if (!init) return obj;

        const nx = init.x + deltaX;
        const ny = init.y + deltaY;

        if (obj.x2 !== undefined && obj.y2 !== undefined) {
          return {
            ...obj,
            x: nx,
            y: ny,
            x2: obj.x2 + (nx - obj.x),
            y2: obj.y2 + (ny - obj.y),
          };
        }
        return { ...obj, x: nx, y: ny };
      });
      objectsRef.current = next;
      return next;
    });
    return true;
  }

  // RESIZING / DYNAMIC STRETCH
  if (inter.mode === 'resize-handle' && inter.resizeInitialBounds && inter.activeHandle) {
    const b = inter.resizeInitialBounds;
    const h = inter.activeHandle;
    const rot = inter.resizeRotation || 0;
    const initCenter = { x: b.centerX, y: b.centerY };
    const W0 = b.width;
    const H0 = b.height;

    const dx = worldPt.x - initCenter.x;
    const dy = worldPt.y - initCenter.y;
    const rotRad = (-rot * Math.PI) / 180;
    const localX = dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
    const localY = dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

    const minLocalX = -W0 / 2;
    const maxLocalX = W0 / 2;
    const minLocalY = -H0 / 2;
    const maxLocalY = H0 / 2;

    let newMinLocalX = minLocalX;
    let newMaxLocalX = maxLocalX;
    let newMinLocalY = minLocalY;
    let newMaxLocalY = maxLocalY;

    if (h.includes('e')) {
      newMaxLocalX = Math.max(localX, minLocalX + 8);
    }
    if (h.includes('w')) {
      newMinLocalX = Math.min(localX, maxLocalX - 8);
    }
    if (h.includes('s')) {
      newMaxLocalY = Math.max(localY, minLocalY + 8);
    }
    if (h.includes('n')) {
      newMinLocalY = Math.min(localY, maxLocalY - 8);
    }

    const targetW = Math.max(newMaxLocalX - newMinLocalX, 8);
    const targetH = Math.max(newMaxLocalY - newMinLocalY, 8);

    const localCenterX = (newMinLocalX + newMaxLocalX) / 2;
    const localCenterY = (newMinLocalY + newMaxLocalY) / 2;

    const fwdRad = (rot * Math.PI) / 180;
    const shiftWorldX = localCenterX * Math.cos(fwdRad) - localCenterY * Math.sin(fwdRad);
    const shiftWorldY = localCenterX * Math.sin(fwdRad) + localCenterY * Math.cos(fwdRad);

    const newCenterX = initCenter.x + shiftWorldX;
    const newCenterY = initCenter.y + shiftWorldY;

    const newX = newCenterX - targetW / 2;
    const newY = newCenterY - targetH / 2;

    setObjects((prev) => {
      const resizedParents = new Map<string, { x: number; y: number; width: number; height: number }>();
      const updated = prev.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj;
        if (obj.isStencilLabel || obj.parentId || (obj.type === 'text' && obj.parentId)) {
          return obj;
        }
        if (obj.type === 'line') {
          const ox1 = obj.x;
          const oy1 = obj.y;
          const ox2 = obj.x2 ?? obj.x + (obj.width || 0);
          const oy2 = obj.y2 ?? obj.y + (obj.height || 0);
          const isHoriz = Math.abs(ox2 - ox1) >= Math.abs(oy2 - oy1);
          if (isHoriz) {
            const fixedY = Math.round((oy1 + oy2) / 2);
            const xStart = ox1 <= ox2 ? newX : newX + targetW;
            const xEnd = ox1 <= ox2 ? newX + targetW : newX;
            return {
              ...obj,
              x: xStart,
              y: fixedY,
              x2: xEnd,
              y2: fixedY,
              width: targetW,
              height: 0,
            };
          } else {
            const fixedX = Math.round((ox1 + ox2) / 2);
            const yStart = oy1 <= oy2 ? newY : newY + targetH;
            const yEnd = oy1 <= oy2 ? newY + targetH : newY;
            return {
              ...obj,
              x: fixedX,
              y: yStart,
              x2: fixedX,
              y2: yEnd,
              width: 0,
              height: targetH,
            };
          }
        }
        resizedParents.set(obj.id, { x: newX, y: newY, width: targetW, height: targetH });
        return {
          ...obj,
          x: newX,
          y: newY,
          width: targetW,
          height: targetH,
        };
      });

      return updated.map((obj) => {
        if ((obj.isStencilLabel || obj.parentId) && obj.parentId && resizedParents.has(obj.parentId)) {
          const parent = resizedParents.get(obj.parentId)!;
          const compactW = Math.min(obj.width || 70, 95);
          const compactH = Math.min(obj.height || 18, 20);
          return {
            ...obj,
            x: parent.x + parent.width / 2 - compactW / 2,
            y: parent.y - 18,
            width: compactW,
            height: compactH,
          };
        }
        return obj;
      });
    });

    setMeasureTooltip({
      text: `W: ${formatMeasurement(targetW, settings.scaleFactor, settings.unit)} × H: ${formatMeasurement(targetH, settings.scaleFactor, settings.unit)}`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // ROTATING
  if (inter.mode === 'rotate-handle' && inter.resizeInitialBounds) {
    const cx = inter.resizeInitialBounds.centerX;
    const cy = inter.resizeInitialBounds.centerY;
    const angleRad = Math.atan2(worldPt.y - cy, worldPt.x - cx);
    let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
    if (angleDeg > 180) angleDeg -= 360;
    if (angleDeg < -180) angleDeg += 360;

    if (e.shiftKey) {
      angleDeg = Math.round(angleDeg / 15) * 15;
    }

    setObjects((prev) => {
      const next = prev.map((obj) => (selectedIds.includes(obj.id) ? { ...obj, rotation: angleDeg } : obj));
      objectsRef.current = next;
      return next;
    });
    setMeasureTooltip({ text: `${angleDeg}°`, x: screenPt.x, y: screenPt.y });
    return true;
  }

  // REPOSITIONING SHELTER ACCESS DOOR ALONG WALLS
  if (inter.mode === 'move-shelter-door' && inter.targetId) {
    const target = objects.find((o) => o.id === inter.targetId);
    if (!target) return false;

    const { wall, offsetPct } = calculateShelterOpeningWallAndOffset(target, rawWorld);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          customProps: {
            ...(obj.customProps || {}),
            doorWall: wall,
            doorOffset: offsetPct,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });

    setMeasureTooltip({
      text: `Access Door: ${wall.toUpperCase()} Wall • ${offsetPct}% along wall`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // RESIZING SHELTER DOOR DIAMETER / WIDTH
  if (inter.mode === 'resize-shelter-door' && inter.targetId) {
    const target = objects.find((o) => o.id === inter.targetId);
    if (!target) return false;

    const newDoorWidthMm = calculateShelterDoorResizeWidth(target, rawWorld);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          customProps: {
            ...(obj.customProps || {}),
            doorWidthMm: newDoorWidthMm,
            doorDiameter: newDoorWidthMm,
            doorDiameterMm: newDoorWidthMm,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });

    setMeasureTooltip({
      text: `Door ⌀ Diameter: ${newDoorWidthMm}mm (${(newDoorWidthMm / 1000).toFixed(2)}m)`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // REPOSITIONING SHELTER FEEDER CABLE HOLE ALONG WALLS
  if (inter.mode === 'move-shelter-feeder' && inter.targetId) {
    const target = objects.find((o) => o.id === inter.targetId);
    if (!target) return false;

    const { wall, offsetPct } = calculateShelterOpeningWallAndOffset(target, rawWorld);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          customProps: {
            ...(obj.customProps || {}),
            cableHoleWall: wall,
            cableHoleOffset: offsetPct,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });

    setMeasureTooltip({
      text: `Feeder Hole: ${wall.toUpperCase()} Wall • ${offsetPct}% along wall`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // RESIZING SHELTER FEEDER DIAMETER
  if (inter.mode === 'resize-shelter-feeder' && inter.targetId) {
    const target = objects.find((o) => o.id === inter.targetId);
    if (!target) return false;

    const newFeederDiaMm = calculateShelterFeederResizeDiameter(target, rawWorld);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          cableHoleDiameterMm: newFeederDiaMm,
          feederDiameter: newFeederDiaMm,
          customProps: {
            ...(obj.customProps || {}),
            cableHoleDiameterMm: newFeederDiaMm,
            cableHoleDiameter: newFeederDiaMm,
            feederDiameter: newFeederDiaMm,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });

    setMeasureTooltip({
      text: `Feeder ⌀ Diameter: ${newFeederDiaMm}mm (${(newFeederDiaMm / 1000).toFixed(2)}m)`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  return false;
}
