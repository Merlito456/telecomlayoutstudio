/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CADObject,
  ProjectSettings,
  ViewportState,
  BackgroundImageConfig,
} from '../types/cad';
import { HistoryManager } from '../utils/history';
import {
  loadSessionFromLocalStorage,
  saveSessionToLocalStorage,
  isFirstAppLaunch,
  markAppInitialized,
} from '../utils/cad-export';
import { saveSessionToIndexedDB, loadSessionFromIndexedDB } from '../utils/offline-db';
import { DEFAULT_SETTINGS, generateDefaultSeedObjects, sanitizeStencilObjects } from '../utils/cad-defaults';

export function useCADSessionState() {
  const [objects, setObjects] = useState<CADObject[]>(() => {
    const saved = loadSessionFromLocalStorage();
    if (saved && Array.isArray(saved.objects) && saved.objects.length > 0) {
      return sanitizeStencilObjects(saved.objects);
    }
    if (isFirstAppLaunch()) {
      const seeded = generateDefaultSeedObjects();
      saveSessionToLocalStorage(DEFAULT_SETTINGS, seeded, null, { zoom: 0.85, panX: 40, panY: 40 });
      saveSessionToIndexedDB(DEFAULT_SETTINGS, seeded, null, { zoom: 0.85, panX: 40, panY: 40 });
      markAppInitialized();
      return seeded;
    }
    return saved?.objects ? sanitizeStencilObjects(saved.objects) : [];
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [bgImage, setBgImage] = useState<BackgroundImageConfig | null>(() => {
    const saved = loadSessionFromLocalStorage();
    return saved?.bgImage || null;
  });

  const [settings, setSettings] = useState<ProjectSettings>(() => {
    const saved = loadSessionFromLocalStorage();
    return saved?.settings ? { ...DEFAULT_SETTINGS, ...saved.settings, renderStyle: 'photo' } : DEFAULT_SETTINGS;
  });

  const [viewport, setViewport] = useState<ViewportState>(() => {
    const saved = loadSessionFromLocalStorage();
    return saved?.viewport || {
      zoom: 0.85,
      panX: 40,
      panY: 40,
    };
  });

  const [storageKB, setStorageKB] = useState(0);

  const objectsRef = useRef<CADObject[]>(objects);
  const settingsRef = useRef<ProjectSettings>(settings);
  const viewportRef = useRef<ViewportState>(viewport);
  const bgImageRef = useRef<BackgroundImageConfig | null>(bgImage);
  const historyRef = useRef<HistoryManager>(new HistoryManager(objects));

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);
  useEffect(() => {
    bgImageRef.current = bgImage;
  }, [bgImage]);

  const persistSessionImmediately = useCallback(
    (objs: CADObject[], currentSettings?: ProjectSettings, currentBg?: BackgroundImageConfig | null, currentVp?: ViewportState) => {
      const s = currentSettings || settingsRef.current;
      const b = currentBg !== undefined ? currentBg : bgImageRef.current;
      const v = currentVp || viewportRef.current;
      const kb = saveSessionToLocalStorage(s, objs, b, v);
      setStorageKB(kb);
      saveSessionToIndexedDB(s, objs, b, v);
    },
    []
  );

  useEffect(() => {
    loadSessionFromIndexedDB().then((idb) => {
      if (idb && Array.isArray(idb.objects) && idb.objects.length > 0) {
        const cleaned = sanitizeStencilObjects(idb.objects);
        setObjects((current) => {
          if (current.length === 0) {
            objectsRef.current = cleaned;
            historyRef.current = new HistoryManager(cleaned);
            if (idb.settings) setSettings((prev) => ({ ...prev, ...idb.settings }));
            if (idb.bgImage) setBgImage(idb.bgImage);
            if (idb.viewport) setViewport(idb.viewport);
            saveSessionToLocalStorage(idb.settings || settingsRef.current, cleaned, idb.bgImage, idb.viewport || viewportRef.current);
            return cleaned;
          }
          return current;
        });
      }
    });
  }, []);

  useEffect(() => {
    const handleFlushSave = () => {
      if (objectsRef.current) {
        saveSessionToLocalStorage(settingsRef.current, objectsRef.current, bgImageRef.current, viewportRef.current);
        saveSessionToIndexedDB(settingsRef.current, objectsRef.current, bgImageRef.current, viewportRef.current);
      }
    };
    window.addEventListener('beforeunload', handleFlushSave);
    window.addEventListener('pagehide', handleFlushSave);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleFlushSave();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleFlushSave);
      window.removeEventListener('pagehide', handleFlushSave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const hasRepairedCablingRef = useRef(false);
  useEffect(() => {
    if (hasRepairedCablingRef.current || objects.length === 0) return;
    hasRepairedCablingRef.current = true;
    const cleanedFinal = sanitizeStencilObjects(objects);
    const hasChanged =
      cleanedFinal.length !== objects.length ||
      cleanedFinal.some((o, i) => o !== objects[i]);
    if (hasChanged) {
      objectsRef.current = cleanedFinal;
      setObjects(cleanedFinal);
      saveSessionToLocalStorage(settingsRef.current, cleanedFinal, bgImageRef.current, viewportRef.current);
      saveSessionToIndexedDB(settingsRef.current, cleanedFinal, bgImageRef.current, viewportRef.current);
    }
  }, [objects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const kb = saveSessionToLocalStorage(settings, objects, bgImage, viewport);
      saveSessionToIndexedDB(settings, objects, bgImage, viewport);
      setStorageKB(kb);
    }, 400);
    return () => clearTimeout(timer);
  }, [objects, settings, bgImage, viewport]);

  return {
    objects,
    setObjects,
    objectsRef,
    selectedIds,
    setSelectedIds,
    bgImage,
    setBgImage,
    bgImageRef,
    settings,
    setSettings,
    settingsRef,
    viewport,
    setViewport,
    viewportRef,
    storageKB,
    historyRef,
    persistSessionImmediately,
  };
}
