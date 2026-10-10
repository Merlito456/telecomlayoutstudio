import { StencilDefinition } from "../../types/cad";
import { TRAY_STENCILS } from "./cables/trays";
import { LADDER_STENCILS } from "./cables/ladders";
import { CONNECTING_LADDER_STENCILS } from "./cables/connecting";

export * from "./cables/trays";
export * from "./cables/ladders";
export * from "./cables/connecting";

export const CABLE_STENCILS: StencilDefinition[] = [
  ...TRAY_STENCILS,
  ...LADDER_STENCILS,
  ...CONNECTING_LADDER_STENCILS,
];
