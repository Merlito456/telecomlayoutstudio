/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";
import { CAD3DSharedMaterials } from "../materials";
import { createClimbingLadderBuilder } from "./tower/climbing-ladder";
import { createLattice4LegBuilder } from "./tower/lattice-4leg";
import { createMonopoleBuilder } from "./tower/monopole";
import { createLattice3LegBuilder } from "./tower/lattice-3leg";
import { createGuyedAndRooftopBuilders } from "./tower/guyed-and-rooftop";

export function createTowerBuilders(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { buildCenterClimbingLadder3D } = createClimbingLadderBuilder(mats);
  const { buildTower4Leg3D } = createLattice4LegBuilder(mats, buildCementBasepad, buildCenterClimbingLadder3D);
  const { buildMonopole3D } = createMonopoleBuilder(mats, buildCementBasepad);
  const { buildTower3Leg3D } = createLattice3LegBuilder(mats, buildCementBasepad, buildCenterClimbingLadder3D);
  const { buildGuyedTower3D, buildRooftopMount3D } = createGuyedAndRooftopBuilders(mats, buildCementBasepad);

  return {
    buildCenterClimbingLadder3D,
    buildTower4Leg3D,
    buildMonopole3D,
    buildTower3Leg3D,
    buildGuyedTower3D,
    buildRooftopMount3D,
  };
}
