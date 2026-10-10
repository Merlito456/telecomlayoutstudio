/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADLayer, CADObject, ProjectSettings } from '../../types/cad';
import { DEFAULT_LAYERS } from '../cad-layers';
import { sanitizeLayerName } from './dxf-color-utils';
import { generateDxfHeaderSection, generateDxfTablesSection } from './dxf-header-tables';
import { exportObjectEntity } from './dxf-entity-export';

export { sanitizeLayerName } from './dxf-color-utils';

/**
 * Export all CAD objects to standard AutoCAD ASCII DXF (Release 2000 / AC1015 format)
 * Units: Meters (converted from pixel scaleFactor)
 * Coordinate system: Inverted Y (AutoCAD Cartesian Y-up)
 */
export function exportToDXF(
  settings: ProjectSettings,
  objects: CADObject[],
  layersList: CADLayer[] = DEFAULT_LAYERS
): string {
  const scale = settings.scaleFactor || 20; // px per meter
  const canvasH = settings.canvasHeight || 1000;

  // Convert canvas pixel point (x, y down) to AutoCAD real-world coordinate (meters, y up)
  const toCadCoord = (x: number, y: number): { x: number; y: number } => {
    return {
      x: +(x / scale).toFixed(4),
      y: +((canvasH - y) / scale).toFixed(4),
    };
  };

  const lines: string[] = [];

  // 1. HEADER SECTION
  lines.push(...generateDxfHeaderSection(settings, objects, scale, canvasH, toCadCoord));

  // 2. TABLES SECTION
  lines.push(...generateDxfTablesSection(layersList));

  // 3. BLOCKS SECTION
  lines.push('  0', 'SECTION');
  lines.push('  2', 'BLOCKS');
  lines.push('  0', 'ENDSEC');

  // 4. ENTITIES SECTION
  lines.push('  0', 'SECTION');
  lines.push('  2', 'ENTITIES');

  objects.forEach((obj) => {
    exportObjectEntity(obj, lines, toCadCoord, scale, layersList, objects);
  });

  lines.push('  0', 'ENDSEC');
  lines.push('  0', 'EOF');

  return lines.join('\r\n');
}

/**
 * Triggers browser download of standard AutoCAD DXF file
 */
export function downloadDXFFile(
  settings: ProjectSettings,
  objects: CADObject[],
  layersList?: CADLayer[]
) {
  const dxfString = exportToDXF(settings, objects, layersList);
  const blob = new Blob([dxfString], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = settings.fileName.replace(/[^a-z0-9_-]/gi, '_') || 'telecom_site_plan';
  a.href = url;
  a.download = `${safeName}.dxf`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Check if a text payload or filename is an AutoCAD DXF format
 */
export function isDXFContent(content: string, filename?: string): boolean {
  if (filename && filename.toLowerCase().endsWith('.dxf')) return true;
  const upper = content.substring(0, 1000).toUpperCase();
  return (
    upper.includes('SECTION') &&
    (upper.includes('HEADER') || upper.includes('TABLES') || upper.includes('ENTITIES'))
  );
}
