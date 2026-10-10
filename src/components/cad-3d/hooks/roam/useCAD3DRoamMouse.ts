/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";

export interface RoamMouseOptions {
  mountRef: React.RefObject<HTMLDivElement | null>;
  isRoamModeRef: React.MutableRefObject<boolean>;
  roamStateRef: React.MutableRefObject<any>;
  freeMouseLookRef: React.MutableRefObject<boolean>;
  handleInteractWithDoorRef: React.MutableRefObject<() => void>;
  cableToolModeRef: React.MutableRefObject<"none" | "lay" | "delete">;
  cableWaypoints3DRef: React.MutableRefObject<any[]>;
  currentTargetPt3DRef: React.MutableRefObject<any>;
  handlePlace3DCablePoint: (isEnd?: boolean) => void;
  handleDeleteCableById3D: (id: string) => void;
  playLadderRungSound: (isUp: boolean) => void;
  rendererRef?: React.MutableRefObject<any>;
  controlsRef?: React.MutableRefObject<any>;
  focusedDoorRef?: React.MutableRefObject<any>;
  isFullscreen?: boolean;
}

export function useCAD3DRoamMouse(options: RoamMouseOptions) {
  const {
    mountRef,
    isRoamModeRef,
    roamStateRef,
    freeMouseLookRef,
    handleInteractWithDoorRef,
    cableToolModeRef,
    cableWaypoints3DRef,
    currentTargetPt3DRef,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    playLadderRungSound,
    rendererRef,
    controlsRef: _controlsRef,
    focusedDoorRef,
    isFullscreen,
  } = options;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let downClientX = 0;
    let downClientY = 0;

    const applyLookDelta = (dx: number, dy: number, sensitivity: number) => {
      const rs = roamStateRef.current;
      rs.yaw -= dx * sensitivity;
      rs.pitch = Math.max(-Math.PI * 0.47, Math.min(Math.PI * 0.47, rs.pitch - dy * sensitivity));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rs = roamStateRef.current;
      const targetEl = e.target as HTMLElement | null;
      const isOverHUD = !!targetEl?.closest('[data-roam-hud]');

      const rect = container.getBoundingClientRect();
      rs.mouseNormX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      rs.mouseNormY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      rs.isMouseInCanvas = !isOverHUD;

      if (!isRoamModeRef.current && !isFullscreen) return;

      if (document.pointerLockElement) {
        applyLookDelta(e.movementX || 0, e.movementY || 0, 0.0026);
        return;
      }

      if (isOverHUD) {
        rs.lastMouseX = e.clientX;
        rs.lastMouseY = e.clientY;
        return;
      }

      const dx = rs.lastMouseX !== null ? e.clientX - rs.lastMouseX : (e.movementX || 0);
      const dy = rs.lastMouseY !== null ? e.clientY - rs.lastMouseY : (e.movementY || 0);
      rs.lastMouseX = e.clientX;
      rs.lastMouseY = e.clientY;

      if (rs.isMouseDragging || freeMouseLookRef.current || isFullscreen) {
        applyLookDelta(dx, dy, rs.isMouseDragging ? 0.0032 : 0.0035);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('[data-roam-hud]')) return;

      downClientX = e.clientX;
      downClientY = e.clientY;

      const rs = roamStateRef.current;
      rs.lastMouseX = e.clientX;
      rs.lastMouseY = e.clientY;

      if (e.button === 0) {
        rs.isMouseDragging = true;
        if (isRoamModeRef.current || isFullscreen || cableToolModeRef.current !== 'none') {
          try {
            const targetDom = rendererRef?.current?.domElement || container;
            if (targetDom && !document.pointerLockElement) {
              targetDom.requestPointerLock?.();
            }
          } catch {
            // Fallback
          }
        }
      } else if (e.button === 2) {
        rs.isRightMouseHeld = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const rs = roamStateRef.current;
      const targetEl = e.target as HTMLElement | null;
      const isOverHUD = !!targetEl?.closest('[data-roam-hud]');
      const clickMovedDist = Math.hypot(e.clientX - downClientX, e.clientY - downClientY);
      const isPointerLocked = !!document.pointerLockElement;

      if (e.button === 0) {
        rs.isMouseDragging = false;
        const isClick = isPointerLocked || clickMovedDist < 16;
        if (!isOverHUD && isClick) {
          if (cableToolModeRef.current === 'lay') {
            handlePlace3DCablePoint(false);
          } else if (cableToolModeRef.current === 'delete') {
            const hovId = currentTargetPt3DRef.current?.hoveredCableId;
            if (hovId) {
              handleDeleteCableById3D(hovId);
            }
          } else if (isRoamModeRef.current && focusedDoorRef?.current) {
            handleInteractWithDoorRef.current();
          }
        }
      } else if (e.button === 2) {
        rs.isRightMouseHeld = false;
        const isClick = isPointerLocked || clickMovedDist < 16;
        if (!isOverHUD && isClick && cableToolModeRef.current === 'lay' && cableWaypoints3DRef.current.length >= 1) {
          handlePlace3DCablePoint(true);
        }
      }
    };

    const handleMouseLeave = () => {
      const rs = roamStateRef.current;
      rs.isMouseInCanvas = false;
      rs.isMouseDragging = false;
      rs.isRightMouseHeld = false;
      rs.lastMouseX = null;
      rs.lastMouseY = null;
    };

    const handleWheelRoam = (e: WheelEvent) => {
      if (!isRoamModeRef.current) return;
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('[data-roam-hud]')) return;
      e.preventDefault();

      const rs = roamStateRef.current;
      const dir = e.deltaY < 0 ? 1 : -1;
      if (rs.isClimbing) {
        rs.footY = Math.max(0, Math.min(145, rs.footY + dir * 2.2));
        playLadderRungSound(dir > 0);
      } else {
        const step = dir * 4.0;
        rs.x -= Math.sin(rs.yaw) * step;
        rs.z -= Math.cos(rs.yaw) * step;
        rs.totalWalkDist += Math.abs(step);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isRoamModeRef.current || cableToolModeRef.current !== 'none') {
        e.preventDefault();
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheelRoam, { passive: false });
    container.addEventListener('contextmenu', handleContextMenu);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheelRoam);
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    mountRef,
    isRoamModeRef,
    roamStateRef,
    freeMouseLookRef,
    handleInteractWithDoorRef,
    cableToolModeRef,
    cableWaypoints3DRef,
    currentTargetPt3DRef,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    playLadderRungSound,
    rendererRef,
    focusedDoorRef,
    isFullscreen,
  ]);
}
