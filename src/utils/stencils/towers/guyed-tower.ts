import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const GUYED_TOWER_STENCILS: StencilDefinition[] = [
  {
    id: 'guyed-tower',
    name: 'Guyed Tower (1 Main Leg Central Mast)',
    category: 'tower',
    badge: '1-Leg Mast + Guys',
    description: '1 main leg (a single central mast) supported by multiple steel cables anchored to the ground. Central pivot base with 3 ground guy anchor blocks.',
    defaultWidth: 180,
    defaultHeight: 180,
    createObjects: (origin: Point, scale?: number): CADObject[] => {
      const parentId = uid();
      const s = 180;
      const center = s / 2;
      const mastR = 14;
      const anchorR = 75;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'guyed-tower',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: s,
        height: s,
        stroke: '#38bdf8',
        strokeWidth: 2,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 1,
        customProps: { stencilType: 'guyed-tower', guyRadius: 75, towerHeightM: 35, isTower: true },
        towerHeightM: 35,
        children: [
          // Central Triangular Mast Body
          {
            id: uid(),
            type: 'circle',
            x: center - mastR,
            y: center - mastR,
            width: mastR * 2,
            height: mastR * 2,
            stroke: '#f59e0b',
            strokeWidth: 2,
            fill: '#78350f',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          // 3 Guy Wire Radial Cables (Inner & Outer)
          ...[-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6].flatMap((ang) => {
            const cos = Math.cos(ang);
            const sin = Math.sin(ang);
            const ax = center + cos * anchorR;
            const ay = center + sin * anchorR;
            return [
              {
                id: uid(),
                type: 'line' as const,
                x: center + cos * mastR,
                y: center + sin * mastR,
                x2: ax,
                y2: ay,
                width: 0,
                height: 0,
                stroke: '#38bdf8',
                strokeWidth: 1.8,
                strokeDash: [4, 2],
                fill: 'transparent',
                fillEnabled: false,
                fillOpacity: 0,
                opacity: 0.9,
              },
              {
                id: uid(),
                type: 'rectangle' as const,
                x: ax - 8,
                y: ay - 8,
                width: 16,
                height: 16,
                stroke: '#cbd5e1',
                strokeWidth: 1.5,
                fill: '#475569',
                fillEnabled: true,
                fillOpacity: 1,
                opacity: 1,
              },
            ];
          }),
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + s / 2 - 55,
        y: origin.y - 18,
        width: 110,
        height: 18,
        text: 'GUYED TOWER (1-LEG)',
        fontSize: 9,
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
    id: 'guy-anchor',
    name: 'Guy Anchor',
    category: 'tower',
    description: 'Concrete block with eye bolt and turnbuckle attachment',
    defaultWidth: 40,
    defaultHeight: 40,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const s = 40;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'guy-anchor',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: s,
        height: s,
        stroke: '#cbd5e1',
        strokeWidth: 2,
        fill: '#334155',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'guy-anchor' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: s,
            height: s,
            stroke: '#cbd5e1',
            strokeWidth: 2,
            fill: '#475569',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Steel Eye bolt
          {
            id: uid(),
            type: 'circle',
            x: s / 2 - 7,
            y: s / 2 - 7,
            width: 14,
            height: 14,
            stroke: '#f59e0b',
            strokeWidth: 2.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + s / 2 - 25,
        y: origin.y + s + 4,
        width: 50,
        height: 16,
        text: 'ANCHOR',
        fontSize: 9,
        bold: true,
        textColor: '#f59e0b',
        bgColor: '#0f172a',
        stroke: '#d97706',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.8,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  }
];
