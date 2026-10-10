import React from 'react';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const AboutAdvantagesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Strategic Comparison Matrix */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50 shadow-lg">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Telecom Site Layout Studio vs. Traditional Drafting Tools
          </span>
          <span className="text-[11px] font-mono text-sky-400">Enterprise Engineering Benchmark</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700">
                <th className="py-2.5 px-4 font-bold w-1/4">Capability / Workflow</th>
                <th className="py-2.5 px-4 font-bold text-rose-400 w-3/8">Traditional CAD (AutoCAD / Visio / Revit)</th>
                <th className="py-2.5 px-4 font-bold text-sky-400 w-3/8">Telecom Site Layout Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Setup, Cost &amp; Accessibility</td>
                <td className="py-3 px-4 text-slate-400">
                  Heavy 10GB+ workstation installs, $2,200+/year per seat license, hardware dongles, PC-only lock-in
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Instant browser access, zero installation, offline-first PWA, free open workflow on any device
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Domain Intelligence &amp; Stencils</td>
                <td className="py-3 px-4 text-slate-400">
                  Generic blank rectangles; engineers redraw stencils from scratch and cross-check vendor manuals manually
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  60+ built-in manufacturer-accurate stencils (Eltek, Huawei, Ericsson, Fushan ODC, lattice towers, generators)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">In-Shelter Cabling &amp; Color Coding</td>
                <td className="py-3 px-4 text-slate-400">
                  Manual lines requiring manual coloring; no equipment awareness or layer elevation logic
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Auto-detected color coding (DC -48V Blue, Fiber Amber, AC Red, Ground Green, Indoor Yellow, Coax Slate)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">3D Digital Twin &amp; Site Roam</td>
                <td className="py-3 px-4 text-slate-400">
                  Separate 3D modeling packages (SketchUp/3ds Max); requires dedicated 3D visualizers and days of export work
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Instant 0ms synchronized 3D twin, first-person engineer walk/climb mode [G], interactive doors &amp; weather rigs
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Dedicated Shelter &amp; Rack Design</td>
                <td className="py-3 px-4 text-slate-400">
                  Requires separate architectural CAD files, manual ceiling drop-rod calculations, and disconnected Visio rack elevations
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Integrated Shelter Designer (parametric walls, door swing, feeder windows) and 42U/45U Open-Bay Rack Designer
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Compound Walls &amp; Security Gates</td>
                <td className="py-3 px-4 text-slate-400">
                  Manual perimeter math, corner pillar spacing, and vehicle swing clearance checks (45+ minutes)
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  1-Click Auto Wall &amp; Gate generator with razor wire crowns and vehicle access clearances in 3 seconds
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Cable BOM &amp; Length Estimation</td>
                <td className="py-3 px-4 text-slate-400">
                  Manual polyline measurement, manual vertical drop calculations, error-prone spreadsheets causing ordering mistakes
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Automated Site Cable Schedule: exact horizontal run + vertical ladder drops + 5–10% slack margin calculation
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">CAD Interoperability &amp; Print</td>
                <td className="py-3 px-4 text-slate-400">
                  Complex plot styles (.ctb), font missing errors, heavy DWG file dependencies
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Bi-directional AutoCAD DXF import/export, 1-click A3/A4 landscape prints with engineering title blocks
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Measurable ROI & Value Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">96% Faster</div>
            <div className="text-xs text-sky-400 font-semibold">Turnaround Time</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Reduces site drafting from 4–8 business days to under 15 minutes, accelerating site acquisition approvals.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">$2,500+ Saved</div>
            <div className="text-xs text-emerald-400 font-semibold">Per Engineer Annually</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Eliminates expensive proprietary CAD seat licenses, specialized hardware requirements, and training bottlenecks.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">~95% Less Rework</div>
            <div className="text-xs text-amber-400 font-semibold">Zero Field Clashes</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Clearance checks and 3D digital twin verification catch door swing clashes and ladder misalignments before concrete is poured.
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Callout Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-white font-semibold block mb-0.5">
            Engineered Specifically for Telecom Infrastructure
          </span>
          Unlike generic architectural drawing packages, every tool, measurement unit, stencil, and calculation in Telecom Site Layout Studio is tailor-made for cellular macro sites, small cells, optical OLT hubs, and power shelters—delivering unmatched drafting speed and zero-friction handover to civil engineering teams.
        </div>
      </div>
    </div>
  );
};
