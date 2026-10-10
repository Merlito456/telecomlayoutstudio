/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings } from '../../types/cad';
import { getObjectBounds } from './bounds-handles';
import { getUnpackedCADObjects, isIndoorCable } from './cable-predicates';
import { detectPresetForTarget } from '../../components/cad-3d/cable-presets';

export type CableCategoryType =
  | 'dc-power'
  | 'ac-power'
  | 'fiber'
  | 'ground'
  | 'rf-coax'
  | 'cat6'
  | 'control'
  | 'ladder-tray'
  | 'custom';

export interface CableTypeMetadata {
  id: CableCategoryType;
  label: string;
  defaultColor: string;
  nominalSpecs: string;
  defaultVerticalDropM: number;
  defaultSlackPct: number;
}

export const CABLE_TYPE_DEFINITIONS: Record<CableCategoryType, CableTypeMetadata> = {
  'dc-power': {
    id: 'dc-power',
    label: 'DC Power (-48V / +24V)',
    defaultColor: '#0284c7', // Sky Blue
    nominalSpecs: '2x35mm² Cu / -48V DC Dual Feed',
    defaultVerticalDropM: 2.5,
    defaultSlackPct: 5,
  },
  'ac-power': {
    id: 'ac-power',
    label: 'AC Mains Power (3-Phase / 230V)',
    defaultColor: '#ef4444', // Red
    nominalSpecs: '4-Core 16mm² XLPE/SWA/PVC Armored',
    defaultVerticalDropM: 2.8,
    defaultSlackPct: 5,
  },
  'fiber': {
    id: 'fiber',
    label: 'Optical Fiber Cable (SM/MM)',
    defaultColor: '#f59e0b', // Amber / Yellow
    nominalSpecs: '12/24-Core Armored Outdoor Loose Tube Fiber',
    defaultVerticalDropM: 2.5,
    defaultSlackPct: 10, // Higher service loop for splicing
  },
  'ground': {
    id: 'ground',
    label: 'Earth Grounding / PE (Lightning)',
    defaultColor: '#16a34a', // Green
    nominalSpecs: '50mm² Bare / Green-Yellow Annealed Copper',
    defaultVerticalDropM: 1.5,
    defaultSlackPct: 5,
  },
  'rf-coax': {
    id: 'rf-coax',
    label: 'RF Coaxial Feeder / Jumper',
    defaultColor: '#475569', // Slate
    nominalSpecs: '7/8" / 1/2" Superflexible Coaxial Feeder',
    defaultVerticalDropM: 4.0,
    defaultSlackPct: 5,
  },
  'cat6': {
    id: 'cat6',
    label: 'Ethernet CAT6 UTP / STP',
    defaultColor: '#a855f7', // Violet
    nominalSpecs: '4-Pair 23 AWG Shielded Outdoor UV-Rated',
    defaultVerticalDropM: 2.0,
    defaultSlackPct: 5,
  },
  'control': {
    id: 'control',
    label: 'Alarms & Control Bus',
    defaultColor: '#06b6d4', // Cyan
    nominalSpecs: 'Multi-pair Shielded Sensor / Alarm Wire',
    defaultVerticalDropM: 1.8,
    defaultSlackPct: 5,
  },
  'ladder-tray': {
    id: 'ladder-tray',
    label: 'Cable Ladder / Tray Run',
    defaultColor: '#94a3b8', // Galvanized Gray
    nominalSpecs: '300mm / 400mm HDG Overhead Steel Ladder',
    defaultVerticalDropM: 0,
    defaultSlackPct: 0,
  },
  'custom': {
    id: 'custom',
    label: 'General Cable Route',
    defaultColor: '#38bdf8',
    nominalSpecs: 'Standard Telecom Cable Run',
    defaultVerticalDropM: 2.0,
    defaultSlackPct: 5,
  },
};

export interface CableLengthResult {
  horizontalM: number;
  verticalDropM: number;
  slackPct: number;
  slackFixedM: number;
  slackM: number;
  totalLengthM: number;
  totalLengthFt: number;
  segmentLengthsM: number[];
  waypointCount: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

/**
 * Checks whether a CADObject represents a cable run, conduit, or cable containment infrastructure.
 */
export function isCableObject(obj: CADObject): boolean {
  if (obj.isCable === true) return true;
  if (obj.cableType && obj.cableType !== 'custom') return true;
  if (obj.layerId === 'layer-cabling') return true;
  if (obj.id.startsWith('cable3d_') || obj.id.startsWith('cable_') || obj.id.startsWith('wire_')) return true;

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  if (sId.includes('cable-tray') || sId.includes('connecting-ladder') || sId.includes('basepad-ladder')) {
    return true;
  }

  // Linear elements that can be measured as cable runs
  if (obj.type === 'line' || obj.type === 'polyline' || obj.type === 'pen') {
    return true;
  }

  return false;
}

/**
 * Infers the cable type from object properties (color, tag, stencilId, layer).
 */
export function inferCableType(obj: CADObject): CableCategoryType {
  if (obj.cableType) return obj.cableType;

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  if (sId.includes('tray') || sId.includes('ladder')) return 'ladder-tray';

  const stroke = (obj.stroke || obj.draftingColor || '').toLowerCase();
  // Color inference
  if (stroke === '#0284c7' || stroke === '#2563eb' || stroke.includes('blue')) return 'dc-power';
  if (stroke === '#ef4444' || stroke === '#dc2626' || stroke.includes('red')) return 'ac-power';
  if (stroke === '#f59e0b' || stroke === '#eab308' || stroke === '#facc15' || stroke.includes('amber') || stroke.includes('yellow')) return 'fiber';
  if (stroke === '#16a34a' || stroke === '#22c55e' || stroke === '#10b981' || stroke.includes('green')) return 'ground';
  if (stroke === '#a855f7' || stroke.includes('purple') || stroke.includes('violet')) return 'cat6';
  if (stroke === '#475569' || stroke === '#64748b' || stroke.includes('slate')) return 'rf-coax';

  const text = (obj.text || obj.fromLabel || obj.toLabel || '').toLowerCase();
  if (text.includes('dc') || text.includes('rectifier') || text.includes('-48v')) return 'dc-power';
  if (text.includes('ac') || text.includes('ats') || text.includes('acpdb') || text.includes('mains')) return 'ac-power';
  if (text.includes('fiber') || text.includes('olt') || text.includes('optic')) return 'fiber';
  if (text.includes('ground') || text.includes('earth') || text.includes('pe')) return 'ground';
  if (text.includes('coax') || text.includes('feeder') || text.includes('antenna')) return 'rf-coax';

  return 'custom';
}

/**
 * Automatically calculates the exact real-world length of any cable, line, polyline, or tray.
 */
export function calculateCableLength(
  obj: CADObject,
  scaleFactor = 20,
  overrides?: {
    verticalDropM?: number;
    slackPct?: number;
    slackFixedM?: number;
  }
): CableLengthResult {
  const sf = Math.max(0.1, scaleFactor);
  const segmentsM: number[] = [];
  let startPt = { x: obj.x, y: obj.y };
  let endPt = { x: obj.x, y: obj.y };

  if (obj.type === 'line') {
    const x2 = obj.x2 ?? (obj.x + (obj.width || 0));
    const y2 = obj.y2 ?? (obj.y + (obj.height || 0));
    const segPx = Math.hypot(x2 - obj.x, y2 - obj.y);
    const segM = segPx / sf;
    segmentsM.push(segM);
    startPt = { x: obj.x, y: obj.y };
    endPt = { x: x2, y: y2 };
  } else if ((obj.type === 'polyline' || obj.type === 'pen') && obj.points && obj.points.length >= 2) {
    startPt = { x: obj.x + obj.points[0].x, y: obj.y + obj.points[0].y };
    const lastP = obj.points[obj.points.length - 1];
    endPt = { x: obj.x + lastP.x, y: obj.y + lastP.y };

    for (let i = 0; i < obj.points.length - 1; i++) {
      const p1 = obj.points[i];
      const p2 = obj.points[i + 1];
      const segPx = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      segmentsM.push(segPx / sf);
    }
  } else {
    // Single dimensional runs e.g. stretchable trays/ladders
    const distPx = Math.max(obj.width || 0, obj.height || 0);
    const segM = distPx / sf;
    segmentsM.push(segM);
    endPt = { x: obj.x + (obj.width || 0), y: obj.y + (obj.height || 0) };
  }

  const horizontalM = segmentsM.reduce((sum, len) => sum + len, 0);

  // Inferred default drops and slacks if not explicitly specified
  const cType = inferCableType(obj);
  const defMeta = CABLE_TYPE_DEFINITIONS[cType] || CABLE_TYPE_DEFINITIONS.custom;

  const verticalDropM =
    overrides?.verticalDropM !== undefined
      ? overrides.verticalDropM
      : obj.cableVerticalDropM ?? obj.customProps?.cableVerticalDropM ?? (cType === 'ladder-tray' ? 0 : defMeta.defaultVerticalDropM);

  const slackPct =
    overrides?.slackPct !== undefined
      ? overrides.slackPct
      : obj.cableSlackPct ?? obj.customProps?.cableSlackPct ?? (cType === 'ladder-tray' ? 0 : defMeta.defaultSlackPct);

  const slackFixedM =
    overrides?.slackFixedM !== undefined
      ? overrides.slackFixedM
      : obj.cableSlackFixedM ?? obj.customProps?.cableSlackFixedM ?? 0;

  const slackM = ((horizontalM + verticalDropM) * (slackPct / 100)) + slackFixedM;
  const totalLengthM = horizontalM + verticalDropM + slackM;
  const totalLengthFt = totalLengthM * 3.28084;

  return {
    horizontalM,
    verticalDropM,
    slackPct,
    slackFixedM,
    slackM,
    totalLengthM,
    totalLengthFt,
    segmentLengthsM: segmentsM,
    waypointCount: segmentsM.length + 1,
    startPoint: startPt,
    endPoint: endPt,
  };
}

/**
 * Automatically inspects the site and detects which telecom equipment is connected
 * at the start and end of this cable run.
 */
export function detectCableEndpoints(
  obj: CADObject,
  allObjects: CADObject[],
  snapRadiusPx = 50
): { fromEquipment: string; toEquipment: string; fromObject?: CADObject | null; toObject?: CADObject | null } {
  // If explicitly labeled by user, prioritize those
  if (obj.fromLabel && obj.toLabel) {
    return { fromEquipment: obj.fromLabel, toEquipment: obj.toLabel };
  }

  const unpacked = getUnpackedCADObjects(allObjects);
  const calc = calculateCableLength(obj, 20);
  const startPt = calc.startPoint;
  const endPt = calc.endPoint;

  const findNearest = (pt: { x: number; y: number }, excludeId: string): { name: string; obj: CADObject | null } => {
    let nearestName = 'Terminal Termination Point';
    let nearestObj: CADObject | null = null;
    let minDistance = snapRadiusPx;

    for (const other of unpacked) {
      if (other.id === excludeId || other.id === obj.id) continue;
      if (other.type === 'line' || other.type === 'dim-h' || other.type === 'dim-v' || other.type === 'leader') {
        continue;
      }

      const bounds = getObjectBounds(other);
      const cx = (bounds.minX + bounds.maxX) / 2;
      const cy = (bounds.minY + bounds.maxY) / 2;
      const dCenter = Math.hypot(pt.x - cx, pt.y - cy);
      const dBox = Math.max(0, Math.min(
        Math.hypot(pt.x - bounds.minX, pt.y - bounds.minY),
        Math.hypot(pt.x - bounds.maxX, pt.y - bounds.minY),
        Math.hypot(pt.x - bounds.minX, pt.y - bounds.maxY),
        Math.hypot(pt.x - bounds.maxX, pt.y - bounds.maxY),
        dCenter
      ));

      if (dBox < minDistance) {
        minDistance = dBox;
        const name =
          other.text ||
          other.customProps?.name ||
          (other.stencilId ? other.stencilId.replace(/-/g, ' ').toUpperCase() : other.type.toUpperCase());
        nearestName = name;
        nearestObj = other;
      }
    }

    return { name: nearestName, obj: nearestObj };
  };

  const startRes = findNearest(startPt, obj.id);
  const endRes = findNearest(endPt, obj.id);

  const fromEq = obj.fromLabel || startRes.name;
  const toEq = obj.toLabel || endRes.name;

  return {
    fromEquipment: fromEq,
    toEquipment: toEq === fromEq ? `${toEq} (Remote Terminal)` : toEq,
    fromObject: startRes.obj,
    toObject: endRes.obj,
  };
}

/**
 * Automatically inspects the cable run and its terminal equipment to detect the
 * correct telecom color coding, cable preset, and category.
 * Highly responsive to in-shelter cabling (Rectifiers -> Blue, OLT -> Amber,
 * In-Shelter Cable Ladders -> Yellow, AC Units -> Red, MGB -> Green).
 */
export function detectAutoColorForCable(
  cable: CADObject,
  allObjects: CADObject[]
): {
  stroke: string;
  cableType: CableCategoryType;
  presetId: string;
  label: string;
} | null {
  const endpoints = detectCableEndpoints(cable, allObjects, 65);
  const fromObj = endpoints.fromObject;
  const toObj = endpoints.toObject;

  // 1. Try detecting from connected endpoints
  const presetFromEnd = toObj ? detectPresetForTarget(toObj) : null;
  const presetFromStart = fromObj ? detectPresetForTarget(fromObj) : null;
  const presetFromLabels =
    detectPresetForTarget(endpoints.toEquipment) ||
    detectPresetForTarget(endpoints.fromEquipment);

  const matchedPreset = presetFromEnd || presetFromStart || presetFromLabels;

  if (matchedPreset) {
    let cat: CableCategoryType = 'custom';
    if (matchedPreset.id === 'dc-blue') cat = 'dc-power';
    else if (matchedPreset.id === 'ac-red') cat = 'ac-power';
    else if (matchedPreset.id === 'fiber-amber') cat = 'fiber';
    else if (matchedPreset.id === 'gnd-green') cat = 'ground';
    else if (matchedPreset.id === 'coax-slate') cat = 'rf-coax';
    else if (matchedPreset.id === 'indoor-yellow') cat = 'fiber';

    return {
      stroke: matchedPreset.color,
      cableType: cat,
      presetId: matchedPreset.id,
      label: matchedPreset.label,
    };
  }

  // 2. If inside shelter with no specific equipment matched, default to In-Shelter Cable (Yellow)
  if (isIndoorCable(cable, allObjects)) {
    return {
      stroke: '#facc15',
      cableType: 'fiber',
      presetId: 'indoor-yellow',
      label: 'Indoor Cable (Yellow)',
    };
  }

  return null;
}

export interface CableScheduleItem {
  id: string;
  tag: string;
  type: CableCategoryType;
  label: string;
  color: string;
  specs: string;
  fromEquipment: string;
  toEquipment: string;
  horizontalM: number;
  verticalDropM: number;
  slackPct: number;
  slackM: number;
  totalLengthM: number;
  totalLengthFt: number;
  segmentsCount: number;
}

export interface SiteCableSchedule {
  items: CableScheduleItem[];
  totalsByCategory: Record<CableCategoryType, { lengthM: number; count: number; color: string }>;
  grandTotalLengthM: number;
  grandTotalLengthFt: number;
  totalCableCount: number;
  totalContainmentLengthM: number;
}

/**
 * Compiles a comprehensive Bill of Materials (BOM) & Cable Schedule for all cables on the telecom site.
 */
export function calculateSiteCableSchedule(
  allObjects: CADObject[],
  scaleFactor = 20
): SiteCableSchedule {
  const items: CableScheduleItem[] = [];

  const totalsByCategory: Record<CableCategoryType, { lengthM: number; count: number; color: string }> = {
    'dc-power': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['dc-power'].defaultColor },
    'ac-power': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['ac-power'].defaultColor },
    'fiber': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['fiber'].defaultColor },
    'ground': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['ground'].defaultColor },
    'rf-coax': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['rf-coax'].defaultColor },
    'cat6': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['cat6'].defaultColor },
    'control': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['control'].defaultColor },
    'ladder-tray': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['ladder-tray'].defaultColor },
    'custom': { lengthM: 0, count: 0, color: CABLE_TYPE_DEFINITIONS['custom'].defaultColor },
  };

  let grandTotalM = 0;
  let containmentTotalM = 0;
  let indexCounter = 1;

  for (const obj of allObjects) {
    if (!isCableObject(obj)) continue;

    const calc = calculateCableLength(obj, scaleFactor);
    // Ignore micro artifacts less than 0.2 meters
    if (calc.horizontalM < 0.2) continue;

    const cType = inferCableType(obj);
    const meta = CABLE_TYPE_DEFINITIONS[cType] || CABLE_TYPE_DEFINITIONS.custom;
    const endpoints = detectCableEndpoints(obj, allObjects);
    const tag = obj.cableTag || `CBL-${cType.substring(0, 3).toUpperCase()}-${String(indexCounter++).padStart(2, '0')}`;

    const item: CableScheduleItem = {
      id: obj.id,
      tag,
      type: cType,
      label: meta.label,
      color: obj.stroke || obj.draftingColor || meta.defaultColor,
      specs: meta.nominalSpecs,
      fromEquipment: endpoints.fromEquipment,
      toEquipment: endpoints.toEquipment,
      horizontalM: parseFloat(calc.horizontalM.toFixed(2)),
      verticalDropM: parseFloat(calc.verticalDropM.toFixed(2)),
      slackPct: calc.slackPct,
      slackM: parseFloat(calc.slackM.toFixed(2)),
      totalLengthM: parseFloat(calc.totalLengthM.toFixed(2)),
      totalLengthFt: parseFloat(calc.totalLengthFt.toFixed(2)),
      segmentsCount: calc.segmentLengthsM.length,
    };

    items.push(item);

    totalsByCategory[cType].lengthM += item.totalLengthM;
    totalsByCategory[cType].count += 1;

    if (cType === 'ladder-tray') {
      containmentTotalM += item.totalLengthM;
    } else {
      grandTotalM += item.totalLengthM;
    }
  }

  return {
    items,
    totalsByCategory,
    grandTotalLengthM: parseFloat(grandTotalM.toFixed(2)),
    grandTotalLengthFt: parseFloat((grandTotalM * 3.28084).toFixed(2)),
    totalCableCount: items.filter((i) => i.type !== 'ladder-tray').length,
    totalContainmentLengthM: parseFloat(containmentTotalM.toFixed(2)),
  };
}

/**
 * Exports the calculated cable schedule to standardized CSV format for spreadsheet & procurement.
 */
export function generateCableScheduleCSV(schedule: SiteCableSchedule, projectName = 'Site_Layout'): string {
  const headers = [
    'Tag',
    'Category',
    'Description',
    'From Origin',
    'To Destination',
    'Horizontal Run (m)',
    'Vertical Drop (m)',
    'Slack (%)',
    'Slack (m)',
    'Total Length (m)',
    'Total Length (ft)',
    'Specifications',
  ];

  const rows = schedule.items.map((item) => [
    `"${item.tag}"`,
    `"${item.label}"`,
    `"${item.type}"`,
    `"${item.fromEquipment}"`,
    `"${item.toEquipment}"`,
    item.horizontalM.toFixed(2),
    item.verticalDropM.toFixed(2),
    `${item.slackPct}%`,
    item.slackM.toFixed(2),
    item.totalLengthM.toFixed(2),
    item.totalLengthFt.toFixed(2),
    `"${item.specs}"`,
  ]);

  const summary = [
    '',
    `"SUMMARY: TOTAL SITE CABLE RUN"`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    schedule.grandTotalLengthM.toFixed(2),
    schedule.grandTotalLengthFt.toFixed(2),
    `"${schedule.totalCableCount} Cables Total"`,
  ];

  return [headers.join(','), ...rows.map((r) => r.join(',')), summary.join(',')].join('\n');
}

/**
 * Formats a cable length according to the user's project unit settings.
 */
export function formatCableDisplay(
  lengthM: number,
  settings: ProjectSettings
): string {
  if (settings.unit === 'ft' || settings.dimensionUnitFormat === 'ft') {
    return `${(lengthM * 3.28084).toFixed(2)} ft`;
  }
  if (settings.dimensionUnitFormat === 'mm') {
    return `${Math.round(lengthM * 1000)} mm`;
  }
  return `${lengthM.toFixed(2)} m`;
}
