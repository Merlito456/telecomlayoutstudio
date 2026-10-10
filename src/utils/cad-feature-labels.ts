/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, Point } from '../types/cad';
import { getObjectBounds } from './cad-geometry';

// Helper to detect station/feature name at a given coordinate for drafting dimension labels
export function detectFeatureLabelAtPoint(
  pt: Point,
  objs: CADObject[],
  fallback: string,
  scaleFactor = 20
): string {
  for (let i = objs.length - 1; i >= 0; i--) {
    const o = objs[i];
    if (o.type === 'dim-h' || o.type === 'dim-v' || o.type === 'dim-aligned') continue;
    const b = getObjectBounds(o);
    const pad = 30;
    if (pt.x >= b.minX - pad && pt.x <= b.maxX + pad && pt.y >= b.minY - pad && pt.y <= b.maxY + pad) {
      if (o.stencilId) {
        const idMap: Record<string, string> = {
          'generator-pad': 'Generator (Green)',
          'generator': 'Generator (Green)',
          'fuel-tank': 'Fuel Tank (1000L)',
          'transformer': 'Substation TX',
          'shelter': 'Shelter Wall',
          'cement-shelter': 'White Cement Shelter',
          'wall-roof-canopy': 'Canopy Shade Roof',
          'wall-roof-shade': 'Canopy Shade Roof',
          'mpd': 'MPD Panel',
          'dcpdu': 'DCPDU Unit',
          'ats': 'ATS (Wall Mounted)',
          'ats-panel': 'ATS (Wall Mounted)',
          'ats-cabinet': 'ATS (Wall Mounted)',
          'ats-wall': 'ATS (Wall Mounted)',
          'ecb': 'ECB (Wall Mounted)',
          'ecb-wall': 'ECB (Wall Mounted)',
          'ecb-pole': 'ECB (Pole Mounted)',
          'power-twopole-structure': 'Two-Pole Structure (ECB + ACPDB)',
          'acpdb': 'ACPDB Distribution Board',
          'acpdb-wall': 'ACPDB (Wall Mounted)',
          'acpdb-pole': 'ACPDB (Pole Mounted)',
          'acpdb-dual': 'Dual ACPDB (Mains + DG)',
          'huawei-1bay': 'Huawei 1-Bay Cabinet',
          'huawei-2bay': 'Huawei 2-Bay Cabinet',
          'huawei-mini-odc': 'Huawei Mini ODC',
          'huawei-odc': 'Huawei ODC Cabinet',
          'fushan-1bay': 'Fushan 1-Bay Cabinet',
          'fushan-2bay': 'Fushan 2-Bay Cabinet',
          'fushan-mini-odc': 'Fushan Mini ODC',
          'fushan-odc': 'Fushan ODC Cabinet',
          'ericsson-1bay': 'Ericsson 1-Bay Cabinet',
          'ericsson-2bay': 'Ericsson 2-Bay Cabinet',
          'ericsson-mini-odc': 'Ericsson Mini ODC',
          'ericsson-odc': 'Ericsson ODC Cabinet',
          'fhodc-1bay': 'FH ODC 1-Bay Cabinet',
          'fhodc-2bay': 'FH ODC 2-Bay Cabinet',
          'fhodc-mini-odc': 'FH Mini ODC',
          'fhodc-odc': 'FH ODC Cabinet',
          'eltek-1bay': 'Eltek 1-Bay Cabinet',
          'eltek-2bay': 'Eltek 2-Bay Cabinet',
          'eltek-mini-odc': 'Eltek Mini ODC',
          'eltek-odc': 'Eltek ODC Cabinet',
          'mini-odc': 'Mini ODC Cabinet',
          'monopole-tower': 'Monopole 1-Leg',
          'monopole': 'Monopole 1-Leg',
          'monopole-platform': 'Monopole Platform',
          '4leg-tower': '4-Leg Tower Leg',
          'tower-4leg': '4-Leg Tower Leg',
          '3leg-tower': '3-Leg Tower Leg',
          'tower-3leg': '3-Leg Tower Leg',
          'guyed-tower': 'Guyed Tower Mast',
          'guy-anchor': 'Guy Anchor Block',
          'rooftop-mount': 'Rooftop Mount Skid',
          'rooftop-parapet-mount': 'Parapet Mount',
          'odc': 'ODC Cabinet',
          '1bay-cabinet': '1-Bay Cabinet',
          '2bay-cabinet': '2-Bay Cabinet',
          '3bay-cabinet': '3-Bay Cabinet',
          'cabinet-1bay': '1-Bay Cabinet',
          'cabinet-2bay': '2-Bay Cabinet',
          'cabinet-3bay': '3-Bay Cabinet',
          'cable-tray': 'Cable Bridge',
          'cable-ladder-top': 'Cable Ladder',
          'cable-ladder': 'Cable Ladder',
          'basepad-ladder': 'Basepad Ladder',
          'cabin-feeder-ladder': 'Cabin Feeder Ladder (Elevated)',
          'indoor-ladder': 'In-Shelter Ladder (Indoor)',
          'indoor-ladder-long': 'In-Shelter Ladder Runway (Indoor)',
          'indoor-ladder-junction': 'In-Shelter Ladder Junction (Indoor)',
          'connecting-ladder': 'Connecting Transition Ladder',
          'cement-basepad': 'Cement Basepad',
          'gen-basepad': 'Gen Basepad',
          'tx-basepad': 'TX Basepad',
          'ac-basepad': 'AC Basepad',
          'cement-slab': 'Concrete Slab',
          'cement-fence': 'Security Fence',
          'cement-post': 'Fence Post',
          'boundary-fence': 'Boundary Fence',
          'gate-2door': 'Closed Site Gate',
          'air-conditioner': 'HVAC Condenser',
          'battery-bank': 'Battery Bank',
          'wall': 'Masonry Wall',
          'gravel-pad': 'Gravel Yard',
          'road-segment': 'Access Road',
          'asphalt-road': 'Asphalt Road',
          'car-pickup': 'Service Pickup',
          'car-sedan': 'Sedan Vehicle',
          'sidewalk': 'Sidewalk Curb',
          'small-house': 'Guardhouse',
          'tree-deciduous': 'Tree Canopy',
          'tree-oak': 'Tree Canopy',
          'flowers-bed': 'Flower Bed',
          'drainage-canal': 'Drainage Canal',
          'site-person': 'Field Technician',
          'grass-patch': 'Grass Lawn',
          'concrete-yard': 'Concrete Pavement',
          'excavated-pit': 'Excavated Pit (-1.0m)',
          'elevated-terrace': 'Elevated Terrace (+0.8m)',
          'earth-berm-level': 'Earthen Mound (+0.6m)',
        };
        if (idMap[o.stencilId]) {
          const hM = o.towerHeightM || o.customProps?.towerHeightM;
          if (
            hM &&
            (o.stencilId.includes('tower') ||
              o.stencilId.includes('monopole') ||
              o.stencilId.includes('guyed') ||
              o.stencilId.includes('rooftop'))
          ) {
            return `${idMap[o.stencilId]} (${hM}m)`;
          }
          return idMap[o.stencilId];
        }
        return o.stencilId.replace(/-/g, ' ').toUpperCase();
      }
      if (o.text) return o.text.trim();
    }
  }
  return `${fallback} (${(pt.x / scaleFactor).toFixed(1)}m)`;
}
