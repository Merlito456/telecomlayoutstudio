import { CADObject, ProjectSettings } from "../../types/cad";
import { formatMeasurement } from "../cad-geometry";
import {
  isCableObject,
  calculateCableLength,
  inferCableType,
  CABLE_TYPE_DEFINITIONS,
  formatCableDisplay,
} from "../cad-geometry/cable-length-calculator";
import { isExcavatedChildOrLabel } from "./canvas-main";
import { drawLevelElevationBadge } from "./dimensions-leaders";

function drawAutoDimensionLabel(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  settings: ProjectSettings
) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  if (dist < 15) return;
  const measText = formatMeasurement(dist, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.translate(midX, midY);
  let textAngle = angle;
  if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
    textAngle += Math.PI;
  }
  ctx.rotate(textAngle);
  ctx.font = 'bold 9px monospace';
  const tw = ctx.measureText(measText).width + 6;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-tw / 2, -14, tw, 12);
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(measText, 0, -8);
  ctx.restore();
}

/**
 * Standard Measurement Labeling Overlay:
 * Renders standard engineering measurement tags on shapes, equipment, and linear runs
 */
function drawMeasurementBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  accentColor = '#38bdf8'
) {
  ctx.save();
  ctx.font = 'bold 9px monospace';
  const metrics = ctx.measureText(text);
  const padX = 6;
  const badgeW = metrics.width + padX * 2;
  const badgeH = 16;
  const rx = centerX - badgeW / 2;
  const ry = centerY - badgeH / 2;

  // High-contrast drafting pill with crisp border
  ctx.fillStyle = 'rgba(11, 18, 32, 0.94)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(rx, ry, badgeW, badgeH, 3);
  ctx.fill();
  ctx.stroke();

  // Accent measurement text
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX, centerY);
  ctx.restore();
}


function drawMeasurementLabelsOverlay(
  ctx: CanvasRenderingContext2D,
  objects: CADObject[],
  settings: ProjectSettings,
  zoom: number
) {
  ctx.save();

  for (const obj of objects) {
    if (isExcavatedChildOrLabel(obj, objects)) {
      continue;
    }
    if (obj.isStencilLabel || obj.type === 'text' || obj.type === 'dim-h' || obj.type === 'dim-v' || obj.type === 'dim-aligned' || obj.type === 'leader') {
      continue;
    }

    // Render Uneven Level Elevation & Retaining Foundation Badge if specified
    const levelM = obj.levelElevationM ?? obj.customProps?.levelElevationM;
    if (levelM !== undefined && levelM !== 0 && (obj.type === 'rectangle' || obj.type === 'stencil-group')) {
      const mat = obj.foundationRetainingMaterial || obj.customProps?.foundationRetainingMaterial || 'concrete';
      const isNeg = levelM < 0;
      const arrow = isNeg ? '▼' : '▲';
      const sign = isNeg ? '' : '+';
      const elevBadge = `${arrow} EL: ${sign}${levelM.toFixed(2)}m [${mat.toUpperCase()}]`;

      const eOffX = obj.elevBadgeOffsetX ?? obj.customProps?.elevBadgeOffsetX ?? 0;
      const eOffY = obj.elevBadgeOffsetY ?? obj.customProps?.elevBadgeOffsetY ?? 0;
      const nomX = obj.x + obj.width / 2;
      const nomY = obj.y - 10;
      const badgeX = nomX + eOffX;
      const badgeY = nomY + eOffY;

      if (Math.hypot(eOffX, eOffY) > 8) {
        ctx.save();
        ctx.strokeStyle = isNeg ? 'rgba(56, 189, 248, 0.5)' : 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(nomX, nomY);
        ctx.lineTo(badgeX, badgeY);
        ctx.stroke();
        ctx.restore();
      }

      drawLevelElevationBadge(ctx, elevBadge, badgeX, badgeY, isNeg);
    }

    const mOffX = obj.measBadgeOffsetX ?? obj.customProps?.measBadgeOffsetX ?? 0;
    const mOffY = obj.measBadgeOffsetY ?? obj.customProps?.measBadgeOffsetY ?? 0;

    if (obj.type === 'rectangle' || obj.type === 'stencil-group') {
      const w = obj.width;
      const h = obj.height;
      if (w < 24 || h < 16) continue;

      const wStr = formatMeasurement(w, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
      const hStr = formatMeasurement(h, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
      const tagText = `${wStr} × ${hStr}`;

      const nomX = obj.x + w / 2;
      const nomY = obj.y + h + 10;
      const tagX = nomX + mOffX;
      const tagY = nomY + mOffY;

      if (Math.hypot(mOffX, mOffY) > 8) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(nomX, nomY);
        ctx.lineTo(tagX, tagY);
        ctx.stroke();
        ctx.restore();
      }

      drawMeasurementBadge(ctx, tagText, tagX, tagY);
    } else if (obj.type === 'circle') {
      const r = obj.width / 2;
      if (r < 8) continue;
      const diaStr = formatMeasurement(r * 2, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
      const tagText = `Ø ${diaStr}`;
      const nomX = obj.x + obj.width / 2;
      const nomY = obj.y + obj.height + 10;
      const tagX = nomX + mOffX;
      const tagY = nomY + mOffY;

      if (Math.hypot(mOffX, mOffY) > 8) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(nomX, nomY);
        ctx.lineTo(tagX, tagY);
        ctx.stroke();
        ctx.restore();
      }

      drawMeasurementBadge(ctx, tagText, tagX, tagY);
    } else if (obj.type === 'line') {
      const x2 = obj.x2 ?? obj.x + obj.width;
      const y2 = obj.y2 ?? obj.y + obj.height;
      const len = Math.hypot(x2 - obj.x, y2 - obj.y);
      if (len < 20) continue;

      const nomX = (obj.x + x2) / 2;
      const nomY = (obj.y + y2) / 2;
      const tagX = nomX + mOffX;
      const tagY = nomY + mOffY;

      if (Math.hypot(mOffX, mOffY) > 8) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(nomX, nomY);
        ctx.lineTo(tagX, tagY);
        ctx.stroke();
        ctx.restore();
      }

      if (isCableObject(obj)) {
        const calc = calculateCableLength(obj, settings.scaleFactor);
        const cType = inferCableType(obj);
        const meta = CABLE_TYPE_DEFINITIONS[cType] || CABLE_TYPE_DEFINITIONS.custom;
        const lengthStr = formatCableDisplay(calc.totalLengthM, settings);
        const tagText = `⚡ CBL [${meta.label.split(' ')[0]}]: ${lengthStr}`;
        drawMeasurementBadge(ctx, tagText, tagX, tagY, meta.defaultColor || '#38bdf8');
      } else {
        const lenStr = formatMeasurement(len, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
        drawMeasurementBadge(ctx, `L = ${lenStr}`, tagX, tagY);
      }
    } else if ((obj.type === 'polyline' || obj.type === 'pen') && obj.points && obj.points.length > 1) {
      let totalLen = 0;
      for (let i = 0; i < obj.points.length - 1; i++) {
        const p1 = obj.points[i];
        const p2 = obj.points[i + 1];
        totalLen += Math.hypot(p2.x - p1.x, p2.y - p1.y);
      }
      if (totalLen >= 20) {
        const midIdx = Math.floor(obj.points.length / 2);
        const pt = obj.points[midIdx];
        const nomX = obj.x + pt.x;
        const nomY = obj.y + pt.y;
        const tagX = nomX + mOffX;
        const tagY = nomY + mOffY;

        if (Math.hypot(mOffX, mOffY) > 8) {
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(nomX, nomY);
          ctx.lineTo(tagX, tagY);
          ctx.stroke();
          ctx.restore();
        }

        if (isCableObject(obj)) {
          const calc = calculateCableLength(obj, settings.scaleFactor);
          const cType = inferCableType(obj);
          const meta = CABLE_TYPE_DEFINITIONS[cType] || CABLE_TYPE_DEFINITIONS.custom;
          const lengthStr = formatCableDisplay(calc.totalLengthM, settings);
          const tagText = `⚡ CBL [${meta.label.split(' ')[0]}]: ${lengthStr}`;
          drawMeasurementBadge(ctx, tagText, tagX, tagY, meta.defaultColor || '#38bdf8');
        } else {
          const lenStr = formatMeasurement(totalLen, settings.scaleFactor, settings.unit, settings.dimensionUnitFormat);
          drawMeasurementBadge(ctx, `L = ${lenStr}`, tagX, tagY);
        }
      }
    }
  }

  ctx.restore();
}


export {
  drawAutoDimensionLabel,
  drawMeasurementBadge,
  drawMeasurementLabelsOverlay,
};
