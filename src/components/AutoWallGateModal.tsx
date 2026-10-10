import React, { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { CADObject, ProjectSettings } from '../types/cad';
import {
  WallType,
  GateWallLocation,
  generatePerimeterElements,
} from './auto-wall-gate/wall-gate-generator';
import { SiteDimensionControls } from './auto-wall-gate/SiteDimensionControls';
import { GatePlacementControls } from './auto-wall-gate/GatePlacementControls';

interface AutoWallGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  canvasWidth: number;
  canvasHeight: number;
  onGenerate: (objects: CADObject[], toastMsg: string) => void;
}

export const AutoWallGateModal: React.FC<AutoWallGateModalProps> = ({
  isOpen,
  onClose,
  settings,
  canvasWidth,
  canvasHeight,
  onGenerate,
}) => {
  // Site dimensions in meters
  const [siteWidthM, setSiteWidthM] = useState<number>(20);
  const [siteDepthM, setSiteDepthM] = useState<number>(20);

  // Wall configuration
  const [wallType, setWallType] = useState<WallType>('masonry-wall');
  const [wallThicknessM, setWallThicknessM] = useState<number>(0.3); // 30cm standard masonry wall

  // Gate configuration
  const [gateLocation, setGateLocation] = useState<GateWallLocation>('south');
  const [gateLengthM, setGateLengthM] = useState<number>(4.0); // 4.0m double-leaf gate
  const [gatePositionType, setGatePositionType] = useState<'center' | 'offset'>('center');
  const [gateOffsetM, setGateOffsetM] = useState<number>(2.0); // Offset from left corner

  // Extras
  const [includeGravelYard, setIncludeGravelYard] = useState<boolean>(true);
  const [includeCornerPosts, setIncludeCornerPosts] = useState<boolean>(true);

  if (!isOpen) return null;

  const scale = settings.scaleFactor; // pixels per meter (default 20px = 1m)
  const maxGateLength = gateLocation === 'south' || gateLocation === 'north' ? siteWidthM - 1 : siteDepthM - 1;
  const clampedGateLength = Math.max(2, Math.min(gateLengthM, maxGateLength));

  const handleGenerate = () => {
    const generatedObjects = generatePerimeterElements({
      siteWidthM,
      siteDepthM,
      wallType,
      wallThicknessM,
      gateLocation,
      clampedGateLength,
      gatePositionType,
      gateOffsetM,
      includeGravelYard,
      includeCornerPosts,
      scale,
      canvasWidth,
      canvasHeight,
    });

    const toast = `Auto-generated enclosed ${siteWidthM}m × ${siteDepthM}m perimeter with ${clampedGateLength}m gate on ${gateLocation.toUpperCase()} wall`;
    onGenerate(generatedObjects, toast);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-sky-500/40 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Perimeter Wall & Gate Generator
              </h2>
              <p className="text-[10px] text-slate-400 leading-tight">
                Generate enclosed compound walls with access gate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 overflow-y-auto space-y-2.5 text-xs text-slate-300">
          <SiteDimensionControls
            siteWidthM={siteWidthM}
            setSiteWidthM={setSiteWidthM}
            siteDepthM={siteDepthM}
            setSiteDepthM={setSiteDepthM}
            wallType={wallType}
            setWallType={setWallType}
            setWallThicknessM={setWallThicknessM}
          />

          <GatePlacementControls
            gateLocation={gateLocation}
            setGateLocation={setGateLocation}
            clampedGateLength={clampedGateLength}
            gateLengthM={gateLengthM}
            setGateLengthM={setGateLengthM}
            maxGateLength={maxGateLength}
            gatePositionType={gatePositionType}
            setGatePositionType={setGatePositionType}
            gateOffsetM={gateOffsetM}
            setGateOffsetM={setGateOffsetM}
            includeGravelYard={includeGravelYard}
            setIncludeGravelYard={setIncludeGravelYard}
            includeCornerPosts={includeCornerPosts}
            setIncludeCornerPosts={setIncludeCornerPosts}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-3.5 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[9.5px] text-slate-500">
            Perimeter with {gateLocation.toUpperCase()} gate
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
