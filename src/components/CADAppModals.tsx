/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BackgroundImageConfig,
  CADLayer,
  CADObject,
  ProjectSettings,
  ToastMessage,
  ViewportState,
} from '../types/cad';
import { ScaleSettingsModal } from './ScaleSettingsModal';
import { AutoWallGateModal } from './AutoWallGateModal';
import { DiagnosticsModal } from './DiagnosticsModal';
import { AboutModal } from './AboutModal';
import { ShelterDesigner } from './ShelterDesigner';
import { OpenBayRackDesigner } from './OpenBayRackDesigner';
import { CableScheduleModal } from './CableScheduleModal';
import { CAD3DViewer } from './CAD3DViewer';
import { OfflineIndicator } from './OfflineIndicator';
import { ToastContainer } from './ToastContainer';

export interface CADAppModalsProps {
  isScaleModalOpen: boolean;
  setIsScaleModalOpen: (open: boolean) => void;
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;

  isAutoWallGateModalOpen: boolean;
  setIsAutoWallGateModalOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;

  isDiagnosticsModalOpen: boolean;
  setIsDiagnosticsModalOpen: (open: boolean) => void;
  storageKB: number;
  onResetSession: () => void;

  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;

  isShelterDesignerOpen: boolean;
  setIsShelterDesignerOpen: (open: boolean) => void;
  activeShelterForDesign: CADObject | null;
  handleUpdateShelterFromDesigner: (updatedShelter: CADObject) => void;

  isRackDesignerOpen?: boolean;
  setIsRackDesignerOpen?: (open: boolean) => void;
  activeRackForDesign?: CADObject | null;
  handleUpdateRackFromDesigner?: (updatedRack: CADObject) => void;

  isCableScheduleModalOpen: boolean;
  setIsCableScheduleModalOpen: (open: boolean) => void;

  is3DMode: boolean;
  setIs3DMode: React.Dispatch<React.SetStateAction<boolean>>;
  startInRoamMode: boolean;
  setStartInRoamMode: (roam: boolean) => void;
  layers?: CADLayer[];
  setLayers?: React.Dispatch<React.SetStateAction<CADLayer[]>>;
  areDoorsOpen: boolean;
  handleToggleDoors: () => void;
  handleToggleSingleDoor: (doorId: string) => void;

  objects: CADObject[];
  setObjects: React.Dispatch<React.SetStateAction<CADObject[]>>;
  objectsRef: React.MutableRefObject<CADObject[]>;
  recordHistory: (nextObjs: CADObject[]) => void;
  saveSessionToLocalStorage: (
    settings: ProjectSettings,
    objects: CADObject[],
    bgImage: BackgroundImageConfig | null,
    viewport: ViewportState
  ) => void;
  saveSessionToIndexedDB: (
    settings: ProjectSettings,
    objects: CADObject[],
    bgImage: BackgroundImageConfig | null,
    viewport: ViewportState
  ) => Promise<void>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  bgImage: BackgroundImageConfig | null;

  toasts: ToastMessage[];
  setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
  addToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const CADAppModals: React.FC<CADAppModalsProps> = ({
  isScaleModalOpen,
  setIsScaleModalOpen,
  settings,
  setSettings,
  isAutoWallGateModalOpen,
  setIsAutoWallGateModalOpen,
  containerRef,
  isDiagnosticsModalOpen,
  setIsDiagnosticsModalOpen,
  storageKB,
  onResetSession,
  isAboutModalOpen,
  setIsAboutModalOpen,
  isShelterDesignerOpen,
  setIsShelterDesignerOpen,
  activeShelterForDesign,
  handleUpdateShelterFromDesigner,
  isRackDesignerOpen,
  setIsRackDesignerOpen,
  activeRackForDesign,
  handleUpdateRackFromDesigner,
  isCableScheduleModalOpen,
  setIsCableScheduleModalOpen,
  is3DMode,
  setIs3DMode,
  startInRoamMode,
  setStartInRoamMode,
  layers,
  setLayers,
  areDoorsOpen,
  handleToggleDoors,
  handleToggleSingleDoor,
  objects,
  setObjects,
  objectsRef,
  recordHistory,
  saveSessionToLocalStorage,
  saveSessionToIndexedDB,
  setSelectedIds,
  viewport,
  setViewport,
  bgImage,
  toasts,
  setToasts,
  addToast,
}) => {
  return (
    <>
      {/* Scale & Units Modal */}
      <ScaleSettingsModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        settings={settings}
        onSave={(updated) => {
          setSettings((prev) => ({ ...prev, ...updated }));
          addToast('Scale and unit configuration updated', 'success');
        }}
      />

      {/* Automated Site Perimeter Wall & Gate Generator Modal */}
      <AutoWallGateModal
        isOpen={isAutoWallGateModalOpen}
        onClose={() => setIsAutoWallGateModalOpen(false)}
        settings={settings}
        canvasWidth={containerRef.current?.clientWidth || settings.canvasWidth}
        canvasHeight={containerRef.current?.clientHeight || settings.canvasHeight}
        onGenerate={(newPerimeterObjs, toastMsg) => {
          const combined = [...objects, ...newPerimeterObjs];
          recordHistory(combined);
          setSelectedIds(newPerimeterObjs.map((o) => o.id));
          addToast(toastMsg, 'success');
        }}
      />

      {/* Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setIsDiagnosticsModalOpen(false)}
        settings={settings}
        objects={objects}
        viewport={viewport}
        storageKB={storageKB}
        onResetSession={onResetSession}
      />

      {/* About & Developer Details Modal */}
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />

      {/* Shelter Interior Designer Studio Modal / Page */}
      <ShelterDesigner
        isOpen={isShelterDesignerOpen}
        onClose={() => setIsShelterDesignerOpen(false)}
        currentShelter={activeShelterForDesign}
        allObjects={objects}
        onUpdateShelter={handleUpdateShelterFromDesigner}
        onSaveAllObjects={(updated) => {
          objectsRef.current = updated;
          setObjects(updated);
          recordHistory(updated);
          saveSessionToLocalStorage(settings, updated, bgImage, viewport);
          saveSessionToIndexedDB(settings, updated, bgImage, viewport).catch(() => {});
        }}
        onAddToast={(t, msg) => addToast(msg, t as any)}
      />

      {/* Telecom Outdoor Cabinet & Open Bay Rack Equipment Designer */}
      <OpenBayRackDesigner
        isOpen={!!isRackDesignerOpen}
        onClose={() => setIsRackDesignerOpen?.(false)}
        currentRack={activeRackForDesign || null}
        allObjects={objects}
        viewport={viewport}
        onUpdateRack={(updated) => {
          handleUpdateRackFromDesigner?.(updated);
          setSelectedIds([updated.id]);
          if (setLayers) {
            setLayers((prev) =>
              prev.map((l) => (l.id === 'layer-cabinets' && !l.visible ? { ...l, visible: true } : l))
            );
          }
        }}
        onAddNewRack={(newRack) => {
          const next = [...objectsRef.current.filter((o) => o.id !== newRack.id), newRack];
          objectsRef.current = next;
          setObjects(next);
          recordHistory(next);
          setSelectedIds([newRack.id]);
          if (setLayers) {
            setLayers((prev) =>
              prev.map((l) => (l.id === 'layer-cabinets' && !l.visible ? { ...l, visible: true } : l))
            );
          }
          saveSessionToLocalStorage(settings, next, bgImage, viewport);
          saveSessionToIndexedDB(settings, next, bgImage, viewport).catch(() => {});
        }}
        onSaveAllObjects={(updated) => {
          objectsRef.current = updated;
          setObjects(updated);
          recordHistory(updated);
          saveSessionToLocalStorage(settings, updated, bgImage, viewport);
          saveSessionToIndexedDB(settings, updated, bgImage, viewport).catch(() => {});
        }}
        onAddToast={(t, msg) => addToast(msg, t as any)}
        onSelectRackId={(id) => setSelectedIds([id])}
      />

      {/* Cable Schedule & Lengths Calculator Modal */}
      <CableScheduleModal
        isOpen={isCableScheduleModalOpen}
        onClose={() => setIsCableScheduleModalOpen(false)}
        objects={objects}
        settings={settings}
        viewport={viewport}
        setViewport={setViewport as any}
        setSelectedIds={setSelectedIds}
        addToast={(type, msg, title) => addToast(msg, type)}
      />

      {/* 3D Photorealistic Studio Viewport Modal */}
      {is3DMode && (
        <CAD3DViewer
          objects={objects}
          settings={settings}
          layers={layers}
          initialRoamMode={startInRoamMode}
          onToggleDoors={handleToggleDoors}
          onToggleSingleDoor={handleToggleSingleDoor}
          areDoorsOpen={areDoorsOpen}
          onUpdateObjects={(nextObjs, toastMsg) => {
            recordHistory(nextObjs);
            if (toastMsg) addToast(toastMsg, 'info');
          }}
          onClose={() => {
            setIs3DMode(false);
            setStartInRoamMode(false);
          }}
        />
      )}

      {/* Offline Status & Mode Indicator */}
      <OfflineIndicator />

      {/* Global Notifications Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </>
  );
};
