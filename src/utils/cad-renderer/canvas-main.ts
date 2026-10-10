import { BackgroundImageConfig, CADLayer, CADObject, Point, ProjectSettings, ViewportState, BoundingBox } from "../../types/cad";
import { sortObjectsByLayerStack } from "../cad-layers";
import { drawGrid, drawBackgroundImage } from "./canvas-background";
import { renderCADObject, renderMergedBasepadsSeams, renderMergedExcavatedSeams } from "./object-renderer";
import { drawMeasurementLabelsOverlay } from "./dimensions-annotations";
import {
  drawStandardSheetBorderAndTitleBlock,
  drawStandardNorthArrow,
  drawStandardGraphicalScaleBar,
  drawStandardTelecomLegend,
} from "./sheet-annotations";
import {
  renderSelectionOverlay,
  drawSnapIndicator,
  drawMeasurementTooltip,
  drawEndpointConnectIndicator,
  drawArmedStencilGhost,
} from "./overlays-renderer";

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  viewport: ViewportState;
  settings: ProjectSettings;
  objects: CADObject[];
  selectedIds: string[];
  hoveredId?: string | null;
  hoveredText?: { objId: string; bounds: BoundingBox; text: string } | null;
  layers?: CADLayer[];
  bgImage?: BackgroundImageConfig | null;
  activeDrawing?: CADObject | null;
  snapPoint?: Point | null;
  snapType?: string;
  isMultiSelecting?: boolean;
  selectionBox?: { start: Point; current: Point } | null;
  measureTooltip?: { text: string; x: number; y: number } | null;
  endpointSnap?: { x: number; y: number; end?: 'start' | 'end' } | null;
  armedStencilPreview?: {
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    rotation?: number;
  } | null;
  canvasWidth: number;
  canvasHeight: number;
  isExport?: boolean;
}

// Helper to detect excavated areas and exclude them from 2D Drafting (CAD) canvas display
export const isExcavatedObject = (o: CADObject): boolean => {
  const s = o.stencilId || o.customProps?.stencilType || '';
  const lM = o.levelElevationM ?? o.customProps?.levelElevationM;
  return (
    s === 'excavated-pit' ||
    s.includes('excavat') ||
    (o.text && o.text.toLowerCase().includes('excavat')) ||
    (o.customProps?.name && String(o.customProps.name).toLowerCase().includes('excavat')) ||
    (lM !== undefined && lM < 0 && (s.includes('pit') || s.includes('trench') || s.includes('excavat') || o.type === 'stencil-group'))
  );
};

export const isExcavatedChildOrLabel = (o: CADObject, allObjects: CADObject[]): boolean => {
  if (isExcavatedObject(o)) return true;
  if (o.parentId) {
    const parent = allObjects.find((p) => p.id === o.parentId);
    if (parent && isExcavatedObject(parent)) return true;
  }
  if (o.isStencilLabel && o.text && o.text.toLowerCase().includes('excavat')) {
    return true;
  }
  return false;
};

export function renderCADCanvas(opts: RenderOptions) {
  const {
    ctx,
    viewport,
    settings,
    objects,
    selectedIds,
    hoveredId,
    hoveredText,
    layers,
    bgImage,
    activeDrawing,
    snapPoint,
    endpointSnap,
    armedStencilPreview,
    isMultiSelecting,
    selectionBox,
    measureTooltip,
    canvasWidth,
    canvasHeight,
    isExport,
  } = opts;

  // Stacking order & visibility resolved via Photoshop Layering System
  const effectiveLayers = layers || settings.layers || [];
  const { visibleObjects, layerOpacityMap } = sortObjectsByLayerStack(objects, effectiveLayers);

  ctx.save();

  // Clear canvas buffer
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Apply Camera Viewport Transformation: zoom & pan
  ctx.translate(viewport.panX, viewport.panY);
  ctx.scale(viewport.zoom, viewport.zoom);

  // 1. Draw Workspace Boundary & Shadow (if not high-res export)
  if (!isExport) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    const isWhite = settings.cadTheme === 'white';
    const isBlueprint = settings.cadTheme === 'blueprint';
    const isPhoto = settings.renderStyle === 'photo';

    ctx.fillStyle = isWhite
      ? '#ffffff'
      : isBlueprint
      ? '#0d2847'
      : isPhoto
      ? '#0e1626'
      : '#0f172a'; // Standard dark CAD workspace

    ctx.fillRect(0, 0, settings.canvasWidth, settings.canvasHeight);
    ctx.restore();

    // Canvas border outline
    ctx.strokeStyle = isWhite ? '#cbd5e1' : isBlueprint ? '#38bdf8' : '#38bdf880';
    ctx.lineWidth = 1.5 / viewport.zoom;
    ctx.strokeRect(0, 0, settings.canvasWidth, settings.canvasHeight);
  }

  // 2. Draw Background Grid
  if (settings.gridVisible && settings.gridSize > 0) {
    drawGrid(ctx, settings, viewport, isExport);
  }

  // 3. Draw Background Image (e.g. site plan tracing floorplan)
  if (bgImage && bgImage.dataUrl) {
    drawBackgroundImage(ctx, bgImage);
  }

  // 4. Render All CAD Objects (respecting Photoshop layer stack and physical elevation order)
  // Civil foundations and shelter floor shells render beneath overhead equipment/ladders
  const getObjectZIndex = (o: CADObject): number => {
    const id = (o.stencilId || o.customProps?.stencilType || o.type || '').toLowerCase();
    const name = String(o.customProps?.name || (o as any).name || o.text || '').toLowerCase();

    // Dimensions, callouts, text & labels ALWAYS render on the very top
    if (
      o.type === 'dim-h' ||
      o.type === 'dim-v' ||
      o.type === 'dim-aligned' ||
      o.type === 'leader' ||
      o.isStencilLabel ||
      o.type === 'text'
    ) {
      return 100;
    }

    // Cabling & wire line runs render on top of cable ladders
    if (o.type === 'line' || o.type === 'polyline' || o.type === 'pen' || o.isCable) {
      return 90;
    }

    // Overhead cable ladders, runways, and optical fiber raceways:
    // MUST ALWAYS render ON TOP of shelters, basepads, and cabinets!
    if (
      id.includes('ladder') ||
      id.includes('raceway') ||
      id.includes('tray') ||
      id.includes('runway') ||
      o.ladderType !== undefined ||
      o.customProps?.ladderType !== undefined ||
      o.customProps?.placement === 'indoor' ||
      (o as any).category === 'ladder' ||
      o.customProps?.category === 'ladder' ||
      name.includes('ladder') ||
      name.includes('raceway') ||
      name.includes('runway')
    ) {
      return 80;
    }

    // Air conditioning & HVAC units (MUST ALWAYS render on top of shelters and basepads!)
    if (
      id.includes('wall-mount-ac') ||
      id.includes('air-conditioner') ||
      id.includes('aircon') ||
      id.includes('indoor-split') ||
      id.includes('ac-') ||
      id.includes('cooling') ||
      (o as any).category === 'cooling' ||
      o.customProps?.category === 'cooling'
    ) {
      return 75;
    }

    // Cabinets, racks, generators, rectifiers, batteries, electrical panels
    if (
      id.includes('rack') ||
      id.includes('cabinet') ||
      id.includes('odc') ||
      id.includes('huawei') ||
      id.includes('eltek') ||
      id.includes('rectifier') ||
      id.includes('battery') ||
      id.includes('gen') ||
      id.includes('transformer') ||
      id.includes('acpdb') ||
      id.includes('ats') ||
      id.includes('ecb') ||
      id.includes('dcpdu')
    ) {
      return 70;
    }

    // Towers & monopoles
    if (id.includes('tower') || id.includes('monopole') || id.includes('mast')) {
      return 60;
    }

    // Shelters (exterior walls, floor slab, interior room shell)
    if (id === 'shelter' || id === 'cement-shelter' || id.includes('shelter')) {
      return 50;
    }

    // Concrete basepads & slabs
    if (id.includes('basepad') || id.includes('slab')) {
      return 40;
    }

    // Civil perimeter walls, fences, gates
    if (id.includes('wall') || id.includes('fence') || id.includes('gate')) {
      return 30;
    }

    // Ground, gravel, grass, asphalt, environment
    return 10;
  };

  const sortedVisibleObjects = [...visibleObjects].sort((a, b) => {
    const za = getObjectZIndex(a);
    const zb = getObjectZIndex(b);
    if (za !== zb) return za - zb;
    return 0;
  });

  for (const obj of sortedVisibleObjects) {
    // For excavated area, do not display it in the 2D Drafting (CAD) canvas
    if (isExcavatedChildOrLabel(obj, objects)) {
      continue;
    }
    if (settings.showObjectLabels === false && (obj.isStencilLabel || !!obj.parentId)) {
      continue;
    }
    const layerOpacity = obj.layerId ? layerOpacityMap.get(obj.layerId) ?? 1 : 1;
    if (layerOpacity < 1) {
      ctx.save();
      ctx.globalAlpha *= layerOpacity;
      renderCADObject(ctx, obj, settings, false, sortedVisibleObjects);
      ctx.restore();
    } else {
      renderCADObject(ctx, obj, settings, false, sortedVisibleObjects);
    }
  }

  // 4b. Seamless side-by-side basepad merging on 2D canvas
  renderMergedBasepadsSeams(ctx, visibleObjects, settings);

  // 4c. Seamless side-by-side excavated area merging on 2D canvas (omits cement division on merge side)
  renderMergedExcavatedSeams(ctx, visibleObjects, settings);

  // 4d. Highlight hovered editable text or label
  if (hoveredText) {
    ctx.save();
    const b = hoveredText.bounds;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5 / viewport.zoom;
    ctx.setLineDash([4 / viewport.zoom, 3 / viewport.zoom]);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath();
    ctx.roundRect(b.minX - 3, b.minY - 3, b.width + 6, b.height + 6, 4 / viewport.zoom);
    ctx.fill();
    ctx.stroke();

    // Small pencil icon badge in top right of text
    const badgeX = b.maxX + 4;
    const badgeY = b.minY;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(badgeX + 6 / viewport.zoom, badgeY + 6 / viewport.zoom, 7 / viewport.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(8 / viewport.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✎', badgeX + 6 / viewport.zoom, badgeY + 6 / viewport.zoom);

    ctx.restore();
  }

  // 5. Render Active Drawing Preview (in progress)
  if (activeDrawing) {
    renderCADObject(ctx, activeDrawing, settings, true, visibleObjects);
  }

  // 6. Standard Measurement Labeling Overlay (ISO / Telecom Drafting Standard)
  if (settings.showMeasurements) {
    drawMeasurementLabelsOverlay(ctx, visibleObjects, settings, viewport.zoom);
  }

  // 7. Standard Sheet Border & Title Block (ISO / ANSI standard)
  if (settings.showTitleBlock) {
    drawStandardSheetBorderAndTitleBlock(ctx, settings);
  }

  // 8. Standard True North Arrow Compass
  if (settings.showNorthArrow) {
    drawStandardNorthArrow(ctx, settings);
  }

  // 9. Standard Dynamic Graphical Scale Bar
  if (settings.showScaleBar) {
    drawStandardGraphicalScaleBar(ctx, settings);
  }

  // 10. Standard Telecom Symbols Legend
  if (settings.showLegend) {
    drawStandardTelecomLegend(ctx, settings);
  }

  // 11. Render Selection Bounding Box & Handles
  if (!isExport && selectedIds.length > 0) {
    const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));
    if (selectedObjects.length > 0) {
      renderSelectionOverlay(ctx, selectedObjects, viewport.zoom, settings.selectionBoxStyle || 'box');
    }
  }

  // 7. Render Multi-Select Drag Marquee Box
  if (!isExport && isMultiSelecting && selectionBox) {
    ctx.save();
    const x = Math.min(selectionBox.start.x, selectionBox.current.x);
    const y = Math.min(selectionBox.start.y, selectionBox.current.y);
    const w = Math.abs(selectionBox.current.x - selectionBox.start.x);
    const h = Math.abs(selectionBox.current.y - selectionBox.start.y);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1 / viewport.zoom;
    ctx.setLineDash([4 / viewport.zoom, 4 / viewport.zoom]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  // 8. Render Snap Crosshair Target
  if (!isExport && snapPoint) {
    drawSnapIndicator(ctx, snapPoint, viewport.zoom);
  }

  // 8b. Render Endpoint Connection Indicator (Emerald ring for precise line connect)
  if (!isExport && endpointSnap) {
    drawEndpointConnectIndicator(ctx, endpointSnap, viewport.zoom);
  }

  // 8c. Render Armed Stencil Ghost Preview following cursor
  if (!isExport && armedStencilPreview) {
    drawArmedStencilGhost(ctx, armedStencilPreview, viewport.zoom, settings);
  }

  // Restore camera transformation
  ctx.restore();

  // 9. Floating Measurement Tooltip (in screen coordinates)
  if (!isExport && measureTooltip) {
    drawMeasurementTooltip(ctx, measureTooltip);
  }
}

