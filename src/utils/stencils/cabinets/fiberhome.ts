import { StencilDefinition } from '../../../types/cad';
import { FIBERHOME_BAY_CABINETS } from './fiberhome-bays';
import { FIBERHOME_ODC_CABINETS } from './fiberhome-odc';
import { FIBERHOME_OLT_STENCILS } from './fiberhome-olt';

export * from './fiberhome-bays';
export * from './fiberhome-odc';
export * from './fiberhome-olt';

export const FIBERHOME_CABINETS: StencilDefinition[] = [
  ...FIBERHOME_BAY_CABINETS,
  ...FIBERHOME_ODC_CABINETS,
];
