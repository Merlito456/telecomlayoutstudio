/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  CADLayer,
  CADObject,
  Point,
  ProjectSettings,
  SnapResult,
  StencilDefinition,
  ViewportState,
  BackgroundImageConfig,
} from '../types/cad';
import { EndpointSnapResult } from '../utils/cad-geometry';
import { renderCADCanvas } from '../utils/cad-renderer';

export interface UseCADCanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  viewport: ViewportState;
  settings: ProjectSettings;
  objects: CADObject[];
  selectedIds: string[];
  layers: CADLayer[];
  hoveredTextLabel: any | null;
  bgImage: BackgroundImageConfig | null;
  activeDrawingPreview: CADObject | null;
  snapInfo: SnapResult | null;
  endpointSnapInfo: EndpointSnapResult | null;
  armedStencil: StencilDefinition | null;
  armedRotation: number;
  cursorPos: Point | null;
  isMultiSelecting: boolean;
  selectionBoxPreview: { start: Point; current: Point } | null;
  measureTooltip: { text: string; x: number; y: number } | null;
}

export function useCADCanvasRenderer({
  canvasRef,
  containerRef,
  viewport,
  settings,
  objects,
  selectedIds,
  layers,
  hoveredTextLabel,
  bgImage,
  activeDrawingPreview,
  snapInfo,
  endpointSnapInfo,
  armedStencil,
  armedRotation,
  cursorPos,
  isMultiSelecting,
  selectionBoxPreview,
  measureTooltip,
}: UseCADCanvasRendererProps): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    ctx.save();
    ctx.scale(dpr, dpr);
    renderCADCanvas({
      ctx,
      viewport,
      settings,
      objects,
      selectedIds,
      layers,
      hoveredText: hoveredTextLabel
        ? {
            objId: hoveredTextLabel.objId,
            bounds: hoveredTextLabel.bounds,
            text: hoveredTextLabel.currentText,
          }
        : null,
      bgImage,
      activeDrawing: activeDrawingPreview,
      snapPoint: snapInfo?.snapped ? { x: snapInfo.x, y: snapInfo.y } : null,
      snapType: snapInfo?.snapType,
      endpointSnap: endpointSnapInfo,
      armedStencilPreview:
        armedStencil && cursorPos
          ? {
              name: armedStencil.name,
              width: armedStencil.defaultWidth,
              height: armedStencil.defaultHeight,
              x: cursorPos.x - armedStencil.defaultWidth / 2,
              y: cursorPos.y - armedStencil.defaultHeight / 2,
              rotation: armedRotation,
            }
          : null,
      isMultiSelecting,
      selectionBox: selectionBoxPreview,
      measureTooltip,
      canvasWidth: cw,
      canvasHeight: ch,
    });
    ctx.restore();
  }, [
    canvasRef,
    containerRef,
    viewport,
    settings,
    objects,
    selectedIds,
    layers,
    hoveredTextLabel,
    bgImage,
    activeDrawingPreview,
    snapInfo,
    endpointSnapInfo,
    armedStencil,
    armedRotation,
    cursorPos,
    isMultiSelecting,
    selectionBoxPreview,
    measureTooltip,
  ]);
}
