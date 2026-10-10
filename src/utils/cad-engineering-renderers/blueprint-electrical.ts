import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors } from "./common";
import { renderBlueprintATS } from "./blueprint-ats";
import { renderBlueprintECBAndStructure } from "./blueprint-ecb-structure";
import { renderBlueprintACPDB } from "./blueprint-acpdb";

export function renderEngineeringElectrical(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'ats':
    case 'ats-cabinet':
    case 'ats-panel':
    case 'ats-wall':
      return renderBlueprintATS(ctx, obj, settings, colors, w, h);

    case 'mpd':
    case 'dcpdu':
    case 'ecb':
    case 'ecb-wall':
    case 'ecb-pole':
    case 'power-twopole-structure':
      return renderBlueprintECBAndStructure(ctx, obj, settings, colors, w, h, stencilId);

    case 'acpdb-wall':
    case 'acpdb':
    case 'acpdb-dual':
    case 'acpdb-pole':
      return renderBlueprintACPDB(ctx, obj, settings, colors, w, h, stencilId);

    default:
      return false;
  }
}
