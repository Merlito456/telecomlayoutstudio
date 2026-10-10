/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { CADObject, ToastMessage } from '../types/cad';
import { HistoryManager } from '../utils/history';
import { uid } from '../utils/cad-defaults';

export interface UseCADHistoryAndClipboardProps {
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  historyRef: React.MutableRefObject<HistoryManager>;
  persistSessionImmediately: (objs: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

export function useCADHistoryAndClipboard({
  objects,
  setObjects,
  objectsRef,
  selectedIds,
  setSelectedIds,
  historyRef,
  persistSessionImmediately,
  addToast,
}: UseCADHistoryAndClipboardProps) {
  const [clipboard, setClipboard] = useState<CADObject[]>([]);
  const [pasteOffsetCount, setPasteOffsetCount] = useState(1);

  // Record History Snapshot
  const recordHistory = useCallback(
    (newObjects: CADObject[]) => {
      historyRef.current.recordState(newObjects);
      objectsRef.current = newObjects;
      setObjects(newObjects);
      persistSessionImmediately(newObjects);
    },
    [historyRef, objectsRef, setObjects, persistSessionImmediately]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    const prev = historyRef.current.undo();
    if (prev) {
      objectsRef.current = prev;
      setObjects(prev);
      setSelectedIds([]);
      persistSessionImmediately(prev);
      addToast('info', 'Undo successful');
    }
  }, [historyRef, objectsRef, setObjects, setSelectedIds, persistSessionImmediately, addToast]);

  const handleRedo = useCallback(() => {
    const next = historyRef.current.redo();
    if (next) {
      objectsRef.current = next;
      setObjects(next);
      setSelectedIds([]);
      persistSessionImmediately(next);
      addToast('info', 'Redo successful');
    }
  }, [historyRef, objectsRef, setObjects, setSelectedIds, persistSessionImmediately, addToast]);

  // Copy / Cut / Paste / Duplicate
  const handleCopy = useCallback(() => {
    const selected = objects.filter(
      (o) => selectedIds.includes(o.id) || (o.parentId && selectedIds.includes(o.parentId))
    );
    if (selected.length === 0) return;
    setClipboard(JSON.parse(JSON.stringify(selected)));
    setPasteOffsetCount(1);
    const primaryCount = selected.filter((o) => !o.isStencilLabel).length || selected.length;
    addToast('success', `Copied ${primaryCount} element(s) to clipboard`);
  }, [objects, selectedIds, addToast]);

  const handleCut = useCallback(() => {
    const selected = objects.filter(
      (o) => selectedIds.includes(o.id) || (o.parentId && selectedIds.includes(o.parentId))
    );
    if (selected.length === 0) return;
    setClipboard(JSON.parse(JSON.stringify(selected)));
    setPasteOffsetCount(1);
    const remaining = objects.filter(
      (o) => !selectedIds.includes(o.id) && !(o.parentId && selectedIds.includes(o.parentId))
    );
    setSelectedIds([]);
    recordHistory(remaining);
    const primaryCount = selected.filter((o) => !o.isStencilLabel).length || selected.length;
    addToast('info', `Cut ${primaryCount} element(s)`);
  }, [objects, selectedIds, recordHistory, setSelectedIds, addToast]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    const offset = 20 * pasteOffsetCount;
    setPasteOffsetCount((prev) => prev + 1);

    const idMap = new Map<string, string>();
    for (const orig of clipboard) {
      idMap.set(orig.id, uid());
    }

    const pasted: CADObject[] = clipboard.map((orig) => {
      const clone: CADObject = JSON.parse(JSON.stringify(orig));
      clone.id = idMap.get(orig.id) || uid();
      if (clone.parentId && idMap.has(clone.parentId)) {
        clone.parentId = idMap.get(clone.parentId);
      }
      clone.x += offset;
      clone.y += offset;
      if (clone.x2 !== undefined) clone.x2 += offset;
      if (clone.y2 !== undefined) clone.y2 += offset;
      return clone;
    });

    const newObjs = [...objects, ...pasted];
    const primaryPastedIds = pasted.filter((p) => !p.isStencilLabel).map((p) => p.id);
    setSelectedIds(primaryPastedIds.length > 0 ? primaryPastedIds : pasted.map((p) => p.id));
    recordHistory(newObjs);
    addToast('success', `Pasted ${primaryPastedIds.length || pasted.length} element(s) (+${offset}px offset)`);
  }, [clipboard, pasteOffsetCount, objects, recordHistory, setSelectedIds, addToast]);

  const handleDuplicate = useCallback(() => {
    const selected = objects.filter(
      (o) => selectedIds.includes(o.id) || (o.parentId && selectedIds.includes(o.parentId))
    );
    if (selected.length === 0) return;

    const idMap = new Map<string, string>();
    for (const orig of selected) {
      idMap.set(orig.id, uid());
    }

    const dupes: CADObject[] = selected.map((orig) => {
      const clone: CADObject = JSON.parse(JSON.stringify(orig));
      clone.id = idMap.get(orig.id) || uid();
      if (clone.parentId && idMap.has(clone.parentId)) {
        clone.parentId = idMap.get(clone.parentId);
      }
      clone.x += 20;
      clone.y += 20;
      if (clone.x2 !== undefined) clone.x2 += 20;
      if (clone.y2 !== undefined) clone.y2 += 20;
      return clone;
    });

    const newObjs = [...objects, ...dupes];
    const primaryDupeIds = dupes.filter((d) => !d.isStencilLabel).map((d) => d.id);
    setSelectedIds(primaryDupeIds.length > 0 ? primaryDupeIds : dupes.map((d) => d.id));
    recordHistory(newObjs);
    addToast('success', `Duplicated ${primaryDupeIds.length || dupes.length} element(s)`);
  }, [objects, selectedIds, recordHistory, setSelectedIds, addToast]);

  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const deletedLines = objects.filter((o) => selectedIds.includes(o.id) && o.type === 'line');
    const isOverlappingDeletedLine = (cand: CADObject): boolean => {
      if (cand.type !== 'line' || deletedLines.length === 0) return false;
      const cx1 = cand.x;
      const cy1 = cand.y;
      const cx2 = cand.x2 ?? cand.x + (cand.width || 0);
      const cy2 = cand.y2 ?? cand.y + (cand.height || 0);
      const cMinX = Math.min(cx1, cx2);
      const cMaxX = Math.max(cx1, cx2);
      const cMinY = Math.min(cy1, cy2);
      const cMaxY = Math.max(cy1, cy2);

      return deletedLines.some((dl) => {
        const dx1 = dl.x;
        const dy1 = dl.y;
        const dx2 = dl.x2 ?? dl.x + (dl.width || 0);
        const dy2 = dl.y2 ?? dl.y + (dl.height || 0);
        return (
          Math.abs(Math.min(dx1, dx2) - cMinX) <= 6 &&
          Math.abs(Math.min(dy1, dy2) - cMinY) <= 6 &&
          Math.abs(Math.max(dx1, dx2) - cMaxX) <= 6 &&
          Math.abs(Math.max(dy1, dy2) - cMaxY) <= 6
        );
      });
    };

    const remaining = objects.filter(
      (o) =>
        !selectedIds.includes(o.id) &&
        !(o.parentId && selectedIds.includes(o.parentId)) &&
        !isOverlappingDeletedLine(o)
    );
    setSelectedIds([]);
    recordHistory(remaining);
    addToast('info', `Deleted ${count} element(s)`);
  }, [selectedIds, objects, recordHistory, setSelectedIds, addToast]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(objects.map((o) => o.id));
  }, [objects, setSelectedIds]);

  // Layer Arrangement (Bring to front, send to back, etc.)
  const handleBringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = objects.filter((o) => selectedIds.includes(o.id));
    const unselected = objects.filter((o) => !selectedIds.includes(o.id));
    const reordered = [...unselected, ...selected];
    recordHistory(reordered);
  }, [selectedIds, objects, recordHistory]);

  const handleSendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = objects.filter((o) => selectedIds.includes(o.id));
    const unselected = objects.filter((o) => !selectedIds.includes(o.id));
    const reordered = [...selected, ...unselected];
    recordHistory(reordered);
  }, [selectedIds, objects, recordHistory]);

  const handleMoveForward = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newObjs = [...objects];
    for (let i = newObjs.length - 2; i >= 0; i--) {
      if (selectedIds.includes(newObjs[i].id) && !selectedIds.includes(newObjs[i + 1].id)) {
        const tmp = newObjs[i];
        newObjs[i] = newObjs[i + 1];
        newObjs[i + 1] = tmp;
      }
    }
    recordHistory(newObjs);
  }, [selectedIds, objects, recordHistory]);

  const handleMoveBackward = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newObjs = [...objects];
    for (let i = 1; i < newObjs.length; i++) {
      if (selectedIds.includes(newObjs[i].id) && !selectedIds.includes(newObjs[i - 1].id)) {
        const tmp = newObjs[i];
        newObjs[i] = newObjs[i - 1];
        newObjs[i - 1] = tmp;
      }
    }
    recordHistory(newObjs);
  }, [selectedIds, objects, recordHistory]);

  return {
    clipboard,
    hasClipboard: clipboard.length > 0,
    canUndo: historyRef.current.canUndo(),
    canRedo: historyRef.current.canRedo(),
    setClipboard,
    pasteOffsetCount,
    setPasteOffsetCount,
    recordHistory,
    handleUndo,
    handleRedo,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
    handleDelete,
    handleSelectAll,
    handleBringToFront,
    handleSendToBack,
    handleMoveForward,
    handleMoveBackward,
  };
}
