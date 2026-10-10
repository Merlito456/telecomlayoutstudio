/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { createShelterInteriorEquipment } from "./shelter-interior-equipment";
import { createShelterStructureBuilder } from "./shelter-structure";

export function createWalkInShelterBuilders(
  mats: CAD3DSharedMaterials,
  doorInteractiveNodesRef?: any,
  buildCementBasepad?: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group,
  cabinRoofCutawayRef?: any
) {
  const interior = createShelterInteriorEquipment(mats);

  const { buildShelter3D } = createShelterStructureBuilder({
    mats,
    doorInteractiveNodesRef,
    buildCementBasepad,
    cabinRoofCutawayRef,
    ...interior,
  });

  return {
    buildShelter3D,
    ...interior,
  };
}
