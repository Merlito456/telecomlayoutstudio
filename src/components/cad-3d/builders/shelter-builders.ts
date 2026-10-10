import * as THREE from "three";
import { CAD3DSharedMaterials } from "../materials";
import { createWalkInShelterBuilders } from "./shelter/walk-in-shelter";
import { createCabinetsAndCanopyBuilders } from "./shelter/cabinets-canopy";

export function createShelterBuilders(
  mats: CAD3DSharedMaterials,
  doorInteractiveNodesRef?: any,
  buildCementBasepad?: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group,
  cabinRoofCutawayRef?: any
) {
  const walkIn = createWalkInShelterBuilders(mats, doorInteractiveNodesRef, buildCementBasepad, cabinRoofCutawayRef);
  const others = createCabinetsAndCanopyBuilders(mats, doorInteractiveNodesRef);

  return {
    ...walkIn,
    ...others,
  };
}
