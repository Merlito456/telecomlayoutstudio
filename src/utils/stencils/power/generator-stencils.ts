import { StencilDefinition } from "../../../types/cad";
import { GEN_PAD_STENCILS } from "./generator-pad-stencil";
import { FUEL_TANK_STENCILS } from "./fuel-tank-stencil";

export * from "./generator-pad-stencil";
export * from "./fuel-tank-stencil";

export const GENERATOR_STENCILS: StencilDefinition[] = [
  ...GEN_PAD_STENCILS,
  ...FUEL_TANK_STENCILS,
];
