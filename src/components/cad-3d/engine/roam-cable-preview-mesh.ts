/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject, ProjectSettings } from '../../../types/cad';
import {
  formatMeasurement,
  findCabinetWallLTCAttachment2D,
  constrainCableSegmentAngle2D,
  isIndoorPoint2D,
} from '../../../utils/cad-geometry';
import { CoordTransform } from '../scene/types';
import { CableHudStatus } from './roam-types';
import { detectPresetForTarget } from '../cable-presets';

export function renderDeleteModePreview(
  previewGroup: THREE.Group,
  foundCableObj: CADObject | null,
  foundCableId: string | null,
  coordTransform: CoordTransform,
  frameCounter: number,
  setCableHudStatus: React.Dispatch<React.SetStateAction<CableHudStatus>>
): void {
  const { centerX: cX, centerY: cY, scale3D: s3D } = coordTransform;

  if (foundCableObj) {
    const delMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.88,
    });
    const addDelCyl = (x1_2D: number, y1_2D: number, x2_2D: number, y2_2D: number) => {
      const p1 = new THREE.Vector3((x1_2D - cX) * s3D, 2.79, (y1_2D - cY) * s3D);
      const p2 = new THREE.Vector3((x2_2D - cX) * s3D, 2.79, (y2_2D - cY) * s3D);
      const hLen = p1.distanceTo(p2);
      if (hLen > 0.05) {
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.44, 0.44, hLen, 12),
          delMat
        );
        cyl.position.copy(p1).add(p2).multiplyScalar(0.5);
        cyl.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          p2.clone().sub(p1).normalize()
        );
        previewGroup.add(cyl);
      }
    };

    if (foundCableObj.type === 'line') {
      addDelCyl(
        foundCableObj.x,
        foundCableObj.y,
        foundCableObj.x2 ?? foundCableObj.x,
        foundCableObj.y2 ?? foundCableObj.y
      );
    } else if (
      (foundCableObj.type === 'polyline' || foundCableObj.type === 'pen') &&
      foundCableObj.points
    ) {
      for (let i = 0; i < foundCableObj.points.length - 1; i++) {
        addDelCyl(
          foundCableObj.x + foundCableObj.points[i].x,
          foundCableObj.y + foundCableObj.points[i].y,
          foundCableObj.x + foundCableObj.points[i + 1].x,
          foundCableObj.y + foundCableObj.points[i + 1].y
        );
      }
    }
  }

  if (frameCounter % 4 === 0) {
    setCableHudStatus({
      snapLabel: foundCableId
        ? 'TARGETED CABLE (Click or Press X to Delete)'
        : 'Aim at any cable line to delete',
      lengthStr: '0.00m',
      hoveredCableId: foundCableId,
    });
  }
}

export function renderLayModePreview(
  previewGroup: THREE.Group,
  activeTarget: any,
  foundCableId: string | null,
  wps: any[],
  selectedCablePreset: any,
  cableOrthoSnap: boolean,
  keysHeld: any,
  objects: CADObject[],
  coordTransform: CoordTransform,
  settings: ProjectSettings,
  frameCounter: number,
  setCableHudStatus: React.Dispatch<React.SetStateAction<CableHudStatus>>,
  generateFluid3DCableCurvePts: any
): void {
  const { centerX: cX, centerY: cY, scale3D: s3D } = coordTransform;
  const detectedTargetPreset = detectPresetForTarget(activeTarget.snapLabel);
  const presetHex = wps.length === 0 && detectedTargetPreset ? detectedTargetPreset.hex : selectedCablePreset.hex;
  const markerMat = new THREE.MeshBasicMaterial({ color: presetHex });
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });

  const cursorSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 14, 14),
    markerMat
  );
  cursorSphere.position.set(activeTarget.x3D, activeTarget.y3D, activeTarget.z3D);
  previewGroup.add(cursorSphere);

  const cursorRing = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.4, 24), ringMat);
  cursorRing.rotation.x = -Math.PI / 2;
  cursorRing.position.set(activeTarget.x3D, activeTarget.y3D + 0.04, activeTarget.z3D);
  previewGroup.add(cursorRing);

  let distPx = 0;
  if (wps.length > 0) {
    for (const wp of wps) {
      const wpSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      wpSphere.position.set(wp.x3D, wp.y3D, wp.z3D);
      previewGroup.add(wpSphere);
    }

    const lastPt = wps[wps.length - 1];
    let curX2D = activeTarget.x2D;
    let curY2D = activeTarget.y2D;
    const isIndoor =
      isIndoorPoint2D({ x: activeTarget.x2D, y: activeTarget.y2D }, objects) ||
      isIndoorPoint2D({ x: lastPt.x2D, y: lastPt.y2D }, objects);
    const cabHit = isIndoor
      ? null
      : findCabinetWallLTCAttachment2D(
          { x: activeTarget.x2D, y: activeTarget.y2D },
          { x: lastPt.x2D, y: lastPt.y2D },
          objects,
          2
        );
    if (cabHit) {
      curX2D = cabHit.wallX;
      curY2D = cabHit.wallY;
    } else if (cableOrthoSnap || keysHeld.shift) {
      const constrained = constrainCableSegmentAngle2D(
        { x: lastPt.x2D, y: lastPt.y2D },
        { x: activeTarget.x2D, y: activeTarget.y2D },
        true
      );
      curX2D = constrained.x;
      curY2D = constrained.y;
    }

    const previewTubeMat = new THREE.MeshBasicMaterial({
      color: presetHex,
      transparent: true,
      opacity: 0.88,
    });

    const waypoints2D = [
      ...wps.map((p) => ({ x: p.x2D, y: p.y2D })),
      { x: curX2D, y: curY2D },
    ];

    const waypoints3D = [
      ...wps.map((p) => ({ x3D: p.x3D, y3D: p.y3D, z3D: p.z3D })),
      {
        x3D: (curX2D - cX) * s3D,
        y3D: activeTarget.y3D,
        z3D: (curY2D - cY) * s3D,
      },
    ];

    for (let i = 0; i < waypoints3D.length - 1; i++) {
      const p1 = waypoints3D[i];
      const p2 = waypoints3D[i + 1];
      const d3D = Math.hypot(p2.x3D - p1.x3D, p2.y3D - p1.y3D, p2.z3D - p1.z3D);
      distPx += d3D / s3D;
    }

    const fluidPreviewPts = generateFluid3DCableCurvePts(
      waypoints2D,
      objects,
      cX,
      cY,
      s3D,
      0.095,
      undefined,
      waypoints3D
    );

    if (fluidPreviewPts.length >= 2) {
      const previewCurve = new THREE.CatmullRomCurve3(
        fluidPreviewPts,
        false,
        'centripetal',
        0.15
      );
      const previewSegs = Math.min(180, Math.max(16, fluidPreviewPts.length * 2));
      const previewTubeGeo = new THREE.TubeGeometry(
        previewCurve,
        previewSegs,
        0.095,
        10,
        false
      );
      const previewTubeMesh = new THREE.Mesh(previewTubeGeo, previewTubeMat);
      previewGroup.add(previewTubeMesh);
    }
  }

  if (frameCounter % 4 === 0) {
    const snapDisplay =
      detectedTargetPreset && wps.length === 0
        ? `${activeTarget.snapLabel} • Auto: ${detectedTargetPreset.label}`
        : activeTarget.snapLabel;

    setCableHudStatus({
      snapLabel: snapDisplay,
      lengthStr: formatMeasurement(
        distPx,
        settings.scaleFactor,
        settings.unit,
        settings.dimensionUnitFormat
      ),
      hoveredCableId: foundCableId,
    });
  }
}
