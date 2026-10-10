/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  BackgroundImageConfig,
  CADLayer,
  CADObject,
  Point,
  ProjectSettings,
  StencilDefinition,
  ViewportState,
} from '../types/cad';
import { renderCADCanvas } from '../utils/cad-renderer';

interface UseCADCanvasRenderLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  viewport: ViewportState;
  settings: ProjectSettings;
  objects: CADObject[];
  selectedIds: string[];
  layers: CADLayer[];
  hoveredTextLabel: any | null;
  bgImage: BackgroundImageConfig | null;
  activeDrawingPreview: any;
  snapInfo: any;
  endpointSnapInfo: any;
  armedStencil: StencilDefinition | null;
  armedRotation: number;
  cursorPos: Point | null;
  interactionRef: React.MutableRefObject<any>;
  selectionBoxPreview: any;
  measureTooltip: any;
}

export function useCADCanvasRenderLoop({
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
  interactionRef,
  selectionBoxPreview,
  measureTooltip,
}: UseCADCanvasRenderLoopProps) {
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
      isMultiSelecting: interactionRef.current?.mode === 'drag-select',
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
    interactionRef,
    selectionBoxPreview,
    measureTooltip,
  ]);
}
