import { StencilDefinition } from '../../../types/cad';
import { EQUIPMENT_RACK_STENCILS } from './equipment-racks';
import { SERVER_TELECOM_RACK_STENCILS } from './server-telecom-racks';

export * from './equipment-racks';
export * from './server-telecom-racks';

export const ENCLOSED_RACK_STENCILS: StencilDefinition[] = [
  ...EQUIPMENT_RACK_STENCILS,
  ...SERVER_TELECOM_RACK_STENCILS,
];
