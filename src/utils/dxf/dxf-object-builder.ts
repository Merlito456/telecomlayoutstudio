/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, Point } from "../../types/cad";
import { aciToHex, resolveLayerId } from "./dxf-coordinate-transform";
import { RawEntity } from "./dxf-types";

function uid(): string {
  return "cad_dxf_" + Math.random().toString(36).substring(2, 9);
}

export function buildCADObjectsFromEntities(
  finalEntities: RawEntity[],
  cadToCanvas: (pt: Point) => Point,
  unitMultiplier: number,
  effectiveScale: number,
  insertCount: number
): {
  parsedObjects: CADObject[];
  stats: {
    lines: number;
    polylines: number;
    circles: number;
    texts: number;
    dimensions: number;
    inserts: number;
    others: number;
  };
} {
  const parsedObjects: CADObject[] = [];
  const stats = {
    lines: 0,
    polylines: 0,
    circles: 0,
    texts: 0,
    dimensions: 0,
    inserts: insertCount,
    others: 0,
  };

  finalEntities.forEach((ent) => {
    const strokeColor = aciToHex(ent.color);
    const layerId = resolveLayerId(ent.layer);

    switch (ent.type) {
      case 'LINE': {
        if (ent.points.length >= 2) {
          const p1 = cadToCanvas(ent.points[0]);
          const p2 = cadToCanvas(ent.points[1]);
          parsedObjects.push({
            id: uid(),
            type: 'line',
            x: p1.x,
            y: p1.y,
            x2: p2.x,
            y2: p2.y,
            width: Math.abs(p2.x - p1.x),
            height: Math.abs(p2.y - p1.y),
            stroke: strokeColor,
            strokeWidth: 1.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
            layerId,
          });
          stats.lines++;
        }
        break;
      }

      case 'LWPOLYLINE':
      case 'POLYLINE': {
        if (ent.points.length >= 2) {
          const cPts = ent.points.map(cadToCanvas);
          const pMinX = Math.min(...cPts.map((p) => p.x));
          const pMinY = Math.min(...cPts.map((p) => p.y));
          const pMaxX = Math.max(...cPts.map((p) => p.x));
          const pMaxY = Math.max(...cPts.map((p) => p.y));
          const pW = Math.max(pMaxX - pMinX, 2);
          const pH = Math.max(pMaxY - pMinY, 2);

          const relPoints = cPts.map((p) => ({ x: p.x - pMinX, y: p.y - pMinY }));

          const isAxisAlignedRect =
            (ent.isClosed || cPts.length === 5) &&
            (cPts.length === 4 || cPts.length === 5) &&
            cPts.every((p) => {
              const xMatch = Math.abs(p.x - pMinX) <= 2 || Math.abs(p.x - pMaxX) <= 2;
              const yMatch = Math.abs(p.y - pMinY) <= 2 || Math.abs(p.y - pMaxY) <= 2;
              return xMatch && yMatch;
            });

          if (isAxisAlignedRect) {
            parsedObjects.push({
              id: uid(),
              type: 'rectangle',
              x: pMinX,
              y: pMinY,
              width: pW,
              height: pH,
              stroke: strokeColor,
              strokeWidth: 1.5,
              fill: strokeColor,
              fillEnabled: false,
              fillOpacity: 0.15,
              opacity: 1,
            layerId,
            });
          } else {
            parsedObjects.push({
              id: uid(),
              type: 'polyline',
              x: pMinX,
              y: pMinY,
              width: pW,
              height: pH,
              points: relPoints,
              isClosed: ent.isClosed,
              stroke: strokeColor,
              strokeWidth: 1.5,
              fill: 'transparent',
              fillEnabled: false,
              fillOpacity: 0,
              opacity: 1,
              layerId,
            });
          }
          stats.polylines++;
        }
        break;
      }

      case 'CIRCLE': {
        if (ent.points[0] && ent.radius) {
          const center = cadToCanvas(ent.points[0]);
          const rPx = Math.max(ent.radius * unitMultiplier * effectiveScale, 2);
          const diam = Math.round(rPx * 2);
          parsedObjects.push({
            id: uid(),
            type: 'circle',
            x: Math.round(center.x - rPx),
            y: Math.round(center.y - rPx),
            width: diam,
            height: diam,
            stroke: strokeColor,
            strokeWidth: 1.5,
            fill: strokeColor,
            fillEnabled: false,
            fillOpacity: 0.1,
            opacity: 1,
            layerId,
          });
          stats.circles++;
        }
        break;
      }

      case 'ARC': {
        if (ent.points[0] && ent.radius) {
          const centerCad = ent.points[0];
          const r = ent.radius;
          let sa = ent.startAngle ?? 0;
          let ea = ent.endAngle ?? 360;
          if (ea <= sa) ea += 360;

          const sweep = ea - sa;
          const steps = Math.max(12, Math.min(48, Math.round(sweep / 8)));
          const arcPts: Point[] = [];

          for (let s = 0; s <= steps; s++) {
            const angDeg = sa + (sweep * s) / steps;
            const angRad = (angDeg * Math.PI) / 180;
            const pCad = {
              x: centerCad.x + r * Math.cos(angRad),
              y: centerCad.y + r * Math.sin(angRad),
            };
            arcPts.push(cadToCanvas(pCad));
          }

          if (arcPts.length >= 2) {
            const pMinX = Math.min(...arcPts.map((p) => p.x));
            const pMinY = Math.min(...arcPts.map((p) => p.y));
            const pMaxX = Math.max(...arcPts.map((p) => p.x));
            const pMaxY = Math.max(...arcPts.map((p) => p.y));
            const relPoints = arcPts.map((p) => ({ x: p.x - pMinX, y: p.y - pMinY }));

            parsedObjects.push({
              id: uid(),
              type: 'polyline',
              x: pMinX,
              y: pMinY,
              width: Math.max(pMaxX - pMinX, 2),
              height: Math.max(pMaxY - pMinY, 2),
              points: relPoints,
              isClosed: false,
              stroke: strokeColor,
              strokeWidth: 1.5,
              fill: 'transparent',
              fillEnabled: false,
              fillOpacity: 0,
              opacity: 1,
              layerId,
            });
            stats.polylines++;
          }
        }
        break;
      }

      case 'TEXT':
      case 'MTEXT': {
        if (ent.points[0] && ent.text) {
          const pt = cadToCanvas(ent.points[0]);
          const fontSize = Math.max(
            Math.round((ent.height || 0.35) * unitMultiplier * effectiveScale),
            9
          );
          parsedObjects.push({
            id: uid(),
            type: 'text',
            x: pt.x,
            y: pt.y - fontSize,
            width: Math.max(ent.text.length * (fontSize * 0.6), 40),
            height: fontSize + 6,
            text: ent.text,
            fontSize,
            textColor: strokeColor,
            bold: true,
            rotation: ent.rotation ? -Math.round(ent.rotation) : 0,
            stroke: 'transparent',
            strokeWidth: 0,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
            layerId,
          });
          stats.texts++;
        }
        break;
      }

      case 'DIMENSION': {
        if (ent.defPt1 && ent.defPt2) {
          const p1 = cadToCanvas(ent.defPt1);
          const p2 = cadToCanvas(ent.defPt2);
          const distPx = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const distMeters = distPx / effectiveScale;
          const dimText = ent.text || `${distMeters.toFixed(2)}m`;

          let dimType: 'dim-h' | 'dim-v' | 'dim-aligned' = 'dim-aligned';
          if (Math.abs(p2.y - p1.y) < 4) {
            dimType = 'dim-h';
          } else if (Math.abs(p2.x - p1.x) < 4) {
            dimType = 'dim-v';
          }

          parsedObjects.push({
            id: uid(),
            type: dimType,
            x: p1.x,
            y: p1.y,
            x2: p2.x,
            y2: p2.y,
            width: Math.abs(p2.x - p1.x),
            height: Math.abs(p2.y - p1.y),
            text: dimText,
            stroke: strokeColor || '#38bdf8',
            strokeWidth: 1.5,
            fill: 'transparent',
            fillEnabled: false,
            fillOpacity: 0,
            opacity: 1,
            layerId: 'layer-annotations',
          });
          stats.dimensions++;
        }
        break;
      }

      case 'SOLID': {
        if (ent.points.length >= 3) {
          const cPts = ent.points.map(cadToCanvas);
          const pMinX = Math.min(...cPts.map((p) => p.x));
          const pMinY = Math.min(...cPts.map((p) => p.y));
          const pMaxX = Math.max(...cPts.map((p) => p.x));
          const pMaxY = Math.max(...cPts.map((p) => p.y));
          const relPoints = cPts.map((p) => ({ x: p.x - pMinX, y: p.y - pMinY }));

          parsedObjects.push({
            id: uid(),
            type: 'polyline',
            x: pMinX,
            y: pMinY,
            width: Math.max(pMaxX - pMinX, 2),
            height: Math.max(pMaxY - pMinY, 2),
            points: relPoints,
            isClosed: true,
            stroke: strokeColor,
            strokeWidth: 1,
            fill: strokeColor,
            fillEnabled: true,
            fillOpacity: 0.8,
            opacity: 1,
            layerId,
          });
          stats.others++;
        }
        break;
      }
    }
  });

  return { parsedObjects, stats };
}
