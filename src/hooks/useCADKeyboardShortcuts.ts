/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import {
  BackgroundImageConfig,
  CADObject,
  Point,
  ProjectSettings,
  ToastMessage,
  ToolType,
  ViewportState,
} from '../types/cad';
import { STENCILS } from '../utils/stencils';

export interface CADKeyboardShortcutsParams {
  is3DMode: boolean;
  interactionRef: React.MutableRefObject<{
    mode: string;
    isSpaceHeld?: boolean;
    isShiftHeld?: boolean;
    polylinePoints?: Point[];
    [key: string]: any;
  }>;
  handleUndo: () => void;
  handleRedo: () => void;
  handleCopy: () => void;
  handleCut: () => void;
  handlePaste: () => void;
  handleDuplicate: () => void;
  handleSelectAll: () => void;
  handleDelete: () => void;
  handleRotateSelected: (delta: number) => void;
  handleScaleSelected: (factor: number) => void;
  handleNudgeSelected: (dx: number, dy: number) => void;
  handleFitToScreen: () => void;
  handleCancelAction: () => void;
  finalizePolyline: () => void;
  handleInteractWithDoor2D: () => void;
  setIsDiagnosticsModalOpen: (open: boolean) => void;
  setIs3DMode: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTool: (tool: ToolType) => void;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  setDimensionsArmed: React.Dispatch<React.SetStateAction<boolean>>;
  addToast: (msg: string, type?: ToastMessage['type']) => void;
  objects: CADObject[];
  selectedIds: string[];
  settings: ProjectSettings;
  viewport: ViewportState;
  bgImage?: BackgroundImageConfig | null;
}

export function useCADKeyboardShortcuts({
  is3DMode,
  interactionRef,
  handleUndo,
  handleRedo,
  handleCopy,
  handleCut,
  handlePaste,
  handleDuplicate,
  handleSelectAll,
  handleDelete,
  handleRotateSelected,
  handleScaleSelected,
  handleNudgeSelected,
  handleFitToScreen,
  handleCancelAction,
  finalizePolyline,
  handleInteractWithDoor2D,
  setIsDiagnosticsModalOpen,
  setIs3DMode,
  setActiveTool,
  setSettings,
  setDimensionsArmed,
  addToast,
  objects,
  selectedIds,
  settings,
  viewport,
  bgImage,
}: CADKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // If 3D viewport modal is open, 3D viewer handles its own keyboard shortcuts
      if (is3DMode) {
        return;
      }

      if (e.key === ' ') {
        interactionRef.current.isSpaceHeld = true;
      }
      if (e.key === 'Shift') {
        interactionRef.current.isShiftHeld = true;
      }

      // Hotkeys with modifiers
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
          return;
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
          return;
        }
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          handleCopy();
          return;
        }
        if (e.key === 'x' || e.key === 'X') {
          e.preventDefault();
          handleCut();
          return;
        }
        if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          handlePaste();
          return;
        }
        if (e.key === 'd' || e.key === 'D') {
          if (e.shiftKey) {
            e.preventDefault();
            setIsDiagnosticsModalOpen(true);
            return;
          }
          e.preventDefault();
          handleDuplicate();
          return;
        }
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          handleSelectAll();
          return;
        }
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          handleFitToScreen();
          return;
        }
        return;
      }

      // Toggle doors / gates with 'Z' key
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleInteractWithDoor2D();
        return;
      }

      // Single key tool hotkeys
      const k = e.key.toLowerCase();
      switch (k) {
        case 's':
          setActiveTool('select');
          break;
        case 'p':
          setActiveTool('pan');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'r':
          if (e.shiftKey) {
            handleRotateSelected(-45);
          } else {
            handleRotateSelected(45);
          }
          break;
        case '[':
          handleRotateSelected(-15);
          break;
        case ']':
          handleRotateSelected(15);
          break;
        case '=':
        case '+':
          handleScaleSelected(1.1);
          break;
        case '-':
        case '_':
          handleScaleSelected(0.9);
          break;
        case 'c':
          setActiveTool('circle');
          break;
        case 'o':
          setSettings((prev) => {
            const next = !prev.orthoMode;
            addToast(next ? 'Ortho Mode: ON' : 'Ortho Mode: OFF', 'info');
            return { ...prev, orthoMode: next };
          });
          break;
        case 'g':
          setIs3DMode((prev) => !prev);
          break;
        case 'm':
          setDimensionsArmed((prev) => {
            const next = !prev;
            addToast(next ? 'Auto-Dimensions: ON' : 'Auto-Dimensions: OFF', 'info');
            return next;
          });
          break;
        case 'arrowup':
        case 'arrowdown':
        case 'arrowleft':
        case 'arrowright':
          if (selectedIds.length > 0) {
            e.preventDefault();
            const step = e.shiftKey ? 20 : 5;
            let dx = 0;
            let dy = 0;
            if (k === 'arrowup') dy = -step;
            else if (k === 'arrowdown') dy = step;
            else if (k === 'arrowleft') dx = -step;
            else if (k === 'arrowright') dx = step;
            handleNudgeSelected(dx, dy);
          }
          break;
        case 'escape':
          if (is3DMode) {
            setIs3DMode(false);
            break;
          }
          handleCancelAction();
          break;
        case 'delete':
        case 'backspace':
          handleDelete();
          break;
        case 'enter':
          if (interactionRef.current.mode === 'drawing' && interactionRef.current.polylinePoints) {
            finalizePolyline();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        interactionRef.current.isSpaceHeld = false;
      }
      if (e.key === 'Shift') {
        interactionRef.current.isShiftHeld = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleUndo,
    handleRedo,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
    handleSelectAll,
    handleDelete,
    handleRotateSelected,
    handleScaleSelected,
    handleNudgeSelected,
    selectedIds,
    handleFitToScreen,
    handleCancelAction,
    settings,
    objects,
    bgImage,
    viewport,
    addToast,
    is3DMode,
    handleInteractWithDoor2D,
    finalizePolyline,
    interactionRef,
    setActiveTool,
    setSettings,
    setDimensionsArmed,
    setIsDiagnosticsModalOpen,
    setIs3DMode,
  ]);
}
