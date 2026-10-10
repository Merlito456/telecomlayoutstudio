import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const ASPHALT_ROAD_STENCIL: StencilDefinition = {
  id: 'asphalt-road',
  name: 'Asphalt Access Road',
  category: 'surface',
  badge: 'Access Road',
  description: '240×80 heavy-duty bitumen asphalt vehicle access road with road markings and crushed rock shoulders (Stretchable)',
  defaultWidth: 240,
  defaultHeight: 80,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 240;
    const h = 80;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'asphalt-road',
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
      fillOpacity: 0.85,
      opacity: 1,
      customProps: { stencilType: 'asphalt-road' },
      children: [
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: w,
          height: h,
          stroke: '#475569',
          strokeWidth: 1.8,
          fill: '#0f172a',
          fillEnabled: true,
          fillOpacity: 0.9,
          opacity: 1,
        },
        // Centerline dashed yellow road marking
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
          strokeWidth: 1.5,
          strokeDash: [10, 8],
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
      x: origin.x + 12,
      y: origin.y + 10,
      width: 130,
      height: 18,
      text: 'ASPHALT ACCESS ROAD',
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
};
