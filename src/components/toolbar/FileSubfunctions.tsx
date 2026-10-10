/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  FileText,
  Save,
  FolderOpen,
  Image as ImageIcon,
  Clipboard,
  FileSpreadsheet,
  Download,
  Printer,
  Ruler,
  Activity,
  Info,
} from 'lucide-react';

interface FileSubfunctionsProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onLoadProjectFile: (file: File) => void;
  onLoadBackgroundImage: (file: File) => void;
  onTriggerPasteImage: () => void;
  onExportDXF?: () => void;
  onExportPNG: () => void;
  onPrintA3: () => void;
  onOpenScaleModal: () => void;
  onOpenDiagnostics: () => void;
  onOpenAbout?: () => void;
}

export const FileSubfunctions: React.FC<FileSubfunctionsProps> = ({
  onNewProject,
  onSaveProject,
  onLoadProjectFile,
  onLoadBackgroundImage,
  onTriggerPasteImage,
  onExportDXF,
  onExportPNG,
  onPrintA3,
  onOpenScaleModal,
  onOpenDiagnostics,
  onOpenAbout,
}) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const dxfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProjectFile(file);
      e.target.value = '';
    }
  };

  const handleDxfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProjectFile(file);
      e.target.value = '';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadBackgroundImage(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none text-xs">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={jsonInputRef}
        onChange={handleJsonUpload}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={dxfInputRef}
        onChange={handleDxfUpload}
        accept=".dxf"
        className="hidden"
      />
      <input
        type="file"
        ref={imgInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Project Management */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Project
        </span>

        <button
          type="button"
          onClick={onNewProject}
          title="Create New Blank Telecom Site Plan"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>New</span>
        </button>

        <button
          type="button"
          onClick={onSaveProject}
          title="Save Project to JSON File [Ctrl+S]"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-sky-950/60 hover:bg-sky-900/90 text-sky-300 hover:text-white border border-sky-500/40 cursor-pointer font-medium"
        >
          <Save className="w-3.5 h-3.5 text-sky-400" />
          <span>Save</span>
        </button>

        <button
          type="button"
          onClick={() => jsonInputRef.current?.click()}
          title="Open Existing Project (.json)"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Open</span>
        </button>

        <button
          type="button"
          onClick={() => dxfInputRef.current?.click()}
          title="Import AutoCAD DXF Drawing"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>DXF In</span>
        </button>
      </div>

      {/* 2. Background Reference Image */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Survey Image
        </span>

        <button
          type="button"
          onClick={() => imgInputRef.current?.click()}
          title="Load Satellite Map or Survey Floorplan as Calibrated Canvas Background"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Import Photo</span>
        </button>

        <button
          type="button"
          onClick={onTriggerPasteImage}
          title="Paste Image Directly from System Clipboard"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
          <span>Paste Image</span>
        </button>
      </div>

      {/* 3. Export & Publication */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Export
        </span>

        {onExportDXF && (
          <button
            type="button"
            onClick={onExportDXF}
            title="Export Vector DXF for AutoCAD / MicroStation"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 cursor-pointer font-medium"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>AutoCAD DXF</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExportPNG}
          title="Export High-Resolution Scaled PNG Image"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>High-Res PNG</span>
        </button>

        <button
          type="button"
          onClick={onPrintA3}
          title="Print to A3 Title Block Layout (PDF / Plotter)"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-purple-400" />
          <span>Print A3</span>
        </button>
      </div>

      {/* 4. Diagnostics & Calibration */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onOpenScaleModal}
          title="Calibrate Scale (e.g. 1:100, 1:50, Real-world mm conversion)"
          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 cursor-pointer"
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenDiagnostics}
          title="Diagnostics Report [Ctrl+Shift+D]"
          className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>

        {onOpenAbout && (
          <button
            type="button"
            onClick={onOpenAbout}
            title="About Telecom Site Layout Studio"
            className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
