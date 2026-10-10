/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 text-xs font-medium text-emerald-200 shadow-xl backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
      <span>Offline Mode — All layout drawings &amp; changes saved locally.</span>
    </div>
  );
};
