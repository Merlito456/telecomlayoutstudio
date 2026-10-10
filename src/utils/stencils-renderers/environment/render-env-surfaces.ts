import { drawPhotorealisticCementPad } from "../common";
import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderEnvironmentSurfaces(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'gravel-pad':
    case 'compound-gravel': {
      // Timber/steel/concrete containment border
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Multi-tonal aggregate crushed stones & pebbles
      const gravelColors = ['#a8a29e', '#78716c', '#57534e', '#d6d3d1', '#44403c'];
      for (let gy = 6; gy < h - 6; gy += 8) {
        for (let gx = 6; gx < w - 6; gx += 8) {
          const col = gravelColors[Math.floor(Math.sin(gx * 7 + gy * 13) * 2.5 + 2.5) % gravelColors.length];
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(gx + (Math.sin(gy) * 2), gy + (Math.cos(gx) * 2), 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return true;
    }

    // ==========================================
    // 11b. UNEVEN LEVELS: EXCAVATED PIT & ELEVATED TERRACES
    // ==========================================
    case 'excavated-pit': {
      // For excavated area, do not display it in the 2D Drafting (CAD) canvas
      return true;
    }

    case 'elevated-terrace': {
      const mat = obj.foundationRetainingMaterial || obj.customProps?.foundationRetainingMaterial || 'concrete';
      const elevM = Math.abs(obj.levelElevationM ?? obj.customProps?.levelElevationM ?? 0.8);

      // Elevated terrace drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;

      // Poured concrete / hardscape plateau
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 3,
        showJoints: true,
        roundRadius: 3,
      });
      ctx.restore();

      // Holding foundation boundary according to material
      if (mat === 'metal') {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, w - 2, h - 2);
      } else if (mat === 'earth') {
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, w - 2, h - 2);
      } else if (mat === 'gravel') {
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, w - 2, h - 2);
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, w - 2, h - 2);
      }

      // Terrace label watermark
      ctx.save();
      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`▲ ELEVATED TERRACE (+${elevM.toFixed(1)}m) [${mat.toUpperCase()}]`, w / 2, h / 2);
      ctx.restore();
      return true;
    }

    case 'earth-berm-level': {
      const mat = obj.foundationRetainingMaterial || obj.customProps?.foundationRetainingMaterial || 'earth';
      const elevM = Math.abs(obj.levelElevationM ?? obj.customProps?.levelElevationM ?? 0.6);

      // Compacted earthen berm platform
      ctx.save();
      const dirtGrad = ctx.createLinearGradient(0, 0, w, h);
      dirtGrad.addColorStop(0, '#92400e');
      dirtGrad.addColorStop(0.5, '#78350f');
      dirtGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = dirtGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 6);
      ctx.fill();

      // Berm slope contour
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.setLineDash([]);

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Watermark
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`▲ EARTHEN MOUND (+${elevM.toFixed(1)}m) [${mat.toUpperCase()}]`, w / 2, h / 2);
      ctx.restore();
      return true;
    }

    // ==========================================
    // 12. NATURAL GRASS / TURF AREA
    // ==========================================
    case 'grass-area': {
      // 100% Solid Opaque base soil and rich lush lawn turf (cleanly covers gravel and other surfaces underneath)
      ctx.save();
      ctx.globalAlpha = 1.0;
      const turfGrad = ctx.createLinearGradient(0, 0, w, h);
      turfGrad.addColorStop(0, '#15803d');
      turfGrad.addColorStop(0.5, '#166534');
      turfGrad.addColorStop(1, '#14532d');

      ctx.fillStyle = turfGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 6);
      ctx.fill();

      // Outer crisp boundary border
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mowing stripe bands
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let bx = 0; bx < w; bx += 24) {
        ctx.fillRect(bx, 0, 12, h);
      }

      // Organic grass blade tufts
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.2;
      for (let gy = 12; gy < h - 12; gy += 16) {
        for (let gx = 12; gx < w - 12; gx += 20) {
          const ox = gx + Math.sin(gy) * 4;
          const oy = gy;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox - 2, oy - 4);
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox + 2, oy - 5);
          ctx.stroke();
        }
      }
      ctx.restore();
      return true;
    }

    // ==========================================
    // 13. MASONRY SECURITY WALL (Closed Terminals)
    // ==========================================
    case 'grass-patch': {
      // Natural grass turf with subtle tone gradients and blade textures
      const grassGrad = ctx.createLinearGradient(0, 0, w, h);
      grassGrad.addColorStop(0, '#15803d');
      grassGrad.addColorStop(0.5, '#166534');
      grassGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 0, w, h);

      // Grass texture specks
      const specks = Math.min(Math.floor((w * h) / 40), 200);
      for (let i = 0; i < specks; i++) {
        const sx = ((i * 37 + 11) % 997) / 997 * w;
        const sy = ((i * 73 + 19) % 991) / 991 * h;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(74, 222, 128, 0.25)' : 'rgba(5, 46, 22, 0.35)';
        ctx.fillRect(sx, sy, 2, 2);
      }
      return true;
    }

    case 'concrete-yard': {
      drawPhotorealisticCementPad(ctx, 0, 0, w, h, {
        chamfer: 3,
        showJoints: true,
        roundRadius: 2,
        embossText: 'CONCRETE PAVEMENT',
      });
      return true;
    }

    case 'road-segment':
    case 'asphalt-road': {
      // Crushed aggregate gravel shoulders
      ctx.fillStyle = '#44403c';
      ctx.fillRect(0, 0, w, h);

      // Bitumen Asphalt roadway bed
      const roadMargin = 4;
      const roadGrad = ctx.createLinearGradient(0, roadMargin, 0, h - roadMargin);
      roadGrad.addColorStop(0, '#1e293b');
      roadGrad.addColorStop(0.5, '#0f172a');
      roadGrad.addColorStop(1, '#182234');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, roadMargin, w, h - roadMargin * 2);

      // Asphalt fine aggregate flecks
      const asphaltDots = Math.min(Math.floor(w * h / 50), 180);
      for (let i = 0; i < asphaltDots; i++) {
        const ax = ((i * 47 + 7) % 997) / 997 * w;
        const ay = roadMargin + (((i * 89 + 13) % 991) / 991) * (h - roadMargin * 2);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(ax, ay, 1.5, 1.5);
      }

      // Outer solid white shoulder lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, roadMargin + 4);
      ctx.lineTo(w, roadMargin + 4);
      ctx.moveTo(0, h - roadMargin - 4);
      ctx.lineTo(w, h - roadMargin - 4);
      ctx.stroke();

      // Center dashed yellow lane divider
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      return true;
    }

    case 'sidewalk': {
      // Raised concrete pedestrian sidewalk
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Surface concrete gradient
      const walkGrad = ctx.createLinearGradient(0, 0, 0, h);
      walkGrad.addColorStop(0, '#e2e8f0');
      walkGrad.addColorStop(0.85, '#cbd5e1');
      walkGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = walkGrad;
      ctx.fillRect(0, 0, w, h);

      // Transverse contraction joint lines every 24px
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
      ctx.lineWidth = 1;
      for (let x = 24; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h - 5);
        ctx.stroke();
      }

      // Raised roadside stone curb bevel
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, h - 5, w, 5);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h - 5);
      ctx.lineTo(w, h - 5);
      ctx.stroke();
      return true;
    }


  }
  return false;
}
