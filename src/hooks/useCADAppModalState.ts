/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { CADObject, ProjectSettings, ToastMessage, ViewportState } from '../types/cad';
import { uid } from '../utils/cad-defaults';
import { saveSessionToLocalStorage } from '../utils/cad-export';
import { saveSessionToIndexedDB } from '../utils/offline-db';

export interface UseCADAppModalStateParams {
  objectsRef: React.MutableRefObject<CADObject[]>;
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  settings: ProjectSettings;
  bgImage: any;
  viewport: ViewportState;
  recordHistory: (objs: CADObject[]) => void;
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useCADAppModalState(params: UseCADAppModalStateParams) {
  const { objectsRef, setObjects, settings, bgImage, viewport, recordHistory, setSelectedIds } = params;

  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);
  const [isAutoWallGateModalOpen, setIsAutoWallGateModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isShelterDesignerOpen, setIsShelterDesignerOpen] = useState(false);
  const [activeShelterForDesign, setActiveShelterForDesign] = useState<CADObject | null>(null);
  const [isCableScheduleModalOpen, setIsCableScheduleModalOpen] = useState(false);
  const [isRackDesignerOpen, setIsRackDesignerOpen] = useState(false);
  const [activeRackForDesign, setActiveRackForDesign] = useState<CADObject | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dimensionsArmed, setDimensionsArmed] = useState<boolean>(false);

  const addToast = useCallback(
    (type: ToastMessage['type'], message: string, title?: string) => {
      const id = uid();
      setToasts((prev) => [...prev, { id, type, message, title, timestamp: Date.now() }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const handleOpenShelterDesigner = useCallback(
    (shelterObj?: CADObject) => {
      if (shelterObj) {
        setActiveShelterForDesign(shelterObj);
      } else {
        const target = objectsRef.current.find(
          (o) =>
            o.stencilId === 'shelter' ||
            o.stencilId === 'cement-shelter' ||
            o.customProps?.stencilType === 'shelter' ||
            o.customProps?.stencilType === 'cement-shelter' ||
            (o.text && o.text.toLowerCase().includes('shelter'))
        );
        if (target) {
          setActiveShelterForDesign(target);
        } else {
          setActiveShelterForDesign(null);
        }
      }
      setIsShelterDesignerOpen(true);
    },
    [objectsRef]
  );

  const handleUpdateShelterFromDesigner = useCallback(
    (updatedShelter: CADObject) => {
      const exists = objectsRef.current.some((obj) => obj.id === updatedShelter.id);
      const nextObjects = exists
        ? objectsRef.current.map((obj) => (obj.id === updatedShelter.id ? updatedShelter : obj))
        : [...objectsRef.current, updatedShelter];
      objectsRef.current = nextObjects;
      setObjects(nextObjects);
      recordHistory(nextObjects);
      saveSessionToLocalStorage(settings, nextObjects, bgImage, viewport);
      saveSessionToIndexedDB(settings, nextObjects, bgImage, viewport).catch(() => {});
    },
    [objectsRef, setObjects, settings, bgImage, viewport, recordHistory]
  );

  const handleOpenRackDesigner = useCallback(
    (targetObj?: CADObject) => {
      // If a specific rack/cabinet was provided (e.g. from context toolbar or properties panel), edit it.
      // If none was provided (e.g. from toolbar/sidebar button), open in "New Rack" mode so applying creates a new rack on the layout.
      setActiveRackForDesign(targetObj || null);
      setIsRackDesignerOpen(true);
    },
    []
  );

  const handleUpdateRackFromDesigner = useCallback(
    (updatedRack: CADObject) => {
      const exists = objectsRef.current.some((obj) => obj.id === updatedRack.id);
      const nextObjects = exists
        ? objectsRef.current.map((obj) => (obj.id === updatedRack.id ? updatedRack : obj))
        : [...objectsRef.current, updatedRack];
      objectsRef.current = nextObjects;
      setObjects(nextObjects);
      recordHistory(nextObjects);
      setSelectedIds?.([updatedRack.id]);
      saveSessionToLocalStorage(settings, nextObjects, bgImage, viewport);
      saveSessionToIndexedDB(settings, nextObjects, bgImage, viewport).catch(() => {});
    },
    [objectsRef, setObjects, settings, bgImage, viewport, recordHistory, setSelectedIds]
  );

  return {
    isScaleModalOpen,
    setIsScaleModalOpen,
    isDiagnosticsModalOpen,
    setIsDiagnosticsModalOpen,
    isAutoWallGateModalOpen,
    setIsAutoWallGateModalOpen,
    isAboutModalOpen,
    setIsAboutModalOpen,
    isShelterDesignerOpen,
    setIsShelterDesignerOpen,
    activeShelterForDesign,
    setActiveShelterForDesign,
    isRackDesignerOpen,
    setIsRackDesignerOpen,
    activeRackForDesign,
    setActiveRackForDesign,
    isCableScheduleModalOpen,
    setIsCableScheduleModalOpen,
    toasts,
    setToasts,
    dimensionsArmed,
    setDimensionsArmed,
    addToast,
    handleOpenShelterDesigner,
    handleUpdateShelterFromDesigner,
    handleOpenRackDesigner,
    handleUpdateRackFromDesigner,
  };
}
