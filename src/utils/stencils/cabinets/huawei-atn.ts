import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export interface HuaweiATNModelConfig {
  id: string;
  model: string;
  series: '910' | '950' | '980';
  uHeight: number;
  height: number;
  badge: string;
  description: string;
  portRows: number;
  portsPerRow: number;
  hasQuadFans?: boolean;
}

const ATN_MODELS: HuaweiATNModelConfig[] = [
  {
    id: 'huawei-atn-910a',
    model: 'ATN 910A',
    series: '910',
    uHeight: 1,
    height: 24,
    badge: 'ATN 910A',
    description:
      'Huawei ATN 910A 1U compact IP RAN cell-site router with redundant DC power, fixed GE/10GE interfaces, optical transceivers, and IEEE 1588v2 sync',
    portRows: 1,
    portsPerRow: 8,
  },
  {
    id: 'huawei-atn-910b',
    model: 'ATN 910B',
    series: '910',
    uHeight: 1,
    height: 24,
    badge: 'ATN 910B',
    description:
      'Huawei ATN 910B 1U multiservice access router with enhanced 10GE SFP+ line ports, redundant DC power, and high-capacity carrier forwarding',
    portRows: 1,
    portsPerRow: 10,
  },
  {
    id: 'huawei-atn-910c',
    model: 'ATN 910C',
    series: '910',
    uHeight: 1,
    height: 24,
    badge: 'ATN 910C',
    description:
      'Huawei ATN 910C 1U 5G next-generation multiservice router with 25GE/50GE/100GE high-speed interfaces, flex-E network slicing, and dual DC feeds',
    portRows: 1,
    portsPerRow: 12,
  },
  {
    id: 'huawei-atn-950a',
    model: 'ATN 950A',
    series: '950',
    uHeight: 2,
    height: 30,
    badge: 'ATN 950A',
    description:
      'Huawei ATN 950A 2U modular IP RAN multiservice router with 6 service subcard slots, dual main control boards, and dual DC power supply modules',
    portRows: 2,
    portsPerRow: 8,
  },
  {
    id: 'huawei-atn-950b',
    model: 'ATN 950B',
    series: '950',
    uHeight: 2,
    height: 30,
    badge: 'ATN 950B',
    description:
      'Huawei ATN 950B 2U high-capacity modular multiservice aggregation router with redundant CXP control units, 10GE/40GE/100GE line cards, and fan tray',
    portRows: 2,
    portsPerRow: 10,
  },
  {
    id: 'huawei-atn-950c',
    model: 'ATN 950C',
    series: '950',
    uHeight: 2,
    height: 32,
    badge: 'ATN 950C',
    description:
      'Huawei ATN 950C 2U high-density broadband aggregation router supporting 50GE/100GE line rates, SRv6 programmability, and redundant power & cooling',
    portRows: 2,
    portsPerRow: 12,
  },
  {
    id: 'huawei-atn-980a',
    model: 'ATN 980A',
    series: '980',
    uHeight: 3,
    height: 34,
    badge: 'ATN 980A',
    description:
      'Huawei ATN 980A 3U carrier-grade multiservice aggregation router with high-density modular PIC slots, dual control boards, and high-performance fan unit',
    portRows: 3,
    portsPerRow: 10,
  },
  {
    id: 'huawei-atn-980b',
    model: 'ATN 980B',
    series: '980',
    uHeight: 4,
    height: 36,
    badge: 'ATN 980B',
    description:
      'Huawei ATN 980B 4U aggregation gateway router platform with 100GE/200GE optical uplinks, multi-terabit switching fabric, and redundant DC feeds',
    portRows: 3,
    portsPerRow: 12,
  },
  {
    id: 'huawei-atn-980c',
    model: 'ATN 980C',
    series: '980',
    uHeight: 5,
    height: 40,
    badge: 'ATN 980C',
    description:
      'Huawei ATN 980C 5U flagship multiservice aggregation gateway router with high-density 100GE/400GE ports, multi-slot architecture, and intelligent telemetry',
    portRows: 4,
    portsPerRow: 12,
    hasQuadFans: true,
  },
];

function createHuaweiATNObjects(config: HuaweiATNModelConfig, origin: Point): CADObject[] {
  const parentId = uid();
  const w = 42;
  const h = config.height;

  const mainGroup: CADObject = {
    id: parentId,
    type: 'stencil-group',
    stencilId: config.id,
    isStencil: true,
    x: origin.x,
    y: origin.y,
    width: w,
    height: h,
    stroke: '#475569',
    strokeWidth: 1.8,
    fill: '#1e293b',
    fillEnabled: true,
    fillOpacity: 1,
    opacity: 1,
    customProps: {
      stencilType: config.id,
      brand: 'huawei',
      model: config.model,
      series: `ATN-${config.series}`,
      category: 'transport-router',
      uHeight: config.uHeight,
    },
    children: [
      // Main carrier metal chassis body
      {
        id: uid(),
        type: 'rectangle',
        x: 0,
        y: 0,
        width: w,
        height: h,
        stroke: '#64748b',
        strokeWidth: 1.5,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Left & Right 19" rack mount ears
      {
        id: uid(),
        type: 'rectangle',
        x: -2,
        y: 0,
        width: 2,
        height: h,
        stroke: '#475569',
        strokeWidth: 1,
        fill: '#334155',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      {
        id: uid(),
        type: 'rectangle',
        x: w,
        y: 0,
        width: 2,
        height: h,
        stroke: '#475569',
        strokeWidth: 1,
        fill: '#334155',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Top bezel bar with Huawei dark slate header
      {
        id: uid(),
        type: 'rectangle',
        x: 1,
        y: 1,
        width: w - 2,
        height: 5,
        stroke: '#334155',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Huawei red petal logo dot
      {
        id: uid(),
        type: 'circle',
        x: 4.5,
        y: 3.5,
        width: 2.8,
        height: 2.8,
        stroke: '#dc2626',
        strokeWidth: 1,
        fill: '#ef4444',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Dual Redundant DC Power Supplies (PWR1, PWR2)
      {
        id: uid(),
        type: 'rectangle',
        x: 2,
        y: 7,
        width: 8,
        height: h - 9,
        stroke: '#475569',
        strokeWidth: 1,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Power status LEDs
      {
        id: uid(),
        type: 'circle',
        x: 4.5,
        y: 9.5,
        width: 1.8,
        height: 1.8,
        stroke: '#22c55e',
        strokeWidth: 0.6,
        fill: '#4ade80',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      {
        id: uid(),
        type: 'circle',
        x: 4.5,
        y: Math.min(15, h - 5),
        width: 1.8,
        height: 1.8,
        stroke: '#22c55e',
        strokeWidth: 0.6,
        fill: '#4ade80',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Modular Service Cards / Optical Interface Cage
      {
        id: uid(),
        type: 'rectangle',
        x: 11.5,
        y: 7,
        width: 21,
        height: h - 9,
        stroke: '#3b82f6',
        strokeWidth: 0.8,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      // Optical ports rows (SFP cages)
      ...Array.from({ length: config.portRows }).map((_, rIdx) => {
        const rowH = 3.2;
        const spacing = (h - 11) / Math.max(config.portRows, 1);
        const py = 8 + rIdx * spacing;
        return {
          id: uid(),
          type: 'rectangle' as const,
          x: 13,
          y: py,
          width: 18,
          height: rowH,
          stroke: '#60a5fa',
          strokeWidth: 0.8,
          fill: '#1e293b',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        };
      }),
      // Fan Tray Unit (Right side exhaust with louvers)
      {
        id: uid(),
        type: 'rectangle',
        x: 33.5,
        y: 7,
        width: 6.5,
        height: h - 9,
        stroke: '#475569',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
      },
      ...[9, 13, 17, 21, 25, 29]
        .filter((fy) => fy < h - 3)
        .map((fy) => ({
          id: uid(),
          type: 'line' as const,
          x: 34.5,
          y: fy,
          x2: 38.5,
          y2: fy,
          width: 0,
          height: 0,
          stroke: '#64748b',
          strokeWidth: 0.8,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        })),
    ],
  };

  const label: CADObject = {
    id: uid(),
    type: 'text',
    x: origin.x + w / 2 - 32,
    y: origin.y + h + 2,
    width: 64,
    height: 14,
    text: `HUAWEI ${config.model}`,
    fontSize: 7.5,
    bold: true,
    textColor: '#0f172a',
    bgColor: '#ffffff',
    stroke: '#cbd5e1',
    strokeWidth: 1,
    fill: '#ffffff',
    fillEnabled: true,
    fillOpacity: 0.95,
    opacity: 1,
    isStencilLabel: true,
    parentId: parentId,
  };

  return [mainGroup, label];
}

export const HUAWEI_ATN_CABINETS: StencilDefinition[] = [
  ...ATN_MODELS.map((config) => ({
    id: config.id,
    name: `Huawei ${config.model}`,
    category: 'equipments' as const,
    badge: config.badge,
    description: config.description,
    defaultWidth: 42,
    defaultHeight: config.height,
    createObjects: (origin: Point) => createHuaweiATNObjects(config, origin),
  })),
  // Backward compatibility alias for 'huawei-atn-series'
  {
    id: 'huawei-atn-series',
    name: 'Huawei ATN Series (ATN 950B)',
    category: 'equipments' as const,
    badge: 'Huawei ATN',
    description:
      'Huawei ATN series multiservice 10GE/GE IP RAN router & cell-site gateway subrack with redundant DC power and modular slots',
    defaultWidth: 42,
    defaultHeight: 30,
    createObjects: (origin: Point) =>
      createHuaweiATNObjects(
        ATN_MODELS.find((m) => m.id === 'huawei-atn-950b') || ATN_MODELS[4],
        origin
      ),
  },
];

export const HUAWEI_ATN_STENCILS = HUAWEI_ATN_CABINETS;
