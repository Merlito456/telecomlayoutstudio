/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  RackEquipmentItem,
  RackEquipmentStencil,
  EquipmentCategory,
} from './types';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Tag,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  DoorOpen,
  DoorClosed,
  Columns,
  Rows,
} from 'lucide-react';
import {
  RackTopPlanView,
  RackSideElevationView,
  RackRearElevationView,
} from './RackOrthographicViews';

interface Rack2DElevationCanvasProps {
  totalU: number;
  heightMm?: number;
  rackType: 'open-2post' | 'open-4post' | 'enclosed-cabinet';
  rackName: string;
  equipments: RackEquipmentItem[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
  onAddEquipmentToSlot: (stencil: RackEquipmentStencil, targetUSlot: number) => void;
  onMoveEquipmentToSlot: (itemId: string, newUSlot: number) => void;
  onDeleteEquipment: (itemId: string) => void;
  onDuplicateEquipment: (itemId: string) => void;
  isCabinet?: boolean;
  doorsOpen?: boolean;
  onToggleDoor?: () => void;
  brand?: string;
  placementOrientation?: 'horizontal' | 'vertical';
  onToggleOrientation?: (orient: 'horizontal' | 'vertical') => void;
  activeView?: 'front' | 'rear' | 'top' | 'side' | '3d';
}

export function isSlotRangeOccupied(
  items: RackEquipmentItem[],
  uSlot: number,
  uHeight: number,
  excludeId?: string
): boolean {
  const targetMin = uSlot;
  const targetMax = uSlot + uHeight - 1;

  return items.some((item) => {
    if (excludeId && item.id === excludeId) return false;
    const itemMin = item.uSlot;
    const itemMax = item.uSlot + item.uHeight - 1;
    // Overlap condition
    return targetMin <= itemMax && targetMax >= itemMin;
  });
}

export const Rack2DElevationCanvas: React.FC<Rack2DElevationCanvasProps> = ({
  totalU,
  heightMm,
  rackType,
  rackName,
  equipments,
  selectedEquipmentId,
  onSelectEquipment,
  onAddEquipmentToSlot,
  onMoveEquipmentToSlot,
  onDeleteEquipment,
  onDuplicateEquipment,
  isCabinet = false,
  doorsOpen = false,
  onToggleDoor,
  brand = 'Telecom',
  placementOrientation = 'horizontal',
  onToggleOrientation,
  activeView = 'front',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [dragOverSlot, setDragOverSlot] = useState<{
    uSlot: number;
    uHeight: number;
    valid: boolean;
  } | null>(null);

  // Moving existing equipment
  const [movingEquipmentId, setMovingEquipmentId] = useState<string | null>(null);

  const isVertical = placementOrientation === 'vertical';

  // Dimensions of the rack elevation view (SVG coordinates)
  // Standard 19" rack opening is 450.85mm wide. With rails, outer width is ~500px.
  // 1U = 44.45mm height. In SVG pixels, let 1U = 22px.
  const uPixelHeight = 22;
  const rackInnerWidth = isVertical ? 480 : 360;
  const railWidth = isVertical ? 24 : 32;
  const rackTotalWidth = rackInnerWidth + railWidth * 2;
  const actualHeightMm = heightMm || Math.round(totalU * 44.45 + 130);
  const rackHeight = isVertical ? 320 : totalU * uPixelHeight;
  const topHeaderH = 34;
  const bottomBaseH = 40;
  const svgTotalHeight = rackHeight + topHeaderH + bottomBaseH;
  const svgTotalWidth = rackTotalWidth + 130; // Left & right margin for U numbers and height dimension

  const slotPxWidth = isVertical ? rackInnerWidth / totalU : rackInnerWidth;

  // Fit zoom automatically on mount or totalU change
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientHeight, clientWidth } = containerRef.current;
    if (clientHeight > 0 && clientWidth > 0) {
      const scaleH = (clientHeight - 40) / svgTotalHeight;
      const scaleW = (clientWidth - 40) / svgTotalWidth;
      const fitScale = Math.min(1.4, Math.max(0.65, Math.min(scaleH, scaleW)));
      setZoom(Math.round(fitScale * 100) / 100);
    }
  }, [totalU, svgTotalHeight, svgTotalWidth, isVertical]);

  // Convert client Y coordinate to U Slot (1 at bottom, totalU at top) for horizontal racks
  const calculateUSlotFromClientY = useCallback(
    (clientY: number, dragUHeight = 1): number => {
      const svgEl = containerRef.current?.querySelector('svg');
      if (!svgEl) return 1;
      const rect = svgEl.getBoundingClientRect();
      const relativeY = (clientY - rect.top) / zoom;
      const yInsideRack = relativeY - topHeaderH;
      const normalizedY = Math.max(0, Math.min(rackHeight, yInsideRack));
      // Top of rack is U=totalU, bottom of rack is U=1
      // When placing equipment with height H, uSlot is the bottom-most slot
      const fromTopU = Math.floor(normalizedY / uPixelHeight);
      const topSlot = totalU - fromTopU;
      const bottomSlot = topSlot - dragUHeight + 1;
      return Math.max(1, Math.min(totalU - dragUHeight + 1, bottomSlot));
    },
    [zoom, topHeaderH, rackHeight, totalU, uPixelHeight]
  );

  // Convert client X coordinate to vertical Slot (1 at left, totalU at right) for vertical subracks
  const calculateSlotFromClientX = useCallback(
    (clientX: number, dragSlots = 1): number => {
      const svgEl = containerRef.current?.querySelector('svg');
      if (!svgEl) return 1;
      const rect = svgEl.getBoundingClientRect();
      const relativeX = (clientX - rect.left) / zoom;
      const xInsideRack = relativeX - (40 + railWidth);
      const normalizedX = Math.max(0, Math.min(rackInnerWidth, xInsideRack));
      const slotIndex = Math.floor(normalizedX / slotPxWidth) + 1;
      return Math.max(1, Math.min(totalU - dragSlots + 1, slotIndex));
    },
    [zoom, railWidth, rackInnerWidth, totalU, slotPxWidth]
  );

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    let dragUHeight = 1;
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed.uHeight) dragUHeight = parsed.uHeight;
      }
    } catch {
      // fallback
    }

    // If we're dragging an existing item inside the rack
    if (movingEquipmentId) {
      const moveItem = equipments.find((i) => i.id === movingEquipmentId);
      if (moveItem) dragUHeight = moveItem.uHeight;
    }

    const slot = isVertical
      ? calculateSlotFromClientX(e.clientX, dragUHeight)
      : calculateUSlotFromClientY(e.clientY, dragUHeight);
    const occupied = isSlotRangeOccupied(
      equipments,
      slot,
      dragUHeight,
      movingEquipmentId || undefined
    );

    setDragOverSlot({
      uSlot: slot,
      uHeight: dragUHeight,
      valid: !occupied,
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the svg container
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);

    // If moving existing equipment
    if (movingEquipmentId) {
      const moveItem = equipments.find((i) => i.id === movingEquipmentId);
      if (moveItem) {
        const targetSlot = isVertical
          ? calculateSlotFromClientX(e.clientX, moveItem.uHeight)
          : calculateUSlotFromClientY(e.clientY, moveItem.uHeight);
        if (!isSlotRangeOccupied(equipments, targetSlot, moveItem.uHeight, movingEquipmentId)) {
          onMoveEquipmentToSlot(movingEquipmentId, targetSlot);
        }
      }
      setMovingEquipmentId(null);
      return;
    }

    // Dropping new equipment from catalog
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const stencil: RackEquipmentStencil = JSON.parse(raw);
      const targetSlot = isVertical
        ? calculateSlotFromClientX(e.clientX, stencil.uHeight)
        : calculateUSlotFromClientY(e.clientY, stencil.uHeight);
      if (!isSlotRangeOccupied(equipments, targetSlot, stencil.uHeight)) {
        onAddEquipmentToSlot(stencil, targetSlot);
      }
    } catch (err) {
      console.warn('Invalid drop data:', err);
    }
  };

  // Click on empty slot to deselect
  const handleSvgClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'rack-bg') {
      onSelectEquipment(null);
    }
  };

  // Helper to get Y coordinate for a given U slot (top position of the slot)
  const getSlotTopY = (slot: number) => {
    // slot 1 is at bottom: topHeaderH + (totalU - 1) * uPixelHeight
    // slot totalU is at top: topHeaderH
    return topHeaderH + (totalU - slot) * uPixelHeight;
  };

  if (activeView === 'top') {
    return (
      <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 p-1.5 px-3 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200">{rackName}</span>
          <span className="text-slate-500">·</span>
          <span className="text-xs text-sky-400 font-mono font-bold">{totalU}U</span>
          <span className="text-slate-500">·</span>
          <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
            Top Plan View (Footprint &amp; Clearances)
          </span>
        </div>
        <RackTopPlanView
          rackName={rackName}
          totalU={totalU}
          equipments={equipments}
          isCabinet={isCabinet}
          doorsOpen={doorsOpen}
          brand={brand}
          selectedEquipmentId={selectedEquipmentId}
          onSelectEquipment={onSelectEquipment}
        />
      </div>
    );
  }

  if (activeView === 'side') {
    return (
      <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 p-1.5 px-3 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200">{rackName}</span>
          <span className="text-slate-500">·</span>
          <span className="text-xs text-sky-400 font-mono font-bold">{totalU}U</span>
          <span className="text-slate-500">·</span>
          <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
            Side Elevation View (Chassis Depths &amp; Rails)
          </span>
        </div>
        <RackSideElevationView
          rackName={rackName}
          totalU={totalU}
          equipments={equipments}
          selectedEquipmentId={selectedEquipmentId}
          onSelectEquipment={onSelectEquipment}
        />
      </div>
    );
  }

  if (activeView === 'rear') {
    return (
      <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 p-1.5 px-3 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200">{rackName}</span>
          <span className="text-slate-500">·</span>
          <span className="text-xs text-sky-400 font-mono font-bold">{totalU}U</span>
          <span className="text-slate-500">·</span>
          <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
            Rear Elevation View (0U PDUs, PSUs &amp; Cooling Fans)
          </span>
        </div>
        <RackRearElevationView
          rackName={rackName}
          totalU={totalU}
          equipments={equipments}
          selectedEquipmentId={selectedEquipmentId}
          onSelectEquipment={onSelectEquipment}
          isCabinet={isCabinet}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Canvas Bar with Zoom & Fit */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10))}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="font-mono text-[11px] text-slate-400 px-1 font-semibold min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={() => {
            if (!containerRef.current) return;
            const { clientHeight } = containerRef.current;
            const fitScale = (clientHeight - 40) / svgTotalHeight;
            setZoom(Math.max(0.5, Math.min(1.4, Math.round(fitScale * 100) / 100)));
          }}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Fit Rack to View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Rack / Cabinet Title & Door Status Indicator */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 p-1.5 px-3 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg">
        <Layers className="w-4 h-4 text-sky-400" />
        <span className="text-xs font-semibold text-slate-200">{rackName}</span>
        {isCabinet && brand && (
          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
            {brand}
          </span>
        )}
        <span className="text-slate-500">·</span>
        <span className="text-xs text-sky-400 font-mono font-bold">{totalU}U Frame</span>
        <span className="text-slate-500">·</span>
        <span className="text-xs text-amber-300 font-mono font-bold">{actualHeightMm}mm</span>
        <span className="text-slate-500">·</span>
        <span className="text-xs text-slate-400 capitalize">
          {isCabinet ? 'Outdoor Cabinet' : rackType.replace('-', ' ')}
        </span>

        {isCabinet && onToggleDoor && (
          <>
            <span className="text-slate-700">|</span>
            <button
              onClick={onToggleDoor}
              title="Toggle Cabinet Door: Open reveals 19-inch equipment bay, closed seals cabinet"
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                doorsOpen
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-400/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {doorsOpen ? (
                <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <DoorClosed className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Door: {doorsOpen ? 'OPEN' : 'CLOSED'}</span>
            </button>
          </>
        )}

        {onToggleOrientation && (
          <>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => onToggleOrientation(isVertical ? 'horizontal' : 'vertical')}
              title="Toggle between Vertical Subrack (FH Mini ODC) and Horizontal EIA rack"
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                isVertical
                  ? 'bg-amber-950/90 text-amber-300 border-amber-600/60 ring-1 ring-amber-400/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isVertical ? <Columns className="w-3.5 h-3.5 text-amber-400" /> : <Rows className="w-3.5 h-3.5 text-sky-400" />}
              <span>{isVertical ? 'Orientation: VERTICAL SUBRACK' : 'Orientation: HORIZONTAL EIA'}</span>
            </button>
          </>
        )}
      </div>

      {/* Main Scrollable Elevation Viewport */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSvgClick}
        className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-6"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.08s ease-out',
          }}
          className="relative shrink-0 shadow-2xl rounded-lg"
        >
          <svg
            width={svgTotalWidth}
            height={svgTotalHeight}
            viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}
            className="block"
          >
            <defs>
              {/* EIA-310 Universal Square Cage Nut Hole Pattern */}
              <pattern
                id="eia-hole-pattern"
                width="20"
                height={uPixelHeight}
                patternUnits="userSpaceOnUse"
              >
                {/* 3 square holes per 1U (5/8" - 5/8" - 1/2" pitch) */}
                <rect x="7" y="3" width="5.5" height="4.5" fill="#060911" stroke="#52617a" strokeWidth="0.8" rx="0.5" />
                <rect x="7" y={uPixelHeight / 2 - 2.25} width="5.5" height="4.5" fill="#060911" stroke="#52617a" strokeWidth="0.8" rx="0.5" />
                <rect x="7" y={uPixelHeight - 7.5} width="5.5" height="4.5" fill="#060911" stroke="#52617a" strokeWidth="0.8" rx="0.5" />
              </pattern>

              {/* Steel Rail Texture Gradient */}
              <linearGradient id="rail-grad-left" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="60%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="rail-grad-right" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="40%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Chassis Bevel Gradient */}
              <linearGradient id="chassis-bevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </linearGradient>
              {/* Caution Hazard Tape Pattern (diagonal yellow/black stripes) */}
              <pattern
                id="caution-hazard-tape"
                width="20"
                height="20"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <rect width="10" height="20" fill="#eab308" />
                <rect x="10" width="10" height="20" fill="#0f172a" />
              </pattern>
            </defs>

            {/* Background of the Open Relay Rack Bay */}
            <rect
              id="rack-bg"
              x="40"
              y="0"
              width={rackTotalWidth}
              height={svgTotalHeight}
              fill="#060911"
              stroke="#1a2232"
              strokeWidth="2"
              rx="4"
            />

            {/* TOP HEADER: Heavy Angle Top Crossmember & Overhead Cable Ladder Clamp */}
            <g transform="translate(40, 0)">
              {/* Structural steel angle beam */}
              <rect
                x="0"
                y="0"
                width={rackTotalWidth}
                height={topHeaderH}
                fill="#1a2232"
                stroke="#334155"
                strokeWidth="1.5"
                rx="3"
              />

              {/* Overhead Cable Ladder Bracket & Curved Waterfall Drop */}
              <rect
                x={rackTotalWidth / 2 - 65}
                y="5"
                width="130"
                height="15"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={rackTotalWidth / 2}
                y="16"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                letterSpacing="0.8"
                fontFamily="ui-monospace, monospace"
              >
                LADDER RUNWAY BRACKET
              </text>

              {/* Top Gusset Bolt Plates on Left & Right posts */}
              <rect x="6" y="6" width={railWidth - 12} height={topHeaderH - 12} fill="#0f172a" stroke="#475569" strokeWidth="1" rx="1" />
              <circle cx={railWidth / 2} cy={topHeaderH / 2} r="2.5" fill="#ca8a04" stroke="#713f12" strokeWidth="0.8" />

              <rect x={rackTotalWidth - railWidth + 6} y="6" width={railWidth - 12} height={topHeaderH - 12} fill="#0f172a" stroke="#475569" strokeWidth="1" rx="1" />
              <circle cx={rackTotalWidth - railWidth / 2} cy={topHeaderH / 2} r="2.5" fill="#ca8a04" stroke="#713f12" strokeWidth="0.8" />
            </g>

            {/* RACK INTERNAL CHASSIS BAY BACKGROUND */}
            <rect
              x={40 + railWidth}
              y={topHeaderH}
              width={rackInnerWidth}
              height={rackHeight}
              fill="#050811"
              stroke="#0f172a"
              strokeWidth="1"
            />

            {/* --- CASE A: VERTICAL SUBRACK MOUNTING (FH MINI ODC & CASSETTES) --- */}
            {isVertical ? (
              <>
                {/* Top Subrack Aluminum Guide Rail */}
                <g transform={`translate(${40 + railWidth}, ${topHeaderH})`}>
                  <rect
                    x="0"
                    y="0"
                    width={rackInnerWidth}
                    height="22"
                    fill="url(#rail-grad-left)"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  {/* Slot tick marks and V-numbers along top rail */}
                  {Array.from({ length: totalU }).map((_, idx) => {
                    const slotNum = idx + 1;
                    const sx = idx * slotPxWidth;
                    return (
                      <g key={`v-top-slot-${slotNum}`}>
                        <line x1={sx} y1="0" x2={sx} y2="22" stroke="#334155" strokeWidth="0.8" />
                        <text
                          x={sx + slotPxWidth / 2}
                          y="14"
                          textAnchor="middle"
                          fill={slotNum % 4 === 1 ? '#38bdf8' : '#94a3b8'}
                          fontSize={slotNum % 4 === 1 ? '9' : '8'}
                          fontWeight={slotNum % 4 === 1 ? 'bold' : 'normal'}
                          fontFamily="ui-monospace, monospace"
                        >
                          V{slotNum}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Bottom Subrack Aluminum Guide Rail */}
                <g transform={`translate(${40 + railWidth}, ${topHeaderH + rackHeight - 22})`}>
                  <rect
                    x="0"
                    y="0"
                    width={rackInnerWidth}
                    height="22"
                    fill="url(#rail-grad-left)"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  {Array.from({ length: totalU }).map((_, idx) => {
                    const slotNum = idx + 1;
                    const sx = idx * slotPxWidth;
                    return (
                      <g key={`v-bot-slot-${slotNum}`}>
                        <line x1={sx} y1="0" x2={sx} y2="22" stroke="#334155" strokeWidth="0.8" />
                        <text
                          x={sx + slotPxWidth / 2}
                          y="14"
                          textAnchor="middle"
                          fill={slotNum % 4 === 1 ? '#38bdf8' : '#94a3b8'}
                          fontSize={slotNum % 4 === 1 ? '9' : '8'}
                          fontWeight={slotNum % 4 === 1 ? 'bold' : 'normal'}
                          fontFamily="ui-monospace, monospace"
                        >
                          V{slotNum}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Left & Right Subrack Structural Side Endplates */}
                <g transform={`translate(40, ${topHeaderH})`}>
                  <rect x="0" y="0" width={railWidth} height={rackHeight} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  <text x={railWidth / 2} y={rackHeight / 2} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="ui-monospace, monospace" transform={`rotate(-90 ${railWidth / 2} ${rackHeight / 2})`}>
                    SUBRACK L
                  </text>
                </g>
                <g transform={`translate(${40 + railWidth + rackInnerWidth}, ${topHeaderH})`}>
                  <rect x="0" y="0" width={railWidth} height={rackHeight} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  <text x={railWidth / 2} y={rackHeight / 2} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="ui-monospace, monospace" transform={`rotate(90 ${railWidth / 2} ${rackHeight / 2})`}>
                    SUBRACK R
                  </text>
                </g>

                {/* Card slot vertical divider lines */}
                {Array.from({ length: totalU }).map((_, idx) => {
                  const sx = 40 + railWidth + idx * slotPxWidth;
                  return (
                    <line
                      key={`v-div-${idx}`}
                      x1={sx}
                      y1={topHeaderH + 22}
                      x2={sx}
                      y2={topHeaderH + rackHeight - 22}
                      stroke="#1e293b"
                      strokeWidth="0.75"
                      strokeDasharray="2,3"
                    />
                  );
                })}

                {/* Vertical Installed Equipment Blades */}
                {equipments.map((item) => {
                  const itemLeftX = 40 + railWidth + (item.uSlot - 1) * slotPxWidth;
                  const itemPixelW = item.uHeight * slotPxWidth;
                  const itemTopY = topHeaderH + 22 + 2;
                  const itemPixelH = rackHeight - 44 - 4;
                  const isSelected = selectedEquipmentId === item.id;

                  const ledColor =
                    item.category === 'power' || item.category === 'battery'
                      ? '#f59e0b'
                      : item.category === 'patch-panel' || item.category === 'fiber-shelf'
                      ? '#0ea5e9'
                      : '#22c55e';

                  return (
                    <g
                      key={item.id}
                      transform={`translate(${itemLeftX}, ${itemTopY})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEquipment(item.id);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Top & Bottom Cassette Ejector Latches */}
                      <rect
                        x="2"
                        y="1"
                        width={Math.max(4, itemPixelW - 4)}
                        height="8"
                        rx="1"
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                      <rect
                        x="2"
                        y={itemPixelH - 9}
                        width={Math.max(4, itemPixelW - 4)}
                        height="8"
                        rx="1"
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="0.8"
                      />

                      {/* Main Vertical Cassette Chassis */}
                      <rect
                        x="0"
                        y="1"
                        width={itemPixelW}
                        height={itemPixelH - 2}
                        fill={item.color || '#1e293b'}
                        stroke={isSelected ? '#38bdf8' : item.strokeColor || '#475569'}
                        strokeWidth={isSelected ? '2' : '1'}
                        rx="2"
                      />

                      {/* Bevel Lighting Overlay */}
                      <rect
                        x="0"
                        y="1"
                        width={itemPixelW}
                        height={itemPixelH - 2}
                        fill="url(#chassis-bevel)"
                        rx="2"
                        pointerEvents="none"
                      />

                      {/* Selection Glow */}
                      {isSelected && (
                        <rect
                          x="-2"
                          y="-1"
                          width={itemPixelW + 4}
                          height={itemPixelH + 2}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4,2"
                          rx="3"
                        />
                      )}

                      {/* Top Status LED */}
                      <circle cx={itemPixelW / 2} cy="18" r="3" fill={ledColor} />

                      {/* Slot Badge */}
                      <rect
                        x={Math.max(2, itemPixelW / 2 - 16)}
                        y="26"
                        width="32"
                        height="12"
                        fill="#090d16"
                        stroke="#334155"
                        strokeWidth="0.6"
                        rx="2"
                      />
                      <text
                        x={itemPixelW / 2}
                        y="35"
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="ui-monospace, monospace"
                      >
                        V{item.uSlot}
                      </text>

                      {/* Vertical Equipment Label */}
                      <g transform={`translate(${itemPixelW / 2}, ${itemPixelH / 2 + 10}) rotate(-90)`}>
                        <text
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="ui-monospace, monospace"
                          letterSpacing="0.4"
                        >
                          {item.label}
                        </text>
                      </g>

                      {/* Port representation: Fiber / DIN indicators */}
                      {item.category === 'fiber-shelf' || item.category === 'patch-panel' ? (
                        <g transform={`translate(${itemPixelW / 2 - 6}, ${itemPixelH - 65})`}>
                          {[0, 10, 20, 30].map((py) => (
                            <rect
                              key={`vport-${py}`}
                              x="0"
                              y={py}
                              width="12"
                              height="7"
                              fill="#083344"
                              stroke="#06b6d4"
                              strokeWidth="0.8"
                              rx="1"
                            />
                          ))}
                        </g>
                      ) : null}

                      {/* HOVER / ACTIVE ACTION BUTTONS STRIP */}
                      <g
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        transform={`translate(${Math.max(2, itemPixelW / 2 - 36)}, ${itemPixelH - 24})`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width="72"
                          height="18"
                          fill="#090d16"
                          stroke="#334155"
                          strokeWidth="1"
                          rx="4"
                        />
                        {/* Move Left Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.uSlot > 1) {
                              if (!isSlotRangeOccupied(equipments, item.uSlot - 1, item.uHeight, item.id)) {
                                onMoveEquipmentToSlot(item.id, item.uSlot - 1);
                              }
                            }
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(4, 2)"
                        >
                          <title>Move Left (V-Slot - 1)</title>
                          <rect x="0" y="0" width="14" height="14" fill="#1e293b" rx="2" />
                          <path d="M10 3 L4 7 L10 11 Z" fill="#94a3b8" />
                        </g>

                        {/* Move Right Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.uSlot + item.uHeight <= totalU) {
                              if (!isSlotRangeOccupied(equipments, item.uSlot + 1, item.uHeight, item.id)) {
                                onMoveEquipmentToSlot(item.id, item.uSlot + 1);
                              }
                            }
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(22, 2)"
                        >
                          <title>Move Right (V-Slot + 1)</title>
                          <rect x="0" y="0" width="14" height="14" fill="#1e293b" rx="2" />
                          <path d="M4 3 L10 7 L4 11 Z" fill="#94a3b8" />
                        </g>

                        {/* Duplicate Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateEquipment(item.id);
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(40, 2)"
                        >
                          <title>Duplicate Module</title>
                          <rect x="0" y="0" width="14" height="14" fill="#1e293b" rx="2" />
                          <rect x="3" y="3" width="6" height="6" fill="#38bdf8" />
                        </g>

                        {/* Delete Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEquipment(item.id);
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(56, 2)"
                        >
                          <title>Remove Module</title>
                          <rect x="0" y="0" width="14" height="14" fill="#450a0a" rx="2" />
                          <line x1="4" y1="4" x2="10" y2="10" stroke="#f87171" strokeWidth="1.5" />
                          <line x1="10" y1="4" x2="4" y2="10" stroke="#f87171" strokeWidth="1.5" />
                        </g>
                      </g>
                    </g>
                  );
                })}

                {/* Vertical Drag Over Indicator */}
                {dragOverSlot && (
                  <g
                    transform={`translate(${40 + railWidth + (dragOverSlot.uSlot - 1) * slotPxWidth}, ${topHeaderH + 22})`}
                    pointerEvents="none"
                  >
                    <rect
                      x="0"
                      y="1"
                      width={dragOverSlot.uHeight * slotPxWidth}
                      height={rackHeight - 44 - 2}
                      fill={dragOverSlot.valid ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.3)'}
                      stroke={dragOverSlot.valid ? '#38bdf8' : '#ef4444'}
                      strokeWidth="2"
                      strokeDasharray="6,3"
                      rx="3"
                    />
                    <rect
                      x={Math.max(2, (dragOverSlot.uHeight * slotPxWidth) / 2 - 50)}
                      y={(rackHeight - 44) / 2 - 12}
                      width="100"
                      height="24"
                      fill="#090d16"
                      stroke={dragOverSlot.valid ? '#38bdf8' : '#ef4444'}
                      strokeWidth="1"
                      rx="4"
                    />
                    <text
                      x={(dragOverSlot.uHeight * slotPxWidth) / 2}
                      y={(rackHeight - 44) / 2 + 4}
                      textAnchor="middle"
                      fill={dragOverSlot.valid ? '#38bdf8' : '#ef4444'}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                    >
                      {dragOverSlot.valid
                        ? `Drop: V${dragOverSlot.uSlot}..V${dragOverSlot.uSlot + dragOverSlot.uHeight - 1}`
                        : 'Slot Occupied'}
                    </text>
                  </g>
                )}
              </>
            ) : (
              /* --- CASE B: HORIZONTAL EIA-310 19" RACK MOUNTING --- */
              <>
                {/* LEFT & RIGHT EIA-310 VERTICAL RAILS */}
                {/* Left Rail */}
                <g transform={`translate(40, ${topHeaderH})`}>
                  <rect
                    x="0"
                    y="0"
                    width={railWidth}
                    height={rackHeight}
                    fill="url(#rail-grad-left)"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <rect
                    x="6"
                    y="0"
                    width={railWidth - 12}
                    height={rackHeight}
                    fill="url(#eia-hole-pattern)"
                  />
                </g>

                {/* Right Rail */}
                <g transform={`translate(${40 + railWidth + rackInnerWidth}, ${topHeaderH})`}>
                  <rect
                    x="0"
                    y="0"
                    width={railWidth}
                    height={rackHeight}
                    fill="url(#rail-grad-right)"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <rect
                    x="6"
                    y="0"
                    width={railWidth - 12}
                    height={rackHeight}
                    fill="url(#eia-hole-pattern)"
                  />
                </g>

                {/* 1U DIVISION GUIDELINES AND U-NUMBERS */}
                {Array.from({ length: totalU }).map((_, idx) => {
                  const uNum = totalU - idx; // Top is totalU, bottom is 1
                  const y = topHeaderH + idx * uPixelHeight;

                  return (
                    <g key={`u-slot-${uNum}`} className="select-none">
                      {/* Left U Number */}
                      <text
                        x="28"
                        y={y + uPixelHeight / 2 + 3.5}
                        textAnchor="middle"
                        fill={uNum % 5 === 0 ? '#38bdf8' : '#64748b'}
                        fontSize={uNum % 5 === 0 ? '9.5' : '8'}
                        fontWeight={uNum % 5 === 0 ? 'bold' : 'normal'}
                        fontFamily="ui-monospace, monospace"
                      >
                        {uNum}
                      </text>

                      {/* Right U Number */}
                      <text
                        x={svgTotalWidth - 12}
                        y={y + uPixelHeight / 2 + 3.5}
                        textAnchor="middle"
                        fill={uNum % 5 === 0 ? '#38bdf8' : '#64748b'}
                        fontSize={uNum % 5 === 0 ? '9.5' : '8'}
                        fontWeight={uNum % 5 === 0 ? 'bold' : 'normal'}
                        fontFamily="ui-monospace, monospace"
                      >
                        {uNum}
                      </text>

                      {/* Inner Guideline (Subtle 1U dashed separator) */}
                      <line
                        x1={40 + railWidth}
                        y1={y}
                        x2={40 + railWidth + rackInnerWidth}
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="0.75"
                        strokeDasharray="2,3"
                      />

                      {/* Rail Tick Marks */}
                      <line
                        x1="40"
                        y1={y}
                        x2={40 + railWidth}
                        y2={y}
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                      <line
                        x1={40 + railWidth + rackInnerWidth}
                        y1={y}
                        x2={40 + rackTotalWidth}
                        y2={y}
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                    </g>
                  );
                })}

                {/* EMPTY RACK SHELVES & CAUTION BANNER (When rack is empty, shows authentic telecom frame readiness) */}
                {(!equipments || equipments.length === 0) && (
                  <g pointerEvents="none">
                    {/* Cantilever support shelf at lower third */}
                    <g transform={`translate(${40 + railWidth}, ${topHeaderH + rackHeight * 0.65})`}>
                      <rect x="0" y="0" width={rackInnerWidth} height="20" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="2" />
                      <line x1="8" y1="10" x2={rackInnerWidth - 8} y2="10" stroke="#334155" strokeWidth="1" strokeDasharray="6,4" />
                      <text x={rackInnerWidth / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="ui-monospace, monospace">
                        19" CANTILEVER EQUIPMENT SUPPORT SHELF
                      </text>
                      {/* Left & Right mounting brackets */}
                      <rect x="-6" y="2" width="6" height="16" fill="#475569" rx="1" />
                      <rect x={rackInnerWidth} y="2" width="6" height="16" fill="#475569" rx="1" />
                    </g>

                    {/* Space Reservation / Caution Hazard Tape (as in reference photo) */}
                    <g transform={`translate(${40 + railWidth}, ${topHeaderH + rackHeight * 0.35})`}>
                      <rect x="0" y="0" width={rackInnerWidth} height="22" fill="url(#caution-hazard-tape)" stroke="#ca8a04" strokeWidth="1" rx="2" opacity="0.9" />
                      <rect x={rackInnerWidth / 2 - 80} y="3" width="160" height="16" fill="#090d16" stroke="#eab308" strokeWidth="1" rx="2" />
                      <text x={rackInnerWidth / 2} y="14" textAnchor="middle" fill="#facc15" fontSize="8.5" fontWeight="bold" fontFamily="ui-monospace, monospace">
                        SPACE RESERVED / ACTIVE TELECOM BAY
                      </text>
                    </g>
                  </g>
                )}

                {/* INSTALLED EQUIPMENTS */}
                {equipments.map((item) => {
                  // Slot top position: slot totalU is at topHeaderH
                  const itemTopY = getSlotTopY(item.uSlot + item.uHeight - 1);
                  const itemPixelH = item.uHeight * uPixelHeight;
                  const isSelected = selectedEquipmentId === item.id;

                  return (
                    <g
                      key={item.id}
                      transform={`translate(${40 + railWidth}, ${itemTopY})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEquipment(item.id);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Left Mounting Ear with Screws */}
                      <rect
                        x={-railWidth + 6}
                        y="1"
                        width={railWidth - 8}
                        height={itemPixelH - 2}
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="0.8"
                        rx="1"
                      />
                      <circle
                        cx={-railWidth / 2 + 2}
                        cy={Math.min(8, itemPixelH / 2)}
                        r="2.5"
                        fill="#94a3b8"
                        stroke="#1e293b"
                        strokeWidth="0.6"
                      />
                      {item.uHeight > 1 && (
                        <circle
                          cx={-railWidth / 2 + 2}
                          cy={itemPixelH - 8}
                          r="2.5"
                          fill="#94a3b8"
                          stroke="#1e293b"
                          strokeWidth="0.6"
                        />
                      )}

                      {/* Right Mounting Ear with Screws */}
                      <rect
                        x={rackInnerWidth + 2}
                        y="1"
                        width={railWidth - 8}
                        height={itemPixelH - 2}
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="0.8"
                        rx="1"
                      />
                      <circle
                        cx={rackInnerWidth + railWidth / 2 - 2}
                        cy={Math.min(8, itemPixelH / 2)}
                        r="2.5"
                        fill="#94a3b8"
                        stroke="#1e293b"
                        strokeWidth="0.6"
                      />
                      {item.uHeight > 1 && (
                        <circle
                          cx={rackInnerWidth + railWidth / 2 - 2}
                          cy={itemPixelH - 8}
                          r="2.5"
                          fill="#94a3b8"
                          stroke="#1e293b"
                          strokeWidth="0.6"
                        />
                      )}

                      {/* Main Chassis Body Faceplate */}
                      <rect
                        x="0"
                        y="1"
                        width={rackInnerWidth}
                        height={itemPixelH - 2}
                        fill={item.color || '#1e293b'}
                        stroke={
                          isSelected
                            ? '#38bdf8'
                            : item.strokeColor || '#475569'
                        }
                        strokeWidth={isSelected ? '2' : '1'}
                        rx="2"
                      />

                      {/* Bevel Lighting Overlay */}
                      <rect
                        x="0"
                        y="1"
                        width={rackInnerWidth}
                        height={itemPixelH - 2}
                        fill="url(#chassis-bevel)"
                        rx="2"
                        pointerEvents="none"
                      />

                      {/* SELECTION GLOW AROUND CHASSIS */}
                      {isSelected && (
                        <rect
                          x="-2"
                          y="-1"
                          width={rackInnerWidth + 4}
                          height={itemPixelH + 2}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4,2"
                          rx="3"
                        />
                      )}

                      {/* Equipment Face Details */}
                      {renderEquipmentFaceDetails(item, rackInnerWidth, itemPixelH)}

                      {/* HOVER / ACTIVE ACTION BUTTONS STRIP */}
                      <g
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        transform={`translate(${rackInnerWidth - 75}, 3)`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width="72"
                          height="18"
                          fill="#090d16"
                          stroke="#334155"
                          strokeWidth="1"
                          rx="4"
                        />
                        {/* Move Up Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.uSlot + item.uHeight <= totalU) {
                              if (
                                !isSlotRangeOccupied(
                                  equipments,
                                  item.uSlot + 1,
                                  item.uHeight,
                                  item.id
                                )
                              ) {
                                onMoveEquipmentToSlot(item.id, item.uSlot + 1);
                              }
                            }
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(4, 2)"
                        >
                          <title>Move 1U Up</title>
                          <rect x="0" y="0" width="14" height="14" fill="#1e293b" rx="2" />
                          <path d="M7 3 L3 9 L11 9 Z" fill="#94a3b8" />
                        </g>

                        {/* Move Down Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.uSlot > 1) {
                              if (
                                !isSlotRangeOccupied(
                                  equipments,
                                  item.uSlot - 1,
                                  item.uHeight,
                                  item.id
                                )
                              ) {
                                onMoveEquipmentToSlot(item.id, item.uSlot - 1);
                              }
                            }
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(22, 2)"
                        >
                          <title>Move 1U Down</title>
                          <rect x="0" y="0" width="14" height="14" fill="#1e293b" rx="2" />
                          <path d="M7 11 L3 5 L11 5 Z" fill="#94a3b8" />
                        </g>

                        {/* Duplicate Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateEquipment(item.id);
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(40, 2)"
                        >
                          <title>Duplicate Equipment</title>
                          <rect x="0" y="0" width="14" height="14" fill="#1e293b" rx="2" />
                          <rect x="3" y="3" width="6" height="6" fill="#38bdf8" />
                        </g>

                        {/* Delete Button */}
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEquipment(item.id);
                          }}
                          className="cursor-pointer hover:opacity-80"
                          transform="translate(56, 2)"
                        >
                          <title>Delete Equipment</title>
                          <rect x="0" y="0" width="14" height="14" fill="#450a0a" rx="2" />
                          <line x1="4" y1="4" x2="10" y2="10" stroke="#f87171" strokeWidth="1.5" />
                          <line x1="10" y1="4" x2="4" y2="10" stroke="#f87171" strokeWidth="1.5" />
                        </g>
                      </g>
                    </g>
                  );
                })}

                {/* Horizontal DRAG OVER DROP TARGET PREVIEW INDICATOR */}
                {dragOverSlot && (
                  <g
                    transform={`translate(${40 + railWidth}, ${getSlotTopY(
                      dragOverSlot.uSlot + dragOverSlot.uHeight - 1
                    )})`}
                    pointerEvents="none"
                  >
                    <rect
                      x="0"
                      y="1"
                      width={rackInnerWidth}
                      height={dragOverSlot.uHeight * uPixelHeight - 2}
                      fill={dragOverSlot.valid ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.3)'}
                      stroke={dragOverSlot.valid ? '#38bdf8' : '#ef4444'}
                      strokeWidth="2"
                      strokeDasharray="6,3"
                      rx="3"
                    />
                    <rect
                      x={rackInnerWidth / 2 - 70}
                      y={Math.max(2, (dragOverSlot.uHeight * uPixelHeight) / 2 - 10)}
                      width="140"
                      height="20"
                      fill="#090d16"
                      stroke={dragOverSlot.valid ? '#38bdf8' : '#ef4444'}
                      strokeWidth="1"
                      rx="4"
                    />
                    <text
                      x={rackInnerWidth / 2}
                      y={Math.max(2, (dragOverSlot.uHeight * uPixelHeight) / 2 - 10) + 14}
                      textAnchor="middle"
                      fill={dragOverSlot.valid ? '#38bdf8' : '#ef4444'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                    >
                      {dragOverSlot.valid
                        ? `Drop: U${dragOverSlot.uSlot}..U${
                            dragOverSlot.uSlot + dragOverSlot.uHeight - 1
                          } (${dragOverSlot.uHeight}U)`
                        : 'Collision: Slot Occupied'}
                    </text>
                  </g>
                )}
              </>
            )}

            {/* BOTTOM BASE: Deep Floor Base Plates, Welded Gussets & Seismic Floor Anchor Bolts */}
            <g transform={`translate(40, ${svgTotalHeight - bottomBaseH})`}>
              {/* Floor Base Channel Foot (Left Post) */}
              <rect
                x="0"
                y="6"
                width={railWidth + 14}
                height={bottomBaseH - 6}
                fill="#1a2232"
                stroke="#334155"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Left Base Triangular Gusset Stiffener */}
              <polygon
                points={`0,${bottomBaseH} ${railWidth + 14},${bottomBaseH} ${railWidth / 2},6`}
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Left Anchor Bolts with Heavy Washers */}
              <circle cx="12" cy={bottomBaseH - 10} r="4.5" fill="#ca8a04" stroke="#713f12" strokeWidth="1" />
              <circle cx="12" cy={bottomBaseH - 10} r="2" fill="#090d16" />
              <circle cx={railWidth + 2} cy={bottomBaseH - 10} r="4.5" fill="#ca8a04" stroke="#713f12" strokeWidth="1" />
              <circle cx={railWidth + 2} cy={bottomBaseH - 10} r="2" fill="#090d16" />

              {/* Floor Base Channel Foot (Right Post) */}
              <rect
                x={rackTotalWidth - (railWidth + 14)}
                y="6"
                width={railWidth + 14}
                height={bottomBaseH - 6}
                fill="#1a2232"
                stroke="#334155"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Right Base Triangular Gusset Stiffener */}
              <polygon
                points={`${rackTotalWidth - (railWidth + 14)},${bottomBaseH} ${rackTotalWidth},${bottomBaseH} ${rackTotalWidth - railWidth / 2},6`}
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Right Anchor Bolts with Heavy Washers */}
              <circle cx={rackTotalWidth - (railWidth + 2)} cy={bottomBaseH - 10} r="4.5" fill="#ca8a04" stroke="#713f12" strokeWidth="1" />
              <circle cx={rackTotalWidth - (railWidth + 2)} cy={bottomBaseH - 10} r="2" fill="#090d16" />
              <circle cx={rackTotalWidth - 12} cy={bottomBaseH - 10} r="4.5" fill="#ca8a04" stroke="#713f12" strokeWidth="1" />
              <circle cx={rackTotalWidth - 12} cy={bottomBaseH - 10} r="2" fill="#090d16" />

              {/* Open Center Bottom Tie-Beam */}
              <rect
                x={railWidth + 14}
                y={bottomBaseH - 14}
                width={rackInnerWidth - 28}
                height="12"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={rackTotalWidth / 2}
                y={bottomBaseH - 5}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontWeight="bold"
                letterSpacing="0.8"
                fontFamily="ui-monospace, monospace"
              >
                HEAVY-DUTY ANCHORED BASE (OPEN BAY)
              </text>
            </g>

            {/* ACTUAL PHYSICAL HEIGHT CAD DIMENSION ANNOTATION */}
            <g transform="translate(40, 0)">
              {/* Top Extension Line */}
              <line
                x1={rackTotalWidth + 6}
                y1="0"
                x2={rackTotalWidth + 48}
                y2="0"
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              {/* Bottom Extension Line */}
              <line
                x1={rackTotalWidth + 6}
                y1={svgTotalHeight}
                x2={rackTotalWidth + 48}
                y2={svgTotalHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              {/* Vertical Dimension Leader Line */}
              <line
                x1={rackTotalWidth + 36}
                y1="0"
                x2={rackTotalWidth + 36}
                y2={svgTotalHeight}
                stroke="#38bdf8"
                strokeWidth="1.2"
              />
              {/* Arrowhead Top */}
              <polygon
                points={`${rackTotalWidth + 33},8 ${rackTotalWidth + 39},8 ${rackTotalWidth + 36},0`}
                fill="#38bdf8"
              />
              {/* Arrowhead Bottom */}
              <polygon
                points={`${rackTotalWidth + 33},${svgTotalHeight - 8} ${rackTotalWidth + 39},${svgTotalHeight - 8} ${rackTotalWidth + 36},${svgTotalHeight}`}
                fill="#38bdf8"
              />
              {/* Dimension Label Text Badge */}
              <g transform={`translate(${rackTotalWidth + 50}, ${svgTotalHeight / 2}) rotate(90)`}>
                <rect
                  x="-75"
                  y="-11"
                  width="150"
                  height="20"
                  fill="#090d16"
                  stroke="#0284c7"
                  strokeWidth="1"
                  rx="4"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="ui-monospace, monospace"
                >
                  {actualHeightMm} mm ({totalU}U Frame)
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

/** Render realistic front panel faces depending on equipment category */
function renderEquipmentFaceDetails(
  item: RackEquipmentItem,
  width: number,
  height: number
): React.ReactNode {
  const is1U = item.uHeight === 1;
  const is2U = item.uHeight === 2;
  const is3UOrMore = item.uHeight >= 3;

  return (
    <g>
      {/* 1. PRIMARY EQUIPMENT LABEL PLATE (HIGH CONTRAST & CRISP) */}
      <g transform="translate(10, 3)">
        {/* Label background badge */}
        <rect
          x="0"
          y="0"
          width={Math.min(130, width * 0.38)}
          height={Math.min(16, height - 6)}
          fill="#090d16"
          stroke="#334155"
          strokeWidth="0.8"
          rx="2"
        />
        {/* Status indicator dot */}
        <circle
          cx="6"
          cy={Math.min(16, height - 6) / 2}
          r="2.5"
          fill={
            item.category === 'power' || item.category === 'battery'
              ? '#f59e0b'
              : item.category === 'patch-panel' || item.category === 'fiber-shelf'
              ? '#0ea5e9'
              : '#22c55e'
          }
        />
        {/* Main User Label */}
        <text
          x="14"
          y={Math.min(16, height - 6) / 2 + 3.5}
          fill="#f8fafc"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.4"
        >
          {item.label}
        </text>
      </g>

      {/* 2. U-HEIGHT BADGE */}
      <text
        x={width - 12}
        y={height / 2 + 3.5}
        textAnchor="end"
        fill="#64748b"
        fontSize="8"
        fontWeight="bold"
        fontFamily="ui-monospace, monospace"
      >
        {item.uHeight}U
      </text>

      {/* 3. HARDWARE FACE DETAILS BY CATEGORY */}
      {item.category === 'patch-panel' && (
        // RJ45 Keystone Port Grid
        <g transform={`translate(${width * 0.4}, ${height / 2 - 4})`}>
          {Array.from({ length: 16 }).map((_, i) => (
            <rect
              key={`rj-${i}`}
              x={i * 9}
              y="0"
              width="6.5"
              height="8"
              fill="#090d16"
              stroke="#64748b"
              strokeWidth="0.5"
              rx="1"
            />
          ))}
        </g>
      )}

      {item.category === 'fiber-shelf' && (
        // LC Duplex Fiber Coupler Ports (Aqua/Blue)
        <g transform={`translate(${width * 0.38}, ${height / 2 - 4})`}>
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={`lc-${i}`}
              x={i * 10}
              y="0"
              width="7.5"
              height="8"
              fill="#083344"
              stroke="#06b6d4"
              strokeWidth="0.7"
              rx="1"
            />
          ))}
        </g>
      )}

      {item.category === 'switch' && (
        // Switch SFP+ / QSFP Ports + Activity LEDs
        <g transform={`translate(${width * 0.36}, ${height / 2 - 5})`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`sw-p-${i}`} transform={`translate(${i * 11}, 0)`}>
              <rect
                x="0"
                y="0"
                width="8"
                height="9"
                fill="#020617"
                stroke="#38bdf8"
                strokeWidth="0.6"
                rx="1"
              />
              <circle cx="4" cy="-2" r="1" fill="#22c55e" />
            </g>
          ))}
        </g>
      )}

      {item.category === 'server' && (
        // Server Drive Bays / Grille
        <g transform={`translate(${width * 0.36}, 4)`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={`bay-${i}`}
              x={i * 22}
              y="0"
              width="18"
              height={height - 8}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="0.8"
              rx="1"
            />
          ))}
        </g>
      )}

      {item.category === 'power' && (
        // PHOTOREALISTIC MODULAR RECTIFIER SYSTEM & SMARTPACK CONTROLLER
        <g transform={`translate(${width * 0.32}, 3)`}>
          {/* Subrack Housing Tray */}
          <rect
            x="0"
            y="0"
            width={width * 0.65}
            height={height - 6}
            fill="#18181b"
            stroke="#3f3f46"
            strokeWidth="0.8"
            rx="2"
          />

          {/* Modular Rectifier Units (4 slots) */}
          {Array.from({ length: 4 }).map((_, mi) => {
            const slotW = (width * 0.65 - 12) / 6;
            const sx = 4 + mi * (slotW + 2);
            return (
              <g key={`rec-slot-${mi}`} transform={`translate(${sx}, 2)`}>
                {/* Module Face */}
                <rect
                  x="0"
                  y="0"
                  width={slotW}
                  height={height - 10}
                  fill="#27272a"
                  stroke="#52525b"
                  strokeWidth="0.5"
                  rx="1"
                />
                {/* Vent slots */}
                {Array.from({ length: Math.max(2, Math.floor((height - 18) / 4)) }).map((_, vi) => (
                  <line
                    key={`v-${vi}`}
                    x1="2"
                    y1={4 + vi * 4}
                    x2={slotW - 2}
                    y2={4 + vi * 4}
                    stroke="#09090b"
                    strokeWidth="1"
                  />
                ))}
                {/* Ejector handle bar */}
                <rect x={slotW - 3} y="3" width="1.8" height={height - 16} fill="#71717a" rx="0.5" />
                {/* Run LED (Green) */}
                <circle cx="3" cy={height - 13} r="1.2" fill="#22c55e" />
                {/* Status LED (Amber) */}
                <circle cx="6" cy={height - 13} r="0.9" fill={mi === 0 ? '#f59e0b' : '#3f3f46'} />
              </g>
            );
          })}

          {/* Smartpack LCD Digital Controller Screen */}
          <g transform={`translate(${4 + 4 * ((width * 0.65 - 12) / 6 + 2)}, 2)`}>
            <rect
              x="0"
              y="0"
              width={((width * 0.65 - 12) / 6) * 1.8}
              height={height - 10}
              fill="#082f49"
              stroke="#0284c7"
              strokeWidth="0.6"
              rx="1.5"
            />
            {/* Screen Readout */}
            <rect
              x="2"
              y="2"
              width={((width * 0.65 - 12) / 6) * 1.8 - 4}
              height={(height - 10) * 0.5}
              fill="#0369a1"
            />
            <text
              x={(((width * 0.65 - 12) / 6) * 1.8) / 2}
              y={(height - 10) * 0.38}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="6"
              fontWeight="bold"
              fontFamily="monospace"
            >
              -48V DC
            </text>
            <text
              x={(((width * 0.65 - 12) / 6) * 1.8) / 2}
              y={(height - 10) * 0.8}
              textAnchor="middle"
              fill="#7dd3fc"
              fontSize="4.5"
              fontFamily="monospace"
            >
              FLOAT 53.5V
            </text>
          </g>

          {/* DC Distribution MCBs (Miniature Circuit Breakers) */}
          <g transform={`translate(${width * 0.65 - 34}, 3)`}>
            {Array.from({ length: 4 }).map((_, bi) => (
              <g key={`mcb-${bi}`} transform={`translate(${bi * 8}, 0)`}>
                <rect x="0" y="0" width="6.5" height={height - 12} fill="#18181b" stroke="#450a0a" strokeWidth="0.4" rx="1" />
                <rect x="1" y="2" width="4.5" height="4" fill="#ef4444" rx="0.5" />
                <rect x="1.5" y={height - 16} width="3.5" height="1.5" fill="#ffffff" />
              </g>
            ))}
          </g>
        </g>
      )}

      {item.category === 'battery' && (
        // DYNAMIC CUSTOM BATTERY SYSTEM WITH TERMINALS & BUSBARS
        <g transform={`translate(${width * 0.32}, 3)`}>
          <rect
            x="0"
            y="0"
            width={width * 0.65}
            height={height - 6}
            fill="#1c1917"
            stroke="#f97316"
            strokeWidth="0.8"
            rx="2"
          />
          {/* Individual Battery Cells */}
          {Array.from({ length: 4 }).map((_, ci) => {
            const cellW = (width * 0.65 - 12) / 4;
            const cx = 4 + ci * (cellW + 1);
            return (
              <g key={`batt-cell-${ci}`} transform={`translate(${cx}, 2)`}>
                {/* Cell Body */}
                <rect
                  x="0"
                  y="0"
                  width={cellW}
                  height={height - 10}
                  fill="#14532d"
                  stroke="#22c55e"
                  strokeWidth="0.5"
                  rx="1"
                />
                {/* Positive Red Terminal */}
                <rect x="2" y="2" width="3" height="3" fill="#ef4444" rx="0.5" />
                {/* Negative Blue Terminal */}
                <rect x={cellW - 5} y="2" width="3" height="3" fill="#3b82f6" rx="0.5" />
                {/* Interconnect Copper Busbar to next cell */}
                {ci < 3 && (
                  <rect x={cellW - 3} y="3" width="4" height="1.5" fill="#f59e0b" />
                )}
                <text
                  x={cellW / 2}
                  y={height / 2 + 1}
                  textAnchor="middle"
                  fill="#a7f3d0"
                  fontSize="5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  LiFePO4
                </text>
              </g>
            );
          })}
        </g>
      )}

      {item.category === 'blanking' && (
        // Solid or Perforated Airflow Pattern
        <g transform={`translate(${width * 0.38}, ${height / 2 - 2})`}>
          <line x1="0" y1="0" x2="120" y2="0" stroke="#27272a" strokeWidth="1.5" strokeDasharray="4,4" />
        </g>
      )}

      {item.category === 'cable-manager' && (
        // Brush bristles or D-Rings
        <g transform={`translate(${width * 0.38}, ${height / 2 - 3})`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`br-${i}`} x1={i * 6} y1="-3" x2={i * 6} y2="5" stroke="#3f3f46" strokeWidth="1" />
          ))}
        </g>
      )}

      {/* Equipment Model Name (subtext) if height permits */}
      {height >= 36 && (
        <text
          x="10"
          y={height - 6}
          fill="#94a3b8"
          fontSize="8"
          fontFamily="ui-monospace, monospace"
        >
          {item.name}
        </text>
      )}
    </g>
  );
}
