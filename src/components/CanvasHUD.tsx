/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectSettings, SnapResult } from '../types/cad';
import { HUDTopBanners } from './canvas-hud/HUDTopBanners';
import { HUDCoordinatesBar } from './canvas-hud/HUDCoordinatesBar';
import { HUDDraftingControls } from './canvas-hud/HUDDraftingControls';
import { HUDStatusZoomBar } from './canvas-hud/HUDStatusZoomBar';

interface CanvasHUDProps {
  cursorPos: { x: number; y: number } | null;
  snapInfo: SnapResult | null;
  settings: ProjectSettings;
  zoom: number;
  onFitToScreen: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  totalObjects: number;
  clipboardCount: number;
  storageKB: number;
  armedStencilName?: string;
  armedRotation?: number;
  onRotateArmed?: () => void;
  onCancelArmedStencil?: () => void;
  onPlaceArmedAtCenter?: () => void;
  connectedLineActive?: boolean;
  onDisconnectLine?: () => void;
  isPolylineActive?: boolean;
  polylinePointsCount?: number;
  onFinishPolyline?: () => void;
  onToggleMeasurements?: () => void;
  onToggleObjectLabels?: () => void;
  onToggleSelectionBoxStyle?: () => void;
  onCancelAction?: () => void;
  onToggle3D?: () => void;
  onToggleRenderStyle?: () => void;
  onToggleDoors?: () => void;
  areDoorsOpen?: boolean;
  onOpenCableSchedule?: () => void;
}

export const CanvasHUD: React.FC<CanvasHUDProps> = ({
  cursorPos,
  snapInfo,
  settings,
  zoom,
  onFitToScreen,
  onZoomIn,
  onZoomOut,
  totalObjects,
  clipboardCount,
  storageKB,
  armedStencilName,
  armedRotation = 0,
  onRotateArmed,
  onCancelArmedStencil,
  onPlaceArmedAtCenter,
  connectedLineActive,
  onDisconnectLine,
  isPolylineActive,
  polylinePointsCount = 0,
  onFinishPolyline,
  onToggleMeasurements,
  onToggleObjectLabels,
  onToggleSelectionBoxStyle,
  onCancelAction,
  onToggle3D,
  onToggleRenderStyle,
  onToggleDoors,
  areDoorsOpen = false,
  onOpenCableSchedule,
}) => {
  return (
    <>
      <HUDTopBanners
        armedStencilName={armedStencilName}
        armedRotation={armedRotation}
        onRotateArmed={onRotateArmed}
        onCancelArmedStencil={onCancelArmedStencil}
        onPlaceArmedAtCenter={onPlaceArmedAtCenter}
        connectedLineActive={connectedLineActive}
        onDisconnectLine={onDisconnectLine}
        isPolylineActive={isPolylineActive}
        polylinePointsCount={polylinePointsCount}
        onFinishPolyline={onFinishPolyline}
        onCancelAction={onCancelAction}
      />

      {/* Bottom Bar Floating HUDs */}
      <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-end justify-between z-20 text-xs">
        <HUDCoordinatesBar
          cursorPos={cursorPos}
          snapInfo={snapInfo}
          settings={settings}
        />

        <HUDDraftingControls
          settings={settings}
          onToggleMeasurements={onToggleMeasurements}
          onToggleObjectLabels={onToggleObjectLabels}
          onToggleSelectionBoxStyle={onToggleSelectionBoxStyle}
          onCancelAction={onCancelAction}
          onToggle3D={onToggle3D}
          onToggleRenderStyle={onToggleRenderStyle}
          onToggleDoors={onToggleDoors}
          areDoorsOpen={areDoorsOpen}
          onOpenCableSchedule={onOpenCableSchedule}
        />

        <HUDStatusZoomBar
          totalObjects={totalObjects}
          clipboardCount={clipboardCount}
          storageKB={storageKB}
          zoom={zoom}
          onFitToScreen={onFitToScreen}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>
    </>
  );
};
