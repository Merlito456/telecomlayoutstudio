import { StencilDefinition } from '../../../types/cad';
import { ERICSSON_BAY_CABINETS } from './ericsson-bays';
import { ERICSSON_ODC_CABINETS } from './ericsson-odc';

export * from './ericsson-bays';
export * from './ericsson-odc';

export const ERICSSON_CABINETS: StencilDefinition[] = [
  ...ERICSSON_BAY_CABINETS,
  ...ERICSSON_ODC_CABINETS,
];
