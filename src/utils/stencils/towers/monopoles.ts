import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const MONOPOLE_STENCILS: StencilDefinition[] = [
{
    id: 'monopole-tower',
    name: 'Monopole (1-Leg Tapered Pole)',
    category: 'tower',
    badge: '1 Leg (Tapered)',
    description: '1 leg. This is a single, thick, tapered steel pole. Circular base flange with 16 anchor bolts, concentric tapered pole sections, and 3-sector antenna mounts.',
    defaultWidth: 110,
    defaultHeight: 110,
    createObjects: (origin: Point, scale: number): CADObject[] => {
      const parentId = uid();
      const s = 110;
      const center = s / 2;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'monopole-tower',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: s,
        height: s,
        stroke: '#f59e0b',
        strokeWidth: 2,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 1,
        customProps: { stencilType: 'monopole-tower', poleType: 'tapered-monopole', towerHeightM: 30, isTower: true },
        towerHeightM: 30,
        children: [
          // Base flange plate
          {
            id: uid(),
            type: 'circle',
            x: 10,
            y: 10,
            width: 90,
            height: 90,
            stroke: '#d97706',
            strokeWidth: 2.5,
            fill: '#451a03',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
          // Tapered Pole Shaft (outer base)
          {
            id: uid(),
            type: 'circle',
            x: 25,
            y: 25,
            width: 60,
            height: 60,
            stroke: '#f59e0b',
            strokeWidth: 3,
            fill: '#78350f',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          // Tapered Pole Top (inner)
          {
            id: uid(),
            type: 'circle',
            x: 38,
            y: 38,
            width: 34,
            height: 34,
            stroke: '#fcd34d',
            strokeWidth: 2,
            fill: '#b45309',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // 3 Sector Antenna T-Arms at 120 deg
          ...[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ang) => {
            const cos = Math.cos(ang);
            const sin = Math.sin(ang);
            return {
              id: uid(),
              type: 'line' as const,
              x: center + cos * 28,
              y: center + sin * 28,
              x2: center + cos * 52,
              y2: center + sin * 52,
              width: 0,
              height: 0,
              stroke: '#38bdf8',
              strokeWidth: 2.5,
              fill: 'transparent',
              fillEnabled: false,
              fillOpacity: 0,
              opacity: 1,
            };
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
        text: 'MONOPOLE (1-LEG)',
        fontSize: 9,
        bold: true,
        textColor: '#f59e0b',
        bgColor: '#1e293b',
        stroke: '#d97706',
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
    id: 'monopole-platform',
    name: 'Monopole with Platform (1-Leg Heavy)',
    category: 'tower',
    badge: '1 Leg + Platform',
    description: '1 leg. Single, thick, tapered steel pole equipped with circular rigger walk platform, safety handrails, and heavy array mounts.',
    defaultWidth: 120,
    defaultHeight: 120,
    createObjects: (origin: Point, scale: number): CADObject[] => {
      const parentId = uid();
      const s = 120;
      const center = s / 2;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'monopole-platform',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: s,
        height: s,
        stroke: '#f59e0b',
        strokeWidth: 2,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 1,
        customProps: { stencilType: 'monopole-platform', towerHeightM: 30, isTower: true },
        towerHeightM: 30,
        children: [
          // Circular Outer Work Platform
          {
            id: uid(),
            type: 'circle',
            x: 6,
            y: 6,
            width: 108,
            height: 108,
            stroke: '#38bdf8',
            strokeWidth: 2,
            strokeDash: [4, 2],
            fill: '#0f172a',
            fillEnabled: true,
            fillOpacity: 0.5,
            opacity: 1,
          },
          // Platform Safety Grating Ring
          {
            id: uid(),
            type: 'circle',
            x: 18,
            y: 18,
            width: 84,
            height: 84,
            stroke: '#64748b',
            strokeWidth: 1.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 0.8,
          },
          // Base flange plate
          {
            id: uid(),
            type: 'circle',
            x: 25,
            y: 25,
            width: 70,
            height: 70,
            stroke: '#d97706',
            strokeWidth: 2.5,
            fill: '#451a03',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
          // Tapered Pole Shaft (outer base)
          {
            id: uid(),
            type: 'circle',
            x: 35,
            y: 35,
            width: 50,
            height: 50,
            stroke: '#f59e0b',
            strokeWidth: 3,
            fill: '#78350f',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          // Tapered Pole Top (inner)
          {
            id: uid(),
            type: 'circle',
            x: 46,
            y: 46,
            width: 28,
            height: 28,
            stroke: '#fcd34d',
            strokeWidth: 2,
            fill: '#b45309',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // 4 Platform Sector Antenna Mount Arms
          ...[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang) => {
            const cos = Math.cos(ang);
            const sin = Math.sin(ang);
            return {
              id: uid(),
              type: 'line' as const,
              x: center + cos * 25,
              y: center + sin * 25,
              x2: center + cos * 56,
              y2: center + sin * 56,
              width: 0,
              height: 0,
              stroke: '#38bdf8',
              strokeWidth: 2.5,
              fill: 'transparent',
              fillEnabled: false,
              fillOpacity: 0,
              opacity: 1,
            };
          }),
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + s / 2 - 60,
        y: origin.y - 18,
        width: 120,
        height: 18,
        text: 'MONOPOLE + PLATFORM',
        fontSize: 9,
        bold: true,
        textColor: '#f59e0b',
        bgColor: '#1e293b',
        stroke: '#d97706',
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
  }
];
