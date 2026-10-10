import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors, drawCADCenterCrosshair, drawCADConcreteHatch, drawCADDiagonalHatch } from "./common";

export function renderEngineeringShelter(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'shelter':
    case 'cement-shelter': {
      const wallT = 10;
      const doorW = 40;

      // Outer Foundation Slab with Concrete Hatch
      ctx.fillStyle = colors.fillLight;
      ctx.fillRect(-3, -3, w + 6, h + 6);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.strokeRect(-3, -3, w + 6, h + 6);
      drawCADConcreteHatch(ctx, -3, -3, w + 6, h + 6, colors.hatch);

      // Architectural Double-Line Exterior Walls
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, w, h);

      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wallT, wallT, w - wallT * 2, h - wallT * 2);

      // Wall Core Hatch (Masonry/Cavity 45° diagonal hatching)
      drawCADDiagonalHatch(ctx, 0, 0, w, wallT, 6, colors.hatch);
      drawCADDiagonalHatch(ctx, 0, h - wallT, w, wallT, 6, colors.hatch);
      drawCADDiagonalHatch(ctx, 0, wallT, wallT, h - wallT * 2, 6, colors.hatch);
      drawCADDiagonalHatch(ctx, w - wallT, wallT, wallT, h - wallT * 2, 6, colors.hatch);

      // Interior floor space
      ctx.fillStyle = colors.fill;
      ctx.fillRect(wallT, wallT, w - wallT * 2, h - wallT * 2);

      const props = obj.customProps || {};
      const doorWall: 'north' | 'south' | 'east' | 'west' = props.doorWall || 'south';
      const doorOffsetPct: number = Math.max(10, Math.min(90, props.doorOffset ?? 35));
      const cableWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.cableHoleWall ?? 'east';
      const cableOffsetPct: number = Math.max(10, Math.min(90, props.cableHoleOffset ?? 50));
      const airconWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.airconWall ?? 'none';
      const airconOffsetPct: number = Math.max(10, Math.min(90, props.airconOffset ?? 50));
      const isDoorOpen = obj.doorsOpen === true || props.doorsOpen === true;
      const doorWidthMm = Number(props.doorWidthMm ?? props.doorDiameter ?? props.doorDiameterMm ?? 900);
      const wallSpanForDoor = doorWall === 'north' || doorWall === 'south' ? w : h;
      const maxBlueprintDoorLen = Math.max(16, wallSpanForDoor - wallT * 2 - 8);
      const customDoorLen = Math.max(16, Math.min(maxBlueprintDoorLen, (doorWidthMm / 900) * 34));

      // 1. Dynamic Architectural Door on any wall (North, South, East, West)
      let doorX = 0;
      let doorY = 0;
      let cutX = 0;
      let cutY = 0;
      let cutW = 0;
      let cutH = 0;
      let leafStartX = 0;
      let leafStartY = 0;
      let leafEndX = 0;
      let leafEndY = 0;
      let arcCenterX = 0;
      let arcCenterY = 0;
      let arcStart = 0;
      let arcEnd = 0;

      if (doorWall === 'south') {
        doorX = Math.max(wallT + 4, Math.min(w - wallT - customDoorLen - 4, (w - customDoorLen) * (doorOffsetPct / 100)));
        doorY = h;
        cutX = doorX - 2;
        cutY = h - wallT - 1;
        cutW = customDoorLen + 4;
        cutH = wallT + 2;
        arcCenterX = doorX;
        arcCenterY = h;
        arcStart = 0;
        arcEnd = Math.PI / 2;
        leafStartX = doorX;
        leafStartY = h;
        leafEndX = isDoorOpen ? doorX : doorX + customDoorLen;
        leafEndY = isDoorOpen ? h + customDoorLen : h - wallT / 2;
      } else if (doorWall === 'north') {
        doorX = Math.max(wallT + 4, Math.min(w - wallT - customDoorLen - 4, (w - customDoorLen) * (doorOffsetPct / 100)));
        doorY = 0;
        cutX = doorX - 2;
        cutY = -1;
        cutW = customDoorLen + 4;
        cutH = wallT + 2;
        arcCenterX = doorX;
        arcCenterY = 0;
        arcStart = -Math.PI / 2;
        arcEnd = 0;
        leafStartX = doorX;
        leafStartY = 0;
        leafEndX = isDoorOpen ? doorX : doorX + customDoorLen;
        leafEndY = isDoorOpen ? -customDoorLen : wallT / 2;
      } else if (doorWall === 'east') {
        doorX = w;
        doorY = Math.max(wallT + 4, Math.min(h - wallT - customDoorLen - 4, (h - customDoorLen) * (doorOffsetPct / 100)));
        cutX = w - wallT - 1;
        cutY = doorY - 2;
        cutW = wallT + 2;
        cutH = customDoorLen + 4;
        arcCenterX = w;
        arcCenterY = doorY;
        arcStart = 0;
        arcEnd = Math.PI / 2;
        leafStartX = w;
        leafStartY = doorY;
        leafEndX = isDoorOpen ? w + customDoorLen : w - wallT / 2;
        leafEndY = isDoorOpen ? doorY : doorY + customDoorLen;
      } else {
        // west
        doorX = 0;
        doorY = Math.max(wallT + 4, Math.min(h - wallT - customDoorLen - 4, (h - customDoorLen) * (doorOffsetPct / 100)));
        cutX = -1;
        cutY = doorY - 2;
        cutW = wallT + 2;
        cutH = customDoorLen + 4;
        arcCenterX = 0;
        arcCenterY = doorY;
        arcStart = Math.PI;
        arcEnd = Math.PI * 1.5;
        leafStartX = 0;
        leafStartY = doorY;
        leafEndX = isDoorOpen ? -customDoorLen : wallT / 2;
        leafEndY = isDoorOpen ? doorY : doorY + customDoorLen;
      }

      // Clear door opening wall cutout
      ctx.fillStyle = colors.fill;
      ctx.fillRect(cutX, cutY, cutW, cutH);

      // Door Leaf (Solid line when open or sitting in frame when closed)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leafStartX, leafStartY);
      ctx.lineTo(leafEndX, leafEndY);
      ctx.stroke();

      // Quarter-Circle Swing Arc (Dashed) only when door is open or drafting indicator
      if (isDoorOpen) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(arcCenterX, arcCenterY, customDoorLen, arcStart, arcEnd, false);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Door jamb markers
      ctx.fillStyle = colors.primary;
      if (doorWall === 'south' || doorWall === 'north') {
        ctx.fillRect(doorX - 2, doorWall === 'south' ? h - wallT : 0, 2.5, wallT);
        ctx.fillRect(doorX + customDoorLen, doorWall === 'south' ? h - wallT : 0, 2.5, wallT);
      } else {
        ctx.fillRect(doorWall === 'east' ? w - wallT : 0, doorY - 2, wallT, 2.5);
        ctx.fillRect(doorWall === 'east' ? w - wallT : 0, doorY + customDoorLen, wallT, 2.5);
      }

      // 2. Dynamic Cable Gland Entry Port / Feeder Hole on any wall (East, West, North, South)
      if (cableWall !== 'none') {
        const cableHoleDia = Number(props.cableHoleDiameterMm ?? props.cableHoleDiameter ?? props.feederDiameter ?? 250);
        const glandLen = Math.max(14, Math.min(48, (cableHoleDia / 250) * 28));
        let gx = 0;
        let gy = 0;
        let gw = 0;
        let gh = 0;

        if (cableWall === 'east') {
          gx = w - wallT - 2;
          gy = Math.max(wallT + 4, Math.min(h - wallT - glandLen - 4, (h - glandLen) * (cableOffsetPct / 100)));
          gw = wallT + 4;
          gh = glandLen;
        } else if (cableWall === 'west') {
          gx = -2;
          gy = Math.max(wallT + 4, Math.min(h - wallT - glandLen - 4, (h - glandLen) * (cableOffsetPct / 100)));
          gw = wallT + 4;
          gh = glandLen;
        } else if (cableWall === 'north') {
          gx = Math.max(wallT + 4, Math.min(w - wallT - glandLen - 4, (w - glandLen) * (cableOffsetPct / 100)));
          gy = -2;
          gw = glandLen;
          gh = wallT + 4;
        } else {
          // south
          gx = Math.max(wallT + 4, Math.min(w - wallT - glandLen - 4, (w - glandLen) * (cableOffsetPct / 100)));
          gy = h - wallT - 2;
          gw = glandLen;
          gh = wallT + 4;
        }

        ctx.fillStyle = colors.fillLight;
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gx, gy, gw, gh);

        // Gland penetration points
        ctx.fillStyle = colors.accent;
        if (gw < gh) {
          for (let py = gy + 4; py < gy + gh - 2; py += 6) {
            ctx.beginPath();
            ctx.arc(gx + gw / 2, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          for (let px = gx + 4; px < gx + gw - 2; px += 6) {
            ctx.beginPath();
            ctx.arc(px, gy + gh / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // CAD drafting tag
        if (settings.showObjectLabels !== false) {
          ctx.font = 'bold 5.5px monospace';
          ctx.fillStyle = colors.accent;
          ctx.textAlign = 'center';
          if (cableWall === 'east') ctx.fillText('FEEDER', w + 16, gy + gh / 2 + 2);
          else if (cableWall === 'west') ctx.fillText('FEEDER', -18, gy + gh / 2 + 2);
          else if (cableWall === 'north') ctx.fillText('FEEDER', gx + gw / 2, -5);
          else ctx.fillText('FEEDER', gx + gw / 2, h + 13);
        }
      }

      // 3. Optional Exterior AC Condenser Unit on configured wall (only if explicitly enabled)
      if (airconWall !== 'none' && Boolean(props.showOutdoorCondenser)) {
        const acW = 30;
        const acD = 14;
        let ax = 0;
        let ay = 0;
        let aw = 0;
        let ah = 0;

        if (airconWall === 'north') {
          ax = Math.max(wallT + 2, Math.min(w - wallT - acW - 2, (w - acW) * (airconOffsetPct / 100)));
          ay = -acD - 2;
          aw = acW;
          ah = acD;
        } else if (airconWall === 'south') {
          ax = Math.max(wallT + 2, Math.min(w - wallT - acW - 2, (w - acW) * (airconOffsetPct / 100)));
          ay = h + 2;
          aw = acW;
          ah = acD;
        } else if (airconWall === 'east') {
          ax = w + 2;
          ay = Math.max(wallT + 2, Math.min(h - wallT - acW - 2, (h - acW) * (airconOffsetPct / 100)));
          aw = acD;
          ah = acW;
        } else {
          ax = -acD - 2;
          ay = Math.max(wallT + 2, Math.min(h - wallT - acW - 2, (h - acW) * (airconOffsetPct / 100)));
          aw = acD;
          ah = acW;
        }

        ctx.fillStyle = colors.fillLight;
        ctx.fillRect(ax, ay, aw, ah);
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ax, ay, aw, ah);
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(ax + aw / 2, ay + ah / 2, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Render user-designed interior equipment (if any placed in Shelter Design Studio)
      const interiorObjs: any[] = (obj.interiorObjects || props.interiorObjects || []) as any[];
      const innerW = w - wallT * 2;
      const innerH = h - wallT * 2;
      const roomLenMm =
        (obj as any).shelterLengthM ? Number((obj as any).shelterLengthM) * 1000 :
        props.shelterLengthM ? Number(props.shelterLengthM) * 1000 :
        props.roomLengthMm ? Number(props.roomLengthMm) :
        Math.max(1000, (w / 20) * 1000);
      const roomWidMm =
        (obj as any).shelterWidthM ? Number((obj as any).shelterWidthM) * 1000 :
        props.shelterWidthM ? Number(props.shelterWidthM) * 1000 :
        props.roomWidthMm ? Number(props.roomWidthMm) :
        Math.max(1000, (h / 20) * 1000);
      if (Array.isArray(interiorObjs) && interiorObjs.length > 0) {
        // Separate floor equipment and overhead cable ladders so ladders are drawn ON TOP
        const isLadderItem = (itm: any) => {
          const sId = String(itm.stencilId || itm.customProps?.stencilType || itm.type || '').toLowerCase();
          const name = String(itm.name || itm.text || '').toLowerCase();
          return (
            itm.category === 'ladder' ||
            itm.customProps?.category === 'ladder' ||
            itm.ladderType === 'indoor' ||
            itm.customProps?.ladderType === 'indoor' ||
            itm.customProps?.placement === 'indoor' ||
            sId.includes('ladder') ||
            sId.includes('raceway') ||
            sId.includes('runway') ||
            sId.includes('tray') ||
            sId.includes('in-shelter') ||
            sId.includes('inshelter') ||
            name.includes('ladder') ||
            name.includes('raceway') ||
            name.includes('in-shelter') ||
            name.includes('inshelter')
          );
        };

        const floorItems = interiorObjs.filter((i) => !isLadderItem(i));
        const ladderItems = interiorObjs.filter((i) => isLadderItem(i));

        // 1. Render floor-standing equipment first
        floorItems.forEach((itm) => {
          const xMm = itm.xMm ?? itm.x ?? 300;
          const yMm = itm.yMm ?? itm.y ?? 300;
          const wMm = itm.widthMm ?? itm.customProps?.widthMm ?? 600;
          const dMm = itm.depthMm ?? itm.customProps?.depthMm ?? 600;
          const rotDeg = itm.rotationDeg ?? itm.rotation ?? 0;

          const ix = wallT + (xMm / roomLenMm) * innerW;
          const iy = wallT + (yMm / roomWidMm) * innerH;
          const iw = Math.max(4, (wMm / roomLenMm) * innerW);
          const id = Math.max(4, (dMm / roomWidMm) * innerH);

          ctx.save();
          ctx.translate(ix + iw / 2, iy + id / 2);
          if (rotDeg) {
            ctx.rotate((rotDeg * Math.PI) / 180);
          }
          const itmSId = String(itm.stencilId || itm.customProps?.stencilType || '').toLowerCase();
          const itmName = String(itm.name || itm.text || '').toLowerCase();
          const isAC =
            itm.category === 'cooling' ||
            itmSId.includes('ac') ||
            itmSId.includes('split') ||
            itmName.includes('ac') ||
            itmName.includes('air conditioner');

          if (isAC) {
            const elevM = ((itm.elevationMm ?? 2200) / 1000).toFixed(1);
            // Wall bracket plate
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(-iw / 2 + 1, -id / 2, iw - 2, 2.5);

            // AC unit body
            ctx.fillStyle = colors.fillLight || '#0f172a';
            ctx.fillRect(-iw / 2, -id / 2 + 2, iw, id - 2);
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.4;
            ctx.strokeRect(-iw / 2, -id / 2 + 2, iw, id - 2);

            // Discharge louver line
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-iw / 2 + 2, id / 2 - 2);
            ctx.lineTo(iw / 2 - 2, id / 2 - 2);
            ctx.stroke();

            // Label
            if (settings.showObjectLabels !== false && iw >= 10) {
              ctx.font = 'bold 5.5px monospace';
              ctx.fillStyle = '#38bdf8';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`AC +${elevM}m`, 0, 0);
            }
          } else {
            ctx.fillStyle = itm.fill || itm.color || colors.fillLight || '#0f172a';
            ctx.fillRect(-iw / 2, -id / 2, iw, id);
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 2]);
            ctx.strokeRect(-iw / 2, -id / 2, iw, id);
            ctx.setLineDash([]);
            if (settings.showObjectLabels !== false && iw >= 10) {
              ctx.font = 'bold 5.5px monospace';
              ctx.fillStyle = colors.secondary;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const shortTag = (itm.text || itm.name || 'EQ').split(' ')[0].substring(0, 7);
              ctx.fillText(shortTag, 0, 0);
            }
          }
          ctx.restore();
        });

        // 2. Render overhead cable ladders ON TOP of floor equipment
        ladderItems.forEach((itm) => {
          const xMm = itm.xMm ?? itm.x ?? 300;
          const yMm = itm.yMm ?? itm.y ?? 300;
          const wMm = itm.widthMm ?? itm.customProps?.widthMm ?? 1500;
          const dMm = itm.depthMm ?? itm.customProps?.depthMm ?? 450;
          const rotDeg = itm.rotationDeg ?? itm.rotation ?? 0;

          const ix = wallT + (xMm / roomLenMm) * innerW;
          const iy = wallT + (yMm / roomWidMm) * innerH;
          const iw = Math.max(4, (wMm / roomLenMm) * innerW);
          const id = Math.max(4, (dMm / roomWidMm) * innerH);

          ctx.save();
          ctx.translate(ix + iw / 2, iy + id / 2);
          if (rotDeg) {
            ctx.rotate((rotDeg * Math.PI) / 180);
          }

          // Orient stringers along the longer dimension
          const isVert = id > iw;
          const spanW = isVert ? id : iw;
          const spanH = isVert ? iw : id;
          if (isVert) {
            ctx.rotate(Math.PI / 2);
          }

          // Outer stringer side rails
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(-spanW / 2, -spanH / 2);
          ctx.lineTo(spanW / 2, -spanH / 2);
          ctx.moveTo(-spanW / 2, spanH / 2);
          ctx.lineTo(spanW / 2, spanH / 2);
          ctx.stroke();

          // End caps
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-spanW / 2, -spanH / 2);
          ctx.lineTo(-spanW / 2, spanH / 2);
          ctx.moveTo(spanW / 2, -spanH / 2);
          ctx.lineTo(spanW / 2, spanH / 2);
          ctx.stroke();

          // Cross rungs
          const rungSpacing = Math.max(6, Math.min(12, spanW / Math.max(3, Math.round(spanW / 8))));
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let rx = -spanW / 2 + rungSpacing; rx < spanW / 2 - 2; rx += rungSpacing) {
            ctx.moveTo(rx, -spanH / 2);
            ctx.lineTo(rx, spanH / 2);
          }
          ctx.stroke();

          // Drop-rod ceiling support markers
          const hangerX = [-spanW * 0.35, 0, spanW * 0.35];
          ctx.fillStyle = '#38bdf8';
          hangerX.forEach((hx) => {
            ctx.beginPath();
            ctx.arc(hx, -spanH / 2 - 1, 1.8, 0, Math.PI * 2);
            ctx.arc(hx, spanH / 2 + 1, 1.8, 0, Math.PI * 2);
            ctx.fill();
          });

          // Text label
          if (settings.showObjectLabels !== false && spanW >= 18) {
            ctx.font = 'bold 5.5px monospace';
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('O/H LADDER', 0, -spanH / 2 - 4);
          }

          ctx.restore();
        });
      }

      return true;
    }

    // ==========================================
    // 7. DIESEL GENERATOR (GREEN) (Mechanical CAD Standard)
    // ==========================================
    case 'wall-roof-shade':
    case 'wall-roof-canopy': {
      // Wall attachment ledger bar
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, w, 6);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, 6);

      // Dashed roof canopy projection outline
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(0, 6, w, h - 6);

      // Diagonal rafter cross bracing
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 6);
      ctx.lineTo(0, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Front gutter edge
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h);
      ctx.stroke();

      if (settings.showObjectLabels !== false) {
        ctx.font = 'bold 7.5px monospace';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'center';
        ctx.fillText('ROOF SHADE CANOPY', w / 2, h / 2 + 3);
      }
      return true;
    }

    // ==========================================
    // SHELTER AIR CONDITIONERS (ISO/ASHRAE Standard Architectural Symbol)
    // ==========================================
    case 'air-conditioner':
    case 'wall-mount-ac':
    case 'ac-indoor-split':
    case 'ac-split': {
      const safeW = Math.max(w, 18);
      const safeH = Math.max(h, 7);
      const elevM = ((obj.elevationMm ?? obj.customProps?.elevationMm ?? 2200) / 1000).toFixed(1);
      const temp = obj.customProps?.targetTempC ?? 20;

      // 1. Wall bracket backplate (against wall side at top)
      const bracketH = Math.min(2.0, safeH * 0.22);
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(1.5, 0, safeW - 3, bracketH);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
      ctx.strokeRect(1.5, 0, safeW - 3, bracketH);

      // Anchor bolts
      ctx.fillStyle = colors.accent;
      ctx.fillRect(3.5, 0.4, 1.2, bracketH - 0.8);
      ctx.fillRect(safeW - 4.7, 0.4, 1.2, bracketH - 0.8);

      // 2. AC Main Chassis Body
      const bodyY = bracketH * 0.7;
      const bodyH = safeH - bodyY;
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, bodyY, safeW, bodyH);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(0, bodyY, safeW, bodyH);

      // 3. Top Return-Air Grille hatching
      const grilleW = safeW * 0.65;
      const grilleH = Math.max(1.8, safeH * 0.28);
      const grilleX = (safeW - grilleW) / 2;
      const grilleY = bodyY + 0.8;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 0.7;
      ctx.strokeRect(grilleX, grilleY, grilleW, grilleH);

      const slatCount = Math.max(2, Math.min(4, Math.floor(grilleH / 0.9)));
      const slatSpacing = grilleH / (slatCount + 1);
      ctx.beginPath();
      for (let s = 1; s <= slatCount; s++) {
        const sy = grilleY + s * slatSpacing;
        ctx.moveTo(grilleX + 1, sy);
        ctx.lineTo(grilleX + grilleW - 1, sy);
      }
      ctx.stroke();

      // 4. Bottom Supply-Air Louver & Directional Airflow Arrows into room
      const louverH = Math.max(1.6, safeH * 0.24);
      const louverY = safeH - louverH - 0.4;
      const louverW = safeW - 4;
      const louverX = 2;
      ctx.fillStyle = colors.fillLight || '#082f49';
      ctx.fillRect(louverX, louverY, louverW, louverH);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(louverX, louverY, louverW, louverH);

      // Airflow chevrons discharging outward (+Y)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.8;
      for (const ax of [safeW * 0.3, safeW * 0.5, safeW * 0.7]) {
        ctx.beginPath();
        ctx.moveTo(ax, louverY + louverH);
        ctx.lineTo(ax, safeH + 2.5);
        ctx.lineTo(ax - 1.2, safeH + 1.3);
        ctx.moveTo(ax, safeH + 2.5);
        ctx.lineTo(ax + 1.2, safeH + 1.3);
        ctx.stroke();
      }

      // 5. Digital Display Readout
      if (safeW >= 20) {
        const dspW = Math.min(7.5, safeW * 0.32);
        const dspH = Math.min(2.5, safeH * 0.3);
        const dspX = safeW - dspW - 2.5;
        const dspY = (grilleY + louverY) / 2 - dspH / 2;

        ctx.fillStyle = '#082f49';
        ctx.fillRect(dspX, dspY, dspW, dspH);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 0.6;
        ctx.strokeRect(dspX, dspY, dspW, dspH);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 3.8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${temp}°C`, dspX + dspW / 2, dspY + dspH / 2);
      }

      // 6. Architectural Label
      if (settings.showObjectLabels !== false && safeW >= 22) {
        ctx.fillStyle = colors.accent;
        ctx.font = 'bold 3.8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`AC +${elevM}m`, 2.5, (grilleY + louverY) / 2);
      }

      return true;
    }
  }
  return false;
}
