import { CADObject, Point, ViewportState, BoundingBox, ProjectSettings } from "../../types/cad";
import { getCombinedBounds, getObjectBounds, getResizeHandles, isShelterObject } from "../cad-geometry";

function renderSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  selectedObjects: CADObject[],
  zoom: number,
  boxStyle: 'none' | 'corners' | 'box' = 'box'
) {
  const primaryObjs = selectedObjects.filter(
    (o) => !o.isStencilLabel && !(o.type === 'text' && o.parentId)
  );
  const targetObjs = primaryObjs.length > 0 ? primaryObjs : selectedObjects;
  const isSingle = targetObjs.length === 1;
  const single = isSingle ? targetObjs[0] : null;

  // Crucial: Use single object's bounds directly so rotation center is identical to object rotation center!
  const bounds = isSingle && single ? getObjectBounds(single) : getCombinedBounds(targetObjs);
  if (!bounds) return;

  // If single object, use its rotation. If multiple objects, use common rotation if all have it!
  const rotation = isSingle
    ? single?.rotation || 0
    : targetObjs.length > 0 && targetObjs.every((o) => (o.rotation || 0) === (targetObjs[0].rotation || 0))
    ? targetObjs[0].rotation || 0
    : 0;

  ctx.save();

  // If object is rotated, rotate the canvas so selection box and grips stay rotated with the object!
  if (rotation) {
    ctx.translate(bounds.centerX, bounds.centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-bounds.centerX, -bounds.centerY);
  }

  // If boxStyle === 'none': The box of the object is minimized to NONE!
  if (boxStyle === 'none') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    for (const obj of selectedObjects) {
      const b = getObjectBounds(obj);
      ctx.fillRect(b.minX, b.minY, b.width, b.height);
    }
    ctx.restore();
    return;
  }

  // Bounding box border according to style
  if (boxStyle === 'box') {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);
    ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
  } else if (boxStyle === 'corners') {
    // Minimal corner brackets (L-marks)
    const clen = Math.min(10 / zoom, Math.min(bounds.width, bounds.height) / 3);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5 / zoom;
    ctx.setLineDash([]);
    ctx.beginPath();
    // Top-left
    ctx.moveTo(bounds.minX, bounds.minY + clen);
    ctx.lineTo(bounds.minX, bounds.minY);
    ctx.lineTo(bounds.minX + clen, bounds.minY);
    // Top-right
    ctx.moveTo(bounds.maxX - clen, bounds.minY);
    ctx.lineTo(bounds.maxX, bounds.minY);
    ctx.lineTo(bounds.maxX, bounds.minY + clen);
    // Bottom-right
    ctx.moveTo(bounds.maxX, bounds.maxY - clen);
    ctx.lineTo(bounds.maxX, bounds.maxY);
    ctx.lineTo(bounds.maxX - clen, bounds.maxY);
    // Bottom-left
    ctx.moveTo(bounds.minX + clen, bounds.maxY);
    ctx.lineTo(bounds.minX, bounds.maxY);
    ctx.lineTo(bounds.minX, bounds.maxY - clen);
    ctx.stroke();
  }

  // Grips / Handles for 'corners' and 'box' modes only
  const handles = getResizeHandles(bounds, zoom);
  const handleSize = 7 / zoom;

  ctx.setLineDash([]);
  for (const h of handles) {
    if (h.type === 'rot') {
      if (boxStyle === 'corners') continue; // In corners mode, omit rotation stem
      // Rotation stem & circle
      ctx.beginPath();
      ctx.moveTo(bounds.centerX, bounds.minY);
      ctx.lineTo(h.x, h.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5 / zoom;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(h.x, h.y, handleSize / 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 / zoom;
      ctx.stroke();
    } else {
      // All objects are fully stretchable along both local X and Y axes
      // Highlight all 8 handles with cyan fill and crisp white border
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4 / zoom;

      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    }
  }

  // If a single shelter is selected, render dedicated draggable grips for Door & Feeder Hole
  if (isSingle && single && isShelterObject(single)) {
    const props = single.customProps || {};
    const dWall: 'north' | 'south' | 'east' | 'west' = props.doorWall || 'south';
    const dPct: number = Math.max(10, Math.min(90, props.doorOffset ?? 35));
    const cWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.cableHoleWall ?? 'east';
    const cPct: number = Math.max(10, Math.min(90, props.cableHoleOffset ?? 50));

    // Door Grip in local bounds
    let dGripX = bounds.minX;
    let dGripY = bounds.minY;
    if (dWall === 'south') {
      dGripX = bounds.minX + bounds.width * (dPct / 100);
      dGripY = bounds.maxY;
    } else if (dWall === 'north') {
      dGripX = bounds.minX + bounds.width * (dPct / 100);
      dGripY = bounds.minY;
    } else if (dWall === 'east') {
      dGripX = bounds.maxX;
      dGripY = bounds.minY + bounds.height * (dPct / 100);
    } else {
      dGripX = bounds.minX;
      dGripY = bounds.minY + bounds.height * (dPct / 100);
    }

    const gripRadius = 7.5 / zoom;

    // Draw Door Grip Halo & Handle
    ctx.save();
    ctx.beginPath();
    ctx.arc(dGripX, dGripY, gripRadius + 3 / zoom, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(dGripX, dGripY, gripRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8 / zoom;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(dGripX, dGripY, gripRadius / 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#bae6fd';
    ctx.fill();

    // Floating Badge for Door Grip
    const doorBadgeOffset = dWall === 'north' ? -16 / zoom : 16 / zoom;
    const badgeText = `DOOR (${dWall[0].toUpperCase()} ${dPct}%)`;
    ctx.font = `bold ${Math.max(8, 9 / zoom)}px monospace`;
    const dMetrics = ctx.measureText(badgeText);
    const dbw = dMetrics.width + 8 / zoom;
    const dbh = 14 / zoom;
    const dbx = dGripX - dbw / 2;
    const dby = dGripY + doorBadgeOffset - dbh / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.roundRect(dbx, dby, dbw, dbh, 3 / zoom);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, dGripX, dGripY + doorBadgeOffset);
    ctx.restore();

    // Door Resize Handle & Diameter Badge
    const dWidthMm = Number(props.doorWidthMm ?? props.doorDiameter ?? props.doorDiameterMm ?? 900);
    const dLenPx = Math.max(16, (dWidthMm / 900) * 34);
    let dResizeX = dGripX;
    let dResizeY = dGripY;
    if (dWall === 'south' || dWall === 'north') {
      dResizeX = dGripX + dLenPx;
    } else {
      dResizeY = dGripY + dLenPx;
    }

    const resizeHandleSize = 8 / zoom;
    ctx.save();
    // Diamond shape for door resize handle
    ctx.translate(dResizeX, dResizeY);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6 / zoom;
    ctx.fillRect(-resizeHandleSize / 2, -resizeHandleSize / 2, resizeHandleSize, resizeHandleSize);
    ctx.strokeRect(-resizeHandleSize / 2, -resizeHandleSize / 2, resizeHandleSize, resizeHandleSize);
    ctx.restore();

    // Resize badge
    ctx.save();
    const resizeBadgeText = `⌀ ${dWidthMm}mm`;
    ctx.font = `bold ${Math.max(8, 8.5 / zoom)}px monospace`;
    const rMetrics = ctx.measureText(resizeBadgeText);
    const rbw = rMetrics.width + 6 / zoom;
    const rbh = 12 / zoom;
    const rbx = dResizeX - rbw / 2;
    const rby = dResizeY + doorBadgeOffset - rbh / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.roundRect(rbx, rby, rbw, rbh, 2.5 / zoom);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#67e8f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(resizeBadgeText, dResizeX, dResizeY + doorBadgeOffset);
    ctx.restore();

    // Draw Feeder Hole Grip if enabled
    if (cWall !== 'none') {
      let fGripX = bounds.minX;
      let fGripY = bounds.minY;
      if (cWall === 'south') {
        fGripX = bounds.minX + bounds.width * (cPct / 100);
        fGripY = bounds.maxY;
      } else if (cWall === 'north') {
        fGripX = bounds.minX + bounds.width * (cPct / 100);
        fGripY = bounds.minY;
      } else if (cWall === 'east') {
        fGripX = bounds.maxX;
        fGripY = bounds.minY + bounds.height * (cPct / 100);
      } else {
        fGripX = bounds.minX;
        fGripY = bounds.minY + bounds.height * (cPct / 100);
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(fGripX, fGripY, gripRadius + 3 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(fGripX, fGripY, gripRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#d97706';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8 / zoom;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(fGripX, fGripY, gripRadius / 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a';
      ctx.fill();

      // Floating Badge for Feeder Grip
      const cDia = Number(props.cableHoleDiameterMm ?? props.cableHoleDiameter ?? props.feederDiameter ?? 250);
      const feederBadgeOffset = cWall === 'north' ? -16 / zoom : 16 / zoom;
      const fBadgeText = `FEEDER ⌀${cDia}mm (${cWall[0].toUpperCase()} ${cPct}%)`;
      ctx.font = `bold ${Math.max(8, 9 / zoom)}px monospace`;
      const fMetrics = ctx.measureText(fBadgeText);
      const fbw = fMetrics.width + 8 / zoom;
      const fbh = 14 / zoom;
      const fbx = fGripX - fbw / 2;
      const fby = fGripY + feederBadgeOffset - fbh / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.roundRect(fbx, fby, fbw, fbh, 3 / zoom);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fBadgeText, fGripX, fGripY + feederBadgeOffset);
      ctx.restore();

      // Feeder Resize Handle & Diameter Badge
      const fGlandSpanPx = Math.max(14, Math.min(64, (cDia / 250) * 28));
      let fResizeX = fGripX;
      let fResizeY = fGripY;
      if (cWall === 'south' || cWall === 'north') {
        fResizeX = fGripX + fGlandSpanPx / 2;
      } else {
        fResizeY = fGripY + fGlandSpanPx / 2;
      }

      const fResizeSize = 8 / zoom;
      ctx.save();
      ctx.translate(fResizeX, fResizeY);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6 / zoom;
      ctx.fillRect(-fResizeSize / 2, -fResizeSize / 2, fResizeSize, fResizeSize);
      ctx.strokeRect(-fResizeSize / 2, -fResizeSize / 2, fResizeSize, fResizeSize);
      ctx.restore();

      ctx.save();
      const fResizeBadgeText = `⌀ ${cDia}mm`;
      ctx.font = `bold ${Math.max(8, 8.5 / zoom)}px monospace`;
      const frMetrics = ctx.measureText(fResizeBadgeText);
      const frbw = frMetrics.width + 6 / zoom;
      const frbh = 12 / zoom;
      const frbx = fResizeX - frbw / 2;
      const frby = fResizeY + feederBadgeOffset - frbh / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.roundRect(frbx, frby, frbw, frbh, 2.5 / zoom);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fResizeBadgeText, fResizeX, fResizeY + feederBadgeOffset);
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawSnapIndicator(ctx: CanvasRenderingContext2D, p: Point, zoom: number) {
  ctx.save();
  const s = 6 / zoom;
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2 / zoom;

  // Cyan crosshair circle
  ctx.beginPath();
  ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p.x - s * 1.5, p.y);
  ctx.lineTo(p.x + s * 1.5, p.y);
  ctx.moveTo(p.x, p.y - s * 1.5);
  ctx.lineTo(p.x, p.y + s * 1.5);
  ctx.stroke();

  ctx.restore();
}

function drawMeasurementTooltip(
  ctx: CanvasRenderingContext2D,
  tooltip: { text: string; x: number; y: number }
) {
  ctx.save();
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  const text = tooltip.text;
  const metrics = ctx.measureText(text);
  const padX = 8;
  const padY = 5;
  const tw = metrics.width + padX * 2;
  const th = 22;

  const tx = tooltip.x + 14;
  const ty = tooltip.y + 14;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(tx, ty, tw, th, 4);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, tx + padX, ty + th / 2);
  ctx.restore();
}

function drawEndpointConnectIndicator(
  ctx: CanvasRenderingContext2D,
  snap: { x: number; y: number; end?: 'start' | 'end' },
  zoom: number
) {
  ctx.save();
  const s = 7 / zoom;

  // Glowing emerald connect ring
  ctx.strokeStyle = '#10b981';
  ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.lineWidth = 2.5 / zoom;

  ctx.beginPath();
  ctx.arc(snap.x, snap.y, s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crosshair
  ctx.beginPath();
  ctx.moveTo(snap.x - s * 1.5, snap.y);
  ctx.lineTo(snap.x + s * 1.5, snap.y);
  ctx.moveTo(snap.x, snap.y - s * 1.5);
  ctx.lineTo(snap.x, snap.y + s * 1.5);
  ctx.stroke();

  // High-contrast connect badge
  const badgeText = '✦ CONNECT END';
  const fontSize = Math.max(9, Math.min(13, 11 / zoom));
  ctx.font = `bold ${fontSize}px sans-serif`;
  const tw = ctx.measureText(badgeText).width + 8 / zoom;
  const th = 16 / zoom;
  const bx = snap.x - tw / 2;
  const by = snap.y - s - 18 / zoom;

  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1 / zoom;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 3 / zoom);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#6ee7b7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, snap.x, by + th / 2);

  ctx.restore();
}

function drawArmedStencilGhost(
  ctx: CanvasRenderingContext2D,
  preview: { name: string; width: number; height: number; x: number; y: number; rotation?: number },
  zoom: number,
  settings: ProjectSettings
) {
  ctx.save();
  const { x, y, width: w, height: h, name, rotation = 0 } = preview;
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Apply rotation to the ghost stencil preview if rotated
  if (rotation) {
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // Ghost bounding fill & border
  ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2 / zoom;
  ctx.setLineDash([6 / zoom, 4 / zoom]);
  ctx.strokeRect(x, y, w, h);

  // Center crosshair
  ctx.setLineDash([]);
  ctx.lineWidth = 1 / zoom;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 10 / zoom, y + h / 2);
  ctx.lineTo(x + w / 2 + 10 / zoom, y + h / 2);
  ctx.moveTo(x + w / 2, y + h / 2 - 10 / zoom);
  ctx.lineTo(x + w / 2, y + h / 2 + 10 / zoom);
  ctx.stroke();

  // Floating label badge
  const dimStr = `${(w / settings.scaleFactor).toFixed(1)}m × ${(h / settings.scaleFactor).toFixed(1)}m`;
  const rotBadge = rotation ? ` [${rotation}°]` : '';
  const labelText = `📍 ${name}${rotBadge} (${dimStr})`;
  const hintText = 'Click to place • R to rotate • Esc to cancel';

  const fSize = Math.max(9, Math.min(14, 11 / zoom));
  ctx.font = `bold ${fSize}px sans-serif`;
  const tw = Math.max(ctx.measureText(labelText).width, 140 / zoom) + 16 / zoom;
  const th = 34 / zoom;
  const bx = x + w / 2 - tw / 2;
  const by = y - th - 8 / zoom;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5 / zoom;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 4 / zoom);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(labelText, x + w / 2, by + 12 / zoom);

  ctx.font = `${Math.max(8, Math.min(11, 9 / zoom))}px sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(hintText, x + w / 2, by + 24 / zoom);

  ctx.restore();
}


export {
  renderSelectionOverlay,
  drawSnapIndicator,
  drawMeasurementTooltip,
  drawEndpointConnectIndicator,
  drawArmedStencilGhost
};
