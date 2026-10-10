import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';

export const GATE_2DOOR_STENCIL: StencilDefinition = {
  id: 'gate-2door',
  name: 'Gate (2-Door Closed)',
  category: 'gate',
  description: 'Closed double swing site security gate with reinforced concrete piers, center drop pin lock, flush perimeter wall alignment',
  defaultWidth: 160,
  defaultHeight: 24,
  isStretchable: true,
  stretchAxis: 'both',
  createObjects: (origin: Point, scale: number): CADObject[] => {
    const parentId = uid();
    const pierW = 16;
    const pierH = 24;
    const totalW = 160;
    const totalH = pierH;
    const gateSpan = totalW - pierW * 2;
    const leafW = gateSpan / 2;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'gate-2door',
      isStencil: true,
      isStretchable: true,
      stretchAxis: 'both',
      baseWidth: totalW,
      baseHeight: totalH,
      x: origin.x,
      y: origin.y,
      width: totalW,
      height: totalH,
      stroke: '#94a3b8',
      strokeWidth: 2,
      fill: '#1e293b',
      fillEnabled: true,
      fillOpacity: 0.8,
      opacity: 1,
      customProps: { stencilType: 'gate-2door', isClosed: true },
      children: [
        // Left Concrete Gate Pier
        {
          id: uid(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: pierW,
          height: pierH,
          stroke: '#cbd5e1',
          strokeWidth: 2,
          fill: '#475569',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        // Right Concrete Gate Pier
        {
          id: uid(),
          type: 'rectangle',
          x: totalW - pierW,
          y: 0,
          width: pierW,
          height: pierH,
          stroke: '#cbd5e1',
          strokeWidth: 2,
          fill: '#475569',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        // Left Closed Leaf Frame
        {
          id: uid(),
          type: 'rectangle',
          x: pierW,
          y: 2,
          width: leafW,
          height: pierH - 4,
          stroke: '#0284c7',
          strokeWidth: 2,
          fill: '#0f172a',
          fillEnabled: true,
          fillOpacity: 0.6,
          opacity: 1,
        },
        // Right Closed Leaf Frame
        {
          id: uid(),
          type: 'rectangle',
          x: pierW + leafW,
          y: 2,
          width: leafW,
          height: pierH - 4,
          stroke: '#0284c7',
          strokeWidth: 2,
          fill: '#0f172a',
          fillEnabled: true,
          fillOpacity: 0.6,
          opacity: 1,
        },
        // Left Leaf Center Heavy Rail
        {
          id: uid(),
          type: 'line',
          x: pierW,
          y: pierH / 2,
          x2: pierW + leafW,
          y2: pierH / 2,
          width: 0,
          height: 0,
          stroke: '#38bdf8',
          strokeWidth: 2,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        },
        // Right Leaf Center Heavy Rail
        {
          id: uid(),
          type: 'line',
          x: pierW + leafW,
          y: pierH / 2,
          x2: totalW - pierW,
          y2: pierH / 2,
          width: 0,
          height: 0,
          stroke: '#38bdf8',
          strokeWidth: 2,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        },
        // Center Drop Pin Lock Box & Astragal
        {
          id: uid(),
          type: 'rectangle',
          x: pierW + leafW - 3,
          y: pierH / 2 - 4,
          width: 6,
          height: 8,
          stroke: '#f59e0b',
          strokeWidth: 1.5,
          fill: '#d97706',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
      ],
    };

    const detachedLabel: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + totalW / 2 - 45,
      y: origin.y - 18,
      width: 90,
      height: 20,
      text: `GATE (CLOSED) ${(gateSpan / scale).toFixed(1)}m`,
      fontSize: 10,
      bold: true,
      textColor: '#e2e8f0',
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

    return [mainGroup, detachedLabel];
  },
};
