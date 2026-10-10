import { StencilDefinition } from "../../types/cad";
import { TELECOM_RACK_STENCILS } from "./racks/telecom-racks";

// Genuine Equipment Racks & Frames only (All Equipments relocated to Equipments category)
export const RACK_STENCILS: StencilDefinition[] = [
  ...TELECOM_RACK_STENCILS,
];

