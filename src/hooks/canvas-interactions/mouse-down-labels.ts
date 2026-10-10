/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Point } from '../../types/cad';
import { CanvasInteractionContext } from './types';

export function handleMouseDownHoveredLabels(
  e: React.MouseEvent<HTMLCanvasElement>,
  ctx: CanvasInteractionContext,
  screenPt: Point,
  rawWorld: Point
): boolean {
  const {
    objects,
    setSelectedIds,
    interactionRef,
    settings,
    hoveredTextLabel,
  } = ctx;

  if (
    e.button !== 0 ||
    !hoveredTextLabel ||
    interactionRef.current.mode === 'pan' ||
    interactionRef.current.isSpaceHeld
  ) {
    return false;
  }

  const field = hoveredTextLabel.field;
  if (field === 'sheetNorth' || field === 'sheetLegend' || field === 'sheetScale' || field === 'sheetTitle') {
    const sTarget = field === 'sheetNorth' ? 'north' : field === 'sheetLegend' ? 'legend' : field === 'sheetScale' ? 'scale' : 'title';
    let initPos: Point;
    if (sTarget === 'north') initPos = { x: settings.northArrowPos?.x ?? (settings.canvasWidth - 60), y: settings.northArrowPos?.y ?? 60 };
    else if (sTarget === 'legend') initPos = { x: settings.legendPos?.x ?? 32, y: settings.legendPos?.y ?? 32 };
    else if (sTarget === 'scale') initPos = { x: settings.scaleBarPos?.x ?? 32, y: settings.scaleBarPos?.y ?? (settings.canvasHeight - 32) };
    else initPos = { x: settings.titleBlockPos?.x ?? (settings.canvasWidth - 20 - 320), y: settings.titleBlockPos?.y ?? (settings.canvasHeight - 20 - 110) };

    interactionRef.current = {
      mode: 'move-sheet-element',
      startScreen: screenPt,
      startWorld: rawWorld,
      currentWorld: rawWorld,
      sheetTarget: sTarget,
      initialSheetPos: initPos,
    };
    return true;
  }

  if (field === 'dimText') {
    const target = objects.find((o) => o.id === hoveredTextLabel.objId);
    if (target) {
      setSelectedIds([target.id]);
      interactionRef.current = {
        mode: 'move-dimension-label',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: target.id,
        initialOffset: {
          x: target.labelOffsetX ?? target.customProps?.labelOffsetX ?? 0,
          y: target.labelOffsetY ?? target.customProps?.labelOffsetY ?? 0,
        },
      };
      return true;
    }
  }

  if (field === 'measBadge') {
    const target = objects.find((o) => o.id === hoveredTextLabel.objId);
    if (target) {
      setSelectedIds([target.id]);
      interactionRef.current = {
        mode: 'move-meas-badge',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: target.id,
        initialOffset: {
          x: target.measBadgeOffsetX ?? target.customProps?.measBadgeOffsetX ?? 0,
          y: target.measBadgeOffsetY ?? target.customProps?.measBadgeOffsetY ?? 0,
        },
      };
      return true;
    }
  }

  if (field === 'elevBadge') {
    const target = objects.find((o) => o.id === hoveredTextLabel.objId);
    if (target) {
      setSelectedIds([target.id]);
      interactionRef.current = {
        mode: 'move-elev-badge',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: target.id,
        initialOffset: {
          x: target.elevBadgeOffsetX ?? target.customProps?.elevBadgeOffsetX ?? 0,
          y: target.elevBadgeOffsetY ?? target.customProps?.elevBadgeOffsetY ?? 0,
        },
      };
      return true;
    }
  }

  if (field === 'leaderCallout') {
    const target = objects.find((o) => o.id === hoveredTextLabel.objId);
    if (target) {
      setSelectedIds([target.id]);
      interactionRef.current = {
        mode: 'move-leader-callout',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: target.id,
        initialLeaderKnee: {
          x: target.x2 ?? target.x + 40,
          y: target.y2 ?? target.y - 30,
        },
      };
      return true;
    }
  }

  if (field === 'leaderTip') {
    const target = objects.find((o) => o.id === hoveredTextLabel.objId);
    if (target) {
      setSelectedIds([target.id]);
      interactionRef.current = {
        mode: 'move-leader-tip',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        targetId: target.id,
        initialLeaderTip: {
          x: target.x,
          y: target.y,
        },
      };
      return true;
    }
  }

  if (field === 'text') {
    const target = objects.find((o) => o.id === hoveredTextLabel.objId);
    if (target) {
      setSelectedIds([target.id]);
      const initPositions = new Map<string, Point>();
      initPositions.set(target.id, { x: target.x, y: target.y });
      interactionRef.current = {
        mode: 'move-objects',
        startScreen: screenPt,
        startWorld: rawWorld,
        currentWorld: rawWorld,
        dragInitialPositions: initPositions,
      };
      return true;
    }
  }

  return false;
}
