/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StencilDefinition } from "../../../types/cad";
import { CABLE_TRAY_STENCIL } from "./cable-tray-stencil";
import { BASEPAD_LADDER_STENCIL } from "./basepad-ladder-stencil";
import { CONNECTING_LADDER_STENCIL } from "./connecting-ladder-stencil";

export const HORIZONTAL_CABLE_LADDERS: StencilDefinition[] = [
  CABLE_TRAY_STENCIL,
  BASEPAD_LADDER_STENCIL,
  CONNECTING_LADDER_STENCIL,
];
