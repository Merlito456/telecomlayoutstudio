import { StencilDefinition } from "../../../types/cad";
import { HUAWEI_CABINETS } from "./huawei";
import { FUSHAN_CABINETS } from "./fushan";
import { ERICSSON_CABINETS } from "./ericsson";
import { FIBERHOME_CABINETS } from "./fiberhome";
import { ELTEK_CABINETS } from "./eltek";
import { NOKIA_CABINETS } from "./nokia";
import { GENERIC_CABINETS } from "./generic";

export * from "./huawei";
export * from "./fushan";
export * from "./ericsson";
export * from "./fiberhome";
export * from "./eltek";
export * from "./nokia";
export * from "./generic";

export const CABINET_STENCILS: StencilDefinition[] = [
  ...HUAWEI_CABINETS,
  ...FUSHAN_CABINETS,
  ...ERICSSON_CABINETS,
  ...FIBERHOME_CABINETS,
  ...ELTEK_CABINETS,
  ...GENERIC_CABINETS,
];

