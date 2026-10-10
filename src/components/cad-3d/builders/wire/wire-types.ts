/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from "../../../../types/cad";

export interface ExcavatedZone3D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  depth3D: number;
}

export interface WireNetworkElevInfo {
  supportSurfaceTop: number;
  terrainOffset3D: number;
}
