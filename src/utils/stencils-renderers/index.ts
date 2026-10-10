import { CADObject, ProjectSettings } from "../../types/cad";
export * from "./common";
import { renderPowerStencil } from "./render-generators-power";
import { renderDistributionStencil } from "./render-distribution";
import { renderShelterStencil } from "./render-shelters";
import { renderCabinetStencil } from "./render-cabinets";
import { renderTowerStencil } from "./render-towers";
import { renderCableStencil } from "./render-cables";
import { renderCivilStencil } from "./render-civil";
import { renderEnvironmentStencil } from "./render-environment";

export function renderPhotorealisticStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings
): boolean {
  const stencilId = obj.stencilId || obj.customProps?.stencilType;
  if (!stencilId) return false;

  const w = Math.max(obj.width, 10);
  const h = Math.max(obj.height, 10);

  ctx.save();
  const handled =
    renderPowerStencil(ctx, obj, settings, w, h, stencilId) ||
    renderDistributionStencil(ctx, obj, settings, w, h, stencilId) ||
    renderShelterStencil(ctx, obj, settings, w, h, stencilId) ||
    renderCabinetStencil(ctx, obj, settings, w, h, stencilId) ||
    renderTowerStencil(ctx, obj, settings, w, h, stencilId) ||
    renderCableStencil(ctx, obj, settings, w, h, stencilId) ||
    renderCivilStencil(ctx, obj, settings, w, h, stencilId) ||
    renderEnvironmentStencil(ctx, obj, settings, w, h, stencilId);

  ctx.restore();
  return handled;
}
