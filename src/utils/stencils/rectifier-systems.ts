/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, Point, StencilDefinition } from "../../types/cad";
import { uid } from "./common";

export const RECTIFIER_SYSTEM_STENCILS: StencilDefinition[] = [
  // 1. ERICSSON RS
  {
    id: 'rectifier-ericsson-rs',
    name: 'Ericsson RS (Rectifier System)',
    category: 'rectifier-system',
    badge: 'Ericsson RS',
    icon: '⚡',
    description:
      '42U -48V DC Telecom Power Plant featuring Ericsson high-efficiency rectifier modules, SCU digital controller, dual DC-PDU distribution breaker panels, and 4x Smart Lithium LiFePO4 battery modules with front handles, and SOC display',
    defaultWidth: 42,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 42;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rectifier-ericsson-rs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#0284c7', // Ericsson cyan/blue accent
        strokeWidth: 2,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 0.98,
        opacity: 1,
        customProps: {
          stencilType: 'rectifier-ericsson-rs',
          brand: 'Ericsson',
          model: 'Ericsson RS 48V (BBS 6102 / RBS Power Plant)',
          isRectifierSystem: true,
          heightMm: 2000,
          uHeight: 42,
          widthMm: 600,
          depthMm: 600,
          batteryCount: 4,
          batteryType: 'lifepo4-100ah',
          batteryAh: 100,
          rectifierModules: 4,
          outputVoltage: '-48V DC',
          maxCurrentA: 300,
        },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#0284c7',
            strokeWidth: 2,
            fill: '#18181b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 28,
        y: origin.y + h / 2 - 9,
        width: 56,
        height: 18,
        text: 'ERICSSON RS',
        fontSize: 7.5,
        bold: true,
        textColor: '#38bdf8',
        bgColor: '#082f49',
        stroke: '#0284c7',
        strokeWidth: 1,
        fill: '#082f49',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },

  // 2. ELTEK RS
  {
    id: 'rectifier-eltek-rs',
    name: 'Eltek RS (Flatpack2 Power System)',
    category: 'rectifier-system',
    badge: 'Eltek RS',
    icon: '🔋',
    description:
      '42U -48V DC Telecom Power System featuring Eltek Flatpack2 HE rectifier shelves, Smartpack Touch digital controller, BLVD/LLVD DC distribution breakers, and 4x 48V Smart Lithium battery packs',
    defaultWidth: 42,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 42;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rectifier-eltek-rs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#0284c7', // Eltek chevron blue
        strokeWidth: 2,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 0.98,
        opacity: 1,
        customProps: {
          stencilType: 'rectifier-eltek-rs',
          brand: 'Eltek',
          model: 'Eltek Flatpack2 Integrated RS 48V',
          isRectifierSystem: true,
          heightMm: 2000,
          uHeight: 42,
          widthMm: 600,
          depthMm: 600,
          batteryCount: 4,
          batteryType: 'lifepo4-100ah',
          batteryAh: 100,
          rectifierModules: 6,
          outputVoltage: '-48V DC',
          maxCurrentA: 400,
        },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#0284c7',
            strokeWidth: 2,
            fill: '#18181b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 26,
        y: origin.y + h / 2 - 9,
        width: 52,
        height: 18,
        text: 'ELTEK RS',
        fontSize: 7.5,
        bold: true,
        textColor: '#38bdf8',
        bgColor: '#0c4a6e',
        stroke: '#0284c7',
        strokeWidth: 1,
        fill: '#0c4a6e',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },

  // 3. ZTE RS
  {
    id: 'rectifier-zte-rs',
    name: 'ZTE RS (ZXDU68 Rectifier System)',
    category: 'rectifier-system',
    badge: 'ZTE RS',
    icon: '⚡',
    description:
      '42U -48V DC Telecom Rectifier Cabinet with ZTE ZXD3000 high-efficiency rectifier subrack, CSU graphical controller, high-capacity DC distribution, and 4x ZTE Smart Lithium battery units',
    defaultWidth: 42,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 42;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rectifier-zte-rs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#06b6d4', // ZTE cyan
        strokeWidth: 2,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 0.98,
        opacity: 1,
        customProps: {
          stencilType: 'rectifier-zte-rs',
          brand: 'ZTE',
          model: 'ZTE ZXDU68 S501/T601 Rectifier System',
          isRectifierSystem: true,
          heightMm: 2000,
          uHeight: 42,
          widthMm: 600,
          depthMm: 600,
          batteryCount: 4,
          batteryType: 'lifepo4-100ah',
          batteryAh: 100,
          rectifierModules: 4,
          outputVoltage: '-48V DC',
          maxCurrentA: 300,
        },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#06b6d4',
            strokeWidth: 2,
            fill: '#18181b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 24,
        y: origin.y + h / 2 - 9,
        width: 48,
        height: 18,
        text: 'ZTE RS',
        fontSize: 7.5,
        bold: true,
        textColor: '#22d3ee',
        bgColor: '#164e63',
        stroke: '#06b6d4',
        strokeWidth: 1,
        fill: '#164e63',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },

  // 4. HUAWEI RS
  {
    id: 'rectifier-huawei-rs',
    name: 'Huawei RS (ETP48400 PowerStar)',
    category: 'rectifier-system',
    badge: 'Huawei RS',
    icon: '🔋',
    description:
      '42U -48V DC Telecom Power System with Huawei R4850G2/R4875G1 rectifier modules, SMU02C intelligent monitoring controller, dual PDU breaker rows, and 4x Huawei ESM-48100A1 Smart Lithium battery packs',
    defaultWidth: 42,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 42;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rectifier-huawei-rs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#dc2626', // Huawei ruby red
        strokeWidth: 2,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 0.98,
        opacity: 1,
        customProps: {
          stencilType: 'rectifier-huawei-rs',
          brand: 'Huawei',
          model: 'Huawei ETP48400-C4A1 / ETP48200 PowerStar',
          isRectifierSystem: true,
          heightMm: 2000,
          uHeight: 42,
          widthMm: 600,
          depthMm: 600,
          batteryCount: 4,
          batteryType: 'lifepo4-100ah',
          batteryAh: 100,
          rectifierModules: 4,
          outputVoltage: '-48V DC',
          maxCurrentA: 400,
        },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#dc2626',
            strokeWidth: 2,
            fill: '#18181b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 28,
        y: origin.y + h / 2 - 9,
        width: 56,
        height: 18,
        text: 'HUAWEI RS',
        fontSize: 7.5,
        bold: true,
        textColor: '#f87171',
        bgColor: '#450a0a',
        stroke: '#dc2626',
        strokeWidth: 1,
        fill: '#450a0a',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },

  // 5. VERTIV NETSURE RS
  {
    id: 'rectifier-vertiv-rs',
    name: 'Vertiv RS (NetSure 731 / 5100)',
    category: 'rectifier-system',
    badge: 'Vertiv RS',
    icon: '⚡',
    description:
      '42U -48V DC Telecom Power Plant with Vertiv eSure R48-3200e rectifier modules, NCU supervision unit, DC load distribution, and 4x 48V Lithium battery storage modules',
    defaultWidth: 42,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 42;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rectifier-vertiv-rs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#f97316', // Vertiv orange
        strokeWidth: 2,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 0.98,
        opacity: 1,
        customProps: {
          stencilType: 'rectifier-vertiv-rs',
          brand: 'Vertiv',
          model: 'Vertiv NetSure 731 / 5100 Telecom Power Plant',
          isRectifierSystem: true,
          heightMm: 2000,
          uHeight: 42,
          widthMm: 600,
          depthMm: 600,
          batteryCount: 4,
          batteryType: 'lifepo4-100ah',
          batteryAh: 100,
          rectifierModules: 4,
          outputVoltage: '-48V DC',
          maxCurrentA: 350,
        },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#f97316',
            strokeWidth: 2,
            fill: '#18181b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 26,
        y: origin.y + h / 2 - 9,
        width: 52,
        height: 18,
        text: 'VERTIV RS',
        fontSize: 7.5,
        bold: true,
        textColor: '#fb923c',
        bgColor: '#431407',
        stroke: '#f97316',
        strokeWidth: 1,
        fill: '#431407',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },

  // 6. DELTA RS
  {
    id: 'rectifier-delta-rs',
    name: 'Delta RS (DPR 48V Power Plant)',
    category: 'rectifier-system',
    badge: 'Delta RS',
    icon: '🔋',
    description:
      '42U -48V DC Modular Telecom Power Cabinet with Delta DPR 2900B rectifier subrack, PSC 3 digital controller, DC distribution breakers, and 4x Smart Lithium battery banks',
    defaultWidth: 42,
    defaultHeight: 45,
    createObjects: (origin: Point): CADObject[] => {
      const parentId = uid();
      const w = 42;
      const h = 45;
      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'rectifier-delta-rs',
        isStencil: true,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#10b981', // Delta emerald green
        strokeWidth: 2,
        fill: '#18181b',
        fillEnabled: true,
        fillOpacity: 0.98,
        opacity: 1,
        customProps: {
          stencilType: 'rectifier-delta-rs',
          brand: 'Delta',
          model: 'Delta DPR 2900B 48V Telecom Power System',
          isRectifierSystem: true,
          heightMm: 2000,
          uHeight: 42,
          widthMm: 600,
          depthMm: 600,
          batteryCount: 4,
          batteryType: 'lifepo4-100ah',
          batteryAh: 100,
          rectifierModules: 4,
          outputVoltage: '-48V DC',
          maxCurrentA: 300,
        },
        children: [
          {
            id: uid(),
            type: 'rectangle',
            x: 0,
            y: 0,
            width: w,
            height: h,
            stroke: '#10b981',
            strokeWidth: 2,
            fill: '#18181b',
            fillEnabled: true,
            fillOpacity: 1,
            opacity: 1,
          },
        ],
      };
      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 24,
        y: origin.y + h / 2 - 9,
        width: 48,
        height: 18,
        text: 'DELTA RS',
        fontSize: 7.5,
        bold: true,
        textColor: '#34d399',
        bgColor: '#064e3b',
        stroke: '#10b981',
        strokeWidth: 1,
        fill: '#064e3b',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };
      return [mainGroup, label];
    },
  },
];
