import { StencilDefinition } from "../../../types/cad";
import { ENCLOSED_RACK_STENCILS } from "./enclosed-racks";
import { OPEN_RACK_STENCILS } from "./open-racks";

export const TELECOM_RACK_STENCILS: StencilDefinition[] = [
  ...ENCLOSED_RACK_STENCILS,
  ...OPEN_RACK_STENCILS,
];
