import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const CABLE_TRAY_STENCIL: StencilDefinition = {
  id: 'cable-tray',
  name: 'Cable Tray',
  category: 'cabling',
  description: 'Twin rails with 20 rungs (Stretchable along X)',
  defaultWidth: 200,
  defaultHeight: 24,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const length = 200;
    const height = 24;
    const rungCount = 20;
    const rungStep = length / rungCount;

    const rungs: CADObject[] = [];
    for (let i = 1; i < rungCount; i++) {
      rungs.push({
        id: uid(),
        type: 'line',
        x: i * rungStep,
        y: 0,
        x2: i * rungStep,
        y2: height,
        width: 0,
        height: 0,
        stroke: '#94a3b8',
        strokeWidth: 1.5,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 0.8,
      });
    }

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'cable-tray',
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
      fillOpacity: 0.4,
      opacity: 1,
      customProps: { stencilType: 'cable-tray' },
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
      x: origin.x + length / 2 - 35,
      y: origin.y - 18,
      width: 70,
      height: 16,
      text: 'CABLE TRAY',
      fontSize: 9,
      bold: true,
      textColor: '#cbd5e1',
      bgColor: '#0f172a',
      stroke: '#475569',
      strokeWidth: 1,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.8,
      opacity: 1,
      isStencilLabel: true,
      parentId: parentId,
    };

    return [mainGroup, label];
  },
};
