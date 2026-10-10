import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderEnvironmentLandscapeDetails(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'tree-deciduous':
    case 'tree-oak': {
      // Natural Deciduous Organic Tree Canopy (Multi-lobed foliage clusters)
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 2 - 4;

      // Ground shadow under tree
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = 'rgba(21, 128, 61, 0.8)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer foliage clusters (6 overlapping organic circles)
      const clusters = [
        { x: cx - r * 0.45, y: cy - r * 0.35, cr: r * 0.55 },
        { x: cx + r * 0.45, y: cy - r * 0.35, cr: r * 0.55 },
        { x: cx + r * 0.5, y: cy + r * 0.3, cr: r * 0.52 },
        { x: cx - r * 0.5, y: cy + r * 0.3, cr: r * 0.52 },
        { x: cx, y: cy - r * 0.45, cr: r * 0.5 },
        { x: cx, y: cy + r * 0.45, cr: r * 0.5 },
      ];

      for (const cl of clusters) {
        const cGrad = ctx.createRadialGradient(cl.x - cl.cr * 0.3, cl.y - cl.cr * 0.3, 2, cl.x, cl.y, cl.cr);
        cGrad.addColorStop(0, '#4ade80');
        cGrad.addColorStop(0.4, '#22c55e');
        cGrad.addColorStop(0.8, '#15803d');
        cGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.cr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center lush crown highlight
      const crownGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 2, cx, cy, r * 0.65);
      crownGrad.addColorStop(0, '#86efac');
      crownGrad.addColorStop(0.5, '#22c55e');
      crownGrad.addColorStop(1, '#166534');
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Branching wood trunk structure visible at center
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - r * 0.35, cy - r * 0.35);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * 0.35, cy - r * 0.35);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy + r * 0.4);
      ctx.stroke();

      // Center trunk hub
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'flowers-bed': {
      // Landscaping Flower Bed with Rich Soil & Vibrant Flowers
      // Stone retaining curb border
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 6);
      ctx.fill();
      ctx.restore();

      // Dark organic garden soil bed
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.roundRect(3, 3, w - 6, h - 6, 4);
      ctx.fill();

      // Dense flower blossoms
      const flowers = [
        { color: '#ef4444', ring: '#b91c1c' }, // Red rose
        { color: '#facc15', ring: '#ca8a04' }, // Yellow marigold
        { color: '#ec4899', ring: '#be185d' }, // Pink petunia
        { color: '#a855f7', ring: '#7e22ce' }, // Purple aster
        { color: '#ffffff', ring: '#cbd5e1' }, // White daisy
      ];

      const numFlowers = Math.min(Math.floor((w * h) / 75), 36);
      for (let i = 0; i < numFlowers; i++) {
        const fx = 8 + (((i * 43 + 17) % 997) / 997) * (w - 16);
        const fy = 8 + (((i * 79 + 23) % 991) / 991) * (h - 16);
        const fl = flowers[i % flowers.length];

        // Green leaves underneath blossom
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(fx - 2, fy, 3.5, 0, Math.PI * 2);
        ctx.arc(fx + 2, fy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Petal circle
        ctx.fillStyle = fl.color;
        ctx.beginPath();
        ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = fl.ring;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Yellow flower center pollen
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'drainage-canal': {
      // Concrete Stormwater Drainage Canal with Flowing Water Channel
      // Concrete bank embankments (top and bottom)
      const concGrad = ctx.createLinearGradient(0, 0, 0, h);
      concGrad.addColorStop(0, '#94a3b8');
      concGrad.addColorStop(0.2, '#64748b');
      concGrad.addColorStop(0.8, '#64748b');
      concGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = concGrad;
      ctx.fillRect(0, 0, w, h);

      // Embankment slope angle hatching
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 0.8;
      for (let x = 10; x < w; x += 15) {
        // Top slope
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 5, 10);
        ctx.stroke();
        // Bottom slope
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x - 5, h - 10);
        ctx.stroke();
      }

      // Flowing Water Stream Bed
      const waterGrad = ctx.createLinearGradient(0, 10, 0, h - 10);
      waterGrad.addColorStop(0, '#38bdf8');
      waterGrad.addColorStop(0.3, '#0284c7');
      waterGrad.addColorStop(0.7, '#0369a1');
      waterGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 10, w, h - 20);

      // Water flow wave ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      for (let x = 16; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, h / 2 - 4);
        ctx.quadraticCurveTo(x + 8, h / 2 - 8, x + 16, h / 2 - 4);
        ctx.stroke();
      }

      // Concrete retaining lip borders
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(w, 10);
      ctx.moveTo(0, h - 10);
      ctx.lineTo(w, h - 10);
      ctx.stroke();
      return true;
    }

    case 'site-person': {
      // Telecom Site Engineer / Field Technician (Top-Down Orthographic)
      const cx = w / 2;
      const cy = h / 2;

      // Drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shoulders with High-Vis Fluorescent Orange Vest
      const vestGrad = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
      vestGrad.addColorStop(0, '#ea580c');
      vestGrad.addColorStop(0.5, '#f97316');
      vestGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = vestGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy - 7, 20, 14, 4);
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Silver Retroreflective 3M Safety Stripes on Shoulders
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cx - 8, cy - 7, 3, 14);
      ctx.fillRect(cx + 5, cy - 7, 3, 14);

      // Yellow Safety Hard Hat
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy - 1, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Hard Hat Center Ridge
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 1, cy - 7, 2, 12);

      // Engineering Tablet held in hands
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 5, cy + 4, 10, 6);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cx - 5, cy + 4, 10, 6);
      // Illuminated tablet screen
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 4, cy + 5, 8, 4);
      return true;
    }

    // ==========================================
    // WALL EQUIPMENT ROOF SHADE (CANOPY)

  }
  return false;
}
