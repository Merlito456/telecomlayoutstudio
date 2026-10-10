import React, { useState } from "react";
import { CADObject } from "../../types/cad";
import {
  Box,
  Server,
  Layers,
  Trash2,
  ArrowUpRight,
  DoorOpen,
  DoorClosed,
  Plus,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  X,
  Sliders,
  Zap,
  Battery,
  Radio,
  Network,
  Cpu,
  Copy,
  Columns,
  Rows,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EQUIPMENT_STENCILS } from "../rack-designer/equipment-catalog";
import { isSlotRangeOccupied } from "../rack-designer/Rack2DElevationCanvas";
import { RackEquipmentItem, RackEquipmentStencil } from "../rack-designer/types";
import {
  getCabinetActualU,
  isOutdoorCabinet,
  getCabinetBrand,
  getCabinetDisplayName,
} from "../../utils/cabinet-u-capacity";

interface CabinetCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  onOpenRackDesigner?: (cabinetObj?: CADObject) => void;
}

export const CabinetCustomizer: React.FC<CabinetCustomizerProps> = ({
  primary,
  onUpdateSelected,
  onOpenRackDesigner,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState<string>("");

  const isCabinet = isOutdoorCabinet(primary);
  if (!isCabinet) return null;

  const sId = (primary.stencilId || primary.customProps?.stencilType || '').toLowerCase();
  const isOpen = !!(primary.doorsOpen || primary.customProps?.doorsOpen || primary.customProps?.isClosed === false);

  const customRatio = primary.customProps?.heightRatio !== undefined
    ? Number(primary.customProps.heightRatio)
    : undefined;
  const customBayType = primary.customProps?.bayType;

  const isEnc6130 = sId.includes('enc6130') || customBayType === 'enc6130';
  const isEnc6150 = sId.includes('enc6150') || customBayType === 'enc6150';
  const isMini = customRatio === 0.35 || customBayType === 'mini-odc' || (!customRatio && (sId.includes('mini-odc') || sId.includes('mini')));
  const isOdc = customRatio === 0.4 || customBayType === 'odc' || (!customRatio && !isMini && sId.includes('odc'));
  const isBay = !isMini && !isOdc && !isEnc6130;

  const totalU = getCabinetActualU(primary);

  const isFHMiniODC = sId.includes('fhodc-mini-odc') || (sId.includes('fhodc') && sId.includes('mini'));
  const placementOrientation: 'horizontal' | 'vertical' =
    primary.customProps?.placementOrientation || (isFHMiniODC ? 'vertical' : 'horizontal');
  const isVertical = placementOrientation === 'vertical';

  const handleSetOrientation = (orient: 'horizontal' | 'vertical') => {
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          placementOrientation: orient,
        },
      },
      true
    );
  };

  const equips = (primary.customProps?.rackEquipments || primary.rackEquipments || []) as RackEquipmentItem[];
  const usedU = equips.reduce((acc, eq) => acc + (eq.uHeight || 1), 0);
  const freeU = Math.max(0, totalU - usedU);

  const handleToggleDoor = () => {
    const nextOpen = !isOpen;
    let nextText = primary.text;
    if (nextText) {
      if (nextOpen) nextText = nextText.replace(/\(CLOSED\)/gi, '(OPEN)');
      else nextText = nextText.replace(/\(OPEN\)/gi, '(CLOSED)');
    }
    onUpdateSelected(
      {
        doorsOpen: nextOpen,
        text: nextText,
        customProps: {
          ...(primary.customProps || {}),
          doorsOpen: nextOpen,
          isClosed: !nextOpen,
        },
      },
      true
    );
  };

  const handleAddEquipment = (stencil: RackEquipmentStencil) => {
    let targetSlot: number | null = null;
    for (let s = 1; s <= totalU - stencil.uHeight + 1; s++) {
      if (!isSlotRangeOccupied(equips, s, stencil.uHeight)) {
        targetSlot = s;
        break;
      }
    }

    if (targetSlot === null) return;

    const newItem: RackEquipmentItem = {
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: stencil.name,
      label: stencil.defaultLabel,
      uSlot: targetSlot,
      uHeight: stencil.uHeight,
      category: stencil.category,
      depthMm: stencil.depthMm,
      color: stencil.color,
      strokeColor: stencil.strokeColor,
      ports: stencil.ports ? JSON.parse(JSON.stringify(stencil.ports)) : [],
      powerWatts: stencil.powerWatts,
      weightKg: stencil.weightKg,
    };

    const nextEquips = [...equips, newItem];
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          rackEquipments: nextEquips,
          totalEquipments: nextEquips.length,
        },
      },
      true
    );
  };

  const handleDeleteEquipment = (id: string) => {
    const nextEquips = equips.filter((eq) => eq.id !== id);
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          rackEquipments: nextEquips,
          totalEquipments: nextEquips.length,
        },
      },
      true
    );
    if (editingItemId === id) setEditingItemId(null);
  };

  const handleMoveSlot = (id: string, delta: number) => {
    const item = equips.find((eq) => eq.id === id);
    if (!item) return;

    const newSlot = item.uSlot + delta;
    if (newSlot < 1 || newSlot > totalU - item.uHeight + 1) return;

    if (isSlotRangeOccupied(equips, newSlot, item.uHeight, item.id)) return;

    const nextEquips = equips.map((eq) => (eq.id === id ? { ...eq, uSlot: newSlot } : eq));
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          rackEquipments: nextEquips,
        },
      },
      true
    );
  };

  const handleCommitRename = (id: string) => {
    if (!tempLabel.trim()) {
      setEditingItemId(null);
      return;
    }
    const nextEquips = equips.map((eq) => (eq.id === id ? { ...eq, label: tempLabel.trim() } : eq));
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          rackEquipments: nextEquips,
        },
      },
      true
    );
    setEditingItemId(null);
  };

  const handleDuplicateEquipment = (id: string) => {
    const item = equips.find((eq) => eq.id === id);
    if (!item) return;

    let targetSlot: number | null = null;
    for (let s = item.uSlot + item.uHeight; s <= totalU - item.uHeight + 1; s++) {
      if (!isSlotRangeOccupied(equips, s, item.uHeight)) {
        targetSlot = s;
        break;
      }
    }
    if (targetSlot === null) {
      for (let s = 1; s < item.uSlot; s++) {
        if (!isSlotRangeOccupied(equips, s, item.uHeight)) {
          targetSlot = s;
          break;
        }
      }
    }
    if (targetSlot === null) return;

    const duplicated: RackEquipmentItem = {
      ...item,
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: `${item.label}-B`,
      uSlot: targetSlot,
    };
    const nextEquips = [...equips, duplicated];
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          rackEquipments: nextEquips,
          totalEquipments: nextEquips.length,
        },
      },
      true
    );
  };

  const handleUpdateTotalU = (newTotalU: number) => {
    onUpdateSelected(
      {
        customProps: {
          ...(primary.customProps || {}),
          uHeight: newTotalU,
        },
      },
      true
    );
  };

  const ratioLabel = isEnc6150
    ? 'Ericsson ENC6150'
    : isEnc6130
    ? 'Ericsson ENC6130'
    : isMini
    ? '3.5 / 10 of 1-Bay'
    : isOdc
    ? '4 / 10 of 1-Bay'
    : '1-Bay = 2-Bay (Equal Height)';

  const scaleFactorStr = isEnc6150
    ? '1.00× (ENC6150 Multi-Purpose Macro)'
    : isEnc6130
    ? '0.75× (ENC6130 Compact Outdoor)'
    : isMini
    ? '0.35× (3.5 / 10 of 1-Bay)'
    : isOdc
    ? '0.40× (4 / 10 of 1-Bay)'
    : '1.00× (1-Bay = 2-Bay Equal Height)';

  const categoryStr = isEnc6150
    ? 'Ericsson Enclosure 6150 Outdoor Cabinet'
    : isEnc6130
    ? 'Ericsson Enclosure 6130 Compact Outdoor'
    : isMini
    ? 'Mini ODC Compact Enclosure (3.5 of 1-Bay)'
    : isOdc
    ? 'ODC Outdoor Cabinet (4/10 of 1-Bay)'
    : '1-Bay = 2-Bay Full Height Standard';

  const physHStr = isEnc6150
    ? '~1.60m (14.0 units, 1.00×)'
    : isEnc6130
    ? '~1.10m (10.5 units, 0.75×)'
    : isMini
    ? '~0.63m (4.9 units, 0.35×)'
    : isOdc
    ? '~0.72m (5.6 units, 0.40×)'
    : '~1.80m (14.0 units, 1.00×)';

  const handleSetHeightCategory = (type: '1bay' | 'odc' | 'mini-odc') => {
    const ratio = type === 'mini-odc' ? 0.35 : type === 'odc' ? 0.40 : 1.0;
    const nextTotalU = type === 'mini-odc' ? 12 : type === 'odc' ? 18 : 36;
    const nextOrient =
      type === 'mini-odc' && (sId.includes('fhodc') || sId.includes('fh'))
        ? 'vertical'
        : (primary.customProps?.placementOrientation || 'horizontal');
    onUpdateSelected({
      customProps: {
        ...(primary.customProps || {}),
        bayType: type,
        heightRatio: ratio,
        uHeight: nextTotalU,
        placementOrientation: nextOrient,
      },
    });
  };

  const filteredStencils = EQUIPMENT_STENCILS.filter((st) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'power') return st.category === 'power';
    if (filterCategory === 'bbu') return st.category === 'bbu';
    if (filterCategory === 'fiber') return st.category === 'fiber-shelf' || st.category === 'patch-panel';
    if (filterCategory === 'network') return st.category === 'router' || st.category === 'switch' || st.category === 'server';
    if (filterCategory === 'battery') return st.category === 'battery';
    return true;
  });

  const sortedEquips = [...equips].sort((a, b) => (b.uSlot || 1) - (a.uSlot || 1));

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3 shadow-md shadow-slate-950/40 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5 text-sky-400" />
          Cabinet Specifications
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
          {ratioLabel}
        </span>
      </div>

      {/* 1. Interactive Door Status & Toggle [Key Z] */}
      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-semibold text-slate-300 flex items-center gap-1.5">
            {isOpen ? <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> : <DoorClosed className="w-3.5 h-3.5 text-amber-400" />}
            Cabinet Door Status:
          </span>
          <span
            className={`text-[9.5px] px-2 py-0.5 rounded font-mono font-bold border ${
              isOpen
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-sm'
                : 'bg-amber-950/90 text-amber-300 border-amber-600/60'
            }`}
          >
            {isOpen ? 'DOORS OPEN' : 'DOORS CLOSED'}
          </span>
        </div>

        <button
          onClick={handleToggleDoor}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-950/50'
          }`}
        >
          {isOpen ? <DoorClosed className="w-4 h-4 text-amber-400" /> : <DoorOpen className="w-4 h-4" />}
          <span>{isOpen ? 'Close Cabinet Door [Key Z]' : 'Open Cabinet Door [Key Z]'}</span>
        </button>
        <p className="text-[9.5px] text-slate-400">
          Opening reveals internal 19" open-bay rack &amp; installed equipment chassis in 2D &amp; 3D walkthrough.
        </p>
      </div>

      {/* 2. Equipment Placement Orientation (Vertical Subrack vs Horizontal EIA) */}
      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-semibold text-slate-300 flex items-center gap-1.5">
            {isVertical ? <Columns className="w-3.5 h-3.5 text-amber-400" /> : <Rows className="w-3.5 h-3.5 text-sky-400" />}
            Equipment Mounting Orientation:
          </span>
          <span
            className={`text-[9.5px] px-2 py-0.5 rounded font-mono font-bold border ${
              isVertical
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-sm'
                : 'bg-sky-950/90 text-sky-300 border-sky-600/60'
            }`}
          >
            {isVertical ? 'VERTICAL SUBRACK' : 'HORIZONTAL EIA'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleSetOrientation('vertical')}
            className={`py-1.5 px-2 rounded-lg font-semibold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isVertical
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Vertical Subrack</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetOrientation('horizontal')}
            className={`py-1.5 px-2 rounded-lg font-semibold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isVertical
                ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Rows className="w-3.5 h-3.5" />
            <span>Horizontal EIA</span>
          </button>
        </div>

        {isFHMiniODC && (
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9.5px] text-amber-300/90 leading-tight">
            <strong>FH Mini ODC:</strong> Optical distribution cassettes and units mount vertically side-by-side in subrack slots (V1–V{totalU}).
          </div>
        )}
      </div>

      {/* 3. Interactive Equipment Bay & Management */}
      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-2.5 text-[11px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-semibold text-sky-300 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            Outdoor Cabinet Equipments
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 font-bold">
            {totalU} {isVertical ? 'Slots' : 'U'} Frame
          </span>
        </div>

        {/* Capacity Overview & Utilization Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10.5px]">
            <span>Installed Modules:</span>
            <span className="font-mono font-bold text-emerald-400">
              {equips.length} Modules ({usedU}U / {totalU}U)
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[10.5px]">
            <span>Available Capacity:</span>
            <span className="font-mono text-sky-400 font-bold">{freeU}U Free</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.round((usedU / totalU) * 100))}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                usedU >= totalU ? 'bg-rose-500' : usedU > totalU * 0.75 ? 'bg-amber-400' : 'bg-sky-500'
              }`}
            />
          </div>
        </div>

        {/* Quick Capacity U Switcher */}
        <div className="flex items-center gap-1 pt-0.5">
          <span className="text-[9.5px] text-slate-400">Capacity:</span>
          {[12, 18, 24, 36, 42].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => handleUpdateTotalU(u)}
              className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border transition-colors cursor-pointer ${
                totalU === u
                  ? 'bg-sky-600 text-white border-sky-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {u}U
            </button>
          ))}
        </div>

        {/* Installed Equipments List */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Installed Modules ({equips.length})
            </span>
            <span className="text-[9px] text-slate-500">19" Rack Mounted</span>
          </div>

          {equips.length === 0 ? (
            <div className="p-3 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-lg space-y-1">
              <span className="text-[10.5px] text-slate-400 block font-medium">
                Empty 19" Open Bay Rack
              </span>
              <span className="text-[9.5px] text-slate-500 block">
                No chassis installed inside this cabinet. Add equipment below or launch visual designer.
              </span>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {sortedEquips.map((eq) => {
                const isEditing = editingItemId === eq.id;
                return (
                  <div
                    key={eq.id}
                    className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-1 hover:border-slate-700 transition-colors"
                  >
                    {/* Color dot & Slot Pill */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: eq.color || '#38bdf8' }}
                      />
                      <span className={`px-1 py-0.5 rounded font-mono text-[9px] font-bold border shrink-0 ${
                        isVertical
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : 'bg-slate-800 text-sky-300 border-slate-700'
                      }`}>
                        {isVertical ? `V${eq.uSlot} (${eq.uHeight}S)` : `U${eq.uSlot} (${eq.uHeight}U)`}
                      </span>

                      {/* Label / Name */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={tempLabel}
                            onChange={(e) => setTempLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommitRename(eq.id);
                              if (e.key === 'Escape') setEditingItemId(null);
                            }}
                            autoFocus
                            className="w-full bg-slate-950 border border-sky-400 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCommitRename(eq.id)}
                            className="p-0.5 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="p-0.5 text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="truncate flex-1">
                          <span className="font-semibold text-slate-200 truncate block text-[10.5px]">
                            {eq.label}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate block">
                            {eq.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Move Up/Left, Move Down/Right, Rename, Delete */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        {isVertical ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMoveSlot(eq.id, -1)}
                              disabled={eq.uSlot <= 1}
                              title="Move Left 1 Slot"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlot(eq.id, 1)}
                              disabled={eq.uSlot + eq.uHeight > totalU}
                              title="Move Right 1 Slot"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMoveSlot(eq.id, 1)}
                              disabled={eq.uSlot + eq.uHeight > totalU}
                              title="Move Up 1U"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlot(eq.id, -1)}
                              disabled={eq.uSlot <= 1}
                              title="Move Down 1U"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemId(eq.id);
                            setTempLabel(eq.label);
                          }}
                          title="Edit Label"
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-300 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateEquipment(eq.id)}
                          title="Duplicate Equipment"
                          className="p-1 rounded hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEquipment(eq.id)}
                          title="Delete from Cabinet"
                          className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add Equipment Dropdown / Picker */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="w-full flex items-center justify-between p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[10.5px] font-semibold cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5 text-sky-400">
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Equipment to Cabinet</span>
            </span>
            <span className="text-[9.5px] text-slate-500 font-mono">
              {isAddMenuOpen ? 'Hide Catalog ▲' : 'Open Catalog ▼'}
            </span>
          </button>

          {isAddMenuOpen && (
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in duration-150">
              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'power', label: 'Power/Rect' },
                  { id: 'bbu', label: 'BBU/Radio' },
                  { id: 'fiber', label: 'Fiber/ODF' },
                  { id: 'network', label: 'Routers' },
                  { id: 'battery', label: 'Batteries' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors cursor-pointer border ${
                      filterCategory === cat.id
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Equipment Items Grid */}
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredStencils.map((stencil) => {
                  const hasSpace = !isSlotRangeOccupied(
                    equips,
                    1,
                    stencil.uHeight
                  ) || freeU >= stencil.uHeight;

                  return (
                    <div
                      key={stencil.id}
                      className="p-1.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-1 hover:border-sky-500/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="px-1 py-0.2 rounded bg-slate-800 text-[8.5px] font-mono text-amber-300 font-bold border border-slate-700">
                            {stencil.uHeight}U
                          </span>
                          <span className="font-semibold text-slate-200 text-[10px] truncate block">
                            {stencil.name}
                          </span>
                        </div>
                        <span className="text-[8.5px] text-slate-500 truncate block">
                          {stencil.desc || stencil.defaultLabel}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddEquipment(stencil)}
                        disabled={!hasSpace}
                        className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-semibold text-[9.5px] cursor-pointer shrink-0 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Launch Full Visual Equipment Designer Button */}
        {onOpenRackDesigner && (
          <button
            type="button"
            onClick={() => onOpenRackDesigner(primary)}
            className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-950/50 transition-all cursor-pointer border border-sky-400/40"
          >
            <Layers className="w-4 h-4 text-sky-200" />
            <span>Open Visual Cabinet Designer (2D &amp; 3D)</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
          </button>
        )}

        {/* Clear Equipment Button */}
        {equips.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onUpdateSelected(
                {
                  customProps: {
                    ...(primary.customProps || {}),
                    rackEquipments: [],
                    totalEquipments: 0,
                  },
                },
                true
              );
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors text-[10px] cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Clear All Equipment ({equips.length})</span>
          </button>
        )}
      </div>

      {/* 3. Height Specification Details */}
      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
        <div className="flex justify-between items-center text-slate-300">
          <span>Relative Height Scale:</span>
          <span className="font-mono font-bold text-amber-300">
            {scaleFactorStr}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Height Category:</span>
          <span className="text-slate-200 font-medium">
            {categoryStr}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>3D Physical Height:</span>
          <span className="font-mono text-slate-200">
            {physHStr}
          </span>
        </div>
      </div>

      {/* Quick Height Ratio Preset Buttons */}
      <div className="space-y-1 pt-0.5">
        <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
          Set Cabinet Height Ratio:
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => handleSetHeightCategory('1bay')}
            className={`py-1.5 px-1.5 text-[9.5px] rounded cursor-pointer transition-all font-semibold border ${
              isBay
                ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            1-Bay = 2-Bay (1.0×)
          </button>
          <button
            type="button"
            onClick={() => handleSetHeightCategory('odc')}
            className={`py-1.5 px-1.5 text-[9.5px] rounded cursor-pointer transition-all font-semibold border ${
              isOdc
                ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            ODC (4/10)
          </button>
          <button
            type="button"
            onClick={() => handleSetHeightCategory('mini-odc')}
            className={`py-1.5 px-1.5 text-[9.5px] rounded cursor-pointer transition-all font-semibold border ${
              isMini
                ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Mini ODC (3.5/10)
          </button>
        </div>
      </div>
    </div>
  );
};


