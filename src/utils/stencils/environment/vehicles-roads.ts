import { StencilDefinition } from '../../../types/cad';
import { ROAD_SIDEWALK_STENCILS } from './roads-sidewalks';
import { VEHICLE_STENCILS } from './vehicles';

export * from './roads-sidewalks';
export * from './vehicles';

export const VEHICLE_ROAD_STENCILS: StencilDefinition[] = [
  ...ROAD_SIDEWALK_STENCILS,
  ...VEHICLE_STENCILS,
];
