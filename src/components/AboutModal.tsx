/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Radio } from 'lucide-react';
import { AboutOverviewTab } from './about/AboutOverviewTab';
import { AboutFeaturesTab } from './about/AboutFeaturesTab';
import { AboutAdvantagesTab } from './about/AboutAdvantagesTab';
import { AboutDeveloperTab } from './about/AboutDeveloperTab';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'advantages' | 'developer'>('overview');

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rabanes.johncarlo4@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with Developer Badge */}
        <header className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Telecom Site Layout Studio
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  v2.8 Enterprise CAD
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Engineering Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Precision 2D Drafting, Layer Stack &amp; Real-Time 3D Digital Twin with Continuous Cabling &amp; LTC Glands
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-900/60 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; Mission
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Key Capabilities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advantages')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'advantages'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Advantages Over Traditional
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'developer'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lead Engineer &amp; Contact
          </button>
        </div>

        {/* Body Content */}
        <div
          data-scrollable="true"
          className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-6 space-y-6 text-sm text-slate-300"
        >
          {activeTab === 'overview' && <AboutOverviewTab />}
          {activeTab === 'features' && <AboutFeaturesTab />}
          {activeTab === 'advantages' && <AboutAdvantagesTab />}
          {activeTab === 'developer' && (
            <AboutDeveloperTab
              copiedEmail={copiedEmail}
              onCopyEmail={handleCopyEmail}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 Telecom Site Layout Studio</span>
            <span>•</span>
            <span className="text-slate-500">Engr. John Carlo Rabanes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
