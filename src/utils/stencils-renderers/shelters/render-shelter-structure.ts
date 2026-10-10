import { CADObject, ProjectSettings } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderShelterStructure(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'shelter':
    case 'cement-shelter': {
      const props = obj.customProps || {};
      const isCementBox = stencilId === 'cement-shelter' || props.stencilType === 'cement-shelter';
      const doorWall: 'north' | 'south' | 'east' | 'west' = props.doorWall || 'south';
      const doorOffsetPct: number = Math.max(10, Math.min(90, props.doorOffset ?? 35));
      const cableWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.cableHoleWall ?? 'east';
      const cableOffsetPct: number = Math.max(10, Math.min(90, props.cableHoleOffset ?? 50));
      const airconWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.airconWall ?? 'none';
      const airconOffsetPct: number = Math.max(10, Math.min(90, props.airconOffset ?? 50));
      const wallT = Math.max(8, Math.min(20, props.wallThickness ?? 12));
      const shelterHeightM: number = Number(obj.shelterHeightM ?? props.shelterHeightM ?? 3.0);

      // 1. Concrete foundation base overhang (Authentic cement slab)
      const curb = 8;
      drawPhotorealisticCementPad(ctx, -curb, -curb, w + curb * 2, h + curb * 2, {
        chamfer: 5,
        showJoints: true,
        embossText: isCementBox ? 'PRECAST CEMENT SHELTER 35MPa' : 'SHELTER SLAB 25MPa',
      });

      // 2. Monolithic All-White Cement Outer Walls / Roof Slab
      const wallGrad = ctx.createLinearGradient(0, 0, w, h);
      if (isCementBox) {
        // Pure architectural all-white concrete tone
        wallGrad.addColorStop(0, '#f8fafc');
        wallGrad.addColorStop(0.5, '#ffffff');
        wallGrad.addColorStop(1, '#f1f5f9');
      } else {
        wallGrad.addColorStop(0, '#475569');
        wallGrad.addColorStop(0.5, '#64748b');
        wallGrad.addColorStop(1, '#334155');
      }

      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = isCementBox ? '#94a3b8' : '#262624';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, w, h);

      // Inner equipment floor area
      const innerW = w - wallT * 2;
      const innerH = h - wallT * 2;
      ctx.fillStyle = isCementBox ? '#e2e8f0' : '#1e293b';
      ctx.fillRect(wallT, wallT, innerW, innerH);
      ctx.strokeStyle = isCementBox ? '#cbd5e1' : '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wallT, wallT, innerW, innerH);

      // Subtle ESD raised floor grid lines inside the shelter
      ctx.save();
      ctx.strokeStyle = isCementBox ? 'rgba(148, 163, 184, 0.25)' : 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 0.6;
      const tileStep = 12;
      for (let gx = wallT + tileStep; gx < w - wallT; gx += tileStep) {
        ctx.beginPath();
        ctx.moveTo(gx, wallT);
        ctx.lineTo(gx, h - wallT);
        ctx.stroke();
      }
      for (let gy = wallT + tileStep; gy < h - wallT; gy += tileStep) {
        ctx.beginPath();
        ctx.moveTo(wallT, gy);
        ctx.lineTo(w - wallT, gy);
        ctx.stroke();
      }
      ctx.restore();

      // 4 Precast Lifting Eyes / Rigging Lugs at corners
      const lugRadius = 5;
      [
        { x: wallT / 2, y: wallT / 2 },
        { x: w - wallT / 2, y: wallT / 2 },
        { x: wallT / 2, y: h - wallT / 2 },
        { x: w - wallT / 2, y: h - wallT / 2 },
      ].forEach((lug) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(lug.x, lug.y, lugRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(lug.x, lug.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render user-designed interior equipment (only when designed via Shelter Design Studio)
      const interiorObjs: any[] = (obj.interiorObjects || props.interiorObjects || []) as any[];
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

        // 1. Draw floor-mounted equipment first
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

          const sId = String(itm.stencilId || itm.customProps?.stencilType || '').toLowerCase();
          const itmName = String(itm.name || itm.text || '').toLowerCase();
          const isAC =
            itm.category === 'cooling' ||
            itm.customProps?.category === 'cooling' ||
            sId.includes('ac') ||
            sId.includes('split') ||
            sId.includes('aircon') ||
            sId.includes('cooling') ||
            itmName.includes('air conditioner') ||
            itmName.includes('wall ac') ||
            itmName.includes('aircon');

          if (isAC) {
            const elevM = ((itm.elevationMm ?? itm.customProps?.elevationMm ?? 2200) / 1000).toFixed(1);
            const temp = itm.targetTempC ?? itm.customProps?.targetTempC ?? 20;

            // 1. Wall bracket backplate against wall
            ctx.fillStyle = '#334155';
            ctx.fillRect(-iw / 2 + 1, -id / 2, iw - 2, Math.max(1.5, id * 0.16));

            // 2. Main Enclosure Body - Arctic White Appliance Enamel
            const acGrad = ctx.createLinearGradient(0, -id / 2, 0, id / 2);
            acGrad.addColorStop(0, '#ffffff');
            acGrad.addColorStop(0.5, '#f8fafc');
            acGrad.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = acGrad;
            ctx.beginPath();
            const r = Math.min(2, Math.max(0.5, id * 0.15));
            ctx.roundRect(-iw / 2, -id / 2 + 1.5, iw, id - 1.5, r);
            ctx.fill();

            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // 3. Return Air Intake Grille Slats (Top deck)
            if (iw >= 10 && id >= 5) {
              const gW = iw - 6;
              const gH = id * 0.35;
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(-gW / 2, -id / 2 + 3, gW, gH);
              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 0.6;
              for (let sy = -id / 2 + 4.5; sy < -id / 2 + 3 + gH; sy += 2) {
                ctx.beginPath();
                ctx.moveTo(-gW / 2 + 1, sy);
                ctx.lineTo(gW / 2 - 1, sy);
                ctx.stroke();
              }
            }

            // 4. Motorized Discharge Air Louver (Front Edge facing into room)
            if (id >= 4) {
              ctx.fillStyle = '#e0f2fe';
              ctx.fillRect(-iw / 2 + 2, id / 2 - 3, iw - 4, 2.5);
              ctx.strokeStyle = '#0ea5e9';
              ctx.lineWidth = 0.8;
              ctx.strokeRect(-iw / 2 + 2, id / 2 - 3, iw - 4, 2.5);

              // Directional cyan airflow indicators discharging into room
              if (iw >= 14 && id >= 8) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 0.8;
                for (const ax of [-iw * 0.25, 0, iw * 0.25]) {
                  ctx.beginPath();
                  ctx.moveTo(ax, id / 2 - 0.5);
                  ctx.lineTo(ax, id / 2 + 3.5);
                  ctx.lineTo(ax - 1.5, id / 2 + 2);
                  ctx.moveTo(ax, id / 2 + 3.5);
                  ctx.lineTo(ax + 1.5, id / 2 + 2);
                  ctx.stroke();
                }
              }
            }

            // 5. Digital Thermostat LCD & Status LED
            if (iw >= 20 && id >= 8) {
              ctx.fillStyle = '#082f49';
              ctx.fillRect(iw / 2 - 11, -id / 2 + 4, 9, 4.5);
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(iw / 2 - 11, -id / 2 + 4, 9, 4.5);

              ctx.fillStyle = '#38bdf8';
              ctx.font = 'bold 3.8px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${temp}°`, iw / 2 - 6.5, -id / 2 + 6.2);

              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(iw / 2 - 13, -id / 2 + 6.2, 0.9, 0, Math.PI * 2);
              ctx.fill();
            }

            // 6. Label
            if (settings.showObjectLabels !== false && iw >= 10) {
              ctx.fillStyle = '#0284c7';
              ctx.font = 'bold 5px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`AC +${elevM}m`, -2, 0);
            }
          } else {
            ctx.fillStyle = itm.fill || itm.color || '#0f172a';
            ctx.fillRect(-iw / 2, -id / 2, iw, id);
            ctx.strokeStyle = itm.stroke || itm.strokeColor || '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-iw / 2, -id / 2, iw, id);

            if (settings.showObjectLabels !== false && iw >= 10) {
              ctx.fillStyle = '#f8fafc';
              ctx.font = 'bold 5.5px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const shortTag = (itm.text || itm.name || 'EQ').split(' ')[0].substring(0, 7);
              ctx.fillText(shortTag, 0, 0);
            }
          }
          ctx.restore();
        });

        // 2. Draw overhead cable ladders ON TOP so floor equipment does not cover them
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

          // Orient stringers along longer dimension
          const isVert = id > iw;
          const spanW = isVert ? id : iw;
          const spanH = isVert ? iw : id;
          if (isVert) {
            ctx.rotate(Math.PI / 2);
          }

          // Outer stringer rails
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-spanW / 2, -spanH / 2, spanW, spanH);

          // Cross rungs
          const rungSpacing = Math.max(5, Math.min(10, spanW / Math.max(3, Math.round(spanW / 7))));
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let rx = -spanW / 2 + rungSpacing; rx < spanW / 2 - 2; rx += rungSpacing) {
            ctx.moveTo(rx, -spanH / 2);
            ctx.lineTo(rx, spanH / 2);
          }
          ctx.stroke();

          // Drop-rod ceiling support hangers
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
            ctx.fillText('LADDER', 0, -spanH / 2 - 4);
          }

          ctx.restore();
        });
      }

      // Shelter Height badge inside top-left corner
      if (settings.showObjectLabels !== false && innerW > 50) {
        ctx.save();
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = isCementBox ? '#334155' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(`H:${shelterHeightM.toFixed(1)}m`, wallT + 4, wallT + 9);
        ctx.restore();
      }

      // Helper function to draw customizable Door
      const drawCustomDoor = (wall: 'north' | 'south' | 'east' | 'west', offsetPct: number) => {
        const doorWidthMm = Number(props.doorWidthMm ?? props.doorDiameter ?? props.doorDiameterMm ?? 900);
        const wallSpan = wall === 'north' || wall === 'south' ? w : h;
        const maxDoorPx = Math.max(16, wallSpan - wallT * 2 - 8);
        const doorLen = Math.max(16, Math.min(maxDoorPx, (doorWidthMm / 900) * 34));
        let dx = 0;
        let dy = 0;
        let dw = 0;
        let dh = 0;
        let swingCenterX = 0;
        let swingCenterY = 0;
        let swingStartAngle = 0;
        let swingEndAngle = 0;

        if (wall === 'south') {
          dx = Math.max(wallT + 4, Math.min(w - wallT - doorLen - 4, (w - doorLen) * (offsetPct / 100)));
          dy = h - wallT;
          dw = doorLen;
          dh = wallT;
          swingCenterX = dx;
          swingCenterY = h;
          swingStartAngle = 0;
          swingEndAngle = Math.PI / 2;
        } else if (wall === 'north') {
          dx = Math.max(wallT + 4, Math.min(w - wallT - doorLen - 4, (w - doorLen) * (offsetPct / 100)));
          dy = 0;
          dw = doorLen;
          dh = wallT;
          swingCenterX = dx;
          swingCenterY = 0;
          swingStartAngle = -Math.PI / 2;
          swingEndAngle = 0;
        } else if (wall === 'west') {
          dx = 0;
          dy = Math.max(wallT + 4, Math.min(h - wallT - doorLen - 4, (h - doorLen) * (offsetPct / 100)));
          dw = wallT;
          dh = doorLen;
          swingCenterX = 0;
          swingCenterY = dy;
          swingStartAngle = Math.PI;
          swingEndAngle = Math.PI * 1.5;
        } else {
          // East
          dx = w - wallT;
          dy = Math.max(wallT + 4, Math.min(h - wallT - doorLen - 4, (h - doorLen) * (offsetPct / 100)));
          dw = wallT;
          dh = doorLen;
          swingCenterX = w;
          swingCenterY = dy;
          swingStartAngle = 0;
          swingEndAngle = Math.PI / 2;
        }

        // Door wall cutout frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(dx, dy, dw, dh);

        // Steel Security Door leaf
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(dx + 1, dy + 1, dw - 2, dh - 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(dx + 1, dy + 1, dw - 2, dh - 2);

        // Stainless steel lever hardware
        ctx.fillStyle = '#f8fafc';
        if (wall === 'south' || wall === 'north') {
          ctx.fillRect(dx + dw - 7, dy + 3, 5, 2);
        } else {
          ctx.fillRect(dx + 3, dy + dh - 7, 2, 5);
        }

        // Dashed 90° Door Swing Arc
        ctx.save();
        ctx.setLineDash([3, 2]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(swingCenterX, swingCenterY, doorLen, swingStartAngle, swingEndAngle);
        ctx.stroke();
        ctx.restore();
      };

      // Helper function to draw customizable Cable Entry Hole / Gland
      const drawCustomCableHole = (wall: 'north' | 'south' | 'east' | 'west', offsetPct: number) => {
        const cableHoleDia = Number(props.cableHoleDiameterMm ?? props.cableHoleDiameter ?? props.feederDiameter ?? 250);
        const glandLen = Math.max(14, Math.min(64, (cableHoleDia / 250) * 28));
        let gx = 0;
        let gy = 0;
        let gw = 0;
        let gh = 0;

        if (wall === 'east') {
          gx = w - wallT - 2;
          gy = Math.max(wallT + 4, Math.min(h - wallT - glandLen - 4, (h - glandLen) * (offsetPct / 100)));
          gw = wallT + 4;
          gh = glandLen;
        } else if (wall === 'west') {
          gx = -2;
          gy = Math.max(wallT + 4, Math.min(h - wallT - glandLen - 4, (h - glandLen) * (offsetPct / 100)));
          gw = wallT + 4;
          gh = glandLen;
        } else if (wall === 'north') {
          gx = Math.max(wallT + 4, Math.min(w - wallT - glandLen - 4, (w - glandLen) * (offsetPct / 100)));
          gy = -2;
          gw = glandLen;
          gh = wallT + 4;
        } else {
          // South
          gx = Math.max(wallT + 4, Math.min(w - wallT - glandLen - 4, (w - glandLen) * (offsetPct / 100)));
          gy = h - wallT - 2;
          gw = glandLen;
          gh = wallT + 4;
        }

        // Gland frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gx, gy, gw, gh);

        // Cable rubber boot penetrations (scaled to gland length)
        const bootStep = Math.max(4.5, Math.min(7.5, glandLen / 5));
        const bootRadius = Math.max(1.8, Math.min(3.2, (cableHoleDia / 250) * 2.5));
        if (gw < gh) {
          // Vertical wall
          for (let py = gy + 4; py < gy + gh - 2; py += bootStep) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(gx + gw / 2, py, bootRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(gx + gw / 2, py, bootRadius * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Horizontal wall
          for (let px = gx + 4; px < gx + gw - 2; px += bootStep) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(px, gy + gh / 2, bootRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(px, gy + gh / 2, bootRadius * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Cable Hole drafting tag with diameter
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        const tagText = `FEEDER ⌀${cableHoleDia}mm`;
        if (wall === 'east') ctx.fillText(tagText, w + 24, gy + gh / 2 + 2);
        else if (wall === 'west') ctx.fillText(tagText, -24, gy + gh / 2 + 2);
        else if (wall === 'north') ctx.fillText(tagText, gx + gw / 2, -6);
        else ctx.fillText(tagText, gx + gw / 2, h + 14);
      };

      // Helper function to draw customizable Aircon (HVAC Unit)
      const drawCustomAircon = (wall: 'north' | 'south' | 'east' | 'west', offsetPct: number) => {
        const acW = 28;
        const acD = 14;
        let ax = 0;
        let ay = 0;
        let aw = 0;
        let ah = 0;

        if (wall === 'north') {
          ax = Math.max(wallT + 2, Math.min(w - wallT - acW - 2, (w - acW) * (offsetPct / 100)));
          ay = -acD - 2;
          aw = acW;
          ah = acD;
        } else if (wall === 'south') {
          ax = Math.max(wallT + 2, Math.min(w - wallT - acW - 2, (w - acW) * (offsetPct / 100)));
          ay = h + 2;
          aw = acW;
          ah = acD;
        } else if (wall === 'east') {
          ax = w + 2;
          ay = Math.max(wallT + 2, Math.min(h - wallT - acW - 2, (h - acW) * (offsetPct / 100)));
          aw = acD;
          ah = acW;
        } else {
          // West
          ax = -acD - 2;
          ay = Math.max(wallT + 2, Math.min(h - wallT - acW - 2, (h - acW) * (offsetPct / 100)));
          aw = acD;
          ah = acW;
        }

        // Condenser metal housing
        const hvacGrad = ctx.createLinearGradient(ax, ay, ax + aw, ay + ah);
        hvacGrad.addColorStop(0, '#1e293b');
        hvacGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = hvacGrad;
        ctx.beginPath();
        ctx.roundRect(ax, ay, aw, ah, 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Dual axial fans or protective louvers
        ctx.fillStyle = '#0284c7';
        if (aw > ah) {
          // Horizontal AC
          ctx.beginPath();
          ctx.arc(ax + aw * 0.3, ay + ah / 2, 4.5, 0, Math.PI * 2);
          ctx.arc(ax + aw * 0.7, ay + ah / 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          // Vertical AC
          ctx.beginPath();
          ctx.arc(ax + aw / 2, ay + ah * 0.3, 4.5, 0, Math.PI * 2);
          ctx.arc(ax + aw / 2, ay + ah * 0.7, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // HVAC label
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('HVAC AC', ax + aw / 2, ay + ah / 2 + 2);
      };

      // Draw customizable elements
      drawCustomDoor(doorWall, doorOffsetPct);
      if (cableWall !== 'none') drawCustomCableHole(cableWall, cableOffsetPct);
      if (airconWall !== 'none' && Boolean(props.showOutdoorCondenser)) drawCustomAircon(airconWall, airconOffsetPct);

      return true;
    }

    // ==========================================
    // 6. OFFICIAL WHITE TELECOM CABINETS (Huawei, Eltek, Fushan, Ericsson, FH ODC)
    // ==========================================

  }
  return false;
}
