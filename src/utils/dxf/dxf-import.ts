/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParseDXFResult } from "./dxf-types";
import { parseLosslessProject, tokenizeDXFPairs, parseHeaderSection } from "./dxf-tokenizer";
import { parseBlocksSection, parseEntitiesSection, expandBlockInserts } from "./dxf-entity-parser";
import { computeDXFBounds, resolveDXFUnit, calculateDXFProjection } from "./dxf-coordinate-transform";
import { buildCADObjectsFromEntities } from "./dxf-object-builder";

export type { ParseDXFResult, RawEntity, BlockDef } from "./dxf-types";

/**
 * Robust AutoCAD ASCII DXF parser
 * - 100% Lossless Studio roundtrip (reads embedded TCAD metadata when available)
 * - Reads DXF HEADER ($INSUNITS, $MEASUREMENT, extents) for exact unit scaling
 * - Supports BLOCKS and INSERT expansion
 * - Reads ENTITIES (LINE, LWPOLYLINE, POLYLINE, VERTEX, CIRCLE, ARC, TEXT, MTEXT, SOLID, DIMENSION)
 * - Fixes polyline coordinate storage (relative points) so placement is never doubled
 * - Accurately projects Cartesian Y-up CAD coordinates to Canvas Y-down coordinates
 */
export function parseDXF(
  dxfText: string,
  targetScaleFactor = 20,
  canvasW = 1600,
  canvasH = 1000
): ParseDXFResult {
  // 1. Check for Lossless Studio Project Metadata (TCAD comments 999)
  const losslessResult = parseLosslessProject(dxfText, targetScaleFactor, canvasW, canvasH);
  if (losslessResult) {
    return losslessResult;
  }

  // 2. Tokenize standard AutoCAD DXF group code & value pairs
  const pairs = tokenizeDXFPairs(dxfText);

  // 3. Parse HEADER section ($INSUNITS, $MEASUREMENT)
  const { headerInsUnits, headerMeasurement } = parseHeaderSection(pairs);

  // 4. Parse BLOCKS section (for INSERT references)
  const blocksMap = parseBlocksSection(pairs);

  // 5. Parse ENTITIES section
  const { rawEntities, layersSet } = parseEntitiesSection(pairs);

  // 6. Expand INSERT block references into actual geometry
  const { finalEntities, insertCount } = expandBlockInserts(rawEntities, blocksMap);

  // 7. Calculate AutoCAD World Bounding Box (in CAD units)
  const bounds = computeDXFBounds(finalEntities);

  // 8. Intelligent Unit Resolution (Millimeters vs Meters vs Imperial)
  const { unitMultiplier, unitName } = resolveDXFUnit(
    headerInsUnits,
    headerMeasurement,
    bounds.rawSpanX,
    bounds.rawSpanY
  );

  // 9. Scale & Centering Calculations (Preserves Exact 1:1 Dimensions!)
  const { effectiveScale, cadToCanvas } = calculateDXFProjection(
    bounds,
    unitMultiplier,
    targetScaleFactor,
    canvasW,
    canvasH
  );

  // 10. Construct CADObjects with Perfect Dimensions & Relative Points
  const { parsedObjects, stats } = buildCADObjectsFromEntities(
    finalEntities,
    cadToCanvas,
    unitMultiplier,
    effectiveScale,
    insertCount
  );

  return {
    objects: parsedObjects,
    layersFound: Array.from(layersSet),
    stats,
    scaleFactor: effectiveScale,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
    unit: unitName,
  };
}
