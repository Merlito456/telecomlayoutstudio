/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BackgroundImageConfig, CADLayer, CADObject, ProjectSettings, ViewportState } from '../types/cad';
import { renderCADCanvas } from './cad-renderer';
export { exportToDXF, downloadDXFFile, parseDXF, isDXFContent } from './cad-dxf';

export interface ProjectData {
  version: string;
  timestamp: string;
  settings: ProjectSettings;
  objects: CADObject[];
  bgImage: BackgroundImageConfig | null;
  viewport: ViewportState;
}

export function exportProjectToJSON(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null,
  viewport: ViewportState
): string {
  const data: ProjectData = {
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    settings,
    objects,
    bgImage,
    viewport,
  };
  return JSON.stringify(data, null, 2);
}

export function downloadProjectFile(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null,
  viewport: ViewportState
) {
  const json = exportProjectToJSON(settings, objects, bgImage, viewport);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = settings.fileName.replace(/[^a-z0-9_-]/gi, '_') || 'telecom_site_plan';
  a.href = url;
  a.download = `${safeName}.cad.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPNG(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null,
  scale = 2,
  includeGrid = false
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = settings.canvasWidth * scale;
    canvas.height = settings.canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    ctx.scale(scale, scale);

    // Draw clean background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, settings.canvasWidth, settings.canvasHeight);

    const exportSettings = { ...settings, gridVisible: includeGrid };
    const defaultViewport: ViewportState = { zoom: 1, panX: 0, panY: 0 };

    renderCADCanvas({
      ctx,
      viewport: defaultViewport,
      settings: exportSettings,
      objects,
      selectedIds: [],
      bgImage,
      canvasWidth: settings.canvasWidth,
      canvasHeight: settings.canvasHeight,
      isExport: true,
    });

    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
}

export async function downloadPNG(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null,
  includeGrid = false
) {
  const dataUrl = await exportToPNG(settings, objects, bgImage, 2, includeGrid);
  if (!dataUrl) return;
  const a = document.createElement('a');
  const safeName = settings.fileName.replace(/[^a-z0-9_-]/gi, '_') || 'telecom_site_plan';
  a.href = dataUrl;
  a.download = `${safeName}_2x.png`;
  a.click();
}

export function printA3Layout(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null
) {
  exportToPNG(settings, objects, bgImage, 2, false).then((dataUrl) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const scaleText = `1 ${settings.unit} = ${settings.scaleFactor} px`;
    const dateStr = new Date().toLocaleDateString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${settings.fileName} - Telecom Site Layout</title>
          <style>
            @page {
              size: A3 landscape;
              margin: 12mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
            }
            .sheet {
              width: 100%;
              box-sizing: border-box;
              border: 2px solid #0f172a;
              padding: 10px;
              position: relative;
            }
            .canvas-img {
              width: 100%;
              height: auto;
              display: block;
              border: 1px solid #cbd5e1;
            }
            .title-block {
              margin-top: 12px;
              border: 2px solid #0f172a;
              display: grid;
              grid-template-columns: 2fr 1fr 1fr 1fr;
              font-size: 11px;
            }
            .title-cell {
              padding: 6px 10px;
              border-right: 1px solid #0f172a;
            }
            .title-cell:last-child {
              border-right: none;
            }
            .label {
              font-size: 8px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .val {
              font-weight: 700;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <img class="canvas-img" src="${dataUrl}" alt="CAD Plot" />
            <div class="title-block">
              <div class="title-cell">
                <div class="label">PROJECT / SITE TITLE</div>
                <div class="val">${settings.fileName}</div>
                <div style="font-size: 9px; color: #475569; margin-top: 2px;">TELECOM CELL SITE DRAFTING SPECIFICATION</div>
              </div>
              <div class="title-cell">
                <div class="label">SCALE & UNITS</div>
                <div class="val">${scaleText}</div>
                <div style="font-size: 9px; color: #475569;">1m = ${(settings.scaleFactor).toFixed(1)}px</div>
              </div>
              <div class="title-cell">
                <div class="label">DATE / REVISION</div>
                <div class="val">${dateStr}</div>
                <div style="font-size: 9px; color: #475569;">REV: 01 (APPROVED)</div>
              </div>
              <div class="title-cell">
                <div class="label">TOTAL OBJECTS</div>
                <div class="val">${objects.length} ELEMENTS</div>
                <div style="font-size: 9px; color: #475569;">SHEET 1 OF 1</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  });
}

export function downloadDiagnosticsReport(
  settings: ProjectSettings,
  objects: CADObject[],
  viewport: ViewportState
) {
  const report = {
    app: 'Telecom Site Layout Studio',
    version: '1.2.0',
    generatedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    },
    viewport,
    settings,
    totalObjects: objects.length,
    objectTypesCount: objects.reduce((acc, o) => {
      acc[o.type] = (acc[o.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    stencilsCount: objects.filter((o) => o.isStencil).length,
    memoryStatus: (performance as any).memory
      ? {
          usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
          totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        }
      : 'N/A',
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `telecom_cad_diagnostics_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const STORAGE_KEY = 'TELECOM_CAD_AUTO_SAVE_v1';
const BACKUP_STORAGE_KEY = 'TELECOM_CAD_AUTO_SAVE_BACKUP_v1';
const INITIALIZED_FLAG_KEY = 'TELECOM_CAD_APP_INITIALIZED_FLAG';

export function isFirstAppLaunch(): boolean {
  try {
    return !localStorage.getItem(INITIALIZED_FLAG_KEY);
  } catch {
    return false;
  }
}

export function markAppInitialized(): void {
  try {
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
  } catch {
    // ignore
  }
}

export function saveSessionToLocalStorage(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null,
  viewport: ViewportState
): number {
  try {
    const json = exportProjectToJSON(settings, objects, bgImage, viewport);
    try {
      localStorage.setItem(STORAGE_KEY, json);
      // Secondary backup key for disaster recovery
      localStorage.setItem(BACKUP_STORAGE_KEY, json);
      markAppInitialized();
      return Math.round(json.length / 1024);
    } catch (quotaErr) {
      // If quota exceeded (e.g. huge background image), save objects & settings without heavy bgImage dataUrl
      console.warn('LocalStorage quota exceeded, saving objects & settings with lightweight metadata:', quotaErr);
      const lightweightBg = bgImage ? { ...bgImage, dataUrl: '' } : null;
      const lightJson = exportProjectToJSON(settings, objects, lightweightBg, viewport);
      localStorage.setItem(STORAGE_KEY, lightJson);
      localStorage.setItem(BACKUP_STORAGE_KEY, lightJson);
      markAppInitialized();
      return Math.round(lightJson.length / 1024);
    }
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
    return 0;
  }
}

export function loadSessionFromLocalStorage(): ProjectData | null {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    }
    if (!raw) return null;
    const data = JSON.parse(raw) as ProjectData;
    if (data && Array.isArray(data.objects)) {
      return data;
    }
  } catch (err) {
    console.error('Failed to load primary autosaved session, attempting backup:', err);
    try {
      const backupRaw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backupRaw) {
        const backupData = JSON.parse(backupRaw) as ProjectData;
        if (backupData && Array.isArray(backupData.objects)) {
          return backupData;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function clearSessionLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
  } catch {
    // ignore
  }
}
