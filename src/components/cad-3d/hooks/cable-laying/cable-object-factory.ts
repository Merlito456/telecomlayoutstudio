import { CADObject } from '../../../../types/cad';
import { CableCategoryType } from '../../../../utils/cad-geometry/cable-length-calculator';
import { CablePreset } from '../../cable-presets';

function mapPresetToCategory(presetId: string): CableCategoryType {
  if (presetId.includes('dc')) return 'dc-power';
  if (presetId.includes('ac')) return 'ac-power';
  if (presetId.includes('gnd') || presetId.includes('ground')) return 'ground';
  if (presetId.includes('fiber')) return 'fiber';
  if (presetId.includes('coax') || presetId.includes('rf')) return 'rf-coax';
  return 'custom';
}

export function createCableCADObject(
  pts2D: Array<{ x: number; y: number }>,
  preset: CablePreset,
  wps3D?: Array<{ x3D: number; y3D: number; z3D: number; x2D: number; y2D: number; snapLabel?: string }>
): CADObject | null {
  if (pts2D.length < 2) return null;

  const category = mapPresetToCategory(preset.id);

  // If two points are directly vertical (straight upward riser to ladder), keep a tiny 2D offset so 2D canvas is valid
  const cleanPts2D = pts2D.map((pt, idx) => {
    if (idx > 0) {
      const prev = pts2D[idx - 1];
      if (Math.abs(pt.x - prev.x) < 0.5 && Math.abs(pt.y - prev.y) < 0.5) {
        return { x: pt.x + 1, y: pt.y + 1 };
      }
    }
    return pt;
  });

  const waypoints3DData = wps3D
    ? wps3D.map((wp) => ({
        x3D: wp.x3D,
        y3D: wp.y3D,
        z3D: wp.z3D,
        x2D: wp.x2D,
        y2D: wp.y2D,
        snapLabel: wp.snapLabel,
      }))
    : undefined;

  if (cleanPts2D.length === 2 && (!waypoints3DData || waypoints3DData.length <= 2)) {
    const p1 = cleanPts2D[0];
    const p2 = cleanPts2D[1];
    return {
      id: 'cable3d_route_' + Math.random().toString(36).substring(2, 9),
      type: 'line',
      isCable: true,
      cableType: category,
      x: Math.round(p1.x),
      y: Math.round(p1.y),
      x2: Math.round(p2.x),
      y2: Math.round(p2.y),
      width: Math.max(1, Math.abs(Math.round(p2.x) - Math.round(p1.x))),
      height: Math.max(1, Math.abs(Math.round(p2.y) - Math.round(p1.y))),
      stroke: preset.color,
      draftingColor: preset.color,
      strokeWidth: 3,
      fill: 'transparent',
      fillEnabled: false,
      fillOpacity: 0,
      opacity: 1,
      layerId: 'layer-cabling',
      placement: preset.id.includes('indoor') ? 'indoor' : undefined,
      waypoints3D: waypoints3DData,
      customProps: {
        presetId: preset.id,
        placement: preset.id.includes('indoor') ? 'indoor' : undefined,
        isIndoor: preset.id.includes('indoor'),
        waypoints3D: waypoints3DData,
      },
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const wp of cleanPts2D) {
    if (wp.x < minX) minX = wp.x;
    if (wp.y < minY) minY = wp.y;
    if (wp.x > maxX) maxX = wp.x;
    if (wp.y > maxY) maxY = wp.y;
  }

  return {
    id: 'cable3d_route_' + Math.random().toString(36).substring(2, 9),
    type: 'polyline',
    isCable: true,
    cableType: category,
    x: Math.round(minX),
    y: Math.round(minY),
    width: Math.max(4, Math.round(maxX - minX)),
    height: Math.max(4, Math.round(maxY - minY)),
    points: cleanPts2D.map((wp) => ({
      x: Math.round(wp.x - minX),
      y: Math.round(wp.y - minY),
    })),
    stroke: preset.color,
    draftingColor: preset.color,
    strokeWidth: 3,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
    layerId: 'layer-cabling',
    placement: preset.id.includes('indoor') ? 'indoor' : undefined,
    waypoints3D: waypoints3DData,
    customProps: {
      presetId: preset.id,
      placement: preset.id.includes('indoor') ? 'indoor' : undefined,
      isIndoor: preset.id.includes('indoor'),
      waypoints3D: waypoints3DData,
    },
  };
}
