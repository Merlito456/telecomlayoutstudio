/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CADLayer, CADObject } from '../types/cad';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Layers,
  Check,
  Edit2,
  FolderInput,
  Sliders,
} from 'lucide-react';

interface LayersPanelProps {
  layers: CADLayer[];
  activeLayerId: string;
  onSetActiveLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<CADLayer>) => void;
  onMoveLayerUp: (id: string) => void;
  onMoveLayerDown: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onToggleAllVisibility: () => void;
  allVisible: boolean;
  selectedObjects: CADObject[];
  onMoveSelectedToLayer: (layerId: string) => void;
  objectCounts: Record<string, number>;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSetActiveLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onUpdateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onAddLayer,
  onDeleteLayer,
  onToggleAllVisibility,
  allVisible,
  selectedObjects,
  onMoveSelectedToLayer,
  objectCounts,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (layer: CADLayer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const commitRename = (id: string) => {
    if (editName.trim()) {
      onUpdateLayer(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full text-slate-200 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Layers Stack
          </h3>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
            {layers.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle All Visibility */}
          <button
            type="button"
            onClick={onToggleAllVisibility}
            title={allVisible ? 'Hide All Layers' : 'Show All Layers'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {allVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Add Layer */}
          <button
            type="button"
            onClick={onAddLayer}
            title="Create New Layer"
            className="p-1 rounded bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Object Layer Assignment Banner */}
      {selectedObjects.length > 0 && (
        <div className="px-3 py-2 bg-sky-950/40 border-b border-sky-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-sky-300 font-medium">
            <FolderInput className="w-3.5 h-3.5" />
            <span>Move {selectedObjects.length} item(s) to:</span>
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onMoveSelectedToLayer(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-900 border border-sky-500/40 text-sky-200 text-[11px] rounded px-2 py-0.5 focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            <option value="" disabled>
              Select Layer...
            </option>
            {layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Photoshop-style Stacking Order Hint */}
      <div className="px-3 py-1 bg-slate-950/40 border-b border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>▲ Top (Drawn on Front)</span>
        <span>▼ Bottom (Drawn on Back)</span>
      </div>

      {/* Layers List (Top to Bottom) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-900/80 p-1.5 space-y-1">
        {layers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          const count = objectCounts[layer.id] || 0;
          const isTop = index === 0;
          const isBottom = index === layers.length - 1;

          return (
            <div
              key={layer.id}
              onClick={() => onSetActiveLayer(layer.id)}
              className={`group rounded-lg p-2 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-slate-900/90 border-sky-500/60 shadow-md ring-1 ring-sky-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
              } ${!layer.visible ? 'opacity-55' : ''}`}
            >
              <div className="flex items-center gap-2">
                {/* Visibility Toggle (Eye) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerVisibility(layer.id);
                  }}
                  title={layer.visible ? 'Hide Layer [Eye]' : 'Show Layer [Eye]'}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    layer.visible
                      ? 'text-sky-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Lock Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerLock(layer.id);
                  }}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer (Protect from edits)'}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    layer.locked
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                {/* Color Swatch */}
                <span
                  className="w-2.5 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color || '#38bdf8' }}
                />

                {/* Layer Name & Renaming */}
                <div className="flex-1 min-w-0">
                  {editingId === layer.id ? (
                    <input
                      type="text"
                      value={editName}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => commitRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(layer.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full bg-slate-950 border border-sky-400 rounded px-1.5 py-0.5 text-xs text-white font-medium focus:outline-none"
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startRename(layer);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-xs text-slate-200 truncate" title="Double click to rename">
                        {layer.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{count} object{count !== 1 ? 's' : ''}</span>
                    {layer.opacity < 1 && (
                      <span className="text-amber-400">
                        {Math.round(layer.opacity * 100)}% op
                      </span>
                    )}
                  </div>
                </div>

                {/* Stacking Order Buttons */}
                <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={isTop}
                    onClick={() => onMoveLayerUp(layer.id)}
                    title="Move Layer Higher (Draw Above)"
                    className={`p-0.5 rounded transition-colors ${
                      isTop ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isBottom}
                    onClick={() => onMoveLayerDown(layer.id)}
                    title="Move Layer Lower (Draw Below)"
                    className={`p-0.5 rounded transition-colors ${
                      isBottom ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete button (for non-essential layers or empty) */}
                {layers.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (count > 0) {
                        if (!window.confirm(`Delete layer "${layer.name}"? Its ${count} objects will be moved to the default layer.`)) {
                          return;
                        }
                      }
                      onDeleteLayer(layer.id);
                    }}
                    title="Delete Layer"
                    className="p-1 text-slate-600 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Layer Opacity Slider (Expanded on Active) */}
              {isActive && (
                <div
                  className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] text-slate-400 font-mono">Opacity</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={layer.opacity}
                    onChange={(e) => onUpdateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                    className="flex-1 accent-sky-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-sky-300 w-8 text-right">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 leading-snug">
        <strong className="text-sky-300">Photoshop Ordering:</strong> Move{' '}
        <span className="text-emerald-400 font-semibold">Concrete Basepads</span> above{' '}
        <span className="text-indigo-400 font-semibold">Cabinets</span> to render pads over equipment, or toggle the eye{' '}
        <Eye className="w-3 h-3 inline text-sky-400" /> to hide it completely.
      </div>
    </div>
  );
};
