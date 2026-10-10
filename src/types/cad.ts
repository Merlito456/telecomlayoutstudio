/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolType =
  | 'select'
  | 'pan'
  | 'pen'
  | 'line'
  | 'polyline'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'dim-h'
  | 'dim-v'
  | 'dim-aligned'
  | 'leader'
  | 'eraser';

export type StencilCategory =
  | 'gate'
  | 'shelter'
  | 'racks'
  | 'rectifier-system'
  | 'equipments'
  | 'olt'
  | 'cabinets'
  | 'tower'
  | 'power'
  | 'pads'
  | 'cooling'
  | 'cabling'
  | 'surface'
  | 'environment'
  | 'labels';

export interface Point {
  x: number;
  y: number;
}

export interface StencilDefinition {
  id: string;
  name: string;
  category: StencilCategory;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  isStretchable?: boolean;
  stretchAxis?: 'x' | 'y' | 'both';
  icon?: string;
  badge?: string;
  createObjects: (origin: Point, scaleFactor: number) => CADObject[];
}

export type CADObjectType =
  | 'line'
  | 'polyline'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'dim-h'
  | 'dim-v'
  | 'dim-aligned'
  | 'leader'
  | 'pen'
  | 'group'
  | 'stencil-group';

export interface CADLayer {
  id: string;
  name: string;
  visible: boolean; // Photoshop eye icon: toggle visibility
  locked: boolean; // Photoshop lock icon: protect layer
  opacity: number; // 0 to 1
  color: string; // Accent color tag
}

export interface CADObject {
  id: string;
  type: CADObjectType;
  layerId?: string; // Associated CAD layer ID (Photoshop layering system)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // In degrees
  stroke: string;
  draftingColor?: string; // 2D CAD drafting line/symbol color (customizable, not fixed on black)
  strokeWidth: number;
  strokeDash?: number[];
  fill: string;
  fillEnabled: boolean;
  fillOpacity: number; // 0 to 1
  opacity: number; // 0 to 1

  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string; // Custom CAD font (e.g. 'titillium-web', 'jetbrains-mono', 'inter', etc.)
  bold?: boolean;
  italic?: boolean;
  textColor?: string;
  bgColor?: string;

  // Geometry specific
  x2?: number; // Line, dimension end
  y2?: number;
  points?: Point[]; // Polyline, pen path
  isClosed?: boolean; // Whether polyline loop is closed
  dimOffset?: number; // Dimension line offset distance

  // Standard drafting From-To dimension labeling
  fromLabel?: string; // Origin feature (e.g. "Shelter Wall", "Tower Leg NW")
  toLabel?: string; // Target feature (e.g. "Boundary Fence", "Tower Leg NE")

  // Stencil and stretch behaviors
  isStencil?: boolean;
  stencilId?: string;
  isStretchable?: boolean;
  stretchAxis?: 'x' | 'y' | 'both';
  baseWidth?: number;
  baseHeight?: number;
  isStencilLabel?: boolean;
  parentId?: string; // Associated parent stencil ID

  // Grouping
  children?: CADObject[];

  // Tower structures
  towerHeightM?: number; // Height in meters AGL (e.g. 15, 24, 30, 36, 40, 45, 50, 60, 75, 80, 100)

  // Uneven level / Terrain & Foundation elevation
  levelElevationM?: number; // Elevation in meters, e.g. -1.0 for dug pit/trench or +0.8 for elevated terrace/plinth
  foundationRetainingMaterial?: 'concrete' | 'metal' | 'gravel' | 'earth'; // Material for the holding foundation / division retaining border

  // Cable ladder placement type
  ladderType?: 'basepad' | 'cabin-feeder' | 'indoor' | 'connecting' | 'standard'; // Basepad, Cabin Feeder, Indoor/In-Shelter, Connecting, or Standard Ladder

  // Ground basepad thickness / elevation height in mm (e.g. 150 for 150mm / 0.15m standard plinth)
  basepadHeight?: number;

  // Cabin / Shelter height in meters (e.g. 2.6, 2.8, 3.0, 3.2, 3.5, 4.0)
  shelterHeightM?: number;

  // Equipment mounting elevation / placement height in mm (e.g. 2200 for 2.2m)
  elevationMm?: number;

  // Feeder hole entry gland diameter and vertical elevation in mm
  feederDiameter?: number;
  cableHoleDiameterMm?: number;
  feederElevationMm?: number;
  cableHoleElevationMm?: number;

  // Custom interior equipment objects placed inside the shelter
  interiorObjects?: CADObject[];

  // Door / Gate open state (toggled via Key 'Z')
  doorsOpen?: boolean;

  // Movable label offsets
  labelOffsetX?: number;
  labelOffsetY?: number;
  measBadgeOffsetX?: number;
  measBadgeOffsetY?: number;
  elevBadgeOffsetX?: number;
  elevBadgeOffsetY?: number;

  // Rack specifications
  name?: string;
  uHeight?: number;
  heightMm?: number;
  category?: string;
  placement?: string;
  presetId?: string;
  rackEquipments?: any[];

  // Automatic Cable Length & Telecom Infrastructure Calculation
  isCable?: boolean;
  cableType?: 'dc-power' | 'ac-power' | 'fiber' | 'ground' | 'rf-coax' | 'cat6' | 'control' | 'ladder-tray' | 'custom';
  cableTag?: string; // e.g. "CBL-DC-01", "FBR-FEED-02"
  cableVerticalDropM?: number; // Vertical rise/drop allowance in meters (e.g. from overhead tray to cabinet gland)
  cableSlackPct?: number; // Service loop slack percentage (e.g. 5% or 10%)
  cableSlackFixedM?: number; // Fixed extra slack in meters (e.g. 1.5m at each equipment end)
  calculatedLengthM?: number; // Automatic total calculated cable length in meters

  // Custom attributes preserved during serialization
  customProps?: Record<string, any>;

  // 3D waypoints for vertical cable risers and routing
  waypoints3D?: Array<{
    x3D: number;
    y3D: number;
    z3D: number;
    x2D: number;
    y2D: number;
    snapLabel?: string;
  }>;
}

export interface BackgroundImageConfig {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number; // 0 to 1 (default 0.6)
  locked: boolean;
}

export interface ViewportState {
  zoom: number; // 0.1 to 10
  panX: number;
  panY: number;
}

export interface ProjectSettings {
  scaleFactor: number; // px per meter (e.g. 20 means 20px = 1m)
  unit: string; // 'm' | 'ft' | 'cm' | 'in'
  gridSize: number; // in pixels (5 - 100)
  gridVisible: boolean;
  gridSnap: boolean;
  objectSnap: boolean;
  orthoMode: boolean;
  autoDims: boolean;
  showMeasurements: boolean; // Standard live dimension labels on shapes & stencils
  showObjectLabels?: boolean; // Stencil name and ID badges can be toggled on/off
  selectionBoxStyle: 'none' | 'corners' | 'box'; // Bounding box display style: none (minimized), corners, or box
  dimensionArrowStyle: 'slash' | 'arrow' | 'dot'; // Standard CAD terminators
  dimensionUnitFormat: 'm' | 'mm' | 'cm' | 'ft' | 'ft-in';
  showTitleBlock: boolean; // Standard Engineering ISO/ANSI Title Block
  showNorthArrow: boolean; // Standard Site True North Compass
  showScaleBar: boolean; // Dynamic Graphical Scale Bar
  showLegend: boolean; // Standard Telecom Symbols Legend
  titleBlockPos?: Point;
  northArrowPos?: Point;
  scaleBarPos?: Point;
  legendPos?: Point;
  renderStyle: 'cad' | 'photo'; // 'cad' for standard engineering structural drawing symbols; 'photo' for photorealistic 2D rendering
  cadTheme?: 'dark' | 'blueprint' | 'white'; // 'dark' (slate CAD), 'blueprint' (deep cyan blueprint), 'white' (printed white paper)
  cadCrosshairs?: boolean; // Full-screen CAD drafting crosshairs with pickbox
  cadDraftingSheet?: boolean; // Standard CAD drafting sheet border with zone coordinates (A-F, 1-8)
  fileName: string;
  drawingNumber?: string;
  siteId?: string;
  canvasWidth: number;
  canvasHeight: number;
  layers?: CADLayer[]; // Photoshop-style Layering System stack
  activeLayerId?: string; // Current layer for newly placed or drawn objects
  defaultFontFamily?: string; // Default drafting font (e.g. 'titillium-web', 'inter', etc.)
}

export interface CADDefaultStyle {
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillEnabled: boolean;
  fillOpacity: number;
  fontFamily?: string;
  fontSize?: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snapped: boolean;
  snapType?: 'grid' | 'endpoint' | 'center' | 'midpoint';
  targetObjId?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  timestamp: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}
