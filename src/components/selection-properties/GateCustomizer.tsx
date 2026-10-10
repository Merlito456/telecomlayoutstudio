import React from "react";
import { CADObject, ProjectSettings } from "../../types/cad";
import { DoorOpen, DoorClosed, Lock, Unlock } from "lucide-react";

interface GateCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  settings?: ProjectSettings;
}

export const GateCustomizer: React.FC<GateCustomizerProps> = ({
  primary,
  onUpdateSelected,
  settings,
}) => {
  const isGate =
    primary.stencilId === "gate-2door" ||
    primary.stencilId?.includes("gate") ||
    primary.customProps?.stencilType?.includes("gate");

  if (!isGate) return null;

  const scaleFactor = settings?.scaleFactor || 20;

  return (
            <div className="space-y-3 p-3 rounded-xl bg-gradient-to-b from-sky-950/40 to-slate-900/80 border border-sky-500/40 shadow-sm ring-1 ring-sky-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DoorClosed className="w-3.5 h-3.5 text-sky-400" />
                  Double-Leaf Security Gate
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700/50">
                  {primary.width && primary.height ? `${(Math.max(primary.width, primary.height) / scaleFactor).toFixed(1)}m Span` : 'Closed'}
                </span>
              </div>

              {/* Gate Height Selector */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span>Gate Height AGL</span>
                  <span className="font-mono text-sky-300 font-bold">
                    {(primary.customProps?.gateHeightM ?? 2.0).toFixed(1)}m
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[2.0, 2.5, 3.0, 4.0].map((hVal) => {
                    const currentH = primary.customProps?.gateHeightM ?? 2.0;
                    const active = Math.abs(currentH - hVal) < 0.1;
                    return (
                      <button
                        key={hVal}
                        type="button"
                        onClick={() =>
                          onUpdateSelected({
                            customProps: {
                              ...(primary.customProps || {}),
                              gateHeightM: hVal,
                            },
                          })
                        }
                        className={`py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                          active
                            ? 'bg-sky-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-900/40'
                        }`}
                      >
                        {hVal.toFixed(1)}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gate Open / Close State (Key 'Z') */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    {primary.doorsOpen ? <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> : <DoorClosed className="w-3.5 h-3.5 text-amber-400" />}
                    Gate Position State
                  </span>
                  <span className="font-mono text-sky-300 font-bold text-[10px]">
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
                    className={`py-1.5 text-[10px] font-medium rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !primary.doorsOpen
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
                    }`}
                  >
                    <DoorClosed className="w-3.5 h-3.5" />
                    <span>Closed Gate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSelected({
                        doorsOpen: true,
                        customProps: { ...(primary.customProps || {}), doorsOpen: true, isClosed: false },
                      })
                    }
                    className={`py-1.5 text-[10px] font-medium rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      primary.doorsOpen
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
                    }`}
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span>Open Gate [Key Z]</span>
                  </button>
                </div>
              </div>

              {/* Handle & Lock Status Note */}
              <div className="text-[9px] text-sky-200/90 bg-sky-950/60 p-2 rounded-lg border border-sky-800/40 flex items-start gap-1.5 leading-relaxed">
                <span className="text-sky-400 font-bold shrink-0">✔</span>
                <span>
                  <strong>Height-Adjusted Handle & Drop Pin:</strong> If the gate is extended or positioned in an excavated area, the handle, latch, and drop pin adjust automatically with the new height so they remain at the perfect ergonomic reach.
                </span>
              </div>
            </div>
            );
};
