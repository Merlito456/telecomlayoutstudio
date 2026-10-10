import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { createCementBasepadBuilder } from "./cement-basepad";
import { createElevatedBasepadBuilder } from "./elevated-basepad";
import { createGroundStairsBuilder } from "./ground-stairs";
import { createUnevenLevelBuilder } from "./uneven-level";

export function createCivilFoundationBuilders(
  mats: CAD3DSharedMaterials,
  asphaltMat?: THREE.Material,
  surfaceMat?: THREE.Material
) {
  const buildCementBasepad = createCementBasepadBuilder(mats);
  const buildElevatedBasepad3D = createElevatedBasepadBuilder(mats);
  const buildGroundStairs3D = createGroundStairsBuilder(mats);
  const buildUnevenLevel3D = createUnevenLevelBuilder(mats);

  return {
    buildCementBasepad,
    buildElevatedBasepad3D,
    buildGroundStairs3D,
    buildUnevenLevel3D,
  };
}
