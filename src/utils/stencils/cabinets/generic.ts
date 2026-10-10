import { StencilDefinition } from "../../../types/cad";
import { GENERIC_ODC_STENCIL } from "./generic-odc";
import { GENERIC_BAY_STENCILS } from "./generic-bays";

export const GENERIC_CABINETS: StencilDefinition[] = [
  GENERIC_ODC_STENCIL,
  ...GENERIC_BAY_STENCILS,
];
