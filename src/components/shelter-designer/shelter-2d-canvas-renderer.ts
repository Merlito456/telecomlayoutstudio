import { InteriorEquipmentItem } from './catalog';

export interface RenderShelter2DOptions {
  roomLengthMm: number;
  roomWidthMm: number;
  shelterHeightM: number;
  wallThickMm: number;
  doorWall: 'north' | 'south' | 'east' | 'west';
  doorOffsetPct: number;
  doorWidthMm: number;
  cableWall: 'north' | 'south' | 'east' | 'west' | 'none';
  cableOffsetPct: number;
  items: InteriorEquipmentItem[];
  selectedItemId: string | null;
  activeOpening?: 'door' | 'feeder' | null;
  cableHoleDiameterMm?: number;
  cableHoleElevationMm?: number;
  renderStyle?: 'photo' | 'cad';
  roofMode?: 'cutaway' | 'transparent' | 'solid';
}

export function renderShelter2D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: RenderShelter2DOptions
): void {
  const {
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
    renderStyle = 'photo',
    roofMode = 'cutaway',
  } = options;

  const isCad = renderStyle === 'cad';

  // Background
  ctx.fillStyle = isCad ? '#061324' : '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Coordinate mapping
  const margin = 70;
  const availW = w - margin * 2;
  const availH = h - margin * 2;
  const scale = Math.min(availW / roomLengthMm, availH / roomWidthMm);

  const roomPxW = roomLengthMm * scale;
  const roomPxH = roomWidthMm * scale;
  const originX = (w - roomPxW) / 2;
  const originY = (h - roomPxH) / 2;
  const wallPxT = wallThickMm * scale;

  // 1. Grid lines on room floor (Technical blueprint grid in CAD mode)
  ctx.strokeStyle = isCad ? 'rgba(14, 165, 233, 0.2)' : '#1e293b';
  ctx.lineWidth = isCad ? 0.75 : 0.5;
  for (let gx = 0; gx <= roomLengthMm; gx += 200) {
    const px = originX + gx * scale;
    ctx.beginPath();
    ctx.moveTo(px, originY);
    ctx.lineTo(px, originY + roomPxH);
    ctx.stroke();
  }
  for (let gy = 0; gy <= roomWidthMm; gy += 200) {
    const py = originY + gy * scale;
    ctx.beginPath();
    ctx.moveTo(originX, py);
    ctx.lineTo(originX + roomPxW, py);
    ctx.stroke();
  }

  // 2. Room Floor Slab
  ctx.fillStyle = isCad ? '#0a1d36' : '#0f172a';
  ctx.fillRect(originX, originY, roomPxW, roomPxH);

  // ESD Raised Floor Tile pattern (600x600mm)
  ctx.strokeStyle = isCad ? 'rgba(56, 189, 248, 0.16)' : 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let fx = 0; fx <= roomLengthMm; fx += 600) {
    const px = originX + fx * scale;
    ctx.beginPath();
    ctx.moveTo(px, originY);
    ctx.lineTo(px, originY + roomPxH);
    ctx.stroke();
  }
  for (let fy = 0; fy <= roomWidthMm; fy += 600) {
    const py = originY + fy * scale;
    ctx.beginPath();
    ctx.moveTo(originX, py);
    ctx.lineTo(originX + roomPxW, py);
    ctx.stroke();
  }

  // 3. Recommended Telecom Maintenance Walkways (Aisles)
  ctx.strokeStyle = isCad ? 'rgba(56, 189, 248, 0.4)' : 'rgba(234, 179, 8, 0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(
    originX + 200 * scale,
    originY + 200 * scale,
    roomPxW - 400 * scale,
    roomPxH - 400 * scale
  );
  ctx.setLineDash([]);

  // 4. Architectural Roof Eave Overhang Footprint (Outer boundary only, never covers interior)
  const eaveOverhangPx = 250 * scale; // 250mm overhang
  ctx.save();
  ctx.strokeStyle = isCad ? 'rgba(56, 189, 248, 0.55)' : 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(
    originX - wallPxT - eaveOverhangPx,
    originY - wallPxT - eaveOverhangPx,
    roomPxW + (wallPxT + eaveOverhangPx) * 2,
    roomPxH + (wallPxT + eaveOverhangPx) * 2
  );
  ctx.setLineDash([]);
  ctx.font = 'bold 7.5px monospace';
  ctx.fillStyle = isCad ? '#38bdf8' : '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText(
    `ROOF EAVE (+250mm) • ${roofMode.toUpperCase()} (INTERIOR VISIBLE)`,
    originX + roomPxW + wallPxT + eaveOverhangPx,
    originY - wallPxT - eaveOverhangPx - 3
  );
  ctx.restore();

  // 5. Perimeter Walls
  ctx.fillStyle = isCad ? '#0f294d' : '#1e293b';
  ctx.strokeStyle = isCad ? '#38bdf8' : '#64748b';
  ctx.lineWidth = 2;

  ctx.fillRect(originX - wallPxT, originY - wallPxT, roomPxW + wallPxT * 2, wallPxT);
  ctx.strokeRect(originX - wallPxT, originY - wallPxT, roomPxW + wallPxT * 2, wallPxT);

  ctx.fillRect(originX - wallPxT, originY + roomPxH, roomPxW + wallPxT * 2, wallPxT);
  ctx.strokeRect(originX - wallPxT, originY + roomPxH, roomPxW + wallPxT * 2, wallPxT);

  ctx.fillRect(originX - wallPxT, originY, wallPxT, roomPxH);
  ctx.strokeRect(originX - wallPxT, originY, wallPxT, roomPxH);

  ctx.fillRect(originX + roomPxW, originY, wallPxT, roomPxH);
  ctx.strokeRect(originX + roomPxW, originY, wallPxT, roomPxH);

  // 6. Door Opening & Swing Arc (Draggable along any wall)
  const dWidthPx = doorWidthMm * scale;
  const isDoorSelected = activeOpening === 'door';
  const doorColor = isDoorSelected ? '#38bdf8' : isCad ? '#38bdf8' : '#0ea5e9';
  let doorGripX = 0;
  let doorGripY = 0;

  if (doorWall === 'south') {
    const dX = originX + roomPxW * (doorOffsetPct / 100) - dWidthPx / 2;
    const dY = originY + roomPxH;
    doorGripX = dX + dWidthPx / 2;
    doorGripY = dY + wallPxT / 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dX, dY - 1, dWidthPx, wallPxT + 3);
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = isDoorSelected ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(dX, dY);
    ctx.lineTo(dX, dY + dWidthPx);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(dX, dY, dWidthPx, 0, Math.PI / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DOOR ${doorWidthMm}mm (${Math.round(doorOffsetPct)}%)`, dX + dWidthPx / 2, dY + wallPxT + 16);
  } else if (doorWall === 'north') {
    const dX = originX + roomPxW * (doorOffsetPct / 100) - dWidthPx / 2;
    const dY = originY - wallPxT;
    doorGripX = dX + dWidthPx / 2;
    doorGripY = dY + wallPxT / 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dX, dY - 2, dWidthPx, wallPxT + 3);
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = isDoorSelected ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(dX, dY + wallPxT);
    ctx.lineTo(dX, dY - dWidthPx + wallPxT);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(dX, dY + wallPxT, dWidthPx, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DOOR ${doorWidthMm}mm (${Math.round(doorOffsetPct)}%)`, dX + dWidthPx / 2, dY - 8);
  } else if (doorWall === 'east') {
    const dX = originX + roomPxW;
    const dY = originY + roomPxH * (doorOffsetPct / 100) - dWidthPx / 2;
    doorGripX = dX + wallPxT / 2;
    doorGripY = dY + dWidthPx / 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dX - 1, dY, wallPxT + 3, dWidthPx);
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = isDoorSelected ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(dX, dY);
    ctx.lineTo(dX + dWidthPx, dY);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(dX, dY, dWidthPx, 0, Math.PI / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`DOOR (${Math.round(doorOffsetPct)}%)`, dX + wallPxT + 8, dY + dWidthPx / 2 + 3);
  } else {
    const dX = originX - wallPxT;
    const dY = originY + roomPxH * (doorOffsetPct / 100) - dWidthPx / 2;
    doorGripX = dX + wallPxT / 2;
    doorGripY = dY + dWidthPx / 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dX - 2, dY, wallPxT + 3, dWidthPx);
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = isDoorSelected ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(dX + wallPxT, dY);
    ctx.lineTo(dX + wallPxT - dWidthPx, dY);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(dX + wallPxT, dY, dWidthPx, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`DOOR (${Math.round(doorOffsetPct)}%)`, dX - 8, dY + dWidthPx / 2 + 3);
  }

  // Interactive Door Drag Handle Pill
  ctx.save();
  ctx.fillStyle = isDoorSelected ? '#38bdf8' : '#0284c7';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(doorGripX, doorGripY, isDoorSelected ? 7 : 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Interactive Door Resize Handle (Diamond) at the opening edge
  let doorResizeX = doorGripX;
  let doorResizeY = doorGripY;
  if (doorWall === 'south' || doorWall === 'north') {
    doorResizeX = doorGripX + dWidthPx / 2;
  } else {
    doorResizeY = doorGripY + dWidthPx / 2;
  }

  ctx.save();
  ctx.translate(doorResizeX, doorResizeY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = isDoorSelected ? '#06b6d4' : '#0284c7';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  const rhSize = isDoorSelected ? 8.5 : 6.5;
  ctx.fillRect(-rhSize / 2, -rhSize / 2, rhSize, rhSize);
  ctx.strokeRect(-rhSize / 2, -rhSize / 2, rhSize, rhSize);
  ctx.restore();

  // Floating resize badge if door is selected
  if (isDoorSelected) {
    ctx.save();
    const rBadge = `⌀ ${doorWidthMm}mm • Drag ❖ to resize`;
    ctx.font = 'bold 9.5px sans-serif';
    const rMetrics = ctx.measureText(rBadge);
    const rbw = rMetrics.width + 10;
    const rbh = 16;
    const rbx = doorResizeX - rbw / 2;
    const rby = doorWall === 'north' ? doorResizeY - 24 : doorResizeY + 14;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rbx, rby, rbw, rbh, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#67e8f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rBadge, doorResizeX, rby + rbh / 2);
    ctx.restore();
  }

  // 6. Cable Feedthrough Gland Plate / Feeder Hole (Draggable along any wall)
  if (cableWall !== 'none') {
    const feederDia = options.cableHoleDiameterMm || 250;
    const feederElevMm =
      options.cableHoleElevationMm ??
      Math.round(shelterHeightM * 1000 - 350);
    const cW = Math.max(14, feederDia * scale);
    const isFeederSelected = activeOpening === 'feeder';
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = isFeederSelected ? '#ffffff' : '#fbbf24';
    ctx.lineWidth = isFeederSelected ? 2.5 : 1.5;
    let fGripX = 0;
    let fGripY = 0;

    const feederTag = `FEEDER ⌀${feederDia}mm • +${(feederElevMm / 1000).toFixed(2)}m (${Math.round(cableOffsetPct)}%)`;

    if (cableWall === 'east') {
      const cy = originY + roomPxH * (cableOffsetPct / 100) - cW / 2;
      const gx = originX + roomPxW - 4;
      const gw = wallPxT + 8;
      fGripX = gx + gw / 2;
      fGripY = cy + cW / 2;
      ctx.fillRect(gx, cy, gw, cW);
      ctx.strokeRect(gx, cy, gw, cW);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(feederTag, gx + gw + 6, fGripY + 3);
    } else if (cableWall === 'west') {
      const cy = originY + roomPxH * (cableOffsetPct / 100) - cW / 2;
      const gx = originX - wallPxT - 4;
      const gw = wallPxT + 8;
      fGripX = gx + gw / 2;
      fGripY = cy + cW / 2;
      ctx.fillRect(gx, cy, gw, cW);
      ctx.strokeRect(gx, cy, gw, cW);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(feederTag, gx - 6, fGripY + 3);
    } else if (cableWall === 'north') {
      const cx = originX + roomPxW * (cableOffsetPct / 100) - cW / 2;
      const gy = originY - wallPxT - 4;
      const gh = wallPxT + 8;
      fGripX = cx + cW / 2;
      fGripY = gy + gh / 2;
      ctx.fillRect(cx, gy, cW, gh);
      ctx.strokeRect(cx, gy, cW, gh);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(feederTag, fGripX, gy - 6);
    } else {
      const cx = originX + roomPxW * (cableOffsetPct / 100) - cW / 2;
      const gy = originY + roomPxH - 4;
      const gh = wallPxT + 8;
      fGripX = cx + cW / 2;
      fGripY = gy + gh / 2;
      ctx.fillRect(cx, gy, cW, gh);
      ctx.strokeRect(cx, gy, cW, gh);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(feederTag, fGripX, gy + gh + 12);
    }

    // Interactive Feeder Hole Drag Handle
    ctx.save();
    ctx.fillStyle = isFeederSelected ? '#fef08a' : '#f59e0b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(fGripX, fGripY, isFeederSelected ? 6.5 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Interactive Feeder Hole Resize Handle
    let fResizeX = fGripX;
    let fResizeY = fGripY;
    if (cableWall === 'south' || cableWall === 'north') {
      fResizeX = fGripX + cW / 2;
    } else {
      fResizeY = fGripY + cW / 2;
    }

    ctx.save();
    ctx.translate(fResizeX, fResizeY);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = isFeederSelected ? '#f59e0b' : '#d97706';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    const frhSize = isFeederSelected ? 8.5 : 6.5;
    ctx.fillRect(-frhSize / 2, -frhSize / 2, frhSize, frhSize);
    ctx.strokeRect(-frhSize / 2, -frhSize / 2, frhSize, frhSize);
    ctx.restore();

    if (isFeederSelected) {
      ctx.save();
      const frBadge = `⌀ ${feederDia}mm • +${(feederElevMm / 1000).toFixed(2)}m • Drag ❖ to resize`;
      ctx.font = 'bold 9.5px sans-serif';
      const frMetrics = ctx.measureText(frBadge);
      const frbw = frMetrics.width + 10;
      const frbh = 16;
      const frbx = fResizeX - frbw / 2;
      const frby = cableWall === 'north' ? fResizeY - 24 : fResizeY + 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(frbx, frby, frbw, frbh, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frBadge, fResizeX, frby + frbh / 2);
      ctx.restore();
    }
  }

  // 7. Render Placed Interior Equipment (Floor-Mounted First, Overhead Cable Ladders ON TOP)
  const isLadderItem = (item: any) =>
    item.category === 'ladder' ||
    String(item.stencilId || '').toLowerCase().includes('ladder') ||
    String(item.name || '').toLowerCase().includes('ladder') ||
    String(item.stencilId || '').toLowerCase().includes('raceway');

  const floorItems = items.filter((i) => !isLadderItem(i));
  const ladderItems = items.filter((i) => isLadderItem(i));

  // Render floor equipment first
  floorItems.forEach((item) => {
    const isSelected = item.id === selectedItemId;
    const itmPxW = item.widthMm * scale;
    const itmPxD = item.depthMm * scale;
    const itmPxX = originX + item.xMm * scale;
    const itmPxY = originY + item.yMm * scale;

    ctx.save();
    ctx.translate(itmPxX + itmPxW / 2, itmPxY + itmPxD / 2);
    ctx.rotate((item.rotationDeg * Math.PI) / 180);

    const sId = String(item.stencilId || '').toLowerCase();
    const isAC =
      item.category === 'cooling' ||
      sId.includes('ac') ||
      sId.includes('split') ||
      item.name.toLowerCase().includes('ac') ||
      item.name.toLowerCase().includes('air conditioner');

    if (isCad && !isAC) {
      ctx.save();
      const clrDepthPx = 900 * scale; // 900mm standard aisle clearance
      ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.fillRect(-itmPxW / 2, itmPxD / 2, itmPxW, clrDepthPx);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(-itmPxW / 2, itmPxD / 2, itmPxW, clrDepthPx);
      ctx.setLineDash([]);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '6.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('900mm AISLE', 0, itmPxD / 2 + clrDepthPx / 2 + 2);
      ctx.restore();
    }

    if (isAC) {
      const elevM = ((item.elevationMm ?? 2200) / 1000).toFixed(2);
      // 1. Wall Mounting Bracket (against top/rear edge)
      ctx.fillStyle = '#334155';
      ctx.fillRect(-itmPxW / 2 + 2, -itmPxD / 2, itmPxW - 4, 3.5);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-itmPxW / 2 + 2, -itmPxD / 2, itmPxW - 4, 3.5);

      // Bracket wall anchor bolts
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-itmPxW / 2 + 4, -itmPxD / 2 + 1, 2, 2);
      ctx.fillRect(itmPxW / 2 - 6, -itmPxD / 2 + 1, 2, 2);

      // 2. Main AC Evaporator Housing
      ctx.fillStyle = isCad ? '#091c33' : '#f8fafc';
      ctx.fillRect(-itmPxW / 2, -itmPxD / 2 + 3.5, itmPxW, itmPxD - 3.5);

      ctx.strokeStyle = isSelected ? '#38bdf8' : isCad ? '#38bdf8' : '#0284c7';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeRect(-itmPxW / 2, -itmPxD / 2 + 3.5, itmPxW, itmPxD - 3.5);

      if (isSelected) {
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.strokeRect(-itmPxW / 2, -itmPxD / 2 + 3.5, itmPxW, itmPxD - 3.5);
        ctx.shadowBlur = 0;
      }

      // 3. Return Air Intake Grille Slats (Top surface)
      ctx.strokeStyle = isCad ? 'rgba(56, 189, 248, 0.5)' : '#94a3b8';
      ctx.lineWidth = 0.8;
      const grilleY1 = -itmPxD / 2 + 7;
      const grilleY2 = -itmPxD / 2 + 10;
      ctx.beginPath();
      ctx.moveTo(-itmPxW / 2 + 6, grilleY1);
      ctx.lineTo(itmPxW / 2 - 6, grilleY1);
      ctx.moveTo(-itmPxW / 2 + 6, grilleY2);
      ctx.lineTo(itmPxW / 2 - 6, grilleY2);
      ctx.stroke();

      // 4. Motorized Supply Air Discharge Louver (Bottom face)
      ctx.fillStyle = isCad ? '#0284c7' : '#e0f2fe';
      ctx.fillRect(-itmPxW / 2 + 4, itmPxD / 2 - 6, itmPxW - 8, 4.5);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(-itmPxW / 2 + 4, itmPxD / 2 - 6, itmPxW - 8, 4.5);

      // Cool airflow arrows discharging into room
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      for (const ax of [-itmPxW * 0.28, 0, itmPxW * 0.28]) {
        ctx.beginPath();
        ctx.moveTo(ax, itmPxD / 2 - 1.5);
        ctx.lineTo(ax, itmPxD / 2 + 4);
        ctx.lineTo(ax - 2, itmPxD / 2 + 2);
        ctx.moveTo(ax, itmPxD / 2 + 4);
        ctx.lineTo(ax + 2, itmPxD / 2 + 2);
        ctx.stroke();
      }

      // 5. Digital Temperature Display (e.g. 20°C in Cyan)
      ctx.fillStyle = '#082f49';
      ctx.fillRect(itmPxW / 2 - 20, -itmPxD / 2 + 12, 16, 6.5);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(itmPxW / 2 - 20, -itmPxD / 2 + 12, 16, 6.5);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 5.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.targetTempC ?? 20}°C`, itmPxW / 2 - 12, -itmPxD / 2 + 15.5);

      // Power Green LED
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(itmPxW / 2 - 23, -itmPxD / 2 + 15.5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 6. Central Tag & Elevation Badge
      ctx.fillStyle = isCad ? '#e0f2fe' : '#0f172a';
      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WALL AC', -8, -2);

      // Floating Elevation Badge
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText(`▲ +${elevM}m`, -8, 7);
    } else if (
      item.category === 'rectifier' ||
      sId.startsWith('rectifier-') ||
      item.customProps?.isRectifierSystem
    ) {
      // Rectifier System (-48V DC Telecom Power Plant with Lithium Batteries)
      const brand = (
        item.customProps?.brand ||
        (sId.includes('ericsson')
          ? 'Ericsson'
          : sId.includes('eltek')
          ? 'Eltek'
          : sId.includes('zte')
          ? 'ZTE'
          : sId.includes('huawei')
          ? 'Huawei'
          : sId.includes('vertiv')
          ? 'Vertiv'
          : sId.includes('delta')
          ? 'Delta'
          : 'Ericsson')
      );

      ctx.fillStyle = isCad ? '#07162c' : '#0f172a';
      ctx.fillRect(-itmPxW / 2, -itmPxD / 2, itmPxW, itmPxD);
      ctx.strokeStyle = isSelected ? '#38bdf8' : isCad ? '#38bdf8' : item.strokeColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeRect(-itmPxW / 2, -itmPxD / 2, itmPxW, itmPxD);

      if (isSelected) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.strokeRect(-itmPxW / 2, -itmPxD / 2, itmPxW, itmPxD);
        ctx.shadowBlur = 0;
      }

      // Vertical mounting rails
      ctx.fillStyle = '#334155';
      ctx.fillRect(-itmPxW / 2 + 2, -itmPxD / 2 + 2, 2.5, itmPxD - 4);
      ctx.fillRect(itmPxW / 2 - 4.5, -itmPxD / 2 + 2, 2.5, itmPxD - 4);

      // Top PDU breaker row
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-itmPxW / 2 + 5, -itmPxD / 2 + 2, itmPxW - 10, 5);
      for (let b = 0; b < 6; b++) {
        const bx = -itmPxW / 2 + 6 + b * ((itmPxW - 12) / 6);
        ctx.fillStyle = b % 2 === 0 ? '#38bdf8' : '#ef4444';
        ctx.fillRect(bx, -itmPxD / 2 + 3, (itmPxW - 12) / 7 - 1, 3);
      }

      // Rectifier module ventilation circles
      const numMods = 4;
      const mStep = (itmPxW - 12) / numMods;
      for (let m = 0; m < numMods; m++) {
        const mx = -itmPxW / 2 + 6 + m * mStep + mStep / 2;
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(mx, -itmPxD / 2 + 10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Stacked battery bank terminals (+ Red, - Blue)
      const termY = itmPxD / 2 - 8;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-itmPxW / 2 + 6, termY, 3, 3);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-itmPxW / 2 + 11, termY, 3, 3);

      // Bayface only - no door enclosure

      // Brand and specification text
      ctx.fillStyle = isSelected ? '#ffffff' : '#38bdf8';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${brand.toUpperCase()} RS`, 0, 0);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '6px monospace';
      const uH = item.uHeight || Math.round((item.heightMm - 130) / 44.45);
      ctx.fillText(`-48V · ${uH}U (${(item.heightMm / 1000).toFixed(1)}m)`, 0, 8);
    } else {
      ctx.fillStyle = isCad ? '#0f294d' : item.color;
      ctx.fillRect(-itmPxW / 2, -itmPxD / 2, itmPxW, itmPxD);

      ctx.strokeStyle = isSelected ? '#38bdf8' : isCad ? '#38bdf8' : item.strokeColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeRect(-itmPxW / 2, -itmPxD / 2, itmPxW, itmPxD);

      if (isSelected) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.strokeRect(-itmPxW / 2, -itmPxD / 2, itmPxW, itmPxD);
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#090d16';
      ctx.fillRect(-itmPxW / 2 + 3, itmPxD / 2 - 6, itmPxW - 6, 4);
      ctx.strokeStyle = item.strokeColor;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-itmPxW / 2 + 3, itmPxD / 2 - 6, itmPxW - 6, 4);

      ctx.fillStyle = '#334155';
      ctx.fillRect(-itmPxW / 2 + 4, -itmPxD / 2 + 6, 3, itmPxD - 16);
      ctx.fillRect(itmPxW / 2 - 7, -itmPxD / 2 + 6, 3, itmPxD - 16);

      ctx.fillStyle = isSelected ? '#38bdf8' : item.strokeColor;
      ctx.beginPath();
      ctx.moveTo(0, itmPxD / 2 - 2);
      ctx.lineTo(-4, itmPxD / 2 - 8);
      ctx.lineTo(4, itmPxD / 2 - 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelShort = item.uHeight ? `${item.uHeight}U` : item.name.split(' ')[0];
      ctx.fillText(labelShort, 0, -2);
    }

    if (isSelected) {
      // On-canvas delete button (top-right corner of equipment)
      ctx.save();
      const delBtnX = itmPxW / 2 + 10;
      const delBtnY = -itmPxD / 2 - 10;
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(delBtnX, delBtnY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(delBtnX - 3.5, delBtnY - 3.5);
      ctx.lineTo(delBtnX + 3.5, delBtnY + 3.5);
      ctx.moveTo(delBtnX + 3.5, delBtnY - 3.5);
      ctx.lineTo(delBtnX - 3.5, delBtnY + 3.5);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  });

  // Render overhead cable ladders ON TOP of floor equipment
  ladderItems.forEach((item) => {
    const isSelected = item.id === selectedItemId;
    const itmPxW = item.widthMm * scale;
    const itmPxD = item.depthMm * scale;
    const itmPxX = originX + item.xMm * scale;
    const itmPxY = originY + item.yMm * scale;

    ctx.save();
    ctx.translate(itmPxX + itmPxW / 2, itmPxY + itmPxD / 2);
    ctx.rotate((item.rotationDeg * Math.PI) / 180);

    const isVert = itmPxD > itmPxW;
    const spanW = isVert ? itmPxD : itmPxW;
    const spanH = isVert ? itmPxW : itmPxD;
    if (isVert) {
      ctx.rotate(Math.PI / 2);
    }

    // Selection highlight if selected
    if (isSelected) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(-spanW / 2, -spanH / 2, spanW, spanH);
    }

    // Parallel outer stringer rails
    ctx.strokeStyle = isSelected ? '#38bdf8' : '#facc15';
    ctx.lineWidth = isSelected ? 2.5 : 2.0;
    ctx.beginPath();
    ctx.moveTo(-spanW / 2, -spanH / 2);
    ctx.lineTo(spanW / 2, -spanH / 2);
    ctx.moveTo(-spanW / 2, spanH / 2);
    ctx.lineTo(spanW / 2, spanH / 2);
    ctx.stroke();

    // End caps
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-spanW / 2, -spanH / 2);
    ctx.lineTo(-spanW / 2, spanH / 2);
    ctx.moveTo(spanW / 2, -spanH / 2);
    ctx.lineTo(spanW / 2, spanH / 2);
    ctx.stroke();

    // Cross rungs
    ctx.lineWidth = 1.2;
    const rungStep = Math.max(7, Math.min(14, spanW / Math.max(3, Math.round(spanW / 12))));
    ctx.strokeStyle = isSelected ? '#7dd3fc' : '#e2e8f0';
    ctx.beginPath();
    for (let rx = -spanW / 2 + rungStep; rx < spanW / 2 - 2; rx += rungStep) {
      ctx.moveTo(rx, -spanH / 2);
      ctx.lineTo(rx, spanH / 2);
    }
    ctx.stroke();

    // Drop-rod ceiling support markers
    const hangerX = [-spanW * 0.35, 0, spanW * 0.35];
    ctx.fillStyle = '#38bdf8';
    hangerX.forEach((hx) => {
      ctx.beginPath();
      ctx.arc(hx, -spanH / 2 - 1.5, 2, 0, Math.PI * 2);
      ctx.arc(hx, spanH / 2 + 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Badge label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`LADDER ${(item.widthMm / 1000).toFixed(2)}m (+${(shelterHeightM - 0.09).toFixed(2)}m)`, 0, -spanH / 2 - 6);

    // Interactive expansion handles & controls if selected
    if (isSelected) {
      const origSpanW = itmPxW;
      // Right end expansion handle
      ctx.save();
      ctx.translate(spanW / 2, 0);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      const rhSize = 9;
      ctx.fillRect(-rhSize / 2, -rhSize / 2, rhSize, rhSize);
      ctx.strokeRect(-rhSize / 2, -rhSize / 2, rhSize, rhSize);
      ctx.restore();

      // Left end expansion handle
      ctx.save();
      ctx.translate(-spanW / 2, 0);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-rhSize / 2, -rhSize / 2, rhSize, rhSize);
      ctx.strokeRect(-rhSize / 2, -rhSize / 2, rhSize, rhSize);
      ctx.restore();

      // Floating length badge at bottom of ladder
      ctx.save();
      const rBadge = `↔ ${(item.widthMm / 1000).toFixed(2)}m (${item.widthMm}mm) • Drag ❖ to expand`;
      ctx.font = 'bold 9.5px sans-serif';
      const rMetrics = ctx.measureText(rBadge);
      const rbw = rMetrics.width + 12;
      const rbh = 17;
      const rbx = -rbw / 2;
      const rby = spanH / 2 + 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(rbx, rby, rbw, rbh, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rBadge, 0, rby + rbh / 2);
      ctx.restore();

      // On-canvas delete button (top-right corner of bounding box)
      ctx.save();
      const delBtnX = spanW / 2 + 12;
      const delBtnY = -spanH / 2 - 12;
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(delBtnX, delBtnY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(delBtnX - 3.5, delBtnY - 3.5);
      ctx.lineTo(delBtnX + 3.5, delBtnY + 3.5);
      ctx.moveTo(delBtnX + 3.5, delBtnY - 3.5);
      ctx.lineTo(delBtnX - 3.5, delBtnY + 3.5);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  });

  // 8. Dimension badges around room
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${(roomLengthMm / 1000).toFixed(2)} m (${roomLengthMm} mm)`,
    originX + roomPxW / 2,
    originY - wallPxT - 14
  );
  ctx.save();
  ctx.translate(originX - wallPxT - 18, originY + roomPxH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${(roomWidthMm / 1000).toFixed(2)} m (${roomWidthMm} mm)`, 0, 0);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(
    `Shelter Height: ${shelterHeightM.toFixed(2)}m (${Math.round(shelterHeightM * 1000)}mm)`,
    originX,
    originY + roomPxH + wallPxT + 30
  );
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.fillText(
    `Floor Area: ${((roomLengthMm * roomWidthMm) / 1000000).toFixed(2)} m² | Clearance: 900mm front aisle`,
    originX,
    originY + roomPxH + wallPxT + 46
  );
}
