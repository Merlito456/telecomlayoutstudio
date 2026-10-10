import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { createFence3DBuilder } from "./fence-builder";
import { createWall3DBuilder } from "./wall-builder";
import { createGate3DBuilder } from "./gate-builder";
import { createCementBasepadBuilder } from "./cement-basepad";

export function createCivilPerimeterBuilders(
  mats: CAD3DSharedMaterials,
  asphaltMat?: THREE.Material,
  doorInteractiveNodesRef?: any
) {
  const buildCementBasepad = createCementBasepadBuilder(mats);
  const buildFence3D = createFence3DBuilder(mats);
  const buildWall3D = createWall3DBuilder(mats);
  const buildGate3D = createGate3DBuilder(mats, buildCementBasepad, doorInteractiveNodesRef);

  return {
    buildFence3D,
    buildWall3D,
    buildGate3D,
  };
}
