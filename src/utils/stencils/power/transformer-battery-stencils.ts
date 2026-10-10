import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const TRANSFORMER_BATTERY_STENCILS: StencilDefinition[] = [
  {
    id: 'transformer',
    name: 'Transformer',
    category: 'power',
    description: 'Tank + 3 red HV bushings + 2 blue LV bushings + radiator fins',
    defaultWidth: 90,
    defaultHeight: 70,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 90;
      const h = 70;
      const tankW = 60;
      const tankH = 46;
      const ox = (w - tankW) / 2;
      const oy = (h - tankH) / 2;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'transformer',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#f97316',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'transformer' },
        children: [
          // Radiator Fins Left
          {
            id: uid(),
            type: 'rectangle',
            x: ox - 10,
            y: oy + 4,
            width: 10,
            height: tankH - 8,
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
          // Radiator Fins Right
          {
            id: uid(),
            type: 'rectangle',
            x: ox + tankW,
            y: oy + 4,
            width: 10,
            height: tankH - 8,
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
          // Main Tank
          {
            id: uid(),
            type: 'rectangle',
            x: ox,
            y: oy,
            width: tankW,
            height: tankH,
            stroke: '#f97316',
            strokeWidth: 2,
            fill: '#1e293b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // 3 Red HV Bushings (Top)
          ...[14, 30, 46].map((bx) => ({
            id: uid(),
            type: 'circle' as const,
            x: ox + bx - 4,
            y: oy - 6,
            width: 8,
            height: 8,
            stroke: '#ef4444',
            strokeWidth: 2,
            fill: '#dc2626',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          })),
          // 2 Blue LV Bushings (Bottom)
          ...[20, 40].map((bx) => ({
            id: uid(),
            type: 'circle' as const,
            x: ox + bx - 4,
            y: oy + tankH - 2,
            width: 8,
            height: 8,
            stroke: '#38bdf8',
            strokeWidth: 2,
            fill: '#0284c7',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          })),
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 30,
        y: origin.y + h / 2 - 9,
        width: 60,
        height: 18,
        text: 'TX PAD',
        fontSize: 10,
        bold: true,
        textColor: '#f97316',
        bgColor: '#0f172a',
        stroke: '#ea580c',
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
    id: 'battery-bank',
    name: 'Battery Bank',
    category: 'power',
    description: '4 cells with +/− terminals and cell numbers',
    defaultWidth: 100,
    defaultHeight: 50,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 100;
      const h = 50;
      const cellW = (w - 10) / 4;

      const cells: CADObject[] = [];
      for (let i = 0; i < 4; i++) {
        const cx = 5 + i * cellW;
        cells.push(
          {
            id: uid(),
            type: 'rectangle',
            x: cx + 2,
            y: 6,
            width: cellW - 4,
            height: h - 12,
            stroke: '#10b981',
            strokeWidth: 1.5,
            fill: '#064e3b',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
          // Terminal (+)
          {
            id: uid(),
            type: 'circle',
            x: cx + 4,
            y: 10,
            width: 4,
            height: 4,
            stroke: '#ef4444',
            strokeWidth: 1,
            fill: '#ef4444',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Terminal (-)
          {
            id: uid(),
            type: 'circle',
            x: cx + cellW - 8,
            y: 10,
            width: 4,
            height: 4,
            stroke: '#38bdf8',
            strokeWidth: 1,
            fill: '#38bdf8',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          }
        );
      }

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'battery-bank',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#10b981',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'battery-bank' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#10b981',
            strokeWidth: 2,
            fill: '#022c22',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          ...cells,
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 35,
        y: origin.y + h + 4,
        width: 70,
        height: 16,
        text: '48V DC BANK',
        fontSize: 9,
        bold: true,
        textColor: '#10b981',
        bgColor: '#0f172a',
        stroke: '#047857',
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
