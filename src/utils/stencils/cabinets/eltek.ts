import { StencilDefinition } from '../../../types/cad';
import { ELTEK_BAY_CABINETS } from './eltek-bays';
import { ELTEK_ODC_CABINETS } from './eltek-odc';

export * from './eltek-bays';
export * from './eltek-odc';

export const ELTEK_CABINETS: StencilDefinition[] = [
  ...ELTEK_BAY_CABINETS,
  ...ELTEK_ODC_CABINETS,
];
