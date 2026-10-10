import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { buildCarPickup3D, buildCarSedan3D } from "./landscape-vehicles";
import {
  buildTree3D,
  buildFlowersBed3D,
  buildCanal3D,
  buildPerson3D,
  create3DDimensionBadge,
  create3DEquipmentBadge,
} from "./landscape-features";
import {
  buildRoad3D,
  buildSidewalk3D,
  buildGrassPatch3D,
  buildConcreteYard3D,
  buildCompoundGravel3D,
} from "./landscape-surfaces";

export * from "./landscape-vehicles";
export * from "./landscape-features";
export * from "./landscape-surfaces";

export function createCivilLandscapeBuilders(
  mats: CAD3DSharedMaterials,
  asphaltMatParam?: THREE.Material,
  surfaceMaterialParam?: THREE.Material
) {
  const { cementMat, galvSteelMat, stainlessMat } = mats;
  const asphaltMat = asphaltMatParam || new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
  const gravelMat = surfaceMaterialParam || new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

  return {
    buildRoad3D: (w: number, d: number) => buildRoad3D(w, d, asphaltMat, gravelMat),
    buildCarPickup3D: (w: number, d: number) => buildCarPickup3D(w, d, galvSteelMat, stainlessMat),
    buildCarSedan3D: (w: number, d: number) => buildCarSedan3D(w, d, stainlessMat),
    buildSidewalk3D: (w: number, d: number) => buildSidewalk3D(w, d, cementMat),
    buildTree3D: (w: number, d: number) => buildTree3D(w, d),
    buildFlowersBed3D: (w: number, d: number) => buildFlowersBed3D(w, d),
    buildCanal3D: (w: number, d: number) => buildCanal3D(w, d, cementMat),
    buildPerson3D: (w: number, d: number) => buildPerson3D(w, d),
    buildGrassPatch3D: (w: number, d: number) => buildGrassPatch3D(w, d, grassMat),
    buildConcreteYard3D: (w: number, d: number) => buildConcreteYard3D(w, d, cementMat),
    buildCompoundGravel3D: (w: number, d: number) => buildCompoundGravel3D(w, d, gravelMat),
    create3DDimensionBadge,
    create3DEquipmentBadge,
  };
}
