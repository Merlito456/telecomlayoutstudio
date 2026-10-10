import { StencilDefinition } from "../../../types/cad";
import { ECB_WALL_STENCIL } from "./ecb-wall";
import { ECB_POLE_STENCIL } from "./ecb-pole";

export { ECB_WALL_STENCIL, ECB_POLE_STENCIL };

export const ECB_STENCILS: StencilDefinition[] = [
  ECB_WALL_STENCIL,
  ECB_POLE_STENCIL,
];
