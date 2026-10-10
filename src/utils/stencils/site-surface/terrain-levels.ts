import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const TERRAIN_LEVELS_STENCILS: StencilDefinition[] = [
  {
    id: 'excavated-pit',
    name: 'Excavated Pit / Trench (-1.0m)',
    category: 'surface',
    badge: 'Sunken Level',
    description: 'Sunken excavation zone (-1.0m below grade) with holding retaining walls (concrete, metal, gravel, or earth). Stretchable.',
    defaultWidth: 200,
    defaultHeight: 140,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 200;
      const h = 140;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'excavated-pit',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#475569',
        strokeWidth: 2,
        fill: '#1c1917',
        fillEnabled: true,
        fillOpacity: 0.85,
        opacity: 1,
        levelElevationM: -1.0,
        foundationRetainingMaterial: 'concrete',
        customProps: {
          stencilType: 'excavated-pit',
          levelElevationM: -1.0,
          foundationRetainingMaterial: 'concrete',
        },
        children: [
          // Sunken Pit Basin Floor
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#475569',
            strokeWidth: 2,
            fill: '#1c1917',
            fillEnabled: true,
            fillOpacity: 0.85,
            opacity: 1,
          },
          // Inner excavation depth contour
          {
            id: uid(),
            type: 'rectangle',
            x: 10,
            y: 10,
            width: w - 20,
            height: h - 20,
            stroke: '#38bdf8',
            strokeWidth: 1.2,
            strokeDash: [4, 3],
            fill: '#0f172a',
            fillEnabled: true,
            fillOpacity: 0.75,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 12,
        y: origin.y + 10,
        width: 150,
        height: 18,
        text: '▼ EXCAVATED PIT (-1.0m)',
        fontSize: 8.5,
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
  },
  {
    id: 'elevated-terrace',
    name: 'Elevated Terrace Level (+0.8m)',
    category: 'surface',
    badge: 'Raised Level',
    description: 'Elevated ground terrace / foundation plinth (+0.8m above grade) with concrete holding division retaining walls. Stretchable.',
    defaultWidth: 220,
    defaultHeight: 150,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 220;
      const h = 150;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'elevated-terrace',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#94a3b8',
        strokeWidth: 2.2,
        fill: '#b8b8ae',
        fillEnabled: true,
        fillOpacity: 0.8,
        opacity: 1,
        levelElevationM: 0.8,
        foundationRetainingMaterial: 'concrete',
        customProps: {
          stencilType: 'elevated-terrace',
          levelElevationM: 0.8,
          foundationRetainingMaterial: 'concrete',
        },
        children: [
          // Raised Terrace Surface
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#78716c',
            strokeWidth: 2,
            fill: '#b8b8ae',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
          // Perimeter retaining grade beam curb
          {
            id: uid(),
            type: 'rectangle',
            x: 6,
            y: 6,
            width: w - 12,
            height: h - 12,
            stroke: '#cbd5e1',
            strokeWidth: 1.5,
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
        width: 160,
        height: 18,
        text: '▲ ELEVATED TERRACE (+0.8m)',
        fontSize: 8.5,
        bold: true,
        textColor: '#f59e0b',
        bgColor: '#451a03',
        stroke: '#d97706',
        strokeWidth: 1,
        fill: '#451a03',
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
    id: 'earth-berm-level',
    name: 'Earthen Mound Level (+0.6m)',
    category: 'surface',
    badge: 'Earth Level',
    description: 'Elevated earth mound / embankment (+0.6m above grade) with compacted soil/dirt division retaining berm. Stretchable.',
    defaultWidth: 200,
    defaultHeight: 140,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 200;
      const h = 140;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'earth-berm-level',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#78350f',
        strokeWidth: 2,
        fill: '#92400e',
        fillEnabled: true,
        fillOpacity: 0.75,
        opacity: 1,
        levelElevationM: 0.6,
        foundationRetainingMaterial: 'earth',
        customProps: {
          stencilType: 'earth-berm-level',
          levelElevationM: 0.6,
          foundationRetainingMaterial: 'earth',
        },
        children: [
          // Earthen Platform Surface
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#78350f',
            strokeWidth: 2,
            fill: '#92400e',
            fillEnabled: true,
            fillOpacity: 0.75,
            opacity: 1,
          },
          // Earthen slope berm indicator
          {
            id: uid(),
            type: 'rectangle',
            x: 8,
            y: 8,
            width: w - 16,
            height: h - 16,
            stroke: '#b45309',
            strokeWidth: 1.2,
            strokeDash: [6, 4],
            fill: '#78350f',
            fillEnabled: true,
            fillOpacity: 0.6,
            opacity: 1,
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + 12,
        y: origin.y + 10,
        width: 160,
        height: 18,
        text: '▲ EARTHEN MOUND (+0.6m)',
        fontSize: 8.5,
        bold: true,
        textColor: '#fdba74',
        bgColor: '#431407',
        stroke: '#c2410c',
        strokeWidth: 1,
        fill: '#431407',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  }
];
