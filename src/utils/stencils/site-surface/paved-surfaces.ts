import { StencilDefinition } from "../../../types/cad";
import { CEMENT_SLAB_STENCIL } from "./cement-slab";
import { ASPHALT_ROAD_STENCIL } from "./asphalt-road";
import { COMPOUND_WALL_STENCIL } from "./compound-wall";
import { CONCRETE_YARD_STENCIL } from "./concrete-yard";

export {
  CEMENT_SLAB_STENCIL,
  ASPHALT_ROAD_STENCIL,
  COMPOUND_WALL_STENCIL,
  CONCRETE_YARD_STENCIL,
};

export const PAVED_SURFACE_STENCILS: StencilDefinition[] = [
  CEMENT_SLAB_STENCIL,
  ASPHALT_ROAD_STENCIL,
  COMPOUND_WALL_STENCIL,
  CONCRETE_YARD_STENCIL,
];
