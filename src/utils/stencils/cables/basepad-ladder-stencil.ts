import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const BASEPAD_LADDER_STENCIL: StencilDefinition = {
  id: 'basepad-ladder',
  name: 'Basepad Cable Ladder',
  category: 'cabling',
  badge: 'Basepad Surface',
  description: 'A ladder laid on the top surface of basepad (existing low-profile tray resting directly on basepad)',
  defaultWidth: 160,
  defaultHeight: 28,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const length = 160;
    const height = 28;
    const rungSpacing = 14;
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
        stroke: '#94a3b8',
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
      stencilId: 'basepad-ladder',
      isStencil: true,
      isStretchable: true,
      stretchAxis: 'both',
      baseWidth: length,
      baseHeight: height,
      x: origin.x,
      y: origin.y,
      width: length,
      height: height,
      stroke: '#cbd5e1',
      strokeWidth: 2,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.3,
      opacity: 1,
      ladderType: 'basepad',
      customProps: {
        stencilType: 'basepad-ladder',
        ladderType: 'basepad',
        placement: 'basepad',
        showBundles: false,
        trayWidthMm: 450,
      },
      children: [
        {
          id: uid(),
          type: 'line',
          x: 0,
          y: 0,
          x2: length,
          y2: 0,
          width: 0,
          height: 0,
          stroke: '#cbd5e1',
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
          stroke: '#cbd5e1',
          strokeWidth: 2.5,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        },
        ...rungs,
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + length / 2 - 50,
      y: origin.y - 18,
      width: 100,
      height: 16,
      text: 'BASEPAD LADDER',
      fontSize: 8.5,
      bold: true,
      textColor: '#38bdf8',
      bgColor: '#0f172a',
      stroke: '#0284c7',
      strokeWidth: 1,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.85,
      opacity: 1,
      isStencilLabel: true,
      parentId: parentId,
    };

    return [mainGroup, label];
  },
};
