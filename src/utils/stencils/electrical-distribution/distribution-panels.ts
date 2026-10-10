import { StencilDefinition } from "../../../types/cad";
import { MPD_STENCIL } from "./panel-mpd";
import { DCPDU_STENCIL } from "./panel-dcpdu";
import { ATS_STENCIL } from "./panel-ats";

export * from "./panel-mpd";
export * from "./panel-dcpdu";
export * from "./panel-ats";

export const DISTRIBUTION_PANEL_STENCILS: StencilDefinition[] = [
  MPD_STENCIL,
  DCPDU_STENCIL,
  ATS_STENCIL,
];
