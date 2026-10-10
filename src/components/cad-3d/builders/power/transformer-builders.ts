import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { createTransformerUnitBuilder } from "./transformer-unit";
import { createTwoPoleStructureBuilder } from "./two-pole-structure";

export function createTransformerBuilders(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const buildTransformer3D = createTransformerUnitBuilder(mats, buildCementBasepad);
  const buildTwoPoleStructure3D = createTwoPoleStructureBuilder(mats);

  return {
    buildTransformer3D,
    buildTwoPoleStructure3D,
  };
}
