import * as THREE from "three";
import { CAD3DSharedMaterials } from "../materials";
import { createGeneratorBuilders } from "./power/generator-builders";
import { createTransformerBuilders } from "./power/transformer-builders";
import { createDistributionBuilders } from "./power/distribution-builders";

export function createPowerBuilders(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const gen = createGeneratorBuilders(mats, buildCementBasepad);
  const trans = createTransformerBuilders(mats, buildCementBasepad);
  const dist = createDistributionBuilders(mats, buildCementBasepad);

  return {
    ...gen,
    ...trans,
    ...dist,
  };
}
