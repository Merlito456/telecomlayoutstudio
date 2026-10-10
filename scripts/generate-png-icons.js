import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // Simple uncompressed/deflated raw RGBA PNG writer
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel + 1; // +1 for filter byte (0 = none)
  const rawData = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      const nx = x / width;
      const ny = y / height;

      // Dark blue background #0b1329 with gradient
      let r = 11 + Math.floor(nx * 12);
      let g = 19 + Math.floor(ny * 16);
      let b = 41 + Math.floor((1 - ny) * 20);
      let a = 255;

      // Inner safe zone circle or rounded rect for icon
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);

      // Grid lines
      if (x % Math.floor(width / 8) === 0 || y % Math.floor(height / 8) === 0) {
        r = Math.min(255, r + 20);
        g = Math.min(255, g + 30);
        b = Math.min(255, b + 50);
      }

      // Basepad slab at bottom
      const padY1 = height * 0.68;
      const padY2 = height * 0.76;
      const padX1 = width * 0.22;
      const padX2 = width * 0.78;
      if (x >= padX1 && x <= padX2 && y >= padY1 && y <= padY2) {
        r = 100;
        g = 116;
        b = 139; // Slate
      }

      // Tower lattice triangle
      const apexX = cx;
      const apexY = height * 0.2;
      const legBaseY = padY1;
      const leg1X = width * 0.35;
      const leg2X = width * 0.65;

      if (y >= apexY && y <= legBaseY) {
        const prog = (y - apexY) / (legBaseY - apexY);
        const curL1 = apexX + (leg1X - apexX) * prog;
        const curL2 = apexX + (leg2X - apexX) * prog;

        // Legs
        if (Math.abs(x - curL1) <= (width > 200 ? 5 : 2) || Math.abs(x - curL2) <= (width > 200 ? 5 : 2)) {
          r = 56;
          g = 189;
          b = 248; // Sky-400
        }

        // Horizontal crossbars
        const bars = [0.25, 0.5, 0.75, 1.0];
        for (const barProg of bars) {
          const barY = apexY + (legBaseY - apexY) * barProg;
          if (Math.abs(y - barY) <= (width > 200 ? 3 : 1) && x >= curL1 && x <= curL2) {
            r = 2;
            g = 132;
            b = 199; // Sky-600
          }
        }
      }

      // Top spire red beacon
      if (y >= height * 0.12 && y <= apexY && Math.abs(x - cx) <= (width > 200 ? 4 : 2)) {
        r = 244;
        g = 63;
        b = 94; // Rose-500
      }
      if (Math.hypot(x - cx, y - height * 0.12) <= (width > 200 ? 8 : 4)) {
        r = 239;
        g = 68;
        b = 68; // Red beacon
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Deflate compressed data
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression: 0
  ihdrData[11] = 0; // filter: 0
  ihdrData[12] = 0; // interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation for PNG
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const bit = (byte ^ crc) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

const outDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
console.log('PNG Icons successfully generated in /public!');
