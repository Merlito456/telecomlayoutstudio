import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export const STANDARD_PADS: StencilDefinition[] = [
  {
    id: 'cement-basepad',
    name: 'Cement Basepad',
    category: 'pads',
    description: '3×3m concrete hatched pad with corner brackets (Stretchable along X)',
    defaultWidth: 120,
    defaultHeight: 80,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 120;
      const h = 80;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'cement-basepad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#7c7c74',
        strokeWidth: 2,
        fill: '#a8a89e',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
        customProps: { stencilType: 'cement-basepad' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#7c7c74',
            strokeWidth: 2,
            fill: '#a8a89e',
            fillEnabled: true,
            fillOpacity: 1,
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
        text: 'CONCRETE PAD',
        fontSize: 10,
        bold: true,
        textColor: '#e2e8f0',
        bgColor: '#1e293b',
        stroke: '#475569',
        strokeWidth: 1,
        fill: '#1e293b',
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
    id: 'ground-stairs-3step',
    name: '3-Steps Ground Stairs',
    category: 'pads',
    description: 'Standard 3-step concrete access stairs with anti-slip nosings designed specifically for ground basepad elevation transitions',
    defaultWidth: 70,
    defaultHeight: 45,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 70;
      const h = 45;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'ground-stairs-3step',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#7c7c74',
        strokeWidth: 2,
        fill: '#a8a89e',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: {
          stencilType: 'ground-stairs-3step',
          stepsCount: 3,
          hasHandrails: true,
        },
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 35,
        y: origin.y + h + 4,
        width: 70,
        height: 16,
        text: '3-STEP STAIRS',
        fontSize: 9,
        bold: true,
        textColor: '#cbd5e1',
        bgColor: '#0f172a',
        stroke: '#475569',
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
];
