/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Trash2, RotateCw, Copy, Layers, MoveHorizontal } from 'lucide-react';
import { Point } from '../../types/cad';
import { InteriorEquipmentItem } from './catalog';
import { renderShelter2D } from './shelter-2d-canvas-renderer';

export interface Shelter2DCanvasProps {
  roomLengthMm: number;
  roomWidthMm: number;
  shelterHeightM: number;
  wallThickMm: number;
  doorWall: 'north' | 'south' | 'east' | 'west';
  setDoorWall: (wall: 'north' | 'south' | 'east' | 'west') => void;
  doorOffsetPct: number;
  setDoorOffsetPct: (pct: number) => void;
  doorWidthMm: number;
  setDoorWidthMm?: (val: number) => void;
  cableWall: 'north' | 'south' | 'east' | 'west' | 'none';
  setCableWall: (wall: 'north' | 'south' | 'east' | 'west' | 'none') => void;
  cableOffsetPct: number;
  setCableOffsetPct: (pct: number) => void;
  airconWall: 'north' | 'south' | 'east' | 'west' | 'none';
  airconOffsetPct: number;
  items: InteriorEquipmentItem[];
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  setItems: React.Dispatch<React.SetStateAction<InteriorEquipmentItem[]>>;
  gridSnapMm: number;
  setGridSnapMm: (snap: number) => void;
  activeOpening?: 'door' | 'feeder' | null;
  setActiveOpening?: (opening: 'door' | 'feeder' | null) => void;
  cableHoleDiameterMm?: number;
  setCableHoleDiameterMm?: (val: number) => void;
  cableHoleElevationMm?: number;
  setCableHoleElevationMm?: (val: number) => void;
  renderStyle?: 'photo' | 'cad';
  roofMode?: 'cutaway' | 'transparent' | 'solid';
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onRotateSelected?: () => void;
  onUpdateSelectedItem?: (partial: Partial<InteriorEquipmentItem>) => void;
}

export const Shelter2DCanvas: React.FC<Shelter2DCanvasProps> = ({
  roomLengthMm,
  roomWidthMm,
  shelterHeightM,
  wallThickMm,
  doorWall,
  setDoorWall,
  doorOffsetPct,
  setDoorOffsetPct,
  doorWidthMm,
  setDoorWidthMm,
  cableWall,
  setCableWall,
  cableOffsetPct,
  setCableOffsetPct,
  cableHoleDiameterMm = 250,
  setCableHoleDiameterMm,
  cableHoleElevationMm,
  setCableHoleElevationMm,
  items,
  selectedItemId,
  setSelectedItemId,
  setItems,
  gridSnapMm,
  setGridSnapMm,
  activeOpening: controlledActiveOpening,
  setActiveOpening: controlledSetActiveOpening,
  renderStyle = 'photo',
  roofMode = 'cutaway',
  onDeleteSelected,
  onDuplicateSelected,
  onRotateSelected,
  onUpdateSelectedItem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState<boolean>(false);
  const [draggingOpening, setDraggingOpening] = useState<
    'door' | 'door-resize' | 'feeder' | 'feeder-resize' | 'ladder-resize-end' | 'ladder-resize-start' | null
  >(null);
  const [localActiveOpening, setLocalActiveOpening] = useState<'door' | 'feeder' | null>(null);
  const activeOpening = controlledActiveOpening !== undefined ? controlledActiveOpening : localActiveOpening;
  const setActiveOpening = controlledSetActiveOpening || setLocalActiveOpening;

  const [dragStartPos, setDragStartPos] = useState<Point>({ x: 0, y: 0 });
  const [dragItemInitialPos, setDragItemInitialPos] = useState<Point>({ x: 0, y: 0 });
  const [dragItemInitialWidth, setDragItemInitialWidth] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderShelter2D(ctx, canvas.width, canvas.height, {
      roomLengthMm,
      roomWidthMm,
      shelterHeightM,
      wallThickMm,
      doorWall,
      doorOffsetPct,
      doorWidthMm,
      cableWall,
      cableOffsetPct,
      items,
      selectedItemId,
      activeOpening,
      cableHoleDiameterMm,
      cableHoleElevationMm,
      renderStyle,
      roofMode,
    });
  }, [
    roomLengthMm,
    roomWidthMm,
    shelterHeightM,
    wallThickMm,
    doorWall,
    doorOffsetPct,
    doorWidthMm,
    cableWall,
    cableOffsetPct,
    cableHoleDiameterMm,
    cableHoleElevationMm,
    items,
    selectedItemId,
    activeOpening,
    renderStyle,
    roofMode,
  ]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / Math.max(1, rect.width)),
      y: (e.clientY - rect.top) * (canvas.height / Math.max(1, rect.height)),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x: clickX, y: clickY } = getCanvasCoords(e);

    const margin = 70;
    const availW = canvas.width - margin * 2;
    const availH = canvas.height - margin * 2;
    const scale = Math.min(availW / roomLengthMm, availH / roomWidthMm);
    const roomPxW = roomLengthMm * scale;
    const roomPxH = roomWidthMm * scale;
    const originX = (canvas.width - roomPxW) / 2;
    const originY = (canvas.height - roomPxH) / 2;
    const wallPxT = wallThickMm * scale;

    // 1. Check if clicking on Feeder Hole (Cable Entry Gland)
    if (cableWall !== 'none') {
      const cW = Math.max(14, (cableHoleDiameterMm || 250) * scale);
      let fCenterX = 0;
      let fCenterY = 0;
      if (cableWall === 'east') {
        fCenterX = originX + roomPxW + wallPxT / 2;
        fCenterY = originY + roomPxH * (cableOffsetPct / 100);
      } else if (cableWall === 'west') {
        fCenterX = originX - wallPxT / 2;
        fCenterY = originY + roomPxH * (cableOffsetPct / 100);
      } else if (cableWall === 'north') {
        fCenterX = originX + roomPxW * (cableOffsetPct / 100);
        fCenterY = originY - wallPxT / 2;
      } else {
        fCenterX = originX + roomPxW * (cableOffsetPct / 100);
        fCenterY = originY + roomPxH + wallPxT / 2;
      }

      let fResizeX = fCenterX;
      let fResizeY = fCenterY;
      if (cableWall === 'south' || cableWall === 'north') {
        fResizeX = fCenterX + cW / 2;
      } else {
        fResizeY = fCenterY + cW / 2;
      }

      if (Math.hypot(clickX - fResizeX, clickY - fResizeY) <= 18) {
        setSelectedItemId(null);
        setActiveOpening('feeder');
        setDraggingOpening('feeder-resize');
        return;
      }

      const hitHalfW = cableWall === 'east' || cableWall === 'west' ? wallPxT + 18 : cW / 2 + 14;
      const hitHalfH = cableWall === 'east' || cableWall === 'west' ? cW / 2 + 14 : wallPxT + 18;
      if (
        Math.abs(clickX - fCenterX) <= hitHalfW &&
        Math.abs(clickY - fCenterY) <= hitHalfH
      ) {
        setSelectedItemId(null);
        setActiveOpening('feeder');
        setDraggingOpening('feeder');
        return;
      }
    }

    // 2. Check if clicking on Door Opening / Leaf / Grip
    const dWidthPx = doorWidthMm * scale;
    let dCenterX = 0;
    let dCenterY = 0;
    if (doorWall === 'south') {
      dCenterX = originX + roomPxW * (doorOffsetPct / 100);
      dCenterY = originY + roomPxH + wallPxT / 2;
    } else if (doorWall === 'north') {
      dCenterX = originX + roomPxW * (doorOffsetPct / 100);
      dCenterY = originY - wallPxT / 2;
    } else if (doorWall === 'east') {
      dCenterX = originX + roomPxW + wallPxT / 2;
      dCenterY = originY + roomPxH * (doorOffsetPct / 100);
    } else {
      dCenterX = originX - wallPxT / 2;
      dCenterY = originY + roomPxH * (doorOffsetPct / 100);
    }

    let dResizeX = dCenterX;
    let dResizeY = dCenterY;
    if (doorWall === 'south' || doorWall === 'north') {
      dResizeX = dCenterX + dWidthPx / 2;
    } else {
      dResizeY = dCenterY + dWidthPx / 2;
    }

    if (Math.hypot(clickX - dResizeX, clickY - dResizeY) <= 18) {
      setSelectedItemId(null);
      setActiveOpening('door');
      setDraggingOpening('door-resize');
      return;
    }

    const doorHitHalfW = doorWall === 'east' || doorWall === 'west' ? dWidthPx * 0.65 + wallPxT : dWidthPx / 2 + 16;
    const doorHitHalfH = doorWall === 'east' || doorWall === 'west' ? dWidthPx / 2 + 16 : dWidthPx * 0.65 + wallPxT;
    if (
      Math.abs(clickX - dCenterX) <= doorHitHalfW &&
      Math.abs(clickY - dCenterY) <= doorHitHalfH
    ) {
      setSelectedItemId(null);
      setActiveOpening('door');
      setDraggingOpening('door');
      return;
    }

    // 3. Check handles on currently selected item (delete button or ladder expansion handles)
    if (selectedItemId) {
      const activeSel = items.find((i) => i.id === selectedItemId);
      if (activeSel) {
        const itmPxW = activeSel.widthMm * scale;
        const itmPxD = activeSel.depthMm * scale;
        const itmCenterX = originX + (activeSel.xMm + activeSel.widthMm / 2) * scale;
        const itmCenterY = originY + (activeSel.yMm + activeSel.depthMm / 2) * scale;
        const rotRad = (activeSel.rotationDeg * Math.PI) / 180;
        const dx = clickX - itmCenterX;
        const dy = clickY - itmCenterY;
        const localClickX = dx * Math.cos(-rotRad) - dy * Math.sin(-rotRad);
        const localClickY = dx * Math.sin(-rotRad) + dy * Math.cos(-rotRad);

        // A. Hit-test on-canvas red delete button at (itmPxW / 2 + 10, -itmPxD / 2 - 10)
        const delDist = Math.hypot(localClickX - (itmPxW / 2 + 10), localClickY - (-itmPxD / 2 - 10));
        if (delDist <= 16) {
          if (onDeleteSelected) {
            onDeleteSelected();
          } else {
            setItems((prev) => prev.filter((it) => it.id !== selectedItemId));
            setSelectedItemId(null);
          }
          return;
        }

        // B. If ladder, hit-test right & left expansion handles
        const isLadder =
          activeSel.category === 'ladder' ||
          activeSel.stencilId.toLowerCase().includes('ladder') ||
          activeSel.stencilId.toLowerCase().includes('raceway') ||
          activeSel.name.toLowerCase().includes('ladder') ||
          activeSel.name.toLowerCase().includes('raceway');

        if (isLadder) {
          // Right handle at (itmPxW / 2, 0)
          const rightDist = Math.hypot(localClickX - itmPxW / 2, localClickY);
          if (rightDist <= 16) {
            setActiveOpening(null);
            setDraggingOpening('ladder-resize-end');
            setDragStartPos({ x: clickX, y: clickY });
            setDragItemInitialPos({ x: activeSel.xMm, y: activeSel.yMm });
            setDragItemInitialWidth(activeSel.widthMm);
            return;
          }

          // Left handle at (-itmPxW / 2, 0)
          const leftDist = Math.hypot(localClickX - (-itmPxW / 2), localClickY);
          if (leftDist <= 16) {
            setActiveOpening(null);
            setDraggingOpening('ladder-resize-start');
            setDragStartPos({ x: clickX, y: clickY });
            setDragItemInitialPos({ x: activeSel.xMm, y: activeSel.yMm });
            setDragItemInitialWidth(activeSel.widthMm);
            return;
          }
        }
      }
    }

    // 4. Check if clicking on an interior equipment item (Ladders rendered on top hit-tested first)
    const isLadderItemHit = (it: InteriorEquipmentItem) => {
      const sId = String(it.stencilId || '').toLowerCase();
      const nm = String(it.name || '').toLowerCase();
      return (
        it.category === 'ladder' ||
        sId.includes('ladder') ||
        sId.includes('raceway') ||
        sId.includes('runway') ||
        sId.includes('tray') ||
        nm.includes('ladder') ||
        nm.includes('raceway')
      );
    };

    const ladderItemsRev = items.filter((i) => isLadderItemHit(i)).slice().reverse();
    const floorItemsRev = items.filter((i) => !isLadderItemHit(i)).slice().reverse();
    const hitCandidates = [...ladderItemsRev, ...floorItemsRev];

    for (const itm of hitCandidates) {
      const itmPxW = itm.widthMm * scale;
      const itmPxD = itm.depthMm * scale;
      const itmCenterX = originX + (itm.xMm + itm.widthMm / 2) * scale;
      const itmCenterY = originY + (itm.yMm + itm.depthMm / 2) * scale;
      const rotRad = (itm.rotationDeg * Math.PI) / 180;
      const dx = clickX - itmCenterX;
      const dy = clickY - itmCenterY;
      const localX = dx * Math.cos(-rotRad) - dy * Math.sin(-rotRad);
      const localY = dx * Math.sin(-rotRad) + dy * Math.cos(-rotRad);

      if (Math.abs(localX) <= itmPxW / 2 + 6 && Math.abs(localY) <= itmPxD / 2 + 6) {
        setActiveOpening(null);
        setSelectedItemId(itm.id);
        setIsDraggingItem(true);
        setDragStartPos({ x: clickX, y: clickY });
        setDragItemInitialPos({ x: itm.xMm, y: itm.yMm });
        return;
      }
    }

    setActiveOpening(null);
    setSelectedItemId(null);
  };

  const handleLadderResize = (currPxX: number, currPxY: number, isStartEnd: boolean) => {
    if (!selectedItemId) return;
    const targetItm = items.find((i) => i.id === selectedItemId);
    if (!targetItm) return;

    const margin = 70;
    const availW = (canvasRef.current?.width || 900) - margin * 2;
    const availH = (canvasRef.current?.height || 600) - margin * 2;
    const scale = Math.min(availW / roomLengthMm, availH / roomWidthMm);

    const rotRad = (targetItm.rotationDeg * Math.PI) / 180;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);

    const deltaScreenX = currPxX - dragStartPos.x;
    const deltaScreenY = currPxY - dragStartPos.y;
    const dirSign = isStartEnd ? -1 : 1;
    const deltaAlongAxisMm = (dirSign * (deltaScreenX * cos + deltaScreenY * sin)) / scale;

    let nextWidthMm = dragItemInitialWidth + deltaAlongAxisMm;
    const snap = gridSnapMm > 0 ? gridSnapMm : 50;
    nextWidthMm = Math.round(nextWidthMm / snap) * snap;
    nextWidthMm = Math.max(300, Math.min(12000, nextWidthMm));

    if (isStartEnd) {
      // Right end stays fixed
      const initialEndRoomX =
        dragItemInitialPos.x + (dragItemInitialWidth / 2) + (dragItemInitialWidth / 2) * cos;
      const initialEndRoomY =
        dragItemInitialPos.y + (targetItm.depthMm / 2) + (dragItemInitialWidth / 2) * sin;

      const newCenterRoomX = initialEndRoomX - (nextWidthMm / 2) * cos;
      const newCenterRoomY = initialEndRoomY - (nextWidthMm / 2) * sin;

      const nextXMm = newCenterRoomX - nextWidthMm / 2;
      const nextYMm = newCenterRoomY - targetItm.depthMm / 2;

      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItemId
            ? { ...i, widthMm: nextWidthMm, xMm: Math.round(nextXMm), yMm: Math.round(nextYMm) }
            : i
        )
      );
    } else {
      // Left end stays fixed
      const initialStartRoomX =
        dragItemInitialPos.x + (dragItemInitialWidth / 2) - (dragItemInitialWidth / 2) * cos;
      const initialStartRoomY =
        dragItemInitialPos.y + (targetItm.depthMm / 2) - (dragItemInitialWidth / 2) * sin;

      const newCenterRoomX = initialStartRoomX + (nextWidthMm / 2) * cos;
      const newCenterRoomY = initialStartRoomY + (nextWidthMm / 2) * sin;

      const nextXMm = newCenterRoomX - nextWidthMm / 2;
      const nextYMm = newCenterRoomY - targetItm.depthMm / 2;

      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItemId
            ? { ...i, widthMm: nextWidthMm, xMm: Math.round(nextXMm), yMm: Math.round(nextYMm) }
            : i
        )
      );
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x: currX, y: currY } = getCanvasCoords(e);

    const margin = 70;
    const availW = canvas.width - margin * 2;
    const availH = canvas.height - margin * 2;
    const scale = Math.min(availW / roomLengthMm, availH / roomWidthMm);
    const roomPxW = roomLengthMm * scale;
    const roomPxH = roomWidthMm * scale;
    const originX = (canvas.width - roomPxW) / 2;
    const originY = (canvas.height - roomPxH) / 2;

    // Handle dragging Door or Feeder Hole onto/along any of the 4 walls
    if (draggingOpening === 'door-resize' && setDoorWidthMm) {
      const dWidthPx = doorWidthMm * scale;
      let rawDistPx = 0;
      if (doorWall === 'south' || doorWall === 'north') {
        const dHingeX = originX + roomPxW * (doorOffsetPct / 100) - dWidthPx / 2;
        rawDistPx = Math.abs(currX - dHingeX);
      } else {
        const dHingeY = originY + roomPxH * (doorOffsetPct / 100) - dWidthPx / 2;
        rawDistPx = Math.abs(currY - dHingeY);
      }
      const rawMm = rawDistPx / scale;
      const snappedMm = Math.round(rawMm / 25) * 25;
      const maxSpanMm = (doorWall === 'south' || doorWall === 'north' ? roomLengthMm : roomWidthMm) * 0.8;
      const finalMm = Math.max(600, Math.min(2400, Math.min(maxSpanMm, snappedMm)));
      setDoorWidthMm(finalMm);
      return;
    }

    if (draggingOpening === 'feeder-resize' && setCableHoleDiameterMm) {
      let rawDistPx = 0;
      if (cableWall === 'south' || cableWall === 'north') {
        const fCenterX = originX + roomPxW * (cableOffsetPct / 100);
        rawDistPx = Math.abs(currX - fCenterX);
      } else {
        const fCenterY = originY + roomPxH * (cableOffsetPct / 100);
        rawDistPx = Math.abs(currY - fCenterY);
      }
      const rawMm = (rawDistPx * 2) / scale;
      const snappedMm = Math.round(rawMm / 25) * 25;
      const finalMm = Math.max(100, Math.min(600, snappedMm));
      setCableHoleDiameterMm(finalMm);
      return;
    }

    if (draggingOpening) {
      const distNorth = Math.abs(currY - originY);
      const distSouth = Math.abs(currY - (originY + roomPxH));
      const distWest = Math.abs(currX - originX);
      const distEast = Math.abs(currX - (originX + roomPxW));
      const minDist = Math.min(distNorth, distSouth, distWest, distEast);

      let targetWall: 'north' | 'south' | 'east' | 'west' = 'south';
      let rawPct = 50;

      if (minDist === distNorth) {
        targetWall = 'north';
        rawPct = ((currX - originX) / roomPxW) * 100;
      } else if (minDist === distSouth) {
        targetWall = 'south';
        rawPct = ((currX - originX) / roomPxW) * 100;
      } else if (minDist === distWest) {
        targetWall = 'west';
        rawPct = ((currY - originY) / roomPxH) * 100;
      } else {
        targetWall = 'east';
        rawPct = ((currY - originY) / roomPxH) * 100;
      }

      const clampedPct = Math.round(Math.max(15, Math.min(85, rawPct)));

      if (draggingOpening === 'door') {
        setDoorWall(targetWall);
        setDoorOffsetPct(clampedPct);
      } else if (draggingOpening === 'feeder') {
        setCableWall(targetWall);
        setCableOffsetPct(clampedPct);
      }
      return;
    }

    if (draggingOpening === 'ladder-resize-end') {
      handleLadderResize(currX, currY, false);
      return;
    }

    if (draggingOpening === 'ladder-resize-start') {
      handleLadderResize(currX, currY, true);
      return;
    }

    if (!isDraggingItem || !selectedItemId) return;

    const deltaX = (currX - dragStartPos.x) / scale;
    const deltaY = (currY - dragStartPos.y) / scale;

    const targetItm = items.find((i) => i.id === selectedItemId);
    if (!targetItm) return;

    let nextX = dragItemInitialPos.x + deltaX;
    let nextY = dragItemInitialPos.y + deltaY;

    if (gridSnapMm > 0) {
      nextX = Math.round(nextX / gridSnapMm) * gridSnapMm;
      nextY = Math.round(nextY / gridSnapMm) * gridSnapMm;
    }

    const sId = String(targetItm.stencilId || '').toLowerCase();
    const isWallAC =
      targetItm.wallAttachment !== undefined ||
      targetItm.category === 'cooling' ||
      sId.includes('ac') ||
      sId.includes('split');

    if (isWallAC && targetItm.wallAttachment) {
      const wall = targetItm.wallAttachment;
      const acW = targetItm.widthMm;
      const acD = targetItm.depthMm;
      if (wall === 'north') {
        nextY = 0;
        nextX = Math.max(0, Math.min(roomLengthMm - acW, nextX));
      } else if (wall === 'south') {
        nextY = Math.max(0, roomWidthMm - acD);
        nextX = Math.max(0, Math.min(roomLengthMm - acW, nextX));
      } else if (wall === 'west') {
        nextX = Math.round(acD / 2 - acW / 2);
        const maxWallY = Math.max(0, roomWidthMm - acW);
        const wallY = Math.max(0, Math.min(maxWallY, nextY - Math.round(acW / 2 - acD / 2)));
        nextY = wallY + Math.round(acW / 2 - acD / 2);
      } else if (wall === 'east') {
        nextX = Math.round(roomLengthMm - acD / 2 - acW / 2);
        const maxWallY = Math.max(0, roomWidthMm - acW);
        const wallY = Math.max(0, Math.min(maxWallY, nextY - Math.round(acW / 2 - acD / 2)));
        nextY = wallY + Math.round(acW / 2 - acD / 2);
      }
    } else {
      nextX = Math.max(50, Math.min(roomLengthMm - targetItm.widthMm - 50, nextX));
      nextY = Math.max(50, Math.min(roomWidthMm - targetItm.depthMm - 50, nextY));
    }

    setItems((prev) =>
      prev.map((i) => (i.id === selectedItemId ? { ...i, xMm: nextX, yMm: nextY } : i))
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingItem(false);
    setDraggingOpening(null);
  };

  // Window pointer event listener for smooth dragging even outside canvas
  useEffect(() => {
    if (!draggingOpening && !isDraggingItem) return;

    const onPointerMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currX = (e.clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
      const currY = (e.clientY - rect.top) * (canvas.height / Math.max(1, rect.height));

      const margin = 70;
      const availW = canvas.width - margin * 2;
      const availH = canvas.height - margin * 2;
      const scale = Math.min(availW / roomLengthMm, availH / roomWidthMm);
      const roomPxW = roomLengthMm * scale;
      const roomPxH = roomWidthMm * scale;
      const originX = (canvas.width - roomPxW) / 2;
      const originY = (canvas.height - roomPxH) / 2;

      if (draggingOpening === 'door-resize' && setDoorWidthMm) {
        const dWidthPx = doorWidthMm * scale;
        let rawDistPx = 0;
        if (doorWall === 'south' || doorWall === 'north') {
          const dHingeX = originX + roomPxW * (doorOffsetPct / 100) - dWidthPx / 2;
          rawDistPx = Math.abs(currX - dHingeX);
        } else {
          const dHingeY = originY + roomPxH * (doorOffsetPct / 100) - dWidthPx / 2;
          rawDistPx = Math.abs(currY - dHingeY);
        }
        const rawMm = rawDistPx / scale;
        const snappedMm = Math.round(rawMm / 25) * 25;
        const maxSpanMm = (doorWall === 'south' || doorWall === 'north' ? roomLengthMm : roomWidthMm) * 0.8;
        const finalMm = Math.max(600, Math.min(2400, Math.min(maxSpanMm, snappedMm)));
        setDoorWidthMm(finalMm);
      } else if (draggingOpening === 'feeder-resize' && setCableHoleDiameterMm) {
        let rawDistPx = 0;
        if (cableWall === 'south' || cableWall === 'north') {
          const fCenterX = originX + roomPxW * (cableOffsetPct / 100);
          rawDistPx = Math.abs(currX - fCenterX);
        } else {
          const fCenterY = originY + roomPxH * (cableOffsetPct / 100);
          rawDistPx = Math.abs(currY - fCenterY);
        }
        const rawMm = (rawDistPx * 2) / scale;
        const snappedMm = Math.round(rawMm / 25) * 25;
        const finalMm = Math.max(100, Math.min(600, snappedMm));
        setCableHoleDiameterMm(finalMm);
      } else if (draggingOpening) {
        const distNorth = Math.abs(currY - originY);
        const distSouth = Math.abs(currY - (originY + roomPxH));
        const distWest = Math.abs(currX - originX);
        const distEast = Math.abs(currX - (originX + roomPxW));
        const minDist = Math.min(distNorth, distSouth, distWest, distEast);

        let targetWall: 'north' | 'south' | 'east' | 'west' = 'south';
        let rawPct = 50;

        if (minDist === distNorth) {
          targetWall = 'north';
          rawPct = ((currX - originX) / roomPxW) * 100;
        } else if (minDist === distSouth) {
          targetWall = 'south';
          rawPct = ((currX - originX) / roomPxW) * 100;
        } else if (minDist === distWest) {
          targetWall = 'west';
          rawPct = ((currY - originY) / roomPxH) * 100;
        } else {
          targetWall = 'east';
          rawPct = ((currY - originY) / roomPxH) * 100;
        }

        const clampedPct = Math.round(Math.max(10, Math.min(90, rawPct)));

        if (draggingOpening === 'door') {
          setDoorWall(targetWall);
          setDoorOffsetPct(clampedPct);
        } else if (draggingOpening === 'feeder') {
          setCableWall(targetWall);
          setCableOffsetPct(clampedPct);
        }
      } else if (draggingOpening === 'ladder-resize-end') {
        handleLadderResize(currX, currY, false);
      } else if (draggingOpening === 'ladder-resize-start') {
        handleLadderResize(currX, currY, true);
      } else if (isDraggingItem && selectedItemId) {
        const deltaX = (currX - dragStartPos.x) / scale;
        const deltaY = (currY - dragStartPos.y) / scale;
        const targetItm = items.find((i) => i.id === selectedItemId);
        if (!targetItm) return;

        let nextX = dragItemInitialPos.x + deltaX;
        let nextY = dragItemInitialPos.y + deltaY;

        if (gridSnapMm > 0) {
          nextX = Math.round(nextX / gridSnapMm) * gridSnapMm;
          nextY = Math.round(nextY / gridSnapMm) * gridSnapMm;
        }

        const sId = String(targetItm.stencilId || '').toLowerCase();
        const isWallAC =
          targetItm.wallAttachment !== undefined ||
          targetItm.category === 'cooling' ||
          sId.includes('ac') ||
          sId.includes('split');

        if (isWallAC && targetItm.wallAttachment) {
          const wall = targetItm.wallAttachment;
          const acW = targetItm.widthMm;
          const acD = targetItm.depthMm;
          if (wall === 'north') {
            nextY = 0;
            nextX = Math.max(0, Math.min(roomLengthMm - acW, nextX));
          } else if (wall === 'south') {
            nextY = Math.max(0, roomWidthMm - acD);
            nextX = Math.max(0, Math.min(roomLengthMm - acW, nextX));
          } else if (wall === 'west') {
            nextX = Math.round(acD / 2 - acW / 2);
            const maxWallY = Math.max(0, roomWidthMm - acW);
            const wallY = Math.max(0, Math.min(maxWallY, nextY - Math.round(acW / 2 - acD / 2)));
            nextY = wallY + Math.round(acW / 2 - acD / 2);
          } else if (wall === 'east') {
            nextX = Math.round(roomLengthMm - acD / 2 - acW / 2);
            const maxWallY = Math.max(0, roomWidthMm - acW);
            const wallY = Math.max(0, Math.min(maxWallY, nextY - Math.round(acW / 2 - acD / 2)));
            nextY = wallY + Math.round(acW / 2 - acD / 2);
          }
        } else {
          nextX = Math.max(50, Math.min(roomLengthMm - targetItm.widthMm - 50, nextX));
          nextY = Math.max(50, Math.min(roomWidthMm - targetItm.depthMm - 50, nextY));
        }

        setItems((prev) =>
          prev.map((i) => (i.id === selectedItemId ? { ...i, xMm: nextX, yMm: nextY } : i))
        );
      }
    };

    const onPointerUp = () => {
      setDraggingOpening(null);
      setIsDraggingItem(false);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  }, [
    draggingOpening,
    isDraggingItem,
    selectedItemId,
    roomLengthMm,
    roomWidthMm,
    dragStartPos,
    dragItemInitialPos,
    dragItemInitialWidth,
    gridSnapMm,
    items,
    setDoorWall,
    setDoorOffsetPct,
    setDoorWidthMm,
    doorWidthMm,
    cableWall,
    setCableWall,
    cableOffsetPct,
    setCableOffsetPct,
    cableHoleDiameterMm,
    setCableHoleDiameterMm,
    setItems,
  ]);

  const selectedItem = items.find((i) => i.id === selectedItemId) || null;

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className={`rounded-xl border border-slate-800 shadow-2xl max-w-full max-h-full object-contain ${
          draggingOpening ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
      />

      {/* Top Banner with Quick Switcher Chips */}
      <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 shadow-lg flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
        <span className="hidden sm:inline">Reposition:</span>
        <button
          type="button"
          onClick={() => {
            setSelectedItemId(null);
            setActiveOpening(activeOpening === 'door' ? null : 'door');
          }}
          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            activeOpening === 'door'
              ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-300'
              : 'bg-slate-800/90 text-sky-300 hover:bg-slate-700'
          }`}
        >
          <span>🚪 Door ({doorWall[0].toUpperCase()} {doorOffsetPct}%)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedItemId(null);
            setActiveOpening(activeOpening === 'feeder' ? null : 'feeder');
          }}
          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            activeOpening === 'feeder'
              ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-300'
              : 'bg-slate-800/90 text-amber-300 hover:bg-slate-700'
          }`}
        >
          <span>⚡ Feeder ({cableWall === 'none' ? 'Off' : `${cableWall[0].toUpperCase()} ${cableOffsetPct}%`})</span>
        </button>
      </div>

      {/* Grid Snap Selector */}
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs shadow-lg">
        <span className="px-2 text-[10px] text-slate-400">Snap:</span>
        {[0, 50, 100].map((s) => (
          <button
            key={s}
            onClick={() => setGridSnapMm(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
              gridSnapMm === s ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {s === 0 ? 'Off' : `${s}mm`}
          </button>
        ))}
      </div>

      {/* Bottom Floating Quick-Reposition Toolbar for active opening */}
      {activeOpening === 'door' && (
        <div className="absolute bottom-6 bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl border-2 border-sky-400 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
            <span>🚪 Access Door:</span>
            <span className="font-mono uppercase bg-sky-950 px-1.5 py-0.5 rounded border border-sky-500/40 text-[11px]">
              {doorWall} ({doorOffsetPct}%)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Wall selectors */}
          <div className="flex items-center gap-1">
            {(['north', 'south', 'east', 'west'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setDoorWall(w)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all cursor-pointer ${
                  doorWall === w
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Nudge buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDoorOffsetPct(Math.max(10, doorOffsetPct - 5))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-200 text-[10px] font-mono cursor-pointer"
              title="Nudge left / counter-clockwise"
            >
              ◀ -5%
            </button>
            <button
              type="button"
              onClick={() => setDoorOffsetPct(Math.min(90, doorOffsetPct + 5))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-200 text-[10px] font-mono cursor-pointer"
              title="Nudge right / clockwise"
            >
              +5% ▶
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quick presets */}
          <div className="flex items-center gap-1">
            {[25, 50, 75].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setDoorOffsetPct(pct)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                  doorOffsetPct === pct
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveOpening(null)}
            className="ml-1 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer text-xs"
            title="Close toolbar"
          >
            ✕
          </button>
        </div>
      )}

      {activeOpening === 'feeder' && (
        <div className="absolute bottom-6 bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl border-2 border-amber-400 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <span>⚡ Feeder Hole:</span>
            <span className="font-mono uppercase bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/40 text-[11px]">
              {cableWall === 'none' ? 'Disabled' : `${cableWall} (${cableOffsetPct}%)`}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Wall selectors */}
          <div className="flex items-center gap-1">
            {(['east', 'west', 'north', 'south', 'none'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setCableWall(w)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all cursor-pointer ${
                  cableWall === w
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {w === 'none' ? 'Off' : w}
              </button>
            ))}
          </div>

          {cableWall !== 'none' && (
            <>
              <div className="h-4 w-px bg-slate-800" />

              {/* Nudge buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCableOffsetPct(Math.max(10, cableOffsetPct - 5))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-200 text-[10px] font-mono cursor-pointer"
                  title="Nudge left / counter-clockwise"
                >
                  ◀ -5%
                </button>
                <button
                  type="button"
                  onClick={() => setCableOffsetPct(Math.min(90, cableOffsetPct + 5))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-200 text-[10px] font-mono cursor-pointer"
                  title="Nudge right / clockwise"
                >
                  +5% ▶
                </button>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              {/* Quick presets */}
              <div className="flex items-center gap-1">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCableOffsetPct(pct)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                      cableOffsetPct === pct
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setActiveOpening(null)}
            className="ml-1 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer text-xs"
            title="Close toolbar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Floating Quick-Reposition Toolbar for Selected Item */}
      {!activeOpening && selectedItem && (
        <div className="absolute bottom-6 bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl border-2 border-sky-400 shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 z-20 max-w-[95%] flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedItem.strokeColor }}
            />
            <span className="truncate max-w-[140px]">{selectedItem.name}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quick Ladder Length Controls if ladder is selected */}
          {selectedItem.category === 'ladder' && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                  <MoveHorizontal className="w-3 h-3" />
                  Span:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(300, selectedItem.widthMm - 300);
                    if (onUpdateSelectedItem) {
                      onUpdateSelectedItem({ widthMm: next });
                    } else {
                      setItems((prev) =>
                        prev.map((i) => (i.id === selectedItemId ? { ...i, widthMm: next } : i))
                      );
                    }
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-200 text-[10px] font-mono cursor-pointer transition-colors"
                  title="Shorten length by 300mm"
                >
                  -300
                </button>
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 font-mono text-amber-300 font-bold text-[11px]">
                  {(selectedItem.widthMm / 1000).toFixed(2)}m
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(12000, selectedItem.widthMm + 300);
                    if (onUpdateSelectedItem) {
                      onUpdateSelectedItem({ widthMm: next });
                    } else {
                      setItems((prev) =>
                        prev.map((i) => (i.id === selectedItemId ? { ...i, widthMm: next } : i))
                      );
                    }
                  }}
                  className="px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors shadow-sm"
                  title="Expand length by 300mm"
                >
                  +300
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(12000, selectedItem.widthMm + 600);
                    if (onUpdateSelectedItem) {
                      onUpdateSelectedItem({ widthMm: next });
                    } else {
                      setItems((prev) =>
                        prev.map((i) => (i.id === selectedItemId ? { ...i, widthMm: next } : i))
                      );
                    }
                  }}
                  className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold cursor-pointer transition-colors shadow-sm"
                  title="Expand length by 600mm"
                >
                  +600
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateSelectedItem) {
                      onUpdateSelectedItem({ widthMm: roomLengthMm, xMm: 0 });
                    } else {
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === selectedItemId ? { ...i, widthMm: roomLengthMm, xMm: 0 } : i
                        )
                      );
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-200 text-[10px] font-medium cursor-pointer transition-colors"
                  title={`Expand to span entire room length (${roomLengthMm}mm)`}
                >
                  ↔ Span Room
                </button>
              </div>
              <div className="h-4 w-px bg-slate-800" />
            </>
          )}

          {/* Rotate */}
          <button
            type="button"
            onClick={onRotateSelected}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Rotate 90 degrees (R)"
          >
            <RotateCw className="w-3 h-3 text-sky-400" />
            <span>Rotate</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicateSelected}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Duplicate equipment (Ctrl+D)"
          >
            <Copy className="w-3 h-3 text-emerald-400" />
            <span>Duplicate</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDeleteSelected}
            className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            title="Delete selected equipment (Delete / Backspace)"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
            <span>Delete (Del)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedItemId(null)}
            className="ml-1 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer text-xs"
            title="Deselect (Esc)"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
