import { drawPhotorealisticCementPad } from "../common";
import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderTowerGuyedRooftop(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'guyed-tower': {
      const cx = w / 2;
      const cy = h / 2;
      const anchorDist = Math.min(w, h) * 0.42;

      // 1. Central Pivot Footing (Concrete Pier)
      drawPhotorealisticCementPad(ctx, cx - 12, cy - 12, 24, 24, {
        chamfer: 2,
        showJoints: false,
        roundRadius: 4,
      });

      // 2. Central Slender Triangular Lattice Mast
      const mR = 8;
      const mp1 = { x: cx, y: cy - mR };
      const mp2 = { x: cx + mR * 0.866, y: cy + mR * 0.5 };
      const mp3 = { x: cx - mR * 0.866, y: cy + mR * 0.5 };

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(mp1.x, mp1.y);
      ctx.lineTo(mp2.x, mp2.y);
      ctx.lineTo(mp3.x, mp3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. 3 Ground Guy Anchor Concrete Blocks at 120°
      const anchorAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
      anchorAngles.forEach((ang) => {
        const ax = cx + Math.cos(ang) * anchorDist;
        const ay = cy + Math.sin(ang) * anchorDist;

        // Heavy concrete anchor deadman block
        drawPhotorealisticCementPad(ctx, ax - 10, ay - 8, 20, 16, {
          chamfer: 2,
          showJoints: false,
          embossText: 'GUY BLK',
        });

        // Steel eye bracket with turnbuckle
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(ax - 2, ay - 2, 4, 4);

        // Turnbuckle body
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(ang) * 8, ay - Math.sin(ang) * 8);
        ctx.stroke();

        // Dual Guy Wire Steel Cables (Inner & Outer levels)
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);

        // Cable 1
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax - Math.cos(ang) * 8, ay - Math.sin(ang) * 8);
        ctx.stroke();

        // Cable 2 (slight offset for dual wire)
        const perpX = -Math.sin(ang) * 3;
        const perpY = Math.cos(ang) * 3;
        ctx.beginPath();
        ctx.moveTo(cx + perpX, cy + perpY);
        ctx.lineTo(ax + perpX, ay + perpY);
        ctx.stroke();
        ctx.restore();
      });

      // Label
      const towerH = obj.towerHeightM || obj.customProps?.towerHeightM;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(towerH ? `GUYED TOWER (H=${towerH}m)` : 'GUYED TOWER (1-LEG MAST + GUYS)', cx, h + 12);
      return true;
    }

    case 'rooftop-mount': {
      // Non-Penetrating Rooftop Ballasted Skid Mount
      // 1. Building Concrete Roof Slab
      drawPhotorealisticCementPad(ctx, 4, 4, w - 8, h - 8, {
        chamfer: 3,
        showJoints: true,
        embossText: 'CONCRETE ROOF DECK',
      });

      // 2. Protective Rubber Neoprene Skid Mats
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, 10, w - 20, 8);
      ctx.fillRect(10, h - 18, w - 20, 8);
      ctx.fillRect(10, 10, 8, h - 20);
      ctx.fillRect(w - 18, 10, 8, h - 20);

      // 3. Galvanized Steel Skid H-Frame
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      // Cross beams
      ctx.beginPath();
      ctx.moveTo(w / 2, 14);
      ctx.lineTo(w / 2, h - 14);
      ctx.moveTo(14, h / 2);
      ctx.lineTo(w - 14, h / 2);
      ctx.stroke();

      // 4. Precast Concrete Ballast Blocks (8 blocks placed in corner trays)
      const bW = 16;
      const bH = 12;
      const bPositions = [
        { x: 18, y: 18 },
        { x: 18 + bW + 2, y: 18 },
        { x: w - 18 - bW * 2 - 2, y: 18 },
        { x: w - 18 - bW, y: 18 },
        { x: 18, y: h - 18 - bH },
        { x: 18 + bW + 2, y: h - 18 - bH },
        { x: w - 18 - bW * 2 - 2, y: h - 18 - bH },
        { x: w - 18 - bW, y: h - 18 - bH },
      ];

      for (const bp of bPositions) {
        drawPhotorealisticCementPad(ctx, bp.x, bp.y, bW, bH, {
          chamfer: 1,
          showJoints: false,
          embossText: 'BALLAST',
        });
      }

      // 5. Central Vertical Steel Pipe Mast & Collar Clamps
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3 Sector Antenna Mount Arms radiating from mast
      for (let s = 0; s < 3; s++) {
        const ang = (s * Math.PI * 2) / 3 - Math.PI / 2;
        const armX = cx + Math.cos(ang) * 22;
        const armY = cy + Math.sin(ang) * 22;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(armX, armY);
        ctx.stroke();

        // Antenna panel
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(armX, armY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const towerH = obj.towerHeightM || obj.customProps?.towerHeightM;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(towerH ? `ROOFTOP MOUNT (H=${towerH}m)` : 'ROOFTOP MOUNT (NO LEGS)', cx, h + 12);
      return true;
    }

    case 'rooftop-parapet-mount': {
      // 1. Concrete Parapet Wall Section
      drawPhotorealisticCementPad(ctx, 2, 2, w - 4, 24, {
        chamfer: 2,
        showJoints: false,
        embossText: 'PARAPET WALL',
      });

      // 2. Heavy Clamping Brackets
      ctx.fillStyle = '#475569';
      ctx.fillRect(18, 16, 14, 34);
      ctx.fillRect(w - 32, 16, 14, 34);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 16, 14, 34);
      ctx.strokeRect(w - 32, 16, 14, 34);

      // Clamp bolts
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(23, 20, 4, 4);
      ctx.fillRect(23, 38, 4, 4);
      ctx.fillRect(w - 27, 20, 4, 4);
      ctx.fillRect(w - 27, 38, 4, 4);

      // 3. Standoff Boom Pipe
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, 44);
      ctx.lineTo(w - 14, 44);
      ctx.stroke();

      // 4. Center Antenna Mast
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(w / 2, 44, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Directional Cellular Panel Antenna
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(w / 2 - 16, 56, 32, 14);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w / 2 - 16, 56, 32, 14);

      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('PARAPET MOUNT (NO LEGS)', w / 2, h + 12);
      return true;
    }

    // ==========================================
    // 8. AIR CONDITIONER (HVAC Condenser)
    // ==========================================
    case 'tower-footing': {
      // Reinforced concrete round caisson pier
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 3,
        showJoints: false,
        roundRadius: Math.min(w, h) / 2,
      });

      // Steel baseplate
      ctx.fillStyle = '#1e293b';
      const plSize = Math.min(w, h) * 0.55;
      ctx.fillRect(w / 2 - plSize / 2, h / 2 - plSize / 2, plSize, plSize);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w / 2 - plSize / 2, h / 2 - plSize / 2, plSize, plSize);

      // 8 anchor bolts
      ctx.fillStyle = '#f59e0b';
      const abr = plSize * 0.42;
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        const abx = w / 2 + Math.cos(ang) * abr;
        const aby = h / 2 + Math.sin(ang) * abr;
        ctx.beginPath();
        ctx.arc(abx, aby, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'guy-anchor': {
      // Concrete deadman block with authentic cement finish
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 3,
        showJoints: false,
        roundRadius: 4,
        embossText: 'DEADMAN ANCHOR',
      });

      // Steel Turnbuckle with Jaw & Eye
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(w / 2 - 10, h / 2 - 2, 20, 4);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 - 10, h / 2 - 2, 20, 4);

      // Eye loop
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2 - 10, h / 2, 4, 0, Math.PI * 2);
      ctx.arc(w / 2 + 10, h / 2, 4, 0, Math.PI * 2);
      ctx.stroke();
      return true;
    }

    // ==========================================
    // OUTSIDE ENVIRONMENT & SITE SURFACE 2D

  }
  return false;
}
