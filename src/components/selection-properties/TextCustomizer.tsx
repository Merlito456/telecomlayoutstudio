/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CADObject } from "../../types/cad";
import { Bold, Italic, Type, Check, ChevronDown, Sparkles } from "lucide-react";
import { CAD_FONTS, getCADFontById, getSafeFontCss } from "../../utils/cad-fonts";

interface TextCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects?: CADObject[];
}

export const TextCustomizer: React.FC<TextCustomizerProps> = ({
  primary,
  onUpdateSelected,
  allObjects = [],
}) => {
  const [fontFilter, setFontFilter] = useState<'all' | 'cad' | 'sans' | 'mono' | 'architectural'>('all');
  const [isFontExpanded, setIsFontExpanded] = useState(false);

  if (!primary) return null;

  // Check if primary is directly a text/label/leader/dimension
  const isDirectText =
    primary.type === 'text' ||
    primary.type === 'leader' ||
    Boolean(primary.isStencilLabel) ||
    primary.text !== undefined;

  // Check if primary is a stencil with an attached label
  const attachedLabel = allObjects.find(
    (o) => (o.isStencilLabel || o.type === 'text') && o.parentId === primary.id
  );

  const showStationLabels =
    primary.type === 'dim-h' ||
    primary.type === 'dim-v' ||
    primary.type === 'dim-aligned';

  if (!isDirectText && !attachedLabel && !showStationLabels) return null;

  // If object is not direct text and has an attached label, edit the attached label;
  // otherwise edit the primary object directly (including dimension lines and text)
  const targetObj = (!isDirectText && !showStationLabels && attachedLabel) ? attachedLabel : primary;
  const currentFont = getCADFontById(targetObj?.fontFamily);

  const handleUpdateFont = (fontId: string) => {
    if (isDirectText || showStationLabels) {
      onUpdateSelected({ fontFamily: fontId });
    } else if (attachedLabel) {
      // Update attached label in allObjects
      onUpdateSelected(
        {
          // Also set on parent as a preference
          customProps: {
            ...(primary.customProps || {}),
            labelFontFamily: fontId,
          },
        },
        true
      );
      // Directly update the attached label object if possible via custom event / properties
      attachedLabel.fontFamily = fontId;
    } else {
      onUpdateSelected({ fontFamily: fontId });
    }
  };

  const filteredFonts = CAD_FONTS.filter((f) => {
    if (fontFilter === 'all') return true;
    if (fontFilter === 'cad') return f.category === 'cad';
    if (fontFilter === 'sans') return f.category === 'sans';
    if (fontFilter === 'mono') return f.category === 'mono';
    if (fontFilter === 'architectural') return f.category === 'architectural' || f.category === 'serif';
    return true;
  });

  return (
    <div className="space-y-3.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-sky-400" />
          {primary.type === 'leader'
            ? 'Leader Callout Typography'
            : showStationLabels
            ? 'Dimension Station Typography'
            : !isDirectText && attachedLabel
            ? 'Attached Stencil Label Typography'
            : 'Text & Label Typography'}
        </span>
        <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
          {currentFont.badge}
        </span>
      </div>

      {/* Label Content Input */}
      {isDirectText && (
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">
            {primary.type === 'leader' ? 'Callout Note Text' : 'Label Content'}
          </label>
          <input
            type="text"
            value={primary.text || ''}
            onChange={(e) => onUpdateSelected({ text: e.target.value })}
            placeholder={primary.type === 'leader' ? 'Enter callout note...' : 'Text label...'}
            style={{ fontFamily: getSafeFontCss(targetObj?.fontFamily) }}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>
      )}

      {/* Attached Stencil Label Notice */}
      {!isDirectText && attachedLabel && (
        <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[10.5px] text-sky-300 flex items-center justify-between">
          <span>
            Stencil Label: <strong>"{attachedLabel.text}"</strong>
          </span>
          <span className="text-[9px] text-slate-400 font-mono">Linked Child</span>
        </div>
      )}

      {/* 1. CAD Font Family Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10.5px] font-semibold text-slate-300 flex items-center gap-1">
            <span>Font Family</span>
          </label>
          <button
            type="button"
            onClick={() => setIsFontExpanded((prev) => !prev)}
            className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
          >
            {isFontExpanded ? 'Collapse' : 'Browse All Fonts'}
            <ChevronDown className={`w-3 h-3 transition-transform ${isFontExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick Dropdown Select */}
        <div className="relative">
          <select
            value={currentFont.id}
            onChange={(e) => handleUpdateFont(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
          >
            {CAD_FONTS.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200 py-1">
                {f.name} [{f.badge}] — {f.categoryLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Popular Font Presets */}
        <div className="grid grid-cols-3 gap-1 pt-0.5">
          {[
            { id: 'titillium-web', label: 'Titillium', badge: 'ISO CAD' },
            { id: 'jetbrains-mono', label: 'JetBrains', badge: 'Mono' },
            { id: 'inter', label: 'Inter', badge: 'Modern' },
            { id: 'oswald', label: 'Oswald', badge: 'DIN' },
            { id: 'architects-daughter', label: 'Architect', badge: 'Draft' },
            { id: 'roboto', label: 'Roboto', badge: 'Sans' },
          ].map((preset) => {
            const isSelected = currentFont.id === preset.id;
            const fontObj = getCADFontById(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleUpdateFont(preset.id)}
                className={`px-1.5 py-1 rounded-md text-[10px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span style={{ fontFamily: fontObj.family }} className="truncate max-w-full">
                  {preset.label}
                </span>
                <span className="text-[7.5px] text-slate-500 font-mono">{preset.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Categorized Font Library Browser */}
        {isFontExpanded && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            {/* Category filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[9.5px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'cad', label: 'CAD / ISO' },
                { id: 'sans', label: 'Sans' },
                { id: 'mono', label: 'Monospace' },
                { id: 'architectural', label: 'Architect' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFontFilter(tab.id as any)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer shrink-0 ${
                    fontFilter === tab.id
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Font Cards List */}
            <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
              {filteredFonts.map((f) => {
                const isSelected = currentFont.id === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleUpdateFont(f.id)}
                    className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400/80 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800/90 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[12px] font-semibold ${isSelected ? 'text-sky-200' : 'text-slate-200'}`}
                          style={{ fontFamily: f.family }}
                        >
                          {f.name}
                        </span>
                        <span className="text-[8.5px] px-1 py-0.2 rounded font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800">
                          {f.badge}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-tight truncate mt-0.5">
                        {f.description}
                      </p>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">Select</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Font Size & Bold / Italic */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Font Size</span>
            <span className="font-mono text-sky-300">{targetObj.fontSize || 12}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={targetObj.fontSize || 12}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (isDirectText || showStationLabels) {
                onUpdateSelected({ fontSize: val });
              } else if (attachedLabel) {
                attachedLabel.fontSize = val;
                onUpdateSelected({ customProps: { ...(primary.customProps || {}), labelFontSize: val } });
              } else {
                onUpdateSelected({ fontSize: val });
              }
            }}
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          {/* Quick Size Steppers */}
          <div className="flex items-center gap-1 pt-1">
            {[9, 11, 12, 14, 18, 24].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => {
                  if (isDirectText || showStationLabels) {
                    onUpdateSelected({ fontSize: sz });
                  } else if (attachedLabel) {
                    attachedLabel.fontSize = sz;
                    onUpdateSelected({ customProps: { ...(primary.customProps || {}), labelFontSize: sz } });
                  } else {
                    onUpdateSelected({ fontSize: sz });
                  }
                }}
                className={`flex-1 py-0.5 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
                  (targetObj?.fontSize || 12) === sz
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextBold = !targetObj?.bold;
              if (attachedLabel && !isDirectText && !showStationLabels) {
                attachedLabel.bold = nextBold;
                onUpdateSelected({ customProps: { ...(primary.customProps || {}), labelBold: nextBold } }, true);
              } else {
                onUpdateSelected({ bold: nextBold });
              }
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer border ${
              targetObj?.bold
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Bold [Ctrl+B]"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const nextItalic = !targetObj?.italic;
              if (attachedLabel && !isDirectText && !showStationLabels) {
                attachedLabel.italic = nextItalic;
                onUpdateSelected({ customProps: { ...(primary.customProps || {}), labelItalic: nextItalic } }, true);
              } else {
                onUpdateSelected({ italic: nextItalic });
              }
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer border ${
              targetObj?.italic
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Italic [Ctrl+I]"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Text & Background Chip Colors */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Text Color</label>
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded p-1">
            <input
              type="color"
              value={targetObj?.textColor || '#ffffff'}
              onChange={(e) => {
                const color = e.target.value;
                if (attachedLabel && !isDirectText && !showStationLabels) {
                  attachedLabel.textColor = color;
                  onUpdateSelected({ customProps: { ...(primary.customProps || {}), labelTextColor: color } }, true);
                } else {
                  onUpdateSelected({ textColor: color });
                }
              }}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-[10px] font-mono text-slate-300">
              {targetObj?.textColor || '#ffffff'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Background Chip</label>
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded p-1">
            <input
              type="color"
              value={targetObj?.bgColor || '#1e293b'}
              onChange={(e) => {
                const color = e.target.value;
                if (attachedLabel && !isDirectText && !showStationLabels) {
                  attachedLabel.bgColor = color;
                  onUpdateSelected({ customProps: { ...(primary.customProps || {}), labelBgColor: color } }, true);
                } else {
                  onUpdateSelected({ bgColor: color });
                }
              }}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-[10px] font-mono text-slate-300">
              {targetObj?.bgColor || '#1e293b'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Dimension Station Labels (FROM / TO) */}
      {showStationLabels && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10.5px] font-semibold text-sky-400 uppercase tracking-wider block">
            Drafting Station Labels (FROM / TO)
          </span>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Origin Station (FROM)</label>
            <input
              type="text"
              value={primary.fromLabel || ''}
              onChange={(e) => onUpdateSelected({ fromLabel: e.target.value })}
              placeholder="Origin feature (e.g. Shelter Wall)..."
              style={{ fontFamily: getSafeFontCss(primary.fontFamily) }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Target Station (TO)</label>
            <input
              type="text"
              value={primary.toLabel || ''}
              onChange={(e) => onUpdateSelected({ toLabel: e.target.value })}
              placeholder="Target feature (e.g. Boundary Fence)..."
              style={{ fontFamily: getSafeFontCss(primary.fontFamily) }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};
