/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

export interface LTCConnectorMaterials {
  brassMat: THREE.Material;
  gasketMat: THREE.Material;
  bootMat: THREE.Material;
  galvSteelMat: THREE.Material;
  stainlessMat: THREE.Material;
}

export function buildLTCConnector3D(
  pos: THREE.Vector3,
  dirX: number,
  dirZ: number,
  wireRadius: number,
  materials: LTCConnectorMaterials
): THREE.Group {
  const ltcGroup = new THREE.Group();
  const r = Math.max(wireRadius, 0.085);
  const { brassMat, gasketMat, bootMat, galvSteelMat, stainlessMat } = materials;

  // 1. Flexible Liquid-Tight Strain-Relief Boot gripping cable (-0.14 along axis)
  const bootGeo = new THREE.CylinderGeometry(r * 1.18, r * 1.42, 0.14, 12);
  const bootMesh = new THREE.Mesh(bootGeo, bootMat);
  bootMesh.rotation.z = Math.PI / 2;
  bootMesh.position.set(-0.14, 0, 0);
  bootMesh.castShadow = true;
  ltcGroup.add(bootMesh);

  // 2. 6-Sided Hexagonal Metallic Compression Gland Nut (-0.03 along axis)
  const hexNutGeo = new THREE.CylinderGeometry(r * 1.65, r * 1.65, 0.10, 6);
  const hexNutMesh = new THREE.Mesh(hexNutGeo, galvSteelMat);
  hexNutMesh.rotation.z = Math.PI / 2;
  hexNutMesh.position.set(-0.03, 0, 0);
  hexNutMesh.castShadow = true;
  ltcGroup.add(hexNutMesh);

  // 3. Brass / Gold LTC Compression Ferrule Ring (+0.04 along axis)
  const ringGeo = new THREE.CylinderGeometry(r * 1.48, r * 1.48, 0.05, 14);
  const ringMesh = new THREE.Mesh(ringGeo, brassMat);
  ringMesh.rotation.z = Math.PI / 2;
  ringMesh.position.set(0.04, 0, 0);
  ltcGroup.add(ringMesh);

  // 4. Threaded Stainless LTC Connector Body Barrel (+0.10 along axis)
  const bodyGeo = new THREE.CylinderGeometry(r * 1.35, r * 1.35, 0.10, 14);
  const bodyMesh = new THREE.Mesh(bodyGeo, stainlessMat);
  bodyMesh.rotation.z = Math.PI / 2;
  bodyMesh.position.set(0.10, 0, 0);
  bodyMesh.castShadow = true;
  ltcGroup.add(bodyMesh);

  // 5. Bulkhead Hex Locknut & Weatherproof Neoprene Sealing Washer flush with cabinet wall (+0.16..+0.20 along axis)
  const locknutGeo = new THREE.CylinderGeometry(r * 1.75, r * 1.75, 0.05, 6);
  const locknutMesh = new THREE.Mesh(locknutGeo, brassMat);
  locknutMesh.rotation.z = Math.PI / 2;
  locknutMesh.position.set(0.16, 0, 0);
  ltcGroup.add(locknutMesh);

  const washerGeo = new THREE.CylinderGeometry(r * 1.88, r * 1.88, 0.035, 16);
  const washerMesh = new THREE.Mesh(washerGeo, gasketMat);
  washerMesh.rotation.z = Math.PI / 2;
  washerMesh.position.set(0.195, 0, 0);
  ltcGroup.add(washerMesh);

  const ang = Math.atan2(dirZ, dirX);
  ltcGroup.rotation.y = -ang;
  ltcGroup.position.copy(pos);
  return ltcGroup;
}
