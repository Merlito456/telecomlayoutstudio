import React from 'react';
import { Maximize2, Layers, Check } from 'lucide-react';
import { WallType } from './wall-gate-generator';

interface SiteDimensionControlsProps {
  siteWidthM: number;
  setSiteWidthM: (w: number) => void;
  siteDepthM: number;
  setSiteDepthM: (d: number) => void;
  wallType: WallType;
  setWallType: (t: WallType) => void;
  setWallThicknessM: (th: number) => void;
}

export const SiteDimensionControls: React.FC<SiteDimensionControlsProps> = ({
  siteWidthM,
  setSiteWidthM,
  siteDepthM,
  setSiteDepthM,
  wallType,
  setWallType,
  setWallThicknessM,
}) => {
  return (
    <>
      {/* 1. Site Dimensions */}
      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1 text-[10px]">
            <Maximize2 className="w-3 h-3 text-sky-400" />
            1. Site Dimensions (Meters)
          </span>
          <span className="font-mono text-sky-400 text-[11px]">
            {siteWidthM}m × {siteDepthM}m ({(siteWidthM * siteDepthM).toFixed(0)} m²)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9.5px] text-slate-400 mb-0.5">
              Width (East-West)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="5"
                max="100"
                step="1"
                value={siteWidthM}
                onChange={(e) => setSiteWidthM(Math.max(5, parseFloat(e.target.value) || 5))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white font-mono text-[11px] focus:border-sky-500 focus:outline-none"
              />
              <span className="text-slate-500 font-mono text-[10px]">m</span>
            </div>
          </div>

          <div>
            <label className="block text-[9.5px] text-slate-400 mb-0.5">
              Depth (North-South)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="5"
                max="100"
                step="1"
                value={siteDepthM}
                onChange={(e) => setSiteDepthM(Math.max(5, parseFloat(e.target.value) || 5))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white font-mono text-[11px] focus:border-sky-500 focus:outline-none"
              />
              <span className="text-slate-500 font-mono text-[10px]">m</span>
            </div>
          </div>
        </div>

        {/* Quick Dimension Presets */}
        <div className="flex items-center gap-1 pt-0.5 flex-wrap">
          <span className="text-[9.5px] text-slate-500">Presets:</span>
          {[
            { w: 12, d: 12, label: '12×12' },
            { w: 15, d: 15, label: '15×15' },
            { w: 20, d: 20, label: '20×20' },
            { w: 25, d: 20, label: '25×20' },
            { w: 30, d: 30, label: '30×30' },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setSiteWidthM(p.w);
                setSiteDepthM(p.d);
              }}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9.5px] font-mono transition-colors cursor-pointer"
            >
              {p.label}m
            </button>
          ))}
        </div>
      </div>

      {/* 2. Wall Type & Specifications */}
      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
        <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1 text-[10px]">
          <Layers className="w-3 h-3 text-emerald-400" />
          2. Perimeter Wall Type
        </span>

        <div className="grid grid-cols-3 gap-1">
          {[
            {
              id: 'masonry-wall' as const,
              name: 'CHB Masonry',
              thick: 0.3,
              tag: '0.30m Wall',
            },
            {
              id: 'cement-fence' as const,
              name: 'Precast Cement',
              thick: 0.25,
              tag: '0.25m Fence',
            },
            {
              id: 'boundary-fence' as const,
              name: 'Chainlink Sec.',
              thick: 0.2,
              tag: '0.20m Fence',
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setWallType(t.id);
                setWallThicknessM(t.thick);
              }}
              className={`py-1 px-1.5 rounded-md border text-left transition-all cursor-pointer ${
                wallType === t.id
                  ? 'bg-sky-950/60 border-sky-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
              }`}
            >
              <div className="font-medium text-[10px] text-white flex items-center justify-between">
                <span className="truncate">{t.name}</span>
                {wallType === t.id && <Check className="w-2.5 h-2.5 text-sky-400 shrink-0" />}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">{t.tag}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
