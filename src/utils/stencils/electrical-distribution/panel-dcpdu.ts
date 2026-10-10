import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const DCPDU_STENCIL: StencilDefinition = {
  id: 'dcpdu',
  name: 'DCPDU (-48V DC Power Distribution)',
  category: 'power',
  badge: '-48V DC Unit',
  description: 'Telecom -48V DC Power Distribution Unit with miniature circuit breaker bank, DC monitoring, and heavy copper ground bus',
  defaultWidth: 40,
  defaultHeight: 24,
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 40;
    const h = 24;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'dcpdu',
      isStencil: true,
      x: origin.x,
      y: origin.y,
      width: w,
      height: h,
      stroke: '#0284c7',
      strokeWidth: 1.8,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.95,
      opacity: 1,
      customProps: { stencilType: 'dcpdu' },
      children: [
        // Enclosure body
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: w,
          height: h,
          stroke: '#0284c7',
          strokeWidth: 2,
          fill: '#0f172a',
          fillEnabled: true,
          fillOpacity: 0.95,
          opacity: 1,
        },
        // Breaker bank slots
        {
          id: uid(),
          type: 'rectangle',
          x: 6,
          y: 5,
          width: 20,
          height: 14,
          stroke: '#38bdf8',
          strokeWidth: 1,
          fill: '#1e293b',
          fillEnabled: true,
          fillOpacity: 0.9,
          opacity: 1,
        },
        // Grounding terminal lug
        {
          id: uid(),
          type: 'rectangle',
          x: w - 8,
          y: 6,
          width: 4,
          height: 12,
          stroke: '#b45309',
          strokeWidth: 1,
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
      x: origin.x + w / 2 - 28,
      y: origin.y - 18,
      width: 56,
      height: 18,
      text: 'DCPDU',
      fontSize: 9.5,
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
