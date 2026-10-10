import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const GENERIC_ODC_STENCIL: StencilDefinition = {
  id: 'odc',
  name: 'ODC (Outdoor Cabinet)',
  category: 'cabinets',
  description: 'Double-door telecom outdoor cabinet with bolt circles and door swing arc',
  defaultWidth: 90,
  defaultHeight: 60,
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 90;
    const h = 60;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'odc',
      isStencil: true,
      x: origin.x,
      y: origin.y,
      width: w,
      height: h,
      stroke: '#38bdf8',
      strokeWidth: 2,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.9,
      opacity: 1,
      customProps: { stencilType: 'odc', bayType: 'odc', heightRatio: 0.4, uHeight: 18, isCabinet: true },
      children: [
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: w,
          height: h,
          stroke: '#38bdf8',
          strokeWidth: 2,
          fill: '#1e293b',
          fillEnabled: true,
          fillOpacity: 0.9,
          opacity: 1,
        },
        {
          id: uid(),
          type: 'line',
          x: w / 2,
          y: 0,
          x2: w / 2,
          y2: h,
          width: 0,
          height: 0,
          stroke: '#64748b',
          strokeWidth: 1.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        },
        ...[
          { x: 8, y: 8 },
          { x: w - 8, y: 8 },
          { x: 8, y: h - 8 },
          { x: w - 8, y: h - 8 },
        ].map((pt) => ({
          id: uid(),
          type: 'circle' as const,
          x: pt.x - 3,
          y: pt.y - 3,
          width: 6,
          height: 6,
          stroke: '#cbd5e1',
          strokeWidth: 1.5,
          fill: '#475569',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        })),
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + w / 2 - 25,
      y: origin.y + h / 2 - 9,
      width: 50,
      height: 18,
      text: 'ODC',
      fontSize: 11,
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
};
