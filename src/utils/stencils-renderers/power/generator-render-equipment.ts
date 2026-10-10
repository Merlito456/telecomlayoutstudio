export function drawGeneratorRadiator(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 5. Radiator Cooling Section (Right End)
  const radW = Math.min(w * 0.26, 34);
  const radX = w - radW - 4;
  const radY = 6;
  const radH = h - 12;

  // Dark radiator cavity
  ctx.fillStyle = '#09090b';
  ctx.fillRect(radX, radY, radW, radH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(radX, radY, radW, radH);

  // Cooling fan shroud & blades inside radiator plenum
  const fanCx = radX + radW * 0.45;
  const fanCy = h / 2;
  const fanR = Math.min(radW * 0.42, radH * 0.42);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(fanCx, fanCy, fanR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 6 Aerodynamic Fan Blades
  ctx.save();
  ctx.translate(fanCx, fanCy);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 6; i++) {
    ctx.rotate((Math.PI * 2) / 6);
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(fanR * 0.6, 2, fanR * 0.9, 0);
    ctx.stroke();
  }
  // Central fan hub
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Radiator Cooling Discharge Louvers with subtle shadows
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  for (let ly = radY + 4; ly < radY + radH - 2; ly += 3.8) {
    ctx.beginPath();
    ctx.moveTo(radX + 2, ly);
    ctx.lineTo(radX + radW - 2, ly);
    ctx.stroke();
  }

  // Radiator Top Coolant Replenishment Cap
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(radX + radW / 2, radY + 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

export function drawGeneratorIntakeAndController(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 6. Rear Air Intake Sound Attenuation Baffle (Left End)
  const intakeW = Math.min(w * 0.12, 14);
  const intakeX = 4;
  const intakeY = 6;
  const intakeH = h - 12;
  ctx.fillStyle = '#09090b';
  ctx.fillRect(intakeX, intakeY, intakeW, intakeH);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(intakeX, intakeY, intakeW, intakeH);

  // Acoustic sound baffles louvers
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  for (let iy = intakeY + 3; iy < intakeY + intakeH - 2; iy += 4) {
    ctx.beginPath();
    ctx.moveTo(intakeX + 2, iy);
    ctx.lineTo(intakeX + intakeW - 2, iy);
    ctx.stroke();
  }

  // 7. Digital Control Cubicle & Viewing Window (DeepSea Controller)
  const cpW = Math.min(w * 0.22, 26);
  const cpH = h - 16;
  const cpX = intakeX + intakeW + 2;
  const cpY = 8;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cpX, cpY, cpW, cpH);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cpX, cpY, cpW, cpH);

  // Clear Polycarbonate Viewing Window Frame with Glass Sheen
  ctx.save();
  const glassGrad = ctx.createLinearGradient(cpX, cpY, cpX + cpW, cpY + cpH);
  glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
  glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
  glassGrad.addColorStop(1, 'rgba(3, 105, 161, 0.25)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(cpX + 1, cpY + 1, cpW - 2, cpH - 2);
  ctx.restore();

  // Illuminated Backlit LCD Screen (DeepSea Digital Controller)
  const lcdW = cpW - 6;
  const lcdH = 15;
  const lcdX = cpX + 3;
  const lcdY = cpY + 3;
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(lcdX, lcdY, lcdW, lcdH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(lcdX, lcdY, lcdW, lcdH);

  // Digital Matrix Display Text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 5px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('AUTO READY', lcdX + lcdW / 2, lcdY + 2);
  ctx.font = '4.5px monospace';
  ctx.fillText('400V 50Hz', lcdX + lcdW / 2, lcdY + 8);

  // LED Indicators (Green 'AUTO', Amber 'WARN', Red 'FAULT')
  const ledY = lcdY + lcdH + 4;
  [
    { color: '#22c55e', off: -4 },
    { color: '#eab308', off: 0 },
    { color: '#ef4444', off: 4 },
  ].forEach((l) => {
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.arc(cpX + cpW / 2 + l.off, ledY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Heavy Red Mushroom Emergency Stop Button with Yellow Collar
  const eStopX = cpX + cpW / 2;
  const eStopY = cpY + cpH - 7;
  // High-visibility yellow safety ring collar
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(eStopX, eStopY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Red mushroom head
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(eStopX, eStopY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

export function drawGeneratorSilencerAndExhaust(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 8. Residential Grade Top Exhaust Silencer Drum & Stack with Rain Flapper
  const silW = Math.min(w * 0.24, 28);
  const silH = 14;
  const silX = w * 0.52;
  const silY = h / 2 - silH / 2;

  // Muffler drum body (Heat-resistant textured steel)
  const silGrad = ctx.createLinearGradient(silX, silY, silX, silY + silH);
  silGrad.addColorStop(0, '#52525b');
  silGrad.addColorStop(0.3, '#71717a');
  silGrad.addColorStop(0.7, '#3f3f46');
  silGrad.addColorStop(1, '#27272a');

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = silGrad;
  ctx.beginPath();
  ctx.roundRect(silX, silY, silW, silH, 3);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#a1a1aa';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Silencer body heat-insulation bands
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(silX + silW * 0.3, silY);
  ctx.lineTo(silX + silW * 0.3, silY + silH);
  ctx.moveTo(silX + silW * 0.7, silY);
  ctx.lineTo(silX + silW * 0.7, silY + silH);
  ctx.stroke();

  // Vertical Exhaust Stack Pipe
  const exhX = silX + silW - 4;
  const exhY = h / 2;
  const exhR = 5;

  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(exhX, exhY, exhR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Counterbalanced Rain Cap Flapper (tilted open/spring loaded)
  ctx.save();
  ctx.translate(exhX, exhY);
  // Flapper disc
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(3, -1, 5, 2.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#71717a';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Pivot hinge lever & counterweight arm
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(8, -4);
  ctx.stroke();

  // Counterweight ball
  ctx.fillStyle = '#71717a';
  ctx.beginPath();
  ctx.arc(8, -4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGeneratorDecalsAndFuel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 9. Sub-Base Fuel Filler Neck & Brass Cap
  const fuelX = w * 0.35;
  const fuelY = h - 6;
  ctx.fillStyle = '#ca8a04'; // Brass lockable cap
  ctx.beginPath();
  ctx.arc(fuelX, fuelY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 10. Safety & Telecom Hazard Warning Decals
  // High-Voltage Warning Triangle (⚡ 400V)
  const decX = w * 0.38;
  const decY = 7;
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(decX, decY);
  ctx.lineTo(decX + 5, decY + 7);
  ctx.lineTo(decX - 5, decY + 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Lightning bolt icon
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(decX, decY + 2);
  ctx.lineTo(decX - 1.5, decY + 4.5);
  ctx.lineTo(decX + 1, decY + 4.5);
  ctx.lineTo(decX - 0.5, decY + 6.5);
  ctx.stroke();

  // ISO Diesel Fuel Symbol (Yellow/Black)
  ctx.font = 'bold 4.5px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('DIESEL', fuelX + 6, fuelY);

  // Acoustic dB rating plate
  ctx.fillStyle = '#14532d';
  ctx.fillRect(w * 0.68, h - 8, 22, 5);
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 0.6;
  ctx.strokeRect(w * 0.68, h - 8, 22, 5);
  ctx.fillStyle = '#86efac';
  ctx.font = '4px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('68 dB(A) @ 7m', w * 0.68 + 11, h - 5.5);
}
