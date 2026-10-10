/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { InteractiveDoorNode } from '../types';
import { FocusedDoorInfo } from './roam-types';

export function updateRoamDoorDetection(
  camera: THREE.PerspectiveCamera,
  doorNodesMap: Map<string, InteractiveDoorNode>,
  focusedDoorRef: React.MutableRefObject<FocusedDoorInfo | null>,
  setFocusedDoorPrompt: React.Dispatch<React.SetStateAction<FocusedDoorInfo | null>>
): void {
  let bestDoor: (FocusedDoorInfo & { score: number }) | null = null;
  const camPos = camera.position;
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);

  const MAX_DOOR_DIST = 16.0;
  for (const [doorId, node] of doorNodesMap.entries()) {
    const doorPos = node.getWorldPosition();
    const vecToDoor = doorPos.clone().sub(camPos);
    const dist = vecToDoor.length();
    const distXZ = Math.hypot(vecToDoor.x, vecToDoor.z);
    const distY = Math.abs(vecToDoor.y);

    if (distXZ <= MAX_DOOR_DIST && distY <= 11.0) {
      const dirToDoor = vecToDoor.clone().normalize();
      const dot = camDir.dot(dirToDoor);
      const perpDist = vecToDoor.clone().cross(camDir).length();

      if (dot >= 0.76 && perpDist <= 5.8) {
        const score = dot * 4.0 - (distXZ / MAX_DOOR_DIST) * 1.5 - perpDist / 5.8;
        if (!bestDoor || score > bestDoor.score) {
          bestDoor = {
            id: doorId,
            name: node.name,
            isOpen: node.isOpen(),
            distMeters: +(dist / 5.75).toFixed(1),
            score,
          };
        }
      }
    }
  }

  focusedDoorRef.current = bestDoor
    ? {
        id: bestDoor.id,
        name: bestDoor.name,
        isOpen: bestDoor.isOpen,
        distMeters: bestDoor.distMeters,
      }
    : null;

  setFocusedDoorPrompt((prev) => {
    if (!bestDoor && !prev) return null;
    if (
      bestDoor &&
      prev &&
      prev.id === bestDoor.id &&
      prev.isOpen === bestDoor.isOpen &&
      prev.distMeters === bestDoor.distMeters
    ) {
      return prev;
    }
    return bestDoor
      ? {
          id: bestDoor.id,
          name: bestDoor.name,
          isOpen: bestDoor.isOpen,
          distMeters: bestDoor.distMeters,
        }
      : null;
  });
}
