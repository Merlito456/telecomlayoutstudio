/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from '../types/cad';

/**
 * Standard actual EIA-310 19" rack U capacities for telecom outdoor cabinets:
 * - Mini ODC / Compact Node Enclosures: 12U (Height Ratio 0.35)
 * - ODC / Outdoor Distribution Cabinets: 18U (Height Ratio 0.40)
 * - Ericsson ENC6130 Compact Outdoor: 24U (Height Ratio 0.75)
 * - 1-Bay Macro Enclosures (Huawei APM30H, Ericsson ENC6150/6102, Eltek, Fushan, FiberHome): 36U (Height Ratio 1.0)
 * - 2-Bay Dual Enclosures: 36U per bay
 * - 3-Bay Triple Enclosures: 36U per bay
 */
export function getCabinetActualU(obj?: CADObject | null): number {
  if (!obj) return 36;

  // If explicitly configured by user on object customProps
  if (typeof obj.customProps?.uHeight === 'number' && obj.customProps.uHeight > 0) {
    return obj.customProps.uHeight;
  }
  if (typeof obj.uHeight === 'number' && obj.uHeight > 0) {
    return obj.uHeight;
  }

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  const customBayType = obj.customProps?.bayType;
  const customRatio =
    obj.customProps?.heightRatio !== undefined
      ? Number(obj.customProps.heightRatio)
      : undefined;

  // Specific Models
  if (sId.includes('enc6130') || customBayType === 'enc6130') {
    return 24;
  }
  if (sId.includes('enc6150') || customBayType === 'enc6150') {
    return 36;
  }

  // Mini ODC Category (0.35 ratio) -> 12U
  if (
    customRatio === 0.35 ||
    customBayType === 'mini-odc' ||
    sId.includes('mini-odc') ||
    sId.includes('mini')
  ) {
    return 12;
  }

  // ODC Distribution Category (0.40 ratio) -> 18U
  if (
    customRatio === 0.4 ||
    customBayType === 'odc' ||
    sId.includes('odc')
  ) {
    return 18;
  }

  // Height preset hints
  if (sId.includes('18u')) return 18;
  if (sId.includes('24u')) return 24;
  if (sId.includes('42u')) return 42;
  if (sId.includes('45u')) return 45;
  if (sId.includes('48u')) return 48;

  // Standard full-height 1-Bay, 2-Bay, 3-Bay telecom macro cabinets -> 36U
  return 36;
}

/**
 * Checks if a CAD object is an outdoor telecom cabinet or enclosed equipment cabinet.
 */
export function isOutdoorCabinet(obj?: CADObject | null): boolean {
  if (!obj) return false;

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();

  // Exclude Rectifier Systems (pure open bayface telecom power plants - no doors)
  const isRS =
    obj.customProps?.isRectifierSystem === true ||
    sId.startsWith('rectifier-') ||
    obj.customProps?.category === 'rectifier-system' ||
    sId === 'rack-power-rectifier' ||
    sId === 'flatpack-1' ||
    sId === 'rack-dc-pdu';
  if (isRS) return false;

  // Exclude OLT equipment modules
  const isOLT =
    obj.customProps?.category === 'olt' ||
    sId.startsWith('fh-an') ||
    sId.startsWith('nokia-') ||
    sId.includes('olt');
  if (isOLT) return false;

  return !!(
    sId.includes('cabinet') ||
    sId.includes('odc') ||
    sId.includes('1bay') ||
    sId.includes('2bay') ||
    sId.includes('3bay') ||
    sId.includes('huawei') ||
    sId.includes('ericsson') ||
    sId.includes('eltek') ||
    sId.includes('fushan') ||
    sId.includes('fhodc') ||
    sId.includes('enc6130') ||
    sId.includes('enc6150') ||
    obj.customProps?.isCabinet === true ||
    obj.customProps?.category === 'cabinets' ||
    obj.customProps?.stencilType?.includes('cabinet') ||
    obj.customProps?.stencilType?.includes('odc')
  );
}

/**
 * Checks if a CAD object is an outdoor cabinet OR an open-bay relay/telecom rack.
 */
export function isCabinetOrRack(obj?: CADObject | null): boolean {
  if (!obj) return false;
  if (isOutdoorCabinet(obj)) return true;

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  return !!(
    sId.includes('rack') ||
    obj.customProps?.category === 'racks' ||
    obj.customProps?.category === 'telecom-racks' ||
    obj.customProps?.stencilType?.includes('rack')
  );
}

/**
 * Resolves the equipment manufacturer brand from stencil and props.
 */
export function getCabinetBrand(obj?: CADObject | null): string {
  if (!obj) return 'Telecom';
  if (obj.customProps?.brand) {
    const b = String(obj.customProps.brand).toLowerCase();
    if (b.includes('huawei')) return 'Huawei';
    if (b.includes('ericsson')) return 'Ericsson';
    if (b.includes('eltek')) return 'Eltek';
    if (b.includes('fushan')) return 'Fushan';
    if (b.includes('fiberhome') || b.includes('fhodc')) return 'FiberHome';
  }

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  if (sId.includes('huawei')) return 'Huawei';
  if (sId.includes('ericsson') || sId.includes('enc6130') || sId.includes('enc6150')) return 'Ericsson';
  if (sId.includes('eltek')) return 'Eltek';
  if (sId.includes('fushan')) return 'Fushan';
  if (sId.includes('fiberhome') || sId.includes('fhodc')) return 'FiberHome';

  return 'Telecom';
}

/**
 * Formats a clean display name with actual U capacity.
 */
export function getCabinetDisplayName(obj?: CADObject | null): string {
  if (!obj) return 'Outdoor Cabinet';
  const u = getCabinetActualU(obj);
  const brand = getCabinetBrand(obj);
  const rawText = obj.text?.trim();

  if (rawText && rawText !== '1-BAY' && rawText !== '2-BAY' && rawText !== '3-BAY' && rawText !== 'ODC') {
    return `${rawText} (${u}U)`;
  }

  const sId = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
  if (sId.includes('mini-odc') || sId.includes('mini')) {
    return `${brand} Mini ODC (${u}U)`;
  }
  if (sId.includes('odc')) {
    return `${brand} ODC (${u}U)`;
  }
  if (sId.includes('enc6130')) {
    return `Ericsson ENC6130 (${u}U)`;
  }
  if (sId.includes('enc6150')) {
    return `Ericsson ENC6150 (${u}U)`;
  }
  if (sId.includes('3bay')) {
    return `${brand} 3-Bay Cabinet (${u}U)`;
  }
  if (sId.includes('2bay')) {
    return `${brand} 2-Bay Cabinet (${u}U)`;
  }
  if (sId.includes('1bay')) {
    return `${brand} 1-Bay Cabinet (${u}U)`;
  }

  return `${brand} Outdoor Cabinet (${u}U)`;
}
