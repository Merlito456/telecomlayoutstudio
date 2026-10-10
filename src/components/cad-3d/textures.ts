import * as THREE from "three";

const cachedProceduralTextures: Partial<Record<string, THREE.CanvasTexture>> = {};

  // Procedural Concrete Texture Generator (Cached across opens for instant 3D startup)
  export function createConcreteTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.concrete) return cachedProceduralTextures.concrete;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base concrete tone: authentic warm Portland cement grey
    ctx.fillStyle = '#b8b8b0';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle broom finish striations
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 4) {
      ctx.strokeStyle = y % 8 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(50, 48, 44, 0.06)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Micro aggregate & sand flecks
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 1.5;
      if (i % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; // Limestone
      } else if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(50, 45, 40, 0.25)'; // Basalt speck
      } else {
        ctx.fillStyle = 'rgba(160, 150, 130, 0.2)'; // Sand grain
      }
      ctx.fillRect(x, y, r, r);
    }

    // Tooled expansion joint grooves
    ctx.strokeStyle = 'rgba(60, 55, 50, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 508, 508);
    ctx.beginPath();
    ctx.moveTo(256, 2);
    ctx.lineTo(256, 510);
    ctx.moveTo(2, 256);
    ctx.lineTo(510, 256);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cachedProceduralTextures.concrete = texture;
    return texture;
  }

  // Procedural Crushed Gravel Texture Generator
  export function createGravelTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.gravel) return cachedProceduralTextures.gravel;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#44403c';
    ctx.fillRect(0, 0, 256, 256);

    const stoneColors = ['#78716c', '#a8a29e', '#57534e', '#d6d3d1', '#292524'];
    for (let i = 0; i < 1200; i++) {
      const gx = Math.random() * 256;
      const gy = Math.random() * 256;
      const gr = 1.5 + Math.random() * 3;
      ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    cachedProceduralTextures.gravel = texture;
    return texture;
  }

  // Procedural Chainlink Fence Wire Mesh Texture with alpha cutout
  export function createChainlinkTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.chainlink) return cachedProceduralTextures.chainlink;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 64, 64);
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(32, 0);
    ctx.lineTo(64, 32);
    ctx.lineTo(32, 64);
    ctx.closePath();
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 4);
    cachedProceduralTextures.chainlink = texture;
    return texture;
  }

  // Procedural Natural Green Grass Lawn Texture Generator
  export function createGrassTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.grass) return cachedProceduralTextures.grass;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 256, 256);

    const shades = ['#166534', '#14532d', '#22c55e', '#16a34a', '#15803d'];
    for (let i = 0; i < 2800; i++) {
      const gx = Math.random() * 256;
      const gy = Math.random() * 256;
      const len = 2 + Math.random() * 4;
      ctx.strokeStyle = shades[Math.floor(Math.random() * shades.length)];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (Math.random() - 0.5) * 2, gy - len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    cachedProceduralTextures.grass = texture;
    return texture;
  }

  // Procedural Coarse Bitumen Asphalt Road Texture Generator
  export function createAsphaltTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.asphalt) return cachedProceduralTextures.asphalt;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 256, 256);

    const specks = ['#27272a', '#3f3f46', '#52525b', '#09090b', '#71717a'];
    for (let i = 0; i < 2200; i++) {
      const ax = Math.random() * 256;
      const ay = Math.random() * 256;
      const ar = 1 + Math.random() * 2;
      ctx.fillStyle = specks[Math.floor(Math.random() * specks.length)];
      ctx.fillRect(ax, ay, ar, ar);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    cachedProceduralTextures.asphalt = texture;
    return texture;
  }

  // Procedural Compacted Earth / Red Clay Dirt Texture Generator
  export function createDirtTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.dirt) return cachedProceduralTextures.dirt;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 256, 256);

    const earthTones = ['#92400e', '#b45309', '#451a03', '#a16207', '#d97706'];
    for (let i = 0; i < 1600; i++) {
      const ex = Math.random() * 256;
      const ey = Math.random() * 256;
      const er = 1.5 + Math.random() * 2.5;
      ctx.fillStyle = earthTones[Math.floor(Math.random() * earthTones.length)];
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    cachedProceduralTextures.dirt = texture;
    return texture;
  }

  // Procedural Realistic Cloud Puff Texture Generator
  export function createCloudPuffTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.cloudPuff) return cachedProceduralTextures.cloudPuff;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 256);

    // Multi-lobed organic cloud puff profile
    const lobes = [
      { x: 128, y: 128, r: 84, maxA: 0.95 },
      { x: 102, y: 110, r: 64, maxA: 0.88 },
      { x: 154, y: 114, r: 66, maxA: 0.88 },
      { x: 80, y: 140, r: 54, maxA: 0.78 },
      { x: 174, y: 136, r: 58, maxA: 0.78 },
      { x: 128, y: 92, r: 60, maxA: 0.85 },
      { x: 118, y: 158, r: 68, maxA: 0.82 },
    ];

    for (const lobe of lobes) {
      const grad = ctx.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, lobe.r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${lobe.maxA})`);
      grad.addColorStop(0.42, `rgba(255, 255, 255, ${lobe.maxA * 0.76})`);
      grad.addColorStop(0.74, `rgba(255, 255, 255, ${lobe.maxA * 0.28})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    cachedProceduralTextures.cloudPuff = texture;
    return texture;
  }

  // Procedural High-Altitude Cirrus Cloud Texture Generator
  export function createCirrusTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.cirrus) return cachedProceduralTextures.cirrus;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 512);

    for (let i = 0; i < 45; i++) {
      const y = Math.random() * 512;
      const h = 8 + Math.random() * 26;
      const grad = ctx.createLinearGradient(0, y - h, 0, y + h);
      const alpha = 0.08 + Math.random() * 0.16;
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(
        256 + (Math.random() - 0.5) * 140,
        y,
        220 + Math.random() * 90,
        h,
        (Math.random() - 0.5) * 0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cachedProceduralTextures.cirrus = texture;
    return texture;
  }

  // Procedural Radiant Solar Corona & Flare Texture Generator
  export function createSunCoronaTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.sunCorona) return cachedProceduralTextures.sunCorona;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 512);

    const grad = ctx.createRadialGradient(256, 256, 12, 256, 256, 256);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.08, 'rgba(255, 250, 220, 0.95)');
    grad.addColorStop(0.22, 'rgba(255, 220, 140, 0.65)');
    grad.addColorStop(0.48, 'rgba(255, 180, 80, 0.25)');
    grad.addColorStop(0.78, 'rgba(255, 140, 40, 0.06)');
    grad.addColorStop(1.0, 'rgba(255, 120, 20, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 + 0.1;
      const rayLen = 190 + (i % 2 === 0 ? 65 : 25);
      const gradRay = ctx.createRadialGradient(256, 256, 18, 256, 256, rayLen);
      gradRay.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
      gradRay.addColorStop(0.4, 'rgba(255, 210, 120, 0.18)');
      gradRay.addColorStop(1, 'rgba(255, 180, 60, 0)');

      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate(angle);
      ctx.fillStyle = gradRay;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, rayLen);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    cachedProceduralTextures.sunCorona = texture;
    return texture;
  }

  // Procedural Lunar Disk with Craters & Glow Generator
  export function createMoonTexture(): THREE.CanvasTexture | null {
    if (cachedProceduralTextures.moon) return cachedProceduralTextures.moon;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 256);

    const diskGrad = ctx.createRadialGradient(128, 128, 0, 128, 128, 110);
    diskGrad.addColorStop(0, '#f1f5f9');
    diskGrad.addColorStop(0.85, '#cbd5e1');
    diskGrad.addColorStop(1, '#94a3b8');

    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(128, 128, 105, 0, Math.PI * 2);
    ctx.fill();

    const maria = [
      { x: 100, y: 100, r: 35 },
      { x: 145, y: 88, r: 28 },
      { x: 155, y: 135, r: 38 },
      { x: 110, y: 148, r: 25 },
      { x: 80, y: 130, r: 20 },
      { x: 125, y: 118, r: 18 },
    ];
    for (const m of maria) {
      const gradM = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
      gradM.addColorStop(0, 'rgba(100, 116, 139, 0.55)');
      gradM.addColorStop(0.7, 'rgba(100, 116, 139, 0.35)');
      gradM.addColorStop(1, 'rgba(100, 116, 139, 0)');
      ctx.fillStyle = gradM;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const glowGrad = ctx.createRadialGradient(128, 128, 100, 128, 128, 128);
    glowGrad.addColorStop(0, 'rgba(219, 234, 254, 0.45)');
    glowGrad.addColorStop(1, 'rgba(219, 234, 254, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    cachedProceduralTextures.moon = texture;
    return texture;
  }
