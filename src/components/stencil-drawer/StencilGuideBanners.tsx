import React from 'react';
import { Shield, Server } from 'lucide-react';
import { StencilCategory } from '../../types/cad';

interface StencilGuideBannersProps {
  selectedCategory: StencilCategory | 'all';
  search: string;
  onOpenAutoWallGateModal?: () => void;
  onOpenShelterDesigner?: () => void;
  onCloseDrawer: () => void;
}

export const StencilGuideBanners: React.FC<StencilGuideBannersProps> = ({
  selectedCategory,
  search,
  onOpenAutoWallGateModal,
  onOpenShelterDesigner,
  onCloseDrawer,
}) => {
  if (search) return null;

  return (
    <>
      {/* Dedicated Shelter Interior Design Studio Banner */}
      {onOpenShelterDesigner &&
        (selectedCategory === 'all' ||
          selectedCategory === 'shelter' ||
          selectedCategory === 'cabinets') && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between shadow-sm gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded bg-amber-500/15 text-amber-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">
                  Shelter Interior Design Studio
                </div>
                <div className="text-[9.5px] text-amber-200/80 leading-tight">
                  Shelters add empty — focus &amp; place racks, AC, height &amp; ceiling cable ladder
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onCloseDrawer();
                onOpenShelterDesigner();
              }}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              Open Page
            </button>
          </div>
        )}

      {/* Automated Site Perimeter Wall & Gate Generator Banner */}
      {onOpenAutoWallGateModal && (selectedCategory === 'all' || selectedCategory === 'gate') && (
        <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-sky-500/10 text-sky-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white">Auto Site Wall & Gate</div>
              <div className="text-[9.5px] text-slate-400 leading-tight">Enclose compound with custom gate</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onCloseDrawer();
              onOpenAutoWallGateModal();
            }}
            className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold transition-all shadow-sm cursor-pointer shrink-0"
          >
            Generate
          </button>
        </div>
      )}

      {/* Core Structural Designs Guide Banner when viewing Towers or All */}
      {(selectedCategory === 'all' || selectedCategory === 'tower') && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-sky-950/40 border border-amber-500/30 shadow-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              📡 Core Structural Designs
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              5 Primary Types
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Standard telecom structural engineering configurations for ground site planning and rooftop deployment:
          </p>
          <div className="grid grid-cols-1 gap-1.5 text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">• Monopoles:</span>
              <span>1 leg. Single, thick, tapered steel pole.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">• 3-Leg Lattice:</span>
              <span>Triangular base. Highly common, uses less steel and is cost-effective.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">• 4-Leg Lattice:</span>
              <span>Square base. Offers maximum stability for heavy equipment loads.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">• Guyed Towers:</span>
              <span>1 main leg (central mast) supported by multiple ground-anchored steel cables.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">• Rooftop Mounts:</span>
              <span>No traditional legs. Ballast mount or steel frame on flat concrete roof.</span>
            </div>
          </div>
        </div>
      )}

      {/* Official White Cabinets Guide Banner when viewing Cabinets */}
      {selectedCategory === 'cabinets' && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-sky-950/30 to-indigo-950/40 border border-sky-500/30 shadow-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
              🗄️ Official White Telecom Cabinets
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
              Pure White RAL 9003
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Standard outdoor equipment enclosures in official pure white powder-coated finishes with brand-accurate ventilation, canopies, and locks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold shrink-0">• Huawei:</span>
              <span>APM30H / BTS3900 (1-Bay, 2-Bay, Mini ODC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold shrink-0">• Fushan:</span>
              <span>Power & Battery Enclosure (1-Bay, 2-Bay, Mini ODC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-bold shrink-0">• Ericsson:</span>
              <span>Enclosure 6130 / 6102 (1-Bay, 2-Bay, Mini ODC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold shrink-0">• FH ODC:</span>
              <span>FiberHome Optical Cross-Connect (1-Bay, 2-Bay, Mini ODC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold shrink-0">• Eltek:</span>
              <span>Flatpack2 Power & Battery Enclosure (1-Bay, 2-Bay, Mini ODC, ODC)</span>
            </div>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 bg-slate-950/60 p-2 rounded-lg text-[10px] space-y-1">
            <span className="text-amber-400 font-bold block">📐 Cabinet Height Specifications:</span>
            <div className="grid grid-cols-1 gap-0.5 text-[10px] text-slate-300">
              <div>• <strong className="text-white">1-Bay & 2-Bay:</strong> Equal height (1.0 full standard)</div>
              <div>• <strong className="text-white">Fushan & ODC:</strong> Equal height (4/10 of 1-Bay)</div>
              <div>• <strong className="text-white">All Mini ODC:</strong> 3.5/10 of 1-Bay</div>
            </div>
          </div>
        </div>
      )}

      {/* Official Rectifier System Guide Banner */}
      {selectedCategory === 'rectifier-system' && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 shadow-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              🔋 -48V DC Telecom Rectifier Systems
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              Telecom Standard Power Plants
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Integrated 42U telecom DC power racks featuring modular hot-swappable rectifiers, DC-PDU distribution breaker panels, digital controllers, stacked 4-tier Smart Lithium ESM batteries, and hinged perforated honeycomb mesh doors:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold shrink-0">• Ericsson RS:</span>
              <span>BBS 6102 / RBS Power Plant with Smart-Li ESMs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold shrink-0">• Eltek RS:</span>
              <span>Flatpack2 HE with Smartpack Touch Controller</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold shrink-0">• ZTE RS:</span>
              <span>ZXDU68 S501/T601 with ZXD3000 Modules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold shrink-0">• Huawei RS:</span>
              <span>ETP48400-C4A1 / ETP48200 PowerStar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-bold shrink-0">• Vertiv RS:</span>
              <span>NetSure 731 / 5100 with eSure R48-3200e</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">• Delta RS:</span>
              <span>DPR 2900B Modular -48V DC Power Plant</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
