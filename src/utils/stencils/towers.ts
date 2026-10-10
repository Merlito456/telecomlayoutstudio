import { StencilDefinition } from "../../types/cad";
import { MONOPOLE_STENCILS } from "./towers/monopoles";
import { LATTICE_TOWER_STENCILS } from "./towers/lattice-towers";
import { ROOFTOP_STENCILS } from "./towers/rooftop-mounts";

export const TOWER_STENCILS: StencilDefinition[] = [
  ...MONOPOLE_STENCILS,
  ...LATTICE_TOWER_STENCILS,
  ...ROOFTOP_STENCILS,
];
