/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, Point } from "../../types/cad";

export interface ParseDXFResult {
  objects: CADObject[];
  layersFound: string[];
  stats: {
    lines: number;
    polylines: number;
    circles: number;
    texts: number;
    dimensions: number;
    inserts: number;
    others: number;
  };
  scaleFactor?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  isLosslessStudioProject?: boolean;
  unit?: string;
}

export interface RawEntity {
  type: string;
  layer: string;
  color?: number;
  points: Point[];
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  text?: string;
  height?: number;
  rotation?: number;
  isClosed?: boolean;
  blockName?: string;
  scaleX?: number;
  scaleY?: number;
  dimType?: number;
  defPt1?: Point;
  defPt2?: Point;
  dimPt?: Point;
}

export interface BlockDef {
  name: string;
  basePoint: Point;
  entities: RawEntity[];
}

export interface DXFPair {
  code: number;
  value: string;
}
