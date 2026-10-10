/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CADObject } from '../../../types/cad';
import {
  getLadderCenterline2D as getLadderCenterlineEngine2D,
  computeSmartCableRoute2D as computeSmartCableRouteEngine2D,
} from '../../../utils/cad-geometry';
import {
  evaluateFluidCableSupportElev3D as evaluateFluidCableSupportElev3DUtil,
  generateFluid3DCableCurvePts as generateFluid3DCableCurvePtsUtil,
} from '../cable-3d-utils';
import { CoordTransform } from '../scene/types';
import { CABLE_PRESETS, CablePreset, detectPresetForTarget } from '../cable-presets';
import { autoRouteLaddersToCabinets } from '../cable-auto-route';
import { computeSnappedTargetPoint } from '../cable-target-snap';
import { calculateCableLength } from '../../../utils/cad-geometry/cable-length-calculator';
import { createCableCADObject } from './cable-laying/cable-object-factory';
import { filterOutCableById, filterOutAllCables } from './cable-laying/cable-operations';
import { resolveNextCablePoint } from './cable-laying/cable-point-resolver';

export { type CablePreset, CABLE_PRESETS } from '../cable-presets';

export interface UseCAD3DCableLayingProps {
  objects: CADObject[];
  objectsRef: React.MutableRefObject<CADObject[]>;
  onUpdateObjectsRef: React.MutableRefObject<((nextObjects: CADObject[], toastMsg?: string) => void) | undefined>;
  objectElevYMapRef: React.MutableRefObject<Map<string, number>>;
  coordTransformRef?: React.MutableRefObject<CoordTransform>;
  rebuildCablesOnlyRef: React.MutableRefObject<((objs: CADObject[]) => void) | null>;
  playLadderRungSound: (isUp: boolean) => void;
  playQuestCompleteSound: () => void;
}

export function useCAD3DCableLaying({
  objects: _objects,
  objectsRef,
  onUpdateObjectsRef,
  objectElevYMapRef,
  coordTransformRef,
  rebuildCablesOnlyRef,
  playLadderRungSound,
  playQuestCompleteSound,
}: UseCAD3DCableLayingProps) {
  const [cableToolMode, setCableToolMode] = useState<'none' | 'lay' | 'delete'>('none');
  const cableToolModeRef = useRef<'none' | 'lay' | 'delete'>('none');
  const [selectedCablePreset, setSelectedCablePreset] = useState(CABLE_PRESETS[0]);
  const selectedCablePresetRef = useRef(CABLE_PRESETS[0]);
  const [cableOrthoSnap, setCableOrthoSnap] = useState<boolean>(false);
  const cableOrthoSnapRef = useRef<boolean>(false);
  const [cableStartPt3D, setCableStartPt3D] = useState<{
    x3D: number;
    y3D: number;
    z3D: number;
    x2D: number;
    y2D: number;
    snapLabel: string;
  } | null>(null);
  const cableStartPt3DRef = useRef<{
    x3D: number;
    y3D: number;
    z3D: number;
    x2D: number;
    y2D: number;
    snapLabel: string;
  } | null>(null);
  const cableWaypoints3DRef = useRef<
    Array<{
      x3D: number;
      y3D: number;
      z3D: number;
      x2D: number;
      y2D: number;
      snapLabel: string;
    }>
  >([]);
  const currentTargetPt3DRef = useRef<{
    x3D: number;
    y3D: number;
    z3D: number;
    x2D: number;
    y2D: number;
    snapLabel: string;
    hoveredCableId: string | null;
  } | null>(null);
  const [cableHudStatus, setCableHudStatus] = useState<{
    snapLabel: string;
    lengthStr: string;
    hoveredCableId: string | null;
  }>({
    snapLabel: 'Aim at Ladder / Cabinet / Ground',
    lengthStr: '0.00m',
    hoveredCableId: null,
  });

  useEffect(() => {
    cableToolModeRef.current = cableToolMode;
    if (cableToolMode !== 'lay') {
      setCableStartPt3D(null);
      cableStartPt3DRef.current = null;
      cableWaypoints3DRef.current = [];
    }
  }, [cableToolMode]);

  useEffect(() => {
    selectedCablePresetRef.current = selectedCablePreset;
  }, [selectedCablePreset]);

  useEffect(() => {
    cableOrthoSnapRef.current = cableOrthoSnap;
  }, [cableOrthoSnap]);

  const getLadderCenterline2D = useCallback((o: CADObject) => {
    return getLadderCenterlineEngine2D(o);
  }, []);

  const projectOntoSegment2D = useCallback(
    (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      if (l2 < 1e-6) return { x: ax, y: ay, dist: Math.hypot(px - ax, py - ay), t: 0 };
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
      const x = ax + t * dx;
      const y = ay + t * dy;
      return { x, y, dist: Math.hypot(px - x, py - y), t };
    },
    []
  );

  const evaluateFluidCableSupportElev3D = useCallback(
    (px: number, py: number, allObjs: CADObject[]) => {
      return evaluateFluidCableSupportElev3DUtil(px, py, allObjs, objectElevYMapRef.current);
    },
    []
  );

  const generateFluid3DCableCurvePts = useCallback(
    (
      pts2D: Array<{ x: number; y: number }>,
      allObjs: CADObject[],
      cX: number,
      cY: number,
      s3D: number,
      wireRadius: number,
      waypoints3D?: Array<{ x3D: number; y3D: number; z3D: number }>
    ) => {
      return generateFluid3DCableCurvePtsUtil(
        pts2D,
        allObjs,
        cX,
        cY,
        s3D,
        wireRadius,
        objectElevYMapRef.current,
        waypoints3D
      );
    },
    []
  );

  const computeSnapped2DTarget = useCallback(
    (
      rawX2D: number,
      rawY2D: number,
      hitCadObj?: CADObject | null,
      hitPt3D?: { x: number; y: number; z: number } | null
    ) => {
      const allObjs = objectsRef.current;
      const lastWp =
        cableWaypoints3DRef.current.length > 0
          ? cableWaypoints3DRef.current[cableWaypoints3DRef.current.length - 1]
          : null;
      const ct = coordTransformRef?.current || { centerX: 0, centerY: 0, scale3D: 0.22 };
      return computeSnappedTargetPoint(
        rawX2D,
        rawY2D,
        hitCadObj,
        allObjs,
        ct,
        lastWp,
        evaluateFluidCableSupportElev3D,
        hitPt3D
      );
    },
    [evaluateFluidCableSupportElev3D, coordTransformRef]
  );

  const computeSmartCableRoute2D = useCallback(
    (
      startPt: { x: number; y: number },
      endPt: { x: number; y: number },
      allObjs: CADObject[],
      orthoMode: boolean
    ): Array<{ x: number; y: number }> => {
      return computeSmartCableRouteEngine2D(startPt, endPt, allObjs, orthoMode);
    },
    []
  );

  const finalize3DCableRun = useCallback(
    (
      pts2D: Array<{ x: number; y: number }>,
      wps3D?: Array<{ x3D: number; y3D: number; z3D: number; x2D: number; y2D: number; snapLabel: string }>,
      hitCabInfo?: { cabinetName: string } | null
    ) => {
      if (pts2D.length < 2) {
        cableStartPt3DRef.current = null;
        cableWaypoints3DRef.current = [];
        setCableStartPt3D(null);
        return;
      }

      // Auto-detect cable preset and line color coding from in-shelter equipment or starting/ending waypoints
      const firstWp = wps3D && wps3D.length > 0 ? wps3D[0] : null;
      const lastWp = wps3D && wps3D.length > 1 ? wps3D[wps3D.length - 1] : null;
      const detectedPreset =
        (firstWp ? detectPresetForTarget(firstWp.snapLabel) : null) ||
        (lastWp ? detectPresetForTarget(lastWp.snapLabel) : null) ||
        (hitCabInfo ? detectPresetForTarget(hitCabInfo.cabinetName) : null) ||
        selectedCablePresetRef.current;

      const preset = detectedPreset;
      const newCableObj = createCableCADObject(pts2D, preset, wps3D);

      if (newCableObj) {
        const calc = calculateCableLength(newCableObj, 20);
        const lengthMsg = `${calc.totalLengthM.toFixed(2)}m (${calc.totalLengthFt.toFixed(1)}ft)`;
        const nextObjects = [...objectsRef.current, newCableObj];
        objectsRef.current = nextObjects;
        rebuildCablesOnlyRef.current?.(nextObjects);
        onUpdateObjectsRef.current?.(
          nextObjects,
          hitCabInfo
            ? `Laid 3D ${preset.label} cable (${lengthMsg}) + LTC on ${hitCabInfo.cabinetName}`
            : `Laid 3D ${preset.label} cable • Auto-calculated length: ${lengthMsg}`
        );
        playQuestCompleteSound();
      }

      cableStartPt3DRef.current = null;
      cableWaypoints3DRef.current = [];
      setCableStartPt3D(null);
    },
    [playQuestCompleteSound]
  );

  const handlePlace3DCablePoint = useCallback(
    (forceFinish = false) => {
      const target = currentTargetPt3DRef.current;
      const wps = cableWaypoints3DRef.current;

      if (forceFinish && wps.length >= 2) {
        finalize3DCableRun(wps.map((p) => ({ x: p.x2D, y: p.y2D })), wps);
        return;
      }

      if (!target) return;

      if (wps.length === 0) {
        // Auto-detect cable preset & line color coding from starting target (e.g., In-Shelter Rack, Rectifier, OLT, AC, Ladder)
        const autoDetected = detectPresetForTarget(target.snapLabel);
        if (autoDetected) {
          setSelectedCablePreset(autoDetected);
          selectedCablePresetRef.current = autoDetected;
        }

        const firstPt = {
          x3D: target.x3D,
          y3D: target.y3D,
          z3D: target.z3D,
          x2D: target.x2D,
          y2D: target.y2D,
          snapLabel: target.snapLabel,
        };
        cableWaypoints3DRef.current = [firstPt];
        cableStartPt3DRef.current = firstPt;
        setCableStartPt3D(firstPt);
        playLadderRungSound(true);
        return;
      }

      const lastPt = wps[wps.length - 1];
      const { nextX2D, nextY2D, cabHit, isTooClose } = resolveNextCablePoint(
        target,
        lastPt,
        objectsRef.current,
        cableOrthoSnapRef.current
      );

      if (isTooClose) {
        if (forceFinish && wps.length >= 2) {
          finalize3DCableRun(wps.map((p) => ({ x: p.x2D, y: p.y2D })), wps);
        }
        return;
      }

      // Preserve exact target elevation if aiming at a recognized surface (rack surface or ladder)
      let exactElev = target.y3D;
      if (!target.snapLabel.includes('Rack Top') && !target.snapLabel.includes('Ladder')) {
        exactElev = evaluateFluidCableSupportElev3D(nextX2D, nextY2D, objectsRef.current).elevY + 0.10;
      }

      const { centerX = 0, centerY = 0, scale3D = 0.22 } = coordTransformRef?.current || {};
      const nextPt = {
        x3D: (nextX2D - centerX) * scale3D,
        y3D: exactElev,
        z3D: (nextY2D - centerY) * scale3D,
        x2D: nextX2D,
        y2D: nextY2D,
        snapLabel: cabHit ? `LTC Connector → ${cabHit.cabinetName}` : target.snapLabel,
      };

      const nextWps = [...wps, nextPt];
      cableWaypoints3DRef.current = nextWps;
      cableStartPt3DRef.current = nextPt;
      setCableStartPt3D(nextPt);

      // Check if user has reached a destination rack (different from the starting rack)
      const isDestinationRack =
        wps.length >= 2 &&
        target.snapLabel.startsWith('Rack Top') &&
        (!wps[0].snapLabel.startsWith('Rack Top') || wps[0].snapLabel !== target.snapLabel);

      // Allow continuing route freely; only finalize automatically on explicit terminal connection or force finish
      const isExplicitTerminal =
        (wps.length >= 2 && target.snapLabel.startsWith('LTC Connector')) ||
        isDestinationRack ||
        forceFinish;

      if (isExplicitTerminal) {
        finalize3DCableRun(
          nextWps.map((p) => ({ x: p.x2D, y: p.y2D })),
          nextWps,
          cabHit ? { cabinetName: cabHit.cabinetName } : null
        );
        return;
      }

      playLadderRungSound(true);
    },
    [finalize3DCableRun, playLadderRungSound, evaluateFluidCableSupportElev3D]
  );

  const handleDeleteCableById3D = useCallback(
    (cableId: string) => {
      const nextObjects = filterOutCableById(objectsRef.current, cableId);
      if (nextObjects === objectsRef.current) return;
      objectsRef.current = nextObjects;
      rebuildCablesOnlyRef.current?.(nextObjects);
      onUpdateObjectsRef.current?.(nextObjects, 'Deleted cable line');
      playLadderRungSound(false);
    },
    [playLadderRungSound]
  );

  const handleClearAllCables3D = useCallback(() => {
    const { nextObjects, wireCount } = filterOutAllCables(objectsRef.current);
    if (wireCount === 0) return;
    objectsRef.current = nextObjects;
    cableStartPt3DRef.current = null;
    setCableStartPt3D(null);
    rebuildCablesOnlyRef.current?.(nextObjects);
    onUpdateObjectsRef.current?.(nextObjects, `Cleared all ${wireCount} cable line(s)`);
    playLadderRungSound(false);
  }, [playLadderRungSound]);

  const handleAutoRouteLadderToCabinets3D = useCallback(() => {
    const allObjs = objectsRef.current;
    const preset = selectedCablePresetRef.current;
    const generatedLines = autoRouteLaddersToCabinets(allObjs, preset);

    if (generatedLines.length > 0) {
      const nonWires = allObjs.filter((o) => o.type !== 'line');
      const nextObjects = [...nonWires, ...generatedLines];
      objectsRef.current = nextObjects;
      rebuildCablesOnlyRef.current?.(nextObjects);
      onUpdateObjectsRef.current?.(
        nextObjects,
        `Auto-routed ${generatedLines.length} 3D cable segments to cabinets`
      );
      playQuestCompleteSound();
    }
  }, [playQuestCompleteSound]);

  return {
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
    getLadderCenterline2D,
    projectOntoSegment2D,
    evaluateFluidCableSupportElev3D,
    generateFluid3DCableCurvePts,
    computeSnapped2DTarget,
    computeSmartCableRoute2D,
    finalize3DCableRun,
    handlePlace3DCablePoint,
    handleDeleteCableById3D,
    handleClearAllCables3D,
    handleAutoRouteLadderToCabinets3D,
    cableHudStatus,
    setCableHudStatus,
  };
}
