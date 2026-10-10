/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject, Point } from '../../types/cad';
import {
  getObjectBounds,
  getCombinedBounds,
  getResizeHandles,
  isPointInObject,
  isShelterObject,
  getShelterOpeningPositions,
} from '../../utils/cad-geometry';
import { isObjectLayerVisible, isObjectLayerLocked } from '../../utils/cad-layers';
import { isExcavatedChildOrLabel } from '../../utils/cad-renderer';
import { uid } from '../../utils/cad-defaults';
import { CanvasInteractionContext } from './types';

export function handleMouseDownSelectTool(
  e: React.MouseEvent<HTMLCanvasElement>,
  ctx: CanvasInteractionContext,
  screenPt: Point,
  rawWorld: Point,
  worldPt: Point
): void {
  const {
    objects,
    selectedIds,
    setSelectedIds,
    interactionRef,
    viewport,
    layers,
    addToast,
    setObjects,
    setSelectionBoxPreview,
  } = ctx;

  const selectedObjs = objects.filter((o) => selectedIds.includes(o.id));
  const primarySelected = selectedObjs.filter(
    (o) => !o.isStencilLabel && !(o.type === 'text' && o.parentId)
  );
  const targetSelected = primarySelected.length > 0 ? primarySelected : selectedObjs;
  const isSingle = targetSelected.length === 1;
  const single = isSingle ? targetSelected[0] : null;
  const singleRot = isSingle ? single?.rotation || 0 : (targetSelected[0]?.rotation || 0);
  const activeBounds = isSingle && single ? getObjectBounds(single) : getCombinedBounds(targetSelected);

  // Check leader handles specifically
  if (isSingle && single?.type === 'leader') {
    const tipPt = { x: single.x, y: single.y };
    const kneePt = { x: single.x2 ?? single.x + 40, y: single.y2 ?? single.y - 30 };
    const gripTol = 14 / viewport.zoom;
    if (Math.hypot(rawWorld.x - tipPt.x, rawWorld.y - tipPt.y) <= gripTol) {
      interactionRef.current = {
        mode: 'move-leader-tip',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: single.id,
        initialLeaderTip: tipPt,
      };
      return;
    }
    if (Math.hypot(rawWorld.x - kneePt.x, rawWorld.y - kneePt.y) <= gripTol) {
      interactionRef.current = {
        mode: 'move-leader-callout',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: single.id,
        initialLeaderKnee: kneePt,
      };
      return;
    }
  }

  // Check shelter Door and Feeder Hole grips specifically
  if (isSingle && single && isShelterObject(single)) {
    const openings = getShelterOpeningPositions(single);
    if (openings) {
      const gripTol = Math.max(14 / viewport.zoom, 10);
      // Check Door Grip
      if (Math.hypot(rawWorld.x - openings.door.x, rawWorld.y - openings.door.y) <= gripTol) {
        interactionRef.current = {
          mode: 'move-shelter-door',
          startScreen: screenPt,
          startWorld: rawWorld,
          currentWorld: rawWorld,
          targetId: single.id,
        };
        return;
      }
      // Check Door Resize Grip
      if (openings.doorResize && Math.hypot(rawWorld.x - openings.doorResize.x, rawWorld.y - openings.doorResize.y) <= gripTol) {
        interactionRef.current = {
          mode: 'resize-shelter-door',
          startScreen: screenPt,
          startWorld: rawWorld,
          currentWorld: rawWorld,
          targetId: single.id,
        };
        return;
      }
      // Check Feeder Resize Grip
      if (openings.feederResize && Math.hypot(rawWorld.x - openings.feederResize.x, rawWorld.y - openings.feederResize.y) <= gripTol) {
        interactionRef.current = {
          mode: 'resize-shelter-feeder',
          startScreen: screenPt,
          startWorld: rawWorld,
          currentWorld: rawWorld,
          targetId: single.id,
        };
        return;
      }
      // Check Feeder Grip
      if (openings.feeder && Math.hypot(rawWorld.x - openings.feeder.x, rawWorld.y - openings.feeder.y) <= gripTol) {
        interactionRef.current = {
          mode: 'move-shelter-feeder',
          startScreen: screenPt,
          startWorld: rawWorld,
          currentWorld: rawWorld,
          targetId: single.id,
        };
        return;
      }
    }
  }

  // 1. Check if clicking on resize handles of current selection
  if (activeBounds && selectedObjs.length > 0) {
    const handles = getResizeHandles(activeBounds, viewport.zoom, singleRot);
    const handleHitDist = 12 / viewport.zoom;

    for (const h of handles) {
      if (Math.hypot(h.x - rawWorld.x, h.y - rawWorld.y) <= handleHitDist) {
        interactionRef.current = {
          mode: h.type === 'rot' ? 'rotate-handle' : 'resize-handle',
          startScreen: screenPt,
          startWorld: rawWorld,
          currentWorld: rawWorld,
          activeHandle: h.type,
          resizeInitialBounds: activeBounds,
          resizeRotation: singleRot,
        };
        return;
      }
    }
  }

  // 2. Check if clicking on an object
  let clickedObj: CADObject | null = null;
  const wireHitTol = Math.max(10 / viewport.zoom, 8);
  for (let i = objects.length - 1; i >= 0; i--) {
    const cand = objects[i];
    if (
      cand.type === 'line' ||
      cand.type === 'polyline' ||
      cand.type === 'pen' ||
      cand.type === 'dim-h' ||
      cand.type === 'dim-v' ||
      cand.type === 'dim-aligned' ||
      cand.type === 'leader'
    ) {
      if (!isObjectLayerVisible(cand, layers) || isObjectLayerLocked(cand, layers)) continue;
      if (isPointInObject(rawWorld, cand, wireHitTol)) {
        clickedObj = cand;
        break;
      }
    }
  }

  if (!clickedObj) {
    for (let i = objects.length - 1; i >= 0; i--) {
      const cand = objects[i];
      if (isExcavatedChildOrLabel(cand, objects)) continue;
      if (isPointInObject(rawWorld, cand)) {
        if (isObjectLayerLocked(cand, layers)) {
          addToast('warning', `Object is on locked layer (${cand.layerId || 'layer'})`);
          return;
        }
        if (!isObjectLayerVisible(cand, layers)) {
          continue;
        }

        const sId = cand.stencilId || cand.customProps?.stencilType || '';
        const isBackgroundStencil =
          sId === 'wall-roof-canopy' ||
          sId === 'wall-roof-shade' ||
          sId === 'gravel-pad' ||
          sId === 'cement-slab' ||
          sId.includes('basepad') ||
          sId === 'grass-area' ||
          sId === 'concrete-yard' ||
          sId === 'compound-gravel';
        if (isBackgroundStencil) {
          const foregroundObj = objects
            .slice()
            .reverse()
            .find((o) => {
              if (o.id === cand.id || isExcavatedChildOrLabel(o, objects)) return false;
              const os = o.stencilId || o.customProps?.stencilType || '';
              if (
                os === 'wall-roof-canopy' ||
                os === 'wall-roof-shade' ||
                os === 'gravel-pad' ||
                os === 'cement-slab' ||
                os.includes('basepad') ||
                os === 'grass-area' ||
                os === 'concrete-yard' ||
                os === 'compound-gravel'
              ) {
                return false;
              }
              return (
                isObjectLayerVisible(o, layers) &&
                !isObjectLayerLocked(o, layers) &&
                isPointInObject(rawWorld, o)
              );
            });
          if (foregroundObj) {
            clickedObj = foregroundObj;
            break;
          }
        }
        clickedObj = cand;
        break;
      }
    }
  }

  if (clickedObj) {
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    let nextSelected: string[];
    if (isShift) {
      nextSelected = selectedIds.includes(clickedObj.id)
        ? selectedIds.filter((id) => id !== clickedObj?.id)
        : [...selectedIds, clickedObj.id];
    } else {
      nextSelected = selectedIds.includes(clickedObj.id) ? selectedIds : [clickedObj.id];
    }
    setSelectedIds(nextSelected);

    const initPositions = new Map<string, Point>();
    let targetObjects = objects.filter(
      (o) => nextSelected.includes(o.id) || (o.parentId !== undefined && nextSelected.includes(o.parentId))
    );

    let clonedFlag = false;
    if (isAlt) {
      const idMap = new Map<string, string>();
      for (const orig of targetObjects) {
        idMap.set(orig.id, uid());
      }
      const clones: CADObject[] = targetObjects.map((orig) => {
        const clone: CADObject = JSON.parse(JSON.stringify(orig));
        clone.id = idMap.get(orig.id) || uid();
        if (clone.parentId && idMap.has(clone.parentId)) {
          clone.parentId = idMap.get(clone.parentId);
        }
        return clone;
      });
      const combined = [...objects, ...clones];
      targetObjects = clones;
      const primaryCloneIds = clones.filter((c) => !c.isStencilLabel).map((c) => c.id);
      setSelectedIds(primaryCloneIds.length > 0 ? primaryCloneIds : clones.map((c) => c.id));
      setObjects(combined);
      clonedFlag = true;
    }

    for (const obj of targetObjects) {
      initPositions.set(obj.id, { x: obj.x, y: obj.y });
    }

    interactionRef.current = {
      mode: 'move-objects',
      startScreen: screenPt,
      startWorld: worldPt,
      currentWorld: worldPt,
      dragInitialPositions: initPositions,
      isAltCloned: clonedFlag,
    };
    return;
  }

  // 3. Clicked empty space: start marquee selection box
  if (!e.shiftKey) {
    setSelectedIds([]);
  }
  interactionRef.current = {
    mode: 'drag-select',
    startScreen: screenPt,
    startWorld: rawWorld,
    currentWorld: rawWorld,
  };
  setSelectionBoxPreview({ start: rawWorld, current: rawWorld });
}
