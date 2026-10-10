import React, { useState } from "react";
import { CADObject } from "../../types/cad";
import { Box, ArrowUp, DoorOpen, DoorClosed, Cable, Wind, Zap, Plus, Trash2 } from "lucide-react";

interface ShelterCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  onOpenShelterDesigner?: (shelterObj?: CADObject) => void;
}

export const ShelterCustomizer: React.FC<ShelterCustomizerProps> = ({
  primary,
  onUpdateSelected,
  onOpenShelterDesigner,
}) => {
  const isShelter =
    primary.stencilId === "cement-shelter" ||
    primary.stencilId === "shelter" ||
    primary.customProps?.stencilType === "cement-shelter" ||
    primary.customProps?.stencilType === "shelter";

  if (!isShelter) return null;

  return (
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-3 shadow-md shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  Cement Shelter Customizer
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Full Box
                </span>
              </div>

              {/* Design Shelter Interior Studio Button */}
              {onOpenShelterDesigner && (
                <button
                  type="button"
                  onClick={() => onOpenShelterDesigner(primary)}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-950/40 transition-all cursor-pointer"
                >
                  <Box className="w-4 h-4 text-sky-200" />
                  <span>Design Shelter Interior</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">
                    {primary.interiorObjects?.length || (primary.customProps?.interiorObjects as any[])?.length || 0} items
                  </span>
                </button>
              )}

              {/* In-Shelter Cable Ladder Quick Status & Install */}
              {(() => {
                const currentInterior = (primary.interiorObjects || primary.customProps?.interiorObjects || []) as any[];
                const hasLadder = currentInterior.some((itm: any) => {
                  const s = String(itm.stencilId || itm.customProps?.stencilType || itm.category || itm.name || '').toLowerCase();
                  return s.includes('ladder') || s.includes('raceway');
                });

                if (!hasLadder) {
                  return (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const hM = Number(primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0);
                          const wMm = Math.round(((primary.width || 180) / 20) * 1000);
                          const dMm = Math.round(((primary.height || 140) / 20) * 1000);
                          const ladderW = Math.max(1500, Math.min(2400, wMm - 800));
                          const newLadder = {
                            id: `eq-${Date.now()}-ladder`,
                            name: 'In-Shelter Cable Ladder (2.4m Runway)',
                            category: 'ladder',
                            stencilId: 'indoor-ladder',
                            widthMm: ladderW,
                            depthMm: 450,
                            heightMm: 80,
                            elevationMm: Math.round((hM - 0.09) * 1000),
                            xMm: Math.round((wMm - ladderW) / 2),
                            yMm: Math.round(dMm * 0.42),
                            rotationDeg: 0,
                            color: '#ca8a04',
                            strokeColor: '#facc15',
                            desc: 'Overhead ceiling-suspended in-shelter cable ladder runway',
                            customProps: {
                              category: 'ladder',
                              stencilType: 'indoor-ladder',
                              placement: 'indoor',
                              ladderType: 'indoor',
                              widthMm: ladderW,
                              depthMm: 450,
                              heightMm: 80,
                              elevationMm: Math.round((hM - 0.09) * 1000),
                            },
                          };
                          const updated = [...currentInterior, newLadder];
                          onUpdateSelected({
                            interiorObjects: updated,
                            customProps: {
                              ...(primary.customProps || {}),
                              interiorObjects: updated,
                            },
                          });
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Cable className="w-3.5 h-3.5 text-amber-400" />
                        <span>Install In-Shelter Cable Ladder</span>
                      </button>
                      {currentInterior.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSelected({
                              interiorObjects: [],
                              customProps: {
                                ...(primary.customProps || {}),
                                interiorObjects: [],
                              },
                            });
                          }}
                          className="w-full py-1 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-medium text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Make Shelter Empty ({currentInterior.length} items)</span>
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-amber-950/40 border border-amber-600/30 text-[10px] text-amber-300">
                      <span className="flex items-center gap-1 font-medium">
                        <Cable className="w-3 h-3 text-amber-400" />
                        In-Shelter Cable Ladder:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">
                          Installed
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = currentInterior.filter((itm: any) => {
                              const s = String(itm.stencilId || itm.customProps?.stencilType || itm.category || itm.name || '').toLowerCase();
                              return !(s.includes('ladder') || s.includes('raceway'));
                            });
                            onUpdateSelected({
                              interiorObjects: updated,
                              customProps: {
                                ...(primary.customProps || {}),
                                interiorObjects: updated,
                              },
                            });
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/50 hover:bg-red-800 text-red-300 transition-colors cursor-pointer"
                          title="Remove in-shelter cable ladder"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {currentInterior.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSelected({
                            interiorObjects: [],
                            customProps: {
                              ...(primary.customProps || {}),
                              interiorObjects: [],
                            },
                          });
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-medium text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Make Shelter Empty (Remove All Items)</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Shelter Height (Cabin/Shelter Height) */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                    Shelter Height (Wall & Ceiling)
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {(primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0).toFixed(1)}m ({Math.round((primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0) * 1000)}mm)
                  </span>
                </div>
                {/* Height Presets */}
                <div className="grid grid-cols-5 gap-1">
                  {[2.4, 2.8, 3.0, 3.2, 3.5].map((h) => {
                    const currentH = primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0;
                    const active = Math.abs(currentH - h) < 0.05;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            shelterHeightM: h,
                            customProps: { ...(primary.customProps || {}), shelterHeightM: h },
                          })
                        }
                        className={`py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {h.toFixed(1)}m
                      </button>
                    );
                  })}
                </div>
                {/* Height Range Slider */}
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.1"
                  value={primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSelected({
                      shelterHeightM: val,
                      customProps: { ...(primary.customProps || {}), shelterHeightM: val },
                    });
                  }}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Overhead cable ladder:</span>
                  <span className="font-mono text-amber-400">+{((primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0) - 0.09).toFixed(2)}m (3.5&quot; below ceiling)</span>
                </div>
              </div>

              {/* Door Wall Selector */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-sky-300">
                    <DoorClosed className="w-3.5 h-3.5 text-sky-400" />
                    Access Door Wall &amp; Position
                  </span>
                  <span className="font-mono text-sky-400 uppercase font-bold">
                    {primary.customProps?.doorWall || 'south'} ({primary.customProps?.doorOffset ?? 35}%)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['north', 'south', 'east', 'west'] as const).map((w) => {
                    const active = (primary.customProps?.doorWall || 'south') === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: { ...(primary.customProps || {}), doorWall: w },
                          })
                        }
                        className={`py-1 text-[10px] font-medium rounded capitalize transition-all cursor-pointer ${
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
                {/* Door Position Slider & Quick Presets */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Door Offset along Wall</span>
                    <span className="font-mono text-sky-300 font-bold">{primary.customProps?.doorOffset ?? 35}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={primary.customProps?.doorOffset ?? 35}
                    onChange={(e) =>
                      onUpdateSelected({
                        customProps: {
                          ...(primary.customProps || {}),
                          doorOffset: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  {/* Quick offset presets */}
                  <div className="flex gap-1 pt-0.5">
                    {[
                      { label: 'Left (25%)', val: 25 },
                      { label: 'Center (50%)', val: 50 },
                      { label: 'Right (75%)', val: 75 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              doorOffset: p.val,
                            },
                          })
                        }
                        className={`flex-1 py-0.5 text-[9px] rounded font-mono transition-all cursor-pointer ${
                          (primary.customProps?.doorOffset ?? 35) === p.val
                            ? 'bg-sky-600/40 text-sky-200 border border-sky-400/50'
                            : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Door Diameter / Width */}
                <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <span>Door Diameter / Width (⌀):</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="600"
                        max="2400"
                        step="25"
                        value={primary.customProps?.doorWidthMm ?? primary.customProps?.doorDiameter ?? 900}
                        onChange={(e) => {
                          const val = Math.max(600, Math.min(2400, parseInt(e.target.value, 10) || 900));
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              doorWidthMm: val,
                              doorDiameter: val,
                              doorDiameterMm: val,
                            },
                          });
                        }}
                        className="w-14 px-1 py-0.5 rounded bg-slate-950 border border-sky-500/40 text-sky-300 font-mono text-center text-xs"
                      />
                      <span className="text-slate-400 font-mono text-[9px]">mm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="2400"
                    step="25"
                    value={primary.customProps?.doorWidthMm ?? primary.customProps?.doorDiameter ?? 900}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateSelected({
                        customProps: {
                          ...(primary.customProps || {}),
                          doorWidthMm: val,
                          doorDiameter: val,
                          doorDiameterMm: val,
                        },
                      });
                    }}
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="grid grid-cols-6 gap-1">
                    {[750, 800, 900, 1000, 1200, 1500].map((dw) => {
                      const curDw = primary.customProps?.doorWidthMm ?? primary.customProps?.doorDiameter ?? 900;
                      const active = curDw === dw;
                      return (
                        <button
                          key={dw}
                          type="button"
                          onClick={() =>
                            onUpdateSelected({
                              customProps: {
                                ...(primary.customProps || {}),
                                doorWidthMm: dw,
                                doorDiameter: dw,
                                doorDiameterMm: dw,
                              },
                            })
                          }
                          className={`py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                            active
                              ? 'bg-sky-600 text-white font-bold shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {dw}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shelter Door Position State (Key Z) */}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                    <span className="flex items-center gap-1 font-medium">
                      {primary.doorsOpen ? <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> : <DoorClosed className="w-3.5 h-3.5 text-slate-400" />}
                      Access Door Position
                    </span>
                    <span className="font-mono text-[9px] text-sky-300 font-bold">
                      {primary.doorsOpen ? 'OPEN (Key Z)' : 'CLOSED (Key Z)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSelected({
                          doorsOpen: false,
                          customProps: { ...(primary.customProps || {}), doorsOpen: false, isClosed: true },
                        })
                      }
                      className={`py-1 text-[10px] font-medium rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        !primary.doorsOpen
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <DoorClosed className="w-3.5 h-3.5" />
                      <span>Closed</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSelected({
                          doorsOpen: true,
                          customProps: { ...(primary.customProps || {}), doorsOpen: true, isClosed: false },
                        })
                      }
                      className={`py-1 text-[10px] font-medium rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        primary.doorsOpen
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span>Open [Z]</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cable Hole Wall Selector */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Feeder Cable Hole / Gland
                  </span>
                  <span className="font-mono text-amber-400 uppercase font-bold">
                    {(primary.customProps?.cableHoleWall ?? 'east') === 'none'
                      ? 'Disabled'
                      : `${primary.customProps?.cableHoleWall ?? 'east'} (${primary.customProps?.cableHoleOffset ?? 50}%)`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {(['north', 'south', 'east', 'west', 'none'] as const).map((w) => {
                    const active = (primary.customProps?.cableHoleWall ?? 'east') === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: { ...(primary.customProps || {}), cableHoleWall: w },
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
                {primary.customProps?.cableHoleWall !== 'none' && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Feeder Position along Wall</span>
                      <span className="font-mono text-amber-300 font-bold">{primary.customProps?.cableHoleOffset ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={primary.customProps?.cableHoleOffset ?? 50}
                      onChange={(e) =>
                        onUpdateSelected({
                          customProps: {
                            ...(primary.customProps || {}),
                            cableHoleOffset: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                    {/* Quick offset presets */}
                    <div className="flex gap-1 pt-0.5">
                      {[
                        { label: 'Left (25%)', val: 25 },
                        { label: 'Center (50%)', val: 50 },
                        { label: 'Right (75%)', val: 75 },
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() =>
                            onUpdateSelected({
                              customProps: {
                                ...(primary.customProps || {}),
                                cableHoleOffset: p.val,
                              },
                            })
                          }
                          className={`flex-1 py-0.5 text-[9px] rounded font-mono transition-all cursor-pointer ${
                            (primary.customProps?.cableHoleOffset ?? 50) === p.val
                              ? 'bg-amber-600/40 text-amber-200 border border-amber-400/50'
                              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Feeder Hole Diameter */}
                    <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <span>Feeder Hole Diameter (⌀):</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="100"
                            max="600"
                            step="25"
                            value={primary.cableHoleDiameterMm ?? primary.customProps?.cableHoleDiameterMm ?? primary.customProps?.cableHoleDiameter ?? primary.feederDiameter ?? 250}
                            onChange={(e) => {
                              const val = Math.max(100, Math.min(600, parseInt(e.target.value, 10) || 250));
                              onUpdateSelected({
                                cableHoleDiameterMm: val,
                                feederDiameter: val,
                                customProps: {
                                  ...(primary.customProps || {}),
                                  cableHoleDiameterMm: val,
                                  cableHoleDiameter: val,
                                  feederDiameter: val,
                                },
                              });
                            }}
                            className="w-14 px-1 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-center text-xs"
                          />
                          <span className="text-slate-400 font-mono text-[9px]">mm</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="600"
                        step="25"
                        value={primary.cableHoleDiameterMm ?? primary.customProps?.cableHoleDiameterMm ?? primary.customProps?.cableHoleDiameter ?? primary.feederDiameter ?? 250}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateSelected({
                            cableHoleDiameterMm: val,
                            feederDiameter: val,
                            customProps: {
                              ...(primary.customProps || {}),
                              cableHoleDiameterMm: val,
                              cableHoleDiameter: val,
                              feederDiameter: val,
                            },
                          });
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                      />
                      <div className="grid grid-cols-5 gap-1">
                        {[150, 200, 250, 300, 400].map((dia) => {
                          const curDia = primary.cableHoleDiameterMm ?? primary.customProps?.cableHoleDiameterMm ?? primary.customProps?.cableHoleDiameter ?? primary.feederDiameter ?? 250;
                          const active = curDia === dia;
                          return (
                            <button
                              key={dia}
                              type="button"
                              onClick={() =>
                                onUpdateSelected({
                                  cableHoleDiameterMm: dia,
                                  feederDiameter: dia,
                                  customProps: {
                                    ...(primary.customProps || {}),
                                    cableHoleDiameterMm: dia,
                                    cableHoleDiameter: dia,
                                    feederDiameter: dia,
                                  },
                                })
                              }
                              className={`py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                                active
                                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feeder Vertical Level / Elevation */}
                    <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <span>Feeder Vertical Level (Height from Floor):</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1000"
                            max={Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 100)}
                            step="25"
                            value={
                              primary.cableHoleElevationMm ??
                              primary.feederElevationMm ??
                              primary.customProps?.cableHoleElevationMm ??
                              primary.customProps?.feederElevationMm ??
                              Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 350)
                            }
                            onChange={(e) => {
                              const val = Math.max(
                                1000,
                                Math.min(
                                  Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 100),
                                  parseInt(e.target.value, 10) || 2450
                                )
                              );
                              onUpdateSelected({
                                cableHoleElevationMm: val,
                                feederElevationMm: val,
                                customProps: {
                                  ...(primary.customProps || {}),
                                  cableHoleElevationMm: val,
                                  feederElevationMm: val,
                                },
                              });
                            }}
                            className="w-16 px-1 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-center text-xs"
                          />
                          <span className="text-slate-400 font-mono text-[9px]">mm</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max={Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 100)}
                        step="25"
                        value={
                          primary.cableHoleElevationMm ??
                          primary.feederElevationMm ??
                          primary.customProps?.cableHoleElevationMm ??
                          primary.customProps?.feederElevationMm ??
                          Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 350)
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateSelected({
                            cableHoleElevationMm: val,
                            feederElevationMm: val,
                            customProps: {
                              ...(primary.customProps || {}),
                              cableHoleElevationMm: val,
                              feederElevationMm: val,
                            },
                          });
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                      />
                      <div className="flex gap-1 pt-0.5">
                        {[
                          {
                            label: 'Ladder Runway',
                            val: Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 350),
                          },
                          {
                            label: 'Ceiling Flush',
                            val: Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 200),
                          },
                          { label: 'High (2200mm)', val: 2200 },
                        ].map((p) => {
                          const curElev =
                            primary.cableHoleElevationMm ??
                            primary.feederElevationMm ??
                            primary.customProps?.cableHoleElevationMm ??
                            primary.customProps?.feederElevationMm ??
                            Math.round((primary.shelterHeightM || primary.customProps?.shelterHeightM || 2.8) * 1000 - 350);
                          const active = Math.abs(curElev - p.val) < 25;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() =>
                                onUpdateSelected({
                                  cableHoleElevationMm: p.val,
                                  feederElevationMm: p.val,
                                  customProps: {
                                    ...(primary.customProps || {}),
                                    cableHoleElevationMm: p.val,
                                    feederElevationMm: p.val,
                                  },
                                })
                              }
                              className={`flex-1 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                                active
                                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Canvas Dragging Hint */}
              <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/20 text-[10.5px] text-sky-200 flex items-start gap-1.5">
                <span className="text-sky-400 text-xs">💡</span>
                <span className="leading-snug">
                  <strong>Drag Grips on Canvas:</strong> You can also grab and drag the cyan{' '}
                  <strong className="text-sky-300">[DOOR]</strong> grip or amber{' '}
                  <strong className="text-amber-400">[FEEDER]</strong> grip directly along the shelter walls on the canvas!
                </span>
              </div>

              {/* Wall-Mount Air Conditioner Units (Multiple Indoor Units) */}
              {(() => {
                const currentInterior = (primary.interiorObjects || primary.customProps?.interiorObjects || []) as any[];
                const acItems = currentInterior.filter((itm: any) => {
                  const s = String(itm.stencilId || itm.customProps?.stencilType || itm.category || itm.name || '').toLowerCase();
                  return s.includes('ac') || s.includes('split') || s.includes('cool');
                });

                const shelterH = Number(primary.shelterHeightM ?? primary.customProps?.shelterHeightM ?? 3.0);
                const wMm = Math.round(((primary.width || 180) / 20) * 1000);
                const dMm = Math.round(((primary.height || 140) / 20) * 1000);

                // Helper to recompute 2D coordinates for an AC on a given wall
                const calcACCoords = (wall: 'north' | 'south' | 'east' | 'west', offset: number) => {
                  const acW = 1000;
                  const acD = 280;
                  let newX = 0;
                  let newY = 0;
                  let newRot = 0;

                  const wallSpan =
                    wall === 'north' || wall === 'south'
                      ? Math.max(0, wMm - acW)
                      : Math.max(0, dMm - acW);
                  const pos = Math.round(wallSpan * (offset / 100));

                  if (wall === 'north') {
                    newRot = 0;
                    newX = pos;
                    newY = 0;
                  } else if (wall === 'south') {
                    newRot = 180;
                    newX = pos;
                    newY = Math.max(0, dMm - acD);
                  } else if (wall === 'west') {
                    newRot = 270;
                    newX = Math.round(acD / 2 - acW / 2);
                    newY = pos + Math.round(acW / 2 - acD / 2);
                  } else if (wall === 'east') {
                    newRot = 90;
                    newX = Math.round(wMm - acD / 2 - acW / 2);
                    newY = pos + Math.round(acW / 2 - acD / 2);
                  }
                  return { xMm: newX, yMm: newY, rotationDeg: newRot, widthMm: acW, depthMm: acD };
                };

                // Add a new AC Unit
                const handleAddAC = () => {
                  const nextWall: 'north' | 'south' | 'east' | 'west' =
                    acItems.length === 0 ? 'north' : acItems.length === 1 ? 'south' : 'east';
                  const nextOffset = acItems.length % 2 === 0 ? 50 : 70;
                  const nextElevMm = 2200;
                  const coords = calcACCoords(nextWall, nextOffset);

                  const newAcItem = {
                    id: `eq-${Date.now()}-wall-ac-${acItems.length + 1}`,
                    name: `Wall-Mount Inverter AC #${acItems.length + 1}`,
                    category: 'cooling',
                    stencilId: 'wall-mount-ac',
                    widthMm: coords.widthMm,
                    depthMm: coords.depthMm,
                    heightMm: 360,
                    elevationMm: nextElevMm,
                    wallAttachment: nextWall,
                    wallOffsetPct: nextOffset,
                    coolingCapacity: '2.5 HP (24,000 BTU)',
                    targetTempC: 20,
                    xMm: coords.xMm,
                    yMm: coords.yMm,
                    rotationDeg: coords.rotationDeg,
                    color: '#f8fafc',
                    strokeColor: '#0284c7',
                    desc: 'Wall-mounted inverter air conditioner with configurable wall placement and mounting height',
                  };

                  const updatedInterior = [...currentInterior, newAcItem];
                  const updatedProps = {
                    ...(primary.customProps || {}),
                    airconWall: nextWall,
                    airconOffset: nextOffset,
                    airconElevationMm: nextElevMm,
                    airconHeightM: 2.2,
                    interiorObjects: updatedInterior,
                  };

                  onUpdateSelected({
                    interiorObjects: updatedInterior,
                    customProps: updatedProps,
                  });
                };

                // Update a specific AC Unit
                const handleUpdateSpecificAC = (
                  acId: string,
                  updates: {
                    wall?: 'north' | 'south' | 'east' | 'west';
                    offset?: number;
                    elevationMm?: number;
                  }
                ) => {
                  const targetItem = acItems.find((a) => a.id === acId);
                  if (!targetItem) return;

                  const wall = updates.wall ?? targetItem.wallAttachment ?? 'north';
                  const offset = updates.offset ?? targetItem.wallOffsetPct ?? 50;
                  const elev = updates.elevationMm ?? targetItem.elevationMm ?? 2200;
                  const coords = calcACCoords(wall, offset);

                  const updatedInterior = currentInterior.map((itm) => {
                    if (itm.id !== acId) return itm;
                    return {
                      ...itm,
                      wallAttachment: wall,
                      wallOffsetPct: offset,
                      elevationMm: elev,
                      xMm: coords.xMm,
                      yMm: coords.yMm,
                      rotationDeg: coords.rotationDeg,
                    };
                  });

                  onUpdateSelected({
                    interiorObjects: updatedInterior,
                    customProps: {
                      ...(primary.customProps || {}),
                      interiorObjects: updatedInterior,
                    },
                  });
                };

                // Remove a specific AC Unit
                const handleRemoveAC = (acId: string) => {
                  const updatedInterior = currentInterior.filter((itm) => itm.id !== acId);
                  onUpdateSelected({
                    interiorObjects: updatedInterior,
                    customProps: {
                      ...(primary.customProps || {}),
                      interiorObjects: updatedInterior,
                    },
                  });
                };

                return (
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-200">
                          Indoor Wall-Mount Air Conditioners
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                          {acItems.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAC}
                        className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-cyan-600/30"
                      >
                        <Plus className="w-3 h-3" />
                        Add Aircon
                      </button>
                    </div>

                    {acItems.length === 0 ? (
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-2">
                        <p className="text-[11px] text-slate-400">
                          No indoor air conditioning installed in this shelter.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddAC}
                          className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Install Wall-Mount Inverter AC
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {acItems.map((ac, idx) => {
                          const wall = (ac.wallAttachment || 'north') as 'north' | 'south' | 'east' | 'west';
                          const offset = Number(ac.wallOffsetPct ?? 50);
                          const elevMm = Number(ac.elevationMm ?? 2200);
                          const elevM = (elevMm / 1000).toFixed(2);
                          const ceilingClearance = Math.max(0, shelterH - elevMm / 1000).toFixed(2);

                          return (
                            <div
                              key={ac.id || idx}
                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-cyan-300 flex items-center gap-1">
                                  <span>AC #{idx + 1}</span>
                                  <span className="text-[9.5px] font-normal text-slate-400 font-mono">
                                    ({wall.toUpperCase()} · +{elevM}m)
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAC(ac.id)}
                                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Remove this AC unit"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Placement Wall Selector */}
                              <div>
                                <div className="text-[9px] text-slate-400 mb-1 flex justify-between">
                                  <span>Placement Wall:</span>
                                  <span className="font-mono text-cyan-300 capitalize">{wall} Wall</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {(['north', 'south', 'east', 'west'] as const).map((w) => {
                                    const active = wall === w;
                                    return (
                                      <button
                                        key={w}
                                        type="button"
                                        onClick={() => handleUpdateSpecificAC(ac.id, { wall: w })}
                                        className={`py-0.5 text-[9.5px] font-bold rounded capitalize transition-all cursor-pointer ${
                                          active
                                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`}
                                      >
                                        {w}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Position Along Wall Offset */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] text-slate-400">
                                  <span>Position along {wall} wall</span>
                                  <span className="font-mono text-cyan-300 font-bold">{offset}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="15"
                                  max="85"
                                  value={offset}
                                  onChange={(e) =>
                                    handleUpdateSpecificAC(ac.id, { offset: parseInt(e.target.value, 10) })
                                  }
                                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                                />
                                <div className="flex gap-1 pt-0.5">
                                  {[
                                    { label: 'Left (25%)', val: 25 },
                                    { label: 'Center (50%)', val: 50 },
                                    { label: 'Right (75%)', val: 75 },
                                  ].map((p) => (
                                    <button
                                      key={p.val}
                                      type="button"
                                      onClick={() => handleUpdateSpecificAC(ac.id, { offset: p.val })}
                                      className={`flex-1 py-0.5 text-[8.5px] rounded font-mono transition-all cursor-pointer ${
                                        offset === p.val
                                          ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/50'
                                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Height of Placement (Elevation) */}
                              <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3 text-cyan-400" />
                                    Height of Placement:
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={500}
                                      max={Math.round((shelterH - 0.15) * 1000)}
                                      step={50}
                                      value={elevMm}
                                      onChange={(e) =>
                                        handleUpdateSpecificAC(ac.id, {
                                          elevationMm: parseInt(e.target.value, 10) || 2200,
                                        })
                                      }
                                      className="w-14 px-1 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-center text-xs"
                                    />
                                    <span className="text-slate-400 font-mono text-[9px]">mm</span>
                                  </div>
                                </div>

                                <input
                                  type="range"
                                  min="500"
                                  max={Math.round((shelterH - 0.15) * 1000)}
                                  step="50"
                                  value={elevMm}
                                  onChange={(e) =>
                                    handleUpdateSpecificAC(ac.id, {
                                      elevationMm: parseInt(e.target.value, 10),
                                    })
                                  }
                                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                                />

                                {/* Quick Height Presets */}
                                <div className="grid grid-cols-5 gap-1">
                                  {[
                                    { label: '1.8m', mm: 1800 },
                                    { label: '2.0m', mm: 2000 },
                                    { label: '2.2m', mm: 2200 },
                                    { label: '2.4m', mm: 2400 },
                                    { label: '2.6m', mm: 2600 },
                                  ].map((h) => (
                                    <button
                                      key={h.mm}
                                      type="button"
                                      onClick={() => handleUpdateSpecificAC(ac.id, { elevationMm: h.mm })}
                                      className={`py-0.5 rounded text-[8.5px] font-mono cursor-pointer transition-all ${
                                        Math.abs(elevMm - h.mm) < 40
                                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                      }`}
                                    >
                                      {h.label}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center text-[9px] text-slate-400 pt-0.5">
                                  <span>Ceiling clearance:</span>
                                  <span className="font-mono text-emerald-300">
                                    +{ceilingClearance}m below ceiling
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
  );
};
