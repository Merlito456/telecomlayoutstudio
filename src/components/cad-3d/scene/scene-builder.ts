/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { CADObject, ProjectSettings } from '../../../types/cad';
import { formatMeasurement, isRackObject, isCableLadderObject } from '../../../utils/cad-geometry';
import { CAD3DSharedMaterials } from '../materials';
import {
  ClimbableZone3D,
  InteractiveDoorNode,
  SiteStation3D,
  WalkablePlatform3D,
} from '../types';
import { buildPerimeterCornerJoints } from '../builders/perimeter-joints';
import {
  CoordTransform,
  ExcavatedZone3D,
  PerimeterSegment,
} from './types';
import { ELEVATION_3D_SCALE } from './terrain-builder';
import { dispatchCivilMesh } from './dispatchers/civil-dispatcher';
import { dispatchPowerMesh } from './dispatchers/power-dispatcher';
import { dispatchShelterMesh } from './dispatchers/shelter-dispatcher';
import { dispatchTowerMesh } from './dispatchers/tower-dispatcher';
import { dispatchLadderMesh } from './dispatchers/ladder-dispatcher';
import { calculateObjectElevationY } from './elevation-calculator';
import { registerAnnotationsAndStations } from './annotations-and-stations';

export interface PopulateSceneObjectsParams {
  scene: THREE.Scene;
  dimsGroup: THREE.Group;
  labelsGroup: THREE.Group;
  visible3DObjects: CADObject[];
  excavatedZones: ExcavatedZone3D[];
  coordTransform: CoordTransform;
  sharedMats: CAD3DSharedMaterials;
  settings: ProjectSettings;
  builders: {
    civil: any;
    tower: any;
    power: any;
    shelter: any;
    cableLadder: any;
  };
  doorInteractiveNodesRef: React.MutableRefObject<Map<string, InteractiveDoorNode>>;
  climbablesRef: React.MutableRefObject<ClimbableZone3D[]>;
  walkablePlatformsRef: React.MutableRefObject<WalkablePlatform3D[]>;
  siteStationsRef: React.MutableRefObject<SiteStation3D[]>;
  objectElevYMapRef: React.MutableRefObject<Map<string, number>>;
  surfaceMaterials: Record<string, THREE.MeshStandardMaterial>;
  cementMat: THREE.MeshStandardMaterial;
}

export function populateCAD3DSceneObjects({
  scene,
  dimsGroup,
  labelsGroup,
  visible3DObjects,
  excavatedZones,
  coordTransform,
  sharedMats,
  settings,
  builders,
  doorInteractiveNodesRef,
  climbablesRef,
  walkablePlatformsRef,
  siteStationsRef,
  objectElevYMapRef,
  surfaceMaterials,
  cementMat,
}: PopulateSceneObjectsParams): number {
  const { centerX, centerY, scale3D } = coordTransform;
  const { create3DDimensionBadge, create3DEquipmentBadge, buildCementBasepad, buildUnevenLevel3D } =
    builders.civil;

  let renderedCount = 0;
  const perimeterSegments: PerimeterSegment[] = [];

  visible3DObjects.forEach((obj, objIndex) => {
    const objW = (obj.width || 20) * scale3D;
    const objD = (obj.height || 20) * scale3D;
    const posX = (obj.x + (obj.width || 20) / 2 - centerX) * scale3D;
    const posZ = (obj.y + (obj.height || 20) / 2 - centerY) * scale3D;

    const stencilId = obj.stencilId || obj.customProps?.stencilType;

    // Handle Dimension Objects in 3D
    if (obj.type === 'dim-h' || obj.type === 'dim-v' || obj.type === 'dim-aligned') {
      const x1 = (obj.x - centerX) * scale3D;
      const z1 = (obj.y - centerY) * scale3D;
      const x2 = ((obj.x2 ?? obj.x + obj.width) - centerX) * scale3D;
      const z2 = ((obj.y2 ?? obj.y + (obj.height || 0)) - centerY) * scale3D;

      const elevY = 16;
      const dimPts = [
        new THREE.Vector3(x1, 0, z1),
        new THREE.Vector3(x1, elevY, z1),
        new THREE.Vector3(x2, elevY, z2),
        new THREE.Vector3(x2, 0, z2),
      ];

      const lineGeo = new THREE.BufferGeometry().setFromPoints(dimPts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      const dimLine = new THREE.Line(lineGeo, lineMat);
      dimsGroup.add(dimLine);

      const distPx = Math.hypot((obj.x2 ?? obj.x + obj.width) - obj.x, (obj.y2 ?? obj.y) - obj.y);
      const measStr = formatMeasurement(
        distPx,
        settings.scaleFactor,
        settings.unit,
        settings.dimensionUnitFormat
      );
      const fromToStr =
        obj.fromLabel && obj.toLabel ? `FROM ${obj.fromLabel} ➔ TO ${obj.toLabel}` : '';

      const midPos = new THREE.Vector3((x1 + x2) / 2, elevY + 4, (z1 + z2) / 2);
      const badge = create3DDimensionBadge(measStr, fromToStr, midPos);
      dimsGroup.add(badge);
      renderedCount++;
      return;
    }

    if (obj.type === 'line' || obj.type === 'polyline' || obj.type === 'pen') {
      renderedCount++;
      return;
    }

    if (obj.isStencilLabel || obj.type === 'text' || obj.type === 'leader') {
      return;
    }

    const objRotRad = -((obj.rotation || 0) * Math.PI) / 180;
    const getFootGroundY = (lx: number, lz: number): number => {
      const cosR = Math.cos(objRotRad);
      const sinR = Math.sin(objRotRad);
      const wx = posX + lx * cosR + lz * sinR;
      const wz = posZ - lx * sinR + lz * cosR;
      let gY = 0;
      if (obj.levelElevationM !== undefined && obj.levelElevationM < 0) {
        gY = Math.min(gY, obj.levelElevationM * ELEVATION_3D_SCALE);
      }
      excavatedZones.forEach((ez) => {
        if (
          wx >= ez.minX - 1.5 &&
          wx <= ez.maxX + 1.5 &&
          wz >= ez.minZ - 1.5 &&
          wz <= ez.maxZ + 1.5
        ) {
          gY = Math.min(gY, -ez.depth3D);
        }
      });
      return gY;
    };

    const sId = stencilId || '';
    let mesh3D: THREE.Group | THREE.Mesh | null | undefined = undefined;

    // 1. Try Civil dispatcher
    mesh3D = dispatchCivilMesh({
      obj,
      stencilId: sId,
      objW,
      objD,
      posX,
      posZ,
      excavatedZones,
      perimeterSegments,
      builders,
      cementMat,
      surfaceMaterials,
    });

    // 2. Try Power dispatcher
    if (mesh3D === undefined) {
      mesh3D = dispatchPowerMesh({
        obj,
        stencilId: sId,
        objW,
        objD,
        builders,
      });
    }

    // 3. Try Shelter & Cabinets dispatcher
    if (mesh3D === undefined) {
      mesh3D = dispatchShelterMesh({
        obj,
        stencilId: sId,
        objW,
        objD,
        visible3DObjects,
        builders,
      });
    }

    // 4. Try Tower dispatcher
    if (mesh3D === undefined) {
      mesh3D = dispatchTowerMesh({
        obj,
        stencilId: sId,
        objW,
        objD,
        getFootGroundY,
        builders,
      });
    }

    // 5. Try Ladder dispatcher
    if (mesh3D === undefined) {
      mesh3D = dispatchLadderMesh({
        obj,
        stencilId: sId,
        objW,
        objD,
        visible3DObjects,
        builders,
      });
    }

    // 6. Fallback / generic shapes
    if (mesh3D === undefined) {
      const lM = obj.levelElevationM ?? obj.customProps?.levelElevationM;
      const isDug =
        sId === 'excavated-pit' ||
        sId.includes('excavat') ||
        (obj.text && obj.text.toLowerCase().includes('excavat')) ||
        (obj.customProps?.name &&
          String(obj.customProps.name).toLowerCase().includes('excavat')) ||
        (lM !== undefined && lM < 0);

      if (isDug) {
        mesh3D = null;
      } else if (
        lM !== undefined &&
        lM !== 0 &&
        (obj.type === 'rectangle' || obj.type === 'stencil-group')
      ) {
        const mat =
          obj.foundationRetainingMaterial ??
          obj.customProps?.foundationRetainingMaterial ??
          'concrete';
        mesh3D = buildUnevenLevel3D(objW, objD, lM, mat);
      } else if (obj.type === 'rectangle' || obj.type === 'stencil-group') {
        const padH =
          obj.basepadHeight !== undefined
            ? (obj.basepadHeight / 1000) * 10
            : obj.customProps?.basepadHeight !== undefined
            ? (obj.customProps.basepadHeight / 1000) * 10
            : 1.2;
        mesh3D = buildCementBasepad(objW, objD, padH, false);
      }
    }

    if (mesh3D) {
      const elevY = calculateObjectElevationY(obj, objIndex, visible3DObjects, sId);

      mesh3D.position.set(posX, elevY, posZ);
      objectElevYMapRef.current.set(obj.id, elevY);
      if (obj.rotation) {
        mesh3D.rotation.y = -(obj.rotation * Math.PI) / 180;
      }
      mesh3D.userData.cadObjectId = obj.id;
      const isAC =
        sId === 'air-conditioner' ||
        sId === 'wall-mount-ac' ||
        sId === 'ac-indoor-split' ||
        sId === 'ac-split' ||
        sId.includes('air-conditioner') ||
        sId.includes('wall-mount-ac') ||
        (obj as any).category === 'cooling' ||
        obj.customProps?.category === 'cooling';
      if (isAC) {
        mesh3D.userData.isAirConditioner = true;
        mesh3D.userData.acName = obj.name || (obj as any).text || 'Wall Air Conditioner';
      }
      mesh3D.traverse((child) => {
        if (!child.userData.cadObjectId) {
          child.userData.cadObjectId = obj.id;
        }
        if (isAC) {
          child.userData.isAirConditioner = true;
          child.userData.acName = obj.name || (obj as any).text || 'Wall Air Conditioner';
        }
        if (child.userData.isRack === undefined && isRackObject(obj)) {
          child.userData.isRack = true;
          child.userData.rackName = obj.name || (obj as any).text || 'Equipment Rack';
        }
        if (child.userData.isLadder === undefined && isCableLadderObject(obj)) {
          child.userData.isLadder = true;
          child.userData.ladderName = obj.name || (obj as any).text || 'Cable Ladder';
        }
      });
      scene.add(mesh3D);
      renderedCount++;

      registerAnnotationsAndStations({
        obj,
        stencilId: sId,
        objW,
        objD,
        posX,
        posZ,
        elevY,
        visible3DObjects,
        climbablesRef,
        walkablePlatformsRef,
        siteStationsRef,
        labelsGroup,
        create3DEquipmentBadge,
      });
    }
  });

  buildPerimeterCornerJoints(perimeterSegments, excavatedZones, sharedMats, scene);

  return renderedCount;
}
