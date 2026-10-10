/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import {
  ClimbableZone3D,
  SiteStation3D,
  WalkablePlatform3D,
} from '../types';
import { ExcavatedZone3D } from '../scene/types';
import { RoamTelemetry } from './roam-types';

export interface RoamPhysicsParams {
  camera: THREE.PerspectiveCamera;
  roamState: any;
  keysHeld: any;
  freeMouseLook: boolean;
  excavatedZones: ExcavatedZone3D[];
  walkablePlatforms: WalkablePlatform3D[];
  climbables: ClimbableZone3D[];
  siteStations: SiteStation3D[];
  setRoamTelemetry: React.Dispatch<React.SetStateAction<RoamTelemetry>>;
  playLadderRungSound: (isUp: boolean) => void;
  playFootstepSound: () => void;
  dt: number;
  frameCounter: number;
  now: number;
}

export function updateRoamPhysics(params: RoamPhysicsParams): void {
  const {
    camera: cam,
    roamState: rs,
    keysHeld: keys,
    freeMouseLook,
    excavatedZones,
    walkablePlatforms,
    climbables,
    siteStations,
    setRoamTelemetry,
    playLadderRungSound,
    playFootstepSound,
    dt,
    frameCounter,
    now,
  } = params;

  // Camera looking is smoothly driven by mouse delta movement in useCAD3DRoamMouse
  // without edge-of-screen auto-spinning conflicts

  // Find surface elevation under (rs.x, rs.z)
  let groundY = 0;
  for (const ez of excavatedZones) {
    if (rs.x >= ez.minX && rs.x <= ez.maxX && rs.z >= ez.minZ && rs.z <= ez.maxZ) {
      groundY = -ez.depth3D;
      break;
    }
  }

  let currentSurfaceName = groundY < 0 ? 'Excavated Sunken Pit' : 'Compound Grade';
  for (const plat of walkablePlatforms) {
    if (rs.x >= plat.minX && rs.x <= plat.maxX && rs.z >= plat.minZ && rs.z <= plat.maxZ) {
      if (!plat.requiresClimb || rs.footY >= plat.topY - 3.2) {
        if (plat.topY >= groundY) {
          groundY = plat.topY;
          currentSurfaceName = plat.name;
        }
      }
    }
  }

  // Detect nearby ladder
  let nearLadder: ClimbableZone3D | null = null;
  let minLadderDist = Infinity;
  for (const lad of climbables) {
    const insideBox =
      rs.x >= lad.minX && rs.x <= lad.maxX && rs.z >= lad.minZ && rs.z <= lad.maxZ;
    const distToCenter = Math.hypot(rs.x - lad.x, rs.z - lad.z);
    if (insideBox || distToCenter <= 16) {
      const score = insideBox ? distToCenter * 0.4 : distToCenter;
      if (score < minLadderDist) {
        minLadderDist = score;
        nearLadder = lad;
      }
    }
  }

  const climbSpeed = keys.shift ? 26.0 : 16.5;
  if (keys.e) {
    if (!rs.isClimbing) {
      rs.isClimbing = true;
      if (nearLadder) {
        rs.latchedLadderId = nearLadder.id;
        rs.latchedLadderName = nearLadder.name;
      } else if (climbables.length > 0) {
        const closest = climbables[0];
        const d = Math.hypot(rs.x - closest.x, rs.z - closest.z);
        if (d <= 26) {
          rs.latchedLadderId = closest.id;
          rs.latchedLadderName = closest.name;
          nearLadder = closest;
        }
      }
    }
    rs.climbState = 'climbing-up';
    const targetLad =
      climbables.find((c) => c.id === rs.latchedLadderId) || nearLadder;
    const topLimit = targetLad ? targetLad.topY : 45.0;
    rs.footY = Math.min(topLimit, rs.footY + climbSpeed * dt);
    rs.climbDistAccum += climbSpeed * dt;
    if (rs.climbDistAccum >= 2.4) {
      rs.climbDistAccum = 0;
      playLadderRungSound(true);
    }
  } else if (keys.r) {
    if (!rs.isClimbing && nearLadder) {
      rs.isClimbing = true;
      rs.latchedLadderId = nearLadder.id;
      rs.latchedLadderName = nearLadder.name;
    }
    if (rs.isClimbing) {
      rs.climbState = 'climbing-down';
      rs.footY -= climbSpeed * dt;
      rs.climbDistAccum += climbSpeed * dt;
      if (rs.climbDistAccum >= 2.4) {
        rs.climbDistAccum = 0;
        playLadderRungSound(false);
      }
      if (rs.footY <= groundY + 0.1) {
        rs.footY = groundY;
        rs.isClimbing = false;
        rs.latchedLadderId = null;
        rs.climbState = 'idle';
      }
    }
  } else if (rs.isClimbing) {
    rs.climbState = 'holding';
    rs.velY = 0;
    if (rs.footY <= groundY + 0.05) {
      rs.footY = groundY;
      rs.isClimbing = false;
      rs.latchedLadderId = null;
      rs.climbState = 'idle';
    }
  }

  // WASD
  let moveForward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
  const moveRight = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);

  if (rs.isRightMouseHeld && moveForward === 0) {
    moveForward = 1;
  }

  let currentSpeedMps = 0;
  if (moveForward !== 0 || moveRight !== 0) {
    const len = Math.hypot(moveForward, moveRight);
    const normF = moveForward / len;
    const normR = moveRight / len;

    const moveSpeed = keys.shift ? 50.0 : 28.0;
    currentSpeedMps = +(moveSpeed / 5.5).toFixed(1);

    const forwardX = -Math.sin(rs.yaw);
    const forwardZ = -Math.cos(rs.yaw);
    const rightX = Math.cos(rs.yaw);
    const rightZ = -Math.sin(rs.yaw);

    const dx = (forwardX * normF + rightX * normR) * moveSpeed * dt;
    const dz = (forwardZ * normF + rightZ * normR) * moveSpeed * dt;

    rs.x = Math.max(-650, Math.min(650, rs.x + dx));
    rs.z = Math.max(-650, Math.min(650, rs.z + dz));

    const stepDist = Math.hypot(dx, dz);
    rs.walkDistAccum += stepDist;
    rs.totalWalkDist += stepDist;
    rs.walkBobPhase += stepDist * 0.42;

    if (rs.walkDistAccum >= 6.2) {
      rs.walkDistAccum = 0;
      if (rs.isClimbing) {
        playLadderRungSound(true);
      } else {
        playFootstepSound();
      }
    }
  } else {
    rs.walkBobPhase = 0;
  }

  // Gravity & Jump
  if (!rs.isClimbing) {
    if (keys.space && Math.abs(rs.footY - groundY) < 0.6) {
      rs.velY = 26.0;
    }
    if (rs.footY > groundY || rs.velY > 0) {
      rs.footY += rs.velY * dt;
      rs.velY -= 62.0 * dt;
      if (rs.footY <= groundY) {
        rs.footY = groundY;
        rs.velY = 0;
      }
    } else {
      rs.footY += (groundY - rs.footY) * Math.min(1, 14 * dt);
    }
  }

  // Proximity to equipment
  let nearEquip = '';
  for (const st of siteStations) {
    const d = Math.hypot(rs.x - st.x, rs.z - st.z);
    if (d < 18) {
      nearEquip = st.name;
      break;
    }
  }

  const eyeHeight = 9.2;
  const bobOffset =
    moveForward !== 0 || moveRight !== 0
      ? Math.sin(rs.walkBobPhase) * (rs.isClimbing ? 0.22 : 0.32)
      : 0;
  const climbOsc = keys.e || keys.r ? Math.sin(now * 0.014) * 0.18 : 0;

  cam.position.set(rs.x, rs.footY + eyeHeight + bobOffset + climbOsc, rs.z);
  cam.rotation.order = 'YXZ';
  cam.rotation.y = rs.yaw;
  cam.rotation.x = rs.pitch;
  cam.rotation.z = 0;

  // Telemetry update
  if (frameCounter % 4 === 0) {
    const activeLad =
      climbables.find((c) => c.id === rs.latchedLadderId) || nearLadder;
    const maxTop = activeLad ? activeLad.topY : 45;
    const rungNum = Math.max(0, Math.round((rs.footY - (activeLad?.baseY || 0)) / 1.8));
    const maxRungs = Math.max(1, Math.round((maxTop - (activeLad?.baseY || 0)) / 1.8));
    const climbPct = Math.min(100, Math.max(0, Math.round((rs.footY / maxTop) * 100)));

    const rawDeg = (((-rs.yaw * 180) / Math.PI) % 360 + 360) % 360;
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const compassDir = dirs[Math.round(rawDeg / 45) % 8];

    setRoamTelemetry({
      elevM: +(rs.footY / 5.8).toFixed(1),
      eyeElevM: +((rs.footY + eyeHeight) / 5.8).toFixed(1),
      headingDeg: Math.round(rawDeg),
      compassDir,
      isClimbing: rs.isClimbing,
      climbState: rs.climbState,
      activeLadderName: rs.latchedLadderName || nearLadder?.name || '',
      nearLadderName: nearLadder?.name || '',
      nearEquipmentName: nearEquip,
      rungNumber: rungNum,
      maxRungs,
      climbPct,
      surfaceName: rs.isClimbing
        ? rs.latchedLadderName || nearLadder?.name || 'Cable Ladder'
        : currentSurfaceName,
      speedMps: currentSpeedMps,
      laddersCount: climbables.length,
    });
  }
}
