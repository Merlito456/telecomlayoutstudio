/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../../types/cad';
import { ELEVATION_3D_SCALE } from '../terrain-builder';
import { ExcavatedZone3D, PerimeterSegment } from '../types';

export interface CivilDispatchParams {
  obj: CADObject;
  stencilId: string;
  objW: number;
  objD: number;
  posX: number;
  posZ: number;
  excavatedZones: ExcavatedZone3D[];
  perimeterSegments: PerimeterSegment[];
  builders: any;
  cementMat: THREE.MeshStandardMaterial;
  surfaceMaterials: Record<string, THREE.MeshStandardMaterial>;
}

export function dispatchCivilMesh({
  obj,
  stencilId,
  objW,
  objD,
  posX,
  posZ,
  excavatedZones,
  perimeterSegments,
  builders,
  cementMat,
  surfaceMaterials,
}: CivilDispatchParams): THREE.Group | THREE.Mesh | null | undefined {
  const {
    buildCementBasepad,
    buildElevatedBasepad3D,
    buildFence3D,
    buildWall3D,
    buildGate3D,
    buildRoad3D,
    buildCarPickup3D,
    buildCarSedan3D,
    buildSidewalk3D,
    buildTree3D,
    buildFlowersBed3D,
    buildCanal3D,
    buildPerson3D,
    buildGrassPatch3D,
    buildConcreteYard3D,
    buildCompoundGravel3D,
    buildUnevenLevel3D,
    buildGroundStairs3D,
  } = builders.civil;

  switch (stencilId) {
    case 'elevated-basepad':
    case 'custom-elevated-basepad':
      return buildElevatedBasepad3D(objW, objD, obj.customProps);

    case 'cement-basepad':
    case 'gen-basepad':
    case 'tx-basepad':
    case 'ac-basepad':
    case 'cement-slab': {
      const padH =
        obj.basepadHeight !== undefined
          ? (obj.basepadHeight / 1000) * 10
          : obj.customProps?.basepadHeight !== undefined
          ? (obj.customProps.basepadHeight / 1000) * 10
          : 1.2;
      return buildCementBasepad(objW, objD, padH, false);
    }

    case 'ground-stairs-3step':
    case 'cement-stairs': {
      const sId = (stencilId || '').toLowerCase();
      let stepCount = 3;
      if (sId.includes('4step') || (obj.customProps?.stepCount as number) === 4) stepCount = 4;
      else if (sId.includes('5step') || (obj.customProps?.stepCount as number) === 5) stepCount = 5;
      else if (sId.includes('2step') || (obj.customProps?.stepCount as number) === 2) stepCount = 2;
      else if (obj.customProps?.stepCount) stepCount = Number(obj.customProps.stepCount) || 3;

      const isNarrow = objW < objD;
      const stairW = isNarrow ? objW : objW;
      const stairRun = isNarrow ? objD : objD;
      const topH = 6.0;
      return buildGroundStairs3D(stairW, stairRun, topH, stepCount);
    }

    case 'gate-2door': {
      const isVerticalNoRot = !obj.rotation && (obj.height || 0) > (obj.width || 0);
      const gateSpan = isVerticalNoRot ? objD : objW;

      let gateExcavationDepth = 0;
      if (obj.levelElevationM !== undefined && obj.levelElevationM < 0) {
        gateExcavationDepth = Math.abs(obj.levelElevationM) * ELEVATION_3D_SCALE;
      }
      excavatedZones.forEach((ez) => {
        if (
          !(
            posX + gateSpan / 2 < ez.minX - 3.5 ||
            posX - gateSpan / 2 > ez.maxX + 3.5 ||
            posZ + gateSpan / 2 < ez.minZ - 3.5 ||
            posZ - gateSpan / 2 > ez.maxZ + 3.5
          )
        ) {
          gateExcavationDepth = Math.max(gateExcavationDepth, ez.depth3D);
        }
      });

      const isGateOpen = !!(
        obj.doorsOpen ||
        obj.customProps?.doorsOpen ||
        obj.customProps?.isClosed === false
      );
      const mesh3D = buildGate3D(gateSpan, gateExcavationDepth, {
        ...(obj.customProps || {}),
        objId: obj.id,
        doorsOpen: isGateOpen,
      });
      if (isVerticalNoRot) {
        mesh3D.rotation.y = Math.PI / 2;
      }
      const rad = -(obj.rotation || 0) * (Math.PI / 180) + (isVerticalNoRot ? Math.PI / 2 : 0);
      if (!isGateOpen) {
        perimeterSegments.push({
          id: obj.id,
          isCement: false,
          p1: {
            x: posX - Math.cos(rad) * (gateSpan / 2),
            z: posZ - Math.sin(rad) * (gateSpan / 2),
          },
          p2: {
            x: posX + Math.cos(rad) * (gateSpan / 2),
            z: posZ + Math.sin(rad) * (gateSpan / 2),
          },
          height: 20,
        });
      }
      return mesh3D;
    }

    case 'cement-post': {
      let postExcavationDepth = 0;
      if (obj.levelElevationM !== undefined && obj.levelElevationM < 0) {
        postExcavationDepth = Math.abs(obj.levelElevationM) * ELEVATION_3D_SCALE;
      }
      excavatedZones.forEach((ez) => {
        if (
          !(
            posX + 2.5 < ez.minX - 2.0 ||
            posX - 2.5 > ez.maxX + 2.0 ||
            posZ + 2.5 < ez.minZ - 2.0 ||
            posZ - 2.5 > ez.maxZ + 2.0
          )
        ) {
          postExcavationDepth = Math.max(postExcavationDepth, ez.depth3D);
        }
      });
      const baseH = 20.0;
      const totalPostH = baseH + postExcavationDepth;
      const postCenterY = (baseH - postExcavationDepth) / 2;
      const postGroup = new THREE.Group();
      const pW = objW || 3.0;
      const pD = objD || 3.0;
      const colGeo = new THREE.BoxGeometry(pW, totalPostH, pD);
      const colMesh = new THREE.Mesh(colGeo, cementMat);
      colMesh.position.y = postCenterY;
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      postGroup.add(colMesh);

      const capGeo = new THREE.ConeGeometry(pW * 0.72, 1.8, 4);
      const capMesh = new THREE.Mesh(capGeo, cementMat);
      capMesh.position.y = baseH + 0.9;
      capMesh.rotation.y = Math.PI / 4;
      postGroup.add(capMesh);

      const footingGeo = new THREE.BoxGeometry(pW + 1.2, 1.6, pD + 1.2);
      const footingMesh = new THREE.Mesh(footingGeo, cementMat);
      footingMesh.position.y = -postExcavationDepth + 0.8;
      postGroup.add(footingMesh);

      return postGroup;
    }

    case 'boundary-fence':
    case 'cement-fence': {
      const isCement = stencilId === 'cement-fence';
      const isVerticalNoRot = !obj.rotation && (obj.height || 0) > (obj.width || 0);
      const wallLength = isVerticalNoRot ? objD : objW;

      let fenceExcavationDepth = 0;
      if (obj.levelElevationM !== undefined && obj.levelElevationM < 0) {
        fenceExcavationDepth = Math.abs(obj.levelElevationM) * ELEVATION_3D_SCALE;
      }
      excavatedZones.forEach((ez) => {
        if (
          !(
            posX + wallLength / 2 < ez.minX - 3.5 ||
            posX - wallLength / 2 > ez.maxX + 3.5 ||
            posZ + wallLength / 2 < ez.minZ - 3.5 ||
            posZ - wallLength / 2 > ez.maxZ + 3.5
          )
        ) {
          fenceExcavationDepth = Math.max(fenceExcavationDepth, ez.depth3D);
        }
      });

      const mesh3D = buildFence3D(wallLength, isCement, fenceExcavationDepth);
      if (isVerticalNoRot) {
        mesh3D.rotation.y = Math.PI / 2;
      }
      const rad = -(obj.rotation || 0) * (Math.PI / 180) + (isVerticalNoRot ? Math.PI / 2 : 0);
      perimeterSegments.push({
        id: obj.id,
        isCement,
        p1: {
          x: posX - Math.cos(rad) * (wallLength / 2),
          z: posZ - Math.sin(rad) * (wallLength / 2),
        },
        p2: {
          x: posX + Math.cos(rad) * (wallLength / 2),
          z: posZ + Math.sin(rad) * (wallLength / 2),
        },
        height: 20,
      });
      return mesh3D;
    }

    case 'wall':
    case 'masonry-wall':
    case 'perimeter-wall': {
      const isVerticalNoRot = !obj.rotation && (obj.height || 0) > (obj.width || 0);
      const wallLength = isVerticalNoRot ? objD : objW;
      const wallThick = isVerticalNoRot ? objW : objD;

      let wallExcavationDepth = 0;
      if (obj.levelElevationM !== undefined && obj.levelElevationM < 0) {
        wallExcavationDepth = Math.abs(obj.levelElevationM) * ELEVATION_3D_SCALE;
      }
      excavatedZones.forEach((ez) => {
        if (
          !(
            posX + wallLength / 2 < ez.minX - 3.5 ||
            posX - wallLength / 2 > ez.maxX + 3.5 ||
            posZ + wallLength / 2 < ez.minZ - 3.5 ||
            posZ - wallLength / 2 > ez.maxZ + 3.5
          )
        ) {
          wallExcavationDepth = Math.max(wallExcavationDepth, ez.depth3D);
        }
      });

      const mesh3D = buildWall3D(wallLength, wallThick, wallExcavationDepth);
      if (isVerticalNoRot) {
        mesh3D.rotation.y = Math.PI / 2;
      }
      const rad = -(obj.rotation || 0) * (Math.PI / 180) + (isVerticalNoRot ? Math.PI / 2 : 0);
      perimeterSegments.push({
        id: obj.id,
        isCement: true,
        p1: {
          x: posX - Math.cos(rad) * (wallLength / 2),
          z: posZ - Math.sin(rad) * (wallLength / 2),
        },
        p2: {
          x: posX + Math.cos(rad) * (wallLength / 2),
          z: posZ + Math.sin(rad) * (wallLength / 2),
        },
        height: 20,
      });
      return mesh3D;
    }

    case 'road-segment':
    case 'asphalt-road':
      return buildRoad3D(objW, objD);

    case 'car-pickup':
      return buildCarPickup3D(objW, objD);

    case 'car-sedan':
      return buildCarSedan3D(objW, objD);

    case 'sidewalk':
      return buildSidewalk3D(objW, objD);

    case 'tree-deciduous':
    case 'tree-oak':
    case 'tree':
      return buildTree3D(objW, objD);

    case 'flowers-bed':
      return buildFlowersBed3D(objW, objD);

    case 'drainage-canal':
      return buildCanal3D(objW, objD);

    case 'site-person':
      return buildPerson3D(objW, objD);

    case 'grass-area':
    case 'grass-patch':
      return buildGrassPatch3D(objW, objD);

    case 'concrete-yard':
      return buildConcreteYard3D(objW, objD);

    case 'gravel-pad':
    case 'compound-gravel':
      return buildCompoundGravel3D(objW, objD);

    case 'excavated-pit':
      return null;

    case 'elevated-terrace': {
      const levelM = obj.levelElevationM ?? obj.customProps?.levelElevationM ?? 0.8;
      const mat =
        obj.foundationRetainingMaterial ??
        obj.customProps?.foundationRetainingMaterial ??
        'concrete';
      return buildUnevenLevel3D(objW, objD, levelM, mat, cementMat);
    }

    case 'earth-berm-level': {
      const levelM = obj.levelElevationM ?? obj.customProps?.levelElevationM ?? 0.6;
      const mat =
        obj.foundationRetainingMaterial ??
        obj.customProps?.foundationRetainingMaterial ??
        'earth';
      return buildUnevenLevel3D(objW, objD, levelM, mat, surfaceMaterials.grass);
    }

    default:
      return undefined;
  }
}
