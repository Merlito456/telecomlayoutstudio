import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export const ELEVATED_PADS: StencilDefinition[] = [
  {
    id: 'elevated-basepad',
    name: 'Elevated Basepad',
    category: 'pads',
    description: 'Elevated equipment foundation (+800mm TOC) on concrete stanchion piers with grating deck and safety kickplate',
    defaultWidth: 160,
    defaultHeight: 110,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 160;
      const h = 110;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'elevated-basepad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#7c7c74',
        strokeWidth: 2.5,
        fill: '#b0b0a6',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        customProps: {
          stencilType: 'elevated-basepad',
          elevationHeight: 800,
          piersCount: 4,
          railingNorth: true,
          railingSouth: false,
          railingEast: true,
          railingWest: true,
          stairsWall: 'south',
          busbarWall: 'none',
        },
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 55,
        y: origin.y + h / 2 - 9,
        width: 110,
        height: 18,
        text: 'ELEVATED PAD +800',
        fontSize: 9,
        bold: true,
        textColor: '#f8fafc',
        bgColor: '#1e293b',
        stroke: '#475569',
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
    id: 'custom-elevated-basepad',
    name: 'Custom Elevated Basepad',
    category: 'pads',
    description: 'Fully customizable elevated foundation: design location of stairs (N/S/E/W), perimeter railings, and copper busbars',
    defaultWidth: 180,
    defaultHeight: 120,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 180;
      const h = 120;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'custom-elevated-basepad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#7c7c74',
        strokeWidth: 2.5,
        fill: '#b0b0a6',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        customProps: {
          stencilType: 'custom-elevated-basepad',
          elevationHeight: 800,
          stairsWall: 'south',
          stairsSteps: 5,
          railingNorth: true,
          railingSouth: false,
          railingEast: true,
          railingWest: true,
          busbarWall: 'none',
          piersCount: 6,
        },
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 65,
        y: origin.y + h / 2 - 9,
        width: 130,
        height: 18,
        text: 'CUSTOM ELEVATED PAD',
        fontSize: 9,
        bold: true,
        textColor: '#f8fafc',
        bgColor: '#1e293b',
        stroke: '#475569',
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
];
