/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CameraPreset, ClimbableZone3D } from '../types';
import { findGateSpawnLocation } from '../engine/gate-spawn-finder';
import { CADObject } from '../../../types/cad';

export interface UseCAD3DCameraPresetsParams {
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  savedRoamStateRef: React.MutableRefObject<any>;
  roamStateRef: React.MutableRefObject<any>;
  climbablesRef: React.MutableRefObject<ClimbableZone3D[]>;
  setIsRoamMode: React.Dispatch<React.SetStateAction<boolean>>;
  isRoamModeRef: React.MutableRefObject<boolean>;
  playLadderRungSound: (isUp: boolean) => void;
  initialRoamMode?: boolean;
  doorInteractiveNodesRef?: any;
  objects?: CADObject[];
  coordTransformRef?: React.MutableRefObject<any>;
}

export function useCAD3DCameraPresets({
  cameraRef,
  controlsRef,
  savedRoamStateRef,
  roamStateRef,
  climbablesRef,
  setIsRoamMode,
  isRoamModeRef,
  playLadderRungSound,
  initialRoamMode = false,
  doorInteractiveNodesRef,
  objects,
  coordTransformRef,
}: UseCAD3DCameraPresetsParams) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>(initialRoamMode ? 'walk' : 'iso');
  const ladderCycleIdxRef = useRef<number>(0);

  const applyCameraPreset = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === 'walk') {
      setIsRoamMode(true);
      return;
    }

    setIsRoamMode(false);
    ctrl.enabled = true;
    cam.fov = 45;
    cam.updateProjectionMatrix();

    switch (preset) {
      case 'iso':
        cam.position.set(130, 150, 170);
        ctrl.target.set(0, 0, 0);
        break;
      case 'front':
        cam.position.set(0, 45, 230);
        ctrl.target.set(0, 12, 0);
        break;
      case 'side':
        cam.position.set(230, 45, 0);
        ctrl.target.set(0, 12, 0);
        break;
      case 'top':
        cam.position.set(0, 260, 0.1);
        ctrl.target.set(0, 0, 0);
        break;
      case 'upward':
        cam.position.set(0, 3, 40);
        ctrl.target.set(0, 95, 0);
        break;
    }
    ctrl.update();
  }, [cameraRef, controlsRef, setIsRoamMode]);

  const handleTeleportToLadder = useCallback((preferCategory?: 'cable-ladder' | 'tower-ladder') => {
    if (climbablesRef.current.length === 0) return;
    let list = climbablesRef.current;
    if (preferCategory) {
      const filtered = list.filter((c) => c.category === preferCategory);
      if (filtered.length > 0) list = filtered;
    }
    const idx = ladderCycleIdxRef.current % list.length;
    ladderCycleIdxRef.current = idx + 1;
    const lad = list[idx];

    setIsRoamMode(true);
    isRoamModeRef.current = true;
    const rs = roamStateRef.current;
    rs.x = lad.x;
    rs.z = lad.z;
    rs.footY = lad.baseY;
    rs.yaw = lad.rotationRad || 0;
    rs.pitch = -0.05;
    rs.isClimbing = true;
    rs.latchedLadderId = lad.id;
    rs.latchedLadderName = lad.name;
    rs.climbState = 'holding';
    playLadderRungSound(true);
  }, [climbablesRef, isRoamModeRef, playLadderRungSound, roamStateRef, setIsRoamMode]);

  const handleRespawnAtGate = useCallback(() => {
    setIsRoamMode(true);
    isRoamModeRef.current = true;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    if (cameraRef.current) {
      cameraRef.current.fov = 62;
      cameraRef.current.near = 0.25;
      cameraRef.current.updateProjectionMatrix();
    }
    const gateSpawn = findGateSpawnLocation(
      doorInteractiveNodesRef,
      objects,
      coordTransformRef?.current
    );
    const rs = roamStateRef.current;
    rs.x = gateSpawn.x;
    rs.z = gateSpawn.z;
    rs.footY = gateSpawn.footY;
    rs.yaw = gateSpawn.yaw;
    rs.pitch = gateSpawn.pitch;
    rs.isClimbing = false;
    rs.climbState = 'idle';
    rs.latchedLadderId = null;

    if (savedRoamStateRef.current) {
      savedRoamStateRef.current.hasSaved = true;
      savedRoamStateRef.current.x = gateSpawn.x;
      savedRoamStateRef.current.z = gateSpawn.z;
      savedRoamStateRef.current.footY = gateSpawn.footY;
      savedRoamStateRef.current.yaw = gateSpawn.yaw;
      savedRoamStateRef.current.pitch = gateSpawn.pitch;
    }

    if (cameraRef.current) {
      cameraRef.current.position.set(gateSpawn.x, gateSpawn.footY + 9.2, gateSpawn.z);
      cameraRef.current.rotation.set(gateSpawn.pitch, gateSpawn.yaw, 0, 'YXZ');
    }
  }, [
    cameraRef,
    controlsRef,
    coordTransformRef,
    doorInteractiveNodesRef,
    isRoamModeRef,
    objects,
    roamStateRef,
    savedRoamStateRef,
    setIsRoamMode,
  ]);

  const handleToggleRoamMode = useCallback((forceState?: boolean) => {
    setIsRoamMode((prev) => {
      const next = forceState !== undefined ? forceState : !prev;
      isRoamModeRef.current = next;

      if (!cameraRef.current || !controlsRef.current) return next;
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;

      if (next) {
        ctrl.enabled = false;
        cam.fov = 62;
        cam.near = 0.25;
        cam.updateProjectionMatrix();

        // When entering Roam Mode: Always respawn at the Security Gate entrance
        const gateSpawn = findGateSpawnLocation(
          doorInteractiveNodesRef,
          objects,
          coordTransformRef?.current
        );

        roamStateRef.current.x = gateSpawn.x;
        roamStateRef.current.z = gateSpawn.z;
        roamStateRef.current.footY = gateSpawn.footY;
        roamStateRef.current.yaw = gateSpawn.yaw;
        roamStateRef.current.pitch = gateSpawn.pitch;
        roamStateRef.current.isClimbing = false;
        roamStateRef.current.climbState = 'idle';
        roamStateRef.current.latchedLadderId = null;

        savedRoamStateRef.current.hasSaved = true;
        savedRoamStateRef.current.x = gateSpawn.x;
        savedRoamStateRef.current.z = gateSpawn.z;
        savedRoamStateRef.current.footY = gateSpawn.footY;
        savedRoamStateRef.current.yaw = gateSpawn.yaw;
        savedRoamStateRef.current.pitch = gateSpawn.pitch;

        cam.position.set(gateSpawn.x, gateSpawn.footY + 9.2, gateSpawn.z);
        cam.rotation.set(gateSpawn.pitch, gateSpawn.yaw, 0, 'YXZ');
      } else {
        ctrl.enabled = true;
        cam.fov = 45;
        cam.near = 1.0;
        cam.updateProjectionMatrix();
        ctrl.target.set(roamStateRef.current.x, roamStateRef.current.footY + 4, roamStateRef.current.z);
        cam.position.set(
          roamStateRef.current.x + 35,
          roamStateRef.current.footY + 30,
          roamStateRef.current.z + 35
        );
        ctrl.update();
      }
      return next;
    });
  }, [
    cameraRef,
    controlsRef,
    coordTransformRef,
    doorInteractiveNodesRef,
    isRoamModeRef,
    objects,
    roamStateRef,
    savedRoamStateRef,
    setIsRoamMode,
  ]);

  const handleTiltUp = useCallback(() => {
    if (!isRoamModeRef.current || !cameraRef.current) return;
    roamStateRef.current.pitch = Math.min(Math.PI * 0.48, roamStateRef.current.pitch + 0.14);
  }, [cameraRef, isRoamModeRef, roamStateRef]);

  const handleTiltDown = useCallback(() => {
    if (!isRoamModeRef.current || !cameraRef.current) return;
    roamStateRef.current.pitch = Math.max(-Math.PI * 0.48, roamStateRef.current.pitch - 0.14);
  }, [cameraRef, isRoamModeRef, roamStateRef]);

  return {
    cameraPreset,
    setCameraPreset,
    applyCameraPreset,
    handleTeleportToLadder,
    handleRespawnAtGate,
    handleToggleRoamMode,
    handleTiltUp,
    handleTiltDown,
  };
}
