import { Point } from '../../types/cad';
import { BoundingBox } from './bounds-handles';

export type HoveredLabelField =
  | 'text'
  | 'fromLabel'
  | 'toLabel'
  | 'dimText'
  | 'leaderCallout'
  | 'leaderTip'
  | 'measBadge'
  | 'elevBadge'
  | 'sheetNorth'
  | 'sheetLegend'
  | 'sheetScale'
  | 'sheetTitle';

export interface HoveredTextLabelResult {
  objId: string;
  field: HoveredLabelField;
  currentText: string;
  centerWorld: Point;
  bounds: BoundingBox;
}
