/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Undo2,
  Redo2,
  Copy,
  Scissors,
  ClipboardPaste,
  CopyPlus,
  Trash2,
  CheckSquare,
} from 'lucide-react';

interface EditSubfunctionsProps {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasClipboard: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll?: () => void;
}

export const EditSubfunctions: React.FC<EditSubfunctionsProps> = ({
  canUndo,
  canRedo,
  hasSelection,
  hasClipboard,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  onDelete,
  onSelectAll,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none text-xs">
      {/* 1. History (Undo / Redo) */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          History
        </span>

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo Action [Ctrl+Z]"
          className={`flex items-center gap-1.5 px-2 py-1 rounded font-medium transition-colors ${
            canUndo
              ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo Action [Ctrl+Y]"
          className={`flex items-center gap-1.5 px-2 py-1 rounded font-medium transition-colors ${
            canRedo
              ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span>Redo</span>
        </button>
      </div>

      {/* 2. Clipboard Operations */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Clipboard
        </span>

        <button
          type="button"
          onClick={onCut}
          disabled={!hasSelection}
          title="Cut Selected [Ctrl+X]"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
            hasSelection
              ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Cut</span>
        </button>

        <button
          type="button"
          onClick={onCopy}
          disabled={!hasSelection}
          title="Copy Selected [Ctrl+C]"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
            hasSelection
              ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </button>

        <button
          type="button"
          onClick={onPaste}
          disabled={!hasClipboard}
          title="Paste from CAD Clipboard [Ctrl+V]"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
            hasClipboard
              ? 'text-sky-300 hover:text-white hover:bg-sky-950/50 cursor-pointer border border-sky-500/30'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5 text-sky-400" />
          <span>Paste</span>
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          disabled={!hasSelection}
          title="Duplicate Object with Offset [Ctrl+D]"
          className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
            hasSelection
              ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <CopyPlus className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>
      </div>

      {/* 3. Selection & Deletion */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden lg:inline">
          Selection
        </span>

        {onSelectAll && (
          <button
            type="button"
            onClick={onSelectAll}
            title="Select All Objects on Canvas [Ctrl+A]"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Select All</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          disabled={!hasSelection}
          title="Delete Selected Objects [Del / Backspace]"
          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
            hasSelection
              ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
