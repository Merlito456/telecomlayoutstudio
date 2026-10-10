/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { renderCivilBasepads } from './civil/render-civil-basepads';
import { renderCivilWallsGates } from './civil/render-civil-walls-gates';
import { renderCivilFencesStairs } from './civil/render-civil-fences-stairs';

export function renderCivilStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (renderCivilBasepads(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderCivilWallsGates(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  if (renderCivilFencesStairs(ctx, obj, settings, w, h, stencilId)) {
    return true;
  }
  return false;
}
