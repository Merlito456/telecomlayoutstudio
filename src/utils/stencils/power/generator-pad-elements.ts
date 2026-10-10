import { CADObject } from '../../../types/cad';
import { buildGeneratorPadBase } from './generator-pad-base';
import { buildGeneratorPadDetails } from './generator-pad-details';

export function buildGeneratorPadElements(
  w: number,
  h: number,
  padMargin: number,
  encW: number,
  encH: number
): CADObject[] {
  return [
    ...buildGeneratorPadBase(w, h, padMargin, encW, encH),
    ...buildGeneratorPadDetails(w, h, padMargin, encW, encH),
  ];
}
