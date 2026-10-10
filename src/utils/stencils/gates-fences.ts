import { StencilDefinition } from '../../types/cad';
import { GATE_2DOOR_STENCIL } from './fences/gate-2door-stencil';
import { WALL_FENCE_STENCILS } from './fences/wall-fence-stencils';

export const GATE_STENCILS: StencilDefinition[] = [
  GATE_2DOOR_STENCIL,
  ...WALL_FENCE_STENCILS,
];
