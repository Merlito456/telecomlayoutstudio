/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";
import { CADObject } from "../../../types/cad";
import { ExcavatedZone3D, WireNetworkElevInfo } from "./wire/wire-types";
import { LTCConnectorMaterials } from "./wire/ltc-connector-builder";
import { buildSingleWireCable3D } from "./wire/wire-mesh-builder";

export type { ExcavatedZone3D } from "./wire/wire-types";

export function createWireCableBuilders(
  excavatedZones: ExcavatedZone3D[],
  evaluateFluidCableSupportElev3D: (
    px: number,
    py: number,
    allObjs: CADObject[]
  ) => { elevY: number; surfaceLabel: string; onLadder: boolean },
  generateFluid3DCableCurvePts: (
    pts2D: Array<{ x: number; y: number }>,
    allObjs: CADObject[],
    cx: number,
    cy: number,
    scale3D: number,
    wireRadius: number,
    waypoints3D?: Array<{ x3D: number; y3D: number; z3D: number }>
  ) => THREE.Vector3[]
) {
  const ltcMaterials: LTCConnectorMaterials = {
    brassMat: new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.25,
      metalness: 0.85,
    }),
    gasketMat: new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
    }),
    bootMat: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.2,
    }),
    galvSteelMat: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.65,
      roughness: 0.35,
    }),
    stainlessMat: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.8,
      roughness: 0.25,
    }),
  };

  const wireNetworkElevCache = new Map<string, WireNetworkElevInfo>();

  const buildWireCables3D = (
    obj: CADObject,
    allObjects: CADObject[],
    centerX: number,
    centerY: number,
    scale3D: number
  ): THREE.Group | null => {
    return buildSingleWireCable3D(obj, allObjects, centerX, centerY, scale3D, {
      excavatedZones,
      evaluateFluidCableSupportElev3D,
      generateFluid3DCableCurvePts,
      wireNetworkElevCache,
      ltcMaterials,
    });
  };

  return {
    buildWireCables3D,
    wireNetworkElevCache,
  };
}
