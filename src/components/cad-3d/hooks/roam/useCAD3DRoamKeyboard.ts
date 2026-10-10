/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { CameraPreset, LightingPreset } from "../../types";

export interface RoamKeyboardOptions {
  isRoamModeRef: React.MutableRefObject<boolean>;
  roamStateRef: React.MutableRefObject<any>;
  keysHeldRef: React.MutableRefObject<{
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    e: boolean;
    r: boolean;
    shift: boolean;
    space: boolean;
  }>;
  setActiveKeysUI: React.Dispatch<
    React.SetStateAction<{
      w: boolean;
      a: boolean;
      s: boolean;
      d: boolean;
      e: boolean;
      r: boolean;
      shift: boolean;
    }>
  >;
  setIsPointerLocked: React.Dispatch<React.SetStateAction<boolean>>;
  handleInteractWithDoorRef: React.MutableRefObject<() => void>;
  handleToggleRoamMode: (enable?: boolean) => void;
  handleRespawnAtGate?: () => void;
  handleToggleSky: () => void;
  handleTeleportToLadder: (category?: "cable-ladder" | "tower-ladder") => void;
  setCabinRoofCutaway: React.Dispatch<React.SetStateAction<boolean>>;
  cableToolModeRef: React.MutableRefObject<"none" | "lay" | "delete">;
  setCableToolMode?: (mode: "none" | "lay" | "delete" | ((prev: "none" | "lay" | "delete") => "none" | "lay" | "delete")) => void;
  cableWaypoints3DRef: React.MutableRefObject<any[]>;
  cableStartPt3DRef: React.MutableRefObject<any>;
  currentTargetPt3DRef: React.MutableRefObject<any>;
  handlePlace3DCablePoint: (isEnd?: boolean) => void;
  handleDeleteCableById3D: (id: string) => void;
  setFreeMouseLook?: React.Dispatch<React.SetStateAction<boolean>>;
  setCableStartPt3D?: (pt: any) => void;
  isFullscreen?: boolean;
  setIsFullscreen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCAD3DRoamKeyboard(options: RoamKeyboardOptions) {
  const {
    isRoamModeRef,
    roamStateRef,
    keysHeldRef,
    setActiveKeysUI,
    setIsPointerLocked,
    handleInteractWithDoorRef,
    handleToggleRoamMode,
    handleRespawnAtGate,
    handleToggleSky,
    handleTeleportToLadder,
    setCabinRoofCutaway,
    cableToolModeRef,
    setCableToolMode,
    cableWaypoints3DRef,
    cableStartPt3DRef,
    currentTargetPt3DRef,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    setFreeMouseLook,
    setCableStartPt3D,
    isFullscreen,
    setIsFullscreen,
  } = options;

  useEffect(() => {
    const syncKeysUI = () => {
      const k = keysHeldRef.current;
      setActiveKeysUI({
        w: k.w,
        a: k.a,
        s: k.s,
        d: k.d,
        e: k.e,
        r: k.r,
        shift: k.shift,
      });
    };

    const handleKeyDown = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = ev.key.toLowerCase();

      // Toggle Doors & Gates
      if (key === 'z' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        ev.stopPropagation();
        handleInteractWithDoorRef.current();
        return;
      }

      // Toggle Lay Cable Mode with C (Cable) or V / B
      if ((key === 'c' || key === 'v' || key === 'b') && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        if (setCableToolMode) {
          setCableToolMode((prev) => (prev === 'lay' ? 'none' : 'lay'));
        }
        return;
      }

      // Toggle Cabin Roof Cutaway / Interior Inspection with T (Top/Roof) or U (Cutaway)
      if ((key === 't' || key === 'u') && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        setCabinRoofCutaway((prev) => !prev);
        return;
      }

      // Toggle Roam Mode with G
      if (key === 'g' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        handleToggleRoamMode();
        return;
      }

      // Toggle Realistic Sky & Clouds with K
      if (key === 'k' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        handleToggleSky();
        return;
      }

      // Teleport to nearest Cable Ladder with L
      if (key === 'l' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        handleTeleportToLadder('cable-ladder');
        return;
      }

      // Respawn at Gate with P
      if (key === 'p' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        handleRespawnAtGate?.();
        return;
      }

      // Toggle Fullscreen [Key F]
      if (key === 'f' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        if (setIsFullscreen) {
          setIsFullscreen((prev) => !prev);
        }
        return;
      }

      // Finish 3D multi-segment cable run with Enter when in Cable Laying Mode
      if (key === 'enter' && cableToolModeRef.current === 'lay' && cableWaypoints3DRef.current.length >= 1) {
        ev.preventDefault();
        handlePlace3DCablePoint(true);
        return;
      }

      // Space key: Place cable point if in cable lay mode
      if (key === ' ' && cableToolModeRef.current === 'lay') {
        ev.preventDefault();
        handlePlace3DCablePoint(false);
        return;
      }

      // Delete Hovered 3D Cable or toggle Delete Cable Mode with X / Delete / Backspace
      if ((key === 'x' || key === 'delete' || key === 'backspace') && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        const hovId = currentTargetPt3DRef.current?.hoveredCableId;
        if (hovId) {
          handleDeleteCableById3D(hovId);
        } else if (setCableToolMode) {
          setCableToolMode((prev) => (prev === 'delete' ? 'none' : 'delete'));
        }
        return;
      }

      // Cancel active cable start point, exit pointer lock, exit cable tool mode, or exit fullscreen with Escape
      if (key === 'escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock();
          return;
        }
        if (cableStartPt3DRef.current || cableWaypoints3DRef.current.length > 0) {
          ev.preventDefault();
          cableStartPt3DRef.current = null;
          cableWaypoints3DRef.current = [];
          setCableStartPt3D?.(null);
          return;
        }
        if (cableToolModeRef.current !== 'none') {
          ev.preventDefault();
          setCableToolMode?.('none');
          return;
        }
        if (isFullscreen) {
          ev.preventDefault();
          setIsFullscreen?.(false);
          return;
        }
      }

      // Toggle Free Mouse Look with M when in Roam Mode
      if (key === 'm' && isRoamModeRef.current && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        setFreeMouseLook?.((prev) => !prev);
        return;
      }

      // Auto-activate Roam Mode if user presses W, A, S, D, E, or R while in 3D viewer!
      if (
        !isRoamModeRef.current &&
        (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'e' || key === 'r') &&
        !ev.ctrlKey &&
        !ev.metaKey
      ) {
        handleToggleRoamMode(true);
      }

      if (!isRoamModeRef.current) return;

      let handled = false;
      if (key === 'w' || key === 'arrowup') {
        keysHeldRef.current.w = true;
        handled = true;
      } else if (key === 's' || key === 'arrowdown') {
        keysHeldRef.current.s = true;
        handled = true;
      } else if (key === 'a' || key === 'arrowleft') {
        keysHeldRef.current.a = true;
        handled = true;
      } else if (key === 'd' || key === 'arrowright') {
        keysHeldRef.current.d = true;
        handled = true;
      } else if (key === 'e') {
        keysHeldRef.current.e = true;
        handled = true;
      } else if (key === 'r') {
        keysHeldRef.current.r = true;
        handled = true;
      } else if (key === 'shift') {
        keysHeldRef.current.shift = true;
        handled = true;
      } else if (key === ' ') {
        keysHeldRef.current.space = true;
        handled = true;
      }

      if (handled) {
        ev.preventDefault();
        ev.stopPropagation();
        syncKeysUI();
      }
    };

    const handleKeyUp = (ev: KeyboardEvent) => {
      const key = ev.key.toLowerCase();
      let changed = false;
      if (key === 'w' || key === 'arrowup') {
        keysHeldRef.current.w = false;
        changed = true;
      } else if (key === 's' || key === 'arrowdown') {
        keysHeldRef.current.s = false;
        changed = true;
      } else if (key === 'a' || key === 'arrowleft') {
        keysHeldRef.current.a = false;
        changed = true;
      } else if (key === 'd' || key === 'arrowright') {
        keysHeldRef.current.d = false;
        changed = true;
      } else if (key === 'e') {
        keysHeldRef.current.e = false;
        changed = true;
      } else if (key === 'r') {
        keysHeldRef.current.r = false;
        changed = true;
      } else if (key === 'shift') {
        keysHeldRef.current.shift = false;
        changed = true;
      } else if (key === ' ') {
        keysHeldRef.current.space = false;
        changed = true;
      }
      if (changed) {
        syncKeysUI();
      }
    };

    const handlePointerLockChange = () => {
      const locked = !!document.pointerLockElement;
      setIsPointerLocked(locked);
    };

    const handleWindowBlur = () => {
      keysHeldRef.current = {
        w: false,
        a: false,
        s: false,
        d: false,
        e: false,
        r: false,
        shift: false,
        space: false,
      };
      roamStateRef.current.isMouseDragging = false;
      roamStateRef.current.isRightMouseHeld = false;
      syncKeysUI();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [
    handleToggleRoamMode,
    handleToggleSky,
    handleTeleportToLadder,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    isRoamModeRef,
    roamStateRef,
    keysHeldRef,
    setActiveKeysUI,
    setIsPointerLocked,
    handleInteractWithDoorRef,
    setCabinRoofCutaway,
    cableToolModeRef,
    setCableToolMode,
    cableWaypoints3DRef,
    cableStartPt3DRef,
    currentTargetPt3DRef,
    setFreeMouseLook,
    setCableStartPt3D,
    isFullscreen,
    setIsFullscreen,
  ]);
}
