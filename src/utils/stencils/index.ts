import { StencilDefinition } from "../../types/cad";
export * from "./common";
export * from "./categories";
export * from "./gates-fences";
export * from "./shelters";
export * from "./cabinets";
export * from "./towers";
export * from "./power-generation";
export * from "./pads";
export * from "./cooling";
export * from "./cables";
export * from "./olt-equipment";
export * from "./racks-equipment";
export * from "./equipments";
export * from "./site-surface";
export * from "./environment";
export * from "./labels";
export * from "./electrical-distribution";
export * from "./rectifier-systems";

import { GATE_STENCILS } from "./gates-fences";
import { SHELTER_STENCILS } from "./shelters";
import { CABINET_STENCILS } from "./cabinets";
import { OLT_STENCILS } from "./olt-equipment";
import { TOWER_STENCILS } from "./towers";
import { POWER_GEN_STENCILS } from "./power-generation";
import { PAD_STENCILS } from "./pads";
import { COOLING_STENCILS } from "./cooling";
import { CABLE_STENCILS } from "./cables";
import { RACK_STENCILS } from "./racks-equipment";
import { ALL_EQUIPMENT_STENCILS } from "./equipments";
import { SURFACE_STENCILS } from "./site-surface";
import { ENVIRONMENT_STENCILS } from "./environment";
import { LABEL_STENCILS } from "./labels";
import { ELECTRICAL_DIST_STENCILS } from "./electrical-distribution";
import { RECTIFIER_SYSTEM_STENCILS } from "./rectifier-systems";

const RAW_STENCILS: StencilDefinition[] = [
  ...GATE_STENCILS,
  ...SHELTER_STENCILS,
  ...CABINET_STENCILS,
  ...OLT_STENCILS,
  ...TOWER_STENCILS,
  ...POWER_GEN_STENCILS,
  ...PAD_STENCILS,
  ...COOLING_STENCILS,
  ...CABLE_STENCILS,
  ...RACK_STENCILS,
  ...RECTIFIER_SYSTEM_STENCILS,
  ...ALL_EQUIPMENT_STENCILS,
  ...SURFACE_STENCILS,
  ...ENVIRONMENT_STENCILS,
  ...LABEL_STENCILS,
  ...ELECTRICAL_DIST_STENCILS,
];

// Deduplicate stencils by id to ensure React key uniqueness and prevent duplicate cards
const seenStencilIds = new Set<string>();
export const STENCILS: StencilDefinition[] = RAW_STENCILS.filter((s) => {
  if (seenStencilIds.has(s.id)) return false;
  seenStencilIds.add(s.id);
  return true;
});
