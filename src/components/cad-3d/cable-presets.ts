/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CablePreset {
  id: string;
  label: string;
  color: string;
  hex: number;
}

export const CABLE_PRESETS: CablePreset[] = [
  { id: 'indoor-yellow', label: 'Indoor Cable (Yellow)', color: '#facc15', hex: 0xfacc15 },
  { id: 'fiber-amber', label: 'Fiber (Amber)', color: '#f59e0b', hex: 0xf59e0b },
  { id: 'dc-blue', label: 'DC -48V (Blue)', color: '#0284c7', hex: 0x0284c7 },
  { id: 'ac-red', label: 'AC Power (Red)', color: '#ef4444', hex: 0xef4444 },
  { id: 'gnd-green', label: 'Earth GND (Green)', color: '#22c55e', hex: 0x22c55e },
  { id: 'coax-slate', label: 'RF Coax (Slate)', color: '#475569', hex: 0x475569 },
];

/**
 * Automatically inspects any candidate equipment object, snap label, or string
 * and detects the industry-standard telecom cable preset & color coding.
 */
export function detectPresetForTarget(
  target:
    | {
        name?: string;
        stencilId?: string;
        snapLabel?: string;
        category?: string;
        customProps?: any;
        text?: string;
      }
    | string
    | null
    | undefined
): CablePreset | null {
  if (!target) return null;
  const rawStr =
    typeof target === 'string'
      ? target
      : [
          target.name,
          target.stencilId,
          target.snapLabel,
          target.category,
          target.text,
          target.customProps?.name,
          target.customProps?.stencilType,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

  const s = rawStr.toLowerCase();

  // 1. DC Power (-48V / +24V): Rectifier System, Battery Racks, Flatpack, DC PDU, -48V busbar, Lithium cabinets
  if (
    s.includes('rectifier') ||
    s.includes('flatpack') ||
    s.includes('battery') ||
    s.includes('lithium') ||
    s.includes('vrla') ||
    s.includes('-48v') ||
    s.includes('+24v') ||
    s.includes('48v') ||
    s.includes('dcpdu') ||
    s.includes('dc-power') ||
    s.includes('dc power') ||
    s.includes('power-subrack') ||
    s.includes('eltek') ||
    s.includes('zte-rectifier') ||
    s.includes('huawei-rectifier') ||
    s.includes('delta-rectifier') ||
    s.includes('delta rectifier') ||
    (typeof target === 'object' && target && (target.category === 'rectifier' || target.category === 'battery' || target.category === 'power')) ||
    (s.includes('rack') && s.includes('power'))
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'dc-blue') || CABLE_PRESETS[2];
  }

  // 2. AC Mains Power: AC DB, ACPDB, ATS, Generator, Inverter AC, Wall-Mount AC, High-Wall Unit, Split AC
  if (
    s.includes('acpdb') ||
    s.includes('ac-db') ||
    s.includes('ac db') ||
    s.includes('mains') ||
    s.includes('ats') ||
    s.includes('generator') ||
    s.includes('gen-basepad') ||
    s.includes('wall-mount-ac') ||
    s.includes('wall mount ac') ||
    s.includes('high-wall') ||
    s.includes('air-conditioner') ||
    s.includes('air conditioner') ||
    s.includes('inverter ac') ||
    s.includes('cooling') ||
    (typeof target === 'object' && target && target.category === 'cooling') ||
    s.includes('transformer') ||
    s.includes('ac-power') ||
    s.includes('ac power')
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'ac-red') || CABLE_PRESETS[3];
  }

  // 3. Optical Fiber: OLT Bays, BBU subracks, DDF, ODF, Optical Frame, Transmission Rack, MW Rack, Patch Panel
  if (
    s.includes('olt') ||
    s.includes('bbu') ||
    s.includes('fiber') ||
    s.includes('optic') ||
    s.includes('odf') ||
    s.includes('dcf') ||
    s.includes('patch panel') ||
    s.includes('optical') ||
    s.includes('raceway') ||
    s.includes('transmission') ||
    s.includes('microwave') ||
    s.includes('mw rack') ||
    s.includes('dwdm') ||
    s.includes('an6000') ||
    s.includes('an5516') ||
    s.includes('ma5800') ||
    s.includes('c600') ||
    s.includes('c650')
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'fiber-amber') || CABLE_PRESETS[1];
  }

  // 4. Earth Grounding / PE: MGB, Master Ground Bar, Earth Pit, Lightning Arrester, PE Busbar
  if (
    s.includes('ground') ||
    s.includes('earth') ||
    s.includes('mgb') ||
    s.includes('pe bar') ||
    s.includes('pe busbar') ||
    s.includes('lightning') ||
    s.includes('arrester') ||
    s.includes('busbar')
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'gnd-green') || CABLE_PRESETS[4];
  }

  // 5. RF Coaxial Feeder: Feeder Hole, Feeder Window, Gland Plate, Coaxial Feeder, Antenna, Tower, Monopole
  if (
    s.includes('feeder') ||
    s.includes('coax') ||
    s.includes('coaxial') ||
    s.includes('cable-hole') ||
    s.includes('cable hole') ||
    s.includes('gland') ||
    s.includes('feeder window') ||
    s.includes('antenna') ||
    s.includes('tower') ||
    s.includes('monopole') ||
    s.includes('mast')
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'coax-slate') || CABLE_PRESETS[5];
  }

  // 6. In-Shelter Cable Ladder / Overhead Runway & Indoor Raceways
  if (
    s.includes('in-shelter-cable-ladder') ||
    s.includes('in-shelter-ladder') ||
    s.includes('indoor-ladder') ||
    s.includes('inshelter') ||
    s.includes('runway') ||
    (s.includes('shelter') && s.includes('ladder')) ||
    (typeof target === 'object' && target && target.category === 'ladder')
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'indoor-yellow') || CABLE_PRESETS[0];
  }

  // 7. General Telecom & Server Racks in Shelter (Overhead yellow raceway distribution)
  if (
    s.includes('telecom rack') ||
    s.includes('server rack') ||
    s.includes('network rack') ||
    s.includes('carrier rack') ||
    s.includes('open-bay') ||
    s.includes('relay rack') ||
    s.includes('rack-telecom') ||
    s.includes('rack-19in') ||
    s.includes('rack-server') ||
    s.includes('rack-datacenter') ||
    (typeof target === 'object' && target && target.category === 'rack') ||
    s.includes('rack top') ||
    s.includes('equipment rack')
  ) {
    return CABLE_PRESETS.find((p) => p.id === 'indoor-yellow') || CABLE_PRESETS[0];
  }

  return null;
}
