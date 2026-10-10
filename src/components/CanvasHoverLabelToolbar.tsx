/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject, ProjectSettings, Point, BoundingBox, ViewportState } from '../types/cad';
import { HoveredLabelField } from '../utils/cad-geometry';
import { Edit3 } from 'lucide-react';

export interface HoveredLabelToolbarData {
  objId: string;
  field: HoveredLabelField;
  currentText: string;
  bounds: BoundingBox;
  screenPos: Point;
  fontSize: number;
}

interface CanvasHoverLabelToolbarProps {
  hoveredTextLabel: HoveredLabelToolbarData | null;
  viewport?: ViewportState;
  inlineEditorOpen: boolean;
  targetObj?: CADObject;
  settings: ProjectSettings;
  onOpenEditor: (editorData: {
    objId: string;
    field?: HoveredLabelField;
    text: string;
    pos: Point;
    fontSize?: number;
  }) => void;
  onResetPosition: () => void;
}

export const CanvasHoverLabelToolbar: React.FC<CanvasHoverLabelToolbarProps> = ({
  hoveredTextLabel,
  viewport,
  inlineEditorOpen,
  targetObj,
  settings,
  onOpenEditor,
  onResetPosition,
}) => {
  if (!hoveredTextLabel || inlineEditorOpen) return null;

  const liveScreenPos: Point =
    viewport && hoveredTextLabel.bounds
      ? {
          x: hoveredTextLabel.bounds.centerX * viewport.zoom + viewport.panX,
          y: hoveredTextLabel.bounds.minY * viewport.zoom + viewport.panY,
        }
      : hoveredTextLabel.screenPos;

  const hasOffset =
    targetObj &&
    ((targetObj.labelOffsetX !== undefined && targetObj.labelOffsetX !== 0) ||
      (targetObj.labelOffsetY !== undefined && targetObj.labelOffsetY !== 0) ||
      (targetObj.measBadgeOffsetX !== undefined && targetObj.measBadgeOffsetX !== 0) ||
      (targetObj.measBadgeOffsetY !== undefined && targetObj.measBadgeOffsetY !== 0) ||
      (targetObj.elevBadgeOffsetX !== undefined && targetObj.elevBadgeOffsetX !== 0) ||
      (targetObj.elevBadgeOffsetY !== undefined && targetObj.elevBadgeOffsetY !== 0));

  const isSheetMoved =
    (hoveredTextLabel.field === 'sheetNorth' && settings.northArrowPos !== undefined) ||
    (hoveredTextLabel.field === 'sheetLegend' && settings.legendPos !== undefined) ||
    (hoveredTextLabel.field === 'sheetScale' && settings.scaleBarPos !== undefined) ||
    (hoveredTextLabel.field === 'sheetTitle' && settings.titleBlockPos !== undefined);

  const isSheetElem =
    hoveredTextLabel.field === 'sheetNorth' ||
    hoveredTextLabel.field === 'sheetLegend' ||
    hoveredTextLabel.field === 'sheetScale' ||
    hoveredTextLabel.field === 'sheetTitle';

  return (
    <div
      style={{
        left: `${liveScreenPos.x}px`,
        top: `${liveScreenPos.y - 18}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="absolute z-40 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/95 border border-sky-400 text-sky-200 text-xs font-semibold shadow-2xl backdrop-blur-md"
    >
      <span className="flex items-center gap-1 text-[11px] text-sky-400 cursor-grab select-none">
        <span className="text-sm">✥</span> Drag to move
      </span>

      {!isSheetElem && hoveredTextLabel.field !== 'measBadge' && hoveredTextLabel.field !== 'elevBadge' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenEditor({
              objId: hoveredTextLabel.objId,
              field: hoveredTextLabel.field,
              text: hoveredTextLabel.currentText,
              pos: liveScreenPos,
              fontSize: hoveredTextLabel.fontSize,
            });
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-900/60 hover:bg-sky-600 text-white text-[11px] transition-colors cursor-pointer"
          title="Click to edit text"
        >
          <Edit3 className="w-3 h-3 text-sky-300" />
          <span>Edit</span>
        </button>
      )}

      {(hasOffset || isSheetMoved) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResetPosition();
          }}
          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-amber-600 text-amber-200 hover:text-white text-[10px] font-mono transition-colors cursor-pointer"
          title="Reset to default position"
        >
          ↺ Reset
        </button>
      )}
    </div>
  );
};
