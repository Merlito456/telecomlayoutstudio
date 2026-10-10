import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, getCADThemeColors } from "./common";
export * from "./common";
import { renderEngineeringTower } from "./blueprint-towers";
import { renderEngineeringShelter } from "./blueprint-shelters";
import { renderEngineeringPower } from "./blueprint-power";
import { renderEngineeringCabinet } from "./blueprint-cabinets";
import { renderEngineeringCable } from "./blueprint-cables";
import { renderEngineeringCivil } from "./blueprint-civil";
import { renderEngineeringLandscape } from "./blueprint-landscape";
import { renderEngineeringElectrical } from "./blueprint-electrical";

export function renderEngineeringCADStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors?: CADThemeColors
): boolean {
  const stencilId = obj.stencilId || obj.customProps?.stencilType;
  if (!stencilId) return false;

  const draftingColor = obj.draftingColor || (obj.stroke && obj.stroke !== 'transparent' ? obj.stroke : undefined);
  const draftingFill = (obj.fillEnabled && obj.fill && obj.fill !== 'transparent') ? obj.fill : undefined;
  const resolvedColors = colors || getCADThemeColors(settings, draftingColor, draftingFill);
  const w = Math.max(obj.width, 10);
  const h = Math.max(obj.height, 10);

  ctx.save();
  const handled =
    renderEngineeringTower(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringShelter(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringPower(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringCabinet(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringCable(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringCivil(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringLandscape(ctx, obj, settings, resolvedColors, w, h, stencilId) ||
    renderEngineeringElectrical(ctx, obj, settings, resolvedColors, w, h, stencilId);

  ctx.restore();
  return handled;
}
