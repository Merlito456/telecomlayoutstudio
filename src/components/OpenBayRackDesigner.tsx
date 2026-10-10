/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CADObject, ViewportState } from '../types/cad';
import {
  RackEquipmentItem,
  RackEquipmentStencil,
  RackElevationConfig,
  RackDesignerView,
} from './rack-designer/types';
import { isSlotRangeOccupied, Rack2DElevationCanvas } from './rack-designer/Rack2DElevationCanvas';
import { RackDesignerHeader } from './rack-designer/RackDesignerHeader';
import { RackDesignerSidebar } from './rack-designer/RackDesignerSidebar';
import { RackDesignerInspector } from './rack-designer/RackDesignerInspector';
import { Rack3DPreview } from './rack-designer/Rack3DPreview';
import {
  getCabinetActualU,
  isOutdoorCabinet,
  isCabinetOrRack,
  getCabinetBrand,
} from '../utils/cabinet-u-capacity';

export interface OpenBayRackDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRack: CADObject | null;
  allObjects?: CADObject[];
  viewport?: ViewportState;
  onUpdateRack?: (updatedRack: CADObject) => void;
  onAddNewRack?: (newRack: CADObject) => void;
  onSaveAllObjects?: (allObjects: CADObject[]) => void;
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  onSelectRackId?: (id: string) => void;
}

export const OpenBayRackDesigner: React.FC<OpenBayRackDesignerProps> = ({
  isOpen,
  onClose,
  currentRack,
  allObjects = [],
  viewport,
  onUpdateRack,
  onAddNewRack,
  onSaveAllObjects,
  onAddToast,
  onSelectRackId,
}) => {
  const [viewMode, setViewMode] = useState<RackDesignerView>('front');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [activeRackObject, setActiveRackObject] = useState<CADObject | null>(currentRack);

  // Rack elevation state
  const [rackConfig, setRackConfig] = useState<RackElevationConfig>({
    id: 'rack-default',
    name: 'OPEN BAY RACK 01',
    totalU: 42,
    rackType: 'open-4post',
    widthMm: 600,
    depthMm: 800,
    heightMm: 2000,
    equipments: [],
  });

  // Filter all existing cabinets and racks on site
  const availableRacks = (allObjects || []).filter(isCabinetOrRack);

  // Load rack data from CADObject
  const loadRackObject = useCallback((target: CADObject | null) => {
    setActiveRackObject(target);
    if (target) {
      const isCab = isOutdoorCabinet(target);
      const brand = isCab ? getCabinetBrand(target) : 'Telecom';
      const uH = isCab
        ? getCabinetActualU(target)
        : (target.customProps?.uHeight ??
           target.uHeight ??
           (target.stencilId?.includes('18u') ? 18 : target.stencilId?.includes('24u') ? 24 : 42));

      const sId = (target.stencilId || target.customProps?.stencilType || '').toLowerCase();
      const rType =
        target.customProps?.rackType ??
        (isCab ? 'enclosed-cabinet' : sId.includes('2post') ? 'open-2post' : 'open-4post');

      const savedEquips =
        target.customProps?.rackEquipments ??
        (target as any).rackEquipments ??
        [];

      const initialPlacementOrientation: 'horizontal' | 'vertical' =
        target.customProps?.placementOrientation ||
        (sId.includes('fhodc-mini-odc') || (isCab && sId.includes('mini-odc')) ? 'vertical' : 'horizontal');

      setRackConfig({
        id: target.id,
        name:
          target.text ||
          target.customProps?.name ||
          (isCab
            ? `${brand.toUpperCase()} OUTDOOR CABINET`
            : sId.includes('2post')
            ? '2-POST RELAY RACK'
            : 'OPEN BAY RACK 01'),
        totalU: uH,
        rackType: rType,
        widthMm: target.customProps?.widthMm || (isCab ? 650 : 600),
        depthMm: target.customProps?.depthMm || (isCab ? 650 : 800),
        heightMm: target.customProps?.heightMm || (isCab ? 1600 : 2000),
        equipments: Array.isArray(savedEquips) ? [...savedEquips] : [],
        isCabinet: isCab,
        brand: brand,
        doorsOpen: !!(target.doorsOpen || target.customProps?.doorsOpen),
        placementOrientation: initialPlacementOrientation,
      });
      setSelectedEquipmentId(null);
    } else {
      // Create empty open bay rack
      const rackNum = String(availableRacks.length + 1).padStart(2, '0');
      setRackConfig({
        id: `rack-${Date.now()}`,
        name: `OPEN BAY RACK ${rackNum}`,
        totalU: 42,
        rackType: 'open-4post',
        widthMm: 600,
        depthMm: 800,
        heightMm: 2000,
        equipments: [],
        isCabinet: false,
        doorsOpen: false,
        placementOrientation: 'horizontal',
      });
      setSelectedEquipmentId(null);
    }
  }, [availableRacks.length]);

  // Load existing rack data when currentRack changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    loadRackObject(currentRack);
  }, [isOpen, currentRack, loadRackObject]);

  // Find selected equipment item
  const selectedItem =
    rackConfig.equipments.find((i) => i.id === selectedEquipmentId) || null;

  // Add Equipment to slot
  const handleAddEquipmentToSlot = (
    stencil: RackEquipmentStencil,
    targetUSlot: number
  ) => {
    const newItem: RackEquipmentItem = {
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: stencil.name,
      label: stencil.defaultLabel,
      uSlot: targetUSlot,
      uHeight: stencil.uHeight,
      category: stencil.category,
      depthMm: stencil.depthMm,
      color: stencil.color,
      strokeColor: stencil.strokeColor,
      ports: stencil.ports ? JSON.parse(JSON.stringify(stencil.ports)) : [],
      powerWatts: stencil.powerWatts,
      weightKg: stencil.weightKg,
    };

    setRackConfig((prev) => ({
      ...prev,
      equipments: [...prev.equipments, newItem],
    }));
    setSelectedEquipmentId(newItem.id);
    onAddToast?.('info', `Placed ${newItem.label} at U${newItem.uSlot}`);
  };

  // Quick Add from Catalog to Lowest Available Slot
  const handleQuickAddStencil = (stencil: RackEquipmentStencil) => {
    // Find lowest available contiguous slot range for stencil.uHeight
    let placedSlot: number | null = null;
    for (let s = 1; s <= rackConfig.totalU - stencil.uHeight + 1; s++) {
      if (!isSlotRangeOccupied(rackConfig.equipments, s, stencil.uHeight)) {
        placedSlot = s;
        break;
      }
    }

    if (placedSlot !== null) {
      handleAddEquipmentToSlot(stencil, placedSlot);
    } else {
      onAddToast?.(
        'warning',
        `No free contiguous ${stencil.uHeight}U slot available in this ${rackConfig.totalU}U rack.`
      );
    }
  };

  // Move Equipment to new slot
  const handleMoveEquipmentToSlot = (itemId: string, newUSlot: number) => {
    setRackConfig((prev) => ({
      ...prev,
      equipments: prev.equipments.map((i) =>
        i.id === itemId ? { ...i, uSlot: newUSlot } : i
      ),
    }));
  };

  // Update selected equipment
  const handleUpdateSelectedItem = (partial: Partial<RackEquipmentItem>) => {
    if (!selectedEquipmentId) return;
    setRackConfig((prev) => ({
      ...prev,
      equipments: prev.equipments.map((i) =>
        i.id === selectedEquipmentId ? { ...i, ...partial } : i
      ),
    }));
  };

  // Delete selected equipment
  const handleDeleteSelectedItem = () => {
    if (!selectedEquipmentId) return;
    setRackConfig((prev) => ({
      ...prev,
      equipments: prev.equipments.filter((i) => i.id !== selectedEquipmentId),
    }));
    setSelectedEquipmentId(null);
    onAddToast?.('info', 'Equipment removed from rack');
  };

  // Duplicate selected equipment
  const handleDuplicateSelectedItem = () => {
    if (!selectedItem) return;
    // Find next available slot
    let targetSlot: number | null = null;
    for (let s = selectedItem.uSlot + selectedItem.uHeight; s <= rackConfig.totalU - selectedItem.uHeight + 1; s++) {
      if (!isSlotRangeOccupied(rackConfig.equipments, s, selectedItem.uHeight)) {
        targetSlot = s;
        break;
      }
    }
    if (targetSlot === null) {
      for (let s = 1; s < selectedItem.uSlot; s++) {
        if (!isSlotRangeOccupied(rackConfig.equipments, s, selectedItem.uHeight)) {
          targetSlot = s;
          break;
        }
      }
    }

    if (targetSlot !== null) {
      // Auto-increment label suffix (e.g. SW-01 -> SW-02)
      let nextLabel = selectedItem.label;
      const numMatch = selectedItem.label.match(/(\d+)$/);
      if (numMatch) {
        const nextNum = parseInt(numMatch[1], 10) + 1;
        nextLabel = selectedItem.label.replace(
          /(\d+)$/,
          String(nextNum).padStart(numMatch[1].length, '0')
        );
      } else {
        nextLabel = `${selectedItem.label}-B`;
      }

      const duplicated: RackEquipmentItem = {
        ...selectedItem,
        id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        label: nextLabel,
        uSlot: targetSlot,
      };

      setRackConfig((prev) => ({
        ...prev,
        equipments: [...prev.equipments, duplicated],
      }));
      setSelectedEquipmentId(duplicated.id);
      onAddToast?.('success', `Duplicated ${duplicated.label} at U${targetSlot}`);
    } else {
      onAddToast?.('warning', 'No available space in rack to duplicate equipment.');
    }
  };

  // Update actual rack height (totalU and heightMm) with automatic clamp
  const handleUpdateRackHeight = (newTotalU: number, newHeightMm?: number) => {
    const validU = Math.max(6, Math.min(60, newTotalU));
    const finalHeightMm = newHeightMm || Math.round(validU * 44.45 + 130);

    setRackConfig((prev) => {
      // Clamp any equipments that exceed the new capacity
      const clampedEquipments = prev.equipments.map((eq) => {
        if (eq.uSlot + eq.uHeight - 1 > validU) {
          const clampedSlot = Math.max(1, validU - eq.uHeight + 1);
          return { ...eq, uSlot: clampedSlot };
        }
        return eq;
      });

      return {
        ...prev,
        totalU: validU,
        heightMm: finalHeightMm,
        equipments: clampedEquipments,
      };
    });
  };

  // Sync actual height across all racks on site (Address user: "they are all the same height")
  const handleSyncAllRacksHeight = (newTotalU: number, newHeightMm?: number) => {
    const validU = Math.max(6, Math.min(60, newTotalU));
    const finalHeightMm = newHeightMm || Math.round(validU * 44.45 + 130);

    handleUpdateRackHeight(validU, finalHeightMm);

    if (allObjects && allObjects.length > 0 && onSaveAllObjects) {
      const updatedAll = allObjects.map((obj) => {
        if (isCabinetOrRack(obj)) {
          const equips = (obj.customProps?.rackEquipments || (obj as any).rackEquipments || []) as RackEquipmentItem[];
          const clamped = equips.map((eq) => {
            if (eq.uSlot + eq.uHeight - 1 > validU) {
              return { ...eq, uSlot: Math.max(1, validU - eq.uHeight + 1) };
            }
            return eq;
          });
          return {
            ...obj,
            customProps: {
              ...(obj.customProps || {}),
              uHeight: validU,
              heightMm: finalHeightMm,
              rackEquipments: clamped,
            },
          };
        }
        return obj;
      });

      onSaveAllObjects(updatedAll);
      onAddToast?.('success', `Updated all ${availableRacks.length} telecom racks on site to uniform ${validU}U (${finalHeightMm}mm) height`);
    } else {
      onAddToast?.('info', `Set rack height to ${validU}U (${finalHeightMm}mm)`);
    }
  };

  // Clear all equipments
  const handleClearAllEquipments = () => {
    setRackConfig((prev) => ({ ...prev, equipments: [] }));
    setSelectedEquipmentId(null);
    onAddToast?.('info', 'Open bay rack cleared of all equipment');
  };

  // Add brand new standalone rack to CAD Site Layout
  const handleAddNewRack = () => {
    const finalHeightMm = rackConfig.heightMm || Math.round(rackConfig.totalU * 44.45 + 130);
    const is2Post = rackConfig.rackType === 'open-2post';
    const stencilId = is2Post ? 'rack-open-2post' : 'open-rack';
    const wMm = rackConfig.widthMm || 600;
    const dMm = rackConfig.depthMm || (is2Post ? 450 : 800);
    // Standard drawing scale: 20px per meter (1m = 1000mm = 20px)
    const wPx = Math.max(28, Math.round((wMm / 1000) * 20));
    const hPx = Math.max(20, Math.round((dMm / 1000) * 20));

    // Smart placement: center of current viewport, or side-by-side with existing racks
    let posX = 300;
    let posY = 300;
    if (viewport) {
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
      posX = Math.round(((screenW / 2 - viewport.panX) / viewport.zoom - wPx / 2) / 10) * 10;
      posY = Math.round(((screenH / 2 - viewport.panY) / viewport.zoom - hPx / 2) / 10) * 10;
    } else if (allObjects.length > 0) {
      const existingRacks = allObjects.filter(isCabinetOrRack);
      if (existingRacks.length > 0) {
        const last = existingRacks[existingRacks.length - 1];
        posX = last.x + (last.width || 42) + 20;
        posY = last.y;
      }
    }

    // Avoid exact stacking on top of an existing object
    const isOccupied = allObjects.some(
      (o) => Math.hypot(o.x - posX, o.y - posY) < Math.max(wPx, hPx) + 10
    );
    if (isOccupied) {
      posX += wPx + 15;
    }

    const newRackId = `rack-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newRack: CADObject = {
      id: newRackId,
      type: 'stencil-group',
      stencilId: stencilId,
      layerId: 'layer-cabinets',
      isStencil: true,
      x: posX,
      y: posY,
      width: wPx,
      height: hPx,
      stroke: '#38bdf8',
      strokeWidth: 2,
      fill: '#0f172a',
      fillEnabled: true,
      fillOpacity: 0.95,
      opacity: 1,
      text: rackConfig.name,
      doorsOpen: rackConfig.doorsOpen,
      customProps: {
        stencilType: stencilId,
        rackEquipments: [...rackConfig.equipments],
        uHeight: rackConfig.totalU,
        heightMm: finalHeightMm,
        widthMm: wMm,
        depthMm: dMm,
        rackType: rackConfig.rackType,
        totalEquipments: rackConfig.equipments.length,
        name: rackConfig.name,
        doorsOpen: rackConfig.doorsOpen,
        placementOrientation: rackConfig.placementOrientation,
        category: 'racks',
      },
      children: [
        // Base channels
        {
          id: `${newRackId}-base-l`,
          type: 'rectangle',
          x: 2,
          y: 1,
          width: 7,
          height: hPx - 2,
          stroke: '#64748b',
          strokeWidth: 1.5,
          fill: '#0f172a',
          fillEnabled: true,
          fillOpacity: 0.9,
          opacity: 1,
        },
        {
          id: `${newRackId}-base-r`,
          type: 'rectangle',
          x: wPx - 9,
          y: 1,
          width: 7,
          height: hPx - 2,
          stroke: '#64748b',
          strokeWidth: 1.5,
          fill: '#0f172a',
          fillEnabled: true,
          fillOpacity: 0.9,
          opacity: 1,
        },
        // Center uprights
        {
          id: `${newRackId}-upright-l`,
          type: 'rectangle',
          x: 3,
          y: Math.round(hPx / 2 - 3),
          width: 5,
          height: 6,
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          fill: '#0284c7',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        {
          id: `${newRackId}-upright-r`,
          type: 'rectangle',
          x: wPx - 8,
          y: Math.round(hPx / 2 - 3),
          width: 5,
          height: 6,
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          fill: '#0284c7',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
      ],
    };

    if (onAddNewRack) {
      onAddNewRack(newRack);
    } else if (onUpdateRack) {
      onUpdateRack(newRack);
    } else if (onSaveAllObjects) {
      const next = [...(allObjects || []), newRack];
      onSaveAllObjects(next);
    }

    onSelectRackId?.(newRackId);
    onAddToast?.(
      'success',
      `Added ${newRack.text} (${rackConfig.totalU}U / ${rackConfig.equipments.length} modules) to site layout`
    );
    onClose();
  };

  // Save & Apply to CAD Site Layout
  const handleSaveAndApply = () => {
    if (!activeRackObject) {
      handleAddNewRack();
      return;
    }

    const finalHeightMm = rackConfig.heightMm || Math.round(rackConfig.totalU * 44.45 + 130);
    const updatedRack: CADObject = {
      ...activeRackObject,
      text: rackConfig.name,
      doorsOpen: rackConfig.doorsOpen ?? activeRackObject.doorsOpen,
      customProps: {
        ...(activeRackObject.customProps || {}),
        rackEquipments: [...rackConfig.equipments],
        uHeight: rackConfig.totalU,
        heightMm: finalHeightMm,
        rackType: rackConfig.rackType,
        totalEquipments: rackConfig.equipments.length,
        name: rackConfig.name,
        doorsOpen: rackConfig.doorsOpen ?? activeRackObject.customProps?.doorsOpen,
        placementOrientation: rackConfig.placementOrientation,
      },
    };

    if (onUpdateRack) {
      onUpdateRack(updatedRack);
    } else if (onSaveAllObjects) {
      const exists = (allObjects || []).some((obj) => obj.id === activeRackObject.id);
      const updatedAll = exists
        ? (allObjects || []).map((obj) => (obj.id === activeRackObject.id ? updatedRack : obj))
        : [...(allObjects || []), updatedRack];
      onSaveAllObjects(updatedAll);
    }
    setActiveRackObject(updatedRack);

    onSelectRackId?.(updatedRack.id);
    onAddToast?.(
      'success',
      `Updated ${rackConfig.name} with ${rackConfig.equipments.length} equipments (${rackConfig.totalU}U / ${finalHeightMm}mm)`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      onWheel={(e) => e.stopPropagation()}
      aria-labelledby="rack-designer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="w-full h-full max-w-[1440px] max-h-[920px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with Existing Cabinets Switcher */}
        <RackDesignerHeader
          rackConfig={rackConfig}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          onSaveAndApply={handleSaveAndApply}
          onAddNewRack={handleAddNewRack}
          onClose={onClose}
          onClearRack={handleClearAllEquipments}
          onUpdateRackConfig={(partial) => setRackConfig((prev) => ({ ...prev, ...partial }))}
          onUpdateRackHeight={handleUpdateRackHeight}
          onSyncAllRacksHeight={handleSyncAllRacksHeight}
          availableRacks={availableRacks}
          activeRackId={activeRackObject?.id}
          onSelectRack={(selectedRack) => loadRackObject(selectedRack)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Stencils & Quick Indicate U */}
          <RackDesignerSidebar onQuickAddStencil={handleQuickAddStencil} />

          {/* Center Canvas: Elevation / Rear / Top / Side or 3D Preview */}
          <main className="flex-1 h-full overflow-hidden relative">
            {viewMode === '3d' ? (
              <Rack3DPreview rackConfig={rackConfig} />
            ) : (
              <Rack2DElevationCanvas
                totalU={rackConfig.totalU}
                heightMm={rackConfig.heightMm}
                rackType={rackConfig.rackType}
                rackName={rackConfig.name}
                equipments={rackConfig.equipments}
                selectedEquipmentId={selectedEquipmentId}
                onSelectEquipment={setSelectedEquipmentId}
                onAddEquipmentToSlot={handleAddEquipmentToSlot}
                onMoveEquipmentToSlot={handleMoveEquipmentToSlot}
                onDeleteEquipment={(id) => {
                  setRackConfig((prev) => ({
                    ...prev,
                    equipments: prev.equipments.filter((i) => i.id !== id),
                  }));
                  if (selectedEquipmentId === id) setSelectedEquipmentId(null);
                }}
                onDuplicateEquipment={(id) => {
                  setSelectedEquipmentId(id);
                  handleDuplicateSelectedItem();
                }}
                isCabinet={rackConfig.isCabinet}
                doorsOpen={rackConfig.doorsOpen}
                brand={rackConfig.brand}
                placementOrientation={rackConfig.placementOrientation}
                activeView={viewMode}
                onToggleOrientation={(newOrient) =>
                  setRackConfig((prev) => ({ ...prev, placementOrientation: newOrient }))
                }
                onToggleDoor={() =>
                  setRackConfig((prev) => ({ ...prev, doorsOpen: !prev.doorsOpen }))
                }
              />
            )}
          </main>

          {/* Right Inspector: Properties & Global Settings */}
          <RackDesignerInspector
            rackConfig={rackConfig}
            onUpdateRackConfig={(partial) =>
              setRackConfig((prev) => ({ ...prev, ...partial }))
            }
            onUpdateRackHeight={handleUpdateRackHeight}
            onSyncAllRacksHeight={handleSyncAllRacksHeight}
            selectedItem={selectedItem}
            onUpdateSelectedItem={handleUpdateSelectedItem}
            onDeleteSelectedItem={handleDeleteSelectedItem}
            onDuplicateSelectedItem={handleDuplicateSelectedItem}
            onClearAllEquipments={handleClearAllEquipments}
          />
        </div>
      </div>
    </div>
  );
};
