import { CADObject, ProjectSettings } from '../../types/cad';
import { findCabinetWallLTCAttachment2D, isIndoorCable } from '../cad-geometry';
import { renderPhotorealisticStencil } from '../cad-stencils-renderer';
import { renderEngineeringCADStencil } from '../cad-engineering-renderer';
import {
  drawAutoDimensionLabel,
  drawDimensionHorizontal,
  drawDimensionVertical,
  drawDimensionAligned,
  drawLeaderAnnotation,
} from './dimensions-annotations';
import { draw2DLTCConnector } from './object-ltc-connector';
import { renderStretchableStencil } from './stretchable-stencils';
import { renderMergedBasepadsSeams, renderMergedExcavatedSeams } from './basepad-seams';
import { drawCADText } from './cad-text-renderer';

export {
  draw2DLTCConnector,
  renderStretchableStencil,
  renderMergedBasepadsSeams,
  renderMergedExcavatedSeams,
  drawCADText,
};

export function renderCADObject(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  settings: ProjectSettings,
  isPreview = false,
  allObjects?: CADObject[]
) {
  ctx.save();
  ctx.globalAlpha = (obj.opacity ?? 1) * (isPreview ? 0.75 : 1);

  // Group / Stencil Group with relative coordinate system
  if (obj.type === 'stencil-group' || obj.type === 'group') {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    if (obj.rotation) {
      ctx.translate(obj.width / 2, obj.height / 2);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-obj.width / 2, -obj.height / 2);
    }

    if (obj.isStencil || obj.stencilId || obj.customProps?.stencilType) {
      const isPhoto = settings.renderStyle === 'photo';
      const rendered = isPhoto
        ? renderPhotorealisticStencil(ctx, obj, settings)
        : renderEngineeringCADStencil(ctx, obj, settings);

      if (rendered) {
        ctx.restore();
        ctx.restore();
        return;
      }
    }

    if (obj.isStretchable && obj.baseWidth && obj.width !== obj.baseWidth) {
      renderStretchableStencil(ctx, obj, settings);
    } else if (obj.children && obj.children.length > 0) {
      for (const child of obj.children) {
        renderCADObject(ctx, child, settings);
      }
    }
    ctx.restore();
    ctx.restore();
    return;
  }

  // Handle single object with stencil ID
  if (obj.isStencil || obj.stencilId) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    if (obj.rotation) {
      ctx.translate((obj.width || 0) / 2, (obj.height || 0) / 2);
      ctx.rotate(((obj.rotation || 0) * Math.PI) / 180);
      ctx.translate(-(obj.width || 0) / 2, -(obj.height || 0) / 2);
    }
    const isPhoto = settings.renderStyle === 'photo';
    const rendered = isPhoto
      ? renderPhotorealisticStencil(ctx, obj, settings)
      : renderEngineeringCADStencil(ctx, obj, settings);
    ctx.restore();
    if (rendered) {
      ctx.restore();
      return;
    }
  }

  // Handle Rotation for standard objects
  if (obj.rotation) {
    const cx = obj.x + (obj.width || 0) / 2;
    const cy = obj.y + (obj.height || 0) / 2;
    ctx.translate(cx, cy);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  ctx.strokeStyle = obj.draftingColor || obj.stroke || '#94a3b8';
  ctx.lineWidth = Math.max(obj.strokeWidth || 1, 0.5);

  if (obj.strokeDash && obj.strokeDash.length > 0) {
    ctx.setLineDash(obj.strokeDash);
  } else {
    ctx.setLineDash([]);
  }

  switch (obj.type) {
    case 'rectangle': {
      if (obj.fillEnabled && obj.fill && obj.fill !== 'transparent') {
        ctx.fillStyle = obj.fill;
        ctx.globalAlpha = (obj.opacity ?? 1) * (obj.fillOpacity ?? 1);
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.globalAlpha = obj.opacity ?? 1;
      }
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      break;
    }

    case 'circle': {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      const rx = Math.abs(obj.width / 2);
      const ry = Math.abs(obj.height / 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      if (obj.fillEnabled && obj.fill && obj.fill !== 'transparent') {
        ctx.fillStyle = obj.fill;
        ctx.globalAlpha = (obj.opacity ?? 1) * (obj.fillOpacity ?? 1);
        ctx.fill();
        ctx.globalAlpha = obj.opacity ?? 1;
      }
      ctx.stroke();
      break;
    }

    case 'line': {
      const x2 = obj.x2 ?? obj.x + obj.width;
      const y2 = obj.y2 ?? obj.y + obj.height;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(obj.x, obj.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const isIndoor = isIndoorCable(obj, allObjects || []);
      if (!isIndoor && allObjects && allObjects.length > 0) {
        const startCab = findCabinetWallLTCAttachment2D({ x: obj.x, y: obj.y }, { x: x2, y: y2 }, allObjects, 18);
        if (startCab) {
          draw2DLTCConnector(ctx, startCab.wallX, startCab.wallY, startCab.normalX, startCab.normalY, isPreview);
        }
        const endCab = findCabinetWallLTCAttachment2D({ x: x2, y: y2 }, { x: obj.x, y: obj.y }, allObjects, 18);
        if (endCab) {
          draw2DLTCConnector(ctx, endCab.wallX, endCab.wallY, endCab.normalX, endCab.normalY, isPreview);
        }
      }

      if (settings.autoDims && !isPreview) {
        drawAutoDimensionLabel(ctx, obj.x, obj.y, x2, y2, settings);
      }
      break;
    }

    case 'polyline':
    case 'pen': {
      if (!obj.points || obj.points.length < 2) break;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.points[0].x, obj.y + obj.points[0].y);
      for (let i = 1; i < obj.points.length; i++) {
        ctx.lineTo(obj.x + obj.points[i].x, obj.y + obj.points[i].y);
      }
      if (obj.fillEnabled && obj.fill && obj.fill !== 'transparent') {
        ctx.closePath();
        ctx.fillStyle = obj.fill;
        ctx.globalAlpha = (obj.opacity ?? 1) * (obj.fillOpacity ?? 1);
        ctx.fill();
        ctx.globalAlpha = obj.opacity ?? 1;
      }
      ctx.stroke();

      if (isPreview && obj.type === 'polyline') {
        ctx.save();
        ctx.fillStyle = obj.stroke || '#38bdf8';
        for (let i = 0; i < obj.points.length - 1; i++) {
          ctx.beginPath();
          ctx.arc(obj.x + obj.points[i].x, obj.y + obj.points[i].y, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      const isIndoorPoly = isIndoorCable(obj, allObjects || []);
      if (!isIndoorPoly && obj.type === 'polyline' && allObjects && allObjects.length > 0 && obj.points.length >= 2) {
        const pFirst = { x: obj.x + obj.points[0].x, y: obj.y + obj.points[0].y };
        const pSecond = { x: obj.x + obj.points[1].x, y: obj.y + obj.points[1].y };
        const pLast = {
          x: obj.x + obj.points[obj.points.length - 1].x,
          y: obj.y + obj.points[obj.points.length - 1].y,
        };
        const pPrev = {
          x: obj.x + obj.points[obj.points.length - 2].x,
          y: obj.y + obj.points[obj.points.length - 2].y,
        };
        const startCab = findCabinetWallLTCAttachment2D(pFirst, pSecond, allObjects, 18);
        if (startCab) {
          draw2DLTCConnector(ctx, startCab.wallX, startCab.wallY, startCab.normalX, startCab.normalY, isPreview);
        }
        const endCab = findCabinetWallLTCAttachment2D(pLast, pPrev, allObjects, 18);
        if (endCab) {
          draw2DLTCConnector(ctx, endCab.wallX, endCab.wallY, endCab.normalX, endCab.normalY, isPreview);
        }
      }
      break;
    }

    case 'text': {
      drawCADText(ctx, obj, settings, allObjects);
      break;
    }

    case 'dim-h': {
      drawDimensionHorizontal(ctx, obj, settings);
      break;
    }

    case 'dim-v': {
      drawDimensionVertical(ctx, obj, settings);
      break;
    }

    case 'dim-aligned': {
      drawDimensionAligned(ctx, obj, settings);
      break;
    }

    case 'leader': {
      drawLeaderAnnotation(ctx, obj, settings);
      break;
    }
  }

  ctx.restore();
}
