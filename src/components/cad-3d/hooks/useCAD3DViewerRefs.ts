import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CADLayer, CADObject, ProjectSettings } from '../../../types/cad';
import {
  ClimbableZone3D,
  InteractiveDoorNode,
  LightingPreset,
  SiteStation3D,
  SiteSurfaceType,
  WalkablePlatform3D,
} from '../types';
import { SkyWeatherRig } from '../sky-weather';
import { CoordTransform, ExcavatedZone3D } from '../scene/types';

export type CAD3DViewerRefsResult = ReturnType<typeof useCAD3DViewerRefs>;

export function useCAD3DViewerRefs(
  objects: CADObject[],
  settings: ProjectSettings,
  layers?: CADLayer[],
  initialRoamMode = false
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const dimsGroupRef = useRef<THREE.Group | null>(null);
  const labelsGroupRef = useRef<THREE.Group | null>(null);
  const cablesGroupRef = useRef<THREE.Group | null>(null);
  const cablePreviewGroupRef = useRef<THREE.Group | null>(null);
  const rebuildCablesOnlyRef = useRef<((currentObjs: CADObject[]) => void) | null>(null);
  const coordTransformRef = useRef<CoordTransform>({
    centerX: 0,
    centerY: 0,
    scale3D: 0.22,
  });

  const objectElevYMapRef = useRef<Map<string, number>>(new Map());
  const objectsRef = useRef<CADObject[]>(objects);
  const settingsRef = useRef<ProjectSettings>(settings);
  const layersRef = useRef<CADLayer[] | undefined>(layers);
  const yardMeshRef = useRef<THREE.Mesh | null>(null);
  const yardMatRef = useRef<Record<SiteSurfaceType, THREE.MeshStandardMaterial> | null>(null);
  const landscapeMeshRef = useRef<THREE.Mesh | null>(null);
  const landscapeMatRef = useRef<Record<SiteSurfaceType, THREE.MeshStandardMaterial> | null>(null);

  const doorInteractiveNodesRef = useRef<Map<string, InteractiveDoorNode>>(new Map());
  const savedCameraStateRef = useRef<{
    hasSaved: boolean;
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
  }>({
    hasSaved: false,
    position: new THREE.Vector3(120, 140, 160),
    target: new THREE.Vector3(0, 0, 0),
    zoom: 1,
  });
  const savedRoamStateRef = useRef<{
    hasSaved: boolean;
    x: number;
    z: number;
    footY: number;
    yaw: number;
    pitch: number;
  }>({
    hasSaved: false,
    x: 0,
    z: 32,
    footY: 0,
    yaw: 0,
    pitch: -0.05,
  });

  const skyWeatherRigRef = useRef<SkyWeatherRig | null>(null);
  const showSkyRef = useRef<boolean>(true);
  const lightingPresetRef = useRef<LightingPreset>('daylight');
  const surfaceTypeRef = useRef<SiteSurfaceType>('gravel');
  const cabinRoofCutawayRef = useRef<boolean>(true);

  const isRoamModeRef = useRef<boolean>(initialRoamMode);
  const autoRotateRef = useRef<boolean>(false);
  const freeMouseLookRef = useRef<boolean>(true);
  const soundEnabledRef = useRef<boolean>(true);

  const climbablesRef = useRef<ClimbableZone3D[]>([]);
  const walkablePlatformsRef = useRef<WalkablePlatform3D[]>([]);
  const siteStationsRef = useRef<SiteStation3D[]>([]);
  const excavatedZonesRef = useRef<ExcavatedZone3D[]>([]);

  const keysHeldRef = useRef<{
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    e: boolean;
    r: boolean;
    shift: boolean;
    space: boolean;
  }>({
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
    r: false,
    shift: false,
    space: false,
  });

  const roamStateRef = useRef({
    x: 0,
    z: 32,
    footY: 0,
    yaw: 0,
    pitch: -0.05,
    velY: 0,
    isClimbing: false,
    climbState: 'idle' as 'idle' | 'climbing-up' | 'climbing-down' | 'holding',
    latchedLadderId: null as string | null,
    latchedLadderName: '' as string,
    climbDistAccum: 0,
    walkDistAccum: 0,
    totalWalkDist: 0,
    walkBobPhase: 0,
    mouseNormX: 0,
    mouseNormY: 0,
    isMouseInCanvas: false,
    isMouseDragging: false,
    isRightMouseHeld: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  return {
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
    rebuildCablesOnlyRef,
    coordTransformRef,
    objectElevYMapRef,
    objectsRef,
    settingsRef,
    layersRef,
    yardMeshRef,
    yardMatRef,
    landscapeMeshRef,
    landscapeMatRef,
    doorInteractiveNodesRef,
    savedCameraStateRef,
    savedRoamStateRef,
    skyWeatherRigRef,
    showSkyRef,
    lightingPresetRef,
    surfaceTypeRef,
    cabinRoofCutawayRef,
    isRoamModeRef,
    autoRotateRef,
    freeMouseLookRef,
    soundEnabledRef,
    climbablesRef,
    walkablePlatformsRef,
    siteStationsRef,
    excavatedZonesRef,
    keysHeldRef,
    roamStateRef,
  };
}
