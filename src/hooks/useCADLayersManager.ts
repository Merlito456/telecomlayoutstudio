/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { CADLayer, CADObject, ProjectSettings, ToastMessage } from '../types/cad';
import { DEFAULT_LAYERS, getObjectLayerId } from '../utils/cad-layers';
import { loadSessionFromLocalStorage } from '../utils/cad-export';

export interface UseCADLayersManagerProps {
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  selectedIds: string[];
  recordHistory: (newObjects: CADObject[]) => void;
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

export function useCADLayersManager({
  settings: _settings,
  setSettings,
  objects,
  setObjects,
  objectsRef,
  selectedIds,
  recordHistory,
  addToast,
}: UseCADLayersManagerProps) {
  // Photoshop-Style Layering System
  const [layers, setLayers] = useState<CADLayer[]>(() => {
    const saved = loadSessionFromLocalStorage();
    if (saved?.settings?.layers && saved.settings.layers.length > 0) {
      return saved.settings.layers;
    }
    return DEFAULT_LAYERS;
  });

  const [activeLayerId, setActiveLayerId] = useState<string>('layer-civil');
  const [allLayersVisible, setAllLayersVisible] = useState<boolean>(true);

  const handleToggleLayerVisibility = useCallback(
    (layerId: string) => {
      setLayers((prev) => {
        const next = prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l));
        setSettings((s) => ({ ...s, layers: next }));
        const target = next.find((l) => l.id === layerId);
        addToast('info', `${target?.name || 'Layer'} visibility: ${target?.visible ? 'ON' : 'OFF'}`);
        return next;
      });
    },
    [setSettings, addToast]
  );

  const handleToggleLayerLock = useCallback(
    (layerId: string) => {
      setLayers((prev) => {
        const next = prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l));
        setSettings((s) => ({ ...s, layers: next }));
        const target = next.find((l) => l.id === layerId);
        addToast('info', `${target?.name || 'Layer'} lock: ${target?.locked ? 'LOCKED' : 'UNLOCKED'}`);
        return next;
      });
    },
    [setSettings, addToast]
  );

  const handleUpdateLayer = useCallback(
    (layerId: string, updates: Partial<CADLayer>) => {
      setLayers((prev) => {
        const next = prev.map((l) => (l.id === layerId ? { ...l, ...updates } : l));
        setSettings((s) => ({ ...s, layers: next }));
        return next;
      });
    },
    [setSettings]
  );

  const handleMoveLayerUp = useCallback(
    (layerId: string) => {
      setLayers((prev) => {
        const idx = prev.findIndex((l) => l.id === layerId);
        if (idx <= 0) return prev;
        const next = [...prev];
        const tmp = next[idx];
        next[idx] = next[idx - 1];
        next[idx - 1] = tmp;
        setSettings((s) => ({ ...s, layers: next }));
        addToast('info', `Moved "${tmp.name}" up in layer stack`);
        return next;
      });
    },
    [setSettings, addToast]
  );

  const handleMoveLayerDown = useCallback(
    (layerId: string) => {
      setLayers((prev) => {
        const idx = prev.findIndex((l) => l.id === layerId);
        if (idx < 0 || idx >= prev.length - 1) return prev;
        const next = [...prev];
        const tmp = next[idx];
        next[idx] = next[idx + 1];
        next[idx + 1] = tmp;
        setSettings((s) => ({ ...s, layers: next }));
        addToast('info', `Moved "${tmp.name}" down in layer stack`);
        return next;
      });
    },
    [setSettings, addToast]
  );

  const handleAddLayer = useCallback(() => {
    const newId = 'layer_' + Math.random().toString(36).substring(2, 7);
    const colors = ['#38bdf8', '#f43f5e', '#818cf8', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'];
    const newLayer: CADLayer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      color: colors[layers.length % colors.length],
    };
    setLayers((prev) => {
      const next = [newLayer, ...prev];
      setSettings((s) => ({ ...s, layers: next }));
      setActiveLayerId(newId);
      addToast('success', `Created layer: ${newLayer.name}`);
      return next;
    });
  }, [layers.length, setSettings, addToast]);

  const handleDeleteLayer = useCallback(
    (layerId: string) => {
      if (layers.length <= 1) {
        addToast('warning', 'Cannot delete the only layer');
        return;
      }
      const layerToDelete = layers.find((l) => l.id === layerId);
      setLayers((prev) => {
        const next = prev.filter((l) => l.id !== layerId);
        setSettings((s) => ({ ...s, layers: next }));
        if (activeLayerId === layerId) {
          setActiveLayerId(next[0].id);
        }
        addToast('info', `Deleted layer: ${layerToDelete?.name}`);
        return next;
      });
    },
    [layers, activeLayerId, setSettings, addToast]
  );

  const handleToggleAllVisibility = useCallback(() => {
    setAllLayersVisible((prev) => {
      const nextVal = !prev;
      setLayers((cur) => {
        const next = cur.map((l) => ({ ...l, visible: nextVal }));
        setSettings((s) => ({ ...s, layers: next }));
        return next;
      });
      addToast('info', nextVal ? 'All layers visible' : 'All layers hidden');
      return nextVal;
    });
  }, [setSettings, addToast]);

  const handleMoveSelectedToLayer = useCallback(
    (layerId: string) => {
      if (selectedIds.length === 0) return;
      const targetLayer = layers.find((l) => l.id === layerId);
      const updated = objects.map((obj) => {
        if (selectedIds.includes(obj.id)) {
          return { ...obj, layerId };
        }
        return obj;
      });
      setObjects(updated);
      objectsRef.current = updated;
      recordHistory(updated);
      addToast('success', `Moved ${selectedIds.length} object(s) to "${targetLayer?.name || 'layer'}"`);
    },
    [selectedIds, layers, objects, objectsRef, setObjects, recordHistory, addToast]
  );

  const objectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const obj of objects) {
      if (obj.isStencilLabel) continue;
      const lid = getObjectLayerId(obj, activeLayerId);
      counts[lid] = (counts[lid] || 0) + 1;
    }
    return counts;
  }, [objects, activeLayerId]);

  return {
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    allLayersVisible,
    setAllLayersVisible,
    handleToggleLayerVisibility,
    handleToggleLayerLock,
    handleUpdateLayer,
    handleMoveLayerUp,
    handleMoveLayerDown,
    handleAddLayer,
    handleDeleteLayer,
    handleToggleAllVisibility,
    handleMoveSelectedToLayer,
    objectCounts,
  };
}
