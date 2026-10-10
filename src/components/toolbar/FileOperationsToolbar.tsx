/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Image as ImageIcon,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';

interface FileOperationsToolbarProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onLoadProjectFile: (file: File) => void;
  onLoadBackgroundImage: (file: File) => void;
  onTriggerPasteImage: () => void;
}

export const FileOperationsToolbar: React.FC<FileOperationsToolbarProps> = ({
  onNewProject,
  onSaveProject,
  onLoadProjectFile,
  onLoadBackgroundImage,
  onTriggerPasteImage,
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
    <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 shrink-0">
      <button
        onClick={onNewProject}
        title="New Plan (Clear canvas)"
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5" />
      </button>

      {/* Open / Load CAD File (.dxf or .json) */}
      <button
        onClick={() => jsonInputRef.current?.click()}
        title="Open / Load File (.dxf or .json)"
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <FolderOpen className="w-3.5 h-3.5" />
      </button>
      <input
        ref={jsonInputRef}
        type="file"
        accept=".dxf,.json,.cad.json"
        className="hidden"
        onChange={handleJsonUpload}
      />

      {/* Save Layout (JSON) */}
      <button
        onClick={onSaveProject}
        title="Save Project File (JSON) [Ctrl+S]"
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <Save className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

      {/* Import AutoCAD DXF */}
      <button
        onClick={() => dxfInputRef.current?.click()}
        title="Load AutoCAD Drawing (.dxf) — Import layers, lines, polylines, circles & text"
        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
      >
        <Upload className="w-3.5 h-3.5" />
      </button>
      <input
        ref={dxfInputRef}
        type="file"
        accept=".dxf"
        className="hidden"
        onChange={handleDxfUpload}
      />

      <button
        onClick={() => imgInputRef.current?.click()}
        title="Open Image (Trace background floorplan)"
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <button
        onClick={onTriggerPasteImage}
        title="Paste Image from Clipboard [Ctrl+V]"
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
      </button>
    </div>
  );
};
