import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const ROOFTOP_STENCILS: StencilDefinition[] = [
  {
    id: 'rooftop-mount',
    name: 'Rooftop Mount (Ballasted Frame)',
    category: 'tower',
    badge: 'No Traditional Legs',
    description: 'No traditional legs. Uses a steel frame or ballast mount bolted directly onto a building flat concrete roof with precast concrete blocks.',
    defaultWidth: 120,
    defaultHeight: 120,
    createObjects: (origin: Point, scale: number): CADObject[] => {
      const parentId = uid();
      const s = 120;
      const center = s / 2;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rooftop-mount',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: s,
        height: s,
        stroke: '#38bdf8',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.6,
        opacity: 1,
        customProps: { stencilType: 'rooftop-mount', ballastBlocksCount: 8, towerHeightM: 6, isTower: true },
        towerHeightM: 6,
        children: [
          // Base Skid Frame
          {
            id: uid(),
            type: 'rectangle',
            x: 8,
            y: 8,
            width: s - 16,
            height: s - 16,
            stroke: '#64748b',
            strokeWidth: 2,
            fill: '#0f172a',
            fillEnabled: true,
            fillOpacity: 0.7,
            opacity: 1,
          },
          // Center Mast Pipe
          {
            id: uid(),
            type: 'circle',
            x: center - 8,
            y: center - 8,
            width: 16,
            height: 16,
            stroke: '#38bdf8',
            strokeWidth: 2,
            fill: '#0284c7',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // 4 Corner Ballast Blocks
          ...[
            { x: 12, y: 12 },
            { x: s - 32, y: 12 },
            { x: 12, y: s - 32 },
            { x: s - 32, y: s - 32 },
          ].map((pt) => ({
            id: uid(),
            type: 'rectangle' as const,
            x: pt.x,
            y: pt.y,
            width: 20,
            height: 20,
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            fill: '#475569',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          })),
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + s / 2 - 50,
        y: origin.y + s + 4,
        width: 100,
        height: 16,
        text: 'ROOFTOP MOUNT',
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
    id: 'rooftop-parapet-mount',
    name: 'Rooftop Parapet / Wall Mount',
    category: 'tower',
    badge: 'Parapet Clamped',
    description: 'No traditional legs. Heavy steel brackets clamped and anchored directly to flat concrete rooftop perimeter parapet wall.',
    defaultWidth: 100,
    defaultHeight: 90,
    createObjects: (origin: Point, scale: number): CADObject[] => {
      const parentId = uid();
      const w = 100;
      const h = 90;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rooftop-parapet-mount',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#38bdf8',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.6,
        opacity: 1,
        customProps: { stencilType: 'rooftop-parapet-mount' },
        children: [
          // Parapet Wall Boundary
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: 24,
            stroke: '#94a3b8',
            strokeWidth: 2,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          // 2 Heavy Clamping Brackets
          {
            id: uid(),
            type: 'rectangle',
            x: 20,
            y: 18,
            width: 14,
            height: 36,
            stroke: '#cbd5e1',
            strokeWidth: 1.5,
            fill: '#475569',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          {
            id: uid(),
            type: 'rectangle',
            x: w - 34,
            y: 18,
            width: 14,
            height: 36,
            stroke: '#cbd5e1',
            strokeWidth: 1.5,
            fill: '#475569',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Horizontal Standoff Pipe
          {
            id: uid(),
            type: 'line',
            x: 15,
            y: 45,
            x2: w - 15,
            y2: 45,
            width: 0,
            height: 0,
            stroke: '#38bdf8',
            strokeWidth: 3,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
          },
          // Vertical Antenna Mast Pipe
          {
            id: uid(),
            type: 'circle',
            x: w / 2 - 7,
            y: 38,
            width: 14,
            height: 14,
            stroke: '#0284c7',
            strokeWidth: 2,
            fill: '#38bdf8',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Cellular Panel Antenna
          {
            id: uid(),
            type: 'rectangle',
            x: w / 2 - 16,
            y: 60,
            width: 32,
            height: 12,
            stroke: '#0284c7',
            strokeWidth: 1.5,
            fill: '#f8fafc',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 50,
        y: origin.y + h + 2,
        width: 100,
        height: 16,
        text: 'PARAPET MOUNT',
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
    id: 'tower-footing',
    name: 'Tower Footing',
    category: 'tower',
    description: 'Hatched concrete pad with 8-bolt anchor circle',
    defaultWidth: 60,
    defaultHeight: 60,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const s = 60;
      const center = s / 2;
      const boltRadius = 16;
      const bolts: CADObject[] = [];

      for (let i = 0; i < 8; i++) {
        const rad = (i * 2 * Math.PI) / 8;
        const bx = center + boltRadius * Math.cos(rad);
        const by = center + boltRadius * Math.sin(rad);
        bolts.push({
          id: uid(),
          type: 'circle',
          x: bx - 2.5,
          y: by - 2.5,
          width: 5,
          height: 5,
          stroke: '#cbd5e1',
          strokeWidth: 1.5,
          fill: '#475569',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        });
      }

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'tower-footing',
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
        customProps: { stencilType: 'tower-footing' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: s,
            height: s,
            stroke: '#94a3b8',
            strokeWidth: 2,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          // Bolt Pitch Circle (dashed)
          {
            id: uid(),
            type: 'circle',
            x: center - boltRadius,
            y: center - boltRadius,
            width: boltRadius * 2,
            height: boltRadius * 2,
            stroke: '#38bdf8',
            strokeWidth: 1,
            strokeDash: [3, 3],
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 0.8,
          },
          ...bolts,
          // Center stub
          {
            id: uid(),
            type: 'circle',
            x: center - 6,
            y: center - 6,
            width: 12,
            height: 12,
            stroke: '#f59e0b',
            strokeWidth: 2,
            fill: '#d97706',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + s / 2 - 30,
        y: origin.y + s + 4,
        width: 60,
        height: 16,
        text: 'FOOTING',
        fontSize: 9,
        bold: true,
        textColor: '#cbd5e1',
        bgColor: '#0f172a',
        stroke: '#334155',
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
