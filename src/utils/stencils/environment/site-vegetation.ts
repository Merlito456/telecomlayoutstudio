import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const SITE_VEGETATION_STENCILS: StencilDefinition[] = [
  {
    id: 'tree-deciduous',
    name: 'Lush Shade Tree',
    category: 'environment',
    badge: 'Landscape',
    description: '70×70 organic deciduous shade tree with multi-cluster green foliage canopy and center hardwood trunk',
    defaultWidth: 70,
    defaultHeight: 70,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 70;
      const h = 70;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'tree-deciduous',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#166534',
        strokeWidth: 2,
        fill: '#15803d',
        fillEnabled: true,
        fillOpacity: 0.85,
        opacity: 1,
        customProps: { stencilType: 'tree-deciduous' },
        children: [
          {
            id: uid(),
            type: 'circle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#14532d',
            strokeWidth: 2,
            fill: '#15803d',
            fillEnabled: true,
            fillOpacity: 0.85,
            opacity: 1,
          },
          {
            id: uid(),
            type: 'circle',
            x: w / 2 - 6,
            y: h / 2 - 6,
            width: 12,
            height: 12,
            stroke: '#451a03',
            strokeWidth: 1.5,
            fill: '#78350f',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 8,
        y: origin.y - 18,
        width: 54,
        height: 16,
        text: 'TREE',
        fontSize: 8.5,
        bold: true,
        textColor: '#86efac',
        bgColor: '#052e16',
        stroke: '#15803d',
        strokeWidth: 1,
        fill: '#052e16',
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
    id: 'flowers-bed',
    name: 'Landscaping Flower Bed',
    category: 'environment',
    badge: 'Landscape',
    description: '90×40 decorative garden flower bed with rich soil, stone retaining curb, and colorful blooming flower blossoms',
    defaultWidth: 90,
    defaultHeight: 40,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 90;
      const h = 40;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'flowers-bed',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#78716c',
        strokeWidth: 2,
        fill: '#451a03',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'flowers-bed' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#78716c',
            strokeWidth: 2,
            fill: '#451a03',
            fillEnabled: true,
            fillOpacity: 0.9,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 10,
        y: origin.y - 18,
        width: 70,
        height: 16,
        text: 'FLOWER BED',
        fontSize: 8.5,
        bold: true,
        textColor: '#f472b6',
        bgColor: '#500724',
        stroke: '#db2777',
        strokeWidth: 1,
        fill: '#500724',
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
