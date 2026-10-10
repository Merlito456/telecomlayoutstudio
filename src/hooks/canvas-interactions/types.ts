/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CADDefaultStyle,
  CADLayer,
  CADObject,
  Point,
  ProjectSettings,
  ToolType,
  ViewportState,
  BackgroundImageConfig,
  StencilDefinition,
  ToastMessage,
  SnapResult,
} from '../../types/cad';
import { EndpointSnapResult } from '../../utils/cad-geometry';
import { HoveredLabelField } from '../../utils/cad-geometry/label-types';
import { BoundingBox } from '../../utils/cad-geometry/bounds-handles';

export interface InteractionRefState {
  mode:
    | 'none'
    | 'pan'
    | 'select'
    | 'boxSelect'
    | 'drag-select'
    | 'move'
    | 'move-objects'
    | 'resize'
    | 'resize-handle'
    | 'rotate'
    | 'rotate-handle'
    | 'draw'
    | 'drawing'
    | 'dragLabel'
    | 'move-dimension-label'
    | 'move-meas-badge'
    | 'move-elev-badge'
    | 'move-leader-callout'
    | 'move-leader-tip'
    | 'dragLeaderTip'
    | 'dragLeaderKnee'
    | 'dragSheetElement'
    | 'move-sheet-element'
    | 'move-shelter-door'
    | 'move-shelter-feeder'
    | string;
  startScreen: Point;
  startWorld: Point;
  currentWorld: Point;
  activeHandle?: string;
  initialBounds?: BoundingBox;
  resizeInitialBounds?: BoundingBox;
  resizeRotation?: number;
  initialAngle?: number;
  dragInitialPositions?: Map<string, Point>;
  selectedStartPositions?: Map<string, Point>;
  selectedStartPoints?: Map<string, Point[]>;
  selectedStartDimensions?: Map<
    string,
    { width: number; height: number; x2?: number; y2?: number; dimOffset?: number }
  >;
  initialCenter?: Point;
  polylinePoints?: Point[];
  isSpaceHeld?: boolean;
  isShiftHeld?: boolean;
  isAltCloned?: boolean;
  targetId?: string;
  initialOffset?: Point;
  initialLeaderTip?: Point;
  initialLeaderKnee?: Point;
  sheetTarget?: 'north' | 'legend' | 'scale' | 'title';
  initialSheetPos?: Point;
}

export interface UseCADCanvasInteractionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  settingsRef: React.MutableRefObject<ProjectSettings>;
  bgImageRef: React.MutableRefObject<BackgroundImageConfig | null>;
  viewportRef: React.MutableRefObject<ViewportState>;
  persistSessionImmediately: (
    objs: CADObject[],
    currentSettings?: ProjectSettings,
    currentBg?: BackgroundImageConfig | null,
    currentVp?: ViewportState
  ) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  defaultStyle: CADDefaultStyle;
  setDefaultStyle?: React.Dispatch<React.SetStateAction<CADDefaultStyle>>;
  armedStencil: StencilDefinition | null;
  setArmedStencil: React.Dispatch<React.SetStateAction<StencilDefinition | null>>;
  armedRotation: number;
  setArmedRotation: React.Dispatch<React.SetStateAction<number>>;
  setIsStencilDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  layers: CADLayer[];
  setLayers: React.Dispatch<React.SetStateAction<CADLayer[]>>;
  activeLayerId: string;
  hoveredTextLabel: {
    objId: string;
    field: HoveredLabelField;
    currentText: string;
    bounds: BoundingBox;
    screenPos: Point;
    fontSize?: number;
    fontFamily?: string;
  } | null;
  setInlineEditor: React.Dispatch<
    React.SetStateAction<{
      objId: string;
      field?: HoveredLabelField;
      text: string;
      pos: Point;
      fontSize: number;
      fontFamily?: string;
    } | null>
  >;
  setHoveredTextLabel: React.Dispatch<
    React.SetStateAction<{
      objId: string;
      field: HoveredLabelField;
      currentText: string;
      bounds: BoundingBox;
      screenPos: Point;
      fontSize?: number;
      fontFamily?: string;
    } | null>
  >;
  handleCancelAction: () => void;
  recordHistory: (newObjects: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
  checkAndMergeAdjacentBasepads: (objs: CADObject[], activeId?: string) => CADObject[];
  onOpenRackDesigner?: (rackObj?: CADObject) => void;
}

export interface CanvasInteractionContext extends UseCADCanvasInteractionsProps {
  interactionRef: React.MutableRefObject<InteractionRefState>;
  screenToWorld: (screenX: number, screenY: number) => Point;
  worldToScreen: (worldX: number, worldY: number) => Point;
  finalizePolyline: (overridePts?: Point[], cabinetReachedName?: string) => void;
  cursorPos: Point | null;
  setCursorPos: React.Dispatch<React.SetStateAction<Point | null>>;
  snapInfo: SnapResult | null;
  setSnapInfo: React.Dispatch<React.SetStateAction<SnapResult | null>>;
  endpointSnapInfo: EndpointSnapResult | null;
  setEndpointSnapInfo: React.Dispatch<React.SetStateAction<EndpointSnapResult | null>>;
  measureTooltip: { text: string; x: number; y: number } | null;
  setMeasureTooltip: React.Dispatch<
    React.SetStateAction<{ text: string; x: number; y: number } | null>
  >;
  activeDrawingPreview: CADObject | null;
  setActiveDrawingPreview: React.Dispatch<React.SetStateAction<CADObject | null>>;
  selectionBoxPreview: { start: Point; current: Point } | null;
  setSelectionBoxPreview: React.Dispatch<
    React.SetStateAction<{ start: Point; current: Point } | null>
  >;
}
