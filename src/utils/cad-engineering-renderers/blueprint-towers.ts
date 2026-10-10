import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors } from "./common";
import { render4LegTower, render3LegTower } from "./towers/lattice-renderers";
import { renderMonopole } from "./towers/monopole-renderers";
import { renderGuyedTower, renderRooftopMount, renderRooftopParapetMount } from "./towers/guyed-rooftop-renderers";

export * from "./towers/lattice-renderers";
export * from "./towers/monopole-renderers";
export * from "./towers/guyed-rooftop-renderers";

export function renderEngineeringTower(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case '4leg-tower':
    case 'tower-4leg':
      return render4LegTower(ctx, obj, settings, colors, w, h);

    case '3leg-tower':
    case 'tower-3leg':
      return render3LegTower(ctx, obj, settings, colors, w, h);

    case 'monopole':
    case 'monopole-tower':
      return renderMonopole(ctx, obj, settings, colors, w, h, false);

    case 'monopole-platform':
      return renderMonopole(ctx, obj, settings, colors, w, h, true);

    case 'guyed-tower':
      return renderGuyedTower(ctx, obj, settings, colors, w, h);

    case 'rooftop-mount':
      return renderRooftopMount(ctx, obj, settings, colors, w, h);

    case 'rooftop-parapet-mount':
      return renderRooftopParapetMount(ctx, obj, settings, colors, w, h);

    default:
      return false;
  }
}
