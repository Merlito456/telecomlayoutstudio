import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export const RELAY_WALL_RACK_STENCILS: StencilDefinition[] = [
  {
    id: 'rack-open-2post',
    name: '2-Post Relay Telecom Rack',
    category: 'racks',
    description:
      'Lightweight aluminum 19-inch 2-post relay rack with vertical cable management fingers',
    defaultWidth: 40,
    defaultHeight: 22,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 40;
      const h = 22;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rack-open-2post',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#38bdf8',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'rack-open-2post' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#38bdf8',
            strokeWidth: 2,
            fill: '#1e293b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 24,
        y: origin.y + h / 2 - 8,
        width: 48,
        height: 16,
        text: '2-POST RACK',
        fontSize: 7.5,
        bold: true,
        textColor: '#38bdf8',
        bgColor: '#0f172a',
        stroke: '#0284c7',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },
  {
    id: 'rack-open-4post',
    name: '4-Post Open Frame Rack',
    category: 'racks',
    description:
      'Heavy duty steel 4-post open frame equipment rack with adjustable mounting depth (600-900mm)',
    defaultWidth: 40,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 40;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rack-open-4post',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#94a3b8',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'rack-open-4post' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#94a3b8',
            strokeWidth: 2,
            fill: '#1e293b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 24,
        y: origin.y + h / 2 - 8,
        width: 48,
        height: 16,
        text: '4-POST RACK',
        fontSize: 7.5,
        bold: true,
        textColor: '#cbd5e1',
        bgColor: '#0f172a',
        stroke: '#64748b',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },
  {
    id: 'rack-wall-12u',
    name: '12U Wall-Mount Network Cabinet',
    category: 'racks',
    description:
      '12U Hinged Wall-Mount Swing-Out Network Enclosure for patch panels, switch, and router',
    defaultWidth: 35,
    defaultHeight: 25,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 35;
      const h = 25;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rack-wall-12u',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#06b6d4',
        strokeWidth: 2,
        fill: '#164e63',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'rack-wall-12u', placement: 'wall-mount' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#06b6d4',
            strokeWidth: 2,
            fill: '#164e63',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 20,
        y: origin.y + h / 2 - 8,
        width: 40,
        height: 16,
        text: '12U WALL',
        fontSize: 7.5,
        bold: true,
        textColor: '#22d3ee',
        bgColor: '#083344',
        stroke: '#0891b2',
        strokeWidth: 1,
        fill: '#083344',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },
  {
    id: 'rack-bbu-radio',
    name: '42U BBU Radio Access Rack',
    category: 'equipments',
    description:
      '42U Baseband Unit (BBU / DDF) cellular radio rack with CPRI optical fiber management, DC power distribution, and GPS splitters',
    defaultWidth: 40,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 40;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rack-bbu-radio',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#06b6d4',
        strokeWidth: 2,
        fill: '#083344',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        customProps: { stencilType: 'rack-bbu-radio', uHeight: 42, widthMm: 600, depthMm: 800 },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#06b6d4',
            strokeWidth: 2,
            fill: '#155e75',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 26,
        y: origin.y + h / 2 - 8,
        width: 52,
        height: 16,
        text: 'BBU RADIO',
        fontSize: 7.5,
        bold: true,
        textColor: '#22d3ee',
        bgColor: '#083344',
        stroke: '#0891b2',
        strokeWidth: 1,
        fill: '#083344',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },
  {
    id: 'rack-center-2post',
    name: '45U Heavy Center-Mount 2-Post Rack',
    category: 'racks',
    badge: '45U Center',
    description: '45U center-balanced heavy-duty 2-post open relay frame with dual-sided vertical managers',
    defaultWidth: 26,
    defaultHeight: 18,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 26;
      const h = 18;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rack-center-2post',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#7dd3fc',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: {
          stencilType: 'rack-center-2post',
          uHeight: 45,
          widthMm: 600,
          depthMm: 450,
          heightMm: 2135,
        },
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 42,
        y: origin.y + h + 4,
        width: 84,
        height: 15,
        text: '45U 2-POST',
        fontSize: 8.5,
        bold: true,
        textColor: '#7dd3fc',
        bgColor: '#0f172a',
        stroke: '#0284c7',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId,
      };
      return [mainGroup, label];
    },
  },
  {
    id: 'rack-wall-18u',
    name: '18U Hinged Wall-Mount Rack',
    category: 'racks',
    badge: 'Wall 18U',
    description: 'Deep 18U wall-mounted hinged telecom enclosure for RTU, alarm panels, and switches',
    defaultWidth: 24,
    defaultHeight: 22,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 24;
      const h = 22;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rack-wall-18u',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#22d3ee',
        strokeWidth: 1.8,
        fill: '#164e63',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: {
          stencilType: 'rack-wall-18u',
          uHeight: 18,
          widthMm: 600,
          depthMm: 600,
          heightMm: 900,
        },
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 40,
        y: origin.y + h + 4,
        width: 80,
        height: 15,
        text: '18U WALL RACK',
        fontSize: 8,
        bold: true,
        textColor: '#22d3ee',
        bgColor: '#0f172a',
        stroke: '#0891b2',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId,
      };
      return [mainGroup, label];
    },
  },
];
