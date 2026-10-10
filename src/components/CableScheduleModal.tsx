/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CADObject, ProjectSettings, ViewportState } from '../types/cad';
import {
  calculateSiteCableSchedule,
  generateCableScheduleCSV,
  CableCategoryType,
  CABLE_TYPE_DEFINITIONS,
  formatCableDisplay,
} from '../utils/cad-geometry/cable-length-calculator';
import {
  X,
  Zap,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface CableScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  objects: CADObject[];
  settings: ProjectSettings;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  addToast: (type: 'info' | 'success' | 'warning' | 'error', message: string, title?: string) => void;
}

export const CableScheduleModal: React.FC<CableScheduleModalProps> = ({
  isOpen,
  onClose,
  objects,
  settings,
  setViewport,
  setSelectedIds,
  addToast,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | CableCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const schedule = useMemo(() => {
    return calculateSiteCableSchedule(objects, settings.scaleFactor);
  }, [objects, settings.scaleFactor]);

  const filteredItems = useMemo(() => {
    return schedule.items.filter((item) => {
      if (selectedFilter !== 'all' && item.type !== selectedFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.tag.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.fromEquipment.toLowerCase().includes(q) ||
          item.toEquipment.toLowerCase().includes(q) ||
          item.specs.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [schedule.items, selectedFilter, searchQuery]);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvData = generateCableScheduleCSV(schedule, settings.fileName);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${settings.fileName || 'Site'}_Cable_Schedule_BOM.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Exported Cable Schedule CSV');
  };

  const handleCopySummary = () => {
    const summaryText = [
      `TELECOM SITE CABLE SCHEDULE - ${settings.fileName || 'Site Plan'}`,
      `Total Cable Run: ${schedule.grandTotalLengthM.toFixed(2)}m (${schedule.grandTotalLengthFt.toFixed(1)}ft) across ${schedule.totalCableCount} cable runs.`,
      `DC Power: ${schedule.totalsByCategory['dc-power'].lengthM.toFixed(2)}m`,
      `AC Mains: ${schedule.totalsByCategory['ac-power'].lengthM.toFixed(2)}m`,
      `Optical Fiber: ${schedule.totalsByCategory['fiber'].lengthM.toFixed(2)}m`,
      `Grounding PE: ${schedule.totalsByCategory['ground'].lengthM.toFixed(2)}m`,
      `RF Coaxial: ${schedule.totalsByCategory['rf-coax'].lengthM.toFixed(2)}m`,
      `Cable Trays & Ladders: ${schedule.totalContainmentLengthM.toFixed(2)}m`,
    ].join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    addToast('info', 'Cable summary copied to clipboard');
  };

  const handleLocateCable = (cableId: string) => {
    const target = objects.find((o) => o.id === cableId);
    if (target) {
      setSelectedIds([cableId]);
      // Center camera viewport on this cable
      const cx = target.x + (target.width || 0) / 2;
      const cy = target.y + (target.height || 0) / 2;
      setViewport((prev) => ({
        ...prev,
        panX: window.innerWidth / 2 - cx * prev.zoom,
        panY: window.innerHeight / 2 - cy * prev.zoom,
      }));
      onClose();
      addToast('info', `Focused on cable ${cableId.substring(0, 8)}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
              <Zap className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Cable Schedule &amp; Automatic Length Calculator
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Auto-Calculated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated bill of materials for all DC power, AC feeds, optical fiber, grounding, and RF lines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-sky-500/40 shadow-sm">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Cable Run</span>
            <span className="text-base sm:text-lg font-mono font-bold text-sky-300 block">
              {formatCableDisplay(schedule.grandTotalLengthM, settings)}
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {schedule.totalCableCount} routes
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> DC Power
            </span>
            <span className="text-base font-mono font-bold text-slate-200 block">
              {schedule.totalsByCategory['dc-power'].lengthM.toFixed(1)}m
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {schedule.totalsByCategory['dc-power'].count} runs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> AC Mains
            </span>
            <span className="text-base font-mono font-bold text-slate-200 block">
              {schedule.totalsByCategory['ac-power'].lengthM.toFixed(1)}m
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {schedule.totalsByCategory['ac-power'].count} runs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Fiber
            </span>
            <span className="text-base font-mono font-bold text-slate-200 block">
              {schedule.totalsByCategory['fiber'].lengthM.toFixed(1)}m
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {schedule.totalsByCategory['fiber'].count} runs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Grounding
            </span>
            <span className="text-base font-mono font-bold text-slate-200 block">
              {schedule.totalsByCategory['ground'].lengthM.toFixed(1)}m
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {schedule.totalsByCategory['ground'].count} runs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Trays/Ladders
            </span>
            <span className="text-base font-mono font-bold text-slate-200 block">
              {schedule.totalContainmentLengthM.toFixed(1)}m
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {schedule.totalsByCategory['ladder-tray'].count} spans
            </span>
          </div>
        </div>

        {/* Toolbar: Category Filters, Search, CSV Export */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({schedule.items.length})
            </button>

            {(
              [
                'dc-power',
                'ac-power',
                'fiber',
                'ground',
                'rf-coax',
                'cat6',
                'ladder-tray',
              ] as CableCategoryType[]
            ).map((cKey) => {
              const meta = CABLE_TYPE_DEFINITIONS[cKey];
              const count = schedule.totalsByCategory[cKey].count;
              if (count === 0 && selectedFilter !== cKey) return null;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedFilter(cKey)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedFilter === cKey
                      ? 'bg-slate-800 text-white border border-sky-400 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: meta.defaultColor }}
                  />
                  <span>{meta.label.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] text-slate-500">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search cables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-36 sm:w-48"
              />
            </div>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Download CSV for Excel / ERP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Cable List Table */}
        <div className="flex-1 overflow-y-auto min-h-[260px] p-2 sm:p-4">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Zap className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No cables found matching current criteria</p>
              <p className="text-xs text-slate-500 mt-1">
                Draw lines or polylines, or lay 3D cables between equipment to have them calculated automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    <th className="py-2.5 px-3">Tag &amp; Type</th>
                    <th className="py-2.5 px-3">Connected Route (Origin ➔ Dest)</th>
                    <th className="py-2.5 px-3 text-right">2D Run</th>
                    <th className="py-2.5 px-3 text-right">Vert Drop</th>
                    <th className="py-2.5 px-3 text-right">Slack</th>
                    <th className="py-2.5 px-3 text-right text-sky-400 font-bold">Total Length</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {filteredItems.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Tag & Type */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm border border-white/50"
                            style={{ backgroundColor: c.color }}
                          />
                          <div>
                            <span className="font-bold text-slate-200 block">{c.tag}</span>
                            <span className="text-[10px] text-slate-400 font-sans">{c.label}</span>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-2 px-3 font-sans">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="truncate max-w-[140px] text-slate-200 font-medium" title={c.fromEquipment}>
                            {c.fromEquipment}
                          </span>
                          <ArrowRight className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-slate-200 font-medium" title={c.toEquipment}>
                            {c.toEquipment}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono block mt-0.5 truncate max-w-[260px]">
                          {c.specs}
                        </span>
                      </td>

                      {/* 2D Run */}
                      <td className="py-2 px-3 text-right text-slate-300">
                        {c.horizontalM.toFixed(2)}m
                      </td>

                      {/* Vert Drop */}
                      <td className="py-2 px-3 text-right text-amber-300">
                        +{c.verticalDropM.toFixed(1)}m
                      </td>

                      {/* Slack */}
                      <td className="py-2 px-3 text-right text-emerald-300">
                        +{c.slackM.toFixed(2)}m ({c.slackPct}%)
                      </td>

                      {/* Total Length */}
                      <td className="py-2 px-3 text-right font-bold text-sky-300">
                        <div className="text-xs">{c.totalLengthM.toFixed(2)}m</div>
                        <div className="text-[9px] text-slate-400 font-normal">
                          ({c.totalLengthFt.toFixed(1)}ft)
                        </div>
                      </td>

                      {/* Action: Locate */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleLocateCable(c.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 text-[10px] font-sans font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Locate & Select on Canvas"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Locate</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Scale Calibration: 1m = {settings.scaleFactor}px</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">
              Live Real-Time Calculations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
