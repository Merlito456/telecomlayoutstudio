/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from "../../types/cad";
import { DXFPair, ParseDXFResult } from "./dxf-types";

/**
 * Checks and parses Lossless Studio Project Metadata (TCAD comments 999)
 */
export function parseLosslessProject(
  dxfText: string,
  targetScaleFactor: number,
  canvasW: number,
  canvasH: number
): ParseDXFResult | null {
  if (!dxfText.includes('TELECOM_STUDIO_START') || !dxfText.includes('TCAD:')) {
    return null;
  }

  try {
    const lines = dxfText.split(/\r\n|\r|\n/);
    let inMeta = false;
    const chunks: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === 'TELECOM_STUDIO_START') {
        inMeta = true;
        continue;
      }
      if (line === 'TELECOM_STUDIO_END') {
        inMeta = false;
        break;
      }
      if (inMeta) {
        if (line.startsWith('TCAD:')) {
          chunks.push(line.substring(5));
        } else if (lines[i - 1]?.trim() === '999' && line.startsWith('TCAD:')) {
          chunks.push(line.substring(5));
        }
      }
    }

    if (chunks.length > 0) {
      const fullJson = chunks.join('');
      const projectData = JSON.parse(fullJson);
      if (projectData && Array.isArray(projectData.objects) && projectData.objects.length > 0) {
        const layersSet = new Set<string>();
        let linesCnt = 0;
        let polyCnt = 0;
        let circCnt = 0;
        let textCnt = 0;
        let dimCnt = 0;
        let otherCnt = 0;

        projectData.objects.forEach((o: CADObject) => {
          if (o.layerId) layersSet.add(o.layerId);
          if (o.type === 'line') linesCnt++;
          else if (o.type === 'polyline' || o.type === 'rectangle') polyCnt++;
          else if (o.type === 'circle') circCnt++;
          else if (o.type === 'text') textCnt++;
          else if (o.type === 'dim-h' || o.type === 'dim-v' || o.type === 'dim-aligned') dimCnt++;
          else otherCnt++;
        });

        return {
          objects: projectData.objects,
          layersFound: Array.from(layersSet),
          stats: {
            lines: linesCnt,
            polylines: polyCnt,
            circles: circCnt,
            texts: textCnt,
            dimensions: dimCnt,
            inserts: 0,
            others: otherCnt,
          },
          scaleFactor: projectData.scaleFactor || targetScaleFactor,
          canvasWidth: projectData.canvasWidth || canvasW,
          canvasHeight: projectData.canvasHeight || canvasH,
          isLosslessStudioProject: true,
          unit: 'Meters',
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse embedded studio metadata, falling back to standard DXF entity parsing:', e);
  }

  return null;
}

/**
 * Tokenize standard AutoCAD DXF group code & value pairs
 */
export function tokenizeDXFPairs(dxfText: string): DXFPair[] {
  const rawLines = dxfText.split(/\r\n|\r|\n/);
  const pairs: DXFPair[] = [];

  for (let i = 0; i < rawLines.length - 1; i += 2) {
    const code = parseInt(rawLines[i].trim(), 10);
    const value = rawLines[i + 1]?.trim() ?? '';
    if (!isNaN(code)) {
      pairs.push({ code, value });
    }
  }

  return pairs;
}

/**
 * Reads HEADER section for $INSUNITS and $MEASUREMENT
 */
export function parseHeaderSection(pairs: DXFPair[]): {
  headerInsUnits: number | null;
  headerMeasurement: number | null;
} {
  let headerInsUnits: number | null = null;
  let headerMeasurement: number | null = null; // 0 = english, 1 = metric

  let currentSection = '';
  for (let idx = 0; idx < pairs.length; idx++) {
    const { code, value } = pairs[idx];
    if (code === 0) {
      if (value === 'SECTION') {
        const next = pairs[idx + 1];
        if (next && next.code === 2) {
          currentSection = next.value;
          idx++;
        }
      } else if (value === 'ENDSEC') {
        currentSection = '';
      }
    } else if (currentSection === 'HEADER') {
      if (code === 9 && value === '$INSUNITS') {
        const next = pairs[idx + 1];
        if (next && next.code === 70) {
          headerInsUnits = parseInt(next.value, 10);
          idx++;
        }
      } else if (code === 9 && value === '$MEASUREMENT') {
        const next = pairs[idx + 1];
        if (next && next.code === 70) {
          headerMeasurement = parseInt(next.value, 10);
          idx++;
        }
      }
    }
  }

  return { headerInsUnits, headerMeasurement };
}
