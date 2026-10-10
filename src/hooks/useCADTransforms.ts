/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useRef } from 'react';
import { CADDefaultStyle, CADObject, ProjectSettings, ToastMessage } from '../types/cad';
import { createDimensionsForObject, createInterObjectDimension } from '../utils/cad-geometry';

export interface UseCADTransformsProps {
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  settings: ProjectSettings;
  setDefaultStyle: React.Dispatch<React.SetStateAction<CADDefaultStyle>>;
  recordHistory: (newObjects: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

export function useCADTransforms({
  objects,
  setObjects,
  objectsRef,
  selectedIds,
  setSelectedIds,
  settings,
  setDefaultStyle,
  recordHistory,
  addToast,
}: UseCADTransformsProps) {
  // Update Selected Object(s) from Properties Panel
  const handleUpdateSelected = useCallback(
    (updates: Partial<CADObject>, cascadeToChildren = false) => {
      const activeColor = updates.draftingColor || updates.stroke;
      if (activeColor) {
        setDefaultStyle((prev) => ({ ...prev, stroke: activeColor }));
      }
      if (updates.strokeWidth) {
        setDefaultStyle((prev) => ({ ...prev, strokeWidth: updates.strokeWidth! }));
      }
      if (updates.fill) {
        setDefaultStyle((prev) => ({ ...prev, fill: updates.fill! }));
      }

      const updated = objects.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj;
        const nextObj = { ...obj, ...updates };
        if (activeColor) {
          nextObj.stroke = activeColor;
          nextObj.draftingColor = activeColor;
        }

        // Group cascade: if group/stencil-group, cascade stroke, draftingColor, strokeWidth, fill to sub-objects
        if (cascadeToChildren && nextObj.children && nextObj.children.length > 0) {
          nextObj.children = nextObj.children.map((ch) => ({
            ...ch,
            ...(activeColor !== undefined && { stroke: activeColor, draftingColor: activeColor }),
            ...(updates.strokeWidth !== undefined && { strokeWidth: updates.strokeWidth }),
            ...(updates.fill !== undefined && ch.fillEnabled && { fill: updates.fill }),
            ...(updates.fillOpacity !== undefined && { fillOpacity: updates.fillOpacity }),
          }));
        }
        return nextObj;
      });

      setObjects((_prev) => {
        objectsRef.current = updated;
        return updated;
      });
    },
    [objects, selectedIds, setDefaultStyle, setObjects, objectsRef]
  );

  // Quick Rotate Selected Objects by Delta Degrees
  const handleRotateSelected = useCallback(
    (deltaDegrees: number) => {
      if (selectedIds.length === 0) return;
      const updated = objects.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj;
        const current = obj.rotation || 0;
        let nextRot = (current + deltaDegrees) % 360;
        if (nextRot > 180) nextRot -= 360;
        if (nextRot < -180) nextRot += 360;
        return { ...obj, rotation: Math.round(nextRot) };
      });
      objectsRef.current = updated;
      recordHistory(updated);
      addToast('info', `Rotated ${deltaDegrees > 0 ? `+${deltaDegrees}°` : `${deltaDegrees}°`}`);
    },
    [objects, selectedIds, objectsRef, recordHistory, addToast]
  );

  // Quick Scale Selected Objects by Multiplier
  const handleScaleSelected = useCallback(
    (multiplier: number) => {
      if (selectedIds.length === 0) return;
      const updated = objects.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj;
        const newW = Math.max(4, Math.round(obj.width * multiplier));
        const newH = Math.max(4, Math.round(obj.height * multiplier));
        const dw = newW - obj.width;
        const dh = newH - obj.height;
        return {
          ...obj,
          width: newW,
          height: newH,
          x: Math.round(obj.x - dw / 2),
          y: Math.round(obj.y - dh / 2),
        };
      });
      recordHistory(updated);
      addToast('info', `Scaled ${Math.round(multiplier * 100)}%`);
    },
    [objects, selectedIds, recordHistory, addToast]
  );

  // Quick Flip Selected Objects along Horizontal or Vertical Axis
  const handleFlipSelected = useCallback(
    (axis: 'h' | 'v') => {
      if (selectedIds.length === 0) return;
      const updated = objects.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj;
        const current = obj.rotation || 0;
        let nextRot = axis === 'h' ? -current : 180 - current;
        nextRot = ((nextRot % 360) + 360) % 360;
        if (nextRot > 180) nextRot -= 360;
        return { ...obj, rotation: Math.round(nextRot) };
      });
      recordHistory(updated);
      addToast('info', `Flipped ${axis === 'h' ? 'Horizontal' : 'Vertical'}`);
    },
    [objects, selectedIds, recordHistory, addToast]
  );

  // Keyboard Arrow Keys Nudge Repositioning for Selected Objects
  const nudgeHistoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNudgeSelected = useCallback(
    (dx: number, dy: number) => {
      if (selectedIds.length === 0) return;
      setObjects((prev) => {
        const updated = prev.map((obj) => {
          const isSelectedOrChild =
            selectedIds.includes(obj.id) || (obj.parentId !== undefined && selectedIds.includes(obj.parentId));
          if (!isSelectedOrChild) return obj;
          const nx = obj.x + dx;
          const ny = obj.y + dy;
          const res: CADObject = {
            ...obj,
            x: nx,
            y: ny,
          };
          if (obj.x2 !== undefined) res.x2 = obj.x2 + dx;
          if (obj.y2 !== undefined) res.y2 = obj.y2 + dy;
          if (obj.points) {
            res.points = obj.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
          }
          return res;
        });
        objectsRef.current = updated;
        if (nudgeHistoryTimeoutRef.current) {
          clearTimeout(nudgeHistoryTimeoutRef.current);
        }
        nudgeHistoryTimeoutRef.current = setTimeout(() => {
          recordHistory(objectsRef.current);
        }, 200);
        return updated;
      });
    },
    [selectedIds, setObjects, objectsRef, recordHistory]
  );

  // Standard CAD: Automatically add witness lines & dimensions around selected objects
  const handleAutoAddDimensions = useCallback(() => {
    const selected = objects.filter((o) => selectedIds.includes(o.id));
    if (selected.length === 0) return;

    const newDims: CADObject[] = [];

    // If exactly 2 objects selected, create clearance dimension between them!
    if (selected.length === 2) {
      const interDim = createInterObjectDimension(selected[0], selected[1], settings.scaleFactor);
      newDims.push(interDim);
    } else {
      for (const obj of selected) {
        const dims = createDimensionsForObject(obj, settings.scaleFactor);
        newDims.push(...dims);
      }
    }

    if (newDims.length > 0) {
      const combined = [...objects, ...newDims];
      recordHistory(combined);
      setSelectedIds(newDims.map((d) => d.id));
      const msg =
        selected.length === 2
          ? `Added clearance dimension: FROM ${newDims[0].fromLabel} ➔ TO ${newDims[0].toLabel}`
          : `Added standard CAD dimensions with FROM/TO labels (${newDims.length} lines)`;
      addToast('success', msg);
    }
  }, [objects, selectedIds, settings.scaleFactor, recordHistory, setSelectedIds, addToast]);

  return {
    handleUpdateSelected,
    handleRotateSelected,
    handleScaleSelected,
    handleFlipSelected,
    handleNudgeSelected,
    handleAutoAddDimensions,
  };
}
