/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CADLayer, CADObject, ProjectSettings } from '../../../types/cad';
import { SkyWeatherRig } from '../sky-weather';
import {
  ClimbableZone3D,
  InteractiveDoorNode,
  LightingPreset,
  SiteStation3D,
  SiteSurfaceType,
  WalkablePlatform3D,
} from '../types';
import {
  startRoamRenderLoop,
  RoamTelemetry,
  CableHudStatus,
  FocusedDoorInfo,
} from '../engine/roam-render-loop';
import { CoordTransform, ExcavatedZone3D } from '../scene/types';
import { initializeCAD3DScene } from '../engine/scene-initialization';

export interface UseCAD3DSceneMountProps {
  mountRef: React.RefObject<HTMLDivElement | null>;
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  lightsGroupRef: React.MutableRefObject<THREE.Group | null>;
  dimsGroupRef: React.MutableRefObject<THREE.Group | null>;
  labelsGroupRef: React.MutableRefObject<THREE.Group | null>;
  cablesGroupRef: React.MutableRefObject<THREE.Group | null>;
  cablePreviewGroupRef: React.MutableRefObject<THREE.Group | null>;
  skyWeatherRigRef: React.MutableRefObject<SkyWeatherRig | null>;
  savedCameraStateRef: React.MutableRefObject<any>;
  savedRoamStateRef: React.MutableRefObject<any>;
  coordTransformRef: React.MutableRefObject<CoordTransform>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  settingsRef: React.MutableRefObject<ProjectSettings>;
  layersRef: React.MutableRefObject<CADLayer[] | undefined>;
  yardMeshRef: React.MutableRefObject<THREE.Mesh | null>;
  yardMatRef: React.MutableRefObject<Record<SiteSurfaceType, THREE.MeshStandardMaterial> | null>;
  landscapeMeshRef: React.MutableRefObject<THREE.Mesh | null>;
  landscapeMatRef: React.MutableRefObject<Record<SiteSurfaceType, THREE.MeshStandardMaterial> | null>;
  surfaceTypeRef: React.MutableRefObject<SiteSurfaceType>;
  lightingPresetRef: React.MutableRefObject<LightingPreset>;
  showSkyRef: React.MutableRefObject<boolean>;
  cabinRoofCutawayRef: React.MutableRefObject<boolean>;
  isRoamModeRef: React.MutableRefObject<boolean>;
  autoRotateRef: React.MutableRefObject<boolean>;
  freeMouseLookRef: React.MutableRefObject<boolean>;
  roamStateRef: React.MutableRefObject<any>;
  keysHeldRef: React.MutableRefObject<any>;
  excavatedZonesRef: React.MutableRefObject<ExcavatedZone3D[]>;
  walkablePlatformsRef: React.MutableRefObject<WalkablePlatform3D[]>;
  climbablesRef: React.MutableRefObject<ClimbableZone3D[]>;
  siteStationsRef: React.MutableRefObject<SiteStation3D[]>;
  doorInteractiveNodesRef: React.MutableRefObject<Map<string, InteractiveDoorNode>>;
  objectElevYMapRef: React.MutableRefObject<Map<string, number>>;
  rebuildCablesOnlyRef: React.MutableRefObject<((currentObjs: CADObject[]) => void) | null>;
  focusedDoorRef: React.MutableRefObject<FocusedDoorInfo | null>;
  setFocusedDoorPrompt: React.Dispatch<React.SetStateAction<FocusedDoorInfo | null>>;
  setRoamTelemetry: React.Dispatch<React.SetStateAction<RoamTelemetry>>;
  setStats: React.Dispatch<React.SetStateAction<{ objectsCount: number; scaleStr: string }>>;
  setIsSceneReady: React.Dispatch<React.SetStateAction<boolean>>;
  playLadderRungSound: (isUp: boolean) => void;
  playFootstepSound: () => void;
  updateEnvironment: (preset: LightingPreset) => void;
  nonWireStructureKey: string;
  // Cable Tooling
  cableToolModeRef: React.MutableRefObject<'none' | 'lay' | 'delete'>;
  currentTargetPt3DRef: React.MutableRefObject<any>;
  cableWaypoints3DRef: React.MutableRefObject<any[]>;
  selectedCablePresetRef: React.MutableRefObject<any>;
  cableOrthoSnapRef: React.MutableRefObject<boolean>;
  setCableHudStatus: React.Dispatch<React.SetStateAction<CableHudStatus>>;
  generateFluid3DCableCurvePts: any;
  computeSnapped2DTarget: any;
  projectOntoSegment2D: any;
  evaluateFluidCableSupportElev3D: any;
  settings: ProjectSettings;
}

export function useCAD3DSceneMount(props: UseCAD3DSceneMountProps): void {
  const {
    mountRef,
    sceneRef,
    cameraRef,
    rendererRef,
    controlsRef,
    lightsGroupRef,
    dimsGroupRef,
    labelsGroupRef,
    cablesGroupRef,
    cablePreviewGroupRef,
    skyWeatherRigRef,
    savedCameraStateRef,
    savedRoamStateRef,
    coordTransformRef,
    objectsRef,
    settingsRef,
    layersRef,
    yardMeshRef,
    yardMatRef,
    landscapeMeshRef,
    landscapeMatRef,
    surfaceTypeRef,
    lightingPresetRef,
    showSkyRef,
    cabinRoofCutawayRef,
    isRoamModeRef,
    autoRotateRef,
    freeMouseLookRef,
    roamStateRef,
    keysHeldRef,
    excavatedZonesRef,
    walkablePlatformsRef,
    climbablesRef,
    siteStationsRef,
    doorInteractiveNodesRef,
    objectElevYMapRef,
    rebuildCablesOnlyRef,
    focusedDoorRef,
    setFocusedDoorPrompt,
    setRoamTelemetry,
    setStats,
    setIsSceneReady,
    playLadderRungSound,
    playFootstepSound,
    updateEnvironment,
    nonWireStructureKey,
    cableToolModeRef,
    currentTargetPt3DRef,
    cableWaypoints3DRef,
    selectedCablePresetRef,
    cableOrthoSnapRef,
    setCableHudStatus,
    generateFluid3DCableCurvePts,
    computeSnapped2DTarget,
    projectOntoSegment2D,
    evaluateFluidCableSupportElev3D,
    settings,
  } = props;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let stopLoop: (() => void) | null = null;
    let isCancelled = false;
    let rendererInstance: THREE.WebGLRenderer | null = null;
    let resizeHandler: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const setupRafId = requestAnimationFrame(() => {
      if (isCancelled || !mountRef.current) return;
      const width = Math.max(320, container.clientWidth || window.innerWidth);
      const height = Math.max(240, container.clientHeight || window.innerHeight);

      const init = initializeCAD3DScene({
        container,
        width,
        height,
        savedCameraStateRef,
        savedRoamStateRef,
        isRoamModeRef,
        roamStateRef,
        showSkyRef,
        surfaceTypeRef,
        cabinRoofCutawayRef,
        objectsRef,
        settingsRef,
        layersRef,
        doorInteractiveNodesRef,
        climbablesRef,
        walkablePlatformsRef,
        siteStationsRef,
        objectElevYMapRef,
        evaluateFluidCableSupportElev3D,
        generateFluid3DCableCurvePts,
      });

      sceneRef.current = init.scene;
      cameraRef.current = init.camera;
      rendererRef.current = init.renderer;
      rendererInstance = init.renderer;
      controlsRef.current = init.controls;
      lightsGroupRef.current = init.lightsGroup;
      dimsGroupRef.current = init.dimsGroup;
      labelsGroupRef.current = init.labelsGroup;
      cablesGroupRef.current = init.cablesGroup;
      cablePreviewGroupRef.current = init.cablePreviewGroup;
      skyWeatherRigRef.current = init.skyRig;
      coordTransformRef.current = init.coordTransform;
      yardMeshRef.current = init.yardMesh;
      landscapeMeshRef.current = init.landscapeMesh;
      excavatedZonesRef.current = init.excavatedZones;
      yardMatRef.current = init.surfaceMaterials;
      landscapeMatRef.current = init.landscapeMaterials;
      rebuildCablesOnlyRef.current = init.rebuildCablesOnly;

      setStats({
        objectsCount: init.renderedCount,
        scaleStr: `1:${settings.scaleFactor} (${settings.unit})`,
      });

      updateEnvironment(lightingPresetRef.current);
      setIsSceneReady(true);

      // Start Roam & Render Loop
      stopLoop = startRoamRenderLoop({
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
      });

      // Window and Container Resize
      const handleResize = () => {
        if (!container || !rendererRef.current || !cameraRef.current) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w <= 0 || h <= 0) return;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };
      resizeHandler = handleResize;
      window.addEventListener('resize', handleResize);

      if (typeof ResizeObserver !== 'undefined' && container) {
        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(container);
      }
    });

    // Cleanup
    return () => {
      isCancelled = true;
      cancelAnimationFrame(setupRafId);
      if (stopLoop) stopLoop();
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (resizeObserver) resizeObserver.disconnect();

      if (isRoamModeRef.current) {
        savedRoamStateRef.current = {
          hasSaved: true,
          x: roamStateRef.current.x,
          z: roamStateRef.current.z,
          footY: roamStateRef.current.footY,
          yaw: roamStateRef.current.pitch,
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

      if (controlsRef.current) {
        try {
          controlsRef.current.dispose();
        } catch {}
        controlsRef.current = null;
      }

      doorInteractiveNodesRef.current.clear();
      climbablesRef.current = [];
      walkablePlatformsRef.current = [];
      siteStationsRef.current = [];
      if (rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (rendererInstance) {
        rendererInstance.dispose();
      }
    };
  }, [
    nonWireStructureKey,
    updateEnvironment,
    playFootstepSound,
    playLadderRungSound,
    computeSnapped2DTarget,
    evaluateFluidCableSupportElev3D,
    generateFluid3DCableCurvePts,
    projectOntoSegment2D,
    settings.scaleFactor,
    settings.unit,
  ]);
}
