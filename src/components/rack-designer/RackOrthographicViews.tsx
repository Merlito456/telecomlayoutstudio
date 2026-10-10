/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  RackEquipmentItem,
  EquipmentCategory,
} from './types';

// ==========================================
// 1. TOP PLAN VIEW (FOOTPRINT & CLEARANCE)
// ==========================================
export const RackTopPlanView: React.FC<{
  rackName: string;
  totalU: number;
  widthMm?: number;
  depthMm?: number;
  equipments: RackEquipmentItem[];
  isCabinet?: boolean;
  doorsOpen?: boolean;
  brand?: string;
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
}> = ({
  rackName,
  totalU,
  widthMm = 600,
  depthMm = 800,
  equipments,
  isCabinet = false,
  doorsOpen = false,
  brand = 'Telecom',
  selectedEquipmentId,
  onSelectEquipment,
}) => {
  const svgW = 680;
  const svgH = 580;

  // Rack footprint dimensions in SVG units
  const rackW = 340;
  const rackD = (depthMm / widthMm) * 300; // proportional depth
  const rx = (svgW - rackW) / 2;
  const ry = 140;

  // Front door swing radius
  const doorRadius = rackW - 20;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto">
      <div className="relative shadow-2xl rounded-xl bg-slate-950/80 p-2 border border-slate-800">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="block">
          <defs>
            {/* Ventilation Perforation Pattern */}
            <pattern id="mesh-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#334155" />
            </pattern>
            {/* Floor tile grid */}
            <pattern id="raised-floor-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background raised floor 600×600mm tile grid */}
          <rect x="0" y="0" width={svgW} height={svgH} fill="#090d16" />
          <rect x="40" y="40" width={svgW - 80} height={svgH - 80} fill="url(#raised-floor-grid)" opacity="0.6" />

          {/* FRONT SERVICE AISLE (CLEARANCE ENVELOPE: 1000mm) */}
          <g>
            <rect
              x={rx - 40}
              y={ry + rackD}
              width={rackW + 80}
              height="100"
              fill="rgba(56, 189, 248, 0.05)"
              stroke="#0284c7"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={rx + rackW / 2}
              y={ry + rackD + 60}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="bold"
              fontFamily="ui-monospace, monospace"
            >
              FRONT MAINTENANCE AISLE (1000mm CLEARANCE)
            </text>
          </g>

          {/* REAR SERVICE AISLE (CLEARANCE ENVELOPE: 900mm) */}
          <g>
            <rect
              x={rx - 40}
              y={ry - 80}
              width={rackW + 80}
              height="80"
              fill="rgba(245, 158, 11, 0.04)"
              stroke="#d97706"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={rx + rackW / 2}
              y={ry - 40}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="10"
              fontWeight="bold"
              fontFamily="ui-monospace, monospace"
            >
              REAR ACCESS AISLE (900mm CLEARANCE)
            </text>
          </g>

          {/* RACK MAIN STRUCTURAL SHELL / FOOTPRINT */}
          <g>
            {/* Outer welded frame box */}
            <rect
              x={rx}
              y={ry}
              width={rackW}
              height={rackD}
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2.5"
              rx="6"
            />

            {/* Corner Structural Columns (4 Corners) with Floor Anchors */}
            {[
              { cx: rx + 4, cy: ry + 4 },
              { cx: rx + rackW - 24, cy: ry + 4 },
              { cx: rx + 4, cy: ry + rackD - 24 },
              { cx: rx + rackW - 24, cy: ry + rackD - 24 },
            ].map((col, idx) => (
              <g key={`corner-${idx}`}>
                <rect
                  x={col.cx}
                  y={col.cy}
                  width="20"
                  height="20"
                  fill="#1e293b"
                  stroke="#64748b"
                  strokeWidth="1.2"
                  rx="2"
                />
                {/* Floor Leveling Anchor Bolt */}
                <circle cx={col.cx + 10} cy={col.cy + 10} r="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
                <line x1={col.cx + 7} y1={col.cy + 10} x2={col.cx + 13} y2={col.cy + 10} stroke="#94a3b8" strokeWidth="1" />
                <line x1={col.cx + 10} y1={col.cy + 7} x2={col.cx + 10} y2={col.cy + 13} stroke="#94a3b8" strokeWidth="1" />
              </g>
            ))}

            {/* Removable Side Panels with Louvers and slide latches */}
            <rect x={rx + 2} y={ry + 26} width="8" height={rackD - 52} fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <rect x={rx + rackW - 10} y={ry + 26} width="8" height={rackD - 52} fill="#1e293b" stroke="#475569" strokeWidth="1" />

            {/* 4 Internal 19" EIA-310 Vertical Mounting Rails */}
            {/* Standard 19" rail distance is 450mm aperture, spaced inside */}
            <g>
              {/* Front Left Rail */}
              <rect x={rx + 36} y={ry + rackD - 40} width="14" height="20" fill="#334155" stroke="#0ea5e9" strokeWidth="1.2" />
              {/* Front Right Rail */}
              <rect x={rx + rackW - 50} y={ry + rackD - 40} width="14" height="20" fill="#334155" stroke="#0ea5e9" strokeWidth="1.2" />
              {/* Rear Left Rail */}
              <rect x={rx + 36} y={ry + 20} width="14" height="20" fill="#334155" stroke="#0ea5e9" strokeWidth="1.2" />
              {/* Rear Right Rail */}
              <rect x={rx + rackW - 50} y={ry + 20} width="14" height="20" fill="#334155" stroke="#0ea5e9" strokeWidth="1.2" />

              {/* EIA-310 Rail Square Cage Nut Holes */}
              {[rx + 43, rx + rackW - 43].map((hx, i) => (
                <g key={`rail-holes-${i}`}>
                  <rect x={hx - 2} y={ry + rackD - 35} width="4" height="4" fill="#090d16" />
                  <rect x={hx - 2} y={ry + 28} width="4" height="4" fill="#090d16" />
                </g>
              ))}

              {/* 19" Internal Mounting Aperture Dimension Callout */}
              <line x1={rx + 50} y1={ry + rackD - 30} x2={rx + rackW - 50} y2={ry + rackD - 30} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <text
                x={rx + rackW / 2}
                y={ry + rackD - 34}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="9"
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
              >
                19" (450mm EIA-310 CLEARANCE)
              </text>
            </g>

            {/* ROOF CABLE BRUSH GROMMET ENTRY PORTS */}
            <g>
              {/* Front-Left Cable Port */}
              <rect x={rx + 60} y={ry + rackD - 22} width="50" height="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" rx="2" />
              <text x={rx + 85} y={ry + rackD - 12} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">BRUSH PORT</text>
              {/* Front-Right Cable Port */}
              <rect x={rx + rackW - 110} y={ry + rackD - 22} width="50" height="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" rx="2" />
              <text x={rx + rackW - 85} y={ry + rackD - 12} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">BRUSH PORT</text>
              {/* Center Rear Main Trunk Port */}
              <rect x={rx + rackW / 2 - 50} y={ry + 6} width="100" height="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" rx="2" />
              <text x={rx + rackW / 2} y={ry + 16} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">MAIN CABLE ENTRY</text>
            </g>

            {/* INSTALLED EQUIPMENTS DEPTH SILHOUETTES */}
            {equipments.length > 0 && (
              <g transform={`translate(${rx + 50}, ${ry + 45})`}>
                <rect x="0" y="0" width={rackW - 100} height={rackD - 90} fill="#050811" stroke="#1e293b" strokeWidth="1" rx="3" />
                {equipments.slice(0, 8).map((eq, i) => {
                  const eqDepthPx = Math.min(rackD - 95, Math.max(30, ((eq.depthMm || 350) / (depthMm || 800)) * (rackD - 95)));
                  const isSelected = eq.id === selectedEquipmentId;
                  const itemY = (rackD - 90) - eqDepthPx;

                  return (
                    <g
                      key={eq.id}
                      onClick={() => onSelectEquipment(eq.id)}
                      className="cursor-pointer transition-opacity hover:opacity-100"
                      opacity={isSelected ? 1 : 0.75}
                    >
                      <rect
                        x="4"
                        y={itemY}
                        width={rackW - 108}
                        height={eqDepthPx - 2}
                        fill={eq.color || '#1e293b'}
                        stroke={isSelected ? '#38bdf8' : eq.strokeColor || '#475569'}
                        strokeWidth={isSelected ? 2 : 1}
                        rx="2"
                      />
                      <text
                        x="10"
                        y={itemY + 12}
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="ui-monospace, monospace"
                      >
                        {eq.label} ({eq.uHeight}U · {eq.depthMm || 350}mm D)
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* FRONT PERFORATED DOOR & SWING ARC CLEARANCE */}
            <g>
              {/* Front Door Leaf Profile */}
              <rect x={rx + 6} y={ry + rackD - 4} width={rackW - 12} height="6" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" rx="1" />
              {/* Door Swing Handle / Keylock */}
              <rect x={rx + rackW - 35} y={ry + rackD} width="16" height="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" rx="1" />

              {/* 90° Door Swing Arc (Maintenance Envelope) */}
              <path
                d={`M ${rx + 6} ${ry + rackD} A ${doorRadius} ${doorRadius} 0 0 0 ${rx + 6 + doorRadius} ${ry + rackD + doorRadius}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="4,4"
              />
              {/* Open Door Leaf Silhouette */}
              <line
                x1={rx + 6}
                y1={ry + rackD}
                x2={rx + 6}
                y2={ry + rackD + doorRadius}
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text
                x={rx + 14}
                y={ry + rackD + doorRadius / 2}
                fill="#38bdf8"
                fontSize="8.5"
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
              >
                FRONT DOOR SWING (90° CLEARANCE)
              </text>
            </g>

            {/* REAR PERFORATED WARDROBE SPLIT DOORS */}
            <g>
              {/* Left & Right rear split doors */}
              <rect x={rx + 6} y={ry - 2} width={(rackW - 16) / 2} height="5" fill="#090d16" stroke="#f59e0b" strokeWidth="1.2" rx="1" />
              <rect x={rx + (rackW / 2) + 2} y={ry - 2} width={(rackW - 16) / 2} height="5" fill="#090d16" stroke="#f59e0b" strokeWidth="1.2" rx="1" />
              {/* Rear split doors swing arcs */}
              <path
                d={`M ${rx + 6} ${ry} A 80 80 0 0 1 ${rx + 6} ${ry - 80}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <path
                d={`M ${rx + rackW - 6} ${ry} A 80 80 0 0 0 ${rx + rackW - 6} ${ry - 80}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            </g>

            {/* COPPER GROUNDING TERMINAL (TGB) */}
            <g transform={`translate(${rx + rackW - 24}, ${ry + 28})`}>
              <circle cx="0" cy="0" r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <text x="8" y="3" fill="#fbbf24" fontSize="8" fontWeight="bold">TGB GND</text>
            </g>
          </g>

          {/* OVERALL DIMENSION LINES */}
          <g>
            {/* Width Dimension: 600mm */}
            <line x1={rx} y1={ry + rackD + 120} x2={rx + rackW} y2={ry + rackD + 120} stroke="#94a3b8" strokeWidth="1" />
            <line x1={rx} y1={ry + rackD + 115} x2={rx} y2={ry + rackD + 125} stroke="#94a3b8" strokeWidth="1" />
            <line x1={rx + rackW} y1={ry + rackD + 115} x2={rx + rackW} y2={ry + rackD + 125} stroke="#94a3b8" strokeWidth="1" />
            <text x={rx + rackW / 2} y={ry + rackD + 135} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="ui-monospace, monospace">
              {widthMm} mm (WIDTH)
            </text>

            {/* Depth Dimension: 800mm */}
            <line x1={rx + rackW + 30} y1={ry} x2={rx + rackW + 30} y2={ry + rackD} stroke="#94a3b8" strokeWidth="1" />
            <line x1={rx + rackW + 25} y1={ry} x2={rx + rackW + 35} y2={ry} stroke="#94a3b8" strokeWidth="1" />
            <line x1={rx + rackW + 25} y1={ry + rackD} x2={rx + rackW + 35} y2={ry + rackD} stroke="#94a3b8" strokeWidth="1" />
            <text x={rx + rackW + 42} y={ry + rackD / 2} fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="ui-monospace, monospace" transform={`rotate(90, ${rx + rackW + 42}, ${ry + rackD / 2})`}>
              {depthMm} mm (DEPTH)
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// 2. SIDE ELEVATION VIEW (DEPTH & RAILS)
// ==========================================
export const RackSideElevationView: React.FC<{
  rackName: string;
  totalU: number;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  equipments: RackEquipmentItem[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
}> = ({
  rackName,
  totalU,
  depthMm = 800,
  heightMm = 2000,
  equipments,
  selectedEquipmentId,
  onSelectEquipment,
}) => {
  const uPixelHeight = 22;
  const rackInnerHeight = totalU * uPixelHeight;
  const topH = 34;
  const botH = 40;
  const svgTotalH = rackInnerHeight + topH + botH;

  const sideW = 420;
  const svgW = sideW + 160;
  const sx = 80;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto">
      <div className="relative shadow-2xl rounded-xl bg-slate-950/80 p-2 border border-slate-800">
        <svg width={svgW} height={svgTotalH} viewBox={`0 0 ${svgW} ${svgTotalH}`} className="block">
          {/* Background of the Rack Frame Profile */}
          <rect x={sx} y="0" width={sideW} height={svgTotalH} fill="#090d16" stroke="#1e293b" strokeWidth="2" rx="6" />

          {/* TOP ROOF SECTION: Overhead Cable Tray Brackets */}
          <g transform={`translate(${sx}, 0)`}>
            <rect x="0" y="0" width={sideW} height={topH} fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="4" />
            <rect x="20" y="8" width={sideW - 40} height="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" rx="2" />
            <text x={sideW / 2} y="19" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="ui-monospace, monospace">
              TOP CABLE RUNWAY &amp; WATERFALL DROPS
            </text>
          </g>

          {/* FRONT EIA RAIL (Left side in profile) */}
          <g transform={`translate(${sx + 40}, ${topH})`}>
            <rect x="0" y="0" width="16" height={rackInnerHeight} fill="#334155" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="8" y="16" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" transform="rotate(-90, 8, 16)">
              FRONT EIA RAIL
            </text>
          </g>

          {/* REAR EIA RAIL (Right side in profile) */}
          <g transform={`translate(${sx + sideW - 56}, ${topH})`}>
            <rect x="0" y="0" width="16" height={rackInnerHeight} fill="#334155" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="8" y="16" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" transform="rotate(-90, 8, 16)">
              REAR EIA RAIL
            </text>
          </g>

          {/* DEPTH ADJUSTMENT CHANNEL RUNNERS (3 horizontal cross braces) */}
          {[rackInnerHeight * 0.25, rackInnerHeight * 0.5, rackInnerHeight * 0.75].map((braceY, i) => (
            <g key={`brace-${i}`} transform={`translate(${sx + 56}, ${topH + braceY - 8})`}>
              <rect x="0" y="0" width={sideW - 112} height="16" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="2" />
              {/* Depth adjustment scale tick marks */}
              {Array.from({ length: 8 }).map((_, idx) => (
                <line key={`tick-${idx}`} x1={idx * 38 + 15} y1="0" x2={idx * 38 + 15} y2="16" stroke="#64748b" strokeWidth="0.8" />
              ))}
            </g>
          ))}

          {/* INSTALLED EQUIPMENTS SIDE PENETRATION BLOCKS */}
          {equipments.map((eq) => {
            const isSelected = eq.id === selectedEquipmentId;
            const uSlot = eq.uSlot || 1;
            const uH = eq.uHeight || 1;
            const itemH = uH * uPixelHeight - 2;
            const itemY = topH + (totalU - uSlot - uH + 1) * uPixelHeight + 1;
            const depthRatio = Math.min(1, Math.max(0.2, (eq.depthMm || 350) / (depthMm || 800)));
            const itemDepthPx = depthRatio * (sideW - 112);

            return (
              <g
                key={eq.id}
                onClick={() => onSelectEquipment(eq.id)}
                className="cursor-pointer transition-all hover:opacity-100"
                opacity={isSelected ? 1 : 0.85}
              >
                {/* Equipment Side Chassis Body */}
                <rect
                  x={sx + 56}
                  y={itemY}
                  width={itemDepthPx}
                  height={itemH}
                  fill={eq.color || '#1e293b'}
                  stroke={isSelected ? '#38bdf8' : eq.strokeColor || '#475569'}
                  strokeWidth={isSelected ? 2 : 1}
                  rx="2"
                />

                {/* Side Rail Slide Bracket */}
                <line
                  x1={sx + 56}
                  y1={itemY + itemH / 2}
                  x2={sx + 56 + itemDepthPx}
                  y2={itemY + itemH / 2}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4,2"
                />

                {/* Equipment Label */}
                <text
                  x={sx + 64}
                  y={itemY + itemH / 2 + 4}
                  fill="#ffffff"
                  fontSize={itemH > 24 ? '9' : '7.5'}
                  fontWeight="bold"
                  fontFamily="ui-monospace, monospace"
                >
                  {eq.label} ({eq.depthMm || 350}mm)
                </text>
              </g>
            );
          })}

          {/* BASE PEDESTAL WITH LEVELING GLIDES & CASTERS */}
          <g transform={`translate(${sx}, ${topH + rackInnerHeight})`}>
            <rect x="0" y="0" width={sideW} height={botH} fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="4" />
            {/* Front & Rear Heavy Leveling Feet */}
            <rect x="25" y={botH - 12} width="24" height="12" fill="#090d16" stroke="#94a3b8" strokeWidth="1.2" rx="2" />
            <rect x={sideW - 49} y={botH - 12} width="24" height="12" fill="#090d16" stroke="#94a3b8" strokeWidth="1.2" rx="2" />
            <text x={sideW / 2} y={botH - 15} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
              HEAVY-DUTY FLOOR BASE (SEISMIC RATED)
            </text>
          </g>

          {/* DIMENSIONS */}
          <g>
            {/* Depth Dimension */}
            <line x1={sx} y1={svgTotalH + 20} x2={sx + sideW} y2={svgTotalH + 20} stroke="#94a3b8" strokeWidth="1" />
            <text x={sx + sideW / 2} y={svgTotalH + 34} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
              {depthMm} mm (OVERALL DEPTH)
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// 3. REAR ELEVATION VIEW (POWER & COOLING)
// ==========================================
export const RackRearElevationView: React.FC<{
  rackName: string;
  totalU: number;
  widthMm?: number;
  depthMm?: number;
  equipments: RackEquipmentItem[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
  isCabinet?: boolean;
}> = ({
  rackName,
  totalU,
  equipments,
  selectedEquipmentId,
  onSelectEquipment,
}) => {
  const uPixelHeight = 22;
  const rackInnerWidth = 360;
  const railWidth = 32;
  const rackTotalWidth = rackInnerWidth + railWidth * 2;
  const rackHeight = totalU * uPixelHeight;
  const topHeaderH = 34;
  const bottomBaseH = 40;
  const svgTotalHeight = rackHeight + topHeaderH + bottomBaseH;
  const svgTotalWidth = rackTotalWidth + 80;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto">
      <div className="relative shadow-2xl rounded-xl bg-slate-950/80 p-2 border border-slate-800">
        <svg width={svgTotalWidth} height={svgTotalHeight} viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`} className="block">
          {/* Frame Background */}
          <rect x="40" y="0" width={rackTotalWidth} height={svgTotalHeight} fill="#090d16" stroke="#1e293b" strokeWidth="2" rx="6" />

          {/* Top Header */}
          <g transform="translate(40, 0)">
            <rect x="0" y="0" width={rackTotalWidth} height={topHeaderH} fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="4" />
            <rect x={rackTotalWidth / 2 - 60} y="7" width="120" height="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" rx="2" />
            <text x={rackTotalWidth / 2} y="18" textAnchor="middle" fill="#f59e0b" fontSize="8.5" fontWeight="bold" fontFamily="ui-monospace, monospace">
              REAR CABLE ENTRY &amp; BONDING
            </text>
          </g>

          {/* LEFT 0U VERTICAL PDU STRIP (FEED A - BLUE) */}
          <g transform={`translate(${40 + 4}, ${topHeaderH})`}>
            <rect x="0" y="0" width="22" height={rackHeight} fill="#0c4a6e" stroke="#0284c7" strokeWidth="1.2" rx="2" />
            <text x="11" y="24" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" transform="rotate(-90, 11, 24)">
              PDU-A (208V / 30A)
            </text>
            {/* Receptacles */}
            {Array.from({ length: Math.min(24, Math.floor(rackHeight / 16)) }).map((_, i) => (
              <rect key={`pdua-out-${i}`} x="4" y={40 + i * 16} width="14" height="8" fill="#082f49" stroke="#38bdf8" strokeWidth="0.8" rx="1" />
            ))}
          </g>

          {/* RIGHT 0U VERTICAL PDU STRIP (FEED B - RED) */}
          <g transform={`translate(${40 + rackTotalWidth - 26}, ${topHeaderH})`}>
            <rect x="0" y="0" width="22" height={rackHeight} fill="#4c0519" stroke="#e11d48" strokeWidth="1.2" rx="2" />
            <text x="11" y="24" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold" transform="rotate(-90, 11, 24)">
              PDU-B (208V / 30A)
            </text>
            {/* Receptacles */}
            {Array.from({ length: Math.min(24, Math.floor(rackHeight / 16)) }).map((_, i) => (
              <rect key={`pdub-out-${i}`} x="4" y={40 + i * 16} width="14" height="8" fill="#881337" stroke="#f43f5e" strokeWidth="0.8" rx="1" />
            ))}
          </g>

          {/* REAR 19" EIA RAILS WITH U NUMBERS */}
          <g transform={`translate(${40 + railWidth}, ${topHeaderH})`}>
            {/* Inner Bay Cavity */}
            <rect x="0" y="0" width={rackInnerWidth} height={rackHeight} fill="#050811" stroke="#1e293b" strokeWidth="1" />

            {/* Rear U-Slot Tick Lines */}
            {Array.from({ length: totalU }).map((_, idx) => {
              const uSlot = idx + 1;
              const y = (totalU - uSlot) * uPixelHeight;
              return (
                <g key={`rear-u-${uSlot}`}>
                  <line x1="0" y1={y} x2={rackInnerWidth} y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <text x="-8" y={y + 14} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="ui-monospace, monospace">
                    U{uSlot}
                  </text>
                  <text x={rackInnerWidth + 8} y={y + 14} textAnchor="start" fill="#64748b" fontSize="8" fontFamily="ui-monospace, monospace">
                    U{uSlot}
                  </text>
                </g>
              );
            })}

            {/* INSTALLED EQUIPMENTS REAR FACES (POWER SUPPLIES & FANS) */}
            {equipments.map((eq) => {
              const isSelected = eq.id === selectedEquipmentId;
              const uSlot = eq.uSlot || 1;
              const uH = eq.uHeight || 1;
              const itemH = uH * uPixelHeight - 2;
              const itemY = (totalU - uSlot - uH + 1) * uPixelHeight + 1;

              return (
                <g
                  key={eq.id}
                  onClick={() => onSelectEquipment(eq.id)}
                  className="cursor-pointer transition-all hover:opacity-100"
                  opacity={isSelected ? 1 : 0.9}
                >
                  {/* Rear Metal Body */}
                  <rect
                    x="4"
                    y={itemY}
                    width={rackInnerWidth - 8}
                    height={itemH}
                    fill="#111827"
                    stroke={isSelected ? '#38bdf8' : '#475569'}
                    strokeWidth={isSelected ? 2 : 1}
                    rx="2"
                  />

                  {/* Redundant Power Supply 1 (Left) */}
                  <g transform={`translate(12, ${itemY + 3})`}>
                    <rect x="0" y="0" width="55" height={itemH - 6} fill="#1f2937" stroke="#374151" strokeWidth="0.8" rx="1" />
                    {/* AC IEC C14 Receptacle or DC Screw Terminals */}
                    <rect x="8" y={Math.max(2, itemH / 2 - 7)} width="16" height="10" fill="#030712" stroke="#6b7280" strokeWidth="0.8" rx="1" />
                    {/* Status Green LED */}
                    <circle cx="32" cy={itemH / 2 - 2} r="2" fill="#22c55e" />
                    <text x="38" y={itemH / 2} fill="#9ca3af" fontSize="6" fontWeight="bold">PSU 1</text>
                  </g>

                  {/* Redundant Power Supply 2 (Right) */}
                  <g transform={`translate(${rackInnerWidth - 75}, ${itemY + 3})`}>
                    <rect x="0" y="0" width="55" height={itemH - 6} fill="#1f2937" stroke="#374151" strokeWidth="0.8" rx="1" />
                    <rect x="8" y={Math.max(2, itemH / 2 - 7)} width="16" height="10" fill="#030712" stroke="#6b7280" strokeWidth="0.8" rx="1" />
                    <circle cx="32" cy={itemH / 2 - 2} r="2" fill="#22c55e" />
                    <text x="38" y={itemH / 2} fill="#9ca3af" fontSize="6" fontWeight="bold">PSU 2</text>
                  </g>

                  {/* Center High-CFM Exhaust Cooling Fans */}
                  <g transform={`translate(${rackInnerWidth / 2 - 35}, ${itemY + 2})`}>
                    <circle cx="15" cy={itemH / 2 - 1} r={Math.min(10, itemH / 2 - 2)} fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                    <circle cx="15" cy={itemH / 2 - 1} r={Math.min(5, itemH / 4)} fill="#1e293b" />
                    <circle cx="55" cy={itemH / 2 - 1} r={Math.min(10, itemH / 2 - 2)} fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                    <circle cx="55" cy={itemH / 2 - 1} r={Math.min(5, itemH / 4)} fill="#1e293b" />
                  </g>

                  {/* Chassis Ground Lug */}
                  <circle cx="75" cy={itemY + itemH / 2} r="2.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />

                  {/* Label */}
                  <text
                    x={rackInnerWidth / 2}
                    y={itemY + itemH - 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontWeight="bold"
                    fontFamily="ui-monospace, monospace"
                  >
                    {eq.label} (REAR)
                  </text>
                </g>
              );
            })}
          </g>

          {/* BOTTOM MASTER GROUND BUSBAR (TGB) */}
          <g transform={`translate(40, ${topHeaderH + rackHeight})`}>
            <rect x="0" y="0" width={rackTotalWidth} height={bottomBaseH} fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="4" />
            {/* Solid Copper Busbar */}
            <rect x="50" y="8" width={rackTotalWidth - 100} height="16" fill="#b45309" stroke="#f59e0b" strokeWidth="1.2" rx="2" />
            <text x={rackTotalWidth / 2} y="19" textAnchor="middle" fill="#fef3c7" fontSize="8.5" fontWeight="bold" fontFamily="ui-monospace, monospace">
              TELECOM GROUNDING BUSBAR (TGB / MASTER EARTHING)
            </text>
            {/* Copper Lugs */}
            {[70, 110, 150, 190, 230, 270, 310].map((lx) => (
              <circle key={`lug-${lx}`} cx={lx} cy="16" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
