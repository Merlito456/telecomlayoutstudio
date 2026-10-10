/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Point } from '../types/cad';
import { CAD_FONTS, getCADFontById, getSafeFontCss } from '../utils/cad-fonts';
import { Type, ChevronDown, Check } from 'lucide-react';

interface InlineTextEditorProps {
  initialText: string;
  position: Point; // Screen coordinates
  fontSize: number;
  fontFamily?: string;
  onCommit: (text: string, fontFamily?: string) => void;
  onCancel: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  initialText,
  position,
  fontSize,
  fontFamily,
  onCommit,
  onCancel,
}) => {
  const [value, setValue] = useState(initialText);
  const [currentFontId, setCurrentFontId] = useState(() => {
    return getCADFontById(fontFamily).id;
  });
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeFont = getCADFontById(currentFontId);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(value, currentFontId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (fontMenuOpen) {
        setFontMenuOpen(false);
      } else {
        onCancel();
      }
    }
  };

  const handleSelectFont = (fontId: string) => {
    setCurrentFontId(fontId);
    setFontMenuOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className="absolute z-50 flex flex-col items-center gap-1.5 animate-in zoom-in-95 duration-100 select-none"
    >
      {/* Floating Font & Style Bar */}
      <div className="relative flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/95 border border-sky-500/60 shadow-2xl backdrop-blur-md text-xs">
        <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
          <Type className="w-3 h-3 text-sky-400" />
          Font:
        </span>

        {/* Font Selector Trigger */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setFontMenuOpen((prev) => !prev);
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-200 text-[11px] font-medium transition-colors cursor-pointer"
          title="Select CAD drafting font"
        >
          <span style={{ fontFamily: activeFont.family }}>{activeFont.name}</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-sky-950 text-sky-300 font-mono font-bold border border-sky-800/60">
            {activeFont.badge}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>

        <span className="text-[10px] text-slate-400 pl-1 border-l border-slate-800">
          Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded text-[9px] font-mono">Enter</kbd> to save
        </span>

        {/* Dropdown Menu */}
        {fontMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-0 top-full mt-1 w-64 max-h-72 overflow-y-auto rounded-xl bg-slate-950/98 border border-slate-700 shadow-2xl p-1.5 z-60 space-y-1 text-xs backdrop-blur-lg"
          >
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              Select CAD Typography
            </div>
            {CAD_FONTS.map((f) => {
              const isSelected = f.id === currentFontId;
              return (
                <button
                  key={f.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectFont(f.id);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium" style={{ fontFamily: f.family }}>
                      {f.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans">{f.description}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[8.5px] px-1 py-0.5 rounded font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
                      {f.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Text Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // If blurring because clicking inside the font menu, do not commit yet
          if (menuRef.current && menuRef.current.contains(e.relatedTarget as Node)) {
            return;
          }
          if (!fontMenuOpen) {
            onCommit(value, currentFontId);
          }
        }}
        style={{
          fontSize: `${Math.max(12, fontSize)}px`,
          fontFamily: getSafeFontCss(currentFontId),
        }}
        className="bg-slate-900 border-2 border-sky-400 text-white rounded px-3 py-1 font-semibold shadow-2xl focus:outline-none min-w-[140px] text-center"
      />
    </div>
  );
};
