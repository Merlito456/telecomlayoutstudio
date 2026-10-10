import { CADObject, Point, StencilDefinition } from "../../types/cad";
import { uid } from "./common";

export const createDefaultShelterInterior = (): any[] => {
  return [];
};

export const SHELTER_STENCILS: StencilDefinition[] = [
  {
    id: 'shelter',
    name: 'Shelter (Walk-In Cabin)',
    category: 'shelter',
    description: 'Walk-in telecom equipment shelter cabin with customizable height, door & cable entry (empty interior ready for custom equipment)',
    defaultWidth: 180,
    defaultHeight: 140,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point, scale: number): CADObject[] => {
      const parentId = uid();
      const w = 180;
      const h = 140;
      const wallT = 10;
      const doorW = 40;
      const initialInterior: any[] = [];

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'shelter',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#f8fafc',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        shelterHeightM: 3.0,
        feederDiameter: 250,
        cableHoleDiameterMm: 250,
        interiorObjects: [],
        customProps: {
          stencilType: 'shelter',
          shelterHeightM: 3.0,
          doorWall: 'south',
          doorOffset: 35,
          doorWidthMm: 900,
          doorDiameter: 900,
          doorDiameterMm: 900,
          cableHoleWall: 'east',
          cableHoleOffset: 50,
          cableHoleDiameterMm: 250,
          cableHoleDiameter: 250,
          feederDiameter: 250,
          airconWall: 'none',
          airconOffset: 50,
          wallThickness: 10,
          interiorObjects: [],
        },
        children: [
          // Outer Wall boundary
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#94a3b8',
            strokeWidth: 3,
            fill: '#0f172a',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Inner Wall boundary
          {
            id: uid(),
            type: 'rectangle',
            x: wallT,
            y: wallT,
            width: w - wallT * 2,
            height: h - wallT * 2,
            stroke: '#64748b',
            strokeWidth: 1.5,
            fill: '#1e293b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
          // Door Opening & Leaf
          {
            id: uid(),
            type: 'line',
            x: wallT + 20,
            y: h,
            x2: wallT + 20,
            y2: h + doorW,
            width: 0,
            height: 0,
            stroke: '#38bdf8',
            strokeWidth: 2.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
          },
          // Door Swing Arc
          {
            id: uid(),
            type: 'polyline',
            x: 0,
            y: 0,
            width: doorW,
            height: doorW,
            stroke: '#38bdf8',
            strokeWidth: 1.5,
            strokeDash: [4, 4],
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 0.8,
            points: Array.from({ length: 9 }).map((_, i) => {
              const rad = (i * Math.PI) / 16;
              return {
                x: wallT + 20 + doorW * Math.sin(rad),
                y: h + doorW * Math.cos(rad),
              };
            }),
          },
          // Cable Entry Gland on right wall
          {
            id: uid(),
            type: 'rectangle',
            x: w - 6,
            y: 35,
            width: 14,
            height: 30,
            stroke: '#fbbf24',
            strokeWidth: 1.5,
            fill: '#d97706',
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
          },
        ],
      };

      // Detached dual dimension / title labels
      const widthLabel: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 45,
        y: origin.y + h / 2 - 10,
        width: 90,
        height: 20,
        text: `SHELTER ${(w / scale).toFixed(1)}m × ${(h / scale).toFixed(1)}m`,
        fontSize: 11,
        bold: true,
        textColor: '#38bdf8',
        bgColor: '#0f172a',
        stroke: '#0369a1',
        strokeWidth: 1,
        fill: '#0f172a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, widthLabel];
    },
  },
  {
    id: 'cement-shelter',
    name: 'Full Cement Shelter Box (All-White)',
    category: 'shelter',
    badge: 'All-White Cement',
    description: 'Monolithic poured all-white cement equipment shelter (empty interior ready for Shelter Design Studio, customizable height & openings)',
    defaultWidth: 200,
    defaultHeight: 150,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point, scale: number): CADObject[] => {
      const parentId = uid();
      const w = 200;
      const h = 150;

      const initialInterior: any[] = [];
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'cement-shelter',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#cbd5e1',
        strokeWidth: 2.5,
        fill: '#f8fafc',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        shelterHeightM: 3.0,
        feederDiameter: 250,
        cableHoleDiameterMm: 250,
        interiorObjects: [],
        customProps: {
          stencilType: 'cement-shelter',
          isAllWhiteCement: true,
          shelterHeightM: 3.0,
          doorWall: 'south', // 'north' | 'south' | 'east' | 'west'
          doorOffset: 35, // 35% along wall
          doorWidthMm: 900,
          doorDiameter: 900,
          doorDiameterMm: 900,
          cableHoleWall: 'east', // 'north' | 'south' | 'east' | 'west' | 'none'
          cableHoleOffset: 50,
          cableHoleDiameterMm: 250,
          cableHoleDiameter: 250,
          feederDiameter: 250,
          airconWall: 'none', // 'north' | 'south' | 'east' | 'west' | 'none'
          airconOffset: 50,
          wallThickness: 12,
          interiorObjects: [],
        },
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 65,
        y: origin.y + h / 2 - 9,
        width: 130,
        height: 18,
        text: 'ALL-WHITE CEMENT SHELTER',
        fontSize: 8.5,
        bold: true,
        textColor: '#0f172a',
        bgColor: '#ffffff',
        stroke: '#94a3b8',
        strokeWidth: 1,
        fill: '#ffffff',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  },
  {
    id: 'cement-stairs',
    name: 'Cement Stairs',
    category: 'shelter',
    description: '8 precast concrete treads with direction arrow and riser lines',
    defaultWidth: 70,
    defaultHeight: 120,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 70;
      const h = 120;
      const treads = 8;
      const treadH = h / treads;

      const lines: CADObject[] = [];
      for (let i = 1; i < treads; i++) {
        lines.push({
          id: uid(),
          type: 'line',
          x: 0,
          y: i * treadH,
          x2: w,
          y2: i * treadH,
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
        stencilId: 'cement-stairs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#cbd5e1',
        strokeWidth: 2,
        fill: '#334155',
        fillEnabled: true,
        fillOpacity: 0.8,
        opacity: 1,
        customProps: { stencilType: 'cement-stairs' },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#cbd5e1',
            strokeWidth: 2,
            fill: '#334155',
            fillEnabled: true,
            fillOpacity: 0.6,
            opacity: 1,
          },
          ...lines,
          // Arrow up stem
          {
            id: uid(),
            type: 'line',
            x: w / 2,
            y: h - 15,
            x2: w / 2,
            y2: 15,
            width: 0,
            height: 0,
            stroke: '#38bdf8',
            strokeWidth: 2,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
          },
          // Arrow head
          {
            id: uid(),
            type: 'polyline',
            x: 0,
            y: 0,
            width: 16,
            height: 12,
            stroke: '#38bdf8',
            strokeWidth: 2,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
            points: [
              { x: w / 2 - 8, y: 25 },
              { x: w / 2, y: 15 },
              { x: w / 2 + 8, y: 25 },
            ],
          },
        ],
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 15,
        y: origin.y + h - 25,
        width: 30,
        height: 16,
        text: 'UP',
        fontSize: 10,
        bold: true,
        textColor: '#38bdf8',
        bgColor: '#1e293b',
        stroke: '#0284c7',
        strokeWidth: 1,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.8,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  },

  // --- 4. IN-SHELTER CABLE LADDER (Indoor overhead suspended cable runway) ---
  {
    id: 'indoor-ladder',
    name: 'In-Shelter Cable Ladder',
    category: 'shelter',
    badge: 'In Shelter / Indoor',
    description: 'In shelter cable ladder / indoor ladder - overhead suspended from shelter ceiling for cable distribution inside the cabin',
    defaultWidth: 140,
    defaultHeight: 26,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const length = 140;
      const height = 26;
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
          stroke: '#cbd5e1',
          strokeWidth: 1.8,
          fill: 'transparent',
          fillEnabled: false,
          fillOpacity: 0,
          opacity: 1,
        });
      }

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'indoor-ladder',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: length,
        baseHeight: height,
        x: origin.x,
        y: origin.y,
        width: length,
        height: height,
        stroke: '#facc15',
        strokeWidth: 2,
        fill: 'transparent',
        fillEnabled: false,
        fillOpacity: 0,
        opacity: 1,
        ladderType: 'indoor',
        customProps: {
          stencilType: 'indoor-ladder',
          ladderType: 'indoor',
          placement: 'indoor',
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
            stroke: '#e2e8f0',
            strokeWidth: 2.2,
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
            stroke: '#e2e8f0',
            strokeWidth: 2.2,
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
        x: origin.x + length / 2 - 55,
        y: origin.y - 18,
        width: 110,
        height: 16,
        text: 'IN-SHELTER CABLE LADDER',
        fontSize: 8,
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
  },
];
