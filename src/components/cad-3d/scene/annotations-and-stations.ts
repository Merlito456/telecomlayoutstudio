/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { CADObject } from '../../../types/cad';
import {
  ClimbableZone3D,
  SiteStation3D,
  WalkablePlatform3D,
} from '../types';

export interface RegisterAnnotationsParams {
  obj: CADObject;
  stencilId: string;
  objW: number;
  objD: number;
  posX: number;
  posZ: number;
  elevY: number;
  visible3DObjects: CADObject[];
  climbablesRef: React.MutableRefObject<ClimbableZone3D[]>;
  walkablePlatformsRef: React.MutableRefObject<WalkablePlatform3D[]>;
  siteStationsRef: React.MutableRefObject<SiteStation3D[]>;
  labelsGroup: THREE.Group;
  create3DEquipmentBadge: (text: string, pos: THREE.Vector3) => THREE.Group;
}

export function registerAnnotationsAndStations({
  obj,
  stencilId,
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
}: RegisterAnnotationsParams): void {
  const isSurfaceStencil =
    stencilId === 'grass-area' ||
    stencilId === 'grass-patch' ||
    stencilId === 'gravel-pad' ||
    stencilId === 'compound-gravel' ||
    stencilId === 'concrete-yard' ||
    stencilId === 'asphalt-road' ||
    stencilId === 'road-segment' ||
    stencilId === 'sidewalk' ||
    stencilId === 'flowers-bed' ||
    stencilId === 'drainage-canal' ||
    stencilId === 'excavated-pit' ||
    stencilId === 'elevated-terrace' ||
    stencilId === 'earth-berm-level';

  const isPerimeter =
    stencilId === 'wall' ||
    stencilId === 'masonry-wall' ||
    stencilId === 'perimeter-wall' ||
    stencilId === 'boundary-fence' ||
    stencilId === 'cement-fence' ||
    stencilId === 'gate-2door';

  const isBasepad =
    stencilId === 'cement-basepad' ||
    stencilId === 'gen-basepad' ||
    stencilId === 'tx-basepad' ||
    stencilId === 'ac-basepad' ||
    stencilId === 'cement-slab' ||
    stencilId === 'elevated-basepad' ||
    stencilId === 'custom-elevated-basepad';

  const rotRad = -((obj.rotation || 0) * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rotRad));
  const absSin = Math.abs(Math.sin(rotRad));
  const rotHalfW = (objW * absCos + objD * absSin) / 2;
  const rotHalfD = (objW * absSin + objD * absCos) / 2;

  const isCableLadderObj =
    stencilId === 'basepad-ladder' ||
    stencilId === 'cabin-feeder-ladder' ||
    stencilId === 'indoor-ladder' ||
    stencilId === 'indoor-ladder-long' ||
    stencilId === 'indoor-ladder-junction' ||
    stencilId === 'connecting-ladder' ||
    stencilId === 'cable-ladder-top' ||
    stencilId === 'cable-ladder' ||
    stencilId === 'cable-tray' ||
    stencilId.includes('indoor-ladder');

  const isTowerObj =
    stencilId === '4leg-tower' ||
    stencilId === 'tower-4leg' ||
    stencilId === '3leg-tower' ||
    stencilId === 'tower-3leg' ||
    stencilId === 'monopole' ||
    stencilId === 'monopole-tower' ||
    stencilId === 'monopole-platform' ||
    stencilId === 'guyed-tower' ||
    stencilId === 'rooftop-mount' ||
    stencilId === 'rooftop-parapet-mount';

  if (isCableLadderObj) {
    const ladderLabel =
      stencilId === 'cabin-feeder-ladder'
        ? 'Cabin Feeder Cable Ladder'
        : stencilId === 'connecting-ladder'
        ? 'Connecting Transition Cable Ladder'
        : stencilId.includes('indoor')
        ? 'In-Shelter Overhead Cable Ladder'
        : 'Site Cable Ladder & Riser';
    climbablesRef.current.push({
      id: obj.id,
      name: ladderLabel,
      category: 'cable-ladder',
      x: posX,
      z: posZ,
      minX: posX - rotHalfW - 4.5,
      maxX: posX + rotHalfW + 4.5,
      minZ: posZ - rotHalfD - 4.5,
      maxZ: posZ + rotHalfD + 4.5,
      baseY: elevY,
      deckY: elevY + 14.5,
      topY: elevY + 45.0,
      rotationRad: rotRad,
      isSloped: stencilId === 'connecting-ladder',
    });
    walkablePlatformsRef.current.push({
      id: `deck_${obj.id}`,
      name: ladderLabel,
      minX: posX - rotHalfW - 2.0,
      maxX: posX + rotHalfW + 2.0,
      minZ: posZ - rotHalfD - 2.0,
      maxZ: posZ + rotHalfD + 2.0,
      topY: elevY + 14.5,
      requiresClimb: true,
    });
  } else if (isTowerObj) {
    const hM = obj.towerHeightM || obj.customProps?.towerHeightM || 30;
    const tHeight3D = (hM / 30) * 140;
    climbablesRef.current.push({
      id: obj.id,
      name: `${(stencilId || 'Telecom Tower').replace(/-/g, ' ').toUpperCase()} Climbing Ladder`,
      category: 'tower-ladder',
      x: posX,
      z: posZ,
      minX: posX - Math.max(rotHalfW, 8),
      maxX: posX + Math.max(rotHalfW, 8),
      minZ: posZ - Math.max(rotHalfD, 8),
      maxZ: posZ + Math.max(rotHalfD, 8),
      baseY: elevY,
      deckY: elevY + tHeight3D,
      topY: elevY + tHeight3D + 8,
      rotationRad: rotRad,
    });
    walkablePlatformsRef.current.push({
      id: `tower_top_${obj.id}`,
      name: 'Tower Antenna Platform',
      minX: posX - 7.5,
      maxX: posX + 7.5,
      minZ: posZ - 7.5,
      maxZ: posZ + 7.5,
      topY: elevY + tHeight3D,
      requiresClimb: true,
    });
  } else if (isBasepad) {
    const padH =
      stencilId === 'elevated-basepad' || stencilId === 'custom-elevated-basepad'
        ? 6.0
        : obj.basepadHeight !== undefined
        ? (obj.basepadHeight / 1000) * 10
        : obj.customProps?.basepadHeight !== undefined
        ? (obj.customProps.basepadHeight / 1000) * 10
        : 1.2;
    walkablePlatformsRef.current.push({
      id: obj.id,
      name: padH > 2.5 ? 'Elevated Concrete Basepad' : 'Concrete Equipment Basepad',
      minX: posX - rotHalfW,
      maxX: posX + rotHalfW,
      minZ: posZ - rotHalfD,
      maxZ: posZ + rotHalfD,
      topY: elevY + padH,
      requiresClimb: false,
    });
  } else if (stencilId === 'shelter' || stencilId === 'cement-shelter') {
    walkablePlatformsRef.current.push({
      id: `${obj.id}-interior-floor`,
      name: 'Cabin Interior Floor',
      minX: posX - rotHalfW + 0.8,
      maxX: posX + rotHalfW - 0.8,
      minZ: posZ - rotHalfD + 0.8,
      maxZ: posZ + rotHalfD - 0.8,
      topY: elevY + 3.5,
      requiresClimb: false,
    });
    walkablePlatformsRef.current.push({
      id: obj.id,
      name: 'Telecom Shelter Roof',
      minX: posX - rotHalfW,
      maxX: posX + rotHalfW,
      minZ: posZ - rotHalfD,
      maxZ: posZ + rotHalfD,
      topY: elevY + 21.0,
      requiresClimb: true,
    });
  }

  if (stencilId && !isBasepad && !isSurfaceStencil && !isPerimeter && !obj.isStencilLabel) {
    siteStationsRef.current.push({
      id: obj.id,
      name: (obj.customProps?.name || stencilId.replace(/-/g, ' ')).toUpperCase(),
      category: isCableLadderObj ? 'ladder' : isTowerObj ? 'tower' : 'equipment',
      x: posX,
      z: posZ,
      y: elevY,
    });
  }

  const isBackgroundSurface =
    stencilId === 'compound-gravel' ||
    stencilId === 'gravel-pad' ||
    stencilId === 'concrete-yard' ||
    stencilId === 'grass-area' ||
    stencilId === 'grass-patch' ||
    stencilId === 'asphalt-road' ||
    stencilId === 'road-segment' ||
    stencilId === 'sidewalk' ||
    stencilId === 'drainage-canal' ||
    stencilId === 'flowers-bed' ||
    stencilId === 'excavated-pit' ||
    stencilId === 'elevated-terrace' ||
    stencilId === 'earth-berm-level';

  if (stencilId && !obj.isStencilLabel && !isBackgroundSurface) {
    let rawName = (obj.stencilId || '').replace(/-/g, ' ').toUpperCase();
    if (stencilId.includes('acpdb')) {
      const acpdbObjs = visible3DObjects.filter(
        (o) =>
          (o.stencilId || o.customProps?.stencilType || '').includes('acpdb') &&
          !o.isStencilLabel
      );
      const myIndex = acpdbObjs.findIndex((o) => o.id === obj.id);
      const totalAcpdb = acpdbObjs.length;
      const customTitle =
        obj.customProps?.name ||
        (obj.text && !obj.text.includes('ACPDB') ? obj.text : null);
      const mLabel =
        obj.customProps?.mounting === 'pole'
          ? 'POLE'
          : obj.customProps?.mounting === 'stand'
          ? 'STAND'
          : 'WALL';
      if (customTitle) {
        rawName = customTitle.toUpperCase();
      } else if (obj.customProps?.boxCount === 2 || stencilId === 'acpdb-dual') {
        rawName = `DUAL ACPDB (MAINS + DG)${totalAcpdb > 1 ? ` #${myIndex + 1}` : ''}`;
      } else if (totalAcpdb > 1) {
        const role =
          myIndex === 0
            ? 'MAINS'
            : myIndex === 1
            ? 'DG'
            : myIndex === 2
            ? 'SOLAR'
            : 'AUX';
        rawName = `ACPDB #${myIndex + 1} (${role} - ${mLabel})`;
      } else {
        rawName = `ACPDB (${mLabel} MOUNTED)`;
      }
    } else if (
      stencilId === 'ats' ||
      stencilId === 'ats-panel' ||
      stencilId === 'ats-cabinet' ||
      stencilId === 'ats-wall'
    ) {
      rawName = 'ATS (WALL MOUNTED)';
    } else if (stencilId.startsWith('fhodc-')) {
      rawName = rawName.replace('FHODC', 'FH ODC');
    }
    const badgePos = new THREE.Vector3(posX, elevY + Math.max(objD * 0.4, 7) + 5, posZ);
    const badge = create3DEquipmentBadge(rawName, badgePos);
    labelsGroup.add(badge);
  }
}
