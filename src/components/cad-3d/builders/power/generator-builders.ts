import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { createGeneratorUnitBuilder } from "./generator-unit";
import { createFuelTankBuilder } from "./fuel-tank";

export function createGeneratorBuilders(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const buildGenerator3D = createGeneratorUnitBuilder(mats, buildCementBasepad);
  const buildFuelTank3D = createFuelTankBuilder(mats, buildCementBasepad);

  return {
    buildGenerator3D,
    buildFuelTank3D,
  };
}
