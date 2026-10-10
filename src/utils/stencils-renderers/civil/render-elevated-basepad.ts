import { CADObject, ProjectSettings } from "../../../types/cad";
import { drawPhotorealisticCementPad } from "../common";

export function renderElevatedBasepad(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number
): boolean {
  const props = obj.customProps || {};
  const stairsWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.stairsWall || 'south';
  const stairsSteps: number = Math.max(3, Math.min(8, props.stairsSteps ?? 5));
  const railingN: boolean = props.railingNorth !== false;
  const railingS: boolean = props.railingSouth ?? (stairsWall === 'south' ? false : true);
  const railingE: boolean = props.railingEast !== false;
  const railingW: boolean = props.railingWest !== false;
  const busbarWall: 'north' | 'south' | 'east' | 'west' | 'none' = props.busbarWall || 'east';
  const elHeight: number = props.elevationHeight ?? 800;

  // 1. Structural Piers / Concrete Footings underneath the platform
  const pierSize = 16;
  const pierPositions: { x: number; y: number }[] = [
    { x: 4, y: 4 },
    { x: w - pierSize - 4, y: 4 },
    { x: 4, y: h - pierSize - 4 },
    { x: w - pierSize - 4, y: h - pierSize - 4 },
  ];
  if (w >= 140) {
    pierPositions.push({ x: w / 2 - pierSize / 2, y: 4 });
    pierPositions.push({ x: w / 2 - pierSize / 2, y: h - pierSize - 4 });
  }

  pierPositions.forEach((pos) => {
    drawPhotorealisticCementPad(ctx, pos.x - 3, pos.y - 3, pierSize + 6, pierSize + 6, {
      chamfer: 2,
      showJoints: false,
      anchorBolts: true,
    });

    ctx.fillStyle = '#334155';
    ctx.fillRect(pos.x, pos.y, pierSize, pierSize);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(pos.x, pos.y, pierSize, pierSize);
  });

  // 2. Elevated Platform Deck
  drawPhotorealisticCementPad(ctx, 4, 4, w - 8, h - 8, {
    chamfer: 3,
    showJoints: true,
    embossText: `ELEVATED TOC +${elHeight}mm`,
  });

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Level Marker Symbol
  const markX = 18;
  const markY = 18;
  ctx.strokeStyle = '#0284c7';
  ctx.fillStyle = '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(markX - 6, markY - 5);
  ctx.lineTo(markX + 6, markY - 5);
  ctx.lineTo(markX, markY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(markX - 8, markY + 4);
  ctx.lineTo(markX + 8, markY + 4);
  ctx.stroke();

  // Elevation Tag
  ctx.font = 'bold 7.5px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.fillText(`+${elHeight} TOC`, markX + 10, markY + 2);

  // 3. Customizable Safety Railings
  const drawRailingSide = (side: 'north' | 'south' | 'east' | 'west') => {
    ctx.save();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;

    if (side === 'north') {
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(w - 6, 6);
      ctx.stroke();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(6, 4, w - 12, 3);
      for (let rx = 6; rx <= w - 6; rx += Math.min(35, (w - 12) / 3)) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx - 1.5, 4, 3, 5);
      }
    } else if (side === 'south') {
      ctx.beginPath();
      ctx.moveTo(6, h - 6);
      ctx.lineTo(w - 6, h - 6);
      ctx.stroke();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(6, h - 7, w - 12, 3);
      for (let rx = 6; rx <= w - 6; rx += Math.min(35, (w - 12) / 3)) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx - 1.5, h - 9, 3, 5);
      }
    } else if (side === 'west') {
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(6, h - 6);
      ctx.stroke();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(4, 6, 3, h - 12);
      for (let ry = 6; ry <= h - 6; ry += Math.min(35, (h - 12) / 3)) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4, ry - 1.5, 5, 3);
      }
    } else if (side === 'east') {
      ctx.beginPath();
      ctx.moveTo(w - 6, 6);
      ctx.lineTo(w - 6, h - 6);
      ctx.stroke();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(w - 7, 6, 3, h - 12);
      for (let ry = 6; ry <= h - 6; ry += Math.min(35, (h - 12) / 3)) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(w - 9, ry - 1.5, 5, 3);
      }
    }
    ctx.restore();
  };

  if (railingN) drawRailingSide('north');
  if (railingS) drawRailingSide('south');
  if (railingE) drawRailingSide('east');
  if (railingW) drawRailingSide('west');

  // 4. Customizable Access Stairs
  if (stairsWall !== 'none') {
    const stairWidth = 44;
    const stairLen = stairsSteps * 7;
    let sx = 0;
    let sy = 0;
    let sw = 0;
    let sh = 0;

    if (stairsWall === 'south') {
      sx = (w - stairWidth) / 2;
      sy = h;
      sw = stairWidth;
      sh = stairLen;
    } else if (stairsWall === 'north') {
      sx = (w - stairWidth) / 2;
      sy = -stairLen;
      sw = stairWidth;
      sh = stairLen;
    } else if (stairsWall === 'east') {
      sx = w;
      sy = (h - stairWidth) / 2;
      sw = stairLen;
      sh = stairWidth;
    } else {
      sx = -stairLen;
      sy = (h - stairWidth) / 2;
      sw = stairLen;
      sh = stairWidth;
    }

    drawPhotorealisticCementPad(ctx, sx, sy, sw, sh, {
      chamfer: 2,
      showJoints: false,
    });

    if (sw > sh) {
      const treadW = sw / stairsSteps;
      for (let i = 1; i < stairsSteps; i++) {
        const tx = sx + i * treadW;
        ctx.strokeStyle = '#787870';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx, sy + 2);
        ctx.lineTo(tx, sy + sh - 2);
        ctx.stroke();

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx - 1, sy + 2);
        ctx.lineTo(tx - 1, sy + sh - 2);
        ctx.stroke();
      }
    } else {
      const treadH = sh / stairsSteps;
      for (let i = 1; i < stairsSteps; i++) {
        const ty = sy + i * treadH;
        ctx.strokeStyle = '#787870';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + 2, ty);
        ctx.lineTo(sx + sw - 2, ty);
        ctx.stroke();

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx + 2, ty - 1);
        ctx.lineTo(sx + sw - 2, ty - 1);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    if (sw > sh) {
      ctx.strokeRect(sx, sy, sw, 2);
      ctx.strokeRect(sx, sy + sh - 2, sw, 2);
    } else {
      ctx.strokeRect(sx, sy, 2, sh);
      ctx.strokeRect(sx + sw - 2, sy, 2, sh);
    }

    ctx.save();
    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    const arrowMidX = sx + sw / 2;
    const arrowMidY = sy + sh / 2;
    ctx.beginPath();
    if (stairsWall === 'south') {
      ctx.moveTo(arrowMidX, sy + sh - 4);
      ctx.lineTo(arrowMidX, sy + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowMidX - 4, sy + 8);
      ctx.lineTo(arrowMidX, sy + 2);
      ctx.lineTo(arrowMidX + 4, sy + 8);
      ctx.fill();
    } else if (stairsWall === 'north') {
      ctx.moveTo(arrowMidX, sy + 4);
      ctx.lineTo(arrowMidX, sy + sh - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowMidX - 4, sy + sh - 8);
      ctx.lineTo(arrowMidX, sy + sh - 2);
      ctx.lineTo(arrowMidX + 4, sy + sh - 8);
      ctx.fill();
    } else if (stairsWall === 'east') {
      ctx.moveTo(sx + sw - 4, arrowMidY);
      ctx.lineTo(sx + 4, arrowMidY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + 8, arrowMidY - 4);
      ctx.lineTo(sx + 2, arrowMidY);
      ctx.lineTo(sx + 8, arrowMidY + 4);
      ctx.fill();
    } else {
      ctx.moveTo(sx + 4, arrowMidY);
      ctx.lineTo(sx + sw - 4, arrowMidY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + sw - 8, arrowMidY - 4);
      ctx.lineTo(sx + sw - 2, arrowMidY);
      ctx.lineTo(sx + sw - 8, arrowMidY + 4);
      ctx.fill();
    }
    ctx.font = 'bold 6px monospace';
    ctx.fillText('UP', arrowMidX + 6, arrowMidY + 2);
    ctx.restore();
  }

  // 5. Customizable Copper Ground Busbar (MGB)
  if (busbarWall !== 'none') {
    const bbW = 34;
    const bbH = 6;
    let bx = 0;
    let by = 0;
    let bw = 0;
    let bh = 0;

    if (busbarWall === 'east') {
      bx = w - 12;
      by = 20;
      bw = bbH;
      bh = bbW;
    } else if (busbarWall === 'west') {
      bx = 6;
      by = 20;
      bw = bbH;
      bh = bbW;
    } else if (busbarWall === 'north') {
      bx = 20;
      by = 6;
      bw = bbW;
      bh = bbH;
    } else {
      bx = 20;
      by = h - 12;
      bw = bbW;
      bh = bbH;
    }

    const copperGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    copperGrad.addColorStop(0, '#f59e0b');
    copperGrad.addColorStop(0.5, '#d97706');
    copperGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = copperGrad;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = '#fde68a';
    if (bw > bh) {
      for (let lx = bx + 4; lx < bx + bw - 2; lx += 6) {
        ctx.beginPath();
        ctx.arc(lx, by + bh / 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (let ly = by + 4; ly < by + bh - 2; ly += 6) {
        ctx.beginPath();
        ctx.arc(bx + bw / 2, ly, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = 'bold 6.5px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'center';
    if (busbarWall === 'east') ctx.fillText('⏚ MGB', bx - 14, by + bh / 2 + 2);
    else if (busbarWall === 'west') ctx.fillText('⏚ MGB', bx + bw + 14, by + bh / 2 + 2);
    else if (busbarWall === 'north') ctx.fillText('⏚ MGB', bx + bw / 2, by + bh + 8);
    else ctx.fillText('⏚ MGB', bx + bw / 2, by - 3);
  }

  return true;
}
