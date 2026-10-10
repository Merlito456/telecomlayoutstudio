/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LightingPreset, SiteSurfaceType } from '../../types';
import { RoamTelemetry } from '../../engine/roam-render-loop';
import { CAD3DViewerRefsResult } from '../useCAD3DViewerRefs';

export interface UseCAD3DViewerStateProps {
  refs: CAD3DViewerRefsResult;
  initialRoamMode: boolean;
}

export function useCAD3DViewerState({ refs, initialRoamMode }: UseCAD3DViewerStateProps) {
  const [surfaceType, setSurfaceType] = useState<SiteSurfaceType>('gravel');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('daylight');
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showObjectLabels, setShowObjectLabels] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [cabinRoofCutaway, setCabinRoofCutaway] = useState<boolean>(true);
  const [showSky, setShowSky] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
  const [, setStats] = useState<{ objectsCount: number; scaleStr: string }>({
    objectsCount: 0,
    scaleStr: '',
  });

  // Roam Mode State
  const [isRoamMode, setIsRoamMode] = useState<boolean>(initialRoamMode);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [freeMouseLook] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [activeKeysUI, setActiveKeysUI] = useState<{
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    e: boolean;
    r: boolean;
    shift: boolean;
  }>({
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
    r: false,
    shift: false,
  });

  const [roamTelemetry, setRoamTelemetry] = useState<RoamTelemetry>({
    elevM: 0,
    eyeElevM: 1.6,
    headingDeg: 0,
    compassDir: 'N',
    isClimbing: false,
    climbState: 'idle',
    activeLadderName: '',
    nearLadderName: '',
    nearEquipmentName: '',
    rungNumber: 0,
    maxRungs: 1,
    climbPct: 0,
    surfaceName: 'Compound Grade',
    speedMps: 0,
    laddersCount: 0,
  });

  useEffect(() => {
    refs.isRoamModeRef.current = isRoamMode;
  }, [isRoamMode, refs.isRoamModeRef]);
  useEffect(() => {
    refs.autoRotateRef.current = autoRotate;
  }, [autoRotate, refs.autoRotateRef]);
  useEffect(() => {
    refs.freeMouseLookRef.current = freeMouseLook;
  }, [freeMouseLook, refs.freeMouseLookRef]);
  useEffect(() => {
    refs.soundEnabledRef.current = soundEnabled;
  }, [soundEnabled, refs.soundEnabledRef]);
  useEffect(() => {
    refs.showSkyRef.current = showSky;
  }, [showSky, refs.showSkyRef]);
  useEffect(() => {
    refs.lightingPresetRef.current = lightingPreset;
  }, [lightingPreset, refs.lightingPresetRef]);
  useEffect(() => {
    refs.surfaceTypeRef.current = surfaceType;
  }, [surfaceType, refs.surfaceTypeRef]);

  return {
    surfaceType,
    setSurfaceType,
    lightingPreset,
    setLightingPreset,
    showDimensions,
    setShowDimensions,
    showObjectLabels,
    setShowObjectLabels,
    wireframe,
    setWireframe,
    cabinRoofCutaway,
    setCabinRoofCutaway,
    showSky,
    setShowSky,
    isFullscreen,
    setIsFullscreen,
    isSceneReady,
    setIsSceneReady,
    setStats,
    isRoamMode,
    setIsRoamMode,
    autoRotate,
    setAutoRotate,
    isPointerLocked,
    setIsPointerLocked,
    freeMouseLook,
    soundEnabled,
    setSoundEnabled,
    activeKeysUI,
    setActiveKeysUI,
    roamTelemetry,
    setRoamTelemetry,
  };
}
