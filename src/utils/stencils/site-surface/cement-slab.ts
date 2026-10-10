import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const CEMENT_SLAB_STENCIL: StencilDefinition = {
  id: 'cement-slab',
  name: 'Cement Slab',
  category: 'surface',
  description: '200×150 hardstand slab with expansion joint grid',
  defaultWidth: 200,
  defaultHeight: 150,
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 200;
    const h = 150;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'cement-slab',
      isStencil: true,
      x: origin.x,
      y: origin.y,
      width: w,
      height: h,
      stroke: '#64748b',
      strokeWidth: 2,
      fill: '#334155',
      fillEnabled: true,
      fillOpacity: 0.35,
      opacity: 1,
      customProps: { stencilType: 'cement-slab' },
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
          fill: '#334155',
          fillEnabled: true,
          fillOpacity: 0.35,
          opacity: 1,
        },
        // Expansion joint lines
        {
          id: uid(),
          type: 'line',
          x: w / 2,
          y: 0,
          x2: w / 2,
          y2: h,
          width: 0,
          height: 0,
          stroke: '#475569',
          strokeWidth: 1.5,
          strokeDash: [4, 4],
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 0.8,
        },
        {
          id: uid(),
          type: 'line',
          x: 0,
          y: h / 2,
          x2: w,
          y2: h / 2,
          width: 0,
          height: 0,
          stroke: '#475569',
          strokeWidth: 1.5,
          strokeDash: [4, 4],
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 0.8,
        },
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + 10,
      y: origin.y + 10,
      width: 80,
      height: 16,
      text: 'CEMENT SLAB',
      fontSize: 9,
      bold: true,
      textColor: '#cbd5e1',
      bgColor: '#1e293b',
      stroke: '#475569',
      strokeWidth: 1,
      fill: '#1e293b',
      fillEnabled: true,
      fillOpacity: 0.8,
      opacity: 1,
      isStencilLabel: true,
      parentId: parentId,
    };

    return [mainGroup, label];
  },
};
