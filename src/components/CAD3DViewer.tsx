/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CAD3DToolbar } from './cad-3d/components/CAD3DToolbar';
import { CAD3DRoamHUD } from './cad-3d/components/CAD3DRoamHUD';
import { CAD3DCableToolPanel } from './cad-3d/components/CAD3DCableToolPanel';
import { CAD3DFullscreenKeyHUD } from './cad-3d/components/CAD3DFullscreenKeyHUD';
import { CAD3DViewerProps } from './cad-3d/types';
import { useCAD3DViewerSetup } from './cad-3d/hooks/useCAD3DViewerSetup';

export { type InteractiveDoorNode, type SiteSurfaceType } from './cad-3d/types';

export const CAD3DViewer: React.FC<CAD3DViewerProps> = (props) => {
  const viewer = useCAD3DViewerSetup(props);

  // Sync with native browser fullscreen API if available
  useEffect(() => {
    const handleNativeFullscreenChange = () => {
      const isNative = !!document.fullscreenElement;
      if (!isNative && viewer.isFullscreen) {
        viewer.setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
    };
  }, [viewer.isFullscreen, viewer.setIsFullscreen]);

  // Ensure Three.js canvas resizes immediately when toggling fullscreen
  useEffect(() => {
    const t1 = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 20);
    const t2 = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [viewer.isFullscreen]);

  // Enforce zero mouse icon in fullscreen mode
  useEffect(() => {
    const canvas = viewer.refs.rendererRef?.current?.domElement;
    if (viewer.isFullscreen) {
      if (canvas) {
        canvas.style.setProperty('cursor', 'none', 'important');
      }
      document.body.style.setProperty('cursor', 'none', 'important');
      document.documentElement.style.setProperty('cursor', 'none', 'important');
    } else {
      if (canvas) {
        canvas.style.removeProperty('cursor');
      }
      document.body.style.removeProperty('cursor');
      document.documentElement.style.removeProperty('cursor');
    }
    return () => {
      canvas?.style.removeProperty('cursor');
      document.body.style.removeProperty('cursor');
      document.documentElement.style.removeProperty('cursor');
    };
  }, [viewer.isFullscreen, viewer.refs.rendererRef]);

  // Sync Pointer Lock when entering / exiting fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        setTimeout(() => {
          try {
            (viewer.refs.rendererRef?.current?.domElement || viewer.refs.mountRef.current)?.requestPointerLock?.();
          } catch {}
        }, 60);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [viewer.refs.rendererRef, viewer.refs.mountRef]);

  const handleToggleFullscreen = (nextVal?: boolean | ((prev: boolean) => boolean)) => {
    viewer.setIsFullscreen((prev) => {
      const target = typeof nextVal === 'function' ? nextVal(prev) : typeof nextVal === 'boolean' ? nextVal : !prev;
      if (target) {
        if (!viewer.isRoamMode) {
          viewer.handleToggleRoamMode(true);
        }
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        setTimeout(() => {
          try {
            (viewer.refs.rendererRef?.current?.domElement || viewer.refs.mountRef.current)?.requestPointerLock?.();
          } catch {
            // Fallback
          }
        }, 80);
      } else {
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return target;
    });
  };

  return (
    <div
      className={
        viewer.isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-black p-0 m-0 select-none !cursor-none [&_*]:!cursor-none [&_canvas]:!cursor-none'
          : 'fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-3 md:p-6 backdrop-blur-md select-none'
      }
    >
      {/* Enforce absolute cursor-none in fullscreen across entire DOM */}
      {viewer.isFullscreen && (
        <style>{`
          *, *::before, *::after, html, body, canvas {
            cursor: none !important;
          }
        `}</style>
      )}
      <div
        className={
          viewer.isFullscreen
            ? 'relative w-full h-full overflow-hidden bg-black !cursor-none [&_*]:!cursor-none [&_canvas]:!cursor-none'
            : 'relative flex flex-col flex-1 overflow-hidden bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl'
        }
      >
        {/* All menus hidden in fullscreen mode */}
        {!viewer.isFullscreen && (
          <CAD3DToolbar
            surfaceType={viewer.surfaceType}
            setSurfaceType={viewer.setSurfaceType}
            lightingPreset={viewer.lightingPreset}
            handleLightingChange={viewer.handleLightingChange}
            showSky={viewer.showSky}
            handleToggleSky={viewer.handleToggleSky}
            isRoamMode={viewer.isRoamMode}
            handleToggleRoamMode={viewer.handleToggleRoamMode}
            cameraPreset={viewer.cameraPreset}
            applyCameraPreset={viewer.applyCameraPreset}
            handleTiltUp={viewer.handleTiltUp}
            handleTiltDown={viewer.handleTiltDown}
            autoRotate={viewer.autoRotate}
            setAutoRotate={viewer.setAutoRotate}
            showDimensions={viewer.showDimensions}
            setShowDimensions={viewer.setShowDimensions}
            showObjectLabels={viewer.showObjectLabels}
            setShowObjectLabels={viewer.setShowObjectLabels}
            focusedDoorPrompt={viewer.focusedDoorPrompt}
            handleInteractWithDoor={viewer.handleInteractWithDoor}
            cabinRoofCutaway={viewer.cabinRoofCutaway}
            setCabinRoofCutaway={viewer.setCabinRoofCutaway}
            cableToolMode={viewer.cableToolMode}
            setCableToolMode={viewer.setCableToolMode}
            wireframe={viewer.wireframe}
            setWireframe={viewer.setWireframe}
            handleExportSnapshot={viewer.handleExportSnapshot}
            isFullscreen={viewer.isFullscreen}
            setIsFullscreen={handleToggleFullscreen}
            onClose={props.onClose}
          />
        )}

        <div
          ref={viewer.refs.mountRef}
          onMouseDown={(e) => {
            const targetEl = e.target as HTMLElement | null;
            if (targetEl?.closest('[data-roam-hud]')) return;
            if (viewer.isFullscreen || viewer.isRoamMode || viewer.cableToolMode !== 'none') {
              if (!document.pointerLockElement) {
                try {
                  (viewer.refs.rendererRef?.current?.domElement || viewer.refs.mountRef.current)?.requestPointerLock?.();
                } catch {
                  // Fallback
                }
              }
            }
          }}
          onClick={(e) => {
            const targetEl = e.target as HTMLElement | null;
            if (targetEl?.closest('[data-roam-hud]')) return;
            if (!document.pointerLockElement) {
              try {
                (viewer.refs.rendererRef?.current?.domElement || viewer.refs.mountRef.current)?.requestPointerLock?.();
              } catch {
                // Fallback
              }
            }
          }}
          className={
            viewer.isFullscreen
              ? 'absolute inset-0 w-full h-full !cursor-none overflow-hidden [&>canvas]:!cursor-none'
              : viewer.isRoamMode
              ? 'relative flex-1 w-full h-full cursor-crosshair overflow-hidden'
              : viewer.cableToolMode !== 'none'
              ? 'relative flex-1 w-full h-full cursor-crosshair overflow-hidden'
              : 'relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden'
          }
        >
          {!viewer.isSceneReady && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-none">
              <div className="w-9 h-9 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin mb-2.5" />
              <span className="text-xs font-semibold text-sky-300 tracking-wide">
                Initializing 3D Telecom Site Studio...
              </span>
            </div>
          )}

          {/* In fullscreen mode, menus are hidden and key instructions & controls HUD remains */}
          {viewer.isFullscreen ? (
            <CAD3DFullscreenKeyHUD
              isRoamMode={viewer.isRoamMode}
              isPointerLocked={viewer.isPointerLocked}
              onExitFullscreen={() => handleToggleFullscreen(false)}
              focusedDoorPrompt={viewer.focusedDoorPrompt}
              cabinRoofCutaway={viewer.cabinRoofCutaway}
              showSky={viewer.showSky}
              handleToggleRoamMode={viewer.handleToggleRoamMode}
              handleToggleSky={viewer.handleToggleSky}
              handleInteractWithDoor={viewer.handleInteractWithDoor}
              setCabinRoofCutaway={viewer.setCabinRoofCutaway}
              cableToolMode={viewer.cableToolMode}
              setCableToolMode={viewer.setCableToolMode}
              handleTeleportToLadder={viewer.handleTeleportToLadder}
              handleAutoRouteLadderToCabinets3D={viewer.handleAutoRouteLadderToCabinets3D}
              showDimensions={viewer.showDimensions}
              setShowDimensions={viewer.setShowDimensions}
              showObjectLabels={viewer.showObjectLabels}
              setShowObjectLabels={viewer.setShowObjectLabels}
              soundEnabled={viewer.soundEnabled}
              setSoundEnabled={viewer.setSoundEnabled}
              handleExportSnapshot={viewer.handleExportSnapshot}
              cameraPreset={viewer.cameraPreset}
              applyCameraPreset={viewer.applyCameraPreset}
              cableHudStatus={viewer.cableHudStatus}
              onRequestPointerLock={() => {
                try {
                  (viewer.refs.rendererRef?.current?.domElement || viewer.refs.mountRef.current)?.requestPointerLock?.();
                } catch {
                  // Fallback
                }
              }}
            />
          ) : (
            <CAD3DRoamHUD
              isRoamMode={viewer.isRoamMode}
              cableToolMode={viewer.cableToolMode}
              isPointerLocked={viewer.isPointerLocked}
              focusedDoorPrompt={viewer.focusedDoorPrompt}
              doorInteractionHint={viewer.doorInteractionHint}
              roamTelemetry={viewer.roamTelemetry}
              keysHeldRef={viewer.refs.keysHeldRef}
              activeKeysUI={viewer.activeKeysUI}
              setActiveKeysUI={viewer.setActiveKeysUI}
              setCableToolMode={viewer.setCableToolMode}
              handleTeleportToLadder={viewer.handleTeleportToLadder}
              showSky={viewer.showSky}
              handleToggleSky={viewer.handleToggleSky}
              soundEnabled={viewer.soundEnabled}
              setSoundEnabled={viewer.setSoundEnabled}
              handleToggleRoamMode={viewer.handleToggleRoamMode}
            />
          )}

          {/* Cable Tool Panel (Appears at the top whenever Lay or Delete cable mode is active) */}
          <CAD3DCableToolPanel
            cableToolMode={viewer.cableToolMode}
            setCableToolMode={viewer.setCableToolMode}
            cablePresets={viewer.CABLE_PRESETS}
            selectedCablePreset={viewer.selectedCablePreset}
            setSelectedCablePreset={viewer.setSelectedCablePreset}
            cableOrthoSnap={viewer.cableOrthoSnap}
            setCableOrthoSnap={viewer.setCableOrthoSnap}
            cableStartPt3D={viewer.cableStartPt3D}
            handlePlace3DCablePoint={viewer.handlePlace3DCablePoint}
            onCancelCable={() => {
              viewer.cableStartPt3DRef.current = null;
              viewer.cableWaypoints3DRef.current = [];
              viewer.setCableStartPt3D(null);
            }}
            handleAutoRouteLadderToCabinets3D={viewer.handleAutoRouteLadderToCabinets3D}
            cableHudStatus={viewer.cableHudStatus}
            handleClearAllCables3D={viewer.handleClearAllCables3D}
          />
        </div>
      </div>
    </div>
  );
};
