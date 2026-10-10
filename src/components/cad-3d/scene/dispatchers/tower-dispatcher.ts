/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../../types/cad';

export interface TowerDispatchParams {
  obj: CADObject;
  stencilId: string;
  objW: number;
  objD: number;
  getFootGroundY: (lx: number, lz: number) => number;
  builders: any;
}

export function dispatchTowerMesh({
  obj,
  stencilId,
  objW,
  objD,
  getFootGroundY,
  builders,
}: TowerDispatchParams): THREE.Group | THREE.Mesh | null | undefined {
  const {
    buildTower4Leg3D,
    buildMonopole3D,
    buildTower3Leg3D,
    buildGuyedTower3D,
    buildRooftopMount3D,
  } = builders.tower;
  const { buildCementBasepad } = builders.civil;

  switch (stencilId) {
    case '4leg-tower':
    case 'tower-4leg': {
      const hM = obj.towerHeightM || obj.customProps?.towerHeightM;
      return buildTower4Leg3D(
        objW,
        objD,
        hM,
        getFootGroundY(-objW / 2, -objD / 2),
        getFootGroundY(objW / 2, -objD / 2),
        getFootGroundY(objW / 2, objD / 2),
        getFootGroundY(-objW / 2, objD / 2)
      );
    }

    case 'monopole':
    case 'monopole-tower':
    case 'monopole-platform': {
      const hM = obj.towerHeightM || obj.customProps?.towerHeightM;
      return buildMonopole3D(objW, hM, getFootGroundY(0, 0));
    }

    case '3leg-tower':
    case 'tower-3leg': {
      const hM = obj.towerHeightM || obj.customProps?.towerHeightM;
      return buildTower3Leg3D(
        objW,
        objD,
        hM,
        getFootGroundY(0, -objD / 2),
        getFootGroundY(objW / 2, objD / 2),
        getFootGroundY(-objW / 2, objD / 2)
      );
    }

    case 'guyed-tower': {
      const hM = obj.towerHeightM || obj.customProps?.towerHeightM;
      return buildGuyedTower3D(objW, objD, hM, getFootGroundY(0, 0));
    }

    case 'tower-footing':
    case 'guy-anchor':
      return buildCementBasepad(objW, objD, 3.2, true, getFootGroundY(0, 0));

    case 'rooftop-mount':
    case 'rooftop-parapet-mount':
      return buildRooftopMount3D(
        objW,
        objD,
        obj.towerHeightM || obj.customProps?.towerHeightM
      );

    default:
      return undefined;
  }
}
