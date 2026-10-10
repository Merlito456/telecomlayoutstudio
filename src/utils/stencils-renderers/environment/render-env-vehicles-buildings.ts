import { CADObject, ProjectSettings } from "../../../types/cad";

export function renderEnvironmentVehiclesBuildings(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  switch (stencilId) {
    case 'car-pickup': {
      // Commercial Telecom Field Service Pickup Truck (Top-Down Orthographic)
      // Drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 6);
      ctx.fill();
      ctx.restore();

      // Tires visible on flanks (4 wheels)
      const tireW = 14;
      const tireH = 5;
      ctx.fillStyle = '#09090b';
      // Front left & right
      ctx.fillRect(14, -2, tireW, tireH);
      ctx.fillRect(14, h - 3, tireW, tireH);
      // Rear left & right
      ctx.fillRect(w - 24, -2, tireW, tireH);
      ctx.fillRect(w - 24, h - 3, tireW, tireH);

      // Main Truck White Powder-Coated Body
      const bodyGrad = ctx.createLinearGradient(0, 0, 0, h);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.5, '#f1f5f9');
      bodyGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(2, 2, w - 4, h - 4, 5);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Front Hood & Air Grille
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(4, 5, 16, h - 10);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(4, 5, 16, h - 10);

      // Tinted Curved Front Windshield
      const glassGrad = ctx.createLinearGradient(20, 0, 32, 0);
      glassGrad.addColorStop(0, '#0284c7');
      glassGrad.addColorStop(0.5, '#0369a1');
      glassGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(20, 5, 12, h - 10, [2, 6, 6, 2]);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Cab Roof
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(32, 6, 24, h - 12);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(32, 6, 24, h - 12);

      // Amber Emergency Flashing Beacon Light on roof
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(44, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      // Rear Truck Bed (Textured Dark Bedliner)
      ctx.fillStyle = '#334155';
      ctx.fillRect(58, 5, w - 62, h - 10);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(58, 5, w - 62, h - 10);

      // Aluminum Tool Box in bed
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(59, 7, 8, h - 14);

      // Galvanized Steel Ladder Rack Bars
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(34, 4);
      ctx.lineTo(w - 6, 4);
      ctx.moveTo(34, h - 4);
      ctx.lineTo(w - 6, h - 4);
      ctx.stroke();

      // Bright Halogen Headlights (Yellow glow)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(2, 4, 3, 7);
      ctx.fillRect(2, h - 11, 3, 7);

      // Red Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(w - 5, 4, 3, 6);
      ctx.fillRect(w - 5, h - 10, 3, 6);
      return true;
    }

    case 'car-sedan': {
      // Sleek Passenger Sedan Car (Top-Down Orthographic)
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 8);
      ctx.fill();
      ctx.restore();

      // 4 Concealed Rubber Tires
      const tireW = 12;
      const tireH = 4;
      ctx.fillStyle = '#09090b';
      ctx.fillRect(14, -1, tireW, tireH);
      ctx.fillRect(14, h - 3, tireW, tireH);
      ctx.fillRect(w - 22, -1, tireW, tireH);
      ctx.fillRect(w - 22, h - 3, tireW, tireH);

      // Aerodynamic Car Metallic Blue Body
      const carGrad = ctx.createLinearGradient(0, 0, 0, h);
      carGrad.addColorStop(0, '#3b82f6');
      carGrad.addColorStop(0.5, '#2563eb');
      carGrad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = carGrad;
      ctx.beginPath();
      ctx.roundRect(2, 2, w - 4, h - 4, 7);
      ctx.fill();
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Front Hood Contours
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, 8);
      ctx.lineTo(18, 8);
      ctx.moveTo(4, h - 8);
      ctx.lineTo(18, h - 8);
      ctx.stroke();

      // Curved Front Windshield
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.roundRect(19, 5, 12, h - 10, [3, 7, 7, 3]);
      ctx.fill();

      // Roof with Glass Sunroof
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(31, 5, 24, h - 10);
      ctx.fillStyle = '#082f49';
      ctx.fillRect(36, 8, 14, h - 16);

      // Rear Windshield
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.roundRect(55, 5, 10, h - 10, [7, 3, 3, 7]);
      ctx.fill();

      // Side mirrors
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(22, -2, 4, 3);
      ctx.fillRect(22, h - 1, 4, 3);

      // Headlights & Tail lights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(2, 4, 3, 6);
      ctx.fillRect(2, h - 10, 3, 6);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(w - 5, 4, 3, 6);
      ctx.fillRect(w - 5, h - 10, 3, 6);
      return true;
    }

    case 'small-house': {
      // Small House / Guardhouse (Pitched gable/hip roof with tiles)
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Terracotta Tile Roof Pitch Gradient (North slope & South slope)
      const roofNorth = ctx.createLinearGradient(0, 0, 0, h / 2);
      roofNorth.addColorStop(0, '#991b1b');
      roofNorth.addColorStop(0.7, '#b91c1c');
      roofNorth.addColorStop(1, '#dc2626');
      ctx.fillStyle = roofNorth;
      ctx.fillRect(0, 0, w, h / 2);

      const roofSouth = ctx.createLinearGradient(0, h / 2, 0, h);
      roofSouth.addColorStop(0, '#dc2626');
      roofSouth.addColorStop(0.3, '#b91c1c');
      roofSouth.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = roofSouth;
      ctx.fillRect(0, h / 2, w, h / 2);

      // Roof tile horizontal battens
      ctx.strokeStyle = 'rgba(69, 10, 10, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 8; y < h; y += 8) {
        if (Math.abs(y - h / 2) < 3) continue;
        ctx.beginPath();
        ctx.moveTo(2, y);
        ctx.lineTo(w - 2, y);
        ctx.stroke();
      }

      // Roof Ridge Cap (Center peak)
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(0, h / 2 - 2, w, 4);
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, h / 2 - 2, w, 4);

      // Overhanging Roof Eaves Border
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Brick Chimney on East roof flank
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(w - 24, 8, 14, 14);
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(w - 24, 8, 14, 14);
      // Flue opening
      ctx.fillStyle = '#09090b';
      ctx.fillRect(w - 21, 11, 8, 8);

      // Front Doorway Porch Canopy on South
      ctx.fillStyle = '#334155';
      ctx.fillRect(w / 2 - 12, h - 6, 24, 6);
      return true;
    }


  }
  return false;
}
