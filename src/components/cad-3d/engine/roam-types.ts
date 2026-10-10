/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CADObject, ProjectSettings } from '../../../types/cad';
import {
  ClimbableZone3D,
  InteractiveDoorNode,
  SiteStation3D,
  WalkablePlatform3D,
} from '../types';
import { SkyWeatherRig } from '../sky-weather';
import { CoordTransform, ExcavatedZone3D } from '../scene/types';

export interface RoamTelemetry {
  elevM: number;
  eyeElevM: number;
  headingDeg: number;
  compassDir: string;
  isClimbing: boolean;
  climbState: 'idle' | 'climbing-up' | 'climbing-down' | 'holding';
  activeLadderName: string;
  nearLadderName: string;
  nearEquipmentName: string;
  rungNumber: number;
  maxRungs: number;
  climbPct: number;
  surfaceName: string;
  speedMps: number;
  laddersCount: number;
}

export interface CableHudStatus {
  snapLabel: string;
  lengthStr: string;
  hoveredCableId: string | null;
}

export interface FocusedDoorInfo {
  id: string;
  name: string;
  isOpen: boolean;
  distMeters: number;
}

export interface RoamRenderLoopParams {
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  isRoamModeRef: React.MutableRefObject<boolean>;
  roamStateRef: React.MutableRefObject<any>;
  keysHeldRef: React.MutableRefObject<any>;
  freeMouseLookRef: React.MutableRefObject<boolean>;
  autoRotateRef: React.MutableRefObject<boolean>;
  showSkyRef: React.MutableRefObject<boolean>;
  skyWeatherRigRef: React.MutableRefObject<SkyWeatherRig | null>;
  savedRoamStateRef: React.MutableRefObject<any>;
  savedCameraStateRef: React.MutableRefObject<any>;
  excavatedZonesRef: React.MutableRefObject<ExcavatedZone3D[]>;
  walkablePlatformsRef: React.MutableRefObject<WalkablePlatform3D[]>;
  climbablesRef: React.MutableRefObject<ClimbableZone3D[]>;
  siteStationsRef: React.MutableRefObject<SiteStation3D[]>;
  doorInteractiveNodesRef: React.MutableRefObject<Map<string, InteractiveDoorNode>>;
  focusedDoorRef: React.MutableRefObject<FocusedDoorInfo | null>;
  setFocusedDoorPrompt: React.Dispatch<React.SetStateAction<FocusedDoorInfo | null>>;
  setRoamTelemetry: React.Dispatch<React.SetStateAction<RoamTelemetry>>;
  playLadderRungSound: (isUp: boolean) => void;
  playFootstepSound: () => void;
  // Cables & Tooling
  cablesGroupRef: React.MutableRefObject<THREE.Group | null>;
  cablePreviewGroupRef: React.MutableRefObject<THREE.Group | null>;
  cableToolModeRef: React.MutableRefObject<'none' | 'lay' | 'delete'>;
  coordTransformRef: React.MutableRefObject<CoordTransform>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  objectElevYMapRef: React.MutableRefObject<Map<string, number>>;
  currentTargetPt3DRef: React.MutableRefObject<any>;
  cableWaypoints3DRef: React.MutableRefObject<any[]>;
  selectedCablePresetRef: React.MutableRefObject<any>;
  cableOrthoSnapRef: React.MutableRefObject<boolean>;
  settingsRef: React.MutableRefObject<ProjectSettings>;
  setCableHudStatus: React.Dispatch<React.SetStateAction<CableHudStatus>>;
  generateFluid3DCableCurvePts: any;
  computeSnapped2DTarget: any;
  projectOntoSegment2D: any;
}
