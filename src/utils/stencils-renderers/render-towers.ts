/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { renderTowerMonopoles } from './towers/render-tower-monopoles';
import { renderTowerLattice } from './towers/render-tower-lattice';
import { renderTowerGuyedRooftop } from './towers/render-tower-guyed-rooftop';

export function renderTowerStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (renderTowerMonopoles(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderTowerLattice(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderTowerGuyedRooftop(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  return false;
}
