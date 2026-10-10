import React, { useState } from 'react';
import {
  Zap,
  Layers,
  Cpu,
  Box,
  Radio,
  FileSpreadsheet,
  Home,
  Server,
  Cable,
  Footprints,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AboutFeaturesTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const featureCards = [
    {
      category: 'cabling',
      icon: <Cable className="w-4 h-4 text-amber-400" />,
      badge: 'Telecom Standard',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      title: 'Auto-Detected Cabling & Color Coding',
      desc: 'Automatic equipment-aware line color coding in 2D drafting, 3D cable laying, and in-shelter routing. Matches industry-standard telecom conventions:',
      bullets: [
        'DC Power (-48V / +24V Blue #0284c7): Rectifiers, battery banks, DC PDUs',
        'Optical Fiber (Amber #f59e0b): OLT subracks, BBU baseband pools, ODFs, DWDM',
        'AC Mains Power (Red #ef4444): ACPDB, ATS, diesel generators, transformers, wall ACs',
        'Indoor Overhead Cable (Yellow #facc15): In-shelter cable ladders, yellow raceways, rack tie lines',
        'Earth Grounding / PE (Green #22c55e): Master Ground Bar (MGB), equipment grounding studs',
        'RF Coaxial Feeder (Slate #475569): Antenna jumpers, tower feeders, shelter feeder holes',
      ],
    },
    {
      category: '3d',
      icon: <Box className="w-4 h-4 text-sky-400" />,
      badge: 'Real-Time WebGL',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      title: 'Interactive 3D Digital Twin & Roam Mode',
      desc: 'Zero-latency spatial twin built with Three.js, synchronized instantly with every 2D modification:',
      bullets: [
        'First-Person Engineer Roam Mode [G key]: Walk compounds, climb tower ladders and overhead cable trays',
        'Interactive Doors & Gates: Click or press [E] to swing compound gates, shelter steel doors, and ODC cabinets',
        'Cinematic Camera Presets: Instant jump to ISO Southwest, Top Plan View, Compound Gate, Tower Base, and Shelter Interior',
        'Dynamic Atmospheric Lighting: Day sunlight, golden hour sunset, stormy overcast, and night inspection lighting with active compound floodlights',
      ],
    },
    {
      category: 'shelter',
      icon: <Home className="w-4 h-4 text-emerald-400" />,
      badge: 'Sub-Application',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      title: 'Dedicated Walk-In Shelter Designer',
      desc: 'Specialized 2D floor plan & 3D cutaway designer for prefabricated concrete and sandwich-panel power shelters:',
      bullets: [
        'Parametric Room Dimensions: Fully configurable length, width, ceiling height (2.4m–4.0m), and wall thickness',
        'Interactive Steel Swing Door: Custom wall placement, hinge offset, swing radius clearance checks, and open/close states',
        'Feeder Cable Gland Window: Configurable wall, horizontal %, diameter (100–400mm), and high elevation matching overhead ladder runway',
        'Interior Equipment Catalog: 18U–48U telecom & server racks, Eltek Flatpack2 rectifiers, lithium battery racks, MGB busbars, and wall-mount inverter ACs',
        'Overhead Cable Ladders: Ceiling-suspended runways mounted 3.5 inches below slab with drop-rod hangers, tees, and cross junctions',
      ],
    },
    {
      category: 'shelter',
      icon: <Server className="w-4 h-4 text-indigo-400" />,
      badge: 'Rack CAD',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      title: '19-Inch Open-Bay Telecom Rack Designer',
      desc: 'Subrack-level equipment planning and vertical space management inside telecom racks and carrier frames:',
      bullets: [
        'Carrier Frame Standards: 42U and 45U 19-inch open-bay and enclosed telecom equipment racks',
        'Chassis Subrack Catalog: Core OLT chassis (Huawei MA5800, ZTE C600, FiberHome AN6000), BBU pools, rectifiers, and ODFs',
        'Orthographic Multi-View: Front elevation, rear cable dressing, and side depth inspection views',
        '3D Interactive Preview: Live LED chassis indicators, exhaust fan grilles, and rear terminal blocks',
      ],
    },
    {
      category: 'cabling',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      badge: 'Continuous 3D',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      title: '3D Cable Routing & Coaxial LTC Glands',
      desc: 'Seamless cable laying over elevated trays, vertical risers, and weatherproof cabinet penetrations:',
      bullets: [
        'Continuous 3D Fluid Routing: Smooth catenary curves resting precisely atop cable ladders and basepads',
        'Liquid-Tight Connectors (LTC): Threaded brass ferrules, hex compression nuts, strain-relief boots, and neoprene seals at cabinet entries',
        '1-Click Auto-Connect: Automatically connects overhead cable ladders to adjacent equipment cabinets and interior racks',
        'Smart Dijkstra Auto-Router: Pathfinding algorithm routing cables through trays and avoiding compound obstacles',
      ],
    },
    {
      category: 'stencils',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      badge: '60+ Stencils',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      title: 'Vendor-Accurate Telecom Stencil Catalog',
      desc: 'Parametric library of field-proven equipment modeled to exact manufacturer dimensions and clearances:',
      bullets: [
        'Outdoor Cabinets (ODC): Eltek 1-Bay/2-Bay, Huawei ODC/Mini ODC, Ericsson ODC, Fushan ODC, FiberHome ODC',
        'Power Infrastructure: Diesel generators (acoustic canopy, exhaust muffler, fuel tank), utility transformers, ATS, ACPDB, MPD, DCPDU, ECB',
        'Transmission Towers: 3-legged triangular lattice towers, 4-legged square lattice towers, monopoles with climbing rungs, guyed masts, rooftop mounts',
        'Civil Works: Automated compound walls, razor-wire crowns, heavy double-leaf vehicle gates, pedestrian gates, basepads, compound stairs',
      ],
    },
    {
      category: 'drafting',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      badge: '5-Layer Stack',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      title: 'Layer Stack, Drafting & Annotation Tools',
      desc: 'Professional drafting workspace with full Photoshop-style layer hierarchy and precision drafting controls:',
      bullets: [
        'Engineering Layer Stack: Annotations & Dimensions, Cabling & Ladders, Active Equipment, Engineered Basepads, Civil & Ground',
        'Precision Drafting: Snap-to-Grid, Ortho Mode (90° constraint), Angle Snapping (15°/45°/90°), and Smart Object Snapping',
        'Annotation & Dimensions: Dynamic dimension lines, callout leaders, text notes with engineering fonts, and live clearance badges',
        'Full History & Clipboard: Multi-level Undo/Redo (Ctrl+Z / Ctrl+Y), Cut, Copy, Paste, Duplicate, Marquee Multi-Select',
      ],
    },
    {
      category: 'export',
      icon: <FileSpreadsheet className="w-4 h-4 text-teal-400" />,
      badge: 'AutoCAD & BIM',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      title: 'DXF CAD Sync, Cable BOM & A3 Printing',
      desc: 'Seamless interoperability with enterprise CAD software, procurement systems, and field construction teams:',
      bullets: [
        'Lossless AutoCAD DXF Sync: Bi-directional DXF import and export preserving layers, blocks, line types, and dimensions',
        'Automated Cable Schedule & BOM: Itemized cable schedules calculating horizontal run, vertical drops, and 5–10% slack margin',
        'Print-Ready A3/A4 Engineering Sheets: Standard ISO title blocks, revision tables, scale bars, and North orientation arrows',
        'Offline PWA & Auto-Save: Instant browser access with IndexedDB offline persistence and zero-data-loss background saving',
      ],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Capabilities (8)' },
    { id: 'cabling', label: 'Cabling & Color Coding' },
    { id: '3d', label: '3D Digital Twin & Roam' },
    { id: 'shelter', label: 'Shelter & Rack Designers' },
    { id: 'stencils', label: 'Equipment & Stencils' },
    { id: 'drafting', label: '2D CAD Drafting' },
    { id: 'export', label: 'DXF, BOM & Print' },
  ];

  const filtered = activeCategory === 'all'
    ? featureCards
    : featureCards.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((feat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  {feat.icon}
                  <span>{feat.title}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full border ${feat.badgeColor}`}>
                  {feat.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                {feat.desc}
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {feat.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
