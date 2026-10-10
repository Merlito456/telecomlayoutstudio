import React, { useState, useEffect } from "react";
import { CADObject, ProjectSettings } from "../../types/cad";
import { Scale, Lock, Unlock } from "lucide-react";

interface TransformCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, cascadeToChildren?: boolean) => void;
  settings: ProjectSettings;
  onScaleSelected?: (multiplier: number) => void;
}

export const TransformCustomizer: React.FC<TransformCustomizerProps> = ({
  primary,
  onUpdateSelected,
  settings,
  onScaleSelected,
}) => {
  const [posX, setPosX] = useState("");
  const [posY, setPosY] = useState("");
  const [sizeW, setSizeW] = useState("");
  const [sizeH, setSizeH] = useState("");
  const [ratioLocked, setRatioLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isEditingInput, setIsEditingInput] = useState(false);

  useEffect(() => {
    if (!isEditingInput && primary) {
      setPosX(Math.round(primary.x).toString());
      setPosY(Math.round(primary.y).toString());
      setSizeW(Math.round(primary.width).toString());
      setSizeH(Math.round(primary.height).toString());
      if (primary.height > 0) {
        setAspectRatio(primary.width / primary.height);
      }
    }
  }, [primary?.x, primary?.y, primary?.width, primary?.height, isEditingInput]);

  const handleApplyPosition = (newX?: number, newY?: number) => {
    if (!primary) return;
    const x = newX !== undefined ? newX : parseFloat(posX) || primary.x;
    const y = newY !== undefined ? newY : parseFloat(posY) || primary.y;
    onUpdateSelected({ x, y });
  };

  const handleApplySize = (newW?: number, newH?: number) => {
    if (!primary) return;
    let w = newW !== undefined ? newW : parseFloat(sizeW) || primary.width;
    let h = newH !== undefined ? newH : parseFloat(sizeH) || primary.height;

    if (ratioLocked && newW !== undefined) {
      h = Math.round(w / aspectRatio);
      setSizeH(h.toString());
    } else if (ratioLocked && newH !== undefined) {
      w = Math.round(h * aspectRatio);
      setSizeW(w.toString());
    }

    onUpdateSelected({ width: Math.max(4, w), height: Math.max(4, h) }, true);
  };

  if (!primary) return null;

  return (
    <>
      {/* Transform: Position X, Y */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Position
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <span className="text-[10px] text-slate-500 font-mono w-4">X</span>
            <input
              type="number"
              value={posX}
              onFocus={() => setIsEditingInput(true)}
              onBlur={() => {
                setIsEditingInput(false);
                handleApplyPosition();
              }}
              onChange={(e) => setPosX(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPosition()}
              className="w-full bg-transparent text-xs text-sky-200 focus:outline-none text-right font-mono"
            />
            <span className="text-[9px] text-slate-600 ml-1">px</span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <span className="text-[10px] text-slate-500 font-mono w-4">Y</span>
            <input
              type="number"
              value={posY}
              onFocus={() => setIsEditingInput(true)}
              onBlur={() => {
                setIsEditingInput(false);
                handleApplyPosition();
              }}
              onChange={(e) => setPosY(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPosition()}
              className="w-full bg-transparent text-xs text-sky-200 focus:outline-none text-right font-mono"
            />
            <span className="text-[9px] text-slate-600 ml-1">px</span>
          </div>
        </div>
      </div>

      {/* Transform: Size Width, Height with Aspect Ratio Lock & Direct Real Unit Input */}
      {primary.width !== undefined && primary.height !== undefined && (
        <div className="space-y-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              Dimensions &amp; Resize
            </span>
            <button
              type="button"
              onClick={() => setRatioLocked(!ratioLocked)}
              title={ratioLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                ratioLocked
                  ? "text-sky-300 bg-sky-950/80 border border-sky-500/50"
                  : "text-slate-500 hover:text-slate-300 bg-slate-800"
              }`}
            >
              {ratioLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
              <span>{ratioLocked ? "Locked" : "Free"}</span>
            </button>
          </div>

          {/* Direct Input in Real World Units (Meters / Feet) */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block">
              Real Physical Size ({settings.unit})
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-sky-500 rounded px-2 py-1">
                <span className="text-[10px] text-sky-400 font-mono w-4 font-bold">W</span>
                <input
                  type="number"
                  step="0.1"
                  value={((parseFloat(sizeW) || primary.width) / settings.scaleFactor).toFixed(2)}
                  onChange={(e) => {
                    const mVal = parseFloat(e.target.value);
                    if (!isNaN(mVal) && mVal > 0) {
                      const pxVal = Math.round(mVal * settings.scaleFactor);
                      setSizeW(pxVal.toString());
                      handleApplySize(pxVal, undefined);
                    }
                  }}
                  className="w-full bg-transparent text-xs text-white focus:outline-none text-right font-mono"
                />
                <span className="text-[9px] text-sky-400 ml-1 font-mono">{settings.unit}</span>
              </div>

              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-sky-500 rounded px-2 py-1">
                <span className="text-[10px] text-sky-400 font-mono w-4 font-bold">H</span>
                <input
                  type="number"
                  step="0.1"
                  value={((parseFloat(sizeH) || primary.height) / settings.scaleFactor).toFixed(2)}
                  onChange={(e) => {
                    const mVal = parseFloat(e.target.value);
                    if (!isNaN(mVal) && mVal > 0) {
                      const pxVal = Math.round(mVal * settings.scaleFactor);
                      setSizeH(pxVal.toString());
                      handleApplySize(undefined, pxVal);
                    }
                  }}
                  className="w-full bg-transparent text-xs text-white focus:outline-none text-right font-mono"
                />
                <span className="text-[9px] text-sky-400 ml-1 font-mono">{settings.unit}</span>
              </div>
            </div>
          </div>

          {/* Pixel dimensions inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800/80 rounded px-2 py-1">
              <span className="text-[9px] text-slate-500 font-mono w-4">px W</span>
              <input
                type="number"
                value={sizeW}
                onFocus={() => setIsEditingInput(true)}
                onBlur={() => {
                  setIsEditingInput(false);
                  handleApplySize();
                }}
                onChange={(e) => setSizeW(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplySize()}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none text-right font-mono"
              />
              <span className="text-[9px] text-slate-600 ml-1">px</span>
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800/80 rounded px-2 py-1">
              <span className="text-[9px] text-slate-500 font-mono w-4">px H</span>
              <input
                type="number"
                value={sizeH}
                onFocus={() => setIsEditingInput(true)}
                onBlur={() => {
                  setIsEditingInput(false);
                  handleApplySize();
                }}
                onChange={(e) => setSizeH(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplySize()}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none text-right font-mono"
              />
              <span className="text-[9px] text-slate-600 ml-1">px</span>
            </div>
          </div>

          {/* Quick Scale Presets Multipliers */}
          <div>
            <span className="text-[9px] text-slate-400 font-medium block mb-1">
              Quick Scale Multipliers
            </span>
            <div className="grid grid-cols-5 gap-1">
              {[
                { label: "0.5×", mult: 0.5 },
                { label: "0.75×", mult: 0.75 },
                { label: "1.25×", mult: 1.25 },
                { label: "1.5×", mult: 1.5 },
                { label: "2.0×", mult: 2.0 },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    if (onScaleSelected) {
                      onScaleSelected(s.mult);
                    } else {
                      const nw = Math.max(4, Math.round(primary.width * s.mult));
                      const nh = Math.max(4, Math.round(primary.height * s.mult));
                      setSizeW(nw.toString());
                      setSizeH(nh.toString());
                      onUpdateSelected({ width: nw, height: nh }, true);
                    }
                  }}
                  className="py-1 px-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded text-[10px] font-mono text-center transition-colors cursor-pointer border border-slate-700/60"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Meter Step Increments */}
          <div className="grid grid-cols-4 gap-1">
            {[-1.0, -0.5, 0.5, 1.0].map((stepM) => (
              <button
                key={stepM}
                type="button"
                onClick={() => {
                  const deltaPx = stepM * settings.scaleFactor;
                  const nw = Math.max(4, Math.round(primary.width + deltaPx));
                  let nh = primary.height;
                  if (ratioLocked && aspectRatio > 0) {
                    nh = Math.max(4, Math.round(nw / aspectRatio));
                  } else {
                    nh = Math.max(4, Math.round(primary.height + deltaPx));
                  }
                  setSizeW(nw.toString());
                  setSizeH(nh.toString());
                  onUpdateSelected({ width: nw, height: nh }, true);
                }}
                className="py-0.5 px-1 bg-slate-800/80 hover:bg-sky-950/80 hover:text-sky-300 text-slate-400 rounded text-[9px] font-mono text-center transition-colors cursor-pointer border border-slate-800"
              >
                {stepM > 0 ? `+${stepM}m` : `${stepM}m`}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
