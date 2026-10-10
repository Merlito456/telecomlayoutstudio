export function renderEquipmentRack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stencilId: string,
  obj?: any
): boolean {
  if (stencilId === 'h-frame') {
    // Unistrut vertical posts & crossbeam
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 8, h);
    ctx.fillRect(w - 8, 0, 8, h);
    ctx.fillRect(0, h / 2 - 4, w, 8);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 8, h);
    ctx.strokeRect(w - 8, 0, 8, h);
    ctx.strokeRect(0, h / 2 - 4, w, 8);

    // 4 High-density fiber splice closure canisters
    const spliceStep = (w - 24) / 4;
    for (let i = 0; i < 4; i++) {
      const sx = 14 + i * spliceStep;
      const sy = h / 2 - 10;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(sx, sy, 8, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sealing collar
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(sx, sy + 7, 8, 3);
    }
    return true;
  }

  // 19-inch / 23-inch Telecom & Server Equipment Rack
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 8;
  ctx.fillStyle =
    stencilId === 'rack-23in-42u' ? '#064e3b' :
    stencilId === 'rack-odf-42u' ? '#1c1917' :
    stencilId === 'rack-power-rectifier' || stencilId === 'flatpack-1' ? '#1e1b1b' :
    stencilId?.startsWith('huawei-atn') ? '#1e293b' :
    stencilId?.startsWith('nokia-') ? '#0f172a' :
    stencilId?.startsWith('fh-') ? '#091224' :
    stencilId === 'rack-server-800x1000' ? '#2e1065' :
    stencilId === 'rack-half-24u' ? '#064e3b' :
    stencilId === 'rack-bbu-radio' ? '#083344' :
    stencilId === 'rack-battery-4tier' ? '#431407' :
    stencilId === 'rack-dc-pdu' ? '#4c0519' :
    '#18181b';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  const strokeCol =
    stencilId === 'rack-19in-45u' || stencilId === 'rack-server-800x1000' ? '#818cf8' :
    stencilId === 'rack-23in-42u' || stencilId === 'rack-half-24u' ? '#34d399' :
    stencilId === 'rack-odf-42u' ? '#f59e0b' :
    stencilId === 'rack-power-rectifier' ? '#ef4444' :
    stencilId === 'flatpack-1' ? '#0284c7' :
    stencilId?.startsWith('huawei-atn') ? '#ef4444' :
    stencilId?.startsWith('nokia-') ? '#0284c7' :
    stencilId?.startsWith('fh-') ? '#0891b2' :
    stencilId === 'rack-dc-pdu' ? '#ef4444' :
    stencilId === 'rack-battery-string' || stencilId === 'rack-battery-4tier' ? '#f97316' :
    stencilId === 'rack-bbu-radio' ? '#06b6d4' :
    '#38bdf8';
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, w, h);

  // Front Door Perforated Mesh / Opening Indicator on South / Bottom Edge
  ctx.fillStyle = '#090d16';
  ctx.fillRect(3, h - 6, w - 6, 4);
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(3, h - 6, w - 6, 4);

  // Vertical 1U EIA rack rails with holes
  ctx.fillStyle = '#27272a';
  ctx.fillRect(3, 4, 4, h - 12);
  ctx.fillRect(w - 7, 4, 4, h - 12);

  // EIA Rail mounting holes pattern
  ctx.fillStyle = '#090d16';
  for (let y = 6; y < h - 12; y += 4) {
    ctx.fillRect(4.5, y, 1, 1.5);
    ctx.fillRect(w - 5.5, y, 1, 1.5);
  }

  const equips = obj?.customProps?.rackEquipments || obj?.rackEquipments;

  if (Array.isArray(equips) && equips.length > 0) {
    // Render user-designed equipment chassis
    const totalU = obj?.customProps?.uHeight || 42;
    const innerH = h - 16;
    const uStep = innerH / totalU;

    equips.forEach((eq: any) => {
      const uSlot = eq.uSlot || 1;
      const uH = eq.uHeight || 1;
      // Slot 1 is at rear/bottom or front
      const eqY = 6 + (totalU - uSlot - uH + 1) * uStep;
      const eqH = Math.max(3, uH * uStep - 1);

      ctx.fillStyle = eq.color || '#2d2d32';
      ctx.fillRect(8, eqY, w - 16, eqH);
      ctx.strokeStyle = eq.strokeColor || '#475569';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(8, eqY, w - 16, eqH);

      // Status LED
      ctx.fillStyle = eq.category === 'power' ? '#f59e0b' : '#22c55e';
      ctx.fillRect(10, eqY + Math.min(2, eqH / 2), 2, 2);

      // Compact Label if fits
      if (eqH >= 6 && w >= 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 5px ui-monospace, monospace';
        ctx.fillText(String(eq.label || '').substring(0, 8), 14, eqY + eqH - 2);
      }
    });
  } else if (
    stencilId === 'rack-power-rectifier' ||
    stencilId === 'flatpack-1' ||
    stencilId === 'rack-dc-pdu' ||
    stencilId.includes('rectifier') ||
    stencilId.includes('flatpack') ||
    obj?.customProps?.isRectifierSystem
  ) {
    // PHOTOREALISTIC RECTIFIER SYSTEM WITH DYNAMIC BATTERY COUNT & MODULAR SHELVES
    const customProps = obj?.customProps || {};
    const batteryCount = typeof customProps.batteryCount === 'number' ? customProps.batteryCount : 4;
    const batteryAh = customProps.batteryAh || 100;
    const isLithium = (customProps.batteryType || '').startsWith('lifepo4');
    const numMods = Math.max(2, Math.min(6, customProps.rectifierModules || 4));

    // Outer Beveled Enclosure Trim
    ctx.strokeStyle = stencilId === 'flatpack-1' ? '#0284c7' : '#ef4444';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(5.5, 3.5, w - 11, h - 7);

    // Upper Compartment: Modular Rectifier Shelf & Smartpack LCD Controller
    const upperH = Math.min(22, Math.max(14, h * 0.36));
    ctx.fillStyle = '#18181b';
    ctx.fillRect(7, 5, w - 14, upperH);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(7, 5, w - 14, upperH);

    // Modular Rectifier Units
    const modW = (w - 18) / numMods;
    for (let m = 0; m < numMods; m++) {
      const mx = 9 + m * modW;
      const mH = upperH * 0.44;
      ctx.fillStyle = '#27272a';
      ctx.fillRect(mx, 6, modW - 1.2, mH);
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(mx, 6, modW - 1.2, mH);

      // Cooling vent slats
      ctx.fillStyle = '#09090b';
      for (let sl = 1.5; sl < mH - 3; sl += 2.0) {
        ctx.fillRect(mx + 1.5, 6 + sl, modW - 4.2, 0.8);
      }

      // Ejector latch / handle bar
      ctx.fillStyle = '#71717a';
      ctx.fillRect(mx + modW - 3.2, 6 + 1.2, 1.4, mH - 2.4);

      // Status LEDs: Run (green), Alarm (red/amber)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(mx + 2.2, 6 + mH - 2.2, 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = m === 0 ? '#10b981' : '#3f3f46';
      ctx.beginPath();
      ctx.arc(mx + 4.2, 6 + mH - 2.2, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // LCD Controller Screen (Smartpack / Digital Controller)
    const lcdY = 6 + upperH * 0.48;
    const lcdH = upperH * 0.44;
    ctx.fillStyle = '#082f49';
    ctx.fillRect(9, lcdY, w - 18, lcdH);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(9, lcdY, w - 18, lcdH);

    // Cyan LCD Digital Readout
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 4.5px ui-monospace, monospace';
    ctx.textAlign = 'center';
    const rectTitle = stencilId === 'flatpack-1' ? 'FLATPACK2 (-48V)' : 'DC RECTIFIER (-48V)';
    ctx.fillText(rectTitle, w / 2, lcdY + lcdH * 0.48);

    // Telemetry line
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '3.2px ui-monospace, monospace';
    ctx.fillText('53.5V FLOAT · OK', w / 2, lcdY + lcdH * 0.86);
    ctx.textAlign = 'left';

    // Navigation buttons on LCD bezel
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w - 14, lcdY + 1.5, 1.8, 1.2);
    ctx.fillRect(w - 14, lcdY + 3.5, 1.8, 1.2);

    // Middle division: DC Distribution & Load Breakers
    const midY = 5 + upperH + 1.5;
    const midH = 5.5;
    ctx.fillStyle = '#27272a';
    ctx.fillRect(7, midY, w - 14, midH);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(7, midY, w - 14, midH);

    // Miniature Circuit Breakers (MCBs) with Red Toggles
    const breakerCount = Math.max(6, Math.min(10, Math.floor((w - 18) / 3.8)));
    const breakerStep = (w - 18) / breakerCount;
    for (let b = 0; b < breakerCount; b++) {
      const bx = 9 + b * breakerStep;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(bx, midY + 0.8, breakerStep - 1.2, midH - 1.6);
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(bx, midY + 0.8, breakerStep - 1.2, midH - 1.6);

      // Red MCB toggle handle
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx + 0.4, midY + 1.2, breakerStep - 2.0, 2.2);

      // White trip indicator window
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 0.6, midY + 3.8, breakerStep - 2.4, 0.8);
    }

    // Lower compartment: DYNAMIC CUSTOM BATTERY SYSTEM
    const battStartY = midY + midH + 1.5;
    const battAreaH = h - 9 - battStartY;
    if (battAreaH > 6) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(7, battStartY, w - 14, battAreaH);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(7, battStartY, w - 14, battAreaH);

      // Dynamically calculate grid based on configured batteryCount
      const cols = batteryCount <= 4 ? batteryCount : batteryCount <= 8 ? 4 : batteryCount <= 12 ? 4 : batteryCount <= 16 ? 4 : 6;
      const rows = Math.ceil(batteryCount / cols);
      const cellW = (w - 18) / cols;
      const cellH = (battAreaH - 4) / rows;

      for (let i = 0; i < batteryCount; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const bx = 9 + c * cellW;
        const by = battStartY + 1.5 + r * cellH;

        // Battery cell body (Emerald green for LiFePO4, Dark Charcoal for VRLA AGM)
        ctx.fillStyle = isLithium ? '#14532d' : '#292524';
        ctx.fillRect(bx + 0.4, by + 0.4, cellW - 0.8, cellH - 0.8);
        ctx.strokeStyle = isLithium ? '#22c55e' : '#78350f';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx + 0.4, by + 0.4, cellW - 0.8, cellH - 0.8);

        // Positive red terminal
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 0.8, by + 0.8, 1.4, 1.4);

        // Negative blue terminal
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(bx + cellW - 2.2, by + 0.8, 1.4, 1.4);

        // Interconnect copper busbar bridging adjacent terminals
        if (c < cols - 1 && i < batteryCount - 1) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(bx + cellW - 1.4, by + 1.0, 1.8, 0.9);
        }
      }

      // Battery label badge
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 4px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${batteryCount}× BATT (${batteryAh}Ah)`,
        w / 2,
        h - 8.5
      );
      ctx.textAlign = 'left';
    }
  } else if (stencilId?.startsWith('huawei-atn')) {
    // HUAWEI ATN SERIES ROUTER FACEPLATE (910A/B/C, 950A/B/C, 980A/B/C)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, 6, w - 16, h - 14);

    // Huawei ruby banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 6, w - 16, 5);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(12, 8.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    let modelTag = 'HUAWEI ATN';
    if (stencilId.includes('910a')) modelTag = 'HUAWEI ATN 910A';
    else if (stencilId.includes('910b')) modelTag = 'HUAWEI ATN 910B';
    else if (stencilId.includes('910c')) modelTag = 'HUAWEI ATN 910C';
    else if (stencilId.includes('950a')) modelTag = 'HUAWEI ATN 950A';
    else if (stencilId.includes('950b') || stencilId === 'huawei-atn-series') modelTag = 'HUAWEI ATN 950B';
    else if (stencilId.includes('950c')) modelTag = 'HUAWEI ATN 950C';
    else if (stencilId.includes('980a')) modelTag = 'HUAWEI ATN 980A';
    else if (stencilId.includes('980b')) modelTag = 'HUAWEI ATN 980B';
    else if (stencilId.includes('980c')) modelTag = 'HUAWEI ATN 980C';

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 4.5px ui-monospace, monospace';
    ctx.fillText(modelTag, 16, 10);

    // Optical cages & interface ports
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 13, w - 20, h - 22);

    const is1U = stencilId.includes('910');
    const is3UPlus = stencilId.includes('980');
    const rows = is1U ? 1 : is3UPlus ? 3 : 2;
    const cols = is1U ? 8 : 6;
    const colSpacing = (w - 24) / cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(11.5 + c * colSpacing, 14.5 + r * 5, 3.2, 3.2);
        ctx.strokeStyle = is3UPlus ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(11.5 + c * colSpacing, 14.5 + r * 5, 3.2, 3.2);
      }
    }
  } else if (stencilId === 'nokia-mf02') {
    // NOKIA MF-02 LIGHTSPAN OLT SUBRACK
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 6, w - 16, h - 14);

    // Nokia blue banner
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(8, 6, w - 16, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 4.2px ui-monospace, monospace';
    ctx.fillText('NOKIA MF-02 LIGHTSPAN', 10, 10);

    // Modular transceivers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 13, w - 20, h - 22);
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(12 + c * 4.5, 15, 3.5, h - 26);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(12 + c * 4.5, 15, 3.5, h - 26);
    }
  } else if (stencilId === 'nokia-df16') {
    // NOKIA DF-16 LIGHTSPAN OLT DISTRIBUTION FRAME
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(8, 6, w - 16, h - 14);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(8, 6, w - 16, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 4.2px ui-monospace, monospace';
    ctx.fillText('NOKIA DF-16 LIGHTSPAN', 10, 10);

    // 16 Cassettes grid
    const cW = (w - 22) / 4;
    const cH = (h - 22) / 4;
    for (let idx = 0; idx < 16; idx++) {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10 + col * cW, 13 + row * cH, cW - 1, cH - 1);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(10 + col * cW, 13 + row * cH, cW - 1, cH - 1);
    }
  } else if (stencilId === 'nokia-fx08') {
    // NOKIA FX-8 LIGHTSPAN OLT SHELF
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(8, 6, w - 16, h - 14);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 6, w - 16, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 4.2px ui-monospace, monospace';
    ctx.fillText('NOKIA FX-8 LIGHTSPAN (OLT)', 10, 10);

    // 8 card slots
    const sW = (w - 20) / 8;
    for (let s = 0; s < 8; s++) {
      ctx.fillStyle = s === 3 || s === 4 ? '#0c4a6e' : '#1e293b';
      ctx.fillRect(10 + s * sW, 13, sW - 1, h - 22);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(10 + s * sW, 13, sW - 1, h - 22);
    }
  } else if (stencilId?.startsWith('fh-')) {
    // FIBERHOME AN6000 & AN5516 / AN5116 OLT SUBRACKS
    ctx.fillStyle = '#0a1120';
    ctx.fillRect(8, 6, w - 16, h - 14);

    // FiberHome cyan header banner
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(8, 6, w - 16, 5);

    let modelTag = 'FIBERHOME OLT';
    if (stencilId === 'fh-an6000-17' || stencilId === 'bay-fh-an6000-17') modelTag = 'FH AN6000-17 (15U)';
    else if (stencilId === 'fh-an6000-15' || stencilId === 'bay-fh-an6000-15') modelTag = 'FH AN6000-15 (11U)';
    else if (stencilId === 'fh-an6000-7' || stencilId === 'fh-an6000-07' || stencilId === 'bay-fh-an6000-7') modelTag = 'FH AN6000-7 (6U)';
    else if (stencilId === 'fh-an6000-2' || stencilId === 'fh-an6000-02') modelTag = 'FH AN6000-2 (2U)';
    else if (stencilId === 'fh-an6001-g16') modelTag = 'FH AN6001-G16 (1U)';
    else if (stencilId === 'fh-an6001-ges16') modelTag = 'FH AN6001-GES16 (1U)';
    else if (stencilId === 'fh-an6001-gf16') modelTag = 'FH AN6001-GF16 (1U)';
    else if (stencilId === 'fh-an6001c-gf16') modelTag = 'FH AN6001C-GF16 (1U)';
    else if (stencilId === 'fh-an5516-01' || stencilId === 'bay-fh-an5516-01') modelTag = 'FH AN5516-01 (11U)';
    else if (stencilId === 'fh-an5516-06b' || stencilId === 'bay-fh-an5516-06b') modelTag = 'FH AN5516-06B (6U)';
    else if (stencilId === 'fh-an5516-06') modelTag = 'FH AN5516-06 (6U)';
    else if (stencilId === 'fh-an5516-04') modelTag = 'FH AN5516-04 (2U)';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 4.2px ui-monospace, monospace';
    ctx.fillText(modelTag, 10, 10);

    // LEDs (RUN/ALM/ACT)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(w - 18, 8.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w - 15, 8.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(w - 12, 8.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Body slot layout
    const isPizzaBox = stencilId.startsWith('fh-an6001');
    const isMini2U =
      stencilId === 'fh-an6000-2' ||
      stencilId === 'fh-an6000-02' ||
      stencilId === 'fh-an5516-04';

    if (isPizzaBox) {
      // 1U Pizza-Box OLT (16 Ports grid + dual power supply block)
      const portAreaW = w - 34;
      const cols = 8;
      const pW = portAreaW / cols;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 8; c++) {
          const px = 10 + c * pW;
          const py = 13 + r * 5;
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(px, py, pW - 1, 4);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 0.4;
          ctx.strokeRect(px, py, pW - 1, 4);
        }
      }
      // Power / Uplink Section
      ctx.fillStyle = '#291c10';
      ctx.fillRect(w - 22, 13, 12, h - 22);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(w - 22, 13, 12, h - 22);
    } else if (isMini2U) {
      // 2U Chassis (2 service bays)
      const bayW = (w - 24) / 2;
      ctx.fillStyle = '#083344';
      ctx.fillRect(10, 13, bayW - 1, h - 22);
      ctx.fillRect(10 + bayW, 13, bayW - 1, h - 22);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(10, 13, bayW - 1, h - 22);
      ctx.strokeRect(10 + bayW, 13, bayW - 1, h - 22);
    } else {
      // High-capacity subrack (vertical service card slots)
      const slotCount =
        stencilId === 'fh-an6000-17' || stencilId === 'bay-fh-an6000-17' ? 17 :
        stencilId === 'fh-an6000-15' || stencilId === 'bay-fh-an6000-15' || stencilId === 'fh-an5516-01' || stencilId === 'bay-fh-an5516-01' ? 15 :
        stencilId === 'fh-an6000-7' || stencilId === 'fh-an6000-07' || stencilId === 'bay-fh-an6000-7' ? 7 :
        stencilId === 'fh-an5516-06b' || stencilId === 'bay-fh-an5516-06b' ? 6 : 6;

      const cardW = (w - 20) / slotCount;
      for (let s = 0; s < slotCount; s++) {
        const isCore = s === Math.floor(slotCount / 2) || s === Math.floor(slotCount / 2) - 1;
        ctx.fillStyle = isCore ? '#083344' : '#111c2e';
        ctx.fillRect(10 + s * cardW, 13, cardW - 0.6, h - 22);
        ctx.strokeStyle = isCore ? '#22d3ee' : '#334155';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(10 + s * cardW, 13, cardW - 0.6, h - 22);
      }
    }
  } else {
    // AUTHENTIC TELECOM RACK PLAN VIEW (No "OPEN BAY EMPTY" placeholder)
    const is2Post = stencilId === 'rack-open-2post' || stencilId === 'rack-center-2post' || stencilId === 'open-rack';
    const is4Post = stencilId === 'rack-open-4post';
    const isWallMount = stencilId === 'rack-wall-12u' || stencilId === 'rack-wall-18u';
    const is23In = stencilId === 'rack-23in-42u';

    if (is2Post) {
      // --- 2-POST RELAY TELECOM RACK ---
      // Floor base mounting plates (wide flanges extending along depth)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 2, 7, h - 4);
      ctx.fillRect(w - 11, 2, 7, h - 4);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 2, 7, h - 4);
      ctx.strokeRect(w - 11, 2, 7, h - 4);

      // Floor anchor bolt holes (4 anchors)
      ctx.fillStyle = '#64748b';
      for (const by of [6, h - 6]) {
        ctx.beginPath();
        ctx.arc(7.5, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w - 7.5, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dual Heavy C-Channel Vertical Uprights at center depth
      const midY = h / 2;
      ctx.fillStyle = '#334155';
      ctx.fillRect(5, midY - 3.5, 6, 7);
      ctx.fillRect(w - 11, midY - 3.5, 6, 7);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(5, midY - 3.5, 6, 7);
      ctx.strokeRect(w - 11, midY - 3.5, 6, 7);

      // Top Cross Angle / Cable Runway Support
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(11, midY);
      ctx.lineTo(w - 11, midY);
      ctx.stroke();

      // Side cable management finger ducts
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.8;
      ctx.fillRect(0, midY - 6, 4, 12);
      ctx.strokeRect(0, midY - 6, 4, 12);
      ctx.fillRect(w - 4, midY - 6, 4, 12);
      ctx.strokeRect(w - 4, midY - 6, 4, 12);

      // Center EIA-310 19" mounting aperture
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 5px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('19" RELAY RACK', w / 2, midY - 4);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '4.2px ui-monospace, monospace';
      ctx.fillText(stencilId === 'rack-center-2post' ? '45U CENTER-MOUNT' : '2-POST OPEN FRAME', w / 2, midY + 5);
      ctx.textAlign = 'left';
    } else if (is4Post) {
      // --- 4-POST OPEN FRAME EQUIPMENT RACK ---
      // 4 Heavy Corner L-Angle Uprights
      const postSize = 6;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;

      // Top-Left, Top-Right, Bottom-Left, Bottom-Right posts
      ctx.fillRect(4, 4, postSize, postSize);
      ctx.strokeRect(4, 4, postSize, postSize);
      ctx.fillRect(w - 4 - postSize, 4, postSize, postSize);
      ctx.strokeRect(w - 4 - postSize, 4, postSize, postSize);
      ctx.fillRect(4, h - 4 - postSize, postSize, postSize);
      ctx.strokeRect(4, h - 4 - postSize, postSize, postSize);
      ctx.fillRect(w - 4 - postSize, h - 4 - postSize, postSize, postSize);
      ctx.strokeRect(w - 4 - postSize, h - 4 - postSize, postSize, postSize);

      // Side Depth Rails connecting front & rear posts
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(5, 10, postSize - 2, h - 20);
      ctx.strokeRect(w - 3 - postSize, 10, postSize - 2, h - 20);

      // Top crossbeams
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 7);
      ctx.lineTo(w - 10, 7);
      ctx.moveTo(10, h - 7);
      ctx.lineTo(w - 10, h - 7);
      ctx.stroke();

      // Interior 19" equipment mounting envelope
      ctx.strokeStyle = '#0284c7';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.setLineDash([]);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 5px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('4-POST OPEN RACK', w / 2, h / 2 - 2);
      ctx.fillStyle = '#64748b';
      ctx.font = '4px ui-monospace, monospace';
      ctx.fillText('19" EIA-310 (800mm)', w / 2, h / 2 + 5);
      ctx.textAlign = 'left';
    } else if (isWallMount) {
      // --- WALL-MOUNT NETWORK CABINET ---
      // Rear wall mounting flange
      ctx.fillStyle = '#0e7490';
      ctx.fillRect(0, 0, w, 4);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, 4);

      // Wall anchor points
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(6, 2, 1.2, 0, Math.PI * 2);
      ctx.arc(w - 6, 2, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Front smoked door / window
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(4, 6, w - 8, h - 10);
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(4, 6, w - 8, h - 10);

      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 5px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(stencilId.includes('18u') ? '18U WALL RACK' : '12U WALL RACK', w / 2, h / 2 + 1);
      ctx.textAlign = 'left';
    } else {
      // --- ENCLOSED TELECOM / SERVER CABINET (42U, 45U, 48U, etc.) ---
      // Outer cold-rolled steel frame with corner box columns
      const colSize = 4.5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1, 1, colSize, colSize);
      ctx.fillRect(w - 1 - colSize, 1, colSize, colSize);
      ctx.fillRect(1, h - 1 - colSize, colSize, colSize);
      ctx.fillRect(w - 1 - colSize, h - 1 - colSize, colSize, colSize);

      // Removable side panels with ventilation slots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1, 6, 2.5, h - 12);
      ctx.fillRect(w - 3.5, 6, 2.5, h - 12);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(1, 6, 2.5, h - 12);
      ctx.strokeRect(w - 3.5, 6, 2.5, h - 12);

      // 4 Internal 19" (or 23") EIA-310 Mounting Rails with holes
      const railInsetX = is23In ? 4 : 5.5;
      const railW = 3.5;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      // Front rails
      ctx.fillRect(railInsetX, h - 10, railW, 4);
      ctx.strokeRect(railInsetX, h - 10, railW, 4);
      ctx.fillRect(w - railInsetX - railW, h - 10, railW, 4);
      ctx.strokeRect(w - railInsetX - railW, h - 10, railW, 4);
      // Rear rails
      ctx.fillRect(railInsetX, 6, railW, 4);
      ctx.strokeRect(railInsetX, 6, railW, 4);
      ctx.fillRect(w - railInsetX - railW, 6, railW, 4);
      ctx.strokeRect(w - railInsetX - railW, 6, railW, 4);

      // Depth mounting channel runners
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(railInsetX + railW / 2, 10);
      ctx.lineTo(railInsetX + railW / 2, h - 10);
      ctx.moveTo(w - railInsetX - railW / 2, 10);
      ctx.lineTo(w - railInsetX - railW / 2, h - 10);
      ctx.stroke();

      // Top Roof Cable Entry Ports with Brush Grommets
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(w / 2 - 10, 2.5, 20, 2.5);
      ctx.fillRect(railInsetX + 4, 2.5, 8, 2.2);
      ctx.fillRect(w - railInsetX - 12, 2.5, 8, 2.2);

      // Front Door: Perforated Mesh & Swing Clearance Arc
      ctx.fillStyle = '#090d16';
      ctx.fillRect(3, h - 5, w - 6, 3.5);
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1;
      ctx.strokeRect(3, h - 5, w - 6, 3.5);

      // Door swing clearance arc (dashed 90° arc showing front service access)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(3, h - 2, Math.min(w - 6, 22), 0, Math.PI / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rear Split Doors
      ctx.fillStyle = '#090d16';
      ctx.fillRect(3, 1.5, (w - 7) / 2, 2.5);
      ctx.fillRect(w / 2 + 0.5, 1.5, (w - 7) / 2, 2.5);

      // Grounding Terminal Stud (Copper M8)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(w - 4, 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Professional Technical Badge Label
      let rackTag = '42U RACK (600×800)';
      if (stencilId === 'rack-19in-45u') rackTag = '45U TALL (600×800)';
      else if (stencilId === 'rack-19in-47u') rackTag = '47U CARRIER (600×800)';
      else if (stencilId === 'rack-datacenter-48u') rackTag = '48U DC (800×1200)';
      else if (stencilId === 'rack-telecom-600x600') rackTag = '42U RACK (600×600)';
      else if (stencilId === 'rack-telecom-800x800') rackTag = '42U WIDE (800×800)';
      else if (stencilId === 'rack-server-800x1000') rackTag = '45U SERVER (800×1000)';
      else if (stencilId === 'rack-mid-36u') rackTag = '36U MID (600×600)';
      else if (stencilId === 'rack-half-24u') rackTag = '24U HALF (600×600)';
      else if (stencilId === 'rack-compact-18u') rackTag = '18U EDGE (600×600)';
      else if (stencilId === 'rack-23in-42u') rackTag = '23" TELCO (700×600)';
      else if (stencilId === 'rack-etsi-600x300') rackTag = 'ETSI BAY (600×300)';
      else if (stencilId === 'rack-seismic-z4') rackTag = 'SEISMIC Z4 (800×800)';
      else if (stencilId === 'rack-odf-42u') rackTag = '42U ODF (600×600)';
      else if (stencilId === 'rack-odf-high-density') rackTag = 'HD ODF (800×600)';
      else if (stencilId === 'rack-dwdm-otn') rackTag = 'DWDM/OTN (600×600)';
      else if (stencilId === 'rack-core-router') rackTag = 'CORE ROUTER (800×1000)';
      else if (stencilId === 'rack-mdf-ddf') rackTag = 'MDF/DDF (800×400)';

      ctx.fillStyle = strokeCol;
      ctx.font = 'bold 4.8px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rackTag, w / 2, h / 2 - 1);
      ctx.fillStyle = '#64748b';
      ctx.font = '4px ui-monospace, monospace';
      ctx.fillText(is23In ? '23" ANSI/EIA' : '19" EIA-310', w / 2, h / 2 + 5);
      ctx.textAlign = 'left';
    }
  }

  // Orientation notch / Front direction indicator
  ctx.fillStyle = strokeCol;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 3, h - 2);
  ctx.lineTo(w / 2 + 3, h - 2);
  ctx.lineTo(w / 2, h);
  ctx.closePath();
  ctx.fill();
  return true;
}

