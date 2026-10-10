import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export const ROAD_SIDEWALK_STENCILS: StencilDefinition[] = [
  {
    id: 'road-segment',
    name: 'Two-Lane Asphalt Road',
    category: 'environment',
    badge: 'Roadway',
    description:
      '240×70 two-lane asphalt roadway with dashed yellow centerline, solid white shoulder lines, and gravel curbs (Stretchable)',
    defaultWidth: 240,
    defaultHeight: 70,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 240;
      const h = 70;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'road-segment',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#334155',
        strokeWidth: 2,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'road-segment' },
        children: [
          // Asphalt bed
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#1e293b',
            strokeWidth: 2,
            fill: '#0f172a',
            fillEnabled: true,
            fillOpacity: 0.95,
            opacity: 1,
          },
          // North shoulder line (white)
          {
            id: uid(),
            type: 'line',
            x: 0,
            y: 6,
            x2: w,
            y2: 6,
            width: 0,
            height: 0,
            stroke: '#f8fafc',
            strokeWidth: 1.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 0.9,
          },
          // Center dashed yellow lane divider
          {
            id: uid(),
            type: 'line',
            x: 0,
            y: h / 2,
            x2: w,
            y2: h / 2,
            width: 0,
            height: 0,
            stroke: '#eab308',
            strokeWidth: 1.8,
            strokeDash: [12, 10],
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
          },
          // South shoulder line (white)
          {
            id: uid(),
            type: 'line',
            x: 0,
            y: h - 6,
            x2: w,
            y2: h - 6,
            width: 0,
            height: 0,
            stroke: '#f8fafc',
            strokeWidth: 1.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 0.9,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 12,
        y: origin.y + 10,
        width: 120,
        height: 18,
        text: 'TWO-LANE ROADWAY',
        fontSize: 8.5,
        bold: true,
        textColor: '#facc15',
        bgColor: '#0f172a',
        stroke: '#ca8a04',
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
    id: 'sidewalk',
    name: 'Concrete Sidewalk & Curb',
    category: 'environment',
    badge: 'Walkway',
    description:
      '200×32 poured concrete pedestrian sidewalk with sawcut contraction joints and roadside barrier curb (Stretchable)',
    defaultWidth: 200,
    defaultHeight: 32,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 200;
      const h = 32;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'sidewalk',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#64748b',
        strokeWidth: 1.8,
        fill: '#cbd5e1',
        fillEnabled: true,
        fillOpacity: 0.85,
        opacity: 1,
        customProps: { stencilType: 'sidewalk' },
        children: [
          // Walkway slab
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            fill: '#cbd5e1',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
          // Raised roadside curb strip
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: h - 6,
            width: w,
            height: 6,
            stroke: '#475569',
            strokeWidth: 1.2,
            fill: '#94a3b8',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 12,
        y: origin.y + 6,
        width: 100,
        height: 18,
        text: 'CONCRETE SIDEWALK',
        fontSize: 8.5,
        bold: true,
        textColor: '#e2e8f0',
        bgColor: '#334155',
        stroke: '#64748b',
        strokeWidth: 1,
        fill: '#334155',
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
