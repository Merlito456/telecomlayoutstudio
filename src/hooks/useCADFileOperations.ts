/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect } from 'react';
import {
  BackgroundImageConfig,
  CADLayer,
  CADObject,
  Point,
  ProjectSettings,
  ToastMessage,
  ViewportState,
} from '../types/cad';
import { downloadDXFFile, isDXFContent, parseDXF } from '../utils/cad-export';
import { getObjectLayerId } from '../utils/cad-layers';
import { STENCILS } from '../utils/stencils';
import { HistoryManager } from '../utils/history';

export interface UseCADFileOperationsProps {
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  layers: CADLayer[];
  setLayers: React.Dispatch<React.SetStateAction<CADLayer[]>>;
  setBgImage: React.Dispatch<React.SetStateAction<BackgroundImageConfig | null>>;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  historyRef: React.MutableRefObject<HistoryManager>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  screenToWorld: (screenX: number, screenY: number) => Point;
  checkAndMergeAdjacentBasepads: (objs: CADObject[], activeId?: string) => CADObject[];
  recordHistory: (newObjects: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

export function useCADFileOperations({
  settings,
  setSettings,
  objects,
  setObjects,
  objectsRef,
  layers,
  setLayers,
  setBgImage,
  setViewport,
  setSelectedIds,
  historyRef,
  canvasRef,
  screenToWorld,
  checkAndMergeAdjacentBasepads,
  recordHistory,
  addToast,
}: UseCADFileOperationsProps) {
  // Background Image Upload Handler
  const handleLoadBackgroundImage = useCallback(
    (file: File) => {
      if (file.size > 30 * 1024 * 1024) {
        addToast('error', 'Image exceeds 30 MB cap');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          // Auto scale to fit nicely into the canvas
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const maxDim = 1200;
          if (w > maxDim || h > maxDim) {
            const scale = Math.min(maxDim / w, maxDim / h);
            w *= scale;
            h *= scale;
          }
          setBgImage({
            dataUrl,
            x: (settings.canvasWidth - w) / 2,
            y: (settings.canvasHeight - h) / 2,
            width: w,
            height: h,
            opacity: 0.6,
            locked: false,
          });
          addToast('success', 'Background floorplan loaded at 60% opacity');
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [settings.canvasWidth, settings.canvasHeight, setBgImage, addToast]
  );

  const handleTriggerPasteImage = useCallback(() => {
    navigator.clipboard
      .read()
      .then(async (items) => {
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            handleLoadBackgroundImage(blob as File);
            return;
          }
        }
        addToast('warning', 'No image found on clipboard. Copy an image first, then paste.');
      })
      .catch(() => {
        addToast('info', 'Press Ctrl+V on canvas to paste an image screenshot.');
      });
  }, [handleLoadBackgroundImage, addToast]);

  // Window Paste Listener
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          handleLoadBackgroundImage(file);
          return;
        }
      }
    };
    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [handleLoadBackgroundImage]);

  // DXF Export Handler
  const handleExportDXF = useCallback(() => {
    try {
      downloadDXFFile(settings, objects, layers);
      addToast(
        'success',
        `AutoCAD drawing exported (${objects.length} elements, ${layers.length} layers, scale 1m = ${settings.scaleFactor}px)`
      );
    } catch (err) {
      console.error('Failed to export AutoCAD DXF:', err);
      addToast('error', 'Failed to generate AutoCAD DXF file');
    }
  }, [settings, objects, layers, addToast]);

  // Load DXF or JSON Project
  const handleLoadCADFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          addToast('error', 'The selected file is empty');
          return;
        }

        // 1. Detect AutoCAD DXF file format
        if (isDXFContent(content, file.name)) {
          try {
            const result = parseDXF(content, settings.scaleFactor, settings.canvasWidth, settings.canvasHeight);
            if (result.objects.length > 0) {
              setObjects(result.objects);
              historyRef.current.clear(result.objects);
              setSelectedIds([]);
              setViewport({ panX: 0, panY: 0, zoom: 1 });

              // Sync scaleFactor and canvas dimensions to preserve accurate real-world measurements
              if (result.scaleFactor && result.scaleFactor !== settings.scaleFactor) {
                setSettings((prev) => ({
                  ...prev,
                  scaleFactor: result.scaleFactor!,
                  canvasWidth: result.canvasWidth || prev.canvasWidth,
                  canvasHeight: result.canvasHeight || prev.canvasHeight,
                }));
              }

              // Register any new CAD layers discovered in the DXF file
              if (result.layersFound && result.layersFound.length > 0) {
                setLayers((prevLayers) => {
                  const existingIds = new Set(prevLayers.map((l) => l.id));
                  const newLayers: CADLayer[] = [];
                  const palette = ['#38bdf8', '#818cf8', '#f59e0b', '#10b981', '#ec4899', '#f43f5e', '#a855f7', '#06b6d4'];
                  result.layersFound.forEach((lName, idx) => {
                    const lId = lName.startsWith('layer-') ? lName : 'layer-' + lName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
                    if (!existingIds.has(lId)) {
                      existingIds.add(lId);
                      newLayers.push({
                        id: lId,
                        name: lName.replace(/^layer-/, '').replace(/_/g, ' ').toUpperCase(),
                        visible: true,
                        locked: false,
                        opacity: 1,
                        color: palette[idx % palette.length],
                      });
                    }
                  });
                  return newLayers.length > 0 ? [...prevLayers, ...newLayers] : prevLayers;
                });
              }

              const unitMsg = result.unit ? ` (Units: ${result.unit}, Scale: ${result.scaleFactor || settings.scaleFactor} px/m)` : '';
              const losslessMsg = result.isLosslessStudioProject ? ' (Lossless Studio Project)' : '';
              addToast(
                'success',
                `AutoCAD DXF loaded${losslessMsg}: ${result.objects.length} elements (${result.stats.lines} lines, ${result.stats.polylines} polylines, ${result.stats.circles} circles, ${result.stats.texts} text, ${result.stats.dimensions || 0} dims${result.stats.inserts ? `, ${result.stats.inserts} blocks` : ''}) across ${result.layersFound.length} layers${unitMsg}`
              );
            } else {
              addToast('warning', 'AutoCAD DXF file was read, but no supported 2D geometric entities were found');
            }
          } catch (dxfErr) {
            console.error('DXF import error:', dxfErr);
            addToast('error', 'Failed to parse AutoCAD DXF file. Ensure it is ASCII DXF format.');
          }
          return;
        }

        // 2. Otherwise parse JSON layout project
        try {
          const data = JSON.parse(content);
          if (data && Array.isArray(data.objects)) {
            setObjects(data.objects);
            if (data.settings) setSettings(data.settings);
            if (data.bgImage) setBgImage(data.bgImage);
            if (data.viewport) setViewport(data.viewport);
            historyRef.current.clear(data.objects);
            setSelectedIds([]);
            addToast('success', 'Layout project loaded successfully');
          } else {
            addToast('error', 'Invalid project file format');
          }
        } catch {
          addToast('error', 'Unrecognized CAD file format (please provide .dxf or .json)');
        }
      };
      reader.readAsText(file);
    },
    [settings, setObjects, historyRef, setSelectedIds, setViewport, setSettings, setLayers, setBgImage, addToast]
  );

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleLoadBackgroundImage(file);
        return;
      }
      if (
        file.name.toLowerCase().endsWith('.dxf') ||
        file.name.toLowerCase().endsWith('.json') ||
        file.name.toLowerCase().endsWith('.cad.json')
      ) {
        handleLoadCADFile(file);
        return;
      }
    }

    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      const textId = e.dataTransfer.getData('text/plain');
      let stencilId = '';
      if (jsonStr) {
        try {
          const parsed = JSON.parse(jsonStr);
          stencilId = parsed.stencilId;
        } catch {
          // ignore
        }
      }
      if (!stencilId && textId) {
        stencilId = textId;
      }
      if (stencilId) {
        const stencil = STENCILS.find((s) => s.id === stencilId);
        if (stencil && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          const worldPt = screenToWorld(screenPt.x, screenPt.y);
          const targetX = worldPt.x - stencil.defaultWidth / 2;
          const targetY = worldPt.y - stencil.defaultHeight / 2;
          const placedObjects = stencil.createObjects({ x: targetX, y: targetY }, settings.scaleFactor);

          if (placedObjects.length > 0) {
            const targetLayerId = getObjectLayerId(placedObjects[0]);
            setLayers((prev) =>
              prev.map((l) => (l.id === targetLayerId && !l.visible ? { ...l, visible: true } : l))
            );
          }

          const newObjs = [...objects, ...placedObjects];
          const maybeMerged = checkAndMergeAdjacentBasepads(newObjs, placedObjects[0]?.id);
          objectsRef.current = maybeMerged;
          setObjects(maybeMerged);
          recordHistory(maybeMerged);
          if (maybeMerged === newObjs && placedObjects.length > 0) {
            setSelectedIds([placedObjects[0].id]);
          }
          addToast('success', `Deployed ${stencil.name}`);
          return;
        }
      }
    } catch (err) {
      console.error('Error handling canvas drop:', err);
    }
  };

  return {
    handleLoadBackgroundImage,
    handleTriggerPasteImage,
    handleExportDXF,
    handleLoadCADFile,
    handleCanvasDragOver,
    handleCanvasDrop,
  };
}
