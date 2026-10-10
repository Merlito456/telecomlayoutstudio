/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ExcavatedZone3D, YardBounds3D } from '../types';
import { SiteSurfaceType } from '../../types';

export function createTerrainMeshes(
  scene: THREE.Scene,
  yardBounds: YardBounds3D,
  excavatedZones: ExcavatedZone3D[],
  surfaceType: SiteSurfaceType,
  surfaceMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>,
  landscapeMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>,
  cementMat: THREE.MeshStandardMaterial
): { yardMesh: THREE.Mesh; landscapeMesh: THREE.Mesh } {
  const { yard3DMinX, yard3DMaxX, yard3DMinZ, yard3DMaxZ, yardWidth, yardDepth, yardMidX, yardMidZ } = yardBounds;

  let yardMesh: THREE.Mesh;
  if (excavatedZones.length > 0) {
    const yardShape = new THREE.Shape();
    yardShape.moveTo(yard3DMinX, -yard3DMinZ);
    yardShape.lineTo(yard3DMaxX, -yard3DMinZ);
    yardShape.lineTo(yard3DMaxX, -yard3DMaxZ);
    yardShape.lineTo(yard3DMinX, -yard3DMaxZ);
    yardShape.closePath();

    excavatedZones.forEach((ez) => {
      const hMinX = Math.max(yard3DMinX + 0.05, ez.minX);
      const hMaxX = Math.min(yard3DMaxX - 0.05, ez.maxX);
      const hMinZ = Math.max(yard3DMinZ + 0.05, ez.minZ);
      const hMaxZ = Math.min(yard3DMaxZ - 0.05, ez.maxZ);
      if (hMaxX > hMinX + 0.5 && hMaxZ > hMinZ + 0.5) {
        const hole = new THREE.Path();
        hole.moveTo(hMinX, -hMinZ);
        hole.lineTo(hMaxX, -hMinZ);
        hole.lineTo(hMaxX, -hMaxZ);
        hole.lineTo(hMinX, -hMaxZ);
        hole.closePath();
        yardShape.holes.push(hole);
      }
    });

    const yardGeo = new THREE.ShapeGeometry(yardShape);
    yardMesh = new THREE.Mesh(yardGeo, surfaceMaterials[surfaceType]);
    yardMesh.rotation.x = -Math.PI / 2;
    yardMesh.position.set(0, -0.1, 0);
    yardMesh.receiveShadow = true;
    scene.add(yardMesh);

    // Sunken beds & retaining cuts
    excavatedZones.forEach((ez) => {
      const ew = Math.max(1, ez.maxX - ez.minX);
      const ed = Math.max(1, ez.maxZ - ez.minZ);
      const emx = (ez.minX + ez.maxX) / 2;
      const emz = (ez.minZ + ez.maxZ) / 2;

      const bedMat = new THREE.MeshStandardMaterial({
        color: 0x292524,
        roughness: 0.95,
        metalness: 0.05,
      });
      const bedGeo = new THREE.PlaneGeometry(ew, ed);
      const bedMesh = new THREE.Mesh(bedGeo, bedMat);
      bedMesh.rotation.x = -Math.PI / 2;
      bedMesh.position.set(emx, -ez.depth3D + 0.05, emz);
      bedMesh.receiveShadow = true;
      scene.add(bedMesh);

      const isNorthAttached = excavatedZones.some((other) => {
        if (other.id === ez.id) return false;
        const touchZ = Math.abs(ez.minZ - other.maxZ) <= 1.5;
        const overlapX = Math.min(ez.maxX, other.maxX) - Math.max(ez.minX, other.minX);
        return touchZ && overlapX > 0.5;
      });

      const isSouthAttached = excavatedZones.some((other) => {
        if (other.id === ez.id) return false;
        const touchZ = Math.abs(ez.maxZ - other.minZ) <= 1.5;
        const overlapX = Math.min(ez.maxX, other.maxX) - Math.max(ez.minX, other.minX);
        return touchZ && overlapX > 0.5;
      });

      const isWestAttached = excavatedZones.some((other) => {
        if (other.id === ez.id) return false;
        const touchX = Math.abs(ez.minX - other.maxX) <= 1.5;
        const overlapZ = Math.min(ez.maxZ, other.maxZ) - Math.max(ez.minX, other.minX);
        return touchX && overlapZ > 0.5;
      });

      const isEastAttached = excavatedZones.some((other) => {
        if (other.id === ez.id) return false;
        const touchX = Math.abs(ez.maxX - other.minX) <= 1.5;
        const overlapZ = Math.min(ez.maxZ, other.maxZ) - Math.max(ez.minX, other.minX);
        return touchX && overlapZ > 0.5;
      });

      const isInsideOther = (x: number, z: number) => {
        return excavatedZones.some(
          (other) =>
            other.id !== ez.id &&
            x >= other.minX + 0.2 &&
            x <= other.maxX - 0.2 &&
            z >= other.minZ + 0.2 &&
            z <= other.maxZ - 0.2
        );
      };

      const cutThick = 0.6;
      const cutLipTop = 0.35;
      const cutWallH = ez.depth3D + cutLipTop;
      const cutCenterY = (cutLipTop - ez.depth3D) / 2;
      const cutMat =
        ez.retainingMat === 'earth'
          ? new THREE.MeshStandardMaterial({ color: 0x573e27, roughness: 0.95 })
          : cementMat;

      if (!isNorthAttached && !isInsideOther(emx, ez.minZ) && ez.minZ > yard3DMinZ + 0.5) {
        const nCut = new THREE.Mesh(new THREE.BoxGeometry(ew, cutWallH, cutThick), cutMat);
        nCut.position.set(emx, cutCenterY, ez.minZ - cutThick / 2);
        nCut.castShadow = true;
        nCut.receiveShadow = true;
        scene.add(nCut);
      }
      if (!isSouthAttached && !isInsideOther(emx, ez.maxZ) && ez.maxZ < yard3DMaxZ - 0.5) {
        const sCut = new THREE.Mesh(new THREE.BoxGeometry(ew, cutWallH, cutThick), cutMat);
        sCut.position.set(emx, cutCenterY, ez.maxZ + cutThick / 2);
        sCut.castShadow = true;
        sCut.receiveShadow = true;
        scene.add(sCut);
      }
      if (!isWestAttached && !isInsideOther(ez.minX, emz) && ez.minX > yard3DMinX + 0.5) {
        const wCut = new THREE.Mesh(new THREE.BoxGeometry(cutThick, cutWallH, ed), cutMat);
        wCut.position.set(ez.minX - cutThick / 2, cutCenterY, emz);
        wCut.castShadow = true;
        wCut.receiveShadow = true;
        scene.add(wCut);
      }
      if (!isEastAttached && !isInsideOther(ez.maxX, emz) && ez.maxX < yard3DMaxX - 0.5) {
        const eCut = new THREE.Mesh(new THREE.BoxGeometry(cutThick, cutWallH, ed), cutMat);
        eCut.position.set(ez.maxX + cutThick / 2, cutCenterY, emz);
        eCut.castShadow = true;
        eCut.receiveShadow = true;
        scene.add(eCut);
      }
    });
  } else {
    const yardGeo = new THREE.PlaneGeometry(yardWidth, yardDepth);
    yardMesh = new THREE.Mesh(yardGeo, surfaceMaterials[surfaceType]);
    yardMesh.rotation.x = -Math.PI / 2;
    yardMesh.position.set(yardMidX, -0.1, yardMidZ);
    yardMesh.receiveShadow = true;
    scene.add(yardMesh);
  }

  // Surrounding Natural Landscape
  const grassExtent = Math.max(1200, Math.max(yardWidth, yardDepth) * 3);
  let landscapeMesh: THREE.Mesh;
  if (excavatedZones.length > 0) {
    const halfG = grassExtent / 2;
    const gMinX = yardMidX - halfG;
    const gMaxX = yardMidX + halfG;
    const gMinZ = yardMidZ - halfG;
    const gMaxZ = yardMidZ + halfG;

    const grassShape = new THREE.Shape();
    grassShape.moveTo(gMinX, -gMinZ);
    grassShape.lineTo(gMaxX, -gMinZ);
    grassShape.lineTo(gMaxX, -gMaxZ);
    grassShape.lineTo(gMinX, -gMaxZ);
    grassShape.closePath();

    excavatedZones.forEach((ez) => {
      if (ez.maxX > ez.minX + 0.5 && ez.maxZ > ez.minZ + 0.5) {
        const hole = new THREE.Path();
        hole.moveTo(ez.minX, -ez.minZ);
        hole.lineTo(ez.maxX, -ez.minZ);
        hole.lineTo(ez.maxX, -ez.maxZ);
        hole.lineTo(ez.minX, -ez.maxZ);
        hole.closePath();
        grassShape.holes.push(hole);
      }
    });

    const grassGeo = new THREE.ShapeGeometry(grassShape);
    landscapeMesh = new THREE.Mesh(grassGeo, landscapeMaterials[surfaceType]);
    landscapeMesh.rotation.x = -Math.PI / 2;
    landscapeMesh.position.set(0, -0.3, 0);
    landscapeMesh.receiveShadow = true;
    scene.add(landscapeMesh);
  } else {
    const grassGeo = new THREE.PlaneGeometry(grassExtent, grassExtent);
    landscapeMesh = new THREE.Mesh(grassGeo, landscapeMaterials[surfaceType]);
    landscapeMesh.rotation.x = -Math.PI / 2;
    landscapeMesh.position.set(yardMidX, -0.3, yardMidZ);
    landscapeMesh.receiveShadow = true;
    scene.add(landscapeMesh);
  }

  return { yardMesh, landscapeMesh };
}
