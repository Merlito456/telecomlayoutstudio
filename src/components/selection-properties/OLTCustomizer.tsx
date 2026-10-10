/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject } from '../../types/cad';
import { Network, Zap, Cpu, Server, ShieldCheck } from 'lucide-react';

interface OLTCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const OLTCustomizer: React.FC<OLTCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  const sId = (primary.stencilId || primary.customProps?.stencilType || '').toLowerCase();
  const category = (primary.customProps?.category || '').toLowerCase();

  const isOLT =
    category === 'olt' ||
    sId.startsWith('fh-an') ||
    sId.startsWith('nokia-') ||
    sId.includes('olt');

  if (!isOLT) return null;

  // Extract model details
  let brand = 'FiberHome';
  let modelName = 'FiberHome OLT';
  let platformSeries = 'Next-Gen Platform';
  let architecture = 'Carrier-Grade Modular Subrack';
  let uHeight = primary.customProps?.uHeight || 2;
  let slotCapacity = primary.customProps?.slotCount || 'Universal Slots';
  let ponCapacity = 'High-Density PON Ports';
  let uplinks = '10GE / 100GE SFP+ Uplinks';
  let power = 'Dual -48V DC Redundant Power Feeds';

  if (sId === 'fh-an6000-17' || sId === 'bay-fh-an6000-17') {
    brand = 'FiberHome';
    modelName = 'AN6000-17';
    platformSeries = 'AN6000 Series (Next-Gen)';
    architecture = 'Distributed Architecture / Cloud-Ready Flagship';
    uHeight = 15;
    slotCapacity = '17 Service Slots + 2 Control (HSUA/HSUB)';
    ponCapacity = 'Up to 272/544 10G PON, XG(S)-PON, TWDM-PON Ports';
    uplinks = '4x 100GE / 40GE Uplink Ports';
    power = 'Dual -48V DC High-Capacity Power Feeds';
  } else if (sId === 'fh-an6000-15' || sId === 'bay-fh-an6000-15') {
    brand = 'FiberHome';
    modelName = 'AN6000-15';
    platformSeries = 'AN6000 Series (Next-Gen)';
    architecture = 'Large-Scale Distributed Architecture';
    uHeight = 11;
    slotCapacity = '15 Service Slots + 2 Control Slots';
    ponCapacity = 'Agile-PON & Multi-Service Coexistence (240 Ports)';
    uplinks = '4x 100GE / 10GE Uplink Ports';
    power = 'Dual -48V DC Redundant Power Feeds';
  } else if (sId === 'fh-an6000-7' || sId === 'fh-an6000-07' || sId === 'bay-fh-an6000-7') {
    brand = 'FiberHome';
    modelName = 'AN6000-7';
    platformSeries = 'AN6000 Series (Next-Gen)';
    architecture = 'Medium-Capacity Carrier-Class Chassis';
    uHeight = 6;
    slotCapacity = '7 Service Slots + 2 Control Slots';
    ponCapacity = 'High-Density 10G PON (112 PON Ports)';
    uplinks = '4x 10GE SFP+ Uplinks';
    power = 'Dual -48V DC Redundant Power Feeds';
  } else if (sId === 'fh-an6000-2' || sId === 'fh-an6000-02') {
    brand = 'FiberHome';
    modelName = 'AN6000-2';
    platformSeries = 'AN6000 Series (Next-Gen)';
    architecture = 'Mini-Platform / Low-Density Chassis';
    uHeight = 2;
    slotCapacity = '2 Universal Service Slots';
    ponCapacity = 'High-Density PON Variants (32 Ports)';
    uplinks = '4x 10GE SFP+ Uplinks';
    power = 'Dual -48V DC / 220V AC Power Supplies';
  } else if (sId === 'fh-an6001-g16') {
    brand = 'FiberHome';
    modelName = 'AN6001-G16';
    platformSeries = 'AN6000 Series (Next-Gen Box)';
    architecture = '1U Fixed Box / Cassette Form Factor';
    uHeight = 1;
    slotCapacity = 'Fixed Integrated Chassis';
    ponCapacity = '16 GPON Ports (SFP Transceivers)';
    uplinks = '4x 10GE SFP+ & 2x GE RJ45 Uplinks';
    power = 'Modular Hot-Swappable Dual AC or DC Power Supplies';
  } else if (sId === 'fh-an6001-ges16') {
    brand = 'FiberHome';
    modelName = 'AN6001-GES16';
    platformSeries = 'AN6000 Series (Next-Gen Box)';
    architecture = '1U Fixed Box / Cassette Form Factor';
    uHeight = 1;
    slotCapacity = 'Fixed Integrated Chassis';
    ponCapacity = '16 GPON Ports with Class C+ Transceiver Modules';
    uplinks = 'Dual 10G SFP+ & 2x GE Uplink Ports';
    power = 'Dual Redundant Modular Power Supplies';
  } else if (sId === 'fh-an6001-gf16') {
    brand = 'FiberHome';
    modelName = 'AN6001-GF16';
    platformSeries = 'AN6000 Series (Next-Gen Box)';
    architecture = '1U Compact Box-Shaped Mini OLT';
    uHeight = 1;
    slotCapacity = 'Ruggedized Outdoor / Rural Enclosure';
    ponCapacity = '16 Agile-PON Ports';
    uplinks = '4x 10GE/GE Network Uplinks';
    power = 'Hardened Dual AC/DC Wide-Temperature Power Feeds';
  } else if (sId === 'fh-an6001c-gf16') {
    brand = 'FiberHome';
    modelName = 'AN6001C-GF16';
    platformSeries = 'AN6000 Series (Next-Gen Box)';
    architecture = 'Highly Integrated Mini OLT Platform';
    uHeight = 1;
    slotCapacity = 'Space-Constrained Shallow Chassis (230mm)';
    ponCapacity = '16 Agile-PON User Access Ports';
    uplinks = 'Dual 10GE Network Uplinks';
    power = 'Integrated Dual Redundant Power Modules';
  } else if (sId === 'fh-an5516-01' || sId === 'bay-fh-an5516-01') {
    brand = 'FiberHome';
    modelName = 'AN5516-01';
    platformSeries = 'AN5516 / AN5116 (Standard/Legacy)';
    architecture = 'Large-Capacity 11U Centralized Subrack';
    uHeight = 11;
    slotCapacity = '16 Service Card Slots + 2 Core Switch (HSWA/HSUB)';
    ponCapacity = 'Up to 256 GPON/EPON Ports (Carrier-Grade)';
    uplinks = '4x 10GE / GE Uplink Interfaces';
    power = 'Dual -48V DC Heavy Distribution Power Feeds';
  } else if (sId === 'fh-an5516-06b' || sId === 'bay-fh-an5516-06b') {
    brand = 'FiberHome';
    modelName = 'AN5516-06B / AN5116-06B';
    platformSeries = 'AN5516 / AN5116 (Standard/Legacy)';
    architecture = 'Intelligent MSAN / GPON Platform';
    uHeight = 6;
    slotCapacity = '6 Service Card Slots + Dual Core Route Switch';
    ponCapacity = 'Full L2/L3 Wire-Speed Routing & Triple-Play';
    uplinks = '4x 10GE Uplink Ports';
    power = 'Dual -48V DC Redundant Power Supplies';
  } else if (sId === 'fh-an5516-06') {
    brand = 'FiberHome';
    modelName = 'AN5516-06';
    platformSeries = 'AN5516 / AN5116 (Standard/Legacy)';
    architecture = 'Medium-Capacity Modular Platform';
    uHeight = 6;
    slotCapacity = '6 Service Card Slots';
    ponCapacity = '96 GPON/EPON Ports for Intermediate ISP Deployments';
    uplinks = '4x GE / 10GE Uplink Ports';
    power = 'Dual -48V DC / 220V AC Power Options';
  } else if (sId === 'fh-an5516-04') {
    brand = 'FiberHome';
    modelName = 'AN5516-04';
    platformSeries = 'AN5516 / AN5116 (Standard/Legacy)';
    architecture = 'Mini 2U Compact Chassis';
    uHeight = 2;
    slotCapacity = '2 Service Board Slots + Dual Core Uplink';
    ponCapacity = 'Up to 32 GPON/EPON Ports for Small FTTH Projects';
    uplinks = 'Dual GE / 10GE Uplink Ports';
    power = 'Dual -48V DC / 220V AC Redundant Power';
  } else if (sId.includes('nokia')) {
    brand = 'Nokia';
    modelName = sId.includes('mf02') ? 'MF-02' : sId.includes('df16') ? 'DF-16' : 'FX-8';
    platformSeries = 'Nokia Lightspan / ISAM';
    architecture = 'Carrier Optical Line Terminal (OLT)';
  }

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-sky-600/50 space-y-2.5 shadow-md shadow-slate-950/40 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          Optical Line Terminal (OLT)
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
          {brand} {modelName}
        </span>
      </div>

      {/* Specifications Card */}
      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-[10px]">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400 flex items-center gap-1">
            <Server className="w-3 h-3 text-cyan-400" /> Platform Series:
          </span>
          <span className="font-semibold text-cyan-200">{platformSeries}</span>
        </div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" /> Architecture:
          </span>
          <span className="font-medium text-slate-200 text-right max-w-[180px] truncate" title={architecture}>
            {architecture}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Rack Form Factor:</span>
          <span className="font-mono font-bold text-amber-300">{uHeight}U Chassis (19" / 21")</span>
        </div>

        <div className="flex justify-between items-start text-slate-300 pt-0.5 border-t border-slate-800/80">
          <span className="text-slate-400">Card Slots:</span>
          <span className="font-medium text-slate-200 text-right">{slotCapacity}</span>
        </div>

        <div className="flex justify-between items-start text-slate-300">
          <span className="text-slate-400">PON Capacity:</span>
          <span className="font-medium text-emerald-300 text-right max-w-[190px]">{ponCapacity}</span>
        </div>

        <div className="flex justify-between items-start text-slate-300">
          <span className="text-slate-400">Network Uplink:</span>
          <span className="font-medium text-sky-300 text-right">{uplinks}</span>
        </div>

        <div className="flex justify-between items-start text-slate-300 pt-0.5 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Power Architecture:
          </span>
          <span className="font-medium text-amber-200 text-right max-w-[180px]">{power}</span>
        </div>
      </div>

      {/* Carrier Compliance Badge */}
      <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Carrier-grade OLT with redundant uplink & hot-swappable modules.</span>
      </div>
    </div>
  );
};
