/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { CADObject, ProjectSettings } from '../../../types/cad';
import { CoordTransform } from '../scene/types';
import { CableHudStatus } from './roam-types';
import { performRoamCableRaycast } from './roam-cable-raycast';
import { renderDeleteModePreview, renderLayModePreview } from './roam-cable-preview-mesh';

export interface RoamCablePreviewParams {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  cablesGroup: THREE.Group | null;
  previewGroup: THREE.Group;
  cableToolMode: 'none' | 'lay' | 'delete';
  isRoamMode: boolean;
  roamState: any;
  keysHeld: any;
  coordTransform: CoordTransform;
  objects: CADObject[];
  objectElevYMap: Map<string, number>;
  currentTargetPt3DRef: React.MutableRefObject<any>;
  cableWaypoints3DRef: React.MutableRefObject<any[]>;
  selectedCablePreset: any;
  cableOrthoSnap: boolean;
  settings: ProjectSettings;
  setCableHudStatus: React.Dispatch<React.SetStateAction<CableHudStatus>>;
  generateFluid3DCableCurvePts: any;
  computeSnapped2DTarget: any;
  projectOntoSegment2D: any;
  dt: number;
  frameCounter: number;
}

export function updateRoamCablePreview(params: RoamCablePreviewParams): void {
  const {
    camera: cam,
    scene,
    cablesGroup,
    previewGroup,
    cableToolMode,
    isRoamMode,
    roamState: rs,
    keysHeld,
    coordTransform,
    objects,
    objectElevYMap,
    currentTargetPt3DRef,
    cableWaypoints3DRef,
    selectedCablePreset,
    cableOrthoSnap,
    settings,
    setCableHudStatus,
    generateFluid3DCableCurvePts,
    computeSnapped2DTarget,
    projectOntoSegment2D,
    dt,
    frameCounter,
  } = params;

  while (previewGroup.children.length > 0) {
    previewGroup.remove(previewGroup.children[0]);
  }

  if (cableToolMode === 'none') return;

  const isAimAtCenter = !!document.pointerLockElement || isRoamMode || !!document.fullscreenElement;
  const raycaster = new THREE.Raycaster();
  const ndc = isAimAtCenter
    ? new THREE.Vector2(0, 0)
    : new THREE.Vector2(rs.mouseNormX, -rs.mouseNormY);
  raycaster.setFromCamera(ndc, cam);

  const { hitCadObj, rawX2D, rawY2D, foundCableId, foundCableObj, hitPt3D } = performRoamCableRaycast(
    raycaster,
    cam,
    scene,
    cablesGroup,
    objects,
    objectElevYMap,
    coordTransform,
    projectOntoSegment2D
  );

  if (rs.isMouseInCanvas || isAimAtCenter || !currentTargetPt3DRef.current) {
    const snapped = computeSnapped2DTarget(rawX2D, rawY2D, hitCadObj, hitPt3D);
    currentTargetPt3DRef.current = {
      ...snapped,
      hoveredCableId: foundCableId,
    };
  } else if (currentTargetPt3DRef.current) {
    currentTargetPt3DRef.current.hoveredCableId = foundCableId;
  }

  const activeTarget = currentTargetPt3DRef.current!;

  if (cableToolMode === 'delete') {
    renderDeleteModePreview(
      previewGroup,
      foundCableObj,
      foundCableId,
      coordTransform,
      frameCounter,
      setCableHudStatus
    );
  } else if (cableToolMode === 'lay') {
    renderLayModePreview(
      previewGroup,
      activeTarget,
      foundCableId,
      cableWaypoints3DRef.current,
      selectedCablePreset,
      cableOrthoSnap,
      keysHeld,
      objects,
      coordTransform,
      settings,
      frameCounter,
      setCableHudStatus,
      generateFluid3DCableCurvePts
    );
  }
}
