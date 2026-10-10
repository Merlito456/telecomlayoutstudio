/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EquipmentCategory =
  | 'switch'
  | 'server'
  | 'router'
  | 'patch-panel'
  | 'fiber-shelf'
  | 'bbu'
  | 'power'
  | 'battery'
  | 'cable-manager'
  | 'blanking'
  | 'custom';

export type PortConnectorType =
  | 'rj45'
  | 'lc-fiber'
  | 'sc-fiber'
  | 'dc-terminal'
  | 'ac-plug'
  | 'mpo-fiber'
  | 'coax'
  | 'none';

export type RackDesignerView = 'front' | 'rear' | 'top' | 'side' | '3d';

export interface RackEquipmentPortGroup {
  id: string;
  type: PortConnectorType;
  count: number;
  label?: string;
}

export interface RackEquipmentItem {
  id: string;
  name: string;
  label: string; // User-customizable label (e.g. SW-LEAF-01, BBU-5G-01)
  uSlot: number; // 1-indexed bottom rack unit (1 to totalU - uHeight + 1)
  uHeight: number; // 1, 2, 3, 4, 5, etc.
  category: EquipmentCategory;
  depthMm?: number;
  color: string;
  strokeColor?: string;
  ports?: RackEquipmentPortGroup[];
  powerWatts?: number;
  weightKg?: number;
  notes?: string;
  batteryCount?: number;
  batteryAh?: number;
  batteryType?: string;
}

export interface RackEquipmentStencil {
  id: string;
  name: string;
  defaultLabel: string;
  uHeight: number;
  category: EquipmentCategory;
  depthMm: number;
  color: string;
  strokeColor?: string;
  ports?: RackEquipmentPortGroup[];
  powerWatts?: number;
  weightKg?: number;
  desc?: string;
}

export interface RackElevationConfig {
  id: string;
  name: string;
  totalU: number; // 12, 18, 24, 36, 42, 45, 48
  rackType: 'open-2post' | 'open-4post' | 'enclosed-cabinet';
  widthMm: number;
  depthMm: number;
  heightMm: number;
  equipments: RackEquipmentItem[];
  isCabinet?: boolean;
  brand?: string;
  doorsOpen?: boolean;
  placementOrientation?: 'horizontal' | 'vertical';
}
