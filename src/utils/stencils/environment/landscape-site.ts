import { StencilDefinition } from "../../../types/cad";
import { SITE_STRUCTURE_STENCILS } from "./site-structures";
import { SITE_VEGETATION_STENCILS } from "./site-vegetation";

export const LANDSCAPE_SITE_STENCILS: StencilDefinition[] = [
  SITE_STRUCTURE_STENCILS[0], // small-house
  SITE_VEGETATION_STENCILS[0], // tree-deciduous
  SITE_VEGETATION_STENCILS[1], // flowers-bed
  SITE_STRUCTURE_STENCILS[1], // drainage-canal
  SITE_STRUCTURE_STENCILS[2], // site-person
];
