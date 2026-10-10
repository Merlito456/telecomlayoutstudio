/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import * as THREE from 'three';
import { SiteSurfaceType } from '../types';

export interface UseCAD3DDisplaySyncParams {
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  dimsGroupRef: React.MutableRefObject<THREE.Group | null>;
  labelsGroupRef: React.MutableRefObject<THREE.Group | null>;
  yardMeshRef: React.MutableRefObject<THREE.Mesh | null>;
  yardMatRef: React.MutableRefObject<Record<SiteSurfaceType, THREE.MeshStandardMaterial> | null>;
  landscapeMeshRef: React.MutableRefObject<THREE.Mesh | null>;
  landscapeMatRef: React.MutableRefObject<Record<SiteSurfaceType, THREE.MeshStandardMaterial> | null>;
  surfaceType: SiteSurfaceType;
  showDimensions: boolean;
  showObjectLabels: boolean;
  wireframe: boolean;
  cabinRoofCutaway: boolean;
  cabinRoofCutawayRef: React.MutableRefObject<boolean>;
}

export function useCAD3DDisplaySync({
  sceneRef,
  dimsGroupRef,
  labelsGroupRef,
  yardMeshRef,
  yardMatRef,
  landscapeMeshRef,
  landscapeMatRef,
  surfaceType,
  showDimensions,
  showObjectLabels,
  wireframe,
  cabinRoofCutaway,
  cabinRoofCutawayRef,
}: UseCAD3DDisplaySyncParams) {
  // Dynamic Site Surface Type Switch
  useEffect(() => {
    if (yardMatRef.current && yardMatRef.current[surfaceType]) {
      const yardMat = yardMatRef.current[surfaceType];
      if (yardMeshRef.current) {
        yardMeshRef.current.material = yardMat;
      }
      if (
        landscapeMeshRef.current &&
        landscapeMatRef.current &&
        landscapeMatRef.current[surfaceType]
      ) {
        landscapeMeshRef.current.material = landscapeMatRef.current[surfaceType];
      }
    }
  }, [surfaceType, landscapeMatRef, landscapeMeshRef, yardMatRef, yardMeshRef]);

  // Dimension Layer Toggle
  useEffect(() => {
    if (dimsGroupRef.current) {
      dimsGroupRef.current.visible = showDimensions;
    }
  }, [showDimensions, dimsGroupRef]);

  // Object Labels Layer Toggle
  useEffect(() => {
    if (labelsGroupRef.current) {
      labelsGroupRef.current.visible = showObjectLabels;
    }
  }, [showObjectLabels, labelsGroupRef]);

  // Wireframe Toggle
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((m) => {
            m.wireframe = wireframe;
          });
        } else {
          node.material.wireframe = wireframe;
        }
      }
    });
  }, [wireframe, sceneRef]);

  // Cabin Roof Cutaway Toggle
  useEffect(() => {
    cabinRoofCutawayRef.current = cabinRoofCutaway;
    if (!sceneRef.current) return;
    sceneRef.current.traverse((node) => {
      if (node.userData?.isCabinRoof && node instanceof THREE.Mesh) {
        if (Array.isArray(node.material)) {
          node.material.forEach((m) => {
            m.transparent = true;
            m.opacity = cabinRoofCutaway ? 0.15 : 1.0;
            m.depthWrite = !cabinRoofCutaway;
            m.needsUpdate = true;
          });
        } else if (node.material) {
          node.material.transparent = true;
          node.material.opacity = cabinRoofCutaway ? 0.15 : 1.0;
          node.material.depthWrite = !cabinRoofCutaway;
          node.material.needsUpdate = true;
        }
      }
    });
  }, [cabinRoofCutaway, cabinRoofCutawayRef, sceneRef]);
}
