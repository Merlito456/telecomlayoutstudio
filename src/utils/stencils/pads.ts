import { StencilDefinition } from '../../types/cad';
import { STANDARD_PADS } from './pads/standard-pads';
import { ELEVATED_PADS } from './pads/elevated-pads';
import { UTILITY_PADS } from './pads/utility-pads';

export const PAD_STENCILS: StencilDefinition[] = [
  ...STANDARD_PADS,
  ...ELEVATED_PADS,
  ...UTILITY_PADS,
];
