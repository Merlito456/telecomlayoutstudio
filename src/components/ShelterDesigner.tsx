/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CADObject } from '../types/cad';
import {
  InteriorEquipmentItem,
  INTERIOR_STENCILS,
  Shelter2DCanvas,
  Shelter3DPreview,
  Shelter3DCameraState,
} from './shelter-designer';
import { ShelterDesignerHeader } from './shelter-designer/ShelterDesignerHeader';
import { ShelterDesignerSidebar } from './shelter-designer/ShelterDesignerSidebar';
import { ShelterDesignerInspector } from './shelter-designer/ShelterDesignerInspector';
import { AddWallMountACModal } from './shelter-designer/AddWallMountACModal';

interface ShelterDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  currentShelter: CADObject | null;
  allObjects: CADObject[];
  onUpdateShelter: (updatedShelter: CADObject) => void;
  onSaveAllObjects?: (updatedObjects: CADObject[]) => void;
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const ShelterDesigner: React.FC<ShelterDesignerProps> = ({
  isOpen,
  onClose,
  currentShelter,
  allObjects,
  onUpdateShelter,
  onSaveAllObjects,
  onAddToast,
}) => {
  if (!isOpen) return null;

  // Shelter Room Parameters (in mm and meters)
  const [roomLengthMm, setRoomLengthMm] = useState<number>(3600); // X axis length
  const [roomWidthMm, setRoomWidthMm] = useState<number>(3000); // Y axis depth
  const [shelterHeightM, setShelterHeightM] = useState<number>(3.0); // Z axis wall & ceiling height (meters)
  const [wallThickMm] = useState<number>(150); // 150mm wall thickness
  const [doorWall, setDoorWall] = useState<'south' | 'north' | 'east' | 'west'>('south');
  const [doorOffsetPct, setDoorOffsetPct] = useState<number>(35);
  const [doorWidthMm, setDoorWidthMm] = useState<number>(900);
  const [cableWall, setCableWall] = useState<'north' | 'south' | 'east' | 'west' | 'none'>('east');
  const [cableOffsetPct, setCableOffsetPct] = useState<number>(50);
  const [cableHoleDiameterMm, setCableHoleDiameterMm] = useState<number>(250);
  const [cableHoleElevationMm, setCableHoleElevationMm] = useState<number>(() => {
    const raw =
      currentShelter?.cableHoleElevationMm ??
      currentShelter?.feederElevationMm ??
      currentShelter?.customProps?.cableHoleElevationMm ??
      currentShelter?.customProps?.feederElevationMm;
    return typeof raw === 'number' && raw > 0
      ? raw
      : Math.round(shelterHeightM * 1000 - 350);
  });
  const [airconWall] = useState<'north' | 'south' | 'east' | 'west' | 'none'>('none');
  const [airconOffsetPct] = useState<number>(50);

  // Interior Equipment Items Placed
  const [items, setItems] = useState<InteriorEquipmentItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pendingACStencil, setPendingACStencil] = useState<(typeof INTERIOR_STENCILS)[0] | null>(null);
  const [activeOpening, setActiveOpening] = useState<'door' | 'feeder' | null>(null);

  // View Mode: '2d' (drafting floor plan) or '3d' (walkthrough preview)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  // Visual Mode: 'photo' (photorealistic) or 'cad' (engineering blueprint)
  const [renderStyle, setRenderStyle] = useState<'photo' | 'cad'>('photo');
  // Roof Visuals: 'cutaway' (interior visible, default), 'transparent' (glass), 'solid'
  const [roofMode, setRoofMode] = useState<'cutaway' | 'transparent' | 'solid'>('cutaway');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'rack' | 'cooling' | 'power' | 'ladder' | 'safety' | 'rectifier'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gridSnapMm, setGridSnapMm] = useState<number>(50);

  // Persistent 3D viewing angle and distance so editing never restarts the view
  const cameraStateRef = useRef<Shelter3DCameraState>({
    angleX: 0.5,
    angleY: 0.6,
    distance: 0,
    panX: 0,
    panY: 0,
    panZ: 0,
    isInitialized: false,
  });

  // Initialize from currentShelter if provided
  useEffect(() => {
    if (currentShelter) {
      const wMm = Math.round(((currentShelter.width || 180) / 20) * 1000);
      const dMm = Math.round(((currentShelter.height || 140) / 20) * 1000);
      setRoomLengthMm(Math.max(2000, wMm));
      setRoomWidthMm(Math.max(1800, dMm));

      const hM = currentShelter.shelterHeightM || currentShelter.customProps?.shelterHeightM || 3.0;
      setShelterHeightM(Math.max(2.0, Math.min(5.0, Number(hM))));

      if (currentShelter.customProps?.doorWall) setDoorWall(currentShelter.customProps.doorWall);
      if (currentShelter.customProps?.doorOffset !== undefined) {
        setDoorOffsetPct(Number(currentShelter.customProps.doorOffset));
      }
      if (currentShelter.customProps?.doorWidthMm !== undefined) {
        setDoorWidthMm(Number(currentShelter.customProps.doorWidthMm));
      } else if (currentShelter.customProps?.doorDiameter !== undefined) {
        setDoorWidthMm(Number(currentShelter.customProps.doorDiameter));
      }
      if (currentShelter.customProps?.cableHoleWall) {
        setCableWall(currentShelter.customProps.cableHoleWall);
      }
      if (currentShelter.customProps?.cableHoleOffset !== undefined) {
        setCableOffsetPct(Number(currentShelter.customProps.cableHoleOffset));
      }
      const existingFeederDia =
        currentShelter.cableHoleDiameterMm ??
        currentShelter.feederDiameter ??
        currentShelter.customProps?.cableHoleDiameterMm ??
        currentShelter.customProps?.cableHoleDiameter ??
        currentShelter.customProps?.feederDiameter ??
        250;
      setCableHoleDiameterMm(Number(existingFeederDia));

      const existingFeederElev =
        currentShelter.cableHoleElevationMm ??
        currentShelter.feederElevationMm ??
        currentShelter.customProps?.cableHoleElevationMm ??
        currentShelter.customProps?.feederElevationMm ??
        Math.round((currentShelter.shelterHeightM || currentShelter.customProps?.shelterHeightM || 2.8) * 1000 - 350);
      setCableHoleElevationMm(Number(existingFeederElev));

      if (currentShelter.customProps?.roofMode || (currentShelter as any).roofMode) {
        setRoofMode(currentShelter.customProps?.roofMode || (currentShelter as any).roofMode);
      }
      if (currentShelter.customProps?.renderStyle || (currentShelter as any).renderStyle) {
        setRenderStyle(currentShelter.customProps?.renderStyle || (currentShelter as any).renderStyle);
      }

      // Load existing interior items if saved
      const savedInterior = currentShelter.interiorObjects || currentShelter.customProps?.interiorObjects;
      if (Array.isArray(savedInterior) && savedInterior.length > 0) {
        const loaded: InteriorEquipmentItem[] = savedInterior.map((raw: any) => {
          const cat = raw.category || raw.customProps?.category || 'rack';
          const rawId = String(raw.stencilId || raw.customProps?.stencilType || raw.type || '').toLowerCase();
          const rawName = String(raw.name || raw.text || '').toLowerCase();
          const isLadder =
            cat === 'ladder' ||
            raw.ladderType === 'indoor' ||
            raw.customProps?.ladderType === 'indoor' ||
            rawId.includes('ladder') ||
            rawId.includes('raceway') ||
            rawId.includes('runway') ||
            rawName.includes('ladder') ||
            rawName.includes('raceway');
          const isItemAC =
            cat === 'cooling' ||
            rawId.includes('ac') ||
            rawId.includes('split') ||
            rawName.includes('ac') ||
            rawName.includes('air conditioner');
          return {
            id: raw.id || `eq-${Date.now()}-${Math.random()}`,
            name: raw.name || raw.text || (isLadder ? 'In-Shelter Cable Ladder' : isItemAC ? 'Wall-Mount Inverter AC (High-Wall Unit)' : 'Equipment Rack'),
            category: isLadder ? 'ladder' : isItemAC ? 'cooling' : cat,
            stencilId: raw.stencilId || raw.customProps?.stencilType || (isLadder ? 'indoor-ladder' : isItemAC ? 'wall-mount-ac' : 'rack-telecom-600x600'),
            widthMm: raw.widthMm ?? raw.customProps?.widthMm ?? (isLadder ? 2400 : isItemAC ? 1000 : 600),
            depthMm: raw.depthMm ?? raw.customProps?.depthMm ?? (isLadder ? 450 : isItemAC ? 280 : 600),
            heightMm: raw.heightMm ?? raw.customProps?.heightMm ?? (isLadder ? 80 : isItemAC ? 360 : 2000),
            uHeight: raw.uHeight ?? raw.customProps?.uHeight,
            color: raw.color || raw.fill || (isLadder ? '#ca8a04' : isItemAC ? '#f8fafc' : '#0f172a'),
            strokeColor: raw.strokeColor || raw.stroke || (isLadder ? '#facc15' : isItemAC ? '#0284c7' : '#38bdf8'),
            xMm: raw.xMm ?? raw.x ?? raw.localX ?? 300,
            yMm: raw.yMm ?? raw.y ?? raw.localZ ?? 300,
            rotationDeg: raw.rotationDeg ?? raw.rotation ?? 0,
            elevationMm: isLadder
              ? Math.round((Number(hM) - 0.09) * 1000)
              : (raw.elevationMm ?? raw.customProps?.elevationMm ?? (isItemAC ? 2200 : 0)),
            wallAttachment: raw.wallAttachment ?? raw.customProps?.wallAttachment ?? (isItemAC ? 'north' : undefined),
            wallOffsetPct: raw.wallOffsetPct ?? raw.customProps?.wallOffsetPct ?? (isItemAC ? 50 : undefined),
            coolingCapacity: raw.coolingCapacity ?? raw.customProps?.coolingCapacity ?? (isItemAC ? '2.5 HP (24,000 BTU)' : undefined),
            targetTempC: raw.targetTempC ?? raw.customProps?.targetTempC ?? (isItemAC ? 20 : undefined),
            desc: raw.desc || raw.customProps?.desc,
          };
        });
        setItems(loaded);
      } else {
        // Shelter starts completely empty by default unless equipment is added by the user
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [currentShelter]);

  // Keep overhead cable ladders suspended 3.5 inches (90mm / 0.09m) below ceiling when shelterHeightM changes
  useEffect(() => {
    const targetLadderElevMm = Math.round((shelterHeightM - 0.09) * 1000);
    setItems((prev) =>
      prev.map((itm) =>
        itm.category === 'ladder' ? { ...itm, elevationMm: targetLadderElevMm } : itm
      )
    );
  }, [shelterHeightM]);

  // Filtered stencils
  const filteredStencils = INTERIOR_STENCILS.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sId = s.stencilId.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sDesc = (s.desc || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const isLadderQuery = q.includes('ladder') || q.includes('inshelter') || q.includes('indoor');
      return (
        sName.includes(q) ||
        sId.includes(q) ||
        sDesc.includes(q) ||
        (isLadderQuery && s.category === 'ladder')
      );
    }
    return true;
  });

  // Add Item to floor plan
  const handleAddItem = (stencil: (typeof INTERIOR_STENCILS)[0]) => {
    const isAC =
      stencil.category === 'cooling' ||
      stencil.stencilId.includes('ac') ||
      stencil.stencilId.includes('split');

    // For AC units: open dedicated Placement & Height modal so user sets location and height upfront!
    if (isAC) {
      setPendingACStencil(stencil);
      return;
    }

    const offsetCount = items.filter((i) => i.category === stencil.category).length;

    let defaultX = 0;
    let defaultY = 0;
    let defaultRot = 0;

    if (stencil.category === 'ladder') {
      defaultX = Math.min(
        Math.max(100, roomLengthMm - stencil.widthMm - 100),
        Math.round(roomLengthMm / 2 - stencil.widthMm / 2)
      );
      defaultY = Math.round(roomWidthMm * 0.42);
    } else {
      defaultX = Math.min(
        Math.max(100, roomLengthMm - stencil.widthMm - 100),
        Math.round(roomLengthMm / 2 - stencil.widthMm / 2 + (offsetCount % 3) * 150 - 150)
      );
      defaultY = Math.min(
        Math.max(100, roomWidthMm - stencil.depthMm - 100),
        Math.round(roomWidthMm * 0.25 + Math.floor(offsetCount / 3) * 200)
      );
    }

    const computedElevationMm =
      stencil.category === 'ladder'
        ? Math.round((shelterHeightM - 0.09) * 1000)
        : (stencil.elevationMm ?? 0);

    const newItem: InteriorEquipmentItem = {
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: stencil.name,
      category: stencil.category,
      stencilId: stencil.stencilId,
      widthMm: stencil.widthMm,
      depthMm: stencil.depthMm,
      heightMm: stencil.heightMm,
      uHeight: stencil.uHeight,
      color: stencil.color,
      strokeColor: stencil.strokeColor,
      xMm: defaultX,
      yMm: defaultY,
      rotationDeg: defaultRot,
      elevationMm: computedElevationMm,
      desc: stencil.desc,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    onAddToast?.('info', `Added ${stencil.name} to shelter design`);
  };

  // Confirm adding Wall-Mount AC with chosen wall placement and height
  const handleConfirmAddAC = (config: {
    wall: 'north' | 'south' | 'east' | 'west';
    offsetPct: number;
    elevationMm: number;
    coolingCapacity: string;
    targetTempC: number;
  }) => {
    if (!pendingACStencil) return;
    const stencil = pendingACStencil;
    const wMm = roomLengthMm;
    const dMm = roomWidthMm;
    const acW = stencil.widthMm;
    const acD = stencil.depthMm;

    let newX = 0;
    let newY = 0;
    let newRot = 0;

    const wallSpan =
      config.wall === 'north' || config.wall === 'south'
        ? Math.max(0, wMm - acW)
        : Math.max(0, dMm - acW);
    const pos = Math.round(wallSpan * (config.offsetPct / 100));

    if (config.wall === 'north') {
      newRot = 0;
      newX = pos;
      newY = 0;
    } else if (config.wall === 'south') {
      newRot = 180;
      newX = pos;
      newY = Math.max(0, dMm - acD);
    } else if (config.wall === 'west') {
      newRot = 270;
      newX = Math.round(acD / 2 - acW / 2);
      newY = pos + Math.round(acW / 2 - acD / 2);
    } else if (config.wall === 'east') {
      newRot = 90;
      newX = Math.round(wMm - acD / 2 - acW / 2);
      newY = pos + Math.round(acW / 2 - acD / 2);
    }

    const newItem: InteriorEquipmentItem = {
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: stencil.name,
      category: 'cooling',
      stencilId: stencil.stencilId,
      widthMm: stencil.widthMm,
      depthMm: stencil.depthMm,
      heightMm: stencil.heightMm,
      color: stencil.color,
      strokeColor: stencil.strokeColor,
      xMm: newX,
      yMm: newY,
      rotationDeg: newRot,
      elevationMm: config.elevationMm,
      wallAttachment: config.wall,
      wallOffsetPct: config.offsetPct,
      coolingCapacity: config.coolingCapacity,
      targetTempC: config.targetTempC,
      desc: stencil.desc,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    setPendingACStencil(null);
    onAddToast?.(
      'success',
      `Added ${stencil.name} (Mounted to ${config.wall.toUpperCase()} Wall at +${(config.elevationMm / 1000).toFixed(2)}m)`
    );
  };


  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedItemId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedItemId));
    setSelectedItemId(null);
    onAddToast?.('info', 'Equipment item removed');
  };

  // Duplicate selected item
  const handleDuplicateSelected = () => {
    if (!selectedItemId) return;
    const itm = items.find((i) => i.id === selectedItemId);
    if (!itm) return;
    const duplicated: InteriorEquipmentItem = {
      ...itm,
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      xMm: Math.min(roomLengthMm - itm.widthMm, itm.xMm + itm.widthMm + 50),
      yMm: itm.yMm,
    };
    setItems((prev) => [...prev, duplicated]);
    setSelectedItemId(duplicated.id);
    onAddToast?.('success', `Duplicated ${itm.name}`);
  };

  // Rotate selected item 90 degrees
  const handleRotateSelected = () => {
    if (!selectedItemId) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== selectedItemId) return i;
        const newRot = (i.rotationDeg + 90) % 360;
        return { ...i, rotationDeg: newRot };
      })
    );
  };

  // Clear all items
  const handleClearAll = () => {
    if (items.length === 0) return;
    setItems([]);
    setSelectedItemId(null);
    onAddToast?.('info', 'Shelter interior cleared');
  };

  // Keyboard shortcuts for delete, rotate, duplicate, and cancel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemId) {
          e.preventDefault();
          handleDeleteSelected();
        } else if (activeOpening === 'feeder') {
          e.preventDefault();
          setCableWall('none');
          setActiveOpening(null);
          onAddToast?.('info', 'Feeder cable hole disabled');
        }
      } else if (e.key === 'Escape') {
        if (selectedItemId || activeOpening) {
          e.preventDefault();
          setSelectedItemId(null);
          setActiveOpening(null);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedItemId && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleRotateSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        if (selectedItemId) {
          e.preventDefault();
          handleDuplicateSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedItemId, activeOpening, items]);

  // Save and Apply to the site layout
  const handleSaveAndSync = () => {
    const hM = shelterHeightM;
    const ladderElevMm = Math.round((hM - 0.09) * 1000);

    const interiorCADObjects: any[] = items.map((item) => {
      const pxWidth = (item.widthMm / 1000) * 20;
      const pxHeight = (item.depthMm / 1000) * 20;
      const finalElevMm = item.category === 'ladder' ? ladderElevMm : (item.elevationMm ?? 0);
      return {
        id: item.id,
        type: 'stencil-group',
        stencilId: item.stencilId,
        name: item.name,
        category: item.category,
        x: item.xMm,
        y: item.yMm,
        xMm: item.xMm,
        yMm: item.yMm,
        width: pxWidth,
        height: pxHeight,
        widthMm: item.widthMm,
        depthMm: item.depthMm,
        heightMm: item.heightMm,
        uHeight: item.uHeight,
        rotation: item.rotationDeg,
        rotationDeg: item.rotationDeg,
        elevationMm: finalElevMm,
        stroke: item.strokeColor,
        strokeColor: item.strokeColor,
        strokeWidth: 2,
        fill: item.color,
        color: item.color,
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        text: item.name,
        customProps: {
          stencilType: item.stencilId,
          widthMm: item.widthMm,
          depthMm: item.depthMm,
          heightMm: item.heightMm,
          uHeight: item.uHeight,
          elevationMm: finalElevMm,
          category: item.category,
          desc: item.desc,
        },
      };
    });

    if (currentShelter) {
      const updatedShelter: CADObject = {
        ...currentShelter,
        width: (roomLengthMm / 1000) * 20,
        height: (roomWidthMm / 1000) * 20,
        shelterHeightM: hM,
        cableHoleDiameterMm,
        feederDiameter: cableHoleDiameterMm,
        cableHoleElevationMm,
        feederElevationMm: cableHoleElevationMm,
        interiorObjects: interiorCADObjects,
        customProps: {
          ...(currentShelter.customProps || {}),
          shelterHeightM: hM,
          doorWall,
          doorOffset: doorOffsetPct,
          doorWidthMm,
          doorDiameter: doorWidthMm,
          doorDiameterMm: doorWidthMm,
          cableHoleWall: cableWall,
          cableHoleOffset: cableOffsetPct,
          cableHoleDiameterMm,
          cableHoleDiameter: cableHoleDiameterMm,
          feederDiameter: cableHoleDiameterMm,
          cableHoleElevationMm,
          feederElevationMm: cableHoleElevationMm,
          airconWall: currentShelter.customProps?.airconWall ?? airconWall,
          airconOffset: airconOffsetPct,
          roofMode,
          interiorObjects: interiorCADObjects,
        },
      };

      onUpdateShelter(updatedShelter);

      if (onSaveAllObjects && allObjects.length > 0) {
        const updatedAll = allObjects.map((o) => (o.id === currentShelter.id ? updatedShelter : o));
        onSaveAllObjects(updatedAll);
      }

      onAddToast?.(
        'success',
        `Saved Shelter Design: ${items.length} interior items, door ⌀${doorWidthMm}mm, and height ${hM.toFixed(1)}m synced to site layout!`
      );
    } else {
      const newShelterW = (roomLengthMm / 1000) * 20;
      const newShelterH = (roomWidthMm / 1000) * 20;
      const newShelter: CADObject = {
        id: `shelter-${Date.now()}`,
        type: 'stencil-group',
        stencilId: 'shelter',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: newShelterW,
        baseHeight: newShelterH,
        x: 360,
        y: 260,
        width: newShelterW,
        height: newShelterH,
        stroke: '#f8fafc',
        strokeWidth: 2,
        fill: '#1e293b',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        shelterHeightM: hM,
        cableHoleDiameterMm,
        feederDiameter: cableHoleDiameterMm,
        cableHoleElevationMm,
        feederElevationMm: cableHoleElevationMm,
        interiorObjects: interiorCADObjects,
        customProps: {
          stencilType: 'shelter',
          shelterHeightM: hM,
          doorWall,
          doorOffset: doorOffsetPct,
          doorWidthMm,
          doorDiameter: doorWidthMm,
          doorDiameterMm: doorWidthMm,
          cableHoleWall: cableWall,
          cableHoleOffset: cableOffsetPct,
          cableHoleDiameterMm,
          cableHoleDiameter: cableHoleDiameterMm,
          feederDiameter: cableHoleDiameterMm,
          cableHoleElevationMm,
          feederElevationMm: cableHoleElevationMm,
          airconWall: 'none',
          airconOffset: airconOffsetPct,
          wallThickness: 10,
          roofMode,
          interiorObjects: interiorCADObjects,
        },
      };
      onUpdateShelter(newShelter);
      onAddToast?.(
        'success',
        `Created & synced Shelter (${(roomLengthMm / 1000).toFixed(1)}m × ${(roomWidthMm / 1000).toFixed(1)}m × ${hM.toFixed(1)}m) with ${items.length} interior items!`
      );
    }

    onClose();
  };

  const selectedItem = items.find((i) => i.id === selectedItemId) || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col backdrop-blur-md text-slate-100 select-none animate-in fade-in duration-200"
    >
      <ShelterDesignerHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        renderStyle={renderStyle}
        setRenderStyle={setRenderStyle}
        roofMode={roofMode}
        setRoofMode={setRoofMode}
        roomLengthMm={roomLengthMm}
        setRoomLengthMm={setRoomLengthMm}
        roomWidthMm={roomWidthMm}
        setRoomWidthMm={setRoomWidthMm}
        shelterHeightM={shelterHeightM}
        setShelterHeightM={setShelterHeightM}
        doorWall={doorWall}
        setDoorWall={setDoorWall}
        doorOffsetPct={doorOffsetPct}
        setDoorOffsetPct={setDoorOffsetPct}
        doorWidthMm={doorWidthMm}
        setDoorWidthMm={setDoorWidthMm}
        cableWall={cableWall}
        setCableWall={setCableWall}
        cableOffsetPct={cableOffsetPct}
        setCableOffsetPct={setCableOffsetPct}
        cableHoleDiameterMm={cableHoleDiameterMm}
        setCableHoleDiameterMm={setCableHoleDiameterMm}
        onClearAll={handleClearAll}
        onSaveAndSync={handleSaveAndSync}
        onClose={onClose}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <ShelterDesignerSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          filteredStencils={filteredStencils}
          items={items}
          onAddItem={handleAddItem}
        />

        {/* Center: Interactive 2D Drafting Floorplan or 3D Walkthrough View */}
        <div className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
          <div className={`flex-1 flex flex-col relative w-full h-full ${viewMode === '2d' ? '' : 'hidden'}`}>
            <Shelter2DCanvas
              renderStyle={renderStyle}
              roofMode={roofMode}
              roomLengthMm={roomLengthMm}
              roomWidthMm={roomWidthMm}
              shelterHeightM={shelterHeightM}
              wallThickMm={wallThickMm}
              doorWall={doorWall}
              setDoorWall={setDoorWall}
              doorOffsetPct={doorOffsetPct}
              setDoorOffsetPct={setDoorOffsetPct}
              doorWidthMm={doorWidthMm}
              setDoorWidthMm={setDoorWidthMm}
              cableWall={cableWall}
              setCableWall={setCableWall}
              cableOffsetPct={cableOffsetPct}
              setCableOffsetPct={setCableOffsetPct}
              cableHoleDiameterMm={cableHoleDiameterMm}
              setCableHoleDiameterMm={setCableHoleDiameterMm}
              cableHoleElevationMm={cableHoleElevationMm}
              setCableHoleElevationMm={setCableHoleElevationMm}
              airconWall={airconWall}
              airconOffsetPct={airconOffsetPct}
              items={items}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              setItems={setItems}
              gridSnapMm={gridSnapMm}
              setGridSnapMm={setGridSnapMm}
              activeOpening={activeOpening}
              setActiveOpening={setActiveOpening}
              onDeleteSelected={handleDeleteSelected}
              onDuplicateSelected={handleDuplicateSelected}
              onRotateSelected={handleRotateSelected}
              onUpdateSelectedItem={(partial) => {
                if (!selectedItemId) return;
                setItems((prev) =>
                  prev.map((it) => (it.id === selectedItemId ? { ...it, ...partial } : it))
                );
              }}
            />
          </div>

          <div className={`flex-1 w-full h-full relative cursor-grab active:cursor-grabbing ${viewMode === '3d' ? '' : 'hidden'}`}>
            <Shelter3DPreview
              renderStyle={renderStyle}
              roofMode={roofMode}
              roomLengthMm={roomLengthMm}
              roomWidthMm={roomWidthMm}
              shelterHeightM={shelterHeightM}
              wallThickMm={wallThickMm}
              doorWall={doorWall}
              doorOffsetPct={doorOffsetPct}
              doorWidthMm={doorWidthMm}
              cableWall={cableWall}
              cableOffsetPct={cableOffsetPct}
              cableHoleDiameterMm={cableHoleDiameterMm}
              cableHoleElevationMm={cableHoleElevationMm}
              items={items}
              cameraStateRef={cameraStateRef}
            />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
              <span className="font-semibold text-amber-400">3D Shelter Walkthrough:</span>
              <span>Drag to rotate • Right-drag/Shift to pan • Scroll to zoom</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const s3D = 6.0;
                cameraStateRef.current.angleX = 0.5;
                cameraStateRef.current.angleY = 0.6;
                cameraStateRef.current.distance = Math.max((roomLengthMm / 1000) * s3D, (roomWidthMm / 1000) * s3D) * 1.8;
                cameraStateRef.current.panX = 0;
                cameraStateRef.current.panY = 0;
                cameraStateRef.current.panZ = 0;
              }}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
              title="Reset viewing angle to default"
            >
              Reset Angle
            </button>

            {/* Quick 3D Inspection HUD: Interior Object Visibility & Quick Roof Toggles */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-2xl flex flex-wrap items-center gap-2.5 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-white text-[11px]">Interior:</span>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">100% VISIBLE</span>
              </div>
              <div className="h-3.5 w-px bg-slate-700"></div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Roof:</span>
                <button
                  type="button"
                  onClick={() => setRoofMode('cutaway')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                    roofMode === 'cutaway'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Cutaway Open Roof: Rafters along top with 100% open center"
                >
                  Cutaway (Open)
                </button>
                <button
                  type="button"
                  onClick={() => setRoofMode('transparent')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                    roofMode === 'transparent'
                      ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Glass Roof: Crystal-clear glass with structural rafters"
                >
                  Glass
                </button>
                <button
                  type="button"
                  onClick={() => setRoofMode('solid')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                    roofMode === 'solid'
                      ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Solid with Cutaway: Standing-seam roof with inspection cutaway"
                >
                  Solid (See-Through)
                </button>
              </div>
              <div className="h-3.5 w-px bg-slate-700"></div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRenderStyle(renderStyle === 'photo' ? 'cad' : 'photo')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    renderStyle === 'photo'
                      ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40'
                      : 'bg-sky-600/25 text-sky-300 border border-sky-500/40'
                  }`}
                  title="Toggle Photo (Realistic) vs CAD (Blueprint) Mode"
                >
                  {renderStyle === 'photo' ? 'Photo Mode' : 'CAD Blueprint'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <ShelterDesignerInspector
          selectedItem={selectedItem}
          shelterHeightM={shelterHeightM}
          items={items}
          roomLengthMm={roomLengthMm}
          roomWidthMm={roomWidthMm}
          doorWall={doorWall}
          setDoorWall={setDoorWall}
          doorOffsetPct={doorOffsetPct}
          setDoorOffsetPct={setDoorOffsetPct}
          doorWidthMm={doorWidthMm}
          setDoorWidthMm={setDoorWidthMm}
          cableWall={cableWall}
          setCableWall={setCableWall}
          cableOffsetPct={cableOffsetPct}
          setCableOffsetPct={setCableOffsetPct}
          onRotateSelected={handleRotateSelected}
          onDuplicateSelected={handleDuplicateSelected}
          onDeleteSelected={handleDeleteSelected}
          activeOpening={activeOpening}
          setActiveOpening={setActiveOpening}
          cableHoleDiameterMm={cableHoleDiameterMm}
          setCableHoleDiameterMm={setCableHoleDiameterMm}
          cableHoleElevationMm={cableHoleElevationMm}
          setCableHoleElevationMm={setCableHoleElevationMm}
          onUpdateSelectedItem={(partial) => {
            if (!selectedItemId) return;
            setItems((prev) =>
              prev.map((it) => (it.id === selectedItemId ? { ...it, ...partial } : it))
            );
          }}
        />
      </div>

      {/* Add Wall-Mount AC Placement & Height Modal */}
      {pendingACStencil && (
        <AddWallMountACModal
          isOpen={Boolean(pendingACStencil)}
          onClose={() => setPendingACStencil(null)}
          stencil={pendingACStencil}
          roomLengthMm={roomLengthMm}
          roomWidthMm={roomWidthMm}
          shelterHeightM={shelterHeightM}
          doorWall={doorWall}
          cableWall={cableWall}
          existingACCount={items.filter((i) => {
            const s = (i.stencilId || i.category || i.name || '').toLowerCase();
            return s.includes('ac') || s.includes('split') || s.includes('cool');
          }).length}
          onConfirmAdd={handleConfirmAddAC}
        />
      )}
    </div>
  );
};
