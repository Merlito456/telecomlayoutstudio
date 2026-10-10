import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const CONNECTING_LADDER_STENCIL: StencilDefinition = {
  id: 'connecting-ladder',
  name: 'Connecting Cable Ladder',
  category: 'cabling',
  badge: 'Connecting Ladder',
  description: 'Connecting ladder - use to connect the basepad ladder to the cabin feeder ladder or basepad ladder to the tower climbing ladder',
  defaultWidth: 130,
  defaultHeight: 28,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const length = 130;
    const height = 28;
    const rungSpacing = 13;
    const numRungs = Math.floor(length / rungSpacing);

    const rungs: CADObject[] = [];
    for (let i = 1; i < numRungs; i++) {
      rungs.push({
        id: uid(),
        type: 'line',
        x: i * rungSpacing,
        y: 0,
        x2: i * rungSpacing,
        y2: height,
        width: 0,
        height: 0,
        stroke: '#10b981',
        strokeWidth: 2,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 1,
      });
    }

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'connecting-ladder',
      isStencil: true,
      isStretchable: true,
      stretchAxis: 'both',
      baseWidth: length,
      baseHeight: height,
      x: origin.x,
      y: origin.y,
      width: length,
      height: height,
      stroke: '#10b981',
      strokeWidth: 2,
      fill: '#064e3b',
      fillEnabled: true,
      fillOpacity: 0.25,
      opacity: 1,
      ladderType: 'connecting',
      customProps: {
        stencilType: 'connecting-ladder',
        ladderType: 'connecting',
        placement: 'connecting',
        showBundles: false,
        trayWidthMm: 450,
      },
      children: [
        {
          id: uid(),
          type: 'rectangle',
          x: -2,
          y: -2,
          width: 10,
          height: height + 4,
          stroke: '#10b981',
          strokeWidth: 1.5,
          fill: '#047857',
          fillEnabled: true,
          fillOpacity: 0.8,
          opacity: 1,
        },
        {
          id: uid(),
          type: 'line',
          x: 0,
          y: 0,
          x2: length,
          y2: 0,
          width: 0,
          height: 0,
          stroke: '#34d399',
          strokeWidth: 2.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        },
        {
          id: uid(),
          type: 'line',
          x: 0,
          y: height,
          x2: length,
          y2: height,
          width: 0,
          height: 0,
          stroke: '#34d399',
          strokeWidth: 2.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        },
        ...rungs,
        {
          id: uid(),
          type: 'rectangle',
          x: length - 8,
          y: -2,
          width: 10,
          height: height + 4,
          stroke: '#10b981',
          strokeWidth: 1.5,
          fill: '#047857',
          fillEnabled: true,
          fillOpacity: 0.8,
          opacity: 1,
        },
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + length / 2 - 55,
      y: origin.y - 18,
      width: 110,
      height: 16,
      text: 'CONNECTING LADDER',
      fontSize: 8,
      bold: true,
      textColor: '#34d399',
      bgColor: '#0f172a',
      stroke: '#059669',
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
