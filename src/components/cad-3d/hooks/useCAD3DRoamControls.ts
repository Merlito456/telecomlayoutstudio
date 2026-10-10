/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CameraPreset, LightingPreset } from "../types";
import { useCAD3DRoamKeyboard } from "./roam/useCAD3DRoamKeyboard";
import { useCAD3DRoamMouse } from "./roam/useCAD3DRoamMouse";

export interface UseCAD3DRoamControlsProps {
  mountRef: React.RefObject<HTMLDivElement | null>;
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
  freeMouseLookRef: React.MutableRefObject<boolean>;
  setIsPointerLocked: React.Dispatch<React.SetStateAction<boolean>>;
  handleInteractWithDoorRef: React.MutableRefObject<() => void>;
  handleToggleRoamMode: (enable?: boolean) => void;
  handleRespawnAtGate?: () => void;
  handleToggleSky: () => void;
  handleTeleportToLadder: (category?: "cable-ladder" | "tower-ladder") => void;
  applyCameraPreset: (preset: CameraPreset) => void;
  updateEnvironment: (preset: LightingPreset) => void;
  setCabinRoofCutaway: React.Dispatch<React.SetStateAction<boolean>>;
  cableToolModeRef: React.MutableRefObject<"none" | "lay" | "delete">;
  setCableToolMode?: (mode: "none" | "lay" | "delete" | ((prev: "none" | "lay" | "delete") => "none" | "lay" | "delete")) => void;
  cableWaypoints3DRef: React.MutableRefObject<any[]>;
  cableStartPt3DRef: React.MutableRefObject<any>;
  setCableStartPt3D?: (pt: any) => void;
  currentTargetPt3DRef: React.MutableRefObject<any>;
  finalize3DCableRun: (pts2D?: any, hitCabInfo?: any) => void;
  handlePlace3DCablePoint: (isEnd?: boolean) => void;
  handleDeleteCableById3D: (id: string) => void;
  playLadderRungSound: (isUp: boolean) => void;
  setCameraPreset: React.Dispatch<React.SetStateAction<CameraPreset>>;
  setFreeMouseLook?: React.Dispatch<React.SetStateAction<boolean>>;
  rendererRef?: React.MutableRefObject<any>;
  controlsRef?: React.MutableRefObject<any>;
  focusedDoorRef?: React.MutableRefObject<any>;
  isFullscreen?: boolean;
  setIsFullscreen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCAD3DRoamControls(props: UseCAD3DRoamControlsProps) {
  useCAD3DRoamKeyboard({
    isRoamModeRef: props.isRoamModeRef,
    roamStateRef: props.roamStateRef,
    keysHeldRef: props.keysHeldRef,
    setActiveKeysUI: props.setActiveKeysUI,
    setIsPointerLocked: props.setIsPointerLocked,
    handleInteractWithDoorRef: props.handleInteractWithDoorRef,
    handleToggleRoamMode: props.handleToggleRoamMode,
    handleRespawnAtGate: props.handleRespawnAtGate,
    handleToggleSky: props.handleToggleSky,
    handleTeleportToLadder: props.handleTeleportToLadder,
    setCabinRoofCutaway: props.setCabinRoofCutaway,
    cableToolModeRef: props.cableToolModeRef,
    setCableToolMode: props.setCableToolMode,
    cableWaypoints3DRef: props.cableWaypoints3DRef,
    cableStartPt3DRef: props.cableStartPt3DRef,
    currentTargetPt3DRef: props.currentTargetPt3DRef,
    handlePlace3DCablePoint: props.handlePlace3DCablePoint,
    handleDeleteCableById3D: props.handleDeleteCableById3D,
    setFreeMouseLook: props.setFreeMouseLook,
    setCableStartPt3D: props.setCableStartPt3D,
    isFullscreen: props.isFullscreen,
    setIsFullscreen: props.setIsFullscreen,
  });

  useCAD3DRoamMouse({
    mountRef: props.mountRef,
    isRoamModeRef: props.isRoamModeRef,
    roamStateRef: props.roamStateRef,
    freeMouseLookRef: props.freeMouseLookRef,
    handleInteractWithDoorRef: props.handleInteractWithDoorRef,
    cableToolModeRef: props.cableToolModeRef,
    cableWaypoints3DRef: props.cableWaypoints3DRef,
    currentTargetPt3DRef: props.currentTargetPt3DRef,
    handlePlace3DCablePoint: props.handlePlace3DCablePoint,
    handleDeleteCableById3D: props.handleDeleteCableById3D,
    playLadderRungSound: props.playLadderRungSound,
    rendererRef: props.rendererRef,
    controlsRef: props.controlsRef,
    focusedDoorRef: props.focusedDoorRef,
    isFullscreen: props.isFullscreen,
  });
}
