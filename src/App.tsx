/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  clearSessionLocalStorage,
  saveSessionToLocalStorage,
} from './utils/cad-export';
import { saveSessionToIndexedDB } from './utils/offline-db';
import { TopToolbar } from './components/TopToolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { StencilDrawer } from './components/StencilDrawer';
import { SelectionPropertiesPanel } from './components/SelectionPropertiesPanel';
import { CADAppModals } from './components/CADAppModals';
import { CADCanvasWorkspace } from './components/CADCanvasWorkspace';
import { useCADAppLogic } from './hooks/useCADAppLogic';

export default function App() {
  const app = useCADAppLogic();

  const handleResetSession = () => {
    clearSessionLocalStorage();
    app.setObjects([]);
    app.setSelectedIds([]);
    app.setBgImage(null);
    app.objectsRef.current = [];
    app.historyRef.current.clear([]);
    saveSessionToLocalStorage(app.settings, [], null, app.viewport);
    saveSessionToIndexedDB(app.settings, [], null, app.viewport);
    app.modals.addToast('info', 'Session reset to blank canvas');
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0b1220] text-slate-100 select-none">
      <TopToolbar
        settings={app.settings}
        onUpdateSettings={(partial) => app.setSettings((prev) => ({ ...prev, ...partial }))}
        viewport={app.viewport}
        onUpdateViewport={(partial) => app.setViewport((prev) => ({ ...prev, ...partial }))}
        onFitToScreen={app.handleFitToScreen}
        canUndo={app.history.canUndo}
        canRedo={app.history.canRedo}
        hasSelection={app.selectedIds.length > 0}
        hasClipboard={app.history.hasClipboard}
        onUndo={app.history.handleUndo}
        onRedo={app.history.handleRedo}
        onDelete={app.history.handleDelete}
        onCopy={app.history.handleCopy}
        onCut={app.history.handleCut}
        onPaste={app.history.handlePaste}
        onDuplicate={app.history.handleDuplicate}
        onSelectAll={app.history.handleSelectAll}
        onNewProject={app.toolbarHandlers.handleNewProject}
        onSaveProject={app.toolbarHandlers.handleSaveProject}
        onExportDXF={app.handleExportDXF}
        onLoadProjectFile={app.handleLoadCADFile}
        onLoadBackgroundImage={app.handleLoadBackgroundImage}
        onTriggerPasteImage={app.handleTriggerPasteImage}
        onExportPNG={app.toolbarHandlers.handleExportPNG}
        onPrintA3={app.toolbarHandlers.handlePrintA3}
        onOpenScaleModal={() => app.modals.setIsScaleModalOpen(true)}
        onOpenDiagnostics={() => app.modals.setIsDiagnosticsModalOpen(true)}
        onOpenAutoWallGateModal={() => app.modals.setIsAutoWallGateModalOpen(true)}
        onOpenAbout={() => app.modals.setIsAboutModalOpen(true)}
        is3DMode={app.is3DMode}
        onToggle3D={app.toolbarHandlers.handleToggle3D}
        onOpen3DRoam={app.toolbarHandlers.handleOpen3DRoam}
        onOpenShelterDesigner={() => app.modals.handleOpenShelterDesigner()}
        onOpenRackDesigner={() => app.modals.handleOpenRackDesigner()}
        onOpenCableSchedule={() => app.modals.setIsCableScheduleModalOpen(true)}
        layerCount={app.layers.length}
        activePanelTab={app.activePanelTab}
        onToggleLayersPanel={app.toolbarHandlers.handleToggleLayersPanel}
        activeColor={
          app.selectedIds.length > 0
            ? app.objects.find((o) => app.selectedIds.includes(o.id))?.stroke || app.defaultStyle.stroke
            : app.defaultStyle.stroke
        }
        onUpdateColor={app.toolbarHandlers.handleUpdateColor}
        activeTool={app.activeTool}
        onSelectTool={(t) => {
          app.setActiveTool(t);
          app.handleCancelArmedStencil();
          if (t !== 'select') {
            app.setSelectedIds([]);
          }
        }}
        isStencilDrawerOpen={app.isStencilDrawerOpen}
        onToggleStencilDrawer={() => app.setIsStencilDrawerOpen(!app.isStencilDrawerOpen)}
        hasArmedStencil={!!app.armedStencil}
        armedStencilName={app.armedStencil?.name}
        onCancelArmedStencil={app.handleCancelArmedStencil}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex relative overflow-hidden">
        <LeftSidebar
          activeTool={app.activeTool}
          onSelectTool={(t) => {
            app.setActiveTool(t);
            app.handleCancelArmedStencil();
            if (t !== 'select') {
              app.setSelectedIds([]);
            }
          }}
          isStencilDrawerOpen={app.isStencilDrawerOpen}
          onToggleStencilDrawer={() => app.setIsStencilDrawerOpen(!app.isStencilDrawerOpen)}
          hasArmedStencil={!!app.armedStencil}
          armedStencilName={app.armedStencil?.name}
          onOpenAutoWallGateModal={() => app.modals.setIsAutoWallGateModalOpen(true)}
          onOpenShelterDesigner={() => app.modals.handleOpenShelterDesigner()}
          onOpenRackDesigner={() => app.modals.handleOpenRackDesigner()}
          onOpenCableSchedule={() => app.modals.setIsCableScheduleModalOpen(true)}
          onOpenAbout={() => app.modals.setIsAboutModalOpen(true)}
        />

        <StencilDrawer
          isOpen={app.isStencilDrawerOpen}
          onClose={() => app.setIsStencilDrawerOpen(false)}
          onArmStencil={app.handleArmStencil}
          onPlaceAtCenter={app.handlePlaceStencilAtCenter}
          armedStencilId={app.armedStencil?.id}
          onOpenAutoWallGateModal={() => app.modals.setIsAutoWallGateModalOpen(true)}
          onOpenShelterDesigner={() => app.modals.handleOpenShelterDesigner()}
        />

        <CADCanvasWorkspace
          containerRef={app.containerRef}
          canvasRef={app.canvasRef}
          onCanvasDragOver={app.handleCanvasDragOver}
          onCanvasDrop={app.handleCanvasDrop}
          onCanvasMouseDown={app.handleCanvasMouseDown}
          onCanvasMouseMove={app.handleCanvasMouseMove}
          onCanvasMouseUp={app.handleCanvasMouseUp}
          onCanvasDoubleClick={app.handleCanvasDoubleClick}
          onCancelAction={app.handleCancelAction}
          cursorPos={app.cursorPos}
          snapInfo={app.snapInfo}
          settings={app.settings}
          setSettings={app.setSettings}
          viewport={app.viewport}
          onFitToScreen={app.handleFitToScreen}
          objects={app.objects}
          setObjects={app.setObjects}
          objectsRef={app.objectsRef}
          selectedIds={app.selectedIds}
          setSelectedIds={app.setSelectedIds}
          clipboard={app.history.clipboard}
          storageKB={app.storageKB}
          armedStencil={app.armedStencil}
          armedRotation={app.armedRotation}
          setArmedRotation={app.setArmedRotation}
          onCancelArmedStencil={app.handleCancelArmedStencil}
          activeTool={app.activeTool}
          interactionRef={app.interactionRef}
          finalizePolyline={app.finalizePolyline}
          onToggleObjectLabels={app.handleToggleObjectLabels}
          onToggleDoors={app.handleInteractWithDoor2D}
          areDoorsOpen={app.areDoorsOpen}
          onToggle3D={() => app.setIs3DMode((prev) => !prev)}
          is3DMode={app.is3DMode}
          hoveredTextLabel={app.hoveredTextLabel}
          inlineEditor={app.inlineEditor}
          setInlineEditor={app.setInlineEditor}
          onRotateSelected={app.handleRotateSelected}
          onFlipSelected={app.handleFlipSelected}
          onScaleSelected={app.handleScaleSelected}
          onAutoAddDimensions={app.handleAutoAddDimensions}
          onDelete={app.history.handleDelete}
          addToast={app.modals.addToast}
          recordHistory={app.history.recordHistory}
          persistSessionImmediately={app.persistSessionImmediately}
          settingsRef={app.settingsRef}
          onUpdateColor={app.toolbarHandlers.handleUpdateColor}
          onOpenCableSchedule={() => app.modals.setIsCableScheduleModalOpen(true)}
          onOpenRackDesigner={(target) => app.modals.handleOpenRackDesigner(target)}
        />

        <SelectionPropertiesPanel
          selectedObjects={app.objects.filter((o) => app.selectedIds.includes(o.id))}
          onUpdateSelected={app.handleUpdateSelected}
          onBringToFront={app.history.handleBringToFront}
          onSendToBack={app.history.handleSendToBack}
          onMoveForward={app.history.handleMoveForward}
          onMoveBackward={app.history.handleMoveBackward}
          onCopy={app.history.handleCopy}
          onDuplicate={app.history.handleDuplicate}
          onDelete={app.history.handleDelete}
          onAddDimensions={app.handleAutoAddDimensions}
          onRotateSelected={app.handleRotateSelected}
          onScaleSelected={app.handleScaleSelected}
          onFlipSelected={app.handleFlipSelected}
          bgImage={app.bgImage}
          onUpdateBgImage={(partial) => {
            if (partial === null) app.setBgImage(null);
            else app.setBgImage((prev) => (prev ? { ...prev, ...partial } : null));
          }}
          settings={app.settings}
          onUpdateSettings={(partial) => app.setSettings((prev) => ({ ...prev, ...partial }))}
          defaultStyle={app.defaultStyle}
          onUpdateDefaultStyle={(partial) => app.setDefaultStyle((prev) => ({ ...prev, ...partial }))}
          layers={app.layers}
          activeLayerId={app.activeLayerId}
          onSetActiveLayer={app.setActiveLayerId}
          onToggleLayerVisibility={app.handleToggleLayerVisibility}
          onToggleLayerLock={app.handleToggleLayerLock}
          onUpdateLayer={app.handleUpdateLayer}
          onMoveLayerUp={app.handleMoveLayerUp}
          onMoveLayerDown={app.handleMoveLayerDown}
          onAddLayer={app.handleAddLayer}
          onDeleteLayer={app.handleDeleteLayer}
          onToggleAllVisibility={app.handleToggleAllVisibility}
          allVisible={app.allLayersVisible}
          onMoveSelectedToLayer={app.handleMoveSelectedToLayer}
          objectCounts={app.objectCounts}
          activePanelTab={app.activePanelTab}
          onSetActivePanelTab={app.setActivePanelTab}
          allObjects={app.objects}
          onAddToast={app.modals.addToast}
          onMergeExcavatedAreas={app.mergeExcavatedAreas}
          onOpenShelterDesigner={(shelter) => app.modals.handleOpenShelterDesigner(shelter)}
          onOpenRackDesigner={(target) => app.modals.handleOpenRackDesigner(target)}
          onOpenCableSchedule={() => app.modals.setIsCableScheduleModalOpen(true)}
          onSaveAllObjects={(updated) => {
            app.objectsRef.current = updated;
            app.setObjects(updated);
            app.history.recordHistory(updated);
            saveSessionToLocalStorage(app.settings, updated, app.bgImage, app.viewport);
            saveSessionToIndexedDB(app.settings, updated, app.bgImage, app.viewport).catch(() => {});
          }}
        />
      </div>

      <CADAppModals
        isScaleModalOpen={app.modals.isScaleModalOpen}
        setIsScaleModalOpen={app.modals.setIsScaleModalOpen}
        settings={app.settings}
        setSettings={app.setSettings}
        isAutoWallGateModalOpen={app.modals.isAutoWallGateModalOpen}
        setIsAutoWallGateModalOpen={app.modals.setIsAutoWallGateModalOpen}
        containerRef={app.containerRef}
        isDiagnosticsModalOpen={app.modals.isDiagnosticsModalOpen}
        setIsDiagnosticsModalOpen={app.modals.setIsDiagnosticsModalOpen}
        storageKB={app.storageKB}
        onResetSession={handleResetSession}
        isAboutModalOpen={app.modals.isAboutModalOpen}
        setIsAboutModalOpen={app.modals.setIsAboutModalOpen}
        isShelterDesignerOpen={app.modals.isShelterDesignerOpen}
        setIsShelterDesignerOpen={app.modals.setIsShelterDesignerOpen}
        activeShelterForDesign={app.modals.activeShelterForDesign}
        handleUpdateShelterFromDesigner={app.modals.handleUpdateShelterFromDesigner}
        isRackDesignerOpen={app.modals.isRackDesignerOpen}
        setIsRackDesignerOpen={app.modals.setIsRackDesignerOpen}
        activeRackForDesign={app.modals.activeRackForDesign}
        handleUpdateRackFromDesigner={app.modals.handleUpdateRackFromDesigner}
        isCableScheduleModalOpen={app.modals.isCableScheduleModalOpen}
        setIsCableScheduleModalOpen={app.modals.setIsCableScheduleModalOpen}
        is3DMode={app.is3DMode}
        setIs3DMode={app.setIs3DMode}
        startInRoamMode={app.startInRoamMode}
        setStartInRoamMode={app.setStartInRoamMode}
        layers={app.layers}
        setLayers={app.setLayers}
        areDoorsOpen={app.areDoorsOpen}
        handleToggleDoors={app.handleToggleDoors}
        handleToggleSingleDoor={app.handleToggleSingleDoor}
        objects={app.objects}
        setObjects={app.setObjects}
        objectsRef={app.objectsRef}
        recordHistory={app.history.recordHistory}
        saveSessionToLocalStorage={saveSessionToLocalStorage}
        saveSessionToIndexedDB={saveSessionToIndexedDB}
        setSelectedIds={app.setSelectedIds}
        viewport={app.viewport}
        setViewport={app.setViewport}
        bgImage={app.bgImage}
        toasts={app.modals.toasts}
        setToasts={app.modals.setToasts}
        addToast={(msg, type) => app.modals.addToast(type || 'info', msg)}
      />
    </div>
  );
}
