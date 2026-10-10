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
} from 'lucide-react';

interface EditClipboardToolbarProps {
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
}

export const EditClipboardToolbar: React.FC<EditClipboardToolbarProps> = ({
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
}) => {
  return (
    <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 shrink-0">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo [Ctrl+Z]"
        className={`p-1.5 rounded transition-colors ${
          canUndo ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo [Ctrl+Y]"
        className={`p-1.5 rounded transition-colors ${
          canRedo ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

      <button
        onClick={onCut}
        disabled={!hasSelection}
        title="Cut [Ctrl+X]"
        className={`p-1.5 rounded transition-colors ${
          hasSelection ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Scissors className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCopy}
        disabled={!hasSelection}
        title="Copy [Ctrl+C]"
        className={`p-1.5 rounded transition-colors ${
          hasSelection ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onPaste}
        disabled={!hasClipboard}
        title="Paste [Ctrl+V]"
        className={`p-1.5 rounded transition-colors ${
          hasClipboard ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <ClipboardPaste className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDuplicate}
        disabled={!hasSelection}
        title="Duplicate [Ctrl+D]"
        className={`p-1.5 rounded transition-colors ${
          hasSelection ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <CopyPlus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDelete}
        disabled={!hasSelection}
        title="Delete Selected [Del / Backspace]"
        className={`p-1.5 rounded transition-colors ${
          hasSelection ? 'text-rose-400 hover:text-rose-300 hover:bg-slate-800 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
