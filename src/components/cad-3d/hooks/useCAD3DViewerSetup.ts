/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { CAD3DViewerProps, LightingPreset } from '../types';
import { CableHudStatus } from '../engine/roam-render-loop';
import { useCAD3DViewerRefs } from './useCAD3DViewerRefs';
import { useCAD3DDoorInteractions } from './useCAD3DDoorInteractions';
import { useCAD3DCameraPresets } from './useCAD3DCameraPresets';
import { useCAD3DAtmosphereSnapshot } from './useCAD3DAtmosphereSnapshot';
import { useCAD3DCableLaying } from './useCAD3DCableLaying';
import { useCAD3DSceneMount } from './useCAD3DSceneMount';
import { useCAD3DRoamControls } from './useCAD3DRoamControls';
import { useCAD3DDisplaySync } from './useCAD3DDisplaySync';
import { useCAD3DViewerState } from './viewer-setup/useCAD3DViewerState';
import { useCAD3DAudioController } from './viewer-setup/useCAD3DAudioController';

export function useCAD3DViewerSetup(props: CAD3DViewerProps) {
  const {
    objects,
    settings,
    layers,
    initialRoamMode = false,
    onUpdateObjects,
    onToggleSingleDoor,
    areDoorsOpen,
  } = props;

  const refs = useCAD3DViewerRefs(objects, settings, layers, initialRoamMode);
  const onUpdateObjectsRef = useRef(onUpdateObjects);

  useEffect(() => {
    refs.objectsRef.current = objects;
    if (refs.rebuildCablesOnlyRef.current) {
      refs.rebuildCablesOnlyRef.current(objects);
    }
  }, [objects, refs.objectsRef, refs.rebuildCablesOnlyRef]);

  useEffect(() => {
    refs.settingsRef.current = settings;
    refs.layersRef.current = layers;
    onUpdateObjectsRef.current = onUpdateObjects;
  });

  const {
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
  } = useCAD3DViewerState({ refs, initialRoamMode });

  const {
    playLadderRungSound,
    playFootstepSound,
    playQuestCompleteSound,
    playDoorSound,
  } = useCAD3DAudioController(soundEnabled);

  // Door Interactions Hook
  const {
    focusedDoorPrompt,
    setFocusedDoorPrompt,
    doorInteractionHint,
    focusedDoorRef,
    handleInteractWithDoor,
    handleInteractWithDoorRef,
  } = useCAD3DDoorInteractions({
    objects,
    doorInteractiveNodesRef: refs.doorInteractiveNodesRef,
    cameraRef: refs.cameraRef,
    isRoamModeRef: refs.isRoamModeRef,
    playDoorSound,
    onToggleSingleDoor,
    onUpdateObjects,
    areDoorsOpen,
  });

  // Camera Presets Hook
  const {
    cameraPreset,
    setCameraPreset,
    applyCameraPreset,
    handleTeleportToLadder,
    handleRespawnAtGate,
    handleToggleRoamMode,
    handleTiltUp,
    handleTiltDown,
  } = useCAD3DCameraPresets({
    cameraRef: refs.cameraRef,
    controlsRef: refs.controlsRef,
    savedRoamStateRef: refs.savedRoamStateRef,
    roamStateRef: refs.roamStateRef,
    climbablesRef: refs.climbablesRef,
    setIsRoamMode,
    isRoamModeRef: refs.isRoamModeRef,
    playLadderRungSound,
    initialRoamMode,
    doorInteractiveNodesRef: refs.doorInteractiveNodesRef,
    objects,
    coordTransformRef: refs.coordTransformRef,
  });

  const { updateEnvironment, handleToggleSky, handleExportSnapshot } =
    useCAD3DAtmosphereSnapshot({
      skyWeatherRigRef: refs.skyWeatherRigRef,
      showSkyRef: refs.showSkyRef,
      lightingPresetRef: refs.lightingPresetRef,
      setShowSky,
      rendererRef: refs.rendererRef,
      sceneRef: refs.sceneRef,
      cameraRef: refs.cameraRef,
    });

  // Cable Tool State & Handlers
  const [cableHudStatus, setCableHudStatus] = useState<CableHudStatus>({
    snapLabel: 'Aim at cable tray or port',
    lengthStr: '0.00m',
    hoveredCableId: null,
  });

  const {
    CABLE_PRESETS,
    cableToolMode,
    setCableToolMode,
    cableToolModeRef,
    selectedCablePreset,
    setSelectedCablePreset,
    selectedCablePresetRef,
    cableOrthoSnap,
    setCableOrthoSnap,
    cableOrthoSnapRef,
    cableStartPt3D,
    setCableStartPt3D,
    cableStartPt3DRef,
    cableWaypoints3DRef,
    currentTargetPt3DRef,
    projectOntoSegment2D,
    evaluateFluidCableSupportElev3D,
    generateFluid3DCableCurvePts,
    computeSnapped2DTarget,
    finalize3DCableRun,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    handleClearAllCables3D,
    handleAutoRouteLadderToCabinets3D,
  } = useCAD3DCableLaying({
    objects,
    objectsRef: refs.objectsRef,
    onUpdateObjectsRef,
    objectElevYMapRef: refs.objectElevYMapRef,
    coordTransformRef: refs.coordTransformRef,
    rebuildCablesOnlyRef: refs.rebuildCablesOnlyRef,
    playLadderRungSound,
    playQuestCompleteSound,
  });

  const nonWireStructureKey = useMemo(() => {
    return objects
      .filter(
        (o) =>
          o.type !== 'line' &&
          o.type !== 'polyline' &&
          o.type !== 'pen' &&
          !o.isStencilLabel &&
          o.type !== 'text' &&
          o.type !== 'leader'
      )
      .map((o) => `${o.id}_${o.x}_${o.y}_${o.width}_${o.height}_${o.rotation || 0}_${o.stencilId}`)
      .join('|');
  }, [objects]);

  // Main Scene Mount Hook
  useCAD3DSceneMount({
    mountRef: refs.mountRef,
    sceneRef: refs.sceneRef,
    cameraRef: refs.cameraRef,
    rendererRef: refs.rendererRef,
    controlsRef: refs.controlsRef,
    lightsGroupRef: refs.lightsGroupRef,
    dimsGroupRef: refs.dimsGroupRef,
    labelsGroupRef: refs.labelsGroupRef,
    cablesGroupRef: refs.cablesGroupRef,
    cablePreviewGroupRef: refs.cablePreviewGroupRef,
    skyWeatherRigRef: refs.skyWeatherRigRef,
    savedCameraStateRef: refs.savedCameraStateRef,
    savedRoamStateRef: refs.savedRoamStateRef,
    coordTransformRef: refs.coordTransformRef,
    objectsRef: refs.objectsRef,
    settingsRef: refs.settingsRef,
    layersRef: refs.layersRef,
    yardMeshRef: refs.yardMeshRef,
    yardMatRef: refs.yardMatRef,
    landscapeMeshRef: refs.landscapeMeshRef,
    landscapeMatRef: refs.landscapeMatRef,
    surfaceTypeRef: refs.surfaceTypeRef,
    lightingPresetRef: refs.lightingPresetRef,
    showSkyRef: refs.showSkyRef,
    cabinRoofCutawayRef: refs.cabinRoofCutawayRef,
    isRoamModeRef: refs.isRoamModeRef,
    autoRotateRef: refs.autoRotateRef,
    freeMouseLookRef: refs.freeMouseLookRef,
    roamStateRef: refs.roamStateRef,
    keysHeldRef: refs.keysHeldRef,
    excavatedZonesRef: refs.excavatedZonesRef,
    walkablePlatformsRef: refs.walkablePlatformsRef,
    climbablesRef: refs.climbablesRef,
    siteStationsRef: refs.siteStationsRef,
    doorInteractiveNodesRef: refs.doorInteractiveNodesRef,
    objectElevYMapRef: refs.objectElevYMapRef,
    rebuildCablesOnlyRef: refs.rebuildCablesOnlyRef,
    focusedDoorRef,
    setFocusedDoorPrompt,
    setRoamTelemetry,
    setStats,
    setIsSceneReady,
    playLadderRungSound,
    playFootstepSound,
    updateEnvironment,
    nonWireStructureKey,
    cableToolModeRef,
    currentTargetPt3DRef,
    cableWaypoints3DRef,
    selectedCablePresetRef,
    cableOrthoSnapRef,
    setCableHudStatus,
    generateFluid3DCableCurvePts,
    computeSnapped2DTarget,
    projectOntoSegment2D,
    evaluateFluidCableSupportElev3D,
    settings,
  });

  // Keyboard and Roam Controls
  useCAD3DRoamControls({
    mountRef: refs.mountRef,
    isRoamModeRef: refs.isRoamModeRef,
    roamStateRef: refs.roamStateRef,
    keysHeldRef: refs.keysHeldRef,
    setActiveKeysUI,
    freeMouseLookRef: refs.freeMouseLookRef,
    setIsPointerLocked,
    handleInteractWithDoorRef,
    handleToggleRoamMode,
    handleToggleSky,
    handleTeleportToLadder,
    applyCameraPreset,
    updateEnvironment,
    setCabinRoofCutaway,
    cableToolModeRef,
    setCableToolMode,
    cableWaypoints3DRef,
    cableStartPt3DRef,
    currentTargetPt3DRef,
    finalize3DCableRun,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    playLadderRungSound,
    setCameraPreset,
    isFullscreen,
    setIsFullscreen,
    rendererRef: refs.rendererRef,
    controlsRef: refs.controlsRef,
    focusedDoorRef,
  });

  // Display Synchronizations
  useCAD3DDisplaySync({
    sceneRef: refs.sceneRef,
    dimsGroupRef: refs.dimsGroupRef,
    labelsGroupRef: refs.labelsGroupRef,
    yardMeshRef: refs.yardMeshRef,
    yardMatRef: refs.yardMatRef,
    landscapeMeshRef: refs.landscapeMeshRef,
    landscapeMatRef: refs.landscapeMatRef,
    surfaceType,
    showDimensions,
    showObjectLabels,
    wireframe,
    cabinRoofCutaway,
    cabinRoofCutawayRef: refs.cabinRoofCutawayRef,
  });

  const handleLightingChange = (preset: LightingPreset) => {
    setLightingPreset(preset);
    updateEnvironment(preset);
  };

  return {
    refs,
    surfaceType,
    setSurfaceType,
    lightingPreset,
    handleLightingChange,
    showDimensions,
    setShowDimensions,
    showObjectLabels,
    setShowObjectLabels,
    wireframe,
    setWireframe,
    cabinRoofCutaway,
    setCabinRoofCutaway,
    showSky,
    handleToggleSky,
    isFullscreen,
    setIsFullscreen,
    isSceneReady,
    isRoamMode,
    handleToggleRoamMode,
    autoRotate,
    setAutoRotate,
    isPointerLocked,
    soundEnabled,
    setSoundEnabled,
    cameraPreset,
    applyCameraPreset,
    handleTiltUp,
    handleTiltDown,
    handleTeleportToLadder,
    handleRespawnAtGate,
    focusedDoorPrompt,
    doorInteractionHint,
    handleInteractWithDoor,
    handleExportSnapshot,
    roamTelemetry,
    activeKeysUI,
    setActiveKeysUI,
    cableToolMode,
    setCableToolMode,
    CABLE_PRESETS,
    selectedCablePreset,
    setSelectedCablePreset,
    cableOrthoSnap,
    setCableOrthoSnap,
    cableStartPt3D,
    cableStartPt3DRef,
    cableWaypoints3DRef,
    setCableStartPt3D,
    handlePlace3DCablePoint,
    handleAutoRouteLadderToCabinets3D,
    cableHudStatus,
    handleClearAllCables3D,
  };
}
