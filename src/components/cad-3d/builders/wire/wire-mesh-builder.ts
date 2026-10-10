/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";
import { CADObject } from "../../../../types/cad";
import {
  getRotatedObjectBounds,
  findCabinetWallLTCAttachment2D,
  getLadderCenterline2D as getLadderCenterlineEngine2D,
  measurePathOnLadderLength,
  computeSmartCableRoute2D as computeSmartCableRouteEngine2D,
  isRackObject,
  isIndoorEquipment,
  isIndoorCable,
  isIndoorPoint2D,
} from "../../../../utils/cad-geometry";
import {
  isCabinetOrBoxId,
  isLadderId,
  findClosestJunctionPoint2D,
  resolveNetworkElevation,
  isRogueWireObj,
} from "./wire-network-utils";
import { buildLTCConnector3D, LTCConnectorMaterials } from "./ltc-connector-builder";
import { ExcavatedZone3D, WireNetworkElevInfo } from "./wire-types";

export interface WireMeshBuilderParams {
  excavatedZones: ExcavatedZone3D[];
  evaluateFluidCableSupportElev3D: (
    px: number,
    py: number,
    allObjs: CADObject[]
  ) => { elevY: number; surfaceLabel: string; onLadder: boolean };
  generateFluid3DCableCurvePts: (
    pts2D: Array<{ x: number; y: number }>,
    allObjs: CADObject[],
    cx: number,
    cy: number,
    scale3D: number,
    wireRadius: number,
    waypoints3D?: Array<{ x3D: number; y3D: number; z3D: number }>
  ) => THREE.Vector3[];
  wireNetworkElevCache: Map<string, WireNetworkElevInfo>;
  ltcMaterials: LTCConnectorMaterials;
}

export function buildSingleWireCable3D(
  obj: CADObject,
  allObjects: CADObject[],
  centerX: number,
  centerY: number,
  scale3D: number,
  params: WireMeshBuilderParams
): THREE.Group | null {
  if (isRogueWireObj(obj)) return null;

  const strokeCol = obj.stroke || '#38bdf8';
  const wireMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(strokeCol),
    roughness: 0.4,
    metalness: 0.2,
  });

  const strokeW = obj.strokeWidth || 2;
  const wireRadius = Math.max(0.08, Math.min(0.115, strokeW * 0.032));

  const allLadders2D = allObjects.filter((o) => {
    if (o.isStencilLabel) return false;
    const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    return isLadderId(s);
  });

  const allWireObjects = allObjects.filter(
    (o) => (o.type === 'line' || o.type === 'polyline' || o.type === 'pen') && !isRogueWireObj(o)
  );

  const { supportSurfaceTop, terrainOffset3D } = resolveNetworkElevation(
    obj,
    allObjects,
    allWireObjects,
    params.excavatedZones,
    centerX,
    centerY,
    scale3D,
    params.wireNetworkElevCache
  );

  const targetElevY = supportSurfaceTop + wireRadius + terrainOffset3D;
  const group = new THREE.Group();

  const addContinuousCableSegment3D = (
    x1_3D: number,
    z1_3D: number,
    x2_3D: number,
    z2_3D: number,
    y1_3D = targetElevY,
    y2_3D = targetElevY
  ) => {
    const p1 = new THREE.Vector3(x1_3D, y1_3D, z1_3D);
    const p2 = new THREE.Vector3(x2_3D, y2_3D, z2_3D);
    const len = p1.distanceTo(p2);
    if (len > 0.02) {
      const cylGeo = new THREE.CylinderGeometry(wireRadius, wireRadius, len, 14);
      const cylMesh = new THREE.Mesh(cylGeo, wireMat);
      cylMesh.position.copy(p1).add(p2).multiplyScalar(0.5);
      cylMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        p2.clone().sub(p1).normalize()
      );
      cylMesh.castShadow = true;
      cylMesh.receiveShadow = true;
      group.add(cylMesh);
    }

    const capGeo = new THREE.SphereGeometry(wireRadius, 14, 14);
    const cap1 = new THREE.Mesh(capGeo, wireMat);
    cap1.position.copy(p1);
    cap1.castShadow = true;
    group.add(cap1);

    const cap2 = new THREE.Mesh(capGeo, wireMat);
    cap2.position.copy(p2);
    cap2.castShadow = true;
    group.add(cap2);
  };

  const weldJunctionOrAddTerminalLTC = (
    endX2D: number,
    endY2D: number,
    prevX2D: number,
    prevY2D: number,
    endElevY = targetElevY
  ) => {
    const endX3D = (endX2D - centerX) * scale3D;
    const endZ3D = (endY2D - centerY) * scale3D;
    const prevX3D = (prevX2D - centerX) * scale3D;
    const prevZ3D = (prevY2D - centerY) * scale3D;
    const dx = endX3D - prevX3D;
    const dz = endZ3D - prevZ3D;
    const segLen = Math.hypot(dx, dz);
    const dirX = segLen > 0.001 ? dx / segLen : 1;
    const dirZ = segLen > 0.001 ? dz / segLen : 0;

    // Indoor cables do not use outdoor LTC connectors or wall snapping
    if (isIndoorCable(obj, allObjects) || isIndoorPoint2D({ x: endX2D, y: endY2D }, allObjects)) {
      return;
    }

    const cabAttachment = findCabinetWallLTCAttachment2D(
      { x: endX2D, y: endY2D },
      { x: prevX2D, y: prevY2D },
      allObjects,
      16,
      obj.id
    );
    if (cabAttachment) {
      const hitX3D = (cabAttachment.wallX - centerX) * scale3D;
      const hitZ3D = (cabAttachment.wallY - centerY) * scale3D;
      const entryDirX = cabAttachment.dirX;
      const entryDirZ = cabAttachment.dirY;

      if (Math.hypot(hitX3D - endX3D, hitZ3D - endZ3D) > 0.03) {
        addContinuousCableSegment3D(
          endX3D,
          endZ3D,
          hitX3D + entryDirX * 0.12,
          hitZ3D + entryDirZ * 0.12,
          endElevY,
          endElevY
        );
      }
      group.add(
        buildLTCConnector3D(
          new THREE.Vector3(
            hitX3D - entryDirX * 0.20,
            endElevY,
            hitZ3D - entryDirZ * 0.20
          ),
          entryDirX,
          entryDirZ,
          wireRadius,
          params.ltcMaterials
        )
      );
      return;
    }

    const cabSnapMargin2D = 45;
    const isHorizSeg = Math.abs(endX2D - prevX2D) >= Math.abs(endY2D - prevY2D);

    for (const cab of allObjects) {
      if (cab.id === obj.id || cab.isStencilLabel) continue;
      const sId = (cab.stencilId || cab.customProps?.stencilType || '').toLowerCase();
      if (!isCabinetOrBoxId(sId)) continue;
      const cb = getRotatedObjectBounds(cab);

      if (isHorizSeg) {
        const inYBand = endY2D >= cb.minY - 8 && endY2D <= cb.maxY + 8;
        const headingRightToCab =
          endX2D > prevX2D + 2 && endX2D >= cb.minX - cabSnapMargin2D && prevX2D <= cb.minX + 6;
        const headingLeftToCab =
          endX2D < prevX2D - 2 && endX2D <= cb.maxX + cabSnapMargin2D && prevX2D >= cb.maxX - 6;

        if (inYBand && (headingRightToCab || headingLeftToCab)) {
          const wallX2D = headingRightToCab ? cb.minX : cb.maxX;
          const hitX3D = (wallX2D - centerX) * scale3D;
          const entryDirX = headingRightToCab ? 1 : -1;

          if (Math.abs(hitX3D - endX3D) > 0.03) {
            addContinuousCableSegment3D(
              endX3D,
              endZ3D,
              hitX3D + entryDirX * 0.12,
              endZ3D,
              endElevY,
              endElevY
            );
          }
          group.add(
            buildLTCConnector3D(
              new THREE.Vector3(hitX3D - entryDirX * 0.20, endElevY, endZ3D),
              entryDirX,
              0,
              wireRadius,
              params.ltcMaterials
            )
          );
          return;
        }
      } else {
        const inXBand = endX2D >= cb.minX - 8 && endX2D <= cb.maxX + 8;
        const headingDownToCab =
          endY2D > prevY2D + 2 && endY2D >= cb.minY - cabSnapMargin2D && prevY2D <= cb.minY + 6;
        const headingUpToCab =
          endY2D < prevY2D - 2 && endY2D <= cb.maxY + cabSnapMargin2D && prevY2D >= cb.maxY - 6;

        if (inXBand && (headingDownToCab || headingUpToCab)) {
          const wallY2D = headingDownToCab ? cb.minY : cb.maxY;
          const hitZ3D = (wallY2D - centerY) * scale3D;
          const entryDirZ = headingDownToCab ? 1 : -1;

          if (Math.abs(hitZ3D - endZ3D) > 0.03) {
            addContinuousCableSegment3D(
              endX3D,
              endZ3D,
              endX3D,
              hitZ3D + entryDirZ * 0.12,
              endElevY,
              endElevY
            );
          }
          group.add(
            buildLTCConnector3D(
              new THREE.Vector3(endX3D, endElevY, hitZ3D - entryDirZ * 0.20),
              0,
              entryDirZ,
              wireRadius,
              params.ltcMaterials
            )
          );
          return;
        }
      }
    }

    const junction = findClosestJunctionPoint2D(endX2D, endY2D, obj.id, allWireObjects);
    if (junction) {
      const jX3D = (junction.x - centerX) * scale3D;
      const jZ3D = (junction.y - centerY) * scale3D;
      const jElevY = params.evaluateFluidCableSupportElev3D(junction.x, junction.y, allObjects).elevY + wireRadius;
      addContinuousCableSegment3D(endX3D, endZ3D, jX3D, jZ3D, endElevY, jElevY);
      return;
    }
  };

  if (obj.type === 'line' || ((obj.type === 'polyline' || obj.type === 'pen') && obj.points && obj.points.length > 1)) {
    let activePts2D: Array<{ x: number; y: number }> = [];
    if (obj.type === 'line') {
      activePts2D = [
        { x: obj.x, y: obj.y },
        { x: obj.x2 ?? obj.x + obj.width, y: obj.y2 ?? obj.y + (obj.height || 0) },
      ];
    } else if (obj.points) {
      activePts2D = obj.points.map((pt) => ({
        x: obj.x + pt.x,
        y: obj.y + pt.y,
      }));
    }

    if (activePts2D.length < 2) return null;

    if (
      allLadders2D.length > 0 &&
      obj.type !== 'pen' &&
      activePts2D.length === 2 &&
      obj.id.startsWith('cable3d_auto_')
    ) {
      const ladderCenterlines = allLadders2D.map(getLadderCenterlineEngine2D);
      const origMeasure = measurePathOnLadderLength(activePts2D, ladderCenterlines);
      const smartPts2D = computeSmartCableRouteEngine2D(
        activePts2D[0],
        activePts2D[activePts2D.length - 1],
        allObjects,
        true,
        obj.id
      );
      const smartMeasure = measurePathOnLadderLength(smartPts2D, ladderCenterlines);
      const origOff = origMeasure.totalLen - origMeasure.onLadderLen;
      const smartOff = smartMeasure.totalLen - smartMeasure.onLadderLen;

      if (
        smartPts2D.length >= 2 &&
        smartMeasure.onLadderLen >= 8 &&
        (smartMeasure.onLadderLen > origMeasure.onLadderLen + 5 ||
          (origOff > smartOff + 6 && smartMeasure.onLadderLen >= origMeasure.onLadderLen))
      ) {
        activePts2D = smartPts2D;
      }
    }

    const wps3D = obj.waypoints3D || obj.customProps?.waypoints3D;
    const fluidPts3D = params.generateFluid3DCableCurvePts(
      activePts2D,
      allObjects,
      centerX,
      centerY,
      scale3D,
      wireRadius,
      wps3D
    );

    if (fluidPts3D.length < 2) return null;

    const totalSpan = fluidPts3D[0].distanceTo(fluidPts3D[fluidPts3D.length - 1]);
    if (totalSpan < 0.08 && fluidPts3D.length <= 6) return null;

    const curve3D = new THREE.CatmullRomCurve3(fluidPts3D, false, 'centripetal', 0.15);
    const tubularSegments = Math.min(240, Math.max(20, fluidPts3D.length * 2));
    const tubeGeo = new THREE.TubeGeometry(curve3D, tubularSegments, wireRadius, 12, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, wireMat);
    tubeMesh.castShadow = true;
    tubeMesh.receiveShadow = true;
    group.add(tubeMesh);

    const capGeo = new THREE.SphereGeometry(wireRadius, 14, 14);
    const capStart = new THREE.Mesh(capGeo, wireMat);
    capStart.position.copy(fluidPts3D[0]);
    capStart.castShadow = true;
    group.add(capStart);

    const capEnd = new THREE.Mesh(capGeo, wireMat);
    capEnd.position.copy(fluidPts3D[fluidPts3D.length - 1]);
    capEnd.castShadow = true;
    group.add(capEnd);

    const pFirst = activePts2D[0];
    const pSecond = activePts2D[1];
    const pLast = activePts2D[activePts2D.length - 1];
    const pPrev = activePts2D[activePts2D.length - 2];

    weldJunctionOrAddTerminalLTC(pFirst.x, pFirst.y, pSecond.x, pSecond.y, fluidPts3D[0].y);
    weldJunctionOrAddTerminalLTC(pLast.x, pLast.y, pPrev.x, pPrev.y, fluidPts3D[fluidPts3D.length - 1].y);

    return group;
  }

  return null;
}
