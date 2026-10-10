import * as THREE from 'three';
import { CADObject } from '../../../types/cad';

export interface GateSpawnPosition {
  x: number;
  z: number;
  footY: number;
  yaw: number;
  pitch: number;
  foundGate: boolean;
  gateName?: string;
}

/**
 * Finds the designated spawn location at the Security Gate entrance.
 * Priority 1: 3D interactive gate node registered in doorInteractiveNodesRef (doorType: 'security-gate')
 * Priority 2: 2D CAD object list with stencilId === 'gate-2door' / 'gate'
 * Priority 3: Fallback near site compound perimeter facing inside
 */
export function findGateSpawnLocation(
  doorInteractiveNodesRef?: any,
  objects?: CADObject[],
  coordTransform?: { centerX: number; centerY: number; scale3D: number } | null,
  yardBounds?: { yardDepth: number; yardWidth: number; yardMidX: number; yardMidZ: number } | null
): GateSpawnPosition {
  // Strategy 1: Check doorInteractiveNodesRef
  const targetMap =
    doorInteractiveNodesRef?.current ??
    (doorInteractiveNodesRef instanceof Map ? doorInteractiveNodesRef : null);

  if (targetMap && typeof targetMap.forEach === 'function') {
    let gateNode: any = null;
    targetMap.forEach((node: any) => {
      if (
        node &&
        (node.doorType === 'security-gate' ||
          (node.name && node.name.toLowerCase().includes('gate')))
      ) {
        gateNode = node;
      }
    });

    if (gateNode) {
      const gateWorldPos = new THREE.Vector3();
      if (typeof gateNode.getWorldPosition === 'function') {
        gateNode.getWorldPosition(gateWorldPos);
      } else if (gateNode.anchor) {
        gateNode.anchor.getWorldPosition(gateWorldPos);
      } else if (gateNode.mesh) {
        gateNode.mesh.getWorldPosition(gateWorldPos);
      }

      // Compute vector pointing inward toward compound center (0, 0)
      const toCenterX = 0 - gateWorldPos.x;
      const toCenterZ = 0 - gateWorldPos.z;
      const dist = Math.hypot(toCenterX, toCenterZ);

      let normX = 0;
      let normZ = -1; // Default looking North
      if (dist > 1.0) {
        normX = toCenterX / dist;
        normZ = toCenterZ / dist;
      }

      // Player stands inside the gate entrance (approx 4.5 units inward into the gated compound)
      // facing directly into the telecom compound towards equipment.
      const spawnX = gateWorldPos.x + normX * 4.5;
      const spawnZ = gateWorldPos.z + normZ * 4.5;
      const yaw = Math.atan2(-normX, -normZ);

      return {
        x: spawnX,
        z: spawnZ,
        footY: 0,
        yaw,
        pitch: -0.04,
        foundGate: true,
        gateName: gateNode.name || 'Gated Entrance',
      };
    }
  }

  // Strategy 2: Check CAD objects
  if (objects && objects.length > 0) {
    const gateObj = objects.find(
      (o) =>
        o.stencilId === 'gate-2door' ||
        o.stencilId === 'gate' ||
        (o.stencilId && o.stencilId.toLowerCase().includes('gate'))
    );

    if (gateObj) {
      const cX = coordTransform?.centerX ?? 0;
      const cY = coordTransform?.centerY ?? 0;
      const s3D = coordTransform?.scale3D ?? 0.1;

      const gateX = (gateObj.x + (gateObj.width || 20) / 2 - cX) * s3D;
      const gateZ = (gateObj.y + (gateObj.height || 20) / 2 - cY) * s3D;

      const toCenterX = 0 - gateX;
      const toCenterZ = 0 - gateZ;
      const dist = Math.hypot(toCenterX, toCenterZ);

      let normX = 0;
      let normZ = -1;
      if (dist > 1.0) {
        normX = toCenterX / dist;
        normZ = toCenterZ / dist;
      }

      // Player stands inside the gate entrance (approx 4.5 units inward into the gated compound)
      const spawnX = gateX + normX * 4.5;
      const spawnZ = gateZ + normZ * 4.5;
      const yaw = Math.atan2(-normX, -normZ);

      return {
        x: spawnX,
        z: spawnZ,
        footY: 0,
        yaw,
        pitch: -0.04,
        foundGate: true,
        gateName: gateObj.text || 'Gated Entrance',
      };
    }
  }

  // Fallback if no gate is on site (spawn inside gated compound perimeter):
  const yardD = yardBounds?.yardDepth || 70;
  const yardMidX = yardBounds?.yardMidX || 0;
  const yardMidZ = yardBounds?.yardMidZ || 0;
  return {
    x: yardMidX,
    z: yardMidZ + Math.min(20, Math.max(0, yardD / 2 - 8)),
    footY: 0,
    yaw: 0, // Facing North into compound
    pitch: -0.05,
    foundGate: false,
    gateName: 'Gated Compound Entrance',
  };
}
