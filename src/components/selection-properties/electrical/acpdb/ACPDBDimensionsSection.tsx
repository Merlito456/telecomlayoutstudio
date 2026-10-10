import React from 'react';
import { CADObject } from '../../../../types/cad';

export interface ACPDBDimensionsSectionProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const ACPDBDimensionsSection: React.FC<ACPDBDimensionsSectionProps> = ({
  primary,
  onUpdateSelected,
}) => {
  return (
    <>
      {/* Enclosure Actual Dimensions */}
      <div className="space-y-1.5 p-2 bg-slate-950/70 rounded-lg border border-slate-800">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-semibold text-slate-200">Actual Enclosure Size:</span>
          <span className="font-mono text-amber-300 font-bold">
            {Math.round((primary.customProps?.sizeScale ?? 1.0) * 100)}% Scale
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: 'Compact 1-Phase', scale: 0.8, w: 440, h: 640, d: 220 },
            { label: 'Std 3-Phase', scale: 1.0, w: 600, h: 800, d: 260 },
            { label: 'Heavy DG+Mains', scale: 1.15, w: 660, h: 900, d: 280 },
          ].map((preset) => {
            const currentScale = primary.customProps?.sizeScale ?? 1.0;
            const active = Math.abs(currentScale - preset.scale) < 0.05;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      sizeScale: preset.scale,
                      boxWidth: preset.w * 0.005,
                      boxHeight: preset.h * 0.005,
                      boxDepth: preset.d * 0.005,
                      actualWidthMm: preset.w,
                      actualHeightMm: preset.h,
                      actualDepthMm: preset.d,
                    },
                  });
                }}
                className={`p-1 text-center rounded text-[9px] cursor-pointer transition-all border ${
                  active
                    ? 'bg-amber-600 text-white font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="text-[8px] text-slate-400 font-mono">
                  {preset.w}×{preset.h}mm
                </div>
              </button>
            );
          })}
        </div>

        {/* Direct Dimensions in Millimeters */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div className="space-y-0.5">
            <label className="text-[8px] text-slate-400 uppercase font-semibold">Width (mm)</label>
            <input
              type="number"
              step="10"
              min="300"
              max="1500"
              value={
                primary.customProps?.actualWidthMm ??
                (primary.customProps?.boxWidth ? Math.round(primary.customProps.boxWidth / 0.005) : 560)
              }
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      actualWidthMm: val,
                      boxWidth: val * 0.005,
                    },
                  });
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-[10px] text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-[8px] text-slate-400 uppercase font-semibold">Height (mm)</label>
            <input
              type="number"
              step="10"
              min="400"
              max="1600"
              value={
                primary.customProps?.actualHeightMm ??
                (primary.customProps?.boxHeight ? Math.round(primary.customProps.boxHeight / 0.005) : 800)
              }
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      actualHeightMm: val,
                      boxHeight: val * 0.005,
                    },
                  });
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-[10px] text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-[8px] text-slate-400 uppercase font-semibold">Depth (mm)</label>
            <input
              type="number"
              step="10"
              min="150"
              max="600"
              value={
                primary.customProps?.actualDepthMm ??
                (primary.customProps?.boxDepth ? Math.round(primary.customProps.boxDepth / 0.005) : 260)
              }
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      actualDepthMm: val,
                      boxDepth: val * 0.005,
                    },
                  });
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-[10px] text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-1">
          <div className="flex justify-between text-[8px] font-mono text-slate-400 mb-0.5">
            <span>Overall Proportional Scale:</span>
            <span className="text-amber-300 font-bold">
              {Math.round((primary.customProps?.sizeScale ?? 1.0) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.60"
            max="1.40"
            step="0.05"
            value={primary.customProps?.sizeScale ?? 1.0}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdateSelected({
                customProps: {
                  ...(primary.customProps || {}),
                  sizeScale: val,
                },
              });
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-0.5">
            <span>60% (Mini)</span>
            <span>100% (Standard)</span>
            <span>140% (Large)</span>
          </div>
        </div>
      </div>

      {/* Mounting Elevation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-200">Mounting Height (Above Grade):</span>
          <span className="font-mono text-emerald-400 font-bold">
            {(primary.customProps?.mountingElevationM ?? 1.55).toFixed(2)}m AFF (Eye-Level)
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: 'Eye-Level', m: 1.55, sub: 'Standard' },
            { label: 'Ergonomic', m: 1.40, sub: 'Reach' },
            { label: 'High', m: 1.65, sub: 'Tall' },
            { label: 'Low Wall', m: 1.20, sub: 'Compact' },
          ].map((preset) => {
            const currentM = primary.customProps?.mountingElevationM ?? 1.55;
            const active = Math.abs(currentM - preset.m) < 0.04;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      mountingElevationM: preset.m,
                    },
                  });
                }}
                className={`py-1 px-1 text-center rounded text-[9px] cursor-pointer transition-all border ${
                  active
                    ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">{preset.m.toFixed(2)}m</div>
                <div className="text-[7.5px] text-slate-400">{preset.label}</div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="range"
            min="0.80"
            max="2.20"
            step="0.05"
            value={primary.customProps?.mountingElevationM ?? 1.55}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdateSelected({
                customProps: {
                  ...(primary.customProps || {}),
                  mountingElevationM: val,
                },
              });
            }}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="3.0"
              value={Number(primary.customProps?.mountingElevationM ?? 1.55).toFixed(2)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  onUpdateSelected({
                    customProps: {
                      ...(primary.customProps || {}),
                      mountingElevationM: val,
                    },
                  });
                }
              }}
              className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 font-mono">m</span>
          </div>
        </div>
      </div>
    </>
  );
};
