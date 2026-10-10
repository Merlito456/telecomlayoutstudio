import { CADLayer, CADObject, ProjectSettings } from '../../types/cad';
import { hexToACI, sanitizeLayerName } from './dxf-color-utils';

export function generateDxfHeaderSection(
  settings: ProjectSettings,
  objects: CADObject[],
  scale: number,
  canvasH: number,
  toCadCoord: (x: number, y: number) => { x: number; y: number }
): string[] {
  const lines: string[] = [];
  lines.push('  0', 'SECTION');
  lines.push('  2', 'HEADER');
  lines.push('  9', '$ACADVER');
  lines.push('  1', 'AC1015');

  const projectMetadata = {
    app: 'telecom-site-studio',
    version: 1,
    scaleFactor: scale,
    canvasWidth: settings.canvasWidth,
    canvasHeight: canvasH,
    objects,
  };
  const metaStr = JSON.stringify(projectMetadata);
  lines.push('  999', 'TELECOM_STUDIO_START');
  const chunkSize = 200;
  for (let i = 0; i < metaStr.length; i += chunkSize) {
    lines.push('  999', 'TCAD:' + metaStr.substring(i, i + chunkSize));
  }
  lines.push('  999', 'TELECOM_STUDIO_END');

  lines.push('  9', '$INSUNITS');
  lines.push(' 70', '6'); // 6 = Meters
  lines.push('  9', '$MEASUREMENT');
  lines.push(' 70', '1'); // 1 = Metric
  lines.push('  9', '$EXTMIN');
  lines.push(' 10', '0.0');
  lines.push(' 20', '0.0');
  lines.push(' 30', '0.0');
  lines.push('  9', '$EXTMAX');
  const maxCoords = toCadCoord(settings.canvasWidth || 1600, 0);
  lines.push(' 10', maxCoords.x.toString());
  lines.push(' 20', maxCoords.y.toString());
  lines.push(' 30', '0.0');
  lines.push('  0', 'ENDSEC');
  return lines;
}

export function generateDxfTablesSection(layersList: CADLayer[]): string[] {
  const lines: string[] = [];
  lines.push('  0', 'SECTION');
  lines.push('  2', 'TABLES');

  // VPORT Table
  lines.push('  0', 'TABLE');
  lines.push('  2', 'VPORT');
  lines.push(' 70', '1');
  lines.push('  0', 'VPORT');
  lines.push('  2', '*ACTIVE');
  lines.push(' 70', '0');
  lines.push(' 10', '0.0');
  lines.push(' 20', '0.0');
  lines.push(' 11', '1.0');
  lines.push(' 21', '1.0');
  lines.push('  0', 'ENDTAB');

  // LTYPE Table
  lines.push('  0', 'TABLE');
  lines.push('  2', 'LTYPE');
  lines.push(' 70', '3');
  lines.push('  0', 'LTYPE');
  lines.push('  2', 'CONTINUOUS');
  lines.push(' 70', '0');
  lines.push('  3', 'Solid line');
  lines.push(' 72', '65');
  lines.push(' 73', '0');
  lines.push(' 40', '0.0');
  lines.push('  0', 'LTYPE');
  lines.push('  2', 'DASHED');
  lines.push(' 70', '0');
  lines.push('  3', 'Dashed __ __ __ __');
  lines.push(' 72', '65');
  lines.push(' 73', '2');
  lines.push(' 40', '1.0');
  lines.push(' 49', '0.75');
  lines.push(' 49', '-0.25');
  lines.push('  0', 'ENDTAB');

  // LAYER Table
  lines.push('  0', 'TABLE');
  lines.push('  2', 'LAYER');
  lines.push(' 70', (layersList.length + 1).toString());

  lines.push('  0', 'LAYER');
  lines.push('  2', '0');
  lines.push(' 70', '0');
  lines.push(' 62', '7');
  lines.push('  6', 'CONTINUOUS');

  layersList.forEach((layer) => {
    const lName = sanitizeLayerName(layer.name || layer.id);
    const aciColor = hexToACI(layer.color);
    lines.push('  0', 'LAYER');
    lines.push('  2', lName);
    lines.push(' 70', '0');
    lines.push(' 62', aciColor.toString());
    lines.push('  6', 'CONTINUOUS');
  });
  lines.push('  0', 'ENDTAB');

  // STYLE Table
  lines.push('  0', 'TABLE');
  lines.push('  2', 'STYLE');
  lines.push(' 70', '1');
  lines.push('  0', 'STYLE');
  lines.push('  2', 'STANDARD');
  lines.push(' 70', '0');
  lines.push(' 40', '0.0');
  lines.push(' 41', '1.0');
  lines.push(' 50', '0.0');
  lines.push(' 71', '0');
  lines.push(' 42', '0.2');
  lines.push('  3', 'txt');
  lines.push('  4', '');
  lines.push('  0', 'ENDTAB');

  lines.push('  0', 'ENDSEC');
  return lines;
}
