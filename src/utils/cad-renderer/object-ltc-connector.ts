export function draw2DLTCConnector(
  ctx: CanvasRenderingContext2D,
  wallX: number,
  wallY: number,
  normalX: number,
  normalY: number,
  isPreview = false
) {
  ctx.save();
  ctx.translate(wallX, wallY);
  const angle = Math.atan2(normalY, normalX);
  ctx.rotate(angle);

  // Draw coaxial 2D Liquid-Tight Connector (LTC) gland protruding outward (-X direction) from cabinet wall (x = 0)
  // 1. Weatherproof Neoprene Sealing Washer & Bulkhead Locknut flush against cabinet wall
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-1.5, -5.2, 1.5, 10.4);
  ctx.fillStyle = '#eab308'; // Brass locknut
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 0.8;
  ctx.fillRect(-3.5, -4.4, 2.2, 8.8);
  ctx.strokeRect(-3.5, -4.4, 2.2, 8.8);

  // 2. Threaded Stainless LTC Barrel & Brass Compression Ring
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-6.8, -3.4, 3.3, 6.8);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(-6.8, -3.4, 3.3, 6.8);

  ctx.fillStyle = '#facc15'; // Gold/Brass ferrule ring
  ctx.fillRect(-8.2, -3.9, 1.6, 7.8);

  // 3. Hexagonal Metallic Compression Gland Nut
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(-11.2, -4.5, 3.0, 9.0);
  ctx.strokeRect(-11.2, -4.5, 3.0, 9.0);

  // 4. Flexible Black Strain-Relief Boot gripping cable
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(-11.2, -3.5);
  ctx.lineTo(-14.8, -2.3);
  ctx.lineTo(-14.8, 2.3);
  ctx.lineTo(-11.2, 3.5);
  ctx.closePath();
  ctx.fill();

  if (isPreview) {
    // Highlight ring showing LTC connector trigger ready on cabinet wall
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(-6, 0, 8.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}
