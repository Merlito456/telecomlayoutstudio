import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const MPD_STENCIL: StencilDefinition = {
  id: 'mpd',
  name: 'MPD (Main Power Distribution)',
  category: 'power',
  badge: 'AC Main Panel',
  description: 'Outdoor Main Power Distribution panel with main MCCB isolator switch, digital multi-function meter, and surge protection (SPD)',
  defaultWidth: 44,
  defaultHeight: 26,
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 44;
    const h = 26;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'mpd',
      isStencil: true,
      x: origin.x,
      y: origin.y,
      width: w,
      height: h,
      stroke: '#f59e0b',
      strokeWidth: 1.8,
      fill: '#1e293b',
      fillEnabled: true,
      fillOpacity: 0.95,
      opacity: 1,
      customProps: { stencilType: 'mpd' },
      children: [
        // Enclosure body
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: w,
          height: h,
          stroke: '#f59e0b',
          strokeWidth: 2,
          fill: '#1e293b',
          fillEnabled: true,
          fillOpacity: 0.95,
          opacity: 1,
        },
        // Main MCCB Rotary Switch Symbol
        {
          id: uid(),
          type: 'circle',
          x: 6,
          y: h / 2 - 5,
          width: 10,
          height: 10,
          stroke: '#ef4444',
          strokeWidth: 1.5,
          fill: '#7f1d1d',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        // Digital Meter Display
        {
          id: uid(),
          type: 'rectangle',
          x: 22,
          y: 4,
          width: 16,
          height: 8,
          stroke: '#38bdf8',
          strokeWidth: 1,
          fill: '#0369a1',
          fillEnabled: true,
          fillOpacity: 0.8,
          opacity: 1,
        },
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + w / 2 - 25,
      y: origin.y - 18,
      width: 50,
      height: 18,
      text: 'MPD',
      fontSize: 9.5,
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
};
