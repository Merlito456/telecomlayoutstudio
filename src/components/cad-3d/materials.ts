/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface CAD3DSharedMaterials {
  cementMat: THREE.MeshStandardMaterial;
  galvSteelMat: THREE.MeshStandardMaterial;
  genGreenMat: THREE.MeshStandardMaterial;
  telecomGreyMat: THREE.MeshStandardMaterial;
  stainlessMat: THREE.MeshStandardMaterial;
  whiteCementMat: THREE.MeshStandardMaterial;
  porcelainRedMat: THREE.MeshPhysicalMaterial;
  porcelainBlueMat: THREE.MeshPhysicalMaterial;
  chainlinkTex?: THREE.CanvasTexture | null;
  concreteTex?: THREE.CanvasTexture | null;
  surfaceMaterials?: Record<string, THREE.MeshStandardMaterial>;
}

export function createCAD3DSharedMaterials(
  concreteTex?: THREE.CanvasTexture | null,
  chainlinkTex?: THREE.CanvasTexture | null
): CAD3DSharedMaterials {
  const cementMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.88,
    metalness: 0.04,
    map: concreteTex || undefined,
  });

  const galvSteelMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.35,
    metalness: 0.85,
  });

  const genGreenMat = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.45,
    metalness: 0.25,
  });

  const telecomGreyMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.5,
    metalness: 0.35,
  });

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.25,
    metalness: 0.9,
  });

  const whiteCementMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.85,
    metalness: 0.05,
  });

  const porcelainRedMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
  });

  return {
    cementMat,
    galvSteelMat,
    genGreenMat,
    telecomGreyMat,
    stainlessMat,
    whiteCementMat,
    porcelainRedMat,
    porcelainBlueMat,
    chainlinkTex,
    concreteTex,
  };
}
