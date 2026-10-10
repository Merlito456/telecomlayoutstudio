/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject } from '../types/cad';

export interface HistoryState {
  objects: CADObject[];
}

export class HistoryManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private readonly maxSteps: number = 80;
  private readonly maxBytes: number = 4 * 1024 * 1024; // 4 MB

  constructor(initialObjects: CADObject[] = []) {
    this.recordState(initialObjects, true);
  }

  public recordState(objects: CADObject[], isInitial = false) {
    const serialized = JSON.stringify(objects);

    if (!isInitial && this.undoStack.length > 0) {
      if (this.undoStack[this.undoStack.length - 1] === serialized) {
        return; // No change
      }
    }

    this.undoStack.push(serialized);
    if (!isInitial) {
      this.redoStack = []; // Clear redo branch
    }

    // Maintain step cap
    if (this.undoStack.length > this.maxSteps) {
      this.undoStack.shift();
    }

    // Enforce 4 MB byte cap
    while (this.calculateByteSize() > this.maxBytes && this.undoStack.length > 1) {
      this.undoStack.shift();
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(): CADObject[] | null {
    if (!this.canUndo()) return null;
    const current = this.undoStack.pop();
    if (current) {
      this.redoStack.push(current);
    }
    const previous = this.undoStack[this.undoStack.length - 1];
    return JSON.parse(previous) as CADObject[];
  }

  public redo(): CADObject[] | null {
    if (!this.canRedo()) return null;
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(next);
    return JSON.parse(next) as CADObject[];
  }

  public clear(initialObjects: CADObject[] = []) {
    this.undoStack = [];
    this.redoStack = [];
    this.recordState(initialObjects, true);
  }

  private calculateByteSize(): number {
    let bytes = 0;
    for (const item of this.undoStack) bytes += item.length * 2;
    for (const item of this.redoStack) bytes += item.length * 2;
    return bytes;
  }
}
