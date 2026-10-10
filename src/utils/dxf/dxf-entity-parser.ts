/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Point } from "../../types/cad";
import { BlockDef, DXFPair, RawEntity } from "./dxf-types";

/**
 * Parses a single entity starting from startIdx until the next code 0 boundary.
 */
export function parseEntityFromPairs(
  pairs: DXFPair[],
  startIdx: number,
  entityType: string
): { entity: RawEntity; nextIdx: number } {
  const ent: RawEntity = {
    type: entityType,
    layer: '0',
    points: [],
    isClosed: false,
  };

  let i = startIdx;
  let currX: number | null = null;
  let currX2: number | null = null;
  let defPt1X: number | null = null;
  let defPt2X: number | null = null;
  let dimPtX: number | null = null;

  while (i < pairs.length) {
    const p = pairs[i];
    if (p.code === 0) {
      break;
    }

    if (p.code === 8) {
      ent.layer = p.value;
    } else if (p.code === 62) {
      ent.color = parseInt(p.value, 10);
    } else if (p.code === 70) {
      ent.isClosed = (parseInt(p.value, 10) & 1) === 1;
      ent.dimType = parseInt(p.value, 10);
    } else if (p.code === 40) {
      ent.radius = parseFloat(p.value);
      ent.height = parseFloat(p.value);
    } else if (p.code === 50) {
      ent.startAngle = parseFloat(p.value);
      ent.rotation = parseFloat(p.value);
    } else if (p.code === 51) {
      ent.endAngle = parseFloat(p.value);
    } else if (p.code === 41) {
      ent.scaleX = parseFloat(p.value);
    } else if (p.code === 42) {
      ent.scaleY = parseFloat(p.value);
    } else if (p.code === 2) {
      ent.blockName = p.value;
    } else if (p.code === 1) {
      const cleaned = p.value
        .replace(/\\P/g, ' ')
        .replace(/\\X/g, ' ')
        .replace(/%%c/gi, 'Ø')
        .replace(/%%d/gi, '°')
        .replace(/%%p/gi, '±')
        .replace(/\\[A-Za-z0-9]+;?/g, '')
        .replace(/\{|\}/g, '')
        .trim();
      ent.text = (ent.text ? ent.text + ' ' : '') + cleaned;
    } else if (p.code === 3) {
      ent.text = (ent.text || '') + p.value;
    } else if (p.code === 10) {
      currX = parseFloat(p.value);
    } else if (p.code === 20) {
      const y = parseFloat(p.value);
      if (currX !== null && !isNaN(currX) && !isNaN(y)) {
        ent.points.push({ x: currX, y });
        currX = null;
      }
    } else if (p.code === 11) {
      currX2 = parseFloat(p.value);
      dimPtX = parseFloat(p.value);
    } else if (p.code === 21) {
      const y = parseFloat(p.value);
      if (currX2 !== null && !isNaN(currX2) && !isNaN(y)) {
        ent.points.push({ x: currX2, y });
        currX2 = null;
      }
      if (dimPtX !== null && !isNaN(dimPtX) && !isNaN(y)) {
        ent.dimPt = { x: dimPtX, y };
        dimPtX = null;
      }
    } else if (p.code === 12) {
      currX = parseFloat(p.value);
    } else if (p.code === 22) {
      const y = parseFloat(p.value);
      if (currX !== null && !isNaN(currX) && !isNaN(y)) {
        ent.points.push({ x: currX, y });
        currX = null;
      }
    } else if (p.code === 13) {
      defPt1X = parseFloat(p.value);
    } else if (p.code === 23) {
      const y = parseFloat(p.value);
      if (defPt1X !== null && !isNaN(defPt1X) && !isNaN(y)) {
        ent.defPt1 = { x: defPt1X, y };
        defPt1X = null;
      }
    } else if (p.code === 14) {
      defPt2X = parseFloat(p.value);
    } else if (p.code === 24) {
      const y = parseFloat(p.value);
      if (defPt2X !== null && !isNaN(defPt2X) && !isNaN(y)) {
        ent.defPt2 = { x: defPt2X, y };
        defPt2X = null;
      }
    }

    i++;
  }

  return { entity: ent, nextIdx: i };
}

/**
 * Parses BLOCKS section into block definitions map
 */
export function parseBlocksSection(pairs: DXFPair[]): Map<string, BlockDef> {
  const blocksMap = new Map<string, BlockDef>();
  let inBlocksSection = false;
  let currentBlock: BlockDef | null = null;

  for (let idx = 0; idx < pairs.length; idx++) {
    const { code, value } = pairs[idx];

    if (code === 0) {
      if (value === 'SECTION') {
        const next = pairs[idx + 1];
        if (next && next.code === 2 && next.value === 'BLOCKS') {
          inBlocksSection = true;
          idx++;
          continue;
        }
      } else if (value === 'ENDSEC') {
        if (currentBlock && currentBlock.name) {
          blocksMap.set(currentBlock.name, currentBlock);
          currentBlock = null;
        }
        inBlocksSection = false;
        continue;
      }

      if (inBlocksSection) {
        if (value === 'BLOCK') {
          if (currentBlock && currentBlock.name) {
            blocksMap.set(currentBlock.name, currentBlock);
          }
          currentBlock = {
            name: '',
            basePoint: { x: 0, y: 0 },
            entities: [],
          };
        } else if (value === 'ENDBLK') {
          if (currentBlock && currentBlock.name) {
            blocksMap.set(currentBlock.name, currentBlock);
            currentBlock = null;
          }
        } else if (currentBlock) {
          const supportedTypes = ['LINE', 'LWPOLYLINE', 'POLYLINE', 'CIRCLE', 'ARC', 'TEXT', 'MTEXT', 'SOLID'];
          if (supportedTypes.includes(value)) {
            const { entity, nextIdx } = parseEntityFromPairs(pairs, idx + 1, value);
            currentBlock.entities.push(entity);
            idx = nextIdx - 1;
            continue;
          }
        }
      }
    } else if (inBlocksSection && currentBlock) {
      if (code === 2 && !currentBlock.name) {
        currentBlock.name = value;
      } else if (code === 10) {
        const next = pairs[idx + 1];
        if (next && next.code === 20) {
          const bx = parseFloat(value);
          const by = parseFloat(next.value);
          if (!isNaN(bx) && !isNaN(by)) {
            currentBlock.basePoint = { x: bx, y: by };
            idx++;
          }
        }
      }
    }
  }

  return blocksMap;
}

/**
 * Parses ENTITIES section
 */
export function parseEntitiesSection(pairs: DXFPair[]): {
  rawEntities: RawEntity[];
  layersSet: Set<string>;
} {
  const rawEntities: RawEntity[] = [];
  const layersSet = new Set<string>();
  let inEntitiesSection = false;

  for (let idx = 0; idx < pairs.length; idx++) {
    const { code, value } = pairs[idx];

    if (code === 0) {
      if (value === 'SECTION') {
        const next = pairs[idx + 1];
        if (next && next.code === 2 && next.value === 'ENTITIES') {
          inEntitiesSection = true;
          idx++;
          continue;
        }
      } else if (value === 'ENDSEC') {
        inEntitiesSection = false;
        continue;
      }

      if (inEntitiesSection) {
        const validTypes = [
          'LINE',
          'LWPOLYLINE',
          'POLYLINE',
          'CIRCLE',
          'ARC',
          'TEXT',
          'MTEXT',
          'SOLID',
          'DIMENSION',
          'INSERT',
        ];

        if (validTypes.includes(value)) {
          const { entity, nextIdx } = parseEntityFromPairs(pairs, idx + 1, value);

          // Handle POLYLINE with VERTEX records
          if (value === 'POLYLINE') {
            let vIdx = nextIdx;
            while (vIdx < pairs.length) {
              const vPair = pairs[vIdx];
              if (vPair.code === 0 && vPair.value === 'VERTEX') {
                const { entity: vertexEnt, nextIdx: afterV } = parseEntityFromPairs(pairs, vIdx + 1, 'VERTEX');
                if (vertexEnt.points.length > 0) {
                  entity.points.push(...vertexEnt.points);
                }
                vIdx = afterV;
              } else if (vPair.code === 0 && (vPair.value === 'SEQEND' || vPair.value !== 'VERTEX')) {
                break;
              } else {
                vIdx++;
              }
            }
          }

          rawEntities.push(entity);
          if (entity.layer) layersSet.add(entity.layer);
          idx = nextIdx - 1;
        }
      }
    }
  }

  return { rawEntities, layersSet };
}

/**
 * Expands block INSERT references into raw entities
 */
export function expandBlockInserts(
  rawEntities: RawEntity[],
  blocksMap: Map<string, BlockDef>
): { finalEntities: RawEntity[]; insertCount: number } {
  const finalEntities: RawEntity[] = [];
  let insertCount = 0;

  rawEntities.forEach((ent) => {
    if (ent.type === 'INSERT' && ent.blockName && blocksMap.has(ent.blockName)) {
      insertCount++;
      const block = blocksMap.get(ent.blockName)!;
      const insPt = ent.points[0] || { x: 0, y: 0 };
      const sx = ent.scaleX ?? 1;
      const sy = ent.scaleY ?? sx;
      const rotDeg = ent.rotation ?? 0;
      const rotRad = (rotDeg * Math.PI) / 180;
      const cosR = Math.cos(rotRad);
      const sinR = Math.sin(rotRad);

      const transformPt = (p: Point): Point => {
        const dx = (p.x - block.basePoint.x) * sx;
        const dy = (p.y - block.basePoint.y) * sy;
        return {
          x: insPt.x + (dx * cosR - dy * sinR),
          y: insPt.y + (dx * sinR + dy * cosR),
        };
      };

      block.entities.forEach((bEnt) => {
        const cloned: RawEntity = {
          ...bEnt,
          layer: bEnt.layer === '0' && ent.layer ? ent.layer : bEnt.layer,
          color: ent.color !== undefined ? ent.color : bEnt.color,
          points: bEnt.points.map(transformPt),
          radius: bEnt.radius ? bEnt.radius * Math.abs(sx) : undefined,
          startAngle: bEnt.startAngle !== undefined ? bEnt.startAngle + rotDeg : undefined,
          endAngle: bEnt.endAngle !== undefined ? bEnt.endAngle + rotDeg : undefined,
          rotation: (bEnt.rotation || 0) + rotDeg,
        };
        finalEntities.push(cloned);
      });
    } else {
      finalEntities.push(ent);
    }
  });

  return { finalEntities, insertCount };
}
