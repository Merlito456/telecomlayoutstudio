/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADLayer, CADObject, ProjectSettings } from '../../types/cad';

export interface CAD3DViewerProps {
  objects: CADObject[];
  settings: ProjectSettings;
  onClose: () => void;
  layers?: CADLayer[];
  initialRoamMode?: boolean;
  onUpdateObjects?: (nextObjects: CADObject[], toastMsg?: string) => void;
  onToggleDoors?: () => void;
  onToggleSingleDoor?: (doorId: string) => void;
  areDoorsOpen?: boolean;
}

export interface InteractiveDoorNode {
  id: string;
  name: string;
  doorType: 'cabin-door' | 'security-gate' | 'cabinet-door';
  mesh?: THREE.Object3D;
  anchor?: THREE.Object3D;
  isOpen: () => boolean;
  setOpen: (isOpen: boolean) => void;
  getWorldPosition: (outVec?: THREE.Vector3) => THREE.Vector3;
}

export interface ClimbableZone3D {
  id: string;
  name: string;
  category: 'cable-ladder' | 'tower-ladder' | 'pole';
  x: number;
  z: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  baseY: number;
  deckY: number;
  topY: number;
  rotationRad: number;
  isSloped?: boolean;
}

export interface WalkablePlatform3D {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  topY: number;
  requiresClimb?: boolean;
}

export interface SiteStation3D {
  id: string;
  name: string;
  category: string;
  x: number;
  z: number;
  y: number;
}

export type LightingPreset = 'daylight' | 'sunset' | 'night';
export type CameraPreset = 'iso' | 'front' | 'side' | 'walk' | 'top' | 'upward';
export type SiteSurfaceType = 'gravel' | 'grass' | 'asphalt' | 'concrete' | 'dirt';
