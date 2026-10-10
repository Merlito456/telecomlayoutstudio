/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../../types/cad';

export interface PowerDispatchParams {
  obj: CADObject;
  stencilId: string;
  objW: number;
  objD: number;
  builders: any;
}

export function dispatchPowerMesh({
  obj,
  stencilId,
  objW,
  objD,
  builders,
}: PowerDispatchParams): THREE.Group | THREE.Mesh | null | undefined {
  const {
    buildGenerator3D,
    buildFuelTank3D,
    buildTransformer3D,
    buildATS3D,
    buildMPD3D,
    buildDCPDU3D,
    buildECBWallMounted3D,
    buildECBPoleMounted3D,
    buildTwoPoleStructure3D,
    buildACPDB3D,
  } = builders.power;

  switch (stencilId) {
    case 'generator-pad':
    case 'generator':
      return buildGenerator3D(objW, objD);

    case 'fuel-tank':
      return buildFuelTank3D(objW, objD);

    case 'transformer':
      return buildTransformer3D(objW, objD);

    case 'ats':
    case 'ats-panel':
    case 'ats-cabinet':
    case 'ats-wall': {
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.6;
      return buildATS3D(objW, objD, mountElevM);
    }

    case 'mpd': {
      const isWall =
        obj.customProps?.mounting === 'wall' || obj.customProps?.isWallMounted || false;
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
      return buildMPD3D(objW, objD, isWall, mountElevM);
    }

    case 'dcpdu': {
      const isWall =
        obj.customProps?.mounting === 'wall' || obj.customProps?.isWallMounted || false;
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
      return buildDCPDU3D(objW, objD, isWall, mountElevM);
    }

    case 'ecb':
    case 'ecb-wall': {
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
      return buildECBWallMounted3D(objW, objD, mountElevM);
    }

    case 'ecb-pole':
      return buildECBPoleMounted3D(objW, objD);

    case 'power-twopole-structure':
      return buildTwoPoleStructure3D(objW, objD);

    case 'acpdb':
    case 'acpdb-wall': {
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
      const mType =
        obj.customProps?.mounting === 'pole'
          ? 'pole'
          : obj.customProps?.mounting === 'stand'
          ? 'stand'
          : 'wall';
      const sizeScale = obj.customProps?.sizeScale ?? 1.0;
      const boxW = obj.customProps?.boxWidth;
      const boxH = obj.customProps?.boxHeight;
      const boxD = obj.customProps?.boxDepth;
      const boxCount = obj.customProps?.boxCount ?? 1;
      return buildACPDB3D(
        objW,
        objD,
        mType,
        mountElevM,
        sizeScale,
        boxW,
        boxH,
        boxD,
        boxCount
      );
    }

    case 'acpdb-pole': {
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
      const sizeScale = obj.customProps?.sizeScale ?? 1.0;
      const boxW = obj.customProps?.boxWidth;
      const boxH = obj.customProps?.boxHeight;
      const boxD = obj.customProps?.boxDepth;
      const boxCount = obj.customProps?.boxCount ?? 1;
      return buildACPDB3D(
        objW,
        objD,
        'pole',
        mountElevM,
        sizeScale,
        boxW,
        boxH,
        boxD,
        boxCount
      );
    }

    case 'acpdb-dual': {
      const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
      const mType =
        obj.customProps?.mounting === 'pole'
          ? 'pole'
          : obj.customProps?.mounting === 'stand'
          ? 'stand'
          : 'wall';
      const sizeScale = obj.customProps?.sizeScale ?? 1.0;
      const boxW = obj.customProps?.boxWidth;
      const boxH = obj.customProps?.boxHeight;
      const boxD = obj.customProps?.boxDepth;
      const boxCount = obj.customProps?.boxCount ?? 2;
      return buildACPDB3D(
        objW,
        objD,
        mType,
        mountElevM,
        sizeScale,
        boxW,
        boxH,
        boxD,
        boxCount
      );
    }

    default:
      if (stencilId.includes('acpdb')) {
        const mountElevM = obj.customProps?.mountingElevationM ?? 1.55;
        const mType =
          obj.customProps?.mounting === 'pole'
            ? 'pole'
            : obj.customProps?.mounting === 'stand'
            ? 'stand'
            : 'wall';
        const sizeScale = obj.customProps?.sizeScale ?? 1.0;
        const boxW = obj.customProps?.boxWidth;
        const boxH = obj.customProps?.boxHeight;
        const boxD = obj.customProps?.boxDepth;
        const boxCount = obj.customProps?.boxCount ?? (stencilId.includes('dual') ? 2 : 1);
        return buildACPDB3D(
          objW,
          objD,
          mType,
          mountElevM,
          sizeScale,
          boxW,
          boxH,
          boxD,
          boxCount
        );
      }
      return undefined;
  }
}
