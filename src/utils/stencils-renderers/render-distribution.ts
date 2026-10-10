import { CADObject, ProjectSettings } from "../../types/cad";
import { renderATSAndPowerDistribution } from "./distribution/render-ats-mpd";
import { renderECBDistribution } from "./distribution/render-ecb";
import { renderTwoPoleDistribution } from "./distribution/render-twopole";
import { renderACPDBDistribution } from "./distribution/render-acpdb";

export function renderDistributionStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  _settings: ProjectSettings,
  w: number,
  h: number,
  stencilType: string
): boolean {
  if (renderATSAndPowerDistribution(ctx, obj, w, h, stencilType)) return true;
  if (renderECBDistribution(ctx, obj, w, h, stencilType)) return true;
  if (renderTwoPoleDistribution(ctx, obj, w, h, stencilType)) return true;
  if (renderACPDBDistribution(ctx, obj, w, h, stencilType)) return true;
  return false;
}
