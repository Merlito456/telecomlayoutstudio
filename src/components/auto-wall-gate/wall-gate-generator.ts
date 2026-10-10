import { CADObject } from '../../types/cad';
import { uid } from '../../utils/cad-geometry';

export type WallType = 'masonry-wall' | 'cement-fence' | 'boundary-fence';
export type GateWallLocation = 'south' | 'north' | 'east' | 'west';

export interface GeneratePerimeterOptions {
  siteWidthM: number;
  siteDepthM: number;
  wallType: WallType;
  wallThicknessM: number;
  gateLocation: GateWallLocation;
  clampedGateLength: number;
  gatePositionType: 'center' | 'offset';
  gateOffsetM: number;
  includeGravelYard: boolean;
  includeCornerPosts: boolean;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
}

export function generatePerimeterElements(options: GeneratePerimeterOptions): CADObject[] {
  const {
    siteWidthM,
    siteDepthM,
    wallType,
    wallThicknessM,
    gateLocation,
    clampedGateLength,
    gatePositionType,
    gateOffsetM,
    includeGravelYard,
    includeCornerPosts,
    scale,
    canvasWidth,
    canvasHeight,
  } = options;

  const W = siteWidthM * scale;
  const D = siteDepthM * scale;
  const wallT = Math.max(6, wallThicknessM * scale);
  const gateLen = clampedGateLength * scale;

  // Center site in canvas
  const originX = canvasWidth / 2 - W / 2;
  const originY = canvasHeight / 2 - D / 2;

  const generatedObjects: CADObject[] = [];

  // 1. Optional Ground Yard / Gravel Fill
  if (includeGravelYard) {
    const yardObj: CADObject = {
      id: uid(),
      type: 'rectangle',
      x: originX + wallT / 2,
      y: originY + wallT / 2,
      width: W - wallT,
      height: D - wallT,
      stroke: '#475569',
      strokeWidth: 1,
      fill: '#1e293b',
      fillEnabled: true,
      fillOpacity: 0.7,
      opacity: 0.9,
      stencilId: 'gravel-pad',
      isStencil: true,
    };
    generatedObjects.push(yardObj);
  }

  // Determine gate offset along its wall
  const wallLength = gateLocation === 'south' || gateLocation === 'north' ? W : D;
  let gateStartAlongWall: number;

  if (gatePositionType === 'center') {
    gateStartAlongWall = (wallLength - gateLen) / 2;
  } else {
    gateStartAlongWall = Math.min(Math.max(wallT, gateOffsetM * scale), wallLength - gateLen - wallT);
  }

  const gateEndAlongWall = gateStartAlongWall + gateLen;

  // Helper to create a wall segment
  const createWallSegment = (
    x: number,
    y: number,
    w: number,
    h: number,
    isVertical: boolean
  ) => {
    const isFence = wallType === 'boundary-fence';
    const isCementFence = wallType === 'cement-fence';
    const stencil = isFence ? 'boundary-fence' : isCementFence ? 'cement-fence' : 'wall';

    const wallObj: CADObject = {
      id: uid(),
      type: 'rectangle',
      x,
      y,
      width: w,
      height: h,
      stroke: isFence ? '#38bdf8' : '#94a3b8',
      strokeWidth: 2,
      fill: isFence ? '#0f172a' : '#334155',
      fillEnabled: true,
      fillOpacity: 0.95,
      opacity: 1,
      stencilId: stencil,
      isStencil: true,
      isStretchable: true,
      customProps: {
        stencilType: stencil,
        wallLengthM: isVertical ? h / scale : w / scale,
      },
    };
    return wallObj;
  };

  // Helper to create the Gate
  const createGate = (x: number, y: number, w: number, h: number, rot = 0) => {
    const gateObj: CADObject = {
      id: uid(),
      type: 'stencil-group',
      stencilId: 'gate-2door',
      isStencil: true,
      x,
      y,
      width: w,
      height: h,
      rotation: rot,
      stroke: '#f59e0b',
      strokeWidth: 2,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.95,
      opacity: 1,
      customProps: {
        gateWidthM: Math.max(w, h) / scale,
      },
    };

    const gateLabel: CADObject = {
      id: uid(),
      type: 'text',
      x: x + w / 2 - 40,
      y: y + h / 2 - 9,
      width: 80,
      height: 18,
      text: `SITE GATE ${clampedGateLength.toFixed(1)}m`,
      fontSize: 9,
      bold: true,
      textColor: '#f59e0b',
      bgColor: '#0f172a',
      stroke: '#d97706',
      strokeWidth: 1,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.9,
      opacity: 1,
      isStencilLabel: true,
      parentId: gateObj.id,
    };

    return [gateObj, gateLabel];
  };

  // 2. Generate the 4 Walls with Gate seamlessly integrated!
  // NORTH WALL
  if (gateLocation === 'north') {
    if (gateStartAlongWall > 2) {
      generatedObjects.push(createWallSegment(originX, originY, gateStartAlongWall, wallT, false));
    }
    generatedObjects.push(...createGate(originX + gateStartAlongWall, originY, gateLen, wallT, 0));
    const seg2W = W - gateEndAlongWall;
    if (seg2W > 2) {
      generatedObjects.push(createWallSegment(originX + gateEndAlongWall, originY, seg2W, wallT, false));
    }
  } else {
    generatedObjects.push(createWallSegment(originX, originY, W, wallT, false));
  }

  // SOUTH WALL
  if (gateLocation === 'south') {
    const southY = originY + D - wallT;
    if (gateStartAlongWall > 2) {
      generatedObjects.push(createWallSegment(originX, southY, gateStartAlongWall, wallT, false));
    }
    generatedObjects.push(...createGate(originX + gateStartAlongWall, southY, gateLen, wallT, 0));
    const seg2W = W - gateEndAlongWall;
    if (seg2W > 2) {
      generatedObjects.push(createWallSegment(originX + gateEndAlongWall, southY, seg2W, wallT, false));
    }
  } else {
    generatedObjects.push(createWallSegment(originX, originY + D - wallT, W, wallT, false));
  }

  // WEST WALL
  if (gateLocation === 'west') {
    const westX = originX;
    if (gateStartAlongWall > 2) {
      generatedObjects.push(createWallSegment(westX, originY + wallT, wallT, gateStartAlongWall - wallT, true));
    }
    generatedObjects.push(...createGate(westX, originY + gateStartAlongWall, wallT, gateLen, 90));
    const seg2H = D - wallT - gateEndAlongWall;
    if (seg2H > 2) {
      generatedObjects.push(createWallSegment(westX, originY + gateEndAlongWall, wallT, seg2H, true));
    }
  } else {
    generatedObjects.push(createWallSegment(originX, originY + wallT, wallT, D - wallT * 2, true));
  }

  // EAST WALL
  if (gateLocation === 'east') {
    const eastX = originX + W - wallT;
    if (gateStartAlongWall > 2) {
      generatedObjects.push(createWallSegment(eastX, originY + wallT, wallT, gateStartAlongWall - wallT, true));
    }
    generatedObjects.push(...createGate(eastX, originY + gateStartAlongWall, wallT, gateLen, 90));
    const seg2H = D - wallT - gateEndAlongWall;
    if (seg2H > 2) {
      generatedObjects.push(createWallSegment(eastX, originY + gateEndAlongWall, wallT, seg2H, true));
    }
  } else {
    generatedObjects.push(createWallSegment(originX + W - wallT, originY + wallT, wallT, D - wallT * 2, true));
  }

  // 3. Optional Corner Joint Posts
  if (includeCornerPosts) {
    const postSize = wallT * 1.35;
    const corners = [
      { x: originX - (postSize - wallT) / 2, y: originY - (postSize - wallT) / 2 },
      { x: originX + W - wallT - (postSize - wallT) / 2, y: originY - (postSize - wallT) / 2 },
      { x: originX - (postSize - wallT) / 2, y: originY + D - wallT - (postSize - wallT) / 2 },
      { x: originX + W - wallT - (postSize - wallT) / 2, y: originY + D - wallT - (postSize - wallT) / 2 },
    ];

    corners.forEach((c) => {
      generatedObjects.push({
        id: uid(),
        type: 'rectangle',
        x: c.x,
        y: c.y,
        width: postSize,
        height: postSize,
        stroke: '#cbd5e1',
        strokeWidth: 2,
        fill: '#475569',
        fillEnabled: true,
        fillOpacity: 1,
        opacity: 1,
        stencilId: 'cement-post',
        isStencil: true,
      });
    });
  }

  return generatedObjects;
}
