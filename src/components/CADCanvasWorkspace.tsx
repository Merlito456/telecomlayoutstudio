/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CADObject,
  Point,
  ProjectSettings,
  StencilDefinition,
  ToastMessage,
  ToolType,
  ViewportState,
} from '../types/cad';
import { CanvasHUD } from './CanvasHUD';
import { CanvasTransformToolbar } from './CanvasTransformToolbar';
import { CanvasHoverLabelToolbar } from './CanvasHoverLabelToolbar';
import { InlineTextEditor } from './InlineTextEditor';

interface CADCanvasWorkspaceProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onCanvasDragOver: (e: React.DragEvent) => void;
  onCanvasDrop: (e: React.DragEvent) => void;
  onCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCancelAction: () => void;
  cursorPos: Point | null;
  snapInfo: any;
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  viewport: ViewportState;
  onFitToScreen: () => void;
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  clipboard: CADObject[];
  storageKB: number;
  armedStencil: StencilDefinition | null;
  armedRotation: number;
  setArmedRotation: React.Dispatch<React.SetStateAction<number>>;
  onCancelArmedStencil: () => void;
  activeTool: ToolType;
  interactionRef: React.MutableRefObject<any>;
  finalizePolyline: () => void;
  onToggleObjectLabels: () => void;
  onToggleDoors: () => void;
  areDoorsOpen: boolean;
  onToggle3D: () => void;
  is3DMode: boolean;
  hoveredTextLabel: any;
  inlineEditor: {
    objId: string;
    field?: any;
    text: string;
    pos: Point;
    fontSize: number;
    fontFamily?: string;
  } | null;
  setInlineEditor: React.Dispatch<
    React.SetStateAction<{
      objId: string;
      field?: any;
      text: string;
      pos: Point;
      fontSize: number;
      fontFamily?: string;
    } | null>
  >;
  onRotateSelected: (deg: number) => void;
  onFlipSelected: (axis: 'h' | 'v') => void;
  onScaleSelected: (factor: number) => void;
  onAutoAddDimensions: () => void;
  onDelete: () => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
  recordHistory: (objs: CADObject[]) => void;
  persistSessionImmediately: (objs: CADObject[], currentSettings?: ProjectSettings) => void;
  settingsRef: React.MutableRefObject<ProjectSettings>;
  onUpdateColor?: (color: string) => void;
  onOpenCableSchedule?: () => void;
  onOpenRackDesigner?: (cabinetObj?: CADObject) => void;
}

export function CADCanvasWorkspace({
  containerRef,
  canvasRef,
  onCanvasDragOver,
  onCanvasDrop,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasDoubleClick,
  onCancelAction,
  cursorPos,
  snapInfo,
  settings,
  setSettings,
  viewport,
  onFitToScreen,
  objects,
  setObjects,
  objectsRef,
  selectedIds,
  setSelectedIds,
  clipboard,
  storageKB,
  armedStencil,
  armedRotation,
  setArmedRotation,
  onCancelArmedStencil,
  activeTool,
  interactionRef,
  finalizePolyline,
  onToggleObjectLabels,
  onToggleDoors,
  areDoorsOpen,
  onToggle3D,
  is3DMode,
  hoveredTextLabel,
  inlineEditor,
  setInlineEditor,
  onRotateSelected,
  onFlipSelected,
  onScaleSelected,
  onAutoAddDimensions,
  onDelete,
  addToast,
  recordHistory,
  persistSessionImmediately,
  settingsRef,
  onUpdateColor,
  onOpenCableSchedule,
  onOpenRackDesigner,
}: CADCanvasWorkspaceProps) {
  return (
    <main
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#070d19] cursor-crosshair"
      onDragOver={onCanvasDragOver}
      onDrop={onCanvasDrop}
      onContextMenu={(e) => {
        e.preventDefault();
        onCancelAction();
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        onDragOver={onCanvasDragOver}
        onDrop={onCanvasDrop}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onDoubleClick={onCanvasDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onCancelAction();
        }}
      />

      {/* Floating Canvas HUD Overlay */}
      <CanvasHUD
        cursorPos={cursorPos}
        snapInfo={snapInfo}
        settings={settings}
        zoom={viewport.zoom}
        onFitToScreen={onFitToScreen}
        totalObjects={objects.length}
        clipboardCount={clipboard.length}
        storageKB={storageKB}
        armedStencilName={armedStencil?.name}
        armedRotation={armedRotation}
        onRotateArmed={() => setArmedRotation((prev) => (prev + 90) % 360)}
        onCancelArmedStencil={onCancelArmedStencil}
        isPolylineActive={activeTool === 'polyline'}
        polylinePointsCount={interactionRef.current.polylinePoints?.length || 0}
        onFinishPolyline={finalizePolyline}
        onToggleMeasurements={() =>
          setSettings((prev) => ({ ...prev, showMeasurements: !prev.showMeasurements }))
        }
        onToggleObjectLabels={onToggleObjectLabels}
        onToggleDoors={onToggleDoors}
        areDoorsOpen={areDoorsOpen}
        onToggleSelectionBoxStyle={() =>
          setSettings((prev) => {
            const cur = prev.selectionBoxStyle || 'none';
            const next = cur === 'none' ? 'corners' : cur === 'corners' ? 'box' : 'none';
            return { ...prev, selectionBoxStyle: next };
          })
        }
        onCancelAction={onCancelAction}
        connectedLineActive={
          activeTool === 'line' &&
          interactionRef.current.mode === 'drawing' &&
          selectedIds.length === 1 &&
          objects.some((o) => o.id === selectedIds[0] && o.type === 'line')
        }
        onDisconnectLine={() => {
          setSelectedIds([]);
          addToast('info', 'Disconnected from previous line. Ready to start new line.');
        }}
        onToggle3D={onToggle3D}
        onToggleRenderStyle={() =>
          setSettings((prev) => ({
            ...prev,
            renderStyle: prev.renderStyle === 'photo' ? 'cad' : 'photo',
          }))
        }
      />

      {/* Floating Hover Text / Note Edit & Move Trigger Overlay */}
      <CanvasHoverLabelToolbar
        hoveredTextLabel={hoveredTextLabel}
        viewport={viewport}
        inlineEditorOpen={!!inlineEditor}
        targetObj={hoveredTextLabel ? objects.find((o) => o.id === hoveredTextLabel.objId) : undefined}
        settings={settings}
        onOpenEditor={(ed) => setInlineEditor({ ...ed, fontSize: ed.fontSize ?? 14 })}
        onResetPosition={() => {
          if (!hoveredTextLabel) return;
          const isSheetElem =
            hoveredTextLabel.field === 'sheetNorth' ||
            hoveredTextLabel.field === 'sheetLegend' ||
            hoveredTextLabel.field === 'sheetScale' ||
            hoveredTextLabel.field === 'sheetTitle';
          if (isSheetElem) {
            setSettings((prev) => {
              const updated = { ...prev };
              if (hoveredTextLabel.field === 'sheetNorth') delete updated.northArrowPos;
              else if (hoveredTextLabel.field === 'sheetLegend') delete updated.legendPos;
              else if (hoveredTextLabel.field === 'sheetScale') delete updated.scaleBarPos;
              else if (hoveredTextLabel.field === 'sheetTitle') delete updated.titleBlockPos;
              settingsRef.current = updated;
              return updated;
            });
            addToast('info', 'Reset sheet element position');
          } else {
            const targetObj = objects.find((o) => o.id === hoveredTextLabel.objId);
            if (targetObj) {
              setObjects((prev) => {
                const next = prev.map((o) => {
                  if (o.id !== targetObj.id) return o;
                  return {
                    ...o,
                    labelOffsetX: 0,
                    labelOffsetY: 0,
                    measBadgeOffsetX: 0,
                    measBadgeOffsetY: 0,
                    elevBadgeOffsetX: 0,
                    elevBadgeOffsetY: 0,
                    customProps: {
                      ...(o.customProps || {}),
                      labelOffsetX: 0,
                      labelOffsetY: 0,
                      measBadgeOffsetX: 0,
                      measBadgeOffsetY: 0,
                      elevBadgeOffsetX: 0,
                      elevBadgeOffsetY: 0,
                    },
                  };
                });
                objectsRef.current = next;
                return next;
              });
              addToast('info', 'Reset label position to default');
            }
          }
        }}
      />

      {/* In-place Text Editor Overlay */}
      {inlineEditor && (
        <InlineTextEditor
          initialText={inlineEditor.text}
          position={inlineEditor.pos}
          fontSize={inlineEditor.fontSize}
          fontFamily={inlineEditor.fontFamily}
          onCommit={(newText, newFont) => {
            if (inlineEditor.objId === 'sheet-title') {
              setSettings((prev) => {
                const updated = { ...prev, fileName: newText, ...(newFont ? { defaultFontFamily: newFont } : {}) };
                settingsRef.current = updated;
                return updated;
              });
              persistSessionImmediately(objectsRef.current, { ...settingsRef.current, fileName: newText });
              setInlineEditor(null);
              addToast('success', `Updated sheet title to: "${newText}"`);
              return;
            }
            if (inlineEditor.field === 'dimText') {
              const updated = objects.map((o) => {
                if (o.id !== inlineEditor.objId) return o;
                const fontUpdate = newFont ? { fontFamily: newFont } : {};
                if (newText.includes('➔')) {
                  const [f, t] = newText.split('➔').map((s) => s.trim());
                  return { ...o, fromLabel: f, toLabel: t, ...fontUpdate };
                }
                return { ...o, fromLabel: newText, ...fontUpdate };
              });
              objectsRef.current = updated;
              setObjects(updated);
              recordHistory(updated);
              setInlineEditor(null);
              addToast('success', `Updated dimension label: "${newText}"`);
              return;
            }
            const targetField = inlineEditor.field || 'text';
            const updated = objects.map((o) =>
              o.id === inlineEditor.objId
                ? { ...o, [targetField]: newText, ...(newFont ? { fontFamily: newFont } : {}) }
                : o
            );
            objectsRef.current = updated;
            setObjects(updated);
            recordHistory(updated);
            setInlineEditor(null);
            addToast('success', `Updated label to: "${newText}"`);
          }}
          onCancel={() => setInlineEditor(null)}
        />
      )}

      {/* Floating On-Canvas Quick Transform Toolbar */}
      {!is3DMode && (
        <CanvasTransformToolbar
          selectedObjects={objects.filter((o) => selectedIds.includes(o.id))}
          viewport={viewport}
          settings={settings}
          onRotateSelected={onRotateSelected}
          onFlipSelected={onFlipSelected}
          onScaleSelected={onScaleSelected}
          onAutoAddDimensions={onAutoAddDimensions}
          onDelete={onDelete}
          onUpdateColor={onUpdateColor}
          onOpenCableSchedule={onOpenCableSchedule}
          onOpenRackDesigner={onOpenRackDesigner}
        />
      )}
    </main>
  );
}
