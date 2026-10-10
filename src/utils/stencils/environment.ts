import { StencilDefinition } from "../../types/cad";
import { VEHICLE_ROAD_STENCILS } from "./environment/vehicles-roads";
import { LANDSCAPE_SITE_STENCILS } from "./environment/landscape-site";

export const ENVIRONMENT_STENCILS: StencilDefinition[] = [
  ...VEHICLE_ROAD_STENCILS,
  ...LANDSCAPE_SITE_STENCILS,
];
