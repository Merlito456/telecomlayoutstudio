import { drawPhotorealisticCementPad } from "../common";
import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderTowerMonopoles(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'monopole':
    case 'monopole-tower':
    case 'monopole-platform': {
      const cx = w / 2;
      const cy = h / 2;
      const isPlatform = stencilId === 'monopole-platform';
      const baseR = Math.min(w, h) * (isPlatform ? 0.38 : 0.45);
      const poleR = baseR * 0.58;
      const topR = poleR * 0.65;

      // 0. If Platform, draw circular outer rigger maintenance platform with safety grating
      if (isPlatform) {
        const platR = Math.min(w, h) * 0.48;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx, cy, platR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Radial grating struts
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI * 2) / 12;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR);
          ctx.lineTo(cx + Math.cos(a) * platR, cy + Math.sin(a) * platR);
          ctx.stroke();
        }
      }

      // 1. Drilled Concrete Caisson Footing Base (authentic cement)
      drawPhotorealisticCementPad(ctx, cx - baseR - 4, cy - baseR - 4, (baseR + 4) * 2, (baseR + 4) * 2, {
        chamfer: 4,
        showJoints: false,
        roundRadius: baseR + 4,
        embossText: 'CAISSON 35MPa',
      });

      // 2. Heavy Circular Steel Baseplate Flange
      const flangeGrad = ctx.createRadialGradient(cx - 2, cy - 2, 2, cx, cy, baseR);
      flangeGrad.addColorStop(0, '#64748b');
      flangeGrad.addColorStop(0.7, '#334155');
      flangeGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = flangeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. High-Tensile 16-Bolt Anchor Bolt Circle
      const boltCircleR = (baseR + poleR) / 2;
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI * 2) / 16;
        const bx = cx + Math.cos(ang) * boltCircleR;
        const by = cy + Math.sin(ang) * boltCircleR;

        // Washer
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Nut
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(bx, by, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Thick Tapered Steel Pole Barrel (Single Leg)
      const poleGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, poleR);
      poleGrad.addColorStop(0, '#f8fafc');
      poleGrad.addColorStop(0.4, '#94a3b8');
      poleGrad.addColorStop(0.85, '#475569');
      poleGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = poleGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, poleR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pole Top Taper Ring
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(cx, cy, topR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center Hollow Cable Duct & Handhole
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // 5. Three-Sector Antenna Mount Frames (T-Arms radiating at 120°)
      for (let s = 0; s < 3; s++) {
        const ang = (s * Math.PI * 2) / 3 - Math.PI / 2;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        const armEndDist = baseR + 10;
        const armX = cx + cos * armEndDist;
        const armY = cy + sin * armEndDist;

        // Radial structural standoff pipe
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx + cos * topR, cy + sin * topR);
        ctx.lineTo(armX, armY);
        ctx.stroke();

        // Cross T-Arm bar
        const perpX = -sin * 12;
        const perpY = cos * 12;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(armX - perpX, armY - perpY);
        ctx.lineTo(armX + perpX, armY + perpY);
        ctx.stroke();

        // 2 Cellular Panel Antennas per Sector (White boxes with blue rim)
        [-perpX * 0.7, perpX * 0.7].forEach((pxOffset, idx) => {
          const pyOffset = idx === 0 ? -perpY * 0.7 : perpY * 0.7;
          const antX = armX + pxOffset;
          const antY = armY + pyOffset;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(antX, antY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // Title badge
      const towerH = obj.towerHeightM || obj.customProps?.towerHeightM;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText(towerH ? `MONOPOLE (H=${towerH}m)` : 'MONOPOLE (1-LEG)', cx, cy + baseR + 12);
      return true;
    }


  }
  return false;
}
