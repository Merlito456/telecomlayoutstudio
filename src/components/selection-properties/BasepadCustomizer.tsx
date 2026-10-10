import React from "react";
import { CADObject } from "../../types/cad";
import { Shield, ArrowUp, Zap, TrendingUp, Ruler } from "lucide-react";

interface BasepadCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const BasepadCustomizer: React.FC<BasepadCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  const isElevated =
    primary.stencilId?.includes("elevated") ||
    primary.customProps?.stencilType?.includes("elevated");

  const isGroundBasepadObj = (o: CADObject | null | undefined): boolean => {
    if (!o) return false;
    const s = (o.stencilId || o.customProps?.stencilType || "").toLowerCase();
    if (s.includes("ladder") || s.includes("stairs")) return false;
    return (
      s === "cement-basepad" ||
      s === "gen-basepad" ||
      s === "tx-basepad" ||
      s === "ac-basepad" ||
      s === "cement-slab" ||
      s === "generator-pad" ||
      s === "pad" ||
      s.includes("basepad")
    );
  };

  const showGroundPad = isGroundBasepadObj(primary) && !isElevated;

  return (
    <>
      {isElevated && (
            <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40 space-y-3 shadow-md shadow-sky-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  Elevated Basepad Designer
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                  +800mm TOC
                </span>
              </div>

              {/* Stairs Wall Selector */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-sky-400" />
                    Access Stairs Side
                  </span>
                  <span className="font-mono text-sky-400 uppercase">
                    {primary.customProps?.stairsWall || 'south'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {(['north', 'south', 'east', 'west', 'none'] as const).map((w) => {
                    const active = (primary.customProps?.stairsWall || 'south') === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              stairsWall: w,
                              // Automatically open railing on the stairs side
                              ...(w === 'south' ? { railingSouth: false } : {}),
                              ...(w === 'north' ? { railingNorth: false } : {}),
                              ...(w === 'east' ? { railingEast: false } : {}),
                              ...(w === 'west' ? { railingWest: false } : {}),
                            },
                          })
                        }
                        className={`py-1 text-[9px] font-medium rounded capitalize transition-all cursor-pointer ${
                          active
                            ? 'bg-sky-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Perimeter Safety Railings Toggles */}
              <div>
                <span className="text-[10px] text-slate-300 block mb-1 font-medium">
                  Perimeter Safety Railings
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { key: 'railingNorth', label: 'North', defaultVal: true },
                    { key: 'railingSouth', label: 'South', defaultVal: false },
                    { key: 'railingEast', label: 'East', defaultVal: true },
                    { key: 'railingWest', label: 'West', defaultVal: true },
                  ].map((r) => {
                    const val = primary.customProps?.[r.key] ?? r.defaultVal;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              [r.key]: !val,
                            },
                          })
                        }
                        className={`py-1 text-[9px] font-medium rounded transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          val
                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                            : 'bg-slate-800 border border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>{r.label}</span>
                        <span className="text-[8px] font-mono">{val ? 'ON' : 'OFF'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ground Busbar Wall */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Master Ground Busbar (MGB)
                  </span>
                  <span className="font-mono text-amber-400 uppercase">
                    {primary.customProps?.busbarWall || 'east'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {(['north', 'south', 'east', 'west', 'none'] as const).map((w) => {
                    const active = (primary.customProps?.busbarWall || 'east') === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: { ...(primary.customProps || {}), busbarWall: w },
                          })
                        }
                        className={`py-1 text-[9px] font-medium rounded capitalize transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Elevation Height Selector */}
              <div>
                <span className="text-[10px] text-slate-300 block mb-1 font-medium">
                  Platform Elevation (TOC)
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[500, 800, 1000, 1200].map((hVal) => {
                    const active = (primary.customProps?.elevationHeight ?? 800) === hVal;
                    return (
                      <button
                        key={hVal}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: { ...(primary.customProps || {}), elevationHeight: hVal },
                          })
                        }
                        className={`py-1 text-[9px] font-medium rounded transition-all cursor-pointer ${
                          active
                            ? 'bg-sky-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        +{hVal}mm
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
      )}
      {showGroundPad && ((() => {
            const isGroundBasepadObj = (o: CADObject | null | undefined): boolean => {
              if (!o) return false;
              const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
              if (s.includes('ladder') || s.includes('stairs')) return false;
              if (
                s === 'cement-basepad' ||
                s === 'gen-basepad' ||
                s === 'tx-basepad' ||
                s === 'ac-basepad' ||
                s === 'cement-slab' ||
                s.endsWith('-basepad') ||
                s.includes('basepad')
              ) {
                return true;
              }
              const text = (o.text || '').toLowerCase();
              return (
                (text.includes('basepad') ||
                  text.includes('concrete pad') ||
                  text.includes('gen pad') ||
                  text.includes('tx pad') ||
                  text.includes('cement pad')) &&
                !text.includes('ladder') &&
                !text.includes('stair')
              );
            };

            const isPadSelected = isGroundBasepadObj(primary);
            if (!isPadSelected) return null;

            const currentHeight = primary.basepadHeight ?? primary.customProps?.basepadHeight ?? 150;
            const currentMeters = (currentHeight / 1000).toFixed(2);

            const handleHeightChange = (val: number) => {
              const clamped = Math.max(50, Math.min(3000, val));
              onUpdateSelected({
                basepadHeight: clamped,
                customProps: { ...(primary.customProps || {}), basepadHeight: clamped },
              });
            };

            return (
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border border-emerald-500/50 space-y-3.5 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Ground Basepad Height (TOC)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    +{currentMeters}m TOC
                  </span>
                </div>

                {/* Direct Input & Stepper Controls */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-emerald-400" />
                      Plinth Height / Thickness
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {currentHeight} mm ({currentMeters} m)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Stepper Down */}
                    <button
                      type="button"
                      onClick={() => handleHeightChange(currentHeight - 50)}
                      title="Decrease height by 50mm"
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 rounded text-xs font-mono font-bold border border-slate-700 cursor-pointer transition-all"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHeightChange(currentHeight - 10)}
                      title="Decrease height by 10mm"
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 rounded text-xs font-mono font-bold border border-slate-700 cursor-pointer transition-all"
                    >
                      -10
                    </button>

                    {/* Main numeric input */}
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="50"
                        max="3000"
                        step="10"
                        value={currentHeight}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            handleHeightChange(val);
                          }
                        }}
                        className="w-full bg-slate-950 border border-emerald-500/60 rounded px-2.5 py-1.5 text-xs text-emerald-200 font-mono font-bold focus:border-emerald-400 focus:outline-none pr-8 text-center"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 pointer-events-none">
                        mm
                      </span>
                    </div>

                    {/* Stepper Up */}
                    <button
                      type="button"
                      onClick={() => handleHeightChange(currentHeight + 10)}
                      title="Increase height by 10mm"
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 rounded text-xs font-mono font-bold border border-slate-700 cursor-pointer transition-all"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHeightChange(currentHeight + 50)}
                      title="Increase height by 50mm"
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 rounded text-xs font-mono font-bold border border-slate-700 cursor-pointer transition-all"
                    >
                      +50
                    </button>
                  </div>
                </div>

                {/* Tactile Scrubbing Slider */}
                <div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={Math.min(1000, Math.max(50, currentHeight))}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Engineering Standard Presets Grid */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                    Standard Foundation Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { h: 100, label: '100mm', desc: '0.10m Low' },
                      { h: 150, label: '150mm', desc: '0.15m Std' },
                      { h: 200, label: '200mm', desc: '0.20m Raised' },
                      { h: 300, label: '300mm', desc: '0.30m Heavy' },
                      { h: 450, label: '450mm', desc: '0.45m 3-Step' },
                      { h: 600, label: '600mm', desc: '0.60m Flood' },
                    ].map((preset) => {
                      const active = currentHeight === preset.h;
                      return (
                        <button
                          key={preset.h}
                          type="button"
                          onClick={() => handleHeightChange(preset.h)}
                          className={`py-1.5 px-1 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-600 text-white font-bold shadow-sm ring-1 ring-emerald-400'
                              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 border border-slate-700/60'
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold">{preset.label}</span>
                          <span className={`text-[8px] ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {preset.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Engineering Annotation Note */}
                <div className="text-[9px] text-emerald-200/90 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/50 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0">✔</span>
                  <span>
                    <strong>Top of Concrete (TOC):</strong> Cabinets, generators, cable ladders, and stairs sitting on this pad will automatically adjust their physical height in 2D and 3D Studio to remain flush with the top surface.
                  </span>
                </div>
              </div>
            );
          })())}
    </>
  );
};
