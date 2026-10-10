/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useMemo } from 'react';
import { CADObject, Point, ToastMessage } from '../types/cad';
import { getObjectBounds, isPointInObject } from '../utils/cad-geometry';

export interface UseCADDoorInteractionsProps {
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  cursorPos: Point | null;
  recordHistory: (newObjects: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

export function useCADDoorInteractions({
  objects,
  setObjects,
  objectsRef,
  selectedIds,
  cursorPos,
  recordHistory,
  addToast,
}: UseCADDoorInteractionsProps) {
  // Helper to detect if a CADObject is a door or gate (including outdoor telecom cabinets)
  const isDoorOrGateObject = useCallback((o: CADObject): boolean => {
    if (!o) return false;
    const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    if (
      s === 'gate-2door' ||
      s.includes('gate') ||
      s.includes('door') ||
      s === 'shelter' ||
      s === 'cement-shelter' ||
      s === 'small-house' ||
      s === 'odc' ||
      s.includes('odc') ||
      s.includes('cabinet') ||
      s.includes('1bay') ||
      s.includes('2bay') ||
      s.includes('3bay') ||
      s.includes('huawei') ||
      s.includes('ericsson') ||
      s.includes('eltek') ||
      s.includes('fushan') ||
      s.includes('fhodc') ||
      s.includes('enc6150') ||
      s.includes('enc6130') ||
      s.includes('rectifier') ||
      o.customProps?.isRectifierSystem === true ||
      o.customProps?.isCabinet === true ||
      o.customProps?.category === 'cabinets' ||
      o.customProps?.category === 'rectifier-system'
    ) {
      return true;
    }
    const text = (o.text || '').toLowerCase();
    return (text.includes('gate') || text.includes('door') || text.includes('cabinet') || text.includes('odc')) && !text.includes('cable') && !text.includes('ladder');
  }, []);

  // Compute whether all doors & gates are currently open
  const areDoorsOpen = useMemo(() => {
    const doorObjs = objects.filter(isDoorOrGateObject);
    return doorObjs.length > 0 && doorObjs.every((o) => o.doorsOpen === true || o.customProps?.doorsOpen === true);
  }, [objects, isDoorOrGateObject]);

  // Master Toggle: Open or Close All Doors & Gates across site (Shortcut Key 'Z')
  const handleToggleDoors = useCallback(() => {
    const doorObjs = objects.filter(isDoorOrGateObject);
    if (doorObjs.length === 0) {
      addToast('info', "No doors, gates or cabinets placed yet. Place a Security Gate, Shelter, or Outdoor Cabinet to toggle with Key 'Z'.");
      return;
    }

    const allOpen = doorObjs.every((o) => o.doorsOpen === true || o.customProps?.doorsOpen === true);
    const nextOpenState = !allOpen;

    const nextObjects = objects.map((obj) => {
      if (isDoorOrGateObject(obj)) {
        const updatedProps = {
          ...(obj.customProps || {}),
          doorsOpen: nextOpenState,
          isDoorOpen: nextOpenState,
          isClosed: !nextOpenState,
        };
        let nextText = obj.text;
        if (nextText) {
          if (nextOpenState) {
            nextText = nextText.replace(/\(CLOSED\)/gi, '(OPEN)');
          } else {
            nextText = nextText.replace(/\(OPEN\)/gi, '(CLOSED)');
          }
        }
        return {
          ...obj,
          doorsOpen: nextOpenState,
          customProps: updatedProps,
          text: nextText,
        };
      }
      // Also update detached label attached to this door/gate
      if (obj.isStencilLabel && obj.parentId) {
        const parent = doorObjs.find((p) => p.id === obj.parentId);
        if (parent && obj.text) {
          let nextText = obj.text;
          if (nextOpenState) {
            nextText = nextText.replace(/\(CLOSED\)/gi, '(OPEN)');
          } else {
            nextText = nextText.replace(/\(OPEN\)/gi, '(CLOSED)');
          }
          return {
            ...obj,
            text: nextText,
          };
        }
      }
      return obj;
    });

    setObjects(nextObjects);
    objectsRef.current = nextObjects;
    recordHistory(nextObjects);
    addToast(
      'success',
      nextOpenState
        ? `Opened all ${doorObjs.length} doors & gates across site [Key 'Z']`
        : `Closed all ${doorObjs.length} doors & gates across site [Key 'Z']`
    );
  }, [objects, isDoorOrGateObject, setObjects, objectsRef, recordHistory, addToast]);

  // Toggle a Single Specific Door / Gate (Interactive Door View Interaction [Key 'Z'])
  const handleToggleSingleDoor = useCallback(
    (doorId: string) => {
      const targetObj = objects.find((o) => o.id === doorId);
      if (!targetObj) return;

      const currentOpen = !!(
        targetObj.doorsOpen ||
        targetObj.customProps?.doorsOpen ||
        targetObj.customProps?.isClosed === false
      );
      const nextOpen = !currentOpen;

      const nextObjects = objects.map((obj) => {
        if (obj.id === doorId) {
          const updatedProps = {
            ...(obj.customProps || {}),
            doorsOpen: nextOpen,
            isDoorOpen: nextOpen,
            isClosed: !nextOpen,
          };
          let nextText = obj.text;
          if (nextText) {
            if (nextOpen) {
              nextText = nextText.replace(/\(CLOSED\)/gi, '(OPEN)');
            } else {
              nextText = nextText.replace(/\(OPEN\)/gi, '(CLOSED)');
            }
          }
          return {
            ...obj,
            doorsOpen: nextOpen,
            customProps: updatedProps,
            text: nextText,
          };
        }
        // Also update detached label attached to this door/gate
        if (obj.isStencilLabel && obj.parentId === doorId && obj.text) {
          const updatedText = nextOpen
            ? obj.text.replace(/\(CLOSED\)/gi, '(OPEN)')
            : obj.text.replace(/\(OPEN\)/gi, '(CLOSED)');
          return { ...obj, text: updatedText };
        }
        return obj;
      });

      setObjects(nextObjects);
      objectsRef.current = nextObjects;
      recordHistory(nextObjects);

      const sId = (targetObj.stencilId || targetObj.customProps?.stencilType || '').toLowerCase();
      const isCabinet =
        sId.includes('cabinet') ||
        sId.includes('odc') ||
        sId.includes('1bay') ||
        sId.includes('2bay') ||
        sId.includes('3bay') ||
        sId.includes('huawei') ||
        sId.includes('ericsson') ||
        sId.includes('eltek') ||
        sId.includes('fushan') ||
        sId.includes('fhodc');

      const doorLabel =
        targetObj.text?.replace(/\s*\((OPEN|CLOSED)\)/gi, '') ||
        (targetObj.stencilId === 'shelter' || targetObj.stencilId === 'cement-shelter'
          ? 'Cabin Door'
          : isCabinet
          ? 'Cabinet Door'
          : 'Security Gate');

      addToast(
        'info',
        nextOpen ? `Opened ${doorLabel} [Key 'Z']` : `Closed ${doorLabel} [Key 'Z']`
      );
    },
    [objects, setObjects, objectsRef, recordHistory, addToast]
  );

  // Interactive Door Toggle for 2D Mode: only toggle door if selected, hovered, or technician is right at the door
  const handleInteractWithDoor2D = useCallback(() => {
    // 1. Check if a door/gate object is currently selected
    const selectedDoor = objects.find(
      (o) => selectedIds.includes(o.id) && isDoorOrGateObject(o)
    );
    if (selectedDoor) {
      handleToggleSingleDoor(selectedDoor.id);
      return;
    }

    // 2. Check if a door/gate object is directly under cursor position
    if (cursorPos) {
      const hoveredDoor = objects
        .slice()
        .reverse()
        .find((o) => isDoorOrGateObject(o) && isPointInObject(cursorPos, o));
      if (hoveredDoor) {
        handleToggleSingleDoor(hoveredDoor.id);
        return;
      }
    }

    // 3. Check if a site technician (site-person) is positioned right at a door
    const personObj = objects.find(
      (o) => o.stencilId === 'site-person' || o.customProps?.stencilType === 'site-person'
    );
    if (personObj) {
      const pBounds = getObjectBounds(personObj);
      const px = (pBounds.minX + pBounds.maxX) / 2;
      const py = (pBounds.minY + pBounds.maxY) / 2;

      const doorObjs = objects.filter(isDoorOrGateObject);
      let closestDoor: CADObject | null = null;
      let minDistance = Infinity;
      for (const d of doorObjs) {
        const dB = getObjectBounds(d);
        const dx = (dB.minX + dB.maxX) / 2;
        const dy = (dB.minY + dB.maxY) / 2;
        const dist = Math.hypot(px - dx, py - dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestDoor = d;
        }
      }

      if (closestDoor && minDistance <= 55) {
        handleToggleSingleDoor(closestDoor.id);
        return;
      }
    }

    // User is NOT at any door or selecting a door: DO NOT open any door!
    const doorObjs = objects.filter(isDoorOrGateObject);
    if (doorObjs.length === 0) {
      addToast('info', 'No doors, gates or cabinets placed. Add a Shelter, Security Gate, or Outdoor Cabinet to interact [Z].');
    } else {
      addToast(
        'info',
        'Not at a door or cabinet. Select or hover over a door or cabinet to interact [Z], or press [3] / [G] for 3D Walkthrough.'
      );
    }
  }, [objects, selectedIds, cursorPos, isDoorOrGateObject, handleToggleSingleDoor, addToast]);

  return {
    isDoorOrGateObject,
    areDoorsOpen,
    handleToggleDoors,
    handleToggleSingleDoor,
    handleInteractWithDoor2D,
  };
}
