/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { animateSkyWeather } from '../sky-weather';
import {
  RoamTelemetry,
  CableHudStatus,
  FocusedDoorInfo,
  RoamRenderLoopParams,
} from './roam-types';
import { updateRoamPhysics } from './roam-physics';
import { updateRoamDoorDetection } from './roam-door-detector';
import { updateRoamCablePreview } from './roam-cable-preview';

export type {
  RoamTelemetry,
  CableHudStatus,
  FocusedDoorInfo,
  RoamRenderLoopParams,
};

export function startRoamRenderLoop(params: RoamRenderLoopParams): () => void {
  const {
    rendererRef,
    sceneRef,
    cameraRef,
    controlsRef,
    isRoamModeRef,
    roamStateRef,
    keysHeldRef,
    freeMouseLookRef,
    autoRotateRef,
    showSkyRef,
    skyWeatherRigRef,
    savedRoamStateRef,
    savedCameraStateRef,
    excavatedZonesRef,
    walkablePlatformsRef,
    climbablesRef,
    siteStationsRef,
    doorInteractiveNodesRef,
    focusedDoorRef,
    setFocusedDoorPrompt,
    setRoamTelemetry,
    playLadderRungSound,
    playFootstepSound,
    cablesGroupRef,
    cablePreviewGroupRef,
    cableToolModeRef,
    coordTransformRef,
    objectsRef,
    objectElevYMapRef,
    currentTargetPt3DRef,
    cableWaypoints3DRef,
    selectedCablePresetRef,
    cableOrthoSnapRef,
    settingsRef,
    setCableHudStatus,
    generateFluid3DCableCurvePts,
    computeSnapped2DTarget,
    projectOntoSegment2D,
  } = params;

  let animId = 0;
  let lastTime = performance.now();
  let frameCounter = 0;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    frameCounter++;

    // Record camera/roam state
    if (isRoamModeRef.current) {
      savedRoamStateRef.current = {
        hasSaved: true,
        x: roamStateRef.current.x,
        z: roamStateRef.current.z,
        footY: roamStateRef.current.footY,
        yaw: roamStateRef.current.yaw,
        pitch: roamStateRef.current.pitch,
      };
    } else if (cameraRef.current && controlsRef.current) {
      savedCameraStateRef.current = {
        hasSaved: true,
        position: cameraRef.current.position.clone(),
        target: controlsRef.current.target.clone(),
        zoom: cameraRef.current.zoom,
      };
    }

    // Animate Sky Weather
    if (skyWeatherRigRef.current && cameraRef.current) {
      animateSkyWeather(
        skyWeatherRigRef.current,
        dt,
        cameraRef.current.position,
        showSkyRef.current,
        now * 0.001
      );
    }

    if (isRoamModeRef.current && cameraRef.current) {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }

      updateRoamPhysics({
        camera: cameraRef.current,
        roamState: roamStateRef.current,
        keysHeld: keysHeldRef.current,
        freeMouseLook: freeMouseLookRef.current,
        excavatedZones: excavatedZonesRef.current,
        walkablePlatforms: walkablePlatformsRef.current,
        climbables: climbablesRef.current,
        siteStations: siteStationsRef.current,
        setRoamTelemetry,
        playLadderRungSound,
        playFootstepSound,
        dt,
        frameCounter,
        now,
      });
    } else {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.autoRotate = autoRotateRef.current;
        if (cableToolModeRef.current !== 'none') {
          controlsRef.current.mouseButtons = {
            LEFT: -1 as any,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          };
        } else {
          controlsRef.current.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          };
        }
        controlsRef.current.update();
      }
      if (cameraRef.current && cameraRef.current.position.y < 0.2) {
        cameraRef.current.position.y = 0.2;
      }
    }

    // Door check (every 3 frames)
    if (frameCounter % 3 === 0 && cameraRef.current) {
      updateRoamDoorDetection(
        cameraRef.current,
        doorInteractiveNodesRef.current,
        focusedDoorRef,
        setFocusedDoorPrompt
      );
    }

    // 3D Cable Raycast Preview
    if (cablePreviewGroupRef.current && cameraRef.current && sceneRef.current) {
      updateRoamCablePreview({
        camera: cameraRef.current,
        scene: sceneRef.current,
        cablesGroup: cablesGroupRef.current,
        previewGroup: cablePreviewGroupRef.current,
        cableToolMode: cableToolModeRef.current,
        isRoamMode: isRoamModeRef.current,
        roamState: roamStateRef.current,
        keysHeld: keysHeldRef.current,
        coordTransform: coordTransformRef.current,
        objects: objectsRef.current,
        objectElevYMap: objectElevYMapRef.current,
        currentTargetPt3DRef,
        cableWaypoints3DRef,
        selectedCablePreset: selectedCablePresetRef.current,
        cableOrthoSnap: cableOrthoSnapRef.current,
        settings: settingsRef.current,
        setCableHudStatus,
        generateFluid3DCableCurvePts,
        computeSnapped2DTarget,
        projectOntoSegment2D,
        dt,
        frameCounter,
      });
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  animate();

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
