/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CAD3DSharedMaterials } from '../../materials';
import { createAtsMpdBuilders } from './ats-mpd-builders';
import { createEcbBuilders } from './ecb-builders';
import { createAcpdbBuilders } from './acpdb-builders';

export function createDistributionBuilders(
  mats: CAD3DSharedMaterials,
  _buildCementBasepad?: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group
) {
  const { buildATS3D, buildMPD3D, buildDCPDU3D } = createAtsMpdBuilders(mats);
  const { buildECBWallMounted3D, buildECBPoleMounted3D, buildECB3D } = createEcbBuilders(mats);
  const { buildACPDB3D } = createAcpdbBuilders(mats);

  return {
    buildATS3D,
    buildMPD3D,
    buildDCPDU3D,
    buildECBWallMounted3D,
    buildECBPoleMounted3D,
    buildACPDB3D,
    buildECB3D,
  };
}
