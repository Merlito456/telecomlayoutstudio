import * as THREE from 'three';
import {
  createConcreteTexture,
  createGravelTexture,
  createGrassTexture,
  createAsphaltTexture,
  createDirtTexture,
  createChainlinkTexture,
} from '../textures';
import { CAD3DSharedMaterials, createCAD3DSharedMaterials } from '../materials';
import { SiteSurfaceType } from '../types';

export interface SceneMountMaterialsResult {
  cementMat: THREE.MeshStandardMaterial;
  asphaltMat: THREE.MeshStandardMaterial;
  surfaceMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>;
  landscapeMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial>;
  sharedMats: CAD3DSharedMaterials;
}

export function createSceneMountMaterials(): SceneMountMaterialsResult {
  const concreteTex = createConcreteTexture();
  const gravelTex = createGravelTexture();
  const chainlinkTex = createChainlinkTexture();
  const grassTex = createGrassTexture();
  const asphaltTex = createAsphaltTexture();
  const dirtTex = createDirtTexture();

  const cementMat = new THREE.MeshStandardMaterial({
    color: 0xb5b5ad,
    roughness: 0.88,
    metalness: 0.04,
    map: concreteTex,
  });

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.8,
    metalness: 0.12,
    map: asphaltTex,
  });

  const surfaceMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial> = {
    gravel: new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.95,
      metalness: 0.05,
      map: gravelTex,
    }),
    grass: new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.85,
      metalness: 0.02,
      map: grassTex,
    }),
    asphalt: asphaltMat,
    concrete: cementMat,
    dirt: new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.95,
      metalness: 0.02,
      map: dirtTex,
    }),
  };

  const landscapeMaterials: Record<SiteSurfaceType, THREE.MeshStandardMaterial> = {
    gravel: new THREE.MeshStandardMaterial({
      color: 0x57534e,
      roughness: 0.98,
      metalness: 0.05,
      map: gravelTex,
    }),
    grass: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.9,
      metalness: 0.02,
      map: grassTex,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.85,
      metalness: 0.1,
      map: asphaltTex,
    }),
    concrete: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.88,
      metalness: 0.04,
      map: concreteTex,
    }),
    dirt: new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.96,
      metalness: 0.02,
      map: dirtTex,
    }),
  };

  const sharedMats: CAD3DSharedMaterials = {
    ...createCAD3DSharedMaterials(concreteTex, chainlinkTex),
    cementMat,
    surfaceMaterials,
  };

  return {
    cementMat,
    asphaltMat,
    surfaceMaterials,
    landscapeMaterials,
    sharedMats,
  };
}
