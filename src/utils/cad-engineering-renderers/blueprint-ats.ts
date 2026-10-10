import { CADObject, ProjectSettings } from "../../types/cad";
import { CADThemeColors } from "./common";

export function renderBlueprintATS(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  colors: CADThemeColors,
  w: number,
  h: number
): boolean {
  // 1. Wall Interface Channel & 4 Corner Anchor Ears (Wall Mounted)
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.0;
  ctx.strokeRect(-2, 0, w + 4, 2.5);
  [
    { x: -3.5, y: 0.5 },
    { x: w - 0.5, y: 0.5 },
    { x: -3.5, y: h - 3.5 },
    { x: w - 0.5, y: h - 3.5 },
  ].forEach((tab) => {
    ctx.strokeRect(tab.x, tab.y, 4, 3);
    ctx.beginPath();
    ctx.arc(tab.x + 2, tab.y + 1.5, 0.9, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Technical Enclosure Outline
  ctx.fillStyle = colors.fill;
  ctx.fillRect(0, 2, w, h - 2);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(0, 2, w, h - 2);

  // Rain hood overhang line
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-1, 3);
  ctx.lineTo(w + 1, 3);
  ctx.stroke();

  // 2. Standard Electrical Schematic for Automatic Transfer Switch
  // Mains Terminal (Left)
  const termMY = 7.5;
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(8, termMY, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 5px monospace';
  ctx.fillStyle = colors.primary;
  ctx.textAlign = 'center';
  ctx.fillText('N', 8, termMY - 2);

  // Gen Terminal (Right)
  const termGY = 7.5;
  ctx.beginPath();
  ctx.arc(w - 8, termGY, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('E', w - 8, termGY - 2);

  // Load Output Terminal (Center-Bottom)
  const termLY = h - 6;
  ctx.beginPath();
  ctx.arc(w / 2, termLY, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('LOAD', w / 2, termLY + 5);

  // Closed Contact Arm (Normal / Mains to Load)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(8, termMY);
  ctx.lineTo(w / 2 - 2, termLY - 2.5);
  ctx.stroke();

  // Open Contact Path (Gen to Load - dashed)
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(w - 8, termGY);
  ctx.lineTo(w / 2 + 2, termLY - 2.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Mechanical Interlock Symbol
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(11, termMY + 2);
  ctx.lineTo(w - 11, termGY + 2);
  ctx.stroke();
  const midX = w / 2;
  const midY = termMY + 2;
  ctx.strokeRect(midX - 2.5, midY - 2.5, 5, 5);

  // 3. Central ATS Controller Box & Label
  ctx.font = 'bold 7px monospace';
  ctx.fillStyle = colors.primary;
  ctx.textAlign = 'center';
  const mode = (obj.customProps?.transferMode as string) || 'auto';
  ctx.fillText(mode === 'manual' ? 'ATS (MAN)' : mode === 'test' ? 'ATS (TEST)' : 'ATS (WALL)', w / 2, h / 2 + 3);
  return true;
}
