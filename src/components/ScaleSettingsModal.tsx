/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectSettings } from '../types/cad';
import { X, Sliders, Check } from 'lucide-react';

interface ScaleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  onSave: (updated: Partial<ProjectSettings>) => void;
}

export const ScaleSettingsModal: React.FC<ScaleSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [scaleFactor, setScaleFactor] = useState(settings.scaleFactor.toString());
  const [unit, setUnit] = useState(settings.unit);
  const [gridSize, setGridSize] = useState(settings.gridSize.toString());
  const [canvasWidth, setCanvasWidth] = useState(settings.canvasWidth.toString());
  const [canvasHeight, setCanvasHeight] = useState(settings.canvasHeight.toString());
  const [arrowStyle, setArrowStyle] = useState(settings.dimensionArrowStyle || 'slash');
  const [unitFormat, setUnitFormat] = useState(settings.dimensionUnitFormat || 'm');
  const [showMeasurements, setShowMeasurements] = useState(settings.showMeasurements ?? true);
  const [showObjectLabels, setShowObjectLabels] = useState(settings.showObjectLabels ?? true);
  const [showTitleBlock, setShowTitleBlock] = useState(settings.showTitleBlock ?? true);
  const [showNorthArrow, setShowNorthArrow] = useState(settings.showNorthArrow ?? true);
  const [showScaleBar, setShowScaleBar] = useState(settings.showScaleBar ?? true);
  const [drawingNumber, setDrawingNumber] = useState(settings.drawingNumber || 'DWG-TL-2026-A101');
  const [siteId, setSiteId] = useState(settings.siteId || 'SITE-MNL-042');
  const [boxStyle, setBoxStyle] = useState<'none' | 'corners' | 'box'>(settings.selectionBoxStyle || 'none');
  const [renderStyle, setRenderStyle] = useState<'cad' | 'photo'>(settings.renderStyle || 'cad');
  const [cadTheme, setCadTheme] = useState<'dark' | 'blueprint' | 'white'>(settings.cadTheme || 'dark');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      scaleFactor: Math.max(1, parseFloat(scaleFactor) || 20),
      unit: unit.trim() || 'm',
      gridSize: Math.max(5, Math.min(100, parseInt(gridSize) || 20)),
      canvasWidth: Math.max(800, parseInt(canvasWidth) || 1600),
      canvasHeight: Math.max(600, parseInt(canvasHeight) || 1000),
      dimensionArrowStyle: arrowStyle,
      dimensionUnitFormat: unitFormat,
      showMeasurements,
      showObjectLabels,
      selectionBoxStyle: boxStyle,
      renderStyle,
      cadTheme,
      showTitleBlock,
      showNorthArrow,
      showScaleBar,
      drawingNumber,
      siteId,
    });
    onClose();
  };

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
        className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="font-semibold text-base">CAD Drafting &amp; Dimension Standards</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Scale Factor */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Scale Factor (Pixels per Unit)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono">1 {unit} =</span>
              <input
                type="number"
                min="1"
                max="500"
                step="0.5"
                value={scaleFactor}
                onChange={(e) => setScaleFactor(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sky-300 font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-slate-500">pixels</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Standard civil/telecom site layout is 20 px = 1 meter (1:50 scale).
            </p>
          </div>

          {/* Unit Label */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Base Unit</label>
            <div className="flex gap-2">
              {['m', 'ft', 'cm', 'in'].map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    unit === u
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {u}
                </button>
              ))}
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Custom unit..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Dimension Terminators & Formatting */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
              Dimension Line Standards (ISO / ANSI)
            </span>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Dimension Arrowhead / Terminator Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'slash', label: 'Slash 45° (Arch/Civil)' },
                  { id: 'arrow', label: 'Arrow (ISO 128)' },
                  { id: 'dot', label: 'Datum Dot' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setArrowStyle(st.id as any)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      arrowStyle === st.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Dimension Label Formatting
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'm', label: 'Meters (m)' },
                  { id: 'mm', label: 'Millimeters (mm)' },
                  { id: 'cm', label: 'Centimeters (cm)' },
                  { id: 'ft-in', label: 'Feet-Inches (ft-in)' },
                ].map((uf) => (
                  <button
                    key={uf.id}
                    type="button"
                    onClick={() => setUnitFormat(uf.id as any)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      unitFormat === uf.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {uf.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={showMeasurements}
                  onChange={(e) => setShowMeasurements(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
                <span className="font-medium">Show live measurement labels on all shapes &amp; equipment</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={showObjectLabels}
                  onChange={(e) => setShowObjectLabels(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
                <span className="font-medium">Show object stencil text &amp; name labels</span>
              </label>
            </div>

            {/* Selection Box Minimization */}
            <div className="pt-2">
              <label className="block text-slate-300 font-medium mb-1">
                Object Selection Bounding Box Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None (Minimized - 0 Box)' },
                  { id: 'corners', label: 'CAD Corners (L-Marks)' },
                  { id: 'box', label: 'Full Box (Handles)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBoxStyle(b.id as any)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      boxStyle === b.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                "None" minimizes the selection box completely to zero boxes for clean drafting.
              </p>
            </div>
          </div>

          {/* Standard Engineering Title Block Metadata */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
              Drawing Sheet &amp; Title Block
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Drawing Number</span>
                <input
                  type="text"
                  value={drawingNumber}
                  onChange={(e) => setDrawingNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Site ID / Designation</span>
                <input
                  type="text"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTitleBlock}
                  onChange={(e) => setShowTitleBlock(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
                <span>ISO Title Block</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNorthArrow}
                  onChange={(e) => setShowNorthArrow(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
                <span>North Arrow</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showScaleBar}
                  onChange={(e) => setShowScaleBar(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
                <span>Scale Bar</span>
              </label>
            </div>
          </div>

          {/* Grid Size */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Grid Pitch Size</span>
              <span className="font-mono text-sky-400">{gridSize} px</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value)}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" /> Apply Standards
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
