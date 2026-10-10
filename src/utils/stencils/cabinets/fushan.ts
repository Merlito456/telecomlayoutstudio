import { StencilDefinition } from '../../../types/cad';
import { FUSHAN_BAY_CABINETS } from './fushan-bays';
import { FUSHAN_ODC_CABINETS } from './fushan-odc';

export * from './fushan-bays';
export * from './fushan-odc';

export const FUSHAN_CABINETS: StencilDefinition[] = [
  ...FUSHAN_BAY_CABINETS,
  ...FUSHAN_ODC_CABINETS,
];
