/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADObject, ProjectSettings, ViewportState, BackgroundImageConfig } from '../types/cad';
import { ProjectData } from './cad-export';

const DB_NAME = 'TelecomSiteLayoutStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'projectSession';
const SESSION_KEY = 'current_project';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persist full project state to IndexedDB for high-capacity offline reliability
 */
export async function saveSessionToIndexedDB(
  settings: ProjectSettings,
  objects: CADObject[],
  bgImage: BackgroundImageConfig | null,
  viewport: ViewportState
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const data: ProjectData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      settings,
      objects,
      bgImage,
      viewport,
    };
    store.put(data, SESSION_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage:', err);
  }
}

/**
 * Load project state from IndexedDB
 */
export async function loadSessionFromIndexedDB(): Promise<ProjectData | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(SESSION_KEY);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result as ProjectData | undefined;
        if (result && Array.isArray(result.objects)) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}
