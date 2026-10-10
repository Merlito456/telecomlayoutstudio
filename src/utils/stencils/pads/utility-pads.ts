import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export const UTILITY_PADS: StencilDefinition[] = [
  {
    id: 'gen-basepad',
    name: 'Gen Basepad',
    category: 'pads',
    description: '4×2.6m tan concrete generator foundation pad (Stretchable along X)',
    defaultWidth: 140,
    defaultHeight: 90,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 140;
      const h = 90;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'gen-basepad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#d97706',
        strokeWidth: 2,
        fill: '#78350f',
        fillEnabled: true,
        fillOpacity: 0.5,
        opacity: 1,
        customProps: { stencilType: 'gen-basepad' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#d97706',
            strokeWidth: 2,
            fill: '#78350f',
            fillEnabled: true,
            fillOpacity: 0.5,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 40,
        y: origin.y + h / 2 - 9,
        width: 80,
        height: 18,
        text: 'GEN BASEPAD',
        fontSize: 10,
        bold: true,
        textColor: '#fcd34d',
        bgColor: '#451a03',
        stroke: '#d97706',
        strokeWidth: 1,
        fill: '#451a03',
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
    id: 'tx-basepad',
    name: 'TX Basepad',
    category: 'pads',
    description: '2.2×2.2m orange-brown transformer foundation pad (Stretchable along X)',
    defaultWidth: 90,
    defaultHeight: 90,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const s = 90;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'tx-basepad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: s,
        baseHeight: s,
        x: origin.x,
        y: origin.y,
        width: s,
        height: s,
        stroke: '#ea580c',
        strokeWidth: 2,
        fill: '#7c2d12',
        fillEnabled: true,
        fillOpacity: 0.6,
        opacity: 1,
        customProps: { stencilType: 'tx-basepad' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: s,
            height: s,
            stroke: '#ea580c',
            strokeWidth: 2,
            fill: '#7c2d12',
            fillEnabled: true,
            fillOpacity: 0.6,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + s / 2 - 35,
        y: origin.y + s / 2 - 9,
        width: 70,
        height: 18,
        text: 'TX BASEPAD',
        fontSize: 10,
        bold: true,
        textColor: '#fdba74',
        bgColor: '#431407',
        stroke: '#ea580c',
        strokeWidth: 1,
        fill: '#431407',
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
    id: 'ac-basepad',
    name: 'AC Basepad',
    category: 'pads',
    description: '1.4×1m light-blue condenser basepad (Stretchable along X)',
    defaultWidth: 70,
    defaultHeight: 50,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 70;
      const h = 50;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'ac-basepad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#0284c7',
        strokeWidth: 2,
        fill: '#0369a1',
        fillEnabled: true,
        fillOpacity: 0.4,
        opacity: 1,
        customProps: { stencilType: 'ac-basepad' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#0284c7',
            strokeWidth: 2,
            fill: '#0369a1',
            fillEnabled: true,
            fillOpacity: 0.4,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 30,
        y: origin.y + h / 2 - 9,
        width: 60,
        height: 18,
        text: 'AC BASE',
        fontSize: 9,
        bold: true,
        textColor: '#38bdf8',
        bgColor: '#082f49',
        stroke: '#0284c7',
        strokeWidth: 1,
        fill: '#082f49',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  },
];
