import { StencilDefinition } from "../../../types/cad";
import { CANOPY_SHADE_STENCILS } from "./canopy-shades";
import { DISTRIBUTION_PANEL_STENCILS } from "./distribution-panels";
import { ECB_STENCILS } from "./breakers-ecb";
import { UTILITY_STRUCTURE_STENCILS } from "./utility-structures";
import { ACPDB_PANEL_STENCILS } from "./acpdb-panels";

export * from "./canopy-shades";
export * from "./distribution-panels";
export * from "./breakers-ecb";
export * from "./utility-structures";
export * from "./acpdb-panels";

export const ELECTRICAL_DIST_STENCILS: StencilDefinition[] = [
  ...CANOPY_SHADE_STENCILS,
  ...DISTRIBUTION_PANEL_STENCILS,
  ...ECB_STENCILS,
  ...UTILITY_STRUCTURE_STENCILS,
  ...ACPDB_PANEL_STENCILS,
];
