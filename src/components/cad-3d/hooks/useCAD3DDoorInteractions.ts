/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { CADObject } from '../../../types/cad';
import { InteractiveDoorNode } from '../types';
import { FocusedDoorInfo } from '../engine/roam-render-loop';

export interface UseCAD3DDoorInteractionsParams {
  objects: CADObject[];
  doorInteractiveNodesRef: React.MutableRefObject<Map<string, InteractiveDoorNode>>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  isRoamModeRef: React.MutableRefObject<boolean>;
  playDoorSound: (isOpen: boolean) => void;
  onToggleSingleDoor?: (doorId: string) => void;
  onUpdateObjects?: (updated: CADObject[], actionDesc?: string) => void;
  areDoorsOpen?: boolean;
}

export function useCAD3DDoorInteractions({
  objects,
  doorInteractiveNodesRef,
  cameraRef,
  isRoamModeRef,
  playDoorSound,
  onToggleSingleDoor,
  onUpdateObjects,
  areDoorsOpen,
}: UseCAD3DDoorInteractionsParams) {
  const [focusedDoorPrompt, setFocusedDoorPrompt] = useState<FocusedDoorInfo | null>(null);
  const [doorInteractionHint, setDoorInteractionHint] = useState<string | null>(null);

  const focusedDoorRef = useRef<FocusedDoorInfo | null>(null);
  const doorHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showDoorInteractionHint = useCallback((msg: string) => {
    setDoorInteractionHint(msg);
    if (doorHintTimeoutRef.current) clearTimeout(doorHintTimeoutRef.current);
    doorHintTimeoutRef.current = setTimeout(() => {
      setDoorInteractionHint(null);
    }, 4000);
  }, []);

  const handleInteractWithDoor = useCallback(() => {
    const target = focusedDoorRef.current;
    if (target) {
      const node = doorInteractiveNodesRef.current.get(target.id);
      if (node) {
        const nextOpen = !node.isOpen();
        node.setOpen(nextOpen);
        playDoorSound(nextOpen);

        focusedDoorRef.current = {
          ...target,
          isOpen: nextOpen,
        };
        setFocusedDoorPrompt((prev) => (prev ? { ...prev, isOpen: nextOpen } : null));

        if (onToggleSingleDoor) {
          onToggleSingleDoor(target.id);
        } else if (onUpdateObjects) {
          const nextObjs = objects.map((o) => {
            if (o.id === target.id) {
              const updatedProps = {
                ...(o.customProps || {}),
                doorsOpen: nextOpen,
                isClosed: !nextOpen,
              };
              let nextText = o.text;
              if (nextText) {
                nextText = nextOpen
                  ? nextText.replace(/\(CLOSED\)/gi, '(OPEN)')
                  : nextText.replace(/\(OPEN\)/gi, '(CLOSED)');
              }
              return { ...o, doorsOpen: nextOpen, customProps: updatedProps, text: nextText };
            }
            if (o.isStencilLabel && o.parentId === target.id && o.text) {
              const updatedText = nextOpen
                ? o.text.replace(/\(CLOSED\)/gi, '(OPEN)')
                : o.text.replace(/\(OPEN\)/gi, '(CLOSED)');
              return { ...o, text: updatedText };
            }
            return o;
          });
          onUpdateObjects(nextObjs, `${nextOpen ? 'Opened' : 'Closed'} ${target.name} [Z]`);
        }
        return;
      }
    }

    if (doorInteractiveNodesRef.current.size === 0) {
      showDoorInteractionHint('No doors or gates placed. Add a Shelter or Security Gate to interact [Z].');
    } else {
      let closestDoorDist = Infinity;
      let closestDoorName = 'door';
      const camPos = cameraRef.current?.position;
      if (camPos) {
        for (const [, n] of doorInteractiveNodesRef.current.entries()) {
          const d = camPos.distanceTo(n.getWorldPosition());
          if (d < closestDoorDist) {
            closestDoorDist = d;
            closestDoorName = n.name;
          }
        }
      }
      if (closestDoorDist <= 16.0) {
        showDoorInteractionHint(`Turn to face ${closestDoorName} directly to interact [Z].`);
      } else if (closestDoorDist <= 35.0) {
        const metersAway = (closestDoorDist / 5.75).toFixed(1);
        showDoorInteractionHint(`Walk closer to ${closestDoorName} (${metersAway}m away) to interact [Z].`);
      } else {
        if (!isRoamModeRef.current) {
          showDoorInteractionHint('Press [G] for Walkthrough, then walk right up to a door and face it to interact [Z].');
        } else {
          showDoorInteractionHint('Walk right up to a door (~2m) and face it to interact [Z].');
        }
      }
    }
  }, [
    objects,
    onToggleSingleDoor,
    onUpdateObjects,
    playDoorSound,
    showDoorInteractionHint,
    cameraRef,
    doorInteractiveNodesRef,
    isRoamModeRef,
  ]);

  const handleInteractWithDoorRef = useRef(handleInteractWithDoor);
  useEffect(() => {
    handleInteractWithDoorRef.current = handleInteractWithDoor;
  }, [handleInteractWithDoor]);

  useEffect(() => {
    for (const obj of objects) {
      const node = doorInteractiveNodesRef.current.get(obj.id);
      if (node) {
        const isOpen = !!(
          obj.doorsOpen ||
          obj.customProps?.doorsOpen ||
          obj.customProps?.isClosed === false
        );
        node.setOpen(isOpen);
      }
    }
  }, [objects, areDoorsOpen, doorInteractiveNodesRef]);

  return {
    focusedDoorPrompt,
    setFocusedDoorPrompt,
    doorInteractionHint,
    focusedDoorRef,
    handleInteractWithDoor,
    handleInteractWithDoorRef,
  };
}
