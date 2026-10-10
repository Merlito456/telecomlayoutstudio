/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all cursor-pointer"
        title="Install Telecom Site Layout Studio for Offline Access"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install Offline App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-all cursor-pointer"
          title="Install on iOS"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-sky-600 hover:bg-sky-500 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
