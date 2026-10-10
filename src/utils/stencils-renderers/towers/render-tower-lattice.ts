import { drawPhotorealisticCementPad } from "../common";
import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderTowerLattice(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case '4leg-tower':
    case 'tower-4leg': {
      // 4 Reinforced Concrete Caisson Footings with authentic cement (dimensionally aligned with CAD 2D & 3D)
      const pierSize = Math.max(16, Math.min(Math.min(w, h) * 0.15, 26));
      const padOffset = pierSize / 2;
      const piers = [
        { x: 0, y: 0 },
        { x: w - pierSize, y: 0 },
        { x: 0, y: h - pierSize },
        { x: w - pierSize, y: h - pierSize },
      ];

      // Concrete Pier Footings with Anchor Bolt Circles
      for (const p of piers) {
        drawPhotorealisticCementPad(ctx, p.x, p.y, pierSize, pierSize, {
          chamfer: 2,
          showJoints: false,
          roundRadius: 3,
        });

        // Steel base leveling plate
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x + 3, p.y + 3, pierSize - 6, pierSize - 6);

        // Heavy galvanized tower leg angle
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(p.x + padOffset, p.y + padOffset, 4, 0, Math.PI * 2);
        ctx.fill();

        // 8-bolt anchor circle
        ctx.fillStyle = '#f59e0b';
        const abr = pierSize * 0.32;
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI * 2) / 8;
          const abx = p.x + padOffset + Math.cos(ang) * abr;
          const aby = p.y + padOffset + Math.sin(ang) * abr;
          ctx.fillRect(abx - 0.7, aby - 0.7, 1.4, 1.4);
        }
      }

      // Heavy Galvanized Steel Outer Chords / Truss Angle Leg Tie
      const pC = [
        { x: padOffset, y: padOffset },
        { x: w - padOffset, y: padOffset },
        { x: w - padOffset, y: h - padOffset },
        { x: padOffset, y: h - padOffset },
      ];

      // Steel truss frame with metallic sheen
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pC[0].x, pC[0].y);
      ctx.lineTo(pC[1].x, pC[1].y);
      ctx.lineTo(pC[2].x, pC[2].y);
      ctx.lineTo(pC[3].x, pC[3].y);
      ctx.closePath();
      ctx.stroke();

      // Intermediate Tapering Lattice Square Frame (Transition to uniform top) - 100% Hollow Core!
      const UNIFORM_TOP_SIZE = 26;
      const topW = Math.min(w - 20, UNIFORM_TOP_SIZE);
      const topH = Math.min(h - 20, UNIFORM_TOP_SIZE);
      const topX = (w - topW) / 2;
      const topY = (h - topH) / 2;

      const midW = topW + (w - topW) * 0.45;
      const midH = topH + (h - topH) * 0.45;
      const midX = (w - midW) / 2;
      const midY = (h - midH) / 2;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(midX, midY, midW, midH);

      // Top Antenna Mount Head Frame & Circular Sector Halo Ring - UNIFORM standard dimension (~26px = 1.3m standard telecom head)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(topX, topY, topW, topH);

      // Circular Sector Ring (Halo Mount) - Uniform standard diameter
      const UNIFORM_HALO_R = 15;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, UNIFORM_HALO_R, 0, Math.PI * 2);
      ctx.stroke();

      // Perimeter Truss Face K-Bracing along North, South, East, West Bays (NO lines crossing center!)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      // North Face K-struts
      ctx.moveTo(pC[0].x, pC[0].y);
      ctx.lineTo(w / 2, midY);
      ctx.lineTo(pC[1].x, pC[1].y);
      // South Face K-struts
      ctx.moveTo(pC[3].x, pC[3].y);
      ctx.lineTo(w / 2, midY + midH);
      ctx.lineTo(pC[2].x, pC[2].y);
      // West Face K-struts
      ctx.moveTo(pC[0].x, pC[0].y);
      ctx.lineTo(midX, h / 2);
      ctx.lineTo(pC[3].x, pC[3].y);
      // East Face K-struts
      ctx.moveTo(pC[1].x, pC[1].y);
      ctx.lineTo(midX + midW, h / 2);
      ctx.lineTo(pC[2].x, pC[2].y);
      ctx.stroke();

      // Corner Gusset Tie Plates at the 4 Corner Legs (tapering inwards towards top head)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(topX, topY);
      ctx.moveTo(midX + midW, midY);
      ctx.lineTo(topX + topW, topY);
      ctx.moveTo(midX + midW, midY + midH);
      ctx.lineTo(topX + topW, topY + topH);
      ctx.moveTo(midX, midY + midH);
      ctx.lineTo(topX, topY + topH);
      ctx.stroke();

      // Safety Climb Ladder on North Face Leg Chord (Center core remains 100% hollow and unobstructed)
      const ladX = w / 2 - 8;
      const ladY = pC[0].y + 2;
      const ladW = 16;
      const ladH = 14;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ladX, ladY, ladW, ladH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(ladX, ladY, ladW, ladH);

      // Ladder Rungs
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let r = ladY + 3; r <= ladY + ladH - 3; r += 3.5) {
        ctx.beginPath();
        ctx.moveTo(ladX + 2, r);
        ctx.lineTo(ladX + ladW - 2, r);
        ctx.stroke();
      }

      const towerH = obj.towerHeightM || obj.customProps?.towerHeightM;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText(towerH ? `4-LEG LATTICE (H=${towerH}m)` : '4-LEG LATTICE (HOLLOW CORE)', w / 2, h + 12);
      return true;
    }

    case '3leg-tower':
    case 'tower-3leg': {
      // 3 Triangular Foundation Caissons with authentic cement - dimensionally aligned with CAD and 3D
      const pR = Math.max(12, Math.min(Math.min(w, h) * 0.115, 18));
      const p1 = { x: w / 2, y: pR };
      const p2 = { x: w - pR, y: h - pR };
      const p3 = { x: pR, y: h - pR };

      // 3 Footing pads with 6 anchor bolts each
      for (const p of [p1, p2, p3]) {
        drawPhotorealisticCementPad(ctx, p.x - pR, p.y - pR, pR * 2, pR * 2, {
          chamfer: 2,
          showJoints: false,
          roundRadius: pR,
        });

        // Leg baseplate
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pR * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Tubular steel leg
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // 6 anchor bolts
        ctx.fillStyle = '#f59e0b';
        for (let b = 0; b < 6; b++) {
          const ba = (b * Math.PI * 2) / 6;
          ctx.fillRect(p.x + Math.cos(ba) * 7 - 0.7, p.y + Math.sin(ba) * 7 - 0.7, 1.4, 1.4);
        }
      }

      // Outer Triangular Tubular Steel Chords
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();

      // Center Node of Triangular Tower
      const center = { x: w / 2, y: h * 0.58 };

      // UNIFORM Standard Telecom Tower Top Dimensions
      // Regardless of the base leg distance / diameter, the top is UNIFORM (~15px radius = 1.5m radius)
      const UNIFORM_TOP_R = 15;
      const topPts: { x: number; y: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
        topPts.push({
          x: center.x + Math.cos(ang) * UNIFORM_TOP_R,
          y: center.y + Math.sin(ang) * UNIFORM_TOP_R,
        });
      }

      // 3 Main Tubular Steel Legs Tapering to Uniform Top Head Frame
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(topPts[0].x, topPts[0].y);
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(topPts[1].x, topPts[1].y);
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(topPts[2].x, topPts[2].y);
      ctx.stroke();

      // Intermediate Tapering Triangular Frame
      const midPts: { x: number; y: number }[] = [
        { x: (p1.x + topPts[0].x) / 2, y: (p1.y + topPts[0].y) / 2 },
        { x: (p2.x + topPts[1].x) / 2, y: (p2.y + topPts[1].y) / 2 },
        { x: (p3.x + topPts[2].x) / 2, y: (p3.y + topPts[2].y) / 2 },
      ];
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(midPts[0].x, midPts[0].y);
      ctx.lineTo(midPts[1].x, midPts[1].y);
      ctx.lineTo(midPts[2].x, midPts[2].y);
      ctx.closePath();
      ctx.stroke();

      // UNIFORM Top Triangular Structural Tie Head Frame
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(topPts[0].x, topPts[0].y);
      ctx.lineTo(topPts[1].x, topPts[1].y);
      ctx.lineTo(topPts[2].x, topPts[2].y);
      ctx.closePath();
      ctx.stroke();

      // UNIFORM Top Circular Antenna Halo Mount Ring (Standard ~16px radius)
      const UNIFORM_HALO_R = 16;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(center.x, center.y, UNIFORM_HALO_R, 0, Math.PI * 2);
      ctx.stroke();

      // 3 Cellular Sector Panel Antennas at 120° (Mounted on Halo Ring)
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const ax = center.x + Math.cos(ang) * (UNIFORM_HALO_R + 2);
        const ay = center.y + Math.sin(ang) * (UNIFORM_HALO_R + 2);
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillRect(-5, -2.5, 10, 5);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-5, -2.5, 10, 5);
        ctx.restore();
      }

      // Center Antenna Feed Line & Mast
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const towerH = obj.towerHeightM || obj.customProps?.towerHeightM;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText(towerH ? `3-LEG LATTICE (H=${towerH}m)` : '3-LEG LATTICE (TRIANGULAR)', w / 2, h + 12);
      return true;
    }


  }
  return false;
}
