import * as THREE from "three";
import { CAD3DSharedMaterials } from "../materials";
import { createCivilPerimeterBuilders } from "./civil/perimeter-builders";
import { createCivilFoundationBuilders } from "./civil/foundation-builders";
import { createCivilLandscapeBuilders } from "./civil/landscape-builders";

export function createCivilBuilders(
  mats: CAD3DSharedMaterials,
  asphaltMat?: THREE.Material,
  surfaceMat?: THREE.Material,
  doorInteractiveNodesRef?: any
) {
  const perim = createCivilPerimeterBuilders(mats, asphaltMat, doorInteractiveNodesRef);
  const found = createCivilFoundationBuilders(mats, asphaltMat, surfaceMat);
  const land = createCivilLandscapeBuilders(mats, asphaltMat, surfaceMat);

  return {
    ...found,
    ...perim,
    ...land,
  };
}
