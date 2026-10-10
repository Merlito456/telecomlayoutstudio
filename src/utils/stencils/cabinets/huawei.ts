import { StencilDefinition } from '../../../types/cad';
import { HUAWEI_BAY_CABINETS } from './huawei-bays';
import { HUAWEI_ODC_CABINETS } from './huawei-odc';
import { HUAWEI_ATN_CABINETS } from './huawei-atn';

export * from './huawei-bays';
export * from './huawei-odc';
export * from './huawei-atn';

export const HUAWEI_CABINETS: StencilDefinition[] = [
  ...HUAWEI_BAY_CABINETS,
  ...HUAWEI_ODC_CABINETS,
];

