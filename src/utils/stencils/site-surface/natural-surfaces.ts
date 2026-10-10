import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const NATURAL_SURFACE_STENCILS: StencilDefinition[] = [
  {
    id: 'grass-area',
    name: 'Grass Area',
    category: 'surface',
    description: '200×150 green perimeter surface with tuft texture',
    defaultWidth: 200,
    defaultHeight: 150,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 200;
      const h = 150;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'grass-area',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#15803d',
        strokeWidth: 2,
        fill: '#14532d',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
        customProps: { stencilType: 'grass-area', surfaceHatch: 'grass' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#22c55e',
            strokeWidth: 1.5,
            strokeDash: [6, 4],
            fill: '#15803d',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 10,
        y: origin.y + 10,
        width: 70,
        height: 16,
        text: 'GRASS AREA',
        fontSize: 9,
        bold: true,
        textColor: '#4ade80',
        bgColor: '#052e16',
        stroke: '#15803d',
        strokeWidth: 1,
        fill: '#052e16',
        fillEnabled: true,
        fillOpacity: 0.8,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  },
  {
    id: 'gravel-pad',
    name: 'Gravel Pad',
    category: 'surface',
    description: '150×100 compacted crushed gravel yard with pebble texture',
    defaultWidth: 150,
    defaultHeight: 100,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 150;
      const h = 100;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'gravel-pad',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#78716c',
        strokeWidth: 1.5,
        fill: '#292524',
        fillEnabled: true,
        fillOpacity: 0.5,
        opacity: 1,
        customProps: { stencilType: 'gravel-pad', surfaceHatch: 'pebbles' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#a8a29e',
            strokeWidth: 1.5,
            strokeDash: [4, 4],
            fill: '#292524',
            fillEnabled: true,
            fillOpacity: 0.5,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 10,
        y: origin.y + 10,
        width: 75,
        height: 16,
        text: 'GRAVEL PAD',
        fontSize: 9,
        bold: true,
        textColor: '#d6d3d1',
        bgColor: '#1c1917',
        stroke: '#78716c',
        strokeWidth: 1,
        fill: '#1c1917',
        fillEnabled: true,
        fillOpacity: 0.8,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  },
  {
    id: 'compound-gravel',
    name: 'Compound Gravel Bed',
    category: 'surface',
    badge: 'Telecom Yard',
    description: '320×240 compacted crushed stone gravel bed for cellular site compound ground surfacing with timber/concrete retaining edge (Stretchable)',
    defaultWidth: 320,
    defaultHeight: 240,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 320;
      const h = 240;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'compound-gravel',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#78716c',
        strokeWidth: 2,
        fill: '#292524',
        fillEnabled: true,
        fillOpacity: 0.45,
        opacity: 1,
        customProps: { stencilType: 'compound-gravel', surfaceHatch: 'pebbles' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#a8a29e',
            strokeWidth: 1.5,
            fill: '#292524',
            fillEnabled: true,
            fillOpacity: 0.45,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 12,
        y: origin.y + 12,
        width: 120,
        height: 18,
        text: 'COMPOUND GRAVEL BED',
        fontSize: 8.5,
        bold: true,
        textColor: '#e7e5e4',
        bgColor: '#1c1917',
        stroke: '#78716c',
        strokeWidth: 1,
        fill: '#1c1917',
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
    id: 'grass-patch',
    name: 'Lawn / Grass Surface',
    category: 'surface',
    badge: 'Landscape',
    description: '240×160 natural lush green turf/lawn surface ground layer for site boundaries (Stretchable)',
    defaultWidth: 240,
    defaultHeight: 160,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 240;
      const h = 160;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'grass-patch',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#166534',
        strokeWidth: 1.5,
        fill: '#15803d',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
        customProps: { stencilType: 'grass-patch' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#15803d',
            strokeWidth: 1.5,
            fill: '#166534',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 12,
        y: origin.y + 10,
        width: 110,
        height: 18,
        text: 'NATURAL GRASS LAWN',
        fontSize: 8.5,
        bold: true,
        textColor: '#86efac',
        bgColor: '#052e16',
        stroke: '#16a34a',
        strokeWidth: 1,
        fill: '#052e16',
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
