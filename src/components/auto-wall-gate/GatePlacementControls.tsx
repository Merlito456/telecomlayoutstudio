import React from 'react';
import { DoorClosed } from 'lucide-react';
import { GateWallLocation } from './wall-gate-generator';

interface GatePlacementControlsProps {
  gateLocation: GateWallLocation;
  setGateLocation: (loc: GateWallLocation) => void;
  clampedGateLength: number;
  gateLengthM: number;
  setGateLengthM: (len: number) => void;
  maxGateLength: number;
  gatePositionType: 'center' | 'offset';
  setGatePositionType: (t: 'center' | 'offset') => void;
  gateOffsetM: number;
  setGateOffsetM: (off: number) => void;
  includeGravelYard: boolean;
  setIncludeGravelYard: (inc: boolean) => void;
  includeCornerPosts: boolean;
  setIncludeCornerPosts: (inc: boolean) => void;
}

export const GatePlacementControls: React.FC<GatePlacementControlsProps> = ({
  gateLocation,
  setGateLocation,
  clampedGateLength,
  gateLengthM,
  setGateLengthM,
  maxGateLength,
  gatePositionType,
  setGatePositionType,
  gateOffsetM,
  setGateOffsetM,
  includeGravelYard,
  setIncludeGravelYard,
  includeCornerPosts,
  setIncludeCornerPosts,
}) => {
  return (
    <>
      {/* 3. Gate Location & Dimensions Across Wall */}
      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1 text-[10px]">
            <DoorClosed className="w-3 h-3 text-amber-400" />
            3. Main Access Gate
          </span>
          <span className="font-mono text-amber-400 font-bold text-[11px]">
            {clampedGateLength.toFixed(1)}m on {gateLocation.toUpperCase()}
          </span>
        </div>

        {/* Wall Location Selection */}
        <div>
          <label className="block text-[9.5px] text-slate-400 mb-0.5">
            Gate Wall
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'south' as const, label: 'South (Front)', dir: '↓' },
              { id: 'north' as const, label: 'North (Back)', dir: '↑' },
              { id: 'east' as const, label: 'East (Right)', dir: '→' },
              { id: 'west' as const, label: 'West (Left)', dir: '←' },
            ].map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setGateLocation(w.id)}
                className={`py-0.5 px-1 rounded border font-medium text-[10px] flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  gateLocation === w.id
                    ? 'bg-amber-600/90 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="font-mono text-[9px]">{w.dir}</span>
                <span className="truncate">{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gate Length Across Wall */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div>
            <label className="block text-[9.5px] text-slate-400 mb-0.5">
              Gate Span
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="2"
                max={maxGateLength}
                step="0.5"
                value={gateLengthM}
                onChange={(e) => setGateLengthM(parseFloat(e.target.value) || 4)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white font-mono text-[11px] focus:border-amber-500 focus:outline-none"
              />
              <span className="text-slate-500 font-mono text-[10px]">m</span>
            </div>
          </div>

          <div>
            <label className="block text-[9.5px] text-slate-400 mb-0.5">
              Position
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setGatePositionType('center')}
                className={`py-0.5 px-1.5 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                  gatePositionType === 'center'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                Centered
              </button>
              <button
                type="button"
                onClick={() => setGatePositionType('offset')}
                className={`py-0.5 px-1.5 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                  gatePositionType === 'offset'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                Corner
              </button>
            </div>
          </div>
        </div>

        {gatePositionType === 'offset' && (
          <div className="pt-0.5">
            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
              <span>Offset from Corner:</span>
              <span className="font-mono text-amber-300 font-bold">{gateOffsetM.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="1"
              max={maxGateLength - 2}
              step="0.5"
              value={gateOffsetM}
              onChange={(e) => setGateOffsetM(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 4. Options */}
      <div className="flex items-center gap-4 px-0.5">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeGravelYard}
            onChange={(e) => setIncludeGravelYard(e.target.checked)}
            className="rounded accent-sky-500 w-3 h-3"
          />
          <span className="text-slate-300 text-[10px]">Include Gravel Yard</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeCornerPosts}
            onChange={(e) => setIncludeCornerPosts(e.target.checked)}
            className="rounded accent-sky-500 w-3 h-3"
          />
          <span className="text-slate-300 text-[10px]">Corner Posts</span>
        </label>
      </div>
    </>
  );
};
