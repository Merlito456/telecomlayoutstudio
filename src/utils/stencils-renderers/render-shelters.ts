/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { renderShelterStructure } from './shelters/render-shelter-structure';
import { renderShelterEquipment } from './shelters/render-shelter-equipment';
import { renderShelterCanopies } from './shelters/render-shelter-canopies';

export function renderShelterStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (renderShelterStructure(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderShelterEquipment(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderShelterCanopies(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  return false;
}
