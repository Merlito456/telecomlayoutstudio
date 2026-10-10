/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface CoordTransform {
  centerX: number;
  centerY: number;
  scale3D: number;
}

export interface ExcavatedZone3D {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  depth3D: number;
  levelM: number;
  retainingMat: 'concrete' | 'metal' | 'gravel' | 'earth';
}

export interface PerimeterSegment {
  id: string;
  isCement: boolean;
  p1: { x: number; z: number };
  p2: { x: number; z: number };
  height: number;
}

export interface YardBounds3D {
  yard3DMinX: number;
  yard3DMaxX: number;
  yard3DMinZ: number;
  yard3DMaxZ: number;
  yardWidth: number;
  yardDepth: number;
  yardMidX: number;
  yardMidZ: number;
  centerX: number;
  centerY: number;
  scale3D: number;
}
