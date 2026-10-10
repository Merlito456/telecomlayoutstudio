/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';
import { buildShelterWallsAndDoor } from './shelter-walls-door';
import { buildShelterInteriorAndRoof } from './shelter-roof-hvac';

export interface ShelterStructureDeps {
  mats: CAD3DSharedMaterials;
  doorInteractiveNodesRef?: any;
  buildCementBasepad?: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group;
  cabinRoofCutawayRef?: any;
  buildTelecomRack: (rackW?: number, rackH?: number, rackD?: number, rackObj?: any) => THREE.Group;
  buildRectifierCabinet: (recW?: number, recH?: number, recD?: number, batteryCount?: number) => THREE.Group;
  buildBatteryBank: (batW?: number, batH?: number, batD?: number) => THREE.Group;
  buildACDBPanel: (panW?: number, panH?: number, panD?: number) => THREE.Group;
  buildIndoorAC: (acW?: number, acH?: number, acD?: number, props?: any) => THREE.Group;
  buildFireExtinguisher: () => THREE.Group;
}

export function createShelterStructureBuilder(deps: ShelterStructureDeps) {
  const {
    mats,
    doorInteractiveNodesRef,
    buildCementBasepad,
    cabinRoofCutawayRef,
    buildTelecomRack,
    buildRectifierCabinet,
    buildBatteryBank,
    buildACDBPanel,
    buildIndoorAC,
    buildFireExtinguisher,
  } = deps;

  const { stainlessMat, telecomGreyMat, whiteCementMat } = mats;

  const intFloorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.25,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.7,
  });
  const yellowLadderMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.4,
    metalness: 0.3,
  });

  const buildShelter3D = (w: number, d: number, props?: Record<string, any>, isCementBox = false): THREE.Group => {
    const group = new THREE.Group();
    const shelterHeightM = Math.max(2.0, Math.min(6.0, Number(props?.shelterHeightM || props?.heightM || 3.0)));
    const wallH = shelterHeightM * 6.0;
    const doorWall: 'north' | 'south' | 'east' | 'west' = props?.doorWall || 'south';
    const doorOffsetPct = Math.max(20, Math.min(80, props?.doorOffset ?? 35));
    const cableWall: 'north' | 'south' | 'east' | 'west' | 'none' = props?.cableHoleWall ?? 'east';
    const airconWall: 'north' | 'south' | 'east' | 'west' | 'none' = props?.airconWall ?? 'north';
    const wallThick = 0.8;
    const t = wallThick;

    // 1. Concrete Foundation Slab Overhang
    const padW = w + 4;
    const padD = d + 4;
    const padH = 3.5;
    const pad = isCementBox
      ? new THREE.Mesh(new THREE.BoxGeometry(padW, padH, padD), whiteCementMat)
      : buildCementBasepad ? buildCementBasepad(padW, padD, padH, false) : new THREE.Group();
    if (isCementBox) {
      pad.position.y = padH / 2;
      pad.castShadow = true;
      pad.receiveShadow = true;
    }
    group.add(pad);

    // 2. Interior Floor
    const userInteriorItems = (props?.interiorObjects as Array<any>) || [];
    const hasInteriorEquipment = userInteriorItems.length > 0 || Boolean(props?.hasOverlapInterior);
    const explicitRoofMode = props?.roofMode || props?.customProps?.roofMode;
    const isCutaway =
      Boolean(cabinRoofCutawayRef?.current) ||
      explicitRoofMode === 'cutaway' ||
      explicitRoofMode === 'open' ||
      explicitRoofMode === 'transparent' ||
      (hasInteriorEquipment && explicitRoofMode !== 'solid');

    const extWallMat = new THREE.MeshStandardMaterial({
      color: isCementBox ? 0xf8fafc : 0x94a3b8,
      roughness: isCementBox ? 0.85 : 0.5,
      metalness: isCementBox ? 0.05 : 0.35,
      transparent: isCutaway,
      opacity: isCutaway ? 0.68 : 1.0,
      depthWrite: !isCutaway,
    });
    const floorGeo = new THREE.BoxGeometry(w - 2 * t, 0.2, d - 2 * t);
    const floorMesh = new THREE.Mesh(floorGeo, intFloorMat);
    floorMesh.position.set(0, padH + 0.1, 0);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Floor grid seams
    const gridLineMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    for (let gx = -w / 2 + t + 3; gx < w / 2 - t - 1; gx += 3.5) {
      const lineM = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, d - 2 * t), gridLineMat);
      lineM.position.set(gx, padH + 0.11, 0);
      group.add(lineM);
    }
    for (let gz = -d / 2 + t + 3; gz < d / 2 - t - 1; gz += 3.5) {
      const lineM = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * t, 0.22, 0.08), gridLineMat);
      lineM.position.set(0, padH + 0.11, gz);
      group.add(lineM);
    }

    // 3. Hollow Cabin Perimeter Walls with Clear Doorway Cutout Opening & Door Pivot
    buildShelterWallsAndDoor(group, {
      w,
      d,
      padH,
      wallH,
      t,
      doorWall,
      doorOffsetPct,
      extWallMat,
      stainlessMat,
      props,
      doorInteractiveNodesRef,
    });

    // 4. Cabin Interior, Cable Ladder, Ribbed Roof Slab, HVAC, Gland Plate
    buildShelterInteriorAndRoof(group, {
      w,
      d,
      padH,
      wallH,
      t,
      isCementBox,
      cableWall,
      airconWall,
      telecomGreyMat,
      stainlessMat,
      darkSteelMat,
      yellowLadderMat,
      cabinRoofCutawayRef,
      props,
      buildTelecomRack,
      buildRectifierCabinet,
      buildBatteryBank,
      buildACDBPanel,
      buildIndoorAC,
      buildFireExtinguisher,
    });

    return group;
  };

  return { buildShelter3D };
}
