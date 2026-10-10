/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, Point, StencilDefinition } from '../../types/cad';
import { uid } from './common';
import { HUAWEI_ATN_STENCILS } from './cabinets/huawei-atn';
import { POWER_RACK_STENCILS } from './racks/power-racks';

// Factory for discrete rack-mountable telecommunication equipment stencils
function createChassisEquipment(params: {
  id: string;
  name: string;
  uHeight: number;
  widthMm?: number;
  depthMm?: number;
  badge: string;
  description: string;
  color: string;
  strokeColor: string;
  ledColor?: string;
  portType?: 'rj45' | 'lc-fiber' | 'sc-fiber' | 'dc-terminal' | 'ac-socket';
  portCount?: number;
  brand?: string;
  categoryTag?: string;
}): StencilDefinition {
  const defaultW = 42; // Standard 19" chassis width in canvas units
  const defaultH = Math.max(14, params.uHeight * 8 + 6);

  return {
    id: params.id,
    name: params.name,
    category: 'equipments',
    badge: params.badge,
    description: params.description,
    defaultWidth: defaultW,
    defaultHeight: defaultH,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = defaultW;
      const h = defaultH;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: params.id,
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: params.strokeColor,
        strokeWidth: 1.8,
        fill: params.color,
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
        customProps: {
          stencilType: params.id,
          uHeight: params.uHeight,
          brand: params.brand || 'Telecom',
          category: params.categoryTag || 'equipment',
          widthMm: params.widthMm || 482.6,
          depthMm: params.depthMm || 350,
        },
        children: [
          // Main Metal Chassis Body
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: params.strokeColor,
            strokeWidth: 1.5,
            fill: params.color,
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Left 19" EIA Rack Mount Ear
          {
            id: uid(),
            type: 'rectangle',
            x: -2.5,
            y: 0,
            width: 2.5,
            height: h,
            stroke: '#64748b',
            strokeWidth: 1,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Right 19" EIA Rack Mount Ear
          {
            id: uid(),
            type: 'rectangle',
            x: w,
            y: 0,
            width: 2.5,
            height: h,
            stroke: '#64748b',
            strokeWidth: 1,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Status LED indicator
          {
            id: uid(),
            type: 'circle',
            x: 3,
            y: h / 2 - 2,
            width: 4,
            height: 4,
            stroke: params.ledColor || '#22c55e',
            strokeWidth: 1,
            fill: params.ledColor || '#22c55e',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Faceplate interface area / port bezel
          {
            id: uid(),
            type: 'rectangle',
            x: 10,
            y: 3,
            width: w - 14,
            height: h - 6,
            stroke: '#334155',
            strokeWidth: 1,
            fill: '#090d16',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 28,
        y: origin.y + h + 2,
        width: 56,
        height: 14,
        text: params.badge,
        fontSize: 7.5,
        bold: true,
        textColor: '#f8fafc',
        bgColor: '#0f172a',
        stroke: params.strokeColor,
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        isStencilLabel: true,
        parentId,
      };

      return [mainGroup, label];
    },
  };
}

export const DISCRETE_EQUIPMENT_STENCILS: StencilDefinition[] = [
  // --- Network Switches & Routers ---
  createChassisEquipment({
    id: 'eq-switch-tor-48p',
    name: '1U 48-Port 10G/25G ToR Switch',
    uHeight: 1,
    depthMm: 450,
    badge: '48P TOR SW',
    description: '1U Top-of-Rack data center switch with 48x 10G/25G SFP28 and 6x 100G QSFP28 uplinks',
    color: '#1e3a8a',
    strokeColor: '#60a5fa',
    ledColor: '#22c55e',
    portType: 'rj45',
    portCount: 48,
    categoryTag: 'switch',
  }),
  createChassisEquipment({
    id: 'eq-core-switch-2u',
    name: '2U Carrier Aggregation Switch',
    uHeight: 2,
    depthMm: 500,
    badge: '2U CORE SW',
    description: '2U High-capacity carrier aggregation switch with redundant power supplies and telemetry',
    color: '#1e293b',
    strokeColor: '#38bdf8',
    ledColor: '#38bdf8',
    portType: 'lc-fiber',
    portCount: 32,
    categoryTag: 'switch',
  }),
  createChassisEquipment({
    id: 'eq-bbu-5g-radio',
    name: '1U 5G Baseband Unit (BBU)',
    uHeight: 1,
    depthMm: 380,
    badge: '5G BBU',
    description: '1U Next-generation 5G NR / LTE Baseband Unit with CPRI / eCPRI fronthaul ports and redundant DC feeds',
    color: '#064e3b',
    strokeColor: '#34d399',
    ledColor: '#10b981',
    portType: 'lc-fiber',
    portCount: 8,
    categoryTag: 'bbu',
  }),
  createChassisEquipment({
    id: 'eq-bbu-dual-2u',
    name: '2U Multi-Carrier Baseband Hub',
    uHeight: 2,
    depthMm: 400,
    badge: '2U BBU HUB',
    description: '2U Dual Baseband subrack for 2G/3G/4G/5G multi-standard carrier sites with GPS sync',
    color: '#042f2e',
    strokeColor: '#2dd4bf',
    ledColor: '#14b8a6',
    categoryTag: 'bbu',
  }),
  createChassisEquipment({
    id: 'eq-cell-site-gateway-3u',
    name: '3U Cell-Site Gateway Router',
    uHeight: 3,
    depthMm: 420,
    badge: '3U CSG ROUTER',
    description: '3U Carrier IP RAN Cell-Site Gateway Router with SRv6, EVPN, and modular optical interface cards',
    color: '#0f172a',
    strokeColor: '#818cf8',
    ledColor: '#a855f7',
    categoryTag: 'router',
  }),

  // --- Patch Panels & Optical Distribution ---
  createChassisEquipment({
    id: 'eq-patch-cat6a-48p',
    name: '1U 48-Port Cat6A Patch Panel',
    uHeight: 1,
    depthMm: 120,
    badge: '48P CAT6A PP',
    description: '1U 48-Port Shielded Cat6A RJ45 Keystone Patch Panel with rear cable management bar',
    color: '#0f172a',
    strokeColor: '#64748b',
    ledColor: '#94a3b8',
    portType: 'rj45',
    portCount: 48,
    categoryTag: 'patch-panel',
  }),
  createChassisEquipment({
    id: 'eq-odf-fiber-24p',
    name: '1U 24-Port LC Duplex ODF Fiber Shelf',
    uHeight: 1,
    depthMm: 280,
    badge: '24P LC ODF',
    description: '1U Sliding optical distribution frame with 24 LC-duplex couplers (48 fibers) & splice tray',
    color: '#0c4a6e',
    strokeColor: '#38bdf8',
    ledColor: '#0284c7',
    portType: 'lc-fiber',
    portCount: 24,
    categoryTag: 'fiber-shelf',
  }),
  createChassisEquipment({
    id: 'eq-odf-48p-2u',
    name: '2U 48-Port High-Density ODF Drawer',
    uHeight: 2,
    depthMm: 300,
    badge: '48P LC 2U ODF',
    description: '2U High-density 96-fiber optical distribution drawer with radius management mandrels',
    color: '#082f49',
    strokeColor: '#0ea5e9',
    ledColor: '#38bdf8',
    portType: 'lc-fiber',
    portCount: 48,
    categoryTag: 'fiber-shelf',
  }),
  createChassisEquipment({
    id: 'eq-dwdm-mux-3u',
    name: '3U 40-Channel DWDM Mux/Demux Unit',
    uHeight: 3,
    depthMm: 350,
    badge: '40CH DWDM MUX',
    description: '3U Dense Wavelength Division Multiplexing optical passive chassis for fiber capacity expansion',
    color: '#311042',
    strokeColor: '#c084fc',
    ledColor: '#e879f9',
    categoryTag: 'optical',
  }),

  // --- Power & Distribution Equipments ---
  createChassisEquipment({
    id: 'eq-pdu-dc-1u',
    name: '1U Dual -48V DC Distribution PDU',
    uHeight: 1,
    depthMm: 220,
    badge: '1U DC PDU',
    description: 'Dual-feed -48V DC rack power distribution panel with 12 miniature circuit breakers & alarm shunts',
    color: '#4c0519',
    strokeColor: '#f43f5e',
    ledColor: '#f43f5e',
    portType: 'dc-terminal',
    portCount: 12,
    categoryTag: 'power',
  }),
  createChassisEquipment({
    id: 'eq-rectifier-shelf-2u',
    name: '2U Modular Rectifier Shelf (Flatpack2)',
    uHeight: 2,
    depthMm: 380,
    badge: '2U RECTIFIER',
    description: '2U Compact -48V DC telecom power shelf housing up to 4x Flatpack2 rectifiers + Smartpack controller',
    color: '#1e1b1b',
    strokeColor: '#ef4444',
    ledColor: '#22c55e',
    categoryTag: 'power',
  }),
  createChassisEquipment({
    id: 'eq-ups-inverter-2u',
    name: '2U Online Rack UPS / Inverter (3kVA)',
    uHeight: 2,
    depthMm: 600,
    badge: '2U UPS 3kVA',
    description: '2U 3000VA True online double-conversion rackmount UPS with pure sine wave output and battery pack port',
    color: '#172554',
    strokeColor: '#3b82f6',
    ledColor: '#60a5fa',
    categoryTag: 'power',
  }),
  createChassisEquipment({
    id: 'eq-battery-pack-4u',
    name: '4U LiFePO4 100Ah Rack Battery Pack',
    uHeight: 4,
    depthMm: 500,
    badge: '48V 100Ah LFP',
    description: '4U -48V 100Ah Lithium Iron Phosphate (LiFePO4) rack-mounted battery module with built-in smart BMS',
    color: '#14532d',
    strokeColor: '#22c55e',
    ledColor: '#4ade80',
    categoryTag: 'battery',
  }),
  createChassisEquipment({
    id: 'eq-cable-brush-1u',
    name: '1U Horizontal Cable Brush & Ring Manager',
    uHeight: 1,
    depthMm: 80,
    badge: '1U CABLE MGR',
    description: '1U Horizontal cable management panel with high-density nylon brush strip and 5 D-rings',
    color: '#18181b',
    strokeColor: '#52525b',
    categoryTag: 'accessories',
  }),
];

// All equipment relocated from Racks + dedicated telecom equipment units
export const ALL_EQUIPMENT_STENCILS: StencilDefinition[] = [
  ...HUAWEI_ATN_STENCILS,
  ...POWER_RACK_STENCILS,
  ...DISCRETE_EQUIPMENT_STENCILS,
];
