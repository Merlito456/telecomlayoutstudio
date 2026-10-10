import { CADObject, ProjectSettings } from '../../types/cad';
import { renderGeneratorUnit } from './power/render-generator-unit';
import { renderFuelTank } from './power/render-fuel-tank';
import { renderTransformer } from './power/render-transformer';
import { renderBatteryBank } from './power/render-battery-bank';

export function renderPowerStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'generator-pad':
    case 'generator':
      return renderGeneratorUnit(ctx, obj, settings, w, h);
    case 'fuel-tank':
      return renderFuelTank(ctx, obj, settings, w, h);
    case 'transformer':
      return renderTransformer(ctx, obj, settings, w, h);
    case 'battery-bank':
      return renderBatteryBank(ctx, obj, settings, w, h);
    default:
      return false;
  }
}
