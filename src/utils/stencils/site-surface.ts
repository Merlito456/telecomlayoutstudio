import { StencilDefinition } from "../../types/cad";
import { SURFACE_GROUND_STENCILS } from "./site-surface/surfaces";
import { TERRAIN_LEVELS_STENCILS } from "./site-surface/terrain-levels";

export const SURFACE_STENCILS: StencilDefinition[] = [
  ...SURFACE_GROUND_STENCILS,
  ...TERRAIN_LEVELS_STENCILS,
];

export const SITE_SURFACE_STENCILS = SURFACE_STENCILS;
