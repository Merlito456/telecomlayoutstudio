/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CADObject, ProjectSettings, ViewportState } from '../types/cad';
import { downloadDiagnosticsReport } from '../utils/cad-export';
import { X, Activity, Download, RefreshCw } from 'lucide-react';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  objects: CADObject[];
  viewport: ViewportState;
  storageKB: number;
  onResetSession: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  settings,
  objects,
  viewport,
  storageKB,
  onResetSession,
}) => {
  if (!isOpen) return null;

  const stencilsCount = objects.filter((o) => o.isStencil).length;
  const labelsCount = objects.filter((o) => o.isStencilLabel).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h2 className="font-semibold text-base">System &amp; Canvas Diagnostics</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-mono">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">App Name:</span>
              <span className="text-sky-300 font-semibold">Telecom Site Layout Studio</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Version:</span>
              <span>1.2.0 (CAD Build)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Canvas Objects:</span>
              <span className="text-sky-400 font-bold">{objects.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stencils Deployed:</span>
              <span>{stencilsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Detached Labels:</span>
              <span>{labelsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Zoom / Pan:</span>
              <span>
                {Math.round(viewport.zoom * 100)}% @ ({Math.round(viewport.panX)},{' '}
                {Math.round(viewport.panY)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auto-save Payload:</span>
              <span className="text-amber-400 font-semibold">{storageKB} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scale Ratio:</span>
              <span>
                1 {settings.unit} = {settings.scaleFactor} px
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
            Need technical assistance or troubleshooting? Download the full diagnostics dump to
            inspect coordinate hierarchies, bounding boxes, and browser engine performance.
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={() => {
                if (window.confirm('Reset this drafting session and clear local saved data?')) {
                  onResetSession();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-sans transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Session
            </button>

            <button
              onClick={() => {
                downloadDiagnosticsReport(settings, objects, viewport);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-sans font-semibold shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
