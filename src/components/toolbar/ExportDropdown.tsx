/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  ChevronDown,
  FileCode,
  Image as ImageIcon,
  Printer,
} from 'lucide-react';

interface ExportDropdownProps {
  onExportDXF?: () => void;
  onExportPNG: () => void;
  onPrintA3: () => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportDXF,
  onExportPNG,
  onPrintA3,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportOpen]);

  return (
    <div className="relative" ref={exportMenuRef}>
      <button
        onClick={() => setIsExportOpen((prev) => !prev)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
        title="Export Options (AutoCAD DXF, PNG Image, Print Drawing)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className="w-3 h-3 text-sky-200" />
      </button>

      {isExportOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-lg">
          {onExportDXF && (
            <button
              onClick={() => {
                setIsExportOpen(false);
                onExportDXF();
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-800 text-amber-300 hover:text-amber-100 transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold flex items-center justify-between">
                  AutoCAD (.dxf)
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono font-bold">DXF</span>
                </div>
                <div className="text-[10px] text-slate-400">Civil 3D & AutoCAD compatible</div>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              setIsExportOpen(false);
              onExportPNG();
            }}
            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold">Export PNG (2x)</div>
              <div className="text-[10px] text-slate-400">High-resolution image</div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsExportOpen(false);
              onPrintA3();
            }}
            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer border-t border-slate-800"
          >
            <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold">Print Layout (A3)</div>
              <div className="text-[10px] text-slate-400">Landscape architectural sheet</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
