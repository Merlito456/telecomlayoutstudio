import { StencilDefinition } from "../../types/cad";
import { NOKIA_OLT_STENCILS } from "./cabinets/nokia";
import { FIBERHOME_OLT_STENCILS } from "./cabinets/fiberhome-olt";

export * from "./cabinets/nokia";
export * from "./cabinets/fiberhome-olt";

export const OLT_STENCILS: StencilDefinition[] = [
  ...FIBERHOME_OLT_STENCILS,
  ...NOKIA_OLT_STENCILS,
];
