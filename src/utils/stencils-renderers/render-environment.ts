/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { renderEnvironmentSurfaces } from './environment/render-env-surfaces';
import { renderEnvironmentVehiclesBuildings } from './environment/render-env-vehicles-buildings';
import { renderEnvironmentLandscapeDetails } from './environment/render-env-landscape-details';

export function renderEnvironmentStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (renderEnvironmentSurfaces(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderEnvironmentVehiclesBuildings(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderEnvironmentLandscapeDetails(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  return false;
}
