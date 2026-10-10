import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const COMPOUND_WALL_STENCIL: StencilDefinition = {
  id: 'wall',
  name: 'Wall',
  category: 'surface',
  description: 'Brick masonry pattern with staggered joints (Stretchable along X)',
  defaultWidth: 180,
  defaultHeight: 20,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const length = 180;
    const height = 20;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'wall',
      isStencil: true,
      isStretchable: true,
      stretchAxis: 'both',
      baseWidth: length,
      baseHeight: height,
      x: origin.x,
      y: origin.y,
      width: length,
      height: height,
      stroke: '#f87171',
      strokeWidth: 2,
      fill: '#7f1d1d',
      fillEnabled: true,
      fillOpacity: 0.5,
      opacity: 1,
      customProps: { stencilType: 'wall' },
      children: [
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: length,
          height: height,
          stroke: '#ef4444',
          strokeWidth: 2,
          fill: '#7f1d1d',
          fillEnabled: true,
          fillOpacity: 0.5,
          opacity: 1,
        },
        // Left terminal closed end cap
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 4,
          height: height,
          stroke: '#b91c1c',
          strokeWidth: 1.5,
          fill: '#991b1b',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        // Right terminal closed end cap
        {
          id: uid(),
          type: 'rectangle',
          x: length - 4,
          y: 0,
          width: 4,
          height: height,
          stroke: '#b91c1c',
          strokeWidth: 1.5,
          fill: '#991b1b',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        // Center mortar joint line
        {
          id: uid(),
          type: 'line',
          x: 4,
          y: height / 2,
          x2: length - 4,
          y2: height / 2,
          width: 0,
          height: 0,
          stroke: '#b91c1c',
          strokeWidth: 1,
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
      x: origin.x + length / 2 - 25,
      y: origin.y - 18,
      width: 50,
      height: 16,
      text: 'WALL',
      fontSize: 9,
      bold: true,
      textColor: '#fca5a5',
      bgColor: '#450a0a',
      stroke: '#ef4444',
      strokeWidth: 1,
      fill: '#450a0a',
      fillEnabled: true,
      fillOpacity: 0.9,
      opacity: 1,
      isStencilLabel: true,
      parentId: parentId,
    };

    return [mainGroup, label];
  },
};
