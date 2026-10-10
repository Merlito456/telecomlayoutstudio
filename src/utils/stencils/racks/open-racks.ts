import { StencilDefinition } from '../../../types/cad';
import { RELAY_WALL_RACK_STENCILS } from './relay-wall-racks';
import { OPEN_FRAME_HFRAME_STENCILS } from './open-frame-hframe';

export * from './relay-wall-racks';
export * from './open-frame-hframe';

export const OPEN_RACK_STENCILS: StencilDefinition[] = [
  ...RELAY_WALL_RACK_STENCILS,
  ...OPEN_FRAME_HFRAME_STENCILS,
];
