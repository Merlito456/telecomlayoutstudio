import { StencilDefinition } from "../../../types/cad";
import { ACPDB_WALL_STENCIL } from "./acpdb-wall";
import { ACPDB_POLE_STENCIL } from "./acpdb-pole";
import { ACPDB_DUAL_STENCIL } from "./acpdb-dual";

export * from "./acpdb-wall";
export * from "./acpdb-pole";
export * from "./acpdb-dual";

export const ACPDB_PANEL_STENCILS: StencilDefinition[] = [
  ACPDB_WALL_STENCIL,
  ACPDB_POLE_STENCIL,
  ACPDB_DUAL_STENCIL,
];
