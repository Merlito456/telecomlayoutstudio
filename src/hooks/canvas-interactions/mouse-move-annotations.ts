/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Point } from '../../types/cad';
import { CanvasInteractionContext } from './types';

export function handleMouseMoveAnnotations(
  worldPt: Point,
  screenPt: Point,
  ctx: CanvasInteractionContext
): boolean {
  const {
    setSettings,
    settingsRef,
    setObjects,
    objectsRef,
    interactionRef,
    setMeasureTooltip,
  } = ctx;

  const inter = interactionRef.current;

  // MOVING SHEET ELEMENTS
  if (inter.mode === 'move-sheet-element' && inter.initialSheetPos && inter.sheetTarget) {
    const deltaX = worldPt.x - inter.startWorld.x;
    const deltaY = worldPt.y - inter.startWorld.y;
    const newPos = {
      x: Math.round(inter.initialSheetPos.x + deltaX),
      y: Math.round(inter.initialSheetPos.y + deltaY),
    };
    setSettings((prev) => {
      const updated = { ...prev };
      if (inter.sheetTarget === 'north') updated.northArrowPos = newPos;
      else if (inter.sheetTarget === 'legend') updated.legendPos = newPos;
      else if (inter.sheetTarget === 'scale') updated.scaleBarPos = newPos;
      else if (inter.sheetTarget === 'title') updated.titleBlockPos = newPos;
      settingsRef.current = updated;
      return updated;
    });
    setMeasureTooltip({
      text: `${inter.sheetTarget.toUpperCase()}: (${newPos.x}, ${newPos.y})`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // MOVING DIMENSION LABEL
  if (inter.mode === 'move-dimension-label' && inter.targetId && inter.initialOffset) {
    const deltaX = worldPt.x - inter.startWorld.x;
    const deltaY = worldPt.y - inter.startWorld.y;
    const newOffX = Math.round(inter.initialOffset.x + deltaX);
    const newOffY = Math.round(inter.initialOffset.y + deltaY);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          labelOffsetX: newOffX,
          labelOffsetY: newOffY,
          customProps: {
            ...(obj.customProps || {}),
            labelOffsetX: newOffX,
            labelOffsetY: newOffY,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });
    setMeasureTooltip({
      text: `Label Offset: (${newOffX}, ${newOffY})`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // MOVING MEASUREMENT BADGE
  if (inter.mode === 'move-meas-badge' && inter.targetId && inter.initialOffset) {
    const deltaX = worldPt.x - inter.startWorld.x;
    const deltaY = worldPt.y - inter.startWorld.y;
    const newOffX = Math.round(inter.initialOffset.x + deltaX);
    const newOffY = Math.round(inter.initialOffset.y + deltaY);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          measBadgeOffsetX: newOffX,
          measBadgeOffsetY: newOffY,
          customProps: {
            ...(obj.customProps || {}),
            measBadgeOffsetX: newOffX,
            measBadgeOffsetY: newOffY,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });
    setMeasureTooltip({
      text: `Measurement Tag Offset: (${newOffX}, ${newOffY})`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // MOVING LEVEL ELEVATION BADGE
  if (inter.mode === 'move-elev-badge' && inter.targetId && inter.initialOffset) {
    const deltaX = worldPt.x - inter.startWorld.x;
    const deltaY = worldPt.y - inter.startWorld.y;
    const newOffX = Math.round(inter.initialOffset.x + deltaX);
    const newOffY = Math.round(inter.initialOffset.y + deltaY);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          elevBadgeOffsetX: newOffX,
          elevBadgeOffsetY: newOffY,
          customProps: {
            ...(obj.customProps || {}),
            elevBadgeOffsetX: newOffX,
            elevBadgeOffsetY: newOffY,
          },
        };
      });
      objectsRef.current = next;
      return next;
    });
    setMeasureTooltip({
      text: `Elevation Tag Offset: (${newOffX}, ${newOffY})`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // MOVING LEADER CALLOUT KNEE
  if (inter.mode === 'move-leader-callout' && inter.targetId && inter.initialLeaderKnee) {
    const deltaX = worldPt.x - inter.startWorld.x;
    const deltaY = worldPt.y - inter.startWorld.y;
    const newKneeX = Math.round(inter.initialLeaderKnee.x + deltaX);
    const newKneeY = Math.round(inter.initialLeaderKnee.y + deltaY);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          x2: newKneeX,
          y2: newKneeY,
        };
      });
      objectsRef.current = next;
      return next;
    });
    setMeasureTooltip({
      text: `Callout Knee: (${newKneeX}, ${newKneeY})`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  // MOVING LEADER CALLOUT TIP
  if (inter.mode === 'move-leader-tip' && inter.targetId && inter.initialLeaderTip) {
    const deltaX = worldPt.x - inter.startWorld.x;
    const deltaY = worldPt.y - inter.startWorld.y;
    const newTipX = Math.round(inter.initialLeaderTip.x + deltaX);
    const newTipY = Math.round(inter.initialLeaderTip.y + deltaY);

    setObjects((prev) => {
      const next = prev.map((obj) => {
        if (obj.id !== inter.targetId) return obj;
        return {
          ...obj,
          x: newTipX,
          y: newTipY,
        };
      });
      objectsRef.current = next;
      return next;
    });
    setMeasureTooltip({
      text: `Pointer Tip: (${newTipX}, ${newTipY})`,
      x: screenPt.x,
      y: screenPt.y,
    });
    return true;
  }

  return false;
}
