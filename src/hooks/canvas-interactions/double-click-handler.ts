/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { isPointInObject } from '../../utils/cad-geometry';
import { CanvasInteractionContext } from './types';

export function executeCanvasDoubleClick(
  e: React.MouseEvent<HTMLCanvasElement>,
  ctx: CanvasInteractionContext
): void {
  const {
    canvasRef,
    screenToWorld,
    worldToScreen,
    interactionRef,
    finalizePolyline,
    objects,
    setInlineEditor,
    settings,
  } = ctx;

  if (!canvasRef.current) return;
  const rect = canvasRef.current.getBoundingClientRect();
  const rawWorld = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

  // If polyline in progress, finish it
  if (interactionRef.current.polylinePoints && interactionRef.current.polylinePoints.length > 1) {
    finalizePolyline();
    return;
  }

  // Find if clicked on text, leader note, or stencil label
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if ((obj.type === 'text' || obj.type === 'leader' || obj.isStencilLabel) && isPointInObject(rawWorld, obj)) {
      const screenCoord = obj.type === 'leader'
        ? worldToScreen(obj.x2 ?? (obj.x + 40), obj.y2 ?? (obj.y - 30))
        : worldToScreen(obj.x + (obj.width || 50) / 2, obj.y + (obj.height || 20) / 2);
      setInlineEditor({
        objId: obj.id,
        field: 'text',
        text: obj.text || '',
        pos: screenCoord,
        fontSize: obj.fontSize || 12,
        fontFamily: obj.fontFamily || settings.defaultFontFamily,
      });
      return;
    }
  }

  // Double-click on Door, Gate, Shelter or Telecom Outdoor Cabinet toggles Open / Closed state
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (isPointInObject(rawWorld, obj)) {
      const s = (obj.stencilId || obj.customProps?.stencilType || '').toLowerCase();
      const isDoorOrGateOrCabinet =
        s === 'gate-2door' ||
        s.includes('gate') ||
        s.includes('door') ||
        s === 'shelter' ||
        s === 'cement-shelter' ||
        s.includes('cabinet') ||
        s.includes('odc') ||
        s.includes('1bay') ||
        s.includes('2bay') ||
        s.includes('3bay') ||
        s.includes('huawei') ||
        s.includes('ericsson') ||
        s.includes('eltek') ||
        s.includes('fushan') ||
        s.includes('fhodc') ||
        obj.customProps?.isCabinet === true ||
        obj.customProps?.category === 'cabinets';

      if (isDoorOrGateOrCabinet) {
        const nextOpen = !(obj.doorsOpen || obj.customProps?.doorsOpen || obj.customProps?.isClosed === false);
        const nextObjects = objects.map((o) => {
          if (o.id === obj.id) {
            let nextText = o.text;
            if (nextText) {
              nextText = nextOpen
                ? nextText.replace(/\(CLOSED\)/gi, '(OPEN)')
                : nextText.replace(/\(OPEN\)/gi, '(CLOSED)');
            }
            return {
              ...o,
              doorsOpen: nextOpen,
              text: nextText,
              customProps: {
                ...(o.customProps || {}),
                doorsOpen: nextOpen,
                isClosed: !nextOpen,
              },
            };
          }
          if (o.isStencilLabel && o.parentId === obj.id && o.text) {
            const updatedText = nextOpen
              ? o.text.replace(/\(CLOSED\)/gi, '(OPEN)')
              : o.text.replace(/\(OPEN\)/gi, '(CLOSED)');
            return { ...o, text: updatedText };
          }
          return o;
        });

        ctx.setObjects(nextObjects);
        ctx.objectsRef.current = nextObjects;
        ctx.recordHistory(nextObjects);

        const isCab =
          s.includes('cabinet') ||
          s.includes('odc') ||
          s.includes('1bay') ||
          s.includes('2bay') ||
          s.includes('3bay') ||
          s.includes('huawei') ||
          s.includes('ericsson') ||
          s.includes('eltek') ||
          s.includes('fushan') ||
          s.includes('fhodc');

        const label =
          obj.text?.replace(/\s*\((OPEN|CLOSED)\)/gi, '') ||
          (isCab ? 'Cabinet Door' : s.includes('gate') ? 'Security Gate' : 'Shelter Door');

        if (isCab && ctx.onOpenRackDesigner) {
          ctx.onOpenRackDesigner(obj);
          ctx.addToast(
            'info',
            `${nextOpen ? 'Opened' : 'Closed'} ${label} & Launched Visual Equipment Designer`
          );
        } else {
          ctx.addToast(
            'info',
            `${nextOpen ? 'Opened' : 'Closed'} ${label} [Double-Click / Key Z]`
          );
        }
        return;
      }
    }
  }
}
