import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { findGateSpawnLocation } from './gate-spawn-finder';
import { CADObject } from '../../../types/cad';

export interface CameraSetupOptions {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  isRoamMode: boolean;
  savedRoamState: any;
  savedCameraState: any;
  roamState: any;
  yardBounds: {
    yardWidth: number;
    yardDepth: number;
    yardMidX: number;
    yardMidZ: number;
  };
  doorInteractiveNodesRef?: any;
  objects?: CADObject[];
  coordTransform?: { centerX: number; centerY: number; scale3D: number } | null;
}

export function initSceneOrbitControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  savedCameraStateRef: React.MutableRefObject<any>
): OrbitControls {
  // Safeguard setPointerCapture to prevent InvalidStateError throws when pointer is invalid or already captured
  if (domElement && typeof domElement.setPointerCapture === 'function') {
    const origSetPointerCapture = domElement.setPointerCapture.bind(domElement);
    domElement.setPointerCapture = function (pointerId: number) {
      try {
        if (domElement.isConnected && domElement.hasPointerCapture && !domElement.hasPointerCapture(pointerId)) {
          origSetPointerCapture(pointerId);
        } else if (domElement.isConnected && !domElement.hasPointerCapture) {
          origSetPointerCapture(pointerId);
        }
      } catch {
        // Suppress InvalidStateError (e.g. pointer already released, lost focus, or detached)
      }
    };
  }

  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minPolarAngle = 0.01;
  controls.maxPolarAngle = Math.PI * 0.98;
  controls.minDistance = 1;
  controls.maxDistance = 1500;

  controls.addEventListener('change', () => {
    savedCameraStateRef.current = {
      hasSaved: true,
      position: camera.position.clone(),
      target: controls.target.clone(),
      zoom: camera.zoom,
    };
  });

  return controls;
}

export function initSceneCameraPosition(options: CameraSetupOptions): void {
  const {
    camera,
    controls,
    isRoamMode,
    savedRoamState,
    savedCameraState,
    roamState,
    yardBounds,
    doorInteractiveNodesRef,
    objects,
    coordTransform,
  } = options;

  if (isRoamMode) {
    controls.enabled = false;
    camera.fov = 62;
    camera.near = 0.25;
    camera.updateProjectionMatrix();

    // Spawn at the Security Gate entrance
    const gateSpawn = findGateSpawnLocation(
      doorInteractiveNodesRef,
      objects,
      coordTransform,
      yardBounds
    );

    roamState.x = gateSpawn.x;
    roamState.z = gateSpawn.z;
    roamState.footY = gateSpawn.footY;
    roamState.yaw = gateSpawn.yaw;
    roamState.pitch = gateSpawn.pitch;

    if (savedRoamState) {
      savedRoamState.hasSaved = true;
      savedRoamState.x = gateSpawn.x;
      savedRoamState.z = gateSpawn.z;
      savedRoamState.footY = gateSpawn.footY;
      savedRoamState.yaw = gateSpawn.yaw;
      savedRoamState.pitch = gateSpawn.pitch;
    }
  } else {
    if (savedCameraState.hasSaved) {
      camera.position.copy(savedCameraState.position);
      controls.target.copy(savedCameraState.target);
      camera.zoom = savedCameraState.zoom;
      controls.update();
    } else {
      const maxDim = Math.max(yardBounds.yardWidth, yardBounds.yardDepth, 120);
      camera.position.set(maxDim * 0.95, maxDim * 1.05, maxDim * 1.15);
      controls.target.set(yardBounds.yardMidX, 12, yardBounds.yardMidZ);
      controls.update();
      savedCameraState.hasSaved = true;
      savedCameraState.position = camera.position.clone();
      savedCameraState.target = controls.target.clone();
      savedCameraState.zoom = camera.zoom;
    }
  }
}
