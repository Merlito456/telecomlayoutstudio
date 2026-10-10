/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CADLayer, CADObject, ProjectSettings } from '../../../types/cad';
import { isObjectLayerVisible } from '../../../utils/cad-layers';
import {
  createTowerBuilders,
  createPowerBuilders,
  createShelterBuilders,
  createCableLadderBuilders,
  createCivilBuilders,
  createWireCableBuilders,
} from '../builders';
import { createSkyWeatherSystem, SkyWeatherRig } from '../sky-weather';
import {
  ClimbableZone3D,
  InteractiveDoorNode,
  SiteStation3D,
  SiteSurfaceType,
  WalkablePlatform3D,
} from '../types';
import { buildSiteTerrainAndExcavations } from '../scene/terrain-builder';
import { populateCAD3DSceneObjects } from '../scene/scene-builder';
import { rebuildCablesInScene } from '../scene/cables-builder';
import { CoordTransform, ExcavatedZone3D } from '../scene/types';
import { createSceneMountMaterials } from './scene-mount-materials';
import {
  initSceneOrbitControls,
  initSceneCameraPosition,
} from './scene-mount-camera';

export interface SceneInitParams {
  container: HTMLDivElement;
  width: number;
  height: number;
  savedCameraStateRef: React.MutableRefObject<any>;
  savedRoamStateRef: React.MutableRefObject<any>;
  isRoamModeRef: React.MutableRefObject<boolean>;
  roamStateRef: React.MutableRefObject<any>;
  showSkyRef: React.MutableRefObject<boolean>;
  surfaceTypeRef: React.MutableRefObject<SiteSurfaceType>;
  cabinRoofCutawayRef: React.MutableRefObject<boolean>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  settingsRef: React.MutableRefObject<ProjectSettings>;
  layersRef: React.MutableRefObject<CADLayer[] | undefined>;
  doorInteractiveNodesRef: React.MutableRefObject<Map<string, InteractiveDoorNode>>;
  climbablesRef: React.MutableRefObject<ClimbableZone3D[]>;
  walkablePlatformsRef: React.MutableRefObject<WalkablePlatform3D[]>;
  siteStationsRef: React.MutableRefObject<SiteStation3D[]>;
  objectElevYMapRef: React.MutableRefObject<Map<string, number>>;
  evaluateFluidCableSupportElev3D: any;
  generateFluid3DCableCurvePts: any;
}

export interface SceneInitResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  lightsGroup: THREE.Group;
  dimsGroup: THREE.Group;
  labelsGroup: THREE.Group;
  cablesGroup: THREE.Group;
  cablePreviewGroup: THREE.Group;
  skyRig: SkyWeatherRig;
  coordTransform: CoordTransform;
  yardMesh: THREE.Mesh | null;
  landscapeMesh: THREE.Mesh | null;
  excavatedZones: ExcavatedZone3D[];
  surfaceMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>;
  landscapeMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>;
  renderedCount: number;
  rebuildCablesOnly: (currentObjs: CADObject[]) => void;
}

export function initializeCAD3DScene(params: SceneInitParams): SceneInitResult {
  const {
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
  } = params;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2500);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 2. Controls
  const controls = initSceneOrbitControls(camera, renderer.domElement, savedCameraStateRef);

  // 3. Groups
  const lightsGroup = new THREE.Group();
  scene.add(lightsGroup);

  const dimsGroup = new THREE.Group();
  scene.add(dimsGroup);

  const labelsGroup = new THREE.Group();
  scene.add(labelsGroup);

  const cablesGroup = new THREE.Group();
  scene.add(cablesGroup);

  const cablePreviewGroup = new THREE.Group();
  scene.add(cablePreviewGroup);

  // 4. Sky & Weather
  const skyRig = createSkyWeatherSystem(scene, showSkyRef.current);

  // 5. Materials
  const {
    cementMat,
    asphaltMat,
    surfaceMaterials,
    landscapeMaterials,
    sharedMats,
  } = createSceneMountMaterials();

  // 6. Filter visible objects
  const effectiveLayers = layersRef.current || settingsRef.current.layers || [];
  const visible3DObjects = objectsRef.current.filter((o) => {
    if (effectiveLayers.length > 0 && !isObjectLayerVisible(o, effectiveLayers)) {
      return false;
    }
    return true;
  });

  // 7. Terrain
  const terrainResult = buildSiteTerrainAndExcavations({
    scene,
    visible3DObjects,
    surfaceType: surfaceTypeRef.current,
    surfaceMaterials,
    landscapeMaterials,
    cementMat,
  });

  // 8. Builders
  const civilBuilders = createCivilBuilders(
    sharedMats,
    asphaltMat,
    surfaceMaterials[surfaceTypeRef.current],
    doorInteractiveNodesRef
  );
  const towerBuilders = createTowerBuilders(sharedMats, civilBuilders.buildCementBasepad);
  const powerBuilders = createPowerBuilders(sharedMats, civilBuilders.buildCementBasepad);
  const shelterBuilders = createShelterBuilders(
    sharedMats,
    doorInteractiveNodesRef,
    civilBuilders.buildCementBasepad,
    cabinRoofCutawayRef
  );
  const cableLadderBuilders = createCableLadderBuilders(sharedMats);
  const wireCableBuilders = createWireCableBuilders(
    terrainResult.excavatedZones,
    evaluateFluidCableSupportElev3D,
    generateFluid3DCableCurvePts
  );

  // 9. Populate objects
  const renderedCount = populateCAD3DSceneObjects({
    scene,
    dimsGroup,
    labelsGroup,
    visible3DObjects,
    excavatedZones: terrainResult.excavatedZones,
    coordTransform: terrainResult.coordTransform,
    sharedMats,
    settings: settingsRef.current,
    builders: {
      civil: civilBuilders,
      tower: towerBuilders,
      power: powerBuilders,
      shelter: shelterBuilders,
      cableLadder: cableLadderBuilders,
    },
    doorInteractiveNodesRef,
    climbablesRef,
    walkablePlatformsRef,
    siteStationsRef,
    objectElevYMapRef,
    surfaceMaterials,
    cementMat,
  });

  // 10. Rebuild cables
  const rebuildCablesOnly = (currentObjs: CADObject[]) => {
    rebuildCablesInScene({
      currentObjs,
      cablesGroup,
      wireNetworkElevCache: wireCableBuilders.wireNetworkElevCache,
      layers: layersRef.current || settingsRef.current.layers || [],
      centerX: terrainResult.coordTransform.centerX,
      centerY: terrainResult.coordTransform.centerY,
      scale3D: terrainResult.coordTransform.scale3D,
      buildWireCables3D: wireCableBuilders.buildWireCables3D,
    });
  };
  rebuildCablesOnly(objectsRef.current);

  // 11. Initial camera
  initSceneCameraPosition({
    camera,
    controls,
    isRoamMode: isRoamModeRef.current,
    savedRoamState: savedRoamStateRef.current,
    savedCameraState: savedCameraStateRef.current,
    roamState: roamStateRef.current,
    yardBounds: terrainResult.yardBounds,
    doorInteractiveNodesRef,
    objects: objectsRef.current,
    coordTransform: terrainResult.coordTransform,
  });

  return {
    scene,
    camera,
    renderer,
    controls,
    lightsGroup,
    dimsGroup,
    labelsGroup,
    cablesGroup,
    cablePreviewGroup,
    skyRig,
    coordTransform: terrainResult.coordTransform,
    yardMesh: terrainResult.yardMesh,
    landscapeMesh: terrainResult.landscapeMesh,
    excavatedZones: terrainResult.excavatedZones,
    surfaceMaterials,
    landscapeMaterials,
    renderedCount,
    rebuildCablesOnly,
  };
}
