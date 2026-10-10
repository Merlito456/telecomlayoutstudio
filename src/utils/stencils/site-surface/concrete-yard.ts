import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const CONCRETE_YARD_STENCIL: StencilDefinition = {
  id: 'concrete-yard',
  name: 'Concrete Compound Pavement',
  category: 'surface',
  badge: 'Hardscape',
  description: '260×180 heavy engineered Portland cement slab pavement with sawcut control joints (Stretchable)',
  defaultWidth: 260,
  defaultHeight: 180,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 260;
    const h = 180;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'concrete-yard',
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
      strokeWidth: 1.5,
      fill: '#b8b8ae',
      fillEnabled: true,
      fillOpacity: 0.7,
      opacity: 1,
      customProps: { stencilType: 'concrete-yard' },
      children: [
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: w,
          height: h,
          stroke: '#78716c',
          strokeWidth: 1.5,
          fill: '#b8b8ae',
          fillEnabled: true,
          fillOpacity: 0.7,
          opacity: 1,
        },
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + 12,
      y: origin.y + 10,
      width: 140,
      height: 18,
      text: 'CONCRETE PAVEMENT YARD',
      fontSize: 8.5,
      bold: true,
      textColor: '#f1f5f9',
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
};
