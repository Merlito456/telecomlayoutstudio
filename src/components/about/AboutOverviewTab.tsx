import React from 'react';
import { Compass, Zap, Shield } from 'lucide-react';

export const AboutOverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/90 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="flex items-center gap-2.5 text-sky-400 mb-2.5 font-bold text-sm tracking-wide uppercase">
            <Compass className="w-4 h-4" />
            <span>Our Mission</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            To empower telecommunications rollout engineers, site acquisition managers, and infrastructure contractors with an agile, high-precision, zero-friction 2D CAD drafting and real-time 3D simulation platform specifically built for telecom compound layouts, equipment pad coordination, cable ladder routing, power shelters, and transmission towers.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/90 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center gap-2.5 text-indigo-400 mb-2.5 font-bold text-sm tracking-wide uppercase">
            <Zap className="w-4 h-4" />
            <span>Our Vision</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            To establish the global engineering standard for rapid telecom site layout planning—compressing weeks of traditional drafting cycles into minutes, eliminating physical field rework, and delivering flawless 2D architectural site plans synchronized with interactive 3D digital twins before construction begins.
          </p>
        </div>
      </div>

      {/* Engineering Scope */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Purpose-Built for Optical &amp; Wireless Rollouts</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Developed from firsthand telecom field experience at <strong>Nokia Shanghai Bell</strong>, this studio solves the real-world operational challenges of deploying Optical Line Terminals (OLT), Fiber-to-the-Home (FTTH) hubs, Eltek/Huawei/Ericsson/Fushan ODC outdoor cabinets, continuous feeder cabling on elevated cable ladders with coaxial Liquid-Tight Connectors (LTC), generator power failover systems, compound security perimeters, and multi-leg transmission towers.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-xl font-bold font-mono text-sky-400">100%</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">True-Scale 2D/3D CAD</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-xl font-bold font-mono text-emerald-400">0 ms</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">2D to 3D Sync</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">60+</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Telecom Stencils</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">DXF / A3</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">AutoCAD &amp; Print Ready</div>
        </div>
      </div>
    </div>
  );
};
