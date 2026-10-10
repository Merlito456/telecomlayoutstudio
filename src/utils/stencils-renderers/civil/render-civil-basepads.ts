import { CADObject, ProjectSettings } from "../../../types/cad";
import { renderStandardBasepad } from "./render-standard-basepad";
import { renderElevatedBasepad } from "./render-elevated-basepad";

export function renderCivilBasepads(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'cement-basepad':
    case 'gen-basepad':
    case 'tx-basepad':
    case 'ac-basepad':
    case 'cement-slab':
      return renderStandardBasepad(ctx, obj, settings, w, h, stencilId);

    case 'elevated-basepad':
    case 'custom-elevated-basepad':
      return renderElevatedBasepad(ctx, obj, settings, w, h);

    default:
      return false;
  }
}
