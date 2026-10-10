import { StencilDefinition } from "../../../types/cad";
import { NATURAL_SURFACE_STENCILS } from "./natural-surfaces";
import { PAVED_SURFACE_STENCILS } from "./paved-surfaces";

export * from "./natural-surfaces";
export * from "./paved-surfaces";

export const SURFACE_GROUND_STENCILS: StencilDefinition[] = [
  ...NATURAL_SURFACE_STENCILS,
  ...PAVED_SURFACE_STENCILS,
];
