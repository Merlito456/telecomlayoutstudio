import { StencilDefinition } from "../../types/cad";
import { GENERATOR_STENCILS } from "./power/generator-stencils";
import { TRANSFORMER_BATTERY_STENCILS } from "./power/transformer-battery-stencils";

export const POWER_GEN_STENCILS: StencilDefinition[] = [
  ...GENERATOR_STENCILS,
  ...TRANSFORMER_BATTERY_STENCILS,
];
