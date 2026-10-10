import React from "react";
import { CADObject } from "../../types/cad";
import { Layers, ArrowDown, Ruler } from "lucide-react";

interface CableLadderCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
}

export const CableLadderCustomizer: React.FC<CableLadderCustomizerProps> = ({
  primary,
  onUpdateSelected,
}) => {
  const sId = (primary.stencilId || primary.customProps?.stencilType || '').toLowerCase();
  const isLadder =
    sId.includes('ladder') ||
    sId.includes('raceway') ||
    sId.includes('runway') ||
    primary.ladderType !== undefined ||
    primary.customProps?.ladderType !== undefined ||
    (primary as any).category === 'cabling' ||
    primary.customProps?.category === 'cabling';

  if (!isLadder) return null;

  return (
            primary.ladderType !== undefined ||
            primary.customProps?.stencilType?.includes('ladder') ||
            primary.customProps?.ladderType !== undefined) && (() => {
            const currentType = primary.ladderType || primary.customProps?.ladderType || (
              primary.stencilId?.includes('cabin-feeder') ? 'cabin-feeder' :
              primary.stencilId?.includes('indoor') ? 'indoor' :
              primary.stencilId?.includes('connecting') ? 'connecting' : 'basepad'
            );

            const handleSetLadderType = (newType: 'basepad' | 'cabin-feeder' | 'indoor' | 'connecting') => {
              const typeStencilId =
                newType === 'cabin-feeder' ? 'cabin-feeder-ladder' :
                newType === 'indoor' ? 'indoor-ladder' :
                newType === 'connecting' ? 'connecting-ladder' : 'basepad-ladder';

              const newLabelText =
                newType === 'cabin-feeder' ? 'CABIN FEEDER LADDER' :
                newType === 'indoor' ? 'INDOOR SHELTER LADDER' :
                newType === 'connecting' ? 'CONNECTING LADDER' : 'BASEPAD LADDER';

              let updatedChildren = primary.children;
              if (updatedChildren) {
                updatedChildren = updatedChildren.map(c => {
                  if (c.type === 'text' && (c.isStencilLabel || c.parentId === primary.id)) {
                    return { ...c, text: newLabelText };
                  }
                  return c;
                });
              }

              onUpdateSelected({
                ladderType: newType,
                stencilId: typeStencilId,
                children: updatedChildren,
                customProps: {
                  ...(primary.customProps || {}),
                  stencilType: typeStencilId,
                  ladderType: newType,
                  placement: newType,
                },
              });
            };

            const typeConfigMap: Record<string, {
              label: string;
              badge: string;
              color: string;
              badgeBg: string;
              desc: string;
              elevationInfo: string;
            }> = {
              'basepad': {
                label: 'Basepad Ladder',
                badge: 'Basepad Surface',
                color: 'sky',
                badgeBg: 'bg-sky-950 text-sky-300 border-sky-800',
                desc: 'A ladder laid on the top surface of basepad (existing low-profile tray resting flush on equipment plinth).',
                elevationInfo: 'Sits flush on basepad surface (y ~ 0.35m)',
              },
              'cabin-feeder': {
                label: 'Cabin Feeder Ladder',
                badge: 'Elevated Feeder',
                color: 'blue',
                badgeBg: 'bg-blue-950 text-blue-300 border-blue-800',
                desc: 'A ladder connected at the indoor (in shelter) ladder to outside of the shelter elevated from the ground.',
                elevationInfo: 'Elevated bridge (~2.2m above ground) on structural bent stanchions',
              },
              'indoor': {
                label: 'In-Shelter Cable Ladder',
                badge: 'Indoor Ceiling',
                color: 'amber',
                badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
                desc: 'In shelter cable ladder / indoor ladder - used inside the shelter suspended from ceiling.',
                elevationInfo: 'Suspended from ceiling (~2.2m indoor) with threaded drop-rods',
              },
              'connecting': {
                label: 'Connecting Ladder',
                badge: 'Transition Bridge',
                color: 'emerald',
                badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                desc: 'Connecting ladder - use to connect the basepad ladder to the cabin feeder ladder or basepad ladder to the tower climbing ladder.',
                elevationInfo: 'Angled transition ramp bridging low basepad to elevated feeder/tower',
              },
            };

            const typeConfig = typeConfigMap[currentType] || {
              label: 'Basepad Ladder',
              badge: 'Basepad Surface',
              color: 'sky',
              badgeBg: 'bg-sky-950 text-sky-300 border-sky-800',
              desc: 'A ladder laid on the top surface of basepad (existing).',
              elevationInfo: 'Resting on basepad top surface',
            };

            return (
              <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40 space-y-2.5 shadow-md shadow-sky-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-sky-400" />
                    Ladder Placement Type
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${typeConfig.badgeBg}`}>
                    {typeConfig.badge}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[10px] space-y-1.5">
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                    {typeConfig.label}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[9.5px]">
                    {typeConfig.desc}
                  </p>
                  <div className="text-[9px] text-slate-400 pt-0.5 font-mono border-t border-slate-800/80 mt-1">
                    Elevation Profile: <span className="text-sky-300 font-medium">{typeConfig.elevationInfo}</span>
                  </div>
                </div>

                {/* 4 Ladder Types Selection Buttons */}
                <div className="space-y-1">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Placement & Function:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetLadderType('basepad')}
                      className={`py-2 px-2 text-[10px] rounded-lg cursor-pointer transition-all flex flex-col items-start gap-0.5 text-left border ${
                        currentType === 'basepad'
                          ? 'bg-sky-600/90 text-white font-bold border-sky-400 shadow-md shadow-sky-900/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        1. Basepad
                      </span>
                      <span className="text-[8.5px] opacity-80 leading-tight">
                        Laid on top surface of basepad
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetLadderType('cabin-feeder')}
                      className={`py-2 px-2 text-[10px] rounded-lg cursor-pointer transition-all flex flex-col items-start gap-0.5 text-left border ${
                        currentType === 'cabin-feeder'
                          ? 'bg-blue-600/90 text-white font-bold border-blue-400 shadow-md shadow-blue-900/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        2. Cabin Feeder
                      </span>
                      <span className="text-[8.5px] opacity-80 leading-tight">
                        Indoor to outside, elevated
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetLadderType('indoor')}
                      className={`py-2 px-2 text-[10px] rounded-lg cursor-pointer transition-all flex flex-col items-start gap-0.5 text-left border ${
                        currentType === 'indoor'
                          ? 'bg-amber-600/90 text-white font-bold border-amber-400 shadow-md shadow-amber-900/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        3. In-Shelter
                      </span>
                      <span className="text-[8.5px] opacity-80 leading-tight">
                        Indoor ceiling + yellow duct
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetLadderType('connecting')}
                      className={`py-2 px-2 text-[10px] rounded-lg cursor-pointer transition-all flex flex-col items-start gap-0.5 text-left border ${
                        currentType === 'connecting'
                          ? 'bg-emerald-600/90 text-white font-bold border-emerald-400 shadow-md shadow-emerald-900/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        4. Connecting
                      </span>
                      <span className="text-[8.5px] opacity-80 leading-tight">
                        Connects pad to feeder/tower
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })(  );
};
