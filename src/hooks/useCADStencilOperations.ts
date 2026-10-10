/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import {
  CADLayer,
  CADObject,
  Point,
  ProjectSettings,
  StencilDefinition,
  ToastMessage,
  ToolType,
} from '../types/cad';
import { getObjectLayerId } from '../utils/cad-layers';
import {
  createMergedBasepads,
  createMergedExcavatedAreas,
  checkAndMergeAdjacentBasepads,
} from '../utils/cad-geometry';

export interface UseCADStencilOperationsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeLayerId: string;
  setLayers: React.Dispatch<React.SetStateAction<CADLayer[]>>;
  armedStencil: StencilDefinition | null;
  setArmedStencil: React.Dispatch<React.SetStateAction<StencilDefinition | null>>;
  armedRotation: number;
  setArmedRotation: React.Dispatch<React.SetStateAction<number>>;
  setActiveTool: (tool: ToolType) => void;
  setIsStencilDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  screenToWorld: (screenX: number, screenY: number) => Point;
  recordHistory: (newObjects: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

export function useCADStencilOperations({
  containerRef,
  settings,
  setSettings,
  objects,
  setObjects,
  objectsRef,
  selectedIds,
  setSelectedIds,
  activeLayerId,
  setLayers,
  armedStencil: _armedStencil,
  setArmedStencil,
  armedRotation,
  setArmedRotation,
  setActiveTool,
  setIsStencilDrawerOpen,
  screenToWorld,
  recordHistory,
  addToast,
}: UseCADStencilOperationsProps) {
  // Arming Stencils
  const handleArmStencil = useCallback(
    (stencil: StencilDefinition, keepOpen?: boolean) => {
      setArmedStencil(stencil);
      setArmedRotation(0);
      setActiveTool('select');
      if (!keepOpen) {
        setIsStencilDrawerOpen(false);
      }
      addToast(
        'info',
        `Armed: ${stencil.name}. Click canvas to place, or press 'R' to rotate, Esc to cancel.`
      );
    },
    [setArmedStencil, setArmedRotation, setActiveTool, setIsStencilDrawerOpen, addToast]
  );

  const handleCancelArmedStencil = useCallback(() => {
    setArmedStencil(null);
  }, [setArmedStencil]);

  const handleToggleObjectLabels = useCallback(() => {
    setSettings((prev) => {
      const next = prev.showObjectLabels === false ? true : false;
      addToast('info', `Object Labels: ${next ? 'ON' : 'OFF'}`);
      return { ...prev, showObjectLabels: next };
    });
  }, [setSettings, addToast]);

  const handlePlaceStencilAtCenter = useCallback(
    (stencil: StencilDefinition) => {
      const cw = containerRef.current?.clientWidth || settings.canvasWidth;
      const ch = containerRef.current?.clientHeight || settings.canvasHeight;
      const centerWorld = screenToWorld(cw / 2, ch / 2);
      const targetX = centerWorld.x - stencil.defaultWidth / 2;
      const targetY = centerWorld.y - stencil.defaultHeight / 2;
      const placedObjects = stencil.createObjects({ x: targetX, y: targetY }, settings.scaleFactor);

      if (armedRotation && placedObjects.length > 0) {
        for (const po of placedObjects) {
          if (!po.isStencilLabel && !po.parentId) {
            po.rotation = armedRotation;
          }
        }
      }

      if (placedObjects.length > 0) {
        const targetLayerId = getObjectLayerId(placedObjects[0]);
        setLayers((prev) =>
          prev.map((l) => (l.id === targetLayerId && !l.visible ? { ...l, visible: true } : l))
        );
      }

      const newObjs = [...objects, ...placedObjects];
      const maybeMerged = checkAndMergeAdjacentBasepads(newObjs, placedObjects[0]?.id);
      objectsRef.current = maybeMerged;
      setObjects(maybeMerged);
      recordHistory(maybeMerged);

      if (maybeMerged === newObjs && placedObjects.length > 0) {
        setSelectedIds([placedObjects[0].id]);
      }

      setArmedStencil(null);
      setArmedRotation(0);
      setActiveTool('select');
      setIsStencilDrawerOpen(false);
      addToast(
        'success',
        `Placed ${stencil.name} in center of canvas${armedRotation ? ` (${armedRotation}°)` : ''}`
      );
    },
    [
      containerRef,
      settings.canvasWidth,
      settings.canvasHeight,
      settings.scaleFactor,
      screenToWorld,
      armedRotation,
      setLayers,
      objects,
      objectsRef,
      setObjects,
      recordHistory,
      setSelectedIds,
      setArmedStencil,
      setArmedRotation,
      setActiveTool,
      setIsStencilDrawerOpen,
      addToast,
    ]
  );

  const mergeBasepads = useCallback(
    (padIds?: string[]) => {
      const targetIds = padIds || selectedIds;
      const result = createMergedBasepads(objects, targetIds, activeLayerId);
      if (!result) {
        addToast('info', 'Select 2 or more basepads to combine');
        return;
      }
      recordHistory(result.updatedObjects);
      setSelectedIds([result.mergedId]);
      addToast('success', `Combined basepads while retaining each object's exact set size`);
    },
    [selectedIds, objects, activeLayerId, recordHistory, setSelectedIds, addToast]
  );

  const mergeExcavatedAreas = useCallback(
    (pitIds?: string[]) => {
      const targetIds = pitIds || selectedIds;
      const result = createMergedExcavatedAreas(objects, targetIds, activeLayerId, settings);
      if (!result) {
        addToast('info', 'Select 2 or more excavated areas to merge');
        return;
      }
      recordHistory(result.updatedObjects);
      setSelectedIds([result.mergedId]);
      addToast(
        'success',
        `Merged excavated areas into a unified pit (cement divisions removed)`
      );
    },
    [selectedIds, objects, activeLayerId, settings, recordHistory, setSelectedIds, addToast]
  );

  return {
    handleArmStencil,
    handleCancelArmedStencil,
    handleToggleObjectLabels,
    handlePlaceStencilAtCenter,
    mergeBasepads,
    mergeExcavatedAreas,
  };
}
