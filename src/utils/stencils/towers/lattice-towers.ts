import { StencilDefinition } from "../../../types/cad";
import { TRIANGULAR_3LEG_STENCILS } from "./triangular-3leg";
import { SQUARE_4LEG_STENCILS } from "./square-4leg";
import { GUYED_TOWER_STENCILS } from "./guyed-tower";

export * from "./triangular-3leg";
export * from "./square-4leg";
export * from "./guyed-tower";

export const LATTICE_TOWER_STENCILS: StencilDefinition[] = [
  ...TRIANGULAR_3LEG_STENCILS,
  ...SQUARE_4LEG_STENCILS,
  ...GUYED_TOWER_STENCILS,
];
