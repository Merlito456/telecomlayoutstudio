/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../types/cad';
import { SiteSurfaceType } from '../types';
import { CoordTransform, ExcavatedZone3D, YardBounds3D } from './types';
import { computeTerrainBoundsAndExcavations, ELEVATION_3D_SCALE } from './terrain/terrain-bounds';
import { createTerrainMeshes } from './terrain/terrain-meshes';
import { buildCompoundPerimeterGradeBeams } from './terrain/terrain-compound-beams';

export { ELEVATION_3D_SCALE };

export interface BuildTerrainParams {
  scene: THREE.Scene;
  visible3DObjects: CADObject[];
  surfaceType: SiteSurfaceType;
  surfaceMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>;
  landscapeMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>;
  cementMat: THREE.MeshStandardMaterial;
}

export interface TerrainBuildResult {
  coordTransform: CoordTransform;
  yardBounds: YardBounds3D;
  excavatedZones: ExcavatedZone3D[];
  yardMesh: THREE.Mesh;
  landscapeMesh: THREE.Mesh;
}

export function buildSiteTerrainAndExcavations({
  scene,
  visible3DObjects,
  surfaceType,
  surfaceMaterials,
  landscapeMaterials,
  cementMat,
}: BuildTerrainParams): TerrainBuildResult {
  const { coordTransform, yardBounds, excavatedZones, perimeterObjs } =
    computeTerrainBoundsAndExcavations(visible3DObjects);

  const { yardMesh, landscapeMesh } = createTerrainMeshes(
    scene,
    yardBounds,
    excavatedZones,
    surfaceType,
    surfaceMaterials,
    landscapeMaterials,
    cementMat
  );

  if (perimeterObjs.length > 0) {
    buildCompoundPerimeterGradeBeams(scene, yardBounds, excavatedZones, cementMat);
  }

  return {
    coordTransform,
    yardBounds,
    excavatedZones,
    yardMesh,
    landscapeMesh,
  };
}
